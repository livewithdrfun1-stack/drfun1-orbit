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
  AlertCircle,
  BarChart3,
  GitFork,
  GitBranch,
  Database,
  PieChart,
  TrendingUp,
  MessageSquare,
  Award
} from 'lucide-react';
import { UNREAL_HUB_DETAILS, SWITCH_DEDICATED_NODES, ALL_DRFUN1_MEDIA_CHANNELS, ZNC_BOUNCER_CONFIG, STATS_DRFUN1IRCD_PORTAL, NEOSTATS_CONFIG, DENORA_CONFIG } from '../data/ircData';
import { AnopeRankLevel } from '../types/ircdAdmin';

interface IrcdStatsViewProps {
  onNavigateToMedia?: (channelIrc?: string) => void;
  onNavigateToIrc?: () => void;
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onOpenIrcdAdmin?: () => void;
  onOpenZncWebAdmin?: () => void;
  onOpenUnrealSearch?: () => void;
  activeRank?: AnopeRankLevel;
}

export const IrcdStatsView: React.FC<IrcdStatsViewProps> = ({
  onNavigateToMedia,
  onNavigateToIrc,
  onOpenLicense,
  onOpenSwitchMesh,
  onOpenIrcdAdmin,
  onOpenZncWebAdmin,
  onOpenUnrealSearch,
  activeRank = 'op',
}) => {
  // Live uptime counter in seconds (starting from 148 days, 12 hours)
  const [uptimeSeconds, setUptimeSeconds] = useState(148 * 86400 + 12 * 3600 + 1420);
  const [activeStatsTab, setActiveStatsTab] = useState<'overview' | 'denora' | 'neostats' | 'nodes' | 'znc' | 'stats_cmd' | 'anope' | 'channels'>('overview');
  const [selectedStatsQuery, setSelectedStatsQuery] = useState<'u' | 'm' | 'l' | 'c' | 'k' | 'T' | 'z'>('u');
  const [selectedNeoStatsCmd, setSelectedNeoStatsCmd] = useState<string>('STATS');
  const [selectedNeoStatsConfTab, setSelectedNeoStatsConfTab] = useState<'neostats_conf' | 'unreal_link' | 'git_build'>('neostats_conf');
  const [selectedDenoraCmd, setSelectedDenoraCmd] = useState<string>('STATUS');
  const [selectedDenoraConfTab, setSelectedDenoraConfTab] = useState<'denora_conf' | 'unreal_link' | 'mysql_schema' | 'git_build'>('denora_conf');
  const [denoraTldFilter, setDenoraTldFilter] = useState('');
  const [denoraLogs, setDenoraLogs] = useState<string[]>([
    ':StatServ!stats@stats.drfun1.com NOTICE Guest :=== Denora IRC Statistics 1.5.1 Status Report ===',
    ':StatServ!stats@stats.drfun1.com NOTICE Guest :Git Repository      : https://github.com/denora/denora.git',
    ':StatServ!stats@stats.drfun1.com NOTICE Guest :Server Name         : denora.drfun1.com (Numeric: 098, U-lines Active)',
    ':StatServ!stats@stats.drfun1.com NOTICE Guest :Uplink Master Hub   : irc.drfun1.com:6697 (Switch SUPERNAP Las Vegas Core)',
    ':StatServ!stats@stats.drfun1.com NOTICE Guest :Current Global Users: 8,838 clients across 26 servers',
    ':StatServ!stats@stats.drfun1.com NOTICE Guest :Current Channels    : 74 active broadcast rooms',
    ':StatServ!stats@stats.drfun1.com NOTICE Guest :All-Time Peak Users : 14,290 (Set on 2026-11-04 18:42:10 UTC)',
    ':StatServ!stats@stats.drfun1.com NOTICE Guest :MariaDB / MySQL Sync: drfun1_denora_stats InnoDB Tables OK (every 30s)',
    ':StatServ!stats@stats.drfun1.com NOTICE Guest :phpDenora Web Feeds : Synchronized to https://stats.drfun1ircd.com/denora',
    ':StatServ!stats@stats.drfun1.com NOTICE Guest :End of /msg StatServ STATUS report.'
  ]);
  const [neoStatsLogs, setNeoStatsLogs] = useState<string[]>([
    ':StatServ!services@services.drfun1.com NOTICE Guest :=== NeoStats 3.0.2 StatServ Network Report ===',
    ':StatServ!services@services.drfun1.com NOTICE Guest :Current Global Clients : 8,838 (Peak: 14,290 on 2026-11-04)',
    ':StatServ!services@services.drfun1.com NOTICE Guest :Current Channels       : 74 formed (100% broadcast synchronized)',
    ':StatServ!services@services.drfun1.com NOTICE Guest :Current Servers        : 26 online (Switch SUPERNAP Leaf Mesh)',
    ':StatServ!services@services.drfun1.com NOTICE Guest :Total Connects Logged  : 3,491,820 since boot',
    ':StatServ!services@services.drfun1.com NOTICE Guest :Active Network Uptime  : 148 days, 12 hours, 19 mins',
    ':StatServ!services@services.drfun1.com NOTICE Guest :Network Link Health    : 0 netsplits detected in last 30 days',
    ':StatServ!services@services.drfun1.com NOTICE Guest :Source Repository      : https://github.com/Macs/NeoStats.git',
    ':StatServ!services@services.drfun1.com NOTICE Guest :End of /msg StatServ STATS report.'
  ]);
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

  // Filter Denora TLDs
  const filteredDenoraTlds = useMemo(() => {
    if (!denoraTldFilter.trim()) return DENORA_CONFIG.tldStats;
    const q = denoraTldFilter.toLowerCase();
    return DENORA_CONFIG.tldStats.filter(t => 
      t.tld.toLowerCase().includes(q) ||
      t.country.toLowerCase().includes(q)
    );
  }, [denoraTldFilter]);

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

  // Handle running NeoStats service commands
  const handleRunNeoStatsCommand = (cmd: string) => {
    setSelectedNeoStatsCmd(cmd);
    let lines: string[] = [];
    switch (cmd) {
      case 'STATS':
        lines = [
          `:StatServ!services@services.drfun1.com NOTICE Guest :=== NeoStats 3.0.2 StatServ Network Report ===`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :Current Global Clients : 8,838 (Peak: 14,290 on 2026-11-04)`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :Current Channels       : 74 formed (100% broadcast synchronized)`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :Current Servers        : 26 online (Switch SUPERNAP Leaf Mesh)`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :Total Connects Logged  : 3,491,820 since boot`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :Active Network Uptime  : ${formattedUptime}`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :Network Link Health    : 0 netsplits detected in last 30 days`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :Source Repository      : https://github.com/Macs/NeoStats.git`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :End of /msg StatServ STATS report.`
        ];
        break;
      case 'PEAK':
        lines = [
          `:StatServ!services@services.drfun1.com NOTICE Guest :=== NeoStats StatServ All-Time Network Peaks ===`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :Maximum Users Online   : 14,290 (Set during White House Live Briefing)`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :Maximum Channels Formed: 74 (Full DrFun1 Media TV/Radio Carrier Grid)`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :Maximum Servers Linked : 26 (All Switch SUPERNAP Leaf Nodes active)`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :Busiest 1-Hour Window  : 8,838 connects (18:00 - 19:00 UTC)`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :Average Connect Rate   : 41.2 connects/min`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :End of /msg StatServ PEAK report.`
        ];
        break;
      case 'CHANS':
        lines = [
          `:StatServ!services@services.drfun1.com NOTICE Guest :=== Top Active Broadcast Channels (by Traffic Volume) ===`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :1. #drfun1-primetv       : 1,840 users, 42.4 msgs/sec (+sntk 100G)`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :2. #whitehouse-briefings : 1,290 users, 28.1 msgs/sec (+sntk 100G)`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :3. #c-band-space         :   840 users, 18.6 msgs/sec (+sntk 100G)`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :4. #5g-ntn               :   780 users, 14.2 msgs/sec (+sntk 100G)`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :5. #fcc-spectrum-alerts  :   620 users,  9.4 msgs/sec (+sntk 100G)`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :6. #switch-supernap      :   540 users, 12.0 msgs/sec (+sntk 100G)`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :End of /msg StatServ CHANS report.`
        ];
        break;
      case 'CONNECTSERV':
        lines = [
          `:ConnectServ!services@services.drfun1.com NOTICE Guest :=== NeoStats ConnectServ Routing & Lag Matrix ===`,
          `:ConnectServ!services@services.drfun1.com NOTICE Guest :Hub irc.drfun1.com [001] -> node1.lasvegas (0.4ms) [0 splits]`,
          `:ConnectServ!services@services.drfun1.com NOTICE Guest :Hub irc.drfun1.com [001] -> node2.tahoereno (3.8ms) [0 splits]`,
          `:ConnectServ!services@services.drfun1.com NOTICE Guest :Hub irc.drfun1.com [001] -> node4.atlanta (14.2ms) [0 splits]`,
          `:ConnectServ!services@services.drfun1.com NOTICE Guest :Hub irc.drfun1.com [001] -> node10.london (68.1ms) [0 splits]`,
          `:ConnectServ!services@services.drfun1.com NOTICE Guest :Hub irc.drfun1.com [001] -> node11.tokyo (88.4ms) [0 splits]`,
          `:ConnectServ!services@services.drfun1.com NOTICE Guest :Hub irc.drfun1.com [001] -> irc.drfun1media.com (1.8ms) [0 splits]`,
          `:ConnectServ!services@services.drfun1.com NOTICE Guest :Average Global Inter-Leaf Round-Trip: 24.1 ms`,
          `:ConnectServ!services@services.drfun1.com NOTICE Guest :End of /msg ConnectServ LAG report.`
        ];
        break;
      case 'SECURESERV':
        lines = [
          `:SecureServ!services@services.drfun1.com NOTICE Guest :=== NeoStats SecureServ Sentry Report ===`,
          `:SecureServ!services@services.drfun1.com NOTICE Guest :Monitored DNSBL Zones   : dronebl.org, dnsbl.dronebl.org, tor.dan.me.uk`,
          `:SecureServ!services@services.drfun1.com NOTICE Guest :Proxies Scanned Today   : 148,910 connection attempts`,
          `:SecureServ!services@services.drfun1.com NOTICE Guest :Threats Neutralized     : 8,420 automated drone/proxy blocks`,
          `:SecureServ!services@services.drfun1.com NOTICE Guest :Active Enforced K-Lines : 4 temporary 24h holds`,
          `:SecureServ!services@services.drfun1.com NOTICE Guest :Tor Exit Node Policy    : Read-only guest mode (+M mode)`,
          `:SecureServ!services@services.drfun1.com NOTICE Guest :End of /msg SecureServ STATS report.`
        ];
        break;
      case 'SEENSERV':
        lines = [
          `:SeenServ!services@services.drfun1.com NOTICE Guest :=== NeoStats SeenServ User Query ===`,
          `:SeenServ!services@services.drfun1.com NOTICE Guest :Target: DrFun1Admin`,
          `:SeenServ!services@services.drfun1.com NOTICE Guest :Status: ONLINE now on irc.drfun1.com (Switch SUPERNAP Las Vegas Core)`,
          `:SeenServ!services@services.drfun1.com NOTICE Guest :Channels: #drfun1-primetv (+qo), #c-band-space (+o), #switch-supernap (+o)`,
          `:SeenServ!services@services.drfun1.com NOTICE Guest :Signed on: 148 days, 12 hours ago (Zero reconnects)`,
          `:SeenServ!services@services.drfun1.com NOTICE Guest :End of /msg SeenServ SEEN report.`
        ];
        break;
      case 'MODULES':
        lines = [
          `:StatServ!services@services.drfun1.com NOTICE Guest :=== NeoStats 3.0.2 Loaded Dynamic Modules ===`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :[01] statserv.so   (v3.0.2) - Network statistics & peak tracker [Active]`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :[02] connectserv.so(v3.0.2) - Server routing lag & net-split auditor [Active]`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :[03] secureserv.so (v3.0.2) - DroneBL automated security shield [Active]`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :[04] seenserv.so   (v3.0.2) - Persistent user nick presence database [Active]`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :[05] webstats.so   (v3.0.2) - HTML & JSON-RPC stats.drfun1ircd.com feeder [Active]`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :[06] hostserv.so   (v3.0.2) - Virtual hostmask manager (*.drfun1media.com) [Active]`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :Source Code: https://github.com/Macs/NeoStats.git`,
          `:StatServ!services@services.drfun1.com NOTICE Guest :End of /msg StatServ MODULES report.`
        ];
        break;
      default:
        break;
    }
    setNeoStatsLogs(lines);
  };

  // Handle running Denora StatServ command
  const handleRunDenoraCommand = (cmd: string) => {
    setSelectedDenoraCmd(cmd);
    let lines: string[] = [];
    switch (cmd) {
      case 'STATUS':
        lines = [
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :=== Denora IRC Statistics 1.5.1 Status Report ===`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Source Repository : https://github.com/denora/denora.git`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Server Name       : denora.drfun1.com (Numeric: 098, U-lines Active)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Uplink Master     : irc.drfun1.com:6697 (Switch SUPERNAP Las Vegas Core)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Uptime            : 148 days, 12 hours, 19 mins, 14 secs`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Current Online    : 8,838 Users, 74 Channels, 26 Servers`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :All-Time Record   : 14,290 Users, 82 Channels (2026-11-04)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :SQL Engine        : MariaDB 10.11 / MySQL 8.0 (drfun1_denora_stats) - Connected`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :SQL Sync Cycle    : 30s interval | Last flush: 12 seconds ago`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :End of /msg StatServ STATUS report.`
        ];
        break;
      case 'TLD':
        lines = [
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :=== Denora TLD (Top-Level Domain) Geographic Breakdown ===`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :1. .com (Commercial Anycast)    : 3,682 users (41.6%)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :2. .net (Network Infrastructure): 1,842 users (20.8%)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :3. .org (Open Source/Non-Profit):   920 users (10.4%)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :4. .tv  (Broadcasting Playout)  :   742 users ( 8.4%)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :5. .de  (Germany Frankfurt POP) :   512 users ( 5.8%)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :6. .uk  (United Kingdom Ingest) :   384 users ( 4.3%)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :7. .jp  (Japan Tokyo POP)       :   298 users ( 3.4%)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :8. .ca  (Canada Toronto POP)     :   246 users ( 2.8%)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :9. .nl  (Netherlands Teleport)  :   212 users ( 2.4%)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Total Unique Countries Tracked  : 48 Sovereign Zones`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :End of /msg StatServ TLD report.`
        ];
        break;
      case 'CLIENTS':
        lines = [
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :=== Denora CTCP VERSION IRC Client Census ===`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :1. mIRC 7.76+                 : 2,410 users (27.3%) [Desktop Windows]`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :2. WeeChat 4.2+ (CLI/Headless): 1,820 users (20.6%) [Linux/macOS/BSD]`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :3. HexChat 2.16+              : 1,540 users (17.4%) [Desktop Multi-OS]`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :4. Irssi 1.4+ (UNIX Terminal) : 1,180 users (13.4%) [Linux Server/tmux]`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :5. The Lounge Web IRC Client  :   840 users ( 9.5%) [Node.js Web App]`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :6. ZNC 1.9.1 Bouncer (znc.git):   620 users ( 7.0%) [Bouncer Daemon]`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :7. KiwiIRC / DrFun1 WebIRC    :   428 users ( 4.8%) [Browser WebRTC/WS]`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :End of /msg StatServ CLIENTS report.`
        ];
        break;
      case 'PEAK':
        lines = [
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :=== Denora All-Time Network Record Peaks ===`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Maximum Users Online : 14,290 (Set on 2026-11-04 18:42:10 UTC)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Peak Users Today     :  9,412 (Recorded at 14:15 UTC)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Maximum Channels     :     82 (Historical peak)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Current Channels     :     74 (100% active synchronized)`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Total Users Logged   : 3,491,820 connections since epoch`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Server Splits (30d)  : 0 splits recorded`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :End of /msg StatServ PEAK report.`
        ];
        break;
      case 'CHANSTATS':
        lines = [
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :=== Denora ChanStats Channel Activity Leaderboard ===`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :1. #drfun1-primetv      : 1,840 users | 184,290 lines | 1,294,000 words | 42.4 msg/s`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :2. #whitehouse-briefings: 1,290 users |  98,400 lines |   842,000 words | 28.1 msg/s`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :3. #c-band-space        :   840 users |  64,120 lines |   482,000 words | 18.6 msg/s`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :4. #5g-ntn              :   780 users |  52,900 lines |   394,000 words | 14.2 msg/s`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :5. #fcc-spectrum-alerts :   620 users |  41,200 lines |   310,000 words |  9.4 msg/s`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :6. #switch-supernap     :   540 users |  38,100 lines |   290,000 words | 12.0 msg/s`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :End of /msg StatServ CHANSTATS report.`
        ];
        break;
      case 'TOPCHATTERS':
        lines = [
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :=== Denora Top Chatter Hall of Fame (Lines / Words) ===`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :1. DrFun1Admin       : 14,890 lines | 112,400 words | 84 smileys | 42 kicks`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :2. WittLaw_NetAdmin  : 11,420 lines |  98,200 words | 12 smileys | 28 kicks`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :3. Switch_NOC_Lead   :  9,840 lines |  74,100 words |  5 smileys | 14 kicks`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :4. SpaceTeleport_Oper:  7,650 lines |  58,900 words | 18 smileys |  6 kicks`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :5. Capt_Dave         :  6,290 lines |  48,200 words | 34 smileys |  2 kicks`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :6. DJ_NeonCircuit    :  5,840 lines |  44,100 words | 92 smileys |  1 kick`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :End of /msg StatServ TOPCHATTERS report.`
        ];
        break;
      case 'SQLSYNC':
        lines = [
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :=== Denora MySQL / MariaDB Sync Operation ===`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Database: drfun1_denora_stats @ localhost:3306`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Flushing in-memory statistical buffers to InnoDB tables...`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :denora_stats   : 142 rows committed`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :denora_tld     : 48 TLD countries updated`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :denora_chan    : 74 active channel records flushed`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :denora_cstats  : 8,838 user-channel relation records updated`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :phpDenora sync : HTML & JSON cache updated at /var/www/stats.drfun1ircd.com/denora`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :Synchronization completed with 0 errors in 18.4ms.`,
          `:StatServ!stats@stats.drfun1.com NOTICE Guest :End of /msg StatServ SQLSYNC report.`
        ];
        break;
      default:
        break;
    }
    setDenoraLogs(lines);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ========================================================
          OFFICIAL STATS PORTAL BANNER: stats.drfun1ircd.com
          ======================================================== */}
      <div className="bg-gradient-to-r from-purple-900/60 via-slate-900/90 to-indigo-950/70 border border-purple-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300 font-bold">
                  Official Telemetry Portal
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  JSON-RPC 2.0 &bull; LIVE SYNC
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Switch SUPERNAP NV Core
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <a
                  href="https://stats.drfun1ircd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl sm:text-2xl font-mono font-black text-white hover:text-purple-300 transition-colors flex items-center gap-2 group"
                >
                  <span className="underline decoration-purple-500/50 decoration-2 underline-offset-4">stats.drfun1ircd.com</span>
                  <ExternalLink className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <button
                  onClick={() => handleCopy('https://stats.drfun1ircd.com', 'statsPortal')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                  title="Copy Portal URL"
                >
                  {copiedKey === 'statsPortal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="font-mono text-[10px]">Copy URL</span>
                </button>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans">
                {STATS_DRFUN1IRCD_PORTAL.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 font-mono text-xs shrink-0">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30 flex flex-col min-w-[170px]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Master Hub (SID 001)</span>
              <span className="text-purple-300 font-bold flex items-center gap-1">
                <span>irc.drfun1.com:6697</span>
              </span>
              <span className="text-[10px] text-emerald-400">Las Vegas SUPERNAP</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex flex-col min-w-[180px]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Media Leaf &amp; ZNC (SID 026)</span>
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <span>irc.drfun1media.com</span>
              </span>
              <span className="text-[10px] text-sky-400">UnrealIRCd + ZNC 1.9.1</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex flex-col min-w-[170px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">NeoStats (SID 099)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <span className="text-cyan-300 font-bold flex items-center gap-1">
                <span>neostats.drfun1.com</span>
              </span>
              <a
                href="https://github.com/Macs/NeoStats.git"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                title="NeoStats Official Git Repository (https://github.com/Macs/NeoStats.git)"
              >
                <span>github.com/Macs/NeoStats</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-fuchsia-500/30 flex flex-col min-w-[170px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Denora (SID 098)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
              </div>
              <span className="text-fuchsia-300 font-bold flex items-center gap-1">
                <span>denora.drfun1.com</span>
              </span>
              <a
                href="https://github.com/denora/denora.git"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                title="Denora Stats Official Git Repository (https://github.com/denora/denora.git)"
              >
                <span>github.com/denora/denora</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            {onOpenUnrealSearch && (
              <button
                onClick={onOpenUnrealSearch}
                className="p-2.5 rounded-xl bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border border-indigo-500/50 hover:border-indigo-400 text-indigo-200 hover:text-white flex flex-col min-w-[180px] transition-all cursor-pointer shadow-md group text-left"
                title="UnrealIRCd.org Search Engine: Ask users to leaf to irc.drfun1.com before listing"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wide">Search Engine</span>
                  <Search className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-white font-bold flex items-center gap-1 text-xs mt-0.5">
                  <span>unrealircd.org</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-medium">Leaf to irc.drfun1.com &rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>

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
          { id: 'denora', label: 'Denora Stats (github.com/denora/denora.git)', icon: PieChart },
          { id: 'neostats', label: 'NeoStats 3.0 (github.com/Macs/NeoStats.git)', icon: BarChart3 },
          { id: 'znc', label: 'ZNC 1.9.1 Bouncer (znc.git)', icon: Layers },
          { id: 'nodes', label: `26 Switch Leaf Nodes (${SWITCH_DEDICATED_NODES.length})`, icon: Server },
          { id: 'stats_cmd', label: 'Live /STATS Engine Terminal', icon: Terminal },
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
          TAB: ZNC 1.9.1 BOUNCER & PERSISTENT BUFFER (github.com/znc/znc.git)
          ======================================================== */}
      {activeStatsTab === 'znc' && (
        <div className="space-y-6">
          {/* ZNC Hero / Status Banner */}
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>ZNC 1.9.1 BOUNCER ACTIVE</span>
                  </span>
                  <a
                    href="https://github.com/znc/znc.git"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-md text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>github.com/znc/znc.git</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    Host: irc.drfun1media.com
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>ZNC IRC Bouncer Engine</span>
                  <span className="text-emerald-400 font-mono text-base font-normal">&bull; Leafed to irc.drfun1.com:6697</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
                  High-performance IRC bouncer compiled from <strong className="text-white">https://github.com/znc/znc.git</strong> running inside <strong className="text-emerald-300">irc.drfun1media.com</strong>. Maintains continuous 24/7 presence across all 70 1:1 broadcasting channels with buffer playback, SASL authentication, and web administration.
                </p>
              </div>

              <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 font-mono text-xs">
                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-slate-400">IRC Client Port:</span>
                  <span className="text-emerald-300 font-bold">6697 (SSL)</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-slate-400">WebAdmin Port:</span>
                  <span className="text-sky-300 font-bold">5000 (HTTPS)</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-slate-400">Upstream Hub:</span>
                  <span className="text-purple-300 font-bold">irc.drfun1.com:6697</span>
                </div>

                {onOpenZncWebAdmin && (
                  <button
                    onClick={onOpenZncWebAdmin}
                    className="w-full mt-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>Open ZNC Web Control Panel (:5000)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stat Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Loaded Modules</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{ZNC_BOUNCER_CONFIG.loadedModules.length} Modules</span>
                <span className="text-[10px] font-mono text-slate-500 block">playback, buffextras, sasl</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Active Bouncer Users</span>
                <span className="text-lg font-bold font-mono text-white">{ZNC_BOUNCER_CONFIG.activeUsers} Sessions</span>
                <span className="text-[10px] font-mono text-slate-500 block">Multi-Client Attached</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Channel Playback Buffers</span>
                <span className="text-lg font-bold font-mono text-sky-400">{ZNC_BOUNCER_CONFIG.totalBuffers} Channels</span>
                <span className="text-[10px] font-mono text-slate-500 block">1:1 Sync with irc.drfun1.com</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">SASL Security Mode</span>
                <span className="text-lg font-bold font-mono text-purple-300">ECDSA-256</span>
                <span className="text-[10px] font-mono text-slate-500 block">Certificate &amp; Pass Challenge</span>
              </div>
            </div>
          </div>

          {/* Grid: Modules & Active Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Loaded Modules */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Loaded ZNC Modules ({ZNC_BOUNCER_CONFIG.loadedModules.length})</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">irc.drfun1media.com</span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {ZNC_BOUNCER_CONFIG.loadedModules.map((mod) => (
                  <div key={mod.name} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-300 text-xs">{mod.name}</span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {mod.type}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{mod.status}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{mod.description}</p>
                    {mod.args && (
                      <div className="text-[10px] font-mono text-purple-400 mt-1 bg-slate-900/90 px-2 py-0.5 rounded inline-block">
                        args: {mod.args}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Active User Sessions & Buffers */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>Active ZNC User Sessions &amp; Backlog Buffers</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Live Attached</span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {ZNC_BOUNCER_CONFIG.userSessions.map((session) => (
                  <div key={session.username} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">{session.username}</span>
                        <span className="text-[10px] font-mono text-slate-400">({session.bindHost})</span>
                      </div>
                      <span className="text-[10px] font-mono text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
                        {session.connectedClients} Client(s)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{session.realname}</div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>Buffer: <strong className="text-emerald-400">{session.bufferSize} lines</strong></span>
                      <span>&bull;</span>
                      <span>Channels: <strong className="text-purple-300">{session.channelsCount}</strong></span>
                      <span>&bull;</span>
                      <span>Active: <strong className="text-slate-200">{session.lastActive}</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {session.bufferedChannels.map((chan) => (
                        <span key={chan} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {chan}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* znc.conf Configuration Code Inspector */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">/etc/znc/configs/znc.conf &bull; irc.drfun1media.com</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">Leafing to irc.drfun1.com:6697</span>
              </div>
              <button
                onClick={() => handleCopy(ZNC_BOUNCER_CONFIG.zncConfSnippet, 'zncConf')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 text-xs font-mono cursor-pointer"
              >
                {copiedKey === 'zncConf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy znc.conf</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto max-h-[320px] leading-relaxed">
              {ZNC_BOUNCER_CONFIG.zncConfSnippet}
            </pre>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB: DENORA IRC STATISTICS 1.5.1 & MYSQL TELEMETRY (github.com/denora/denora.git)
          ======================================================== */}
      {activeStatsTab === 'denora' && (
        <div className="space-y-6">
          {/* Denora Hero / Status Banner */}
          <div className="bg-slate-900/90 border border-fuchsia-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
                    <span>DENORA 1.5.1 STATSERV ACTIVE</span>
                  </span>
                  <a
                    href="https://github.com/denora/denora.git"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-md text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Official Denora Git Repository: https://github.com/denora/denora.git"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                    <span>github.com/denora/denora.git</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    SID: 098 &bull; denora.drfun1.com
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    U-lines Verified
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    MySQL / MariaDB Synced (30s)
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Denora 1.5.1 IRC Network Statistics &amp; phpDenora Hub</span>
                  <span className="text-fuchsia-400 font-mono text-base font-normal">&bull; Linked to irc.drfun1.com:6697</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
                  Comprehensive network statistical daemon and real-time census engine cloned and built from <strong className="text-white">https://github.com/denora/denora.git</strong> (developed by Hal9000, Jorden, DukePyramid, and the Denora Development Team). Connected directly to <strong className="text-purple-300">irc.drfun1.com</strong> via TLS 1.3 U-lines under license to Richard Alan Witt (FRN 0034981290). Automatically tracks TLD country demographics, client software censuses via CTCP VERSION, channel message rates, and flushes persistent tables into MariaDB/MySQL (<code className="text-cyan-300 font-mono text-xs">drfun1_denora_stats</code>) to drive <strong className="text-fuchsia-300">stats.drfun1ircd.com</strong> and phpDenora dashboards.
                </p>
              </div>

              <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 font-mono text-xs">
                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-slate-400">Database Engine:</span>
                  <span className="text-cyan-300 font-bold">MariaDB 10.11 InnoDB</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-slate-400">Services Server:</span>
                  <span className="text-fuchsia-300 font-bold">denora.drfun1.com</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-slate-400">Upstream Hub:</span>
                  <span className="text-purple-300 font-bold">irc.drfun1.com:6697</span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <a
                    href="https://github.com/denora/denora.git"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                  </a>
                  <button
                    onClick={() => handleCopy('git clone https://github.com/denora/denora.git', 'gitCloneDenora')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                    title="Copy Git Clone Command"
                  >
                    {copiedKey === 'gitCloneDenora' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>git clone</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Key Telemetry Metrics Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                <span>Peak Clients</span>
                <Users className="w-3.5 h-3.5 text-fuchsia-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                {DENORA_CONFIG.peakUsersAllTime.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-emerald-400">
                All-Time Peak Recorded
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                <span>Peak Today</span>
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
                {DENORA_CONFIG.peakUsersToday.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Peak Window: 14:15 UTC
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                <span>TLD Zones</span>
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
                48 TLDs
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Top: .com (41.6%)
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                <span>Active Channels</span>
                <Hash className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300">
                {DENORA_CONFIG.currentChannels}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Peak: {DENORA_CONFIG.peakChannelsAllTime} Channels
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                <span>MySQL Sync</span>
                <Database className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">
                {DENORA_CONFIG.syncIntervalSeconds}s Interval
              </div>
              <div className="text-[10px] font-mono text-emerald-400">
                InnoDB drfun1_denora
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                <span>Total Connects</span>
                <Activity className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-rose-300">
                3.49M
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Since Epoch Boot
              </div>
            </div>
          </div>

          {/* Interactive Denora StatServ Live Console */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                <Terminal className="w-4 h-4 text-fuchsia-400" />
                <span className="font-bold text-white">Denora StatServ Interactive Diagnostic Console</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">Target: <strong className="text-fuchsia-300">denora.drfun1.com</strong> (SID 098)</span>
              </div>

              {/* Command Quick Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                <span className="text-slate-500 text-[11px] mr-1">Query /msg StatServ:</span>
                {[
                  { cmd: 'STATUS', label: 'STATUS' },
                  { cmd: 'TLD', label: 'TLD' },
                  { cmd: 'CLIENTS', label: 'CLIENTS' },
                  { cmd: 'PEAK', label: 'PEAK' },
                  { cmd: 'CHANSTATS', label: 'CHANSTATS' },
                  { cmd: 'TOPCHATTERS', label: 'TOPCHATTERS' },
                  { cmd: 'SQLSYNC', label: 'SQLSYNC' },
                ].map((item) => (
                  <button
                    key={item.cmd}
                    onClick={() => handleRunDenoraCommand(item.cmd)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                      selectedDenoraCmd === item.cmd
                        ? 'bg-fuchsia-500 text-white font-bold shadow'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Output */}
            <div className="p-4 bg-slate-950 font-mono text-xs space-y-1.5 overflow-x-auto min-h-[220px]">
              <div className="text-slate-500 pb-2 border-b border-slate-900 flex items-center justify-between">
                <span>[Denora Telemetry] Linked to irc.drfun1.com:6697 with MariaDB sync active. Active query: /msg StatServ {selectedDenoraCmd}</span>
                <span className="text-fuchsia-400">https://github.com/denora/denora.git</span>
              </div>
              
              {denoraLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-fuchsia-500 select-none">&gt;</span>
                  <span className={
                    log.includes('===') ? 'text-fuchsia-300 font-bold' :
                    log.includes('End of') ? 'text-emerald-400 font-bold' :
                    log.includes('completed') ? 'text-emerald-300' :
                    log.includes('Database:') ? 'text-cyan-300' :
                    log.includes('1.') || log.includes('2.') ? 'text-white font-medium' :
                    'text-slate-300'
                  }>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Two-Column Analytics Matrix 1: TLD Country Stats & CTCP Client Census */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Column 1: TLD Geographic Demographics */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-mono font-bold text-white text-xs">
                    TLD Country &amp; GeoIP Demographics
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter TLD (.com, .de)..."
                      value={denoraTldFilter}
                      onChange={(e) => setDenoraTldFilter(e.target.value)}
                      className="pl-8 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    {filteredDenoraTlds.length} TLDs
                  </span>
                </div>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredDenoraTlds.map((tld) => (
                  <div key={tld.tld} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{tld.flag}</span>
                        <span className="font-bold text-cyan-300">{tld.tld}</span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[200px]">{tld.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{tld.userCount.toLocaleString()}</span>
                        <span className="text-cyan-400 font-bold">({tld.percentage}%)</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, tld.percentage * 2.2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: CTCP VERSION IRC Client Census */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-fuchsia-400" />
                  <h3 className="font-mono font-bold text-white text-xs">
                    CTCP VERSION IRC Client Census
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-fuchsia-400 bg-fuchsia-950/60 px-2 py-0.5 rounded border border-fuchsia-800/40">
                  Denora Version Tracking
                </span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {DENORA_CONFIG.clientStats.map((client) => {
                  const getCategoryBadge = (cat: string) => {
                    switch (cat) {
                      case 'Desktop':
                        return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
                      case 'CLI':
                        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
                      case 'Web':
                        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
                      case 'Bouncer':
                        return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
                      default:
                        return 'bg-slate-800 text-slate-300 border-slate-700';
                    }
                  };

                  return (
                    <div key={client.clientName} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{client.clientName}</span>
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${getCategoryBadge(client.category)}`}>
                            {client.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-200">{client.userCount.toLocaleString()} clients</span>
                          <span className="text-fuchsia-400 font-bold">({client.percentage}%)</span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-fuchsia-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, client.percentage * 3.2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Two-Column Analytics Matrix 2: ChanStats Activity & Top Chatters Hall of Fame */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* ChanStats Channel Leaderboard */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-mono font-bold text-white text-xs">
                    ChanStats Channel Activity Leaderboard
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Today&apos;s Lines &amp; Words</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                      <th className="pb-2">Channel</th>
                      <th className="pb-2 text-right">Users</th>
                      <th className="pb-2 text-right">Lines</th>
                      <th className="pb-2 text-right">Words</th>
                      <th className="pb-2 text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {DENORA_CONFIG.topChannels.map((ch, idx) => (
                      <tr key={ch.channel} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                          <span className="text-slate-500 text-[10px]">#{idx + 1}</span>
                          <span className="text-emerald-400">{ch.channel}</span>
                        </td>
                        <td className="py-2.5 text-right text-slate-300">
                          {ch.users.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right font-bold text-purple-300">
                          {ch.linesToday.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right text-slate-400">
                          {(ch.wordsToday / 1000).toFixed(0)}k
                        </td>
                        <td className="py-2.5 text-right font-bold text-cyan-400">
                          {ch.msgRate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Chatters Hall of Fame */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h3 className="font-mono font-bold text-white text-xs">
                    Denora Top Chatter Hall of Fame
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-amber-400">Ranked by Lines</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                      <th className="pb-2">User / Operator</th>
                      <th className="pb-2 text-right">Lines</th>
                      <th className="pb-2 text-right">Words</th>
                      <th className="pb-2 text-right">Smileys</th>
                      <th className="pb-2 text-right">Kicks</th>
                      <th className="pb-2 text-right">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {DENORA_CONFIG.topChatters.map((user, idx) => (
                      <tr key={user.nick} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                          <span className="text-amber-400 font-bold text-[10px]">#{idx + 1}</span>
                          <span className="text-white hover:text-amber-300 transition-colors">{user.nick}</span>
                        </td>
                        <td className="py-2.5 text-right font-bold text-fuchsia-300">
                          {user.lines.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right text-slate-400">
                          {(user.words / 1000).toFixed(0)}k
                        </td>
                        <td className="py-2.5 text-right text-emerald-400">
                          {user.smileys}
                        </td>
                        <td className="py-2.5 text-right text-rose-400">
                          {user.kicks}
                        </td>
                        <td className="py-2.5 text-right text-slate-400 text-[10px]">
                          {user.lastActive}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Denora Configuration & Git Build Inspector */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                <Terminal className="w-4 h-4 text-fuchsia-400" />
                <span className="font-bold text-white">Denora 1.5 Configuration &amp; Git Build Inspector</span>
                <span className="text-slate-500">|</span>
                <a
                  href="https://github.com/denora/denora.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <span>github.com/denora/denora.git</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Subtabs selector */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <button
                  onClick={() => setSelectedDenoraConfTab('denora_conf')}
                  className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                    selectedDenoraConfTab === 'denora_conf'
                      ? 'bg-fuchsia-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  denora.conf
                </button>
                <button
                  onClick={() => setSelectedDenoraConfTab('unreal_link')}
                  className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                    selectedDenoraConfTab === 'unreal_link'
                      ? 'bg-fuchsia-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  unrealircd.conf (Link &amp; U-lines)
                </button>
                <button
                  onClick={() => setSelectedDenoraConfTab('mysql_schema')}
                  className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                    selectedDenoraConfTab === 'mysql_schema'
                      ? 'bg-fuchsia-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  denora.sql (MariaDB Schema)
                </button>
                <button
                  onClick={() => setSelectedDenoraConfTab('git_build')}
                  className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                    selectedDenoraConfTab === 'git_build'
                      ? 'bg-fuchsia-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Git Clone &amp; Compile
                </button>
              </div>

              <button
                onClick={() => {
                  const content = selectedDenoraConfTab === 'denora_conf'
                    ? DENORA_CONFIG.confSnippet
                    : selectedDenoraConfTab === 'unreal_link'
                    ? DENORA_CONFIG.unrealLinkSnippet
                    : selectedDenoraConfTab === 'mysql_schema'
                    ? DENORA_CONFIG.sqlSchemaSnippet
                    : `# Git Clone & Compilation Instructions for Denora\ngit clone https://github.com/denora/denora.git\ncd denora\n./configure --prefix=/opt/denora --with-mysql --with-unreal32 --enable-ssl\nmake\nsudo make install\n# Initialize database\nmysql -u denora -p drfun1_denora_stats < /opt/denora/sql/mysql.sql\n# Start Denora\n/opt/denora/bin/denora -f /opt/denora/etc/denora.conf`;
                  handleCopy(content, 'denoraSnippet');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 text-xs font-mono cursor-pointer"
              >
                {copiedKey === 'denoraSnippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Code</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-fuchsia-300 font-mono text-xs overflow-x-auto max-h-[340px] leading-relaxed custom-nav-scrollbar selection:bg-fuchsia-900 selection:text-white">
              {selectedDenoraConfTab === 'denora_conf' && DENORA_CONFIG.confSnippet}
              {selectedDenoraConfTab === 'unreal_link' && DENORA_CONFIG.unrealLinkSnippet}
              {selectedDenoraConfTab === 'mysql_schema' && DENORA_CONFIG.sqlSchemaSnippet}
              {selectedDenoraConfTab === 'git_build' && `# ==============================================================
# Denora 1.5 IRC Statistics Daemon Installation from GitHub
# Source Repository: https://github.com/denora/denora.git
# Authors: Hal9000, Jorden, DukePyramid, and the Denora Development Team
# ==============================================================

# 1. Install prerequisites (Debian/Ubuntu/CentOS/RHEL)
sudo apt update && sudo apt install -y build-essential autoconf automake libtool \\
    libssl-dev libmariadb-dev-compat libmariadb-dev default-mysql-client

# 2. Clone Denora repository from GitHub
git clone https://github.com/denora/denora.git
cd denora

# 3. Configure build for UnrealIRCd protocol with MySQL/MariaDB & OpenSSL
./configure \\
    --prefix=/opt/denora \\
    --with-mysql \\
    --with-unreal32 \\
    --enable-ssl \\
    --enable-geoip

# 4. Compile daemon binary and core modules
make -j$(nproc)

# 5. Install binaries to /opt/denora
sudo make install

# 6. Initialize MariaDB / MySQL Schema for stats.drfun1ircd.com & phpDenora
mysql -h localhost -u denora -p drfun1_denora_stats < /opt/denora/sql/mysql.sql

# 7. Verify version and protocol module
/opt/denora/bin/denora --version
# Output: Denora 1.5.1 (Compiled for UnrealIRCd 6.x Protocol with OpenSSL 3.0 & MariaDB)

# 8. Start Denora daemon with configuration
/opt/denora/bin/denora -f /opt/denora/etc/denora.conf`}
            </pre>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB: NEOSTATS 3.0 MODULAR IRC SERVICES & TELEMETRY (github.com/Macs/NeoStats.git)
          ======================================================== */}
      {activeStatsTab === 'neostats' && (
        <div className="space-y-6">
          {/* NeoStats Hero / Status Banner */}
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>NEOSTATS 3.0.2 STATSERV ACTIVE</span>
                  </span>
                  <a
                    href="https://github.com/Macs/NeoStats.git"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-md text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Official NeoStats Git Repository: https://github.com/Macs/NeoStats.git"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                    <span>github.com/Macs/NeoStats.git</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    SID: 099 &bull; neostats.drfun1.com
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    U-lines Verified
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>NeoStats 3.0.2 Modular IRC Services &amp; StatServ</span>
                  <span className="text-cyan-400 font-mono text-base font-normal">&bull; Linked to irc.drfun1.com:6697</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
                  High-performance modular IRC services and network telemetry engine cloned and built from <strong className="text-white">https://github.com/Macs/NeoStats.git</strong> (developed by Justin &quot;Macs&quot; and the NeoStats Development Team). Connected directly to <strong className="text-cyan-300">irc.drfun1.com</strong> via TLS 1.3 U-lines with StatServ network analytics, ConnectServ routing lag auditor, SecureServ DNSBL drone guard, and WebStats live feeds.
                </p>
              </div>

              <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 font-mono text-xs">
                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-slate-400">Database Engine:</span>
                  <span className="text-cyan-300 font-bold">SQLite3 / TimescaleDB</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-slate-400">Services Server:</span>
                  <span className="text-emerald-300 font-bold">neostats.drfun1.com</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-slate-400">Upstream Hub:</span>
                  <span className="text-purple-300 font-bold">irc.drfun1.com:6697</span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <a
                    href="https://github.com/Macs/NeoStats.git"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                  </a>
                  <button
                    onClick={() => handleCopy('git clone https://github.com/Macs/NeoStats.git', 'gitCloneNeoStats')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                    title="Copy Git Clone Command"
                  >
                    {copiedKey === 'gitCloneNeoStats' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>git clone</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Key Telemetry Metrics Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                <span>Peak Clients</span>
                <Users className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                {NEOSTATS_CONFIG.peakUsers.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-emerald-400">
                All-Time Peak Recorded
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                <span>Channels Tracked</span>
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
                {NEOSTATS_CONFIG.peakChannels}
              </div>
              <div className="text-[10px] font-mono text-cyan-400">
                100% Broadcast Synced
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                <span>Connects Logged</span>
                <Database className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                {NEOSTATS_CONFIG.totalConnectionsLogged.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                TimescaleDB Time-Series
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                <span>NetSplits (30d)</span>
                <Activity className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-sky-300">
                {NEOSTATS_CONFIG.statServMetrics.splitEvents} Splits
              </div>
              <div className="text-[10px] font-mono text-emerald-400">
                Zero Routing Drops
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                <span>DroneBL Blocks</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
                {NEOSTATS_CONFIG.statServMetrics.dnsblBlocks.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                SecureServ Automated
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                <span>NeoStats Uptime</span>
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-indigo-300 truncate" title={NEOSTATS_CONFIG.uptime}>
                {NEOSTATS_CONFIG.uptime}
              </div>
              <div className="text-[10px] font-mono text-emerald-400">
                U-lines Verified
              </div>
            </div>
          </div>

          {/* Core Dynamic Modules Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>NeoStats 3.0 Dynamic Services Modules</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {NEOSTATS_CONFIG.modules.length} Modules Loaded &bull; C Plugin Architecture
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {NEOSTATS_CONFIG.modules.map(mod => (
                <div
                  key={mod.name}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-md hover:border-slate-700 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                        <span className="font-mono font-bold text-white text-sm">
                          {mod.serviceNick}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {mod.name}.so
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {mod.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <div className="text-slate-400 text-[11px]">
                      <span>{mod.commandCount.toLocaleString()} calls</span>
                      <span className="text-slate-600 mx-1.5">&bull;</span>
                      <span>{(mod.memoryUsageKb / 1024).toFixed(1)} MB RAM</span>
                    </div>

                    <button
                      onClick={() => handleRunNeoStatsCommand(
                        mod.name === 'statserv' ? 'STATS' :
                        mod.name === 'connectserv' ? 'CONNECTSERV' :
                        mod.name === 'secureserv' ? 'SECURESERV' :
                        mod.name === 'seenserv' ? 'SEENSERV' : 'MODULES'
                      )}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <Terminal className="w-3 h-3 text-cyan-400" />
                      <span>Query</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive StatServ Command Terminal & Query Inspector */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-mono font-bold text-white text-xs">
                  StatServ Interactive Service Console (/msg StatServ)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  neostats.drfun1.com
                </span>
              </div>

              {/* Command Quick Selector Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-xs">
                {[
                  { cmd: 'STATS', label: 'STATS' },
                  { cmd: 'PEAK', label: 'PEAK' },
                  { cmd: 'CHANS', label: 'CHANS' },
                  { cmd: 'CONNECTSERV', label: 'ConnectServ LAG' },
                  { cmd: 'SECURESERV', label: 'SecureServ SENTRY' },
                  { cmd: 'SEENSERV', label: 'SeenServ SEEN' },
                  { cmd: 'MODULES', label: 'MODULES' }
                ].map(item => (
                  <button
                    key={item.cmd}
                    onClick={() => handleRunNeoStatsCommand(item.cmd)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      selectedNeoStatsCmd === item.cmd
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                <button
                  onClick={() => handleCopy(neoStatsLogs.join('\n'), 'neoStatsLogs')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1 cursor-pointer ml-1"
                  title="Copy Console Output"
                >
                  {copiedKey === 'neoStatsLogs' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Terminal Output Area */}
            <pre className="p-4 bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto min-h-[160px] max-h-[280px] leading-relaxed custom-nav-scrollbar selection:bg-cyan-900 selection:text-white">
              {neoStatsLogs.map((line, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-600 select-none">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
                  <span className={line.includes('===') ? 'text-amber-400 font-bold' : line.includes('Active') || line.includes('Peak') ? 'text-emerald-300 font-semibold' : 'text-cyan-200'}>
                    {line}
                  </span>
                </div>
              ))}
            </pre>
          </div>

          {/* 24-Hour Connection Volume Chart */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-mono font-bold text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span>24-Hour Global Connection Frequency (NeoStats Timescale Engine)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Hourly client connect activity curve logged across all 26 Switch SUPERNAP leaf nodes via NeoStats StatServ.
                </p>
              </div>
              <div className="text-right font-mono text-xs text-slate-400">
                Peak Hour: <strong className="text-cyan-400">18:00 UTC (8,838 clients)</strong>
              </div>
            </div>

            {/* SVG Hourly Bar Chart */}
            <div className="relative h-44 sm:h-52 w-full pt-4">
              <svg className="w-full h-full" viewBox="0 0 800 160" preserveAspectRatio="none">
                {/* Horizontal Guide Lines */}
                <line x1="0" y1="40" x2="800" y2="40" stroke="#334155" strokeDasharray="3,3" strokeWidth="1" />
                <line x1="0" y1="80" x2="800" y2="80" stroke="#334155" strokeDasharray="3,3" strokeWidth="1" />
                <line x1="0" y1="120" x2="800" y2="120" stroke="#334155" strokeDasharray="3,3" strokeWidth="1" />

                {/* Bars */}
                {NEOSTATS_CONFIG.statServMetrics.hourlyConnects.map((val, idx) => {
                  const maxVal = 9000;
                  const barHeight = Math.max(6, (val / maxVal) * 130);
                  const x = idx * (800 / 24) + 6;
                  const barWidth = 800 / 24 - 12;
                  const y = 145 - barHeight;
                  const isPeak = val > 8000;

                  return (
                    <g key={idx} className="group cursor-pointer">
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="3"
                        fill={isPeak ? '#06b6d4' : '#6366f1'}
                        opacity={isPeak ? 0.95 : 0.75}
                        className="transition-all hover:opacity-100 hover:fill-cyan-300"
                      />
                      <text
                        x={x + barWidth / 2}
                        y="158"
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="ui-monospace, monospace"
                      >
                        {idx < 10 ? `0${idx}` : idx}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                  <span>Standard Traffic</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
                  <span>Broadcast Peak (&gt;8,000 Connects)</span>
                </span>
              </div>
              <span className="text-slate-500">Source: SQLite / TimescaleDB Engine</span>
            </div>
          </div>

          {/* Two-Column Matrix: Top Channels & Top NetAdmin Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Channels Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-mono font-bold text-white text-xs flex items-center gap-2">
                  <Hash className="w-4 h-4 text-cyan-400" />
                  <span>Top Active Channels by Message Velocity</span>
                </h4>
                <span className="text-[10px] font-mono text-cyan-400">Real-Time StatServ</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                      <th className="pb-2">Channel</th>
                      <th className="pb-2 text-right">Users</th>
                      <th className="pb-2 text-right">Message Rate</th>
                      <th className="pb-2 text-right">Sync</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {NEOSTATS_CONFIG.statServMetrics.topChannels.map(ch => (
                      <tr key={ch.channel} className="hover:bg-slate-800/40 transition">
                        <td className="py-2 font-bold text-white flex items-center gap-1.5">
                          <span className="text-cyan-400">#</span>
                          <span>{ch.channel.replace('#', '')}</span>
                        </td>
                        <td className="py-2 text-right text-slate-300">
                          {ch.users.toLocaleString()}
                        </td>
                        <td className="py-2 text-right font-bold text-emerald-400">
                          {ch.msgRate}
                        </td>
                        <td className="py-2 text-right">
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                            100G
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Oper Activity Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-mono font-bold text-white text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>NetAdmin &amp; Sentry Activity Audit</span>
                </h4>
                <span className="text-[10px] font-mono text-emerald-400">OperServ / SecureServ</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                      <th className="pb-2">Operator Nick</th>
                      <th className="pb-2">Origin Server</th>
                      <th className="pb-2 text-right">Actions</th>
                      <th className="pb-2 text-right">Rank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {NEOSTATS_CONFIG.statServMetrics.topOpers.map(op => (
                      <tr key={op.nick} className="hover:bg-slate-800/40 transition">
                        <td className="py-2 font-bold text-purple-300 flex items-center gap-1.5">
                          <span>~</span>
                          <span>{op.nick}</span>
                        </td>
                        <td className="py-2 text-slate-400 text-[11px] truncate max-w-[140px]">
                          {op.server}
                        </td>
                        <td className="py-2 text-right font-bold text-amber-400">
                          {op.actions}
                        </td>
                        <td className="py-2 text-right">
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px]">
                            NetAdmin
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Production Configuration & Build Center */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" />
                <span className="font-mono font-bold text-white text-xs">
                  NeoStats 3.0 Production Config &amp; Git Build Architecture
                </span>
              </div>

              {/* Snippet Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800 font-mono text-xs">
                <button
                  onClick={() => setSelectedNeoStatsConfTab('neostats_conf')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    selectedNeoStatsConfTab === 'neostats_conf'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  neostats.conf
                </button>
                <button
                  onClick={() => setSelectedNeoStatsConfTab('unreal_link')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    selectedNeoStatsConfTab === 'unreal_link'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  UnrealIRCd Link Block
                </button>
                <button
                  onClick={() => setSelectedNeoStatsConfTab('git_build')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    selectedNeoStatsConfTab === 'git_build'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Git Clone &amp; Compile
                </button>
              </div>

              <button
                onClick={() => {
                  const content = selectedNeoStatsConfTab === 'neostats_conf'
                    ? NEOSTATS_CONFIG.confSnippet
                    : selectedNeoStatsConfTab === 'unreal_link'
                    ? NEOSTATS_CONFIG.unrealLinkSnippet
                    : `# Git Clone & Compilation Instructions for NeoStats 3.0\ngit clone https://github.com/Macs/NeoStats.git\ncd NeoStats\n./configure --prefix=/opt/neostats --enable-epoll --with-unreal --with-openssl\nmake\nsudo make install\n# Verify binary\n/opt/neostats/bin/neostats -v`;
                  handleCopy(content, 'neoStatsSnippet');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 text-xs font-mono cursor-pointer"
              >
                {copiedKey === 'neoStatsSnippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Code</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto max-h-[320px] leading-relaxed custom-nav-scrollbar selection:bg-cyan-900 selection:text-white">
              {selectedNeoStatsConfTab === 'neostats_conf' && NEOSTATS_CONFIG.confSnippet}
              {selectedNeoStatsConfTab === 'unreal_link' && NEOSTATS_CONFIG.unrealLinkSnippet}
              {selectedNeoStatsConfTab === 'git_build' && `# ==============================================================
# NeoStats 3.0 Installation from Official Git Repository
# Source Repository: https://github.com/Macs/NeoStats.git
# Authors: Justin "Macs" and the NeoStats Development Team
# ==============================================================

# 1. Install prerequisites (Debian/Ubuntu/CentOS/RHEL)
sudo apt update && sudo apt install -y build-essential autoconf automake libtool libssl-dev libsqlite3-dev

# 2. Clone NeoStats repository from GitHub
git clone https://github.com/Macs/NeoStats.git
cd NeoStats

# 3. Configure build for UnrealIRCd protocol with epoll event loop & OpenSSL
./configure \\
    --prefix=/opt/neostats \\
    --enable-epoll \\
    --with-unreal \\
    --with-openssl \\
    --with-sqlite3

# 4. Compile dynamic service modules (StatServ, ConnectServ, SecureServ, SeenServ, WebStats)
make -j$(nproc)

# 5. Install to /opt/neostats
sudo make install

# 6. Verify binary version and linked modules
/opt/neostats/bin/neostats --version
# Output: NeoStats 3.0.2 (Protocol: UnrealIRCd 6.1.x, SSL: OpenSSL 3.0)

# 7. Start daemon in foreground for test
/opt/neostats/bin/neostats -n -f /opt/neostats/etc/neostats.conf`}
            </pre>
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
                  <span className="text-slate-400">Telemetry Daemon:</span>
                  <a
                    href="https://github.com/Macs/NeoStats.git"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                  >
                    <span>NeoStats 3.0 (SID 099)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
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
