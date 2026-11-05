/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Domain TLD Catalog, WHOIS RDAP Simulator, and DNS Templates
 */

import { DomainTld, WhoisRecord, DnsPresetTemplate, DomainSearchResult, DomainCartItem } from '../types/domain';
import { StoreProduct } from '../types/store';

export const DOMAIN_TLD_CATALOG: DomainTld[] = [
  // Popular Commercial
  {
    tld: '.com',
    category: 'Popular Commercial',
    pricePerYear: 12.99,
    renewalPricePerYear: 14.99,
    popular: true,
    featured: true,
    badge: 'Most Popular',
    description: 'The global standard for commercial brands, networks, and enterprise businesses.',
    minYears: 1,
    maxYears: 10,
  },
  {
    tld: '.net',
    category: 'Popular Commercial',
    pricePerYear: 14.49,
    renewalPricePerYear: 16.99,
    popular: true,
    featured: false,
    badge: 'Network Core',
    description: 'Ideal for telecom backbones, satellite gateways, ISP carriers, and IRC networks.',
    minYears: 1,
    maxYears: 10,
  },
  {
    tld: '.org',
    category: 'Popular Commercial',
    pricePerYear: 13.99,
    renewalPricePerYear: 15.99,
    popular: true,
    featured: false,
    badge: 'Authority',
    description: 'Trusted by open-source consortiums, legal trusts, and community broadcasters.',
    minYears: 1,
    maxYears: 10,
  },
  // Media & Streaming
  {
    tld: '.tv',
    category: 'Media & Streaming',
    pricePerYear: 28.99,
    renewalPricePerYear: 32.99,
    popular: true,
    featured: true,
    badge: 'Broadcaster Choice',
    description: 'The undisputed premier TLD for television stations, linear stream channels, and video hubs.',
    minYears: 1,
    maxYears: 10,
  },
  {
    tld: '.media',
    category: 'Media & Streaming',
    pricePerYear: 24.99,
    renewalPricePerYear: 27.99,
    popular: true,
    featured: true,
    badge: 'Media Group',
    description: 'Designed specifically for multimedia syndicates, newsrooms, and audio/video networks.',
    minYears: 1,
    maxYears: 10,
  },
  {
    tld: '.live',
    category: 'Media & Streaming',
    pricePerYear: 19.99,
    renewalPricePerYear: 22.99,
    popular: true,
    featured: false,
    badge: 'Live Stream',
    description: 'Immediate call to action for real-time live events, esports, and satellite broadcast feeds.',
    minYears: 1,
    maxYears: 10,
  },
  {
    tld: '.stream',
    category: 'Media & Streaming',
    pricePerYear: 18.50,
    renewalPricePerYear: 21.99,
    popular: false,
    featured: false,
    badge: 'Linear Playout',
    description: 'Optimized for 24/7 web playout channels, MPD radio streams, and video-on-demand.',
    minYears: 1,
    maxYears: 10,
  },
  // Space & Tech
  {
    tld: '.space',
    category: 'Space & Tech',
    pricePerYear: 6.99,
    renewalPricePerYear: 19.99,
    popular: true,
    featured: true,
    badge: 'Satcom Favorite',
    description: 'Special promotion for satellite constellations, aerospace initiatives, and orbital tracking.',
    minYears: 1,
    maxYears: 10,
  },
  {
    tld: '.ai',
    category: 'Space & Tech',
    pricePerYear: 69.99,
    renewalPricePerYear: 69.99,
    popular: true,
    featured: true,
    badge: 'Hot Tech',
    description: 'The highest-demand TLD for artificial intelligence, automated playout, and space robotics.',
    minYears: 2,
    maxYears: 10,
  },
  {
    tld: '.io',
    category: 'Space & Tech',
    pricePerYear: 38.99,
    renewalPricePerYear: 44.99,
    popular: true,
    featured: false,
    badge: 'Developer',
    description: 'Standard for APIs, developer portals, telemetry dashboards, and cloud microservices.',
    minYears: 1,
    maxYears: 10,
  },
  {
    tld: '.cloud',
    category: 'Space & Tech',
    pricePerYear: 16.99,
    renewalPricePerYear: 21.99,
    popular: false,
    featured: false,
    description: 'For cloud-hosted infrastructure, ZNC bouncers, and virtual master control studios.',
    minYears: 1,
    maxYears: 10,
  },
  // Telecom & Network
  {
    tld: '.network',
    category: 'Telecom & Network',
    pricePerYear: 21.99,
    renewalPricePerYear: 24.99,
    popular: false,
    featured: false,
    badge: 'Mesh / BGP',
    description: 'For UnrealIRCd leaf mesh networks, BGP autonomous systems, and 5G NTN interconnects.',
    minYears: 1,
    maxYears: 10,
  },
  {
    tld: '.co',
    category: 'Popular Commercial',
    pricePerYear: 11.99,
    renewalPricePerYear: 26.99,
    popular: true,
    featured: false,
    badge: 'Short & Memorable',
    description: 'Global short commercial TLD recognized worldwide as a clean alternative to .com.',
    minYears: 1,
    maxYears: 10,
  },
];

