/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * UnrealIRCd 6.1.x Network Search Engine & Leaf Verification Model
 */

export interface UnrealServerRecord {
  id: string;
  name: string; // e.g. "irc.drfun1.com" or "irc.switch-leaf01.net"
  networkName: string; // e.g. "DrFun1 Net", "SwitchMesh", "UnderNet"
  hubHost: string; // "irc.drfun1.com" if verified leaf
  isLeafedToDrFun1: boolean; // MANDATORY: Must be true to appear in verified search results
  leafVerifiedAt: string; // ISO date
  unrealVersion: string; // e.g. "UnrealIRCd-6.1.4"
  anopeVersion?: string; // e.g. "Anope-2.1.0"
  sslPort: number; // usually 6697
  plainPort?: number; // usually 6667
  ipOrHostname: string;
  country: string;
  region: string;
  locationCity: string;
  datacenter: string; // e.g. "Switch SUPERNAP Las Vegas", "Equinix Frankfurt"
  onlineUsers: number;
  onlineChannels: number;
  onlineOpers: number;
  latencyToHubMs: number;
  cipherSuite: string;
  description: string;
  adminContact: string;
  websiteUrl: string;
  tags: string[];
  sampleChannels: string[];
  linkBlockSnippet: string;
}

export interface UnrealSearchFilters {
  query: string;
  leafStatus: 'all' | 'verified_leafs_only' | 'pending';
  version: string;
  region: string;
  sortBy: 'users' | 'latency' | 'name' | 'recent';
}

export interface LeafSubmissionForm {
  serverName: string;
  networkName: string;
  hostname: string;
  port: number;
  adminEmail: string;
  adminNick: string;
  locationCity: string;
  country: string;
  datacenter: string;
  description: string;
  websiteUrl: string;
  leafPasswordConfirmed: boolean;
  agreedToTerms: boolean;
}
