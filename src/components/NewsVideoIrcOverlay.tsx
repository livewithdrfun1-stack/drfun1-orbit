/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Translucent Live UnrealIRCd Client Overlay docked directly onto the DrFun1 News Video Player.
 * Supports multi-channel switching, slash commands (/nick, /join, /tune, /stats, /whois, /clear),
 * newsroom bot commands (!breaking, !outlet, !feed), opacity/docking controls, and full WebIRC handoff.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Info,
  Lock,
  Maximize2,
  Minimize2,
  Send,
  Terminal,
  User,
  Users,
  X,
} from 'lucide-react';
import { IrcLoginSession, IrcMessage } from '../types/irc';
import {
  GlobalNewsOutlet,
  NewsStreamSourceType,
  StreamConnectionPhase,
  StreamReconnectEvent,
} from '../types/drfun1News';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { getRankDefinition } from '../utils/ircdAccess';

export type IrcOverlayOpacityMode = 'transparent' | 'translucent' | 'solid';

export interface NewsVideoIrcOverlayProps {
  session: IrcLoginSession;
  tunedOutlet: GlobalNewsOutlet;
  activeRank?: AnopeRankLevel;
  activeSourceType?: NewsStreamSourceType;
  activeSourceLabel?: string;
  activeSourceProtocol?: string;
  activeFeedUrl?: string;
  activeMirrorLabel?: string;
  connectionPhase?: StreamConnectionPhase;
  lastReconnectEvent?: StreamReconnectEvent | null;
  overlaySlot?: 'primary' | 'secondary';
  overlayTitle?: string;
  defaultChannel?: string;
  accentTone?: 'purple' | 'cyan';
  isDualActive?: boolean;
  onChangeBoundSource?: (source: NewsStreamSourceType) => void;
  isOpen: boolean;
  isMinimized: boolean;
  position: 'right' | 'left';
  opacityMode: IrcOverlayOpacityMode;
  onToggleOpen: (open: boolean) => void;
  onToggleMinimized: () => void;
  onTogglePosition: () => void;
  onToggleOpacity: () => void;
  onUpdateSession?: (partial: Partial<IrcLoginSession>) => void;
  onOpenLoginModal?: () => void;
  onNavigateToFullIrc?: () => void;
  onTuneByCallSign?: (query: string) => GlobalNewsOutlet | null;
  onSelectSource?: (source: NewsStreamSourceType) => void;
  onSimulateDisconnect?: () => void;
  onManualReconnect?: () => void;
}

const NEWS_OVERLAY_CHANNELS = [
  '#drfun1-news',
  '#drfun1-media',
  '#whitehouse-briefings',
  '#satcom-news',
  '#switch-supernap',
  '#lobby',
];

const OVERLAY_SOURCE_OPTIONS: { id: NewsStreamSourceType; label: string }[] = [
  { id: 'satellite', label: 'SAT' },
  { id: 'web', label: 'WEB' },
  { id: 'local', label: 'LOCAL' },
  { id: 'fiber', label: '100G' },
];

interface OverlayIrcNickEntry {
  nick: string;
  prefix: '~' | '&' | '@' | '%' | '+' | '';
  role: string;
  host: string;
  away?: boolean;
  isSelf?: boolean;
}

const PREFIX_RANK_ORDER: Record<OverlayIrcNickEntry['prefix'], number> = {
  '~': 0,
  '&': 1,
  '@': 2,
  '%': 3,
  '+': 4,
  '': 5,
};

