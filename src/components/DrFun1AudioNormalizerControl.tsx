/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Global Volume Normalization Engine UI Control & Broadcast Loudness DSP Panel.
 * Displays real-time raw vs. normalized dB meters, auto-gain trim, broadcast presets
 * (News Desk -18 dB, EBU R128 -23 dB, ATSC A/85 -24 dB, Night Limit -21 dB),
 * true-peak limiter, per-source loudness comparison, and optional Web Audio test monitor.
 */

import React, { useMemo, useState } from 'react';
import {
  AudioWaveform,
  Check,
  Shield,
  Sliders,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  AudioNormalizationConfig,
  AudioNormalizationPreset,
  AudioNormalizationTelemetry,
  GlobalNewsOutlet,
  NewsStreamSourceType,
} from '../types/drfun1News';
import {
  AUDIO_NORMALIZATION_PRESETS,
  computeNormalizationGainDb,
  getNativeSourceLoudnessDb,
} from '../utils/audioNormalizationEngine';

interface DrFun1AudioNormalizerControlProps {
  tunedOutlet: GlobalNewsOutlet;
  activeSourceType: NewsStreamSourceType;
  activeSourceLabel: string;
  config: AudioNormalizationConfig;
  telemetry: AudioNormalizationTelemetry;
  isMuted: boolean;
  isAudioMonitorActive: boolean;
  compactTrigger?: boolean;
  popoverAlignment?: 'bottom-overlay' | 'dropdown';
  onUpdateConfig: (patch: Partial<AudioNormalizationConfig>) => void;
  onSelectPreset: (preset: AudioNormalizationPreset) => void;
  onToggleMuted: () => void;
  onToggleAudioMonitor: () => void;
  onSelectSource?: (source: NewsStreamSourceType) => void;
}

const SOURCE_LIST: { id: NewsStreamSourceType; label: string; shortLabel: string }[] = [
  { id: 'satellite', label: 'Satellite', shortLabel: 'SAT' },
  { id: 'web', label: 'Web HLS', shortLabel: 'WEB' },
  { id: 'local', label: 'Local OTA', shortLabel: 'LOCAL' },
  { id: 'fiber', label: 'Fiber 100G', shortLabel: '100G' },
  { id: 'strimm', label: 'Strimm.com', shortLabel: 'STRIMM' },
];

const dbToMeterPct = (db: number): number => {
  // Map -40 dB .. 0 dB -> 0% .. 100%
  const clamped = Math.max(-40, Math.min(0, db));
  return Math.round(((clamped + 40) / 40) * 100);
};

