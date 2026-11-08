/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Production D3.js Donut Chart for Global Satellite Orbital Distribution (LEO, MEO, GEO, Hybrid)
 * Aggregates live fleet size (active & planned satellites) from directory companies
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { SatelliteCompany, OrbitType } from '../types/satellite';
import {
  Orbit,
  Satellite,
  Radio,
  Layers,
  Activity,
  Sparkles,
  Info,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Globe,
  Sliders,
  Maximize2
} from 'lucide-react';

export type MetricMode = 'active' | 'planned' | 'operators';

export interface RegimeSliceData {
  id: string;
  name: string;
  shortLabel: OrbitType | 'Hybrid' | 'Ground';
  value: number;
  percentage: number;
  color: string;
  glowColor: string;
  altitudeRange: string;
  latencyProfile: string;
  operatorCount: number;
  companies: SatelliteCompany[];
  description: string;
}

interface OrbitalDistributionDonutChartProps {
  companies: SatelliteCompany[];
  onSelectCompany?: (company: SatelliteCompany) => void;
  className?: string;
}

const REGIME_CONFIG: Record<string, {
  color: string;
  glowColor: string;
  altitude: string;
  latency: string;
  description: string;
}> = {
  LEO: {
    color: '#06b6d4', // Cyan 500
    glowColor: 'rgba(6, 182, 212, 0.45)',
    altitude: '160 - 2,000 km',
    latency: '20 - 45 ms (Ultra-Low)',
    description: 'Low Earth Orbit: Rapid orbital periods (~90 min), massive megaconstellations, lowest latency for broadband and 3GPP NTN direct-to-device.'
  },
  MEO: {
    color: '#a855f7', // Purple 500
    glowColor: 'rgba(168, 85, 247, 0.45)',
    altitude: '2,000 - 35,786 km (Typ. 8,000 km)',
    latency: '120 - 150 ms (Low Jitter)',
    description: 'Medium Earth Orbit: Balanced high-throughput steerable beam arrays for maritime cruise ships, telecom backhaul, and carrier trunks.'
  },
  GEO: {
    color: '#6366f1', // Indigo 500
    glowColor: 'rgba(99, 102, 241, 0.45)',
    altitude: '35,786 km (Geostationary Arc)',
    latency: '550 - 620 ms (Broadcast Static)',
    description: 'Geostationary Orbit: High elevation angle, stationary ground antennas, continent-wide footprints ideal for DTH television and critical broadcast distribution.'
  },
  Hybrid: {
    color: '#10b981', // Emerald 500
    glowColor: 'rgba(16, 185, 129, 0.45)',
    altitude: 'Multi-Orbit Fleet Architecture',
    latency: 'Adaptive Dynamic Routing (25 - 580 ms)',
    description: 'Hybrid / Multi-Regime: Combined LEO+GEO or MEO+GEO constellations providing intelligent traffic steering based on application SLA.'
  },
  'Ground Segment': {
    color: '#f59e0b', // Amber 500
    glowColor: 'rgba(245, 158, 11, 0.45)',
    altitude: 'Terrestrial Earth Stations & Teleports',
    latency: '< 5 ms (Fiber Interconnect)',
    description: 'Ground Segment & Teleport Campus: Earth stations, uplink dishes, Switch SUPERNAP fiber cross-connects, and RisingNet BGP optical transit.'
  }
};

