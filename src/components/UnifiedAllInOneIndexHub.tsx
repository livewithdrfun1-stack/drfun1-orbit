import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  Twitch,
  Terminal,
  Users,
  Search,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Grid,
  Play,
  Pause,
  Send,
  Radio,
  Wifi,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Settings,
  Flame,
  Activity,
  Heart,
  Share2,
  Smile,
  Zap,
  Globe,
  Clock,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  Bell,
  Cpu
} from 'lucide-react';
import {
  ALL_DRFUN1_MEDIA_CHANNELS,
  INITIAL_IRC_USERS,
  INITIAL_IRC_MESSAGES,
  SWITCH_DEDICATED_NODES,
  UNREAL_HUB_DETAILS,
} from '../data/ircData';
import { IrcUser, IrcMessage, IrcLoginSession } from '../types/irc';
import { DevPlatformWittLawModal } from './DevPlatformWittLawModal';

interface UnifiedAllInOneIndexHubProps {
  ircSession: IrcLoginSession;
  onUpdateSession: (newSession: Partial<IrcLoginSession>) => void;
  onOpenLoginModal: () => void;
  onNavigateToFullIrc?: () => void;
}

// Popular Twitch Emotes
interface TwitchEmote {
  code: string;
  name: string;
  label: string;
  symbol: string;
  bgColor: string;
}

const TWITCH_EMOTES: TwitchEmote[] = [
  { code: 'PogChamp', name: 'PogChamp', label: 'Surprised / Hyped', symbol: '😲', bgColor: 'bg-amber-500/20 text-amber-300' },
  { code: 'Kappa', name: 'Kappa', label: 'Sarcasm / Irony', symbol: '😏', bgColor: 'bg-blue-500/20 text-blue-300' },
  { code: 'LUL', name: 'LUL', label: 'Laughter', symbol: '😂', bgColor: 'bg-emerald-500/20 text-emerald-300' },
  { code: 'MonkaS', name: 'MonkaS', label: 'Nervous / Intense', symbol: '😰', bgColor: 'bg-teal-500/20 text-teal-300' },
  { code: 'BibleThump', name: 'BibleThump', label: 'Crying / Sad', symbol: '😭', bgColor: 'bg-indigo-500/20 text-indigo-300' },
  { code: 'Kreygasm', name: 'Kreygasm', label: 'Pure Satisfaction', symbol: '🤤', bgColor: 'bg-purple-500/20 text-purple-300' },
  { code: 'PeepoHappy', name: 'PeepoHappy', label: 'Joy / wholesome', symbol: '🐸', bgColor: 'bg-green-500/20 text-green-300' },
  { code: 'CoolCat', name: 'CoolCat', label: 'Coolness', symbol: '😎', bgColor: 'bg-cyan-500/20 text-cyan-300' },
  { code: 'ResidentSleeper', name: 'ResidentSleeper', label: 'Boring / Sleep', symbol: '😴', bgColor: 'bg-slate-500/20 text-slate-300' },
  { code: 'VoteYea', name: 'VoteYea', label: 'Thumbs Up', symbol: '👍', bgColor: 'bg-lime-500/20 text-lime-300' },
];

// Fubo.tv Live Sports Channels & Matches
interface FuboMatch {
  id: string;
  channelName: string;
  category: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  timeStatus: string;
  bitrate: string;
  resolution: string;
  broadcastUplink: string;
  accentColor: string;
  odds: string;
  summary: string;
}

const FUBO_MATCHES: FuboMatch[] = [
  {
    id: 'fubo_match_1',
    channelName: 'Fubo Sports 4K Master',
    category: 'Soccer',
    league: 'UEFA Champions League - Quarterfinal',
    homeTeam: 'Manchester City',
    awayTeam: 'Real Madrid',
    score: '2 - 1',
    timeStatus: "76' LIVE",
    bitrate: '18.5 Mbps Direct HEVC',
    resolution: '4K UHD 60fps HDR',
    broadcastUplink: 'Eutelsat 7B Ku-Band Teleport',
    accentColor: 'from-blue-600 to-indigo-700',
    odds: 'MCI -110 | RMD +240',
    summary: 'De Bruyne delivers a curling strike inside the box. High press active.',
  },
  {
    id: 'fubo_match_2',
    channelName: 'Fubo Premier League HD',
    category: 'Soccer',
    league: 'English Premier League',
    homeTeam: 'Arsenal FC',
    awayTeam: 'Liverpool FC',
    score: '1 - 1',
    timeStatus: "64' LIVE",
    bitrate: '14.0 Mbps H.264',
    resolution: '1080p60 Crystal',
    broadcastUplink: 'Astra 28.2E Optical Teleport',
    accentColor: 'from-red-600 to-rose-700',
    odds: 'ARS +140 | LIV +150',
    summary: 'Salah counter-attack equalizes at Emirates Stadium. Match tempo soaring.',
  },
  {
    id: 'fubo_match_3',
    channelName: 'Fubo NBA Prime Arena',
    category: 'Basketball',
    league: 'NBA Western Conference Showdown',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Golden State Warriors',
    score: '108 - 104',
    timeStatus: 'Q4 3:18 LIVE',
    bitrate: '16.0 Mbps HEVC',
    resolution: '1080p60 Ultra',
    broadcastUplink: 'Galaxy 19 C-Band Dedicated Transponder',
    accentColor: 'from-amber-600 to-purple-800',
    odds: 'LAL -3.5 | O/U 228.5',
    summary: 'LeBron drives the paint for a 3-point play. Steph Curry responds with pullup 3.',
  },
  {
    id: 'fubo_match_4',
    channelName: 'Fubo Motorsports 4K',
    category: 'Racing',
    league: 'Formula 1 Grand Prix Qualifier',
    homeTeam: 'Red Bull Racing',
    awayTeam: 'Scuderia Ferrari',
    score: 'P1 (1:28.412)',
    timeStatus: 'Lap 48/56 LIVE',
    bitrate: '22.0 Mbps 4K Direct',
    resolution: '4K UHD 60fps',
    broadcastUplink: 'Switch Las Vegas Optical Ring',
    accentColor: 'from-orange-600 to-red-700',
    odds: 'VER -200 | LEC +350',
    summary: 'Sector 2 speed trap record broken. DRS battle down the main straight.',
  },
];

