/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * Hybrid Open Proxy Monitor (HOPM) Console — UnrealIRCd 6.1.4 4-Hub Protection
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  Square,
  RefreshCw,
  Download,
  Copy,
  Check,
  Search,
  Plus,
  Trash2,
  Terminal,
  Server,
  Globe,
  FileCode2,
  Package,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  HopmBanAction,
  HopmBanDuration,
  HopmDaemonState,
  HopmDetectionEvent,
  HopmDnsblZone,
  HopmExemptEntry,
  HopmScanReport,
  HopmScannerProtocol,
} from '../types/hopm';
import {
  CORE_HOPM_HUBS,
  evaluateIpAgainstHopm,
  generateHopmConf,
  generateHopmInstallScript,
  generateUnrealHopmOperBlock,
  loadHopmWorkspace,
  saveHopmWorkspace,
} from '../data/hopmData';
import { createZipBlob, triggerBlobDownload } from '../utils/zipBuilder';

interface HopmMonitorConsoleProps {
  onNotice?: (message: string) => void;
  onIssueBanToUnreal?: (
    banType: 'KLINE' | 'GLINE' | 'ZLINE' | 'SHUN',
    mask: string,
    reason: string,
    duration: string
  ) => void;
}

export const HopmMonitorConsole: React.FC<HopmMonitorConsoleProps> = ({
  onNotice,
  onIssueBanToUnreal,
}) => {
  const initial = useMemo(() => loadHopmWorkspace(), []);
  const [daemon, setDaemon] = useState<HopmDaemonState>(initial.daemon);
  const [scanners, setScanners] = useState<HopmScannerProtocol[]>(initial.scanners);
  const [dnsbls, setDnsbls] = useState<HopmDnsblZone[]>(initial.dnsbls);
  const [exempts, setExempts] = useState<HopmExemptEntry[]>(initial.exempts);
  const [events, setEvents] = useState<HopmDetectionEvent[]>(initial.events);

  const [consoleTab, setConsoleTab] = useState<'overview' | 'scanners' | 'dnsbl_exempt' | 'config_install'>('overview');
  const [configDocTab, setConfigDocTab] = useState<'hopm_conf' | 'unreal_oper' | 'install_sh'>('hopm_conf');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [installLogs, setInstallLogs] = useState<string[]>([
    `[OK] Cloned https://github.com/ircd-hybrid/hopm.git (v${initial.daemon.version})`,
    `[OK] ./configure --prefix=${initial.daemon.installPath} --enable-openssl && make && make install`,
    `[OK] Wrote ${initial.daemon.installPath}/etc/hopm.conf (4 hubs: irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net, drfun1ircd.com)`,
    `[OK] systemd unit ${initial.daemon.systemdUnit} active (oper ${initial.daemon.operNick}, snomask +cF)`,
  ]);
  const [isInstalling, setIsInstalling] = useState(false);

  // Interactive scanner form state
  const [scanIp, setScanIp] = useState('185.220.101.42');
  const [scanNick, setScanNick] = useState('tor_probe99');
  const [scanHub, setScanHub] = useState(CORE_HOPM_HUBS[0].domain);
  const [scanMode, setScanMode] = useState<'auto' | 'socks5' | 'http' | 'dnsbl' | 'clean'>('auto');
  const [lastReport, setLastReport] = useState<HopmScanReport | null>(null);

  // Custom form inputs
  const [newPortInputs, setNewPortInputs] = useState<Record<string, string>>({});
  const [newDnsblZone, setNewDnsblZone] = useState('');
  const [newDnsblReason, setNewDnsblReason] = useState('Listed open proxy / abuse host');
  const [newExemptMask, setNewExemptMask] = useState('');
  const [newExemptReason, setNewExemptReason] = useState('');

  useEffect(() => {
    saveHopmWorkspace({ daemon, scanners, dnsbls, exempts, events });
  }, [daemon, scanners, dnsbls, exempts, events]);

  const notify = (msg: string) => {
    if (onNotice) onNotice(msg);
  };

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
    notify(`${label} copied to clipboard`);
  };

  const hopmConfText = useMemo(
    () => generateHopmConf(daemon, scanners, dnsbls, exempts),
    [daemon, scanners, dnsbls, exempts]
  );

  const unrealOperText = useMemo(() => generateUnrealHopmOperBlock(daemon), [daemon]);

  const installScriptText = useMemo(
    () => generateHopmInstallScript(daemon, hopmConfText),
    [daemon, hopmConfText]
  );

  const runInstallSequence = () => {
    setIsInstalling(true);
    const nowUtc = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const steps = [
      `[${nowUtc}] apt-get install -y build-essential autoconf automake libtool libssl-dev git`,
      `[${nowUtc}] git clone ${daemon.repoUrl} /tmp/hopm-src`,
      `[${nowUtc}] ./configure --prefix=${daemon.installPath} --enable-openssl && make -j4 && make install`,
      `[${nowUtc}] Generated ${daemon.installPath}/etc/hopm.conf for ${daemon.monitoredHubs.length} UnrealIRCd hubs`,
      `[${nowUtc}] systemctl enable --now ${daemon.systemdUnit} -> ACTIVE (oper ${daemon.operNick} snomask +cF)`,
    ];
    setInstallLogs(steps);
    setDaemon((prev) => ({
      ...prev,
      installed: true,
      status: 'running',
      installedAt: nowUtc,
      lastRehashAt: nowUtc,
    }));
    setTimeout(() => {
      setIsInstalling(false);
      notify(`HOPM ${daemon.version} installed and active across ${daemon.monitoredHubs.length}/4 hubs`);
    }, 250);
  };

  const handleToggleDaemon = () => {
    if (!daemon.installed) {
      runInstallSequence();
      return;
    }
    const nextStatus = daemon.status === 'running' ? 'stopped' : 'running';
    setDaemon((prev) => ({
      ...prev,
      status: nextStatus,
    }));
    notify(`HOPM daemon ${nextStatus === 'running' ? 'started' : 'stopped'} (${daemon.systemdUnit})`);
  };

  const handleRehash = () => {
    const nowUtc = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    setDaemon((prev) => ({ ...prev, lastRehashAt: nowUtc }));
    notify(`HOPM configuration rehashed across ${daemon.monitoredHubs.length} hubs`);
  };

  const handleToggleHub = (hubDomain: string) => {
    setDaemon((prev) => {
      const exists = prev.monitoredHubs.includes(hubDomain);
      if (exists && prev.monitoredHubs.length === 1) {
        notify('At least one core hub must remain monitored by HOPM');
        return prev;
      }
      const nextHubs = exists
        ? prev.monitoredHubs.filter((h) => h !== hubDomain)
        : [...prev.monitoredHubs, hubDomain];
      return { ...prev, monitoredHubs: nextHubs };
    });
  };

  const handleRunScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!daemon.installed || daemon.status !== 'running') {
      notify('Start or install the HOPM daemon before scanning IPs');
      return;
    }
    const report = evaluateIpAgainstHopm(
      scanIp,
      scanNick,
      scanHub,
      daemon,
      scanners,
      dnsbls,
      exempts,
      scanMode
    );
    setLastReport(report);
    setEvents((prev) => [report.event, ...prev.slice(0, 49)]);

    if (report.verdict === 'PROXY_DETECTED' || report.verdict === 'DNSBL_LISTED') {
      // Increment scanner / dnsbl hit counters
      const hitScannerNames = new Set(
        report.probes.filter((p) => p.status === 'OPEN_HIT').map((p) => p.checkName.split(':')[0])
      );
      const hitDnsblNames = new Set(
        report.probes.filter((p) => p.status === 'LISTED').map((p) => p.checkName)
      );
      if (hitScannerNames.size > 0) {
        setScanners((prev) =>
          prev.map((s) => (hitScannerNames.has(s.protocol) ? { ...s, hits: s.hits + 1 } : s))
        );
      }
      if (hitDnsblNames.size > 0) {
        setDnsbls((prev) =>
          prev.map((d) => (hitDnsblNames.has(d.zone) ? { ...d, hits: d.hits + 1 } : d))
        );
      }
      if (onIssueBanToUnreal) {
        const mappedBan = daemon.banAction === 'GZLINE' ? 'ZLINE' : daemon.banAction === 'GLINE' ? 'GLINE' : 'KLINE';
        onIssueBanToUnreal(
          mappedBan,
          `*@${report.ip}`,
          `[HOPM] ${report.event.detail}`,
          report.event.duration
        );
      }
      notify(`HOPM ${report.actionIssued} issued for ${report.ip} (${report.event.detail})`);
    } else {
      notify(`HOPM scan complete for ${report.ip}: ${report.verdict}`);
    }
  };

  const handleToggleScanner = (id: string) => {
    setScanners((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const handleAddPortToScanner = (id: string) => {
    const raw = (newPortInputs[id] || '').trim();
    const port = Number(raw);
    if (!Number.isInteger(port) || port < 1 || port > 65535) return;
    setScanners((prev) =>
      prev.map((s) =>
        s.id === id && !s.ports.includes(port) ? { ...s, ports: [...s.ports, port] } : s
      )
    );
    setNewPortInputs((prev) => ({ ...prev, [id]: '' }));
    notify(`Added port ${port} to HOPM scanner probe list`);
  };

  const handleRemovePort = (id: string, port: number) => {
    setScanners((prev) =>
      prev.map((s) =>
        s.id === id && s.ports.length > 1
          ? { ...s, ports: s.ports.filter((p) => p !== port) }
          : s
      )
    );
  };

  const handleAddDnsbl = (e: React.FormEvent) => {
    e.preventDefault();
    const zone = newDnsblZone.trim().toLowerCase();
    if (!zone) return;
    if (dnsbls.some((d) => d.zone === zone)) {
      notify(`DNSBL zone ${zone} already configured`);
      return;
    }
    setDnsbls((prev) => [
      {
        id: `dnsbl-${Date.now()}`,
        zone,
        replyBitmasks: '1,2,3,4,5',
        enabled: true,
        banReason: newDnsblReason.trim() || `Listed in ${zone}`,
        hits: 0,
      },
      ...prev,
    ]);
    setNewDnsblZone('');
    notify(`Added DNSBL zone ${zone} to HOPM`);
  };

  const handleAddExempt = (e: React.FormEvent) => {
    e.preventDefault();
    const mask = newExemptMask.trim();
    if (!mask) return;
    setExempts((prev) => [
      {
        id: `ex-${Date.now()}`,
        mask,
        reason: newExemptReason.trim() || 'Operator approved exemption',
        addedBy: daemon.operNick,
        addedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
      },
      ...prev,
    ]);
    setNewExemptMask('');
    setNewExemptReason('');
    notify(`Added exempt CIDR/mask ${mask}`);
  };

  const handleDownloadZipBundle = () => {
    const systemdService = `[Unit]
Description=Hybrid Open Proxy Monitor (HOPM ${daemon.version}) - DrFun1 4-Hub Security
After=network-online.target unrealircd.service
Wants=network-online.target

[Service]
Type=forking
PIDFile=${daemon.installPath}/var/hopm.pid
ExecStart=${daemon.installPath}/bin/hopm -c ${daemon.installPath}/etc/hopm.conf
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=5
LimitNOFILE=${daemon.fdLimit}

[Install]
WantedBy=multi-user.target
`;
    const readme = `DrFun1Media / Witt Law Firm HOPM ${daemon.version} Deployment Bundle
====================================================================
Source Repository: ${daemon.repoUrl}
Monitored Hubs (${daemon.monitoredHubs.length}): ${daemon.monitoredHubs.join(', ')}

Quick Install (Ubuntu / Debian):
  chmod +x install-hopm.sh
  sudo ./install-hopm.sh

Then include unrealircd-hopm.conf inside unrealircd.conf on each hub and run /REHASH.
`;
    const blob = createZipBlob([
      { path: 'hopm/hopm.conf', content: hopmConfText },
      { path: 'hopm/unrealircd-hopm.conf', content: unrealOperText },
      { path: 'hopm/install-hopm.sh', content: installScriptText },
      { path: 'hopm/hopm.service', content: systemdService },
      { path: 'hopm/README.txt', content: readme },
    ]);
    triggerBlobDownload(blob, `drfun1-hopm-${daemon.version}-bundle.zip`);
    notify(`Downloaded drfun1-hopm-${daemon.version}-bundle.zip`);
  };

  const totalScannerHits = scanners.reduce((acc, s) => acc + s.hits, 0);
  const totalDnsblHits = dnsbls.reduce((acc, d) => acc + d.hits, 0);
  const activeScannerCount = scanners.filter((s) => s.enabled).length;
  const activeDnsblCount = dnsbls.filter((d) => d.enabled).length;

  return (
    <div className="space-y-4">
      {/* Top Daemon Status & Install Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
              daemon.status === 'running'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                HOPM {daemon.version} — Hybrid Open Proxy Monitor
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                  daemon.status === 'running'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                }`}
              >
                {daemon.installed ? (daemon.status === 'running' ? 'INSTALLED & RUNNING' : 'STOPPED') : 'NOT INSTALLED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {daemon.repoUrl} · {daemon.installPath}/bin/hopm · oper {daemon.operNick} (snomask +cF) · Last Rehash: {daemon.lastRehashAt}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleToggleDaemon}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer ${
              daemon.status === 'running'
                ? 'bg-red-950/60 hover:bg-red-900/70 text-red-200 border-red-500/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-400'
            }`}
          >
            {daemon.status === 'running' ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{daemon.status === 'running' ? 'Stop Daemon' : 'Start HOPM'}</span>
          </button>

          <button
            onClick={handleRehash}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rehash Conf</span>
          </button>

          <button
            onClick={runInstallSequence}
            disabled={isInstalling}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-sky-950/70 hover:bg-sky-900/70 text-sky-200 border border-sky-500/40 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>{isInstalling ? 'Installing...' : 'Re-Run Install'}</span>
          </button>

          <button
            onClick={handleDownloadZipBundle}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Download .zip Bundle</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Daemon State</div>
          <div className={`text-sm font-mono font-bold mt-1 ${daemon.status === 'running' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {daemon.status === 'running' ? 'ACTIVE (systemd)' : 'STANDBY'}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Hubs Linked</div>
          <div className="text-sm font-mono font-bold text-white mt-1 tabular-nums">
            {daemon.monitoredHubs.length} / {CORE_HOPM_HUBS.length} Hubs
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Proxy Scanners</div>
          <div className="text-sm font-mono font-bold text-sky-400 mt-1 tabular-nums">
            {activeScannerCount} / {scanners.length} Enabled
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">DNSBL Zones</div>
          <div className="text-sm font-mono font-bold text-purple-400 mt-1 tabular-nums">
            {activeDnsblCount} / {dnsbls.length} Active
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Total Blocked</div>
          <div className="text-sm font-mono font-bold text-rose-400 mt-1 tabular-nums">
            {(totalScannerHits + totalDnsblHits).toLocaleString()} Hosts
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Exempt CIDRs</div>
          <div className="text-sm font-mono font-bold text-emerald-400 mt-1 tabular-nums">
            {exempts.length} Ranges
          </div>
        </div>
      </div>

      {/* Console Sub-Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto">
        <button
          onClick={() => setConsoleTab('overview')}
          className={`px-3.5 py-2 text-xs font-mono font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            consoleTab === 'overview'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Overview &amp; Live IP Scanner
        </button>
        <button
          onClick={() => setConsoleTab('scanners')}
          className={`px-3.5 py-2 text-xs font-mono font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            consoleTab === 'scanners'
              ? 'border-sky-400 text-sky-300 bg-sky-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Proxy Scanners &amp; Ports ({activeScannerCount})
        </button>
        <button
          onClick={() => setConsoleTab('dnsbl_exempt')}
          className={`px-3.5 py-2 text-xs font-mono font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            consoleTab === 'dnsbl_exempt'
              ? 'border-purple-400 text-purple-300 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          DNSBL Zones &amp; Exempt CIDRs ({exempts.length})
        </button>
        <button
          onClick={() => setConsoleTab('config_install')}
          className={`px-3.5 py-2 text-xs font-mono font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            consoleTab === 'config_install'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          hopm.conf, UnrealIRCd Oper &amp; Install Script
        </button>
      </div>

      {/* TAB 1: OVERVIEW & LIVE IP SCANNER */}
      {consoleTab === 'overview' && (
        <div className="space-y-4">
          {/* Interactive Proxy / DNSBL Scanner + Enforcement Settings */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Scanner Box (7 cols) */}
            <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-400" />
                    <span>Live IP / Connection Notice (+c) Proxy &amp; DNSBL Scanner</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Simulate an incoming UnrealIRCd <span className="font-mono text-slate-300">snomask +c</span> client connection or run <span className="font-mono text-slate-300">/quote HOPM CHECK</span> on any IPv4 address.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRunScan} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Target IPv4</label>
                  <input
                    type="text"
                    value={scanIp}
                    onChange={(e) => setScanIp(e.target.value)}
                    placeholder="185.220.101.42"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Client Nick</label>
                  <input
                    type="text"
                    value={scanNick}
                    onChange={(e) => setScanNick(e.target.value)}
                    placeholder="guest_user"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Hub</label>
                  <select
                    value={scanHub}
                    onChange={(e) => setScanHub(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CORE_HOPM_HUBS.map((h) => (
                      <option key={h.domain} value={h.domain}>
                        {h.domain} (SID {h.sid})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold transition cursor-pointer"
                  >
                    Scan IP
                  </button>
                </div>
              </form>

              {/* Preset Test Vectors */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-mono text-slate-400 mr-1">Test Vectors:</span>
                {[
                  { label: 'Tor Exit (185.220.101.42)', ip: '185.220.101.42', nick: 'tor_relay42', mode: 'auto' as const },
                  { label: 'Open SOCKS5 (45.155.205.88)', ip: '45.155.205.88', nick: 'socks_node', mode: 'socks5' as const },
                  { label: 'HTTP Proxy (194.26.135.14)', ip: '194.26.135.14', nick: 'squid_proxy', mode: 'http' as const },
                  { label: 'Switch Exempt (198.51.100.25)', ip: '198.51.100.25', nick: 'switch_leaf', mode: 'auto' as const },
                  { label: 'Clean Host (74.125.224.72)', ip: '74.125.224.72', nick: 'clean_viewer', mode: 'clean' as const },
                ].map((preset) => (
                  <button
                    key={preset.ip}
                    type="button"
                    onClick={() => {
                      setScanIp(preset.ip);
                      setScanNick(preset.nick);
                      setScanMode(preset.mode);
                    }}
                    className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 cursor-pointer transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Latest Scan Breakdown */}
              {lastReport && (
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      {lastReport.verdict === 'CLEAN' || lastReport.verdict === 'EXEMPT' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      )}
                      <span className="font-bold text-white">{lastReport.ip}</span>
                      <span className="text-slate-400">on {lastReport.hub}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        lastReport.verdict === 'CLEAN' || lastReport.verdict === 'EXEMPT'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {lastReport.verdict} → {lastReport.actionIssued}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {lastReport.probes.map((probe, idx) => (
                      <div
                        key={`${probe.checkName}-${idx}`}
                        className="flex items-center justify-between px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono"
                      >
                        <span className="text-slate-300 truncate">{probe.checkName}</span>
                        <span
                          className={
                            probe.status === 'OPEN_HIT' || probe.status === 'LISTED'
                              ? 'text-rose-400 font-bold'
                              : probe.status === 'EXEMPT'
                                ? 'text-sky-400 font-bold'
                                : 'text-slate-500'
                          }
                        >
                          {probe.status} ({probe.latencyMs}ms)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4-Hub Coverage & Ban Policy (5 cols) */}
            <div className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-sky-400" />
                  <span>4-Hub IRCd Link &amp; Ban Policy</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  Oper: {daemon.operNick} (+cF)
                </span>
              </div>

              <div className="space-y-1.5">
                {CORE_HOPM_HUBS.map((hub) => {
                  const active = daemon.monitoredHubs.includes(hub.domain);
                  return (
                    <div
                      key={hub.domain}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950 border border-slate-800"
                    >
                      <div>
                        <div className="text-xs font-mono font-bold text-white">
                          {hub.domain} <span className="text-slate-500">(SID {hub.sid})</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{hub.location} · {hub.ip}:6697 TLS</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleHub(hub.domain)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border cursor-pointer transition ${
                          active
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        {active ? 'MONITORED' : 'PAUSED'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Ban Action</label>
                  <select
                    value={daemon.banAction}
                    onChange={(e) => setDaemon((p) => ({ ...p, banAction: e.target.value as HopmBanAction }))}
                    className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                  >
                    <option value="GZLINE">GZLINE (Global IP)</option>
                    <option value="GLINE">GLINE (Global User)</option>
                    <option value="KLINE">KLINE (Local Hub)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Duration</label>
                  <select
                    value={daemon.banDuration}
                    onChange={(e) => setDaemon((p) => ({ ...p, banDuration: e.target.value as HopmBanDuration }))}
                    className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                  >
                    <option value="1d">1d (24 Hours)</option>
                    <option value="7d">7d (7 Days)</option>
                    <option value="30d">30d (30 Days)</option>
                    <option value="0">0 (Permanent)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">NegCache (s)</label>
                  <input
                    type="number"
                    min={60}
                    max={86400}
                    value={daemon.negCacheSeconds}
                    onChange={(e) => setDaemon((p) => ({ ...p, negCacheSeconds: Math.max(60, Number(e.target.value) || 3600) }))}
                    className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-white tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Install Log & Detection History */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>Recent HOPM Detections &amp; Auto-Bans ({events.length})</span>
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="py-2 pr-3">Time</th>
                      <th className="py-2 pr-3">Host / Nick</th>
                      <th className="py-2 pr-3">Hub</th>
                      <th className="py-2 pr-3">Detection</th>
                      <th className="py-2 pr-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {events.slice(0, 12).map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-950/60">
                        <td className="py-2 pr-3 text-slate-400 whitespace-nowrap tabular-nums">{evt.timestamp}</td>
                        <td className="py-2 pr-3 text-white whitespace-nowrap">
                          {evt.nick} <span className="text-slate-400">({evt.ip})</span>
                        </td>
                        <td className="py-2 pr-3 text-sky-300 whitespace-nowrap">{evt.hub}</td>
                        <td className="py-2 pr-3 text-slate-300">{evt.detail}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              evt.detectionSource === 'CLEAN' || evt.detectionSource === 'EXEMPT'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-rose-500/15 text-rose-300'
                            }`}
                          >
                            {evt.actionIssued} ({evt.duration})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="xl:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <span>HOPM Install &amp; Build Verification</span>
              </h4>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-emerald-300 space-y-1.5 max-h-60 overflow-y-auto">
                {installLogs.map((line, i) => (
                  <div key={i} className="leading-relaxed">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCANNERS & PORTS */}
      {consoleTab === 'scanners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scanners.map((sc) => (
            <div key={sc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-mono font-bold text-white">{sc.protocol} Proxy Scanner</h4>
                  <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                    Hits: {sc.hits.toLocaleString()} · Timeout: {sc.timeoutSec}s · Target {sc.targetIp}:{sc.targetPort}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleScanner(sc.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border cursor-pointer ${
                    sc.enabled
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-700'
                  }`}
                >
                  {sc.enabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {sc.ports.map((port) => (
                  <span
                    key={port}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-sky-300 tabular-nums"
                  >
                    <span>:{port}</span>
                    {sc.ports.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePort(sc.id, port)}
                        className="text-slate-500 hover:text-rose-400 cursor-pointer"
                        title={`Remove port ${port}`}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min={1}
                  max={65535}
                  placeholder="Add port (e.g. 8888)"
                  value={newPortInputs[sc.id] || ''}
                  onChange={(e) => setNewPortInputs((p) => ({ ...p, [sc.id]: e.target.value }))}
                  className="flex-1 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddPortToScanner(sc.id)}
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white border border-slate-700 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: DNSBL ZONES & EXEMPT CIDRS */}
      {consoleTab === 'dnsbl_exempt' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* DNSBL Zones */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>DNSBL Real-Time Blacklist Zones ({dnsbls.length})</span>
              </h4>
            </div>

            <form onSubmit={handleAddDnsbl} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                value={newDnsblZone}
                onChange={(e) => setNewDnsblZone(e.target.value)}
                placeholder="dnsbl.example.org"
                className="sm:col-span-5 px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-white"
              />
              <input
                type="text"
                value={newDnsblReason}
                onChange={(e) => setNewDnsblReason(e.target.value)}
                placeholder="GZLINE ban reason"
                className="sm:col-span-5 px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-white"
              />
              <button
                type="submit"
                className="sm:col-span-2 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold cursor-pointer"
              >
                Add Zone
              </button>
            </form>

            <div className="space-y-2">
              {dnsbls.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-mono font-bold text-white">{d.zone}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Bitmasks: <span className="font-mono text-slate-300">{d.replyBitmasks}</span> · Hits:{' '}
                      <span className="font-mono text-rose-400 tabular-nums">{d.hits.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDnsbls((prev) => prev.map((item) => (item.id === d.id ? { ...item, enabled: !item.enabled } : item)))
                    }
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border cursor-pointer ${
                      d.enabled
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {d.enabled ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exempt CIDRs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Exempt IP / CIDR Allowlist ({exempts.length})</span>
            </h4>

            <form onSubmit={handleAddExempt} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                value={newExemptMask}
                onChange={(e) => setNewExemptMask(e.target.value)}
                placeholder="203.0.113.0/24"
                className="sm:col-span-4 px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-white"
              />
              <input
                type="text"
                value={newExemptReason}
                onChange={(e) => setNewExemptReason(e.target.value)}
                placeholder="Carrier / Law Office exemption note"
                className="sm:col-span-6 px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-white"
              />
              <button
                type="submit"
                className="sm:col-span-2 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold cursor-pointer"
              >
                Exempt
              </button>
            </form>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {exempts.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-mono font-bold text-emerald-300">{ex.mask}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{ex.reason}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setExempts((prev) => prev.filter((item) => item.id !== ex.id));
                      notify(`Removed exempt mask ${ex.mask}`);
                    }}
                    className="p-1.5 rounded bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer"
                    title="Remove exempt mask"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONFIG & INSTALL BUNDLE */}
      {consoleTab === 'config_install' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfigDocTab('hopm_conf')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                  configDocTab === 'hopm_conf'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                hopm.conf ({daemon.monitoredHubs.length} Hubs)
              </button>
              <button
                type="button"
                onClick={() => setConfigDocTab('unreal_oper')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                  configDocTab === 'unreal_oper'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                unrealircd.conf (oper {daemon.operNick})
              </button>
              <button
                type="button"
                onClick={() => setConfigDocTab('install_sh')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                  configDocTab === 'install_sh'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                install-hopm.sh (Ubuntu/Debian + systemd)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const activeText =
                    configDocTab === 'hopm_conf'
                      ? hopmConfText
                      : configDocTab === 'unreal_oper'
                        ? unrealOperText
                        : installScriptText;
                  handleCopy(activeText, configDocTab, configDocTab);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white border border-slate-700 cursor-pointer flex items-center gap-1.5"
              >
                {copiedId === configDocTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === configDocTab ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const filename =
                    configDocTab === 'hopm_conf'
                      ? 'hopm.conf'
                      : configDocTab === 'unreal_oper'
                        ? 'unrealircd-hopm.conf'
                        : 'install-hopm.sh';
                  const activeText =
                    configDocTab === 'hopm_conf'
                      ? hopmConfText
                      : configDocTab === 'unreal_oper'
                        ? unrealOperText
                        : installScriptText;
                  triggerBlobDownload(new Blob([activeText], { type: 'text/plain' }), filename);
                  notify(`Downloaded ${filename}`);
                }}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-mono font-bold text-slate-950 cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[460px] overflow-y-auto leading-relaxed">
            {configDocTab === 'hopm_conf'
              ? hopmConfText
              : configDocTab === 'unreal_oper'
                ? unrealOperText
                : installScriptText}
          </pre>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
            <span>
              All changes made in Scanners, DNSBL Zones, Exempt CIDRs, and Hub Policy automatically regenerate <span className="text-slate-200">hopm.conf</span> and <span className="text-slate-200">install-hopm.sh</span>.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
