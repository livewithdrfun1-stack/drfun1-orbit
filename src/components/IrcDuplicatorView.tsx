import React, { useState, useEffect, useRef } from 'react';
import { 
  Share2, 
  Terminal, 
  Server, 
  ExternalLink, 
  Radio, 
  ShieldCheck, 
  Headphones, 
  Play, 
  Pause, 
  RefreshCw, 
  Filter, 
  Download, 
  Trash2, 
  ArrowRightLeft, 
  Send, 
  Layers, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Globe,
  Hash,
  Cpu,
  Wifi,
  Code2
} from 'lucide-react';
import { INITIAL_MPD_BOT_INSTANCES, INITIAL_DUPLICATOR_LOGS } from '../data/mpdBotData';
import { IrcDuplicatorMessage } from '../types/mpdBot';
import { WordPressIrcDuplicatorView } from './WordPressIrcDuplicatorView';

interface IrcDuplicatorViewProps {
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onOpenIrc?: () => void;
  onOpenMpd?: () => void;
  onOpenMedia?: () => void;
}

interface DuplicationRoute {
  id: string;
  sourceChannel: string;
  targetChannels: string[];
  mode: 'bidirectional' | 'broadcast' | 'filtered';
  prefix: string;
  stripColors: boolean;
  dropBotCommands: boolean;
  isActive: boolean;
  packetCount: number;
}

const INITIAL_ROUTES: DuplicationRoute[] = [
  {
    id: 'route-drfun1-main',
    sourceChannel: '#drfun1',
    targetChannels: ['#space', '#satcom-teleport', '#broadcast-noc'],
    mode: 'bidirectional',
    prefix: '[#drfun1]',
    stripColors: false,
    dropBotCommands: false,
    isActive: true,
    packetCount: 14820,
  },
  {
    id: 'route-hiphop-mesh',
    sourceChannel: '#hiphop',
    targetChannels: ['#deathrow-records', '#defjam', '#badboy-ent', '#drdre', '#2pac'],
    mode: 'bidirectional',
    prefix: '[#hiphop]',
    stripColors: true,
    dropBotCommands: false,
    isActive: true,
    packetCount: 22410,
  },
  {
    id: 'route-synthwave-mesh',
    sourceChannel: '#synthwave',
    targetChannels: ['#daftpunk', '#kraftwerk', '#ambient-space'],
    mode: 'bidirectional',
    prefix: '[#synthwave]',
    stripColors: false,
    dropBotCommands: false,
    isActive: true,
    packetCount: 11950,
  },
  {
    id: 'route-reggae-mesh',
    sourceChannel: '#dancehall',
    targetChannels: ['#bobmarley', '#soundsystem-dub'],
    mode: 'bidirectional',
    prefix: '[#dancehall]',
    stripColors: false,
    dropBotCommands: false,
    isActive: true,
    packetCount: 8430,
  },
  {
    id: 'route-jazz-mesh',
    sourceChannel: '#jazz',
    targetChannels: ['#bluenote', '#milesdavis', '#motown'],
    mode: 'bidirectional',
    prefix: '[#jazz]',
    stripColors: false,
    dropBotCommands: false,
    isActive: true,
    packetCount: 6810,
  },
  {
    id: 'route-fcc-media',
    sourceChannel: '#fcc-media',
    targetChannels: ['#drfun1-tv', '#cablecast-pegs', '#whitehouse-briefing'],
    mode: 'broadcast',
    prefix: '[FCC-RELAY]',
    stripColors: true,
    dropBotCommands: true,
    isActive: true,
    packetCount: 9320,
  },
];

