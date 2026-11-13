/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Historical TLE Latency & Uptime Trends Data Generator
 * Top 5 Tracked Constellations Fleet Stability Analytics
 */

import {
  TrackedConstellationMeta,
  ConstellationStabilityPoint,
  FleetStabilityMetricType,
  StabilityTimeWindow
} from '../types/satelliteFleetAlerts';

export const TOP_5_TRACKED_CONSTELLATIONS: TrackedConstellationMeta[] = [
  {
    id: 'starlink',
    name: 'SpaceX Starlink Gen2 & Direct-to-Cell',
    shortName: 'Starlink V2',
    operator: 'SpaceX / Starlink',
    orbitType: 'LEO (550 km)',
    altitudeKm: 550,
    activeSatellites: 6850,
    color: '#38bdf8', // Sky Blue
    primaryFrequency: 'Ku/Ka-Band & 3GPP PCS G-Block',
    baselineLatencyMin: 4.2,
    baselineUptimePct: 99.96,
    baselineStabilityScore: 98.4,
    tleUpdateInterval: 'Every 20–30 min',
    description: 'Megaconstellation with autonomous argon electric propulsion & laser crosslinks'
  },
  {
    id: 'oneweb',
    name: 'Eutelsat OneWeb Polar Enterprise',
    shortName: 'OneWeb Polar',
    operator: 'Eutelsat OneWeb',
    orbitType: 'LEO (1,200 km)',
    altitudeKm: 1200,
    activeSatellites: 634,
    color: '#a855f7', // Purple
    primaryFrequency: 'Ku/Ka-Band Enterprise Trunking',
    baselineLatencyMin: 8.4,
    baselineUptimePct: 99.98,
    baselineStabilityScore: 99.1,
    tleUpdateInterval: 'Every 45–60 min',
    description: 'High-altitude polar orbit mesh with high ephemeris stability and minimal atmospheric drag'
  },
  {
    id: 'o3b',
    name: 'SES O3b mPOWER MEO Gigabit',
    shortName: 'O3b mPOWER',
    operator: 'SES S.A.',
    orbitType: 'MEO (8,062 km)',
    altitudeKm: 8062,
    activeSatellites: 8,
    color: '#ec4899', // Pink / Rose
    primaryFrequency: 'Ka-Band Electronically Steerable Beams',
    baselineLatencyMin: 11.8,
    baselineUptimePct: 99.92,
    baselineStabilityScore: 95.8,
    tleUpdateInterval: 'Every 2–3 hours',
    description: 'Equatorial MEO constellation providing ultra-high-throughput CIR dedicated trunks'
  },
  {
    id: 'iridium',
    name: 'Iridium NEXT & Certus Safety',
    shortName: 'Iridium NEXT',
    operator: 'Iridium Communications',
    orbitType: 'LEO (780 km)',
    altitudeKm: 780,
    activeSatellites: 66,
    color: '#10b981', // Emerald Green
    primaryFrequency: 'L-Band 1616–1626.5 MHz Mobile Safety',
    baselineLatencyMin: 5.9,
    baselineUptimePct: 99.995,
    baselineStabilityScore: 99.7,
    tleUpdateInterval: 'Every 60–90 min',
    description: 'Cross-linked polar constellation delivering 5-Nines safety for maritime GMDSS & aviation'
  },
  {
    id: 'astSpaceMobile',
    name: 'AST SpaceMobile BlueBird Direct 5G',
    shortName: 'BlueBird 5G',
    operator: 'AST SpaceMobile / AT&T & Verizon',
    orbitType: 'LEO (510 km)',
    altitudeKm: 510,
    activeSatellites: 5,
    color: '#f59e0b', // Amber / Gold
    primaryFrequency: '850/700 MHz Commercial Cellular NTN',
    baselineLatencyMin: 14.6,
    baselineUptimePct: 99.86,
    baselineStabilityScore: 94.2,
    tleUpdateInterval: 'Every 45 min',
    description: 'Massive 693 sq ft planar phased array antennas delivering direct-to-standard-phone 5G'
  }
];

export interface MetricDefinition {
  id: FleetStabilityMetricType;
  label: string;
  shortLabel: string;
  unit: string;
  description: string;
  slaTarget: number;
  slaLabel: string;
  higherIsBetter: boolean;
  minY: number;
  maxY: number;
  formatter: (val: number) => string;
}

