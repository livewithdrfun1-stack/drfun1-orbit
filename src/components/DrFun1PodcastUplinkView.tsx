/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * DrFun1 Podcasting Uplink (Podserv.fm Rebrand & Full Hosting Workspace)
 * Provides show management, episode publishing, HTML5 waveform playback,
 * chapters & transcripts, RSS 2.0 / OPML feeds, IAB v2.1 analytics,
 * Dynamic Ad Insertion (DAI), private token feeds, and SATCOM/SHOUTcast/IRC uplinks.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AudioWaveform,
  BarChart3,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileAudio,
  Globe,
  Headphones,
  KeyRound,
  ListMusic,
  Lock,
  Mic,
  Pause,
  Play,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Rss,
  Satellite,
  Search,
  Send,
  Server,
  Share2,
  ShieldCheck,
  Terminal,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { getRankDefinition, hasMinIrcdRank } from '../utils/ircdAccess';
import { IrcdAccessGateBanner } from './IrcdAccessGateBanner';
import {
  PodcastAudioFormat,
  PodcastDaiCampaign,
  PodcastDirectoryListing,
  PodcastEpisode,
  PodcastEpisodeStatus,
  PodcastShow,
  PrivateSubscriberFeed,
} from '../types/podcastUplink';
import {
  ANALYTICS_14D_SERIES,
  INITIAL_DAI_CAMPAIGNS,
  INITIAL_PODCAST_DIRECTORIES,
  INITIAL_PODCAST_EPISODES,
  INITIAL_PODCAST_SHOWS,
  INITIAL_PRIVATE_FEEDS,
  formatDuration,
  generatePodcastOpmlXml,
  generatePodcastRssXml,
} from '../data/podcastUplinkData';

interface DrFun1PodcastUplinkViewProps {
  onOpenLicense?: () => void;
  onNavigateToIrc?: () => void;
  onNavigateToRadio?: () => void;
  activeRank?: AnopeRankLevel;
  onElevateRank?: (rank: AnopeRankLevel) => void;
  onOpenRankMatrix?: () => void;
}

type UplinkWorkspaceTab =
  | 'episodes'
  | 'publish'
  | 'distribution'
  | 'analytics'
  | 'monetization'
  | 'uplink_bridge';

