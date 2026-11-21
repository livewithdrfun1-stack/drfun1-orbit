/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Interactive 33+ World News Outlets Electronic Program Guide (EPG) for DrFun1 News.
 * - Renders live 3-hour broadcast grid (On Now, Up Next +60m, Later +120m) across all 33 global news channels (CH 101–133+)
 * - Supports one-click channel tuning to the DrFun1 News Video Player, Map/Directory sync mode or full 33-channel view,
 *   program reminders persisted in localStorage, search, region filtering, and breaking-only filtering.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Globe,
  MonitorPlay,
  RefreshCw,
  Search,
  Tv,
} from 'lucide-react';
import {
  buildWorldNewsEpgRows,
  DEFAULT_EPG_TIMEZONE_SELECTION,
  EPG_REGIONAL_TIMEZONE_OFFSETS,
  formatEpgClockTime,
  formatEpgTimeRange,
  getActiveEpgTimezoneMeta,
  getLocalTimezoneMeta,
} from '../data/drfun1NewsData';
import {
  EpgSyncSnapshot,
  EpgTimezoneMode,
  EpgTimezoneSelection,
  GlobalNewsOutlet,
  NewsOutletEpgSlot,
  NewsOutletRegion,
} from '../types/drfun1News';

interface DrFun1NewsEpgSectionProps {
  allOutlets: GlobalNewsOutlet[];
  filteredOutlets: GlobalNewsOutlet[];
  activeMapRegion: 'All' | NewsOutletRegion;
  tunedOutletId: string;
  epgSyncSnapshot?: EpgSyncSnapshot | null;
  isSyncingEpg?: boolean;
  epgAutoSyncEnabled?: boolean;
  epgCountdownSec?: number;
  onSyncEpg?: () => void;
  onToggleAutoSync?: () => void;
  onTuneOutlet: (outlet: GlobalNewsOutlet) => void;
  onNotify?: (msg: string) => void;
}

const STORAGE_KEY_EPG_REMINDERS = 'drfun1_news_epg_reminders_v1';
const STORAGE_KEY_EPG_TIMEZONE = 'drfun1_news_epg_timezone_v1';

const EPG_REGIONS: ('All' | NewsOutletRegion)[] = [
  'All',
  'Global Wire',
  'North America',
  'Europe',
  'Middle East',
  'Asia-Pacific',
  'Latin America',
  'Africa',
];

