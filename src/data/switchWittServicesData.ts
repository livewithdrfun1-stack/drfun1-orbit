/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Complete Catalog of:
 * 1. Switch.com Owned Services & Physical Infrastructure (www.switch.com)
 * 2. Witt Law Firm Satellite & Fiber Legal/Escrow Services (www.wittlawfirm.com)
 * Certified under Certificate ID: RAW-SATCOM-2026-LIC-0881 | FCC FRN: 0034981290
 */

import { StoreProduct } from '../types/store';

export interface SwitchCampusProfile {
  id: string;
  name: string;
  location: string;
  sqFt: string;
  powerCapacityMw: string;
  tierCertification: string;
  teleportFacilities: string;
  superLoopLatency: string;
  fiberProvidersCount: number;
  unrealIrcdLeafNodes: string[];
  description: string;
  keyFeatures: string[];
}

export interface WittLawFirmServiceProfile {
  id: string;
  title: string;
  practiceArea: string;
  escrowCertified: boolean;
  certificateRef: string;
  attorneyLead: string;
  regulatoryJurisdiction: string;
  deliverables: string[];
  description: string;
  typicalTermYears: string;
  feeStructure: string;
}

export const SWITCH_OWNED_CAMPUSES: SwitchCampusProfile[] = [
  {
    id: 'switch-core-las-vegas',
    name: 'The Core Campus (Las Vegas, NV)',
    location: 'SUPERNAP 7, 8, 9, 10, 11 (Las Vegas Valley, NV)',
    sqFt: '3,500,000+ sq ft',
    powerCapacityMw: '315 MW 100% Renewable Solar',
    tierCertification: 'Class 5 Platinum Tier-IV Gold Standard',
    teleportFacilities: 'Master Earth Station Dish Farm (C/Ku/Ka-Band & 1550nm Laser Terminals)',
    superLoopLatency: '< 4.7 ms to Los Angeles / Silicon Valley',
    fiberProvidersCount: 50,
    unrealIrcdLeafNodes: [
      'node01.switch.lasvegas.drfun1.com',
      'node02.switch.lasvegas.drfun1.com',
      'node03.switch.lasvegas.drfun1.com',
      'node04.switch.lasvegas.drfun1.com',
      'node05.switch.lasvegas.drfun1.com'
    ],
    description: 'Switch flagship prime data center campus and the western hemisphere master teleport cross-connect hub. Directly links DrFun1TV linear playout, TVU Grid, and Restream.io to major fiber optical rings.',
    keyFeatures: [
      'Patented 100% Hot Aisle Containment T-SCIF heat rejection',
      'Multi-system tri-redundant power delivery with zero single points of failure',
      'Rooftop antenna master lease with direct radome-to-meet-me-room waveguide conduits',
      'Carrier-neutral cross-connects to 50+ tier-1 telecommunications carriers'
    ]
  },
  {
    id: 'switch-citadel-tahoe-reno',
    name: 'The Citadel Campus (Tahoe Reno, NV)',
    location: 'Tahoe Reno Industrial Center (Reno, NV)',
    sqFt: '7,200,000 sq ft (World Largest Data Center Campus)',
    powerCapacityMw: '650 MW Solar & Wind with Tesla Megapack Storage',
    tierCertification: 'Class 5 Platinum SuperNAP',
    teleportFacilities: 'Deep Space & LEO Satellite Gateway Teleport Array',
    superLoopLatency: '< 4.1 ms to Silicon Valley',
    fiberProvidersCount: 42,
    unrealIrcdLeafNodes: [
      'node06.switch.citadel.drfun1.com',
      'node07.switch.citadel.drfun1.com',
      'node08.switch.citadel.drfun1.com',
      'node09.switch.citadel.drfun1.com',
      'node10.switch.citadel.drfun1.com'
    ],
    description: 'The largest colocation campus in the world. Engineered to host hyperscale AI clusters, orbital satellite cross-links, and high-capacity fiber optical transport with zero carbon footprint.',
    keyFeatures: [
      'Dedicated 100% Nevada solar generation plant built exclusively for Switch',
      'Active-active direct fiber cross-connect to The Core Campus via Switch SuperLoop',
      'Class 5 Platinum redundant structural resilience rated for seismic zone 4',
      'Direct low-latency peering to OneWeb, Starlink, and AST SpaceMobile ground gateways'
    ]
  },
  {
    id: 'switch-pyramid-michigan',
    name: 'The Pyramid Campus (Grand Rapids, MI)',
    location: 'Gaines Township (Grand Rapids, MI)',
    sqFt: '1,800,000 sq ft',
    powerCapacityMw: '110 MW 100% Green Energy',
    tierCertification: 'Class 5 Platinum East-Central Fortress',
    teleportFacilities: 'Great Lakes Transcontinental Microwave & Earth Station',
    superLoopLatency: '< 5.2 ms to Chicago CME / Toronto',
    fiberProvidersCount: 36,
    unrealIrcdLeafNodes: [
      'node11.switch.pyramid.drfun1.com',
      'node12.switch.pyramid.drfun1.com',
      'node13.switch.pyramid.drfun1.com',
      'node14.switch.pyramid.drfun1.com',
      'node15.switch.pyramid.drfun1.com'
    ],
    description: 'Iconic 7-story steel-and-granite pyramid campus serving as the primary Midwest low-latency financial and broadcast distribution bridge to Chicago and New York.',
    keyFeatures: [
      'Zero natural disaster risk location in Michigan stable geostrata',
      'Multi-terabit sub-millisecond interconnects to Chicago financial exchange hubs',
      'Tri-redundant chiller-less eco-cooling architecture',
      'High-security defense-grade physical access with 24/7 armed patrol'
    ]
  },
  {
    id: 'switch-keep-atlanta',
    name: 'The Keep Campus (Atlanta, GA)',
    location: 'Douglas County (Atlanta Metropolitan, GA)',
    sqFt: '1,100,000 sq ft',
    powerCapacityMw: '150 MW 100% Green Energy',
    tierCertification: 'Class 5 Platinum Southeast Master Hub',
    teleportFacilities: 'Southeast Satellite Direct Broadcast & Atlantic Ingest',
    superLoopLatency: '< 8.4 ms to Miami / New York',
    fiberProvidersCount: 38,
    unrealIrcdLeafNodes: [
      'node16.switch.thekeep.drfun1.com',
      'node17.switch.thekeep.drfun1.com',
      'node18.switch.thekeep.drfun1.com',
      'node19.switch.thekeep.drfun1.com',
      'node20.switch.thekeep.drfun1.com'
    ],
    description: 'The premier telecommunications interchange in the Southeastern United States, connecting subsea cable landing stations in Florida to transcontinental fiber backbones.',
    keyFeatures: [
      'Direct interconnection with Latin American subsea fiber landings in Jacksonville and Miami',
      'Carrier-neutral cross-connects to Comcast, AT&T, Verizon, and Lumen',
      'Dedicated TVU Networks Grid news exchange and Cablecast PEG uplink hub',
      'Class 5 Platinum tri-redundant power delivery infrastructure'
    ]
  },
  {
    id: 'switch-rock-austin',
    name: 'The Rock Campus (Austin, TX)',
    location: 'Central Texas Technology Corridor (Austin, TX)',
    sqFt: '1,500,000 sq ft',
    powerCapacityMw: '185 MW 100% Texas Green Energy',
    tierCertification: 'Class 5 Platinum Texas Prime',
    teleportFacilities: 'Gulf Coast Space Corridor & Starbase Boca Chica Direct Link',
    superLoopLatency: '< 6.8 ms to Dallas / Houston',
    fiberProvidersCount: 40,
    unrealIrcdLeafNodes: [
      'node21.switch.therock.drfun1.com',
      'node22.switch.therock.drfun1.com',
      'node23.switch.therock.drfun1.com',
      'node24.switch.therock.drfun1.com',
      'node25.switch.therock.drfun1.com'
    ],
    description: 'Switch major central technology nexus, directly linking South Texas commercial rocketry launch complexes and Gulf Coast maritime VSAT teleports into the Switch national fabric.',
    keyFeatures: [
      'Low-latency fiber conduits to Starbase Boca Chica and Cape Canaveral launch nets',
      'Independent 100% green Texas ERCOT grid interconnect with dedicated on-site battery reserves',
      'Multi-cloud direct connect gateways to Google Cloud Austin and AWS US-East',
      'Hardened Category-5 hurricane survivability structural rating'
    ]
  }
];

