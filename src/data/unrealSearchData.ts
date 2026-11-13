/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Official UnrealIRCd Network Search Engine Database
 * 1,034 Federated Leaf Nodes (500 www.switch.com Nodes/Hub via CGW Law Offices +
 * 12 www.datapacket.com Leafs/Hub + 10 risingnet.com Dedicated Servers)
 * All synced and leafed to Dual Core Hubs: irc.drfun1.com (SID 001) & irc.drfun1media.com (SID 002)
 * License: www.wittlawfirm.com | Payment Office: www.owenscompany.com (Bill in Receiving)
 */

import { UnrealServerRecord } from '../types/unrealSearch';
import { SwitchDedicatedNode } from '../types/irc';
import { SWITCH_DEDICATED_NODES } from './ircData';

export const UNREAL_HUB_TARGET = {
  hostname: 'irc.drfun1.com',
  secondaryHostname: 'irc.drfun1media.com',
  netHubHostname: 'irc.drfun1media.net',
  ircdHubHostname: 'drfun1ircd.com',
  hubDomains: [
    'irc.drfun1.com',
    'irc.drfun1media.com',
    'irc.drfun1media.net',
    'drfun1ircd.com',
  ] as const,
  anopeHostname: 'services.drfun1.com',
  anopeSecondaryHostname: 'services.drfun1media.com',
  sslPort: 6697,
  plainPort: 6667,
  hubSid: '001',
  mediaHubSid: '002',
  netHubSid: '003',
  ircdHubSid: '004',
  anopeSid: '00A',
  networkName: 'DrFun1 Media IRC Network',
  leafAuthSecret: 'drfun1-mesh-leaf-auth-2026',
  datacenter: 'Switch SUPERNAP Las Vegas (www.switch.com) via CGW Law Offices',
  transit: 'RisingNet BGP Tier-1 Transit (www.risingnet.com)',
  license: 'Licensed to Richard Alan Witt (www.wittlawfirm.com / FCC FRN: 0034981290)',
  legalCounsel: 'CGW Law Offices (Curtis, Gregory & Wilson Law Offices)',
  paymentOffice: 'Owens Company (www.owenscompany.com)',
  billingOffice: 'Bill in Receiving (Owens Company Accounts Payable)',
  officialPortal: 'https://stats.drfun1ircd.com',
  totalHub1LeafNodes: 517, // 500 Switch + 12 DataPacket + 5 RisingNet
  totalHub2LeafNodes: 517, // 500 Switch + 12 DataPacket + 5 RisingNet
  totalSwitchNodes: 1000,  // 500 per hub via CGW Law Offices
  totalDataPacketNodes: 24, // 12 per hub
  totalRisingNetNodes: 10, // 10 dedicated servers synced & leafed to all hubs
  totalLeafNodes: 1034,
};

// =========================================================================
// 1. EXACTLY 12 DEDICATED DATAPACKET.COM LEAFS PER HUB (24 TOTAL FEDERATED LEAFS)
// Hosted on DataPacket.com 100+ Tbps BGP Backbone & CDN77 Optical Mesh
// 12 Leafed to irc.drfun1.com (SID 001) + 12 Leafed to irc.drfun1media.com (SID 002)
// Dual-Homlink Spanning Tree Synced to Both IRCd Hubs
// Legal Escrow: CGW Law Offices | Payment Office: Owens Company (Bill in Receiving)
// =========================================================================

interface DataPacketLeafDef {
  code: string;
  metro: string;
  region: string;
  country: string;
  facility: string;
  speed: string;
  latencyMs: number;
  users: number;
  channels: number;
  sid: string;
}

// 12 DataPacket Dedicated Nodes for Hub 1 (irc.drfun1.com)
const DATAPACKET_HUB1_DEFS: DataPacketLeafDef[] = [
  { code: 'ashburn', metro: 'Ashburn, VA', region: 'North America (US East)', country: 'United States', facility: 'Equinix DC21 / DataPacket Ashburn SuperCore', speed: '100 Gbps Unmetered QSFP28', latencyMs: 14.2, users: 4820, channels: 210, sid: 'D01' },
  { code: 'chicago', metro: 'Chicago, IL', region: 'North America (US Central)', country: 'United States', facility: '350 E Cermak / DataPacket Chicago Hub', speed: '100 Gbps Unmetered QSFP28', latencyMs: 21.4, users: 3940, channels: 185, sid: 'D02' },
  { code: 'dallas', metro: 'Dallas, TX', region: 'North America (US South)', country: 'United States', facility: 'Infomart Dallas / DataPacket Texas Gate', speed: '40 Gbps QSFP+ Dedicated', latencyMs: 18.2, users: 3210, channels: 140, sid: 'D03' },
  { code: 'sanjose', metro: 'San Jose, CA', region: 'North America (US West)', country: 'United States', facility: 'Silicon Valley SV1 / DataPacket West Metro', speed: '100 Gbps Unmetered QSFP28', latencyMs: 7.9, users: 4680, channels: 230, sid: 'D04' },
  { code: 'losangeles', metro: 'Los Angeles, CA', region: 'North America (US West)', country: 'United States', facility: 'One Wilshire Telecom Center / DataPacket LAX', speed: '40 Gbps QSFP+ Dedicated', latencyMs: 5.1, users: 3890, channels: 175, sid: 'D05' },
  { code: 'newyork', metro: 'New York, NY', region: 'North America (US East)', country: 'United States', facility: '111 8th Avenue / DataPacket Manhattan Tier-1', speed: '40 Gbps QSFP+ Dedicated', latencyMs: 23.8, users: 3550, channels: 160, sid: 'D06' },
  { code: 'london', metro: 'London, UK', region: 'Europe', country: 'United Kingdom', facility: 'Telehouse North Docklands / DataPacket London Core', speed: '100 Gbps Unmetered QSFP28', latencyMs: 71.9, users: 4120, channels: 195, sid: 'D07' },
  { code: 'amsterdam', metro: 'Amsterdam, NL', region: 'Europe', country: 'Netherlands', facility: 'Nikhef / Equinix AM4 / DataPacket Amsterdam Ring', speed: '100 Gbps Unmetered QSFP28', latencyMs: 74.3, users: 4450, channels: 215, sid: 'D08' },
  { code: 'frankfurt', metro: 'Frankfurt, DE', region: 'Europe', country: 'Germany', facility: 'Interxion FRA1 / DE-CIX / DataPacket Frankfurt Hub', speed: '100 Gbps Unmetered QSFP28', latencyMs: 78.5, users: 4320, channels: 205, sid: 'D09' },
  { code: 'tokyo', metro: 'Tokyo, JP', region: 'Asia-Pacific', country: 'Japan', facility: 'Equinix TY8 / JPNAP DataPacket Tokyo Gateway', speed: '40 Gbps QSFP+ Dedicated', latencyMs: 93.6, users: 2980, channels: 130, sid: 'D10' },
  { code: 'singapore', metro: 'Singapore, SG', region: 'Asia-Pacific', country: 'Singapore', facility: 'Equinix SG1 / DataPacket Southeast Asia Teleport', speed: '40 Gbps QSFP+ Dedicated', latencyMs: 117.2, users: 2840, channels: 125, sid: 'D11' },
  { code: 'sydney', metro: 'Sydney, AU', region: 'Asia-Pacific', country: 'Australia', facility: 'Equinix SY3 / DataPacket Pacific Oceania Gateway', speed: '40 Gbps QSFP+ Dedicated', latencyMs: 123.8, users: 2410, channels: 110, sid: 'D12' },
];

// 12 DataPacket Dedicated Nodes for Hub 2 (irc.drfun1media.com)
const DATAPACKET_HUB2_DEFS: DataPacketLeafDef[] = [
  { code: 'paris', metro: 'Paris, FR', region: 'Europe', country: 'France', facility: 'Equinix PA4 / DataPacket Paris Gateway', speed: '100 Gbps Unmetered QSFP28', latencyMs: 76.4, users: 3910, channels: 175, sid: 'D13' },
  { code: 'madrid', metro: 'Madrid, ES', region: 'Europe', country: 'Spain', facility: 'Interxion MAD2 / DataPacket Iberia Edge', speed: '40 Gbps QSFP+ Dedicated', latencyMs: 82.1, users: 3120, channels: 140, sid: 'D14' },
  { code: 'stockholm', metro: 'Stockholm, SE', region: 'Europe', country: 'Sweden', facility: 'Equinix SK2 / DataPacket Nordic SuperCore', speed: '100 Gbps Unmetered QSFP28', latencyMs: 85.3, users: 3450, channels: 155, sid: 'D15' },
  { code: 'warsaw', metro: 'Warsaw, PL', region: 'Europe', country: 'Poland', facility: 'Equinix WA3 / DataPacket Central Europe', speed: '40 Gbps QSFP+ Dedicated', latencyMs: 88.7, users: 2980, channels: 130, sid: 'D16' },
  { code: 'toronto', metro: 'Toronto, CA', region: 'North America (Canada)', country: 'Canada', facility: '151 Front St / DataPacket Great Lakes Metro', speed: '100 Gbps Unmetered QSFP28', latencyMs: 27.4, users: 3620, channels: 165, sid: 'D17' },
  { code: 'saopaulo', metro: 'Sao Paulo, BR', region: 'South America', country: 'Brazil', facility: 'Equinix SP4 / DataPacket South America Hub', speed: '40 Gbps QSFP+ Dedicated', latencyMs: 112.5, users: 2750, channels: 120, sid: 'D18' },
  { code: 'mumbai', metro: 'Mumbai, IN', region: 'Asia-Pacific', country: 'India', facility: 'GPX Mumbai / DataPacket South Asia Core', speed: '40 Gbps QSFP+ Dedicated', latencyMs: 138.4, users: 3190, channels: 145, sid: 'D19' },
  { code: 'seoul', metro: 'Seoul, KR', region: 'Asia-Pacific', country: 'South Korea', facility: 'Equinix SL1 / DataPacket East Asia Gateway', speed: '100 Gbps Unmetered QSFP28', latencyMs: 98.2, users: 3840, channels: 170, sid: 'D20' },
  { code: 'hongkong', metro: 'Hong Kong, HK', region: 'Asia-Pacific', country: 'Hong Kong', facility: 'Equinix HK1 / DataPacket HK Telecom Hub', speed: '100 Gbps Unmetered QSFP28', latencyMs: 104.6, users: 4020, channels: 180, sid: 'D21' },
  { code: 'zurich', metro: 'Zurich, CH', region: 'Europe', country: 'Switzerland', facility: 'Equinix ZH4 / DataPacket Alpine Hub', speed: '40 Gbps QSFP+ Dedicated', latencyMs: 79.8, users: 3310, channels: 150, sid: 'D22' },
  { code: 'milan', metro: 'Milan, IT', region: 'Europe', country: 'Italy', facility: 'Caldera Park / DataPacket Milan SuperCore', speed: '40 Gbps QSFP+ Dedicated', latencyMs: 81.2, users: 3260, channels: 145, sid: 'D23' },
  { code: 'melbourne', metro: 'Melbourne, AU', region: 'Asia-Pacific', country: 'Australia', facility: 'NextDC M1 / DataPacket Australasia Node', speed: '40 Gbps QSFP+ Dedicated', latencyMs: 129.5, users: 2540, channels: 115, sid: 'D24' },
];

