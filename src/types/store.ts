export type ProductCategory = 
  | 'Terminals & User Hardware'
  | 'Bandwidth & Enterprise CIR'
  | 'Direct-to-Device (3GPP NTN)'
  | 'Satellite IoT & Asset Tracking'
  | 'Teleport & Switch Colocation'
  | 'Earth Observation & SAR Data'
  | 'ISP & Dedicated Satellite Internet'
  | 'Wireless Carrier & 5G NTN eSIM'
  | 'Bare-Metal & Teleport Hosting'
  | 'Quantum Fiber & Terrestrial Optical'
  | 'DrFun1 Broadcast TV & Online Radio'
  | 'Phone Carrier Spectrum & Backhaul';

export interface StoreProduct {
  id: string;
  name: string; // Original OEM / carrier product name
  drfun1RebrandedName: string; // DrFun1 branded edition name
  tagline: string;
  category: ProductCategory;
  oemCarriers: string[]; // Reference to satellite companies
  oemDescription: string;
  drfun1Description: string;
  retailPrice: number;
  drfun1WholesalePrice: number;
  priceUnit: 'one-time' | 'per_month' | 'per_mhz_month' | 'per_device_month';
  stockStatus: 'In Stock' | 'Pre-Order' | 'Custom Commissioning';
  minOrderQuantity: number;
  badge?: string;
  frequencyBands: string[];
  orbitType: string;
  specs: {
    label: string;
    value: string;
  }[];
  drfun1ValueAdd: string[];
  switchInterconnectCampus?: string;
  unrealIrcdEnabled: boolean;
  risingNetProtected: boolean;
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
  isDrfun1Branded: boolean; // true = DrFun1 Branded, false = OEM White-label
  addSwitchColocation: boolean;
  addRisingNetTransit: boolean;
  addUnrealIrcdPeering: boolean;
}

export interface ProcurementOrder {
  orderId: string;
  items: CartItem[];
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  shippingAddress?: string;
  billingNotes?: string;
  totalWholesale: number;
  totalRetail: number;
  totalSavings: number;
  submittedAt: string;
}
