/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * DrFun1 Podcasting Uplink Seed Catalog, Analytics & RSS 2.0 / OPML Generators
 */

import {
  PodcastAnalyticsDay,
  PodcastDaiCampaign,
  PodcastDirectoryListing,
  PodcastEpisode,
  PodcastShow,
  PrivateSubscriberFeed,
} from '../types/podcastUplink';

export const INITIAL_PODCAST_SHOWS: PodcastShow[] = [
  {
    id: 'show-orbital-uplink',
    title: 'Orbital Uplink Weekly',
    slug: 'orbital-uplink-weekly',
    tagline: 'LEO, MEO & GEO Satellite Teleport Operations on Switch SUPERNAP 100G',
    description:
      'Deep technical briefings on Ka-band earth stations, 3GPP Release 17/18 NTN handoffs, low-jitter DataPacket edge routing, and multi-orbit carrier architecture across DrFun1 Media teleports.',
    author: 'DrFun1 Media SATCOM Engineering Desk',
    email: 'uplink@drfun1media.com',
    category: 'Technology',
    language: 'en-US',
    explicit: false,
    coverUrl: '/src/assets/images/podcast_satcom_briefing_1794713807768.jpg',
    rssUrl: 'https://uplink.drfun1media.com/rss/orbital-uplink-weekly.xml',
    customDomain: 'podcasts.drfun1media.com/orbital',
    copyright: '© 2026 DrFun1 Media Inc. Licensed via www.wittlawfirm.com',
    defaultFormat: 'MP3 320kbps CBR',
    daiEnabled: true,
    satcomUplinkBand: 'Ka-Band 28.5 GHz + C-Band Redundant',
    switchPopCount: 500,
    ircChannel: '#satcom',
    shoutcastMount: '/orbital-uplink-320k.mp3',
    websubEnabled: true,
    lastPingedAt: '2026-11-14T18:45:00Z',
    subscribersCount: 42890,
    totalDownloads: 618420,
  },
  {
    id: 'show-broadcast-console',
    title: 'The Broadcast Console Sessions',
    slug: 'broadcast-console-sessions',
    tagline: 'Inside 855,000 SHOUTcast Streams, MPD DJ Routing & Live VoIP Studio Engineering',
    description:
      'Studio masters, dual-deck Icecast2/SHOUTcast cluster playout, SIP/SRTP guest call-in bridges, and transparent mastering chains engineered for independent and syndication broadcasters.',
    author: 'Richard Alan Witt & DrFun1 Radio Guild',
    email: 'studio@drfun1media.com',
    category: 'Music',
    language: 'en-US',
    explicit: false,
    coverUrl: '/src/assets/images/podcast_broadcast_console_1794713807944.jpg',
    rssUrl: 'https://uplink.drfun1media.com/rss/broadcast-console-sessions.xml',
    customDomain: 'podcasts.drfun1media.com/console',
    copyright: '© 2026 DrFun1 Media Inc. · Payment Office: Owens Company',
    defaultFormat: 'FLAC 24-bit Lossless',
    daiEnabled: true,
    satcomUplinkBand: 'Ku-Band 14.2 GHz Contribution Link',
    switchPopCount: 500,
    ircChannel: '#music-deathrow',
    shoutcastMount: '/console-sessions-hi.mp3',
    websubEnabled: true,
    lastPingedAt: '2026-11-14T19:10:00Z',
    subscribersCount: 68140,
    totalDownloads: 1104850,
  },
  {
    id: 'show-federal-docket',
    title: 'Supreme Court & Broadcast Law Docket',
    slug: 'federal-broadcast-docket',
    tagline: 'FCC FRN 0034981290 Regulatory Briefings & Judicial Hiring Governance',
    description:
      'Weekly constitutional communications law updates supervised by The Law Office of Richard A. Witt LLC (www.wittlawfirm.com), covering Supreme Court broadcast governance, Part 25 earth station licensing, and DJ host clearance standards.',
    author: 'The Law Office of Richard A. Witt LLC',
    email: 'counsel@wittlawfirm.com',
    category: 'Government',
    language: 'en-US',
    explicit: false,
    coverUrl: '/src/assets/images/podcast_federal_docket_1794713808891.jpg',
    rssUrl: 'https://uplink.drfun1media.com/rss/federal-broadcast-docket.xml',
    customDomain: 'docket.wittlawfirm.com/podcast',
    copyright: '© 2026 The Law Office of Richard A. Witt LLC · FRN 0034981290',
    defaultFormat: 'AAC 256kbps',
    daiEnabled: false,
    satcomUplinkBand: 'L-Band Gov/Civil Verified',
    switchPopCount: 500,
    ircChannel: '#whitehouse-briefings',
    shoutcastMount: '/federal-docket-hq.aac',
    websubEnabled: true,
    lastPingedAt: '2026-11-14T17:20:00Z',
    subscribersCount: 29450,
    totalDownloads: 392110,
  },
  {
    id: 'show-fiber-mesh',
    title: '100G Fiber & Quad-Hub IRCD Architecture',
    slug: 'fiber-quadhub-ircd',
    tagline: 'UnrealIRCd 6.1.4 Federation, HOPM Anti-Proxy & 1,034-Leaf Mesh Telemetry',
    description:
      'Packet-level discussions on syncing 1,000 Switch leaf nodes (via CGW Law Offices), 24 DataPacket edges, and 10 RisingNet dedicated servers across irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net, and drfun1ircd.com.',
    author: 'Switch SUPERNAP NOC & RisingNet Team',
    email: 'noc@risingnet.com',
    category: 'Technology',
    language: 'en-US',
    explicit: false,
    coverUrl: '/src/assets/images/podcast_fiber_backbone_1794713809328.jpg',
    rssUrl: 'https://uplink.drfun1media.com/rss/fiber-quadhub-ircd.xml',
    customDomain: 'uplink.drfun1ircd.com/feed',
    copyright: '© 2026 DrFun1 Media Inc. & RisingNet AS53767',
    defaultFormat: 'MP3 320kbps CBR',
    daiEnabled: true,
    satcomUplinkBand: '100G DWDM Dark Fiber + Starlink Failover',
    switchPopCount: 1034,
    ircChannel: '#switch-supernap',
    shoutcastMount: '/noc-engineering.mp3',
    websubEnabled: true,
    lastPingedAt: '2026-11-14T19:02:00Z',
    subscribersCount: 31720,
    totalDownloads: 486930,
  },
];

