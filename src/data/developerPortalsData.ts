/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Seed Data for dev.twitch.tv, dev.kick.com, User Profiles, Forums, and FAQ
 */

import { 
  TwitchDevConfig, 
  KickDevConfig, 
  BroadcasterUserProfile, 
  ForumThread, 
  FaqItem 
} from '../types/developerPortals';

export const DEFAULT_TWITCH_DEV_CONFIG: TwitchDevConfig = {
  clientId: 'drfun1_helix_client_99a8b7',
  clientSecret: 'live_secret_sk_wittlaw_orbit2026',
  appAccessToken: 'oauth:2b8d9f10a8c437e29a0f41bc88190',
  userOAuthToken: 'oauth:usr_9921_tw_drfun1_broadcast',
  broadcasterId: '98412034',
  channelName: 'drfun1tv',
  selectedScopes: [
    'channel:manage:broadcast',
    'chat:read',
    'chat:edit',
    'channel:read:subscriptions',
    'bits:read',
    'channel:manage:redemptions',
    'clips:edit'
  ],
  ingestServer: 'rtmp://sfo.contribute.live-video.net/app/',
  streamKey: 'live_98412034_kZ8mQ10px9VbN72wQ',
  isEventSubActive: true,
  eventSubEndpoint: 'https://stream.drfun1.com/api/twitch/eventsub/webhook',
  chatBotNick: 'DrFun1OrbitBot',
  chatBotChannel: '#drfun1tv',
  channelPointsRewardTitle: 'Trigger SCTE-35 Break on DrFun1TV',
  channelPointsCost: 500,
};

export const DEFAULT_KICK_DEV_CONFIG: KickDevConfig = {
  apiKey: 'kick_live_api_88921a4f02be8d12',
  botUsername: 'DrFun1KickBot',
  botToken: 'bot_auth_kck_990142_switch_supernap',
  channelSlug: 'drfun1tv',
  chatroomId: '3819402',
  webhookUrl: 'https://stream.drfun1.com/api/kick/webhooks/v2',
  webhookSecret: 'whsec_kick_90912a7bf83c',
  rtmpStreamUrl: 'rtmps://fa723fc1b171.global-contribute.live-video.net:443/app/',
  rtmpStreamKey: 'sk_us-west_99120482_kick_drfun1',
  pusherCluster: 'us2',
  isPusherConnected: true,
  monetizationSplitPercent: 95,
  subscriptionTierPrice: 4.99,
};

export const DEFAULT_USER_PROFILE: BroadcasterUserProfile = {
  id: 'usr_raw_drfun1_01',
  username: 'richard_witt',
  displayName: 'Richard Alan Witt',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  bio: 'Master Broadcaster & Legal Counsel at The Law Office of Richard A. Witt LLC (www.wittlawfirm.com / www.owenscompany.com). Managing DrFun1TV linear satellite playout, Switch SUPERNAP optical teleport, and UnrealIRCd mesh.',
  role: 'Master Broadcaster',
  email: 'livewithdrfun1@gmail.com',
  website: 'https://www.wittlawfirm.com',
  twitchUsername: 'drfun1tv',
  kickUsername: 'drfun1tv',
  unrealIrcNick: 'RichardAlanWitt',
  wittLawLicenseId: 'RAW-SATCOM-2026-LIC-0881',
  fccStationAffiliation: 'WDF1-TV / FRN 0034981290',
  customBadge: 'Master NetAdmin Level 10000',
  totalBroadcastHours: 14820,
  totalChannelsManaged: 34,
  subscriberCount: 28450,
  apiTokensCount: 12,
};

