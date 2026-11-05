/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * High-Fidelity Satellite Latency & SLA Time-Series Generator for D3 Visualization
 */

import { SatelliteCompany, OrbitType } from '../types/satellite';

export type TimeHorizon = '1h' | '24h' | '7d' | '30d';

export interface LatencyDataPoint {
  timestamp: Date;
  latencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  gateway: string;
}

export interface OperatorLatencySeries {
  companyId: string;
  companyName: string;
  orbitType: OrbitType;
  color: string;
  baseLatencyMs: number;
  points: LatencyDataPoint[];
  p50Ms: number;
  p95Ms: number;
  minMs: number;
  maxMs: number;
  avgPacketLoss: number;
}

// Distinct high-contrast palette optimized for dark backgrounds (Tailwind slate-950)
export const OPERATOR_CHART_COLORS = [
  '#38bdf8', // Sky 400
  '#34d399', // Emerald 400
  '#c084fc', // Purple 400
  '#fbbf24', // Amber 400
  '#f43f5e', // Rose 500
  '#22d3ee', // Cyan 400
  '#a3e635', // Lime 400
  '#fb923c', // Orange 400
];

const GROUND_GATEWAYS = [
  'Switch SUPERNAP NV (Core)',
  'Citadel Tahoe-Reno (Tahoe Campus)',
  'Goldstone DSN Teleport (CA)',
  'Atlanta Media Gateway (GA)',
  'Frankfurt DE-CIX Interconnect',
  'Tokyo Equinix TY3 Teleport',
];

/**
 * Extracts a numeric nominal latency from the company's latencyMs string or orbitType.
 */
export function extractNominalLatencyMs(company: SatelliteCompany): number {
  const str = company.latencyMs || '';
  
  // Specific known operators
  const nameLower = company.name.toLowerCase();
  if (nameLower.includes('starlink')) return 28;
  if (nameLower.includes('oneweb')) return 35;
  if (nameLower.includes('kuiper')) return 32;
  if (nameLower.includes('telesat lightspeed')) return 36;
  if (nameLower.includes('iridium')) return 42;
  if (nameLower.includes('globalstar')) return 45;
  if (nameLower.includes('o3b') || nameLower.includes('ses')) {
    if (company.orbitType === 'MEO' || company.orbitType === 'Hybrid') return 135;
  }
  if (nameLower.includes('viasat')) return 590;
  if (nameLower.includes('echostar') || nameLower.includes('dish')) return 580;
  if (nameLower.includes('intelsat')) return 575;
  if (nameLower.includes('eutelsat') && company.orbitType === 'GEO') return 585;

  // Extract first number found
  const matches = str.match(/\d+/g);
  if (matches && matches.length > 0) {
    const nums = matches.map(Number);
    if (nums.length >= 2) {
      return Math.round((nums[0] + nums[1]) / 2);
    }
    return nums[0];
  }

  // Fallback by orbit regime
  switch (company.orbitType) {
    case 'LEO':
      return 32;
    case 'MEO':
      return 140;
    case 'GEO':
      return 580;
    case 'Hybrid':
      return 160;
    case 'Ground Segment':
      return 12;
    default:
      return 50;
  }
}

/**
 * Generates realistic time-series points based on physical orbit mechanics,
 * constellation handover frequency, and diurnal gateway traffic.
 */
