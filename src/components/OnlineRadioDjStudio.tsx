/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * ONLINE RADIO & MPD DJ BROADCAST STUDIO
 * Integrates:
 * - 24/7 Live DrFun1 FM / HD Online Radio Streaming Player
 * - Dual-Deck MPD DJ Station Console & Crossfader
 * - 855,000 Tracks & YouTube Music Playlist Catalog
 * - Automated Listener Request Bot & Announcer
 * - Real-Time Audio Spectrum Visualizer & Stereo VU Meters
 * - Synchronized Radio WebIRC Client (#music-deathrow & #drfun1-dj)
 */

import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Disc, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  SkipBack, 
  Sliders, 
  Music, 
  Repeat, 
  Shuffle, 
  Headphones, 
  Flame, 
  Terminal, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  Search, 
  Send, 
  ExternalLink,
  Layers,
  Copy,
  Check,
  Zap,
  Mic,
  MicOff,
  Radio as AntennaIcon
} from 'lucide-react';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { MultistreamIrcChatRoom } from './MultistreamIrcChatRoom';
import { UnifiedMusicIrcHub } from './UnifiedMusicIrcHub';
import { MpdDjControlPanel } from './MpdDjControlPanel';
import { IrcLoginSession } from '../types/irc';
import { INITIAL_MPD_BOT_INSTANCES } from '../data/mpdBotData';
import { MpdBotInstance } from '../types/mpdBot';

interface OnlineRadioDjStudioProps {
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onNavigateToIrc?: () => void;
  activeRank?: AnopeRankLevel;
  onOpenIrcdAdmin?: () => void;
  ircSession: IrcLoginSession;
  onUpdateSession?: (newSession: Partial<IrcLoginSession>) => void;
}

