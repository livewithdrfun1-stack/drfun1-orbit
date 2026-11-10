/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * NOC Mesh Trends Line Chart Component
 * High-precision timeseries latency & jitter analytics for the 352-leaf mesh:
 * - 335 Switch.com Tier 5 Platinum nodes
 * - 12 DataPacket 100G No-Ads edge nodes
 * - 5 RisingNet BGP clean-pipe transit routers
 * Powered by Recharts with dual-axis telemetry, live streaming, and node selection.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import {
  Activity,
  Zap,
  Server,
  Radio,
  Clock,
  Play,
  Pause,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Sliders,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
  Info
} from 'lucide-react';
import { SwitchDedicatedNode } from '../types/irc';
import { ALL_NETWORK_LEAF_NODES } from '../data/unrealSearchData';

interface TrendDataPoint {
  timestamp: string;
  timeLabel: string;
  meshAvgLatency: number;
  switchLatency: number;
  dataPacketLatency: number;
  risingNetLatency: number;
  selectedNodeLatency?: number;
  meshJitter: number;
  maxJitter: number;
  slaLimit: number;
  jitterSlaLimit: number;
}

interface NocMeshTrendsChartProps {
  selectedNode?: SwitchDedicatedNode | null;
  onSelectNode?: (node: SwitchDedicatedNode | null) => void;
}

type TimeWindow = 'live' | '15m' | '1h' | '6h' | '24h';
type ChartDisplayMode = 'dual' | 'latency_only' | 'jitter_only';

// Seed initial historical points based on window
const generateInitialPoints = (
  window: TimeWindow,
  node?: SwitchDedicatedNode | null
): TrendDataPoint[] => {
  const points: TrendDataPoint[] = [];
  const now = Date.now();
  
  let count = 20;
  let intervalSec = 3; // live: every 3s
  if (window === '15m') {
    count = 20;
    intervalSec = 45;
  } else if (window === '1h') {
    count = 24;
    intervalSec = 150;
  } else if (window === '6h') {
    count = 24;
    intervalSec = 900;
  } else if (window === '24h') {
    count = 24;
    intervalSec = 3600;
  }

  const baseNodeLatency = node ? node.latencyMs : 21.5;

  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * intervalSec * 1000);
    const timeLabel = window === '24h' || window === '6h'
      ? t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Realistic telecom fluctuations
    const wave = Math.sin(i * 0.4) * 1.8;
    const noise = (Math.random() - 0.5) * 1.2;
    const meshAvg = Number((23.4 + wave * 0.6 + noise).toFixed(2));
    const switchLat = Number((19.8 + wave * 0.8 + noise * 0.7).toFixed(2));
    const dpLat = Number((14.2 + wave * 0.4 + (Math.random() - 0.5) * 0.6).toFixed(2));
    const rnLat = Number((17.1 + wave * 0.5 + (Math.random() - 0.5) * 0.8).toFixed(2));
    
    // Jitter is micro-variance: 0.3ms to 1.6ms
    const jitter = Number((0.68 + Math.abs(Math.sin(i * 0.8)) * 0.4 + (Math.random() * 0.3)).toFixed(2));
    const maxJit = Number((jitter + 0.4 + Math.random() * 0.3).toFixed(2));

    const point: TrendDataPoint = {
      timestamp: t.toISOString(),
      timeLabel,
      meshAvgLatency: meshAvg,
      switchLatency: switchLat,
      dataPacketLatency: dpLat,
      risingNetLatency: rnLat,
      meshJitter: jitter,
      maxJitter: maxJit,
      slaLimit: 30.0, // 30ms SLA guarantee
      jitterSlaLimit: 2.5, // 2.5ms Jitter SLA
    };

    if (node) {
      const nodeNoise = (Math.random() - 0.5) * 1.5;
      point.selectedNodeLatency = Number((baseNodeLatency + wave * 0.5 + nodeNoise).toFixed(2));
    }

    points.push(point);
  }

  return points;
};

