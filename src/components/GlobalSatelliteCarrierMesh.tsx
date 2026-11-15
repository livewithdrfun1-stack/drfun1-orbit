/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Global Satellite Carrier Mesh (D3.js Dynamic Topology & Latency Visualizer)
 * Dynamically renders active nodes and live-updating latency paths between:
 * - 500 www.switch.com Switch Hubs per hub (1,000 total across Hub 1 & Hub 2 via CGW Law Offices)
 * - 10 www.risingnet.com Dedicated Bare-Metal Optical Servers (R01-R10)
 * - 4 UnrealIRCd 6.1.4 Core Hubs (irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net, drfun1ircd.com)
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Activity,
  Cpu,
  Pause,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  ShieldCheck,
  Waypoints,
  Zap,
} from 'lucide-react';
import {
  ALL_1000_SWITCH_NODES,
  HUB1_500_SWITCH_NODES,
  HUB2_500_SWITCH_NODES,
  RISINGNET_10_DEDICATED_SERVERS,
} from '../data/unrealSearchData';
import { SwitchDedicatedNode } from '../types/irc';

type HubScope = 'hub1' | 'hub2' | 'dual';
type NodeHealth = 'active' | 'bursting' | 'rerouting';

interface SwitchSectorMeta {
  id: string;
  label: string;
  shortLabel: string;
  regionName: string;
  primaryRisingNetSids: string[];
  color: string;
}

const SWITCH_SECTORS: SwitchSectorMeta[] = [
  {
    id: 'sec_na',
    label: 'North America SUPERNAP',
    shortLabel: 'N. America',
    regionName: 'North America',
    primaryRisingNetSids: ['R02', 'R03', 'R05', 'R10', 'R06', 'R01', 'R08', 'R09'],
    color: '#22d3ee',
  },
  {
    id: 'sec_eu',
    label: 'Europe Optical Ring',
    shortLabel: 'Europe',
    regionName: 'Europe',
    primaryRisingNetSids: ['R01', 'R08', 'R06'],
    color: '#38bdf8',
  },
  {
    id: 'sec_apac',
    label: 'Asia-Pacific Subsea',
    shortLabel: 'APAC',
    regionName: 'Asia-Pacific',
    primaryRisingNetSids: ['R02', 'R03', 'R07'],
    color: '#818cf8',
  },
  {
    id: 'sec_latam',
    label: 'Latin America Carrier',
    shortLabel: 'LATAM',
    regionName: 'Latin America',
    primaryRisingNetSids: ['R04', 'R05', 'R09'],
    color: '#34d399',
  },
  {
    id: 'sec_mea',
    label: 'Middle East & Africa',
    shortLabel: 'MEA',
    regionName: 'Middle East & Africa',
    primaryRisingNetSids: ['R01', 'R04', 'R08'],
    color: '#fbbf24',
  },
  {
    id: 'sec_orbital',
    label: 'Orbital & Deep Space Teleports',
    shortLabel: 'Orbital/SATCOM',
    regionName: 'Orbital & Teleport',
    primaryRisingNetSids: ['R02', 'R07', 'R10', 'R04'],
    color: '#c084fc',
  },
];

interface LatencyPathRecord {
  id: string;
  sectorId: string;
  sectorLabel: string;
  risingNetSid: string;
  risingNetName: string;
  risingNetMetro: string;
  rttMs: number;
  jitterMs: number;
  throughputGbps: number;
  packetLossPct: number;
  status: 'optimal' | 'nominal' | 'elevated' | 'rerouted';
  isPrimary: boolean;
}

interface SectorRuntimeState {
  meta: SwitchSectorMeta;
  nodes: SwitchDedicatedNode[];
  activeCount: number;
  burstingCount: number;
  reroutingCount: number;
  avgRttMs: number;
  totalUsers: number;
}

interface RisingNetRuntimeState {
  server: SwitchDedicatedNode;
  liveLatencyMs: number;
  jitterMs: number;
  loadPct: number;
  attachedSwitchCount: number;
  status: NodeHealth;
  failoverActive: boolean;
}

interface HoverTooltipState {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  subtitle: string;
  metrics: { label: string; value: string; tone?: string }[];
}

function getLatencyStroke(rttMs: number, isRerouted: boolean): string {
  if (isRerouted) return '#f59e0b';
  if (rttMs < 20) return '#10b981';
  if (rttMs < 65) return '#06b6d4';
  if (rttMs < 115) return '#f59e0b';
  return '#f43f5e';
}

function getPathHealthLabel(rttMs: number, isRerouted: boolean): LatencyPathRecord['status'] {
  if (isRerouted) return 'rerouted';
  if (rttMs < 20) return 'optimal';
  if (rttMs < 65) return 'nominal';
  return 'elevated';
}

