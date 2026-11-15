/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 */

export type DrFun1TvCategory =
  | 'All'
  | 'Locals'
  | 'Sports'
  | 'News & Court'
  | 'Entertainment'
  | 'Science & Satcom';

export type DrFun1TvLibraryFilter =
  | 'All'
  | 'New in Library'
  | 'Most Watched'
  | 'Scheduled'
  | 'Sports'
  | 'Shows'
  | 'News & Court'
  | 'Movies';

export interface DrFun1TvEpgSlot {
  id: string;
  title: string;
  subtitle: string;
  timeRange: string;
  durationMin: number;
  isLive: boolean;
  isNew?: boolean;
  rating: string;
  description: string;
  category: Exclude<DrFun1TvCategory, 'All'>;
  scoreSummary?: string;
}

export interface DrFun1TvChannel {
  id: string;
  callSign: string;
  name: string;
  channelNumber: number;
  category: Exclude<DrFun1TvCategory, 'All'>;
  accentColor: string;
  badgeText: string;
  is4kPlus: boolean;
  isZenChannel?: boolean;
  bitrateMbps: number;
  codec: 'VP9 HDR' | 'AV1 4K60' | 'H.264 1080p60';
  ingestPop: string;
  currentProgressPct: number;
  epgSlots: [DrFun1TvEpgSlot, DrFun1TvEpgSlot, DrFun1TvEpgSlot];
}

export interface DrFun1TvKeyPlay {
  id: string;
  channelId: string;
  timestamp: string;
  quarterOrSegment: string;
  title: string;
  detail: string;
  impactTone: 'crimson' | 'amber' | 'emerald' | 'sky';
}

export interface DrFun1TvLibraryItem {
  id: string;
  programId: string;
  title: string;
  channelCallSign: string;
  channelName: string;
  category: Exclude<DrFun1TvLibraryFilter, 'All' | 'New in Library' | 'Most Watched' | 'Scheduled'>;
  recordedAt: string;
  retentionLabel: string;
  durationLabel: string;
  watchedPct: number;
  isNew: boolean;
  isMostWatched: boolean;
  isScheduled: boolean;
  hasVodAlternative: boolean;
  description: string;
  accentColor: string;
}

export interface DrFun1TvMultiviewPreset {
  id: string;
  label: string;
  description: string;
  channelIds: string[];
}
