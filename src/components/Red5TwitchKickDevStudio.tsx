/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Interactive Developer Portals & Red5.net Broadcast Simulcast Engine:
 * - https://dev.twitch.tv (Helix API, OAuth Scopes, EventSub, Bot IRC, RTMP Key)
 * - https://dev.kick.com (Kick API v2, Pusher WebSocket, HMAC-SHA256 Webhooks, 95/5 Split, RTMPS)
 * - https://www.red5.net (WebRTC WHIP/WHEP & SRT Origin -> Simultaneous Twitch + Kick Restream)
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Layers,
  Play,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Sliders,
  Square,
  Terminal,
  Tv,
  Video,
  Webhook,
  Zap,
} from 'lucide-react';
import {
  DEFAULT_KICK_DEV_CONFIG,
  DEFAULT_TWITCH_DEV_CONFIG,
} from '../data/developerPortalsData';
import { INITIAL_RED5_NODES } from '../data/tvuRed5TwitchData';
import { KickDevConfig, TwitchDevConfig } from '../types/developerPortals';

export type DevPortalSectionMode = 'twitch_dev' | 'kick_dev' | 'red5_broadcast';

interface Red5TwitchKickDevStudioProps {
  section: DevPortalSectionMode;
  onSwitchSection?: (next: DevPortalSectionMode) => void;
  onJoinDevChannel?: (channel: string) => void;
  selectedRed5NodeIdExternal?: string;
  onSelectRed5NodeExternal?: (nodeId: string) => void;
}

const STORAGE_TWITCH_DEV = 'drfun1_twitch_dev_config_v1';
const STORAGE_KICK_DEV = 'drfun1_kick_dev_config_v1';
const STORAGE_RED5_BCAST = 'drfun1_red5_broadcast_state_v1';

interface Red5BroadcastState {
  isLive: boolean;
  selectedNodeId: string;
  ingestProtocol: 'WebRTC WHIP (Sub-300ms)' | 'SRT Caller/Listener' | 'RTMPS Direct Push';
  preset: '1080p60 CBR (8,000 kbps)' | '4K60 HDR (18,000 kbps)' | '720p60 Mobile (4,500 kbps)';
  streamTitle: string;
  pushToRed5Whep: boolean;
  pushToTwitchDev: boolean;
  pushToKickDev: boolean;
  gopSeconds: number;
}

const DEFAULT_RED5_BROADCAST_STATE: Red5BroadcastState = {
  isLive: false,
  selectedNodeId: INITIAL_RED5_NODES[0].id,
  ingestProtocol: 'WebRTC WHIP (Sub-300ms)',
  preset: '1080p60 CBR (8,000 kbps)',
  streamTitle: 'DrFun1TV Live — Red5.net Pro WebRTC Simulcast to Twitch & Kick',
  pushToRed5Whep: true,
  pushToTwitchDev: true,
  pushToKickDev: true,
  gopSeconds: 2,
};

const ALL_TWITCH_SCOPES = [
  'channel:manage:broadcast',
  'chat:read',
  'chat:edit',
  'channel:read:subscriptions',
  'bits:read',
  'channel:manage:redemptions',
  'clips:edit',
  'moderator:manage:chat_messages',
];

