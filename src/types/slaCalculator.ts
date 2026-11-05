/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Type definitions for Satellite Carrier SLA Uptime Credit Calculator
 */

import { SatelliteCompany } from './satellite';

export type SlaTierPreset = '99.5' | '99.9' | '99.95' | '99.99' | '99.999';

export interface SlaTargetOption {
  tier: SlaTierPreset;
  label: string;
  uptimePercent: number;
  allowedDowntimeMinutes: number;
  description: string;
}

export type OutageCauseType = 
  | 'rain_fade'
  | 'orbital_handover'
  | 'teleport_backhaul'
  | 'transponder_trip'
  | 'solar_conjunction'
  | 'bgp_interconnect';

export interface OutageCauseOption {
  id: OutageCauseType;
  label: string;
  category: 'Atmospheric' | 'Constellation' | 'Ground Segment' | 'Spacecraft' | 'Network';
  fccReportable: boolean;
  notes: string;
}

export interface SlaCreditCalculation {
  selectedCompany: SatelliteCompany | null;
  monthlySpendUsd: number;
  targetUptimePercent: number;
  allowedDowntimeMinutes: number;
  actualDowntimeMinutes: number;
  actualUptimePercent: number;
  excessDowntimeMinutes: number;
  creditPercent: number;
  creditAmountUsd: number;
  netInvoiceDueUsd: number;
  isBreached: boolean;
  claimId: string;
  outageCause: OutageCauseType;
  incidentNotes: string;
  generatedDate: string;
}
