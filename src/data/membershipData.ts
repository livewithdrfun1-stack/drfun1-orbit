import {
  MembershipPlan,
  UserMembershipState,
  CommunityDiscussionTopic,
  CommunityChannelSpotlight,
  CommunityEvent
} from '../types/membership';

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'cadet_free',
    name: 'Cadet Broadcaster',
    badge: 'FREE CADET',
    tagline: 'Standard free access to public teleports, WebIRC guest access, and open satcom feeds.',
    monthlyPrice: 0,
    annualPrice: 0,
    color: 'emerald',
    accentBg: 'bg-emerald-950/20',
    borderClass: 'border-emerald-500/30 hover:border-emerald-500/60',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    zncBufferLines: 100,
    maxBroadcastChannels: 1,
    maxIrcRooms: 3,
    hostingDiscountPercent: 0,
    adRevenueSharePercent: 0,
    supportLevel: 'Community Forums',
    features: [
      'Unlimited tuning of public DRFUN1 TV & Radio channels',
      'Standard WebIRC access on irc.drfun1.com (#drfun1, #space)',
      'Basic ephemeral ZNC bouncer (100 scrollback lines)',
      'Community discussion read and post privileges',
      'Real-time orbital tracking and open telemetry radar',
      'FCC FRN #0034981290 public tariff & regulatory viewer'
    ]
  },
  {
    id: 'broadcaster_pro',
    name: 'Broadcaster Pro',
    badge: 'PRO TIER',
    tagline: 'For independent TV/Radio station creators, HAM operators, and 24/7 streaming nodes.',
    monthlyPrice: 19,
    annualPrice: 190, // $190/yr (~$15.83/mo, 2 months free)
    isPopular: true,
    color: 'cyan',
    accentBg: 'bg-cyan-950/25',
    borderClass: 'border-cyan-500/50 hover:border-cyan-400 shadow-lg shadow-cyan-950/40',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    zncBufferLines: 2000,
    maxBroadcastChannels: 5,
    maxIrcRooms: 15,
    hostingDiscountPercent: 10,
    adRevenueSharePercent: 50,
    supportLevel: 'Standard Email & Ticket',
    features: [
      'Create and host up to 5 custom Linear TV/Radio stations',
      '1:1 IRC room registration with ChanServ (+s / +r / +t keys)',
      '2,000-line persistent ZNC bouncer on irc.drfun1media.com',
      'HLS & RTMP multi-stream restreaming (YouTube, Twitch, Kick)',
      'Custom Electronic Program Guide (EPG) scheduler',
      'Verified Witt Law Broadcaster Certification checkmark',
      '10% discount on DataPacket & RisingNet hosting packages',
      '50% ad revenue split on SCTE-35 insertion cue tags'
    ]
  },
  {
    id: 'satcom_enterprise',
    name: 'Satcom Enterprise',
    badge: 'SATCOM LEAF',
    tagline: 'Dedicated teleport uplinkers, ISP relays, and wholesale DataPacket reseller operators.',
    monthlyPrice: 99,
    annualPrice: 990,
    color: 'amber',
    accentBg: 'bg-amber-950/25',
    borderClass: 'border-amber-500/50 hover:border-amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    zncBufferLines: 5000,
    maxBroadcastChannels: 25,
    maxIrcRooms: 50,
    hostingDiscountPercent: 20,
    adRevenueSharePercent: 70,
    supportLevel: '24/7 Teleport NOC Priority',
    features: [
      '25 custom broadcast channels with 4K UHD 60fps HEVC uplink',
      'Dedicated UnrealIRCd leaf link block (SID reserved)',
      '5,000-line always-on persistent ZNC bouncer profile',
      'Wholesale DataPacket 10Gbps unmetered rack pricing',
      'Direct RF transponder carrier monitoring & spectrum analyzer',
      'Custom rDNS & white-label satellite station branding',
      'Escrow lease contract review by Richard Alan Witt LLC',
      '24/7 dedicated teleport NOC emergency phone hotline'
    ]
  },
  {
    id: 'vip_founder',
    name: 'VIP Founder Council',
    badge: 'FOUNDING COUNCIL',
    tagline: 'Top-tier netadmins, satellite fleet patrons, and network infrastructure governance.',
    monthlyPrice: 299,
    annualPrice: 2990,
    color: 'purple',
    accentBg: 'bg-purple-950/30',
    borderClass: 'border-purple-500/60 hover:border-purple-400 shadow-xl shadow-purple-950/50',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-400/50',
    zncBufferLines: 10000,
    maxBroadcastChannels: 999,
    maxIrcRooms: 999,
    hostingDiscountPercent: 30,
    adRevenueSharePercent: 85,
    supportLevel: 'Dedicated NetAdmin Concierge',
    features: [
      'Unlimited broadcast channels & transponder relay slots',
      'UnrealIRCd NetAdmin oper privileges (O-Line / OperServ)',
      '10,000-line multi-network ZNC bouncer on drfun1media.com',
      'Voting rights on DRFUN1 Teleport Network governance & hubs',
      '30% wholesale discount on all Dedicated & VPS server lines',
      'Direct line to Lead Counsel Richard A. Witt for licensing filings',
      'Permanent Founders Wall gold plaque & verified council badge',
      'Dedicated teleport fiber cross-connect facilitation'
    ]
  }
];

