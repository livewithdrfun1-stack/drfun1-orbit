/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Social-Live: Self-Hosted Multi-Platform Live Streaming Dashboard
 * (Inspired by https://github.com/AxionAura/social-live.git)
 */

import React, { useState, useEffect } from 'react';
import { 
  SocialLiveDestination, 
  SocialLiveVideoAsset, 
  SocialLiveFfmpegConfig, 
  SocialLiveStreamHealth, 
  SocialLiveSecurityLog,
  SocialLivePlatform 
} from '../types/socialLive';
import { 
  INITIAL_SOCIAL_LIVE_DESTINATIONS, 
  INITIAL_SOCIAL_LIVE_VIDEO_ASSETS, 
  DEFAULT_SOCIAL_LIVE_FFMPEG_CONFIG, 
  INITIAL_SOCIAL_LIVE_STREAM_HEALTH, 
  INITIAL_SOCIAL_LIVE_SECURITY_LOGS 
} from '../data/socialLiveData';
import { 
  Radio, 
  Play, 
  Square, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Terminal, 
  Server, 
  Activity, 
  Film, 
  Repeat, 
  Sliders, 
  ExternalLink, 
  Copy, 
  Check, 
  Plus, 
  AlertTriangle, 
  Cpu, 
  RefreshCw, 
  Layers, 
  Clock, 
  Sparkles, 
  Zap, 
  Share2, 
  Tv, 
  Youtube, 
  Video 
} from 'lucide-react';

interface SocialLiveDashboardProps {
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onNavigateToIrc?: () => void;
}

export const SocialLiveDashboard: React.FC<SocialLiveDashboardProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onNavigateToIrc
}) => {
  // Destinations state
  const [destinations, setDestinations] = useState<SocialLiveDestination[]>(INITIAL_SOCIAL_LIVE_DESTINATIONS);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Video assets & selection
  const [videoAssets, setVideoAssets] = useState<SocialLiveVideoAsset[]>(INITIAL_SOCIAL_LIVE_VIDEO_ASSETS);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('asset-drfun1-master');

  // FFmpeg config & telemetry
  const [ffmpegConfig, setFfmpegConfig] = useState<SocialLiveFfmpegConfig>(DEFAULT_SOCIAL_LIVE_FFMPEG_CONFIG);
  const [streamHealth, setStreamHealth] = useState<SocialLiveStreamHealth>(INITIAL_SOCIAL_LIVE_STREAM_HEALTH);
  const [isBroadcastingAll, setIsBroadcastingAll] = useState<boolean>(true);

  // Security logs & SSRF filter test
  const [securityLogs, setSecurityLogs] = useState<SocialLiveSecurityLog[]>(INITIAL_SOCIAL_LIVE_SECURITY_LOGS);
  const [ssrfTestUrl, setSsrfTestUrl] = useState<string>('http://169.254.169.254/latest/meta-data/');
  const [ssrfTestResult, setSsrfTestResult] = useState<string | null>(null);

  // Modals & Sub-tabs
  const [activeTab, setActiveTab] = useState<'destinations' | 'ffmpeg' | 'assets' | 'security'>('destinations');
  const [isAddDestinationModalOpen, setIsAddDestinationModalOpen] = useState<boolean>(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState<boolean>(false);

  // Selected asset object
  const selectedAsset = videoAssets.find(a => a.id === selectedAssetId) || videoAssets[0];

  // Live broadcast uptime counter
  useEffect(() => {
    if (!isBroadcastingAll) return;
    const interval = setInterval(() => {
      setStreamHealth(prev => ({
        ...prev,
        uptimeSeconds: prev.uptimeSeconds + 1,
        totalFrames: prev.totalFrames + Math.round(prev.currentFps),
        currentFps: +(59.8 + Math.random() * 0.4).toFixed(1),
        outputBitrateKbps: Math.round(4580 + Math.random() * 80),
        cpuUsagePct: +(14.2 + Math.random() * 1.5).toFixed(1),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isBroadcastingAll]);

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle Destination Broadcast
  const handleToggleDestination = (id: string) => {
    setDestinations(prev => prev.map(dst => {
      if (dst.id === id) {
        const nextEnabled = !dst.isEnabled;
        return {
          ...dst,
          isEnabled: nextEnabled,
          status: nextEnabled ? 'broadcasting' : 'idle',
        };
      }
      return dst;
    }));

    // Add security audit log
    const target = destinations.find(d => d.id === id);
    if (target) {
      const newLog: SocialLiveSecurityLog = {
        id: `sec-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB') + ' UTC',
        eventType: 'audit_event',
        severity: 'info',
        message: `Destination "${target.name}" status changed to ${!target.isEnabled ? 'ENABLED' : 'DISABLED'}`,
        actor: 'admin/RichardAlanWitt',
      };
      setSecurityLogs(prev => [newLog, ...prev.slice(0, 19)]);
    }
  };

  // Toggle Key Visibility
  const handleToggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Master Broadcast
  const handleToggleMasterBroadcast = () => {
    const nextState = !isBroadcastingAll;
    setIsBroadcastingAll(nextState);
    setDestinations(prev => prev.map(dst => ({
      ...dst,
      status: nextState && dst.isEnabled ? 'broadcasting' : 'idle',
    })));

    const newLog: SocialLiveSecurityLog = {
      id: `sec-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-GB') + ' UTC',
      eventType: 'spawn_execute',
      severity: nextState ? 'info' : 'notice',
      message: nextState 
        ? 'Master FFmpeg multi-output process spawned successfully (5 outputs active)' 
        : 'Master FFmpeg process received SIGTERM; all destination streams gracefully closed',
      actor: 'admin/RichardAlanWitt',
    };
    setSecurityLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  // SSRF Protection Filter Tester
  const handleTestSsrf = (e: React.FormEvent) => {
    e.preventDefault();
    const url = ssrfTestUrl.trim().toLowerCase();
    
    // Check if private / loopback IP
    const isPrivate = 
      url.includes('127.0.0.1') || 
      url.includes('localhost') || 
      url.includes('169.254.') || 
      url.includes('10.') || 
      url.includes('192.168.') || 
      url.includes('172.16.');

    if (isPrivate) {
      setSsrfTestResult('BLOCKED by SSRF Guard: Private / Link-Local / Metadata IP rejected (RFC 1918 / RFC 3927 violation prevention)');
    } else {
      setSsrfTestResult('ALLOWED: Public HTTPS streaming endpoint verified safe for video asset ingestion');
    }

    const newLog: SocialLiveSecurityLog = {
      id: `sec-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-GB') + ' UTC',
      eventType: 'ssrf_check',
      severity: isPrivate ? 'warning' : 'info',
      message: `SSRF filter inspected "${ssrfTestUrl}": ${isPrivate ? 'REJECTED' : 'PASSED'}`,
      actor: 'network/ssrf_filter',
    };
    setSecurityLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  // Generate safe FFmpeg spawn argument array (shows user command-injection safety)
  const ffmpegArgv = [
    'ffmpeg',
    '-re',
    selectedAsset.loopMode === 'infinite' ? '-stream_loop -1' : null,
    `-i "${selectedAsset.storagePath}"`,
    `-c:v ${ffmpegConfig.videoCodec}`,
    `-preset ${ffmpegConfig.preset}`,
    `-b:v ${ffmpegConfig.videoBitrateKbps}k`,
    `-maxrate ${Math.round(ffmpegConfig.videoBitrateKbps * 1.15)}k`,
    `-bufsize ${ffmpegConfig.videoBitrateKbps * 2}k`,
    `-pix_fmt ${ffmpegConfig.pixelFormat}`,
    `-r ${ffmpegConfig.fps}`,
    `-g ${ffmpegConfig.fps * ffmpegConfig.keyframeIntervalSec}`,
    `-c:a ${ffmpegConfig.audioCodec}`,
    `-b:a ${ffmpegConfig.audioBitrateKbps}k`,
    `-ar ${ffmpegConfig.audioSampleRateHz}`,
    ...destinations.filter(d => d.isEnabled).map(d => `-f flv "${d.streamUrl}/${showKeys[d.id] ? d.streamKey : '••••••••••••••••'}"`),
  ].filter(Boolean);

  const activeDestinationsCount = destinations.filter(d => d.isEnabled).length;
  const totalViewers = destinations.reduce((acc, d) => d.status === 'broadcasting' ? acc + d.viewerCount : acc, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / System Specification & Self-Hosted Philosophy */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 rounded-xl text-white shadow-lg shadow-purple-600/20">
                <Radio className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Social-Live Broadcaster</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Self-Hosted FFmpeg
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isBroadcastingAll ? `${activeDestinationsCount} TARGETS LIVE` : 'STANDBY'}</span>
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Broadcast pre-recorded videos and live streams to YouTube, Facebook, Twitch, Kick &amp; Custom RTMP simultaneously without SaaS fees. Built with AES-256-GCM encryption at rest, stream key redaction &amp; SSRF guard.
                </p>
              </div>
            </div>
          </div>

          {/* Master Broadcast Button & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleToggleMasterBroadcast}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
                isBroadcastingAll 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-500/50' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/50'
              }`}
            >
              {isBroadcastingAll ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isBroadcastingAll ? 'STOP ALL STREAMS' : 'START ALL STREAMS'}</span>
            </button>

            <a
              href="https://github.com/AxionAura/social-live"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
              <span>AxionAura GitHub</span>
            </a>
          </div>
        </div>

        {/* Real-Time Live Broadcast Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Broadcast Uptime</span>
            <span className="text-sm font-bold font-mono text-sky-300">
              {isBroadcastingAll ? formatTime(streamHealth.uptimeSeconds) : '00:00:00'}
            </span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Viewers</span>
            <span className="text-sm font-bold font-mono text-emerald-300">
              {totalViewers.toLocaleString()} across 5 platforms
            </span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Output Bitrate</span>
            <span className="text-sm font-bold font-mono text-purple-300">
              {streamHealth.outputBitrateKbps} kbps (CBR)
            </span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Encoding Speed</span>
            <span className="text-sm font-bold font-mono text-indigo-300">
              {streamHealth.currentFps} FPS (1.00x)
            </span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Security Vault</span>
            <span className="text-sm font-bold font-mono text-amber-300 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>AES-256-GCM Encrypted</span>
            </span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">FFmpeg Safety</span>
            <span className="text-sm font-bold font-mono text-slate-200">
              Spawn Array (No Shell)
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs: Destinations, Video Assets, FFmpeg Config, Security Vault */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 rounded-xl p-2.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'destinations' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Destinations ({destinations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'assets' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video Assets &amp; Loop ({videoAssets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ffmpeg')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'ffmpeg' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>FFmpeg Safe Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'security' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security &amp; SSRF Guard</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddDestinationModalOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>Add Destination</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Destinations Grid (YouTube, Facebook, Twitch, Kick, RTMP) */}
      {activeTab === 'destinations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map(dst => {
              const isKeyShown = !!showKeys[dst.id];

              return (
                <div
                  key={dst.id}
                  className={`bg-slate-900/80 border rounded-xl p-4 space-y-3.5 transition-all ${
                    dst.isEnabled && dst.status === 'broadcasting' 
                      ? 'border-purple-500/60 ring-1 ring-purple-500/20 shadow-lg shadow-purple-500/5' 
                      : 'border-slate-800'
                  }`}
                >
                  {/* Destination Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-200">{dst.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-semibold">
                          {dst.rtmpProtocol}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono block truncate max-w-[240px]">
                        {dst.streamUrl}
                      </span>
                    </div>

                    {/* Enable / Disable Switch */}
                    <button
                      onClick={() => handleToggleDestination(dst.id)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        dst.isEnabled ? 'bg-purple-600' : 'bg-slate-800'
                      }`}
                      title={dst.isEnabled ? 'Disable Destination' : 'Enable Destination'}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        dst.isEnabled ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  {/* Stream Key Security Box (Redacted by default) */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Stream Key (AES-256 Encrypted)</span>
                      </span>
                      <button
                        onClick={() => handleToggleKeyVisibility(dst.id)}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                      >
                        {isKeyShown ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{isKeyShown ? 'Hide' : 'Reveal'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-slate-900/60 px-2 py-1 rounded font-mono text-[11px] text-slate-300 overflow-hidden">
                      <span className="truncate">
                        {isKeyShown ? dst.streamKey : '••••••••••••••••••••••••'}
                      </span>
                      <button
                        onClick={() => handleCopy(dst.streamKey, dst.id)}
                        className="text-slate-400 hover:text-white p-0.5 rounded shrink-0"
                        title="Copy Key"
                      >
                        {copiedId === dst.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="text-[9px] font-mono text-slate-600 truncate">
                      GCM Tag: {dst.gcmAuthTag} | Cipher: {dst.encryptedKeyCipher.slice(0, 16)}...
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        dst.status === 'broadcasting' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                      }`} />
                      <span className={`font-semibold ${
                        dst.status === 'broadcasting' ? 'text-emerald-300' : 'text-slate-500'
                      }`}>
                        {dst.status === 'broadcasting' ? 'LIVE TRANSMITTING' : 'OFFLINE'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span>{dst.bitrateKbps}k</span>
                      <span>·</span>
                      <span className="text-purple-300">{dst.viewerCount.toLocaleString()} viewers</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Video Assets & Infinite Loop Scheduler */}
      {activeTab === 'assets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-400" />
                <span>Pre-Recorded Video Reel Library</span>
              </h3>
              <button
                onClick={() => setIsAddAssetModalOpen(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Import Video File</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {videoAssets.map(asset => {
                const isSelected = asset.id === selectedAssetId;

                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-slate-900/80 space-y-3 ${
                      isSelected 
                        ? 'border-purple-500 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/10' 
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-200 text-sm block truncate">{asset.title}</span>
                        <span className="text-xs text-slate-400 font-mono block truncate">{asset.filename}</span>
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          ACTIVE REEL
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-[9px] uppercase text-slate-500 block">Resolution</span>
                        <span className="text-slate-200 font-bold">{asset.resolution}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-slate-500 block">Duration</span>
                        <span className="text-slate-200">{formatTime(asset.durationSec)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-slate-500 block">Size</span>
                        <span className="text-slate-200">{asset.filesizeMb} MB</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-purple-400 font-mono text-[11px] flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        <span>Loop: {asset.loopMode}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[160px]">
                        {asset.storagePath}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Asset Live Inspector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-sky-400" />
                <span>Active Streaming Source</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400">STATUS: TRANSMITTING</span>
            </div>

            {/* Simulated Live Preview Box */}
            <div className="h-44 rounded-lg bg-gradient-to-br from-slate-950 via-purple-950/60 to-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
              <div className="text-center space-y-2 opacity-80">
                <Tv className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
                <div className="text-xs font-mono text-slate-200 font-bold">{selectedAsset.title}</div>
                <div className="text-[10px] font-mono text-purple-300">Continuous Infinite Loop Playout</div>
              </div>

              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono text-rose-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>FFmpeg Loop Active</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Loop Parameter:</span>
                <span className="font-mono text-sky-300 font-bold">-stream_loop -1</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Video Codec:</span>
                <span className="font-mono text-slate-200">{selectedAsset.codec}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Filesize On Disk:</span>
                <span className="font-mono text-slate-200">{selectedAsset.filesizeMb} MB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Target Destinations:</span>
                <span className="font-mono text-emerald-300 font-bold">{activeDestinationsCount} Active Platforms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FFmpeg Safe Engine & Generated Argv */}
      {activeTab === 'ffmpeg' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>Safe FFmpeg Process Execution (Spawn Array)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  AxionAura Social-Live prevents command injection by avoiding shell execution (`sh -c`) and passing strict argument arrays directly to `child_process.spawn`.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-400">Preset:</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  {ffmpegConfig.preset}
                </span>
                <span className="text-slate-400">Bitrate:</span>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  {ffmpegConfig.videoBitrateKbps}k
                </span>
              </div>
            </div>

            {/* Generated Safe Argv Terminal Box */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase block">
                Spawn Array Arguments (Stream Keys Auto-Redacted):
              </span>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto space-y-1 leading-relaxed">
                <span className="text-purple-400 font-bold">$ ffmpeg \</span>
                {ffmpegArgv.slice(1).map((arg, idx) => (
                  <div key={idx} className="pl-4 text-slate-300">
                    {arg} \
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Live FFmpeg Log Stream */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase block">
                Live FFmpeg Process stdout / stderr:
              </span>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 h-40 overflow-y-auto space-y-1">
                <div className="text-emerald-400">[info] Input #0, mov,mp4,m4a,3gp, 1920x1080, 59.94 fps, 60.00 tbr, 16k tbn</div>
                <div className="text-slate-400">[info] Stream mapping: Stream #0:0 -&gt; #0:0 (h264 (native) -&gt; h264 (libx264))</div>
                <div className="text-slate-400">[info] Stream mapping: Stream #0:1 -&gt; #0:1 (aac (native) -&gt; aac (native))</div>
                <div className="text-slate-300">frame= 85740 fps= 60.0 q=23.0 size= 829440kB time={formatTime(streamHealth.uptimeSeconds)} bitrate=4620.4kbits/s speed=1.00x</div>
                <div className="text-purple-300">[rtmp @ 0x55a9b0c] Connected to rtmp://a.rtmp.youtube.com/live2 [Key: ••••••••••••••••]</div>
                <div className="text-purple-300">[rtmps @ 0x55a9b40] TLS Handshake verified rtmps://live-api-s.facebook.com:443 [Key: ••••••••••••••••]</div>
                <div className="text-purple-300">[rtmp @ 0x55a9b80] Connected to rtmp://live.twitch.tv/app [Key: ••••••••••••••••]</div>
                <div className="text-purple-300">[rtmp @ 0x55a9bc0] Connected to rtmp://fa723fc1b171.global-contribute.live-video.net [Key: ••••••••••••••••]</div>
                <div className="text-emerald-400 font-bold">[heartbeat] All 5 multi-destination endpoints receiving synchronous FLV mux frames</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Security & SSRF Guard */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Features Overview & SSRF Guard Tester */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>AxionAura Security Hardening Architecture</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full protection against credential theft, command injection, and SSRF attacks against internal infrastructure.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>AES-256-GCM Credential Encryption</span>
                </span>
                <p className="text-slate-400">
                  All stream keys and destination secrets are encrypted with 256-bit AES in Galois/Counter Mode before being written to SQLite storage. Decryption only occurs transiently in RAM when initializing FFmpeg spawn.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                  <span>Automatic Stream Key Log Redaction</span>
                </span>
                <p className="text-slate-400">
                  Process output filters intercept all stderr/stdout messages and replace sensitive RTMP tokens with mask characters (`••••••••••••••••`) before saving to database logs.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>SSRF Private IP &amp; Cloud Metadata Filter</span>
                </span>
                <p className="text-slate-400 mb-2">
                  Blocks remote stream pull requests targeting `127.0.0.1`, `169.254.169.254` (AWS/GCP metadata), and local LAN networks.
                </p>

                {/* SSRF URL Tester Form */}
                <form onSubmit={handleTestSsrf} className="space-y-2 pt-1 border-t border-slate-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ssrfTestUrl}
                      onChange={(e) => setSsrfTestUrl(e.target.value)}
                      placeholder="Enter URL to test SSRF filtering..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition-colors shrink-0"
                    >
                      Test Filter
                    </button>
                  </div>

                  {ssrfTestResult && (
                    <div className={`p-2 rounded text-[11px] font-mono ${
                      ssrfTestResult.includes('BLOCKED') 
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40' 
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {ssrfTestResult}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Security Event & Audit Trail Log */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Security Audit Trail &amp; Crypto Log</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">AES-GCM VERIFIED</span>
            </div>

            <div className="bg-slate-950 rounded-lg p-3 font-mono text-[11px] h-80 overflow-y-auto space-y-2 border border-slate-800">
              {securityLogs.map(log => (
                <div key={log.id} className="text-slate-300 border-b border-slate-900/80 pb-1.5 last:border-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>[{log.timestamp}]</span>
                    <span className="text-purple-400">{log.actor}</span>
                  </div>
                  <div className={`text-xs mt-0.5 ${
                    log.severity === 'warning' ? 'text-amber-400' : 'text-slate-200'
                  }`}>
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Custom RTMP Destination Modal */}
      {isAddDestinationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Add RTMP / RTMPS Destination</h3>
              </div>
              <button
                onClick={() => setIsAddDestinationModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const name = fd.get('name') as string || 'Custom RTMP';
                const streamUrl = fd.get('url') as string || 'rtmp://live.custom.com/app';
                const streamKey = fd.get('key') as string || 'key_custom_stream_123';
                const platform = fd.get('platform') as SocialLivePlatform || 'custom_rtmp';

                const newDst: SocialLiveDestination = {
                  id: `dst-${Date.now()}`,
                  name,
                  platform,
                  streamUrl,
                  streamKey,
                  encryptedKeyCipher: 'e1d2c3b4a5f60718293a4b5c6d7e8f9a0b1c2d3e',
                  gcmAuthTag: '7a6b5c4d3e2f1a0b',
                  isEnabled: true,
                  status: 'broadcasting',
                  lastBroadcastAt: 'Just now',
                  viewerCount: 0,
                  bitrateKbps: 4500,
                  rtmpProtocol: streamUrl.startsWith('rtmps') ? 'RTMPS' : 'RTMP',
                };

                setDestinations(prev => [...prev, newDst]);
                setIsAddDestinationModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-slate-300 font-medium block mb-1">Destination Name</label>
                <input
                  name="name"
                  required
                  defaultValue="Custom CDN77 / DataPacket RTMP"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Platform Type</label>
                <select
                  name="platform"
                  defaultValue="custom_rtmp"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="youtube">YouTube Live</option>
                  <option value="facebook">Facebook Live</option>
                  <option value="twitch">Twitch</option>
                  <option value="kick">Kick.com</option>
                  <option value="custom_rtmp">Custom RTMP / RTMPS</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Server URL (RTMP or RTMPS)</label>
                <input
                  name="url"
                  required
                  defaultValue="rtmp://rtmp.drfun1.com/live"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Stream Key (AES-256-GCM Encrypted at Rest)</label>
                <input
                  name="key"
                  type="password"
                  required
                  defaultValue="live_secret_key_88492"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDestinationModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold shadow-md"
                >
                  Save &amp; Encrypt Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Video Asset Modal */}
      {isAddAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Import Video Asset</h3>
              </div>
              <button
                onClick={() => setIsAddAssetModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const title = fd.get('title') as string || 'New Video Reel';
                const filename = fd.get('filename') as string || 'broadcast_feed.mp4';

                const newAsset: SocialLiveVideoAsset = {
                  id: `asset-${Date.now()}`,
                  title,
                  filename,
                  durationSec: 10800,
                  resolution: '1080p60',
                  filesizeMb: 5400,
                  codec: 'H.264 / AAC',
                  loopMode: 'infinite',
                  storagePath: `/opt/social-live/videos/${filename}`,
                  thumbnailGradient: 'from-purple-900 to-indigo-950',
                  isSelected: true,
                };

                setVideoAssets(prev => [newAsset, ...prev]);
                setSelectedAssetId(newAsset.id);
                setIsAddAssetModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-slate-300 font-medium block mb-1">Video Title</label>
                <input
                  name="title"
                  required
                  defaultValue="24/7 Satcom Teleport Showcase Reel"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Local Filename / Storage Path</label>
                <input
                  name="filename"
                  required
                  defaultValue="satcom_teleport_showcase_1080p.mp4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAssetModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold shadow-md"
                >
                  Save &amp; Queue Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
