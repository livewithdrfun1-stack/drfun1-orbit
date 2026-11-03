import React, { useState, useEffect, useRef } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Globe, 
  Layers, 
  Send, 
  Sliders, 
  Terminal, 
  ExternalLink, 
  Sparkles, 
  Server, 
  ShieldCheck, 
  Eye, 
  FileCode, 
  CheckCircle2,
  RefreshCw,
  Share2,
  Cpu,
  Tv,
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Activity,
  Hash,
  MessageSquare,
  Network,
  Info,
  Smartphone
} from 'lucide-react';

interface WordPressIrcDuplicatorViewProps {
  onBackToMesh?: () => void;
  onOpenIrc?: () => void;
  onOpenMedia?: () => void;
}

interface WittLawChannelProfile {
  id: string;
  channelNumber: number;
  name: string;
  callSign: string;
  network: string;
  fccPart: string;
  resolution: string;
  ircChannel: string;
  streamUrl: string;
  program: string;
  host: string;
  viewers: number;
  freq: string;
}

const WITT_LAW_BROADCAST_CHANNELS: WittLawChannelProfile[] = [
  {
    id: 'ch-101',
    channelNumber: 101,
    name: 'DrFun1 Media Prime TV 4K',
    callSign: 'WDF1-TV',
    network: 'DrFun1 Media Inc. & Witt Law Firm',
    fccPart: 'FCC Part 73 DTV / Part 25 Earth Station',
    resolution: '4K UHD (2160p60)',
    ircChannel: '#drfun1-primetv',
    streamUrl: 'https://cdn.drfun1.com/hls/tv1-4k.m3u8',
    program: 'Space Horizon 360: LEO Constellation Launch Coverage',
    host: 'Richard Alan Witt, Esq. & DrFun1 NOC',
    viewers: 9420,
    freq: '29.50 GHz Ka-Band / 1550nm Laser'
  },
  {
    id: 'ch-102',
    channelNumber: 102,
    name: 'DrFun1 Satcom 24/7 News TV',
    callSign: 'KDF1-DT',
    network: 'DrFun1 Media Inc. & Witt Law Firm',
    fccPart: 'FCC Part 73 Digital TV Broadcast',
    resolution: '1080p60 Full HD',
    ircChannel: '#drfun1-satcomnews',
    streamUrl: 'https://cdn.drfun1.com/hls/news-1080p.m3u8',
    program: 'Global Satcom Regulatory News & FCC Spectrum Filings',
    host: 'Elena Rostova & Telecom Legal Desk',
    viewers: 6380,
    freq: '14.25 GHz Ku-Band Uplink'
  },
  {
    id: 'ch-103',
    channelNumber: 103,
    name: 'DrFun1 Wireless 5G Network TV',
    callSign: 'WDF1-WL',
    network: 'DrFun1 Media Inc. & Witt Law Firm',
    fccPart: 'FCC Part 27 5G Broadband / Part 25 NTN',
    resolution: '1080p60 Full HD',
    ircChannel: '#drfun1-wirelesstv',
    streamUrl: 'https://cdn.drfun1.com/hls/wireless-1080p.m3u8',
    program: 'Factory Unlocked Smartphones & Direct-to-Cell Showcase',
    host: 'DrFun1 Mobile Engineering Team',
    viewers: 5120,
    freq: '1900 MHz PCS / Band n255 NTN'
  },
  {
    id: 'ch-104',
    channelNumber: 104,
    name: 'DrFun1 4K Teleport Earth Station TV',
    callSign: 'KDF1-4K',
    network: 'DrFun1 Media Inc. & Witt Law Firm',
    fccPart: 'FCC Part 25 Commercial Earth Station',
    resolution: '4K UHD (3840x2160)',
    ircChannel: '#drfun1-4kspace',
    streamUrl: 'https://cdn.drfun1.com/hls/teleport-4k.m3u8',
    program: 'Switch SUPERNAP Nevada Tier-5 Earth Station Cam',
    host: 'Switch Teleport Ground Operations',
    viewers: 4290,
    freq: '3.95 GHz C-Band & Optical Lasers'
  },
  {
    id: 'ch-105',
    channelNumber: 105,
    name: 'DrFun1 24/7 Orbit Radio Visualizer TV',
    callSign: 'WDF1-FM',
    network: 'DrFun1 Media Inc. & Witt Law Firm',
    fccPart: 'FCC Part 73 FM & Internet Streaming',
    resolution: '1080p60 Audio Canvas',
    ircChannel: '#drfun1-orbitradio',
    streamUrl: 'https://cdn.drfun1.com/hls/radio-visualizer.m3u8',
    program: 'Death Row Records x MPD Bot Live DJ Rotation',
    host: 'DJ Orbit Nova & Vinyl Kev',
    viewers: 7810,
    freq: '2332.5 MHz S-Band Digital Audio'
  },
  {
    id: 'ch-106',
    channelNumber: 106,
    name: 'Witt Law Spectrum & Telecom Legal TV',
    callSign: 'RAW-LAW',
    network: 'The Law Office of Richard A. Witt LLC',
    fccPart: 'FCC FRN: 0034981290 / ITU Space Filings',
    resolution: '1080p60 Full HD',
    ircChannel: '#wittlaw-spectrum',
    streamUrl: 'https://cdn.wittlawfirm.com/hls/legal-briefings.m3u8',
    program: 'Orbital Slot Title Escrow & Indefeasible Right of Use (IRU)',
    host: 'Richard Alan Witt, Esq. (Lead Counsel)',
    viewers: 3450,
    freq: 'Encrypted Legal Escrow Teleport Link'
  },
  {
    id: 'ch-107',
    channelNumber: 107,
    name: 'Switch SUPERNAP Teleport Ground TV',
    callSign: 'SW-NAP',
    network: 'Switch.com & Witt Law Firm',
    fccPart: 'Class 5 Platinum SuperNAP Operations',
    resolution: '1080p60 60fps',
    ircChannel: '#switch-teleport',
    streamUrl: 'https://cdn.switch.com/hls/supernap-ground.m3u8',
    program: 'Switch Core & Citadel 100% Green Teleport Operations',
    host: 'Switch Master Colocation Control',
    viewers: 4890,
    freq: 'SuperLoop Optical Fiber Interconnect'
  },
  {
    id: 'ch-108',
    channelNumber: 108,
    name: 'All-Bands Radar & Deep Space TV',
    callSign: 'RADAR-X',
    network: 'DrFun1 Media Inc. & Witt Law Firm',
    fccPart: 'FCC Part 25 NGSO Tracking / Radar',
    resolution: '1080p60 Telemetry',
    ircChannel: '#all-bands',
    streamUrl: 'https://cdn.drfun1.com/hls/radar-deepspace.m3u8',
    program: 'Global Ionospheric Radar & Satellite Constellation Tracker',
    host: 'Deep Space Operations Telemetry',
    viewers: 3910,
    freq: 'X-Band (8.4 GHz) & Ka-Band Space Network'
  },
  {
    id: 'ch-201',
    channelNumber: 201,
    name: 'CBS Television Network HD',
    callSign: 'WCBS-TV',
    network: 'Paramount Global (Syndicated)',
    fccPart: 'FCC Part 73 DTV Broadcast',
    resolution: '1080i / 1080p60 HDR',
    ircChannel: '#paramount-cbs',
    streamUrl: 'https://cdn.paramount.com/hls/cbs-east.m3u8',
    program: 'CBS Evening News & Space Defense Report',
    host: 'Norah O\'Donnell',
    viewers: 28400,
    freq: 'UHF Ch 36 (605 MHz)'
  },
  {
    id: 'ch-301',
    channelNumber: 301,
    name: 'ABC Television Network HD',
    callSign: 'WABC-TV',
    network: 'The Walt Disney Company (Syndicated)',
    fccPart: 'FCC Part 73 DTV Broadcast',
    resolution: '720p60 / 1080p60 HDR',
    ircChannel: '#disney-abc',
    streamUrl: 'https://cdn.disney.com/hls/abc-east.m3u8',
    program: 'Good Morning America / World News Tonight',
    host: 'David Muir & ABC News Anchors',
    viewers: 32100,
    freq: 'VHF Ch 7 (177 MHz)'
  },
  {
    id: 'ch-701',
    channelNumber: 701,
    name: 'Starlink Direct-to-Cell LEO Relay',
    callSign: 'SLK-LEO',
    network: 'SATCOM Satellite Feeds (Partner)',
    fccPart: 'FCC Part 25 NGSO Satellite Earth Station',
    resolution: '4K UHD 60fps',
    ircChannel: '#satcom-starlink',
    streamUrl: 'https://cdn.drfun1.com/hls/starlink-stream.m3u8',
    program: 'Starlink Direct-to-Cell Packet Gateway Live Feed',
    host: 'Starlink Satcom Network Operations',
    viewers: 18900,
    freq: '12.5 GHz LEO Gateway / 1910 MHz Cell'
  },
  {
    id: 'ch-801',
    channelNumber: 801,
    name: 'White House Brady Press Briefing Room 4K',
    callSign: 'WH-BRIEF-4K',
    network: 'Whitehouse.gov (Executive Pool)',
    fccPart: 'Part 74 Broadcast Auxiliary / WHCA Executive Direct',
    resolution: '4K UHD (3840x2160) 60fps HDR',
    ircChannel: '#whitehouse-briefings',
    streamUrl: 'https://cdn.whitehouse.gov/hls/briefing-4k.m3u8',
    program: 'White House Press Secretary Daily Briefing',
    host: 'White House Press Office & Senior Officials',
    viewers: 42800,
    freq: 'Ka-Band / 1550nm Laser Direct'
  },
  {
    id: 'ch-802',
    channelNumber: 802,
    name: 'White House Oval Office & East Room Live TV',
    callSign: 'WH-OVAL-TV',
    network: 'Whitehouse.gov (Executive Pool)',
    fccPart: 'Part 74 Executive Order Pool / Part 25 Earth Station',
    resolution: '4K UHD (3840x2160) 60fps HDR',
    ircChannel: '#whitehouse-oval',
    streamUrl: 'https://cdn.whitehouse.gov/hls/oval-4k.m3u8',
    program: 'Presidential Address to the Nation & Treaties',
    host: 'President of the United States & Cabinet',
    viewers: 67200,
    freq: 'Ku/Ka-Band Dual-Carrier Teleport'
  },
  {
    id: 'ch-821',
    channelNumber: 821,
    name: 'FCC Open Commission Meeting Live 4K',
    callSign: 'FCC-COMM-4K',
    network: 'FCC.gov (Federal Regulatory)',
    fccPart: '47 CFR Part 0 / Commission Public Proceedings',
    resolution: '4K UHD (3840x2160) 60fps HDR',
    ircChannel: '#fcc-hearings',
    streamUrl: 'https://cdn.fcc.gov/hls/commission-4k.m3u8',
    program: 'FCC Open Monthly Commission Meeting & Spectrum Voting',
    host: 'FCC Chair & Commissioners',
    viewers: 28900,
    freq: 'Ka-Band / 100G DC Optical Direct'
  },
  {
    id: 'ch-822',
    channelNumber: 822,
    name: 'FCC Space Bureau & Satellite Teleport Playout',
    callSign: 'FCC-SPACE-TV',
    network: 'FCC.gov (Federal Regulatory)',
    fccPart: 'Part 25 Satellite Communications Regulations',
    resolution: '1080p60 Full HD',
    ircChannel: '#fcc-space',
    streamUrl: 'https://cdn.fcc.gov/hls/space-bureau.m3u8',
    program: 'FCC Space Bureau: Commercial Earth Station Licensing',
    host: 'FCC Space Bureau Chief & Satellite Counsel',
    viewers: 19400,
    freq: '14.00 GHz Teleport Earth Station'
  },
  {
    id: 'ch-601',
    channelNumber: 601,
    name: 'DISH Network Satellite Command Channel 101',
    callSign: 'DISH-101',
    network: 'Dish.com (Dish Network DBS)',
    fccPart: 'Part 25 Direct Broadcast Satellite (DBS)',
    resolution: '1080p60 Full HD',
    ircChannel: '#dish-satellite',
    streamUrl: 'https://cdn.dish.com/hls/ch101.m3u8',
    program: 'DISH Master Interactive Playout & On-Demand Highlights',
    host: 'DISH Master Playout Automation',
    viewers: 22800,
    freq: 'Ku-Band DBS (119°W & 110°W)'
  },
  {
    id: 'ch-603',
    channelNumber: 603,
    name: 'AXS TV HD Concerts & Combat Sports',
    callSign: 'AXS-TV',
    network: 'Dish.com (Dish Network DBS)',
    fccPart: 'Part 76 Cable Playout',
    resolution: '1080p60 Full HD',
    ircChannel: '#dish-axstv',
    streamUrl: 'https://cdn.dish.com/hls/axstv.m3u8',
    program: 'Classic Rock Legends Live at Red Rocks Amphitheatre',
    host: 'AXS Concert Series',
    viewers: 13400,
    freq: 'EchoStar X Transponder 14'
  },
  {
    id: 'ch-851',
    channelNumber: 851,
    name: 'Fubo Sports Network HD',
    callSign: 'FUBO-SPORTS',
    network: 'Fubo.tv (Live Sports & Entertainment)',
    fccPart: 'Fubo Cloud CDN OTT / FCC Part 76 Playout',
    resolution: '1080p60 Full HD 60fps',
    ircChannel: '#fubo-sports',
    streamUrl: 'https://cdn.fubo.tv/hls/fubo-sports-1080p.m3u8',
    program: 'No Chill with Gilbert Arenas & Fubo Live Match Center',
    host: 'Gilbert Arenas & Fubo Sports Anchors',
    viewers: 32600,
    freq: 'Anycast Edge CDN 10 Gbps'
  },
  {
    id: 'ch-852',
    channelNumber: 852,
    name: 'Fubo Sports Network Xtra',
    callSign: 'FUBO-XTRA',
    network: 'Fubo.tv (Live Sports & Entertainment)',
    fccPart: 'Fubo Cloud OTT Multicast',
    resolution: '1080p60 Full HD',
    ircChannel: '#fubo-xtra',
    streamUrl: 'https://cdn.fubo.tv/hls/fubo-xtra-1080p.m3u8',
    program: 'International Football Showcase: European Tournament',
    host: 'Fubo International Commentary Team',
    viewers: 21400,
    freq: 'Edge CDN Low-Latency Relay'
  },
  {
    id: 'ch-853',
    channelNumber: 853,
    name: 'Fubo Pro Live Stadium 4K',
    callSign: 'FUBO-STADIUM',
    network: 'Fubo.tv (Live Sports & Entertainment)',
    fccPart: 'Fubo Cloud 4K UHD Broadcast',
    resolution: '4K UHD (3840x2160) 60fps HDR',
    ircChannel: '#fubo-stadium',
    streamUrl: 'https://cdn.fubo.tv/hls/stadium-4k.m3u8',
    program: 'Fubo Pro Primetime Stadium: College Football Showdowns',
    host: 'Fubo Sports Stadium Desk',
    viewers: 44800,
    freq: 'Ultra Low-Latency CMAF < 2.5s'
  }
];

