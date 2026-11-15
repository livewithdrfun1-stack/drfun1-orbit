/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Canonical Feature-to-IRCD Rank Configuration Matrix
 * Maps specific DrFun1 platform capabilities across the 14-tier UnrealIRCd / Anope rank hierarchy.
 */

import { ANOPE_RANKS } from '../data/ircdAdminData';
import { AnopeRankDefinition, AnopeRankLevel } from '../types/ircdAdmin';
import { getRankDefinition, getRankLevel } from '../utils/ircdAccess';

export type PlatformFeatureCategory =
  | 'WebIRC & Mesh'
  | 'Podcasting Uplink'
  | 'Radio & VoIP'
  | 'Master Control'
  | 'Hosting & Store'
  | 'SATCOM & Legal';

export type FeatureAccessTier = 'Read' | 'Operate' | 'Administer' | 'Root';

export interface PlatformFeatureConfig {
  id: string;
  featureKey: string;
  label: string;
  shortLabel: string;
  category: PlatformFeatureCategory;
  minRank: AnopeRankLevel;
  requiredModes: string;
  accessTier: FeatureAccessTier;
  description: string;
}

export const PLATFORM_FEATURE_CATEGORIES: readonly PlatformFeatureCategory[] = [
  'WebIRC & Mesh',
  'Podcasting Uplink',
  'Radio & VoIP',
  'Master Control',
  'Hosting & Store',
  'SATCOM & Legal',
] as const;

