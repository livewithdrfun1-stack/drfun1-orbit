export type ReactionType = 'like' | 'love' | 'care' | 'launch' | 'satcom' | 'insight';

export interface ReactionCount {
  like: number;
  love: number;
  care: number;
  launch: number;
  satcom: number;
  insight: number;
}

export interface SocialUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  role: string;
  organization: string;
  isOnline: boolean;
  orbitBadges?: string[];
}

export interface SocialComment {
  id: string;
  author: SocialUser;
  content: string;
  timestamp: string;
  likes: number;
  userLiked?: boolean;
}

export interface SocialPost {
  id: string;
  author: SocialUser;
  timestamp: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'telemetry_card';
  mediaCaption?: string;
  satelliteTag?: string;
  orbitTag?: string;
  groundStation?: string;
  reactions: ReactionCount;
  userReaction?: ReactionType | null;
  comments: SocialComment[];
  shares: number;
  privacy: 'public' | 'engineers' | 'switch_noc' | 'legal_witt';
  pinned?: boolean;
}

export interface SocialStory {
  id: string;
  author: SocialUser;
  mediaUrl: string;
  caption: string;
  timestamp: string;
  unseen: boolean;
  orbitTelemetry?: string;
}

export interface SocialCommunity {
  id: string;
  name: string;
  tagline: string;
  membersCount: number;
  icon: string;
  bannerGradient: string;
  isJoined?: boolean;
  category: 'Constellations' | 'Ground Teleports' | 'RF Engineering' | 'Legal & Spectrum' | 'IRC Leaf Operators';
}
