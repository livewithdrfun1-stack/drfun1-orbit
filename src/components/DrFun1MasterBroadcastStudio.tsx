/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Unified All-in-One Master Broadcast Studio:
 * - DrFun1TV (Strimm.com Rebranded Linear TV Playout & Channel Control)
 * - Restream.io Multi-Destination Broadcasting
 * - TVU Networks (tvunetworks.com) IP Grid & Multi-Cam Producer
 * - Cablecast (cablecast.tv) PEG Community Automation & EAS Interrupt
 * - Cadjin (cadjin.com) Master Control Switcher & SCTE-35 Ad Splice
 * - Master FCC.gov EPG (DrFun1 ECOM, Paramount, Disney, WBD, Comcast, Dish, SATCOM)
 * - 1-to-1 Dedicated IRC Channel per Broadcast Channel
 * - "Start Your Own Channel" Studio Creator Wizard
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MasterEpgChannel, CustomChannelDraft, EpgMediaGroup, BroadcastEngineMode } from '../types/masterEpg';
import { MASTER_EPG_CHANNELS } from '../data/masterEpgData';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { MultistreamIrcChatRoom } from './MultistreamIrcChatRoom';
import { 
  TwitchDevConfig, 
  KickDevConfig, 
  BroadcasterUserProfile, 
  ForumThread, 
  ForumReply 
} from '../types/developerPortals';
import { 
  DEFAULT_TWITCH_DEV_CONFIG, 
  DEFAULT_KICK_DEV_CONFIG, 
  DEFAULT_USER_PROFILE, 
  INITIAL_FORUM_THREADS, 
  INITIAL_FAQ_ITEMS 
} from '../data/developerPortalsData';
import { TwitchDevPortalPanel } from './studio/TwitchDevPortalPanel';
import { KickDevPortalPanel } from './studio/KickDevPortalPanel';
import { BroadcasterForumsPanel } from './studio/BroadcasterForumsPanel';
import { StudioFaqPanel } from './studio/StudioFaqPanel';
import { StudioFaqModal } from './studio/StudioFaqModal';
import { UserProfileModal } from './studio/UserProfileModal';
import { CableSatelliteScannerModal } from './studio/CableSatelliteScannerModal';
import { DRFUN1_SCANNABLE_CABLE_SATELLITE_STATIONS } from '../data/drfun1ScannedStationsData';
import { 
  Tv, 
  Radio, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Activity, 
  ShieldCheck, 
  Server, 
  Globe, 
  ExternalLink, 
  Clock, 
  Layers, 
  Search, 
  Filter, 
  Share2, 
  Maximize2, 
  Sparkles, 
  Wifi, 
  Film, 
  Sliders, 
  Terminal, 
  RefreshCw, 
  Zap, 
  Scale, 
  Building2, 
  Video, 
  MessageSquare,
  Plus,
  Check,
  AlertTriangle,
  Flame,
  Radio as AntennaIcon,
  Monitor,
  Calendar,
  X as CloseIcon,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  User,
  HelpCircle,
  Code2,
  BookOpen,
  Network
} from 'lucide-react';

interface DrFun1MasterBroadcastStudioProps {
  onOpenStore?: () => void;
  onOpenIrc?: () => void;
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onOpenSwitchWittServices?: () => void;
  onOpenMpd?: () => void;
  onOpenDuplicator?: () => void;
  activeRank?: AnopeRankLevel;
  onOpenIrcdAdmin?: () => void;
}

const DEFAULT_CUSTOM_DRAFT: CustomChannelDraft = {
  name: 'My Galaxy Community TV',
  callSign: 'WXYZ-TV',
  category: 'Community PEG',
  resolution: '1080p60 Full HD',
  bitrate: '8.5 Mbps H.264',
  playoutEngine: 'strimm_drfun1tv',
  logoBugText: 'WXYZ TV LIVE',
  newsTickerCrawl: 'Welcome to our independent community station powered by DrFun1TV & Restream.io studio!',
  scte35AdIntervalMinutes: 15,
  unrealIrcChannel: '#wxyz-tv',
  enableRestreamIo: true,
  restreamDestinations: ['YouTube Live', 'Twitch', 'Kick'],
  initialProgramName: 'Community Open Broadcast & Creative Showcase',
  initialHost: 'Station Operator',
};