export const IrcDuplicatorView: React.FC<IrcDuplicatorViewProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onOpenIrc,
  onOpenMpd,
  onOpenMedia,
}) => {
  const [viewMode, setViewMode] = useState<'mesh_console' | 'wordpress_generator'>('mesh_console');
  const [routes, setRoutes] = useState<DuplicationRoute[]>(INITIAL_ROUTES);
  const [logs, setLogs] = useState<IrcDuplicatorMessage[]>(INITIAL_DUPLICATOR_LOGS);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Simulator / manual injector states
  const [manualSource, setManualSource] = useState<string>('#drfun1');
  const [manualNick, setManualNick] = useState<string>('DJ_Console_Op');
  const [manualMessage, setManualMessage] = useState<string>('');
  const [transmittedNotice, setTransmittedNotice] = useState<string | null>(null);

  // Statistics
  const [totalRelayed, setTotalRelayed] = useState<number>(142980);
  const [packetsPerMinute, setPacketsPerMinute] = useState<number>(48);
  const [loopDrops, setLoopDrops] = useState<number>(184);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Background mock packet generation
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const activeBots = INITIAL_MPD_BOT_INSTANCES.filter(b => b.duplicatorEnabled);
      if (activeBots.length === 0) return;

      const randomBot = activeBots[Math.floor(Math.random() * activeBots.length)];
      const sampleSenders = ['BassDrop99', 'SatelliteOp_01', 'VinylKing', 'ApropoListener', 'DubMaster', 'SynthHead', 'VibeSeeker', 'RadioLover'];
      const sender = sampleSenders[Math.floor(Math.random() * sampleSenders.length)];

      const sampleEvents: Array<{ content: string; type: IrcDuplicatorMessage['msgType'] }> = [
        { content: `Tune in! Quality is crystal clear at 320kbps on ${randomBot.botNick}`, type: 'chat' },
        { content: `!request ${randomBot.nowPlaying.title}`, type: 'request' },
        { content: `!np: ${randomBot.nowPlaying.artist} - ${randomBot.nowPlaying.title} [${randomBot.targetEntity}]`, type: 'now_playing' },
        { content: `Big shoutout to everyone locked into the ${randomBot.targetEntity} stream!`, type: 'chat' },
        { content: `Echo suppression verified: 0 loop reflections detected`, type: 'system' },
      ];

      const chosenEvent = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      const targetChan = randomBot.duplicatorTargets[Math.floor(Math.random() * randomBot.duplicatorTargets.length)] || '#drfun1';

      const newLog: IrcDuplicatorMessage = {
        id: `dup-live-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        sourceChannel: randomBot.ircChannel,
        targetChannel: targetChan,
        sender,
        content: chosenEvent.content,
        msgType: chosenEvent.type,
        botNick: randomBot.botNick,
        latencyMs: Math.floor(Math.random() * 8) + 2,
      };

      setLogs(prev => [newLog, ...prev.slice(0, 99)]);
      setTotalRelayed(prev => prev + 1);
      setPacketsPerMinute(Math.floor(Math.random() * 20) + 40);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Handle manual packet injection / broadcast
  const handleInjectPacket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMessage.trim()) return;

    const matchedRoute = routes.find(r => r.sourceChannel === manualSource);
    const target = matchedRoute ? matchedRoute.targetChannels[0] : '#space';

    const injectedLog: IrcDuplicatorMessage = {
      id: `manual-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sourceChannel: manualSource,
      targetChannel: target,
      sender: manualNick.trim() || 'Operator',
      content: manualMessage.trim(),
      msgType: 'chat',
      botNick: 'duplicator_hub',
      latencyMs: 1,
    };

    setLogs(prev => [injectedLog, ...prev]);
    setTotalRelayed(prev => prev + 1);
    setManualMessage('');
    setTransmittedNotice(`Transmitted packet from ${manualSource} to [${matchedRoute?.targetChannels.join(', ') || target}]`);

    setTimeout(() => {
      setTransmittedNotice(null);
    }, 4000);
  };

  // Toggle route active state
  const handleToggleRoute = (routeId: string) => {
    setRoutes(prev => prev.map(r => {
      if (r.id === routeId) {
        return { ...r, isActive: !r.isActive };
      }
      return r;
    }));
  };

  // Clear logs
  const handleClearLogs = () => {
    setLogs([]);
  };

  // Export logs
  const handleExportLogs = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `irc-duplicator-packets-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (channelFilter !== 'all') {
      if (log.sourceChannel !== channelFilter && log.targetChannel !== channelFilter) {
        return false;
      }
    }
    if (typeFilter !== 'all') {
      if (log.msgType !== typeFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesContent = log.content.toLowerCase().includes(q);
      const matchesSender = log.sender.toLowerCase().includes(q);
      const matchesSource = log.sourceChannel.toLowerCase().includes(q);
      const matchesTarget = log.targetChannel.toLowerCase().includes(q);
      const matchesBot = log.botNick.toLowerCase().includes(q);
      if (!matchesContent && !matchesSender && !matchesSource && !matchesTarget && !matchesBot) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Top Banner Ribbon: Licensing & Mesh */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sky-400 font-bold">
            <Share2 className="w-4 h-4 text-sky-400" />
            <span>IRC Chat Duplicator Engine</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <a
            href="https://github.com/chat-apropo/mpd_irc_bot.git"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 text-[11px]"
          >
            <span>github.com/chat-apropo/mpd_irc_bot.git</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">
            UnrealIRCd 6.1 Hub • Switch Colocation • RisingNet Transit
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMpd && (
            <button
              onClick={onOpenMpd}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <Headphones className="w-3.5 h-3.5 text-emerald-400" />
              <span>Launch MPD Bot DJ Booth</span>
            </button>
          )}

          {onOpenIrc && (
            <button
              onClick={onOpenIrc}
              className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span>WebIRC Client</span>
            </button>
          )}

          {onOpenSwitchMesh && (
            <button
              onClick={onOpenSwitchMesh}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Switch Mesh</span>
            </button>
          )}
        </div>
      </div>

      {/* View Mode Navigation Ribbon */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 py-2 text-xs font-mono font-semibold overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('mesh_console')}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === 'mesh_console'
                  ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-sky-300" />
              <span>Real-Time Duplication Mesh &amp; Terminal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button
              onClick={() => setViewMode('wordpress_generator')}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === 'wordpress_generator'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-purple-300" />
              <span>WordPress &amp; HTML Duplicator Generator</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[9px] uppercase font-bold border border-purple-500/30">
                Plugin &amp; HTML5
              </span>
            </button>
          </div>

          {viewMode === 'mesh_console' && (
            <button
              onClick={() => setViewMode('wordpress_generator')}
              className="hidden sm:flex px-3 py-1.5 rounded-xl border bg-purple-950/80 hover:bg-purple-900 border-purple-500/40 text-purple-300 font-bold items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Generate WordPress / HTML Code ➔</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1 flex flex-col">

        {viewMode === 'wordpress_generator' ? (
          <WordPressIrcDuplicatorView
            onBackToMesh={() => setViewMode('mesh_console')}
            onOpenIrc={onOpenIrc}
          />
        ) : (
          <>
        {/* Hero Header & Telemetry Cards */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Wifi className="w-3 h-3 text-sky-400 animate-pulse" />
                Live Duplication Mesh Active
              </span>
              <span className="text-slate-500 text-xs font-mono">RFC 1459/2812 Cross-Channel Relay</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Share2 className="w-7 h-7 text-sky-400" />
              <span>IRC Chat Duplicator &amp; Relay Mesh</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Autonomous cross-channel chat reflection and packet replication engine based on{' '}
              <a 
                href="https://github.com/chat-apropo/mpd_irc_bot.git"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 underline font-mono"
              >
                mpd_irc_bot
              </a>
              . Duplicates messages, listener requests (<code className="text-emerald-400 font-mono">!request</code>), and now-playing notifications across DrFun1 media channels, artist communities, and satellite operations with loopback storm suppression.
            </p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 font-mono text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Relayed</div>
              <div className="text-lg font-bold text-sky-400 mt-0.5">
                {totalRelayed.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Zero Drops</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Speed</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {packetsPerMinute} <span className="text-xs text-slate-400 font-normal">pkt/m</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">~3.2ms latency</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Active Routes</div>
              <div className="text-lg font-bold text-purple-400 mt-0.5">
                {routes.filter(r => r.isActive).length} / {routes.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Bidirectional</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Loop Protection</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">
                {loopDrops} <span className="text-xs text-slate-400 font-normal">echoes</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Storm shield OK</div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Duplication Route Matrix (Left) & Real-Time Duplicator Console (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (5 Cols): Duplication Routes & Controls */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Duplication Routing Matrix Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-sky-400" />
                  <h3 className="font-bold text-white text-sm">Duplication Mesh Routes</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {routes.filter(r => r.isActive).length} Active
                </span>
              </div>

              <div className="p-4 space-y-3">
                {routes.map(route => (
                  <div
                    key={route.id}
                    className={`p-3 rounded-xl border transition-all ${
                      route.isActive 
                        ? 'bg-slate-950/90 border-slate-700/80' 
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-500/40 text-sky-300 font-bold">
                          {route.sourceChannel}
                        </span>
                        <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-300 font-medium">
                          {route.targetChannels.length} Target Chans
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleRoute(route.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                          route.isActive 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                        }`}
                      >
                        {route.isActive ? 'Active' : 'Muted'}
                      </button>
                    </div>

                    {/* Target channels list */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                      {route.targetChannels.map(tc => (
                        <span key={tc} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {tc}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Prefix: <strong className="text-sky-300">{route.prefix}</strong></span>
                      <span>Relayed: <strong className="text-slate-200">{route.packetCount.toLocaleString()}</strong></span>
                      <span className="text-emerald-400">Echo Shield: ON</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Packet Injector / Manual Broadcast Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Test Packet Transmitter</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Manual Injection</span>
              </div>

              <form onSubmit={handleInjectPacket} className="p-4 space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px]">Source Channel</label>
                    <select
                      value={manualSource}
                      onChange={(e) => setManualSource(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="#drfun1">#drfun1</option>
                      <option value="#hiphop">#hiphop</option>
                      <option value="#synthwave">#synthwave</option>
                      <option value="#dancehall">#dancehall</option>
                      <option value="#jazz">#jazz</option>
                      <option value="#fcc-media">#fcc-media</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px]">Sender Nick</label>
                    <input
                      type="text"
                      value={manualNick}
                      onChange={(e) => setManualNick(e.target.value)}
                      placeholder="e.g. DJ_Console"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Message Payload</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualMessage}
                      onChange={(e) => setManualMessage(e.target.value)}
                      placeholder="Type test broadcast to mirror across routes..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!manualMessage.trim()}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit</span>
                    </button>
                  </div>
                </div>

                {transmittedNotice && (
                  <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{transmittedNotice}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Topology & Switch Colocation Architecture Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-white text-xs">Switch Colocation &amp; Duplicator Topology</h4>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Duplicator instances run as high-speed worker daemons co-located inside Switch Data Center (Las Vegas SuperNAP) connected directly to the UnrealIRCd 6.1 Hub via localhost UNIX domain sockets and RisingNet 100G transit.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Hub Daemon:</span>
                  <span className="font-bold text-emerald-400">irc.drfun1.com:6697 (SSL)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Packet Queue:</span>
                  <span className="font-bold text-sky-400">Lock-Free Ring Buffer</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (7 Cols): Real-Time Duplicator Console & Packet Stream */}
          <div className="lg:col-span-7 space-y-5">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[760px]">
              
              {/* Header with Control Toolbar */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-sky-400" />
                    <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
                      <span>Real-Time Packet Stream</span>
                      <span className="px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-300 text-[10px] border border-sky-500/30">
                        {filteredLogs.length} Packets Buffered
                      </span>
                    </h3>
                  </div>

                  {/* Stream Controls */}
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isPaused
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                      }`}
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      <span>{isPaused ? 'Resume Stream' : 'Pause Stream'}</span>
                    </button>

                    <button
                      onClick={handleExportLogs}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Export packet logs (JSON)"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleClearLogs}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Clear log buffer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs pt-1">
                  {/* Channel Filter */}
                  <select
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-sky-500 text-[11px]"
                  >
                    <option value="all">All Channels</option>
                    <option value="#drfun1">#drfun1</option>
                    <option value="#hiphop">#hiphop</option>
                    <option value="#synthwave">#synthwave</option>
                    <option value="#dancehall">#dancehall</option>
                    <option value="#jazz">#jazz</option>
                    <option value="#fcc-media">#fcc-media</option>
                    <option value="#space">#space</option>
                  </select>

                  {/* Packet Type Filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-sky-500 text-[11px]"
                  >
                    <option value="all">All Packet Types</option>
                    <option value="chat">Chat Messages</option>
                    <option value="now_playing">!nowplaying</option>
                    <option value="request">!request</option>
                    <option value="system">System Relays</option>
                  </select>

                  {/* Text Search */}
                  <div className="flex-1 min-w-[150px]">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search packet payload, nick, channel..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Terminal Packet View */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs bg-black/70">
                {filteredLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <Terminal className="w-8 h-8 opacity-40" />
                    <p>No duplicated packets matching current filter parameters.</p>
                  </div>
                ) : (
                  filteredLogs.map(log => {
                    const isRequest = log.msgType === 'request';
                    const isNowPlaying = log.msgType === 'now_playing';
                    const isSystem = log.msgType === 'system';

                    return (
                      <div
                        key={log.id}
                        className={`p-2.5 rounded-xl border text-[11px] transition-all hover:bg-slate-900/60 ${
                          isRequest
                            ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                            : isNowPlaying
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                            : isSystem
                            ? 'bg-purple-950/20 border-purple-500/30 text-purple-200'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1 text-[10px] text-slate-400">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-slate-500">{log.timestamp}</span>
                            <span className="text-slate-600">•</span>
                            <span className="px-1.5 py-0.2 rounded bg-sky-950 border border-sky-500/30 text-sky-300 font-bold">
                              {log.sourceChannel}
                            </span>
                            <span className="text-slate-500">➔</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                              {log.targetChannel}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-500">Worker: {log.botNick}</span>
                          </div>

                          <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                            <span>{log.latencyMs}ms</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <span className="font-bold text-sky-400 shrink-0">
                            &lt;{log.sender}&gt;
                          </span>
                          <span className="break-all font-sans text-xs">
                            {log.content}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={logsEndRef} />
              </div>

              {/* Status footer */}
              <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                  <span>{isPaused ? 'DUPLICATOR STREAM PAUSED' : 'DUPLICATOR STREAM LIVE (AUTO-SYNC)'}</span>
                </div>
                <div className="text-slate-500">
                  Buffer: 100 max packets • Loopback Storm Filter Active
                </div>
              </div>

            </div>

          </div>

        </div>

        </>
        )}

      </div>

    </div>
  );
};