function createDataPacketNode(def: DataPacketLeafDef, idx: number, targetHub: 'irc.drfun1.com' | 'irc.drfun1media.com', hubTag: string): SwitchDedicatedNode {
  const host = `dp${String(idx + 1).padStart(2, '0')}.${def.code}.${hubTag}.drfun1.com`;
  return {
    id: `dp_${hubTag}_${def.code}`,
    name: `DataPacket ${def.metro} 100G No-Ads Leaf (${def.sid})`,
    subdomain: host,
    host,
    port: 6697,
    location: def.metro,
    campusName: `${def.facility} (datapacket.com no ads / Pure Broadcast Relay)`,
    tier: 'Tier IV Bare-Metal SuperCluster (datapacket.com no ads)',
    fiberCapacity: `${def.speed} · Ad-Free Transit`,
    status: 'active',
    latencyMs: def.latencyMs,
    usersOnline: def.users,
    leafPeers: 16,
    unrealVersion: 'UnrealIRCd-6.1.4',
    sslFingerprint: `DP:${(idx + 21).toString(16).toUpperCase()}:A7:E9:55:12:3C:99:FA:44:88:B1:00:26:DD:4A:EE`,
    transitProvider: 'DataPacket.com 100+ Tbps Optical BGP (Zero Ads / Ad-Free Stream Relay)',
    leafHub: 'irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net & drfun1ircd.com',
    leafHubs: ['irc.drfun1.com', 'irc.drfun1media.com', 'irc.drfun1media.net', 'drfun1ircd.com'],
    dualHubLinked: true,
    hubPort: 6697,
    sid: def.sid,
    leafStatus: 'synced',
    adPolicy: 'datapacket.com no ads (Strict Zero Commercial Advertising Policy)',
    legalCounsel: 'CGW Law Offices (Curtis, Gregory & Wilson Law Offices)',
    paymentOffice: 'Owens Company (www.owenscompany.com)',
    billingOffice: 'Bill in Receiving (Owens Company Accounts Payable)',
    leafBurstStats: {
      syncedChannels: 855000,
      syncedNicks: def.users,
      syncLatencyMs: def.latencyMs,
      lastBurst: '2026-02-15T09:12:00Z',
      linkProtocol: 'UnrealIRCd 6.1.4 SSL Spanning Tree',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384'
    },
    unrealLinkBlock: `/* DataPacket.com 100G No-Ads Leaf Node ${def.sid} (${def.metro}) */
/* Multi-Hub Synced & Leafed to irc.drfun1.com (001), irc.drfun1media.com (002), irc.drfun1media.net (003) & drfun1ircd.com (004) */
/* Policy: datapacket.com no ads | Legal: CGW Law Offices | Payment: Owens Company (Bill in Receiving) */

link irc.drfun1.com {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

link irc.drfun1media.com {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "irc.drfun1media.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

link irc.drfun1media.net {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "irc.drfun1media.net";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

link drfun1ircd.com {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "drfun1ircd.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

ulines {
    "services.drfun1.com";
    "services.drfun1media.com";
};

set {
    anti-spam {
        spamfilter {
            ban-action block;
            ban-reason "datapacket.com no ads: Commercial advertising strictly prohibited";
        };
    };
    modes-on-connect "+iwx";
    modes-on-join "+Ntc";
    restrict-channelmodes "c";
};

class servers {
    pingfreq 45;
    maxclients 100;
    sendq 20000000;
    connfreq 10;
};`,
    provider: 'datapacket',
    region: def.region,
    country: def.country,
    uplinkSpeed: def.speed
  };
}

// 12 DataPacket Dedicated Leafs for Hub 1 (irc.drfun1.com)
export const HUB1_12_DATAPACKET_NODES: SwitchDedicatedNode[] = DATAPACKET_HUB1_DEFS.map((def, idx) =>
  createDataPacketNode(def, idx, 'irc.drfun1.com', 'h1')
);

// 12 DataPacket Dedicated Leafs for Hub 2 (irc.drfun1media.com)
export const HUB2_12_DATAPACKET_NODES: SwitchDedicatedNode[] = DATAPACKET_HUB2_DEFS.map((def, idx) =>
  createDataPacketNode(def, idx + 12, 'irc.drfun1media.com', 'h2')
);

// Total 24 DataPacket Dedicated Leafs (12 per hub)
export const ALL_24_DATAPACKET_NODES: SwitchDedicatedNode[] = [
  ...HUB1_12_DATAPACKET_NODES,
  ...HUB2_12_DATAPACKET_NODES,
];

// Backwards-compatible alias for existing imports
export const DATAPACKET_LEAF_NODES: SwitchDedicatedNode[] = ALL_24_DATAPACKET_NODES;

// =========================================================================
// 2. EXACTLY 10 DEDICATED SERVERS FROM RISINGNET.COM (www.risingnet.com)
// Hosted on RisingNet Optical DWDM Protected Backbone & RF Transport
// Synchronized and leafed to BOTH IRCd hubs: irc.drfun1.com & irc.drfun1media.com
// Legal Escrow: CGW Law Offices | Payment Office: Owens Company (Bill in Receiving)
// =========================================================================

interface RisingNetLeafDef {
  code: string;
  metro: string;
  facility: string;
  speed: string;
  latencyMs: number;
  users: number;
  channels: number;
  sid: string;
  primaryHub: 'irc.drfun1.com' | 'irc.drfun1media.com';
}

const RISINGNET_10_DEFS: RisingNetLeafDef[] = [
  { code: 'ashburn', metro: 'Ashburn, VA', facility: 'Equinix DC10 / RisingNet Tier-1 BGP POP', speed: '100 Gbps Optical DWDM', latencyMs: 12.1, users: 3820, channels: 165, sid: 'R01', primaryHub: 'irc.drfun1.com' },
  { code: 'losangeles', metro: 'Los Angeles, CA', facility: 'One Wilshire Telecom Center / RisingNet Pacific Core', speed: '100 Gbps Optical DWDM', latencyMs: 4.8, users: 4410, channels: 190, sid: 'R02', primaryHub: 'irc.drfun1.com' },
  { code: 'siliconvalley', metro: 'San Jose, CA', facility: 'SV1 Silicon Valley / RisingNet Optical Hub', speed: '100 Gbps Optical DWDM', latencyMs: 7.2, users: 4190, channels: 180, sid: 'R03', primaryHub: 'irc.drfun1.com' },
  { code: 'miami', metro: 'Miami, FL', facility: 'NAP of the Americas / RisingNet Subsea Gateway', speed: '100 Gbps Optical DWDM', latencyMs: 24.6, users: 3150, channels: 145, sid: 'R04', primaryHub: 'irc.drfun1.com' },
  { code: 'dallas', metro: 'Dallas, TX', facility: 'Infomart Dallas / RisingNet Central Aggregator', speed: '100 Gbps Optical DWDM', latencyMs: 16.9, users: 3670, channels: 155, sid: 'R05', primaryHub: 'irc.drfun1.com' },
  { code: 'chicago', metro: 'Chicago, IL', facility: '350 E Cermak / RisingNet Great Lakes Optical Ring', speed: '100 Gbps Optical DWDM', latencyMs: 20.8, users: 3950, channels: 175, sid: 'R06', primaryHub: 'irc.drfun1media.com' },
  { code: 'seattle', metro: 'Seattle, WA', facility: 'Westin Building Exchange / RisingNet Pacific Northwest', speed: '100 Gbps Optical DWDM', latencyMs: 14.3, users: 3420, channels: 150, sid: 'R07', primaryHub: 'irc.drfun1media.com' },
  { code: 'newyork', metro: 'New York, NY', facility: '60 Hudson St / 111 8th Ave / RisingNet Manhattan Core', speed: '100 Gbps Optical DWDM', latencyMs: 22.4, users: 4180, channels: 185, sid: 'R08', primaryHub: 'irc.drfun1media.com' },
  { code: 'atlanta', metro: 'Atlanta, GA', facility: '56 Marietta St / RisingNet Southeast SuperCenter', speed: '100 Gbps Optical DWDM', latencyMs: 18.7, users: 3580, channels: 160, sid: 'R09', primaryHub: 'irc.drfun1media.com' },
  { code: 'denver', metro: 'Denver, CO', facility: '1500 Champa St / RisingNet Rocky Mountain BGP Node', speed: '100 Gbps Optical DWDM', latencyMs: 15.2, users: 3290, channels: 140, sid: 'R10', primaryHub: 'irc.drfun1media.com' },
];

export const RISINGNET_10_DEDICATED_SERVERS: SwitchDedicatedNode[] = RISINGNET_10_DEFS.map((def, idx) => {
  const host = `rn${String(idx + 1).padStart(2, '0')}.${def.code}.risingnet.drfun1.com`;
  return {
    id: `rn_server_${def.code}`,
    name: `RisingNet Dedicated Server ${idx + 1} · ${def.metro} (${def.sid})`,
    subdomain: host,
    host,
    port: 6697,
    location: def.metro,
    campusName: `${def.facility} (RisingNet Dedicated Bare-Metal Server)`,
    tier: 'Tier 1 Optical DWDM Protected Backbone / 100G Clean Pipe',
    fiberCapacity: def.speed,
    status: 'active',
    latencyMs: def.latencyMs,
    usersOnline: def.users,
    leafPeers: 16,
    unrealVersion: 'UnrealIRCd-6.1.4',
    sslFingerprint: `RN:${(idx + 41).toString(16).toUpperCase()}:B9:4C:12:88:DF:99:E1:33:AA:77:00:26:FA:11:05`,
    transitProvider: 'RisingNet Optical Backbone & Dedicated Bare-Metal Server (www.risingnet.com)',
    leafHub: 'irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net & drfun1ircd.com',
    leafHubs: ['irc.drfun1.com', 'irc.drfun1media.com', 'irc.drfun1media.net', 'drfun1ircd.com'],
    dualHubLinked: true,
    hubPort: 6697,
    sid: def.sid,
    leafStatus: 'synced',
    legalCounsel: 'CGW Law Offices (Curtis, Gregory & Wilson Law Offices)',
    paymentOffice: 'Owens Company (www.owenscompany.com)',
    billingOffice: 'Bill in Receiving (Owens Company Accounts Payable)',
    leafBurstStats: {
      syncedChannels: 855000,
      syncedNicks: def.users,
      syncLatencyMs: def.latencyMs,
      lastBurst: '2026-02-15T09:15:00Z',
      linkProtocol: 'UnrealIRCd 6.1.4 SSL Spanning Tree',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384'
    },
    unrealLinkBlock: `/* RisingNet.com Dedicated Server ${def.sid} (${def.metro}) */
/* Multi-Hub Synchronized & Leafed to irc.drfun1.com (001), irc.drfun1media.com (002), irc.drfun1media.net (003) & drfun1ircd.com (004) */
/* Provider: RisingNet.com | Legal: CGW Law Offices | Payment: Owens Company (Bill in Receiving) */

link irc.drfun1.com {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

link irc.drfun1media.com {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "irc.drfun1media.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

link irc.drfun1media.net {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "irc.drfun1media.net";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

link drfun1ircd.com {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "drfun1ircd.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

ulines {
    "services.drfun1.com";
    "services.drfun1media.com";
};

class servers {
    pingfreq 45;
    maxclients 150;
    sendq 25000000;
    connfreq 10;
};`,
    provider: 'risingnet',
    region: 'North America (RisingNet Tier-1 Optical)',
    country: 'United States',
    uplinkSpeed: def.speed
  };
});

// Backwards-compatible alias for existing imports
export const RISINGNET_5_LEAF_NODES: SwitchDedicatedNode[] = RISINGNET_10_DEDICATED_SERVERS;

// =========================================================================
// 2. EXACTLY 335 UNREALIRCD.ORG VERIFIED GLOBAL LEAF NODES
// Verified nodes spanning world internet exchanges and telecom hubs
// =========================================================================

interface GeoNodeSeed {
  city: string;
  country: string;
  region: string;
  dc: string;
  baseLat: number;
}

