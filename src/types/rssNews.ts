export type RssSourceId = 'all' | 'fcc' | 'spacenews' | 'viasatellite' | 'satnews';

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
  category: 'Regulatory' | 'Commercial Satcom' | 'Space Tech' | 'Satellite Operators';
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
