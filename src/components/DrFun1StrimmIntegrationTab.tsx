/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Strimm.com Linear TV & OTT Playout Integration Studio for DrFun1 News.
 * - Manage & connect Strimm.com 24/7 linear TV channels (persisted in localStorage)
 * - Dual-mode preview: Linear Playout Monitor (with corner Logo Bug & News Crawl) or live HTTPS Strimm Embed iframe
 * - Interactive 24/7 Linear Schedule Sequencer (add, reorder, remove, or import active DrFun1 News desk feeds)
 * - Live Website Embed Code (with domain whitelisting), Direct HLS (.m3u8), and EPG JSON generator & downloader
 * - One-click push into the DrFun1 News Live Desk & 33+ Channel EPG Grid using the Strimm.com HLS source
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileJson,
  Globe,
  ListVideo,
  MonitorPlay,
  Pause,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Trash2,
  Tv,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { INITIAL_STRIMM_CHANNELS } from '../data/drfun1NewsData';
import {
  GlobalNewsOutlet,
  NewsOutletCategory,
  NewsOutletRegion,
  StrimmChannelConfig,
  StrimmLinearProgramBlock,
  StrimmProgramSourceKind,
} from '../types/drfun1News';

interface DrFun1StrimmIntegrationTabProps {
  activeTunedOutlet: GlobalNewsOutlet;
  allOutlets: GlobalNewsOutlet[];
  onPushChannelToLiveDesk: (channel: StrimmChannelConfig) => void;
  onReturnToLiveDesk: () => void;
  onNotify?: (msg: string) => void;
}

const STORAGE_KEY_STRIMM_CHANNELS = 'drfun1_news_strimm_channels_v1';

const STRIMM_REGIONS: NewsOutletRegion[] = [
  'Global Wire',
  'North America',
  'Europe',
  'Middle East',
  'Asia-Pacific',
  'Latin America',
  'Africa',
];

const STRIMM_CATEGORIES: NewsOutletCategory[] = [
  '24/7 Cable News',
  'Public Broadcaster',
  'Wire & Financial',
  'Judicial & Policy',
  'Science & Satcom',
];

const SOURCE_KIND_LABELS: Record<StrimmProgramSourceKind, string> = {
  hls_live: 'HLS Live Stream',
  news_feed: 'DrFun1 News Desk',
  vod_clip: 'VOD / Archive Clip',
  youtube_vod: 'YouTube / Web VOD',
};