export const IRCD_FEATURE_ACCESS_CONFIG: PlatformFeatureConfig[] = [
  {
    id: 'feat-public-lobby',
    featureKey: 'PUBLIC_LOBBY_STREAM',
    label: 'Public #lobby Listen, Radio Playback & Catalog',
    shortLabel: 'Public Lobby & Stream',
    category: 'WebIRC & Mesh',
    minRank: 'guest',
    requiredModes: '+x',
    accessTier: 'Read',
    description:
      'Listen to SHOUTcast FM streams, read public IRC channels, browse podcasts, and inspect SATCOM/Apple product directories.',
  },
  {
    id: 'feat-nickserv-chat',
    featureKey: 'NICKSERV_CHAT_CHECKOUT',
    label: 'NickServ +r Chat, Watchlist & Store Checkout',
    shortLabel: 'NickServ Chat & Cart',
    category: 'WebIRC & Mesh',
    minRank: 'listener',
    requiredModes: '+r',
    accessTier: 'Operate',
    description:
      'Post messages as an identified NickServ user in open channels, save Fubo TV favorites, and place store hardware orders.',
  },
  {
    id: 'feat-voiced-requests',
    featureKey: 'VOICED_REQUESTS_EXPORT',
    label: 'Moderated (+m) Chat, !request Queue & Feed Exports',
    shortLabel: '+v Requests & OPML',
    category: 'Radio & VoIP',
    minRank: 'voice',
    requiredModes: '+v',
    accessTier: 'Operate',
    description:
      'Speak inside moderated +m IRC channels, trigger !request track submissions, export OPML/CSV feeds, and run carrier SLA estimators.',
  },
  {
    id: 'feat-halfop-moderation',
    featureKey: 'HALFOP_KICK_DRAFTS',
    label: 'Channel Kick / Topic Control & Podcast Drafts',
    shortLabel: '%h Mod & Ep Drafts',
    category: 'WebIRC & Mesh',
    minRank: 'halfop',
    requiredModes: '%h',
    accessTier: 'Operate',
    description:
      'Issue channel kicks, update channel topics, curate podcast episode drafts in DrFun1 Podcasting Uplink, and read IRCD health.',
  },
  {
    id: 'feat-podcast-publish-voip',
    featureKey: 'PODCAST_PUBLISH_SIP_CALLIN',
    label: 'Publish Podcasts (RSS 2.0/WebSub) & SIP/SRTP Call-Ins',
    shortLabel: '+d Publish & SIP Bridge',
    category: 'Podcasting Uplink',
    minRank: 'dj_host',
    requiredModes: '+d',
    accessTier: 'Operate',
    description:
      'SCOTUS & Witt Law vetted +d host tier: publish live podcast episodes, accept SIP/SRTP caller bridges, and track SGP4 satellite orbits.',
  },
  {
    id: 'feat-dj-deck-golive',
    featureKey: 'SHOUTCAST_DJ_GOLIVE',
    label: 'MPD DJ Deck Go-Live, Mic Ducking & Channel Bans',
    shortLabel: '@o DJ Go-Live & Bans',
    category: 'Radio & VoIP',
    minRank: 'op',
    requiredModes: '@o',
    accessTier: 'Operate',
    description:
      'Take live SHOUTcast broadcast mounts, engage automatic microphone ducking, crossfade MPD decks, and enforce channel bans.',
  },
  {
    id: 'feat-duplicator-wp',
    featureKey: 'DUPLICATOR_WORDPRESS_HOSTING',
    label: 'IRC Duplicator Hosting, WordPress Sync & AOP Flags',
    shortLabel: '&a Duplicator & WP Sync',
    category: 'Hosting & Store',
    minRank: 'sop',
    requiredModes: '&a',
    accessTier: 'Administer',
    description:
      'Deploy 4-hub mirrored IRC chat room duplicators, generate WordPress iframe embed plugins, and assign @o ChanServ AOP flags.',
  },
  {
    id: 'feat-dai-private-rss',
    featureKey: 'PODCAST_DAI_PRIVATE_RSS',
    label: 'DAI Ad Insertion, Private Token RSS & ChanServ MLOCK',
    shortLabel: '~q DAI Ads & MLOCK',
    category: 'Podcasting Uplink',
    minRank: 'founder',
    requiredModes: '~q',
    accessTier: 'Administer',
    description:
      'Manage dynamic sponsor ad campaigns, issue revocable private subscriber RSS feeds, and enforce ChanServ channel MLOCK settings.',
  },
  {
    id: 'feat-mesh-telemetry',
    featureKey: 'NETWORK_STATUS_1034_LEAF',
    label: '1,034-Leaf Network Status Telemetry & Node Health',
    shortLabel: '+O 1,034-Leaf Status',
    category: 'Master Control',
    minRank: 'locop',
    requiredModes: '+O',
    accessTier: 'Administer',
    description:
      'Inspect live telemetry across 500 Switch/hub nodes, 24 DataPacket POPs, and 10 RisingNet servers inside Master Control.',
  },
  {
    id: 'feat-d3-latency-trends',
    featureKey: 'D3_SWITCH_RISINGNET_PING',
    label: 'D3 Switch/Hub <-> RisingNet Latency Trend Graph',
    shortLabel: '+O D3 Ping Trends',
    category: 'Master Control',
    minRank: 'locop',
    requiredModes: '+O',
    accessTier: 'Administer',
    description:
      'Stream real-time D3 time-series latency graphs comparing Switch SUPERNAP hubs against RisingNet 100G edge servers.',
  },
  {
    id: 'feat-syncall-mesh',
    featureKey: 'GLOBAL_SYNCALL_HUBS',
    label: 'Global /SYNCALL Quad-Hub & 1,034-Leaf Mesh Sync',
    shortLabel: '+o Global /SYNCALL',
    category: 'Master Control',
    minRank: 'so',
    requiredModes: '+o',
    accessTier: 'Administer',
    description:
      'Broadcast UnrealIRCd state synchronization and burst updates simultaneously across all 4 core hubs and 1,034 mesh leafs.',
  },
  {
    id: 'feat-scotus-hiring-queue',
    featureKey: 'SCOTUS_VOIP_HIRING_QUEUE',
    label: '855,000-Station SHOUTcast VoIP & SCOTUS Hiring Queue',
    shortLabel: '+o SCOTUS Hiring Desk',
    category: 'Radio & VoIP',
    minRank: 'so',
    requiredModes: '+o',
    accessTier: 'Administer',
    description:
      'Administer SIP/SRTP trunks across 855,000 stations and process DJ/Host hiring approvals routed through www.wittlawfirm.com.',
  },
  {
    id: 'feat-hopm-znc-cluster',
    featureKey: 'HOPM_ZNC_5000_CLUSTER',
    label: 'HOPM Proxy Scanner & ZNC :5000 Bouncer Cluster',
    shortLabel: '+A HOPM & ZNC :5000',
    category: 'Master Control',
    minRank: 'techadmin',
    requiredModes: '+A',
    accessTier: 'Administer',
    description:
      'Control HOPM open-proxy scanners, manage 5,000-port ZNC bouncer pools, and bridge DrFun1 podcast premieres to all IRC hubs.',
  },
  {
    id: 'feat-satcom-wholesale',
    featureKey: 'SATCOM_WHOLESALE_INTERCONNECT',
    label: 'Wholesale SATCOM Carrier Orders & Transponder SLAs',
    shortLabel: '+A SATCOM Carrier',
    category: 'SATCOM & Legal',
    minRank: 'techadmin',
    requiredModes: '+A',
    accessTier: 'Administer',
    description:
      'Authorize wholesale Dark Fiber & Ku/Ka-band transponder carrier orders under FCC FRN 0034981290.',
  },
  {
    id: 'feat-unreal-rehash-bans',
    featureKey: 'UNREAL_REHASH_KLINE_GLINE',
    label: 'UnrealIRCd /REHASH, K:Line/G:Line/Z:Line & BotServ',
    shortLabel: '+a /REHASH & G:Lines',
    category: 'Master Control',
    minRank: 'admin',
    requiredModes: '+a',
    accessTier: 'Administer',
    description:
      'Reload live unrealircd.conf configuration blocks, issue network-wide K:Lines/G:Lines/Z:Lines, and configure BotServ fleets.',
  },
  {
    id: 'feat-quad-hub-routing',
    featureKey: 'QUAD_HUB_CORE_ROUTING',
    label: 'Quad-Hub Core Link Routing & HOPM Policy Rules',
    shortLabel: '+N Quad-Hub Routing',
    category: 'Master Control',
    minRank: 'netadmin',
    requiredModes: '+N',
    accessTier: 'Root',
    description:
      'Modify core inter-hub peering across irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net, and drfun1ircd.com.',
  },
  {
    id: 'feat-sra-scotus-witt-owner',
    featureKey: 'SRA_JOHN_ROBERTS_OWNER_ROOT',
    label: 'Root Cloak Keys, SCOTUS/Witt Final Sign-Off (~ Owner)',
    shortLabel: '~ Owner & SCOTUS Root',
    category: 'SATCOM & Legal',
    minRank: 'sra',
    requiredModes: '~ / +SRA',
    accessTier: 'Root',
    description:
      'Highest John Roberts Rank (~ Level 10,000): rotate UnrealIRCd cloak keys, finalize SCOTUS hiring decrees, and govern Owens Company billing.',
  },
];

