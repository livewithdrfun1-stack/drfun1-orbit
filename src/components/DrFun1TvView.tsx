/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * DrFun1-TV (tv.youtube.com Clone & Rebrand)
 * Features:
 * - Authentic Home, Live EPG Guide, Multiview (up to 4 streams), and Unlimited Cloud DVR Library
 * - Custom Channel Guide Ordering & Channel Visibility Controls (persisted in localStorage)
 * - Key Plays Timeline Jumpers, Spoiler Shield (Hide Sports Scores), Zen 4K Mode, Live Captions & Stats for Nerds
 * - Powered by Switch SUPERNAP 100G (500 nodes/hub) & 10 Dedicated RisingNet Optical Servers
 * - Regulatory Compliance: The Law Office of Richard A. Witt LLC (www.wittlawfirm.com) | FCC FRN: 0034981290
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Captions,
  Check,
  ChevronRight,
  Cloud,
  Eye,
  EyeOff,
  Flame,
  Home,
  LayoutGrid,
  Maximize2,
  Pause,
  Play,
  Plus,
  Radio,
  RotateCcw,
  RotateCw,
  Satellite,
  Search,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  Trash2,
  Trophy,
  Tv,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import {
  DRFUN1_TV_CHANNELS,
  DRFUN1_TV_KEY_PLAYS,
  DRFUN1_TV_MULTIVIEW_PRESETS,
  INITIAL_DRFUN1_TV_LIBRARY,
} from '../data/drfun1TvData';
import {
  DrFun1TvCategory,
  DrFun1TvChannel,
  DrFun1TvKeyPlay,
  DrFun1TvLibraryFilter,
  DrFun1TvLibraryItem,
} from '../types/drfun1Tv';

interface DrFun1TvViewProps {
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onNavigateToIrc?: () => void;
  onNavigateToRed5?: () => void;
}

type DrFun1TvSection = 'home' | 'live' | 'library' | 'multiview' | 'plans';
type GuideSortMode = 'default' | 'alphabetical' | '4k_first' | 'custom';

const STORAGE_KEY_LIBRARY = 'drfun1_tv_dvr_library_v1';
const STORAGE_KEY_CHANNEL_ORDER = 'drfun1_tv_custom_channel_order_v1';
const STORAGE_KEY_HIDDEN_CHANNELS = 'drfun1_tv_hidden_channels_v1';

const LIVE_CAPTIONS_BY_CATEGORY: Record<string, string[]> = {
  Sports: [
    '[ANNOUNCER] What a sequence under the lights on the 4K Plus optical feed!',
    '[STATCAST TELEMETRY] Delivered over Switch SUPERNAP 100G with sub-2ms RisingNet jitter.',
  ],
  'News & Court': [
    '[COURT MARSHAL] Counsel may proceed on Docket #26-0881 regarding interstate carrier relays.',
    '[WITNESS DESK] Transcript archived verbatim via www.wittlawfirm.com compliance bridge.',
  ],
  'Science & Satcom': [
    '[FLIGHT CONTROL] Ka-band optical downlink locked onto Goldstone Deep Space Complex.',
    '[TELEMETRY] Orbital altitude 408.2 km · Downlink bitrate 26.2 Mbps AV1 4K60.',
  ],
  Locals: [
    '[STUDIO A] Welcome back to DrFun1-TV Local 4K — keeping all local broadcasts crystal clear.',
    '[NETWORK SYNC] Redundant RisingNet R01-R10 ingest confirmed active.',
  ],
  Entertainment: [
    '[CINEMA AUDIO] Spatial 5.1 surround mix active on DrFun1-TV Theater.',
    '[HOST] Stay tuned after the break for exclusive live audience Q&A.',
  ],
};