export const INITIAL_FORUM_THREADS: ForumThread[] = [
  {
    id: 'th-01',
    category: 'dev_twitch',
    title: 'Connecting Twitch EventSub WebSockets to DrFun1TV SCTE-35 Ad Splice Trigger',
    authorName: 'Richard Alan Witt',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    authorRole: 'Witt Law Certified NetAdmin',
    content: 'We successfully linked Twitch EventSub "channel.ad_break.begin" and Channel Points redemptions directly into the DrFun1TV Cadjin master control switcher. When a viewer redeems points or an ad cue is dispatched via Helix REST API, the SCTE-35 cue starts with zero dropped frames.',
    codeSnippet: `// Twitch Helix REST API - Trigger Commercial via dev.twitch.tv
const triggerTwitchAdBreak = async (broadcasterId, lengthSeconds = 30) => {
  const res = await fetch('https://api.twitch.tv/helix/channels/commercial', {
    method: 'POST',
    headers: {
      'Client-Id': 'drfun1_helix_client_99a8b7',
      'Authorization': 'Bearer oauth:usr_9921_tw_drfun1_broadcast',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      broadcaster_id: broadcasterId,
      length: lengthSeconds
    })
  });
  const data = await res.json();
  console.log('[Twitch Helix Commercial Result]:', data);
  return data;
};`,
    codeLanguage: 'javascript',
    tags: ['dev.twitch.tv', 'Helix API', 'EventSub', 'SCTE-35', 'DrFun1TV'],
    timestamp: '2 hours ago',
    repliesCount: 3,
    upvotes: 42,
    views: 618,
    isSolved: true,
    isPinned: true,
    replies: [
      {
        id: 'rep-01-1',
        threadId: 'th-01',
        authorName: 'DJ Orbit Nova',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        authorRole: 'Station DJ / Ops',
        content: 'Confirmed working on WDF1-TV 4K feed! Audio limiter stays at -23.4 LUFS without clipping during transitions.',
        timestamp: '1 hour ago',
        upvotes: 14,
      },
      {
        id: 'rep-01-2',
        threadId: 'th-01',
        authorName: 'Switch Teleport Lead',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        authorRole: 'Infrastructure Engineer',
        content: 'We routed this over the Switch SUPERNAP 100G fiber ring in Las Vegas. Latency is sub-2.4ms.',
        timestamp: '45 mins ago',
        upvotes: 9,
      }
    ]
  },
  {
    id: 'th-02',
    category: 'dev_kick',
    title: 'dev.kick.com Webhook Ingest & 95/5 Revenue Split Telemetry Integration',
    authorName: 'Kick_Dev_Lead',
    authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    authorRole: 'Kick Verified Developer',
    content: 'Kick API v2 enables real-time stream status polling and Pusher WebSocket chatroom bridging. Here is how you configure the RTMP stream key and Pusher connection for DrFun1TV Restream.io multistream.',
    codeSnippet: `// Kick Developer Portal - Pusher WebSocket Chat Ingest
import Pusher from 'pusher-js';

const kickPusher = new Pusher('32cbd69e4b950bf97679', {
  cluster: 'us2',
  forceTLS: true,
});

const channel = kickPusher.subscribe('chatrooms.3819402.v2');
channel.bind('App\\\\Events\\\\ChatMessageEvent', (event) => {
  console.log('[Kick Chat Message]:', event.sender.username, event.content);
  // Bridge into DrFun1 UnrealIRCd irc.drfun1.com #drfun1tv
});`,
    codeLanguage: 'javascript',
    tags: ['dev.kick.com', 'Pusher WS', 'Kick API v2', '95/5 Split', 'Restream'],
    timestamp: '5 hours ago',
    repliesCount: 2,
    upvotes: 38,
    views: 490,
    isSolved: true,
    isPinned: true,
    replies: [
      {
        id: 'rep-02-1',
        threadId: 'th-02',
        authorName: 'Richard Alan Witt',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        authorRole: 'Witt Law Certified NetAdmin',
        content: 'Great implementation. We also bridged Kick subscription events directly to UnrealIRCd notice banners.',
        timestamp: '3 hours ago',
        upvotes: 18,
      }
    ]
  },
  {
    id: 'th-03',
    category: 'drfun1tv_playout',
    title: 'Strimm.com Linear Schedule Sequencer with Dynamic News Crawl & Logo Bug',
    authorName: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    authorRole: 'Playout Architect',
    content: 'For automated 24/7 TV channels created with the "Start Your Own Channel" wizard, you can dynamically pass custom HTML5 canvas overlays for corner logo bugs, lower thirds, and breaking news tickers while synchronizing to dedicated 1:1 IRC channels.',
    tags: ['DrFun1TV', 'Strimm', 'Linear Playout', 'News Crawl', 'Logo Bug'],
    timestamp: '1 day ago',
    repliesCount: 4,
    upvotes: 27,
    views: 380,
    isSolved: false,
    replies: []
  },
  {
    id: 'th-04',
    category: 'legal_compliance',
    title: 'FCC Part 73 Digital Subcarrier & Witt Law Firm Global Master Reseller Terms',
    authorName: 'Richard Alan Witt',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    authorRole: 'Witt Law Certified NetAdmin',
    content: 'Review the regulatory framework governing FCC Facility IDs, FRN 0034981290, and co-branded turnkey reseller rights certified via www.wittlawfirm.com. All stations launched on DrFun1TV inherit carrier-grade indemnification.',
    tags: ['FCC.gov', 'Witt Law Firm', 'Reseller Agreement', 'Compliance'],
    timestamp: '2 days ago',
    repliesCount: 1,
    upvotes: 53,
    views: 820,
    isSolved: true,
    replies: []
  },
  {
    id: 'th-05',
    category: 'satellite_carrier',
    title: 'RF Transponder Auto-Scanner: Ingesting 22+ DrFun1 ECOM Cable & Satellite Stations',
    authorName: 'Capt. Richard Alan Witt',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    authorRole: 'Master Station Operator',
    content: 'The new RF Transponder Auto-Scanner allows station operators to sweep Ka-band, Ku-band, C-band, Optical Laser (1550nm DWDM), and QAM-256 digital cable headends across DrFun1 ECOM\'s FCC-licensed teleport network. Discovered feeds can be added to your master EPG with 1:1 dedicated UnrealIRCd synchronization.',
    codeSnippet: `// Demodulate DrFun1 ECOM DVB-S2 & QAM-256 Transponder Carriers
const scanDrFun1Transponders = async (targetBand = 'all') => {
  const endpoint = \`https://stream.drfun1.com/api/rf/scan?band=\${targetBand}\`;
  const res = await fetch(endpoint, {
    headers: {
      'Authorization': 'Bearer RAW-SATCOM-2026-LIC-0881',
      'X-FCC-FRN': '0034981290'
    }
  });
  const { lockedTransponders } = await res.json();
  console.log(\`[RF Scanner]: \${lockedTransponders.length} DrFun1 stations locked.\`);
  return lockedTransponders;
};`,
    codeLanguage: 'javascript',
    tags: ['RF Scanner', 'DrFun1 ECOM', 'DVB-S2', 'QAM Cable', 'Transponder Lock'],
    timestamp: '15 mins ago',
    repliesCount: 2,
    upvotes: 68,
    views: 310,
    isSolved: true,
    isPinned: true,
    replies: [
      {
        id: 'rep-05-1',
        threadId: 'th-05',
        authorName: 'Switch Teleport Lead',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        authorRole: 'Infrastructure Engineer',
        content: 'Lock time is under 180ms across all 22 carriers on Switch SUPERNAP dish clusters in Nevada. SNR exceeds +19.4 dB with zero bit error rate.',
        timestamp: '10 mins ago',
        upvotes: 18,
      }
    ]
  }
];

