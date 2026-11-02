/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Interactive RF Demodulator & Transponder Scanner for DrFun1TV & Master Broadcast Studio
 * Scans all Cable & Satellite stations owned by DrFun1 ECOM Inc. across Ka, Ku, C, X, S, Optical,
 * QAM-256 Cable Headends, and 3GPP 5G NTN satellite transponders.
 * FCC FRN: 0034981290 | Hub: irc.drfun1.com:6697 (SSL)
 */

import React, { useState, useEffect, useRef } from 'react';
import { MasterEpgChannel } from '../../types/masterEpg';
import { DRFUN1_SCANNABLE_CABLE_SATELLITE_STATIONS, SCANNABLE_BANDS } from '../../data/drfun1ScannedStationsData';
import { 
  Radio as AntennaIcon, 
  Search, 
  Play, 
  Check, 
  X as CloseIcon, 
  Zap, 
  Activity, 
  Layers, 
  Server, 
  Tv, 
  ShieldCheck, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Sliders, 
  ExternalLink,
  Plus,
  Flame,
  CheckCircle2,
  Sparkles,
  Wifi
} from 'lucide-react';

interface CableSatelliteScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingChannelIds: string[];
  onAddScannedStations: (newStations: MasterEpgChannel[]) => void;
  onTuneStation: (channel: MasterEpgChannel) => void;
}

