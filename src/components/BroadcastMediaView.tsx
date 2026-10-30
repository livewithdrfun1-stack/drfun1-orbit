import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BroadcastChannel, BroadcastMediaType } from '../types/broadcast';
import { 
  DRFUN1_BROADCAST_CHANNELS, 
  BROADCAST_SCHEDULE, 
  WITT_LAW_FIRM_REGISTRY, 
  FCC_GOV_REGISTRY, 
  FUBO_TV_REGISTRY,
  CABLECAST_REGISTRY,
  TVU_NETWORKS_REGISTRY,
  WHITEHOUSE_GOV_REGISTRY
} from '../data/broadcastData';
import { 
  Tv, 
  Radio, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Activity, 
  ShieldCheck, 
  Server, 
  Globe, 
  ExternalLink, 
  Clock, 
  Layers, 
  Search, 
  Filter, 
  Share2, 
  Maximize2, 
  Sparkles, 
  Wifi, 
  Headphones, 
  Film, 
  Sliders, 
  Info, 
  CheckCircle2, 
  Terminal, 
  ShoppingBag, 
  RefreshCw, 
  Zap, 
  Scale, 
  Bot, 
  FileText, 
  Landmark, 
  Flame,
  Building2,
  Network,
  Video
} from 'lucide-react';

interface BroadcastMediaViewProps {
  onOpenStore?: () => void;
  onOpenIrc?: () => void;
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
}

