/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 */

export type NewsOutletRegion =
  | 'Global Wire'
  | 'North America'
  | 'Europe'
  | 'Middle East'
  | 'Asia-Pacific'
  | 'Latin America'
  | 'Africa';

export type NewsOutletCategory =
  | '24/7 Cable News'
  | 'Public Broadcaster'
  | 'Wire & Financial'
  | 'Judicial & Policy'
  | 'Science & Satcom';

export interface GlobalNewsOutlet {
  id: string;
  callSign: string;
  name: string;
  country: string;
  region: NewsOutletRegion;
  language: string;
  category: NewsOutletCategory;
  headquarters: string;
  website: string;
  streamUrl: string;
  hlsFeedUrl: string;
  secondaryMirrorUrls?: string[];
  currentProgram: string;
  anchorOrDesk: string;
  headline: string;
  isBreaking: boolean;
  status: 'ON AIR' | 'STANDBY';
  bitrateMbps: number;
  viewers: number;
  codec: 'AV1 4K60' | 'VP9 HDR' | 'H.264 1080p60';
  switchIngestPop: string;
  accentColor: string;
  isUserAdded?: boolean;
}

export interface DrFun1NewsBulletin {
  id: string;
  outletCallSign: string;
  region: NewsOutletRegion;
  headline: string;
  priority: 'FLASH' | 'URGENT' | 'WORLD DESK';
  timestamp: string;
  author: string;
}

export interface NewsOutletEpgSlot {
  id: string;
  windowType: 'now' | 'next' | 'later';
  timeRange: string;
  title: string;
  deskOrHost: string;
  synopsis: string;
  isLive: boolean;
}

export interface NewsOutletEpgRow {
  outlet: GlobalNewsOutlet;
  channelNumber: number;
  progressPct: number;
  slots: [NewsOutletEpgSlot, NewsOutletEpgSlot, NewsOutletEpgSlot];
}

export type NewsStreamSourceType = 'satellite' | 'web' | 'local' | 'fiber';

export interface NewsStreamSourceProfile {
  id: NewsStreamSourceType;
  label: string;
  shortLabel: string;
  protocol: string;
  baseLatencyMs: number;
  bitrateMultiplier: number;
  codecLabel: string;
  signalLabel: string;
  description: string;
  accentHex: string;
  badgeClass: string;
}

export type StreamConnectionPhase =
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'mirror_active'
  | 'failed';

export interface StreamMirrorEndpoint {
  tier: 'primary' | 'secondary' | 'tertiary';
  label: string;
  url: string;
  routeLabel: string;
  latencyOffsetMs: number;
}

export interface StreamReconnectEvent {
  id: string;
  timestamp: string;
  outletCallSign: string;
  sourceLabel: string;
  fromUrl: string;
  toUrl?: string;
  status: 'disconnected' | 'reconnecting' | 'switched' | 'restored' | 'exhausted';
  reason: string;
}

export interface WatchHistoryEntry {
  key: string;
  outletId: string;
  callSign: string;
  outletName: string;
  country: string;
  region: NewsOutletRegion;
  accentColor: string;
  programTitle: string;
  sourceType: NewsStreamSourceType;
  sourceLabel: string;
  sourceProtocol: string;
  viewedAt: number;
}

export interface EpgSyncSnapshot {
  revision: number;
  syncedAt: string;
  channelCount: number;
  updatedSlotCount: number;
  rowsByOutletId: Record<string, NewsOutletEpgRow>;
  endpointUrl: string;
  latencyMs: number;
}

export interface BreakingNewsAlert {
  id: string;
  outletId?: string;
  outletCallSign: string;
  region: string;
  priority: 'FLASH' | 'URGENT' | 'BREAKING' | 'LIVE FEED';
  headline: string;
  timestamp: string;
  sourceFeedLabel: string;
  sourceUrl?: string;
}

export interface RecordedStreamClip {
  id: string;
  fileName: string;
  title?: string;
  outletId?: string;
  outletCallSign: string;
  outletName: string;
  programTitle: string;
  sourceLabel: string;
  sourceProtocol: string;
  feedUrl: string;
  durationSec: number;
  sizeBytes: number;
  mimeType: string;
  objectUrl: string;
  recordedAt: string;
  recordedAtMs?: number;
  isStarred?: boolean;
  notes?: string;
}

export type AudioNormalizationPreset = 'news-desk' | 'ebu-r128' | 'atsc-a85' | 'night-limit';

export interface AudioNormalizationConfig {
  enabled: boolean;
  targetDb: number; // -24 to -12 dBFS/LUFS baseline
  preset: AudioNormalizationPreset;
  truePeakLimiter: boolean;
  ceilingDb: number; // e.g. -1.0 dBTP
  rampMs: number; // anti-jump crossfade ramp duration
  masterVolume: number; // 0 to 1
}

export interface AudioNormalizationTelemetry {
  rawInputDb: number;
  appliedGainDb: number;
  normalizedOutputDb: number;
  peakReductionDb: number;
  isRamping: boolean;
  lastJumpPreventedDb: number;
  lastSwitchSummary: string | null;
}

export type StreamQualityTier = '480p' | '720p' | '1080p';

export interface StreamQualityOption {
  tier: StreamQualityTier;
  label: string;
  shortLabel: string;
  dimensions: string;
  fps: number;
  bitrateMbps: number;
  available: boolean;
  unavailableReason?: string;
}