export const INITIAL_FAQ_ITEMS: FaqItem[] = [
  // ========================================================
  // Pillar 0: Platform Navigation & Master Studio Tour
  // ========================================================
  {
    id: 'faq-nav-1',
    category: 'platform_navigation',
    question: 'How do I navigate between the broadcast tools in DrFun1TV & Master Studio?',
    answer: 'DrFun1TV & Master Broadcast Studio unifies 10 professional broadcast and developer systems into one interface. Use the studio tool tabs directly below the live monitor: 1. DrFun1TV Playout (Strimm.com linear sequencer), 2. FCC EPG Guide (FCC-registered station matrix), 3. Restream.io Multistream (cloud RTMP distribution), 4. dev.twitch.tv (Helix REST API & EventSub), 5. dev.kick.com (API v2 & Pusher WebSocket), 6. TVU Networks (bonded cellular IP grid), 7. Cablecast PEG (carousel automation & EAS alert overrides), 8. Cadjin Master Control (PGM/PVW video switcher & LUFS audio meter), 9. Broadcaster Forums, and 10. Studio FAQ Knowledge Base.',
    relatedToolId: 'strimm_drfun1tv',
  },
  {
    id: 'faq-nav-2',
    category: 'platform_navigation',
    question: 'How do I tune a TV station and synchronize with its dedicated UnrealIRCd room?',
    answer: 'Select the "FCC EPG Guide" or use the "Scan Cable/Sat Stations" tool. Each station card features a "Tune Station & Sync IRC" button. Clicking this tunes the live 4K/HD video canvas to the station\'s HLS/RTMP feed, updates the on-screen logo bug and news crawl ticker, and automatically syncs the bottom right chatroom to that station\'s dedicated 1-to-1 IRC room on irc.drfun1.com:6697 (SSL).',
    relatedToolId: 'epg_guide',
  },
  {
    id: 'faq-nav-3',
    category: 'platform_navigation',
    question: 'How do I launch a new independent TV channel with custom graphics and IRC?',
    answer: 'Click the "Start Your Own Channel" or "New Station Wizard" button. The 4-step wizard guides you through: Step 1: Identity & Call Sign (e.g. WXYZ-TV), Step 2: Playout Engine & On-Screen Overlays (corner logo bug, news crawl text), Step 3: Program Rundown & SCTE-35 Commercial Ad Intervals, and Step 4: Multi-Destination Playout with dev.twitch.tv & dev.kick.com credentials. Your channel is instantly added to your EPG with a dedicated IRC channel.',
    relatedToolId: 'strimm_drfun1tv',
  },
  {
    id: 'faq-nav-4',
    category: 'platform_navigation',
    question: 'How does the RF Spectrum Demodulator & Transponder Scanner work?',
    answer: 'Click "Scan Cable/Sat Stations" in the top banner or EPG Guide. The integrated RF demodulator performs high-speed blind scanning across Ka, Ku, C, X, S, Optical Laser (1550nm DWDM), and QAM-256 digital cable headends across DrFun1 ECOM\'s FCC-licensed fleet (FRN 0034981290). Locked carriers display signal power (dBm), SNR (dB), modulation (DVB-S2X / 256-QAM), and can be added to your studio in bulk with 1:1 IRC room sync.',
    codeExample: `# Query transponder carrier lock via CLI:
curl -X GET "https://stream.drfun1.com/api/rf/scan?band=all&owner=drfun1_ecom" \\
  -H "X-DrFun1-FRN: 0034981290" \\
  -H "X-License-Cert: RAW-SATCOM-2026-LIC-0881"`,
    relatedToolId: 'epg_guide',
  },

  // ========================================================
  // Pillar 1: dev.twitch.tv (Helix REST API & EventSub)
  // ========================================================
  {
    id: 'faq-tw-1',
    category: 'twitch_dev',
    question: 'How do I authenticate with the Twitch Helix REST API on dev.twitch.tv?',
    answer: 'Register your application on the Twitch Developer Console (dev.twitch.tv/console/apps). Obtain your Client ID and Client Secret, then request an OAuth 2.0 App Access Token or User Token with required scopes such as "channel:manage:broadcast" and "chat:read". Use the Bearer token in the Authorization header of all API calls.',
    codeExample: `curl -X POST https://id.twitch.tv/oauth2/token \\
  -d client_id=YOUR_CLIENT_ID \\
  -d client_secret=YOUR_CLIENT_SECRET \\
  -d grant_type=client_credentials`,
    relatedToolId: 'dev_twitch',
    externalLink: {
      label: 'Twitch Helix Documentation',
      url: 'https://dev.twitch.tv/docs/api/'
    }
  },
  {
    id: 'faq-tw-2',
    category: 'twitch_dev',
    question: 'How does Twitch EventSub integrate with DrFun1TV broadcast automation?',
    answer: 'Twitch EventSub provides real-time Webhook and WebSocket notifications for stream events (follow, subscribe, raid, bits, channel points). DrFun1TV listens to these events to dynamically update on-screen lower thirds, playout ticker alerts, and trigger SCTE-35 ad breaks automatically.',
    codeExample: `// EventSub Subscription Payload
{
  "type": "channel.follow",
  "version": "2",
  "condition": { "broadcaster_user_id": "98412034", "moderator_user_id": "98412034" },
  "transport": {
    "method": "webhook",
    "callback": "https://stream.drfun1.com/api/twitch/eventsub",
    "secret": "live_secret_sk_wittlaw_orbit2026"
  }
}`,
    relatedToolId: 'dev_twitch',
    externalLink: {
      label: 'Twitch EventSub Guide',
      url: 'https://dev.twitch.tv/docs/eventsub/'
    }
  },
  {
    id: 'faq-tw-3',
    category: 'twitch_dev',
    question: 'Can I connect a Twitch chatbot directly to DrFun1TV and UnrealIRCd?',
    answer: 'Yes! Twitch Chat uses an IRCv3-compliant gateway at irc.chat.twitch.tv:6697 (SSL). DrFun1TV provides a built-in cross-relay between Twitch chat and your channel\'s dedicated UnrealIRCd room on irc.drfun1.com, allowing viewers from both networks to chat together seamlessly.',
    relatedToolId: 'dev_twitch',
    externalLink: {
      label: 'Twitch IRC Guide',
      url: 'https://dev.twitch.tv/docs/irc/'
    }
  },
  {
    id: 'faq-tw-4',
    category: 'twitch_dev',
    question: 'What Twitch scopes are required for full DrFun1TV studio integration?',
    answer: 'For full automation (triggering commercial ad breaks, reading/posting chat, detecting custom reward redemptions, and updating stream titles), the following scopes are recommended: channel:manage:broadcast (commercials & stream title), chat:read & chat:edit (IRC bridge), channel:read:subscriptions (VIP badges), bits:read, channel:manage:redemptions (Channel Points to SCTE-35 trigger), and clips:edit.',
    relatedToolId: 'dev_twitch',
    externalLink: {
      label: 'Twitch OAuth Scopes List',
      url: 'https://dev.twitch.tv/docs/authentication/scopes/'
    }
  },
  {
    id: 'faq-tw-5',
    category: 'twitch_dev',
    question: 'How do Twitch Channel Points trigger on-screen SCTE-35 commercial breaks?',
    answer: 'In the dev.twitch.tv panel under Channel Points, configure a reward title such as "Trigger SCTE-35 Break on DrFun1TV" (e.g. 500 Channel Points). When a viewer redeems this reward on Twitch, the EventSub webhook automatically instructs the Cadjin master control switcher to cue a 15-second sponsor bumper with on-screen countdown timer.',
    relatedToolId: 'dev_twitch',
  },

  // ========================================================
  // Pillar 2: dev.kick.com (API v2 & Pusher WebSocket)
  // ========================================================
  {
    id: 'faq-kck-1',
    category: 'kick_dev',
    question: 'How do I access dev.kick.com and set up the Kick API v2 & Webhooks?',
    answer: 'Visit dev.kick.com to obtain your Developer API Key and Bot Authorization Token. Configure your webhook endpoint URL and select subscription events (livestream status, chat messages, follows, gifted subs). Kick webhooks send cryptographically signed JSON payloads verified using your webhook secret.',
    codeExample: `curl -X GET https://kick.com/api/v2/channels/drfun1tv \\
  -H "Authorization: Bearer YOUR_KICK_API_KEY" \\
  -H "Accept: application/json"`,
    relatedToolId: 'dev_kick',
    externalLink: {
      label: 'Kick Developer Portal',
      url: 'https://dev.kick.com'
    }
  },
  {
    id: 'faq-kck-2',
    category: 'kick_dev',
    question: 'How does Kick\'s 95/5 revenue split work with DrFun1TV community channels?',
    answer: 'Kick gives 95% of subscription revenue directly to the creator ($4.74 of a standard $4.99 sub), with only 5% retained by the platform for payment processing. Channels created and monetized through DrFun1TV and Restream.io can connect Kick sub telemetry to unlock on-screen VIP subscriber badges, automated bot shoutouts, and live creator earnings tracking.',
    relatedToolId: 'dev_kick',
    externalLink: {
      label: 'Kick Creator Program',
      url: 'https://kick.com/community-guidelines'
    }
  },
  {
    id: 'faq-kck-3',
    category: 'kick_dev',
    question: 'What RTMP settings are recommended for Kick live streaming?',
    answer: 'Kick recommends 1080p60 at 8,000 kbps CBR with 2-second keyframe intervals and AAC audio at 160-320 kbps. The RTMP ingest endpoint is rtmps://fa723fc1b171.global-contribute.live-video.net:443/app/ with your secret stream key configured in the dev.kick.com panel.',
    relatedToolId: 'dev_kick',
  },
  {
    id: 'faq-kck-4',
    category: 'kick_dev',
    question: 'How do Kick HMAC SHA-256 Webhook signatures work and how are they verified?',
    answer: 'Kick sends an "x-kick-signature" header with every webhook dispatch. The signature is a hexadecimal HMAC-SHA256 digest generated using your Webhook Secret over the raw HTTP request body string. DrFun1TV verifies this signature to prevent unauthorized event spoofing.',
    codeExample: `const crypto = require('crypto');

function verifyKickWebhook(rawBody, signatureHeader, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader));
}`,
    relatedToolId: 'dev_kick',
  },
  {
    id: 'faq-kck-5',
    category: 'kick_dev',
    question: 'How does Kick Pusher WebSocket integration provide sub-second live chat?',
    answer: 'Kick utilizes Pusher WebSockets (cluster "us2" at ws-us2.pusher.com). By subscribing to the public channel "chatrooms.{chatroom_id}.v2", DrFun1TV receives chat messages, subscriber events, and pin notices with under 200ms latency, mirrored simultaneously into the UnrealIRCd chatroom.',
    relatedToolId: 'dev_kick',
  },

  // ========================================================
  // Pillar 3: DrFun1TV & Strimm.com Linear Playout
  // ========================================================
  {
    id: 'faq-st-1',
    category: 'drfun1tv_strimm',
    question: 'What is DrFun1TV linear playout and how does it relate to Strimm.com?',
    answer: 'DrFun1TV rebrands and elevates Strimm.com\'s proven linear TV channel sequencing technology. It allows creators to schedule video programs, clips, and live feeds into continuous 24/7 broadcast schedules, complete with on-screen corner logo bugs, real-time news crawl tickers, lower thirds, and scheduled commercial breaks.',
    relatedToolId: 'strimm_drfun1tv',
  },
  {
    id: 'faq-st-2',
    category: 'drfun1tv_strimm',
    question: 'How does SCTE-35 digital ad insertion work in DrFun1TV?',
    answer: 'SCTE-35 is the broadcast industry standard for signaling digital ad insertion cues. In DrFun1TV and the Cadjin Master Control deck, clicking "Insert 15s SCTE-35 Commercial" cues a 15-second sponsor overlay with a live countdown, then smoothly transitions back to the primary broadcast playout feed without dropping stream connections.',
    relatedToolId: 'cadjin_master_control',
  },

  // ========================================================
  // Pillar 4: Restream.io Multistream
  // ========================================================
  {
    id: 'faq-rs-1',
    category: 'restream_io',
    question: 'How does DrFun1TV broadcast from Restream.io to multiple destinations simultaneously?',
    answer: 'DrFun1TV feeds its master video playout into the Restream.io cloud distribution core hosted at Switch SUPERNAP. The cloud matrix duplicates and transmuxes the stream to YouTube Live, Twitch, Kick, Facebook Live, X/Twitter, and custom RTMP endpoints with zero additional bandwidth overhead on the creator\'s local network.',
    relatedToolId: 'restream_multistream',
  },
  {
    id: 'faq-rs-2',
    category: 'restream_io',
    question: 'Can I stream simultaneously to both Twitch and Kick without violating partner terms?',
    answer: 'Both Twitch and Kick officially allow non-exclusive multistreaming to other platforms provided the stream quality on Twitch is at least as good as other platforms and chat is not obscured. Restream.io and DrFun1TV allow dual-streaming to both Twitch and Kick at 1080p60.',
    relatedToolId: 'restream_multistream',
  },

  // ========================================================
  // Pillar 5: FCC & 1:1 IRC Channels
  // ========================================================
  {
    id: 'faq-fcc-1',
    category: 'fcc_irc',
    question: 'Why does every single TV channel have a dedicated 1-to-1 IRC room?',
    answer: 'Under DrFun1 ECOM\'s telecommunications architecture, every broadcast station (WDF1-TV, CBS, ABC, CNN, NBC, Starlink, etc.) is mapped 1:1 to an UnrealIRCd channel on irc.drfun1.com:6697 (SSL). This provides instant inter-network coordination between broadcasters, teleports, and audiences across global satellite and cellular feeds.',
    relatedToolId: 'epg_guide',
  },
  {
    id: 'faq-fcc-2',
    category: 'fcc_irc',
    question: 'How do I scan for Cable & Satellite stations owned by DrFun1 ECOM Inc.?',
    answer: 'Click the "Scan Cable/Sat Stations" button in the top banner or EPG Guide. The integrated RF Demodulator & Transponder Scanner sweeps Ka, Ku, C, X, S, Optical Laser (1550nm DWDM), and QAM-256 digital cable headends across DrFun1 ECOM\'s FCC-licensed fleet (FRN 0034981290). Locked carriers can be imported in bulk or tuned directly with 1:1 dedicated IRC room synchronization.',
    codeExample: `# Test transponder carrier lock via CLI:
curl -X GET "https://stream.drfun1.com/api/rf/scan?band=all&owner=drfun1_ecom" \\
  -H "X-DrFun1-FRN: 0034981290" \\
  -H "X-License-Cert: RAW-SATCOM-2026-LIC-0881"`,
    relatedToolId: 'epg_guide',
  },

  // ========================================================
  // Pillar 6: Troubleshooting & Performance
  // ========================================================
  {
    id: 'faq-trouble-1',
    category: 'troubleshooting',
    question: 'How do I resolve audio loudness issues and comply with EBU R128 (-23.4 LUFS)?',
    answer: 'Under the Cadjin Master Control switcher tab, monitor the real-time LUFS loudness meter. Broadcast standards (CALM Act in the US, EBU R128 in Europe) require integrated loudness to normalize at -24.0 LUFS ±1.0 LUFS. DrFun1TV applies an automated brickwall audio limiter at -1.0 dBTP to avoid digital clipping during program transitions.',
    relatedToolId: 'cadjin_master_control',
  },
  {
    id: 'faq-trouble-2',
    category: 'troubleshooting',
    question: 'What should I do if my Twitch or Kick stream shows "Disconnected" or drops frames?',
    answer: '1. Verify your Stream Key in the dev.twitch.tv or dev.kick.com portal. 2. Ensure your keyframe interval is strictly set to 2.0 seconds (GOP = 120 frames at 60fps). 3. Check your uplink bitrate: for 1080p60, set CBR to 8,000 kbps. 4. Verify that TLS/SSL port 443 (RTMPS) and port 6697 (UnrealIRCd) are not blocked by local firewalls.',
    relatedToolId: 'restream_multistream',
  },

  // ========================================================
  // Pillar 7: Witt Law Firm Legal Licensing
  // ========================================================
  {
    id: 'faq-witt-1',
    category: 'witt_legal',
    question: 'How is this broadcast ecosystem licensed and certified via www.wittlawfirm.com?',
    answer: 'The entire DrFun1TV suite, FCC station directory, carrier roaming agreements, and turnkey reseller program are certified and legally held by The Law Office of Richard A. Witt LLC (www.wittlawfirm.com / www.owenscompany.com) for Richard Alan Witt under Certificate ID RAW-SATCOM-2026-LIC-0881. Contact livewithdrfun1@gmail.com for questions.',
    externalLink: {
      label: 'Witt Law Firm Official Portal',
      url: 'https://www.wittlawfirm.com'
    }
  }
];