export const WITT_LAW_FIRM_SERVICES: WittLawFirmServiceProfile[] = [
  {
    id: 'witt-orbital-escrow',
    title: 'Orbital Slot Title Escrow & ITU Priority Filing Legal Structuring',
    practiceArea: 'International Space Law & Orbital Telecommunications',
    escrowCertified: true,
    certificateRef: 'RAW-SATCOM-2026-LIC-0881',
    attorneyLead: 'Richard Alan Witt, Esq. (The Law Office of Richard A. Witt LLC)',
    regulatoryJurisdiction: 'ITU Space Services Department & US FCC International Bureau',
    deliverables: [
      'ITU Appendix 4 Advance Publication Information (API) & Coordination filings',
      'Orbital slot title legal escrow holding agreement through The Richard Alan Witt Trust',
      'Geostationary (GSO) & Non-Geostationary (NGSO) coordination and interference shielding',
      'Transponder lease title verification, lien searches, and bilateral indemnification'
    ],
    description: 'Comprehensive legal structuring for commercial satellite operators, teleport owners, and carriers seeking priority rights in Ka-band, Ku-band, C-band, and V/Q-band orbital arcs. Protects orbital slot equity and coordinates international frequency clearing.',
    typicalTermYears: '5 to 15 Years',
    feeStructure: 'Tiered Retainer + Transponder Escrow Administration Fee'
  },
  {
    id: 'witt-fcc-earth-station',
    title: 'FCC Part 25 Earth Station & Teleport Commissioning Legal Suite',
    practiceArea: 'Federal Regulatory Communications & FCC Spectrum Filings',
    escrowCertified: true,
    certificateRef: 'RAW-SATCOM-2026-LIC-0881',
    attorneyLead: 'Richard Alan Witt, Esq. & Owens Company Telecom Legal Team',
    regulatoryJurisdiction: 'Federal Communications Commission (FCC) Part 25 / Part 73 / Part 76',
    deliverables: [
      'Turnkey FCC Form 312 Earth Station Application preparation & expedited grant filing',
      'Radiation Hazard (RadHaz) compliance environmental assessments and FAA obstruction filings',
      'Coordination contour frequency clearance under FCC Rule 25.203 with terrestrial microwave carriers',
      'Certificate of Legal Station Commissioning (FRN: 0034981290) and public notice publication'
    ],
    description: 'End-to-end legal commissioning for commercial dish arrays, radomes, and satellite teleport facilities across all 50 states. Secures commercial uplink/downlink rights and permanent protection from terrestrial cellular interference.',
    typicalTermYears: '15-Year FCC License Term (Renewable)',
    feeStructure: 'Fixed Commissioning Retainer + FCC Statutory Application Fees'
  },
  {
    id: 'witt-fiber-iru-contracts',
    title: 'Terrestrial & Subsea Optical Fiber 20-Year Indefeasible Right of Use (IRU)',
    practiceArea: 'Optical Infrastructure, Right-of-Way (ROW) & Telecom Real Estate',
    escrowCertified: true,
    certificateRef: 'RAW-SATCOM-2026-LIC-0881',
    attorneyLead: 'Richard Alan Witt, Esq. (www.wittlawfirm.com)',
    regulatoryJurisdiction: 'US Federal Energy Regulatory Commission (FERC) & State Public Utilities Commissions',
    deliverables: [
      '20-Year and 30-Year Indefeasible Right of Use (IRU) Master Agreement for dark fiber strands',
      'Colocation meet-me room cross-connect agreements inside Switch SUPERNAP data center vaults',
      'Right-of-Way (ROW) utility easement access permits and environmental indemnification',
      'Lit optical wave (100G / 400G / 800G) SLA enforcement, mean-time-to-repair (MTTR) covenants'
    ],
    description: 'Institutional-grade optical fiber contract drafting for carriers, teleport operators, and enterprise networks securing long-haul dark fiber and coherent DWDM optical waves across transcontinental and subsea corridors.',
    typicalTermYears: '20 to 30 Years',
    feeStructure: 'Capitalized Legal Lease Structuring + Annual O&M Compliance Audit'
  },
  {
    id: 'witt-direct-to-cell-ntn',
    title: 'Direct-to-Cell (3GPP NTN) Global Roaming & Spectrum Lease Agreements',
    practiceArea: 'Mobile Network Operator (MNO) & Satellite Inter-Working Law',
    escrowCertified: true,
    certificateRef: 'RAW-SATCOM-2026-LIC-0881',
    attorneyLead: 'Richard Alan Witt, Esq. (The Law Office of Richard A. Witt LLC)',
    regulatoryJurisdiction: 'FCC Part 27 Supplemental Coverage from Space (SCS) & 3GPP Standards',
    deliverables: [
      'Supplemental Coverage from Space (SCS) FCC regulatory lease and terrestrial partner approvals',
      'Multi-IMSI universal eSIM roaming franchise agreements bridging standard cellular and LEO towers',
      'Carrier liability shielding and E911 location accuracy regulatory compliance waivers',
      'Turnkey consumer carrier agreements for DrFun1 Wireless unlocked phones and satellite 5G plans'
    ],
    description: 'Pioneering legal framework for direct-to-device orbital communications. Allows mobile carriers, MVNOs, and unlocked device vendors to lawfully beam 5G voice, data, and emergency messaging directly to standard smartphones from LEO satellites.',
    typicalTermYears: '5 to 10 Years',
    feeStructure: 'Franchise Royalty Agreement + Regulatory Maintenance Retainer'
  },
  {
    id: 'witt-turnkey-reseller-franchise',
    title: 'Turnkey Co-Branded Reseller Wholesale Master Licensing Suite',
    practiceArea: 'Commercial Franchising, Intellectual Property & Telecom Rebranding',
    escrowCertified: true,
    certificateRef: 'RAW-SATCOM-2026-LIC-0881',
    attorneyLead: 'Richard Alan Witt, Esq. & Owens Company Management',
    regulatoryJurisdiction: 'Global Commercial Trade & US Telecom Reseller Charter',
    deliverables: [
      'Master Wholesale Reseller Franchise Agreement granting 100% legal rights to co-brand and re-sell',
      'Turnkey platform licensing for DrFun1TV, Restream.io, TVU Grid, Cablecast, and Cadjin master control',
      'Indemnification shield protecting resellers against copyright claims and transmission liability',
      'Legal escrow structure for automated subscriber revenue splits (including Kick 95/5 creator payout)'
    ],
    description: 'Comprehensive turnkey reseller licensing agreement certified by www.wittlawfirm.com. Empowers third-party entrepreneurs and regional telecoms to deploy their own branded satellite-fiber carrier, broadcast network, and device store with zero legal friction.',
    typicalTermYears: 'Perpetual Commercial Charter (Annual Audit)',
    feeStructure: 'Wholesale Partner Onboarding Fee + Tiered Net Revenue Royalty'
  },
  {
    id: 'witt-scte35-advertising-escrow',
    title: 'SCTE-35 Digital Advertising Syndication & Rebranding Escrow',
    practiceArea: 'Broadcast Advertising Regulation & Syndication Copyright',
    escrowCertified: true,
    certificateRef: 'RAW-SATCOM-2026-LIC-0881',
    attorneyLead: 'Richard Alan Witt, Esq. (www.wittlawfirm.com)',
    regulatoryJurisdiction: 'FCC Commercial Limits, CALM Act & Copyright Royalty Board (CRB)',
    deliverables: [
      'SCTE-35 dynamic ad insertion copyright clearance and syndicated redistribution covenants',
      'CALM Act audio loudness compliance legal certification (-24.0 LUFS / EBU R128 verification)',
      'Program retransmission consent agreements for linear broadcast networks on DrFun1TV',
      'Automated sponsor revenue escrow reconciliation via Richard Alan Witt Escrow Trust'
    ],
    description: 'Guarantees full statutory compliance for digital ad insertion (SCTE-35 cue tones), audio loudness calibration, and syndicated rebroadcasting across cable, satellite, and multistream cloud networks.',
    typicalTermYears: '3 to 5 Years',
    feeStructure: 'Annual Commercial Clearance Certification + Ad Revenue Clearing'
  }
];

