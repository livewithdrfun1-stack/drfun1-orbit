/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Interactive D3.js World Map for DrFun1 News
 * - Renders Natural Earth geo projection with D3 graticules, regional GeoJSON landmasses,
 *   and great-circle fiber syndication arcs anchored at Switch SUPERNAP HQ.
 * - Clicking any world region highlights active global news outlets on the map and
 *   synchronizes directly with the DrFun1 News Directory regionFilter state.
 * - Clicking any outlet pin tunes the DrFun1 News live TV desk immediately.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Flame,
  Globe,
  Maximize2,
  MonitorPlay,
  Radio,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { GlobalNewsOutlet, NewsOutletRegion } from '../types/drfun1News';

interface DrFun1NewsWorldMapProps {
  allOutlets: GlobalNewsOutlet[];
  filteredOutlets: GlobalNewsOutlet[];
  activeRegion: 'All' | NewsOutletRegion;
  onSelectRegion: (region: 'All' | NewsOutletRegion) => void;
  tunedOutlet: GlobalNewsOutlet;
  onTuneOutlet: (outlet: GlobalNewsOutlet) => void;
  onJumpToDirectory?: () => void;
}

interface RegionFeatureMeta {
  region: Exclude<NewsOutletRegion, 'Global Wire'>;
  label: string;
  hubName: string;
  centerLonLat: [number, number];
  accent: string;
  coordinates: number[][][];
}

// Self-contained simplified continental GeoJSON polygons keyed to NewsOutletRegion
// so D3 geoNaturalEarth1 + geoPath works reliably without external CDN fetches.
const WORLD_REGION_POLYGONS: RegionFeatureMeta[] = [
  {
    region: 'North America',
    label: 'North America',
    hubName: 'Switch SUPERNAP & DC/NY Desk',
    centerLonLat: [-98, 44],
    accent: '#38bdf8',
    coordinates: [
      [
        [-168, 66], [-152, 71], [-128, 70], [-95, 72], [-78, 63], [-60, 53],
        [-53, 47], [-66, 44], [-74, 40], [-81, 25], [-83, 29], [-90, 29],
        [-97, 26], [-96, 19], [-88, 16], [-92, 15], [-105, 20], [-112, 28],
        [-117, 32], [-124, 41], [-125, 49], [-137, 58], [-156, 57], [-166, 61], [-168, 66],
      ],
      [
        [-52, 60], [-42, 60], [-22, 70], [-20, 81], [-55, 82], [-72, 77], [-58, 68], [-52, 60],
      ],
    ],
  },
  {
    region: 'Latin America',
    label: 'Latin America',
    hubName: 'Sao Paulo & Americas Trunk',
    centerLonLat: [-60, -15],
    accent: '#34d399',
    coordinates: [
      [
        [-84, 11], [-77, 9], [-72, 12], [-61, 10], [-50, 1], [-35, -6],
        [-38, -14], [-40, -22], [-48, -26], [-54, -34], [-62, -41], [-67, -51],
        [-70, -55], [-75, -48], [-73, -37], [-71, -29], [-71, -18], [-78, -12],
        [-81, -4], [-79, 2], [-82, 8], [-84, 11],
      ],
    ],
  },
  {
    region: 'Europe',
    label: 'Europe',
    hubName: 'London · Paris · Frankfurt DE-CIX',
    centerLonLat: [12, 50],
    accent: '#818cf8',
    coordinates: [
      [
        [-9, 37], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [6, 59],
        [11, 65], [20, 70], [30, 70], [33, 66], [28, 60], [22, 55], [28, 51],
        [36, 46], [29, 41], [23, 38], [18, 40], [15, 38], [11, 44], [6, 43],
        [2, 41], [-5, 36], [-9, 37],
      ],
      [
        [-6, 50], [-5, 55], [-2, 58], [1, 53], [-1, 51], [-6, 50],
      ],
      [
        [-10, 52], [-10, 55], [-6, 55], [-6, 52], [-10, 52],
      ],
    ],
  },
  {
    region: 'Middle East',
    label: 'Middle East',
    hubName: 'Doha · Dubai · Istanbul EMEA Gate',
    centerLonLat: [46, 28],
    accent: '#f59e0b',
    coordinates: [
      [
        [27, 41], [36, 42], [44, 40], [49, 38], [55, 37], [60, 26], [56, 23],
        [59, 21], [52, 16], [44, 13], [41, 18], [35, 29], [33, 31], [36, 37],
        [27, 38], [27, 41],
      ],
    ],
  },
  {
    region: 'Africa',
    label: 'Africa',
    hubName: 'Johannesburg NAPAfrica & Nairobi',
    centerLonLat: [20, 3],
    accent: '#10b981',
    coordinates: [
      [
        [-6, 36], [10, 37], [15, 32], [25, 32], [32, 31], [37, 22], [43, 12],
        [51, 11], [42, 0], [40, -11], [35, -24], [28, -33], [18, -35], [14, -22],
        [12, -12], [9, 3], [2, 6], [-8, 5], [-17, 15], [-16, 23], [-9, 31], [-6, 36],
      ],
      [
        [44, -25], [47, -25], [50, -13], [44, -17], [44, -25],
      ],
    ],
  },
  {
    region: 'Asia-Pacific',
    label: 'Asia-Pacific',
    hubName: 'Tokyo · Singapore · Sydney · Delhi',
    centerLonLat: [106, 26],
    accent: '#fb7185',
    coordinates: [
      [
        [61, 26], [68, 24], [73, 19], [77, 8], [81, 15], [89, 22], [97, 16],
        [102, 3], [104, 10], [109, 13], [108, 21], [116, 23], [122, 31], [120, 38],
        [127, 38], [130, 42], [141, 52], [142, 60], [160, 62], [170, 65], [130, 72],
        [95, 73], [70, 70], [58, 62], [58, 46], [62, 36], [61, 26],
      ],
      [
        [130, 31], [132, 34], [139, 35], [141, 41], [145, 44], [140, 45], [136, 37], [130, 31],
      ],
      [
        [96, 5], [104, -1], [106, -7], [115, -8], [114, 1], [102, 1], [96, 5],
      ],
      [
        [114, -22], [122, -17], [131, -12], [137, -13], [142, -11], [149, -20],
        [154, -28], [150, -37], [141, -39], [132, -32], [121, -34], [115, -34], [114, -22],
      ],
    ],
  },
];

