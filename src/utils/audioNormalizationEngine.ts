/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Global Volume Normalization Engine (Web Audio API DSP + Broadcast Loudness Calibration)
 * Automatically levels Satellite, Web HLS, Local OTA, and Fiber 100G news feeds to a
 * consistent baseline decibel target with smooth gain ramping and true-peak limiting.
 */

import {
  AudioNormalizationConfig,
  AudioNormalizationPreset,
  GlobalNewsOutlet,
  NewsStreamSourceType,
} from '../types/drfun1News';

export interface NormalizationPresetSpec {
  id: AudioNormalizationPreset;
  label: string;
  shortLabel: string;
  targetDb: number;
  ceilingDb: number;
  compressorRatio: number;
  description: string;
}

export const AUDIO_NORMALIZATION_PRESETS: NormalizationPresetSpec[] = [
  {
    id: 'news-desk',
    label: 'News Desk Baseline (-18 dB)',
    shortLabel: 'News -18dB',
    targetDb: -18,
    ceilingDb: -1.0,
    compressorRatio: 8,
    description: 'Balanced DrFun1 broadcast speech level for multi-source switching',
  },
  {
    id: 'ebu-r128',
    label: 'EBU R128 Broadcast (-23 dB)',
    shortLabel: 'EBU -23dB',
    targetDb: -23,
    ceilingDb: -1.0,
    compressorRatio: 6,
    description: 'International European broadcast loudness standard (-23 LUFS)',
  },
  {
    id: 'atsc-a85',
    label: 'ATSC A/85 CALM (-24 dB)',
    shortLabel: 'ATSC -24dB',
    targetDb: -24,
    ceilingDb: -2.0,
    compressorRatio: 6,
    description: 'North American television CALM Act loudness compliance (-24 LKFS)',
  },
  {
    id: 'night-limit',
    label: 'Night Limiter (-21 dB)',
    shortLabel: 'Night -21dB',
    targetDb: -21,
    ceilingDb: -3.0,
    compressorRatio: 14,
    description: 'Tight dynamic range compression for low-volume late-night monitoring',
  },
];

export const DEFAULT_AUDIO_NORMALIZATION_CONFIG: AudioNormalizationConfig = {
  enabled: true,
  targetDb: -18,
  preset: 'news-desk',
  truePeakLimiter: true,
  ceilingDb: -1.0,
  rampMs: 350,
  masterVolume: 0.85,
};

// Base loudness offset by transport medium (Satellite uplinks are typically hotter than Web HLS)
const SOURCE_BASE_LOUDNESS_DB: Record<NewsStreamSourceType, number> = {
  satellite: -14.2,
  fiber: -16.4,
  local: -20.6,
  web: -23.4,
};

const clamp = (val: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, val));

const hashString = (input: string): number => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

/**
 * Deterministic native loudness profile (in dBFS / integrated LUFS) for a given
 * news outlet + streaming source combination. Reflects real-world level discrepancies
 * between Ku/Ka-band satellite muxes, regional OTA feeds, and Web HLS transcodes.
 */
export const getNativeSourceLoudnessDb = (
  outlet: GlobalNewsOutlet,
  sourceType: NewsStreamSourceType
): number => {
  const base = SOURCE_BASE_LOUDNESS_DB[sourceType] ?? -18;
  const h = hashString(`${outlet.id}:${sourceType}`);
  // Deterministic outlet variance between -2.4 dB and +2.4 dB
  const outletVariance = ((h % 49) - 24) * 0.1;
  // Breaking news desks tend to run +0.8 dB hotter
  const breakingBoost = outlet.isBreaking ? 0.8 : 0;
  return +clamp(base + outletVariance + breakingBoost, -29.0, -10.5).toFixed(1);
};

/**
 * Computes required gain trim (in dB) to normalize rawInputDb to targetDb
 * while honoring safe broadcast boost/cut rails (-12 dB to +12 dB) and true-peak ceiling.
 */
export const computeNormalizationGainDb = (
  rawInputDb: number,
  config: AudioNormalizationConfig
): { appliedGainDb: number; outputDb: number; peakReductionDb: number } => {
  if (!config.enabled) {
    return {
      appliedGainDb: 0,
      outputDb: +rawInputDb.toFixed(1),
      peakReductionDb: 0,
    };
  }

  const desiredGain = config.targetDb - rawInputDb;
  const clampedGain = clamp(desiredGain, -12, 12);
  let outputDb = rawInputDb + clampedGain;
  let peakReductionDb = 0;

  if (config.truePeakLimiter && outputDb > config.ceilingDb - 2.5) {
    const excess = outputDb - (config.ceilingDb - 2.5);
    peakReductionDb = +(excess * 0.65).toFixed(1);
    outputDb = outputDb - peakReductionDb;
  }

  return {
    appliedGainDb: +clampedGain.toFixed(1),
    outputDb: +clamp(outputDb, -36, config.ceilingDb).toFixed(1),
    peakReductionDb,
  };
};

export const dbToLinearGain = (db: number): number => Math.pow(10, db / 20);

/**
 * Web Audio API DSP chain for real-time volume normalization, smooth gain ramping,
 * broadcast DynamicsCompressorNode true-peak limiting, and optional audible calibration tone.
 */
