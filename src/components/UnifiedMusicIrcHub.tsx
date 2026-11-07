/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * UNIFIED MUSIC HUB & IRC CLIENT
 * Integrates all Music Pages & IRC Clients into ONE unified workstation:
 * - YouTube Music Library & Playlists (855,000 Channels Catalog)
 * - donSchoe/shoutcast-irc.git Bot Roster & Announcer Engine
 * - MPD DJ Deck / Live Audio Playout & Crossfader
 * - Synchronized Music IRC Client for #music-deathrow, #artist-*, #genre-*, #label-*
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Radio,
  Terminal,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Disc,
  Headphones,
  Sliders,
  Users,
  Search,
  Hash,
  Send,
  Zap,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  ListMusic,
  Mic,
  MicOff,
  Flame,
  Globe,
  X
} from 'lucide-react';
import {
  YOUTUBE_MUSIC_TRACKS,
  YOUTUBE_MUSIC_PLAYLISTS,
  MUSIC_GENRE_CATEGORIES,
  RECORD_LABEL_CATEGORIES,
  ARTIST_CATEGORIES,
  BOT_MUSIC_ROSTER,
  YouTubeMusicTrack,
  BotMusicAgent
} from '../data/shoutcastMusicLibraryData';
import { IrcMessage, IrcUser, IrcLoginSession } from '../types/irc';

interface UnifiedMusicIrcHubProps {
  ircSession: IrcLoginSession;
  onUpdateSession?: (newSession: Partial<IrcLoginSession>) => void;
  activeServer?: string;
  onJoinExternalChannel?: (channel: string) => void;
  isModalView?: boolean;
  onCloseModal?: () => void;
}

