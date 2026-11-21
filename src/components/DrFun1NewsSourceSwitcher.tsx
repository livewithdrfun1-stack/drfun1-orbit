/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Dynamic 'Source Switcher' Menu for DrFun1 News
 * Allows instant in-place switching between Satellite, Web, Local, and Fiber 100G
 * global news stream sources with live per-outlet route telemetry and auto-failover.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  Globe,
  Radio,
  RefreshCw,
  RotateCcw,
  Satellite,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Tv,
  WifiOff,
} from 'lucide-react';
import {
  NEWS_STREAM_SOURCE_PROFILES,
  resolveOutletStreamSource,
} from '../data/drfun1NewsData';
import {
  GlobalNewsOutlet,
  NewsStreamSourceType,
  StreamConnectionPhase,
  StreamReconnectEvent,
} from '../types/drfun1News';

interface DrFun1NewsSourceSwitcherProps {
  tunedOutlet: GlobalNewsOutlet;
  activeSource: NewsStreamSourceType;
  activeMirrorIndex: number;
  connectionPhase: StreamConnectionPhase;
  reconnectAttempt: number;
  disconnectReason: string | null;
  reconnectLog: StreamReconnectEvent[];
  autoFailover: boolean;
  liveTick: number;
  onSelectSource: (source: NewsStreamSourceType) => void;
  onSelectMirrorIndex: (mirrorIndex: number) => void;
  onToggleAutoFailover: () => void;
  onSimulateDisconnect: () => void;
  onManualReconnect: () => void;
  onRestorePrimary: () => void;
  onCopyActiveUrl: (url: string, label: string) => void;
  copiedFeed?: boolean;
}

const getSourceIcon = (id: NewsStreamSourceType, className = 'w-3.5 h-3.5') => {
  switch (id) {
    case 'satellite':
      return <Satellite className={className} />;
    case 'web':
      return <Globe className={className} />;
    case 'local':
      return <Radio className={className} />;
    case 'fiber':
      return <Server className={className} />;
    case 'strimm':
      return <Tv className={className} />;
  }
};