const isSafeHttpsUrl = (raw: string): boolean => {
  try {
    const parsed = new URL(raw.trim());
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const sanitizeDomain = (raw: string): string => {
  const cleaned = raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/[^a-zA-Z0-9.-]/g, '');
  return cleaned || 'drfun1media.com';
};

const formatClockRange = (startMs: number, durationMin: number): string => {
  const fmt = (ms: number) =>
    new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${fmt(startMs)} – ${fmt(startMs + durationMin * 60000)}`;
};

export const DrFun1StrimmIntegrationTab: React.FC<DrFun1StrimmIntegrationTabProps> = ({
  activeTunedOutlet,
  allOutlets,
  onPushChannelToLiveDesk,
  onReturnToLiveDesk,
  onNotify,
}) => {
  const [channels, setChannels] = useState<StrimmChannelConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STRIMM_CHANNELS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_STRIMM_CHANNELS;
  });

  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    () => channels[0]?.id ?? INITIAL_STRIMM_CHANNELS[0].id
  );
  const [previewMode, setPreviewMode] = useState<'linear' | 'embed'>('linear');
  const [embedTab, setEmbedTab] = useState<'embed_code' | 'hls_link' | 'epg_json'>('embed_code');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeBlockIdx, setActiveBlockIdx] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [clockTick, setClockTick] = useState<number>(() => Date.now());
  const [showAddChannelForm, setShowAddChannelForm] = useState<boolean>(false);

  // Add Strimm Channel form state
  const [newChName, setNewChName] = useState<string>('');
  const [newChCallSign, setNewChCallSign] = useState<string>('');
  const [newChEmbedUrl, setNewChEmbedUrl] = useState<string>('https://www.strimm.com/');
  const [newChHlsUrl, setNewChHlsUrl] = useState<string>('');
  const [newChDomain, setNewChDomain] = useState<string>(() =>
    typeof window !== 'undefined' && window.location.hostname
      ? window.location.hostname
      : 'drfun1media.com'
  );
  const [newChRegion, setNewChRegion] = useState<NewsOutletRegion>('Global Wire');
  const [newChCategory, setNewChCategory] = useState<NewsOutletCategory>('24/7 Cable News');
  const [channelFormError, setChannelFormError] = useState<string | null>(null);

  // Add Linear Schedule Block form state
  const [newBlockTitle, setNewBlockTitle] = useState<string>('');
  const [newBlockDuration, setNewBlockDuration] = useState<number>(60);
  const [newBlockKind, setNewBlockKind] = useState<StrimmProgramSourceKind>('hls_live');
  const [newBlockUrl, setNewBlockUrl] = useState<string>('');
  const [newBlockDesk, setNewBlockDesk] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STRIMM_CHANNELS, JSON.stringify(channels));
    } catch (_) {}
  }, [channels]);

  useEffect(() => {
    const id = window.setInterval(() => setClockTick(Date.now()), 15000);
    return () => window.clearInterval(id);
  }, []);

  const selectedChannel = useMemo(() => {
    return channels.find((c) => c.id === selectedChannelId) ?? channels[0] ?? INITIAL_STRIMM_CHANNELS[0];
  }, [channels, selectedChannelId]);

  useEffect(() => {
    setActiveBlockIdx(0);
  }, [selectedChannel.id]);

  const updateSelectedChannel = (updater: (ch: StrimmChannelConfig) => StrimmChannelConfig) => {
    setChannels((prev) => prev.map((ch) => (ch.id === selectedChannel.id ? updater(ch) : ch)));
  };

  // Compute continuous broadcast timeline for the active Strimm channel
  const scheduledTimeline = useMemo(() => {
    const topOfHour = new Date(clockTick);
    topOfHour.setMinutes(0, 0, 0);
    let cursorMs = topOfHour.getTime();
    return selectedChannel.schedule.map((block, index) => {
      const startMs = cursorMs;
      const endMs = startMs + Math.max(5, block.durationMin) * 60000;
      cursorMs = endMs;
      return {
        block,
        index,
        startMs,
        endMs,
        timeRange: formatClockRange(startMs, block.durationMin),
      };
    });
  }, [selectedChannel.schedule, clockTick]);

  const clampedActiveIdx = Math.min(
    Math.max(0, activeBlockIdx),
    Math.max(0, scheduledTimeline.length - 1)
  );
  const activeTimelineItem = scheduledTimeline[clampedActiveIdx] ?? null;
  const upNextTimelineItem =
    scheduledTimeline.length > 1
      ? scheduledTimeline[(clampedActiveIdx + 1) % scheduledTimeline.length]
      : null;

  const progressPct = useMemo(() => {
    const d = new Date(clockTick);
    return Math.max(6, Math.min(96, Math.round((d.getMinutes() / 60) * 100)));
  }, [clockTick]);

  const safeEmbedUrl = isSafeHttpsUrl(selectedChannel.embedUrl) ? selectedChannel.embedUrl : null;
  const safeDomain = sanitizeDomain(selectedChannel.whitelistedDomain);

  // Build authentic Strimm Website Embed snippet bound to whitelisted domain
  const generatedEmbedSnippet = useMemo(() => {
    const params = new URLSearchParams({
      channel: selectedChannel.strimmChannelId,
      domain: safeDomain,
      autoplay: selectedChannel.autoplay ? '1' : '0',
      epg: selectedChannel.showProgramGuide ? '1' : '0',
      bug: selectedChannel.showLogoBug ? '1' : '0',
      ticker: selectedChannel.showTickerCrawl ? '1' : '0',
    });
    const playerSrc = `${safeEmbedUrl || 'https://www.strimm.com/embed'}?${params.toString()}`;
    return `<!-- Strimm.com Linear TV Embed (${selectedChannel.name}) -->
<!-- Whitelisted Domain: ${safeDomain} -->
<div id="strimm-channel-${selectedChannel.strimmChannelId}" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
  <iframe
    src="${playerSrc}"
    title="${selectedChannel.name} - Strimm.com Linear TV"
    style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"
    allow="autoplay; fullscreen; picture-in-picture"
    allowfullscreen
  ></iframe>
</div>`;
  }, [selectedChannel, safeDomain, safeEmbedUrl]);

  // Build valid Strimm EPG JSON feed reflecting the actual schedule blocks
  const generatedEpgJson = useMemo(() => {
    const payload = {
      provider: 'Strimm.com',
      platform: 'DrFun1 Media Linear OTT Bridge',
      channelId: selectedChannel.strimmChannelId,
      callSign: selectedChannel.callSign,
      channelName: selectedChannel.name,
      whitelistedDomain: safeDomain,
      hlsStreamUrl: selectedChannel.hlsStreamUrl,
      epgGeneratedAt: new Date(clockTick).toISOString(),
      programs: scheduledTimeline.map((item) => ({
        id: item.block.id,
        title: item.block.title,
        startIso: new Date(item.startMs).toISOString(),
        endIso: new Date(item.endMs).toISOString(),
        durationMinutes: item.block.durationMin,
        sourceKind: item.block.sourceKind,
        sourceUrl: item.block.sourceUrl,
        hostOrDesk: item.block.hostOrDesk,
        synopsis: item.block.synopsis,
      })),
    };
    return JSON.stringify(payload, null, 2);
  }, [selectedChannel, safeDomain, scheduledTimeline, clockTick]);

  const isLinkedToLiveDesk = useMemo(() => {
    const expectedOutletId = selectedChannel.linkedOutletId || `news-strimm-${selectedChannel.id}`;
    return allOutlets.some((o) => o.id === expectedOutletId);
  }, [allOutlets, selectedChannel]);

  const handleCopyText = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      onNotify?.(`Copied ${label} to clipboard`);
      window.setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2000);
    } catch {
      onNotify?.(`Clipboard access unavailable — select and copy ${label} manually`);
    }
  };

  const handleDownloadEpgJson = () => {
    const blob = new Blob([generatedEpgJson], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strimm-epg-${selectedChannel.strimmChannelId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify?.(`Downloaded Strimm EPG JSON for ${selectedChannel.name}`);
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newChName.trim();
    const trimmedCall = newChCallSign.trim().toUpperCase() || 'STRM-TV';
    const trimmedEmbed = newChEmbedUrl.trim();
    const trimmedHls = newChHlsUrl.trim();

    if (!trimmedName) {
      setChannelFormError('Please enter a Strimm channel name.');
      return;
    }
    if (trimmedEmbed && !isSafeHttpsUrl(trimmedEmbed)) {
      setChannelFormError('Strimm channel or embed URL must begin with https://');
      return;
    }
    if (trimmedHls && !isSafeHttpsUrl(trimmedHls)) {
      setChannelFormError('Direct HLS stream URL must begin with https://');
      return;
    }

    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `channel-${Date.now()}`;
    const channelId = `strimm-${slug}-${Date.now().toString(36)}`;
    const resolvedHls =
      trimmedHls || `https://stream.strimm.com/live/${slug}/master.m3u8`;
    const resolvedEmbed =
      trimmedEmbed || `https://www.strimm.com/DrFun1Media/${slug}`;

    const created: StrimmChannelConfig = {
      id: channelId,
      strimmChannelId: slug,
      name: trimmedName,
      callSign: trimmedCall.slice(0, 12),
      category: newChCategory,
      region: newChRegion,
      country: 'United States',
      accentColor: '#14b8a6',
      embedUrl: resolvedEmbed,
      hlsStreamUrl: resolvedHls,
      epgJsonUrl: `https://api.strimm.com/v1/epg/${slug}.json`,
      whitelistedDomain: sanitizeDomain(newChDomain),
      logoBugText: `${trimmedCall.slice(0, 8)} · STRIMM`,
      crawlTickerText: `${trimmedName.toUpperCase()} · LIVE LINEAR PLAYOUT ON STRIMM.COM · INTEGRATED WITH DRFUN1 NEWS`,
      showLogoBug: true,
      showTickerCrawl: true,
      showProgramGuide: true,
      autoplay: true,
      schedule: [
        {
          id: `blk-${Date.now()}-1`,
          title: `${trimmedName} Live Broadcast Block`,
          durationMin: 60,
          sourceKind: 'hls_live',
          sourceUrl: resolvedHls,
          hostOrDesk: `${trimmedCall} Master Playout`,
          synopsis: `24/7 continuous linear television block streamed via Strimm.com.`,
        },
      ],
    };

    setChannels((prev) => [created, ...prev]);
    setSelectedChannelId(created.id);
    setShowAddChannelForm(false);
    setChannelFormError(null);
    setNewChName('');
    setNewChCallSign('');
    setNewChEmbedUrl('https://www.strimm.com/');
    setNewChHlsUrl('');
    onNotify?.(`Connected Strimm.com channel "${created.name}" (${created.callSign})`);
  };

  const handleDeleteChannel = (id: string) => {
    if (channels.length <= 1) {
      onNotify?.('At least one Strimm.com linear channel must remain configured');
      return;
    }
    const target = channels.find((c) => c.id === id);
    setChannels((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (selectedChannelId === id && next[0]) {
        setSelectedChannelId(next[0].id);
      }
      return next;
    });
    if (target) {
      onNotify?.(`Removed Strimm.com channel "${target.name}"`);
    }
  };

  const handleAddScheduleBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newBlockTitle.trim();
    if (!title) return;
    const block: StrimmLinearProgramBlock = {
      id: `strm-blk-${Date.now().toString(36)}`,
      title,
      durationMin: Math.max(10, Math.min(240, Number(newBlockDuration) || 60)),
      sourceKind: newBlockKind,
      sourceUrl:
        newBlockUrl.trim() && isSafeHttpsUrl(newBlockUrl.trim())
          ? newBlockUrl.trim()
          : selectedChannel.hlsStreamUrl,
      hostOrDesk: newBlockDesk.trim() || `${selectedChannel.callSign} Linear Desk`,
      synopsis: `Scheduled ${SOURCE_KIND_LABELS[newBlockKind]} segment in ${selectedChannel.name}.`,
    };
    updateSelectedChannel((ch) => ({
      ...ch,
      schedule: [...ch.schedule, block],
    }));
    setNewBlockTitle('');
    setNewBlockUrl('');
    setNewBlockDesk('');
    onNotify?.(`Added "${block.title}" (${block.durationMin}m) to ${selectedChannel.callSign} Strimm schedule`);
  };

  const handleImportActiveOutletToSchedule = () => {
    const block: StrimmLinearProgramBlock = {
      id: `strm-imp-${Date.now().toString(36)}`,
      title: `${activeTunedOutlet.callSign}: ${activeTunedOutlet.currentProgram}`,
      durationMin: 60,
      sourceKind: 'news_feed',
      sourceUrl: activeTunedOutlet.hlsFeedUrl,
      hostOrDesk: `${activeTunedOutlet.name} (${activeTunedOutlet.country})`,
      synopsis: activeTunedOutlet.headline,
    };
    updateSelectedChannel((ch) => ({
      ...ch,
      schedule: [...ch.schedule, block],
    }));
    onNotify?.(
      `Imported ${activeTunedOutlet.callSign} into ${selectedChannel.name} linear rundown`
    );
  };

  const handleMoveBlock = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= selectedChannel.schedule.length) return;
    updateSelectedChannel((ch) => {
      const next = [...ch.schedule];
      const [moved] = next.splice(index, 1);
      next.splice(targetIdx, 0, moved);
      return { ...ch, schedule: next };
    });
  };

  const handleRemoveBlock = (blockId: string) => {
    if (selectedChannel.schedule.length <= 1) {
      onNotify?.('A linear channel requires at least one scheduled program block');
      return;
    }
    updateSelectedChannel((ch) => ({
      ...ch,
      schedule: ch.schedule.filter((b) => b.id !== blockId),
    }));
  };

  const handleResetDefaults = () => {
    setChannels(INITIAL_STRIMM_CHANNELS);
    setSelectedChannelId(INITIAL_STRIMM_CHANNELS[0].id);
    onNotify?.('Restored default DrFun1 Strimm.com linear channels');
  };

  const totalScheduleMinutes = selectedChannel.schedule.reduce((sum, b) => sum + b.durationMin, 0);

  return (
    <section className="space-y-4">
      {/* Top Bar: Strimm.com Integration Studio Header */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Strimm.com Linear TV &amp; OTT Integration</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect Strimm.com 24/7 linear television channels, sequence broadcast rundowns, generate domain-whitelisted website embeds &amp; EPG JSON feeds, and push channels directly to the DrFun1 News Live Desk &amp; EPG.
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono text-slate-400 tabular-nums">
              <span className="text-teal-300 font-semibold">{channels.length} Strimm Channels</span>
              <span aria-hidden="true">·</span>
              <span>Active: {selectedChannel.callSign}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedChannel.schedule.length} Linear Blocks ({totalScheduleMinutes}m loop)</span>
              <span aria-hidden="true">·</span>
              <span>Whitelist: {safeDomain}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddChannelForm((v) => !v)}
              className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddChannelForm ? 'Close Channel Form' : 'Connect Strimm Channel'}</span>
            </button>

            <button
              type="button"
              onClick={() => onPushChannelToLiveDesk(selectedChannel)}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              title="Add or update this Strimm channel in the DrFun1 News EPG and tune the main player to it"
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span>{isLinkedToLiveDesk ? 'Sync & Tune Live Desk' : 'Broadcast to Live Desk & EPG'}</span>
            </button>

            <button
              type="button"
              onClick={onReturnToLiveDesk}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer"
            >
              Back to Live Desk
            </button>
          </div>
        </div>

        {/* Connect New Strimm Channel Drawer Form */}
        {showAddChannelForm && (
          <form
            onSubmit={handleCreateChannel}
            className="p-4 rounded-xl bg-slate-950 border border-teal-500/40 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-teal-300">
                Connect a Strimm.com Linear TV Channel
              </h3>
              <a
                href="https://www.strimm.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-slate-400 hover:text-teal-300 flex items-center gap-1"
              >
                <span>strimm.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {channelFormError && (
              <div className="px-3 py-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200">
                {channelFormError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="space-y-1 text-xs">
                <span className="text-slate-300 font-medium">Channel Name *</span>
                <input
                  type="text"
                  required
                  value={newChName}
                  onChange={(e) => setNewChName(e.target.value)}
                  placeholder="e.g. DrFun1 Global Breaking Linear"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
                />
              </label>

              <label className="space-y-1 text-xs">
                <span className="text-slate-300 font-medium">Call Sign</span>
                <input
                  type="text"
                  value={newChCallSign}
                  onChange={(e) => setNewChCallSign(e.target.value)}
                  placeholder="e.g. STRM-247"
                  maxLength={12}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
                />
              </label>

              <label className="space-y-1 text-xs">
                <span className="text-slate-300 font-medium">Whitelisted Website Domain</span>
                <input
                  type="text"
                  value={newChDomain}
                  onChange={(e) => setNewChDomain(e.target.value)}
                  placeholder="drfun1media.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
                />
              </label>

              <label className="space-y-1 text-xs md:col-span-2">
                <span className="text-slate-300 font-medium">Strimm.com Channel / Embed URL (HTTPS)</span>
                <input
                  type="url"
                  value={newChEmbedUrl}
                  onChange={(e) => setNewChEmbedUrl(e.target.value)}
                  placeholder="https://www.strimm.com/YourNetwork/YourChannel"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
                />
              </label>

              <label className="space-y-1 text-xs">
                <span className="text-slate-300 font-medium">Region</span>
                <select
                  value={newChRegion}
                  onChange={(e) => setNewChRegion(e.target.value as NewsOutletRegion)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-teal-400"
                >
                  {STRIMM_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-xs md:col-span-2">
                <span className="text-slate-300 font-medium">Direct Strimm HLS Stream URL (.m3u8, optional)</span>
                <input
                  type="url"
                  value={newChHlsUrl}
                  onChange={(e) => setNewChHlsUrl(e.target.value)}
                  placeholder="https://stream.strimm.com/live/your-channel/master.m3u8"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
                />
              </label>

              <label className="space-y-1 text-xs">
                <span className="text-slate-300 font-medium">Category</span>
                <select
                  value={newChCategory}
                  onChange={(e) => setNewChCategory(e.target.value as NewsOutletCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-teal-400"
                >
                  {STRIMM_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowAddChannelForm(false);
                  setChannelFormError(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-mono font-bold cursor-pointer"
              >
                Save &amp; Connect Channel
              </button>
            </div>
          </form>
        )}

        {/* Channel Selector Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {channels.map((ch) => {
              const active = ch.id === selectedChannel.id;
              return (
                <div key={ch.id} className="inline-flex items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedChannelId(ch.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-2 cursor-pointer ${
                      active
                        ? 'bg-teal-500/20 text-teal-200 border-teal-400/60'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: ch.accentColor }}
                    />
                    <span>{ch.callSign}</span>
                    <span className="text-slate-400 font-normal hidden sm:inline truncate max-w-[170px]">
                      {ch.name}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {channels.length > 1 && (
              <button
                type="button"
                onClick={() => handleDeleteChannel(selectedChannel.id)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                title="Remove selected Strimm channel"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-[11px] font-mono flex items-center gap-1 cursor-pointer"
              title="Restore default Strimm.com channels"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Studio Workspace: Left = Live Monitor + Embed/HLS/EPG Generator | Right = Linear Schedule Sequencer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left Column (7 cols): Live Strimm Playout Monitor / Iframe Preview + Embed/HLS/EPG Output */}
        <div className="xl:col-span-7 space-y-4">
          {/* Monitor Container */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {selectedChannel.name} ({selectedChannel.callSign})
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate">
                  {selectedChannel.region} · {selectedChannel.category} · Strimm ID: {selectedChannel.strimmChannelId}
                </div>
              </div>

              {/* Preview Mode Segmented Switcher */}
              <div
                role="group"
                aria-label="Strimm preview mode"
                className="inline-flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0"
              >
                <button
                  type="button"
                  aria-pressed={previewMode === 'linear'}
                  onClick={() => setPreviewMode('linear')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition cursor-pointer ${
                    previewMode === 'linear'
                      ? 'bg-teal-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Linear Playout
                </button>
                <button
                  type="button"
                  aria-pressed={previewMode === 'embed'}
                  onClick={() => setPreviewMode('embed')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition cursor-pointer ${
                    previewMode === 'embed'
                      ? 'bg-teal-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Strimm Embed Iframe
                </button>
              </div>
            </div>

            {/* 16:9 Broadcast Viewport */}
            <div className="relative aspect-video bg-slate-950 overflow-hidden">
              {previewMode === 'embed' ? (
                safeEmbedUrl ? (
                  <div className="w-full h-full flex flex-col">
                    <iframe
                      src={safeEmbedUrl}
                      title={`${selectedChannel.name} Strimm.com Embed`}
                      className="w-full flex-1 border-0 bg-slate-950"
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                      referrerPolicy="no-referrer"
                      allow="autoplay; fullscreen; picture-in-picture"
                    />
                    <div className="px-3 py-1.5 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                      <span className="truncate">
                        Live Embed: {safeEmbedUrl} (Whitelist: {safeDomain})
                      </span>
                      <a
                        href={safeEmbedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-300 hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span>Open on Strimm.com</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <Globe className="w-8 h-8 text-slate-500" />
                    <div className="text-sm font-semibold text-white">
                      Enter a valid HTTPS Strimm.com Channel URL to preview live embed
                    </div>
                    <p className="text-xs text-slate-400 max-w-md">
                      Update the channel&apos;s Strimm Embed URL below using an https:// address configured with your whitelisted domain in Strimm Production Studio.
                    </p>
                  </div>
                )
              ) : (
                <div className="w-full h-full relative flex flex-col justify-between p-4 sm:p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/40">
                  {/* Subtle studio scanline texture */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 20% 20%, rgba(20,184,166,0.28), transparent 45%), radial-gradient(circle at 80% 75%, rgba(56,189,248,0.2), transparent 45%)',
                    }}
                  />

                  {/* Top Broadcast Bar: Live State + Corner Logo Bug */}
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold">
                        {isPlaying ? 'ON AIR' : 'PAUSED'}
                      </span>
                      <span className="text-slate-300 tabular-nums">
                        {activeTimelineItem?.timeRange ?? '24/7 Linear'}
                      </span>
                      <span className="text-slate-500" aria-hidden="true">·</span>
                      <span className="text-teal-300">Strimm HLS 1080p60</span>
                    </div>

                    {selectedChannel.showLogoBug && (
                      <div className="px-2.5 py-1 rounded-md bg-slate-950/85 border border-teal-400/40 text-[11px] font-mono font-bold text-teal-200 tracking-wide">
                        {selectedChannel.logoBugText || `${selectedChannel.callSign} · STRIMM`}
                      </div>
                    )}
                  </div>

                  {/* Center Active Linear Program Slate */}
                  <div className="relative z-10 max-w-2xl space-y-2 my-auto py-4">
                    <div className="text-[11px] font-mono text-teal-300">
                      {activeTimelineItem
                        ? `${SOURCE_KIND_LABELS[activeTimelineItem.block.sourceKind]} · ${activeTimelineItem.block.hostOrDesk}`
                        : 'Linear Broadcast Ready'}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                      {activeTimelineItem?.block.title ?? selectedChannel.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                      {activeTimelineItem?.block.synopsis ??
                        'Continuous 24/7 Strimm.com linear TV playout synchronized with DrFun1 News.'}
                    </p>

                    {selectedChannel.showProgramGuide && upNextTimelineItem && (
                      <div className="pt-1 text-[11px] font-mono text-slate-400 tabular-nums">
                        Up Next ({upNextTimelineItem.timeRange}):{' '}
                        <span className="text-slate-200">{upNextTimelineItem.block.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Transport + Progress + News Crawl Ticker */}
                  <div className="relative z-10 space-y-2">
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-400 transition-all"
                        style={{ width: `${isPlaying ? progressPct : 0}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPlaying((v) => !v)}
                          className="px-2.5 py-1 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isPlaying ? 'Pause' : 'Play'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsMuted((v) => !v)}
                          className="p-1.5 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer"
                          aria-label={isMuted ? 'Unmute Strimm monitor' : 'Mute Strimm monitor'}
                        >
                          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-teal-300" />}
                        </button>
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 truncate max-w-[340px]">
                        {selectedChannel.hlsStreamUrl}
                      </div>
                    </div>

                    {selectedChannel.showTickerCrawl && (
                      <div className="px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-amber-200 truncate">
                        {selectedChannel.crawlTickerText}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Channel Overlay & Domain Whitelist Quick Controls */}
            <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="space-y-1 text-xs">
                  <span className="text-slate-400 font-mono">Whitelisted Website Domain</span>
                  <input
                    type="text"
                    value={selectedChannel.whitelistedDomain}
                    onChange={(e) =>
                      updateSelectedChannel((ch) => ({ ...ch, whitelistedDomain: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-teal-400"
                  />
                </label>

                <label className="space-y-1 text-xs">
                  <span className="text-slate-400 font-mono">Corner Logo Bug Text</span>
                  <input
                    type="text"
                    value={selectedChannel.logoBugText}
                    onChange={(e) =>
                      updateSelectedChannel((ch) => ({ ...ch, logoBugText: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-teal-400"
                  />
                </label>

                <label className="space-y-1 text-xs sm:col-span-2">
                  <span className="text-slate-400 font-mono">Strimm.com Channel / Embed URL</span>
                  <input
                    type="url"
                    value={selectedChannel.embedUrl}
                    onChange={(e) =>
                      updateSelectedChannel((ch) => ({ ...ch, embedUrl: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-teal-400"
                  />
                </label>

                <label className="space-y-1 text-xs sm:col-span-2">
                  <span className="text-slate-400 font-mono">On-Screen News Crawl Ticker</span>
                  <input
                    type="text"
                    value={selectedChannel.crawlTickerText}
                    onChange={(e) =>
                      updateSelectedChannel((ch) => ({ ...ch, crawlTickerText: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-teal-400"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedChannel.showLogoBug}
                    onChange={(e) =>
                      updateSelectedChannel((ch) => ({ ...ch, showLogoBug: e.target.checked }))
                    }
                    className="accent-teal-500"
                  />
                  <span>Logo Bug</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedChannel.showTickerCrawl}
                    onChange={(e) =>
                      updateSelectedChannel((ch) => ({ ...ch, showTickerCrawl: e.target.checked }))
                    }
                    className="accent-teal-500"
                  />
                  <span>News Crawl</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedChannel.showProgramGuide}
                    onChange={(e) =>
                      updateSelectedChannel((ch) => ({ ...ch, showProgramGuide: e.target.checked }))
                    }
                    className="accent-teal-500"
                  />
                  <span>Show Program Guide</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedChannel.autoplay}
                    onChange={(e) =>
                      updateSelectedChannel((ch) => ({ ...ch, autoplay: e.target.checked }))
                    }
                    className="accent-teal-500"
                  />
                  <span>Autoplay</span>
                </label>
              </div>
            </div>
          </div>

          {/* Embed Snippet / Direct HLS / EPG JSON Distribution Panel */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div
                role="tablist"
                aria-label="Strimm distribution outputs"
                className="inline-flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={embedTab === 'embed_code'}
                  onClick={() => setEmbedTab('embed_code')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                    embedTab === 'embed_code'
                      ? 'bg-teal-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Website Embed</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={embedTab === 'hls_link'}
                  onClick={() => setEmbedTab('hls_link')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                    embedTab === 'hls_link'
                      ? 'bg-teal-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Direct HLS (.m3u8)</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={embedTab === 'epg_json'}
                  onClick={() => setEmbedTab('epg_json')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                    embedTab === 'epg_json'
                      ? 'bg-teal-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>EPG JSON Feed</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {embedTab === 'epg_json' && (
                  <button
                    type="button"
                    onClick={handleDownloadEpgJson}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-400" />
                    <span>Download JSON</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (embedTab === 'embed_code') {
                      void handleCopyText(generatedEmbedSnippet, 'embed', 'Strimm website embed snippet');
                    } else if (embedTab === 'hls_link') {
                      void handleCopyText(selectedChannel.hlsStreamUrl, 'hls', 'Strimm HLS stream URL');
                    } else {
                      void handleCopyText(generatedEpgJson, 'epg', 'Strimm EPG JSON feed');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-200 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === (embedTab === 'embed_code' ? 'embed' : embedTab === 'hls_link' ? 'hls' : 'epg') ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {copiedKey === (embedTab === 'embed_code' ? 'embed' : embedTab === 'hls_link' ? 'hls' : 'epg')
                      ? 'Copied'
                      : 'Copy'}
                  </span>
                </button>
              </div>
            </div>

            {embedTab === 'embed_code' && (
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-teal-200 overflow-x-auto leading-relaxed">
                {generatedEmbedSnippet}
              </pre>
            )}

            {embedTab === 'hls_link' && (
              <div className="space-y-2.5">
                <label className="block space-y-1 text-xs">
                  <span className="text-slate-400 font-mono">
                    Direct Strimm.com HLS Master Playlist (Roku, Fire TV, Apple TV, Video.js, HLS.js)
                  </span>
                  <input
                    type="url"
                    value={selectedChannel.hlsStreamUrl}
                    onChange={(e) =>
                      updateSelectedChannel((ch) => ({ ...ch, hlsStreamUrl: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-teal-200 font-mono text-xs focus:outline-none focus:border-teal-400"
                  />
                </label>
                <div className="text-[11px] font-mono text-slate-400">
                  EPG Endpoint: <span className="text-slate-200">{selectedChannel.epgJsonUrl}</span>
                </div>
              </div>
            )}

            {embedTab === 'epg_json' && (
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-200 overflow-x-auto max-h-60 leading-relaxed">
                {generatedEpgJson}
              </pre>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): 24/7 Linear Schedule Sequencer */}
        <div className="xl:col-span-5 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ListVideo className="w-4 h-4 text-teal-400" />
                <span>24/7 Linear Schedule Sequencer</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click any block to cue it on the monitor, reorder slots, or import live DrFun1 News feeds.
              </p>
            </div>

            <button
              type="button"
              onClick={handleImportActiveOutletToSchedule}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              title={`Append ${activeTunedOutlet.name} (${activeTunedOutlet.callSign}) as a 60m block in this Strimm channel`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import {activeTunedOutlet.callSign}</span>
            </button>
          </div>

          {/* Schedule Block List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {scheduledTimeline.map((item) => {
              const isCued = item.index === clampedActiveIdx;
              return (
                <div
                  key={item.block.id}
                  className={`p-3 rounded-xl border transition space-y-1.5 ${
                    isCued
                      ? 'bg-teal-950/35 border-teal-500/60'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveBlockIdx(item.index)}
                      className="text-left min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums">
                        <span className={isCued ? 'text-teal-300 font-bold' : 'text-slate-400'}>
                          {isCued ? 'ON AIR' : `SLOT #${item.index + 1}`}
                        </span>
                        <span className="text-slate-600" aria-hidden="true">·</span>
                        <span className="text-cyan-300">{item.timeRange}</span>
                        <span className="text-slate-600" aria-hidden="true">·</span>
                        <span className="text-slate-400">{item.block.durationMin}m</span>
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5 truncate">
                        {item.block.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {SOURCE_KIND_LABELS[item.block.sourceKind]} · {item.block.hostOrDesk}
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={item.index === 0}
                        onClick={() => handleMoveBlock(item.index, -1)}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-35 border border-slate-800 text-slate-300 cursor-pointer"
                        aria-label={`Move ${item.block.title} earlier`}
                        title="Move up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={item.index === scheduledTimeline.length - 1}
                        onClick={() => handleMoveBlock(item.index, 1)}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-35 border border-slate-800 text-slate-300 cursor-pointer"
                        aria-label={`Move ${item.block.title} later`}
                        title="Move down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlock(item.block.id)}
                        className="p-1 rounded bg-slate-900 hover:bg-rose-950 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 cursor-pointer"
                        aria-label={`Remove ${item.block.title}`}
                        title="Remove block"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Linear Program Block Form */}
          <form
            onSubmit={handleAddScheduleBlock}
            className="pt-3 border-t border-slate-800 space-y-2.5"
          >
            <div className="text-xs font-bold text-slate-200">
              Append Program Block to {selectedChannel.callSign}
            </div>

            <input
              type="text"
              required
              value={newBlockTitle}
              onChange={(e) => setNewBlockTitle(e.target.value)}
              placeholder="Program title (e.g. Overnight Global Wire)"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={newBlockKind}
                onChange={(e) => setNewBlockKind(e.target.value as StrimmProgramSourceKind)}
                className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-400"
              >
                <option value="hls_live">HLS Live Stream</option>
                <option value="news_feed">DrFun1 News Desk</option>
                <option value="vod_clip">VOD / Archive Clip</option>
                <option value="youtube_vod">YouTube / Web VOD</option>
              </select>

              <input
                type="number"
                min={10}
                max={240}
                step={5}
                value={newBlockDuration}
                onChange={(e) => setNewBlockDuration(Number(e.target.value))}
                aria-label="Duration in minutes"
                className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono tabular-nums text-white focus:outline-none focus:border-teal-400"
                placeholder="Duration (min)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newBlockDesk}
                onChange={(e) => setNewBlockDesk(e.target.value)}
                placeholder="Anchor / Desk (optional)"
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
              />
              <input
                type="url"
                value={newBlockUrl}
                onChange={(e) => setNewBlockUrl(e.target.value)}
                placeholder="https://... stream URL (optional)"
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Linear Schedule Block</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
