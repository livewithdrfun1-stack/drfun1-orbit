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

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Lock,
  Maximize2,
  Minimize2,
  Send,
  Terminal,
  User,
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
  isOpen: boolean;
  isMinimized: boolean;
  position: 'right' | 'left';
  opacityMode: 'translucent' | 'solid';
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
  const initialChan = session.channel && NEWS_OVERLAY_CHANNELS.includes(session.channel)
    ? session.channel
    : '#drfun1-news';

  const [currentChannel, setCurrentChannel] = useState<string>(initialChan);
  const [userNick, setUserNick] = useState<string>(session.nick || 'RichardAlanWitt');
  const [inputValue, setInputValue] = useState<string>('');
  const [simulatedPing, setSimulatedPing] = useState<number>(1.3);
  const rankDef = getRankDefinition(activeRank);

  const [messages, setMessages] = useState<IrcMessage[]>(() => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    onUpdateSession?.({ channel: nextChan });
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
      if (target && onSelectSource) {
        onSelectSource(target);
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
      pushSystemLine(
        `${target}!${session.ident || 'web'}@switch.drfun1.com · Rank ${rankDef.prefix}${rankDef.shortLabel} (Lvl ${rankDef.accessLevel})`,
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
      `Executed ${rawCmd}. Commands: /nick, /join, /tune <callsign>, /source <satellite|web|local|fiber>, /drop, /reconnect, /stats, /whois, /clear, !breaking`,
      'system'
    );
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

  // Minimized floating dock chip anchored inside the bottom corner of the video player
  if (isMinimized) {
    return (
      <div
        className={`mt-2 md:mt-0 md:absolute md:bottom-14 ${
          position === 'right' ? 'md:right-3' : 'md:left-3'
        } z-20 flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-purple-500/50 shadow-2xl text-[11px] font-mono`}
      >
        <button
          type="button"
          onClick={onToggleMinimized}
          className="flex items-center gap-2 text-left cursor-pointer group"
          title="Expand IRC Client Overlay"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="font-bold text-white group-hover:text-purple-200">{currentChannel}</span>
          <span className="text-slate-400 hidden sm:inline">· {userNick}</span>
          <span className="text-emerald-300 tabular-nums">{messages.length} msgs</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-300" />
        </button>

        <button
          type="button"
          onClick={() => onToggleOpen(false)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          aria-label="Hide IRC overlay"
          title="Hide IRC overlay"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  const surfaceClass =
    opacityMode === 'solid'
      ? 'bg-slate-950/95 border-purple-500/50'
      : 'bg-slate-950/75 border-white/15';

  return (
    <div
      className={`mt-3 md:mt-0 md:absolute md:top-14 md:bottom-14 ${
        position === 'right' ? 'md:right-3' : 'md:left-3'
      } w-full md:w-[335px] lg:w-[360px] h-[250px] md:h-auto z-20 rounded-xl border backdrop-blur-md shadow-2xl flex flex-col overflow-hidden font-mono text-[11px] transition-opacity ${surfaceClass}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Overlay Header */}
      <div className="px-2.5 py-2 bg-slate-900/85 border-b border-slate-800/90 flex items-center justify-between gap-1.5 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="font-bold text-white truncate">IRC Overlay</span>
          <span className="text-[9.5px] text-emerald-300 flex items-center gap-0.5 shrink-0 tabular-nums">
            <Lock className="w-2.5 h-2.5" />
            {simulatedPing}ms
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <select
            aria-label="Select IRC overlay channel"
            value={currentChannel}
            onChange={(e) => handleChannelChange(e.target.value)}
            className="bg-slate-950/90 border border-slate-700 text-emerald-300 rounded px-1.5 py-0.5 text-[10px] font-bold max-w-[105px] cursor-pointer focus:outline-none"
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
            title={`Dock overlay to ${position === 'right' ? 'left' : 'right'} side of video player`}
            aria-label="Switch overlay side"
          >
            <ArrowLeftRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={onToggleOpacity}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            title={opacityMode === 'translucent' ? 'Switch to solid dark backdrop' : 'Switch to translucent video overlay'}
            aria-label="Toggle overlay opacity"
          >
            <Eye className="w-3 h-3" />
          </button>

          {onOpenLoginModal && (
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

          {onNavigateToFullIrc && (
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
            title="Minimize IRC overlay"
            aria-label="Minimize IRC overlay"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onToggleOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-rose-300 hover:bg-slate-800 cursor-pointer"
            title="Hide IRC overlay"
            aria-label="Close IRC overlay"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Command & Session Strip */}
      <div className="px-2.5 py-1 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-2 text-[10px] text-slate-400 shrink-0">
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
        <span className="text-purple-300 font-bold truncate max-w-[95px]">
          {rankDef.prefix}{userNick}
        </span>
      </div>

      {/* Live Scrolling IRC Message Stream */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1.5 select-text">
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

      {/* IRC Chat Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="p-2 bg-slate-900/90 border-t border-slate-800/90 flex items-center gap-1.5 shrink-0"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Chat ${currentChannel} or /tune BBC...`}
          className="flex-1 min-w-0 bg-slate-950/90 border border-slate-700 focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold flex items-center gap-1 cursor-pointer shrink-0"
          aria-label="Send IRC message"
        >
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
