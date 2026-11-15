/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 */

export type NewsOutletRegion =
  | 'Global Wire'
  | 'North America'
  | 'Europe'
  | 'Middle East'
  | 'Asia-Pacific'
  | 'Latin America'
  | 'Africa';

export type NewsOutletCategory =
  | '24/7 Cable News'
  | 'Public Broadcaster'
  | 'Wire & Financial'
  | 'Judicial & Policy'
  | 'Science & Satcom';

export interface GlobalNewsOutlet {
  id: string;
  callSign: string;
  name: string;
  country: string;
  region: NewsOutletRegion;
  language: string;
  category: NewsOutletCategory;
  headquarters: string;
  website: string;
  streamUrl: string;
  hlsFeedUrl: string;
  currentProgram: string;
  anchorOrDesk: string;
  headline: string;
  isBreaking: boolean;
  status: 'ON AIR' | 'STANDBY';
  bitrateMbps: number;
  viewers: number;
  codec: 'AV1 4K60' | 'VP9 HDR' | 'H.264 1080p60';
  switchIngestPop: string;
  accentColor: string;
  isUserAdded?: boolean;
}

export interface DrFun1NewsBulletin {
  id: string;
  outletCallSign: string;
  region: NewsOutletRegion;
  headline: string;
  priority: 'FLASH' | 'URGENT' | 'WORLD DESK';
  timestamp: string;
  author: string;
}
