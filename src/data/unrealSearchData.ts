/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Official UnrealIRCd Network Search Engine Database
 */

import { UnrealServerRecord } from '../types/unrealSearch';

export const UNREAL_HUB_TARGET = {
  hostname: 'irc.drfun1.com',
  secondaryHostname: 'irc.drfun1media.com',
  sslPort: 6697,
  plainPort: 6667,
  hubSid: '001',
  networkName: 'DrFun1 Media IRC Network',
  leafAuthSecret: 'drfun1-mesh-leaf-auth-2026',
  datacenter: 'Switch SUPERNAP Las Vegas (www.switch.com)',
  transit: 'RisingNet BGP Tier-1 Transit (www.risingnet.com)',
  license: 'Licensed to Richard Alan Witt (www.wittlawfirm.com / FRN 0034981290)',
  officialPortal: 'https://stats.drfun1ircd.com'
};

export const INITIAL_UNREAL_SEARCH_INDEX: UnrealServerRecord[] = [
  {
    id: 'hub_drfun1_vegas',
    name: 'irc.drfun1.com',
    networkName: 'DrFun1 Media Global Mesh',
    hubHost: 'irc.drfun1.com',
    isLeafedToDrFun1: true,
    leafVerifiedAt: '2026-02-15T00:00:00Z',
    unrealVersion: 'UnrealIRCd-6.1.4',
    anopeVersion: 'Anope-2.1.0',
    sslPort: 6697,
    plainPort: 6667,
    ipOrHostname: 'irc.drfun1.com',
    country: 'United States',
    region: 'North America',
    locationCity: 'Las Vegas, NV',
    datacenter: 'Switch SUPERNAP 8 & 9 Core Teleport Campus',
    onlineUsers: 4210,
    onlineChannels: 184,
    onlineOpers: 14,
    latencyToHubMs: 0.8,
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (ECDHE-X25519)',
    description: 'Master Core Hub for the DrFun1 Satcom Broadcast & Space Telemetry Mesh. Hosted on 100% renewable Switch green fiber.',
    adminContact: 'admin@drfun1.com',
    websiteUrl: 'https://stats.drfun1ircd.com',
    tags: ['Master Hub', 'Switch SUPERNAP', 'Anope 2.1', 'ZNC Bouncer', 'Broadcast'],
    sampleChannels: ['#drfun1tv', '#space', '#broadcast', '#satcom', '#help'],
    linkBlockSnippet: `/* Self Master Hub */\nme {\n    name "irc.drfun1.com";\n    info "Master Hub - Switch SUPERNAP";\n    sid "001";\n};`
  },
  {
    id: 'leaf_drfun1media',
    name: 'irc.drfun1media.com',
    networkName: 'DrFun1 Media Global Mesh',
    hubHost: 'irc.drfun1.com',
    isLeafedToDrFun1: true,
    leafVerifiedAt: '2026-02-15T02:14:00Z',
    unrealVersion: 'UnrealIRCd-6.1.4',
    anopeVersion: 'Anope-2.1.0',
    sslPort: 6697,
    plainPort: 6667,
    ipOrHostname: 'irc.drfun1media.com',
    country: 'United States',
    region: 'North America',
    locationCity: 'Las Vegas, NV',
    datacenter: 'Switch SUPERNAP Las Vegas Vault 4',
    onlineUsers: 3120,
    onlineChannels: 142,
    onlineOpers: 8,
    latencyToHubMs: 1.2,
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (ECDHE-X25519)',
    description: 'Primary Media Playout & Streaming Leaf directly linked to irc.drfun1.com hub.',
    adminContact: 'livewithdrfun1@gmail.com',
    websiteUrl: 'https://stats.drfun1ircd.com',
    tags: ['Verified Leaf', 'DrFun1TV', 'ZNC Leaf', 'RisingNet BGP'],
    sampleChannels: ['#drfun1-primetv', '#mpd-dj', '#restream', '#social'],
    linkBlockSnippet: `link irc.drfun1.com {\n    incoming { mask *; };\n    outgoing {\n        bind-ip *;\n        hostname irc.drfun1.com;\n        port 6697;\n        options { ssl; };\n    };\n    password "drfun1-mesh-leaf-auth-2026";\n    class servers;\n};`
  },
  {
    id: 'leaf_reno_citadel',
    name: 'reno.citadel.drfun1.com',
    networkName: 'DrFun1 Media Global Mesh',
    hubHost: 'irc.drfun1.com',
    isLeafedToDrFun1: true,
    leafVerifiedAt: '2026-02-14T18:20:00Z',
    unrealVersion: 'UnrealIRCd-6.1.4',
    anopeVersion: 'Anope-2.1.0',
    sslPort: 6697,
    plainPort: 6667,
    ipOrHostname: 'reno.citadel.drfun1.com',
    country: 'United States',
    region: 'North America',
    locationCity: 'Tahoe Reno, NV',
    datacenter: 'Switch Citadel Campus (100% Solar-Powered)',
    onlineUsers: 1890,
    onlineChannels: 88,
    onlineOpers: 5,
    latencyToHubMs: 3.4,
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (TLS 1.3)',
    description: 'Switch Tahoe Reno High-Availability Leaf Node for North American West coast edge aggregation.',
    adminContact: 'noc-reno@drfun1.com',
    websiteUrl: 'https://www.switch.com',
    tags: ['Verified Leaf', 'Switch Citadel', 'Solar Powered', 'High Availability'],
    sampleChannels: ['#space', '#citadel-ops', '#tech'],
    linkBlockSnippet: `link irc.drfun1.com {\n    incoming { mask *; };\n    outgoing {\n        bind-ip *;\n        hostname irc.drfun1.com;\n        port 6697;\n        options { ssl; };\n    };\n    password "drfun1-mesh-leaf-auth-2026";\n    class servers;\n};`
  },
  {
    id: 'leaf_atlanta_keep',
    name: 'atlanta.keep.drfun1.com',
    networkName: 'DrFun1 Media Global Mesh',
    hubHost: 'irc.drfun1.com',
    isLeafedToDrFun1: true,
    leafVerifiedAt: '2026-02-14T12:00:00Z',
    unrealVersion: 'UnrealIRCd-6.1.4',
    anopeVersion: 'Anope-2.1.0',
    sslPort: 6697,
    plainPort: 6667,
    ipOrHostname: 'atlanta.keep.drfun1.com',
    country: 'United States',
    region: 'North America',
    locationCity: 'Atlanta, GA',
    datacenter: 'Switch The Keep Campus Tier IV',
    onlineUsers: 1450,
    onlineChannels: 74,
    onlineOpers: 4,
    latencyToHubMs: 14.8,
    cipherSuite: 'TLS_CHACHA20_POLY1305_SHA256',
    description: 'Southeast US Edge Leaf Node connected to Switch Keep optical fiber ring.',
    adminContact: 'noc-atlanta@drfun1.com',
    websiteUrl: 'https://www.switch.com',
    tags: ['Verified Leaf', 'Switch The Keep', 'Southeast Edge'],
    sampleChannels: ['#space', '#atlanta-feed', '#radio'],
    linkBlockSnippet: `link irc.drfun1.com {\n    incoming { mask *; };\n    outgoing {\n        bind-ip *;\n        hostname irc.drfun1.com;\n        port 6697;\n        options { ssl; };\n    };\n    password "drfun1-mesh-leaf-auth-2026";\n    class servers;\n};`
  },
  {
    id: 'leaf_frankfurt_euro',
    name: 'frankfurt.euro.drfun1.com',
    networkName: 'DrFun1 Media Global Mesh',
    hubHost: 'irc.drfun1.com',
    isLeafedToDrFun1: true,
    leafVerifiedAt: '2026-02-13T08:30:00Z',
    unrealVersion: 'UnrealIRCd-6.1.4',
    sslPort: 6697,
    plainPort: 6667,
    ipOrHostname: 'frankfurt.euro.drfun1.com',
    country: 'Germany',
    region: 'Europe',
    locationCity: 'Frankfurt am Main',
    datacenter: 'Equinix FR5 / DE-CIX Interconnect',
    onlineUsers: 980,
    onlineChannels: 62,
    onlineOpers: 3,
    latencyToHubMs: 82.4,
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (TLS 1.3)',
    description: 'European Central Gateway leafed to irc.drfun1.com across transatlantic optical wavelengths.',
    adminContact: 'noc-eu@drfun1.com',
    websiteUrl: 'https://www.de-cix.net',
    tags: ['Verified Leaf', 'DE-CIX', 'Transatlantic', 'Europe'],
    sampleChannels: ['#europe', '#space', '#deutsch'],
    linkBlockSnippet: `link irc.drfun1.com {\n    incoming { mask *; };\n    outgoing {\n        bind-ip *;\n        hostname irc.drfun1.com;\n        port 6697;\n        options { ssl; };\n    };\n    password "drfun1-mesh-leaf-auth-2026";\n    class servers;\n};`
  },
  {
    id: 'leaf_tokyo_asia',
    name: 'tokyo.asia.drfun1.com',
    networkName: 'DrFun1 Media Global Mesh',
    hubHost: 'irc.drfun1.com',
    isLeafedToDrFun1: true,
    leafVerifiedAt: '2026-02-12T19:15:00Z',
    unrealVersion: 'UnrealIRCd-6.1.4',
    sslPort: 6697,
    plainPort: 6667,
    ipOrHostname: 'tokyo.asia.drfun1.com',
    country: 'Japan',
    region: 'Asia-Pacific',
    locationCity: 'Tokyo',
    datacenter: 'JPNAP Tokyo Gateway / Equinix TY2',
    onlineUsers: 840,
    onlineChannels: 45,
    onlineOpers: 3,
    latencyToHubMs: 96.2,
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (TLS 1.3)',
    description: 'Asia-Pacific regional leaf node providing fast low-jitter transit to Japanese & APAC satcom clients.',
    adminContact: 'noc-tokyo@drfun1.com',
    websiteUrl: 'https://www.mfeed.ad.jp',
    tags: ['Verified Leaf', 'JPNAP', 'Tokyo Gateway', 'Asia-Pacific'],
    sampleChannels: ['#tokyo', '#space', '#telemetry'],
    linkBlockSnippet: `link irc.drfun1.com {\n    incoming { mask *; };\n    outgoing {\n        bind-ip *;\n        hostname irc.drfun1.com;\n        port 6697;\n        options { ssl; };\n    };\n    password "drfun1-mesh-leaf-auth-2026";\n    class servers;\n};`
  },
  {
    id: 'leaf_satcom_orbit01',
    name: 'orbit.satcom.drfun1.com',
    networkName: 'DrFun1 Media Global Mesh',
    hubHost: 'irc.drfun1.com',
    isLeafedToDrFun1: true,
    leafVerifiedAt: '2026-02-15T06:00:00Z',
    unrealVersion: 'UnrealIRCd-6.1.4',
    sslPort: 6697,
    plainPort: 6667,
    ipOrHostname: 'orbit.satcom.drfun1.com',
    country: 'United States',
    region: 'Global Orbital',
    locationCity: 'Mojave / Goldstone',
    datacenter: 'NASA Deep Space Interconnect & Switch Teleport',
    onlineUsers: 1240,
    onlineChannels: 52,
    onlineOpers: 4,
    latencyToHubMs: 4.8,
    cipherSuite: 'TLS_AES_256_GCM_SHA384',
    description: 'Dedicated Space Packet & Satellite Telemetry relay server leafed to irc.drfun1.com on channel #space.',
    adminContact: 'telemetry@drfun1.com',
    websiteUrl: 'https://stats.drfun1ircd.com',
    tags: ['Verified Leaf', 'Deep Space', 'Telemetry', 'Satellite Ingest'],
    sampleChannels: ['#space', '#hamradio', '#cubesat'],
    linkBlockSnippet: `link irc.drfun1.com {\n    incoming { mask *; };\n    outgoing {\n        bind-ip *;\n        hostname irc.drfun1.com;\n        port 6697;\n        options { ssl; };\n    };\n    password "drfun1-mesh-leaf-auth-2026";\n    class servers;\n};`
  }
];

export function generateUnrealLeafConfigSnippet(serverHostname: string, networkName: string): string {
  return `/* ====================================================================
 * UnrealIRCd 6.1.x Link Block Configuration
 * Add this block to your unrealircd.conf on: ${serverHostname || 'your-server.domain.com'}
 * 
 * Target Hub: irc.drfun1.com (Port 6697 SSL)
 * Network: DrFun1 Media & Witt Law Firm Mesh (www.wittlawfirm.com)
 * License / FRN: 0034981290 | Switch SUPERNAP Colocation (www.switch.com)
 * ==================================================================== */

link irc.drfun1.com {
    incoming {
        mask *;
    };
    outgoing {
        bind-ip *;
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
};

/* Required class block for servers if not already present */
class servers {
    pingfreq 60;
    maxclients 50;
    sendq 10000000;
    connfreq 15;
};

/* Listen block ensuring SSL is active on your leaf */
listen {
    ip *;
    port 6697;
    options { ssl; };
};
`;
}
