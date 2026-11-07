/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * IRC Channel & Leafed Network Search Engine
 * Searches 855,000 Synced Channels & 26+ Switch SUPERNAP Leaf Nodes
 * Linked to Master Hub irc.drfun1.com:6697 (SID 001) via RisingNet 100G Optical DWDM
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Radio,
  Server,
  Hash,
  Users,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Copy,
  Check,
  ExternalLink,
  Activity,
  ShieldCheck,
  Network,
  Zap,
  Globe,
  Filter,
  ArrowRight,
  Terminal,
  Cpu,
  Tv,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronRight,
  X,
  Eye,
  Music,
  Share2
} from 'lucide-react';
import { ALL_DRFUN1_MEDIA_CHANNELS, SWITCH_DEDICATED_NODES, UNREAL_HUB_DETAILS } from '../data/ircData';
import {
  YOUTUBE_MUSIC_TRACKS,
  MUSIC_GENRE_CATEGORIES,
  RECORD_LABEL_CATEGORIES,
  ARTIST_CATEGORIES,
  BOT_MUSIC_ROSTER,
  SHOUTCAST_855000_CHANNELS_AUDIT
} from '../data/shoutcastMusicLibraryData';
import { INITIAL_UNREAL_SEARCH_INDEX, UNREAL_HUB_TARGET, generateUnrealLeafConfigSnippet } from '../data/unrealSearchData';
import { SwitchDedicatedNode, IrcChannel } from '../types/irc';

export interface IrcSearchChannelItem {
  id: string;
  name: string;
  category: 'music_genre' | 'artist' | 'label' | 'media_broadcast' | 'teleport' | 'legal_spectrum' | 'fanout_channel';
  categoryLabel: string;
  topic: string;
  userCount: number;
  modes: string;
  mediaType: string;
  mediaBitrate: string;
  leafNode: string;
  leafSid: string;
  primaryBot?: string;
  youtubeTrackTitle?: string;
  youtubeTrackArtist?: string;
  youtubeVideoId?: string;
  audioFormat?: string;
  isStreamActive: boolean;
  totalSubChannels?: number;
}

interface IrcChannelAndLeafSearchEngineProps {
  onJoinChannel?: (channel: string) => void;
  onSelectLeafServer?: (hostname: string) => void;
  onOpenShoutcastBotModal?: () => void;
  onOpenDevPlatformModal?: () => void;
  isModalView?: boolean;
  onCloseModal?: () => void;
}

