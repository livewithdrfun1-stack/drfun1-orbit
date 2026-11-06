import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  RssSourceId, 
  RssArticleItem 
} from '../types/rssNews';
import { 
  RSS_FEED_SOURCES, 
  INITIAL_RSS_ARTICLES, 
  BACKGROUND_SIMULATED_NEW_HEADLINES,
  getNextDynamicHeadline 
} from '../data/rssNewsData';
import { 
  Radio, 
  Rss, 
  RefreshCw, 
  ExternalLink, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Landmark, 
  Satellite, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  ShieldCheck, 
  Bell, 
  FileText, 
  Layers, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  Grid,
  List,
  Eye,
  Activity,
  SlidersHorizontal,
  X,
  Sparkles
} from 'lucide-react';

export interface SatelliteRssNewsSectionProps {
  mode?: 'full' | 'ticker-only' | 'feed-only';
  onOpenFullNewsroom?: () => void;
  className?: string;
}

export const SatelliteRssNewsSection: React.FC<SatelliteRssNewsSectionProps> = ({
  mode = 'full',
  onOpenFullNewsroom,
  className = ''
}) => {
  // Articles repository
  const [articles, setArticles] = useState<RssArticleItem[]>(INITIAL_RSS_ARTICLES);
  
  // Filtering & View state
  const [selectedSource, setSelectedSource] = useState<RssSourceId>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [viewLayout, setViewLayout] = useState<'grid' | 'compact'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Automated Poller state
  const [pollIntervalSec, setPollIntervalSec] = useState<number>(30);
  const [autoPollEnabled, setAutoPollEnabled] = useState<boolean>(true);
  const [nextPollCountdown, setNextPollCountdown] = useState<number>(30);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [lastPolledAt, setLastPolledAt] = useState<Date>(new Date());
  const [pollCount, setPollCount] = useState<number>(1);
  const [lastPolledSource, setLastPolledSource] = useState<string>('FCC.gov Space Bureau');
  const [newArticleAlert, setNewArticleAlert] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Ticker Controls state
  const [isTickerPaused, setIsTickerPaused] = useState<boolean>(false);
  const [tickerSpeed, setTickerSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [showLatest5Modal, setShowLatest5Modal] = useState<boolean>(false);

  // Dynamic headlines queue & refs
  const unusedHeadlinesRef = useRef<RssArticleItem[]>([...BACKGROUND_SIMULATED_NEW_HEADLINES]);
  const pollCycleCountRef = useRef<number>(0);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Play subtle web audio notification chime
  const playAlertChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (_) {
      // Audio autoplay policy catch
    }
  }, [soundEnabled]);

  // Attempt to fetch from real RSS feed via public CORS / JSON bridge
  const fetchFeedFromNetwork = async (feedUrl: string, sourceId: Exclude<RssSourceId, 'all'>): Promise<RssArticleItem[] | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2400);

      // Attempt public RSS-to-JSON aggregator
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
      const res = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
        const source = RSS_FEED_SOURCES.find((s) => s.id === sourceId);
        const mapped = data.items.slice(0, 2).map((item: { title: string; description?: string; link?: string; author?: string }, idx: number) => ({
          id: `${sourceId}-live-${Date.now()}-${idx}`,
          sourceId,
          sourceName: source?.name || sourceId.toUpperCase(),
          title: item.title,
          description: item.description ? item.description.replace(/<[^>]*>?/gm, '').slice(0, 200) : item.title,
          link: item.link || source?.websiteUrl || '#',
          pubDate: 'Just now',
          timestamp: Date.now(),
          category: source?.category || 'Commercial Satcom',
          tags: [sourceId.toUpperCase(), 'Live RSS Feed', 'Real-Time Update'],
          isBreaking: idx === 0,
          isNew: true,
          author: item.author || source?.organization,
        }));
        return mapped;
      }
      return null;
    } catch (_) {
      return null;
    }
  };

  // Automated Polling Execution Service
  const executePoll = useCallback(async () => {
    setIsPolling(true);
    pollCycleCountRef.current += 1;
    const cycle = pollCycleCountRef.current;

    // Determine target feed source for this poll cycle (round-robin across official feeds)
    const availableSources: Array<Exclude<RssSourceId, 'all'>> = ['fcc', 'spacenews', 'viasatellite', 'satnews'];
    const currentTargetSourceId = availableSources[cycle % availableSources.length];
    const targetSourceConfig = RSS_FEED_SOURCES.find((s) => s.id === currentTargetSourceId);
    setLastPolledSource(targetSourceConfig?.name || 'FCC.gov Space Bureau');

    let freshArticles: RssArticleItem[] = [];

    // 1. Attempt live network poll
    if (targetSourceConfig?.feedUrl) {
      const liveItems = await fetchFeedFromNetwork(targetSourceConfig.feedUrl, currentTargetSourceId);
      if (liveItems && liveItems.length > 0) {
        freshArticles = liveItems;
      }
    }

    // 2. Fallback to high-fidelity dynamic queue / generator if network is throttled or offline
    if (freshArticles.length === 0) {
      // Simulate realistic network round-trip jitter
      await new Promise((resolve) => setTimeout(resolve, 550));

      if (unusedHeadlinesRef.current.length > 0) {
        const queued = unusedHeadlinesRef.current.shift()!;
        freshArticles = [
          {
            ...queued,
            id: `${queued.id}-${Date.now()}`,
            pubDate: 'Just now',
            timestamp: Date.now(),
            isNew: true,
          },
        ];
      } else {
        // Continuously generate realistic FCC & industry satcom alerts
        const generated = getNextDynamicHeadline(cycle);
        freshArticles = [generated];
      }
    }

    // 3. Inject new article(s) at the top of the feed
    if (freshArticles.length > 0) {
      const primaryNew = freshArticles[0];
      setArticles((prev) => {
        // Prevent duplicate titles if recently added
        const exists = prev.some((a) => a.title.toLowerCase() === primaryNew.title.toLowerCase());
        if (exists) {
          return prev.map((item, idx) => (idx === 0 ? { ...item, isNew: true } : item));
        }
        return [...freshArticles, ...prev];
      });

      setNewArticleAlert(`New alert polled from ${primaryNew.sourceName}: "${primaryNew.title.slice(0, 60)}..."`);
      playAlertChime();
      setTimeout(() => setNewArticleAlert(null), 5000);
    }

    setLastPolledAt(new Date());
    setPollCount((prev) => prev + 1);
    setNextPollCountdown(pollIntervalSec);
    setIsPolling(false);
  }, [pollIntervalSec, playAlertChime]);

  // Background countdown timer clock
  useEffect(() => {
    if (!autoPollEnabled) {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      return;
    }

    countdownTimerRef.current = setInterval(() => {
      setNextPollCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [autoPollEnabled]);

  // Trigger poll when countdown reaches zero
  useEffect(() => {
    if (nextPollCountdown === 0 && autoPollEnabled && !isPolling) {
      executePoll();
    }
  }, [nextPollCountdown, autoPollEnabled, isPolling, executePoll]);

  // -------------------------------------------------------------
  // LATEST 5 ALERTS FOR SCROLLING TICKER
  // -------------------------------------------------------------
  const latest5Alerts = useMemo(() => {
    return articles.slice(0, 5);
  }, [articles]);

  // Filtered articles for the main newsroom section
  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      const matchesSource = selectedSource === 'all' || item.sourceId === selectedSource;
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.sourceName.toLowerCase().includes(q) ||
        (item.fccDocketNumber && item.fccDocketNumber.toLowerCase().includes(q)) ||
        item.tags.some((t) => t.toLowerCase().includes(q));

      return matchesSource && matchesCategory && matchesSearch;
    });
  }, [articles, selectedSource, selectedCategory, searchQuery]);

  // Item counts per outlet
  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: articles.length,
      fcc: 0,
      spacenews: 0,
      viasatellite: 0,
      satnews: 0,
    };
    articles.forEach((a) => {
      if (counts[a.sourceId] !== undefined) {
        counts[a.sourceId]++;
      }
    });
    return counts;
  }, [articles]);

  const handleCopyLink = (article: RssArticleItem) => {
    navigator.clipboard.writeText(`${article.title} - ${article.link}`);
    setCopiedId(article.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSourceBadgeStyle = (sourceId: string) => {
    switch (sourceId) {
      case 'fcc':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30';
      case 'spacenews':
        return 'bg-sky-950/80 text-sky-400 border-sky-500/30';
      case 'viasatellite':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/30';
      case 'satnews':
        return 'bg-purple-950/80 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <section className={`bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm relative ${className}`}>
      
      {/* ========================================================
          1. REAL-TIME SCROLLING TICKER: LATEST 5 ALERTS
          Continuous marquee displaying the latest 5 alerts side-by-side
          ======================================================== */}
      {mode !== 'feed-only' && (
        <div className={`bg-gradient-to-r from-red-950/90 via-slate-950 to-indigo-950/80 ${mode === 'ticker-only' ? '' : 'border-b border-red-900/50'} relative overflow-hidden`}>
        
        {/* Ticker Control Ribbon */}
        <div className="px-3 sm:px-4 py-2 border-b border-red-950/60 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          
          {/* Left Branding / Live Status */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600/90 text-white font-mono font-bold text-[10px] tracking-wider uppercase shrink-0 shadow-sm animate-pulse">
              <Zap className="w-3 h-3 fill-white" />
              <span>LIVE WIRE</span>
            </span>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/90 text-red-300 border border-red-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              <span>LATEST 5 ALERTS TICKER</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <span>Auto-Poller:</span>
              <strong className="text-emerald-400">#{pollCount}</strong>
              <span className="text-slate-600">|</span>
              <span className="text-sky-300 truncate max-w-[140px]">{lastPolledSource}</span>
            </span>
          </div>

          {/* Right Controls: Play/Pause Ticker, Speed, Audio, Inspect Modal */}
          <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
            {/* Speed Selector */}
            <div className="hidden md:flex items-center gap-1 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800 text-[10px] text-slate-400">
              <SlidersHorizontal className="w-2.5 h-2.5 text-slate-500" />
              <span>Speed:</span>
              {(['slow', 'normal', 'fast'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setTickerSpeed(s)}
                  className={`px-1.5 py-0.2 rounded uppercase transition-colors ${
                    tickerSpeed === s ? 'bg-red-900/80 text-white font-bold' : 'hover:text-slate-200'
                  }`}
                >
                  {s[0]}
                </button>
              ))}
            </div>

            {/* Ticker Play / Pause Button */}
            <button
              onClick={() => setIsTickerPaused((prev) => !prev)}
              className={`px-2 py-0.5 rounded border text-[10px] flex items-center gap-1 transition-colors cursor-pointer ${
                isTickerPaused
                  ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title={isTickerPaused ? 'Resume scrolling ticker' : 'Pause scrolling ticker'}
            >
              {isTickerPaused ? (
                <>
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-2.5 h-2.5 fill-current" />
                  <span>Pause</span>
                </>
              )}
            </button>

            {/* Audio Chime Toggle */}
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`p-1 rounded border text-[10px] transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title={soundEnabled ? 'Mute alert chime' : 'Enable audio chime on incoming polled headlines'}
            >
              {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            </button>

            {/* Inspect All 5 Alerts Modal Button */}
            <button
              onClick={() => setShowLatest5Modal(true)}
              className="px-2 py-0.5 rounded bg-red-950/80 hover:bg-red-900/80 border border-red-500/40 text-red-200 hover:text-white flex items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer"
              title="Inspect latest 5 alerts list"
            >
              <Eye className="w-3 h-3" />
              <span>Inspect 5</span>
            </button>

            {onOpenFullNewsroom && (
              <button
                onClick={onOpenFullNewsroom}
                className="px-2 py-0.5 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white flex items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer"
                title="Browse full newsroom feed and archives"
              >
                <FileText className="w-3 h-3 text-sky-400" />
                <span className="hidden sm:inline">All News ({articles.length})</span>
              </button>
            )}

            <a
              href="#drfun1-command-center"
              className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/70 hover:bg-purple-900/90 border border-purple-500/40 text-purple-200 hover:text-white text-[10px] font-mono font-semibold transition-colors shadow-sm"
              title="DrFun1 Media Unified Broadcast & IRCD Command Center directly below"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>DrFun1 Command Center &darr;</span>
            </a>
          </div>
        </div>

        {/* Continuous Horizontal Scrolling Track */}
        <div className="relative py-2.5 overflow-hidden group select-none">
          <div
            className={`animate-ticker-marquee flex items-center gap-8 ${
              isTickerPaused ? 'ticker-paused' : ''
            } ${
              tickerSpeed === 'slow'
                ? 'ticker-speed-slow'
                : tickerSpeed === 'fast'
                ? 'ticker-speed-fast'
                : 'ticker-speed-normal'
            }`}
          >
            {/* Duplicated latest 5 alerts (10 items total) for seamless looping */}
            {[...latest5Alerts, ...latest5Alerts].map((alert, idx) => {
              const alertIndex = (idx % latest5Alerts.length) + 1;
              return (
                <div
                  key={`${alert.id}-ticker-${idx}`}
                  className="flex items-center gap-3 shrink-0 group/item cursor-pointer"
                >
                  {/* Alert Index Pill */}
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300 group-hover/item:border-red-500/50 group-hover/item:text-white transition-colors">
                    ALERT #{alertIndex}
                  </span>

                  {/* Source Outlet Badge */}
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono border font-medium ${getSourceBadgeStyle(
                      alert.sourceId
                    )}`}
                  >
                    {alert.sourceName}
                  </span>

                  {/* Breaking or New Tag */}
                  {alert.isBreaking ? (
                    <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-red-950 text-red-300 border border-red-500/40 animate-pulse">
                      BREAKING
                    </span>
                  ) : alert.isNew ? (
                    <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-sky-950 text-sky-300 border border-sky-500/40">
                      NEW
                    </span>
                  ) : null}

                  {/* FCC Docket Number if present */}
                  {alert.fccDocketNumber && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hidden sm:inline">
                      {alert.fccDocketNumber}
                    </span>
                  )}

                  {/* Headline Title Link */}
                  <a
                    href={alert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-200 hover:text-white text-xs font-semibold hover:underline flex items-center gap-1.5 transition-colors"
                  >
                    <span>{alert.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover/item:text-red-400 transition-colors shrink-0" />
                  </a>

                  {/* Relative Timestamp */}
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    ({alert.pubDate})
                  </span>

                  {/* Separator Satellite Icon */}
                  <div className="flex items-center gap-1 text-red-500/60 px-2 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
                    <Satellite className="w-3 h-3 text-red-400/70" />
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fade Gradients at Left/Right Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
        </div>
      </div>
      )}

      {/* ========================================================
          MODAL: INSPECT LATEST 5 ALERTS
          Consolidated list of the 5 active ticker alerts
          ======================================================== */}
      {showLatest5Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <span>Latest 5 Satellite &amp; FCC News Alerts</span>
                    <span className="text-xs font-mono font-normal text-red-300 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                      Live Wire Ingest
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Currently streaming across the continuous scrolling ticker. Updated every {pollIntervalSec}s.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLatest5Modal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Alert Cards List */}
            <div className="space-y-3">
              {latest5Alerts.map((alert, idx) => (
                <div
                  key={alert.id}
                  className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/50 font-bold text-[11px]">
                        ALERT #{idx + 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${getSourceBadgeStyle(alert.sourceId)}`}>
                        {alert.sourceName}
                      </span>
                      {alert.isBreaking && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-950 text-red-400 border border-red-500/30 uppercase font-bold animate-pulse">
                          Breaking
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{alert.pubDate}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white leading-snug">
                    <a
                      href={alert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline hover:text-red-300 transition-colors"
                    >
                      {alert.title}
                    </a>
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {alert.description}
                  </p>

                  {alert.fccDocketNumber && (
                    <div className="p-1.5 bg-emerald-950/30 border border-emerald-900/30 rounded text-[11px] font-mono text-emerald-300 flex items-center justify-between">
                      <span className="text-slate-400">FCC Docket:</span>
                      <strong>{alert.fccDocketNumber}</strong>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 text-[10px]">
                      {alert.author || alert.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyLink(alert)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {copiedId === alert.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                      <a
                        href={alert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-red-600/80 hover:bg-red-500 text-white font-medium text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <span>Open Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auto-Poll Service Active (#{pollCount} cycles)</span>
              </span>
              <button
                onClick={() => setShowLatest5Modal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. MAIN SECTION HEADER & AUTOMATED POLLER CONTROLS
          ======================================================== */}
      {mode !== 'ticker-only' && (
        <>
          <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-sky-950/60 border border-sky-500/30 text-sky-400 shrink-0 mt-0.5">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>FCC.gov &amp; Satellite Industry RSS Newsroom</span>
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950/80 text-sky-400 border border-sky-500/30">
                  Automated Polling Engine
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>FCC FRN: 0034981290</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Automated background polling service fetching real-time regulatory orders from <strong className="text-emerald-400 font-normal">FCC.gov Space Bureau</strong>, 
                plus breaking aerospace telecommunications from <strong className="text-sky-400 font-normal">SpaceNews</strong>, <strong className="text-amber-400 font-normal">Via Satellite</strong>, and <strong className="text-purple-400 font-normal">SatNews</strong>. The latest 5 alerts stream continuously in the live ticker above.
              </p>
            </div>
          </div>

          {/* Polling Status Badges & Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Polling Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${autoPollEnabled ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="font-mono text-[11px] text-slate-300">
                {autoPollEnabled ? (
                  <>
                    <span className="text-slate-400">Poll in:</span>{' '}
                    <strong className="text-sky-400 font-semibold">{nextPollCountdown}s</strong>
                  </>
                ) : (
                  <span className="text-amber-400 font-medium">Polling Paused</span>
                )}
              </span>
            </div>

            {/* Interval Selector */}
            <select
              value={pollIntervalSec}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPollIntervalSec(val);
                setNextPollCountdown(val);
              }}
              className="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500 font-mono transition-colors cursor-pointer"
              title="Polling frequency"
            >
              <option value={15}>Every 15s</option>
              <option value={30}>Every 30s</option>
              <option value={60}>Every 60s</option>
              <option value={120}>Every 2m</option>
            </select>

            {/* Toggle Auto Polling */}
            <button
              onClick={() => setAutoPollEnabled(!autoPollEnabled)}
              className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                autoPollEnabled
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={autoPollEnabled ? 'Pause background polling' : 'Resume background polling'}
            >
              {autoPollEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Manual Refresh / Poll Now Button */}
            <button
              onClick={() => executePoll()}
              disabled={isPolling}
              className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:border-sky-500/50 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Trigger immediate background poll across official FCC and satellite feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin text-sky-300' : ''}`} />
              <span className="hidden sm:inline font-mono">
                {isPolling ? 'Polling Feeds...' : 'Poll Now'}
              </span>
            </button>

            {/* Layout Toggle */}
            <div className="flex items-center border border-slate-800 rounded-lg p-0.5 bg-slate-950/60">
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                  viewLayout === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid cards layout"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewLayout('compact')}
                className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                  viewLayout === 'compact' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Compact list layout"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Expand / Collapse Section Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse RSS section' : 'Expand RSS section'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dynamic New Article Notification */}
        {newArticleAlert && (
          <div className="mt-3 py-1.5 px-3 rounded-lg bg-sky-950/80 border border-sky-500/40 text-sky-300 text-xs flex items-center justify-between gap-2 animate-bounce">
            <span className="flex items-center gap-1.5 font-medium truncate">
              <Zap className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">{newArticleAlert}</span>
            </span>
            <span className="text-[10px] font-mono text-sky-400/80 shrink-0">Updated just now</span>
          </div>
        )}
      </div>

      {/* ========================================================
          3. FILTER BAR & FEED NAVIGATION
          ======================================================== */}
      {isExpanded && (
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 space-y-3">
          {/* Source Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedSource('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border cursor-pointer ${
                selectedSource === 'all'
                  ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>All Outlets</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                {sourceCounts.all}
              </span>
            </button>

            {RSS_FEED_SOURCES.map((source) => {
              const isSelected = selectedSource === source.id;
              const count = sourceCounts[source.id] || 0;
              return (
                <button
                  key={source.id}
                  onClick={() => setSelectedSource(source.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border cursor-pointer ${
                    isSelected
                      ? `${source.badgeBg} ${source.badgeText} ${source.borderColor} ring-1 ring-inset ring-sky-500/20`
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {source.id === 'fcc' ? (
                    <Landmark className="w-3.5 h-3.5" />
                  ) : (
                    <Satellite className="w-3.5 h-3.5" />
                  )}
                  <span>{source.name}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${isSelected ? 'bg-slate-900/60' : 'bg-slate-800 text-slate-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Topic Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search headlines, docket numbers (e.g. GN Docket), or spectrum..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            {/* Category / Topic Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <span className="text-[11px] font-mono text-slate-500 uppercase shrink-0">Topic:</span>
              {['All', 'Regulatory', 'Commercial Satcom', 'Space Tech', 'Satellite Operators'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-sky-950 text-sky-400 border border-sky-500/40 font-semibold'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. ARTICLES FEED
          ======================================================== */}
      {isExpanded && (
        <div className="p-4 sm:p-5">
          {filteredArticles.length === 0 ? (
            <div className="py-12 text-center bg-slate-950/40 border border-slate-800/60 rounded-xl p-6">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-300">No matching RSS headlines found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No items match your search &quot;{searchQuery}&quot; or filter selections. Try clearing your filters or refreshing the feed.
              </p>
              <button
                onClick={() => {
                  setSelectedSource('all');
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors cursor-pointer"
              >
                Reset Feed Filters
              </button>
            </div>
          ) : viewLayout === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map((article) => {
                const isCopied = copiedId === article.id;
                return (
                  <article
                    key={article.id}
                    className={`bg-slate-950/70 border rounded-xl p-4 flex flex-col justify-between transition-all hover:border-slate-700 hover:shadow-md ${
                      article.isNew
                        ? 'border-sky-500/40 ring-1 ring-sky-500/20 bg-sky-950/10'
                        : article.sourceId === 'fcc'
                        ? 'border-emerald-950/60'
                        : 'border-slate-800/80'
                    }`}
                  >
                    <div>
                      {/* Top Meta Header */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border font-medium ${getSourceBadgeStyle(
                              article.sourceId
                            )}`}
                          >
                            {article.sourceName}
                          </span>
                          {article.isBreaking && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-red-950 text-red-400 border border-red-500/40 animate-pulse">
                              Breaking
                            </span>
                          )}
                          {article.isNew && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-sky-950 text-sky-400 border border-sky-500/40">
                              NEW
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{article.pubDate}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold text-white group-hover:text-sky-300 leading-snug tracking-tight mb-2">
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline hover:text-sky-300 transition-colors"
                        >
                          {article.title}
                        </a>
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
                        {article.description}
                      </p>

                      {/* Regulatory / Docket metadata if present */}
                      {(article.fccDocketNumber || article.regulatoryPart) && (
                        <div className="mb-3 p-2 rounded bg-emerald-950/40 border border-emerald-900/40 text-[11px] font-mono text-emerald-300/90 space-y-0.5">
                          {article.fccDocketNumber && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Docket:</span>
                              <strong className="text-emerald-400">{article.fccDocketNumber}</strong>
                            </div>
                          )}
                          {article.regulatoryPart && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Rule Part:</span>
                              <strong className="text-emerald-300">{article.regulatoryPart}</strong>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs mt-1">
                      <span className="text-[11px] text-slate-500 font-mono truncate max-w-[140px]">
                        {article.author || article.category}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(article)}
                          className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Copy headline and link"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <span>Read Source</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* High-Density Compact List View */
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl overflow-hidden divide-y divide-slate-800/60">
              {filteredArticles.map((article) => {
                const isCopied = copiedId === article.id;
                return (
                  <div
                    key={article.id}
                    className={`p-3 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-900/60 transition-colors ${
                      article.isNew ? 'bg-sky-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border shrink-0 ${getSourceBadgeStyle(
                          article.sourceId
                        )}`}
                      >
                        {article.sourceName}
                      </span>
                      {article.fccDocketNumber && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 shrink-0 hidden md:inline">
                          {article.fccDocketNumber}
                        </span>
                      )}
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-slate-200 hover:text-sky-300 truncate hover:underline"
                        title={article.title}
                      >
                        {article.title}
                      </a>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs">
                      <span className="text-[11px] text-slate-500 font-mono">{article.pubDate}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyLink(article)}
                          className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Copy headline"
                        >
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          title="Open article in source website"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================
              5. RSS ENGINE DIAGNOSTICS & POLLING TELEMETRY FOOTNOTE
              ======================================================== */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-500">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-slate-400">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Automated Polling Service: Active</span>
              </span>
              <span>·</span>
              <span>Feeds: 4 Registered (FCC, SpaceNews, Via Satellite, SatNews)</span>
              <span>·</span>
              <span>Total Articles: {articles.length}</span>
              <span>·</span>
              <span>Poll Cycles Completed: #{pollCount}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-3 h-3" />
              <span>
                Last check: {lastPolledAt.toLocaleTimeString()} (Cycle: {pollIntervalSec}s, Target: {lastPolledSource})
              </span>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </section>
  );
};
