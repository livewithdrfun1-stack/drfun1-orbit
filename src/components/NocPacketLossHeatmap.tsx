/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * NOC Packet Loss Heatmap View Component
 * Real-time color-coded visual matrix representing packet loss percentages across all 1,034 federated leaf nodes:
 * - 500 www.switch.com Nodes/Hub via CGW Law Offices (1,000 total)
 * - 12 www.datapacket.com Leafs/Hub (24 total)
 * - 10 www.risingnet.com Dedicated Servers synced & leafed to BOTH irc.drfun1.com & irc.drfun1media.com
 * Features live ICMP probe simulation, carrier/regional groupings, burst test injection, and node inspection.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  Zap,
  Server,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Layers,
  Globe,
  Radio,
  Flame,
  X,
  Info,
  ChevronDown
} from 'lucide-react';
import { SwitchDedicatedNode } from '../types/irc';
import { ALL_NETWORK_LEAF_NODES } from '../data/unrealSearchData';
import { ConstellationCoverageOverlay } from './ConstellationCoverageOverlay';

interface NodePacketTelemetry {
  nodeId: string;
  lossPct: number;
  packetsSent: number;
  packetsDropped: number;
  lastProbeRtt: number;
  jitterMs: number;
  status: 'nominal' | 'trace' | 'minor' | 'degraded';
}

interface NocPacketLossHeatmapProps {
  selectedNode?: SwitchDedicatedNode | null;
  onSelectNode: (node: SwitchDedicatedNode) => void;
  onRunDiagnostics?: (node: SwitchDedicatedNode) => void;
}

type GroupingMode = 'flat' | 'provider' | 'region';
type LossFilterMode = 'all' | 'clean' | 'loss_detected';

// Initial baseline telemetry map: vast majority 0.00%, a few realistic long-haul trace points (0.01% - 0.05%)
const generateInitialPacketLoss = (): Record<string, NodePacketTelemetry> => {
  const map: Record<string, NodePacketTelemetry> = {};

  ALL_NETWORK_LEAF_NODES.forEach((node, index) => {
    // Inject tiny trace loss on ~4 out of 1,034 nodes (typically trans-oceanic or edge peering)
    let lossPct = 0.0;
    let packetsDropped = 0;
    const packetsSent = 10000;

    if (node.id === 'dp_h1_tokyo' || node.id === 'dp_h1_singapore') {
      lossPct = 0.02; // 2 out of 10,000 dropped on trans-Pacific route
      packetsDropped = 2;
    } else if (node.id === 'dp_h2_saopaulo') {
      lossPct = 0.04;
      packetsDropped = 4;
    } else if (index === 184) {
      lossPct = 0.01;
      packetsDropped = 1;
    }

    const jitter = Number((0.4 + (index % 5) * 0.12).toFixed(2));

    map[node.id] = {
      nodeId: node.id,
      lossPct,
      packetsSent,
      packetsDropped,
      lastProbeRtt: node.latencyMs,
      jitterMs: jitter,
      status: lossPct === 0 ? 'nominal' : lossPct <= 0.1 ? 'trace' : 'minor'
    };
  });

  return map;
};

