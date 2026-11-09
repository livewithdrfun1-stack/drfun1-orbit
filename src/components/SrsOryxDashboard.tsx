/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * SRS Oryx (https://github.com/ossrs/oryx.git)
 * Open-Source AI-Driven All-In-One Video Streaming Server & Media Gateway
 * Integrates:
 * - Multi-Protocol Ingest & Playback (RTMP, WebRTC WHIP/WHEP, SRT, HTTP-FLV, HLS)
 * - Multi-Platform Forwarding / Restreaming (YouTube, Twitch, Kick, X, Custom RTMP)
 * - Virtual Live 24/7 Unmanned Cloud Playout (Continuous Video Loops without OBS)
 * - DVR Recording & VOD Archival (Auto MP4 & HLS Segmenter)
 * - AI Live Subtitles & Real-Time Speech-to-Text Transcription
 * - SRS Server Real-Time Telemetry & Docker Deployment Stack
 */

import React, { useState, useEffect } from 'react';
import { 
  SrsStreamEndpoint, 
  SrsForwardDestination, 
  SrsVirtualLiveTask, 
  SrsDvrRecord, 
  SrsAiSubtitleSnippet, 
  SrsServerTelemetry 
} from '../types/srsOryx';
import { 
  INITIAL_SRS_STREAM_ENDPOINTS, 
  INITIAL_SRS_FORWARD_DESTINATIONS, 
  INITIAL_SRS_VIRTUAL_LIVE_TASKS, 
  INITIAL_SRS_DVR_RECORDS, 
  INITIAL_SRS_AI_SUBTITLES, 
  INITIAL_SRS_TELEMETRY 
} from '../data/srsOryxData';
import { 
  Radio, 
  Play, 
  Square, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  Activity, 
  Cpu, 
  HardDrive, 
  Server, 
  Repeat, 
  Film, 
  Sparkles, 
  Sliders, 
  Terminal, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Download, 
  Video, 
  Globe, 
  Tv, 
  Share2, 
  Lock, 
  AlertTriangle,
  Zap,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

interface SrsOryxDashboardProps {
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onNavigateToIrc?: () => void;
}

export const SrsOryxDashboard: React.FC<SrsOryxDashboardProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onNavigateToIrc
}) => {
  // Navigation tabs within Oryx
  const [activeTab, setActiveTab] = useState<'gateway' | 'forwarding' | 'virtual_live' | 'dvr' | 'ai_subtitles' | 'docker_api'>('gateway');

  // State management
  const [endpoints] = useState<SrsStreamEndpoint[]>(INITIAL_SRS_STREAM_ENDPOINTS);
  const [destinations, setDestinations] = useState<SrsForwardDestination[]>(INITIAL_SRS_FORWARD_DESTINATIONS);
  const [virtualTasks, setVirtualTasks] = useState<SrsVirtualLiveTask[]>(INITIAL_SRS_VIRTUAL_LIVE_TASKS);
  const [dvrRecords, setDvrRecords] = useState<SrsDvrRecord[]>(INITIAL_SRS_DVR_RECORDS);
  const [aiSubtitles, setAiSubtitles] = useState<SrsAiSubtitleSnippet[]>(INITIAL_SRS_AI_SUBTITLES);
  const [telemetry, setTelemetry] = useState<SrsServerTelemetry>(INITIAL_SRS_TELEMETRY);

  // UI state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});
  const [isAiSubtitlesActive, setIsAiSubtitlesActive] = useState<boolean>(true);
  const [isDvrRecordingActive, setIsDvrRecordingActive] = useState<boolean>(true);
  const [simulatedPlayerMuted, setSimulatedPlayerMuted] = useState<boolean>(true);

  // Simulated live telemetry fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        uptimeSeconds: prev.uptimeSeconds + 3,
        inBitrateKbps: Math.floor(7500 + Math.random() * 800),
        outBitrateMbps: +(330 + Math.random() * 25).toFixed(1),
        activeClients: Math.floor(410 + Math.random() * 35),
        cpuPercent: +(12 + Math.random() * 5).toFixed(1),
        ramPercent: +(25 + Math.random() * 3).toFixed(1)
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleForwardDestination = (id: string) => {
    setDestinations(prev => prev.map(dest => {
      if (dest.id === id) {
        const nextEnabled = !dest.enabled;
        return {
          ...dest,
          enabled: nextEnabled,
          status: nextEnabled ? 'publishing' : 'idle',
          bitrateKbps: nextEnabled ? (dest.platform === 'youtube' ? 4500 : 6000) : 0,
          fps: nextEnabled ? 60 : 0
        };
      }
      return dest;
    }));
  };

  const toggleVirtualTask = (id: string) => {
    setVirtualTasks(prev => prev.map(task => {
      if (task.id === id) {
        const nextStatus = task.status === 'playing' ? 'paused' : 'playing';
        return { ...task, status: nextStatus };
      }
      return task;
    }));
  };

  const activeForwardCount = destinations.filter(d => d.enabled).length;

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          MASTHEAD: SRS ORYX (OSS/SRS-STACK) HEADER & SYSTEM STATS
          ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 rounded-2xl text-white shadow-lg shadow-red-600/30 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>SRS Oryx Video Server Stack</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600 text-white font-black animate-pulse">
                    LIVE MEDIA GATEWAY
                  </span>
                </h2>
                <a 
                  href="https://github.com/ossrs/oryx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1 hover:underline"
                >
                  <span>ossrs/oryx.git</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Open-source AI-driven all-in-one video solution based on SRS (Simple Realtime Server), FFmpeg, Go &amp; ReactJS.
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Licensee: Richard Alan Witt (FRN 0034981290) | Switch SUPERNAP 100G Fiber &amp; Satellite Ingest
              </p>
            </div>
          </div>

          {/* Quick Actions & Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-400">Core:</span>
              <span className="text-emerald-400 font-bold">{telemetry.version}</span>
            </div>

            <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2 text-xs font-mono">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-400">Clients:</span>
              <span className="text-sky-400 font-bold">{telemetry.activeClients}</span>
            </div>

            {onOpenLicense && (
              <button
                onClick={onOpenLicense}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Witt Law Verified</span>
              </button>
            )}

            {onNavigateToIrc && (
              <button
                onClick={onNavigateToIrc}
                className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-800/80 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                <span>#drfun1-media</span>
              </button>
            )}
          </div>

        </div>

        {/* Real-Time Telemetry Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Ingest Bitrate</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{(telemetry.inBitrateKbps / 1000).toFixed(2)} Mbps</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Out Egress</span>
            <span className="text-sm font-bold font-mono text-sky-400">{telemetry.outBitrateMbps} Mbps</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">CPU Load</span>
            <span className="text-sm font-bold font-mono text-amber-400">{telemetry.cpuPercent}%</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">RAM Usage</span>
            <span className="text-sm font-bold font-mono text-purple-400">{telemetry.ramPercent}%</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Forwarders</span>
            <span className="text-sm font-bold font-mono text-rose-400">{activeForwardCount} / {destinations.length} Active</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Free Storage</span>
            <span className="text-sm font-bold font-mono text-slate-200">{telemetry.diskFreeGb} GB</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          ORYX FEATURE TABS NAVIGATION
          ======================================================== */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1.5 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('gateway')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'gateway'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Ingest &amp; Playback Gateway</span>
        </button>

        <button
          onClick={() => setActiveTab('forwarding')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'forwarding'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Multi-Platform Forwarder</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-rose-200 font-bold">
            {activeForwardCount} Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('virtual_live')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'virtual_live'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>Virtual Live (24/7 Loop)</span>
        </button>

        <button
          onClick={() => setActiveTab('dvr')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'dvr'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>DVR &amp; VOD Archival</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_subtitles')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'ai_subtitles'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-300" />
          <span>AI Subtitles &amp; Speech-to-Text</span>
        </button>

        <button
          onClick={() => setActiveTab('docker_api')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'docker_api'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-indigo-300" />
          <span>Docker Deploy &amp; Open API</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: INGEST & PLAYBACK GATEWAY (RTMP, WEBRTC, SRT, HLS)
          ======================================================== */}
      {activeTab === 'gateway' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left 7 Cols: Protocol Endpoints & URLs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-400" />
                    <span>SRS Multi-Protocol Gateway Endpoints</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live stream ingestion for OBS Studio, hardware encoders, satellite receivers, and web browsers.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  5 Protocols Online
                </span>
              </div>

              {/* Endpoints List */}
              <div className="space-y-3">
                {endpoints.map(ep => (
                  <div key={ep.id} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded ${
                          ep.protocol === 'webrtc' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          ep.protocol === 'srt' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          ep.protocol === 'rtmp' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}>
                          {ep.protocol.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-white">{ep.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                        Latency: {ep.latency}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">{ep.description}</p>

                    {/* Ingest Address */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Server Ingest URL:</span>
                        <button
                          onClick={() => handleCopy(ep.ingestUrl, `ingest-${ep.id}`)}
                          className="text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === `ingest-${ep.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === `ingest-${ep.id}` ? 'Copied' : 'Copy URL'}</span>
                        </button>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 select-all overflow-x-auto whitespace-nowrap">
                        {ep.ingestUrl}
                      </div>
                    </div>

                    {/* Playback Address */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Edge Playback URL:</span>
                        <button
                          onClick={() => handleCopy(ep.playbackUrl, `play-${ep.id}`)}
                          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === `play-${ep.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === `play-${ep.id}` ? 'Copied' : 'Copy Playback'}</span>
                        </button>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-emerald-300 select-all overflow-x-auto whitespace-nowrap">
                        {ep.playbackUrl}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Live Gateway Monitor & Player */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              
              {/* Player Header */}
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                    SRS WebRTC / HTTP-FLV Monitor
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  WHEP Low-Latency
                </span>
              </div>

              {/* Video Monitor Area */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=1280&q=80" 
                  alt="Live Studio Playout Feed"
                  className="w-full h-full object-cover opacity-85"
                />

                {/* Overlays */}
                <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>SRS ON-AIR</span>
                </div>

                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-emerald-300 font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/30">
                  1080p60 · 7,850 kbps
                </div>

                {/* Lower Third Subtitle Bar */}
                {isAiSubtitlesActive && (
                  <div className="absolute bottom-10 left-4 right-4 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-xl border border-sky-500/40 text-center text-xs text-white font-medium shadow-2xl">
                    <span className="text-[10px] font-mono uppercase text-sky-400 font-bold block mb-0.5">
                      SRS AI Live Closed Captioning:
                    </span>
                    <span>"{aiSubtitles[aiSubtitles.length - 1]?.text || 'Listening to broadcast master audio...'}"</span>
                  </div>
                )}

                {/* Bottom Monitor Controls */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white font-mono bg-slate-950/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSimulatedPlayerMuted(!simulatedPlayerMuted)}
                      className="p-1 hover:text-sky-300 transition-colors cursor-pointer"
                    >
                      {simulatedPlayerMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <span className="text-[11px] text-slate-300">Audio: {simulatedPlayerMuted ? 'Muted' : 'Live AAC'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Stream: live/drfun1-master-feed</span>
                </div>
              </div>

              {/* Monitor Telemetry Details */}
              <div className="p-4 bg-slate-950/90 border-t border-slate-800 text-xs space-y-2.5">
                <div className="flex items-center justify-between font-mono text-slate-300">
                  <span>Stream Uptime:</span>
                  <span className="text-emerald-400 font-bold">02:10:20</span>
                </div>
                <div className="flex items-center justify-between font-mono text-slate-300">
                  <span>Video Resolution:</span>
                  <span className="text-white">1920x1080 @ 60fps</span>
                </div>
                <div className="flex items-center justify-between font-mono text-slate-300">
                  <span>Video Codec:</span>
                  <span className="text-white">H.264 High 4.2 (libx264)</span>
                </div>
                <div className="flex items-center justify-between font-mono text-slate-300">
                  <span>Audio Codec:</span>
                  <span className="text-white">AAC-LC 128kbps stereo</span>
                </div>
              </div>
            </div>

            {/* Quick OBS Stream Config Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono">
                <Video className="w-3.5 h-3.5 text-sky-400" />
                <span>OBS Studio &amp; Hardware Encoder Settings</span>
              </h4>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1.5 text-slate-300">
                <div><span className="text-slate-500">Service:</span> Custom...</div>
                <div><span className="text-slate-500">Server:</span> rtmp://live.drfun1media.com:1935/live</div>
                <div className="flex items-center justify-between">
                  <div><span className="text-slate-500">Stream Key:</span> drfun1-master-feed</div>
                  <button
                    onClick={() => handleCopy('drfun1-master-feed', 'obs-key')}
                    className="text-sky-400 hover:text-white"
                  >
                    {copiedKey === 'obs-key' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: MULTI-PLATFORM FORWARDING / RESTREAMING
          ======================================================== */}
      {activeTab === 'forwarding' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-rose-400" />
                  <span>SRS Oryx Live Stream Forwarders &amp; Restream Destinations</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Forward the master live ingest to YouTube, Twitch, Kick, Facebook, and custom RTMP endpoints with zero client re-encoding overhead.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80">
                  {activeForwardCount} of {destinations.length} Destinations Active
                </span>
              </div>
            </div>

            {/* Destinations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map(dest => {
                const isShowing = showKeyMap[dest.id];
                return (
                  <div key={dest.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                    
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${dest.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                          <h4 className="text-sm font-bold text-white">{dest.name}</h4>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                          dest.status === 'publishing' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {dest.status}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs font-mono">
                        <div className="text-[11px] text-slate-400 truncate">
                          <span className="text-slate-500">URL:</span> {dest.targetUrl}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="text-slate-500">Key:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-slate-300">
                              {isShowing ? dest.streamKey : '••••••••••••••••'}
                            </span>
                            <button
                              onClick={() => setShowKeyMap(prev => ({ ...prev, [dest.id]: !prev[dest.id] }))}
                              className="text-slate-400 hover:text-white"
                            >
                              {isShowing ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => handleCopy(dest.streamKey, dest.id)}
                              className="text-sky-400 hover:text-white"
                            >
                              {copiedKey === dest.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {dest.enabled && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                          <span>Bitrate: {dest.bitrateKbps} kbps</span>
                          <span>FPS: {dest.fps}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3">
                      <button
                        onClick={() => toggleForwardDestination(dest.id)}
                        className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          dest.enabled
                            ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        }`}
                      >
                        {dest.enabled ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{dest.enabled ? 'Stop Forwarding' : 'Start Forwarding'}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: VIRTUAL LIVE (24/7 UNMANNED CLOUD PLAYOUT & LOOPS)
          ======================================================== */}
      {activeTab === 'virtual_live' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-purple-400" />
                  <span>Virtual Live: 24/7 Unmanned Cloud Playout</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Continuously loop pre-recorded MP4 video files or satellite recordings to live RTMP/WebRTC channels 24 hours a day without running an encoder on your PC.
                </p>
              </div>

              <span className="text-xs font-mono text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800/80">
                {virtualTasks.filter(t => t.status === 'playing').length} Active Playout Loops
              </span>
            </div>

            {/* Virtual Live Task Cards */}
            <div className="space-y-3">
              {virtualTasks.map(task => {
                const percent = Math.floor((task.currentPositionSec / task.totalDurationSec) * 100);
                return (
                  <div key={task.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg text-white ${task.status === 'playing' ? 'bg-purple-600 shadow-md shadow-purple-600/30' : 'bg-slate-800'}`}>
                          <Film className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{task.title}</h4>
                          <span className="text-[11px] font-mono text-slate-400">
                            Source: {task.sourceType} | Target: {task.targetStreamKey}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                          task.status === 'playing' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {task.status}
                        </span>

                        <button
                          onClick={() => toggleVirtualTask(task.id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold font-mono transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {task.status === 'playing' ? <Square className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                          <span>{task.status === 'playing' ? 'Pause' : 'Resume'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Position: {Math.floor(task.currentPositionSec / 60)}m / {Math.floor(task.totalDurationSec / 60)}m ({percent}%)</span>
                        <span className="text-purple-400 font-semibold">24/7 Auto-Loop Active</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                      <span className="truncate max-w-md">Source: {task.sourceUrl}</span>
                      <span>Volume: {task.volume}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: DVR RECORDING & VOD ARCHIVAL
          ======================================================== */}
      {activeTab === 'dvr' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-emerald-400" />
                  <span>SRS Oryx DVR Recording &amp; VOD Archival</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Automatic recording of on-air feeds into MP4 and HLS slices for instant replay, FCC compliance archival, and on-demand distribution.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDvrRecordingActive(!isDvrRecordingActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    isDvrRecordingActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isDvrRecordingActive ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
                  <span>{isDvrRecordingActive ? 'Auto-DVR: RECORDING' : 'Auto-DVR: PAUSED'}</span>
                </button>
              </div>
            </div>

            {/* DVR Records List */}
            <div className="space-y-3">
              {dvrRecords.map(rec => (
                <div key={rec.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        rec.status === 'recording' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {rec.status}
                      </span>
                      <h4 className="text-sm font-bold text-white font-mono">{rec.streamName}</h4>
                      <span className="text-[11px] font-mono text-slate-400">({rec.format.toUpperCase()})</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 space-x-3">
                      <span>Start: {rec.startTime}</span>
                      <span>·</span>
                      <span>Duration: {rec.duration}</span>
                      <span>·</span>
                      <span>Size: {rec.fileSizeMb} MB</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 truncate max-w-lg">{rec.storagePath}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {rec.downloadUrl !== '#' && (
                      <a
                        href={rec.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download MP4</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: AI LIVE SUBTITLES & TRANSCRIPTION
          ======================================================== */}
      {activeTab === 'ai_subtitles' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                  <span>SRS Oryx AI Live Subtitles &amp; Audio Transcription</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  AI-powered real-time speech recognition for live on-screen closed captioning, multi-lingual subtitle generation, and broadcast transcript logging.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAiSubtitlesActive(!isAiSubtitlesActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    isAiSubtitlesActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAiSubtitlesActive ? 'AI Subtitles: ACTIVE' : 'AI Subtitles: OFF'}</span>
                </button>
              </div>
            </div>

            {/* Live Subtitle Transcript Stream */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span>Live Speech-to-Text Pipeline (Whisper / Gemini AI Model)</span>
                </div>
                <span>Confidence Threshold: 98%</span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {aiSubtitles.map(sub => (
                  <div key={sub.id} className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="text-sky-300 font-bold">{sub.speaker}</span>
                      <div className="flex items-center gap-2">
                        <span>{sub.language}</span>
                        <span>·</span>
                        <span>{sub.timestamp}</span>
                        <span className="text-emerald-400">({(sub.confidence * 100).toFixed(0)}%)</span>
                      </div>
                    </div>
                    <p className="text-slate-100 font-medium">"{sub.text}"</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: DOCKER QUICK-DEPLOY & OPEN API
          ======================================================== */}
      {activeTab === 'docker_api' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-400" />
                <span>Docker Container Deployment &amp; SRS Open API</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                One-command deployment for SRS Oryx on Linux servers, cloud VMs, and Switch SUPERNAP bare-metal nodes.
              </p>
            </div>

            {/* Docker Run Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="font-bold text-indigo-300">1-Line Production Docker Command:</span>
                <button
                  onClick={() => handleCopy(`docker run --restart always -d -it --name oryx -v $HOME/data:/data \\
  -p 80:2022 -p 443:2443 -p 1935:1935 -p 8080:8080 -p 1985:1985 \\
  -p 8000:8000/udp -p 10080:10080/udp \\
  ossrs/oryx:5`, 'docker-cmd')}
                  className="text-sky-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'docker-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'docker-cmd' ? 'Copied' : 'Copy Docker Command'}</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-300 select-all overflow-x-auto whitespace-pre">
{`docker run --restart always -d -it --name oryx -v $HOME/data:/data \\
  -p 80:2022 -p 443:2443 -p 1935:1935 -p 8080:8080 -p 1985:1985 \\
  -p 8000:8000/udp -p 10080:10080/udp \\
  ossrs/oryx:5`}
              </div>
            </div>

            {/* Port Mapping Explanation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <span className="text-red-400 font-bold block">1935 / TCP</span>
                <span className="text-slate-300">RTMP Live Streaming</span>
                <p className="text-[10px] text-slate-500">Ingest for OBS, vMix, hardware enc.</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <span className="text-purple-400 font-bold block">1985 / TCP &amp; 8000 / UDP</span>
                <span className="text-slate-300">WebRTC WHIP &amp; WHEP</span>
                <p className="text-[10px] text-slate-500">Ultra-low latency sub-second video.</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <span className="text-amber-400 font-bold block">10080 / UDP</span>
                <span className="text-slate-300">SRT Transport</span>
                <p className="text-[10px] text-slate-500">Resilient satellite &amp; fiber uplinks.</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <span className="text-sky-400 font-bold block">8080 / TCP</span>
                <span className="text-slate-300">HTTP-FLV &amp; HLS</span>
                <p className="text-[10px] text-slate-500">Web playback &amp; CDN distribution.</p>
              </div>
            </div>

            {/* Open API Documentation */}
            <div className="pt-2 space-y-2">
              <h4 className="text-xs font-bold text-white font-mono uppercase">RESTful HTTP Open API Endpoints:</h4>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-emerald-400">GET /api/v1/vhosts</span>
                  <span className="text-slate-500">Query all virtual hosts and stream routing</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-emerald-400">GET /api/v1/streams</span>
                  <span className="text-slate-500">List all currently active live publishing streams</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-emerald-400">GET /api/v1/clients</span>
                  <span className="text-slate-500">Inspect real-time viewer connections &amp; IP telemetry</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-purple-400">POST /api/v1/hooks</span>
                  <span className="text-slate-500">Trigger on_publish, on_unpublish &amp; on_dvr webhooks</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