export const INITIAL_PODCAST_EPISODES: PodcastEpisode[] = [
  {
    id: 'ep-101',
    showId: 'show-orbital-uplink',
    season: 4,
    episodeNumber: 18,
    title: 'Synchronizing 1,034 Leaf Nodes Across Dual Ka-Band Teleports',
    subtitle: 'Sub-2ms optical paths between Switch SUPERNAP LV and Citadel Reno',
    summary:
      'We break down how UnrealIRCd 6.1.4 quad-hub routing pairs with LEO/MEO satellite backhaul so remote field reporters maintain uninterrupted contribution uplinks.',
    status: 'published',
    publishedAt: '2026-11-14',
    durationSec: 2538,
    fileSizeMb: 58.4,
    audioFormat: 'MP3 320kbps CBR',
    loudnessLufs: -16.0,
    explicit: false,
    enclosureUrl: 'https://cdn.uplink.drfun1media.com/audio/orbital-s04e18-1034-leafs.mp3',
    downloads: 18420,
    completionRate: 91,
    chapters: [
      { timeSec: 0, title: 'Cold Open & Quad-Hub Topology Overview' },
      { timeSec: 410, title: 'Switch SUPERNAP NV Optical Patching via CGW' },
      { timeSec: 1185, title: 'DataPacket No-Ads Trans-Atlantic Edge Caching' },
      { timeSec: 1920, title: 'RisingNet AS53767 Anycast Scrubbing Q&A' },
    ],
    transcript: [
      { timeSec: 0, speaker: 'Host (NOC Lead)', text: 'Welcome back to Orbital Uplink Weekly streaming from Switch Las Vegas Core 001.' },
      { timeSec: 14, speaker: 'Host (NOC Lead)', text: 'Today all 500 Switch nodes per hub, 12 DataPacket POPs per hub, and 10 RisingNet servers reached 100% full-mesh sync.' },
      { timeSec: 410, speaker: 'Field Engineer', text: 'By anchoring TLS 1.3 WebSub and RSS media enclosures behind our optical ring, podcast downloads settle under 18ms first-byte globally.' },
      { timeSec: 1185, speaker: 'Architect', text: 'Every podcaster gets automatic geo-replicated CDN storage without third-party ad injection.' },
    ],
    daiSlots: { preRoll: true, midRoll: true, postRoll: false },
    syncedToIrc: true,
    syncedToShoutcast: true,
  },
  {
    id: 'ep-102',
    showId: 'show-orbital-uplink',
    season: 4,
    episodeNumber: 17,
    title: '3GPP Release 18 Direct-to-Handset NTN Benchmark Report',
    subtitle: 'Measuring packet loss during polar LEO constellation handovers',
    summary:
      'Field bench testing S-band and Ka-band satellite links over active DrFun1 Media ground receivers with adaptive Opus and MP3 bitrates.',
    status: 'published',
    publishedAt: '2026-11-07',
    durationSec: 2145,
    fileSizeMb: 49.2,
    audioFormat: 'MP3 320kbps CBR',
    loudnessLufs: -16.2,
    explicit: false,
    enclosureUrl: 'https://cdn.uplink.drfun1media.com/audio/orbital-s04e17-ntn-benchmark.mp3',
    downloads: 15980,
    completionRate: 88,
    chapters: [
      { timeSec: 0, title: 'Introduction & Testbed Setup' },
      { timeSec: 520, title: 'Handover Jitter Under 3GPP Rel-18' },
      { timeSec: 1490, title: 'Buffer Sizing for Live Podcast Uplinks' },
    ],
    transcript: [
      { timeSec: 0, speaker: 'Host (NOC Lead)', text: 'Testing satellite-to-RSS live ingestion over S-band NTN terminals.' },
      { timeSec: 520, speaker: 'RF Specialist', text: 'Zero dropped frames when dynamic jitter buffers align with WebSub instant feed notifications.' },
    ],
    daiSlots: { preRoll: true, midRoll: false, postRoll: true },
    syncedToIrc: true,
    syncedToShoutcast: false,
  },
  {
    id: 'ep-103',
    showId: 'show-orbital-uplink',
    season: 4,
    episodeNumber: 19,
    title: 'Deep Space Goldstone Telemetry & Remote Broadcast Desks',
    subtitle: 'Scheduled release synced with Switch Node 24 maintenance window',
    summary: 'Upcoming field engineering walkthrough covering high-gain X-band dishes and automated podcast archiving.',
    status: 'scheduled',
    publishedAt: '2026-11-21',
    durationSec: 2760,
    fileSizeMb: 63.1,
    audioFormat: 'MP3 320kbps CBR',
    loudnessLufs: -16.0,
    explicit: false,
    enclosureUrl: 'https://cdn.uplink.drfun1media.com/audio/orbital-s04e19-goldstone.mp3',
    downloads: 0,
    completionRate: 0,
    chapters: [
      { timeSec: 0, title: 'Scheduled Countdown & Uplink Pre-Check' },
      { timeSec: 900, title: 'Goldstone Antenna Feed Chain' },
    ],
    transcript: [
      { timeSec: 0, speaker: 'Host (NOC Lead)', text: 'Pre-mastered and queued for automated WebSub dispatch on November 21.' },
    ],
    daiSlots: { preRoll: true, midRoll: true, postRoll: true },
    syncedToIrc: false,
    syncedToShoutcast: false,
  },
  {
    id: 'ep-201',
    showId: 'show-broadcast-console',
    season: 3,
    episodeNumber: 42,
    title: 'Wiring 855,000 SHOUTcast Stations Into One SIP/SRTP VoIP Switch',
    subtitle: 'Zero-latency listener call-ins and instant podcast episode multitrack capture',
    summary:
      'How DrFun1 Podcasting Uplink turns any live SHOUTcast radio broadcast or MPD DJ mix directly into a chaptered, -16 LUFS mastered podcast episode in seconds.',
    status: 'published',
    publishedAt: '2026-11-13',
    durationSec: 3112,
    fileSizeMb: 71.5,
    audioFormat: 'FLAC 24-bit Lossless',
    loudnessLufs: -15.8,
    explicit: false,
    enclosureUrl: 'https://cdn.uplink.drfun1media.com/audio/console-s03e42-voip-855k.mp3',
    downloads: 34910,
    completionRate: 94,
    chapters: [
      { timeSec: 0, title: 'Why Radio Stations Need Instant Podcast Uplinks' },
      { timeSec: 740, title: 'G.722 HD Voice to -16 LUFS Normalization' },
      { timeSec: 1850, title: 'Dynamic Pre-Roll & Mid-Roll Ad Stitching' },
    ],
    transcript: [
      { timeSec: 0, speaker: 'Richard Alan Witt', text: 'Every live DJ set across our 855,000 stations now archives directly into Podserv-grade RSS 2.0 feeds.' },
      { timeSec: 740, speaker: 'Audio Producer', text: 'Our automated leveling pipeline hits EBU R128 / -16 LUFS stereo standards before CDN replication.' },
    ],
    daiSlots: { preRoll: true, midRoll: true, postRoll: true },
    syncedToIrc: true,
    syncedToShoutcast: true,
  },
  {
    id: 'ep-202',
    showId: 'show-broadcast-console',
    season: 3,
    episodeNumber: 41,
    title: 'Mastering Dual-Deck MPD Crossfades for Apple Podcasts & Spotify',
    subtitle: 'Eliminating clipping on high-transient electronic broadcasts',
    summary:
      'Side-by-side loudness comparison of brickwall limiters vs. transparent broadcast look-ahead compressors on 320kbps MP3 and AAC encodes.',
    status: 'published',
    publishedAt: '2026-11-06',
    durationSec: 1984,
    fileSizeMb: 45.4,
    audioFormat: 'MP3 320kbps CBR',
    loudnessLufs: -16.1,
    explicit: false,
    enclosureUrl: 'https://cdn.uplink.drfun1media.com/audio/console-s03e41-mpd-mastering.mp3',
    downloads: 29140,
    completionRate: 89,
    chapters: [
      { timeSec: 0, title: 'True-Peak Limits at -1.0 dBTP' },
      { timeSec: 880, title: 'SHOUTcast Icecast2 Pass-Through Mode' },
    ],
    transcript: [
      { timeSec: 0, speaker: 'Audio Producer', text: 'Preventing inter-sample peaks keeps AAC streams clean on mobile devices.' },
    ],
    daiSlots: { preRoll: true, midRoll: false, postRoll: false },
    syncedToIrc: true,
    syncedToShoutcast: true,
  },
  {
    id: 'ep-301',
    showId: 'show-federal-docket',
    season: 2,
    episodeNumber: 12,
    title: 'Supreme Court Oversight of Broadcast Host Hiring & FCC FRN Compliance',
    subtitle: 'Judicial standards under supremecourt.gov & The Law Office of Richard A. Witt LLC',
    summary:
      'Examining federal compliance workflows ensuring every on-air DJ and podcast host operating on the DrFun1 Media network passes verified vetting via www.wittlawfirm.com.',
    status: 'published',
    publishedAt: '2026-11-12',
    durationSec: 2670,
    fileSizeMb: 51.0,
    audioFormat: 'AAC 256kbps',
    loudnessLufs: -16.0,
    explicit: false,
    enclosureUrl: 'https://cdn.uplink.drfun1media.com/audio/docket-s02e12-scotus-hiring.mp3',
    downloads: 21380,
    completionRate: 93,
    chapters: [
      { timeSec: 0, title: 'FRN 0034981290 Statutory Charter' },
      { timeSec: 940, title: 'DJ & Host Clearance Pipeline via Witt Law Firm' },
      { timeSec: 1980, title: 'Owens Company Bill-in-Receiving Royalty Settlement' },
    ],
    transcript: [
      { timeSec: 0, speaker: 'Counsel (Witt Law)', text: 'Public trust in nationwide audio syndication starts with auditable host vetting.' },
      { timeSec: 940, speaker: 'Counsel (Witt Law)', text: 'Every station callsign and podcast feed ties cleanly back to verified judicial counsel records.' },
    ],
    daiSlots: { preRoll: false, midRoll: false, postRoll: false },
    syncedToIrc: true,
    syncedToShoutcast: true,
  },
  {
    id: 'ep-401',
    showId: 'show-fiber-mesh',
    season: 1,
    episodeNumber: 9,
    title: 'Deploying HOPM v1.1.10 Across 4 Core Hubs to Protect Podcast RSS Scrapers',
    subtitle: 'Rate-limiting abusive bots without touching legitimate Apple/Spotify crawlers',
    summary:
      'How HOPM proxy scanning and UnrealIRCd spamfilters protect podcast RSS origins and WebIRC rooms simultaneously.',
    status: 'published',
    publishedAt: '2026-11-10',
    durationSec: 2290,
    fileSizeMb: 52.4,
    audioFormat: 'MP3 320kbps CBR',
    loudnessLufs: -16.0,
    explicit: false,
    enclosureUrl: 'https://cdn.uplink.drfun1media.com/audio/mesh-s01e09-hopm-protection.mp3',
    downloads: 14760,
    completionRate: 87,
    chapters: [
      { timeSec: 0, title: 'Botnet vs. Verified Podcast Aggregators' },
      { timeSec: 1120, title: 'Switch & RisingNet Edge ACL Tuning' },
    ],
    transcript: [
      { timeSec: 0, speaker: 'NetAdmin Lead', text: 'Verified IAB v2.1 download filtering ignores automated proxy hits in real time.' },
    ],
    daiSlots: { preRoll: true, midRoll: true, postRoll: false },
    syncedToIrc: true,
    syncedToShoutcast: false,
  },
];

