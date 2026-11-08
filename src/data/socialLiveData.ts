/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Social-Live Initial Destinations, Assets & Security Data
 * (Inspired by https://github.com/AxionAura/social-live.git)
 */

import { 
  SocialLiveDestination, 
  SocialLiveVideoAsset, 
  SocialLiveFfmpegConfig, 
  SocialLiveStreamHealth, 
  SocialLiveSecurityLog 
} from '../types/socialLive';

export const INITIAL_SOCIAL_LIVE_DESTINATIONS: SocialLiveDestination[] = [
  {
    id: 'dst-youtube',
    name: 'YouTube Live (DrFun1 Media Main)',
    platform: 'youtube',
    streamUrl: 'rtmp://a.rtmp.youtube.com/live2',
    streamKey: 'live_yt_884920_witt_drfun1_2026',
    encryptedKeyCipher: 'a7f9c2e1b4d89304e287fa11c08e543b8d91a2f4',
    gcmAuthTag: '9a8b7c6d5e4f3a2b1c0d',
    isEnabled: true,
    status: 'broadcasting',
    lastBroadcastAt: 'Live Now',
    viewerCount: 1420,
    bitrateKbps: 4500,
    rtmpProtocol: 'RTMP',
  },
  {
    id: 'dst-facebook',
    name: 'Facebook Live (DrFun1 Broadcasting)',
    platform: 'facebook',
    streamUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
    streamKey: 'FB-98421034-ecom-wittlaw-satcom',
    encryptedKeyCipher: 'd4e5f6a1b2c39847162534f0e9d8c7b6a5f4e3d2',
    gcmAuthTag: '3f2e1d0c9b8a7f6e5d4c',
    isEnabled: true,
    status: 'broadcasting',
    lastBroadcastAt: 'Live Now',
    viewerCount: 890,
    bitrateKbps: 4000,
    rtmpProtocol: 'RTMPS',
  },
  {
    id: 'dst-twitch',
    name: 'Twitch (drfun1tv Master Playout)',
    platform: 'twitch',
    streamUrl: 'rtmp://live.twitch.tv/app/',
    streamKey: 'live_983742189_TwitchDevBroadcaster2026',
    encryptedKeyCipher: 'c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9',
    gcmAuthTag: '1a2b3c4d5e6f7a8b9c0d',
    isEnabled: true,
    status: 'broadcasting',
    lastBroadcastAt: 'Live Now',
    viewerCount: 2340,
    bitrateKbps: 6000,
    rtmpProtocol: 'RTMP',
  },
  {
    id: 'dst-kick',
    name: 'Kick.com (drfun1 Official Channel)',
    platform: 'kick',
    streamUrl: 'rtmp://fa723fc1b171.global-contribute.live-video.net/api/v2/hls',
    streamKey: 'sk_us-west_kick_994812_drfun1_master',
    encryptedKeyCipher: 'f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e',
    gcmAuthTag: '5e4d3c2b1a0f9e8d7c6b',
    isEnabled: true,
    status: 'broadcasting',
    lastBroadcastAt: 'Live Now',
    viewerCount: 1650,
    bitrateKbps: 6000,
    rtmpProtocol: 'RTMP',
  },
  {
    id: 'dst-switch-edge',
    name: 'Switch SUPERNAP Edge RTMP Relay',
    platform: 'custom_rtmp',
    streamUrl: 'rtmp://edge-lv.switch.supernap.drfun1.com:1935/live',
    streamKey: 'switch_edge_sn8_uplink_key',
    encryptedKeyCipher: 'b2c3d4e5f6a1928374655463728190a1b2c3d4e5',
    gcmAuthTag: '8f7e6d5c4b3a2f1e0d9c',
    isEnabled: true,
    status: 'broadcasting',
    lastBroadcastAt: 'Live Now',
    viewerCount: 380,
    bitrateKbps: 8000,
    rtmpProtocol: 'RTMP',
  },
  {
    id: 'dst-datapacket-cdn',
    name: 'DataPacket 100G Trans-Atlantic RTMPS',
    platform: 'custom_rtmp',
    streamUrl: 'rtmps://rtmp-ams.datapacket.drfun1.com:443/broadcast',
    streamKey: 'datapacket_100g_ams_cross_connect',
    encryptedKeyCipher: 'e9f8a7b6c5d4132435465768798a9b0c1d2e3f4a',
    gcmAuthTag: '2b1a0f9e8d7c6b5a4f3e',
    isEnabled: false,
    status: 'idle',
    lastBroadcastAt: '2 hours ago',
    viewerCount: 0,
    bitrateKbps: 6000,
    rtmpProtocol: 'RTMPS',
  },
];

export const INITIAL_SOCIAL_LIVE_VIDEO_ASSETS: SocialLiveVideoAsset[] = [
  {
    id: 'asset-drfun1-master',
    title: 'DrFun1 Master 24/7 TV Playout Loop',
    filename: 'drfun1_master_broadcast_loop.mp4',
    durationSec: 14400, // 4 hours
    resolution: '1080p60',
    filesizeMb: 8192,
    codec: 'H.264 (High Profile) / AAC Stereo',
    loopMode: 'infinite',
    storagePath: '/opt/social-live/videos/drfun1_master_broadcast_loop.mp4',
    thumbnailGradient: 'from-purple-900 to-indigo-950',
    isSelected: true,
  },
  {
    id: 'asset-teleport-uplink',
    title: 'Switch SUPERNAP Teleport Earth Station Uplink',
    filename: 'supernap_teleport_uplink_1080p.mp4',
    durationSec: 7200, // 2 hours
    resolution: '1080p60',
    filesizeMb: 4096,
    codec: 'H.264 / AAC',
    loopMode: 'infinite',
    storagePath: '/opt/social-live/videos/supernap_teleport_uplink_1080p.mp4',
    thumbnailGradient: 'from-sky-900 to-blue-950',
    isSelected: false,
  },
  {
    id: 'asset-space-surveillance',
    title: 'LEO / MEO Constellation Orbital Tracking Reel',
    filename: 'constellation_orbital_pass_reel.mp4',
    durationSec: 3600, // 1 hour
    resolution: '4K UHD',
    filesizeMb: 9200,
    codec: 'H.265 / Opus',
    loopMode: 'single',
    storagePath: '/opt/social-live/videos/constellation_orbital_pass_reel.mp4',
    thumbnailGradient: 'from-slate-900 to-indigo-950',
    isSelected: false,
  },
  {
    id: 'asset-shoutcast-radio-visualizer',
    title: 'SHOUTcast & YouTube Music 855k Synthwave Spectrum',
    filename: 'shoutcast_855k_spectrum_deck.mp4',
    durationSec: 28800, // 8 hours
    resolution: '1080p60',
    filesizeMb: 12288,
    codec: 'H.264 / AAC 320k',
    loopMode: 'infinite',
    storagePath: '/opt/social-live/videos/shoutcast_855k_spectrum_deck.mp4',
    thumbnailGradient: 'from-pink-900 to-purple-950',
    isSelected: false,
  },
];

export const DEFAULT_SOCIAL_LIVE_FFMPEG_CONFIG: SocialLiveFfmpegConfig = {
  videoCodec: 'libx264',
  audioCodec: 'aac',
  videoBitrateKbps: 4500,
  audioBitrateKbps: 160,
  preset: 'veryfast',
  fps: 60,
  keyframeIntervalSec: 2,
  threads: 4,
  crf: 23,
  pixelFormat: 'yuv420p',
  audioSampleRateHz: 44100,
};

export const INITIAL_SOCIAL_LIVE_STREAM_HEALTH: SocialLiveStreamHealth = {
  isBroadcasting: true,
  uptimeSeconds: 1429,
  currentFps: 60.0,
  speedMultiplier: 1.00,
  outputBitrateKbps: 4620,
  droppedFrames: 0,
  totalFrames: 85740,
  cpuUsagePct: 14.8,
  memoryUsageMb: 86.4,
  activeEncodersCount: 5,
};

export const INITIAL_SOCIAL_LIVE_SECURITY_LOGS: SocialLiveSecurityLog[] = [
  {
    id: 'sec-1',
    timestamp: '02:08:14 UTC',
    eventType: 'aes_encrypt',
    severity: 'info',
    message: 'AES-256-GCM encrypted stream credentials stored at rest (/etc/social-live/vault.db)',
    actor: 'system/crypto',
  },
  {
    id: 'sec-2',
    timestamp: '02:08:15 UTC',
    eventType: 'stream_key_redact',
    severity: 'info',
    message: 'Stream keys for 5 active destinations auto-redacted in all stdout/stderr logs',
    actor: 'system/logger',
  },
  {
    id: 'sec-3',
    timestamp: '02:08:16 UTC',
    eventType: 'ssrf_check',
    severity: 'notice',
    message: 'SSRF validation passed: Blocked 127.0.0.1 and 169.254.169.254 from remote video pull requests',
    actor: 'network/ssrf_filter',
  },
  {
    id: 'sec-4',
    timestamp: '02:08:17 UTC',
    eventType: 'spawn_execute',
    severity: 'info',
    message: 'FFmpeg spawned via safe argv array: ["ffmpeg", "-re", "-stream_loop", "-1", "-i", ...]',
    actor: 'proc/spawn_guard',
  },
  {
    id: 'sec-5',
    timestamp: '02:08:20 UTC',
    eventType: 'audit_event',
    severity: 'info',
    message: 'Multi-destination broadcast active to YouTube, Facebook, Twitch, Kick, and Switch SUPERNAP',
    actor: 'admin/RichardAlanWitt',
  },
];
