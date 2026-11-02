/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Developer Portals & Community Types:
 * - dev.twitch.tv (Helix API, EventSub, Chatbot IRC, Extensions, Drops)
 * - dev.kick.com (Kick API v2, Webhooks, Bot Bridge, RTMP Ingest, 95/5 Split)
 * - User Profiles (Broadcaster, Developer, Operator roles)
 * - Forums (Threads, Categories, Replies, Code Snippets)
 * - FAQ (Twitch, Kick, Playout, Multistream, FCC, Legal)
 */

export interface TwitchDevConfig {
  clientId: string;
  clientSecret: string;
  appAccessToken: string;
  userOAuthToken: string;
  broadcasterId: string;
  channelName: string;
  selectedScopes: string[];
  ingestServer: string;
  streamKey: string;
  isEventSubActive: boolean;
  eventSubEndpoint: string;
  chatBotNick: string;
  chatBotChannel: string;
  channelPointsRewardTitle: string;
  channelPointsCost: number;
}

export interface KickDevConfig {
  apiKey: string;
  botUsername: string;
  botToken: string;
  channelSlug: string;
  chatroomId: string;
  webhookUrl: string;
  webhookSecret: string;
  rtmpStreamUrl: string;
  rtmpStreamKey: string;
  pusherCluster: string;
  isPusherConnected: boolean;
  monetizationSplitPercent: number; // 95%
  subscriptionTierPrice: number; // $4.99
}

export interface BroadcasterUserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  role: 'Master Broadcaster' | 'Station Operator' | 'Twitch Partner & Dev' | 'Kick Verified Creator' | 'IRC NetAdmin' | 'Legal Compliance';
  email: string;
  website: string;
  twitchUsername: string;
  kickUsername: string;
  unrealIrcNick: string;
  wittLawLicenseId: string;
  fccStationAffiliation: string;
  customBadge: string;
  totalBroadcastHours: number;
  totalChannelsManaged: number;
  subscriberCount: number;
  apiTokensCount: number;
}

export interface ForumReply {
  id: string;
  threadId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  codeSnippet?: string;
  codeLanguage?: string;
  timestamp: string;
  upvotes: number;
}

export interface ForumThread {
  id: string;
  category: 'dev_twitch' | 'dev_kick' | 'drfun1tv_playout' | 'restream_multistream' | 'satellite_carrier' | 'legal_compliance';
  title: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  codeSnippet?: string;
  codeLanguage?: string;
  tags: string[];
  timestamp: string;
  repliesCount: number;
  upvotes: number;
  views: number;
  isSolved: boolean;
  isPinned?: boolean;
  replies: ForumReply[];
}

export interface FaqItem {
  id: string;
  category: 'twitch_dev' | 'kick_dev' | 'drfun1tv_strimm' | 'restream_io' | 'fcc_irc' | 'witt_legal';
  question: string;
  answer: string;
  codeExample?: string;
  externalLink?: {
    label: string;
    url: string;
  };
}
