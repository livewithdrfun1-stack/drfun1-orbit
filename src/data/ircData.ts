import { SwitchDedicatedNode, UnrealIrcdHub, AnopeServicesHub, IrcChannel, IrcUser, IrcMessage, ZncBouncerConfig, StatsPortalInfo, NeoStatsConfig, NeoStatsModule, DenoraConfig, WittLawAdminMod, DevPlatformConfig, DevPlatformApiEndpoint, DevSandboxEnvironment, ModerationAuditAction } from '../types/irc';

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
    'irc.drfun1media.com (Dual Hub Peer)',
    '335 Switch SUPERNAP Leaf Nodes (*.switch.drfun1.com)',
    '12 DataPacket 100G Nodes (*.datapacket.drfun1.com)',
    '5 RisingNet Optical Nodes (*.risingnet.drfun1.com)',
  ],
  totalSyncedChannels: 855000,
  totalSyncedUsers: 14290,
  aggregateBandwidth: '3.85 Tbps Global Terrestrial, Subsea, Quantum Fiber & Space Teleport Interconnect',
  redundantPeerHub: 'irc.drfun1media.com',
  anopeServicesHost: 'services.drfun1.com',
};

export const UNREAL_MEDIA_HUB_DETAILS: UnrealIrcdHub = {
  host: 'irc.drfun1media.com',
  sid: '002',
  port: 6697,
  ssl: true,
  networkName: 'DrFun1-Media-Broadcast-Mesh',
  transitProvider: 'RisingNet Global Transit (www.risingnet.com)',
  colocation: 'Switch SUPERNAP Broadcast Teleport (www.switch.com)',
  licensee: 'Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)',
  leafNodes: [
    'irc.drfun1.com (Dual Hub Peer)',
    '335 Switch SUPERNAP Leaf Nodes (*.switch.drfun1.com)',
    '12 DataPacket 100G Nodes (*.datapacket.drfun1.com)',
    '5 RisingNet Optical Nodes (*.risingnet.drfun1.com)',
  ],
  totalSyncedChannels: 855000,
  totalSyncedUsers: 14290,
  aggregateBandwidth: '3.85 Tbps Global Terrestrial, Subsea, Quantum Fiber & Space Teleport Interconnect',
  redundantPeerHub: 'irc.drfun1.com',
  anopeServicesHost: 'services.drfun1media.com',
};

export const DUAL_UNREAL_HUBS: UnrealIrcdHub[] = [
  UNREAL_HUB_DETAILS,
  UNREAL_MEDIA_HUB_DETAILS,
];

export const ANOPE_SERVICES_DETAILS: AnopeServicesHub = {
  host: 'services.drfun1.com',
  sid: '00A',
  linkedHubs: ['irc.drfun1.com:6697', 'irc.drfun1media.com:6697'],
  anopeVersion: 'Anope-2.1.0-Release (git.anope.org)',
  nickServCount: 4210,
  chanServCount: 184,
  botServBots: ['DrFun1Bot', 'OrbitGuard', 'StatServ', 'HostServ', 'OperServ', 'MemoServ'],
  operServAkills: 14,
  status: 'active',
};

