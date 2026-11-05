/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Satellite Industry SLA Configurations, Outage Causes, and Calculation Engine
 */

import { SatelliteCompany } from '../types/satellite';
import { 
  SlaTargetOption, 
  OutageCauseOption, 
  SlaCreditCalculation, 
  OutageCauseType 
} from '../types/slaCalculator';

export const MINUTES_IN_BILLING_MONTH = 43200; // 30 days * 24 hours * 60 minutes

export const SLA_TARGET_OPTIONS: SlaTargetOption[] = [
  {
    tier: '99.5',
    label: '99.5% — LEO Broadband & Mobile Priority',
    uptimePercent: 99.5,
    allowedDowntimeMinutes: 216.0, // 3h 36m
    description: 'Standard consumer/enterprise best-effort LEO constellation tier with dynamic beam scheduling.',
  },
  {
    tier: '99.9',
    label: '99.9% — Three Nines (Commercial Enterprise)',
    uptimePercent: 99.9,
    allowedDowntimeMinutes: 43.2, // 43m 12s
    description: 'Industry benchmark for commercial satellite broadband, enterprise cellular backhaul, and maritime trunking.',
  },
  {
    tier: '99.95',
    label: '99.95% — Committed Information Rate (CIR)',
    uptimePercent: 99.95,
    allowedDowntimeMinutes: 21.6, // 21m 36s
    description: 'Guaranteed transponder throughput with dual-teleport gateway diversity.',
  },
  {
    tier: '99.99',
    label: '99.99% — Four Nines (Broadcast & Telecommunications)',
    uptimePercent: 99.99,
    allowedDowntimeMinutes: 4.32, // 4m 19s
    description: 'Master control DVB linear playout, primary carrier transit, and Switch SUPERNAP fiber cross-connect standard.',
  },
  {
    tier: '99.999',
    label: '99.999% — Five Nines (Mission Critical / Defense)',
    uptimePercent: 99.999,
    allowedDowntimeMinutes: 0.43, // 26 seconds
    description: 'High-reliability defense, automated emergency broadcast (EAS), and aeronautical safety of flight.',
  },
];

export const OUTAGE_CAUSE_OPTIONS: OutageCauseOption[] = [
  {
    id: 'rain_fade',
    label: 'Ka/Ku Atmospheric Rain Fade & Severe Weather',
    category: 'Atmospheric',
    fccReportable: false,
    notes: 'Severe convective cloud absorption or heavy precipitation exceeding link margin.',
  },
  {
    id: 'orbital_handover',
    label: 'Constellation Optical Inter-Satellite Laser Handover Glitch',
    category: 'Constellation',
    fccReportable: false,
    notes: 'LEO/MEO satellite boundary transition drop or laser ISL mesh routing recalculation.',
  },
  {
    id: 'teleport_backhaul',
    label: 'Ground Teleport Fiber Cut or Gateway Power Loss',
    category: 'Ground Segment',
    fccReportable: true,
    notes: 'Terrestrial gateway fiber cut, BGP transit failure, or teleport UPS failure.',
  },
  {
    id: 'transponder_trip',
    label: 'Traveling Wave Tube Amplifier (TWTA) / Transponder Trip',
    category: 'Spacecraft',
    fccReportable: true,
    notes: 'Spacecraft payload overload, power bus trip, or single-event upset anomaly.',
  },
  {
    id: 'solar_conjunction',
    label: 'Equinox Sun Transit / Solar Conjunction Blinding',
    category: 'Atmospheric',
    fccReportable: false,
    notes: 'Periodic alignment where solar radio noise swamps downlink dish reception.',
  },
  {
    id: 'bgp_interconnect',
    label: 'Carrier Core BGP Peering Flap (Switch SUPERNAP NV)',
    category: 'Network',
    fccReportable: false,
    notes: 'Autonomous system interconnect routing table convergence failure.',
  },
];

export interface OutageScenarioPreset {
  id: string;
  label: string;
  downtimeHours: number;
  downtimeMinutes: number;
  cause: OutageCauseType;
  description: string;
}