export const BroadcastMediaView: React.FC<BroadcastMediaViewProps> = ({
  onOpenStore,
  onOpenIrc,
  onOpenLicense,
  onOpenSwitchMesh,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(DRFUN1_BROADCAST_CHANNELS[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(75);
  const [mediaFilter, setMediaFilter] = useState<'all' | BroadcastMediaType>('all');
  const [bandFilter, setBandFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'player' | 'guide' | 'spec'>('player');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showWittLawModal, setShowWittLawModal] = useState<boolean>(false);
  const [isSyncingWithWittLaw, setIsSyncingWithWittLaw] = useState<boolean>(false);
  const [showFccModal, setShowFccModal] = useState<boolean>(false);
  const [isSyncingWithFcc, setIsSyncingWithFcc] = useState<boolean>(false);
  const [showFuboModal, setShowFuboModal] = useState<boolean>(false);
  const [isSyncingWithFubo, setIsSyncingWithFubo] = useState<boolean>(false);
  const [fuboCategoryFilter, setFuboCategoryFilter] = useState<string>('All');
  const [showCablecastModal, setShowCablecastModal] = useState<boolean>(false);
  const [isSyncingWithCablecast, setIsSyncingWithCablecast] = useState<boolean>(false);
  const [cablecastCategoryFilter, setCablecastCategoryFilter] = useState<string>('All');
  const [showTvuModal, setShowTvuModal] = useState<boolean>(false);
  const [isSyncingWithTvu, setIsSyncingWithTvu] = useState<boolean>(false);
  const [tvuCategoryFilter, setTvuCategoryFilter] = useState<string>('All');
  const [showWhitehouseModal, setShowWhitehouseModal] = useState<boolean>(false);
  const [isSyncingWithWhitehouse, setIsSyncingWithWhitehouse] = useState<boolean>(false);
  const [whitehouseCategoryFilter, setWhitehouseCategoryFilter] = useState<string>('All');
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  const handleAskWittLawFirm = () => {
    setIsSyncingWithWittLaw(true);
    setShowWittLawModal(true);
    setTimeout(() => {
      setIsSyncingWithWittLaw(false);
      setSyncSuccessMessage(`Synchronized all ${WITT_LAW_FIRM_REGISTRY.certifiedChannelCount} certified channels & ${WITT_LAW_FIRM_REGISTRY.totalBotFleetChannels.toLocaleString()} bot feeds from www.wittlawfirm.com`);
      setTimeout(() => setSyncSuccessMessage(null), 5000);
    }, 700);
  };

  const handleAskFccGov = () => {
    setIsSyncingWithFcc(true);
    setShowFccModal(true);
    setTimeout(() => {
      setIsSyncingWithFcc(false);
      setSyncSuccessMessage(`Synchronized all ${FCC_GOV_REGISTRY.totalAuthorizations} FCC authorizations & ${DRFUN1_BROADCAST_CHANNELS.length} broadcast channels from fcc.gov (FRN: ${FCC_GOV_REGISTRY.frn})`);
      setTimeout(() => setSyncSuccessMessage(null), 5000);
    }, 750);
  };

  const handleAskFuboTv = () => {
    setIsSyncingWithFubo(true);
    setShowFuboModal(true);
    setTimeout(() => {
      setIsSyncingWithFubo(false);
      setSyncSuccessMessage(`Synchronized all ${FUBO_TV_REGISTRY.totalChannels} Fubo.tv live sports, broadcast & news channels across ${FUBO_TV_REGISTRY.availablePackages.length} packages!`);
      setTimeout(() => setSyncSuccessMessage(null), 5000);
    }, 700);
  };

  const handleAskCablecast = () => {
    setIsSyncingWithCablecast(true);
    setShowCablecastModal(true);
    setTimeout(() => {
      setIsSyncingWithCablecast(false);
      setSyncSuccessMessage(`Synchronized all ${CABLECAST_REGISTRY.totalChannels} Cablecast.tv PEG community, municipal & educational channels with Tightrope VIO!`);
      setTimeout(() => setSyncSuccessMessage(null), 5000);
    }, 700);
  };

  const handleAskTvuNetworks = () => {
    setIsSyncingWithTvu(true);
    setShowTvuModal(true);
    setTimeout(() => {
      setIsSyncingWithTvu(false);
      setSyncSuccessMessage(`Synchronized all ${TVU_NETWORKS_REGISTRY.totalChannels} tvunetworks.com live pools, REMI feeds & TVU Grid matrix!`);
      setTimeout(() => setSyncSuccessMessage(null), 5000);
    }, 700);
  };

  const handleAskWhitehouse = () => {
    setIsSyncingWithWhitehouse(true);
    setShowWhitehouseModal(true);
    setTimeout(() => {
      setIsSyncingWithWhitehouse(false);
      setSyncSuccessMessage(`Synchronized all ${WHITEHOUSE_GOV_REGISTRY.totalChannels} Whitehouse.gov executive channels & ${WHITEHOUSE_GOV_REGISTRY.totalDirectRelays.toLocaleString()} EAS/Executive relays with EOP & WHCA!`);
      setTimeout(() => setSyncSuccessMessage(null), 5000);
    }, 700);
  };

  // Close any open modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowWittLawModal(false);
        setShowFccModal(false);
        setShowFuboModal(false);
        setShowCablecastModal(false);
        setShowTvuModal(false);
        setShowWhitehouseModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tvCount = useMemo(() => DRFUN1_BROADCAST_CHANNELS.filter(c => c.mediaType === 'tv').length, []);
  const radioCount = useMemo(() => DRFUN1_BROADCAST_CHANNELS.filter(c => c.mediaType === 'radio').length, []);

  const selectedChannel = useMemo(() => {
    return DRFUN1_BROADCAST_CHANNELS.find(c => c.id === selectedChannelId) || DRFUN1_BROADCAST_CHANNELS[0];
  }, [selectedChannelId]);

  // Audio Context and Synthesizer for live simulated audio playback
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);

  // Canvas visualizer refs
  const audioCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tvCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize and handle Web Audio tone synthesis
  useEffect(() => {
    if (!isPlaying) {
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend().catch(() => {});
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
        try { oscillatorRef.current.stop(); } catch (_) { /* ignore */ }
        try { oscillatorRef.current.disconnect(); } catch (_) { /* ignore */ }
      }
      if (lfoRef.current) {
        try { lfoRef.current.stop(); } catch (_) { /* ignore */ }
        try { lfoRef.current.disconnect(); } catch (_) { /* ignore */ }
      }
      if (gainNodeRef.current) {
        try { gainNodeRef.current.disconnect(); } catch (_) { /* ignore */ }
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      // Configure based on simulated audio type
      switch (selectedChannel.simulatedAudioType) {
        case 'synthwave':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(selectedChannel.simulatedAudioFrequency, ctx.currentTime);
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(1.5, ctx.currentTime); // gentle pulse
          lfoGain.gain.setValueAtTime(15, ctx.currentTime);
          lfo.connect(osc.frequency);
          break;
        case 'ambient':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(selectedChannel.simulatedAudioFrequency, ctx.currentTime);
          lfo.type = 'triangle';
          lfo.frequency.setValueAtTime(0.3, ctx.currentTime);
          lfoGain.gain.setValueAtTime(8, ctx.currentTime);
          lfo.connect(osc.frequency);
          break;
        case 'telemetry':
          osc.type = 'square';
          osc.frequency.setValueAtTime(selectedChannel.simulatedAudioFrequency, ctx.currentTime);
          lfo.type = 'square';
          lfo.frequency.setValueAtTime(4.0, ctx.currentTime); // chirping
          lfoGain.gain.setValueAtTime(80, ctx.currentTime);
          lfo.connect(osc.frequency);
          break;
        case 'morse':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(selectedChannel.simulatedAudioFrequency, ctx.currentTime);
          lfo.type = 'square';
          lfo.frequency.setValueAtTime(8.0, ctx.currentTime); // 20 WPM Morse keying
          lfoGain.gain.setValueAtTime(selectedChannel.simulatedAudioFrequency * 0.9, ctx.currentTime);
          lfo.connect(osc.frequency);
          break;
        case 'eas_alert':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(853, ctx.currentTime); // Dual alert tone standard
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(960, ctx.currentTime);
          lfoGain.gain.setValueAtTime(107, ctx.currentTime);
          lfo.connect(osc.frequency);
          break;
        case 'voice_dispatch':
        default:
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, ctx.currentTime);
          lfo.type = 'sawtooth';
          lfo.frequency.setValueAtTime(2.2, ctx.currentTime);
          lfoGain.gain.setValueAtTime(25, ctx.currentTime);
          lfo.connect(osc.frequency);
          break;
      }

      const targetGain = isMuted ? 0 : (volume / 100) * 0.04; // Gentle background level
      gain.gain.setValueAtTime(targetGain, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start();
      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
      lfoRef.current = lfo;

    } catch (e) {
      console.warn('Web Audio synthesis initialisation notice:', e);
    }

    return () => {
      try {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        }
        if (lfoRef.current) {
          lfoRef.current.stop();
          lfoRef.current.disconnect();
        }
        if (gainNodeRef.current) {
          gainNodeRef.current.disconnect();
        }
      } catch (_) { /* ignore */ }
    };
  }, [selectedChannelId, isPlaying, selectedChannel.simulatedAudioType, selectedChannel.simulatedAudioFrequency]);

  // Handle Volume & Mute Updates
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      const targetGain = isMuted ? 0 : (volume / 100) * 0.04;
      gainNodeRef.current.gain.setTargetAtTime(targetGain, audioContextRef.current.currentTime, 0.05);
    }
  }, [volume, isMuted]);

  // TV Screen & Audio Visualizer Rendering Loop
  useEffect(() => {
    let phase = 0;

    const render = () => {
      phase += 0.05;

      // 1. Render TV Video Monitor Canvas
      if (tvCanvasRef.current) {
        const canvas = tvCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Clear with dark space backdrop
          ctx.fillStyle = '#050814';
          ctx.fillRect(0, 0, w, h);

          // Grid lines simulation
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
          ctx.lineWidth = 1;
          for (let x = 0; x < w; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }
          for (let y = 0; y < h; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }

          if (selectedChannel.mediaType === 'tv') {
            // Draw animated satellite trajectory / optical carrier
            const centerX = w / 2;
            const centerY = h / 2 - 10;
            const radius = Math.min(w, h) * 0.28;

            // Earth / Planet Core
            const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius * 0.6);
            gradient.addColorStop(0, '#0284c7');
            gradient.addColorStop(0.7, '#0f172a');
            gradient.addColorStop(1, '#020617');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Orbital Ring
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(phase * 0.2);
            ctx.beginPath();
            ctx.ellipse(0, 0, radius * 1.3, radius * 0.45, Math.PI / 4, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Orbiting Satellite Node
            const satAngle = phase * 0.6;
            const satX = Math.cos(satAngle) * radius * 1.3;
            const satY = Math.sin(satAngle) * radius * 0.45;
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(satX, satY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Scanline effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            for (let i = 0; i < h; i += 4) {
              ctx.fillRect(0, i, w, 1.5);
            }

            // TV Channel watermark & HUD overlay
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(`LIVE UPLINK: ${selectedChannel.callSign} (${selectedChannel.resolution || '4K 60FPS'})`, 16, 26);
            ctx.fillStyle = '#38bdf8';
            ctx.font = '10px monospace';
            ctx.fillText(`CARRIER: ${selectedChannel.carrierFrequency}`, 16, 42);

            ctx.fillStyle = '#10b981';
            ctx.fillText(`STATUS: ON AIR | HEVC 14.5 Mbps`, w - 190, 26);

            // Lower-third news ticker
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(0, h - 34, w, 34);
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(`NOW: ${selectedChannel.currentShow}`, 16, h - 14);

            ctx.fillStyle = '#fbbf24';
            ctx.font = '10px monospace';
            ctx.fillText(`HOST: ${selectedChannel.nowPlayingHost}`, w - 240, h - 14);
          } else {
            // Online Radio Spectrum & Vinyl Waveform Display
            const centerX = w / 2;
            const centerY = h / 2;

            // Concentric soundwaves
            for (let ring = 1; ring <= 4; ring++) {
              ctx.beginPath();
              const ringRadius = 25 * ring + Math.sin(phase * 2 + ring) * 8;
              ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(168, 85, 247, ${0.7 - ring * 0.14})`;
              ctx.lineWidth = 2;
              ctx.stroke();
            }

            // Center Radio Turntable / Micro Hub
            ctx.fillStyle = '#7e22ce';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('FM', centerX, centerY + 5);
            ctx.textAlign = 'left';

            // Radio Information HUD
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(`RADIO AUDIO STREAM: ${selectedChannel.callSign} (320 kbps AAC+)`, 16, 26);
            ctx.fillStyle = '#a855f7';
            ctx.font = '10px monospace';
            ctx.fillText(`TRANSIT: ${selectedChannel.transitBackbone.split('&')[0]}`, 16, 42);

            // Lower Bar
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(0, h - 34, w, 34);
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(`NOW PLAYING: ${selectedChannel.currentShow}`, 16, h - 14);
            ctx.fillStyle = '#38bdf8';
            ctx.font = '10px monospace';
            ctx.fillText(`${selectedChannel.nowPlayingHost}`, w - 230, h - 14);
          }
        }
      }

      // 2. Render Real-Time Spectrum Analyzer Bars in Top Bar
      if (audioCanvasRef.current) {
        const canvas = audioCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          const barCount = 28;
          const barWidth = (w / barCount) - 2;

          for (let i = 0; i < barCount; i++) {
            const barHeight = isPlaying 
              ? Math.abs(Math.sin(phase * 3 + i * 0.4)) * (h * 0.85) + 3
              : 2;

            const x = i * (barWidth + 2);
            const y = h - barHeight;

            // Gradient: Emerald to Sky to Purple
            const grad = ctx.createLinearGradient(0, h, 0, 0);
            grad.addColorStop(0, '#10b981');
            grad.addColorStop(0.5, '#38bdf8');
            grad.addColorStop(1, '#a855f7');

            ctx.fillStyle = grad;
            ctx.fillRect(x, y, barWidth, barHeight);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [selectedChannel, isPlaying]);

  // Channel Filtering
  const filteredChannels = useMemo(() => {
    return DRFUN1_BROADCAST_CHANNELS.filter(c => {
      if (mediaFilter !== 'all' && c.mediaType !== mediaFilter) return false;
      
      if (bandFilter !== 'All') {
        const bf = bandFilter.toLowerCase();
        if (bf === 'whitehouse.gov' || bf === 'white house' || bf === 'whitehouse') {
          if (!c.isWhiteHouseGov && !c.badges.some(b => b.toLowerCase().includes('whitehouse'))) return false;
        } else if (bf === 'fubo.tv') {
          if (!c.isFuboTv && !c.badges.some(b => b.toLowerCase().includes('fubo'))) return false;
        } else if (bf === 'cablecast.tv') {
          if (!c.isCablecast && !c.badges.some(b => b.toLowerCase().includes('cablecast'))) return false;
        } else if (bf === 'tvunetworks.com' || bf === 'tvu networks' || bf === 'tvu') {
          if (!c.isTvuNetworks && !c.badges.some(b => b.toLowerCase().includes('tvu'))) return false;
        } else if (bf === 'fcc licensed') {
          if (!c.fccCallSign && !c.fccRulePart && !c.badges.some(b => b.toLowerCase().includes('fcc'))) return false;
        } else if (bf === 'witt law certified') {
          if (!c.wittLawCertified) return false;
        } else if (bf === 'bot fleets') {
          if (!c.botFleetAllocation && !c.badges.some(b => b.toLowerCase().includes('bot'))) return false;
        } else if (bf === 'noc & transit') {
          const matchNoc = c.id.includes('noc') || 
                           c.id.includes('transit') || 
                           c.colocationCampus.toLowerCase().includes('switch') || 
                           c.transitBackbone.toLowerCase().includes('risingnet') ||
                           c.unrealIrcChannel.includes('switch') ||
                           c.unrealIrcChannel.includes('risingnet');
          if (!matchNoc) return false;
        } else {
          const matchBand = c.frequencyBand.toLowerCase().includes(bf) ||
                            c.unrealIrcChannel.toLowerCase().includes(bf) ||
                            c.name.toLowerCase().includes(bf);
          if (!matchBand) return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesCall = c.callSign.toLowerCase().includes(q);
        const matchesBand = c.frequencyBand.toLowerCase().includes(q);
        const matchesTag = c.tagline.toLowerCase().includes(q);
        const matchesShow = c.currentShow.toLowerCase().includes(q);
        const matchesIrc = c.unrealIrcChannel.toLowerCase().includes(q);
        const matchesRole = c.ecomRole.toLowerCase().includes(q);
        const matchesBot = c.botFleetAllocation ? c.botFleetAllocation.toLowerCase().includes(q) : false;
        const matchesFiling = c.wittLawFilingId ? c.wittLawFilingId.toLowerCase().includes(q) : false;
        const matchesFccCall = c.fccCallSign ? c.fccCallSign.toLowerCase().includes(q) : false;
        const matchesFccRule = c.fccRulePart ? c.fccRulePart.toLowerCase().includes(q) : false;
        const matchesFccFacility = c.fccFacilityId ? c.fccFacilityId.toLowerCase().includes(q) : false;
        const matchesFubo = Boolean(c.isFuboTv && (c.name.toLowerCase().includes(q) || (c.fuboCategory && c.fuboCategory.toLowerCase().includes(q)) || (c.fuboPackage && c.fuboPackage.toLowerCase().includes(q))));
        const matchesCablecast = Boolean(c.isCablecast && (c.name.toLowerCase().includes(q) || (c.cablecastCategory && c.cablecastCategory.toLowerCase().includes(q)) || (c.cablecastStation && c.cablecastStation.toLowerCase().includes(q))));
        const matchesTvu = Boolean(c.isTvuNetworks && (c.name.toLowerCase().includes(q) || (c.tvuCategory && c.tvuCategory.toLowerCase().includes(q)) || (c.tvuService && c.tvuService.toLowerCase().includes(q))));
        const matchesWhitehouse = Boolean(c.isWhiteHouseGov && (c.name.toLowerCase().includes(q) || (c.whitehouseCategory && c.whitehouseCategory.toLowerCase().includes(q)) || (c.presidentialDirective && c.presidentialDirective.toLowerCase().includes(q))));
        if (!matchesName && !matchesCall && !matchesBand && !matchesTag && !matchesShow && !matchesIrc && !matchesRole && !matchesBot && !matchesFiling && !matchesFccCall && !matchesFccRule && !matchesFccFacility && !matchesFubo && !matchesCablecast && !matchesTvu && !matchesWhitehouse) {
          return false;
        }
      }
      return true;
    });
  }, [mediaFilter, bandFilter, searchQuery]);

  const handleCopyStream = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Broadcasting Masthead */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-sky-950/80 border-b border-purple-500/30 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm tracking-wide">
                  DrFun1 Media &amp; ECOM Broadcast Center
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE ON-AIR
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Master Online Radio &amp; 4K Television Channels Owned &amp; Transmitted by DrFun1 Media Inc.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            <button
              onClick={handleAskWhitehouse}
              disabled={isSyncingWithWhitehouse}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-700/30 to-indigo-600/20 text-blue-200 border border-blue-500/50 hover:bg-blue-500/30 transition-all flex items-center gap-1.5 font-mono text-[11px] font-bold shadow-sm shadow-blue-500/10 cursor-pointer"
            >
              <Landmark className="w-3.5 h-3.5 text-blue-400" />
              <span>Ask whitehouse.gov</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse ml-0.5" />
            </button>
            <button
              onClick={handleAskCablecast}
              disabled={isSyncingWithCablecast}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600/30 to-teal-500/20 text-emerald-200 border border-emerald-500/50 hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 font-mono text-[11px] font-bold shadow-sm shadow-emerald-500/10 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ask Cablecast.tv</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>
            <button
              onClick={handleAskTvuNetworks}
              disabled={isSyncingWithTvu}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-blue-500/20 text-cyan-200 border border-cyan-500/50 hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 font-mono text-[11px] font-bold shadow-sm shadow-cyan-500/10 cursor-pointer"
            >
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ask tvunetworks</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
            </button>
            <button
              onClick={handleAskFuboTv}
              disabled={isSyncingWithFubo}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-600/30 to-amber-500/20 text-orange-200 border border-orange-500/50 hover:bg-orange-500/30 transition-all flex items-center gap-1.5 font-mono text-[11px] font-bold shadow-sm shadow-orange-500/10 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Ask Fubo.tv</span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse ml-0.5" />
            </button>
            <button
              onClick={handleAskFccGov}
              disabled={isSyncingWithFcc}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600/30 to-sky-500/20 text-sky-200 border border-sky-500/50 hover:bg-sky-500/30 transition-all flex items-center gap-1.5 font-mono text-[11px] font-bold shadow-sm shadow-sky-500/10 cursor-pointer"
            >
              <Landmark className="w-3.5 h-3.5 text-sky-400" />
              <span>Ask fcc.gov</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse ml-0.5" />
            </button>
            <button
              onClick={handleAskWittLawFirm}
              disabled={isSyncingWithWittLaw}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600/30 to-amber-500/20 text-amber-200 border border-amber-500/50 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 font-mono text-[11px] font-bold shadow-sm shadow-amber-500/10 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask wittlawfirm</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>

            {/* Modal Lineup Quick Buttons */}
            <button
              onClick={() => setShowWhitehouseModal(true)}
              className="text-slate-400 hover:text-blue-300 px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <Landmark className="w-3.5 h-3.5 text-blue-400" />
              <span>White House</span>
            </button>
            <button
              onClick={() => setShowCablecastModal(true)}
              className="text-slate-400 hover:text-emerald-300 px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cablecast PEG</span>
            </button>
            <button
              onClick={() => setShowTvuModal(true)}
              className="text-slate-400 hover:text-cyan-300 px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span>TVU Grid</span>
            </button>
            <button
              onClick={() => setShowFuboModal(true)}
              className="text-slate-400 hover:text-orange-300 px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Fubo</span>
            </button>
            <button
              onClick={() => setShowFccModal(true)}
              className="text-slate-400 hover:text-white px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>FCC</span>
            </button>
            <button
              onClick={() => setShowWittLawModal(true)}
              className="text-slate-400 hover:text-white px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Witt Law</span>
            </button>
            <button
              onClick={onOpenSwitchMesh}
              className="text-slate-400 hover:text-emerald-300 px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Switch</span>
            </button>
          </div>
        </div>
        {syncSuccessMessage && (
          <div className="max-w-7xl mx-auto mt-2 px-4 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncSuccessMessage}</span>
            </div>
            <button onClick={() => setSyncSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200 text-xs font-bold">×</button>
          </div>
        )}
      </div>

      {/* Main Broadcast Studio Viewport */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Screen, Controls & Spectrum (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Main Visualizer Monitor */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
            
            {/* Monitor Header Bar */}
            <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                <span className="font-bold text-white uppercase tracking-wider">
                  {selectedChannel.mediaType === 'tv' ? 'LIVE TELEVISION FEED' : 'ONLINE RADIO SIMULCAST'}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-purple-300 font-semibold">{selectedChannel.callSign}</span>
              </div>

              {/* Spectrum Visualizer Canvas in Header */}
              <div className="flex items-center gap-3">
                <canvas 
                  ref={audioCanvasRef} 
                  width={140} 
                  height={18} 
                  className="rounded bg-slate-950/80 px-1 border border-slate-800"
                />
                <span className="text-emerald-400 text-[11px] font-bold">
                  {selectedChannel.listenersOrViewers.toLocaleString()} {selectedChannel.mediaType === 'tv' ? 'Viewers' : 'Listeners'}
                </span>
              </div>
            </div>

            {/* Video / Radio Canvas Display Area */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              <canvas
                ref={tvCanvasRef}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />

              {/* Overlay Play / Pause when hovering or stopped */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-xl transition-all hover:scale-105"
                  >
                    <Play className="w-8 h-8 ml-1 fill-white" />
                  </button>
                  <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                    CLICK TO TUNE IN LIVE
                  </span>
                </div>
              )}
            </div>

            {/* Live Master Control Bar */}
            <div className="p-4 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all shadow-md ${
                    isPlaying 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                  }`}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-amber-300" /> : <Play className="w-5 h-5 ml-0.5 fill-white" />}
                </button>

                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{selectedChannel.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {selectedChannel.frequencyBand.split('/')[0].trim()}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {selectedChannel.currentShow}
                  </p>
                </div>
              </div>

              {/* Volume & Audio Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseInt(e.target.value, 10));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-20 sm:w-24 accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-[10px] text-slate-400 w-7">
                    {isMuted ? '0%' : `${volume}%`}
                  </span>
                </div>

                <button
                  onClick={() => handleCopyStream(selectedChannel.streamUrl)}
                  className="px-2.5 py-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Copy Stream URL"
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Stream URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Channel Detail & Technical Spec Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('player')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors font-semibold ${
                    activeTab === 'player'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Channel Overview
                </button>
                <button
                  onClick={() => setActiveTab('spec')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors font-semibold ${
                    activeTab === 'spec'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Technical &amp; License Escrow
                </button>
                <button
                  onClick={() => setActiveTab('guide')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors font-semibold ${
                    activeTab === 'guide'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Program Guide (EPG)
                </button>
              </div>

              {onOpenStore && (
                <button
                  onClick={onOpenStore}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Buy Broadcast Package</span>
                </button>
              )}
            </div>

            {/* Tab 1: Channel Overview */}
            {activeTab === 'player' && (
              <div className="space-y-4">
                {selectedChannel.isWhiteHouseGov && (
                  <div className="p-3 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/40 rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0">
                        <Landmark className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <span className="font-bold text-blue-200 block text-[11px]">
                          Official Executive Channel • {selectedChannel.whitehouseCategory}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Directive: {selectedChannel.presidentialDirective} | {selectedChannel.securityClassification}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowWhitehouseModal(true)}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[10px] font-semibold transition-colors shrink-0 cursor-pointer"
                    >
                      Whitehouse.gov Registry
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedChannel.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Broadcast Carrier</span>
                    <span className="text-white font-semibold">{selectedChannel.carrierFrequency}</span>
                  </div>
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Bitrate &amp; Format</span>
                    <span className="text-purple-300 font-semibold">{selectedChannel.bitrate}</span>
                  </div>
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Audio Encoding</span>
                    <span className="text-sky-300 font-semibold">{selectedChannel.audioQuality}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/70 border border-purple-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Live Telemetry &amp; Chat Relay</span>
                    <span className="text-purple-300 font-bold">UnrealIRCd {selectedChannel.unrealIrcChannel} on irc.drfun1.com:6697</span>
                  </div>
                  {onOpenIrc && (
                    <button
                      onClick={onOpenIrc}
                      className="px-3 py-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                    >
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      <span>Open IRC Chat Relay</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Technical & License Escrow */}
            {activeTab === 'spec' && (
              <div className="space-y-3.5 text-xs font-mono">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Official Ownership &amp; Intellectual Property Title</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Licensed to: <strong className="text-white">{selectedChannel.licensee}</strong>. Broadcast transmission facilities situated inside Tier 5 Platinum colocation facilities at <a href="https://www.switch.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">{selectedChannel.colocationCampus}</a> with protected IP transit by <a href="https://www.risingnet.com" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">{selectedChannel.transitBackbone}</a>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">HLS Manifest URL</span>
                    <span className="text-sky-300 truncate block text-[11px]">{selectedChannel.hlsManifestUrl}</span>
                  </div>
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">RTMP Teleport Uplink</span>
                    <span className="text-emerald-300 truncate block text-[11px]">{selectedChannel.rtmpUplinkUrl}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Program Guide */}
            {activeTab === 'guide' && (
              <div className="space-y-2.5">
                {/* Active Live Broadcast On-Air Slot */}
                <div className="p-2.5 rounded-lg border bg-gradient-to-r from-purple-950/40 via-slate-900 to-sky-950/40 border-purple-500/50 flex flex-wrap items-center justify-between gap-2 text-xs font-mono shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">NOW ON-AIR:</span>
                    <span className="font-bold text-white truncate max-w-[220px] sm:max-w-sm">{selectedChannel.currentShow}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-[11px] text-purple-300">
                    <span>Host: {selectedChannel.nowPlayingHost}</span>
                    <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] uppercase font-bold">{selectedChannel.callSign}</span>
                  </div>
                </div>

                {selectedChannel.upcomingShow && (
                  <div className="p-2 rounded-lg border bg-slate-950/40 border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-sky-400 font-bold uppercase text-[10px]">UP NEXT:</span>
                      <span className="text-slate-300 truncate max-w-[220px] sm:max-w-sm">{selectedChannel.upcomingShow}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Upcoming Transmission</span>
                  </div>
                )}

                <div className="text-xs font-mono text-slate-400 pt-1">
                  24-Hour Master Schedule across DrFun1 Mesh:
                </div>
                <div className="space-y-1.5 max-h-52 overflow-y-auto no-scrollbar">
                  {BROADCAST_SCHEDULE.map((item, idx) => {
                    const isForCurrent = item.channelId === selectedChannel.id;
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs font-mono transition-colors ${
                          isForCurrent
                            ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-amber-400 font-bold w-20 shrink-0">{item.time}</span>
                          <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-400">
                          <span>{item.host}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[9px] uppercase font-bold">{item.category}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Dynamic Channel List & Filter Console (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Channel Filters & Search Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-400" />
                <span>DrFun1 Broadcast Channels</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {filteredChannels.length} Channels
              </span>
            </div>

            {/* Media Type Tabs */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono font-medium">
              <button
                onClick={() => setMediaFilter('all')}
                className={`py-1.5 rounded-lg transition-colors ${
                  mediaFilter === 'all'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({DRFUN1_BROADCAST_CHANNELS.length})
              </button>
              <button
                onClick={() => setMediaFilter('tv')}
                className={`py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  mediaFilter === 'tv'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5 text-sky-400" />
                <span>TV ({tvCount})</span>
              </button>
              <button
                onClick={() => setMediaFilter('radio')}
                className={`py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  mediaFilter === 'radio'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                <span>Radio ({radioCount})</span>
              </button>
            </div>

            {/* Frequency Band & Registry Filter Ribbon */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-[11px] font-mono">
              {['All', 'Whitehouse.gov', 'Cablecast.tv', 'tvunetworks.com', 'Fubo.tv', 'FCC Licensed', 'Witt Law Certified', 'Bot Fleets', 'Ka-Band', 'Ku-Band', 'C-Band', 'X-Band', 'S-Band', 'L-Band', 'Optical Laser', '5G NTN', 'NOC & Transit'].map(b => (
                <button
                  key={b}
                  onClick={() => setBandFilter(b)}
                  className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1 ${
                    bandFilter === b
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 font-bold shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {b === 'Whitehouse.gov' && <Landmark className="w-3 h-3 text-blue-400" />}
                  {b === 'Cablecast.tv' && <Building2 className="w-3 h-3 text-emerald-400" />}
                  {b === 'tvunetworks.com' && <Network className="w-3 h-3 text-cyan-400" />}
                  {b === 'Fubo.tv' && <Flame className="w-3 h-3 text-orange-400" />}
                  {b === 'FCC Licensed' && <Landmark className="w-3 h-3 text-sky-400" />}
                  {b === 'Witt Law Certified' && <Scale className="w-3 h-3 text-amber-400" />}
                  {b === 'Bot Fleets' && <Bot className="w-3 h-3 text-rose-400" />}
                  <span>{b}</span>
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search TV & radio channels, Whitehouse.gov, Cablecast PEG, TVU Grid, Fubo, FCC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            {/* Regulatory & Streaming Registries Strip: Whitehouse, Cablecast, TVU, Fubo, FCC, Witt Law */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {/* Whitehouse.gov Executive Channels Live Sync Strip */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900/90 to-indigo-950/40 border border-blue-500/40 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
                    <Landmark className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-blue-200 text-[11px] flex items-center gap-1.5">
                      whitehouse.gov
                      <span className="text-[9px] font-mono font-normal text-blue-400 flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Executive
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {WHITEHOUSE_GOV_REGISTRY.totalChannels} Channels • WHCA &amp; EOP
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAskWhitehouse}
                  disabled={isSyncingWithWhitehouse}
                  className="px-2 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 font-mono text-[10px] font-semibold transition-all shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingWithWhitehouse ? 'animate-spin text-blue-200' : 'text-blue-400'}`} />
                  <span>{isSyncingWithWhitehouse ? 'Syncing...' : 'Ask WH'}</span>
                </button>
              </div>
              {/* Cablecast.tv Community Media Live Sync Strip */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-teal-950/40 border border-emerald-500/40 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-emerald-200 text-[11px] flex items-center gap-1.5">
                      cablecast.tv PEG
                      <span className="text-[9px] font-mono font-normal text-emerald-400 flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {CABLECAST_REGISTRY.totalChannels} Channels • Screenweave
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAskCablecast}
                  disabled={isSyncingWithCablecast}
                  className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-semibold transition-all shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingWithCablecast ? 'animate-spin text-emerald-200' : 'text-emerald-400'}`} />
                  <span>{isSyncingWithCablecast ? 'Syncing...' : 'Ask Cablecast'}</span>
                </button>
              </div>

              {/* TVU Networks Live Sync Strip */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-blue-950/40 border border-cyan-500/40 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shrink-0">
                    <Network className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
                      tvunetworks.com
                      <span className="text-[9px] font-mono font-normal text-cyan-400 flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Live Grid
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {TVU_NETWORKS_REGISTRY.totalChannels} Feeds • 0.3s REMI
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAskTvuNetworks}
                  disabled={isSyncingWithTvu}
                  className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-[10px] font-semibold transition-all shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingWithTvu ? 'animate-spin text-cyan-200' : 'text-cyan-400'}`} />
                  <span>{isSyncingWithTvu ? 'Syncing...' : 'Ask TVU'}</span>
                </button>
              </div>

              {/* Fubo.tv Live Sync Strip */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-orange-950/40 via-slate-900/90 to-amber-950/40 border border-orange-500/40 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-300 flex items-center justify-center shrink-0">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-orange-200 text-[11px] flex items-center gap-1.5">
                      fubo.tv Lineup
                      <span className="text-[9px] font-mono font-normal text-emerald-400 flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {FUBO_TV_REGISTRY.totalChannels} Channels • 4K HDR
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAskFuboTv}
                  disabled={isSyncingWithFubo}
                  className="px-2 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 font-mono text-[10px] font-semibold transition-all shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingWithFubo ? 'animate-spin text-orange-200' : 'text-orange-400'}`} />
                  <span>{isSyncingWithFubo ? 'Syncing...' : 'Ask Fubo'}</span>
                </button>
              </div>

              {/* FCC.gov Live Sync Strip */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900/90 to-sky-950/40 border border-sky-500/40 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center shrink-0">
                    <Landmark className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sky-200 text-[11px] flex items-center gap-1.5">
                      fcc.gov Database
                      <span className="text-[9px] font-mono font-normal text-emerald-400 flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        FRN {FCC_GOV_REGISTRY.frn}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Part 25, 73, 74, 5 • {FCC_GOV_REGISTRY.totalAuthorizations} Grants
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAskFccGov}
                  disabled={isSyncingWithFcc}
                  className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-mono text-[10px] font-semibold transition-all shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingWithFcc ? 'animate-spin text-sky-200' : 'text-sky-400'}`} />
                  <span>{isSyncingWithFcc ? 'Syncing...' : 'Ask FCC'}</span>
                </button>
              </div>

              {/* Witt Law Firm Registry Live Sync Strip */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-purple-950/40 border border-amber-500/40 text-xs sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-amber-200 text-[11px] flex items-center gap-1.5">
                      wittlawfirm.com
                      <span className="text-[9px] font-mono font-normal text-emerald-400 flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Certified
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Richard Alan Witt • 880k bots
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAskWittLawFirm}
                  disabled={isSyncingWithWittLaw}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-[10px] font-semibold transition-all shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingWithWittLaw ? 'animate-spin text-amber-200' : 'text-amber-400'}`} />
                  <span>{isSyncingWithWittLaw ? 'Syncing...' : 'Ask Witt'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Scrollable Channel List Cards */}
          <div className="space-y-2.5 flex-1 max-h-[620px] overflow-y-auto no-scrollbar pr-0.5">
            {filteredChannels.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 my-4">
                <Radio className="w-8 h-8 text-slate-600 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-300">No channels match filter</p>
                  <p className="text-xs text-slate-500 font-mono">
                    No broadcast feeds found for "{bandFilter}" {mediaFilter !== 'all' ? `(${mediaFilter.toUpperCase()})` : ''} {searchQuery ? `with query "${searchQuery}"` : ''}.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMediaFilter('all');
                    setBandFilter('All');
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredChannels.map((channel) => {
                const isSelected = channel.id === selectedChannel.id;
                const isTv = channel.mediaType === 'tv';

                return (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setSelectedChannelId(channel.id);
                      setIsPlaying(true);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-950/50 to-slate-900 border-purple-500/80 shadow-lg ring-1 ring-purple-500/40'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isTv 
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {isTv ? <Tv className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white tracking-tight">
                              {channel.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                              {channel.callSign}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {channel.frequencyBand.split('/')[0].trim()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          LIVE
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {channel.listenersOrViewers.toLocaleString()} online
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {channel.tagline}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
                      <span className="px-1.5 py-0.2 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        {channel.bitrate.split(' ')[0]} {channel.resolution || 'Stereo'}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {channel.unrealIrcChannel}
                      </span>
                      {channel.isFuboTv && (
                        <span className="px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-300 border border-orange-500/30 flex items-center gap-1 font-semibold">
                          <Flame className="w-2.5 h-2.5 text-orange-400" />
                          {channel.fuboPackage || 'Fubo.tv'}
                        </span>
                      )}
                      {channel.isCablecast && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                          <Building2 className="w-2.5 h-2.5 text-emerald-400" />
                          Cablecast • {channel.cablecastCategory || 'PEG'}
                        </span>
                      )}
                      {channel.isWhiteHouseGov && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 flex items-center gap-1 font-semibold">
                          <Landmark className="w-2.5 h-2.5 text-blue-400" />
                          Whitehouse.gov • {channel.whitehouseCategory?.split(' ')[0] || 'Executive'}
                        </span>
                      )}
                      {channel.isTvuNetworks && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 font-semibold">
                          <Network className="w-2.5 h-2.5 text-cyan-400" />
                          TVU • {channel.tvuCategory || 'REMI'}
                        </span>
                      )}
                      {channel.botFleetAllocation && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-semibold">
                          <Bot className="w-2.5 h-2.5" />
                          {channel.botFleetAllocation.split('(')[0].trim()}
                        </span>
                      )}
                      {channel.fccCallSign && (
                        <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 flex items-center gap-1 font-semibold">
                          <Landmark className="w-2.5 h-2.5 text-sky-400" />
                          {channel.fccCallSign} ({channel.fccRulePart ? channel.fccRulePart.split(' ')[0] + ' ' + channel.fccRulePart.split(' ')[1] : 'FCC'})
                        </span>
                      )}
                      {channel.wittLawCertified && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                          <Scale className="w-2.5 h-2.5 text-amber-400" />
                          Witt Law Certified
                        </span>
                      )}
                      <span className="ml-auto text-sky-400 font-semibold">
                        {isSelected ? '▶ Tuning Live' : 'Select Channel'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* Witt Law Firm Registry Modal */}
      {showWittLawModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowWittLawModal(false); }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
        >
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh] my-auto cursor-default">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/50 flex items-center justify-center text-amber-300">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      {WITT_LAW_FIRM_REGISTRY.firmName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {WITT_LAW_FIRM_REGISTRY.certificationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-amber-300/80 font-mono">
                    General Counsel &amp; Spectrum Certification for DrFun1 Media Inc. • {WITT_LAW_FIRM_REGISTRY.website}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWittLawModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Legal Overview Details Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[10px]">LEGAL COUNSEL</span>
                <span className="font-bold text-white text-sm">{WITT_LAW_FIRM_REGISTRY.counselName}</span>
                <span className="text-[11px] text-slate-400">{WITT_LAW_FIRM_REGISTRY.barNumber}</span>
                <span className="text-[10px] text-slate-500 mt-1">{WITT_LAW_FIRM_REGISTRY.officeAddress}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[10px]">SPECTRUM &amp; BOT ALLOCATIONS</span>
                <span className="font-bold text-amber-300 text-sm">{WITT_LAW_FIRM_REGISTRY.certifiedChannelCount} Broadcast Channels</span>
                <span className="text-[11px] text-rose-300 font-bold">{WITT_LAW_FIRM_REGISTRY.totalBotFleetChannels.toLocaleString()} Bot Fleet Channels</span>
                <span className="text-[10px] text-emerald-400 mt-1">DeathRowBot, WestmoreBot, ShortwaveBot &amp; WhiteHouseBot</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[10px]">REGULATORY COMPLIANCE</span>
                <span className="font-bold text-sky-300 text-xs">FCC Part 25, 73 &amp; 74 Licensed</span>
                <span className="text-[10px] text-slate-400 mt-0.5">ITU Master Frequency Register &amp; FEMA EAS</span>
                <span className="text-[9px] text-slate-500 font-mono mt-1 truncate" title={WITT_LAW_FIRM_REGISTRY.verificationHash}>
                  {WITT_LAW_FIRM_REGISTRY.verificationHash}
                </span>
              </div>
            </div>

            {/* Scrollable Channels & Bot Fleets Sections */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Bot Fleets Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-rose-400" />
                  <span>Certified Bot Fleet Channel Matrix (880,000 Channels Total)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {WITT_LAW_FIRM_REGISTRY.botFleetBreakdown.map((bf) => (
                    <div key={bf.bot} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{bf.bot}</span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                          {bf.channels.toLocaleString()} Channels
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{bf.description}</p>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {bf.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Dynamic Channels Directory */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>Dynamic Certified DrFun1 Media Channels ({DRFUN1_BROADCAST_CHANNELS.length} Active Feeds)</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">All Licensed to Richard Alan Witt</span>
                </div>
                
                <div className="space-y-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-800 p-2 bg-slate-950/80">
                  {DRFUN1_BROADCAST_CHANNELS.map((ch, idx) => (
                    <div 
                      key={ch.id} 
                      className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-500 text-[10px] w-5">#{idx + 1}</span>
                        <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                          ch.mediaType === 'tv' ? 'bg-sky-500/20 text-sky-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {ch.mediaType === 'tv' ? 'TV' : 'FM'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs">{ch.name}</span>
                            <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-300">{ch.callSign}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{ch.frequencyBand}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {ch.botFleetAllocation && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">
                            {ch.botFleetAllocation.split('(')[0].trim()}
                          </span>
                        )}
                        <span className="text-[10px] text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                          {ch.wittLawFilingId || 'WITT-FCC-2026'}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedChannelId(ch.id);
                            setIsPlaying(true);
                            setShowWittLawModal(false);
                          }}
                          className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Tune
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="border-t border-slate-800 pt-3 mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <a
                  href="https://www.wittlawfirm.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit www.wittlawfirm.com</span>
                </a>
                <button
                  onClick={() => {
                    setBandFilter('Bot Fleets');
                    setShowWittLawModal(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Filter Bot Fleets Only</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAskWittLawFirm}
                  disabled={isSyncingWithWittLaw}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWithWittLaw ? 'animate-spin' : ''}`} />
                  <span>{isSyncingWithWittLaw ? 'Synchronizing Registry...' : 'Re-sync Registry Now'}</span>
                </button>
                <button
                  onClick={() => setShowWittLawModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FCC.gov Spectrum Database Modal */}
      {showFccModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowFccModal(false); }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
        >
          <div className="bg-slate-900 border border-sky-500/50 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh] my-auto cursor-default">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-sky-600/10 border border-sky-500/50 flex items-center justify-center text-sky-300">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      {FCC_GOV_REGISTRY.commission} Spectrum &amp; Broadcast Registry
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Active / Granted
                    </span>
                  </div>
                  <p className="text-xs text-sky-300/80 font-mono">
                    Official Telecommunications Authorizations • FRN: {FCC_GOV_REGISTRY.frn} • {FCC_GOV_REGISTRY.portalUrl}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFccModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Regulatory Details Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[10px]">APPLICANT &amp; LICENSEE</span>
                <span className="font-bold text-white text-xs">{FCC_GOV_REGISTRY.licensee}</span>
                <span className="text-[11px] text-sky-300 mt-1">FRN: {FCC_GOV_REGISTRY.frn}</span>
                <span className="text-[10px] text-slate-400">Counsel: {FCC_GOV_REGISTRY.legalRepresentative}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[10px]">ACTIVE FCC DATABASE FEEDS</span>
                <span className="font-bold text-sky-300 text-xs">LMS, ICFS/IBFS &amp; ULS Synchronized</span>
                <span className="text-[10px] text-slate-400 mt-1">OET Experimental Division &amp; ECFS</span>
                <span className="text-[10px] text-emerald-400 font-semibold mt-1">100% Granted / Good Standing</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[10px]">SPECTRUM &amp; SERVICE STATS</span>
                <span className="font-bold text-white text-sm">{FCC_GOV_REGISTRY.totalAuthorizations} Official Authorizations</span>
                <span className="text-[11px] text-purple-300">{FCC_GOV_REGISTRY.totalSpectrumBands} Frequency Bands</span>
                <span className="text-[10px] text-slate-400 mt-1">Last Sync: {FCC_GOV_REGISTRY.lastSyncTimestamp}</span>
              </div>
            </div>

            {/* Authorizations List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-sky-400" />
                  <span>FCC-Authorized Teleport, Broadcast &amp; Space Station Licenses</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {FCC_GOV_REGISTRY.authorizations.length} Primary Station Filings
                </span>
              </div>

              <div className="space-y-2">
                {FCC_GOV_REGISTRY.authorizations.map((auth) => (
                  <div
                    key={auth.callSign}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {auth.callSign.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-sm">{auth.callSign}</span>
                          <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30">
                            {auth.rulePart}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {auth.service}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">
                          Frequency: <span className="text-amber-300 font-semibold">{auth.frequency}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap gap-2">
                          <span>Facility: {auth.facilityId}</span>
                          <span>•</span>
                          <span>File: {auth.fileNumber}</span>
                          <span>•</span>
                          <span>Location: {auth.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-400 font-semibold block">{auth.status}</span>
                        <span className="text-[9px] text-slate-500">Exp: {auth.expiryDate}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedChannelId(auth.channelId);
                          setIsPlaying(true);
                          setShowFccModal(false);
                        }}
                        className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-sm"
                      >
                        Tune Station
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="border-t border-slate-800 pt-3 mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <a
                  href="https://www.fcc.gov/licensing-databases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit fcc.gov/licensing</span>
                </a>
                <button
                  onClick={() => {
                    setBandFilter('FCC Licensed');
                    setShowFccModal(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Filter FCC Channels Only</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAskFccGov}
                  disabled={isSyncingWithFcc}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-slate-950 font-bold hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWithFcc ? 'animate-spin' : ''}`} />
                  <span>{isSyncingWithFcc ? 'Querying FCC.gov...' : 'Re-query fcc.gov'}</span>
                </button>
                <button
                  onClick={() => setShowFccModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fubo.tv Live Television Lineup Modal */}
      {showFuboModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowFuboModal(false); }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
        >
          <div className="bg-slate-900 border border-orange-500/50 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh] my-auto cursor-default">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-600/10 border border-orange-500/50 flex items-center justify-center text-orange-400">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      {FUBO_TV_REGISTRY.platform}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono text-[10px] font-bold border border-orange-500/40 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {FUBO_TV_REGISTRY.totalChannels} Channels Active
                    </span>
                  </div>
                  <p className="text-xs text-orange-300/80 font-mono">
                    {FUBO_TV_REGISTRY.tagline} • {FUBO_TV_REGISTRY.website}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFuboModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Platform Specifications Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Cloud DVR</span>
                <span className="font-bold text-orange-300 text-[11px] truncate">1,000 Hours</span>
                <span className="text-[9px] text-slate-400">Instant scrub &amp; no expiry</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Simultaneous Screens</span>
                <span className="font-bold text-orange-300 text-[11px] truncate">10 Home / 3 Mobile</span>
                <span className="text-[9px] text-slate-400">Multi-screen streaming</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Video Resolution</span>
                <span className="font-bold text-orange-300 text-[11px] truncate">1080p60 &amp; 4K UHD</span>
                <span className="text-[9px] text-slate-400">CMAF low latency</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Transit Integration</span>
                <span className="font-bold text-orange-300 text-[11px] truncate">RisingNet &amp; Quantum</span>
                <span className="text-[9px] text-slate-400">Switch SUPERNAP hub</span>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 text-[11px] font-mono">
              {['All', 'Sports', 'Broadcast', 'News', 'Entertainment'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFuboCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    fuboCategoryFilter === cat
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/60 font-bold shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cat === 'All' && <span>All Lineup ({FUBO_TV_REGISTRY.totalChannels})</span>}
                  {cat === 'Sports' && <span>Sports (14)</span>}
                  {cat === 'Broadcast' && <span>Broadcast (4)</span>}
                  {cat === 'News' && <span>News (3)</span>}
                  {cat === 'Entertainment' && <span>Entertainment (3)</span>}
                </button>
              ))}
            </div>

            {/* Scrollable Channels List */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 max-h-[360px]">
              {DRFUN1_BROADCAST_CHANNELS
                .filter(c => c.isFuboTv)
                .filter(c => fuboCategoryFilter === 'All' || c.fuboCategory === fuboCategoryFilter)
                .map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-orange-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-xs">{ch.name}</span>
                          <span className="font-mono text-[10px] text-orange-400 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                            {ch.callSign}
                          </span>
                          {ch.fuboPackage && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
                              Package: {ch.fuboPackage}
                            </span>
                          )}
                          {ch.fuboCategory && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono">
                              {ch.fuboCategory}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {ch.tagline}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500 mt-1">
                          <span className="text-slate-300">Show: {ch.currentShow}</span>
                          <span>•</span>
                          <span className="text-orange-300/80">Host: {ch.nowPlayingHost}</span>
                          <span>•</span>
                          <span>Bitrate: {ch.bitrate}</span>
                          <span>•</span>
                          <span className="text-purple-400">{ch.unrealIrcChannel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-emerald-400 font-semibold block">Live 1080p60</span>
                        <span className="text-[9px] text-slate-500">Cloud Ingest Ready</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedChannelId(ch.id);
                          setIsPlaying(true);
                          setShowFuboModal(false);
                        }}
                        className="px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                      >
                        <Flame className="w-3 h-3" />
                        <span>Tune Station</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Modal Footer Controls */}
            <div className="border-t border-slate-800 pt-3 mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <a
                  href="https://www.fubo.tv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-orange-300 border border-orange-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit fubo.tv</span>
                </a>
                <button
                  onClick={() => {
                    setBandFilter('Fubo.tv');
                    setShowFuboModal(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Filter Fubo Channels Only</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAskFuboTv}
                  disabled={isSyncingWithFubo}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 text-slate-950 font-bold hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWithFubo ? 'animate-spin' : ''}`} />
                  <span>{isSyncingWithFubo ? 'Querying Fubo.tv...' : 'Re-query fubo.tv'}</span>
                </button>
                <button
                  onClick={() => setShowFuboModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cablecast.tv Community Media (Tightrope Media Systems) Modal */}
      {showCablecastModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowCablecastModal(false); }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
        >
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh] my-auto cursor-default">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-600/10 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      {CABLECAST_REGISTRY.platform}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-emerald-400" />
                      {CABLECAST_REGISTRY.totalChannels} PEG Feeds Active
                    </span>
                  </div>
                  <p className="text-xs text-emerald-300/80 font-mono">
                    {CABLECAST_REGISTRY.tagline} • {CABLECAST_REGISTRY.website}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCablecastModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Platform Specifications Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Broadcast Playout</span>
                <span className="font-bold text-emerald-300 text-[11px] truncate">Cablecast VIO Servers</span>
                <span className="text-[9px] text-slate-400">SDI / NDI / IP Ingest</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Cloud Delivery</span>
                <span className="font-bold text-emerald-300 text-[11px] truncate">Cablecast REFLECT</span>
                <span className="text-[9px] text-slate-400">Zero-buffer dynamic edge</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">OTT Distribution</span>
                <span className="font-bold text-emerald-300 text-[11px] truncate">Screenweave OTT</span>
                <span className="text-[9px] text-slate-400">Apple TV, Roku, Fire TV</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Civic Accessibility</span>
                <span className="font-bold text-emerald-300 text-[11px] truncate">EAS &amp; Auto-Captioning</span>
                <span className="text-[9px] text-slate-400">Gavel-to-gavel records</span>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 text-[11px] font-mono">
              {['All', 'Community', 'Government', 'Education', 'Metro Health', 'Arts & Culture', 'Legislative', 'OTT Cloud'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCablecastCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    cablecastCategoryFilter === cat
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cat === 'All' ? `All PEG (${CABLECAST_REGISTRY.totalChannels})` : cat}
                </button>
              ))}
            </div>

            {/* Scrollable Channels List */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 max-h-[360px]">
              {DRFUN1_BROADCAST_CHANNELS
                .filter(c => c.isCablecast)
                .filter(c => cablecastCategoryFilter === 'All' || c.cablecastCategory === cablecastCategoryFilter)
                .map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-xs">{ch.name}</span>
                          <span className="font-mono text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            {ch.callSign}
                          </span>
                          {ch.cablecastCategory && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono">
                              Category: {ch.cablecastCategory}
                            </span>
                          )}
                          {ch.cablecastStation && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
                              {ch.cablecastStation}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {ch.tagline}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500 mt-1">
                          <span className="text-slate-300">Show: {ch.currentShow}</span>
                          <span>•</span>
                          <span className="text-emerald-300/80">Host: {ch.nowPlayingHost}</span>
                          <span>•</span>
                          <span>Bitrate: {ch.bitrate}</span>
                          <span>•</span>
                          <span className="text-purple-400">{ch.unrealIrcChannel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-emerald-400 font-semibold block">Tightrope REFLECT</span>
                        <span className="text-[9px] text-slate-500">Screenweave OTT Ready</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedChannelId(ch.id);
                          setIsPlaying(true);
                          setShowCablecastModal(false);
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                      >
                        <Building2 className="w-3 h-3" />
                        <span>Tune Station</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Modal Footer Controls */}
            <div className="border-t border-slate-800 pt-3 mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <a
                  href="https://www.cablecast.tv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit cablecast.tv</span>
                </a>
                <button
                  onClick={() => {
                    setBandFilter('Cablecast.tv');
                    setShowCablecastModal(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Filter Cablecast Channels Only</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAskCablecast}
                  disabled={isSyncingWithCablecast}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 font-bold hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWithCablecast ? 'animate-spin' : ''}`} />
                  <span>{isSyncingWithCablecast ? 'Querying Cablecast.tv...' : 'Re-query cablecast.tv'}</span>
                </button>
                <button
                  onClick={() => setShowCablecastModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TVU Networks (tvunetworks.com) IP Video Contribution & REMI Modal */}
      {showTvuModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowTvuModal(false); }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
        >
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh] my-auto cursor-default">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/10 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                  <Network className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      {TVU_NETWORKS_REGISTRY.platform}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40 flex items-center gap-1">
                      <Network className="w-3 h-3 text-cyan-400" />
                      {TVU_NETWORKS_REGISTRY.totalChannels} Live Grid Feeds
                    </span>
                  </div>
                  <p className="text-xs text-cyan-300/80 font-mono">
                    {TVU_NETWORKS_REGISTRY.tagline} • {TVU_NETWORKS_REGISTRY.website}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowTvuModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Platform Specifications Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">REMI Sync Latency</span>
                <span className="font-bold text-cyan-300 text-[11px] truncate">0.3s Sub-Second</span>
                <span className="text-[9px] text-slate-400">Multi-camera sync</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">TVU Grid Matrix</span>
                <span className="font-bold text-cyan-300 text-[11px] truncate">3,000+ Broadcasters</span>
                <span className="text-[9px] text-slate-400">Global content pool</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Cellular Bonding</span>
                <span className="font-bold text-cyan-300 text-[11px] truncate">TVU One 5G IS+</span>
                <span className="text-[9px] text-slate-400">Inverse StatMux transmission</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Cognitive AI Search</span>
                <span className="font-bold text-cyan-300 text-[11px] truncate">TVU MediaHub</span>
                <span className="text-[9px] text-slate-400">Real-time STT &amp; facial index</span>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 text-[11px] font-mono">
              {['All', 'Global News', 'Sports REMI', 'Field Operations', 'Cloud Playout', 'AI NewsWire', 'Emergency & Aerial'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTvuCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    tvuCategoryFilter === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cat === 'All' ? `All TVU (${TVU_NETWORKS_REGISTRY.totalChannels})` : cat}
                </button>
              ))}
            </div>

            {/* Scrollable Channels List */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 max-h-[360px]">
              {DRFUN1_BROADCAST_CHANNELS
                .filter(c => c.isTvuNetworks)
                .filter(c => tvuCategoryFilter === 'All' || c.tvuCategory === tvuCategoryFilter)
                .map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-xs">{ch.name}</span>
                          <span className="font-mono text-[10px] text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                            {ch.callSign}
                          </span>
                          {ch.tvuCategory && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
                              Category: {ch.tvuCategory}
                            </span>
                          )}
                          {ch.tvuService && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
                              {ch.tvuService}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {ch.tagline}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500 mt-1">
                          <span className="text-slate-300">Show: {ch.currentShow}</span>
                          <span>•</span>
                          <span className="text-cyan-300/80">Host: {ch.nowPlayingHost}</span>
                          <span>•</span>
                          <span>Bitrate: {ch.bitrate}</span>
                          <span>•</span>
                          <span className="text-purple-400">{ch.unrealIrcChannel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-cyan-400 font-semibold block">TVU Grid Active</span>
                        <span className="text-[9px] text-slate-500">IS+ 0.3s Latency</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedChannelId(ch.id);
                          setIsPlaying(true);
                          setShowTvuModal(false);
                        }}
                        className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                      >
                        <Network className="w-3 h-3 text-slate-950" />
                        <span>Tune Station</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Modal Footer Controls */}
            <div className="border-t border-slate-800 pt-3 mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <a
                  href="https://www.tvunetworks.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit tvunetworks.com</span>
                </a>
                <button
                  onClick={() => {
                    setBandFilter('tvunetworks.com');
                    setShowTvuModal(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Filter TVU Networks Only</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAskTvuNetworks}
                  disabled={isSyncingWithTvu}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-500 text-slate-950 font-bold hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWithTvu ? 'animate-spin' : ''}`} />
                  <span>{isSyncingWithTvu ? 'Querying tvunetworks.com...' : 'Re-query tvunetworks'}</span>
                </button>
                <button
                  onClick={() => setShowTvuModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Whitehouse.gov Executive Channels Registry Modal */}
      {showWhitehouseModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowWhitehouseModal(false); }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
        >
          <div className="bg-slate-900 border border-blue-500/50 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh] my-auto cursor-default">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-600/10 border border-blue-500/50 flex items-center justify-center text-blue-400">
                  <Landmark className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      {WHITEHOUSE_GOV_REGISTRY.institution}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/40 flex items-center gap-1">
                      <Landmark className="w-3 h-3 text-blue-400" />
                      {WHITEHOUSE_GOV_REGISTRY.totalChannels} Executive Feeds
                    </span>
                  </div>
                  <p className="text-xs text-blue-300/80 font-mono">
                    {WHITEHOUSE_GOV_REGISTRY.executiveOffice} • {WHITEHOUSE_GOV_REGISTRY.website}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWhitehouseModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Platform Specifications Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Agency Partner</span>
                <span className="font-bold text-blue-300 text-[11px] truncate">WHCA &amp; FEMA</span>
                <span className="text-[9px] text-slate-400">Executive Defense Comms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Direct Relays</span>
                <span className="font-bold text-blue-300 text-[11px] truncate">{WHITEHOUSE_GOV_REGISTRY.totalDirectRelays.toLocaleString()} EAS Nodes</span>
                <span className="text-[9px] text-slate-400">WhiteHouseBot Matrix</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Legal Escrow</span>
                <span className="font-bold text-amber-300 text-[11px] truncate">Witt Law Certified</span>
                <span className="text-[9px] text-slate-400">Richard Alan Witt, Esq.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase">Uplink Teleport</span>
                <span className="font-bold text-emerald-300 text-[11px] truncate">Switch SUPERNAP 7, 8, 9</span>
                <span className="text-[9px] text-slate-400">100G RisingNet Optical</span>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 text-[11px] font-mono">
              {['All', 'Presidential Briefings', 'Cabinet & Policy', 'National Security & Defense', 'WHCA & Communications', 'OSTP & Science', 'Executive Emergency Alerts'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setWhitehouseCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    whitehouseCategoryFilter === cat
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/60 font-bold shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cat === 'All' ? `All White House (${WHITEHOUSE_GOV_REGISTRY.totalChannels})` : cat}
                </button>
              ))}
            </div>

            {/* Scrollable Channels List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
              {DRFUN1_BROADCAST_CHANNELS
                .filter(ch => ch.isWhiteHouseGov)
                .filter(ch => whitehouseCategoryFilter === 'All' || ch.whitehouseCategory === whitehouseCategoryFilter)
                .map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">{ch.name}</span>
                          <span className="px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/30">
                            {ch.callSign}
                          </span>
                          <span className="px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px]">
                            {ch.whitehouseCategory || 'Executive'}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[9px]">
                            {ch.securityClassification || 'Public Release'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{ch.tagline}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 flex-wrap">
                          <span className="text-blue-300/80">Directive: {ch.presidentialDirective || 'Executive Order'}</span>
                          <span>•</span>
                          <span>Carrier: {ch.carrierFrequency}</span>
                          <span>•</span>
                          <span className="text-purple-400">{ch.unrealIrcChannel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-blue-400 font-semibold block">{ch.bitrate}</span>
                        <span className="text-[9px] text-slate-500">{ch.resolution || 'Direct Audio'}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedChannelId(ch.id);
                          setIsPlaying(true);
                          setShowWhitehouseModal(false);
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                      >
                        <Landmark className="w-3 h-3" />
                        <span>Tune Station</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Modal Footer Controls */}
            <div className="border-t border-slate-800 pt-3 mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <a
                  href="https://www.whitehouse.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit whitehouse.gov</span>
                </a>
                <button
                  onClick={() => {
                    setBandFilter('Whitehouse.gov');
                    setShowWhitehouseModal(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Filter White House Channels Only</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAskWhitehouse}
                  disabled={isSyncingWithWhitehouse}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWithWhitehouse ? 'animate-spin' : ''}`} />
                  <span>{isSyncingWithWhitehouse ? 'Querying whitehouse.gov...' : 'Re-query whitehouse.gov'}</span>
                </button>
                <button
                  onClick={() => setShowWhitehouseModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
