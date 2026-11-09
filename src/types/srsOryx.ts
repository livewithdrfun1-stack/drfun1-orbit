/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * SRS Oryx (formerly SRS Stack) Type Definitions
 * Source: https://github.com/ossrs/oryx.git
 * Open-source AI-driven all-in-one video solution based on SRS, FFmpeg, Go & ReactJS.
 */

export type SrsProtocol = 'rtmp' | 'webrtc' | 'srt' | 'http_flv' | 'hls';

export interface SrsStreamEndpoint {
  id: string;
  name: string;
  protocol: SrsProtocol;
  ingestUrl: string;
  streamKey: string;
  playbackUrl: string;
  latency: string;
  videoCodec: string;
  audioCodec: string;
  description: string;
}

export interface SrsForwardDestination {
  id: string;
  name: string;
  platform: 'youtube' | 'twitch' | 'kick' | 'facebook' | 'twitter_x' | 'custom_rtmp';
  targetUrl: string;
  streamKey: string;
  enabled: boolean;
  status: 'publishing' | 'idle' | 'error' | 'reconnecting';
  bitrateKbps: number;
  fps: number;
  uptimeSeconds: number;
}

export interface SrsVirtualLiveTask {
  id: string;
  title: string;
  sourceUrl: string;
  sourceType: 'mp4_vod' | 'satellite_capture' | 'fcc_archive' | 'custom_url';
  duration: string;
  loop: boolean;
  status: 'playing' | 'paused' | 'stopped';
  currentPositionSec: number;
  totalDurationSec: number;
  targetStreamKey: string;
  volume: number;
}

export interface SrsDvrRecord {
  id: string;
  streamName: string;
  startTime: string;
  duration: string;
  fileSizeMb: number;
  format: 'mp4' | 'flv' | 'hls_m3u8';
  status: 'recording' | 'completed' | 'archived';
  storagePath: string;
  downloadUrl: string;
}

export interface SrsAiSubtitleSnippet {
  id: string;
  timestamp: string;
  speaker: string;
  language: string;
  text: string;
  confidence: number;
}

export interface SrsServerTelemetry {
  version: string;
  pid: number;
  uptimeSeconds: number;
  activeStreams: number;
  activeClients: number;
  inBitrateKbps: number;
  outBitrateMbps: number;
  cpuPercent: number;
  ramPercent: number;
  diskFreeGb: number;
  totalBytesInGb: number;
  totalBytesOutGb: number;
  srsCoreStatus: 'healthy' | 'degraded' | 'restarting';
  aiEngineStatus: 'online' | 'standby';
}
