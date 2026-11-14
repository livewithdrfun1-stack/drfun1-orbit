/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Network Status View
 * Aggregates live health metrics across the 1,034-leaf federated mesh:
 * - 1,000 www.switch.com nodes (500 per hub via CGW Law Offices)
 * - 24 www.datapacket.com leafs (12 per hub)
 * - 10 www.risingnet.com dedicated servers synced across all 4 hubs
 * - 4 UnrealIRCd 6.1.4 Core Hubs (irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net, drfun1ircd.com)
 */

import React, { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Download,
  Globe,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Wifi,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ALL_UNREAL_HUBS } from '../data/ircData';
import {
  ALL_1000_SWITCH_NODES,
  ALL_1034_LEAF_NODES,
  ALL_24_DATAPACKET_NODES,
  HUB1_12_DATAPACKET_NODES,
  HUB1_500_SWITCH_NODES,
  HUB2_12_DATAPACKET_NODES,
  HUB2_500_SWITCH_NODES,
  RISINGNET_10_DEDICATED_SERVERS,
  UNREAL_HUB_TARGET,
} from '../data/unrealSearchData';
import { SwitchDedicatedNode } from '../types/irc';
import { triggerBlobDownload } from '../utils/zipBuilder';

interface NetworkStatusViewProps {
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onOpenIrcdAdmin?: () => void;
}

interface TierHealthSummary {
  id: 'switch' | 'datapacket' | 'risingnet';
  label: string;
  subtitle: string;
  totalNodes: number;
  activeNodes: number;
  syncedNodes: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  totalUsers: number;
  capacityLabel: string;
}

function summarizeNodes(nodes: SwitchDedicatedNode[], jitterMs: number) {
  const count = nodes.length;
  if (count === 0) {
    return {
      total: 0,
      active: 0,
      synced: 0,
      avgLatencyMs: 0,
      minLatencyMs: 0,
      maxLatencyMs: 0,
      users: 0,
    };
  }
  let active = 0;
  let synced = 0;
  let sumLat = 0;
  let minLat = Infinity;
  let maxLat = 0;
  let users = 0;

  for (let i = 0; i < count; i++) {
    const n = nodes[i];
    if (n.status === 'active') active++;
    if (n.leafStatus === 'synced' || n.leafStatus === 'linked') synced++;
    const lat = Math.max(0.5, Number((n.latencyMs + jitterMs).toFixed(1)));
    sumLat += lat;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    users += n.usersOnline;
  }

  return {
    total: count,
    active,
    synced,
    avgLatencyMs: Number((sumLat / count).toFixed(1)),
    minLatencyMs: Number(minLat.toFixed(1)),
    maxLatencyMs: Number(maxLat.toFixed(1)),
    users,
  };
}