// Well-known registered domains to simulate realistic taken WHOIS records
export const KNOWN_REGISTERED_DOMAINS: Record<string, WhoisRecord> = {
  'drfun1.com': {
    domainName: 'drfun1.com',
    registrar: 'Switch SUPERNAP Registrar LLC / DrFun1 Media Inc.',
    ianaId: '2988',
    registrationDate: '2024-03-12T00:00:00Z',
    expirationDate: '2034-03-12T00:00:00Z',
    updatedDate: '2026-01-15T08:30:00Z',
    status: ['clientTransferProhibited', 'serverUpdateProhibited'],
    nameservers: ['ns1.drfun1.com', 'ns2.drfun1.com', 'ns-lasvegas.switch.com'],
    dnssec: true,
    registrantOrg: 'DrFun1 Media Inc. & DrFun1 ECOM Inc. (Richard Alan Witt)',
    registrantCountry: 'US',
    ipAddress: '199.195.250.26',
    asn: 'AS200384 (RisingNet / Switch SUPERNAP)',
  },
  'drfun1media.com': {
    domainName: 'drfun1media.com',
    registrar: 'Switch SUPERNAP Registrar LLC / DrFun1 Media Inc.',
    ianaId: '2988',
    registrationDate: '2024-06-18T00:00:00Z',
    expirationDate: '2035-06-18T00:00:00Z',
    updatedDate: '2026-02-01T12:00:00Z',
    status: ['clientTransferProhibited'],
    nameservers: ['ns1.drfun1.com', 'ns2.drfun1.com'],
    dnssec: true,
    registrantOrg: 'DrFun1 Media Inc. Master Playout Studio',
    registrantCountry: 'US',
    ipAddress: '199.195.250.27',
    asn: 'AS200384 (Switch SUPERNAP Las Vegas)',
  },
  'wittlawfirm.com': {
    domainName: 'wittlawfirm.com',
    registrar: 'GoDaddy / Witt Law Firm Legal Trust',
    ianaId: '146',
    registrationDate: '2008-05-14T00:00:00Z',
    expirationDate: '2032-05-14T00:00:00Z',
    updatedDate: '2025-10-10T14:20:00Z',
    status: ['clientTransferProhibited'],
    nameservers: ['ns1.wittlawfirm.com', 'ns2.wittlawfirm.com'],
    dnssec: true,
    registrantOrg: 'Witt Law Firm (Richard Alan Witt, Attorney at Law)',
    registrantCountry: 'US',
    ipAddress: '198.51.100.44',
  },
  'switch.com': {
    domainName: 'switch.com',
    registrar: 'MarkMonitor Inc.',
    ianaId: '292',
    registrationDate: '1998-02-20T00:00:00Z',
    expirationDate: '2030-02-20T00:00:00Z',
    updatedDate: '2025-11-01T09:00:00Z',
    status: ['clientTransferProhibited', 'serverDeleteProhibited'],
    nameservers: ['ns1.switch.com', 'ns2.switch.com'],
    dnssec: true,
    registrantOrg: 'Switch Inc. (SUPERNAP Tier IV Gold Facility)',
    registrantCountry: 'US',
  },
  'unrealircd.org': {
    domainName: 'unrealircd.org',
    registrar: 'Key-Systems GmbH',
    ianaId: '269',
    registrationDate: '2001-08-07T00:00:00Z',
    expirationDate: '2028-08-07T00:00:00Z',
    updatedDate: '2025-09-12T11:45:00Z',
    status: ['clientTransferProhibited'],
    nameservers: ['ns1.unrealircd.org', 'ns2.unrealircd.org'],
    dnssec: true,
    registrantOrg: 'UnrealIRCd Core Development Team',
    registrantCountry: 'NL',
  },
};