export class WebAudioNormalizationEngine {
  private ctx: AudioContext | null = null;
  private inputGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private monitorOscA: OscillatorNode | null = null;
  private monitorOscB: OscillatorNode | null = null;
  private monitorGain: GainNode | null = null;
  private isMonitorPlaying = false;
  private attachedElements = new WeakSet<HTMLMediaElement>();

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    try {
      const ctx = new AudioCtx();
      const inputGain = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();
      const masterGain = ctx.createGain();
      const analyser = ctx.createAnalyser();

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.78;

      compressor.threshold.value = -18;
      compressor.knee.value = 6;
      compressor.ratio.value = 8;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.16;

      inputGain.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      this.ctx = ctx;
      this.inputGain = inputGain;
      this.compressor = compressor;
      this.masterGain = masterGain;
      this.analyser = analyser;
      return ctx;
    } catch {
      return null;
    }
  }

  public attachMediaElement(element: HTMLMediaElement): boolean {
    if (this.attachedElements.has(element)) return true;
    const ctx = this.ensureContext();
    if (!ctx || !this.inputGain) return false;
    try {
      const source = ctx.createMediaElementSource(element);
      source.connect(this.inputGain);
      this.attachedElements.add(element);
      return true;
    } catch {
      return false;
    }
  }

  public applyDspSettings(params: {
    rawInputDb: number;
    appliedGainDb: number;
    config: AudioNormalizationConfig;
    isMuted: boolean;
    isPlaying: boolean;
  }): void {
    if (!this.ctx || !this.inputGain || !this.compressor || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const rampSec = Math.max(0.05, params.config.rampMs / 1000);

    // Model incoming native loudness level for the calibration monitor bed
    if (this.monitorGain) {
      const nativeScale = clamp(dbToLinearGain(params.rawInputDb + 12) * 0.09, 0.005, 0.25);
      this.monitorGain.gain.cancelScheduledValues(now);
      this.monitorGain.gain.setTargetAtTime(nativeScale, now, 0.04);
    }

    // Smooth auto-leveling compensation gain ramp (prevents jarring volume jumps)
    const compensationLinear = params.config.enabled ? dbToLinearGain(params.appliedGainDb) : 1.0;
    this.inputGain.gain.cancelScheduledValues(now);
    this.inputGain.gain.setValueAtTime(this.inputGain.gain.value, now);
    this.inputGain.gain.linearRampToValueAtTime(clamp(compensationLinear, 0.15, 4.0), now + rampSec);

    // True-Peak Limiter & broadcast compressor profile
    const presetSpec =
      AUDIO_NORMALIZATION_PRESETS.find((p) => p.id === params.config.preset) ||
      AUDIO_NORMALIZATION_PRESETS[0];
    if (params.config.enabled && params.config.truePeakLimiter) {
      this.compressor.threshold.setTargetAtTime(params.config.targetDb + 2, now, 0.05);
      this.compressor.ratio.setTargetAtTime(presetSpec.compressorRatio, now, 0.05);
      this.compressor.knee.setTargetAtTime(6, now, 0.05);
    } else {
      this.compressor.threshold.setTargetAtTime(0, now, 0.05);
      this.compressor.ratio.setTargetAtTime(1, now, 0.05);
    }

    // Master volume + mute
    const targetMaster = params.isMuted || !params.isPlaying ? 0 : clamp(params.config.masterVolume, 0, 1);
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(targetMaster, now, 0.03);
  }

  public toggleReferenceMonitor(
    enable: boolean,
    params: {
      rawInputDb: number;
      appliedGainDb: number;
      config: AudioNormalizationConfig;
      isMuted: boolean;
      isPlaying: boolean;
    }
  ): boolean {
    if (!enable) {
      this.stopReferenceMonitor();
      return false;
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.inputGain) return false;
    this.stopReferenceMonitor();

    try {
      // Soft broadcast reference harmonic bed (220Hz + 330Hz gentle sine chord)
      const oscA = ctx.createOscillator();
      const oscB = ctx.createOscillator();
      const monitorGain = ctx.createGain();
      const lowpass = ctx.createBiquadFilter();

      oscA.type = 'sine';
      oscA.frequency.value = 220;
      oscB.type = 'triangle';
      oscB.frequency.value = 330;

      lowpass.type = 'lowpass';
      lowpass.frequency.value = 620;

      monitorGain.gain.value = 0.02;

      oscA.connect(lowpass);
      oscB.connect(lowpass);
      lowpass.connect(monitorGain);
      monitorGain.connect(this.inputGain);

      oscA.start();
      oscB.start();

      this.monitorOscA = oscA;
      this.monitorOscB = oscB;
      this.monitorGain = monitorGain;
      this.isMonitorPlaying = true;
      this.applyDspSettings(params);
      return true;
    } catch {
      return false;
    }
  }

  public stopReferenceMonitor(): void {
    try {
      this.monitorOscA?.stop();
      this.monitorOscB?.stop();
    } catch {
      // Oscillator already stopped
    }
    this.monitorOscA?.disconnect();
    this.monitorOscB?.disconnect();
    this.monitorGain?.disconnect();
    this.monitorOscA = null;
    this.monitorOscB = null;
    this.monitorGain = null;
    this.isMonitorPlaying = false;
  }

  public getIsMonitorPlaying(): boolean {
    return this.isMonitorPlaying;
  }

  public getCompressorReductionDb(): number {
    if (!this.compressor) return 0;
    return +Math.abs(this.compressor.reduction || 0).toFixed(1);
  }

  public dispose(): void {
    this.stopReferenceMonitor();
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    this.inputGain = null;
    this.compressor = null;
    this.masterGain = null;
    this.analyser = null;
  }
}
