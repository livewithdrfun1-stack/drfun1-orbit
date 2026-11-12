/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Satellite Fleet Status & TLE Change Alert Types
 */

export type TleAlertSeverity = 'info' | 'maneuver' | 'warning' | 'critical';

export interface TleDeltaMetrics {
  oldEpoch: string;
  newEpoch: string;
  deltaAltitudeKm: number; // e.g. +1.4 or -0.8 km
  deltaMeanMotion: number; // revs/day change
  deltaInclinationDeg: number;
  deltaBstarDrag: string;
  stationKeepingManeuver: boolean;
  conjunctionRisk: 'None' | 'Monitored' | 'Avoidance Maneuver Executed';
}

export interface SatelliteFleetAlert {
  id: string;
  satelliteId: string;
  satelliteName: string;
  noradId: number;
  constellation: 'Starlink' | 'OneWeb' | 'O3b mPOWER' | 'Iridium' | 'AST SpaceMobile' | 'GEO DBS' | 'Space Stations' | 'GPS';
  operator: string;
  timestamp: string; // ISO date or formatted
  secondsAgo: number;
  severity: TleAlertSeverity;
  eventCategory: 'epoch_update' | 'station_keeping_burn' | 'collision_avoidance' | 'solar_drag_adjustment' | 'plane_rephasing' | 'rf_transponder_sync';
  title: string;
  message: string;
  oldTleLine1?: string;
  oldTleLine2?: string;
  newTleLine1: string;
  newTleLine2: string;
  deltaMetrics: TleDeltaMetrics;
  isRead: boolean;
  acknowledged: boolean;
}

export interface FleetConstellationSummary {
  constellationName: string;
  operator: string;
  activeSatellites: number;
  orbitType: 'LEO' | 'MEO' | 'GEO';
  primaryFrequency: string;
  status: 'nominal' | 'maneuver_in_progress' | 'telemetry_sync' | 'solar_storm_alert';
  lastEpochUpdate: string;
  tleChanges24h: number;
  badgeColor: string;
}