const REGION_SUMMARY_ORDER: ('All' | NewsOutletRegion)[] = [
  'All',
  'Global Wire',
  'North America',
  'Europe',
  'Middle East',
  'Asia-Pacific',
  'Latin America',
  'Africa',
];

const OUTLET_BASE_COORDS: Record<string, [number, number]> = {
  'news-drfun1-hq': [-115.14, 36.17], // Switch SUPERNAP Las Vegas / DC
  'news-reuters-tv': [-0.12, 51.51], // London
  'news-ap-live': [-74.0, 40.71], // New York
  'news-bloomberg': [-73.97, 40.76], // Midtown NY
  'news-nasa-scan': [-95.36, 29.76], // Houston / Orbit
  'news-cnn-us': [-84.39, 33.75], // Atlanta
  'news-cnbc': [-73.95, 40.88], // Englewood Cliffs NJ
  'news-foxnews': [-73.98, 40.75], // NY
  'news-msnbc': [-73.98, 40.76], // 30 Rock NY
  'news-abc-live': [-73.98, 40.77], // NY
  'news-cbs-247': [-73.99, 40.77], // NY
  'news-nbc-now': [-118.35, 34.14], // LA / NY West Coast
  'news-pbs-world': [-77.1, 38.88], // Arlington VA
  'news-scotus-cspan': [-77.01, 38.89], // Washington DC
  'news-cbc-nn': [-79.38, 43.65], // Toronto
  'news-bbc-world': [-0.14, 51.52], // London
  'news-sky-uk': [-0.33, 51.49], // Osterley UK
  'news-euronews': [4.83, 45.76], // Lyon
  'news-france24': [2.35, 48.86], // Paris
  'news-dw': [13.4, 52.52], // Berlin
  'news-rai24': [12.49, 41.9], // Rome
  'news-tve24h': [-3.7, 40.42], // Madrid
  'news-aljazeera': [51.53, 25.29], // Doha
  'news-alarabiya': [55.27, 25.2], // Dubai / Riyadh
  'news-trtworld': [28.98, 41.01], // Istanbul
  'news-nhk-world': [139.69, 35.69], // Tokyo
  'news-cna': [103.82, 1.35], // Singapore
  'news-abc-au': [151.21, -33.87], // Sydney
  'news-wion': [77.21, 28.61], // New Delhi
  'news-arirang': [126.98, 37.57], // Seoul
  'news-globonews': [-46.63, -23.55], // Sao Paulo
  'news-sabc': [28.05, -26.2], // Johannesburg
  'news-africanews': [11.86, -4.77], // Pointe-Noire
};

