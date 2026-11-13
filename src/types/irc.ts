export type CoreHubDomain =
  | 'irc.drfun1.com'
  | 'irc.drfun1media.com'
  | 'irc.drfun1media.net'
  | 'drfun1ircd.com';

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
  transitProvider: string;
  // UnrealIRCd Hub-and-Leaf Peering to irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net & drfun1ircd.com
  leafHub: CoreHubDomain | string;
  leafHubs?: (CoreHubDomain | string)[];
  dualHubLinked?: boolean;
  hubPort: number;
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
  provider?: 'datapacket' | 'unrealircd' | 'switch' | 'risingnet';
  region?: string;
  country?: string;
  uplinkSpeed?: string;
  adPolicy?: string;
  legalCounsel?: string;
  paymentOffice?: string;
  billingOffice?: string;
}

export interface UnrealIrcdHub {
  host: CoreHubDomain | string;
  sid: '001' | '002' | '003' | '004' | string;
  port: number;
  ssl: boolean;
  networkName: string;
  transitProvider: string;
  colocation: string;
  licensee: string;
  legalCounsel?: string;
  paymentOffice?: string;
  billingOffice?: string;
  leafNodes: string[];
  totalSyncedChannels: number;
  totalSyncedUsers: number;
  aggregateBandwidth: string;
  redundantPeerHub?: string;
  anopeServicesHost?: string;
}

export interface AnopeServicesHub {
  host: string;
  sid: string;
  linkedHubs: string[];
  anopeVersion: string;
  nickServCount: number;
  chanServCount: number;
  botServBots: string[];
  operServAkills: number;
  status: 'active' | 'syncing';
}

export interface IrcChannel {
  name: string;
  topic: string;
  category: 'media_channels' | 'frequency_bands' | 'teleport_infrastructure' | 'legal_spectrum' | 'satellite_companies' | 'phone_carriers' | 'broadcast_networks';
  frequencyBand: string;
  userCount: number;
  modes: string;
  isStreamActive: boolean;
  mediaType: string;
  mediaBitrate: string;
  unrealLeafSync: boolean;
  companyName?: string;
  networkType?: 'satellite' | 'carrier' | 'broadcast' | 'teleport' | 'spectrum';
}

export interface IrcUser {
  nick: string;
  prefix: '~' | '&' | '@' | '%' | '+' | '*' | '';
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
  leafHub: 'irc.drfun1.com' | 'irc.drfun1media.com' | string;
  currentNick: string;
  currentChannel: string;
  tlsVerified: boolean;
  hostingProvider: string;
  licenseHolder: string;
}

export interface ZncModule {
  name: string;
  description: string;
  type: 'global' | 'user' | 'network';
  status: 'loaded' | 'built_in';
  args?: string;
}

export interface ZncUserSession {
  username: string;
  realname: string;
  bindHost: string;
  bufferSize: number;
  channelsCount: number;
  connectedClients: number;
  lastActive: string;
  networks: string[];
  bufferedChannels: string[];
}

export interface ZncBouncerConfig {
  version: string;
  repoUrl: string;
  serverHost: string;
  listenPort: number;
  webAdminPort: number;
  ssl: boolean;
  upstreamHub: string;
  upstreamPort: number;
  activeUsers: number;
  totalBuffers: number;
  status: 'active' | 'syncing' | 'reconnecting';
  loadedModules: ZncModule[];
  userSessions: ZncUserSession[];
  zncConfSnippet: string;
}

export interface StatsPortalInfo {
  domain: string;
  portalUrl: string;
  title: string;
  description: string;
  primaryHub: string;
  mediaLeaf: string;
  zncBouncer: string;
  neostatsService?: string;
  neostatsRepo?: string;
  denoraService?: string;
  denoraRepo?: string;
  lastTelemetrySync: string;
  globalUptime: string;
  totalClients: number;
  totalServers: number;
  totalChannels: number;
}

export interface NeoStatsModule {
  name: string;
  description: string;
  serviceNick: string;
  version: string;
  status: 'active' | 'loaded' | 'monitoring';
  commandCount: number;
  memoryUsageKb: number;
}

export interface NeoStatsConfig {
  version: string;
  gitRepo: string;
  serverName: string;
  sid: string;
  hubServer: string;
  hubPort: number;
  ssl: boolean;
  dbBackend: string;
  status: 'linked' | 'synced' | 'active';
  uptime: string;
  peakUsers: number;
  peakChannels: number;
  peakServers: number;
  totalConnectionsLogged: number;
  modules: NeoStatsModule[];
  statServMetrics: {
    hourlyConnects: number[];
    topChannels: { channel: string; users: number; msgRate: string }[];
    topOpers: { nick: string; server: string; actions: number }[];
    splitEvents: number;
    dnsblBlocks: number;
  };
  confSnippet: string;
  unrealLinkSnippet: string;
}

export interface DenoraTldStat {
  tld: string;
  country: string;
  userCount: number;
  percentage: number;
  flag: string;
}