// DNS Configuration Presets for One-Click Domain Setup
export const DOMAIN_DNS_PRESETS: DnsPresetTemplate[] = [
  {
    id: 'drfun1tv_studio',
    name: 'DrFun1TV Playout & Master Studio',
    badge: 'Linear TV & Video',
    description: 'Auto-maps domain to DrFun1TV linear streaming playout, Strimm embed engine, and Cadjin master switcher.',
    records: [
      { type: 'CNAME', host: '@', target: 'tv.drfun1media.com', ttl: 300 },
      { type: 'CNAME', host: 'www', target: 'tv.drfun1media.com', ttl: 300 },
      { type: 'CNAME', host: 'playout', target: 'stream.drfun1media.com', ttl: 300 },
      { type: 'TXT', host: '@', target: 'v=spf1 include:_spf.drfun1media.com ~all', ttl: 3600 },
    ],
  },
  {
    id: 'unrealircd_mesh',
    name: 'UnrealIRCd 6.1.4 Leaf Node & Hub Link',
    badge: 'IRC.drfun1.com Mesh',
    description: 'Auto-configures A and SRV records for UnrealIRCd leaf nodes to link with irc.drfun1.com:6697 (SSL).',
    records: [
      { type: 'A', host: 'irc', target: '199.195.250.26', ttl: 120 },
      { type: 'AAAA', host: 'irc', target: '2607:f130:0:f8::26', ttl: 120 },
      { type: 'CNAME', host: 'stats', target: 'stats.drfun1ircd.com', ttl: 300 },
    ],
  },
  {
    id: 'znc_bouncer',
    name: 'ZNC 1.9.1 Bouncer & WebAdmin',
    badge: 'ZNC Port 5000',
    description: 'Configures vanity webadmin panel at bouncer.yourdomain and direct client proxy listeners.',
    records: [
      { type: 'A', host: 'znc', target: '199.195.250.26', ttl: 300 },
      { type: 'CNAME', host: 'bouncer', target: 'znc.drfun1media.com', ttl: 300 },
    ],
  },
  {
    id: 'custom_anycast',
    name: 'Switch SUPERNAP Tier IV Anycast DNS',
    badge: '100% SLA Core',
    description: 'Zero-latency global anycast resolution powered by Switch SUPERNAP Las Vegas and Citadel Tahoe-Reno.',
    records: [
      { type: 'A', host: '@', target: '199.195.250.10', ttl: 300 },
      { type: 'CNAME', host: 'www', target: '@', ttl: 300 },
    ],
  },
];

/**
 * Cleanly normalizes user query and extracts domain components
 */
export function sanitizeDomainQuery(query: string): { rawName: string; specificTld: string | null } {
  let clean = query.trim().toLowerCase();
  clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
  clean = clean.replace(/\/.*$/, ''); // strip path
  clean = clean.replace(/[^a-z0-9.-]/g, ''); // strip invalid characters

  // Check if user specified a valid TLD
  const dotIndex = clean.lastIndexOf('.');
  if (dotIndex > 0) {
    const ext = clean.substring(dotIndex);
    const hasTld = DOMAIN_TLD_CATALOG.some((t) => t.tld === ext);
    if (hasTld) {
      return {
        rawName: clean.substring(0, dotIndex),
        specificTld: ext,
      };
    }
  }

  // No specific TLD specified, or custom extension
  const raw = clean.replace(/\..*$/, '');
  return {
    rawName: raw || 'drfun1',
    specificTld: null,
  };
}