export const INITIAL_PODCAST_DIRECTORIES: PodcastDirectoryListing[] = [
  { id: 'dir-apple', platform: 'Apple Podcasts', protocol: 'iTunes RSS 2.0', status: 'live', directoryUrl: 'https://podcasts.apple.com/drfun1-uplink', lastSync: '2 mins ago' },
  { id: 'dir-spotify', platform: 'Spotify for Podcasters', protocol: 'Spotify RSS Passthrough', status: 'live', directoryUrl: 'https://open.spotify.com/show/drfun1', lastSync: '4 mins ago' },
  { id: 'dir-index', platform: 'Podcast Index (Podcasting 2.0)', protocol: 'WebSub + Value4Value', status: 'live', directoryUrl: 'https://podcastindex.org/podcast/drfun1', lastSync: 'Just now' },
  { id: 'dir-amazon', platform: 'Amazon Music & Audible', protocol: 'Verified HTTPS Enclosure', status: 'live', directoryUrl: 'https://music.amazon.com/podcasts/drfun1', lastSync: '11 mins ago' },
  { id: 'dir-youtube', platform: 'YouTube Podcasts RSS Ingest', protocol: 'RSS -> Video Auto-Render', status: 'live', directoryUrl: 'https://youtube.com/@DrFun1Media/podcasts', lastSync: '18 mins ago' },
  { id: 'dir-overcast', platform: 'Overcast & Pocket Casts', protocol: 'Real-Time Ping Hook', status: 'live', directoryUrl: 'https://overcast.fm/drfun1', lastSync: '6 mins ago' },
  { id: 'dir-shoutcast', platform: 'DrFun1 855k SHOUTcast Pod-Relay', protocol: 'Icecast2 + IRC Announce', status: 'live', directoryUrl: 'https://radio.drfun1media.com/podcasts', lastSync: 'Live' },
];

