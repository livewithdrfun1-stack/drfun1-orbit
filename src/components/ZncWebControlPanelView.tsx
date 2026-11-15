import React, { useState, useMemo } from 'react';
import {
  Server,
  Terminal,
  ShieldCheck,
  Radio,
  Activity,
  Layers,
  Key,
  Lock,
  Globe,
  Users,
  Hash,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  ExternalLink,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  X,
  FileCode,
  Shield,
  Wifi,
  Scale,
  Building2,
  Search
} from 'lucide-react';
import { ZNC_BOUNCER_CONFIG } from '../data/ircData';
import { ZncModule, ZncUserSession } from '../types/irc';

interface ZncWebControlPanelViewProps {
  onNavigateToIrc?: () => void;
  onNavigateToStats?: () => void;
  onOpenLicense?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

type ZncTab = 'overview' | 'users' | 'networks' | 'channels' | 'modules' | 'listeners' | 'config' | 'console';
type ZncOrgFilter = 'all' | 'https://www.supremecourt.gov/' | 'www.wittlawfirm.com' | 'DrFun1 Mesh';

const ZNC_USERS_STORAGE_KEY = 'drfun1_znc_users_v2';

export const ZncWebControlPanelView: React.FC<ZncWebControlPanelViewProps> = ({
  onNavigateToIrc,
  onNavigateToStats,
  onOpenLicense,
  onClose,
  isModal = false
}) => {
  const [activeTab, setActiveTab] = useState<ZncTab>('overview');

  // ZNC State (seeded & reconciled dynamically with supremecourt.gov & wittlawfirm.com staff)
  const [users, setUsers] = useState<ZncUserSession[]>(() => {
    try {
      const saved = localStorage.getItem(ZNC_USERS_STORAGE_KEY);
      if (saved) {
        const parsed: ZncUserSession[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingMap = new Map(parsed.map((u) => [u.username, u]));
          for (const seeded of ZNC_BOUNCER_CONFIG.userSessions) {
            if (!existingMap.has(seeded.username)) {
              existingMap.set(seeded.username, seeded);
            }
          }
          return Array.from(existingMap.values());
        }
      }
    } catch (_) {}
    return ZNC_BOUNCER_CONFIG.userSessions;
  });

  const [selectedUsername, setSelectedUsername] = useState<string>(users[0]?.username || 'RichardAlanWitt');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [orgFilter, setOrgFilter] = useState<ZncOrgFilter>('all');
  const [userSearch, setUserSearch] = useState('');
  const [lastDynamicSyncAt, setLastDynamicSyncAt] = useState<string>('2026-11-14 20:27 UTC');

  // Quick Dynamic Staff Add State
  const [quickStaffOrg, setQuickStaffOrg] = useState<'https://www.supremecourt.gov/' | 'www.wittlawfirm.com'>('https://www.supremecourt.gov/');
  const [quickStaffName, setQuickStaffName] = useState('');
  const [quickStaffTitle, setQuickStaffTitle] = useState('');

  // Modules State
  const [modules, setModules] = useState<ZncModule[]>(() => {
    try {
      const saved = localStorage.getItem('drfun1_znc_modules');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return ZNC_BOUNCER_CONFIG.loadedModules;
  });

  // User Edit / Add Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ZncUserSession | null>(null);
  const [userFormUsername, setUserFormUsername] = useState('');
  const [userFormRealname, setUserFormRealname] = useState('');
  const [userFormBuffer, setUserFormBuffer] = useState(5000);
  const [userFormBindHost, setUserFormBindHost] = useState('owner.wittlawfirm.com');
  const [userFormOrg, setUserFormOrg] = useState<'https://www.supremecourt.gov/' | 'www.wittlawfirm.com' | 'DrFun1 Mesh'>('www.wittlawfirm.com');

  // Channel Add State
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelBuffer, setNewChannelBuffer] = useState(2000);

  // Buffer Inspector State
  const [inspectedChannel, setInspectedChannel] = useState<string>('#drfun1-primetv');
  const [channelBuffers, setChannelBuffers] = useState<Record<string, Array<{ time: string; sender: string; text: string }>>>({
    '#drfun1-primetv': [
      { time: '14:20:11', sender: 'ChanServ', text: '[#drfun1-primetv] Channel mode set to +mnts (Synced to UnrealIRCd 6.1.4 Leaf)' },
      { time: '14:21:05', sender: 'DrFun1_Media2', text: 'Live playout automation switched to C-Band Space feed on irc.drfun1media.com' },
      { time: '14:21:40', sender: 'Capt_Morrison', text: 'Telemetry link verified across Switch SUPERNAP fiber cross-connect.' },
      { time: '14:22:15', sender: 'Elena_Rostova', text: 'Frankfurt DataPacket node is pulling the 4K HEVC stream at 38 Mbps.' },
      { time: '14:23:00', sender: 'ZNC_Bouncer', text: '*** Replaying buffer backlog (4 items stored) to connected client...' }
    ],
    '#c-band-space': [
      { time: '13:50:00', sender: 'NASA_Downlink', text: 'ISS external HD camera pass over North Atlantic. Transponder carrier nominal.' },
      { time: '14:10:12', sender: 'Orion_NOC', text: 'Tracking satellite azimuth 214.5 deg, elevation 42.1 deg.' }
    ],
    '#broadcasters': [
      { time: '14:02:18', sender: 'WittLaw_Bot', text: 'Notice: SCTE-35 digital ad cue guidelines CFR Title 47 Part 79 updated.' },
      { time: '14:15:33', sender: 'SysAdmin_Zack', text: 'ZNC 1.9.1 SASL CertFP successfully authenticated against irc.drfun1.com' }
    ]
  });

  // Console Simulator
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleHistory, setConsoleHistory] = useState<string[]>([
    '*** ZNC 1.9.1 WebAdmin Control Panel initialized on https://irc.drfun1media.com:5000',
    '*** Connected to upstream hub irc.drfun1.com:6697 via TLS 1.3 (UnrealIRCd 6.1.4 Leaf SID 026)',
    '*** Type /msg *controlpanel help or /znc help for runtime commands'
  ]);

