import { CoreHubDomain } from './irc';

export type DuplicatorHostingPlanId =
  | 'starter_mirror'
  | 'multi_hub_pro'
  | 'enterprise_cluster';

export type DuplicatorInfraProvider =
  | 'Switch SUPERNAP NV (via CGW Law Offices)'
  | 'DataPacket 100G No-Ads Edge'
  | 'RisingNet 100G DWDM Dedicated';

export interface DuplicatorRelayRule {
  id: string;
  label: string;
  sourceHub: CoreHubDomain;
  sourceChannel: string;
  targetHubs: CoreHubDomain[];
  targetChannel: string;
  duplicatorServerHost: string;
  infraProvider: DuplicatorInfraProvider;
  wordpressWebhookUrl: string;
  wordpressSyncEnabled: boolean;
  preserveNickPrefix: boolean;
  stripIrcColors: boolean;
  floodRatePerSec: number;
  status: 'active' | 'paused';
  planTier: DuplicatorHostingPlanId;
  replicatedMessages24h: number;
  avgRelayLatencyMs: number;
  lastEventAt: string;
  hmacKey: string;
}

export interface DuplicatorPacketEvent {
  id: string;
  timestamp: string;
  ruleId: string;
  ruleLabel: string;
  nick: string;
  sourceHub: CoreHubDomain;
  sourceChannel: string;
  message: string;
  replicatedTo: CoreHubDomain[];
  targetChannel: string;
  latencyMs: number;
  wordpressDispatched: boolean;
  hmacDigest: string;
}

export interface DuplicatorHostingPlan {
  id: DuplicatorHostingPlanId;
  name: string;
  audience: string;
  tagline: string;
  retailPrice: number;
  wholesalePrice: number;
  maxChannels: number;
  maxPacketsPerHour: string;
  maxConcurrentWebSockets: string;
  includedHubs: string;
  hostingNode: string;
  hardwareSpec: string;
  slaGuarantee: string;
  storeProductId: string;
}
