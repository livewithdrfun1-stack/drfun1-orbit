/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * D3 Real-Time Latency Ping Trends Component
 * Visualizes live RTT ping telemetry between the 500 Switch/hub nodes (500 Hub 1 / 500 Hub 2)
 * and the 10 RisingNet dedicated optical servers synced across all hubs.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Activity, Pause, Play, RefreshCw } from 'lucide-react';
import {
  ALL_1000_SWITCH_NODES,
  HUB1_500_SWITCH_NODES,
  HUB2_500_SWITCH_NODES,
  RISINGNET_10_DEDICATED_SERVERS,
} from '../data/unrealSearchData';
import { SwitchDedicatedNode } from '../types/irc';

type SwitchScope = 'hub1_500' | 'hub2_500' | 'all_1000';

interface LatencySample {
  timestamp: Date;
  switchAvgMs: number;
  switchP95Ms: number;
  risingNetAvgMs: number;
  selectedServerMs: number | null;
  deltaMs: number;
}

interface SwitchRisingNetD3ChartProps {
  externalJitterMs?: number;
}

function computeSwitchStats(nodes: SwitchDedicatedNode[], jitter: number) {
  const sorted = nodes
    .map((n) => Math.max(0.5, n.latencyMs + jitter))
    .sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const avg = sorted.length ? sum / sorted.length : 0;
  const p95Idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
  const p95 = sorted.length ? sorted[p95Idx] : 0;
  return {
    avg: Number(avg.toFixed(2)),
    p95: Number(p95.toFixed(2)),
  };
}

function computeRisingNetStats(jitter: number) {
  const lats = RISINGNET_10_DEDICATED_SERVERS.map((s) => Math.max(0.5, s.latencyMs + jitter));
  const avg = lats.reduce((a, b) => a + b, 0) / Math.max(1, lats.length);
  return Number(avg.toFixed(2));
}

function buildInitialHistory(
  switchBaseAvg: number,
  switchBaseP95: number,
  rnBaseAvg: number,
  selectedServerBase: number | null,
  pointCount = 30
): LatencySample[] {
  const now = Date.now();
  const list: LatencySample[] = [];
  for (let i = pointCount - 1; i >= 0; i--) {
    const t = new Date(now - i * 1500);
    const waveA = Math.sin(i * 0.45) * 0.9 + Math.cos(i * 0.25) * 0.45;
    const waveB = Math.cos(i * 0.52) * 0.75 + Math.sin(i * 0.3) * 0.35;
    const switchAvgMs = Number(Math.max(2, switchBaseAvg + waveA).toFixed(2));
    const switchP95Ms = Number(Math.max(switchAvgMs + 3, switchBaseP95 + waveA * 1.35).toFixed(2));
    const risingNetAvgMs = Number(Math.max(1.5, rnBaseAvg + waveB).toFixed(2));
    const selectedServerMs =
      selectedServerBase !== null
        ? Number(Math.max(1.2, selectedServerBase + Math.sin(i * 0.65) * 0.65).toFixed(2))
        : null;
    const deltaMs = Number(Math.abs(switchAvgMs - risingNetAvgMs).toFixed(2));

    list.push({
      timestamp: t,
      switchAvgMs,
      switchP95Ms,
      risingNetAvgMs,
      selectedServerMs,
      deltaMs,
    });
  }
  return list;
}