const CHANNEL_BASE_NICKS: Record<string, OverlayIrcNickEntry[]> = {
  '#drfun1-news': [
    { nick: 'Richard_Witt', prefix: '~', role: 'Network Founder', host: 'wittlawfirm.com' },
    { nick: 'DrFun1_NewsBot', prefix: '&', role: 'Broadcast Relay Bot', host: 'bot.drfun1media.com' },
    { nick: 'Switch_NOC', prefix: '@', role: 'SUPERNAP 100G Ops', host: 'noc.switch.drfun1.net' },
    { nick: 'FailoverGuard', prefix: '@', role: 'Mirror Failover Monitor', host: 'guard.drfun1.com' },
    { nick: 'WorldDesk_Prod', prefix: '%', role: 'Senior News Producer', host: 'desk.drfun1media.com' },
    { nick: 'satcom_viewer', prefix: '+', role: 'Voiced Subscriber', host: 'ka-band.drfun1.net' },
    { nick: 'breaking_wire', prefix: '', role: 'Live Wire Reader', host: 'edge02.drfun1.com' },
    { nick: 'global_anchor', prefix: '', role: 'Desk Monitor', host: 'eu-pop.drfun1.com' },
  ],
  '#satcom-news': [
    { nick: 'Richard_Witt', prefix: '~', role: 'Network Founder', host: 'wittlawfirm.com' },
    { nick: 'SatcomRelayBot', prefix: '&', role: 'Orbital Downlink Bot', host: 'tp42.drfun1media.com' },
    { nick: 'RisingNet_Ops', prefix: '@', role: 'Optical Ring Engineer', host: 'rn02.risingnet.net' },
    { nick: 'Goldstone_RX', prefix: '%', role: 'Teleport Operator', host: 'goldstone.drfun1.net' },
    { nick: 'dvb_s2x_lock', prefix: '+', role: 'RF Signal Monitor', host: 'ku-band.drfun1.net' },
    { nick: 'leo_tracker', prefix: '', role: 'Orbital Analyst', host: 'orbit.drfun1.com' },
    { nick: 'rf_telemetry', prefix: '', role: 'Carrier Watcher', host: 'rx07.drfun1.com', away: true },
  ],
  '#drfun1-media': [
    { nick: 'Richard_Witt', prefix: '~', role: 'Network Founder', host: 'wittlawfirm.com' },
    { nick: 'DrFun1_NewsBot', prefix: '&', role: 'Media Syndication Bot', host: 'bot.drfun1media.com' },
    { nick: 'MasterControl', prefix: '@', role: 'MCR Operator', host: 'mcr.drfun1media.com' },
    { nick: 'Studio_Ingest', prefix: '%', role: 'Ingest Engineer', host: 'ingest.drfun1.net' },
    { nick: 'red5_edge', prefix: '+', role: 'WHEP Stream Node', host: 'whep.drfun1media.com' },
    { nick: 'media_archivist', prefix: '', role: 'Archive Desk', host: 'vault.drfun1.com' },
  ],
  '#whitehouse-briefings': [
    { nick: 'Richard_Witt', prefix: '~', role: 'Network Founder', host: 'wittlawfirm.com' },
    { nick: 'DC_Pool_Bot', prefix: '&', role: 'Press Pool Feed', host: 'dc-pool.drfun1.com' },
    { nick: 'Capitol_Desk', prefix: '@', role: 'Policy Editor', host: 'dc.drfun1media.com' },
    { nick: 'SCOTUS_Wire', prefix: '%', role: 'Judicial Desk', host: 'court.drfun1.com' },
    { nick: 'press_corps_01', prefix: '+', role: 'Accredited Press', host: 'press.drfun1.com' },
    { nick: 'policy_watch', prefix: '', role: 'Viewer', host: 'us-east.drfun1.com' },
  ],
  '#switch-supernap': [
    { nick: 'Richard_Witt', prefix: '~', role: 'Network Founder', host: 'wittlawfirm.com' },
    { nick: 'Switch_NOC', prefix: '@', role: 'SUPERNAP 8 Core', host: 'noc.switch.drfun1.net' },
    { nick: 'RisingNet_Ops', prefix: '@', role: '100G DWDM Ops', host: 'rn08.risingnet.net' },
    { nick: 'DataPacket_EU', prefix: '%', role: 'London Anycast', host: 'dp07.drfun1.net' },
    { nick: 'bgp_route_mon', prefix: '+', role: 'BGP Telemetry', host: 'asn.drfun1.net' },
    { nick: 'fiber_ring_09', prefix: '', role: 'Optical Observer', host: 'lv.drfun1.net' },
  ],
  '#lobby': [
    { nick: 'Richard_Witt', prefix: '~', role: 'Network Founder', host: 'wittlawfirm.com' },
    { nick: 'ChanServ', prefix: '&', role: 'Anope Services', host: 'services.drfun1.com' },
    { nick: 'DrFun1_NewsBot', prefix: '@', role: 'Newsroom Relay', host: 'bot.drfun1media.com' },
    { nick: 'guest_desk', prefix: '+', role: 'Verified Viewer', host: 'webirc.drfun1.com' },
    { nick: 'world_viewer', prefix: '', role: 'WebIRC User', host: 'edge.drfun1.com' },
  ],
};