// 100 North American Cities
const NA_CITIES: GeoNodeSeed[] = [
  { city: 'New York, NY', country: 'United States', region: 'North America', dc: 'Equinix NY4 Secaucus', baseLat: 22 },
  { city: 'Los Angeles, CA', country: 'United States', region: 'North America', dc: 'One Wilshire Telecom Center', baseLat: 5 },
  { city: 'Chicago, IL', country: 'United States', region: 'North America', dc: 'Cermak 350 Data Center', baseLat: 21 },
  { city: 'Houston, TX', country: 'United States', region: 'North America', dc: 'Data Gumbo Houston Metro', baseLat: 19 },
  { city: 'Phoenix, AZ', country: 'United States', region: 'North America', dc: 'Cyxtera Phoenix PH1', baseLat: 7 },
  { city: 'Philadelphia, PA', country: 'United States', region: 'North America', dc: 'Iron Mountain PHL-1', baseLat: 23 },
  { city: 'San Antonio, TX', country: 'United States', region: 'North America', dc: 'Coresite San Antonio', baseLat: 19 },
  { city: 'San Diego, CA', country: 'United States', region: 'North America', dc: 'Evoque San Diego Gateway', baseLat: 6 },
  { city: 'Dallas, TX', country: 'United States', region: 'North America', dc: 'Equinix DA1 Infomart', baseLat: 18 },
  { city: 'Austin, TX', country: 'United States', region: 'North America', dc: 'Data Foundry Austin', baseLat: 19 },
  { city: 'San Jose, CA', country: 'United States', region: 'North America', dc: 'Equinix SV1 Silicon Valley', baseLat: 8 },
  { city: 'Fort Worth, TX', country: 'United States', region: 'North America', dc: 'T5 Data Centers DFW', baseLat: 18 },
  { city: 'Jacksonville, FL', country: 'United States', region: 'North America', dc: 'Cologix JAX1 Gateway', baseLat: 25 },
  { city: 'Columbus, OH', country: 'United States', region: 'North America', dc: 'Cologix COL2 Data Center', baseLat: 22 },
  { city: 'Charlotte, NC', country: 'United States', region: 'North America', dc: 'TierPoint Charlotte Core', baseLat: 23 },
  { city: 'Indianapolis, IN', country: 'United States', region: 'North America', dc: 'Lifeline Data Centers IND', baseLat: 21 },
  { city: 'San Francisco, CA', country: 'United States', region: 'North America', dc: 'Digital Realty 365 Main', baseLat: 8 },
  { city: 'Seattle, WA', country: 'United States', region: 'North America', dc: 'Westin Building Exchange', baseLat: 14 },
  { city: 'Denver, CO', country: 'United States', region: 'North America', dc: 'Coresite Denver DE1', baseLat: 11 },
  { city: 'Oklahoma City, OK', country: 'United States', region: 'North America', dc: 'TierPoint OKC Metro', baseLat: 16 },
  { city: 'Nashville, TN', country: 'United States', region: 'North America', dc: 'Evoque Nashville Center', baseLat: 21 },
  { city: 'El Paso, TX', country: 'United States', region: 'North America', dc: 'Borderplex Telecommunications', baseLat: 15 },
  { city: 'Washington, DC', country: 'United States', region: 'North America', dc: 'Equinix DC10 Ashburn Core', baseLat: 23 },
  { city: 'Boston, MA', country: 'United States', region: 'North America', dc: 'Markley Group 1 Summer St', baseLat: 24 },
  { city: 'Las Vegas, NV', country: 'United States', region: 'North America', dc: 'Switch SUPERNAP Las Vegas 8', baseLat: 1 },
  { city: 'Portland, OR', country: 'United States', region: 'North America', dc: 'Pittock Block Interconnect', baseLat: 13 },
  { city: 'Detroit, MI', country: 'United States', region: 'North America', dc: '15400 Grand River Detroit', baseLat: 22 },
  { city: 'Louisville, KY', country: 'United States', region: 'North America', dc: 'Peak 10 Louisville', baseLat: 22 },
  { city: 'Memphis, TN', country: 'United States', region: 'North America', dc: 'Coresite Memphis MEM1', baseLat: 20 },
  { city: 'Baltimore, MD', country: 'United States', region: 'North America', dc: 'TierPoint Baltimore Metro', baseLat: 23 },
  { city: 'Milwaukee, WI', country: 'United States', region: 'North America', dc: 'Expedient Milwaukee MKE', baseLat: 21 },
  { city: 'Albuquerque, NM', country: 'United States', region: 'North America', dc: 'BigByte Albuquerque Data Center', baseLat: 10 },
  { city: 'Tucson, AZ', country: 'United States', region: 'North America', dc: 'Involta Tucson Campus', baseLat: 8 },
  { city: 'Fresno, CA', country: 'United States', region: 'North America', dc: 'Central Valley Fiber Hub', baseLat: 6 },
  { city: 'Sacramento, CA', country: 'United States', region: 'North America', dc: 'RagingWire Sacramento CA3', baseLat: 7 },
  { city: 'Mesa, AZ', country: 'United States', region: 'North America', dc: 'Aligned Data Centers Mesa', baseLat: 8 },
  { city: 'Kansas City, MO', country: 'United States', region: 'North America', dc: '1102 Grand Kansas City', baseLat: 18 },
  { city: 'Atlanta, GA', country: 'United States', region: 'North America', dc: 'Switch The Keep Atlanta', baseLat: 19 },
  { city: 'Omaha, NE', country: 'United States', region: 'North America', dc: 'Scott Data Center Omaha', baseLat: 17 },
  { city: 'Colorado Springs, CO', country: 'United States', region: 'North America', dc: 'DataBank Colorado Springs', baseLat: 11 },
  { city: 'Raleigh, NC', country: 'United States', region: 'North America', dc: 'TierPoint Research Triangle', baseLat: 23 },
  { city: 'Long Beach, CA', country: 'United States', region: 'North America', dc: 'Crown Castle Long Beach', baseLat: 5 },
  { city: 'Virginia Beach, VA', country: 'United States', region: 'North America', dc: 'Telxius Cable Landing Station', baseLat: 24 },
  { city: 'Miami, FL', country: 'United States', region: 'North America', dc: 'Equinix MI1 NAP of Americas', baseLat: 26 },
  { city: 'Oakland, CA', country: 'United States', region: 'North America', dc: 'Digital Realty Oakland', baseLat: 8 },
  { city: 'Minneapolis, MN', country: 'United States', region: 'North America', dc: 'Cologix MIN3 Minneapolis 511', baseLat: 19 },
  { city: 'Tulsa, OK', country: 'United States', region: 'North America', dc: 'TierPoint Tulsa South', baseLat: 17 },
  { city: 'Tampa, FL', country: 'United States', region: 'North America', dc: 'H5 Data Centers Tampa', baseLat: 25 },
  { city: 'Arlington, TX', country: 'United States', region: 'North America', dc: 'CyrusOne Arlington TX', baseLat: 18 },
  { city: 'New Orleans, LA', country: 'United States', region: 'North America', dc: 'DXC Technology New Orleans', baseLat: 22 },
  { city: 'Wichita, KS', country: 'United States', region: 'North America', dc: 'Cox Communications Wichita Hub', baseLat: 17 },
  { city: 'Cleveland, OH', country: 'United States', region: 'North America', dc: 'DataBank Cleveland Metro', baseLat: 22 },
  { city: 'Bakersfield, CA', country: 'United States', region: 'North America', dc: 'Kern County Optical Gateway', baseLat: 5 },
  { city: 'Aurora, CO', country: 'United States', region: 'North America', dc: 'Flexential Aurora Campus', baseLat: 11 },
  { city: 'Anaheim, CA', country: 'United States', region: 'North America', dc: 'Coresite Orange County', baseLat: 5 },
  { city: 'Honolulu, HI', country: 'United States', region: 'North America', dc: 'DRFortress Honolulu Teleport', baseLat: 38 },
  { city: 'Santa Ana, CA', country: 'United States', region: 'North America', dc: 'Equinix SA1 Santa Ana', baseLat: 5 },
  { city: 'Riverside, CA', country: 'United States', region: 'North America', dc: 'Inland Empire Optical Exchange', baseLat: 4 },
  { city: 'Corpus Christi, TX', country: 'United States', region: 'North America', dc: 'Gulf Coast Teleport Center', baseLat: 20 },
  { city: 'Lexington, KY', country: 'United States', region: 'North America', dc: 'Windstream Lexington Hub', baseLat: 22 },
  { city: 'Henderson, NV', country: 'United States', region: 'North America', dc: 'Switch SUPERNAP Las Vegas 9', baseLat: 1 },
  { city: 'Stockton, CA', country: 'United States', region: 'North America', dc: 'San Joaquin Fiber Interconnect', baseLat: 7 },
  { city: 'Saint Paul, MN', country: 'United States', region: 'North America', dc: 'CenturyLink Saint Paul Hub', baseLat: 19 },
  { city: 'Cincinnati, OH', country: 'United States', region: 'North America', dc: 'CinciBell Technology Solutions', baseLat: 22 },
  { city: 'Irvine, CA', country: 'United States', region: 'North America', dc: 'TierPoint Irvine Data Center', baseLat: 5 },
  { city: 'Greensboro, NC', country: 'United States', region: 'North America', dc: 'North Carolina Research Campus', baseLat: 23 },
  { city: 'Pittsburgh, PA', country: 'United States', region: 'North America', dc: 'DataBank Pittsburgh PIT1', baseLat: 23 },
  { city: 'Lincoln, NE', country: 'United States', region: 'North America', dc: 'Allo Communications Lincoln', baseLat: 17 },
  { city: 'St. Louis, MO', country: 'United States', region: 'North America', dc: 'Netrality 900 Walnut STL', baseLat: 19 },
  { city: 'Orlando, FL', country: 'United States', region: 'North America', dc: 'HostDime Orlando Flagship', baseLat: 25 },
  { city: 'Plano, TX', country: 'United States', region: 'North America', dc: 'DataBank Plano Metro Hub', baseLat: 18 },
  { city: 'Anchorage, AK', country: 'United States', region: 'North America', dc: 'GCI Alaska Teleport Gateway', baseLat: 42 },
  { city: 'Newark, NJ', country: 'United States', region: 'North America', dc: '165 Halsey Street Telecom Center', baseLat: 23 },
  { city: 'Durham, NC', country: 'United States', region: 'North America', dc: 'Fidelity Research Triangle Park', baseLat: 23 },
  { city: 'Chula Vista, CA', country: 'United States', region: 'North America', dc: 'South Bay Teleport Hub', baseLat: 6 },
  { city: 'Toledo, OH', country: 'United States', region: 'North America', dc: 'Buckeye Broadband Hub', baseLat: 22 },
  { city: 'Jersey City, NJ', country: 'United States', region: 'North America', dc: 'Equinix NY2 Jersey City', baseLat: 23 },
  { city: 'Madison, WI', country: 'United States', region: 'North America', dc: '5NINES Data Center Madison', baseLat: 20 },
  { city: 'Lubbock, TX', country: 'United States', region: 'North America', dc: 'Vexus Fiber West Texas', baseLat: 17 },
  { city: 'Scottsdale, AZ', country: 'United States', region: 'North America', dc: 'Iron Mountain Scottsdale', baseLat: 7 },
  { city: 'Reno, NV', country: 'United States', region: 'North America', dc: 'Switch Citadel Tahoe Reno', baseLat: 3 },
  { city: 'Buffalo, NY', country: 'United States', region: 'North America', dc: 'ColoCrossing Buffalo Datacenter', baseLat: 23 },
  { city: 'Chandler, AZ', country: 'United States', region: 'North America', dc: 'CyrusOne Chandler Campus', baseLat: 7 },
  { city: 'Glendale, AZ', country: 'United States', region: 'North America', dc: 'Phoenix West Gateway', baseLat: 7 },
  { city: 'North Las Vegas, NV', country: 'United States', region: 'North America', dc: 'Apex Industrial Park Fiber Link', baseLat: 1 },
  { city: 'Winston-Salem, NC', country: 'United States', region: 'North America', dc: 'Piedmont Fiber Terminal', baseLat: 23 },
  { city: 'Gilbert, AZ', country: 'United States', region: 'North America', dc: 'East Valley Tech Corridor', baseLat: 7 },
  { city: 'Norfolk, VA', country: 'United States', region: 'North America', dc: 'Atlantic Subsea Terrestrial Hub', baseLat: 24 },
  { city: 'Chesapeake, VA', country: 'United States', region: 'North America', dc: 'Mid-Atlantic Broadband Gate', baseLat: 24 },
  { city: 'Irving, TX', country: 'United States', region: 'North America', dc: 'QTS Irving Mega Data Center', baseLat: 18 },
  { city: 'Fremont, CA', country: 'United States', region: 'North America', dc: 'Hurricane Electric Fremont 2', baseLat: 8 },
  { city: 'Richmond, VA', country: 'United States', region: 'North America', dc: 'QTS Richmond Mega Data Center', baseLat: 23 },
  { city: 'Boise, ID', country: 'United States', region: 'North America', dc: 'Involta Boise Data Center', baseLat: 9 },
  { city: 'Spokane, WA', country: 'United States', region: 'North America', dc: 'TierPoint Spokane Liberty Lake', baseLat: 13 },
  { city: 'Baton Rouge, LA', country: 'United States', region: 'North America', dc: 'Venable Technology Hub', baseLat: 22 },
  { city: 'Tacoma, WA', country: 'United States', region: 'North America', dc: 'Puget Sound Optical Ring', baseLat: 14 },
  // Canada (10)
  { city: 'Toronto, ON', country: 'Canada', region: 'North America', dc: '151 Front Street West Toronto', baseLat: 24 },
  { city: 'Montreal, QC', country: 'Canada', region: 'North America', dc: 'Cologix MTL3 Montreal Core', baseLat: 26 },
  { city: 'Vancouver, BC', country: 'Canada', region: 'North America', dc: 'Harbour Centre Vancouver VANIX', baseLat: 15 },
  { city: 'Calgary, AB', country: 'Canada', region: 'North America', dc: 'Shaw Communications Calgary Core', baseLat: 18 },
];