export const METRIC_DEFINITIONS: Record<FleetStabilityMetricType, MetricDefinition> = {
  tle_latency: {
    id: 'tle_latency',
    label: 'TLE Radar Ingestion Latency',
    shortLabel: 'TLE Latency',
    unit: 'min',
    description: 'Radar ephemeris propagation time from Space-Track radar update to Switch SUPERNAP Teleport ingest',
    slaTarget: 15.0,
    slaLabel: 'Max Acceptable Latency SLA (15.0 min)',
    higherIsBetter: false,
    minY: 0,
    maxY: 20,
    formatter: (val) => `${val.toFixed(1)}m`
  },
  uptime_pct: {
    id: 'uptime_pct',
    label: 'Fleet Constellation Uptime & Link Availability',
    shortLabel: 'Fleet Uptime',
    unit: '%',
    description: 'Continuous RF transponder beam lock and telemetry ground link availability across passes',
    slaTarget: 99.90,
    slaLabel: 'Carrier Grade 3-Nines SLA (99.90%)',
    higherIsBetter: true,
    minY: 99.70,
    maxY: 100.00,
    formatter: (val) => `${val.toFixed(3)}%`
  },
  stability_score: {
    id: 'stability_score',
    label: 'Orbital Ephemeris Stability Index',
    shortLabel: 'Stability Score',
    unit: 'pts',
    description: 'Composite vector stability scoring orbital perturbation, low drift rate, and burn precision (0–100)',
    slaTarget: 95.0,
    slaLabel: 'Target Flight Envelope Score (95.0)',
    higherIsBetter: true,
    minY: 90,
    maxY: 100,
    formatter: (val) => `${val.toFixed(1)} pts`
  },
  orbit_drift: {
    id: 'orbit_drift',
    label: 'Along-Track Orbital Position Drift',
    shortLabel: 'Orbital Drift',
    unit: 'km',
    description: 'Semi-major axis variation and along-track drift before station-keeping reaction control burn',
    slaTarget: 1.5,
    slaLabel: 'Max Deviation Threshold (1.5 km)',
    higherIsBetter: false,
    minY: 0,
    maxY: 2.5,
    formatter: (val) => `${val.toFixed(2)} km`
  }
};