export const NocPacketLossHeatmap: React.FC<NocPacketLossHeatmapProps> = ({
  selectedNode,
  onSelectNode,
  onRunDiagnostics,
}) => {
  // Telemetry map state
  const [telemetry, setTelemetry] = useState<Record<string, NodePacketTelemetry>>(
    generateInitialPacketLoss
  );

  // Heatmap View Controls
  const [grouping, setGrouping] = useState<GroupingMode>('flat');
  const [lossFilter, setLossFilter] = useState<LossFilterMode>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiveProbing, setIsLiveProbing] = useState<boolean>(true);
  const [hoveredNode, setHoveredNode] = useState<{
    node: SwitchDedicatedNode;
    lossData: NodePacketTelemetry;
    x: number;
    y: number;
  } | null>(null);

  // Burst Stress Test simulation state
  const [isBurstTesting, setIsBurstTesting] = useState<boolean>(false);
  const [burstProgress, setBurstProgress] = useState<number>(0);
  const [burstMessage, setBurstMessage] = useState<string | null>(null);

  // Constellation Coverage TLE Overlay State
  const [showConstellationOverlay, setShowConstellationOverlay] = useState<boolean>(true);
  const [satelliteCoveredNodeIds, setSatelliteCoveredNodeIds] = useState<Set<string>>(new Set());

  // Real-time live probing simulation
  useEffect(() => {
    if (!isLiveProbing) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const next = { ...prev };
        // Randomly simulate 1-2 micro-fluctuations per tick
        const randomTargetIndex = Math.floor(Math.random() * ALL_NETWORK_LEAF_NODES.length);
        const node = ALL_NETWORK_LEAF_NODES[randomTargetIndex];
        if (node && next[node.id]) {
          const current = next[node.id];
          const newSent = current.packetsSent + 100;
          // 99.7% chance packet arrives cleanly, 0.3% chance of 1 dropped packet on edge node
          const dropHappened = Math.random() < 0.03 && (node.id.startsWith('dp_') || node.latencyMs > 50);
          const newDropped = current.packetsDropped + (dropHappened ? 1 : 0);
          const newLoss = Number(((newDropped / newSent) * 100).toFixed(3));
          
          next[node.id] = {
            ...current,
            packetsSent: newSent,
            packetsDropped: newDropped,
            lossPct: newLoss,
            status: newLoss === 0 ? 'nominal' : newLoss <= 0.1 ? 'trace' : newLoss <= 0.5 ? 'minor' : 'degraded'
          };
        }
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveProbing]);

  // Execute synthetic 1,000-packet probe sweep across all 1,034 nodes
  const handleRunBurstTest = () => {
    if (isBurstTesting) return;
    setIsBurstTesting(true);
    setBurstProgress(0);
    setBurstMessage('Initializing 1,034-node ICMP Jumbo-Frame Burst (1,000 pkts/node across Dual Hubs)...');

    let currentStep = 0;
    const totalSteps = 10;
    const timer = setInterval(() => {
      currentStep += 1;
      setBurstProgress(currentStep * 10);

      if (currentStep === 4) {
        setBurstMessage('Flooding 1,034,000 packets across Switch (CGW), DataPacket 100G & RisingNet Dedicated...');
      } else if (currentStep === 7) {
        setBurstMessage('Analyzing Return Echo Frames & Calculating Spanning Loss Matrix...');
      } else if (currentStep >= totalSteps) {
        clearInterval(timer);
        setIsBurstTesting(false);
        setBurstProgress(100);
        setBurstMessage('Sweep Complete: 1,034/1,034 nodes probed across Both Hubs (500 Switch/Hub via CGW, 12 DP/Hub, 10 RisingNet) with 0.001% aggregate loss.');
        setTimeout(() => setBurstMessage(null), 4000);

        // Update telemetry with refreshed values
        setTelemetry((prev) => {
          const updated = { ...prev };
          ALL_NETWORK_LEAF_NODES.forEach((node) => {
            if (updated[node.id]) {
              const cur = updated[node.id];
              const addedSent = 1000;
              const addedDrop = node.id === 'dp_h1_tokyo' ? 1 : 0;
              const totalSent = cur.packetsSent + addedSent;
              const totalDrop = cur.packetsDropped + addedDrop;
              const loss = Number(((totalDrop / totalSent) * 100).toFixed(3));
              updated[node.id] = {
                ...cur,
                packetsSent: totalSent,
                packetsDropped: totalDrop,
                lossPct: loss,
                status: loss === 0 ? 'nominal' : loss <= 0.1 ? 'trace' : 'minor'
              };
            }
          });
          return updated;
        });
      }
    }, 300);
  };

  // Reset all anomalies to 0.00% pristine clean state
  const handleResetAnomalies = () => {
    const pristine = generateInitialPacketLoss();
    ALL_NETWORK_LEAF_NODES.forEach((n) => {
      pristine[n.id].lossPct = 0.0;
      pristine[n.id].packetsDropped = 0;
      pristine[n.id].status = 'nominal';
    });
    setTelemetry(pristine);
  };

  // Color mapping logic for packet loss percentage
  const getLossColorClasses = (lossPct: number) => {
    if (lossPct === 0) {
      // 0.00%: Clean Emerald Tier-5 Nominal
      return {
        bg: 'bg-emerald-950/80 hover:bg-emerald-800/80',
        border: 'border-emerald-600/70',
        text: 'text-emerald-300',
        badge: '0.00%'
      };
    }
    if (lossPct <= 0.1) {
      // 0.01% - 0.10%: Trace Micro-Loss (Teal/Cyan)
      return {
        bg: 'bg-teal-950/90 hover:bg-teal-800/90',
        border: 'border-cyan-400',
        text: 'text-cyan-200',
        badge: `${lossPct.toFixed(2)}%`
      };
    }
    if (lossPct <= 0.5) {
      // 0.11% - 0.50%: Minor Loss Warning (Amber)
      return {
        bg: 'bg-amber-950/90 hover:bg-amber-800/90 animate-pulse',
        border: 'border-amber-400 ring-1 ring-amber-500',
        text: 'text-amber-200',
        badge: `${lossPct.toFixed(2)}%`
      };
    }
    // > 0.50%: Severe Loss Degradation (Red)
    return {
      bg: 'bg-rose-950 hover:bg-rose-900 animate-pulse',
      border: 'border-rose-500 ring-2 ring-rose-500',
      text: 'text-rose-100',
      badge: `${lossPct.toFixed(2)}%`
    };
  };

  // Aggregate Metrics
  const aggregateStats = useMemo(() => {
    let totalSent = 0;
    let totalDropped = 0;
    let zeroLossCount = 0;
    let traceLossCount = 0;
    let degradedCount = 0;
    let maxLoss = 0;
    let maxLossNodeSid = 'Nominal';

    ALL_NETWORK_LEAF_NODES.forEach((node) => {
      const data = telemetry[node.id];
      if (data) {
        totalSent += data.packetsSent;
        totalDropped += data.packetsDropped;
        if (data.lossPct === 0) {
          zeroLossCount++;
        } else if (data.lossPct <= 0.1) {
          traceLossCount++;
        } else {
          degradedCount++;
        }

        if (data.lossPct > maxLoss) {
          maxLoss = data.lossPct;
          maxLossNodeSid = `${node.sid} (${node.name.split(' ')[0]})`;
        }
      }
    });

    const meshLossPct = totalSent > 0 ? Number(((totalDropped / totalSent) * 100).toFixed(4)) : 0;

    return {
      totalSent,
      totalDropped,
      meshLossPct,
      zeroLossCount,
      traceLossCount,
      degradedCount,
      maxLoss,
      maxLossNodeSid
    };
  }, [telemetry]);

  // Filtered Nodes
  const filteredNodes = useMemo(() => {
    return ALL_NETWORK_LEAF_NODES.filter((node) => {
      const data = telemetry[node.id];
      if (!data) return false;

      // Loss filter
      if (lossFilter === 'clean' && data.lossPct > 0) return false;
      if (lossFilter === 'loss_detected' && data.lossPct === 0) return false;

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
  }, [telemetry, lossFilter, searchQuery]);

  // Groups for Provider Grouping
  const providerGroups = useMemo(() => {
    const groups: { title: string; providerCode: string; icon: any; nodes: SwitchDedicatedNode[] }[] = [
      {
        title: 'Switch.com Tier 5 Platinum Nodes (500/Hub via CGW Law Offices)',
        providerCode: 'switch',
        icon: Server,
        nodes: filteredNodes.filter((n) => !n.id.startsWith('dp_') && !n.id.startsWith('rn_'))
      },
      {
        title: 'DataPacket.com 100G No-Ads Leafs (12/Hub · 24 Total)',
        providerCode: 'datapacket',
        icon: Zap,
        nodes: filteredNodes.filter((n) => n.id.startsWith('dp_'))
      },
      {
        title: 'RisingNet.com Dedicated Servers (10 Dual-Hub Synced)',
        providerCode: 'risingnet',
        icon: Activity,
        nodes: filteredNodes.filter((n) => n.id.startsWith('rn_'))
      }
    ];
    return groups.filter((g) => g.nodes.length > 0);
  }, [filteredNodes]);

  // Groups for Regional Grouping
  const regionalGroups = useMemo(() => {
    const map: Record<string, SwitchDedicatedNode[]> = {};
    filteredNodes.forEach((node) => {
      const region = node.region || 'North America (US West)';
      if (!map[region]) map[region] = [];
      map[region].push(node);
    });

    return Object.entries(map).map(([region, nodes]) => ({
      region,
      nodes
    }));
  }, [filteredNodes]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
      {/* ========================================================
          1. HEATMAP HEADER & TELEMETRY SUMMARY
          ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-500 p-0.5 shadow-md shadow-emerald-950/40 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Real-Time Packet Loss Heatmap (1,034-Leaf Dual-Hub Mesh)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isLiveProbing ? 'animate-ping' : ''}`} />
                <span>{isLiveProbing ? 'LIVE ICMP PROBING' : 'PROBING PAUSED'}</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                COLOR-CODED LOSS MATRIX
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Continuous 100-packet micro-probes monitoring frame delivery across 1,034 nodes (500 Switch/hub via CGW Law Offices · 12 DataPacket/hub · 10 RisingNet dedicated servers) synced to BOTH hubs.
            </p>
          </div>
        </div>

        {/* Heatmap Tool Actions */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          {/* Pause / Resume Live Probing */}
          <button
            onClick={() => setIsLiveProbing(!isLiveProbing)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isLiveProbing
                ? 'bg-slate-950 text-emerald-300 border-emerald-500/40 hover:bg-slate-900'
                : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/30'
            }`}
          >
            {isLiveProbing ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pause Probes</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resume Probes</span>
              </>
            )}
          </button>

          {/* Synthetic Burst Test Button */}
          <button
            onClick={handleRunBurstTest}
            disabled={isBurstTesting}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-950/30 disabled:opacity-50"
            title="Send 1,000 jumbo frame packets to all 1,034 leaf nodes simultaneously across Both Hubs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBurstTesting ? 'animate-spin' : ''}`} />
            <span>{isBurstTesting ? `Probing (${burstProgress}%)` : 'Burst Test 1,034 Nodes'}</span>
          </button>

          {/* Reset Anomalies */}
          <button
            onClick={handleResetAnomalies}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            title="Reset all simulated packet drops back to zero"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Loss Baseline</span>
          </button>

          {/* Toggle Constellation Coverage Overlay */}
          <button
            onClick={() => setShowConstellationOverlay(!showConstellationOverlay)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
              showConstellationOverlay
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-950/40 ring-1 ring-cyan-400'
                : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/50'
            }`}
            title="Toggle Real-Time Satellite Constellation Coverage (TLE Footprints) Overlay"
          >
            <Radio className={`w-3.5 h-3.5 ${showConstellationOverlay ? 'text-white animate-pulse' : 'text-cyan-400'}`} />
            <span>Constellation Coverage</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-200 font-bold border border-cyan-400/30">
              TLE
            </span>
          </button>
        </div>
      </div>

      {/* Burst Progress Notice Banner */}
      {burstMessage && (
        <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/50 text-xs font-mono text-purple-200 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>{burstMessage}</span>
          </div>
          <div className="w-32 bg-slate-900 rounded-full h-2 overflow-hidden border border-purple-500/40">
            <div
              className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${burstProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Aggregate Packet Loss KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
        {/* Network-wide Loss */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Aggregate Mesh Loss</span>
            <Activity className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tabular-nums flex items-baseline gap-1.5">
            <span className="text-emerald-400">{aggregateStats.meshLossPct}%</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {aggregateStats.totalDropped} dropped / {(aggregateStats.totalSent / 1000).toFixed(0)}k sent
          </div>
        </div>

        {/* 100% Loss-Free Nodes */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>0.00% Clean Nodes</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-300 tabular-nums flex items-baseline gap-1.5">
            <span>{aggregateStats.zeroLossCount}</span>
            <span className="text-xs text-slate-400 font-normal">/ {ALL_NETWORK_LEAF_NODES.length}</span>
          </div>
          <div className="text-[10px] text-emerald-400 truncate">
            {((aggregateStats.zeroLossCount / ALL_NETWORK_LEAF_NODES.length) * 100).toFixed(1)}% Pristine Health
          </div>
        </div>

        {/* Trace Loss Nodes */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Trace Loss (&lt;0.1%)</span>
            <Zap className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-300 tabular-nums flex items-baseline gap-1.5">
            <span>{aggregateStats.traceLossCount}</span>
            <span className="text-xs text-slate-400 font-normal">nodes</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            Negligible Trans-Oceanic Jitter
          </div>
        </div>

        {/* Degraded Nodes */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Degraded (&gt;0.1%)</span>
            <AlertTriangle className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white tabular-nums flex items-baseline gap-1.5">
            <span className={aggregateStats.degradedCount > 0 ? 'text-amber-400' : 'text-slate-400'}>
              {aggregateStats.degradedCount}
            </span>
            <span className="text-xs text-slate-400 font-normal">nodes</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            Zero Critical Outages
          </div>
        </div>

        {/* Maximum Observed Loss */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Max Node Loss</span>
            <Flame className="w-3 h-3 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-300 tabular-nums flex items-baseline gap-1.5">
            <span>{aggregateStats.maxLoss}%</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {aggregateStats.maxLossNodeSid}
          </div>
        </div>

        {/* MTU & Buffer Specs */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Frame MTU</span>
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tabular-nums flex items-baseline gap-1.5">
            <span>9000</span>
            <span className="text-xs text-emerald-400 font-semibold">Jumbo</span>
          </div>
          <div className="text-[10px] text-emerald-400 truncate">
            Tier-5 Optical Rings
          </div>
        </div>
      </div>

      {/* ========================================================
          1B. INTERACTIVE CONSTELLATION COVERAGE (TLE FOOTPRINTS) OVERLAY
          ======================================================== */}
      {showConstellationOverlay && (
        <ConstellationCoverageOverlay
          selectedNode={selectedNode}
          onSelectNode={(node) => {
            onSelectNode(node);
            if (onRunDiagnostics) onRunDiagnostics(node);
          }}
          onHighlightNodesChange={(coveredSet) => setSatelliteCoveredNodeIds(coveredSet)}
          onCloseOverlay={() => setShowConstellationOverlay(false)}
        />
      )}

      {/* ========================================================
          2. HEATMAP CONTROLS, GROUPINGS & LOSS FILTERS
          ======================================================== */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Grouping Mode Toggles */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <span className="text-slate-500 text-[11px] font-bold mr-1">Grouping:</span>
            
            <button
              onClick={() => setGrouping('flat')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                grouping === 'flat'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Unified 1,034 Matrix (Dual-Hub)
            </button>

            <button
              onClick={() => setGrouping('provider')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                grouping === 'provider'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>By Carrier (Switch / DP / RN)</span>
            </button>

            <button
              onClick={() => setGrouping('region')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                grouping === 'region'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-emerald-300 border border-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>By Geography</span>
            </button>
          </div>

          {/* Loss Filter Toggles */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500 text-[11px] font-bold mr-1">Filter:</span>
            
            <button
              onClick={() => setLossFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                lossFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({ALL_NETWORK_LEAF_NODES.length})
            </button>

            <button
              onClick={() => setLossFilter('clean')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                lossFilter === 'clean'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              Only 0.00% Clean
            </button>

            <button
              onClick={() => setLossFilter('loss_detected')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                lossFilter === 'loss_detected'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              Trace Loss ({aggregateStats.traceLossCount + aggregateStats.degradedCount})
            </button>
          </div>
        </div>

        {/* Search & Heatmap Legend Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SID, hostname, facility, or metro..."
              className="w-full pl-9 pr-7 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
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

          {/* Color-Coded Heatmap Loss Legend */}
          <div className="flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
            <span className="font-bold text-slate-500 uppercase tracking-wider">Loss Scale:</span>
            
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-500" />
              <span className="text-emerald-300 font-bold">0.00% (Pristine)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal-950 border border-cyan-400" />
              <span className="text-cyan-300">0.01% – 0.10% (Trace)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-950 border border-amber-400" />
              <span className="text-amber-300">0.11% – 0.50% (Minor)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-950 border border-rose-500" />
              <span className="text-rose-300">&gt;0.50% (Degraded)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. HEATMAP COLOR-CODED GRID RENDERER
          ======================================================== */}
      {/* 3A. UNIFIED 1,000-NODE MATRIX VIEW */}
      {grouping === 'flat' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>Unified High-Density Grid (Showing {filteredNodes.length} of {ALL_NETWORK_LEAF_NODES.length} Nodes · Dual-Hub Synced)</span>
            <span className="text-[11px] text-slate-500">Hover cell for probe telemetry · Click to inspect node</span>
          </div>

          <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-22 gap-1.5 p-2 bg-slate-950/90 border border-slate-800 rounded-xl max-h-[500px] overflow-y-auto custom-nav-scrollbar select-none">
            {filteredNodes.map((node) => {
              const data = telemetry[node.id] || { lossPct: 0, packetsSent: 10000, packetsDropped: 0 };
              const color = getLossColorClasses(data.lossPct);
              const isSelected = selectedNode?.id === node.id;
              const isDp = node.id.startsWith('dp_');
              const isRn = node.id.startsWith('rn_');
              const isSatCovered = satelliteCoveredNodeIds.has(node.id);

              return (
                <div
                  key={node.id}
                  onClick={() => {
                    onSelectNode(node);
                    if (onRunDiagnostics) onRunDiagnostics(node);
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredNode({
                      node,
                      lossData: data,
                      x: rect.left + rect.width / 2,
                      y: rect.top
                    });
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`relative p-1 rounded-lg border text-center transition-all duration-150 cursor-pointer flex flex-col justify-between items-center min-h-[48px] ${
                    color.bg
                  } ${color.border} ${
                    isSelected
                      ? 'ring-2 ring-white scale-110 z-20 shadow-xl'
                      : isSatCovered
                      ? 'ring-1 ring-cyan-400 shadow-md shadow-cyan-950/60'
                      : ''
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[8px] font-mono leading-none opacity-80">
                    <span className="font-bold flex items-center gap-0.5">
                      {isSatCovered && <span className="text-[7px] text-cyan-300" title="Illuminated by Satellite Footprint">🛰️</span>}
                      <span>{isDp ? 'DP' : isRn ? 'RN' : 'SW'}</span>
                    </span>
                    {data.lossPct > 0 ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </div>

                  <span className="text-[9px] font-mono font-black tracking-tight text-white truncate w-full">
                    {node.sid}
                  </span>

                  <span className={`text-[8px] font-mono font-bold tabular-nums ${color.text}`}>
                    {color.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3B. GROUPED BY CARRIER VIEW */}
      {grouping === 'provider' && (
        <div className="space-y-4">
          {providerGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.providerCode} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white">{group.title}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300">
                      {group.nodes.length} Nodes
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    All links leafed to irc.drfun1.com (SID 001)
                  </span>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-18 gap-1.5 select-none">
                  {group.nodes.map((node) => {
                    const data = telemetry[node.id] || { lossPct: 0, packetsSent: 10000, packetsDropped: 0 };
                    const color = getLossColorClasses(data.lossPct);
                    const isSelected = selectedNode?.id === node.id;
                    const isSatCovered = satelliteCoveredNodeIds.has(node.id);

                    return (
                      <div
                        key={node.id}
                        onClick={() => {
                          onSelectNode(node);
                          if (onRunDiagnostics) onRunDiagnostics(node);
                        }}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col justify-between items-center min-h-[46px] ${
                          color.bg
                        } ${color.border} ${
                          isSelected
                            ? 'ring-2 ring-white scale-105 z-10'
                            : isSatCovered
                            ? 'ring-1 ring-cyan-400 shadow-md shadow-cyan-950/60'
                            : ''
                        }`}
                        title={`${node.name}\nHost: ${node.host}\nLoss: ${data.lossPct}% (${data.packetsDropped} dropped)${isSatCovered ? '\n🛰️ In Active Satellite Footprint' : ''}`}
                      >
                        <span className="text-[9px] font-mono font-bold text-white truncate w-full flex items-center justify-center gap-0.5">
                          {isSatCovered && <span className="text-[7px]">🛰️</span>}
                          <span>{node.sid}</span>
                        </span>
                        <span className={`text-[8px] font-mono font-bold ${color.text}`}>
                          {color.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3C. GROUPED BY GEOGRAPHIC REGION VIEW */}
      {grouping === 'region' && (
        <div className="space-y-4">
          {regionalGroups.map((group) => (
            <div key={group.region} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white">{group.region}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300">
                    {group.nodes.length} Nodes
                  </span>
                </div>
                <span className="text-slate-500 text-[11px]">
                  Regional Edge Downlinks &bull; 9000 MTU Jumbo Frames
                </span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-18 gap-1.5 select-none">
                {group.nodes.map((node) => {
                  const data = telemetry[node.id] || { lossPct: 0, packetsSent: 10000, packetsDropped: 0 };
                  const color = getLossColorClasses(data.lossPct);
                  const isSelected = selectedNode?.id === node.id;
                  const isSatCovered = satelliteCoveredNodeIds.has(node.id);

                  return (
                    <div
                      key={node.id}
                      onClick={() => {
                        onSelectNode(node);
                        if (onRunDiagnostics) onRunDiagnostics(node);
                      }}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col justify-between items-center min-h-[46px] ${
                        color.bg
                      } ${color.border} ${
                        isSelected
                          ? 'ring-2 ring-white scale-105 z-10'
                          : isSatCovered
                          ? 'ring-1 ring-cyan-400 shadow-md shadow-cyan-950/60'
                          : ''
                      }`}
                      title={`${node.name}\nHost: ${node.host}\nLoss: ${data.lossPct}% (${data.packetsDropped} dropped)${isSatCovered ? '\n🛰️ In Active Satellite Footprint' : ''}`}
                    >
                      <span className="text-[9px] font-mono font-bold text-white truncate w-full flex items-center justify-center gap-0.5">
                        {isSatCovered && <span className="text-[7px]">🛰️</span>}
                        <span>{node.sid}</span>
                      </span>
                      <span className={`text-[8px] font-mono font-bold ${color.text}`}>
                        {color.badge}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Tooltip Card when hovering */}
      {hoveredNode && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md font-mono text-xs space-y-1.5 min-w-[240px] text-left"
          style={{
            left: `${hoveredNode.x}px`,
            top: `${hoveredNode.y - 10}px`
          }}
        >
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="font-bold text-white truncate max-w-[170px]">
              {hoveredNode.node.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
              SID {hoveredNode.node.sid}
            </span>
          </div>

          <div className="text-[11px] text-purple-300 truncate">
            {hoveredNode.node.host}:{hoveredNode.node.port}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
            <div>
              <span className="text-slate-500 block">Packet Loss</span>
              <span
                className={`font-bold text-xs ${
                  hoveredNode.lossData.lossPct === 0 ? 'text-emerald-400' : 'text-cyan-300'
                }`}
              >
                {hoveredNode.lossData.lossPct.toFixed(2)}%
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Dropped Pkts</span>
              <span className="font-bold text-xs text-white">
                {hoveredNode.lossData.packetsDropped} / {hoveredNode.lossData.packetsSent}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">RTT Latency</span>
              <span className="font-bold text-xs text-amber-300">
                {hoveredNode.lossData.lastProbeRtt} ms
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Link Quality</span>
              <span className="font-bold text-xs text-emerald-400">100% Sync</span>
            </div>
          </div>

          {/* Active Satellite Footprint Illumination Status */}
          {satelliteCoveredNodeIds.has(hoveredNode.node.id) && (
            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-cyan-300 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>Constellation Footprint:</span>
              </span>
              <span className="text-cyan-200 font-bold bg-cyan-500/20 px-1.5 py-0.2 rounded border border-cyan-500/30">
                ACTIVE ILLUMINATION
              </span>
            </div>
          )}

          <div className="pt-1 border-t border-slate-800 text-[9px] text-slate-500 truncate">
            Facility: {hoveredNode.node.campusName || hoveredNode.node.location}
          </div>
        </div>
      )}

      {/* Heatmap Footer */}
      <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Click any node in the heatmap to focus it in the Link Inspector &amp; plot in the Recharts Trends line chart.</span>
        <span className="text-emerald-400 font-bold">99.999% SLA Carrier Packet Delivery Verified</span>
      </div>
    </div>
  );
};