export const CableSatelliteScannerModal: React.FC<CableSatelliteScannerModalProps> = ({
  isOpen,
  onClose,
  existingChannelIds,
  onAddScannedStations,
  onTuneStation,
}) => {
  // Scanner state
  const [selectedBand, setSelectedBand] = useState<string>('all');
  const [scanMode, setScanMode] = useState<'fast' | 'deep' | 'qam'>('fast');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [currentFrequencyDisplay, setCurrentFrequencyDisplay] = useState<string>('29.50 GHz (Ka-Band)');
  const [currentCarrierLock, setCurrentCarrierLock] = useState<boolean>(false);
  const [currentSignalDbm, setCurrentSignalDbm] = useState<number>(-42.5);
  const [currentSnrDb, setCurrentSnrDb] = useState<number>(19.4);
  const [discoveredStations, setDiscoveredStations] = useState<MasterEpgChannel[]>([]);
  const [selectedStationIds, setSelectedStationIds] = useState<{ [id: string]: boolean }>({});
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [scanCompleted, setScanCompleted] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Canvas for RF waterfall visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play audio demodulator chirp tone when carrier lock occurs
  const playLockChirp = (freq = 880) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (_) {}
  };

  // Filter pool by band
  const scannablePool = React.useMemo(() => {
    if (selectedBand === 'all') {
      return DRFUN1_SCANNABLE_CABLE_SATELLITE_STATIONS;
    }
    return DRFUN1_SCANNABLE_CABLE_SATELLITE_STATIONS.filter(
      st => st.scannedBand === selectedBand
    );
  }, [selectedBand]);

  // Start or restart scan
  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanCompleted(false);
    setDiscoveredStations([]);
    setSelectedStationIds({});
    setCurrentCarrierLock(false);
    setSuccessNotice(null);
  };

  const handleStopScan = () => {
    setIsScanning(false);
  };

  // Scanning simulation effect
  useEffect(() => {
    if (!isOpen || !isScanning) return;

    let progress = 0;
    const totalSteps = scannablePool.length;
    let poolIndex = 0;

    const interval = setInterval(() => {
      progress += scanMode === 'fast' ? 5 : 2.5;
      
      // Determine pseudo-frequency display based on progress
      const frequencies = [
        '543.00 MHz (QAM-256 Cable)',
        '1.92 GHz (3GPP NTN S-Band)',
        '2.21 GHz (NOAA Space Weather S-Band)',
        '3.82 GHz (Galaxy 30 C-Band)',
        '3.95 GHz (Galaxy 19 C-Band)',
        '4.18 GHz (AMC-11 C-Band Cable Arc)',
        '7.95 GHz (X-Band Secure Ingest)',
        '8.44 GHz (Deep Space Mojave Beacon)',
        '11.88 GHz (Eutelsat Transatlantic Ku)',
        '12.22 GHz (EchoStar DBS-1 Ku-Band)',
        '14.25 GHz (OneWeb Polar Ku-Band)',
        '18.55 GHz (Switch SUPERNAP Ka-Band)',
        '28.35 GHz (Switch Teleport Ka-Uplink)',
        '32.15 GHz (8K Super Beam Ka-Band)',
        '193.1 THz (Quantum Fiber Laser 1550nm)',
        '193.4 THz (Deep Space Optical Laser)',
      ];
      const randomFreq = frequencies[Math.floor((progress / 100) * frequencies.length) % frequencies.length];
      setCurrentFrequencyDisplay(randomFreq);

      // Random signal fluctuations
      const dbm = -35 - Math.random() * 20;
      const snr = 16 + Math.random() * 8;
      setCurrentSignalDbm(Number(dbm.toFixed(1)));
      setCurrentSnrDb(Number(snr.toFixed(1)));

      // Periodically trigger carrier lock and discover a station
      const shouldLock = progress >= ((poolIndex + 1) / totalSteps) * 100 && poolIndex < totalSteps;
      if (shouldLock) {
        const newStation = scannablePool[poolIndex];
        if (newStation) {
          setCurrentCarrierLock(true);
          playLockChirp(700 + poolIndex * 50);
          setDiscoveredStations(prev => {
            if (prev.some(s => s.id === newStation.id)) return prev;
            return [...prev, newStation];
          });
          setSelectedStationIds(prev => ({ ...prev, [newStation.id]: true }));
          poolIndex++;
        }
      } else {
        setCurrentCarrierLock(false);
      }

      setScanProgress(Math.min(progress, 100));

      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setScanCompleted(true);
        setCurrentCarrierLock(true);
        playLockChirp(1200);
      }
    }, scanMode === 'fast' ? 140 : 260);

    return () => clearInterval(interval);
  }, [isOpen, isScanning, scannablePool, scanMode]);

  // Canvas visualizer loop for RF spectrum analyzer / waterfall
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      offset += 1.5;
      const w = canvas.width;
      const h = canvas.height;

      // Dark background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw RF Spectrum Waveform
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = currentCarrierLock ? '#10b981' : isScanning ? '#38bdf8' : '#64748b';

      for (let x = 0; x < w; x++) {
        const noise = Math.sin((x + offset) * 0.05) * 6 + (Math.random() - 0.5) * 4;
        let peak = 0;
        
        // Peaks on locked transponders
        if (isScanning || currentCarrierLock) {
          const center = (w * ((scanProgress % 100) / 100));
          const dist = Math.abs(x - center);
          if (dist < 30) {
            peak = Math.cos((dist / 30) * (Math.PI / 2)) * 45;
          }
        }

        // Secondary periodic transponder harmonics
        const harmonic1 = Math.abs(x - (w * 0.25)) < 15 ? 25 : 0;
        const harmonic2 = Math.abs(x - (w * 0.65)) < 20 ? 35 : 0;
        const harmonic3 = Math.abs(x - (w * 0.85)) < 18 ? 30 : 0;

        const y = h - 25 - noise - peak - harmonic1 - harmonic2 - harmonic3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Semi-transparent gradient under spectrum
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, currentCarrierLock ? 'rgba(16, 185, 129, 0.25)' : 'rgba(56, 189, 248, 0.2)');
      grad.addColorStop(1, 'rgba(3, 7, 18, 0.0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Sweep marker cursor line
      if (isScanning) {
        const cursorX = (w * (scanProgress / 100));
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cursorX, 0);
        ctx.lineTo(cursorX, h);
        ctx.stroke();

        // Cursor Frequency tag
        ctx.fillStyle = '#f43f5e';
        ctx.font = '9px monospace';
        ctx.fillText(`SWEEP: ${Math.round(scanProgress)}%`, Math.min(cursorX + 4, w - 70), 14);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isScanning, scanProgress, currentCarrierLock]);

  // Toggle selection for a discovered station
  const toggleSelectStation = (id: string) => {
    setSelectedStationIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Select all or deselect all
  const handleToggleSelectAll = () => {
    const allSelected = discoveredStations.every(s => selectedStationIds[s.id]);
    const next: { [id: string]: boolean } = {};
    discoveredStations.forEach(s => {
      next[s.id] = !allSelected;
    });
    setSelectedStationIds(next);
  };

  // Add selected stations into DrFun1TV & Studio
  const handleAddSelectedToStudio = () => {
    const toAdd = discoveredStations.filter(s => selectedStationIds[s.id]);
    if (toAdd.length === 0) return;

    onAddScannedStations(toAdd);
    setSuccessNotice(`Successfully added ${toAdd.length} DrFun1 ECOM cable/satellite stations to DrFun1TV & Master Studio!`);
    setTimeout(() => {
      setSuccessNotice(null);
    }, 5000);
  };

  if (!isOpen) return null;

  const selectedCount = discoveredStations.filter(s => selectedStationIds[s.id]).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* ========================================================
            MODAL HEADER: BRAND, CERTIFICATION & ACTIONS
            ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 via-indigo-600 to-emerald-400 text-slate-950 shadow-lg shadow-sky-500/20">
              <AntennaIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>RF Transponder & Cable/Satellite Auto-Scanner</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    DRFUN1 ECOM FLEET
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Scan Ka, Ku, C, X, S, Optical Laser & QAM Cable transponders owned by DrFun1 ECOM Inc. · FCC FRN: 0034981290
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                soundEnabled 
                  ? 'bg-slate-800 border-slate-700 text-sky-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Demodulator Audio Enabled' : 'Demodulator Audio Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Close Scanner"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================
            SCANNER CONFIGURATION TOOLBAR
            ======================================================== */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          {/* Target Frequency Band */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              TARGET SPECTRUM BAND
            </label>
            <select
              value={selectedBand}
              onChange={(e) => {
                setSelectedBand(e.target.value);
                setDiscoveredStations([]);
                setScanCompleted(false);
              }}
              disabled={isScanning}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-xs"
            >
              {SCANNABLE_BANDS.map(band => (
                <option key={band.id} value={band.id}>
                  {band.name} ({band.count} Stations)
                </option>
              ))}
            </select>
          </div>

          {/* Scanner Mode */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              TUNING DEMODULATOR MODE
            </label>
            <select
              value={scanMode}
              onChange={(e) => setScanMode(e.target.value as any)}
              disabled={isScanning}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-xs"
            >
              <option value="fast">Fast Blind Scan (DVB-S2 / QAM Sync)</option>
              <option value="deep">Deep Spectrum Analysis (CID & FEC Lock)</option>
              <option value="qam">QAM-256 Cable Headend Grid Only</option>
            </select>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-end gap-2">
            {!isScanning ? (
              <button
                onClick={handleStartScan}
                className="w-full py-1.5 px-4 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold rounded-lg transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>{scanCompleted ? 'Rescan Stations' : 'Start RF Spectrum Scan'}</span>
              </button>
            ) : (
              <button
                onClick={handleStopScan}
                className="w-full py-1.5 px-4 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Pause RF Sweep</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================
            REAL-TIME RF SPECTRUM WATERFALL CANVAS & GAUGES
            ======================================================== */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  currentCarrierLock ? 'bg-emerald-400 shadow-md shadow-emerald-400/80 animate-pulse' : isScanning ? 'bg-sky-400 animate-ping' : 'bg-slate-600'
                }`}></span>
                <strong className={currentCarrierLock ? 'text-emerald-400' : 'text-slate-400'}>
                  {currentCarrierLock ? 'CARRIER LOCK (DVB-S2 / QAM)' : isScanning ? 'TUNING CARRIER...' : 'STANDBY'}
                </strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">
                TUNED: <strong className="text-sky-300">{currentFrequencyDisplay}</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <div>
                <span className="text-slate-500">POWER: </span>
                <span className="text-emerald-400 font-bold">{currentSignalDbm} dBm</span>
              </div>
              <div>
                <span className="text-slate-500">SNR: </span>
                <span className="text-sky-400 font-bold">+{currentSnrDb} dB</span>
              </div>
              <div>
                <span className="text-slate-500">BER: </span>
                <span className="text-indigo-300 font-bold">&lt; 1.0e-9</span>
              </div>
              <div>
                <span className="text-slate-500">FOUND: </span>
                <span className="text-white font-bold">{discoveredStations.length} / {scannablePool.length}</span>
              </div>
            </div>
          </div>

          {/* HTML5 Spectrum Canvas */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
            <canvas
              ref={canvasRef}
              width={880}
              height={110}
              className="w-full h-24 object-cover block"
            />
            {/* Progress bar overlay on canvas bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-400 transition-all duration-200"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
          </div>

        </div>

        {/* ========================================================
            SUCCESS NOTIFICATION BANNER
            ======================================================== */}
        {successNotice && (
          <div className="mx-4 mt-3 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center justify-between gap-2 shadow-lg shadow-emerald-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="p-1 hover:bg-emerald-900 rounded text-emerald-400"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================
            DISCOVERED STATIONS MATRIX
            ======================================================== */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Tv className="w-4 h-4 text-sky-400" />
                <span>Discovered DrFun1 ECOM Stations ({discoveredStations.length})</span>
              </h3>
              {discoveredStations.length > 0 && (
                <button
                  onClick={handleToggleSelectAll}
                  className="text-[11px] font-mono text-sky-400 hover:text-sky-300 underline underline-offset-2 ml-2"
                >
                  {discoveredStations.every(s => selectedStationIds[s.id]) ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {discoveredStations.length > 0 && (
              <button
                onClick={handleAddSelectedToStudio}
                disabled={selectedCount === 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  selectedCount > 0
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add {selectedCount} Selected to DrFun1TV & Studio</span>
              </button>
            )}
          </div>

          {discoveredStations.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 space-y-3">
              <div className="p-3 bg-slate-900 rounded-full w-12 h-12 mx-auto flex items-center justify-center text-slate-500 border border-slate-800">
                <AntennaIcon className="w-6 h-6 text-sky-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-300">
                {isScanning ? 'Scanning Spectrum Bands for Active DrFun1 ECOM Transponders...' : 'No Transponders Scanned Yet'}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {isScanning
                  ? 'RF demodulator is sweeping Ka-band, Ku-band, C-band, Optical lasers, and QAM cable headends. Locked carriers will appear automatically.'
                  : 'Click "Start RF Spectrum Scan" above to discover all 22+ cable and satellite stations owned by DrFun1 ECOM Inc. with 1:1 UnrealIRCd channels.'}
              </p>
              {!isScanning && (
                <button
                  onClick={handleStartScan}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Start Scan (All Bands)</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {discoveredStations.map((station) => {
                const isSelected = !!selectedStationIds[station.id];
                const isAlreadyInStudio = existingChannelIds.includes(station.id);

                return (
                  <div
                    key={station.id}
                    className={`rounded-xl p-3.5 border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900/90 border-sky-500/60 shadow-lg shadow-sky-500/5'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Row: Checkbox, Call Sign, Channel Number, Band Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectStation(station.id)}
                            className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-800"
                          />
                          <span className="font-mono font-extrabold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/80">
                            CH {station.channelNumber}
                          </span>
                          <span className="font-mono font-bold text-white">
                            {station.callSign}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {station.scannedBand || station.frequencyBand}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>LOCKED</span>
                          </span>
                        </div>
                      </div>

                      {/* Station Name & Owner */}
                      <h4 className="font-bold text-white text-sm tracking-tight leading-snug">
                        {station.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Transponder: <span className="text-slate-300">{station.transponder}</span>
                      </p>

                      {/* RF Technical Telemetry Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                        <div>
                          <span className="text-slate-500 block">DOWNLINK / CARRIER</span>
                          <span className="text-slate-200 truncate block">{station.carrierFrequency}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">SIGNAL &amp; SNR</span>
                          <span className="text-emerald-400">{station.transponderSignalDbm} dBm · {station.snrDb} dB</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">MODULATION / FEC</span>
                          <span className="text-sky-300">{station.modulationType} ({station.fecRate})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">RESOLUTION</span>
                          <span className="text-slate-200">{station.resolution}</span>
                        </div>
                      </div>

                      {/* Current Program */}
                      <div className="mt-2.5 p-2 bg-slate-900 rounded border border-slate-800/80 text-[11px]">
                        <div className="text-[9px] font-mono text-sky-400 uppercase">Current Program</div>
                        <div className="font-medium text-slate-200 truncate mt-0.5">{station.currentProgram}</div>
                      </div>

                      {/* 1:1 Dedicated UnrealIRCd Channel */}
                      <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-500">Dedicated IRC:</span>
                        <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                          {station.unrealIrcChannel}
                        </span>
                      </div>
                    </div>

                    {/* Quick Tune Action */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-500">
                        {isAlreadyInStudio ? 'Already in studio' : 'Ready to import'}
                      </span>
                      <button
                        onClick={() => {
                          onTuneStation(station);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded text-xs font-mono font-medium transition-colors flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Tune Live</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ========================================================
            MODAL FOOTER: SUMMARY, CERTIFICATION & ADD ACTION
            ======================================================== */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Certified Legal via <a href="https://www.wittlawfirm.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">www.wittlawfirm.com</a> &amp; Owens Company · Richard Alan Witt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Close
            </button>
            {discoveredStations.length > 0 && (
              <button
                onClick={handleAddSelectedToStudio}
                disabled={selectedCount === 0}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                  selectedCount > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Import {selectedCount} Stations to Studio</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
