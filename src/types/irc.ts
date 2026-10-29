export interface SwitchDedicatedNode {
  id: string;
  name: string;
  subdomain: string;
  host: string;
  port: number;
  location: string;
  campusName: string;
  tier: string;
  fiberCapacity: string;
  status: 'active' | 'standby' | 'syncing';
  latencyMs: number;
  usersOnline: number;
  leafPeers: number;
  unrealVersion: string;
  sslFingerprint: string;
  transitProvider: 'RisingNet Optical Backbone (www.risingnet.com)';
  // UnrealIRCd Hub-and-Leaf Peering to irc.drfun1.com
  leafHub: 'irc.drfun1.com';
  hubPort: 6697;
  sid: string;
  leafStatus: 'linked' | 'synced' | 'bursting';
  leafBurstStats: {
    syncedChannels: number;
    syncedNicks: number;
    syncLatencyMs: number;
    lastBurst: string;
    linkProtocol: string;
    encryption: string;
  };
  unrealLinkBlock: string;
}

export interface UnrealIrcdHub {
  host: 'irc.drfun1.com';
  sid: '001';
  port: 6697;
  ssl: boolean;
  networkName: 'DrFun1-Orbit-Mesh';
  transitProvider: 'RisingNet Global Transit (www.risingnet.com)';
  colocation: 'Switch SUPERNAP Core Campus (www.switch.com)';
  licensee: 'Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)';
  leafNodes: string[];
  totalSyncedChannels: number;
  totalSyncedUsers: number;
  aggregateBandwidth: string;
}

export interface IrcChannel {
  name: string;
  topic: string;
  category: 'media_channels' | 'frequency_bands' | 'teleport_infrastructure' | 'legal_spectrum';
  frequencyBand: 'All Bands' | 'Ka-Band' | 'Ku-Band' | 'C-Band' | 'X-Band' | 'S-Band' | 'L-Band' | 'V/Q-Band' | 'Optical Laser (1550nm)' | '3GPP 5G NTN';
  userCount: number;
  modes: string;
  isStreamActive: boolean;
  mediaType: string;
  mediaBitrate: string;
  unrealLeafSync: boolean;
}

export interface IrcUser {
  nick: string;
  prefix: '@' | '+' | '';
  role: string;
  hostmask: string;
  isBot?: boolean;
  organization: string;
  channels: string[];
}

export interface IrcMessage {
  id: string;
  timestamp: string;
  sender: string;
  channel: string;
  content: string;
  type: 'message' | 'action' | 'notice' | 'system' | 'telemetry' | 'join' | 'part' | 'mode';
  nodeOrigin?: string;
}

export interface WebIrcConnectionState {
  connected: boolean;
  activeNodeId: string;
  leafHub: 'irc.drfun1.com';
  currentNick: string;
  currentChannel: string;
  tlsVerified: boolean;
  hostingProvider: 'RisingNet Global Transit (www.risingnet.com)';
  licenseHolder: 'Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)';
}

