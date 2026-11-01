/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 */

export type AnopeRankLevel = 
  | 'listener' // Level 1-99, regular chatter / listener
  | 'voice'    // Level 100, +v (VOP)
  | 'halfop'   // Level 300, %h (HOP)
  | 'op'       // Level 500, @o (AOP / Channel Operator) -> OPS AND ABOVE
  | 'sop'      // Level 800, &a (SOP / Super Operator)
  | 'founder'  // Level 1000, ~q (Channel Founder)
  | 'so'       // Level 2000, Services Operator
  | 'admin'    // Level 5000, Services Admin (SA)
  | 'sra';     // Level 9999, Services Root Admin (SRA) / NetAdmin

export interface AnopeRankDefinition {
  id: AnopeRankLevel;
  name: string;
  prefix: string;
  modes: string;
  accessLevel: number;
  description: string;
  isOpsAndAbove: boolean;
  canOperateIrcd: boolean;
  canGoLiveDj: boolean;
  canMicDuck: boolean;
  canSkipTracks: boolean;
  canManageCrate: boolean;
  canRehashServer: boolean;
  canKlineZline: boolean;
  canChanServAdmin: boolean;
  canOperServAdmin: boolean;
  badgeColor: string;
  roleIcon: string;
}

export interface UnrealIrcdConfigOptions {
  serverName: string;
  sid: string;
  networkName: string;
  adminContact: string;
  diePassword: string;
  restartPassword: string;
  cloakKey1: string;
  cloakKey2: string;
  cloakKey3: string;
  maxClients: number;
  maxChannelsPerUser: number;
  pingFrequency: number;
  pingCookie: boolean;
  connectTimeout: number;
  modesOnConnect: string;
  sslVerifyClient: boolean;
  antiFlood: {
    joinThrottle: string; // e.g. "3:10" (3 joins in 10s)
    nickFlood: string;    // "3:10"
    awayFlood: string;    // "4:30"
    msgFlood: string;     // "10:10"
    connectFlood: string; // "5:10"
    handshakeTimeout: number;
    maxUnknownConnections: number;
  };
  listenBlocks: {
    id: string;
    ip: string;
    port: number;
    tls: boolean;
    webSocket: boolean;
    description: string;
    active: boolean;
  }[];
  operBlocks: {
    id: string;
    name: string;
    operClass: 'netadmin' | 'services-admin' | 'oper' | 'locadmin';
    vhost: string;
    swhois: string;
    sslOnly: boolean;
    snomask: string;
    active: boolean;
  }[];
  linkBlocks: {
    id: string;
    name: string;
    hostname: string;
    port: number;
    tls: boolean;
    compression: boolean;
    leafOrHub: 'leaf' | 'hub';
    status: 'connected' | 'syncing' | 'offline';
    lastSync: string;
  }[];
  banRules: {
    id: string;
    type: 'KLINE' | 'GLINE' | 'ZLINE' | 'SHUN' | 'QLINE';
    mask: string;
    reason: string;
    setBy: string;
    expiresIn: string;
    active: boolean;
  }[];
}

export interface ChanServChannel {
  channel: string;
  registeredDate: string;
  founder: string;
  successor: string;
  description: string;
  mlock: string; // e.g. "+nt-s"
  entryMsg: string;
  url: string;
  fantasy: boolean;
  topicLock: boolean;
  accessList: {
    mask: string;
    level: number;
    rankName: string;
    addedBy: string;
    addedDate: string;
  }[];
  bans: {
    mask: string;
    setBy: string;
    setDate: string;
    reason: string;
  }[];
}

export interface NickServAccount {
  account: string;
  email: string;
  registered: string;
  lastSeen: string;
  rank: AnopeRankLevel;
  vhost: string;
  certfp?: string;
  killStatus: 'quick' | 'immed' | 'off';
  hideEmail: boolean;
  hideMask: boolean;
  suspended: boolean;
}

export interface OperServEntry {
  akills: {
    mask: string;
    setBy: string;
    reason: string;
    expires: string;
  }[];
  globalWallopsLog: {
    timestamp: string;
    oper: string;
    message: string;
  }[];
  sessionLimits: {
    host: string;
    limit: number;
  }[];
}

export interface BotServBot {
  nick: string;
  user: string;
  host: string;
  realname: string;
  channelsAssigned: string[];
  fantasyCommands: string[];
  badwordsCount: number;
  kickOnBadwords: boolean;
  kickOnCaps: boolean;
  kickOnFlood: boolean;
}

export interface HostServVHost {
  nick: string;
  vhost: string;
  status: 'active' | 'pending' | 'rejected';
  assignedBy: string;
  requestedDate: string;
}

export interface OperAuditLog {
  id: string;
  timestamp: string;
  operNick: string;
  operRank: AnopeRankLevel;
  command: string;
  target?: string;
  status: 'success' | 'denied' | 'error';
  details: string;
}

export interface DjPermissionMatrix {
  rank: AnopeRankLevel;
  roleTitle: string;
  canTakeoverLiveMount: boolean;
  canDuckMicrophone: boolean;
  canControlPlayback: boolean;
  canBypassSongLimit: boolean;
  canTriggerIrcWallops: boolean;
  canManageQueuePriority: boolean;
  canAcceptListenerRequests: boolean;
}