export const DrFun1TvView: React.FC<DrFun1TvViewProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onNavigateToIrc,
  onNavigateToRed5,
}) => {
  const [section, setSection] = useState<DrFun1TvSection>('home');
  const [selectedChannel, setSelectedChannel] = useState<DrFun1TvChannel>(DRFUN1_TV_CHANNELS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [quality, setQuality] = useState<'2160p60 4K HDR' | '1080p60 HD' | '720p60'>('2160p60 4K HDR');
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [showStatsForNerds, setShowStatsForNerds] = useState<boolean>(false);
  const [showKeyPlaysDrawer, setShowKeyPlaysDrawer] = useState<boolean>(true);
  const [hideScores, setHideScores] = useState<boolean>(false);
  const [playheadOffsetSec, setPlayheadOffsetSec] = useState<number>(0);
  const [activeKeyPlayId, setActiveKeyPlayId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveCategory, setLiveCategory] = useState<DrFun1TvCategory>('All');
  const [guideSortMode, setGuideSortMode] = useState<GuideSortMode>('default');
  const [isCustomizingGuide, setIsCustomizingGuide] = useState<boolean>(false);
  const [libraryFilter, setLibraryFilter] = useState<DrFun1TvLibraryFilter>('All');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [telemetryPulse, setTelemetryPulse] = useState<number>(0);

  // Multiview state (up to 4 simultaneous channels + audio focus index)
  const [activePresetId, setActivePresetId] = useState<string>(DRFUN1_TV_MULTIVIEW_PRESETS[0].id);
  const [multiviewChannelIds, setMultiviewChannelIds] = useState<string[]>(
    DRFUN1_TV_MULTIVIEW_PRESETS[0].channelIds
  );
  const [multiviewAudioSlot, setMultiviewAudioSlot] = useState<number>(0);

  // Persisted Unlimited Cloud DVR Library
  const [libraryItems, setLibraryItems] = useState<DrFun1TvLibraryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LIBRARY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_DRFUN1_TV_LIBRARY;
  });

  // Persisted Custom Channel Ordering
  const [customChannelOrder, setCustomChannelOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHANNEL_ORDER);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DRFUN1_TV_CHANNELS.map((c) => c.id);
  });

  // Persisted Hidden Channel IDs
  const [hiddenChannelIds, setHiddenChannelIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HIDDEN_CHANNELS);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(libraryItems));
    } catch (_) {}
  }, [libraryItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHANNEL_ORDER, JSON.stringify(customChannelOrder));
    } catch (_) {}
  }, [customChannelOrder]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HIDDEN_CHANNELS, JSON.stringify(hiddenChannelIds));
    } catch (_) {}
  }, [hiddenChannelIds]);

  // Subtle live ticker for captions & telemetry stats
  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setTelemetryPulse((p) => p + 1);
    }, 2400);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showNotice = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
      toastTimerRef.current = null;
    }, 3200);
  };

  const libraryProgramIds = useMemo(
    () => new Set(libraryItems.map((i) => i.programId)),
    [libraryItems]
  );

  const handleToggleDvr = (channel: DrFun1TvChannel, slotIndex: 0 | 1 | 2 = 0) => {
    const slot = channel.epgSlots[slotIndex];
    if (libraryProgramIds.has(slot.id)) {
      setLibraryItems((prev) => prev.filter((item) => item.programId !== slot.id));
      showNotice(`Removed "${slot.title}" from DrFun1-TV Cloud DVR Library`);
      return;
    }

    const mappedCategory: DrFun1TvLibraryItem['category'] =
      slot.category === 'Sports'
        ? 'Sports'
        : slot.category === 'News & Court'
          ? 'News & Court'
          : slot.category === 'Entertainment' && slot.durationMin >= 140
            ? 'Movies'
            : 'Shows';

    const newItem: DrFun1TvLibraryItem = {
      id: `lib-${Date.now()}-${slot.id}`,
      programId: slot.id,
      title: slot.title,
      channelCallSign: channel.callSign,
      channelName: channel.name,
      category: mappedCategory,
      recordedAt: slot.isLive ? 'Recording Live · Unlimited Cloud DVR' : 'Scheduled · Auto-Record Enabled',
      retentionLabel: 'Kept for 9 months',
      durationLabel: `${Math.floor(slot.durationMin / 60)}h ${String(slot.durationMin % 60).padStart(2, '0')}m`,
      watchedPct: 0,
      isNew: true,
      isMostWatched: false,
      isScheduled: !slot.isLive,
      hasVodAlternative: true,
      description: slot.description,
      accentColor: channel.accentColor,
    };
    setLibraryItems((prev) => [newItem, ...prev]);
    showNotice(`Added "${slot.title}" to Unlimited Cloud DVR (9-month retention)`);
  };

  const handleTuneChannel = (channel: DrFun1TvChannel) => {
    setSelectedChannel(channel);
    setIsPlaying(true);
    setPlayheadOffsetSec(0);
    setActiveKeyPlayId(null);
    setQuality(channel.is4kPlus ? '2160p60 4K HDR' : '1080p60 HD');
  };

  const handleMoveChannel = (channelId: string, dir: -1 | 1) => {
    setGuideSortMode('custom');
    setCustomChannelOrder((prev) => {
      const idx = prev.indexOf(channelId);
      if (idx === -1) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      copy.splice(target, 0, moved);
      return copy;
    });
  };

  const handleToggleHideChannel = (channelId: string) => {
    setHiddenChannelIds((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId]
    );
  };

  // Ordered and filtered channels for Live EPG Guide
  const orderedChannels = useMemo(() => {
    const map = new Map(DRFUN1_TV_CHANNELS.map((c) => [c.id, c]));
    let list: DrFun1TvChannel[] = [];
    if (guideSortMode === 'custom') {
      list = customChannelOrder.map((id) => map.get(id)).filter((c): c is DrFun1TvChannel => Boolean(c));
      for (const ch of DRFUN1_TV_CHANNELS) {
        if (!list.some((x) => x.id === ch.id)) list.push(ch);
      }
    } else if (guideSortMode === 'alphabetical') {
      list = [...DRFUN1_TV_CHANNELS].sort((a, b) => a.callSign.localeCompare(b.callSign));
    } else if (guideSortMode === '4k_first') {
      list = [...DRFUN1_TV_CHANNELS].sort((a, b) => Number(b.is4kPlus) - Number(a.is4kPlus));
    } else {
      list = [...DRFUN1_TV_CHANNELS];
    }

    return list.filter((ch) => {
      if (!isCustomizingGuide && hiddenChannelIds.includes(ch.id)) return false;
      if (liveCategory !== 'All' && ch.category !== liveCategory) return false;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        ch.name.toLowerCase().includes(q) ||
        ch.callSign.toLowerCase().includes(q) ||
        ch.epgSlots.some((s) => s.title.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q))
      );
    });
  }, [guideSortMode, customChannelOrder, isCustomizingGuide, hiddenChannelIds, liveCategory, searchQuery]);

  const currentProgram = selectedChannel.epgSlots[0];
  const channelKeyPlays = useMemo(() => {
    const exact = DRFUN1_TV_KEY_PLAYS.filter((kp) => kp.channelId === selectedChannel.id);
    return exact.length > 0 ? exact : DRFUN1_TV_KEY_PLAYS.slice(0, 4);
  }, [selectedChannel.id]);

  const filteredLibrary = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return libraryItems.filter((item) => {
      if (libraryFilter === 'New in Library' && !item.isNew) return false;
      if (libraryFilter === 'Most Watched' && !item.isMostWatched) return false;
      if (libraryFilter === 'Scheduled' && !item.isScheduled) return false;
      if (
        (libraryFilter === 'Sports' ||
          libraryFilter === 'Shows' ||
          libraryFilter === 'News & Court' ||
          libraryFilter === 'Movies') &&
        item.category !== libraryFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.channelCallSign.toLowerCase().includes(q) ||
        item.channelName.toLowerCase().includes(q)
      );
    });
  }, [libraryItems, libraryFilter, searchQuery]);

  const currentCaptionLine = useMemo(() => {
    const lines = LIVE_CAPTIONS_BY_CATEGORY[selectedChannel.category] || LIVE_CAPTIONS_BY_CATEGORY.Locals;
    return lines[telemetryPulse % lines.length];
  }, [selectedChannel.category, telemetryPulse]);

  const multiviewChannels = useMemo(
    () =>
      multiviewChannelIds
        .map((id) => DRFUN1_TV_CHANNELS.find((c) => c.id === id))
        .filter((c): c is DrFun1TvChannel => Boolean(c)),
    [multiviewChannelIds]
  );

  const handleTriggerKeyPlay = (kp: DrFun1TvKeyPlay) => {
    const targetCh = DRFUN1_TV_CHANNELS.find((c) => c.id === kp.channelId);
    if (targetCh && targetCh.id !== selectedChannel.id) {
      setSelectedChannel(targetCh);
    }
    setActiveKeyPlayId(kp.id);
    setPlayheadOffsetSec(-45);
    setIsPlaying(true);
    showNotice(`Jumped to Key Play: ${kp.title} (${kp.timestamp})`);
  };

  return (
    <div className="space-y-6">
      {/* ================================================================
          1. DRFUN1-TV TOP APP BAR (youtube.tv / tv.youtube.com Clone Chrome)
          ================================================================ */}
      <div className="bg-gradient-to-r from-[#14080a] via-slate-950 to-slate-950 border border-red-900/50 rounded-2xl p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* DrFun1-TV Rebrand Wordmark */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 via-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-950/60 border border-red-400/40 shrink-0">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  DrFun1<span className="text-red-500">-TV</span>
                </h1>
                <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold uppercase whitespace-nowrap">
                  4K Plus · 100+ Live Channels
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase whitespace-nowrap">
                  Unlimited Cloud DVR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Live TV, Sports Key Plays, 4-Screen Multiview &amp; 9-Month Cloud DVR · Powered by Switch 100G &amp; RisingNet · Supervised by{' '}
                <a
                  href="https://www.wittlawfirm.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:underline font-semibold"
                >
                  www.wittlawfirm.com
                </a>
              </p>
            </div>
          </div>

          {/* Search & Global Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shows, teams, channels..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-full text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/60"
              />
            </div>

            <button
              type="button"
              onClick={() => setHideScores((v) => !v)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                hideScores
                  ? 'bg-amber-500/20 text-amber-200 border-amber-500/50'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
              title="YouTube TV Spoiler Shield — Hide live sports scores across Home & Guide"
            >
              {hideScores ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
              <span>{hideScores ? 'Scores Hidden' : 'Hide Scores'}</span>
            </button>

            {onNavigateToIrc && (
              <button
                type="button"
                onClick={onNavigateToIrc}
                className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                <span>#drfun1-tv IRC</span>
              </button>
            )}

            {onOpenLicense && (
              <button
                type="button"
                onClick={onOpenLicense}
                className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>FCC FRN 0034981290</span>
              </button>
            )}
          </div>
        </div>

        {/* Signature 3-Pillar + Multiview + Plans Navigation Strip */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            {(
              [
                { id: 'home', label: 'Home', icon: Home },
                { id: 'live', label: 'Live', icon: Radio },
                { id: 'library', label: `Library (${libraryItems.length})`, icon: Cloud },
                { id: 'multiview', label: 'Multiview (4-Box)', icon: LayoutGrid },
                { id: 'plans', label: '4K Plus & Base Plan', icon: Sparkles },
              ] as { id: DrFun1TvSection; label: string; icon: React.ComponentType<{ className?: string }> }[]
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = section === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSection(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400 shrink-0">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Switch 100G + RisingNet R01-R10
            </span>
          </div>
        </div>
      </div>

      {/* Transient DVR / Playback Toast */}
      {toastMsg && (
        <div className="bg-slate-900 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================================================================
          2. ACTIVE DRFUN1-TV THEATER PLAYER + KEY PLAYS & STATS FOR NERDS
          ================================================================ */}
      {section !== 'multiview' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Primary Video Theater */}
          <div className="xl:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative aspect-video bg-gradient-to-br from-slate-950 via-[#101828] to-[#1a0a10] p-5 sm:p-7 flex flex-col justify-between">
              {/* Background Orbital/Stadium Telemetry Grid */}
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 25% 25%, rgba(239,68,68,0.28), transparent 45%), radial-gradient(circle at 80% 70%, rgba(56,189,248,0.22), transparent 50%)',
                }}
              />

              {/* Top Overlay Chrome */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="px-2.5 py-1 rounded-md font-black text-xs text-slate-950 tracking-wide shadow"
                    style={{ backgroundColor: selectedChannel.accentColor }}
                  >
                    {selectedChannel.callSign}
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600 text-white text-[11px] font-mono font-bold">
                    <span className={`w-2 h-2 rounded-full bg-white ${isPlaying ? 'animate-pulse' : ''}`} />
                    <span>{playheadOffsetSec < 0 ? `DVR ${playheadOffsetSec}s` : 'LIVE'}</span>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-[11px] font-mono font-bold text-slate-200">
                    {quality}
                  </span>
                  {selectedChannel.isZenChannel && (
                    <span className="px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-300">
                      Moment of Zen
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleDvr(selectedChannel, 0)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                      libraryProgramIds.has(currentProgram.id)
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700'
                    }`}
                  >
                    {libraryProgramIds.has(currentProgram.id) ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>In Library</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Library</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowStatsForNerds((v) => !v)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border transition cursor-pointer ${
                      showStatsForNerds
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50'
                        : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    Stats for Nerds
                  </button>
                </div>
              </div>

              {/* Center Live Program Visual Stage */}
              <div className="relative z-10 my-auto py-4 flex flex-col items-center text-center space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                  CH {selectedChannel.channelNumber} · {selectedChannel.name} · {selectedChannel.ingestPop}
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-white max-w-2xl leading-tight">
                  {currentProgram.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  {currentProgram.subtitle} · {currentProgram.description}
                </p>

                {/* Live Score / Status Chip (respecting Hide Scores toggle!) */}
                {currentProgram.scoreSummary && (
                  <div className="mt-1 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-mono font-bold text-amber-300">
                    {hideScores ? 'SCORE HIDDEN (SPOILER SHIELD ACTIVE)' : currentProgram.scoreSummary}
                  </div>
                )}

                {activeKeyPlayId && (
                  <div className="px-3 py-1 rounded-lg bg-red-950/70 border border-red-500/40 text-[11px] font-mono text-red-200">
                    Key Play Replay Active · {channelKeyPlays.find((k) => k.id === activeKeyPlayId)?.title}
                  </div>
                )}
              </div>

              {/* Stats for Nerds Floating Panel */}
              {showStatsForNerds && (
                <div className="absolute top-16 right-5 z-20 w-72 bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-xl p-3 text-[11px] font-mono space-y-1 shadow-2xl">
                  <div className="flex items-center justify-between text-cyan-300 font-bold pb-1 border-b border-slate-800">
                    <span>Stats for Nerds (DrFun1-TV)</span>
                    <button
                      type="button"
                      onClick={() => setShowStatsForNerds(false)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Codec / Format:</span>
                    <span className="text-white">{selectedChannel.codec}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Connection Speed:</span>
                    <span className="text-emerald-400 tabular-nums">
                      {(selectedChannel.bitrateMbps * 4.2 + (telemetryPulse % 3) * 1.4).toFixed(1)} Mbps
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stream Bitrate:</span>
                    <span className="text-white tabular-nums">{selectedChannel.bitrateMbps} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Buffer Health:</span>
                    <span className="text-cyan-300 tabular-nums">18.4 s (0 Dropped)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Switch Ingest:</span>
                    <span className="text-purple-300 truncate max-w-[140px]">{selectedChannel.ingestPop}</span>
                  </div>
                </div>
              )}

              {/* Bottom Closed Captions + Player Controls */}
              <div className="relative z-10 space-y-3">
                {showCaptions && (
                  <div className="mx-auto max-w-xl bg-black/80 border border-slate-800 px-3.5 py-1.5 rounded-lg text-center text-xs font-mono text-white">
                    {currentCaptionLine}
                  </div>
                )}

                {/* Progress Scrubber Bar */}
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 transition-all"
                      style={{
                        width: `${Math.max(8, Math.min(100, selectedChannel.currentProgressPct + playheadOffsetSec / 5))}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{currentProgram.timeRange}</span>
                    <span>{currentProgram.rating} · Unlimited DVR Active</span>
                  </div>
                </div>

                {/* Controls Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsPlaying((p) => !p)}
                      className="p-2 rounded-full bg-white text-slate-950 hover:bg-slate-200 transition cursor-pointer"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlayheadOffsetSec((s) => Math.max(-900, s - 15))}
                      className="px-2.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>15s</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlayheadOffsetSec((s) => Math.min(0, s + 15))}
                      className="px-2.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <span>15s</span>
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    {playheadOffsetSec < 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPlayheadOffsetSec(0);
                          setActiveKeyPlayId(null);
                        }}
                        className="px-2.5 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white text-[11px] font-mono font-bold cursor-pointer"
                      >
                        Go Live
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsMuted((m) => !m)}
                      className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 cursor-pointer"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-white" />}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowCaptions((c) => !c)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border transition flex items-center gap-1 cursor-pointer ${
                        showCaptions
                          ? 'bg-white text-slate-950 border-white'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      <Captions className="w-3.5 h-3.5" />
                      <span>CC</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSection('multiview')}
                      className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Watch in Multiview</span>
                    </button>

                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value as typeof quality)}
                      className="px-2.5 py-1 rounded-full bg-slate-900 text-slate-200 border border-slate-800 text-[11px] font-mono cursor-pointer focus:outline-none"
                    >
                      <option value="2160p60 4K HDR">2160p60 4K HDR</option>
                      <option value="1080p60 HD">1080p60 HD</option>
                      <option value="720p60">720p60</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Companion Panel: Key Plays & Switch/RisingNet Carrier Feed */}
          <div className="xl:col-span-4 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white">Key Plays &amp; Live Highlights</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyPlaysDrawer((v) => !v)}
                className="text-[11px] font-mono text-slate-400 hover:text-white cursor-pointer"
              >
                {showKeyPlaysDrawer ? 'Collapse' : 'Expand'}
              </button>
            </div>

            {showKeyPlaysDrawer && (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {channelKeyPlays.map((kp) => {
                  const isActive = activeKeyPlayId === kp.id;
                  return (
                    <button
                      key={kp.id}
                      type="button"
                      onClick={() => handleTriggerKeyPlay(kp)}
                      className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                        isActive
                          ? 'bg-red-500/15 border-red-500/60'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-red-400 font-bold">{kp.quarterOrSegment}</span>
                        <span className="text-slate-400 tabular-nums">{kp.timestamp}</span>
                      </div>
                      <div className="text-xs font-bold text-white mt-1">{kp.title}</div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {hideScores ? 'Play details hidden while Spoiler Shield is active.' : kp.detail}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick Channel Switcher & Backbone Bridge */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                Quick Channel Tune
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DRFUN1_TV_CHANNELS.slice(0, 6).map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleTuneChannel(ch)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition cursor-pointer ${
                      selectedChannel.id === ch.id
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {ch.callSign}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {onOpenSwitchMesh && (
                  <button
                    type="button"
                    onClick={onOpenSwitchMesh}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>Switch 100G Mesh</span>
                  </button>
                )}
                {onNavigateToRed5 && (
                  <button
                    type="button"
                    onClick={onNavigateToRed5}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Red5 Simulcast</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          3A. HOME VIEW (Top Picks, Live Sports & News, Browse by Network)
          ================================================================ */}
      {section === 'home' && (
        <div className="space-y-6">
          {/* Top Picks For You */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" />
                <span>Top Picks for You on DrFun1-TV</span>
              </h3>
              <button
                type="button"
                onClick={() => setSection('live')}
                className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Live Guide</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DRFUN1_TV_CHANNELS.slice(0, 8).map((ch) => {
                const show = ch.epgSlots[0];
                const saved = libraryProgramIds.has(show.id);
                return (
                  <div
                    key={ch.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-red-500/50 rounded-xl p-4 flex flex-col justify-between gap-3 transition shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-black text-slate-950"
                          style={{ backgroundColor: ch.accentColor }}
                        >
                          {ch.callSign}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-red-600/20 text-red-300 border border-red-500/30 text-[10px] font-mono font-bold">
                          LIVE · {ch.badgeText}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                        {show.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{show.subtitle}</p>
                      {show.scoreSummary && !hideScores && (
                        <div className="text-[11px] font-mono font-bold text-amber-300">
                          {show.scoreSummary}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${ch.currentProgressPct}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTuneChannel(ch)}
                          className="flex-1 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Watch Live</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleDvr(ch, 0)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            saved
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                          }`}
                          title={saved ? 'Remove from Cloud DVR Library' : 'Add to Unlimited Cloud DVR'}
                        >
                          {saved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Browse by Network Strip */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-sky-400" />
              <span>Browse Live Networks ({DRFUN1_TV_CHANNELS.length} Featured · 100+ Total Channels)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {DRFUN1_TV_CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleTuneChannel(ch)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    selectedChannel.id === ch.id
                      ? 'bg-red-500/15 border-red-500/60'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-black text-slate-950"
                      style={{ backgroundColor: ch.accentColor }}
                    >
                      {ch.callSign}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">#{ch.channelNumber}</span>
                  </div>
                  <div className="text-xs font-semibold text-white truncate mt-2">{ch.name}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">{ch.category}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          3B. LIVE EPG GUIDE VIEW (Sort, Custom Reorder, Hide Channels, +DVR)
          ================================================================ */}
      {section === 'live' && (
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                ['All', 'Locals', 'Sports', 'News & Court', 'Entertainment', 'Science & Satcom'] as DrFun1TvCategory[]
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setLiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    liveCategory === cat
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <select
                  value={guideSortMode}
                  onChange={(e) => setGuideSortMode(e.target.value as GuideSortMode)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="default">Sort: Default Lineup</option>
                  <option value="4k_first">Sort: 4K Plus First</option>
                  <option value="alphabetical">Sort: A–Z</option>
                  <option value="custom">Sort: Custom Lineup</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomizingGuide((v) => !v)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                  isCustomizingGuide
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/50'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                }`}
              >
                {isCustomizingGuide ? 'Done Editing Guide' : 'Edit Custom Guide'}
              </button>
            </div>
          </div>

          {/* Time Header Row */}
          <div className="overflow-x-auto">
            <div className="min-w-[820px] space-y-2">
              <div className="grid grid-cols-12 gap-2 px-2 text-[11px] font-mono text-slate-400 uppercase">
                <div className="col-span-3">Channel</div>
                <div className="col-span-3 text-red-400 font-bold">On Now</div>
                <div className="col-span-3">Up Next (+60m)</div>
                <div className="col-span-3">Later</div>
              </div>

              {orderedChannels.map((ch) => {
                const isHidden = hiddenChannelIds.includes(ch.id);
                const isCurrent = selectedChannel.id === ch.id;
                return (
                  <div
                    key={ch.id}
                    className={`grid grid-cols-12 gap-2 items-stretch rounded-xl p-2 border transition ${
                      isHidden
                        ? 'opacity-45 bg-slate-950/40 border-slate-800/50'
                        : isCurrent
                          ? 'bg-red-950/20 border-red-500/50'
                          : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    {/* Channel Identification + Custom Reorder Controls */}
                    <div className="col-span-3 flex items-center justify-between gap-2 pr-2">
                      <button
                        type="button"
                        onClick={() => handleTuneChannel(ch)}
                        className="flex items-center gap-2.5 text-left min-w-0 cursor-pointer"
                      >
                        <div
                          className="w-12 h-9 rounded-lg flex items-center justify-center font-black text-[11px] text-slate-950 shrink-0"
                          style={{ backgroundColor: ch.accentColor }}
                        >
                          {ch.callSign}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{ch.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            CH {ch.channelNumber} · {ch.badgeText}
                          </div>
                        </div>
                      </button>

                      {isCustomizingGuide && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveChannel(ch.id, -1)}
                            className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveChannel(ch.id, 1)}
                            className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleHideChannel(ch.id)}
                            className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-300 cursor-pointer"
                            title={isHidden ? 'Show Channel' : 'Hide Channel'}
                          >
                            {isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 3 EPG Time Blocks */}
                    {ch.epgSlots.map((slot, slotIdx) => {
                      const inDvr = libraryProgramIds.has(slot.id);
                      return (
                        <div
                          key={slot.id}
                          className={`col-span-3 rounded-lg p-2.5 border flex flex-col justify-between gap-1.5 ${
                            slot.isLive
                              ? 'bg-slate-900/95 border-slate-700'
                              : 'bg-slate-900/50 border-slate-800/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleTuneChannel(ch)}
                              className="text-left min-w-0 cursor-pointer"
                            >
                              <div className="text-xs font-bold text-white truncate hover:text-red-300">
                                {slot.title}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                {slot.timeRange} · {slot.rating}
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleDvr(ch, slotIdx as 0 | 1 | 2)}
                              className={`p-1 rounded border shrink-0 transition cursor-pointer ${
                                inDvr
                                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                              }`}
                              title={inDvr ? 'Saved in Cloud DVR' : 'Add to Cloud DVR'}
                            >
                              {inDvr ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            </button>
                          </div>

                          {slot.isLive && (
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500"
                                style={{ width: `${ch.currentProgressPct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          3C. YOUTUBE TV MULTIVIEW (Up to 4 Simultaneous Screens)
          ================================================================ */}
      {section === 'multiview' && (
        <div className="space-y-4">
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-red-500" />
                <span>DrFun1-TV Split Multiview</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Watch up to 4 live feeds simultaneously over Switch 100G + RisingNet. Click any screen to switch active audio focus.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {DRFUN1_TV_MULTIVIEW_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setActivePresetId(preset.id);
                    setMultiviewChannelIds(preset.channelIds);
                    setMultiviewAudioSlot(0);
                    showNotice(`Loaded Multiview Preset: ${preset.label}`);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    activePresetId === preset.id
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`grid gap-4 ${
              multiviewChannels.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'
            }`}
          >
            {multiviewChannels.map((ch, idx) => {
              const hasAudio = multiviewAudioSlot === idx;
              const prog = ch.epgSlots[0];
              return (
                <div
                  key={`${ch.id}-${idx}`}
                  onClick={() => setMultiviewAudioSlot(idx)}
                  className={`relative rounded-2xl p-5 min-h-[250px] flex flex-col justify-between bg-gradient-to-br from-slate-950 via-[#0f172a] to-[#1a0a12] border-2 transition cursor-pointer shadow-xl ${
                    hasAudio ? 'border-red-500 ring-2 ring-red-500/30' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-black text-slate-950"
                        style={{ backgroundColor: ch.accentColor }}
                      >
                        {ch.callSign}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-red-600/80 text-white text-[10px] font-mono font-bold">
                        LIVE · {ch.codec}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={ch.id}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const next = [...multiviewChannelIds];
                          next[idx] = e.target.value;
                          setMultiviewChannelIds(next);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-200 cursor-pointer"
                      >
                        {DRFUN1_TV_CHANNELS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.callSign}
                          </option>
                        ))}
                      </select>

                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                          hasAudio
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-900 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {hasAudio ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                        <span>{hasAudio ? 'AUDIO' : 'MUTED'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="my-4 space-y-1.5">
                    <h4 className="text-lg font-black text-white">{prog.title}</h4>
                    <p className="text-xs text-slate-300">{prog.subtitle}</p>
                    {prog.scoreSummary && !hideScores && (
                      <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono font-bold text-amber-300">
                        {prog.scoreSummary}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{ch.ingestPop}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTuneChannel(ch);
                        setSection('home');
                      }}
                      className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Fullscreen</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================
          3D. UNLIMITED CLOUD DVR LIBRARY (9-Month Retention)
          ================================================================ */}
      {section === 'library' && (
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Unlimited Cloud DVR Library</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                No storage caps. Recorded shows, live sports, and Supreme Court dockets are retained for 9 months across Switch 100G storage.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300 whitespace-nowrap">
              {libraryItems.length} Saved · UNLIMITED DVR SPACE
            </span>
          </div>

          {/* Library Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                'All',
                'New in Library',
                'Most Watched',
                'Scheduled',
                'Sports',
                'Shows',
                'News & Court',
                'Movies',
              ] as DrFun1TvLibraryFilter[]
            ).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setLibraryFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  libraryFilter === f
                    ? 'bg-white text-slate-950'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredLibrary.length === 0 ? (
            <div className="p-10 text-center bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-400">
              No recordings match this filter yet. Click <strong className="text-white">+ Add to Library</strong> on any live broadcast or guide program.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLibrary.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-black text-slate-950"
                        style={{ backgroundColor: item.accentColor }}
                      >
                        {item.channelCallSign}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {item.retentionLabel}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">{item.title}</h4>
                    <div className="text-[11px] font-mono text-slate-400">
                      {item.recordedAt} · {item.durationLabel}
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Watched: {item.watchedPct}%</span>
                      <span>{item.hasVodAlternative ? 'DVR + VOD Versions' : 'DVR Recording'}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${Math.max(4, item.watchedPct)}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const target =
                            DRFUN1_TV_CHANNELS.find((c) => c.callSign === item.channelCallSign) ||
                            DRFUN1_TV_CHANNELS[0];
                          handleTuneChannel(target);
                          setSection('home');
                          showNotice(`Playing "${item.title}" from Cloud DVR`);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Recording</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLibraryItems((prev) => prev.filter((x) => x.id !== item.id));
                          showNotice(`Removed "${item.title}" from Cloud DVR`);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 cursor-pointer"
                        title="Remove from Library"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================
          3E. PLANS & ADD-ONS (Base Plan + 4K Plus + Red5 & Switch Mesh)
          ================================================================ */}
      {section === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900/95 border border-red-500/50 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-red-600/20 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold uppercase">
                ACTIVE BASE PLAN
              </span>
              <span className="text-lg font-black text-white font-mono">Included</span>
            </div>
            <h3 className="text-lg font-black text-white">DrFun1-TV Base Plan</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              100+ live channels across ABC, CBS, FOX, NBC, ESPN, SCOTUS-TV, NASA+, and DrFun1 Originals with zero annual contracts.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Unlimited Cloud DVR (9 months)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                3 Simultaneous Home + Mobile Streams
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                6 Household Accounts Included
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold uppercase">
                4K PLUS ADD-ON
              </span>
              <span className="text-lg font-black text-cyan-300 font-mono">Active</span>
            </div>
            <h3 className="text-lg font-black text-white">4K Plus &amp; Unlimited Streams</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Watch available live sports and NASA orbital feeds in 2160p60 AV1 4K HDR with unlimited simultaneous streams on your home Switch/RisingNet fiber network.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                4K HDR on NBC, FOX, ESPN, NASA+, DrFun1
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                Offline DVR Downloads on Mobile
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                Unlimited In-Home Streams
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase">
                CARRIER BACKBONE
              </span>
              <Satellite className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-lg font-black text-white">Switch 100G &amp; Legal Compliance</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Synchronized across 500 Switch SUPERNAP nodes/hub, 10 dedicated RisingNet servers, Red5.net WHIP/WHEP, and FCC FRN 0034981290 oversight.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {onOpenLicense && (
                <button
                  type="button"
                  onClick={onOpenLicense}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold cursor-pointer"
                >
                  wittlawfirm.com Cert
                </button>
              )}
              {onNavigateToRed5 && (
                <button
                  type="button"
                  onClick={onNavigateToRed5}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold cursor-pointer"
                >
                  Open Red5 Broadcast
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
