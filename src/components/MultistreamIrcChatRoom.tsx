/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 */

import React, { useState, useEffect, useRef } from 'react';
import { StreamChatMessage } from '../types/stream';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { ANOPE_RANKS } from '../data/ircdAdminData';
import { 
  MessageSquare, 
  Send, 
  Terminal, 
  Radio, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Share2, 
  Volume2, 
  Layers, 
  Flame, 
  Sparkles, 
  Users, 
  Globe, 
  Check, 
  Hash, 
  Sliders, 
  Settings,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Tv,
  Crown,
  AlertTriangle
} from 'lucide-react';

export interface MultistreamIrcChatRoomProps {
  variant?: 'full' | 'docked' | 'overlay';
  activeRank?: AnopeRankLevel;
  onOpenAdminPanel?: () => void;
  onOpenIrcClient?: () => void;
  defaultChannel?: string;
  className?: string;
  onToggleOverlay?: (visible: boolean) => void;
  isOverlayVisible?: boolean;
}

interface CombinedChatMessage extends StreamChatMessage {
  channel?: string;
  ircPrefix?: string;
  ircRole?: string;
}

const DEFAULT_IRC_CHANNELS = [
  { id: '#drfun1-wireless', name: '#drfun1-wireless', topic: 'DrFun1 Wireless Carrier & Factory Unlocked Satellite 5G Handsets NOC', users: 260, modes: '+cnt' },
  { id: '#drfun1-media', name: '#drfun1-media', topic: 'Official DrFun1 Orbit 24/7 BroadCast Stream & TV Relay', users: 182, modes: '+cnt' },
  { id: '#drfun1-tv', name: '#drfun1-tv', topic: 'DrFun1 Media Prime TV Inter-Network Coordination', users: 214, modes: '+cnt' },
  { id: '#drfun1-radio', name: '#drfun1-radio', topic: 'DrFun1 24/7 Orbit Live Radio & DJ Master Feed', users: 156, modes: '+cnt' },
  { id: '#starlink', name: '#starlink', topic: 'Starlink Direct-to-Cell & Starshield LEO Optical Telemetry', users: 342, modes: '+cnt' },
  { id: '#tmobile-direct', name: '#tmobile-direct', topic: 'T-Mobile Direct to Cell & 5G Carrier Uplink Hub', users: 198, modes: '+cnt' },
  { id: '#att-spacemobile', name: '#att-spacemobile', topic: 'AT&T AST SpaceMobile BlueBird Direct Satcom', users: 167, modes: '+cnt' },
  { id: '#switch-supernap', name: '#switch-supernap', topic: 'Switch SUPERNAP 100G Fiber & Core Teleport NOC', users: 289, modes: '+isnt' },
  { id: '#qualcomm-snapdragon', name: '#qualcomm-snapdragon', topic: 'Qualcomm Snapdragon Satellite Modem Baseband NOC', users: 145, modes: '+cnt' },
  { id: '#cablecast-tv', name: '#cablecast-tv', topic: 'Cablecast PEG Community BroadCast Automation', users: 112, modes: '+cnt' },
  { id: '#fubo-sports', name: '#fubo-sports', topic: 'Fubo Sports 4K UHD Inter-Network Stream Coordination', users: 135, modes: '+cnt' },
  { id: '#tvu-broadcast', name: '#tvu-broadcast', topic: 'TVU Networks Grid IP Video Distribution Hub', users: 89, modes: '+cnt' },
  { id: '#whitehouse-briefings', name: '#whitehouse-briefings', topic: 'White House Official Briefings Inter-Network Press Feed', users: 310, modes: '+cnt' },
  { id: '#all-music', name: '#all-music', topic: '24/7 MPD Audio Decks, Death Row Records & Live DJ Feeds', users: 245, modes: '+cnt' },
  { id: '#stream-live', name: '#stream-live', topic: 'Multistream Interactive Studio Audience & Teleport NOC', users: 94, modes: '+nt' },
  { id: '#orbit-ops', name: '#orbit-ops', topic: 'Switch SUPERNAP & RisingNet Satcom Oper Coordination (+s +i)', users: 16, modes: '+isnt' },
];