export const IrcChannelAndLeafSearchEngine: React.FC<IrcChannelAndLeafSearchEngineProps> = ({
  onJoinChannel,
  onSelectLeafServer,
  onOpenShoutcastBotModal,
  onOpenDevPlatformModal,
  isModalView = false,
  onCloseModal,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'channels' | 'leaf_nodes' | 'topology' | 'prefix_fanout' | 'onboard_leaf'>('channels');

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannelCategory, setSelectedChannelCategory] = useState<string>('all');
  const [selectedLeafRegion, setSelectedLeafRegion] = useState<string>('all');
  const [channelSortBy, setChannelSortBy] = useState<'users' | 'name' | 'bitrate' | 'subchannels'>('users');
  const [leafSortBy, setLeafSortBy] = useState<'latency' | 'users' | 'sid' | 'name'>('latency');

  // Interactive drawer / details
  const [inspectLeafNode, setInspectLeafNode] = useState<SwitchDedicatedNode | null>(null);
  const [inspectChannel, setInspectChannel] = useState<IrcSearchChannelItem | null>(null);
  const [activePlayingTrackId, setActivePlayingTrackId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [traceRouteNode, setTraceRouteNode] = useState<SwitchDedicatedNode | null>(null);
  const [traceOutput, setTraceOutput] = useState<string[]>([]);
  const [isTracing, setIsTracing] = useState(false);

  // Fanout Prefix Explorer state
  const [fanoutPrefixInput, setFanoutPrefixInput] = useState('music-gfunk');
  const [fanoutChannelIndex, setFanoutChannelIndex] = useState('00042');

  // Leaf Onboarding Form state
  const [onboardHostname, setOnboardHostname] = useState('');
  const [onboardCity, setOnboardCity] = useState('');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardSslTested, setOnboardSslTested] = useState(false);
  const [onboardSuccess, setOnboardSuccess] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Compile Comprehensive Searchable Channels Index (Combining DrFun1 Flagship, Genres, Artists, Labels, and Bots)
  const allSearchableChannels = useMemo<IrcSearchChannelItem[]>(() => {
    const list: IrcSearchChannelItem[] = [];

    // 1. DrFun1 Flagship Broadcast & Teleport Channels
    ALL_DRFUN1_MEDIA_CHANNELS.forEach((ch, idx) => {
      let cat: IrcSearchChannelItem['category'] = 'media_broadcast';
      let catLabel = 'DrFun1 Media Broadcast';
      if (ch.category === 'legal_spectrum') {
        cat = 'legal_spectrum';
        catLabel = 'WittLaw Legal & FCC Spectrum';
      } else if (ch.category === 'teleport_infrastructure') {
        cat = 'teleport';
        catLabel = 'Switch Teleport & Earth Station';
      }

      list.push({
        id: `flagship_${idx}_${ch.name}`,
        name: ch.name,
        category: cat,
        categoryLabel: catLabel,
        topic: ch.topic,
        userCount: ch.userCount,
        modes: ch.modes,
        mediaType: ch.mediaType,
        mediaBitrate: ch.mediaBitrate,
        leafNode: 'dev.drfun1media.com',
        leafSid: '007',
        isStreamActive: ch.isStreamActive,
        totalSubChannels: 1,
      });
    });

    // 2. Music Genre Channels & 855k Space
    MUSIC_GENRE_CATEGORIES.forEach((g) => {
      const featuredTrack = YOUTUBE_MUSIC_TRACKS.find((t) => t.id === g.featuredTrackId);
      list.push({
        id: `genre_${g.id}`,
        name: g.channelPrefix,
        category: 'music_genre',
        categoryLabel: `Music Genre: ${g.name}`,
        topic: `${g.name} 24/7 SHOUTcast Playout | ${g.channelCount.toLocaleString()} Synced Channels | Upstream: donSchoe/shoutcast-irc.git | Curated by Richard Alan Witt`,
        userCount: g.activeListeners,
        modes: '+sntk 100G',
        mediaType: 'SHOUTcast D.N.A. MP3 & YouTube Music 48kHz Playout',
        mediaBitrate: '320 kbps MP3 / Hi-Fi',
        leafNode: 'node1.lasvegas.switch.drfun1.com',
        leafSid: '002',
        primaryBot: 'DJ Orbit Nova (MPD / SHOUTcast bot)',
        youtubeTrackTitle: featuredTrack?.title || `${g.name} Flagship Stream`,
        youtubeTrackArtist: featuredTrack?.artist || g.topArtists.join(', '),
        youtubeVideoId: featuredTrack?.youtubeVideoId,
        audioFormat: featuredTrack?.audioFormat || 'Dolby Atmos 48kHz Stereo',
        isStreamActive: true,
        totalSubChannels: g.channelCount,
      });
    });

    // 3. Artist Channels
    ARTIST_CATEGORIES.forEach((a) => {
      const track = YOUTUBE_MUSIC_TRACKS.find((t) => t.ircChannel === a.channelName);
      list.push({
        id: `artist_${a.id}`,
        name: a.channelName,
        category: 'artist',
        categoryLabel: `Artist Hub: ${a.artistName}`,
        topic: `${a.artistName} Official 24/7 Channel | ${a.genre} | ${a.label} | ${a.channelCount.toLocaleString()} Sub-Channels | Bot: donSchoe/shoutcast-irc`,
        userCount: a.activeListeners,
        modes: '+sntk 100G',
        mediaType: 'Official Discography Playout & Live DJ Requests',
        mediaBitrate: '320 kbps MP3 Lossless',
        leafNode: 'node2.tahoereno.switch.drfun1.com',
        leafSid: '003',
        primaryBot: 'Vinyl Kev & DJ Orbit Nova',
        youtubeTrackTitle: track?.title || a.popularTracks[0] || `${a.artistName} Greatest Hits`,
        youtubeTrackArtist: a.artistName,
        youtubeVideoId: track?.youtubeVideoId,
        audioFormat: '24-bit 96kHz High-Fidelity',
        isStreamActive: true,
        totalSubChannels: a.channelCount,
      });
    });

    // 4. Record Label Channels
    RECORD_LABEL_CATEGORIES.forEach((l) => {
      list.push({
        id: `label_${l.id}`,
        name: l.channelName,
        category: 'label',
        categoryLabel: `Record Label: ${l.labelName}`,
        topic: `${l.labelName} Master Audio Vault | Catalog: ${l.catalogSize} | ${l.channelCount.toLocaleString()} Fanout Channels | ${l.licensingNotice}`,
        userCount: l.activeListeners,
        modes: '+sntik 100G',
        mediaType: 'Label Master Catalog High-Bitrate Stream',
        mediaBitrate: '320 kbps MP3 / Flac',
        leafNode: 'node3.grandrapids.switch.drfun1.com',
        leafSid: '004',
        primaryBot: 'BassMaster 808 & FunkGroove Bot',
        youtubeTrackTitle: `${l.labelName} Master Compilation`,
        youtubeTrackArtist: l.topArtists.slice(0, 3).join(', '),
        audioFormat: '48kHz Master Playout',
        isStreamActive: true,
        totalSubChannels: l.channelCount,
      });
    });

    // 5. Additional 27 Scanned DrFun1 Station Channels
    const extraBroadcasts = [
      { name: '#cablecast-metro', topic: 'Ch 110 Metro QAM-256 Cablecast Hub | 100G Fiber Ingest', users: 210, bitrate: '12 Mbps QAM', leaf: 'node7.chicago.switch.drfun1.com', sid: '009' },
      { name: '#tvu-grid', topic: 'Ch 111 Global TVU IP Video Grid Relay | SMPTE 2110 IP Video', users: 415, bitrate: '25 Mbps SMPTE', leaf: 'node9.newyork.switch.drfun1.com', sid: '011' },
      { name: '#dbs-4k', topic: 'Ch 112 Direct Broadcast Satellite 4K UHD Feed | Galaxy 19', users: 560, bitrate: '18 Mbps 4K HEVC', leaf: 'node17.losangeles.switch.drfun1.com', sid: '019' },
      { name: '#switch-teleport', topic: 'Ch 113 Switch SUPERNAP 360 Teleport Earth Station | 100% Green Energy', users: 640, bitrate: '400G DWDM Carrier', leaf: 'node1.lasvegas.switch.drfun1.com', sid: '002' },
      { name: '#fubo-sports', topic: 'Fubo.tv Sports Master Stream Ingest & Live Score Telemetry', users: 1150, bitrate: '18.5 Mbps Direct HEVC', leaf: 'node6.austin.switch.drfun1.com', sid: '008' },
      { name: '#c-band-space', topic: 'Galaxy 19 C-Band Space Teleport Feed 3700-4200 MHz', users: 194, bitrate: '45 Mbps Transponder', leaf: 'node5.space-teleport.switch.drfun1.com', sid: '006' },
      { name: '#starlink', topic: 'SpaceX Starlink Laser Cross-Link Direct Space Teleport', users: 845, bitrate: '100 Gbps Optical Laser', leaf: 'node8.seattle.switch.drfun1.com', sid: '010' },
      { name: '#goldstone-mojave', topic: 'NASA Deep Space Network (DSN) & Goldstone Mojave Uplink Telemetry', users: 310, bitrate: 'Ka-Band Deep Space', leaf: 'node24.goldstone.switch.drfun1.com', sid: '027' },
      { name: '#transatlantic-ring', topic: 'London Telehouse to Frankfurt DE-CIX Subsea Optical Teleport Ring', users: 780, bitrate: '100G Transatlantic Ring', leaf: 'node10.london.switch.drfun1.com', sid: '012' },
      { name: '#transpacific-mesh', topic: 'Tokyo Otemachi to Sydney Southern Cross Subsea Cable Route', users: 690, bitrate: '100G Transpacific Mesh', leaf: 'node11.tokyo.switch.drfun1.com', sid: '013' },
      { name: '#quantum-key-mesh', topic: 'WittLaw QKD (Quantum Key Distribution) Encrypted Teleport Mesh', users: 88, bitrate: 'Quantum Entangled Telemetry', leaf: 'node16.ashburn.switch.drfun1.com', sid: '018' },
      { name: '#all-855000-channels', topic: 'Full Fanout Aggregator for all 855,000 Channels across 26 Switch SUPERNAP Leaves', users: 8838, bitrate: '3.85 Tbps Aggregate', leaf: 'irc.drfun1.com', sid: '001', totalSubChannels: 855000 },
    ];

    extraBroadcasts.forEach((eb, idx) => {
      list.push({
        id: `extra_broadcast_${idx}`,
        name: eb.name,
        category: 'teleport',
        categoryLabel: 'Teleport & Space Infrastructure',
        topic: eb.topic,
        userCount: eb.users,
        modes: '+sntk 100G',
        mediaType: 'Carrier-Grade Satellite / Fiber Playout',
        mediaBitrate: eb.bitrate,
        leafNode: eb.leaf,
        leafSid: eb.sid,
        isStreamActive: true,
        totalSubChannels: eb.totalSubChannels || 1,
      });
    });

    return list;
  }, []);

  // Filtered & Sorted Channels
  const filteredChannels = useMemo(() => {
    let result = allSearchableChannels;

    // Filter by query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (ch) =>
          ch.name.toLowerCase().includes(q) ||
          ch.topic.toLowerCase().includes(q) ||
          ch.categoryLabel.toLowerCase().includes(q) ||
          ch.leafNode.toLowerCase().includes(q) ||
          ch.leafSid.toLowerCase().includes(q) ||
          (ch.youtubeTrackTitle && ch.youtubeTrackTitle.toLowerCase().includes(q)) ||
          (ch.youtubeTrackArtist && ch.youtubeTrackArtist.toLowerCase().includes(q)) ||
          (ch.primaryBot && ch.primaryBot.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (selectedChannelCategory !== 'all') {
      result = result.filter((ch) => ch.category === selectedChannelCategory);
    }

    // Sort
    return [...result].sort((a, b) => {
      if (channelSortBy === 'users') return b.userCount - a.userCount;
      if (channelSortBy === 'name') return a.name.localeCompare(b.name);
      if (channelSortBy === 'subchannels') return (b.totalSubChannels || 1) - (a.totalSubChannels || 1);
      return b.mediaBitrate.localeCompare(a.mediaBitrate);
    });
  }, [allSearchableChannels, searchQuery, selectedChannelCategory, channelSortBy]);

  // Filtered & Sorted Leaf Nodes
  const filteredLeafNodes = useMemo(() => {
    let result = SWITCH_DEDICATED_NODES;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.subdomain.toLowerCase().includes(q) ||
          n.location.toLowerCase().includes(q) ||
          n.sid.toLowerCase().includes(q) ||
          n.campusName.toLowerCase().includes(q) ||
          n.sslFingerprint.toLowerCase().includes(q)
      );
    }

    if (selectedLeafRegion !== 'all') {
      result = result.filter((n) => {
        if (selectedLeafRegion === 'us_core') {
          return n.location.includes('Las Vegas') || n.location.includes('Tahoe') || n.location.includes('San Jose') || n.location.includes('Los Angeles');
        }
        if (selectedLeafRegion === 'us_east_central') {
          return n.location.includes('Grand Rapids') || n.location.includes('Atlanta') || n.location.includes('Chicago') || n.location.includes('New York') || n.location.includes('Ashburn') || n.location.includes('Miami');
        }
        if (selectedLeafRegion === 'europe') {
          return n.location.includes('London') || n.location.includes('Frankfurt') || n.location.includes('Stockholm');
        }
        if (selectedLeafRegion === 'asia_pacific') {
          return n.location.includes('Tokyo') || n.location.includes('Singapore') || n.location.includes('Sydney') || n.location.includes('Hawaii');
        }
        if (selectedLeafRegion === 'deep_space') {
          return n.location.includes('Mojave') || n.location.includes('Teleport') || n.name.includes('Teleport') || n.name.includes('Goldstone');
        }
        return true;
      });
    }

    return [...result].sort((a, b) => {
      if (leafSortBy === 'latency') return a.latencyMs - b.latencyMs;
      if (leafSortBy === 'users') return b.usersOnline - a.usersOnline;
      if (leafSortBy === 'sid') return a.sid.localeCompare(b.sid);
      return a.subdomain.localeCompare(b.subdomain);
    });
  }, [searchQuery, selectedLeafRegion, leafSortBy]);

  // Simulated Traceroute to a Leaf Node
  const handleRunTraceroute = (node: SwitchDedicatedNode) => {
    setTraceRouteNode(node);
    setIsTracing(true);
    setTraceOutput([
      `traceroute to ${node.subdomain} (${node.host}), 30 hops max, 60 byte packets`,
      ` 1  gateway.switch.drfun1.net (199.167.144.1)  0.312 ms  0.288 ms  0.274 ms`,
      ` 2  core-r1.lasvegas.risingnet.net (199.167.145.10)  0.640 ms  0.612 ms  0.590 ms`,
      ` 3  dwdm-ring-100g.switch.supernap.org (10.240.1.1)  0.920 ms  0.880 ms  0.840 ms`,
    ]);

    setTimeout(() => {
      setTraceOutput((prev) => [
        ...prev,
        ` 4  switch-leaf-mesh-backbone.drfun1.com (10.240.10.${node.sid})  ${(node.latencyMs * 0.7).toFixed(2)} ms`,
        ` 5  ${node.subdomain} (SID ${node.sid}) [UnrealIRCd 6.1.4 TLSv1.3]  ${node.latencyMs.toFixed(2)} ms`,
        `>>> Route Verified: Direct RisingNet 100G Optical Interconnect. 0.00% Packet Loss.`,
        `>>> Synced with irc.drfun1.com:6697 Master Hub via SSL Fingerprint: ${node.sslFingerprint.slice(0, 24)}...`
      ]);
      setIsTracing(false);
    }, 900);
  };

  // Generate prefix fanout test channel
  const generatedFanoutChannel = useMemo(() => {
    const cleanPrefix = fanoutPrefixInput.trim().replace(/^#/, '');
    const cleanIndex = fanoutChannelIndex.trim() || '00001';
    const fullName = `#${cleanPrefix}-${cleanIndex}`;
    
    // Pick an algorithmic leaf node based on hash of name
    const hash = fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const assignedNode = SWITCH_DEDICATED_NODES[hash % SWITCH_DEDICATED_NODES.length];
    const assignedBot = BOT_MUSIC_ROSTER[hash % BOT_MUSIC_ROSTER.length];
    const simulatedListeners = Math.floor(100 + (hash * 37) % 45000);

    return {
      name: fullName,
      topic: `${fullName} High-Density Dynamic Playout Room | Linked to ${assignedNode.subdomain} (SID ${assignedNode.sid}) | Bot: ${assignedBot.botNick} | Part of 855,000 Channels Fanout`,
      assignedNode,
      assignedBot,
      listeners: simulatedListeners,
      modes: '+sntk 100G',
      unrealLink: `/* Auto-Routed to Leaf ${assignedNode.sid} */\nchannel "${fullName}" { maxusers 10000; default-modes "+sntk"; };`,
    };
  }, [fanoutPrefixInput, fanoutChannelIndex]);

  return (
    <div className={`flex flex-col bg-slate-950 text-slate-100 ${isModalView ? 'max-h-[90vh] overflow-hidden rounded-2xl border border-slate-800 shadow-2xl' : 'w-full'}`}>
      {/* Top Banner / Engine Brand */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border-b border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20 text-white">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide bg-gradient-to-r from-white via-purple-200 to-sky-300 bg-clip-text text-transparent">
                  IRC CHANNEL &amp; LEAFED IRCD NETWORK SEARCH ENGINE
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md">
                  855,000 Channels
                </span>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-md hidden sm:inline">
                  26 Leaf Nodes
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Master Hub: <span className="text-emerald-400 font-mono font-semibold">irc.drfun1.com:6697</span> (SID 001) &bull; Switch SUPERNAP Las Vegas Core &bull; Licensee: Richard Alan Witt (FRN 0034981290)
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Close (if modal) */}
        <div className="flex items-center gap-2">
          {onOpenShoutcastBotModal && (
            <button
              onClick={onOpenShoutcastBotModal}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>SHOUTcast Bot (.np)</span>
            </button>
          )}

          {isModalView && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition cursor-pointer"
              title="Close Search Engine Modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'channels'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Hash className="w-4 h-4 text-purple-300" />
            <span>Channels Search ({filteredChannels.length.toLocaleString()})</span>
          </button>

          <button
            onClick={() => setActiveTab('leaf_nodes')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'leaf_nodes'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4 text-emerald-300" />
            <span>Leafed Network (26 Leaves)</span>
          </button>

          <button
            onClick={() => setActiveTab('topology')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'topology'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Network className="w-4 h-4 text-sky-300" />
            <span>Network Live Topology</span>
          </button>

          <button
            onClick={() => setActiveTab('prefix_fanout')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'prefix_fanout'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-300" />
            <span>855k Prefix Fanout Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('onboard_leaf')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'onboard_leaf'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-300" />
            <span>Leaf Verification &amp; Join</span>
          </button>
        </div>

        {/* Global Network Live Counter */}
        <div className="hidden xl:flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Global Mesh: Synced</span>
          </span>
          <span>&bull;</span>
          <span className="text-purple-300">855,000 Channels Synced</span>
          <span>&bull;</span>
          <span className="text-sky-300">3.85 Tbps RisingNet Transit</span>
        </div>
      </div>

      {/* Global Search Input & Quick Filters Bar (for channels & leaf nodes) */}
      {(activeTab === 'channels' || activeTab === 'leaf_nodes') && (
        <div className="bg-slate-900/60 p-4 border-b border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'channels'
                    ? "Search 855k channels by name (e.g. #music-deathrow, #artist-snoopdogg), genre, artist, topic..."
                    : "Search 26 leaf nodes by hostname (e.g. dev.drfun1media.com, node1), city, SID, region..."
                }
                className="w-full bg-slate-950 text-white pl-10 pr-10 py-2.5 rounded-xl border border-slate-700/80 text-xs sm:text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  title="Clear Search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            {activeTab === 'channels' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono whitespace-nowrap">Sort By:</span>
                <select
                  value={channelSortBy}
                  onChange={(e) => setChannelSortBy(e.target.value as any)}
                  className="bg-slate-950 text-purple-300 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="users">Listeners / Users (High to Low)</option>
                  <option value="name">Channel Name (A-Z)</option>
                  <option value="subchannels">Total Channel Space (Fanout)</option>
                  <option value="bitrate">Playout Bitrate</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono whitespace-nowrap">Sort By:</span>
                <select
                  value={leafSortBy}
                  onChange={(e) => setLeafSortBy(e.target.value as any)}
                  className="bg-slate-950 text-emerald-300 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="latency">Lowest Latency (ms)</option>
                  <option value="users">Users Online</option>
                  <option value="sid">Server ID (SID)</option>
                  <option value="name">Node Subdomain (A-Z)</option>
                </select>
              </div>
            )}
          </div>

          {/* Category Filter Chips */}
          {activeTab === 'channels' && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-500 text-[11px] uppercase mr-1">Filter Channels:</span>
              {[
                { id: 'all', label: 'All Channels' },
                { id: 'music_genre', label: 'Music Genres (855k)' },
                { id: 'artist', label: 'Artists & DJs' },
                { id: 'label', label: 'Record Labels' },
                { id: 'media_broadcast', label: 'DrFun1 TV & Radio' },
                { id: 'teleport', label: 'Teleports & Satcom' },
                { id: 'legal_spectrum', label: 'WittLaw & FCC' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedChannelCategory(chip.id)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    selectedChannelCategory === chip.id
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/60 font-bold'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Region Filter Chips for Leaf Nodes */}
          {activeTab === 'leaf_nodes' && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-500 text-[11px] uppercase mr-1">Filter Regions:</span>
              {[
                { id: 'all', label: 'All Regions (26 Nodes)' },
                { id: 'us_core', label: 'US Core (NV / CA)' },
                { id: 'us_east_central', label: 'US Central & East' },
                { id: 'europe', label: 'Europe & UK' },
                { id: 'asia_pacific', label: 'Asia-Pacific' },
                { id: 'deep_space', label: 'Deep Space Teleports' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedLeafRegion(chip.id)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    selectedLeafRegion === chip.id
                      ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/60 font-bold'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[640px]">
        {/* ======================================================== */}
        {/* TAB 1: IRC CHANNELS SEARCH ENGINE (855,000 CHANNELS)     */}
        {/* ======================================================== */}
        {activeTab === 'channels' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>
                Found <span className="text-purple-300 font-bold">{filteredChannels.length}</span> matching channel clusters (spanning{' '}
                <span className="text-emerald-400 font-bold">855,000</span> synced channels network-wide)
              </span>
              <span className="text-[11px] text-slate-500">UnrealIRCd 6.1.4 Channel Burst Sync</span>
            </div>

            {filteredChannels.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl space-y-2">
                <Search className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No channels found matching &quot;{searchQuery}&quot;</p>
                <p className="text-xs text-slate-500">Try searching for &quot;deathrow&quot;, &quot;snoopdogg&quot;, &quot;gfunk&quot;, &quot;drfun1&quot;, or &quot;teleport&quot;</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredChannels.map((ch) => {
                  const isPlayingThis = activePlayingTrackId === ch.id;

                  return (
                    <div
                      key={ch.id}
                      className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-xl p-3.5 flex flex-col justify-between transition group shadow-md"
                    >
                      <div className="space-y-2.5">
                        {/* Channel Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <h3 className="text-sm font-black font-mono text-white group-hover:text-purple-300 transition">
                              {ch.name}
                            </h3>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                            {ch.modes}
                          </span>
                        </div>

                        {/* Category & Leaf Route */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                          <span className="px-2 py-0.5 bg-purple-950/60 text-purple-300 border border-purple-800/60 rounded">
                            {ch.categoryLabel}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-800/80 text-sky-300 border border-slate-700 rounded">
                            Leaf: SID {ch.leafSid} ({ch.leafNode.split('.')[0]})
                          </span>
                        </div>

                        {/* Topic */}
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                          {ch.topic}
                        </p>

                        {/* Media Playout Info */}
                        {ch.youtubeTrackTitle && (
                          <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <Music className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                              <div className="truncate">
                                <span className="font-semibold text-slate-200 block truncate">
                                  {ch.youtubeTrackTitle}
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate font-mono">
                                  {ch.youtubeTrackArtist} &bull; {ch.audioFormat}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                if (isPlayingThis) {
                                  setActivePlayingTrackId(null);
                                } else {
                                  setActivePlayingTrackId(ch.id);
                                }
                              }}
                              className={`p-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                                isPlayingThis
                                  ? 'bg-pink-600 text-white animate-pulse'
                                  : 'bg-slate-800 hover:bg-slate-700 text-pink-300'
                              }`}
                              title={isPlayingThis ? 'Stop Playout Audio Preview' : 'Preview Playout Track'}
                            >
                              {isPlayingThis ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}

                        {/* Stats Row */}
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <Users className="w-3 h-3" />
                            <span>{ch.userCount.toLocaleString()} Listeners</span>
                          </span>

                          {ch.totalSubChannels && ch.totalSubChannels > 1 && (
                            <span className="text-amber-300 font-semibold">
                              {ch.totalSubChannels.toLocaleString()} Channels
                            </span>
                          )}

                          <span className="text-slate-400">{ch.mediaBitrate}</span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (onJoinChannel) {
                              onJoinChannel(ch.name);
                              if (isModalView && onCloseModal) onCloseModal();
                            }
                          }}
                          className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Join Channel</span>
                        </button>

                        <button
                          onClick={() => handleCopy(`/join ${ch.name}`, ch.id)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition cursor-pointer"
                          title="Copy /join command"
                        >
                          {copiedKey === ch.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => setInspectChannel(ch)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition cursor-pointer"
                          title="View Channel Playout & Leaf Routing Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: LEAFED NETWORK NODES SEARCH (26 SWITCH SUPERNAP)  */}
        {/* ======================================================== */}
        {activeTab === 'leaf_nodes' && (
          <div className="space-y-4">
            {/* Master Hub Telemetry Hero */}
            <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold">
                    Master Hub Node 001
                  </span>
                  <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                    SID: 001
                  </span>
                </div>
                <h3 className="text-lg font-black font-mono text-white">irc.drfun1.com:6697 (SSL)</h3>
                <p className="text-xs text-slate-300">
                  Switch SUPERNAP Las Vegas 7, 8, 9 Core Teleport Campus &bull; 100% Green Renewable Energy &bull; RisingNet 100G DWDM
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">SYNCED CHANNELS</span>
                  <span className="text-base font-black text-purple-300">855,000</span>
                </div>
                <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">SYNCED LEAVES</span>
                  <span className="text-base font-black text-emerald-400">26 / 26</span>
                </div>
                <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">TRANSIT CAPACITY</span>
                  <span className="text-base font-black text-sky-300">3.85 Tbps</span>
                </div>
              </div>
            </div>

            {/* Leaf Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredLeafNodes.map((node) => {
                const isSelected = inspectLeafNode?.id === node.id;

                return (
                  <div
                    key={node.id}
                    className={`bg-slate-900/80 hover:bg-slate-900 border rounded-xl p-3.5 flex flex-col justify-between transition shadow-md ${
                      isSelected ? 'border-purple-500 ring-1 ring-purple-500' : 'border-slate-800 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Node Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-800">
                              SID: {node.sid}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
                              {node.leafStatus.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-sm font-black font-mono text-white mt-1 truncate">
                            {node.subdomain}
                          </h4>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-xs font-mono font-black px-2 py-0.5 rounded border ${
                              node.latencyMs < 5
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                : node.latencyMs < 25
                                ? 'bg-sky-950/80 text-sky-300 border-sky-800'
                                : node.latencyMs < 80
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                : 'bg-purple-950/80 text-purple-300 border-purple-800'
                            }`}
                          >
                            {node.latencyMs} ms
                          </span>
                        </div>
                      </div>

                      {/* Location & Campus */}
                      <div className="text-xs text-slate-300 space-y-0.5">
                        <p className="font-semibold text-slate-200">{node.location}</p>
                        <p className="text-[11px] text-slate-400 truncate">{node.campusName}</p>
                      </div>

                      {/* Fingerprint & Encryption */}
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-[10px] font-mono space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>SSL Cipher:</span>
                          <span className="text-emerald-300">TLSv1.3 AES-256</span>
                        </div>
                        <div className="text-slate-400 truncate">
                          <span>FP: </span>
                          <span className="text-purple-300">{node.sslFingerprint.slice(0, 28)}...</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                        <span className="text-emerald-400 font-semibold">{node.usersOnline.toLocaleString()} Users</span>
                        <span className="text-purple-300 font-semibold">855,000 Chans</span>
                        <span className="text-sky-300 font-semibold">{node.fiberCapacity.split(' ')[0]} Fiber</span>
                      </div>
                    </div>

                    {/* Node Actions */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-1.5">
                      <button
                        onClick={() => setInspectLeafNode(node)}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Cpu className="w-3.5 h-3.5 text-purple-400" />
                        <span>Link Block</span>
                      </button>

                      <button
                        onClick={() => handleRunTraceroute(node)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1"
                        title="Run Traceroute & BGP Ping to this leaf"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Trace</span>
                      </button>

                      <button
                        onClick={() => handleCopy(node.unrealLinkBlock, node.id)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition cursor-pointer"
                        title="Copy UnrealIRCd Link Block Snippet"
                      >
                        {copiedKey === node.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: NETWORK LIVE TOPOLOGY & STAR MESH MAP            */}
        {/* ======================================================== */}
        {activeTab === 'topology' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black font-mono text-white flex items-center gap-2">
                    <Network className="w-5 h-5 text-sky-400" />
                    <span>UnrealIRCd 6.1.4 Global Star-Mesh Interconnect</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Master Hub: <span className="text-emerald-400 font-mono">irc.drfun1.com:6697</span> &bull; 26 Switch SUPERNAP Leaves radiating via RisingNet DWDM Optical Ring
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded-lg">
                    Leaf Burst Latency: 1.2 ms
                  </span>
                  <span className="px-2.5 py-1 bg-purple-950/80 text-purple-300 border border-purple-800 rounded-lg">
                    Packet Drop: 0.00%
                  </span>
                </div>
              </div>

              {/* Topology Matrix Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-2">
                {/* Center Hub */}
                <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-6 bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/90 border border-purple-500/60 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg text-white">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">irc.drfun1.com:6697</span>
                        <span className="text-[10px] font-mono bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded border border-purple-500/40">
                          CORE HUB (SID 001)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-300 font-mono">Switch SUPERNAP Las Vegas 7, 8, 9 Core</span>
                    </div>
                  </div>

                  <div className="text-right text-xs font-mono hidden sm:block">
                    <span className="text-emerald-400 font-bold block">855,000 Channels Synced</span>
                    <span className="text-slate-400 text-[10px]">RisingNet Tier-1 BGP Optical Transit</span>
                  </div>
                </div>

                {/* Satellite Leaf Nodes */}
                {SWITCH_DEDICATED_NODES.map((leaf) => (
                  <div
                    key={leaf.id}
                    onClick={() => setInspectLeafNode(leaf)}
                    className="bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded-lg p-2.5 transition cursor-pointer text-left space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-purple-300 font-bold">SID {leaf.sid}</span>
                      <span className="text-emerald-400 font-semibold">{leaf.latencyMs}ms</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-sky-300 block truncate">
                      {leaf.subdomain.split('.')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate font-mono">
                      {leaf.location.split(',')[0]}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Burst: Synced</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: 855k PREFIX FANOUT CHANNEL EXPLORER               */}
        {/* ======================================================== */}
        {activeTab === 'prefix_fanout' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
              <div>
                <h3 className="text-base font-black font-mono text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>855,000 Channels Network Prefix &amp; Fanout Space Explorer</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Test and inspect how UnrealIRCd dynamically partitions the 855,000 channel space across the 26 Switch SUPERNAP leaves and assigns donSchoe/shoutcast-irc announcer bots.
                </p>
              </div>

              {/* Fanout Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-400 block">Channel Prefix:</label>
                  <input
                    type="text"
                    value={fanoutPrefixInput}
                    onChange={(e) => setFanoutPrefixInput(e.target.value)}
                    placeholder="e.g. music-gfunk, artist-snoopdogg"
                    className="w-full bg-slate-900 text-purple-300 font-mono text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-400 block">Channel Number / Index:</label>
                  <input
                    type="text"
                    value={fanoutChannelIndex}
                    onChange={(e) => setFanoutChannelIndex(e.target.value)}
                    placeholder="00042 (up to 120,000 per genre)"
                    className="w-full bg-slate-900 text-sky-300 font-mono text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <span className="text-[11px] text-slate-500 font-mono block">Preset Channels:</span>
                  <div className="flex items-center gap-1.5">
                    {['gfunk-001', 'boombap-108', 'synth-420', '2pac-vip'].map((pre) => (
                      <button
                        key={pre}
                        onClick={() => {
                          const [p, i] = pre.split('-');
                          setFanoutPrefixInput(`music-${p}`);
                          setFanoutChannelIndex(i);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono transition cursor-pointer"
                      >
                        {pre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simulated Fanout Channel Card */}
              <div className="bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-950 border border-purple-500/40 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-base font-black font-mono text-white">
                      {generatedFanoutChannel.name}
                    </span>
                    <span className="text-xs font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/40">
                      Modes: {generatedFanoutChannel.modes}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (onJoinChannel) {
                          onJoinChannel(generatedFanoutChannel.name);
                          if (isModalView && onCloseModal) onCloseModal();
                        }
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Join This Channel</span>
                    </button>

                    <button
                      onClick={() => handleCopy(`/join ${generatedFanoutChannel.name}`, 'fanout_join')}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition cursor-pointer"
                    >
                      {copiedKey === 'fanout_join' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  {generatedFanoutChannel.topic}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">ROUTED LEAF NODE</span>
                    <span className="text-sky-300 font-bold">{generatedFanoutChannel.assignedNode.subdomain}</span>
                    <span className="text-slate-500 text-[10px] block">SID {generatedFanoutChannel.assignedNode.sid} &bull; {generatedFanoutChannel.assignedNode.latencyMs}ms</span>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">SHOUTCAST BOT AGENT</span>
                    <span className="text-pink-300 font-bold">{generatedFanoutChannel.assignedBot.botNick}</span>
                    <span className="text-slate-500 text-[10px] block">{generatedFanoutChannel.assignedBot.specialization}</span>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">BURST USER CAPACITY</span>
                    <span className="text-emerald-400 font-bold">{generatedFanoutChannel.listeners.toLocaleString()} Active Listeners</span>
                    <span className="text-slate-500 text-[10px] block">Max: 10,000 / channel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: LEAF ONBOARDING & VERIFICATION                    */}
        {/* ======================================================== */}
        {activeTab === 'onboard_leaf' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
              <div>
                <h3 className="text-base font-black font-mono text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>UnrealIRCd 6.1.x Leaf Verification &amp; Onboarding Workstation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Operators wishing to link their server as a dedicated leaf node into the DrFun1 Media &amp; Witt Law Firm global mesh network can generate and verify link credentials here.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Form Column */}
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-slate-400">Your Server Hostname / FQDN:</label>
                    <input
                      type="text"
                      value={onboardHostname}
                      onChange={(e) => setOnboardHostname(e.target.value)}
                      placeholder="e.g. irc.yourdomain.com"
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Datacenter / City Location:</label>
                    <input
                      type="text"
                      value={onboardCity}
                      onChange={(e) => setOnboardCity(e.target.value)}
                      placeholder="e.g. Equinix Dallas / Paris / Dallas, TX"
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Admin Email &amp; Contact:</label>
                    <input
                      type="email"
                      value={onboardEmail}
                      onChange={(e) => setOnboardEmail(e.target.value)}
                      placeholder="admin@yourdomain.com"
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setOnboardSslTested(true);
                        setTimeout(() => setOnboardSuccess(true), 600);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Test SSL &amp; Verify Leaf Block</span>
                    </button>
                  </div>

                  {onboardSuccess && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-emerald-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Leaf Handshake Verified!</span>
                      </div>
                      <p className="text-[11px] text-emerald-300">
                        Add the link block on the right to your <span className="font-mono">unrealircd.conf</span> and execute <span className="font-mono">/rehash</span>.
                      </p>
                    </div>
                  )}
                </div>

                {/* Generated Link Block */}
                <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        Generated UnrealIRCd 6.1.4 Link Block
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(
                            generateUnrealLeafConfigSnippet(onboardHostname || 'your-server.domain.com', 'DrFun1 Media Mesh'),
                            'onboard_config'
                          )
                        }
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white rounded flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'onboard_config' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Block</span>
                      </button>
                    </div>
                    <pre className="bg-slate-900 p-3 rounded-lg text-[10px] font-mono text-purple-200 overflow-x-auto border border-slate-800/80 leading-relaxed max-h-[220px]">
                      {generateUnrealLeafConfigSnippet(onboardHostname || 'your-server.domain.com', 'DrFun1 Media Mesh')}
                    </pre>
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono">
                    All linked leaves sync all 855,000 channels instantaneously via Unreal6104-TLS protocol.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drawer / Modal: Inspect Leaf Node Details */}
      {inspectLeafNode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-800">
                    SID: {inspectLeafNode.sid}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
                    {inspectLeafNode.leafStatus.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-black font-mono text-white mt-1">
                  {inspectLeafNode.subdomain}
                </h3>
                <p className="text-xs text-slate-400">{inspectLeafNode.location} &bull; {inspectLeafNode.campusName}</p>
              </div>

              <button
                onClick={() => setInspectLeafNode(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Config Block Display */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>UnrealIRCd Link Block (Leaf -&gt; irc.drfun1.com)</span>
                <button
                  onClick={() => handleCopy(inspectLeafNode.unrealLinkBlock, 'modal_link_block')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'modal_link_block' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Link Block</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                {inspectLeafNode.unrealLinkBlock}
              </pre>
            </div>

            {/* Interconnect Telemetry */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">LATENCY</span>
                <span className="text-emerald-400 font-bold">{inspectLeafNode.latencyMs} ms</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">USERS ONLINE</span>
                <span className="text-purple-300 font-bold">{inspectLeafNode.usersOnline.toLocaleString()}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">SYNC PROTOCOL</span>
                <span className="text-sky-300 font-bold">Unreal6104-TLS</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">CHANNELS</span>
                <span className="text-amber-300 font-bold">855,000 Synced</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  if (onSelectLeafServer) {
                    onSelectLeafServer(inspectLeafNode.subdomain);
                  }
                  setInspectLeafNode(null);
                  if (isModalView && onCloseModal) onCloseModal();
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Connect to this Leaf Server
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer / Modal: Inspect Channel Playout Details */}
      {inspectChannel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-800">
                    {inspectChannel.modes}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                    {inspectChannel.categoryLabel}
                  </span>
                </div>
                <h3 className="text-lg font-black font-mono text-white mt-1">
                  {inspectChannel.name}
                </h3>
              </div>

              <button
                onClick={() => setInspectChannel(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">CHANNEL TOPIC</span>
                <p className="text-slate-200 leading-relaxed">{inspectChannel.topic}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">ROUTING LEAF</span>
                  <span className="text-sky-300 font-bold">{inspectChannel.leafNode}</span>
                  <span className="text-[10px] text-slate-400 block">SID {inspectChannel.leafSid}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">ACTIVE LISTENERS</span>
                  <span className="text-emerald-400 font-bold">{inspectChannel.userCount.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block">{inspectChannel.mediaBitrate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  if (onJoinChannel) {
                    onJoinChannel(inspectChannel.name);
                  }
                  setInspectChannel(null);
                  if (isModalView && onCloseModal) onCloseModal();
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Join Channel Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Traceroute Output Modal */}
      {traceRouteNode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-5 space-y-3 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold font-mono text-white">
                  BGP Traceroute &bull; {traceRouteNode.subdomain}
                </h3>
              </div>
              <button
                onClick={() => setTraceRouteNode(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-sky-300 leading-relaxed overflow-x-auto min-h-[160px]">
              {traceOutput.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
              {isTracing && (
                <div className="text-purple-400 animate-pulse mt-1">Tracing optical hops via RisingNet BGP...</div>
              )}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => setTraceRouteNode(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg transition"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
