/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Constellation Fleet Stability & TLE Latency/Uptime Trends
 * Interactive Recharts line graph for the top 5 tracked constellations:
 * - SpaceX Starlink Gen2 & Direct-to-Cell V2 (LEO 550km, 6850 sats)
 * - Eutelsat OneWeb Polar Enterprise (LEO 1200km, 634 sats)
 * - SES O3b mPOWER MEO Gigabit (MEO 8062km, 8 sats)
 * - Iridium NEXT & Certus Safety (LEO 780km, 66 sats)
 * - AST SpaceMobile BlueBird Direct 5G (LEO 510km, 5 sats)
 * 
 * Features:
 * - Metric toggling: TLE Ingestion Latency, Uptime/Availability %, Stability Index, Orbit Drift
 * - Multi-resolution time windows: Live Stream (3s tick), 1h, 6h, 24h, 7d
 * - Individual constellation toggles & Solo isolation mode
 * - SLA target reference lines (15m latency threshold, 99.9% 3-nines availability)
 * - Orbital maneuver / thruster burn event markers
 * - Custom high-precision tooltip with epoch calculation
 * - CSV data export & summary report copy
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
  Satellite,
  Activity,
  Clock,
  ShieldCheck,
  Zap,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  Download,
  Copy,
  Check,
  Layers,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
  Info,
  Maximize2,
  Sliders,
  Radio,
  ChevronDown,
  ChevronUp,
  Globe
} from 'lucide-react';
import {
  FleetStabilityMetricType,
  StabilityTimeWindow,
  ConstellationStabilityPoint,
  TrackedConstellationMeta
} from '../types/satelliteFleetAlerts';
import {
  TOP_5_TRACKED_CONSTELLATIONS,
  METRIC_DEFINITIONS,
  generateStabilityData,
  generateNextLiveStabilityPoint
} from '../data/constellationStabilityData';

const CONSTELLATION_TRACKER_NAME_MAP: Record<string, string> = {
  starlink: 'Starlink',
  oneweb: 'OneWeb',
  o3b: 'O3b mPOWER',
  iridium: 'Iridium',
  astSpaceMobile: 'AST SpaceMobile'
};

interface ConstellationFleetStabilityChartProps {
  onOpenLicense?: () => void;
  onOpenConstellationOverlay?: (constellationName?: string) => void;
  defaultMetric?: FleetStabilityMetricType;
  defaultWindow?: StabilityTimeWindow;
}

