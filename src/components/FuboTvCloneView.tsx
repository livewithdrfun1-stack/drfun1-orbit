/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * FUBO.TV CLONE - SPORTS-FIRST LIVE TV STREAMING PLATFORM
 * Features:
 * - Live Sports Match Hub (NFL, Premier League, NBA, MLB, F1, UEFA)
 * - 4K Ultra HD Broadcast Player with Live Time Shift & Box Scores
 * - Interactive Electronic Program Guide (EPG) Grid
 * - Signature Fubo 4-Screen Multi-View Matrix
 * - Cloud DVR Manager (1,000 Hours Storage & Replays)
 * - DrFun1 100G Switch Teleport & WebIRC Sports Chat (#fubotv-sports)
 * - Regulatory Compliance: The Law Office of Richard A. Witt LLC | FCC FRN: 0034981290
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FuboChannel, 
  FuboLiveGame, 
  FuboDvrRecording, 
  FuboCategory, 
  FuboSportLeague,
  FuboMultiViewSlot 
} from '../types/fubotv';
import { 
  FUBO_CHANNELS, 
  FUBO_LIVE_GAMES, 
  INITIAL_FUBO_DVR_RECORDINGS 
} from '../data/fuboTvData';
import { 
  Tv, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  RotateCcw, 
  RotateCw, 
  Radio, 
  Calendar, 
  Layers, 
  Search, 
  Film, 
  Trophy, 
  Check, 
  Plus, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Circle, 
  Flame, 
  ChevronRight, 
  SlidersHorizontal, 
  Sparkles, 
  Terminal, 
  X, 
  Zap, 
  BarChart2, 
  MessageSquare, 
  DownloadCloud, 
  Trash2, 
  Compass, 
  Star,
  Users
} from 'lucide-react';

interface FuboTvCloneViewProps {
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onNavigateToIrc?: () => void;
}