export function canRankAccessFeature(
  rank: AnopeRankLevel,
  feature: PlatformFeatureConfig
): boolean {
  return getRankLevel(rank) >= getRankLevel(feature.minRank);
}

export function getFeatureGrantState(
  rank: AnopeRankLevel,
  feature: PlatformFeatureConfig
): 'exact' | 'inherited' | 'locked' {
  const rankLvl = getRankLevel(rank);
  const reqLvl = getRankLevel(feature.minRank);
  if (rankLvl === reqLvl) return 'exact';
  if (rankLvl > reqLvl) return 'inherited';
  return 'locked';
}

export function getAccessibleFeaturesForRank(
  rank: AnopeRankLevel
): PlatformFeatureConfig[] {
  return IRCD_FEATURE_ACCESS_CONFIG.filter((f) => canRankAccessFeature(rank, f));
}

export function getExactUnlockFeaturesForRank(
  rank: AnopeRankLevel
): PlatformFeatureConfig[] {
  return IRCD_FEATURE_ACCESS_CONFIG.filter((f) => f.minRank === rank);
}

export function getOrderedRanksAscending(): AnopeRankDefinition[] {
  return [...ANOPE_RANKS].sort((a, b) => a.accessLevel - b.accessLevel);
}

export function getMinRankDefinitionForFeature(
  feature: PlatformFeatureConfig
): AnopeRankDefinition {
  return getRankDefinition(feature.minRank);
}
