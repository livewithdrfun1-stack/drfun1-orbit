/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * TV NEWSCASTING & LIVE ON-AIR STUDIO
 * Integrates:
 * - Real-Time On-Air Anchor Desk & TV Playout Monitor
 * - Breaking News Lower-Thirds & EAS Emergency Alert Generator
 * - Live Newsroom Teleprompter & Rundown Script Editor
 * - Real-Time FCC & Satellite Industry RSS News Ticker & Wire
 * - Master Electronic Program Guide (EPG) & Linear TV Channels
 * - Integrated Newsroom WebIRC Client (#drfun1-news & #tv-broadcast)
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Radio, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Search, 
  Maximize2, 
  Sparkles, 
  Wifi, 
  Sliders, 
  Terminal, 
  RefreshCw, 
  Zap, 
  AlertTriangle, 
  Flame, 
  Monitor, 
  Video, 
  MessageSquare,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  FileText,
  Send,
  Eye,
  SlidersHorizontal,
  Share2,
  Square,
  Mic,
  MicOff,
  Bell
} from 'lucide-react';
import { SatelliteRssNewsSection } from './SatelliteRssNewsSection';
import { MultistreamIrcChatRoom } from './MultistreamIrcChatRoom';
import { MASTER_EPG_CHANNELS } from '../data/masterEpgData';
import { MasterEpgChannel } from '../types/masterEpg';
import { AnopeRankLevel } from '../types/ircdAdmin';

interface TvNewscastingStudioProps {
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onNavigateToIrc?: () => void;
  activeRank?: AnopeRankLevel;
  onOpenIrcdAdmin?: () => void;
}

interface NewsRundownStory {
  id: string;
  title: string;
  source: string;
  time: string;
  category: 'breaking' | 'fcc' | 'spectrum' | 'space' | 'teleport';
  body: string;
  lowerThirdHeadline: string;
  lowerThirdSubhead: string;
}

const INITIAL_RUNDOWN_STORIES: NewsRundownStory[] = [
  {
    id: 'story-1',
    title: 'FCC Releases New 3GPP Release 18 NTN Spectrum Guidelines for Satcom Downlinks',
    source: 'FCC.gov Space Bureau',
    time: '2 mins ago',
    category: 'fcc',
    body: 'WASHINGTON — The Federal Communications Commission has issued updated public dockets addressing supplemental coverage from space (SCS). Licensees operating under FRN 0034981290 and Switch SUPERNAP fiber teleports are authorized for cross-connect testing.',
    lowerThirdHeadline: 'BREAKING: FCC AUTHORIZES NEW SATELLITE 5G NTN DOWNLINKS',
    lowerThirdSubhead: 'Direct-to-Device Cellular Backhaul & 100G Teleport Uplinks Verified'
  },
  {
    id: 'story-2',
    title: 'DrFun1 Master Playout Activates 335 UnrealIRCd & 12 DataPacket 100G Leaf Nodes',
    source: 'DrFun1 Media Newsdesk',
    time: '8 mins ago',
    category: 'breaking',
    body: 'LAS VEGAS / FRANKFURT — DrFun1 Media engineering has successfully linked 335 UnrealIRCd servers and 12 high-capacity DataPacket trans-Atlantic points of presence into irc.drfun1.com (SID 001). Low latency broadcasts are now live across all edge channels.',
    lowerThirdHeadline: 'DRFUN1 MEDIA LEAF MESH EXPANDS TO 347 GLOBAL RELAY NODES',
    lowerThirdSubhead: 'Zero Packet Drop on 100G Trans-Atlantic Video Streams & IRC'
  },
  {
    id: 'story-3',
    title: 'Solar Flare Class X1.8 Detected — Space Weather Center Issues Geomagnetic Advisory',
    source: 'NOAA / Space Weather',
    time: '14 mins ago',
    category: 'space',
    body: 'BOULDER, Colo. — A strong solar flare erupted from sunspot region AR3664. Satellite operators in geostationary and low Earth orbits are monitoring transponder signal-to-noise ratios. Teleport ground stations report nominal carrier lock.',
    lowerThirdHeadline: 'SPACE WEATHER ALERT: CLASS X1.8 SOLAR FLARE MONITORED',
    lowerThirdSubhead: 'Ground Segment S-Band & Ka-Band Uplinks Operating at 99.999% SLA'
  },
  {
    id: 'story-4',
    title: 'Switch SUPERNAP NV & DataPacket Complete 100G Fiber Ring Teleport Cross-Connect',
    source: 'Switch Communications',
    time: '25 mins ago',
    category: 'teleport',
    body: 'THE CORE CAMPUS, NV — High-density fiber cross-connects between Switch SUPERNAP Nevada and DataPacket Europe are active. The multi-gigabit feed powers DrFun1 Master Playout, Strimm linear TV schedules, and SHOUTcast audio relays.',
    lowerThirdHeadline: 'SWITCH SUPERNAP NV: 100G DUAL-CARRIER TELEPORT ONLINE',
    lowerThirdSubhead: 'Zero Downtime Architecture Supervised by The Law Office of Richard A. Witt LLC'
  }
];

