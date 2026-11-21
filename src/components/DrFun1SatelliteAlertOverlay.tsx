/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Satellite Alert Notification Overlay & Inspector for DrFun1 News.
 * - Dynamically triggers high-contrast video overlay badges when critical orbital events
 *   (satellite malfunctions, debris conjunctions, constellation launches, solar RF storms)
 *   are detected from the live RSS feed.
 * - Provides an expandable Satellite Alert Briefing drawer, RSS manual scan trigger,
 *   event-type filters, direct NASA SCaN / Satcom desk tuning, and alert acknowledgment.
 */

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ExternalLink,
  Radio,
  RefreshCw,
  Rocket,
  Satellite,
  Sun,
  X,
} from 'lucide-react';
import {
  SatelliteAlertEventType,
  SatelliteOrbitalAlert,
} from '../types/drfun1News';

interface EventVisualStyle {
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  labelPillBg: string;
  labelPillText: string;
  icon: React.ReactNode;
}

const getAlertVisualStyle = (
  eventType: SatelliteAlertEventType,
  iconClass = 'w-3.5 h-3.5 shrink-0'
): EventVisualStyle => {
  switch (eventType) {
    case 'malfunction':
      return {
        badgeBg: 'bg-rose-950/92',
        badgeBorder: 'border-rose-500/75',
        badgeText: 'text-rose-100',
        labelPillBg: 'bg-rose-600',
        labelPillText: 'text-white',
        icon: <AlertTriangle className={`${iconClass} text-rose-300`} />,
      };
    case 'launch':
      return {
        badgeBg: 'bg-sky-950/92',
        badgeBorder: 'border-cyan-400/70',
        badgeText: 'text-sky-100',
        labelPillBg: 'bg-cyan-500',
        labelPillText: 'text-slate-950',
        icon: <Rocket className={`${iconClass} text-cyan-300`} />,
      };
    case 'solar_weather':
      return {
        badgeBg: 'bg-amber-950/92',
        badgeBorder: 'border-amber-400/75',
        badgeText: 'text-amber-100',
        labelPillBg: 'bg-amber-500',
        labelPillText: 'text-slate-950',
        icon: <Sun className={`${iconClass} text-amber-300`} />,
      };
    case 'telemetry_milestone':
      return {
        badgeBg: 'bg-teal-950/92',
        badgeBorder: 'border-teal-400/70',
        badgeText: 'text-teal-100',
        labelPillBg: 'bg-teal-500',
        labelPillText: 'text-slate-950',
        icon: <Radio className={`${iconClass} text-teal-300`} />,
      };
  }
};

interface DrFun1SatelliteAlertOverlayBadgesProps {
  alerts: SatelliteOrbitalAlert[];
  alertsEnabled: boolean;
  onInspectAlert: (alert: SatelliteOrbitalAlert) => void;
  onDismissOverlay: (alertId: string) => void;
  onOpenAlertCenter: () => void;
}

/**
 * Dynamic Video Player Overlay Badges for active unacknowledged orbital events.
 * Positioned safely below the top callsign bar inside the Theater or Quad stage.
 */
export const DrFun1SatelliteAlertOverlayBadges: React.FC<
  DrFun1SatelliteAlertOverlayBadgesProps