const formatSignedDb = (db: number): string => {
  if (Math.abs(db) < 0.05) return '0.0 dB';
  return `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;
};

export const DrFun1AudioNormalizerControl: React.FC<DrFun1AudioNormalizerControlProps> = ({
  tunedOutlet,
  activeSourceType,
  activeSourceLabel,
  config,
  telemetry,
  isMuted,
  isAudioMonitorActive,
  compactTrigger = false,
  popoverAlignment = 'bottom-overlay',
  onUpdateConfig,
  onSelectPreset,
  onToggleMuted,
  onToggleAudioMonitor,
  onSelectSource,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const sourceMatrix = useMemo(() => {
    return SOURCE_LIST.map((src) => {
      const nativeDb = getNativeSourceLoudnessDb(tunedOutlet, src.id);
      const calc = computeNormalizationGainDb(nativeDb, config);
      return {
        ...src,
        nativeDb,
        appliedGainDb: calc.appliedGainDb,
        outputDb: calc.outputDb,
        isActive: src.id === activeSourceType,
      };
    });
  }, [tunedOutlet, activeSourceType, config]);

  const rawMeterPct = dbToMeterPct(telemetry.rawInputDb);
  const outMeterPct = dbToMeterPct(telemetry.normalizedOutputDb);
  const targetMarkerPct = dbToMeterPct(config.targetDb);

  const popoverPositionClass =
    popoverAlignment === 'dropdown'
      ? 'fixed sm:absolute right-3 left-3 sm:left-auto sm:right-0 top-14 sm:top-10 z-40 w-auto sm:w-[430px]'
      : 'absolute left-3 right-3 sm:left-4 sm:right-auto bottom-16 z-30 w-auto sm:w-[440px] max-h-[calc(100%-5rem)] overflow-y-auto';

  return (
    <div className={popoverAlignment === 'dropdown' ? 'relative inline-flex items-center' : 'inline-flex items-center'}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
          config.enabled
            ? telemetry.isRamping
              ? 'bg-amber-500/20 text-amber-200 border-amber-400/70'
              : 'bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/50'
            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700'
        }`}
        title={
          config.enabled
            ? `Volume Normalization Active: Target ${config.targetDb} dB (Trim ${formatSignedDb(telemetry.appliedGainDb)})`
            : 'Volume Normalization Bypassed — click to configure baseline dB target'
        }
      >
        <AudioWaveform
          className={`w-3.5 h-3.5 shrink-0 ${
            config.enabled
              ? telemetry.isRamping
                ? 'text-amber-300 animate-pulse'
                : 'text-emerald-400'
              : 'text-slate-500'
          }`}
        />
        <span className="tabular-nums">
          {config.enabled
            ? compactTrigger
              ? `Norm ${config.targetDb}dB`
              : `Norm ${config.targetDb}dB · ${formatSignedDb(telemetry.appliedGainDb)}`
            : 'Norm OFF'}
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Global Volume Normalization Engine"
          onClick={(e) => e.stopPropagation()}
          className={`${popoverPositionClass} rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700 shadow-2xl p-3.5 space-y-3 font-mono text-[11px]`}
        >
          {/* Header & Enable/Bypass Switch */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-white truncate">
                  Global Volume Normalization Engine
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {tunedOutlet.callSign} · {activeSourceLabel} · Baseline Lock
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                role="switch"
                aria-checked={config.enabled}
                onClick={() => onUpdateConfig({ enabled: !config.enabled })}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold border cursor-pointer transition-colors ${
                  config.enabled
                    ? 'bg-emerald-600 text-slate-950 border-emerald-400'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {config.enabled ? 'AUTO-NORM ON' : 'BYPASSED'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                aria-label="Close volume normalizer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Real-Time Dual Loudness Meter (Raw Feed vs Normalized Output) */}
          <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 space-y-2.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Raw Source Input ({activeSourceLabel})</span>
                <span
                  className={`font-bold tabular-nums ${
                    telemetry.rawInputDb > -15.5
                      ? 'text-rose-400'
                      : telemetry.rawInputDb < -21.5
                        ? 'text-amber-300'
                        : 'text-slate-200'
                  }`}
                >
                  {telemetry.rawInputDb.toFixed(1)} dB
                </span>
              </div>
              <div className="relative h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    telemetry.rawInputDb > -15.5
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-slate-500 to-amber-400'
                  }`}
                  style={{ width: `${rawMeterPct}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/80"
                  style={{ left: `${targetMarkerPct}%` }}
                  title={`Target Baseline: ${config.targetDb} dB`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-emerald-300 font-bold">
                  Normalized Output {telemetry.isRamping ? '(Ramping 350ms…)' : '(Locked)'}
                </span>
                <span className="font-bold text-emerald-300 tabular-nums">
                  {telemetry.normalizedOutputDb.toFixed(1)} dB
                </span>
              </div>
              <div className="relative h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    config.enabled
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-400'
                      : 'bg-slate-600'
                  }`}
                  style={{ width: `${outMeterPct}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white"
                  style={{ left: `${targetMarkerPct}%` }}
                  title={`Target Baseline: ${config.targetDb} dB`}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[10px] tabular-nums">
              <div>
                <div className="text-slate-500">Auto-Gain Trim</div>
                <div
                  className={`font-bold ${
                    telemetry.appliedGainDb > 0.2
                      ? 'text-cyan-300'
                      : telemetry.appliedGainDb < -0.2
                        ? 'text-amber-300'
                        : 'text-emerald-300'
                  }`}
                >
                  {formatSignedDb(telemetry.appliedGainDb)}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Peak Limiter</div>
                <div className="font-bold text-slate-200">
                  {config.truePeakLimiter
                    ? telemetry.peakReductionDb > 0
                      ? `-${telemetry.peakReductionDb.toFixed(1)} dB`
                      : `${config.ceilingDb.toFixed(1)} dBTP`
                    : 'OFF'}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Jump Prevented</div>
                <div className="font-bold text-emerald-300">
                  {telemetry.lastJumpPreventedDb > 0.2
                    ? `${telemetry.lastJumpPreventedDb.toFixed(1)} dB`
                    : 'Ready'}
                </div>
              </div>
            </div>

            {telemetry.lastSwitchSummary && (
              <div className="text-[10px] text-cyan-200/90 bg-cyan-950/40 border border-cyan-500/25 rounded px-2 py-1 truncate">
                {telemetry.lastSwitchSummary}
              </div>
            )}
          </div>

          {/* Broadcast Loudness Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Broadcast Loudness Standard</span>
              <span className="text-emerald-300 font-bold tabular-nums">
                Target: {config.targetDb.toFixed(1)} dB
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {AUDIO_NORMALIZATION_PRESETS.map((preset) => {
                const active = config.preset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectPreset(preset.id)}
                    className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-center cursor-pointer transition-colors ${
                      active
                        ? 'bg-emerald-600/20 text-emerald-200 border-emerald-400/60'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                    title={preset.description}
                  >
                    {preset.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Baseline Target Decibel Slider + Master Output Volume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            <label className="space-y-1 block">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Baseline Target</span>
                <span className="text-white font-bold tabular-nums">{config.targetDb.toFixed(1)} dB</span>
              </div>
              <input
                type="range"
                min={-24}
                max={-12}
                step={0.5}
                value={config.targetDb}
                onChange={(e) => onUpdateConfig({ targetDb: parseFloat(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </label>

            <label className="space-y-1 block">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Master Output</span>
                <span className="text-white font-bold tabular-nums">
                  {isMuted ? 'MUTED' : `${Math.round(config.masterVolume * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={isMuted ? 0 : Math.round(config.masterVolume * 100)}
                onChange={(e) => {
                  const pct = parseInt(e.target.value, 10);
                  if (pct > 0 && isMuted) onToggleMuted();
                  onUpdateConfig({ masterVolume: pct / 100 });
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </label>
          </div>

          {/* True-Peak Limiter & Audible Web Audio Calibration Check */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onUpdateConfig({ truePeakLimiter: !config.truePeakLimiter })}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                config.truePeakLimiter
                  ? 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>True-Peak Limiter {config.truePeakLimiter ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleAudioMonitor}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                isAudioMonitorActive
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/60'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Play a soft Web Audio broadcast reference bed so you can hear loudness leveling across Satellite and Web switches"
            >
              {isAudioMonitorActive ? (
                <>
                  <VolumeX className="w-3 h-3 text-amber-300" />
                  <span>Stop Test Tone</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 text-emerald-400" />
                  <span>Test Audio Leveling</span>
                </>
              )}
            </button>
          </div>

          {/* Per-Source Loudness Calibration Matrix for Current Outlet */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800">
            <div className="text-[10px] text-slate-400">
              Source Loudness Map ({tunedOutlet.callSign}) — click a source to test auto-level switch:
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {sourceMatrix.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSource?.(item.id)}
                  className={`p-1.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    item.isActive
                      ? 'bg-emerald-950/70 border-emerald-500/60'
                      : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9.5px] font-bold">
                    <span className={item.isActive ? 'text-emerald-300' : 'text-slate-300'}>
                      {item.shortLabel}
                    </span>
                    {item.isActive && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                  </div>
                  <div className="text-[9.5px] text-slate-400 tabular-nums mt-0.5">
                    Raw {item.nativeDb.toFixed(1)}
                  </div>
                  <div className="text-[9.5px] text-cyan-300 font-bold tabular-nums">
                    {formatSignedDb(item.appliedGainDb)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
