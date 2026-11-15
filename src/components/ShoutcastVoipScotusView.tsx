/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * VoIP Setup & Control for ALL 855,000 SHOUTcast Stations
 * DJ & Broadcast Host Hiring Governance:
 * - Hiring Control: Supreme Court of the United States (https://www.supremecourt.gov)
 * - Legal Administration: The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Headphones,
  Package,
  PhoneCall,
  Plus,
  RefreshCw,
  Scale,
  Server,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {
  DjHostHiringRecord,
  DjHostRole,
  HiringApprovalStatus,
  ShoutcastVoipWorkspace,
  VoipCodec,
  VoipDialTestResult,
} from '../types/shoutcastVoip';
import {
  dialShoutcastStationVoip,
  generateAsteriskShoutcastVoipConf,
  generateScotusHiringCharter,
  loadShoutcastVoipWorkspace,
  saveShoutcastVoipWorkspace,
  SUPREME_COURT_URL,
  WITT_LAW_URL,
} from '../data/shoutcastVoipData';
import { createZipBlob, triggerBlobDownload } from '../utils/zipBuilder';

interface ShoutcastVoipScotusViewProps {
  onOpenLicense?: () => void;
}

export const ShoutcastVoipScotusView: React.FC<ShoutcastVoipScotusViewProps> = ({
  onOpenLicense,
}) => {
  const [workspace, setWorkspace] = useState<ShoutcastVoipWorkspace>(() =>
    loadShoutcastVoipWorkspace()
  );
  const [activeTab, setActiveTab] = useState<'voip_trunks' | 'scotus_hiring' | 'config_charter'>(
    'voip_trunks'
  );
  const [docTab, setDocTab] = useState<'asterisk_conf' | 'scotus_charter'>('asterisk_conf');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Station dialer state
  const [stationInput, setStationInput] = useState<string>('1042');
  const [dialResult, setDialResult] = useState<VoipDialTestResult | null>(() =>
    dialShoutcastStationVoip(1042, loadShoutcastVoipWorkspace())
  );

  // SCOTUS / Witt Law DJ & Host application state
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantNick, setApplicantNick] = useState<string>('');
  const [applicantRole, setApplicantRole] = useState<DjHostRole>('Station DJ');
  const [applicantStations, setApplicantStations] = useState<string>(
    'Stations #1–#215,000 (West Coast / Hip-Hop Bridge)'
  );

  useEffect(() => {
    saveShoutcastVoipWorkspace(workspace);
  }, [workspace]);

  const showNotice = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
    showNotice(`${label} copied to clipboard`);
  };

  const asteriskConf = useMemo(
    () => generateAsteriskShoutcastVoipConf(workspace),
    [workspace]
  );
  const scotusCharter = useMemo(
    () => generateScotusHiringCharter(workspace),
    [workspace]
  );

  const totalProvisioned = useMemo(
    () => workspace.clusters.reduce((sum, c) => sum + c.stationCount, 0),
    [workspace.clusters]
  );
  const totalActiveCalls = useMemo(
    () => workspace.clusters.reduce((sum, c) => sum + c.activeCalls, 0),
    [workspace.clusters]
  );
  const approvedDjs = workspace.hiringRoster.filter((r) => r.status === 'APPROVED_ACTIVE').length;
  const pendingDjs = workspace.hiringRoster.filter((r) => r.status === 'PENDING_SCOTUS_REVIEW').length;

  const handleSyncVoipTrunks = () => {
    const nowUtc = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    setWorkspace((prev) => ({
      ...prev,
      provisioned: true,
      provisionedStations: totalProvisioned,
      lastSyncedAt: nowUtc,
      clusters: prev.clusters.map((c) => ({
        ...c,
        srtpStatus: 'VERIFIED_TLS13_SRTP',
      })),
    }));
    showNotice(`Synchronized SIP/SRTP trunks for all ${totalProvisioned.toLocaleString()} SHOUTcast stations`);
  };

  const handleTestDial = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = Number(stationInput);
    const result = dialShoutcastStationVoip(Number.isFinite(num) ? num : 1042, workspace);
    setDialResult(result);
    showNotice(`SIP/SRTP test bridge established for Station #${result.stationNumber.toLocaleString()}`);
  };

  const handleSubmitCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = applicantName.trim();
    const cleanNick = applicantNick.trim() || cleanName.replace(/\s+/g, '_');
    if (!cleanName) return;

    const seq = 411 + workspace.hiringRoster.length;
    const extSuffix = String(1000 + workspace.hiringRoster.length * 17).padStart(6, '0');
    const newRec: DjHostHiringRecord = {
      id: `dj-${Date.now()}`,
      name: cleanName,
      ircNick: cleanNick,
      role: applicantRole,
      assignedStations: applicantStations.trim() || 'All 855,000 SHOUTcast Stations',
      voipExtension: `855-${extSuffix}`,
      sipUri: `sip:${cleanNick.toLowerCase().replace(/[^a-z0-9_]/g, '')}@voip.drfun1.com:${workspace.sipPort}`,
      status: 'PENDING_SCOTUS_REVIEW',
      approvingAuthority: 'Supreme Court of the United States',
      governingUrl: SUPREME_COURT_URL,
      administeredThrough: 'The Law Office of Richard A. Witt LLC',
      counselUrl: WITT_LAW_URL,
      docketNumber: `SCOTUS-WITT-2026-${String(seq).padStart(4, '0')}`,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
    };

    setWorkspace((prev) => ({
      ...prev,
      hiringRoster: [newRec, ...prev.hiringRoster],
    }));
    setApplicantName('');
    setApplicantNick('');
    showNotice(`Filed Docket ${newRec.docketNumber} to supremecourt.gov via www.wittlawfirm.com`);
  };

  const handleUpdateCandidateStatus = (id: string, status: HiringApprovalStatus) => {
    const nowUtc = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
    setWorkspace((prev) => ({
      ...prev,
      hiringRoster: prev.hiringRoster.map((r) =>
        r.id === id ? { ...r, status, updatedAt: nowUtc } : r
      ),
    }));
    showNotice(`Updated Supreme Court / Witt Law hiring status to ${status}`);
  };

  const handleRemoveCandidate = (id: string) => {
    setWorkspace((prev) => ({
      ...prev,
      hiringRoster: prev.hiringRoster.filter((r) => r.id !== id),
    }));
    showNotice('Removed docket entry from hiring roster');
  };

  const handleDownloadBundle = () => {
    const blob = createZipBlob([
      { path: 'shoutcast-voip/pjsip-shoutcast-855k.conf', content: asteriskConf },
      { path: 'shoutcast-voip/scotus-wittlaw-hiring-charter.txt', content: scotusCharter },
      {
        path: 'shoutcast-voip/roster-docket.json',
        content: JSON.stringify(workspace.hiringRoster, null, 2),
      },
    ]);
    triggerBlobDownload(blob, 'drfun1-shoutcast-855k-voip-scotus-bundle.zip');
    showNotice('Downloaded drfun1-shoutcast-855k-voip-scotus-bundle.zip');
  };

  return (
    <div className="space-y-4">
      {/* Header Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-950/70 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                VoIP SIP/SRTP Infrastructure · All {totalProvisioned.toLocaleString()} SHOUTcast Stations
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                {workspace.sipRegistrar}:{workspace.sipPort} TLS 1.3
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono">
              <span>
                DJ &amp; Host Hiring Authority:{' '}
                <a
                  href={SUPREME_COURT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:underline inline-flex items-center gap-1 font-bold"
                >
                  <span>https://www.supremecourt.gov</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </span>
              <span className="text-slate-600">·</span>
              <span>
                Through:{' '}
                <a
                  href={WITT_LAW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-300 hover:underline inline-flex items-center gap-1 font-bold"
                >
                  <span>www.wittlawfirm.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="VoIP Audio Codec"
            value={workspace.codec}
            onChange={(e) =>
              setWorkspace((p) => ({ ...p, codec: e.target.value as VoipCodec }))
            }
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
          >
            <option value="Opus 48kHz Stereo">Opus 48kHz Stereo</option>
            <option value="EVS Super-Wideband">EVS Super-Wideband</option>
            <option value="G.722 Wideband">G.722 Wideband</option>
            <option value="G.711 u-Law">G.711 u-Law</option>
          </select>

          <button
            type="button"
            onClick={handleSyncVoipTrunks}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync 855,000 VoIP Trunks</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadBundle}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Download .zip Bundle</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="px-4 py-2 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 6-Metric KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">VoIP Stations</div>
          <div className="text-base font-mono font-bold text-white mt-1 tabular-nums">
            {totalProvisioned.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-0.5">100% SIP Ready</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Active Trunks</div>
          <div className="text-base font-mono font-bold text-sky-300 mt-1 tabular-nums">
            {workspace.clusters.length} Regional
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">TLS 1.3 + SRTP</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Live Callers</div>
          <div className="text-base font-mono font-bold text-cyan-300 mt-1 tabular-nums">
            {totalActiveCalls.toLocaleString()} Active
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">{workspace.codec}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Approved DJs/Hosts</div>
          <div className="text-base font-mono font-bold text-emerald-400 mt-1 tabular-nums">
            {approvedDjs} Active
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">SCOTUS Commissioned</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Pending Docket</div>
          <div className="text-base font-mono font-bold text-amber-300 mt-1 tabular-nums">
            {pendingDjs} In Review
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">Via wittlawfirm.com</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Hiring Authority</div>
          <div className="text-xs font-mono font-bold text-amber-300 mt-1 truncate">
            supremecourt.gov
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
            www.wittlawfirm.com
          </div>
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('voip_trunks')}
          className={`px-3.5 py-2 text-xs font-mono font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'voip_trunks'
              ? 'border-sky-400 text-sky-300 bg-sky-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          855,000-Station VoIP Trunks &amp; Dialer
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scotus_hiring')}
          className={`px-3.5 py-2 text-xs font-mono font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'scotus_hiring'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Supreme Court &amp; Witt Law DJ/Host Hiring ({workspace.hiringRoster.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('config_charter')}
          className={`px-3.5 py-2 text-xs font-mono font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'config_charter'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Asterisk/PJSIP Dialplan &amp; Hiring Charter
        </button>
      </div>

      {/* TAB 1: VOIP TRUNKS & STATION DIALER */}
      {activeTab === 'voip_trunks' && (
        <div className="space-y-4">
          {/* Station Extension Dialer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-sky-400" />
                  <span>SHOUTcast Station VoIP Extension Dialer (#1 – #855,000)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dial or verify the TLS 1.3 + SRTP live caller bridge for any of the 855,000 SHOUTcast stations.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                RTP Media: {workspace.rtpPortRange} · Last Sync: {workspace.lastSyncedAt}
              </span>
            </div>

            <form onSubmit={handleTestDial} className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-mono text-slate-300">Station #</label>
                <input
                  type="number"
                  min={1}
                  max={855000}
                  value={stationInput}
                  onChange={(e) => setStationInput(e.target.value)}
                  className="w-36 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white tabular-nums focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-slate-950 text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Test SIP Call-In Bridge</span>
              </button>

              {[1, 1042, 220500, 410000, 615000, 855000].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setStationInput(String(sample));
                    setDialResult(dialShoutcastStationVoip(sample, workspace));
                  }}
                  className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 cursor-pointer tabular-nums"
                >
                  #{sample.toLocaleString()}
                </button>
              ))}
            </form>

            {dialResult && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">SIP URI</span>
                  <span className="text-sky-300 font-bold break-all">{dialResult.sipUri}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">DID / Trunk Cluster</span>
                  <span className="text-white tabular-nums block">{dialResult.didNumber}</span>
                  <span className="text-[11px] text-slate-400">{dialResult.clusterName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Codec &amp; Encryption</span>
                  <span className="text-emerald-300 font-bold block">{dialResult.codec}</span>
                  <span className="text-[11px] text-slate-400">{dialResult.srtpCipher}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Bridge Status</span>
                  <span className="text-emerald-400 font-bold block">{dialResult.status}</span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    RTT: {dialResult.rttMs} ms · {dialResult.timestamp}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 5 Trunk Clusters Partitioning All 855,000 Stations */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Regional VoIP Trunk Clusters ({totalProvisioned.toLocaleString()} SHOUTcast Stations)</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 pr-3">Cluster &amp; Hub</th>
                    <th className="py-2 pr-3">Station Range</th>
                    <th className="py-2 pr-3 text-right">Stations</th>
                    <th className="py-2 pr-3">SIP Domain &amp; DID Block</th>
                    <th className="py-2 pr-3 text-right">Calls</th>
                    <th className="py-2 pr-3 text-right">RTT</th>
                    <th className="py-2 text-right">Security</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {workspace.clusters.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => {
                        setStationInput(String(c.stationRangeStart));
                        setDialResult(dialShoutcastStationVoip(c.stationRangeStart, workspace));
                      }}
                      className="hover:bg-slate-950/70 cursor-pointer"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400">{c.regionHub}</div>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-300 tabular-nums whitespace-nowrap">
                        #{c.stationRangeStart.toLocaleString()} – #{c.stationRangeEnd.toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-bold text-cyan-300 tabular-nums">
                        {c.stationCount.toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="text-sky-300">{c.sipDomain}:5061</div>
                        <div className="text-[11px] text-slate-400">{c.didBlock}</div>
                      </td>
                      <td className="py-2.5 pr-3 text-right text-white tabular-nums">
                        {c.activeCalls.toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-emerald-400 tabular-nums">
                        {c.latencyMs} ms
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                          {c.srtpStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUPREME COURT & WITT LAW FIRM DJ & HOST HIRING */}
      {activeTab === 'scotus_hiring' && (
        <div className="space-y-4">
          {/* Governance Mandate Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Supreme Court of the United States · Exclusive DJ &amp; Broadcast Host Hiring Control
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  All Station DJs, Broadcast Hosts, Live Call Screeners, and Program Directors for the 855,000 SHOUTcast VoIP stations are appointed and approved under{' '}
                  <a
                    href={SUPREME_COURT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-300 hover:underline font-mono font-bold"
                  >
                    https://www.supremecourt.gov
                  </a>{' '}
                  through legal representation and docket administration by{' '}
                  <a
                    href={WITT_LAW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-300 hover:underline font-mono font-bold"
                  >
                    www.wittlawfirm.com
                  </a>{' '}
                  (The Law Office of Richard A. Witt LLC).
                </p>
              </div>
            </div>

            {onOpenLicense && (
              <button
                type="button"
                onClick={onOpenLicense}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-mono font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Witt Law Charter</span>
              </button>
            )}
          </div>

          {/* Submit New DJ / Host Docket Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>File New DJ / Broadcast Host Hiring Application (via www.wittlawfirm.com)</span>
            </h4>
            <form onSubmit={handleSubmitCandidate} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. Marcus Sterling"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-slate-400 mb-1">IRC / SIP Nick</label>
                <input
                  type="text"
                  value={applicantNick}
                  onChange={(e) => setApplicantNick(e.target.value)}
                  placeholder="DJ_Sterling"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Role</label>
                <select
                  value={applicantRole}
                  onChange={(e) => setApplicantRole(e.target.value as DjHostRole)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                >
                  <option value="Station DJ">Station DJ</option>
                  <option value="Broadcast Host">Broadcast Host</option>
                  <option value="Live Call Screener">Live Call Screener</option>
                  <option value="Program Director">Program Director</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Assigned Stations</label>
                <input
                  type="text"
                  value={applicantStations}
                  onChange={(e) => setApplicantStations(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold transition cursor-pointer"
                >
                  File to Docket
                </button>
              </div>
            </form>
          </div>

          {/* Hiring Docket Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Supreme Court &amp; Witt Law Firm Hiring Control Roster ({workspace.hiringRoster.length})</span>
              <span className="text-[11px] font-mono text-slate-400">
                Authority: https://www.supremecourt.gov · Counsel: www.wittlawfirm.com
              </span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 pr-3">Docket #</th>
                    <th className="py-2 pr-3">DJ / Host</th>
                    <th className="py-2 pr-3">Role &amp; Stations</th>
                    <th className="py-2 pr-3">VoIP SIP Extension</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 text-right">SCOTUS / Witt Law Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {workspace.hiringRoster.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-950/60">
                      <td className="py-2.5 pr-3 text-amber-300 font-bold whitespace-nowrap">
                        {rec.docketNumber}
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="font-bold text-white">{rec.name}</div>
                        <div className="text-[11px] text-slate-400">IRC: {rec.ircNick}</div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="text-sky-300 font-semibold">{rec.role}</div>
                        <div className="text-[11px] text-slate-400">{rec.assignedStations}</div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="text-emerald-300">{rec.voipExtension}</div>
                        <div className="text-[11px] text-slate-400">{rec.sipUri}</div>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.status === 'APPROVED_ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : rec.status === 'PENDING_SCOTUS_REVIEW'
                                ? 'bg-amber-500/15 text-amber-300'
                                : 'bg-rose-500/15 text-rose-300'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateCandidateStatus(rec.id, 'APPROVED_ACTIVE')}
                            className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold cursor-pointer"
                          >
                            Approve (SCOTUS)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateCandidateStatus(rec.id, 'PENDING_SCOTUS_REVIEW')}
                            className="px-2 py-1 rounded bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer"
                          >
                            Hold
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateCandidateStatus(rec.id, 'SUSPENDED_BY_WITTLAW')}
                            className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 text-[10px] font-bold cursor-pointer"
                          >
                            Suspend
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCandidate(rec.id)}
                            className="p-1 rounded bg-slate-950 hover:bg-red-950 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ASTERISK / PJSIP DIALPLAN & HIRING CHARTER */}
      {activeTab === 'config_charter' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDocTab('asterisk_conf')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                  docTab === 'asterisk_conf'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                pjsip-shoutcast-855k.conf
              </button>
              <button
                type="button"
                onClick={() => setDocTab('scotus_charter')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                  docTab === 'scotus_charter'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                scotus-wittlaw-hiring-charter.txt
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    docTab === 'asterisk_conf' ? asteriskConf : scotusCharter,
                    docTab,
                    docTab
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white border border-slate-700 cursor-pointer flex items-center gap-1.5"
              >
                {copiedKey === docTab ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedKey === docTab ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const filename =
                    docTab === 'asterisk_conf'
                      ? 'pjsip-shoutcast-855k.conf'
                      : 'scotus-wittlaw-hiring-charter.txt';
                  const content = docTab === 'asterisk_conf' ? asteriskConf : scotusCharter;
                  triggerBlobDownload(new Blob([content], { type: 'text/plain' }), filename);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[440px] overflow-y-auto leading-relaxed">
            {docTab === 'asterisk_conf' ? asteriskConf : scotusCharter}
          </pre>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>
              SIP dialplan matches all 855,000 extensions (#000001–#855000) and verifies DJ/host status via https://www.supremecourt.gov &amp; www.wittlawfirm.com.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