export const DrFun1MasterBroadcastStudio: React.FC<DrFun1MasterBroadcastStudioProps> = ({
  onOpenStore,
  onOpenIrc,
  onOpenLicense,
  onOpenSwitchMesh,
  onOpenSwitchWittServices,
  onOpenMpd,
  onOpenDuplicator,
  activeRank = 'op',
  onOpenIrcdAdmin,
}) => {
  // Master Channels List (Base EPG + Scanned Cable/Satellite Stations + User-Created Custom Channels)
  const [channels, setChannels] = useState<MasterEpgChannel[]>(() => {
    try {
      const savedScanned = localStorage.getItem('drfun1_scanned_channels');
      const savedCustom = localStorage.getItem('drfun1_custom_channels');
      let list = [...MASTER_EPG_CHANNELS];
      if (savedScanned) {
        const parsedScanned: MasterEpgChannel[] = JSON.parse(savedScanned);
        const existingIds = new Set(list.map(c => c.id));
        const filteredScanned = parsedScanned.filter(s => !existingIds.has(s.id));
        list = [...list, ...filteredScanned];
      }
      if (savedCustom) {
        const parsedCustom: MasterEpgChannel[] = JSON.parse(savedCustom);
        const existingIds = new Set(list.map(c => c.id));
        const filteredCustom = parsedCustom.filter(s => !existingIds.has(s.id));
        list = [...list, ...filteredCustom];
      }
      return list;
    } catch (_) {}
    return MASTER_EPG_CHANNELS;
  });

  // Cable & Satellite RF Transponder Scanner Modal State
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);

  // Dedicated Platform FAQ & Guidance Modal State
  const [isFaqModalOpen, setIsFaqModalOpen] = useState<boolean>(false);

  // Selected Channel
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0].id);
  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === selectedChannelId) || channels[0];
  }, [channels, selectedChannelId]);

  // Video Canvas & Web Audio State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(75);
  const [currentUptimeSeconds, setCurrentUptimeSeconds] = useState<number>(1420);

  // Active Studio Mode Tab
  const [activeStudioTool, setActiveStudioTool] = useState<
    | 'strimm_drfun1tv'
    | 'epg_guide'
    | 'restream_multistream'
    | 'dev_twitch'
    | 'dev_kick'
    | 'tvu_networks'
    | 'cablecast_peg'
    | 'cadjin_master_control'
    | 'forums'
    | 'faq'
  >('strimm_drfun1tv');

  // User Profile State
  const [userProfile, setUserProfile] = useState<BroadcasterUserProfile>(() => {
    try {
      const saved = localStorage.getItem('drfun1_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_USER_PROFILE;
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // dev.twitch.tv Developer Configuration
  const [twitchConfig, setTwitchConfig] = useState<TwitchDevConfig>(() => {
    try {
      const saved = localStorage.getItem('drfun1_twitch_dev_config');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_TWITCH_DEV_CONFIG;
  });

  // dev.kick.com Developer Configuration
  const [kickConfig, setKickConfig] = useState<KickDevConfig>(() => {
    try {
      const saved = localStorage.getItem('drfun1_kick_dev_config');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_KICK_DEV_CONFIG;
  });

  // Broadcaster Forums State
  const [forumThreads, setForumThreads] = useState<ForumThread[]>(() => {
    try {
      const saved = localStorage.getItem('drfun1_forum_threads');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_FORUM_THREADS;
  });

  const handleUpdateTwitchConfig = (newCfg: TwitchDevConfig) => {
    setTwitchConfig(newCfg);
    try {
      localStorage.setItem('drfun1_twitch_dev_config', JSON.stringify(newCfg));
    } catch (_) {}
  };

  const handleUpdateKickConfig = (newCfg: KickDevConfig) => {
    setKickConfig(newCfg);
    try {
      localStorage.setItem('drfun1_kick_dev_config', JSON.stringify(newCfg));
    } catch (_) {}
  };

  const handleSaveUserProfile = (updatedProfile: BroadcasterUserProfile) => {
    setUserProfile(updatedProfile);
    try {
      localStorage.setItem('drfun1_user_profile', JSON.stringify(updatedProfile));
    } catch (_) {}
  };

  const handleAddForumThread = (newThread: ForumThread) => {
    const updated = [newThread, ...forumThreads];
    setForumThreads(updated);
    try {
      localStorage.setItem('drfun1_forum_threads', JSON.stringify(updated));
    } catch (_) {}
  };

  const handleAddForumReply = (threadId: string, reply: ForumReply) => {
    const updated = forumThreads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          repliesCount: t.repliesCount + 1,
          replies: [...t.replies, reply],
        };
      }
      return t;
    });
    setForumThreads(updated);
    try {
      localStorage.setItem('drfun1_forum_threads', JSON.stringify(updated));
    } catch (_) {}
  };

  // Handle Adding Scanned Cable & Satellite Stations
  const handleAddScannedStations = (newStations: MasterEpgChannel[]) => {
    setChannels(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const toAdd = newStations.filter(s => !existingIds.has(s.id));
      const combined = [...prev, ...toAdd];
      try {
        const allScanned = combined.filter(c => c.isScannedStation);
        localStorage.setItem('drfun1_scanned_channels', JSON.stringify(allScanned));
      } catch (_) {}
      return combined;
    });

    if (newStations.length > 0) {
      setSelectedChannelId(newStations[0].id);
      setCreatedSuccessAlert(`Scanned and imported ${newStations.length} DrFun1 ECOM Cable & Satellite stations with 1:1 dedicated IRC channels!`);
      setTimeout(() => setCreatedSuccessAlert(null), 6000);
    }
  };

  // EPG Browser Filters
  const [epgGroupFilter, setEpgGroupFilter] = useState<'All' | EpgMediaGroup>('All');
  const [epgSearch, setEpgSearch] = useState<string>('');
  const [epgCategoryFilter, setEpgCategoryFilter] = useState<string>('All');

  // DrFun1TV (Strimm.com Rebranded) Customizer States
  const [logoBugPosition, setLogoBugPosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('top-right');
  const [logoBugOpacity, setLogoBugOpacity] = useState<number>(85);
  const [isLogoBugEnabled, setIsLogoBugEnabled] = useState<boolean>(true);
  const [newsTickerText, setNewsTickerText] = useState<string>(activeChannel.newsTickerCrawl);
  const [isTickerEnabled, setIsTickerEnabled] = useState<boolean>(true);
  const [isBreakingNewsBanner, setIsBreakingNewsBanner] = useState<boolean>(false);
  const [showLowerThirds, setShowLowerThirds] = useState<boolean>(true);
  const [scte35AdBreakActive, setScte35AdBreakActive] = useState<boolean>(false);
  const [scte35Countdown, setScte35Countdown] = useState<number>(0);

  // Restream.io Multistream Playout State
  const [isRestreamBroadcasting, setIsRestreamBroadcasting] = useState<boolean>(true);
  const [activeDestinations, setActiveDestinations] = useState<{ [key: string]: boolean }>({
    'YouTube Live': true,
    'Twitch TV': true,
    'Facebook Live': true,
    'X / Twitter': true,
    'Kick Streaming': true,
    'Rumble': true,
    'Switch Teleport RTMP': true,
  });

  // TVU Networks Grid State
  const [tvuActiveCamera, setTvuActiveCamera] = useState<'CAM 1' | 'CAM 2' | 'Switch Teleport' | 'Satellite Downlink'>('Switch Teleport');
  const [tvuBondedCellular, setTvuBondedCellular] = useState<boolean>(true);
  const [tvuGridRouteDestination, setTvuGridRouteDestination] = useState<string>('Las Vegas Core Earth Station');

  // Cablecast PEG Automation State
  const [cablecastCarouselActive, setCablecastCarouselActive] = useState<boolean>(true);
  const [cablecastEasAlertTriggered, setCablecastEasAlertTriggered] = useState<boolean>(false);
  const [cablecastBulletinText, setCablecastBulletinText] = useState<string>('Community Notice: City Council Public Hearing broadcast live at 7:00 PM EST');

  // Cadjin Master Control Switcher State
  const [cadjinPgmSource, setCadjinPgmSource] = useState<string>('Live Broadcast Playout');
  const [cadjinPvwSource, setCadjinPvwSource] = useState<string>('Satellite Feed Ingest');
  const [cadjinTransitionType, setCadjinTransitionType] = useState<'CUT' | 'DISSOLVE' | 'AUTO 1s'>('CUT');
  const [cadjinAudioLoudness, setCadjinAudioLoudness] = useState<number>(-23.4); // LUFS (EBU R128 standard)

  // Start Your Own Channel Wizard Modal
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState<boolean>(false);
  const [channelDraft, setChannelDraft] = useState<CustomChannelDraft>(DEFAULT_CUSTOM_DRAFT);
  const [createStep, setCreateStep] = useState<number>(1);
  const [createdSuccessAlert, setCreatedSuccessAlert] = useState<string | null>(null);

  // Synchronize news ticker when channel changes
  useEffect(() => {
    setNewsTickerText(activeChannel.newsTickerCrawl);
  }, [activeChannel]);

  // Video Canvas & Web Audio synth for broadcast tone/visuals
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscNodeRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Live Uptime Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentUptimeSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // SCTE-35 Ad Countdown Timer
  useEffect(() => {
    if (scte35AdBreakActive && scte35Countdown > 0) {
      const countdownTimer = setInterval(() => {
        setScte35Countdown(prev => {
          if (prev <= 1) {
            setScte35AdBreakActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownTimer);
    }
  }, [scte35AdBreakActive, scte35Countdown]);

  // Canvas visual rendering loop for live broadcast screen
  useEffect(() => {
    const canvas = videoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark studio background
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, w, h);

      // Animated background grid & telemetry pulses
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.12)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Dynamic central radar / constellation orbit rings
      const cx = w / 2;
      const cy = h / 2 - 20;
      const radius = 90 + Math.sin(frame * 0.03) * 12;

      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius * 1.5);
      grad.addColorStop(0, 'rgba(14, 165, 233, 0.25)');
      grad.addColorStop(0.5, 'rgba(99, 102, 241, 0.1)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Rotating satellite telemetry orbit
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      const satAngle = frame * 0.02;
      const sx = cx + Math.cos(satAngle) * radius;
      const sy = cy + Math.sin(satAngle) * radius;

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Station Watermark in Center Screen
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.font = 'bold 54px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(activeChannel.callSign, cx, cy + 20);

      // Video Source tag
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText(`FCC: ${activeChannel.fccFacilityId} | ${activeChannel.resolution} | ${activeChannel.carrierFrequency}`, cx, cy + 50);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeChannel]);

  // Audio tone synthesizer for simulated live feed
  useEffect(() => {
    if (!isPlaying) {
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (oscNodeRef.current) {
        try { oscNodeRef.current.stop(); } catch (_) {}
        try { oscNodeRef.current.disconnect(); } catch (_) {}
      }
      if (gainNodeRef.current) {
        try { gainNodeRef.current.disconnect(); } catch (_) {}
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Harmonic pleasant station tone
      osc.frequency.setValueAtTime(432, ctx.currentTime);
      gain.gain.setValueAtTime(isMuted ? 0 : (volume / 100) * 0.012, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscNodeRef.current = osc;
      gainNodeRef.current = gain;
    } catch (_) {}

    return () => {
      if (oscNodeRef.current) {
        try { oscNodeRef.current.stop(); } catch (_) {}
      }
    };
  }, [isPlaying, isMuted, volume]);

  // Handle Trigger SCTE-35 Commercial Ad Insertion
  const handleTriggerScte35 = () => {
    setScte35AdBreakActive(true);
    setScte35Countdown(15); // 15 second simulated commercial break
  };

  // Filtered EPG channels
  const filteredEpgChannels = useMemo(() => {
    return channels.filter(channel => {
      const matchesGroup = epgGroupFilter === 'All' 
        || (epgGroupFilter === 'DrFun1 Scanned Cable/Satellite' ? Boolean(channel.isScannedStation) : channel.networkOwner === epgGroupFilter);
      const matchesCategory = epgCategoryFilter === 'All' || channel.category === epgCategoryFilter;
      const searchLower = epgSearch.toLowerCase().trim();
      const matchesSearch = !searchLower || 
        channel.name.toLowerCase().includes(searchLower) ||
        channel.callSign.toLowerCase().includes(searchLower) ||
        channel.fccFacilityId.toLowerCase().includes(searchLower) ||
        channel.currentProgram.toLowerCase().includes(searchLower) ||
        channel.currentHost.toLowerCase().includes(searchLower) ||
        channel.unrealIrcChannel.toLowerCase().includes(searchLower) ||
        (channel.transponder && channel.transponder.toLowerCase().includes(searchLower)) ||
        (channel.carrierFrequency && channel.carrierFrequency.toLowerCase().includes(searchLower)) ||
        (channel.scannedBand && channel.scannedBand.toLowerCase().includes(searchLower));

      return matchesGroup && matchesCategory && matchesSearch;
    });
  }, [channels, epgGroupFilter, epgCategoryFilter, epgSearch]);

  // Handle Tune to Station & Sync IRC
  const handleTuneStation = (channel: MasterEpgChannel) => {
    setSelectedChannelId(channel.id);
  };

  // Handle Create Channel
  const handleCreateChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `custom-ch-${Date.now()}`;
    const newChannelNumber = Math.max(...channels.map(c => c.channelNumber)) + 1;
    const cleanIrcChannel = channelDraft.unrealIrcChannel.startsWith('#') 
      ? channelDraft.unrealIrcChannel.toLowerCase() 
      : `#${channelDraft.unrealIrcChannel.toLowerCase()}`;

    const newChannel: MasterEpgChannel = {
      id: newId,
      channelNumber: newChannelNumber,
      name: channelDraft.name,
      callSign: channelDraft.callSign.toUpperCase(),
      fccFacilityId: `CUST-${Math.floor(10000 + Math.random() * 90000)}`,
      fccFrn: '0034981290',
      fccRulePart: 'Part 73 Digital Subcarrier / Part 25 NTN',
      networkOwner: 'Custom User Channels',
      category: channelDraft.category,
      frequencyBand: 'Ka-Band / Optical Laser Ingest',
      carrierFrequency: '28.50 GHz Custom Uplink',
      transponder: 'Switch SUPERNAP Teleport Node #25',
      resolution: channelDraft.resolution,
      bitrate: channelDraft.bitrate,
      audioCodec: 'Dolby Digital Plus 5.1 / 48kHz',
      currentProgram: channelDraft.initialProgramName,
      currentHost: channelDraft.initialHost,
      currentDuration: 'Live 24/7 Automation',
      upNextProgram: 'Scheduled Cloud Rundown & IRC Community Session',
      unrealIrcChannel: cleanIrcChannel,
      streamEndpoint: `https://stream.drfun1.com/custom/${newId}/live.m3u8`,
      hlsStreamUrl: `https://cdn.drfun1.com/hls/${newId}.m3u8`,
      rtmpUplinkUrl: `rtmp://uplink.switch.drfun1.com:1935/live/${newId}`,
      status: 'live',
      viewers: 140,
      logoBugText: channelDraft.logoBugText,
      newsTickerCrawl: channelDraft.newsTickerCrawl,
      scte35Enabled: true,
      tvuGridRoutable: true,
      cablecastAutomation: true,
      restreamDestinationsCount: channelDraft.restreamDestinations.length,
      isCustomChannel: true,
    };

    const updatedChannels = [...channels, newChannel];
    setChannels(updatedChannels);
    try {
      const customOnly = updatedChannels.filter(c => c.isCustomChannel);
      localStorage.setItem('drfun1_custom_channels', JSON.stringify(customOnly));
    } catch (_) {}

    setSelectedChannelId(newId);
    setIsCreateChannelModalOpen(false);
    setCreatedSuccessAlert(`Successfully launched new channel ${newChannel.name} (${newChannel.callSign}) with dedicated IRC ${newChannel.unrealIrcChannel}!`);
    setTimeout(() => setCreatedSuccessAlert(null), 6000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      
      {/* ========================================================
          TOP BANNER: BRAND, LICENSING & GLOBAL STUDIO STATUS
          ======================================================== */}
      <section className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5 backdrop-blur-md sticky top-14 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 rounded-xl text-slate-950 shadow-md shadow-sky-500/20">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  <span>DrFun1TV</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    MASTER BROADCAST STUDIO
                  </span>
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-300 font-medium">
                  Strimm.com + Restream.io + TVU + Cablecast + Cadjin Unified
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                FCC Licensed DrFun1 ECOM & Paramount, Disney, WBD, Comcast, Dish, SATCOM Feeds | 1-to-1 IRC Mesh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Broadcaster User Profile Button */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700 rounded-lg text-xs transition-colors flex items-center gap-2 shadow-sm"
              title="Open Broadcaster & Developer Profile"
            >
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.displayName}
                className="w-4 h-4 rounded-full object-cover border border-sky-400"
              />
              <span className="font-semibold hidden sm:inline">{userProfile.displayName}</span>
              <span className="text-[10px] font-mono px-1 rounded bg-sky-500/20 text-sky-300">
                {userProfile.role === 'Master Broadcaster' ? 'Master' : 'Dev'}
              </span>
            </button>

            {/* dev.twitch.tv quick tab button */}
            <button
              onClick={() => setActiveStudioTool('dev_twitch')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                activeStudioTool === 'dev_twitch'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span>dev.twitch.tv</span>
            </button>

            {/* dev.kick.com quick tab button */}
            <button
              onClick={() => setActiveStudioTool('dev_kick')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                activeStudioTool === 'dev_kick'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>dev.kick.com</span>
            </button>

            {/* Forums quick tab button */}
            <button
              onClick={() => setActiveStudioTool('forums')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                activeStudioTool === 'forums'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>Forums</span>
            </button>

            {/* Unified Studio FAQ & Platform Guide Button (Both FAQs in Same Page) */}
            <button
              onClick={() => {
                setActiveStudioTool('faq');
                const el = document.getElementById('studio-tools-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm ${
                activeStudioTool === 'faq'
                  ? 'bg-purple-600 text-white font-bold shadow-purple-600/30'
                  : 'bg-gradient-to-r from-purple-950/80 to-indigo-950/80 hover:from-purple-900/80 hover:to-indigo-900/80 text-purple-200 border border-purple-700/60'
              }`}
              title="Studio FAQ & Platform Guide (Both FAQs Unified On This Page)"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Studio FAQ &amp; Guide</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500 text-white font-bold">
                ALL IN ONE
              </span>
            </button>

            {/* Scan Cable / Satellite Stations Button */}
            <button
              onClick={() => setIsScannerModalOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-emerald-500/20 hover:from-sky-500/30 hover:to-emerald-500/30 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-sky-500/10"
              title="Scan all Cable & Satellite stations owned by DrFun1 ECOM Inc."
            >
              <AntennaIcon className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Scan Cable/Sat Stations</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-400 text-slate-950 font-extrabold">
                RF SCAN
              </span>
            </button>

            {/* Start Your Own Channel CTA */}
            <button
              onClick={() => {
                setCreateStep(1);
                setIsCreateChannelModalOpen(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold rounded-lg text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Start Your Own Channel</span>
            </button>

            {/* Witt Law Firm Accreditation Badge */}
            <button
              onClick={onOpenLicense}
              className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 border border-slate-700 rounded-lg text-xs transition-colors flex items-center gap-1.5"
              title="View Witt Law Firm Certificate RAW-SATCOM-2026-LIC-0881"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium hidden sm:inline">Witt Law Certified</span>
            </button>

            {/* Switch Owned Infrastructure & Witt Law Satellite Fiber Services */}
            {onOpenSwitchWittServices && (
              <button
                onClick={onOpenSwitchWittServices}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-950/80 to-teal-950/80 hover:from-emerald-900/80 hover:to-teal-900/80 text-emerald-300 border border-emerald-500/50 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-950/20"
                title="Switch.com Owned Infrastructure & Witt Law Satellite Fiber Portal (Cert: RAW-SATCOM-2026-LIC-0881 | FCC FRN: 0034981290)"
              >
                <Network className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold">Switch &amp; Witt Fiber</span>
              </button>
            )}

            {/* Oper Admin Panel Link if op or higher */}
            {onOpenIrcdAdmin && (
              <button
                onClick={onOpenIrcdAdmin}
                className="px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 rounded-lg text-xs transition-colors flex items-center gap-1.5 font-mono"
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>IRCD NetAdmin</span>
              </button>
            )}
          </div>

        </div>
      </section>

      {/* Success alert message for new channel creation */}
      {createdSuccessAlert && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-mono shadow-lg">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{createdSuccessAlert}</span>
            </div>
            <button onClick={() => setCreatedSuccessAlert(null)} className="text-emerald-400 hover:text-emerald-200">
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MAIN WORKSPACE: VIDEO PLAYER + HUD + DOCKED IRC + TOOLS
          ======================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        
        {/* ROW 1: MASTER CANVAS PLAYER & HUD + DOCKED 1-TO-1 IRC CHAT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 8 COLS: BROADCAST CANVAS PLAYER WITH ON-SCREEN GRAPHICS */}
          <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Player Header Bar: Tuned Station Title, Call Sign & Dedicated IRC Indicator */}
            <div className="bg-slate-950/90 border-b border-slate-800/90 px-4 py-2.5 flex items-center justify-between gap-3 text-xs flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-white tracking-wide">
                  CH {activeChannel.channelNumber} — {activeChannel.name}
                </span>
                <span className="font-mono text-[11px] text-sky-400 bg-sky-950/70 border border-sky-800/60 px-1.5 py-0.5 rounded">
                  {activeChannel.callSign}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activeChannel.networkOwner}
                </span>
              </div>

              {/* Dedicated 1-to-1 IRC Channel Tag */}
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-slate-400">1:1 IRC Room:</span>
                <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-800/70 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-emerald-400" />
                  <span>{activeChannel.unrealIrcChannel}</span>
                </span>
              </div>
            </div>

            {/* Video Canvas Container with On-Screen Graphics Overlays */}
            <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center select-none">
              
              {/* HTML5 Canvas Background Visualizer */}
              <canvas
                ref={videoCanvasRef}
                width={854}
                height={480}
                className="w-full h-full object-cover"
              />

              {/* SCTE-35 Commercial Ad Break Overlay (When Active) */}
              {scte35AdBreakActive && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-30 backdrop-blur-sm animate-fade-in">
                  <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl mb-3">
                    <Zap className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                    SCTE-35 Digital Ad Splice In Progress
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    DrFun1 Wireless — Multi-Carrier Satellite 5G Handsets
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mt-1">
                    Unlocked iPhone 16 Pro Max & Galaxy S25 Ultra with direct LEO satellite fallback. Resell and brand via DrFun1 ECOM Inc.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Resuming station feed in:</span>
                    <span className="text-base font-mono font-extrabold text-amber-400 bg-slate-900 px-3 py-1 rounded border border-slate-700">
                      {scte35Countdown}s
                    </span>
                  </div>
                </div>
              )}

              {/* Strimm.com Rebranded: ON-SCREEN LOGO WATERMARK / CORNER BUG */}
              {isLogoBugEnabled && (
                <div 
                  className={`absolute z-10 pointer-events-none transition-all ${
                    logoBugPosition === 'top-right' ? 'top-4 right-4' :
                    logoBugPosition === 'top-left' ? 'top-4 left-4' :
                    logoBugPosition === 'bottom-right' ? 'bottom-16 right-4' : 'bottom-16 left-4'
                  }`}
                  style={{ opacity: logoBugOpacity / 100 }}
                >
                  <div className="bg-slate-950/80 border border-slate-700/80 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xl">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                    <span className="font-mono text-xs font-extrabold tracking-wider text-white">
                      {activeChannel.logoBugText || activeChannel.callSign}
                    </span>
                    <span className="text-[10px] font-mono text-sky-400 border-l border-slate-700 pl-1.5">
                      DRFUN1-TV
                    </span>
                  </div>
                </div>
              )}

              {/* Strimm.com Rebranded: ON-SCREEN DIGITAL CLOCK BUG (Top Left) */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="bg-slate-950/70 border border-slate-800 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>{new Date().toLocaleTimeString('en-US', { hour12: false })} UTC</span>
                </div>
              </div>

              {/* Strimm.com Rebranded: LOWER THIRDS GRAPHICS OVERLAY */}
              {showLowerThirds && !scte35AdBreakActive && (
                <div className="absolute bottom-12 left-4 z-10 pointer-events-none max-w-lg">
                  <div className="bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-transparent border-l-4 border-sky-400 p-2.5 rounded-r-lg backdrop-blur-sm shadow-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-semibold">
                        NOW BROADCASTING
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {activeChannel.currentDuration}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-tight mt-0.5 truncate">
                      {activeChannel.currentProgram}
                    </h4>
                    <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                      Host: <strong className="text-emerald-400">{activeChannel.currentHost}</strong> | Next: {activeChannel.upNextProgram}
                    </p>
                  </div>
                </div>
              )}

              {/* Strimm.com Rebranded: NEWS CRAWL TICKER (Running Bottom Bar) */}
              {isTickerEnabled && (
                <div className={`absolute bottom-0 inset-x-0 z-20 overflow-hidden flex items-center ${
                  isBreakingNewsBanner ? 'bg-rose-950/90 border-t border-rose-500' : 'bg-slate-950/90 border-t border-slate-800'
                }`}>
                  <div className={`px-3 py-1 font-mono text-[10px] uppercase font-bold shrink-0 flex items-center gap-1 ${
                    isBreakingNewsBanner ? 'bg-rose-600 text-white' : 'bg-sky-600 text-white'
                  }`}>
                    {isBreakingNewsBanner ? <Flame className="w-3 h-3 animate-pulse" /> : <AntennaIcon className="w-3 h-3" />}
                    <span>{isBreakingNewsBanner ? 'BREAKING NEWS' : 'NEWS CRAWL'}</span>
                  </div>
                  <div className="marquee-container overflow-hidden whitespace-nowrap py-1 px-3 text-[11px] font-mono text-slate-200">
                    <span className="inline-block animate-marquee">
                      {newsTickerText} · FCC Facility ID: {activeChannel.fccFacilityId} · Rule Part: {activeChannel.fccRulePart} · Frequency: {activeChannel.carrierFrequency} · Licensed to Richard Alan Witt (www.wittlawfirm.com) · Dedicated UnrealIRCd Channel: {activeChannel.unrealIrcChannel} · All stream rights reserved DrFun1 ECOM Inc.
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Transport Controls & Telemetry Bar */}
            <div className="bg-slate-950 border-t border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
              
              {/* Play/Pause & Volume */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 transition-colors"
                  title={isPlaying ? 'Pause Station' : 'Resume Station'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-1.5">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                  <span className="text-[10px] font-mono text-slate-400 w-6">
                    {isMuted ? '0%' : `${volume}%`}
                  </span>
                </div>
              </div>

              {/* Real-time Technical Telemetry */}
              <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-slate-400">
                <span>{activeChannel.resolution}</span>
                <span className="text-slate-700">·</span>
                <span className="text-emerald-400">{activeChannel.bitrate}</span>
                <span className="text-slate-700">·</span>
                <span>{activeChannel.audioCodec}</span>
                <span className="text-slate-700">·</span>
                <span className="text-sky-400">{activeChannel.frequencyBand}</span>
              </div>

              {/* Trigger SCTE-35 Commercial Ad Insertion Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerScte35}
                  disabled={scte35AdBreakActive}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
                    scte35AdBreakActive 
                      ? 'bg-amber-950/80 border border-amber-600/60 text-amber-400 cursor-not-allowed'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                  }`}
                  title="Inject SCTE-35 Digital Commercial Splice"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{scte35AdBreakActive ? `SCTE-35 Break (${scte35Countdown}s)` : 'Inject SCTE-35 Ad'}</span>
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT 4 COLS: DOCKED 1-TO-1 MULTISTREAM IRC CHAT ROOM */}
          <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
            
            {/* IRC Room Header */}
            <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>1:1 Station IRC Room</span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {activeChannel.unrealIrcChannel}
                    </span>
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400">
                    Auto-synced with tuned TV channel & UnrealIRCd mesh
                  </p>
                </div>
              </div>

              {onOpenIrc && (
                <button
                  onClick={onOpenIrc}
                  className="text-[10px] text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1"
                >
                  <span>Full IRC Client</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Embedded Multistream IRC Chat Room connected to tuned station channel */}
            <div className="flex-1 overflow-hidden">
              <MultistreamIrcChatRoom
                variant="docked"
                defaultChannel={activeChannel.unrealIrcChannel}
                activeRank={activeRank}
                onOpenAdminPanel={onOpenIrcdAdmin}
                onOpenIrcClient={onOpenIrc}
                className="h-full border-0 rounded-none"
              />
            </div>

          </div>

        </div>

        {/* ROW 2: ALL-IN-ONE STUDIO TOOLS SUITE (STRIMM / RESTREAM / TVU / CABLECAST / CADJIN / EPG) */}
        <section id="studio-tools-section" className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          
          {/* Navigation Bar for Studio Tools */}
          <div className="bg-slate-950/95 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1">
              
              {/* Tool 1: Strimm.com (Rebranded DrFun1TV) */}
              <button
                onClick={() => setActiveStudioTool('strimm_drfun1tv')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeStudioTool === 'strimm_drfun1tv'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>DrFun1TV (Strimm Playout)</span>
              </button>

              {/* Tool 2: Master EPG & FCC.gov Station Guide */}
              <button
                onClick={() => setActiveStudioTool('epg_guide')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeStudioTool === 'epg_guide'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Master EPG & FCC Stations</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-300">
                  {channels.length}
                </span>
              </button>

              {/* Tool 3: Restream.io Multistream Playout */}
              <button
                onClick={() => setActiveStudioTool('restream_multistream')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeStudioTool === 'restream_multistream'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Restream.io Multi-Destination</span>
              </button>

              {/* Tool 4: dev.twitch.tv Portal */}
              <button
                onClick={() => setActiveStudioTool('dev_twitch')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeStudioTool === 'dev_twitch'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-purple-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span>dev.twitch.tv Portal</span>
              </button>

              {/* Tool 5: dev.kick.com Portal */}
              <button
                onClick={() => setActiveStudioTool('dev_kick')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeStudioTool === 'dev_kick'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-emerald-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>dev.kick.com Portal</span>
              </button>

              {/* Tool 6: TVU Networks Grid & Producer */}
              <button
                onClick={() => setActiveStudioTool('tvu_networks')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeStudioTool === 'tvu_networks'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>TVU Networks Grid</span>
              </button>

              {/* Tool 7: Cablecast PEG Community Playout */}
              <button
                onClick={() => setActiveStudioTool('cablecast_peg')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeStudioTool === 'cablecast_peg'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Cablecast PEG & EAS</span>
              </button>

              {/* Tool 8: Cadjin Master Control Switcher */}
              <button
                onClick={() => setActiveStudioTool('cadjin_master_control')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeStudioTool === 'cadjin_master_control'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Cadjin Master Control</span>
              </button>

              {/* Tool 9: Forums & Discussion */}
              <button
                onClick={() => setActiveStudioTool('forums')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeStudioTool === 'forums'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Forums &amp; Code</span>
              </button>

              {/* Tool 10: FAQ Knowledge Base & Platform Guide */}
              <button
                onClick={() => setActiveStudioTool('faq')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeStudioTool === 'faq'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>Studio FAQ &amp; Guide</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800/60">
                  All in One
                </span>
              </button>

            </div>

            {/* Quick Button to Launch Channel Wizard */}
            <button
              onClick={() => {
                setCreateStep(1);
                setIsCreateChannelModalOpen(true);
              }}
              className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-mono font-medium transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3 h-3" />
              <span>New Station Wizard</span>
            </button>
          </div>

          {/* TOOL 1: STRIMM.COM REBRANDED AS DRFUN1TV CONTROLS */}
          {activeStudioTool === 'strimm_drfun1tv' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>DrFun1TV Playout Sequencer & Channel Control</span>
                    <span className="text-xs font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                      Strimm.com Linear Playout Engine
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Control TV station rundown schedules, video sequencing, on-screen logo bugs, lower thirds, and live news crawl banners.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-slate-400">Current Station:</span>
                  <span className="font-bold text-white text-xs bg-slate-800 px-2.5 py-1 rounded">
                    {activeChannel.callSign} ({activeChannel.name})
                  </span>
                  <button
                    onClick={() => setIsScannerModalOpen(true)}
                    className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded text-xs font-mono transition-colors flex items-center gap-1.5"
                    title="Scan Cable & Satellite feeds owned by DrFun1 ECOM Inc."
                  >
                    <AntennaIcon className="w-3 h-3 text-sky-400" />
                    <span>Scan Cable/Sat Ingest</span>
                  </button>
                </div>
              </div>

              {/* Strimm.com Configuration Matrix: Logo Bug, News Ticker, Lower Thirds */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Panel A: On-Screen Logo Bug / Watermark */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>On-Screen Logo Bug</span>
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isLogoBugEnabled}
                        onChange={(e) => setIsLogoBugEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Corner Position</label>
                      <select
                        value={logoBugPosition}
                        onChange={(e) => setLogoBugPosition(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                      >
                        <option value="top-right">Top Right Corner</option>
                        <option value="top-left">Top Left Corner</option>
                        <option value="bottom-right">Bottom Right Corner</option>
                        <option value="bottom-left">Bottom Left Corner</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Watermark Opacity</span>
                        <span className="font-mono text-sky-400">{logoBugOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={100}
                        value={logoBugOpacity}
                        onChange={(e) => setLogoBugOpacity(Number(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Panel B: News Crawl Ticker */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <AntennaIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Live News Crawl Ticker</span>
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isTickerEnabled}
                        onChange={(e) => setIsTickerEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Crawl Text Message</label>
                      <input
                        type="text"
                        value={newsTickerText}
                        onChange={(e) => setNewsTickerText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">Emergency Red Flash</span>
                      <button
                        onClick={() => setIsBreakingNewsBanner(!isBreakingNewsBanner)}
                        className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                          isBreakingNewsBanner ? 'bg-rose-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isBreakingNewsBanner ? 'BREAKING ACTIVE' : 'STANDARD'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Panel C: Lower-Thirds & SCTE-35 Break */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Lower Thirds & Ad Splice</span>
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showLowerThirds}
                        onChange={(e) => setShowLowerThirds(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Current Program Block</div>
                      <div className="font-semibold text-slate-200 truncate mt-0.5">{activeChannel.currentProgram}</div>
                      <div className="text-[11px] text-emerald-400 mt-0.5 font-mono">{activeChannel.currentHost}</div>
                    </div>

                    <button
                      onClick={handleTriggerScte35}
                      disabled={scte35AdBreakActive}
                      className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{scte35AdBreakActive ? `Ad Break Running (${scte35Countdown}s)` : 'Insert 15s SCTE-35 Commercial'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Linear Playout Rundown Schedule Timeline */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>Linear Broadcast Rundown Timeline (Strimm.com Sequencer)</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Auto-Loop Sequencer: ACTIVE · Timezone: EST / UTC
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-sky-950/60 border border-sky-500/40 relative">
                    <span className="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold">
                      ON AIR
                    </span>
                    <span className="text-[10px] font-mono text-sky-400">14:00 - 15:30 EST</span>
                    <h5 className="font-bold text-white text-xs mt-1 truncate">{activeChannel.currentProgram}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{activeChannel.currentHost}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400">15:30 - 16:30 EST</span>
                    <h5 className="font-bold text-slate-200 text-xs mt-1 truncate">{activeChannel.upNextProgram}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">DrFun1 NOC Broadcast Crew</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400">16:30 - 18:00 EST</span>
                    <h5 className="font-bold text-slate-200 text-xs mt-1 truncate">Inter-Network IRC & DJ Hour</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">DJ OrbitNova & Richard Witt</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400">18:00 - 20:00 EST</span>
                    <h5 className="font-bold text-slate-200 text-xs mt-1 truncate">Commercial Teleport Showcase</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Switch SUPERNAP Earth Station</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TOOL 2: MASTER EPG & FCC.GOV STATIONS GUIDE */}
          {activeStudioTool === 'epg_guide' && (
            <div className="p-6 space-y-6">
              
              {/* EPG Header & Search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>FCC.gov Master EPG & Station Matrix</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      FRN: 0034981290
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete FCC-registered TV stations from DrFun1 ECOM, Paramount, Disney, WBD, Comcast, Dish, and SATCOM channels with 1-to-1 IRC sync.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={epgSearch}
                    onChange={(e) => setEpgSearch(e.target.value)}
                    placeholder="Search station, call sign, host..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* DrFun1 ECOM Cable & Satellite Transponder Scan Banner */}
              <div className="bg-gradient-to-r from-sky-950/70 via-indigo-950/60 to-emerald-950/70 border border-sky-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    <AntennaIcon className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>RF Spectrum & Transponder Demodulator</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        22+ STATIONS SCANNABLE
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Scan all Cable & Satellite stations owned by DrFun1 ECOM Inc. across Ka, Ku, C, X, S, Optical Laser (1550nm), and QAM-256 cable headends with 1:1 dedicated UnrealIRCd channels.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEpgGroupFilter('DrFun1 Scanned Cable/Satellite')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono font-medium transition-colors"
                  >
                    View Scanned ({channels.filter(c => c.isScannedStation).length})
                  </button>
                  <button
                    onClick={() => setIsScannerModalOpen(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Scan Cable/Sat Stations</span>
                  </button>
                </div>
              </div>

              {/* Group Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {(['All', 'DrFun1 ECOM (FCC Licensed)', 'DrFun1 Scanned Cable/Satellite', 'Paramount Global', 'The Walt Disney Company', 'Warner Bros. Discovery', 'Comcast / Xfinity', 'Dish Network', 'SATCOM Satellite Feeds', 'Custom User Channels'] as const).map((grp) => (
                  <button
                    key={grp}
                    onClick={() => setEpgGroupFilter(grp)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap text-xs ${
                      epgGroupFilter === grp
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>

              {/* Stations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEpgChannels.map((ch) => {
                  const isCurrent = ch.id === selectedChannelId;
                  return (
                    <div
                      key={ch.id}
                      className={`rounded-xl p-4 transition-all border flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-slate-900 border-sky-500/80 shadow-lg shadow-sky-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Header: Call sign, Channel number, Status */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-sm text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/70">
                              CH {ch.channelNumber}
                            </span>
                            <span className="font-mono text-xs font-bold text-white">
                              {ch.callSign}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {ch.isScannedStation && (
                              <span className="text-[9px] font-mono font-bold text-sky-300 bg-sky-950/80 border border-sky-700/80 px-1.5 py-0.5 rounded">
                                {ch.scannedBand || 'CABLE/SAT'}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                              {ch.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Station Name & Owner */}
                        <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                          {ch.name}
                        </h4>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Owner: <strong className="text-slate-300">{ch.networkOwner}</strong>
                        </div>

                        {/* Technical Parameters */}
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                          <div>
                            <span className="text-slate-500 block text-[10px]">FCC FACILITY ID</span>
                            <span className="text-slate-200">{ch.fccFacilityId}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">RESOLUTION</span>
                            <span className="text-emerald-400">{ch.resolution}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">FREQ / TRANSPONDER</span>
                            <span className="text-slate-300 truncate block">{ch.frequencyBand}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">BITRATE</span>
                            <span className="text-sky-300">{ch.bitrate}</span>
                          </div>
                          {ch.transponderSignalDbm && (
                            <div>
                              <span className="text-slate-500 block text-[10px]">RF SIGNAL</span>
                              <span className="text-emerald-400">{ch.transponderSignalDbm} dBm</span>
                            </div>
                          )}
                          {ch.snrDb && (
                            <div>
                              <span className="text-slate-500 block text-[10px]">SNR LOCK</span>
                              <span className="text-sky-400">+{ch.snrDb} dB SNR</span>
                            </div>
                          )}
                        </div>

                        {/* Current Show */}
                        <div className="mt-3 p-2 rounded bg-slate-900/90 border border-slate-800 text-xs">
                          <div className="text-[10px] font-mono text-sky-400 uppercase">Now Playing</div>
                          <div className="font-semibold text-slate-200 truncate mt-0.5">{ch.currentProgram}</div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">{ch.currentHost}</div>
                        </div>

                        {/* Dedicated 1-to-1 IRC Channel Tag */}
                        <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-500">1:1 IRC Room:</span>
                          <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                            {ch.unrealIrcChannel}
                          </span>
                        </div>
                      </div>

                      {/* Tune Station Action */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        {isCurrent ? (
                          <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5 py-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>CURRENTLY TUNED</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTuneStation(ch)}
                            className="w-full py-1.5 px-3 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Tune Station & Sync IRC</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TOOL 3: RESTREAM.IO MULTISTREAM ENGINE */}
          {activeStudioTool === 'restream_multistream' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Restream.io Multi-Destination Broadcasting Engine</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      LIVE UPLINK ACTIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Push DrFun1TV directly to multiple simultaneous RTMP and SRT cloud endpoints with live telemetry.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono text-slate-400">
                    Active Destinations: <strong className="text-emerald-400">{Object.values(activeDestinations).filter(Boolean).length}</strong>
                  </div>
                  <button
                    onClick={() => setIsRestreamBroadcasting(!isRestreamBroadcasting)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                      isRestreamBroadcasting
                        ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isRestreamBroadcasting ? 'Stop Restream.io Uplink' : 'Start Restream.io Uplink'}
                  </button>
                </div>
              </div>

              {/* Live Telemetry Health Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">UPLINK BITRATE</span>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-1">14.85 Mbps</div>
                  <span className="text-[10px] font-mono text-slate-500">HEVC CBR Mode</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">FRAMERATE</span>
                  <div className="text-lg font-bold font-mono text-sky-400 mt-1">60.00 FPS</div>
                  <span className="text-[10px] font-mono text-slate-500">0.00% Dropped Frames</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">TELEPORT BACKHAUL</span>
                  <div className="text-lg font-bold font-mono text-slate-200 mt-1">Switch 100G</div>
                  <span className="text-[10px] font-mono text-emerald-400">Las Vegas SUPERNAP</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">TOTAL VIEWERS</span>
                  <div className="text-lg font-bold font-mono text-purple-400 mt-1">
                    {(activeChannel.viewers + 1280).toLocaleString()}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Across 7 Platforms</span>
                </div>
              </div>

              {/* Destinations Toggles Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Target Broadcast Destinations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(activeDestinations).map(([dest, enabled]) => (
                    <div
                      key={dest}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                          <span className="font-semibold text-slate-200">{dest}</span>
                        </div>
                        {dest === 'Twitch TV' && (
                          <button
                            onClick={() => setActiveStudioTool('dev_twitch')}
                            className="text-[10px] text-purple-400 hover:text-purple-300 hover:underline font-mono text-left mt-0.5"
                          >
                            Configure on dev.twitch.tv →
                          </button>
                        )}
                        {dest === 'Kick Streaming' && (
                          <button
                            onClick={() => setActiveStudioTool('dev_kick')}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline font-mono text-left mt-0.5"
                          >
                            Configure on dev.kick.com (95/5) →
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setActiveDestinations(prev => ({ ...prev, [dest]: !prev[dest] }))}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors shrink-0 ${
                          enabled 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {enabled ? 'CONNECTED' : 'DISCONNECTED'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TOOL 4: TVU NETWORKS (tvunetworks.com) IP GRID & MULTI-CAM */}
          {activeStudioTool === 'tvu_networks' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>TVU Networks (tvunetworks.com) Cloud Matrix</span>
                    <span className="text-xs font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                      TVU Grid + TVU Producer
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sub-second IP video distribution matrix, multi-camera cloud switcher, and cellular/satellite bonding.
                  </p>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400">Bonded Backpack:</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {tvuBondedCellular ? '4x 5G + Starlink LEO ACTIVE' : 'OFFLINE'}
                  </span>
                </div>
              </div>

              {/* TVU Producer Multi-Camera Switcher */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  TVU Producer Multi-Camera Live Bus
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['CAM 1', 'CAM 2', 'Switch Teleport', 'Satellite Downlink'] as const).map((cam) => {
                    const isLive = tvuActiveCamera === cam;
                    return (
                      <button
                        key={cam}
                        onClick={() => setTvuActiveCamera(cam)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isLive 
                            ? 'bg-rose-950/80 border-rose-500/80 shadow-lg shadow-rose-500/20' 
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-mono">{cam}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            isLive ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isLive ? 'LIVE' : 'STANDBY'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-mono">
                          {cam === 'Switch Teleport' ? '100G Direct Laser Ring' :
                           cam === 'Satellite Downlink' ? 'Ka-Band Earth Station' : '1080p60 SDI-IP Feed'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TVU Grid Router Matrix */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  TVU Grid IP Video Routing Matrix
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Grid Input Source</label>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-sky-400 font-bold">
                      {tvuActiveCamera} (DrFun1 Master)
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Grid Route Destination</label>
                    <select
                      value={tvuGridRouteDestination}
                      onChange={(e) => setTvuGridRouteDestination(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                    >
                      <option value="Las Vegas Core Earth Station">Switch SUPERNAP Las Vegas Earth Station</option>
                      <option value="Paramount Global CBS Master Control">Paramount Global CBS Master Control</option>
                      <option value="Disney ABC Broadcast Hub">Disney ABC Broadcast Hub</option>
                      <option value="Warner Bros Discovery CNN Center">Warner Bros Discovery CNN Center</option>
                      <option value="Comcast NBCUniversal Teleport">Comcast NBCUniversal Teleport</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Grid Protocol & Latency</label>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-emerald-400">
                      TVU Inverse StatMux · 240 ms Ultra-Low
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TOOL 5: CABLECAST (cablecast.tv) PEG COMMUNITY AUTOMATION */}
          {activeStudioTool === 'cablecast_peg' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Cablecast (cablecast.tv) PEG Community Automation</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      Tightrope Media Systems
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Public, Education & Government (PEG) channel scheduling, community bulletin carousel, and EAS alert broadcast interrupt.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCablecastEasAlertTriggered(!cablecastEasAlertTriggered)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                      cablecastEasAlertTriggered 
                        ? 'bg-rose-600 text-white animate-pulse' 
                        : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    {cablecastEasAlertTriggered ? 'EAS ALERT CRAWL ACTIVE' : 'Test EAS Crawl Interrupt'}
                  </button>
                </div>
              </div>

              {/* Cablecast Carousel & Bulletin Board */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    Community Bulletin Board Carousel
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Municipal Bulletin Text</label>
                      <textarea
                        value={cablecastBulletinText}
                        onChange={(e) => setCablecastBulletinText(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                      <span>Slide Duration: 12 seconds</span>
                      <span className="text-emerald-400">Carousel Loop: ON</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    Automated VOD Archiving & Cloud Podcast
                  </h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-slate-300">
                      Auto-transcode to MP4 (1080p/720p/Audio-Only)
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-emerald-400">
                      Instant RSS / OTT Publisher to Apple Podcasts & Roku
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-sky-400">
                      Archive Storage: Switch SUPERNAP Object Storage Vault #09
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TOOL 6: CADJIN (cadjin.com) MASTER CONTROL ROOM SWITCHER */}
          {activeStudioTool === 'cadjin_master_control' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Cadjin (cadjin.com) Master Control Room Switcher</span>
                    <span className="text-xs font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                      PGM / PVW Bus + SCTE-35 Splicer
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Master broadcast control with Program/Preview busses, EBU R128 loudness metering, and SCTE-35 digital cue injector.
                  </p>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-slate-400">EBU R128 Loudness:</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {cadjinAudioLoudness} LUFS (Compliant)
                  </span>
                </div>
              </div>

              {/* Cadjin PGM & PVW Bus Switcher */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Program Bus (Red) */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 font-mono flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                      <span>PROGRAM (PGM) ON-AIR BUS</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">TRANSMITTING LIVE</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {['Live Broadcast Playout', 'Satellite Feed Ingest', 'TVU Producer Feed', 'Commercial Break Server'].map((src) => (
                      <button
                        key={src}
                        onClick={() => setCadjinPgmSource(src)}
                        className={`p-3 rounded-lg border text-left font-semibold transition-all ${
                          cadjinPgmSource === src
                            ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-md shadow-rose-500/20'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {src}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Bus (Green) */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>PREVIEW (PVW) BUS</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">READY FOR NEXT CUE</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {['Live Broadcast Playout', 'Satellite Feed Ingest', 'TVU Producer Feed', 'Commercial Break Server'].map((src) => (
                      <button
                        key={src}
                        onClick={() => setCadjinPvwSource(src)}
                        className={`p-3 rounded-lg border text-left font-semibold transition-all ${
                          cadjinPvwSource === src
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {src}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Master Control Transitions & Ad Trigger */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Transition Fader:</span>
                  {(['CUT', 'AUTO 1s', 'DISSOLVE'] as const).map((trans) => (
                    <button
                      key={trans}
                      onClick={() => {
                        setCadjinTransitionType(trans);
                        // Swap PGM and PVW
                        const temp = cadjinPgmSource;
                        setCadjinPgmSource(cadjinPvwSource);
                        setCadjinPvwSource(temp);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded border border-slate-700 transition-colors"
                    >
                      TAKE {trans}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTriggerScte35}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>SCTE-35 Splice Cue (15s Commercial Break)</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TOOL 7: DEV.TWITCH.TV DEVELOPER PORTAL */}
          {activeStudioTool === 'dev_twitch' && (
            <TwitchDevPortalPanel
              config={twitchConfig}
              onUpdateConfig={handleUpdateTwitchConfig}
              onTriggerAdBreak={handleTriggerScte35}
            />
          )}

          {/* TOOL 8: DEV.KICK.COM DEVELOPER PORTAL */}
          {activeStudioTool === 'dev_kick' && (
            <KickDevPortalPanel
              config={kickConfig}
              onUpdateConfig={handleUpdateKickConfig}
            />
          )}

          {/* TOOL 9: BROADCASTER & DEVELOPER FORUMS */}
          {activeStudioTool === 'forums' && (
            <BroadcasterForumsPanel
              threads={forumThreads}
              onAddThread={handleAddForumThread}
              onAddReply={handleAddForumReply}
              currentUser={userProfile}
            />
          )}

          {/* TOOL 10: BROADCASTER FAQ KNOWLEDGE BASE (BOTH FAQS IN SAME PAGE) */}
          {activeStudioTool === 'faq' && (
            <StudioFaqPanel
              faqItems={INITIAL_FAQ_ITEMS}
              onNavigateToTool={(toolId) => {
                setActiveStudioTool(toolId as any);
                const el = document.getElementById('studio-tools-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenScanner={() => setIsScannerModalOpen(true)}
              onOpenWizard={() => {
                setCreateStep(1);
                setIsCreateChannelModalOpen(true);
              }}
              onOpenLicense={onOpenLicense}
              onOpenSwitchWittServices={onOpenSwitchWittServices}
              onOpenIrc={onOpenIrc}
              onOpenStore={onOpenStore}
            />
          )}

        </section>

      </main>

      {/* ========================================================
          MODAL: "START YOUR OWN CHANNEL" 4-STEP WIZARD
          ======================================================== */}
      {isCreateChannelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-950/90 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Start Your Own Broadcast TV Channel</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Launch a linear channel with DrFun1TV, TVU, Cablecast, Cadjin, Restream.io & dedicated IRC room.
                </p>
              </div>
              <button
                onClick={() => setIsCreateChannelModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className={createStep === 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                1. Identity & FCC
              </span>
              <span className="text-slate-700">→</span>
              <span className={createStep === 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                2. Playout Engine
              </span>
              <span className="text-slate-700">→</span>
              <span className={createStep === 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                3. Branding & Ticker
              </span>
              <span className="text-slate-700">→</span>
              <span className={createStep === 4 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                4. Multi-Dest & IRC
              </span>
            </div>

            {/* Form Steps Container */}
            <form onSubmit={handleCreateChannelSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* STEP 1: IDENTITY & CALL SIGN */}
              {createStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Station / Channel Name</label>
                    <input
                      type="text"
                      required
                      value={channelDraft.name}
                      onChange={(e) => setChannelDraft({ ...channelDraft, name: e.target.value })}
                      placeholder="e.g. Galaxy Independent TV 4K"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">FCC Call Sign</label>
                      <input
                        type="text"
                        required
                        value={channelDraft.callSign}
                        onChange={(e) => setChannelDraft({ ...channelDraft, callSign: e.target.value.toUpperCase() })}
                        placeholder="e.g. WXYZ-TV"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-sky-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                      <select
                        value={channelDraft.category}
                        onChange={(e) => setChannelDraft({ ...channelDraft, category: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                      >
                        <option value="Community PEG">Community PEG</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="News">News</option>
                        <option value="Science & Space">Science & Space</option>
                        <option value="Sports">Sports</option>
                        <option value="Music & Radio">Music & Radio</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Initial Program Name</label>
                      <input
                        type="text"
                        value={channelDraft.initialProgramName}
                        onChange={(e) => setChannelDraft({ ...channelDraft, initialProgramName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Initial Host Name</label>
                      <input
                        type="text"
                        value={channelDraft.initialHost}
                        onChange={(e) => setChannelDraft({ ...channelDraft, initialHost: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PLAYOUT ENGINE & TECH SPEC */}
              {createStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Select Playout Engine</label>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[
                        { id: 'strimm_drfun1tv', name: 'DrFun1TV (Strimm Playout)', desc: 'Linear timeline & rundown sequencer' },
                        { id: 'tvu_networks', name: 'TVU Networks Grid', desc: 'IP routing & bonded multi-camera' },
                        { id: 'cablecast_peg', name: 'Cablecast PEG', desc: 'Community carousel & EAS interrupt' },
                        { id: 'cadjin_master_control', name: 'Cadjin Master Control', desc: 'Program/Preview bus with SCTE-35' },
                      ].map((eng) => (
                        <div
                          key={eng.id}
                          onClick={() => setChannelDraft({ ...channelDraft, playoutEngine: eng.id as any })}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            channelDraft.playoutEngine === eng.id
                              ? 'bg-sky-950 border-sky-500 text-sky-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-white text-xs">{eng.name}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{eng.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Resolution</label>
                      <select
                        value={channelDraft.resolution}
                        onChange={(e) => setChannelDraft({ ...channelDraft, resolution: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                      >
                        <option value="4K UHD (2160p60) HDR">4K UHD (2160p60) HDR</option>
                        <option value="1080p60 Full HD">1080p60 Full HD</option>
                        <option value="720p60 HD">720p60 HD</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Bitrate</label>
                      <select
                        value={channelDraft.bitrate}
                        onChange={(e) => setChannelDraft({ ...channelDraft, bitrate: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                      >
                        <option value="15.5 Mbps HEVC">15.5 Mbps HEVC</option>
                        <option value="8.5 Mbps H.264">8.5 Mbps H.264</option>
                        <option value="4.5 Mbps H.264">4.5 Mbps H.264</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BRANDING & TICKER */}
              {createStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">On-Screen Logo Bug Watermark Text</label>
                    <input
                      type="text"
                      value={channelDraft.logoBugText}
                      onChange={(e) => setChannelDraft({ ...channelDraft, logoBugText: e.target.value })}
                      placeholder="e.g. WXYZ 4K LIVE"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">News Crawl Ticker Message</label>
                    <textarea
                      value={channelDraft.newsTickerCrawl}
                      onChange={(e) => setChannelDraft({ ...channelDraft, newsTickerCrawl: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">SCTE-35 Ad Interval (Minutes)</label>
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={channelDraft.scte35AdIntervalMinutes}
                      onChange={(e) => setChannelDraft({ ...channelDraft, scte35AdIntervalMinutes: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: RESTREAM.IO DESTINATIONS & DEDICATED IRC */}
              {createStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Dedicated 1-to-1 UnrealIRCd Channel Name
                    </label>
                    <input
                      type="text"
                      required
                      value={channelDraft.unrealIrcChannel}
                      onChange={(e) => setChannelDraft({ ...channelDraft, unrealIrcChannel: e.target.value })}
                      placeholder="#wxyz-tv"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-bold"
                    />
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      Auto-provisioned on irc.drfun1.com:6697 with Switch SUPERNAP Colocation.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Restream.io Multi-Destination Targets
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {['YouTube Live', 'Twitch', 'Facebook Live', 'X / Twitter', 'Kick', 'Rumble'].map((dest) => {
                        const isSelected = channelDraft.restreamDestinations.includes(dest);
                        return (
                          <div
                            key={dest}
                            onClick={() => {
                              const current = channelDraft.restreamDestinations;
                              const next = isSelected ? current.filter(d => d !== dest) : [...current, dest];
                              setChannelDraft({ ...channelDraft, restreamDestinations: next });
                            }}
                            className={`p-2.5 rounded-lg border cursor-pointer font-mono flex items-center justify-between ${
                              isSelected
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span>{dest}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                        );
                      })}
                    </div>
                    {channelDraft.restreamDestinations.includes('Twitch') && (
                      <span className="text-[10px] text-purple-400 block font-mono pt-1">
                        ✓ dev.twitch.tv Helix API, EventSub WebSockets &amp; Chatbot active for this station
                      </span>
                    )}
                    {channelDraft.restreamDestinations.includes('Kick') && (
                      <span className="text-[10px] text-emerald-400 block font-mono pt-0.5">
                        ✓ dev.kick.com Kick API v2, Pusher WebSocket &amp; 95/5 Creator Split active for this station
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Witt Law Firm Master License Certified</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Station created under DrFun1 ECOM Inc. global compliance charter. All broadcast and rebrand rights certified via www.wittlawfirm.com for Richard Alan Witt.
                    </p>
                  </div>
                </div>
              )}

              {/* Wizard Nav Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                {createStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCreateStep(prev => prev - 1)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                  >
                    Back
                  </button>
                ) : <div></div>}

                {createStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setCreateStep(prev => prev + 1)}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Launch TV Channel & Tune</span>
                  </button>
                )}
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: USER PROFILE & DEVELOPER CREDENTIALS
          ======================================================== */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onSaveProfile={handleSaveUserProfile}
      />

      {/* ========================================================
          MODAL: RF CABLE & SATELLITE TRANSPONDER SCANNER
          ======================================================== */}
      <CableSatelliteScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        existingChannelIds={channels.map(c => c.id)}
        onAddScannedStations={handleAddScannedStations}
        onTuneStation={handleTuneStation}
      />

      {/* ========================================================
          MODAL: PLATFORM FAQ & TWITCH/KICK INTEGRATION GUIDE
          ======================================================== */}
      <StudioFaqModal
        isOpen={isFaqModalOpen}
        onClose={() => setIsFaqModalOpen(false)}
        faqItems={INITIAL_FAQ_ITEMS}
        onNavigateToTool={(toolId) => setActiveStudioTool(toolId as any)}
        onOpenScanner={() => setIsScannerModalOpen(true)}
        onOpenWizard={() => {
          setCreateStep(1);
          setIsCreateChannelModalOpen(true);
        }}
      />

      {/* ========================================================
          GLOBAL FOOTER ACCREDITATION
          ======================================================== */}
      <footer className="mt-8 border-t border-slate-800/80 bg-slate-950/90 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified by www.wittlawfirm.com</span>
            </span>
            <span className="text-slate-600">·</span>
            <span>Licensed to Richard Alan Witt</span>
            <span className="text-slate-600">·</span>
            <span>livewithdrfun1@gmail.com</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
            <span>Strimm.com Code Rebranded DrFun1TV</span>
            <span className="text-slate-700">·</span>
            <span>Switch SUPERNAP Earth Station NOC</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