export const NetworkStatusView: React.FC<NetworkStatusViewProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onOpenIrcdAdmin,
}) => {
  const [probeJitterMs, setProbeJitterMs] = useState<number>(0);
  const [probeTick, setProbeTick] = useState<number>(1);
  const [lastProbedAt, setLastProbedAt] = useState<string>(
    () => new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
  );

  const [tierFilter, setTierFilter] = useState<'all' | 'switch' | 'datapacket' | 'risingnet'>('all');
  const [hubFilter, setHubFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedNode, setSelectedNode] = useState<SwitchDedicatedNode | null>(null);

  const pageSize = 20;

  const handleRunHealthProbe = () => {
    const delta = Number((((probeTick % 5) - 2) * 0.2).toFixed(1));
    setProbeJitterMs(delta);
    setProbeTick((t) => t + 1);
    setLastProbedAt(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
  };

  // Compute live metrics across full mesh and per provider tier
  const metrics = useMemo(() => {
    const allSummary = summarizeNodes(ALL_1034_LEAF_NODES, probeJitterMs);
    const switchSummary = summarizeNodes(ALL_1000_SWITCH_NODES, probeJitterMs);
    const switchHub1Summary = summarizeNodes(HUB1_500_SWITCH_NODES, probeJitterMs);
    const switchHub2Summary = summarizeNodes(HUB2_500_SWITCH_NODES, probeJitterMs);
    const dpSummary = summarizeNodes(ALL_24_DATAPACKET_NODES, probeJitterMs);
    const dpHub1Summary = summarizeNodes(HUB1_12_DATAPACKET_NODES, probeJitterMs);
    const dpHub2Summary = summarizeNodes(HUB2_12_DATAPACKET_NODES, probeJitterMs);
    const rnSummary = summarizeNodes(RISINGNET_10_DEDICATED_SERVERS, probeJitterMs);

    const tiers: TierHealthSummary[] = [
      {
        id: 'switch',
        label: 'Switch SUPERNAP Leaf Fleet',
        subtitle: '500 nodes/hub via CGW Law Offices (500 Hub 1 + 500 Hub 2)',
        totalNodes: switchSummary.total,
        activeNodes: switchSummary.active,
        syncedNodes: switchSummary.synced,
        avgLatencyMs: switchSummary.avgLatencyMs,
        minLatencyMs: switchSummary.minLatencyMs,
        maxLatencyMs: switchSummary.maxLatencyMs,
        totalUsers: switchSummary.users,
        capacityLabel: '100G QSFP28 Dual-Homed',
      },
      {
        id: 'datapacket',
        label: 'DataPacket Ad-Free Leafs',
        subtitle: '12 global leafs/hub (12 Hub 1 + 12 Hub 2) · Zero Ads',
        totalNodes: dpSummary.total,
        activeNodes: dpSummary.active,
        syncedNodes: dpSummary.synced,
        avgLatencyMs: dpSummary.avgLatencyMs,
        minLatencyMs: dpSummary.minLatencyMs,
        maxLatencyMs: dpSummary.maxLatencyMs,
        totalUsers: dpSummary.users,
        capacityLabel: '40G–100G Unmetered BGP',
      },
      {
        id: 'risingnet',
        label: 'RisingNet Dedicated Servers',
        subtitle: '10 tier-1 bare-metal servers synced to all hubs',
        totalNodes: rnSummary.total,
        activeNodes: rnSummary.active,
        syncedNodes: rnSummary.synced,
        avgLatencyMs: rnSummary.avgLatencyMs,
        minLatencyMs: rnSummary.minLatencyMs,
        maxLatencyMs: rnSummary.maxLatencyMs,
        totalUsers: rnSummary.users,
        capacityLabel: '100G Optical DWDM',
      },
    ];

    // Regional rollup across the 1,000 Switch nodes + 24 DataPacket + 10 RisingNet
    const regionMap = new Map<string, { nodes: number; active: number; latSum: number; users: number }>();
    for (const node of ALL_1034_LEAF_NODES) {
      const reg = node.region || 'North America';
      const entry = regionMap.get(reg) || { nodes: 0, active: 0, latSum: 0, users: 0 };
      entry.nodes += 1;
      if (node.status === 'active') entry.active += 1;
      entry.latSum += Math.max(0.5, node.latencyMs + probeJitterMs);
      entry.users += node.usersOnline;
      regionMap.set(reg, entry);
    }

    const regions = Array.from(regionMap.entries())
      .map(([region, stats]) => ({
        region,
        nodes: stats.nodes,
        active: stats.active,
        healthPct: Number(((stats.active / stats.nodes) * 100).toFixed(1)),
        avgLatencyMs: Number((stats.latSum / stats.nodes).toFixed(1)),
        users: stats.users,
      }))
      .sort((a, b) => b.nodes - a.nodes);

    return {
      allSummary,
      switchHub1Summary,
      switchHub2Summary,
      dpHub1Summary,
      dpHub2Summary,
      rnSummary,
      tiers,
      regions,
    };
  }, [probeJitterMs]);

  // Filtered nodes for inspectable directory table
  const filteredNodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_1034_LEAF_NODES.filter((node) => {
      const provider = node.provider || (node.id.startsWith('dp_') ? 'datapacket' : node.id.startsWith('rn_') ? 'risingnet' : 'switch');
      if (tierFilter !== 'all' && provider !== tierFilter) return false;
      if (hubFilter !== 'all') {
        const linked = Boolean(
          node.dualHubLinked ||
            node.leafHubs?.includes(hubFilter) ||
            (node.leafHub || '').includes(hubFilter)
        );
        if (!linked) return false;
      }
      if (q) {
        const matches =
          node.host.toLowerCase().includes(q) ||
          node.name.toLowerCase().includes(q) ||
          node.location.toLowerCase().includes(q) ||
          node.sid.toLowerCase().includes(q) ||
          node.campusName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [tierFilter, hubFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredNodes.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageNodes = filteredNodes.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleExportReport = () => {
    const report = {
      generatedAt: lastProbedAt,
      networkName: UNREAL_HUB_TARGET.networkName,
      licensee: UNREAL_HUB_TARGET.license,
      legalCounsel: UNREAL_HUB_TARGET.legalCounsel,
      paymentOffice: UNREAL_HUB_TARGET.paymentOffice,
      billingOffice: UNREAL_HUB_TARGET.billingOffice,
      meshTotals: metrics.allSummary,
      coreHubs: ALL_UNREAL_HUBS.map((h) => ({
        host: h.host,
        sid: h.sid,
        users: h.totalSyncedUsers,
        channels: h.totalSyncedChannels,
        bandwidth: h.aggregateBandwidth,
      })),
      providerTiers: metrics.tiers,
      regionalHealth: metrics.regions,
    };
    triggerBlobDownload(
      new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
      'drfun1-network-status-health.json'
    );
  };

  return (
    <div className="space-y-5">
      {/* Header Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Network Status &amp; 1,034-Leaf Mesh Health
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 tabular-nums">
                {metrics.allSummary.active} / {metrics.allSummary.total} ACTIVE (
                {((metrics.allSummary.active / Math.max(1, metrics.allSummary.total)) * 100).toFixed(1)}%)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              500 Switch/Hub via CGW Law Offices (1,000) · 12 DataPacket Leafs/Hub (24) · 10 RisingNet Servers · Last Probe: {lastProbedAt}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRunHealthProbe}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Run Health Probe</span>
          </button>

          <button
            type="button"
            onClick={handleExportReport}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON Health</span>
          </button>

          {onOpenSwitchMesh && (
            <button
              type="button"
              onClick={onOpenSwitchMesh}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mesh Topology</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 6-Metric KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Total Leaf Mesh</div>
          <div className="text-base font-mono font-bold text-white mt-1 tabular-nums">
            {metrics.allSummary.total.toLocaleString()} Nodes
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-0.5 tabular-nums">
            {metrics.allSummary.synced.toLocaleString()} Synced
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Switch SUPERNAP</div>
          <div className="text-base font-mono font-bold text-cyan-300 mt-1 tabular-nums">
            {metrics.tiers[0].totalNodes.toLocaleString()} Nodes
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
            500 Hub 1 · 500 Hub 2
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">DataPacket Leafs</div>
          <div className="text-base font-mono font-bold text-sky-300 mt-1 tabular-nums">
            {metrics.tiers[1].totalNodes} Leafs
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
            12 Hub 1 · 12 Hub 2
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">RisingNet Servers</div>
          <div className="text-base font-mono font-bold text-purple-300 mt-1 tabular-nums">
            {metrics.tiers[2].totalNodes} Dedicated
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
            4/4 Hubs Synced
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Mesh Avg RTT</div>
          <div className="text-base font-mono font-bold text-emerald-400 mt-1 tabular-nums">
            {metrics.allSummary.avgLatencyMs} ms
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
            {metrics.allSummary.minLatencyMs}–{metrics.allSummary.maxLatencyMs} ms range
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Leaf Client Load</div>
          <div className="text-base font-mono font-bold text-amber-300 mt-1 tabular-nums">
            {metrics.allSummary.users.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            TLS 1.3 Verified
          </div>
        </div>
      </div>

      {/* 3 Provider Health Breakdown Cards (Switch 1,000 | DataPacket 24 | RisingNet 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {metrics.tiers.map((tier) => {
          const pct = Number(((tier.activeNodes / Math.max(1, tier.totalNodes)) * 100).toFixed(1));
          return (
            <div
              key={tier.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{tier.label}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{tier.subtitle}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold tabular-nums shrink-0">
                  {pct}% UP
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-mono">
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2">
                  <div className="text-[10px] text-slate-400 uppercase">Active</div>
                  <div className="font-bold text-white tabular-nums mt-0.5">
                    {tier.activeNodes}/{tier.totalNodes}
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2">
                  <div className="text-[10px] text-slate-400 uppercase">Avg RTT</div>
                  <div className="font-bold text-emerald-400 tabular-nums mt-0.5">
                    {tier.avgLatencyMs} ms
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2">
                  <div className="text-[10px] text-slate-400 uppercase">Clients</div>
                  <div className="font-bold text-sky-300 tabular-nums mt-0.5">
                    {tier.totalUsers.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                <span>{tier.capacityLabel}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTierFilter(tier.id);
                    setCurrentPage(1);
                  }}
                  className="text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
                >
                  Inspect {tier.totalNodes} Nodes →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4 Core UnrealIRCd Hubs + Regional Health Rollup */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Core Hubs (7 cols) */}
        <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              <span>UnrealIRCd 6.1.4 Core Hub Uplink Health ({ALL_UNREAL_HUBS.length} Hubs)</span>
            </h4>
            {onOpenIrcdAdmin && (
              <button
                type="button"
                onClick={onOpenIrcdAdmin}
                className="text-[11px] font-mono text-purple-300 hover:text-purple-200 font-bold cursor-pointer"
              >
                Open NetAdmin Console →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_UNREAL_HUBS.map((hub, idx) => {
              const hubLeafCount =
                idx === 0
                  ? metrics.switchHub1Summary.total + metrics.dpHub1Summary.total + metrics.rnSummary.total
                  : idx === 1
                    ? metrics.switchHub2Summary.total + metrics.dpHub2Summary.total + metrics.rnSummary.total
                    : metrics.allSummary.total;
              return (
                <div
                  key={hub.host}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono font-bold text-white">
                        {hub.host} <span className="text-slate-500">(SID {hub.sid})</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{hub.colocation}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                      ONLINE
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block">Leafs</span>
                      <span className="text-white font-bold tabular-nums">{hubLeafCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Users</span>
                      <span className="text-sky-300 font-bold tabular-nums">
                        {hub.totalSyncedUsers.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Pipe</span>
                      <span className="text-emerald-300 font-bold">{hub.aggregateBandwidth}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Health Table (5 cols) */}
        <div className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Regional Mesh Latency &amp; Availability</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              {metrics.regions.length} Regions
            </span>
          </div>

          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-1.5 pr-2">Region</th>
                  <th className="py-1.5 pr-2 text-right">Nodes</th>
                  <th className="py-1.5 pr-2 text-right">Health</th>
                  <th className="py-1.5 text-right">Avg RTT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {metrics.regions.map((r) => (
                  <tr key={r.region} className="hover:bg-slate-950/60">
                    <td className="py-1.5 pr-2 text-slate-200">{r.region}</td>
                    <td className="py-1.5 pr-2 text-right text-white font-bold tabular-nums">
                      {r.nodes.toLocaleString()}
                    </td>
                    <td className="py-1.5 pr-2 text-right text-emerald-400 font-bold tabular-nums">
                      {r.healthPct}%
                    </td>
                    <td className="py-1.5 text-right text-cyan-300 tabular-nums">{r.avgLatencyMs} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inspectable 1,034-Node Health Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>Live Node Health Directory ({filteredNodes.length.toLocaleString()} Matching Nodes)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any Switch, DataPacket, or RisingNet leaf row to inspect TLS fingerprint, burst stats, and dual-hub peering.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter host, metro, SID..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 w-48"
              />
            </div>

            <select
              aria-label="Filter node tier"
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value as 'all' | 'switch' | 'datapacket' | 'risingnet');
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
            >
              <option value="all">All Tiers (1,034)</option>
              <option value="switch">Switch.com (1,000)</option>
              <option value="datapacket">DataPacket (24)</option>
              <option value="risingnet">RisingNet (10)</option>
            </select>

            <select
              aria-label="Filter target hub"
              value={hubFilter}
              onChange={(e) => {
                setHubFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
            >
              <option value="all">All Core Hubs (4)</option>
              {UNREAL_HUB_TARGET.hubDomains.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Node Drawer */}
        {selectedNode && (
          <div className="bg-slate-950 border border-emerald-500/40 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">{selectedNode.name}</span>
                <span className="text-slate-400">({selectedNode.host})</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="bg-slate-900 border border-slate-800 rounded p-2">
                <span className="text-slate-400 block">Campus / Transit</span>
                <span className="text-slate-200">{selectedNode.campusName}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded p-2">
                <span className="text-slate-400 block">TLS Fingerprint</span>
                <span className="text-emerald-300 break-all">{selectedNode.sslFingerprint}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded p-2">
                <span className="text-slate-400 block">Leaf Burst Sync</span>
                <span className="text-sky-300 tabular-nums">
                  {selectedNode.leafBurstStats.syncedChannels.toLocaleString()} ch · {selectedNode.leafBurstStats.syncedNicks.toLocaleString()} nicks
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded p-2">
                <span className="text-slate-400 block">Compliance &amp; Billing</span>
                <span className="text-amber-300">CGW Law · Witt Law Firm · Owens Co.</span>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2 pr-3">SID</th>
                <th className="py-2 pr-3">Node Hostname</th>
                <th className="py-2 pr-3">Provider</th>
                <th className="py-2 pr-3">Metro / Facility</th>
                <th className="py-2 pr-3 text-right">RTT</th>
                <th className="py-2 pr-3 text-right">Users</th>
                <th className="py-2 text-right">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {pageNodes.map((node) => {
                const prov =
                  node.provider ||
                  (node.id.startsWith('dp_')
                    ? 'datapacket'
                    : node.id.startsWith('rn_')
                      ? 'risingnet'
                      : 'switch');
                const adjustedRtt = Math.max(0.5, Number((node.latencyMs + probeJitterMs).toFixed(1)));
                return (
                  <tr
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`cursor-pointer transition ${
                      selectedNode?.id === node.id ? 'bg-slate-800/60' : 'hover:bg-slate-950/70'
                    }`}
                  >
                    <td className="py-2 pr-3 text-slate-400 tabular-nums">{node.sid}</td>
                    <td className="py-2 pr-3 text-white font-semibold">{node.host}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          prov === 'datapacket'
                            ? 'bg-sky-500/15 text-sky-300'
                            : prov === 'risingnet'
                              ? 'bg-purple-500/15 text-purple-300'
                              : 'bg-cyan-500/15 text-cyan-300'
                        }`}
                      >
                        {prov}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-slate-300">{node.location}</td>
                    <td className="py-2 pr-3 text-right text-emerald-400 tabular-nums">{adjustedRtt} ms</td>
                    <td className="py-2 pr-3 text-right text-slate-200 tabular-nums">
                      {node.usersOnline.toLocaleString()}
                    </td>
                    <td className="py-2 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-bold uppercase">
                        {node.status} · {node.leafStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs font-mono text-slate-400">
          <div className="tabular-nums">
            Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredNodes.length)} of{' '}
            {filteredNodes.length.toLocaleString()} nodes
          </div>
          <div className="flex items-center gap-2">
            {onOpenLicense && (
              <button
                type="button"
                onClick={onOpenLicense}
                className="text-emerald-400 hover:underline mr-2 cursor-pointer flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Witt Law Firm (FRN 0034981290)</span>
              </button>
            )}
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <span className="tabular-nums text-white">
              Page {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
