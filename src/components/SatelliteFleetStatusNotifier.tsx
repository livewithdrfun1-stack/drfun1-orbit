/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Satellite Fleet Status Notification System & TLE Change Alert Center
 * Monitors and displays real-time TLE (Two-Line Element) change alerts for key tracked constellations:
 * - SpaceX Starlink Gen2 & Direct-to-Cell V2
 * - Eutelsat OneWeb Polar Enterprise
 * - SES O3b mPOWER MEO Gigabit
 * - Iridium NEXT & Certus Safety
 * - AST SpaceMobile BlueBird Direct 5G
 * - EchoStar-14 DISH Network GEO
 * - International Space Station (ISS Zarya)
 * - GPS Block IIF / III Navstar
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Satellite,
  Radio,
  Bell,
  BellRing,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Filter,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  Volume2,
  VolumeX,
  Play,
  Pause,
  X,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import {
  SatelliteFleetAlert,
  FleetConstellationSummary,
  TleAlertSeverity
} from '../types/satelliteFleetAlerts';
import {
  INITIAL_FLEET_ALERTS,
  INITIAL_FLEET_CONSTELLATIONS,
  generateSimulatedTleAlert
} from '../data/satelliteFleetAlertsData';

interface SatelliteFleetStatusNotifierProps {
  onOpenConstellationOverlay?: (satelliteId?: string) => void;
  onOpenLicense?: () => void;
  variant?: 'full' | 'ticker' | 'compact';
}