export const INITIAL_DAI_CAMPAIGNS: PodcastDaiCampaign[] = [
  {
    id: 'dai-switch',
    advertiser: 'Switch SUPERNAP 100G Colocation (via CGW Law)',
    slotType: 'pre-roll',
    cpmUsd: 38,
    impressions: 142800,
    status: 'active',
    copyScript: 'Mission-critical broadcast & UnrealIRCd colocation powered by Switch Tier 5 Platinum.',
  },
  {
    id: 'dai-risingnet',
    advertiser: 'RisingNet AS53767 Dedicated Tier-1 Servers',
    slotType: 'mid-roll',
    cpmUsd: 52,
    impressions: 118400,
    status: 'active',
    copyScript: 'Sub-2ms anycast IRC & audio streaming transit across 10 RisingNet bare-metal nodes.',
  },
  {
    id: 'dai-wittlaw',
    advertiser: 'The Law Office of Richard A. Witt LLC (Broadcast & FCC Counsel)',
    slotType: 'post-roll',
    cpmUsd: 45,
    impressions: 84200,
    status: 'active',
    copyScript: 'FCC licensing, Supreme Court host vetting, and SATCOM compliance at www.wittlawfirm.com.',
  },
];

export const INITIAL_PRIVATE_FEEDS: PrivateSubscriberFeed[] = [
  {
    id: 'priv-1',
    subscriberEmail: 'chief.engineer@switch.com',
    label: 'Switch NOC Executive Feed',
    tokenUrl: 'https://uplink.drfun1media.com/private/tok_9a82f7d1c4/feed.xml',
    createdAt: '2026-10-02',
    lastFetchedAt: '14 mins ago',
    downloadsCount: 84,
    active: true,
  },
  {
    id: 'priv-2',
    subscriberEmail: 'docket-desk@supremecourt-cleared.gov',
    label: 'SCOTUS Host Review Private Feed',
    tokenUrl: 'https://uplink.drfun1media.com/private/tok_4e11b8f092/feed.xml',
    createdAt: '2026-10-18',
    lastFetchedAt: '1 hr ago',
    downloadsCount: 51,
    active: true,
  },
  {
    id: 'priv-3',
    subscriberEmail: 'billing@owenscompany.com',
    label: 'Owens Company Syndication Audit',
    tokenUrl: 'https://uplink.drfun1media.com/private/tok_7c39d2e518/feed.xml',
    createdAt: '2026-11-01',
    lastFetchedAt: '3 hrs ago',
    downloadsCount: 29,
    active: true,
  },
];