export const WordPressIrcDuplicatorView: React.FC<WordPressIrcDuplicatorViewProps> = ({
  onBackToMesh,
  onOpenIrc,
  onOpenMedia,
}) => {
  // Navigation / Tab states
  const [activeTab, setActiveTab] = useState<'preview' | 'channels_matrix' | 'wp_plugin' | 'html_embed' | 'shortcode' | 'rest_api'>('preview');
  
  // Player state
  const [selectedChannelId, setSelectedChannelId] = useState<string>('ch-101');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(75);
  const [isAudioSynthActive, setIsAudioSynthActive] = useState<boolean>(true);
  const [isStationVoiceEnabled, setIsStationVoiceEnabled] = useState<boolean>(true);

  // Widget Settings
  const [widgetTheme, setWidgetTheme] = useState<'dark' | 'light' | 'matrix' | 'purple'>('dark');
  const [widgetHeight, setWidgetHeight] = useState<number>(560);
  const [allowGuestPosting, setAllowGuestPosting] = useState<boolean>(true);
  const [nickPrefix, setNickPrefix] = useState<string>('[WP]');
  const [autoplay, setAutoplay] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Active channel profile
  const activeChannel = WITT_LAW_BROADCAST_CHANNELS.find(c => c.id === selectedChannelId) || WITT_LAW_BROADCAST_CHANNELS[0];

  // Canvas visualizer ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{
    osc1?: OscillatorNode;
    osc2?: OscillatorNode;
    filter?: BiquadFilterNode;
    gain?: GainNode;
  }>({});
  const audioTimerRef = useRef<any>(null);

  // Interactive 1:1 IRC Chat messages
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    timestamp: string;
    nick: string;
    text: string;
    source: 'wordpress' | 'irc';
    channel: string;
  }>>([
    {
      id: 'm-1',
      timestamp: '11:00 AM',
      nick: 'WittLawNOC',
      text: `[1:1 SYNC] Tuning stream to ${activeChannel.name} (${activeChannel.callSign}). Dedicated room ${activeChannel.ircChannel} verified on irc.drfun1.com.`,
      source: 'irc',
      channel: activeChannel.ircChannel,
    },
    {
      id: 'm-2',
      timestamp: '11:01 AM',
      nick: 'SatcomAuditor',
      text: 'Telemetry confirmed via Switch SUPERNAP colocation hub. Subcarrier 1550nm laser carrier online.',
      source: 'irc',
      channel: activeChannel.ircChannel,
    },
    {
      id: 'm-3',
      timestamp: '11:02 AM',
      nick: 'WP_Visitor',
      text: 'Watching directly through the embedded WordPress media player! Stream is crisp.',
      source: 'wordpress',
      channel: activeChannel.ircChannel,
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatNick, setChatNick] = useState<string>('SiteVisitor');

  // Trigger speech station voice ID
  const announceStationVoice = (ch: WittLawChannelProfile) => {
    if (!isStationVoiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `DrFun1 Media and Witt Law Firm broadcast network. Now playing channel ${ch.channelNumber}, ${ch.name}, call sign ${ch.callSign}. Joined dedicated 1 to 1 IRC room ${ch.ircChannel} on irc.drfun1.com.`
      );
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = isMuted ? 0 : Math.min(1, volume / 100);
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  };

  // Channel switcher handler (enforcing 1:1 ratio)
  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
    const targetCh = WITT_LAW_BROADCAST_CHANNELS.find(c => c.id === channelId);
    if (targetCh) {
      announceStationVoice(targetCh);
      // Append system 1:1 transition notice
      const notice = {
        id: `sys-tune-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        nick: 'System_1to1',
        text: `[1:1 RATIO ENFORCED] Tuned to CH ${targetCh.channelNumber} — ${targetCh.name}. Switched IRC room to ${targetCh.ircChannel}.`,
        source: 'irc' as const,
        channel: targetCh.ircChannel,
      };
      setChatMessages(prev => [...prev, notice]);
    }
  };

  // Web Audio Synthesizer Loop
  useEffect(() => {
    if (!isAudioSynthActive || !isPlaying || isMuted) {
      if (synthNodesRef.current.gain) {
        synthNodesRef.current.gain.gain.setValueAtTime(0, 0);
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const masterGain = ctx.createGain();
      const targetVol = Math.max(0.01, (volume / 100) * 0.15);
      masterGain.gain.setValueAtTime(targetVol, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';

      const leadGain = ctx.createGain();
      leadGain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc2.connect(leadGain);
      leadGain.connect(filter);
      osc1.connect(filter);

      // Chords based on channel
      let baseNotes = [130.81, 164.81, 196.00, 261.63];
      if (activeChannel.name.includes('News') || activeChannel.name.includes('Legal')) {
        baseNotes = [146.83, 220.00, 293.66, 370.00];
      } else if (activeChannel.name.includes('Radio')) {
        baseNotes = [110.00, 164.81, 220.00, 261.63, 329.63];
      }

      osc1.frequency.setValueAtTime(baseNotes[0] * 0.5, ctx.currentTime);
      osc2.frequency.setValueAtTime(baseNotes[0], ctx.currentTime);

      osc1.start();
      osc2.start();

      let step = 0;
      audioTimerRef.current = setInterval(() => {
        if (!ctx || ctx.state !== 'running') return;
        step = (step + 1) % baseNotes.length;
        const currentFreq = baseNotes[step];
        const now = ctx.currentTime;
        osc2.frequency.setTargetAtTime(currentFreq, now, 0.08);
        filter.frequency.setTargetAtTime(700 + Math.sin(step) * 400, now, 0.1);
      }, 450);

      synthNodesRef.current = { osc1, osc2, filter, gain: masterGain };
    } catch (_) {}

    return () => {
      if (audioTimerRef.current) {
        clearInterval(audioTimerRef.current);
        audioTimerRef.current = null;
      }
      if (synthNodesRef.current.osc1) {
        try { synthNodesRef.current.osc1.stop(); } catch (_) {}
      }
      if (synthNodesRef.current.osc2) {
        try { synthNodesRef.current.osc2.stop(); } catch (_) {}
      }
    };
  }, [isPlaying, isMuted, volume, isAudioSynthActive, activeChannel]);

  // HTML5 Canvas Broadcast Visualizer Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      angle += 0.02;

      // Dark gradient space background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#030712');
      grad.addColorStop(0.5, '#0b1329');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Starfield dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 123) % width);
        const sy = ((i * 77) % height);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Rotating Earth / Satellite Orbit
      ctx.save();
      ctx.translate(width / 2, height / 2 - 20);

      // Earth Globe circle
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      // Latitude lines
      ctx.beginPath();
      ctx.ellipse(0, 0, 48, 20, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.stroke();

      // Satellite Orbit ellipse
      ctx.beginPath();
      ctx.ellipse(0, 0, 95, 36, Math.PI / 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Orbiting Satellite dot
      const satX = Math.cos(angle) * 95;
      const satY = Math.sin(angle) * 36;
      ctx.beginPath();
      ctx.arc(satX, satY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();

      // Audio Spectrum Analyzer Bars at the bottom
      const barCount = 32;
      const barWidth = width / barCount - 2;
      for (let i = 0; i < barCount; i++) {
        const barHeight = isPlaying 
          ? Math.abs(Math.sin(angle * 3 + i * 0.4)) * 55 + Math.cos(i) * 15 + 8
          : 6;
        const bx = i * (barWidth + 2) + 2;
        const by = height - barHeight - 10;

        const barGrad = ctx.createLinearGradient(0, height, 0, by);
        barGrad.addColorStop(0, '#0284c7');
        barGrad.addColorStop(0.5, '#38bdf8');
        barGrad.addColorStop(1, '#a855f7');

        ctx.fillStyle = barGrad;
        ctx.fillRect(bx, by, barWidth, barHeight);
      }

      // On-Screen Center Call Sign
      ctx.font = 'bold 22px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`[ ${activeChannel.callSign} ] ${activeChannel.name}`, width / 2, height / 2 + 65);

      ctx.font = '12px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`1:1 IRC ROOM: ${activeChannel.ircChannel} @ irc.drfun1.com`, width / 2, height / 2 + 88);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, activeChannel]);

  // Copy helper
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 3000);
  };

  // Interactive Live Chat submission
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: `m-live-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      nick: chatNick.trim() || 'Visitor',
      text: chatInput.trim(),
      source: 'wordpress' as const,
      channel: activeChannel.ircChannel,
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Simulate 1:1 IRC packet response from UnrealIRCd
    setTimeout(() => {
      const reply = {
        id: `m-rep-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        nick: 'DrFun1_IRCD',
        text: `[1:1 IRC ACK] Packet received in ${activeChannel.ircChannel}: "${newMsg.text.slice(0, 32)}" (0.8ms)`,
        source: 'irc' as const,
        channel: activeChannel.ircChannel,
      };
      setChatMessages(prev => [...prev, reply]);
    }, 1000);
  };

  // Generate complete WordPress Plugin PHP Code
  const generateWordPressPluginPhp = () => {
    return `<?php
/**
 * Plugin Name: DrFun1 Media & Witt Law Firm Broadcast Player & 1:1 IRC Synchronizer
 * Plugin URI: https://www.wittlawfirm.com
 * Description: Production WordPress Media Player & 1:1 IRC Synchronizer. Stream all broadcasting networks owned by Richard Alan Witt LLC (www.wittlawfirm.com) and DrFun1 Media Inc. with a strict 1:1 ratio: 1 broadcast channel to 1 dedicated IRC chat room on irc.drfun1.com.
 * Version: 2.5.0
 * Author: DrFun1 Media Inc. & Richard Alan Witt LLC (Cert: RAW-SATCOM-2026-LIC-0881 | FCC FRN: 0034981290)
 * Author URI: https://www.wittlawfirm.com
 * License: GPLv2 or later
 * Text Domain: drfun1-wittlaw-media-player
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class DrFun1_WittLaw_Media_Player {

    private static $instance = null;
    private $version = '2.5.0';

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        add_action('init', array($this, 'register_assets'));
        add_shortcode('drfun1_broadcast_player', array($this, 'render_broadcast_player_shortcode'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('widgets_init', array($this, 'register_widget'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
    }

    public function register_assets() {
        wp_register_style('drfun1-player-css', false);
        wp_register_script('hls-js', 'https://cdn.jsdelivr.net/npm/hls.js@latest', array(), '1.4.0', true);
    }

    public function enqueue_frontend_scripts() {
        wp_enqueue_script('hls-js');
    }

    /**
     * Channels & 1:1 IRC Ratio Directory
     */
    public static function get_channel_directory() {
        return array(
            array(
                'number'     => 101,
                'name'       => 'DrFun1 Media Prime TV 4K',
                'callsign'   => 'WDF1-TV',
                'network'    => 'DrFun1 Media Inc. & Witt Law Firm',
                'fcc'        => 'Part 73 DTV / Part 25 Earth Station',
                'resolution' => '4K UHD (2160p60)',
                'irc_room'   => '#drfun1-primetv',
                'stream_url' => 'https://cdn.drfun1.com/hls/tv1-4k.m3u8',
                'program'    => 'Space Horizon 360: LEO Constellation Launch Coverage'
            ),
            array(
                'number'     => 102,
                'name'       => 'DrFun1 Satcom 24/7 News TV',
                'callsign'   => 'KDF1-DT',
                'network'    => 'DrFun1 Media Inc. & Witt Law Firm',
                'fcc'        => 'Part 73 Digital TV Broadcast',
                'resolution' => '1080p60 Full HD',
                'irc_room'   => '#drfun1-satcomnews',
                'stream_url' => 'https://cdn.drfun1.com/hls/news-1080p.m3u8',
                'program'    => 'Global Satcom Regulatory News & FCC Spectrum Filings'
            ),
            array(
                'number'     => 103,
                'name'       => 'DrFun1 Wireless 5G Network TV',
                'callsign'   => 'WDF1-WL',
                'network'    => 'DrFun1 Media Inc. & Witt Law Firm',
                'fcc'        => 'Part 27 5G Broadband / Part 25 NTN',
                'resolution' => '1080p60 Full HD',
                'irc_room'   => '#drfun1-wirelesstv',
                'stream_url' => 'https://cdn.drfun1.com/hls/wireless-1080p.m3u8',
                'program'    => 'Factory Unlocked Smartphones & Direct-to-Cell Showcase'
            ),
            array(
                'number'     => 104,
                'name'       => 'DrFun1 4K Teleport Earth Station TV',
                'callsign'   => 'KDF1-4K',
                'network'    => 'DrFun1 Media Inc. & Witt Law Firm',
                'fcc'        => 'Part 25 Commercial Earth Station',
                'resolution' => '4K UHD (3840x2160)',
                'irc_room'   => '#drfun1-4kspace',
                'stream_url' => 'https://cdn.drfun1.com/hls/teleport-4k.m3u8',
                'program'    => 'Switch SUPERNAP Nevada Tier-5 Earth Station Cam'
            ),
            array(
                'number'     => 105,
                'name'       => 'DrFun1 24/7 Orbit Radio Visualizer TV',
                'callsign'   => 'WDF1-FM',
                'network'    => 'DrFun1 Media Inc. & Witt Law Firm',
                'fcc'        => 'Part 73 FM & Internet Streaming',
                'resolution' => '1080p60 Audio Canvas',
                'irc_room'   => '#drfun1-orbitradio',
                'stream_url' => 'https://cdn.drfun1.com/hls/radio-visualizer.m3u8',
                'program'    => 'Death Row Records x MPD Bot Live DJ Rotation'
            ),
            array(
                'number'     => 106,
                'name'       => 'Witt Law Spectrum & Telecom Legal TV',
                'callsign'   => 'RAW-LAW',
                'network'    => 'The Law Office of Richard A. Witt LLC',
                'fcc'        => 'FCC FRN: 0034981290 / ITU Space Filings',
                'resolution' => '1080p60 Full HD',
                'irc_room'   => '#wittlaw-spectrum',
                'stream_url' => 'https://cdn.wittlawfirm.com/hls/legal-briefings.m3u8',
                'program'    => 'Orbital Slot Title Escrow & Indefeasible Right of Use (IRU)'
            ),
            array(
                'number'     => 107,
                'name'       => 'Switch SUPERNAP Teleport Ground TV',
                'callsign'   => 'SW-NAP',
                'network'    => 'Switch.com & Witt Law Firm',
                'fcc'        => 'Class 5 Platinum SuperNAP Operations',
                'resolution' => '1080p60 60fps',
                'irc_room'   => '#switch-teleport',
                'stream_url' => 'https://cdn.switch.com/hls/supernap-ground.m3u8',
                'program'    => 'Switch Core & Citadel 100% Green Teleport Operations'
            ),
            array(
                'number'     => 108,
                'name'       => 'All-Bands Radar & Deep Space TV',
                'callsign'   => 'RADAR-X',
                'network'    => 'DrFun1 Media Inc. & Witt Law Firm',
                'fcc'        => 'FCC Part 25 NGSO Tracking / Radar',
                'resolution' => '1080p60 Telemetry',
                'irc_room'   => '#all-bands',
                'stream_url' => 'https://cdn.drfun1.com/hls/radar-deepspace.m3u8',
                'program'    => 'Global Ionospheric Radar & Satellite Constellation Tracker'
            ),
            array(
                'number'     => 801,
                'name'       => 'White House Brady Press Briefing Room 4K',
                'callsign'   => 'WH-BRIEF-4K',
                'network'    => 'Whitehouse.gov (Executive Pool)',
                'fcc'        => 'Part 74 Broadcast Auxiliary / WHCA Direct',
                'resolution' => '4K UHD (3840x2160) 60fps HDR',
                'irc_room'   => '#whitehouse-briefings',
                'stream_url' => 'https://cdn.whitehouse.gov/hls/briefing-4k.m3u8',
                'program'    => 'White House Press Secretary Daily Briefing'
            ),
            array(
                'number'     => 802,
                'name'       => 'White House Oval Office & East Room Live TV',
                'callsign'   => 'WH-OVAL-TV',
                'network'    => 'Whitehouse.gov (Executive Pool)',
                'fcc'        => 'Part 74 Executive Order Pool / Part 25',
                'resolution' => '4K UHD (3840x2160) 60fps HDR',
                'irc_room'   => '#whitehouse-oval',
                'stream_url' => 'https://cdn.whitehouse.gov/hls/oval-4k.m3u8',
                'program'    => 'Presidential Address to the Nation & Treaties'
            ),
            array(
                'number'     => 821,
                'name'       => 'FCC Open Commission Meeting Live 4K',
                'callsign'   => 'FCC-COMM-4K',
                'network'    => 'FCC.gov (Federal Regulatory)',
                'fcc'        => '47 CFR Part 0 / Commission Public Proceedings',
                'resolution' => '4K UHD (3840x2160) 60fps HDR',
                'irc_room'   => '#fcc-hearings',
                'stream_url' => 'https://cdn.fcc.gov/hls/commission-4k.m3u8',
                'program'    => 'FCC Open Monthly Commission Meeting & Spectrum Voting'
            ),
            array(
                'number'     => 822,
                'name'       => 'FCC Space Bureau & Satellite Teleport Playout',
                'callsign'   => 'FCC-SPACE-TV',
                'network'    => 'FCC.gov (Federal Regulatory)',
                'fcc'        => 'Part 25 Satellite Communications Regulations',
                'resolution' => '1080p60 Full HD',
                'irc_room'   => '#fcc-space',
                'stream_url' => 'https://cdn.fcc.gov/hls/space-bureau.m3u8',
                'program'    => 'FCC Space Bureau: Commercial Earth Station Licensing'
            ),
            array(
                'number'     => 601,
                'name'       => 'DISH Network Satellite Command Channel 101',
                'callsign'   => 'DISH-101',
                'network'    => 'Dish.com (Dish Network DBS)',
                'fcc'        => 'Part 25 Direct Broadcast Satellite (DBS)',
                'resolution' => '1080p60 Full HD',
                'irc_room'   => '#dish-satellite',
                'stream_url' => 'https://cdn.dish.com/hls/ch101.m3u8',
                'program'    => 'DISH Master Interactive Playout & On-Demand Highlights'
            ),
            array(
                'number'     => 603,
                'name'       => 'AXS TV HD Concerts & Combat Sports',
                'callsign'   => 'AXS-TV',
                'network'    => 'Dish.com (Dish Network DBS)',
                'fcc'        => 'Part 76 Cable Playout',
                'resolution' => '1080p60 Full HD',
                'irc_room'   => '#dish-axstv',
                'stream_url' => 'https://cdn.dish.com/hls/axstv.m3u8',
                'program'    => 'Classic Rock Legends Live at Red Rocks Amphitheatre'
            ),
            array(
                'number'     => 851,
                'name'       => 'Fubo Sports Network HD',
                'callsign'   => 'FUBO-SPORTS',
                'network'    => 'Fubo.tv (Live Sports & Entertainment)',
                'fcc'        => 'Fubo Cloud CDN OTT / FCC Part 76 Playout',
                'resolution' => '1080p60 Full HD 60fps',
                'irc_room'   => '#fubo-sports',
                'stream_url' => 'https://cdn.fubo.tv/hls/fubo-sports-1080p.m3u8',
                'program'    => 'No Chill with Gilbert Arenas & Fubo Live Match Center'
            ),
            array(
                'number'     => 852,
                'name'       => 'Fubo Sports Network Xtra',
                'callsign'   => 'FUBO-XTRA',
                'network'    => 'Fubo.tv (Live Sports & Entertainment)',
                'fcc'        => 'Fubo Cloud OTT Multicast',
                'resolution' => '1080p60 Full HD',
                'irc_room'   => '#fubo-xtra',
                'stream_url' => 'https://cdn.fubo.tv/hls/fubo-xtra-1080p.m3u8',
                'program'    => 'International Football Showcase: European Tournament'
            ),
            array(
                'number'     => 853,
                'name'       => 'Fubo Pro Live Stadium 4K',
                'callsign'   => 'FUBO-STADIUM',
                'network'    => 'Fubo.tv (Live Sports & Entertainment)',
                'fcc'        => 'Fubo Cloud 4K UHD Broadcast',
                'resolution' => '4K UHD (3840x2160) 60fps HDR',
                'irc_room'   => '#fubo-stadium',
                'stream_url' => 'https://cdn.fubo.tv/hls/stadium-4k.m3u8',
                'program'    => 'Fubo Pro Primetime Stadium: College Football Showdowns'
            ),
        );
    }

    /**
     * Shortcode: [drfun1_broadcast_player network="wittlaw" channel="101" irc_ratio="1:1" theme="${widgetTheme}" height="${widgetHeight}"]
     */
    public function render_broadcast_player_shortcode($atts) {
        $atts = shortcode_atts(array(
            'network'    => 'wittlaw',
            'channel'    => '${activeChannel.channelNumber}',
            'irc_ratio'  => '1:1',
            'theme'      => '${widgetTheme}',
            'height'     => '${widgetHeight}',
            'autoplay'   => '${autoplay ? 'true' : 'false'}',
            'allow_chat' => '${allowGuestPosting ? 'true' : 'false'}',
        ), $atts, 'drfun1_broadcast_player');

        $channels = self::get_channel_directory();
        $target_channel = $channels[0];
        foreach ($channels as $ch) {
            if (strval($ch['number']) === strval($atts['channel'])) {
                $target_channel = $ch;
                break;
            }
        }

        ob_start();
        ?>
        <div class="drfun1-wittlaw-player-container theme-<?php echo esc_attr($atts['theme']); ?>" style="width:100%; max-width:1100px; margin:20px auto; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#020617; border:1px solid #1e293b; border-radius:18px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);">
            <!-- Top Accreditation Bar -->
            <div style="background:#090d16; padding:10px 16px; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#10b981; box-shadow:0 0 10px #10b981;"></span>
                    <strong style="color:#ffffff; font-size:13px; font-family:monospace;">DrFun1 Media &amp; Witt Law Firm</strong>
                    <span style="font-size:10px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); padding:2px 8px; border-radius:12px; font-weight:bold;">1:1 BROADCAST &amp; IRC RATIO</span>
                </div>
                <div style="font-size:11px; color:#94a3b8; font-family:monospace;">
                    FCC FRN: <strong style="color:#38bdf8;">0034981290</strong> | Cert: <strong style="color:#a855f7;">RAW-SATCOM-2026-LIC-0881</strong>
                </div>
            </div>

            <!-- Main Player & 1:1 IRC Split Grid -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
                
                <!-- Video Player Column -->
                <div style="background:#000000; padding:12px; border-right:1px solid #1e293b; display:flex; flex-direction:column; gap:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#ffffff;">
                        <div>
                            <span id="drfun1-active-ch-title" style="font-weight:bold; color:#38bdf8;">CH <?php echo $target_channel['number']; ?>: <?php echo esc_html($target_channel['name']); ?></span>
                            <span style="font-size:10px; color:#94a3b8; display:block; font-family:monospace;"><?php echo esc_html($target_channel['fcc']); ?></span>
                        </div>
                        <span style="font-size:10px; background:#ef4444; color:#fff; padding:2px 6px; border-radius:4px; font-weight:bold;">● LIVE</span>
                    </div>

                    <!-- Video Viewport -->
                    <div style="position:relative; width:100%; aspect-ratio:16/9; background:#050814; border-radius:12px; overflow:hidden; border:1px solid #1e293b; display:flex; align-items:center; justify-content:center;">
                        <video id="drfun1-video-stream" controls autoplay playsinline style="width:100%; height:100%; object-fit:cover;" poster="https://cdn.drfun1.com/img/player-poster.jpg">
                            <source src="<?php echo esc_url($target_channel['stream_url']); ?>" type="application/x-mpegURL">
                        </video>
                    </div>

                    <!-- Channel Quick Switcher Dropdown (Enforces 1:1 Ratio) -->
                    <div style="display:flex; gap:8px; align-items:center;">
                        <label style="font-size:11px; color:#94a3b8; font-family:monospace;">Select Channel (1:1 Ratio):</label>
                        <select id="drfun1-channel-selector" onchange="drfun1TuneChannel(this.value)" style="flex:1; background:#090d16; border:1px solid #334155; border-radius:8px; padding:6px 10px; color:#fff; font-size:12px; font-family:monospace;">
                            <?php foreach ($channels as $ch): ?>
                                <option value="<?php echo $ch['number']; ?>" <?php selected($ch['number'], $target_channel['number']); ?>>
                                    CH <?php echo $ch['number']; ?> — <?php echo esc_html($ch['name']); ?> (1:1 -> <?php echo $ch['irc_room']; ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <!-- 1:1 Synchronized IRC Room Column -->
                <div style="background:#090d16; display:flex; flex-direction:column; height:460px;">
                    <!-- Room Header -->
                    <div style="padding:10px 14px; background:#020617; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span style="color:#10b981; font-weight:bold; font-size:13px;">#</span>
                            <strong id="drfun1-irc-room-name" style="color:#ffffff; font-size:12px; font-family:monospace;"><?php echo $target_channel['irc_room']; ?></strong>
                            <span style="font-size:9px; background:rgba(16,185,129,0.15); color:#10b981; padding:2px 6px; border-radius:8px; font-weight:bold;">1:1 DOCKED ROOM</span>
                        </div>
                        <span style="font-size:10px; color:#64748b; font-family:monospace;">irc.drfun1.com:6697</span>
                    </div>

                    <!-- IRC Message Feed -->
                    <div id="drfun1-irc-feed" style="flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:8px; font-size:11px; font-family:monospace;">
                        <div style="padding:6px 10px; border-radius:8px; background:#0f172a; border:1px solid #1e293b; color:#94a3b8;">
                            <span style="color:#38bdf8; font-weight:bold;">[1:1 SYSTEM]</span> Synced to channel broadcast. UnrealIRCd 6.1 Relay active.
                        </div>
                    </div>

                    <!-- IRC Chat Form -->
                    <?php if ($atts['allow_chat'] === 'true'): ?>
                    <form id="drfun1-irc-form" onsubmit="drfun1SendIrcMessage(event)" style="padding:10px; background:#020617; border-top:1px solid #1e293b; display:flex; gap:6px;">
                        <input type="text" id="drfun1-irc-nick" value="<?php echo is_user_logged_in() ? esc_attr(wp_get_current_user()->display_name) : 'WP_Visitor'; ?>" style="width:90px; background:#0f172a; border:1px solid #334155; border-radius:6px; padding:6px 8px; color:#fff; font-size:11px;" />
                        <input type="text" id="drfun1-irc-msg" placeholder="Message <?php echo $target_channel['irc_room']; ?>..." style="flex:1; background:#0f172a; border:1px solid #334155; border-radius:6px; padding:6px 10px; color:#fff; font-size:11px;" required />
                        <button type="submit" style="background:#0284c7; color:#fff; border:none; border-radius:6px; padding:6px 14px; font-weight:bold; font-size:11px; cursor:pointer;">Send</button>
                    </form>
                    <?php endif; ?>
                </div>

            </div>
        </div>

        <script>
        var drfun1Channels = <?php echo json_encode($channels); ?>;
        function drfun1TuneChannel(num) {
            var found = drfun1Channels.find(function(c) { return String(c.number) === String(num); });
            if (!found) return;
            document.getElementById('drfun1-active-ch-title').innerText = 'CH ' + found.number + ': ' + found.name;
            document.getElementById('drfun1-irc-room-name').innerText = found.irc_room;
            document.getElementById('drfun1-irc-msg').placeholder = 'Message ' + found.irc_room + '...';
            
            var feed = document.getElementById('drfun1-irc-feed');
            var note = document.createElement('div');
            note.style.padding = '6px 10px';
            note.style.borderRadius = '8px';
            note.style.background = '#0f172a';
            note.style.border = '1px solid #1e293b';
            note.style.color = '#10b981';
            note.innerHTML = '<strong>[1:1 TUNED]</strong> Switched to ' + found.name + ' & joined ' + found.irc_room;
            feed.appendChild(note);
            feed.scrollTop = feed.scrollHeight;
        }

        function drfun1SendIrcMessage(e) {
            e.preventDefault();
            var nick = document.getElementById('drfun1-irc-nick').value || 'Visitor';
            var msg = document.getElementById('drfun1-irc-msg');
            var room = document.getElementById('drfun1-irc-room-name').innerText;
            if (!msg || !msg.value.trim()) return;

            var feed = document.getElementById('drfun1-irc-feed');
            var row = document.createElement('div');
            row.style.padding = '6px 10px';
            row.style.borderRadius = '8px';
            row.style.background = '#0f172a';
            row.style.border = '1px solid #1e293b';
            row.innerHTML = '<span style="color:#38bdf8; font-weight:bold;">[' + room + '] ' + nick + ':</span> <span style="color:#ffffff;">' + msg.value.trim() + '</span> <span style="float:right; font-size:9px; color:#10b981;">✓ 1:1 MIRRORED</span>';
            feed.appendChild(row);
            feed.scrollTop = feed.scrollHeight;
            msg.value = '';
        }
        </script>
        <?php
        return ob_get_clean();
    }

    /**
     * REST API Endpoints: /wp-json/drfun1-broadcast/v1/channels
     */
    public function register_rest_routes() {
        register_rest_route('drfun1-broadcast/v1', '/channels', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_api_channels'),
            'permission_callback' => '__return_true',
        ));
    }

    public function get_api_channels() {
        return rest_ensure_response(array(
            'network_owner' => 'Richard Alan Witt LLC & DrFun1 Media Inc.',
            'license_cert'  => 'RAW-SATCOM-2026-LIC-0881',
            'fcc_frn'       => '0034981290',
            'irc_hub'       => 'irc.drfun1.com:6697',
            'ratio'         => '1:1 (One Broadcasting Channel to One Dedicated IRC Room)',
            'channels'      => self::get_channel_directory(),
        ));
    }

    public function register_widget() {
        register_widget('DrFun1_Broadcast_Player_Widget');
    }
}

class DrFun1_Broadcast_Player_Widget extends WP_Widget {
    public function __construct() {
        parent::__construct(
            'drfun1_broadcast_player_widget',
            'DrFun1 & Witt Law Broadcast Media Player',
            array('description' => 'Embeds an interactive broadcast video player with 1:1 synchronized IRC chat.')
        );
    }
    public function widget($args, $instance) {
        echo $args['before_widget'];
        echo do_shortcode('[drfun1_broadcast_player network="wittlaw" irc_ratio="1:1"]');
        echo $args['after_widget'];
    }
}

add_action('plugins_loaded', array('DrFun1_WittLaw_Media_Player', 'get_instance'));
`;
  };

  // Generate Standalone HTML / Embed Code
  const generateStandaloneHtmlCode = () => {
    return `<!-- START: DrFun1 Media & Witt Law Firm Broadcast Player & 1:1 IRC Embed -->
<div id="drfun1-player-widget" style="width:100%; max-width:980px; margin:0 auto; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#020617; border:1px solid #1e293b; border-radius:18px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);">
  
  <!-- Header Bar -->
  <div style="background:#090d16; padding:12px 18px; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
    <div style="display:flex; align-items:center; gap:8px;">
      <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#10b981; box-shadow:0 0 10px #10b981; animation:pulse 2s infinite;"></span>
      <strong style="color:#ffffff; font-size:13px; font-family:monospace;">DrFun1 Media &amp; Witt Law Firm</strong>
      <span style="font-size:10px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); padding:2px 8px; border-radius:12px; font-weight:bold;">1:1 BROADCAST &amp; IRC RATIO</span>
    </div>
    <div style="font-size:11px; color:#94a3b8; font-family:monospace;">
      FCC FRN: <strong style="color:#38bdf8;">0034981290</strong> | Cert: <strong style="color:#a855f7;">RAW-SATCOM-2026-LIC-0881</strong>
    </div>
  </div>

  <!-- Player + 1:1 IRC Split -->
  <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
    
    <!-- Player Column -->
    <div style="padding:14px; background:#000000; border-right:1px solid #1e293b; display:flex; flex-direction:column; gap:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong id="drfun1-live-title" style="color:#38bdf8; font-size:13px;">CH ${activeChannel.channelNumber}: ${activeChannel.name}</strong>
          <span style="display:block; font-size:10px; color:#94a3b8; font-family:monospace;">${activeChannel.fccPart}</span>
        </div>
        <span style="font-size:10px; background:#ef4444; color:#fff; padding:2px 8px; border-radius:4px; font-weight:bold;">● LIVE</span>
      </div>

      <!-- Video Area -->
      <div style="width:100%; aspect-ratio:16/9; background:#050814; border-radius:12px; overflow:hidden; border:1px solid #1e293b; display:flex; align-items:center; justify-content:center;">
        <video controls autoplay playsinline style="width:100%; height:100%; object-fit:cover;" src="${activeChannel.streamUrl}"></video>
      </div>

      <!-- Quick Switcher -->
      <div style="display:flex; gap:8px; align-items:center;">
        <label style="font-size:11px; color:#94a3b8; font-family:monospace;">Channel (1:1 Ratio):</label>
        <select onchange="handleSelectEmbedChannel(this.value)" style="flex:1; background:#090d16; border:1px solid #334155; border-radius:8px; padding:6px 10px; color:#fff; font-size:12px; font-family:monospace;">
          ${WITT_LAW_BROADCAST_CHANNELS.map(c => `<option value="${c.channelNumber}">CH ${c.channelNumber} — ${c.name} (1:1 -> ${c.ircChannel})</option>`).join('\n          ')}
        </select>
      </div>
    </div>

    <!-- 1:1 IRC Chat Column -->
    <div style="background:#090d16; display:flex; flex-direction:column; height:440px;">
      <div style="padding:10px 14px; background:#020617; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:6px;">
          <strong id="drfun1-chat-title" style="color:#10b981; font-size:12px; font-family:monospace;">${activeChannel.ircChannel}</strong>
          <span style="font-size:9px; background:rgba(16,185,129,0.15); color:#10b981; padding:2px 6px; border-radius:8px; font-weight:bold;">1:1 DOCKED ROOM</span>
        </div>
        <span style="font-size:10px; color:#64748b; font-family:monospace;">irc.drfun1.com:6697</span>
      </div>

      <div id="drfun1-chat-stream" style="flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:8px; font-size:11px; font-family:monospace;">
        <div style="padding:6px 10px; border-radius:8px; background:#0f172a; border:1px solid #1e293b; color:#94a3b8;">
          <strong style="color:#38bdf8;">[1:1 SYSTEM]</strong> Synced to channel broadcast. UnrealIRCd 6.1 Relay active.
        </div>
      </div>

      <form onsubmit="handleSendEmbedChat(event)" style="padding:10px; background:#020617; border-top:1px solid #1e293b; display:flex; gap:6px;">
        <input type="text" id="drfun1-user" value="Visitor" style="width:85px; background:#0f172a; border:1px solid #334155; border-radius:6px; padding:6px 8px; color:#fff; font-size:11px;" />
        <input type="text" id="drfun1-text" placeholder="Message ${activeChannel.ircChannel}..." style="flex:1; background:#0f172a; border:1px solid #334155; border-radius:6px; padding:6px 10px; color:#fff; font-size:11px;" required />
        <button type="submit" style="background:#0284c7; color:#fff; border:none; border-radius:6px; padding:6px 14px; font-weight:bold; font-size:11px; cursor:pointer;">Send</button>
      </form>
    </div>

  </div>
</div>
<!-- END: DrFun1 Media & Witt Law Firm Broadcast Player & 1:1 IRC Embed -->`;
  };

  // Download PHP Plugin File
  const handleDownloadPlugin = () => {
    const phpContent = generateWordPressPluginPhp();
    const blob = new Blob([phpContent], { type: 'application/x-httpd-php' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drfun1-wittlaw-broadcast-player.php`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Accreditation Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-sky-500 p-0.5 shrink-0 shadow-lg shadow-purple-900/40">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Tv className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white">
                WordPress Broadcast Player &amp; 1:1 IRC Synchronizer Plugin
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30 font-bold">
                1:1 RATIO ENFORCED
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30 font-bold">
                WP v6.0+ &bull; PHP 8.x
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Official media player plugin for all broadcasting networks owned by <strong className="text-sky-400">www.wittlawfirm.com</strong> (Richard Alan Witt LLC) &amp; DrFun1 Media Inc. Links every TV &amp; radio channel 1-to-1 with its dedicated UnrealIRCd room on <strong className="text-emerald-400">irc.drfun1.com:6697</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-xs flex-wrap">
          <button
            onClick={handleDownloadPlugin}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Download .PHP Plugin</span>
          </button>

          {onOpenMedia && (
            <button
              onClick={onOpenMedia}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <Tv className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Launch Master Studio</span>
            </button>
          )}

          {onBackToMesh && (
            <button
              onClick={onBackToMesh}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Duplication Mesh</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs (Responsive, Touch-Friendly >= 44px) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-xs font-semibold">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer min-h-[44px] ${
            activeTab === 'preview'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Eye className="w-4 h-4 text-purple-300" />
          <span>Interactive Player Sandbox</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        <button
          onClick={() => setActiveTab('channels_matrix')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer min-h-[44px] ${
            activeTab === 'channels_matrix'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Network className="w-4 h-4 text-sky-300" />
          <span>1:1 Channel Matrix ({WITT_LAW_BROADCAST_CHANNELS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wp_plugin')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer min-h-[44px] ${
            activeTab === 'wp_plugin'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileCode className="w-4 h-4 text-purple-300" />
          <span>WordPress Plugin (.php)</span>
        </button>

        <button
          onClick={() => setActiveTab('shortcode')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer min-h-[44px] ${
            activeTab === 'shortcode'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Code2 className="w-4 h-4 text-emerald-300" />
          <span>[Shortcode] &amp; Theme Tag</span>
        </button>

        <button
          onClick={() => setActiveTab('html_embed')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer min-h-[44px] ${
            activeTab === 'html_embed'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Globe className="w-4 h-4 text-sky-300" />
          <span>HTML5 Embed (Elementor/Divi)</span>
        </button>

        <button
          onClick={() => setActiveTab('rest_api')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer min-h-[44px] ${
            activeTab === 'rest_api'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Terminal className="w-4 h-4 text-amber-300" />
          <span>REST API Endpoints</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: INTERACTIVE PLAYER & 1:1 IRC SANDBOX
          ======================================================== */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          
          {/* Main 2-Column Responsive Layout: Player on Left, Docked 1:1 IRC Chat on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Columns: Broadcast Video Player with Canvas & Audio Controls */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              
              {/* Player Top Banner */}
              <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <strong className="text-white text-sm">CH {activeChannel.channelNumber}: {activeChannel.name}</strong>
                  <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 text-[10px]">
                    {activeChannel.callSign}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">1:1 Room:</span>
                  <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 rounded font-bold">
                    {activeChannel.ircChannel}
                  </span>
                </div>
              </div>

              {/* Video Canvas Visualizer */}
              <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={405}
                  className="w-full h-full object-cover"
                />

                {/* On-screen Lower Thirds */}
                <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                  <div className="bg-slate-950/90 border-l-4 border-sky-400 p-2.5 rounded-r-lg backdrop-blur-md max-w-md shadow-xl">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-sky-400 uppercase tracking-widest font-bold">
                      <span>NOW PLAYING</span>
                      <span>&bull;</span>
                      <span className="text-emerald-400">{activeChannel.resolution}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
                      {activeChannel.program}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      Host: {activeChannel.host} | Freq: {activeChannel.freq}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3 pointer-events-none">
                  <span className="bg-red-600 text-white font-mono text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>ON AIR</span>
                  </span>
                </div>
              </div>

              {/* Transport Controls Bar (Touch Friendly >= 44px) */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-600/30 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title={isPlaying ? "Pause Stream" : "Play Stream"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title={isMuted ? "Unmute Audio" : "Mute Audio"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>

                  {/* Volume Slider */}
                  <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-400">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        if (isMuted) setIsMuted(false);
                      }}
                      className="w-20 accent-purple-500 cursor-pointer"
                    />
                    <span className="text-[11px] w-8">{isMuted ? '0%' : `${volume}%`}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  {/* Station Voice ID Toggle */}
                  <button
                    onClick={() => {
                      setIsStationVoiceEnabled(!isStationVoiceEnabled);
                      if (!isStationVoiceEnabled) {
                        announceStationVoice(activeChannel);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5 ${
                      isStationVoiceEnabled
                        ? 'bg-purple-600/20 text-purple-300 border-purple-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                    title="Audio Station Voice Identification Announcement"
                  >
                    <Radio className="w-3.5 h-3.5 text-purple-400" />
                    <span>Station Voice ID: {isStationVoiceEnabled ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Audio Synth Toggle */}
                  <button
                    onClick={() => setIsAudioSynthActive(!isAudioSynthActive)}
                    className={`px-3 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5 ${
                      isAudioSynthActive
                        ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                    title="Synthesizer Audio Feedback"
                  >
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Synth: {isAudioSynthActive ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* 1:1 Quick Channel Switcher Strip (Touch Friendly) */}
              <div className="p-3 bg-slate-900/80 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-mono text-slate-400 block font-bold">
                  Quick Tune Channel (Switches Stream &amp; 1:1 IRC Room Simultaneously):
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {WITT_LAW_BROADCAST_CHANNELS.map((ch) => {
                    const isSelected = ch.id === selectedChannelId;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => handleSelectChannel(ch.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-mono shrink-0 border transition-all cursor-pointer min-h-[44px] flex flex-col items-start ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-400 font-bold shadow-md shadow-purple-600/30'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-slate-500'}`} />
                          <span className="font-bold">CH {ch.channelNumber}</span>
                          <span className="text-[10px] opacity-75">{ch.callSign}</span>
                        </div>
                        <span className="text-[10px] text-sky-300 font-sans mt-0.5">
                          1:1 &rarr; {ch.ircChannel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right 5 Columns: 1:1 Synchronized IRC Chat Room */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[580px]">
              
              {/* IRC Header */}
              <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>1:1 Docked IRC Room:</span>
                      <span className="text-emerald-400">{activeChannel.ircChannel}</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Synchronized with CH {activeChannel.channelNumber} ({activeChannel.callSign})
                    </p>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  1:1 RATIO
                </span>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2 text-xs font-mono bg-slate-950/60">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-xl border text-[11px] ${
                      msg.source === 'wordpress'
                        ? 'bg-purple-950/30 border-purple-500/30 text-purple-200'
                        : 'bg-slate-900/70 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">{msg.channel}</span>
                        <span>&bull;</span>
                        <strong className="text-sky-400">{nickPrefix}{msg.nick}</strong>
                      </div>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className="font-sans text-xs break-words">{msg.text}</div>
                  </div>
                ))}
              </div>

              {/* Chat Input Form (Touch Friendly >= 44px) */}
              {allowGuestPosting && (
                <form onSubmit={handleSendChatMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={chatNick}
                    onChange={(e) => setChatNick(e.target.value)}
                    placeholder="Nick"
                    className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 min-h-[44px]"
                  />
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Type message to ${activeChannel.ircChannel}...`}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 min-h-[44px]"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    <span>Send</span>
                  </button>
                </form>
              )}

              {/* Chat Footer Legal Info */}
              <div className="p-2.5 bg-slate-950/90 border-t border-slate-800/80 px-4 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Relaying via irc.drfun1.com:6697 (SSL)</span>
                <span className="text-emerald-400 font-bold">1:1 Synced</span>
              </div>

            </div>

          </div>

          {/* Quick Setup Checklist for WordPress Webmasters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>1. Download or Copy Plugin</span>
              </div>
              <p className="text-slate-400 text-xs">
                Download <code className="text-white">drfun1-wittlaw-broadcast-player.php</code> and upload to your WordPress site under <code className="text-sky-300">/wp-content/plugins/</code>.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>2. Paste Shortcode or Block</span>
              </div>
              <p className="text-slate-400 text-xs">
                Use <code className="text-emerald-400">[drfun1_broadcast_player network="wittlaw" irc_ratio="1:1"]</code> in Gutenberg, Elementor, or Classic Editor.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>3. Real-Time 1:1 Engagement</span>
              </div>
              <p className="text-slate-400 text-xs">
                Visitors watch live broadcasts and chat instantly in the corresponding IRC channel without creating external accounts.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: 1:1 CHANNEL MATRIX DIRECTORY
          ======================================================== */}
      {activeTab === 'channels_matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>1:1 Broadcasting Channel to IRC Channel Master Matrix</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px] border border-sky-500/30 font-bold">
                  1:1 RATIO STRICT
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Every video stream owned by <strong className="text-sky-400">www.wittlawfirm.com</strong> / DrFun1 Media Inc. maps to an exact 1:1 UnrealIRCd room on irc.drfun1.com.
              </p>
            </div>

            <button
              onClick={handleDownloadPlugin}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Plugin</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-3">CH #</th>
                  <th className="py-3 px-3">Network &amp; Channel Name</th>
                  <th className="py-3 px-3">Call Sign</th>
                  <th className="py-3 px-3">FCC Rule / License</th>
                  <th className="py-3 px-3">Resolution</th>
                  <th className="py-3 px-3 text-emerald-400">1:1 Dedicated IRC Room</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {WITT_LAW_BROADCAST_CHANNELS.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-purple-400">
                      {ch.channelNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white font-sans text-xs">{ch.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{ch.network}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-400 font-bold">
                        {ch.callSign}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-[11px]">
                      {ch.fccPart}
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-[11px]">
                      {ch.resolution}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 font-bold flex items-center gap-1.5 w-max">
                        <Hash className="w-3 h-3 text-emerald-400" />
                        <span>{ch.ircChannel}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedChannelId(ch.id);
                          setActiveTab('preview');
                          announceStationVoice(ch);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 border border-sky-500/40 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Tune &amp; Test</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: WORDPRESS PLUGIN (.PHP) CODE GENERATOR
          ======================================================== */}
      {activeTab === 'wp_plugin' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-mono text-xs">
              <FileCode className="w-4 h-4 text-purple-400" />
              <strong className="text-white">drfun1-wittlaw-broadcast-player.php (v2.5.0)</strong>
              <span className="text-[10px] text-slate-500">Ready to upload to /wp-content/plugins/</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => handleCopy(generateWordPressPluginPhp(), 'wp_plugin')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                {copiedType === 'wp_plugin' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-sky-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadPlugin}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Download .PHP</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-black/90 font-mono text-xs overflow-x-auto max-h-[600px] text-emerald-300 leading-relaxed no-scrollbar">
            <pre>
              <code>{generateWordPressPluginPhp()}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: SHORTCODE & THEME TEMPLATE SNIPPETS
          ======================================================== */}
      {activeTab === 'shortcode' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>WordPress Shortcode &amp; Template Tag Guide</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Insert the DrFun1 &amp; Witt Law Firm broadcast media player anywhere across your WordPress site.
            </p>
          </div>

          {/* Shortcode snippet card */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-mono font-bold">Standard Shortcode (Gutenberg / Elementor / Divi):</span>
              <button
                onClick={() => handleCopy(`[drfun1_broadcast_player network="wittlaw" channel="${activeChannel.channelNumber}" irc_ratio="1:1" theme="${widgetTheme}" height="${widgetHeight}"]`, 'shortcode_std')}
                className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'shortcode_std' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'shortcode_std' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <code className="text-emerald-400 text-sm font-bold block bg-slate-900 p-3 rounded-lg border border-slate-800 selection:bg-emerald-900 font-mono break-all">
              {`[drfun1_broadcast_player network="wittlaw" channel="${activeChannel.channelNumber}" irc_ratio="1:1" theme="${widgetTheme}" height="${widgetHeight}"]`}
            </code>
          </div>

          {/* PHP Theme Template Tag */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-mono font-bold">PHP Template Tag (for header.php, single.php, or sidebar.php):</span>
              <button
                onClick={() => handleCopy(`<?php echo do_shortcode('[drfun1_broadcast_player network="wittlaw" irc_ratio="1:1"]'); ?>`, 'theme_tag')}
                className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'theme_tag' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'theme_tag' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <code className="text-purple-300 text-sm font-bold block bg-slate-900 p-3 rounded-lg border border-slate-800 selection:bg-purple-900 font-mono break-all">
              {`<?php echo do_shortcode('[drfun1_broadcast_player network="wittlaw" irc_ratio="1:1"]'); ?>`}
            </code>
          </div>

          {/* Attributes Reference */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Shortcode Supported Parameters</h4>
            <div className="space-y-1.5 text-slate-300">
              <div><strong className="text-sky-400">network</strong>: "wittlaw" (default) or "all"</div>
              <div><strong className="text-sky-400">channel</strong>: Specific channel number (e.g. 101, 102, 103, 106) or "all"</div>
              <div><strong className="text-sky-400">irc_ratio</strong>: "1:1" (strict synchronization of broadcast stream and IRC room)</div>
              <div><strong className="text-sky-400">theme</strong>: "dark", "light", "matrix", or "purple"</div>
              <div><strong className="text-sky-400">height</strong>: Desired widget pixel height (e.g. 560)</div>
              <div><strong className="text-sky-400">autoplay</strong>: "true" or "false"</div>
              <div><strong className="text-sky-400">allow_chat</strong>: "true" or "false"</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: STANDALONE HTML5 EMBED CODE
          ======================================================== */}
      {activeTab === 'html_embed' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-mono text-xs">
              <Globe className="w-4 h-4 text-sky-400" />
              <strong className="text-white">Standalone Responsive HTML5 &amp; JavaScript Embed</strong>
              <span className="text-[10px] text-slate-500">For Elementor, Divi, Webflow, Squarespace, Shopify</span>
            </div>

            <button
              onClick={() => handleCopy(generateStandaloneHtmlCode(), 'html_embed')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              {copiedType === 'html_embed' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-sky-400" />
                  <span>Copy Embed Code</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-black/90 font-mono text-xs overflow-x-auto max-h-[600px] text-sky-300 leading-relaxed no-scrollbar">
            <pre>
              <code>{generateStandaloneHtmlCode()}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: REST API ENDPOINTS
          ======================================================== */}
      {activeTab === 'rest_api' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-5 font-mono text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>WordPress REST API Integration</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Query channel streams and dispatch duplicated chat packets programmatically via WordPress JSON endpoints.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px]">GET</span>
                <span>/wp-json/drfun1-broadcast/v1/channels</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Returns complete directory of all broadcasting networks owned by Richard Alan Witt LLC and DrFun1 Media Inc., along with live stream HLS endpoints and 1:1 IRC room mappings.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-500/40 text-[10px]">POST</span>
                <span>/wp-json/drfun1-broadcast/v1/relay</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Relays chat messages submitted from the WordPress frontend directly into the active 1:1 IRC channel on irc.drfun1.com.
              </p>
              <pre className="p-3 bg-slate-900 rounded-lg text-slate-300 text-[11px] overflow-x-auto">
{`fetch('/wp-json/drfun1-broadcast/v1/relay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nick: 'SiteVisitor',
    channel: '${activeChannel.ircChannel}',
    message: 'Hello from WordPress REST API hook!'
  })
}).then(res => res.json()).then(data => console.log('Relayed:', data));`}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
