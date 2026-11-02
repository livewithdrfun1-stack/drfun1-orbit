/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Dedicated FAQ & Platform Guidance Modal for DrFun1TV & Master Studio
 * Clear guidance for navigating the broadcast platform, Twitch/Kick dev integration, and FCC teleports.
 */

import React, { useState, useMemo } from 'react';
import { FaqItem, FaqCategory } from '../../types/developerPortals';
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
  X as CloseIcon, 
  Layers, 
  Compass, 
  Zap, 
  ArrowRight,
  Flame,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  Sliders,
  Terminal,
  Share2
} from 'lucide-react';

interface StudioFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  faqItems: FaqItem[];
  onNavigateToTool?: (toolId: string) => void;
  onOpenScanner?: () => void;
  onOpenWizard?: () => void;
}

export const StudioFaqModal: React.FC<StudioFaqModalProps> = ({
  isOpen,
  onClose,
  faqItems,
  onNavigateToTool,
  onOpenScanner,
  onOpenWizard,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(['faq-nav-1', 'faq-tw-1', 'faq-kck-1'])
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

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleJumpToTool = (toolId: string) => {
    if (onNavigateToTool) {
      onNavigateToTool(toolId);
      onClose();
    }
  };

  const categories = useMemo(() => [
    { id: 'All', label: 'All Questions', count: faqItems.length },
    { id: 'platform_navigation', label: 'Platform Navigation', count: faqItems.filter(f => f.category === 'platform_navigation').length },
    { id: 'twitch_dev', label: 'dev.twitch.tv (Helix)', count: faqItems.filter(f => f.category === 'twitch_dev').length },
    { id: 'kick_dev', label: 'dev.kick.com (API v2)', count: faqItems.filter(f => f.category === 'kick_dev').length },
    { id: 'drfun1tv_strimm', label: 'DrFun1TV & Strimm Playout', count: faqItems.filter(f => f.category === 'drfun1tv_strimm').length },
    { id: 'restream_io', label: 'Restream.io Multistream', count: faqItems.filter(f => f.category === 'restream_io').length },
    { id: 'fcc_irc', label: 'FCC & 1:1 IRC Rooms', count: faqItems.filter(f => f.category === 'fcc_irc').length },
    { id: 'troubleshooting', label: 'Troubleshooting & Audio', count: faqItems.filter(f => f.category === 'troubleshooting').length },
    { id: 'witt_legal', label: 'Witt Law Firm Licensing', count: faqItems.filter(f => f.category === 'witt_legal').length },
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

  // Platform navigation tools overview map
  const STUDIO_TOOLS_MAP = [
    { id: 'strimm_drfun1tv', name: 'DrFun1TV Playout', engine: 'Strimm.com Sequencer', desc: 'Linear rundowns, logo bugs, ticker crawls & SCTE-35 ad breaks.' },
    { id: 'epg_guide', name: 'FCC Master EPG', engine: 'FCC.gov FRN 0034981290', desc: 'All FCC-licensed TV stations with 1:1 dedicated UnrealIRCd rooms.' },
    { id: 'restream_multistream', name: 'Restream.io Multistream', engine: 'Cloud RTMP Switch', desc: 'Simultaneous cloud broadcasting to Twitch, Kick, YouTube & custom endpoints.' },
    { id: 'dev_twitch', name: 'dev.twitch.tv Suite', engine: 'Helix REST & EventSub', desc: 'API testing, EventSub webhooks, IRC chat bridge & Channel Points.' },
    { id: 'dev_kick', name: 'dev.kick.com Suite', engine: 'Kick API v2 & Pusher', desc: '95/5 creator revenue split telemetry, HMAC webhooks & sub-second chat.' },
    { id: 'tvu_networks', name: 'TVU Networks Grid', engine: 'Bonded Cellular IS+', desc: 'Multi-cam news exchange & low-latency IP transceiver matrix.' },
    { id: 'cablecast_peg', name: 'Cablecast PEG', engine: 'Community Automation', desc: 'Municipal carousel scheduling & emergency EAS alert overrides.' },
    { id: 'cadjin_master_control', name: 'Cadjin Master Control', engine: 'EBU R128 (-23.4 LUFS)', desc: 'PGM/PVW switcher, automated brickwall audio limiter & video transitions.' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* ========================================================
            MODAL HEADER: BRAND & SEARCH
            ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-sky-400 text-white shadow-lg shadow-purple-500/20 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>DrFun1TV &amp; Master Studio Knowledge Base</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    PLATFORM GUIDE &amp; FAQ
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Comprehensive guidance for navigating DrFun1TV, Twitch/Kick dev portals, Restream.io &amp; FCC stations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs, API, code..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
              title="Close FAQ Modal"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================
            QUICK PLATFORM NAVIGATION MAP (COLLAPSIBLE / HIGHLIGHT)
            ======================================================== */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Studio Quick-Launch Map (10 Unified Systems)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Click any tool to navigate directly
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {STUDIO_TOOLS_MAP.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleJumpToTool(tool.id)}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-sky-500/50 text-left transition-all group"
              >
                <div className="font-semibold text-white text-[11px] truncate group-hover:text-sky-300">
                  {tool.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                  {tool.engine}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================
            CATEGORY FILTER TABS
            ======================================================== */}
        <div className="px-4 py-2.5 bg-slate-950/30 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                selectedCategory === cat.id ? 'bg-purple-800 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* ========================================================
            QUESTIONS & ANSWERS ACCORDION LIST
            ======================================================== */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 space-y-3">
              <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">No matching questions found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for keywords like "Twitch", "Kick", "Pusher", "SCTE-35", "Restream", "LUFS", or "UnrealIRCd".
              </p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Reset FAQ Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isExpanded = expandedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isExpanded 
                      ? 'bg-slate-950/80 border-purple-500/40 shadow-lg shadow-purple-500/5' 
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Accordion Question Header */}
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full p-3.5 sm:p-4 text-left flex items-start justify-between gap-3 transition-colors hover:bg-slate-900/50"
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                          item.category === 'twitch_dev'
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                            : item.category === 'kick_dev'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : item.category === 'platform_navigation'
                            ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                            : item.category === 'troubleshooting'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {item.category.replace('_', ' ')}
                        </span>
                        {item.relatedToolId && (
                          <span className="text-[10px] font-mono text-slate-400">
                            Tool: {item.relatedToolId}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white tracking-tight mt-1 leading-snug">
                        {item.question}
                      </h4>
                    </div>

                    <div className="p-1 text-slate-400 hover:text-white shrink-0 mt-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Accordion Answer Content */}
                  {isExpanded && (
                    <div className="px-3.5 sm:px-4 pb-4 pt-1 space-y-3.5 border-t border-slate-900 text-xs">
                      <p className="text-slate-300 leading-relaxed text-xs sm:text-[13px]">
                        {item.answer}
                      </p>

                      {/* Code Example if present */}
                      {item.codeExample && (
                        <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900/90">
                          <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
                              <Code2 className="w-3.5 h-3.5" />
                              <span>Code / CLI Snippet</span>
                            </span>
                            <button
                              onClick={() => handleCopyCode(item.codeExample!, item.id)}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] transition-colors flex items-center gap-1"
                            >
                              {copiedCodeId === item.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                            <code>{item.codeExample}</code>
                          </pre>
                        </div>
                      )}

                      {/* Footer Actions inside accordion: Jump to Tool & External Link */}
                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-900/80 flex-wrap">
                        {item.relatedToolId && onNavigateToTool ? (
                          <button
                            onClick={() => handleJumpToTool(item.relatedToolId!)}
                            className="px-3 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
                          >
                            <span>Open {item.relatedToolId.replace('_', ' ')} in Studio</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : <div />}

                        {item.externalLink && (
                          <a
                            href={item.externalLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 hover:underline font-mono"
                          >
                            <span>{item.externalLink.label}</span>
                            <ExternalLink className="w-3 h-3" />
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
            MODAL FOOTER: CONTACT & ACCREDITATION
            ======================================================== */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Licensed via <a href="https://www.wittlawfirm.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">www.wittlawfirm.com</a> &amp; Owens Company · Support: <a href="mailto:livewithdrfun1@gmail.com" className="text-emerald-400">livewithdrfun1@gmail.com</a>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenScanner && (
              <button
                onClick={() => { onOpenScanner(); onClose(); }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-lg text-xs font-mono transition-colors flex items-center gap-1"
              >
                <AntennaIcon className="w-3.5 h-3.5" />
                <span>RF Transponder Scanner</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-md shadow-purple-600/20"
            >
              Done / Close Guide
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
