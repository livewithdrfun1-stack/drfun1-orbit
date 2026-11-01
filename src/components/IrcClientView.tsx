import React, { useState, useEffect, useRef } from 'react';
import { 
  SwitchDedicatedNode, 
  UnrealIrcdHub,
  IrcChannel, 
  IrcUser, 
  IrcMessage, 
  WebIrcConnectionState 
} from '../types/irc';
import { 
  SWITCH_DEDICATED_NODES, 
  UNREAL_HUB_DETAILS,
  ALL_DRFUN1_MEDIA_CHANNELS, 
  INITIAL_IRC_USERS, 
  INITIAL_IRC_MESSAGES 
} from '../data/ircData';
import { 
  Terminal, 
  Server, 
  Radio, 
  ShieldCheck, 
  Wifi, 
  Activity, 
  Send, 
  Users, 
  Hash, 
  Layers, 
  RefreshCw, 
  Check, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  ChevronRight, 
  Copy, 
  Globe, 
  Sliders,
  Cpu,
  Lock,
  Network,
  GitBranch,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  X,
  MessageSquare,
  Search
} from 'lucide-react';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { MultistreamIrcChatRoom } from './MultistreamIrcChatRoom';

interface IrcClientViewProps {
  onOpenLicense: () => void;
  onOpenSwitchMesh: () => void;
  onNavigateToStore?: () => void;
  onNavigateToStudio?: () => void;
  activeRank?: AnopeRankLevel;
  onOpenIrcdAdmin?: () => void;
}

