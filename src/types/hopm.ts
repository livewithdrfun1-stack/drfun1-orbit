/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * Hybrid Open Proxy Monitor (HOPM) Types — UnrealIRCd 6.1.4 4-Hub Protection
 */

export type HopmBanAction = 'GZLINE' | 'KLINE' | 'GLINE';
export type HopmBanDuration = '1d' | '7d' | '30d' | '0';
export type HopmProtocolType = 'HTTP' | 'HTTPPOST' | 'SOCKS4' | 'SOCKS5' | 'WINGATE' | 'ROUTER';

export interface HopmScannerProtocol {
  id: string;
  protocol: HopmProtocolType;
  ports: number[];
  enabled: boolean;
  targetIp: string;
  targetPort: number;
  timeoutSec: number;
  hits: number;
}

export interface HopmDnsblZone {
  id: string;
  zone: string;
  replyBitmasks: string;
  enabled: boolean;
  banReason: string;
  hits: number;
}

export interface HopmExemptEntry {
  id: string;
  mask: string;
  reason: string;
  addedBy: string;
  addedAt: string;
}

export interface HopmDetectionEvent {
  id: string;
  timestamp: string;
  ip: string;
  nick: string;
  identHost: string;
  hub: string;
  detectionSource: 'SCANNER' | 'DNSBL' | 'EXEMPT' | 'CLEAN';
  detail: string;
  actionIssued: string;
  duration: string;
}

export interface HopmDaemonState {
  installed: boolean;
  version: string;
  installPath: string;
  repoUrl: string;
  systemdUnit: string;
  status: 'running' | 'stopped' | 'not_installed';
  installedAt: string;
  lastRehashAt: string;
  operNick: string;
  operPasswordMask: string;
  bindIp: string;
  banAction: HopmBanAction;
  banDuration: HopmBanDuration;
  negCacheSeconds: number;
  maxScanConcurrency: number;
  fdLimit: number;
  monitoredHubs: string[];
}

export interface HopmProbeResultItem {
  checkName: string;
  category: 'SCANNER' | 'DNSBL' | 'EXEMPT';
  status: 'OPEN_HIT' | 'LISTED' | 'CLOSED' | 'EXEMPT';
  latencyMs: number;
  detail: string;
}

export interface HopmScanReport {
  ip: string;
  nick: string;
  hub: string;
  verdict: 'PROXY_DETECTED' | 'DNSBL_LISTED' | 'EXEMPT' | 'CLEAN';
  actionIssued: string;
  probes: HopmProbeResultItem[];
  event: HopmDetectionEvent;
}
