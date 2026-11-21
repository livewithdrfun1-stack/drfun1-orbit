/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Breaking News Ticker for DrFun1 News
 * Fetches and displays live headline alerts from the active news outlet feed,
 * producer flash bulletins, and live satcom news wires at the top of DrFun1NewsView.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Flame,
  MonitorPlay,
  Pause,
  Play,
  RefreshCw,
} from 'lucide-react';
import { fetchActiveBreakingNewsAlerts } from '../data/drfun1NewsData';
import {
  BreakingNewsAlert,
  DrFun1NewsBulletin,
  GlobalNewsOutlet,
  NewsStreamSourceType,
} from '../types/drfun1News';

interface DrFun1BreakingNewsTickerProps {
  tunedOutlet: GlobalNewsOutlet;
  allOutlets: GlobalNewsOutlet[];
  bulletins: DrFun1NewsBulletin[];
  activeSourceType: NewsStreamSourceType;
  activeFeedUrl: string;
  isLiveStreaming: boolean;
  totalLiveViewers: number;
  onTuneOutletId: (outletId: string) => void;
  onNotify?: (msg: string) => void;
}

type TickerDisplayMode = 'marquee' | 'focus';
type TickerSpeed = 'slow' | 'normal' | 'fast';

const AUTO_POLL_INTERVAL_MS = 45000;