export const UnifiedAllInOneIndexHub: React.FC<UnifiedAllInOneIndexHubProps> = ({
  ircSession,
  onUpdateSession,
  onOpenLoginModal,
  onNavigateToFullIrc,
}) => {
  // Hub Display Mode
  // 'deck' = All-in-One Multi-Deck (Split Screen)
  // 'fubo' = Fubo.tv Live Sports Arena
  // 'twitch' = Twitch.tv Streamer Deck
  // 'mirc' = mIRC v7.77 Classic Retro Desktop
  const [activeDeckMode, setActiveDeckMode] = useState<'deck' | 'fubo' | 'twitch' | 'mirc'>('deck');

  // Video / Broadcast State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(75);
  const [selectedFuboMatch, setSelectedFuboMatch] = useState<FuboMatch>(FUBO_MATCHES[0]);
  const [isQuadViewActive, setIsQuadViewActive] = useState<boolean>(false);

  // Twitch Stream State
  const [isFollowed, setIsFollowed] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [followerCount, setFollowerCount] = useState<number>(84291);
  const [isEmoteDrawerOpen, setIsEmoteDrawerOpen] = useState<boolean>(false);

  // Nick list & Chat state
  const [activeChannel, setActiveChannel] = useState<string>(ircSession.channel || '#lobby');
  const [activeServer, setActiveServer] = useState<string>(ircSession.serverHost || 'dev.drfun1media.com');
  const [nickFilter, setNickFilter] = useState<string>('');
  const [isNickListCollapsed, setIsNickListCollapsed] = useState<boolean>(false);
  const [selectedUserAction, setSelectedUserAction] = useState<IrcUser | null>(null);
  const [chatInput, setChatInput] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDevPlatformModalOpen, setIsDevPlatformModalOpen] = useState<boolean>(false);

  // Messages per channel
  const [messages, setMessages] = useState<Record<string, IrcMessage[]>>(INITIAL_IRC_MESSAGES);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const mircScrollRef = useRef<HTMLDivElement>(null);

  // Sync state when ircSession changes
  useEffect(() => {
    if (ircSession.channel && ircSession.channel !== activeChannel) {
      setActiveChannel(ircSession.channel);
    }
    if (ircSession.serverHost && ircSession.serverHost !== activeServer) {
      setActiveServer(ircSession.serverHost);
    }
  }, [ircSession.channel, ircSession.serverHost]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
    if (mircScrollRef.current) {
      mircScrollRef.current.scrollTop = mircScrollRef.current.scrollHeight;
    }
  }, [messages, activeChannel, activeDeckMode]);

  // Play audio chime
  const playAudioChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.1); // E6
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  // Get active channel users
  const currentChannelUsers = INITIAL_IRC_USERS.filter((user) =>
    user.channels.includes(activeChannel)
  );

  // Filter users by search
  const filteredUsers = currentChannelUsers.filter((u) =>
    u.nick.toLowerCase().includes(nickFilter.toLowerCase()) ||
    u.role.toLowerCase().includes(nickFilter.toLowerCase()) ||
    u.organization.toLowerCase().includes(nickFilter.toLowerCase())
  );

  // Sort by IRC prefix rank: ~ (owner) > & (admin) > @ (op) > % (halfop) > + (voice) > normal
  const getRankWeight = (prefix: string) => {
    switch (prefix) {
      case '~': return 6;
      case '&': return 5;
      case '@': return 4;
      case '%': return 3;
      case '+': return 2;
      default: return 1;
    }
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => getRankWeight(b.prefix) - getRankWeight(a.prefix));

  // Current channel messages
  const currentMessages = messages[activeChannel] || [
    {
      id: `init_${activeChannel}`,
      timestamp: new Date().toLocaleTimeString(),
      sender: '***',
      channel: activeChannel,
      content: `Joined channel ${activeChannel} on ${activeServer}:6697 (SSL)`,
      type: 'system',
    },
  ];

  // Send message or handle command
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Handle Slash Commands
    if (text.startsWith('/')) {
      const parts = text.slice(1).split(' ');
      const command = parts[0].toLowerCase();
      const args = parts.slice(1).join(' ');

      if (command === 'clear') {
        setMessages((prev) => ({
          ...prev,
          [activeChannel]: [],
        }));
        setChatInput('');
        return;
      }

      if (command === 'nick') {
        const newNick = args.trim() || `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
        onUpdateSession({ nick: newNick });
        const sysMsg: IrcMessage = {
          id: `cmd_${Date.now()}`,
          timestamp: timeStr,
          sender: '***',
          channel: activeChannel,
          content: `You are now known as ${newNick}`,
          type: 'system',
        };
        setMessages((prev) => ({
          ...prev,
          [activeChannel]: [...(prev[activeChannel] || []), sysMsg],
        }));
        setChatInput('');
        return;
      }

      if (command === 'join') {
        let ch = args.trim();
        if (ch && !ch.startsWith('#')) ch = `#${ch}`;
        if (ch) {
          setActiveChannel(ch);
          onUpdateSession({ channel: ch });
          const joinMsg: IrcMessage = {
            id: `join_${Date.now()}`,
            timestamp: timeStr,
            sender: '***',
            channel: ch,
            content: `Now talking on ${ch}`,
            type: 'system',
          };
          setMessages((prev) => ({
            ...prev,
            [ch]: [...(prev[ch] || []), joinMsg],
          }));
          setChatInput('');
          return;
        }
      }

      if (command === 'whois') {
        const targetNick = args.trim();
        const found = INITIAL_IRC_USERS.find((u) => u.nick.toLowerCase() === targetNick.toLowerCase());
        const whoisText = found
          ? `[WHOIS ${found.nick}] Host: ${found.hostmask} | Role: ${found.role} | Org: ${found.organization} | Channels: ${found.channels.join(', ')}`
          : `[WHOIS ${targetNick}] No such nickname registered on ${activeServer}`;
        const sysMsg: IrcMessage = {
          id: `whois_${Date.now()}`,
          timestamp: timeStr,
          sender: '***',
          channel: activeChannel,
          content: whoisText,
          type: 'notice',
        };
        setMessages((prev) => ({
          ...prev,
          [activeChannel]: [...(prev[activeChannel] || []), sysMsg],
        }));
        setChatInput('');
        return;
      }

      if (command === 'stats') {
        const statsMsg: IrcMessage = {
          id: `stats_${Date.now()}`,
          timestamp: timeStr,
          sender: '***',
          channel: activeChannel,
          content: `[STATS UnrealIRCd 6.1.4] Server: ${activeServer}:6697 (SSL) | SID: 007 | 26 Switch SUPERNAP Leaves Synced | 8,838 Global Users | 14 Channels | Transit: RisingNet 100G DWDM (0.00% packet loss)`,
          type: 'notice',
        };
        setMessages((prev) => ({
          ...prev,
          [activeChannel]: [...(prev[activeChannel] || []), statsMsg],
        }));
        setChatInput('');
        return;
      }

      if (command === 'me') {
        const actionMsg: IrcMessage = {
          id: `action_${Date.now()}`,
          timestamp: timeStr,
          sender: '*',
          channel: activeChannel,
          content: `${ircSession.nick} ${args}`,
          type: 'action',
        };
        setMessages((prev) => ({
          ...prev,
          [activeChannel]: [...(prev[activeChannel] || []), actionMsg],
        }));
        setChatInput('');
        return;
      }

      if (command === 'help') {
        const helpMsg: IrcMessage = {
          id: `help_${Date.now()}`,
          timestamp: timeStr,
          sender: '***',
          channel: activeChannel,
          content: `Available Commands: /join <#channel>, /nick <name>, /whois <nick>, /me <action>, /stats, /clear, /topic <text>`,
          type: 'system',
        };
        setMessages((prev) => ({
          ...prev,
          [activeChannel]: [...(prev[activeChannel] || []), helpMsg],
        }));
        setChatInput('');
        return;
      }
    }

    // Standard Chat Message
    const newMsg: IrcMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      timestamp: timeStr,
      sender: ircSession.nick || 'GuestUser',
      channel: activeChannel,
      content: text,
      type: 'message',
    };

    setMessages((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMsg],
    }));

    setChatInput('');
    playAudioChime();
  };

  // Insert Twitch Emote into Chat
  const handleInsertEmote = (emoteCode: string) => {
    setChatInput((prev) => (prev ? `${prev} ${emoteCode} ` : `${emoteCode} `));
    setIsEmoteDrawerOpen(false);
  };

  // Switch channel
  const handleSwitchChannel = (ch: string) => {
    setActiveChannel(ch);
    onUpdateSession({ channel: ch });
  };

  // Switch server
  const handleSwitchServer = (server: string) => {
    setActiveServer(server);
    onUpdateSession({ serverHost: server });
  };

  // Trigger quick whois from nick click
  const handleWhoisNick = (user: IrcUser) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const whoisMsg: IrcMessage = {
      id: `whois_${Date.now()}`,
      timestamp: timeStr,
      sender: '***',
      channel: activeChannel,
      content: `[WHOIS ${user.prefix}${user.nick}] Host: ${user.hostmask} | Role: ${user.role} | Org: ${user.organization} | Channels: ${user.channels.join(', ')}`,
      type: 'notice',
    };
    setMessages((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), whoisMsg],
    }));
    setSelectedUserAction(null);
  };

  // Trigger quick private query
  const handleQueryNick = (user: IrcUser) => {
    setChatInput(`/msg ${user.nick} `);
    setSelectedUserAction(null);
  };

  // Share match update to chat
  const handleShareMatchToChat = (match: FuboMatch) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const matchShareMsg: IrcMessage = {
      id: `fubo_share_${Date.now()}`,
      timestamp: timeStr,
      sender: 'Fubo_Relay_Bot',
      channel: activeChannel,
      content: `[FUBO.TV LIVE RELAY] ${match.league}: ${match.homeTeam} vs ${match.awayTeam} | Score: ${match.score} (${match.timeStatus}) | Feed: ${match.resolution} via ${match.broadcastUplink}`,
      type: 'notice',
    };
    setMessages((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), matchShareMsg],
    }));
  };

  return (
    <div id="drfun1-command-center" className="w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl mb-8 flex flex-col transition-all">
      {/* Top Main Command Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Node Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-sky-500 p-0.5 shadow-lg flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                <span>DrFun1 Media Unified Broadcast &amp; IRCD Command Center</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span>ALL-IN-ONE HUB</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{activeServer}:6697 (SSL)</span>
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-purple-300">SID: 007 (dev.drfun1media.com)</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-sky-400 font-bold">Main Channel: {activeChannel}</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-amber-400">100G RisingNet DWDM</span>
            </div>
          </div>
        </div>

        {/* Center / Right: View Mode Selector & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Deck View Mode Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center space-x-1 text-xs font-semibold">
            <button
              onClick={() => setActiveDeckMode('deck')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeDeckMode === 'deck'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="All-in-One Multi-Deck with Live Player + IRC & Nick List"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Deck</span>
            </button>

            <button
              onClick={() => setActiveDeckMode('fubo')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeDeckMode === 'fubo'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fubo.tv Live Sports Multiplex & Quad-View"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Fubo.tv Sports</span>
            </button>

            <button
              onClick={() => setActiveDeckMode('twitch')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeDeckMode === 'twitch'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Twitch.tv Live Streamer & Emote Hub"
            >
              <Twitch className="w-3.5 h-3.5" />
              <span>Twitch.tv</span>
            </button>

            <button
              onClick={() => setActiveDeckMode('mirc')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeDeckMode === 'mirc'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="mIRC v7.77 Classic Retro Desktop Client"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>mIRC v7.77</span>
            </button>
          </div>

          {/* Quick Channel Dropdown */}
          <div className="relative">
            <select
              value={activeChannel}
              onChange={(e) => handleSwitchChannel(e.target.value)}
              className="bg-slate-900 text-white border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold appearance-none pr-7 cursor-pointer hover:border-purple-500/60 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="#lobby">#lobby (Main Flagship / 8,838)</option>
              <option value="#dev-platform">#dev-platform (API Sandbox / 1,420)</option>
              <option value="#wittlaw-admins">#wittlaw-admins (WittLaw NOC / 65)</option>
              <option value="#drfun1-primetv">#drfun1-primetv (4K Master / 420)</option>
              <option value="#fubo-sports">#fubo-sports (Sports Ingest / 1,150)</option>
              <option value="#c-band-space">#c-band (Space Teleports / 194)</option>
              <option value="#5g-ntn">#5g-ntn (Direct-to-Device / 350)</option>
              <option value="#starlink">#starlink (SpaceX Optical / 845)</option>
              <option value="#tmobile-direct">#tmobile-direct (PCS Band 25 / 920)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Quick Server Switcher Dropdown */}
          <div className="relative">
            <select
              value={activeServer}
              onChange={(e) => handleSwitchServer(e.target.value)}
              className="bg-slate-900 text-emerald-400 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold appearance-none pr-7 cursor-pointer hover:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              title="Select Active IRCd Server Gateway"
            >
              <option value="dev.drfun1media.com">dev.drfun1media.com:6697 (Dev SID 007 - 1.2ms)</option>
              <option value="irc.drfun1.com">irc.drfun1.com:6697 (Master Hub SID 001 - 1.8ms)</option>
              <option value="node1.lasvegas.switch.drfun1.com">node1.lasvegas.switch.drfun1.com (Switch 001)</option>
              <option value="node2.reno.switch.drfun1.com">node2.reno.switch.drfun1.com (Switch 002)</option>
              <option value="node13.sanjose.switch.drfun1.com">node13.sanjose.switch.drfun1.com (Silicon Valley)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* dev.drfun1media.com Developer Platform & WittLaw Admins Button */}
          <button
            onClick={() => setIsDevPlatformModalOpen(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-sky-700 hover:from-purple-600 hover:to-sky-600 text-white font-bold rounded-xl text-xs font-mono flex items-center gap-1.5 transition cursor-pointer shadow-md border border-purple-400/40"
            title="Open dev.drfun1media.com Developer Platform & WittLaw Moderation Board"
          >
            <Cpu className="w-3.5 h-3.5 text-sky-300" />
            <span>Dev Platform (WittLaw)</span>
          </button>

          {/* User Nick & Change Login Button */}
          <button
            onClick={onOpenLoginModal}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
            title="Configure Nick, Ident or SSL Certificate"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-purple-300 font-bold">{ircSession.nick}</span>
            <Sliders className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Main Multi-Deck Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-[580px] bg-slate-950">
        {/* Left Column: Visual Broadcast Theater (Fubo.tv / Twitch / mIRC Display) */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800/80 min-w-0">
          {/* ========================================================= */}
          {/* 1. ALL-IN-ONE MULTI-DECK MODE                             */}
          {/* ========================================================= */}
          {activeDeckMode === 'deck' && (
            <div className="flex-1 flex flex-col">
              {/* Deck Sub-Header with Dual Feeds indicator */}
              <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>FUBO.TV SPORTS FEED &amp; TWITCH STREAM HYBRID</span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Channel {selectedFuboMatch.channelName} &bull; {selectedFuboMatch.resolution}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsQuadViewActive(!isQuadViewActive)}
                    className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition ${
                      isQuadViewActive ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Grid className="w-3 h-3" />
                    <span>{isQuadViewActive ? 'Single Screen' : 'Quad-Screen (4x)'}</span>
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              </div>

              {/* Broadcast Screen Canvas Area */}
              <div className="relative bg-slate-950 aspect-video flex-1 min-h-[300px] max-h-[460px] overflow-hidden flex flex-col justify-center items-center">
                {!isQuadViewActive ? (
                  // Single Screen Feed
                  <div className="relative w-full h-full flex flex-col justify-between p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 select-none">
                    {/* Background Visualizer Simulation */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

                    {/* Top Broadcast Overlay Badges */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          <span>LIVE</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-900/90 text-emerald-300 border border-emerald-500/30 font-mono">
                          {selectedFuboMatch.league}
                        </span>
                        <span className="px-2 py-1 rounded-md text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-500/30">
                          {selectedFuboMatch.timeStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">
                          {selectedFuboMatch.bitrate}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 font-bold">
                          {selectedFuboMatch.resolution}
                        </span>
                      </div>
                    </div>

                    {/* Central Scoreboard / Match Visualizer Graphic */}
                    <div className="relative z-10 my-auto text-center">
                      <div className="inline-block bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center justify-center gap-6">
                          {/* Home Team */}
                          <div className="text-right">
                            <div className="text-sm font-black text-white">{selectedFuboMatch.homeTeam}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Home Club</div>
                          </div>

                          {/* Score Badge */}
                          <div className="px-4 py-2 bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-500/40 rounded-xl shadow-inner font-mono font-black text-2xl text-white tracking-widest">
                            {selectedFuboMatch.score}
                          </div>

                          {/* Away Team */}
                          <div className="text-left">
                            <div className="text-sm font-black text-white">{selectedFuboMatch.awayTeam}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Away Club</div>
                          </div>
                        </div>

                        {/* Match Odds & Telemetry summary */}
                        <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-300 font-sans flex items-center justify-between gap-4">
                          <span className="text-purple-300 font-mono font-semibold">{selectedFuboMatch.odds}</span>
                          <span className="text-slate-400 text-[10px] italic">{selectedFuboMatch.summary}</span>
                          <button
                            onClick={() => handleShareMatchToChat(selectedFuboMatch)}
                            className="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="Relay live match score into #lobby"
                          >
                            <Share2 className="w-2.5 h-2.5" />
                            <span>Relay to #lobby</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status Ticker Overlay */}
                    <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/70 p-2 rounded-lg border border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">&bull; Uplink:</span>
                        <span>{selectedFuboMatch.broadcastUplink}</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-purple-400">Audio: 320 kbps Opus 5.1</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sky-300">Synchronized with #lobby</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Quad-Screen Multi-View (4 simultaneous sports screens)
                  <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1.5 p-2 bg-slate-950">
                    {FUBO_MATCHES.map((match, idx) => (
                      <div
                        key={match.id}
                        onClick={() => {
                          setSelectedFuboMatch(match);
                          setIsQuadViewActive(false);
                        }}
                        className={`relative rounded-xl border p-2.5 flex flex-col justify-between cursor-pointer transition-all hover:border-purple-400 bg-gradient-to-br ${
                          selectedFuboMatch.id === match.id
                            ? 'border-purple-500 bg-purple-950/30'
                            : 'border-slate-800 bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="px-1.5 py-0.5 rounded font-black bg-red-600 text-white">SCR {idx + 1}</span>
                          <span className="font-mono text-emerald-400 font-bold">{match.timeStatus}</span>
                        </div>
                        <div className="text-center my-1">
                          <div className="text-xs font-bold text-white truncate">{match.homeTeam} vs {match.awayTeam}</div>
                          <div className="text-base font-black font-mono text-purple-300 tracking-wider">{match.score}</div>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                          <span>{match.league.split('-')[0]}</span>
                          <span className="text-emerald-400">{match.resolution.split(' ')[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Match Selection Quick-bar */}
              <div className="bg-slate-900 border-t border-slate-800 p-2 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 px-2 font-mono">
                  Live Feeds:
                </span>
                {FUBO_MATCHES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedFuboMatch(m);
                      setIsQuadViewActive(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-2 border cursor-pointer ${
                      selectedFuboMatch.id === m.id
                        ? 'bg-purple-600/30 border-purple-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{m.channelName}</span>
                    <span className="text-[10px] font-mono text-purple-300 font-bold">{m.score}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. FUBO.TV SPORTS ARENA MODE                              */}
          {/* ========================================================= */}
          {activeDeckMode === 'fubo' && (
            <div className="flex-1 flex flex-col bg-slate-950">
              {/* Fubo Brand Banner */}
              <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 px-4 py-2.5 border-b border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 font-black text-xs tracking-wider">
                    FUBO.TV
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xs flex items-center gap-2">
                      <span>Fubo Sports Multiplex &bull; Satellite 4K Ingest Hub</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                        SMPTE 2110 IP
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Integrated Live Scoreboard with direct UnrealIRCd #lobby relay &bull; 0.8s Glass-to-Glass Latency
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsQuadViewActive(!isQuadViewActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isQuadViewActive ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-200 hover:text-white'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>{isQuadViewActive ? 'Exit Quad-View' : 'Quad-Screen 4K'}</span>
                  </button>
                </div>
              </div>

              {/* Fubo Player Canvas */}
              <div className="relative bg-slate-950 aspect-video flex-1 min-h-[320px] max-h-[460px] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded bg-slate-900/90 text-white font-bold text-xs border border-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>{selectedFuboMatch.channelName}</span>
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                    {selectedFuboMatch.resolution} &bull; {selectedFuboMatch.bitrate}
                  </span>
                </div>

                {/* Big Score Hero */}
                <div className="text-center my-auto">
                  <div className="text-sm font-semibold text-emerald-400 uppercase tracking-widest font-mono mb-2">
                    {selectedFuboMatch.league} &bull; {selectedFuboMatch.timeStatus}
                  </div>
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-right">
                      <div className="text-xl font-black text-white">{selectedFuboMatch.homeTeam}</div>
                      <div className="text-xs text-slate-400 font-mono">Home Squad</div>
                    </div>
                    <div className="px-6 py-3 bg-gradient-to-r from-emerald-900 to-teal-900 border border-emerald-500/50 rounded-2xl text-4xl font-mono font-black text-white shadow-2xl tracking-widest">
                      {selectedFuboMatch.score}
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-black text-white">{selectedFuboMatch.awayTeam}</div>
                      <div className="text-xs text-slate-400 font-mono">Away Squad</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mt-4 max-w-lg mx-auto">
                    {selectedFuboMatch.summary}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-xs font-mono text-emerald-300 border border-emerald-800/40">
                      Odds: {selectedFuboMatch.odds}
                    </span>
                    <button
                      onClick={() => handleShareMatchToChat(selectedFuboMatch)}
                      className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Send Score Update to #lobby</span>
                    </button>
                  </div>
                </div>

                {/* Telemetry Footer */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span>Downlink: {selectedFuboMatch.broadcastUplink}</span>
                  <span className="text-emerald-400 font-bold">UnrealIRCd Synchronized Stream</span>
                </div>
              </div>

              {/* Sports Schedule Guide Table */}
              <div className="p-4 bg-slate-900 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fubo.tv Active Satellite Ingest Matrix</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {FUBO_MATCHES.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedFuboMatch(m)}
                      className={`p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                        selectedFuboMatch.id === m.id
                          ? 'border-emerald-500 bg-emerald-950/30'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{m.homeTeam} vs {m.awayTeam}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-600 text-white font-mono">LIVE</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{m.league} &bull; {m.timeStatus}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black font-mono text-emerald-400">{m.score}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{m.resolution.split(' ')[0]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. TWITCH.TV CLONE STREAMER MODE                          */}
          {/* ========================================================= */}
          {activeDeckMode === 'twitch' && (
            <div className="flex-1 flex flex-col bg-slate-950">
              {/* Twitch Streamer Profile Header */}
              <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 px-4 py-3 border-b border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-lg">
                      <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                        <Twitch className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-slate-950 rounded-full" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-extrabold text-sm flex items-center gap-1">
                        <span>DrFun1Media_Live</span>
                        <CheckCircle className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        VERIFIED PARTNER
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium line-clamp-1">
                      Broadcasting 24/7 Satcom Telemetry, Space Lasers &amp; High-BPS Transits &bull; dev.drfun1media.com
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        <span>12,410 Viewers</span>
                      </span>
                      <span>&bull;</span>
                      <span>{followerCount.toLocaleString()} Followers</span>
                      <span>&bull;</span>
                      <span>1,420 Subscribers</span>
                    </div>
                  </div>
                </div>

                {/* Follow & Subscribe Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsFollowed(!isFollowed);
                      setFollowerCount((prev) => (isFollowed ? prev - 1 : prev + 1));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow ${
                      isFollowed
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFollowed ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{isFollowed ? 'Following' : 'Follow'}</span>
                  </button>

                  <button
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow ${
                      isSubscribed
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>{isSubscribed ? 'Subscribed (Tier 3)' : 'Subscribe $4.99'}</span>
                  </button>
                </div>
              </div>

              {/* Twitch Stream Video Canvas */}
              <div className="relative bg-slate-950 aspect-video flex-1 min-h-[300px] max-h-[460px] flex flex-col justify-between p-4 overflow-hidden">
                {/* Overlay Stream Info */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black tracking-wider animate-pulse">
                      LIVE STREAM
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900/90 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
                      Category: Science &amp; Technology / Satcom
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-900/80 text-emerald-400 font-mono text-[10px] font-bold">
                    1080p60 &bull; 6,000 kbps
                  </span>
                </div>

                {/* Animated Stream Visualizer Center */}
                <div className="my-auto text-center z-10">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-1 shadow-2xl animate-bounce">
                    <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                      <Radio className="w-10 h-10 text-purple-400" />
                    </div>
                  </div>
                  <h4 className="text-white font-extrabold text-base mt-4">
                    DrFun1 Media Satellite Uplink Live Feed
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Direct-to-Device 5G NTN &bull; Ka-Band Optical Ground Ingest &bull; Synchronized with #lobby
                  </p>
                </div>

                {/* Stream Tags */}
                <div className="flex flex-wrap items-center gap-1.5 z-10 text-[10px] font-mono">
                  {['Broadcasting', 'Satellite', 'SpaceLaser', 'UnrealIRCd', 'Tech', '4K'].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/40 font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. mIRC v7.77 CLASSIC RETRO DESKTOP CLIENT MODE           */}
          {/* ========================================================= */}
          {activeDeckMode === 'mirc' && (
            <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 font-mono select-none">
              {/* Windows 95 / XP Classic Gray Window Title Bar */}
              <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-950 text-white px-2 py-1 flex items-center justify-between text-xs border-b border-blue-950 shadow">
                <div className="flex items-center gap-1.5 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-yellow-300" />
                  <span>mIRC v7.77 - [{activeChannel} [{activeServer}:6697] [+sntk 100G]]</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="w-4 h-4 bg-slate-700 hover:bg-slate-600 text-[10px] flex items-center justify-center rounded-sm font-bold">_</button>
                  <button className="w-4 h-4 bg-slate-700 hover:bg-slate-600 text-[10px] flex items-center justify-center rounded-sm font-bold">□</button>
                  <button className="w-4 h-4 bg-red-600 hover:bg-red-500 text-[10px] flex items-center justify-center rounded-sm font-bold">✕</button>
                </div>
              </div>

              {/* Classic mIRC Menu Bar */}
              <div className="bg-slate-800 border-b border-slate-700 px-2 py-0.5 flex items-center space-x-3 text-[11px] text-slate-300">
                <span className="hover:bg-slate-700 px-1.5 py-0.5 rounded cursor-pointer">File</span>
                <span className="hover:bg-slate-700 px-1.5 py-0.5 rounded cursor-pointer">View</span>
                <span className="hover:bg-slate-700 px-1.5 py-0.5 rounded cursor-pointer">Favorites</span>
                <span className="hover:bg-slate-700 px-1.5 py-0.5 rounded cursor-pointer">Tools</span>
                <span className="hover:bg-slate-700 px-1.5 py-0.5 rounded cursor-pointer">Commands</span>
                <span className="hover:bg-slate-700 px-1.5 py-0.5 rounded cursor-pointer">Window</span>
                <span className="hover:bg-slate-700 px-1.5 py-0.5 rounded cursor-pointer text-amber-300">Help</span>
              </div>

              {/* Classic mIRC Toolbar (16 icon style buttons) */}
              <div className="bg-slate-850 bg-slate-800/90 border-b border-slate-700/80 px-2 py-1 flex items-center gap-1.5 text-xs overflow-x-auto">
                <button
                  onClick={() => playAudioChime()}
                  className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-yellow-300 font-bold border border-slate-600 rounded flex items-center gap-1 cursor-pointer text-[10px]"
                  title="Connect / Disconnect"
                >
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span>Connect</span>
                </button>
                <button
                  onClick={() => handleSwitchChannel('#lobby')}
                  className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-emerald-300 font-bold border border-slate-600 rounded flex items-center gap-1 cursor-pointer text-[10px]"
                  title="Channel Folder"
                >
                  <span>#lobby</span>
                </button>
                <button
                  onClick={onOpenLoginModal}
                  className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-purple-300 font-bold border border-slate-600 rounded flex items-center gap-1 cursor-pointer text-[10px]"
                  title="Options / Ident"
                >
                  <Settings className="w-3 h-3 text-purple-400" />
                  <span>Options</span>
                </button>
                <div className="h-4 w-px bg-slate-600 mx-1" />
                <span className="text-[10px] text-slate-400">
                  Topic: Official DrFun1 Media Flagship Network Lobby | Fubo.tv &amp; Twitch Relay | dev.drfun1media.com:6697 (SSL)
                </span>
              </div>

              {/* Classic Fixed-Width Terminal View */}
              <div
                ref={mircScrollRef}
                className="flex-1 bg-black text-emerald-400 p-3 overflow-y-auto text-xs font-mono space-y-1 min-h-[340px] max-h-[460px] border-b border-slate-800 select-text"
              >
                <div className="text-yellow-400 font-bold">
                  *** UnrealIRCd 6.1.4: [dev.drfun1media.com:6697 (SSL)] Welcome to the DrFun1 Media Network
                </div>
                <div className="text-slate-400 text-[11px]">
                  *** Your host is dev.drfun1media.com, running version UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2
                </div>
                <div className="text-cyan-400 text-[11px]">
                  *** Channel mode for {activeChannel} is +sntk 100G
                </div>
                {currentMessages.map((msg) => (
                  <div key={msg.id} className="leading-tight">
                    <span className="text-slate-500">[{msg.timestamp}] </span>
                    {msg.type === 'system' && (
                      <span className="text-yellow-400">*** {msg.content}</span>
                    )}
                    {msg.type === 'notice' && (
                      <span className="text-sky-400">-{msg.sender}- {msg.content}</span>
                    )}
                    {msg.type === 'action' && (
                      <span className="text-purple-400">* {msg.content}</span>
                    )}
                    {msg.type === 'message' && (
                      <>
                        <span className="text-emerald-300 font-bold">&lt;{msg.sender}&gt; </span>
                        <span className="text-slate-200">{msg.content}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Classic mIRC Status Line Bar */}
              <div className="bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-700">
                <div className="flex items-center space-x-2">
                  <span>dev.drfun1media.com:6697 (SSL)</span>
                  <span>|</span>
                  <span className="text-emerald-400">Lag: 1.2ms</span>
                  <span>|</span>
                  <span className="text-purple-300">{sortedUsers.length} nicks</span>
                </div>
                <div>UTF-8 &bull; Ident: OK</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Synced IRC Chat & Interactive Nick List */}
        <div className="w-full lg:w-[420px] flex flex-col bg-slate-950 shrink-0">
          {/* Chat Header with Nick List Toggle */}
          <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-white font-mono">{activeChannel}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {sortedUsers.length} Users
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNickListCollapsed(!isNickListCollapsed)}
                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition ${
                  !isNickListCollapsed
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Toggle Nick List Panel"
              >
                <Users className="w-3 h-3" />
                <span>Nicks ({sortedUsers.length})</span>
              </button>
              {onNavigateToFullIrc && (
                <button
                  onClick={onNavigateToFullIrc}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                  title="Expand to Fullscreen IRC Studio"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Chat Log & Optional Nick List Split */}
          <div className="flex-1 flex min-h-[360px] max-h-[460px] overflow-hidden">
            {/* Live Chat Stream Area */}
            <div
              ref={chatScrollRef}
              className="flex-1 p-3 overflow-y-auto space-y-2 text-xs font-mono select-text bg-slate-950/90"
            >
              {currentMessages.map((msg) => (
                <div key={msg.id} className="leading-snug break-words">
                  <span className="text-slate-600 text-[10px] select-none mr-1.5">[{msg.timestamp}]</span>
                  {msg.type === 'system' && (
                    <span className="text-yellow-400/90">
                      <span className="font-bold">*** </span>
                      {msg.content}
                    </span>
                  )}
                  {msg.type === 'notice' && (
                    <span className="text-sky-300 bg-sky-950/40 px-1 py-0.5 rounded border border-sky-800/30">
                      <span className="font-bold">[{msg.sender}] </span>
                      {msg.content}
                    </span>
                  )}
                  {msg.type === 'action' && (
                    <span className="text-purple-300 italic">
                      <span className="font-bold">* </span>
                      {msg.content}
                    </span>
                  )}
                  {msg.type === 'message' && (
                    <span>
                      <strong className="text-purple-400 hover:underline cursor-pointer">
                        {msg.sender}:{' '}
                      </strong>
                      <span className="text-slate-200">{msg.content}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Right-Hand Nick List Panel */}
            {!isNickListCollapsed && (
              <div className="w-44 border-l border-slate-800 bg-slate-900/60 flex flex-col shrink-0">
                {/* Nick Filter Search Input */}
                <div className="p-1.5 border-b border-slate-800">
                  <div className="relative">
                    <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
                    <input
                      type="text"
                      value={nickFilter}
                      onChange={(e) => setNickFilter(e.target.value)}
                      placeholder="Search nicks..."
                      className="w-full bg-slate-950 text-slate-200 text-[10px] pl-6 pr-2 py-1 rounded-md border border-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>

                {/* Nick List Scroll */}
                <div className="flex-1 overflow-y-auto p-1 space-y-0.5 text-[11px] font-mono">
                  {sortedUsers.map((user) => {
                    const isOwner = user.prefix === '~';
                    const isAdmin = user.prefix === '&';
                    const isOp = user.prefix === '@';
                    const isVoice = user.prefix === '+';

                    return (
                      <div
                        key={user.nick}
                        onClick={() => setSelectedUserAction(user)}
                        className="px-2 py-1 rounded hover:bg-slate-800/90 cursor-pointer flex items-center justify-between group transition"
                        title={`${user.role} (${user.organization}) - Click for actions`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {isOwner && <span className="text-amber-400 font-black">~</span>}
                          {isAdmin && <span className="text-rose-400 font-black">&amp;</span>}
                          {isOp && <span className="text-emerald-400 font-black">@</span>}
                          {isVoice && <span className="text-cyan-400 font-bold">+</span>}
                          {!isOwner && !isAdmin && !isOp && !isVoice && (
                            <span className="text-slate-600">&bull;</span>
                          )}
                          <span
                            className={`truncate ${
                              isOwner
                                ? 'text-amber-300 font-bold'
                                : isAdmin
                                ? 'text-rose-300 font-bold'
                                : isOp
                                ? 'text-emerald-300 font-medium'
                                : isVoice
                                ? 'text-cyan-300'
                                : 'text-slate-300'
                            }`}
                          >
                            {user.nick}
                          </span>
                          {(user.organization.includes('Witt') || user.hostmask.includes('wittlawfirm')) && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-bold shrink-0 ml-1">
                              WittLaw
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Action Popover Modal (when clicking a nick) */}
          {selectedUserAction && (
            <div className="bg-slate-900 border-t border-slate-800 p-2 text-xs font-mono">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span>{selectedUserAction.prefix}{selectedUserAction.nick}</span>
                  <span className="text-[10px] text-slate-400">({selectedUserAction.role})</span>
                </div>
                <button
                  onClick={() => setSelectedUserAction(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleWhoisNick(selectedUserAction)}
                  className="px-2 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-[10px] font-bold"
                >
                  /whois
                </button>
                <button
                  onClick={() => handleQueryNick(selectedUserAction)}
                  className="px-2 py-0.5 rounded bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/40 text-[10px] font-bold"
                >
                  /query
                </button>
                <button
                  onClick={() => {
                    const timeStr = new Date().toLocaleTimeString();
                    setMessages((prev) => ({
                      ...prev,
                      [activeChannel]: [
                        ...(prev[activeChannel] || []),
                        {
                          id: `mode_${Date.now()}`,
                          timestamp: timeStr,
                          sender: '***',
                          channel: activeChannel,
                          content: `${ircSession.nick} sets mode +v ${selectedUserAction.nick}`,
                          type: 'notice',
                        },
                      ],
                    }));
                    setSelectedUserAction(null);
                  }}
                  className="px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold"
                >
                  /voice
                </button>
                {(selectedUserAction.organization.includes('Witt') || selectedUserAction.hostmask.includes('wittlawfirm')) && (
                  <button
                    onClick={() => {
                      setSelectedUserAction(null);
                      setIsDevPlatformModalOpen(true);
                    }}
                    className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 text-[10px] font-bold"
                  >
                    ⚖️ WittLaw Staff
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Twitch Emote Tray (Toggleable) */}
          {isEmoteDrawerOpen && (
            <div className="p-2 bg-slate-900 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold text-slate-300">
                <span>Twitch &amp; IRC Emotes</span>
                <span className="text-[10px] text-slate-500">Click to insert</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {TWITCH_EMOTES.map((em) => (
                  <button
                    key={em.code}
                    onClick={() => handleInsertEmote(em.code)}
                    className={`p-1.5 rounded-lg border border-slate-800 hover:border-purple-500 text-center transition cursor-pointer ${em.bgColor}`}
                    title={`${em.name} (${em.label})`}
                  >
                    <div className="text-base">{em.symbol}</div>
                    <div className="text-[9px] font-mono font-bold truncate">{em.code}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Message Input Bar */}
          <form onSubmit={handleSendMessage} className="bg-slate-900 border-t border-slate-800 p-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsEmoteDrawerOpen(!isEmoteDrawerOpen)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isEmoteDrawerOpen
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
              }`}
              title="Open Twitch Emote Picker"
            >
              <Smile className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Message ${activeChannel} (try /whois, /nick, /stats, /join)...`}
              className="flex-1 bg-slate-950 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700/80 focus:outline-none focus:border-purple-500 font-mono"
            />

            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow"
              title="Send Message into #lobby"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* WittLaw Developer Platform & Moderation Modal */}
      <DevPlatformWittLawModal
        isOpen={isDevPlatformModalOpen}
        onClose={() => setIsDevPlatformModalOpen(false)}
        onDispatchIrcQuery={(nick) => {
          setChatInput(`/msg ${nick} `);
        }}
        onJoinDevChannel={(ch) => {
          handleSwitchChannel(ch);
        }}
      />
    </div>
  );
};
