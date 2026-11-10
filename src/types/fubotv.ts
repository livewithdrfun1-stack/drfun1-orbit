/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Fubo.tv Sports-First Live TV Streaming & EPG Types
 * Regulatory Counsel: The Law Office of Richard A. Witt LLC | FCC FRN: 0034981290
 */

export type FuboCategory = 
  | 'All'
  | 'Sports'
  | 'News'
  | 'Entertainment'
  | '4K Ultra HD'
  | 'DrFun1 Networks';

export type FuboSportLeague = 
  | 'All Sports'
  | 'NFL'
  | 'Premier League'
  | 'NBA'
  | 'UEFA Champions League'
  | 'MLB'
  | 'Formula 1'
  | 'NHL'
  | 'College Football'
  | 'NASCAR'
  | 'Tennis';

export interface FuboChannel {
  id: string;
  channelNumber: number;
  name: string;
  callSign: string;
  category: FuboCategory;
  is4K: boolean;
  isLive: boolean;
  currentProgram: string;
  currentHostOrTeam: string;
  currentDuration: string;
  upNextProgram: string;
  streamUrl: string;
  logoBgColor: string;
  accentColor: string;
  viewersCount: number;
  unrealIrcChannel: string;
  programsSchedule: {
    timeSlot: string; // e.g. "Now", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM"
    title: string;
    episode?: string;
    isLive?: boolean;
    rating?: string;
    description: string;
  }[];
}

export interface FuboLiveGame {
  id: string;
  league: FuboSportLeague;
  sport: 'Football' | 'Soccer' | 'Basketball' | 'Baseball' | 'Motorsport' | 'Hockey' | 'Tennis';
  homeTeam: {
    name: string;
    shortName: string;
    score: number;
    color: string;
    record?: string;
  };
  awayTeam: {
    name: string;
    shortName: string;
    score: number;
    color: string;
    record?: string;
  };
  status: 'live' | 'upcoming' | 'final';
  gameClock: string; // e.g. "4th Qtr 02:45", "78'", "Top 8th", "Final"
  period: string; // e.g. "Q4", "2nd Half", "3rd Period"
  channelId: string;
  channelName: string;
  venue: string;
  has4K: boolean;
  possession?: 'home' | 'away';
  keyStats?: {
    label: string;
    homeVal: string | number;
    awayVal: string | number;
  }[];
}

export interface FuboDvrRecording {
  id: string;
  title: string;
  subtitle: string;
  channelName: string;
  recordedAt: string;
  durationMinutes: number;
  fileSizeGb: number;
  thumbnail: string;
  category: string;
  isFavorite?: boolean;
}

export interface FuboMultiViewSlot {
  slotId: number; // 0, 1, 2, 3
  channelId: string;
  isMuted: boolean;
}
