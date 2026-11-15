/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Unified TVU Networks + Red5.net WebRTC + Twitch.tv Platform Types
 */

export type TvuLinkStatus = 'on_air' | 'standby' | 'recording';

export interface TvuBondedModem {
  id: string;
  carrier: string;
  networkType: '5G SA' | 'LTE-A' | 'Starlink LEO' | 'Switch 100G' | 'Wi-Fi 6E';
  bitrateMbps: number;
  signalPct: number;
  enabled: boolean;
}

export interface TvuPackUnit {
  id: string;
  unitName: string;
  model: 'TVU One 5G' | 'TVU Nano 5G' | 'TVU Anywhere Mobile' | 'TVU RPS Studio' | 'TVU Grid Receiver';
  location: string;
  operatorNick: string;
  status: TvuLinkStatus;
  latencyMs: number;
  resolution: '4K60 HDR' | '1080p60' | '1080p30';
  videoCodec: 'HEVC H.265' | 'H.264 High';
  audioChannels: string;
  packetLossPct: number;
  previewImage: string;
  assignedRed5NodeId: string;
  modems: TvuBondedModem[];
}

export interface TvuProducerScene {
  id: string;
  name: string;
  layout: 'Full Cam' | '2-Up Split' | '4-Up Multiview' | 'Picture-in-Picture';
  primaryPackId: string;
  secondaryPackId?: string;
  lowerThirdTitle: string;
  lowerThirdSubtitle: string;
  showLowerThird: boolean;
}

export type Red5NodeRole = 'Origin' | 'Edge' | 'Transcoder' | 'Relay';
export type Red5Protocol = 'WebRTC WHIP/WHEP' | 'SRT Caller/Listener' | 'RTMP / RTMPS' | 'RTSP / Zixi' | 'LL-HLS';

export interface Red5EdgeNode {
  id: string;
  nodeName: string;
  region: string;
  datacenter: string;
  role: Red5NodeRole;
  protocol: Red5Protocol;
  status: 'healthy' | 'autoscaling' | 'standby';
  webrtcRttMs: number;
  activePublishers: number;
  activeSubscribers: number;
  maxCapacity: number;
  cpuLoadPct: number;
  bandwidthGbps: number;
  whipIngestUrl: string;
  whepPlaybackUrl: string;
  srtEndpoint: string;
  abrEnabled: boolean;
}

export type TwitchCategory =
  | 'All'
  | 'Live Broadcast'
  | 'News & Field Desk'
  | 'SATCOM & NOC'
  | 'Legal & FCC'
  | 'Music & DJ';

export interface TwitchLiveChannel {
  id: string;
  handle: string;
  displayName: string;
  category: Exclude<TwitchCategory, 'All'>;
  streamTitle: string;
  viewerCount: number;
  followerCount: number;
  isLive: boolean;
  isPartner: boolean;
  tags: string[];
  thumbnailUrl: string;
  tvuPackId: string;
  red5NodeId: string;
  ircChannel: string;
  uptimeMinutes: number;
  subPriceUsd: number;
  moderators: string[];
}

export interface TwitchChatMessage {
  id: string;
  channelId: string;
  author: string;
  badge: 'Broadcaster' | 'WittLaw Mod' | 'VIP' | 'Subscriber' | 'IRCD ~Owner' | 'Viewer';
  badgeColor: string;
  text: string;
  bitsAmount?: number;
  timestamp: string;
}

export interface ChannelPointReward {
  id: string;
  title: string;
  cost: number;
  description: string;
  actionType: 'highlight' | 'cut_camera' | 'lower_third' | 'webrtc_stats';
}