// Generates time labels and epoch IDs
function formatTimeLabel(timestampMs: number, window: StabilityTimeWindow): { label: string; epoch: string } {
  const d = new Date(timestampMs);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();

  const dayOfYear = Math.floor((timestampMs - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  const fractionalDay = (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400;
  const epoch = `26${String(dayOfYear).padStart(3, '0')}.${(fractionalDay * 10000).toFixed(0).padStart(4, '0')}`;

  if (window === 'live') {
    return { label: `${hours}:${minutes}:${seconds}`, epoch };
  } else if (window === '1h' || window === '6h') {
    return { label: `${hours}:${minutes}`, epoch };
  } else if (window === '24h') {
    return { label: `${hours}:00`, epoch };
  } else {
    return { label: `${month} ${day} ${hours}:00`, epoch };
  }
}

// Generate realistic points for the requested window & metric
export function generateStabilityData(
  window: StabilityTimeWindow,
  metric: FleetStabilityMetricType
): ConstellationStabilityPoint[] {
  const points: ConstellationStabilityPoint[] = [];
  const now = Date.now();

  let count = 20;
  let intervalMs = 3000; // 3 sec for live

  if (window === '1h') {
    count = 14;
    intervalMs = 5 * 60 * 1000; // 5 min
  } else if (window === '6h') {
    count = 16;
    intervalMs = 25 * 60 * 1000; // 25 min
  } else if (window === '24h') {
    count = 24;
    intervalMs = 60 * 60 * 1000; // 1 hour
  } else if (window === '7d') {
    count = 15;
    intervalMs = 12 * 60 * 60 * 1000; // 12 hours
  }

  // Baseline seeds per constellation
  const baseVals: Record<string, number> = {
    starlink:
      metric === 'tle_latency' ? 4.2 : metric === 'uptime_pct' ? 99.96 : metric === 'stability_score' ? 98.4 : 0.35,
    oneweb:
      metric === 'tle_latency' ? 8.4 : metric === 'uptime_pct' ? 99.98 : metric === 'stability_score' ? 99.1 : 0.18,
    o3b:
      metric === 'tle_latency' ? 11.8 : metric === 'uptime_pct' ? 99.92 : metric === 'stability_score' ? 95.8 : 0.65,
    iridium:
      metric === 'tle_latency' ? 5.9 : metric === 'uptime_pct' ? 99.995 : metric === 'stability_score' ? 99.7 : 0.08,
    astSpaceMobile:
      metric === 'tle_latency' ? 14.6 : metric === 'uptime_pct' ? 99.86 : metric === 'stability_score' ? 94.2 : 0.85
  };

  for (let i = count - 1; i >= 0; i--) {
    const t = now - i * intervalMs;
    const { label, epoch } = formatTimeLabel(t, window);

    // Natural sinusoidal wave + small random fluctuation for realistic physical telemetry
    const phase = (count - i) * 0.45;
    const noise = () => (Math.sin(phase + Math.random() * 0.5) * 0.5 + (Math.random() - 0.5) * 0.3);

    let starlinkVal: number;
    let onewebVal: number;
    let o3bVal: number;
    let iridiumVal: number;
    let astVal: number;

    let hasEvent = false;
    let eventDescription: string | undefined;
    let eventConstellation: string | undefined;

    // Inject 1-2 realistic maneuver events in historical windows
    if (i === 6) {
      hasEvent = true;
      eventConstellation = 'Starlink';
      eventDescription = 'Starlink-3142 Argon Thruster Orbit Raise (+1.4 km)';
    } else if (i === 12 && (window === '24h' || window === '7d')) {
      hasEvent = true;
      eventConstellation = 'O3b mPOWER';
      eventDescription = 'O3b mPOWER-7 Solar Drag Delta Correction';
    }

    if (metric === 'tle_latency') {
      starlinkVal = Number(Math.max(2.8, Math.min(8.5, baseVals.starlink + noise() * 0.7 + (i === 6 ? 2.4 : 0))).toFixed(2));
      onewebVal = Number(Math.max(5.5, Math.min(11.0, baseVals.oneweb + noise() * 0.6)).toFixed(2));
      o3bVal = Number(Math.max(9.0, Math.min(15.5, baseVals.o3b + noise() * 1.1 + (i === 12 ? 2.1 : 0))).toFixed(2));
      iridiumVal = Number(Math.max(4.5, Math.min(7.5, baseVals.iridium + noise() * 0.4)).toFixed(2));
      astVal = Number(Math.max(11.0, Math.min(18.0, baseVals.astSpaceMobile + noise() * 1.3)).toFixed(2));
    } else if (metric === 'uptime_pct') {
      starlinkVal = Number(Math.min(100.0, Math.max(99.88, baseVals.starlink + noise() * 0.02 - (i === 6 ? 0.04 : 0))).toFixed(3));
      onewebVal = Number(Math.min(100.0, Math.max(99.94, baseVals.oneweb + noise() * 0.015)).toFixed(3));
      o3bVal = Number(Math.min(100.0, Math.max(99.82, baseVals.o3b + noise() * 0.035 - (i === 12 ? 0.06 : 0))).toFixed(3));
      iridiumVal = Number(Math.min(100.0, Math.max(99.985, baseVals.iridium + noise() * 0.005)).toFixed(3));
      astVal = Number(Math.min(100.0, Math.max(99.75, baseVals.astSpaceMobile + noise() * 0.04)).toFixed(3));
    } else if (metric === 'stability_score') {
      starlinkVal = Number(Math.min(100.0, Math.max(94.0, baseVals.starlink + noise() * 0.8)).toFixed(1));
      onewebVal = Number(Math.min(100.0, Math.max(96.0, baseVals.oneweb + noise() * 0.5)).toFixed(1));
      o3bVal = Number(Math.min(100.0, Math.max(91.0, baseVals.o3b + noise() * 1.2)).toFixed(1));
      iridiumVal = Number(Math.min(100.0, Math.max(98.0, baseVals.iridium + noise() * 0.3)).toFixed(1));
      astVal = Number(Math.min(100.0, Math.max(90.0, baseVals.astSpaceMobile + noise() * 1.5)).toFixed(1));
    } else {
      // orbit_drift (km)
      starlinkVal = Number(Math.max(0.05, Math.min(1.2, baseVals.starlink + noise() * 0.15 + (i === 6 ? 0.45 : 0))).toFixed(2));
      onewebVal = Number(Math.max(0.04, Math.min(0.6, baseVals.oneweb + noise() * 0.08)).toFixed(2));
      o3bVal = Number(Math.max(0.15, Math.min(1.8, baseVals.o3b + noise() * 0.22 + (i === 12 ? 0.4 : 0))).toFixed(2));
      iridiumVal = Number(Math.max(0.02, Math.min(0.35, baseVals.iridium + noise() * 0.04)).toFixed(2));
      astVal = Number(Math.max(0.2, Math.min(2.1, baseVals.astSpaceMobile + noise() * 0.28)).toFixed(2));
    }

    const fleetAverage = Number(
      ((starlinkVal + onewebVal + o3bVal + iridiumVal + astVal) / 5).toFixed(
        metric === 'uptime_pct' ? 3 : 2
      )
    );

    points.push({
      timestamp: new Date(t).toISOString(),
      timeLabel: label,
      epochId: epoch,
      starlink: starlinkVal,
      oneweb: onewebVal,
      o3b: o3bVal,
      iridium: iridiumVal,
      astSpaceMobile: astVal,
      fleetAverage,
      hasEvent,
      eventDescription,
      eventConstellation
    });
  }

  return points;
}

// Generate single next point for real-time live streaming
export function generateNextLiveStabilityPoint(
  prevPoint: ConstellationStabilityPoint,
  metric: FleetStabilityMetricType
): ConstellationStabilityPoint {
  const now = Date.now();
  const { label, epoch } = formatTimeLabel(now, 'live');

  const drift = (step: number) => (Math.random() - 0.5) * step;

  let starlinkVal = prevPoint.starlink;
  let onewebVal = prevPoint.oneweb;
  let o3bVal = prevPoint.o3b;
  let iridiumVal = prevPoint.iridium;
  let astVal = prevPoint.astSpaceMobile;

  if (metric === 'tle_latency') {
    starlinkVal = Number(Math.max(2.8, Math.min(8.0, starlinkVal + drift(0.3))).toFixed(2));
    onewebVal = Number(Math.max(6.0, Math.min(11.0, onewebVal + drift(0.25))).toFixed(2));
    o3bVal = Number(Math.max(9.0, Math.min(15.5, o3bVal + drift(0.4))).toFixed(2));
    iridiumVal = Number(Math.max(4.8, Math.min(7.2, iridiumVal + drift(0.2))).toFixed(2));
    astVal = Number(Math.max(11.5, Math.min(18.0, astVal + drift(0.5))).toFixed(2));
  } else if (metric === 'uptime_pct') {
    starlinkVal = Number(Math.min(100.0, Math.max(99.88, starlinkVal + drift(0.008))).toFixed(3));
    onewebVal = Number(Math.min(100.0, Math.max(99.94, onewebVal + drift(0.006))).toFixed(3));
    o3bVal = Number(Math.min(100.0, Math.max(99.82, o3bVal + drift(0.012))).toFixed(3));
    iridiumVal = Number(Math.min(100.0, Math.max(99.99, iridiumVal + drift(0.003))).toFixed(3));
    astVal = Number(Math.min(100.0, Math.max(99.78, astVal + drift(0.015))).toFixed(3));
  } else if (metric === 'stability_score') {
    starlinkVal = Number(Math.min(100.0, Math.max(94.0, starlinkVal + drift(0.4))).toFixed(1));
    onewebVal = Number(Math.min(100.0, Math.max(96.0, onewebVal + drift(0.3))).toFixed(1));
    o3bVal = Number(Math.min(100.0, Math.max(92.0, o3bVal + drift(0.5))).toFixed(1));
    iridiumVal = Number(Math.min(100.0, Math.max(98.5, iridiumVal + drift(0.2))).toFixed(1));
    astVal = Number(Math.min(100.0, Math.max(91.0, astVal + drift(0.6))).toFixed(1));
  } else {
    // drift (km)
    starlinkVal = Number(Math.max(0.08, Math.min(1.1, starlinkVal + drift(0.05))).toFixed(2));
    onewebVal = Number(Math.max(0.05, Math.min(0.5, onewebVal + drift(0.03))).toFixed(2));
    o3bVal = Number(Math.max(0.18, Math.min(1.6, o3bVal + drift(0.08))).toFixed(2));
    iridiumVal = Number(Math.max(0.02, Math.min(0.3, iridiumVal + drift(0.02))).toFixed(2));
    astVal = Number(Math.max(0.25, Math.min(1.9, astVal + drift(0.09))).toFixed(2));
  }

  const fleetAverage = Number(
    ((starlinkVal + onewebVal + o3bVal + iridiumVal + astVal) / 5).toFixed(
      metric === 'uptime_pct' ? 3 : 2
    )
  );

  return {
    timestamp: new Date(now).toISOString(),
    timeLabel: label,
    epochId: epoch,
    starlink: starlinkVal,
    oneweb: onewebVal,
    o3b: o3bVal,
    iridium: iridiumVal,
    astSpaceMobile: astVal,
    fleetAverage
  };
}
