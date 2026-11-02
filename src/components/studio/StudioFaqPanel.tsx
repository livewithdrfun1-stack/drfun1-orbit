/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Unified Studio FAQ & Platform Navigation Knowledge Base (Both FAQs in One Page)
 * Combines Platform Navigation Guidance, 10 Studio Systems Architecture,
 * Twitch/Kick Dev Integration, and Full Broadcast FAQ into a single page.
 */

import React, { useState, useMemo } from 'react';
import { FaqItem } from '../../types/developerPortals';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Code2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Radio as AntennaIcon, 
  Tv, 
  Sparkles, 
  Compass, 
  Zap, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  BookOpen, 
  MessageSquare, 
  Sliders, 
  Terminal, 
  Share2, 
  Network, 
  Plus, 
  Layers, 
  Maximize2,
  X as CloseIcon
} from 'lucide-react';

interface StudioFaqPanelProps {
  faqItems: FaqItem[];
  onNavigateToTool?: (toolId: string) => void;
  onOpenScanner?: () => void;
  onOpenWizard?: () => void;
  onOpenLicense?: () => void;
  onOpenSwitchWittServices?: () => void;
  onOpenIrc?: () => void;
  onOpenStore?: () => void;
}

export const StudioFaqPanel: React.FC<StudioFaqPanelProps> = ({ 
  faqItems,
  onNavigateToTool,
  onOpenScanner,
  onOpenWizard,
  onOpenLicense,
  onOpenSwitchWittServices,
  onOpenIrc,
  onOpenStore
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(['faq-nav-1', 'faq-tw-1', 'faq-kck-1', 'faq-st-1', 'faq-switch-witt-1'])
  );
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(faqItems.map(f => f.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const categories = useMemo(() => [
    { id: 'All', label: 'All Topics', count: faqItems.length },
    { id: 'platform_navigation', label: 'Platform Navigation & Studio', count: faqItems.filter(f => f.category === 'platform_navigation').length },
    { id: 'twitch_dev', label: 'dev.twitch.tv (Helix & EventSub)', count: faqItems.filter(f => f.category === 'twitch_dev').length },
    { id: 'kick_dev', label: 'dev.kick.com (API v2 & Pusher)', count: faqItems.filter(f => f.category === 'kick_dev').length },
    { id: 'drfun1tv_strimm', label: 'DrFun1TV & Strimm Playout', count: faqItems.filter(f => f.category === 'drfun1tv_strimm').length },
    { id: 'restream_io', label: 'Restream.io Multistream', count: faqItems.filter(f => f.category === 'restream_io').length },
    { id: 'fcc_irc', label: 'FCC Station Matrix & 1:1 IRC', count: faqItems.filter(f => f.category === 'fcc_irc').length },
    { id: 'troubleshooting', label: 'Troubleshooting & Audio LUFS', count: faqItems.filter(f => f.category === 'troubleshooting').length },
    { id: 'witt_legal', label: 'Witt Law & Switch.com Escrow', count: faqItems.filter(f => f.category === 'witt_legal').length },
  ], [faqItems]);

  const filteredFaqs = useMemo(() => {
    return faqItems.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const queryLower = searchQuery.toLowerCase().trim();
      const matchesQuery = !queryLower ||
        item.question.toLowerCase().includes(queryLower) ||
        item.answer.toLowerCase().includes(queryLower) ||
        (item.codeExample && item.codeExample.toLowerCase().includes(queryLower));

      return matchesCategory && matchesQuery;
    });
  }, [faqItems, selectedCategory, searchQuery]);

  // 10 Unified Studio Systems Navigation Map
  const STUDIO_TOOLS_MAP = [
    { id: 'strimm_drfun1tv', name: '1. DrFun1TV Playout', engine: 'Strimm.com Linear Playout', desc: 'Continuous 24/7 video rundowns, corner logo bug, news ticker & SCTE-35 ad breaks.' },
    { id: 'epg_guide', name: '2. FCC Master EPG', engine: 'FCC FRN 0034981290', desc: 'Paramount, Disney, WBD, Comcast, Dish & SATCOM feeds with 1:1 IRC rooms.' },
    { id: 'restream_multistream', name: '3. Restream.io', engine: 'Cloud RTMP Switch', desc: 'Simultaneous cloud broadcasting to Twitch, Kick, YouTube & custom RTMP.' },
    { id: 'dev_twitch', name: '4. dev.twitch.tv', engine: 'Helix REST & EventSub', desc: 'API testing suite, EventSub webhooks, IRC chat bridge & Channel Points ad triggers.' },
    { id: 'dev_kick', name: '5. dev.kick.com', engine: 'Kick API v2 & Pusher', desc: '95/5 creator revenue split telemetry, HMAC webhooks & sub-second Pusher chat.' },
    { id: 'tvu_networks', name: '6. TVU Networks', engine: 'Bonded Cellular IS+', desc: 'Live multi-camera news field transmission & low-latency IP transceiver grid.' },
    { id: 'cablecast_peg', name: '7. Cablecast PEG', engine: 'Community Automation', desc: 'Municipal carousel bulletin scheduling & emergency EAS alert overrides.' },
    { id: 'cadjin_master_control', name: '8. Cadjin Master', engine: 'EBU R128 (-23.4 LUFS)', desc: 'PGM/PVW switcher, automated brickwall audio limiter & video transitions.' },
    { id: 'forums', name: '9. Broadcaster Forums', engine: 'Community Discourse', desc: 'Public and member threads discussing stream configs, RF locks, and monetizations.' },
    { id: 'switch_witt_portal', name: '10. Space-Fiber Portal', engine: 'Switch & Witt Law', desc: 'Switch 5 campuses, 400G SuperLoop, and Witt Law Firm orbital escrow agreements.' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* ========================================================
          HEADER BANNER: UNIFIED BROADCAST & DEVELOPER KNOWLEDGE BASE
          ======================================================== */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-purple-950/30 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/40 flex items-center gap-1.5 uppercase tracking-wide">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Complete Platform Guide &amp; FAQ</span>
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/90 px-2.5 py-0.5 rounded border border-emerald-800 font-semibold">
              {faqItems.length} Verified Topics &bull; All On One Page
            </span>
            <span className="text-xs font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
              Cert: RAW-SATCOM-2026-LIC-0881
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            DrFun1TV &amp; Master Studio Unified Knowledge Base
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Everything you need to navigate DrFun1TV, integrate Twitch &amp; Kick developer APIs, broadcast from Restream.io, tune FCC stations with 1:1 IRC channels, and understand Switch.com owned infrastructure with Witt Law Firm space-fiber escrow.
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="px-3 py-2 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Launch RF Transponder Scanner"
            >
              <AntennaIcon className="w-4 h-4 text-sky-400" />
              <span>RF Demod Scanner</span>
            </button>
          )}

          {onOpenWizard && (
            <button
              onClick={onOpenWizard}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              title="Start Your Own Linear TV Channel"
            >
              <Plus className="w-4 h-4" />
              <span>Start Channel Wizard</span>
            </button>
          )}

          {onOpenSwitchWittServices && (
            <button
              onClick={onOpenSwitchWittServices}
              className="px-3 py-2 bg-gradient-to-r from-emerald-950/80 to-teal-950/80 hover:from-emerald-900/80 hover:to-teal-900/80 text-emerald-300 border border-emerald-500/50 rounded-xl text-xs font-mono transition flex items-center gap-1.5 shadow-sm"
              title="Open Switch Owned Infrastructure & Witt Law Escrow Portal"
            >
              <Network className="w-4 h-4 text-emerald-400" />
              <span>Switch &amp; Witt Fiber</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          PART 1: 3-STEP BROADCASTER & DEVELOPER JOURNEY (WALKTHROUGH)
          ======================================================== */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Broadcaster Quick-Start Walkthrough</span>
            </span>
            <h3 className="text-base font-bold text-white mt-1">
              How the 10 Unified Studio Systems Work Together
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            From Signal Ingest to Multi-Platform Syndication
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Step 1 */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-sky-950 text-sky-400 font-mono font-bold text-xs flex items-center justify-center border border-sky-800">
                  01
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Input &amp; Playout</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-2">Tune Station or Launch Custom Feed</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Tune an FCC broadcast station (CBS, NBC, CNN, DrFun1 ECOM stations) or click <strong>Start Your Own Channel</strong>. Customize your on-screen logo bug, live news crawl ticker, lower thirds, and automated SCTE-35 ad breaks.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-900 flex items-center gap-2">
              <button
                onClick={() => onNavigateToTool && onNavigateToTool('strimm_drfun1tv')}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1"
              >
                <span>DrFun1TV Controls</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-purple-950 text-purple-400 font-mono font-bold text-xs flex items-center justify-center border border-purple-800">
                  02
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Developer APIs</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-2">Connect dev.twitch.tv &amp; dev.kick.com</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Paste your Twitch Helix Client ID &amp; secret for EventSub webhooks and Channel Points ad triggers. Configure Kick API v2 for 95/5 creator revenue split telemetry and sub-second Pusher WebSockets chat.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-900 flex items-center gap-3">
              <button
                onClick={() => onNavigateToTool && onNavigateToTool('dev_twitch')}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1"
              >
                <span>dev.twitch.tv</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => onNavigateToTool && onNavigateToTool('dev_kick')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
              >
                <span>dev.kick.com</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center border border-emerald-800">
                  03
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Syndicate &amp; Escrow</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-2">Multistream &amp; Space-Fiber Syndication</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Broadcast through Restream.io to YouTube, Twitch, Kick, and TVU cellular news grids simultaneously. Monitor EBU R128 (-23.4 LUFS) audio loudness in Cadjin, backed by Witt Law Firm statutory escrow and Switch SuperLoop fiber.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-900 flex items-center gap-2">
              <button
                onClick={() => onNavigateToTool && onNavigateToTool('cadjin_master_control')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
              >
                <span>Cadjin Switcher</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          PART 2: STUDIO SYSTEMS INTERACTIVE QUICK-LAUNCH MAP
          ======================================================== */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Studio Quick-Launch Map (10 Unified Systems)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Click any system below to jump directly to its control console
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {STUDIO_TOOLS_MAP.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                if (tool.id === 'switch_witt_portal' && onOpenSwitchWittServices) {
                  onOpenSwitchWittServices();
                } else if (onNavigateToTool) {
                  onNavigateToTool(tool.id);
                }
              }}
              className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/50 text-left transition-all group flex flex-col justify-between space-y-2 shadow-sm"
            >
              <div>
                <div className="font-bold text-white text-xs group-hover:text-purple-300 transition-colors">
                  {tool.name}
                </div>
                <div className="text-[10px] font-mono text-purple-400/90 font-semibold mt-0.5">
                  {tool.engine}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">
                  {tool.desc}
                </p>
              </div>
              <div className="text-[10px] font-mono text-sky-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Open Control</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================
          PART 3: SEARCH BAR & CATEGORY FILTER TABS
          ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Detailed Knowledge Base &amp; Technical Questions
              </h3>
              <p className="text-xs text-slate-400">
                Filter by category or enter keywords for APIs, CURL snippets, and broadcast regulations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Twitch, Kick, SCTE-35, IRU..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  title="Clear search"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={expandAll}
                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
                title="Expand all questions"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
                title="Collapse all questions"
              >
                Collapse
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                selectedCategory === cat.id ? 'bg-purple-800 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================
          PART 4: ACCORDION QA LIST (EXPANDABLE WITH CODE & JUMPS)
          ======================================================== */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No matching questions found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No entries found matching "{searchQuery}". Try searching for keywords like "Twitch", "Kick", "Pusher", "SCTE-35", "Restream", "LUFS", "SuperLoop", or "Witt".
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition"
            >
              Reset Filters &amp; Search
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedIds.has(faq.id);

            return (
              <div
                key={faq.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isExpanded 
                    ? 'bg-slate-900/90 border-purple-500/50 shadow-xl shadow-purple-950/20' 
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Accordion Question Header */}
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full text-left p-4 sm:p-4.5 flex items-start justify-between gap-4 hover:bg-slate-900/60 transition-colors cursor-pointer"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                        faq.category === 'twitch_dev'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                          : faq.category === 'kick_dev'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : faq.category === 'platform_navigation'
                          ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                          : faq.category === 'troubleshooting'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : faq.category === 'witt_legal'
                          ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {faq.category.replace('_', ' ')}
                      </span>
                      {faq.relatedToolId && (
                        <span className="text-[10px] font-mono text-slate-400">
                          Engine: {faq.relatedToolId}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-tight mt-1 leading-snug">
                      {faq.question}
                    </h4>
                  </div>

                  <div className="p-1 text-slate-400 hover:text-white shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Expanded Answer Content */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 space-y-4">
                    <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
                      {faq.answer}
                    </p>

                    {/* Developer Code / CLI Example */}
                    {faq.codeExample && (
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                        <div className="bg-slate-900 px-3.5 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800">
                          <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Developer Example / CLI Snippet</span>
                          </span>
                          <button
                            onClick={() => handleCopyCode(faq.codeExample!, faq.id)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            {copiedCodeId === faq.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3.5 text-[11px] font-mono text-sky-300 overflow-x-auto leading-relaxed">
                          <code>{faq.codeExample}</code>
                        </pre>
                      </div>
                    )}

                    {/* Sub-Actions: Jump to Studio Control or Visit External Documentation */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/60 flex-wrap">
                      {faq.relatedToolId && onNavigateToTool ? (
                        <button
                          onClick={() => onNavigateToTool(faq.relatedToolId!)}
                          className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Open {faq.relatedToolId.replace('_', ' ')} in Studio</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : <div />}

                      {faq.externalLink && (
                        <a
                          href={faq.externalLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 hover:underline font-mono"
                        >
                          <span>{faq.externalLink.label}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================
          PART 5: STATUTORY ACCREDITATION & CARRIER FOOTER
          ======================================================== */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold flex items-center gap-2">
              <span>Licensed via The Law Office of Richard A. Witt LLC &amp; Owens Company</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.2 rounded border border-emerald-800">
                RAW-SATCOM-2026-LIC-0881
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              FCC FRN: 0034981290 &bull; Switch Class 5 Platinum Data Centers &bull; 24/7 Support: livewithdrfun1@gmail.com
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenLicense && (
            <button
              onClick={onOpenLicense}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs transition"
            >
              View License
            </button>
          )}
          {onOpenSwitchWittServices && (
            <button
              onClick={onOpenSwitchWittServices}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-sm"
            >
              Switch &amp; Witt Portal
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