export const OUTAGE_SCENARIO_PRESETS: OutageScenarioPreset[] = [
  {
    id: 'solar_transit',
    label: 'Equinox Solar Transit (25 mins)',
    downtimeHours: 0,
    downtimeMinutes: 25,
    cause: 'solar_conjunction',
    description: 'Biannual sun-satellite-earth alignment causing thermal RF blinding.',
  },
  {
    id: 'storm_fade',
    label: 'Severe Hurricane Teleport Fade (1h 45m)',
    downtimeHours: 1,
    downtimeMinutes: 45,
    cause: 'rain_fade',
    description: 'Catastrophic rain cell over primary uplink teleport without secondary diversity.',
  },
  {
    id: 'laser_mesh',
    label: 'LEO Intersatellite Mesh Routing Loop (3h 20m)',
    downtimeHours: 3,
    downtimeMinutes: 20,
    cause: 'orbital_handover',
    description: 'Constellation-wide optical laser ISL routing failure across orbital planes.',
  },
  {
    id: 'teleport_cut',
    label: 'Terrestrial Gateway Fiber Cut (6h 30m)',
    downtimeHours: 6,
    downtimeMinutes: 30,
    cause: 'teleport_backhaul',
    description: 'Physical fiber severance between earth station and regional carrier POP.',
  },
  {
    id: 'transponder_out',
    label: 'Major Transponder Thermal Lockout (12h 00m)',
    downtimeHours: 12,
    downtimeMinutes: 0,
    cause: 'transponder_trip',
    description: 'Payload TWTA power supply fault requiring ground telecommand recovery.',
  },
];

/**
 * Recommends nominal monthly contract spend based on company orbit and offerings
 */
export function estimateNominalMonthlySpend(company: SatelliteCompany): number {
  if (company.orbitType === 'GEO') {
    // 36 MHz transponder lease typically $22k - $35k/mo
    return 24500;
  }
  if (company.orbitType === 'MEO' || company.name.toLowerCase().includes('ses')) {
    // Dedicated CIR multi-gigabit trunk
    return 16500;
  }
  if (company.orbitType === 'LEO') {
    if (company.name.toLowerCase().includes('starlink')) {
      return 5000; // Multi-terminal Priority 2TB business trunk
    }
    return 8000; // Enterprise LEO trunk
  }
  if (company.orbitType === 'Ground Segment') {
    return 3500; // Teleport cross-connect & co-location
  }
  return 6500;
}

/**
 * Calculates SLA Uptime credits based on standard satellite industry credit schedules:
 * 
 * - Actual Uptime >= Target SLA: 0% Credit (SLA met)
 * - Actual Uptime < Target SLA down to 99.5%: 10% Credit
 * - 99.0% <= Actual Uptime < 99.5%: 25% Credit
 * - 98.0% <= Actual Uptime < 99.0%: 50% Credit
 * - Actual Uptime < 98.0%: 100% Credit (Full invoice credit)
 */
export function calculateSlaCreditResult(
  company: SatelliteCompany | null,
  monthlySpendUsd: number,
  targetUptimePercent: number,
  downtimeMinutes: number,
  outageCause: OutageCauseType,
  incidentNotes: string = ''
): SlaCreditCalculation {
  const allowedDowntimeMinutes = (1 - targetUptimePercent / 100) * MINUTES_IN_BILLING_MONTH;
  const actualUptimePercent = Math.max(
    0,
    ((MINUTES_IN_BILLING_MONTH - downtimeMinutes) / MINUTES_IN_BILLING_MONTH) * 100
  );
  const excessDowntimeMinutes = Math.max(0, downtimeMinutes - allowedDowntimeMinutes);
  const isBreached = downtimeMinutes > allowedDowntimeMinutes;

  let creditPercent = 0;

  if (isBreached) {
    if (actualUptimePercent < 98.0) {
      creditPercent = 100; // Catastrophic breach
    } else if (actualUptimePercent < 99.0) {
      creditPercent = 50;
    } else if (actualUptimePercent < 99.5) {
      creditPercent = 25;
    } else {
      creditPercent = 10;
    }
  }

  const creditAmountUsd = Math.round((monthlySpendUsd * (creditPercent / 100)) * 100) / 100;
  const netInvoiceDueUsd = Math.max(0, monthlySpendUsd - creditAmountUsd);

  // Generate unique deterministic claim reference ID
  const hash = Math.abs(
    (company?.id || 'gen')
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0), 0) + Math.round(downtimeMinutes * 31)
  ) % 9000 + 1000;

  const claimId = `SLA-CLAIM-2026-${hash}`;

  return {
    selectedCompany: company,
    monthlySpendUsd,
    targetUptimePercent,
    allowedDowntimeMinutes: Math.round(allowedDowntimeMinutes * 100) / 100,
    actualDowntimeMinutes: Math.round(downtimeMinutes * 10) / 10,
    actualUptimePercent: Math.round(actualUptimePercent * 1000) / 1000,
    excessDowntimeMinutes: Math.round(excessDowntimeMinutes * 10) / 10,
    creditPercent,
    creditAmountUsd,
    netInvoiceDueUsd,
    isBreached,
    claimId,
    outageCause,
    incidentNotes,
    generatedDate: new Date().toISOString(),
  };
}