export const DrFun1NewsEpgSection: React.FC<DrFun1NewsEpgSectionProps> = ({
  allOutlets,
  filteredOutlets,
  activeMapRegion,
  tunedOutletId,
  epgSyncSnapshot = null,
  isSyncingEpg = false,
  epgAutoSyncEnabled = true,
  epgCountdownSec = 900,
  onSyncEpg,
  onToggleAutoSync,
  onTuneOutlet,
  onNotify,
}) => {
  const [syncWithMapFilter, setSyncWithMapFilter] = useState<boolean>(false);
  const [epgRegion, setEpgRegion] = useState<'All' | NewsOutletRegion>('All');
  const [epgSearch, setEpgSearch] = useState<string>('');
  const [breakingOnly, setBreakingOnly] = useState<boolean>(false);
  const [remindersOnly, setRemindersOnly] = useState<boolean>(false);
  const [isFullExpanded, setIsFullExpanded] = useState<boolean>(false);
  const [clockDate, setClockDate] = useState<Date>(() => new Date());

  const [remindedSlotIds, setRemindedSlotIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EPG_REMINDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  });

  const [timezoneSelection, setTimezoneSelection] = useState<EpgTimezoneSelection>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EPG_TIMEZONE);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<EpgTimezoneSelection>;
        if (
          (parsed.mode === 'local' || parsed.mode === 'utc' || parsed.mode === 'custom') &&
          typeof parsed.customOffsetMinutes === 'number' &&
          Number.isFinite(parsed.customOffsetMinutes)
        ) {
          return {
            mode: parsed.mode,
            customOffsetMinutes: parsed.customOffsetMinutes,
          };
        }
      }
    } catch (_) {}
    return DEFAULT_EPG_TIMEZONE_SELECTION;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EPG_REMINDERS, JSON.stringify(remindedSlotIds));
    } catch (_) {}
  }, [remindedSlotIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EPG_TIMEZONE, JSON.stringify(timezoneSelection));
    } catch (_) {}
  }, [timezoneSelection]);

  // Keep EPG clock aligned every 30s
  useEffect(() => {
    const id = window.setInterval(() => setClockDate(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const localTzMeta = useMemo(() => getLocalTimezoneMeta(clockDate), [clockDate]);
  const activeTzMeta = useMemo(
    () => getActiveEpgTimezoneMeta(timezoneSelection, clockDate),
    [timezoneSelection, clockDate]
  );

  const handleSelectTimezoneMode = (mode: EpgTimezoneMode) => {
    const next: EpgTimezoneSelection = { ...timezoneSelection, mode };
    setTimezoneSelection(next);
    const meta = getActiveEpgTimezoneMeta(next, clockDate);
    onNotify?.(`EPG schedule timezone switched to ${meta.shortCode} (${meta.offsetLabel} · ${meta.regionLabel})`);
  };

  const handleSelectCustomOffset = (offsetMinutes: number) => {
    const next: EpgTimezoneSelection = {
      mode: 'custom',
      customOffsetMinutes: offsetMinutes,
    };
    setTimezoneSelection(next);
    const meta = getActiveEpgTimezoneMeta(next, clockDate);
    onNotify?.(`EPG schedule timezone set to ${meta.shortCode} (${meta.offsetLabel} · ${meta.regionLabel})`);
  };

  const baseList = useMemo(() => {
    if (syncWithMapFilter) return filteredOutlets;
    return allOutlets;
  }, [syncWithMapFilter, filteredOutlets, allOutlets]);

  const epgRows = useMemo(() => {
    const computedRows = buildWorldNewsEpgRows(baseList, allOutlets, clockDate, timezoneSelection);
    const syncedMap = epgSyncSnapshot?.rowsByOutletId;

    // Merge latest API-synced slots & progress while formatting every slot window in the active EPG timezone
    const mergedRows = computedRows.map((row) => {
      const synced = syncedMap?.[row.outlet.id];
      if (!synced) return row;

      const localizedSlots = synced.slots.map((syncedSlot, slotIdx) => {
        const fallbackSlot = row.slots[slotIdx];
        const startMs = syncedSlot.startMs ?? fallbackSlot?.startMs;
        const endMs = syncedSlot.endMs ?? fallbackSlot?.endMs;
        return {
          ...syncedSlot,
          startMs,
          endMs,
          timeRange:
            typeof startMs === 'number' && typeof endMs === 'number'
              ? formatEpgTimeRange(startMs, endMs, timezoneSelection, clockDate)
              : fallbackSlot?.timeRange ?? syncedSlot.timeRange,
        };
      }) as [NewsOutletEpgSlot, NewsOutletEpgSlot, NewsOutletEpgSlot];

      return {
        ...row,
        progressPct: synced.progressPct,
        slots: localizedSlots,
      };
    });

    const q = epgSearch.trim().toLowerCase();

    return mergedRows.filter((row) => {
      if (!syncWithMapFilter && epgRegion !== 'All' && row.outlet.region !== epgRegion) {
        return false;
      }
      if (breakingOnly && !row.outlet.isBreaking) return false;
      if (remindersOnly) {
        const hasReminder = row.slots.some((s) => remindedSlotIds.includes(s.id));
        if (!hasReminder) return false;
      }
      if (!q) return true;
      return (
        row.outlet.name.toLowerCase().includes(q) ||
        row.outlet.callSign.toLowerCase().includes(q) ||
        row.outlet.country.toLowerCase().includes(q) ||
        String(row.channelNumber).includes(q) ||
        row.slots.some(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.synopsis.toLowerCase().includes(q)
        )
      );
    });
  }, [
    baseList,
    allOutlets,
    clockDate,
    timezoneSelection,
    epgSyncSnapshot,
    epgSearch,
    syncWithMapFilter,
    epgRegion,
    breakingOnly,
    remindersOnly,
    remindedSlotIds,
  ]);

  const handleToggleReminder = (slotId: string, showTitle: string, callSign: string) => {
    setRemindedSlotIds((prev) => {
      const exists = prev.includes(slotId);
      const next = exists ? prev.filter((x) => x !== slotId) : [...prev, slotId];
      onNotify?.(
        exists
          ? `Removed EPG reminder for "${showTitle}" (${callSign})`
          : `Set EPG reminder for "${showTitle}" on ${callSign}`
      );
      return next;
    });
  };

  const utcTimeLabel = clockDate.toISOString().slice(11, 16) + ' UTC';
  const activeClockLabel = `${formatEpgClockTime(clockDate.getTime(), timezoneSelection, false)} ${activeTzMeta.shortCode}`;
  const lastSyncedLabel = epgSyncSnapshot
    ? `${formatEpgClockTime(new Date(epgSyncSnapshot.syncedAt).getTime(), timezoneSelection, true)} ${activeTzMeta.shortCode}`
    : null;
  const countdownMins = String(Math.floor(Math.max(0, epgCountdownSec) / 60)).padStart(2, '0');
  const countdownSecs = String(Math.max(0, epgCountdownSec) % 60).padStart(2, '0');

  return (
    <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header & Live Clock + Sync EPG Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-red-400" />
            <span>
              DrFun1 News World EPG Guide ({epgRows.length} / {allOutlets.length} World News Channels)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Live 3-hour electronic program guide across all {allOutlets.length} global television news outlets (CH 101–{100 + allOutlets.length}) · Click any channel or On Now block to watch live.
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono text-slate-400 tabular-nums">
            {isSyncingEpg ? (
              <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Syncing {allOutlets.length}-channel schedule from EPG API…</span>
              </span>
            ) : lastSyncedLabel && epgSyncSnapshot ? (
              <span className="text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>Synced {lastSyncedLabel}</span>
              </span>
            ) : (
              <span>Waiting for initial EPG sync</span>
            )}
            {epgSyncSnapshot && (
              <>
                <span aria-hidden="true">·</span>
                <span>Rev #{epgSyncSnapshot.revision}</span>
                <span aria-hidden="true">·</span>
                <span>{epgSyncSnapshot.latencyMs} ms</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>
              {epgAutoSyncEnabled
                ? `Next auto-sync in ${countdownMins}:${countdownSecs}`
                : 'Auto-sync paused'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5 tabular-nums whitespace-nowrap shrink-0"
            title={`Active EPG Schedule Timezone: ${activeTzMeta.shortCode} (${activeTzMeta.offsetLabel} · ${activeTzMeta.regionLabel})`}
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-white font-semibold">{activeClockLabel}</span>
            {timezoneSelection.mode !== 'utc' && (
              <>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="text-cyan-300">{utcTimeLabel}</span>
              </>
            )}
          </div>

          {onSyncEpg && (
            <button
              type="button"
              disabled={isSyncingEpg}
              onClick={onSyncEpg}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              title="Refresh all 33+ world news channels immediately from the EPG API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingEpg ? 'animate-spin' : ''}`} />
              <span>{isSyncingEpg ? 'Syncing…' : 'Sync EPG'}</span>
            </button>
          )}

          {onToggleAutoSync && (
            <button
              type="button"
              onClick={onToggleAutoSync}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition whitespace-nowrap shrink-0 cursor-pointer ${
                epgAutoSyncEnabled
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-950'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-600'
              }`}
              title="Automatically refresh the 33-channel EPG schedule every 15 minutes"
            >
              Auto-Sync 15m: {epgAutoSyncEnabled ? 'ON' : 'OFF'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setSyncWithMapFilter((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition whitespace-nowrap shrink-0 cursor-pointer ${
              syncWithMapFilter
                ? 'bg-sky-600/20 text-sky-300 border-sky-500/50'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
            }`}
            title="Toggle between showing all 33+ world news channels or following the D3 map & directory filter"
          >
            {syncWithMapFilter
              ? `Synced to Map (${filteredOutlets.length})`
              : `Showing All ${allOutlets.length} Channels`}
          </button>

          <button
            type="button"
            onClick={() => setIsFullExpanded((v) => !v)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isFullExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-300" />
                <span>Compact Height</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
                <span>Expand All {epgRows.length}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* EPG Search, Filter Toggles & Region Tabs */}
      <div className="space-y-2.5">
        <div className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={epgSearch}
              onChange={(e) => setEpgSearch(e.target.value)}
              placeholder="Filter EPG by channel # (e.g. 101), callsign, country, or program title..."
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setBreakingOnly((v) => !v)}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                breakingOnly
                  ? 'bg-red-600/20 text-red-300 border-red-500/50'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Breaking Desks</span>
            </button>

            <button
              type="button"
              onClick={() => setRemindersOnly((v) => !v)}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                remindersOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
              <span>Reminders ({remindedSlotIds.length})</span>
            </button>
          </div>
        </div>

        {!syncWithMapFilter ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {EPG_REGIONS.map((reg) => {
              const count =
                reg === 'All'
                  ? allOutlets.length
                  : allOutlets.filter((o) => o.region === reg).length;
              return (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setEpgRegion(reg)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold transition cursor-pointer ${
                    epgRegion === reg
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {reg} ({count})
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-[11px] font-mono text-sky-300">
            EPG following active D3 Map / Directory filter: <strong>{activeMapRegion}</strong> ({filteredOutlets.length} channels)
          </div>
        )}
        {/* EPG Schedule Timezone Toggle (Local / UTC / Custom Regional Offset) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 whitespace-nowrap shrink-0">
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Schedule Timezone</span>
            </div>

            <div
              role="group"
              aria-label="EPG schedule timezone mode"
              className="inline-flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800"
            >
              <button
                type="button"
                aria-pressed={timezoneSelection.mode === 'local'}
                onClick={() => handleSelectTimezoneMode('local')}
                title={`View EPG schedule in your browser's local timezone (${localTzMeta.shortCode} · ${localTzMeta.offsetLabel})`}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  timezoneSelection.mode === 'local'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Local ({localTzMeta.shortCode})
              </button>
              <button
                type="button"
                aria-pressed={timezoneSelection.mode === 'utc'}
                onClick={() => handleSelectTimezoneMode('utc')}
                title="View EPG schedule in Coordinated Universal Time (UTC+00:00)"
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  timezoneSelection.mode === 'utc'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                UTC
              </button>
              <button
                type="button"
                aria-pressed={timezoneSelection.mode === 'custom'}
                onClick={() => handleSelectTimezoneMode('custom')}
                title="View EPG schedule using a custom selected regional UTC offset"
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  timezoneSelection.mode === 'custom'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Regional Offset
              </button>
            </div>

            <label className="flex items-center gap-1.5 min-w-0">
              <span className="sr-only">Select custom regional UTC offset</span>
              <select
                aria-label="Custom regional timezone offset"
                value={timezoneSelection.customOffsetMinutes}
                onChange={(e) => handleSelectCustomOffset(Number(e.target.value))}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono tabular-nums bg-slate-900 border transition focus:outline-none focus:border-cyan-400 cursor-pointer max-w-[270px] sm:max-w-[320px] truncate ${
                  timezoneSelection.mode === 'custom'
                    ? 'border-cyan-500/60 text-cyan-200'
                    : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {EPG_REGIONAL_TIMEZONE_OFFSETS.map((opt) => (
                  <option key={opt.id} value={opt.offsetMinutes} className="bg-slate-950 text-slate-100">
                    {opt.offsetLabel} · {opt.shortCode} — {opt.regionName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 tabular-nums whitespace-nowrap shrink-0">
            <span className="text-cyan-300 font-semibold">{activeTzMeta.offsetLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[240px]" title={activeTzMeta.regionLabel}>
              {activeTzMeta.regionLabel}
            </span>
          </div>
        </div>
      </div>

      {/* EPG Matrix Grid */}
      {epgRows.length === 0 ? (
        <div className="py-10 px-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
          <div className="text-sm font-semibold text-white">
            No channels in the World News EPG match the current filters.
          </div>
          <button
            type="button"
            onClick={() => {
              setSyncWithMapFilter(false);
              setEpgRegion('All');
              setEpgSearch('');
              setBreakingOnly(false);
              setRemindersOnly(false);
            }}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
          >
            Show All {allOutlets.length} EPG Channels
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div
            className={`min-w-[880px] space-y-2 ${
              isFullExpanded ? '' : 'max-h-[540px] overflow-y-auto pr-1'
            }`}
          >
            {/* Sticky Time Header Row */}
            <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm grid grid-cols-12 gap-2 px-2.5 py-2 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tabular-nums">
              <div className="col-span-3 flex items-center justify-between gap-1.5 pr-2">
                <span className="flex items-center gap-1.5 truncate">
                  <Tv className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">World Outlet (CH 101–{100 + allOutlets.length})</span>
                </span>
                <span className="text-[10px] text-cyan-300 font-semibold shrink-0">
                  {activeTzMeta.headerZoneTag}
                </span>
              </div>
              <div className="col-span-3 text-red-400 font-bold truncate">
                On Now · {epgRows[0]?.slots[0].timeRange}
              </div>
              <div className="col-span-3 truncate">
                Up Next · {epgRows[0]?.slots[1].timeRange}
              </div>
              <div className="col-span-3 truncate">
                Later · {epgRows[0]?.slots[2].timeRange}
              </div>
            </div>

            {epgRows.map((row) => {
              const { outlet, channelNumber, progressPct, slots } = row;
              const isTuned = outlet.id === tunedOutletId;

              return (
                <div
                  key={outlet.id}
                  className={`grid grid-cols-12 gap-2 items-stretch rounded-xl p-2 border transition ${
                    isTuned
                      ? 'bg-red-950/25 border-red-500/60 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Column 1: Channel Number + Outlet Identity */}
                  <button
                    type="button"
                    onClick={() => onTuneOutlet(outlet)}
                    className="col-span-3 flex items-center justify-between gap-2 pr-2 text-left cursor-pointer group"
                    title={`Tune CH ${channelNumber} ${outlet.name} on DrFun1 News`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex flex-col items-center justify-center w-12 shrink-0">
                        <span className="text-[10px] font-mono font-bold text-slate-400 tabular-nums">
                          CH {channelNumber}
                        </span>
                        <span
                          className="w-full py-1 rounded-md text-center font-black text-[9.5px] text-slate-950 truncate px-1 mt-0.5"
                          style={{ backgroundColor: outlet.accentColor }}
                        >
                          {outlet.callSign}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-red-300 truncate flex items-center gap-1.5">
                          <span className="truncate">{outlet.name}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                          {outlet.country} · {outlet.region}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-300 tabular-nums mt-0.5 flex items-center gap-1.5">
                          <span>{outlet.viewers.toLocaleString()} live</span>
                          {outlet.isBreaking && (
                            <span className="text-red-400 font-bold">· BREAKING</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold shrink-0 flex items-center gap-1 ${
                        isTuned
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-900 text-slate-300 group-hover:bg-white group-hover:text-slate-950'
                      }`}
                    >
                      <MonitorPlay className="w-2.5 h-2.5" />
                      <span>{isTuned ? 'LIVE' : 'Tune'}</span>
                    </span>
                  </button>

                  {/* Columns 2-4: On Now / Up Next / Later */}
                  {slots.map((slot) => {
                    const isReminded = remindedSlotIds.includes(slot.id);
                    return (
                      <div
                        key={slot.id}
                        className={`col-span-3 rounded-lg p-2.5 border flex flex-col justify-between gap-1.5 ${
                          slot.windowType === 'now'
                            ? isTuned
                              ? 'bg-slate-900 border-red-500/40'
                              : 'bg-slate-900/95 border-slate-700'
                            : 'bg-slate-900/50 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (slot.windowType === 'now') {
                                onTuneOutlet(outlet);
                              } else {
                                handleToggleReminder(slot.id, slot.title, outlet.callSign);
                              }
                            }}
                            className="text-left min-w-0 cursor-pointer flex-1"
                          >
                            <div className="text-xs font-bold text-white truncate hover:text-red-300">
                              {slot.title}
                            </div>
                            <div className="text-[10px] font-mono tabular-nums text-cyan-300 truncate mt-0.5">
                              {slot.timeRange} · {slot.deskOrHost}
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                              {slot.synopsis}
                            </div>
                          </button>

                          {slot.windowType !== 'now' ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleReminder(slot.id, slot.title, outlet.callSign)
                              }
                              className={`p-1 rounded border shrink-0 transition cursor-pointer ${
                                isReminded
                                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                              }`}
                              title={isReminded ? 'Reminder set' : 'Set program reminder'}
                              aria-label={`Toggle reminder for ${slot.title}`}
                            >
                              {isReminded ? (
                                <BellRing className="w-3 h-3" />
                              ) : (
                                <Bell className="w-3 h-3" />
                              )}
                            </button>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-red-600/20 text-red-300 border border-red-500/30 text-[9px] font-mono font-bold shrink-0">
                              ON NOW
                            </span>
                          )}
                        </div>

                        {slot.windowType === 'now' && (
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500 transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