/**
 * Searches and generates comprehensive domain availability, pricing, and suggestions
 */
export function searchDomains(
  searchQuery: string,
  filterCategory: string = 'All'
): {
  exactMatch: DomainSearchResult | null;
  tldResults: DomainSearchResult[];
  suggestions: DomainSearchResult[];
} {
  const { rawName, specificTld } = sanitizeDomainQuery(searchQuery);

  if (!rawName) {
    return { exactMatch: null, tldResults: [], suggestions: [] };
  }

  // Filter available TLD catalog based on category
  const activeTlds = filterCategory === 'All'
    ? DOMAIN_TLD_CATALOG
    : DOMAIN_TLD_CATALOG.filter((t) => t.category === filterCategory);

  // Helper to check taken status
  const isDomainTaken = (fullDomain: string): { taken: boolean; whois?: WhoisRecord } => {
    if (KNOWN_REGISTERED_DOMAINS[fullDomain]) {
      return { taken: true, whois: KNOWN_REGISTERED_DOMAINS[fullDomain] };
    }

    // Deterministic simulation for common terms
    const lower = fullDomain.toLowerCase();
    const commonTakenWords = ['google', 'apple', 'microsoft', 'amazon', 'spacex', 'starlink', 'viasat', 'intelsat', 'ses', 'eutelsat', 'disney', 'paramount', 'comcast', 'dish', 'fubo', 'switch', 'witt'];
    if (commonTakenWords.some(w => lower.startsWith(w + '.'))) {
      return {
        taken: true,
        whois: {
          domainName: fullDomain,
          registrar: 'Enterprise Corporate Registrar LLC',
          ianaId: '899',
          registrationDate: '2015-04-10T00:00:00Z',
          expirationDate: '2029-04-10T00:00:00Z',
          updatedDate: '2025-04-01T00:00:00Z',
          status: ['clientTransferProhibited'],
          nameservers: ['ns1.carrier-telemetry.net', 'ns2.carrier-telemetry.net'],
          dnssec: true,
          registrantOrg: 'Corporate Registry Division',
          registrantCountry: 'US',
        },
      };
    }

    return { taken: false };
  };

  // 1. Exact Match Check (if user specified .com or .tv, or primary .com)
  const primaryTld = specificTld || '.com';
  const exactDomainName = `${rawName}${primaryTld}`;
  const exactTldInfo = DOMAIN_TLD_CATALOG.find((t) => t.tld === primaryTld) || DOMAIN_TLD_CATALOG[0];
  const exactCheck = isDomainTaken(exactDomainName);

  const exactMatch: DomainSearchResult = {
    domainName: exactDomainName,
    nameWithoutTld: rawName,
    tld: primaryTld,
    status: exactCheck.taken ? 'taken' : 'available',
    pricePerYear: exactTldInfo.pricePerYear,
    renewalPricePerYear: exactTldInfo.renewalPricePerYear,
    isPopular: exactTldInfo.popular,
    isRecommended: true,
    whois: exactCheck.whois,
  };

  // 2. Extension Expansion Results Across Catalog
  const tldResults: DomainSearchResult[] = activeTlds.map((tldInfo) => {
    const fullDomain = `${rawName}${tldInfo.tld}`;
    const check = isDomainTaken(fullDomain);

    return {
      domainName: fullDomain,
      nameWithoutTld: rawName,
      tld: tldInfo.tld,
      status: check.taken ? 'taken' : 'available',
      pricePerYear: tldInfo.pricePerYear,
      renewalPricePerYear: tldInfo.renewalPricePerYear,
      isPopular: tldInfo.popular,
      whois: check.whois,
    };
  });

  // 3. Smart Broadcast / Satcom Alternative Suggestions
  const suggestionModifiers = [
    { prefix: '', suffix: 'tv', tld: '.com', desc: 'TV Edition' },
    { prefix: '', suffix: 'media', tld: '.tv', desc: 'Media Channel' },
    { prefix: '', suffix: 'sat', tld: '.net', desc: 'Satcom Network' },
    { prefix: 'get', suffix: '', tld: '.com', desc: 'Official Portal' },
    { prefix: '', suffix: 'stream', tld: '.live', desc: 'Live Stream' },
    { prefix: '', suffix: 'space', tld: '.space', desc: 'Orbital Fleet' },
    { prefix: '', suffix: 'hub', tld: '.io', desc: 'Tech Hub' },
    { prefix: '', suffix: 'network', tld: '.media', desc: 'Network Group' },
  ];

  const suggestions: DomainSearchResult[] = suggestionModifiers.map((mod) => {
    const modName = `${mod.prefix}${rawName}${mod.suffix}`;
    const fullDomain = `${modName}${mod.tld}`;
    const tldInfo = DOMAIN_TLD_CATALOG.find((t) => t.tld === mod.tld) || DOMAIN_TLD_CATALOG[0];
    const check = isDomainTaken(fullDomain);

    return {
      domainName: fullDomain,
      nameWithoutTld: modName,
      tld: mod.tld,
      status: check.taken ? 'taken' : 'available',
      pricePerYear: tldInfo.pricePerYear,
      renewalPricePerYear: tldInfo.renewalPricePerYear,
      isPopular: true,
      whois: check.whois,
    };
  });

  return {
    exactMatch,
    tldResults,
    suggestions,
  };
}