export const SWITCH_DEDICATED_NODES: SwitchDedicatedNode[] = [
  {
    id: 'dev_drfun1media_node',
    name: 'DrFun1 Media Development Gateway & Broadcast Hub (dev.drfun1media.com)',
    subdomain: 'dev.drfun1media.com',
    host: 'dev.drfun1media.com',
    port: 6697,
    location: 'Las Vegas Switch SUPERNAP Core Teleport & Cloud Gateway',
    campusName: 'Switch SUPERNAP Dev & Broadcast Array (100% Green Energy)',
    tier: 'Tier 5 Platinum Development & Live Streaming Ingest',
    fiberCapacity: '100 Gbps Low-Latency Optical Cross-Connect + WebSocket Bridge',
    status: 'active',
    latencyMs: 1.2,
    usersOnline: 8838,
    leafPeers: 27,
    unrealVersion: 'UnrealIRCd 6.1.4-dev + WebSocket Bridge + Fubo/Twitch Sync',
    sslFingerprint: 'SHA256:7D:E4:22:B8:81:CF:5A:91:4B:D2:66:99:20:EB:55:FF:01:77',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '007',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 855000,
      syncedNicks: 8838,
      syncLatencyMs: 1.2,
      lastBurst: '0.2s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* UnrealIRCd 6.1.4 Leaf Link Block for dev.drfun1media.com -> irc.drfun1.com */
link irc.drfun1.com {
    incoming {
        mask *.drfun1.com;
    };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Leaf_DevDrFun1Media_Sync_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'drfun1media_leaf_node',
    name: 'DrFun1 Media UnrealIRCd & ZNC Broadcast Node (irc.drfun1media.com)',
    subdomain: 'irc.drfun1media.com',
    host: 'irc.drfun1media.com',
    port: 6697,
    location: 'Las Vegas Switch SUPERNAP Broadcast Teleport',
    campusName: 'Switch SUPERNAP Media Facility (100% Renewable)',
    tier: 'Tier 5 Platinum Dedicated Broadcast & Media Host',
    fiberCapacity: '100 Gbps Low-Latency Optical Cross-Connect + ZNC Engine',
    status: 'active',
    latencyMs: 1.8,
    usersOnline: 1420,
    leafPeers: 26,
    unrealVersion: 'UnrealIRCd 6.1.4 (unrealircd.org) + ZNC 1.9.1 (znc.git)',
    sslFingerprint: 'SHA256:8C:F3:11:A9:72:DE:4B:90:3A:C1:55:88:19:FA:44:EE:02:60',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '026',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 855000,
      syncedNicks: 1420,
      syncLatencyMs: 1.8,
      lastBurst: '0.4s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* UnrealIRCd 6.1.4 Leaf Link Block for irc.drfun1media.com -> irc.drfun1.com */
link irc.drfun1.com {
    incoming {
        mask *.drfun1.com;
    };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Leaf_DrFun1Media_Sync_2026";
    class servers;
    type leaf;
};

/* ZNC 1.9.1 (github.com/znc/znc.git) Bouncer Listen Block on irc.drfun1media.com */
// Listening SSL Port 6697 for Bounced IRC Clients & Port 5000 for ZNC WebAdmin
// Upstream Uplink -> irc.drfun1.com:6697 with SASL ECDSA-NIST256P-CHALLENGE`,
  },
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
  {
    id: 'switch_node_13',
    name: 'Switch Silicon Valley Quantum Fiber Ingest (Node 13)',
    subdomain: 'node13.sanjose.switch.drfun1.com',
    host: 'node13.sanjose.switch.drfun1.com',
    port: 6697,
    location: 'San Jose, CA, USA',
    campusName: 'Switch / Quantum Fiber Silicon Valley Interconnect',
    tier: 'Tier 5 Platinum Quantum Fiber & Earth Station Gateway',
    fiberCapacity: '400 Gbps Coherent DWDM + 8G Symmetrical Quantum Mesh',
    status: 'active',
    latencyMs: 5.1,
    usersOnline: 388,
    leafPeers: 18,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99',
    transitProvider: 'RisingNet Optical Ring & Quantum Fiber (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '014',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 388,
      syncLatencyMs: 5.1,
      lastBurst: '1.5s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 13 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node13_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_14',
    name: 'Switch Rocky Mountain Optical Node (Node 14)',
    subdomain: 'node14.denver.switch.drfun1.com',
    host: 'node14.denver.switch.drfun1.com',
    port: 6697,
    location: 'Denver, CO, USA',
    campusName: 'Switch Front Range Teleport & Earth Station',
    tier: 'Tier 5 Platinum Terrestrial & Satcom Teleport',
    fiberCapacity: '100 Gbps Low-Latency Continental Ring',
    status: 'active',
    latencyMs: 8.4,
    usersOnline: 276,
    leafPeers: 14,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:11:22:33:44:55:66:77:88:99:00:AA:BB:CC:DD:EE:FF:11:22',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '015',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 276,
      syncLatencyMs: 8.4,
      lastBurst: '1.9s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 14 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node14_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_15',
    name: 'Switch South Atlantic Teleport (Node 15)',
    subdomain: 'node15.miami.switch.drfun1.com',
    host: 'node15.miami.switch.drfun1.com',
    port: 6697,
    location: 'Miami, FL, USA',
    campusName: 'Switch South Atlantic Gateway & Subsea Landing',
    tier: 'Tier 5 Platinum Subsea & Satellite Teleport',
    fiberCapacity: '200 Gbps Subsea Fiber Cross-Connect',
    status: 'active',
    latencyMs: 24.1,
    usersOnline: 310,
    leafPeers: 16,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '016',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 310,
      syncLatencyMs: 24.1,
      lastBurst: '2.1s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 15 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node15_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_16',
    name: 'Switch Mid-Atlantic Federal Teleport (Node 16)',
    subdomain: 'node16.ashburn.switch.drfun1.com',
    host: 'node16.ashburn.switch.drfun1.com',
    port: 6697,
    location: 'Ashburn, VA, USA',
    campusName: 'Switch Data Center Alley Federal Earth Teleport',
    tier: 'Tier 5 Platinum FedRAMP & DoD Security Array',
    fiberCapacity: '400 Gbps Quantum Encrypted Optical Core',
    status: 'active',
    latencyMs: 19.5,
    usersOnline: 492,
    leafPeers: 22,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:77',
    transitProvider: 'RisingNet Federal Optical Ring (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '017',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 492,
      syncLatencyMs: 19.5,
      lastBurst: '1.7s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 16 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node16_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_17',
    name: 'Switch Southern California Gateway (Node 17)',
    subdomain: 'node17.losangeles.switch.drfun1.com',
    host: 'node17.losangeles.switch.drfun1.com',
    port: 6697,
    location: 'Los Angeles, CA, USA',
    campusName: 'Switch Pacific Coast Broadcast Teleport',
    tier: 'Tier 5 Platinum Media & Entertainment Teleport',
    fiberCapacity: '200 Gbps Low-Latency Pacific Wave Direct',
    status: 'active',
    latencyMs: 4.2,
    usersOnline: 415,
    leafPeers: 18,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:77:88:99:00:AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '018',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 415,
      syncLatencyMs: 4.2,
      lastBurst: '1.3s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 17 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node17_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_18',
    name: 'Switch Continental Europe Core (Node 18)',
    subdomain: 'node18.frankfurt.switch.drfun1.com',
    host: 'node18.frankfurt.switch.drfun1.com',
    port: 6697,
    location: 'Frankfurt, Germany',
    campusName: 'Switch European Central Teleport & DE-CIX Interconnect',
    tier: 'Tier 5 Platinum EU GDPR Compliant Earth Node',
    fiberCapacity: '100 Gbps Transatlantic Optical Subsea Ingest',
    status: 'active',
    latencyMs: 71.3,
    usersOnline: 394,
    leafPeers: 15,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:00',
    transitProvider: 'RisingNet European Optical Ring (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '019',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 394,
      syncLatencyMs: 71.3,
      lastBurst: '2.8s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 18 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node18_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_19',
    name: 'Switch Nordic Satellite Gateway (Node 19)',
    subdomain: 'node19.stockholm.switch.drfun1.com',
    host: 'node19.stockholm.switch.drfun1.com',
    port: 6697,
    location: 'Stockholm, Sweden',
    campusName: 'Switch Nordic Polar Orbit Teleport Ground Array',
    tier: 'Tier 5 Platinum High-Latitude LEO Downlink Center',
    fiberCapacity: '100 Gbps Arctic Optical Cross-Connect',
    status: 'active',
    latencyMs: 78.6,
    usersOnline: 260,
    leafPeers: 12,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '020',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 260,
      syncLatencyMs: 78.6,
      lastBurst: '3.1s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 19 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node19_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_20',
    name: 'Switch Southeast Asia Hub (Node 20)',
    subdomain: 'node20.singapore.switch.drfun1.com',
    host: 'node20.singapore.switch.drfun1.com',
    port: 6697,
    location: 'Singapore',
    campusName: 'Switch ASEAN Subsea Cable Landing & Teleport',
    tier: 'Tier 5 Platinum Equinix SG1 / APAC Optical Center',
    fiberCapacity: '200 Gbps Transoceanic Subsea Optical Ring',
    status: 'active',
    latencyMs: 94.2,
    usersOnline: 450,
    leafPeers: 20,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE',
    transitProvider: 'RisingNet APAC Optical Ring (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '021',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 450,
      syncLatencyMs: 94.2,
      lastBurst: '3.6s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 20 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node20_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_21',
    name: 'Switch Australasia Teleport (Node 21)',
    subdomain: 'node21.sydney.switch.drfun1.com',
    host: 'node21.sydney.switch.drfun1.com',
    port: 6697,
    location: 'Sydney, Australia',
    campusName: 'Switch Oceania Teleport & Southern Cross Subsea',
    tier: 'Tier 5 Platinum Trans-Tasman & Pacific Gateway',
    fiberCapacity: '100 Gbps Subsea Transpacific Link',
    status: 'active',
    latencyMs: 112.5,
    usersOnline: 335,
    leafPeers: 14,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00',
    transitProvider: 'RisingNet Oceania Optical Ring (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '022',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 335,
      syncLatencyMs: 112.5,
      lastBurst: '4.2s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 21 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node21_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_22',
    name: 'Switch Latin America Teleport (Node 22)',
    subdomain: 'node22.saopaulo.switch.drfun1.com',
    host: 'node22.saopaulo.switch.drfun1.com',
    port: 6697,
    location: 'São Paulo, Brazil',
    campusName: 'Switch South America Core & Monet Subsea Teleport',
    tier: 'Tier 5 Platinum Pan-American Earth Gateway',
    fiberCapacity: '100 Gbps Atlantic Direct Subsea Cable',
    status: 'active',
    latencyMs: 86.4,
    usersOnline: 298,
    leafPeers: 13,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:12:34:56:78:9A:BC:DE:F0:12:34:56:78:9A:BC:DE:F0:12:34',
    transitProvider: 'RisingNet LatAm Optical Ring (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '023',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 298,
      syncLatencyMs: 86.4,
      lastBurst: '3.4s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 22 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node22_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_23',
    name: 'Switch Middle East Optical Teleport (Node 23)',
    subdomain: 'node23.dubai.switch.drfun1.com',
    host: 'node23.dubai.switch.drfun1.com',
    port: 6697,
    location: 'Dubai, UAE',
    campusName: 'Switch Middle East Satellite Hub & GCC Interconnect',
    tier: 'Tier 5 Platinum Middle East Satcom NOC',
    fiberCapacity: '100 Gbps Red Sea Optical Subsea Cable Ring',
    status: 'active',
    latencyMs: 108.2,
    usersOnline: 275,
    leafPeers: 12,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:56:78:9A:BC:DE:F0:12:34:56:78:9A:BC:DE:F0:12:34:56:78',
    transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '024',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 275,
      syncLatencyMs: 108.2,
      lastBurst: '3.9s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 23 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node23_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_24',
    name: 'Switch Deep Space Ground Teleport (Node 24)',
    subdomain: 'node24.goldstone.switch.drfun1.com',
    host: 'node24.goldstone.switch.drfun1.com',
    port: 6697,
    location: 'Goldstone / Barstow, CA, USA',
    campusName: 'Switch Mojave Deep Space & Lunar Optical Downlink Array',
    tier: 'Tier 5 Platinum Lunar/Mars Laser Comm Earth Station',
    fiberCapacity: '400 Gbps Ultra-High-Throughput Optical Laser Direct',
    status: 'active',
    latencyMs: 2.8,
    usersOnline: 520,
    leafPeers: 24,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:78:9A:BC:DE:F0:12:34:56:78:9A:BC:DE:F0:12:34:56:78:9A',
    transitProvider: 'RisingNet Optical Ring & Laser Ground Mesh (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '025',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 520,
      syncLatencyMs: 2.8,
      lastBurst: '1.1s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 24 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node24_Auth_2026";
    class servers;
    type leaf;
};`,
  },
  {
    id: 'switch_node_25',
    name: 'Switch SUPERNAP 9 Redundant Optical Core (Node 25)',
    subdomain: 'node25.lasvegas-edge.switch.drfun1.com',
    host: 'node25.lasvegas-edge.switch.drfun1.com',
    port: 6697,
    location: 'Las Vegas, NV, USA',
    campusName: 'Switch SUPERNAP 9 High-Density Optical Teleport Vault',
    tier: 'Tier 5 Platinum Mission-Critical Core Earth Facility',
    fiberCapacity: '400 Gbps Direct Redundant Cross-Connect to Hub 001',
    status: 'active',
    latencyMs: 1.4,
    usersOnline: 612,
    leafPeers: 25,
    unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2',
    sslFingerprint: 'SHA256:9A:BC:DE:F0:12:34:56:78:9A:BC:DE:F0:12:34:56:78:9A:BC',
    transitProvider: 'RisingNet Optical Core Backbone (www.risingnet.com)',
    leafHub: 'irc.drfun1.com',
    hubPort: 6697,
    sid: '026',
    leafStatus: 'synced',
    leafBurstStats: {
      syncedChannels: 14,
      syncedNicks: 612,
      syncLatencyMs: 1.4,
      lastBurst: '0.8s ago',
      linkProtocol: 'Unreal6104-TLS',
      encryption: 'TLSv1.3 TLS_AES_256_GCM_SHA384',
    },
    unrealLinkBlock: `/* Node 25 Leaf Link to Master Hub irc.drfun1.com */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Node25_Auth_2026";
    class servers;
    type leaf;
};`,
  },
];


export const ALL_DRFUN1_MEDIA_CHANNELS: IrcChannel[] = [
  {
    name: '#lobby',
    topic: 'Official DrFun1 Media Flagship Network Lobby | Fubo.tv Live Sports & Twitch.tv Stream Relay | dev.drfun1media.com:6697 (SSL)',
    category: 'media_channels',
    frequencyBand: 'All-Band Flagship / 400G DWDM',
    userCount: 8838,
    modes: '+sntk 100G',
    isStreamActive: true,
    mediaType: 'Fubo.tv Sports & Twitch.tv Stream Relay',
    mediaBitrate: 'Uncompressed SMPTE 2110 / 4K UHD',
    unrealLeafSync: true,
  },
  {
    name: '#dev-platform',
    topic: 'dev.drfun1media.com Development Platform, Sandbox CI/CD & API Gateway | UnrealIRCd 6.1 WebSocket JSON-RPC | WittLaw Admins & Mods On-Duty (www.wittlawfirm.com)',
    category: 'teleport_infrastructure',
    frequencyBand: '100G Optical WebSocket & SSH Dev Port 2202',
    userCount: 1420,
    modes: '+sntk 100G',
    isStreamActive: true,
    mediaType: 'Development Sandbox Live Console & JSON-RPC Stream',
    mediaBitrate: 'Real-Time WebRTC / WebSocket Stream',
    unrealLeafSync: true,
  },
  {
    name: '#wittlaw-admins',
    topic: 'The Law Office of Richard A. Witt LLC (www.wittlawfirm.com) Executive Legal, FCC Compliance & Network Moderation Center | NetAdmin & Oper Roster',
    category: 'legal_spectrum',
    frequencyBand: 'Encrypted Legal Teleport Ring / TLS 1.3',
    userCount: 65,
    modes: '+sntik 100G',
    isStreamActive: true,
    mediaType: 'Encrypted Administrative Audit Trail & Moderation Dispatch',
    mediaBitrate: 'AES-256 Encrypted Telemetry',
    unrealLeafSync: true,
  },
  {
    name: '#drfun1-primetv',
    topic: 'DrFun1 Media Prime TV 4K (WDF1-TV) Official Broadcast Room | FCC Part 73/25 | Ka-Band Laser Teleport',
    category: 'media_channels',
    frequencyBand: 'Ka-Band / Laser',
    userCount: 420,
    modes: '+sntk 100G',
    isStreamActive: true,
    mediaType: '4K Ultra HD Broadcast Playout & Inter-Network Chat',
    mediaBitrate: '15.5 Mbps HEVC',
    unrealLeafSync: true,
  },
  {
    name: '#drfun1-satcomnews',
    topic: 'DrFun1 Satcom 24/7 News TV (KDF1-DT) Live Telemetry & FCC Regulatory Filings',
    category: 'media_channels',
    frequencyBand: 'Ku-Band',
    userCount: 290,
    modes: '+cnt',
    isStreamActive: true,
    mediaType: '1080p60 News Feed',
    mediaBitrate: '8.5 Mbps H.264',
    unrealLeafSync: true,
  },
  {
    name: '#drfun1-wirelesstv',
    topic: 'DrFun1 Wireless 5G Network TV (WDF1-WL) Unlocked Handsets & Direct-to-Cell LEO Satellite 5G',
    category: 'media_channels',
    frequencyBand: '5G NTN Band n255',
    userCount: 345,
    modes: '+cnt',
    isStreamActive: true,
    mediaType: 'Wireless Carrier NOC & Playout',
    mediaBitrate: '9.0 Mbps H.264',
    unrealLeafSync: true,
  },
  {
    name: '#drfun1-4kspace',
    topic: 'DrFun1 Space Horizon 4K Ultra HD (KDF1-4K) Deep Space Teleport Optics & Laser Downlink',
    category: 'media_channels',
    frequencyBand: 'Optical 1550nm',
    userCount: 215,
    modes: '+cnt',
    isStreamActive: true,
    mediaType: '4K Deep Space Visualizer',
    mediaBitrate: '20.0 Mbps HEVC',
    unrealLeafSync: true,
  },
  {
    name: '#paramount-cbs',
    topic: 'Paramount Global CBS Network (WCB-TV) Master Broadcast Playout & Coordination',
    category: 'media_channels',
    frequencyBand: 'C-Band',
    userCount: 460,
    modes: '+cnt',
    isStreamActive: true,
    mediaType: '1080p60 Linear Network',
    mediaBitrate: '12.0 Mbps MPEG-2/H.264',
    unrealLeafSync: true,
  },
  {
    name: '#disney-abc',
    topic: 'The Walt Disney Company ABC Network (WABC-TV) National Inter-Network Broadcast',
    category: 'media_channels',
    frequencyBand: 'C-Band',
    userCount: 480,
    modes: '+cnt',
    isStreamActive: true,
    mediaType: '720p60 National Feed',
    mediaBitrate: '11.5 Mbps H.264',
    unrealLeafSync: true,
  },
  {
    name: '#disney-espn',
    topic: 'ESPN Sports Network (WESP-DT) Live Stadium Interconnect & Multi-Camera Ingest',
    category: 'media_channels',
    frequencyBand: 'Ku-Band',
    userCount: 620,
    modes: '+cnt',
    isStreamActive: true,
    mediaType: '1080p60 Sports Playout',
    mediaBitrate: '14.0 Mbps H.264',
    unrealLeafSync: true,
  },
  {
    name: '#wbd-cnn',
    topic: 'Warner Bros. Discovery CNN International (WCNN-DT) Global Breaking News Uplink',
    category: 'media_channels',
    frequencyBand: 'Ku-Band',
    userCount: 410,
    modes: '+cnt',
    isStreamActive: true,
    mediaType: '1080p60 News Wire',
    mediaBitrate: '9.0 Mbps H.264',
    unrealLeafSync: true,
  },
  {
    name: '#wbd-hbo',
    topic: 'HBO Premium Master Feed (WHBO-DT) 4K HDR Cinema Transmission',
    category: 'media_channels',
    frequencyBand: 'C-Band',
    userCount: 310,
    modes: '+cnt',
    isStreamActive: true,
    mediaType: '4K UHD HDR Cinema',
    mediaBitrate: '16.0 Mbps HEVC',
    unrealLeafSync: true,
  },
  {
    name: '#comcast-nbc',
    topic: 'Comcast / Xfinity NBC Network (WNBC-TV) Master Control & Broadcast Operations',
    category: 'media_channels',
    frequencyBand: 'C-Band',
    userCount: 450,
    modes: '+cnt',
    isStreamActive: true,
    mediaType: '1080p60 Broadcast Matrix',
    mediaBitrate: '12.0 Mbps H.264',
    unrealLeafSync: true,
  },
  {
    name: '#dish-scape',
    topic: 'Dish Network Dish Scape 4K (KDSH-4K) Direct-to-Home Ultra HD Satellite Feed',
    category: 'media_channels',
    frequencyBand: 'DBS Ku-Band',
    userCount: 220,
    modes: '+cnt',
    isStreamActive: true,
    mediaType: '4K Scenic Satcom',
    mediaBitrate: '15.0 Mbps HEVC',
    unrealLeafSync: true,
  },
  {
    name: '#dish-nasatv',
    topic: 'NASA TV HD (KNSA-TV) Space Exploration, ISS Live Cam & Artemis Missions',
    category: 'media_channels',
    frequencyBand: 'C-Band',
    userCount: 390,
    modes: '+cnt',
    isStreamActive: true,
    mediaType: '1080p60 NASA Feed',
    mediaBitrate: '8.0 Mbps H.264',
    unrealLeafSync: true,
  },
  {
    name: '#satcom-starlink',
    topic: 'Starlink Direct-to-Cellular LEO Constellation Direct Gateway & Optical Mesh NOC',
    category: 'media_channels',
    frequencyBand: 'Ka/Ku & Laser',
    userCount: 560,
    modes: '+cnt',
    isStreamActive: true,
    mediaType: 'LEO Orbit Telemetry & Video',
    mediaBitrate: '18.0 Mbps HEVC',
    unrealLeafSync: true,
  },
  {
    name: '#satcom-ses-mpower',
    topic: 'SES O3b mPOWER MEO High-Throughput Steerable Spot-Beam Ground Teleports',
    category: 'media_channels',
    frequencyBand: 'Ka-Band',
    userCount: 240,
    modes: '+cnt',
    isStreamActive: true,
    mediaType: 'MEO Teleport Uplink',
    mediaBitrate: '14.0 Mbps HEVC',
    unrealLeafSync: true,
  },
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
    name: '#drfun1-wireless',
    topic: 'DrFun1 Wireless Carrier Division | Factory Unlocked Cell Phones + Multi-Carrier Direct-to-Cell Satellite 5G (Apple, Samsung, Google, T-Mo, AT&T, Verizon, AST SpaceMobile, Starlink)',
    category: 'media_channels',
    frequencyBand: '5G NTN & Cellular',
    userCount: 840,
    modes: '+sntk 5G',
    isStreamActive: true,
    mediaType: 'Wireless Carrier NOC & Unlocked Handset Dispatch',
    mediaBitrate: '20 Mbps Optical Feed',
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

  // ==========================================
  // SATELLITE COMPANY INTER-NETWORK IRC CHANNELS
  // ==========================================
  {
    name: '#starlink',
    topic: 'Starlink (SpaceX) Commercial & Inter-Network Mission Operations | Direct Optical Space Laser Telemetry',
    category: 'satellite_companies',
    frequencyBand: 'Ku-Band / Ka-Band / Space Laser',
    userCount: 845,
    modes: '+sntk 100G',
    isStreamActive: true,
    mediaType: '4K Starlink Space Gateway Downlink',
    mediaBitrate: '220 Mbps LEO Stream',
    unrealLeafSync: true,
    companyName: 'Starlink (SpaceX)',
    networkType: 'satellite',
  },
  {
    name: '#eutelsat-oneweb',
    topic: 'Eutelsat OneWeb LEO Enterprise Constellation Operations | Low-Latency Polar & Global Trunking',
    category: 'satellite_companies',
    frequencyBand: 'Ku-Band / Ka-Band',
    userCount: 412,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'LEO Carrier Trunking & QoS Feed',
    mediaBitrate: '150 Mbps Symmetric',
    unrealLeafSync: true,
    companyName: 'Eutelsat OneWeb',
    networkType: 'satellite',
  },
  {
    name: '#ses-mpower',
    topic: 'SES S.A. & O3b mPOWER MEO Gigabit Constellation Gateway | Equator & Cruise Maritime Trunking',
    category: 'satellite_companies',
    frequencyBand: 'Ka-Band Gigabit',
    userCount: 388,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'MEO Dynamic Beam Allocation Telemetry',
    mediaBitrate: 'Multi-Gigabit Pipe',
    unrealLeafSync: true,
    companyName: 'SES (SES S.A.)',
    networkType: 'satellite',
  },
  {
    name: '#intelsat',
    topic: 'Intelsat Global Fleet Transponder Comms | EpicNG Transoceanic Aircraft & Maritime Video Relay',
    category: 'satellite_companies',
    frequencyBand: 'C-Band / Ku-Band',
    userCount: 295,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Global Video Multiplex & Aeronautical Relay',
    mediaBitrate: '45 Mbps DVB-S2X',
    unrealLeafSync: true,
    companyName: 'Intelsat',
    networkType: 'satellite',
  },
  {
    name: '#viasat-inmarsat',
    topic: 'Viasat & Inmarsat Global Mobility | Global Xpress, ELERA L-band Safety & ViaSat-3 Terabit Fleet',
    category: 'satellite_companies',
    frequencyBand: 'Ka-Band / L-Band',
    userCount: 360,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'GMDSS Safety & In-Flight Broadband Stream',
    mediaBitrate: '50 Mbps Adaptive Stream',
    unrealLeafSync: true,
    companyName: 'Viasat / Inmarsat',
    networkType: 'satellite',
  },
  {
    name: '#iridium',
    topic: 'Iridium Communications Pole-to-Pole LEO Operations | Iridium Certus & Project Stardust 3GPP D2D',
    category: 'satellite_companies',
    frequencyBand: 'L-Band (1.6 GHz)',
    userCount: 470,
    modes: '+mnt',
    isStreamActive: true,
    mediaType: 'Cross-Linked Orbital Mesh Telemetry',
    mediaBitrate: '704 kbps Dedicated Audio/Data',
    unrealLeafSync: true,
    companyName: 'Iridium Communications',
    networkType: 'satellite',
  },
  {
    name: '#telesat',
    topic: 'Telesat Lightspeed Sovereign Canadian & Global LEO Optical Laser Mesh Network Control',
    category: 'satellite_companies',
    frequencyBand: 'Ka-Band / Optical Laser (1550nm)',
    userCount: 230,
    modes: '+snt',
    isStreamActive: true,
    mediaType: 'MEF 3.0 Optical Inter-Satellite Telemetry',
    mediaBitrate: '100 Mbps CIR',
    unrealLeafSync: true,
    companyName: 'Telesat (Lightspeed)',
    networkType: 'satellite',
  },
  {
    name: '#amazon-kuiper',
    topic: 'Amazon Project Kuiper LEO Constellation Bridge | Promethean Silicon & AWS Ground Station Peering',
    category: 'satellite_companies',
    frequencyBand: 'Ka-Band (17.7-30.0 GHz)',
    userCount: 520,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'AWS Direct Connect Cloud Satellite Telemetry',
    mediaBitrate: '1 Gbps Ultra-Broadband',
    unrealLeafSync: true,
    companyName: 'Amazon Project Kuiper',
    networkType: 'satellite',
  },
  {
    name: '#ast-spacemobile',
    topic: 'AST SpaceMobile BlueBird Direct-to-Cellular Space Towers | 4G/5G Broadband Direct to Unmodified Phones',
    category: 'satellite_companies',
    frequencyBand: 'Cellular 850MHz / AWS / 3GPP NTN',
    userCount: 680,
    modes: '+mnt',
    isStreamActive: true,
    mediaType: 'Orbital Cellular Base Station Telemetry Feed',
    mediaBitrate: '5G Voice & 4K Video Downlink',
    unrealLeafSync: true,
    companyName: 'AST SpaceMobile',
    networkType: 'satellite',
  },
  {
    name: '#lynk-global',
    topic: 'Lynk Global Direct-to-Device LEO Satellite Cell Towers | Global Roaming & Emergency Space SOS',
    category: 'satellite_companies',
    frequencyBand: 'UHF / VHF / Cellular GSM/LTE',
    userCount: 245,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Direct-to-Device Cellular SMS & Voice Feed',
    mediaBitrate: 'Cellular Signaling IQ',
    unrealLeafSync: true,
    companyName: 'Lynk Global',
    networkType: 'satellite',
  },
  {
    name: '#echostar-hughes',
    topic: 'EchoStar & HughesNet Jupiter-3 (EchoStar XXIV) Ultra-High-Density Ka-Band Constellation Gateway',
    category: 'satellite_companies',
    frequencyBand: 'Ka-Band / Q/V-Band Feeder',
    userCount: 315,
    modes: '+nt',
    isStreamActive: true,
    mediaType: '500 Gbps Constellation Spot-Beam Monitor',
    mediaBitrate: '150 Mbps HTS Stream',
    unrealLeafSync: true,
    companyName: 'EchoStar / HughesNet',
    networkType: 'satellite',
  },
  {
    name: '#globalstar',
    topic: 'Globalstar LEO Constellation & Licensed 3GPP Band n53 Terrestrial/Satellite Private 5G Network',
    category: 'satellite_companies',
    frequencyBand: 'Band n53 (2.4 GHz) / L-Band',
    userCount: 410,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Apple Emergency SOS Satellite Telemetry Gateway',
    mediaBitrate: 'Low-Latency SBD Packet Feed',
    unrealLeafSync: true,
    companyName: 'Globalstar',
    networkType: 'satellite',
  },
  {
    name: '#hispasat',
    topic: 'Hispasat Transatlantic Video & Telecom Gateway | Spanish, Portuguese & Pan-American Broadcast',
    category: 'satellite_companies',
    frequencyBand: 'Ku-Band / Ka-Band',
    userCount: 185,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'DTH Television Transponder Clean Feed',
    mediaBitrate: '30 Mbps Multiplex',
    unrealLeafSync: true,
    companyName: 'Hispasat',
    networkType: 'satellite',
  },
  {
    name: '#arabsat',
    topic: 'Arabsat Telecommunications Consortium | MENA Region Teleport & High-Power Broadcast Transponders',
    category: 'satellite_companies',
    frequencyBand: 'C-Band / Ku-Band / Ka-Band',
    userCount: 220,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Arabian Peninsula Broadcast Telemetry',
    mediaBitrate: '36 MHz Transponder Video',
    unrealLeafSync: true,
    companyName: 'Arabsat',
    networkType: 'satellite',
  },
  {
    name: '#skyperfect-jsat',
    topic: 'SKY Perfect JSAT Asia-Pacific Geospatial & Satellite Broadcast Network Control Center',
    category: 'satellite_companies',
    frequencyBand: 'C-Band / Ku-Band / Ka-Band',
    userCount: 205,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Tokyo Earth Station 4K Ultra HD Transponder',
    mediaBitrate: '40 Mbps DVB-S2X',
    unrealLeafSync: true,
    companyName: 'SKY Perfect JSAT',
    networkType: 'satellite',
  },
  {
    name: '#avanti-comms',
    topic: 'Avanti Communications HYLAS High-Throughput Ka-Band Fleet | EMEA Rural & Defense Connectivity',
    category: 'satellite_companies',
    frequencyBand: 'Ka-Band HTS',
    userCount: 160,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'High-Throughput Ka Spot-Beam Stream',
    mediaBitrate: '25 Mbps Video Relay',
    unrealLeafSync: true,
    companyName: 'Avanti Communications',
    networkType: 'satellite',
  },
  {
    name: '#space42-thuraya',
    topic: 'Space42 (Yahsat & Thuraya) Sovereign Satellite Telecommunications & MarineStar Fleet Control',
    category: 'satellite_companies',
    frequencyBand: 'L-Band / Ka-Band',
    userCount: 275,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Circuit-Switched Voice & Marine Telemetry',
    mediaBitrate: 'Digital Voice & Sensor Hub',
    unrealLeafSync: true,
    companyName: 'Space42 (Yahsat / Thuraya)',
    networkType: 'satellite',
  },
  {
    name: '#thaicom',
    topic: 'Thaicom Public Company Limited | Asia-Pacific Geosynchronous Broadcast & Broadband Satellites',
    category: 'satellite_companies',
    frequencyBand: 'C-Band / Ku-Band',
    userCount: 155,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Bangkok Teleport Uplink Stream',
    mediaBitrate: '20 Mbps Television Stream',
    unrealLeafSync: true,
    companyName: 'Thaicom',
    networkType: 'satellite',
  },
  {
    name: '#asiasat',
    topic: 'AsiaSat Hong Kong Teleport & Broadcast Hub | Reaching 2/3 of World Population with Premium Media',
    category: 'satellite_companies',
    frequencyBand: 'C-Band / Ku-Band / Ka-Band',
    userCount: 240,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'AsiaSat 7 & 9 High-Definition Broadcast',
    mediaBitrate: '35 Mbps Multiplex',
    unrealLeafSync: true,
    companyName: 'AsiaSat',
    networkType: 'satellite',
  },
  {
    name: '#kacific',
    topic: 'Kacific Broadband Satellites | Streamlined Ka-band Island Rural Healthcare & Education Telecom',
    category: 'satellite_companies',
    frequencyBand: 'Ka-Band Spot Beams',
    userCount: 175,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Island Pacific High-Throughput Stream',
    mediaBitrate: '15 Mbps Video Stream',
    unrealLeafSync: true,
    companyName: 'Kacific',
    networkType: 'satellite',
  },
  {
    name: '#kineis',
    topic: 'Kinéis 25-Nanosatellite Constellation | Dedicated Global Argos Space IoT & Wildlife Telemetry',
    category: 'satellite_companies',
    frequencyBand: '401 MHz UHF Argos',
    userCount: 310,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Real-Time IoT Beacon Event Dispatcher',
    mediaBitrate: 'Low-Power Doppler Packets',
    unrealLeafSync: true,
    companyName: 'Kinéis',
    networkType: 'satellite',
  },
  {
    name: '#sateliot',
    topic: 'Sateliot Standard 3GPP Rel-17 5G NB-IoT Non-Terrestrial Network LEO Constellation Operations',
    category: 'satellite_companies',
    frequencyBand: '3GPP Band 65 (2.1 GHz) NB-IoT',
    userCount: 395,
    modes: '+nt',
    isStreamActive: true,
    mediaType: '5G Core Space Cell Roaming Gateway',
    mediaBitrate: '5G GTP Signaling Feed',
    unrealLeafSync: true,
    companyName: 'Sateliot',
    networkType: 'satellite',
  },
  {
    name: '#omnispace',
    topic: 'Omnispace Global 2 GHz S-Band 3GPP 5G NTN Hybrid Terrestrial/Satellite Network Architecture',
    category: 'satellite_companies',
    frequencyBand: '2.0 GHz S-Band ITU Priority',
    userCount: 260,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Global VoNR 5G Voice & Data Stream',
    mediaBitrate: '5G NR-NTN Downlink',
    unrealLeafSync: true,
    companyName: 'Omnispace',
    networkType: 'satellite',
  },
  {
    name: '#spire-global',
    topic: 'Spire Global Space-as-a-Service | Lemur Constellation Maritime AIS, Aviation ADS-B & GNSS Weather',
    category: 'satellite_companies',
    frequencyBand: 'VHF AIS / ADS-B / GNSS-RO',
    userCount: 340,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Global Ship & Aircraft Position Broadcast',
    mediaBitrate: 'Live Sensor Telemetry',
    unrealLeafSync: true,
    companyName: 'Spire Global',
    networkType: 'satellite',
  },
  {
    name: '#planet-labs',
    topic: 'Planet Labs Daily Earth Observation API Relay | SkySat 50cm Multispectral & PlanetScope Feed',
    category: 'satellite_companies',
    frequencyBand: '8-Band Multispectral X-Band',
    userCount: 420,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Real-Time Earth Observation Image Pipeline',
    mediaBitrate: '50 Mbps Data Ingestion',
    unrealLeafSync: true,
    companyName: 'Planet Labs',
    networkType: 'satellite',
  },
  {
    name: '#capella-space',
    topic: 'Capella Space High-Resolution Synthetic Aperture Radar (SAR) 24/7 All-Weather Earth Imaging',
    category: 'satellite_companies',
    frequencyBand: 'X-Band Radar (9.6 GHz)',
    userCount: 210,
    modes: '+snt',
    isStreamActive: true,
    mediaType: 'Sub-Meter SAR Radar Imagery Telemetry',
    mediaBitrate: 'Radar Phase Data Feed',
    unrealLeafSync: true,
    companyName: 'Capella Space',
    networkType: 'satellite',
  },
  {
    name: '#iceye',
    topic: 'ICEYE SAR Satellite Radar Constellation Operations | Millimeter Change Detection & Flood Monitoring',
    category: 'satellite_companies',
    frequencyBand: 'X-Band SAR Radar',
    userCount: 290,
    modes: '+snt',
    isStreamActive: true,
    mediaType: 'All-Weather Persistent Radar Downlink',
    mediaBitrate: 'Radar Ingestion Pipeline',
    unrealLeafSync: true,
    companyName: 'ICEYE',
    networkType: 'satellite',
  },
  {
    name: '#hawkeye-360',
    topic: 'HawkEye 360 Radio Frequency (RF) Geospatial Intelligence & Spectrum Mapping Constellation',
    category: 'satellite_companies',
    frequencyBand: 'RF Spectrum (144 MHz - 15 GHz)',
    userCount: 190,
    modes: '+snt',
    isStreamActive: true,
    mediaType: 'Global RF Interference & Radar Mapping Feed',
    mediaBitrate: 'RF Emitter Geo-location Stream',
    unrealLeafSync: true,
    companyName: 'HawkEye 360',
    networkType: 'satellite',
  },
  {
    name: '#speedcast',
    topic: 'Speedcast Global Managed Communications | Critical Remote Energy, Maritime & NGO Satcom Operations',
    category: 'satellite_companies',
    frequencyBand: 'C/Ku/Ka/L Multi-Band',
    userCount: 255,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Enterprise VSAT NOC Telemetry',
    mediaBitrate: 'Multi-Network WAN Monitor',
    unrealLeafSync: true,
    companyName: 'Speedcast',
    networkType: 'satellite',
  },
  {
    name: '#satcom-direct',
    topic: 'Satcom Direct (SD) Business Aviation Avionics & In-Flight Connectivity (IFC) Flight Operations',
    category: 'satellite_companies',
    frequencyBand: 'Ka-Band / Ku-Band / L-Band',
    userCount: 215,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Corporate Jet Flight Tracker & Telemetry',
    mediaBitrate: 'Aircraft Data Bus Stream',
    unrealLeafSync: true,
    companyName: 'Satcom Direct',
    networkType: 'satellite',
  },
  {
    name: '#kymeta',
    topic: 'Kymeta Flat-Panel Metamaterial Electronically Steered Antenna (MESA) Vehicular Mobility Hub',
    category: 'satellite_companies',
    frequencyBand: 'Ku-Band / 5G Cellular Hybrid',
    userCount: 280,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Mobile Vehicular Tracking & Beam Steering',
    mediaBitrate: '150 Mbps On-the-Move',
    unrealLeafSync: true,
    companyName: 'Kymeta Corporation',
    networkType: 'satellite',
  },
  {
    name: '#marlink',
    topic: 'Marlink Smart Network Solutions | Sealink Hybrid Maritime VSAT, Starlink & Coastal 5G Bonding',
    category: 'satellite_companies',
    frequencyBand: 'Multi-Orbit LEO/GEO + 5G',
    userCount: 330,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'High Seas Vessel WAN & Firewall Telemetry',
    mediaBitrate: 'Bonded Maritime Multi-Link',
    unrealLeafSync: true,
    companyName: 'Marlink',
    networkType: 'satellite',
  },
  {
    name: '#turksat',
    topic: 'Türksat Uydu Haberleşme | Eurasia Satellite Broadcast, High-Throughput Broadband & Teleport Ops',
    category: 'satellite_companies',
    frequencyBand: 'Ku-Band / Ka-Band / C-Band',
    userCount: 195,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Eurasia Television Multiplex Clean Feed',
    mediaBitrate: '30 Mbps DVB-S2X',
    unrealLeafSync: true,
    companyName: 'Türksat',
    networkType: 'satellite',
  },
  {
    name: '#star-one',
    topic: 'Embratel Star One Latin American Satellite Telecommunications Fleet Operations & Broadcast',
    category: 'satellite_companies',
    frequencyBand: 'C-Band / Ku-Band / Ka-Band',
    userCount: 210,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Pan-Latin America Television Uplink',
    mediaBitrate: '32 Mbps Video Stream',
    unrealLeafSync: true,
    companyName: 'Star One (Embratel)',
    networkType: 'satellite',
  },
  {
    name: '#quantum-fiber',
    topic: 'Quantum Fiber Terrestrial Optical & 8G Multi-Gigabit Symmetrical Inter-Network Backbone',
    category: 'satellite_companies',
    frequencyBand: 'Terrestrial 400G Coherent Optical',
    userCount: 650,
    modes: '+sntk 100G',
    isStreamActive: true,
    mediaType: '8 Gbps Optical Speedtest & Peering Beacon',
    mediaBitrate: '8 Gbps Symmetrical Line',
    unrealLeafSync: true,
    companyName: 'Quantum Fiber',
    networkType: 'satellite',
  },
  {
    name: '#switch-supernap',
    topic: 'Switch SUPERNAP 100G/400G Optical DWDM Ring & Core Teleport Earth Station Hub (www.switch.com)',
    category: 'satellite_companies',
    frequencyBand: 'Single-Mode OS2 / DWDM 1550nm',
    userCount: 780,
    modes: '+sntk 100G',
    isStreamActive: true,
    mediaType: 'Switch Tier 5 Platinum Teleport NOC Feed',
    mediaBitrate: '100 Gbps Laser Interconnect',
    unrealLeafSync: true,
    companyName: 'Switch (www.switch.com)',
    networkType: 'satellite',
  },
  {
    name: '#risingnet',
    topic: 'RisingNet Tier-1 BGP IP Transit Backbone & CleanPipe 3.2 Tbps DDoS Defense (www.risingnet.com)',
    category: 'satellite_companies',
    frequencyBand: 'BGP IPv4/IPv6 DWDM Core',
    userCount: 590,
    modes: '+snt',
    isStreamActive: true,
    mediaType: 'RisingNet Backbone Telemetry & Flow Scrubber',
    mediaBitrate: '3.2 Tbps DDoS Guard Feed',
    unrealLeafSync: true,
    companyName: 'RisingNet',
    networkType: 'satellite',
  },
  {
    name: '#datapacket',
    topic: 'DataPacket Unmetered 40Gbps High-Throughput Server Hosting & Global Audio Transit (www.datapacket.com)',
    category: 'satellite_companies',
    frequencyBand: '40G SFP28 Unmetered',
    userCount: 460,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Unmetered 40G Port Traffic & Stream Relay',
    mediaBitrate: '40 Gbps Port Monitor',
    unrealLeafSync: true,
    companyName: 'DataPacket',
    networkType: 'satellite',
  },
  {
    name: '#qualcomm-snapdragon',
    topic: 'Qualcomm Snapdragon Satellite 3GPP Rel-17/18 NTN & Snapdragon X80 5G Modem-RF Platform',
    category: 'satellite_companies',
    frequencyBand: '3GPP NTN / 5G Sub-6 / mmWave',
    userCount: 720,
    modes: '+snt',
    isStreamActive: true,
    mediaType: 'Snapdragon NTN Direct-to-Device Telemetry Hub',
    mediaBitrate: '10 Gbps 5G + Satellite Downlink',
    unrealLeafSync: true,
    companyName: 'Qualcomm Snapdragon',
    networkType: 'satellite',
  },

  // ==========================================
  // PHONE CARRIER INTER-NETWORK IRC CHANNELS
  // ==========================================
  {
    name: '#tmobile-direct',
    topic: 'T-Mobile US Direct-to-Cell Inter-Network Operations | PCS Band 25 Satellite SMS, MMS & Voice',
    category: 'phone_carriers',
    frequencyBand: 'PCS Band 25 (1910-1995 MHz G-Block)',
    userCount: 920,
    modes: '+sntk 100G',
    isStreamActive: true,
    mediaType: 'T-Mobile Direct-to-Cell Cellular Gateway Stream',
    mediaBitrate: '5G Core GTP Stream',
    unrealLeafSync: true,
    companyName: 'T-Mobile US',
    networkType: 'carrier',
  },
  {
    name: '#att-spacemobile',
    topic: 'AT&T Mobility & FirstNet Public Safety Satellite Inter-Network | AST SpaceMobile BlueBird Gateway',
    category: 'phone_carriers',
    frequencyBand: 'Cellular 850MHz Band 5 & FirstNet Band 14',
    userCount: 880,
    modes: '+sntk 100G',
    isStreamActive: true,
    mediaType: 'FirstNet QPP Priority Responder Telemetry',
    mediaBitrate: '4K Tactical Field Downlink',
    unrealLeafSync: true,
    companyName: 'AT&T Mobility',
    networkType: 'carrier',
  },
  {
    name: '#verizon-satcom',
    topic: 'Verizon Wireless Emergency Response Satellite Mesh (THOR) & Enterprise Private 5G NTN Core',
    category: 'phone_carriers',
    frequencyBand: 'C-Band n77 & AWS Band 66',
    userCount: 790,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Verizon Frontline Emergency Fleet Monitor',
    mediaBitrate: 'High-Definition Tactical Stream',
    unrealLeafSync: true,
    companyName: 'Verizon Wireless',
    networkType: 'carrier',
  },
  {
    name: '#vodafone-global',
    topic: 'Vodafone Group International Satellite Roaming & European SpaceMobile 5G Broadband Gateway',
    category: 'phone_carriers',
    frequencyBand: '3GPP Band 1 (2100 MHz) & Band 8',
    userCount: 640,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Pan-European Space Roaming Core Gateway',
    mediaBitrate: '5G Core Gateway Feed',
    unrealLeafSync: true,
    companyName: 'Vodafone Group',
    networkType: 'carrier',
  },
  {
    name: '#deutsche-telekom',
    topic: 'Deutsche Telekom Global 5G NTN Space Operations | Intelsat, Skylo & O3b mPOWER Cellular Hybrid',
    category: 'phone_carriers',
    frequencyBand: 'Band 3 (1800 MHz) & Band 7',
    userCount: 580,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Frankfurt Teleport 5G Gateway Feed',
    mediaBitrate: 'Carrier Grade Roaming Stream',
    unrealLeafSync: true,
    companyName: 'Deutsche Telekom',
    networkType: 'carrier',
  },
  {
    name: '#softbank-japan',
    topic: 'SoftBank Corp. Non-Terrestrial Network (NTN) & Eutelsat OneWeb LEO Ground Hub in Japan',
    category: 'phone_carriers',
    frequencyBand: 'Band 8 (900 MHz Platinum Band)',
    userCount: 460,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Tokyo Satellite Gateway & Disasters Comms',
    mediaBitrate: 'Disaster Recovery Low-Latency Line',
    unrealLeafSync: true,
    companyName: 'SoftBank Corp.',
    networkType: 'carrier',
  },
  {
    name: '#rakuten-mobile',
    topic: 'Rakuten Mobile Symphony Open-RAN & AST SpaceMobile Direct-to-Cell Integration in Japan',
    category: 'phone_carriers',
    frequencyBand: 'Band 3 (1.7 GHz) & 700 MHz Platinum',
    userCount: 390,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Open-RAN Cloud Virtualized Core Stream',
    mediaBitrate: 'vRAN Orchestration Telemetry',
    unrealLeafSync: true,
    companyName: 'Rakuten Mobile',
    networkType: 'carrier',
  },
  {
    name: '#rogers-canada',
    topic: 'Rogers Communications Remote Canadian Wilderness & Arctic Highway Satellite Cell Coverage',
    category: 'phone_carriers',
    frequencyBand: 'Band 71 (600 MHz) & Band 12',
    userCount: 340,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Canadian Trans-Continental Arctic Stream',
    mediaBitrate: 'Highway 16 Emergency Comms',
    unrealLeafSync: true,
    companyName: 'Rogers Communications',
    networkType: 'carrier',
  },
  {
    name: '#telstra-australia',
    topic: 'Telstra Australian Outback & Maritime Low Earth Orbit Direct-to-Cell Inter-Network',
    category: 'phone_carriers',
    frequencyBand: 'Band 28 (700 MHz APT) & Band 5',
    userCount: 370,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Outback Bushfire Emergency Satellite Link',
    mediaBitrate: 'Remote Solar Micro-Base Station',
    unrealLeafSync: true,
    companyName: 'Telstra Corporation',
    networkType: 'carrier',
  },
  {
    name: '#telefonica-tech',
    topic: 'Telefónica Tech & Sateliot 5G NB-IoT Non-Terrestrial Network Roaming Core Exchange',
    category: 'phone_carriers',
    frequencyBand: 'NB-IoT Band 20 (800 MHz)',
    userCount: 310,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'IoT Roaming Clearinghouse Stream',
    mediaBitrate: 'GSMA Roaming Data Pipe',
    unrealLeafSync: true,
    companyName: 'Telefónica',
    networkType: 'carrier',
  },
  {
    name: '#apple-satellite',
    topic: 'Apple Emergency SOS via Satellite Gateway & Globalstar Band n53 Direct Satellite Feed',
    category: 'phone_carriers',
    frequencyBand: 'Band n53 & L-Band Uplink',
    userCount: 850,
    modes: '+snt',
    isStreamActive: true,
    mediaType: 'iOS Emergency Relay & Crash Detection Feed',
    mediaBitrate: 'Encrypted Emergency Packets',
    unrealLeafSync: true,
    companyName: 'Apple Inc. (Emergency SOS)',
    networkType: 'carrier',
  },
  {
    name: '#skylo-network',
    topic: 'Skylo Technologies 3GPP Rel-17 NTN Carrier Roaming Core | Direct GEO/LEO Smartphone Messaging',
    category: 'phone_carriers',
    frequencyBand: 'L-Band & S-Band 3GPP NTN',
    userCount: 420,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Standard 3GPP NTN Core Gateway Feed',
    mediaBitrate: 'Standard Signaling GTP Stream',
    unrealLeafSync: true,
    companyName: 'Skylo Technologies',
    networkType: 'carrier',
  },

  // ==========================================
  // BROADCASTING NETWORK INTER-NETWORK IRC CHANNELS
  // ==========================================
  {
    name: '#drfun1-tv',
    topic: 'DrFun1 Media Prime TV Inter-Network Master Broadcast Hub | High-Definition Space & Satcom TV',
    category: 'broadcast_networks',
    frequencyBand: 'Ka-Band / 1550nm Laser',
    userCount: 890,
    modes: '+sntk 100G',
    isStreamActive: true,
    mediaType: '4K Ultra HD Broadcast Master Feed',
    mediaBitrate: '14.5 Mbps HEVC',
    unrealLeafSync: true,
    companyName: 'DrFun1 Media Prime TV',
    networkType: 'broadcast',
  },
  {
    name: '#drfun1-news',
    topic: 'DrFun1 Satcom 24/7 News TV Inter-Network Broadcast | Continuous Aerospace & FCC Filings News',
    category: 'broadcast_networks',
    frequencyBand: 'Ku-Band (11.7 - 14.5 GHz)',
    userCount: 540,
    modes: '+nt',
    isStreamActive: true,
    mediaType: '1080p60 News Wire & Teleprompter Feed',
    mediaBitrate: '8.5 Mbps H.264',
    unrealLeafSync: true,
    companyName: 'DrFun1 24/7 News TV',
    networkType: 'broadcast',
  },
  {
    name: '#drfun1-radio',
    topic: 'DrFun1 Master Radio & MPD Audio Stream | 320kbps Studio Sound with Live DJ & IRC Song Requests',
    category: 'broadcast_networks',
    frequencyBand: 'Stereo Hi-Fi 320kbps / S-Band',
    userCount: 970,
    modes: '+mnt',
    isStreamActive: true,
    mediaType: '320 kbps Pristine Studio Audio + Live DJ Deck',
    mediaBitrate: '320 kbps Opus / Icecast2',
    unrealLeafSync: true,
    companyName: 'DrFun1 Master Radio',
    networkType: 'broadcast',
  },
  {
    name: '#cablecast-tv',
    topic: 'Cablecast Community & Municipal Public Access Inter-Network Broadcast Matrix',
    category: 'broadcast_networks',
    frequencyBand: 'Metro Fiber / QAM / ATSC 3.0',
    userCount: 430,
    modes: '+nt',
    isStreamActive: true,
    mediaType: 'Public, Educational & Government (PEG) TV',
    mediaBitrate: '6.5 Mbps HD Stream',
    unrealLeafSync: true,
    companyName: 'Cablecast Broadcast',
    networkType: 'broadcast',
  },
  {
    name: '#fubo-sports',
    topic: 'Fubo Live Sports & Major League Broadcast Inter-Network Relay | Ultra-Low Latency Stadium Feeds',
    category: 'broadcast_networks',
    frequencyBand: 'Multi-CDN OTT / 100G Fiber',
    userCount: 1150,
    modes: '+sntk 100G',
    isStreamActive: true,
    mediaType: '4K HDR Stadium Live Stream & Scoreboard',
    mediaBitrate: '18 Mbps Direct Stream',
    unrealLeafSync: true,
    companyName: 'Fubo Sports Network',
    networkType: 'broadcast',
  },
  {
    name: '#tvu-broadcast',
    topic: 'TVU Networks Cloud Broadcast & Media Routing Inter-Network Matrix | Global Remote Field Ingestion',
    category: 'broadcast_networks',
    frequencyBand: 'ISOSLICE / Bonded Cellular & Starlink',
    userCount: 680,
    modes: '+snt',
    isStreamActive: true,
    mediaType: 'TVU Grid Cloud Video Routing Feed',
    mediaBitrate: '25 Mbps Multi-Camera Matrix',
    unrealLeafSync: true,
    companyName: 'TVU Networks',
    networkType: 'broadcast',
  },
  {
    name: '#whitehouse-briefings',
    topic: 'White House Press Briefings & Executive Media Inter-Network Communications Channel',
    category: 'broadcast_networks',
    frequencyBand: 'Encrypted Government Fiber / C-Band',
    userCount: 760,
    modes: '+snt',
    isStreamActive: true,
    mediaType: 'James S. Brady Press Briefing Room Live Feed',
    mediaBitrate: '10 Mbps Broadcast Line',
    unrealLeafSync: true,
    companyName: 'The White House (WHCA)',
    networkType: 'broadcast',
  },
];

export const INITIAL_IRC_USERS: IrcUser[] = [
  {
    nick: 'RichardAlanWitt',
    prefix: '~',
    role: 'Licensed Administrator & NetAdmin Master DJ (SRA)',
    hostmask: 'richard@wittlawfirm.com/licensee',
    organization: 'The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)',
    channels: ['#lobby', '#dev-platform', '#wittlaw-admins', '#drfun1-media', '#all-bands', '#wittlaw-spectrum', '#switch-supernap', '#drfun1-tv', '#drfun1-radio', '#starlink', '#tmobile-direct'],
  },
  {
    nick: 'EleanorVance_Esq',
    prefix: '&',
    role: 'Head FCC Regulatory Counsel & Lead Network Moderator',
    hostmask: 'vance@wittlawfirm.com/regulatory-lead',
    organization: 'The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)',
    channels: ['#lobby', '#dev-platform', '#wittlaw-admins', '#drfun1-media', '#wittlaw-spectrum'],
  },
  {
    nick: 'MarcusWitt_PE',
    prefix: '&',
    role: 'Principal Satcom Systems Architect & DevOps Lead',
    hostmask: 'marcus@wittlawfirm.com/devops-lead',
    organization: 'The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)',
    channels: ['#lobby', '#dev-platform', '#wittlaw-admins', '#switch-supernap', '#c-band', '#ka-band'],
  },
  {
    nick: 'SarahJenkins_Esq',
    prefix: '@',
    role: 'IP, Copyright & Digital Media Counsel (DMCA/Moderation)',
    hostmask: 'jenkins@wittlawfirm.com/dmca-counsel',
    organization: 'The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)',
    channels: ['#lobby', '#dev-platform', '#wittlaw-admins', '#drfun1-media', '#fubo-sports'],
  },
  {
    nick: 'DavidChen_CISSP',
    prefix: '@',
    role: 'Lead Network Security & Cryptographic Auditor',
    hostmask: 'dchen@wittlawfirm.com/secops-mod',
    organization: 'The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)',
    channels: ['#lobby', '#dev-platform', '#wittlaw-admins', '#switch-supernap', '#risingnet'],
  },
  {
    nick: 'WittLaw_AuditBot',
    prefix: '@',
    role: 'WittLaw Compliance & Spectrum Audit Daemon',
    hostmask: 'audit@bot.wittlawfirm.com',
    isBot: true,
    organization: 'The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)',
    channels: ['#lobby', '#dev-platform', '#wittlaw-admins', '#all-bands', '#wittlaw-spectrum'],
  },
  {
    nick: 'DrFun1_Admin',
    prefix: '~',
    role: 'Station Founder & Executive DJ (~q)',
    hostmask: 'founder@drfun1.com/admin',
    organization: 'DrFun1 Media Inc.',
    channels: ['#lobby', '#dev-platform', '#drfun1-media', '#drfun1-tv', '#drfun1-radio', '#switch-supernap', '#qualcomm-snapdragon'],
  },
  {
    nick: 'DJ_OrbitNova',
    prefix: '@',
    role: 'Channel Operator & Resident DJ (@o)',
    hostmask: 'orbitnova@dj.drfun1.com',
    organization: 'DrFun1 Radio DJ Roster',
    channels: ['#lobby', '#drfun1-radio', '#drfun1-media', '#drfun1-tv', '#all-bands'],
  },
  {
    nick: 'DrFun1_Tech',
    prefix: '@',
    role: 'IRCOp & Services Operator DJ (SO / @o)',
    hostmask: 'tech@oper.drfun1.com',
    organization: 'DrFun1 Operations & Teleport Engineering',
    channels: ['#lobby', '#dev-platform', '#drfun1-media', '#switch-supernap', '#risingnet', '#starlink', '#drfun1-radio'],
  },
  {
    nick: 'DJ_VinylKev',
    prefix: '&',
    role: 'Super Operator & Live DJ (&a)',
    hostmask: 'vinylkev@dj.drfun1.com',
    organization: 'DrFun1 DJ Deck Roster',
    channels: ['#lobby', '#drfun1-radio', '#drfun1-media', '#fubo-sports'],
  },
  {
    nick: 'Switch_NOC_Bot',
    prefix: '@',
    role: 'Switch Automated Operations Daemon',
    hostmask: 'daemon@node1.lasvegas.switch.drfun1.com',
    isBot: true,
    organization: 'Switch SUPERNAP (www.switch.com)',
    channels: ['#lobby', '#drfun1-media', '#switch-supernap', '#all-bands', '#ka-band', '#5g-ntn'],
  },
  {
    nick: 'RisingNet_Transit_Bot',
    prefix: '@',
    role: 'RisingNet BGP & Transit Guard',
    hostmask: 'bot@backbone.risingnet.com',
    isBot: true,
    organization: 'RisingNet (www.risingnet.com)',
    channels: ['#lobby', '#drfun1-media', '#risingnet', '#all-bands'],
  },
  {
    nick: 'Starlink_Mission_Bot',
    prefix: '@',
    role: 'SpaceX Starlink Fleet Gatekeeper',
    hostmask: 'relay@starlink.drfun1.com',
    isBot: true,
    organization: 'Starlink (SpaceX)',
    channels: ['#lobby', '#starlink', '#tmobile-direct', '#all-bands'],
  },
  {
    nick: 'Carrier_NTN_Bridge',
    prefix: '@',
    role: '3GPP NTN Carrier Gateway Bot',
    hostmask: 'bridge@ntn.drfun1.com',
    isBot: true,
    organization: '3GPP Non-Terrestrial Network Alliance',
    channels: ['#lobby', '#tmobile-direct', '#att-spacemobile', '#verizon-satcom', '#5g-ntn'],
  },
  {
    nick: 'ShoutcastBot',
    prefix: '@',
    role: 'SHOUTcast-to-IRC Announcer Daemon (donSchoe/shoutcast-irc)',
    hostmask: 'bot@shoutcast.drfun1.com',
    isBot: true,
    organization: 'donSchoe/shoutcast-irc.git (Ruby Net-IRC / 855,000 Channels)',
    channels: ['#lobby', '#drfun1-primetv', '#drfun1-orbitradio', '#dev-platform', '#fubo-sports', '#all-bands'],
  },
  {
    nick: 'SatcomGuru',
    prefix: '+',
    role: 'Senior RF Payload Engineer',
    hostmask: 'guru@satcom.space/ops',
    organization: 'Space RF Labs',
    channels: ['#lobby', '#drfun1-media', '#ka-band', '#ku-band', '#optical-laser', '#starlink'],
  },
  {
    nick: 'OrbitFlightDirector',
    prefix: '+',
    role: 'LEO Mission Flight Director',
    hostmask: 'flight@orbit.space/ops',
    organization: 'LEO Constellation Ops',
    channels: ['#lobby', '#drfun1-media', '#all-bands', '#telesat', '#ast-spacemobile'],
  },
  {
    nick: 'TeleportDutyEng',
    prefix: '',
    role: 'Ground Station Engineer',
    hostmask: 'duty@switch.teleport.earth',
    organization: 'Switch Earth Station',
    channels: ['#lobby', '#switch-supernap', '#c-band', '#x-band', '#quantum-fiber'],
  },
  {
    nick: 'WirelessCarrierOps',
    prefix: '',
    role: '3GPP NTN Carrier Engineer',
    hostmask: 'ops@5g-carrier.drfun1.com',
    organization: 'DrFun1 Wireless Carrier',
    channels: ['#lobby', '#5g-ntn', '#s-band', '#tmobile-direct', '#att-spacemobile'],
  },
];

export const WITTLAW_ADMINS_MODS: WittLawAdminMod[] = [
  {
    id: 'wittlaw_1',
    nick: 'RichardAlanWitt',
    name: 'Richard Alan Witt, Esq.',
    title: 'Senior Managing Partner, FCC Licensee & NetAdmin Master',
    firm: 'The Law Office of Richard A. Witt LLC',
    firmUrl: 'www.wittlawfirm.com',
    email: 'richard@wittlawfirm.com',
    role: 'netadmin_root',
    rankBadge: 'Root Admin (~q)',
    prefix: '~',
    hostmask: 'richard@wittlawfirm.com/licensee',
    operFlags: '+oaqsh -N (Full Network Root)',
    fccFrn: '0034981290',
    pgpKeyId: '0x9F4C82A1B7E20914',
    permissions: ['ALL_PERMISSIONS', 'SRA_LICENSE_AUTHORITY', 'GLOBAL_KILL', 'RAW_UNREAL_OPER', 'ROOT_DEV_PLATFORM'],
    assignedChannels: ['#lobby', '#dev-platform', '#wittlaw-admins', '#drfun1-media', '#all-bands', '#wittlaw-spectrum'],
    dutyStatus: 'on_duty',
    bio: 'Lead counsel of record and licensed operator under FCC Part 25/73 and international ITU allocations. Oversees network architecture, satellite spectrum filings, and master UnrealIRCd link security.',
    lastActive: 'Just now',
  },
  {
    id: 'wittlaw_2',
    nick: 'EleanorVance_Esq',
    name: 'Eleanor Vance, Esq.',
    title: 'Partner, Lead Regulatory Counsel & Chief Moderator',
    firm: 'The Law Office of Richard A. Witt LLC',
    firmUrl: 'www.wittlawfirm.com',
    email: 'eleanor.vance@wittlawfirm.com',
    role: 'head_regulatory_counsel',
    rankBadge: 'Services Admin (&a)',
    prefix: '&',
    hostmask: 'vance@wittlawfirm.com/regulatory-lead',
    operFlags: '+oa -N (Services Admin & Compliance)',
    fccFrn: '0034981290-R01',
    pgpKeyId: '0x5A118DE4C72B9031',
    permissions: ['CHANNEL_MODERATION', 'REGULATORY_DISPATCH', 'GLINE_AUTHORITY', 'BROADCAST_COMPLIANCE'],
    assignedChannels: ['#lobby', '#dev-platform', '#wittlaw-admins', '#drfun1-media', '#wittlaw-spectrum'],
    dutyStatus: 'on_duty',
    bio: 'Specialist in federal communications law, satellite orbital debris mitigation plans, and broadcast playout compliance. Head of developer conduct and moderation for dev.drfun1media.com.',
    lastActive: '1m ago',
  },
  {
    id: 'wittlaw_3',
    nick: 'MarcusWitt_PE',
    name: 'Marcus Witt, PE',
    title: 'Principal Systems Architect & DevOps Engineering Lead',
    firm: 'The Law Office of Richard A. Witt LLC',
    firmUrl: 'www.wittlawfirm.com',
    email: 'marcus.witt@wittlawfirm.com',
    role: 'systems_architect',
    rankBadge: 'Super Operator (&a)',
    prefix: '&',
    hostmask: 'marcus@wittlawfirm.com/devops-lead',
    operFlags: '+oa (DevOps & Infrastructure Oper)',
    fccFrn: '0034981290-E02',
    pgpKeyId: '0x8B342C9901FA4721',
    permissions: ['CI_CD_DEPLOY', 'SANDBOX_MANAGEMENT', 'WEBSOCKET_API_KEYS', 'LEAF_NODE_CONFIG'],
    assignedChannels: ['#lobby', '#dev-platform', '#wittlaw-admins', '#switch-supernap', '#c-band', '#ka-band'],
    dutyStatus: 'on_duty',
    bio: 'Licensed Professional Engineer (PE) leading optical cross-connect architecture, 100G RisingNet peering, and continuous integration pipelines on dev.drfun1media.com.',
    lastActive: '3m ago',
  },
  {
    id: 'wittlaw_4',
    nick: 'SarahJenkins_Esq',
    name: 'Sarah Jenkins, Esq.',
    title: 'Senior Associate, IP & DMCA Digital Rights Counsel',
    firm: 'The Law Office of Richard A. Witt LLC',
    firmUrl: 'www.wittlawfirm.com',
    email: 'sjenkins@wittlawfirm.com',
    role: 'ip_copyright_counsel',
    rankBadge: 'Operator & Mod (@o)',
    prefix: '@',
    hostmask: 'jenkins@wittlawfirm.com/dmca-counsel',
    operFlags: '+o (Content & Copyright Oper)',
    fccFrn: '0034981290-L03',
    pgpKeyId: '0x334DF889AA120B44',
    permissions: ['DMCA_TAKEDOWN_REVIEW', 'STREAM_CLEARANCE', 'COPYRIGHT_AUDITING', 'KICK_OPERATOR'],
    assignedChannels: ['#lobby', '#dev-platform', '#wittlaw-admins', '#drfun1-media', '#fubo-sports'],
    dutyStatus: 'active_audit',
    bio: 'Oversees intellectual property clearances, live sports broadcasting synchronization rights for Fubo.tv relay, and digital millennium copyright compliance across all media feeds.',
    lastActive: '6m ago',
  },
  {
    id: 'wittlaw_5',
    nick: 'DavidChen_CISSP',
    name: 'David Chen, CISSP',
    title: 'Director of Network Security & Cryptographic Auditing',
    firm: 'The Law Office of Richard A. Witt LLC',
    firmUrl: 'www.wittlawfirm.com',
    email: 'dchen@wittlawfirm.com',
    role: 'secops_security_admin',
    rankBadge: 'Operator & Mod (@o)',
    prefix: '@',
    hostmask: 'dchen@wittlawfirm.com/secops-mod',
    operFlags: '+o (Security & Cryptography Oper)',
    fccFrn: '0034981290-S04',
    pgpKeyId: '0x77EE1120BB890123',
    permissions: ['TLS_CERT_INSPECTION', 'DDoS_MITIGATION', 'BOT_TOKEN_AUDIT', 'ZERO_TRUST_VERIFY'],
    assignedChannels: ['#lobby', '#dev-platform', '#wittlaw-admins', '#switch-supernap', '#risingnet'],
    dutyStatus: 'on_duty',
    bio: 'Directs zero-trust security postures, TLS 1.3 certificate rotation, DDoS packet scrubbing via RisingNet CleanPipe, and API token revocation for developer clients.',
    lastActive: '4m ago',
  },
  {
    id: 'wittlaw_6',
    nick: 'WittLaw_AuditBot',
    name: 'WittLaw Automated Compliance Daemon',
    title: 'Automated Regulatory Telemetry & Spectrum Audit Service',
    firm: 'The Law Office of Richard A. Witt LLC',
    firmUrl: 'www.wittlawfirm.com',
    email: 'audit@wittlawfirm.com',
    role: 'automated_audit_daemon',
    rankBadge: 'Audit Daemon (@o)',
    prefix: '@',
    hostmask: 'audit@bot.wittlawfirm.com',
    operFlags: '+o (Automated Oper Service)',
    fccFrn: '0034981290',
    pgpKeyId: '0x1010AABBCCDD0011',
    permissions: ['AUTO_LOGGING', 'SPECTRUM_MONITOR', 'DISPATCH_ALERTS', 'JSON_RPC_AUDIT'],
    assignedChannels: ['#lobby', '#dev-platform', '#wittlaw-admins', '#all-bands', '#wittlaw-spectrum'],
    dutyStatus: 'active_audit',
    bio: 'Continuous automated bot that queries UnrealIRCd JSON-RPC and Denora databases every 5 seconds to log operator actions, band power levels, and developer API compliance.',
    lastActive: 'Continuous',
    isBot: true,
  },
];

export const DEV_PLATFORM_CONFIG: DevPlatformConfig = {
  platformName: 'dev.drfun1media.com Developer Platform & Sandbox',
  platformDomain: 'dev.drfun1media.com',
  sid: '007',
  sslPort: 6697,
  webSocketPort: 8087,
  httpApiPort: 8443,
  sshPort: 2202,
  environment: 'development_staging_sandbox',
  transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)',
  colocation: 'Switch SUPERNAP Las Vegas (www.switch.com)',
  licensee: 'The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)',
  counselOfRecord: 'Richard Alan Witt, Esq. (FRN: 0034981290 / RAW-SATCOM-2026-LIC-0881)',
  gitRepository: 'git@dev.drfun1media.com:wittlaw/satcom-platform.git',
  activeBranch: 'main-dev',
  unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2-dev',
  totalActiveDevs: 1420,
  sandboxEnvironments: [
    {
      id: 'sandbox_main',
      name: 'Primary Dev Trunk (dev.drfun1media.com)',
      branch: 'main-dev',
      gitCommit: '9a8b7c4 "feat: unreal 6.1.4 json-rpc & wittlaw admin mod dispatch"',
      status: 'online',
      port: 6697,
      unrealVersion: 'UnrealIRCd 6.1.4-dev',
      activeDevelopers: 840,
      assignedAdmins: ['RichardAlanWitt', 'MarcusWitt_PE'],
      deployTimestamp: '12m ago',
      memoryUsageMb: 1420,
    },
    {
      id: 'sandbox_staging',
      name: 'Staging Alpha (staging.dev.drfun1media.com)',
      branch: 'staging/fubo-twitch-relay',
      gitCommit: '3f2e1d0 "feat: quad-screen 4k broadcast websocket bridge"',
      status: 'online',
      port: 6698,
      unrealVersion: 'UnrealIRCd 6.1.4-dev',
      activeDevelopers: 390,
      assignedAdmins: ['SarahJenkins_Esq', 'DavidChen_CISSP'],
      deployTimestamp: '25m ago',
      memoryUsageMb: 980,
    },
    {
      id: 'sandbox_ntn_testbed',
      name: '3GPP NTN 5G Sandbox (ntn.dev.drfun1media.com)',
      branch: 'feature/3gpp-rel18-ntn-direct',
      gitCommit: '7e6d5c4 "fix: band n255 direct-to-handset gtp-u tunnel latency"',
      status: 'online',
      port: 6699,
      unrealVersion: 'UnrealIRCd 6.1.4-dev',
      activeDevelopers: 190,
      assignedAdmins: ['EleanorVance_Esq', 'MarcusWitt_PE'],
      deployTimestamp: '1h ago',
      memoryUsageMb: 760,
    },
  ],
  apiEndpoints: [
    {
      id: 'api_unreal_rpc',
      name: 'UnrealIRCd JSON-RPC 2.0 API',
      method: 'POST',
      endpoint: 'https://dev.drfun1media.com:8443/api/v1/rpc',
      description: 'Programmatically query server stats, inspect user channels, dispatch system notices, and control oper modes.',
      category: 'unreal_ircd',
      authType: 'WittLaw PGP Sign',
      samplePayload: '{\n  "jsonrpc": "2.0",\n  "method": "server.get_stats",\n  "params": { "sid": "007" },\n  "id": 1\n}',
      sampleResponse: '{\n  "jsonrpc": "2.0",\n  "result": {\n    "server": "dev.drfun1media.com",\n    "users": 8838,\n    "channels": 74,\n    "latency_ms": 1.2,\n    "licensee": "www.wittlawfirm.com"\n  },\n  "id": 1\n}',
    },
    {
      id: 'api_websocket_stream',
      name: 'Broadcast Telemetry WebSocket',
      method: 'WS',
      endpoint: 'wss://dev.drfun1media.com:8087/ws/v1/telemetry',
      description: 'Full-duplex real-time feed streaming satellite orbits, Fubo sports scoreboard ticks, and #lobby IRC events.',
      category: 'broadcast_stream',
      authType: 'Bearer Token',
      sampleResponse: '{\n  "event": "match_score_tick",\n  "match": "UEFA Quarterfinal",\n  "score": "2 - 1",\n  "time": "76 LIVE",\n  "channel": "#lobby"\n}',
    },
    {
      id: 'api_denora_stats',
      name: 'Denora IRC Stats REST API',
      method: 'GET',
      endpoint: 'https://dev.drfun1media.com:8443/api/v1/stats/denora',
      description: 'Retrieve real-time TLD statistics, chatter activity rankings, word counts, and operator moderation counts.',
      category: 'stats_denora',
      authType: 'Bearer Token',
      sampleResponse: '{\n  "global_users": 8838,\n  "peak_today": 9120,\n  "top_channel": "#lobby",\n  "moderation_actions_24h": 42\n}',
    },
    {
      id: 'api_wittlaw_auth',
      name: 'WittLaw Moderator Authorization & PGP Verify',
      method: 'POST',
      endpoint: 'https://dev.drfun1media.com:8443/api/v1/auth/wittlaw-oper',
      description: 'Verifies RSA/ED25519 signatures from www.wittlawfirm.com attorneys before granting elevated Oper flags.',
      category: 'auth_wittlaw',
      authType: 'WittLaw PGP Sign',
      samplePayload: '{\n  "nick": "RichardAlanWitt",\n  "frn": "0034981290",\n  "firm": "www.wittlawfirm.com",\n  "signed_nonce": "98fc47e2b10a"\n}',
      sampleResponse: '{\n  "status": "authorized",\n  "flags": "+oaqsh",\n  "role": "netadmin_root",\n  "counsel_verified": true\n}',
    },
  ],
  wittLawAdmins: WITTLAW_ADMINS_MODS,
  recentAuditActions: [
    {
      id: 'audit_1',
      timestamp: '12:08:42',
      adminNick: 'RichardAlanWitt',
      adminTitle: 'Senior Managing Partner (NetAdmin Root)',
      actionType: 'COMPLIANCE_AUDIT',
      target: 'dev.drfun1media.com:6697',
      channel: '#lobby',
      reason: 'Bi-hourly FCC Part 25/73 broadcast playout & RF bandwidth verification passed 100%.',
      legalBasis: '47 CFR § 25.202 / FCC Earth Station License RAW-SATCOM-2026-LIC-0881',
      statutoryReference: 'Communications Act of 1934 Title III',
      severity: 'notice',
    },
    {
      id: 'audit_2',
      timestamp: '12:05:19',
      adminNick: 'EleanorVance_Esq',
      adminTitle: 'Head FCC Regulatory Counsel & Lead Mod',
      actionType: 'MODE',
      target: '#lobby',
      channel: '#lobby',
      reason: 'Enforced channel mode +sntk 100G. Encrypted transit verified across RisingNet optical backbone.',
      legalBasis: 'WittLaw Network Operating Rules Article IV § 2',
      statutoryReference: 'ITU Radio Regulations Appendix 4',
      severity: 'advisory',
    },
    {
      id: 'audit_3',
      timestamp: '11:58:02',
      adminNick: 'SarahJenkins_Esq',
      adminTitle: 'IP & DMCA Digital Rights Counsel',
      actionType: 'DMCA_TAKEDOWN_REVIEW',
      target: 'Fubo Sports Network 4K Ingest',
      channel: '#fubo-sports',
      reason: 'Cleared SMPTE 2110 satellite transponder retransmission license for UEFA Champions League.',
      legalBasis: '17 U.S.C. § 111 / Copyright Royalty Board Agreement 2026',
      statutoryReference: 'Title 17 Copyright Law',
      severity: 'notice',
    },
    {
      id: 'audit_4',
      timestamp: '11:42:15',
      adminNick: 'DavidChen_CISSP',
      adminTitle: 'Director of Network Security',
      actionType: 'API_KEY_REVOKE',
      target: 'Developer ID #dev-unverified-409',
      reason: 'Rate limit breach and unverified PGP signature detected on JSON-RPC endpoint.',
      legalBasis: 'WittLaw Zero-Trust Information Security Policy § 8.1',
      statutoryReference: 'NIST SP 800-207 Zero Trust Architecture',
      severity: 'enforcement',
    },
  ],
};

export const INITIAL_IRC_MESSAGES: Record<string, IrcMessage[]> = {
  '#lobby': [
    {
      id: 'lobby_1',
      timestamp: '12:00:00',
      sender: '***',
      channel: '#lobby',
      content: 'Connecting to dev.drfun1media.com:6697 (SSL) [SID 007 - Switch & RisingNet Dedicated Teleport Dev Gateway]...',
      type: 'system',
    },
    {
      id: 'lobby_2',
      timestamp: '12:00:01',
      sender: '***',
      channel: '#lobby',
      content: 'TLS Handshake verified: TLSv1.3 TLS_AES_256_GCM_SHA384. Mode +sntk 100G. UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2.',
      type: 'system',
    },
    {
      id: 'lobby_3',
      timestamp: '12:00:02',
      sender: '***',
      channel: '#lobby',
      content: 'Channel topic: Official DrFun1 Media Flagship Network Lobby | Fubo.tv Live Sports & Twitch.tv Stream Relay | dev.drfun1media.com:6697 (SSL)',
      type: 'system',
    },
    {
      id: 'lobby_4',
      timestamp: '12:00:05',
      sender: 'RichardAlanWitt',
      channel: '#lobby',
      content: 'Welcome to the #lobby flagship command center! Seamlessly broadcasting Fubo.tv live sports multiplex, Twitch.tv live streams, and mIRC classic client relay across dev.drfun1media.com.',
      type: 'message',
    },
    {
      id: 'lobby_5',
      timestamp: '12:00:10',
      sender: 'DrFun1_Admin',
      channel: '#lobby',
      content: 'Fubo Sports Network 4K stream is live on Deck A. Twitch.tv stream is broadcasting on Deck B. All channel commands are active: /whois, /query, /join, /stats, /clear.',
      type: 'message',
    },
    {
      id: 'lobby_6',
      timestamp: '12:00:18',
      sender: 'Switch_NOC_Bot',
      channel: '#lobby',
      content: '[BROADCAST RELAY] dev.drfun1media.com (SID 007) fiber capacity: 100 Gbps dedicated optical transit via RisingNet. Current latency: 1.2ms.',
      type: 'notice',
    },
    {
      id: 'lobby_7',
      timestamp: '12:00:30',
      sender: 'DJ_VinylKev',
      channel: '#lobby',
      content: 'UEFA Champions League and Premier League satellite quad-screens are locked in on Fubo feed! Audio is crystal clear in 320kbps Opus.',
      type: 'message',
    },
    {
      id: 'lobby_8',
      timestamp: '12:00:45',
      sender: 'SatcomGuru',
      channel: '#lobby',
      content: 'PogChamp! Twitch emote sync is enabled in chat. Feel free to use Kappa, LUL, PogChamp, MonkaS in chat!',
      type: 'message',
    },
  ],
  '#dev-platform': [
    {
      id: 'dev_msg_1',
      timestamp: '12:00:00',
      sender: '***',
      channel: '#dev-platform',
      content: 'Connecting to dev.drfun1media.com:6697 (SSL) [UnrealIRCd 6.1.4 Developer Platform & WebSocket Gateway]...',
      type: 'system',
    },
    {
      id: 'dev_msg_2',
      timestamp: '12:00:01',
      sender: 'RichardAlanWitt',
      channel: '#dev-platform',
      content: 'Welcome developers to the dev.drfun1media.com Development Platform! The Law Office of Richard A. Witt LLC legal and engineering team is on-duty to review API access, bot tokens, and broadcast pipelines.',
      type: 'message',
    },
    {
      id: 'dev_msg_3',
      timestamp: '12:00:08',
      sender: 'MarcusWitt_PE',
      channel: '#dev-platform',
      content: '[DEV PLATFORM] Sandbox environments active: main-dev (Port 6697), staging-alpha (Port 6698), and 3GPP-NTN (Port 6699). JSON-RPC 2.0 API listening on :8443.',
      type: 'notice',
    },
    {
      id: 'dev_msg_4',
      timestamp: '12:00:15',
      sender: 'EleanorVance_Esq',
      channel: '#dev-platform',
      content: 'WittLaw moderation rule #1: All third-party bots and streaming relays must register their PGP public key and adhere to FCC Part 73/25 guidelines. Ping @EleanorVance_Esq or /whois for token clearance.',
      type: 'message',
    },
    {
      id: 'dev_msg_5',
      timestamp: '12:00:22',
      sender: 'WittLaw_AuditBot',
      channel: '#dev-platform',
      content: '[WITTLaw AUDIT DAEMON] All 3 active developer sandbox testbeds verified healthy with 0 memory leaks and TLSv1.3 TLS_AES_256_GCM cipher suite.',
      type: 'notice',
    },
  ],
  '#wittlaw-admins': [
    {
      id: 'wl_admin_1',
      timestamp: '12:00:00',
      sender: '***',
      channel: '#wittlaw-admins',
      content: 'Joined #wittlaw-admins (Modes: +sntik 100G). Legal counsel & network operator privileged communications channel.',
      type: 'system',
    },
    {
      id: 'wl_admin_2',
      timestamp: '12:00:04',
      sender: 'RichardAlanWitt',
      channel: '#wittlaw-admins',
      content: 'WittLaw Legal & Admin team standing by on dev.drfun1media.com. SRA FRN 0034981290 license verification in effect.',
      type: 'message',
    },
    {
      id: 'wl_admin_3',
      timestamp: '12:00:12',
      sender: 'SarahJenkins_Esq',
      channel: '#wittlaw-admins',
      content: 'DMCA & IP review queue is clear. Fubo and Twitch relay transponder agreements re-verified for current broadcast window.',
      type: 'message',
    },
    {
      id: 'wl_admin_4',
      timestamp: '12:00:20',
      sender: 'DavidChen_CISSP',
      channel: '#wittlaw-admins',
      content: 'Zero-trust perimeter active. 26 Switch SUPERNAP leaves passing continuous SHA256 leaf certificate audits.',
      type: 'notice',
    },
  ],
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
      content: 'TLS Handshake verified: TLSv1.3 with AES-256-GCM. UnrealIRCd 6.1.4: All 25 dedicated Switch nodes are actively leafed to Root Hub irc.drfun1.com:6697 (SID 001).',
      type: 'system',
    },
    {
      id: 'm_3',
      timestamp: '12:00:05',
      sender: 'RichardAlanWitt',
      channel: '#drfun1-media',
      content: 'Welcome to DrFun1 Media Inc. Inter-Network Communications & Broadcast Exchange! Channel Operators (@), IRCOps, and above are authorized station DJs on the MPD bot deck.',
      type: 'message',
    },
    {
      id: 'm_4',
      timestamp: '12:00:15',
      sender: 'DJ_OrbitNova',
      channel: '#drfun1-media',
      content: 'DJ Orbit Nova (Channel Operator @o) on deck! Station mount /live is active, -12dB talkover ducking verified. Tune in on #drfun1-radio.',
      type: 'message',
    },
    {
      id: 'm_5',
      timestamp: '12:00:28',
      sender: 'RisingNet_Transit_Bot',
      channel: '#drfun1-media',
      content: '[RISINGNET BGP] Terrestrial DWDM optical ring operational with 0.00% packet loss to Switch SUPERNAP campus.',
      type: 'notice',
    },
  ],
  '#starlink': [
    {
      id: 'sl_1',
      timestamp: '12:01:00',
      sender: '***',
      channel: '#starlink',
      content: 'Topic: Starlink (SpaceX) Commercial & Inter-Network Mission Operations | Direct Optical Space Laser Telemetry',
      type: 'system',
    },
    {
      id: 'sl_2',
      timestamp: '12:01:12',
      sender: 'Starlink_Mission_Bot',
      channel: '#starlink',
      content: '[STARLINK GATEWAY] 6,850 satellites active in orbit. Direct laser mesh forwarding 4.8 Tbps traffic to Switch Las Vegas Earth Station.',
      type: 'notice',
    },
    {
      id: 'sl_3',
      timestamp: '12:01:45',
      sender: 'SatcomGuru',
      channel: '#starlink',
      content: 'Inter-network bridge to #tmobile-direct verified. V2 Mini Direct-to-Cell payload active over PCS Band 25.',
      type: 'message',
    },
  ],
  '#tmobile-direct': [
    {
      id: 'tmo_1',
      timestamp: '12:00:50',
      sender: '***',
      channel: '#tmobile-direct',
      content: 'Topic: T-Mobile US Direct-to-Cell Inter-Network Operations | PCS Band 25 Satellite SMS, MMS & Voice',
      type: 'system',
    },
    {
      id: 'tmo_2',
      timestamp: '12:01:20',
      sender: 'Carrier_NTN_Bridge',
      channel: '#tmobile-direct',
      content: '[T-MOBILE D2D] G-Block 1910-1995 MHz partition online. 100% of US national parks and off-grid territorial waters covered via Starlink space cell towers.',
      type: 'notice',
    },
    {
      id: 'tmo_3',
      timestamp: '12:01:55',
      sender: 'WirelessCarrierOps',
      channel: '#tmobile-direct',
      content: 'DrFun1 Wholesale SIM roaming profile accepted on T-Mobile IMS core. Zero Deadzone protocol operating normally.',
      type: 'message',
    },
  ],
  '#att-spacemobile': [
    {
      id: 'att_1',
      timestamp: '12:01:05',
      sender: '***',
      channel: '#att-spacemobile',
      content: 'Topic: AT&T Mobility & FirstNet Public Safety Satellite Inter-Network | AST SpaceMobile BlueBird Gateway',
      type: 'system',
    },
    {
      id: 'att_2',
      timestamp: '12:01:30',
      sender: 'Carrier_NTN_Bridge',
      channel: '#att-spacemobile',
      content: '[FIRSTNET PRIORITY] AST SpaceMobile BlueBird 64-sq-meter phased array locked. Band 14 QPP preemption active for emergency first responders.',
      type: 'notice',
    },
  ],
  '#drfun1-tv': [
    {
      id: 'dtv_1',
      timestamp: '12:00:10',
      sender: '***',
      channel: '#drfun1-tv',
      content: 'Topic: DrFun1 Media Prime TV Inter-Network Master Broadcast Hub | High-Definition Space & Satcom TV',
      type: 'system',
    },
    {
      id: 'dtv_2',
      timestamp: '12:00:35',
      sender: 'DrFun1_Admin',
      channel: '#drfun1-tv',
      content: 'Prime TV 4K master feed live on Switch SUPERNAP optical encoder. Re-broadcasting live launch streams across TVU Grid.',
      type: 'message',
    },
  ],
  '#drfun1-radio': [
    {
      id: 'dr_1',
      timestamp: '12:00:12',
      sender: '***',
      channel: '#drfun1-radio',
      content: 'Topic: DrFun1 Master Radio & MPD Audio Stream | 320kbps Studio Sound with Live DJ & IRC Song Requests',
      type: 'system',
    },
    {
      id: 'dr_2',
      timestamp: '12:00:40',
      sender: 'DJ_OrbitNova',
      channel: '#drfun1-radio',
      content: '[NOW PLAYING] 2Pac - California Love (320 kbps MP3 Studio Master). Send requests via !request <artist - song> or join the queue!',
      type: 'notice',
    },
    {
      id: 'dr_3',
      timestamp: '12:01:05',
      sender: 'DrFun1_Tech',
      channel: '#drfun1-radio',
      content: 'IRCOp monitoring deck telemetry. Icecast mount /live stable at 320kbps Opus, 0 dropped frames.',
      type: 'message',
    },
  ],
  '#switch-supernap': [
    {
      id: 'sn_1',
      timestamp: '12:00:00',
      sender: '***',
      channel: '#switch-supernap',
      content: 'Topic: Switch SUPERNAP 100G/400G Optical DWDM Ring & Core Teleport Earth Station Hub (www.switch.com)',
      type: 'system',
    },
    {
      id: 'sn_2',
      timestamp: '12:00:25',
      sender: 'Switch_NOC_Bot',
      channel: '#switch-supernap',
      content: 'Switch SUPERNAP Las Vegas Earth Station 13-meter tracking antennas active. Redundant power 100% on renewable grid.',
      type: 'notice',
    },
  ],
  '#qualcomm-snapdragon': [
    {
      id: 'qcom_1',
      timestamp: '12:01:10',
      sender: '***',
      channel: '#qualcomm-snapdragon',
      content: 'Topic: Qualcomm Snapdragon Satellite 3GPP Rel-17/18 NTN & Snapdragon X80 5G Modem-RF Platform',
      type: 'system',
    },
    {
      id: 'qcom_2',
      timestamp: '12:01:40',
      sender: 'WirelessCarrierOps',
      channel: '#qualcomm-snapdragon',
      content: 'Snapdragon X80 5G Modem-RF test bench running NB-NTN direct-to-orbit failover at 10 Gbps peak speed.',
      type: 'message',
    },
  ],
  '#all-bands': [
    {
      id: 'ab_1',
      timestamp: '12:01:00',
      sender: '***',
      channel: '#all-bands',
      content: 'Topic: Consolidated RF Spectrum Channel: L, S, C, X, Ku, Ka, V/Q, Optical 1550nm & 5G NTN',
      type: 'system',
    },
    {
      id: 'ab_2',
      timestamp: '12:01:25',
      sender: 'Switch_NOC_Bot',
      channel: '#all-bands',
      content: 'Spectrum monitor scan complete across 1 GHz - 75 GHz plus 1550nm infrared laser. All Switch teleports reporting optimal CNR.',
      type: 'notice',
    },
  ],
  '#ka-band': [
    {
      id: 'ka_1',
      timestamp: '12:00:30',
      sender: '***',
      channel: '#ka-band',
      content: 'Topic: 26.5 - 40.0 GHz | High-Throughput Spot-Beams, O3b mPOWER, Starlink & Viasat-3 Ka Transponders',
      type: 'system',
    },
  ],
  '#5g-ntn': [
    {
      id: 'ntn_1',
      timestamp: '12:00:45',
      sender: '***',
      channel: '#5g-ntn',
      content: 'Topic: 3GPP Release 17/18 Non-Terrestrial Networks | Direct-to-Cellular & Wireless Carrier Services',
      type: 'system',
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

export const ZNC_BOUNCER_CONFIG: ZncBouncerConfig = {
  version: 'ZNC 1.9.1 (git hash #e5b9f71 - https://github.com/znc/znc.git)',
  repoUrl: 'https://github.com/znc/znc.git',
  serverHost: 'irc.drfun1media.com',
  listenPort: 6697,
  webAdminPort: 5000,
  ssl: true,
  upstreamHub: 'irc.drfun1.com',
  upstreamPort: 6697,
  activeUsers: 84,
  totalBuffers: 70,
  status: 'active',
  loadedModules: [
    {
      name: 'playback',
      description: 'Buffer playback engine: sends backlog upon client reconnection with timestamp tags',
      type: 'user',
      status: 'loaded',
      args: 'play_on_attach = true',
    },
    {
      name: 'buffextras',
      description: 'Adds joines, parts, modes, and nick changes into channel playback buffer',
      type: 'user',
      status: 'loaded',
    },
    {
      name: 'sasl',
      description: 'Authenticates securely to UnrealIRCd 6.1.4 upstream hub via SASL ECDSA-NIST256P',
      type: 'network',
      status: 'loaded',
      args: 'mechanism = ECDSA-NIST256P-CHALLENGE',
    },
    {
      name: 'chansaver',
      description: 'Keeps all 1:1 broadcast channels saved to config when added/removed',
      type: 'user',
      status: 'loaded',
    },
    {
      name: 'autoattach',
      description: 'Re-attaches client to channels automatically when activity is detected',
      type: 'network',
      status: 'loaded',
    },
    {
      name: 'route_replies',
      description: 'Routes server replies back specifically to the client query sender',
      type: 'user',
      status: 'loaded',
    },
    {
      name: 'controlpanel',
      description: 'Dynamic in-IRC control panel (/msg *controlpanel help) for runtime management',
      type: 'global',
      status: 'loaded',
    },
    {
      name: 'webadmin',
      description: 'HTTPS Web administration GUI listening on port 5000 with Let\'s Encrypt SSL',
      type: 'global',
      status: 'loaded',
      args: 'Port = 5000, SSL = true',
    },
    {
      name: 'cert',
      description: 'Use client SSL certificate fingerprint for automated passwordless authentication',
      type: 'user',
      status: 'loaded',
    },
    {
      name: 'keepnick',
      description: 'Keeps trying for primary registered nickname if lost during hub split',
      type: 'network',
      status: 'loaded',
    },
  ],
  userSessions: [
    {
      username: 'drfun1_admin',
      realname: 'DrFun1 Media Broadcast Ops (Richard Alan Witt)',
      bindHost: 'irc.drfun1media.com',
      bufferSize: 5000,
      channelsCount: 70,
      connectedClients: 4,
      lastActive: 'Just now',
      networks: ['DrFun1-Mesh'],
      bufferedChannels: [
        '#drfun1-primetv',
        '#c-band-space',
        '#ku-band',
        '#ka-band',
        '#5g-ntn',
        '#fcc-broadcast-reg',
        '#switch-teleport-noc',
      ],
    },
    {
      username: 'whitehouse_pool',
      realname: 'WhiteHouse.gov Media Press Pool Syndicate',
      bindHost: 'irc.drfun1media.com',
      bufferSize: 2000,
      channelsCount: 12,
      connectedClients: 2,
      lastActive: '2m ago',
      networks: ['DrFun1-Mesh'],
      bufferedChannels: ['#whitehouse-briefings', '#wh-presspool', '#drfun1-primetv'],
    },
    {
      username: 'fcc_telecom_bot',
      realname: 'FCC.gov Spectrum & Broadcast Alert Daemon',
      bindHost: 'irc.drfun1media.com',
      bufferSize: 1000,
      channelsCount: 8,
      connectedClients: 1,
      lastActive: '5m ago',
      networks: ['DrFun1-Mesh'],
      bufferedChannels: ['#fcc-spectrum-alerts', '#fcc-broadcast-reg', '#wittlaw-spectrum'],
    },
    {
      username: 'dj_mpd_automation',
      realname: 'Icecast MPD DJ Automation Bot',
      bindHost: 'irc.drfun1media.com',
      bufferSize: 500,
      channelsCount: 5,
      connectedClients: 1,
      lastActive: 'Just now',
      networks: ['DrFun1-Mesh'],
      bufferedChannels: ['#mpd-dj-booth', '#drfun1-music-fm', '#drfun1-primetv'],
    },
  ],
  zncConfSnippet: `// ==============================================================
// ZNC 1.9.1 Configuration for irc.drfun1media.com
// Upstream Hub: irc.drfun1.com:6697 (UnrealIRCd 6.1.4 leafed node)
// Cloned & built from: https://github.com/znc/znc.git
// Licensed to: Richard Alan Witt (www.wittlawfirm.com)
// ==============================================================

Version = 1.9.1
<Listener l-irc>
    Port = 6697
    SSL = true
    IPv4 = true
    IPv6 = true
</Listener>

<Listener l-web>
    Port = 5000
    SSL = true
    IPv4 = true
    IPv6 = true
</Listener>

LoadModule = webadmin
LoadModule = controlpanel

<User drfun1_admin>
    Admin = true
    Nick = DrFun1Media
    AltNick = DrFun1_Media2
    Ident = drfun1
    RealName = DrFun1 Media Operator
    Buffer = 5000
    AutoClearChanBuffer = false
    AutoClearQueryBuffer = false
    QuitMsg = DrFun1 Media ZNC Bouncer Persist (irc.drfun1media.com)
    
    LoadModule = chansaver
    LoadModule = playback
    LoadModule = buffextras
    LoadModule = route_replies

    <Network DrFun1-Mesh>
        Server = irc.drfun1.com +6697 WittLaw_Switch_Leaf_DrFun1Media_Sync_2026
        LoadModule = sasl
        LoadModule = autoattach
        LoadModule = keepnick
        
        <Chan #drfun1-primetv>
            Buffer = 5000
        </Chan>
        <Chan #c-band-space>
            Buffer = 2000
        </Chan>
        <Chan #ku-band>
            Buffer = 2000
        </Chan>
        <Chan #ka-band>
            Buffer = 2000
        </Chan>
        <Chan #5g-ntn>
            Buffer = 2000
        </Chan>
    </Network>
</User>`,
};

export const STATS_DRFUN1IRCD_PORTAL: StatsPortalInfo = {
  domain: 'stats.drfun1ircd.com',
  portalUrl: 'https://stats.drfun1ircd.com',
  title: 'DrFun1IRCD Global Telemetry & Network Health Portal',
  description: 'Official UnrealIRCd 6.1.4, NeoStats 3.0 (github.com/Macs/NeoStats.git), and ZNC 1.9.1 cluster monitor for irc.drfun1.com & irc.drfun1media.com across 26 Switch SUPERNAP Leaf Nodes.',
  primaryHub: 'irc.drfun1.com (SID: 001 - Switch Las Vegas Core)',
  mediaLeaf: 'irc.drfun1media.com (SID: 026 - UnrealIRCd 6.1.4 + ZNC 1.9.1)',
  zncBouncer: 'irc.drfun1media.com:6697 (SSL) / WebAdmin :5000',
  neostatsService: 'neostats.drfun1.com (SID: 099 - StatServ / ConnectServ / SecureServ)',
  neostatsRepo: 'https://github.com/Macs/NeoStats.git',
  denoraService: 'denora.drfun1.com (SID: 098 - StatServ / phpDenora MariaDB Sync)',
  denoraRepo: 'https://github.com/denora/denora.git',
  lastTelemetrySync: 'Live WebSocket / JSON-RPC Sync',
  globalUptime: '148d 12h 23m 40s (99.999% SLA)',
  totalClients: 8838,
  totalServers: 26,
  totalChannels: 855000,
};

export const NEOSTATS_CONFIG: NeoStatsConfig = {
  version: 'NeoStats 3.0.2',
  gitRepo: 'https://github.com/Macs/NeoStats.git',
  serverName: 'neostats.drfun1.com',
  sid: '099',
  hubServer: 'irc.drfun1.com',
  hubPort: 6697,
  ssl: true,
  dbBackend: 'SQLite3 / MySQL 8.0 Cluster with TimescaleDB Time-Series Metric Engine',
  status: 'active',
  uptime: '148d 12h 19m 14s',
  peakUsers: 14290,
  peakChannels: 855420,
  peakServers: 26,
  totalConnectionsLogged: 3491820,
  modules: [
    {
      name: 'statserv',
      description: 'Network-wide statistics engine tracking concurrent user peaks, daily connection rates, netsplit history, and broadcast channel message frequencies.',
      serviceNick: 'StatServ',
      version: '3.0.2',
      status: 'active',
      commandCount: 142904,
      memoryUsageKb: 14280
    },
    {
      name: 'connectserv',
      description: 'Real-time server link telemetry, routing latency monitor, sync burst analyzer, and automatic lag alert system across the 26 Switch SUPERNAP leaf nodes.',
      serviceNick: 'ConnectServ',
      version: '3.0.2',
      status: 'active',
      commandCount: 38410,
      memoryUsageKb: 8192
    },
    {
      name: 'secureserv',
      description: 'Automated drone/botnet shield, DNSBL real-time blocklist verification, open proxy scanner, and Tor exit node tracking with instant OperServ alert integration.',
      serviceNick: 'SecureServ',
      version: '3.0.2',
      status: 'active',
      commandCount: 92450,
      memoryUsageKb: 18450
    },
    {
      name: 'seenserv',
      description: 'Persistent user presence tracker monitoring last seen timestamp, quit message, and active channels across the entire DrFun1 Media broadcast network.',
      serviceNick: 'SeenServ',
      version: '3.0.2',
      status: 'active',
      commandCount: 48920,
      memoryUsageKb: 9200
    },
    {
      name: 'webstats',
      description: 'Live HTML & JSON-RPC telemetry generator serving real-time statistics feeds to stats.drfun1ircd.com and NOC monitoring dashboards.',
      serviceNick: 'WebStats',
      version: '3.0.2',
      status: 'active',
      commandCount: 284100,
      memoryUsageKb: 6144
    },
    {
      name: 'hostserv',
      description: 'Broadcaster virtual host (vHost) manager assigning verified *.drfun1media.com and *.wittlawfirm.com cryptographic hostmasks to studio anchors.',
      serviceNick: 'HostServ',
      version: '3.0.2',
      status: 'loaded',
      commandCount: 12410,
      memoryUsageKb: 4096
    }
  ],
  statServMetrics: {
    hourlyConnects: [
      120, 184, 210, 340, 480, 720, 950, 1420, 1850, 2410, 3120, 3890,
      4210, 4820, 5600, 6800, 7420, 8100, 8838, 8640, 7920, 7200, 6400, 5800
    ],
    topChannels: [
      { channel: '#drfun1-primetv', users: 1840, msgRate: '42.4 msg/s' },
      { channel: '#whitehouse-briefings', users: 1290, msgRate: '28.1 msg/s' },
      { channel: '#c-band-space', users: 840, msgRate: '18.6 msg/s' },
      { channel: '#5g-ntn', users: 780, msgRate: '14.2 msg/s' },
      { channel: '#fcc-spectrum-alerts', users: 620, msgRate: '9.4 msg/s' },
      { channel: '#switch-supernap', users: 540, msgRate: '12.0 msg/s' },
      { channel: '#ku-band', users: 510, msgRate: '8.1 msg/s' },
      { channel: '#mpd-dj-booth', users: 490, msgRate: '16.5 msg/s' }
    ],
    topOpers: [
      { nick: 'DrFun1Admin', server: 'irc.drfun1.com', actions: 142 },
      { nick: 'WittLaw_NetAdmin', server: 'node1.lasvegas.switch.drfun1.com', actions: 98 },
      { nick: 'Switch_NOC_Lead', server: 'node2.tahoereno.switch.drfun1.com', actions: 64 },
      { nick: 'SpaceTeleport_Oper', server: 'node5.space-teleport.switch.drfun1.com', actions: 41 }
    ],
    splitEvents: 0,
    dnsblBlocks: 8420
  },
  confSnippet: `/* ==============================================================
 * NeoStats 3.0.2 Configuration for irc.drfun1.com Network
 * Source Repository: https://github.com/Macs/NeoStats.git
 * Authors: Justin "Macs" and NeoStats Development Team
 * Licensed to: Richard Alan Witt (www.wittlawfirm.com)
 * ============================================================== */

// Git Clone & Build Instructions:
// $ git clone https://github.com/Macs/NeoStats.git
// $ cd NeoStats
// $ ./configure --prefix=/opt/neostats --enable-epoll --with-unreal --with-openssl
// $ make && make install

serverinfo {
    name "neostats.drfun1.com";
    sid "099";
    description "Official NeoStats 3.0 Telemetry & StatServ Daemon for irc.drfun1.com";
    network "DrFun1-Orbit-Mesh";
};

uplink irc.drfun1.com {
    host "127.0.0.1";
    port 6697;
    password "WittLaw_Switch_NeoStats_Sync_2026";
    ssl yes;
    protocol "unreal";
};

database {
    driver "sqlite3";
    file "/opt/neostats/data/neostats.db";
    sync_interval 60;
};

module "statserv" {
    nick "StatServ";
    user "stats";
    host "services.drfun1.com";
    realname "NeoStats StatServ Telemetry Engine (github.com/Macs/NeoStats.git)";
    log_traffic yes;
    track_peaks yes;
};

module "connectserv" {
    nick "ConnectServ";
    user "connect";
    host "services.drfun1.com";
    realname "NeoStats ConnectServ Link & Ping Monitor";
    lag_check_interval 30;
    max_split_threshold 180;
};

module "secureserv" {
    nick "SecureServ";
    user "secure";
    host "services.drfun1.com";
    realname "NeoStats SecureServ Drone & DNSBL Sentry";
    dnsbl "dronebl.org";
    dnsbl "dnsbl.dronebl.org";
    action "kline";
    kline_duration 86400;
};

module "seenserv" {
    nick "SeenServ";
    user "seen";
    host "services.drfun1.com";
    realname "NeoStats SeenServ Nick Activity Tracker";
};

module "webstats" {
    html_output "/var/www/stats.drfun1ircd.com/html";
    json_output "/var/www/stats.drfun1ircd.com/telemetry.json";
    refresh_rate 10;
};`,
  unrealLinkSnippet: `/* ==============================================================
 * UnrealIRCd 6.1.4 Link Block for NeoStats 3.0 (github.com/Macs/NeoStats.git)
 * Place this block into unrealircd.conf on irc.drfun1.com
 * ============================================================== */

link neostats.drfun1.com {
    incoming {
        mask 127.0.0.1;
        mask *.drfun1.com;
    };
    outgoing {
        hostname "127.0.0.1";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_NeoStats_Sync_2026";
    class servers;
    type services;
};

/* NeoStats U-lines Configuration */
ulines {
    neostats.drfun1.com;
};`
};

export const DENORA_CONFIG: DenoraConfig = {
  version: 'Denora 1.5.1-git',
  gitRepo: 'https://github.com/denora/denora.git',
  serverName: 'denora.drfun1.com',
  sid: '098',
  hubServer: 'irc.drfun1.com',
  hubPort: 6697,
  ssl: true,
  dbBackend: 'MariaDB 10.11 / MySQL 8.0 InnoDB + phpDenora Web Integration',
  status: 'active',
  uptime: '148d 12h 19m 14s',
  peakUsersAllTime: 14290,
  peakUsersAllTimeDate: '2026-11-04 18:42:10 UTC',
  peakUsersToday: 9412,
  peakChannelsAllTime: 855420,
  currentChannels: 855000,
  totalConnectionsLogged: 3491820,
  syncIntervalSeconds: 30,
  tldStats: [
    { tld: '.com', country: 'Commercial / Global Anycast', userCount: 3682, percentage: 41.6, flag: '🌐' },
    { tld: '.net', country: 'Network Infrastructure & Telecom', userCount: 1842, percentage: 20.8, flag: '⚡' },
    { tld: '.org', country: 'Non-profit & Open Source Orgs', userCount: 920, percentage: 10.4, flag: '🛡️' },
    { tld: '.tv', country: 'Tuvalu / Linear Broadcast Playout', userCount: 742, percentage: 8.4, flag: '📺' },
    { tld: '.de', country: 'Germany (Frankfurt Switch Teleport)', userCount: 512, percentage: 5.8, flag: '🇩🇪' },
    { tld: '.uk', country: 'United Kingdom (London Docklands)', userCount: 384, percentage: 4.3, flag: '🇬🇧' },
    { tld: '.jp', country: 'Japan (Tokyo Equinix Ingest)', userCount: 298, percentage: 3.4, flag: '🇯🇵' },
    { tld: '.ca', country: 'Canada (Toronto C-Band Ingest)', userCount: 246, percentage: 2.8, flag: '🇨🇦' },
    { tld: '.nl', country: 'Netherlands (Amsterdam Teleport)', userCount: 212, percentage: 2.4, flag: '🇳🇱' },
  ],
  clientStats: [
    { clientName: 'mIRC 7.76+', category: 'Desktop', userCount: 2410, percentage: 27.3 },
    { clientName: 'WeeChat 4.2+ (CLI/Headless)', category: 'CLI', userCount: 1820, percentage: 20.6 },
    { clientName: 'HexChat 2.16+', category: 'Desktop', userCount: 1540, percentage: 17.4 },
    { clientName: 'Irssi 1.4+ (UNIX Shell)', category: 'CLI', userCount: 1180, percentage: 13.4 },
    { clientName: 'The Lounge Web (Self-Hosted)', category: 'Web', userCount: 840, percentage: 9.5 },
    { clientName: 'ZNC 1.9.1 Bouncer (znc.git)', category: 'Bouncer', userCount: 620, percentage: 7.0 },
    { clientName: 'KiwiIRC / DrFun1 Studio WebIRC', category: 'Web', userCount: 428, percentage: 4.8 },
  ],
  topChannels: [
    { channel: '#drfun1-primetv', users: 1840, linesToday: 184290, wordsToday: 1294000, topicChanges: 4, msgRate: '42.4 msg/s', modes: '+sntk 100G' },
    { channel: '#whitehouse-briefings', users: 1290, linesToday: 98400, wordsToday: 842000, topicChanges: 2, msgRate: '28.1 msg/s', modes: '+cnt' },
    { channel: '#c-band-space', users: 840, linesToday: 64120, wordsToday: 482000, topicChanges: 1, msgRate: '18.6 msg/s', modes: '+cnt' },
    { channel: '#5g-ntn', users: 780, linesToday: 52900, wordsToday: 394000, topicChanges: 3, msgRate: '14.2 msg/s', modes: '+cnt' },
    { channel: '#fcc-spectrum-alerts', users: 620, linesToday: 41200, wordsToday: 310000, topicChanges: 5, msgRate: '9.4 msg/s', modes: '+cnt' },
    { channel: '#switch-supernap', users: 540, linesToday: 38100, wordsToday: 290000, topicChanges: 2, msgRate: '12.0 msg/s', modes: '+cnt' },
    { channel: '#ku-band', users: 510, linesToday: 29400, wordsToday: 218000, topicChanges: 1, msgRate: '8.1 msg/s', modes: '+cnt' },
    { channel: '#mpd-dj-booth', users: 490, linesToday: 34800, wordsToday: 260000, topicChanges: 8, msgRate: '16.5 msg/s', modes: '+cnt' }
  ],
  topChatters: [
    { nick: 'DrFun1Admin', lines: 14890, words: 112400, smileys: 84, kicks: 42, modes: 64, lastActive: '12s ago' },
    { nick: 'WittLaw_NetAdmin', lines: 11420, words: 98200, smileys: 12, kicks: 28, modes: 52, lastActive: '45s ago' },
    { nick: 'Switch_NOC_Lead', lines: 9840, words: 74100, smileys: 5, kicks: 14, modes: 31, lastActive: '2m ago' },
    { nick: 'SpaceTeleport_Oper', lines: 7650, words: 58900, smileys: 18, kicks: 6, modes: 22, lastActive: '1m ago' },
    { nick: 'Capt_Dave', lines: 6290, words: 48200, smileys: 34, kicks: 2, modes: 8, lastActive: '4m ago' },
    { nick: 'DJ_NeonCircuit', lines: 5840, words: 44100, smileys: 92, kicks: 1, modes: 12, lastActive: '30s ago' },
    { nick: 'SatcomAuditor', lines: 4720, words: 38900, smileys: 2, kicks: 0, modes: 15, lastActive: '8m ago' },
  ],
  confSnippet: `/* ==============================================================
 * Denora IRC Statistics 1.5 Configuration (irc.drfun1.com)
 * Source Repository: https://github.com/denora/denora.git
 * Authors: Denora Development Team (Hal9000, Jorden, DukePyramid)
 * Licensed to: Richard Alan Witt (www.wittlawfirm.com)
 * ============================================================== */

// Git Build:
// $ git clone https://github.com/denora/denora.git
// $ cd denora
// $ ./configure --prefix=/opt/denora --with-mysql --with-unreal32 --enable-ssl
// $ make && make install

// General Denora Settings
name            "denora.drfun1.com";
desc            "DrFun1 Media Official Denora 1.5 IRC Statistics Daemon";
pid             "/opt/denora/data/denora.pid";
motd            "/opt/denora/data/denora.motd";

// Uplink Server (UnrealIRCd 6.1.4 Master Hub)
RemoteServer    "127.0.0.1";
Port            6697;
ServerPass      "WittLaw_Switch_Denora_Sync_2026";
ServerNumeric   "098";
ProtocolMode    "unreal32";
UseTLS          yes;

// StatServ Client Settings
StatServNick    "StatServ";
StatServIdent   "stats";
StatServHost    "stats.drfun1.com";
StatServReal    "Denora IRC Statistics Engine (github.com/denora/denora.git)";
StatServAlias   "Denora";

// MariaDB / MySQL Database Backend (for phpDenora Web Dashboard)
SqlHost         "localhost";
SqlUser         "denora";
SqlPass         "WittLaw_Denora_Sql_2026";
SqlName         "drfun1_denora_stats";
SqlPort         3306;
SqlSock         "/var/run/mysqld/mysqld.sock";
SqlType         "mysql";

// Tracking Features
KeepSpam        yes;
SpamTime        86400;
AutoOpClean     yes;
TrackTLD        yes;
GeoIP           yes;
GeoIPDatabase   "/usr/share/GeoIP/GeoIP.dat";
HTMLPath        "/var/www/stats.drfun1ircd.com/denora";
HTMLTheme       "modern_slate";
HTMLExportFreq  30;`,
  unrealLinkSnippet: `/* ==============================================================
 * UnrealIRCd 6.1.4 Link Block for Denora (github.com/denora/denora.git)
 * Insert into unrealircd.conf on irc.drfun1.com
 * ============================================================== */

link denora.drfun1.com {
    incoming {
        mask 127.0.0.1;
        mask *.drfun1.com;
    };
    outgoing {
        hostname "127.0.0.1";
        port 6697;
        options { ssl; };
    };
    password "WittLaw_Switch_Denora_Sync_2026";
    class servers;
    type services;
};

/* Denora U-lines Configuration */
ulines {
    denora.drfun1.com;
};`,
  sqlSchemaSnippet: `/* ==============================================================
 * Denora 1.5 Database Schema Definition (drfun1_denora_stats)
 * Cloned from: https://github.com/denora/denora.git (sql/mysql.sql)
 * Compatible with phpDenora & stats.drfun1ircd.com
 * ============================================================== */

CREATE DATABASE IF NOT EXISTS drfun1_denora_stats CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE drfun1_denora_stats;

CREATE TABLE IF NOT EXISTS denora_stats (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(32) NOT NULL,
    val BIGINT NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_type (type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS denora_tld (
    country VARCHAR(64) NOT NULL,
    countrycode VARCHAR(8) NOT NULL PRIMARY KEY,
    count INT UNSIGNED NOT NULL DEFAULT 0,
    overall INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS denora_chan (
    chanid INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    channel VARCHAR(64) NOT NULL UNIQUE,
    currentusers INT UNSIGNED NOT NULL DEFAULT 0,
    maxusers INT UNSIGNED NOT NULL DEFAULT 0,
    maxusertime INT UNSIGNED NOT NULL DEFAULT 0,
    topic VARCHAR(512),
    topicauthor VARCHAR(64),
    topictime INT UNSIGNED NOT NULL DEFAULT 0,
    modes VARCHAR(64)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS denora_cstats (
    uname VARCHAR(64) NOT NULL,
    chan VARCHAR(64) NOT NULL,
    letters BIGINT UNSIGNED NOT NULL DEFAULT 0,
    words BIGINT UNSIGNED NOT NULL DEFAULT 0,
    line BIGINT UNSIGNED NOT NULL DEFAULT 0,
    actions BIGINT UNSIGNED NOT NULL DEFAULT 0,
    smileys BIGINT UNSIGNED NOT NULL DEFAULT 0,
    kicks BIGINT UNSIGNED NOT NULL DEFAULT 0,
    modes BIGINT UNSIGNED NOT NULL DEFAULT 0,
    topics BIGINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (uname, chan)
) ENGINE=InnoDB;`,
  gitBuildInstructions: `# ==============================================================
# Building Denora IRC Stats from GitHub Repository
# URL: https://github.com/denora/denora.git
# Supported Platforms: Linux / FreeBSD / OpenBSD / Switch SUPERNAP
# ==============================================================

# 1. Install prerequisites
sudo apt-get update
sudo apt-get install -y build-essential libmysqlclient-dev libssl-dev git autoconf automake libtool geoip-bin libgeoip-dev

# 2. Clone Denora from official GitHub repository
git clone https://github.com/denora/denora.git /opt/denora-src
cd /opt/denora-src

# 3. Configure Denora for UnrealIRCd protocol and MySQL
./configure --prefix=/opt/denora \\
            --with-mysql \\
            --with-unreal32 \\
            --enable-ssl \\
            --enable-geoip

# 4. Compile and install
make -j$(nproc)
sudo make install

# 5. Initialize MySQL / MariaDB tables
mysql -u root -p drfun1_denora_stats < /opt/denora-src/sql/mysql.sql

# 6. Deploy denora.conf and start daemon
cp /opt/denora/etc/denora.conf.dist /opt/denora/etc/denora.conf
/opt/denora/bin/denora`
};