export const DrFun1PodcastUplinkView: React.FC<DrFun1PodcastUplinkViewProps> = ({
  onOpenLicense,
  onNavigateToIrc,
  onNavigateToRadio,
  activeRank = 'op',
  onElevateRank,
  onOpenRankMatrix,
}) => {
  const activeRankDef = getRankDefinition(activeRank);
  const canPublishPodcasts = hasMinIrcdRank(activeRank, 'dj_host');
  const canManageDai = hasMinIrcdRank(activeRank, 'founder');
  const canManageUplinkBridge = hasMinIrcdRank(activeRank, 'techadmin');
  const [shows, setShows] = useState<PodcastShow[]>(INITIAL_PODCAST_SHOWS);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>(INITIAL_PODCAST_EPISODES);
  const [directories, setDirectories] = useState<PodcastDirectoryListing[]>(INITIAL_PODCAST_DIRECTORIES);
  const [daiCampaigns, setDaiCampaigns] = useState<PodcastDaiCampaign[]>(INITIAL_DAI_CAMPAIGNS);
  const [privateFeeds, setPrivateFeeds] = useState<PrivateSubscriberFeed[]>(INITIAL_PRIVATE_FEEDS);

  const [selectedShowId, setSelectedShowId] = useState<string>(INITIAL_PODCAST_SHOWS[0].id);
  const [workspaceTab, setWorkspaceTab] = useState<UplinkWorkspaceTab>('episodes');
  const [episodeSearch, setEpisodeSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | PodcastEpisodeStatus>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Audio Player State
  const [activeEpisodeId, setActiveEpisodeId] = useState<string>(INITIAL_PODCAST_EPISODES[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(112);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState<boolean>(false);
  const [embedModalOpen, setEmbedModalOpen] = useState<boolean>(false);
  const [newShowModalOpen, setNewShowModalOpen] = useState<boolean>(false);

  // New Episode Form State
  const [newEpTitle, setNewEpTitle] = useState<string>('');
  const [newEpSubtitle, setNewEpSubtitle] = useState<string>('');
  const [newEpSummary, setNewEpSummary] = useState<string>('');
  const [newEpSeason, setNewEpSeason] = useState<number>(4);
  const [newEpNumber, setNewEpNumber] = useState<number>(20);
  const [newEpFormat, setNewEpFormat] = useState<PodcastAudioFormat>('MP3 320kbps CBR');
  const [newEpDurationMin, setNewEpDurationMin] = useState<number>(38);
  const [newEpFileName, setNewEpFileName] = useState<string>('master-session-uplink.mp3');
  const [newEpStatus, setNewEpStatus] = useState<PodcastEpisodeStatus>('published');
  const [newEpSyncIrc, setNewEpSyncIrc] = useState<boolean>(true);
  const [newEpSyncShoutcast, setNewEpSyncShoutcast] = useState<boolean>(true);

  // New Show Form State
  const [newShowTitle, setNewShowTitle] = useState<string>('');
  const [newShowAuthor, setNewShowAuthor] = useState<string>('DrFun1 Media Broadcaster');
  const [newShowCategory, setNewShowCategory] = useState<string>('Technology');
  const [newShowDescription, setNewShowDescription] = useState<string>('');

  // Private Feed Form State
  const [newPrivEmail, setNewPrivEmail] = useState<string>('');
  const [newPrivLabel, setNewPrivLabel] = useState<string>('');

  // Web Audio subtle studio confirmation pulse on play
  const audioCtxRef = useRef<AudioContext | null>(null);

  const activeShow = useMemo(
    () => shows.find((s) => s.id === selectedShowId) || shows[0],
    [shows, selectedShowId]
  );

  const showEpisodes = useMemo(
    () =>
      episodes.filter((ep) => {
        if (ep.showId !== activeShow.id) return false;
        if (statusFilter !== 'all' && ep.status !== statusFilter) return false;
        if (episodeSearch.trim()) {
          const q = episodeSearch.toLowerCase();
          return (
            ep.title.toLowerCase().includes(q) ||
            ep.subtitle.toLowerCase().includes(q) ||
            ep.summary.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [episodes, activeShow.id, statusFilter, episodeSearch]
  );

  const activeEpisode = useMemo(
    () => episodes.find((e) => e.id === activeEpisodeId) || showEpisodes[0] || episodes[0],
    [episodes, activeEpisodeId, showEpisodes]
  );

  const generatedRssXml = useMemo(
    () => generatePodcastRssXml(activeShow, episodes.filter((e) => e.showId === activeShow.id)),
    [activeShow, episodes]
  );

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3200);
  };

  const handleCopy = (text: string, id: string, label?: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (label) showToast(`Copied ${label} to clipboard`);
  };

  // Smooth playback scrubber progression
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTimeSec((prev) => {
        const next = prev + playbackRate;
        if (next >= activeEpisode.durationSec) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, playbackRate, activeEpisode.durationSec]);

  const handleTogglePlayEpisode = (ep: PodcastEpisode) => {
    if (activeEpisode.id === ep.id) {
      setIsPlaying((p) => !p);
    } else {
      setActiveEpisodeId(ep.id);
      setCurrentTimeSec(0);
      setIsPlaying(true);
    }

    if (!isMuted) {
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (Ctx) {
          if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
          const ctx = audioCtxRef.current;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.018, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }
      } catch (_) {}
    }
  };

  const waveformBars = useMemo(() => {
    const seed = activeEpisode.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return Array.from({ length: 48 }, (_, i) => {
      const val = Math.abs(Math.sin((i + 1) * 0.45 + seed * 0.13) * 0.65 + Math.cos(i * 0.9) * 0.35);
      return Math.max(18, Math.min(100, Math.round(val * 100)));
    });
  }, [activeEpisode.id]);

  const handlePublishEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEpTitle.trim()) return;

    const cleanSlug = newEpTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);

    const newEp: PodcastEpisode = {
      id: `ep-${Date.now()}`,
      showId: activeShow.id,
      season: newEpSeason,
      episodeNumber: newEpNumber,
      title: newEpTitle.trim(),
      subtitle: newEpSubtitle.trim() || 'Recorded via DrFun1 Podcasting Uplink Studio',
      summary:
        newEpSummary.trim() ||
        `Broadcast uplink published on ${activeShow.title} over Switch SUPERNAP 100G CDN & SATCOM distribution.`,
      status: newEpStatus,
      publishedAt: new Date().toISOString().slice(0, 10),
      durationSec: Math.max(60, newEpDurationMin * 60),
      fileSizeMb: +(newEpDurationMin * 1.44).toFixed(1),
      audioFormat: newEpFormat,
      loudnessLufs: -16.0,
      explicit: false,
      enclosureUrl: `https://cdn.uplink.drfun1media.com/audio/${activeShow.slug}-${cleanSlug || 'episode'}.mp3`,
      downloads: newEpStatus === 'published' ? 1 : 0,
      completionRate: 0,
      chapters: [
        { timeSec: 0, title: 'Opening & Signal Synchronization' },
        { timeSec: Math.round((newEpDurationMin * 60) / 2), title: 'Main Broadcast Segment' },
      ],
      transcript: [
        {
          timeSec: 0,
          speaker: activeShow.author,
          text: `Master uplink initiated for ${newEpTitle.trim()} on DrFun1 Podcasting Uplink.`,
        },
      ],
      daiSlots: { preRoll: activeShow.daiEnabled, midRoll: activeShow.daiEnabled, postRoll: false },
      syncedToIrc: newEpSyncIrc,
      syncedToShoutcast: newEpSyncShoutcast,
    };

    setEpisodes((prev) => [newEp, ...prev]);
    setActiveEpisodeId(newEp.id);
    setNewEpTitle('');
    setNewEpSubtitle('');
    setNewEpSummary('');
    setNewEpNumber((n) => n + 1);
    setWorkspaceTab('episodes');
    showToast(`Episode "${newEp.title}" ${newEpStatus === 'published' ? 'published to RSS 2.0 & WebSub' : 'saved'}.`);
  };

  const handleCreateShow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShowTitle.trim()) return;
    const slug =
      newShowTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `show-${Date.now()}`;

    const created: PodcastShow = {
      id: `show-${Date.now()}`,
      title: newShowTitle.trim(),
      slug,
      tagline: 'Federated on DrFun1 Podcasting Uplink · Switch 100G CDN',
      description:
        newShowDescription.trim() ||
        `${newShowTitle.trim()} hosted on DrFun1 Podcasting Uplink with automatic SATCOM, SHOUTcast & UnrealIRCd syndication.`,
      author: newShowAuthor.trim() || 'DrFun1 Broadcaster',
      email: 'uplink@drfun1media.com',
      category: newShowCategory,
      language: 'en-US',
      explicit: false,
      coverUrl: '/src/assets/images/podcast_broadcast_console_1794713807944.jpg',
      rssUrl: `https://uplink.drfun1media.com/rss/${slug}.xml`,
      customDomain: `podcasts.drfun1media.com/${slug}`,
      copyright: '© 2026 DrFun1 Media Inc. · www.wittlawfirm.com',
      defaultFormat: 'MP3 320kbps CBR',
      daiEnabled: true,
      satcomUplinkBand: 'Ka-Band 28.5 GHz',
      switchPopCount: 500,
      ircChannel: `#${slug.slice(0, 18)}`,
      shoutcastMount: `/${slug}.mp3`,
      websubEnabled: true,
      lastPingedAt: new Date().toISOString(),
      subscribersCount: 1,
      totalDownloads: 0,
    };

    setShows((prev) => [...prev, created]);
    setSelectedShowId(created.id);
    setNewShowTitle('');
    setNewShowDescription('');
    setNewShowModalOpen(false);
    showToast(`Created podcast channel "${created.title}"`);
  };

  const handleToggleEpisodeStatus = (epId: string) => {
    setEpisodes((prev) =>
      prev.map((ep) => {
        if (ep.id !== epId) return ep;
        const nextStatus: PodcastEpisodeStatus =
          ep.status === 'published' ? 'draft' : 'published';
        return { ...ep, status: nextStatus };
      })
    );
  };

  const handleDeleteEpisode = (epId: string) => {
    setEpisodes((prev) => prev.filter((e) => e.id !== epId));
    showToast('Episode removed from feed.');
  };

  const handlePingWebSub = () => {
    const now = new Date().toISOString();
    setShows((prev) =>
      prev.map((s) => (s.id === activeShow.id ? { ...s, lastPingedAt: now } : s))
    );
    setDirectories((prev) =>
      prev.map((d) => ({ ...d, status: 'live', lastSync: 'Just now' }))
    );
    showToast(`WebSub RSS push dispatched for ${activeShow.title} to all 7 directories.`);
  };

  const handleDownloadXml = (content: string, filename: string, mime = 'application/xml') => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  };

  const handleAddPrivateFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrivEmail.trim()) return;
    const token = Math.random().toString(36).substring(2, 12);
    const feed: PrivateSubscriberFeed = {
      id: `priv-${Date.now()}`,
      subscriberEmail: newPrivEmail.trim(),
      label: newPrivLabel.trim() || 'Private Member RSS Feed',
      tokenUrl: `https://uplink.drfun1media.com/private/tok_${token}/feed.xml`,
      createdAt: new Date().toISOString().slice(0, 10),
      lastFetchedAt: 'Awaiting first sync',
      downloadsCount: 0,
      active: true,
    };
    setPrivateFeeds((prev) => [feed, ...prev]);
    setNewPrivEmail('');
    setNewPrivLabel('');
    showToast(`Issued private token RSS feed for ${feed.subscriberEmail}`);
  };

  const totalNetworkDownloads = useMemo(
    () => shows.reduce((acc, s) => acc + s.totalDownloads, 0),
    [shows]
  );
  const totalNetworkSubscribers = useMemo(
    () => shows.reduce((acc, s) => acc + s.subscribersCount, 0),
    [shows]
  );

  const activeChapter = useMemo(() => {
    const sorted = [...activeEpisode.chapters].sort((a, b) => a.timeSec - b.timeSec);
    let current = sorted[0];
    for (const ch of sorted) {
      if (currentTimeSec >= ch.timeSec) current = ch;
    }
    return current;
  }, [activeEpisode.chapters, currentTimeSec]);

  const embedIframeCode = `<iframe src="https://uplink.drfun1media.com/embed/${activeShow.slug}/${activeEpisode.id}?theme=dark" width="100%" height="180" frameborder="0" scrolling="no" allow="autoplay; clipboard-write" title="${activeEpisode.title}"></iframe>`;

  const navItems: Array<{ id: UplinkWorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'episodes', label: 'Shows & Episodes', icon: ListMusic },
    { id: 'publish', label: 'Upload & Publish', icon: Upload },
    { id: 'distribution', label: 'RSS 2.0 & Directories', icon: Rss },
    { id: 'analytics', label: 'IAB v2.1 Analytics', icon: BarChart3 },
    { id: 'monetization', label: 'DAI & Private Feeds', icon: Lock },
    { id: 'uplink_bridge', label: 'SATCOM / IRC Uplink', icon: Satellite },
  ];

  return (
    <div className="space-y-5">
      {/* Action Toast */}
      {toastNotice && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{toastNotice}</span>
        </div>
      )}

      {/* ========================================================
          TOP WORKSPACE HEADER: DrFun1 Podcasting Uplink (Podserv.fm Rebrand)
          ======================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="text-xs font-mono text-amber-400 tracking-wide">
              DrFun1 Media Audio Hosting Engine · Podserv Architecture Uplink
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-balance">
              DrFun1 Podcasting Uplink
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Unlimited podcast hosting, RSS 2.0 &amp; Podcasting 2.0 syndication, Dynamic Ad Insertion, and live Switch 100G + SATCOM episode uplinks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenRankMatrix && (
              <button
                type="button"
                onClick={onOpenRankMatrix}
                className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-200 border border-amber-500/40 text-xs font-mono flex items-center gap-1.5 min-h-[40px] cursor-pointer whitespace-nowrap"
                title="View or elevate your IRCD rank permissions for Podcasting Uplink"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeRankDef.prefix}{activeRankDef.shortLabel} (Lvl {activeRankDef.accessLevel})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setNewShowModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 min-h-[40px] cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>New Podcast Show</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceTab('publish')}
              className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 min-h-[40px] cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Episode</span>
            </button>
          </div>
        </div>

        {/* Network Summary Strip (Tabular Numerals, Hairline Separators) */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-slate-400">Hosted Shows</div>
            <div className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">
              {shows.length} Active Shows
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Episodes</div>
            <div className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">
              {episodes.length} Masters
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">IAB Verified Downloads</div>
            <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
              {totalNetworkDownloads.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">RSS Subscribers</div>
            <div className="text-xl font-bold text-amber-300 font-mono tabular-nums mt-0.5">
              {totalNetworkSubscribers.toLocaleString()}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ACTIVE SHOW SELECTOR STRIP (Clean 4-Card Studio Switcher)
          ======================================================== */}
      <section aria-label="Podcast Show Switcher" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {shows.map((show) => {
          const isSelected = show.id === activeShow.id;
          const epCount = episodes.filter((e) => e.showId === show.id).length;
          return (
            <button
              key={show.id}
              type="button"
              onClick={() => {
                setSelectedShowId(show.id);
                const firstEp = episodes.find((e) => e.showId === show.id);
                if (firstEp) {
                  setActiveEpisodeId(firstEp.id);
                  setCurrentTimeSec(0);
                  setIsPlaying(false);
                }
              }}
              className={`text-left p-3 rounded-xl border transition-colors flex items-center gap-3 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-amber-400 ring-1 ring-amber-400/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Show Artwork with Fallback */}
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-slate-800 flex items-center justify-center">
                {!imgErrors[show.id] ? (
                  <img
                    src={show.coverUrl}
                    alt={`${show.title} cover artwork`}
                    referrerPolicy="no-referrer"
                    onError={() => setImgErrors((prev) => ({ ...prev, [show.id]: true }))}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Mic className="w-6 h-6 text-amber-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs text-slate-400 truncate">
                  {show.category} · {epCount} episodes
                </div>
                <div className="text-sm font-bold text-white truncate mt-0.5">
                  {show.title}
                </div>
                <div className="text-xs font-mono tabular-nums text-slate-300 mt-1 truncate">
                  {show.subscribersCount.toLocaleString()} subs · {(show.totalDownloads / 1000).toFixed(0)}k plays
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* ========================================================
          PERSISTENT PODCAST AUDIO & WAVEFORM PLAYER
          ======================================================== */}
      <section
        aria-label="Podcast Uplink Audio Player"
        className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-slate-800 flex items-center justify-center">
              {!imgErrors[activeShow.id] ? (
                <img
                  src={activeShow.coverUrl}
                  alt={activeShow.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <AudioWaveform className="w-6 h-6 text-amber-400" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-400 truncate">
                {activeShow.title} · S{activeEpisode.season}E{activeEpisode.episodeNumber} · {activeEpisode.audioFormat} · {activeEpisode.loudnessLufs} LUFS
              </div>
              <h2 className="text-base font-bold text-white truncate mt-0.5">
                {activeEpisode.title}
              </h2>
              {activeChapter && (
                <div className="text-xs text-amber-300 font-mono truncate mt-0.5">
                  Chapter: {activeChapter.title}
                </div>
              )}
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentTimeSec((t) => Math.max(0, t - 15))}
              className="px-2.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono flex items-center gap-1 min-h-[40px] cursor-pointer"
              title="Rewind 15 seconds"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>15s</span>
            </button>

            <button
              type="button"
              onClick={() => handleTogglePlayEpisode(activeEpisode)}
              className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 min-h-[40px] cursor-pointer whitespace-nowrap"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
              <span>{isPlaying ? 'Pause' : 'Play Episode'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTimeSec((t) => Math.min(activeEpisode.durationSec, t + 30))}
              className="px-2.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono flex items-center gap-1 min-h-[40px] cursor-pointer"
              title="Forward 30 seconds"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>30s</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setPlaybackRate((r) => (r === 1 ? 1.25 : r === 1.25 ? 1.5 : r === 1.5 ? 2 : 1))
              }
              className="px-2.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono tabular-nums min-h-[40px] cursor-pointer"
              title="Playback Speed"
            >
              {playbackRate}x
            </button>

            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setShowTranscriptDrawer((v) => !v)}
              className={`px-3 py-2 rounded-lg border text-xs font-medium min-h-[40px] cursor-pointer whitespace-nowrap ${
                showTranscriptDrawer
                  ? 'bg-slate-800 border-amber-400 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {showTranscriptDrawer ? 'Hide Transcript' : 'Chapters & Transcript'}
            </button>

            <button
              type="button"
              onClick={() => setEmbedModalOpen(true)}
              className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 min-h-[40px] cursor-pointer whitespace-nowrap"
            >
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Embed Player</span>
            </button>
          </div>
        </div>

        {/* Interactive Click-to-Scrub Waveform Bar */}
        <div className="space-y-1.5">
          <div
            className="h-12 flex items-end gap-[2px] sm:gap-1 cursor-pointer select-none px-1"
            role="slider"
            aria-label="Episode audio scrubber"
            aria-valuemin={0}
            aria-valuemax={activeEpisode.durationSec}
            aria-valuenow={Math.round(currentTimeSec)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setCurrentTimeSec(Math.round(ratio * activeEpisode.durationSec));
            }}
          >
            {waveformBars.map((height, idx) => {
              const barPct = (idx / waveformBars.length) * 100;
              const progressPct = (currentTimeSec / Math.max(1, activeEpisode.durationSec)) * 100;
              const isPassed = barPct <= progressPct;
              return (
                <div
                  key={idx}
                  style={{ height: `${height}%` }}
                  className={`flex-1 rounded-t-sm transition-colors ${
                    isPassed ? 'bg-amber-400' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-400">
            <span>{formatDuration(currentTimeSec)}</span>
            <span>{formatDuration(activeEpisode.durationSec)}</span>
          </div>
        </div>

        {/* Optional Chapters & Synchronized Transcript Panel */}
        {showTranscriptDrawer && (
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-300 mb-2">
                Episode Chapters ({activeEpisode.chapters.length})
              </h3>
              <div className="divide-y divide-slate-800 border-t border-b border-slate-800">
                {activeEpisode.chapters.map((ch, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCurrentTimeSec(ch.timeSec);
                      setIsPlaying(true);
                    }}
                    className="w-full py-2.5 px-2 text-left flex items-center justify-between gap-3 hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-slate-200 truncate">{ch.title}</span>
                    <span className="text-xs font-mono tabular-nums text-amber-300 shrink-0">
                      {formatDuration(ch.timeSec)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-300 mb-2">
                Time-Synced Transcript (WebVTT / Podcasting 2.0)
              </h3>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-2">
                {activeEpisode.transcript.map((line, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCurrentTimeSec(line.timeSec);
                      setIsPlaying(true);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/60 transition-colors block cursor-pointer"
                  >
                    <div className="text-xs font-mono text-slate-400">
                      {formatDuration(line.timeSec)} · {line.speaker}
                    </div>
                    <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{line.text}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================
          WORKSPACE SUB-NAVIGATION TABS
          ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = workspaceTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setWorkspaceTab(item.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer transition-colors ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: SHOWS & EPISODES CATALOG
          ======================================================== */}
      {workspaceTab === 'episodes' && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">{activeShow.title} — Episodes</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Custom URL: {activeShow.customDomain} · Band: {activeShow.satcomUplinkBand} · IRC: {activeShow.ircChannel}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={episodeSearch}
                  onChange={(e) => setEpisodeSearch(e.target.value)}
                  placeholder="Search episodes..."
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 min-h-[38px]"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['all', 'published', 'scheduled', 'draft'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded text-xs capitalize cursor-pointer whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {showEpisodes.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-sm text-slate-400">
                No episodes match your current filter for {activeShow.title}.
              </p>
              <button
                type="button"
                onClick={() => setWorkspaceTab('publish')}
                className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Upload First Episode
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {showEpisodes.map((ep) => {
                const isActive = ep.id === activeEpisode.id;
                return (
                  <div
                    key={ep.id}
                    className="py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 font-mono tabular-nums">
                        <span className="text-slate-200 font-semibold">
                          S{ep.season}E{ep.episodeNumber}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{ep.publishedAt}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDuration(ep.durationSec)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{ep.fileSizeMb} MB ({ep.audioFormat})</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            ep.status === 'published'
                              ? 'text-emerald-400 font-semibold'
                              : ep.status === 'scheduled'
                              ? 'text-amber-300 font-semibold'
                              : 'text-slate-400'
                          }
                        >
                          {ep.status === 'published'
                            ? 'Published'
                            : ep.status === 'scheduled'
                            ? 'Scheduled'
                            : 'Draft'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white leading-snug">
                        {ep.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 max-w-3xl">
                        {ep.summary}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <div className="text-right mr-2 hidden sm:block font-mono tabular-nums">
                        <div className="text-xs font-bold text-white">
                          {ep.downloads.toLocaleString()} plays
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {ep.completionRate}% completion
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTogglePlayEpisode(ep)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 min-h-[38px] cursor-pointer whitespace-nowrap ${
                          isActive && isPlaying
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        {isActive && isPlaying ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        <span>{isActive && isPlaying ? 'Pause' : 'Play'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(ep.enclosureUrl, ep.id, 'MP3 enclosure URL')}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 min-h-[38px] cursor-pointer whitespace-nowrap"
                      >
                        {copiedId === ep.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === ep.id ? 'Copied' : 'Copy Audio URL'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleEpisodeStatus(ep.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs min-h-[38px] cursor-pointer whitespace-nowrap"
                      >
                        {ep.status === 'published' ? 'Unpublish' : 'Publish Now'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteEpisode(ep.id)}
                        className="p-2 rounded-lg bg-slate-950 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                        aria-label={`Delete ${ep.title}`}
                        title="Delete Episode"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          TAB 2: UPLOAD & PUBLISH EPISODE WORKFLOW
          ======================================================== */}
      {workspaceTab === 'publish' && (
        !canPublishPodcasts ? (
          <IrcdAccessGateBanner
            currentRank={activeRank}
            requiredRank="dj_host"
            featureName="Upload & Publish Episodes Live to RSS 2.0 & WebSub"
            onElevateRank={onElevateRank}
            onOpenRankMatrix={onOpenRankMatrix}
          />
        ) : (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="max-w-3xl space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">
                Upload &amp; Publish Episode — {activeShow.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Audio masters are automatically loudness-normalized to -16.0 LUFS stereo, replicated to Switch SUPERNAP &amp; DataPacket CDN edges, and added live to your RSS 2.0 feed.
              </p>
            </div>

            <form onSubmit={handlePublishEpisode} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Episode Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newEpTitle}
                    onChange={(e) => setNewEpTitle(e.target.value)}
                    placeholder="e.g. Live Ka-Band Contribution Link Field Notes"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Subtitle / Hook
                  </label>
                  <input
                    type="text"
                    value={newEpSubtitle}
                    onChange={(e) => setNewEpSubtitle(e.target.value)}
                    placeholder="Short episode hook shown in Apple Podcasts"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Show Notes &amp; Episode Summary
                </label>
                <textarea
                  rows={3}
                  value={newEpSummary}
                  onChange={(e) => setNewEpSummary(e.target.value)}
                  placeholder="Describe episode topics, guests, links, and sponsors..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Season #
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newEpSeason}
                    onChange={(e) => setNewEpSeason(Number(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Episode #
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newEpNumber}
                    onChange={(e) => setNewEpNumber(Number(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Duration (Min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={480}
                    value={newEpDurationMin}
                    onChange={(e) => setNewEpDurationMin(Number(e.target.value) || 30)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={newEpStatus}
                    onChange={(e) => setNewEpStatus(e.target.value as PodcastEpisodeStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="published">Publish Immediately</option>
                    <option value="scheduled">Schedule Release</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Audio Master Encoding
                  </label>
                  <select
                    value={newEpFormat}
                    onChange={(e) => setNewEpFormat(e.target.value as PodcastAudioFormat)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="MP3 320kbps CBR">MP3 320kbps CBR (Broadcast Standard)</option>
                    <option value="AAC 256kbps">AAC 256kbps (Apple / Mobile High-Efficiency)</option>
                    <option value="FLAC 24-bit Lossless">FLAC 24-bit Lossless (Archival Master)</option>
                    <option value="Opus 128kbps">Opus 128kbps (Low-Bandwidth SATCOM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Source Master Filename
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 truncate">
                      <FileAudio className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{newEpFileName}</span>
                    </div>
                    <label className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer whitespace-nowrap min-h-[38px] flex items-center">
                      Select Audio
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(ev) => {
                          const file = ev.target.files?.[0];
                          if (file) setNewEpFileName(file.name);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEpSyncIrc}
                    onChange={(e) => setNewEpSyncIrc(e.target.checked)}
                    className="accent-amber-400 w-4 h-4"
                  />
                  <span>Announce release on UnrealIRCd Quad-Hub ({activeShow.ircChannel})</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEpSyncShoutcast}
                    onChange={(e) => setNewEpSyncShoutcast(e.target.checked)}
                    className="accent-amber-400 w-4 h-4"
                  />
                  <span>Mirror to SHOUTcast mount ({activeShow.shoutcastMount})</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setWorkspaceTab('episodes')}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold min-h-[40px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 min-h-[40px] cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Publish Episode to Uplink</span>
                </button>
              </div>
            </form>
          </div>
        </section>
        )
      )}

      {/* ========================================================
          TAB 3: RSS 2.0, OPML & DIRECTORY DISTRIBUTION
          ======================================================== */}
      {workspaceTab === 'distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Directories Matrix */}
          <section className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Podcast Directory Syndication</h2>
                <p className="text-xs text-slate-400">
                  Real-time WebSub push hooks ensure new episodes appear across apps within 60 seconds.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePingWebSub}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 min-h-[38px] cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ping WebSub</span>
              </button>
            </div>

            <div className="divide-y divide-slate-800">
              {directories.map((dir) => (
                <div key={dir.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{dir.platform}</div>
                    <div className="text-xs text-slate-400 font-mono truncate">
                      {dir.protocol} · Synced {dir.lastSync}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-semibold text-emerald-400">
                      {dir.status === 'live' ? 'Active' : dir.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(dir.directoryUrl, dir.id, `${dir.platform} URL`)}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                      aria-label={`Copy ${dir.platform} directory URL`}
                    >
                      {copiedId === dir.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Live Generated RSS 2.0 + OPML Viewer */}
          <section className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Live RSS 2.0 &amp; Podcasting 2.0 XML</h2>
                <p className="text-xs font-mono text-amber-300 truncate max-w-md">{activeShow.rssUrl}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(generatedRssXml, 'rss-xml', 'RSS 2.0 XML')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 min-h-[36px] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy XML</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadXml(generatedRssXml, `${activeShow.slug}-feed.xml`)
                  }
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 min-h-[36px] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .XML</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadXml(generatePodcastOpmlXml(shows), 'drfun1-podcast-network.opml')
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 min-h-[36px] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export OPML</span>
                </button>
              </div>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-80 leading-relaxed">
              {generatedRssXml}
            </pre>
          </section>
        </div>
      )}

      {/* ========================================================
          TAB 4: IAB v2.1 ANALYTICS & CDN POP TELEMETRY
          ======================================================== */}
      {workspaceTab === 'analytics' && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">IAB v2.1 Verified Listener Analytics</h2>
              <p className="text-xs text-slate-400">
                Bot &amp; HOPM proxy traffic automatically filtered across 1,034 Switch, DataPacket &amp; RisingNet nodes.
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-400 font-semibold">
              Last 14 Days · 364,360 Verified Downloads
            </div>
          </div>

          {/* 14-Day SVG Download Trend Bars */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Daily Downloads (Nov 01 – Nov 14)</span>
              <span>Peak: 39,180 / day</span>
            </div>
            <div className="h-44 bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-end gap-1.5 sm:gap-2.5">
              {ANALYTICS_14D_SERIES.map((pt) => {
                const heightPct = Math.round((pt.downloads / 40000) * 100);
                return (
                  <div
                    key={pt.day}
                    className="flex-1 flex flex-col items-center justify-end h-full group"
                    title={`${pt.day}: ${pt.downloads.toLocaleString()} downloads (${pt.uniqueListeners.toLocaleString()} unique)`}
                  >
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-amber-400/80 group-hover:bg-amber-300 rounded-t transition-colors"
                    />
                    <span className="text-[9px] font-mono text-slate-500 mt-1.5 hidden sm:block">
                      {pt.day.replace('Nov ', '')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Client Apps & Edge POP Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div>
              <h3 className="text-sm font-bold text-white mb-3">Listening Applications</h3>
              <div className="space-y-2.5">
                {[
                  { name: 'Apple Podcasts', share: 42 },
                  { name: 'Spotify', share: 27 },
                  { name: 'DrFun1 SHOUTcast & Web Player', share: 16 },
                  { name: 'Overcast & Pocket Casts', share: 9 },
                  { name: 'RSS / Private Token Clients', share: 6 },
                ].map((app) => (
                  <div key={app.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-200">{app.name}</span>
                      <span className="font-mono tabular-nums text-slate-300 font-semibold">{app.share}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${app.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-3">Edge CDN Enclosure Delivery</h3>
              <div className="divide-y divide-slate-800 border-t border-b border-slate-800 text-xs">
                {[
                  { pop: 'Switch SUPERNAP LV Core (500 Leafs/Hub)', ttfb: '1.2 ms', share: '54%' },
                  { pop: 'DataPacket No-Ads Trans-Atlantic (12 POPs/Hub)', ttfb: '8.4 ms', share: '28%' },
                  { pop: 'RisingNet AS53767 Tier-1 Clean Pipe (10 Servers)', ttfb: '2.1 ms', share: '12%' },
                  { pop: 'Ka-Band & S-Band SATCOM Edge Cache', ttfb: '38.0 ms', share: '6%' },
                ].map((edge) => (
                  <div key={edge.pop} className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-slate-200 truncate">{edge.pop}</span>
                    <span className="font-mono tabular-nums text-slate-400 shrink-0">
                      {edge.ttfb} · <strong className="text-white">{edge.share}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          TAB 5: DYNAMIC AD INSERTION (DAI) & PRIVATE TOKEN FEEDS
          ======================================================== */}
      {workspaceTab === 'monetization' && (
        !canManageDai ? (
          <IrcdAccessGateBanner
            currentRank={activeRank}
            requiredRank="founder"
            featureName="Dynamic Ad Insertion (DAI) Campaigns & Private Subscriber Token Feeds"
            onElevateRank={onElevateRank}
            onOpenRankMatrix={onOpenRankMatrix}
          />
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* DAI Ad Stitcher */}
          <section className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Dynamic Ad Insertion (DAI) Campaigns</h2>
              <p className="text-xs text-slate-400">
                Swap pre-roll, mid-roll, and post-roll sponsor reads dynamically across all back-catalog episodes.
              </p>
            </div>

            <div className="divide-y divide-slate-800">
              {daiCampaigns.map((camp) => (
                <div key={camp.id} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-sm text-white truncate">{camp.advertiser}</div>
                    <button
                      type="button"
                      onClick={() =>
                        setDaiCampaigns((prev) =>
                          prev.map((c) =>
                            c.id === camp.id
                              ? { ...c, status: c.status === 'active' ? 'paused' : 'active' }
                              : c
                          )
                        )
                      }
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold cursor-pointer ${
                        camp.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {camp.status === 'active' ? 'Active' : 'Paused'}
                    </button>
                  </div>
                  <div className="text-xs font-mono tabular-nums text-amber-300">
                    {camp.slotType.toUpperCase()} · ${camp.cpmUsd} CPM · {camp.impressions.toLocaleString()} impressions
                  </div>
                  <p className="text-xs text-slate-400">{camp.copyScript}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Private Token Subscriber RSS Feeds */}
          <section className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Private Subscriber Token Feeds</h2>
              <p className="text-xs text-slate-400">
                Issue unique revocable RSS URLs for executive briefings, legal clearance reviews, and paid members.
              </p>
            </div>

            <form onSubmit={handleAddPrivateFeed} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="email"
                required
                value={newPrivEmail}
                onChange={(e) => setNewPrivEmail(e.target.value)}
                placeholder="subscriber@domain.com"
                className="sm:col-span-5 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                value={newPrivLabel}
                onChange={(e) => setNewPrivLabel(e.target.value)}
                placeholder="Feed label (optional)"
                className="sm:col-span-4 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="sm:col-span-3 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer min-h-[38px]"
              >
                Issue Token
              </button>
            </form>

            <div className="divide-y divide-slate-800">
              {privateFeeds.map((pf) => (
                <div key={pf.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{pf.label}</div>
                    <div className="text-xs text-slate-400 font-mono truncate">
                      {pf.subscriberEmail} · {pf.downloadsCount} fetches · {pf.lastFetchedAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(pf.tokenUrl, pf.id, 'Private RSS URL')}
                      className="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200 hover:text-white text-xs font-mono cursor-pointer"
                    >
                      {copiedId === pf.id ? 'Copied' : 'Copy Feed'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPrivateFeeds((prev) => prev.filter((item) => item.id !== pf.id))
                      }
                      className="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-rose-400 hover:bg-rose-950/40 text-xs cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        )
      )}

      {/* ========================================================
          TAB 6: SATCOM / SHOUTCAST / UNREALIRCD UPLINK BRIDGE
          ======================================================== */}
      {workspaceTab === 'uplink_bridge' && (
        !canManageUplinkBridge ? (
          <IrcdAccessGateBanner
            currentRank={activeRank}
            requiredRank="techadmin"
            featureName="SATCOM / 855k SHOUTcast Pod-Relay & Quad-Hub IRC Bridge Controls"
            onElevateRank={onElevateRank}
            onOpenRankMatrix={onOpenRankMatrix}
          />
        ) : (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-5">
          <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">
                DrFun1 Infrastructure Bridge — SATCOM, SHOUTcast &amp; Quad-Hub IRC
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Seamless cross-publishing between podcast episodes, 855,000 SHOUTcast stations, and 1,034 synchronized IRC leaf nodes.
              </p>
            </div>
            {onOpenLicense && (
              <button
                type="button"
                onClick={onOpenLicense}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer self-start"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>FRN 0034981290 · www.wittlawfirm.com</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>UnrealIRCd Quad-Hub Announcer</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Broadcasts episode drops into <strong className="text-slate-200">{activeShow.ircChannel}</strong> across irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net, and drfun1ircd.com.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      `Dispatched /NOTICE to ${activeShow.ircChannel} across all 4 UnrealIRCd hubs.`
                    )
                  }
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                >
                  Broadcast to IRC Hubs
                </button>
                {onNavigateToIrc && (
                  <button
                    type="button"
                    onClick={onNavigateToIrc}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    Open WebIRC
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>855,000 SHOUTcast Pod-Relay</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mount <strong className="text-slate-200">{activeShow.shoutcastMount}</strong> feeds live podcast premieres straight into the SHOUTcast/Icecast2 cluster &amp; SIP VoIP switch.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      `Queued "${activeEpisode.title}" onto SHOUTcast mount ${activeShow.shoutcastMount}.`
                    )
                  }
                  className="px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Push to SHOUTcast
                </button>
                {onNavigateToRadio && (
                  <button
                    type="button"
                    onClick={onNavigateToRadio}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    Open Radio Studio
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Satellite className="w-4 h-4 text-sky-400" />
                <span>SCOTUS &amp; Legal Clearance</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Podcast host clearance governed under supremecourt.gov standards through www.wittlawfirm.com with Owens Company billing in receiving.
              </p>
              <div className="pt-1 text-xs font-mono text-slate-300">
                Uplink Band: {activeShow.satcomUplinkBand}
              </div>
            </div>
          </div>
        </section>
        )
      )}

      {/* ========================================================
          MODAL: EMBEDDABLE HTML5 / WORDPRESS IFRAME PLAYER CODE
          ======================================================== */}
      {embedModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEmbedModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Embed HTML5 Player — {activeEpisode.title}
              </h3>
              <button
                type="button"
                onClick={() => setEmbedModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Paste this responsive iframe snippet into WordPress, Ghost, or any website to embed this episode via Switch SUPERNAP CDN.
            </p>
            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap break-all">
              {embedIframeCode}
            </pre>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleCopy(embedIframeCode, 'embed-code', 'Embed HTML snippet')}
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Copy Embed Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CREATE NEW PODCAST SHOW
          ======================================================== */}
      {newShowModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setNewShowModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Launch New Podcast Show</h3>
              <button
                type="button"
                onClick={() => setNewShowModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateShow} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Show Name</label>
                <input
                  type="text"
                  required
                  value={newShowTitle}
                  onChange={(e) => setNewShowTitle(e.target.value)}
                  placeholder="e.g. Trans-Atlantic Satcom Dispatch"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Host / Author</label>
                  <input
                    type="text"
                    value={newShowAuthor}
                    onChange={(e) => setNewShowAuthor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Apple Category</label>
                  <select
                    value={newShowCategory}
                    onChange={(e) => setNewShowCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Music">Music</option>
                    <option value="News">News</option>
                    <option value="Government">Government</option>
                    <option value="Business">Business</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Show Description</label>
                <textarea
                  rows={3}
                  value={newShowDescription}
                  onChange={(e) => setNewShowDescription(e.target.value)}
                  placeholder="Published via DrFun1 Podcasting Uplink..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewShowModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Create Show &amp; RSS Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