export const DEFAULT_MEMBERSHIP_STATE: UserMembershipState = {
  tierId: 'cadet_free',
  cycle: 'monthly',
  memberId: 'DR1-9042-CDT',
  callsign: 'K9FUN-GUEST',
  joinDate: '2025-01-15',
  renewalDate: '2026-02-15',
  zncUsername: 'guest_teleport',
  zncServer: 'irc.drfun1media.com:6697',
  activeChannelsRegistered: ['#drfun1', '#teleport-lounge'],
  invoices: [
    {
      id: 'INV-2025-001',
      date: '2025-01-15',
      planName: 'Cadet Broadcaster (Free Tier)',
      amount: 0.00,
      cycle: 'monthly',
      status: 'Paid',
      invoicePdfRef: 'RAW-ITT-9042-01.pdf'
    }
  ],
  reputationPoints: 145
};

export const INITIAL_COMMUNITY_TOPICS: CommunityDiscussionTopic[] = [
  {
    id: 'topic-1',
    title: 'How to route OBS Studio into irc.drfun1media.com with automatic song / title metadata in #broadcasters',
    author: {
      name: 'Capt. Dave Morrison',
      callsign: 'N3SAT',
      tier: 'vip_founder'
    },
    category: 'Broadcasting & Teleports',
    createdAt: '2 hours ago',
    replyCount: 18,
    upvotes: 42,
    pinned: true,
    content: 'We just updated the UnrealIRCd / ZNC relay hook so that your Icecast/HLS encoder push script can automatically announce "Now Playing" and bitrates to your registered channel on irc.drfun1media.com. Make sure your ChanServ bot has +v (voice) or +o (op) privileges so it doesn’t trigger anti-flood bans on leaf links!',
    tags: ['OBS', 'Icecast', 'ZNC', 'Metadata', 'Leaf'],
    linkedIrcChannel: '#broadcasters'
  },
  {
    id: 'topic-2',
    title: 'DataPacket Frankfurt & Chicago 10Gbps unmetered nodes: Benchmarks for 4K HEVC Teleport feeds',
    author: {
      name: 'Elena Rostova',
      callsign: 'UB4NOC',
      tier: 'satcom_enterprise'
    },
    category: 'DataPacket Hosting',
    createdAt: '5 hours ago',
    replyCount: 9,
    upvotes: 27,
    content: 'We benchmarked the DataPacket Dual AMD EPYC 9354 server in Frankfurt (fra-hub01) against the Chicago teleport uplink. Zero packet drop across 12 concurrent 40 Mbps 4K feeds. Latency between UnrealIRCd leaf nodes sits under 14ms across the trans-Atlantic dedicated pipe.',
    tags: ['DataPacket', '10Gbps', 'HEVC', 'UnrealIRCd', 'Frankfurt'],
    linkedIrcChannel: '#datapacket-resellers'
  },
  {
    id: 'topic-3',
    title: 'ZNC 1.9.1 SASL External CertFP Authentication Setup Guide for irc.drfun1media.com',
    author: {
      name: 'SysAdmin_Zack',
      callsign: 'W1ZNC',
      tier: 'broadcaster_pro'
    },
    category: 'IRC & ZNC Bouncers',
    createdAt: '1 day ago',
    replyCount: 14,
    upvotes: 35,
    content: 'No more typing /msg NickServ IDENTIFY password every time your connection drops. With ZNC 1.9.1 leafed between irc.drfun1.com and irc.drfun1media.com, you can attach your client TLS certificate fingerprint directly to CertFP. Here is the step-by-step config template.',
    tags: ['ZNC', 'CertFP', 'SASL', 'Security', 'SSL/TLS'],
    linkedIrcChannel: '#znc-support'
  },
  {
    id: 'topic-4',
    title: 'FCC FRN #0034981290 Compliance: SCTE-35 Ad Cueing and Low-Power Broadcaster Guidelines',
    author: {
      name: 'Legal Desk - Witt Law LLC',
      callsign: 'LEGAL-WITT',
      tier: 'vip_founder'
    },
    category: 'FCC & Witt Law Regulatory',
    createdAt: '2 days ago',
    replyCount: 31,
    upvotes: 68,
    pinned: true,
    content: 'Official notice from The Law Office of Richard A. Witt LLC: All Broadcaster Pro and Enterprise member stations inserting digital ad replacement tags (SCTE-35) or restreaming public access TV must ensure their closed captioning EIA-708 streams adhere to Title 47 CFR Part 79. Template agreements are now in the member escrow library.',
    tags: ['FCC', 'SCTE-35', 'WittLaw', 'Legal', 'Compliance'],
    linkedIrcChannel: '#fcc-wittlaw'
  },
  {
    id: 'topic-5',
    title: 'Tracking NOAA-20 & MetOp-C HRPT Weather Satellite Passes using our Web C-Band Teleport',
    author: {
      name: 'SkyWatcher_Mike',
      callsign: 'KB8WX',
      tier: 'cadet_free'
    },
    category: 'Satcom RF & Orbitals',
    createdAt: '3 days ago',
    replyCount: 7,
    upvotes: 19,
    content: 'Just tuned in to the West Virginia teleport dish during the NOAA-20 1707.0 MHz HRPT pass. Received crystal-clear thermal infrared imagery of the Gulf stream. You can watch the raw IQ waterfall stream in the Orbits view!',
    tags: ['NOAA', 'WeatherSat', 'HRPT', 'SDR', 'C-Band'],
    linkedIrcChannel: '#space'
  }
];