function getOutletCoords(outlet: GlobalNewsOutlet, index: number): [number, number] {
  const base = OUTLET_BASE_COORDS[outlet.id];
  if (base) {
    // Deterministic micro-spread so overlapping NY/London studios remain individually clickable
    const angle = (index * 137.5 * Math.PI) / 180;
    const radius = outlet.id === 'news-drfun1-hq' ? 0 : (index % 5) * 0.9;
    return [base[0] + Math.cos(angle) * radius, base[1] + Math.sin(angle) * radius * 0.65];
  }
  const regionDefaults: Record<NewsOutletRegion, [number, number]> = {
    'Global Wire': [-74.0, 40.71],
    'North America': [-98.5, 39.8],
    Europe: [10.4, 50.1],
    'Middle East': [45.0, 26.0],
    'Asia-Pacific': [114.1, 22.3],
    'Latin America': [-58.4, -22.0],
    Africa: [24.0, -2.0],
  };
  const fallback = regionDefaults[outlet.region] || [0, 20];
  const angle = (index * 97 * Math.PI) / 180;
  return [fallback[0] + Math.cos(angle) * 4.2, fallback[1] + Math.sin(angle) * 3.1];
}

function getRegionAccent(region: NewsOutletRegion): string {
  switch (region) {
    case 'Global Wire':
      return '#f43f5e';
    case 'North America':
      return '#38bdf8';
    case 'Europe':
      return '#818cf8';
    case 'Middle East':
      return '#f59e0b';
    case 'Asia-Pacific':
      return '#fb7185';
    case 'Latin America':
      return '#34d399';
    case 'Africa':
      return '#10b981';
  }
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  outlet?: GlobalNewsOutlet;
  regionHover?: RegionFeatureMeta;
}