export const SwitchRisingNetD3Chart: React.FC<SwitchRisingNetD3ChartProps> = ({
  externalJitterMs = 0,
}) => {
  const [switchScope, setSwitchScope] = useState<SwitchScope>('hub1_500');
  const [selectedRnId, setSelectedRnId] = useState<string>('none');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [hoverSample, setHoverSample] = useState<LatencySample | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [chartWidth, setChartWidth] = useState<number>(760);

  const activeSwitchNodes = useMemo(() => {
    if (switchScope === 'hub1_500') return HUB1_500_SWITCH_NODES;
    if (switchScope === 'hub2_500') return HUB2_500_SWITCH_NODES;
    return ALL_1000_SWITCH_NODES;
  }, [switchScope]);

  const selectedRnServer = useMemo(
    () => RISINGNET_10_DEDICATED_SERVERS.find((s) => s.id === selectedRnId) || null,
    [selectedRnId]
  );

  const baselines = useMemo(() => {
    const sw = computeSwitchStats(activeSwitchNodes, externalJitterMs);
    const rnAvg = computeRisingNetStats(externalJitterMs);
    const selBase = selectedRnServer
      ? Number(Math.max(1.2, selectedRnServer.latencyMs + externalJitterMs).toFixed(2))
      : null;
    return { swAvg: sw.avg, swP95: sw.p95, rnAvg, selBase };
  }, [activeSwitchNodes, externalJitterMs, selectedRnServer]);

  const [samples, setSamples] = useState<LatencySample[]>(() =>
    buildInitialHistory(baselines.swAvg, baselines.swP95, baselines.rnAvg, baselines.selBase)
  );

  // Reset timeline smoothly when scope or overlaid RisingNet server changes
  useEffect(() => {
    setSamples(
      buildInitialHistory(baselines.swAvg, baselines.swP95, baselines.rnAvg, baselines.selBase)
    );
  }, [baselines.swAvg, baselines.swP95, baselines.rnAvg, baselines.selBase]);

  // Append a live telemetry sample
  const appendNextSample = () => {
    setSamples((prev) => {
      const idx = prev.length + Math.floor(Date.now() / 1500);
      const waveA = Math.sin(idx * 0.55) * 0.95 + Math.cos(idx * 0.28) * 0.4;
      const waveB = Math.cos(idx * 0.48) * 0.75 + Math.sin(idx * 0.35) * 0.35;
      const switchAvgMs = Number(Math.max(2, baselines.swAvg + waveA).toFixed(2));
      const switchP95Ms = Number(Math.max(switchAvgMs + 3, baselines.swP95 + waveA * 1.3).toFixed(2));
      const risingNetAvgMs = Number(Math.max(1.5, baselines.rnAvg + waveB).toFixed(2));
      const selectedServerMs =
        baselines.selBase !== null
          ? Number(Math.max(1.2, baselines.selBase + Math.sin(idx * 0.7) * 0.65).toFixed(2))
          : null;
      const next: LatencySample = {
        timestamp: new Date(),
        switchAvgMs,
        switchP95Ms,
        risingNetAvgMs,
        selectedServerMs,
        deltaMs: Number(Math.abs(switchAvgMs - risingNetAvgMs).toFixed(2)),
      };
      return [...prev.slice(1), next];
    });
  };

  useEffect(() => {
    if (!isStreaming) return;
    const timer = setInterval(appendNextSample, 1500);
    return () => clearInterval(timer);
  }, [isStreaming, baselines]);

  // Responsive SVG width via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = () => {
      const w = el.clientWidth;
      if (w > 240) setChartWidth(w);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Render D3 chart
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || samples.length === 0) return;

    const width = chartWidth;
    const height = 270;
    const margin = { top: 18, right: 20, bottom: 28, left: 46 };
    const innerWidth = Math.max(120, width - margin.left - margin.right);
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent(samples, (d) => d.timestamp) as [Date, Date];
    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);

    const yMaxData =
      d3.max(samples, (d) =>
        Math.max(d.switchP95Ms, d.switchAvgMs, d.risingNetAvgMs, d.selectedServerMs ?? 0)
      ) ?? 40;
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.ceil(Math.max(30, yMaxData * 1.12) / 5) * 5])
      .nice()
      .range([innerHeight, 0]);

    // Horizontal grid lines
    const yAxisGrid = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickSize(-innerWidth)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'd3-grid')
      .call(yAxisGrid)
      .call((sel) => sel.select('.domain').remove())
      .call((sel) =>
        sel.selectAll('line').attr('stroke', '#1e293b').attr('stroke-dasharray', '3,3')
      );

    // Subtle shaded envelope between Switch Avg and P95
    const p95Area = d3
      .area<LatencySample>()
      .x((d) => xScale(d.timestamp))
      .y0((d) => yScale(d.switchAvgMs))
      .y1((d) => yScale(d.switchP95Ms))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(samples)
      .attr('fill', 'rgba(34, 211, 238, 0.08)')
      .attr('d', p95Area);

    // 25 ms cross-mesh SLA threshold
    const slaY = yScale(25);
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', slaY)
      .attr('y2', slaY)
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.65);

    g.append('text')
      .attr('x', innerWidth - 4)
      .attr('y', slaY - 5)
      .attr('text-anchor', 'end')
      .attr('fill', '#fbbf24')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
      .text('25.0 ms SLA Target');

    // Line generators
    const switchP95Line = d3
      .line<LatencySample>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(d.switchP95Ms))
      .curve(d3.curveMonotoneX);

    const switchAvgLine = d3
      .line<LatencySample>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(d.switchAvgMs))
      .curve(d3.curveMonotoneX);

    const rnAvgLine = d3
      .line<LatencySample>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(d.risingNetAvgMs))
      .curve(d3.curveMonotoneX);

    // Draw P95 dashed curve
    g.append('path')
      .datum(samples)
      .attr('fill', 'none')
      .attr('stroke', '#0284c7')
      .attr('stroke-width', 1.4)
      .attr('stroke-dasharray', '4,3')
      .attr('d', switchP95Line);

    // Draw Switch Avg curve
    g.append('path')
      .datum(samples)
      .attr('fill', 'none')
      .attr('stroke', '#22d3ee')
      .attr('stroke-width', 2.4)
      .attr('d', switchAvgLine);

    // Draw RisingNet 10-Server Avg curve
    g.append('path')
      .datum(samples)
      .attr('fill', 'none')
      .attr('stroke', '#c084fc')
      .attr('stroke-width', 2.4)
      .attr('d', rnAvgLine);

    // Optional individual RisingNet server trace
    if (samples[0]?.selectedServerMs !== null) {
      const selLine = d3
        .line<LatencySample>()
        .x((d) => xScale(d.timestamp))
        .y((d) => yScale(d.selectedServerMs ?? 0))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(samples)
        .attr('fill', 'none')
        .attr('stroke', '#fbbf24')
        .attr('stroke-width', 1.8)
        .attr('d', selLine);
    }

    // X Axis
    const xAxis = d3
      .axisBottom<Date>(xScale)
      .ticks(6)
      .tickFormat(d3.timeFormat('%H:%M:%S'));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((sel) => sel.select('.domain').attr('stroke', '#334155'))
      .call((sel) => sel.selectAll('line').attr('stroke', '#334155'))
      .call((sel) =>
        sel
          .selectAll('text')
          .attr('fill', '#94a3b8')
          .attr('font-size', '10px')
          .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
      );

    // Y Axis
    const yAxis = d3
      .axisLeft<number>(yScale)
      .ticks(5)
      .tickFormat((v) => `${v}ms`);

    g.append('g')
      .call(yAxis)
      .call((sel) => sel.select('.domain').attr('stroke', '#334155'))
      .call((sel) => sel.selectAll('line').attr('stroke', '#334155'))
      .call((sel) =>
        sel
          .selectAll('text')
          .attr('fill', '#94a3b8')
          .attr('font-size', '10px')
          .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
      );

    // Interactive Crosshair Guide & Focus Points
    const focusGroup = g.append('g').style('display', 'none');

    focusGroup
      .append('line')
      .attr('class', 'crosshair-x')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#475569')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    const dotSwitch = focusGroup
      .append('circle')
      .attr('r', 4)
      .attr('fill', '#22d3ee')
      .attr('stroke', '#020617')
      .attr('stroke-width', 1.5);

    const dotRn = focusGroup
      .append('circle')
      .attr('r', 4)
      .attr('fill', '#c084fc')
      .attr('stroke', '#020617')
      .attr('stroke-width', 1.5);

    const dotSel = focusGroup
      .append('circle')
      .attr('r', 3.5)
      .attr('fill', '#fbbf24')
      .attr('stroke', '#020617')
      .attr('stroke-width', 1.5);

    const bisectDate = d3.bisector<LatencySample, Date>((d) => d.timestamp).left;

    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mouseenter', () => focusGroup.style('display', null))
      .on('mouseleave', () => {
        focusGroup.style('display', 'none');
        setHoverSample(null);
      })
      .on('mousemove', (event: MouseEvent) => {
        const [mx] = d3.pointer(event);
        const hoveredDate = xScale.invert(mx);
        const idx = bisectDate(samples, hoveredDate, 1);
        const d0 = samples[idx - 1];
        const d1 = samples[idx];
        const chosen =
          !d1 || hoveredDate.getTime() - d0.timestamp.getTime() < d1.timestamp.getTime() - hoveredDate.getTime()
            ? d0
            : d1;
        if (!chosen) return;

        const cx = xScale(chosen.timestamp);
        focusGroup.select('.crosshair-x').attr('x1', cx).attr('x2', cx);
        dotSwitch.attr('cx', cx).attr('cy', yScale(chosen.switchAvgMs));
        dotRn.attr('cx', cx).attr('cy', yScale(chosen.risingNetAvgMs));
        if (chosen.selectedServerMs !== null) {
          dotSel.style('display', null).attr('cx', cx).attr('cy', yScale(chosen.selectedServerMs));
        } else {
          dotSel.style('display', 'none');
        }
        setHoverSample(chosen);
      });
  }, [samples, chartWidth]);

  const latest = hoverSample || samples[samples.length - 1];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>D3 Real-Time Ping Latency Trends: Switch 500-Node Fleet vs. 10 RisingNet Servers</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Comparing {activeSwitchNodes.length.toLocaleString()} Switch SUPERNAP nodes against 10 RisingNet 100G DWDM servers · Hover graph to inspect per-tick RTT
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Select Switch Node Group"
            value={switchScope}
            onChange={(e) => setSwitchScope(e.target.value as SwitchScope)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
          >
            <option value="hub1_500">Hub 1 · 500 Switch Nodes</option>
            <option value="hub2_500">Hub 2 · 500 Switch Nodes</option>
            <option value="all_1000">All 1,000 Switch Nodes (500/Hub)</option>
          </select>

          <select
            aria-label="Overlay Specific RisingNet Server"
            value={selectedRnId}
            onChange={(e) => setSelectedRnId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
          >
            <option value="none">RisingNet: All 10 Servers Avg</option>
            {RISINGNET_10_DEDICATED_SERVERS.map((srv) => (
              <option key={srv.id} value={srv.id}>
                Overlay {srv.sid}: {srv.location} ({srv.latencyMs}ms)
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsStreaming((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer ${
              isStreaming
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          <button
            type="button"
            onClick={appendNextSample}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sample Ping</span>
          </button>
        </div>
      </div>

      {/* Live Telemetry Summary Strip */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
            <div className="text-[10px] text-slate-400 uppercase">Timestamp</div>
            <div className="font-bold text-white tabular-nums mt-0.5">
              {latest.timestamp.toTimeString().slice(0, 8)}
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
            <div className="text-[10px] text-cyan-400 uppercase">
              Switch ({activeSwitchNodes.length}) Avg
            </div>
            <div className="font-bold text-cyan-300 tabular-nums mt-0.5">
              {latest.switchAvgMs} ms
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
            <div className="text-[10px] text-sky-400 uppercase">Switch P95 Envelope</div>
            <div className="font-bold text-sky-300 tabular-nums mt-0.5">
              {latest.switchP95Ms} ms
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
            <div className="text-[10px] text-purple-400 uppercase">10 RisingNet Avg</div>
            <div className="font-bold text-purple-300 tabular-nums mt-0.5">
              {latest.risingNetAvgMs} ms
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
            <div className="text-[10px] text-amber-400 uppercase">
              {selectedRnServer ? `${selectedRnServer.sid} Trace` : 'Cross-Mesh Delta Δ'}
            </div>
            <div className="font-bold text-amber-300 tabular-nums mt-0.5">
              {selectedRnServer && latest.selectedServerMs !== null
                ? `${latest.selectedServerMs} ms`
                : `${latest.deltaMs} ms`}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
          Switch Nodes Avg RTT
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-sky-600 inline-block border-t border-dashed border-sky-400" />
          Switch P95 Envelope
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-purple-400 inline-block" />
          10 RisingNet Servers Avg RTT
        </span>
        {selectedRnServer && (
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="w-3 h-0.5 bg-amber-400 inline-block" />
            {selectedRnServer.sid} ({selectedRnServer.location})
          </span>
        )}
      </div>

      {/* D3 Responsive SVG Container */}
      <div ref={containerRef} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2">
        <svg ref={svgRef} className="w-full overflow-visible" />
      </div>

      {/* Clickable 10 RisingNet Server Strip */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono text-slate-400 uppercase">
          Click any RisingNet Dedicated Server (1–10) to overlay its ping trace on the D3 chart:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {RISINGNET_10_DEDICATED_SERVERS.map((srv) => {
            const isActive = selectedRnId === srv.id;
            const liveRtt = Math.max(1.0, Number((srv.latencyMs + externalJitterMs).toFixed(1)));
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => setSelectedRnId((prev) => (prev === srv.id ? 'none' : srv.id))}
                className={`p-2 rounded-lg border text-left transition cursor-pointer font-mono ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-400 text-amber-200'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-purple-300">{srv.sid}</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{liveRtt}ms</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {srv.location.split(',')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
