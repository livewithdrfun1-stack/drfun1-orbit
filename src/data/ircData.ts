import { SwitchDedicatedNode, UnrealIrcdHub, IrcChannel, IrcUser, IrcMessage } from '../types/irc';

export const UNREAL_HUB_DETAILS: UnrealIrcdHub = {
  host: 'irc.drfun1.com',
  sid: '001',
  port: 6697,
  ssl: true,
  networkName: 'DrFun1-Orbit-Mesh',
  transitProvider: 'RisingNet Global Transit (www.risingnet.com)',
  colocation: 'Switch SUPERNAP Core Campus (www.switch.com)',
  licensee: 'Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)',
  leafNodes: [
    'node1.lasvegas.switch.drfun1.com',
    'node2.tahoereno.switch.drfun1.com',
    'node3.grandrapids.switch.drfun1.com',
    'node4.atlanta.switch.drfun1.com',
    'node5.space-teleport.switch.drfun1.com',
    'node6.austin.switch.drfun1.com',
    'node7.chicago.switch.drfun1.com',
    'node8.seattle.switch.drfun1.com',
    'node9.newyork.switch.drfun1.com',
    'node10.london.switch.drfun1.com',
    'node11.tokyo.switch.drfun1.com',
    'node12.hawaii.switch.drfun1.com',
  ],
  totalSyncedChannels: 14,
  totalSyncedUsers: 4215,
  aggregateBandwidth: '1.46 Tbps Terrestrial, Subsea & Optical Space Interconnect',
};