export const COMMUNITY_CHANNEL_SPOTLIGHTS: CommunityChannelSpotlight[] = [
  {
    id: 'spotlight-1',
    channelName: 'DRFUN1 Deep Space Live',
    operatorName: 'Orion Teleport Ops',
    operatorCallsign: 'N9DSP',
    operatorTier: 'vip_founder',
    category: 'Spaceflight & NASA Live',
    description: '24/7 direct C-band downlink from deep space tracking arrays, ISS external camera feeds, and real-time solar flare telemetry.',
    streamUrl: 'https://stream.drfun1.com/hls/deepspace.m3u8',
    ircChannel: '#space',
    currentListeners: 412,
    bitrate: '1080p60 6500 kbps',
    verifiedWittLaw: true
  },
  {
    id: 'spotlight-2',
    channelName: 'K9FUN Ham Radio Repeater Net',
    operatorName: 'Tri-State Amateur Radio Club',
    operatorCallsign: 'W8USA',
    operatorTier: 'satcom_enterprise',
    category: 'Amateur HAM Radio',
    description: 'Simulcast of 146.520 MHz FM simplex & Echolink node #49021 linked to the Midwest microwave backbone.',
    streamUrl: 'https://stream.drfun1.com/audio/k9fun_repeater.mp3',
    ircChannel: '#hamradio',
    currentListeners: 189,
    bitrate: '320 kbps Opus Hi-Fi',
    verifiedWittLaw: true
  },
  {
    id: 'spotlight-3',
    channelName: 'CyberWave 98.4 FM - Synth & Lo-Fi',
    operatorName: 'DJ NeonCircuit',
    operatorCallsign: 'KC3SYN',
    operatorTier: 'broadcaster_pro',
    category: 'Synthwave & Electronic DJ',
    description: 'Continuous retro wave, outrun, and cyberpunk ambient electronics with live chat requests and visual spectrum analyzer.',
    streamUrl: 'https://stream.drfun1.com/audio/cyberwave.mp3',
    ircChannel: '#cyberwave',
    currentListeners: 275,
    bitrate: '320 kbps FLAC/AAC',
    verifiedWittLaw: true
  },
  {
    id: 'spotlight-4',
    channelName: 'Great Lakes PEG Public Television',
    operatorName: 'Citizens Media Alliance',
    operatorCallsign: 'WPEG-TV',
    operatorTier: 'broadcaster_pro',
    category: 'Public Access TV',
    description: 'Public, Educational, and Government cable television channel covering city council sessions, school board hearings, and local arts.',
    streamUrl: 'https://stream.drfun1.com/hls/wpeg_tv.m3u8',
    ircChannel: '#public-access',
    currentListeners: 94,
    bitrate: '720p30 2800 kbps',
    verifiedWittLaw: true
  }
];

