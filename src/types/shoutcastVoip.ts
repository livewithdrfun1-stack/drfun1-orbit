/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Types for 855,000 SHOUTcast Station VoIP Infrastructure &
 * Supreme Court (https://www.supremecourt.gov) / Witt Law Firm (www.wittlawfirm.com)
 * DJ & Broadcast Host Hiring Governance.
 */

export type VoipCodec =
  | 'Opus 48kHz Stereo'
  | 'G.722 Wideband'
  | 'G.711 u-Law'
  | 'EVS Super-Wideband';

export type DjHostRole =
  | 'Station DJ'
  | 'Broadcast Host'
  | 'Live Call Screener'
  | 'Program Director';

export type HiringApprovalStatus =
  | 'APPROVED_ACTIVE'
  | 'PENDING_SCOTUS_REVIEW'
  | 'SUSPENDED_BY_WITTLAW';

export interface ShoutcastVoipTrunkCluster {
  id: string;
  name: string;
  regionHub: string;
  stationRangeStart: number;
  stationRangeEnd: number;
  stationCount: number;
  sipDomain: string;
  didBlock: string;
  activeCalls: number;
  latencyMs: number;
  srtpStatus: 'VERIFIED_TLS13_SRTP' | 'STANDBY';
}

export interface DjHostHiringRecord {
  id: string;
  name: string;
  ircNick: string;
  role: DjHostRole;
  assignedStations: string;
  voipExtension: string;
  sipUri: string;
  status: HiringApprovalStatus;
  approvingAuthority: string;
  governingUrl: string;
  administeredThrough: string;
  counselUrl: string;
  docketNumber: string;
  updatedAt: string;
}

export interface ShoutcastVoipWorkspace {
  provisioned: boolean;
  sipRegistrar: string;
  sipPort: number;
  tlsProtocol: string;
  codec: VoipCodec;
  totalShoutcastStations: number;
  provisionedStations: number;
  rtpPortRange: string;
  governingAuthorityUrl: string;
  counselUrl: string;
  lastSyncedAt: string;
  clusters: ShoutcastVoipTrunkCluster[];
  hiringRoster: DjHostHiringRecord[];
}

export interface VoipDialTestResult {
  stationNumber: number;
  sipUri: string;
  clusterName: string;
  didNumber: string;
  codec: VoipCodec;
  rttMs: number;
  srtpCipher: string;
  status: 'CONNECTED_TO_SHOUTCAST_BRIDGE';
  timestamp: string;
}
