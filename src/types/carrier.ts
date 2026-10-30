export type CarrierCategory = 
  | 'Direct-to-Cellular (MNO)'
  | '3GPP 5G NTN Satellite'
  | 'Cell Tower Fiber Backhaul'
  | 'Global MVNO & Roaming'
  | 'Emergency SOS Satellite';

export interface PhoneCarrier {
  id: string;
  name: string;
  brandName: string;
  country: string;
  region: 'North America' | 'Europe' | 'Asia-Pacific' | 'Latin America' | 'Global';
  flag: string;
  category: CarrierCategory;
  subscribers: string;
  cellularGenerations: string[]; // e.g. ['4G LTE', '5G NR', '5G NTN', 'Direct-to-Cell']
  spectrumFrequencies: string[]; // e.g. ['PCS Band 25 (1900 MHz)', '850 MHz Low-Band', 'S-Band n256', 'Band n53']
  satellitePartners: string[]; // e.g. ['Starlink Direct-to-Cell', 'AST SpaceMobile', 'Skylo Technologies', 'Quantum Fiber']
  drfun1EcomRole: string;
  drfun1ContractStatus: 'Active Commercial Interconnect' | 'Wholesale Roaming Partner' | 'Co-Branded Backhaul' | 'Pilot Network Integration';
  legalEscrow: string;
  colocationTeleport: string;
  transitBackbone: string;
  unrealIrcChannel: string;
  simProvisioningApi: string;
  specs: {
    label: string;
    value: string;
  }[];
  keyBenefits: string[];
  websiteUrl: string;
}
