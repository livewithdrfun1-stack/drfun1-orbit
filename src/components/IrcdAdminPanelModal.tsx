/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 */

import React, { useState } from 'react';
import { 
  AnopeRankLevel, 
  UnrealIrcdConfigOptions, 
  ChanServChannel, 
  NickServAccount, 
  BotServBot, 
  HostServVHost, 
  OperServEntry, 
  OperAuditLog 
} from '../types/ircdAdmin';
import { 
  ANOPE_RANKS, 
  DJ_PERMISSION_MATRIX, 
  INITIAL_UNREAL_CONFIG, 
  INITIAL_CHANSERV_CHANNELS, 
  INITIAL_NICKSERV_ACCOUNTS, 
  INITIAL_BOTSERV_BOTS, 
  INITIAL_HOSTSERV_VHOSTS, 
  INITIAL_OPERSERV_DATA, 
  INITIAL_OPER_LOGS 
} from '../data/ircdAdminData';
import { 
  X, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Crown, 
  Key, 
  Award, 
  Volume2, 
  User, 
  Server, 
  Terminal, 
  Radio, 
  Headphones, 
  Layers, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Play, 
  Check, 
  Copy, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Zap, 
  Send, 
  Cpu, 
  Globe, 
  Sliders,
  ExternalLink,
  ChevronRight,
  Info,
  Scale
} from 'lucide-react';

interface IrcdAdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRank: AnopeRankLevel;
  onRankChange: (rank: AnopeRankLevel) => void;
  onNavigateToMpd?: () => void;
  onNavigateToIrc?: () => void;
}

