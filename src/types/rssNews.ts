export type RssSourceId = 'all' | 'fcc' | 'spacenews' | 'viasatellite' | 'satnews';

export type NewsCategory = 
  | 'All Categories'
  | 'Constellation Launches'
  | 'Fiber Expansion'
  | 'Regulatory Updates'
  | 'Wireless & 5G NTN'
  | 'Satellite Internet & Teleports';

export interface RssFeedSource {
  id: Exclude<RssSourceId, 'all'>;
  name: string;
  organization: string;
  feedUrl: string;
  websiteUrl: string;
  color: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  category: string;
  description: string;
  pollFrequencySec: number;
}

export interface RssArticleItem {
  id: string;
  sourceId: Exclude<RssSourceId, 'all'>;
  sourceName: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  timestamp: number;
  category: string;
  tags: string[];
  isBreaking?: boolean;
  isNew?: boolean;
  fccDocketNumber?: string;
  regulatoryPart?: string;
  author?: string;
}

export interface RssPollStatus {
  isPolling: boolean;
  lastPolledAt: Date | null;
  pollCount: number;
  error: string | null;
  nextPollCountdown: number;
  autoPollEnabled: boolean;
  pollIntervalSec: number;
}

export type CompanySector = 'Satellite' | 'Fiber' | 'Wireless' | 'Internet';

export interface AssociatedStoreItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  hardwareType: 'Terminal' | 'Dish & Phased Array' | 'Optical Transceiver' | 'Dark Fiber Line' | 'Bare-Metal Server' | '5G Phone' | 'eSIM & Spectrum' | 'Broadcast Video Encoder';
  retailPrice: number;
  drfun1WholesalePrice: number;
  priceUnit: 'one-time' | 'per_month' | 'per_mhz_month' | 'per_device_month';
  inStock: boolean;
  leadTime: string;
  specsSummary: string;
}

export interface AssociatedRssCompany {
  id: string;
  name: string;
  sector: CompanySector;
  headquarters: string;
  websiteUrl: string;
  rssFeedUrl: string;
  rssFeedTitle: string;
  description: string;
  drfun1Association: string; // Specific relationship with DrFun1 Media Ent / DrFun1 ECOM
  keyCapabilities: string[];
  frequencyOrBandwidth: string;
  regulatoryStatus: string;
  activeFeedCount?: number;
  verifiedSla?: string;
  storeOfferings?: AssociatedStoreItem[];
  storeCatalogUrl?: string;
  hasDirectStoreIntegration?: boolean;
}

export interface AssociatedStoreCompany {
  id: string;
  companyName: string;
  sector: CompanySector;
  brandTagline: string;
  headquarters: string;
  officialStoreUrl: string;
  drfun1EcomPartnerType: 'Authorized Reseller' | 'Direct Interconnect Provider' | 'BGP Peering Partner' | 'Wholesale Equipment Distributor' | 'Escrow & Legal Protected Carrier';
  drfun1LegalCompliance: string;
  featuredProducts: AssociatedStoreItem[];
  wholesaleDiscountPercent: number;
  switchColocationInterconnect: string;
  unrealIrcdChannel: string;
}

