export type MembershipTierId = 'cadet_free' | 'broadcaster_pro' | 'satcom_enterprise' | 'vip_founder';

export type BillingCycle = 'monthly' | 'annual';

export interface MembershipPlan {
  id: MembershipTierId;
  name: string;
  badge: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number; // usually ~10x monthly (2 months free)
  isPopular?: boolean;
  color: string;
  accentBg: string;
  borderClass: string;
  badgeClass: string;
  features: string[];
  zncBufferLines: number;
  maxBroadcastChannels: number;
  maxIrcRooms: number;
  hostingDiscountPercent: number;
  adRevenueSharePercent: number;
  supportLevel: 'Community Forums' | 'Standard Email & Ticket' | '24/7 Teleport NOC Priority' | 'Dedicated NetAdmin Concierge';
}

export interface UserMembershipInvoice {
  id: string;
  date: string;
  planName: string;
  amount: number;
  cycle: BillingCycle;
  status: 'Paid' | 'Processed' | 'Active';
  invoicePdfRef: string;
}

export interface UserMembershipState {
  tierId: MembershipTierId;
  cycle: BillingCycle;
  memberId: string;
  callsign: string;
  joinDate: string;
  renewalDate: string;
  zncUsername: string;
  zncServer: string;
  activeChannelsRegistered: string[];
  invoices: UserMembershipInvoice[];
  reputationPoints: number;
}

export interface CommunityDiscussionTopic {
  id: string;
  title: string;
  author: {
    name: string;
    callsign: string;
    tier: MembershipTierId;
    avatarUrl?: string;
  };
  category: 'Broadcasting & Teleports' | 'IRC & ZNC Bouncers' | 'Satcom RF & Orbitals' | 'DataPacket Hosting' | 'FCC & Witt Law Regulatory' | 'General Lounge';
  createdAt: string;
  replyCount: number;
  upvotes: number;
  pinned?: boolean;
  content: string;
  tags: string[];
  linkedIrcChannel?: string;
}

export interface CommunityChannelSpotlight {
  id: string;
  channelName: string;
  operatorName: string;
  operatorCallsign: string;
  operatorTier: MembershipTierId;
  category: 'Public Access TV' | 'Amateur HAM Radio' | 'Spaceflight & NASA Live' | 'Synthwave & Electronic DJ' | 'Maritime Coast Guard';
  description: string;
  streamUrl: string;
  ircChannel: string;
  currentListeners: number;
  bitrate: string;
  verifiedWittLaw: boolean;
}

export interface CommunityEvent {
  id: string;
  title: string;
  hostName: string;
  hostCallsign: string;
  date: string;
  timeUtc: string;
  category: 'Rocket Launch Watch Party' | 'IRC NetMeeting' | 'Satellite Orbital Drift Scan' | 'Broadcaster Workshop';
  description: string;
  ircChannel: string;
  streamUrl?: string;
  rsvpCount: number;
  isUserRsvpd?: boolean;
}
