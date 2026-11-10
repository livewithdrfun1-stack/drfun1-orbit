/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Satellite, Fiber, Wireless & Internet Newsroom & RSS Directory
 * Certified under Certificate ID: RAW-SATCOM-2026-LIC-0881 | FCC FRN: 0034981290
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  RssSourceId, 
  RssArticleItem,
  NewsCategory,
  CompanySector,
  AssociatedRssCompany,
  AssociatedStoreCompany,
  AssociatedStoreItem
} from '../types/rssNews';
import { 
  RSS_FEED_SOURCES, 
  INITIAL_RSS_ARTICLES, 
  BACKGROUND_SIMULATED_NEW_HEADLINES,
  getNextDynamicHeadline 
} from '../data/rssNewsData';
import { ASSOCIATED_RSS_COMPANIES } from '../data/rssCompanyListData';
import { ASSOCIATED_STORE_COMPANIES } from '../data/associatedStoreCompanyData';
import { 
  Radio, 
  Rss, 
  RefreshCw, 
  ExternalLink, 
  Clock, 
  Search, 
  CheckCircle2, 
  Landmark, 
  Satellite, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  ShieldCheck, 
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
  SlidersHorizontal,
  X,
  Sparkles,
  Rocket,
  Globe,
  Network,
  Building2,
  Smartphone,
  Server,
  Scale,
  MapPin,
  ArrowRight,
  ShoppingBag,
  Tag,
  DollarSign,
  PackageCheck,
  Truck
} from 'lucide-react';

export interface SatelliteRssNewsSectionProps {
  mode?: 'full' | 'ticker-only' | 'feed-only';
  onOpenFullNewsroom?: () => void;
  onNavigateToStore?: (partnerOrCategory?: string) => void;
  className?: string;
}