export const ANALYTICS_14D_SERIES: PodcastAnalyticsDay[] = [
  { day: 'Nov 01', downloads: 18420, uniqueListeners: 11240, streamedPct: 86 },
  { day: 'Nov 02', downloads: 19150, uniqueListeners: 11890, streamedPct: 87 },
  { day: 'Nov 03', downloads: 21340, uniqueListeners: 13010, streamedPct: 88 },
  { day: 'Nov 04', downloads: 20480, uniqueListeners: 12650, streamedPct: 87 },
  { day: 'Nov 05', downloads: 22910, uniqueListeners: 14120, streamedPct: 89 },
  { day: 'Nov 06', downloads: 25400, uniqueListeners: 15800, streamedPct: 90 },
  { day: 'Nov 07', downloads: 27840, uniqueListeners: 17120, streamedPct: 91 },
  { day: 'Nov 08', downloads: 26190, uniqueListeners: 16400, streamedPct: 90 },
  { day: 'Nov 09', downloads: 24980, uniqueListeners: 15590, streamedPct: 89 },
  { day: 'Nov 10', downloads: 28750, uniqueListeners: 17940, streamedPct: 92 },
  { day: 'Nov 11', downloads: 30420, uniqueListeners: 19210, streamedPct: 92 },
  { day: 'Nov 12', downloads: 32890, uniqueListeners: 20650, streamedPct: 93 },
  { day: 'Nov 13', downloads: 36410, uniqueListeners: 22980, streamedPct: 94 },
  { day: 'Nov 14', downloads: 39180, uniqueListeners: 24720, streamedPct: 94 },
];

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${mins}:${pad(secs)}`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generatePodcastRssXml(show: PodcastShow, episodes: PodcastEpisode[]): string {
  const published = episodes.filter((e) => e.status === 'published');
  const itemsXml = published
    .map(
      (ep) => `    <item>
      <title>${escapeXml(ep.title)}</title>
      <itunes:title>${escapeXml(ep.title)}</itunes:title>
      <itunes:subtitle>${escapeXml(ep.subtitle)}</itunes:subtitle>
      <description><![CDATA[${ep.summary}]]></description>
      <guid isPermaLink="false">${escapeXml(`drfun1-uplink-${show.id}-${ep.id}`)}</guid>
      <pubDate>${new Date(ep.publishedAt + 'T14:00:00Z').toUTCString()}</pubDate>
      <enclosure url="${escapeXml(ep.enclosureUrl)}" length="${Math.round(ep.fileSizeMb * 1048576)}" type="${ep.audioFormat.startsWith('AAC') ? 'audio/mp4' : 'audio/mpeg'}" />
      <itunes:duration>${ep.durationSec}</itunes:duration>
      <itunes:season>${ep.season}</itunes:season>
      <itunes:episode>${ep.episodeNumber}</itunes:episode>
      <itunes:explicit>${ep.explicit ? 'true' : 'false'}</itunes:explicit>
      <podcast:transcript url="https://uplink.drfun1media.com/transcripts/${escapeXml(ep.id)}.vtt" type="text/vtt" />
      <podcast:chapters url="https://uplink.drfun1media.com/chapters/${escapeXml(ep.id)}.json" type="application/json+chapters" />
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:podcast="https://podcastindex.org/namespace/1.0"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(show.title)}</title>
    <link>https://${escapeXml(show.customDomain)}</link>
    <atom:link href="${escapeXml(show.rssUrl)}" rel="self" type="application/rss+xml" />
    <atom:link href="https://pubsubhubbub.appspot.com/" rel="hub" />
    <language>${escapeXml(show.language)}</language>
    <copyright>${escapeXml(show.copyright)}</copyright>
    <itunes:author>${escapeXml(show.author)}</itunes:author>
    <itunes:summary>${escapeXml(show.description)}</itunes:summary>
    <description>${escapeXml(show.description)}</description>
    <itunes:category text="${escapeXml(show.category)}" />
    <itunes:explicit>${show.explicit ? 'true' : 'false'}</itunes:explicit>
    <itunes:image href="https://uplink.drfun1media.com${escapeXml(show.coverUrl)}" />
    <podcast:guid>drfun1-podserv-${escapeXml(show.id)}</podcast:guid>
    <podcast:locked>no</podcast:locked>
    <generator>DrFun1 Podcasting Uplink (Podserv Engine)</generator>
${itemsXml}
  </channel>
</rss>`;
}

export function generatePodcastOpmlXml(shows: PodcastShow[]): string {
  const outlines = shows
    .map(
      (s) =>
        `    <outline text="${escapeXml(s.title)}" title="${escapeXml(s.title)}" type="rss" xmlUrl="${escapeXml(s.rssUrl)}" htmlUrl="https://${escapeXml(s.customDomain)}" />`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>DrFun1 Podcasting Uplink Network OPML</title>
    <dateCreated>${new Date().toUTCString()}</dateCreated>
    <ownerName>DrFun1 Media Inc.</ownerName>
  </head>
  <body>
${outlines}
  </body>
</opml>`;
}