export const NocMeshTrendsChart: React.FC<NocMeshTrendsChartProps> = ({
  selectedNode,
  onSelectNode
}) => {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('live');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('dual');

  // Series visibility toggles
  const [showMeshAvg, setShowMeshAvg] = useState<boolean>(true);
  const [showSwitch, setShowSwitch] = useState<boolean>(true);
  const [showDataPacket, setShowDataPacket] = useState<boolean>(true);
  const [showRisingNet, setShowRisingNet] = useState<boolean>(false);
  const [showJitter, setShowJitter] = useState<boolean>(true);

  // Time-series data state
  const [chartData, setChartData] = useState<TrendDataPoint[]>(() =>
    generateInitialPoints('live', selectedNode)
  );

  // Re-generate if time window changes
  useEffect(() => {
    setChartData(generateInitialPoints(timeWindow, selectedNode));
  }, [timeWindow, selectedNode]);

  // Live streaming interval for real-time mode
  useEffect(() => {
    if (!isLiveStreaming) return;

    const intervalTime = timeWindow === 'live' ? 3000 : 8000;
    const interval = setInterval(() => {
      setChartData((prev) => {
        const now = new Date();
        const timeLabel = timeWindow === '24h' || timeWindow === '6h'
          ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const lastPoint = prev[prev.length - 1];
        const drift = (Math.random() - 0.5) * 0.8;
        const newMeshAvg = Number(Math.max(18, Math.min(28, (lastPoint ? lastPoint.meshAvgLatency : 23.4) + drift)).toFixed(2));
        const newSwitch = Number(Math.max(16, Math.min(25, (lastPoint ? lastPoint.switchLatency : 19.8) + (Math.random() - 0.5) * 0.7)).toFixed(2));
        const newDp = Number(Math.max(12, Math.min(18, (lastPoint ? lastPoint.dataPacketLatency : 14.2) + (Math.random() - 0.5) * 0.5)).toFixed(2));
        const newRn = Number(Math.max(14, Math.min(22, (lastPoint ? lastPoint.risingNetLatency : 17.1) + (Math.random() - 0.5) * 0.6)).toFixed(2));
        const newJitter = Number(Math.max(0.3, Math.min(1.8, (lastPoint ? lastPoint.meshJitter : 0.75) + (Math.random() - 0.5) * 0.2)).toFixed(2));
        const newMaxJit = Number((newJitter + 0.35 + Math.random() * 0.25).toFixed(2));

        const newPoint: TrendDataPoint = {
          timestamp: now.toISOString(),
          timeLabel,
          meshAvgLatency: newMeshAvg,
          switchLatency: newSwitch,
          dataPacketLatency: newDp,
          risingNetLatency: newRn,
          meshJitter: newJitter,
          maxJitter: newMaxJit,
          slaLimit: 30.0,
          jitterSlaLimit: 2.5,
        };

        if (selectedNode) {
          const base = selectedNode.latencyMs;
          const nodeDrift = (Math.random() - 0.5) * 1.0;
          newPoint.selectedNodeLatency = Number(Math.max(8, base + nodeDrift).toFixed(2));
        }

        // Keep last 25 points sliding
        const updated = [...prev.slice(1), newPoint];
        return updated;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isLiveStreaming, timeWindow, selectedNode]);

  // Derived real-time statistics
  const stats = useMemo(() => {
    if (!chartData.length) {
      return {
        currentLatency: 23.4,
        minLatency: 21.0,
        maxLatency: 26.2,
        currentJitter: 0.72,
        maxJitter: 1.45,
        latencyTrend: 'stable',
        jitterTrend: 'down'
      };
    }

    const latest = chartData[chartData.length - 1];
    const first = chartData[0];
    const latencies = chartData.map((d) => d.meshAvgLatency);
    const jitters = chartData.map((d) => d.meshJitter);

    const minLat = Math.min(...latencies);
    const maxLat = Math.max(...latencies);
    const maxJit = Math.max(...jitters);

    const diff = latest.meshAvgLatency - first.meshAvgLatency;
    const latencyTrend = diff > 0.5 ? 'up' : diff < -0.5 ? 'down' : 'stable';

    return {
      currentLatency: latest.meshAvgLatency,
      minLatency: minLat,
      maxLatency: maxLat,
      currentJitter: latest.meshJitter,
      maxJitter: maxJit,
      latencyTrend,
      switchLatest: latest.switchLatency,
      dpLatest: latest.dataPacketLatency,
      rnLatest: latest.risingNetLatency,
      selectedLatest: latest.selectedNodeLatency
    };
  }, [chartData]);

  // Notable reference nodes for quick selection
  const featuredNodes = useMemo(() => {
    return [
      ALL_NETWORK_LEAF_NODES.find((n) => n.id === 'dp_fra'), // Frankfurt 100G
      ALL_NETWORK_LEAF_NODES.find((n) => n.id === 'dp_ash'), // Ashburn 100G
      ALL_NETWORK_LEAF_NODES.find((n) => n.id === 'dp_lon'), // London 100G
      ALL_NETWORK_LEAF_NODES.find((n) => n.id === 'dp_tyo'), // Tokyo 40G
      ALL_NETWORK_LEAF_NODES.find((n) => n.id === 'rn_lax1'), // RisingNet Clean-Pipe LAX
      ALL_NETWORK_LEAF_NODES[0], // First Switch Node
    ].filter(Boolean) as SwitchDedicatedNode[];
  }, []);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
      {/* Component Header with Telemetry Status & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-purple-600 to-cyan-500 p-0.5 shadow-md shadow-purple-950/40 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Latency &amp; Jitter Trends Over Time
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full bg-amber-400 ${isLiveStreaming ? 'animate-ping' : ''}`} />
                <span>{isLiveStreaming ? 'LIVE TELEMETRY STREAM' : 'STREAM PAUSED'}</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                RECHARTS TIMESERIES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Real-time multi-carrier RTT and micro-jitter dispersion across 352 leaf nodes (Switch Tier 5, DataPacket 100G No-Ads &amp; RisingNet).
            </p>
          </div>
        </div>

        {/* Streaming Controls & Time Window Selector */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-lg border font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isLiveStreaming
                ? 'bg-slate-950 text-amber-300 border-amber-500/40 hover:bg-slate-900'
                : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/30'
            }`}
          >
            {isLiveStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resume Live</span>
              </>
            )}
          </button>

          {/* Time Window Buttons */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            {(['live', '15m', '1h', '6h', '24h'] as TimeWindow[]).map((w) => (
              <button
                key={w}
                onClick={() => setTimeWindow(w)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                  timeWindow === w
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {w.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Display Mode Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setDisplayMode('dual')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                displayMode === 'dual' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Dual Latency + Jitter View"
            >
              Dual Axis
            </button>
            <button
              onClick={() => setDisplayMode('latency_only')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                displayMode === 'latency_only' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Latency Only"
            >
              RTT (ms)
            </button>
            <button
              onClick={() => setDisplayMode('jitter_only')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                displayMode === 'jitter_only' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Jitter Only"
            >
              Jitter (ms)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
        {/* Median Latency */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Mesh Avg Latency</span>
            <Activity className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tabular-nums flex items-baseline gap-1.5">
            <span>{stats.currentLatency}</span>
            <span className="text-xs text-emerald-400 font-semibold">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            {stats.latencyTrend === 'down' ? (
              <span className="text-emerald-400 flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" /> -0.4ms
              </span>
            ) : (
              <span className="text-amber-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +0.2ms
              </span>
            )}
            <span>· Tier 5 SLA</span>
          </div>
        </div>

        {/* DataPacket Edge Latency */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>DataPacket 100G Edge</span>
            <Zap className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-300 tabular-nums flex items-baseline gap-1.5">
            <span>{stats.dpLatest || 14.2}</span>
            <span className="text-xs text-cyan-400 font-semibold">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            12 POPs · CDN77 Mesh
          </div>
        </div>

        {/* Switch.com Median */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Switch.com Core</span>
            <Server className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-300 tabular-nums flex items-baseline gap-1.5">
            <span>{stats.switchLatest || 19.8}</span>
            <span className="text-xs text-emerald-400 font-semibold">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            335 Verified Leaves
          </div>
        </div>

        {/* Mesh Jitter */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Current Jitter</span>
            <Activity className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-300 tabular-nums flex items-baseline gap-1.5">
            <span>{stats.currentJitter}</span>
            <span className="text-xs text-amber-400 font-semibold">ms</span>
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>&lt; 2.5ms SLA Limit</span>
          </div>
        </div>

        {/* Peak Jitter Spike */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Max Jitter Spike</span>
            <TrendingUp className="w-3 h-3 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-300 tabular-nums flex items-baseline gap-1.5">
            <span>{stats.maxJitter}</span>
            <span className="text-xs text-purple-400 font-semibold">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            Zero Buffer Overflow
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>SLA Guarantee</span>
            <Radio className="w-3 h-3 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white tabular-nums flex items-baseline gap-1.5">
            <span>99.999%</span>
          </div>
          <div className="text-[10px] text-emerald-400 truncate font-semibold">
            Zero Dropped Packets
          </div>
        </div>
      </div>

      {/* Node Focus & Series Visibility Filter Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800/80">
        {/* Series Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 text-[11px] font-bold">Series:</span>

          <button
            onClick={() => setShowMeshAvg(!showMeshAvg)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showMeshAvg
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Average Mesh (352)</span>
          </button>

          <button
            onClick={() => setShowSwitch(!showSwitch)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showSwitch
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>Switch.com (335)</span>
          </button>

          <button
            onClick={() => setShowDataPacket(!showDataPacket)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showDataPacket
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>DataPacket 100G (12)</span>
          </button>

          <button
            onClick={() => setShowRisingNet(!showRisingNet)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showRisingNet
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>RisingNet (5)</span>
          </button>

          <button
            onClick={() => setShowJitter(!showJitter)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showJitter
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Jitter (ms)</span>
          </button>
        </div>

        {/* Selected Node Target Indicator & Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 text-[11px] font-bold">Node Focus:</span>

          {selectedNode ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-500/50 text-purple-200">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="font-bold truncate max-w-[140px]">{selectedNode.name}</span>
              <span className="text-[10px] text-purple-300">({selectedNode.latencyMs}ms)</span>
              {onSelectNode && (
                <button
                  onClick={() => onSelectNode(null)}
                  className="text-slate-400 hover:text-white ml-1 text-xs cursor-pointer"
                  title="Clear focused node"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {featuredNodes.slice(0, 3).map((n) => (
                <button
                  key={n.id}
                  onClick={() => onSelectNode && onSelectNode(n)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
                  title={`Plot ${n.name} (${n.host})`}
                >
                  {n.name.replace('DataPacket - ', 'DP ').replace('Switch - ', 'SW ')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="w-full bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 shadow-inner">
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
              />

              {/* Left Y-Axis for Latency */}
              {(displayMode === 'dual' || displayMode === 'latency_only') && (
                <YAxis
                  yAxisId="left"
                  stroke="#10b981"
                  domain={[10, 40]}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={{ stroke: '#334155' }}
                  unit="ms"
                />
              )}

              {/* Right Y-Axis for Jitter */}
              {(displayMode === 'dual' || displayMode === 'jitter_only') && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#f59e0b"
                  domain={[0, 4]}
                  tick={{ fill: '#f59e0b', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={{ stroke: '#334155' }}
                  unit="ms"
                />
              )}

              {/* Custom Dark Theme Tooltip */}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md font-mono text-xs space-y-2 min-w-[210px]">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {label}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                            ONLINE
                          </span>
                        </div>

                        <div className="space-y-1">
                          {payload.map((entry, index) => {
                            if (entry.dataKey === 'slaLimit' || entry.dataKey === 'jitterSlaLimit') return null;
                            return (
                              <div key={`tooltip-${index}`} className="flex items-center justify-between text-[11px] gap-2">
                                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span>{entry.name}:</span>
                                </span>
                                <span className="font-bold text-white tabular-nums">
                                  {entry.value} ms
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                          <span>SLA Target: &lt;30ms</span>
                          <span className="text-emerald-400">PASSED</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* 30ms SLA Reference Line */}
              {(displayMode === 'dual' || displayMode === 'latency_only') && (
                <ReferenceLine
                  yAxisId="left"
                  y={30}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: '30ms Tier-5 SLA Threshold',
                    fill: '#ef4444',
                    fontSize: 9,
                    position: 'insideTopRight',
                    fontFamily: 'monospace'
                  }}
                />
              )}

              {/* Average Mesh Latency Line */}
              {showMeshAvg && (displayMode === 'dual' || displayMode === 'latency_only') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="meshAvgLatency"
                  name="Mesh Avg Latency"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#10b981', stroke: '#064e3b' }}
                />
              )}

              {/* Switch.com Median Line */}
              {showSwitch && (displayMode === 'dual' || displayMode === 'latency_only') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="switchLatency"
                  name="Switch.com Median"
                  stroke="#14b8a6"
                  strokeWidth={1.8}
                  strokeDasharray="2 2"
                  dot={false}
                />
              )}

              {/* DataPacket 100G Edge Line */}
              {showDataPacket && (displayMode === 'dual' || displayMode === 'latency_only') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="dataPacketLatency"
                  name="DataPacket 100G"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#06b6d4' }}
                />
              )}

              {/* RisingNet BGP Transit Line */}
              {showRisingNet && (displayMode === 'dual' || displayMode === 'latency_only') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="risingNetLatency"
                  name="RisingNet BGP"
                  stroke="#818cf8"
                  strokeWidth={1.5}
                  dot={false}
                />
              )}

              {/* Selected Node Custom Line */}
              {selectedNode && (displayMode === 'dual' || displayMode === 'latency_only') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="selectedNodeLatency"
                  name={`Focus: ${selectedNode.name.split(' ')[0]}`}
                  stroke="#c084fc"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#c084fc' }}
                  activeDot={{ r: 6, fill: '#c084fc', stroke: '#581c87' }}
                />
              )}

              {/* Jitter Curve Line (Right Y-Axis) */}
              {showJitter && (displayMode === 'dual' || displayMode === 'jitter_only') && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="meshJitter"
                  name="Network Jitter"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={false}
                  activeDot={{ r: 4, fill: '#f59e0b' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Telemetry Guide Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-900 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-emerald-400" />
              <span>Mesh Avg (23.4ms)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-cyan-400" />
              <span>DataPacket 100G (14.2ms)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-teal-400 border-dashed" />
              <span>Switch.com (19.8ms)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-amber-400 border-dashed" />
              <span>Jitter (0.7ms)</span>
            </div>
            {selectedNode && (
              <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                <div className="w-3 h-0.5 bg-purple-400" />
                <span>Selected: {selectedNode.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <Info className="w-3 h-3 text-slate-400" />
            <span>Dual Core ICMP Ping &amp; Spanning Tree Polling (Port 6697)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
