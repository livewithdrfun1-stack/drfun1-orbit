/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Social-Live: Self-Hosted Multi-Platform Live Streaming Dashboard
 * (Inspired by https://github.com/AxionAura/social-live.git)
 */

export type SocialLivePlatform = 'youtube' | 'facebook' | 'twitch' | 'kick' | 'custom_rtmp';

export type SocialLiveDestinationStatus = 'broadcasting' | 'idle' | 'connecting' | 'error';

export interface SocialLiveDestination {
  id: string;
  name: string;
  platform: SocialLivePlatform;
  streamUrl: string;
  streamKey: string;
  encryptedKeyCipher: string; // AES-256-GCM ciphertext representation
  gcmAuthTag: string;
  isEnabled: boolean;
  status: SocialLiveDestinationStatus;
  lastBroadcastAt?: string;
  viewerCount: number;
  bitrateKbps: number;
  rtmpProtocol: 'RTMP' | 'RTMPS';
}

export interface SocialLiveVideoAsset {
  id: string;
  title: string;
  filename: string;
  durationSec: number;
  resolution: '1080p60' | '1080p30' | '720p60' | '4K UHD';
  filesizeMb: number;
  codec: string;
  loopMode: 'infinite' | 'single' | 'scheduled';
  storagePath: string;
  thumbnailGradient: string;
  isSelected: boolean;
}

export interface SocialLiveFfmpegConfig {
  videoCodec: 'libx264' | 'h264_nvenc' | 'libx265' | 'copy';
  audioCodec: 'aac' | 'libmp3lame' | 'copy';
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  preset: 'ultrafast' | 'veryfast' | 'faster' | 'fast' | 'medium';
  fps: number;
  keyframeIntervalSec: number;
  threads: number;
  crf: number;
  pixelFormat: 'yuv420p' | 'nv12';
  audioSampleRateHz: number;
}

export interface SocialLiveStreamHealth {
  isBroadcasting: boolean;
  uptimeSeconds: number;
  currentFps: number;
  speedMultiplier: number;
  outputBitrateKbps: number;
  droppedFrames: number;
  totalFrames: number;
  cpuUsagePct: number;
  memoryUsageMb: number;
  activeEncodersCount: number;
}

export interface SocialLiveSecurityLog {
  id: string;
  timestamp: string;
  eventType: 'aes_encrypt' | 'stream_key_redact' | 'ssrf_check' | 'spawn_execute' | 'audit_event';
  severity: 'info' | 'notice' | 'warning';
  message: string;
  actor: string;
}