export const SatelliteRssNewsSection: React.FC<SatelliteRssNewsSectionProps> = ({
  mode = 'full',
  onOpenFullNewsroom,
  onNavigateToStore,
  className = ''
}) => {
  // Articles repository
  const [articles, setArticles] = useState<RssArticleItem[]>(INITIAL_RSS_ARTICLES);
  
  // Section Navigation: Live Feed vs Associated Companies & RSS Feeds vs Store Catalog
  const [activeViewMode, setActiveViewMode] = useState<'feed' | 'companies' | 'store'>('feed');

  // Filtering & View state
  const [selectedSource, setSelectedSource] = useState<RssSourceId>('all');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [viewLayout, setViewLayout] = useState<'grid' | 'compact'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Companies Directory State
  const [selectedCompanySector, setSelectedCompanySector] = useState<'All' | CompanySector>('All');
  const [companySearchQuery, setCompanySearchQuery] = useState<string>('');
  const [copiedRssId, setCopiedRssId] = useState<string | null>(null);

  // Store Companies & Hardware Catalog State (drfun1 ECOM)
  const [selectedStoreSector, setSelectedStoreSector] = useState<'All' | CompanySector>('All');
  const [storeSearchQuery, setStoreSearchQuery] = useState<string>('');
  const [selectedStoreCompanyFilter, setSelectedStoreCompanyFilter] = useState<string>('All');
  const [storeToastNotice, setStoreToastNotice] = useState<string | null>(null);

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

      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
      const res = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const data = await res.json();

      if (data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
        const source = RSS_FEED_SOURCES.find((s) => s.id === sourceId);
        return data.items.slice(0, 3).map((raw: {
          title?: string;
          description?: string;
          link?: string;
          pubDate?: string;
          author?: string;
        }, idx: number) => ({
          id: `live-${sourceId}-${Date.now()}-${idx}`,
          sourceId,
          sourceName: source?.name || sourceId.toUpperCase(),
          title: raw.title || 'Breaking Satellite Telecommunications Order',
          description: raw.description ? raw.description.replace(/<[^>]*>?/gm, '').slice(0, 260) + '...' : 'Real-time telemetry update.',
          link: raw.link || source?.websiteUrl || '#',
          pubDate: raw.pubDate ? new Date(raw.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
          timestamp: Date.now(),
          category: sourceId === 'fcc' ? 'Regulatory Updates' : 'Constellation Launches',
          tags: [sourceId.toUpperCase(), 'Live RSS Feed', 'Real-Time Update'],
          isNew: true,
          author: raw.author || source?.name,
        }));
      }
      return null;
    } catch (_) {
      return null;
    }
  };

  // Automated background polling execution
  const executePoll = useCallback(async () => {
    setIsPolling(true);
    pollCycleCountRef.current += 1;
    const currentTargetSourceId = RSS_FEED_SOURCES[(pollCycleCountRef.current - 1) % RSS_FEED_SOURCES.length].id;
    const targetSourceConfig = RSS_FEED_SOURCES.find((s) => s.id === currentTargetSourceId);
    setLastPolledSource(targetSourceConfig?.name || 'FCC.gov Space Bureau');

    let freshArticles: RssArticleItem[] = [];

    if (targetSourceConfig?.feedUrl) {
      const liveNetworkItems = await fetchFeedFromNetwork(targetSourceConfig.feedUrl, currentTargetSourceId);
      if (liveNetworkItems && liveNetworkItems.length > 0) {
        freshArticles = liveNetworkItems;
      }
    }

    if (freshArticles.length === 0) {
      if (unusedHeadlinesRef.current.length > 0) {
        const candidate = unusedHeadlinesRef.current.shift()!;
        freshArticles = [{
          ...candidate,
          id: `${candidate.id}-${Date.now()}`,
          timestamp: Date.now(),
          pubDate: 'Just now',
          isNew: true,
        }];
      } else {
        freshArticles = [getNextDynamicHeadline(pollCycleCountRef.current)];
      }
    }

    if (freshArticles.length > 0) {
      setArticles((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const newOnes = freshArticles.filter((a) => !existingIds.has(a.id));
        if (newOnes.length === 0) return prev;
        return [...newOnes, ...prev.slice(0, 45)];
      });

      const primaryAlert = freshArticles[0].title;
      setNewArticleAlert(primaryAlert);
      playAlertChime();
      setTimeout(() => setNewArticleAlert(null), 4500);
    }

    setLastPolledAt(new Date());
    setPollCount((prev) => prev + 1);
    setIsPolling(false);
  }, [playAlertChime]);

  // Interval timer for automated polling
  useEffect(() => {
    if (!autoPollEnabled) return;

    countdownTimerRef.current = setInterval(() => {
      setNextPollCountdown((prev) => {
        if (prev <= 1) {
          executePoll();
          return pollIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [autoPollEnabled, pollIntervalSec, executePoll]);

  // Latest 5 articles for the real-time ticker
  const latest5Articles = useMemo(() => {
    return articles.slice(0, 5);
  }, [articles]);

  // Category Filter Configuration
  const CATEGORY_FILTERS: { 
    id: NewsCategory; 
    label: string; 
    icon: React.ComponentType<{ className?: string }>; 
    badgeColor: string; 
    borderColor: string;
    description: string;
  }[] = [
    { 
      id: 'All Categories', 
      label: 'All News', 
      icon: Sparkles, 
      badgeColor: 'text-sky-400 bg-sky-950/60', 
      borderColor: 'border-sky-500/40',
      description: 'Complete unified feed across all sectors and regulatory bodies'
    },
    { 
      id: 'Constellation Launches', 
      label: 'Constellation Launches', 
      icon: Rocket, 
      badgeColor: 'text-purple-400 bg-purple-950/60', 
      borderColor: 'border-purple-500/40',
      description: 'SpaceX Falcon 9, ULA Atlas V, ISRO, and LEO satellite cluster insertions'
    },
    { 
      id: 'Fiber Expansion', 
      label: 'Fiber Expansion', 
      icon: Zap, 
      badgeColor: 'text-emerald-400 bg-emerald-950/60', 
      borderColor: 'border-emerald-500/40',
      description: 'Switch 100G Superloop, RisingNet 400G waves, Quantum Fiber 8G, and Zayo DWDM'
    },
    { 
      id: 'Regulatory Updates', 
      label: 'Regulatory Updates', 
      icon: Landmark, 
      badgeColor: 'text-amber-400 bg-amber-950/60', 
      borderColor: 'border-amber-500/40',
      description: 'FCC Space Bureau Part 25 orders, SCS frameworks, and Witt Law Firm filings (FRN 0034981290)'
    },
    { 
      id: 'Wireless & 5G NTN', 
      label: 'Wireless & 5G NTN', 
      icon: Radio, 
      badgeColor: 'text-blue-400 bg-blue-950/60', 
      borderColor: 'border-blue-500/40',
      description: 'Direct-to-cell smartphones, 3GPP Rel-19 non-terrestrial networks, and BlueBird 5G'
    },
    { 
      id: 'Satellite Internet & Teleports', 
      label: 'Satellite Internet & Teleports', 
      icon: Globe, 
      badgeColor: 'text-cyan-400 bg-cyan-950/60', 
      borderColor: 'border-cyan-500/40',
      description: 'High-throughput Ka-band gateways, Jupiter-3, Viasat GX maritime, and ground stations'
    },
  ];

  // Item counts per news category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'All Categories': articles.length,
      'Constellation Launches': 0,
      'Fiber Expansion': 0,
      'Regulatory Updates': 0,
      'Wireless & 5G NTN': 0,
      'Satellite Internet & Teleports': 0,
    };
    articles.forEach((a) => {
      if (counts[a.category] !== undefined) {
        counts[a.category]++;
      } else {
        counts[a.category] = (counts[a.category] || 0) + 1;
      }
    });
    return counts;
  }, [articles]);

  // Filtered articles for the main newsroom section
  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      const matchesSource = selectedSource === 'all' || item.sourceId === selectedSource;
      const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
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

  // Filtered Associated Companies
  const filteredCompanies = useMemo(() => {
    return ASSOCIATED_RSS_COMPANIES.filter((c) => {
      const matchesSector = selectedCompanySector === 'All' || c.sector === selectedCompanySector;
      const q = companySearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.headquarters.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.drfun1Association.toLowerCase().includes(q) ||
        c.keyCapabilities.some((cap) => cap.toLowerCase().includes(q));

      return matchesSector && matchesSearch;
    });
  }, [selectedCompanySector, companySearchQuery]);

  const companySectorCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: ASSOCIATED_RSS_COMPANIES.length,
      Satellite: 0,
      Fiber: 0,
      Wireless: 0,
      Internet: 0,
    };
    ASSOCIATED_RSS_COMPANIES.forEach((c) => {
      counts[c.sector] = (counts[c.sector] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered Store Companies
  const filteredStoreCompanies = useMemo(() => {
    return ASSOCIATED_STORE_COMPANIES.filter((c) => {
      const matchesSector = selectedStoreSector === 'All' || c.sector === selectedStoreSector;
      const matchesCompany = selectedStoreCompanyFilter === 'All' || c.id === selectedStoreCompanyFilter;
      const q = storeSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.companyName.toLowerCase().includes(q) ||
        c.brandTagline.toLowerCase().includes(q) ||
        c.headquarters.toLowerCase().includes(q) ||
        c.drfun1EcomPartnerType.toLowerCase().includes(q) ||
        c.featuredProducts.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.hardwareType.toLowerCase().includes(q) ||
            p.specsSummary.toLowerCase().includes(q)
        );

      return matchesSector && matchesCompany && matchesSearch;
    });
  }, [selectedStoreSector, selectedStoreCompanyFilter, storeSearchQuery]);

  const totalStoreProductsCount = useMemo(() => {
    return ASSOCIATED_STORE_COMPANIES.reduce((acc, c) => acc + c.featuredProducts.length, 0);
  }, []);

  const storeSectorCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: ASSOCIATED_STORE_COMPANIES.length,
      Satellite: 0,
      Fiber: 0,
      Wireless: 0,
      Internet: 0,
    };
    ASSOCIATED_STORE_COMPANIES.forEach((c) => {
      counts[c.sector] = (counts[c.sector] || 0) + 1;
    });
    return counts;
  }, []);

  const handleOrderStoreItem = (item: AssociatedStoreItem, companyName: string) => {
    setStoreToastNotice(`PO Staged: ${item.name} (${item.sku}) via ${companyName}. Supervised by Richard Alan Witt, Esq. (FRN 0034981290)`);
    setTimeout(() => setStoreToastNotice(null), 4000);
  };

  const handleCopyLink = (article: RssArticleItem) => {
    navigator.clipboard.writeText(`${article.title} - ${article.link}`);
    setCopiedId(article.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCompanyRss = (company: AssociatedRssCompany) => {
    navigator.clipboard.writeText(company.rssFeedUrl);
    setCopiedRssId(company.id);
    setTimeout(() => setCopiedRssId(null), 2500);
  };

  const handleFilterNewsForCompany = (companyName: string) => {
    const keyword = companyName.split(' ')[0]; // e.g. Starlink, Amazon, Switch, RisingNet, AST, Viasat
    setSearchQuery(keyword);
    setSelectedCategory('All Categories');
    setSelectedSource('all');
    setActiveViewMode('feed');
  };

  const handleSwitchToCompanyStore = (companyName: string) => {
    const matched = ASSOCIATED_STORE_COMPANIES.find(c => c.companyName.toLowerCase().includes(companyName.toLowerCase().split(' ')[0]));
    if (matched) {
      setSelectedStoreCompanyFilter(matched.id);
    } else {
      setStoreSearchQuery(companyName.split(' ')[0]);
    }
    setActiveViewMode('store');
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

  const getSectorBadgeStyle = (sector: CompanySector) => {
    switch (sector) {
      case 'Satellite':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/40';
      case 'Fiber':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
      case 'Wireless':
        return 'bg-blue-950/80 text-blue-300 border-blue-500/40';
      case 'Internet':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <section className={`bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm relative ${className}`}>
      
      {/* ========================================================
          1. REAL-TIME SCROLLING TICKER: LATEST 5 ALERTS
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
                  className={`px-1.5 py-0.2 rounded uppercase transition-colors cursor-pointer ${
                    tickerSpeed === s ? 'bg-red-900/80 text-white font-bold' : 'hover:text-slate-200'
                  }`}
                >
                  {s[0]}
                </button>
              ))}
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playAlertChime();
              }}
              className={`p-1 rounded border text-[10px] flex items-center gap-1 transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={soundEnabled ? 'Mute notification chimes' : 'Enable audio chime on new alerts'}
            >
              {soundEnabled ? <Volume2 className="w-3 h-3 text-emerald-400" /> : <VolumeX className="w-3 h-3 text-slate-500" />}
              <span className="hidden lg:inline">{soundEnabled ? 'Sound ON' : 'Mute'}</span>
            </button>

            {/* Play/Pause Ticker */}
            <button
              onClick={() => setIsTickerPaused(!isTickerPaused)}
              className={`p-1 rounded border text-[10px] flex items-center gap-1 transition-colors cursor-pointer ${
                isTickerPaused
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={isTickerPaused ? 'Resume scrolling ticker' : 'Pause scrolling ticker'}
            >
              {isTickerPaused ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3 text-slate-400" />}
              <span className="hidden lg:inline">{isTickerPaused ? 'Paused' : 'Scroll'}</span>
            </button>

            {/* Modal Inspector for 5 Headlines */}
            <button
              onClick={() => setShowLatest5Modal(true)}
              className="px-2 py-0.5 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
              title="Inspect latest 5 alerts in high-visibility view"
            >
              <Eye className="w-3 h-3 text-sky-400" />
              <span>Inspect 5</span>
            </button>
          </div>
        </div>

        {/* Marquee Body */}
        <div 
          className="py-2.5 px-3 overflow-hidden whitespace-nowrap relative select-none flex items-center"
          onMouseEnter={() => setIsTickerPaused(true)}
          onMouseLeave={() => setIsTickerPaused(false)}
        >
          <div 
            className={`inline-flex items-center gap-6 ${isTickerPaused ? 'style-paused' : ''}`}
            style={{
              animation: isTickerPaused 
                ? 'none' 
                : `marquee-scroll ${tickerSpeed === 'fast' ? '25s' : tickerSpeed === 'slow' ? '55s' : '38s'} linear infinite`,
            }}
          >
            {[...latest5Articles, ...latest5Articles].map((item, index) => (
              <div 
                key={`${item.id}-${index}`}
                className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/85 border border-red-950/70 hover:border-red-500/50 hover:bg-slate-850 transition-all shadow-sm"
              >
                <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span>#{((index % 5) + 1)}</span>
                </span>

                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border font-semibold ${getSourceBadgeStyle(item.sourceId)}`}>
                  {item.sourceName.split(' ')[0]}
                </span>

                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-950/60 text-purple-300 border border-purple-500/30">
                  {item.category}
                </span>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-slate-100 hover:text-sky-300 truncate max-w-sm sm:max-w-md hover:underline transition-colors"
                >
                  {item.title}
                </a>

                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {item.pubDate}
                </span>

                <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* ========================================================
          2. MAIN SECTION HEADER: TABS SWITCHER (NEWS vs COMPANIES) & POLLER
          ======================================================== */}
      {mode !== 'ticker-only' && (
        <>
          <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Left Brand Title & Mode Selector */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-950 via-indigo-950 to-purple-950 border border-sky-500/30 text-sky-400 shrink-0 mt-0.5 shadow-md">
                  <Rss className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span>Satellite, Fiber &amp; Wireless RSS Newsroom</span>
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950/80 text-sky-400 border border-sky-500/30">
                      DrFun1 Media Ent
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>FCC FRN: 0034981290</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                    Official real-time telecommunications newsroom and associated company RSS directory for DrFun1 Media Inc. &amp; DrFun1 ECOM Inc. Powered by Switch SUPERNAP 100G teleports, RisingNet optical transit, and FCC Space Bureau regulatory filings under Witt Law Firm.
                  </p>

                  {/* Primary Tab Toggle: Live Newsfeed vs Associated Companies */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setActiveViewMode('feed')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                        activeViewMode === 'feed'
                          ? 'bg-sky-500/20 text-white border-sky-500/60 shadow-md shadow-sky-950/40 ring-1 ring-sky-500/30'
                          : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <Rss className="w-3.5 h-3.5 text-sky-400" />
                      <span>Live Newsfeed &amp; Alerts</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-950 text-sky-300 border border-slate-800">
                        {articles.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveViewMode('companies')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                        activeViewMode === 'companies'
                          ? 'bg-purple-500/20 text-white border-purple-500/60 shadow-md shadow-purple-950/40 ring-1 ring-purple-500/30'
                          : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Associated Companies &amp; RSS Feeds</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-500/30 font-bold">
                        {ASSOCIATED_RSS_COMPANIES.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveViewMode('store')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                        activeViewMode === 'store'
                          ? 'bg-amber-500/20 text-white border-amber-500/60 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/30'
                          : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Store &amp; Hardware Catalog</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/30 font-bold">
                        {ASSOCIATED_STORE_COMPANIES.length} Stores ({totalStoreProductsCount} Items)
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Controls: Auto-Poller, Interval, Layout, Collapse */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {activeViewMode === 'feed' && (
                  <>
                    {/* Polling Countdown Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono">
                      <span className={`w-2 h-2 rounded-full ${autoPollEnabled ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                      <span className="text-[11px] text-slate-300">
                        {autoPollEnabled ? (
                          <>
                            <span className="text-slate-400">Poll:</span>{' '}
                            <strong className="text-sky-400 font-semibold">{nextPollCountdown}s</strong>
                          </>
                        ) : (
                          <span className="text-amber-400 font-medium">Paused</span>
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
                    </select>

                    {/* Manual Refresh / Poll Now Button */}
                    <button
                      onClick={() => executePoll()}
                      disabled={isPolling}
                      className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:border-sky-500/50 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                      title="Trigger immediate background poll across official FCC and satellite feeds"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin text-sky-300' : ''}`} />
                      <span className="hidden sm:inline font-mono">
                        {isPolling ? 'Polling...' : 'Poll Feeds'}
                      </span>
                    </button>

                    {/* Layout Toggle */}
                    <div className="flex items-center border border-slate-800 rounded-lg p-0.5 bg-slate-950/60">
                      <button
                        onClick={() => setViewLayout('grid')}
                        className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                          viewLayout === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Grid layout"
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
                  </>
                )}

                {/* Expand / Collapse Section Button */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  title={isExpanded ? 'Collapse section' : 'Expand section'}
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
              VIEW 1: LIVE NEWSFEED WITH DEDICATED CATEGORY FILTER BUTTONS
              ======================================================== */}
          {isExpanded && activeViewMode === 'feed' && (
            <div className="space-y-4">
              
              {/* CATEGORY FILTER BUTTONS RIBBON */}
              <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      News Categories:
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                      Filter live wire by satellite, fiber, wireless, or regulatory focus
                    </span>
                  </div>

                  {selectedCategory !== 'All Categories' && (
                    <button
                      onClick={() => setSelectedCategory('All Categories')}
                      className="text-[11px] font-mono text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Show All Categories</span>
                    </button>
                  )}
                </div>

                {/* Filter Buttons Grid for Specific Categories */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
                  {CATEGORY_FILTERS.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    const count = categoryCounts[cat.id] || 0;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? `bg-slate-900 border-sky-500/80 ring-2 ring-sky-500/30 shadow-lg shadow-sky-950/30`
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                        title={cat.description}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <div className={`p-1.5 rounded-lg border ${cat.borderColor} ${cat.badgeColor}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            isSelected ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800'
                          }`}>
                            {count}
                          </span>
                        </div>

                        <div>
                          <div className={`text-xs font-bold leading-tight ${
                            isSelected ? 'text-white' : 'text-slate-300'
                          }`}>
                            {cat.label}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {cat.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Secondary Filters: Outlets and Keywords */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                  
                  {/* Source Outlets */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                    <span className="text-[11px] font-mono text-slate-500 uppercase shrink-0 mr-1">
                      Outlet:
                    </span>
                    <button
                      onClick={() => setSelectedSource('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
                        selectedSource === 'all'
                          ? 'bg-slate-800 text-white border-slate-600'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      All Outlets ({sourceCounts.all})
                    </button>
                    {RSS_FEED_SOURCES.map((src) => {
                      const isSel = selectedSource === src.id;
                      return (
                        <button
                          key={src.id}
                          onClick={() => setSelectedSource(src.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border cursor-pointer flex items-center gap-1 ${
                            isSel
                              ? `${src.badgeBg} ${src.badgeText} ${src.borderColor} ring-1 ring-sky-500/20`
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          <span>{src.name}</span>
                          <span className="text-[10px] font-mono opacity-80">({sourceCounts[src.id] || 0})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full lg:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Starlink, Switch, Part 25, 100G..."
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
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
                </div>
              </div>

              {/* ARTICLES FEED BODY */}
              <div className="p-4 sm:p-5 pt-0">
                {filteredArticles.length === 0 ? (
                  <div className="py-12 text-center bg-slate-950/40 border border-slate-800/60 rounded-xl p-6">
                    <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-slate-300">No matching RSS headlines found</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      No items match &quot;{searchQuery}&quot; in category &quot;{selectedCategory}&quot;. Try resetting your filters.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedSource('all');
                        setSelectedCategory('All Categories');
                        setSearchQuery('');
                      }}
                      className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Reset All Filters
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
                          className={`bg-slate-950/70 border rounded-xl p-4 flex flex-col justify-between transition-all hover:border-slate-700 hover:shadow-lg ${
                            article.isNew
                              ? 'border-sky-500/40 ring-1 ring-sky-500/20 bg-sky-950/10'
                              : 'border-slate-800/80'
                          }`}
                        >
                          <div>
                            {/* Top Meta Header */}
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-medium ${getSourceBadgeStyle(article.sourceId)}`}>
                                  {article.sourceName}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-500/30">
                                  {article.category}
                                </span>
                                {article.isBreaking && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-red-950 text-red-400 border border-red-500/40 animate-pulse">
                                    Breaking
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono shrink-0">
                                <Clock className="w-3 h-3" />
                                <span>{article.pubDate}</span>
                              </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-sm font-bold text-white hover:text-sky-300 leading-snug tracking-tight mb-2">
                              <a
                                href={article.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline transition-colors"
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
                              <div className="mb-3 p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/40 text-[11px] font-mono text-emerald-300/90 space-y-0.5">
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
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-[11px] flex items-center gap-1 transition-colors"
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
                  /* Compact List View */
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
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border shrink-0 ${getSourceBadgeStyle(article.sourceId)}`}>
                              {article.sourceName.split(' ')[0]}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-500/30 shrink-0 hidden md:inline">
                              {article.category}
                            </span>
                            {article.fccDocketNumber && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 shrink-0 hidden lg:inline">
                                {article.fccDocketNumber}
                              </span>
                            )}
                            <a
                              href={article.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-slate-200 hover:text-sky-300 truncate hover:underline"
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
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
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
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 2: ASSOCIATED COMPANIES & OFFICIAL RSS DIRECTORY
              (SATELLITE / FIBER / WIRELESS / INTERNET)
              ======================================================== */}
          {isExpanded && activeViewMode === 'companies' && (
            <div className="p-4 sm:p-5 space-y-5">
              
              {/* Top Banner Explaining DrFun1 Media Ent Association */}
              <div className="bg-gradient-to-r from-purple-950/80 via-slate-950 to-emerald-950/80 border border-purple-500/40 rounded-xl p-4 sm:p-5 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-300 shrink-0 mt-0.5">
                      <Network className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          DrFun1 Media Ent &amp; DrFun1 ECOM Associated Telecommunications Mesh
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
                          22 Verified Companies
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-4xl">
                        Comprehensive directory of Satellite Constellations, Fiber Backbones, 5G Wireless NTN Carriers, and Internet Teleports directly integrated into DrFun1 Media Inc. &amp; DrFun1 ECOM Inc. infrastructure. Certified under <strong className="text-emerald-400 font-mono">Certificate ID: RAW-SATCOM-2026-LIC-0881</strong> and <strong className="text-sky-400 font-mono">FCC FRN: 0034981290</strong> (The Law Office of Richard A. Witt LLC). Each company features an active, live RSS feed that you can copy or filter news by.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                    <div className="px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Master Teleport:</span>
                        <span className="text-emerald-400 font-bold">Switch SUPERNAP NV</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Tier-1 IP Transit:</span>
                        <span className="text-sky-400 font-bold">RisingNet (352 Nodes)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sector Filter Buttons & Company Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                
                {/* Sector Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mr-1">
                    Sector:
                  </span>
                  {(['All', 'Satellite', 'Fiber', 'Wireless', 'Internet'] as const).map((sector) => {
                    const isSelected = selectedCompanySector === sector;
                    const count = companySectorCounts[sector];
                    return (
                      <button
                        key={sector}
                        onClick={() => setSelectedCompanySector(sector)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950/40 ring-1 ring-purple-400/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                        }`}
                      >
                        {sector === 'Satellite' && <Satellite className="w-3.5 h-3.5" />}
                        {sector === 'Fiber' && <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                        {sector === 'Wireless' && <Radio className="w-3.5 h-3.5 text-blue-400" />}
                        {sector === 'Internet' && <Globe className="w-3.5 h-3.5 text-cyan-400" />}
                        <span>{sector === 'All' ? 'All Sectors' : sector}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                          isSelected ? 'bg-purple-950 text-purple-200' : 'bg-slate-950 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Company Search Input */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={companySearchQuery}
                    onChange={(e) => setCompanySearchQuery(e.target.value)}
                    placeholder="Search company, tech, or location..."
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  {companySearchQuery && (
                    <button
                      onClick={() => setCompanySearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Companies Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompanies.map((comp) => {
                  const isRssCopied = copiedRssId === comp.id;
                  return (
                    <div
                      key={comp.id}
                      className="bg-slate-950/80 border border-slate-800 hover:border-purple-500/40 rounded-xl p-4.5 flex flex-col justify-between transition-all hover:shadow-xl space-y-3.5"
                    >
                      {/* Top Meta: Sector, SLA, Name */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold uppercase ${getSectorBadgeStyle(comp.sector)}`}>
                            {comp.sector}
                          </span>
                          {comp.verifiedSla && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>{comp.verifiedSla}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-base font-bold text-white tracking-tight">
                              {comp.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{comp.headquarters}</span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
                          {comp.description}
                        </p>

                        {/* DrFun1 Media Ent Association Highlight Box */}
                        <div className="mt-3 p-2.5 rounded-lg bg-gradient-to-br from-purple-950/50 via-slate-900/90 to-emerald-950/40 border border-purple-500/30 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-300 uppercase">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>DrFun1 Media Ent &amp; ECOM Integration:</span>
                          </div>
                          <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                            {comp.drfun1Association}
                          </p>
                        </div>

                        {/* Frequency & Bandwidth */}
                        <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                          <span className="text-slate-500">Spec / Band:</span>
                          <span className="text-sky-300 font-semibold truncate max-w-[190px]">{comp.frequencyOrBandwidth}</span>
                        </div>

                        {/* Capabilities Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          {comp.keyCapabilities.map((cap) => (
                            <span
                              key={cap}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* RSS Feed Card & Direct Actions */}
                      <div className="pt-3 border-t border-slate-800/80 space-y-2 font-mono">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Rss className="w-3 h-3 text-amber-400" />
                            <strong className="text-slate-200 font-medium">Official RSS:</strong>
                          </span>
                          <span className="text-slate-500 text-[10px] truncate max-w-[150px]">
                            {comp.rssFeedTitle}
                          </span>
                        </div>

                        {/* RSS Feed URL snippet */}
                        <div className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 truncate select-all">
                          {comp.rssFeedUrl}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button
                            onClick={() => handleCopyCompanyRss(comp)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Copy direct RSS feed URL to clipboard"
                          >
                            {isRssCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-300">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Copy RSS</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleSwitchToCompanyStore(comp.name)}
                              className="px-2 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-500/40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="View hardware & store catalog for this company"
                            >
                              <ShoppingBag className="w-3 h-3 text-amber-400" />
                              <span>Store</span>
                            </button>

                            <button
                              onClick={() => handleFilterNewsForCompany(comp.name)}
                              className="px-2 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-200 border border-sky-500/40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Filter Live Newsfeed for this company"
                            >
                              <span>News</span>
                              <ArrowRight className="w-3 h-3 text-sky-400" />
                            </button>

                            <a
                              href={comp.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                              title="Visit official company website"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              2C. ASSOCIATED STORE & HARDWARE CATALOG VIEW (drfun1 ECOM inc)
              ======================================================== */}
          {isExpanded && activeViewMode === 'store' && (
            <div className="p-4 sm:p-5 space-y-6 animate-in fade-in duration-200">
              {/* Store Toast Notification */}
              {storeToastNotice && (
                <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-xl animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{storeToastNotice}</span>
                  </div>
                  <button
                    onClick={() => setStoreToastNotice(null)}
                    className="p-1 hover:bg-emerald-900/50 rounded text-emerald-400 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Store Directory Hero & Compliance Bar */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-950 to-indigo-950/60 border border-amber-500/40 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          Satellite, Fiber, Wireless &amp; Internet Store Directory
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                          drfun1 ECOM inc
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Procurement hardware, enterprise bandwidth CIR, factory-unlocked 5G phones, and optical dark fiber trunks.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Richard Alan Witt Escrow (FRN: 0034981290)</span>
                    </span>
                  </div>
                </div>

                {/* Sub-Filters: Sector & Search & Partner Filter */}
                <div className="pt-3 border-t border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Sector Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
                    {(['All', 'Satellite', 'Fiber', 'Wireless', 'Internet'] as const).map((sector) => (
                      <button
                        key={sector}
                        onClick={() => setSelectedStoreSector(sector)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          selectedStoreSector === sector
                            ? 'bg-amber-500/25 text-amber-200 border border-amber-500/60 font-bold shadow-sm'
                            : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                        }`}
                      >
                        <span>{sector}</span>
                        <span className="px-1 py-0.2 rounded text-[10px] bg-slate-950 text-slate-400">
                          {storeSectorCounts[sector]}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Search Input & Reset */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={storeSearchQuery}
                        onChange={(e) => setStoreSearchQuery(e.target.value)}
                        placeholder="Search store items, SKUs, specs..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                      />
                      {storeSearchQuery && (
                        <button
                          onClick={() => setStoreSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {selectedStoreCompanyFilter !== 'All' && (
                      <button
                        onClick={() => setSelectedStoreCompanyFilter('All')}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/40 text-xs font-mono cursor-pointer hover:bg-amber-900 whitespace-nowrap"
                      >
                        Reset Co Filter
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Store Company Cards Grid */}
              <div className="space-y-6">
                {filteredStoreCompanies.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40 space-y-3">
                    <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-white">No store companies match your filters</p>
                    <button
                      onClick={() => {
                        setSelectedStoreSector('All');
                        setSelectedStoreCompanyFilter('All');
                        setStoreSearchQuery('');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  filteredStoreCompanies.map((storeCo) => (
                    <div
                      key={storeCo.id}
                      className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 shadow-xl space-y-4 transition-all"
                    >
                      {/* Company Header Row */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold uppercase ${getSectorBadgeStyle(storeCo.sector)}`}>
                              {storeCo.sector}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950/80 text-sky-300 border border-sky-500/40 font-semibold">
                              {storeCo.drfun1EcomPartnerType}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
                              {storeCo.wholesaleDiscountPercent}% Wholesale Margin
                            </span>
                          </div>

                          <h4 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
                            {storeCo.companyName}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {storeCo.brandTagline}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                          <span className="text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{storeCo.headquarters}</span>
                          </span>
                          <span className="text-slate-700">·</span>
                          <a
                            href={storeCo.officialStoreUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 flex items-center gap-1.5 transition-colors"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Interconnect and Legal Info Bar */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-slate-300 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-400 uppercase">
                            <Server className="w-3.5 h-3.5 text-sky-400" />
                            <span>Switch Colocation &amp; IRC Peering:</span>
                          </div>
                          <p className="text-[11px] text-slate-300">{storeCo.switchColocationInterconnect}</p>
                          <p className="text-[10px] text-purple-400">NOC: {storeCo.unrealIrcdChannel}</p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Legal &amp; Statutory Escrow:</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-sans">{storeCo.drfun1LegalCompliance}</p>
                        </div>
                      </div>

                      {/* Featured Products Hardware Grid */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-amber-400" />
                            <span>Available Hardware &amp; Store Items ({storeCo.featuredProducts.length}):</span>
                          </span>
                          <span className="text-[11px] text-emerald-400">
                            DrFun1 Wholesale Direct Pricing
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {storeCo.featuredProducts.map((prod) => {
                            const savings = prod.retailPrice - prod.drfun1WholesalePrice;
                            return (
                              <div
                                key={prod.id}
                                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3"
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                                    <span className="px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                                      {prod.sku}
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                                      {prod.hardwareType}
                                    </span>
                                  </div>

                                  <h5 className="text-xs font-bold text-white leading-snug">
                                    {prod.name}
                                  </h5>

                                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                                    {prod.specsSummary}
                                  </p>

                                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                                    <span className="flex items-center gap-1 text-emerald-400">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      <span>{prod.inStock ? 'In Stock' : 'Allocated'}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Truck className="w-3 h-3 text-slate-500" />
                                      <span>{prod.leadTime}</span>
                                    </span>
                                  </div>
                                </div>

                                {/* Pricing and Action */}
                                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 font-mono">
                                  <div>
                                    <div className="flex items-center gap-1.5 text-[11px]">
                                      <span className="text-slate-500 line-through">
                                        ${prod.retailPrice.toLocaleString()}
                                      </span>
                                      <span className="text-sm font-bold text-emerald-400 tabular-nums">
                                        ${prod.drfun1WholesalePrice.toLocaleString()}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-normal">
                                        {prod.priceUnit === 'per_month' ? '/mo' : prod.priceUnit === 'per_mhz_month' ? '/MHz' : ''}
                                      </span>
                                    </div>
                                    {savings > 0 && (
                                      <span className="text-[10px] text-amber-400 font-semibold">
                                        Save ${savings.toLocaleString()}
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => handleOrderStoreItem(prod, storeCo.companyName)}
                                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
                                    title="Stage Purchase Order via DrFun1 ECOM"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Order PO</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              3. RSS ENGINE TELEMETRY FOOTNOTE
              ======================================================== */}
          {isExpanded && (
            <div className="px-4 sm:px-5 py-3 border-t border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-500">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 text-slate-400">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>DrFun1 Satellite &amp; Fiber Engine: Active</span>
                </span>
                <span>·</span>
                <span>Feeds: 4 Registered News Feeds</span>
                <span>·</span>
                <span>Associated Companies: {ASSOCIATED_RSS_COMPANIES.length}</span>
                <span>·</span>
                <span>Total Live Articles: {articles.length}</span>
                <span>·</span>
                <span>Cycles Completed: #{pollCount}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-3 h-3" />
                <span>
                  Last check: {lastPolledAt.toLocaleTimeString()} (Cycle: {pollIntervalSec}s, Target: {lastPolledSource})
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================
          4. INSPECT MODAL FOR LATEST 5 ALERTS
          ======================================================== */}
      {showLatest5Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-red-600/90 text-white font-mono font-bold text-xs">
                  <Zap className="w-4 h-4 fill-white" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Latest 5 Satellite &amp; FCC News Alerts</h3>
                  <p className="text-xs text-slate-400">Chronological high-priority news stream from active RSS feeds</p>
                </div>
              </div>
              <button
                onClick={() => setShowLatest5Modal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {latest5Articles.map((article, idx) => (
                <div
                  key={article.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-bold">Alert #{idx + 1}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] border ${getSourceBadgeStyle(article.sourceId)}`}>
                        {article.sourceName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30">
                        {article.category}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px]">{article.pubDate}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white hover:text-sky-300">
                    <a href={article.link} target="_blank" rel="noopener noreferrer">
                      {article.title}
                    </a>
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {article.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-500">
                    <span>{article.fccDocketNumber || article.author || 'Live Satellite Feed'}</span>
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <span>Read Story</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowLatest5Modal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
