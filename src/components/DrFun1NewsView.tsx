/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * DrFun1 News — Global TV News Service & Dynamic Worldwide News Outlets Directory
 * Features:
 * - Dynamic searchable/filterable directory of 33+ global TV news outlets across 7 world regions
 * - Full CRUD customization: add custom global news outlets, toggle ON AIR / Breaking flags, bookmark favorites (localStorage)
 * - DrFun1 News Broadcast Theater & 4-Screen Global Anchor Multiview Quad
 * - Real-time scrolling Breaking News Chyron & Producer Flash Bulletin Publisher
 * - Switch SUPERNAP 100G & 10 RisingNet optical ingest paths under www.wittlawfirm.com (FCC FRN 0034981290) oversight
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Archive,
  Bookmark,
  CalendarClock,
  Captions,
  Check,
  Columns2,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  LayoutGrid,
  MonitorPlay,
  Newspaper,
  Pause,
  PictureInPicture2,
  Play,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Rss,
  Satellite,
  Search,
  Send,
  ShieldCheck,
  Terminal,
  Trash2,
  Tv,
  Volume2,
  VolumeX,
  WifiOff,
} from 'lucide-react';
import {
  EPG_AUTO_SYNC_INTERVAL_MS,
  fetchSyncedWorldNewsEpg,
  GLOBAL_NEWS_OUTLETS,
  INITIAL_DRFUN1_NEWS_BULLETINS,
  NEWS_STREAM_SOURCE_PROFILES,
  resolveOutletStreamSource,
} from '../data/drfun1NewsData';
import {
  AudioNormalizationConfig,
  AudioNormalizationPreset,
  AudioNormalizationTelemetry,
  DrFun1NewsBulletin,
  EpgSyncSnapshot,
  GlobalNewsOutlet,
  NewsOutletCategory,
  NewsOutletRegion,
  NewsStreamSourceType,
  RecordedStreamClip,
  SatelliteOrbitalAlert,
  StreamConnectionPhase,
  StreamQualityTier,
  StreamReconnectEvent,
  StrimmChannelConfig,
  WatchHistoryEntry,
} from '../types/drfun1News';
import { IrcLoginSession } from '../types/irc';
import { AnopeRankLevel } from '../types/ircdAdmin';
import {
  AUDIO_NORMALIZATION_PRESETS,
  computeNormalizationGainDb,
  DEFAULT_AUDIO_NORMALIZATION_CONFIG,
  getNativeSourceLoudnessDb,
  WebAudioNormalizationEngine,
} from '../utils/audioNormalizationEngine';
import {
  clearArchivedClipsStore,
  deleteArchivedClipsByIds,
  loadArchivedClips,
  saveArchivedClip,
  updateArchivedClipMeta,
} from '../utils/streamArchiveDb';
import {
  newsPipController,
  NewsPipSnapshot,
  PipActiveMode,
} from '../utils/newsPictureInPicture';
import {
  buildInitialSatelliteAlerts,
  pollNextRssForSatelliteAlert,
} from '../utils/satelliteAlertDetector';
import { DrFun1AudioNormalizerControl } from './DrFun1AudioNormalizerControl';
import { DrFun1BreakingNewsTicker } from './DrFun1BreakingNewsTicker';
import { DrFun1NewsWorldMap } from './DrFun1NewsWorldMap';
import { DrFun1NewsEpgSection } from './DrFun1NewsEpgSection';
import { DrFun1NewsSourceSwitcher } from './DrFun1NewsSourceSwitcher';
import { DrFun1NewsWatchHistorySidebar } from './DrFun1NewsWatchHistorySidebar';
import {
  DrFun1SatelliteAlertCenter,
  DrFun1SatelliteAlertOverlayBadges,
} from './DrFun1SatelliteAlertOverlay';
import { DrFun1StreamArchiveTab } from './DrFun1StreamArchiveTab';
import { DrFun1StrimmIntegrationTab } from './DrFun1StrimmIntegrationTab';
import { IrcOverlayOpacityMode, NewsVideoIrcOverlay } from './NewsVideoIrcOverlay';
import { NewsVideoQualitySelector } from './NewsVideoQualitySelector';
import { NewsVideoStreamRecorder } from './NewsVideoStreamRecorder';

interface DrFun1NewsViewProps {
  onOpenLicense?: () => void;
  onNavigateToIrc?: () => void;
  onNavigateToRss?: () => void;
  onNavigateToDrFun1Tv?: () => void;
  ircSession?: IrcLoginSession;
  activeRank?: AnopeRankLevel;
  onUpdateIrcSession?: (partial: Partial<IrcLoginSession>) => void;
  onOpenIrcLogin?: () => void;
}

type NewsViewMode = 'theater' | 'quad';
type NewsWorkspaceTab = 'live' | 'archive' | 'strimm';
type OutletSortMode = 'viewers' | 'alpha' | 'region' | 'breaking';

const STORAGE_KEY_CUSTOM_OUTLETS = 'drfun1_news_custom_outlets_v1';
const STORAGE_KEY_BOOKMARKED_OUTLETS = 'drfun1_news_bookmarked_outlets_v1';
const STORAGE_KEY_BULLETINS = 'drfun1_news_bulletins_v1';
const STORAGE_KEY_STREAM_SOURCE = 'drfun1_news_stream_source_v1';
const STORAGE_KEY_WATCH_HISTORY = 'drfun1_news_watch_history_v1';
const STORAGE_KEY_EPG_AUTOSYNC = 'drfun1_news_epg_autosync_v1';
const STORAGE_KEY_AUDIO_NORM = 'drfun1_news_audio_norm_v1';
const STORAGE_KEY_QUALITY_TIER = 'drfun1_news_quality_tier_v1';
const STORAGE_KEY_SAT_ALERTS_ENABLED = 'drfun1_news_sat_alerts_enabled_v1';
const MAX_WATCH_HISTORY = 5;

const REGIONS: ('All' | NewsOutletRegion)[] = [
  'All',
  'Global Wire',
  'North America',
  'Europe',
  'Middle East',
  'Asia-Pacific',
  'Latin America',
  'Africa',
];

const CATEGORIES: ('All' | NewsOutletCategory)[] = [
  'All',
  '24/7 Cable News',
  'Public Broadcaster',
  'Wire & Financial',
  'Judicial & Policy',
  'Science & Satcom',
];

