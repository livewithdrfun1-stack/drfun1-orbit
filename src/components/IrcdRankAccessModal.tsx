/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Site-Wide IRCD Rank Access Control Matrix & Live Rank Switcher
 */

import React, { useState } from 'react';
import {
  Check,
  Crown,
  Key,
  Layers,
  Lock,
  Scale,
  ShieldCheck,
  Table2,
  Unlock,
  X,
} from 'lucide-react';
import { OWNER_COMMISSION_ROSTER } from '../data/ircdAdminData';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { getRankDefinition } from '../utils/ircdAccess';
import {
  FeatureAccessTier,
  IRCD_FEATURE_ACCESS_CONFIG,
  PLATFORM_FEATURE_CATEGORIES,
  PlatformFeatureCategory,
  canRankAccessFeature,
  getAccessibleFeaturesForRank,
  getExactUnlockFeaturesForRank,
  getFeatureGrantState,
  getMinRankDefinitionForFeature,
  getOrderedRanksAscending,
} from '../config/ircdFeatureAccessConfig';
import { IrcdRankHierarchyTree } from './IrcdRankHierarchyTree';
import { IrcdRankGrowthChart } from './IrcdRankGrowthChart';

interface IrcdRankAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRank: AnopeRankLevel;
  onRankChange: (rank: AnopeRankLevel) => void;
  onOpenIrcdAdmin?: () => void;
}

const TIER_BADGE_STYLES: Record<FeatureAccessTier, string> = {
  Read: 'bg-slate-800 text-slate-300 border-slate-700',
  Operate: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Administer: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Root: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
};