export const OrbitalDistributionDonutChart: React.FC<OrbitalDistributionDonutChartProps> = ({
  companies,
  onSelectCompany,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // User Interactive State
  const [metricMode, setMetricMode] = useState<MetricMode>('active');
  const [selectedRegimeId, setSelectedRegimeId] = useState<string | null>(null);
  const [hoveredRegimeId, setHoveredRegimeId] = useState<string | null>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 440, height: 380 });

  // Filter out any zero or invalid companies
  const validCompanies = useMemo(() => companies.filter((c) => c && c.orbitType), [companies]);

  // Aggregate satellite distribution by orbital regime
  const { regimeData, totalValue } = useMemo(() => {
    // Group companies by regime
    const groups: Record<string, SatelliteCompany[]> = {
      LEO: [],
      MEO: [],
      GEO: [],
      Hybrid: [],
      'Ground Segment': []
    };

    validCompanies.forEach((c) => {
      const type = c.orbitType || 'GEO';
      if (groups[type]) {
        groups[type].push(c);
      } else {
        groups.GEO.push(c);
      }
    });

    // Calculate value based on selected metric
    let total = 0;
    const slices: RegimeSliceData[] = (['LEO', 'MEO', 'GEO', 'Hybrid', 'Ground Segment'] as const)
      .map((regime) => {
        const comps = groups[regime] || [];
        let val = 0;

        if (metricMode === 'active') {
          val = comps.reduce((sum, c) => sum + (c.fleetSize?.activeSatellites || 0), 0);
          // If ground segment, show representative teleport / earth station nodes if fleet size is 0
          if (regime === 'Ground Segment' && val === 0) val = comps.length * 8;
        } else if (metricMode === 'planned') {
          val = comps.reduce((sum, c) => sum + (c.fleetSize?.plannedSatellites || c.fleetSize?.activeSatellites || 0), 0);
          if (regime === 'Ground Segment' && val === 0) val = comps.length * 12;
        } else {
          // Operators count
          val = comps.length;
        }

        total += val;

        const config = REGIME_CONFIG[regime] || REGIME_CONFIG.GEO;
        return {
          id: regime,
          name: regime === 'Hybrid' ? 'Hybrid (Multi-Orbit)' : `${regime} Orbit`,
          shortLabel: regime,
          value: val,
          percentage: 0, // calculated below
          color: config.color,
          glowColor: config.glowColor,
          altitudeRange: config.altitude,
          latencyProfile: config.latency,
          operatorCount: comps.length,
          companies: comps.sort((a, b) => (b.fleetSize?.activeSatellites || 0) - (a.fleetSize?.activeSatellites || 0)),
          description: config.description
        };
      })
      .filter((slice) => slice.value > 0);

    // Compute percentages
    slices.forEach((s) => {
      s.percentage = total > 0 ? (s.value / total) * 100 : 0;
    });

    return { regimeData: slices, totalValue: total };
  }, [validCompanies, metricMode]);

  // Handle auto-resize on window/container change
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const calculatedWidth = Math.max(280, Math.min(500, w));
      const calculatedHeight = Math.max(280, Math.min(420, calculatedWidth * 0.88));
      setChartDimensions({ width: calculatedWidth, height: calculatedHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Primary active item: hovered item takes priority, then clicked/selected item, else largest slice
  const activeHighlightedRegime = useMemo(() => {
    if (hoveredRegimeId) return regimeData.find((r) => r.id === hoveredRegimeId) || null;
    if (selectedRegimeId) return regimeData.find((r) => r.id === selectedRegimeId) || null;
    return regimeData[0] || null;
  }, [hoveredRegimeId, selectedRegimeId, regimeData]);

  // D3 Donut Chart Drawing Effect (Base Structure)
  useEffect(() => {
    if (!svgRef.current || regimeData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = chartDimensions.width;
    const height = chartDimensions.height;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.58;
    const outerRadius = radius * 0.84;

    // Create defs for gradients and glow drop shadows
    const defs = svg.append('defs');

    // Glow Filter
    const filter = defs.append('filter')
      .attr('id', 'd3-donut-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '6')
      .attr('result', 'blur');

    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    // Subtle drop shadow filter for 3D depth
    const dropShadow = defs.append('filter')
      .attr('id', 'd3-donut-shadow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');

    dropShadow.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '4')
      .attr('stdDeviation', '8')
      .attr('flood-color', '#000000')
      .attr('flood-opacity', '0.6');

    // Chart group centered
    const g = svg.append('g')
      .attr('class', 'donut-main-group')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // D3 Pie layout with padding between slices
    const pie = d3.pie<RegimeSliceData>()
      .value((d) => d.value)
      .sort(null)
      .padAngle(0.028);

    // Standard Arc generator
    const arc = d3.arc<d3.PieArcDatum<RegimeSliceData>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(6);

    // Subtle background track ring for visual elegance
    g.append('circle')
      .attr('r', (innerRadius + outerRadius) / 2)
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', outerRadius - innerRadius + 2)
      .attr('opacity', 0.25);

    // Outer orbit ring decoration
    g.append('circle')
      .attr('r', outerRadius + 8)
      .attr('fill', 'none')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3 4')
      .attr('opacity', 0.4);

    // Inner orbit ring decoration
    g.append('circle')
      .attr('r', innerRadius - 6)
      .attr('fill', 'none')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2 3')
      .attr('opacity', 0.4);

    // Slices group
    const arcsGroup = g.selectAll('.donut-slice')
      .data(pie(regimeData))
      .enter()
      .append('g')
      .attr('class', 'donut-slice')
      .style('cursor', 'pointer');

    // Slice paths with initial dimensions
    arcsGroup.append('path')
      .attr('d', arc as any)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#090d16')
      .attr('stroke-width', 2.5)
      .style('filter', 'url(#d3-donut-shadow)')
      .style('opacity', 0.92)
      .on('mouseenter', function (_, d) {
        setHoveredRegimeId(d.data.id);
      })
      .on('mouseleave', function () {
        setHoveredRegimeId(null);
      })
      .on('click', function (_, d) {
        setSelectedRegimeId((prev) => (prev === d.data.id ? null : d.data.id));
      });

    // Add percentage labels on larger arcs (>= 7%)
    arcsGroup.filter((d) => d.data.percentage >= 7)
      .append('text')
      .attr('class', 'slice-percentage-label')
      .attr('transform', (d) => {
        const centroid = arc.centroid(d);
        return `translate(${centroid[0]}, ${centroid[1]})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '11px')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 1px 4px rgba(0,0,0,0.9)')
      .text((d) => `${d.data.percentage.toFixed(0)}%`);

  }, [regimeData, chartDimensions]);

  // Dynamic Hover and Selection Arc Update Effect
  useEffect(() => {
    if (!svgRef.current || regimeData.length === 0) return;

    const width = chartDimensions.width;
    const height = chartDimensions.height;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.58;
    const outerRadius = radius * 0.84;
    const hoverOuterRadius = radius * 0.90;

    const arc = d3.arc<d3.PieArcDatum<RegimeSliceData>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(6);

    const arcHover = d3.arc<d3.PieArcDatum<RegimeSliceData>>()
      .innerRadius(innerRadius - 2)
      .outerRadius(hoverOuterRadius)
      .cornerRadius(8);

    const svg = d3.select(svgRef.current);
    svg.selectAll<SVGPathElement, d3.PieArcDatum<RegimeSliceData>>('.donut-slice path')
      .transition()
      .duration(220)
      .attr('d', (d) => {
        const isHovered = (hoveredRegimeId === d.data.id) || (!hoveredRegimeId && selectedRegimeId === d.data.id);
        return isHovered ? (arcHover(d) as string) : (arc(d) as string);
      })
      .style('opacity', (d) => {
        if (!hoveredRegimeId && !selectedRegimeId) return 0.92;
        const isTarget = d.data.id === (hoveredRegimeId || selectedRegimeId);
        return isTarget ? 1.0 : 0.45;
      })
      .style('filter', (d) => {
        const isHovered = (hoveredRegimeId === d.data.id) || (!hoveredRegimeId && selectedRegimeId === d.data.id);
        return isHovered ? 'url(#d3-donut-glow)' : 'url(#d3-donut-shadow)';
      });
  }, [hoveredRegimeId, selectedRegimeId, chartDimensions, regimeData]);

  return (
    <div className={`bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-sm ${className}`}>
      
      {/* Header & Metric Mode Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-cyan-600/30 via-indigo-600/30 to-purple-600/30 border border-cyan-500/30 rounded-xl text-cyan-300">
              <Orbit className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-wide text-white">
                  ORBITAL FLEET DISTRIBUTION (D3.JS)
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-md">
                  LEO / MEO / GEO
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-md hidden sm:inline">
                  D3 Donut Matrix
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic visualization of global satellites across altitudes, latency horizons, and operating carriers from current directory records.
              </p>
            </div>
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono self-start lg:self-auto shrink-0 shadow-inner">
          <button
            onClick={() => setMetricMode('active')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              metricMode === 'active'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Visualize by currently operating in-orbit satellites"
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Active Satellites</span>
          </button>

          <button
            onClick={() => setMetricMode('planned')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              metricMode === 'planned'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Visualize by authorized and planned next-gen fleet size"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Planned Constellations</span>
          </button>

          <button
            onClick={() => setMetricMode('operators')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              metricMode === 'operators'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Visualize by number of commercial operators per orbital regime"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Operator Count</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: D3 Donut Chart (Left) + Regime Telemetry & Operator Drill-Down (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Interactive D3 Donut Chart with Center Display */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative" ref={containerRef}>
          <div className="relative">
            <svg
              ref={svgRef}
              width={chartDimensions.width}
              height={chartDimensions.height}
              className="overflow-visible select-none drop-shadow-2xl"
            />

            {/* Center Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 block">
                {activeHighlightedRegime ? activeHighlightedRegime.name : 'Total Fleet'}
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight block my-0.5">
                {activeHighlightedRegime
                  ? activeHighlightedRegime.value.toLocaleString()
                  : totalValue.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold block">
                {activeHighlightedRegime
                  ? `${activeHighlightedRegime.percentage.toFixed(1)}% Share`
                  : `${validCompanies.length} Directory Operators`}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                {metricMode === 'active'
                  ? 'Active in Orbit'
                  : metricMode === 'planned'
                  ? 'Planned Fleet'
                  : 'Licensed Carriers'}
              </span>
            </div>
          </div>

          <div className="mt-2 text-center text-xs font-mono text-slate-500">
            <span>Hover or click arcs to isolate regime and inspect operator fleets</span>
          </div>
        </div>

        {/* Right Column: Regime Legend Cards & Active Operator Breakdown */}
        <div className="lg:col-span-6 space-y-3.5">
          {/* Regime Quick Legend Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {regimeData.map((regime) => {
              const isSelected = selectedRegimeId === regime.id;
              const isHovered = hoveredRegimeId === regime.id;
              const isActive = isSelected || isHovered;

              return (
                <div
                  key={regime.id}
                  onClick={() => {
                    if (selectedRegimeId === regime.id) {
                      setSelectedRegimeId(null);
                    } else {
                      setSelectedRegimeId(regime.id);
                    }
                  }}
                  onMouseEnter={() => setHoveredRegimeId(regime.id)}
                  onMouseLeave={() => setHoveredRegimeId(null)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 ${
                    isActive
                      ? 'bg-slate-800/90 border-cyan-400/80 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-400/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: regime.color }}
                      />
                      <span className="text-xs font-bold font-mono text-white">
                        {regime.shortLabel}
                      </span>
                    </div>

                    <span
                      className="text-xs font-mono font-black px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${regime.color}22`,
                        color: regime.color
                      }}
                    >
                      {regime.percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      {metricMode === 'active'
                        ? `${regime.value.toLocaleString()} Birds`
                        : metricMode === 'planned'
                        ? `${regime.value.toLocaleString()} Planned`
                        : `${regime.value} Carriers`}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {regime.operatorCount} Operators
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    {regime.altitudeRange}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Highlighted Regime Detailed Inspector Card */}
          {activeHighlightedRegime && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-pulse"
                    style={{ backgroundColor: activeHighlightedRegime.color }}
                  />
                  <h4 className="text-sm font-black font-mono text-white">
                    {activeHighlightedRegime.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                    {activeHighlightedRegime.altitudeRange}
                  </span>
                </div>

                <div className="text-xs font-mono text-emerald-400 font-bold">
                  Latency: {activeHighlightedRegime.latencyProfile}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeHighlightedRegime.description}
              </p>

              {/* Top Operators List in this Regime */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="uppercase tracking-wider">Top Constellations in {activeHighlightedRegime.shortLabel}:</span>
                  <span className="text-slate-500">{activeHighlightedRegime.companies.length} Operators</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {activeHighlightedRegime.companies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => onSelectCompany && onSelectCompany(company)}
                      className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-lg text-left transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate block">
                          {company.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 truncate block">
                          {company.headquarters.country} &bull; {company.frequencyBands.slice(0, 2).join('/')}
                        </span>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className="text-xs font-bold text-white block">
                          {company.fleetSize.activeSatellites.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-500 block">active</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedRegimeId && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedRegimeId(null)}
                    className="text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer underline"
                  >
                    Clear Filter (Show All Regimes)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Footer Badges */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 text-[10px] uppercase block">TOTAL IN-ORBIT BIRDS</span>
          <span className="text-base font-black text-cyan-300">
            {regimeData
              .reduce((acc, r) => acc + (metricMode === 'active' ? r.value : r.companies.reduce((s, c) => s + c.fleetSize.activeSatellites, 0)), 0)
              .toLocaleString()} Satellites
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 text-[10px] uppercase block">LARGEST REGIME SHARE</span>
          <span className="text-base font-black text-purple-300">
            {regimeData[0] ? `${regimeData[0].shortLabel} (${regimeData[0].percentage.toFixed(0)}%)` : 'LEO'}
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 text-[10px] uppercase block">LOWEST LATENCY REGIME</span>
          <span className="text-base font-black text-emerald-400">LEO (~20-40 ms)</span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 text-[10px] uppercase block">GLOBAL OPERATOR POOL</span>
          <span className="text-base font-black text-indigo-300">{validCompanies.length} Carriers</span>
        </div>
      </div>
    </div>
  );
};