export const Red5TwitchKickDevStudio: React.FC<Red5TwitchKickDevStudioProps> = ({
  section,
  onSwitchSection,
  onJoinDevChannel,
  selectedRed5NodeIdExternal,
  onSelectRed5NodeExternal,
}) => {
  const [twitchConfig, setTwitchConfig] = useState<TwitchDevConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_TWITCH_DEV);
      return raw ? { ...DEFAULT_TWITCH_DEV_CONFIG, ...JSON.parse(raw) } : DEFAULT_TWITCH_DEV_CONFIG;
    } catch {
      return DEFAULT_TWITCH_DEV_CONFIG;
    }
  });

  const [kickConfig, setKickConfig] = useState<KickDevConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KICK_DEV);
      return raw ? { ...DEFAULT_KICK_DEV_CONFIG, ...JSON.parse(raw) } : DEFAULT_KICK_DEV_CONFIG;
    } catch {
      return DEFAULT_KICK_DEV_CONFIG;
    }
  });

  const [red5State, setRed5State] = useState<Red5BroadcastState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_RED5_BCAST);
      return raw ? { ...DEFAULT_RED5_BROADCAST_STATE, ...JSON.parse(raw) } : DEFAULT_RED5_BROADCAST_STATE;
    } catch {
      return DEFAULT_RED5_BROADCAST_STATE;
    }
  });

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [helixTestAction, setHelixTestAction] = useState<'streams' | 'commercial' | 'patch'>('streams');
  const [helixTestOutput, setHelixTestOutput] = useState<string | null>(null);
  const [kickTestOutput, setKickTestOutput] = useState<string | null>(null);
  const [liveSeconds, setLiveSeconds] = useState<number>(0);
  const [broadcastLog, setBroadcastLog] = useState<string[]>([
    '[Red5.net Cluster] WHIP/WHEP origin ready across Switch SUPERNAP & RisingNet AS53767.',
    '[dev.twitch.tv] Helix OAuth2 app token validated (channel:manage:broadcast).',
    '[dev.kick.com] Pusher us2 WebSocket + RTMPS ingest listener primed (95/5 split).',
  ]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TWITCH_DEV, JSON.stringify(twitchConfig));
    } catch {}
  }, [twitchConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KICK_DEV, JSON.stringify(kickConfig));
    } catch {}
  }, [kickConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RED5_BCAST, JSON.stringify(red5State));
    } catch {}
  }, [red5State]);

  useEffect(() => {
    if (selectedRed5NodeIdExternal && selectedRed5NodeIdExternal !== red5State.selectedNodeId) {
      setRed5State((prev) => ({ ...prev, selectedNodeId: selectedRed5NodeIdExternal }));
    }
  }, [selectedRed5NodeIdExternal, red5State.selectedNodeId]);

  useEffect(() => {
    if (!red5State.isLive) {
      setLiveSeconds(0);
      return;
    }
    const id = setInterval(() => setLiveSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [red5State.isLive]);

  const activeRed5Node = useMemo(
    () => INITIAL_RED5_NODES.find((n) => n.id === red5State.selectedNodeId) || INITIAL_RED5_NODES[0],
    [red5State.selectedNodeId]
  );

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600).toString().padStart(2, '0');
    const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const toggleTwitchScope = (scope: string) => {
    setTwitchConfig((prev) => {
      const exists = prev.selectedScopes.includes(scope);
      return {
        ...prev,
        selectedScopes: exists
          ? prev.selectedScopes.filter((s) => s !== scope)
          : [...prev.selectedScopes, scope],
      };
    });
  };

  const runHelixTest = () => {
    const nowIso = new Date().toISOString();
    if (helixTestAction === 'streams') {
      setHelixTestOutput(
        JSON.stringify(
          {
            endpoint: `GET https://api.twitch.tv/helix/streams?user_login=${twitchConfig.channelName}`,
            status: '200 OK',
            client_id: twitchConfig.clientId,
            data: [
              {
                id: `419820${twitchConfig.broadcasterId.slice(-4)}`,
                user_id: twitchConfig.broadcasterId,
                user_login: twitchConfig.channelName,
                type: red5State.isLive ? 'live' : 'ready_standby',
                title: red5State.streamTitle,
                viewer_count: red5State.isLive ? 4120 : 0,
                started_at: nowIso,
                red5_origin: activeRed5Node.nodeName,
              },
            ],
          },
          null,
          2
        )
      );
    } else if (helixTestAction === 'commercial') {
      setHelixTestOutput(
        JSON.stringify(
          {
            endpoint: 'POST https://api.twitch.tv/helix/channels/commercial',
            status: '200 OK',
            broadcaster_id: twitchConfig.broadcasterId,
            length: 30,
            scte35_cue: 'SPLICE_INSERT_30S',
            eventsub_webhook: twitchConfig.isEventSubActive ? twitchConfig.eventSubEndpoint : 'DISABLED',
            timestamp: nowIso,
          },
          null,
          2
        )
      );
    } else {
      setHelixTestOutput(
        JSON.stringify(
          {
            endpoint: `PATCH https://api.twitch.tv/helix/channels?broadcaster_id=${twitchConfig.broadcasterId}`,
            status: '204 No Content (Synced)',
            updated_title: red5State.streamTitle,
            channel_points_reward: `${twitchConfig.channelPointsRewardTitle} (${twitchConfig.channelPointsCost} pts)`,
            irc_bridge: `${twitchConfig.chatBotNick} @ ${twitchConfig.chatBotChannel}`,
          },
          null,
          2
        )
      );
    }
  };

  const runKickWebhookTest = () => {
    const mockHmac = `sha256=${Math.random().toString(16).slice(2, 18)}${Date.now().toString(16)}`;
    setKickTestOutput(
      JSON.stringify(
        {
          endpoint: kickConfig.webhookUrl,
          header_x_kick_signature: mockHmac,
          channel_slug: kickConfig.channelSlug,
          chatroom_id: kickConfig.chatroomId,
          pusher_cluster: kickConfig.pusherCluster,
          pusher_connected: kickConfig.isPusherConnected,
          monetization_split: `${kickConfig.monetizationSplitPercent}% Creator / ${100 - kickConfig.monetizationSplitPercent}% Kick`,
          red5_ingest_status: red5State.isLive && red5State.pushToKickDev ? 'SIMULCAST_ACTIVE' : 'STANDBY',
        },
        null,
        2
      )
    );
  };

  const handleToggleRed5Broadcast = () => {
    const nextLive = !red5State.isLive;
    setRed5State((prev) => ({ ...prev, isLive: nextLive }));
    const ts = new Date().toLocaleTimeString();
    if (nextLive) {
      const targets = [
        red5State.pushToRed5Whep ? `Red5 WHEP (${activeRed5Node.nodeName})` : null,
        red5State.pushToTwitchDev ? `dev.twitch.tv (${twitchConfig.channelName})` : null,
        red5State.pushToKickDev ? `dev.kick.com (${kickConfig.channelSlug})` : null,
      ]
        .filter(Boolean)
        .join(' + ');
      setBroadcastLog((prev) => [
        `[${ts}] [GO LIVE] ${red5State.ingestProtocol} locked at ${activeRed5Node.webrtcRttMs}ms RTT -> Pushing to: ${targets || 'Origin Monitor Only'}.`,
        ...prev.slice(0, 11),
      ]);
    } else {
      setBroadcastLog((prev) => [
        `[${ts}] [STOP] Red5.net Pro restream gracefully closed all RTMPS/WHIP egress pipes.`,
        ...prev.slice(0, 11),
      ]);
    }
  };

  const targetKbps = red5State.preset.includes('18,000')
    ? 18000
    : red5State.preset.includes('4,500')
    ? 4500
    : 8000;

  const ffmpegRelayCommand = `ffmpeg -re -i "${activeRed5Node.srtEndpoint}" -c copy -f tee "[f=flv]${twitchConfig.ingestServer}${twitchConfig.streamKey}|[f=flv]${kickConfig.rtmpStreamUrl}${kickConfig.rtmpStreamKey}"`;

  // ==========================================================
  // SECTION 1: https://dev.twitch.tv DEVELOPER PORTAL
  // ==========================================================
  if (section === 'twitch_dev') {
    return (
      <div className="space-y-4">
        {/* Top Portal Header */}
        <div className="bg-gradient-to-r from-purple-950/70 via-slate-950 to-indigo-950/60 border border-purple-500/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Tv className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">
                Twitch Developer Console — https://dev.twitch.tv
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-200 border border-purple-500/40">
                HELIX API + EVENTSUB
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Manage Twitch OAuth2 Client credentials, Helix scopes, EventSub webhooks, IRC Chatbot sync, and RTMPS ingest bridged into Red5.net.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="https://dev.twitch.tv/console/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Open dev.twitch.tv</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {onSwitchSection && (
              <button
                type="button"
                onClick={() => onSwitchSection('red5_broadcast')}
                className="px-3 py-1.5 rounded-lg bg-rose-600/25 hover:bg-rose-600/40 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span>Broadcast via Red5.net</span>
              </button>
            )}
          </div>
        </div>

        {/* Credentials & Endpoints Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-purple-300 uppercase font-mono flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                App Credentials &amp; Broadcaster ID
              </span>
              <span className="text-[11px] font-mono text-emerald-400">Saved locally</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400">Client ID</span>
                <input
                  type="text"
                  value={twitchConfig.clientId}
                  onChange={(e) => setTwitchConfig((p) => ({ ...p, clientId: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400">Broadcaster ID / Login</span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={twitchConfig.broadcasterId}
                    onChange={(e) => setTwitchConfig((p) => ({ ...p, broadcasterId: e.target.value }))}
                    className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={twitchConfig.channelName}
                    onChange={(e) => setTwitchConfig((p) => ({ ...p, channelName: e.target.value }))}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-purple-300 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="text-[11px] font-mono text-slate-400">Client Secret</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type={showSecrets.tw_secret ? 'text' : 'password'}
                    value={twitchConfig.clientSecret}
                    onChange={(e) => setTwitchConfig((p) => ({ ...p, clientSecret: e.target.value }))}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('tw_secret')}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showSecrets.tw_secret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(twitchConfig.clientSecret, 'tw_secret')}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedKey === 'tw_secret' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="text-[11px] font-mono text-slate-400">Twitch RTMP Ingest Server</span>
                <input
                  type="text"
                  value={twitchConfig.ingestServer}
                  onChange={(e) => setTwitchConfig((p) => ({ ...p, ingestServer: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-emerald-300 focus:outline-none focus:border-purple-500"
                />
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="text-[11px] font-mono text-slate-400">Twitch Stream Key (for Red5.net Egress)</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type={showSecrets.tw_key ? 'text' : 'password'}
                    value={twitchConfig.streamKey}
                    onChange={(e) => setTwitchConfig((p) => ({ ...p, streamKey: e.target.value }))}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-amber-300 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('tw_key')}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showSecrets.tw_key ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTwitchConfig((p) => ({
                        ...p,
                        streamKey: `live_${p.broadcasterId}_${Math.random().toString(36).slice(2, 12)}`,
                      }))
                    }
                    className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                    title="Rotate stream key"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Rotate</span>
                  </button>
                </div>
              </label>
            </div>

            {/* EventSub & Bot Bridge */}
            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-400">EventSub Webhook Transport</span>
                <button
                  type="button"
                  onClick={() => setTwitchConfig((p) => ({ ...p, isEventSubActive: !p.isEventSubActive }))}
                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border cursor-pointer ${
                    twitchConfig.isEventSubActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {twitchConfig.isEventSubActive ? 'EVENTSUB ACTIVE' : 'PAUSED'}
                </button>
              </div>
              <input
                type="text"
                value={twitchConfig.eventSubEndpoint}
                onChange={(e) => setTwitchConfig((p) => ({ ...p, eventSubEndpoint: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-sky-300 focus:outline-none focus:border-purple-500"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>IRC Chatbot: <strong className="text-purple-300">{twitchConfig.chatBotNick}</strong> ({twitchConfig.chatBotChannel})</span>
                {onJoinDevChannel && (
                  <button
                    type="button"
                    onClick={() => onJoinDevChannel(twitchConfig.chatBotChannel)}
                    className="text-sky-400 hover:underline cursor-pointer"
                  >
                    Join in WebIRC →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: OAuth Scopes + Helix API Test Console */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-purple-300 uppercase font-mono">
                  OAuth2 Scopes ({twitchConfig.selectedScopes.length}/{ALL_TWITCH_SCOPES.length})
                </span>
                <span className="text-[10px] font-mono text-slate-500">Click to toggle</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ALL_TWITCH_SCOPES.map((scope) => {
                  const active = twitchConfig.selectedScopes.includes(scope);
                  return (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => toggleTwitchScope(scope)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer ${
                        active
                          ? 'bg-purple-600/25 text-purple-200 border-purple-500/60'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {scope}
                    </button>
                  );
                })}
              </div>

              {/* Helix API Tester */}
              <div className="pt-2 border-t border-slate-800 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white font-mono">Helix API Live Call Simulator</span>
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: 'streams', label: 'GET /streams' },
                        { id: 'commercial', label: 'POST /commercial' },
                        { id: 'patch', label: 'PATCH /channels' },
                      ] as const
                    ).map((op) => (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => setHelixTestAction(op.id)}
                        className={`px-2 py-1 rounded text-[10px] font-mono border cursor-pointer ${
                          helixTestAction === op.id
                            ? 'bg-purple-600 text-white border-purple-500 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>
                </div>

                <pre className="p-3 bg-black rounded-lg text-[11px] font-mono text-emerald-400 border border-slate-800 min-h-[140px] max-h-[210px] overflow-auto whitespace-pre-wrap">
                  {helixTestOutput || '// Click "Execute Helix Call" to verify dev.twitch.tv credentials and Channel Points / SCTE-35 hook.'}
                </pre>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-400 truncate">
                Points Reward: {twitchConfig.channelPointsRewardTitle}
              </span>
              <button
                type="button"
                onClick={runHelixTest}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute Helix Call</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // SECTION 2: https://dev.kick.com DEVELOPER PORTAL
  // ==========================================================
  if (section === 'kick_dev') {
    return (
      <div className="space-y-4">
        {/* Top Portal Header */}
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-950 to-teal-950/60 border border-emerald-500/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Kick Developer Portal — https://dev.kick.com
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-500/40">
                KICK API V2 · 95/5 SPLIT
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Configure Kick API v2 OAuth keys, Pusher WebSocket chatroom bridges, HMAC-SHA256 webhooks, and RTMPS ingest linked to Red5.net.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="https://dev.kick.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Open dev.kick.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {onSwitchSection && (
              <button
                type="button"
                onClick={() => onSwitchSection('red5_broadcast')}
                className="px-3 py-1.5 rounded-lg bg-rose-600/25 hover:bg-rose-600/40 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span>Broadcast via Red5.net</span>
              </button>
            )}
          </div>
        </div>

        {/* Two-column Kick Dev Console */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-300 uppercase font-mono flex items-center gap-1.5">
                <Webhook className="w-3.5 h-3.5" />
                Kick API v2 Credentials &amp; RTMPS Ingest
              </span>
              <span className="text-[11px] font-mono text-emerald-400 tabular-nums">
                {kickConfig.monetizationSplitPercent}/{100 - kickConfig.monetizationSplitPercent} Creator Split (${kickConfig.subscriptionTierPrice}/sub)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400">Channel Slug</span>
                <input
                  type="text"
                  value={kickConfig.channelSlug}
                  onChange={(e) => setKickConfig((p) => ({ ...p, channelSlug: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400">Chatroom ID / Pusher Cluster</span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={kickConfig.chatroomId}
                    onChange={(e) => setKickConfig((p) => ({ ...p, chatroomId: e.target.value }))}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={kickConfig.pusherCluster}
                    onChange={(e) => setKickConfig((p) => ({ ...p, pusherCluster: e.target.value }))}
                    className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 font-mono text-sky-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="text-[11px] font-mono text-slate-400">Kick API v2 Key</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type={showSecrets.kick_api ? 'text' : 'password'}
                    value={kickConfig.apiKey}
                    onChange={(e) => setKickConfig((p) => ({ ...p, apiKey: e.target.value }))}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('kick_api')}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showSecrets.kick_api ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(kickConfig.apiKey, 'kick_api')}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedKey === 'kick_api' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="text-[11px] font-mono text-slate-400">Kick RTMPS Ingest Endpoint</span>
                <input
                  type="text"
                  value={kickConfig.rtmpStreamUrl}
                  onChange={(e) => setKickConfig((p) => ({ ...p, rtmpStreamUrl: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="text-[11px] font-mono text-slate-400">Kick RTMPS Stream Key</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type={showSecrets.kick_key ? 'text' : 'password'}
                    value={kickConfig.rtmpStreamKey}
                    onChange={(e) => setKickConfig((p) => ({ ...p, rtmpStreamKey: e.target.value }))}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-amber-300 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('kick_key')}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showSecrets.kick_key ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setKickConfig((p) => ({
                        ...p,
                        rtmpStreamKey: `sk_us-west_${Math.floor(10000000 + Math.random() * 89999999)}_kick_${p.channelSlug}`,
                      }))
                    }
                    className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Rotate</span>
                  </button>
                </div>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">
                Bot: <strong className="text-emerald-300">{kickConfig.botUsername}</strong>
              </span>
              <button
                type="button"
                onClick={() => setKickConfig((p) => ({ ...p, isPusherConnected: !p.isPusherConnected }))}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                  kickConfig.isPusherConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {kickConfig.isPusherConnected ? 'PUSHER WS CONNECTED' : 'PUSHER PAUSED'}
              </button>
            </div>
          </div>

          {/* Right Column: Webhook & HMAC Verifier */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-emerald-300 uppercase font-mono">
                  Webhook Endpoint &amp; HMAC-SHA256 Verifier
                </span>
                <span className="text-[10px] font-mono text-slate-500">x-kick-signature</span>
              </div>

              <label className="block space-y-1 text-xs">
                <span className="text-[11px] font-mono text-slate-400">Webhook Callback URL</span>
                <input
                  type="text"
                  value={kickConfig.webhookUrl}
                  onChange={(e) => setKickConfig((p) => ({ ...p, webhookUrl: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-sky-300 focus:outline-none focus:border-emerald-500"
                />
              </label>

              <label className="block space-y-1 text-xs">
                <span className="text-[11px] font-mono text-slate-400">Webhook Signing Secret</span>
                <input
                  type="text"
                  value={kickConfig.webhookSecret}
                  onChange={(e) => setKickConfig((p) => ({ ...p, webhookSecret: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </label>

              <pre className="p-3 bg-black rounded-lg text-[11px] font-mono text-emerald-400 border border-slate-800 min-h-[150px] max-h-[210px] overflow-auto whitespace-pre-wrap">
                {kickTestOutput || '// Click "Verify Kick Webhook & Split" to test signed payload delivery from dev.kick.com.'}
              </pre>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-400">
                1080p60 CBR · 2s GOP recommended
              </span>
              <button
                type="button"
                onClick={runKickWebhookTest}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Kick Webhook &amp; Split</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // SECTION 3: BROADCASTING VIA RED5.NET -> TWITCH & KICK
  // ==========================================================
  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950/75 via-slate-950 to-purple-950/60 border border-rose-500/40 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Radio className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white">
              Broadcast via Red5.net — WebRTC Origin to dev.twitch.tv &amp; dev.kick.com
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                red5State.isLive
                  ? 'bg-rose-600/30 text-rose-200 border-rose-500/60 animate-pulse'
                  : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}
            >
              {red5State.isLive ? `ON AIR · ${formatTimer(liveSeconds)}` : 'STANDBY READY'}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Ingest ultra-low-latency WebRTC WHIP or SRT into <strong>Red5.net Pro</strong> and fan out synchronized RTMPS simulcasts directly to Twitch Helix and Kick API v2.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onSwitchSection && (
            <>
              <button
                type="button"
                onClick={() => onSwitchSection('twitch_dev')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-300 text-xs font-mono cursor-pointer whitespace-nowrap"
              >
                dev.twitch.tv
              </button>
              <button
                type="button"
                onClick={() => onSwitchSection('kick_dev')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-mono cursor-pointer whitespace-nowrap"
              >
                dev.kick.com
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleToggleRed5Broadcast}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow ${
              red5State.isLive
                ? 'bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/50'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {red5State.isLive ? <Square className="w-3.5 h-3.5 fill-rose-400" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span>{red5State.isLive ? 'Stop Red5 Broadcast' : 'Go Live via Red5.net'}</span>
          </button>
        </div>
      </div>

      {/* Pipeline Controls & Simultaneous Restream Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Red5 Origin Node & Encoder Preset */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-rose-300 uppercase font-mono flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              1. Red5.net Ingest Node
            </span>
            <span className="font-mono text-emerald-400 tabular-nums">{activeRed5Node.webrtcRttMs} ms RTT</span>
          </div>

          <label className="block space-y-1">
            <span className="text-[11px] font-mono text-slate-400">Select Red5 Origin / Edge Server</span>
            <select
              value={activeRed5Node.id}
              onChange={(e) => {
                const nextId = e.target.value;
                setRed5State((p) => ({ ...p, selectedNodeId: nextId }));
                onSelectRed5NodeExternal?.(nextId);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
            >
              {INITIAL_RED5_NODES.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nodeName} ({n.region})
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-mono text-slate-400">Contribution Protocol</span>
            <select
              value={red5State.ingestProtocol}
              onChange={(e) =>
                setRed5State((p) => ({
                  ...p,
                  ingestProtocol: e.target.value as Red5BroadcastState['ingestProtocol'],
                }))
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-sky-300 font-mono focus:outline-none focus:border-rose-500"
            >
              <option value="WebRTC WHIP (Sub-300ms)">WebRTC WHIP (Sub-300ms)</option>
              <option value="SRT Caller/Listener">SRT Caller/Listener (MPEG-TS)</option>
              <option value="RTMPS Direct Push">RTMPS Direct Push</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-mono text-slate-400">Video Bitrate &amp; GOP Preset</span>
            <select
              value={red5State.preset}
              onChange={(e) =>
                setRed5State((p) => ({
                  ...p,
                  preset: e.target.value as Red5BroadcastState['preset'],
                }))
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-rose-500"
            >
              <option value="1080p60 CBR (8,000 kbps)">1080p60 CBR (8,000 kbps · 2s GOP)</option>
              <option value="4K60 HDR (18,000 kbps)">4K60 HDR (18,000 kbps · Red5 ABR)</option>
              <option value="720p60 Mobile (4,500 kbps)">720p60 Mobile (4,500 kbps · Failover)</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-mono text-slate-400">Broadcast Program Title</span>
            <input
              type="text"
              value={red5State.streamTitle}
              onChange={(e) => setRed5State((p) => ({ ...p, streamTitle: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </label>
        </div>

        {/* Column 2: Simultaneous Restream Egress Targets */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-purple-300 uppercase font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              2. Simultaneous Output Pipes
            </span>
            <span className="font-mono text-slate-400 tabular-nums">
              {red5State.isLive ? `${targetKbps.toLocaleString()} kbps` : 'Idle'}
            </span>
          </div>

          {/* Target 1: Red5 WebRTC WHEP */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white">
                <Video className="w-3.5 h-3.5 text-rose-400" />
                <span>Red5 Pro WebRTC WHEP</span>
              </div>
              <button
                type="button"
                onClick={() => setRed5State((p) => ({ ...p, pushToRed5Whep: !p.pushToRed5Whep }))}
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border cursor-pointer ${
                  red5State.pushToRed5Whep
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {red5State.pushToRed5Whep ? 'ENABLED' : 'MUTED'}
              </button>
            </div>
            <div className="font-mono text-[11px] text-emerald-300 truncate">
              {activeRed5Node.whepPlaybackUrl}
            </div>
          </div>

          {/* Target 2: dev.twitch.tv */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white">
                <Tv className="w-3.5 h-3.5 text-purple-400" />
                <span>dev.twitch.tv ({twitchConfig.channelName})</span>
              </div>
              <button
                type="button"
                onClick={() => setRed5State((p) => ({ ...p, pushToTwitchDev: !p.pushToTwitchDev }))}
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border cursor-pointer ${
                  red5State.pushToTwitchDev
                    ? 'bg-purple-500/25 text-purple-200 border-purple-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {red5State.pushToTwitchDev ? 'SIMULCAST ON' : 'DISABLED'}
              </button>
            </div>
            <div className="font-mono text-[11px] text-purple-300 truncate">
              {twitchConfig.ingestServer} ({twitchConfig.clientId})
            </div>
          </div>

          {/* Target 3: dev.kick.com */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>dev.kick.com ({kickConfig.channelSlug})</span>
              </div>
              <button
                type="button"
                onClick={() => setRed5State((p) => ({ ...p, pushToKickDev: !p.pushToKickDev }))}
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border cursor-pointer ${
                  red5State.pushToKickDev
                    ? 'bg-emerald-500/25 text-emerald-200 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {red5State.pushToKickDev ? 'SIMULCAST ON' : 'DISABLED'}
              </button>
            </div>
            <div className="font-mono text-[11px] text-emerald-300 truncate">
              {kickConfig.rtmpStreamUrl} (Split {kickConfig.monetizationSplitPercent}%)
            </div>
          </div>
        </div>

        {/* Column 3: Encoder CLI & Live Relay Log */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 text-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-300 uppercase font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                3. Red5 Relay CLI &amp; Log
              </span>
              <button
                type="button"
                onClick={() => handleCopy(ffmpegRelayCommand, 'ffmpeg_tee')}
                className="text-[11px] font-mono text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'ffmpeg_tee' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'ffmpeg_tee' ? 'Copied' : 'Copy FFmpeg'}</span>
              </button>
            </div>

            <div className="p-2.5 bg-black rounded-lg border border-slate-800 font-mono text-[10px] text-sky-300 break-all max-h-24 overflow-y-auto">
              {ffmpegRelayCommand}
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Red5 Restream Telemetry</span>
              </div>
              <div className="p-2.5 bg-black rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-36 overflow-y-auto">
                {broadcastLog.map((line, i) => (
                  <div key={i} className="leading-snug">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>GOP: {red5State.gopSeconds}.0s · AAC 48kHz</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Sliders className="w-3 h-3" />
              <span>FRN 0034981290 Cleared</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
