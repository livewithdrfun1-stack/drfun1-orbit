/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Satellite Tracking & Pass Prediction Types
 */

export interface TrackedSatellite {
  id: string;
  name: string;
  noradId: number;
  category: 'Space Stations' | 'LEO Broadband' | 'Direct Broadcast (DBS)' | 'Scientific & Weather' | 'Earth Observation' | 'Navigation';
  constellation?: 'Starlink' | 'OneWeb' | 'O3b mPOWER' | 'Iridium' | 'AST SpaceMobile' | 'GEO DBS' | 'Space Stations' | 'GPS' | 'Scientific' | string;
  operator: string;
  orbitType: 'LEO' | 'MEO' | 'GEO';
  altitudeKm: number;
  velocityKmS: number;
  inclinationDeg: number;
  periodMinutes: number;
  footprintRadiusKm: number;
  downlinkFreqMHz: number;
  uplinkBand: string;
  currentLat: number;
  currentLon: number;
  tleLine1: string;
  tleLine2: string;
  color: string;
  description: string;
  beamType?: string;
  spotBeamsCount?: number;
  passPredictionsEnabled: boolean;
}

export interface ObserverStation {
  id: string;
  name: string;
  location: string;
  lat: number;
  lon: number;
  elevationM: number;
  isCustom?: boolean;
}

export interface SkyTrackPoint {
  azimuthDeg: number;
  elevationDeg: number;
  timestamp: string;
  rangeKm: number;
}

export interface SatellitePassPrediction {
  id: string;
  satelliteId: string;
  satelliteName: string;
  noradId: number;
  observerStationId: string;
  observerName: string;
  aosTime: string; // Acquisition of Signal (Rise)
  tcaTime: string; // Time of Closest Approach (Peak)
  losTime: string; // Loss of Signal (Set)
  aosAzimuthDeg: number;
  aosCompass: string;
  maxElevationDeg: number;
  losAzimuthDeg: number;
  losCompass: string;
  durationSeconds: number;
  apparentMagnitude: number;
  visibility: 'Visible (Naked Eye)' | 'Twilight Pass' | 'Daylight Pass' | 'Radio / Radar Only';
  maxDopplerShiftKHz: number;
  skyTrackPoints: SkyTrackPoint[];
  inProgress?: boolean;
}
