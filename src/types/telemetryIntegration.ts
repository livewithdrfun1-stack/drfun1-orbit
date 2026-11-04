export type TelemetryDataFormat = 'tle' | 'json' | 'ccsds' | 'geojson' | 'csv';

export type TelemetryConnectionStatus = 'connected' | 'polling' | 'idle' | 'error';

export interface SatelliteApiProvider {
  id: string;
  name: string;
  agency: string;
  category: 'Orbital Tracking & TLE' | 'Space Weather & Solar Physics' | 'Open Ground Station Networks' | 'Live Astronautics & Vectors' | 'Debris & Situational Awareness' | 'Broadcast Linear & MVPD Cable/Sat APIs' | 'Direct Broadcast Satellite (DBS)' | 'OTT & Live Sports Streaming' | string;
  description: string;
  baseUrl: string;
  sampleEndpoint: string;
  documentationUrl: string;
  supportedFormats: TelemetryDataFormat[];
  accessModel: '100% Free Public Open API' | 'Open Community Network' | 'US Government Open Data' | 'Scientific Open Access' | 'Tier-1 Broadcast Open Access' | 'Public Open API' | string;
  defaultUpdateIntervalSec: number;
  iconType: 'celestrak' | 'nasa' | 'noaa' | 'satnogs' | 'opennotify' | 'esa' | 'fubo' | 'comcast' | 'mediacom' | 'dish' | string;
  corsSupported: boolean;
  proxyRequired: boolean;
}

export interface TelemetryConnectionConfig {
  id: string;
  name: string;
  providerId: string;
  endpointUrl: string;
  format: TelemetryDataFormat;
  updateIntervalSec: number;
  noradFilter: string; // e.g. "25544, 44713, 33591" or "starlink"
  groundStationId: string; // e.g. "switch_lasvegas"
  elevationMaskDeg: number; // e.g. 10
  dopplerCompensation: boolean;
  autoRelayToIrc: boolean;
  ircChannel: string; // e.g. "#space"
  status: TelemetryConnectionStatus;
  lastSyncedAt: string;
  activeSatellitesCount: number;
  latencyMs: number;
  packetsReceived: number;
  proxyRoute: string;
  notes?: string;
  enabled: boolean;
}

export interface DecodedTelemetryPacket {
  id: string;
  connectionId: string;
  satelliteName: string;
  noradId: number;
  timestamp: string;
  latitude: number;
  longitude: number;
  altitudeKm: number;
  velocityKmS: number;
  azimuthDeg: number;
  elevationDeg: number;
  dopplerShiftKHz: number;
  footprintDiameterKm: number;
  signalSnrDb: number;
  downlinkFreqMHz: number;
  rawPayloadPreview: string;
}

export interface GroundStationNode {
  id: string;
  name: string;
  operator: string;
  location: string;
  lat: number;
  lon: number;
  elevationM: number;
  dishApertureM: number;
  supportedBands: string[];
  switchCampus: string;
  status: 'online' | 'tracking' | 'calibrating';
  activeUplink: boolean;
}
