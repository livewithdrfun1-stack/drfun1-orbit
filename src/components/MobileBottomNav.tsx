/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Mobile & Tablet Bottom Dock Navigation (< lg screens)
 * Provides thumb-friendly navigation across all core hubs plus a compact "More" sheet
 * for Duplicator Hosting, Hardware Store, Fubo.tv, NetAdmin, ZNC, and Legal tools.
 */

import React, { useState } from 'react';
import {
  Headphones,
  KeyRound,
  LayoutGrid,
  Mic,
  Newspaper,
  Radio,
  Rss,
  Satellite,
  Server,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Terminal,
  Tv,
  Video,
  X,
} from 'lucide-react';
import { AppTab } from './Header';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { getRankDefinition } from '../utils/ircdAccess';

interface MobileBottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  activeOperRank?: AnopeRankLevel;
  onOpenRankAccess?: () => void;
  onOpenIrcdAdmin?: () => void;
  onOpenZncWebAdmin?: () => void;
  onOpenLicense?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  activeOperRank = 'op',
  onOpenRankAccess,
  onOpenIrcdAdmin,
  onOpenZncWebAdmin,
  onOpenLicense,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const rankDef = getRankDefinition(activeOperRank);

  const isMoreTab =
    activeTab === 'satcom_companies' ||
    activeTab === 'satcom_rss' ||
    activeTab === 'duplicator_hosting' ||
    activeTab === 'store' ||
    activeTab === 'fubotv' ||
    activeTab === 'drfun1_tv' ||
    activeTab === 'social_control' ||
    activeTab === 'podcast_uplink' ||
    activeTab === 'tvu_red5_twitch';

  return (
    <>
      {/* Expandable Bottom Sheet for Secondary Hubs & Admin Tools */}
      {moreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-end"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="w-full bg-slate-900 border-t border-slate-800 rounded-t-2xl p-4 pb-[calc(5.25rem+env(safe-area-inset-bottom))] space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                All Platforms &amp; Admin Tools
              </span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                aria-label="Close platforms sheet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  onSelectTab('podcast_uplink');
                  setMoreOpen(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 min-h-[52px] cursor-pointer ${
                  activeTab === 'podcast_uplink'
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <Mic className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Podcasting Uplink</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('duplicator_hosting');
                  setMoreOpen(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 min-h-[52px] cursor-pointer ${
                  activeTab === 'duplicator_hosting'
                    ? 'bg-purple-500/20 border-purple-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <Share2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Duplicator Hosting</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('store');
                  setMoreOpen(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 min-h-[52px] cursor-pointer ${
                  activeTab === 'store'
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hardware Store</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('fubotv');
                  setMoreOpen(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 min-h-[52px] cursor-pointer ${
                  activeTab === 'fubotv'
                    ? 'bg-orange-500/20 border-orange-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <Tv className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Fubo.tv Sports</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('satcom_rss');
                  setMoreOpen(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 min-h-[52px] cursor-pointer ${
                  activeTab === 'satcom_rss'
                    ? 'bg-teal-500/20 border-teal-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <Rss className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Satcom RSS Feed</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('drfun1_tv');
                  setMoreOpen(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 min-h-[52px] cursor-pointer ${
                  activeTab === 'drfun1_tv'
                    ? 'bg-red-500/20 border-red-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <Tv className="w-4 h-4 text-red-500 shrink-0" />
                <span>DrFun1-TV 4K</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('satcom_companies');
                  setMoreOpen(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 min-h-[52px] cursor-pointer ${
                  activeTab === 'satcom_companies'
                    ? 'bg-sky-500/20 border-sky-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <Satellite className="w-4 h-4 text-sky-400 shrink-0" />
                <span>SATCOM Companies</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('tvu_red5_twitch');
                  setMoreOpen(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 min-h-[52px] cursor-pointer ${
                  activeTab === 'tvu_red5_twitch'
                    ? 'bg-purple-500/20 border-purple-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <Video className="w-4 h-4 text-purple-400 shrink-0" />
                <span>TVU · Red5 · Twitch · Kick</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('social_control');
                  setMoreOpen(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 min-h-[52px] cursor-pointer col-span-2 ${
                  activeTab === 'social_control'
                    ? 'bg-indigo-500/20 border-indigo-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <Share2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Socials &amp; www.drfun1media.com Live Feeds</span>
              </button>

              {onOpenRankAccess && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    onOpenRankAccess();
                  }}
                  className="p-3 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-200 text-left flex items-center justify-between gap-2 min-h-[52px] cursor-pointer col-span-2"
                >
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      IRCD Rank Access: <strong className="text-white">{rankDef.prefix}{rankDef.shortLabel}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    Lvl {rankDef.accessLevel}
                  </span>
                </button>
              )}

              {onOpenIrcdAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    onOpenIrcdAdmin();
                  }}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 text-left flex items-center gap-2.5 min-h-[52px] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>IRCD NetAdmin</span>
                </button>
              )}

              {onOpenZncWebAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    onOpenZncWebAdmin();
                  }}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 text-left flex items-center gap-2.5 min-h-[52px] cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ZNC Bouncer :5000</span>
                </button>
              )}

              {onOpenLicense && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    onOpenLicense();
                  }}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 text-left flex items-center gap-2.5 min-h-[52px] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Witt Law License</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Mobile Bottom Navigation Dock */}
      <nav
        aria-label="Mobile Primary Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 pb-[env(safe-area-inset-bottom)] shadow-2xl"
      >
        <div className="grid grid-cols-5 h-16">
          <button
            type="button"
            onClick={() => {
              setMoreOpen(false);
              onSelectTab('drfun1_news');
            }}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-mono cursor-pointer transition-colors ${
              activeTab === 'drfun1_news' && !moreOpen ? 'text-sky-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>News</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMoreOpen(false);
              onSelectTab('irc');
            }}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-mono cursor-pointer transition-colors ${
              activeTab === 'irc' && !moreOpen ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>WebIRC</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMoreOpen(false);
              onSelectTab('radio_dj');
            }}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-mono cursor-pointer transition-colors ${
              activeTab === 'radio_dj' && !moreOpen ? 'text-pink-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Radio/VoIP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMoreOpen(false);
              onSelectTab('master_control');
            }}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-mono cursor-pointer transition-colors ${
              activeTab === 'master_control' && !moreOpen
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Master</span>
          </button>

          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-mono cursor-pointer transition-colors ${
              moreOpen || isMoreTab ? 'text-purple-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
