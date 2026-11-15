/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 */

export type SocialPlatform =
  | 'youtube'
  | 'twitch'
  | 'kick'
  | 'x_twitter'
  | 'instagram'
  | 'tiktok'
  | 'linkedin'
  | 'facebook'
  | 'discord';

export interface UserSocialAccount {
  id: string;
  platform: SocialPlatform;
  handle: string;
  profileUrl: string;
  connected: boolean;
  autoSyncLiveFeed: boolean;
  followers: number;
  isVerified: boolean;
  lastSyncedAt: string;
}

export interface UserSocialProfile {
  userId: string;
  nick: string;
  displayName: string;
  role: string;
  group: 'WittLaw Admins' | 'SCOTUS Bench' | 'Broadcast & DJs' | 'Network Ops';
  organization: string;
  hostmask: string;
  bio: string;
  masterAutoRelay: boolean;
  accounts: UserSocialAccount[];
}

export interface DrFun1MediaLiveFeed {
  id: string;
  title: string;
  feedUrl: string;
  hlsUrl: string;
  whipUrl: string;
  channel: string;
  category: 'Broadcast TV' | 'Legal & SCOTUS' | 'Radio & DJ' | 'SATCOM NOC';
  status: 'LIVE' | 'STANDBY';
  quality: string;
  bitrateMbps: number;
  viewers: number;
  hostNick: string;
  summary: string;
  ingestNode: string;
}

export interface SocialBroadcastPost {
  id: string;
  userId: string;
  userNick: string;
  content: string;
  attachedFeedId?: string;
  attachedFeedTitle?: string;
  platforms: SocialPlatform[];
  status: 'published' | 'scheduled';
  timestamp: string;
  reachEstimate: number;
}