export const COMMUNITY_EVENTS: CommunityEvent[] = [
  {
    id: 'event-1',
    title: 'Falcon Heavy Orbital Insertion Watch Party & Live Telemetry Sync',
    hostName: 'Dr. Arthur Sterling',
    hostCallsign: 'K2SAT',
    date: 'Friday, Feb 20, 2026',
    timeUtc: '21:30 UTC (4:30 PM EST)',
    category: 'Rocket Launch Watch Party',
    description: 'Live broadcast of the Falcon Heavy satellite delivery with real-time orbital trajectory telemetry on the DRFUN1 Radar map. Chat and audio commentary in #space on irc.drfun1media.com.',
    ircChannel: '#space',
    streamUrl: 'https://stream.drfun1.com/hls/deepspace.m3u8',
    rsvpCount: 238,
    isUserRsvpd: true
  },
  {
    id: 'event-2',
    title: 'Monthly UnrealIRCd & ZNC Network Operators Round Table',
    hostName: 'DRFUN1 NOC Admin Team',
    hostCallsign: 'ROOT-DR1',
    date: 'Saturday, Feb 28, 2026',
    timeUtc: '18:00 UTC (1:00 PM EST)',
    category: 'IRC NetMeeting',
    description: 'Open voice & text meeting for server opers, leaf maintainers, and ZNC bouncer users. We will discuss UnrealIRCd 6.1.4 spamfilter rules, CertFP adoption, and leaf hub failover.',
    ircChannel: '#broadcasters',
    rsvpCount: 84,
    isUserRsvpd: false
  },
  {
    id: 'event-3',
    title: 'Building a 24/7 Community Station with OBS, Icecast & DataPacket VPS',
    hostName: 'Elena Rostova',
    hostCallsign: 'UB4NOC',
    date: 'Tuesday, Mar 3, 2026',
    timeUtc: '19:00 UTC (2:00 PM EST)',
    category: 'Broadcaster Workshop',
    description: 'Live technical walkthrough for Broadcaster Pro and Cadet members on spinning up an automated streaming container on DataPacket VPS, binding SSL certificates, and wiring SCTE-35 ad triggers.',
    ircChannel: '#datapacket-resellers',
    rsvpCount: 156,
    isUserRsvpd: false
  }
];
