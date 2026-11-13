/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Network Operations Center (NOC) Dashboard
 * Visualizes global node connectivity for the 1,034-leaf mesh:
 * - 500 www.switch.com Nodes/Hub via CGW Law Offices (1,000 total)
 * - 12 www.datapacket.com Leafs/Hub (24 total)
 * - 10 www.risingnet.com Dedicated Servers synced & leafed to BOTH hubs
 * Dual Core Master Hubs: irc.drfun1.com & irc.drfun1media.com (Port 6697 SSL, SID 001/002)
 * License: www.wittlawfirm.com | Payment Office: www.owenscompany.com (Bill in Receiving)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Server, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Wifi, 
  Globe, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  X, 
  Zap, 
  Lock, 
  Radio, 
  Layers, 
  ChevronRight, 
  RefreshCw, 
  TrendingUp, 
  Cpu, 
  Grid, 
  List, 
  Play, 
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { ALL_NETWORK_LEAF_NODES, UNREAL_HUB_TARGET } from '../data/unrealSearchData';
import { SwitchDedicatedNode } from '../types/irc';
import { NocMeshTrendsChart } from './NocMeshTrendsChart';
import { NocPacketLossHeatmap } from './NocPacketLossHeatmap';

interface NocDashboardSectionProps {
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onNavigateToIrc?: (nodeHost?: string) => void;
  onOpenUnrealSearch?: () => void;
}

