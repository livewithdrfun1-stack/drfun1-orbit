import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  Terminal,
  Cpu,
  GitBranch,
  Key,
  Lock,
  ExternalLink,
  Copy,
  Check,
  X,
  Play,
  Activity,
  AlertTriangle,
  FileText,
  Users,
  Radio,
  Send,
  Zap,
  RefreshCw,
  Search,
  Globe,
  Sliders,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { DEV_PLATFORM_CONFIG, WITTLAW_ADMINS_MODS } from '../data/ircData';
import { WittLawAdminMod, DevPlatformApiEndpoint, DevSandboxEnvironment, ModerationAuditAction } from '../types/irc';

interface DevPlatformWittLawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatchIrcQuery?: (nick: string) => void;
  onJoinDevChannel?: (channel: string) => void;
}

export const DevPlatformWittLawModal: React.FC<DevPlatformWittLawModalProps> = ({
  isOpen,
  onClose,
  onDispatchIrcQuery,
  onJoinDevChannel,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'sandboxes' | 'apis' | 'audits' | 'terminal'>('roster');
  const [selectedAdmin, setSelectedAdmin] = useState<WittLawAdminMod | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedApi, setSelectedApi] = useState<DevPlatformApiEndpoint>(DEV_PLATFORM_CONFIG.apiEndpoints[0]);
  const [apiTestResponse, setApiTestResponse] = useState<string | null>(null);
  const [isApiTesting, setIsApiTesting] = useState<boolean>(false);
  const [adminSearch, setAdminSearch] = useState<string>('');
  const [auditFilter, setAuditFilter] = useState<'all' | 'notice' | 'enforcement'>('all');

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Welcome to dev.drfun1media.com Developer Shell v4.2 [Switch SUPERNAP Core Teleport]',
    'Supervised by The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)',
    'Type "help" for a list of developer commands, or "wittlaw" to view counsel on-duty.',
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRunApiTest = () => {
    setIsApiTesting(true);
    setApiTestResponse(null);
    setTimeout(() => {
      setIsApiTesting(false);
      setApiTestResponse(selectedApi.sampleResponse);
    }, 450);
  };

  const handleTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const newHistory = [...terminalHistory, `developer@dev.drfun1media.com:~$ ${cmd}`];

    const lower = cmd.toLowerCase();
    if (lower === 'help') {
      newHistory.push(
        'Available Developer Commands:',
        '  status        - Show dev.drfun1media.com leaf node telemetry & fiber sync',
        '  wittlaw       - Print active WittLaw admins and moderators roster',
        '  sandboxes     - List active development branch environments and ports',
        '  git status    - Show git branch, commit hash, and sync state',
        '  audit-log     - View recent FCC/ITU legal audits and moderation events',
        '  api-test      - Dispatch test JSON-RPC payload to https://dev.drfun1media.com:8443',
        '  clear         - Clear terminal window'
      );
    } else if (lower === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    } else if (lower === 'status') {
      newHistory.push(
        '[DEV PLATFORM TELEMETRY]',
        '  Node: dev.drfun1media.com (SID 007)',
        '  UnrealIRCd: 6.1.4-dev + WebSocket Bridge',
        '  Colocation: Switch SUPERNAP (Tier 5 Platinum, 100% Green Energy)',
        '  Transit: RisingNet 100 Gbps DWDM (Latency: 1.2ms, Packet Loss: 0.00%)',
        '  Licensee: The Law Office of Richard A. Witt LLC (FRN: 0034981290)',
        '  Active Devs: 1,420 | Total Users Synced: 8,838'
      );
    } else if (lower === 'wittlaw') {
      newHistory.push(
        '[WITTLaw ADMINS & MODS ROSTER - www.wittlawfirm.com]',
        ...WITTLAW_ADMINS_MODS.map(
          (a) => `  ${a.prefix}${a.nick.padEnd(20)} [${a.rankBadge}] - ${a.name} (${a.email})`
        )
      );
    } else if (lower === 'sandboxes') {
      newHistory.push(
        '[DEV SANDBOXES]',
        ...DEV_PLATFORM_CONFIG.sandboxEnvironments.map(
          (s) => `  Port ${s.port}: ${s.name} [${s.branch}] (${s.status.toUpperCase()}) - ${s.activeDevelopers} devs`
        )
      );
    } else if (lower === 'git status') {
      newHistory.push(
        `On branch ${DEV_PLATFORM_CONFIG.activeBranch}`,
        `Your branch is up to date with 'origin/${DEV_PLATFORM_CONFIG.activeBranch}'.`,
        `Repository: ${DEV_PLATFORM_CONFIG.gitRepository}`,
        `Last commit: 9a8b7c4 (WittLaw Regulatory & Oper Moderation Engine)`
      );
    } else if (lower === 'audit-log') {
      newHistory.push(
        '[RECENT WITTLaw AUDIT LOGS]',
        ...DEV_PLATFORM_CONFIG.recentAuditActions.map(
          (aud) => `  [${aud.timestamp}] [${aud.actionType}] ${aud.adminNick}: ${aud.reason}`
        )
      );
    } else if (lower === 'api-test') {
      newHistory.push(
        'POST https://dev.drfun1media.com:8443/api/v1/rpc HTTP/1.1 200 OK',
        '{"jsonrpc":"2.0","result":{"server":"dev.drfun1media.com","status":"healthy","licensee":"www.wittlawfirm.com"}}'
      );
    } else {
      newHistory.push(`bash: ${cmd}: command not found. Type "help" for available developer commands.`);
    }

    setTerminalHistory(newHistory);
    setTerminalInput('');
  };

  const filteredAdmins = WITTLAW_ADMINS_MODS.filter(
    (a) =>
      a.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      a.nick.toLowerCase().includes(adminSearch.toLowerCase()) ||
      a.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const filteredAudits = DEV_PLATFORM_CONFIG.recentAuditActions.filter((a) => {
    if (auditFilter === 'notice') return a.severity === 'notice';
    if (auditFilter === 'enforcement') return a.severity === 'enforcement' || a.severity === 'critical';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/50 rounded-2xl max-w-5xl w-full h-[90vh] max-h-[850px] shadow-2xl flex flex-col overflow-hidden relative font-sans">
        
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-sky-500 p-0.5 shadow-lg flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-white font-extrabold text-base tracking-wide flex items-center gap-2">
                  <span>dev.drfun1media.com</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    DEVELOPER PLATFORM
                  </span>
                </h2>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>SID 007 &bull; Port 6697 (SSL)</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center gap-2 font-mono">
                <span>Admins &amp; Mods:</span>
                <a
                  href="https://www.wittlawfirm.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline font-semibold flex items-center gap-1"
                >
                  <span>The Law Office of Richard A. Witt LLC</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <span className="text-slate-600">&bull;</span>
                <span className="text-slate-400">FCC Counsel of Record &bull; FRN: 0034981290</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy('git clone git@dev.drfun1media.com:wittlaw/satcom-platform.git', 'git_clone')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
              title="Copy git clone URL"
            >
              {copiedKey === 'git_clone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
              <span>{copiedKey === 'git_clone' ? 'Copied Git URL!' : 'git clone'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="bg-slate-950 px-5 border-b border-slate-800 flex items-center space-x-2 text-xs font-semibold overflow-x-auto shrink-0 select-none">
          <button
            onClick={() => setActiveTab('roster')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'roster'
                ? 'border-purple-500 text-purple-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>WittLaw Admins &amp; Mods ({WITTLAW_ADMINS_MODS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sandboxes')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'sandboxes'
                ? 'border-purple-500 text-purple-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4 text-sky-400" />
            <span>Sandboxes &amp; CI/CD ({DEV_PLATFORM_CONFIG.sandboxEnvironments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('apis')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'apis'
                ? 'border-purple-500 text-purple-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4 text-emerald-400" />
            <span>APIs &amp; JSON-RPC Playground</span>
          </button>

          <button
            onClick={() => setActiveTab('audits')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'audits'
                ? 'border-purple-500 text-purple-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Regulatory Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'terminal'
                ? 'border-purple-500 text-purple-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4 text-yellow-400" />
            <span>Dev Shell (SSH :2202)</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-900/60">
          
          {/* ========================================================= */}
          {/* TAB 1: WITTLAW ADMINS & MODS ROSTER                       */}
          {/* ========================================================= */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              {/* Roster Overview Banner */}
              <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Official WittLaw Legal &amp; Moderation Operations Board</span>
                  </h3>
                  <p className="text-slate-300 text-xs mt-0.5">
                    Attorneys, regulatory counsel, and licensed professional engineers from <strong>The Law Office of Richard A. Witt LLC</strong> (
                    <a href="https://www.wittlawfirm.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">
                      www.wittlawfirm.com
                    </a>
                    ) serving as root network administrators and channel moderators across <code className="text-emerald-400 font-mono">dev.drfun1media.com</code>.
                  </p>
                </div>
                <div className="relative shrink-0 w-full md:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search staff, email, title..."
                    className="w-full bg-slate-950 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Staff Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="bg-slate-950 border border-slate-800 hover:border-purple-500/60 rounded-xl p-4 transition-all flex flex-col justify-between space-y-3 shadow-md"
                  >
                    <div>
                      {/* Top Row: Nick, Rank, Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-300 font-mono font-black text-sm flex items-center justify-center">
                            {admin.prefix}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-extrabold text-sm font-mono">{admin.nick}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-purple-300 border border-purple-800/40">
                                {admin.rankBadge}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-200">{admin.name}</div>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            admin.dutyStatus === 'on_duty'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {admin.dutyStatus === 'on_duty' ? 'ON DUTY' : 'ACTIVE AUDIT'}
                        </span>
                      </div>

                      {/* Title & Organization */}
                      <div className="text-[11px] text-slate-400 mt-2">
                        <div>{admin.title}</div>
                        <div className="text-purple-400 font-mono text-[10px] mt-0.5">{admin.firm} ({admin.firmUrl})</div>
                      </div>

                      {/* Technical Credentials & Hostmask */}
                      <div className="mt-2.5 p-2 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-300 space-y-1 border border-slate-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Hostmask:</span>
                          <span className="text-emerald-300">{admin.hostmask}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Oper Flags:</span>
                          <span className="text-purple-300 font-bold">{admin.operFlags}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">FCC FRN / PGP:</span>
                          <span className="text-sky-300">{admin.fccFrn} &bull; {admin.pgpKeyId}</span>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-slate-300 mt-2 text-justify line-clamp-2">
                        {admin.bio}
                      </p>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (onDispatchIrcQuery) {
                              onDispatchIrcQuery(admin.nick);
                              onClose();
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-[11px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>/query</span>
                        </button>
                        <a
                          href={`mailto:${admin.email}`}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 transition"
                        >
                          <span>{admin.email}</span>
                        </a>
                      </div>

                      <span className="text-[10px] font-mono text-slate-500">
                        Active: {admin.lastActive}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: DEV SANDBOXES & CI/CD PIPELINES                    */}
          {/* ========================================================= */}
          {activeTab === 'sandboxes' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-sky-400" />
                    <span>Active Developer Sandboxes &amp; Testbeds</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sandboxed UnrealIRCd 6.1.4 test nodes running on dev.drfun1media.com with automatic sync to Master Hub.
                  </p>
                </div>
                <div className="text-right text-xs font-mono">
                  <span className="text-emerald-400 font-bold">{DEV_PLATFORM_CONFIG.totalActiveDevs} Developers Active</span>
                  <div className="text-slate-500 text-[11px]">Git Branch: {DEV_PLATFORM_CONFIG.activeBranch}</div>
                </div>
              </div>

              <div className="space-y-3">
                {DEV_PLATFORM_CONFIG.sandboxEnvironments.map((sb) => (
                  <div
                    key={sb.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <h4 className="text-white font-bold text-sm">{sb.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800/40">
                          Port {sb.port} (SSL)
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800/40">
                          {sb.branch}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-slate-400">RAM: {sb.memoryUsageMb} MB</span>
                        <span className="text-slate-600">&bull;</span>
                        <span className="text-emerald-400 font-bold">{sb.activeDevelopers} Devs</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="truncate max-w-md">
                        <span className="text-slate-500">Commit: </span>
                        <span className="text-purple-300">{sb.gitCommit}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Supervised by: <strong className="text-white">{sb.assignedAdmins.join(', ')}</strong> (WittLaw)
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px] font-mono">
                        Deploy: {sb.deployTimestamp} &bull; Engine: {sb.unrealVersion}
                      </span>
                      <button
                        onClick={() => {
                          if (onJoinDevChannel) {
                            onJoinDevChannel('#dev-platform');
                            onClose();
                          }
                        }}
                        className="px-3 py-1 rounded bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/40 font-mono font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-sky-400" />
                        <span>Connect to Sandbox</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: APIS & JSON-RPC PLAYGROUND                         */}
          {/* ========================================================= */}
          {activeTab === 'apis' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* API Selector List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    API Endpoints (:8443)
                  </h4>
                  {DEV_PLATFORM_CONFIG.apiEndpoints.map((api) => (
                    <button
                      key={api.id}
                      onClick={() => {
                        setSelectedApi(api);
                        setApiTestResponse(null);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        selectedApi.id === api.id
                          ? 'border-purple-500 bg-purple-950/40 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded font-black ${
                            api.method === 'POST'
                              ? 'bg-purple-600 text-white'
                              : api.method === 'GET'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-sky-600 text-white'
                          }`}
                        >
                          {api.method}
                        </span>
                        <span className="text-slate-400">{api.authType}</span>
                      </div>
                      <div className="text-xs font-bold truncate">{api.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{api.endpoint}</div>
                    </button>
                  ))}
                </div>

                {/* API Inspector & Code Playground */}
                <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono font-black text-xs bg-purple-600 text-white">
                          {selectedApi.method}
                        </span>
                        <h4 className="text-white font-bold text-sm">{selectedApi.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        Auth: {selectedApi.authType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1.5">
                      {selectedApi.description}
                    </p>

                    <div className="mt-3 p-2.5 bg-slate-900 rounded-lg text-xs font-mono text-purple-300 border border-slate-800 flex items-center justify-between">
                      <span>{selectedApi.endpoint}</span>
                      <button
                        onClick={() => handleCopy(selectedApi.endpoint, 'api_url')}
                        className="text-slate-400 hover:text-white"
                        title="Copy endpoint"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {selectedApi.samplePayload && (
                      <div className="mt-3">
                        <div className="text-[11px] font-bold text-slate-400 font-mono mb-1">
                          Sample Request Body (JSON-RPC):
                        </div>
                        <pre className="p-3 bg-black rounded-lg text-xs font-mono text-emerald-400 border border-slate-800 overflow-x-auto">
                          {selectedApi.samplePayload}
                        </pre>
                      </div>
                    )}

                    {/* Response Area */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 font-mono mb-1">
                        <span>Response Output:</span>
                        {apiTestResponse && <span className="text-emerald-400">200 OK &bull; Verified by WittLaw</span>}
                      </div>
                      <pre className="p-3 bg-black rounded-lg text-xs font-mono text-cyan-300 border border-slate-800 min-h-[90px] overflow-x-auto">
                        {isApiTesting ? 'Dispatching request to dev.drfun1media.com:8443...' : apiTestResponse || 'Click "Execute Test Request" to simulate call.'}
                      </pre>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      Counsel verification required for write oper scopes
                    </span>
                    <button
                      onClick={handleRunApiTest}
                      disabled={isApiTesting}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isApiTesting ? 'Testing...' : 'Execute Test Request'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: REGULATORY AUDIT TRAIL                             */}
          {/* ========================================================= */}
          {activeTab === 'audits' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>FCC &amp; WittLaw Compliance Audit Trail</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Immutable real-time audit logs maintained by The Law Office of Richard A. Witt LLC under 47 CFR Part 25/73.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <button
                    onClick={() => setAuditFilter('all')}
                    className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                      auditFilter === 'all' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    All Audits
                  </button>
                  <button
                    onClick={() => setAuditFilter('notice')}
                    className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                      auditFilter === 'notice' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Notices
                  </button>
                  <button
                    onClick={() => setAuditFilter('enforcement')}
                    className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                      auditFilter === 'enforcement' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Enforcements
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredAudits.map((aud) => (
                  <div
                    key={aud.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">[{aud.timestamp}]</span>
                        <span
                          className={`px-2 py-0.5 rounded font-black ${
                            aud.severity === 'notice'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : aud.severity === 'advisory'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {aud.actionType}
                        </span>
                        <strong className="text-purple-300">{aud.adminNick}</strong>
                        <span className="text-slate-400">({aud.adminTitle})</span>
                      </div>
                      <span className="text-emerald-400 font-bold">{aud.target}</span>
                    </div>

                    <div className="text-slate-200 text-xs font-sans pl-1">
                      {aud.reason}
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                      <div>
                        <span className="text-slate-500">Legal Authority: </span>
                        <span className="text-purple-400">{aud.legalBasis}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Statutory Ref: </span>
                        <span className="text-sky-400">{aud.statutoryReference}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: DEV SHELL & SSH TERMINAL                           */}
          {/* ========================================================= */}
          {activeTab === 'terminal' && (
            <div className="h-full flex flex-col bg-black rounded-xl border border-slate-800 p-4 font-mono text-xs select-text">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-slate-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-400 font-bold">ssh oper@dev.drfun1media.com -p 2202</span>
                  <span>(TLS 1.3 / OpenSSH 9.6)</span>
                </div>
                <span>Session: Authorized WittLaw Dev Shell</span>
              </div>

              {/* Terminal Log */}
              <div className="flex-1 overflow-y-auto space-y-1 text-slate-300 min-h-[300px]">
                {terminalHistory.map((line, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {line}
                  </div>
                ))}
              </div>

              {/* Command Input Prompt */}
              <form onSubmit={handleTerminalCommand} className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
                <span className="text-purple-400 font-bold">developer@dev.drfun1media.com:~$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="type command (e.g. status, wittlaw, sandboxes, help)..."
                  className="flex-1 bg-transparent text-emerald-400 focus:outline-none font-mono text-xs"
                  autoFocus
                />
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
