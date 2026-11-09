/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * SRS Oryx (https://github.com/ossrs/oryx.git) Default Data
 */

import { 
  SrsStreamEndpoint, 
  SrsForwardDestination, 
  SrsVirtualLiveTask, 
  SrsDvrRecord, 
  SrsAiSubtitleSnippet, 
  SrsServerTelemetry 
} from '../types/srsOryx';

export const INITIAL_SRS_STREAM_ENDPOINTS: SrsStreamEndpoint[] = [
  {
    id: 'srs-rtmp',
    name: 'RTMP Publishing Gate',
    protocol: 'rtmp',
    ingestUrl: 'rtmp://live.drfun1media.com:1935/live',
    streamKey: 'drfun1-master-feed',
    playbackUrl: 'rtmp://live.drfun1media.com:1935/live/drfun1-master-feed',
    latency: '1.2s - 2.5s',
    videoCodec: 'H.264 / AVC (High Profile)',
    audioCodec: 'AAC-LC 128kbps stereo',
    description: 'Standard RTMP port 1935 ingest for OBS Studio, vMix, Wirecast, and hardware encoders.'
  },
  {
    id: 'srs-webrtc',
    name: 'WebRTC Ultra-Low Latency (WHIP / WHEP)',
    protocol: 'webrtc',
    ingestUrl: 'http://live.drfun1media.com:1985/rtc/v1/whip/?app=live&stream=drfun1-master-feed',
    streamKey: 'whip-token-raw-satcom-2026',
    playbackUrl: 'http://live.drfun1media.com:1985/rtc/v1/whep/?app=live&stream=drfun1-master-feed',
    latency: '200ms - 500ms (Sub-second)',
    videoCodec: 'H.264 / VP8 / AV1 adaptive',
    audioCodec: 'Opus 48kHz HD Audio',
    description: 'IETF WHIP (Ingest) & WHEP (Playback) standard for interactive studio teleprompter and broadcast monitor.'
  },
  {
    id: 'srs-srt',
    name: 'SRT (Secure Reliable Transport) Fiber & Space Link',
    protocol: 'srt',
    ingestUrl: 'srt://live.drfun1media.com:10080?streamid=#!::h=live.drfun1media.com,r=live/drfun1-master-feed,m=publish',
    streamKey: 'srt-passphrase-frn0034981290',
    playbackUrl: 'srt://live.drfun1media.com:10080?streamid=#!::h=live.drfun1media.com,r=live/drfun1-master-feed,m=request',
    latency: '300ms - 800ms',
    videoCodec: 'H.264 / H.265 (HEVC 4K ready)',
    audioCodec: 'AAC / PCM Passthrough',
    description: 'ARQ error-correction over volatile public Internet, satellite uplink, and Switch SUPERNAP fiber cross-connects.'
  },
  {
    id: 'srs-http-flv',
    name: 'HTTP-FLV Edge Downlink',
    protocol: 'http_flv',
    ingestUrl: 'Internal SRS Demuxer Engine',
    streamKey: 'auto-converted',
    playbackUrl: 'http://live.drfun1media.com:8080/live/drfun1-master-feed.flv',
    latency: '1.0s - 1.8s',
    videoCodec: 'H.264',
    audioCodec: 'AAC',
    description: 'Chunked transfer for low-overhead web players and master control room multi-view displays.'
  },
  {
    id: 'srs-hls',
    name: 'HLS / LL-HLS Mobile & CDN Distribution',
    protocol: 'hls',
    ingestUrl: 'Internal SRS Transcoder Engine',
    streamKey: 'auto-chunked',
    playbackUrl: 'http://live.drfun1media.com:8080/live/drfun1-master-feed.m3u8',
    latency: '2.5s - 5.0s (LL-HLS)',
    videoCodec: 'H.264 Multi-Bitrate (1080p, 720p, 480p)',
    audioCodec: 'AAC-LC',
    description: 'Apple HLS playlist with fMP4 segments distributed across DataPacket CDN and Switch teleports.'
  }
];

export const INITIAL_SRS_FORWARD_DESTINATIONS: SrsForwardDestination[] = [
  {
    id: 'fwd-youtube',
    name: 'YouTube Live Primary (Oryx Forwarder)',
    platform: 'youtube',
    targetUrl: 'rtmp://a.rtmp.youtube.com/live2',
    streamKey: 'drf1-yt-8492-7201-9921-live',
    enabled: true,
    status: 'publishing',
    bitrateKbps: 4500,
    fps: 60,
    uptimeSeconds: 7820
  },
  {
    id: 'fwd-twitch',
    name: 'Twitch TV (Oryx Ingest US-West)',
    platform: 'twitch',
    targetUrl: 'rtmp://sfo.contribute.live-video.net/app',
    streamKey: 'live_drfun1_twitch_key_77192',
    enabled: true,
    status: 'publishing',
    bitrateKbps: 6000,
    fps: 60,
    uptimeSeconds: 7820
  },
  {
    id: 'fwd-kick',
    name: 'Kick.com Live Gateway',
    platform: 'kick',
    targetUrl: 'rtmps://fa723fc1b171.global-contribute.live-video.net:443/app',
    streamKey: 'sk_us_kick_broadcaster_9921',
    enabled: true,
    status: 'publishing',
    bitrateKbps: 6500,
    fps: 60,
    uptimeSeconds: 7820
  },
  {
    id: 'fwd-facebook',
    name: 'Facebook Live Video Desk',
    platform: 'facebook',
    targetUrl: 'rtmps://live-api-s.facebook.com:443/rtmp',
    streamKey: 'FB-981249-drfun1-stream-key',
    enabled: false,
    status: 'idle',
    bitrateKbps: 0,
    fps: 0,
    uptimeSeconds: 0
  },
  {
    id: 'fwd-x',
    name: 'X (Twitter Live Producer)',
    platform: 'twitter_x',
    targetUrl: 'rtmp://va.pscp.tv:80/x',
    streamKey: 'x_live_drfun1_transmission_9281',
    enabled: true,
    status: 'publishing',
    bitrateKbps: 3500,
    fps: 30,
    uptimeSeconds: 3100
  },
  {
    id: 'fwd-satcom',
    name: 'Switch SUPERNAP Teleport Master Headend',
    platform: 'custom_rtmp',
    targetUrl: 'rtmp://teleport.switch.com:1935/headend',
    streamKey: 'switch-drfun1-ecom-transponder-12',
    enabled: true,
    status: 'publishing',
    bitrateKbps: 9000,
    fps: 60,
    uptimeSeconds: 14200
  }
];

export const INITIAL_SRS_VIRTUAL_LIVE_TASKS: SrsVirtualLiveTask[] = [
  {
    id: 'vtask-1',
    title: 'DrFun1 Master Channel 24/7 Loop',
    sourceUrl: 'https://cdn.drfun1media.com/vod/2026/galaxy_broadcasting_loop.mp4',
    sourceType: 'mp4_vod',
    duration: '02:45:00',
    loop: true,
    status: 'playing',
    currentPositionSec: 3740,
    totalDurationSec: 9900,
    targetStreamKey: 'drfun1-master-feed',
    volume: 85
  },
  {
    id: 'vtask-2',
    title: 'FCC Spectrum Public Docket News Archive',
    sourceUrl: 'https://cdn.drfun1media.com/vod/fcc_space_bureau_briefing.mp4',
    sourceType: 'fcc_archive',
    duration: '00:54:12',
    loop: true,
    status: 'playing',
    currentPositionSec: 1210,
    totalDurationSec: 3252,
    targetStreamKey: 'drfun1-fcc-news-feed',
    volume: 80
  },
  {
    id: 'vtask-3',
    title: 'Switch SUPERNAP 100G Optical Teleport Cam',
    sourceUrl: 'https://cdn.drfun1media.com/live/teleport_roof_cam_hd.mp4',
    sourceType: 'satellite_capture',
    duration: '24:00:00',
    loop: true,
    status: 'playing',
    currentPositionSec: 42100,
    totalDurationSec: 86400,
    targetStreamKey: 'drfun1-teleport-feed',
    volume: 0
  }
];

export const INITIAL_SRS_DVR_RECORDS: SrsDvrRecord[] = [
  {
    id: 'dvr-2026-11-09-01',
    streamName: 'drfun1-master-feed',
    startTime: '2026-11-09 01:00:00 UTC',
    duration: '02:00:00',
    fileSizeMb: 4120,
    format: 'mp4',
    status: 'completed',
    storagePath: '/data/dvr/drfun1-master-feed-20261109-0100.mp4',
    downloadUrl: 'https://cdn.drfun1media.com/dvr/drfun1-master-feed-20261109-0100.mp4'
  },
  {
    id: 'dvr-2026-11-09-02',
    streamName: 'drfun1-fcc-news-feed',
    startTime: '2026-11-09 03:00:00 UTC',
    duration: '00:58:30',
    fileSizeMb: 1980,
    format: 'mp4',
    status: 'completed',
    storagePath: '/data/dvr/drfun1-fcc-news-feed-20261109-0300.mp4',
    downloadUrl: 'https://cdn.drfun1media.com/dvr/drfun1-fcc-news-feed-20261109-0300.mp4'
  },
  {
    id: 'dvr-2026-11-09-03',
    streamName: 'drfun1-master-feed',
    startTime: '2026-11-09 04:00:00 UTC',
    duration: 'In Progress (00:04:20)',
    fileSizeMb: 142,
    format: 'hls_m3u8',
    status: 'recording',
    storagePath: '/data/dvr/live_session_current.m3u8',
    downloadUrl: '#'
  }
];

export const INITIAL_SRS_AI_SUBTITLES: SrsAiSubtitleSnippet[] = [
  {
    id: 'sub-1',
    timestamp: '00:01:14',
    speaker: 'Anchor Desk',
    language: 'English (US)',
    text: 'Good morning, you are tuned into DrFun1 Media Master Broadcast Studio live from Switch SUPERNAP teleports.',
    confidence: 0.99
  },
  {
    id: 'sub-2',
    timestamp: '00:01:22',
    speaker: 'Co-Anchor',
    language: 'English (US)',
    text: 'The Federal Communications Commission has authorized new spectrum downlinks under FRN 0034981290 with Witt Law Firm oversight.',
    confidence: 0.98
  },
  {
    id: 'sub-3',
    timestamp: '00:01:31',
    speaker: 'Tech Director',
    language: 'English (US)',
    text: 'SRS Oryx multi-platform forwarding is locked: YouTube, Twitch, Kick, and X restreaming at 60 frames per second.',
    confidence: 0.99
  },
  {
    id: 'sub-4',
    timestamp: '00:01:40',
    speaker: 'Anchor Desk',
    language: 'English (US)',
    text: 'All 352 UnrealIRCd nodes across Switch and DataPacket are synced to irc.drfun1.com and irc.drfun1media.com.',
    confidence: 0.97
  }
];

export const INITIAL_SRS_TELEMETRY: SrsServerTelemetry = {
  version: 'Oryx v5.14.88 (SRS/5.0-b5)',
  pid: 1482,
  uptimeSeconds: 84210,
  activeStreams: 3,
  activeClients: 428,
  inBitrateKbps: 7850,
  outBitrateMbps: 342.8,
  cpuPercent: 14.2,
  ramPercent: 26.8,
  diskFreeGb: 1840.5,
  totalBytesInGb: 88.4,
  totalBytesOutGb: 3120.6,
  srsCoreStatus: 'healthy',
  aiEngineStatus: 'online'
};