export const IrcdAdminPanelModal: React.FC<IrcdAdminPanelModalProps> = ({
  isOpen,
  onClose,
  activeRank,
  onRankChange,
  onNavigateToMpd,
  onNavigateToIrc,
}) => {
  if (!isOpen) return null;

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<'ircd_options' | 'anope_services' | 'ops_control' | 'dj_matrix' | 'wittlaw_governance'>('ircd_options');

  // Sub-tabs
  const [anopeSubTab, setAnopeSubTab] = useState<'ranks' | 'chanserv' | 'nickserv' | 'operserv' | 'botserv' | 'hostserv'>('ranks');
  const [ircdSubTab, setIrcdSubTab] = useState<'server' | 'antiflood' | 'listen' | 'oper_blocks' | 'links' | 'bans' | 'raw_conf'>('server');

  // Server state
  const [unrealConfig, setUnrealConfig] = useState<UnrealIrcdConfigOptions>(INITIAL_UNREAL_CONFIG);
  const [channels, setChannels] = useState<ChanServChannel[]>(INITIAL_CHANSERV_CHANNELS);
  const [selectedChanIndex, setSelectedChanIndex] = useState<number>(0);
  const [nickAccounts, setNickAccounts] = useState<NickServAccount[]>(INITIAL_NICKSERV_ACCOUNTS);
  const [bots, setBots] = useState<BotServBot[]>(INITIAL_BOTSERV_BOTS);
  const [vhosts, setVhosts] = useState<HostServVHost[]>(INITIAL_HOSTSERV_VHOSTS);
  const [operServData, setOperServData] = useState<OperServEntry>(INITIAL_OPERSERV_DATA);
  const [auditLogs, setAuditLogs] = useState<OperAuditLog[]>(INITIAL_OPER_LOGS);

  // Command console state
  const [consoleInput, setConsoleInput] = useState<string>('');
  const [consoleHistory, setConsoleHistory] = useState<string[]>([
    '*** UnrealIRCd 6.1.4drfun1 Control Shell initialized. Type /help for available oper commands.',
    '*** Synced with Anope IRC Services 2.1.2 at services.drfun1.com (SID 00A).',
    '*** Active TLS 1.3 handshake verified with ECDHE-ECDSA-AES256-GCM-SHA384.',
  ]);

  // Form inputs for quick oper actions
  const [newBanType, setNewBanType] = useState<'KLINE' | 'GLINE' | 'ZLINE' | 'SHUN'>('KLINE');
  const [newBanMask, setNewBanMask] = useState<string>('*@192.0.2.15');
  const [newBanReason, setNewBanReason] = useState<string>('Protocol violation / excessive flooding');
  const [quickWallopsMsg, setQuickWallopsMsg] = useState<string>('');
  const [copiedConf, setCopiedConf] = useState<boolean>(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Active rank definition
  const currentRankDef = ANOPE_RANKS.find(r => r.id === activeRank) || ANOPE_RANKS[0];
  const isOpsAndAbove = currentRankDef.isOpsAndAbove;

  // Selected channel in ChanServ
  const activeChan = channels[selectedChanIndex] || channels[0];

  const triggerNotice = (msg: string) => {
    setActionSuccessNotice(msg);
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  // Execute terminal oper command
  const handleExecuteCommand = (cmdToRun?: string) => {
    const rawCmd = (cmdToRun || consoleInput).trim();
    if (!rawCmd) return;

    if (!isOpsAndAbove) {
      setConsoleHistory(prev => [
        ...prev,
        `> ${rawCmd}`,
        `*** PERMISSION DENIED: Command '${rawCmd}' requires Channel Operator (@ / Level 500+) or Anope Oper credentials. Current rank: ${currentRankDef.name} (Level ${currentRankDef.accessLevel}).`,
      ]);
      setConsoleInput('');
      return;
    }

    const upper = rawCmd.toUpperCase();
    const parts = rawCmd.split(' ');
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    let responseMsg = '';
    let logStatus: 'success' | 'denied' | 'error' = 'success';

    if (upper.startsWith('/REHASH -TLS')) {
      responseMsg = '*** UnrealIRCd: Reloading TLS 1.3 certificates and private keys from /etc/unrealircd/tls/... Rehash complete without dropping connections.';
      triggerNotice('UnrealIRCd TLS 1.3 certificates rehashed successfully');
    } else if (upper.startsWith('/REHASH')) {
      responseMsg = '*** UnrealIRCd: Re-reading unrealircd.conf and include files... Configuration loaded cleanly. 4 listen ports active. 3 hub-and-leaf links verified.';
      triggerNotice('UnrealIRCd configuration reloaded');
    } else if (upper.startsWith('/WALLOPS ') || upper.startsWith('/GLOBOPS ')) {
      const msg = rawCmd.slice(parts[0].length).trim();
      responseMsg = `*** WALLOPS from ${currentRankDef.name}: ${msg}`;
      setOperServData(prev => ({
        ...prev,
        globalWallopsLog: [{ timestamp: nowStr, oper: currentRankDef.name, message: msg }, ...prev.globalWallopsLog]
      }));
      triggerNotice('Global Wallops transmitted to all operators and network channels');
    } else if (upper.startsWith('/KLINE ') || upper.startsWith('/ZLINE ') || upper.startsWith('/GLINE ') || upper.startsWith('/SHUN ')) {
      const bType = parts[0].slice(1).toUpperCase() as 'KLINE' | 'GLINE' | 'ZLINE' | 'SHUN';
      const targetMask = parts[1] || '*@192.0.2.99';
      const reason = parts.slice(2).join(' ') || 'Banned by operator command';
      setUnrealConfig(prev => ({
        ...prev,
        banRules: [
          {
            id: `ban-${Date.now()}`,
            type: bType,
            mask: targetMask,
            reason: reason,
            setBy: currentRankDef.name,
            expiresIn: '7d',
            active: true
          },
          ...prev.banRules
        ]
      }));
      responseMsg = `*** ${bType} placed on ${targetMask} (${reason}) - Activated immediately across all peering leaf nodes.`;
      triggerNotice(`${bType} placed on ${targetMask}`);
    } else if (upper.startsWith('/CHANSERV MLOCK ') || upper.startsWith('/CS MLOCK ')) {
      const newModes = parts[parts.length - 1];
      setChannels(prev => prev.map((ch, idx) => idx === selectedChanIndex ? { ...ch, mlock: newModes } : ch));
      responseMsg = `*** ChanServ: Mode lock for ${activeChan.channel} updated to ${newModes}.`;
      triggerNotice(`MLOCK updated for ${activeChan.channel}`);
    } else if (upper.startsWith('/STATS')) {
      responseMsg = `*** Stats for irc.drfun1.com: Up 42d 18h | 1,842 clients online | 482 channels | Memory 142MB | Switch Colocation SUPERNAP Las Vegas`;
    } else if (upper.startsWith('/HELP')) {
      responseMsg = `*** Available Oper Commands: /REHASH, /REHASH -TLS, /WALLOPS <msg>, /KLINE <mask> <reason>, /ZLINE <ip>, /GLINE <mask>, /SHUN <mask>, /CHANSERV MLOCK <#chan> <modes>, /KILL <nick> <reason>, /STATS`;
    } else {
      responseMsg = `*** Command acknowledged: ${rawCmd} [Executed under rank: ${currentRankDef.name}]`;
    }

    setAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        operNick: currentRankDef.name,
        operRank: activeRank,
        command: rawCmd,
        status: logStatus,
        details: responseMsg.replace('*** ', ''),
      },
      ...prev
    ]);

    setConsoleHistory(prev => [
      ...prev,
      `> ${rawCmd}`,
      responseMsg,
    ]);
    setConsoleInput('');
  };

  // Add new ban rule
  const handleAddBan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOpsAndAbove) return;
    if (!newBanMask.trim()) return;

    const newRule = {
      id: `ban-${Date.now()}`,
      type: newBanType,
      mask: newBanMask.trim(),
      reason: newBanReason.trim() || 'Operator policy enforcement',
      setBy: currentRankDef.name,
      expiresIn: '7d',
      active: true,
    };

    setUnrealConfig(prev => ({
      ...prev,
      banRules: [newRule, ...prev.banRules]
    }));

    handleExecuteCommand(`/${newBanType} ${newBanMask.trim()} ${newBanReason.trim()}`);
    setNewBanMask('');
  };

  const handleRemoveBan = (id: string) => {
    if (!isOpsAndAbove) return;
    setUnrealConfig(prev => ({
      ...prev,
      banRules: prev.banRules.filter(b => b.id !== id)
    }));
    triggerNotice('Ban rule removed from UnrealIRCd active tables');
  };

  // Generate complete unrealircd.conf
  const generateUnrealConf = (): string => {
    return `/*
 * UnrealIRCd 6.1.4 Configuration File
 * Host: ${unrealConfig.serverName} (SID: ${unrealConfig.sid})
 * Network: ${unrealConfig.networkName}
 * Licensed to: Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * Colocation: Switch SUPERNAP (www.switch.com) | Transit: RisingNet (www.risingnet.com)
 */

me {
    name "${unrealConfig.serverName}";
    info "DrFun1 Orbit Satcom & MPD Broadcast Mesh";
    sid "${unrealConfig.sid}";
}

admin {
    "${unrealConfig.adminContact}";
    "Richard Alan Witt LLC - Spectrum & Communications Law";
}

class clients {
    pingfreq ${unrealConfig.pingFrequency};
    maxclients ${unrealConfig.maxClients};
    sendq 200k;
    recvq 8000;
}

class opers {
    pingfreq 60;
    maxclients 50;
    sendq 1M;
    recvq 32k;
}

class servers {
    pingfreq 30;
    maxclients 20;
    sendq 10M;
    recvq 5M;
}

allow {
    ip "*@*";
    class clients;
    maxperip 10;
}

/* Listen Ports (TLS 1.3, WebSocket, Plaintext) */
${unrealConfig.listenBlocks.map(l => `listen {
    ip "${l.ip}";
    port ${l.port};
    options {
        ${l.tls ? 'tls;' : ''}
        ${l.webSocket ? 'websocket;' : ''}
    }
}`).join('\n')}

/* Operator Blocks */
${unrealConfig.operBlocks.map(o => `oper ${o.name} {
    class ${o.operClass};
    mask "*@*";
    swhois "${o.swhois}";
    vhost "${o.vhost}";
    snomask "${o.snomask}";
    flags {
        local;
        global;
        ${o.operClass === 'netadmin' ? 'netadmin;\n        services-admin;' : 'oper;'}
    }
}`).join('\n')}

/* Anti-Flood & Protection Shield */
set {
    network-name "${unrealConfig.networkName}";
    default-server "${unrealConfig.serverName}";
    services-server "services.drfun1.com";
    stats-server "stats.drfun1.com";
    help-channel "#orbit-ops";
    hiddenhost-prefix "drfun1";
    cloak-keys {
        "${unrealConfig.cloakKey1}";
        "${unrealConfig.cloakKey2}";
        "${unrealConfig.cloakKey3}";
    }
    anti-flood {
        join-flood "${unrealConfig.antiFlood.joinThrottle}";
        nick-flood "${unrealConfig.antiFlood.nickFlood}";
        away-flood "${unrealConfig.antiFlood.awayFlood}";
        msg-flood "${unrealConfig.antiFlood.msgFlood}";
        connect-flood "${unrealConfig.antiFlood.connectFlood}";
        handshake-timeout ${unrealConfig.antiFlood.handshakeTimeout};
        max-unknown-connections ${unrealConfig.antiFlood.maxUnknownConnections};
    }
    modes-on-connect "${unrealConfig.modesOnConnect}";
    maxchannelsperuser ${unrealConfig.maxChannelsPerUser};
}

/* Dedicated Peering Mesh Links (Switch / RisingNet) */
${unrealConfig.linkBlocks.map(lk => `link ${lk.name} {
    incoming {
        mask "*@*";
    }
    outgoing {
        hostname "${lk.hostname}";
        port ${lk.port};
        options {
            ${lk.tls ? 'tls;' : ''}
            ${lk.compression ? 'zip;' : ''}
        }
    }
    class servers;
}`).join('\n')}
`;
  };

  const copyConfigToClipboard = () => {
    navigator.clipboard.writeText(generateUnrealConf()).then(() => {
      setCopiedConf(true);
      setTimeout(() => setCopiedConf(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* ========================================================
            MODAL HEADER: Brand, Realtime Oper Rank Selector, & Close
            ======================================================== */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  IRCD &amp; Anope Services Control Center
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  UnrealIRCd 6.1.4
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold hidden sm:inline">
                  Anope 2.1.2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                irc.drfun1.com:6697 • Dedicated Switch Colocation &amp; RisingNet Mesh • Richard Alan Witt LLC
              </p>
            </div>
          </div>

          {/* Quick Oper Rank Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                Active Oper Rank:
                <span className={`px-1.5 py-0.2 rounded font-bold border ${currentRankDef.badgeColor}`}>
                  {currentRankDef.prefix ? `${currentRankDef.prefix} ` : ''}{currentRankDef.name.split(' (')[0]} (Lvl {currentRankDef.accessLevel})
                </span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {isOpsAndAbove ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Ops &amp; Above Authorized
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Below Ops (Read-Only)
                  </span>
                )}
              </span>
            </div>

            <div className="relative">
              <select
                aria-label="Simulate Anope Oper Rank"
                value={activeRank}
                onChange={(e) => {
                  const newRank = e.target.value as AnopeRankLevel;
                  onRankChange(newRank);
                  triggerNotice(`Simulated rank switched to ${ANOPE_RANKS.find(r => r.id === newRank)?.name}`);
                }}
                className="bg-slate-800 text-white font-mono text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 hover:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                {ANOPE_RANKS.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.prefix ? `${r.prefix} ` : ''}{r.name} [Lvl {r.accessLevel}] {r.isOpsAndAbove ? '★ Ops+' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action success alert banner */}
        {actionSuccessNotice && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-4 py-2 flex items-center justify-between text-xs text-emerald-300 font-mono animate-fadeIn">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              {actionSuccessNotice}
            </span>
            <span className="text-[10px] text-emerald-400/80">Command Committed</span>
          </div>
        )}

        {/* Ops and Above Status Banner if not Ops */}
        {!isOpsAndAbove && (
          <div className="bg-amber-950/60 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2 font-sans">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Notice:</strong> You are currently testing with rank <strong>{currentRankDef.name}</strong> (Access Level {currentRankDef.accessLevel}). Administrative operations, live server rehash, Akills, and MPD Station DJ broadcast require <strong>Ops and Above</strong> (Channel Operator @ / +o, Level 500+).
              </span>
            </div>
            <button
              onClick={() => onRankChange('op')}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-sm"
            >
              Elevate to Channel Op (@)
            </button>
          </div>
        )}

        {/* ========================================================
            NAVIGATION TABS (4 Main Sections)
            ======================================================== */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          
          <button
            onClick={() => setActiveTab('ircd_options')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'ircd_options'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Server className="w-4 h-4 text-sky-400" />
            <span>UnrealIRCd Options &amp; Config</span>
          </button>

          <button
            onClick={() => setActiveTab('anope_services')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'anope_services'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Anope IRC Services &amp; Ranks</span>
          </button>

          <button
            onClick={() => setActiveTab('ops_control')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'ops_control'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Ops &amp; Above Web Control</span>
            {isOpsAndAbove ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ) : (
              <Lock className="w-3 h-3 text-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('dj_matrix')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'dj_matrix'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Radio className="w-4 h-4 text-amber-400" />
            <span>MPD Bot DJ Rank Matrix</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
              Ops Tier
            </span>
          </button>

          <button
            onClick={() => setActiveTab('wittlaw_governance')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'wittlaw_governance'
                ? 'border-red-500 text-red-400 bg-red-500/10 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Scale className="w-4 h-4 text-red-400" />
            <span>Witt Law Firm NetAdmin Authority</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold">
              ~ Owner / www.wittlawfirm.com
            </span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: UNREALIRCD OPTIONS & CONFIGURATION
            ======================================================== */}
        {activeTab === 'ircd_options' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sub-navigation bar */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs font-mono">
              <button
                onClick={() => setIrcdSubTab('server')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  ircdSubTab === 'server'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                1. Server &amp; Cloaking
              </button>
              <button
                onClick={() => setIrcdSubTab('antiflood')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  ircdSubTab === 'antiflood'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                2. Anti-Flood &amp; Security
              </button>
              <button
                onClick={() => setIrcdSubTab('listen')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  ircdSubTab === 'listen'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                3. Listen Ports ({unrealConfig.listenBlocks.length})
              </button>
              <button
                onClick={() => setIrcdSubTab('oper_blocks')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  ircdSubTab === 'oper_blocks'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                4. Oper Blocks ({unrealConfig.operBlocks.length})
              </button>
              <button
                onClick={() => setIrcdSubTab('links')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  ircdSubTab === 'links'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                5. Mesh Links ({unrealConfig.linkBlocks.length})
              </button>
              <button
                onClick={() => setIrcdSubTab('bans')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  ircdSubTab === 'bans'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                6. Ban Rules ({unrealConfig.banRules.length})
              </button>
              <button
                onClick={() => setIrcdSubTab('raw_conf')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  ircdSubTab === 'raw_conf'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                7. View unrealircd.conf
              </button>
            </div>

            {/* Sub-tab contents */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* 1. Server & Cloaking */}
              {ircdSubTab === 'server' && (
                <div className="space-y-6">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Server className="w-4 h-4 text-sky-400" />
                      Core UnrealIRCd Parameters
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Parameters configured inside the UnrealIRCd <code className="text-sky-300 font-mono">me &#123;&#125;</code>, <code className="text-sky-300 font-mono">admin &#123;&#125;</code>, and <code className="text-sky-300 font-mono">set &#123;&#125;</code> blocks.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Server FQDN (me::name)</label>
                        <input
                          type="text"
                          value={unrealConfig.serverName}
                          onChange={(e) => setUnrealConfig({ ...unrealConfig, serverName: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Server ID (me::sid)</label>
                        <input
                          type="text"
                          value={unrealConfig.sid}
                          onChange={(e) => setUnrealConfig({ ...unrealConfig, sid: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Network Name (set::network-name)</label>
                        <input
                          type="text"
                          value={unrealConfig.networkName}
                          onChange={(e) => setUnrealConfig({ ...unrealConfig, networkName: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Max Clients (class::clients)</label>
                        <input
                          type="number"
                          value={unrealConfig.maxClients}
                          onChange={(e) => setUnrealConfig({ ...unrealConfig, maxClients: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Max Channels Per User</label>
                        <input
                          type="number"
                          value={unrealConfig.maxChannelsPerUser}
                          onChange={(e) => setUnrealConfig({ ...unrealConfig, maxChannelsPerUser: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Modes on Connect</label>
                        <input
                          type="text"
                          value={unrealConfig.modesOnConnect}
                          onChange={(e) => setUnrealConfig({ ...unrealConfig, modesOnConnect: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cloaking Keys */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Key className="w-4 h-4 text-purple-400" />
                      Host Cloaking Keys (set::cloak-keys)
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Three independent secret keys used by UnrealIRCd to generate unguessable masked IP addresses (<code className="text-purple-300 font-mono">drfun1-XXXXXX.IP</code>) for user privacy.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Cloak Key 1</label>
                        <input
                          type="password"
                          value={unrealConfig.cloakKey1}
                          onChange={(e) => setUnrealConfig({ ...unrealConfig, cloakKey1: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Cloak Key 2</label>
                        <input
                          type="password"
                          value={unrealConfig.cloakKey2}
                          onChange={(e) => setUnrealConfig({ ...unrealConfig, cloakKey2: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Cloak Key 3</label>
                        <input
                          type="password"
                          value={unrealConfig.cloakKey3}
                          onChange={(e) => setUnrealConfig({ ...unrealConfig, cloakKey3: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Anti-Flood & Security */}
              {ircdSubTab === 'antiflood' && (
                <div className="space-y-6">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      UnrealIRCd Anti-Flood Mitigation Engine (set::anti-flood)
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Hardened parameters protecting against bot floods, clone connections, spam attacks, and channel takeover scripts.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Join Throttle (joins:seconds)</label>
                        <input
                          type="text"
                          value={unrealConfig.antiFlood.joinThrottle}
                          onChange={(e) => setUnrealConfig({
                            ...unrealConfig,
                            antiFlood: { ...unrealConfig.antiFlood, joinThrottle: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Default: 3:10 (Max 3 joins in 10s)</span>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Nick Flood (changes:seconds)</label>
                        <input
                          type="text"
                          value={unrealConfig.antiFlood.nickFlood}
                          onChange={(e) => setUnrealConfig({
                            ...unrealConfig,
                            antiFlood: { ...unrealConfig.antiFlood, nickFlood: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Default: 3:10 (Max 3 nick changes in 10s)</span>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Message Flood (msgs:seconds)</label>
                        <input
                          type="text"
                          value={unrealConfig.antiFlood.msgFlood}
                          onChange={(e) => setUnrealConfig({
                            ...unrealConfig,
                            antiFlood: { ...unrealConfig.antiFlood, msgFlood: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Default: 10:10 (Target auto-muted on spike)</span>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Connect Flood (conns:seconds)</label>
                        <input
                          type="text"
                          value={unrealConfig.antiFlood.connectFlood}
                          onChange={(e) => setUnrealConfig({
                            ...unrealConfig,
                            antiFlood: { ...unrealConfig.antiFlood, connectFlood: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Rate-limit per IP block</span>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Handshake Timeout (seconds)</label>
                        <input
                          type="number"
                          value={unrealConfig.antiFlood.handshakeTimeout}
                          onChange={(e) => setUnrealConfig({
                            ...unrealConfig,
                            antiFlood: { ...unrealConfig.antiFlood, handshakeTimeout: Number(e.target.value) }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Drops slowloris probes</span>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Max Unknown Connections</label>
                        <input
                          type="number"
                          value={unrealConfig.antiFlood.maxUnknownConnections}
                          onChange={(e) => setUnrealConfig({
                            ...unrealConfig,
                            antiFlood: { ...unrealConfig.antiFlood, maxUnknownConnections: Number(e.target.value) }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Global handshake ceiling</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Listen Ports */}
              {ircdSubTab === 'listen' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-400" />
                        Active Listen Blocks (UnrealIRCd 6.x)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Configured ports for standard IRC, TLS 1.3 encryption, WebSockets, and inter-server leaf synchronization.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unrealConfig.listenBlocks.map(block => (
                      <div key={block.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-base font-bold text-white flex items-center gap-2">
                              {block.ip}:{block.port}
                              {block.tls && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  TLS 1.3
                                </span>
                              )}
                              {block.webSocket && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                  WebSocket
                                </span>
                              )}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${block.active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                          </div>
                          <p className="text-xs text-slate-300 mb-3">{block.description}</p>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
                          <span>Status: {block.active ? 'LISTENING (Active)' : 'DISABLED'}</span>
                          <span className="text-slate-400">ECDHE-ECDSA-AES256</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Oper Blocks */}
              {ircdSubTab === 'oper_blocks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        Operator (oper) Authorization Blocks
                      </h3>
                      <p className="text-xs text-slate-400">
                        Privileged administrative credentials configured in unrealircd.conf.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {unrealConfig.operBlocks.map(oper => (
                      <div key={oper.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-bold text-white">{oper.name}</span>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold uppercase">
                              Class: {oper.operClass}
                            </span>
                            {oper.sslOnly && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                TLS REQUIRED
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-slate-400">
                            snomask: <code className="text-emerald-400">{oper.snomask}</code>
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400 mt-2">
                          <div>
                            <span className="text-slate-400">Virtual Host (vhost): </span>
                            <span className="text-purple-300 font-semibold">{oper.vhost}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Special Whois (swhois): </span>
                            <span className="text-slate-300">{oper.swhois}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Mesh Links */}
              {ircdSubTab === 'links' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-400" />
                    Hub-and-Leaf Peering Link Blocks
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    {unrealConfig.linkBlocks.map(link => (
                      <div key={link.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-white truncate">{link.name.split('.')[0]}</span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                              {link.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px] space-y-1 mb-3">
                            <div>Target: {link.hostname}:{link.port}</div>
                            <div>Topology: {link.leafOrHub.toUpperCase()}</div>
                            <div>Protocol: TLS + ZIP</div>
                          </div>
                        </div>
                        <div className="border-t border-slate-800 pt-2 text-[10px] text-emerald-400">
                          {link.lastSync}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Ban Rules */}
              {ircdSubTab === 'bans' && (
                <div className="space-y-6">
                  {/* Active Bans Table */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-red-400" />
                        Active KLINE, ZLINE, GLINE &amp; SHUN Rules
                      </span>
                      <span className="text-xs font-mono text-slate-400">{unrealConfig.banRules.length} rules active</span>
                    </h3>

                    <div className="space-y-2 mt-4 font-mono text-xs">
                      {unrealConfig.banRules.map(b => (
                        <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              b.type === 'ZLINE' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                              b.type === 'GLINE' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                              b.type === 'SHUN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                              'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            }`}>
                              {b.type}
                            </span>
                            <div>
                              <div className="text-white font-semibold">{b.mask}</div>
                              <div className="text-slate-400 text-[11px]">{b.reason}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                              <div>Set by: <span className="text-slate-300">{b.setBy}</span></div>
                              <div>Expires: <span className="text-amber-400">{b.expiresIn}</span></div>
                            </div>
                            {isOpsAndAbove && (
                              <button
                                onClick={() => handleRemoveBan(b.id)}
                                className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                title="Remove ban"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Ban Form (Ops and Above) */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider font-mono flex items-center gap-2">
                      <Plus className="w-3.5 h-3.5 text-sky-400" />
                      Add Network Ban Rule (Ops &amp; Above Action)
                    </h4>
                    
                    {isOpsAndAbove ? (
                      <form onSubmit={handleAddBan} className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1">Type</label>
                          <select
                            value={newBanType}
                            onChange={(e) => setNewBanType(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          >
                            <option value="KLINE">K:Line (Host Ban)</option>
                            <option value="GLINE">G:Line (Global Network Ban)</option>
                            <option value="ZLINE">Z:Line (Direct IP Ban)</option>
                            <option value="SHUN">SHUN (Silent Command Mute)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Hostmask / IP</label>
                          <input
                            type="text"
                            placeholder="*@192.0.2.15"
                            value={newBanMask}
                            onChange={(e) => setNewBanMask(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Reason</label>
                          <input
                            type="text"
                            placeholder="Spam flood attack"
                            value={newBanReason}
                            onChange={(e) => setNewBanReason(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-red-950/40"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Commit Ban</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                        <span>Ban creation is restricted to <strong>Ops and Above (@ / +o, Level 500+)</strong>.</span>
                        <button
                          onClick={() => onRankChange('op')}
                          className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-bold hover:bg-sky-500/30 cursor-pointer"
                        >
                          Switch to Channel Op (@)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 7. View unrealircd.conf */}
              {ircdSubTab === 'raw_conf' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      Generated live from active UnrealIRCd settings: <code className="text-sky-300">/etc/unrealircd/unrealircd.conf</code>
                    </span>
                    <button
                      onClick={copyConfigToClipboard}
                      className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedConf ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedConf ? 'Copied Config!' : 'Copy unrealircd.conf'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-[500px] leading-relaxed">
                    {generateUnrealConf()}
                  </pre>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: ANOPE SERVICES & RANKS HIERARCHY
            ======================================================== */}
        {activeTab === 'anope_services' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Anope sub-navigation */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs font-mono">
              <button
                onClick={() => setAnopeSubTab('ranks')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  anopeSubTab === 'ranks'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                ★ Ranks Hierarchy (1-9999)
              </button>
              <button
                onClick={() => setAnopeSubTab('chanserv')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  anopeSubTab === 'chanserv'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                ChanServ (#all-music, MLOCK)
              </button>
              <button
                onClick={() => setAnopeSubTab('nickserv')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  anopeSubTab === 'nickserv'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                NickServ (CertFP, VHost)
              </button>
              <button
                onClick={() => setAnopeSubTab('operserv')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  anopeSubTab === 'operserv'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                OperServ (Akills, Wallops)
              </button>
              <button
                onClick={() => setAnopeSubTab('botserv')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  anopeSubTab === 'botserv'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                BotServ (DrFun1Bot, Badwords)
              </button>
              <button
                onClick={() => setAnopeSubTab('hostserv')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  anopeSubTab === 'hostserv'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                HostServ (vHosts)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Ranks Hierarchy Matrix */}
              {anopeSubTab === 'ranks' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      Anope 2.0 / 2.1 Complete Rank &amp; Privilege Hierarchy
                    </h3>
                    <p className="text-xs text-slate-400">
                      Standardized UnrealIRCd modes, Anope access levels (1 to 9999), and strict operational boundaries for IRCD and MPD Bot DJ Deck authorization.
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Anope Rank Title</th>
                          <th className="py-3 px-3">Prefix</th>
                          <th className="py-3 px-3">IRC Modes</th>
                          <th className="py-3 px-3">Access Level</th>
                          <th className="py-3 px-3">Ops &amp; Above</th>
                          <th className="py-3 px-3">IRCD Admin</th>
                          <th className="py-3 px-3">DJ Broadcast</th>
                          <th className="py-3 px-4 text-right">Switch Rank</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                        {ANOPE_RANKS.map(rank => {
                          const isCurrent = activeRank === rank.id;
                          return (
                            <tr 
                              key={rank.id}
                              className={`transition-colors ${
                                isCurrent ? 'bg-sky-500/10 border-l-4 border-sky-400' : 'hover:bg-slate-800/40'
                              }`}
                            >
                              <td className="py-3 px-4">
                                <div className="font-bold text-white flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rank.badgeColor}`}>
                                    {rank.prefix || '•'} {rank.name.split(' (')[0]}
                                  </span>
                                  {isCurrent && (
                                    <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-sky-500/30 text-sky-300 font-semibold">
                                      CURRENT
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] font-sans text-slate-400 mt-0.5 line-clamp-1">
                                  {rank.description}
                                </div>
                              </td>
                              <td className="py-3 px-3 font-bold text-white text-sm">
                                {rank.prefix || '-'}
                              </td>
                              <td className="py-3 px-3 text-slate-300">
                                {rank.modes}
                              </td>
                              <td className="py-3 px-3 font-bold text-amber-400">
                                {rank.accessLevel}
                              </td>
                              <td className="py-3 px-3">
                                {rank.isOpsAndAbove ? (
                                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> YES
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-bold">NO</span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                {rank.canOperateIrcd ? (
                                  <span className="text-emerald-400 font-bold">FULL</span>
                                ) : (
                                  <span className="text-slate-400">Locked</span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                {rank.canGoLiveDj ? (
                                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <Radio className="w-3.5 h-3.5" /> ON-AIR DJ
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Listener Only</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => {
                                    onRankChange(rank.id);
                                    triggerNotice(`Switched simulated session to ${rank.name}`);
                                  }}
                                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                    isCurrent
                                      ? 'bg-sky-500 text-slate-950 font-extrabold'
                                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                                  }`}
                                >
                                  {isCurrent ? 'Active' : 'Test This'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ChanServ Channel Management */}
              {anopeSubTab === 'chanserv' && (
                <div className="space-y-6">
                  {/* Channel picker */}
                  <div className="flex items-center gap-2 overflow-x-auto font-mono text-xs">
                    {channels.map((ch, idx) => (
                      <button
                        key={ch.channel}
                        onClick={() => setSelectedChanIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          selectedChanIndex === idx
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                            : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {ch.channel}
                      </button>
                    ))}
                  </div>

                  {/* Channel Details Card */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white font-mono">{activeChan.channel}</h4>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            REGISTERED
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{activeChan.description}</p>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono">
                        <div>
                          <span className="text-slate-400">Founder: </span>
                          <span className="text-purple-300 font-bold">{activeChan.founder}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">MLOCK: </span>
                          <span className="text-emerald-400 font-bold">{activeChan.mlock}</span>
                        </div>
                      </div>
                    </div>

                    {/* Access List */}
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-2 flex items-center justify-between">
                        <span>ChanServ Access List ({activeChan.accessList.length} members)</span>
                        <span className="text-slate-400 font-normal">Level 500+ = Channel Ops</span>
                      </h5>
                      <div className="overflow-x-auto rounded-lg border border-slate-800">
                        <table className="w-full text-left font-mono text-xs">
                          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                            <tr>
                              <th className="py-2.5 px-3">Mask / Account</th>
                              <th className="py-2.5 px-3">Rank Name</th>
                              <th className="py-2.5 px-3">Level</th>
                              <th className="py-2.5 px-3">Added By</th>
                              <th className="py-2.5 px-3">Registered</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                            {activeChan.accessList.map((entry, idx) => (
                              <tr key={idx} className="hover:bg-slate-800/40">
                                <td className="py-2.5 px-3 text-white font-semibold">{entry.mask}</td>
                                <td className="py-2.5 px-3">
                                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                                    entry.level >= 800 ? 'bg-purple-500/20 text-purple-300' :
                                    entry.level >= 500 ? 'bg-emerald-500/20 text-emerald-300' :
                                    'bg-sky-500/20 text-sky-300'
                                  }`}>
                                    {entry.rankName}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-amber-400 font-bold">{entry.level}</td>
                                <td className="py-2.5 px-3 text-slate-400">{entry.addedBy}</td>
                                <td className="py-2.5 px-3 text-slate-400 text-[11px]">{entry.addedDate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Ops & Above ChanServ Controls */}
                    {isOpsAndAbove ? (
                      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => handleExecuteCommand(`/CHANSERV MLOCK ${activeChan.channel} +nt-s`)}
                          className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-mono font-medium transition-colors cursor-pointer"
                        >
                          Enforce MLOCK +nt-s
                        </button>
                        <button
                          onClick={() => handleExecuteCommand(`/CHANSERV OP ${activeChan.channel}`)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-mono font-medium transition-colors cursor-pointer"
                        >
                          ChanServ OP Self (@)
                        </button>
                        <button
                          onClick={() => handleExecuteCommand(`/CHANSERV SYNC ${activeChan.channel}`)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
                        >
                          Sync Channel Modes
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        <Lock className="w-3.5 h-3.5 inline text-amber-400 mr-1.5" />
                        ChanServ modification commands restricted to Ops and Above (@ / Level 500+).
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NickServ Account Directory */}
              {anopeSubTab === 'nickserv' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-400" />
                    NickServ Registered Accounts &amp; CertFP Fingerprints
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                    {nickAccounts.map(acc => (
                      <div key={acc.account} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-sm">{acc.account}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            {acc.rank.toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1 text-slate-400 text-[11px] mb-3">
                          <div>Email: <span className="text-slate-300">{acc.email}</span></div>
                          <div>vHost: <span className="text-purple-300">{acc.vhost}</span></div>
                          <div>Registered: {acc.registered}</div>
                          <div>Last Seen: <span className="text-emerald-400">{acc.lastSeen}</span></div>
                          {acc.certfp && (
                            <div className="truncate">CertFP: <span className="text-sky-300">{acc.certfp}</span></div>
                          )}
                        </div>
                        <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Kill: {acc.killStatus.toUpperCase()}</span>
                          {isOpsAndAbove && (
                            <button
                              onClick={() => handleExecuteCommand(`/NICKSERV INFO ${acc.account}`)}
                              className="text-sky-400 hover:text-sky-300 cursor-pointer"
                            >
                              Query Info →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OperServ Network Bans & Akills */}
              {anopeSubTab === 'operserv' && (
                <div className="space-y-6">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      OperServ Autokill (AKILL) Table
                    </h3>
                    <p className="text-xs text-slate-400">
                      Network-wide autokills maintained by Anope Services. Broadcast to all UnrealIRCd instances automatically.
                    </p>

                    <div className="space-y-2 mt-2 font-mono text-xs">
                      {operServData.akills.map((ak, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <div className="text-red-400 font-bold">{ak.mask}</div>
                            <div className="text-slate-400 text-[11px]">{ak.reason}</div>
                          </div>
                          <div className="text-right text-[11px] text-slate-400">
                            <div>Set by: <span className="text-slate-300">{ak.setBy}</span></div>
                            <div>Expires: <span className="text-amber-400">{ak.expires}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* OperServ Global Wallops Log */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                      Recent Global Wallops Transmissions
                    </h4>
                    <div className="space-y-2 font-mono text-xs">
                      {operServData.globalWallopsLog.map((w, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                            <span className="text-purple-300 font-bold">{w.oper}</span>
                            <span>{w.timestamp}</span>
                          </div>
                          <p className="text-slate-200">{w.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BotServ Channel Bots */}
              {anopeSubTab === 'botserv' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    BotServ Service Bot Fleet
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                    {bots.map(bot => (
                      <div key={bot.nick} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-base">{bot.nick}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ACTIVE BOT
                          </span>
                        </div>
                        <div className="space-y-1 text-slate-400 text-[11px] mb-3">
                          <div>Hostmask: {bot.user}@{bot.host}</div>
                          <div>Realname: <span className="text-slate-300">{bot.realname}</span></div>
                          <div>Channels: <span className="text-sky-300">{bot.channelsAssigned.join(', ')}</span></div>
                          <div>Badwords Filter: <span className="text-emerald-400">{bot.badwordsCount} words loaded</span></div>
                        </div>

                        <div className="border-t border-slate-800 pt-2">
                          <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Fantasy Commands:</span>
                          <div className="flex flex-wrap gap-1">
                            {bot.fantasyCommands.map(cmd => (
                              <span key={cmd} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                                {cmd}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HostServ vHosts */}
              {anopeSubTab === 'hostserv' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    HostServ Virtual Host (vHost) Assignments
                  </h3>
                  <div className="space-y-2 font-mono text-xs">
                    {vhosts.map(vh => (
                      <div key={vh.nick} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <div className="text-white font-bold">{vh.nick}</div>
                          <div className="text-purple-300 font-semibold">{vh.vhost}</div>
                        </div>
                        <div className="text-right text-[11px] text-slate-400">
                          <div>Status: <span className="text-emerald-400 font-bold uppercase">{vh.status}</span></div>
                          <div>Assigned By: {vh.assignedBy}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: OPS & ABOVE LIVE WEB CONTROL TERMINAL
            ======================================================== */}
        {activeTab === 'ops_control' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Quick Action Oper Triggers */}
            <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mr-2 hidden sm:inline">
                Ops Actions:
              </span>

              <button
                onClick={() => handleExecuteCommand('/REHASH')}
                disabled={!isOpsAndAbove}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isOpsAndAbove
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700/40 cursor-not-allowed'
                }`}
                title="Reload unrealircd.conf configuration"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                <span>/REHASH</span>
              </button>

              <button
                onClick={() => handleExecuteCommand('/REHASH -TLS')}
                disabled={!isOpsAndAbove}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isOpsAndAbove
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700/40 cursor-not-allowed'
                }`}
                title="Reload TLS 1.3 certificates and ECDSA keys"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>/REHASH -TLS</span>
              </button>

              <button
                onClick={() => handleExecuteCommand('/STATS')}
                disabled={!isOpsAndAbove}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isOpsAndAbove
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700/40 cursor-not-allowed'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>/STATS</span>
              </button>

              <button
                onClick={() => handleExecuteCommand('/CHANSERV MLOCK #all-music +nt-s')}
                disabled={!isOpsAndAbove}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isOpsAndAbove
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700/40 cursor-not-allowed'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>MLOCK #all-music</span>
              </button>

              <button
                onClick={() => handleExecuteCommand('/MODE #all-music +o DJ_OrbitNova')}
                disabled={!isOpsAndAbove}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isOpsAndAbove
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700/40 cursor-not-allowed'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>+o DJ_OrbitNova</span>
              </button>
            </div>

            {/* Quick Wallops Broadcast Bar */}
            {isOpsAndAbove && (
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-2">
                <span className="text-[11px] font-mono text-purple-300 font-bold shrink-0">
                  /WALLOPS:
                </span>
                <input
                  type="text"
                  placeholder="Transmit operator notification across all network nodes..."
                  value={quickWallopsMsg}
                  onChange={(e) => setQuickWallopsMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && quickWallopsMsg.trim()) {
                      handleExecuteCommand(`/WALLOPS ${quickWallopsMsg.trim()}`);
                      setQuickWallopsMsg('');
                    }
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-xs font-mono text-white placeholder-slate-400"
                />
                <button
                  onClick={() => {
                    if (quickWallopsMsg.trim()) {
                      handleExecuteCommand(`/WALLOPS ${quickWallopsMsg.trim()}`);
                      setQuickWallopsMsg('');
                    }
                  }}
                  className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
              </div>
            )}

            {/* Terminal screen & Audit log split */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
              
              {/* Interactive Oper Terminal (2 cols) */}
              <div className="lg:col-span-2 flex flex-col bg-slate-950 p-4 border-r border-slate-800 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-slate-400 ml-2">oper@irc.drfun1.com:6697 (UnrealIRCd 6.1.4 Shell)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Rank: {currentRankDef.name.split(' (')[0]}</span>
                </div>

                {/* Console Log Area */}
                <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-xs p-3 bg-black/60 rounded-xl border border-slate-800/80 mb-3">
                  {consoleHistory.map((line, idx) => (
                    <div 
                      key={idx} 
                      className={`leading-relaxed ${
                        line.startsWith('>') ? 'text-sky-400 font-bold' :
                        line.includes('PERMISSION DENIED') ? 'text-red-400 font-bold' :
                        line.includes('*** WALLOPS') ? 'text-purple-300 font-bold' :
                        line.includes('reloaded') || line.includes('complete') ? 'text-emerald-400' :
                        'text-slate-300'
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                {/* Command prompt input */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleExecuteCommand();
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="font-mono text-sky-400 text-sm font-bold">{'>'}</span>
                  <input
                    type="text"
                    placeholder={
                      isOpsAndAbove 
                        ? "Enter oper command (e.g. /rehash, /kline *@bad.ip flood, /wallops notice, /help)..."
                        : "LOCKED: Elevated rank required (Switch to Channel Op @ or above)..."
                    }
                    value={consoleInput}
                    onChange={(e) => setConsoleInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Execute</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Realtime Oper Audit Log (1 col) */}
              <div className="bg-slate-900/90 flex flex-col overflow-hidden p-4">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Oper Audit Trail</span>
                  <span className="text-[10px] text-slate-400">{auditLogs.length} logged</span>
                </h4>
                <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs pr-1">
                  {auditLogs.map(log => (
                    <div key={log.id} className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="text-sky-300 font-bold">{log.operNick}</span>
                        <span>{log.timestamp.slice(11)}</span>
                      </div>
                      <div className="text-white font-semibold text-[11px] mb-1">{log.command}</div>
                      <div className="text-[10px] text-slate-400 leading-tight">{log.details}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: MPD BOT & DJ RANK MATRIX (OPS AND ABOVE)
            ======================================================== */}
        {activeTab === 'dj_matrix' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Status Hero Card */}
            <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              isOpsAndAbove
                ? 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-sky-950/50 border-emerald-500/40'
                : 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border-amber-500/40'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  isOpsAndAbove 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                }`}>
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      MPD Bot DJ Broadcast Authorization
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      isOpsAndAbove 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {isOpsAndAbove ? '★ OPS & ABOVE ON-AIR AUTHORIZED' : 'LOCKED: LISTENER STATUS ONLY'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    Broadcasting live music, taking over the Icecast2 mount (<code className="text-emerald-300 font-mono">/live</code>), triggering microphone talkover ducking (-12dB), and skipping station tracks require an active <strong>Channel Operator (@ / +o, Level 500+)</strong> rank in Anope Services.
                  </p>
                </div>
              </div>

              {onNavigateToMpd && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToMpd();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-lg shadow-emerald-500/20"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Launch MPD DJ Deck</span>
                </button>
              )}
            </div>

            {/* Detailed DJ Privilege Matrix */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                DJ Deck Capabilities by Anope Access Tier
              </h4>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">Anope Rank</th>
                      <th className="py-3 px-3">Broadcast Role</th>
                      <th className="py-3 px-2 text-center">Go Live (/live)</th>
                      <th className="py-3 px-2 text-center">Mic Ducking</th>
                      <th className="py-3 px-2 text-center">Deck Play/Skip</th>
                      <th className="py-3 px-2 text-center">Manage Crate</th>
                      <th className="py-3 px-2 text-center">IRC !np / Wallops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                    {DJ_PERMISSION_MATRIX.map(matrix => {
                      const rankObj = ANOPE_RANKS.find(r => r.id === matrix.rank);
                      const isCurrent = activeRank === matrix.rank;
                      return (
                        <tr 
                          key={matrix.rank} 
                          className={`transition-colors ${
                            isCurrent ? 'bg-sky-500/10 font-bold' : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rankObj?.badgeColor}`}>
                              {rankObj?.prefix || '•'} {rankObj?.name.split(' (')[0]}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-200">
                            {matrix.roleTitle}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {matrix.canTakeoverLiveMount ? (
                              <span className="text-emerald-400 font-bold">✓ YES</span>
                            ) : (
                              <span className="text-slate-500">✗</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {matrix.canDuckMicrophone ? (
                              <span className="text-emerald-400 font-bold">✓ YES (-12dB)</span>
                            ) : (
                              <span className="text-slate-500">✗</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {matrix.canControlPlayback ? (
                              <span className="text-emerald-400 font-bold">✓ YES</span>
                            ) : (
                              <span className="text-slate-500">✗</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {matrix.canAcceptListenerRequests ? (
                              <span className="text-emerald-400 font-bold">✓ ACCEPT/REJECT</span>
                            ) : (
                              <span className="text-slate-500">Request Only</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {matrix.canTriggerIrcWallops ? (
                              <span className="text-emerald-400 font-bold">✓ BROADCAST</span>
                            ) : (
                              <span className="text-slate-500">✗</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive DJ Station Takeover Simulator */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Live DJ Mount Takeover Simulator
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Test the station takeover signal sent to Icecast2 and MPD when an authorized Operator goes live on air.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isOpsAndAbove ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                  <div>
                    <div className="text-xs font-mono font-bold text-white">
                      Icecast Mount: <code className="text-emerald-400">/live.mp3 (320 kbps MP3 Stream)</code>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Current Broadcast Handler: {isOpsAndAbove ? `${currentRankDef.name} (LIVE ON AIR)` : 'Automated AutoDJ Rotation'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isOpsAndAbove ? (
                    <button
                      onClick={() => {
                        handleExecuteCommand('!DJ GO-LIVE mount=/live');
                        triggerNotice('Broadcasting Live: Icecast2 mount /live acquired by Station DJ!');
                      }}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-950/40"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Take Over On-Air Mount</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onRankChange('op')}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-950/40"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Promote to Op (@) to Broadcast</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 5: WITT LAW FIRM NETADMIN AUTHORITY & LEGAL GOVERNANCE
            ======================================================== */}
        {activeTab === 'wittlaw_governance' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-300">
            {/* Header Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900 to-purple-950/50 border border-red-500/40 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        IRCD Oper &amp; NetAdmin Authority Charter
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                        Established via www.wittlawfirm.com
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      The Law Office of Richard A. Witt LLC &bull; Richard Alan Witt, Network Owner &bull; Owens Company
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="https://www.wittlawfirm.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 font-mono text-xs flex items-center gap-1.5 font-semibold transition-colors"
                  >
                    <span>wittlawfirm.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                All operator privileges, administrative classes, UnrealIRCd TLS 1.3 cryptographic bindings, and Anope services permissions on <strong className="text-white">irc.drfun1.com</strong> are legally certified and governed by <strong className="text-white">The Law Office of Richard A. Witt LLC</strong>. Operating authority is established under exclusive license to <strong className="text-white">Richard Alan Witt</strong>, including designated NetAdmins, Chief IRCOps, and certified Station DJ Operators.
              </p>
            </div>

            {/* Quick Sanctioned Oper Roster Switcher */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-red-400" />
                  <span>Sanctioned Oper Roster Established by www.wittlawfirm.com</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-500">Click to assume administrative identity</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Richard Alan Witt */}
                <div className={`p-4 rounded-xl border transition-all ${
                  activeRank === 'sra'
                    ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-red-400 block">
                        Network Owner &bull; Level 10000
                      </span>
                      <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>~ RichardAlanWitt</span>
                      </h5>
                    </div>
                    {activeRank === 'sra' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug mb-3">
                    Managing Counsel at Witt Law Firm. Supreme network root, Switch SUPERNAP datacenter teleport vault link authority, and ultimate Anope OperServ key.
                  </p>
                  <button
                    onClick={() => {
                      onRankChange('sra');
                      handleExecuteCommand('/WALLOPS Administrative session authenticated: RichardAlanWitt (Network Owner via www.wittlawfirm.com)');
                      triggerNotice('Authenticated as Network Owner & Chief NetAdmin (~ Richard Alan Witt)');
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-red-950/30"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Assume Richard Alan Witt (NetAdmin)</span>
                  </button>
                </div>

                {/* 2. DrFun1_Admin */}
                <div className={`p-4 rounded-xl border transition-all ${
                  activeRank === 'admin'
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">
                        Services Root &bull; Level 5000
                      </span>
                      <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>* DrFun1_Admin</span>
                      </h5>
                    </div>
                    {activeRank === 'admin' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug mb-3">
                    Technical NetAdmin. Holds global GLINE, ZLINE, server DIE/RESTART override, BotServ provisioning, and BGP clean-pipe routing control.
                  </p>
                  <button
                    onClick={() => {
                      onRankChange('admin');
                      handleExecuteCommand('/WALLOPS Administrative session authenticated: DrFun1_Admin (Services Admin)');
                      triggerNotice('Authenticated as Services Admin (* DrFun1_Admin)');
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-amber-950/30"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Assume DrFun1_Admin (Services Root)</span>
                  </button>
                </div>

                {/* 3. Global IRCOp */}
                <div className={`p-4 rounded-xl border transition-all ${
                  activeRank === 'so'
                    ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-purple-400 block">
                        Global IRCOp &bull; Level 2000
                      </span>
                      <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <span>@ DrFun1_Tech</span>
                      </h5>
                    </div>
                    {activeRank === 'so' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug mb-3">
                    Core infrastructure operator. Network-wide moderation, channel takeover mitigation, satellite telemetry link maintenance, and station DJ overrides.
                  </p>
                  <button
                    onClick={() => {
                      onRankChange('so');
                      handleExecuteCommand('/WALLOPS Oper session authenticated: DrFun1_Tech (Global IRCOp)');
                      triggerNotice('Authenticated as Global IRCOp (@ DrFun1_Tech)');
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-purple-950/30"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Assume Global IRCOp (@ DrFun1_Tech)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live NetAdmin Directives & Control Panel */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Witt Law Firm NetAdmin Action Matrix</span>
                </h4>
                <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                  Target Hub: irc.drfun1.com:6697 (SID 001)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                <button
                  onClick={() => {
                    handleExecuteCommand('/REHASH');
                    triggerNotice('Executed: /REHASH under Witt Law Firm NetAdmin authority');
                  }}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500 text-slate-200 transition-colors text-left"
                >
                  <span className="font-bold text-sky-400 block text-[11px]">/REHASH</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Reload unrealircd.conf</span>
                </button>

                <button
                  onClick={() => {
                    handleExecuteCommand('/REHASH -TLS');
                    triggerNotice('Executed: /REHASH -TLS certificates reloaded');
                  }}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500 text-slate-200 transition-colors text-left"
                >
                  <span className="font-bold text-emerald-400 block text-[11px]">/REHASH -TLS</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Hot-reload TLS keys</span>
                </button>

                <button
                  onClick={() => {
                    handleExecuteCommand('/WALLOPS Official Directive: Network operating under Witt Law Firm (www.wittlawfirm.com) legal governance.');
                    triggerNotice('WALLOPS broadcast sent to all servers and opers');
                  }}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500 text-slate-200 transition-colors text-left"
                >
                  <span className="font-bold text-amber-400 block text-[11px]">/WALLOPS</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Broadcast Legal Directive</span>
                </button>

                <button
                  onClick={() => {
                    handleExecuteCommand('/STATS u');
                    triggerNotice('Queried: Server uptime and connected leaf nodes');
                  }}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500 text-slate-200 transition-colors text-left"
                >
                  <span className="font-bold text-purple-400 block text-[11px]">/STATS U</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Uptime &amp; Leaf Sync</span>
                </button>
              </div>

              {/* Certified Oper Block Code Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    Official unrealircd.conf Oper Block (Witt Law Firm Certified):
                  </span>
                  <button
                    onClick={() => {
                      const code = `/* Official Oper Block certified by The Law Office of Richard A. Witt LLC */
oper RichardAlanWitt {
    class netadmin;
    mask "*@*";
    password "$2y$12$WittLawFirmEscrowCert2026NetAdminHash";
    swhois "is Network Owner, Chief NetAdmin & Managing Counsel (www.wittlawfirm.com)";
    vhost "founder.wittlawfirm.com";
    snomask "+cksdjnbevf";
    flags {
        local;
        global;
        netadmin;
        services-admin;
        coadmin;
        admin;
        can_rehash;
        can_die;
        can_restart;
        can_kline;
        can_gline;
        can_zline;
    };
};`;
                      navigator.clipboard.writeText(code);
                      triggerNotice('RichardAlanWitt oper block copied to clipboard!');
                    }}
                    className="text-[10px] font-mono text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Oper Block</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap select-text">
{`/* Official Oper Block certified by The Law Office of Richard A. Witt LLC */
oper RichardAlanWitt {
    class netadmin;
    mask "*@*";
    password "$2y$12$WittLawFirmEscrowCert2026NetAdminHash";
    swhois "is Network Owner, Chief NetAdmin & Managing Counsel (www.wittlawfirm.com)";
    vhost "founder.wittlawfirm.com";
    snomask "+cksdjnbevf";
    flags { local; global; netadmin; services-admin; can_rehash; can_die; can_kline; can_gline; };
};`}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            MODAL FOOTER: License & Technical Specs
            ======================================================== */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span>© 2026 DrFun1 Orbit Satcom &amp; Broadcast Mesh</span>
            <span className="text-slate-600">•</span>
            <span>Licensed to Richard Alan Witt LLC (www.wittlawfirm.com)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">UnrealIRCd 6.1.4</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Anope 2.1.2</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Switch SUPERNAP Las Vegas
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