// 105 European Cities
const EU_CITIES: GeoNodeSeed[] = [
  { city: 'London, UK', country: 'United Kingdom', region: 'Europe', dc: 'Telehouse North Docklands', baseLat: 72 },
  { city: 'Manchester, UK', country: 'United Kingdom', region: 'Europe', dc: 'Equinix MA1 Manchester', baseLat: 74 },
  { city: 'Birmingham, UK', country: 'United Kingdom', region: 'Europe', dc: 'DataCentred Birmingham', baseLat: 73 },
  { city: 'Leeds, UK', country: 'United Kingdom', region: 'Europe', dc: 'AQL Leeds DC5', baseLat: 74 },
  { city: 'Glasgow, UK', country: 'United Kingdom', region: 'Europe', dc: 'Pulsant Glasgow South', baseLat: 76 },
  { city: 'Edinburgh, UK', country: 'United Kingdom', region: 'Europe', dc: 'Edinburgh Technopole', baseLat: 76 },
  { city: 'Bristol, UK', country: 'United Kingdom', region: 'Europe', dc: 'Next Generation Data Newport', baseLat: 73 },
  { city: 'Liverpool, UK', country: 'United Kingdom', region: 'Europe', dc: 'Baltic Triangle Telecoms', baseLat: 74 },
  { city: 'Newcastle, UK', country: 'United Kingdom', region: 'Europe', dc: 'Stellium Datacenters NCL1', baseLat: 75 },
  { city: 'Cardiff, UK', country: 'United Kingdom', region: 'Europe', dc: 'Vantage CWL1 Cardiff', baseLat: 73 },
  { city: 'Belfast, UK', country: 'United Kingdom', region: 'Europe', dc: 'Equinix BL1 Belfast', baseLat: 76 },
  { city: 'Frankfurt, DE', country: 'Germany', region: 'Europe', dc: 'DE-CIX Interxion FRA1', baseLat: 78 },
  { city: 'Berlin, DE', country: 'Germany', region: 'Europe', dc: 'BCIX CarrierColo Berlin', baseLat: 80 },
  { city: 'Munich, DE', country: 'Germany', region: 'Europe', dc: 'Equinix MU1 Munich', baseLat: 81 },
  { city: 'Hamburg, DE', country: 'Germany', region: 'Europe', dc: 'Interxion HAM1 Hamburg', baseLat: 79 },
  { city: 'Cologne, DE', country: 'Germany', region: 'Europe', dc: 'NetCologne DataCenter West', baseLat: 78 },
  { city: 'Stuttgart, DE', country: 'Germany', region: 'Europe', dc: 'Telemax Stuttgart Süd', baseLat: 80 },
  { city: 'Dusseldorf, DE', country: 'Germany', region: 'Europe', dc: 'Equinix DU1 Dusseldorf', baseLat: 78 },
  { city: 'Leipzig, DE', country: 'Germany', region: 'Europe', dc: 'Envia TEL Leipzig', baseLat: 80 },
  { city: 'Dresden, DE', country: 'Germany', region: 'Europe', dc: 'Silicon Saxony Datacenter', baseLat: 81 },
  { city: 'Nuremberg, DE', country: 'Germany', region: 'Europe', dc: 'Hetzner Online Park NBG', baseLat: 80 },
  { city: 'Paris, FR', country: 'France', region: 'Europe', dc: 'Equinix PA4 Paris Pantin', baseLat: 75 },
  { city: 'Marseille, FR', country: 'France', region: 'Europe', dc: 'Interxion MRS1 Subsea Hub', baseLat: 77 },
  { city: 'Lyon, FR', country: 'France', region: 'Europe', dc: 'SFR Netcenter Lyon', baseLat: 76 },
  { city: 'Toulouse, FR', country: 'France', region: 'Europe', dc: 'FullSave Toulouse DC1', baseLat: 77 },
  { city: 'Nice, FR', country: 'France', region: 'Europe', dc: 'Sophia Antipolis Telecom', baseLat: 78 },
  { city: 'Nantes, FR', country: 'France', region: 'Europe', dc: 'Etix Nantes #1', baseLat: 75 },
  { city: 'Strasbourg, FR', country: 'France', region: 'Europe', dc: 'OVHcloud Strasbourg Campus', baseLat: 77 },
  { city: 'Montpellier, FR', country: 'France', region: 'Europe', dc: 'Thales Montpellier DC', baseLat: 77 },
  { city: 'Bordeaux, FR', country: 'France', region: 'Europe', dc: 'Equinix BX1 Subsea Landing', baseLat: 76 },
  { city: 'Lille, FR', country: 'France', region: 'Europe', dc: 'CIV France Lille', baseLat: 74 },
  { city: 'Amsterdam, NL', country: 'Netherlands', region: 'Europe', dc: 'Nikhef AMS-IX Core', baseLat: 74 },
  { city: 'Rotterdam, NL', country: 'Netherlands', region: 'Europe', dc: 'Smartdc Rotterdam Datacenter', baseLat: 74 },
  { city: 'The Hague, NL', country: 'Netherlands', region: 'Europe', dc: 'KPN The Hague Core', baseLat: 74 },
  { city: 'Utrecht, NL', country: 'Netherlands', region: 'Europe', dc: 'Equinix UT1 Utrecht', baseLat: 74 },
  { city: 'Eindhoven, NL', country: 'Netherlands', region: 'Europe', dc: 'Brainport Datacenter HighTech', baseLat: 75 },
  { city: 'Zurich, CH', country: 'Switzerland', region: 'Europe', dc: 'Equinix ZH4 Zurich West', baseLat: 79 },
  { city: 'Geneva, CH', country: 'Switzerland', region: 'Europe', dc: 'Equinix GV1 Geneva', baseLat: 79 },
  { city: 'Basel, CH', country: 'Switzerland', region: 'Europe', dc: 'Interxion BSL1 Basel', baseLat: 79 },
  { city: 'Bern, CH', country: 'Switzerland', region: 'Europe', dc: 'Swisscom Enterprise Bern', baseLat: 79 },
  { city: 'Stockholm, SE', country: 'Sweden', region: 'Europe', dc: 'Equinix SK1 Bromma', baseLat: 82 },
  { city: 'Gothenburg, SE', country: 'Sweden', region: 'Europe', dc: 'GothNet Telecom Center', baseLat: 82 },
  { city: 'Malmo, SE', country: 'Sweden', region: 'Europe', dc: 'Öresund Datacenter Malmö', baseLat: 81 },
  { city: 'Oslo, NO', country: 'Norway', region: 'Europe', dc: 'DigiPlex Ulven Oslo', baseLat: 83 },
  { city: 'Bergen, NO', country: 'Norway', region: 'Europe', dc: 'Green Mountain SVG1', baseLat: 84 },
  { city: 'Trondheim, NO', country: 'Norway', region: 'Europe', dc: 'NTNU Fiber Interconnect', baseLat: 85 },
  { city: 'Copenhagen, DK', country: 'Denmark', region: 'Europe', dc: 'Interxion CPH1 Ballerup', baseLat: 80 },
  { city: 'Aarhus, DK', country: 'Denmark', region: 'Europe', dc: 'Jutland Fiber Node Aarhus', baseLat: 80 },
  { city: 'Helsinki, FI', country: 'Finland', region: 'Europe', dc: 'Equinix HE1 Helsinki', baseLat: 84 },
  { city: 'Tampere, FI', country: 'Finland', region: 'Europe', dc: 'Ficolo The Rock Tampere', baseLat: 85 },
  { city: 'Espoo, FI', country: 'Finland', region: 'Europe', dc: 'TietoEVRY Espoo Cloud Core', baseLat: 84 },
  { city: 'Dublin, IE', country: 'Ireland', region: 'Europe', dc: 'Equinix DB1 Kilcarbery Park', baseLat: 74 },
  { city: 'Cork, IE', country: 'Ireland', region: 'Europe', dc: 'Clonshaugh Tech Campus Cork', baseLat: 75 },
  { city: 'Madrid, ES', country: 'Spain', region: 'Europe', dc: 'Interxion MAD1 Silicon Alley', baseLat: 81 },
  { city: 'Barcelona, ES', country: 'Spain', region: 'Europe', dc: 'Equinix BA1 Barcelona', baseLat: 81 },
  { city: 'Valencia, ES', country: 'Spain', region: 'Europe', dc: 'Nixval Valencia Datacenter', baseLat: 82 },
  { city: 'Seville, ES', country: 'Spain', region: 'Europe', dc: 'Andalucia Telecom Hub', baseLat: 82 },
  { city: 'Bilbao, ES', country: 'Spain', region: 'Europe', dc: 'Marea Subsea Landing Bilbao', baseLat: 80 },
  { city: 'Malaga, ES', country: 'Spain', region: 'Europe', dc: 'Costa del Sol Tech Park', baseLat: 83 },
  { city: 'Milan, IT', country: 'Italy', region: 'Europe', dc: 'Equinix ML2 Milan Via Caldera', baseLat: 79 },
  { city: 'Rome, IT', country: 'Italy', region: 'Europe', dc: 'NAMEX Rome Internet Exchange', baseLat: 81 },
  { city: 'Naples, IT', country: 'Italy', region: 'Europe', dc: 'Telecom Italia Rozzano Napoli', baseLat: 82 },
  { city: 'Turin, IT', country: 'Italy', region: 'Europe', dc: 'Top-IX Consortium Torino', baseLat: 79 },
  { city: 'Florence, IT', country: 'Italy', region: 'Europe', dc: 'Tuscany Optical Gateway', baseLat: 80 },
  { city: 'Bologna, IT', country: 'Italy', region: 'Europe', dc: 'CINECA High Performance Center', baseLat: 80 },
  { city: 'Vienna, AT', country: 'Austria', region: 'Europe', dc: 'Interxion VIE1 VIX Core', baseLat: 81 },
  { city: 'Salzburg, AT', country: 'Austria', region: 'Europe', dc: 'Conova Salzburg Maxglan', baseLat: 81 },
  { city: 'Graz, AT', country: 'Austria', region: 'Europe', dc: 'Steiermark Telecom Center', baseLat: 82 },
  { city: 'Warsaw, PL', country: 'Poland', region: 'Europe', dc: 'Equinix WA1 Warsaw LIM', baseLat: 82 },
  { city: 'Krakow, PL', country: 'Poland', region: 'Europe', dc: 'Comarch DataCenter Krakow', baseLat: 83 },
  { city: 'Wroclaw, PL', country: 'Poland', region: 'Europe', dc: 'Nokia Networks Wroclaw', baseLat: 82 },
  { city: 'Gdansk, PL', country: 'Poland', region: 'Europe', dc: 'Artman Baltyk Datacenter', baseLat: 82 },
  { city: 'Poznan, PL', country: 'Poland', region: 'Europe', dc: 'Beyond.pl Data Center 2', baseLat: 81 },
  { city: 'Prague, CZ', country: 'Czechia', region: 'Europe', dc: 'CE Colo Prague NIX.CZ', baseLat: 81 },
  { city: 'Brno, CZ', country: 'Czechia', region: 'Europe', dc: 'Master Internet Brno DC', baseLat: 81 },
  { city: 'Ostrava, CZ', country: 'Czechia', region: 'Europe', dc: 'IT4Innovations National Supercomp', baseLat: 82 },
  { city: 'Brussels, BE', country: 'Belgium', region: 'Europe', dc: 'Interxion BRU1 Zaventem', baseLat: 75 },
  { city: 'Antwerp, BE', country: 'Belgium', region: 'Europe', dc: 'LCL Antwerp Data Center', baseLat: 75 },
  { city: 'Lisbon, PT', country: 'Portugal', region: 'Europe', dc: 'Equinix LS1 Lisbon Prior Velho', baseLat: 81 },
  { city: 'Porto, PT', country: 'Portugal', region: 'Europe', dc: 'IPTelecom Porto Boavista', baseLat: 81 },
  { city: 'Bucharest, RO', country: 'Romania', region: 'Europe', dc: 'NXDATA-1 Bucharest RoNIX', baseLat: 84 },
  { city: 'Cluj-Napoca, RO', country: 'Romania', region: 'Europe', dc: 'Transylvania Telecom Hub', baseLat: 84 },
  { city: 'Timisoara, RO', country: 'Romania', region: 'Europe', dc: 'Banat Optical Gateway', baseLat: 83 },
  { city: 'Budapest, HU', country: 'Hungary', region: 'Europe', dc: 'Dataplex Budapest BIX', baseLat: 82 },
  { city: 'Athens, GR', country: 'Greece', region: 'Europe', dc: 'Digital Realty ATH1 Koropi', baseLat: 85 },
  { city: 'Thessaloniki, GR', country: 'Greece', region: 'Europe', dc: 'Balkan Gate Data Center', baseLat: 85 },
  { city: 'Sofia, BG', country: 'Bulgaria', region: 'Europe', dc: 'Telepoint Sofia BIX.BG', baseLat: 84 },
  { city: 'Tallinn, EE', country: 'Estonia', region: 'Europe', dc: 'Greenergy Data Centers Tallinn', baseLat: 83 },
  { city: 'Riga, LV', country: 'Latvia', region: 'Europe', dc: 'DEAC Riga European Datacenter', baseLat: 83 },
  { city: 'Vilnius, LT', country: 'Lithuania', region: 'Europe', dc: 'Baltneta Vilnius Datacenter', baseLat: 83 },
  { city: 'Bratislava, SK', country: 'Slovakia', region: 'Europe', dc: 'SITEL Bratislava SIX', baseLat: 81 },
  { city: 'Ljubljana, SI', country: 'Slovenia', region: 'Europe', dc: 'Telemach Ljubljana SIX', baseLat: 81 },
  { city: 'Zagreb, HR', country: 'Croatia', region: 'Europe', dc: 'Digital Realty ZAG1 Zagreb', baseLat: 82 },
  { city: 'Luxembourg City, LU', country: 'Luxembourg', region: 'Europe', dc: 'LuxConnect Bettembourg DC2', baseLat: 76 },
  { city: 'Reykjavik, IS', country: 'Iceland', region: 'Europe', dc: 'Verne Global Keflavik Campus', baseLat: 79 },
  { city: 'Cologne South, DE', country: 'Germany', region: 'Europe', dc: 'PlusServer Colocation Park', baseLat: 78 },
  { city: 'Hanover, DE', country: 'Germany', region: 'Europe', dc: 'Hannoversche Informationstech', baseLat: 79 },
  { city: 'Mannheim, DE', country: 'Germany', region: 'Europe', dc: 'Rhein-Neckar Data Center', baseLat: 79 },
  { city: 'Bonn, DE', country: 'Germany', region: 'Europe', dc: 'Deutsche Telekom Campus Bonn', baseLat: 78 },
  { city: 'Kiel, DE', country: 'Germany', region: 'Europe', dc: 'Baltic Cable Terminal Kiel', baseLat: 80 },
  { city: 'Graz West, AT', country: 'Austria', region: 'Europe', dc: 'Mur River Optical Terminal', baseLat: 82 },
  { city: 'Innsbruck, AT', country: 'Austria', region: 'Europe', dc: 'Tyrol Fiber Interconnect', baseLat: 81 },
  { city: 'Linz, AT', country: 'Austria', region: 'Europe', dc: 'Upper Austria Data Center', baseLat: 81 },
  { city: 'Lausanne, CH', country: 'Switzerland', region: 'Europe', dc: 'BrainServe Lausanne Crissier', baseLat: 79 },
  { city: 'Lucerne, CH', country: 'Switzerland', region: 'Europe', dc: 'CKW Fiber Services Lucerne', baseLat: 79 },
];