export const SWITCH_DEDICATED_NODES: SwitchDedicatedNode[] = [
  {
    id: 'switch_node_1',
    name: 'Switch SUPERNAP Las Vegas Core (Node 01)',
    subdomain: 'node1.lasvegas.switch.drfun1.com',
    host: 'node1.lasvegas.switch.drfun1.com',
    port: 6697,
    location: 'Las Vegas, NV, USA',
    campusName: 'Switch SUPERNAP 7, 8, 9 Core Teleport Campus',
    tier: 'Tier 5 Platinum Datacenter & Earth Station',
    fiberCapacity: '100 Gbps Low-Latency Optical Cross-Connect',
    status: 'active',
    latencyMs: 3.2,
    usersOnline: 482,
    leafPeers: 16,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:7B:A2:89:D4:F1:C0:3E:91:AA:20:84:72:49:15:CC:EE:90:21',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '002',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 482,
      syncLatencyMs: 3.2,
      lastBurst: '1.2s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 01 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node1_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_2',
    name: 'Switch Tahoe Reno Citadel (Node 02)',
    subdomain: 'node2.tahoereno.switch.drfun1.com',
    host: 'node2.tahoereno.switch.drfun1.com',
    port: 6697,
    location: 'Reno / Tahoe, NV, USA',
    campusName: 'Switch Citadel Campus (100% Renewable Solar/Wind)',
    tier: 'Tier 5 Platinum Earth Station Gateway',
    fiberCapacity: '100 Gbps Redundant Terrestrial Ring',
    status: 'active',
    latencyMs: 4.8,
    usersOnline: 318,
    leafPeers: 16,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:4C:19:82:10:9A:FF:33:01:BC:DE:71:A8:12:90:EE:11:43:88',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '003',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 318,
      syncLatencyMs: 4.8,
      lastBurst: '1.8s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 02 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node2_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_3',
    name: 'Switch Pyramid Grand Rapids (Node 03)',
    subdomain: 'node3.grandrapids.switch.drfun1.com',
    host: 'node3.grandrapids.switch.drfun1.com',
    port: 6697,
    location: 'Grand Rapids, MI, USA',
    campusName: 'Switch Pyramid East-Central Edge Teleport',
    tier: 'Tier 5 Platinum Datacenter & NOC',
    fiberCapacity: '40 Gbps Direct Fiber Link',
    status: 'active',
    latencyMs: 14.1,
    usersOnline: 245,
    leafPeers: 12,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:22:90:FA:BC:11:00:88:EE:DD:55:99:32:14:87:66:BB:AA:31',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '004',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 245,
      syncLatencyMs: 14.1,
      lastBurst: '2.5s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 03 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node3_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_4',
    name: 'Switch The Keep Atlanta (Node 04)',
    subdomain: 'node4.atlanta.switch.drfun1.com',
    host: 'node4.atlanta.switch.drfun1.com',
    port: 6697,
    location: 'Atlanta, GA, USA',
    campusName: 'Switch The Keep Southeast Teleport',
    tier: 'Tier 5 Platinum Subsea & Transatlantic Gateway',
    fiberCapacity: '100 Gbps Subsea Fiber Peering',
    status: 'active',
    latencyMs: 18.4,
    usersOnline: 198,
    leafPeers: 14,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:91:EE:44:88:22:AA:77:FF:33:10:55:82:94:11:02:CA:99:77',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '005',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 198,
      syncLatencyMs: 18.4,
      lastBurst: '2.9s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 04 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node4_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_5',
    name: 'Switch Space Teleport Gateway (Node 05)',
    subdomain: 'node5.space-teleport.switch.drfun1.com',
    host: 'node5.space-teleport.switch.drfun1.com',
    port: 6697,
    location: 'Orbital Feed / Las Vegas Teleport Radome Array',
    campusName: 'Switch Dedicated Space-to-Ground Optical Gateway',
    tier: 'Tier 5 Platinum RF & Optical Ingestion Hub',
    fiberCapacity: '400 Gbps Optical Space Interconnect',
    status: 'active',
    latencyMs: 1.9,
    usersOnline: 614,
    leafPeers: 20,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:55:01:99:AA:33:FF:11:88:44:77:22:EE:99:BB:66:33:11:00',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '006',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 614,
      syncLatencyMs: 1.9,
      lastBurst: '0.9s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 05 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node5_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_6',
    name: 'Switch Texas Core Teleport (Node 06)',
    subdomain: 'node6.austin.switch.drfun1.com',
    host: 'node6.austin.switch.drfun1.com',
    port: 6697,
    location: 'Austin, TX, USA',
    campusName: 'Switch Texas South-Central Earth Station Teleport',
    tier: 'Tier 5 Platinum Datacenter & NOC',
    fiberCapacity: '100 Gbps Redundant Terrestrial Ring',
    status: 'active',
    latencyMs: 11.6,
    usersOnline: 362,
    leafPeers: 16,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:88:31:BC:02:44:99:AA:51:77:23:44:19:88:EE:10:92:AA:77',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '007',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 362,
      syncLatencyMs: 11.6,
      lastBurst: '1.4s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 06 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node6_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_7',
    name: 'Switch Great Lakes Gateway (Node 07)',
    subdomain: 'node7.chicago.switch.drfun1.com',
    host: 'node7.chicago.switch.drfun1.com',
    port: 6697,
    location: 'Chicago, IL, USA',
    campusName: 'Switch Midwest High-Frequency Gateway',
    tier: 'Tier 5 Platinum Ultra-Low-Latency Exchange',
    fiberCapacity: '100 Gbps Low-Latency Optical Cross-Connect',
    status: 'active',
    latencyMs: 15.2,
    usersOnline: 410,
    leafPeers: 18,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:33:99:FF:77:11:88:44:22:90:AA:BB:CC:DD:EE:FF:01:23:45',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '008',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 410,
      syncLatencyMs: 15.2,
      lastBurst: '1.6s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 07 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node7_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_8',
    name: 'Switch Pacific Northwest Teleport (Node 08)',
    subdomain: 'node8.seattle.switch.drfun1.com',
    host: 'node8.seattle.switch.drfun1.com',
    port: 6697,
    location: 'Seattle, WA, USA',
    campusName: 'Switch PNW Transpacific Cable Landing & Earth Station',
    tier: 'Tier 5 Platinum Transpacific Gateway',
    fiberCapacity: '100 Gbps Subsea Fiber Peering',
    status: 'active',
    latencyMs: 8.7,
    usersOnline: 295,
    leafPeers: 15,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:71:02:88:99:11:FF:44:33:AA:88:CC:11:22:33:44:55:66:77',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '009',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 295,
      syncLatencyMs: 8.7,
      lastBurst: '2.1s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 08 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node8_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_9',
    name: 'Switch East Coast Optical Teleport (Node 09)',
    subdomain: 'node9.newyork.switch.drfun1.com',
    host: 'node9.newyork.switch.drfun1.com',
    port: 6697,
    location: 'New York, NY, USA',
    campusName: 'Switch Atlantic Transoceanic Teleport Gateway',
    tier: 'Tier 5 Platinum Datacenter & Earth Station',
    fiberCapacity: '100 Gbps Transatlantic Subsea Peering',
    status: 'active',
    latencyMs: 21.3,
    usersOnline: 388,
    leafPeers: 18,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:19:44:BB:33:77:88:99:AA:00:11:22:33:44:55:66:77:88:99',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '010',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 388,
      syncLatencyMs: 21.3,
      lastBurst: '1.9s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 09 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node9_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_10',
    name: 'Switch European Optical Teleport (Node 10)',
    subdomain: 'node10.london.switch.drfun1.com',
    host: 'node10.london.switch.drfun1.com',
    port: 6697,
    location: 'London, UK / Docklands',
    campusName: 'Switch / RisingNet European Optical Teleport & Ingestion',
    tier: 'Tier 5 Platinum International Peering Point',
    fiberCapacity: '100 Gbps Transatlantic Dedicated DWDM',
    status: 'active',
    latencyMs: 64.5,
    usersOnline: 320,
    leafPeers: 14,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:AB:CD:EF:01:23:45:67:89:10:11:12:13:14:15:16:17:18:19',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '011',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 320,
      syncLatencyMs: 64.5,
      lastBurst: '3.1s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 10 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node10_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_11',
    name: 'Switch Asia-Pacific Optical Teleport (Node 11)',
    subdomain: 'node11.tokyo.switch.drfun1.com',
    host: 'node11.tokyo.switch.drfun1.com',
    port: 6697,
    location: 'Tokyo, Japan',
    campusName: 'Switch / RisingNet APAC Teleport & Ground Array',
    tier: 'Tier 5 Platinum Transpacific Fiber Ingestion',
    fiberCapacity: '100 Gbps Transpacific Low-Latency Fiber',
    status: 'active',
    latencyMs: 82.1,
    usersOnline: 435,
    leafPeers: 16,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:FE:DC:BA:98:76:54:32:10:01:02:03:04:05:06:07:08:09:10',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '012',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 435,
      syncLatencyMs: 82.1,
      lastBurst: '3.8s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 11 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node11_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_12',
    name: 'Switch Pacific Orbital Teleport (Node 12)',
    subdomain: 'node12.hawaii.switch.drfun1.com',
    host: 'node12.hawaii.switch.drfun1.com',
    port: 6697,
    location: 'Honolulu, HI, USA',
    campusName: 'Switch Mid-Pacific Space Teleport & Subsea Landing',
    tier: 'Tier 5 Platinum Deep Space & Satellite Gateway',
    fiberCapacity: '100 Gbps Transpacific Optical Cross-Connect',
    status: 'active',
    latencyMs: 36.4,
    usersOnline: 346,
    leafPeers: 15,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '013',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 346,
      syncLatencyMs: 36.4,
      lastBurst: '2.4s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 12 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node12_Auth_2026";
    class servers;
    type leaf;
};`,
  },
];


export const ALL_DRFUN1_MEDIA_CHANNELS: IrcChannel[] = [
  {
    name: '#drfun1-media',
    topic: 'DrFun1 Media Inc. Master Broadcast Network | All Bands Live Aggregate | Hosted by risingnet.com',
    category: 'media_channels',
    frequencyBand: 'All Bands',
    userCount: 612,
    modes: '+sntk 100G',
    isStreamActive: true,
    mediaType: '4K Ultra HD Broadcast & Chat Aggregate',
    mediaBitrate: '25 Mbps (Direct Optical)',
    unrealLeafSync: true,
  },
  {
    name: '#all-bands',
    topic: 'Consolidated RF Spectrum Channel: L, S, C, X, Ku, Ka, V/Q, Optical 1550nm & 5G NTN',
    category: 'frequency_bands',
    frequencyBand: 'All Bands',
    userCount: 428,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Multi-Band Telemetry & Spectrum IQ',
    mediaBitrate: '100 Mbps IQ stream',
    unrealLeafSync: true,
  },
  {
    name: '#ka-band',
    topic: '26.5 - 40.0 GHz | High-Throughput Spot-Beams, O3b mPOWER, Starlink & Viasat-3 Ka Transponders',
    category: 'frequency_bands',
    frequencyBand: 'Ka-Band',
    userCount: 310,
    modes: '+mnt',
    isStreamActive: true,
    mediaType: '4K Ground Station Video Downlink',
    mediaBitrate: '12 Mbps HEVC',
    unrealLeafSync: true,
  },
  {
    name: '#ku-band',
    topic: '12.0 - 18.0 GHz | Direct-to-Home Broadcast, Commercial Maritime & Aeronautical IFC',
    category: 'frequency_bands',
    frequencyBand: 'Ku-Band',
    userCount: 285,
    modes: '+nt',
    isStreamActive: true,
    mediaType: '1080p60 Live Carrier Feed',
    mediaBitrate: '8 Mbps H.264',
    unrealLeafSync: true,
  },
  {
    name: '#c-band',
    topic: '3.7 - 4.2 / 5.9 - 6.4 GHz | Transoceanic Weather-Resilient Video & Global Beam Teleports',
    category: 'frequency_bands',
    frequencyBand: 'C-Band',
    userCount: 194,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Broadcast Clean Feed & Carrier Audio',
    mediaBitrate: '15 Mbps DVB-S2X',
    unrealLeafSync: true,
  },
  {
    name: '#x-band',
    topic: '7.25 - 8.4 GHz | Deep Space Network (DSN), Earth Observation & High-Reliability SAR Telemetry',
    category: 'frequency_bands',
    frequencyBand: 'X-Band',
    userCount: 167,
    modes: '+snt',
    isStreamActive: true,
    mediaType: 'Synthetic Aperture Radar Telemetry',
    mediaBitrate: '50 Mbps Raw Downlink',
    unrealLeafSync: true,
  },
  {
    name: '#s-band',
    topic: '2.0 - 4.0 GHz | Mobile Satellite Service (MSS), Direct-to-Handset Voice & Telemetry TT&C',
    category: 'frequency_bands',
    frequencyBand: 'S-Band',
    userCount: 220,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Hi-Fi Digital Satellite Radio 24/7',
    mediaBitrate: '320 kbps Opus / AAC-LD',
    unrealLeafSync: true,
  },
  {
    name: '#l-band',
    topic: '1.0 - 2.0 GHz | Inmarsat ELERA, Iridium Certus, GMDSS Maritime Safety & ADS-B Aviation Tracking',
    category: 'frequency_bands',
    frequencyBand: 'L-Band',
    userCount: 304,
    modes: '+mnt',
    isStreamActive: true,
    mediaType: 'Global Aviation & Maritime Safety Stream',
    mediaBitrate: '128 kbps Dedicated Audio/Data',
    unrealLeafSync: true,
  },
  {
    name: '#v-band',
    topic: '40.0 - 75.0 GHz | V/Q-Band Feeder Links for Next-Gen Terabit Constellations',
    category: 'frequency_bands',
    frequencyBand: 'V/Q-Band',
    userCount: 142,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Terabit Feeder Gateway Beacon',
    mediaBitrate: '1 Gbps Test Pattern',
    unrealLeafSync: true,
  },
  {
    name: '#optical-laser',
    topic: '1550 nm Free-Space Optical Inter-Satellite Links (OISL) | 100G Coherent Optical Mesh',
    category: 'frequency_bands',
    frequencyBand: 'Optical Laser (1550nm)',
    userCount: 189,
    modes: '+snt',
    isStreamActive: true,
    mediaType: '100 Gbps Optical Constellation Mesh Telemetry',
    mediaBitrate: '100 Gbps DWDM',
    unrealLeafSync: true,
  },
  {
    name: '#5g-ntn',
    topic: '3GPP Release 17/18 Non-Terrestrial Networks | Direct-to-Cellular & Wireless Carrier Services',
    category: 'frequency_bands',
    frequencyBand: '3GPP 5G NTN',
    userCount: 350,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'eSIM Wireless Provisioning Stream',
    mediaBitrate: '5G Core GTP Tunnel',
    unrealLeafSync: true,
  },
  {
    name: '#switch-teleport-noc',
    topic: 'Switch SUPERNAP Teleport Operations (www.switch.com) | Las Vegas & Tahoe Reno Teleports',
    category: 'teleport_infrastructure',
    frequencyBand: 'All Bands',
    userCount: 278,
    modes: '+mnt',
    isStreamActive: true,
    mediaType: 'Live 100G Switch Teleport NOC Monitor',
    mediaBitrate: 'Direct Switch Video Matrix',
    unrealLeafSync: true,
  },
  {
    name: '#risingnet-transit',
    topic: 'RisingNet IP Transit Backbone (www.risingnet.com) | Global Tier-1 Optical Transport & Hosting',
    category: 'teleport_infrastructure',
    frequencyBand: 'All Bands',
    userCount: 195,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'BGP Routing & Optical Ring Health Stream',
    mediaBitrate: 'Real-Time SNMP/Telemetry',
    unrealLeafSync: true,
  },
  {
    name: '#wittlaw-spectrum',
    topic: 'The Law Office of Richard A. Witt LLC (www.wittlawfirm.com) & Owens Company (www.owenscompany.com) Legal & Spectrum Advisory',
    category: 'legal_spectrum',
    frequencyBand: 'All Bands',
    userCount: 215,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'FCC / ITU Spectrum Filing Briefs & Legal Q&A',
    mediaBitrate: 'Encrypted Legal Briefings',
    unrealLeafSync: true,
  },
];

export const INITIAL_IRC_USERS: IrcUser[] = [
  {
    nick: 'RichardAlanWitt',
    prefix: '@',
    role: 'Licensed Administrator & Principal',
    hostmask: 'richard@wittlawfirm.com/licensee',
    organization: 'The Law Office of Richard A. Witt LLC',
    channels: ['#drfun1-media', '#all-bands', '#wittlaw-spectrum', '#switch-teleport-noc'],
  },
  {
    nick: 'Switch_NOC_Bot',
    prefix: '@',
    role: 'Switch Automated Operations Daemon',
    hostmask: 'daemon@node1.lasvegas.switch.drfun1.com',
    isBot: true,
    organization: 'Switch SUPERNAP (www.switch.com)',
    channels: ['#drfun1-media', '#switch-teleport-noc', '#all-bands', '#ka-band', '#5g-ntn'],
  },
  {
    nick: 'RisingNet_Transit_Bot',
    prefix: '@',
    role: 'RisingNet BGP & Transit Guard',
    hostmask: 'bot@backbone.risingnet.com',
    isBot: true,
    organization: 'RisingNet (www.risingnet.com)',
    channels: ['#drfun1-media', '#risingnet-transit', '#all-bands'],
  },
  {
    nick: 'SatcomGuru',
    prefix: '+',
    role: 'Senior RF Payload Engineer',
    hostmask: 'guru@satcom.space/ops',
    organization: 'Space RF Labs',
    channels: ['#drfun1-media', '#ka-band', '#ku-band', '#optical-laser'],
  },
  {
    nick: 'OrbitFlightDirector',
    prefix: '+',
    role: 'LEO Mission Flight Director',
    hostmask: 'flight@orbit.space/ops',
    organization: 'LEO Constellation Ops',
    channels: ['#drfun1-media', '#all-bands', '#optical-laser'],
  },
  {
    nick: 'TeleportDutyEng',
    prefix: '',
    role: 'Ground Station Engineer',
    hostmask: 'duty@switch.teleport.earth',
    organization: 'Switch Earth Station',
    channels: ['#switch-teleport-noc', '#c-band', '#x-band'],
  },
  {
    nick: 'WirelessCarrierOps',
    prefix: '',
    role: '3GPP NTN Carrier Engineer',
    hostmask: 'ops@5g-carrier.drfun1.com',
    organization: 'DrFun1 Wireless Carrier',
    channels: ['#5g-ntn', '#s-band', '#drfun1-media'],
  },
];

export const INITIAL_IRC_MESSAGES: Record<string, IrcMessage[]> = {
  '#drfun1-media': [
    {
      id: 'm_1',
      timestamp: '12:00:02',
      sender: '***',
      channel: '#drfun1-media',
      content: 'Connecting to node1.lasvegas.switch.drfun1.com (Switch SUPERNAP Las Vegas) via RisingNet Transit (www.risingnet.com)...',
      type: 'system',
    },
    {
      id: 'm_2',
      timestamp: '12:00:03',
      sender: '***',
      channel: '#drfun1-media',
      content: 'TLS Handshake verified: TLSv1.3 with AES-256-GCM. UnrealIRCd 6.1.4: All 12 dedicated Switch nodes are actively leafed to Root Hub irc.drfun1.com:6697 (SID 001).',
      type: 'system',
    },
    {
      id: 'm_3',
      timestamp: '12:00:05',
      sender: 'RichardAlanWitt',
      channel: '#drfun1-media',
      content: 'Welcome to DrFun1 Media Inc. All-Bands Live Broadcast Hub! Licensed under The Law Office of Richard A. Witt LLC (www.wittlawfirm.com) and Owens Company (www.owenscompany.com). All 12 Switch teleport nodes are leafed to irc.drfun1.com.',
      type: 'message',
    },
    {
      id: 'm_4',
      timestamp: '12:00:15',
      sender: 'Switch_NOC_Bot',
      channel: '#drfun1-media',
      content: '[UNREALIRCD 12-NODE LEAF SYNC] All 12 dedicated Switch nodes (Las Vegas, Tahoe Reno, Grand Rapids, Atlanta, Space Gateway, Austin, Chicago, Seattle, New York, London, Tokyo, Hawaii) are linked and leaf-synced to irc.drfun1.com [SID 001]. Total optical bandwidth: 1.46 Tbps aggregate.',
      type: 'notice',
    },
    {
      id: 'm_5',
      timestamp: '12:00:28',
      sender: 'RisingNet_Transit_Bot',
      channel: '#drfun1-media',
      content: '[RISINGNET BGP] Terrestrial DWDM optical ring operational with 0.00% packet loss to Switch SUPERNAP campus.',
      type: 'notice',
    },
    {
      id: 'm_6',
      timestamp: '12:01:10',
      sender: 'SatcomGuru',
      channel: '#drfun1-media',
      content: 'Confirmed reception of the DrFun1 Ka-band 4K clean feed and S-band audio broadcast. Spectrum modulation looks pristine.',
      type: 'message',
    },
  ],
  '#all-bands': [
    {
      id: 'ab_1',
      timestamp: '12:01:00',
      sender: '***',
      channel: '#all-bands',
      content: 'Channel topic: Consolidated RF Spectrum Channel: L, S, C, X, Ku, Ka, V/Q, Optical 1550nm & 5G NTN',
      type: 'system',
    },
    {
      id: 'ab_2',
      timestamp: '12:01:25',
      sender: 'Switch_NOC_Bot',
      channel: '#all-bands',
      content: 'Spectrum monitor scan complete across 1 GHz - 75 GHz plus 1550nm infrared laser. All 5 Switch teleports reporting optimal CNR.',
      type: 'notice',
    },
  ],
  '#ka-band': [
    {
      id: 'ka_1',
      timestamp: '12:00:30',
      sender: '***',
      channel: '#ka-band',
      content: 'Channel topic: 26.5 - 40.0 GHz | High-Throughput Spot-Beams, O3b mPOWER, Starlink & Viasat-3 Ka Transponders',
      type: 'system',
    },
    {
      id: 'ka_2',
      timestamp: '12:02:10',
      sender: 'SatcomGuru',
      channel: '#ka-band',
      content: 'Active transponder carrier at 29.5 GHz uplink / 19.7 GHz downlink. DVB-S2X 32APSK modulation locked.',
      type: 'message',
    },
  ],
  '#5g-ntn': [
    {
      id: 'ntn_1',
      timestamp: '12:00:45',
      sender: '***',
      channel: '#5g-ntn',
      content: 'Channel topic: 3GPP Release 17/18 Non-Terrestrial Networks | Direct-to-Cellular & Wireless Carrier Services',
      type: 'system',
    },
    {
      id: 'ntn_2',
      timestamp: '12:03:00',
      sender: 'WirelessCarrierOps',
      channel: '#5g-ntn',
      content: 'DrFun1 Wireless Carrier eSIM provisioning engine is online. Direct L-band and S-band cellular packets routing through Switch core.',
      type: 'message',
    },
  ],
  '#switch-teleport-noc': [
    {
      id: 'noc_1',
      timestamp: '12:00:00',
      sender: 'Switch_NOC_Bot',
      channel: '#switch-teleport-noc',
      content: 'Switch SUPERNAP Las Vegas Earth Station 13-meter tracking antennas active. Redundant power 100% on renewable grid.',
      type: 'notice',
    },
  ],
  '#risingnet-transit': [
    {
      id: 'rn_1',
      timestamp: '12:00:10',
      sender: 'RisingNet_Transit_Bot',
      channel: '#risingnet-transit',
      content: 'RisingNet tier-1 optical backbone hosting webirc.risingnet.com with 100Gbps direct cross-connect to Switch nodes.',
      type: 'notice',
    },
  ],
  '#wittlaw-spectrum': [
    {
      id: 'wl_1',
      timestamp: '12:00:05',
      sender: 'RichardAlanWitt',
      channel: '#wittlaw-spectrum',
      content: 'The Law Office of Richard A. Witt LLC (www.wittlawfirm.com) and Owens Company (www.owenscompany.com) provides legal counsel for space filings, orbital slot leasing, and DrFun1 ECOM licensed infrastructure.',
      type: 'message',
    },
  ],
};
