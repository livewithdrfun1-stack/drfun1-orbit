import React, { useState } from 'react';
import { RtmpTvHostConfig } from '../../types/stream';
import { 
  Tv, 
  Radio, 
  Server, 
  Sliders, 
  Volume2, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Play, 
  Square, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Activity, 
  Wifi, 
  HelpCircle 
} from 'lucide-react';

interface RtmpTvHostPanelProps {
  tvConfig: RtmpTvHostConfig;
  onUpdateConfig: (updated: Partial<RtmpTvHostConfig>) => void;
  isBroadcasting: boolean;
  onToggleBroadcast: () => void;
  onOpenLicense: () => void;
  onOpenSwitchMesh: () => void;
}

export const RtmpTvHostPanel: React.FC<RtmpTvHostPanelProps> = ({
  tvConfig,
  onUpdateConfig,
  isBroadcasting,
  onToggleBroadcast,
  onOpenLicense,
  onOpenSwitchMesh,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [dumpActivated, setDumpActivated] = useState<boolean>(false);
  const [alertDismissed, setAlertDismissed] = useState<boolean>(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDump = () => {
    setDumpActivated(true);
    setTimeout(() => setDumpActivated(false), 3000);
  };

  return (
    <div className="p-4 space-y-5 text-xs text-slate-200">
      {/* TV Station Header */}
      <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-indigo-950/60 border border-red-500/30 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm tracking-wide">
                {tvConfig.channelName}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-red-500 text-white font-mono text-[10px] font-extrabold uppercase">
                {tvConfig.callSign}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Master Control: <strong className="text-emerald-400 font-medium">Switch SUPERNAP Teleport (Las Vegas)</strong></span>
              <span className="text-slate-600">·</span>
              <span>Uplink: <strong className="text-sky-400 font-medium">{tvConfig.frequencyBand}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleBroadcast}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow ${
              isBroadcasting
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/60'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/60'
            }`}
          >
            {isBroadcasting ? (
              <>
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>ON-AIR (STOP)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>GO ON-AIR</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Emergency Alert System (EAS) Simulator Banner */}
      {tvConfig.emergencyAlertActive && !alertDismissed && (
        <div className="bg-red-950 border-2 border-red-500 rounded-xl p-3 text-red-200 animate-pulse flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-xs tracking-wide">
                EMERGENCY ALERT SYSTEM (EAS) - SATCOM URGENT BULLETIN
              </p>
              <p className="text-[11px] text-red-300 mt-0.5">
                Solar geomagnetic storm warning (G4 Class). Switch SUPERNAP teleport automated transponder failover active to protected Ku-band carrier.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onUpdateConfig({ emergencyAlertActive: false });
              setAlertDismissed(true);
            }}
            className="px-2.5 py-1 rounded bg-red-900 hover:bg-red-800 text-white font-mono text-[10px]"
          >
            Acknowledge &amp; Clear
          </button>
        </div>
      )}

      {/* Program Playout Source Matrix */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            TV Master Playout Video Router
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Active: {tvConfig.playoutMode.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'switch_teleport', label: 'Switch Teleport Ground Dishes', icon: '📡', desc: 'Ka-band Live' },
            { id: 'live_studio', label: 'Studio Host Cam (Richard Witt)', icon: '🎥', desc: 'Blackmagic 4K' },
            { id: 'launch_feed', label: 'LEO Launch Direct-to-Cell', icon: '🚀', desc: 'SpaceX Stage 1' },
            { id: 'orbit_telemetry', label: 'Synthetic Aperture Radar (SAR)', icon: '🛰️', desc: 'X-band Downlink' },
            { id: 'color_bars', label: 'SMPTE Color Bars & 1kHz Tone', icon: '📊', desc: 'Test Carrier' },
            { id: 'eas_emergency', label: 'Emergency Alert System (EAS)', icon: '⚠️', desc: 'Urgent Bulletin' },
          ].map(source => (
            <button
              key={source.id}
              onClick={() => onUpdateConfig({ 
                playoutMode: source.id as any,
                emergencyAlertActive: source.id === 'eas_emergency'
              })}
              className={`p-2.5 rounded-lg text-left transition-all border ${
                tvConfig.playoutMode === source.id
                  ? 'bg-red-500/15 border-red-400 text-white font-semibold shadow-md'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span>{source.icon}</span>
                <span className="truncate">{source.label}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">{source.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Broadcast Specs: Resolution, Bitrate & Audio Encoder */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Resolution */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
            Playout Resolution
          </label>
          <select
            value={tvConfig.resolution}
            onChange={e => onUpdateConfig({ resolution: e.target.value as any })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-red-500"
          >
            <option value="4K UHD (2160p60)">4K UHD (2160p 60fps)</option>
            <option value="FHD (1080p60)">1080p FHD (60fps)</option>
            <option value="HD (720p60)">720p HD (60fps)</option>
          </select>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            Direct SMPTE 2110 IP video mapping
          </p>
        </div>

        {/* Video Bitrate */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-slate-300">Video Bitrate</label>
            <span className="font-mono text-xs font-bold text-red-400">{tvConfig.videoBitrateMbps} Mbps</span>
          </div>
          <input
            type="range"
            min={8}
            max={28}
            step={1}
            value={tvConfig.videoBitrateMbps}
            onChange={e => onUpdateConfig({ videoBitrateMbps: Number(e.target.value) })}
            className="w-full accent-red-500 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
            <span>8M (HD)</span>
            <span>18M (1080p)</span>
            <span>28M (4K UHD)</span>
          </div>
        </div>

        {/* Audio Codec */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
            Master Audio Codec
          </label>
          <select
            value={tvConfig.audioCodec}
            onChange={e => onUpdateConfig({ audioCodec: e.target.value as any })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-red-500"
          >
            <option value="AAC-LC 320kbps">AAC-LC 320 kbps (Broadcast)</option>
            <option value="Opus 256kbps">Opus 256 kbps (Low Latency)</option>
            <option value="Dolby Digital AC3 5.1">Dolby Digital AC3 5.1 Surround</option>
          </select>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            48 kHz 24-bit PCM resampled
          </p>
        </div>
      </div>

      {/* Broadcast Delay & Emergency DUMP controls */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 font-mono text-xs font-bold">
            {tvConfig.broadcastDelaySeconds}s
          </div>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Broadcast Safe Delay Buffer (7 Seconds)
            </p>
            <p className="text-[10px] text-slate-400">
              Live playout buffer held at Switch SUPERNAP datacenter before public satellite uplink.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDump}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all border ${
              dumpActivated
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-red-950/80 hover:bg-red-900 text-red-300 border-red-500/40'
            }`}
          >
            {dumpActivated ? 'BUFFER DUMPED! (SAFE)' : 'DUMP BUFFER (PROFANITY SAFE)'}
          </button>

          <button
            onClick={() => onUpdateConfig({ audioLimiterEnabled: !tvConfig.audioLimiterEnabled })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              tvConfig.audioLimiterEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {tvConfig.audioLimiterEnabled ? 'Limiter: ON (-0.1 dBFS)' : 'Limiter: BYPASS'}
          </button>
        </div>
      </div>

      {/* Master Program Audio Fader & Peak Meter */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-red-400" />
            Master Playout Audio Gain &amp; Stereo VU
          </span>
          <span className="font-mono text-xs font-bold text-red-400">
            {tvConfig.programVolume}% ({((tvConfig.programVolume - 100) / 5).toFixed(1)} dBFS)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={tvConfig.programVolume}
            onChange={e => onUpdateConfig({ programVolume: Number(e.target.value) })}
            className="flex-1 accent-red-500 h-1.5 bg-slate-800 rounded cursor-pointer"
          />

          {/* Stereo Peak Bars */}
          <div className="flex flex-col gap-1 w-28 bg-slate-900 p-1.5 rounded border border-slate-800">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono text-slate-500 w-3">L</span>
              <div className="flex-1 bg-slate-950 h-2 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full transition-all duration-75 ${
                    tvConfig.programVolume > 90 ? 'bg-red-500' : tvConfig.programVolume > 70 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${tvConfig.programVolume}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono text-slate-500 w-3">R</span>
              <div className="flex-1 bg-slate-950 h-2 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full transition-all duration-75 ${
                    tvConfig.programVolume > 90 ? 'bg-red-500' : tvConfig.programVolume > 70 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.max(0, tvConfig.programVolume - 2)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ingest Endpoints & Keys */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
        <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-red-400" />
          DrFun1 TV Master Playout Ingestion URLs
        </h4>

        <div className="space-y-2.5 font-mono text-xs">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Primary RTMP Playout Host (Switch SUPERNAP 100G)</span>
              <button
                onClick={() => handleCopy(tvConfig.primaryRtmpIngest, 'prim_rtmp')}
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[10px]"
              >
                {copiedKey === 'prim_rtmp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'prim_rtmp' ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
            <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800 text-slate-200">
              {tvConfig.primaryRtmpIngest}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Backup RTMPS Secure Ingest (Port 443 TLS)</span>
              <button
                onClick={() => handleCopy(tvConfig.backupRtmpsIngest, 'sec_rtmps')}
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[10px]"
              >
                {copiedKey === 'sec_rtmps' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'sec_rtmps' ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
            <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800 text-slate-200">
              {tvConfig.backupRtmpsIngest}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Master Station Stream Key (Richard Alan Witt Authorization)</span>
              <button
                onClick={() => handleCopy(tvConfig.streamKey, 'key')}
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[10px]"
              >
                {copiedKey === 'key' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'key' ? 'Copied' : 'Copy Stream Key'}</span>
              </button>
            </div>
            <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800 text-slate-200 flex items-center justify-between">
              <span>{tvConfig.streamKey.substring(0, 16)}••••••••••••••••</span>
              <span className="text-[10px] text-emerald-400">AUTHORITATIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Schedule Automation */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            24/7 TV Playout Automation Schedule
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Timezone: UTC</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[9px] font-bold">NOW</span>
              <div>
                <p className="font-semibold text-white">DrFun1 ECOM Live Showcase with Richard Alan Witt</p>
                <p className="text-[10px] text-slate-400">Direct satellite terminal &amp; Switch SUPERNAP colocation showcase</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-red-300">12:00 - 14:00 UTC</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">NEXT</span>
              <div>
                <p className="font-semibold text-slate-200">Switch SUPERNAP Teleport Uplink Report (Las Vegas)</p>
                <p className="text-[10px] text-slate-500">100G optical telemetry and Starlink / Eutelsat cross-connect health</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-500">14:00 - 15:30 UTC</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">LATER</span>
              <div>
                <p className="font-semibold text-slate-200">UnrealIRCd 12-Node Leaf Sync &amp; RisingNet Transit Review</p>
                <p className="text-[10px] text-slate-500">Global encrypted mesh sync across irc.drfun1.com</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-500">15:30 - 17:00 UTC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