  // Selected User Object
  const currentUser = useMemo(() => {
    return users.find(u => u.username === selectedUsername) || users[0];
  }, [users, selectedUsername]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Toggle Module
  const handleToggleModule = (modName: string) => {
    setModules(prev => {
      const updated = prev.map(m => {
        if (m.name === modName) {
          const nextStatus: 'loaded' | 'built_in' = m.status === 'loaded' ? 'built_in' : 'loaded';
          return { ...m, status: nextStatus };
        }
        return m;
      });
      try {
        localStorage.setItem('drfun1_znc_modules', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    triggerNotice(`Module "${modName}" state toggled.`);
  };

  const scotusUsersCount = useMemo(
    () => users.filter((u) => u.organization === 'https://www.supremecourt.gov/').length,
    [users]
  );
  const wittLawUsersCount = useMemo(
    () => users.filter((u) => u.organization === 'www.wittlawfirm.com').length,
    [users]
  );
  const coreMeshUsersCount = useMemo(
    () => users.filter((u) => !u.organization || u.organization === 'DrFun1 Mesh').length,
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      const org = u.organization || 'DrFun1 Mesh';
      if (orgFilter !== 'all' && org !== orgFilter) return false;
      if (!query) return true;
      return (
        u.username.toLowerCase().includes(query) ||
        u.realname.toLowerCase().includes(query) ||
        u.bindHost.toLowerCase().includes(query) ||
        (u.staffTitle || '').toLowerCase().includes(query) ||
        (u.bufferedChannels || []).some((ch) => ch.toLowerCase().includes(query))
      );
    });
  }, [users, orgFilter, userSearch]);

  const handleSyncDynamicStaffLists = () => {
    let addedCount = 0;
    setUsers((prev) => {
      const map = new Map(prev.map((u) => [u.username, u]));
      for (const seeded of ZNC_BOUNCER_CONFIG.userSessions) {
        if (!map.has(seeded.username)) {
          addedCount += 1;
        }
        map.set(seeded.username, {
          ...(map.get(seeded.username) || {}),
          ...seeded,
        });
      }
      const next = Array.from(map.values());
      try {
        localStorage.setItem(ZNC_USERS_STORAGE_KEY, JSON.stringify(next));
      } catch (_) {}
      return next;
    });
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
    setLastDynamicSyncAt(ts);
    triggerNotice(
      `Synced dynamic ZNC staff lists from https://www.supremecourt.gov/ (${scotusUsersCount}) & www.wittlawfirm.com (${wittLawUsersCount})${addedCount > 0 ? ` — ${addedCount} newly provisioned` : ''}.`
    );
  };

  const handleQuickProvisionStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedName = quickStaffName.trim();
    if (!cleanedName) return;

    const isScotus = quickStaffOrg === 'https://www.supremecourt.gov/';
    const slug = cleanedName
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 22);
    const suffix = isScotus ? '_SCOTUS' : '_WittLaw';
    const generatedUsername = `${slug || 'Staff'}${suffix}`;
    const roleTitle =
      quickStaffTitle.trim() ||
      (isScotus ? 'Confirmed Supreme Court Staff (~ Owner)' : 'Witt Law Firm Staff (~ Owner)');

    const newStaffUser: ZncUserSession = {
      username: generatedUsername,
      realname: `${cleanedName} — ${roleTitle}`,
      bindHost: isScotus ? 'staff.supremecourt.gov' : 'owner.wittlawfirm.com',
      bufferSize: 5000,
      channelsCount: isScotus ? 14 : 18,
      connectedClients: 1,
      lastActive: 'Just now',
      networks: ['DrFun1-Mesh', 'SCOTUS-WittLaw-Secure'],
      bufferedChannels: isScotus
        ? ['#scotus-docket', '#all-music', '#drfun1-primetv', '#fcc-broadcast-reg', '#wittlaw-spectrum']
        : ['#wittlaw-spectrum', '#all-music', '#fcc-broadcast-reg', '#drfun1-primetv', '#scotus-docket'],
      organization: quickStaffOrg,
      staffTitle: roleTitle,
      rankPrefix: '~',
      isAdmin: true,
      confirmationInfo: isScotus
        ? 'Dynamic Sync · Confirmed via https://www.supremecourt.gov/'
        : 'Dynamic Sync · Commissioned via www.wittlawfirm.com',
    };

    setUsers((prev) => {
      const exists = prev.some((u) => u.username.toLowerCase() === generatedUsername.toLowerCase());
      const next = exists
        ? prev.map((u) =>
            u.username.toLowerCase() === generatedUsername.toLowerCase() ? newStaffUser : u
          )
        : [newStaffUser, ...prev];
      try {
        localStorage.setItem(ZNC_USERS_STORAGE_KEY, JSON.stringify(next));
      } catch (_) {}
      return next;
    });

    setSelectedUsername(generatedUsername);
    setOrgFilter(quickStaffOrg);
    setQuickStaffName('');
    setQuickStaffTitle('');
    triggerNotice(`Provisioned ZNC bouncer "${generatedUsername}" for ${quickStaffOrg} (~ Owner Admin).`);
  };

