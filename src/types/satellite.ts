export type OrbitType = 'LEO' | 'MEO' | 'GEO' | 'Hybrid' | 'Ground Segment';

export type FrequencyBand = 
  | 'Ka-band'
  | 'Ku-band'
  | 'C-band'
  | 'L-band'
  | 'S-band'
  | 'X-band'
  | 'VHF/UHF'
  | 'UHF/VHF'
  | 'Optical/Laser'
  | '3GPP NTN';

export type ServiceCategory = 
  | 'Broadband & Backhaul'
  | 'Direct-to-Device (D2D)'
  | 'IoT & M2M'
  | 'Mobility (Aero & Maritime)'
  | 'Earth Observation & SAR'
  | 'Broadcast & Media'
  | 'Defense & Secure Satcom'
  | 'Teleport & Ground Infrastructure';

export type ConstellationStatus = 'Operational' | 'Expanding Constellation' | 'Planned / Next-Gen';

export interface DepartmentContact {
  department: string;
  email: string;
  phone?: string;
  contactPerson?: string;
  notes?: string;
}

export interface SwitchInterconnectProfile {
  connectedCampus: string;
  crossConnectType: string;
  switchUrl: string;
  risingNetTransit: string;
  risingNetUrl: string;
  unrealIrcdDaemon: {
    software: string;
    website: string;
    hubHost: string;
    port: number;
    channel: string;
    leafRole: string;
    suggestedLinkConfig: string;
  };
}

export interface SatelliteCompany {
  id: string;
  name: string;
  legalName: string;
  headquarters: {
    city: string;
    country: string;
    region: 'Americas' | 'EMEA' | 'APAC' | 'Global';
  };
  founded: number;
  website: string;
  portalUrl?: string;
  orbitType: OrbitType;
  altitudeKm: string;
  latencyMs: string;
  throughputSummary: string;
  frequencyBands: FrequencyBand[];
  fleetSize: {
    activeSatellites: number;
    plannedSatellites: number;
    generationDetails?: string;
  };
  coverage: string;
  categories: ServiceCategory[];
  status: ConstellationStatus;
  summary: string;
  satcomWholesaleOfferings: string[];
  keyStrengths: string[];
  contacts: DepartmentContact[];
  teleportLocations?: string[];
  regulatoryFilingCountry: string;
  isCustom?: boolean;
  switchInterconnect?: SwitchInterconnectProfile;
}

export interface CompanyFilterState {
  searchQuery: string;
  orbit: OrbitType | 'All';
  band: FrequencyBand | 'All';
  category: ServiceCategory | 'All';
  region: 'All' | 'Americas' | 'EMEA' | 'APAC' | 'Global';
  status: ConstellationStatus | 'All';
  bookmarkedOnly: boolean;
}

export interface UserNote {
  companyId: string;
  accountManager?: string;
  ndaStatus?: 'Not Signed' | 'In Review' | 'Active NDA';
  partnershipStatus?: 'Prospect' | 'In Discussion' | 'Contract Active' | 'Vendor';
  notes: string;
  updatedAt: string;
}