export const OnlineRadioDjStudio: React.FC<OnlineRadioDjStudioProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onNavigateToIrc,
  activeRank = 'op',
  onOpenIrcdAdmin,
  ircSession,
  onUpdateSession
}) => {
  // Radio Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(85);
  const [activeStreamQuality, setActiveStreamQuality] = useState<'320k_mp3' | '192k_aac' | 'flac_lossless'>('320k_mp3');
  const [listenerCount, setListenerCount] = useState<number>(1429);
  const [stationMode, setStationMode] = useState<'shoutcast_live' | 'mpd_dj_deck' | 'music_catalog' | 'radio_irc'>('shoutcast_live');
  const [djBots, setDjBots] = useState<MpdBotInstance[]>(INITIAL_MPD_BOT_INSTANCES);
  const [selectedBotId, setSelectedBotId] = useState<string>(INITIAL_MPD_BOT_INSTANCES[0].id);
  const activeBot = djBots.find(b => b.id === selectedBotId) || djBots[0];

  // Currently playing metadata
  const [currentArtist, setCurrentArtist] = useState<string>('DrFun1 Media Live DJ');
  const [currentTrack, setCurrentTrack] = useState<string>('Trans-Atlantic 100G Deep Bass Mix');
  const [nextTrack, setNextTrack] = useState<string>('Switch SUPERNAP Cyber Synthesizer');
  const [trackProgress, setTrackProgress] = useState<number>(45); // percent

  // Simulated VU & Track timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setTrackProgress(prev => (prev >= 100 ? 0 : prev + 1));
        setListenerCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="space-y-6">
      {/* Radio Studio Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 p-0.5 shadow-md shadow-purple-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-pink-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  DrFun1 FM &amp; MPD DJ Station Console
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                  SHOUTCAST 320 KBPS
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Icecast2 Cluster
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Online Radio Broadcasting · 855k YouTube Music Catalog · Dual DJ Decks · Synchronized #music-deathrow IRC
              </p>
            </div>
          </div>

          {/* Quick Metrics & Player Controls */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Listeners Badge */}
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-xs flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-400">LISTENERS:</span>
              <span className="text-white font-bold">{listenerCount.toLocaleString()}</span>
            </div>

            {/* Quality Selector */}
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1 text-xs font-mono">
              <button
                onClick={() => setActiveStreamQuality('320k_mp3')}
                className={`px-2 py-1 rounded transition-colors ${activeStreamQuality === '320k_mp3' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                320K
              </button>
              <button
                onClick={() => setActiveStreamQuality('192k_aac')}
                className={`px-2 py-1 rounded transition-colors ${activeStreamQuality === '192k_aac' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                192K
              </button>
              <button
                onClick={() => setActiveStreamQuality('flac_lossless')}
                className={`px-2 py-1 rounded transition-colors ${activeStreamQuality === 'flac_lossless' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                FLAC
              </button>
            </div>

            {/* Master Radio Toggle */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
                isPlaying
                  ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-pink-950/50'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
              <span>{isPlaying ? 'PAUSE STREAM' : 'START RADIO'}</span>
            </button>
          </div>
        </div>

        {/* Radio Studio Navigation Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setStationMode('shoutcast_live')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              stationMode === 'shoutcast_live'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-pink-300 hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-pink-400" />
            <span>Live Radio Playout &amp; VU</span>
          </button>

          <button
            onClick={() => setStationMode('mpd_dj_deck')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              stationMode === 'mpd_dj_deck'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/50'
            }`}
          >
            <Disc className="w-3.5 h-3.5 text-purple-400" />
            <span>MPD DJ Console &amp; Crossfader</span>
          </button>

          <button
            onClick={() => setStationMode('music_catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              stationMode === 'music_catalog'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            <span>855k YouTube Music Catalog</span>
          </button>

          <button
            onClick={() => setStationMode('radio_irc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              stationMode === 'radio_irc'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Radio IRC Chat (#music-deathrow)</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Live Radio Playout Deck */}
      {stationMode === 'shoutcast_live' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Turntable & Spectrum Visualizer (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
            {/* Turntable Visual Deck */}
            <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.12)_0%,transparent_70%)]" />
              
              {/* Spinning Vinyl Simulation */}
              <div className="relative mb-6">
                <div className={`w-36 h-36 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center shadow-2xl relative ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
                  <div className="w-24 h-24 rounded-full bg-slate-950 border-2 border-pink-500/30 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-inner">
                      FM
                    </div>
                  </div>
                </div>
              </div>

              {/* Track Info */}
              <div className="text-center space-y-1.5 z-10 max-w-lg">
                <div className="text-xl font-extrabold text-white tracking-tight">
                  {currentTrack}
                </div>
                <div className="text-sm font-semibold text-pink-400">
                  {currentArtist}
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Up Next: <span className="text-slate-300">{nextTrack}</span>
                </div>
              </div>

              {/* Simulated Frequency Spectrum Bars */}
              <div className="w-full max-w-md h-12 flex items-end justify-center gap-1.5 mt-6 z-10">
                {[60, 85, 45, 95, 70, 30, 80, 100, 65, 40, 90, 75, 50, 85, 60, 95].map((h, i) => (
                  <div
                    key={i}
                    className="w-2 rounded-t bg-gradient-to-t from-pink-600 to-purple-400 transition-all duration-150"
                    style={{ height: isPlaying ? `${Math.max(10, Math.round(h * Math.random()))}%` : '6%' }}
                  />
                ))}
              </div>

              {/* Progress Slider */}
              <div className="w-full max-w-lg mt-4 z-10 space-y-1">
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all"
                    style={{ width: `${trackProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>02:18</span>
                  <span>04:45</span>
                </div>
              </div>
            </div>

            {/* Transport Bar */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-lg bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center transition shadow cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                </button>
                <div className="text-xs">
                  <div className="font-bold text-white">Master Radio Engine</div>
                  <div className="text-[10px] font-mono text-emerald-400">STATUS: BROADCASTING NOMINAL</div>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <button onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-24 accent-pink-500"
                />
                <span>{isMuted ? '0%' : `${volume}%`}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Audio Endpoints & Station Details (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-pink-400" />
                Live Broadcast Ingest &amp; Stream URLs
              </span>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[10px]">SHOUTcast v2 Server:</div>
                  <div className="text-pink-300 truncate">http://stream.drfun1.com:8000/live.mp3</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[10px]">Icecast2 Lossless FLAC Mount:</div>
                  <div className="text-purple-300 truncate">http://stream.drfun1.com:8000/lossless.ogg</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[10px]">MPD Daemon Host &amp; Port:</div>
                  <div className="text-cyan-300 truncate">mpd.drfun1.com:6600 (Password Protected)</div>
                </div>
              </div>
            </div>

            {/* Station Request Bot Overview */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg text-xs">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Listener IRC Request Bot Commands
              </span>
              <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-pink-400">!request &lt;artist/track&gt;</span>
                  <span className="text-slate-500">Queue track</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-purple-400">!np</span>
                  <span className="text-slate-500">Now playing</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-cyan-400">!voteskip</span>
                  <span className="text-slate-500">Vote to skip</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-emerald-400">!dj</span>
                  <span className="text-slate-500">Current DJ status</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: MPD DJ Deck Console & Crossfader */}
      {stationMode === 'mpd_dj_deck' && (
        <MpdDjControlPanel
          bots={djBots}
          activeBot={activeBot}
          onSelectBot={(id) => setSelectedBotId(id)}
          onOpenIrc={onNavigateToIrc}
          onOpenBroadcast={() => setStationMode('shoutcast_live')}
          activeRank={activeRank}
        />
      )}

      {/* Mode 3: 855k YouTube Music Catalog */}
      {stationMode === 'music_catalog' && (
        <UnifiedMusicIrcHub
          ircSession={ircSession}
          onUpdateSession={onUpdateSession}
          activeServer="dev.drfun1media.com"
          onJoinExternalChannel={onNavigateToIrc}
        />
      )}

      {/* Mode 4: Radio & Music WebIRC Client */}
      {stationMode === 'radio_irc' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-pink-400" />
                Radio Station IRC Room (#music-deathrow &amp; #drfun1-dj)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Connected to irc.drfun1.com:6697 (SSL) · Real-time track requests, DJ live talk &amp; listener community
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-pink-500/20 text-pink-300 font-mono text-xs font-bold">
              donSchoe/shoutcast-irc bot
            </span>
          </div>

          <MultistreamIrcChatRoom
            variant="full"
            activeRank={activeRank}
            onOpenAdminPanel={onOpenIrcdAdmin}
            onOpenIrcClient={onNavigateToIrc}
            defaultChannel="#music-deathrow"
          />
        </div>
      )}
    </div>
  );
};
