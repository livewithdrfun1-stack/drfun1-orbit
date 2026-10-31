import React, { useState, useEffect, useRef } from 'react';
import { MpdBotInstance, MpdTrack } from '../types/mpdBot';
import { GITHUB_MPD_REPO } from '../data/mpdBotData';
import { 
  Disc, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Radio, 
  Terminal, 
  Headphones, 
  Mic, 
  MicOff, 
  Flame, 
  Sparkles, 
  Share2, 
  Music, 
  RotateCcw, 
  Check, 
  ExternalLink,
  Send,
  Zap,
  Layers,
  ArrowRight,
  Shuffle
} from 'lucide-react';

interface MpdDjControlPanelProps {
  bots: MpdBotInstance[];
  activeBot: MpdBotInstance;
  onSelectBot: (botId: string) => void;
  onOpenIrc?: () => void;
  onOpenBroadcast?: () => void;
  onOpenDuplicator?: () => void;
}

interface DjDeckState {
  track: MpdTrack;
  isPlaying: boolean;
  elapsedSeconds: number;
  bpm: number;
  pitchPercent: number; // -16 to +16
  highGain: number; // -26 to +6 dB
  midGain: number;
  lowGain: number;
  filter: number; // -100 (LPF) to 0 (neutral) to +100 (HPF)
  loopActive: boolean;
  loopBeats: number;
  cuePoint: number;
  pflCue: boolean;
  highKill: boolean;
  midKill: boolean;
  lowKill: boolean;
}