export const IrcdRankAccessModal: React.FC<IrcdRankAccessModalProps> = ({
  isOpen,
  onClose,
  activeRank,
  onRankChange,
  onOpenIrcdAdmin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'All' | PlatformFeatureCategory
  >('All');
  const [selectedTier, setSelectedTier] = useState<'All' | FeatureAccessTier>(
    'All'
  );
  const [matrixMode, setMatrixMode] = useState<'matrix' | 'details'>('matrix');
  const [ownerFilter, setOwnerFilter] = useState<
    'all' | 'www.wittlawfirm.com' | 'https://www.supremecourt.gov'
  >('all');

  if (!isOpen) return null;

  const filteredOwners =
    ownerFilter === 'all'
      ? OWNER_COMMISSION_ROSTER
      : OWNER_COMMISSION_ROSTER.filter((m) => m.organization === ownerFilter);
  const wittCount = OWNER_COMMISSION_ROSTER.filter(
    (m) => m.organization === 'www.wittlawfirm.com'
  ).length;
  const scotusCount = OWNER_COMMISSION_ROSTER.filter(
    (m) => m.organization === 'https://www.supremecourt.gov'
  ).length;

  const currentRankDef = getRankDefinition(activeRank);
  const orderedRanksAsc = getOrderedRanksAscending();

  const filteredFeatures = IRCD_FEATURE_ACCESS_CONFIG.filter((feat) => {
    const matchesCat =
      selectedCategory === 'All' || feat.category === selectedCategory;
    const matchesTier =
      selectedTier === 'All' || feat.accessTier === selectedTier;
    return matchesCat && matchesTier;
  });

  const unlockedFeatures = getAccessibleFeaturesForRank(activeRank);
  const exactUnlocksForActive = getExactUnlockFeaturesForRank(activeRank);
  const totalFeatures = IRCD_FEATURE_ACCESS_CONFIG.length;
  const coveragePct = Math.round((unlockedFeatures.length / totalFeatures) * 100);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-7xl max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="text-xs font-mono text-amber-400">
              UnrealIRCd 6.1.4 &amp; Anope 2.1 · 14-Tier Feature Access Matrix
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
              DrFun1 Platform Visual Hierarchy &amp; IRCD Rank Access
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenIrcdAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenIrcdAdmin();
                }}
                className="hidden sm:flex px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Open Full NetAdmin Panel</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Close IRCD Rank Access Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Active Session Rank Summary */}
          <section className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="text-xs font-mono text-slate-400">
                Active Session Rank · Modes: {currentRankDef.modes}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-white">
                  {currentRankDef.prefix ? `${currentRankDef.prefix} ` : ''}
                  {currentRankDef.name}
                </span>
                <span className="text-xs font-mono tabular-nums text-amber-300 font-bold">
                  Level {currentRankDef.accessLevel.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                {currentRankDef.description}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 shrink-0 font-mono tabular-nums border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-5">
              <div>
                <div className="text-[11px] text-slate-400">Features Unlocked</div>
                <div className="text-lg font-bold text-emerald-400">
                  {unlockedFeatures.length} / {totalFeatures}
                </div>
                <div className="text-[10px] text-slate-500">{coveragePct}% platform</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Tier Unlocks</div>
                <div className="text-lg font-bold text-amber-300">
                  +{exactUnlocksForActive.length} new
                </div>
                <div className="text-[10px] text-slate-500">at Lvl {currentRankDef.accessLevel}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Ops &amp; Broadcast</div>
                <div className="text-lg font-bold text-white">
                  {currentRankDef.isOpsAndAbove ? 'Authorized' : 'Restricted'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {currentRankDef.isOpsAndAbove ? '@o Ops+ Tier' : 'Below @o'}
                </div>
              </div>
            </div>
          </section>

          {/* 14-Level Hierarchical Tree Visualization (Guest -> ~ Owner) */}
          <IrcdRankHierarchyTree
            activeRank={activeRank}
            onRankChange={onRankChange}
          />

          {/* 30-Day Historical Rank Growth Trend Chart (Recharts) */}
          <IrcdRankGrowthChart activeRank={activeRank} />

          {/* Visual Hierarchy Progression Staircase + 2D Feature Matrix */}
          <section className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>
                    Visual Hierarchy Matrix ({orderedRanksAsc.length} Ranks ×{' '}
                    {IRCD_FEATURE_ACCESS_CONFIG.length} DrFun1 Features)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any rank bar or matrix column header to switch active session rank immediately. Features inherit upward from left (Guest) to right (~ Owner).
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0 self-start lg:self-auto">
                <button
                  type="button"
                  onClick={() => setMatrixMode('matrix')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs cursor-pointer whitespace-nowrap ${
                    matrixMode === 'matrix'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Table2 className="w-3.5 h-3.5" />
                  <span>Visual Hierarchy Matrix</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixMode('details')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs cursor-pointer whitespace-nowrap ${
                    matrixMode === 'details'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Active Rank Feature List</span>
                </button>
              </div>
            </div>

            {/* Progressive Hierarchy Staircase Visualization */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                <span className="text-slate-300 font-semibold">
                  14-Rank Privilege Escalation Staircase (Cumulative Feature Coverage)
                </span>
                <span className="text-slate-400">
                  @o Op (Lvl 500) marks Ops+ Live Broadcast Threshold
                </span>
              </div>

              <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 items-end pt-2">
                {orderedRanksAsc.map((rank) => {
                  const accessibleCount = getAccessibleFeaturesForRank(rank.id).length;
                  const newAtRankCount = getExactUnlockFeaturesForRank(rank.id).length;
                  const pct = Math.max(
                    10,
                    Math.round((accessibleCount / totalFeatures) * 100)
                  );
                  const isActive = rank.id === activeRank;
                  const isBelowOrEqualActive =
                    currentRankDef.accessLevel >= rank.accessLevel;

                  return (
                    <button
                      key={rank.id}
                      type="button"
                      onClick={() => onRankChange(rank.id)}
                      title={`${rank.prefix ? rank.prefix + ' ' : ''}${rank.shortLabel} (Lvl ${rank.accessLevel}) — ${accessibleCount}/${totalFeatures} features`}
                      className={`group flex flex-col items-center gap-1.5 p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-400/15 border-amber-400 ring-1 ring-amber-400/50'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-mono tabular-nums text-slate-300 font-semibold">
                        {accessibleCount}/{totalFeatures}
                      </span>
                      <div className="w-full h-16 bg-slate-900 rounded flex items-end overflow-hidden border border-slate-800/80 p-0.5">
                        <div
                          style={{ height: `${pct}%` }}
                          className={`w-full rounded-sm transition-all ${
                            isActive
                              ? 'bg-amber-400'
                              : isBelowOrEqualActive
                              ? 'bg-emerald-500/75 group-hover:bg-emerald-400'
                              : 'bg-slate-700 group-hover:bg-slate-600'
                          }`}
                        />
                      </div>
                      <div className="text-center w-full">
                        <div
                          className={`text-[10px] font-mono font-bold truncate ${
                            isActive ? 'text-amber-300' : 'text-white'
                          }`}
                        >
                          {rank.prefix || '·'} {rank.shortLabel.replace(/\s*\(.*?\)/g, '')}
                        </div>
                        <div className="text-[9px] font-mono tabular-nums text-slate-400">
                          {newAtRankCount > 0 ? `+${newAtRankCount} · ` : ''}L{rank.accessLevel}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category & Access Tier Filters + Legend */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['All', ...PLATFORM_FEATURE_CATEGORIES] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded text-xs whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  {(['All', 'Read', 'Operate', 'Administer', 'Root'] as const).map(
                    (tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        className={`px-2 py-1 rounded text-[11px] whitespace-nowrap cursor-pointer ${
                          selectedTier === tier
                            ? 'bg-sky-400 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tier}
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 px-2">
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <Key className="w-3 h-3" /> Unlock Tier
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <Check className="w-3 h-3" /> Inherited
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                </div>
              </div>
            </div>

            {/* Matrix Mode vs Active Rank Detail Mode */}
            {matrixMode === 'matrix' ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono">
                        <th className="sticky left-0 z-20 bg-slate-950 py-2.5 px-3 min-w-[240px] sm:min-w-[280px] border-r border-slate-800">
                          <div className="text-white font-sans font-bold text-xs">
                            DrFun1 Platform Feature ({filteredFeatures.length})
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Category · Access Tier · Required Mode
                          </div>
                        </th>
                        {orderedRanksAsc.map((rank) => {
                          const isActiveCol = rank.id === activeRank;
                          return (
                            <th
                              key={rank.id}
                              className={`p-1.5 text-center min-w-[68px] border-r border-slate-800/60 last:border-r-0 ${
                                isActiveCol ? 'bg-amber-400/15' : ''
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => onRankChange(rank.id)}
                                className="w-full flex flex-col items-center gap-0.5 py-1 px-1 rounded hover:bg-slate-800/80 cursor-pointer"
                                title={`Switch active session rank to ${rank.name} (Level ${rank.accessLevel})`}
                              >
                                <span
                                  className={`text-[11px] font-bold leading-tight ${
                                    isActiveCol ? 'text-amber-300' : 'text-white'
                                  }`}
                                >
                                  {rank.prefix || '·'}{' '}
                                  {rank.shortLabel.replace(/\s*\(.*?\)/g, '')}
                                </span>
                                <span className="text-[9px] tabular-nums text-slate-400">
                                  L{rank.accessLevel}
                                </span>
                              </button>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800/75">
                      {filteredFeatures.map((feature) => {
                        const minRankDef = getMinRankDefinitionForFeature(feature);
                        const activeGranted = canRankAccessFeature(activeRank, feature);

                        return (
                          <tr
                            key={feature.id}
                            className="hover:bg-slate-900/40 transition-colors"
                          >
                            {/* Sticky Feature Description Cell */}
                            <td className="sticky left-0 z-10 bg-slate-950 py-2.5 px-3 border-r border-slate-800 align-middle">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div
                                    className="font-semibold text-white text-xs leading-snug"
                                    title={feature.description}
                                  >
                                    {feature.label}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className="text-[10px] text-slate-400">
                                      {feature.category}
                                    </span>
                                    <span
                                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                        TIER_BADGE_STYLES[feature.accessTier]
                                      }`}
                                    >
                                      {feature.accessTier}
                                    </span>
                                    <span className="text-[10px] font-mono text-amber-300">
                                      Min: {minRankDef.prefix ? `${minRankDef.prefix} ` : ''}
                                      L{minRankDef.accessLevel} ({feature.requiredModes})
                                    </span>
                                  </div>
                                </div>
                                <span
                                  className={`shrink-0 text-[10px] font-mono font-semibold ${
                                    activeGranted
                                      ? 'text-emerald-400'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {activeGranted ? 'ON' : 'OFF'}
                                </span>
                              </div>
                            </td>

                            {/* 14 Rank Access Cells */}
                            {orderedRanksAsc.map((rank) => {
                              const state = getFeatureGrantState(rank.id, feature);
                              const isActiveCol = rank.id === activeRank;
                              return (
                                <td
                                  key={`${feature.id}-${rank.id}`}
                                  className={`p-1.5 text-center border-r border-slate-800/50 last:border-r-0 align-middle ${
                                    isActiveCol
                                      ? 'bg-amber-400/10 ring-1 ring-inset ring-amber-400/30'
                                      : ''
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => onRankChange(rank.id)}
                                    title={`${feature.shortLabel} @ ${rank.shortLabel} (Lvl ${rank.accessLevel}): ${
                                      state === 'exact'
                                        ? 'Threshold Unlock Rank'
                                        : state === 'inherited'
                                        ? 'Inherited Access Granted'
                                        : `Locked (Requires Lvl ${minRankDef.accessLevel})`
                                    }`}
                                    className={`w-full h-8 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                      state === 'exact'
                                        ? 'bg-amber-400/20 border border-amber-400/60 text-amber-300 hover:bg-amber-400/30'
                                        : state === 'inherited'
                                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                                        : 'bg-slate-900/50 border border-slate-800/60 text-slate-600 hover:text-slate-400 hover:border-slate-700'
                                    }`}
                                  >
                                    {state === 'exact' ? (
                                      <Key className="w-3.5 h-3.5" />
                                    ) : state === 'inherited' ? (
                                      <Check className="w-3.5 h-3.5" />
                                    ) : (
                                      <Lock className="w-3 h-3 opacity-60" />
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono">
                        <th className="py-2.5 px-3">DrFun1 Platform Feature</th>
                        <th className="py-2.5 px-3">Category &amp; Tier</th>
                        <th className="py-2.5 px-3">Min IRCD Rank</th>
                        <th className="py-2.5 px-3 text-right">Active Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredFeatures.map((feature) => {
                        const reqDef = getMinRankDefinitionForFeature(feature);
                        const granted = canRankAccessFeature(activeRank, feature);
                        return (
                          <tr
                            key={feature.id}
                            className="hover:bg-slate-900/50 transition-colors"
                          >
                            <td className="py-3 px-3">
                              <div className="font-semibold text-white">
                                {feature.label}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {feature.description}
                              </div>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <div className="text-slate-300">{feature.category}</div>
                              <span
                                className={`inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                  TIER_BADGE_STYLES[feature.accessTier]
                                }`}
                              >
                                {feature.accessTier} · {feature.requiredModes}
                              </span>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap font-mono tabular-nums">
                              <span className="text-amber-300 font-semibold">
                                {reqDef.prefix ? `${reqDef.prefix} ` : ''}
                                {reqDef.shortLabel}
                              </span>{' '}
                              <span className="text-slate-500">
                                (Lvl {reqDef.accessLevel})
                              </span>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap text-right">
                              {granted ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Granted</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onRankChange(feature.minRank)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-300 font-semibold transition-colors cursor-pointer"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>Elevate to Lvl {reqDef.accessLevel}</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* 14-Tier Selectable Rank Ladder */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Select Active IRCD Rank Level (0 – 10,000)
                </h3>
                <p className="text-xs text-slate-400">
                  Switch ranks below to preview or operate any tier across WebIRC, Podcasting Uplink, SHOUTcast Radio, Duplicator Hosting, and Master Control.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">
                {orderedRanksAsc.length} Configured Ranks
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {orderedRanksAsc.map((rank) => {
                const isSelected = rank.id === activeRank;
                const isIncluded =
                  currentRankDef.accessLevel >= rank.accessLevel;
                const rankFeatCount = getAccessibleFeaturesForRank(rank.id).length;
                return (
                  <button
                    key={rank.id}
                    type="button"
                    onClick={() => onRankChange(rank.id)}
                    className={`text-left p-3 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-amber-400/15 border-amber-400 ring-1 ring-amber-400/50'
                        : isIncluded
                        ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/60 border-slate-800/70 hover:border-slate-700 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {rank.prefix ? `${rank.prefix} ` : ''}
                        {rank.shortLabel}
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-amber-300 font-semibold shrink-0">
                        Lvl {rank.accessLevel}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      {rank.modes} · {rankFeatCount}/{totalFeatures} features
                    </div>
                    <div className="text-[11px] text-slate-300 truncate">
                      {rank.siteAccessZones[0]}
                    </div>
                    <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
                      <span
                        className={
                          isSelected
                            ? 'text-amber-300 font-bold'
                            : isIncluded
                            ? 'text-emerald-400'
                            : 'text-slate-500'
                        }
                      >
                        {isSelected
                          ? 'Active Rank'
                          : isIncluded
                          ? 'Inherited Access'
                          : 'Click to Elevate'}
                      </span>
                      {rank.isOpsAndAbove && (
                        <span className="text-sky-300">Ops+</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ~ Owner Commissioned Roster: You, Witt Law Firm Coworkers & Supreme Court Confirmed Staff (John Roberts Rank) */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>~ Owner Commissioned Roster (John Roberts Rank · Level 10,000)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Richard Alan Witt (You), all coworkers at{' '}
                  <span className="text-sky-300 font-mono">www.wittlawfirm.com</span>, Chief Justice John G. Roberts, Jr., and all confirmed Justices &amp; Court Officers at{' '}
                  <span className="text-amber-300 font-mono">https://www.supremecourt.gov</span> hold <strong className="text-white">~ Owner (SRA)</strong> rank.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setOwnerFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs cursor-pointer whitespace-nowrap ${
                    ownerFilter === 'all'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ~ Owners ({OWNER_COMMISSION_ROSTER.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOwnerFilter('www.wittlawfirm.com')}
                  className={`px-2.5 py-1 rounded text-xs cursor-pointer whitespace-nowrap ${
                    ownerFilter === 'www.wittlawfirm.com'
                      ? 'bg-sky-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  wittlawfirm.com ({wittCount})
                </button>
                <button
                  type="button"
                  onClick={() => setOwnerFilter('https://www.supremecourt.gov')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs cursor-pointer whitespace-nowrap ${
                    ownerFilter === 'https://www.supremecourt.gov'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Scale className="w-3 h-3" />
                  <span>supremecourt.gov ({scotusCount})</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredOwners.map((member) => {
                const isScotus =
                  member.organization === 'https://www.supremecourt.gov';
                return (
                  <div
                    key={member.id}
                    className={`p-3 rounded-xl border bg-slate-950 space-y-1.5 ${
                      member.isCurrentUser
                        ? 'border-amber-400/70'
                        : isScotus
                        ? 'border-amber-500/30'
                        : 'border-sky-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          ~ {member.fullName}
                        </div>
                        <div className="text-[11px] font-mono text-amber-300 truncate">
                          ~{member.nick} · {member.rankLabel}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 shrink-0 font-bold">
                        Lvl {member.accessLevel}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 truncate">
                      {member.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {member.hostmask}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[10px] font-mono">
                      <span className="text-emerald-400 truncate">
                        {member.confirmationInfo}
                      </span>
                      {activeRank !== 'sra' && (
                        <button
                          type="button"
                          onClick={() => onRankChange('sra')}
                          className="text-amber-300 hover:underline shrink-0 cursor-pointer"
                        >
                          Switch to ~ Owner
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
