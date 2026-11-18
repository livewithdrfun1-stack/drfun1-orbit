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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Bookmark,
  CalendarClock,
  Captions,
  Check,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  LayoutGrid,
  MonitorPlay,
  Newspaper,
  Pause,
  Play,
  Plus,
  Radio,
  Rss,
  Search,
  Send,
  ShieldCheck,
  Terminal,
  Trash2,
  Tv,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  GLOBAL_NEWS_OUTLETS,
  INITIAL_DRFUN1_NEWS_BULLETINS,
} from '../data/drfun1NewsData';
import {
  DrFun1NewsBulletin,
  GlobalNewsOutlet,
  NewsOutletCategory,
  NewsOutletRegion,
} from '../types/drfun1News';
import { IrcLoginSession } from '../types/irc';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { DrFun1NewsWorldMap } from './DrFun1NewsWorldMap';
import { DrFun1NewsEpgSection } from './DrFun1NewsEpgSection';
import { NewsVideoIrcOverlay } from './NewsVideoIrcOverlay';

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
type OutletSortMode = 'viewers' | 'alpha' | 'region' | 'breaking';

const STORAGE_KEY_CUSTOM_OUTLETS = 'drfun1_news_custom_outlets_v1';
const STORAGE_KEY_BOOKMARKED_OUTLETS = 'drfun1_news_bookmarked_outlets_v1';
const STORAGE_KEY_BULLETINS = 'drfun1_news_bulletins_v1';

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

  // Integrated IRC Client Overlay on the Video Player
  const [showIrcOverlay, setShowIrcOverlay] = useState<boolean>(true);
  const [isIrcOverlayMinimized, setIsIrcOverlayMinimized] = useState<boolean>(false);
  const [ircOverlayPosition, setIrcOverlayPosition] = useState<'right' | 'left'>('right');
  const [ircOverlayOpacity, setIrcOverlayOpacity] = useState<'translucent' | 'solid'>('translucent');

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
  const [newProgram, setNewProgram] = useState<string>('Live World Desk');

  // Producer Bulletin Composer
  const [bulletinText, setBulletinText] = useState<string>('');
  const [bulletinPriority, setBulletinPriority] = useState<DrFun1NewsBulletin['priority']>('FLASH');

  // Toast & Copy State with Ref cleanup
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
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

  const quadOutlets = useMemo(
    () =>
      quadOutletIds
        .map((id) => allOutlets.find((o) => o.id === id))
        .filter((o): o is GlobalNewsOutlet => Boolean(o)),
    [allOutlets, quadOutletIds]
  );

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

  const currentTickerHeadline = useMemo(() => {
    const combined = [
      ...bulletins.map((b) => `[${b.priority} · ${b.outletCallSign}] ${b.headline}`),
      ...allOutlets
        .filter((o) => o.isBreaking)
        .map((o) => `[BREAKING · ${o.callSign} (${o.country})] ${o.headline}`),
    ];
    if (combined.length === 0) return `[DRFUN1 NEWS] Monitoring ${allOutlets.length} global television news feeds.`;
    return combined[liveTick % combined.length];
  }, [bulletins, allOutlets, liveTick]);

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
              onClick={() =>
                epgSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>{allOutlets.length}-Outlet EPG</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode((v) => (v === 'theater' ? 'quad' : 'theater'))}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'quad'
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

        {/* Breaking Chyron Ticker */}
        <div className="mt-4 rounded-xl bg-red-950/60 border border-red-500/40 px-3.5 py-2 flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-black uppercase shrink-0 animate-pulse">
            BREAKING WIRE
          </span>
          <div className="text-xs font-mono text-white truncate flex-1">
            {currentTickerHeadline}
          </div>
          <span className="hidden sm:inline text-[10px] font-mono text-amber-300 shrink-0 tabular-nums">
            {totalLiveViewers.toLocaleString()} Watching Worldwide
          </span>
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

      {/* ================================================================
          2. DRFUN1 NEWS LIVE TV DESK (THEATER OR 4-OUTLET ANCHOR QUAD)
          ================================================================ */}
      <div ref={playerSectionRef}>
      {viewMode === 'theater' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Broadcast Stage */}
          <div className="xl:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative min-h-[390px] sm:min-h-[430px] md:aspect-video bg-gradient-to-br from-[#1b080c] via-slate-950 to-[#091529] p-4 sm:p-6 flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 z-10">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 rounded-md font-black text-xs text-slate-950 shadow"
                    style={{ backgroundColor: tunedOutlet.accentColor }}
                  >
                    {tunedOutlet.callSign}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-red-600 text-white text-[11px] font-mono font-bold flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full bg-white ${isPlayerPlaying ? 'animate-pulse' : ''}`} />
                    <span>{tunedOutlet.status}</span>
                  </span>
                  <span className="px-2 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-[11px] font-mono text-slate-200">
                    {tunedOutlet.codec} · {tunedOutlet.bitrateMbps} Mbps
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
                    onClick={() => handleCopy(tunedOutlet.hlsFeedUrl, 'hls-tuned')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'hls-tuned' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'hls-tuned' ? 'HLS Copied' : 'Copy HLS'}</span>
                  </button>
                </div>
              </div>

              {/* Main Program Headline & Anchor Info (shifts cleanly so open IRC overlay never blocks headline text) */}
              <div
                className={`my-auto py-3 space-y-2.5 text-center max-w-2xl mx-auto transition-all ${
                  showIrcOverlay && !isIrcOverlayMinimized
                    ? ircOverlayPosition === 'right'
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
                  <span className="text-cyan-300">{tunedOutlet.switchIngestPop}</span>
                </div>
              </div>

              {/* Live IRC Client Overlay Rendered Directly On Video Player */}
              <NewsVideoIrcOverlay
                session={effectiveIrcSession}
                tunedOutlet={tunedOutlet}
                activeRank={activeRank}
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
                onToggleOpacity={() =>
                  setIrcOverlayOpacity((o) => (o === 'translucent' ? 'solid' : 'translucent'))
                }
                onUpdateSession={onUpdateIrcSession}
                onOpenLoginModal={onOpenIrcLogin}
                onNavigateToFullIrc={onNavigateToIrc}
                onTuneByCallSign={handleTuneByCallSign}
              />

              {/* Captions & Player Transport */}
              <div className="space-y-2.5 pt-2 z-10">
                {showCaptions && (
                  <div
                    className={`bg-black/80 border border-slate-800 rounded-lg px-3.5 py-1.5 text-xs font-mono text-white text-center truncate ${
                      showIrcOverlay && !isIrcOverlayMinimized
                        ? ircOverlayPosition === 'right'
                          ? 'md:mr-[350px]'
                          : 'md:ml-[350px]'
                        : ''
                    }`}
                  >
                    [CC · {tunedOutlet.callSign}] {tunedOutlet.headline}
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
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 cursor-pointer ${
                        showIrcOverlay
                          ? 'bg-purple-600 text-white border-purple-400'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                      title="Toggle Live IRC Client Overlay on Video Player"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{showIrcOverlay ? 'IRC Overlay: ON' : 'Show IRC Overlay'}</span>
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

          {/* Right Column: Newsroom Producer Flash Desk */}
          <div className="xl:col-span-4 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
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
      ) : (
        /* 4-Outlet Global News Anchor Quad */
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
                  <span className="text-emerald-300 tabular-nums">{outlet.viewers.toLocaleString()} live</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTunedOutletId(outlet.id);
                      setViewMode('theater');
                    }}
                    className="text-red-400 hover:text-red-300 font-bold cursor-pointer"
                  >
                    Open Full Desk →
                  </button>
                </div>
              </div>
            );
          })}
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
              className="sm:col-span-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500"
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
  );
};
