/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Official IRCD Statistics & Telemetry Dashboard for irc.drfun1.com
 * UnrealIRCd 6.1.4 + Anope 2.1 Services + 25-Node Switch SUPERNAP Mesh
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Server, 
  Terminal, 
  Activity, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  Hash, 
  Cpu, 
  Globe, 
  Lock, 
  RefreshCw, 
  Copy, 
  Check, 
  Search, 
  ExternalLink, 
  Radio, 
  Tv, 
  Zap, 
  Clock, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  ArrowUpRight, 
  Sparkles,
  Network,
  Download,
  AlertCircle
} from 'lucide-react';
import { UNREAL_HUB_DETAILS, SWITCH_DEDICATED_NODES, ALL_DRFUN1_MEDIA_CHANNELS } from '../data/ircData';
import { AnopeRankLevel } from '../types/ircdAdmin';

interface IrcdStatsViewProps {
  onNavigateToMedia?: (channelIrc?: string) => void;
  onNavigateToIrc?: () => void;
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onOpenIrcdAdmin?: () => void;
  activeRank?: AnopeRankLevel;
}

export const IrcdStatsView: React.FC<IrcdStatsViewProps> = ({
  onNavigateToMedia,
  onNavigateToIrc,
  onOpenLicense,
  onOpenSwitchMesh,
  onOpenIrcdAdmin,
  activeRank = 'op',
}) => {
  // Live uptime counter in seconds (starting from 148 days, 12 hours)
  const [uptimeSeconds, setUptimeSeconds] = useState(148 * 86400 + 12 * 3600 + 1420);
  const [activeStatsTab, setActiveStatsTab] = useState<'overview' | 'nodes' | 'stats_cmd' | 'anope' | 'channels'>('overview');
  const [selectedStatsQuery, setSelectedStatsQuery] = useState<'u' | 'm' | 'l' | 'c' | 'k' | 'T' | 'z'>('u');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchNode, setSearchNode] = useState('');
  const [channelSearch, setChannelSearch] = useState('');
  const [simulatedPing, setSimulatedPing] = useState(1.4);
  const [terminalCommandInput, setTerminalCommandInput] = useState('/STATS u');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    ':irc.drfun1.com 242 Guest :Server Up 148 days, 12:23:40',
    ':irc.drfun1.com 250 Guest :Highest connection count: 14290 (8838 clients) (3491 connections received)',
    ':irc.drfun1.com 251 Guest :There are 8838 users and 412 invisible on 26 servers',
    ':irc.drfun1.com 252 Guest :18 operator(s) online',
    ':irc.drfun1.com 254 Guest :74 channels formed',
    ':irc.drfun1.com 255 Guest :I have 8838 clients and 25 servers',
    ':irc.drfun1.com 265 Guest 8838 14290 :Current local users 8838, max 14290',
    ':irc.drfun1.com 266 Guest 8838 14290 :Current global users 8838, max 14290',
    ':irc.drfun1.com 219 Guest u :End of /STATS report'
  ]);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds(prev => prev + 1);
      setSimulatedPing(+(1.2 + Math.random() * 0.5).toFixed(2));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format uptime
  const formattedUptime = useMemo(() => {
    const d = Math.floor(uptimeSeconds / 86400);
    const h = Math.floor((uptimeSeconds % 86400) / 3600);
    const m = Math.floor((uptimeSeconds % 3600) / 60);
    const s = uptimeSeconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  }, [uptimeSeconds]);

  // Helper copy
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Filter nodes
  const filteredNodes = useMemo(() => {
    if (!searchNode.trim()) return SWITCH_DEDICATED_NODES;
    const q = searchNode.toLowerCase();
    return SWITCH_DEDICATED_NODES.filter(n => 
      n.name.toLowerCase().includes(q) ||
      n.host.toLowerCase().includes(q) ||
      n.location.toLowerCase().includes(q) ||
      n.sid.includes(q)
    );
  }, [searchNode]);

  // Filter channels
  const filteredChannels = useMemo(() => {
    if (!channelSearch.trim()) return ALL_DRFUN1_MEDIA_CHANNELS;
    const q = channelSearch.toLowerCase();
    return ALL_DRFUN1_MEDIA_CHANNELS.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.topic.toLowerCase().includes(q) ||
      c.frequencyBand.toLowerCase().includes(q)
    );
  }, [channelSearch]);

  // Handle running /STATS command in terminal
  const handleRunStatsCommand = (flag: 'u' | 'm' | 'l' | 'c' | 'k' | 'T' | 'z') => {
    setSelectedStatsQuery(flag);
    setTerminalCommandInput(`/STATS ${flag}`);

    let newLines: string[] = [];
    switch (flag) {
      case 'u':
        newLines = [
          `:irc.drfun1.com NOTICE Auth :Executing /STATS u (Server Uptime & Resource Consumption)...`,
          `:irc.drfun1.com 242 Guest :Server Up ${formattedUptime}`,
          `:irc.drfun1.com 250 Guest :Highest connection count: 14290 (8838 clients) (3491 connections received)`,
          `:irc.drfun1.com 251 Guest :There are 8838 users and 412 invisible on 26 servers`,
          `:irc.drfun1.com 252 Guest :18 operator(s) online`,
          `:irc.drfun1.com 254 Guest :74 channels formed (1:1 DrFun1 Media TV/Radio Broadcast mapped)`,
          `:irc.drfun1.com 255 Guest :I have 8838 clients and 25 servers (Switch SUPERNAP Teleport Core)`,
          `:irc.drfun1.com 219 Guest u :End of /STATS report`
        ];
        break;
      case 'm':
        newLines = [
          `:irc.drfun1.com NOTICE Auth :Executing /STATS m (Command Usage & Processing Matrix)...`,
          `:irc.drfun1.com 212 Guest PRIVMSG 14,892,104 (bytes: 1.82 GB) :Live chat messages & station telemetry`,
          `:irc.drfun1.com 212 Guest JOIN 482,912 (bytes: 38.6 MB) :Channel joins across broadcast rooms`,
          `:irc.drfun1.com 212 Guest PART 410,200 (bytes: 32.1 MB) :Channel leaves`,
          `:irc.drfun1.com 212 Guest MODE 184,550 (bytes: 14.2 MB) :Channel modes (+sntk 100G) & oper flags`,
          `:irc.drfun1.com 212 Guest WHOIS 312,940 (bytes: 25.1 MB) :User query & certificate fingerprint checks`,
          `:irc.drfun1.com 212 Guest TOPIC 98,410 (bytes: 8.4 MB) :Live EPG sync program metadata updates`,
          `:irc.drfun1.com 212 Guest OPER 1,240 (bytes: 120 KB) :NetAdmin authentication to Switch Core`,
          `:irc.drfun1.com 212 Guest STATS 18,920 (bytes: 1.5 MB) :Telemetry requests from NOC & dashboards`,
          `:irc.drfun1.com 219 Guest m :End of /STATS report`
        ];
        break;
      case 'l':
        newLines = [
          `:irc.drfun1.com NOTICE Auth :Executing /STATS l (Link Matrix & Mesh Connections)...`,
          `:irc.drfun1.com 211 Guest hub.drfun1.com[001] 6697 184920 14820 184.2G/142.1G 0/0 :Switch Core Hub Master (TLS1.3)`,
          `:irc.drfun1.com 211 Guest node1.lasvegas.switch.drfun1.com[002] 6697 4820 120 14.8G/12.4G 0/0 :Switch Las Vegas 7,8,9 (3.2ms)`,
          `:irc.drfun1.com 211 Guest node2.tahoereno.switch.drfun1.com[003] 6697 3180 95 11.2G/9.8G 0/0 :Switch Citadel Reno (4.8ms)`,
          `:irc.drfun1.com 211 Guest node6.austin.switch.drfun1.com[007] 6697 3620 110 12.4G/10.9G 0/0 :Switch Texas Teleport (11.6ms)`,
          `:irc.drfun1.com 211 Guest node11.tokyo.switch.drfun1.com[012] 6697 4400 135 16.5G/14.2G 0/0 :Switch Tokyo Equinix (88.4ms)`,
          `:irc.drfun1.com 211 Guest node21.sydney.switch.drfun1.com[022] 6697 3350 90 9.8G/8.4G 0/0 :Switch Australasia Teleport (112.5ms)`,
          `:irc.drfun1.com 211 Guest node25.lasvegas-edge.switch.drfun1.com[026] 6697 6120 180 22.4G/19.1G 0/0 :Switch SUPERNAP 9 400G Vault (1.4ms)`,
          `:irc.drfun1.com 219 Guest l :End of /STATS report (25 Active Leaf Connections)`
        ];
        break;
      case 'c':
        newLines = [
          `:irc.drfun1.com NOTICE Auth :Executing /STATS c (Connect Classes & Flood Gates)...`,
          `:irc.drfun1.com 213 Guest C clients 90 0 10000 65536 :Standard User Class (Ping 90s, Max 10000)`,
          `:irc.drfun1.com 213 Guest C opers 60 0 100 262144 :NetAdmin & Oper Class (Ping 60s, High SendQ)`,
          `:irc.drfun1.com 213 Guest C servers 30 0 50 10485760 :Leaf Peering Class (Ping 30s, 10MB SendQ)`,
          `:irc.drfun1.com 213 Guest C broadcasters 45 0 250 524288 :Studio Media Broadcast Ingest Class`,
          `:irc.drfun1.com 219 Guest c :End of /STATS report`
        ];
        break;
      case 'k':
        newLines = [
          `:irc.drfun1.com NOTICE Auth :Executing /STATS k (Banned Hosts, K-lines, Z-lines & Spamfilter)...`,
          `:irc.drfun1.com 216 Guest Z *@198.51.100.44 1714502400 :Automated flood trigger - 12h temporary block`,
          `:irc.drfun1.com 216 Guest K *@203.0.113.89 1714588800 :Repeated phishing URL spam in #drfun1-primetv`,
          `:irc.drfun1.com 216 Guest G *@192.0.2.14 0 :Global AKILL enforced by Anope OperServ`,
          `:irc.drfun1.com 229 Guest f p block - - *join*flooder* :Spamfilter pattern: aggressive multi-channel join flood`,
          `:irc.drfun1.com 229 Guest f c block - - *t.me/*badlink* :Spamfilter pattern: malicious invite link blocker`,
          `:irc.drfun1.com 219 Guest k :End of /STATS report (0 active permanent bans on licensed users)`
        ];
        break;
      case 'T':
        newLines = [
          `:irc.drfun1.com NOTICE Auth :Executing /STATS T (Bandwidth, Optical Laser & Throughput Telemetry)...`,
          `:irc.drfun1.com 249 Guest :Total Bandwidth Inbound: 2.14 Tbps (RisingNet + Quantum Fiber)`,
          `:irc.drfun1.com 249 Guest :Total Bandwidth Outbound: 1.71 Tbps (Global Content Delivery Mesh)`,
          `:irc.drfun1.com 249 Guest :Aggregate Mesh Capacity: 3.85 Tbps across 25 Switch SUPERNAP Nodes`,
          `:irc.drfun1.com 249 Guest :SSL Handshake Rate: 1,420 TPS (TLS 1.3 AES-256 Hardware Accelerated)`,
          `:irc.drfun1.com 249 Guest :Average Mesh Latency: 1.4ms Core, 34.2ms Global Leaf Average`,
          `:irc.drfun1.com 219 Guest T :End of /STATS report`
        ];
        break;
      case 'z':
        newLines = [
          `:irc.drfun1.com NOTICE Auth :Executing /STATS z (Memory Allocations & Heap Allocator Stats)...`,
          `:irc.drfun1.com 249 Guest :Heap Allocation: 142.8 MB of 16.0 GB total physical RAM (0.89% utilized)`,
          `:irc.drfun1.com 249 Guest :Channel Table Buckets: 1024 (74 active channels, 0 collisions)`,
          `:irc.drfun1.com 249 Guest :User Hash Table Buckets: 16384 (8838 users, avg depth 0.54)`,
          `:irc.drfun1.com 249 Guest :SSL Session Cache: 14290 entries active (0 cache evictions)`,
          `:irc.drfun1.com 249 Guest :Spamfilter Tree: 42 compiled PCRE regex nodes active`,
          `:irc.drfun1.com 219 Guest z :End of /STATS report`
        ];
        break;
    }
    setConsoleLogs(newLines);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ========================================================
          HERO BANNER: irc.drfun1.com TELEMETRY & NETWORK STATUS
          ======================================================== */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left Column: Server Brand, Hostname & Verified Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 shadow-sm">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                <span>MASTER HUB 001</span>
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE &bull; 100% OPERATIONAL</span>
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono text-slate-300 bg-slate-800/80 border border-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>TLS 1.3 AES-256</span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>irc.drfun1.com</span>
                  <span className="text-purple-400 font-mono text-lg font-bold">:6697 (SSL)</span>
                </h1>
                <button
                  onClick={() => handleCopy('irc.drfun1.com:6697', 'mainHost')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                  title="Copy Server Address"
                >
                  {copiedKey === 'mainHost' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Global UnrealIRCd 6.1.4 & Anope 2.1 Services Network Master Telemetry. Colocated in 100% renewable Switch SUPERNAP (Las Vegas, NV) and transit-backed by RisingNet Optical (ASN 33211 / AS53767).
              </p>
            </div>

            {/* License info ribbon */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Licensed to: <strong className="text-white">Richard Alan Witt</strong> (The Law Office of Richard A. Witt LLC)</span>
              </span>
              <span className="text-slate-700">&bull;</span>
              <span>FCC FRN: <strong className="text-sky-400">0034981290</strong></span>
              <span className="text-slate-700">&bull;</span>
              <span>Cert: <strong className="text-emerald-400">RAW-SATCOM-2026-LIC-0881</strong></span>
            </div>
          </div>

          {/* Right Column: Quick Action CTA Buttons */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0 font-mono text-xs">
            <button
              onClick={() => onNavigateToMedia && onNavigateToMedia('#drfun1-primetv')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-bold transition-all shadow-lg shadow-purple-900/40 flex items-center gap-2 cursor-pointer"
            >
              <Tv className="w-4 h-4 text-white" />
              <span>Tune DrFun1 Media TV &amp; Studio</span>
            </button>

            <button
              onClick={onNavigateToIrc}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-sky-400" />
              <span>Launch WebIRC Client</span>
            </button>

            {onOpenIrcdAdmin && (
              <button
                onClick={onOpenIrcdAdmin}
                className="px-4 py-2 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-700/60 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Anope NetAdmin Panel</span>
              </button>
            )}
          </div>

        </div>

        {/* Real-Time Live Vital Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          
          {/* 1. Global Users */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Connected Users</span>
              <Users className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {UNREAL_HUB_DETAILS.totalSyncedUsers.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span>Peak: 14,290</span>
            </div>
          </div>

          {/* 2. Synced Channels */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Active Channels</span>
              <Hash className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-sky-300">
              {ALL_DRFUN1_MEDIA_CHANNELS.length}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              1:1 Broadcast Mapped
            </div>
          </div>

          {/* 3. Linked Leaf Servers */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Leaf Nodes</span>
              <Server className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
              {SWITCH_DEDICATED_NODES.length}
            </div>
            <div className="text-[10px] font-mono text-emerald-400">
              100% Mesh Synced
            </div>
          </div>

          {/* 4. Core Ping / Latency */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Switch Core Ping</span>
              <Activity className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
              {simulatedPing} ms
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Low-Jitter Fiber
            </div>
          </div>

          {/* 5. Uptime */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Server Uptime</span>
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-indigo-300 truncate" title={formattedUptime}>
              {formattedUptime}
            </div>
            <div className="text-[10px] font-mono text-emerald-400">
              Zero Unscheduled Drops
            </div>
          </div>

          {/* 6. Aggregate Throughput */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Optical Mesh</span>
              <Zap className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-rose-300">
              3.85 Tbps
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              RisingNet BGP Swip
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================
          STATS NAVIGATION SUB-TABS
          ======================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar font-mono text-xs">
        {[
          { id: 'overview', label: 'Network Overview & Security', icon: Activity },
          { id: 'stats_cmd', label: 'Live /STATS Engine Terminal', icon: Terminal },
          { id: 'nodes', label: `25 Switch Leaf Nodes (${SWITCH_DEDICATED_NODES.length})`, icon: Server },
          { id: 'channels', label: `1:1 Media Broadcast Channels (${ALL_DRFUN1_MEDIA_CHANNELS.length})`, icon: Hash },
          { id: 'anope', label: 'Anope 2.1 Services Health', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStatsTab(tab.id as typeof activeStatsTab)}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeStatsTab === tab.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold shadow-md shadow-purple-900/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: LIVE /STATS ENGINE TERMINAL
          ======================================================== */}
      {activeStatsTab === 'stats_cmd' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Terminal Top Control Bar */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white">UnrealIRCd 6.1.4 Raw /STATS Protocol Inspector</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">Target: <strong className="text-purple-300">irc.drfun1.com</strong></span>
              </div>

              {/* /STATS Quick Query Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                <span className="text-slate-500 text-[11px] mr-1">Run Flag:</span>
                {[
                  { flag: 'u', label: '/STATS u (Uptime)' },
                  { flag: 'm', label: '/STATS m (Commands)' },
                  { flag: 'l', label: '/STATS l (Leaf Links)' },
                  { flag: 'c', label: '/STATS c (Connect Class)' },
                  { flag: 'k', label: '/STATS k (Bans & Spamfilter)' },
                  { flag: 'T', label: '/STATS T (Bandwidth/Traffic)' },
                  { flag: 'z', label: '/STATS z (Memory Heap)' },
                ].map((item) => (
                  <button
                    key={item.flag}
                    onClick={() => handleRunStatsCommand(item.flag as typeof selectedStatsQuery)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                      selectedStatsQuery === item.flag
                        ? 'bg-purple-500 text-white font-bold shadow'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Output Screen */}
            <div className="p-4 bg-slate-950 font-mono text-xs space-y-1.5 overflow-x-auto min-h-[320px]">
              <div className="text-slate-500 pb-2 border-b border-slate-900">
                [DrFun1 IRC Telemetry Bridge] Connected to irc.drfun1.com:6697 with TLS_AES_256_GCM_SHA384 (ECDHE-P256). Active Operator Rank: {activeRank.toUpperCase()}.
              </div>
              
              {consoleLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-purple-500 select-none">&gt;</span>
                  <span className={
                    log.includes('NOTICE') ? 'text-amber-300' :
                    log.includes('End of /STATS') ? 'text-emerald-400 font-bold' :
                    log.includes('PRIVMSG') ? 'text-sky-300' :
                    log.includes('211') ? 'text-indigo-300' :
                    log.includes('Bandwidth') ? 'text-pink-300' :
                    'text-slate-200'
                  }>
                    {log}
                  </span>
                </div>
              ))}
            </div>

            {/* Terminal Command Input Footer */}
            <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-purple-400 font-bold">$</span>
                <span className="text-white font-bold">{terminalCommandInput}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopy(consoleLogs.join('\n'), 'statsLog')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'statsLog' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Report</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: NETWORK OVERVIEW & SECURITY
          ======================================================== */}
      {activeStatsTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Col 1: Server Config & Infrastructure Profile */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
                <Server className="w-4 h-4 text-purple-400" />
                <span>UnrealIRCd Core Configuration</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Network Name:</span>
                  <span className="text-white font-bold">{UNREAL_HUB_DETAILS.networkName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Server ID (SID):</span>
                  <span className="text-sky-300 font-bold">{UNREAL_HUB_DETAILS.sid}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Software:</span>
                  <span className="text-emerald-300">UnrealIRCd 6.1.4-DrFun1</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Services Daemon:</span>
                  <span className="text-indigo-300">Anope 2.1.1 (Modular DB)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Listen Ports:</span>
                  <span className="text-purple-300">6697 (SSL/TLS), 6667 (Plain)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">WebSocket / WebIRC:</span>
                  <span className="text-emerald-300 font-bold">wss://irc.drfun1.com:6697/webirc</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Colocation Facility:</span>
                  <span className="text-slate-200">Switch SUPERNAP Las Vegas</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Transit Carrier:</span>
                  <span className="text-sky-400 font-bold">RisingNet (ASN 33211)</span>
                </div>
              </div>
            </div>

            {/* Col 2: Security & Spamfilter Protection Matrix */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security, Centralized Bans &amp; Spamfilter</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-400">TLS 1.3 Strict Enforcement:</span>
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans">
                    All client & leaf links require modern mutual TLS ciphers. Plaintext connections across WAN boundaries are blocked.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-400">Real-Time Spamfilter Rules:</span>
                    <span className="text-purple-400 font-bold">42 PCRE Regexes</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Automated target-flood, invite-spam, mass-highlighting, and malicious executable link detection.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-400">Switch Hardware DDoS Mitigation:</span>
                    <span className="text-sky-400 font-bold">Inline Terabit Scrubbing</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Protected by Switch Core network scrubbing centers against L3/L4 volumetric synfloods and UDP amplification.
                  </p>
                </div>
              </div>
            </div>

            {/* Col 3: Legal & Regulatory Compliance */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>FCC &amp; Legal Compliance Governance</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Operated under commercial telecommunications authority licensed to <strong>Richard Alan Witt</strong> (The Law Office of Richard A. Witt LLC &amp; Owens Company).
              </p>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">License ID:</span>
                  <span className="text-emerald-400 font-bold">RAW-SATCOM-2026-LIC-0881</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">FCC FRN:</span>
                  <span className="text-sky-300">0034981290</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Part 25 Earth Station:</span>
                  <span className="text-slate-200">Authorized Satcom Uplink</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Part 73 Subcarrier:</span>
                  <span className="text-purple-300">Digital TV Auxiliary Relay</span>
                </div>
              </div>

              {onOpenLicense && (
                <button
                  onClick={onOpenLicense}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Inspect Legal License Certificate</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: 25 SWITCH LEAF NODES TABLE
          ======================================================== */}
      {activeStatsTab === 'nodes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-400 font-mono">
              Showing <strong>{filteredNodes.length}</strong> of {SWITCH_DEDICATED_NODES.length} Switch SUPERNAP &amp; RisingNet Leaf Nodes linked to <strong className="text-purple-300">irc.drfun1.com</strong>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search nodes, cities, SIDs..."
                value={searchNode}
                onChange={(e) => setSearchNode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">SID / Node Name</th>
                  <th className="p-3.5">Host FQDN</th>
                  <th className="p-3.5">Datacenter / Campus</th>
                  <th className="p-3.5 text-center">Latency</th>
                  <th className="p-3.5 text-center">Users</th>
                  <th className="p-3.5">Status &amp; Encryption</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          {node.sid}
                        </span>
                        <span className="font-semibold text-white">{node.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-sky-400">
                      <code>{node.host}</code>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <div>{node.campusName}</div>
                      <div className="text-[10px] text-slate-500">{node.location}</div>
                    </td>
                    <td className="p-3.5 text-center font-bold text-amber-300">
                      {node.latencyMs} ms
                    </td>
                    <td className="p-3.5 text-center font-bold text-white">
                      {node.usersOnline}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="font-bold">100% Synced</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {node.leafBurstStats?.encryption || 'TLSv1.3'}
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleCopy(node.host, node.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-slate-300 inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === node.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: 1:1 MEDIA BROADCAST CHANNELS DIRECTORY
          ======================================================== */}
      {activeStatsTab === 'channels' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-400 font-mono">
              Every DrFun1 Media TV and Radio broadcast channel has a dedicated 1-to-1 synchronized UnrealIRCd channel on <strong>irc.drfun1.com</strong>.
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search channels, topics..."
                value={channelSearch}
                onChange={(e) => setChannelSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChannels.map((chan) => (
              <div 
                key={chan.name}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-purple-500/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-mono text-purple-400 flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      <span>{chan.name}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {chan.modes}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-2">
                    {chan.topic}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Connected Chatters:</span>
                    <span className="text-emerald-400 font-bold">{chan.userCount} users</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Media Stream:</span>
                    <span className="text-sky-300 truncate max-w-[180px]">{chan.mediaType}</span>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => onNavigateToMedia && onNavigateToMedia(chan.name)}
                      className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-bold rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>Tune &amp; Join Room</span>
                    </button>
                    <button
                      onClick={() => handleCopy(`/join ${chan.name}`, chan.name)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono cursor-pointer"
                      title="Copy /join command"
                    >
                      {copiedKey === chan.name ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: ANOPE 2.1 SERVICES HEALTH & DAEMON REGISTRY
          ======================================================== */}
      {activeStatsTab === 'anope' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* NickServ */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>NickServ</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HEALTHY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manages registered broadcaster accounts, TLS CertFP auto-identification, password encryption (Argon2id), and account link masks.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Registered Nicks:</span>
                  <span className="text-sky-300 font-bold">12,480</span>
                </div>
                <div className="flex justify-between">
                  <span>CertFP Fingerprints:</span>
                  <span className="text-emerald-400 font-bold">8,410</span>
                </div>
              </div>
            </div>

            {/* ChanServ */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <Hash className="w-4 h-4 text-purple-400" />
                  <span>ChanServ</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HEALTHY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Enforces channel ownership, MLOCK mode protections (`+sntk`), broadcast bot auto-ops (`+o`), and entry bans for 1:1 broadcast rooms.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Registered Channels:</span>
                  <span className="text-purple-300 font-bold">74</span>
                </div>
                <div className="flex justify-between">
                  <span>MLOCK Enforced:</span>
                  <span className="text-emerald-400 font-bold">100%</span>
                </div>
              </div>
            </div>

            {/* OperServ */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>OperServ</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HEALTHY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                NetAdmin operations, global network akills, rehash triggers, Switch SUPERNAP leaf sync commands, and raw IRC debugging.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Active Global AKILLs:</span>
                  <span className="text-amber-400 font-bold">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Active NetAdmins:</span>
                  <span className="text-white font-bold">18 Online</span>
                </div>
              </div>
            </div>

            {/* BotServ */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>BotServ</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HEALTHY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Powers station bots (e.g. <code>DrFun1Bot</code>, <code>RadioDJ</code>, <code>SpaceTelemetryBot</code>) providing live track announcers and EPG tickers.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Provisioned Bots:</span>
                  <span className="text-emerald-400 font-bold">24 Bots</span>
                </div>
                <div className="flex justify-between">
                  <span>Broadcast Rooms Mapped:</span>
                  <span className="text-white font-bold">All 1:1 Channels</span>
                </div>
              </div>
            </div>

            {/* HostServ */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>HostServ</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HEALTHY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Grants verified broadcaster vanity virtual hosts (vHosts), e.g. <code>drfun1/broadcaster/*</code> and <code>satcom/operator/*</code>.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Assigned vHosts:</span>
                  <span className="text-indigo-300 font-bold">4,120</span>
                </div>
                <div className="flex justify-between">
                  <span>Privacy Masking:</span>
                  <span className="text-emerald-400 font-bold">Active</span>
                </div>
              </div>
            </div>

            {/* MemoServ */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-pink-400" />
                  <span>MemoServ</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HEALTHY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inter-operator satcom mission messaging, teleport shift handoff memos, and urgent FCC filing broadcast alerts.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Pending Memos:</span>
                  <span className="text-pink-300 font-bold">14 Memos</span>
                </div>
                <div className="flex justify-between">
                  <span>Relay Latency:</span>
                  <span className="text-emerald-400 font-bold">&lt; 1 ms</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
