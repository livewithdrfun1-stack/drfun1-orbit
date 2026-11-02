export type EpgMediaGroup = 
  | 'DrFun1 ECOM (FCC Licensed)'
  | 'Paramount Global'
  | 'The Walt Disney Company'
  | 'Warner Bros. Discovery'
  | 'Comcast / Xfinity'
  | 'Dish Network'
  | 'SATCOM Satellite Feeds'
  | 'Custom User Channels';

export type BroadcastEngineMode = 
  | 'strimm_drfun1tv'
  | 'tvu_networks'
  | 'cablecast_peg'
  | 'cadjin_master_control'
  | 'restream_multistream';

export interface MasterEpgChannel {
  id: string;
  channelNumber: number;
  name: string;
  callSign: string;
  fccFacilityId: string;
  fccFrn: string;
  fccRulePart: string;
  networkOwner: EpgMediaGroup;
  category: 'Entertainment' | 'News' | 'Sports' | 'Movies & Drama' | 'Community PEG' | 'Science & Space' | 'Music & Radio' | 'Family & Kids';
  frequencyBand: string;
  carrierFrequency: string;
  transponder: string;
  resolution: string;
  bitrate: string;
  audioCodec: string;
  currentProgram: string;
  currentHost: string;
  currentDuration: string;
  upNextProgram: string;
  unrealIrcChannel: string; // One dedicated IRC channel per broadcast channel!
  streamEndpoint: string;
  hlsStreamUrl: string;
  rtmpUplinkUrl: string;
  status: 'live' | 'on_air' | 'standby';
  viewers: number;
  logoBugText: string;
  newsTickerCrawl: string;
  scte35Enabled: boolean;
  tvuGridRoutable: boolean;
  cablecastAutomation: boolean;
  restreamDestinationsCount: number;
  isCustomChannel?: boolean;
}

export interface CustomChannelDraft {
  name: string;
  callSign: string;
  category: MasterEpgChannel['category'];
  resolution: string;
  bitrate: string;
  playoutEngine: BroadcastEngineMode;
  logoBugText: string;
  newsTickerCrawl: string;
  scte35AdIntervalMinutes: number;
  unrealIrcChannel: string;
  enableRestreamIo: boolean;
  restreamDestinations: string[];
  initialProgramName: string;
  initialHost: string;
}