export const IrcClientView: React.FC<IrcClientViewProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onNavigateToStore,
  onNavigateToStudio,
  activeRank = 'op',
  onOpenIrcdAdmin,
}) => {
  // Connection state
  const [activeNodeId, setActiveNodeId] = useState<string>('switch_node_1');
  const [currentNick, setCurrentNick] = useState<string>('RichardAlanWitt');
  const [currentChannel, setCurrentChannel] = useState<string>('#drfun1-media');
  const [isMultistreamCombinedMode, setIsMultistreamCombinedMode] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [isBurstingSync, setIsBurstingSync] = useState<boolean>(false);
  const [showLeafTopologyModal, setShowLeafTopologyModal] = useState<boolean>(false);
  const [selectedLeafInspection, setSelectedLeafInspection] = useState<SwitchDedicatedNode | null>(SWITCH_DEDICATED_NODES[0]);

  // Channel messages map
  const [channelMessages, setChannelMessages] = useState<Record<string, IrcMessage[]>>(INITIAL_IRC_MESSAGES);
  const [inputCommand, setInputCommand] = useState<string>('');
  const [selectedUserWhois, setSelectedUserWhois] = useState<IrcUser | null>(null);

  // Channel filter
  const [channelCategoryFilter, setChannelCategoryFilter] = useState<'all' | 'satellite' | 'carrier' | 'broadcast' | 'bands' | 'noc'>('all');
  const [channelSearchQuery, setChannelSearchQuery] = useState<string>('');

  // Media stream simulation inside IRC
  const [isMediaAudioPlaying, setIsMediaAudioPlaying] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeNode = SWITCH_DEDICATED_NODES.find(n => n.id === activeNodeId) || SWITCH_DEDICATED_NODES[0];
  const activeChannelData = ALL_DRFUN1_MEDIA_CHANNELS.find(c => c.name === currentChannel) || ALL_DRFUN1_MEDIA_CHANNELS[0];
  const currentMessages = channelMessages[currentChannel] || [];

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSwitchNode = (nodeId: string) => {
    if (nodeId === activeNodeId) return;
    setIsReconnecting(true);
    const targetNode = SWITCH_DEDICATED_NODES.find(n => n.id === nodeId);

    // Append switching system notices
    const switchMsg: IrcMessage = {
      id: `sys_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sender: '***',
      channel: currentChannel,
      content: `Disconnecting from ${activeNode.host}... Routing over RisingNet backbone (www.risingnet.com) to ${targetNode?.host} (${targetNode?.campusName})...`,
      type: 'system',
    };

    setChannelMessages(prev => ({
      ...prev,
      [currentChannel]: [...(prev[currentChannel] || []), switchMsg],
    }));

    setTimeout(() => {
      setActiveNodeId(nodeId);
      setIsReconnecting(false);

      const connMsg: IrcMessage = {
        id: `sys_conn_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        sender: '***',
        channel: currentChannel,
        content: `Connected to ${targetNode?.host}:6697 [TLSv1.3 AES-256]. Latency: ${targetNode?.latencyMs} ms. Leaf peers: ${targetNode?.leafPeers}. 100% Green Energy verified.`,
        type: 'system',
      };

      setChannelMessages(prev => ({
        ...prev,
        [currentChannel]: [...(prev[currentChannel] || []), connMsg],
      }));
    }, 700);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputCommand.trim();
    if (!raw) return;

    // Handle slash commands
    if (raw.startsWith('/')) {
      handleSlashCommand(raw);
      setInputCommand('');
      return;
    }

    // Normal chat message
    const newMsg: IrcMessage = {
      id: `m_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sender: currentNick,
      channel: currentChannel,
      content: raw,
      type: 'message',
      nodeOrigin: activeNode.subdomain,
    };

    setChannelMessages(prev => ({
      ...prev,
      [currentChannel]: [...(prev[currentChannel] || []), newMsg],
    }));

    setInputCommand('');

    // Simulated automated bot reply from Switch or RisingNet if triggered
    if (raw.toLowerCase().includes('status') || raw.toLowerCase().includes('telemetry') || raw.toLowerCase().includes('ping')) {
      setTimeout(() => {
        const botReply: IrcMessage = {
          id: `bot_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          sender: 'Switch_NOC_Bot',
          channel: currentChannel,
          content: `[ACK] Telemetry nominal on node ${activeNode.name}. Band: ${activeChannelData.frequencyBand}. Optical cross-connect: 100 Gbps. RisingNet transit active. Leaf linked to ${activeNode.leafHub}.`,
          type: 'notice',
          nodeOrigin: activeNode.subdomain,
        };
        setChannelMessages(prev => ({
          ...prev,
          [currentChannel]: [...(prev[currentChannel] || []), botReply],
        }));
      }, 600);
    }
  };

  const handleLeafAll25NodesToHub = () => {
    if (isBurstingSync) return;
    setIsBurstingSync(true);

    const startMsg: IrcMessage = {
      id: `burst_start_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sender: '***',
      channel: currentChannel,
      content: `[UNREALIRCD LINK BURST] Initializing leaf link synchronization for all 25 Switch nodes to Root Hub ${UNREAL_HUB_DETAILS.host}:${UNREAL_HUB_DETAILS.port} (SID ${UNREAL_HUB_DETAILS.sid})...`,
      type: 'system',
    };

    setChannelMessages(prev => ({
      ...prev,
      [currentChannel]: [...(prev[currentChannel] || []), startMsg],
    }));

    // Sequentially leaf-sync each of the 25 nodes with realistic burst telemetry
    SWITCH_DEDICATED_NODES.forEach((node, index) => {
      setTimeout(() => {
        const nodeBurstMsg: IrcMessage = {
          id: `burst_node_${node.id}_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          sender: '***',
          channel: currentChannel,
          content: `[LEAF LINK ESTABLISHED] ${node.host} (SID ${node.sid}) <--> ${node.leafHub}:6697 [${node.leafBurstStats.encryption}] | Latency: ${node.latencyMs}ms | Synced: ${node.usersOnline} users, 14 channels | Fiber: ${node.fiberCapacity}`,
          type: 'system',
        };
        setChannelMessages(prev => ({
          ...prev,
          [currentChannel]: [...(prev[currentChannel] || []), nodeBurstMsg],
        }));
      }, (index + 1) * 120);
    });

    // Final summary notification from Switch_NOC_Bot
    setTimeout(() => {
      setIsBurstingSync(false);
      const summaryMsg: IrcMessage = {
        id: `burst_summary_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        sender: 'Switch_NOC_Bot',
        channel: currentChannel,
        content: `[LEAF CLUSTER SYNC COMPLETE] All 25 dedicated Switch & teleport nodes (Las Vegas, Tahoe Reno, Grand Rapids, Atlanta, Space Gateway, Austin, Chicago, Seattle, New York, London, Tokyo, Hawaii, Silicon Valley, Denver, Miami, Ashburn, Los Angeles, Frankfurt, Stockholm, Singapore, Sydney, São Paulo, Dubai, Deep Space Goldstone, SUPERNAP 9) are 100% leaf-synced to ${UNREAL_HUB_DETAILS.host}. Total synchronized: ${UNREAL_HUB_DETAILS.totalSyncedUsers.toLocaleString()} users and 14 all-band channels over 3.85 Tbps RisingNet optical backbone!`,
        type: 'notice',
      };
      setChannelMessages(prev => ({
        ...prev,
        [currentChannel]: [...(prev[currentChannel] || []), summaryMsg],
      }));
    }, (SWITCH_DEDICATED_NODES.length + 1) * 120);
  };

  const handleSlashCommand = (cmdStr: string) => {
    const parts = cmdStr.slice(1).split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    const addSysMsg = (text: string) => {
      const msg: IrcMessage = {
        id: `sys_cmd_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        sender: '***',
        channel: currentChannel,
        content: text,
        type: 'system',
      };
      setChannelMessages(prev => ({
        ...prev,
        [currentChannel]: [...(prev[currentChannel] || []), msg],
      }));
    };

    switch (command) {
      case 'join':
        if (arg.startsWith('#')) {
          setCurrentChannel(arg);
          addSysMsg(`Joined channel ${arg}.`);
        } else if (arg) {
          setCurrentChannel(`#${arg}`);
          addSysMsg(`Joined channel #${arg}.`);
        }
        break;

      case 'nick':
        if (arg) {
          const oldNick = currentNick;
          setCurrentNick(arg);
          addSysMsg(`${oldNick} is now known as ${arg}`);
        }
        break;

      case 'node':
        const nodeIdx = parseInt(arg, 10);
        if (nodeIdx >= 1 && nodeIdx <= 25) {
          handleSwitchNode(`switch_node_${nodeIdx}`);
        } else {
          addSysMsg('Usage: /node 1-25 (e.g. 1: Las Vegas Core, 5: Space Teleport, 13: Silicon Valley, 24: Deep Space Goldstone, 25: SUPERNAP 9 Redundant Core)');
        }
        break;

      case 'map':
      case 'links':
        addSysMsg('=== UnrealIRCd 6.1.4 Server Mesh Topology (Root Hub: irc.drfun1.com) ===');
        addSysMsg('`-- irc.drfun1.com [HUB - SID 001] (Switch SUPERNAP Las Vegas Core / RisingNet IP Transit)');
        SWITCH_DEDICATED_NODES.forEach((node, i) => {
          const prefix = i === SWITCH_DEDICATED_NODES.length - 1 ? '    `-- ' : '    |-- ';
          addSysMsg(`${prefix}${node.host} [LEAF - SID ${node.sid}] (${node.latencyMs}ms, ${node.usersOnline} nicks, ${node.location.split(',')[0]} - ${node.fiberCapacity.split('+')[0].trim()})`);
        });
        addSysMsg(`*** Total Network: 1 Master Hub, 25 Dedicated Leafs, ${UNREAL_HUB_DETAILS.totalSyncedUsers.toLocaleString()} Users, 14 Channels Synced across 3.85 Tbps.`);
        break;

      case 'leafsync':
      case 'sync':
        handleLeafAll25NodesToHub();
        break;

      case 'hub':
        addSysMsg(`=== UnrealIRCd Root Hub: ${UNREAL_HUB_DETAILS.host}:${UNREAL_HUB_DETAILS.port} (SSL/TLS) ===`);
        addSysMsg(`Colocation: ${UNREAL_HUB_DETAILS.colocation}`);
        addSysMsg(`Transit Provider: ${UNREAL_HUB_DETAILS.transitProvider}`);
        addSysMsg(`Licensee: ${UNREAL_HUB_DETAILS.licensee}`);
        addSysMsg(`Active Leafs: 25/25 Switch Dedicated Nodes linked with TLSv1.3 AES-256-GCM (3.85 Tbps mesh)`);
        break;

      case 'ping':
        addSysMsg(`PONG ${activeNode.host} : ${activeNode.latencyMs} ms round-trip over RisingNet Tier-1 optical ring.`);
        break;

      case 'whois':
        const targetUser = INITIAL_IRC_USERS.find(u => u.nick.toLowerCase() === arg.toLowerCase());
        if (targetUser) {
          setSelectedUserWhois(targetUser);
          addSysMsg(`[WHOIS] ${targetUser.nick}!${targetUser.hostmask} [${targetUser.role}] (${targetUser.organization})`);
        } else {
          addSysMsg(`No such user: ${arg}`);
        }
        break;

      case 'clear':
        setChannelMessages(prev => ({ ...prev, [currentChannel]: [] }));
        break;

      case 'help':
        addSysMsg('Available IRC commands: /join <#chan>, /nick <name>, /node <1-25>, /map, /links, /leafsync, /hub, /ping, /whois <nick>, /clear, /help. Hosted by risingnet.com on Switch 25-Node infrastructure.');
        break;

      default:
        addSysMsg(`Unknown command /${command}. Type /help for available commands.`);
        break;
    }
  };

  // Channel filtering
  const filteredChannels = ALL_DRFUN1_MEDIA_CHANNELS.filter(ch => {
    if (channelCategoryFilter === 'satellite') {
      if (ch.category !== 'satellite_companies') return false;
    } else if (channelCategoryFilter === 'carrier') {
      if (ch.category !== 'phone_carriers') return false;
    } else if (channelCategoryFilter === 'broadcast') {
      if (ch.category !== 'broadcast_networks' && ch.category !== 'media_channels') return false;
    } else if (channelCategoryFilter === 'bands') {
      if (ch.category !== 'frequency_bands') return false;
    } else if (channelCategoryFilter === 'noc') {
      if (ch.category !== 'teleport_infrastructure' && ch.category !== 'legal_spectrum') return false;
    }

    if (channelSearchQuery.trim()) {
      const q = channelSearchQuery.toLowerCase();
      const matchName = ch.name.toLowerCase().includes(q);
      const matchTopic = ch.topic.toLowerCase().includes(q);
      const matchCompany = ch.companyName ? ch.companyName.toLowerCase().includes(q) : false;
      const matchBand = ch.frequencyBand.toLowerCase().includes(q);
      if (!matchName && !matchTopic && !matchCompany && !matchBand) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Hosting & License Masthead */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-sky-950/80 border-b border-purple-500/30 px-4 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wide">
                DrFun1 WebIRC Terminal <span className="text-purple-400 font-mono">v6.1.4</span>
              </span>
              <span className="hidden md:inline text-slate-400 ml-2">
                | Hosted by <a href="https://www.risingnet.com" target="_blank" rel="noreferrer" className="text-sky-300 hover:underline font-semibold">risingnet.com</a>
              </span>
              <span className="hidden md:inline text-slate-400 ml-2">
                | 25 Dedicated Nodes by <a href="https://www.switch.com" target="_blank" rel="noreferrer" className="text-emerald-300 hover:underline font-semibold">www.switch.com</a>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLicense}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Witt Law Firm License</span>
            </button>

            <button
              onClick={onOpenSwitchMesh}
              className="text-slate-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mesh Topology</span>
            </button>
          </div>
        </div>
      </div>

      {/* UnrealIRCd Hub & Leaf Synchronization Control Bar */}
      <div className="bg-slate-950/95 border-b border-purple-500/20 px-4 py-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-purple-950/60 border border-purple-500/40 px-3 py-1 rounded-lg shadow-inner">
              <Network className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-mono text-purple-200 font-bold">
                Root Hub: <span className="text-white">irc.drfun1.com:6697</span>
              </span>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-500/30 px-1.5 py-0.2 rounded font-semibold">
                SID 001
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-semibold">25/25 Dedicated Leafs Synced</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 hidden sm:inline">3.85 Tbps RisingNet Optical Backbone</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLeafAll25NodesToHub}
              disabled={isBurstingSync}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                isBurstingSync
                  ? 'bg-purple-600/50 border border-purple-400 text-purple-200 cursor-wait'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50 ring-1 ring-emerald-400/40'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBurstingSync ? 'animate-spin' : ''}`} />
              <span>{isBurstingSync ? 'Synchronizing 25 Nodes...' : 'Leaf All 25 Nodes to irc.drfun1.com'}</span>
            </button>

            <button
              onClick={() => setShowLeafTopologyModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <GitBranch className="w-3.5 h-3.5 text-sky-400" />
              <span>Leaf Topology (/map)</span>
            </button>

            <button
              onClick={() => setIsMultistreamCombinedMode(!isMultistreamCombinedMode)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                isMultistreamCombinedMode
                  ? 'bg-purple-600 border border-purple-400 text-white shadow-purple-950/50 ring-2 ring-purple-400/40'
                  : 'bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-300 hover:text-purple-100'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isMultistreamCombinedMode ? 'text-white animate-pulse' : 'text-purple-400'}`} />
              <span>{isMultistreamCombinedMode ? 'Exit Combined Mode' : 'Multistream Combined Mode'}</span>
            </button>

            {onOpenIrcdAdmin && (
              <button
                onClick={onOpenIrcdAdmin}
                className="px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900/80 border border-red-700/60 text-red-200 font-mono text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                <span>IRCD Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 25 Dedicated Switch Nodes Ribbon Selector */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              25 Dedicated Switch Nodes:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {SWITCH_DEDICATED_NODES.map((node, idx) => {
              const isCurrent = node.id === activeNodeId;
              const nodeNum = idx + 1 < 10 ? `Node 0${idx + 1}` : `Node ${idx + 1}`;
              return (
                <button
                  key={node.id}
                  onClick={() => handleSwitchNode(node.id)}
                  disabled={isReconnecting}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
                    isCurrent
                      ? 'bg-emerald-500/10 border-emerald-400 text-emerald-200 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="font-semibold">{nodeNum}</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                    {node.location.split(',')[0]}
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                    SID {node.sid}
                  </span>
                  <span className="text-[10px] text-emerald-400/90 font-bold">
                    {node.latencyMs}ms
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main IRC Interface: 3-column layout or Multistream Combined Mode */}
      {isMultistreamCombinedMode ? (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-purple-200">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="font-bold">Multistream IRC Combined Cockpit:</span>
              <span className="text-purple-300">
                Live dual-routed IRC chat room synchronized across UnrealIRCd 6 (<code className="text-purple-100 font-mono">irc.drfun1.com:6697</code>) and BroadCast destinations (Twitch, YouTube, Kick, Facebook, Switch CDN).
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMultistreamCombinedMode(false)}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded text-xs font-mono font-medium transition-colors"
              >
                Switch to Standard 3-Column IRC
              </button>
            </div>
          </div>

          <div className="h-[740px]">
            <MultistreamIrcChatRoom
              variant="full"
              defaultChannel={currentChannel}
              activeRank={activeRank}
              onOpenAdminPanel={onOpenIrcdAdmin}
              onOpenIrcClient={() => setIsMultistreamCombinedMode(false)}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Channels & All Bands Selector (3 cols on lg) */}
        <div className="lg:col-span-3 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-[650px]">
          {/* Channel Header & Filter */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                Inter-Network Channels
              </span>
              <span className="text-[10px] font-mono text-purple-300 px-1.5 py-0.5 rounded bg-purple-500/20">
                {ALL_DRFUN1_MEDIA_CHANNELS.length} Synced
              </span>
            </div>

            {/* Channel Search Input */}
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={channelSearchQuery}
                onChange={e => setChannelSearchQuery(e.target.value)}
                placeholder="Search satellite, carrier, band..."
                className="w-full bg-slate-900 border border-slate-700/70 rounded-md pl-7 pr-7 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
              {channelSearchQuery && (
                <button
                  onClick={() => setChannelSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="grid grid-cols-3 gap-1 text-[9px] font-medium font-mono">
              <button
                onClick={() => setChannelCategoryFilter('all')}
                className={`py-1 px-1 rounded text-center transition-colors truncate ${
                  channelCategoryFilter === 'all'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({ALL_DRFUN1_MEDIA_CHANNELS.length})
              </button>
              <button
                onClick={() => setChannelCategoryFilter('satellite')}
                className={`py-1 px-1 rounded text-center transition-colors truncate ${
                  channelCategoryFilter === 'satellite'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Satellites (35)
              </button>
              <button
                onClick={() => setChannelCategoryFilter('carrier')}
                className={`py-1 px-1 rounded text-center transition-colors truncate ${
                  channelCategoryFilter === 'carrier'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Carriers (12)
              </button>
              <button
                onClick={() => setChannelCategoryFilter('broadcast')}
                className={`py-1 px-1 rounded text-center transition-colors truncate ${
                  channelCategoryFilter === 'broadcast'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Broadcast (7)
              </button>
              <button
                onClick={() => setChannelCategoryFilter('bands')}
                className={`py-1 px-1 rounded text-center transition-colors truncate ${
                  channelCategoryFilter === 'bands'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                RF Spectrum
              </button>
              <button
                onClick={() => setChannelCategoryFilter('noc')}
                className={`py-1 px-1 rounded text-center transition-colors truncate ${
                  channelCategoryFilter === 'noc'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Switch NOC
              </button>
            </div>
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredChannels.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-mono">
                No channels match &quot;{channelSearchQuery}&quot;
              </div>
            ) : (
              filteredChannels.map(ch => {
                const isSelected = ch.name === currentChannel;
                return (
                  <button
                    key={ch.name}
                    onClick={() => setCurrentChannel(ch.name)}
                    className={`w-full text-left p-2 rounded-lg transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-500/15 border border-purple-500/40 text-purple-200 font-medium'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <Hash className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-mono font-semibold block leading-tight">
                            {ch.name}
                          </span>
                          {ch.companyName && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-950/80 text-sky-300 border border-sky-800/40 truncate max-w-[120px]">
                              {ch.companyName}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {ch.frequencyBand}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {ch.userCount}
                      </span>
                      {ch.isStreamActive && (
                        <span className="block text-[8px] font-mono font-bold text-red-400 uppercase">
                          LIVE
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Switch Node Telemetry Box */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/90 text-[11px] space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px]">Active Node:</span>
              <span className="text-emerald-400 font-bold">{activeNode.subdomain.split('.')[0]} (SID {activeNode.sid})</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px]">Leaf Hub:</span>
              <span className="text-purple-300 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {activeNode.leafHub}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px]">Hub Latency:</span>
              <span className="text-emerald-300">{activeNode.latencyMs} ms (TLSv1.3)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px]">Transit / Fiber:</span>
              <span className="text-sky-300 truncate max-w-[130px]">RisingNet 100G</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px]">Colocation:</span>
              <span className="text-slate-300 truncate max-w-[130px]">Switch Tier 5 Platinum</span>
            </div>
          </div>
        </div>

        {/* Center Column: IRC Terminal Screen & Input (6 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-[650px]">
          {/* Channel Banner / Topic Bar */}
          <div className="bg-slate-900 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white text-sm">
                  {activeChannelData.name}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                  {activeChannelData.frequencyBand}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {activeChannelData.modes}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {activeChannelData.topic}
              </p>
            </div>

            {/* Media Stream Simulation Toggle for All Bands */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsMediaAudioPlaying(!isMediaAudioPlaying)}
                title={isMediaAudioPlaying ? 'Mute Channel Stream' : 'Listen to Channel Media Stream'}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
                  isMediaAudioPlaying
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {isMediaAudioPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{isMediaAudioPlaying ? 'STREAM ON' : 'MONITOR'}</span>
              </button>
            </div>
          </div>

          {/* Active Audio / Video Carrier Info (if monitoring) */}
          {isMediaAudioPlaying && (
            <div className="bg-purple-950/40 border-b border-purple-500/30 px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-purple-300">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                Carrier Feed: {activeChannelData.mediaType} ({activeChannelData.mediaBitrate})
              </span>
              <span className="text-slate-400">Switch Las Vegas 100G Downlink</span>
            </div>
          )}

          {/* Terminal Log Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs leading-relaxed bg-slate-950 text-slate-200">
            {currentMessages.map(msg => (
              <div key={msg.id} className="hover:bg-slate-900/50 p-0.5 rounded transition-colors">
                <span className="text-slate-600 mr-2 text-[11px] select-none">
                  [{msg.timestamp}]
                </span>

                {msg.type === 'system' ? (
                  <span className="text-slate-400 italic">
                    <strong className="text-purple-400 font-normal">*** </strong>
                    {msg.content}
                  </span>
                ) : msg.type === 'notice' ? (
                  <span className="text-amber-400 font-semibold">
                    <strong className="text-amber-300 font-bold">-{msg.sender}- </strong>
                    {msg.content}
                  </span>
                ) : (
                  <span>
                    <strong className={`font-bold ${
                      msg.sender.startsWith('@') || msg.sender === 'RichardAlanWitt'
                        ? 'text-sky-400'
                        : msg.sender.includes('Bot')
                        ? 'text-purple-400'
                        : msg.sender.startsWith('+')
                        ? 'text-emerald-400'
                        : 'text-amber-300'
                    }`}>
                      &lt;{msg.sender}&gt;{' '}
                    </strong>
                    <span className="text-slate-100">{msg.content}</span>
                  </span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* IRC Command Line / Input Form */}
          <form onSubmit={handleSendMessage} className="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-2">
            <div className="flex items-center px-2 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-400">
              <span>{currentNick}</span>
            </div>
            <input
              type="text"
              value={inputCommand}
              onChange={e => setInputCommand(e.target.value)}
              placeholder={`Message ${currentChannel} or type /join, /node 1-5, /nick, /ping...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!inputCommand.trim()}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1 shadow-md shadow-purple-900/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right Column: User Nicklist & WHOIS Inspector (3 cols on lg) */}
        <div className="lg:col-span-3 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-[650px]">
          {/* Header */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              Users in {currentChannel}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {INITIAL_IRC_USERS.length} Online
            </span>
          </div>

          {/* Users List with Ops & Voiced */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {INITIAL_IRC_USERS.map(user => (
              <div
                key={user.nick}
                onClick={() => setSelectedUserWhois(user)}
                className={`p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                  selectedUserWhois?.nick === user.nick
                    ? 'bg-purple-500/20 border border-purple-500/40 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-mono font-bold text-xs ${
                      user.prefix === '@' ? 'text-sky-400' : user.prefix === '+' ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {user.prefix || ' '}
                    </span>
                    <span className="text-xs font-mono font-semibold truncate">
                      {user.nick}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                    {user.organization}
                  </span>
                </div>

                {user.isBot && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300">
                    BOT
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* WHOIS Card / Node Details */}
          {selectedUserWhois ? (
            <div className="p-3 border-t border-slate-800 bg-slate-950 text-xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">WHOIS Profile</span>
                <button
                  onClick={() => setSelectedUserWhois(null)}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
              <p className="text-white font-bold">{selectedUserWhois.nick}</p>
              <p className="text-[10px] text-slate-400 break-all">{selectedUserWhois.hostmask}</p>
              <p className="text-[10px] text-sky-400">{selectedUserWhois.role}</p>
              <p className="text-[10px] text-emerald-400">{selectedUserWhois.organization}</p>
            </div>
          ) : (
            <div className="p-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px]">ECOM &amp; ISP Integration</span>
                {onNavigateToStore && (
                  <button
                    onClick={onNavigateToStore}
                    className="text-[10px] text-amber-300 hover:underline flex items-center gap-0.5"
                  >
                    <span>Store</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Order dedicated Switch 100G bare-metal nodes and DrFun1 ISP gigabit packages in the ECOM store.
              </p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* UnrealIRCd Hub-and-Leaf Topology Tree Modal */}
      {showLeafTopologyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>UnrealIRCd 6.1.4 Hub-and-Leaf Mesh Topology</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                      12 / 12 Leafs Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Root Hub: irc.drfun1.com:6697 (SSL) · Colocation: switch.com · IP Transit: risingnet.com
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowLeafTopologyModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Root Hub Card: irc.drfun1.com */}
              <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Network className="w-32 h-32 text-purple-400" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                        Master Root Hub (SID 001)
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Authoritative
                      </span>
                    </div>

                    <h4 className="text-xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
                      <span>irc.drfun1.com</span>
                      <span className="text-xs text-purple-300 font-normal">:6697 (TLS 1.3)</span>
                    </h4>

                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Central broadcast coordination hub hosted on <a href="https://www.risingnet.com" target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">risingnet.com</a> optical transit and colocated at <a href="https://www.switch.com" target="_blank" rel="noreferrer" className="text-emerald-300 hover:underline">Switch SUPERNAP</a> Tier 5 Platinum. Licensed to Richard Alan Witt (<a href="https://www.wittlawfirm.com" target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">www.wittlawfirm.com</a> / <a href="https://www.owenscompany.com" target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">www.owenscompany.com</a>).
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono shrink-0">
                    <div className="bg-slate-950/70 border border-purple-500/20 p-2.5 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Total Synced Leafs</span>
                      <span className="text-sm font-bold text-emerald-400">25 Switch Nodes</span>
                    </div>
                    <div className="bg-slate-950/70 border border-purple-500/20 p-2.5 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Aggregate Mesh</span>
                      <span className="text-sm font-bold text-purple-300">3.85 Tbps</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connecting Tree Visualizer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-emerald-400" />
                    25 Dedicated Switch Nodes (Direct Leafs to irc.drfun1.com)
                  </h5>
                  <span className="text-[11px] font-mono text-slate-400">
                    Click any node to inspect its unrealircd.conf link block
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {SWITCH_DEDICATED_NODES.map((node, idx) => {
                    const isSelected = selectedLeafInspection?.id === node.id;
                    const isCurrentActive = activeNodeId === node.id;
                    const nodeNum = idx + 1 < 10 ? `Node 0${idx + 1}` : `Node ${idx + 1}`;

                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedLeafInspection(node)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between h-40 ${
                          isSelected
                            ? 'bg-purple-950/30 border-purple-400 shadow-md ring-1 ring-purple-400/40'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              {nodeNum}
                            </span>
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold">
                              SID {node.sid}
                            </span>
                          </div>

                          <h6 className="text-xs font-bold text-white truncate font-mono">
                            {node.subdomain.split('.')[0]}
                          </h6>

                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {node.location.split(',')[0]}
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-800/80 font-mono text-[10px]">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Hub RTT:</span>
                            <span className="text-emerald-400 font-bold">{node.latencyMs}ms</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Leaf Status:</span>
                            <span className="text-emerald-300 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Synced
                            </span>
                          </div>
                          {isCurrentActive && (
                            <span className="block text-[9px] text-center bg-emerald-500/20 text-emerald-300 font-bold rounded py-0.5">
                              CURRENT WEBSOCKET
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Leaf Node Inspector & Link Configuration */}
              {selectedLeafInspection && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                          UnrealIRCd Leaf Specification (SID {selectedLeafInspection.sid})
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Leafed to: <strong className="text-purple-300">{selectedLeafInspection.leafHub}:6697</strong>
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">
                        {selectedLeafInspection.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {selectedLeafInspection.campusName} · {selectedLeafInspection.tier}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeNodeId !== selectedLeafInspection.id && (
                        <button
                          onClick={() => {
                            handleSwitchNode(selectedLeafInspection.id);
                            setShowLeafTopologyModal(false);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>Connect to Node</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleCopy(selectedLeafInspection.unrealLinkBlock, `link-config-${selectedLeafInspection.id}`)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5"
                      >
                        {copiedText === `link-config-${selectedLeafInspection.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy link block</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Leaf Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-slate-500 text-[10px] uppercase block">Transit Backbone</span>
                      <span className="text-slate-200 font-semibold truncate block">RisingNet Optical</span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-slate-500 text-[10px] uppercase block">Fiber Bandwidth</span>
                      <span className="text-slate-200 font-semibold">{selectedLeafInspection.fiberCapacity}</span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-slate-500 text-[10px] uppercase block">Encryption Suite</span>
                      <span className="text-emerald-300 font-semibold truncate block">TLSv1.3 AES-256</span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-slate-500 text-[10px] uppercase block">Cluster Sync Status</span>
                      <span className="text-emerald-400 font-semibold">100% Burst Complete</span>
                    </div>
                  </div>

                  {/* unrealircd.conf snippet */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-mono text-slate-400 block">
                      Production unrealircd.conf link definition linking this Switch node to Root Hub irc.drfun1.com:
                    </span>
                    <pre className="bg-slate-950 border border-slate-800/90 rounded-lg p-3 text-[11px] font-mono text-purple-300 overflow-x-auto leading-relaxed select-text">
                      {selectedLeafInspection.unrealLinkBlock}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  Licensed under The Law Office of Richard A. Witt LLC &amp; Owens Company
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    handleLeafAll25NodesToHub();
                  }}
                  disabled={isBurstingSync}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isBurstingSync ? 'animate-spin' : ''}`} />
                  <span>{isBurstingSync ? 'Bursting 25-Node Cluster Sync...' : 'Leaf All 25 Nodes to irc.drfun1.com'}</span>
                </button>

                <button
                  onClick={() => setShowLeafTopologyModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
