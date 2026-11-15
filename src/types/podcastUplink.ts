/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * DrFun1 Podcasting Uplink (Podserv.fm Architecture Clone & Rebrand)
 */

export type PodcastEpisodeStatus = 'published' | 'scheduled' | 'draft';
export type PodcastAudioFormat = 'MP3 320kbps CBR' | 'AAC 256kbps' | 'FLAC 24-bit Lossless' | 'Opus 128kbps';

export interface PodcastChapter {
  timeSec: number;
  title: string;
}

export interface PodcastTranscriptLine {
  timeSec: number;
  speaker: string;
  text: string;
}

export interface PodcastEpisode {
  id: string;
  showId: string;
  season: number;
  episodeNumber: number;
  title: string;
  subtitle: string;
  summary: string;
  status: PodcastEpisodeStatus;
  publishedAt: string;
  durationSec: number;
  fileSizeMb: number;
  audioFormat: PodcastAudioFormat;
  loudnessLufs: number;
  explicit: boolean;
  enclosureUrl: string;
  downloads: number;
  completionRate: number;
  chapters: PodcastChapter[];
  transcript: PodcastTranscriptLine[];
  daiSlots: {
    preRoll: boolean;
    midRoll: boolean;
    postRoll: boolean;
  };
  syncedToIrc: boolean;
  syncedToShoutcast: boolean;
}

export interface ShowModeratorAdmin {
  id: string;
  nick: string;
  fullName: string;
  title: string;
  organization: 'www.wittlawfirm.com';
  ircRole: '~ Owner (SRA)' | '@ ChanOp' | '& SOP';
  hostmask: string;
  permissions: string[];
}

export interface ShoutcastControlState {
  isBroadcasting: boolean;
  streamQuality: '320k_mp3' | '192k_aac' | 'flac_lossless';
  volume: number;
  isMuted: boolean;
  listenerCount: number;
  currentArtist: string;
  currentTrack: string;
  nextTrack: string;
  activeMount: string;
  activeStationId: string;
  ypListed: boolean;
  autoDjEnabled: boolean;
  syncedShowTitle?: string;
  lastSyncedAt: string;
}

export interface PodcastShow {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  author: string;
  email: string;
  category: string;
  language: string;
  explicit: boolean;
  coverUrl: string;
  rssUrl: string;
  customDomain: string;
  copyright: string;
  defaultFormat: PodcastAudioFormat;
  daiEnabled: boolean;
  satcomUplinkBand: string;
  switchPopCount: number;
  ircChannel: string;
  shoutcastMount: string;
  shoutcastStationId: string;
  shoutcastBitrate: '320kbps MP3' | '192kbps AAC' | 'FLAC Lossless';
  shoutcastPublicYpListed: boolean;
  shoutcastAutoDjEnabled: boolean;
  governingFirm: 'www.wittlawfirm.com';
  moderatorsAndAdmins: ShowModeratorAdmin[];
  websubEnabled: boolean;
  lastPingedAt: string;
  subscribersCount: number;
  totalDownloads: number;
}

export interface PodcastDirectoryListing {
  id: string;
  platform: string;
  protocol: string;
  status: 'live' | 'submitted' | 'pending';
  directoryUrl: string;
  lastSync: string;
}

export interface PodcastDaiCampaign {
  id: string;
  advertiser: string;
  slotType: 'pre-roll' | 'mid-roll' | 'post-roll';
  cpmUsd: number;
  impressions: number;
  status: 'active' | 'paused';
  copyScript: string;
}

export interface PrivateSubscriberFeed {
  id: string;
  subscriberEmail: string;
  label: string;
  tokenUrl: string;
  createdAt: string;
  lastFetchedAt: string;
  downloadsCount: number;
  active: boolean;
}

export interface PodcastAnalyticsDay {
  day: string;
  downloads: number;
  uniqueListeners: number;
  streamedPct: number;
}
