/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Watch History Sidebar for DrFun1 News
 * Tracks the last 5 TV/news channels and stream sources viewed so users
 * can jump back to previous channels and transport sources in one click.
 */

import React from 'react';
import {
  ArrowUpRight,
  Clock,
  Globe,
  History,
  Radio,
  RotateCcw,
  Satellite,
  Server,
  Trash2,
  Tv,
  X,
} from 'lucide-react';
import { NewsStreamSourceType, WatchHistoryEntry } from '../types/drfun1News';

interface DrFun1NewsWatchHistorySidebarProps {
  entries: WatchHistoryEntry[];
  activeOutletId: string;
  activeSourceType: NewsStreamSourceType;
  nowTick?: number;
  onSelectEntry: (entry: WatchHistoryEntry) => void;
  onRemoveEntry: (key: string) => void;
  onClearHistory: () => void;
}

const getSourceIcon = (sourceType: NewsStreamSourceType) => {
  switch (sourceType) {
    case 'satellite':
      return <Satellite className="w-3 h-3 text-sky-400 shrink-0" />;
    case 'web':
      return <Globe className="w-3 h-3 text-purple-400 shrink-0" />;
    case 'local':
      return <Radio className="w-3 h-3 text-emerald-400 shrink-0" />;
    case 'fiber':
      return <Server className="w-3 h-3 text-amber-400 shrink-0" />;
    case 'strimm':
      return <Tv className="w-3 h-3 text-teal-400 shrink-0" />;
  }
};

const formatViewedTime = (viewedAt: number): string => {
  const diffSec = Math.max(0, Math.floor((Date.now() - viewedAt) / 1000));
  if (diffSec < 15) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return new Date(viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const DrFun1NewsWatchHistorySidebar: React.FC<DrFun1NewsWatchHistorySidebarProps> = ({
  entries,
  activeOutletId,
  activeSourceType,
  nowTick: _nowTick,
  onSelectEntry,
  onRemoveEntry,
  onClearHistory,
}) => {
  const previousEntry = entries.find(
    (entry) => !(entry.outletId === activeOutletId && entry.sourceType === activeSourceType)
  );

  return (
    <aside
      aria-label="Watch History"
      className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <History className="w-4 h-4 text-cyan-400 shrink-0" />
          <h3 className="text-sm font-bold text-white truncate">Watch History</h3>
          <span className="text-[11px] font-mono text-slate-400 tabular-nums shrink-0">
            {entries.length}/5
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {previousEntry && (
            <button
              type="button"
              onClick={() => onSelectEntry(previousEntry)}
              className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono font-semibold text-cyan-300 flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors"
              title={`Jump back to ${previousEntry.callSign} (${previousEntry.sourceLabel})`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Previous</span>
            </button>
          )}
          {entries.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 cursor-pointer transition-colors"
              title="Clear watch history"
              aria-label="Clear watch history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* History Items List */}
      {entries.length === 0 ? (
        <div className="py-6 px-3 text-center space-y-1.5">
          <Clock className="w-5 h-5 text-slate-500 mx-auto" />
          <div className="text-xs font-semibold text-slate-300">No recent channels yet</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The last 5 news channels and stream sources you watch will appear here for one-click switching.
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-slate-800/80 -mx-1">
          {entries.map((entry, idx) => {
            const isCurrent =
              entry.outletId === activeOutletId && entry.sourceType === activeSourceType;
            return (
              <li key={entry.key} className="group flex items-center gap-1 py-1.5 px-1">
                <button
                  type="button"
                  onClick={() => onSelectEntry(entry)}
                  aria-current={isCurrent ? 'true' : undefined}
                  className={`flex-1 min-w-0 text-left rounded-xl px-2.5 py-2 transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-red-950/35 text-white'
                      : 'hover:bg-slate-800/70 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-[10px] font-mono text-slate-500 tabular-nums shrink-0"
                        aria-hidden="true"
                      >
                        {idx + 1}.
                      </span>
                      <span
                        className="w-2 h-2 rounded-sm shrink-0"
                        style={{ backgroundColor: entry.accentColor }}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-bold text-white truncate">
                        {entry.callSign}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono font-bold text-red-400 whitespace-nowrap shrink-0">
                          Watching now
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 tabular-nums shrink-0">
                      <span>{formatViewedTime(entry.viewedAt)}</span>
                      {!isCurrent && (
                        <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-300 transition-colors" />
                      )}
                    </div>
                  </div>

                  <div className="mt-1 pl-4 text-[11px] text-slate-300 truncate">
                    {entry.programTitle}
                  </div>

                  <div className="mt-1 pl-4 flex items-center gap-1.5 text-[10.5px] font-mono text-slate-400 min-w-0">
                    {getSourceIcon(entry.sourceType)}
                    <span className="text-slate-300 font-semibold whitespace-nowrap shrink-0">
                      {entry.sourceLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{entry.country}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onRemoveEntry(entry.key)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-300 hover:bg-slate-800/80 opacity-60 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer shrink-0"
                  title={`Remove ${entry.callSign} (${entry.sourceLabel}) from watch history`}
                  aria-label={`Remove ${entry.callSign} from watch history`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
};
