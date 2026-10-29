export interface StreamDestination {
  id: string;
  name: string;
  platform: 'facebook' | 'youtube' | 'twitch' | 'x' | 'switch' | 'risingnet' | 'custom_rtmp' | 'unreal_irc' | 'tvu_cloud' | 'rtmp_tv';
  iconName: string;
  streamUrl: string;
  streamKey: string;
  enabled: boolean;
  status: 'offline' | 'connecting' | 'live' | 'error';
  viewers: number;
  health: 'optimal' | 'good' | 'degraded' | 'offline';
  bitrateKbps: number;
  serverLocation?: string;
}

export interface StreamChatMessage {
  id: string;
  sender: string;
  avatar: string;
  platform: 'facebook' | 'youtube' | 'twitch' | 'x' | 'unreal_irc' | 'switch_noc';
  message: string;
  timestamp: string;
  isModerator?: boolean;
  isVip?: boolean;
  badge?: string;
}

export interface StreamOverlay {
  id: string;
  name: string;
  type: 'lower_third' | 'logo_watermark' | 'ticker' | 'countdown' | 'teleport_bug';
  enabled: boolean;
  content: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-banner';
}

export interface StreamHealthMetrics {
  status: 'idle' | 'streaming' | 'reconnecting';
  uptimeSeconds: number;
  videoFps: number;
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  droppedFrames: number;
  resolution: string;
  carrierSource: 'Switch 100G Fiber' | 'Starlink LEO Ku-band' | 'Viasat GEO Ka-band' | 'Inmarsat ELERA L-band' | 'RisingNet Transit';
  latencyMs: number;
}

export interface EcomTransmissionState {
  featuredProductId: string;
  isOverlayVisible: boolean;
  discountPercent: number;
  discountCode: string;
  flashSaleActive: boolean;
  broadcastGmv: number;
  itemsSold: number;
  liveBuyersCount: number;
  autoPushToChat: boolean;
}

export interface RtmpTvHostConfig {
  channelId: string;
  channelName: string;
  callSign: string;
  frequencyBand: string;
  playoutMode: 'live_studio' | 'color_bars' | 'switch_teleport' | 'launch_feed' | 'orbit_telemetry' | 'eas_emergency';
  resolution: '4K UHD (2160p60)' | 'FHD (1080p60)' | 'HD (720p60)';
  videoBitrateMbps: number;
  audioCodec: 'AAC-LC 320kbps' | 'Opus 256kbps' | 'Dolby Digital AC3 5.1';
  broadcastDelaySeconds: number;
  primaryRtmpIngest: string;
  backupRtmpsIngest: string;
  streamKey: string;
  audioLimiterEnabled: boolean;
  programVolume: number;
  emergencyAlertActive: boolean;
}

export interface BondedInterface {
  id: string;
  name: string;
  type: 'fiber' | 'satellite_leo' | 'satellite_geo' | 'cellular_5g';
  carrier: string;
  bitrateMbps: number;
  packetLossPercent: number;
  latencyMs: number;
  priority: number;
  status: 'active' | 'backup' | 'disabled';
}

export interface TvuCloudEdgeNode {
  id: string;
  name: string;
  location: string;
  datacenter: string;
  egressGbps: number;
  loadPercent: number;
  latencyMs: number;
  health: 'optimal' | 'good' | 'degraded';
}

export interface TvuCloudCdnConfig {
  providerName: string;
  portalUrl: string;
  producerApiVersion: string;
  gridReceiverToken: string;
  isspBondingEnabled: boolean;
  cloudRouterIp: string;
  bondedInterfaces: BondedInterface[];
  edgeNodes: TvuCloudEdgeNode[];
  activeCodeLanguage: 'nodejs' | 'curl' | 'python' | 'ffmpeg' | 'json';
}