export function generateOperatorLatencySeries(
  company: SatelliteCompany,
  horizon: TimeHorizon,
  colorIndex: number,
  now: Date = new Date()
): OperatorLatencySeries {
  const baseMs = extractNominalLatencyMs(company);
  const color = OPERATOR_CHART_COLORS[colorIndex % OPERATOR_CHART_COLORS.length];
  const points: LatencyDataPoint[] = [];

  // Determine step and total samples
  let sampleCount = 60;
  let intervalMs = 60 * 1000; // 1 min

  if (horizon === '24h') {
    sampleCount = 24;
    intervalMs = 60 * 60 * 1000; // 1 hour
  } else if (horizon === '7d') {
    sampleCount = 28;
    intervalMs = 6 * 60 * 60 * 1000; // 6 hours
  } else if (horizon === '30d') {
    sampleCount = 30;
    intervalMs = 24 * 60 * 60 * 1000; // 24 hours
  }

  const startTime = new Date(now.getTime() - sampleCount * intervalMs);
  const isLeo = company.orbitType === 'LEO';
  const isMeo = company.orbitType === 'MEO';
  const isGeo = company.orbitType === 'GEO';

  // Deterministic seed based on company id characters
  const seed = company.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  for (let i = 0; i <= sampleCount; i++) {
    const pointTime = new Date(startTime.getTime() + i * intervalMs);
    const minute = pointTime.getMinutes() + pointTime.getHours() * 60;
    const hour = pointTime.getHours();

    // 1. Orbital Handover ripple (LEO has frequent 8-12 min handovers; MEO has 1-2h; GEO has none)
    let handoverDelta = 0;
    if (isLeo) {
      // 10-minute cycle wave with small jitter
      const cycle = Math.sin(((minute + seed % 13) / 10) * Math.PI * 2);
      handoverDelta = cycle * 4.5 + Math.cos(i * 0.4) * 2;
    } else if (isMeo) {
      // 90-minute wave
      const cycle = Math.sin(((minute + seed % 29) / 90) * Math.PI * 2);
      handoverDelta = cycle * 8.0;
    } else if (isGeo) {
      // Very slight diurnal variation during terrestrial peak hours (18:00 - 22:00)
      const peakHourFactor = Math.exp(-Math.pow((hour - 20) / 3, 2));
      handoverDelta = peakHourFactor * 14.0 + (Math.sin(i * 0.2) * 3);
    }

    // 2. High frequency micro-jitter (atmospheric / rain fade / modulation)
    const microJitter = ((Math.sin(i * 1.7 + seed) * 1000) % 1) * (isLeo ? 3.5 : 7.0);

    // 3. Occasional isolated packet queuing blip (1 in 15 chance)
    const isBlip = ((i * 7 + seed) % 17 === 0);
    const blipDelta = isBlip ? (isLeo ? 12 : 28) : 0;

    const rawLatency = Math.max(8, baseMs + handoverDelta + microJitter + blipDelta);
    const latencyMs = Math.round(rawLatency * 10) / 10;
    const jitterMs = Math.round((Math.abs(handoverDelta * 0.4) + Math.abs(microJitter) + 1.2) * 10) / 10;
    const packetLossPercent = isBlip ? (isLeo ? 0.4 : 0.8) : Math.round((0.02 + Math.abs(Math.sin(i * 0.3)) * 0.08) * 100) / 100;

    const gatewayIndex = Math.abs((Math.floor(i / 10) + seed) % GROUND_GATEWAYS.length);

    points.push({
      timestamp: pointTime,
      latencyMs,
      jitterMs,
      packetLossPercent,
      gateway: GROUND_GATEWAYS[gatewayIndex],
    });
  }

  // Calculate statistics
  const latencies = points.map((p) => p.latencyMs).sort((a, b) => a - b);
  const minMs = latencies[0];
  const maxMs = latencies[latencies.length - 1];
  const p50Ms = latencies[Math.floor(latencies.length * 0.5)];
  const p95Ms = latencies[Math.floor(latencies.length * 0.95)];
  const avgPacketLoss = Math.round((points.reduce((acc, p) => acc + p.packetLossPercent, 0) / points.length) * 100) / 100;

  return {
    companyId: company.id,
    companyName: company.name,
    orbitType: company.orbitType,
    color,
    baseLatencyMs: baseMs,
    points,
    p50Ms,
    p95Ms,
    minMs,
    maxMs,
    avgPacketLoss,
  };
}