export const DrFun1NewsWorldMap: React.FC<DrFun1NewsWorldMapProps> = ({
  allOutlets,
  filteredOutlets,
  activeRegion,
  onSelectRegion,
  tunedOutlet,
  onTuneOutlet,
  onJumpToDirectory,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [svgSize, setSvgSize] = useState<{ width: number; height: number }>({
    width: 880,
    height: 410,
  });
  const [showArcs, setShowArcs] = useState<boolean>(true);
  const [showBreakingOnlyPulse, setShowBreakingOnlyPulse] = useState<boolean>(false);
  const [hoveredRegion, setHoveredRegion] = useState<Exclude<NewsOutletRegion, 'Global Wire'> | null>(
    null
  );
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0 });

  // Measure container dynamically via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 200) {
        setSvgSize({
          width: Math.max(520, Math.round(rect.width)),
          height: Math.max(330, Math.min(440, Math.round(rect.width * 0.45))),
        });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const filteredIdSet = useMemo(() => new Set(filteredOutlets.map((o) => o.id)), [filteredOutlets]);

  const outletPoints = useMemo(
    () =>
      allOutlets.map((outlet, idx) => ({
        outlet,
        coords: getOutletCoords(outlet, idx),
        isFilteredMatch: filteredIdSet.has(outlet.id),
        isRegionActive:
          activeRegion === 'All' ||
          outlet.region === activeRegion ||
          (activeRegion === 'Global Wire' && outlet.region === 'Global Wire'),
      })),
    [allOutlets, filteredIdSet, activeRegion]
  );

  // Region statistics synced with live outlets
  const regionCounts = useMemo(() => {
    const counts = new Map<'All' | NewsOutletRegion, { total: number; breaking: number; viewers: number }>();
    REGION_SUMMARY_ORDER.forEach((r) => counts.set(r, { total: 0, breaking: 0, viewers: 0 }));

    allOutlets.forEach((o) => {
      const allEntry = counts.get('All')!;
      allEntry.total += 1;
      if (o.isBreaking) allEntry.breaking += 1;
      allEntry.viewers += o.viewers;

      const regEntry = counts.get(o.region);
      if (regEntry) {
        regEntry.total += 1;
        if (o.isBreaking) regEntry.breaking += 1;
        regEntry.viewers += o.viewers;
      }
    });
    return counts;
  }, [allOutlets]);

  // Active regional spotlight outlets shown alongside the D3 map
  const spotlightOutlets = useMemo(() => {
    return filteredOutlets.slice(0, 6);
  }, [filteredOutlets]);

  // Render D3 Projection, Regions, Graticules, Fiber Arcs, and Interactive Outlet Pins
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const { width, height } = svgSize;
    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');

    // Ocean radial gradient
    const oceanGrad = defs
      .append('radialGradient')
      .attr('id', 'drfun1-news-ocean')
      .attr('cx', '50%')
      .attr('cy', '48%')
      .attr('r', '65%');
    oceanGrad.append('stop').attr('offset', '0%').attr('stop-color', '#0c1b33');
    oceanGrad.append('stop').attr('offset', '100%').attr('stop-color', '#030816');

    // Subtle glow filter for tuned & active regional nodes
    const glowFilter = defs
      .append('filter')
      .attr('id', 'drfun1-node-glow')
      .attr('x', '-60%')
      .attr('y', '-60%')
      .attr('width', '220%')
      .attr('height', '220%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'blur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const rootG = svg.append('g').attr('class', 'map-zoom-layer');

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 6])
      .translateExtent([
        [-width * 0.2, -height * 0.2],
        [width * 1.2, height * 1.2],
      ])
      .on('zoom', (event) => {
        rootG.attr('transform', event.transform.toString());
      });

    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    // D3 Natural Earth World Projection
    const projection = d3
      .geoNaturalEarth1()
      .scale(width / 5.45)
      .translate([width / 2, height / 1.88]);

    const pathGenerator = d3.geoPath(projection);
    const graticule = d3.geoGraticule10();

    // Sphere ocean backdrop
    rootG
      .append('path')
      .datum({ type: 'Sphere' } as d3.GeoPermissibleObjects)
      .attr('d', pathGenerator)
      .attr('fill', 'url(#drfun1-news-ocean)')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1.2)
      .on('click', () => {
        if (activeRegion !== 'All') onSelectRegion('All');
      });

    // Lat/Lon Graticule lines
    rootG
      .append('path')
      .datum(graticule)
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 0.55)
      .attr('stroke-opacity', 0.55);

    // Region Landmasses (Interactive Click -> Filter News Directory)
    const regionsGroup = rootG.append('g').attr('class', 'regions-layer');
    WORLD_REGION_POLYGONS.forEach((regMeta) => {
      const isSelected = activeRegion === regMeta.region;
      const isHovered = hoveredRegion === regMeta.region;
      const isAnyRegionSelected = activeRegion !== 'All' && activeRegion !== 'Global Wire';
      const isDimmed = isAnyRegionSelected && !isSelected;

      const geoFeature: GeoJSON.Feature<GeoJSON.MultiPolygon> = {
        type: 'Feature',
        properties: { region: regMeta.region },
        geometry: {
          type: 'MultiPolygon',
          coordinates: regMeta.coordinates.map((ring) => [ring]),
        },
      };

      regionsGroup
        .append('path')
        .datum(geoFeature)
        .attr('d', pathGenerator)
        .attr('fill', isSelected ? regMeta.accent : isHovered ? '#1e3a5f' : '#0f213a')
        .attr('fill-opacity', isSelected ? 0.28 : isDimmed ? 0.35 : 0.85)
        .attr('stroke', isSelected || isHovered ? regMeta.accent : '#334155')
        .attr('stroke-width', isSelected ? 2 : isHovered ? 1.5 : 0.9)
        .style('cursor', 'pointer')
        .on('mouseenter', function (event) {
          setHoveredRegion(regMeta.region);
          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltip({
            visible: true,
            x: mx,
            y: my,
            regionHover: regMeta,
          });
        })
        .on('mousemove', function (event) {
          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltip((prev) => ({ ...prev, x: mx, y: my }));
        })
        .on('mouseleave', function () {
          setHoveredRegion(null);
          setTooltip((prev) => ({ ...prev, visible: false, regionHover: undefined }));
        })
        .on('click', (event) => {
          event.stopPropagation();
          onSelectRegion(activeRegion === regMeta.region ? 'All' : regMeta.region);
        });

      // Region Hub Label Badge directly on canvas
      const projectedCenter = projection(regMeta.centerLonLat);
      if (projectedCenter) {
        const regStats = regionCounts.get(regMeta.region);
        const labelG = regionsGroup
          .append('g')
          .attr('transform', `translate(${projectedCenter[0]}, ${projectedCenter[1]})`)
          .style('cursor', 'pointer')
          .on('click', (event) => {
            event.stopPropagation();
            onSelectRegion(activeRegion === regMeta.region ? 'All' : regMeta.region);
          });

        labelG
          .append('rect')
          .attr('x', -50)
          .attr('y', -11)
          .attr('width', 100)
          .attr('height', 22)
          .attr('rx', 6)
          .attr('fill', isSelected ? regMeta.accent : '#020617')
          .attr('fill-opacity', isSelected ? 0.95 : 0.82)
          .attr('stroke', regMeta.accent)
          .attr('stroke-opacity', isSelected ? 1 : 0.55)
          .attr('stroke-width', isSelected ? 1.5 : 0.9);

        labelG
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.32em')
          .attr('font-size', '9.5px')
          .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
          .attr('font-weight', '700')
          .attr('fill', isSelected ? '#020617' : '#e2e8f0')
          .text(`${regMeta.label} (${regStats?.total ?? 0})`);
      }
    });

    // Clickable Global Wire Hub Badge in North Atlantic corridor so all 7 regions are directly clickable on the D3 SVG map
    const globalWirePos = projection([-38, 34]);
    if (globalWirePos) {
      const gwSelected = activeRegion === 'Global Wire';
      const gwStats = regionCounts.get('Global Wire');
      const gwG = regionsGroup
        .append('g')
        .attr('transform', `translate(${globalWirePos[0]}, ${globalWirePos[1]})`)
        .style('cursor', 'pointer')
        .on('click', (event) => {
          event.stopPropagation();
          onSelectRegion(gwSelected ? 'All' : 'Global Wire');
        });

      gwG
        .append('rect')
        .attr('x', -54)
        .attr('y', -11)
        .attr('width', 108)
        .attr('height', 22)
        .attr('rx', 6)
        .attr('fill', gwSelected ? '#f43f5e' : '#020617')
        .attr('fill-opacity', gwSelected ? 0.96 : 0.85)
        .attr('stroke', '#f43f5e')
        .attr('stroke-opacity', gwSelected ? 1 : 0.7)
        .attr('stroke-width', gwSelected ? 1.6 : 1);

      gwG
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.32em')
        .attr('font-size', '9.5px')
        .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
        .attr('font-weight', '700')
        .attr('fill', gwSelected ? '#ffffff' : '#fecdd3')
        .text(`Global Wire (${gwStats?.total ?? 0})`);
    }

    // Great-Circle Fiber Relay Arcs from Switch SUPERNAP HQ ([-115.14, 36.17]) to active outlets
    if (showArcs) {
      const hqCoords: [number, number] = [-115.14, 36.17];
      const arcsG = rootG.append('g').attr('class', 'fiber-arcs-layer');

      outletPoints
        .filter((pt) => pt.outlet.id !== 'news-drfun1-hq' && pt.isFilteredMatch)
        .forEach((pt) => {
          const lineFeature: GeoJSON.Feature<GeoJSON.LineString> = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [hqCoords, pt.coords],
            },
          };
          const isTuned = pt.outlet.id === tunedOutlet.id;
          const color = getRegionAccent(pt.outlet.region);

          arcsG
            .append('path')
            .datum(lineFeature)
            .attr('d', pathGenerator)
            .attr('fill', 'none')
            .attr('stroke', isTuned ? '#ef4444' : color)
            .attr('stroke-width', isTuned ? 2.2 : pt.outlet.isBreaking ? 1.25 : 0.75)
            .attr('stroke-opacity', isTuned ? 0.95 : pt.outlet.isBreaking ? 0.55 : 0.25)
            .attr('stroke-dasharray', isTuned ? 'none' : '4 4');
        });
    }

    // Outlet Pin Markers (Non-active dimmed first, active & tuned on top)
    const sortedPins = [...outletPoints].sort((a, b) => {
      if (a.outlet.id === tunedOutlet.id) return 1;
      if (b.outlet.id === tunedOutlet.id) return -1;
      return Number(a.isFilteredMatch) - Number(b.isFilteredMatch);
    });

    const pinsG = rootG.append('g').attr('class', 'outlet-pins-layer');
    sortedPins.forEach(({ outlet, coords, isFilteredMatch, isRegionActive }) => {
      const projected = projection(coords);
      if (!projected) return;
      const [px, py] = projected;
      const isTuned = outlet.id === tunedOutlet.id;
      const isActive = isFilteredMatch && isRegionActive;
      const shouldPulse = outlet.isBreaking || isTuned;
      if (showBreakingOnlyPulse && !outlet.isBreaking && !isTuned) return;

      const pinG = pinsG
        .append('g')
        .attr('transform', `translate(${px}, ${py})`)
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => {
          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltip({
            visible: true,
            x: mx,
            y: my,
            outlet,
          });
        })
        .on('mousemove', (event) => {
          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltip((prev) => ({ ...prev, x: mx, y: my }));
        })
        .on('mouseleave', () => {
          setTooltip((prev) => ({ ...prev, visible: false, outlet: undefined }));
        })
        .on('click', (event) => {
          event.stopPropagation();
          onTuneOutlet(outlet);
        });

      // Outer pulse ring for Breaking News & Tuned anchor outlet
      if (isActive && shouldPulse) {
        pinG
          .append('circle')
          .attr('r', isTuned ? 13 : 9)
          .attr('fill', isTuned ? '#ef4444' : outlet.accentColor)
          .attr('fill-opacity', isTuned ? 0.28 : 0.18)
          .attr('stroke', isTuned ? '#f87171' : outlet.accentColor)
          .attr('stroke-width', isTuned ? 1.5 : 1)
          .attr('stroke-opacity', 0.75);
      }

      // Main outlet pin circle
      pinG
        .append('circle')
        .attr('r', isTuned ? 6.5 : isActive ? 4.8 : 3.1)
        .attr('fill', isTuned ? '#ef4444' : outlet.accentColor)
        .attr('fill-opacity', isActive ? 0.98 : 0.25)
        .attr('stroke', isTuned ? '#ffffff' : '#020617')
        .attr('stroke-width', isTuned ? 1.8 : 1.1)
        .attr('filter', isTuned || (isActive && outlet.isBreaking) ? 'url(#drfun1-node-glow)' : null);

      // Show callsign label for tuned outlet or active regional breaking feeds
      if (isTuned || (activeRegion !== 'All' && isActive)) {
        pinG
          .append('text')
          .attr('y', isTuned ? -11 : -8)
          .attr('text-anchor', 'middle')
          .attr('font-size', isTuned ? '9.5px' : '8px')
          .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
          .attr('font-weight', '800')
          .attr('fill', isTuned ? '#fef08a' : '#f8fafc')
          .attr('stroke', '#020617')
          .attr('stroke-width', 2.4)
          .attr('paint-order', 'stroke')
          .text(outlet.callSign);
      }
    });
  }, [
    svgSize,
    outletPoints,
    activeRegion,
    hoveredRegion,
    tunedOutlet.id,
    showArcs,
    showBreakingOnlyPulse,
    regionCounts,
    onSelectRegion,
    onTuneOutlet,
  ]);

  const handleZoomControl = (factor: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, factor);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  return (
    <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header & Interactive Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-red-400" />
            <span>D3 Global News Coverage Map &amp; Regional Broadcast Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any world region to highlight active outlets and filter the directory below, or click any bureau marker pin to tune DrFun1 News Live TV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowArcs((v) => !v)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer ${
              showArcs
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>100G Relay Arcs</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBreakingOnlyPulse((v) => !v)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer ${
              showBreakingOnlyPulse
                ? 'bg-red-600/20 text-red-300 border-red-500/50'
                : 'bg-slate-950 text-slate-300 border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Breaking Pins Only</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => handleZoomControl(1.35)}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Zoom in world map"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoomControl(0.75)}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Zoom out world map"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Reset map zoom"
              title="Reset Map View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Synchronized Interactive Region Selector Strip */}
      <div className="flex flex-wrap items-center gap-1.5">
        {REGION_SUMMARY_ORDER.map((reg) => {
          const stats = regionCounts.get(reg) ?? { total: 0, breaking: 0, viewers: 0 };
          const selected = activeRegion === reg;
          return (
            <button
              key={reg}
              type="button"
              onClick={() => onSelectRegion(selected && reg !== 'All' ? 'All' : reg)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition flex items-center gap-1.5 cursor-pointer ${
                selected
                  ? 'bg-red-600 text-white border-red-500 font-bold shadow'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              <span>{reg}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] tabular-nums ${
                  selected ? 'bg-black/30 text-white' : 'bg-slate-900 text-cyan-300'
                }`}
              >
                {stats.total}
              </span>
              {stats.breaking > 0 && (
                <span className="text-[10px] text-amber-300 tabular-nums">
                  {stats.breaking}!
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Split: D3 World Map Canvas (8 cols) + Highlighted Region Bureaus Drawer (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div
          ref={containerRef}
          className="xl:col-span-8 relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden min-h-[340px]"
        >
          <svg
            ref={svgRef}
            width={svgSize.width}
            height={svgSize.height}
            viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
            className="w-full h-auto block select-none"
            role="img"
            aria-label="Interactive D3 world map of DrFun1 News global news outlets"
          />

          {/* Top-left Map Telemetry Pill */}
          <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap items-center gap-2 text-[10px] font-mono">
            <span className="px-2.5 py-1 rounded-md bg-slate-950/90 border border-slate-700 text-slate-200">
              Region: <strong className="text-cyan-300">{activeRegion}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-950/90 border border-slate-700 text-emerald-300 tabular-nums">
              {filteredOutlets.length} Active Outlets Highlighted
            </span>
          </div>

          {/* Bottom-left Map Legend */}
          <div className="pointer-events-none absolute bottom-3 left-3 hidden sm:flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-950/85 border border-slate-800 text-[10px] font-mono text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white/80 inline-block" />
              <span>Tuned ({tunedOutlet.callSign})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              <span>Active Bureau Pin</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-3 h-3 text-slate-400" />
              <span>Scroll/Drag to Pan &amp; Zoom</span>
            </span>
          </div>

          {/* Floating Interactive Hover Tooltip */}
          {tooltip.visible && (tooltip.outlet || tooltip.regionHover) && (
            <div
              className="pointer-events-none absolute z-20 max-w-xs rounded-xl bg-slate-950/95 border border-slate-700 p-3 shadow-2xl text-xs space-y-1"
              style={{
                left: Math.min(tooltip.x + 14, Math.max(12, svgSize.width - 250)),
                top: Math.max(12, tooltip.y - 18),
              }}
            >
              {tooltip.outlet ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-black text-slate-950"
                      style={{ backgroundColor: tooltip.outlet.accentColor }}
                    >
                      {tooltip.outlet.callSign}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300 tabular-nums">
                      {tooltip.outlet.viewers.toLocaleString()} live
                    </span>
                  </div>
                  <div className="font-bold text-white">{tooltip.outlet.name}</div>
                  <div className="text-[11px] font-mono text-cyan-300">
                    {tooltip.outlet.country} · {tooltip.outlet.region}
                  </div>
                  <div className="text-[11px] text-slate-300 line-clamp-2">
                    {tooltip.outlet.currentProgram}
                  </div>
                  <div className="text-[10px] font-mono text-amber-300 pt-0.5">
                    Click marker to watch on DrFun1 News
                  </div>
                </>
              ) : tooltip.regionHover ? (
                <>
                  <div className="font-bold text-white">{tooltip.regionHover.label}</div>
                  <div className="text-[11px] font-mono text-cyan-300">
                    {tooltip.regionHover.hubName}
                  </div>
                  <div className="text-[11px] text-slate-300 tabular-nums">
                    {regionCounts.get(tooltip.regionHover.region)?.total ?? 0} global outlets · Click to highlight &amp; filter
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Right Spotlight Panel: Active Outlets in Selected Region */}
        <div className="xl:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Map Region Spotlight
                </div>
                <div className="text-sm font-bold text-white">
                  {activeRegion === 'All' ? 'Top Global Broadcast Bureaus' : `${activeRegion} Active Outlets`}
                </div>
              </div>
              {activeRegion !== 'All' && (
                <button
                  type="button"
                  onClick={() => onSelectRegion('All')}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono text-cyan-300 cursor-pointer"
                >
                  Show All
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[285px] overflow-y-auto pr-1">
              {spotlightOutlets.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No outlets match the active directory filters for {activeRegion}.
                </div>
              ) : (
                spotlightOutlets.map((outlet) => {
                  const isTuned = outlet.id === tunedOutlet.id;
                  return (
                    <button
                      key={outlet.id}
                      type="button"
                      onClick={() => onTuneOutlet(outlet)}
                      className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2.5 ${
                        isTuned
                          ? 'bg-red-950/40 border-red-500/70'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="px-1.5 py-0.2 rounded text-[9.5px] font-black text-slate-950 shrink-0"
                            style={{ backgroundColor: outlet.accentColor }}
                          >
                            {outlet.callSign}
                          </span>
                          <span className="text-xs font-bold text-white truncate">
                            {outlet.name}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                          {outlet.country} · {outlet.currentProgram}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] font-mono font-bold text-emerald-300 tabular-nums">
                          {outlet.viewers.toLocaleString()}
                        </div>
                        <div className="text-[9.5px] font-mono text-red-400 flex items-center justify-end gap-0.5">
                          <MonitorPlay className="w-2.5 h-2.5" />
                          <span>{isTuned ? 'ON AIR' : 'Tune'}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
            <span>Origin: Switch SUPERNAP 100G</span>
            {onJumpToDirectory ? (
              <button
                type="button"
                onClick={onJumpToDirectory}
                className="text-cyan-300 hover:text-cyan-200 underline cursor-pointer tabular-nums"
              >
                View {filteredOutlets.length} in Directory ↓
              </button>
            ) : (
              <span className="text-cyan-300 tabular-nums">
                {filteredOutlets.length} of {allOutlets.length} listed below
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
