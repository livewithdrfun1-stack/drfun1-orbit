/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Type definitions for Domain Name Search, WHOIS RDAP, and Anycast DNS Registration
 */

export type TldCategory = 
  | 'Popular Commercial'
  | 'Media & Streaming'
  | 'Space & Tech'
  | 'Telecom & Network'
  | 'Web3 & Identity';

export interface DomainTld {
  tld: string; // e.g. '.com', '.tv', '.media'
  category: TldCategory;
  pricePerYear: number;
  renewalPricePerYear: number;
  popular: boolean;
  featured: boolean;
  badge?: string;
  description: string;
  minYears: number;
  maxYears: number;
}

export type DomainStatus = 'available' | 'taken' | 'premium';

export interface WhoisRecord {
  domainName: string;
  registrar: string;
  ianaId: string;
  registrationDate: string;
  expirationDate: string;
  updatedDate: string;
  status: string[];
  nameservers: string[];
  dnssec: boolean;
  registrantOrg: string;
  registrantCountry: string;
  ipAddress?: string;
  asn?: string;
}

export interface DnsPresetTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  records: {
    type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX';
    host: string;
    target: string;
    ttl: number;
    priority?: number;
  }[];
}

export interface DomainSearchResult {
  domainName: string;
  nameWithoutTld: string;
  tld: string;
  status: DomainStatus;
  pricePerYear: number;
  renewalPricePerYear: number;
  isPopular?: boolean;
  isRecommended?: boolean;
  whois?: WhoisRecord;
}

export interface DomainCartItem {
  domainName: string;
  tld: string;
  years: number;
  pricePerYear: number;
  totalPrice: number;
  whoisPrivacy: boolean; // Free WHOIS Privacy Guard
  autoRenew: boolean;
  dnsPreset: 'drfun1tv_studio' | 'unrealircd_mesh' | 'znc_bouncer' | 'custom_anycast' | 'blank';
  nameservers: 'switch_drfun1_anycast' | 'cloudflare_zero_trust' | 'custom_vanity';
}