export const UnifiedMusicIrcHub: React.FC<UnifiedMusicIrcHubProps> = ({
  ircSession,
  onUpdateSession,
  activeServer = 'dev.drfun1media.com',
  onJoinExternalChannel,
  isModalView = false,
  onCloseModal,
}) => {
  // Navigation tabs within Music Hub
  const [activeCatalogTab, setActiveCatalogTab] = useState<'tracks' | 'genres' | 'artists' | 'labels' | 'bots' | 'dj_console'>('tracks');

  // Currently playing track
  const [currentTrack, setCurrentTrack] = useState<YouTubeMusicTrack>(YOUTUBE_MUSIC_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [trackProgress, setTrackProgress] = useState<number>(35); // percentage
  const [isOnAir, setIsOnAir] = useState<boolean>(true);
  const [crossfaderPosition, setCrossfaderPosition] = useState<number>(50); // 0 = Deck A (YouTube), 100 = Deck B (SHOUTcast)
  const [isMicActive, setIsMicActive] = useState<boolean>(false);

  // Music IRC Client State
  const [activeMusicChannel, setActiveMusicChannel] = useState<string>(currentTrack.ircChannel || '#music-deathrow');
  const [musicChatInput, setMusicChatInput] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Music Chat Messages (synced with bot announcements)
  const [messages, setMessages] = useState<Record<string, IrcMessage[]>>(() => ({
    '#music-deathrow': [
      {
        id: 'msg_init_1',
        timestamp: '12:00:01',
        sender: '***',
        channel: '#music-deathrow',
        content: `Topic for #music-deathrow: Official Death Row Records Vault | Curated by Richard Alan Witt & DJ Orbit Nova | donSchoe/shoutcast-irc bot active | 320 kbps MP3 / Dolby Atmos | Part of 855,000 Channels Mesh`,
        type: 'system',
      },
      {
        id: 'msg_init_2',
        timestamp: '12:00:15',
        sender: 'ShoutcastBot',
        channel: '#music-deathrow',
        content: `[SHOUTcast D.N.A.] Now Playing: Dr. Dre ft. Snoop Dogg - Still D.R.E. [Death Row Records / Aftermath 1999] [4:30] (Bitrate: 320 kbps MP3) [Listeners: 48,290] (Audio: Dolby Atmos 48kHz Stereo)`,
        type: 'notice',
      },
      {
        id: 'msg_init_3',
        timestamp: '12:01:20',
        sender: 'DJ_OrbitNova',
        channel: '#music-deathrow',
        content: `Welcome to the Unified Music Hub! Broadcasting across all 855,000 channels with 26 Switch SUPERNAP leaves. Use .np for track title or .listeners for count!`,
        type: 'message',
      },
      {
        id: 'msg_init_4',
        timestamp: '12:02:00',
        sender: 'VinylKev',
        channel: '#music-deathrow',
        content: `Next up on the turntable: 2Pac - California Love and Snoop Dogg - Drop It Like It's Hot. Request queue is open!`,
        type: 'message',
      },
    ],
    '#artist-snoopdogg': [
      {
        id: 'msg_sd_1',
        timestamp: '12:00:05',
        sender: '***',
        channel: '#artist-snoopdogg',
        content: `Topic: Snoop Dogg Doggystyle / Death Row Master Channel | 43,900 Listeners | donSchoe/shoutcast-irc active`,
        type: 'system',
      },
      {
        id: 'msg_sd_2',
        timestamp: '12:00:30',
        sender: 'ShoutcastBot',
        channel: '#artist-snoopdogg',
        content: `[SHOUTcast] Now Playing: Snoop Dogg ft. Pharrell Williams - Drop It Like It's Hot [320 kbps MP3]`,
        type: 'notice',
      },
    ],
    '#artist-2pac': [
      {
        id: 'msg_2pac_1',
        timestamp: '12:00:10',
        sender: '***',
        channel: '#artist-2pac',
        content: `Topic: 2Pac All Eyez on Me / Makaveli Master Catalog | 52,410 Listeners | Hi-Res Lossless 24-bit 96kHz`,
        type: 'system',
      },
      {
        id: 'msg_2pac_2',
        timestamp: '12:00:45',
        sender: 'VinylKev',
        channel: '#artist-2pac',
        content: `[SHOUTcast] Now Playing: 2Pac ft. Dr. Dre & Roger Troutman - California Love [Death Row Records 1996]`,
        type: 'notice',
      },
    ],
    '#genre-synthwave': [
      {
        id: 'msg_synth_1',
        timestamp: '12:00:02',
        sender: '***',
        channel: '#genre-synthwave',
        content: `Topic: Space Synthwave & Cyberwave 24/7 Playout | 95,000 Synced Fanout Channels | Bot: SynthWave Runner`,
        type: 'system',
      },
      {
        id: 'msg_synth_2',
        timestamp: '12:01:00',
        sender: 'SynthWave_Runner',
        channel: '#genre-synthwave',
        content: `[SHOUTcast] Now Playing: GUNSHIP - Tech Noir [Space Synthwave Odyssey 2026] [Listeners: 41,200]`,
        type: 'notice',
      },
    ],
    '#genre-lofi-space': [
      {
        id: 'msg_lofi_1',
        timestamp: '12:00:08',
        sender: '***',
        channel: '#genre-lofi-space',
        content: `Topic: Orbital Lo-Fi Beats & Deep Space Downtempo | 130,000 Synced Channels | 64,200 Listeners`,
        type: 'system',
      },
      {
        id: 'msg_lofi_2',
        timestamp: '12:01:10',
        sender: 'LoFi_ChillBot',
        channel: '#genre-lofi-space',
        content: `[SHOUTcast] Now Playing: Lofi Orbital Chill - Space Walk Beats [320 kbps / Relax]`,
        type: 'notice',
      },
    ],
    '#label-deathrow': [
      {
        id: 'msg_ldr_1',
        timestamp: '12:00:04',
        sender: '***',
        channel: '#label-deathrow',
        content: `Topic: Death Row Records Master Audio Vault | Catalog: 1,450+ Master Tapes | All 855k Leaves Synced`,
        type: 'system',
      },
    ],
  }));

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, activeMusicChannel]);

  // Handle Copy
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  // Switch Track & Tune IRC Channel
  const handleSelectTrack = (track: YouTubeMusicTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (track.ircChannel && track.ircChannel !== activeMusicChannel) {
      handleSwitchMusicChannel(track.ircChannel);
    }
  };

  // Switch Active Music IRC Channel
  const handleSwitchMusicChannel = (chan: string) => {
    let cleanChan = chan.trim();
    if (!cleanChan.startsWith('#')) cleanChan = `#${cleanChan}`;
    setActiveMusicChannel(cleanChan);

    if (onJoinExternalChannel) {
      onJoinExternalChannel(cleanChan);
    }

    // If channel doesn't have messages yet, seed it with welcoming topic
    setMessages((prev) => {
      if (prev[cleanChan]) return prev;
      return {
        ...prev,
        [cleanChan]: [
          {
            id: `msg_seed_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            sender: '***',
            channel: cleanChan,
            content: `Now talking on ${cleanChan} (UnrealIRCd 6.1.4 Synced Leaf Mesh | donSchoe/shoutcast-irc bot active)`,
            type: 'system',
          },
        ],
      };
    });
  };

  // Execute Bot Dot Commands (.np, .song, .dj, .listeners, etc.)
  const handleRunBotCommand = (cmd: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const cleanCmd = cmd.toLowerCase().trim();

    // User's command message
    const userMsg: IrcMessage = {
      id: `cmd_user_${Date.now()}`,
      timestamp: timeStr,
      sender: ircSession.nick || 'GuestMusicOper',
      channel: activeMusicChannel,
      content: cmd,
      type: 'message',
    };

    let botResponse = '';
    if (cleanCmd === '.np' || cleanCmd === '.song') {
      botResponse = `[SHOUTcast D.N.A.] Now Playing: ${currentTrack.artist} - ${currentTrack.title} [${currentTrack.label} ${currentTrack.releaseYear}] (${currentTrack.duration}) [Bitrate: ${currentTrack.bitrate}] [Audio: ${currentTrack.audioFormat}] (DJ: ${currentTrack.dj})`;
    } else if (cleanCmd === '.dj') {
      botResponse = `[SHOUTcast DJ] Live On-Air Host: ${currentTrack.dj} | Turntable Deck A: YouTube Music Library | Deck B: donSchoe/shoutcast-irc Engine | Colocation: Switch SUPERNAP Las Vegas Core`;
    } else if (cleanCmd === '.listeners') {
      botResponse = `[SHOUTcast Stats] Channel ${activeMusicChannel}: ${currentTrack.listeners.toLocaleString()} Active Listeners | Global 855k Network Synced: 8,838 Dedicated Users & 26 Switch SUPERNAP Leaves Synced`;
    } else if (cleanCmd === '.stream') {
      botResponse = `[SHOUTcast Mount] Direct Optical Stream: https://stream.drfun1.com/shoutcast/${activeMusicChannel.replace('#', '')}.mp3 (320 kbps Constant Bitrate / 48kHz Stereo)`;
    } else if (cleanCmd === '.queue') {
      botResponse = `[SHOUTcast Queue] Upcoming Tracks: 1. 2Pac - California Love | 2. Snoop Dogg - Drop It Like It's Hot | 3. Eminem - Lose Yourself | 4. Dr. Dre - The Next Episode`;
    } else if (cleanCmd === '.skip') {
      botResponse = `[SHOUTcast Bot] Skipping to next track in playlist... Crossfading Deck A...`;
      handleNextTrack();
    } else {
      botResponse = `[donSchoe/shoutcast-irc Bot] Command executed: ${cmd}. Active playlist: ${currentTrack.album} (${currentTrack.genre}).`;
    }

    const botMsg: IrcMessage = {
      id: `cmd_bot_${Date.now()}`,
      timestamp: timeStr,
      sender: 'ShoutcastBot',
      channel: activeMusicChannel,
      content: botResponse,
      type: 'notice',
    };

    setMessages((prev) => ({
      ...prev,
      [activeMusicChannel]: [...(prev[activeMusicChannel] || []), userMsg, botMsg],
    }));
  };

  // Next Track
  const handleNextTrack = () => {
    const currentIdx = YOUTUBE_MUSIC_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = (currentIdx + 1) % YOUTUBE_MUSIC_TRACKS.length;
    handleSelectTrack(YOUTUBE_MUSIC_TRACKS[nextIdx]);
  };

  // Previous Track
  const handlePrevTrack = () => {
    const currentIdx = YOUTUBE_MUSIC_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (currentIdx - 1 + YOUTUBE_MUSIC_TRACKS.length) % YOUTUBE_MUSIC_TRACKS.length;
    handleSelectTrack(YOUTUBE_MUSIC_TRACKS[prevIdx]);
  };

  // Send Chat Message
  const handleSendMusicMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = musicChatInput.trim();
    if (!text) return;

    if (text.startsWith('.')) {
      handleRunBotCommand(text);
      setMusicChatInput('');
      return;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Handle slash commands
    if (text.startsWith('/')) {
      const parts = text.slice(1).split(' ');
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1).join(' ');

      if (cmd === 'join') {
        if (args) handleSwitchMusicChannel(args);
        setMusicChatInput('');
        return;
      }

      if (cmd === 'clear') {
        setMessages((prev) => ({ ...prev, [activeMusicChannel]: [] }));
        setMusicChatInput('');
        return;
      }

      if (cmd === 'stats') {
        const statsMsg: IrcMessage = {
          id: `stats_${Date.now()}`,
          timestamp: timeStr,
          sender: '***',
          channel: activeMusicChannel,
          content: `[STATS UnrealIRCd 6.1.4] Music Network: 855,000 Channels Synced across 26 Switch SUPERNAP Leaves | Master Hub: irc.drfun1.com:6697 (SID 001) | Transit: RisingNet 100G Optical DWDM | Bot: donSchoe/shoutcast-irc.git`,
          type: 'notice',
        };
        setMessages((prev) => ({
          ...prev,
          [activeMusicChannel]: [...(prev[activeMusicChannel] || []), statsMsg],
        }));
        setMusicChatInput('');
        return;
      }
    }

    const newMsg: IrcMessage = {
      id: `msg_${Date.now()}`,
      timestamp: timeStr,
      sender: ircSession.nick || 'GuestMusicOper',
      channel: activeMusicChannel,
      content: text,
      type: 'message',
    };

    setMessages((prev) => ({
      ...prev,
      [activeMusicChannel]: [...(prev[activeMusicChannel] || []), newMsg],
    }));

    setMusicChatInput('');
  };

  // Filtered tracks
  const filteredTracks = YOUTUBE_MUSIC_TRACKS.filter(
    (t) =>
      !catalogSearch ||
      t.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      t.artist.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      t.label.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      t.genre.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className={`flex flex-col bg-slate-950 text-slate-100 ${isModalView ? 'max-h-[92vh] overflow-hidden rounded-2xl border border-slate-800 shadow-2xl' : 'w-full'}`}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER & TELEMETRY STRIP                          */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-pink-950/30 to-purple-950/40 border-b border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-pink-500/20 text-white">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-wide bg-gradient-to-r from-white via-pink-200 to-purple-300 bg-clip-text text-transparent">
                DRFUN1 MEDIA UNIFIED MUSIC HUB &amp; IRC CLIENT
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-pink-500/20 text-pink-300 border border-pink-500/40 rounded-md">
                855,000 Channels
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-md hidden sm:inline">
                YouTube Music &bull; SHOUTcast D.N.A.
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by <span className="text-pink-400 font-mono font-semibold">donSchoe/shoutcast-irc.git</span> &bull; Master Hub: <span className="text-emerald-400 font-mono">irc.drfun1.com:6697</span> &bull; Licensee: Richard Alan Witt (FRN 0034981290)
            </p>
          </div>
        </div>

        {/* Top Actions & Close (if modal) */}
        <div className="flex items-center gap-2">
          {/* Active Bot Count Badge */}
          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-semibold">7 Bots Online</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-pink-400 font-bold">{currentTrack.listeners.toLocaleString()} Listeners</span>
          </div>

          {isModalView && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition cursor-pointer"
              title="Close Music Hub"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MASTER MUSIC PLAYER & DJ CONSOLE STRIP                */}
      {/* ======================================================== */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Now Playing Metadata */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 p-0.5 shadow-md shadow-pink-900/30 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <Disc className={`w-6 h-6 text-pink-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase">
                  NOW PLAYING
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>320 kbps MP3</span>
                </span>
                <span className="text-[10px] font-mono text-purple-300">
                  {currentTrack.audioFormat}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white truncate mt-0.5">
                {currentTrack.title} &bull; <span className="text-pink-300 font-semibold">{currentTrack.artist}</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                Album: {currentTrack.album} ({currentTrack.releaseYear}) &bull; Label: {currentTrack.label} &bull; DJ: {currentTrack.dj}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-3 justify-center shrink-0">
            <button
              onClick={handlePrevTrack}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl shadow-md shadow-pink-500/30 transition cursor-pointer"
              title={isPlaying ? 'Pause Music' : 'Play Music'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={handleNextTrack}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-20 accent-pink-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Right: DJ Console Controls (On-Air, Mic, Crossfader) */}
          <div className="flex flex-wrap items-center gap-2 justify-end shrink-0 text-xs font-mono">
            <button
              onClick={() => setIsOnAir(!isOnAir)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isOnAir
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40 animate-pulse'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isOnAir ? 'ON-AIR LIVE' : 'BOOTH PREVIEW'}</span>
            </button>

            <button
              onClick={() => setIsMicActive(!isMicActive)}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                isMicActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle DJ Talkover Microphone Ducking"
            >
              {isMicActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>{isMicActive ? 'MIC LIVE' : 'MIC MUTE'}</span>
            </button>

            {/* Quick Bot .np Trigger Button */}
            <button
              onClick={() => handleRunBotCommand('.np')}
              className="px-2.5 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-lg transition cursor-pointer shadow-sm"
              title="Announce Current YouTube Music Track into IRC Chat (.np)"
            >
              <span>Broadcast .np</span>
            </button>
          </div>
        </div>

        {/* Track Progress Bar */}
        <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span>1:34</span>
          <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden cursor-pointer">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
              style={{ width: `${trackProgress}%` }}
            />
          </div>
          <span>{currentTrack.duration}</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN WORKSTATION: DUAL PANE (CATALOG + MUSIC IRC)    */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-[520px] bg-slate-950">
        {/* Left Column: YouTube Music Catalogs & DJ Tools */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800/80 min-w-0">
          {/* Catalog Tab Switcher */}
          <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-bold">
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => setActiveCatalogTab('tracks')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  activeCatalogTab === 'tracks'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Music className="w-3.5 h-3.5 text-pink-300" />
                <span>Tracks ({YOUTUBE_MUSIC_TRACKS.length})</span>
              </button>

              <button
                onClick={() => setActiveCatalogTab('genres')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  activeCatalogTab === 'genres'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-purple-300" />
                <span>Genres (855k)</span>
              </button>

              <button
                onClick={() => setActiveCatalogTab('artists')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  activeCatalogTab === 'artists'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Headphones className="w-3.5 h-3.5 text-sky-300" />
                <span>Artists ({ARTIST_CATEGORIES.length})</span>
              </button>

              <button
                onClick={() => setActiveCatalogTab('labels')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  activeCatalogTab === 'labels'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Disc className="w-3.5 h-3.5 text-amber-300" />
                <span>Record Labels</span>
              </button>

              <button
                onClick={() => setActiveCatalogTab('bots')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  activeCatalogTab === 'bots'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-300" />
                <span>Bots Roster ({BOT_MUSIC_ROSTER.length})</span>
              </button>
            </div>

            {/* Filter Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search tracks, artists, labels..."
                className="bg-slate-950 text-white text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-700/80 focus:outline-none focus:border-pink-500 w-44 sm:w-56"
              />
            </div>
          </div>

          {/* Catalog Content Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 max-h-[500px]">
            {/* TAB 1: YOUTUBE MUSIC TRACKS */}
            {activeCatalogTab === 'tracks' && (
              <div className="space-y-2">
                {filteredTracks.map((track) => {
                  const isCurrent = currentTrack.id === track.id;

                  return (
                    <div
                      key={track.id}
                      onClick={() => handleSelectTrack(track)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-pink-950/40 border-pink-500/80 shadow-md ring-1 ring-pink-500/40'
                          : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          className={`p-2 rounded-lg text-white shrink-0 ${
                            isCurrent && isPlaying ? 'bg-pink-600 animate-pulse' : 'bg-slate-800 hover:bg-pink-600'
                          }`}
                        >
                          {isCurrent && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm truncate">{track.title}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                              {track.ircChannel}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 truncate font-mono">
                            {track.artist} &bull; {track.album} ({track.releaseYear})
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {track.label} &bull; {track.bitrate} &bull; {track.audioFormat}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono text-xs space-y-1">
                        <span className="text-emerald-400 font-bold block">{track.listeners.toLocaleString()} Listeners</span>
                        <span className="text-slate-400 text-[11px] block">{track.duration}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwitchMusicChannel(track.ircChannel);
                          }}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-purple-600 text-purple-300 hover:text-white rounded text-[10px] transition"
                        >
                          Join {track.ircChannel}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: MUSIC GENRES (855,000 CHANNELS) */}
            {activeCatalogTab === 'genres' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MUSIC_GENRE_CATEGORIES.map((genre) => (
                  <div
                    key={genre.id}
                    className="p-3.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-pink-500/60 rounded-xl space-y-2.5 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                          {genre.channelPrefix}
                        </span>
                        <h4 className="text-sm font-black text-white mt-1">{genre.name}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-pink-400">
                        {genre.channelCount.toLocaleString()} Chans
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {genre.description}
                    </p>

                    <div className="text-[11px] font-mono text-slate-400">
                      <span>Top Artists: </span>
                      <span className="text-slate-200">{genre.topArtists.join(', ')}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {genre.activeListeners.toLocaleString()} Listeners
                      </span>

                      <button
                        onClick={() => handleSwitchMusicChannel(genre.channelPrefix)}
                        className="px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs font-bold rounded-lg transition cursor-pointer"
                      >
                        Tune &amp; Join IRC
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: ARTISTS */}
            {activeCatalogTab === 'artists' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ARTIST_CATEGORIES.map((artist) => (
                  <div
                    key={artist.id}
                    className="p-3.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/60 rounded-xl space-y-2 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-black text-white">{artist.artistName}</h4>
                        <span className="text-[10px] font-mono text-pink-400">{artist.genre} &bull; {artist.label}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {artist.activeListeners.toLocaleString()} Listeners
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-mono">
                      Channel: <span className="text-purple-300 font-bold">{artist.channelName}</span> ({artist.channelCount.toLocaleString()} Sub-Chans)
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {artist.popularTracks[0]}
                      </span>
                      <button
                        onClick={() => handleSwitchMusicChannel(artist.channelName)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-lg transition cursor-pointer"
                      >
                        Tune {artist.channelName}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: RECORD LABELS */}
            {activeCatalogTab === 'labels' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {RECORD_LABEL_CATEGORIES.map((label) => (
                  <div
                    key={label.id}
                    className="p-3.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-xl space-y-2 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-black text-white">{label.labelName}</h4>
                        <span className="text-[10px] font-mono text-amber-400">{label.headquarters} &bull; Founded {label.founded}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {label.activeListeners.toLocaleString()} Listeners
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-mono">
                      Master Vault: <span className="text-purple-300 font-bold">{label.channelName}</span> ({label.channelCount.toLocaleString()} Channels)
                    </p>

                    <p className="text-[10px] text-slate-400 font-mono line-clamp-1">
                      {label.licensingNotice}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-amber-300 font-mono">
                        {label.catalogSize}
                      </span>
                      <button
                        onClick={() => handleSwitchMusicChannel(label.channelName)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold rounded-lg transition cursor-pointer"
                      >
                        Enter Vault IRC
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: BOTS ROSTER */}
            {activeCatalogTab === 'bots' && (
              <div className="space-y-2.5">
                <div className="p-3 bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/30 rounded-xl text-xs font-mono text-slate-300">
                  <span className="text-purple-300 font-bold">donSchoe/shoutcast-irc.git Bot Mesh:</span> 7 Automated SHOUTcast Announcer bots continuously streaming YouTube Music metadata across all 855,000 channels linked to irc.drfun1.com:6697 (SID 001).
                </div>

                {BOT_MUSIC_ROSTER.map((bot) => (
                  <div
                    key={bot.botNick}
                    className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-950 border border-purple-800 rounded-lg text-pink-400">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{bot.botNick}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {bot.status}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] block">{bot.specialization}</span>
                        <span className="text-purple-300 text-[10px] block">Channel Focus: {bot.channelFocus} &bull; {bot.channelsCount.toLocaleString()} Channels</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[10px] text-slate-400 block">Uptime: {bot.uptime}</span>
                      <button
                        onClick={() => handleRunBotCommand('.np')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-pink-300 hover:text-white rounded text-[11px] transition cursor-pointer"
                      >
                        Query .np
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Synced Music IRC Client */}
        <div className="w-full lg:w-[460px] flex flex-col bg-slate-950 shrink-0">
          {/* IRC Client Header */}
          <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-pink-400" />
              <span className="font-bold text-white">{activeMusicChannel}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                {currentTrack.listeners.toLocaleString()} Online
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-emerald-400 font-semibold">{activeServer}:6697</span>
            </div>
          </div>

          {/* Quick Bot Dot Commands Bar */}
          <div className="bg-slate-900/60 border-b border-slate-800 px-3 py-1.5 flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500 text-[10px] uppercase mr-1">Bot Commands:</span>
            {['.np', '.song', '.dj', '.listeners', '.stream', '.queue', '.skip'].map((c) => (
              <button
                key={c}
                onClick={() => handleRunBotCommand(c)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white rounded text-[11px] transition cursor-pointer font-bold"
              >
                {c}
              </button>
            ))}
          </div>

          {/* Live Chat Message Stream */}
          <div
            ref={chatScrollRef}
            className="flex-1 p-3 overflow-y-auto space-y-2 text-xs font-mono select-text bg-slate-950/90 min-h-[300px] max-h-[380px]"
          >
            {(messages[activeMusicChannel] || []).map((msg) => (
              <div key={msg.id} className="leading-snug break-words">
                <span className="text-slate-600 text-[10px] select-none mr-1.5">[{msg.timestamp}]</span>
                {msg.type === 'system' && (
                  <span className="text-amber-400 italic font-semibold">{msg.content}</span>
                )}
                {msg.type === 'notice' && (
                  <span className="text-pink-300 font-medium">{msg.content}</span>
                )}
                {msg.type === 'message' && (
                  <>
                    <span className="text-purple-300 font-bold">&lt;{msg.sender}&gt; </span>
                    <span className="text-slate-200">{msg.content}</span>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800">
            <form onSubmit={handleSendMusicMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={musicChatInput}
                onChange={(e) => setMusicChatInput(e.target.value)}
                placeholder={`Chat in ${activeMusicChannel} or type .np, .song, .dj...`}
                className="flex-1 bg-slate-950 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-pink-500 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg transition font-mono text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