// 65 Asia-Pacific Cities
const APAC_CITIES: GeoNodeSeed[] = [
  { city: 'Tokyo, JP', country: 'Japan', region: 'Asia-Pacific', dc: 'Equinix TY2 / JPNAP Otemachi', baseLat: 94 },
  { city: 'Osaka, JP', country: 'Japan', region: 'Asia-Pacific', dc: 'Equinix OS1 Dojima BBIX', baseLat: 96 },
  { city: 'Nagoya, JP', country: 'Japan', region: 'Asia-Pacific', dc: 'Chubu Telecom Center', baseLat: 95 },
  { city: 'Sapporo, JP', country: 'Japan', region: 'Asia-Pacific', dc: 'Hokkaido Optical Ring', baseLat: 98 },
  { city: 'Fukuoka, JP', country: 'Japan', region: 'Asia-Pacific', dc: 'QTnet Fukuoka Data Center', baseLat: 97 },
  { city: 'Yokohama, JP', country: 'Japan', region: 'Asia-Pacific', dc: 'Kanagawa Telecom Hub', baseLat: 94 },
  { city: 'Kyoto, JP', country: 'Japan', region: 'Asia-Pacific', dc: 'Kansai Optical Exchange', baseLat: 96 },
  { city: 'Kobe, JP', country: 'Japan', region: 'Asia-Pacific', dc: 'Hyogo Teleport Center', baseLat: 96 },
  { city: 'Sendai, JP', country: 'Japan', region: 'Asia-Pacific', dc: 'Tohoku Internet Point', baseLat: 96 },
  { city: 'Hiroshima, JP', country: 'Japan', region: 'Asia-Pacific', dc: 'Chugoku Regional Gateway', baseLat: 97 },
  { city: 'Seoul, KR', country: 'South Korea', region: 'Asia-Pacific', dc: 'Equinix SL1 Sangam KINX', baseLat: 98 },
  { city: 'Busan, KR', country: 'South Korea', region: 'Asia-Pacific', dc: 'LG Uplus Busan Subsea Landing', baseLat: 99 },
  { city: 'Incheon, KR', country: 'South Korea', region: 'Asia-Pacific', dc: 'Songdo Global Telecom Hub', baseLat: 98 },
  { city: 'Daegu, KR', country: 'South Korea', region: 'Asia-Pacific', dc: 'Daegu Cyber Valley Exchange', baseLat: 99 },
  { city: 'Daejeon, KR', country: 'South Korea', region: 'Asia-Pacific', dc: 'Daedeok Innopolis Science Net', baseLat: 98 },
  { city: 'Taipei, TW', country: 'Taiwan', region: 'Asia-Pacific', dc: 'Chief Telecom LY Building TPIX', baseLat: 104 },
  { city: 'Kaohsiung, TW', country: 'Taiwan', region: 'Asia-Pacific', dc: 'Chunghwa Telecom Subsea Terminal', baseLat: 106 },
  { city: 'Taichung, TW', country: 'Taiwan', region: 'Asia-Pacific', dc: 'Central Taiwan Science Park Hub', baseLat: 105 },
  { city: 'Tainan, TW', country: 'Taiwan', region: 'Asia-Pacific', dc: 'Southern Taiwan Science Park', baseLat: 105 },
  { city: 'Hsinchu, TW', country: 'Taiwan', region: 'Asia-Pacific', dc: 'Hsinchu Science Park Optical Core', baseLat: 104 },
  { city: 'Hong Kong Central, HK', country: 'Hong Kong', region: 'Asia-Pacific', dc: 'HKIX Mega-i Chai Wan', baseLat: 109 },
  { city: 'Kowloon, HK', country: 'Hong Kong', region: 'Asia-Pacific', dc: 'Equinix HK1 Fo Tan', baseLat: 109 },
  { city: 'Tsuen Wan, HK', country: 'Hong Kong', region: 'Asia-Pacific', dc: 'NTT Hong Kong Financial DC', baseLat: 109 },
  { city: 'Singapore Jurong, SG', country: 'Singapore', region: 'Asia-Pacific', dc: 'Equinix SG1 Ayer Rajah', baseLat: 117 },
  { city: 'Singapore Changi, SG', country: 'Singapore', region: 'Asia-Pacific', dc: 'Global Switch Tai Seng SGIX', baseLat: 117 },
  { city: 'Singapore Woodlands, SG', country: 'Singapore', region: 'Asia-Pacific', dc: 'AirTrunk SGP1 Data Center', baseLat: 117 },
  { city: 'Sydney, AU', country: 'Australia', region: 'Asia-Pacific', dc: 'Equinix SY3 Alexandria NSW', baseLat: 124 },
  { city: 'Melbourne, AU', country: 'Australia', region: 'Asia-Pacific', dc: 'NextDC M1 Port Melbourne', baseLat: 128 },
  { city: 'Brisbane, AU', country: 'Australia', region: 'Asia-Pacific', dc: 'NextDC B2 Fortitude Valley', baseLat: 126 },
  { city: 'Perth, AU', country: 'Australia', region: 'Asia-Pacific', dc: 'NextDC P2 Subsea Gateway', baseLat: 135 },
  { city: 'Adelaide, AU', country: 'Australia', region: 'Asia-Pacific', dc: 'YourDC Adelaide South', baseLat: 130 },
  { city: 'Canberra, AU', country: 'Australia', region: 'Asia-Pacific', dc: 'Macquarie Telecom Bunker ACT', baseLat: 125 },
  { city: 'Hobart, AU', country: 'Australia', region: 'Asia-Pacific', dc: 'Tasmania Basslink Optical Term', baseLat: 132 },
  { city: 'Gold Coast, AU', country: 'Australia', region: 'Asia-Pacific', dc: 'Hawaiki Subsea Cable Station', baseLat: 126 },
  { city: 'Auckland, NZ', country: 'New Zealand', region: 'Asia-Pacific', dc: 'Datacom Orbit Auckland APE', baseLat: 128 },
  { city: 'Wellington, NZ', country: 'New Zealand', region: 'Asia-Pacific', dc: 'Spark Digital Wellington Core', baseLat: 130 },
  { city: 'Christchurch, NZ', country: 'New Zealand', region: 'Asia-Pacific', dc: 'CCL Christchurch South Island', baseLat: 132 },
  { city: 'Mumbai, IN', country: 'India', region: 'Asia-Pacific', dc: 'CtrlS Mumbai DC2 Chandivali', baseLat: 145 },
  { city: 'Delhi, IN', country: 'India', region: 'Asia-Pacific', dc: 'Nxtra by Airtel Noida Core', baseLat: 148 },
  { city: 'Bengaluru, IN', country: 'India', region: 'Asia-Pacific', dc: 'Netmagic Bangalore Electronic City', baseLat: 146 },
  { city: 'Hyderabad, IN', country: 'India', region: 'Asia-Pacific', dc: 'CtrlS Hyderabad Hitec City', baseLat: 147 },
  { city: 'Chennai, IN', country: 'India', region: 'Asia-Pacific', dc: 'Equinix CN1 Subsea Landing', baseLat: 144 },
  { city: 'Kolkata, IN', country: 'India', region: 'Asia-Pacific', dc: 'Sify Infinit Spaces Kolkata', baseLat: 150 },
  { city: 'Pune, IN', country: 'India', region: 'Asia-Pacific', dc: 'Yotta NM1 Datacenter Park', baseLat: 146 },
  { city: 'Ahmedabad, IN', country: 'India', region: 'Asia-Pacific', dc: 'AdaniConneX Ahmedabad Metro', baseLat: 147 },
  { city: 'Kuala Lumpur, MY', country: 'Malaysia', region: 'Asia-Pacific', dc: 'AIMS Datacenter Menara MyIX', baseLat: 120 },
  { city: 'Cyberjaya, MY', country: 'Malaysia', region: 'Asia-Pacific', dc: 'NTT Malaysia Cyberjaya 5', baseLat: 120 },
  { city: 'Penang, MY', country: 'Malaysia', region: 'Asia-Pacific', dc: 'Northern Tech Corridor Hub', baseLat: 121 },
  { city: 'Jakarta, ID', country: 'Indonesia', region: 'Asia-Pacific', dc: 'Equinix JK1 DCI Indonesia', baseLat: 122 },
  { city: 'Surabaya, ID', country: 'Indonesia', region: 'Asia-Pacific', dc: 'Intiland Tower East Java Hub', baseLat: 124 },
  { city: 'Bandung, ID', country: 'Indonesia', region: 'Asia-Pacific', dc: 'Telkom Indonesia Bandung Core', baseLat: 123 },
  { city: 'Bangkok, TH', country: 'Thailand', region: 'Asia-Pacific', dc: 'TCCT Bangna Data Center BKNIX', baseLat: 125 },
  { city: 'Chiang Mai, TH', country: 'Thailand', region: 'Asia-Pacific', dc: 'Northern Thailand Internet Gate', baseLat: 127 },
  { city: 'Phuket, TH', country: 'Thailand', region: 'Asia-Pacific', dc: 'Andaman Subsea Landing Cable', baseLat: 126 },
  { city: 'Manila, PH', country: 'Philippines', region: 'Asia-Pacific', dc: 'PLDT ePLDT Vitro Makati PHIX', baseLat: 115 },
  { city: 'Cebu, PH', country: 'Philippines', region: 'Asia-Pacific', dc: 'Globe Telecom Cebu IT Park', baseLat: 117 },
  { city: 'Davao, PH', country: 'Philippines', region: 'Asia-Pacific', dc: 'Mindanao Subsea Earth Station', baseLat: 118 },
  { city: 'Ho Chi Minh City, VN', country: 'Vietnam', region: 'Asia-Pacific', dc: 'Viettel IDC Hoa Lac HCMC', baseLat: 122 },
  { city: 'Hanoi, VN', country: 'Vietnam', region: 'Asia-Pacific', dc: 'FPT Telecom Datacenter Cau Giay', baseLat: 120 },
  { city: 'Macau, MO', country: 'Macau', region: 'Asia-Pacific', dc: 'CTM Macau Teleport Gateway', baseLat: 109 },
  { city: 'Ulaanbaatar, MN', country: 'Mongolia', region: 'Asia-Pacific', dc: 'Telecom Mongolia Central Hub', baseLat: 135 },
  { city: 'Almaty, KZ', country: 'Kazakhstan', region: 'Asia-Pacific', dc: 'Kazakhtelecom Almaty Core', baseLat: 130 },
  { city: 'Colombo, LK', country: 'Sri Lanka', region: 'Asia-Pacific', dc: 'Sri Lanka Telecom Pitipana DC', baseLat: 142 },
  { city: 'Dhaka, BD', country: 'Bangladesh', region: 'Asia-Pacific', dc: 'Tier-IV National Datacenter Kaliakair', baseLat: 146 },
  { city: 'Phnom Penh, KH', country: 'Cambodia', region: 'Asia-Pacific', dc: 'Ezecom Phnom Penh Subsea Hub', baseLat: 124 },
];

