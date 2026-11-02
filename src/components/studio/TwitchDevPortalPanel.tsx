/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * dev.twitch.tv Developer Portal & Helix API Integration Panel
 */

import React, { useState } from 'react';
import { TwitchDevConfig } from '../../types/developerPortals';
import { 
  Code2, 
  Key, 
  ExternalLink, 
  Check, 
  Copy, 
  Play, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Radio, 
  Terminal, 
  Layers, 
  Sparkles, 
  Bell, 
  Award,
  Video,
  Eye,
  SlidersHorizontal,
  MessageSquare
} from 'lucide-react';

interface TwitchDevPortalPanelProps {
  config: TwitchDevConfig;
  onUpdateConfig: (newConfig: TwitchDevConfig) => void;
  onTriggerAdBreak: () => void;
}

export const TwitchDevPortalPanel: React.FC<TwitchDevPortalPanelProps> = ({
  config,
  onUpdateConfig,
  onTriggerAdBreak,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'helix_api' | 'eventsub' | 'chatbot_irc' | 'drops_extensions' | 'rtmp_keys'>('helix_api');
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isExecutingApi, setIsExecutingApi] = useState<boolean>(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('get_channel');
  const [eventSubLog, setEventSubLog] = useState<string[]>([
    '[EventSub WebSocket Connected] ws://eventsub.wss.twitch.tv:443/ws - Session ID: s_9841_orbit_mesh',
    '[EventSub Subscription Active] channel.follow (Broadcaster ID: 98412034)',
    '[EventSub Subscription Active] channel.ad_break.begin (Synced to SCTE-35 Master Control)',
    '[EventSub Subscription Active] channel.channel_points_custom_reward_redemption.add',
  ]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const handleExecuteHelixEndpoint = () => {
    setIsExecutingApi(true);
    setApiResponse(null);

    setTimeout(() => {
      setIsExecutingApi(false);
      if (selectedEndpoint === 'get_channel') {
        setApiResponse(JSON.stringify({
          data: [{
            broadcaster_id: config.broadcasterId,
            broadcaster_login: config.channelName,
            broadcaster_name: "DrFun1TV Official",
            game_name: "Science & Technology",
            game_id: "509670",
            title: "DrFun1TV 4K Prime Satellite Playout & LEO Orbit NOC Live",
            delay: 0,
            tags: ["Broadcast", "Satellite", "Space", "Tech", "4K", "WittLawFirm"],
            content_classification_labels: [],
            is_branded_content: false
          }]
        }, null, 2));
      } else if (selectedEndpoint === 'trigger_commercial') {
        onTriggerAdBreak();
        setApiResponse(JSON.stringify({
          data: [{
            length: 30,
            message: "Commercial break triggered successfully across Twitch & DrFun1TV SCTE-35",
            retry_after: 480
          }]
        }, null, 2));
      } else if (selectedEndpoint === 'get_streams') {
        setApiResponse(JSON.stringify({
          data: [{
            id: "stream_991823901",
            user_id: config.broadcasterId,
            user_login: config.channelName,
            user_name: "DrFun1TV",
            game_name: "Science & Technology",
            type: "live",
            title: "Live from Switch SUPERNAP Teleport & Restream.io",
            viewer_count: 3420,
            started_at: new Date(Date.now() - 3600000).toISOString(),
            language: "en",
            thumbnail_url: "https://stream.drfun1.com/thumb/live-{width}x{height}.jpg",
            is_mature: false
          }]
        }, null, 2));
      } else if (selectedEndpoint === 'create_reward') {
        setApiResponse(JSON.stringify({
          data: [{
            broadcaster_id: config.broadcasterId,
            id: "rew_scte35_9901",
            title: config.channelPointsRewardTitle,
            cost: config.channelPointsCost,
            prompt: "Triggers on-screen SCTE-35 commercial break sponsor banner on DrFun1TV",
            is_enabled: true,
            background_color: "#0ea5e9"
          }]
        }, null, 2));
      }
    }, 600);
  };

  const handleTestEventSubDispatch = () => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = `[${timestamp} EVENT RECEIVED] channel.follow -> Viewer "Cyber_Pilot_99" followed channel "${config.channelName}". Lower third alert triggered on DrFun1TV!`;
    setEventSubLog(prev => [newLog, ...prev]);
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Top Banner: dev.twitch.tv Official Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-500/20 text-purple-400 border border-purple-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-purple-400" />
              <span>dev.twitch.tv</span>
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Helix REST API &amp; EventSub v2
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
            <span>Twitch Developer Portal &amp; Broadcast Automation Engine</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Full Twitch API suite: Helix endpoints, EventSub WebSockets, Drops &amp; Extensions, Chatbot IRC bridge, and low-latency ingest keys.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://dev.twitch.tv/console"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-purple-600/20"
          >
            <span>Twitch Developer Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Sub-Tabs for dev.twitch.tv Options */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        {[
          { id: 'helix_api', label: 'Helix REST API Explorer', icon: Code2 },
          { id: 'eventsub', label: 'EventSub Webhooks & WS', icon: Bell },
          { id: 'chatbot_irc', label: 'Chatbot IRCv3 Bridge', icon: MessageSquare },
          { id: 'drops_extensions', label: 'Drops & Extensions', icon: Layers },
          { id: 'rtmp_keys', label: 'Ingest & RTMP Keys', icon: Radio },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: HELIX REST API EXPLORER */}
      {activeSubTab === 'helix_api' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Credentials Card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>Twitch App Credentials</span>
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Client ID</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={config.clientId}
                      onChange={(e) => onUpdateConfig({ ...config, clientId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
                    />
                    <button
                      onClick={() => handleCopy(config.clientId, 'cid')}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                    >
                      {copiedLabel === 'cid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">User OAuth Bearer Token</label>
                  <input
                    type="password"
                    value={config.userOAuthToken}
                    onChange={(e) => onUpdateConfig({ ...config, userOAuthToken: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Broadcaster User ID</label>
                  <input
                    type="text"
                    value={config.broadcasterId}
                    onChange={(e) => onUpdateConfig({ ...config, broadcasterId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Helix Endpoint Selector & Executor */}
            <div className="md:col-span-2 bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span>Helix Interactive Endpoint Tester</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    HTTPS / 2.0 Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { id: 'get_channel', label: 'GET /helix/channels', desc: 'Fetch channel metadata & game title' },
                    { id: 'trigger_commercial', label: 'POST /helix/channels/commercial', desc: 'Trigger 30s ad break on stream' },
                    { id: 'get_streams', label: 'GET /helix/streams', desc: 'Query active live telemetry & viewers' },
                    { id: 'create_reward', label: 'POST /helix/channel_points/custom_rewards', desc: 'Provision Channel Points reward' },
                  ].map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => setSelectedEndpoint(ep.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        selectedEndpoint === ep.id
                          ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-md shadow-purple-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-white text-xs">{ep.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{ep.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Target Endpoint: <strong className="text-white">api.twitch.tv</strong>
                </span>
                <button
                  onClick={handleExecuteHelixEndpoint}
                  disabled={isExecutingApi}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-bold rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                >
                  {isExecutingApi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Execute Helix Request</span>
                </button>
              </div>
            </div>

          </div>

          {/* Response Payload Box */}
          {apiResponse && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>HTTP 200 OK — Helix JSON Response</span>
                </span>
                <button
                  onClick={() => handleCopy(apiResponse, 'resp')}
                  className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
                >
                  {copiedLabel === 'resp' ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>
              <pre className="bg-slate-900/90 p-3 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
                {apiResponse}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: EVENTSUB WEBHOOKS & WEBSOCKETS */}
      {activeSubTab === 'eventsub' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-purple-400" />
                <span>Twitch EventSub Subscription Matrix</span>
              </h4>

              <div className="space-y-2 text-xs font-mono">
                {[
                  { name: 'channel.follow (v2)', status: 'ACTIVE', desc: 'Triggers on-screen lower-third alert' },
                  { name: 'channel.subscribe (v1)', status: 'ACTIVE', desc: 'Triggers VIP subscriber confetti overlay' },
                  { name: 'channel.cheer (v1)', status: 'ACTIVE', desc: 'Bits animation + audio chime' },
                  { name: 'channel.raid (v1)', status: 'ACTIVE', desc: 'Auto-switches Cadjin PGM bus to incoming stream' },
                  { name: 'channel.ad_break.begin (v1)', status: 'ACTIVE', desc: 'Direct sync to SCTE-35 15s commercial break' },
                ].map((ev) => (
                  <div key={ev.name} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">{ev.name}</div>
                      <div className="text-[10px] text-slate-400">{ev.desc}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                      {ev.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    Live EventSub WebSocket Stream Log
                  </h4>
                  <button
                    onClick={handleTestEventSubDispatch}
                    className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded text-[11px] font-mono transition-colors"
                  >
                    Simulate Follow Event
                  </button>
                </div>
                
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1.5 font-mono text-[11px] max-h-64 overflow-y-auto">
                  {eventSubLog.map((log, i) => (
                    <div key={i} className="text-slate-300 leading-relaxed border-b border-slate-800/40 pb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                EventSub endpoint: {config.eventSubEndpoint}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 3: CHATBOT IRCv3 BRIDGE */}
      {activeSubTab === 'chatbot_irc' && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>Twitch Chat to UnrealIRCd irc.drfun1.com Dual-Direction Bridge</span>
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              IRCv3 + Tags Active
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Messages sent in Twitch chat (`#drfun1tv`) are instantly mirrored to the broadcast channel's dedicated UnrealIRCd room, and vice-versa, preserving user badges and roles.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-400 text-[10px] block">TWITCH IRC GATEWAY</span>
              <span className="text-white font-bold">irc.chat.twitch.tv:6697 (SSL)</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-400 text-[10px] block">BOT NICKNAME</span>
              <span className="text-sky-400 font-bold">{config.chatBotNick}</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-400 text-[10px] block">UNREALIRCD SYNC ROOM</span>
              <span className="text-emerald-400 font-bold">#drfun1-primetv</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DROPS & EXTENSIONS */}
      {activeSubTab === 'drops_extensions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Twitch Drops Campaign</span>
            </h4>
            <p className="text-xs text-slate-300">
              Reward DrFun1TV viewers with in-app unlocked items, satellite phone airtime coupons, and custom IRC badge colors for watching broadcast marathons.
            </p>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-emerald-400 font-bold">Active Campaign: "DrFun1 Orbit 2026 Space Marathon"</div>
              <div className="text-slate-400">Time to unlock: 60 Minutes watch time</div>
              <div className="text-sky-300">Reward: DrFun1 Wireless 5GB Satellite NTN Data Voucher</div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Video Overlay Extensions (EBS)</span>
            </h4>
            <p className="text-xs text-slate-300">
              Interactive HTML5 extension overlay running on top of Twitch video player, allowing viewers to see live orbital telemetry, tune FCC stations, and order handsets.
            </p>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-purple-300">
              Extension ID: ext_drfun1_orbit_overlay_v2 (Hosted on Switch SUPERNAP CDN)
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: INGEST & RTMP KEYS */}
      {activeSubTab === 'rtmp_keys' && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>Twitch Ingest Server &amp; Stream Key</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Ingest Server</label>
              <select
                value={config.ingestServer}
                onChange={(e) => onUpdateConfig({ ...config, ingestServer: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs"
              >
                <option value="rtmp://sfo.contribute.live-video.net/app/">US West: San Francisco (sfo)</option>
                <option value="rtmp://iad.contribute.live-video.net/app/">US East: Ashburn (iad)</option>
                <option value="rtmp://fra.contribute.live-video.net/app/">Europe: Frankfurt (fra)</option>
                <option value="rtmp://tyo.contribute.live-video.net/app/">Asia: Tokyo (tyo)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Primary Stream Key</label>
              <input
                type="password"
                value={config.streamKey}
                onChange={(e) => onUpdateConfig({ ...config, streamKey: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