export const MpdDjControlPanel: React.FC<MpdDjControlPanelProps> = ({
  bots,
  activeBot,
  onSelectBot,
  onOpenIrc,
  onOpenBroadcast,
  onOpenDuplicator,
}) => {
  // DJ Identity and Broadcast Status
  const [djHandle, setDjHandle] = useState<string>('DJ Orbit Nova');
  const [isOnAir, setIsOnAir] = useState<boolean>(true);
  const [isMicTalkover, setIsMicTalkover] = useState<boolean>(false);
  const [djShoutout, setDjShoutout] = useState<string>('');
  const [recentShoutouts, setRecentShoutouts] = useState<string[]>([
    '🔥 "Locked in on irc.drfun1.com with DJ Orbit Nova dropping pure vinyl heat!"',
    '🔊 "Duplicating this mix across #deathrow-records, #all-music & #drfun1-media!"',
  ]);

  // Crossfader: 0 (100% Deck A) to 100 (100% Deck B), 50 is center
  const [crossfader, setCrossfader] = useState<number>(50);
  const [crossfadeCurve, setCrossfadeCurve] = useState<'smooth' | 'cut' | 'linear'>('smooth');
  const [masterVolume, setMasterVolume] = useState<number>(85);

  // Deck A & Deck B State
  const [deckA, setDeckA] = useState<DjDeckState>({
    track: activeBot.nowPlaying,
    isPlaying: true,
    elapsedSeconds: activeBot.elapsedSeconds,
    bpm: 94,
    pitchPercent: 0,
    highGain: 0,
    midGain: 0,
    lowGain: 0,
    filter: 0,
    loopActive: false,
    loopBeats: 4,
    cuePoint: 0,
    pflCue: true,
    highKill: false,
    midKill: false,
    lowKill: false,
  });

  const [deckB, setDeckB] = useState<DjDeckState>({
    track: activeBot.queue[0] || {
      id: 'deck-b-default',
      title: 'California Love (Remix)',
      artist: '2Pac feat. Dr. Dre',
      album: 'All Eyez on Me',
      year: 1996,
      duration: 285,
      bitrate: '320 kbps MP3',
      genre: 'G-Funk',
      label: 'Death Row Records',
      fileFormat: 'mp3',
    },
    isPlaying: false,
    elapsedSeconds: 0,
    bpm: 96,
    pitchPercent: 0,
    highGain: 0,
    midGain: 0,
    lowGain: 0,
    filter: 0,
    loopActive: false,
    loopBeats: 4,
    cuePoint: 0,
    pflCue: false,
    highKill: false,
    midKill: false,
    lowKill: false,
  });

  // DJ Request Crate (incoming listener requests)
  const [requestCrate, setRequestCrate] = useState<MpdTrack[]>([
    {
      id: 'req-01',
      title: 'Hypnotize',
      artist: 'The Notorious B.I.G.',
      album: 'Life After Death',
      year: 1997,
      duration: 230,
      bitrate: '320 kbps MP3',
      genre: 'East Coast Hip-Hop',
      label: 'Bad Boy',
      fileFormat: 'mp3',
      requestedBy: 'Brooklyn_NOC',
    },
    {
      id: 'req-02',
      title: 'Resonance',
      artist: 'HOME',
      album: 'Odyssey',
      year: 2014,
      duration: 212,
      bitrate: 'FLAC Lossless',
      genre: 'Synthwave',
      label: 'Midwest Collective',
      fileFormat: 'flac',
      requestedBy: 'Cyber_Pilot',
    },
    {
      id: 'req-03',
      title: 'Still D.R.E.',
      artist: 'Dr. Dre feat. Snoop Dogg',
      album: '2001',
      year: 1999,
      duration: 270,
      bitrate: '320 kbps MP3',
      genre: 'West Coast',
      label: 'Aftermath',
      fileFormat: 'mp3',
      requestedBy: 'Vegas_Teleport',
    },
  ]);

  // Web Audio Context for DJ Audio & Sampler Pads
  const audioContextRef = useRef<AudioContext | null>(null);
  const deckAGainRef = useRef<GainNode | null>(null);
  const deckBGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const deckAOscRef = useRef<OscillatorNode | null>(null);
  const deckBOscRef = useRef<OscillatorNode | null>(null);

  // Initialize Audio Graph
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime((masterVolume / 100) * (isMicTalkover ? 0.35 : 1), ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Deck A Gain
      const gainA = ctx.createGain();
      const crossfaderAWeight = crossfader <= 50 ? 1 : (100 - crossfader) / 50;
      gainA.gain.setValueAtTime(deckA.isPlaying ? crossfaderAWeight * 0.25 : 0, ctx.currentTime);
      gainA.connect(masterGain);
      deckAGainRef.current = gainA;

      // Deck B Gain
      const gainB = ctx.createGain();
      const crossfaderBWeight = crossfader >= 50 ? 1 : crossfader / 50;
      gainB.gain.setValueAtTime(deckB.isPlaying ? crossfaderBWeight * 0.25 : 0, ctx.currentTime);
      gainB.connect(masterGain);
      deckBGainRef.current = gainB;

      // Oscillators for Decks
      const oscA = ctx.createOscillator();
      oscA.type = 'sawtooth';
      oscA.frequency.setValueAtTime(110 * (1 + deckA.pitchPercent / 100), ctx.currentTime);
      oscA.connect(gainA);
      oscA.start();
      deckAOscRef.current = oscA;

      const oscB = ctx.createOscillator();
      oscB.type = 'triangle';
      oscB.frequency.setValueAtTime(130 * (1 + deckB.pitchPercent / 100), ctx.currentTime);
      oscB.connect(gainB);
      oscB.start();
      deckBOscRef.current = oscB;
    } catch (_) {}

    return () => {
      try {
        if (deckAOscRef.current) deckAOscRef.current.stop();
        if (deckBOscRef.current) deckBOscRef.current.stop();
      } catch (_) {}
    };
  }, []);

  // Update Crossfader & Volume Gains dynamically
  useEffect(() => {
    if (!audioContextRef.current || !deckAGainRef.current || !deckBGainRef.current || !masterGainRef.current) return;
    const ctx = audioContextRef.current;
    
    // Master Gain (with Talkover ducking)
    const duckFactor = isMicTalkover ? 0.3 : 1;
    masterGainRef.current.gain.setTargetAtTime((masterVolume / 100) * duckFactor, ctx.currentTime, 0.05);

    // Crossfader curves
    let weightA = 1;
    let weightB = 1;
    if (crossfadeCurve === 'cut') {
      weightA = crossfader < 95 ? 1 : 0;
      weightB = crossfader > 5 ? 1 : 0;
    } else {
      weightA = crossfader <= 50 ? 1 : Math.cos(((crossfader - 50) / 50) * (Math.PI / 2));
      weightB = crossfader >= 50 ? 1 : Math.sin((crossfader / 50) * (Math.PI / 2));
    }

    deckAGainRef.current.gain.setTargetAtTime(deckA.isPlaying ? weightA * 0.25 : 0, ctx.currentTime, 0.05);
    deckBGainRef.current.gain.setTargetAtTime(deckB.isPlaying ? weightB * 0.25 : 0, ctx.currentTime, 0.05);

    if (deckAOscRef.current) {
      deckAOscRef.current.frequency.setTargetAtTime(110 * (1 + deckA.pitchPercent / 100), ctx.currentTime, 0.05);
    }
    if (deckBOscRef.current) {
      deckBOscRef.current.frequency.setTargetAtTime(130 * (1 + deckB.pitchPercent / 100), ctx.currentTime, 0.05);
    }
  }, [crossfader, crossfadeCurve, masterVolume, isMicTalkover, deckA.isPlaying, deckB.isPlaying, deckA.pitchPercent, deckB.pitchPercent]);

  // Periodic Playhead updates for both decks
  useEffect(() => {
    const timer = setInterval(() => {
      if (deckA.isPlaying) {
        setDeckA(prev => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1 >= prev.track.duration ? 0 : prev.elapsedSeconds + 1,
        }));
      }
      if (deckB.isPlaying) {
        setDeckB(prev => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1 >= prev.track.duration ? 0 : prev.elapsedSeconds + 1,
        }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [deckA.isPlaying, deckB.isPlaying]);

  // DJ Soundboard Synthesizer Triggers (Real Web Audio FX)
  const triggerSamplerPad = (soundType: 'airhorn' | 'laser' | 'scratch' | 'sub_boom' | 'vocal_drop' | 'rewind' | 'clap' | 'cheer') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const now = ctx.currentTime;
      const padGain = ctx.createGain();
      padGain.gain.setValueAtTime(0.4, now);
      padGain.connect(ctx.destination);

      if (soundType === 'airhorn') {
        // High-energy brass/airhorn pulse
        const freqs = [587.33, 587.33, 587.33, 783.99, 783.99, 880.00];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now + idx * 0.06);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.35, now + idx * 0.06);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);
          osc.connect(g);
          g.connect(padGain);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.2);
        });
      } else if (soundType === 'laser') {
        // Laser sweep
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
        padGain.gain.setValueAtTime(0.5, now);
        padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(padGain);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (soundType === 'scratch') {
        // Vinyl needle scrub
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.08);
        osc.frequency.linearRampToValueAtTime(180, now + 0.18);
        padGain.gain.setValueAtTime(0.3, now);
        padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(padGain);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (soundType === 'sub_boom') {
        // Sub 808 Boom
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);
        padGain.gain.setValueAtTime(0.8, now);
        padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.connect(padGain);
        osc.start(now);
        osc.stop(now + 0.7);
      } else if (soundType === 'rewind') {
        // Rewind tape stop
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        padGain.gain.setValueAtTime(0.4, now);
        padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
        osc.connect(padGain);
        osc.start(now);
        osc.stop(now + 0.53);
      } else {
        // Strobe clap or chirp
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        padGain.gain.setValueAtTime(0.4, now);
        padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(padGain);
        osc.start(now);
        osc.stop(now + 0.16);
      }
    } catch (_) {}
  };

  // Beatmatching Sync (Lock Deck B to Deck A BPM or vice versa)
  const handleSyncDecks = (target: 'A' | 'B') => {
    if (target === 'A') {
      setDeckA(prev => ({
        ...prev,
        bpm: deckB.bpm,
        pitchPercent: ((deckB.bpm - prev.track.duration) / prev.track.duration) * 100,
      }));
    } else {
      setDeckB(prev => ({
        ...prev,
        bpm: deckA.bpm,
        pitchPercent: ((deckA.bpm - prev.track.duration) / prev.track.duration) * 100,
      }));
    }
  };

  // Automated Smooth Crossfade Transition
  const handleAutoTransition = (toDeck: 'A' | 'B') => {
    const targetValue = toDeck === 'A' ? 0 : 100;
    const step = toDeck === 'A' ? -2 : 2;
    let curr = crossfader;

    const interval = setInterval(() => {
      curr += step;
      if ((toDeck === 'A' && curr <= 0) || (toDeck === 'B' && curr >= 100)) {
        setCrossfader(targetValue);
        clearInterval(interval);
      } else {
        setCrossfader(curr);
      }
    }, 40);
  };

  // Broadcast DJ Shoutout to IRC
  const handleSendShoutout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!djShoutout.trim()) return;

    const formatted = `[DJ SHOUTOUT] <${djHandle}>: "${djShoutout.trim()}" (Broadcasting on ${activeBot.ircChannel})`;
    setRecentShoutouts(prev => [formatted, ...prev.slice(0, 4)]);
    setDjShoutout('');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">

      {/* DJ Master Broadcast Header HUD */}
      <div className="bg-gradient-to-r from-purple-950/90 via-slate-900 to-rose-950/90 border border-purple-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-lg">
              <Headphones className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold">
                  PRO DJ CONTROL BOOTH
                </span>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border flex items-center gap-1 ${
                  isOnAir
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isOnAir ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'}`} />
                  {isOnAir ? 'ON-AIR BROADCAST LIVE' : 'BOOTH PREVIEW ONLY'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{djHandle}</span>
                <span className="text-slate-500">•</span>
                <span className="text-sm font-mono text-emerald-400 font-normal">
                  Transmitting to {activeBot.ircChannel} ({activeBot.botNick})
                </span>
              </h2>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center flex-wrap gap-2 font-mono text-xs">
            <button
              onClick={() => setIsMicTalkover(!isMicTalkover)}
              className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                isMicTalkover
                  ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
              }`}
            >
              {isMicTalkover ? <Mic className="w-4 h-4 animate-bounce" /> : <MicOff className="w-4 h-4 text-slate-500" />}
              <span>{isMicTalkover ? 'MIC TALKOVER ACTIVE (-12dB Duck)' : 'Mic Talkover'}</span>
            </button>

            <button
              onClick={() => setIsOnAir(!isOnAir)}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                isOnAir
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-lg'
              }`}
            >
              {isOnAir ? 'MUTE ON-AIR' : 'GO LIVE ON-AIR'}
            </button>

            {onOpenIrc && (
              <button
                onClick={onOpenIrc}
                className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Open IRC Console</span>
              </button>
            )}

            {onOpenDuplicator && (
              <button
                onClick={onOpenDuplicator}
                className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>IRC Duplicator Mesh</span>
              </button>
            )}
          </div>
        </div>

        {/* DJ Shoutout Bar directly linked to mpd_irc_bot */}
        <form onSubmit={handleSendShoutout} className="flex items-center gap-2 pt-2 border-t border-purple-500/20">
          <input
            type="text"
            placeholder={`Broadcast live voice/text shoutout to ${activeBot.ircChannel} and all duplicated channels...`}
            value={djShoutout}
            onChange={(e) => setDjShoutout(e.target.value)}
            className="flex-1 bg-slate-950/80 border border-purple-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Shoutout</span>
          </button>
        </form>
      </div>

      {/* DUAL DECK DJ MIXER WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* DECK A (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center">
                  A
                </span>
                <span className="font-bold text-white text-sm tracking-wide">DECK A</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-sky-400 font-bold">{deckA.bpm.toFixed(1)} BPM</span>
                <button
                  onClick={() => handleSyncDecks('A')}
                  className="px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[10px] font-bold cursor-pointer"
                >
                  SYNC
                </button>
              </div>
            </div>

            {/* Deck A Track Header */}
            <div className="py-2.5 space-y-1">
              <div className="text-white font-bold text-sm truncate">{deckA.track.title}</div>
              <div className="text-xs text-slate-400 truncate">{deckA.track.artist} • {deckA.track.album}</div>
              <div className="flex items-center gap-2 text-[10px] font-mono pt-1 text-slate-500">
                <span>{deckA.track.bitrate}</span>
                <span>•</span>
                <span>{deckA.track.genre}</span>
                <span>•</span>
                <span className="text-sky-400">{deckA.track.label}</span>
              </div>
            </div>

            {/* Turntable A Visualizer */}
            <div className="py-4 flex items-center justify-center relative">
              <div className={`w-40 h-40 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center shadow-inner relative ${deckA.isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3.5s' }}>
                <div className="absolute inset-3 rounded-full border border-slate-800" />
                <div className="absolute inset-7 rounded-full border border-slate-800" />
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white">
                  <Disc className="w-7 h-7" />
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 absolute" />
              </div>
            </div>

            {/* Progress Slider */}
            <div className="space-y-1 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{formatSeconds(deckA.elapsedSeconds)}</span>
                <span>{formatSeconds(deckA.track.duration)}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-sky-400 transition-all"
                  style={{ width: `${(deckA.elapsedSeconds / deckA.track.duration) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Deck A Performance Controls: Pitch, EQ & Loops */}
          <div className="space-y-3 pt-3 border-t border-slate-800 font-mono text-xs">
            {/* 3-Band EQ Kills */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block">HIGH</span>
                <button
                  onClick={() => setDeckA(prev => ({ ...prev, highKill: !prev.highKill }))}
                  className={`w-full py-1 rounded text-[10px] font-bold ${
                    deckA.highKill ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {deckA.highKill ? 'KILL' : 'HI'}
                </button>
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block">MID</span>
                <button
                  onClick={() => setDeckA(prev => ({ ...prev, midKill: !prev.midKill }))}
                  className={`w-full py-1 rounded text-[10px] font-bold ${
                    deckA.midKill ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {deckA.midKill ? 'KILL' : 'MID'}
                </button>
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block">LOW</span>
                <button
                  onClick={() => setDeckA(prev => ({ ...prev, lowKill: !prev.lowKill }))}
                  className={`w-full py-1 rounded text-[10px] font-bold ${
                    deckA.lowKill ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {deckA.lowKill ? 'KILL' : 'BASS'}
                </button>
              </div>
            </div>

            {/* Transport Bar */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => setDeckA(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  deckA.isPlaying
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                }`}
              >
                {deckA.isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{deckA.isPlaying ? 'PAUSE A' : 'PLAY A'}</span>
              </button>

              <button
                onClick={() => setDeckA(prev => ({ ...prev, elapsedSeconds: 0 }))}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
              >
                CUE
              </button>
            </div>
          </div>
        </div>

        {/* CENTER DJ MIXER SECTION (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-purple-500/40 rounded-2xl p-4 flex flex-col justify-between items-center text-center space-y-4 shadow-xl">
          <div className="w-full">
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest block">
              BATTLE MIXER
            </span>
            <div className="text-xs font-mono text-slate-400 mt-1">Crossfader &amp; Master</div>
          </div>

          {/* Master Volume Knob / Fader */}
          <div className="w-full space-y-1.5 font-mono text-xs">
            <span className="text-[10px] text-slate-400 uppercase">MASTER LEVEL</span>
            <input
              type="range"
              min={0}
              max={100}
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseInt(e.target.value, 10))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <span className="text-purple-300 font-bold">{masterVolume}%</span>
          </div>

          {/* Crossfader Curve Selector */}
          <div className="w-full space-y-1 font-mono text-xs">
            <span className="text-[10px] text-slate-400 uppercase">FADE CURVE</span>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <button
                onClick={() => setCrossfadeCurve('smooth')}
                className={`py-1 rounded ${crossfadeCurve === 'smooth' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
              >
                Smooth
              </button>
              <button
                onClick={() => setCrossfadeCurve('cut')}
                className={`py-1 rounded ${crossfadeCurve === 'cut' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
              >
                Scratch Cut
              </button>
            </div>
          </div>

          {/* Automated Crossfade Buttons */}
          <div className="w-full space-y-2 font-mono text-xs">
            <span className="text-[10px] text-slate-400 uppercase">AUTO-TRANSITION</span>
            <div className="flex items-center justify-between gap-1">
              <button
                onClick={() => handleAutoTransition('A')}
                className="flex-1 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[10px] font-bold"
              >
                &larr; Deck A
              </button>
              <button
                onClick={() => setCrossfader(50)}
                className="px-2 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[10px] font-bold"
              >
                Center
              </button>
              <button
                onClick={() => handleAutoTransition('B')}
                className="flex-1 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold"
              >
                Deck B &rarr;
              </button>
            </div>
          </div>

          {/* Master Crossfader Horizontal Bar */}
          <div className="w-full space-y-1.5 pt-2 border-t border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
              <span className="text-sky-400">DECK A</span>
              <span className="text-purple-400">{crossfader}%</span>
              <span className="text-rose-400">DECK B</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={crossfader}
              onChange={(e) => setCrossfader(parseInt(e.target.value, 10))}
              className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* DECK B (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center">
                  B
                </span>
                <span className="font-bold text-white text-sm tracking-wide">DECK B</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-rose-400 font-bold">{deckB.bpm.toFixed(1)} BPM</span>
                <button
                  onClick={() => handleSyncDecks('B')}
                  className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold cursor-pointer"
                >
                  SYNC
                </button>
              </div>
            </div>

            {/* Deck B Track Header */}
            <div className="py-2.5 space-y-1">
              <div className="text-white font-bold text-sm truncate">{deckB.track.title}</div>
              <div className="text-xs text-slate-400 truncate">{deckB.track.artist} • {deckB.track.album}</div>
              <div className="flex items-center gap-2 text-[10px] font-mono pt-1 text-slate-500">
                <span>{deckB.track.bitrate}</span>
                <span>•</span>
                <span>{deckB.track.genre}</span>
                <span>•</span>
                <span className="text-rose-400">{deckB.track.label}</span>
              </div>
            </div>

            {/* Turntable B Visualizer */}
            <div className="py-4 flex items-center justify-center relative">
              <div className={`w-40 h-40 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center shadow-inner relative ${deckB.isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3.5s' }}>
                <div className="absolute inset-3 rounded-full border border-slate-800" />
                <div className="absolute inset-7 rounded-full border border-slate-800" />
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white">
                  <Disc className="w-7 h-7" />
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 absolute" />
              </div>
            </div>

            {/* Progress Slider */}
            <div className="space-y-1 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{formatSeconds(deckB.elapsedSeconds)}</span>
                <span>{formatSeconds(deckB.track.duration)}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-rose-400 transition-all"
                  style={{ width: `${(deckB.elapsedSeconds / deckB.track.duration) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Deck B Performance Controls: Pitch, EQ & Loops */}
          <div className="space-y-3 pt-3 border-t border-slate-800 font-mono text-xs">
            {/* 3-Band EQ Kills */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block">HIGH</span>
                <button
                  onClick={() => setDeckB(prev => ({ ...prev, highKill: !prev.highKill }))}
                  className={`w-full py-1 rounded text-[10px] font-bold ${
                    deckB.highKill ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {deckB.highKill ? 'KILL' : 'HI'}
                </button>
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block">MID</span>
                <button
                  onClick={() => setDeckB(prev => ({ ...prev, midKill: !prev.midKill }))}
                  className={`w-full py-1 rounded text-[10px] font-bold ${
                    deckB.midKill ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {deckB.midKill ? 'KILL' : 'MID'}
                </button>
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block">LOW</span>
                <button
                  onClick={() => setDeckB(prev => ({ ...prev, lowKill: !prev.lowKill }))}
                  className={`w-full py-1 rounded text-[10px] font-bold ${
                    deckB.lowKill ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {deckB.lowKill ? 'KILL' : 'BASS'}
                </button>
              </div>
            </div>

            {/* Transport Bar */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => setDeckB(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  deckB.isPlaying
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-rose-500 hover:bg-rose-400 text-slate-950'
                }`}
              >
                {deckB.isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{deckB.isPlaying ? 'PAUSE B' : 'PLAY B'}</span>
              </button>

              <button
                onClick={() => setDeckB(prev => ({ ...prev, elapsedSeconds: 0 }))}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
              >
                CUE
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* DJ SAMPLER SOUNDBOARD & CRATE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* DJ Soundboard Pads (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-white text-sm">DJ Soundboard &amp; Drops (Live Web Audio)</h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Instant Synthesized FX</span>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            <button
              onClick={() => triggerSamplerPad('airhorn')}
              className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-mono text-xs font-bold transition-transform active:scale-95 flex flex-col items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Flame className="w-5 h-5 text-amber-400" />
              <span>AIRHORN</span>
            </button>

            <button
              onClick={() => triggerSamplerPad('laser')}
              className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-300 font-mono text-xs font-bold transition-transform active:scale-95 flex flex-col items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>LASER DROP</span>
            </button>

            <button
              onClick={() => triggerSamplerPad('scratch')}
              className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/40 hover:bg-purple-500/30 text-purple-300 font-mono text-xs font-bold transition-transform active:scale-95 flex flex-col items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Disc className="w-5 h-5 text-purple-400" />
              <span>SCRATCH</span>
            </button>

            <button
              onClick={() => triggerSamplerPad('sub_boom')}
              className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/10 border border-rose-500/40 hover:bg-rose-500/30 text-rose-300 font-mono text-xs font-bold transition-transform active:scale-95 flex flex-col items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Volume2 className="w-5 h-5 text-rose-400" />
              <span>808 BOOM</span>
            </button>

            <button
              onClick={() => triggerSamplerPad('rewind')}
              className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs font-bold transition-transform active:scale-95 flex flex-col items-center gap-1.5 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-5 h-5 text-emerald-400" />
              <span>REWIND</span>
            </button>

            <button
              onClick={() => triggerSamplerPad('clap')}
              className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/10 border border-sky-500/40 hover:bg-sky-500/30 text-sky-300 font-mono text-xs font-bold transition-transform active:scale-95 flex flex-col items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Sparkles className="w-5 h-5 text-sky-400" />
              <span>STROBE CLAP</span>
            </button>

            <button
              onClick={() => triggerSamplerPad('vocal_drop')}
              className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/10 border border-pink-500/40 hover:bg-pink-500/30 text-pink-300 font-mono text-xs font-bold transition-transform active:scale-95 flex flex-col items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Mic className="w-5 h-5 text-pink-400" />
              <span>DRFUN1 DROP</span>
            </button>

            <button
              onClick={() => triggerSamplerPad('cheer')}
              className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-mono text-xs font-bold transition-transform active:scale-95 flex flex-col items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Share2 className="w-5 h-5 text-yellow-400" />
              <span>CROWD HYPE</span>
            </button>
          </div>
        </div>

        {/* DJ Request Crate (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-white text-sm">Listener Request Crate (IRC !play Queue)</h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{requestCrate.length} Requested Tracks</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
            {requestCrate.map(req => (
              <div
                key={req.id}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono"
              >
                <div>
                  <div className="font-semibold text-white">{req.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {req.artist} • <span className="text-slate-500">Req by: {req.requestedBy}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDeckA(prev => ({ ...prev, track: req, elapsedSeconds: 0 }));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[10px] font-bold cursor-pointer"
                  >
                    Load &rarr; Deck A
                  </button>
                  <button
                    onClick={() => {
                      setDeckB(prev => ({ ...prev, track: req, elapsedSeconds: 0 }));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold cursor-pointer"
                  >
                    Load &rarr; Deck B
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