export const SatelliteFleetStatusNotifier: React.FC<SatelliteFleetStatusNotifierProps> = ({
  onOpenConstellationOverlay,
  onOpenLicense,
  variant = 'full'
}) => {
  // Alert Stream State
  const [alerts, setAlerts] = useState<SatelliteFleetAlert[]>(INITIAL_FLEET_ALERTS);
  const [constellations, setConstellations] = useState<FleetConstellationSummary[]>(INITIAL_FLEET_CONSTELLATIONS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'maneuver' | 'warning' | 'unread' | 'starlink' | 'oneweb' | 'o3b'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(INITIAL_FLEET_ALERTS[0].id);
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<SatelliteFleetAlert | null>(null);

  // Audio Chime State
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);
  const [simCounter, setSimCounter] = useState<number>(0);
  const [recentToast, setRecentToast] = useState<string | null>(null);

  // Audio Context Ref for telemetry alert sound
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChime = (severity: TleAlertSeverity) => {
    if (!isAudioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      if (severity === 'maneuver' || severity === 'critical') {
        // Futuristic double pulse chirp for maneuvers
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      } else {
        // Soft ping for epoch refresh
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      }
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (_) {}
  };

  // Trigger on-demand simulated TLE alert
  const handleTriggerSimulatedAlert = () => {
    const nextCount = simCounter + 1;
    setSimCounter(nextCount);
    const newAlert = generateSimulatedTleAlert(nextCount);
    setAlerts((prev) => [newAlert, ...prev]);
    playChime(newAlert.severity);
    setRecentToast(`New TLE Alert: ${newAlert.satelliteName}`);
    setTimeout(() => setRecentToast(null), 4000);
  };

  // Background auto-simulation interval (when enabled)
  useEffect(() => {
    if (!autoSimulate) return;
    const interval = setInterval(() => {
      handleTriggerSimulatedAlert();
    }, 28000); // Trigger every 28s
    return () => clearInterval(interval);
  }, [autoSimulate, simCounter]);

  // Unread Alert Count
  const unreadCount = useMemo(() => {
    return alerts.filter((a) => !a.isRead).length;
  }, [alerts]);

  // Maneuvers in last 24h count
  const maneuversCount = useMemo(() => {
    return alerts.filter((a) => a.severity === 'maneuver' || a.deltaMetrics.stationKeepingManeuver).length;
  }, [alerts]);

  // Filtered Alert List
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Category filter
      if (activeFilter === 'unread' && alert.isRead) return false;
      if (activeFilter === 'maneuver' && alert.severity !== 'maneuver' && !alert.deltaMetrics.stationKeepingManeuver) return false;
      if (activeFilter === 'warning' && alert.severity !== 'warning' && alert.severity !== 'critical') return false;
      if (activeFilter === 'starlink' && alert.constellation !== 'Starlink') return false;
      if (activeFilter === 'oneweb' && alert.constellation !== 'OneWeb') return false;
      if (activeFilter === 'o3b' && alert.constellation !== 'O3b mPOWER') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = alert.satelliteName.toLowerCase().includes(q);
        const matchesNorad = alert.noradId.toString().includes(q);
        const matchesTitle = alert.title.toLowerCase().includes(q);
        const matchesMsg = alert.message.toLowerCase().includes(q);
        const matchesConstellation = alert.constellation.toLowerCase().includes(q);
        if (!matchesName && !matchesNorad && !matchesTitle && !matchesMsg && !matchesConstellation) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, activeFilter, searchQuery]);

  // Mark all as read
  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true, acknowledged: true })));
  };

  // Toggle acknowledge alert
  const handleToggleAcknowledge = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, acknowledged: !a.acknowledged, isRead: true } : a
      )
    );
  };

  // Copy raw TLE strings
  const handleCopyTle = (alert: SatelliteFleetAlert, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = `${alert.satelliteName}\n${alert.newTleLine1}\n${alert.newTleLine2}`;
    navigator.clipboard.writeText(text);
    setCopiedId(alert.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityBadge = (severity: TleAlertSeverity) => {
    switch (severity) {
      case 'maneuver':
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          dot: 'bg-purple-400',
          label: 'STATION-KEEPING BURN'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400',
          label: 'SOLAR DRAG / PERTURBATION'
        };
      case 'critical':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-400',
          label: 'CONJUNCTION AVOIDANCE'
        };
      default:
        return {
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          dot: 'bg-cyan-400',
          label: 'EPOCH REFRESH'
        };
    }
  };

  // ========================================================
  // COMPACT TICKER / BANNER VARIANT (Used at top of views)
  // ========================================================
  if (variant === 'ticker') {
    const latestAlert = alerts[0];
    const badge = latestAlert ? getSeverityBadge(latestAlert.severity) : null;

    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs shadow-md">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Satellite className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>

          <div className="truncate">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-xs">Satellite Fleet Status:</span>
              {badge && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${badge.bg}`}>
                  {badge.label}
                </span>
              )}
              <span className="text-[10px] text-slate-500">{latestAlert?.timestamp}</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {latestAlert?.satelliteName}: {latestAlert?.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleTriggerSimulatedAlert}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
            title="Simulate incoming TLE epoch change"
          >
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            <span>Simulate Burn</span>
          </button>

          {onOpenConstellationOverlay && (
            <button
              onClick={() => onOpenConstellationOverlay(latestAlert?.satelliteId)}
              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <span>Footprint Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ========================================================
  // FULL NOTIFICATION CENTER & FLEET STATUS VIEW
  // ========================================================
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-6 font-mono text-xs">
      {/* Toast Notification Banner */}
      {recentToast && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-purple-950 border border-cyan-400/50 flex items-center justify-between text-xs text-cyan-200 animate-in slide-in-from-top-2 shadow-lg">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span className="font-bold text-white">TLE Change Alert:</span>
            <span>{recentToast}</span>
          </div>
          <span className="text-[10px] text-cyan-400 uppercase font-bold">Space-Track Radar Sync</span>
        </div>
      )}

      {/* ========================================================
          1. HEADER & FLEET STATUS CONTROLS
          ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-950/40 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Satellite className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Satellite Fleet Status &amp; Real-Time TLE Alert Center
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>NORAD TLE MONITORING</span>
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {unreadCount} NEW ALERTS
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous radar orbital ephemeris ingestion monitoring thruster burns, solar atmospheric drag, and station-keeping across key constellations.
            </p>
          </div>
        </div>

        {/* Action Buttons & Simulation Triggers */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isAudioEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-white'
            }`}
            title={isAudioEnabled ? 'Audio Chime Enabled' : 'Audio Chime Muted'}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Trigger Simulated TLE Burn */}
          <button
            onClick={handleTriggerSimulatedAlert}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950/40"
            title="Inject simulated satellite thruster burn and generate updated TLE"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Simulate TLE Orbit Burn</span>
          </button>

          {/* Auto Simulation Toggle */}
          <button
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 cursor-pointer ${
              autoSimulate
                ? 'bg-purple-600/30 text-purple-200 border-purple-500/60 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
            title="Automatically simulate periodic orbital ephemeris changes"
          >
            {autoSimulate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>Auto-Stream: {autoSimulate ? 'ON' : 'OFF'}</span>
          </button>

          {/* Mark All Read */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          2. CONSTELLATION FLEET HEALTH SUMMARY CARDS
          ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Monitored Global Constellations (7,500+ Operational Spacecraft)</span>
          </span>
          <span className="text-slate-500 text-[11px]">
            Real-time orbital telemetry synchronized via Space-Track &amp; Switch SUPERNAP Teleport
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {constellations.map((constellation) => {
            const isManeuver = constellation.status === 'maneuver_in_progress';
            return (
              <div
                key={constellation.constellationName}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: constellation.badgeColor }}
                    />
                    <span className="font-bold text-white truncate max-w-[150px]">
                      {constellation.constellationName.split(' ')[0]}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {constellation.orbitType}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 truncate">
                  {constellation.operator}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[10px]">
                  <div>
                    <span className="text-slate-500 block">Fleet Count</span>
                    <span className="font-bold text-emerald-400 tabular-nums">
                      {constellation.activeSatellites.toLocaleString()} active
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">24h TLE Updates</span>
                    <span className="font-bold text-cyan-300 tabular-nums">
                      {constellation.tleChanges24h} maneuvers
                    </span>
                  </div>
                </div>

                <div className="text-[9px] font-mono flex items-center justify-between pt-0.5">
                  <span className={isManeuver ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                    {isManeuver ? '⚠️ Station-Keeping' : '🟢 Nominal Flight'}
                  </span>
                  <span className="text-slate-500 truncate max-w-[110px]">
                    {constellation.lastEpochUpdate.split(' (')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          3. REAL-TIME TLE CHANGE ALERTS STREAM
          ======================================================== */}
      <div className="space-y-3 pt-2">
        {/* Alerts Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-nav-scrollbar py-0.5">
            <span className="text-slate-500 text-[11px] font-bold mr-1 shrink-0">Filter Alerts:</span>
            
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Alerts ({alerts.length})
            </button>

            <button
              onClick={() => setActiveFilter('maneuver')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'maneuver'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-950 text-purple-300 hover:text-white border border-purple-500/30'
              }`}
            >
              <Flame className="w-3 h-3 text-purple-400" />
              <span>Thruster Burns ({maneuversCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter('warning')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'warning'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-950 text-amber-300 hover:text-white border border-amber-500/30'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Warnings / Solar Drag</span>
            </button>

            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                activeFilter === 'unread'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-950 text-cyan-300 hover:text-white border border-cyan-500/30'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by satellite, NORAD, burn..."
              className="w-full pl-9 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-white font-bold">No TLE Alerts Match Current Filter</div>
              <p className="text-slate-500 text-xs">All monitored constellation spacecraft are maintaining nominal orbital tracks.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const badge = getSeverityBadge(alert.severity);
              const isExpanded = expandedAlertId === alert.id;
              const hasOldTle = Boolean(alert.oldTleLine1 && alert.oldTleLine2);

              return (
                <div
                  key={alert.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    alert.isRead
                      ? 'bg-slate-950/70 border-slate-800'
                      : 'bg-slate-950 border-cyan-500/50 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                  }`}
                >
                  {/* Alert Header Row */}
                  <div
                    onClick={() => {
                      setExpandedAlertId(isExpanded ? null : alert.id);
                      if (!alert.isRead) {
                        setAlerts((prev) =>
                          prev.map((a) => (a.id === alert.id ? { ...a, isRead: true } : a))
                        );
                      }
                    }}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/60 transition"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="pt-0.5">
                        <span className={`w-2.5 h-2.5 rounded-full block ${badge.dot} ${alert.isRead ? '' : 'animate-ping'}`} />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-xs truncate">
                            {alert.satelliteName}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            NORAD {alert.noradId} &bull; {alert.operator}
                          </span>
                          <span className={`px-2 py-0.2 rounded text-[9px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="font-semibold text-slate-200 text-xs">
                          {alert.title}
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right text-[10px]">
                        <span className="text-slate-400 block font-bold">{alert.timestamp}</span>
                        <span className="text-emerald-400 font-bold tabular-nums">
                          {alert.deltaMetrics.deltaAltitudeKm >= 0 ? `+${alert.deltaMetrics.deltaAltitudeKm} km` : `${alert.deltaMetrics.deltaAltitudeKm} km`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleCopyTle(alert, e)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
                          title="Copy new TLE lines"
                        >
                          {copiedId === alert.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={(e) => handleToggleAcknowledge(alert.id, e)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            alert.acknowledged
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                          }`}
                          title={alert.acknowledged ? 'Acknowledged' : 'Click to Acknowledge'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Alert Details & TLE Diff */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-950/90 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-150">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {alert.message}
                      </p>

                      {/* Delta Telemetry Matrix */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-[10px]">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block">Orbit Epoch Shift</span>
                          <span className="font-bold text-white tabular-nums">{alert.deltaMetrics.newEpoch}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block">Altitude Change (Δh)</span>
                          <span className="font-bold text-cyan-300 tabular-nums">
                            {alert.deltaMetrics.deltaAltitudeKm >= 0 ? `+${alert.deltaMetrics.deltaAltitudeKm}` : alert.deltaMetrics.deltaAltitudeKm} km
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block">Inclination Trim (Δi)</span>
                          <span className="font-bold text-purple-300 tabular-nums">
                            {alert.deltaMetrics.deltaInclinationDeg >= 0 ? `+${alert.deltaMetrics.deltaInclinationDeg}` : alert.deltaMetrics.deltaInclinationDeg}°
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block">Mean Motion (Δn)</span>
                          <span className="font-bold text-emerald-400 tabular-nums">
                            {alert.deltaMetrics.deltaMeanMotion.toFixed(7)} rev/d
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block">BSTAR Drag Delta</span>
                          <span className="font-bold text-amber-300 tabular-nums">{alert.deltaMetrics.deltaBstarDrag}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block">Conjunction Status</span>
                          <span className="font-bold text-white">{alert.deltaMetrics.conjunctionRisk}</span>
                        </div>
                      </div>

                      {/* TLE Line Diff Code Block */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-bold flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Two-Line Element (TLE) Diff Comparison:</span>
                          </span>
                          <span className="text-[10px] text-slate-500">18th SDS Radar Verified Ephemeris</span>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs overflow-x-auto space-y-1">
                          {hasOldTle && (
                            <div className="opacity-60 space-y-0.5 pb-1 border-b border-slate-800">
                              <div className="text-[10px] text-rose-400 font-bold">&ndash; PRIOR EPOCH TLE:</div>
                              <div className="text-slate-400 truncate">{alert.oldTleLine1}</div>
                              <div className="text-slate-400 truncate">{alert.oldTleLine2}</div>
                            </div>
                          )}

                          <div className="pt-1 space-y-0.5">
                            <div className="text-[10px] text-emerald-400 font-bold">+ UPDATED EPHEMERIS TLE (ACTIVE):</div>
                            <div className="text-cyan-300 font-bold truncate">{alert.newTleLine1}</div>
                            <div className="text-purple-300 font-bold truncate">{alert.newTleLine2}</div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Inspector Link */}
                      {onOpenConstellationOverlay && (
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            Satellite ID: <code>{alert.satelliteId}</code> &bull; Verified via DrFun1 Master Control
                          </span>
                          
                          <button
                            onClick={() => onOpenConstellationOverlay(alert.satelliteId)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span>Plot in Constellation Footprint Map</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
