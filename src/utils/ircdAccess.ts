/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Site-Wide IRCD Rank Access Control Utilities & Permission Matrix
 */

import { ANOPE_RANKS } from '../data/ircdAdminData';
import { AnopeRankDefinition, AnopeRankLevel } from '../types/ircdAdmin';

export interface SiteAccessRule {
  id: string;
  area: 'WebIRC & Mesh' | 'Podcasting Uplink' | 'Radio & VoIP' | 'Master Control' | 'Hosting & Store' | 'SATCOM & Legal';
  capability: string;
  minRank: AnopeRankLevel;
  description: string;
}

export const SITE_ACCESS_RULES: SiteAccessRule[] = [
  {
    id: 'rule-public-lobby',
    area: 'WebIRC & Mesh',
    capability: 'Public #lobby Listen, SHOUTcast FM & SATCOM Catalog',
    minRank: 'guest',
    description: 'Read-only access to public chat rooms, radio stream playback, podcast listening, and directory browsing.',
  },
  {
    id: 'rule-registered-chat',
    area: 'WebIRC & Mesh',
    capability: 'Registered Chatting, Cart Checkout & Favorites',
    minRank: 'listener',
    description: 'NickServ +r identified posting in open channels, Fubo EPG watchlist, and hardware procurement cart.',
  },
  {
    id: 'rule-voiced-requests',
    area: 'Radio & VoIP',
    capability: 'Moderated (+m) Speech, Priority Song Requests & SATCOM SLA Tools',
    minRank: 'voice',
    description: 'Speak in moderated IRC channels, request tracks via !request, export OPML/CSV feeds, and calculate carrier SLAs.',
  },
  {
    id: 'rule-halfop-mod',
    area: 'WebIRC & Mesh',
    capability: 'Channel Kick, Topic Edits & Podcast Episode Drafts',
    minRank: 'halfop',
    description: 'Moderate regular users, manage episode drafts in DrFun1 Podcasting Uplink, and view read-only IRCD status.',
  },
  {
    id: 'rule-djhost-studio',
    area: 'Podcasting Uplink',
    capability: 'Publish Podcasts (RSS 2.0/WebSub), SIP/SRTP Guest Call-Ins & SGP4 Orbit Map',
    minRank: 'dj_host',
    description: 'Supreme Court & Witt Law vetted host tier (+d): publish episodes live, bridge SIP callers, and inspect live orbits.',
  },
  {
    id: 'rule-op-live-dj',
    area: 'Radio & VoIP',
    capability: 'MPD DJ Deck Go-Live, Mic Ducking & Channel Bans (@o Ops Baseline)',
    minRank: 'op',
    description: 'Take live broadcast decks, duck music bed during commentary, crossfade SHOUTcast mounts, and issue channel bans.',
  },
  {
    id: 'rule-sop-duplicator',
    area: 'Hosting & Store',
    capability: 'IRC Chat Room Duplicator Hosting, WordPress Sync & AOP Flags',
    minRank: 'sop',
    description: 'Provision 4-hub mirrored chat relays, generate WordPress iframe bundles, and promote channel operators.',
  },
  {
    id: 'rule-founder-dai',
    area: 'Podcasting Uplink',
    capability: 'DAI Sponsor Campaigns, Private Token RSS Feeds & ChanServ MLOCK',
    minRank: 'founder',
    description: 'Manage dynamic ad stitching, issue revocable private subscriber RSS tokens, and enforce channel MLOCK flags.',
  },
  {
    id: 'rule-locop-telemetry',
    area: 'Master Control',
    capability: '1,034-Leaf Network Status Telemetry & D3 Switch/RisingNet Ping Chart',
    minRank: 'locop',
    description: 'Inspect real-time node health across 500 Switch/hub nodes, 24 DataPacket POPs, and 10 RisingNet servers.',
  },
  {
    id: 'rule-so-syncall',
    area: 'Master Control',
    capability: 'Global /SYNCALL Mesh Trigger, HOPM Proxy Logs & SCOTUS Hiring Queue',
    minRank: 'so',
    description: 'Execute full-mesh UnrealIRCd synchronization, review HOPM detections, and manage DJ/host hiring docket queues.',
  },
  {
    id: 'rule-techadmin-cluster',
    area: 'SATCOM & Legal',
    capability: 'ZNC :5000 Bouncer Cluster, Podcast Cross-Uplink & Wholesale Carrier Orders',
    minRank: 'techadmin',
    description: 'Configure ZNC upstream leafs, push podcast premieres to SHOUTcast & IRC hubs, and authorize carrier interconnects.',
  },
  {
    id: 'rule-admin-rehash',
    area: 'Master Control',
    capability: 'UnrealIRCd `/REHASH`, K:Line/G:Line/Z:Line Bans & BotServ Fleet Control',
    minRank: 'admin',
    description: 'Reload live unrealircd.conf blocks, enforce global server bans, and manage automated network BotServ bots.',
  },
  {
    id: 'rule-netadmin-quadhub',
    area: 'Master Control',
    capability: 'Quad-Hub Core Link Control & HOPM Policy Rules Engine',
    minRank: 'netadmin',
    description: 'Modify inter-hub routing across irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net, and drfun1ircd.com.',
  },
  {
    id: 'rule-sra-root',
    area: 'SATCOM & Legal',
    capability: 'Root Cloak Key Rotation, Final SCOTUS/Witt Sign-off & Owner Override',
    minRank: 'sra',
    description: 'Highest network authority (~ SRA) under The Law Office of Richard A. Witt LLC & Owens Company billing.',
  },
];

export function getRankDefinition(rankId: AnopeRankLevel): AnopeRankDefinition {
  return ANOPE_RANKS.find((r) => r.id === rankId) || ANOPE_RANKS[ANOPE_RANKS.length - 1];
}

export function getRankLevel(rankId: AnopeRankLevel): number {
  return getRankDefinition(rankId).accessLevel;
}

export function hasMinIrcdRank(currentRank: AnopeRankLevel, requiredRank: AnopeRankLevel): boolean {
  return getRankLevel(currentRank) >= getRankLevel(requiredRank);
}
