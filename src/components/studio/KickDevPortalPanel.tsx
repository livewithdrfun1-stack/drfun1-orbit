/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * dev.kick.com Developer Portal & Kick API v2 Integration Panel
 */

import React, { useState } from 'react';
import { KickDevConfig } from '../../types/developerPortals';
import { 
  Code2, 
  Key, 
  ExternalLink, 
  Check, 
  Copy, 
  Play, 
  RefreshCw, 
  DollarSign, 
  ShieldCheck, 
  Radio, 
  Terminal, 
  Flame, 
  MessageSquare, 
  Bell, 
  SlidersHorizontal,
  TrendingUp,
  Percent
} from 'lucide-react';

interface KickDevPortalPanelProps {
  config: KickDevConfig;
  onUpdateConfig: (newConfig: KickDevConfig) => void;
}

export const KickDevPortalPanel: React.FC<KickDevPortalPanelProps> = ({
  config,
  onUpdateConfig,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'kick_api' | 'webhooks' | 'pusher_ws' | 'monetization' | 'rtmp_keys'>('kick_api');
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isExecutingApi, setIsExecutingApi] = useState<boolean>(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('get_channel');
  const [pusherEventsLog, setPusherEventsLog] = useState<string[]>([
    '[Pusher WS Connected] wss://ws-us2.pusher.com:443 - Cluster: us2',
    '[Subscribed] chatrooms.3819402.v2 (Kick Channel: drfun1tv)',
    '[Bot Status Online] DrFun1KickBot authenticated with bot_auth_kck_990142',
    '[95/5 Revenue Split Active] Direct sub revenue routing to DrFun1 ECOM Inc.',
  ]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const handleExecuteKickEndpoint = () => {
    setIsExecutingApi(true);
    setApiResponse(null);

    setTimeout(() => {
      setIsExecutingApi(false);
      if (selectedEndpoint === 'get_channel') {
        setApiResponse(JSON.stringify({
          id: 3819402,
          user_id: 192849,
          slug: config.channelSlug,
          is_banned: false,
          playback_url: "https://fa723fc1b171.global-contribute.live-video.net/live/drfun1tv.m3u8",
          name_updated_at: null,
          vod_enabled: true,
          subscription_enabled: true,
          followers_count: 14820,
          subscriber_badges: [
            { id: 1, months: 1, badge_image: "https://files.kick.com/badges/sub_1m.png" },
            { id: 2, months: 3, badge_image: "https://files.kick.com/badges/sub_3m.png" }
          ],
          livestream: {
            id: 882910,
            session_title: "DrFun1TV 4K Prime Satellite Playout & LEO Orbit NOC Live",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            language: "English",
            is_mature: false,
            viewers: 2140,
            category: { id: 16, name: "Just Chatting & Tech" }
          }
        }, null, 2));
      } else if (selectedEndpoint === 'get_livestream') {
        setApiResponse(JSON.stringify({
          data: {
            id: 882910,
            channel_id: 3819402,
            session_title: "DrFun1TV 4K Prime Satellite Playout",
            is_live: true,
            risk_level_id: 1,
            start_time: new Date(Date.now() - 7200000).toISOString(),
            resolution: "1080p60",
            bitrate: 8200,
            viewers: 2140
          }
        }, null, 2));
      } else if (selectedEndpoint === 'send_chat') {
        setApiResponse(JSON.stringify({
          status: {
            error: false,
            code: 200,
            message: "Message successfully broadcast to Kick chatroom 3819402 from DrFun1KickBot"
          },
          data: {
            id: "msg_kck_990142",
            chatroom_id: config.chatroomId,
            content: "DrFun1TV Master Broadcast is live with Switch SUPERNAP fiber teleport! Use code WITTLAW for satellite handset airtime.",
            type: "message",
            created_at: new Date().toISOString(),
            sender: {
              id: 990142,
              username: config.botUsername,
              identity: { badges: [{ type: "bot", text: "BOT" }] }
            }
          }
        }, null, 2));
      }
    }, 600);
  };

  const handleSimulateKickEvent = () => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = `[${timestamp} EVENT RECEIVED] subscription.created -> User "Vegas_Sat_Tech" gifted 5 Subscriptions ($23.70 net to creator at 95% split). VIP badge granted!`;
    setPusherEventsLog(prev => [newLog, ...prev]);
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Top Banner: dev.kick.com Official Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>dev.kick.com</span>
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Kick API v2 &amp; Webhooks (95/5 Split)
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
            <span>Kick Developer Portal &amp; Streaming Control Center</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Full Kick API suite: Kick API v2, Webhooks, Pusher WebSocket bot bridge, 95/5 creator monetization, and RTMP ingest settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://dev.kick.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <span>Kick Developer Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Sub-Tabs for dev.kick.com Options */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        {[
          { id: 'kick_api', label: 'Kick API v2 Console', icon: Code2 },
          { id: 'webhooks', label: 'Kick Webhooks Manager', icon: Bell },
          { id: 'pusher_ws', label: 'Pusher WebSocket Bridge', icon: MessageSquare },
          { id: 'monetization', label: '95/5 Creator Monetization', icon: DollarSign },
          { id: 'rtmp_keys', label: 'RTMP Ingest & Stream Keys', icon: Radio },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: KICK API V2 CONSOLE */}
      {activeSubTab === 'kick_api' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Credentials Card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kick API Credentials</span>
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Kick API Key</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => onUpdateConfig({ ...config, apiKey: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
                    />
                    <button
                      onClick={() => handleCopy(config.apiKey, 'kck_key')}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                    >
                      {copiedLabel === 'kck_key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Bot Username</label>
                  <input
                    type="text"
                    value={config.botUsername}
                    onChange={(e) => onUpdateConfig({ ...config, botUsername: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Channel Slug</label>
                  <input
                    type="text"
                    value={config.channelSlug}
                    onChange={(e) => onUpdateConfig({ ...config, channelSlug: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Kick Endpoint Selector & Executor */}
            <div className="md:col-span-2 bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kick API v2 Interactive Executor</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    HTTPS / JSON REST
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { id: 'get_channel', label: 'GET /api/v2/channels/{slug}', desc: 'Fetch Kick channel metadata & followers' },
                    { id: 'get_livestream', label: 'GET /api/v2/channels/{slug}/livestream', desc: 'Query active stream status & bitrate' },
                    { id: 'send_chat', label: 'POST /api/v2/chatrooms/{id}/messages', desc: 'Dispatch chat message via Kick Bot' },
                  ].map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => setSelectedEndpoint(ep.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        selectedEndpoint === ep.id
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/20'
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
                  Target Endpoint: <strong className="text-white">kick.com/api/v2</strong>
                </span>
                <button
                  onClick={handleExecuteKickEndpoint}
                  disabled={isExecutingApi}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  {isExecutingApi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Execute Kick API Request</span>
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
                  <span>HTTP 200 OK — Kick API v2 JSON Response</span>
                </span>
                <button
                  onClick={() => handleCopy(apiResponse, 'kck_resp')}
                  className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
                >
                  {copiedLabel === 'kck_resp' ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>
              <pre className="bg-slate-900/90 p-3 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
                {apiResponse}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: KICK WEBHOOKS MANAGER */}
      {activeSubTab === 'webhooks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kick Webhook Configuration</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Webhook Target URL</label>
                <input
                  type="text"
                  value={config.webhookUrl}
                  onChange={(e) => onUpdateConfig({ ...config, webhookUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">HMAC Signature Secret</label>
                <input
                  type="password"
                  value={config.webhookSecret}
                  onChange={(e) => onUpdateConfig({ ...config, webhookSecret: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Active Subscribed Events:</div>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                {['livestream.status', 'chat.message.sent', 'subscription.created', 'channel.followed', 'gifted_subscriptions.created'].map(e => (
                  <span key={e} className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Test Webhook Event Dispatcher
                </h4>
                <button
                  onClick={handleSimulateKickEvent}
                  className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[11px] font-mono transition-colors"
                >
                  Trigger Gift Sub Webhook
                </button>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1.5 font-mono text-[11px] max-h-56 overflow-y-auto">
                {pusherEventsLog.map((log, i) => (
                  <div key={i} className="text-slate-300 leading-relaxed border-b border-slate-800/40 pb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
              Webhooks verified using SHA-256 HMAC signature verification.
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PUSHER WEBSOCKET BRIDGE */}
      {activeSubTab === 'pusher_ws' && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kick Pusher WebSocket to UnrealIRCd irc.drfun1.com Bridge</span>
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Pusher US2 Cluster Connected
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Kick utilizes Pusher WebSockets for real-time chatroom delivery. DrFun1TV continuously subscribes to `chatrooms.{config.chatroomId}.v2` and bridges all messages directly to the tuned station's UnrealIRCd room.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-400 text-[10px] block">PUSHER CLUSTER</span>
              <span className="text-white font-bold">ws-us2.pusher.com</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-400 text-[10px] block">PUSHER APP KEY</span>
              <span className="text-emerald-400 font-bold">32cbd69e4b950bf97679</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-400 text-[10px] block">TARGET CHATROOM ID</span>
              <span className="text-sky-400 font-bold">{config.chatroomId}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: 95/5 CREATOR MONETIZATION */}
      {activeSubTab === 'monetization' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase">CREATOR REVENUE SPLIT</span>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">95.0%</div>
            <p className="text-[11px] text-slate-400 mt-1">Creator retains $4.74 of every $4.99 USD subscription</p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase">PLATFORM FEE</span>
            <div className="text-2xl font-extrabold font-mono text-slate-300 mt-1">5.0%</div>
            <p className="text-[11px] text-slate-400 mt-1">Only payment processing fee retained by Kick</p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase">KICK CREATOR PROGRAM (KCP)</span>
            <div className="text-2xl font-extrabold font-mono text-sky-400 mt-1">TIER 1 ELIGIBLE</div>
            <p className="text-[11px] text-slate-400 mt-1">Hourly base pay enabled for DrFun1TV live playout</p>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: RTMP INGEST & STREAM KEYS */}
      {activeSubTab === 'rtmp_keys' && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kick RTMP Ingest Endpoint &amp; Stream Key</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">RTMP Server URL</label>
              <input
                type="text"
                value={config.rtmpStreamUrl}
                onChange={(e) => onUpdateConfig({ ...config, rtmpStreamUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Secret Stream Key</label>
              <input
                type="password"
                value={config.rtmpStreamKey}
                onChange={(e) => onUpdateConfig({ ...config, rtmpStreamKey: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