export const TvNewscastingStudio: React.FC<TvNewscastingStudioProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onNavigateToIrc,
  activeRank = 'op',
  onOpenIrcdAdmin
}) => {
  // On-air state
  const [isOnAir, setIsOnAir] = useState<boolean>(true);
  const [onAirUptime, setOnAirUptime] = useState<number>(1420); // seconds
  const [videoFeedSource, setVideoFeedSource] = useState<'anchor_cam' | 'breaking_teleport' | 'satellite_radar' | 'color_bars' | 'linear_tv'>('anchor_cam');
  const [isMicLive, setIsMicLive] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(68);

  // Lower-third & On-air Graphics
  const [isBreakingBannerActive, setIsBreakingBannerActive] = useState<boolean>(true);
  const [isLowerThirdActive, setIsLowerThirdActive] = useState<boolean>(true);
  const [isNewsTickerActive, setIsNewsTickerActive] = useState<boolean>(true);
  const [isEasAlertActive, setIsEasAlertActive] = useState<boolean>(false);
  const [lowerThirdHeadline, setLowerThirdHeadline] = useState<string>('BREAKING: FCC AUTHORIZES NEW SATELLITE 5G NTN DOWNLINKS');
  const [lowerThirdSubhead, setLowerThirdSubhead] = useState<string>('Direct-to-Device Cellular Backhaul & 100G Teleport Uplinks Verified');
  const [activeBugLogo, setActiveBugLogo] = useState<'drfun1_news' | 'fcc_live' | 'special_report'>('drfun1_news');

  // Teleprompter state
  const [rundownStories, setRundownStories] = useState<NewsRundownStory[]>(INITIAL_RUNDOWN_STORIES);
  const [selectedStoryId, setSelectedStoryId] = useState<string>('story-1');
  const [prompterSpeed, setPrompterSpeed] = useState<number>(3); // 1-10
  const [isPrompterScrolling, setIsPrompterScrolling] = useState<boolean>(false);
  const [prompterFontSize, setPrompterFontSize] = useState<number>(20); // px
  const prompterBoxRef = useRef<HTMLDivElement>(null);

  // EPG & Playout
  const [selectedEpgChannel, setSelectedEpgChannel] = useState<MasterEpgChannel>(MASTER_EPG_CHANNELS[0]);
  const [activeStudioSubTab, setActiveStudioSubTab] = useState<'anchor_desk' | 'teleprompter' | 'rss_wire' | 'epg_channels' | 'news_irc'>('anchor_desk');

  // Uptime & VU timer
  useEffect(() => {
    let timer: any;
    if (isOnAir) {
      timer = setInterval(() => {
        setOnAirUptime(prev => prev + 1);
        if (isMicLive) {
          setAudioLevel(Math.floor(45 + Math.random() * 45));
        } else {
          setAudioLevel(0);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOnAir, isMicLive]);

  // Teleprompter auto-scroll
  useEffect(() => {
    let scrollInterval: any;
    if (isPrompterScrolling && prompterBoxRef.current) {
      scrollInterval = setInterval(() => {
        if (prompterBoxRef.current) {
          prompterBoxRef.current.scrollTop += prompterSpeed;
        }
      }, 50);
    }
    return () => clearInterval(scrollInterval);
  }, [isPrompterScrolling, prompterSpeed]);

  const formatUptime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePushStoryToOnAir = (story: NewsRundownStory) => {
    setSelectedStoryId(story.id);
    setLowerThirdHeadline(story.lowerThirdHeadline);
    setLowerThirdSubhead(story.lowerThirdSubhead);
    setIsLowerThirdActive(true);
    setIsBreakingBannerActive(true);
  };

  const selectedStory = rundownStories.find(s => s.id === selectedStoryId) || rundownStories[0];

  return (
    <div className="space-y-6">
      {/* Top Studio Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 p-0.5 shadow-md shadow-red-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Tv className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  DrFun1 TV &amp; Breaking Newscasting Studio
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isOnAir ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnAir ? 'bg-white' : 'bg-slate-500'}`} />
                  {isOnAir ? 'ON-AIR LIVE' : 'STANDBY'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  FCC FRN 0034981290
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Online Television Master Playout · Breaking News Ticker · Teleprompter Rundown · Synchronized IRC Network
              </p>
            </div>
          </div>

          {/* Broadcast Quick Actions & VU Meter */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Audio VU Indicator */}
            <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 mr-1">MIC VU</span>
              {[20, 40, 60, 80, 95].map((lvl) => (
                <div
                  key={lvl}
                  className={`w-1 h-4 rounded-full transition-all duration-100 ${
                    audioLevel >= lvl
                      ? lvl > 80
                        ? 'bg-red-500'
                        : lvl > 50
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
              <button
                onClick={() => setIsMicLive(!isMicLive)}
                className={`ml-1.5 p-1 rounded transition-colors ${isMicLive ? 'text-emerald-400 hover:text-emerald-300' : 'text-red-400 hover:text-red-300'}`}
                title={isMicLive ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicLive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Uptime Badge */}
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">UPTIME:</span>
              <span className="text-emerald-400 font-bold">{formatUptime(onAirUptime)}</span>
            </div>

            {/* EAS Emergency Interrupt Trigger */}
            <button
              onClick={() => setIsEasAlertActive(!isEasAlertActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isEasAlertActive
                  ? 'bg-red-600 text-white ring-2 ring-red-400 animate-bounce'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Broadcast SCTE-35 EAS Emergency Alert Interruption"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>EAS {isEasAlertActive ? 'ACTIVE' : 'TEST'}</span>
            </button>

            {/* Master On-Air Toggle */}
            <button
              onClick={() => setIsOnAir(!isOnAir)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
                isOnAir
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
              }`}
            >
              {isOnAir ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
              <span>{isOnAir ? 'KILL ON-AIR' : 'GO LIVE ON-AIR'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Navigation for TV & Newscasting */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveStudioSubTab('anchor_desk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeStudioSubTab === 'anchor_desk'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/50'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-rose-400" />
            <span>On-Air Monitor &amp; Desk</span>
          </button>

          <button
            onClick={() => setActiveStudioSubTab('teleprompter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeStudioSubTab === 'teleprompter'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Rundown Teleprompter</span>
          </button>

          <button
            onClick={() => setActiveStudioSubTab('rss_wire')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeStudioSubTab === 'rss_wire'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-sky-300 hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>Live RSS News Wire</span>
          </button>

          <button
            onClick={() => setActiveStudioSubTab('epg_channels')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeStudioSubTab === 'epg_channels'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/50'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-purple-400" />
            <span>Linear TV Channels &amp; EPG</span>
          </button>

          <button
            onClick={() => setActiveStudioSubTab('news_irc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeStudioSubTab === 'news_irc'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Newsroom IRC (#drfun1-news)</span>
          </button>
        </div>
      </div>

      {/* Primary Workspace View */}
      {activeStudioSubTab === 'anchor_desk' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main On-Air Monitor (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between">
              {/* Background Video Simulation */}
              <div className="absolute inset-0 z-0">
                {videoFeedSource === 'anchor_cam' && (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/80 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
                    {/* Simulated anchor desk frame */}
                    <div className="text-center space-y-2 z-10">
                      <div className="w-24 h-24 mx-auto rounded-full bg-slate-800/80 border-2 border-rose-500/40 flex items-center justify-center shadow-lg">
                        <Video className="w-10 h-10 text-rose-400 animate-pulse" />
                      </div>
                      <div className="text-sm font-bold text-white tracking-wide">
                        STUDIO ANCHOR DESK · MAIN BROADCAST CAMERA
                      </div>
                      <div className="text-xs font-mono text-emerald-400">
                        1080p60 · SMPTE 292M SDI INGEST · 4:2:2 10-BIT
                      </div>
                    </div>
                  </div>
                )}

                {videoFeedSource === 'breaking_teleport' && (
                  <div className="w-full h-full bg-gradient-to-tr from-cyan-950 via-slate-950 to-blue-950 flex items-center justify-center relative">
                    <div className="text-center space-y-2 z-10">
                      <Wifi className="w-16 h-16 text-cyan-400 mx-auto animate-bounce" />
                      <div className="text-sm font-bold text-white">
                        SWITCH SUPERNAP NV TELEPORT EARTH STATION DOWNLINK
                      </div>
                      <div className="text-xs font-mono text-cyan-300">
                        SRT LOW-LATENCY CALLER · 100G FIBER RING CARRIER
                      </div>
                    </div>
                  </div>
                )}

                {videoFeedSource === 'satellite_radar' && (
                  <div className="w-full h-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.2)_0%,transparent_60%)]" />
                    <div className="text-center space-y-2 z-10">
                      <Activity className="w-16 h-16 text-sky-400 mx-auto animate-pulse" />
                      <div className="text-sm font-bold text-white">
                        GLOBAL ORBITAL CONSTELLATION TRACKING FEED
                      </div>
                      <div className="text-xs font-mono text-sky-300">
                        SGP4 LIVE PROPAGATION · NORAD CATALOG ACTIVE
                      </div>
                    </div>
                  </div>
                )}

                {videoFeedSource === 'color_bars' && (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 grid grid-cols-7">
                      <div className="bg-slate-100" />
                      <div className="bg-yellow-400" />
                      <div className="bg-cyan-400" />
                      <div className="bg-emerald-500" />
                      <div className="bg-purple-600" />
                      <div className="bg-red-600" />
                      <div className="bg-blue-700" />
                    </div>
                    <div className="h-10 bg-slate-950 flex items-center justify-center font-mono text-[11px] text-white">
                      SMPTE COLOR BARS · 1000 HZ REFERENCE TONE · CALIBRATION NOMINAL
                    </div>
                  </div>
                )}

                {videoFeedSource === 'linear_tv' && (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-950 via-slate-950 to-pink-950 flex items-center justify-center">
                    <div className="text-center space-y-2 z-10">
                      <Tv className="w-16 h-16 text-purple-400 mx-auto" />
                      <div className="text-sm font-bold text-white">
                        DRFUN1 TV LINEAR 24/7 PLAYOUT REEL
                      </div>
                      <div className="text-xs font-mono text-purple-300">
                        STRIMM.COM CLOUD AUTOMATION · MASTER EPG CHANNEL 101
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Top Overlays: On-Air Flag, Clock, Station Bug */}
              <div className="relative z-10 p-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider flex items-center gap-1.5 shadow-lg ${
                    isOnAir ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-white" />
                    {isOnAir ? 'LIVE ON AIR' : 'OFF AIR'}
                  </span>
                  <span className="bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded text-xs font-mono text-slate-300 border border-slate-700/60">
                    {new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' })}
                  </span>
                </div>

                {/* Station Bug Logo */}
                <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 flex items-center gap-2 shadow-lg">
                  {activeBugLogo === 'drfun1_news' && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-xs font-black tracking-tight text-white">
                        DrFun1 <span className="text-rose-400">NEWS HD</span>
                      </span>
                    </>
                  )}
                  {activeBugLogo === 'fcc_live' && (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-xs font-bold text-sky-300">FCC SPACE BUREAU</span>
                    </>
                  )}
                  {activeBugLogo === 'special_report' && (
                    <>
                      <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                      <span className="text-xs font-black text-amber-300 uppercase">SPECIAL REPORT</span>
                    </>
                  )}
                </div>
              </div>

              {/* EAS Alert Banner (Emergency Interrupt) */}
              {isEasAlertActive && (
                <div className="relative z-20 mx-4 p-3 bg-red-600 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-2xl flex items-center gap-3 border-2 border-white animate-pulse">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-black">EMERGENCY ALERT SYSTEM (EAS) ACTIVATED</div>
                    <div className="text-[11px] font-normal opacity-90">
                      SCTE-35 SATELLITE EMERGENCY INTERRUPT · CODE: DMO · DRFUN1 MEDIA INC.
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Overlays: Lower-Thirds & News Ticker */}
              <div className="relative z-10 p-4 space-y-2 pointer-events-none">
                {/* Breaking News Lower-Third */}
                {isLowerThirdActive && (
                  <div className="animate-in slide-in-from-bottom duration-300">
                    <div className="bg-slate-950/95 backdrop-blur-md border-l-4 border-rose-500 rounded-r-xl p-3 shadow-2xl max-w-2xl border-t border-r border-b border-slate-800">
                      {isBreakingBannerActive && (
                        <div className="inline-flex items-center gap-1.5 bg-rose-600 text-white text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-wider mb-1">
                          <Flame className="w-3 h-3 fill-white" />
                          <span>BREAKING NEWS</span>
                        </div>
                      )}
                      <div className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug">
                        {lowerThirdHeadline}
                      </div>
                      <div className="text-xs text-rose-200/90 font-medium mt-0.5">
                        {lowerThirdSubhead}
                      </div>
                    </div>
                  </div>
                )}

                {/* News Crawler / Bottom Ticker */}
                {isNewsTickerActive && (
                  <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-lg p-2 flex items-center gap-2 overflow-hidden text-xs font-mono shadow-xl">
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] shrink-0 tracking-wider">
                      WIRE
                    </span>
                    <div className="text-slate-300 truncate">
                      FCC DOCKET 24-118: SCS SATELLITE CELLULAR BACKHAUL · SWITCH SUPERNAP NV 100G RING NOMINAL · DRFUN1 MEDIA IRC 347 LEAF NODES SYNCED · SOLAR CYCLE 25 NOMINAL ·
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video Source Switcher */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-rose-400" />
                  Broadcast Video Ingest Source
                </span>
                <span className="text-[10px] font-mono text-slate-400">SMPTE Master Switcher</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <button
                  onClick={() => setVideoFeedSource('anchor_cam')}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    videoFeedSource === 'anchor_cam'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">🎙️ Anchor Cam</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Main Studio Desk</div>
                </button>

                <button
                  onClick={() => setVideoFeedSource('breaking_teleport')}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    videoFeedSource === 'breaking_teleport'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">📡 Switch Teleport</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">100G Fiber Downlink</div>
                </button>

                <button
                  onClick={() => setVideoFeedSource('satellite_radar')}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    videoFeedSource === 'satellite_radar'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">🛰️ Orbit Radar</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Constellation Tracker</div>
                </button>

                <button
                  onClick={() => setVideoFeedSource('linear_tv')}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    videoFeedSource === 'linear_tv'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">📺 DrFun1 Linear TV</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Strimm 24/7 Channel</div>
                </button>

                <button
                  onClick={() => setVideoFeedSource('color_bars')}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    videoFeedSource === 'color_bars'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">📊 Color Bars</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">SMPTE 1000Hz Tone</div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Lower-Thirds & Graphics Control Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Lower-Thirds Controller */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-rose-400" />
                  On-Air Lower-Thirds &amp; Graphics
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  Live CG Engine
                </span>
              </div>

              {/* Toggles */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">Lower-Third Banner:</span>
                  <button
                    onClick={() => setIsLowerThirdActive(!isLowerThirdActive)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono transition-colors cursor-pointer ${
                      isLowerThirdActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isLowerThirdActive ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">Breaking News Badge:</span>
                  <button
                    onClick={() => setIsBreakingBannerActive(!isBreakingBannerActive)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono transition-colors cursor-pointer ${
                      isBreakingBannerActive ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isBreakingBannerActive ? 'BREAKING' : 'STANDARD'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">Bottom Crawler Wire:</span>
                  <button
                    onClick={() => setIsNewsTickerActive(!isNewsTickerActive)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono transition-colors cursor-pointer ${
                      isNewsTickerActive ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isNewsTickerActive ? 'SCROLLING' : 'MUTED'}
                  </button>
                </div>
              </div>

              {/* Headline Editor */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Lower-Third Headline:
                </label>
                <input
                  type="text"
                  value={lowerThirdHeadline}
                  onChange={(e) => setLowerThirdHeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sub-Headline / Details:
                </label>
                <input
                  type="text"
                  value={lowerThirdSubhead}
                  onChange={(e) => setLowerThirdSubhead(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Station Bug Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Station Bug Logo:
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    onClick={() => setActiveBugLogo('drfun1_news')}
                    className={`p-1.5 rounded border text-center transition-colors cursor-pointer ${
                      activeBugLogo === 'drfun1_news' ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    DrFun1 HD
                  </button>
                  <button
                    onClick={() => setActiveBugLogo('fcc_live')}
                    className={`p-1.5 rounded border text-center transition-colors cursor-pointer ${
                      activeBugLogo === 'fcc_live' ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    FCC Live
                  </button>
                  <button
                    onClick={() => setActiveBugLogo('special_report')}
                    className={`p-1.5 rounded border text-center transition-colors cursor-pointer ${
                      activeBugLogo === 'special_report' ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Special
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Push Story from Rundown */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Quick-Push Story to On-Air CG
              </span>
              <div className="space-y-2">
                {rundownStories.slice(0, 3).map((st) => (
                  <div
                    key={st.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="truncate">
                      <div className="font-semibold text-white truncate">{st.title}</div>
                      <div className="text-[10px] text-slate-500">{st.source} · {st.time}</div>
                    </div>
                    <button
                      onClick={() => handlePushStoryToOnAir(st)}
                      className="px-2 py-1 rounded bg-rose-600/80 hover:bg-rose-500 text-white font-mono text-[10px] shrink-0 font-bold transition cursor-pointer"
                    >
                      PUSH ON-AIR
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Teleprompter & Rundown Script Editor */}
      {activeStudioSubTab === 'teleprompter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Teleprompter Display (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Live Anchor Teleprompter
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isPrompterScrolling ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {isPrompterScrolling ? 'AUTO-SCROLLING' : 'PAUSED'}
                </span>
              </div>

              {/* Prompter Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                  <span>Speed: {prompterSpeed}x</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={prompterSpeed}
                    onChange={(e) => setPrompterSpeed(Number(e.target.value))}
                    className="w-20 accent-amber-400"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                  <span>Size: {prompterFontSize}px</span>
                  <input
                    type="range"
                    min="16"
                    max="36"
                    value={prompterFontSize}
                    onChange={(e) => setPrompterFontSize(Number(e.target.value))}
                    className="w-16 accent-amber-400"
                  />
                </div>

                <button
                  onClick={() => setIsPrompterScrolling(!isPrompterScrolling)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                    isPrompterScrolling ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {isPrompterScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPrompterScrolling ? 'PAUSE' : 'SCROLL'}</span>
                </button>
              </div>
            </div>

            {/* Scrolling Teleprompter Screen */}
            <div
              ref={prompterBoxRef}
              className="bg-slate-950 border border-slate-800 rounded-xl p-8 h-[520px] overflow-y-auto space-y-8 font-sans transition-all leading-relaxed"
              style={{ fontSize: `${prompterFontSize}px` }}
            >
              <div className="border-b border-amber-500/30 pb-4 text-amber-400 font-mono text-sm tracking-widest uppercase">
                *** DRFUN1 MEDIA BREAKING NEWSWIRE · BROADCAST RUNDOWN ***
              </div>

              {rundownStories.map((story, idx) => (
                <div
                  key={story.id}
                  className={`p-4 rounded-xl transition border ${
                    selectedStoryId === story.id
                      ? 'bg-amber-950/20 border-amber-500/60 shadow-lg'
                      : 'border-transparent hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-amber-300 mb-2">
                    <span>ITEM {idx + 1}: {story.category.toUpperCase()}</span>
                    <span>SOURCE: {story.source}</span>
                  </div>
                  <h3 className="font-extrabold text-white mb-3 text-lg leading-snug">
                    {story.title}
                  </h3>
                  <p className="text-slate-200 font-normal">
                    {story.body}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">CG: {story.lowerThirdHeadline}</span>
                    <button
                      onClick={() => handlePushStoryToOnAir(story)}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] font-bold cursor-pointer"
                    >
                      PUSH TO LOWER-THIRD
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rundown Story Manager (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Rundown Stories Queue ({rundownStories.length})
              </span>
              <div className="space-y-2">
                {rundownStories.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => setSelectedStoryId(story.id)}
                    className={`w-full p-3 rounded-lg text-left transition border cursor-pointer ${
                      selectedStoryId === story.id
                        ? 'bg-amber-500/10 border-amber-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 mb-1">
                      <span>{story.category.toUpperCase()}</span>
                      <span>{story.time}</span>
                    </div>
                    <div className="text-xs font-bold line-clamp-2">{story.title}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Real-Time Satellite & FCC RSS News Wire */}
      {activeStudioSubTab === 'rss_wire' && (
        <div className="space-y-4">
          <SatelliteRssNewsSection mode="full" />
        </div>
      )}

      {/* Sub-Tab 4: Linear TV Playout & Master EPG */}
      {activeStudioSubTab === 'epg_channels' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-purple-400" />
                  {selectedEpgChannel.name} ({selectedEpgChannel.callSign})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Channel #{selectedEpgChannel.channelNumber} · Frequency: {selectedEpgChannel.carrierFrequency} · Owner: {selectedEpgChannel.networkOwner}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                1080p 60 FPS
              </span>
            </div>

            <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center relative">
              <div className="text-center space-y-2 z-10">
                <Tv className="w-16 h-16 text-purple-400 mx-auto" />
                <div className="text-sm font-bold text-white">
                  NOW AIRING: {selectedEpgChannel.currentProgram}
                </div>
                <div className="text-xs font-mono text-purple-300">
                  {selectedEpgChannel.currentDuration} · Host: {selectedEpgChannel.currentHost} · Facility: {selectedEpgChannel.fccFacilityId}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-white">Program Details:</div>
              <p className="text-slate-400">
                Category: {selectedEpgChannel.category} · Resolution: {selectedEpgChannel.resolution} ({selectedEpgChannel.bitrate}) · Dedicated IRC Channel: {selectedEpgChannel.unrealIrcChannel}
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-purple-400" />
              Electronic Program Guide (EPG)
            </span>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {MASTER_EPG_CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedEpgChannel(ch)}
                  className={`w-full p-2.5 rounded-lg text-left transition border cursor-pointer ${
                    selectedEpgChannel.id === ch.id
                      ? 'bg-purple-500/20 border-purple-500/60 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-purple-300">
                    <span>CH {ch.channelNumber}</span>
                    <span>{ch.callSign}</span>
                  </div>
                  <div className="text-xs truncate font-semibold mt-0.5">{ch.name}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">Now: {ch.currentProgram}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 5: Integrated Newsroom WebIRC Client */}
      {activeStudioSubTab === 'news_irc' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                DrFun1 Newsroom IRC Room (#drfun1-news)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Direct leaf connection to irc.drfun1.com:6697 (SSL) · Live viewer tips, field reports &amp; newsroom coordination
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
              UnrealIRCd 6.1.4
            </span>
          </div>

          <MultistreamIrcChatRoom
            variant="full"
            activeRank={activeRank}
            onOpenAdminPanel={onOpenIrcdAdmin}
            onOpenIrcClient={onNavigateToIrc}
            defaultChannel="#drfun1-news"
          />
        </div>
      )}
    </div>
  );
};