/**
 * Converts a domain registration into a StoreProduct so it can be added to the unified cart
 */
export function convertDomainToStoreProduct(item: DomainCartItem): StoreProduct {
  return {
    id: `domain_${item.domainName.replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
    name: `${item.domainName} (${item.years} Year Registration)`,
    drfun1RebrandedName: `${item.domainName} — Switch SUPERNAP Anycast DNS Edition`,
    tagline: `ICANN Certified Domain Registration with Switch SUPERNAP Las Vegas Anycast DNS & Free WHOIS Privacy Guard`,
    category: 'Dedicated IRCD & Transit Hosting',
    oemCarriers: ['Switch.com (SUPERNAP Las Vegas)', 'DrFun1 Media ICANN Registrar'],
    oemDescription: `Annual ICANN registration for ${item.domainName}. Includes zero-trust DNSSEC, Anycast resolution, and automated DNS zone routing.`,
    drfun1Description: `Official DrFun1 Media accredited domain registration. Pre-configured with ${item.dnsPreset === 'drfun1tv_studio' ? 'DrFun1TV Playout Studio' : item.dnsPreset === 'unrealircd_mesh' ? 'UnrealIRCd 6.1.4 Leaf Mesh' : 'Custom Switch Anycast DNS'} and free WHOIS privacy.`,
    retailPrice: Math.round((item.totalPrice * 1.35) * 100) / 100,
    drfun1WholesalePrice: item.totalPrice,
    priceUnit: 'one-time',
    stockStatus: 'In Stock',
    minOrderQuantity: 1,
    badge: 'Domain Registration',
    frequencyBands: ['Optical/Laser', 'Anycast DNS'],
    orbitType: 'Ground Segment',
    specs: [
      { label: 'Domain Name', value: item.domainName },
      { label: 'Registration Period', value: `${item.years} Year${item.years > 1 ? 's' : ''}` },
      { label: 'WHOIS Privacy', value: item.whoisPrivacy ? 'Active (Free Guard)' : 'Standard' },
      { label: 'Anycast DNS Nameservers', value: 'ns1.drfun1.com / ns2.drfun1.com (Switch NV)' },
      { label: 'DNSSEC & SSL 1.3', value: 'Automated Issuance' },
      { label: 'Auto-Renewal', value: item.autoRenew ? 'Enabled' : 'Manual' },
    ],
    drfun1ValueAdd: [
      'Switch SUPERNAP Tier IV Gold Anycast DNS (100% uptime SLA)',
      'Free WHOIS Privacy Guard (identity protection)',
      'Instant CNAME / A record routing for DrFun1TV and UnrealIRCd leaf nodes',
      'Free DNSSEC zone signing & automated Let’s Encrypt wildcard SSL',
    ],
    switchInterconnectCampus: 'Switch SUPERNAP Las Vegas (Core)',
    unrealIrcdEnabled: item.dnsPreset === 'unrealircd_mesh',
    risingNetProtected: true,
  };
}