  // Add / Edit User Handler
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormUsername.trim()) return;

    const isInstitutional =
      userFormOrg === 'https://www.supremecourt.gov/' || userFormOrg === 'www.wittlawfirm.com';

    if (editingUser) {
      setUsers(prev => {
        const next = prev.map(u => {
          if (u.username === editingUser.username) {
            return {
              ...u,
              username: userFormUsername.trim(),
              realname: userFormRealname.trim() || u.realname,
              bufferSize: Number(userFormBuffer) || 5000,
              bindHost: userFormBindHost.trim() || u.bindHost,
              organization: userFormOrg,
              isAdmin: isInstitutional || u.isAdmin,
              rankPrefix: isInstitutional ? '~' : u.rankPrefix,
            };
          }
          return u;
        });
        try {
          localStorage.setItem(ZNC_USERS_STORAGE_KEY, JSON.stringify(next));
        } catch (_) {}
        return next;
      });
      triggerNotice(`User "${userFormUsername}" updated.`);
    } else {
      const newUser: ZncUserSession = {
        username: userFormUsername.trim(),
        realname: userFormRealname.trim() || `${userFormUsername} Broadcast Operator`,
        bindHost:
          userFormBindHost.trim() ||
          (userFormOrg === 'https://www.supremecourt.gov/'
            ? 'staff.supremecourt.gov'
            : userFormOrg === 'www.wittlawfirm.com'
            ? 'owner.wittlawfirm.com'
            : 'irc.drfun1media.com'),
        bufferSize: Number(userFormBuffer) || 5000,
        channelsCount: 5,
        connectedClients: 1,
        lastActive: 'Just now',
        networks: ['DrFun1-Mesh', 'SCOTUS-WittLaw-Secure'],
        bufferedChannels:
          userFormOrg === 'https://www.supremecourt.gov/'
            ? ['#scotus-docket', '#all-music', '#drfun1-primetv', '#wittlaw-spectrum']
            : ['#wittlaw-spectrum', '#all-music', '#drfun1-primetv', '#broadcasters'],
        organization: userFormOrg,
        rankPrefix: isInstitutional ? '~' : undefined,
        isAdmin: isInstitutional,
      };
      setUsers(prev => {
        const next = [newUser, ...prev];
        try {
          localStorage.setItem(ZNC_USERS_STORAGE_KEY, JSON.stringify(next));
        } catch (_) {}
        return next;
      });
      setSelectedUsername(newUser.username);
      triggerNotice(`New ZNC user "${newUser.username}" created.`);
    }

    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  // Delete User
  const handleDeleteUser = (uname: string) => {
    if (users.length <= 1) {
      triggerNotice('Cannot delete the last remaining admin account.');
      return;
    }
    setUsers(prev => {
      const next = prev.filter(u => u.username !== uname);
      try {
        localStorage.setItem(ZNC_USERS_STORAGE_KEY, JSON.stringify(next));
      } catch (_) {}
      return next;
    });
    setSelectedUsername(users[0]?.username || '');
    triggerNotice(`User "${uname}" removed from ZNC.`);
  };

  // Add Channel to Current User
  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const formattedChan = newChannelName.startsWith('#') ? newChannelName.trim() : `#${newChannelName.trim()}`;

    setUsers(prev => {
      const next = prev.map(u => {
        if (u.username === selectedUsername) {
          const currentChans = u.bufferedChannels || [];
          if (!currentChans.includes(formattedChan)) {
            return {
              ...u,
              channelsCount: u.channelsCount + 1,
              bufferedChannels: [...currentChans, formattedChan]
            };
          }
        }
        return u;
      });
      try {
        localStorage.setItem(ZNC_USERS_STORAGE_KEY, JSON.stringify(next));
      } catch (_) {}
      return next;
    });

    setChannelBuffers(prev => ({
      ...prev,
      [formattedChan]: [
        { time: new Date().toTimeString().split(' ')[0], sender: 'ZNC_Server', text: `Joined ${formattedChan} via ZNC 1.9.1. Buffer allocated (${newChannelBuffer} lines).` }
      ]
    }));

    setInspectedChannel(formattedChan);
    setNewChannelName('');
    triggerNotice(`Channel ${formattedChan} added with ${newChannelBuffer} lines buffer.`);
  };

  // Execute Console Command
  const handleRunConsoleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;

    const cmd = consoleInput.trim();
    const ts = new Date().toTimeString().split(' ')[0];
    const newLogs = [...consoleHistory, `[${ts}] > ${cmd}`];

    if (cmd.includes('rehash')) {
      newLogs.push(`[${ts}] *** Rehashed ZNC 1.9.1 configuration. 2 Listeners, ${modules.length} modules, ${users.length} users active.`);
    } else if (cmd.includes('uptime')) {
      newLogs.push(`[${ts}] *** Uptime: 148d 12h 23m 40s (Since server boot on Switch Las Vegas SUPERNAP)`);
    } else if (cmd.includes('traffic')) {
      newLogs.push(`[${ts}] *** Traffic: Total Inbound: 4.82 GiB | Total Outbound: 19.34 GiB | Active Hub Bandwidth: 100 Gbps`);
    } else if (cmd.includes('listusers')) {
      newLogs.push(`[${ts}] *** Registered Users (${users.length}): ${users.map(u => u.username).join(', ')}`);
    } else if (cmd.includes('version')) {
      newLogs.push(`[${ts}] *** ZNC 1.9.1 - Built from https://github.com/znc/znc.git with OpenSSL 3.2.0, zlib 1.3, c-ares`);
    } else {
      newLogs.push(`[${ts}] *** Executed: "${cmd}". Command dispatched to *controlpanel daemon.`);
    }

    setConsoleHistory(newLogs);
    setConsoleInput('');
  };