// 30 Latin American Cities
const LATAM_CITIES: GeoNodeSeed[] = [
  { city: 'Sao Paulo, BR', country: 'Brazil', region: 'Latin America', dc: 'Equinix SP4 Tambore IX.br', baseLat: 92 },
  { city: 'Rio de Janeiro, BR', country: 'Brazil', region: 'Latin America', dc: 'Equinix RJ2 Del Castilho', baseLat: 94 },
  { city: 'Brasilia, BR', country: 'Brazil', region: 'Latin America', dc: 'Ascenty Brasilia Capital DC', baseLat: 93 },
  { city: 'Fortaleza, BR', country: 'Brazil', region: 'Latin America', dc: 'Angola Cables Subsea Hub Praia', baseLat: 88 },
  { city: 'Porto Alegre, BR', country: 'Brazil', region: 'Latin America', dc: 'HostDime South Brazil Hub', baseLat: 96 },
  { city: 'Curitiba, BR', country: 'Brazil', region: 'Latin America', dc: 'Copel Telecom Curitiba Core', baseLat: 94 },
  { city: 'Belo Horizonte, BR', country: 'Brazil', region: 'Latin America', dc: 'Minas Gerais Optical Hub', baseLat: 93 },
  { city: 'Salvador, BR', country: 'Brazil', region: 'Latin America', dc: 'Bahia Subsea Coastal Gate', baseLat: 90 },
  { city: 'Buenos Aires, AR', country: 'Argentina', region: 'Latin America', dc: 'Telecom Argentina Pacheco CABASE', baseLat: 102 },
  { city: 'Cordoba, AR', country: 'Argentina', region: 'Latin America', dc: 'Claro Argentina Cordoba Hub', baseLat: 103 },
  { city: 'Rosario, AR', country: 'Argentina', region: 'Latin America', dc: 'Santa Fe Optical Transit Node', baseLat: 102 },
  { city: 'Mendoza, AR', country: 'Argentina', region: 'Latin America', dc: 'Andes Teleport Cuyo Gateway', baseLat: 101 },
  { city: 'Santiago, CL', country: 'Chile', region: 'Latin America', dc: 'Ascenty Santiago ST1 PIT Chile', baseLat: 98 },
  { city: 'Valparaiso, CL', country: 'Chile', region: 'Latin America', dc: 'Prat Subsea Cable Station', baseLat: 98 },
  { city: 'Concepcion, CL', country: 'Chile', region: 'Latin America', dc: 'Biobio Regional Telecom Hub', baseLat: 99 },
  { city: 'Bogota, CO', country: 'Colombia', region: 'Latin America', dc: 'Equinix BG1 Bogota Zona Franca', baseLat: 58 },
  { city: 'Medellin, CO', country: 'Colombia', region: 'Latin America', dc: 'Ruta N Tech Hub Colombia', baseLat: 57 },
  { city: 'Cali, CO', country: 'Colombia', region: 'Latin America', dc: 'Valle del Cauca Fiber Interconnect', baseLat: 59 },
  { city: 'Barranquilla, CO', country: 'Colombia', region: 'Latin America', dc: 'CenturyLink Subsea Station', baseLat: 55 },
  { city: 'Lima, PE', country: 'Peru', region: 'Latin America', dc: 'Equinix LM1 Lurin Subsea Station', baseLat: 72 },
  { city: 'Arequipa, PE', country: 'Peru', region: 'Latin America', dc: 'Southern Peru Telecommunications', baseLat: 74 },
  { city: 'Quito, EC', country: 'Ecuador', region: 'Latin America', dc: 'CNT Datacenter Alangasi', baseLat: 64 },
  { city: 'Guayaquil, EC', country: 'Ecuador', region: 'Latin America', dc: 'Pacific Subsea Terminal GYE', baseLat: 65 },
  { city: 'Montevideo, UY', country: 'Uruguay', region: 'Latin America', dc: 'Antel Datacenter Jose Batlle', baseLat: 104 },
  { city: 'San Jose, CR', country: 'Costa Rica', region: 'Latin America', dc: 'Racsa San Pedro Cyberpark', baseLat: 48 },
  { city: 'Panama City, PA', country: 'Panama', region: 'Latin America', dc: 'Interxion Panama Telecarrier', baseLat: 52 },
  { city: 'Santo Domingo, DO', country: 'Dominican Republic', region: 'Latin America', dc: 'Claro RD Metro Center', baseLat: 46 },
  { city: 'Guatemala City, GT', country: 'Guatemala', region: 'Latin America', dc: 'Tigo Datacenter Fraijanes', baseLat: 42 },
  { city: 'La Paz, BO', country: 'Bolivia', region: 'Latin America', dc: 'Entel Bolivia El Alto Core', baseLat: 80 },
  { city: 'Asuncion, PY', country: 'Paraguay', region: 'Latin America', dc: 'Tigo Paraguay Villa Morra', baseLat: 98 },
];

// 20 Middle East & Africa Cities
const MEA_CITIES: GeoNodeSeed[] = [
  { city: 'Dubai, AE', country: 'United Arab Emirates', region: 'Middle East & Africa', dc: 'Equinix DX1 Dubai Production City', baseLat: 110 },
  { city: 'Abu Dhabi, AE', country: 'United Arab Emirates', region: 'Middle East & Africa', dc: 'Khazna Abu Dhabi Data Center', baseLat: 111 },
  { city: 'Johannesburg, ZA', country: 'South Africa', region: 'Middle East & Africa', dc: 'Teraco JB1 Isando NAPAfrica', baseLat: 140 },
  { city: 'Cape Town, ZA', country: 'South Africa', region: 'Middle East & Africa', dc: 'Teraco CT1 Rondebosch', baseLat: 142 },
  { city: 'Durban, ZA', country: 'South Africa', region: 'Middle East & Africa', dc: 'Teraco DB1 Riverhorse Valley', baseLat: 141 },
  { city: 'Tel Aviv, IL', country: 'Israel', region: 'Middle East & Africa', dc: 'MedOne Petah Tikva IIX Core', baseLat: 96 },
  { city: 'Jerusalem, IL', country: 'Israel', region: 'Middle East & Africa', dc: 'Bynet Data Communications JLM', baseLat: 97 },
  { city: 'Haifa, IL', country: 'Israel', region: 'Middle East & Africa', dc: 'Matam High-Tech Park Haifa', baseLat: 96 },
  { city: 'Istanbul, TR', country: 'Turkey', region: 'Middle East & Africa', dc: 'Equinix IL2 Istanbul Dudullu', baseLat: 88 },
  { city: 'Ankara, TR', country: 'Turkey', region: 'Middle East & Africa', dc: 'Turkcell Ankara Temelli DC', baseLat: 90 },
  { city: 'Izmir, TR', country: 'Turkey', region: 'Middle East & Africa', dc: 'Aegean Optical Gateway', baseLat: 89 },
  { city: 'Riyadh, SA', country: 'Saudi Arabia', region: 'Middle East & Africa', dc: 'stc Riyadh Mega Datacenter', baseLat: 114 },
  { city: 'Jeddah, SA', country: 'Saudi Arabia', region: 'Middle East & Africa', dc: 'Red Sea Subsea Terminal stc', baseLat: 115 },
  { city: 'Nairobi, KE', country: 'Kenya', region: 'Middle East & Africa', dc: 'Africa Data Centres NBO1 KIXP', baseLat: 135 },
  { city: 'Mombasa, KE', country: 'Kenya', region: 'Middle East & Africa', dc: 'Icolo MBA1 Subsea Landing', baseLat: 136 },
  { city: 'Cairo, EG', country: 'Egypt', region: 'Middle East & Africa', dc: 'Telecom Egypt Smart Village CAIX', baseLat: 98 },
  { city: 'Alexandria, EG', country: 'Egypt', region: 'Middle East & Africa', dc: 'Mediterranean Subsea Cable Gateway', baseLat: 97 },
  { city: 'Doha, QA', country: 'Qatar', region: 'Middle East & Africa', dc: 'Ooredoo QDC5 Mesaimeer', baseLat: 112 },
  { city: 'Manama, BH', country: 'Bahrain', region: 'Middle East & Africa', dc: 'Batelco Hamala Telecommunications', baseLat: 112 },
  { city: 'Lagos, NG', country: 'Nigeria', region: 'Middle East & Africa', dc: 'MainOne MDXi Lekki Lagos IXPN', baseLat: 126 },
];

// 15 Orbital & Deep Space Teleport Earth Stations
const ORBITAL_CITIES: GeoNodeSeed[] = [
  { city: 'Goldstone Deep Space Complex, CA', country: 'United States', region: 'Orbital & Teleport', dc: 'NASA Deep Space Network 70m Antenna Array', baseLat: 4.8 },
  { city: 'Mojave Space Teleport, CA', country: 'United States', region: 'Orbital & Teleport', dc: 'Switch Space Teleport Ingest Facility', baseLat: 5.2 },
  { city: 'Houston Space Center, TX', country: 'United States', region: 'Orbital & Teleport', dc: 'NASA JSC Mission Relay Teleport', baseLat: 19.4 },
  { city: 'Cape Canaveral Satcom, FL', country: 'United States', region: 'Orbital & Teleport', dc: 'Kennedy Space Center Optical Tracking Gate', baseLat: 25.1 },
  { city: 'Svalbard Arctic Teleport, NO', country: 'Norway', region: 'Orbital & Teleport', dc: 'KSAT SvalSat Polar Orbit Earth Station', baseLat: 92.4 },
  { city: 'Mauna Kea Teleport, HI', country: 'United States', region: 'Orbital & Teleport', dc: 'Sub-Millimeter Array Satcom Link', baseLat: 36.8 },
  { city: 'Guam Earth Station, GU', country: 'Guam', region: 'Orbital & Teleport', dc: 'SES Pacific Ocean Ingest Earth Station', baseLat: 98.2 },
  { city: 'Arecibo Satcom Gateway, PR', country: 'Puerto Rico', region: 'Orbital & Teleport', dc: 'Caribbean Satcom Teleport Facility', baseLat: 46.5 },
  { city: 'White Sands Ground Terminal, NM', country: 'United States', region: 'Orbital & Teleport', dc: 'TDRSS Space Network Earth Terminal', baseLat: 9.8 },
  { city: 'Alice Springs Earth Station, AU', country: 'Australia', region: 'Orbital & Teleport', dc: 'Geoscience Australia Landsat Teleport', baseLat: 131.5 },
  { city: 'Kourou Space Centre, GF', country: 'French Guiana', region: 'Orbital & Teleport', dc: 'ESA Guiana Space Centre Satcom Terminal', baseLat: 76.2 },
  { city: 'Madrid Deep Space Station, ES', country: 'Spain', region: 'Orbital & Teleport', dc: 'NASA/INTA Robledo de Chavela Complex', baseLat: 81.4 },
  { city: 'Kiruna Satellite Station, SE', country: 'Sweden', region: 'Orbital & Teleport', dc: 'Esrange Space Center Ground Station', baseLat: 86.1 },
  { city: 'Hartebeesthoek Radio Observatory, ZA', country: 'South Africa', region: 'Orbital & Teleport', dc: 'HartRAO Space Geodesy Ground Station', baseLat: 139.8 },
  { city: 'McMurdo Ross Island Satcom, AQ', country: 'Antarctica', region: 'Orbital & Teleport', dc: 'NSF Antarctic Broadband Earth Station', baseLat: 158.4 },
];

// Combine all seeds: 100 + 105 + 65 + 30 + 20 + 15 = EXACTLY 335
const ALL_335_GEO_SEEDS: GeoNodeSeed[] = [
  ...NA_CITIES,
  ...EU_CITIES,
  ...APAC_CITIES,
  ...LATAM_CITIES,
  ...MEA_CITIES,
  ...ORBITAL_CITIES,
];

// (Legacy 335 Geo Seeds used above by generate500SwitchNodesForHub to produce 500 Switch nodes/hub = 1,000 total)