> = ({
  alerts,
  alertsEnabled,
  onInspectAlert,
  onDismissOverlay,
  onOpenAlertCenter,
}) => {
  if (!alertsEnabled) return null;

  const visibleOverlayAlerts = alerts
    .filter((a) => !a.dismissedOverlay)
    .slice(0, 2);

  if (visibleOverlayAlerts.length === 0) return null;

  const extraActiveCount = Math.max(
    0,
    alerts.filter((a) => !a.dismissedOverlay).length - visibleOverlayAlerts.length
  );

  return (
    <div
      aria-live="polite"
      aria-label="Live Satellite Alert overlay notifications"
      className="z-20 flex flex-col gap-1.5 max-w-md pointer-events-auto"
    >
      {visibleOverlayAlerts.map((alert) => {
        const style = getAlertVisualStyle(alert.eventType);
        return (
          <div
            key={alert.id}
            role="status"
            className={`flex items-start gap-2 px-2.5 py-2 rounded-xl border backdrop-blur-md shadow-xl transition-all ${style.badgeBg} ${style.badgeBorder}`}
          >
            <button
              type="button"
              onClick={() => onInspectAlert(alert)}
              className="flex items-start gap-2 text-left min-w-0 flex-1 cursor-pointer group"
              title="Click to inspect full orbital RSS alert details"
            >
              <div className="mt-0.5">{style.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono tabular-nums">
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold tracking-wide ${style.labelPillBg} ${style.labelPillText}`}
                  >
                    {alert.badgeLabel}
                  </span>
                  <span className="text-slate-200 font-semibold">{alert.orbitRegime}</span>
                  <span className="text-slate-400" aria-hidden="true">·</span>
                  <span className="text-slate-300 truncate">{alert.sourceName}</span>
                  <span className="text-slate-400" aria-hidden="true">·</span>
                  <span className="text-slate-300">{alert.detectedAt}</span>
                </div>
                <div
                  className={`text-xs font-semibold mt-0.5 line-clamp-1 group-hover:underline ${style.badgeText}`}
                >
                  {alert.title}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onDismissOverlay(alert.id)}
              className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10 shrink-0 cursor-pointer"
              aria-label={`Dismiss ${alert.badgeLabel} overlay badge`}
              title="Dismiss overlay badge (remains in Satellite Alert log)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}

      {extraActiveCount > 0 && (
        <button
          type="button"
          onClick={onOpenAlertCenter}
          className="self-start px-2.5 py-1 rounded-lg bg-slate-950/90 hover:bg-slate-900 border border-slate-700 text-[10.5px] font-mono text-cyan-300 cursor-pointer tabular-nums"
        >
          +{extraActiveCount} more active satellite {extraActiveCount === 1 ? 'alert' : 'alerts'} — Open Alert Center
        </button>
      )}
    </div>
  );
};

interface DrFun1SatelliteAlertCenterProps {
  isOpen: boolean;
  alerts: SatelliteOrbitalAlert[];
  selectedAlertId: string | null;
  alertsEnabled: boolean;
  isScanning: boolean;
  lastScanLabel: string;
  onClose: () => void;
  onSelectAlert: (alertId: string) => void;
  onToggleAlertsEnabled: () => void;
  onScanNow: () => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onAcknowledgeAll: () => void;
  onPinToOverlay: (alertId: string) => void;
  onTuneSatcomDesk?: () => void;
  onNavigateToRss?: () => void;
}

/**
 * Expandable Satellite Alert Center Panel for reviewing all RSS-detected orbital events,
 * filtering by malfunction/launch/solar type, triggering an immediate RSS scan,
 * and tuning directly to the Satcom / NASA SCaN desk.
 */
export const DrFun1SatelliteAlertCenter: React.FC<DrFun1SatelliteAlertCenterProps> = ({
  isOpen,
  alerts,
  selectedAlertId,
  alertsEnabled,
  isScanning,
  lastScanLabel,
  onClose,
  onSelectAlert,
  onToggleAlertsEnabled,
  onScanNow,
  onAcknowledgeAlert,
  onAcknowledgeAll,
  onPinToOverlay,
  onTuneSatcomDesk,
  onNavigateToRss,
}) => {
  const [filterType, setFilterType] = useState<'all' | SatelliteAlertEventType>('all');

  const filteredAlerts = useMemo(() => {
    if (filterType === 'all') return alerts;
    return alerts.filter((a) => a.eventType === filterType);
  }, [alerts, filterType]);

  const activeAlert = useMemo(() => {
    if (selectedAlertId) {
      const found = alerts.find((a) => a.id === selectedAlertId);
      if (found) return found;
    }
    return filteredAlerts[0] ?? alerts[0] ?? null;
  }, [alerts, filteredAlerts, selectedAlertId]);

  if (!isOpen) return null;

  const malfunctionCount = alerts.filter((a) => a.eventType === 'malfunction').length;
  const launchCount = alerts.filter((a) => a.eventType === 'launch').length;
  const unreadCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <section
      aria-label="Satellite Alert Notification Center"
      className="bg-slate-900/95 border border-rose-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl"
    >
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Satellite className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Satellite Alert Notification System (Live RSS Orbital Monitor)</span>
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono text-slate-400 tabular-nums">
            <span className="text-rose-300 font-semibold">{malfunctionCount} Malfunctions</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-300 font-semibold">{launchCount} Launches</span>
            <span aria-hidden="true">·</span>
            <span>{unreadCount} Unread</span>
            <span aria-hidden="true">·</span>
            <span>Last RSS scan: {lastScanLabel}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isScanning}
            onClick={onScanNow}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning RSS…' : 'Scan Live RSS Now'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleAlertsEnabled}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              alertsEnabled
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-700'
            }`}
          >
            {alertsEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            <span>Overlay Badges: {alertsEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onAcknowledgeAll}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Acknowledge All</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Close Satellite Alert Center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(
          [
            { id: 'all', label: `All Events (${alerts.length})` },
            { id: 'malfunction', label: `Malfunctions (${malfunctionCount})` },
            { id: 'launch', label: `Launches (${launchCount})` },
            {
              id: 'solar_weather',
              label: `Solar / RF (${alerts.filter((a) => a.eventType === 'solar_weather').length})`,
            },
            {
              id: 'telemetry_milestone',
              label: `Orbital Links (${alerts.filter((a) => a.eventType === 'telemetry_milestone').length})`,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition cursor-pointer ${
              filterType === tab.id
                ? 'bg-slate-100 text-slate-950 border-white'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Split View: Alert Queue + Selected Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-6 space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
              No orbital events in this category yet. Click &quot;Scan Live RSS Now&quot; to poll the satcom wire.
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const style = getAlertVisualStyle(alert.eventType);
              const isSelected = activeAlert?.id === alert.id;
              return (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => onSelectAlert(alert.id)}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-950 border-cyan-400/70'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10.5px] font-mono tabular-nums">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {style.icon}
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${style.labelPillBg} ${style.labelPillText}`}
                      >
                        {alert.badgeLabel}
                      </span>
                      <span className="text-slate-300">{alert.orbitRegime}</span>
                      {!alert.acknowledged && (
                        <span className="text-rose-400 font-bold">· NEW</span>
                      )}
                    </div>
                    <span className="text-slate-400 shrink-0">{alert.detectedAt}</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1 line-clamp-2">
                    {alert.title}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                    {alert.sourceName} · Triggers: {alert.matchedKeywords.join(', ')}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Selected Orbital Event Briefing */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          {activeAlert ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-mono">
                  {getAlertVisualStyle(activeAlert.eventType, 'w-4 h-4 shrink-0').icon}
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      getAlertVisualStyle(activeAlert.eventType).labelPillBg
                    } ${getAlertVisualStyle(activeAlert.eventType).labelPillText}`}
                  >
                    {activeAlert.badgeLabel} · {activeAlert.severity}
                  </span>
                  <span className="text-slate-300">{activeAlert.orbitRegime}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  Detected {activeAlert.detectedAt}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white leading-snug">
                {activeAlert.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeAlert.summary}
              </p>

              <div className="text-[11px] font-mono text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 border-t border-slate-800">
                <span>RSS Source: <strong className="text-slate-200">{activeAlert.sourceName}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Matched: {activeAlert.matchedKeywords.join(', ')}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {!activeAlert.acknowledged && (
                  <button
                    type="button"
                    onClick={() => onAcknowledgeAlert(activeAlert.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Acknowledge</span>
                  </button>
                )}

                {activeAlert.dismissedOverlay && (
                  <button
                    type="button"
                    onClick={() => onPinToOverlay(activeAlert.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold cursor-pointer"
                  >
                    Show Overlay Badge
                  </button>
                )}

                {onTuneSatcomDesk && (
                  <button
                    type="button"
                    onClick={onTuneSatcomDesk}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Satellite className="w-3.5 h-3.5" />
                    <span>Tune Satcom Desk</span>
                  </button>
                )}

                <a
                  href={activeAlert.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5"
                >
                  <span>Source Bulletin</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {onNavigateToRss && (
                  <button
                    type="button"
                    onClick={onNavigateToRss}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-teal-500/40 text-teal-300 text-xs font-mono cursor-pointer"
                  >
                    Full Satcom RSS Wire
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-400 py-8 text-center">
              Select an orbital event to inspect full RSS telemetry details.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