export const DrFun1NewsView: React.FC<DrFun1NewsViewProps> = ({
  onOpenLicense,
  onNavigateToIrc,
  onNavigateToRss,
  onNavigateToDrFun1Tv,
  ircSession,
  activeRank = 'sra',
  onUpdateIrcSession,
  onOpenIrcLogin,
}) => {
  const [customOutlets, setCustomOutlets] = useState<GlobalNewsOutlet[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_OUTLETS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKED_OUTLETS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return ['news-drfun1-hq', 'news-bbc-world', 'news-scotus-cspan'];
  });

  const [bulletins, setBulletins] = useState<DrFun1NewsBulletin[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BULLETINS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_DRFUN1_NEWS_BULLETINS;
  });

  // Dynamic live telemetry states
  const [liveTick, setLiveTick] = useState<number>(1);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [isPlayerPlaying, setIsPlayerPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<NewsViewMode>('theater');
  const [activeNewsTab, setActiveNewsTab] = useState<NewsWorkspaceTab>('live');
  const [isStreamRecording, setIsStreamRecording] = useState<boolean>(false);
  const [recordingElapsedSec, setRecordingElapsedSec] = useState<number>(0);
  const [pipMode, setPipMode] = useState<PipActiveMode>(() => newsPipController.getState().mode);

  // Global Volume Normalization Engine state (persisted baseline dB target & Web Audio DSP)
  const [audioNormConfig, setAudioNormConfig] = useState<AudioNormalizationConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUDIO_NORM);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_AUDIO_NORMALIZATION_CONFIG,
            ...parsed,
          };
        }
      }
    } catch (_) {}
    return DEFAULT_AUDIO_NORMALIZATION_CONFIG;
  });
  const [isAudioMonitorActive, setIsAudioMonitorActive] = useState<boolean>(false);
  const [isAudioRamping, setIsAudioRamping] = useState<boolean>(false);
  const [lastJumpPreventedDb, setLastJumpPreventedDb] = useState<number>(0);
  const [lastAudioSwitchSummary, setLastAudioSwitchSummary] = useState<string | null>(null);
  const audioEngineRef = useRef<WebAudioNormalizationEngine | null>(null);
  const audioRampTimerRef = useRef<number | null>(null);
  const prevAudioSignatureRef = useRef<{
    key: string;
    callSign: string;
    sourceLabel: string;
    nativeDb: number;
  } | null>(null);

  // Locally stored Stream Archive clips (IndexedDB + Blob object URLs)
  const [archivedClips, setArchivedClips] = useState<RecordedStreamClip[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState<boolean>(true);
  const archiveObjectUrlsRef = useRef<Set<string>>(new Set());

  const handleRecordingStateChange = useCallback((recording: boolean, elapsedSec: number) => {
    setIsStreamRecording(recording);
    setRecordingElapsedSec(elapsedSec);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadArchivedClips()
      .then((loaded) => {
        if (cancelled) {
          loaded.forEach((c) => URL.revokeObjectURL(c.objectUrl));
          return;
        }
        loaded.forEach((c) => archiveObjectUrlsRef.current.add(c.objectUrl));
        setArchivedClips(loaded);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingArchive(false);
      });

    return () => {
      cancelled = true;
      archiveObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      archiveObjectUrlsRef.current.clear();
    };
  }, []);

  const handleClipSaved = useCallback((clip: RecordedStreamClip, blob: Blob) => {
    archiveObjectUrlsRef.current.add(clip.objectUrl);
    setArchivedClips((prev) => [clip, ...prev]);
    const { objectUrl: _unusedUrl, ...clipMeta } = clip;
    void saveArchivedClip(clipMeta, blob);
  }, []);

  const handleUpdateArchivedClipMeta = useCallback(
    (id: string, patch: Partial<Pick<RecordedStreamClip, 'title' | 'isStarred' | 'notes'>>) => {
      setArchivedClips((prev) =>
        prev.map((clip) => (clip.id === id ? { ...clip, ...patch } : clip))
      );
      void updateArchivedClipMeta(id, patch);
    },
    []
  );

  const handleDeleteArchivedClip = useCallback((clip: RecordedStreamClip) => {
    URL.revokeObjectURL(clip.objectUrl);
    archiveObjectUrlsRef.current.delete(clip.objectUrl);
    setArchivedClips((prev) => prev.filter((c) => c.id !== clip.id));
    void deleteArchivedClipsByIds([clip.id]);
  }, []);

  const handleDeleteArchivedClips = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setArchivedClips((prev) => {
      prev.forEach((c) => {
        if (idSet.has(c.id)) {
          URL.revokeObjectURL(c.objectUrl);
          archiveObjectUrlsRef.current.delete(c.objectUrl);
        }
      });
      return prev.filter((c) => !idSet.has(c.id));
    });
    void deleteArchivedClipsByIds(ids);
  }, []);

  const handleClearArchivedClips = useCallback(() => {
    archiveObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    archiveObjectUrlsRef.current.clear();
    setArchivedClips([]);
    void clearArchivedClipsStore();
    setToastMsg('Cleared all recorded segments from local Stream Archive');
  }, []);

  // Dynamic Stream Source Switcher state (Satellite, Web, Local, Fiber 100G, Strimm.com)
  const [activeStreamSource, setActiveStreamSource] = useState<NewsStreamSourceType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STREAM_SOURCE);
      if (
        saved === 'satellite' ||
        saved === 'web' ||
        saved === 'local' ||
        saved === 'fiber' ||
        saved === 'strimm'
      ) {
        return saved;
      }
    } catch (_) {}
    return 'satellite';
  });
  const [selectedQualityTier, setSelectedQualityTier] = useState<StreamQualityTier>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUALITY_TIER);
      if (saved === '480p' || saved === '720p' || saved === '1080p') {
        return saved;
      }
    } catch (_) {}
    return '1080p';
  });
  const [autoFailover, setAutoFailover] = useState<boolean>(true);
  const [activeMirrorIndex, setActiveMirrorIndex] = useState<number>(0);
  const [connectionPhase, setConnectionPhase] = useState<StreamConnectionPhase>('connected');
  const [reconnectAttempt, setReconnectAttempt] = useState<number>(0);
  const [disconnectReason, setDisconnectReason] = useState<string | null>(null);
  const [reconnectLog, setReconnectLog] = useState<StreamReconnectEvent[]>([]);
  const reconnectTimerRef = useRef<number | null>(null);
  const probeTimerRef = useRef<number | null>(null);

  // Watch History (tracks last 5 TV / news stream sources viewed)
  const [watchHistory, setWatchHistory] = useState<WatchHistoryEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WATCH_HISTORY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.slice(0, MAX_WATCH_HISTORY);
      }
    } catch (_) {}
    return [];
  });
  const lastRecordedHistoryKeyRef = useRef<string | null>(null);

  // Sync EPG (15-minute automatic schedule refresh via simulated API call)
  const [epgSyncSnapshot, setEpgSyncSnapshot] = useState<EpgSyncSnapshot | null>(null);
  const [isSyncingEpg, setIsSyncingEpg] = useState<boolean>(false);
  const [epgAutoSyncEnabled, setEpgAutoSyncEnabled] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EPG_AUTOSYNC);
      if (raw === 'false') return false;
    } catch (_) {}
    return true;
  });
  const [epgNextSyncAt, setEpgNextSyncAt] = useState<number>(
    () => Date.now() + EPG_AUTO_SYNC_INTERVAL_MS
  );
  const [epgCountdownSec, setEpgCountdownSec] = useState<number>(
    Math.floor(EPG_AUTO_SYNC_INTERVAL_MS / 1000)
  );
  const epgAbortRef = useRef<AbortController | null>(null);
  const epgRevisionRef = useRef<number>(0);

  // Live RSS Satellite Alert Notification System (malfunctions, constellation launches, solar/RF alerts)
  const [satelliteAlerts, setSatelliteAlerts] = useState<SatelliteOrbitalAlert[]>(() =>
    buildInitialSatelliteAlerts()
  );
  const [satelliteAlertsEnabled, setSatelliteAlertsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAT_ALERTS_ENABLED);
      if (saved === 'false') return false;
    } catch (_) {}
    return true;
  });
  const [showSatelliteAlertCenter, setShowSatelliteAlertCenter] = useState<boolean>(false);
  const [selectedSatelliteAlertId, setSelectedSatelliteAlertId] = useState<string | null>(null);
  const [isScanningSatelliteRss, setIsScanningSatelliteRss] = useState<boolean>(false);
  const [lastSatelliteScanLabel, setLastSatelliteScanLabel] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const satelliteRssPollCycleRef = useRef<number>(1);
  const satelliteScanTimerRef = useRef<number | null>(null);

  // Integrated Dual Transparent IRC Client Overlays on the Video Player
  const [showIrcOverlay, setShowIrcOverlay] = useState<boolean>(true);
  const [isIrcOverlayMinimized, setIsIrcOverlayMinimized] = useState<boolean>(false);
  const [ircOverlayPosition, setIrcOverlayPosition] = useState<'right' | 'left'>('right');
  const [ircOverlayOpacity, setIrcOverlayOpacity] = useState<IrcOverlayOpacityMode>('translucent');

  // Second transparent IRC overlay for side-by-side multi-source chat
  const [showSecondIrcOverlay, setShowSecondIrcOverlay] = useState<boolean>(false);
  const [isSecondIrcMinimized, setIsSecondIrcMinimized] = useState<boolean>(false);
  const [secondIrcOpacity, setSecondIrcOpacity] = useState<IrcOverlayOpacityMode>('transparent');
  const [secondIrcSourceType, setSecondIrcSourceType] = useState<NewsStreamSourceType>('web');

  const cycleOverlayOpacity = (mode: IrcOverlayOpacityMode): IrcOverlayOpacityMode =>
    mode === 'transparent' ? 'translucent' : mode === 'translucent' ? 'solid' : 'transparent';

  const effectiveIrcSession: IrcLoginSession = ircSession || {
    nick: 'RichardAlanWitt',
    ident: 'satcom_web',
    realname: 'DrFun1 News Broadcast Client',
    serverHost: 'irc.drfun1.com',
    serverPort: 6697,
    useSsl: true,
    channel: '#drfun1-news',
    autoConnectOnStartup: true,
    activeNodeId: 'dev_drfun1media_node',
    connectedAt: Date.now(),
    isConnected: true,
  };

  // Tuned Outlet & 4-Outlet News Quad
  const [tunedOutletId, setTunedOutletId] = useState<string>('news-drfun1-hq');
  const [quadOutletIds, setQuadOutletIds] = useState<string[]>([
    'news-drfun1-hq',
    'news-bbc-world',
    'news-aljazeera',
    'news-nhk-world',
  ]);
  const [quadAudioSlot, setQuadAudioSlot] = useState<number>(0);

  // Filters & Sorting
  const [regionFilter, setRegionFilter] = useState<'All' | NewsOutletRegion>('All');
  const [mapFilterSynced, setMapFilterSynced] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<'All' | NewsOutletCategory>('All');
  const [sortMode, setSortMode] = useState<OutletSortMode>('viewers');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [breakingOnly, setBreakingOnly] = useState<boolean>(false);
  const [bookmarkedOnly, setBookmarkedOnly] = useState<boolean>(false);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, { breaking?: boolean; status?: 'ON AIR' | 'STANDBY' }>>({});
  const directorySectionRef = useRef<HTMLDivElement | null>(null);
  const epgSectionRef = useRef<HTMLDivElement | null>(null);
  const playerSectionRef = useRef<HTMLDivElement | null>(null);

  // Add Outlet Modal / Form
  const [showAddOutlet, setShowAddOutlet] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newCallSign, setNewCallSign] = useState<string>('');
  const [newCountry, setNewCountry] = useState<string>('');
  const [newRegion, setNewRegion] = useState<NewsOutletRegion>('Europe');
  const [newCategory, setNewCategory] = useState<NewsOutletCategory>('24/7 Cable News');
  const [newWebsite, setNewWebsite] = useState<string>('');
  const [newSecondaryMirrorUrl, setNewSecondaryMirrorUrl] = useState<string>('');
  const [newProgram, setNewProgram] = useState<string>('Live World Desk');

  // Producer Bulletin Composer
  const [bulletinText, setBulletinText] = useState<string>('');
  const [bulletinPriority, setBulletinPriority] = useState<DrFun1NewsBulletin['priority']>('FLASH');

  // Toast & Copy State with Ref cleanup
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  const clearReconnectTimers = () => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (probeTimerRef.current !== null) {
      window.clearTimeout(probeTimerRef.current);
      probeTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
      clearReconnectTimers();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_OUTLETS, JSON.stringify(customOutlets));
    } catch (_) {}
  }, [customOutlets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKMARKED_OUTLETS, JSON.stringify(bookmarkedIds));
    } catch (_) {}
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BULLETINS, JSON.stringify(bulletins));
    } catch (_) {}
  }, [bulletins]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STREAM_SOURCE, activeStreamSource);
    } catch (_) {}
  }, [activeStreamSource]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WATCH_HISTORY, JSON.stringify(watchHistory));
    } catch (_) {}
  }, [watchHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EPG_AUTOSYNC, String(epgAutoSyncEnabled));
    } catch (_) {}
  }, [epgAutoSyncEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAT_ALERTS_ENABLED, String(satelliteAlertsEnabled));
    } catch (_) {}
  }, [satelliteAlertsEnabled]);

  useEffect(() => {
    return () => {
      if (satelliteScanTimerRef.current !== null) {
        window.clearTimeout(satelliteScanTimerRef.current);
      }
    };
  }, []);

  // Automatically scan the live satcom RSS feed every 22s for critical orbital events
  useEffect(() => {
    if (!isLiveStreaming || !satelliteAlertsEnabled) return;
    const intervalId = window.setInterval(() => {
      const nextCycle = satelliteRssPollCycleRef.current++;
      const { alert } = pollNextRssForSatelliteAlert(nextCycle);
      setLastSatelliteScanLabel(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      if (!alert) return;

      setSatelliteAlerts((prev) => {
        const deduped = prev.filter((item) => item.title !== alert.title);
        return [alert, ...deduped].slice(0, 24);
      });
    }, 22000);

    return () => window.clearInterval(intervalId);
  }, [isLiveStreaming, satelliteAlertsEnabled]);

  useEffect(() => {
    if (!isLiveStreaming) return;
    const timer = window.setInterval(() => {
      setLiveTick((t) => t + 1);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [isLiveStreaming]);

  const showNotice = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
      toastTimerRef.current = null;
    }, 3200);
  };

  const handleCopy = (value: string, id: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => {
      setCopiedId(null);
      copyTimerRef.current = null;
    }, 2000);
  };

  // Combine built-in + custom outlets with live fluctuating viewer telemetry
  const allOutlets = useMemo<GlobalNewsOutlet[]>(() => {
    const merged = [...customOutlets, ...GLOBAL_NEWS_OUTLETS];
    return merged.map((outlet, idx) => {
      const override = statusOverrides[outlet.id];
      const wave = Math.round(Math.sin(liveTick * 0.7 + idx * 0.9) * 280 + ((liveTick + idx) % 7) * 45);
      return {
        ...outlet,
        viewers: Math.max(450, outlet.viewers + wave),
        isBreaking: override?.breaking ?? outlet.isBreaking,
        status: override?.status ?? outlet.status,
      };
    });
  }, [customOutlets, liveTick, statusOverrides]);

  const tunedOutlet = useMemo(
    () => allOutlets.find((o) => o.id === tunedOutletId) || allOutlets[0],
    [allOutlets, tunedOutletId]
  );

  // Keep latest outlets ref for 15-minute EPG auto-sync without re-arming timers on viewer ticks
  const allOutletsRef = useRef<GlobalNewsOutlet[]>(allOutlets);
  allOutletsRef.current = allOutlets;

  const runEpgSync = async (trigger: 'initial' | 'manual' | 'auto') => {
    if (epgAbortRef.current) {
      epgAbortRef.current.abort();
    }
    const controller = new AbortController();
    epgAbortRef.current = controller;
    setIsSyncingEpg(true);

    const nextRev = epgRevisionRef.current + 1;

    try {
      const snapshot = await fetchSyncedWorldNewsEpg(
        allOutletsRef.current,
        nextRev,
        controller.signal
      );
      if (controller.signal.aborted) return;
      epgRevisionRef.current = snapshot.revision;
      setEpgSyncSnapshot(snapshot);
      const nextAt = Date.now() + EPG_AUTO_SYNC_INTERVAL_MS;
      setEpgNextSyncAt(nextAt);
      setEpgCountdownSec(Math.floor(EPG_AUTO_SYNC_INTERVAL_MS / 1000));

      if (trigger === 'manual') {
        showNotice(
          `Synced ${snapshot.channelCount}-channel EPG (Rev #${snapshot.revision}, ${snapshot.latencyMs}ms) — next auto-sync in 15m`
        );
      } else if (trigger === 'auto') {
        showNotice(
          `Auto-synced ${snapshot.channelCount}-channel EPG schedule (Rev #${snapshot.revision})`
        );
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        showNotice('EPG sync failed — retrying automatically at next interval');
      }
    } finally {
      if (epgAbortRef.current === controller) {
        epgAbortRef.current = null;
        setIsSyncingEpg(false);
      }
    }
  };

  const runEpgSyncRef = useRef(runEpgSync);
  runEpgSyncRef.current = runEpgSync;

  // Initial EPG API sync on mount + cleanup abort on unmount
  useEffect(() => {
    runEpgSyncRef.current('initial');
    return () => {
      epgAbortRef.current?.abort();
    };
  }, []);

  // Reset 15-minute deadline when Auto-Sync is re-enabled
  useEffect(() => {
    if (!epgAutoSyncEnabled) return;
    const nextAt = Date.now() + EPG_AUTO_SYNC_INTERVAL_MS;
    setEpgNextSyncAt(nextAt);
    setEpgCountdownSec(Math.floor(EPG_AUTO_SYNC_INTERVAL_MS / 1000));
  }, [epgAutoSyncEnabled]);

  // Automatic 15-minute EPG refresh timer + 1s countdown display in exact lockstep
  useEffect(() => {
    if (!epgAutoSyncEnabled) return;

    const delayMs = Math.max(1000, epgNextSyncAt - Date.now());
    const autoSyncTimeoutId = window.setTimeout(() => {
      runEpgSyncRef.current('auto');
    }, delayMs);

    const tickId = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((epgNextSyncAt - Date.now()) / 1000));
      setEpgCountdownSec(remaining);
    }, 1000);

    return () => {
      window.clearTimeout(autoSyncTimeoutId);
      window.clearInterval(tickId);
    };
  }, [epgAutoSyncEnabled, epgNextSyncAt]);

  const resolvedActiveSource = useMemo(
    () =>
      resolveOutletStreamSource(
        tunedOutlet,
        activeStreamSource,
        liveTick,
        activeMirrorIndex,
        selectedQualityTier
      ),
    [tunedOutlet, activeStreamSource, liveTick, activeMirrorIndex, selectedQualityTier]
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUALITY_TIER, selectedQualityTier);
    } catch (_) {}
  }, [selectedQualityTier]);

  const handleSelectQualityTier = useCallback(
    (tier: StreamQualityTier) => {
      setSelectedQualityTier(tier);
      const matched = resolvedActiveSource.qualityOptions.find((q) => q.tier === tier);
      if (matched) {
        showNotice(
          `Switched ${tunedOutlet.callSign} (${resolvedActiveSource.profile.label}) to ${matched.label} · ${matched.bitrateMbps} Mbps`
        );
      }
    },
    [resolvedActiveSource.qualityOptions, resolvedActiveSource.profile.label, tunedOutlet.callSign]
  );

  const resolvedSecondaryIrcSource = useMemo(
    () => resolveOutletStreamSource(tunedOutlet, secondIrcSourceType, liveTick, 0),
    [tunedOutlet, secondIrcSourceType, liveTick]
  );

  const secondIrcPosition: 'right' | 'left' = ircOverlayPosition === 'right' ? 'left' : 'right';
  const isPrimaryIrcExpanded = showIrcOverlay && !isIrcOverlayMinimized;
  const isSecondaryIrcExpanded = showSecondIrcOverlay && !isSecondIrcMinimized;
  const isDualIrcExpanded = isPrimaryIrcExpanded && isSecondaryIrcExpanded;

  const appendReconnectEvent = (
    event: Omit<StreamReconnectEvent, 'id' | 'timestamp'>
  ) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const entry: StreamReconnectEvent = {
      id: `reconn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp,
      ...event,
    };
    setReconnectLog((prev) => [entry, ...prev].slice(0, 15));
  };

  const resetToPrimaryConnection = () => {
    clearReconnectTimers();
    setActiveMirrorIndex(0);
    setConnectionPhase('connected');
    setReconnectAttempt(0);
    setDisconnectReason(null);
  };

  const attemptMirrorFailover = (
    fromIndex: number,
    reason: string,
    outletSnapshot: GlobalNewsOutlet,
    sourceSnapshot: NewsStreamSourceType
  ) => {
    clearReconnectTimers();
    const resolvedCurrent = resolveOutletStreamSource(
      outletSnapshot,
      sourceSnapshot,
      liveTick,
      fromIndex
    );
    const nextIndex = fromIndex + 1;
    const nextMirror =
      nextIndex < resolvedCurrent.endpoints.length
        ? resolvedCurrent.endpoints[nextIndex]
        : null;

    setConnectionPhase('reconnecting');
    setReconnectAttempt((prev) => prev + 1);

    appendReconnectEvent({
      outletCallSign: outletSnapshot.callSign,
      sourceLabel: resolvedCurrent.profile.label,
      fromUrl: resolvedCurrent.feedUrl,
      toUrl: nextMirror?.url,
      status: 'reconnecting',
      reason: nextMirror
        ? `Probing ${nextMirror.label}`
        : 'No secondary mirror remaining — verifying primary',
    });

    probeTimerRef.current = window.setTimeout(() => {
      probeTimerRef.current = null;
      if (nextMirror) {
        setActiveMirrorIndex(nextIndex);
        setConnectionPhase('mirror_active');
        setDisconnectReason(null);
        appendReconnectEvent({
          outletCallSign: outletSnapshot.callSign,
          sourceLabel: resolvedCurrent.profile.label,
          fromUrl: resolvedCurrent.feedUrl,
          toUrl: nextMirror.url,
          status: 'switched',
          reason: `Switched to ${nextMirror.label} after ${reason.toLowerCase()}`,
        });
        showNotice(
          `Auto-reconnected ${outletSnapshot.callSign} via ${nextMirror.label} (${nextMirror.url})`
        );
      } else {
        setConnectionPhase('failed');
        setDisconnectReason(
          `All ${resolvedCurrent.endpoints.length} ${resolvedCurrent.profile.label} endpoints unavailable`
        );
        appendReconnectEvent({
          outletCallSign: outletSnapshot.callSign,
          sourceLabel: resolvedCurrent.profile.label,
          fromUrl: resolvedCurrent.feedUrl,
          status: 'exhausted',
          reason: 'All mirrors exhausted — retry primary or switch stream source',
        });
        showNotice(
          `${outletSnapshot.callSign}: All ${resolvedCurrent.profile.label} mirrors exhausted. Retry primary or switch source.`
        );
      }
    }, 1350);
  };

  const handleStreamDisconnectDetected = (reason: string) => {
    if (connectionPhase === 'reconnecting') return;
    clearReconnectTimers();

    const outletSnapshot = tunedOutlet;
    const sourceSnapshot = activeStreamSource;
    const currentIdx = activeMirrorIndex;
    const resolvedCurrent = resolveOutletStreamSource(
      outletSnapshot,
      sourceSnapshot,
      liveTick,
      currentIdx
    );

    setConnectionPhase('disconnected');
    setDisconnectReason(reason);
    appendReconnectEvent({
      outletCallSign: outletSnapshot.callSign,
      sourceLabel: resolvedCurrent.profile.label,
      fromUrl: resolvedCurrent.feedUrl,
      status: 'disconnected',
      reason,
    });

    if (autoFailover) {
      showNotice(
        `Stream disconnect detected on ${outletSnapshot.callSign} (${resolvedCurrent.activeEndpoint.label}) — switching to secondary mirror…`
      );
      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null;
        attemptMirrorFailover(currentIdx, reason, outletSnapshot, sourceSnapshot);
      }, 600);
    } else {
      showNotice(
        `Stream disconnected for ${outletSnapshot.callSign}. Auto-Reconnect is OFF — click Reconnect to switch mirrors.`
      );
    }
  };

  const handleManualReconnect = () => {
    const outletSnapshot = tunedOutlet;
    const sourceSnapshot = activeStreamSource;
    const resolvedCurrent = resolveOutletStreamSource(
      outletSnapshot,
      sourceSnapshot,
      liveTick,
      activeMirrorIndex
    );

    if (connectionPhase === 'failed' || !resolvedCurrent.nextMirrorEndpoint) {
      // Probe primary again when all mirrors were previously exhausted
      clearReconnectTimers();
      setConnectionPhase('reconnecting');
      setReconnectAttempt((prev) => prev + 1);
      probeTimerRef.current = window.setTimeout(() => {
        probeTimerRef.current = null;
        const primary = resolvedCurrent.endpoints[0];
        setActiveMirrorIndex(0);
        setConnectionPhase('connected');
        setDisconnectReason(null);
        appendReconnectEvent({
          outletCallSign: outletSnapshot.callSign,
          sourceLabel: resolvedCurrent.profile.label,
          fromUrl: resolvedCurrent.feedUrl,
          toUrl: primary.url,
          status: 'restored',
          reason: 'Reconnected to primary stream endpoint',
        });
        showNotice(`Restored primary ${resolvedCurrent.profile.label} feed for ${outletSnapshot.callSign}`);
      }, 1100);
      return;
    }

    attemptMirrorFailover(
      activeMirrorIndex,
      disconnectReason || 'manual failover request',
      outletSnapshot,
      sourceSnapshot
    );
  };

  const handleRestorePrimary = () => {
    const resolvedPrimary = resolveOutletStreamSource(tunedOutlet, activeStreamSource, liveTick, 0);
    const prevUrl = resolvedActiveSource.feedUrl;
    resetToPrimaryConnection();
    appendReconnectEvent({
      outletCallSign: tunedOutlet.callSign,
      sourceLabel: resolvedPrimary.profile.label,
      fromUrl: prevUrl,
      toUrl: resolvedPrimary.feedUrl,
      status: 'restored',
      reason: 'Restored primary stream endpoint',
    });
    showNotice(
      `Restored primary ${resolvedPrimary.profile.label} stream for ${tunedOutlet.callSign}`
    );
  };

  const handleSelectMirrorIndex = (nextIndex: number) => {
    clearReconnectTimers();
    const clamped = Math.max(0, Math.min(resolvedActiveSource.endpoints.length - 1, nextIndex));
    const target = resolvedActiveSource.endpoints[clamped];
    const prevUrl = resolvedActiveSource.feedUrl;
    setActiveMirrorIndex(clamped);
    setConnectionPhase(clamped === 0 ? 'connected' : 'mirror_active');
    setDisconnectReason(null);
    appendReconnectEvent({
      outletCallSign: tunedOutlet.callSign,
      sourceLabel: resolvedActiveSource.profile.label,
      fromUrl: prevUrl,
      toUrl: target.url,
      status: clamped === 0 ? 'restored' : 'switched',
      reason: `Manually selected ${target.label}`,
    });
    showNotice(`Switched ${tunedOutlet.callSign} to ${target.label} (${target.url})`);
  };

  // Detect real browser offline/online disconnects and trigger auto-reconnection
  const disconnectHandlerRef = useRef(handleStreamDisconnectDetected);
  const manualReconnectRef = useRef(handleManualReconnect);
  disconnectHandlerRef.current = handleStreamDisconnectDetected;
  manualReconnectRef.current = handleManualReconnect;

  useEffect(() => {
    const onOffline = () => {
      disconnectHandlerRef.current('Browser network offline — primary stream disconnected');
    };
    const onOnline = () => {
      if (autoFailover && (connectionPhase === 'disconnected' || connectionPhase === 'failed')) {
        manualReconnectRef.current();
      }
    };
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [autoFailover, connectionPhase]);

  // Reset mirror/reconnect state cleanly when tuning a different outlet
  useEffect(() => {
    resetToPrimaryConnection();
  }, [tunedOutletId]);

  // Automatically track the last 5 TV/news stream sources viewed in Watch History
  useEffect(() => {
    if (!tunedOutlet) return;
    const historyKey = `${tunedOutlet.id}::${activeStreamSource}`;
    if (lastRecordedHistoryKeyRef.current === historyKey) return;
    lastRecordedHistoryKeyRef.current = historyKey;

    const sourceProfile =
      NEWS_STREAM_SOURCE_PROFILES.find((p) => p.id === activeStreamSource) ||
      NEWS_STREAM_SOURCE_PROFILES[0];

    const entry: WatchHistoryEntry = {
      key: historyKey,
      outletId: tunedOutlet.id,
      callSign: tunedOutlet.callSign,
      outletName: tunedOutlet.name,
      country: tunedOutlet.country,
      region: tunedOutlet.region,
      accentColor: tunedOutlet.accentColor,
      programTitle: tunedOutlet.currentProgram,
      sourceType: activeStreamSource,
      sourceLabel: sourceProfile.label,
      sourceProtocol: sourceProfile.protocol,
      viewedAt: Date.now(),
    };

    setWatchHistory((prev) =>
      [entry, ...prev.filter((item) => item.key !== historyKey)].slice(0, MAX_WATCH_HISTORY)
    );
  }, [tunedOutlet, activeStreamSource]);

  const handleJumpToWatchHistory = (entry: WatchHistoryEntry) => {
    const exists = allOutlets.some((o) => o.id === entry.outletId);
    if (!exists) {
      setWatchHistory((prev) => prev.filter((item) => item.key !== entry.key));
      showNotice(`${entry.callSign} is no longer in the directory and was removed from Watch History.`);
      return;
    }

    resetToPrimaryConnection();
    // Allow re-recording the refreshed timestamp at top of history
    lastRecordedHistoryKeyRef.current = null;
    setTunedOutletId(entry.outletId);
    setActiveStreamSource(entry.sourceType);
    setViewMode('theater');
    setIsPlayerPlaying(true);
    showNotice(`Returned to ${entry.callSign} · ${entry.sourceLabel} (${entry.sourceProtocol})`);
  };

  const handleRemoveWatchHistoryEntry = (key: string) => {
    setWatchHistory((prev) => prev.filter((item) => item.key !== key));
  };

  const handleClearWatchHistory = () => {
    lastRecordedHistoryKeyRef.current = `${tunedOutlet.id}::${activeStreamSource}`;
    setWatchHistory([]);
    showNotice('Cleared DrFun1 News Watch History');
  };

  const handleSelectStreamSource = (nextSource: NewsStreamSourceType) => {
    resetToPrimaryConnection();
    setActiveStreamSource(nextSource);
    const resolved = resolveOutletStreamSource(tunedOutlet, nextSource, liveTick, 0);
    showNotice(
      `Source switched to ${resolved.profile.label} (${resolved.profile.protocol}) for ${tunedOutlet.callSign} · ${resolved.effectiveBitrateMbps} Mbps`
    );
  };

  const handlePushStrimmChannelToLiveDesk = (channel: StrimmChannelConfig) => {
    const outletId = channel.linkedOutletId || `news-strimm-${channel.id}`;
    const leadBlock = channel.schedule[0];
    const mappedOutlet: GlobalNewsOutlet = {
      id: outletId,
      callSign: channel.callSign,
      name: channel.name,
      country: channel.country,
      region: channel.region,
      language: 'English',
      category: channel.category,
      headquarters: `Strimm.com (${channel.whitelistedDomain})`,
      website: channel.embedUrl || 'https://www.strimm.com',
      streamUrl: channel.embedUrl || 'https://www.strimm.com',
      hlsFeedUrl: channel.hlsStreamUrl,
      currentProgram: leadBlock?.title || `${channel.name} 24/7 Linear`,
      anchorOrDesk: leadBlock?.hostOrDesk || `${channel.callSign} Strimm Playout`,
      headline:
        leadBlock?.synopsis ||
        `Live 24/7 Strimm.com linear TV broadcast (${channel.schedule.length} scheduled blocks).`,
      isBreaking: false,
      status: 'ON AIR',
      bitrateMbps: 10.5,
      viewers: 4820,
      codec: 'H.264 1080p60',
      switchIngestPop: `Strimm.com OTT Edge · ${channel.whitelistedDomain}`,
      accentColor: channel.accentColor || '#14b8a6',
      isUserAdded: true,
    };

    setCustomOutlets((prev) => {
      const exists = prev.some((o) => o.id === outletId);
      if (exists) {
        return prev.map((o) => (o.id === outletId ? mappedOutlet : o));
      }
      return [mappedOutlet, ...prev];
    });

    resetToPrimaryConnection();
    setActiveStreamSource('strimm');
    setTunedOutletId(outletId);
    setViewMode('theater');
    setIsPlayerPlaying(true);
    setActiveNewsTab('live');
    showNotice(
      `Synced Strimm.com channel "${channel.name}" (${channel.callSign}) to Live Desk & EPG`
    );
  };

  const unreadSatelliteAlertCount = useMemo(
    () => satelliteAlerts.filter((a) => !a.acknowledged).length,
    [satelliteAlerts]
  );

  const hasCriticalSatelliteAlert = useMemo(
    () => satelliteAlerts.some((a) => !a.acknowledged && a.severity === 'CRITICAL'),
    [satelliteAlerts]
  );

  const handleScanSatelliteRssNow = () => {
    if (isScanningSatelliteRss) return;
    setIsScanningSatelliteRss(true);
    if (satelliteScanTimerRef.current !== null) {
      window.clearTimeout(satelliteScanTimerRef.current);
    }
    satelliteScanTimerRef.current = window.setTimeout(() => {
      let foundAlert: SatelliteOrbitalAlert | null = null;
      for (let attempt = 0; attempt < 2 && !foundAlert; attempt++) {
        const nextCycle = satelliteRssPollCycleRef.current++;
        const polled = pollNextRssForSatelliteAlert(nextCycle);
        if (polled.alert) {
          foundAlert = polled.alert;
        }
      }
      const nowLabel = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastSatelliteScanLabel(nowLabel);
      setIsScanningSatelliteRss(false);

      if (foundAlert) {
        const captured = foundAlert;
        setSatelliteAlerts((prev) => {
          const deduped = prev.filter((item) => item.title !== captured.title);
          return [captured, ...deduped].slice(0, 24);
        });
        setSelectedSatelliteAlertId(captured.id);
        setSatelliteAlertsEnabled(true);
        showNotice(
          `Satellite Alert detected via ${captured.sourceName}: [${captured.badgeLabel}] ${captured.title}`
        );
      } else {
        showNotice('Live RSS orbital scan complete — no new anomalies detected');
      }
    }, 320);
  };

  const handleInspectSatelliteAlert = (alert: SatelliteOrbitalAlert) => {
    setSelectedSatelliteAlertId(alert.id);
    setShowSatelliteAlertCenter(true);
    setSatelliteAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleDismissSatelliteAlertOverlay = (alertId: string) => {
    setSatelliteAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, dismissedOverlay: true } : a))
    );
  };

  const handleAcknowledgeSatelliteAlert = (alertId: string) => {
    setSatelliteAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true, dismissedOverlay: true } : a
      )
    );
  };

  const handleAcknowledgeAllSatelliteAlerts = () => {
    setSatelliteAlerts((prev) =>
      prev.map((a) => ({ ...a, acknowledged: true, dismissedOverlay: true }))
    );
    showNotice('Acknowledged all active Satellite Alerts');
  };

  const handlePinSatelliteAlertToOverlay = (alertId: string) => {
    setSatelliteAlertsEnabled(true);
    setSatelliteAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, dismissedOverlay: false } : a))
    );
    setActiveNewsTab('live');
    showNotice('Restored Satellite Alert overlay badge onto live video player');
  };

  const handleTuneSatcomDeskFromAlert = () => {
    const satcomOutlet =
      allOutlets.find((o) => o.id === 'news-nasa-scan') ||
      allOutlets.find((o) => o.category === 'Science & Satcom');
    if (satcomOutlet) {
      setTunedOutletId(satcomOutlet.id);
    }
    setActiveStreamSource('satellite');
    setActiveNewsTab('live');
    setViewMode('theater');
    setIsPlayerPlaying(true);
    setShowSatelliteAlertCenter(false);
    showNotice(
      satcomOutlet
        ? `Tuned ${satcomOutlet.name} (${satcomOutlet.callSign}) on Satellite Ku/Ka-Band downlink`
        : 'Switched live desk to Satellite Ku/Ka-Band downlink'
    );
  };

  const quadOutlets = useMemo(
    () =>
      quadOutletIds
        .map((id) => allOutlets.find((o) => o.id === id))
        .filter((o): o is GlobalNewsOutlet => Boolean(o)),
    [allOutlets, quadOutletIds]
  );

  // Global Volume Normalization Engine: active audio outlet, telemetry & smooth switch ramping
  const activeAudioOutlet =
    viewMode === 'quad' ? quadOutlets[quadAudioSlot] || tunedOutlet : tunedOutlet;

  const isFeedAudible =
    isPlayerPlaying &&
    !isMuted &&
    connectionPhase !== 'disconnected' &&
    connectionPhase !== 'reconnecting' &&
    connectionPhase !== 'failed';

  const baseNativeLoudnessDb = useMemo(
    () => getNativeSourceLoudnessDb(activeAudioOutlet, activeStreamSource),
    [activeAudioOutlet, activeStreamSource]
  );

  const audioNormTelemetry = useMemo<AudioNormalizationTelemetry>(() => {
    if (!isFeedAudible) {
      return {
        rawInputDb: -40.0,
        appliedGainDb: 0.0,
        normalizedOutputDb: -40.0,
        peakReductionDb: 0.0,
        isRamping: isAudioRamping,
        lastJumpPreventedDb,
        lastSwitchSummary: lastAudioSwitchSummary,
      };
    }

    // Subtle live speech cadence modulation (+/- 0.4 dB)
    const speechMod = +(Math.sin(liveTick * 1.15) * 0.35 + Math.cos(liveTick * 0.55) * 0.15).toFixed(1);
    const rawInputDb = +Math.max(-36, Math.min(-6, baseNativeLoudnessDb + speechMod)).toFixed(1);
    const { appliedGainDb, outputDb, peakReductionDb } = computeNormalizationGainDb(
      rawInputDb,
      audioNormConfig
    );
    const liveCompressorGr = audioEngineRef.current?.getCompressorReductionDb() || 0;

    return {
      rawInputDb,
      appliedGainDb,
      normalizedOutputDb: outputDb,
      peakReductionDb: Math.max(peakReductionDb, liveCompressorGr),
      isRamping: isAudioRamping,
      lastJumpPreventedDb,
      lastSwitchSummary: lastAudioSwitchSummary,
    };
  }, [
    isFeedAudible,
    liveTick,
    baseNativeLoudnessDb,
    audioNormConfig,
    isAudioRamping,
    lastJumpPreventedDb,
    lastAudioSwitchSummary,
  ]);

  // Persist audio normalization config
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIO_NORM, JSON.stringify(audioNormConfig));
    } catch (_) {}
  }, [audioNormConfig]);

  // Dispose Web Audio normalization engine & ramp timer cleanly on unmount
  useEffect(() => {
    return () => {
      if (audioRampTimerRef.current !== null) {
        window.clearTimeout(audioRampTimerRef.current);
      }
      audioEngineRef.current?.dispose();
      audioEngineRef.current = null;
    };
  }, []);

  // Detect outlet or stream source switches and ramp auto-gain smoothly to prevent volume jumps
  useEffect(() => {
    const key = `${activeAudioOutlet.id}::${activeStreamSource}`;
    const prev = prevAudioSignatureRef.current;
    const currentSourceLabel = resolvedActiveSource.profile.label;

    if (prev && prev.key !== key) {
      const jumpDelta = +Math.abs(baseNativeLoudnessDb - prev.nativeDb).toFixed(1);
      if (audioNormConfig.enabled) {
        setIsAudioRamping(true);
        if (audioRampTimerRef.current !== null) {
          window.clearTimeout(audioRampTimerRef.current);
        }
        audioRampTimerRef.current = window.setTimeout(() => {
          setIsAudioRamping(false);
        }, Math.max(250, audioNormConfig.rampMs));

        if (jumpDelta >= 0.3) {
          setLastJumpPreventedDb(jumpDelta);
          const { appliedGainDb } = computeNormalizationGainDb(
            baseNativeLoudnessDb,
            audioNormConfig
          );
          const signedTrim = `${appliedGainDb > 0 ? '+' : ''}${appliedGainDb.toFixed(1)} dB`;
          setLastAudioSwitchSummary(
            `Leveled ${prev.callSign} (${prev.sourceLabel} ${prev.nativeDb.toFixed(1)} dB) → ${activeAudioOutlet.callSign} (${currentSourceLabel} ${baseNativeLoudnessDb.toFixed(1)} dB) · Trim ${signedTrim}`
          );
        }
      }
    }

    prevAudioSignatureRef.current = {
      key,
      callSign: activeAudioOutlet.callSign,
      sourceLabel: currentSourceLabel,
      nativeDb: baseNativeLoudnessDb,
    };
  }, [
    activeAudioOutlet.id,
    activeAudioOutlet.callSign,
    activeStreamSource,
    resolvedActiveSource.profile.label,
    baseNativeLoudnessDb,
    audioNormConfig.enabled,
    audioNormConfig.targetDb,
    audioNormConfig.rampMs,
  ]);

  // Push live DSP parameters into the Web Audio normalization engine
  useEffect(() => {
    audioEngineRef.current?.applyDspSettings({
      rawInputDb: baseNativeLoudnessDb,
      appliedGainDb: audioNormTelemetry.appliedGainDb,
      config: audioNormConfig,
      isMuted,
      isPlaying: isPlayerPlaying,
    });
  }, [
    baseNativeLoudnessDb,
    audioNormTelemetry.appliedGainDb,
    audioNormConfig,
    isMuted,
    isPlayerPlaying,
  ]);

  const handleUpdateAudioNormConfig = useCallback(
    (patch: Partial<AudioNormalizationConfig>) => {
      setAudioNormConfig((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const handleSelectAudioNormPreset = useCallback((presetId: AudioNormalizationPreset) => {
    const spec =
      AUDIO_NORMALIZATION_PRESETS.find((p) => p.id === presetId) || AUDIO_NORMALIZATION_PRESETS[0];
    setAudioNormConfig((prev) => ({
      ...prev,
      enabled: true,
      preset: spec.id,
      targetDb: spec.targetDb,
      ceilingDb: spec.ceilingDb,
    }));
    showNotice(`Volume Normalization preset set to ${spec.label}`);
  }, []);

  const handleToggleAudioMonitor = useCallback(() => {
    if (!audioEngineRef.current) {
      audioEngineRef.current = new WebAudioNormalizationEngine();
    }
    const next = !isAudioMonitorActive;
    const started = audioEngineRef.current.toggleReferenceMonitor(next, {
      rawInputDb: baseNativeLoudnessDb,
      appliedGainDb: audioNormTelemetry.appliedGainDb,
      config: audioNormConfig,
      isMuted,
      isPlaying: isPlayerPlaying,
    });
    setIsAudioMonitorActive(started);
    if (started) {
      showNotice(
        'Audio reference monitor ON — switch between Satellite and Web or toggle AUTO-NORM to hear loudness leveling'
      );
    } else if (!next) {
      showNotice('Audio reference monitor stopped');
    }
  }, [
    isAudioMonitorActive,
    baseNativeLoudnessDb,
    audioNormTelemetry.appliedGainDb,
    audioNormConfig,
    isMuted,
    isPlayerPlaying,
  ]);

  // Build live Picture-in-Picture snapshot and keep persistent native PiP controller synced
  const currentPipSnapshot = useMemo<NewsPipSnapshot>(
    () => ({
      outlet: activeAudioOutlet,
      sourceLabel: resolvedActiveSource.profile.label,
      sourceProtocol: resolvedActiveSource.profile.protocol,
      routeLabel: resolvedActiveSource.routeLabel,
      feedUrl: resolvedActiveSource.feedUrl,
      bitrateMbps: resolvedActiveSource.effectiveBitrateMbps,
      latencyMs: resolvedActiveSource.latencyMs,
      connectionPhase,
      isPlaying: isPlayerPlaying,
      showCaptions,
      normalizedDbLabel: audioNormConfig.enabled ? `NORM ${audioNormConfig.targetDb}dB` : undefined,
    }),
    [
      activeAudioOutlet,
      resolvedActiveSource.profile.label,
      resolvedActiveSource.profile.protocol,
      resolvedActiveSource.routeLabel,
      resolvedActiveSource.feedUrl,
      resolvedActiveSource.effectiveBitrateMbps,
      resolvedActiveSource.latencyMs,
      connectionPhase,
      isPlayerPlaying,
      showCaptions,
      audioNormConfig.enabled,
      audioNormConfig.targetDb,
    ]
  );

  useEffect(() => {
    return newsPipController.subscribe((state) => {
      setPipMode(state.mode);
    });
  }, []);

  useEffect(() => {
    newsPipController.updateSnapshot(currentPipSnapshot);
  }, [currentPipSnapshot]);

  const handleTogglePictureInPicture = useCallback(async () => {
    if (pipMode !== 'off') {
      await newsPipController.exitPip();
      showNotice(`Exited Picture-in-Picture for ${activeAudioOutlet.callSign}`);
      return;
    }

    const activated = await newsPipController.enterPip(currentPipSnapshot);
    if (activated === 'native') {
      showNotice(
        `Popped out ${activeAudioOutlet.callSign} (${resolvedActiveSource.profile.label}) into native browser Picture-in-Picture`
      );
    } else if (activated === 'fallback') {
      showNotice(
        `Popped out ${activeAudioOutlet.callSign} into floating Picture-in-Picture player (stays on top across all tabs)`
      );
    }
  }, [pipMode, activeAudioOutlet.callSign, resolvedActiveSource.profile.label, currentPipSnapshot]);

  const filteredOutlets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = allOutlets.filter((o) => {
      if (regionFilter !== 'All' && o.region !== regionFilter) return false;
      if (categoryFilter !== 'All' && o.category !== categoryFilter) return false;
      if (breakingOnly && !o.isBreaking) return false;
      if (bookmarkedOnly && !bookmarkedIds.includes(o.id)) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        o.callSign.toLowerCase().includes(q) ||
        o.country.toLowerCase().includes(q) ||
        o.headquarters.toLowerCase().includes(q) ||
        o.language.toLowerCase().includes(q) ||
        o.headline.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortMode === 'alpha') return a.name.localeCompare(b.name);
      if (sortMode === 'region') return a.region.localeCompare(b.region) || b.viewers - a.viewers;
      if (sortMode === 'breaking') return Number(b.isBreaking) - Number(a.isBreaking) || b.viewers - a.viewers;
      return b.viewers - a.viewers;
    });
  }, [allOutlets, regionFilter, categoryFilter, breakingOnly, bookmarkedOnly, bookmarkedIds, searchQuery, sortMode]);

  const totalLiveViewers = useMemo(
    () => allOutlets.filter((o) => o.status === 'ON AIR').reduce((s, o) => s + o.viewers, 0),
    [allOutlets]
  );

  const activeBreakingCount = useMemo(
    () => allOutlets.filter((o) => o.isBreaking).length,
    [allOutlets]
  );

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleTuneByCallSign = (query: string): GlobalNewsOutlet | null => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const match =
      allOutlets.find((o) => o.callSign.toLowerCase() === q) ||
      allOutlets.find(
        (o) =>
          o.callSign.toLowerCase().includes(q) ||
          o.name.toLowerCase().includes(q) ||
          o.country.toLowerCase().includes(q)
      );
    if (!match) return null;
    setTunedOutletId(match.id);
    setViewMode('theater');
    setIsPlayerPlaying(true);
    showNotice(`Tuned DrFun1 News Video Player via IRC to ${match.name} (${match.callSign})`);
    return match;
  };

  // Automatic directory filter handler triggered when selecting a region on the D3 World Map
  const handleSelectRegionFromMap = (nextRegion: 'All' | NewsOutletRegion) => {
    setRegionFilter(nextRegion);
    setMapFilterSynced(nextRegion !== 'All');

    if (nextRegion === 'All') {
      showNotice(`D3 Map filter cleared — showing all ${allOutlets.length} global news outlets.`);
      return;
    }

    const regionMatches = allOutlets.filter((o) => o.region === nextRegion);
    const matchesWithCurrentSubFilters = regionMatches.filter((o) => {
      if (categoryFilter !== 'All' && o.category !== categoryFilter) return false;
      if (breakingOnly && !o.isBreaking) return false;
      if (bookmarkedOnly && !bookmarkedIds.includes(o.id)) return false;
      return true;
    });

    // Prevent an accidental 0-result list when switching regions on the map while narrow toggles are active
    let effectiveCount = matchesWithCurrentSubFilters.length;
    if (regionMatches.length > 0 && matchesWithCurrentSubFilters.length === 0) {
      setCategoryFilter('All');
      setBreakingOnly(false);
      setBookmarkedOnly(false);
      effectiveCount = regionMatches.length;
    }

    showNotice(
      `D3 Map filtered directory to ${nextRegion} (${effectiveCount} active ${
        effectiveCount === 1 ? 'outlet' : 'outlets'
      })`
    );
  };

  const handleAddOutlet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCallSign.trim()) return;
    const slug = newCallSign.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const created: GlobalNewsOutlet = {
      id: `news-custom-${Date.now()}`,
      callSign: newCallSign.trim().toUpperCase(),
      name: newName.trim(),
      country: newCountry.trim() || 'International',
      region: newRegion,
      language: 'English',
      category: newCategory,
      headquarters: newCountry.trim() || 'Global Bureau',
      website: newWebsite.trim() || `https://news.drfun1media.com/${slug}`,
      streamUrl: `https://news.drfun1media.com/relay/${slug}`,
      hlsFeedUrl: `https://stream.drfun1media.com/hls/${slug}/index.m3u8`,
      secondaryMirrorUrls: newSecondaryMirrorUrl.trim()
        ? [newSecondaryMirrorUrl.trim()]
        : undefined,
      currentProgram: newProgram.trim() || 'Live World News',
      anchorOrDesk: `${newCallSign.trim().toUpperCase()} Live Newsroom`,
      headline: `${newName.trim()} now live on DrFun1 News over Switch SUPERNAP 100G & RisingNet optical ring.`,
      isBreaking: true,
      status: 'ON AIR',
      bitrateMbps: 18.0,
      viewers: 12400,
      codec: 'VP9 HDR',
      switchIngestPop: 'Switch SUPERNAP 8 · Red5 WHIP',
      accentColor: '#38bdf8',
      isUserAdded: true,
    };

    setCustomOutlets((prev) => [created, ...prev]);
    setTunedOutletId(created.id);
    setNewName('');
    setNewCallSign('');
    setNewCountry('');
    setNewWebsite('');
    setNewSecondaryMirrorUrl('');
    setShowAddOutlet(false);
    showNotice(`Added ${created.name} (${created.callSign}) to DrFun1 News Global Directory`);
  };

  const handlePublishBulletin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletinText.trim()) return;
    const entry: DrFun1NewsBulletin = {
      id: `bul-${Date.now()}`,
      outletCallSign: tunedOutlet.callSign,
      region: tunedOutlet.region,
      headline: bulletinText.trim(),
      priority: bulletinPriority,
      timestamp: 'Just now',
      author: 'DrFun1 News Desk',
    };
    setBulletins((prev) => [entry, ...prev]);
    setBulletinText('');
    showNotice(`Published ${bulletinPriority} bulletin on DrFun1 News chyron`);
  };

  return (
    <div className="space-y-6">
      {/* ================================================================
          0. LIVE BREAKING NEWS TICKER (ACTIVE NEWS FEED ALERTS)
          ================================================================ */}
      <DrFun1BreakingNewsTicker
        tunedOutlet={tunedOutlet}
        allOutlets={allOutlets}
        bulletins={bulletins}
        activeSourceType={activeStreamSource}
        activeFeedUrl={resolvedActiveSource.feedUrl}
        isLiveStreaming={isLiveStreaming}
        totalLiveViewers={totalLiveViewers}
        onTuneOutletId={(outletId) => {
          const target = allOutlets.find((o) => o.id === outletId);
          if (!target) return;
          setTunedOutletId(target.id);
          setActiveNewsTab('live');
          setViewMode('theater');
          setIsPlayerPlaying(true);
          showNotice(`Tuned DrFun1 News from Breaking Ticker to ${target.name} (${target.callSign})`);
          window.setTimeout(() => {
            playerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 0);
        }}
        onNotify={showNotice}
      />

      {/* ================================================================
          1. DRFUN1 NEWS MASTHEAD & LIVE WORLD TELEMETRY
          ================================================================ */}
      <div className="bg-gradient-to-r from-[#19090d] via-slate-950 to-[#0a1324] border border-red-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 p-0.5 shadow-lg shadow-red-950/50 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  DrFun1 <span className="text-red-500">News</span>
                </h1>
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-bold uppercase whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE TV NEWS SERVICE
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase whitespace-nowrap">
                  {allOutlets.length} Global News Outlets
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                24/7 global television newsdesk uniting international broadcasters across 7 world regions via Switch SUPERNAP 100G &amp; RisingNet · Supervised by{' '}
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveNewsTab('live');
                window.setTimeout(() => {
                  epgSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 0);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>{allOutlets.length}-Outlet EPG</span>
            </button>

            <button
              type="button"
              disabled={isSyncingEpg}
              onClick={() => runEpgSync('manual')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              title="Refresh the 33-channel EPG grid immediately (auto-syncs every 15 minutes)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingEpg ? 'animate-spin' : ''}`} />
              <span>{isSyncingEpg ? 'Syncing EPG…' : 'Sync EPG'}</span>
            </button>

            <button
              type="button"
              aria-expanded={showSatelliteAlertCenter}
              onClick={() => setShowSatelliteAlertCenter((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer tabular-nums ${
                showSatelliteAlertCenter
                  ? 'bg-rose-600 text-white border-rose-400'
                  : hasCriticalSatelliteAlert
                    ? 'bg-rose-950/75 hover:bg-rose-900/80 text-rose-200 border-rose-500/60'
                    : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700'
              }`}
              title="Open live RSS Satellite Alert Notification Center for orbital malfunctions & constellation launches"
            >
              <Satellite className="w-3.5 h-3.5 shrink-0" />
              <span>Sat Alerts</span>
              {unreadSatelliteAlertCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    showSatelliteAlertCenter
                      ? 'bg-slate-950/30 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {unreadSatelliteAlertCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNewsTab('live');
                setViewMode((v) => (v === 'theater' ? 'quad' : 'theater'));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'quad' && activeNewsTab === 'live'
                  ? 'bg-red-600 text-white border-red-500'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{viewMode === 'quad' ? 'Single Theater' : '4-Outlet News Quad'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLiveStreaming((s) => !s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                isLiveStreaming
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
              }`}
            >
              {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isLiveStreaming ? 'Live Wire ON' : 'Paused'}</span>
            </button>

            {onNavigateToDrFun1Tv && (
              <button
                type="button"
                onClick={onNavigateToDrFun1Tv}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-red-300 border border-red-500/30 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>DrFun1-TV</span>
              </button>
            )}

            {onNavigateToRss && (
              <button
                type="button"
                onClick={onNavigateToRss}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/30 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Rss className="w-3.5 h-3.5" />
                <span>Satcom RSS</span>
              </button>
            )}

            {onNavigateToIrc && (
              <button
                type="button"
                onClick={onNavigateToIrc}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>#drfun1-news</span>
              </button>
            )}

            {onOpenLicense && (
              <button
                type="button"
                onClick={onOpenLicense}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>FRN 0034981290</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="bg-slate-900 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Workspace Tab Switcher: Live Broadcast Desk vs Stream Archive Library */}
      <div
        role="tablist"
        aria-label="DrFun1 News Workspace Tabs"
        className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/90 border border-slate-800 rounded-xl p-1.5"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            role="tab"
            aria-selected={activeNewsTab === 'live'}
            onClick={() => setActiveNewsTab('live')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeNewsTab === 'live'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            <span>Live Broadcast Desk</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                activeNewsTab === 'live'
                  ? 'bg-black/25 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {tunedOutlet.callSign}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeNewsTab === 'archive'}
            onClick={() => setActiveNewsTab('archive')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeNewsTab === 'archive'
                ? 'bg-cyan-600 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Stream Archive</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] tabular-nums ${
                activeNewsTab === 'archive'
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-slate-900 text-cyan-300 border border-slate-800'
              }`}
            >
              {archivedClips.length}
            </span>
            {isStreamRecording && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Recording in progress" />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeNewsTab === 'strimm'}
            onClick={() => setActiveNewsTab('strimm')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeNewsTab === 'strimm'
                ? 'bg-teal-500 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Strimm.com TV</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                activeNewsTab === 'strimm'
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-slate-900 text-teal-300 border border-slate-800'
              }`}
            >
              Linear OTT
            </span>
          </button>
        </div>

        <div className="px-2.5 text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-2 tabular-nums">
          <span>{allOutlets.length} Global Feeds</span>
          <span className="text-slate-700">·</span>
          <span className="text-cyan-300">
            {archivedClips.length} Archived {archivedClips.length === 1 ? 'Segment' : 'Segments'}
          </span>
        </div>
      </div>

      {/* Stream Archive Library Tab Panel */}
      {activeNewsTab === 'archive' && (
        <DrFun1StreamArchiveTab
          clips={archivedClips}
          isLoading={isLoadingArchive}
          isRecording={isStreamRecording}
          recordingElapsedSec={recordingElapsedSec}
          activeCallSign={tunedOutlet.callSign}
          onUpdateClipMeta={handleUpdateArchivedClipMeta}
          onDeleteClip={handleDeleteArchivedClip}
          onDeleteClips={handleDeleteArchivedClips}
          onClearAllClips={handleClearArchivedClips}
          onReturnToLiveDesk={() => setActiveNewsTab('live')}
          onTuneOutletId={(outletId) => {
            const target = allOutlets.find((o) => o.id === outletId);
            if (!target) return;
            setTunedOutletId(target.id);
            setActiveNewsTab('live');
            setViewMode('theater');
            setIsPlayerPlaying(true);
            showNotice(`Tuned back to ${target.name} (${target.callSign}) from Stream Archive`);
          }}
          onNotify={showNotice}
        />
      )}

      {/* Strimm.com Linear TV & OTT Integration Tab Panel */}
      {activeNewsTab === 'strimm' && (
        <DrFun1StrimmIntegrationTab
          activeTunedOutlet={tunedOutlet}
          allOutlets={allOutlets}
          onPushChannelToLiveDesk={handlePushStrimmChannelToLiveDesk}
          onReturnToLiveDesk={() => setActiveNewsTab('live')}
          onNotify={showNotice}
        />
      )}

      {/* Expandable Satellite Alert Notification Center (Live RSS Orbital Monitor) */}
      <DrFun1SatelliteAlertCenter
        isOpen={showSatelliteAlertCenter}
        alerts={satelliteAlerts}
        selectedAlertId={selectedSatelliteAlertId}
        alertsEnabled={satelliteAlertsEnabled}
        isScanning={isScanningSatelliteRss}
        lastScanLabel={lastSatelliteScanLabel}
        onClose={() => setShowSatelliteAlertCenter(false)}
        onSelectAlert={(id) => {
          setSelectedSatelliteAlertId(id);
          setSatelliteAlerts((prev) =>
            prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
          );
        }}
        onToggleAlertsEnabled={() => {
          const next = !satelliteAlertsEnabled;
          setSatelliteAlertsEnabled(next);
          showNotice(
            next
              ? 'Satellite Alert video overlay badges enabled (scanning live RSS feed)'
              : 'Satellite Alert video overlay badges muted'
          );
        }}
        onScanNow={handleScanSatelliteRssNow}
        onAcknowledgeAlert={handleAcknowledgeSatelliteAlert}
        onAcknowledgeAll={handleAcknowledgeAllSatelliteAlerts}
        onPinToOverlay={handlePinSatelliteAlertToOverlay}
        onTuneSatcomDesk={handleTuneSatcomDeskFromAlert}
        onNavigateToRss={onNavigateToRss}
      />

      {/* ================================================================
          2. DRFUN1 NEWS LIVE TV DESK (THEATER OR 4-OUTLET ANCHOR QUAD)
          Kept mounted while viewing Stream Archive so active recordings continue uninterrupted
          ================================================================ */}
      <div className={activeNewsTab === 'live' ? 'space-y-6' : 'hidden'}>
      <div ref={playerSectionRef} className="space-y-3">
        {/* Dynamic Source Switcher & Auto-Reconnect Menu (Satellite, Web, Local, Fiber 100G) */}
        <DrFun1NewsSourceSwitcher
          tunedOutlet={tunedOutlet}
          activeSource={activeStreamSource}
          activeMirrorIndex={activeMirrorIndex}
          connectionPhase={connectionPhase}
          reconnectAttempt={reconnectAttempt}
          disconnectReason={disconnectReason}
          reconnectLog={reconnectLog}
          autoFailover={autoFailover}
          liveTick={liveTick}
          onSelectSource={handleSelectStreamSource}
          onSelectMirrorIndex={handleSelectMirrorIndex}
          onToggleAutoFailover={() => {
            setAutoFailover((prev) => {
              const next = !prev;
              showNotice(
                next
                  ? 'Auto-Reconnect enabled — disconnects will automatically switch to secondary mirror URLs'
                  : 'Auto-Reconnect disabled — stream drops will wait for manual mirror switching'
              );
              return next;
            });
          }}
          onSimulateDisconnect={() =>
            handleStreamDisconnectDetected(
              `Primary ${resolvedActiveSource.profile.label} carrier signal dropped (0 kbps heartbeat)`
            )
          }
          onManualReconnect={handleManualReconnect}
          onRestorePrimary={handleRestorePrimary}
          onCopyActiveUrl={(url, label) => {
            handleCopy(url, 'hls-tuned');
            showNotice(`Copied ${label} stream URI for ${tunedOutlet.callSign}`);
          }}
          copiedFeed={copiedId === 'hls-tuned'}
        />

      {viewMode === 'theater' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Broadcast Stage */}
          <div className="xl:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative min-h-[390px] sm:min-h-[430px] md:aspect-video bg-gradient-to-br from-[#1b080c] via-slate-950 to-[#091529] p-4 sm:p-6 flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-2.5 py-1 rounded-md font-black text-xs text-slate-950 shadow"
                    style={{ backgroundColor: tunedOutlet.accentColor }}
                  >
                    {tunedOutlet.callSign}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold flex items-center gap-1.5 ${
                      connectionPhase === 'reconnecting'
                        ? 'bg-amber-600 text-slate-950'
                        : connectionPhase === 'disconnected' || connectionPhase === 'failed'
                          ? 'bg-rose-700 text-white'
                          : connectionPhase === 'mirror_active'
                            ? 'bg-cyan-600 text-slate-950'
                            : 'bg-red-600 text-white'
                    }`}
                  >
                    {connectionPhase === 'reconnecting' ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : connectionPhase === 'disconnected' || connectionPhase === 'failed' ? (
                      <WifiOff className="w-3 h-3" />
                    ) : (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          connectionPhase === 'mirror_active' ? 'bg-slate-950' : 'bg-white'
                        } ${isPlayerPlaying ? 'animate-pulse' : ''}`}
                      />
                    )}
                    <span>
                      {connectionPhase === 'reconnecting'
                        ? 'RECONNECTING'
                        : connectionPhase === 'disconnected'
                          ? 'DISCONNECTED'
                          : connectionPhase === 'failed'
                            ? 'OFFLINE'
                            : connectionPhase === 'mirror_active'
                              ? activeMirrorIndex === 2
                                ? 'MIRROR #3 LIVE'
                                : 'MIRROR #2 LIVE'
                              : tunedOutlet.status}
                    </span>
                  </span>
                  {isStreamRecording && (
                    <span className="px-2.5 py-1 rounded-md bg-red-600/95 border border-red-400 text-white text-[11px] font-mono font-bold flex items-center gap-1.5 shadow shadow-red-950/60 tabular-nums">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span>
                        REC {String(Math.floor(recordingElapsedSec / 60)).padStart(2, '0')}:
                        {String(recordingElapsedSec % 60).padStart(2, '0')}
                      </span>
                    </span>
                  )}
                  {pipMode !== 'off' && (
                    <span className="px-2 py-1 rounded-md bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 text-[11px] font-mono font-bold flex items-center gap-1">
                      <PictureInPicture2 className="w-3 h-3" />
                      <span>PiP ACTIVE</span>
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 rounded-md border text-[11px] font-mono font-bold ${resolvedActiveSource.profile.badgeClass}`}
                  >
                    {resolvedActiveSource.profile.label} · {resolvedActiveSource.activeEndpoint.label}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-[11px] font-mono text-slate-200 tabular-nums">
                    {connectionPhase === 'disconnected' ||
                    connectionPhase === 'reconnecting' ||
                    connectionPhase === 'failed'
                      ? '0.0 Mbps · -- ms'
                      : `${resolvedActiveSource.activeQuality.shortLabel} · ${resolvedActiveSource.effectiveBitrateMbps} Mbps · ${resolvedActiveSource.latencyMs} ms`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleBookmark(tunedOutlet.id)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1 cursor-pointer ${
                      bookmarkedIds.includes(tunedOutlet.id)
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{bookmarkedIds.includes(tunedOutlet.id) ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(resolvedActiveSource.feedUrl, 'hls-tuned')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'hls-tuned' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>
                      {copiedId === 'hls-tuned'
                        ? `${resolvedActiveSource.profile.shortLabel} Copied`
                        : `Copy ${resolvedActiveSource.profile.shortLabel}`}
                    </span>
                  </button>
                </div>
              </div>

              {/* Dynamic RSS Satellite Alert Overlay Badges (Malfunctions, Constellation Launches, Solar RF) */}
              <div className="mt-2.5 flex justify-start z-20">
                <DrFun1SatelliteAlertOverlayBadges
                  alerts={satelliteAlerts}
                  alertsEnabled={satelliteAlertsEnabled}
                  onInspectAlert={handleInspectSatelliteAlert}
                  onDismissOverlay={handleDismissSatelliteAlertOverlay}
                  onOpenAlertCenter={() => setShowSatelliteAlertCenter(true)}
                />
              </div>

              {/* Main Program Headline & Anchor Info (shifts cleanly when a single IRC overlay is open; stays centered behind dual transparent side-by-side overlays) */}
              <div
                className={`my-auto py-3 space-y-2.5 text-center max-w-2xl mx-auto transition-all ${
                  isDualIrcExpanded
                    ? ''
                    : isPrimaryIrcExpanded
                      ? ircOverlayPosition === 'right'
                        ? 'md:pr-[350px]'
                        : 'md:pl-[350px]'
                      : isSecondaryIrcExpanded
                        ? secondIrcPosition === 'right'
                          ? 'md:pr-[350px]'
                          : 'md:pl-[350px]'
                        : ''
                }`}
              >
                <div className="text-[11px] font-mono uppercase tracking-widest text-red-400 font-bold">
                  DRFUN1 NEWS WORLD RELAY · {tunedOutlet.country} ({tunedOutlet.region}) · {tunedOutlet.language}
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                  {tunedOutlet.currentProgram}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {tunedOutlet.headline}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
                  <span>Anchor/Bureau: <strong className="text-white">{tunedOutlet.anchorOrDesk}</strong></span>
                  <span>·</span>
                  <span className="text-emerald-300 tabular-nums">{tunedOutlet.viewers.toLocaleString()} live viewers</span>
                  <span>·</span>
                  <span className="text-cyan-300">{resolvedActiveSource.routeLabel}</span>
                </div>

                {/* Live Auto-Reconnection & Secondary Mirror Status Banner */}
                {connectionPhase !== 'connected' && (
                  <div
                    className={`mt-2 mx-auto max-w-xl rounded-xl border px-3.5 py-2.5 text-left font-mono text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      connectionPhase === 'reconnecting'
                        ? 'bg-amber-950/75 border-amber-500/60 text-amber-100'
                        : connectionPhase === 'mirror_active'
                          ? 'bg-cyan-950/75 border-cyan-500/50 text-cyan-100'
                          : 'bg-rose-950/80 border-rose-500/60 text-rose-100'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      {connectionPhase === 'reconnecting' ? (
                        <RefreshCw className="w-4 h-4 text-amber-300 animate-spin shrink-0 mt-0.5" />
                      ) : connectionPhase === 'mirror_active' ? (
                        <ShieldCheck className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className="font-bold">
                          {connectionPhase === 'reconnecting'
                            ? `Auto-Reconnecting (Attempt #${reconnectAttempt}) — Probing secondary mirror…`
                            : connectionPhase === 'mirror_active'
                              ? `Failover Active: ${resolvedActiveSource.activeEndpoint.label}`
                              : connectionPhase === 'failed'
                                ? 'All Mirror URLs Exhausted'
                                : 'Stream Source Disconnected'}
                        </div>
                        <div className="text-[10px] opacity-85 truncate mt-0.5">
                          {connectionPhase === 'reconnecting'
                            ? resolvedActiveSource.nextMirrorEndpoint?.url || resolvedActiveSource.feedUrl
                            : connectionPhase === 'mirror_active'
                              ? resolvedActiveSource.feedUrl
                              : disconnectReason || 'Primary stream carrier interrupted'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {connectionPhase === 'mirror_active' ? (
                        <button
                          type="button"
                          onClick={handleRestorePrimary}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-100 text-[10.5px] font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore Primary</span>
                        </button>
                      ) : connectionPhase === 'disconnected' || connectionPhase === 'failed' ? (
                        <>
                          <button
                            type="button"
                            onClick={handleManualReconnect}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10.5px] font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>
                              {resolvedActiveSource.nextMirrorEndpoint
                                ? 'Use Secondary Mirror'
                                : 'Retry Primary'}
                            </span>
                          </button>
                          {connectionPhase === 'failed' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectStreamSource(
                                  activeStreamSource === 'web' ? 'fiber' : 'web'
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-600 text-slate-100 text-[10.5px] font-bold whitespace-nowrap cursor-pointer"
                            >
                              Switch Source
                            </button>
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Live IRC Client Overlay Rendered Directly On Video Player */}
              <NewsVideoIrcOverlay
                overlaySlot="primary"
                accentTone="purple"
                isDualActive={isDualIrcExpanded}
                session={effectiveIrcSession}
                tunedOutlet={tunedOutlet}
                activeRank={activeRank}
                activeSourceType={activeStreamSource}
                activeSourceLabel={resolvedActiveSource.profile.label}
                activeSourceProtocol={resolvedActiveSource.profile.protocol}
                activeFeedUrl={resolvedActiveSource.feedUrl}
                activeMirrorLabel={resolvedActiveSource.activeEndpoint.label}
                connectionPhase={connectionPhase}
                lastReconnectEvent={reconnectLog[0] || null}
                onChangeBoundSource={showSecondIrcOverlay ? handleSelectStreamSource : undefined}
                isOpen={showIrcOverlay}
                isMinimized={isIrcOverlayMinimized}
                position={ircOverlayPosition}
                opacityMode={ircOverlayOpacity}
                onToggleOpen={(open) => {
                  setShowIrcOverlay(open);
                  if (open) setIsIrcOverlayMinimized(false);
                }}
                onToggleMinimized={() => setIsIrcOverlayMinimized((v) => !v)}
                onTogglePosition={() => setIrcOverlayPosition((p) => (p === 'right' ? 'left' : 'right'))}
                onToggleOpacity={() => setIrcOverlayOpacity((o) => cycleOverlayOpacity(o))}
                onUpdateSession={onUpdateIrcSession}
                onOpenLoginModal={onOpenIrcLogin}
                onNavigateToFullIrc={onNavigateToIrc}
                onTuneByCallSign={handleTuneByCallSign}
                onSelectSource={handleSelectStreamSource}
                onSimulateDisconnect={() =>
                  handleStreamDisconnectDetected(
                    `Primary ${resolvedActiveSource.profile.label} stream dropped via IRC /drop`
                  )
                }
                onManualReconnect={handleManualReconnect}
              />

              {/* Secondary Transparent IRC Client Overlay for Side-by-Side Multi-Source Chat */}
              <NewsVideoIrcOverlay
                overlaySlot="secondary"
                overlayTitle="IRC #2"
                defaultChannel="#satcom-news"
                accentTone="cyan"
                isDualActive={isDualIrcExpanded}
                session={effectiveIrcSession}
                tunedOutlet={tunedOutlet}
                activeRank={activeRank}
                activeSourceType={secondIrcSourceType}
                activeSourceLabel={resolvedSecondaryIrcSource.profile.label}
                activeSourceProtocol={resolvedSecondaryIrcSource.profile.protocol}
                activeFeedUrl={resolvedSecondaryIrcSource.feedUrl}
                activeMirrorLabel={resolvedSecondaryIrcSource.activeEndpoint.label}
                connectionPhase="connected"
                onChangeBoundSource={(nextSource) => {
                  setSecondIrcSourceType(nextSource);
                  const nextLabel =
                    NEWS_STREAM_SOURCE_PROFILES.find((p) => p.id === nextSource)?.label || nextSource;
                  showNotice(
                    `2nd IRC Overlay bound to ${nextLabel} feed for ${tunedOutlet.callSign}`
                  );
                }}
                isOpen={showSecondIrcOverlay}
                isMinimized={isSecondIrcMinimized}
                position={secondIrcPosition}
                opacityMode={secondIrcOpacity}
                onToggleOpen={(open) => {
                  setShowSecondIrcOverlay(open);
                  if (open) setIsSecondIrcMinimized(false);
                }}
                onToggleMinimized={() => setIsSecondIrcMinimized((v) => !v)}
                onTogglePosition={() => setIrcOverlayPosition((p) => (p === 'right' ? 'left' : 'right'))}
                onToggleOpacity={() => setSecondIrcOpacity((o) => cycleOverlayOpacity(o))}
                onOpenLoginModal={onOpenIrcLogin}
                onNavigateToFullIrc={onNavigateToIrc}
                onTuneByCallSign={handleTuneByCallSign}
                onSelectSource={(nextSource) => setSecondIrcSourceType(nextSource)}
              />

              {/* Captions & Player Transport */}
              <div className="space-y-2.5 pt-2 z-20">
                {showCaptions && (
                  <div
                    className={`bg-black/80 border border-slate-800 rounded-lg px-3.5 py-1.5 text-xs font-mono text-white text-center truncate ${
                      isDualIrcExpanded
                        ? ''
                        : isPrimaryIrcExpanded
                          ? ircOverlayPosition === 'right'
                            ? 'md:mr-[350px]'
                            : 'md:ml-[350px]'
                          : isSecondaryIrcExpanded
                            ? secondIrcPosition === 'right'
                              ? 'md:mr-[350px]'
                              : 'md:ml-[350px]'
                            : ''
                    }`}
                  >
                    [CC · {tunedOutlet.callSign} · {resolvedActiveSource.profile.shortLabel}] {tunedOutlet.headline}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPlayerPlaying((p) => !p)}
                      className="p-2 rounded-full bg-white text-slate-950 hover:bg-slate-200 cursor-pointer"
                      aria-label={isPlayerPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlayerPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMuted((m) => !m)}
                      className="p-2 rounded-full bg-slate-900 text-slate-200 border border-slate-800 cursor-pointer"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <DrFun1AudioNormalizerControl
                      tunedOutlet={tunedOutlet}
                      activeSourceType={activeStreamSource}
                      activeSourceLabel={resolvedActiveSource.profile.label}
                      config={audioNormConfig}
                      telemetry={audioNormTelemetry}
                      isMuted={isMuted}
                      isAudioMonitorActive={isAudioMonitorActive}
                      popoverAlignment="bottom-overlay"
                      onUpdateConfig={handleUpdateAudioNormConfig}
                      onSelectPreset={handleSelectAudioNormPreset}
                      onToggleMuted={() => setIsMuted((m) => !m)}
                      onToggleAudioMonitor={handleToggleAudioMonitor}
                      onSelectSource={handleSelectStreamSource}
                    />

                    <button
                      type="button"
                      onClick={() => setShowCaptions((c) => !c)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1 cursor-pointer ${
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
                      onClick={() => {
                        setShowIrcOverlay((v) => !v);
                        setIsIrcOverlayMinimized(false);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        showIrcOverlay
                          ? 'bg-purple-600 text-white border-purple-400'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                      title="Toggle Primary Live IRC Client Overlay on Video Player"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{showIrcOverlay ? 'IRC #1: ON' : 'Show IRC #1'}</span>
                    </button>

                    <button
                      type="button"
                      aria-pressed={showSecondIrcOverlay}
                      onClick={() => {
                        setShowSecondIrcOverlay((prev) => {
                          const next = !prev;
                          if (next) {
                            setIsSecondIrcMinimized(false);
                            setSecondIrcOpacity('transparent');
                            if (secondIrcSourceType === activeStreamSource) {
                              setSecondIrcSourceType(activeStreamSource === 'web' ? 'satellite' : 'web');
                            }
                            showNotice(
                              'Added 2nd transparent IRC overlay for side-by-side multi-source chat'
                            );
                          }
                          return next;
                        });
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        showSecondIrcOverlay
                          ? 'bg-cyan-600 text-slate-950 border-cyan-400'
                          : 'bg-slate-900 text-cyan-300 border-slate-700 hover:border-cyan-500/60 hover:text-cyan-200'
                      }`}
                      title="Add a second transparent IRC overlay for side-by-side chat across multiple streaming sources"
                    >
                      <Columns2 className="w-3.5 h-3.5" />
                      <span>{showSecondIrcOverlay ? '2nd IRC: ON' : '+ 2nd IRC'}</span>
                    </button>

                    <NewsVideoStreamRecorder
                      tunedOutlet={tunedOutlet}
                      activeSourceLabel={resolvedActiveSource.profile.label}
                      activeSourceProtocol={resolvedActiveSource.profile.protocol}
                      activeFeedUrl={resolvedActiveSource.feedUrl}
                      activeRouteLabel={resolvedActiveSource.routeLabel}
                      effectiveBitrateMbps={resolvedActiveSource.effectiveBitrateMbps}
                      latencyMs={resolvedActiveSource.latencyMs}
                      connectionPhase={connectionPhase}
                      clips={archivedClips}
                      onClipSaved={handleClipSaved}
                      onDeleteClip={handleDeleteArchivedClip}
                      onClearBuffer={handleClearArchivedClips}
                      onOpenArchiveTab={() => setActiveNewsTab('archive')}
                      onRecordingStateChange={handleRecordingStateChange}
                      onNotify={showNotice}
                    />

                    <NewsVideoQualitySelector
                      options={resolvedActiveSource.qualityOptions}
                      activeQuality={resolvedActiveSource.activeQuality}
                      preferredTier={selectedQualityTier}
                      sourceLabel={resolvedActiveSource.profile.label}
                      codecLabel={resolvedActiveSource.profile.codecLabel}
                      menuPlacement="up"
                      onSelectQuality={handleSelectQualityTier}
                    />

                    <button
                      type="button"
                      aria-pressed={pipMode !== 'off'}
                      onClick={() => void handleTogglePictureInPicture()}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        pipMode !== 'off'
                          ? 'bg-cyan-600 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-950/50'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-cyan-400/60'
                      }`}
                      title={
                        pipMode !== 'off'
                          ? 'Exit Picture-in-Picture pop-out mode'
                          : 'Pop out active news stream into browser native Picture-in-Picture'
                      }
                    >
                      <PictureInPicture2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{pipMode !== 'off' ? 'Pop-out: ON' : 'Pop-out'}</span>
                    </button>
                  </div>

                  <a
                    href={tunedOutlet.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5"
                  >
                    <span>Official Outlet Site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Watch History Sidebar & Newsroom Producer Flash Desk */}
          <div className="xl:col-span-4 space-y-5">
            <DrFun1NewsWatchHistorySidebar
              entries={watchHistory}
              activeOutletId={tunedOutlet.id}
              activeSourceType={activeStreamSource}
              nowTick={liveTick}
              onSelectEntry={handleJumpToWatchHistory}
              onRemoveEntry={handleRemoveWatchHistoryEntry}
              onClearHistory={handleClearWatchHistory}
            />

            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-400" />
                  <h3 className="text-sm font-bold text-white">DrFun1 News Producer Desk</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {activeBreakingCount} Breaking Desks
                </span>
              </div>

              <form onSubmit={handlePublishBulletin} className="space-y-2.5">
                <textarea
                  rows={2}
                  value={bulletinText}
                  onChange={(e) => setBulletinText(e.target.value)}
                  placeholder={`Push breaking news chyron for ${tunedOutlet.callSign} or World Desk...`}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/60"
                />
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={bulletinPriority}
                    onChange={(e) => setBulletinPriority(e.target.value as DrFun1NewsBulletin['priority'])}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                  >
                    <option value="FLASH">FLASH</option>
                    <option value="URGENT">URGENT</option>
                    <option value="WORLD DESK">WORLD DESK</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Push Bulletin</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 pt-2 border-t border-slate-800">
                {bulletins.map((b) => (
                  <div key={b.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold">
                        {b.priority} · {b.outletCallSign}
                      </span>
                      <span className="text-slate-500">{b.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{b.headline}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 4-Outlet Global News Anchor Quad + Dual Transparent IRC Overlays + Watch History Sidebar */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          <div className="xl:col-span-9 space-y-3">
            {/* Multi-Stream Quad IRC Overlay Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <LayoutGrid className="w-3.5 h-3.5 text-red-400" />
                <span className="font-bold text-white">4-Outlet Multi-Stream Wall</span>
                <span className="text-slate-500 hidden sm:inline">
                  · Overlay side-by-side transparent IRC chats across live sources
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DrFun1AudioNormalizerControl
                  tunedOutlet={activeAudioOutlet}
                  activeSourceType={activeStreamSource}
                  activeSourceLabel={resolvedActiveSource.profile.label}
                  config={audioNormConfig}
                  telemetry={audioNormTelemetry}
                  isMuted={isMuted}
                  isAudioMonitorActive={isAudioMonitorActive}
                  compactTrigger
                  popoverAlignment="dropdown"
                  onUpdateConfig={handleUpdateAudioNormConfig}
                  onSelectPreset={handleSelectAudioNormPreset}
                  onToggleMuted={() => setIsMuted((m) => !m)}
                  onToggleAudioMonitor={handleToggleAudioMonitor}
                  onSelectSource={handleSelectStreamSource}
                />
                <NewsVideoQualitySelector
                  options={resolvedActiveSource.qualityOptions}
                  activeQuality={resolvedActiveSource.activeQuality}
                  preferredTier={selectedQualityTier}
                  sourceLabel={resolvedActiveSource.profile.label}
                  codecLabel={resolvedActiveSource.profile.codecLabel}
                  menuPlacement="down"
                  compact
                  onSelectQuality={handleSelectQualityTier}
                />
                <button
                  type="button"
                  aria-pressed={pipMode !== 'off'}
                  onClick={() => void handleTogglePictureInPicture()}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    pipMode !== 'off'
                      ? 'bg-cyan-600 text-slate-950 border-cyan-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-cyan-400/60'
                  }`}
                  title="Pop out active Quad audio stream into Picture-in-Picture"
                >
                  <PictureInPicture2 className="w-3.5 h-3.5" />
                  <span>{pipMode !== 'off' ? 'Pop-out: ON' : 'Pop-out'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowIrcOverlay((v) => !v);
                    setIsIrcOverlayMinimized(false);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    showIrcOverlay
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{showIrcOverlay ? 'IRC #1: ON' : 'Show IRC #1'}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={showSecondIrcOverlay}
                  onClick={() => {
                    setShowSecondIrcOverlay((prev) => {
                      const next = !prev;
                      if (next) {
                        setIsSecondIrcMinimized(false);
                        setSecondIrcOpacity('transparent');
                        showNotice('Enabled side-by-side 2nd transparent IRC overlay on 4-Outlet Quad');
                      }
                      return next;
                    });
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    showSecondIrcOverlay
                      ? 'bg-cyan-600 text-slate-950 border-cyan-400'
                      : 'bg-slate-900 text-cyan-300 border-slate-700 hover:border-cyan-500/60'
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  <span>{showSecondIrcOverlay ? '2nd IRC: ON' : '+ 2nd IRC'}</span>
                </button>
              </div>
            </div>

            <div className="relative space-y-2.5">
              <DrFun1SatelliteAlertOverlayBadges
                alerts={satelliteAlerts}
                alertsEnabled={satelliteAlertsEnabled}
                onInspectAlert={handleInspectSatelliteAlert}
                onDismissOverlay={handleDismissSatelliteAlertOverlay}
                onOpenAlertCenter={() => setShowSatelliteAlertCenter(true)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quadOutlets.map((outlet, idx) => {
                  const hasAudio = quadAudioSlot === idx;
                  return (
                    <div
                      key={`${outlet.id}-${idx}`}
                      onClick={() => setQuadAudioSlot(idx)}
                      className={`rounded-2xl p-4 sm:p-5 min-h-[240px] flex flex-col justify-between bg-gradient-to-br from-[#19090d] via-slate-950 to-[#0a1324] border-2 transition cursor-pointer shadow-xl ${
                        hasAudio ? 'border-red-500 ring-2 ring-red-500/30' : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded text-[11px] font-black text-slate-950"
                            style={{ backgroundColor: outlet.accentColor }}
                          >
                            {outlet.callSign}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{outlet.country}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={outlet.id}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const next = [...quadOutletIds];
                              next[idx] = e.target.value;
                              setQuadOutletIds(next);
                            }}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-200"
                          >
                            {allOutlets.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.callSign} ({opt.region})
                              </option>
                            ))}
                          </select>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              hasAudio ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {hasAudio ? 'AUDIO' : 'MUTED'}
                          </span>
                        </div>
                      </div>

                      <div className="my-3 space-y-1">
                        <h4 className="text-base font-black text-white">{outlet.currentProgram}</h4>
                        <p className="text-xs text-slate-300 line-clamp-2">{outlet.headline}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-emerald-300 tabular-nums shrink-0">{outlet.viewers.toLocaleString()} live</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-cyan-300 truncate">
                            {resolvedActiveSource.profile.label} · {+(outlet.bitrateMbps * resolvedActiveSource.profile.bitrateMultiplier).toFixed(1)} Mbps
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTunedOutletId(outlet.id);
                            setViewMode('theater');
                          }}
                          className="text-red-400 hover:text-red-300 font-bold cursor-pointer shrink-0 ml-2"
                        >
                          Open Full Desk →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Side-by-Side Transparent IRC Overlays Mounted Over 4-Outlet Quad */}
              <NewsVideoIrcOverlay
                overlaySlot="primary"
                accentTone="purple"
                isDualActive={isDualIrcExpanded}
                session={effectiveIrcSession}
                tunedOutlet={quadOutlets[quadAudioSlot] || tunedOutlet}
                activeRank={activeRank}
                activeSourceType={activeStreamSource}
                activeSourceLabel={resolvedActiveSource.profile.label}
                activeSourceProtocol={resolvedActiveSource.profile.protocol}
                activeFeedUrl={resolvedActiveSource.feedUrl}
                activeMirrorLabel={resolvedActiveSource.activeEndpoint.label}
                connectionPhase={connectionPhase}
                onChangeBoundSource={showSecondIrcOverlay ? handleSelectStreamSource : undefined}
                isOpen={showIrcOverlay}
                isMinimized={isIrcOverlayMinimized}
                position={ircOverlayPosition}
                opacityMode={ircOverlayOpacity}
                onToggleOpen={(open) => {
                  setShowIrcOverlay(open);
                  if (open) setIsIrcOverlayMinimized(false);
                }}
                onToggleMinimized={() => setIsIrcOverlayMinimized((v) => !v)}
                onTogglePosition={() => setIrcOverlayPosition((p) => (p === 'right' ? 'left' : 'right'))}
                onToggleOpacity={() => setIrcOverlayOpacity((o) => cycleOverlayOpacity(o))}
                onUpdateSession={onUpdateIrcSession}
                onOpenLoginModal={onOpenIrcLogin}
                onNavigateToFullIrc={onNavigateToIrc}
                onTuneByCallSign={handleTuneByCallSign}
                onSelectSource={handleSelectStreamSource}
              />

              <NewsVideoIrcOverlay
                overlaySlot="secondary"
                overlayTitle="IRC #2"
                defaultChannel="#satcom-news"
                accentTone="cyan"
                isDualActive={isDualIrcExpanded}
                session={effectiveIrcSession}
                tunedOutlet={quadOutlets[(quadAudioSlot + 1) % quadOutlets.length] || tunedOutlet}
                activeRank={activeRank}
                activeSourceType={secondIrcSourceType}
                activeSourceLabel={resolvedSecondaryIrcSource.profile.label}
                activeSourceProtocol={resolvedSecondaryIrcSource.profile.protocol}
                activeFeedUrl={resolvedSecondaryIrcSource.feedUrl}
                activeMirrorLabel={resolvedSecondaryIrcSource.activeEndpoint.label}
                connectionPhase="connected"
                onChangeBoundSource={(nextSource) => {
                  setSecondIrcSourceType(nextSource);
                  const nextLabel =
                    NEWS_STREAM_SOURCE_PROFILES.find((p) => p.id === nextSource)?.label || nextSource;
                  showNotice(`2nd IRC Overlay bound to ${nextLabel} feed`);
                }}
                isOpen={showSecondIrcOverlay}
                isMinimized={isSecondIrcMinimized}
                position={secondIrcPosition}
                opacityMode={secondIrcOpacity}
                onToggleOpen={(open) => {
                  setShowSecondIrcOverlay(open);
                  if (open) setIsSecondIrcMinimized(false);
                }}
                onToggleMinimized={() => setIsSecondIrcMinimized((v) => !v)}
                onTogglePosition={() => setIrcOverlayPosition((p) => (p === 'right' ? 'left' : 'right'))}
                onToggleOpacity={() => setSecondIrcOpacity((o) => cycleOverlayOpacity(o))}
                onOpenLoginModal={onOpenIrcLogin}
                onNavigateToFullIrc={onNavigateToIrc}
                onTuneByCallSign={handleTuneByCallSign}
                onSelectSource={(nextSource) => setSecondIrcSourceType(nextSource)}
              />
            </div>
          </div>
          <div className="xl:col-span-3">
            <DrFun1NewsWatchHistorySidebar
              entries={watchHistory}
              activeOutletId={tunedOutlet.id}
              activeSourceType={activeStreamSource}
              nowTick={liveTick}
              onSelectEntry={handleJumpToWatchHistory}
              onRemoveEntry={handleRemoveWatchHistoryEntry}
              onClearHistory={handleClearWatchHistory}
            />
          </div>
        </div>
      )}
      </div>

      {/* ================================================================
          2A. 33+ WORLD NEWS OUTLETS ELECTRONIC PROGRAM GUIDE (EPG)
          ================================================================ */}
      <div ref={epgSectionRef}>
        <DrFun1NewsEpgSection
          allOutlets={allOutlets}
          filteredOutlets={filteredOutlets}
          activeMapRegion={regionFilter}
          tunedOutletId={tunedOutlet.id}
          epgSyncSnapshot={epgSyncSnapshot}
          isSyncingEpg={isSyncingEpg}
          epgAutoSyncEnabled={epgAutoSyncEnabled}
          epgCountdownSec={epgCountdownSec}
          onSyncEpg={() => runEpgSync('manual')}
          onToggleAutoSync={() => {
            setEpgAutoSyncEnabled((prev) => {
              const next = !prev;
              showNotice(
                next
                  ? 'EPG Auto-Sync enabled — refreshing 33-channel schedule every 15 minutes'
                  : 'EPG Auto-Sync paused — use Sync EPG to refresh manually'
              );
              return next;
            });
          }}
          onTuneOutlet={(outlet) => {
            setTunedOutletId(outlet.id);
            setViewMode('theater');
            setIsPlayerPlaying(true);
            showNotice(`Tuned DrFun1 News EPG to ${outlet.name} (${outlet.country})`);
            playerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          onNotify={showNotice}
        />
      </div>

      {/* ================================================================
          2B. D3 INTERACTIVE GLOBAL NEWS COVERAGE WORLD MAP
          ================================================================ */}
      <DrFun1NewsWorldMap
        allOutlets={allOutlets}
        filteredOutlets={filteredOutlets}
        activeRegion={regionFilter}
        onSelectRegion={handleSelectRegionFromMap}
        tunedOutlet={tunedOutlet}
        onTuneOutlet={(outlet) => {
          setTunedOutletId(outlet.id);
          setViewMode('theater');
          setIsPlayerPlaying(true);
          showNotice(`Tuned DrFun1 News Live Desk to ${outlet.name} (${outlet.country})`);
        }}
        onJumpToDirectory={() =>
          directorySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      />

      {/* ================================================================
          3. DYNAMIC GLOBAL NEWS OUTLETS DIRECTORY ({allOutlets.length} OUTLETS)
          ================================================================ */}
      <div
        ref={directorySectionRef}
        className={`bg-slate-900/95 border rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl transition-colors ${
          mapFilterSynced && regionFilter !== 'All'
            ? 'border-red-500/60 ring-1 ring-red-500/30'
            : 'border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Dynamic Global News Outlets Directory ({filteredOutlets.length} / {allOutlets.length})</span>
              </h2>
              {regionFilter !== 'All' && (
                <span className="px-2 py-0.5 rounded-md bg-red-600/20 border border-red-500/50 text-red-300 text-[10px] font-mono font-bold flex items-center gap-1.5">
                  <span>{mapFilterSynced ? `D3 Map Filtered: ${regionFilter}` : `Region: ${regionFilter}`}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRegionFilter('All');
                      setMapFilterSynced(false);
                    }}
                    className="underline hover:text-white cursor-pointer"
                  >
                    Clear
                  </button>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatically synchronized with the D3 World Map — click any outlet to tune DrFun1 News live TV desk or register additional worldwide broadcasters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setBreakingOnly((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                breakingOnly
                  ? 'bg-red-600/20 text-red-300 border-red-500/50'
                  : 'bg-slate-950 text-slate-300 border-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Breaking ({activeBreakingCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setBookmarkedOnly((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                bookmarkedOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-950 text-slate-300 border-slate-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Saved ({bookmarkedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddOutlet((v) => !v)}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Global News Outlet</span>
            </button>
          </div>
        </div>

        {/* Add Global News Outlet Form */}
        {showAddOutlet && (
          <form
            onSubmit={handleAddOutlet}
            className="p-4 rounded-xl bg-slate-950 border border-red-500/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs"
          >
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Outlet Name (e.g. TV5Monde Info)"
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500"
            />
            <input
              type="text"
              required
              value={newCallSign}
              onChange={(e) => setNewCallSign(e.target.value)}
              placeholder="CallSign Badge (e.g. TV5MONDE)"
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500"
            />
            <input
              type="text"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              placeholder="Country / Bureau City"
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500"
            />
            <select
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value as NewsOutletRegion)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
            >
              {REGIONS.filter((r) => r !== 'All').map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as NewsOutletCategory)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newWebsite}
              onChange={(e) => setNewWebsite(e.target.value)}
              placeholder="Website URL (https://...)"
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500"
            />
            <input
              type="text"
              value={newProgram}
              onChange={(e) => setNewProgram(e.target.value)}
              placeholder="Current Live Show Title"
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500"
            />
            <input
              type="text"
              value={newSecondaryMirrorUrl}
              onChange={(e) => setNewSecondaryMirrorUrl(e.target.value)}
              placeholder="Secondary Mirror URL (optional, e.g. https://mirror...m3u8)"
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddOutlet(false)}
                className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
              >
                Save &amp; Tune Outlet
              </button>
            </div>
          </form>
        )}

        {/* Search, Sort & Region Filter Strip */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any global news outlet, country, bureau city, language, or breaking headline..."
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'All' | NewsOutletCategory)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>

              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as OutletSortMode)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono cursor-pointer"
              >
                <option value="viewers">Sort: Most Viewers</option>
                <option value="breaking">Sort: Breaking First</option>
                <option value="region">Sort: Region</option>
                <option value="alpha">Sort: Name A–Z</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {REGIONS.map((reg) => {
              const count =
                reg === 'All'
                  ? allOutlets.length
                  : allOutlets.filter((o) => o.region === reg).length;
              return (
                <button
                  key={reg}
                  type="button"
                  onClick={() => {
                    setRegionFilter(reg);
                    setMapFilterSynced(false);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition cursor-pointer ${
                    regionFilter === reg
                      ? 'bg-white text-slate-950'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {reg} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Outlets Cards List */}
        {filteredOutlets.length === 0 ? (
          <div className="py-10 px-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
            <div className="text-sm font-semibold text-white">
              No news outlets match the current filters ({regionFilter}).
            </div>
            <button
              type="button"
              onClick={() => {
                setRegionFilter('All');
                setCategoryFilter('All');
                setSearchQuery('');
                setBreakingOnly(false);
                setBookmarkedOnly(false);
                setMapFilterSynced(false);
              }}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
            >
              Reset All Directory Filters
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOutlets.map((outlet) => {
            const isTuned = tunedOutlet.id === outlet.id;
            const isBookmarked = bookmarkedIds.includes(outlet.id);
            return (
              <div
                key={outlet.id}
                className={`rounded-xl p-4 border flex flex-col justify-between gap-3 transition ${
                  isTuned
                    ? 'bg-red-950/25 border-red-500/70 shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-black text-slate-950 shrink-0"
                        style={{ backgroundColor: outlet.accentColor }}
                      >
                        {outlet.callSign}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 truncate">
                        {outlet.country} · {outlet.region}
                      </span>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold shrink-0 ${
                        outlet.status === 'ON AIR'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {outlet.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug flex items-center gap-2">
                      <span className="truncate">{outlet.name}</span>
                      {outlet.isBreaking && (
                        <span className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-mono font-bold shrink-0">
                          BREAKING
                        </span>
                      )}
                    </h4>
                    <div className="text-[11px] font-mono text-cyan-300 mt-0.5 truncate">
                      {outlet.currentProgram}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {outlet.headline}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="truncate">{outlet.category} · {outlet.language}</span>
                    <span className="text-emerald-300 font-bold tabular-nums shrink-0">
                      {outlet.viewers.toLocaleString()} live
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setTunedOutletId(outlet.id);
                        setViewMode('theater');
                        setIsPlayerPlaying(true);
                        showNotice(`Tuned DrFun1 News Live Desk to ${outlet.name}`);
                      }}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                        isTuned
                          ? 'bg-red-600 text-white'
                          : 'bg-white hover:bg-slate-200 text-slate-950'
                      }`}
                    >
                      <MonitorPlay className="w-3.5 h-3.5" />
                      <span>{isTuned ? 'Watching Now' : 'Watch on DrFun1 News'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setStatusOverrides((prev) => ({
                          ...prev,
                          [outlet.id]: {
                            ...prev[outlet.id],
                            breaking: !outlet.isBreaking,
                          },
                        }))
                      }
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-mono font-bold cursor-pointer ${
                        outlet.isBreaking
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      title="Toggle Breaking News Priority"
                    >
                      <Radio className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(outlet.id)}
                      className={`px-2 py-1.5 rounded-lg border cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Save Outlet'}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>

                    {outlet.isUserAdded && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomOutlets((prev) => prev.filter((x) => x.id !== outlet.id));
                          if (tunedOutletId === outlet.id) setTunedOutletId('news-drfun1-hq');
                          showNotice(`Removed custom outlet ${outlet.name}`);
                        }}
                        className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 cursor-pointer"
                        title="Delete custom outlet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
      </div>
    </div>
  );
};