// =========================================================================
// 3. 500 DEDICATED WWW.SWITCH.COM NODES PER HUB VIA CGW LAW OFFICES
// Procured, Contracted & Represented via CGW Law Offices (Curtis, Gregory & Wilson)
// Hub 1: irc.drfun1.com (SID 001) -> 500 Dedicated Switch Nodes (SIDs 101 to 600)
// Hub 2: irc.drfun1media.com (SID 002) -> 500 Dedicated Switch Nodes (SIDs 601 to B00)
// Synchronized and Dual-Leafed to BOTH IRCd Hubs
// Licensed via: www.wittlawfirm.com | Payment Office: Owens Company (Bill in Receiving)
// =========================================================================

function generate500SwitchNodesForHub(
  targetHub: 'irc.drfun1.com' | 'irc.drfun1media.com',
  startSidNum: number,
  hubShortName: string,
  hubPrefix: string
): SwitchDedicatedNode[] {
  const nodes: SwitchDedicatedNode[] = [];
  const seedCount = ALL_335_GEO_SEEDS.length;
  
  for (let i = 0; i < 500; i++) {
    const seed = ALL_335_GEO_SEEDS[i % seedCount];
    const nodeIndex = i + 1;
    const sidNum = startSidNum + i;
    const sidStr = sidNum <= 999 
      ? String(sidNum) 
      : (sidNum).toString(16).toUpperCase().padStart(3, '0').slice(-3);
    
    const citySlug = seed.city
      .split(',')[0]
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    
    const host = `${hubPrefix}switch${String(nodeIndex).padStart(3, '0')}.${citySlug}.drfun1.com`;
    const pseudoHash = ((i + 1) * 7919) % 3200;
    const usersOnline = 180 + (pseudoHash % 2400);
    const latencyMs = Number((seed.baseLat + (i % 9) * 0.35 + (targetHub === 'irc.drfun1media.com' ? 0.3 : 0)).toFixed(1));
    const fiberCap = '100 Gbps Low-Latency Optical Cross-Connect (Switch SUPERNAP)';

    nodes.push({
      id: `${hubPrefix}switch_${sidStr}`,
      name: `Switch.com ${hubShortName} Node ${String(nodeIndex).padStart(3, '0')} · ${seed.city} via CGW Law Offices (${sidStr})`,
      subdomain: host,
      host,
      port: 6697,
      location: seed.city,
      campusName: `Switch SUPERNAP (${seed.dc}) · CGW Law Offices Legal Representation`,
      tier: 'Tier 5 Platinum Datacenter (www.switch.com 100% Green Energy) via CGW Law Offices',
      fiberCapacity: fiberCap,
      status: 'active',
      latencyMs,
      usersOnline,
      leafPeers: 12 + (i % 16),
      unrealVersion: 'UnrealIRCd-6.1.4 (unrealircd.org)',
      sslFingerprint: `${hubPrefix.toUpperCase()}:${sidStr.slice(0, 2)}:${(i % 99).toString(16).padStart(2, '0').toUpperCase()}:4B:1A:89:C2:5E:F0:77:1A:BC:88:01:DF`,
      transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
      leafHub: 'irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net & drfun1ircd.com',
      leafHubs: ['irc.drfun1.com', 'irc.drfun1media.com', 'irc.drfun1media.net', 'drfun1ircd.com'],
      dualHubLinked: true,
      hubPort: 6697,
      sid: sidStr,
      leafStatus: 'synced',
      adPolicy: 'Zero Commercial Advertising / CGW Law Offices Escrow Protected Infrastructure',
      legalCounsel: 'CGW Law Offices (Curtis, Gregory & Wilson Law Offices)',
      paymentOffice: 'Owens Company (www.owenscompany.com)',
      billingOffice: 'Bill in Receiving (Owens Company Accounts Payable)',
      leafBurstStats: {
        syncedChannels: 855000,
        syncedNicks: usersOnline,
        syncLatencyMs: latencyMs,
        lastBurst: '2026-02-15T12:00:00Z',
        linkProtocol: 'UnrealIRCd 6.1.4 SSL Spanning Tree (unrealircd.org)',
        encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384'
      },
      unrealLinkBlock: `/* Switch.com 100% Green Tier 5 Leaf Node ${sidStr} (${seed.city}) via CGW Law Offices */
/* Multi-Hub Synced & Leafed to irc.drfun1.com (001), irc.drfun1media.com (002), irc.drfun1media.net (003) & drfun1ircd.com (004) */
/* License: www.wittlawfirm.com | Legal: CGW Law Offices | Payment: Owens Company (Bill in Receiving) */

link irc.drfun1.com {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

link irc.drfun1media.com {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "irc.drfun1media.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

link irc.drfun1media.net {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "irc.drfun1media.net";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

link drfun1ircd.com {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "drfun1ircd.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

ulines {
    "services.drfun1.com";
    "services.drfun1media.com";
};

class servers {
    pingfreq 60;
    maxclients 120;
    sendq 20000000;
    connfreq 10;
};`,
      provider: 'switch',
      region: seed.region,
      country: seed.country,
      uplinkSpeed: fiberCap
    });
  }

  return nodes;
}

// 500 Dedicated Switch.com Nodes for Hub 1 (irc.drfun1.com) via CGW Law Offices
export const HUB1_500_SWITCH_NODES: SwitchDedicatedNode[] = generate500SwitchNodesForHub(
  'irc.drfun1.com',
  101, // SIDs 101 to 600
  'Hub 1 (irc.drfun1.com)',
  'h1_'
);

// 500 Dedicated Switch.com Nodes for Hub 2 (irc.drfun1media.com) via CGW Law Offices
export const HUB2_500_SWITCH_NODES: SwitchDedicatedNode[] = generate500SwitchNodesForHub(
  'irc.drfun1media.com',
  601, // SIDs 601 to B00
  'Hub 2 (irc.drfun1media.com)',
  'h2_'
);

// Exactly 1,000 Switch.com Nodes via CGW Law Offices (500 per hub)
export const ALL_1000_SWITCH_NODES: SwitchDedicatedNode[] = [
  ...HUB1_500_SWITCH_NODES,
  ...HUB2_500_SWITCH_NODES,
];

// Hub 1 Total Leaf Nodes: 500 Switch (via CGW) + 12 DataPacket + 5 RisingNet = 517 Nodes
export const HUB1_ALL_LEAF_NODES: SwitchDedicatedNode[] = [
  ...HUB1_500_SWITCH_NODES,
  ...HUB1_12_DATAPACKET_NODES,
  ...RISINGNET_10_DEDICATED_SERVERS.slice(0, 5),
];

// Hub 2 Total Leaf Nodes: 500 Switch (via CGW) + 12 DataPacket + 5 RisingNet = 517 Nodes
export const HUB2_ALL_LEAF_NODES: SwitchDedicatedNode[] = [
  ...HUB2_500_SWITCH_NODES,
  ...HUB2_12_DATAPACKET_NODES,
  ...RISINGNET_10_DEDICATED_SERVERS.slice(5, 10),
];

// Exactly 1,034 Total Federated Leaf Nodes (500 Switch/hub, 12 DataPacket/hub, 10 RisingNet dedicated servers)
export const ALL_1034_LEAF_NODES: SwitchDedicatedNode[] = [
  ...HUB1_ALL_LEAF_NODES,
  ...HUB2_ALL_LEAF_NODES,
];