export const DrFun1BreakingNewsTicker: React.FC<DrFun1BreakingNewsTickerProps> = ({
  tunedOutlet,
  allOutlets,
  bulletins,
  activeSourceType,
  activeFeedUrl,
  isLiveStreaming,
  totalLiveViewers,
  onTuneOutletId,
  onNotify,
}) => {
  const [alerts, setAlerts] = useState<BreakingNewsAlert[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [activeFeedLabel, setActiveFeedLabel] = useState<string>(tunedOutlet.callSign);
  const [fetchLatencyMs, setFetchLatencyMs] = useState<number | null>(null);

  const [displayMode, setDisplayMode] = useState<TickerDisplayMode>(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return 'focus';
    }
    return 'marquee';
  });
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<TickerSpeed>('normal');
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const pollCycleRef = useRef<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  const latestDataRef = useRef({
    tunedOutlet,
    allOutlets,
    bulletins,
    activeSourceType,
    activeFeedUrl,
  });
  latestDataRef.current = {
    tunedOutlet,
    allOutlets,
    bulletins,
    activeSourceType,
    activeFeedUrl,
  };

  const loadBreakingAlerts = async (trigger: 'auto' | 'manual' | 'context') => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setIsFetching(true);

    const nextCycle = trigger === 'context' ? pollCycleRef.current : pollCycleRef.current + 1;
    pollCycleRef.current = nextCycle;

    try {
      const snapshot = latestDataRef.current;
      const res = await fetchActiveBreakingNewsAlerts({
        tunedOutlet: snapshot.tunedOutlet,
        allOutlets: snapshot.allOutlets,
        bulletins: snapshot.bulletins,
        activeSourceType: snapshot.activeSourceType,
        activeFeedUrl: snapshot.activeFeedUrl,
        pollCycle: nextCycle,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;
      setAlerts(res.alerts);
      setLastFetchedAt(res.fetchedAt);
      setActiveFeedLabel(res.feedLabel);
      setFetchLatencyMs(res.latencyMs);
      setFocusIndex(0);

      if (trigger === 'manual') {
        onNotify?.(
          `Refreshed ${res.alerts.length} breaking alerts from ${res.feedLabel} (${res.latencyMs}ms)`
        );
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        onNotify?.('Unable to refresh live breaking news feed — retrying shortly');
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsFetching(false);
      }
    }
  };

  const loadAlertsRef = useRef(loadBreakingAlerts);
  loadAlertsRef.current = loadBreakingAlerts;

  // Fetch immediately whenever the active news feed, source, or producer bulletins change
  useEffect(() => {
    loadAlertsRef.current('context');
  }, [tunedOutlet.id, activeSourceType, activeFeedUrl, bulletins.length]);

  // Live background polling every 45 seconds when live wire is active
  useEffect(() => {
    if (!isLiveStreaming) return;
    const id = window.setInterval(() => {
      loadAlertsRef.current('auto');
    }, AUTO_POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isLiveStreaming]);

  // Abort any in-flight request on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Auto-advance headlines in Focus mode
  useEffect(() => {
    if (displayMode !== 'focus' || isPaused || alerts.length <= 1) return;
    const id = window.setInterval(() => {
      setFocusIndex((prev) => (prev + 1) % alerts.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [displayMode, isPaused, alerts.length]);

  const activeFocusAlert = alerts[focusIndex % Math.max(1, alerts.length)];
  const speedClass =
    speed === 'slow'
      ? 'ticker-speed-slow'
      : speed === 'fast'
        ? 'ticker-speed-fast'
        : 'ticker-speed-normal';

  const cycleSpeed = () => {
    setSpeed((prev) => (prev === 'normal' ? 'fast' : prev === 'fast' ? 'slow' : 'normal'));
  };

  const lastFetchedLabel = lastFetchedAt
    ? new Date(lastFetchedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--';

  const handleAlertClick = (alert: BreakingNewsAlert) => {
    if (alert.outletId) {
      onTuneOutletId(alert.outletId);
    } else {
      setIsDrawerOpen(true);
    }
  };

  const getPriorityTextClass = (priority: BreakingNewsAlert['priority']) => {
    switch (priority) {
      case 'FLASH':
        return 'text-red-400';
      case 'URGENT':
        return 'text-amber-300';
      case 'BREAKING':
        return 'text-rose-300';
      default:
        return 'text-cyan-300';
    }
  };

  return (
    <section
      aria-label="Breaking News Live Ticker"
      className="bg-slate-950 border border-red-500/50 rounded-2xl overflow-hidden shadow-xl"
    >
      {/* Primary Ticker Bar */}
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        {/* Left Broadcast Breaking Label */}
        <div className="bg-red-600 text-white px-3.5 py-2 flex items-center justify-between lg:justify-start gap-2.5 shrink-0">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Flame className="w-4 h-4 shrink-0" />
            <span className="text-xs font-mono font-black tracking-wide uppercase">
              Breaking News
            </span>
          </div>
          <span className="text-[10.5px] font-mono text-red-100/90 border-l border-red-400/50 pl-2 whitespace-nowrap truncate max-w-[165px]">
            {activeFeedLabel}
          </span>
        </div>

        {/* Center Scrolling or Focused Alert Track */}
        <div className="flex-1 min-w-0 bg-gradient-to-r from-red-950/45 via-slate-950 to-slate-950 flex items-center overflow-hidden px-3 py-2 min-h-[40px]">
          {alerts.length === 0 ? (
            <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-red-400 animate-spin shrink-0" />
              <span>Fetching live headline alerts from {tunedOutlet.callSign} feed…</span>
            </div>
          ) : displayMode === 'marquee' ? (
            <div className="w-full overflow-hidden">
              <div
                className={`animate-ticker-marquee ${speedClass} ${
                  isPaused ? 'ticker-paused' : ''
                } items-center gap-8`}
              >
                {[...alerts, ...alerts].map((alert, idx) => (
                  <button
                    key={`${alert.id}-${idx}`}
                    type="button"
                    onClick={() => handleAlertClick(alert)}
                    className="inline-flex items-center gap-2 text-xs font-mono text-slate-100 hover:text-white whitespace-nowrap shrink-0 cursor-pointer group"
                    title={
                      alert.outletId
                        ? `Click to watch ${alert.outletCallSign}`
                        : `Open ${alert.outletCallSign} alert source`
                    }
                  >
                    <span
                      className={`text-[10.5px] font-bold uppercase ${getPriorityTextClass(
                        alert.priority
                      )}`}
                    >
                      {alert.priority}
                    </span>
                    <span className="text-slate-500" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-bold text-white group-hover:text-red-300 transition-colors">
                      {alert.outletCallSign}
                    </span>
                    <span className="text-slate-200 group-hover:underline">
                      {alert.headline}
                    </span>
                    <span className="text-[10px] text-slate-500 tabular-nums">
                      ({alert.timestamp})
                    </span>
                    <span className="text-red-500/60 pl-3" aria-hidden="true">
                      •
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : activeFocusAlert ? (
            <div className="w-full flex items-center justify-between gap-2 min-w-0">
              <button
                type="button"
                onClick={() => handleAlertClick(activeFocusAlert)}
                className="flex items-center gap-2 min-w-0 flex-1 text-left text-xs font-mono text-slate-100 hover:text-white cursor-pointer group"
              >
                <span
                  className={`text-[10.5px] font-bold uppercase whitespace-nowrap shrink-0 ${getPriorityTextClass(
                    activeFocusAlert.priority
                  )}`}
                >
                  {activeFocusAlert.priority}
                </span>
                <span className="text-slate-500 shrink-0" aria-hidden="true">
                  ·
                </span>
                <span className="font-bold text-white whitespace-nowrap shrink-0 group-hover:text-red-300">
                  {activeFocusAlert.outletCallSign}
                </span>
                <span className="truncate text-slate-200 group-hover:underline">
                  {activeFocusAlert.headline}
                </span>
              </button>
              <span className="text-[10px] font-mono text-slate-400 tabular-nums whitespace-nowrap shrink-0">
                {(focusIndex % alerts.length) + 1}/{alerts.length}
              </span>
            </div>
          ) : null}
        </div>

        {/* Right Interactive Controls */}
        <div className="bg-slate-900/90 border-t lg:border-t-0 lg:border-l border-slate-800 px-2.5 py-1.5 flex flex-wrap items-center justify-between lg:justify-end gap-1.5 shrink-0">
          <div className="hidden xl:flex items-center gap-1.5 text-[10.5px] font-mono text-slate-400 tabular-nums pr-1.5 whitespace-nowrap">
            <span className="text-emerald-300">{totalLiveViewers.toLocaleString()} watching</span>
            <span aria-hidden="true">·</span>
            <span>{alerts.length} alerts</span>
          </div>

          {displayMode === 'focus' && alerts.length > 1 && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() =>
                  setFocusIndex((prev) => (prev - 1 + alerts.length) % alerts.length)
                }
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                aria-label="Previous breaking headline"
                title="Previous headline"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setFocusIndex((prev) => (prev + 1) % alerts.length)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                aria-label="Next breaking headline"
                title="Next headline"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            aria-label={isPaused ? 'Resume ticker' : 'Pause ticker'}
            title={isPaused ? 'Resume ticker' : 'Pause ticker'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {displayMode === 'marquee' && (
            <button
              type="button"
              onClick={cycleSpeed}
              className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10.5px] font-mono font-semibold text-slate-300 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
              title="Adjust ticker scroll speed"
            >
              {speed === 'fast' ? 'Fast' : speed === 'slow' ? 'Slow' : '1x'}
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              setDisplayMode((m) => (m === 'marquee' ? 'focus' : 'marquee'))
            }
            className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10.5px] font-mono font-semibold text-slate-300 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
            title="Toggle between continuous scroll and single-headline focus mode"
          >
            {displayMode === 'marquee' ? 'Focus' : 'Scroll'}
          </button>

          <button
            type="button"
            disabled={isFetching}
            onClick={() => loadBreakingAlerts('manual')}
            className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 disabled:opacity-50 border border-slate-800 text-[10.5px] font-mono font-semibold text-cyan-300 flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            title="Fetch latest breaking alerts from active news feed"
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isFetching ? 'Fetching…' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDrawerOpen((o) => !o)}
            aria-expanded={isDrawerOpen}
            className={`px-2 py-1 rounded-lg border text-[10.5px] font-mono font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              isDrawerOpen
                ? 'bg-red-600/20 border-red-500/50 text-red-200'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Expand full breaking alerts list"
          >
            <span>All ({alerts.length})</span>
            {isDrawerOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Live Alerts Feed Drawer */}
      {isDrawerOpen && (
        <div className="border-t border-slate-800 bg-slate-950/95 px-4 py-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800/80 tabular-nums">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="text-white font-bold">Active News Feed Alerts</span>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-300 truncate">{activeFeedLabel}</span>
              <span aria-hidden="true">·</span>
              <span>Updated {lastFetchedLabel}</span>
              {fetchLatencyMs !== null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{fetchLatencyMs} ms</span>
                </>
              )}
            </div>
            <span className="text-[10.5px] text-slate-500">
              Auto-refreshes every 45s while Live Wire is ON
            </span>
          </div>

          <ul className="divide-y divide-slate-800/75 max-h-64 overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-mono">
                    <span className={`font-bold uppercase ${getPriorityTextClass(alert.priority)}`}>
                      {alert.priority}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-bold text-white">{alert.outletCallSign}</span>
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-slate-400">{alert.sourceFeedLabel}</span>
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-slate-500 tabular-nums">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-snug">{alert.headline}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {alert.outletId ? (
                    <button
                      type="button"
                      onClick={() => {
                        onTuneOutletId(alert.outletId!);
                        setIsDrawerOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-red-600 border border-slate-700 hover:border-red-500 text-[10.5px] font-mono font-bold text-slate-200 hover:text-white flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors"
                    >
                      <MonitorPlay className="w-3 h-3" />
                      <span>Watch Desk</span>
                    </button>
                  ) : alert.sourceUrl ? (
                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10.5px] font-mono font-bold text-cyan-300 flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
