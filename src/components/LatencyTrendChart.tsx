/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Production D3 Line Chart for Satellite Latency Trends Over Time
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { SatelliteCompany, OrbitType } from '../types/satellite';
import { 
  TimeHorizon, 
  generateOperatorLatencySeries, 
  OperatorLatencySeries,
  OPERATOR_CHART_COLORS,
  LatencyDataPoint
} from '../utils/latencyDataGenerator';
import { 
  Activity, 
  Clock, 
  Sliders, 
  Sparkles, 
  Zap, 
  Info, 
  Maximize2, 
  Plus, 
  Trash2, 
  Check, 
  ArrowUpRight,
  TrendingUp,
  Radio,
  Layers,
  Globe,
  Calculator
} from 'lucide-react';

interface LatencyTrendChartProps {
  companies: SatelliteCompany[];
  allCompanies?: SatelliteCompany[];
  onRemoveCompany?: (id: string) => void;
  onAddCompany?: (id: string) => void;
  onOpenRfq?: (company: SatelliteCompany) => void;
  onOpenSlaCalculator?: (company?: SatelliteCompany) => void;
}

export const LatencyTrendChart: React.FC<LatencyTrendChartProps> = ({
  companies,
  allCompanies = [],
  onRemoveCompany,
  onAddCompany,
  onOpenRfq,
  onOpenSlaCalculator,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Configuration state
  const [horizon, setHorizon] = useState<TimeHorizon>('1h');
  const [isSmooth, setIsSmooth] = useState(true);
  const [showThresholds, setShowThresholds] = useState(true);
  const [useLogScale, setUseLogScale] = useState(false);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [hiddenSeriesIds, setHiddenSeriesIds] = useState<Set<string>>(new Set());
  const [hoveredData, setHoveredData] = useState<{
    timestamp: Date;
    cursorX: number;
    points: {
      series: OperatorLatencySeries;
      point: LatencyDataPoint;
      yPos: number;
    }[];
  } | null>(null);

  // Time reference anchor for live stream simulation
  const [timeAnchor, setTimeAnchor] = useState<Date>(() => new Date());

  // Periodically advance timeAnchor when live streaming is enabled
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      setTimeAnchor(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Generate series data for all compared companies
  const seriesList = useMemo<OperatorLatencySeries[]>(() => {
    return companies.map((company, index) =>
      generateOperatorLatencySeries(company, horizon, index, timeAnchor)
    );
  }, [companies, horizon, timeAnchor]);

  // Active series (excluding hidden ones)
  const visibleSeries = useMemo(() => {
    return seriesList.filter((s) => !hiddenSeriesIds.has(s.companyId));
  }, [seriesList, hiddenSeriesIds]);

  // Toggle company visibility
  const toggleSeriesVisibility = (id: string) => {
    setHiddenSeriesIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        // Prevent hiding all series
        if (next.size < seriesList.length - 1) {
          next.add(id);
        }
      }
      return next;
    });
  };

  // D3 Chart Rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 800;
    const height = 380;
    const margin = { top: 28, right: 32, bottom: 44, left: 64 };
    const width = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (width <= 0 || innerHeight <= 0) return;

    // Set SVG attributes
    svg
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Definitions (Gradients and Clip path)
    const defs = svg.append('defs');

    // Clip path for line chart area
    defs
      .append('clipPath')
      .attr('id', 'chart-clip')
      .append('rect')
      .attr('width', width)
      .attr('height', innerHeight);

    // Create subtle area gradients for visible series
    visibleSeries.forEach((s) => {
      const grad = defs
        .append('linearGradient')
        .attr('id', `area-grad-${s.companyId}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      grad
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', s.color)
        .attr('stop-opacity', 0.22);

      grad
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', s.color)
        .attr('stop-opacity', 0.0);
    });

    if (visibleSeries.length === 0 || visibleSeries[0].points.length === 0) {
      g.append('text')
        .attr('x', width / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '13px')
        .attr('font-family', 'monospace')
        .text('No active operators selected. Choose operators below.');
      return;
    }

    // Determine X Domain (Min & Max Timestamps)
    const allTimestamps: Date[] = [];
    visibleSeries.forEach((s) => {
      s.points.forEach((p) => allTimestamps.push(p.timestamp));
    });

    const xExtent = d3.extent(allTimestamps) as [Date, Date];
    const xScale = d3.scaleTime().domain(xExtent).range([0, width]);

    // Determine Y Domain
    const allLatencies: number[] = [];
    visibleSeries.forEach((s) => {
      s.points.forEach((p) => allLatencies.push(p.latencyMs));
    });

    let maxLatency = d3.max(allLatencies) || 100;
    if (showThresholds && maxLatency < 560 && visibleSeries.some((s) => s.orbitType === 'GEO')) {
      maxLatency = 650;
    }

    const yScale = useLogScale
      ? d3.scaleLog().domain([5, Math.max(800, maxLatency * 1.2)]).range([innerHeight, 0]).nice()
      : d3.scaleLinear().domain([0, maxLatency * 1.15]).range([innerHeight, 0]).nice();

    const getY = (val: number): number => yScale(val) ?? 0;

    // Horizontal Grid Lines
    const yAxisGrid = d3
      .axisLeft(yScale)
      .tickSize(-width)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'y-grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3 3')
      .attr('stroke-opacity', 0.7);

    g.select('.y-grid .domain').remove();

    // SLA Threshold Reference Lines
    if (showThresholds) {
      const thresholds = [
        { value: 50, label: '50 ms (Voice/Interactive SLA)', color: '#10b981' },
        { value: 100, label: '100 ms (Terrestrial Parity SLA)', color: '#f59e0b' },
        { value: 540, label: '540 ms (GEO Speed of Light Minimum)', color: '#a855f7' },
      ];

      thresholds.forEach((th) => {
        const yPos = getY(th.value);
        if (yPos >= 0 && yPos <= innerHeight) {
          g.append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', yPos)
            .attr('y2', yPos)
            .attr('stroke', th.color)
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '5 4')
            .attr('stroke-opacity', 0.65);

          g.append('text')
            .attr('x', width - 8)
            .attr('y', yPos - 4)
            .attr('text-anchor', 'end')
            .attr('fill', th.color)
            .attr('font-size', '10px')
            .attr('font-family', 'monospace')
            .attr('font-weight', 'bold')
            .text(th.label);
        }
      });
    }

    // Line and Area Generators
    const curveType = isSmooth ? d3.curveMonotoneX : d3.curveLinear;

    const lineGenerator = d3
      .line<LatencyDataPoint>()
      .x((d) => xScale(d.timestamp))
      .y((d) => getY(d.latencyMs))
      .curve(curveType);

    const areaGenerator = d3
      .area<LatencyDataPoint>()
      .x((d) => xScale(d.timestamp))
      .y0(innerHeight)
      .y1((d) => getY(d.latencyMs))
      .curve(curveType);

    const chartGroup = g.append('g').attr('clip-path', 'url(#chart-clip)');

    // Render Area Fills
    visibleSeries.forEach((s) => {
      chartGroup
        .append('path')
        .datum(s.points)
        .attr('fill', `url(#area-grad-${s.companyId})`)
        .attr('d', areaGenerator);
    });

    // Render Lines
    visibleSeries.forEach((s) => {
      chartGroup
        .append('path')
        .datum(s.points)
        .attr('fill', 'none')
        .attr('stroke', s.color)
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', lineGenerator);
    });

    // Bottom Time Axis
    let timeTickFormat = '%H:%M';
    if (horizon === '7d') timeTickFormat = '%a %d';
    if (horizon === '30d') timeTickFormat = '%b %d';

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.max(4, Math.floor(width / 95)))
      .tickFormat(d3.timeFormat(timeTickFormat) as (d: Date | d3.NumberValue) => string);

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('dy', '1em');

    xAxisGroup.selectAll('line').attr('stroke', '#334155');
    xAxisGroup.select('.domain').attr('stroke', '#334155');

    // Left Y Axis (Latency in ms)
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(Math.max(4, Math.floor(innerHeight / 45)))
      .tickFormat((d) => `${d} ms`);

    const yAxisGroup = g.append('g').call(yAxis);

    yAxisGroup.selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('dx', '-0.5em');

    yAxisGroup.selectAll('line').attr('stroke', '#334155');
    yAxisGroup.select('.domain').attr('stroke', '#334155');

    // Left Axis Title Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -48)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', '600')
      .text('Round-Trip Time Latency (ms)');

    // Bottom Axis Title Label
    g.append('text')
      .attr('x', width / 2)
      .attr('y', innerHeight + 36)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .text(
        horizon === '1h'
          ? 'Live 60-Minute Handover Window (UTC)'
          : horizon === '24h'
          ? '24-Hour Diurnal Telemetry Cycle (UTC)'
          : horizon === '7d'
          ? '7-Day SLA Median & Spikes'
          : '30-Day Historical Compliance Window'
      );

    // Interactive Scrubber Cursor Line
    const cursorLine = g
      .append('line')
      .attr('class', 'scrubber-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 4')
      .attr('opacity', 0)
      .attr('pointer-events', 'none');

    // Scrubber Glow Highlight Circles
    const highlightCircles = visibleSeries.map((s) => {
      const circleGroup = g.append('g').attr('opacity', 0).attr('pointer-events', 'none');

      // Outer glow ring
      circleGroup
        .append('circle')
        .attr('r', 7)
        .attr('fill', s.color)
        .attr('fill-opacity', 0.25);

      // Inner solid point
      circleGroup
        .append('circle')
        .attr('r', 4)
        .attr('fill', s.color)
        .attr('stroke', '#020617')
        .attr('stroke-width', 1.5);

      return { series: s, group: circleGroup };
    });

    // Bisector for timeline searching
    const bisectDate = d3.bisector<LatencyDataPoint, Date>((d) => d.timestamp).left;

    // Invisible Overlay for Pointer Events
    const overlay = g
      .append('rect')
      .attr('width', width)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    overlay
      .on('pointermove', function (event: PointerEvent) {
        const [pointerX] = d3.pointer(event, this);
        const xDate = xScale.invert(pointerX);

        // Find nearest data points across all visible series
        const matchedPoints: {
          series: OperatorLatencySeries;
          point: LatencyDataPoint;
          yPos: number;
        }[] = [];

        visibleSeries.forEach((s, idx) => {
          const index = bisectDate(s.points, xDate, 1);
          const d0 = s.points[index - 1];
          const d1 = s.points[index];
          let nearest = d0;
          if (d1 && xDate.getTime() - d0.timestamp.getTime() > d1.timestamp.getTime() - xDate.getTime()) {
            nearest = d1;
          }

          if (nearest) {
            const yPos = getY(nearest.latencyMs);
            matchedPoints.push({
              series: s,
              point: nearest,
              yPos,
            });

            // Update circle position
            highlightCircles[idx].group
              .attr('transform', `translate(${xScale(nearest.timestamp)},${yPos})`)
              .attr('opacity', 1);
          }
        });

        cursorLine
          .attr('x1', pointerX)
          .attr('x2', pointerX)
          .attr('opacity', 1);

        if (matchedPoints.length > 0) {
          setHoveredData({
            timestamp: matchedPoints[0].point.timestamp,
            cursorX: pointerX + margin.left,
            points: matchedPoints,
          });
        }
      })
      .on('pointerleave', function () {
        cursorLine.attr('opacity', 0);
        highlightCircles.forEach((h) => h.group.attr('opacity', 0));
        setHoveredData(null);
      });
  }, [visibleSeries, isSmooth, showThresholds, useLogScale, horizon, timeAnchor]);

  // Benchmark presets to quickly add operators
  const loadBenchmarkSet = (preset: 'all_regimes' | 'leo_battle' | 'geo_broadcast') => {
    if (!allCompanies || allCompanies.length === 0) return;

    let targetIds: string[] = [];

    if (preset === 'all_regimes') {
      // Find Starlink (LEO), SES (MEO/Hybrid), Viasat or Intelsat (GEO)
      const starlink = allCompanies.find((c) => c.name.toLowerCase().includes('starlink'));
      const ses = allCompanies.find((c) => c.name.toLowerCase().includes('ses') || c.name.toLowerCase().includes('o3b'));
      const viasat = allCompanies.find((c) => c.name.toLowerCase().includes('viasat') || c.name.toLowerCase().includes('intelsat'));
      const oneweb = allCompanies.find((c) => c.name.toLowerCase().includes('oneweb'));
      targetIds = [starlink?.id, ses?.id, viasat?.id, oneweb?.id].filter(Boolean) as string[];
    } else if (preset === 'leo_battle') {
      // Starlink, OneWeb, Amazon Kuiper, Telesat
      const leos = allCompanies.filter((c) => c.orbitType === 'LEO').slice(0, 4);
      targetIds = leos.map((c) => c.id);
    } else if (preset === 'geo_broadcast') {
      // Intelsat, Viasat, EchoStar, SES
      const geos = allCompanies.filter((c) => c.orbitType === 'GEO').slice(0, 4);
      targetIds = geos.map((c) => c.id);
    }

    if (onAddCompany) {
      targetIds.forEach((id) => onAddCompany(id));
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
      
      {/* ========================================================
          CHART HEADER & CONTROLS TOOLBAR
          ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <TrendingUp className="w-5 h-5 text-sky-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>D3 Latency &amp; Handover Trend Visualizer</span>
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  d3.js v7
                </span>
                {isLiveStreaming && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE PING STREAM (3s)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time round-trip latency, constellation handover ripples, and ground teleport SLA comparison.
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          
          {/* Time Horizon Selector */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
            {[
              { id: '1h', label: '1h (Live)' },
              { id: '24h', label: '24h' },
              { id: '7d', label: '7d SLA' },
              { id: '30d', label: '30d' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setHorizon(t.id as TimeHorizon)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-bold ${
                  horizon === t.id
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Live Ping Stream Toggle */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-bold ${
              isLiveStreaming
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-950/40'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle simulated real-time telemetry ping stream"
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{isLiveStreaming ? 'Streaming' : 'Stream Live'}</span>
          </button>

          {/* Smooth Spline vs Linear Toggle */}
          <button
            onClick={() => setIsSmooth(!isSmooth)}
            className={`px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
              isSmooth
                ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
            title="Toggle between smooth cubic spline and sharp linear interpolation"
          >
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">{isSmooth ? 'Spline' : 'Linear'}</span>
          </button>

          {/* SLA Thresholds Toggle */}
          <button
            onClick={() => setShowThresholds(!showThresholds)}
            className={`px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
              showThresholds
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
            title="Toggle SLA Thresholds (50ms Voice, 100ms Terrestrial, 540ms GEO)"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">SLAs</span>
          </button>

          {/* Logarithmic vs Linear Scale */}
          <button
            onClick={() => setUseLogScale(!useLogScale)}
            className={`px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
              useLogScale
                ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
            title="Toggle logarithmic Y-scale (ideal for comparing LEO ~25ms with GEO ~600ms)"
          >
            <span className="text-[10px] font-bold">LOG</span>
          </button>

          {/* SLA Uptime Credit Calculator */}
          {onOpenSlaCalculator && (
            <button
              onClick={() => onOpenSlaCalculator()}
              className="px-2.5 py-1.5 rounded-xl border bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 font-bold shadow-sm shadow-emerald-950/30"
              title="Estimate monthly uptime outage credits and carrier rebates"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>SLA Calculator</span>
            </button>
          )}

        </div>
      </div>

      {/* ========================================================
          BENCHMARK PRESETS (If few or zero companies selected)
          ======================================================== */}
      {companies.length < 2 && (
        <div className="p-3.5 bg-slate-950/70 border border-sky-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-slate-300">
              Select 2 or more satellite operators to compare latency curves, or load a curated benchmark preset:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <button
              onClick={() => loadBenchmarkSet('all_regimes')}
              className="px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 rounded-lg transition cursor-pointer font-bold"
            >
              Orbit Regimes (LEO vs MEO vs GEO)
            </button>
            <button
              onClick={() => loadBenchmarkSet('leo_battle')}
              className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 rounded-lg transition cursor-pointer font-bold"
            >
              LEO Broadband Face-Off
            </button>
            <button
              onClick={() => loadBenchmarkSet('geo_broadcast')}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg transition cursor-pointer font-bold"
            >
              GEO Broadcast Fleets
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MAIN D3 CHART CONTAINER & INTERACTIVE TOOLTIP HUD
          ======================================================== */}
      <div className="relative" ref={containerRef}>
        
        {/* SVG Container */}
        <div className="w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 shadow-inner">
          <svg ref={svgRef} className="w-full block overflow-visible select-none" />
        </div>

        {/* Floating Scrubber HUD Tooltip */}
        {hoveredData && hoveredData.points.length > 0 && (
          <div
            className="absolute top-4 pointer-events-none z-20 bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs font-mono space-y-2 min-w-[240px] max-w-[320px] backdrop-blur-md"
            style={{
              left: Math.min(
                Math.max(16, hoveredData.cursorX - 120),
                (containerRef.current?.clientWidth || 600) - 270
              ),
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-bold text-white">
                <Clock className="w-3 h-3 text-sky-400" />
                <span>
                  {d3.timeFormat('%Y-%m-%d %H:%M:%S UTC')(hoveredData.timestamp)}
                </span>
              </span>
              <span className="text-[10px] text-slate-500">Live Scrubber</span>
            </div>

            <div className="space-y-1.5">
              {hoveredData.points.map(({ series, point }) => (
                <div key={series.companyId} className="flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: series.color }}
                    />
                    <span className="font-bold text-slate-200 truncate">{series.companyName}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {series.orbitType}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-black text-white" style={{ color: series.color }}>
                      {point.latencyMs} ms
                    </div>
                    <div className="text-[10px] text-slate-500">
                      &plusmn;{point.jitterMs}ms &bull; {point.packetLossPercent}% loss
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800/80 pt-1.5 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Active Gateway:</span>
              <span className="text-slate-300 font-semibold truncate max-w-[170px]">
                {hoveredData.points[0]?.point.gateway}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================
          OPERATOR SUMMARY CARDS & SLA BENCHMARK MATRIX
          ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3 font-mono text-xs text-slate-400">
          <span className="font-bold uppercase tracking-wider text-slate-300">
            SLA Performance Metrics for Selected Operators ({seriesList.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Click swatch to toggle visibility &bull; Metrics calculated over selected {horizon} window
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {seriesList.map((series) => {
            const isHidden = hiddenSeriesIds.has(series.companyId);
            const comp = companies.find((c) => c.id === series.companyId);

            return (
              <div
                key={series.companyId}
                className={`p-3.5 rounded-xl border transition-all ${
                  isHidden
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-50'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => toggleSeriesVisibility(series.companyId)}
                    className="flex items-center gap-2 text-left cursor-pointer group"
                    title={isHidden ? 'Click to show on chart' : 'Click to hide from chart'}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 transition-transform group-hover:scale-125"
                      style={{
                        backgroundColor: isHidden ? '#475569' : series.color,
                        boxShadow: isHidden ? 'none' : `0 0 8px ${series.color}80`,
                      }}
                    />
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-sky-300 transition text-xs truncate max-w-[150px]">
                        {series.companyName}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {series.orbitType} &bull; Base ~{series.baseLatencyMs}ms
                      </span>
                    </div>
                  </button>

                  {onRemoveCompany && (
                    <button
                      onClick={() => onRemoveCompany(series.companyId)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Key Numbers Grid */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 font-mono text-center">
                  <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/50">
                    <span className="text-[9px] text-slate-500 block uppercase">P50 Median</span>
                    <span className="text-xs font-bold text-white" style={{ color: series.color }}>
                      {series.p50Ms} ms
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/50">
                    <span className="text-[9px] text-slate-500 block uppercase">P95 Spike</span>
                    <span className="text-xs font-bold text-slate-200">
                      {series.p95Ms} ms
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/50">
                    <span className="text-[9px] text-slate-500 block uppercase">Min / Max</span>
                    <span className="text-[10px] font-bold text-slate-400 block truncate">
                      {series.minMs}/{series.maxMs}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                {comp && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/50 flex items-center justify-between text-xs">
                    {onOpenSlaCalculator ? (
                      <button
                        onClick={() => onOpenSlaCalculator(comp)}
                        className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                        title="Calculate monthly uptime outage credits for this operator"
                      >
                        <Calculator className="w-3 h-3" />
                        <span>SLA Credits</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>SLA Active</span>
                      </span>
                    )}

                    {onOpenRfq && (
                      <button
                        onClick={() => onOpenRfq(comp)}
                        className="text-[11px] font-mono text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                      >
                        <span>Inquire RFQ</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