// Dynamically Generated znc.conf
  const generatedZncConf = useMemo(() => {
    return `// ==============================================================
// ZNC 1.9.1 Dynamic Configuration for irc.drfun1media.com
// Upstream Hub: irc.drfun1.com:6697 (UnrealIRCd 6.1.4 leaf link SID 026)
// Institutional ZNC Staff Sync: https://www.supremecourt.gov/ (${scotusUsersCount}) & www.wittlawfirm.com (${wittLawUsersCount})
// Cloned & built from: https://github.com/znc/znc.git
// Legal License: Richard Alan Witt (www.wittlawfirm.com) | FCC FRN #0034981290
// Generated: ${new Date().toISOString()}
// ==============================================================

Version = 1.9.1

<Listener l-irc>
    Port = 6697
    SSL = true
    IPv4 = true
    IPv6 = true
</Listener>

<Listener l-web>
    Port = 5000
    SSL = true
    IPv4 = true
    IPv6 = true
</Listener>

${modules.filter(m => m.type === 'global' && m.status === 'loaded').map(m => `LoadModule = ${m.name}`).join('\n')}

${users.map(u => `
// Organization: ${u.organization || 'DrFun1 Mesh'}${u.rankPrefix ? ` | IRCD Rank: ${u.rankPrefix} Owner (John Roberts Rank)` : ''}
<User ${u.username}>
    Admin = ${u.isAdmin || u.rankPrefix === '~' || u.username === 'drfun1_admin' ? 'true' : 'false'}
    Nick = ${u.username}
    AltNick = ${u.username}_
    Ident = ${u.username}
    BindHost = ${u.bindHost}
    RealName = ${u.realname}
    Buffer = ${u.bufferSize}
    AutoClearChanBuffer = false
    AutoClearQueryBuffer = false
    QuitMsg = DrFun1 Media ZNC Bouncer Persist (${u.organization || 'irc.drfun1media.com'})
    
${modules.filter(m => m.type === 'user' && m.status === 'loaded').map(m => `    LoadModule = ${m.name}`).join('\n')}

    <Network DrFun1-Mesh>
        Server = irc.drfun1.com +6697 WittLaw_Switch_Leaf_DrFun1Media_Sync_2026
${modules.filter(m => m.type === 'network' && m.status === 'loaded').map(m => `        LoadModule = ${m.name}`).join('\n')}
        
${(u.bufferedChannels || []).map(ch => `        <Chan ${ch}>
            Buffer = ${u.bufferSize}
        </Chan>`).join('\n')}
    </Network>
</User>`).join('\n')}
`;
  }, [users, modules, scotusUsersCount, wittLawUsersCount]);

  return (
    <div className={`flex flex-col bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden ${isModal ? 'max-h-[92vh]' : 'min-h-[700px]'}`}>
      
      {/* Top Header Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white tracking-tight">ZNC 1.9.1 Web Control Panel</h2>
              <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Port 5000 (SSL)
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono hidden sm:inline">
                Leaf: irc.drfun1media.com
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official ZNC <code className="text-emerald-400 font-mono">webadmin</code> module built from <a href="https://github.com/znc/znc.git" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-mono">znc.git</a> leafed to <span className="text-slate-200 font-mono">irc.drfun1.com:6697</span>.
            </p>
          </div>
        </div>

        {/* Global Control Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => triggerNotice('ZNC rehashed successfully. Active buffers intact.')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium border border-slate-700 flex items-center space-x-1.5 transition"
            title="Reload ZNC Configuration"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Rehash ZNC</span>
          </button>

          {onNavigateToIrc && (
            <button
              onClick={onNavigateToIrc}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-xs text-cyan-300 font-medium border border-cyan-500/30 flex items-center space-x-1.5 transition"
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Launch WebIRC</span>
            </button>
          )}

          {onNavigateToStats && (
            <button
              onClick={onNavigateToStats}
              className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-xs text-purple-300 font-medium border border-purple-500/30 flex items-center space-x-1.5 transition"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Cluster Stats</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-5 py-2 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Sub Navigation Strip */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-5 flex items-center space-x-1 overflow-x-auto custom-nav-scrollbar py-2">
        {[
          { id: 'overview', label: 'Bouncer Overview', icon: Server },
          { id: 'users', label: `Users (${users.length})`, icon: Users },
          { id: 'networks', label: 'Networks & Upstream Leaves', icon: Radio },
          { id: 'channels', label: 'Channels & Buffer Replay', icon: Hash },
          { id: 'modules', label: `Modules (${modules.length})`, icon: Sliders },
          { id: 'listeners', label: 'Listeners & SSL Ports', icon: Lock },
          { id: 'config', label: 'znc.conf Generator', icon: FileCode },
          { id: 'console', label: '*controlpanel Terminal', icon: Terminal },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ZncTab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Body Content Area */}
      <div className="p-5 overflow-y-auto space-y-6 flex-1 custom-nav-scrollbar">

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & SERVER HEALTH */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Telemetry Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Bouncer Status</span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-base font-bold text-white">Active &amp; Leafed</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Unreal6104 Leaf Protocol</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">WebAdmin Port</span>
                <div className="text-base font-bold text-cyan-300 font-mono mt-1">5000 (TLS 1.3)</div>
                <span className="text-[11px] text-slate-500 font-mono">Let's Encrypt SHA256</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Upstream Hub</span>
                <div className="text-base font-bold text-emerald-400 font-mono mt-1">irc.drfun1.com:6697</div>
                <span className="text-[11px] text-slate-500 font-mono">SID: 001 (Switch Las Vegas)</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Total Cached Lines</span>
                <div className="text-base font-bold text-purple-300 font-mono mt-1">
                  {users.reduce((acc, u) => acc + (u.bufferSize * (u.bufferedChannels?.length || 1)), 0).toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Across {users.length} Bouncer Profiles</span>
              </div>
            </div>

            {/* Git Build Details & Upstream Link Block */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">ZNC Build &amp; Source Repository</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    v1.9.1 Official
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Git Source Repository:</span>
                    <a
                      href="https://github.com/znc/znc.git"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline font-mono inline-flex items-center space-x-1"
                    >
                      <span>https://github.com/znc/znc.git</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Leaf Node Host:</span>
                    <span className="text-slate-200 font-mono font-semibold">irc.drfun1media.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Leaf Assigned SID:</span>
                    <span className="text-purple-300 font-mono font-semibold">026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SSL Cipher:</span>
                    <span className="text-emerald-300 font-mono">TLS_AES_256_GCM_SHA384 (ECDHE-P256)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Colocation Facility:</span>
                    <span className="text-slate-300">Switch SUPERNAP Las Vegas (100% Green Energy)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transit Backbone:</span>
                    <span className="text-slate-300">RisingNet Tier-1 Optical Cross-Connect</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleCopy('git clone https://github.com/znc/znc.git && cd znc && ./configure --enable-openssl --enable-zlib && make && make install', 'gitCmd')}
                    className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white flex items-center justify-between transition"
                  >
                    <span>git clone https://github.com/znc/znc.git</span>
                    <span className="text-cyan-400 flex items-center space-x-1">
                      {copiedKey === 'gitCmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'gitCmd' ? 'Copied' : 'Copy'}</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Legal & Regulatory Escrow */}
              <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Legal &amp; Regulatory Escrow</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    FRN #0034981290
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  ZNC Bouncer instance and persistent message scrollback buffering operate under official telecom licensing certified by The Law Office of Richard A. Witt LLC (<a href="https://www.wittlawfirm.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">www.wittlawfirm.com</a>).
                </p>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div>License Holder: <strong className="text-white">Richard Alan Witt</strong></div>
                  <div>Certificate ID: <strong className="text-white font-mono">RAW-SATCOM-2026-LIC-0881</strong></div>
                  <div>Data Privacy: <strong className="text-emerald-400">End-to-End Encrypted RAM Buffers (Zero Telemetry Leak)</strong></div>
                </div>

                {onOpenLicense && (
                  <div className="pt-2">
                    <button
                      onClick={onOpenLicense}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium underline flex items-center space-x-1"
                    >
                      <span>Review Witt Law Certificate &amp; Spectrum Warranty</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Dynamic Institutional Staff ZNC Sync Banner */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-sky-500/10 border border-amber-400/30 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-mono text-amber-300 font-semibold flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Dynamic Institutional ZNC 1.9.1 Staff Provisioning (~ Owner · John Roberts Rank)</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    Every staff member at https://www.supremecourt.gov/ ({scotusUsersCount}) &amp; www.wittlawfirm.com ({wittLawUsersCount}) holds a dedicated ZNC bouncer
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Last directory sync: <span className="font-mono text-emerald-300">{lastDynamicSyncAt}</span> · Isolated 5,000-line persistent RAM buffers, TLS 1.3 CertFP SASL auth, and Admin = true privileges.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setOrgFilter('https://www.supremecourt.gov/');
                      setActiveTab('users');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 text-xs font-semibold cursor-pointer"
                  >
                    supremecourt.gov ({scotusUsersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrgFilter('www.wittlawfirm.com');
                      setActiveTab('users');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-400/20 hover:bg-sky-400/30 border border-sky-400/40 text-sky-200 text-xs font-semibold cursor-pointer"
                  >
                    wittlawfirm.com ({wittLawUsersCount})
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncDynamicStaffLists}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Dynamic Staff</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">
                Logged into WebAdmin as: <strong className="text-emerald-400 font-mono">{currentUser.username}</strong> ({currentUser.realname})
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
                >
                  Manage Users ({users.length})
                </button>
                <button
                  onClick={() => setActiveTab('channels')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
                >
                  Inspect Buffers
                </button>
                <button
                  onClick={() => setActiveTab('config')}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition"
                >
                  Export znc.conf
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: USERS MANAGEMENT (DYNAMIC SCOTUS & WITT LAW STAFF ZNCs) */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Dynamic ZNC Staff Bouncer Accounts ({users.length} Active)
                </h3>
                <p className="text-xs text-slate-400">
                  Synchronized for all confirmed staff at{' '}
                  <a href="https://www.supremecourt.gov/" target="_blank" rel="noopener noreferrer" className="text-amber-300 underline font-mono">
                    https://www.supremecourt.gov/
                  </a>{' '}
                  and coworkers at{' '}
                  <a href="https://www.wittlawfirm.com" target="_blank" rel="noopener noreferrer" className="text-sky-300 underline font-mono">
                    www.wittlawfirm.com
                  </a>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncDynamicStaffLists}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold text-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Dynamic Lists</span>
                </button>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setUserFormUsername('');
                    setUserFormRealname('');
                    setUserFormBuffer(5000);
                    setUserFormBindHost('owner.wittlawfirm.com');
                    setUserFormOrg('www.wittlawfirm.com');
                    setIsUserModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New ZNC User</span>
                </button>
              </div>
            </div>

            {/* Dynamic Organization Filter Tabs + Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setOrgFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap cursor-pointer ${
                    orgFilter === 'all'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  All Accounts ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrgFilter('https://www.supremecourt.gov/')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap cursor-pointer ${
                    orgFilter === 'https://www.supremecourt.gov/'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-amber-300 hover:bg-slate-800'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>supremecourt.gov ({scotusUsersCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrgFilter('www.wittlawfirm.com')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap cursor-pointer ${
                    orgFilter === 'www.wittlawfirm.com'
                      ? 'bg-sky-400 text-slate-950 font-bold'
                      : 'text-sky-300 hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>wittlawfirm.com ({wittLawUsersCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrgFilter('DrFun1 Mesh')}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap cursor-pointer ${
                    orgFilter === 'DrFun1 Mesh'
                      ? 'bg-purple-400 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Core Daemons ({coreMeshUsersCount})
                </button>
              </div>

              <div className="relative w-full lg:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Filter staff, title, vHost, channel..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Inline Quick Dynamic Staff ZNC Provisioner */}
            <form
              onSubmit={handleQuickProvisionStaff}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end text-xs"
            >
              <div className="lg:col-span-3">
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Dynamic Roster Source
                </label>
                <select
                  value={quickStaffOrg}
                  onChange={(e) =>
                    setQuickStaffOrg(
                      e.target.value as 'https://www.supremecourt.gov/' | 'www.wittlawfirm.com'
                    )
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="https://www.supremecourt.gov/">
                    https://www.supremecourt.gov/
                  </option>
                  <option value="www.wittlawfirm.com">www.wittlawfirm.com</option>
                </select>
              </div>
              <div className="lg:col-span-3">
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Staff Full Name
                </label>
                <input
                  type="text"
                  required
                  value={quickStaffName}
                  onChange={(e) => setQuickStaffName(e.target.value)}
                  placeholder="e.g. Hon. Staff Counsel / Associate"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="lg:col-span-4">
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Official Court / Law Firm Role
                </label>
                <input
                  type="text"
                  value={quickStaffTitle}
                  onChange={(e) => setQuickStaffTitle(e.target.value)}
                  placeholder="e.g. Deputy Clerk / Senior Telecommunications Counsel"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="w-full px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Provision ZNC</span>
                </button>
              </div>
            </form>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 custom-nav-scrollbar">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">ZNC Login &amp; Rank</th>
                    <th className="p-3">Staff Member &amp; Organization</th>
                    <th className="p-3">Bind Host (vHost)</th>
                    <th className="p-3">Buffer</th>
                    <th className="p-3">Clients</th>
                    <th className="p-3">Buffered Channels</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 font-medium">
                  {filteredUsers.map(u => {
                    const isSelected = u.username === selectedUsername;
                    const isScotus = u.organization === 'https://www.supremecourt.gov/';
                    const isWitt = u.organization === 'www.wittlawfirm.com';
                    return (
                      <tr key={u.username} className={`hover:bg-slate-900/40 transition ${isSelected ? 'bg-emerald-950/20' : ''}`}>
                        <td className="p-3 font-mono font-bold text-white">
                          <div className="flex items-center space-x-1.5">
                            {(u.isAdmin || u.rankPrefix === '~' || u.username === 'drfun1_admin') && (
                              <span title="ZNC Admin (~ Owner)">
                                <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              </span>
                            )}
                            <span>{u.rankPrefix ? `${u.rankPrefix}${u.username}` : u.username}</span>
                          </div>
                          {u.isAdmin && (
                            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Admin = true
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="text-slate-100 font-semibold">{u.realname}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                isScotus
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : isWitt
                                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {u.organization || 'DrFun1 Mesh'}
                            </span>
                            {u.confirmationInfo && (
                              <span className="text-[10px] text-emerald-400 font-mono">
                                {u.confirmationInfo}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-slate-300 font-mono text-[11px]">{u.bindHost}</td>
                        <td className="p-3 text-emerald-400 font-mono whitespace-nowrap">{u.bufferSize.toLocaleString()} lines</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">
                            {u.connectedClients} client{u.connectedClients > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-cyan-300 text-[11px]">
                          {(u.bufferedChannels || []).slice(0, 3).join(', ')}
                          {(u.bufferedChannels?.length || 0) > 3 && ` +${(u.bufferedChannels?.length || 0) - 3} more`}
                        </td>
                        <td className="p-3 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedUsername(u.username);
                              triggerNotice(`Switched active WebAdmin view to user "${u.username}".`);
                            }}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] cursor-pointer"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setUserFormUsername(u.username);
                              setUserFormRealname(u.realname);
                              setUserFormBuffer(u.bufferSize);
                              setUserFormBindHost(u.bindHost);
                              setUserFormOrg(u.organization || 'DrFun1 Mesh');
                              setIsUserModalOpen(true);
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {u.username !== 'drfun1_admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.username)}
                              className="p-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: NETWORKS & UPSTREAM LEAVES */}
        {/* ========================================================================= */}
        {activeTab === 'networks' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Upstream IRC Networks for "{currentUser.username}"</h3>
                <p className="text-xs text-slate-400">Configure upstream UnrealIRCd connections, SASL CertFP, and auto-join lists.</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center space-x-2">
                  <Radio className="w-5 h-5 text-emerald-400" />
                  <span className="text-base font-bold text-white">Network: DrFun1-Mesh (Primary Leaf)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    CONNECTED
                  </span>
                </div>

                <button
                  onClick={() => triggerNotice('Triggered reconnect handshake to irc.drfun1.com:6697.')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Reconnect Leaf</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Hub:</span>
                    <span className="text-emerald-400 font-mono font-bold">irc.drfun1.com:6697 (SSL)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Media Leaf Node:</span>
                    <span className="text-slate-200 font-mono">irc.drfun1media.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Leaf Password:</span>
                    <span className="text-slate-400 font-mono">WittLaw_Switch_Leaf_••••••••</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Keep Nickname:</span>
                    <span className="text-emerald-400 font-semibold">Enabled (keepnick module)</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">SASL Mechanism:</span>
                    <span className="text-purple-300 font-mono font-bold">ECDSA-NIST256P-CHALLENGE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CertFP Fingerprint:</span>
                    <span className="text-cyan-300 font-mono text-[10px]">8C:F3:11:A9:72:DE:4B:90...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auto Reconnect:</span>
                    <span className="text-emerald-400 font-semibold">30 seconds retry interval</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Traffic Encoding:</span>
                    <span className="text-slate-300 font-mono">UTF-8 (RFC 1459 Strict)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CHANNELS & BUFFER REPLAY */}
        {/* ========================================================================= */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            
            {/* Top Channel Adder */}
            <form onSubmit={handleAddChannel} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-white">Add Channel to ZNC:</span>
              <input
                type="text"
                placeholder="#channel-name"
                value={newChannelName}
                onChange={e => setNewChannelName(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500 w-48"
              />
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">Buffer Lines:</span>
                <input
                  type="number"
                  value={newChannelBuffer}
                  onChange={e => setNewChannelBuffer(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono w-24 text-center focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Join &amp; Buffer</span>
              </button>
            </form>

            {/* Channels & Live Buffer Inspector Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Channel List */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Buffered Channels</h4>
                  <span className="text-[11px] text-slate-400 font-mono">{currentUser.bufferedChannels?.length || 0} active</span>
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto custom-nav-scrollbar pr-1">
                  {(currentUser.bufferedChannels || []).map(ch => {
                    const isInspected = inspectedChannel === ch;
                    return (
                      <div
                        key={ch}
                        onClick={() => setInspectedChannel(ch)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                          isInspected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2 font-mono">
                          <Hash className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{ch}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">2,000 lines</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Buffer Playback View */}
              <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white">
                        Live Scrollback Memory for <span className="text-emerald-400 font-mono">{inspectedChannel}</span>
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => triggerNotice(`Replayed ${channelBuffers[inspectedChannel]?.length || 0} messages to IRC client!`)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-300 flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Replay to Client</span>
                      </button>
                      <button
                        onClick={() => {
                          setChannelBuffers(prev => ({ ...prev, [inspectedChannel]: [] }));
                          triggerNotice(`Buffer cleared for ${inspectedChannel}.`);
                        }}
                        className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-[11px] text-red-400"
                      >
                        Clear Buffer
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs space-y-2 mt-3 min-h-[200px] max-h-60 overflow-y-auto custom-nav-scrollbar border border-slate-800">
                    {(channelBuffers[inspectedChannel] || []).length === 0 ? (
                      <div className="text-slate-500 text-center py-8">Buffer is currently empty. Waiting for channel traffic...</div>
                    ) : (
                      (channelBuffers[inspectedChannel] || []).map((msg, idx) => (
                        <div key={idx} className="flex items-start space-x-2 leading-relaxed">
                          <span className="text-slate-500 select-none">[{msg.time}]</span>
                          <span className="text-emerald-400 font-bold">&lt;{msg.sender}&gt;</span>
                          <span className="text-slate-200">{msg.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Playback Engine: <strong className="text-slate-300 font-mono">buffextras &amp; playback v1.9.1</strong></span>
                  <span>Persisted in memory across client disconnects</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: MODULES MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'modules' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">ZNC C++ Modules Inventory</h3>
                <p className="text-xs text-slate-400">Enable or disable Global, User, and Network bouncer extensions.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map(mod => {
                const isLoaded = mod.status === 'loaded';
                return (
                  <div
                    key={mod.name}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                      isLoaded
                        ? 'bg-slate-900/60 border-slate-800'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-sm text-white">{mod.name}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          mod.type === 'global' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                          mod.type === 'user' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                          'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {mod.type}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">{mod.description}</p>
                      
                      {mod.args && (
                        <div className="text-[11px] font-mono text-slate-400 mt-2 bg-slate-950 p-1.5 rounded border border-slate-800/80">
                          Args: {mod.args}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isLoaded ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {isLoaded ? '● Loaded' : '○ Unloaded'}
                      </span>

                      <button
                        onClick={() => handleToggleModule(mod.name)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          isLoaded
                            ? 'bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
                        }`}
                      >
                        {isLoaded ? 'Unload' : 'Load Module'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: LISTENERS & SSL PORTS */}
        {/* ========================================================================= */}
        {activeTab === 'listeners' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">Active ZNC Listening Sockets</h3>
              <p className="text-xs text-slate-400">Incoming ports for IRC client connections and the HTTPS WebAdmin GUI.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-sm">Listener: l-irc (Port 6697)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs">SSL/TLS</span>
                </div>
                <div className="text-xs space-y-1 text-slate-300">
                  <div>Protocol: <strong className="text-white">IRC Bouncer Protocol</strong></div>
                  <div>Binding: <strong className="text-white font-mono">0.0.0.0 (IPv4) &amp; [::] (IPv6)</strong></div>
                  <div>Target Upstream: <strong className="text-cyan-300 font-mono">irc.drfun1.com:6697</strong></div>
                  <div>Certificate: <strong className="text-emerald-400">Switch SUPERNAP Let's Encrypt Wildcard</strong></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-sm">Listener: l-web (Port 5000)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs">HTTPS</span>
                </div>
                <div className="text-xs space-y-1 text-slate-300">
                  <div>Protocol: <strong className="text-white">ZNC webadmin GUI</strong></div>
                  <div>URL: <strong className="text-cyan-300 font-mono">https://irc.drfun1media.com:5000</strong></div>
                  <div>Authentication: <strong className="text-white">ZNC User Accounts / SASL</strong></div>
                  <div>Encryption: <strong className="text-emerald-400">TLSv1.3 Strict HTTPS</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: LIVE ZNC.CONF GENERATOR */}
        {/* ========================================================================= */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">ZNC Configuration File (znc.conf)</h3>
                <p className="text-xs text-slate-400">Generated dynamically from active accounts, leaf peering, and loaded modules.</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(generatedZncConf, 'zncConf')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white border border-slate-700 flex items-center space-x-1.5 transition"
                >
                  {copiedKey === 'zncConf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'zncConf' ? 'Copied' : 'Copy znc.conf'}</span>
                </button>

                <button
                  onClick={() => {
                    const blob = new Blob([generatedZncConf], { type: 'text/plain;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', 'znc.conf');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    triggerNotice('Downloaded znc.conf file.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-[460px] custom-nav-scrollbar text-slate-200 whitespace-pre">
              {generatedZncConf}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: INTERACTIVE *CONTROLPANEL TERMINAL */}
        {/* ========================================================================= */}
        {activeTab === 'console' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">*controlpanel Interactive Terminal</h3>
                <p className="text-xs text-slate-400">Issue direct ZNC management commands or query internal state.</p>
              </div>

              <div className="flex items-center space-x-2">
                {['uptime', 'traffic', 'listusers', 'rehash'].map(cmd => (
                  <button
                    key={cmd}
                    onClick={() => {
                      setConsoleInput(cmd);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-1.5 min-h-[300px] max-h-80 overflow-y-auto custom-nav-scrollbar">
              {consoleHistory.map((line, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className={
                    line.includes('>') ? 'text-cyan-400 font-bold' :
                    line.includes('Rehashed') ? 'text-emerald-400 font-bold' :
                    line.includes('***') ? 'text-slate-400' :
                    'text-slate-200'
                  }>
                    {line}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleRunConsoleCommand} className="flex items-center space-x-2">
              <span className="text-emerald-400 font-mono font-bold">$</span>
              <input
                type="text"
                placeholder="Type ZNC command (e.g. /msg *controlpanel listusers, rehash, uptime)..."
                value={consoleInput}
                onChange={e => setConsoleInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Send
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Modal: Add / Edit ZNC User */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white">
                {editingUser ? `Edit ZNC User "${editingUser.username}"` : 'Create New ZNC User'}
              </h4>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Username / Bouncer Login</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. news_broadcaster"
                  value={userFormUsername}
                  onChange={e => setUserFormUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Real Name / Station Title</label>
                <input
                  type="text"
                  placeholder="e.g. DRFUN1 PEG Station Producer"
                  value={userFormRealname}
                  onChange={e => setUserFormRealname(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organization Directory</label>
                <select
                  value={userFormOrg}
                  onChange={e =>
                    setUserFormOrg(
                      e.target.value as 'https://www.supremecourt.gov/' | 'www.wittlawfirm.com' | 'DrFun1 Mesh'
                    )
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="https://www.supremecourt.gov/">https://www.supremecourt.gov/</option>
                  <option value="www.wittlawfirm.com">www.wittlawfirm.com</option>
                  <option value="DrFun1 Mesh">DrFun1 Mesh</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Buffer Lines</label>
                  <select
                    value={userFormBuffer}
                    onChange={e => setUserFormBuffer(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  >
                    <option value={100}>100 lines (Cadet Free)</option>
                    <option value={2000}>2,000 lines (Pro Broadcaster)</option>
                    <option value={5000}>5,000 lines (Satcom Enterprise)</option>
                    <option value={10000}>10,000 lines (VIP Council)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bind Host</label>
                  <input
                    type="text"
                    value={userFormBindHost}
                    onChange={e => setUserFormBindHost(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