export const GlobalSatelliteCarrierMesh: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [hubScope, setHubScope] = useState<HubScope>('hub1');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [tick, setTick] = useState<number>(1);
  const [failoverSid, setFailoverSid] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{
    kind: 'risingnet' | 'sector' | 'node';
    id: string;
  } | null>(null);
  const [nodeSearch, setNodeSearch] = useState<string>('');
  const [svgSize, setSvgSize] = useState<{ width: number; height: number }>({
    width: 960,
    height: 580,
  });
  const [tooltip, setTooltip] = useState<HoverTooltipState>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    subtitle: '',
    metrics: [],
  });
  const [lastUpdatedUtc, setLastUpdatedUtc] = useState<string>(
    () => new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
  );

  // Measure responsive SVG wrapper via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 200) {
        setSvgSize({
          width: Math.max(580, Math.round(rect.width)),
          height: Math.max(540, Math.min(640, Math.round(rect.width * 0.56))),
        });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Real-time telemetry heartbeat (every 1.6s when active)
  useEffect(() => {
    if (!isStreaming) return;
    const id = window.setInterval(() => {
      setTick((prev) => prev + 1);
      setLastUpdatedUtc(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    }, 1600);
    return () => window.clearInterval(id);
  }, [isStreaming]);

  // Select raw Switch nodes based on scope (Hub 1 = 500, Hub 2 = 500, Dual = 1,000)
  const scopedSwitchNodes = useMemo<SwitchDedicatedNode[]>(() => {
    if (hubScope === 'hub1') return HUB1_500_SWITCH_NODES;
    if (hubScope === 'hub2') return HUB2_500_SWITCH_NODES;
    return ALL_1000_SWITCH_NODES;
  }, [hubScope]);

  // Deterministic per-tick micro-jitter + live node activity states
  const meshTelemetry = useMemo(() => {
    const sectorStates: SectorRuntimeState[] = [];
    const risingNetLoadMap = new Map<string, number>();
    RISINGNET_10_DEDICATED_SERVERS.forEach((rn) => risingNetLoadMap.set(rn.sid, 0));

    // Group all scoped Switch nodes into their exact 6 Switch sectors
    const grouped = new Map<string, SwitchDedicatedNode[]>();
    SWITCH_SECTORS.forEach((sec) => grouped.set(sec.regionName, []));
    for (const node of scopedSwitchNodes) {
      const key = node.region && grouped.has(node.region) ? node.region : 'North America';
      grouped.get(key)!.push(node);
    }

    // Track individual node states cleanly (always keeping >97% active, small dynamic bursting/rerouting pulse)
    const nodeStateById = new Map<string, { state: NodeHealth; liveRtt: number; targetRnSid: string }>();

    SWITCH_SECTORS.forEach((sec, secIdx) => {
      const nodes = grouped.get(sec.regionName) || [];
      let activeCount = 0;
      let burstingCount = 0;
      let reroutingCount = 0;
      let sumLat = 0;
      let totalUsers = 0;

      nodes.forEach((node, nIdx) => {
        // Pick deterministic RisingNet dedicated server target avoiding failoverSid if active
        const candidates = sec.primaryRisingNetSids.filter((sid) => sid !== failoverSid);
        const fallbackCandidates = candidates.length > 0 ? candidates : ['R02', 'R01'];
        const targetRnSid = fallbackCandidates[(nIdx + Math.floor(tick / 4)) % fallbackCandidates.length];

        // Dynamic wave perturbation per tick
        const phase = (tick * 0.85 + nIdx * 0.41 + secIdx * 1.1) % (Math.PI * 2);
        const jitter = Number((Math.sin(phase) * 1.8).toFixed(1));
        const reroutePenalty = failoverSid && sec.primaryRisingNetSids.includes(failoverSid) ? 3.6 : 0;
        const liveRtt = Math.max(1.2, Number((node.latencyMs + jitter + reroutePenalty).toFixed(1)));

        // Rolling micro-status wave across 500 nodes
        const waveSlot = (nIdx + tick * 7 + secIdx * 13) % 97;
        let state: NodeHealth = 'active';
        if (reroutePenalty > 0 && nIdx % 19 === tick % 19) {
          state = 'rerouting';
          reroutingCount++;
        } else if (waveSlot === 0 || waveSlot === 1) {
          state = 'bursting';
          burstingCount++;
          activeCount++; // bursting is still active and transmitting
        } else {
          activeCount++;
        }

        sumLat += liveRtt;
        totalUsers += node.usersOnline;
        risingNetLoadMap.set(targetRnSid, (risingNetLoadMap.get(targetRnSid) || 0) + 1);
        nodeStateById.set(node.id, { state, liveRtt, targetRnSid });
      });

      sectorStates.push({
        meta: sec,
        nodes,
        activeCount,
        burstingCount,
        reroutingCount,
        avgRttMs: nodes.length > 0 ? Number((sumLat / nodes.length).toFixed(1)) : 0,
        totalUsers,
      });
    });

    // Build live state for all 10 Dedicated RisingNet Servers
    const risingNetStates: RisingNetRuntimeState[] = RISINGNET_10_DEDICATED_SERVERS.map(
      (rn, idx) => {
        const isFailover = failoverSid === rn.sid;
        const phase = (tick * 0.9 + idx * 0.7) % (Math.PI * 2);
        const jitterMs = Number((0.18 + Math.abs(Math.cos(phase)) * 0.55).toFixed(2));
        const liveLatencyMs = Number(
          Math.max(
            1.8,
            rn.latencyMs + Math.sin(phase) * 1.1 + (isFailover ? 18.4 : 0)
          ).toFixed(1)
        );
        const attached = risingNetLoadMap.get(rn.sid) || 0;
        const loadPct = isFailover
          ? 12
          : Math.min(92, Math.max(24, Math.round(34 + (attached / Math.max(1, scopedSwitchNodes.length)) * 185 + Math.sin(phase) * 4)));

        return {
          server: rn,
          liveLatencyMs,
          jitterMs,
          loadPct,
          attachedSwitchCount: attached,
          status: isFailover ? 'rerouting' : (idx + tick) % 11 === 0 ? 'bursting' : 'active',
          failoverActive: isFailover,
        };
      }
    );

    const rnBySid = new Map(risingNetStates.map((r) => [r.server.sid, r]));

    // Build dynamic latency paths between Switch Hub Sectors & RisingNet Dedicated Servers
    const latencyPaths: LatencyPathRecord[] = [];
    sectorStates.forEach((secState, sIdx) => {
      // Connect each sector to its top 3 healthy RisingNet dedicated servers
      const activeTargets = secState.meta.primaryRisingNetSids.slice(0, 3);
      activeTargets.forEach((sid, tIdx) => {
        const isSidDown = failoverSid === sid;
        const actualSid = isSidDown
          ? RISINGNET_10_DEDICATED_SERVERS[(sIdx + tIdx + 2) % RISINGNET_10_DEDICATED_SERVERS.length].sid
          : sid;
        const rnState = rnBySid.get(actualSid);
        if (!rnState) return;

        const phase = (tick * 0.75 + sIdx * 0.9 + tIdx * 1.3) % (Math.PI * 2);
        const pathRtt = Number(
          Math.max(
            2.4,
            secState.avgRttMs * 0.68 + rnState.liveLatencyMs * 0.52 + Math.sin(phase) * 1.9 + (isSidDown ? 4.8 : 0)
          ).toFixed(1)
        );
        const jitter = Number((0.15 + Math.abs(Math.sin(phase * 1.4)) * 0.65).toFixed(2));
        const throughputGbps = Number(
          Math.max(18, Math.min(98.4, 54 + Math.cos(phase) * 18 - tIdx * 8)).toFixed(1)
        );

        latencyPaths.push({
          id: `${secState.meta.id}__${actualSid}`,
          sectorId: secState.meta.id,
          sectorLabel: secState.meta.shortLabel,
          risingNetSid: actualSid,
          risingNetName: rnState.server.name,
          risingNetMetro: rnState.server.location,
          rttMs: pathRtt,
          jitterMs: jitter,
          throughputGbps,
          packetLossPct: 0.0,
          status: getPathHealthLabel(pathRtt, isSidDown),
          isPrimary: tIdx === 0,
        });
      });
    });

    const totalSwitchActive = sectorStates.reduce((acc, s) => acc + s.activeCount, 0);
    const totalSwitchRerouting = sectorStates.reduce((acc, s) => acc + s.reroutingCount, 0);
    const totalRisingNetActive = risingNetStates.filter((r) => r.status !== 'rerouting').length;
    const avgMeshLatencyMs =
      latencyPaths.length > 0
        ? Number((latencyPaths.reduce((acc, p) => acc + p.rttMs, 0) / latencyPaths.length).toFixed(1))
        : 0;
    const totalBandwidthGbps = Number(
      latencyPaths.reduce((acc, p) => acc + p.throughputGbps, 0).toFixed(1)
    );

    return {
      sectorStates,
      risingNetStates,
      latencyPaths,
      nodeStateById,
      totalSwitchActive,
      totalSwitchRerouting,
      totalRisingNetActive,
      avgMeshLatencyMs,
      totalBandwidthGbps,
    };
  }, [scopedSwitchNodes, tick, failoverSid]);

  // Render and animate D3 Satellite Carrier Mesh inside SVG
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const { width, height } = svgSize;
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) * 0.45;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    // Unique scoped defs for optical glow & core gradients
    const defs = svg.append('defs');

    const glowFilter = defs
      .append('filter')
      .attr('id', 'mesh-optical-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '3.2').attr('result', 'blur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const bgGrad = defs
      .append('radialGradient')
      .attr('id', 'mesh-radar-bg')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '55%');
    bgGrad.append('stop').attr('offset', '0%').attr('stop-color', '#0f172a').attr('stop-opacity', 1);
    bgGrad.append('stop').attr('offset', '65%').attr('stop-color', '#090f1d').attr('stop-opacity', 1);
    bgGrad.append('stop').attr('offset', '100%').attr('stop-color', '#030712').attr('stop-opacity', 1);

    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('rx', 12)
      .attr('fill', 'url(#mesh-radar-bg)');

    // Root zoomable viewport layer
    const zoomRoot = svg.append('g').attr('class', 'mesh-zoom-root');

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.65, 3.2])
      .on('zoom', (event) => {
        zoomRoot.attr('transform', event.transform.toString());
      });

    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    const gCenter = zoomRoot.append('g').attr('transform', `translate(${cx}, ${cy})`);

    // Orbital telemetry range rings
    const ringRadii = [
      { r: maxRadius * 0.28, label: 'RISINGNET 10 DEDICATED OPTICAL RING', color: '#1e293b' },
      { r: maxRadius * 0.58, label: 'SWITCH 500-HUB SECTOR GATEWAYS', color: '#1e3a5f' },
      { r: maxRadius * 0.88, label: '500 SWITCH NODES CONSTELLATION PERIMETER', color: '#164e63' },
    ];

    ringRadii.forEach((ring) => {
      gCenter
        .append('circle')
        .attr('r', ring.r)
        .attr('fill', 'none')
        .attr('stroke', ring.color)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,5')
        .attr('opacity', 0.85);
    });

    // Subtle radial azimuth spokes (every 30 deg)
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = (deg * Math.PI) / 180;
      gCenter
        .append('line')
        .attr('x1', Math.cos(rad) * (maxRadius * 0.14))
        .attr('y1', Math.sin(rad) * (maxRadius * 0.14))
        .attr('x2', Math.cos(rad) * (maxRadius * 0.94))
        .attr('y2', Math.sin(rad) * (maxRadius * 0.94))
        .attr('stroke', '#1e293b')
        .attr('stroke-width', 0.7)
        .attr('opacity', 0.5);
    }

    // Compute exact coordinates for 10 RisingNet Dedicated Servers (Inner Ring)
    const rnCoords = new Map<string, { x: number; y: number; angle: number; state: RisingNetRuntimeState }>();
    const rnRadius = maxRadius * 0.28;
    meshTelemetry.risingNetStates.forEach((rnState, i) => {
      const angle = (i / meshTelemetry.risingNetStates.length) * Math.PI * 2 - Math.PI / 2;
      rnCoords.set(rnState.server.sid, {
        x: Math.cos(angle) * rnRadius,
        y: Math.sin(angle) * rnRadius,
        angle,
        state: rnState,
      });
    });

    // Compute exact coordinates for 6 Switch Hub Sectors (Mid Ring)
    const sectorCoords = new Map<string, { x: number; y: number; angle: number; state: SectorRuntimeState }>();
    const secRadius = maxRadius * 0.58;
    meshTelemetry.sectorStates.forEach((secState, i) => {
      const angle = (i / meshTelemetry.sectorStates.length) * Math.PI * 2 - Math.PI / 2 + 0.18;
      sectorCoords.set(secState.meta.id, {
        x: Math.cos(angle) * secRadius,
        y: Math.sin(angle) * secRadius,
        angle,
        state: secState,
      });
    });

    const isSelectedPath = (path: LatencyPathRecord) => {
      if (!selectedEntity) return true;
      if (selectedEntity.kind === 'risingnet') return path.risingNetSid === selectedEntity.id;
      if (selectedEntity.kind === 'sector') return path.sectorId === selectedEntity.id;
      return true;
    };

    // Layer 1: Core Hub <-> RisingNet Dedicated Server Trunks
    const trunksGroup = gCenter.append('g').attr('class', 'core-trunks');
    meshTelemetry.risingNetStates.forEach((rnState) => {
      const coord = rnCoords.get(rnState.server.sid);
      if (!coord) return;
      const dimmed =
        selectedEntity?.kind === 'risingnet' && selectedEntity.id !== rnState.server.sid;

      trunksGroup
        .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', coord.x)
        .attr('y2', coord.y)
        .attr('stroke', rnState.failoverActive ? '#f43f5e' : '#38bdf8')
        .attr('stroke-width', rnState.failoverActive ? 1 : 1.5)
        .attr('stroke-dasharray', rnState.failoverActive ? '3,4' : 'none')
        .attr('opacity', dimmed ? 0.14 : 0.48);
    });

    // Layer 2: Dynamic Latency Paths between 500 Switch Hub Sectors and 10 Dedicated RisingNet Servers
    const pathsGroup = gCenter.append('g').attr('class', 'latency-paths');
    const renderedPaths: {
      pathNode: SVGPathElement;
      record: LatencyPathRecord;
      strokeColor: string;
    }[] = [];

    meshTelemetry.latencyPaths.forEach((pathRec, idx) => {
      const secCoord = sectorCoords.get(pathRec.sectorId);
      const rnCoord = rnCoords.get(pathRec.risingNetSid);
      if (!secCoord || !rnCoord) return;

      const midX = (secCoord.x + rnCoord.x) * 0.5;
      const midY = (secCoord.y + rnCoord.y) * 0.5;
      const dx = rnCoord.x - secCoord.x;
      const dy = rnCoord.y - secCoord.y;
      const curveOffset = (idx % 2 === 0 ? 1 : -1) * 0.16;
      const ctrlX = midX - dy * curveOffset;
      const ctrlY = midY + dx * curveOffset;

      const dAttr = `M ${secCoord.x.toFixed(1)},${secCoord.y.toFixed(1)} Q ${ctrlX.toFixed(1)},${ctrlY.toFixed(1)} ${rnCoord.x.toFixed(1)},${rnCoord.y.toFixed(1)}`;
      const strokeColor = getLatencyStroke(pathRec.rttMs, pathRec.status === 'rerouted');
      const highlighted = isSelectedPath(pathRec);

      const pathEl = pathsGroup
        .append('path')
        .attr('d', dAttr)
        .attr('fill', 'none')
        .attr('stroke', strokeColor)
        .attr('stroke-width', pathRec.isPrimary ? (highlighted ? 2.4 : 1.2) : highlighted ? 1.6 : 0.9)
        .attr('stroke-dasharray', pathRec.status === 'rerouted' ? '6,4' : 'none')
        .attr('opacity', highlighted ? (pathRec.isPrimary ? 0.92 : 0.65) : 0.12)
        .attr('filter', highlighted && pathRec.isPrimary ? 'url(#mesh-optical-glow)' : 'none')
        .style('cursor', 'pointer')
        .on('mouseenter', (event: MouseEvent) => {
          const rect = svgEl.getBoundingClientRect();
          setTooltip({
            visible: true,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            title: `${pathRec.sectorLabel} ↔ ${pathRec.risingNetSid} (${pathRec.risingNetMetro})`,
            subtitle: 'Dedicated Optical Carrier Latency Path',
            metrics: [
              { label: 'Live RTT', value: `${pathRec.rttMs} ms`, tone: 'text-emerald-300' },
              { label: 'Jitter', value: `${pathRec.jitterMs} ms`, tone: 'text-cyan-300' },
              { label: 'Throughput', value: `${pathRec.throughputGbps} Gbps`, tone: 'text-sky-300' },
              { label: 'Packet Loss', value: `${pathRec.packetLossPct.toFixed(3)}%`, tone: 'text-emerald-400' },
            ],
          });
        })
        .on('mouseleave', () => setTooltip((prev) => ({ ...prev, visible: false })));

      const domNode = pathEl.node();
      if (domNode && highlighted) {
        renderedPaths.push({ pathNode: domNode, record: pathRec, strokeColor });
      }

      // Inline live RTT badge on primary highlighted paths
      if (pathRec.isPrimary && highlighted) {
        const labelX = 0.25 * secCoord.x + 0.5 * ctrlX + 0.25 * rnCoord.x;
        const labelY = 0.25 * secCoord.y + 0.5 * ctrlY + 0.25 * rnCoord.y;
        const badgeG = pathsGroup.append('g').attr('transform', `translate(${labelX}, ${labelY})`);
        badgeG
          .append('rect')
          .attr('x', -23)
          .attr('y', -9)
          .attr('width', 46)
          .attr('height', 18)
          .attr('rx', 4)
          .attr('fill', '#020617')
          .attr('stroke', strokeColor)
          .attr('stroke-width', 1)
          .attr('opacity', 0.92);
        badgeG
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', strokeColor)
          .attr('font-size', '9.5px')
          .attr('font-family', 'ui-monospace, monospace')
          .attr('font-weight', '700')
          .text(`${pathRec.rttMs}ms`);
      }
    });

    // Layer 3: Outer 500-Node Switch Constellation Dots (every node in the active Switch scope!)
    const outerNodesGroup = gCenter.append('g').attr('class', 'switch-500-ring');
    const arcSpan = (Math.PI * 2) / meshTelemetry.sectorStates.length;

    meshTelemetry.sectorStates.forEach((secState, sIdx) => {
      const secCoord = sectorCoords.get(secState.meta.id);
      if (!secCoord) return;
      const centerAngle = secCoord.angle;
      const usableArc = arcSpan * 0.8;
      const count = secState.nodes.length;
      const isSectorDimmed =
        selectedEntity?.kind === 'sector' && selectedEntity.id !== secState.meta.id;

      // Also draw delicate fiber collector ribs from sector gateway to outer cluster arc ends
      const arcStart = centerAngle - usableArc * 0.46;
      const arcEnd = centerAngle + usableArc * 0.46;
      const rBandInner = maxRadius * 0.82;
      const rBandOuter = maxRadius * 0.93;

      [arcStart, arcEnd].forEach((edgeAngle) => {
        outerNodesGroup
          .append('line')
          .attr('x1', secCoord.x)
          .attr('y1', secCoord.y)
          .attr('x2', Math.cos(edgeAngle) * rBandInner)
          .attr('y2', Math.sin(edgeAngle) * rBandInner)
          .attr('stroke', secState.meta.color)
          .attr('stroke-width', 0.7)
          .attr('opacity', isSectorDimmed ? 0.08 : 0.25);
      });

      secState.nodes.forEach((node, nIdx) => {
        const tier = nIdx % 3;
        const nodesInTier = Math.ceil(count / 3);
        const tierIndex = Math.floor(nIdx / 3);
        const frac = nodesInTier > 1 ? tierIndex / (nodesInTier - 1) - 0.5 : 0;
        const a = centerAngle + frac * usableArc;
        const r = rBandInner + (tier / 2) * (rBandOuter - rBandInner);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;

        const runtime = meshTelemetry.nodeStateById.get(node.id);
        const health = runtime?.state || 'active';
        const dotColor =
          health === 'rerouting'
            ? '#f59e0b'
            : health === 'bursting'
              ? '#38bdf8'
              : '#10b981';
        const isNodeSelected = selectedEntity?.kind === 'node' && selectedEntity.id === node.id;

        outerNodesGroup
          .append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', isNodeSelected ? 5 : health === 'active' ? (count > 600 ? 2.1 : 2.6) : 3.4)
          .attr('fill', dotColor)
          .attr('stroke', isNodeSelected ? '#ffffff' : '#020617')
          .attr('stroke-width', isNodeSelected ? 1.5 : 0.4)
          .attr('opacity', isSectorDimmed ? 0.2 : health === 'active' ? 0.85 : 1)
          .style('cursor', 'pointer')
          .on('mouseenter', (event: MouseEvent) => {
            const rect = svgEl.getBoundingClientRect();
            setTooltip({
              visible: true,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              title: `${node.host} (SID ${node.sid})`,
              subtitle: `Switch.com SUPERNAP · ${node.location}`,
              metrics: [
                { label: 'Node Health', value: health.toUpperCase(), tone: 'text-emerald-300' },
                { label: 'Live Latency', value: `${runtime?.liveRtt ?? node.latencyMs} ms`, tone: 'text-cyan-300' },
                { label: 'RisingNet Uplink', value: runtime?.targetRnSid || 'R02', tone: 'text-purple-300' },
                { label: 'Active Users', value: node.usersOnline.toLocaleString(), tone: 'text-slate-200' },
              ],
            });
          })
          .on('mouseleave', () => setTooltip((prev) => ({ ...prev, visible: false })))
          .on('click', (event: MouseEvent) => {
            event.stopPropagation();
            setSelectedEntity({ kind: 'node', id: node.id });
          });
      });
    });

    // Layer 4: 6 Switch Hub Sector Gateways (Mid Ring)
    const sectorGroup = gCenter.append('g').attr('class', 'switch-sector-gateways');
    meshTelemetry.sectorStates.forEach((secState) => {
      const coord = sectorCoords.get(secState.meta.id);
      if (!coord) return;
      const isSelected = selectedEntity?.kind === 'sector' && selectedEntity.id === secState.meta.id;

      const gSec = sectorGroup
        .append('g')
        .attr('transform', `translate(${coord.x}, ${coord.y})`)
        .style('cursor', 'pointer')
        .on('mouseenter', (event: MouseEvent) => {
          const rect = svgEl.getBoundingClientRect();
          setTooltip({
            visible: true,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            title: secState.meta.label,
            subtitle: `${secState.nodes.length} Switch.com Nodes Synced`,
            metrics: [
              { label: 'Active Nodes', value: `${secState.activeCount}/${secState.nodes.length}`, tone: 'text-emerald-300' },
              { label: 'Bursting', value: String(secState.burstingCount), tone: 'text-cyan-300' },
              { label: 'Avg RTT', value: `${secState.avgRttMs} ms`, tone: 'text-sky-300' },
              { label: 'Clients', value: secState.totalUsers.toLocaleString(), tone: 'text-slate-200' },
            ],
          });
        })
        .on('mouseleave', () => setTooltip((prev) => ({ ...prev, visible: false })))
        .on('click', (event: MouseEvent) => {
          event.stopPropagation();
          setSelectedEntity((prev) =>
            prev?.kind === 'sector' && prev.id === secState.meta.id
              ? null
              : { kind: 'sector', id: secState.meta.id }
          );
        });

      gSec
        .append('circle')
        .attr('r', isSelected ? 22 : 18)
        .attr('fill', '#0f172a')
        .attr('stroke', isSelected ? '#ffffff' : secState.meta.color)
        .attr('stroke-width', isSelected ? 2.5 : 2)
        .attr('filter', 'url(#mesh-optical-glow)');

      gSec
        .append('text')
        .attr('y', -2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f8fafc')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('font-family', 'ui-monospace, monospace')
        .text(`${secState.activeCount}`);

      gSec
        .append('text')
        .attr('y', 9)
        .attr('text-anchor', 'middle')
        .attr('fill', secState.meta.color)
        .attr('font-size', '7.5px')
        .attr('font-family', 'ui-monospace, monospace')
        .text('SWITCH');

      // Sector label placed slightly outside the gateway node
      const labelOffset = 30;
      const lx = Math.cos(coord.angle) * labelOffset;
      const ly = Math.sin(coord.angle) * labelOffset;
      gSec
        .append('text')
        .attr('x', lx)
        .attr('y', ly)
        .attr('text-anchor', Math.cos(coord.angle) >= 0.15 ? 'start' : Math.cos(coord.angle) <= -0.15 ? 'end' : 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', '#cbd5e1')
        .attr('font-size', '10.5px')
        .attr('font-weight', '700')
        .text(secState.meta.shortLabel);
    });

    // Layer 5: 10 Dedicated RisingNet Bare-Metal Optical Servers (Inner Ring)
    const rnGroup = gCenter.append('g').attr('class', 'risingnet-10-ring');
    meshTelemetry.risingNetStates.forEach((rnState) => {
      const coord = rnCoords.get(rnState.server.sid);
      if (!coord) return;
      const isSelected =
        selectedEntity?.kind === 'risingnet' && selectedEntity.id === rnState.server.sid;
      const ringColor = rnState.failoverActive
        ? '#f43f5e'
        : rnState.status === 'bursting'
          ? '#38bdf8'
          : '#10b981';

      const gRn = rnGroup
        .append('g')
        .attr('transform', `translate(${coord.x}, ${coord.y})`)
        .style('cursor', 'pointer')
        .on('mouseenter', (event: MouseEvent) => {
          const rect = svgEl.getBoundingClientRect();
          setTooltip({
            visible: true,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            title: `${rnState.server.sid} · ${rnState.server.location}`,
            subtitle: 'RisingNet 100G Optical Dedicated Server',
            metrics: [
              { label: 'Status', value: rnState.failoverActive ? 'REROUTED' : 'DEDICATED ACTIVE', tone: rnState.failoverActive ? 'text-rose-300' : 'text-emerald-300' },
              { label: 'Backbone RTT', value: `${rnState.liveLatencyMs} ms`, tone: 'text-cyan-300' },
              { label: 'Switch Links', value: `${rnState.attachedSwitchCount} nodes`, tone: 'text-sky-300' },
              { label: 'Link Load', value: `${rnState.loadPct}%`, tone: 'text-amber-300' },
            ],
          });
        })
        .on('mouseleave', () => setTooltip((prev) => ({ ...prev, visible: false })))
        .on('click', (event: MouseEvent) => {
          event.stopPropagation();
          setSelectedEntity((prev) =>
            prev?.kind === 'risingnet' && prev.id === rnState.server.sid
              ? null
              : { kind: 'risingnet', id: rnState.server.sid }
          );
        });

      gRn
        .append('circle')
        .attr('r', isSelected ? 17 : 14)
        .attr('fill', '#020617')
        .attr('stroke', isSelected ? '#ffffff' : ringColor)
        .attr('stroke-width', isSelected ? 2.5 : 2)
        .attr('filter', 'url(#mesh-optical-glow)');

      gRn
        .append('text')
        .attr('y', -1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', '#ffffff')
        .attr('font-size', '9.5px')
        .attr('font-weight', '800')
        .attr('font-family', 'ui-monospace, monospace')
        .text(rnState.server.sid);
    });

    // Layer 6: Central UnrealIRCd 6.1.4 + Satellite Carrier Core Hub
    const coreG = gCenter
      .append('g')
      .attr('class', 'core-satcom-hub')
      .style('cursor', 'pointer')
      .on('click', () => setSelectedEntity(null));

    coreG
      .append('circle')
      .attr('r', 36)
      .attr('fill', '#0f172a')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 2.4)
      .attr('filter', 'url(#mesh-optical-glow)');

    coreG
      .append('circle')
      .attr('r', 29)
      .attr('fill', '#020617')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    coreG
      .append('text')
      .attr('y', -7)
      .attr('text-anchor', 'middle')
      .attr('fill', '#38bdf8')
      .attr('font-size', '8.5px')
      .attr('font-weight', '800')
      .attr('font-family', 'ui-monospace, monospace')
      .text('SATCOM CORE');

    coreG
      .append('text')
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '9.5px')
      .attr('font-weight', '800')
      .attr('font-family', 'ui-monospace, monospace')
      .text(`${meshTelemetry.avgMeshLatencyMs} ms`);

    coreG
      .append('text')
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#10b981')
      .attr('font-size', '7.5px')
      .attr('font-family', 'ui-monospace, monospace')
      .text('4 HUBS SYNCED');

    // Layer 7: Smooth 60fps D3 Timer Optical Telemetry Pulses along active paths
    const pulseLayer = gCenter.append('g').attr('class', 'telemetry-pulses').style('pointer-events', 'none');
    const pulseDots = renderedPaths.map((item, idx) => {
      const len = item.pathNode.getTotalLength();
      const speed = Math.max(0.00035, 0.0011 - Math.min(0.00065, item.record.rttMs * 0.000005));
      const dot = pulseLayer
        .append('circle')
        .attr('r', item.record.isPrimary ? 3.4 : 2.5)
        .attr('fill', item.strokeColor)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.8)
        .attr('opacity', 0.95);
      return { ...item, len, speed, offset: (idx * 0.27) % 1, dot };
    });

    let timer: d3.Timer | null = null;
    if (isStreaming && pulseDots.length > 0) {
      timer = d3.timer((elapsed) => {
        for (let i = 0; i < pulseDots.length; i++) {
          const p = pulseDots[i];
          const progress = (p.offset + elapsed * p.speed) % 1;
          const pt = p.pathNode.getPointAtLength(progress * p.len);
          p.dot.attr('cx', pt.x).attr('cy', pt.y);
        }
      });
    } else {
      // Static mid-path markers when paused
      for (const p of pulseDots) {
        const pt = p.pathNode.getPointAtLength(p.len * 0.5);
        p.dot.attr('cx', pt.x).attr('cy', pt.y);
      }
    }

    return () => {
      if (timer) timer.stop();
    };
  }, [svgSize, meshTelemetry, selectedEntity, isStreaming]);

  const handleResetZoom = () => {
    const svgEl = svgRef.current;
    if (svgEl && zoomBehaviorRef.current) {
      d3.select(svgEl).transition().duration(350).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
    setSelectedEntity(null);
  };

  // Filtered individual Switch hub inspection list (out of 500 or 1,000 Switch hubs)
  const inspectedNodes = useMemo(() => {
    let base = scopedSwitchNodes;
    if (selectedEntity?.kind === 'sector') {
      const sec = SWITCH_SECTORS.find((s) => s.id === selectedEntity.id);
      if (sec) base = base.filter((n) => n.region === sec.regionName);
    } else if (selectedEntity?.kind === 'risingnet') {
      base = base.filter((n) => meshTelemetry.nodeStateById.get(n.id)?.targetRnSid === selectedEntity.id);
    } else if (selectedEntity?.kind === 'node') {
      const picked = base.find((n) => n.id === selectedEntity.id);
      if (picked) {
        return [picked];
      }
    }

    const q = nodeSearch.trim().toLowerCase();
    if (q) {
      base = base.filter(
        (n) =>
          n.host.toLowerCase().includes(q) ||
          n.location.toLowerCase().includes(q) ||
          n.sid.toLowerCase().includes(q) ||
          (n.region || '').toLowerCase().includes(q)
      );
    }
    return base.slice(0, 12);
  }, [scopedSwitchNodes, selectedEntity, meshTelemetry.nodeStateById, nodeSearch]);

  const filteredLatencyPaths = useMemo(() => {
    if (!selectedEntity) return meshTelemetry.latencyPaths;
    if (selectedEntity.kind === 'sector') {
      return meshTelemetry.latencyPaths.filter((p) => p.sectorId === selectedEntity.id);
    }
    if (selectedEntity.kind === 'risingnet') {
      return meshTelemetry.latencyPaths.filter((p) => p.risingNetSid === selectedEntity.id);
    }
    const targetRn = meshTelemetry.nodeStateById.get(selectedEntity.id)?.targetRnSid;
    return targetRn
      ? meshTelemetry.latencyPaths.filter((p) => p.risingNetSid === targetRn)
      : meshTelemetry.latencyPaths;
  }, [meshTelemetry.latencyPaths, meshTelemetry.nodeStateById, selectedEntity]);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/30 to-emerald-600/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Waypoints className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Global Satellite Carrier Mesh
              </h3>
              <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300 uppercase whitespace-nowrap">
                D3.js Live Optical Topology
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300 uppercase whitespace-nowrap flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isStreaming ? 'STREAMING · 1.6s' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time D3 carrier mesh plotting <strong className="text-slate-200">{scopedSwitchNodes.length.toLocaleString()}</strong> active Switch.com hubs (500/Hub via CGW Law Offices) &amp; <strong className="text-slate-200">10</strong> dedicated RisingNet optical bare-metal servers ({lastUpdatedUtc}).
            </p>
          </div>
        </div>

        {/* Interactive Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            {(
              [
                { id: 'hub1', label: 'Hub 1 (500 Switch)' },
                { id: 'hub2', label: 'Hub 2 (500 Switch)' },
                { id: 'dual', label: 'Dual-Hub (1,000)' },
              ] as { id: HubScope; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setHubScope(opt.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                  hubScope === opt.id
                    ? 'bg-cyan-600/25 text-cyan-200 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsStreaming((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              isStreaming
                ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border-amber-500/40'
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          <button
            onClick={() => {
              setTick((prev) => prev + 1);
              setLastUpdatedUtc(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Probe Mesh</span>
          </button>

          <button
            onClick={() =>
              setFailoverSid((prev) => {
                if (prev) return null;
                const idx = tick % RISINGNET_10_DEDICATED_SERVERS.length;
                return RISINGNET_10_DEDICATED_SERVERS[idx].sid;
              })
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              failoverSid
                ? 'bg-rose-950/70 hover:bg-rose-900/70 text-rose-200 border-rose-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
            }`}
            title="Test automatic RisingNet optical path rerouting across the 500 Switch hubs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{failoverSid ? `Clear Reroute (${failoverSid})` : 'Test Failover Reroute'}</span>
          </button>

          <button
            onClick={handleResetZoom}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-mono transition flex items-center gap-1 whitespace-nowrap cursor-pointer"
            title="Reset zoom and selection"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Live KPI Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Active Switch Hubs</div>
          <div className="text-lg font-mono font-bold text-emerald-400 tabular-nums mt-0.5">
            {meshTelemetry.totalSwitchActive.toLocaleString()}
            <span className="text-xs text-slate-500 font-normal"> / {scopedSwitchNodes.length.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">RisingNet Dedicated</div>
          <div className="text-lg font-mono font-bold text-cyan-400 tabular-nums mt-0.5">
            {meshTelemetry.totalRisingNetActive}
            <span className="text-xs text-slate-500 font-normal"> / 10 Bare-Metal</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Active Latency Paths</div>
          <div className="text-lg font-mono font-bold text-sky-300 tabular-nums mt-0.5">
            {meshTelemetry.latencyPaths.length}
            <span className="text-xs text-slate-500 font-normal"> Optical Trunks</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Mean Mesh RTT</div>
          <div className="text-lg font-mono font-bold text-emerald-300 tabular-nums mt-0.5">
            {meshTelemetry.avgMeshLatencyMs} ms
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Mesh Carrier Flow</div>
          <div className="text-lg font-mono font-bold text-purple-300 tabular-nums mt-0.5">
            {meshTelemetry.totalBandwidthGbps} Gbps
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Rerouting / Packet Loss</div>
          <div className="text-lg font-mono font-bold text-amber-300 tabular-nums mt-0.5">
            {meshTelemetry.totalSwitchRerouting}
            <span className="text-xs text-emerald-400 font-normal"> · 0.000% Loss</span>
          </div>
        </div>
      </div>

      {/* Main Layout: D3 Mesh Canvas + RisingNet & Latency Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left: Interactive D3 SVG Constellation */}
        <div className="xl:col-span-8 space-y-3">
          <div
            ref={containerRef}
            className="relative w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner"
          >
            <svg
              ref={svgRef}
              width={svgSize.width}
              height={svgSize.height}
              className="block w-full select-none"
            />

            {/* Floating Legend Overlay */}
            <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap items-center gap-2 bg-slate-950/85 backdrop-blur-sm border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> &lt;20ms Optimal
              </span>
              <span className="flex items-center gap-1 text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> 20–65ms Nominal
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> 65ms+ / Reroute
              </span>
              <span className="flex items-center gap-1 text-sky-300">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> Bursting Node
              </span>
            </div>

            <div className="pointer-events-none absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-sm border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-400">
              Scroll to zoom · Drag to pan · Click any RisingNet server (R01–R10), Switch sector, or outer node to isolate paths
            </div>

            {/* Interactive Hover Tooltip */}
            {tooltip.visible && (
              <div
                className="pointer-events-none absolute z-20 w-64 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-lg p-3 shadow-2xl"
                style={{
                  left: Math.min(Math.max(12, tooltip.x + 14), svgSize.width - 270),
                  top: Math.min(Math.max(12, tooltip.y - 18), svgSize.height - 150),
                }}
              >
                <div className="text-xs font-bold text-white truncate">{tooltip.title}</div>
                <div className="text-[10px] font-mono text-cyan-300 mt-0.5 truncate">{tooltip.subtitle}</div>
                <div className="mt-2 pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  {tooltip.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="text-slate-500">{m.label}</div>
                      <div className={`font-bold tabular-nums ${m.tone || 'text-slate-200'}`}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 10 Dedicated RisingNet Bare-Metal Selector Strip */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>10 Dedicated RisingNet Optical Servers (www.risingnet.com)</span>
              </div>
              {selectedEntity && (
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {meshTelemetry.risingNetStates.map((rn) => {
                const isSelected =
                  selectedEntity?.kind === 'risingnet' && selectedEntity.id === rn.server.sid;
                return (
                  <button
                    key={rn.server.sid}
                    onClick={() =>
                      setSelectedEntity((prev) =>
                        prev?.kind === 'risingnet' && prev.id === rn.server.sid
                          ? null
                          : { kind: 'risingnet', id: rn.server.sid }
                      )
                    }
                    className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400/70'
                        : rn.failoverActive
                          ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-400'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                      <span className={rn.failoverActive ? 'text-rose-300' : 'text-white'}>
                        {rn.server.sid}
                      </span>
                      <span className="text-emerald-400 tabular-nums">{rn.liveLatencyMs}ms</span>
                    </div>
                    <div className="text-[11px] text-slate-300 truncate mt-0.5">
                      {rn.server.location.split(',')[0]}
                    </div>
                    <div className="text-[9.5px] font-mono text-slate-500 tabular-nums mt-0.5">
                      {rn.attachedSwitchCount} Switch · {rn.loadPct}%
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Active Latency Paths & 500 Switch Hub Drilldown */}
        <div className="xl:col-span-4 space-y-4">
          {/* Live Optical Latency Paths Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Latency Paths ({filteredLatencyPaths.length})</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">100G DWDM</span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {filteredLatencyPaths.map((p) => {
                const color = getLatencyStroke(p.rttMs, p.status === 'rerouted');
                return (
                  <div
                    key={p.id}
                    className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/90 flex items-center justify-between gap-2 text-[11px] font-mono"
                  >
                    <div className="min-w-0">
                      <div className="text-white font-bold truncate">
                        {p.sectorLabel} → {p.risingNetSid}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {p.risingNetMetro} · Jitter {p.jitterMs}ms
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold tabular-nums" style={{ color }}>
                        {p.rttMs} ms
                      </div>
                      <div className="text-[9.5px] text-slate-400 tabular-nums">
                        {p.throughputGbps} Gbps
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 500 Switch Hubs Sector Breakdown & Search */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Switch 500-Hub Node Inspector</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                Dedicated Bare-Metal
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={nodeSearch}
                onChange={(e) => setNodeSearch(e.target.value)}
                placeholder="Filter 500 Switch hubs by SID, city, or host..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {inspectedNodes.map((n) => {
                const rt = meshTelemetry.nodeStateById.get(n.id);
                const state = rt?.state || 'active';
                return (
                  <button
                    key={n.id}
                    onClick={() => setSelectedEntity({ kind: 'node', id: n.id })}
                    className={`w-full text-left p-2 rounded-lg border transition cursor-pointer ${
                      selectedEntity?.kind === 'node' && selectedEntity.id === n.id
                        ? 'bg-cyan-500/15 border-cyan-400/60'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                      <span className="text-white font-bold truncate flex items-center gap-1.5">
                        <Radio
                          className={`w-3 h-3 shrink-0 ${
                            state === 'rerouting'
                              ? 'text-amber-400'
                              : state === 'bursting'
                                ? 'text-sky-400'
                                : 'text-emerald-400'
                          }`}
                        />
                        <span className="truncate">{n.host}</span>
                      </span>
                      <span className="text-emerald-300 font-bold tabular-nums shrink-0">
                        {rt?.liveRtt ?? n.latencyMs} ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                      <span className="truncate">
                        SID {n.sid} · {n.location}
                      </span>
                      <span className="text-cyan-300 shrink-0">→ {rt?.targetRnSid || 'R02'}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                CGW Law Offices · www.wittlawfirm.com
              </span>
              <span>TLS 1.3 · 4 Hubs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