export interface DenoraClientStat {
  clientName: string;
  category: 'Desktop' | 'CLI' | 'Web' | 'Bouncer' | 'Mobile';
  userCount: number;
  percentage: number;
}

export interface DenoraChannelStat {
  channel: string;
  users: number;
  linesToday: number;
  wordsToday: number;
  topicChanges: number;
  msgRate: string;
  modes: string;
}

export interface DenoraChatterStat {
  nick: string;
  lines: number;
  words: number;
  smileys: number;
  kicks: number;
  modes: number;
  lastActive: string;
}

export interface DenoraConfig {
  version: string;
  gitRepo: string;
  serverName: string;
  sid: string;
  hubServer: string;
  hubPort: number;
  ssl: boolean;
  dbBackend: string;
  status: 'linked' | 'synced' | 'active';
  uptime: string;
  peakUsersAllTime: number;
  peakUsersAllTimeDate: string;
  peakUsersToday: number;
  peakChannelsAllTime: number;
  currentChannels: number;
  totalConnectionsLogged: number;
  syncIntervalSeconds: number;
  tldStats: DenoraTldStat[];
  clientStats: DenoraClientStat[];
  topChannels: DenoraChannelStat[];
  topChatters: DenoraChatterStat[];
  confSnippet: string;
  unrealLinkSnippet: string;
  sqlSchemaSnippet: string;
  gitBuildInstructions: string;
}

export interface IrcLoginCredentials {
  nick: string;
  ident: string;
  realname: string;
  serverHost: string;
  serverPort: number;
  useSsl: boolean;
  channel: string;
  password?: string;
  autoConnectOnStartup?: boolean;
  activeNodeId?: string;
}

export interface IrcLoginSession extends IrcLoginCredentials {
  connectedAt: number;
  isConnected: boolean;
}

export type WittLawStaffRole = 
  | 'netadmin_root' 
  | 'head_regulatory_counsel' 
  | 'systems_architect' 
  | 'ip_copyright_counsel' 
  | 'secops_security_admin' 
  | 'automated_audit_daemon';

export interface WittLawAdminMod {
  id: string;
  nick: string;
  name: string;
  title: string;
  firm: string;
  firmUrl: string;
  email: string;
  role: WittLawStaffRole;
  rankBadge: string;
  prefix: '~' | '&' | '@' | '%' | '+';
  hostmask: string;
  operFlags: string;
  fccFrn: string;
  pgpKeyId: string;
  permissions: string[];
  assignedChannels: string[];
  dutyStatus: 'on_duty' | 'active_audit' | 'standby';
  bio: string;
  lastActive: string;
  isBot?: boolean;
}

export interface DevPlatformApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'WS' | 'RPC';
  endpoint: string;
  description: string;
  category: 'unreal_ircd' | 'stats_denora' | 'broadcast_stream' | 'auth_wittlaw';
  authType: 'Bearer Token' | 'TLS Client Cert' | 'WittLaw PGP Sign';
  samplePayload?: string;
  sampleResponse: string;
}

export interface DevSandboxEnvironment {
  id: string;
  name: string;
  branch: string;
  gitCommit: string;
  status: 'online' | 'compiling' | 'testing';
  port: number;
  unrealVersion: string;
  activeDevelopers: number;
  assignedAdmins: string[];
  deployTimestamp: string;
  memoryUsageMb: number;
}

export interface ModerationAuditAction {
  id: string;
  timestamp: string;
  adminNick: string;
  adminTitle: string;
  actionType: 'KICK' | 'KILL' | 'MODE' | 'GLINE' | 'COMPLIANCE_AUDIT' | 'API_KEY_REVOKE' | 'DMCA_TAKEDOWN_REVIEW';
  target: string;
  channel?: string;
  reason: string;
  legalBasis: string;
  statutoryReference: string;
  severity: 'notice' | 'advisory' | 'enforcement' | 'critical';
}

export interface DevPlatformConfig {
  platformName: string;
  platformDomain: 'dev.drfun1media.com';
  sid: '007';
  sslPort: 6697;
  webSocketPort: 8087;
  httpApiPort: 8443;
  sshPort: 2202;
  environment: 'development_staging_sandbox';
  transitProvider: string;
  colocation: string;
  licensee: string;
  counselOfRecord: 'Richard Alan Witt, Esq. (FRN: 0034981290 / RAW-SATCOM-2026-LIC-0881)';
  gitRepository: 'git@dev.drfun1media.com:wittlaw/satcom-platform.git';
  activeBranch: 'main-dev';
  unrealVersion: 'UnrealIRCd 6.1.4 + DrFun1-Mesh v4.2-dev';
  totalActiveDevs: number;
  sandboxEnvironments: DevSandboxEnvironment[];
  apiEndpoints: DevPlatformApiEndpoint[];
  wittLawAdmins: WittLawAdminMod[];
  recentAuditActions: ModerationAuditAction[];
}