const INITIAL_IRC_USERS = [
  { nick: 'Richard_Witt', prefix: '~', role: 'NetAdmin / Legal', status: 'active', rank: 'sra' },
  { nick: 'DJ_OrbitNova', prefix: '@', role: 'Station DJ / Ops', status: 'active', rank: 'op' },
  { nick: 'DrFun1Bot', prefix: '+', role: 'MPD Relay Service', status: 'bot', rank: 'voice' },
  { nick: 'NOC_Operator', prefix: '@', role: 'Switch Teleport Lead', status: 'active', rank: 'sop' },
  { nick: 'Vegas_Viewer', prefix: '', role: 'Stream Viewer', status: 'active', rank: 'listener' },
  { nick: 'Cyber_Pilot', prefix: '+', role: 'Space Enthusiast', status: 'active', rank: 'voice' },
  { nick: 'Satcom_Tech', prefix: '', role: 'Downlink Engineer', status: 'active', rank: 'listener' },
];

const INITIAL_COMBINED_MESSAGES: CombinedChatMessage[] = [
  {
    id: 'msg-01',
    sender: 'Richard_Witt',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    platform: 'unreal_irc',
    channel: '#drfun1-media',
    ircPrefix: '~',
    ircRole: 'NetAdmin',
    message: 'Welcome to DrFun1 Multistream Broadcast! Live on irc.drfun1.com:6697 with Switch SUPERNAP Colocation.',
    timestamp: '21:05',
    isModerator: true,
  },
  {
    id: 'msg-02',
    sender: 'TwitchViewer99',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    platform: 'twitch',
    channel: '#drfun1-media',
    message: '1080p 60fps stream is looking razor sharp over the satellite link! 🔥',
    timestamp: '21:06',
  },
  {
    id: 'msg-03',
    sender: 'DJ_OrbitNova',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    platform: 'unreal_irc',
    channel: '#drfun1-media',
    ircPrefix: '@',
    ircRole: 'Channel Operator',
    message: 'DJ Booth live on air! Death Row Records catalog synchronized with Icecast2 mount /live.',
    timestamp: '21:07',
    isModerator: true,
    badge: 'Station DJ',
  },
  {
    id: 'msg-04',
    sender: 'DrFun1Bot',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    platform: 'unreal_irc',
    channel: '#drfun1-media',
    ircPrefix: '+',
    ircRole: 'Voice / Bot',
    message: '[NOW PLAYING] 2Pac feat. Dr. Dre - California Love (Remix) [320 kbps MP3 | Death Row Records]',
    timestamp: '21:08',
  },
  {
    id: 'msg-05',
    sender: 'SpaceObserver',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&auto=format&fit=crop&q=80',
    platform: 'youtube',
    channel: '#drfun1-media',
    message: 'Are those Starlink and Switch colocation stats updating in real-time in the HUD?',
    timestamp: '21:09',
  },
  {
    id: 'msg-06',
    sender: 'Cyber_Pilot',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    platform: 'unreal_irc',
    channel: '#drfun1-media',
    ircPrefix: '+',
    ircRole: 'Voice',
    message: 'Affirmative! RisingNet backbone transit latency is steady at 2.4 ms across the mesh.',
    timestamp: '21:10',
  },
];