export const DrFun1NewsSourceSwitcher: React.FC<DrFun1NewsSourceSwitcherProps> = ({
  tunedOutlet,
  activeSource,
  activeMirrorIndex,
  connectionPhase,
  reconnectAttempt,
  disconnectReason,
  reconnectLog,
  autoFailover,
  liveTick,
  onSelectSource,
  onSelectMirrorIndex,
  onToggleAutoFailover,
  onSimulateDisconnect,
  onManualReconnect,
  onRestorePrimary,
  onCopyActiveUrl,
  copiedFeed = false,
}) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeResolved = resolveOutletStreamSource(
    tunedOutlet,
    activeSource,
    liveTick,
    activeMirrorIndex
  );

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const isFaulted =
    connectionPhase === 'disconnected' ||
    connectionPhase === 'reconnecting' ||
    connectionPhase === 'failed';

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950/90 border rounded-xl px-3 py-2 transition-colors ${
        connectionPhase === 'reconnecting'
          ? 'border-amber-500/60'
          : connectionPhase === 'disconnected' || connectionPhase === 'failed'
            ? 'border-rose-500/60'
            : connectionPhase === 'mirror_active'
              ? 'border-cyan-500/50'
              : 'border-slate-800'
      }`}
    >
      {/* Left: Quick One-Click Segmented Source Switcher */}
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <span className="text-[11px] font-mono text-slate-400 font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Source Switcher:</span>
        </span>

        <div
          role="radiogroup"
          aria-label="Global news stream source"
          className="flex flex-wrap items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg"
        >
          {NEWS_STREAM_SOURCE_PROFILES.map((profile) => {
            const isSelected = activeSource === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectSource(profile.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {getSourceIcon(profile.id, 'w-3.5 h-3.5')}
                <span>{profile.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Connection Health + Route Readout + Expandable Source & Mirror Menu */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-400 tabular-nums">
          {connectionPhase === 'reconnecting' ? (
            <span className="text-amber-300 font-semibold flex items-center gap-1 whitespace-nowrap">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Reconnecting (#{reconnectAttempt})</span>
            </span>
          ) : connectionPhase === 'disconnected' || connectionPhase === 'failed' ? (
            <span className="text-rose-400 font-semibold flex items-center gap-1 whitespace-nowrap">
              <WifiOff className="w-3 h-3" />
              <span>{connectionPhase === 'failed' ? 'Mirrors Exhausted' : 'Disconnected'}</span>
            </span>
          ) : connectionPhase === 'mirror_active' ? (
            <span className="text-cyan-300 font-semibold flex items-center gap-1 whitespace-nowrap">
              <ShieldCheck className="w-3 h-3" />
              <span>{activeResolved.activeEndpoint.tier === 'tertiary' ? 'Mirror #3 Active' : 'Mirror #2 Active'}</span>
            </span>
          ) : (
            <span className="text-slate-200 font-semibold truncate max-w-[180px]">
              {activeResolved.profile.protocol}
            </span>
          )}
          <span aria-hidden="true">·</span>
          <span className={isFaulted ? 'text-rose-400' : 'text-emerald-300'}>
            {isFaulted ? '-- ms' : `${activeResolved.latencyMs} ms`}
          </span>
          <span aria-hidden="true">·</span>
          <span className={isFaulted ? 'text-slate-500' : 'text-cyan-300'}>
            {isFaulted ? '0.0 Mbps' : `${activeResolved.effectiveBitrateMbps} Mbps`}
          </span>
        </div>

        {/* Quick Test Disconnect or Restore Primary action right on the bar */}
        {connectionPhase === 'mirror_active' ? (
          <button
            type="button"
            onClick={onRestorePrimary}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border border-cyan-500/50 bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-200 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            title="Switch back to primary stream URL"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Primary</span>
          </button>
        ) : connectionPhase === 'disconnected' || connectionPhase === 'failed' ? (
          <button
            type="button"
            onClick={onManualReconnect}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border border-amber-500/50 bg-amber-950/70 hover:bg-amber-900/70 text-amber-200 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            title="Attempt reconnection to secondary mirror URL"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reconnect</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={connectionPhase === 'reconnecting'}
            onClick={onSimulateDisconnect}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-amber-500/50 disabled:opacity-50 text-slate-300 hover:text-amber-200 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            title="Simulate a stream source drop to test automatic mirror failover"
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Failover</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            menuOpen
              ? 'bg-slate-800 text-white border-cyan-500/60'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
          }`}
        >
          <span>Stream Sources</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              menuOpen ? 'rotate-180 text-cyan-300' : ''
            }`}
          />
        </button>
      </div>

      {/* Expandable Dynamic Source Switcher & Mirror Failover Dropdown Panel */}
      {menuOpen && (
        <div
          role="menu"
          aria-label="Stream source and mirror failover options"
          className="absolute right-0 top-full mt-2 w-full sm:w-[490px] max-h-[80vh] overflow-y-auto z-30 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl p-3.5 space-y-3"
        >
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                Switch Live Ingest for {tunedOutlet.callSign}
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate">
                {tunedOutlet.name} · {tunedOutlet.country}
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleAutoFailover}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold border transition flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                autoFailover
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Automatically detect disconnects and switch to a secondary mirror URL"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Auto-Reconnect: {autoFailover ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {NEWS_STREAM_SOURCE_PROFILES.map((profile) => {
              const isSelected = activeSource === profile.id;
              const resolved = resolveOutletStreamSource(
                tunedOutlet,
                profile.id,
                liveTick,
                isSelected ? activeMirrorIndex : 0
              );
              return (
                <button
                  key={profile.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => {
                    onSelectSource(profile.id);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-red-950/35 border-red-500/60'
                      : 'bg-slate-900/75 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-slate-800 bg-slate-950"
                      style={{ color: profile.accentHex }}
                    >
                      {getSourceIcon(profile.id, 'w-4 h-4')}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{profile.label}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {profile.protocol}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-cyan-300 truncate mt-0.5">
                        {resolved.routeLabel}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {profile.description}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <div className="text-[11px] font-mono font-bold text-emerald-300 tabular-nums">
                      {resolved.effectiveBitrateMbps} Mbps
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 tabular-nums">
                      {resolved.latencyMs} ms RTT
                    </div>
                    {isSelected && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-red-400">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mirror Failover Endpoints & Auto-Reconnection Controls */}
          <div className="pt-2.5 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-bold text-slate-200">
                Mirror Endpoints ({activeResolved.profile.label})
              </div>
              <div className="flex items-center gap-1.5">
                {activeMirrorIndex > 0 && (
                  <button
                    type="button"
                    onClick={onRestorePrimary}
                    className="px-2 py-1 rounded bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-200 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Primary</span>
                  </button>
                )}
                <button
                  type="button"
                  disabled={connectionPhase === 'reconnecting'}
                  onClick={onSimulateDisconnect}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-50 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <WifiOff className="w-3 h-3" />
                  <span>Test Disconnect</span>
                </button>
              </div>
            </div>

            {disconnectReason && isFaulted && (
              <div className="px-2.5 py-1.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-[10.5px] font-mono text-rose-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{disconnectReason}</span>
              </div>
            )}

            <div className="space-y-1">
              {activeResolved.endpoints.map((ep, idx) => {
                const isActiveEndpoint = idx === activeResolved.activeEndpointIndex;
                return (
                  <button
                    key={ep.url}
                    type="button"
                    onClick={() => onSelectMirrorIndex(idx)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-[10.5px] font-mono transition flex items-center justify-between gap-2 cursor-pointer ${
                      isActiveEndpoint
                        ? connectionPhase === 'disconnected' || connectionPhase === 'failed'
                          ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                          : 'bg-slate-900 border-cyan-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">{ep.label}</span>
                        {isActiveEndpoint && (
                          <span className="text-[9.5px] text-cyan-300 font-bold">
                            · {connectionPhase === 'reconnecting' ? 'Probing…' : isFaulted ? 'Dropped' : 'In Use'}
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[10px] text-slate-400">{ep.url}</div>
                    </div>
                    {isActiveEndpoint && !isFaulted && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {reconnectLog.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-semibold">
                  Recent Reconnection Activity
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {reconnectLog.slice(0, 3).map((evt) => (
                    <div
                      key={evt.id}
                      className="text-[10px] font-mono text-slate-300 flex items-start gap-1.5 leading-snug"
                    >
                      <span className="text-slate-500 shrink-0 tabular-nums">{evt.timestamp}</span>
                      <span className="truncate">
                        {evt.outletCallSign}: {evt.reason}
                        {evt.toUrl ? ` → ${evt.toUrl}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Endpoint Bar */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-[10.5px] font-mono">
            <div className="min-w-0 flex-1">
              <span className="text-slate-500">
                Active URI ({activeResolved.activeEndpoint.label}):{' '}
              </span>
              <span className="text-slate-200 truncate block">{activeResolved.feedUrl}</span>
            </div>
            <button
              type="button"
              onClick={() =>
                onCopyActiveUrl(activeResolved.feedUrl, activeResolved.profile.shortLabel)
              }
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copiedFeed ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>{copiedFeed ? 'Copied' : `Copy ${activeResolved.profile.shortLabel}`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