export const SWITCH_WITT_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'switch-superloop-400g-metro',
    name: 'Switch CONNECT SuperLoop 400G Optical Fiber Interconnect (OEM)',
    drfun1RebrandedName: 'DrFun1 Switch SuperLoop 400G Coherent Optical Wave',
    tagline: 'Carrier-neutral 400 Gbps ultra-low latency DWDM fiber ring connecting all Switch data center campuses',
    category: 'Switch.com Owned Infrastructure & SuperLoop',
    oemCarriers: ['Switch.com (Switch Inc.)', 'RisingNet Tier-1 BGP'],
    oemDescription: 'Patented, highly-redundant carrier-neutral telecommunications fiber optic ring connecting Switch SUPERNAP Las Vegas, The Citadel Tahoe Reno, and West Coast carrier exchange points.',
    drfun1Description: 'DrFun1 Ultra-Broadband Optical Ring: Dedicated 400 Gbps coherent wave running over the private Switch SuperLoop. Provides sub-4.7ms round-trip latency between Las Vegas, Tahoe Reno, and Silicon Valley with uncompressed video distribution capability and direct satellite teleport handoffs.',
    retailPrice: 8500,
    drfun1WholesalePrice: 6200,
    priceUnit: 'per_month',
    stockStatus: 'In Stock',
    minOrderQuantity: 1,
    badge: 'Switch SuperLoop 400G',
    frequencyBands: ['1550nm C-Band DWDM Optical', 'Coherent 400ZR+ Wave'],
    orbitType: 'Terrestrial SuperLoop DWDM Ring',
    specs: [
      { label: 'Bandwidth', value: '400 Gbps Symmetrical Line Rate (100% Committed)' },
      { label: 'Latency SLA', value: '< 4.7 ms (Las Vegas to Los Angeles / Silicon Valley)' },
      { label: 'Fiber Architecture', value: '100% Diverse Route Active-Active Protected Path' },
      { label: 'Colocation Campuses', value: 'Switch SUPERNAP Las Vegas, The Citadel, Silicon Valley PoPs' },
      { label: 'Interface', value: '400GBASE-LR4 / QSFP-DD Coherent Optical Transceivers' },
      { label: 'NOC Link', value: 'UnrealIRCd Out-of-Band Link to #switch-teleport-noc' }
    ],
    drfun1ValueAdd: [
      'Direct cross-connect to DrFun1TV 4K broadcast playout and Restream.io core',
      'Carrier-neutral cross-connect to AWS Direct Connect and Azure ExpressRoute included',
      'RisingNet Tier-1 clean IP transit with multi-terabit anti-DDoS mitigation',
      'Certified under Witt Law Firm Indefeasible Right of Use (IRU) compliance'
    ],
    switchInterconnectCampus: 'Switch The Core (Las Vegas) & The Citadel (Tahoe Reno)',
    unrealIrcdEnabled: true,
    risingNetProtected: true
  },
  {
    id: 'switch-teleport-radome-roof-space',
    name: 'Switch SUPERNAP Master Earth Station Dish Space & Waveguide Conduits (OEM)',
    drfun1RebrandedName: 'DrFun1 Switch Teleport Earth Station Radome Lease',
    tagline: 'Rooftop dish array space, dedicated waveguide risers, and meet-me room cross-connect inside Switch Class 5 Platinum vaults',
    category: 'Switch.com Owned Infrastructure & SuperLoop',
    oemCarriers: ['Switch.com (Switch Inc.)', 'DrFun1 Media Inc.'],
    oemDescription: 'Commercial rooftop antenna mounting space with pre-installed waveguide conduits terminating directly in the Switch meet-me room.',
    drfun1Description: 'DrFun1 Master Teleport Radome Lease: Dedicated rooftop pad for 4.5m - 9.2m commercial earth station dishes at Switch SUPERNAP Las Vegas. Features line-of-sight to the entire geostationary satellite arc (45° W to 140° W), dual redundant optical LNB converters, and direct fiber links to DrFun1TV playout.',
    retailPrice: 4200,
    drfun1WholesalePrice: 3100,
    priceUnit: 'per_month',
    stockStatus: 'In Stock',
    minOrderQuantity: 1,
    badge: 'Switch Teleport Roof',
    frequencyBands: ['C-Band (3.7 - 4.2 GHz)', 'Ku-Band (11.7 - 14.5 GHz)', 'Ka-Band (18.2 - 31.0 GHz)', '1550nm Laser'],
    orbitType: 'GEO Satellite Arc + LEO Tracking',
    specs: [
      { label: 'Rooftop Pad Capacity', value: 'Up to 9.2m Earth Station Antennas / Steerable Tracking Radomes' },
      { label: 'Orbital Arc Visibility', value: '45° W to 140° W Continuous Geostationary Orbital View' },
      { label: 'Riser Conduits', value: 'Dual Diverse 4-inch Conduit Runs directly to Core Meet-Me Room' },
      { label: 'Power Resilience', value: 'Class 5 Platinum 100% Tri-Redundant UPS + Solar Power' },
      { label: 'RF Demodulation', value: 'Pre-wired DVB-S2X / QAM-256 / ATSC 3.0 Transceivers' },
      { label: 'Teleport NOC', value: '24/7/365 On-Site Armed Security and Teleport Facility Engineers' }
    ],
    drfun1ValueAdd: [
      'Pre-integrated with DrFun1 ECOM FCC FRN 0034981290 Part 25 Earth Station License',
      'Immediate optical cross-connect to DrFun1TV linear playout and TVU Grid exchange',
      'UnrealIRCd telemetry monitoring on #switch-teleport-noc on irc.drfun1.com:6697',
      'Complete legal zoning and municipal permitting handled via www.wittlawfirm.com'
    ],
    switchInterconnectCampus: 'Switch The Core (Las Vegas, NV) & The Keep (Atlanta, GA)',
    unrealIrcdEnabled: true,
    risingNetProtected: true
  },
  {
    id: 'switch-citadel-800g-longhaul',
    name: 'Switch Citadel 800G Coherent Wave Long-Haul Transport (OEM)',
    drfun1RebrandedName: 'DrFun1 Citadel Ultra-Wave 800G Long-Haul Transport',
    tagline: 'The world largest data center campus connected via 800 Gbps optical fiber waves powered by 100% Nevada solar energy',
    category: 'Switch.com Owned Infrastructure & SuperLoop',
    oemCarriers: ['Switch.com (Switch Inc.)', 'RisingNet Optical'],
    oemDescription: 'Next-generation 800G optical transport service linking The Citadel campus in Tahoe Reno with major cloud hubs across North America.',
    drfun1Description: 'DrFun1 800G Hyperscale Backbone: Massive 800 Gbps symmetrical transport pipeline for uncompressed 8K video playout, multi-constellation satellite telemetry aggregation, and subsea landing cross-connects. Powered entirely by certified 100% clean solar and battery reserves.',
    retailPrice: 16500,
    drfun1WholesalePrice: 12800,
    priceUnit: 'per_month',
    stockStatus: 'In Stock',
    minOrderQuantity: 1,
    badge: 'Citadel 800G Wave',
    frequencyBands: ['800ZR+ Optical Coherent DWDM', '193.1 THz Optical C-Band'],
    orbitType: 'Transcontinental Optical Transport',
    specs: [
      { label: 'Throughput', value: '800 Gbps Symmetrical Coherent Optical Transport' },
      { label: 'Facility', value: 'The Citadel Campus (Tahoe Reno, NV - 7.2M sq ft)' },
      { label: 'Power Source', value: '100% Renewable Green-e Certified Nevada Solar + Megapack' },
      { label: 'Availability SLA', value: '100% Uptime Guaranteed (Class 5 Platinum)' },
      { label: 'Cross-Connects', value: 'Zero-latency cross-connect to AWS, Azure, Google Cloud' },
      { label: 'Encryption', value: 'MACsec Line-Rate 256-bit Hardware Optical Encryption' }
    ],
    drfun1ValueAdd: [
      'Seamless multi-orbit transport for OneWeb, Starlink, and Telesat Lightspeed feeds',
      'Integrated with DrFun1 Quantum Fiber Lossless Audio and 8K TV broadcast pipelines',
      'Direct peering to UnrealIRCd node06-node10 at irc.drfun1.com',
      'Institutional IRU legal title secured via www.wittlawfirm.com'
    ],
    switchInterconnectCampus: 'The Citadel (Tahoe Reno) & The Core (Las Vegas)',
    unrealIrcdEnabled: true,
    risingNetProtected: true
  },
  {
    id: 'witt-orbital-escrow-package',
    name: 'Witt Law Firm Orbital Slot Escrow & ITU Priority Filing Package (Legal)',
    drfun1RebrandedName: 'Witt Law Firm Orbital Slot Title Escrow & ITU Filing Suite',
    tagline: 'Comprehensive legal structuring, ITU frequency filing priority, and transponder title holding escrow through The Richard Alan Witt Trust',
    category: 'Witt Law Firm Satellite Fiber Escrow',
    oemCarriers: ['The Law Office of Richard A. Witt LLC', 'Owens Company'],
    oemDescription: 'Institutional space law service providing ITU priority coordination, bilateral satellite lease drafting, and escrow title holding for orbital slots and transponders.',
    drfun1Description: 'The Premier Space Telecom Legal Package: Hosted by Richard Alan Witt, Esq. (www.wittlawfirm.com). Covers ITU Appendix 4 API/CR filings, orbital slot lease agreements, transponder title escrow, and cross-border carrier indemnification. Certified under Certificate ID RAW-SATCOM-2026-LIC-0881.',
    retailPrice: 25000,
    drfun1WholesalePrice: 18500,
    priceUnit: 'one-time',
    stockStatus: 'In Stock',
    minOrderQuantity: 1,
    badge: 'Witt Law Certified',
    frequencyBands: ['All ITU Space Bands (C, Ku, Ka, X, S, V/Q-Band)'],
    orbitType: 'GSO & NGSO Orbital Slot Coordination',
    specs: [
      { label: 'Lead Counsel', value: 'Richard Alan Witt, Esq. (The Law Office of Richard A. Witt LLC)' },
      { label: 'Certificate Reference', value: 'RAW-SATCOM-2026-LIC-0881' },
      { label: 'Regulatory Bodies', value: 'ITU Space Services Dept. (Geneva) & FCC International Bureau' },
      { label: 'Escrow Vehicle', value: 'The Richard Alan Witt Satellite Escrow Trust Account' },
      { label: 'Contact Email', value: 'livewithdrfun1@gmail.com / legal@wittlawfirm.com' },
      { label: 'Affiliated Entities', value: 'Owens Company (www.owenscompany.com) & DrFun1 ECOM Inc.' }
    ],
    drfun1ValueAdd: [
      'Full legal protection against frequency interference and priority claim jumping',
      'Direct colocation integration inside Switch SUPERNAP Nevada teleport vaults',
      'Standardized indemnification shield for turnkey co-branded resellers',
      'UnrealIRCd legal channel link to #wittlaw-spectrum on irc.drfun1.com'
    ],
    switchInterconnectCampus: 'Switch SUPERNAP Las Vegas (Legal Escrow Vault)',
    unrealIrcdEnabled: true,
    risingNetProtected: true
  },
  {
    id: 'witt-fcc-part25-commissioning',
    name: 'Witt Law Firm FCC Part 25 Earth Station & Teleport Commissioning (Legal)',
    drfun1RebrandedName: 'Witt Law Firm FCC Part 25 Commercial Earth Station License',
    tagline: 'Turnkey FCC Form 312 legal filing, terrestrial microwave frequency coordination, and regulatory commissioning under FCC FRN 0034981290',
    category: 'Witt Law Firm Satellite Fiber Escrow',
    oemCarriers: ['The Law Office of Richard A. Witt LLC', 'FCC.gov Registration Desk'],
    oemDescription: 'Federal legal filing service preparing and filing comprehensive FCC Part 25 commercial earth station applications with frequency coordination clearance.',
    drfun1Description: 'Turnkey FCC Teleport Legal Commissioning: Complete representation before the FCC International Bureau and Media Bureau by Richard Alan Witt, Esq. Guarantees lawful operation of commercial satellite uplink/downlink terminals, teleport dish arrays, and television transmission facilities.',
    retailPrice: 14500,
    drfun1WholesalePrice: 11200,
    priceUnit: 'one-time',
    stockStatus: 'In Stock',
    minOrderQuantity: 1,
    badge: 'FCC FRN 0034981290',
    frequencyBands: ['C, Ku, Ka-Band Commercial Earth Station'],
    orbitType: 'Commercial Earth Station Playout',
    specs: [
      { label: 'FCC Rule Part', value: '47 CFR Part 25 (Satellite Communications) & Part 73 (DTV)' },
      { label: 'License Term', value: '15-Year Renewable Statutory Commercial Grant' },
      { label: 'FRN Registration', value: 'FCC FRN: 0034981290 (DrFun1 ECOM / Richard Alan Witt)' },
      { label: 'Coordination Radius', value: 'Full Frequency Coordination Area under FCC Rule 25.203' },
      { label: 'Environmental', value: 'FCC Radiation Hazard (RadHaz) Compliance Clearance' },
      { label: 'Legal Counsel', value: 'Richard Alan Witt, Esq. (www.wittlawfirm.com)' }
    ],
    drfun1ValueAdd: [
      'Immediate listing in the DrFun1TV & Master Studio FCC.gov EPG station matrix',
      'Dedicated 1-to-1 UnrealIRCd channel provisioning on irc.drfun1.com:6697',
      'Pre-approved interconnect to Switch SUPERNAP Las Vegas master teleport',
      'Lifetime renewal tracking and regulatory compliance maintenance'
    ],
    switchInterconnectCampus: 'Switch SUPERNAP Las Vegas & Switch The Keep Atlanta',
    unrealIrcdEnabled: true,
    risingNetProtected: true
  },
  {
    id: 'witt-fiber-iru-20yr-agreement',
    name: 'Witt Law Firm 20-Year Optical Fiber IRU Master Agreement (Legal)',
    drfun1RebrandedName: 'Witt Law Firm Optical Dark Fiber 20-Year IRU Legal Suite',
    tagline: 'Comprehensive Indefeasible Right of Use (IRU) legal framework, Right-of-Way permitting, and Switch meet-me room cross-connect contracts',
    category: 'Witt Law Firm Satellite Fiber Escrow',
    oemCarriers: ['The Law Office of Richard A. Witt LLC', 'Switch.com Connect'],
    oemDescription: 'Institutional legal agreements securing long-term optical fiber leases, utility easement access, and telecom service level enforcement.',
    drfun1Description: '20-Year Optical Fiber IRU Legal Master Agreement: Authored by Richard Alan Witt, Esq. Secures unassailable property and operational rights to dedicated terrestrial dark fiber strands, optical amplification huts, and colocation meet-me room cross-connects at Switch SUPERNAP facilities.',
    retailPrice: 18500,
    drfun1WholesalePrice: 13900,
    priceUnit: 'one-time',
    stockStatus: 'In Stock',
    minOrderQuantity: 1,
    badge: '20-Year Optical IRU',
    frequencyBands: ['Terrestrial & Subsea Dark Fiber Optic Strands'],
    orbitType: 'Transcontinental Optical Ground Fiber',
    specs: [
      { label: 'Agreement Type', value: 'Indefeasible Right of Use (IRU) Master Telecom Lease' },
      { label: 'Legal Term', value: '20 Years with 10-Year Extension Options (30 Years Total)' },
      { label: 'Property Title', value: 'Real Estate Easement & Utility Right-of-Way (ROW) Title' },
      { label: 'Colocation Provisioning', value: 'Switch SUPERNAP & The Citadel Meet-Me Room Cross-Connects' },
      { label: 'SLA Covenants', value: 'Sub-4-Hour MTTR Optical Restoration & 99.999% Availability' },
      { label: 'Attorney Lead', value: 'Richard Alan Witt, Esq. (www.wittlawfirm.com)' }
    ],
    drfun1ValueAdd: [
      'Protects optical fiber investments from carrier bankruptcy and re-hypothecation',
      'Directly links DrFun1 Quantum Fiber 8G feeds with Switch 400G SuperLoop',
      'Full indemnification for wholesale resellers under Owens Company charter',
      'Verified under Certificate ID: RAW-SATCOM-2026-LIC-0881'
    ],
    switchInterconnectCampus: 'Switch SuperLoop Campuses (Las Vegas, Tahoe Reno, Grand Rapids, Atlanta)',
    unrealIrcdEnabled: true,
    risingNetProtected: true
  },
  {
    id: 'witt-turnkey-reseller-franchise-suite',
    name: 'Witt Law Firm Turnkey Reseller Wholesale Franchise Licensing Suite (Legal)',
    drfun1RebrandedName: 'Witt Law Firm Reseller Wholesale Franchise Agreement',
    tagline: 'Complete white-label rebrand license, liability shield, and turnkey reseller franchise agreement for global satellite & fiber operators',
    category: 'Witt Law Firm Satellite Fiber Escrow',
    oemCarriers: ['The Law Office of Richard A. Witt LLC', 'DrFun1 ECOM Inc.'],
    oemDescription: 'Master wholesale franchise and rebrand licensing agreement granting legal rights to re-brand, market, and re-sell DrFun1 satellite, fiber, and studio tools.',
    drfun1Description: 'Master Turnkey Reseller Franchise Legal Suite: Certified by Richard Alan Witt, Esq. Allows resellers, MSPs, and telecoms to legally rebrand DrFun1 Wireless unlocked phones, satellite 5G plans, DrFun1TV playout, and Quantum Fiber 8G under their own brand with complete statutory indemnification.',
    retailPrice: 9500,
    drfun1WholesalePrice: 7200,
    priceUnit: 'one-time',
    stockStatus: 'In Stock',
    minOrderQuantity: 1,
    badge: 'Turnkey Franchise License',
    frequencyBands: ['All Global Telecom, Satellite & Fiber Services'],
    orbitType: 'Wholesale Commercial Franchise',
    specs: [
      { label: 'Franchise Scope', value: '100% Co-Branding & Rebranding Rights for All Products on Site' },
      { label: 'Licensee Protection', value: 'Comprehensive Liability Shield & Copyright Indemnification' },
      { label: 'Revenue Escrow', value: 'Automated 95/5 Creator / Reseller Escrow Clearing Terms' },
      { label: 'IRC Governance', value: 'Pre-configured Anope NetAdmin / Oper Access Rights' },
      { label: 'Regulatory Compliance', value: 'Certified via www.wittlawfirm.com for Global Operation' },
      { label: 'Master Licensor', value: 'Richard Alan Witt (Certificate: RAW-SATCOM-2026-LIC-0881)' }
    ],
    drfun1ValueAdd: [
      'Allows instantaneous launching of co-branded phone carrier and broadcast platforms',
      'Pre-approved for hosting inside Switch SUPERNAP and RisingNet cloud nodes',
      'Direct consultation with Richard Alan Witt, Esq. (livewithdrfun1@gmail.com)',
      'Immediate access to DrFun1 Hosting Reseller Program and wholesale discount tiers'
    ],
    switchInterconnectCampus: 'Switch Core, Citadel, Pyramid, Keep & Rock Facilities',
    unrealIrcdEnabled: true,
    risingNetProtected: true
  }
];