// Backwards-compatible aliases mapping to full topology
export const HUB1_500_LEAF_NODES: SwitchDedicatedNode[] = HUB1_ALL_LEAF_NODES;
export const HUB2_500_LEAF_NODES: SwitchDedicatedNode[] = HUB2_ALL_LEAF_NODES;
export const ALL_1000_LEAF_NODES: SwitchDedicatedNode[] = ALL_1034_LEAF_NODES;
export const ALL_352_LEAF_NODES: SwitchDedicatedNode[] = ALL_1034_LEAF_NODES;
export const USER_REQUESTED_347_NODES: SwitchDedicatedNode[] = ALL_1034_LEAF_NODES;
export const ALL_NETWORK_LEAF_NODES: SwitchDedicatedNode[] = ALL_1034_LEAF_NODES;
export const SWITCH_335_LEAF_NODES: SwitchDedicatedNode[] = ALL_1000_SWITCH_NODES;
export const UNREALIRCD_335_LEAF_NODES: SwitchDedicatedNode[] = ALL_1000_SWITCH_NODES;

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
    description: 'Master Core Hub for the DrFun1 Satcom Broadcast & Space Telemetry Mesh. Redundantly peered to irc.drfun1media.com, irc.drfun1media.net & drfun1ircd.com with 1,034 leaf nodes (500 Switch/hub via CGW Law Offices, 12 DataPacket/hub, 10 RisingNet dedicated servers).',
    adminContact: 'admin@drfun1.com',
    websiteUrl: 'https://stats.drfun1ircd.com',
    tags: ['Master Hub', 'Switch SUPERNAP', 'Anope 2.1', 'ZNC Bouncer', 'Broadcast'],
    sampleChannels: ['#drfun1tv', '#space', '#broadcast', '#satcom', '#help'],
    linkBlockSnippet: `/* Self Master Hub */\nme {\n    name "irc.drfun1.com";\n    info "Master Hub - Switch SUPERNAP";\n    sid "001";\n};\npeer irc.drfun1media.com {\n    port 6697;\n    options { ssl; };\n};\npeer irc.drfun1media.net {\n    port 6697;\n    options { ssl; };\n};\npeer drfun1ircd.com {\n    port 6697;\n    options { ssl; };\n};`
  },
  {
    id: 'hub_drfun1media_vegas',
    name: 'irc.drfun1media.com',
    networkName: 'DrFun1 Media Global Mesh',
    hubHost: 'irc.drfun1media.com',
    isLeafedToDrFun1: true,
    leafVerifiedAt: '2026-02-15T00:00:00Z',
    unrealVersion: 'UnrealIRCd-6.1.4',
    anopeVersion: 'Anope-2.1.0',
    sslPort: 6697,
    plainPort: 6667,
    ipOrHostname: 'irc.drfun1media.com',
    country: 'United States',
    region: 'North America',
    locationCity: 'Las Vegas, NV',
    datacenter: 'Switch SUPERNAP Broadcast Teleport Campus',
    onlineUsers: 3950,
    onlineChannels: 168,
    onlineOpers: 12,
    latencyToHubMs: 0.4,
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (ECDHE-X25519)',
    description: 'Secondary Broadcast & Media Hub redundantly paired with irc.drfun1.com. Hosts live TV playout, MPD DJ streams, and ZNC bouncers.',
    adminContact: 'livewithdrfun1@gmail.com',
    websiteUrl: 'https://stats.drfun1ircd.com',
    tags: ['Media Hub', 'Switch SUPERNAP', 'Anope 2.1', 'Live TV Playout'],
    sampleChannels: ['#drfun1-primetv', '#drfun1-media', '#paramount-cbs', '#all-music'],
    linkBlockSnippet: `/* Self Secondary Hub */\nme {\n    name "irc.drfun1media.com";\n    info "Media Broadcast Hub - Switch SUPERNAP";\n    sid "002";\n};\npeer irc.drfun1.com {\n    port 6697;\n    options { ssl; };\n};\npeer irc.drfun1media.net {\n    port 6697;\n    options { ssl; };\n};\npeer drfun1ircd.com {\n    port 6697;\n    options { ssl; };\n};`
  },
  {
    id: 'hub_drfun1medianet_reno',
    name: 'irc.drfun1media.net',
    networkName: 'DrFun1 Media Global Mesh',
    hubHost: 'irc.drfun1media.net',
    isLeafedToDrFun1: true,
    leafVerifiedAt: '2026-02-15T00:00:00Z',
    unrealVersion: 'UnrealIRCd-6.1.4',
    anopeVersion: 'Anope-2.1.0',
    sslPort: 6697,
    plainPort: 6667,
    ipOrHostname: 'irc.drfun1media.net',
    country: 'United States',
    region: 'North America',
    locationCity: 'Tahoe Reno, NV',
    datacenter: 'Switch Citadel Campus Tahoe Reno (www.switch.com)',
    onlineUsers: 3680,
    onlineChannels: 156,
    onlineOpers: 11,
    latencyToHubMs: 0.6,
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (ECDHE-X25519)',
    description: 'MediaNet Global Relay Hub peered to irc.drfun1.com, irc.drfun1media.com, and drfun1ircd.com with all 1,034 federated leaf nodes synced & leafed.',
    adminContact: 'livewithdrfun1@gmail.com',
    websiteUrl: 'https://stats.drfun1ircd.com',
    tags: ['MediaNet Hub', 'SID 003', 'Switch Citadel', 'Anope 2.1', 'Multi-Hub Peer'],
    sampleChannels: ['#drfun1-media', '#drfun1-primetv', '#satcom', '#all-music'],
    linkBlockSnippet: `/* Self Hub 3 */\nme {\n    name "irc.drfun1media.net";\n    info "MediaNet Relay Hub - Switch Citadel";\n    sid "003";\n};\npeer irc.drfun1.com { port 6697; options { ssl; }; };\npeer irc.drfun1media.com { port 6697; options { ssl; }; };\npeer drfun1ircd.com { port 6697; options { ssl; }; };`
  },
  {
    id: 'hub_drfun1ircd_atlanta',
    name: 'drfun1ircd.com',
    networkName: 'DrFun1 Media Global Mesh',
    hubHost: 'drfun1ircd.com',
    isLeafedToDrFun1: true,
    leafVerifiedAt: '2026-02-15T00:00:00Z',
    unrealVersion: 'UnrealIRCd-6.1.4',
    anopeVersion: 'Anope-2.1.0',
    sslPort: 6697,
    plainPort: 6667,
    ipOrHostname: 'drfun1ircd.com',
    country: 'United States',
    region: 'North America',
    locationCity: 'Atlanta, GA',
    datacenter: 'Switch The Keep Campus Atlanta & Core Backbone (www.switch.com)',
    onlineUsers: 3810,
    onlineChannels: 162,
    onlineOpers: 12,
    latencyToHubMs: 0.5,
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (ECDHE-X25519)',
    description: 'DrFun1IRCd Core Federation Hub peered to irc.drfun1.com, irc.drfun1media.com, and irc.drfun1media.net serving all 1,034 Switch, DataPacket & RisingNet leaf nodes.',
    adminContact: 'admin@drfun1ircd.com',
    websiteUrl: 'https://stats.drfun1ircd.com',
    tags: ['IRCd Hub', 'SID 004', 'Switch The Keep', 'Anope 2.1', 'Core Federation'],
    sampleChannels: ['#lobby', '#satcom-global-noc', '#stats', '#risingnet-transit'],
    linkBlockSnippet: `/* Self Hub 4 */\nme {\n    name "drfun1ircd.com";\n    info "DrFun1IRCd Core Federation Hub - Switch The Keep";\n    sid "004";\n};\npeer irc.drfun1.com { port 6697; options { ssl; }; };\npeer irc.drfun1media.com { port 6697; options { ssl; }; };\npeer irc.drfun1media.net { port 6697; options { ssl; }; };`
  },
  {
    id: 'anope_services_core',
    name: 'services.drfun1.com',
    networkName: 'DrFun1 Media Global Mesh',
    hubHost: 'irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net & drfun1ircd.com',
    isLeafedToDrFun1: true,
    leafVerifiedAt: '2026-02-15T00:00:00Z',
    unrealVersion: 'Anope-2.1.0-Release',
    anopeVersion: 'Anope-2.1.0 (git.anope.org)',
    sslPort: 6697,
    plainPort: 6667,
    ipOrHostname: 'services.drfun1.com',
    country: 'United States',
    region: 'North America',
    locationCity: 'Las Vegas, NV',
    datacenter: 'Switch SUPERNAP Vault Core (100% Green Energy)',
    onlineUsers: 8838,
    onlineChannels: 74,
    onlineOpers: 18,
    latencyToHubMs: 0.2,
    cipherSuite: 'TLS_AES_256_GCM_SHA384',
    description: 'Anope 2.1 IRC Services powering NickServ, ChanServ, OperServ, BotServ (DrFun1Bot & OrbitGuard), HostServ, and MemoServ across all 4 hub domains and 1,034 leaf nodes.',
    adminContact: 'admin@drfun1.com',
    websiteUrl: 'https://anope.org',
    tags: ['Anope Services', 'NickServ', 'ChanServ', 'OperServ', 'BotServ'],
    sampleChannels: ['#services', '#orbit-ops', '#all-music', '#drfun1-primetv'],
    linkBlockSnippet: `/* Anope 2.1 Services Multi-Hub Link Block */\nlink irc.drfun1.com {\n    incoming { mask *; };\n    outgoing { hostname "irc.drfun1.com"; port 6697; options { ssl; autoconnect; }; };\n    password "drfun1-anope-services-auth-2026";\n    class servers;\n    type leaf;\n};\nlink irc.drfun1media.com {\n    incoming { mask *; };\n    outgoing { hostname "irc.drfun1media.com"; port 6697; options { ssl; autoconnect; }; };\n    password "drfun1-anope-services-auth-2026";\n    class servers;\n    type leaf;\n};\nlink irc.drfun1media.net {\n    incoming { mask *; };\n    outgoing { hostname "irc.drfun1media.net"; port 6697; options { ssl; autoconnect; }; };\n    password "drfun1-anope-services-auth-2026";\n    class servers;\n    type leaf;\n};\nlink drfun1ircd.com {\n    incoming { mask *; };\n    outgoing { hostname "drfun1ircd.com"; port 6697; options { ssl; autoconnect; }; };\n    password "drfun1-anope-services-auth-2026";\n    class servers;\n    type leaf;\n};\nulines {\n    "services.drfun1.com";\n    "services.drfun1media.com";\n};`
  },
  {
    id: 'leaf_dp01_ashburn',
    name: 'dp01.ashburn.datapacket.drfun1.com',
    networkName: 'DrFun1 Media Global Mesh',
    hubHost: 'irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net & drfun1ircd.com',
    isLeafedToDrFun1: true,
    leafVerifiedAt: '2026-02-15T09:12:00Z',
    unrealVersion: 'UnrealIRCd-6.1.4',
    anopeVersion: 'Anope-2.1.0',
    sslPort: 6697,
    plainPort: 6667,
    ipOrHostname: 'dp01.ashburn.datapacket.drfun1.com',
    country: 'United States',
    region: 'North America',
    locationCity: 'Ashburn, VA',
    datacenter: 'Equinix DC21 / DataPacket 100G SuperCore',
    onlineUsers: 4820,
    onlineChannels: 210,
    onlineOpers: 6,
    latencyToHubMs: 14.2,
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (TLS 1.3)',
    description: 'DataPacket.com 100 Gbps dedicated unmetered no-ads leaf node (1 of 12 per hub, 24 total) linked & leafed to ALL 4 hubs (irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net & drfun1ircd.com) with strict zero commercial advertising policy. Legal: CGW Law Offices | Payment: Owens Company (Bill in Receiving).',
    adminContact: 'datapacket-noc@drfun1.com',
    websiteUrl: 'https://www.datapacket.com',
    tags: ['DataPacket.com', '100 Gbps', 'No Ads', 'Zero Advertising', 'Verified Leaf', 'DDoS Immune', '12 Per Hub', 'All 4 Hubs'],
    sampleChannels: ['#drfun1tv', '#space', '#all-855000-channels'],
    linkBlockSnippet: `link irc.drfun1.com {\n    incoming { mask *; };\n    outgoing { bind-ip *; hostname "irc.drfun1.com"; port 6697; options { ssl; autoconnect; }; };\n    password "drfun1-mesh-leaf-auth-2026";\n    class servers;\n    type leaf;\n};\nlink irc.drfun1media.com {\n    incoming { mask *; };\n    outgoing { bind-ip *; hostname "irc.drfun1media.com"; port 6697; options { ssl; autoconnect; }; };\n    password "drfun1-mesh-leaf-auth-2026";\n    class servers;\n    type leaf;\n};\nlink irc.drfun1media.net {\n    incoming { mask *; };\n    outgoing { bind-ip *; hostname "irc.drfun1media.net"; port 6697; options { ssl; autoconnect; }; };\n    password "drfun1-mesh-leaf-auth-2026";\n    class servers;\n    type leaf;\n};\nlink drfun1ircd.com {\n    incoming { mask *; };\n    outgoing { bind-ip *; hostname "drfun1ircd.com"; port 6697; options { ssl; autoconnect; }; };\n    password "drfun1-mesh-leaf-auth-2026";\n    class servers;\n    type leaf;\n};`
  },
  {
    id: 'leaf_rn01_ashburn',
    name: 'rn01.ashburn.risingnet.drfun1.com',
    networkName: 'DrFun1 Media Global Mesh',
    hubHost: 'irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net & drfun1ircd.com',
    isLeafedToDrFun1: true,
    leafVerifiedAt: '2026-02-15T09:15:00Z',
    unrealVersion: 'UnrealIRCd-6.1.4',
    anopeVersion: 'Anope-2.1.0',
    sslPort: 6697,
    plainPort: 6667,
    ipOrHostname: 'rn01.ashburn.risingnet.drfun1.com',
    country: 'United States',
    region: 'North America',
    locationCity: 'Ashburn, VA',
    datacenter: 'Equinix DC10 / RisingNet Tier-1 BGP POP',
    onlineUsers: 3820,
    onlineChannels: 165,
    onlineOpers: 5,
    latencyToHubMs: 12.1,
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (TLS 1.3)',
    description: 'RisingNet 100G Optical DWDM backbone dedicated server (1 of 10) linked, leafed, and synchronized to ALL 4 hubs (irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net & drfun1ircd.com).',
    adminContact: 'risingnet-noc@drfun1.com',
    websiteUrl: 'https://www.risingnet.com',
    tags: ['RisingNet.com', '100G DWDM', 'Dedicated Server', 'BGP Tier-1', '10 Dedicated Servers', 'All 4 Hubs'],
    sampleChannels: ['#risingnet-transit', '#all-bands', '#drfun1-media'],
    linkBlockSnippet: `link irc.drfun1.com {\n    incoming { mask *; };\n    outgoing { bind-ip *; hostname "irc.drfun1.com"; port 6697; options { ssl; autoconnect; }; };\n    password "drfun1-mesh-leaf-auth-2026";\n    class servers;\n    type leaf;\n};\nlink irc.drfun1media.com {\n    incoming { mask *; };\n    outgoing { bind-ip *; hostname "irc.drfun1media.com"; port 6697; options { ssl; autoconnect; }; };\n    password "drfun1-mesh-leaf-auth-2026";\n    class servers;\n    type leaf;\n};\nlink irc.drfun1media.net {\n    incoming { mask *; };\n    outgoing { bind-ip *; hostname "irc.drfun1media.net"; port 6697; options { ssl; autoconnect; }; };\n    password "drfun1-mesh-leaf-auth-2026";\n    class servers;\n    type leaf;\n};\nlink drfun1ircd.com {\n    incoming { mask *; };\n    outgoing { bind-ip *; hostname "drfun1ircd.com"; port 6697; options { ssl; autoconnect; }; };\n    password "drfun1-mesh-leaf-auth-2026";\n    class servers;\n    type leaf;\n};`
  }
];

export function generateUnrealLeafConfigSnippet(serverHostname: string, networkName: string): string {
  return `/* ====================================================================
 * UnrealIRCd 6.1.x Multi-Hub Link Block Configuration (4 Core Hubs)
 * Add this block to your unrealircd.conf on: ${serverHostname || 'your-server.domain.com'}
 * 
 * Target Hubs:
 *   1. irc.drfun1.com:6697 SSL (Master Core Hub - Switch SUPERNAP Las Vegas, SID 001)
 *   2. irc.drfun1media.com:6697 SSL (Broadcast Media Hub - Switch Teleport, SID 002)
 *   3. irc.drfun1media.net:6697 SSL (MediaNet Relay Hub - Switch Citadel Reno, SID 003)
 *   4. drfun1ircd.com:6697 SSL (Core Federation Hub - Switch The Keep Atlanta, SID 004)
 * IRC Services: Anope 2.1 (services.drfun1.com / services.drfun1media.com)
 * Network: DrFun1 Media & Witt Law Firm Mesh (www.wittlawfirm.com)
 * Master Licensee: Richard Alan Witt (www.wittlawfirm.com / FCC FRN: 0034981290)
 * Payment Office: Owens Company (www.owenscompany.com) - Bill in Receiving
 * Switch Infrastructure Representation: CGW Law Offices (Curtis, Gregory & Wilson)
 * Topology: 1,034 Leaf Nodes (500 Switch/hub via CGW Law Offices, 12 DataPacket/hub, 10 RisingNet dedicated servers)
 * ==================================================================== */

/* Hub 1 Link Block (SID 001) */
link irc.drfun1.com {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

/* Hub 2 Link Block (SID 002) */
link irc.drfun1media.com {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "irc.drfun1media.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

/* Hub 3 Link Block (SID 003) */
link irc.drfun1media.net {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "irc.drfun1media.net";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

/* Hub 4 Link Block (SID 004) */
link drfun1ircd.com {
    incoming { mask *; };
    outgoing {
        bind-ip *;
        hostname "drfun1ircd.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "${UNREAL_HUB_TARGET.leafAuthSecret}";
    class servers;
    type leaf;
};

/* Anope 2.1 Services U-Lines */
ulines {
    "services.drfun1.com";
    "services.drfun1media.com";
};

/* Required class block for servers */
class servers {
    pingfreq 60;
    maxclients 100;
    sendq 20000000;
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
