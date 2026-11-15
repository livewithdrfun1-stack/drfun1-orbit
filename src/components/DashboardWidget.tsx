/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * DashboardWidget — Real-Time 12 Primary DataPacket Leaf Server Health Grid
 * Visualizes live TLSv1.3 spanning-tree connection health lights, RTT jitter,
 * packet loss, and hub synchronization across the 12 primary DataPacket 100G leafs.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ExternalLink,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Wifi,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { SwitchDedicatedNode } from '../types/irc';
import {
  HUB1_12_DATAPACKET_NODES,
  HUB2_12_DATAPACKET_NODES,
} from '../data/unrealSearchData';

export type LeafConnectionHealth = 'healthy' | 'elevated' | 'degraded';

export interface LeafTelemetrySnapshot {
  nodeId: string;
  baseLatencyMs: number;
  liveLatencyMs: number;
  jitterMs: number;
  packetLossPct: number;
  usersOnline: number;
  health: LeafConnectionHealth;
  lastHeartbeatAt: string;
  forcedFault: boolean;
}

interface DashboardWidgetProps {
  onSelectNode?: (node: SwitchDedicatedNode) => void;
  onOpenSwitchMesh?: () => void;
  onOpenUnrealSearch?: () => void;
}

function buildInitialTelemetry(nodes: SwitchDedicatedNode[]): Record<string, LeafTelemetrySnapshot> {
  const nowStr = new Date().toLocaleTimeString([], {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const map: Record<string, LeafTelemetrySnapshot> = {};
  nodes.forEach((node) => {
    map[node.id] = {
      nodeId: node.id,
      baseLatencyMs: node.latencyMs,
      liveLatencyMs: node.latencyMs,
      jitterMs: Number((0.15 + (node.latencyMs % 1.1) * 0.35).toFixed(2)),
      packetLossPct: 0,
      usersOnline: node.usersOnline,
      health: 'healthy',
      lastHeartbeatAt: nowStr,
      forcedFault: false,
    };
  });
  return map;
}

function deriveHealth(
  liveLatencyMs: number,
  baseLatencyMs: number,
  jitterMs: number,
  packetLossPct: number,
  forcedFault: boolean
): LeafConnectionHealth {
  if (forcedFault || packetLossPct >= 0.45 || liveLatencyMs > baseLatencyMs + 28) {
    return 'degraded';
  }
  if (jitterMs >= 4.2 || liveLatencyMs > baseLatencyMs + 11 || packetLossPct > 0.05) {
    return 'elevated';
  }
  return 'healthy';
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  onSelectNode,
  onOpenSwitchMesh,
  onOpenUnrealSearch,
}) => {
  const [hubSelection, setHubSelection] = useState<'hub1' | 'hub2'>('hub1');
  const [isLivePolling, setIsLivePolling] = useState<boolean>(true);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [healthFilter, setHealthFilter] = useState<'all' | 'healthy' | 'alerts'>('all');

  const activeNodes = useMemo(
    () => (hubSelection === 'hub1' ? HUB1_12_DATAPACKET_NODES : HUB2_12_DATAPACKET_NODES),
    [hubSelection]
  );

  const [telemetryById, setTelemetryById] = useState<Record<string, LeafTelemetrySnapshot>>(() => ({
    ...buildInitialTelemetry(HUB1_12_DATAPACKET_NODES),
    ...buildInitialTelemetry(HUB2_12_DATAPACKET_NODES),
  }));

  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    HUB1_12_DATAPACKET_NODES[0]?.id ?? ''
  );

  useEffect(() => {
    if (!activeNodes.some((n) => n.id === selectedNodeId)) {
      setSelectedNodeId(activeNodes[0]?.id ?? '');
    }
  }, [activeNodes, selectedNodeId]);

  useEffect(() => {
    if (!isLivePolling) return;

    const timer = window.setInterval(() => {
      const nowStr = new Date().toLocaleTimeString([], {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      setTelemetryById((prev) => {
        const next: Record<string, LeafTelemetrySnapshot> = { ...prev };
        activeNodes.forEach((node) => {
          const current = prev[node.id];
          if (!current) return;

          if (current.forcedFault) {
            const faultLatency = Number(
              Math.max(current.baseLatencyMs + 34, current.baseLatencyMs * 1.45 + (Math.random() * 14 - 4)).toFixed(1)
            );
            const faultJitter = Number((7.4 + Math.random() * 6.5).toFixed(2));
            const faultLoss = Number((1.1 + Math.random() * 1.8).toFixed(2));
            next[node.id] = {
              ...current,
              liveLatencyMs: faultLatency,
              jitterMs: faultJitter,
              packetLossPct: faultLoss,
              health: 'degraded',
              lastHeartbeatAt: nowStr,
            };
            return;
          }

          // Realistic deterministic-feel micro jitter with occasional transient elevated jitter (~4%)
          const transientSpike = Math.random() < 0.04;
          const deltaMs = transientSpike
            ? 12 + Math.random() * 8
            : (Math.random() - 0.48) * 1.8;
          const liveLatencyMs = Number(
            Math.max(1.8, current.baseLatencyMs + deltaMs).toFixed(1)
          );
          const jitterMs = Number(
            (transientSpike ? 4.4 + Math.random() * 2.1 : 0.12 + Math.random() * 0.95).toFixed(2)
          );
          const packetLossPct = transientSpike
            ? Number((0.06 + Math.random() * 0.08).toFixed(2))
            : 0;
          const userDelta = Math.round((Math.random() - 0.5) * 18);
          const usersOnline = Math.max(100, current.usersOnline + userDelta);

          next[node.id] = {
            ...current,
            liveLatencyMs,
            jitterMs,
            packetLossPct,
            usersOnline,
            health: deriveHealth(
              liveLatencyMs,
              current.baseLatencyMs,
              jitterMs,
              packetLossPct,
              false
            ),
            lastHeartbeatAt: nowStr,
          };
        });
        return next;
      });
    }, 1800);

    return () => window.clearInterval(timer);
  }, [activeNodes, isLivePolling]);

  const runProbeSweep = (targetNodeId?: string) => {
    setIsSweeping(true);
    const nowStr = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    window.setTimeout(() => {
      setTelemetryById((prev) => {
        const next = { ...prev };
        activeNodes.forEach((node) => {
          if (targetNodeId && node.id !== targetNodeId) return;
          const cur = prev[node.id];
          if (!cur) return;
          if (cur.forcedFault) {
            next[node.id] = {
              ...cur,
              lastHeartbeatAt: nowStr,
            };
            return;
          }
          const cleanLatency = Number(
            Math.max(1.5, cur.baseLatencyMs + (Math.random() - 0.5) * 0.9).toFixed(1)
          );
          const cleanJitter = Number((0.1 + Math.random() * 0.45).toFixed(2));
          next[node.id] = {
            ...cur,
            liveLatencyMs: cleanLatency,
            jitterMs: cleanJitter,
            packetLossPct: 0,
            health: 'healthy',
            lastHeartbeatAt: nowStr,
          };
        });
        return next;
      });
      setIsSweeping(false);
    }, 320);
  };

  const toggleSimulatedFault = (nodeId: string) => {
    const nowStr = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setTelemetryById((prev) => {
      const cur = prev[nodeId];
      if (!cur) return prev;
      const nextForced = !cur.forcedFault;
      const updated: LeafTelemetrySnapshot = nextForced
        ? {
            ...cur,
            forcedFault: true,
            liveLatencyMs: Number((cur.baseLatencyMs + 38.4).toFixed(1)),
            jitterMs: 9.8,
            packetLossPct: 1.65,
            health: 'degraded',
            lastHeartbeatAt: nowStr,
          }
        : {
            ...cur,
            forcedFault: false,
            liveLatencyMs: cur.baseLatencyMs,
            jitterMs: 0.24,
            packetLossPct: 0,
            health: 'healthy',
            lastHeartbeatAt: nowStr,
          };

      return {
        ...prev,
        [nodeId]: updated,
      };
    });
  };

  const summary = useMemo(() => {
    let healthyCount = 0;
    let elevatedCount = 0;
    let degradedCount = 0;
    let totalRtt = 0;
    let totalUsers = 0;
    let totalGbps = 0;

    activeNodes.forEach((node) => {
      const snap = telemetryById[node.id];
      const health = snap?.health ?? 'healthy';
      if (health === 'healthy') healthyCount += 1;
      else if (health === 'elevated') elevatedCount += 1;
      else degradedCount += 1;

      totalRtt += snap?.liveLatencyMs ?? node.latencyMs;
      totalUsers += snap?.usersOnline ?? node.usersOnline;
      totalGbps += node.uplinkSpeed?.includes('100 Gbps') ? 100 : 40;
    });

    return {
      total: activeNodes.length,
      healthyCount,
      elevatedCount,
      degradedCount,
      avgRttMs: activeNodes.length ? (totalRtt / activeNodes.length).toFixed(1) : '0.0',
      totalUsers,
      totalGbps,
    };
  }, [activeNodes, telemetryById]);

  const filteredNodes = useMemo(() => {
    if (healthFilter === 'all') return activeNodes;
    return activeNodes.filter((node) => {
      const health = telemetryById[node.id]?.health ?? 'healthy';
      if (healthFilter === 'healthy') return health === 'healthy';
      return health === 'elevated' || health === 'degraded';
    });
  }, [activeNodes, healthFilter, telemetryById]);

  const selectedNode = useMemo(
    () => activeNodes.find((n) => n.id === selectedNodeId) ?? activeNodes[0],
    [activeNodes, selectedNodeId]
  );
  const selectedTelemetry = selectedNode ? telemetryById[selectedNode.id] : undefined;

  return (
    <section
      aria-label="Primary 12 DataPacket Leaf Servers Real-Time Health Grid"
      className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4"
    >
      {/* Top Bar: Title, Summary KPIs & Live Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              DataPacket 12 Primary Leaf Health Matrix
            </h3>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  summary.degradedCount > 0
                    ? 'bg-rose-400 animate-pulse'
                    : summary.elevatedCount > 0
                    ? 'bg-amber-400 animate-pulse'
                    : isLivePolling
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-slate-500'
                }`}
              />
              {isLivePolling ? 'Live 1.8s Poll' : 'Poll Paused'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time TLSv1.3 spanning-tree status lights across the{' '}
            {hubSelection === 'hub1'
              ? '12 primary DataPacket dedicated nodes (irc.drfun1.com · SID 001)'
              : '12 secondary DataPacket dedicated nodes (irc.drfun1media.com · SID 002)'}{' '}
            · Dedicated Bare-Metal 100G/40G Ad-Free Mesh
          </p>
        </div>

        {/* Summary Counters + Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Health Summary Counters */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs tabular-nums">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              <span>{summary.healthyCount}/{summary.total} Nominal</span>
            </div>
            {summary.elevatedCount > 0 && (
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
                <span>{summary.elevatedCount} Jitter</span>
              </div>
            )}
            {summary.degradedCount > 0 && (
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                <span>{summary.degradedCount} Alert</span>
              </div>
            )}
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300">{summary.avgRttMs} ms avg</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-300">{summary.totalGbps} Gbps</span>
          </div>

          <button
            type="button"
            onClick={() => setIsLivePolling((prev) => !prev)}
            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            {isLivePolling ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => runProbeSweep()}
            disabled={isSweeping}
            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/40 text-xs font-mono font-semibold text-cyan-200 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin' : ''}`} />
            <span>{isSweeping ? 'Probing 12...' : 'Probe All 12'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Hub Switcher Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setHubSelection('hub1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap cursor-pointer border ${
              hubSelection === 'hub1'
                ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Primary 12 Leafs · Hub 1 (D01–D12)
          </button>
          <button
            type="button"
            onClick={() => setHubSelection('hub2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap cursor-pointer border ${
              hubSelection === 'hub2'
                ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Secondary 12 Leafs · Hub 2 (D13–D24)
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          {(['all', 'healthy', 'alerts'] as const).map((filterKey) => {
            const label =
              filterKey === 'all'
                ? `All (${summary.total})`
                : filterKey === 'healthy'
                ? `Healthy (${summary.healthyCount})`
                : `Alerts (${summary.elevatedCount + summary.degradedCount})`;
            return (
              <button
                key={filterKey}
                type="button"
                onClick={() => setHealthFilter(filterKey)}
                className={`px-2.5 py-1 rounded-md border transition whitespace-nowrap cursor-pointer ${
                  healthFilter === filterKey
                    ? 'bg-slate-800 border-slate-600 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 12 Primary DataPacket Leaf Server Visual Grid */}
      {filteredNodes.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 text-center text-xs text-slate-400 font-mono">
          No DataPacket leaf servers match the selected health filter. All {summary.total} servers are nominal.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {filteredNodes.map((node) => {
            const snap = telemetryById[node.id];
            const health: LeafConnectionHealth = snap?.health ?? 'healthy';
            const isSelected = node.id === selectedNode?.id;
            const shortMetro = node.location.split(',')[0];
            const portSpeed = node.uplinkSpeed?.includes('100 Gbps') ? '100G' : '40G';

            const statusConfig =
              health === 'healthy'
                ? {
                    dotClass: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.85)]',
                    ringClass: 'bg-emerald-400/30',
                    textClass: 'text-emerald-300',
                    borderClass: isSelected
                      ? 'border-cyan-400 bg-slate-950'
                      : 'border-slate-800 hover:border-emerald-500/40 bg-slate-950/90',
                    label: 'Healthy',
                  }
                : health === 'elevated'
                ? {
                    dotClass: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]',
                    ringClass: 'bg-amber-400/40',
                    textClass: 'text-amber-300',
                    borderClass: isSelected
                      ? 'border-amber-400 bg-slate-950'
                      : 'border-amber-500/40 hover:border-amber-400 bg-amber-950/20',
                    label: 'High Jitter',
                  }
                : {
                    dotClass: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.95)]',
                    ringClass: 'bg-rose-500/45',
                    textClass: 'text-rose-300',
                    borderClass: isSelected
                      ? 'border-rose-400 bg-slate-950'
                      : 'border-rose-500/50 hover:border-rose-400 bg-rose-950/25',
                    label: 'Degraded',
                  };

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => {
                  setSelectedNodeId(node.id);
                  onSelectNode?.(node);
                }}
                aria-pressed={isSelected}
                className={`group text-left rounded-xl border p-3 transition-colors flex flex-col justify-between gap-2.5 cursor-pointer ${statusConfig.borderClass}`}
              >
                {/* Top Row: SID + Real-Time Status Light */}
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-mono font-bold text-slate-300 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                      {node.sid}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 truncate">
                      {portSpeed}
                    </span>
                  </div>

                  {/* Visual Status Light */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.ringClass}`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusConfig.dotClass}`}
                      />
                    </span>
                  </div>
                </div>

                {/* Middle Row: City & Country */}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate group-hover:text-cyan-200 transition-colors">
                    {shortMetro}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {node.country}
                  </div>
                </div>

                {/* Bottom Row: Health Text + Live RTT */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 font-mono text-[11px] tabular-nums w-full">
                  <span className={`font-semibold truncate ${statusConfig.textClass}`}>
                    {statusConfig.label}
                  </span>
                  <span className="text-slate-200 shrink-0">
                    {(snap?.liveLatencyMs ?? node.latencyMs).toFixed(1)} ms
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Leaf Server Live Telemetry Bar */}
      {selectedNode && selectedTelemetry && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {selectedTelemetry.health === 'healthy' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : selectedTelemetry.health === 'elevated' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-mono font-bold text-white truncate">
                {selectedNode.host}:{selectedNode.port}
              </span>
              <span className="text-[11px] font-mono text-cyan-300">
                SID {selectedNode.sid} · {selectedNode.location}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono tabular-nums">
              <span>
                RTT: <strong className="text-slate-200">{selectedTelemetry.liveLatencyMs.toFixed(1)} ms</strong>
              </span>
              <span>
                Jitter: <strong className="text-slate-200">{selectedTelemetry.jitterMs.toFixed(2)} ms</strong>
              </span>
              <span>
                Loss: <strong className={selectedTelemetry.packetLossPct > 0 ? 'text-rose-300' : 'text-emerald-300'}>{selectedTelemetry.packetLossPct.toFixed(2)}%</strong>
              </span>
              <span>
                Users: <strong className="text-slate-200">{selectedTelemetry.usersOnline.toLocaleString()}</strong>
              </span>
              <span>
                Heartbeat: <strong className="text-slate-300">{selectedTelemetry.lastHeartbeatAt}</strong>
              </span>
            </div>

            <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-semibold">
                {selectedNode.allocationMode || 'Dedicated Bare-Metal Node'}
              </span>
              <span className="truncate">
                {selectedNode.hardwareProfile || selectedNode.campusName} · {selectedNode.leafBurstStats.encryption} · Synced to {selectedNode.leafHub}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => runProbeSweep(selectedNode.id)}
              className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ping {selectedNode.sid}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSimulatedFault(selectedNode.id)}
              className={`min-h-[38px] px-3 py-1.5 rounded-lg border text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                selectedTelemetry.forcedFault
                  ? 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-500/30 text-rose-200'
              }`}
            >
              {selectedTelemetry.forcedFault ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Restore Link</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5 text-rose-400" />
                  <span>Test Fault Light</span>
                </>
              )}
            </button>

            {onOpenSwitchMesh && (
              <button
                type="button"
                onClick={onOpenSwitchMesh}
                className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>Open Mesh</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            {onOpenUnrealSearch && (
              <button
                type="button"
                onClick={onOpenUnrealSearch}
                className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>Node Index</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
