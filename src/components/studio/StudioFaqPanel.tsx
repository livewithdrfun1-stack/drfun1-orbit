/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Interactive Studio FAQ (Twitch, Kick, DrFun1TV, Restream, FCC, Witt Law Firm)
 */

import React, { useState } from 'react';
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
  Radio, 
  Tv, 
  Sparkles,
  Maximize2,
  Compass,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface StudioFaqPanelProps {
  faqItems: FaqItem[];
  onOpenModal?: () => void;
  onNavigateToTool?: (toolId: string) => void;
}

export const StudioFaqPanel: React.FC<StudioFaqPanelProps> = ({ 
  faqItems,
  onOpenModal,
  onNavigateToTool
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['faq-nav-1', 'faq-tw-1', 'faq-kck-1', 'faq-st-1']));
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

  const filteredFaqs = faqItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const queryLower = searchQuery.toLowerCase().trim();
    const matchesQuery = !queryLower ||
      item.question.toLowerCase().includes(queryLower) ||
      item.answer.toLowerCase().includes(queryLower) ||
      (item.codeExample && item.codeExample.toLowerCase().includes(queryLower));

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-500/20 text-purple-400 border border-purple-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Broadcast &amp; Developer FAQ Knowledge Base</span>
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              {faqItems.length} Verified Topics
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1.5">
            Frequently Asked Questions for Twitch, Kick, DrFun1TV &amp; FCC Teleport
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step developer integration answers, EventSub webhooks, 95/5 creator payout formulas, and legal compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenModal && (
            <button
              onClick={onOpenModal}
              className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Open in Dedicated Modal</span>
            </button>
          )}

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs, API keywords, code..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Platform Navigation Quick Map */}
      <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Studio Systems Navigation Guide</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Quick jump to any studio sub-engine
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          {[
            { id: 'strimm_drfun1tv', label: '1. DrFun1TV Playout', sub: 'Strimm Sequencer' },
            { id: 'epg_guide', label: '2. FCC Master EPG', sub: '1:1 IRC Rooms' },
            { id: 'restream_multistream', label: '3. Restream.io', sub: 'Multistream Core' },
            { id: 'dev_twitch', label: '4. dev.twitch.tv', sub: 'Helix & EventSub' },
            { id: 'dev_kick', label: '5. dev.kick.com', sub: 'API v2 & Pusher' },
            { id: 'tvu_networks', label: '6. TVU Networks', sub: 'Bonded Cellular' },
            { id: 'cablecast_peg', label: '7. Cablecast PEG', sub: 'Carousel & EAS' },
            { id: 'cadjin_master_control', label: '8. Cadjin Master', sub: 'PGM/PVW & LUFS' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigateToTool && onNavigateToTool(item.id)}
              className="p-2 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded text-left transition-colors group"
            >
              <div className="text-white font-medium text-[11px] group-hover:text-sky-300 truncate">
                {item.label}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {item.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        {[
          { id: 'All', label: 'All FAQs' },
          { id: 'platform_navigation', label: 'Platform Navigation' },
          { id: 'twitch_dev', label: 'dev.twitch.tv (Helix)' },
          { id: 'kick_dev', label: 'dev.kick.com (API v2)' },
          { id: 'drfun1tv_strimm', label: 'DrFun1TV & Strimm' },
          { id: 'restream_io', label: 'Restream.io Multistream' },
          { id: 'fcc_irc', label: 'FCC & 1:1 IRC Channels' },
          { id: 'troubleshooting', label: 'Troubleshooting & Audio' },
          { id: 'witt_legal', label: 'Witt Law Firm Licensing' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-10 text-center bg-slate-950/60 border border-dashed border-slate-800 rounded-xl text-slate-400 text-xs">
            No FAQ entries found matching your search.
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedIds.has(faq.id);
            return (
              <div
                key={faq.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl overflow-hidden transition-all"
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {faq.question}
                    </span>
                  </div>
                  <div className="shrink-0 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Answer Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 space-y-3">
                    <p>{faq.answer}</p>

                    {faq.codeExample && (
                      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                        <div className="bg-slate-950 px-3 py-1 flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800">
                          <span>Developer Example / Curl Snippet</span>
                          <button
                            onClick={() => handleCopyCode(faq.codeExample!, faq.id)}
                            className="text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            {copiedCodeId === faq.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedCodeId === faq.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="p-3 text-[11px] font-mono text-sky-300 overflow-x-auto leading-relaxed">
                          {faq.codeExample}
                        </pre>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-900 flex-wrap">
                      {faq.relatedToolId && onNavigateToTool ? (
                        <button
                          onClick={() => onNavigateToTool(faq.relatedToolId!)}
                          className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-xs font-mono transition-colors flex items-center gap-1"
                        >
                          <span>Open {faq.relatedToolId.replace('_', ' ')} in Studio</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : <div />}

                      {faq.externalLink && (
                        <div>
                          <a
                            href={faq.externalLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 hover:underline font-mono text-[11px]"
                          >
                            <span>{faq.externalLink.label}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