export const FuboTvCloneView: React.FC<FuboTvCloneViewProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onNavigateToIrc,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'home' | 'sports' | 'guide' | 'multiview' | 'dvr'>('home');
  
  // Selected channel and game for playback
  const [currentChannel, setCurrentChannel] = useState<FuboChannel>(FUBO_CHANNELS[0]);
  const [currentLiveGame, setCurrentLiveGame] = useState<FuboLiveGame | null>(FUBO_LIVE_GAMES[0]);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(85);
  const [videoQuality, setVideoQuality] = useState<'4K HDR' | '1080p60' | '720p60'>('4K HDR');
  const [showStatsOverlay, setShowStatsOverlay] = useState<boolean>(false);
  const [showChatSidebar, setShowChatSidebar] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playbackTimeOffset, setPlaybackTimeOffset] = useState<number>(0); // 0 = live, <0 = delayed in seconds

  // Guide and Sports Filtering
  const [selectedSportLeague, setSelectedSportLeague] = useState<FuboSportLeague>('All Sports');
  const [selectedGuideCategory, setSelectedGuideCategory] = useState<FuboCategory>('All');
  const [guideSearchQuery, setGuideSearchQuery] = useState<string>('');
  const [selectedGuideTimeSlot, setSelectedGuideTimeSlot] = useState<string>('Now');

  // Multi-View state (4 slots)
  const [multiViewSlots, setMultiViewSlots] = useState<FuboMultiViewSlot[]>([
    { slotId: 0, channelId: 'fubo-sports-net', isMuted: false },
    { slotId: 1, channelId: 'espn-hd', isMuted: true },
    { slotId: 2, channelId: 'fs1-4k', isMuted: true },
    { slotId: 3, channelId: 'nfl-network', isMuted: true },
  ]);
  const [multiViewActiveSlot, setMultiViewActiveSlot] = useState<number>(0);

  // Cloud DVR state
  const [dvrRecordings, setDvrRecordings] = useState<FuboDvrRecording[]>(INITIAL_FUBO_DVR_RECORDINGS);
  const [dvrToastNotice, setDvrToastNotice] = useState<string | null>(null);

  // Chat message state for simulated live fan stream in #fubotv-sports
  const [chatMessages, setChatMessages] = useState<{ id: string; user: string; text: string; time: string; color: string }[]>([
    { id: '1', user: 'SakaFan_07', text: 'What an interception by Arsenal defense!!', time: '1:42 PM', color: 'text-red-400' },
    { id: '2', user: 'ChiefsKingdom99', text: 'Mahomes scramble was unbelievable on 3rd down!', time: '1:43 PM', color: 'text-amber-400' },
    { id: '3', user: 'F1_Telemetry', text: 'Verstappen pitting on lap 50 for fresh mediums.', time: '1:43 PM', color: 'text-sky-400' },
    { id: '4', user: 'SatcomRichard', text: 'Live 4K stream bonded over Switch SUPERNAP 100G ring with sub-2s latency.', time: '1:44 PM', color: 'text-emerald-400' },
  ]);
  const [inputChat, setInputChat] = useState<string>('');

  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Handle switching channel & game
  const handleSelectChannel = (channel: FuboChannel) => {
    setCurrentChannel(channel);
    // Find matching live game if any
    const matched = FUBO_LIVE_GAMES.find((g) => g.channelId === channel.id);
    setCurrentLiveGame(matched || null);
    setIsPlaying(true);
    setPlaybackTimeOffset(0);
  };

  const handleSelectLiveGame = (game: FuboLiveGame) => {
    setCurrentLiveGame(game);
    const matchedChan = FUBO_CHANNELS.find((c) => c.id === game.channelId);
    if (matchedChan) {
      setCurrentChannel(matchedChan);
    }
    setIsPlaying(true);
    setPlaybackTimeOffset(0);
  };

  // Record to DVR handler
  const handleRecordProgram = (title: string, channelName: string, category: string = 'Sports') => {
    const newRecording: FuboDvrRecording = {
      id: `dvr-${Date.now()}`,
      title,
      subtitle: `Recorded from ${channelName} • Cloud DVR 4K Archive`,
      channelName,
      recordedAt: 'Just Now',
      durationMinutes: 120,
      fileSizeGb: 7.4,
      thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
      category,
      isFavorite: false,
    };
    setDvrRecordings((prev) => [newRecording, ...prev]);
    setDvrToastNotice(`Added "${title}" to your Fubo Cloud DVR (1,000 Hrs Quota).`);
    setTimeout(() => setDvrToastNotice(null), 3500);
  };

  const handleDeleteRecording = (id: string) => {
    setDvrRecordings((prev) => prev.filter((r) => r.id !== id));
  };

  // Multi-View slot updater
  const handleSetMultiViewSlotChannel = (slotIndex: number, newChannelId: string) => {
    setMultiViewSlots((prev) =>
      prev.map((slot) => (slot.slotId === slotIndex ? { ...slot, channelId: newChannelId } : slot))
    );
  };

  const handleSetMultiViewAudioFocus = (slotIndex: number) => {
    setMultiViewActiveSlot(slotIndex);
    setMultiViewSlots((prev) =>
      prev.map((slot) => ({ ...slot, isMuted: slot.slotId !== slotIndex }))
    );
  };

  // Chat sender
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;
    const newMsg = {
      id: `chat-${Date.now()}`,
      user: 'You (WebIRC)',
      text: inputChat.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: 'text-purple-400',
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setInputChat('');
  };

  // Filtered games
  const filteredLiveGames = useMemo(() => {
    return FUBO_LIVE_GAMES.filter((g) => {
      if (selectedSportLeague === 'All Sports') return true;
      return g.league === selectedSportLeague;
    });
  }, [selectedSportLeague]);

  // Filtered Guide channels
  const filteredGuideChannels = useMemo(() => {
    return FUBO_CHANNELS.filter((c) => {
      if (selectedGuideCategory !== 'All' && c.category !== selectedGuideCategory) return false;
      if (guideSearchQuery.trim()) {
        const q = guideSearchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.callSign.toLowerCase().includes(q) ||
          c.currentProgram.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedGuideCategory, guideSearchQuery]);

  // Cloud DVR used calculation
  const dvrHoursUsed = useMemo(() => {
    return Math.round(dvrRecordings.reduce((acc, r) => acc + r.durationMinutes / 60, 0));
  }, [dvrRecordings]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Toast Notification */}
      {dvrToastNotice && (
        <div className="fixed top-20 right-6 z-50 bg-orange-950/95 border border-orange-500/60 text-orange-200 px-4 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-6 h-6 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
            <DownloadCloud className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-bold text-white">Fubo Cloud DVR</p>
            <p className="text-[11px] text-orange-300">{dvrToastNotice}</p>
          </div>
          <button
            onClick={() => setDvrToastNotice(null)}
            className="p-1 hover:bg-orange-900/50 rounded text-orange-400 cursor-pointer ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================
          1. FUBO TOP HEADER & PRIMARY HUB NAV
          ======================================================== */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Fubo Brand Wordmark & Tagline */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-red-600 p-0.5 shadow-lg shadow-orange-900/40 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Tv className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                  fubo<span className="text-orange-500">.tv</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 uppercase tracking-wider">
                  SPORTS FIRST
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  4K HDR 60fps
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Premier live sports streaming, interactive EPG guide, 4-screen multi-view &amp; 1,000h Cloud DVR on Switch 100G CDN.
              </p>
            </div>
          </div>

          {/* Quick External & Legal Actions */}
          <div className="flex items-center gap-2 text-xs font-mono shrink-0 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>FCC FRN: 0034981290</span>
            </span>

            {onOpenSwitchMesh && (
              <button
                onClick={onOpenSwitchMesh}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Switch SUPERNAP Nevada 100G Playout"
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>Switch 100G CDN</span>
              </button>
            )}

            {onOpenLicense && (
              <button
                onClick={onOpenLicense}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Witt Law Escrow</span>
              </button>
            )}
          </div>
        </div>

        {/* Fubo Navigation Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('sports')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'sports'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Sports Center ({FUBO_LIVE_GAMES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Guide (EPG)</span>
          </button>

          <button
            onClick={() => setActiveTab('multiview')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'multiview'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Multi-View (4-Screens)</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-orange-950 text-orange-300 font-bold">
              Signature
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dvr')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'dvr'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>My Stuff / DVR ({dvrRecordings.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. CORE 4K VIDEO PLAYER COMPONENT (ALWAYS VISIBLE IN HOME & SPORTS)
          ======================================================== */}
      {(activeTab === 'home' || activeTab === 'sports') && (
        <div 
          ref={playerContainerRef}
          className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative"
        >
          {/* Main Video Viewport Canvas */}
          <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
            
            {/* Background Dynamic Stadium Field Simulation */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10 pointer-events-none" />
            
            <div className="absolute inset-0 opacity-80 mix-blend-luminosity pointer-events-none">
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-black" />
            </div>

            {/* Stadium Pitch Grid Lines & Ambient Visualizer */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <div className="w-[85%] h-[80%] border-2 border-emerald-500/40 rounded-2xl relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-2 border-emerald-500/40" />
                <div className="w-px h-full bg-emerald-500/40" />
              </div>
            </div>

            {/* Center Broadcast Playout Content Card */}
            <div className="relative z-20 text-center p-6 max-w-xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/60 border border-orange-500/40 text-orange-400 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold">ON AIR &bull; {currentChannel.callSign}</span>
                <span className="text-slate-500">|</span>
                <span>{videoQuality}</span>
              </div>

              {currentLiveGame ? (
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-2xl backdrop-blur-md space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
                    <span className="text-orange-400 font-bold">{currentLiveGame.league}</span>
                    <span>{currentLiveGame.venue}</span>
                    <span className="text-emerald-400 font-bold">{currentLiveGame.gameClock}</span>
                  </div>

                  <div className="flex items-center justify-around py-2">
                    <div className="text-center space-y-1">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm mx-auto shadow-md" style={{ backgroundColor: currentLiveGame.homeTeam.color }}>
                        {currentLiveGame.homeTeam.shortName}
                      </div>
                      <p className="text-xs font-bold text-white">{currentLiveGame.homeTeam.name}</p>
                      <p className="text-2xl font-black text-white tabular-nums">{currentLiveGame.homeTeam.score}</p>
                    </div>

                    <div className="text-center font-mono text-slate-500 text-xs px-2">
                      <span className="text-xl font-light text-slate-600">VS</span>
                      <p className="text-[10px] text-red-400 font-bold mt-1">{currentLiveGame.period}</p>
                    </div>

                    <div className="text-center space-y-1">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm mx-auto shadow-md" style={{ backgroundColor: currentLiveGame.awayTeam.color }}>
                        {currentLiveGame.awayTeam.shortName}
                      </div>
                      <p className="text-xs font-bold text-white">{currentLiveGame.awayTeam.name}</p>
                      <p className="text-2xl font-black text-white tabular-nums">{currentLiveGame.awayTeam.score}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                  <h3 className="text-lg font-bold text-white">{currentChannel.currentProgram}</h3>
                  <p className="text-xs text-slate-400 mt-1">{currentChannel.currentHostOrTeam}</p>
                  <p className="text-[11px] font-mono text-emerald-400 mt-2">{currentChannel.currentDuration}</p>
                </div>
              )}
            </div>

            {/* Top Overlay Bug: Channel Logo & Live Badge */}
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-slate-800 text-xs">
                <div className={`w-3 h-3 rounded-full ${currentChannel.logoBgColor}`} />
                <span className="font-bold text-white">{currentChannel.name}</span>
                <span className="text-[10px] font-mono text-slate-400">CH {currentChannel.channelNumber}</span>
              </div>

              {currentChannel.is4K && (
                <span className="px-2 py-1 rounded-lg bg-orange-600/90 text-white font-mono text-[10px] font-black tracking-wider uppercase shadow-md">
                  4K ULTRA HD
                </span>
              )}
            </div>

            {/* Top Right Quick Stats / Chat Toggles */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
              {currentLiveGame?.keyStats && (
                <button
                  onClick={() => setShowStatsOverlay(!showStatsOverlay)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
                    showStatsOverlay ? 'bg-orange-600 text-white font-bold' : 'bg-black/70 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                  title="Toggle live match statistics overlay"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Match Stats</span>
                </button>
              )}

              <button
                onClick={() => setShowChatSidebar(!showChatSidebar)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
                  showChatSidebar ? 'bg-purple-600 text-white font-bold' : 'bg-black/70 text-slate-300 hover:text-white border border-slate-800'
                }`}
                title="Toggle WebIRC live game chat (#fubotv-sports)"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">IRC Chat</span>
              </button>
            </div>

            {/* Bottom Scrubber & Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black via-black/80 to-transparent p-4 space-y-2">
              
              {/* Timeline Progress Bar */}
              <div className="relative w-full h-1.5 bg-slate-800/90 rounded-full cursor-pointer group">
                <div className="absolute top-0 left-0 h-full bg-orange-500 rounded-full w-full" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  <button
                    onClick={() => setPlaybackTimeOffset((prev) => prev - 15)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Rewind 15 seconds"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setPlaybackTimeOffset(0)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      playbackTimeOffset === 0
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Jump to live edge"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>LIVE</span>
                  </button>

                  {/* Volume Slider */}
                  <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                    <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white cursor-pointer">
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        setIsMuted(false);
                      }}
                      className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                </div>

                {/* Right Player Utilities */}
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  {/* Quality Selector */}
                  <select
                    value={videoQuality}
                    onChange={(e) => setVideoQuality(e.target.value as any)}
                    className="bg-black/60 border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="4K HDR">4K HDR (Switch 100G)</option>
                    <option value="1080p60">1080p60 Full HD</option>
                    <option value="720p60">720p60 Data Saver</option>
                  </select>

                  {/* DVR Record Button */}
                  <button
                    onClick={() =>
                      handleRecordProgram(
                        currentLiveGame
                          ? `${currentLiveGame.homeTeam.name} vs ${currentLiveGame.awayTeam.name}`
                          : currentChannel.currentProgram,
                        currentChannel.name
                      )
                    }
                    className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 hover:border-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Record this show to Cloud DVR"
                  >
                    <Circle className="w-2.5 h-2.5 fill-red-400 text-red-400" />
                    <span>REC</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!document.fullscreenElement && playerContainerRef.current) {
                        playerContainerRef.current.requestFullscreen?.();
                        setIsFullscreen(true);
                      } else {
                        document.exitFullscreen?.();
                        setIsFullscreen(false);
                      }
                    }}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Match Stats Slide-Over Overlay */}
            {showStatsOverlay && currentLiveGame?.keyStats && (
              <div className="absolute top-14 right-4 z-40 w-72 bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-2 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-orange-400" />
                    <span>Live Match Telemetry</span>
                  </span>
                  <button onClick={() => setShowStatsOverlay(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {currentLiveGame.keyStats.map((stat) => (
                    <div key={stat.label} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-white font-semibold">{stat.homeVal}</span>
                        <span>{stat.label}</span>
                        <span className="text-white font-semibold">{stat.awayVal}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full flex overflow-hidden">
                        <div className="h-full bg-orange-500" style={{ width: '55%' }} />
                        <div className="h-full bg-sky-500" style={{ width: '45%' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                  Powered by Switch SUPERNAP 100G Live Optical Telemetry
                </div>
              </div>
            )}

            {/* Live WebIRC Game Chat Overlay */}
            {showChatSidebar && (
              <div className="absolute top-14 right-4 z-40 w-80 bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-2 flex flex-col h-80 justify-between font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      <span>#fubotv-sports on irc.drfun1.com</span>
                    </span>
                    <button onClick={() => setShowChatSidebar(false)} className="text-slate-400 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-1 text-[11px]">
                    {chatMessages.map((m) => (
                      <div key={m.id} className="leading-tight">
                        <span className={`font-bold ${m.color}`}>{m.user}: </span>
                        <span className="text-slate-200">{m.text}</span>
                        <span className="text-slate-600 text-[9px] ml-1">{m.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSendChat} className="mt-2 pt-2 border-t border-slate-800 flex gap-1">
                  <input
                    type="text"
                    value={inputChat}
                    onChange={(e) => setInputChat(e.target.value)}
                    placeholder="Chat in #fubotv-sports..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder-slate-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-xs"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          3. TAB VIEW: HOME (FEATURED CAROUSELS & CHANNELS)
          ======================================================== */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Live Games Headline Ribbon */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Live Sports Happening Now</span>
              </h3>
              <button
                onClick={() => setActiveTab('sports')}
                className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View All Games</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {FUBO_LIVE_GAMES.slice(0, 3).map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleSelectLiveGame(game)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    currentLiveGame?.id === game.id
                      ? 'bg-slate-900 border-orange-500/60 shadow-lg shadow-orange-950/30 ring-1 ring-orange-500/30'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-orange-400 font-bold">{game.league}</span>
                    <span className="flex items-center gap-1 text-red-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span>{game.gameClock}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{game.homeTeam.name}</span>
                      <span className="text-base font-black text-white tabular-nums">{game.homeTeam.score}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{game.awayTeam.name}</span>
                      <span className="text-base font-black text-white tabular-nums">{game.awayTeam.score}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="truncate">{game.channelName}</span>
                    <span className="text-orange-400 font-bold">Watch Live ➔</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Channels Strip */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-orange-400" />
              <span>Popular Fubo TV Channels</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {FUBO_CHANNELS.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => handleSelectChannel(ch)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    currentChannel.id === ch.id
                      ? 'bg-orange-950/40 border-orange-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 font-bold">
                      CH {ch.channelNumber}
                    </span>
                    {ch.is4K && (
                      <span className="text-[9px] font-mono font-bold text-orange-400">4K HDR</span>
                    )}
                  </div>

                  <div>
                    <h5 className="font-bold text-sm text-white truncate">{ch.name}</h5>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{ch.currentProgram}</p>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
                    <span>{ch.callSign}</span>
                    <span className="text-emerald-400">{(ch.viewersCount / 1000).toFixed(0)}k live</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. TAB VIEW: SPORTS CENTER
          ======================================================== */}
      {activeTab === 'sports' && (
        <div className="space-y-6">
          {/* League Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            {([
              'All Sports',
              'NFL',
              'Premier League',
              'NBA',
              'UEFA Champions League',
              'MLB',
              'Formula 1',
              'NHL',
            ] as const).map((league) => (
              <button
                key={league}
                onClick={() => setSelectedSportLeague(league)}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedSportLeague === league
                    ? 'bg-orange-600 text-white shadow-md font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {league}
              </button>
            ))}
          </div>

          {/* Match Scoreboards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLiveGames.map((game) => (
              <div
                key={game.id}
                className={`bg-slate-950 border rounded-2xl p-4 shadow-xl space-y-3 transition-all ${
                  currentLiveGame?.id === game.id ? 'border-orange-500 ring-1 ring-orange-500/40' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-orange-400">{game.league}</span>
                  {game.status === 'live' ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-300 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      <span>{game.gameClock}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {game.gameClock}
                    </span>
                  )}
                </div>

                {/* Teams & Scores */}
                <div className="space-y-2 py-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: game.homeTeam.color }}>
                        {game.homeTeam.shortName}
                      </div>
                      <span className="font-bold text-white text-sm">{game.homeTeam.name}</span>
                    </div>
                    <span className="text-xl font-black text-white tabular-nums">{game.homeTeam.score}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: game.awayTeam.color }}>
                        {game.awayTeam.shortName}
                      </div>
                      <span className="font-bold text-white text-sm">{game.awayTeam.name}</span>
                    </div>
                    <span className="text-xl font-black text-white tabular-nums">{game.awayTeam.score}</span>
                  </div>
                </div>

                {/* Venue and Action buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-slate-500 text-[11px] truncate">{game.venue}</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRecordProgram(`${game.homeTeam.name} vs ${game.awayTeam.name}`, game.channelName)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                      title="Record game to Cloud DVR"
                    >
                      <Circle className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                    </button>

                    <button
                      onClick={() => handleSelectLiveGame(game)}
                      className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-md shadow-orange-900/30 cursor-pointer"
                    >
                      Watch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          5. TAB VIEW: GUIDE (EPG ELECTRONIC PROGRAM GUIDE)
          ======================================================== */}
      {activeTab === 'guide' && (
        <div className="space-y-4">
          {/* Guide Controls Bar */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
              {(['All', 'Sports', 'News', 'Entertainment', '4K Ultra HD', 'DrFun1 Networks'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedGuideCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    selectedGuideCategory === cat
                      ? 'bg-orange-600 text-white font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Guide */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={guideSearchQuery}
                onChange={(e) => setGuideSearchQuery(e.target.value)}
                placeholder="Search channels or shows..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Time Header Grid */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 bg-slate-900/90 border-b border-slate-800 p-3 text-xs font-mono font-bold text-slate-400">
              <div className="col-span-3 sm:col-span-2">Channel</div>
              <div className="col-span-9 sm:col-span-10 grid grid-cols-5 text-center">
                <span>Now (Live)</span>
                <span>+30 Min</span>
                <span>+60 Min</span>
                <span>+90 Min</span>
                <span>+120 Min</span>
              </div>
            </div>

            {/* Channel Schedule Rows */}
            <div className="divide-y divide-slate-800/80">
              {filteredGuideChannels.map((channel) => (
                <div key={channel.id} className="grid grid-cols-12 p-3 items-center hover:bg-slate-900/40 transition-colors">
                  {/* Channel Header Cell */}
                  <div 
                    onClick={() => handleSelectChannel(channel)}
                    className="col-span-3 sm:col-span-2 flex items-center gap-2 cursor-pointer group pr-2"
                  >
                    <div className={`w-3.5 h-3.5 rounded-full ${channel.logoBgColor} shrink-0`} />
                    <div className="truncate">
                      <div className="font-bold text-white text-xs group-hover:text-orange-400 transition-colors truncate">
                        {channel.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        CH {channel.channelNumber} &bull; {channel.callSign}
                      </div>
                    </div>
                  </div>

                  {/* Program Slots */}
                  <div className="col-span-9 sm:col-span-10 grid grid-cols-5 gap-1.5">
                    {channel.programsSchedule.map((prog, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (idx === 0) handleSelectChannel(channel);
                          else handleRecordProgram(prog.title, channel.name);
                        }}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          idx === 0
                            ? 'bg-orange-950/30 border-orange-500/40 text-orange-200 hover:bg-orange-900/40'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                        title={`${prog.title} (${prog.rating || 'TV-G'}) - Click to ${idx === 0 ? 'Watch' : 'Record'}`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                            <span className={idx === 0 ? 'text-red-400 font-bold' : ''}>{prog.timeSlot}</span>
                            {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
                          </div>
                          <p className="text-[11px] font-semibold truncate leading-tight">{prog.title}</p>
                        </div>

                        <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-slate-500">
                          <span>{prog.rating || 'TV-PG'}</span>
                          {idx === 0 ? (
                            <span className="text-orange-400 font-bold">Watch</span>
                          ) : (
                            <span className="text-slate-400 hover:text-red-400">REC</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. TAB VIEW: MULTI-VIEW (4-SCREEN LIVE MATRIX)
          ======================================================== */}
      {activeTab === 'multiview' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-500" />
                <span>Fubo 4-Screen Multi-View Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Watch 4 live games simultaneously. Click any quadrant to switch audio focus.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-orange-950 text-orange-300 border border-orange-500/40 font-bold">
                Active Audio: Screen #{multiViewActiveSlot + 1}
              </span>
            </div>
          </div>

          {/* 2x2 Video Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 aspect-video bg-black rounded-2xl p-2 border border-slate-800 shadow-2xl">
            {multiViewSlots.map((slot) => {
              const chan = FUBO_CHANNELS.find((c) => c.id === slot.channelId) || FUBO_CHANNELS[0];
              const isActiveAudio = multiViewActiveSlot === slot.slotId;
              return (
                <div
                  key={slot.slotId}
                  onClick={() => handleSetMultiViewAudioFocus(slot.slotId)}
                  className={`relative rounded-xl overflow-hidden bg-slate-950 border-2 transition-all cursor-pointer flex flex-col justify-between p-3 ${
                    isActiveAudio ? 'border-orange-500 shadow-lg shadow-orange-950/50' : 'border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Slot Top Meta */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-black/80 text-xs font-mono">
                      <span className="font-bold text-orange-400">Screen #{slot.slotId + 1}</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-white truncate max-w-[120px]">{chan.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isActiveAudio ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Volume2 className="w-3 h-3 text-emerald-400" />
                          <span>AUDIO ON</span>
                        </span>
                      ) : (
                        <span className="p-1 rounded bg-black/60 text-slate-500">
                          <VolumeX className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center Content Placeholder */}
                  <div className="text-center space-y-1 my-auto">
                    <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white font-bold" style={{ backgroundColor: chan.accentColor }}>
                      <Tv className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-white">{chan.currentProgram}</p>
                    <p className="text-[10px] text-slate-400">{chan.currentHostOrTeam}</p>
                  </div>

                  {/* Channel Switcher Dropdown */}
                  <div className="z-10 flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800">
                    <span className="text-emerald-400 font-bold">CH {chan.channelNumber}</span>
                    <select
                      value={slot.channelId}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSetMultiViewSlotChannel(slot.slotId, e.target.value);
                      }}
                      className="bg-black/80 border border-slate-700 rounded px-2 py-0.5 text-slate-200 text-[10px] outline-none"
                    >
                      {FUBO_CHANNELS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          7. TAB VIEW: MY STUFF / CLOUD DVR
          ======================================================== */}
      {activeTab === 'dvr' && (
        <div className="space-y-6">
          {/* Cloud DVR Storage Quota Bar */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-950/60 via-slate-900 to-slate-950 border border-orange-500/40 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-600/20 border border-orange-500/40 text-orange-400">
                  <DownloadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Fubo Cloud DVR Storage</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Record games, series, and live tournaments with zero expiration and multi-device access.
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <span className="text-lg font-bold text-white tabular-nums">{dvrHoursUsed}</span>
                <span className="text-slate-400"> / 1,000 Hours Used</span>
                <p className="text-[10px] text-emerald-400">{1000 - dvrHoursUsed} Hours Remaining</p>
              </div>
            </div>

            {/* Quota Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (dvrHoursUsed / 1000) * 100)}%` }}
              />
            </div>
          </div>

          {/* Recordings Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-orange-400" />
                <span>Recorded Games &amp; Shows ({dvrRecordings.length})</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {dvrRecordings.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-950 border border-slate-800 hover:border-orange-500/50 rounded-xl overflow-hidden shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={rec.thumbnail}
                      alt={rec.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-orange-300 border border-slate-800">
                      {rec.durationMinutes} min
                    </span>

                    <button
                      onClick={() => {
                        handleRecordProgram(rec.title, rec.channelName);
                        setActiveTab('home');
                      }}
                      className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-orange-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      title="Play Recording"
                    >
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </button>
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                        <span>{rec.channelName}</span>
                        <span>{rec.recordedAt}</span>
                      </div>
                      <h5 className="font-bold text-xs text-white line-clamp-1">{rec.title}</h5>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{rec.subtitle}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-[10px] text-slate-500">{rec.fileSizeGb} GB</span>
                      <button
                        onClick={() => handleDeleteRecording(rec.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Delete recording"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          8. FOOTER COMPLIANCE & ESCROW NOTICE
          ======================================================== */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Fubo.tv Sports Playout Infrastructure &bull; Licensed to Richard Alan Witt (www.wittlawfirm.com)</span>
        </div>
        <div className="flex items-center gap-3">
          <span>FCC FRN: 0034981290</span>
          <span>&bull;</span>
          <span>Switch SUPERNAP 100G CDN</span>
        </div>
      </div>
    </div>
  );
};
