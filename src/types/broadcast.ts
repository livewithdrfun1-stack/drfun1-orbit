export type BroadcastMediaType = 'tv' | 'radio';

export interface BroadcastChannel {
  id: string;
  name: string;
  callSign: string;
  mediaType: BroadcastMediaType;
  tagline: string;
  description: string;
  frequencyBand: string;
  carrierFrequency: string;
  ecomRole: string;
  licensee: string;
  colocationCampus: string;
  transitBackbone: string;
  streamUrl: string;
  hlsManifestUrl: string;
  rtmpUplinkUrl: string;
  bitrate: string;
  resolution?: string; // For TV (e.g. 4K UHD 60fps, 1080p60)
  audioQuality: string; // e.g. 320 kbps AAC+ / FLAC Lossless
  currentShow: string;
  nowPlayingHost: string;
  upcomingShow: string;
  status: 'live' | 'on_air' | 'standby';
  listenersOrViewers: number;
  unrealIrcChannel: string;
  badges: string[];
  themeColor: string; // Tailwind color token (e.g. 'purple', 'sky', 'emerald', 'amber', 'rose', 'red', 'indigo', 'orange')
  simulatedAudioFrequency: number; // Base frequency for Web Audio synthesizer (e.g. 432, 220, 528)
  simulatedAudioType: 'synthwave' | 'ambient' | 'telemetry' | 'morse' | 'voice_dispatch' | 'eas_alert';
  botFleetAllocation?: string; // e.g. 'DeathRowBot (65,000 Channels)', 'WestmoreBot (65,000 Channels)', 'ShortwaveBot (40,000 Channels)', 'WhiteHouseBot (355,000 Channels)', 'StatsBot (355,000 Channels)'
  wittLawCertified?: boolean;
  wittLawFilingId?: string;
  // FCC.gov spectrum authorization fields
  fccCallSign?: string;
  fccRulePart?: string; // e.g. 'Part 25 Satellite Earth Station', 'Part 73 Digital TV', 'Part 73 FM Radio', 'Part 74 Broadcast Auxiliary', 'Part 5 Experimental', 'Part 90 Private Land Mobile', 'Part 11 Emergency Alert'
  fccFacilityId?: string;
  fccFrn?: string;
  fccLicenseStatus?: 'Active / Licensed' | 'Experimental STA' | 'Granted / In Good Standing';
  // Fubo.tv Live Television integration
  isFuboTv?: boolean;
  fuboPackage?: 'Pro' | 'Elite' | 'Premier' | 'Latino' | 'Fubo Sports Network';
  fuboCategory?: 'Sports' | 'Broadcast' | 'News' | 'Entertainment';
  // Cablecast Community Media (cablecast.tv) PEG integration
  isCablecast?: boolean;
  cablecastCategory?: 'Community' | 'Government' | 'Education' | 'Metro Health' | 'Arts & Culture' | 'Legislative' | 'OTT Cloud';
  cablecastStation?: string;
  // TVU Networks (tvunetworks.com) IP Contribution & REMI integration
  isTvuNetworks?: boolean;
  tvuCategory?: 'Global News' | 'Sports REMI' | 'Field Operations' | 'Cloud Playout' | 'AI NewsWire' | 'Emergency & Aerial';
  tvuService?: string;
  // Whitehouse.gov Executive Channels integration
  isWhiteHouseGov?: boolean;
  whitehouseCategory?: 'Presidential Briefings' | 'Cabinet & Policy' | 'National Security & Defense' | 'WHCA & Communications' | 'OSTP & Science' | 'Executive Emergency Alerts';
  presidentialDirective?: string;
  securityClassification?: 'Public Release / Unclassified' | 'Official Executive Pool' | 'WHCA National Feed' | 'FEMA Presidential Alert Network';
}

export interface BroadcastScheduleItem {
  time: string;
  title: string;
  host: string;
  category: string;
  channelId: string;
}

export interface WittLawFirmRegistryInfo {
  firmName: string;
  counselName: string;
  website: string;
  barNumber: string;
  officeAddress: string;
  practiceAreas: string[];
  client: string;
  certificationStatus: string;
  filingDate: string;
  certifiedChannelCount: number;
  totalBotFleetChannels: number;
  botFleetBreakdown: {
    bot: string;
    channels: number;
    description: string;
    status: string;
  }[];
  regulatoryEntities: string[];
  verificationHash: string;
}

export interface FccGovRegistryInfo {
  commission: string;
  portalUrl: string;
  licensee: string;
  legalRepresentative: string;
  frn: string; // FCC Registration Number
  status: string;
  lastSyncTimestamp: string;
  databaseSystems: string[];
  totalAuthorizations: number;
  totalSpectrumBands: number;
  authorizations: {
    callSign: string;
    facilityId: string;
    service: string;
    rulePart: string;
    frequency: string;
    location: string;
    grantDate: string;
    expiryDate: string;
    status: string;
    channelId: string;
    fileNumber: string;
  }[];
}

export interface FuboTvRegistryInfo {
  platform: string;
  website: string;
  tagline: string;
  totalChannels: number;
  availablePackages: string[];
  streamingProtocols: string[];
  cloudDvrCapacity: string;
  simultaneousStreams: string;
  categories: {
    category: string;
    channelCount: number;
    description: string;
  }[];
}

export interface CablecastRegistryInfo {
  platform: string;
  website: string;
  parentCompany: string;
  tagline: string;
  totalChannels: number;
  broadcastSystems: string[];
  ottPlatforms: string[];
  cloudCdn: string;
  pegServiceTypes: {
    type: string;
    channelCount: number;
    description: string;
  }[];
}

export interface TvuNetworksRegistryInfo {
  platform: string;
  website: string;
  parentCompany: string;
  tagline: string;
  totalChannels: number;
  coreTechnologies: string[];
  latencySpec: string;
  distributionScale: string;
  serviceCategories: {
    category: string;
    channelCount: number;
    description: string;
  }[];
}

export interface WhiteHouseGovRegistryInfo {
  institution: string;
  website: string;
  executiveOffice: string;
  agencyPartner: string;
  legalCounsel: string;
  accreditationStatus: string;
  lastSyncTimestamp: string;
  totalChannels: number;
  totalDirectRelays: number;
  executiveDivisions: {
    division: string;
    channelCount: number;
    description: string;
    protocol: string;
  }[];
  authorizations: {
    feedName: string;
    agencyBranch: string;
    serviceRole: string;
    securityClassification: string;
    resolution: string;
    uplinkCampus: string;
    channelId: string;
    presidentialDirective: string;
  }[];
}