export const NewsVideoIrcOverlay: React.FC<NewsVideoIrcOverlayProps> = ({
  session,
  tunedOutlet,
  activeRank = 'sra',
  activeSourceType = 'satellite',
  activeSourceLabel = 'Satellite',
  activeSourceProtocol = 'DVB-S2X Ku/Ka-Band',
  activeFeedUrl,
  activeMirrorLabel = 'Primary',
  connectionPhase = 'connected',
  lastReconnectEvent = null,
  overlaySlot = 'primary',
  overlayTitle,
  defaultChannel,
  accentTone = 'purple',
  isDualActive = false,
  onChangeBoundSource,
  isOpen,
  isMinimized,
  position,
  opacityMode,
  onToggleOpen,
  onToggleMinimized,
  onTogglePosition,
  onToggleOpacity,
  onUpdateSession,
  onOpenLoginModal,
  onNavigateToFullIrc,
  onTuneByCallSign,
  onSelectSource,
  onSimulateDisconnect,
  onManualReconnect,
}) => {
  const initialChan =
    defaultChannel && NEWS_OVERLAY_CHANNELS.includes(defaultChannel)
      ? defaultChannel
      : session.channel && NEWS_OVERLAY_CHANNELS.includes(session.channel)
        ? session.channel
        : overlaySlot === 'secondary'
          ? '#satcom-news'
          : '#drfun1-news';

  const [currentChannel, setCurrentChannel] = useState<string>(initialChan);
  const [userNick, setUserNick] = useState<string>(session.nick || 'RichardAlanWitt');
  const [inputValue, setInputValue] = useState<string>('');
  const [showNickList, setShowNickList] = useState<boolean>(overlaySlot === 'primary');
  const [simulatedPing, setSimulatedPing] = useState<number>(
    overlaySlot === 'secondary' ? 1.6 : 1.3
  );
  const rankDef = getRankDefinition(activeRank);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Build channel-aware, rank-sorted IRC nick list (includes active user + live outlet bureau nick)
  const channelNicks = useMemo<OverlayIrcNickEntry[]>(() => {
    const base = CHANNEL_BASE_NICKS[currentChannel] || CHANNEL_BASE_NICKS['#drfun1-news'];
    const outletNickSlug = tunedOutlet.callSign.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const liveBureauNick: OverlayIrcNickEntry = {
      nick: `${outletNickSlug || 'News'}_Desk`,
      prefix: '+',
      role: `${tunedOutlet.country} Live Bureau`,
      host: `${activeSourceType}.drfun1media.com`,
    };

    const userPrefixRaw = rankDef.prefix || '';
    const userPrefix: OverlayIrcNickEntry['prefix'] =
      userPrefixRaw === '~' ||
      userPrefixRaw === '&' ||
      userPrefixRaw === '@' ||
      userPrefixRaw === '%' ||
      userPrefixRaw === '+'
        ? userPrefixRaw
        : '';

    const selfEntry: OverlayIrcNickEntry = {
      nick: userNick,
      prefix: userPrefix,
      role: `${rankDef.shortLabel} (You)`,
      host: 'switch.drfun1.com',
      isSelf: true,
    };

    const seen = new Set<string>();
    const combined: OverlayIrcNickEntry[] = [];
    for (const entry of [selfEntry, liveBureauNick, ...base]) {
      const key = entry.nick.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      combined.push(entry);
    }

    return combined.sort((a, b) => {
      const rankDiff = PREFIX_RANK_ORDER[a.prefix] - PREFIX_RANK_ORDER[b.prefix];
      if (rankDiff !== 0) return rankDiff;
      if (a.isSelf && !b.isSelf) return -1;
      if (!a.isSelf && b.isSelf) return 1;
      return a.nick.localeCompare(b.nick);
    });
  }, [currentChannel, tunedOutlet.callSign, tunedOutlet.country, activeSourceType, userNick, rankDef.prefix, rankDef.shortLabel]);

  const [messages, setMessages] = useState<IrcMessage[]>(() => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (overlaySlot === 'secondary') {
      return [
        {
          id: 'news-irc2-1',
          timestamp: now,
          sender: 'irc.drfun1.com',
          channel: initialChan,
          content: `Secondary transparent IRC overlay synced · Monitoring ${activeSourceLabel} (${activeSourceProtocol})`,
          type: 'system',
        },
        {
          id: 'news-irc2-2',
          timestamp: now,
          sender: 'SatcomRelayBot',
          channel: initialChan,
          content: `[DUAL CHAT] Side-by-side room ${initialChan} ready for ${tunedOutlet.callSign}. Switch source or channel independently above.`,
          type: 'notice',
        },
        {
          id: 'news-irc2-3',
          timestamp: now,
          sender: '@RisingNet_Ops',
          channel: initialChan,
          content: `Secondary ${activeSourceLabel} carrier locked. Use /source web|satellite|local|fiber or !feed to inspect telemetry.`,
          type: 'message',
        },
      ];
    }
    return [
      {
        id: 'news-irc-1',
        timestamp: now,
        sender: 'irc.drfun1.com',
        channel: initialChan,
        content: `TLS 1.3 connected · 1,034 global nodes synced (500 Switch/Hub · 10 RisingNet)`,
        type: 'system',
      },
      {
        id: 'news-irc-2',
        timestamp: now,
        sender: 'DrFun1_NewsBot',
        channel: initialChan,
        content: `[ON AIR] ${tunedOutlet.callSign} (${tunedOutlet.country}) · ${tunedOutlet.currentProgram}`,
        type: 'notice',
      },
      {
        id: 'news-irc-3',
        timestamp: now,
        sender: '~Richard_Witt',
        channel: initialChan,
        content: `DrFun1 News World Desk live on air. Type /tune BBC or !breaking to inspect feeds.`,
        type: 'message',
      },
      {
        id: 'news-irc-4',
        timestamp: now,
        sender: '@Switch_NOC',
        channel: initialChan,
        content: `100G optical ingest verified on ${tunedOutlet.switchIngestPop}. Zero frame drops.`,
        type: 'message',
      },
    ];
  });

  const lastAnnouncedOutletIdRef = useRef<string>(tunedOutlet.id);
  const lastAnnouncedSourceRef = useRef<NewsStreamSourceType>(activeSourceType);
  const lastAnnouncedReconnectIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync external nick edits from IrcStartupLoginModal
  useEffect(() => {
    if (session.nick && session.nick !== userNick) {
      setUserNick(session.nick);
    }
  }, [session.nick]);

  // Announce outlet switches inside the video player IRC overlay
  useEffect(() => {
    if (lastAnnouncedOutletIdRef.current === tunedOutlet.id) return;
    lastAnnouncedOutletIdRef.current = tunedOutlet.id;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev.slice(-60),
      {
        id: `tune-${Date.now()}`,
        timestamp: now,
        sender: 'DrFun1_NewsBot',
        channel: currentChannel,
        content: `Tuned desk → ${tunedOutlet.callSign} (${tunedOutlet.country} · ${activeSourceLabel}): ${tunedOutlet.headline}`,
        type: 'notice',
      },
    ]);
  }, [tunedOutlet.id, tunedOutlet.callSign, tunedOutlet.country, tunedOutlet.headline, activeSourceLabel, currentChannel]);

  // Announce stream source switches inside the video player IRC overlay
  useEffect(() => {
    if (lastAnnouncedSourceRef.current === activeSourceType) return;
    lastAnnouncedSourceRef.current = activeSourceType;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev.slice(-60),
      {
        id: `src-${Date.now()}`,
        timestamp: now,
        sender: 'DrFun1_NewsBot',
        channel: currentChannel,
        content: `Source switched → ${activeSourceLabel} (${activeSourceProtocol}) for ${tunedOutlet.callSign}`,
        type: 'notice',
      },
    ]);
  }, [activeSourceType, activeSourceLabel, activeSourceProtocol, tunedOutlet.callSign, currentChannel]);

  // Announce auto-reconnection & secondary mirror failover transitions
  useEffect(() => {
    if (!lastReconnectEvent || lastAnnouncedReconnectIdRef.current === lastReconnectEvent.id) return;
    lastAnnouncedReconnectIdRef.current = lastReconnectEvent.id;
    const tag =
      lastReconnectEvent.status === 'switched'
        ? '[MIRROR FAILOVER]'
        : lastReconnectEvent.status === 'restored'
          ? '[PRIMARY RESTORED]'
          : lastReconnectEvent.status === 'reconnecting'
            ? '[AUTO-RECONNECT]'
            : lastReconnectEvent.status === 'exhausted'
              ? '[MIRROR EXHAUSTED]'
              : '[STREAM DROP]';
    setMessages((prev) => [
      ...prev.slice(-60),
      {
        id: `reconn-${lastReconnectEvent.id}`,
        timestamp: lastReconnectEvent.timestamp,
        sender: 'FailoverGuard',
        channel: currentChannel,
        content: `${tag} ${lastReconnectEvent.outletCallSign} (${lastReconnectEvent.sourceLabel}): ${lastReconnectEvent.reason}${
          lastReconnectEvent.toUrl ? ` → ${lastReconnectEvent.toUrl}` : ''
        }`,
        type: 'notice',
      },
    ]);
  }, [lastReconnectEvent, currentChannel]);

  // Subtle jitter ping telemetry
  useEffect(() => {
    const id = window.setInterval(() => {
      setSimulatedPing(+(1.1 + Math.random() * 0.5).toFixed(2));
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  // Scroll feed to bottom on new messages when expanded
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isOpen, isMinimized]);

  if (!isOpen) return null;

  const pushSystemLine = (content: string, type: IrcMessage['type'] = 'system', sender = '***') => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev.slice(-60),
      {
        id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: now,
        sender,
        channel: currentChannel,
        content,
        type,
      },
    ]);
  };

  const handleChannelChange = (nextChan: string) => {
    setCurrentChannel(nextChan);
    if (overlaySlot === 'primary') {
      onUpdateSession?.({ channel: nextChan });
    }
    pushSystemLine(`Joined ${nextChan} (+cnt) on irc.drfun1.com:6697`, 'join');
  };

  const runCommand = (rawCmd: string) => {
    const parts = rawCmd.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    if (cmd === '/nick' && arg) {
      const clean = arg.replace(/\s+/g, '_');
      const prevNick = userNick;
      setUserNick(clean);
      onUpdateSession?.({ nick: clean });
      pushSystemLine(`${prevNick} is now known as ${clean}`, 'mode');
      return;
    }

    if (cmd === '/join' && arg) {
      const target = arg.startsWith('#') ? arg : `#${arg}`;
      handleChannelChange(target);
      return;
    }

    if (cmd === '/tune' && arg) {
      const matched = onTuneByCallSign?.(arg);
      if (matched) {
        pushSystemLine(
          `Video player switched to ${matched.callSign} (${matched.name})`,
          'notice',
          'DrFun1_NewsBot'
        );
      } else {
        pushSystemLine(`No outlet matching "${arg}". Try /tune BBC, REUTERS, CNN, or NHK.`, 'system');
      }
      return;
    }

    if (cmd === '/source' && arg) {
      const normalized = arg.toLowerCase();
      const map: Record<string, NewsStreamSourceType> = {
        sat: 'satellite',
        satellite: 'satellite',
        web: 'web',
        hls: 'web',
        local: 'local',
        ota: 'local',
        fiber: 'fiber',
        '100g': 'fiber',
      };
      const target = map[normalized];
      if (target && (onChangeBoundSource || onSelectSource)) {
        if (onChangeBoundSource) {
          onChangeBoundSource(target);
        } else {
          onSelectSource?.(target);
        }
      } else {
        pushSystemLine('Usage: /source satellite | web | local | fiber', 'system');
      }
      return;
    }

    if (cmd === '/drop') {
      if (onSimulateDisconnect) {
        onSimulateDisconnect();
      } else {
        pushSystemLine('Disconnect test handler is not connected.', 'system');
      }
      return;
    }

    if (cmd === '/reconnect') {
      if (onManualReconnect) {
        onManualReconnect();
      } else {
        pushSystemLine('Reconnect handler is not connected.', 'system');
      }
      return;
    }

    if (cmd === '/clear') {
      setMessages([]);
      return;
    }

    if (cmd === '/stats') {
      pushSystemLine(
        `irc.drfun1.com:6697 · ${simulatedPing} ms RTT · Source: ${activeSourceLabel} (${activeMirrorLabel} · ${connectionPhase}) · Watching ${tunedOutlet.callSign}`,
        'notice',
        'StatServ'
      );
      return;
    }

    if (cmd === '/whois') {
      const target = arg || userNick;
      const matched = channelNicks.find((n) => n.nick.toLowerCase() === target.toLowerCase());
      if (matched && !matched.isSelf) {
        pushSystemLine(
          `${matched.prefix}${matched.nick}!relay@${matched.host} · ${matched.role} in ${currentChannel}${matched.away ? ' [AWAY]' : ''}`,
          'notice',
          'irc.drfun1.com'
        );
      } else {
        pushSystemLine(
          `${target}!${session.ident || 'web'}@switch.drfun1.com · Rank ${rankDef.prefix}${rankDef.shortLabel} (Lvl ${rankDef.accessLevel})`,
          'notice',
          'irc.drfun1.com'
        );
      }
      return;
    }

    if (cmd === '/names') {
      const formatted = channelNicks.map((n) => `${n.prefix}${n.nick}`).join(', ');
      pushSystemLine(
        `${currentChannel} (${channelNicks.length} users): ${formatted}`,
        'notice',
        'irc.drfun1.com'
      );
      return;
    }

    if (cmd === '!breaking' || cmd === '!outlet' || cmd === '!feed') {
      pushSystemLine(
        `[${tunedOutlet.callSign} · ${activeSourceLabel} · ${activeMirrorLabel}] ${tunedOutlet.currentProgram} — ${tunedOutlet.headline} (Feed: ${activeFeedUrl || tunedOutlet.hlsFeedUrl})`,
        'notice',
        'DrFun1_NewsBot'
      );
      return;
    }

    pushSystemLine(
      `Executed ${rawCmd}. Commands: /nick, /join, /names, /tune <callsign>, /source <satellite|web|local|fiber>, /drop, /reconnect, /stats, /whois, /clear, !breaking`,
      'system'
    );
  };

  const handleMentionNick = (nick: string) => {
    setInputValue((prev) => {
      const trimmed = prev.trimStart();
      if (trimmed.toLowerCase().startsWith(`${nick.toLowerCase()}:`)) return prev;
      return `${nick}: ${trimmed}`;
    });
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setInputValue('');

    if (trimmed.startsWith('/') || trimmed.startsWith('!')) {
      runCommand(trimmed);
      return;
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev.slice(-60),
      {
        id: `msg-${Date.now()}`,
        timestamp: now,
        sender: `${rankDef.prefix || ''}${userNick}`,
        channel: currentChannel,
        content: trimmed,
        type: 'message',
      },
    ]);
  };

  const isCyan = accentTone === 'cyan';
  const resolvedTitle =
    overlayTitle || (isDualActive ? (overlaySlot === 'secondary' ? 'IRC #2' : 'IRC #1') : 'IRC Overlay');

  // Minimized floating dock chip anchored inside the bottom corner of the video player
  if (isMinimized) {
    return (
      <div
        className={`mt-2 md:mt-0 md:absolute md:bottom-14 ${
          position === 'right' ? 'md:right-3' : 'md:left-3'
        } z-20 flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border ${
          isCyan ? 'border-cyan-400/50' : 'border-purple-500/50'
        } shadow-2xl text-[11px] font-mono`}
      >
        <button
          type="button"
          onClick={onToggleMinimized}
          className="flex items-center gap-2 text-left cursor-pointer group"
          title={`Expand ${resolvedTitle}`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <Terminal className={`w-3.5 h-3.5 shrink-0 ${isCyan ? 'text-cyan-400' : 'text-purple-400'}`} />
          <span className="font-bold text-white group-hover:text-cyan-200">{currentChannel}</span>
          <span className={`text-[10px] font-bold ${isCyan ? 'text-cyan-300' : 'text-purple-300'}`}>
            {activeSourceLabel}
          </span>
          <span className="text-emerald-300 tabular-nums">{messages.length} msgs</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-300" />
        </button>

        <button
          type="button"
          onClick={() => onToggleOpen(false)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          aria-label={`Hide ${resolvedTitle}`}
          title={`Hide ${resolvedTitle}`}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  const surfaceClass =
    opacityMode === 'solid'
      ? isCyan
        ? 'bg-slate-950/95 border-cyan-500/50'
        : 'bg-slate-950/95 border-purple-500/50'
      : opacityMode === 'transparent'
        ? isCyan
          ? 'bg-slate-950/40 border-cyan-400/35 backdrop-blur-sm'
          : 'bg-slate-950/40 border-purple-400/35 backdrop-blur-sm'
        : isCyan
          ? 'bg-slate-950/72 border-cyan-400/25 backdrop-blur-md'
          : 'bg-slate-950/75 border-white/15 backdrop-blur-md';

  const headerBgClass =
    opacityMode === 'transparent'
      ? 'bg-slate-950/55 border-white/10'
      : 'bg-slate-900/85 border-slate-800/90';

  const subBarBgClass =
    opacityMode === 'transparent'
      ? 'bg-slate-950/35 border-white/10'
      : 'bg-slate-900/60 border-slate-800/80';

  const inputBarBgClass =
    opacityMode === 'transparent'
      ? 'bg-slate-950/55 border-white/10'
      : 'bg-slate-900/90 border-slate-800/90';

  const widthClass = isDualActive
    ? 'w-full md:w-[46.5%] lg:w-[45.5%]'
    : showNickList
      ? 'w-full md:w-[395px] lg:w-[425px]'
      : 'w-full md:w-[335px] lg:w-[360px]';

  const opacityTooltip =
    opacityMode === 'transparent'
      ? 'Transparent glass (40%) — click for translucent (75%)'
      : opacityMode === 'translucent'
        ? 'Translucent overlay (75%) — click for solid dark (95%)'
        : 'Solid backdrop (95%) — click for transparent glass (40%)';

  return (
    <div
      className={`mt-3 md:mt-0 md:absolute md:top-14 md:bottom-14 ${
        position === 'right' ? 'md:right-3' : 'md:left-3'
      } ${widthClass} h-[250px] md:h-auto z-20 rounded-xl border shadow-2xl flex flex-col overflow-hidden font-mono text-[11px] transition-all ${surfaceClass}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Overlay Header */}
      <div className={`px-2.5 py-2 border-b flex items-center justify-between gap-1.5 shrink-0 ${headerBgClass}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <Terminal className={`w-3.5 h-3.5 shrink-0 ${isCyan ? 'text-cyan-400' : 'text-purple-400'}`} />
          <span className="font-bold text-white truncate">{resolvedTitle}</span>
          {!isDualActive && (
            <span className="text-[9.5px] text-emerald-300 flex items-center gap-0.5 shrink-0 tabular-nums">
              <Lock className="w-2.5 h-2.5" />
              {simulatedPing}ms
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onChangeBoundSource && (
            <select
              aria-label={`Select stream source for ${resolvedTitle}`}
              value={activeSourceType}
              onChange={(e) => onChangeBoundSource(e.target.value as NewsStreamSourceType)}
              className={`bg-slate-950/90 border rounded px-1 py-0.5 text-[10px] font-bold cursor-pointer focus:outline-none ${
                isCyan
                  ? 'border-cyan-500/50 text-cyan-300'
                  : 'border-purple-500/50 text-purple-300'
              }`}
              title="Bind this IRC overlay to a specific streaming source"
            >
              {OVERLAY_SOURCE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          <select
            aria-label={`Select IRC channel for ${resolvedTitle}`}
            value={currentChannel}
            onChange={(e) => handleChannelChange(e.target.value)}
            className="bg-slate-950/90 border border-slate-700 text-emerald-300 rounded px-1.5 py-0.5 text-[10px] font-bold max-w-[100px] cursor-pointer focus:outline-none"
          >
            {NEWS_OVERLAY_CHANNELS.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onTogglePosition}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer hidden md:inline-flex"
            title={
              isDualActive
                ? 'Swap left and right side-by-side IRC overlays'
                : `Dock overlay to ${position === 'right' ? 'left' : 'right'} side of video player`
            }
            aria-label="Switch overlay side"
          >
            <ArrowLeftRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={onToggleOpacity}
            className={`p-1 rounded hover:bg-slate-800 cursor-pointer ${
              opacityMode === 'transparent'
                ? 'text-cyan-300'
                : 'text-slate-400 hover:text-white'
            }`}
            title={opacityTooltip}
            aria-label="Cycle overlay transparency"
          >
            <Eye className="w-3 h-3" />
          </button>

          {onOpenLoginModal && !isDualActive && (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              title={`IRC Login (${userNick})`}
              aria-label="Open IRC login settings"
            >
              <User className="w-3 h-3" />
            </button>
          )}

          {onNavigateToFullIrc && !isDualActive && (
            <button
              type="button"
              onClick={onNavigateToFullIrc}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              title="Open full WebIRC studio"
              aria-label="Open full WebIRC tab"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMinimized}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            title={`Minimize ${resolvedTitle}`}
            aria-label={`Minimize ${resolvedTitle}`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onToggleOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-rose-300 hover:bg-slate-800 cursor-pointer"
            title={`Hide ${resolvedTitle}`}
            aria-label={`Close ${resolvedTitle}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Command & Session Strip */}
      <div className={`px-2.5 py-1 border-b flex items-center justify-between gap-2 text-[10px] text-slate-400 shrink-0 ${subBarBgClass}`}>
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => runCommand('!breaking')}
            className="px-1.5 py-0.5 rounded bg-slate-800/90 hover:bg-slate-700 text-amber-300 cursor-pointer shrink-0"
          >
            !breaking
          </button>
          <button
            type="button"
            onClick={() => runCommand('/stats')}
            className="px-1.5 py-0.5 rounded bg-slate-800/90 hover:bg-slate-700 text-cyan-300 cursor-pointer shrink-0"
          >
            /stats
          </button>
          <button
            type="button"
            onClick={() => runCommand('/whois')}
            className="px-1.5 py-0.5 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 cursor-pointer shrink-0"
          >
            /whois
          </button>
          <button
            type="button"
            onClick={() => runCommand('/clear')}
            className="px-1.5 py-0.5 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-400 cursor-pointer shrink-0"
          >
            /clear
          </button>
        </div>

        <button
          type="button"
          aria-pressed={showNickList}
          onClick={() => setShowNickList((v) => !v)}
          className={`px-1.5 py-0.5 rounded border flex items-center gap-1 font-bold shrink-0 cursor-pointer transition-colors ${
            showNickList
              ? isCyan
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50'
                : 'bg-purple-500/25 text-purple-200 border-purple-400/50'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
          }`}
          title={showNickList ? 'Hide channel IRC nick list' : 'Show channel IRC nick list'}
        >
          <Users className="w-3 h-3 shrink-0" />
          <span className="tabular-nums">{channelNicks.length}</span>
        </button>
      </div>

      {/* Main Chat Area: Live Scrolling IRC Message Stream + Toggleable Nick List Sidebar */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 min-w-0 overflow-y-auto px-2.5 py-2 space-y-1.5 select-text">
          {messages.map((m) => {
            const isMe = m.sender.endsWith(userNick);
            return (
              <div key={m.id} className="leading-snug break-words">
                <span className="text-slate-500 text-[9.5px] mr-1 tabular-nums">[{m.timestamp}]</span>
                {m.type === 'system' ? (
                  <span className="text-purple-300 italic">{m.content}</span>
                ) : m.type === 'notice' ? (
                  <span className="text-amber-300">
                    <strong className="mr-1">[{m.sender}]</strong>
                    {m.content}
                  </span>
                ) : m.type === 'join' ? (
                  <span className="text-emerald-400">{m.content}</span>
                ) : m.type === 'mode' ? (
                  <span className="text-sky-300">{m.content}</span>
                ) : (
                  <>
                    <span
                      className={`font-bold mr-1 ${
                        isMe
                          ? 'text-cyan-300'
                          : m.sender.startsWith('~')
                            ? 'text-red-400'
                            : m.sender.startsWith('@')
                              ? 'text-emerald-400'
                              : 'text-purple-300'
                      }`}
                    >
                      &lt;{m.sender}&gt;
                    </span>
                    <span className="text-slate-100">{m.content}</span>
                  </>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Channel IRC Nick List Sidebar */}
        {showNickList && (
          <aside
            aria-label={`${currentChannel} IRC nick list`}
            className={`w-[118px] sm:w-[130px] shrink-0 border-l flex flex-col overflow-hidden ${
              opacityMode === 'transparent'
                ? 'bg-slate-950/35 border-white/10'
                : 'bg-slate-950/75 border-slate-800/90'
            }`}
          >
            <div className="px-2 py-1 border-b border-slate-800/80 flex items-center justify-between text-[9.5px] text-slate-400 shrink-0">
              <span className="font-bold uppercase tracking-wider text-slate-300">Nicks</span>
              <span className="tabular-nums text-emerald-300 font-bold">{channelNicks.length}</span>
            </div>

            <ul className="flex-1 overflow-y-auto py-1 px-1 space-y-0.5">
              {channelNicks.map((entry) => {
                const prefixColor =
                  entry.prefix === '~'
                    ? 'text-red-400'
                    : entry.prefix === '&'
                      ? 'text-amber-400'
                      : entry.prefix === '@'
                        ? 'text-emerald-400'
                        : entry.prefix === '%'
                          ? 'text-sky-400'
                          : entry.prefix === '+'
                            ? 'text-cyan-300'
                            : 'text-slate-500';
                return (
                  <li
                    key={entry.nick}
                    className="group flex items-center justify-between gap-1 rounded px-1.5 py-0.5 hover:bg-slate-800/75 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleMentionNick(entry.nick)}
                      className="flex items-center gap-1 min-w-0 flex-1 text-left cursor-pointer"
                      title={`${entry.prefix}${entry.nick} — ${entry.role} (click to mention)`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          entry.away ? 'bg-amber-400/70' : 'bg-emerald-400'
                        }`}
                      />
                      <span className="truncate text-[10px]">
                        {entry.prefix && (
                          <span className={`font-bold ${prefixColor}`}>{entry.prefix}</span>
                        )}
                        <span
                          className={
                            entry.isSelf
                              ? 'text-cyan-300 font-bold'
                              : entry.away
                                ? 'text-slate-400'
                                : 'text-slate-200 group-hover:text-white'
                          }
                        >
                          {entry.nick}
                        </span>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => runCommand(`/whois ${entry.nick}`)}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 rounded text-slate-400 hover:text-cyan-300 shrink-0 cursor-pointer transition-opacity"
                      title={`/whois ${entry.nick}`}
                      aria-label={`Whois ${entry.nick}`}
                    >
                      <Info className="w-2.5 h-2.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}
      </div>

      {/* IRC Chat Input Bar */}
      <form
        onSubmit={handleSubmit}
        className={`p-2 border-t flex items-center gap-1.5 shrink-0 ${inputBarBgClass}`}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Chat ${currentChannel} (${activeSourceLabel})...`}
          className={`flex-1 min-w-0 bg-slate-950/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-slate-400 focus:outline-none ${
            isCyan ? 'focus:border-cyan-400' : 'focus:border-purple-500'
          }`}
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className={`px-2.5 py-1.5 rounded-lg disabled:opacity-40 font-bold flex items-center gap-1 cursor-pointer shrink-0 ${
            isCyan
              ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950'
              : 'bg-purple-600 hover:bg-purple-500 text-white'
          }`}
          aria-label="Send IRC message"
        >
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