export const ConstellationFleetStabilityChart: React.FC<ConstellationFleetStabilityChartProps> = ({
  onOpenLicense,
  onOpenConstellationOverlay,
  defaultMetric = 'tle_latency',
  defaultWindow = '24h'
}) => {
  // State: Selected Metric & Time Window
  const [selectedMetric, setSelectedMetric] = useState<FleetStabilityMetricType>(defaultMetric);
  const [selectedWindow, setSelectedWindow] = useState<StabilityTimeWindow>(defaultWindow);

  // State: Visible Constellations (all 5 enabled by default)
  const [visibleConstellations, setVisibleConstellations] = useState<Record<string, boolean>>({
    starlink: true,
    oneweb: true,
    o3b: true,
    iridium: true,
    astSpaceMobile: true,
    fleetAverage: true
  });

  // State: Timeseries Data Points
  const [dataPoints, setDataPoints] = useState<ConstellationStabilityPoint[]>(() =>
    generateStabilityData(defaultWindow, defaultMetric)
  );

  // State: Live Streaming
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [liveTickCounter, setLiveTickCounter] = useState<number>(0);

  // State: Visualization Settings
  const [chartCurveType, setChartCurveType] = useState<'monotone' | 'linear'>('monotone');
  const [showSlaReference, setShowSlaReference] = useState<boolean>(true);
  const [showEventMarkers, setShowEventMarkers] = useState<boolean>(true);
  const [showDataTable, setShowDataTable] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [hoveredConstellation, setHoveredConstellation] = useState<string | null>(null);

  // Metric Definition
  const metricDef = METRIC_DEFINITIONS[selectedMetric];

  // Reload data on window or metric switch (unless in live mode and already generated)
  useEffect(() => {
    setDataPoints(generateStabilityData(selectedWindow, selectedMetric));
  }, [selectedWindow, selectedMetric]);

  // Real-time live streaming interval (when window is 'live' or auto-stream active)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setDataPoints((prev) => {
        if (!prev || prev.length === 0) {
          return generateStabilityData(selectedWindow, selectedMetric);
        }
        const lastPoint = prev[prev.length - 1];
        const nextPoint = generateNextLiveStabilityPoint(lastPoint, selectedMetric);

        // Keep last 25 points in live window, or slide smoothly
        const maxPoints = selectedWindow === 'live' ? 24 : prev.length;
        const updated = [...prev.slice(prev.length >= maxPoints ? 1 : 0), nextPoint];
        return updated;
      });
      setLiveTickCounter((c) => c + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, selectedMetric, selectedWindow]);

  // Toggle individual constellation visibility
  const toggleConstellation = (id: string) => {
    setVisibleConstellations((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Solo mode: Show only the clicked constellation
  const handleSoloConstellation = (id: string) => {
    setVisibleConstellations({
      starlink: id === 'starlink',
      oneweb: id === 'oneweb',
      o3b: id === 'o3b',
      iridium: id === 'iridium',
      astSpaceMobile: id === 'astSpaceMobile',
      fleetAverage: false
    });
  };

  // Reset all constellations to visible
  const handleShowAll = () => {
    setVisibleConstellations({
      starlink: true,
      oneweb: true,
      o3b: true,
      iridium: true,
      astSpaceMobile: true,
      fleetAverage: true
    });
  };

  // Inject a simulated orbital thruster burn event to demonstrate live chart reaction
  const handleSimulateBurn = () => {
    setDataPoints((prev) => {
      if (!prev || prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const deltaStarlink = selectedMetric === 'tle_latency' ? 3.8 : selectedMetric === 'uptime_pct' ? -0.05 : -2.4;

      const newPoint: ConstellationStabilityPoint = {
        ...last,
        timestamp: new Date().toISOString(),
        timeLabel: 'Burn Event',
        epochId: '26046.5921',
        starlink: Number((last.starlink + deltaStarlink).toFixed(selectedMetric === 'uptime_pct' ? 3 : 2)),
        hasEvent: true,
        eventDescription: 'Starlink-3420 Hall-effect thruster burn for orbit insertion (+1.8 km)',
        eventConstellation: 'Starlink'
      };
      return [...prev.slice(1), newPoint];
    });
  };

  // Current latest values for each constellation
  const latestPoint = dataPoints[dataPoints.length - 1] || null;

  // Calculate Fleet Statistics
  const stats = useMemo(() => {
    if (!dataPoints || dataPoints.length === 0) {
      return {
        avgStarlink: 0,
        avgOneWeb: 0,
        avgO3b: 0,
        avgIridium: 0,
        avgAst: 0,
        fleetOverallAvg: 0,
        minFleetVal: 0,
        maxFleetVal: 0,
        slaCompliancePct: 100
      };
    }

    const starlinkVals = dataPoints.map((p) => p.starlink);
    const onewebVals = dataPoints.map((p) => p.oneweb);
    const o3bVals = dataPoints.map((p) => p.o3b);
    const iridiumVals = dataPoints.map((p) => p.iridium);
    const astVals = dataPoints.map((p) => p.astSpaceMobile);
    const avgVals = dataPoints.map((p) => p.fleetAverage);

    const calcAvg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    // SLA compliance calculation
    let compliantCount = 0;
    avgVals.forEach((val) => {
      if (metricDef.higherIsBetter ? val >= metricDef.slaTarget : val <= metricDef.slaTarget) {
        compliantCount++;
      }
    });

    return {
      avgStarlink: calcAvg(starlinkVals),
      avgOneWeb: calcAvg(onewebVals),
      avgO3b: calcAvg(o3bVals),
      avgIridium: calcAvg(iridiumVals),
      avgAst: calcAvg(astVals),
      fleetOverallAvg: calcAvg(avgVals),
      minFleetVal: Math.min(...avgVals),
      maxFleetVal: Math.max(...avgVals),
      slaCompliancePct: (compliantCount / avgVals.length) * 100
    };
  }, [dataPoints, metricDef]);

  // Copy Summary Report to Clipboard
  const handleCopySummary = () => {
    const text = `DRFUN1 MASTER CONTROL - CONSTELLATION FLEET STABILITY REPORT
Time Window: ${selectedWindow.toUpperCase()} | Metric: ${metricDef.label}
Fleet Overall Average: ${metricDef.formatter(stats.fleetOverallAvg)}
SLA Target: ${metricDef.formatter(metricDef.slaTarget)} (Compliance: ${stats.slaCompliancePct.toFixed(1)}%)

TOP 5 CONSTELLATIONS BREAKDOWN:
- SpaceX Starlink Gen2 (6,850 Sats): ${metricDef.formatter(latestPoint?.starlink || 0)} (Mean: ${metricDef.formatter(stats.avgStarlink)})
- Eutelsat OneWeb Polar (634 Sats): ${metricDef.formatter(latestPoint?.oneweb || 0)} (Mean: ${metricDef.formatter(stats.avgOneWeb)})
- SES O3b mPOWER MEO (8 Sats): ${metricDef.formatter(latestPoint?.o3b || 0)} (Mean: ${metricDef.formatter(stats.avgO3b)})
- Iridium NEXT Polar Safety (66 Sats): ${metricDef.formatter(latestPoint?.iridium || 0)} (Mean: ${metricDef.formatter(stats.avgIridium)})
- AST SpaceMobile Direct 5G (5 Sats): ${metricDef.formatter(latestPoint?.astSpaceMobile || 0)} (Mean: ${metricDef.formatter(stats.avgAst)})

Total Active Spacecraft Tracked: 7,563
Radar Epoch Ingestion: Space-Track / Switch SUPERNAP Nevada Teleport
Legal FRN: 0034981290 (Richard Alan Witt)`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Export CSV Data File
  const handleExportCsv = () => {
    const headers = ['Timestamp', 'TimeLabel', 'Epoch', 'Starlink', 'OneWeb', 'O3b_mPOWER', 'Iridium_NEXT', 'AST_SpaceMobile', 'Fleet_Average', 'Maneuver_Event'];
    const rows = dataPoints.map((p) => [
      p.timestamp,
      p.timeLabel,
      p.epochId,
      p.starlink,
      p.oneweb,
      p.o3b,
      p.iridium,
      p.astSpaceMobile,
      p.fleetAverage,
      p.hasEvent ? `"${p.eventDescription}"` : 'None'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `constellation_stability_${selectedMetric}_${selectedWindow}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom Rich Tooltip for Recharts
  const CustomStabilityTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data: ConstellationStabilityPoint = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl font-mono text-xs backdrop-blur-md min-w-[280px] space-y-2">
        {/* Header with Timestamp and Epoch */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{data.timeLabel}</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
            Epoch {data.epochId}
          </span>
        </div>

        {/* Maneuver Event Alert if present */}
        {data.hasEvent && (
          <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-[11px] text-purple-200 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="leading-tight">{data.eventDescription}</span>
          </div>
        )}

        {/* Constellation Breakdown */}
        <div className="space-y-1.5 text-[11px]">
          {TOP_5_TRACKED_CONSTELLATIONS.map((c) => {
            if (!visibleConstellations[c.id]) return null;
            const val = data[c.id as keyof ConstellationStabilityPoint] as number;
            return (
              <div key={c.id} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-300 font-medium">{c.shortName}:</span>
                </div>
                <span className="font-bold text-white tabular-nums">
                  {metricDef.formatter(val)}
                </span>
              </div>
            );
          })}

          {visibleConstellations.fleetAverage && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-800 font-bold">
              <span className="text-slate-400 flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-slate-200 inline-block" />
                <span>Fleet Mean:</span>
              </span>
              <span className="text-emerald-300 tabular-nums">
                {metricDef.formatter(data.fleetAverage)}
              </span>
            </div>
          )}
        </div>

        <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-800/80 flex items-center justify-between">
          <span>Target SLA: {metricDef.formatter(metricDef.slaTarget)}</span>
          <span className="text-cyan-400">Switch SUPERNAP Teleport</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-6 font-mono text-xs">
      {/* ========================================================
          1. HEADER & HIGH-LEVEL TELEMETRY STATUS
          ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-950/40 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Top 5 Tracked Constellations: Fleet Stability &amp; TLE Trends
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>NORAD TLE RECHARTS</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                7,563 Satellites
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical latency and uptime analytics visualizing orbital ephemeris precision, thruster burn recovery, and link availability across the top commercial constellations.
            </p>
          </div>
        </div>

        {/* Global Action Triggers */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Live Streaming Toggle */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isLiveStreaming
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
            title="Toggle real-time streaming updates"
          >
            {isLiveStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-400" />
                <span>Stream: ON (3s)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-400" />
                <span>Stream: PAUSED</span>
              </>
            )}
          </button>

          {/* Simulate Thruster Burn Injection */}
          <button
            onClick={handleSimulateBurn}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-950/40"
            title="Inject simulated station-keeping thruster burn"
          >
            <Flame className="w-3.5 h-3.5 text-purple-200 fill-purple-300" />
            <span>Simulate Burn</span>
          </button>

          {/* Copy Summary Report */}
          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Copy formatted stability summary to clipboard"
          >
            {copiedSummary ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Report</span>
              </>
            )}
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Export raw timeseries to CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. METRIC SWITCHER & TIME WINDOW TABS
          ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-cyan-400" />
            <span>METRIC:</span>
          </span>

          <button
            onClick={() => setSelectedMetric('tle_latency')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedMetric === 'tle_latency'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>TLE Radar Latency (min)</span>
          </button>

          <button
            onClick={() => setSelectedMetric('uptime_pct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedMetric === 'uptime_pct'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fleet Uptime &amp; Link Availability (%)</span>
          </button>

          <button
            onClick={() => setSelectedMetric('stability_score')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedMetric === 'stability_score'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Orbital Stability Index (0–100)</span>
          </button>

          <button
            onClick={() => setSelectedMetric('orbit_drift')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedMetric === 'orbit_drift'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Along-Track Drift (km)</span>
          </button>
        </div>

        {/* Time Window Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          {(['live', '1h', '6h', '24h', '7d'] as StabilityTimeWindow[]).map((win) => (
            <button
              key={win}
              onClick={() => setSelectedWindow(win)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition cursor-pointer ${
                selectedWindow === win
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {win === 'live' ? '• LIVE' : win}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================
          3. INTERACTIVE CONSTELLATION FILTER & SCORECARD STRIP
          ======================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Satellite className="w-4 h-4 text-cyan-400" />
              <span>Tracked Top 5 Fleet Constellations:</span>
            </span>
            <span className="text-[11px] text-slate-500">
              (Click to toggle line visibility · Hover for quick focus · "Solo" to isolate)
            </span>
          </div>

          <button
            onClick={handleShowAll}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer font-bold"
          >
            Select All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {TOP_5_TRACKED_CONSTELLATIONS.map((constellation) => {
            const isVisible = visibleConstellations[constellation.id];
            const currentVal = latestPoint ? (latestPoint[constellation.id as keyof ConstellationStabilityPoint] as number) : 0;
            const avgVal =
              constellation.id === 'starlink'
                ? stats.avgStarlink
                : constellation.id === 'oneweb'
                ? stats.avgOneWeb
                : constellation.id === 'o3b'
                ? stats.avgO3b
                : constellation.id === 'iridium'
                ? stats.avgIridium
                : stats.avgAst;

            return (
              <div
                key={constellation.id}
                onMouseEnter={() => setHoveredConstellation(constellation.id)}
                onMouseLeave={() => setHoveredConstellation(null)}
                className={`p-3 rounded-xl border transition cursor-pointer relative group ${
                  isVisible
                    ? 'bg-slate-950 border-slate-700/80 shadow-md'
                    : 'bg-slate-950/40 border-slate-900 opacity-60 hover:opacity-90'
                }`}
                onClick={() => toggleConstellation(constellation.id)}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: constellation.color }}
                    />
                    <span className="font-bold text-white text-xs truncate">
                      {constellation.shortName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {onOpenConstellationOverlay && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const trackerId = CONSTELLATION_TRACKER_NAME_MAP[constellation.id] || constellation.shortName;
                          onOpenConstellationOverlay(trackerId);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition px-1.5 py-0.5 rounded bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 text-[9px] font-bold flex items-center gap-1 border border-cyan-500/40"
                        title={`View live geographic coverage for ${constellation.shortName}`}
                      >
                        <Globe className="w-2.5 h-2.5 text-cyan-400" />
                        <span>Coverage</span>
                      </button>
                    )}

                    {/* Solo button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSoloConstellation(constellation.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[9px] font-bold"
                      title={`Isolate ${constellation.shortName} on chart`}
                    >
                      Solo
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-[10px] text-slate-500">
                    {constellation.activeSatellites.toLocaleString()} sats
                  </span>
                  <span
                    className="text-xs font-bold font-mono tabular-nums"
                    style={{ color: isVisible ? constellation.color : '#94a3b8' }}
                  >
                    {metricDef.formatter(currentVal)}
                  </span>
                </div>

                <div className="mt-1 pt-1 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Mean: {metricDef.formatter(avgVal)}</span>
                  <span className="text-[9px] font-bold text-slate-400">
                    {constellation.orbitType.split(' ')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          4. PRIMARY RECHARTS LINE GRAPH
          ======================================================== */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">
              {metricDef.label} Trend ({selectedWindow.toUpperCase()})
            </span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
              {dataPoints.length} Epoch Points
            </span>
          </div>

          {/* Chart View Configs */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            {/* SLA Reference Line Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showSlaReference}
                onChange={(e) => setShowSlaReference(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span>SLA Target Line ({metricDef.formatter(metricDef.slaTarget)})</span>
            </label>

            {/* Smooth vs Linear Curve */}
            <button
              onClick={() => setChartCurveType(chartCurveType === 'monotone' ? 'linear' : 'monotone')}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[10px] cursor-pointer"
            >
              Curve: {chartCurveType === 'monotone' ? 'Smooth' : 'Sharp'}
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dataPoints}
              margin={{ top: 15, right: 25, left: 10, bottom: 10 }}
            >
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" opacity={0.35} />
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#475569' }}
              />
              <YAxis
                stroke="#64748b"
                domain={[metricDef.minY, metricDef.maxY]}
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#475569' }}
                tickFormatter={(val) => metricDef.formatter(val)}
              />
              <Tooltip content={<CustomStabilityTooltip />} />

              {/* Benchmark SLA Target Line */}
              {showSlaReference && (
                <ReferenceLine
                  y={metricDef.slaTarget}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: metricDef.slaLabel,
                    fill: '#f87171',
                    fontSize: 10,
                    position: 'insideTopRight'
                  }}
                />
              )}

              {/* 1. SpaceX Starlink Gen2 */}
              {visibleConstellations.starlink && (
                <Line
                  type={chartCurveType}
                  dataKey="starlink"
                  name="SpaceX Starlink"
                  stroke="#38bdf8"
                  strokeWidth={hoveredConstellation === 'starlink' ? 3.5 : 2.2}
                  dot={showEventMarkers ? { r: 2.5, fill: '#38bdf8' } : false}
                  activeDot={{ r: 6, fill: '#38bdf8', stroke: '#0369a1', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              )}

              {/* 2. Eutelsat OneWeb Polar */}
              {visibleConstellations.oneweb && (
                <Line
                  type={chartCurveType}
                  dataKey="oneweb"
                  name="Eutelsat OneWeb"
                  stroke="#a855f7"
                  strokeWidth={hoveredConstellation === 'oneweb' ? 3.5 : 2.2}
                  dot={showEventMarkers ? { r: 2.5, fill: '#a855f7' } : false}
                  activeDot={{ r: 6, fill: '#a855f7', stroke: '#6b21a8', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              )}

              {/* 3. SES O3b mPOWER */}
              {visibleConstellations.o3b && (
                <Line
                  type={chartCurveType}
                  dataKey="o3b"
                  name="SES O3b mPOWER"
                  stroke="#ec4899"
                  strokeWidth={hoveredConstellation === 'o3b' ? 3.5 : 2.2}
                  dot={showEventMarkers ? { r: 2.5, fill: '#ec4899' } : false}
                  activeDot={{ r: 6, fill: '#ec4899', stroke: '#9d174d', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              )}

              {/* 4. Iridium NEXT */}
              {visibleConstellations.iridium && (
                <Line
                  type={chartCurveType}
                  dataKey="iridium"
                  name="Iridium NEXT"
                  stroke="#10b981"
                  strokeWidth={hoveredConstellation === 'iridium' ? 3.5 : 2.2}
                  dot={showEventMarkers ? { r: 2.5, fill: '#10b981' } : false}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#065f46', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              )}

              {/* 5. AST SpaceMobile */}
              {visibleConstellations.astSpaceMobile && (
                <Line
                  type={chartCurveType}
                  dataKey="astSpaceMobile"
                  name="AST SpaceMobile"
                  stroke="#f59e0b"
                  strokeWidth={hoveredConstellation === 'astSpaceMobile' ? 3.5 : 2.2}
                  dot={showEventMarkers ? { r: 2.5, fill: '#f59e0b' } : false}
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#92400e', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              )}

              {/* Fleet Overall Average (Dashed Line) */}
              {visibleConstellations.fleetAverage && (
                <Line
                  type={chartCurveType}
                  dataKey="fleetAverage"
                  name="Top 5 Fleet Mean"
                  stroke="#e2e8f0"
                  strokeDasharray="5 5"
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={{ r: 5, fill: '#ffffff', stroke: '#64748b' }}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend Strip */}
        <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            {TOP_5_TRACKED_CONSTELLATIONS.map((c) => (
              <span
                key={c.id}
                className="flex items-center gap-1.5 cursor-pointer hover:text-white"
                onClick={() => toggleConstellation(c.id)}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className={visibleConstellations[c.id] ? 'text-slate-200' : 'text-slate-600 line-through'}>
                  {c.shortName}
                </span>
              </span>
            ))}
            <span
              className="flex items-center gap-1.5 cursor-pointer hover:text-white"
              onClick={() => toggleConstellation('fleetAverage')}
            >
              <span className="w-3 h-0.5 bg-slate-300" />
              <span className={visibleConstellations.fleetAverage ? 'text-slate-300' : 'text-slate-600 line-through'}>
                Top 5 Fleet Mean
              </span>
            </span>
          </div>

          <span className="text-[10px] text-slate-500 font-mono">
            Radar Ephemeris: Space-Track.org / Switch 100G Teleport
          </span>
        </div>
      </div>

      {/* ========================================================
          5. FLEET STABILITY KPI SUMMARY SCORECARD
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Fleet Macro Average</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white tabular-nums">
            {metricDef.formatter(stats.fleetOverallAvg)}
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span>SLA Compliance: {stats.slaCompliancePct.toFixed(1)}%</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Top Stability Performer</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-300">
            Iridium NEXT
          </div>
          <div className="text-[10px] text-slate-400">
            99.995% Uptime · 5.9m TLE Sync
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Fastest Radar Ingest</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-cyan-300">
            SpaceX Starlink
          </div>
          <div className="text-[10px] text-slate-400">
            4.2m Radar Ingest · 6,850 Sats
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Ground Segment Ingest</span>
            <Radio className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-purple-300">
            Switch SUPERNAP NV
          </div>
          <div className="text-[10px] text-slate-400">
            100G Fiber Ring Teleport Gate
          </div>
        </div>
      </div>

      {/* ========================================================
          6. COLLAPSIBLE RAW TELEMETRY EPOCH AUDIT TABLE
          ======================================================== */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
        <button
          onClick={() => setShowDataTable(!showDataTable)}
          className="w-full p-3 flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 text-xs font-bold text-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Auditable Telemetry Epoch History ({dataPoints.length} Samples)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
              Space-Track Vector Records
            </span>
          </div>
          <div className="flex items-center gap-1 text-cyan-400 text-[11px]">
            <span>{showDataTable ? 'Collapse Table' : 'Expand Table'}</span>
            {showDataTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showDataTable && (
          <div className="overflow-x-auto max-h-72 border-t border-slate-800">
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Time Label</th>
                  <th className="p-2.5">Space-Track Epoch</th>
                  <th className="p-2.5 text-sky-400">Starlink ({metricDef.unit})</th>
                  <th className="p-2.5 text-purple-400">OneWeb ({metricDef.unit})</th>
                  <th className="p-2.5 text-pink-400">O3b mPOWER ({metricDef.unit})</th>
                  <th className="p-2.5 text-emerald-400">Iridium ({metricDef.unit})</th>
                  <th className="p-2.5 text-amber-400">AST 5G ({metricDef.unit})</th>
                  <th className="p-2.5 text-white">Fleet Mean</th>
                  <th className="p-2.5">Maneuver Event</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {dataPoints.slice().reverse().map((point, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-2.5 text-slate-400">{point.timeLabel}</td>
                    <td className="p-2.5 font-bold text-cyan-300">{point.epochId}</td>
                    <td className="p-2.5 text-sky-300">{point.starlink}</td>
                    <td className="p-2.5 text-purple-300">{point.oneweb}</td>
                    <td className="p-2.5 text-pink-300">{point.o3b}</td>
                    <td className="p-2.5 text-emerald-300">{point.iridium}</td>
                    <td className="p-2.5 text-amber-300">{point.astSpaceMobile}</td>
                    <td className="p-2.5 font-bold text-white">{point.fleetAverage}</td>
                    <td className="p-2.5">
                      {point.hasEvent ? (
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                          {point.eventDescription}
                        </span>
                      ) : (
                        <span className="text-slate-600">Nominal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          7. FOOTER: LEGAL & FCC COMPLIANCE IDENTIFICATION
          ======================================================== */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500">
        <div>
          <span>Space Ground Station Downlink Ingest: </span>
          <strong className="text-slate-300">Switch SUPERNAP Las Vegas Teleport</strong>
          <span> · FCC FRN: </span>
          <strong className="text-emerald-400">0034981290</strong>
          <span> (Richard Alan Witt)</span>
        </div>

        <div className="flex items-center gap-3">
          {onOpenConstellationOverlay && (
            <button
              onClick={() => onOpenConstellationOverlay('Starlink')}
              className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer flex items-center gap-1 font-medium"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>View Live Orbit Coverage Layer</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}

          {onOpenLicense && (
            <button
              onClick={onOpenLicense}
              className="text-slate-400 hover:text-slate-200 hover:underline cursor-pointer"
            >
              License &amp; Escrow
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
