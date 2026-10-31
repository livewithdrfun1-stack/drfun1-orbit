import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MpdBotInstance, 
  MpdTrack, 
  IrcDuplicatorMessage, 
  MpdBotCategory 
} from '../types/mpdBot';
import { 
  INITIAL_MPD_BOT_INSTANCES, 
  INITIAL_DUPLICATOR_LOGS, 
  GITHUB_MPD_REPO 
} from '../data/mpdBotData';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle, 
  Disc, 
  Radio, 
  Server, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Activity, 
  Share2, 
  Layers, 
  Sliders, 
  MessageSquare, 
  ArrowRight, 
  Wifi, 
  Flame, 
  Music, 
  Sparkles, 
  Send,
  RefreshCw,
  GitBranch,
  ShieldCheck,
  Headphones
} from 'lucide-react';

import { MpdDjControlPanel } from './MpdDjControlPanel';

interface MpdBotControlViewProps {
  onOpenIrc?: () => void;
  onOpenBroadcast?: () => void;
  onOpenDuplicator?: () => void;
}

export const MpdBotControlView: React.FC<MpdBotControlViewProps> = ({
  onOpenIrc,
  onOpenBroadcast,
  onOpenDuplicator
}) => {
  // Primary View Mode: DJ Booth, MPD Deck, Chat Duplicator, or Fleet
  const [viewMode, setViewMode] = useState<'dj_booth' | 'mpd_deck' | 'duplicator' | 'fleet'>('dj_booth');

  // State for all MPD bot instances
  const [bots, setBots] = useState<MpdBotInstance[]>(INITIAL_MPD_BOT_INSTANCES);
  const [selectedBotId, setSelectedBotId] = useState<string>(INITIAL_MPD_BOT_INSTANCES[0].id);
  const [categoryFilter, setCategoryFilter] = useState<'all' | MpdBotCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Duplicator live logs state
  const [duplicatorLogs, setDuplicatorLogs] = useState<IrcDuplicatorMessage[]>(INITIAL_DUPLICATOR_LOGS);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatTarget, setChatTarget] = useState<string>('#all-music');
  const [isDuplicatorPaused, setIsDuplicatorPaused] = useState<boolean>(false);
  const [copiedRepo, setCopiedRepo] = useState<boolean>(false);
  const [showAddTrackModal, setShowAddTrackModal] = useState<boolean>(false);
  const [newTrackTitle, setNewTrackTitle] = useState<string>('');
  const [newTrackArtist, setNewTrackArtist] = useState<string>('');
  const [newTrackAlbum, setNewTrackAlbum] = useState<string>('');

  // Currently active bot
  const activeBot = useMemo(() => {
    return bots.find(b => b.id === selectedBotId) || bots[0];
  }, [bots, selectedBotId]);

  // Audio Context and Synthesizer for live simulated playback
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const subOscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const vuCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Web Audio synthesizer
  useEffect(() => {
    if (!activeBot.isPlaying) {
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.05);
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Cleanup prior nodes
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); oscillatorRef.current.disconnect(); } catch (_) {}
      }
      if (subOscRef.current) {
        try { subOscRef.current.stop(); subOscRef.current.disconnect(); } catch (_) {}
      }
      if (gainNodeRef.current) {
        try { gainNodeRef.current.disconnect(); } catch (_) {}
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.setTargetAtTime((activeBot.volume / 100) * 0.22, ctx.currentTime, 0.08);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);

      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();

      // Configure waveform based on audio genre
      if (activeBot.audioSimType === 'hiphop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(activeBot.audioSimFreq, ctx.currentTime);
        sub.type = 'sine';
        sub.frequency.setValueAtTime(activeBot.audioSimFreq / 2, ctx.currentTime);
      } else if (activeBot.audioSimType === 'synthwave') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(activeBot.audioSimFreq, ctx.currentTime);
        sub.type = 'sawtooth';
        sub.frequency.setValueAtTime(activeBot.audioSimFreq * 1.5, ctx.currentTime);
      } else if (activeBot.audioSimType === 'jazz') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(activeBot.audioSimFreq, ctx.currentTime);
        sub.type = 'triangle';
        sub.frequency.setValueAtTime(activeBot.audioSimFreq / 2, ctx.currentTime);
      } else if (activeBot.audioSimType === 'electronic') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(activeBot.audioSimFreq, ctx.currentTime);
        sub.type = 'sine';
        sub.frequency.setValueAtTime(activeBot.audioSimFreq / 2, ctx.currentTime);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(activeBot.audioSimFreq, ctx.currentTime);
        sub.type = 'sine';
        sub.frequency.setValueAtTime(activeBot.audioSimFreq * 0.75, ctx.currentTime);
      }

      osc.connect(filter);
      sub.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc.start();
      sub.start();

      oscillatorRef.current = osc;
      subOscRef.current = sub;
      filterNodeRef.current = filter;
      gainNodeRef.current = masterGain;
    } catch (e) {
      // AudioContext policy
    }

    return () => {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); oscillatorRef.current.disconnect(); } catch (_) {}
      }
      if (subOscRef.current) {
        try { subOscRef.current.stop(); subOscRef.current.disconnect(); } catch (_) {}
      }
      if (gainNodeRef.current) {
        try { gainNodeRef.current.disconnect(); } catch (_) {}
      }
    };
  }, [activeBot.id, activeBot.isPlaying, activeBot.volume, activeBot.audioSimType, activeBot.audioSimFreq]);

  // VU Meter & Vinyl Oscilloscope Animation
  useEffect(() => {
    const canvas = vuCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (activeBot.isPlaying) {
        phase += 0.08;
        const bars = 32;
        const barWidth = canvas.width / bars;

        for (let i = 0; i < bars; i++) {
          const height = Math.abs(Math.sin(phase + i * 0.35)) * (canvas.height * 0.85) + 4;
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#10b981');
          gradient.addColorStop(0.6, '#38bdf8');
          gradient.addColorStop(1, '#a855f7');
          ctx.fillStyle = gradient;
          ctx.fillRect(i * barWidth + 1, canvas.height - height, barWidth - 2, height);
        }
      } else {
        // Idle flat line
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [activeBot.isPlaying]);

  // Periodic Playhead & Automatic IRC Song Announcement Duplication
  useEffect(() => {
    const interval = setInterval(() => {
      setBots(prevBots => prevBots.map(b => {
        if (!b.isPlaying) return b;
        let newElapsed = b.elapsedSeconds + 1;
        if (newElapsed >= b.nowPlaying.duration) {
          // Track ended, shift from queue or loop
          if (b.queue.length > 0) {
            const nextTrack = b.queue[0];
            const remainingQueue = b.queue.slice(1);
            const updatedHistory = [b.nowPlaying, ...b.history.slice(0, 9)];

            // Auto-emit duplication announcement
            if (b.duplicatorEnabled && !isDuplicatorPaused) {
              const now = new Date();
              const timeStr = now.toTimeString().split(' ')[0];
              b.duplicatorTargets.forEach(tgt => {
                setDuplicatorLogs(prev => [
                  {
                    id: 'dup-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                    timestamp: timeStr,
                    sourceChannel: b.ircChannel,
                    targetChannel: tgt,
                    sender: b.botNick,
                    content: `[NOW PLAYING] ${nextTrack.artist} - ${nextTrack.title} [${nextTrack.album} / ${nextTrack.year}] (${nextTrack.bitrate})`,
                    msgType: 'now_playing',
                    botNick: b.botNick,
                    latencyMs: Math.floor(Math.random() * 8) + 6,
                  },
                  ...prev.slice(0, 49)
                ]);
              });
            }

            return {
              ...b,
              nowPlaying: nextTrack,
              queue: remainingQueue,
              history: updatedHistory,
              elapsedSeconds: 0,
              stats: {
                ...b.stats,
                totalPlayed: b.stats.totalPlayed + 1,
              }
            };
          } else {
            // Repeat current track
            newElapsed = 0;
          }
        }
        return { ...b, elapsedSeconds: newElapsed };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isDuplicatorPaused]);

  // Playback Handlers
  const togglePlay = (botId: string) => {
    setBots(prev => prev.map(b => {
      if (b.id === botId) {
        const nextState = !b.isPlaying;
        return { ...b, isPlaying: nextState };
      }
      return b;
    }));
  };

  const handleStop = () => {
    setBots(prev => prev.map(b => {
      if (b.id === activeBot.id) {
        return { ...b, isPlaying: false, elapsedSeconds: 0 };
      }
      return b;
    }));
  };

  const handleNext = () => {
    if (activeBot.queue.length === 0) return;
    setBots(prev => prev.map(b => {
      if (b.id === activeBot.id && b.queue.length > 0) {
        const nextTrack = b.queue[0];
        const remainingQueue = b.queue.slice(1);
        const updatedHistory = [b.nowPlaying, ...b.history.slice(0, 9)];

        // Emit duplicator announcement
        if (b.duplicatorEnabled && !isDuplicatorPaused) {
          const timeStr = new Date().toTimeString().split(' ')[0];
          b.duplicatorTargets.forEach(tgt => {
            setDuplicatorLogs(prevLogs => [
              {
                id: 'dup-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                timestamp: timeStr,
                sourceChannel: b.ircChannel,
                targetChannel: tgt,
                sender: b.botNick,
                content: `[NEXT TRACK] ${nextTrack.artist} - ${nextTrack.title} [Req by: ${nextTrack.requestedBy || 'NOC_Console'}]`,
                msgType: 'now_playing',
                botNick: b.botNick,
                latencyMs: 7,
              },
              ...prevLogs.slice(0, 49)
            ]);
          });
        }

        return {
          ...b,
          nowPlaying: nextTrack,
          queue: remainingQueue,
          history: updatedHistory,
          elapsedSeconds: 0,
        };
      }
      return b;
    }));
  };

  const handlePrev = () => {
    if (activeBot.history.length === 0) return;
    setBots(prev => prev.map(b => {
      if (b.id === activeBot.id && b.history.length > 0) {
        const prevTrack = b.history[0];
        const remainingHistory = b.history.slice(1);
        const updatedQueue = [b.nowPlaying, ...b.queue];
        return {
          ...b,
          nowPlaying: prevTrack,
          queue: updatedQueue,
          history: remainingHistory,
          elapsedSeconds: 0,
        };
      }
      return b;
    }));
  };

  const handleVolumeChange = (newVol: number) => {
    setBots(prev => prev.map(b => {
      if (b.id === activeBot.id) return { ...b, volume: newVol };
      return b;
    }));
  };

  const handleSeek = (newSeconds: number) => {
    setBots(prev => prev.map(b => {
      if (b.id === activeBot.id) return { ...b, elapsedSeconds: newSeconds };
      return b;
    }));
  };

  const handleToggleDuplicator = (botId: string) => {
    setBots(prev => prev.map(b => {
      if (b.id === botId) {
        return { ...b, duplicatorEnabled: !b.duplicatorEnabled };
      }
      return b;
    }));
  };

  // Add custom track to queue
  const handleAddTrack = () => {
    if (!newTrackTitle.trim()) return;
    const trackToAdd: MpdTrack = {
      id: 'custom-' + Date.now(),
      title: newTrackTitle.trim(),
      artist: newTrackArtist.trim() || activeBot.targetEntity,
      album: newTrackAlbum.trim() || 'Custom Session',
      year: 2026,
      duration: 240,
      bitrate: '320 kbps MP3',
      genre: activeBot.nowPlaying.genre,
      label: activeBot.targetEntity,
      fileFormat: 'mp3',
      requestedBy: 'WebControlUser',
    };

    setBots(prev => prev.map(b => {
      if (b.id === activeBot.id) {
        return { ...b, queue: [...b.queue, trackToAdd] };
      }
      return b;
    }));

    // Announce to duplicator
    const timeStr = new Date().toTimeString().split(' ')[0];
    setDuplicatorLogs(prev => [
      {
        id: 'dup-' + Date.now(),
        timestamp: timeStr,
        sourceChannel: activeBot.ircChannel,
        targetChannel: chatTarget,
        sender: 'WebControlUser',
        content: `!add ${trackToAdd.artist} - ${trackToAdd.title}`,
        msgType: 'request',
        botNick: activeBot.botNick,
        latencyMs: 11,
      },
      ...prev.slice(0, 49)
    ]);

    setNewTrackTitle('');
    setNewTrackArtist('');
    setNewTrackAlbum('');
    setShowAddTrackModal(false);
  };

  // Send message through IRC Chat Duplicator
  const handleSendDuplicatorMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const timeStr = new Date().toTimeString().split(' ')[0];
    const isCommand = chatInput.startsWith('!');

    // Generate duplicator log items for all target channels
    activeBot.duplicatorTargets.forEach(tgt => {
      setDuplicatorLogs(prev => [
        {
          id: 'dup-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          timestamp: timeStr,
          sourceChannel: activeBot.ircChannel,
          targetChannel: tgt,
          sender: 'WebControlUser',
          content: `${activeBot.duplicatorPrefix} ${chatInput.trim()}`,
          msgType: isCommand ? 'request' : 'chat',
          botNick: activeBot.botNick,
          latencyMs: Math.floor(Math.random() * 10) + 5,
        },
        ...prev.slice(0, 49)
      ]);
    });

    // Handle bot commands
    if (chatInput.toLowerCase() === '!np') {
      setTimeout(() => {
        setDuplicatorLogs(prev => [
          {
            id: 'dup-' + Date.now(),
            timestamp: new Date().toTimeString().split(' ')[0],
            sourceChannel: activeBot.ircChannel,
            targetChannel: chatTarget,
            sender: activeBot.botNick,
            content: `[NOW PLAYING] ${activeBot.nowPlaying.artist} - ${activeBot.nowPlaying.title} (${Math.floor(activeBot.elapsedSeconds / 60)}:${(activeBot.elapsedSeconds % 60).toString().padStart(2, '0')}/${Math.floor(activeBot.nowPlaying.duration / 60)}:${(activeBot.nowPlaying.duration % 60).toString().padStart(2, '0')}) [${activeBot.nowPlaying.bitrate}]`,
            msgType: 'now_playing',
            botNick: activeBot.botNick,
            latencyMs: 8,
          },
          ...prev.slice(0, 49)
        ]);
      }, 200);
    } else if (chatInput.toLowerCase() === '!queue') {
      setTimeout(() => {
        setDuplicatorLogs(prev => [
          {
            id: 'dup-' + Date.now(),
            timestamp: new Date().toTimeString().split(' ')[0],
            sourceChannel: activeBot.ircChannel,
            targetChannel: chatTarget,
            sender: activeBot.botNick,
            content: `[QUEUE] Next: ${activeBot.queue.map((t, idx) => `#${idx + 1} ${t.artist} - ${t.title}`).join(' | ')}`,
            msgType: 'system',
            botNick: activeBot.botNick,
            latencyMs: 9,
          },
          ...prev.slice(0, 49)
        ]);
      }, 200);
    } else if (chatInput.toLowerCase() === '!skip') {
      handleNext();
    }

    setChatInput('');
  };

  const handleCopyRepo = () => {
    navigator.clipboard.writeText(GITHUB_MPD_REPO);
    setCopiedRepo(true);
    setTimeout(() => setCopiedRepo(false), 2000);
  };

  // Filtered bots list
  const filteredBots = useMemo(() => {
    return bots.filter(b => {
      if (categoryFilter !== 'all' && b.categoryType !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.botNick.toLowerCase().includes(q) ||
          b.targetEntity.toLowerCase().includes(q) ||
          b.ircChannel.toLowerCase().includes(q) ||
          b.nowPlaying.title.toLowerCase().includes(q) ||
          b.nowPlaying.artist.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bots, categoryFilter, searchQuery]);

  const labelCount = useMemo(() => bots.filter(b => b.categoryType === 'label').length, [bots]);
  const genreCount = useMemo(() => bots.filter(b => b.categoryType === 'genre').length, [bots]);
  const artistCount = useMemo(() => bots.filter(b => b.categoryType === 'artist').length, [bots]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Banner / HUD */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-purple-950/90 border-b border-emerald-500/30 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/30 to-purple-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-md">
              <Headphones className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm tracking-wide">
                  mpd_irc_bot Control Panel &amp; IRC Chat Duplicator
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  MPD DAEMON ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Multi-Instance Fleet: One dedicated bot for each Artist, Genre &amp; Major Record Label</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-purple-300">chat-apropo/mpd_irc_bot</span>
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleCopyRepo}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 font-mono text-[11px] cursor-pointer"
              title="Copy GitHub Repository URL"
            >
              {copiedRepo ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied Repo URL</span>
                </>
              ) : (
                <>
                  <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                  <span>chat-apropo/mpd_irc_bot.git</span>
                </>
              )}
            </button>

            <a
              href={GITHUB_MPD_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-colors flex items-center gap-1.5 font-mono text-[11px] cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
              <span>GitHub Repo</span>
            </a>

            {onOpenIrc && (
              <button
                onClick={onOpenIrc}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors flex items-center gap-1.5 font-mono text-[11px] cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open IRC Client</span>
              </button>
            )}

            {onOpenBroadcast && (
              <button
                onClick={onOpenBroadcast}
                className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-colors flex items-center gap-1.5 font-mono text-[11px] cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>Radio &amp; TV Feeds</span>
              </button>
            )}

            {onOpenDuplicator && (
              <button
                onClick={onOpenDuplicator}
                className="px-2.5 py-1.5 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/50 transition-colors flex items-center gap-1.5 font-mono text-[11px] font-bold cursor-pointer shadow-sm shadow-sky-500/20"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>IRC Duplicator Hub</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Navigation Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2 text-xs font-mono font-semibold">
          <button
            onClick={() => setViewMode('dj_booth')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'dj_booth'
                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-purple-300" />
            <span>DJ Master Booth (Dual Deck &amp; FX Mixer)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[9px] uppercase font-bold border border-rose-500/30">
              Live DJ
            </span>
          </button>

          <button
            onClick={() => setViewMode('mpd_deck')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'mpd_deck'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Disc className="w-3.5 h-3.5 text-emerald-300" />
            <span>MPD Deck &amp; Queue ({activeBot.botNick})</span>
          </button>

          <button
            onClick={() => {
              if (onOpenDuplicator) {
                onOpenDuplicator();
              } else {
                setViewMode('duplicator');
              }
            }}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'duplicator'
                ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-sky-300" />
            <span>IRC Duplicator ({duplicatorLogs.length} Packets)</span>
          </button>

          <button
            onClick={() => setViewMode('fleet')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'fleet'
                ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-amber-300" />
            <span>All Bots Fleet ({bots.length} Instances)</span>
          </button>

          {onOpenDuplicator && (
            <button
              onClick={onOpenDuplicator}
              className="ml-auto px-3 py-1.5 rounded-xl border bg-sky-950/80 hover:bg-sky-900 border-sky-500/40 text-sky-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Switch to Standalone IRC Duplicator ➔</span>
            </button>
          )}
        </div>
      </div>

      {/* View 1: DJ Master Booth (Pro Dual Deck Mixer) */}
      {viewMode === 'dj_booth' && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          <MpdDjControlPanel
            bots={bots}
            activeBot={activeBot}
            onSelectBot={setSelectedBotId}
            onOpenIrc={onOpenIrc}
            onOpenBroadcast={onOpenBroadcast}
            onOpenDuplicator={onOpenDuplicator}
          />
        </div>
      )}

      {/* View 2 & 3: Standard MPD Console & Duplicator Columns */}
      {(viewMode === 'mpd_deck' || viewMode === 'duplicator') && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Master Playback Console & Queue (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-5">

          {/* Master MPD Playback Deck */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
            
            {/* Playback Deck Header */}
            <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${activeBot.isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="font-bold text-white uppercase tracking-wider">
                  MPD ENGINE: {activeBot.botNick}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400">{activeBot.mpdHost}:{activeBot.mpdPort}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                  {activeBot.ircChannel}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] uppercase font-bold border border-purple-500/30">
                  {activeBot.categoryType}
                </span>
              </div>
            </div>

            {/* Turntable / Visualizer Deck */}
            <div className="p-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col sm:flex-row items-center gap-6">
              
              {/* Spinning Vinyl Visualizer */}
              <div className="relative shrink-0">
                <div className={`w-36 h-36 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center shadow-2xl relative ${activeBot.isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
                  {/* Vinyl Grooves */}
                  <div className="absolute inset-2 rounded-full border border-slate-800/80" />
                  <div className="absolute inset-5 rounded-full border border-slate-800/70" />
                  <div className="absolute inset-8 rounded-full border border-slate-800/60" />
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-inner">
                    <Disc className="w-6 h-6 animate-pulse" />
                  </div>
                  {/* Center hole */}
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-950 absolute" />
                </div>

                {/* Tone arm indicator */}
                <div className={`absolute top-0 right-0 w-8 h-12 border-r-2 border-t-2 border-slate-400 rounded-tr-xl transition-transform origin-top-right ${activeBot.isPlaying ? 'rotate-12' : '-rotate-12'}`} />
              </div>

              {/* Now Playing Info & VU Meter */}
              <div className="flex-1 w-full space-y-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                      NOW STREAMING ON {activeBot.ircChannel}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight line-clamp-1">
                    {activeBot.nowPlaying.title}
                  </h3>
                  <p className="text-sm text-slate-300 font-medium">
                    {activeBot.nowPlaying.artist} • <span className="text-slate-400">{activeBot.nowPlaying.album} ({activeBot.nowPlaying.year})</span>
                  </p>
                </div>

                {/* Audio Specs Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {activeBot.nowPlaying.bitrate}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {activeBot.nowPlaying.genre}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {activeBot.nowPlaying.label}
                  </span>
                  {activeBot.nowPlaying.requestedBy && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Req: {activeBot.nowPlaying.requestedBy}
                    </span>
                  )}
                </div>

                {/* VU Meter Canvas */}
                <div className="pt-1">
                  <canvas
                    ref={vuCanvasRef}
                    width={380}
                    height={28}
                    className="w-full h-7 rounded-lg bg-slate-950 border border-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Progress Slider Bar */}
            <div className="px-5 pt-3 pb-2 bg-slate-950/70 border-t border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{formatSeconds(activeBot.elapsedSeconds)}</span>
                <span className="text-slate-500">
                  {Math.floor((activeBot.elapsedSeconds / activeBot.nowPlaying.duration) * 100)}%
                </span>
                <span>{formatSeconds(activeBot.nowPlaying.duration)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={activeBot.nowPlaying.duration}
                value={activeBot.elapsedSeconds}
                onChange={(e) => handleSeek(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Master Controls & Volume Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              
              {/* Transport Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={activeBot.history.length === 0}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Previous Track"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => togglePlay(activeBot.id)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all shadow-lg cursor-pointer ${
                    activeBot.isPlaying
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  }`}
                  title={activeBot.isPlaying ? 'Pause Playback' : 'Play Stream'}
                >
                  {activeBot.isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-0.5 fill-current" />}
                </button>

                <button
                  onClick={handleStop}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                  title="Stop Playback"
                >
                  <Square className="w-4 h-4" />
                </button>

                <button
                  onClick={handleNext}
                  disabled={activeBot.queue.length === 0}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Next Track"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Slider & Mute */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  onClick={() => handleVolumeChange(activeBot.volume === 0 ? 80 : 0)}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {activeBot.volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={activeBot.volume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                  className="w-24 accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="w-8 text-[11px] text-slate-400">{activeBot.volume}%</span>
              </div>

              {/* Duplicator Toggle & Status */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleDuplicator(activeBot.id)}
                  className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeBot.duplicatorEnabled
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                  title="Toggle IRC Chat Duplicator for this bot"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Duplicator: {activeBot.duplicatorEnabled ? 'Active' : 'Muted'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Queue & Playlist Management Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Disc className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-white text-sm">
                  MPD Playlist Queue ({activeBot.queue.length} Tracks Ahead)
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddTrackModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Track</span>
                </button>
              </div>
            </div>

            {/* Queue Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
              {activeBot.queue.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500 font-mono">
                  Queue is empty. Use "+ Add Track" or issue "!play" in IRC to add songs.
                </div>
              ) : (
                activeBot.queue.map((track, idx) => (
                  <div
                    key={track.id}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 text-xs font-mono transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-slate-500 font-bold">{idx + 1}</span>
                      <div>
                        <div className="font-semibold text-white line-clamp-1">{track.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {track.artist} • <span className="text-slate-500">{track.album}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px]">
                        {track.bitrate}
                      </span>
                      <span className="text-slate-400 text-[11px]">{formatSeconds(track.duration)}</span>
                      <button
                        onClick={() => {
                          setBots(prev => prev.map(b => {
                            if (b.id === activeBot.id) {
                              return { ...b, queue: b.queue.filter(t => t.id !== track.id) };
                            }
                            return b;
                          }));
                        }}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: IRC Chat Duplicator Module & Console (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          
          {/* Duplicator Control & Live Feed Card */}
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Duplicator Header */}
            <div className="p-3.5 bg-gradient-to-r from-purple-950/90 to-slate-950 border-b border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white text-xs font-mono uppercase tracking-wider">
                  IRC Chat Duplicator
                </span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/30">
                  REAL-TIME SYNC
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => setIsDuplicatorPaused(!isDuplicatorPaused)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    isDuplicatorPaused ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {isDuplicatorPaused ? 'Resume Stream' : 'Pause Stream'}
                </button>
              </div>
            </div>

            {/* Duplicator Routing Information Ribbon */}
            <div className="p-3 bg-slate-950 border-b border-slate-800/80 text-[11px] font-mono space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] text-slate-500 uppercase">SOURCE IRC CHANNEL:</span>
                <span className="text-emerald-300 font-bold">{activeBot.ircChannel}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] text-slate-500 uppercase">DUPLICATION TARGETS:</span>
                <div className="flex flex-wrap gap-1">
                  {activeBot.duplicatorTargets.map(tgt => (
                    <span key={tgt} className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                      {tgt}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] text-slate-500 uppercase">DUPLICATE MODE:</span>
                <span className="text-sky-300 font-bold uppercase">{activeBot.duplicatorMode}</span>
              </div>
            </div>

            {/* Live Duplication Packet Log Feed */}
            <div className="p-3 bg-slate-950/90 flex-1 min-h-[300px] max-h-[360px] overflow-y-auto no-scrollbar font-mono text-[11px] space-y-2">
              {duplicatorLogs.map(log => (
                <div
                  key={log.id}
                  className={`p-2 rounded-xl border flex flex-col gap-1 transition-all ${
                    log.msgType === 'now_playing'
                      ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                      : log.msgType === 'request'
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">{log.timestamp}</span>
                      <span className="font-semibold text-emerald-400">{log.sourceChannel}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                      <span className="font-semibold text-purple-400">{log.targetChannel}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">{log.latencyMs}ms</span>
                  </div>

                  <div className="text-slate-200 break-words leading-relaxed">
                    <span className="font-bold text-sky-400 mr-1.5">&lt;{log.sender}&gt;</span>
                    <span>{log.content}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Duplicator Live Input Form */}
            <form onSubmit={handleSendDuplicatorMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Send message or command (!np, !play, !queue) to ${activeBot.ircChannel}...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Quick Commands Cheatsheet Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 font-mono text-xs space-y-2">
            <span className="font-bold text-white text-[11px] block uppercase tracking-wider">
              MPD Bot IRC Commands (Auto-Duplicated)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-purple-300 font-bold block">!np</span>
                <span>Announce current playing song</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-emerald-300 font-bold block">!play &lt;song&gt;</span>
                <span>Search and play track in MPD</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-sky-300 font-bold block">!queue</span>
                <span>Show upcoming playlist tracks</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-amber-300 font-bold block">!skip</span>
                <span>Vote or skip to next track</span>
              </div>
            </div>
          </div>

        </div>

      </div>
      )}

      {/* Fleet Section: One For Each Artist, Music Genre & Major Record Label */}
      {(viewMode === 'fleet' || viewMode === 'mpd_deck') && (
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        
        {/* Fleet Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <span>MPD Bot Fleet Matrix ({bots.length} Dedicated Bot Instances)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Complete fleet providing an independent MPD instance, socket port &amp; IRC duplicator worker for each Artist, Genre and Major Music Label.
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-purple-600 text-white border-purple-500 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              All Fleet ({bots.length})
            </button>
            <button
              onClick={() => setCategoryFilter('label')}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === 'label'
                  ? 'bg-rose-600 text-white border-rose-500 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span>Major Record Labels ({labelCount})</span>
            </button>
            <button
              onClick={() => setCategoryFilter('genre')}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === 'genre'
                  ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span>Music Genres ({genreCount})</span>
            </button>
            <button
              onClick={() => setCategoryFilter('artist')}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === 'artist'
                  ? 'bg-sky-600 text-white border-sky-500 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span>Artists ({artistCount})</span>
            </button>
          </div>
        </div>

        {/* Search Fleet Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Bot Nick, Artist, Record Label, Music Genre, or IRC Channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Fleet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBots.map(bot => {
            const isSelected = bot.id === selectedBotId;
            return (
              <div
                key={bot.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-900/95 border-emerald-500/80 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm tracking-tight">{bot.targetEntity}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                          bot.categoryType === 'label'
                            ? 'bg-rose-500/20 text-rose-300'
                            : bot.categoryType === 'genre'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}>
                          {bot.categoryType}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{bot.botNick} • Port {bot.mpdPort}</span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                      {bot.ircChannel}
                    </span>
                  </div>

                  {/* Now Playing on this bot */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${bot.isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                        {bot.isPlaying ? 'STREAMING' : 'IDLE'}
                      </span>
                      <span>{bot.stats.listeners.toLocaleString()} listeners</span>
                    </div>
                    <div className="font-semibold text-white truncate">{bot.nowPlaying.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">{bot.nowPlaying.artist} • {bot.nowPlaying.album}</div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 font-mono text-xs">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Share2 className="w-3 h-3 text-purple-400" />
                    <span>Duplicator: {bot.duplicatorEnabled ? `${bot.duplicatorTargets.length} Channels` : 'Off'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePlay(bot.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        bot.isPlaying
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                      title={bot.isPlaying ? 'Pause' : 'Play'}
                    >
                      {bot.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => setSelectedBotId(bot.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isSelected ? 'Controlling' : 'Control Deck'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Add Track to MPD Queue Modal */}
      {showAddTrackModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddTrackModal(false); }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
        >
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative flex flex-col space-y-4 cursor-default">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Track to {activeBot.botNick}</span>
              </h3>
              <button
                onClick={() => setShowAddTrackModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Track Title</label>
                <input
                  type="text"
                  placeholder="e.g. California Love"
                  value={newTrackTitle}
                  onChange={(e) => setNewTrackTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Artist</label>
                <input
                  type="text"
                  placeholder={`e.g. ${activeBot.targetEntity}`}
                  value={newTrackArtist}
                  onChange={(e) => setNewTrackArtist(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Album (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Vault Session"
                  value={newTrackAlbum}
                  onChange={(e) => setNewTrackAlbum(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 font-mono text-xs">
              <button
                onClick={() => setShowAddTrackModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTrack}
                disabled={!newTrackTitle.trim()}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-40 cursor-pointer"
              >
                Queue Track
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