export const MultistreamIrcChatRoom: React.FC<MultistreamIrcChatRoomProps> = ({
  variant = 'full',
  activeRank = 'op',
  onOpenAdminPanel,
  onOpenIrcClient,
  defaultChannel = '#drfun1-media',
  className = '',
  onToggleOverlay,
  isOverlayVisible = false,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>(defaultChannel);
  const [messages, setMessages] = useState<CombinedChatMessage[]>(INITIAL_COMBINED_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'irc_only' | 'stream_only'>('all');
  const [showUserList, setShowUserList] = useState<boolean>(false);
  const [broadcastToIrc, setBroadcastToIrc] = useState<boolean>(true);
  const [broadcastToStreams, setBroadcastToStreams] = useState<boolean>(true);
  const [isBotAutoNpActive, setIsBotAutoNpActive] = useState<boolean>(true);
  const [overlayPosition, setOverlayPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentRankDef = ANOPE_RANKS.find(r => r.id === activeRank) || ANOPE_RANKS[0];
  const isOpsAndAbove = currentRankDef.isOpsAndAbove;

  // Active channel details
  const activeChannelObj = DEFAULT_IRC_CHANNELS.find(c => c.id === selectedChannel) || DEFAULT_IRC_CHANNELS[0];

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const trimmed = inputText.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Bot Command Interceptor
    if (trimmed.startsWith('!')) {
      const lower = trimmed.toLowerCase();
      let botResponse = '';
      if (lower === '!np') {
        botResponse = '[DrFun1Bot] 🎵 Now Playing: 2Pac feat. Dr. Dre - California Love (Remix) [MPD Bot 320 kbps MP3 | #deathrow-records]';
      } else if (lower === '!dj') {
        botResponse = `[DrFun1Bot] 🎧 Active Station DJ: DJ Orbit Nova (Live On-Air • /live mount active • Anope Rank: @ Channel Operator)`;
      } else if (lower === '!stream' || lower === '!stats') {
        botResponse = `[DrFun1Bot] 📡 Multistream Status: 6 Endpoints Active (YouTube, Twitch, Kick, FB, X, RTMP) • Bitrate: 4,500 kbps • Latency: 2.1 ms • Transit: RisingNet (www.risingnet.com)`;
      } else if (lower === '!queue') {
        botResponse = `[DrFun1Bot] 📜 Song Queue: #1 Hypnotize (Notorious B.I.G.) | #2 Still D.R.E. (Dr. Dre) | #3 Gin and Juice (Snoop Dogg)`;
      } else {
        botResponse = `[DrFun1Bot] ℹ️ Available Commands: !np, !dj, !stream, !queue, !stats`;
      }

      const userMsg: CombinedChatMessage = {
        id: `msg-${Date.now()}`,
        sender: currentRankDef.name.split(' (')[0],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        platform: 'unreal_irc',
        channel: selectedChannel,
        ircPrefix: currentRankDef.prefix,
        ircRole: currentRankDef.name,
        message: trimmed,
        timestamp: timeNow,
        isModerator: isOpsAndAbove,
      };

      const botReplyMsg: CombinedChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'DrFun1Bot',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        platform: 'unreal_irc',
        channel: selectedChannel,
        ircPrefix: '+',
        ircRole: 'Voice / Bot',
        message: botResponse,
        timestamp: timeNow,
      };

      setMessages(prev => [...prev, userMsg, botReplyMsg]);
      setInputText('');
      return;
    }

    const newMsg: CombinedChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentRankDef.name.split(' (')[0],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      platform: broadcastToIrc && broadcastToStreams ? 'unreal_irc' : broadcastToIrc ? 'unreal_irc' : 'twitch',
      channel: selectedChannel,
      ircPrefix: currentRankDef.prefix,
      ircRole: currentRankDef.name,
      message: trimmed,
      timestamp: timeNow,
      isModerator: isOpsAndAbove,
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  // Filter messages based on filterMode
  const filteredMessages = messages.filter(m => {
    if (filterMode === 'irc_only') return m.platform === 'unreal_irc';
    if (filterMode === 'stream_only') return m.platform !== 'unreal_irc';
    return true;
  });

  // Render on-screen transparent overlay variant (displayed directly over BroadCast video)
  if (variant === 'overlay') {
    return (
      <div className={`pointer-events-none absolute bottom-4 ${overlayPosition === 'bottom-right' ? 'right-4' : 'left-4'} w-80 max-h-72 overflow-hidden z-20 flex flex-col justify-end`}>
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 shadow-2xl flex flex-col pointer-events-auto">
          {/* Overlay Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE IRC ON BROADCAST</span>
            </div>
            <span className="text-slate-400 font-bold">{selectedChannel}</span>
          </div>

          {/* Scrolling messages */}
          <div className="space-y-1.5 overflow-y-auto max-h-48 pr-1 font-mono text-xs">
            {filteredMessages.slice(-6).map(m => (
              <div key={m.id} className="leading-tight animate-fadeIn">
                <span className={`text-[10px] font-bold mr-1 ${
                  m.platform === 'unreal_irc' ? 'text-purple-300' :
                  m.platform === 'twitch' ? 'text-purple-400' :
                  m.platform === 'youtube' ? 'text-red-400' :
                  'text-sky-400'
                }`}>
                  [{m.platform === 'unreal_irc' ? 'IRC' : m.platform.slice(0, 3).toUpperCase()}]
                </span>
                <span className={`font-bold ${m.isModerator ? 'text-amber-300' : 'text-slate-200'}`}>
                  {m.ircPrefix ? `${m.ircPrefix} ` : ''}{m.sender}:
                </span>{' '}
                <span className="text-slate-100">{m.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl ${className}`}>
      
      {/* ========================================================
          CHAT ROOM HEADER: UnrealIRCd Status & Channel Selector
          ======================================================== */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Multistream IRC Chat Room
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                irc.drfun1.com:6697 (TLS)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Combined Feed: IRC Mesh + YouTube + Twitch + Kick + Facebook</span>
              <span className="text-slate-600">•</span>
              <span className="text-purple-300 font-mono">Modes: {activeChannelObj.modes}</span>
            </p>
          </div>
        </div>

        {/* Channel Selector & Oper Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              aria-label="Select IRC Channel"
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="bg-slate-800 text-white font-mono text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-purple-500 cursor-pointer focus:outline-none"
            >
              {DEFAULT_IRC_CHANNELS.map(ch => (
                <option key={ch.id} value={ch.id}>
                  {ch.name} ({ch.users} online)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowUserList(!showUserList)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showUserList
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Channel Nick List"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">{activeChannelObj.users} Users</span>
          </button>

          {onToggleOverlay && (
            <button
              onClick={() => onToggleOverlay(!isOverlayVisible)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isOverlayVisible
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Show live transparent chat overlay on BroadCast video player"
            >
              {isOverlayVisible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden sm:inline">{isOverlayVisible ? 'On BroadCast: ON' : 'Overlay Video'}</span>
            </button>
          )}

          {onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              className="px-2.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Open IRCD UnrealIRCd & Anope Admin Control Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">IRCD Admin</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-purple-500/40 text-purple-200">
                {isOpsAndAbove ? 'Ops+' : 'Lvl ' + currentRankDef.accessLevel}
              </span>
            </button>
          )}

          {onOpenIrcClient && (
            <button
              onClick={onOpenIrcClient}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Switch to Standalone WebIRC Client"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs Bar & Channel Topic */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Combined ({messages.length})
          </button>
          <button
            onClick={() => setFilterMode('irc_only')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
              filterMode === 'irc_only'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            IRC Only ({messages.filter(m => m.platform === 'unreal_irc').length})
          </button>
          <button
            onClick={() => setFilterMode('stream_only')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
              filterMode === 'stream_only'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Stream Chats ({messages.filter(m => m.platform !== 'unreal_irc').length})
          </button>
        </div>

        {/* Channel Topic snippet */}
        <div className="text-[11px] text-slate-400 truncate max-w-md hidden sm:block">
          Topic: <span className="text-slate-300 font-sans">{activeChannelObj.topic}</span>
        </div>
      </div>

      {/* Main Body: Messages Stream & Optional Channel User List */}
      <div className="flex-1 flex overflow-hidden min-h-[300px] max-h-[460px]">
        
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {filteredMessages.map(msg => (
            <div 
              key={msg.id} 
              className={`p-2.5 rounded-xl border transition-all ${
                msg.platform === 'unreal_irc'
                  ? 'bg-purple-950/20 border-purple-500/20'
                  : 'bg-slate-950/40 border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                    msg.platform === 'unreal_irc' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    msg.platform === 'youtube' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    msg.platform === 'twitch' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' :
                    msg.platform === 'facebook' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-slate-700/40 text-slate-300'
                  }`}>
                    {msg.platform === 'unreal_irc' ? 'UnrealIRCd' : msg.platform}
                  </span>

                  <span className="font-bold text-white flex items-center gap-1">
                    {msg.ircPrefix && (
                      <span className={`text-[11px] font-extrabold ${
                        msg.ircPrefix === '~' ? 'text-red-400' :
                        msg.ircPrefix === '@' ? 'text-emerald-400' :
                        msg.ircPrefix === '+' ? 'text-sky-400' : 'text-slate-400'
                      }`}>
                        {msg.ircPrefix}
                      </span>
                    )}
                    {msg.sender}
                  </span>

                  {msg.isModerator && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      MOD
                    </span>
                  )}
                  {msg.badge && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {msg.badge}
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
              </div>

              <div className="text-slate-200 leading-relaxed font-sans pl-1">
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Channel Nick List Drawer */}
        {showUserList && (
          <div className="w-56 bg-slate-950 border-l border-slate-800 p-3 overflow-y-auto space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
              <span>Channel Nicks</span>
              <span>{INITIAL_IRC_USERS.length}</span>
            </div>

            <div className="space-y-1.5">
              {INITIAL_IRC_USERS.map(user => (
                <div key={user.nick} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="truncate">
                    <span className={`font-bold mr-1 ${
                      user.prefix === '~' ? 'text-red-400' :
                      user.prefix === '@' ? 'text-emerald-400' :
                      user.prefix === '+' ? 'text-sky-400' : 'text-slate-500'
                    }`}>
                      {user.prefix || '•'}
                    </span>
                    <span className="text-white font-medium">{user.nick}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 truncate max-w-[70px]">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Bot Commands Cheat Sheet */}
            <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
              <span className="text-purple-300 font-bold block uppercase">Bot Commands:</span>
              <div><code className="text-emerald-400">!np</code> - Now Playing</div>
              <div><code className="text-emerald-400">!dj</code> - Active DJ Info</div>
              <div><code className="text-emerald-400">!stream</code> - Stream Stats</div>
              <div><code className="text-emerald-400">!queue</code> - Track List</div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================
          CHAT INPUT FORM & DUAL-ROUTING TOGGLES
          ======================================================== */}
      <div className="bg-slate-950 border-t border-slate-800 p-3 space-y-2">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <span className="font-mono text-purple-400 font-bold text-xs">{selectedChannel} &gt;</span>
          <input
            type="text"
            placeholder={`Send message to ${selectedChannel} and multistream chat (type !np or !dj for bot)...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-950"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

        {/* Dual Destination Routing Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400 pt-1">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={broadcastToIrc}
                onChange={(e) => setBroadcastToIrc(e.target.checked)}
                className="accent-purple-500 rounded"
              />
              <span>Broadcast to UnrealIRCd ({selectedChannel})</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={broadcastToStreams}
                onChange={(e) => setBroadcastToStreams(e.target.checked)}
                className="accent-purple-500 rounded"
              />
              <span>Multistream Relay (Twitch/YouTube/FB/Kick)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Posting as:</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${currentRankDef.badgeColor}`}>
              {currentRankDef.prefix || '•'} {currentRankDef.name.split(' (')[0]}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