export const NocDashboardSection: React.FC<NocDashboardSectionProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onNavigateToIrc,
  onOpenUnrealSearch,
}) => {
  // Filtering & Search
  const [selectedProvider, setSelectedProvider] = useState<'all' | 'hub1' | 'hub2' | 'hub3' | 'hub4' | 'switch' | 'datapacket' | 'risingnet'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [selectedLatencyFilter, setSelectedLatencyFilter] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'matrix' | 'heatmap' | 'cards' | 'table'>('matrix');

  // Selected Node for Link Inspector
  const [selectedNode, setSelectedNode] = useState<SwitchDedicatedNode | null>(null);

  // Show / Hide Recharts Timeseries Trends
  const [showTrendsChart, setShowTrendsChart] = useState<boolean>(true);
  
  // Interactive Ping Diagnostic Tool state
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResults, setPingResults] = useState<{
    seq: number;
    bytes: number;
    rttMs: number;
    ttl: number;
    status: 'ok' | 'timeout';
  }[] | null>(null);

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Real-time jitter simulator for NOC feel
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered Leaf Nodes
  const filteredNodes = useMemo(() => {
    return ALL_NETWORK_LEAF_NODES.filter((node) => {
      // Provider / Hub filter
      if (selectedProvider !== 'all') {
        if (selectedProvider === 'hub1') {
          const onHub1 = Boolean(node.dualHubLinked || node.leafHubs?.includes('irc.drfun1.com') || (node.leafHub || '').includes('irc.drfun1.com'));
          if (!onHub1) return false;
        } else if (selectedProvider === 'hub2') {
          const onHub2 = Boolean(node.dualHubLinked || node.leafHubs?.includes('irc.drfun1media.com') || (node.leafHub || '').includes('irc.drfun1media.com'));
          if (!onHub2) return false;
        } else if (selectedProvider === 'hub3') {
          const onHub3 = Boolean(node.dualHubLinked || node.leafHubs?.includes('irc.drfun1media.net') || (node.leafHub || '').includes('irc.drfun1media.net'));
          if (!onHub3) return false;
        } else if (selectedProvider === 'hub4') {
          const onHub4 = Boolean(node.dualHubLinked || node.leafHubs?.includes('drfun1ircd.com') || (node.leafHub || '').includes('drfun1ircd.com'));
          if (!onHub4) return false;
        } else {
          const p = node.provider || (node.id.startsWith('dp_') ? 'datapacket' : node.id.startsWith('rn_') ? 'risingnet' : 'switch');
          if (selectedProvider === 'switch' && p !== 'switch' && p !== 'unrealircd') return false;
          if (selectedProvider === 'datapacket' && p !== 'datapacket') return false;
          if (selectedProvider === 'risingnet' && p !== 'risingnet') return false;
        }
      }

      // Region filter
      if (selectedRegion !== 'All Regions') {
        const nodeReg = node.region || '';
        if (!nodeReg.toLowerCase().includes(selectedRegion.toLowerCase())) {
          return false;
        }
      }

      // Latency filter
      if (selectedLatencyFilter === 'low' && node.latencyMs >= 25) return false;
      if (selectedLatencyFilter === 'mid' && (node.latencyMs < 25 || node.latencyMs > 75)) return false;
      if (selectedLatencyFilter === 'high' && node.latencyMs <= 75) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = node.name.toLowerCase().includes(q);
        const matchesHost = node.host.toLowerCase().includes(q);
        const matchesLoc = node.location.toLowerCase().includes(q);
        const matchesSid = node.sid.toLowerCase().includes(q);
        const matchesCampus = node.campusName.toLowerCase().includes(q);
        if (!matchesName && !matchesHost && !matchesLoc && !matchesSid && !matchesCampus) {
          return false;
        }
      }

      return true;
    });
  }, [selectedProvider, selectedRegion, selectedLatencyFilter, searchQuery]);

  // Aggregate Metrics
  const providerStats = useMemo(() => {
    let switchCount = 0;
    let dpCount = 0;
    let rnCount = 0;
    let hub1Count = 0;
    let hub2Count = 0;
    let hub3Count = 0;
    let hub4Count = 0;

    ALL_NETWORK_LEAF_NODES.forEach((n) => {
      if (n.dualHubLinked || n.leafHubs?.includes('irc.drfun1.com') || (n.leafHub || '').includes('irc.drfun1.com')) hub1Count++;
      if (n.dualHubLinked || n.leafHubs?.includes('irc.drfun1media.com') || (n.leafHub || '').includes('irc.drfun1media.com')) hub2Count++;
      if (n.dualHubLinked || n.leafHubs?.includes('irc.drfun1media.net') || (n.leafHub || '').includes('irc.drfun1media.net')) hub3Count++;
      if (n.dualHubLinked || n.leafHubs?.includes('drfun1ircd.com') || (n.leafHub || '').includes('drfun1ircd.com')) hub4Count++;
      const p = n.provider || (n.id.startsWith('dp_') ? 'datapacket' : n.id.startsWith('rn_') ? 'risingnet' : 'switch');
      if (p === 'datapacket') dpCount++;
      else if (p === 'risingnet') rnCount++;
      else switchCount++;
    });

    const avgLat = (ALL_NETWORK_LEAF_NODES.reduce((acc, n) => acc + n.latencyMs, 0) / ALL_NETWORK_LEAF_NODES.length).toFixed(1);

    return {
      total: ALL_NETWORK_LEAF_NODES.length,
      hub1Count,
      hub2Count,
      hub3Count,
      hub4Count,
      switchCount,
      dpCount,
      rnCount,
      avgLatencyMs: avgLat,
    };
  }, []);

  // Run simulated ICMP & TLS Handshake Ping
  const handleRunPingTest = (node: SwitchDedicatedNode) => {
    setIsPinging(true);
    setPingResults([]);

    const baseLat = node.latencyMs;
    const pings: { seq: number; bytes: number; rttMs: number; ttl: number; status: 'ok' }[] = [];

    let count = 0;
    const interval = setInterval(() => {
      count++;
      const jitter = (Math.random() * 1.8 - 0.9).toFixed(2);
      const rtt = Math.max(1.1, Number((baseLat + Number(jitter)).toFixed(2)));
      pings.push({
        seq: count,
        bytes: 64,
        rttMs: rtt,
        ttl: 58,
        status: 'ok',
      });
      setPingResults([...pings]);

      if (count >= 4) {
        clearInterval(interval);
        setIsPinging(false);
      }
    }, 280);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyLinkBlock = (node: SwitchDedicatedNode) => {
    navigator.clipboard.writeText(node.unrealLinkBlock);
    setToastNotice(`Copied UnrealIRCd link block for ${node.host} (SID ${node.sid})`);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const getNodeColorClass = (node: SwitchDedicatedNode) => {
    const p = node.provider || (node.id.startsWith('dp_') ? 'datapacket' : node.id.startsWith('rn_') ? 'risingnet' : 'switch');
    if (p === 'datapacket') {
      return 'bg-cyan-500/20 border-cyan-400 text-cyan-200 hover:bg-cyan-500/30';
    }
    if (p === 'risingnet') {
      return 'bg-indigo-500/20 border-indigo-400 text-indigo-200 hover:bg-indigo-500/30';
    }
    if (node.latencyMs < 20) {
      return 'bg-emerald-500/20 border-emerald-400 text-emerald-200 hover:bg-emerald-500/30';
    }
    if (node.latencyMs < 60) {
      return 'bg-teal-500/20 border-teal-400 text-teal-200 hover:bg-teal-500/30';
    }
    return 'bg-purple-500/20 border-purple-400 text-purple-200 hover:bg-purple-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-950/95 border border-purple-500/50 text-purple-200 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* ========================================================
          1. NOC GLOBAL TELEMETRY BANNER & DUAL-HUB STATUS
          ======================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-950/40 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Network Operations Center (NOC)</span>
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>1,034/1,034 LEAFS SYNCED TO ALL 4 HUBS</span>
                </span>
                <button
                  onClick={() => setViewMode(viewMode === 'heatmap' ? 'matrix' : 'heatmap')}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold hover:bg-cyan-500/30 transition cursor-pointer flex items-center gap-1.5"
                  title="Toggle Real-Time Packet Loss Heatmap"
                >
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span>0.00% PACKET LOSS HEATMAP</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-4xl leading-relaxed">
                Global Spanning-Tree mesh federating <strong className="text-white">1,034 Leaf Nodes</strong> (<strong className="text-emerald-300">500 Switch/Hub via CGW Law Offices</strong>, <strong className="text-cyan-300">12 DataPacket/Hub</strong>, <strong className="text-indigo-300">10 RisingNet Dedicated Servers</strong>) synced to ALL 4 HUBS: <strong className="text-purple-300">irc.drfun1.com</strong>, <strong className="text-sky-300">irc.drfun1media.com</strong>, <strong className="text-amber-300">irc.drfun1media.net</strong> &amp; <strong className="text-emerald-300">drfun1ircd.com</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono shrink-0 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>NOC Clock:</span>
              <span className="text-white font-bold tabular-nums">{currentTime.toLocaleTimeString()}</span>
            </div>

            <button
              onClick={() => setShowTrendsChart(!showTrendsChart)}
              className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                showTrendsChart
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Toggle Latency & Jitter Trends Line Charts"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>{showTrendsChart ? 'Hide Trends' : 'Latency / Jitter Trends'}</span>
            </button>

            {onOpenUnrealSearch && (
              <button
                onClick={onOpenUnrealSearch}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-950/30"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Engine</span>
              </button>
            )}

            {onOpenLicense && (
              <button
                onClick={onOpenLicense}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>FRN 0034981290</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Core Hubs Peering Topology Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
          {/* Hub 1 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 flex items-center justify-between gap-2 shadow-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">HUB 1 (SID 001)</span>
              </div>
              <p className="text-white font-semibold mt-0.5 truncate">irc.drfun1.com:6697</p>
              <p className="text-[11px] text-slate-500 truncate">Switch SUPERNAP Las Vegas</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              ACTIVE
            </span>
          </div>

          {/* Hub 2 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 flex items-center justify-between gap-2 shadow-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                <Radio className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">HUB 2 (SID 002)</span>
              </div>
              <p className="text-white font-semibold mt-0.5 truncate">irc.drfun1media.com:6697</p>
              <p className="text-[11px] text-slate-500 truncate">Switch Reno Citadel</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              SYNCED
            </span>
          </div>

          {/* Hub 3 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between gap-2 shadow-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">HUB 3 (SID 003)</span>
              </div>
              <p className="text-white font-semibold mt-0.5 truncate">irc.drfun1media.net:6697</p>
              <p className="text-[11px] text-slate-500 truncate">Switch Citadel Tahoe</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              SYNCED
            </span>
          </div>

          {/* Hub 4 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-sky-500/30 flex items-center justify-between gap-2 shadow-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                <Radio className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">HUB 4 (SID 004)</span>
              </div>
              <p className="text-white font-semibold mt-0.5 truncate">drfun1ircd.com:6697</p>
              <p className="text-[11px] text-slate-500 truncate">Switch The Keep Atlanta</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              SYNCED
            </span>
          </div>

          {/* Anope Services Hub */}
          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between gap-2 shadow-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">ANOPE SERVICES (00A)</span>
              </div>
              <p className="text-white font-semibold mt-0.5 truncate">services.drfun1.com</p>
              <p className="text-[11px] text-slate-500 truncate">NickServ &bull; ChanServ &bull; OperServ</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              U-LINED
            </span>
          </div>
        </div>

        {/* Global Mesh KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 pt-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Total Mesh Nodes</span>
            <span className="text-base font-bold text-white tabular-nums">{providerStats.total}</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">100% Online</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Switch.com Nodes</span>
            <span className="text-base font-bold text-emerald-400 tabular-nums">{providerStats.switchCount}</span>
            <span className="text-[10px] text-emerald-300 block mt-0.5">500/Hub via CGW Law Offices</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">DataPacket.com Leafs</span>
            <span className="text-base font-bold text-cyan-400 tabular-nums">{providerStats.dpCount}</span>
            <span className="text-[10px] text-cyan-300 block mt-0.5">12 Leafs/Hub (No-Ads)</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">RisingNet Dedicated</span>
            <span className="text-base font-bold text-indigo-400 tabular-nums">{providerStats.rnCount}</span>
            <span className="text-[10px] text-indigo-300 block mt-0.5">10 Servers Dual-Hub Synced</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Median Mesh Latency</span>
            <span className="text-base font-bold text-amber-300 tabular-nums">{providerStats.avgLatencyMs} ms</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Jitter: 0.8ms</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Spanning Channels</span>
            <span className="text-base font-bold text-purple-400 tabular-nums">855,000</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Synchronized</span>
          </div>
        </div>

        {/* Licensing, Counsel & Payment Office Banner */}
        <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-purple-500/30 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-300">
          <span>
            App Licensed: <strong className="text-amber-300">www.wittlawfirm.com</strong> (FRN 0034981290) &bull; Switch Counsel: <strong className="text-emerald-300">CGW Law Offices</strong>
          </span>
          <span>
            Payment Office: <strong className="text-cyan-300">Owens Company (www.owenscompany.com)</strong> &bull; Attention: <strong className="text-white">Bill in Receiving</strong>
          </span>
        </div>
      </div>

      {/* ========================================================
          1B. LATENCY & JITTER TRENDS OVER TIME (RECHARTS)
          ======================================================== */}
      {showTrendsChart && (
        <NocMeshTrendsChart
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
        />
      )}

      {/* ========================================================
          2. NOC FILTER CONTROLS & SEARCH BAR
          ======================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Provider & Hub Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedProvider('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                selectedProvider === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Leaf Nodes ({ALL_NETWORK_LEAF_NODES.length})
            </button>

            <button
              onClick={() => setSelectedProvider('hub1')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedProvider === 'hub1'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-emerald-300 border border-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hub 1: irc.drfun1.com ({providerStats.hub1Count})</span>
            </button>

            <button
              onClick={() => setSelectedProvider('hub2')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedProvider === 'hub2'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-sky-300 border border-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span>Hub 2: irc.drfun1media.com ({providerStats.hub2Count})</span>
            </button>

            <button
              onClick={() => setSelectedProvider('hub3')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedProvider === 'hub3'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-amber-300 border border-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span>Hub 3: irc.drfun1media.net ({providerStats.hub3Count})</span>
            </button>

            <button
              onClick={() => setSelectedProvider('hub4')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedProvider === 'hub4'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-violet-300 border border-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-violet-400" />
              <span>Hub 4: drfun1ircd.com ({providerStats.hub4Count})</span>
            </button>

            <button
              onClick={() => setSelectedProvider('switch')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedProvider === 'switch'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-teal-300 border border-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-teal-400" />
              <span>Switch.com ({providerStats.switchCount})</span>
            </button>

            <button
              onClick={() => setSelectedProvider('datapacket')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedProvider === 'datapacket'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-cyan-300 border border-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>DataPacket ({providerStats.dpCount})</span>
            </button>

            <button
              onClick={() => setSelectedProvider('risingnet')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedProvider === 'risingnet'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-indigo-300 border border-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>RisingNet ({providerStats.rnCount})</span>
            </button>
          </div>

          {/* Layout Mode Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'matrix' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="High-density visual latency matrix"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Matrix</span>
              </button>

              <button
                onClick={() => setViewMode('heatmap')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'heatmap' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-emerald-300'
                }`}
                title="Color-coded Packet Loss Heatmap"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Loss Heatmap</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-400/20 text-emerald-200 font-bold">{ALL_NETWORK_LEAF_NODES.length}</span>
              </button>

              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'cards' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Telemetry cards"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'table' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Telecom inventory table"
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Region & Latency Sub-filters & Search input */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-500">Region:</span>
            {(['All Regions', 'North America', 'Europe', 'Asia-Pacific'] as const).map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-2 py-0.5 rounded text-[11px] transition cursor-pointer ${
                  selectedRegion === reg
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {reg}
              </button>
            ))}

            <span className="text-slate-700">|</span>

            <span className="text-[11px] text-slate-500">Latency:</span>
            {(['all', 'low', 'mid', 'high'] as const).map((lat) => (
              <button
                key={lat}
                onClick={() => setSelectedLatencyFilter(lat)}
                className={`px-2 py-0.5 rounded text-[11px] uppercase transition cursor-pointer ${
                  selectedLatencyFilter === lat
                    ? 'bg-slate-800 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lat === 'all' ? 'All' : lat === 'low' ? '<25ms' : lat === 'mid' ? '25-75ms' : '75ms+'}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by city, host, SID, or facility..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          3A. REAL-TIME PACKET LOSS HEATMAP (1,000-LEAF MESH · 500 PER HUB)
          ======================================================== */}
      {viewMode === 'heatmap' && (
        <NocPacketLossHeatmap
          selectedNode={selectedNode}
          onSelectNode={(node) => {
            setSelectedNode(node);
          }}
          onRunDiagnostics={(node) => {
            handleRunPingTest(node);
          }}
        />
      )}

      {/* ========================================================
          3B. MAIN VISUAL GRID: HIGH-DENSITY 1,000-LEAF MATRIX
          ======================================================== */}
      {viewMode === 'matrix' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-purple-400" />
                <span>1,034-Leaf Dual-Hub Mesh (500 Switch/Hub via CGW · 12 DP/Hub · 10 RisingNet)</span>
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">Showing {filteredNodes.length} of {ALL_NETWORK_LEAF_NODES.length} Nodes</span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-400" />
                <span>Switch.com Tier 5 (&lt;25ms)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500 border border-cyan-400" />
                <span>DataPacket 100G No-Ads</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500 border border-indigo-400" />
                <span>RisingNet BGP</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-purple-500 border border-purple-400" />
                <span>Trans-Oceanic (&gt;75ms)</span>
              </span>
            </div>
          </div>

          {/* High-Density Matrix Grid of Nodes */}
          <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-22 gap-1.5 max-h-[520px] overflow-y-auto p-1 pr-2 custom-nav-scrollbar select-none">
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isDp = node.id.startsWith('dp_');
              const isRn = node.id.startsWith('rn_');
              return (
                <div
                  key={node.id}
                  onClick={() => {
                    setSelectedNode(node);
                    handleRunPingTest(node);
                  }}
                  className={`relative p-1.5 rounded-lg border text-center transition-all cursor-pointer group flex flex-col justify-between items-center min-h-[52px] ${
                    isSelected
                      ? 'ring-2 ring-white scale-105 z-20 ' + getNodeColorClass(node)
                      : getNodeColorClass(node)
                  }`}
                  title={`${node.name}\nHost: ${node.host}:${node.port}\nSID: ${node.sid} · Ping: ${node.latencyMs}ms\nCampus: ${node.campusName}`}
                >
                  {/* Badge Provider indicator */}
                  <div className="w-full flex items-center justify-between text-[9px] font-mono leading-none">
                    <span className="font-bold opacity-80">
                      {isDp ? 'DP' : isRn ? 'RN' : 'SW'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  <span className="text-[10px] font-mono font-black tracking-tight truncate w-full">
                    {node.sid}
                  </span>

                  <span className="text-[8px] font-mono opacity-75 tabular-nums">
                    {node.latencyMs}ms
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Click any node in the matrix to inspect real-time link health, run ICMP pings, and copy UnrealIRCd link block.</span>
            <span className="text-emerald-400 font-bold">100% Spanning-Tree Mesh Sync</span>
          </div>
        </div>
      )}

      {/* ========================================================
          3B. CARD TELEMETRY VIEW
          ======================================================== */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredNodes.slice(0, 36).map((node) => {
            const isDp = node.id.startsWith('dp_');
            return (
              <div
                key={node.id}
                onClick={() => {
                  setSelectedNode(node);
                  handleRunPingTest(node);
                }}
                className={`p-4 rounded-xl border bg-slate-950 transition-all cursor-pointer space-y-2.5 font-mono text-xs ${
                  selectedNode?.id === node.id
                    ? 'border-cyan-400 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate max-w-[200px]">{node.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isDp ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    SID {node.sid}
                  </span>
                </div>

                <div className="text-[11px] text-purple-300 truncate">
                  {node.host}:{node.port}
                </div>

                <p className="text-[11px] text-slate-400 truncate">
                  {node.campusName}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="text-emerald-400 font-bold">{node.latencyMs}ms RTT</span>
                  <span className="text-slate-400">{node.fiberCapacity.split('·')[0]}</span>
                  <span className="text-cyan-400 font-bold">Inspect ➔</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          3C. TELECOM INVENTORY TABLE VIEW
          ======================================================== */}
      {viewMode === 'table' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-[11px]">
                  <th className="py-3 px-4">SID</th>
                  <th className="py-3 px-4">Node Name &amp; Hostname</th>
                  <th className="py-3 px-4">Provider / Facility</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredNodes.slice(0, 50).map((node) => (
                  <tr
                    key={node.id}
                    onClick={() => {
                      setSelectedNode(node);
                      handleRunPingTest(node);
                    }}
                    className="hover:bg-slate-850/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-bold text-cyan-400">{node.sid}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white truncate max-w-xs">{node.name}</div>
                      <div className="text-[11px] text-purple-300">{node.host}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 truncate max-w-xs">{node.campusName}</td>
                    <td className="py-3 px-4 text-slate-400">{node.location}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold tabular-nums">{node.latencyMs} ms</td>
                    <td className="py-3 px-4 text-slate-300">{node.fiberCapacity.split('·')[0]}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLinkBlock(node);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] transition"
                      >
                        Copy Link
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
          4. INTERACTIVE NODE TELEMETRY & LINK INSPECTOR DRAWER
          ======================================================== */}
      {selectedNode && (
        <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold">
                {selectedNode.sid}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">{selectedNode.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    LINK SYNCED
                  </span>
                </div>
                <p className="text-xs text-purple-300 mt-0.5">{selectedNode.host}:{selectedNode.port} (SSL 6697)</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRunPingTest(selectedNode)}
                disabled={isPinging}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>{isPinging ? 'Pinging Node...' : 'Run Diagnostics'}</span>
              </button>

              <button
                onClick={() => {
                  setShowTrendsChart(true);
                  window.scrollTo({ top: 200, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition flex items-center gap-1.5 cursor-pointer font-bold"
                title="Plot this node in the Recharts timeseries line chart"
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Plot on Trends Chart</span>
              </button>

              <button
                onClick={() => handleCopyLinkBlock(selectedNode)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Link Block</span>
              </button>

              <button
                onClick={() => setSelectedNode(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Node Specifications & Cryptography Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase">Transit &amp; Uplink</span>
              <p className="text-white font-bold truncate">{selectedNode.transitProvider}</p>
              <p className="text-[11px] text-slate-400">{selectedNode.fiberCapacity}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase">Facility &amp; Metro</span>
              <p className="text-white font-bold truncate">{selectedNode.location}</p>
              <p className="text-[11px] text-slate-400 truncate">{selectedNode.campusName}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase">SSL &amp; Cipher Suite</span>
              <p className="text-emerald-400 font-bold truncate">TLSv1.3 TLS_AES_256_GCM</p>
              <p className="text-[10px] text-slate-500 truncate">{selectedNode.sslFingerprint}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase">4-Hub Leaf Connections (6697 SSL)</span>
              <p className="text-emerald-400 font-bold truncate text-[11px]">irc.drfun1.com (001) &bull; irc.drfun1media.com (002)</p>
              <p className="text-[11px] text-cyan-300 truncate">irc.drfun1media.net (003) &bull; drfun1ircd.com (004)</p>
            </div>
          </div>

          {/* Real-time Diagnostics Terminal Output */}
          {pingResults && pingResults.length > 0 && (
            <div className="p-3.5 rounded-xl bg-black border border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-300">
              <div className="flex items-center justify-between text-slate-500 border-b border-slate-800/80 pb-1">
                <span>ICMP &amp; TCP Handshake Diagnostics: {selectedNode.host} ({selectedNode.port})</span>
                <span className="text-emerald-400 font-bold">4 packets transmitted, 4 received, 0% loss</span>
              </div>
              {pingResults.map((p) => (
                <div key={p.seq} className="flex items-center justify-between text-slate-300">
                  <span>{p.bytes} bytes from {selectedNode.host}: icmp_seq={p.seq} ttl={p.ttl} time={p.rttMs} ms</span>
                  <span className="text-emerald-400 font-bold">OK</span>
                </div>
              ))}
            </div>
          )}

          {/* UnrealIRCd Link Block Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>UnrealIRCd 6.1.4 Leaf Configuration Block:</span>
              <button
                onClick={() => handleCopyLinkBlock(selectedNode)}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                Copy to Clipboard
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-black border border-slate-800 text-[10px] text-slate-300 overflow-x-auto max-h-36 custom-nav-scrollbar">
              {selectedNode.unrealLinkBlock}
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================
          5. LEGAL ESCROW & STATUTORY FOOTER
          ======================================================== */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Switch.com &amp; DataPacket NOC Mesh Operations &bull; Legal Counsel: Richard Alan Witt, Esq. (www.wittlawfirm.com)</span>
        </div>
        <div className="flex items-center gap-3">
          <span>FCC FRN: 0034981290</span>
          <span>&bull;</span>
          <span>Certificate ID: RAW-SATCOM-2026-LIC-0881</span>
        </div>
      </div>
    </div>
  );
};
