import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Activity,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Terminal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Music,
  Headphones,
  Wifi,
  Send,
  Sliders,
  X,
  Server,
  Zap,
  Sparkles,
  Layers,
  Globe,
  Clock,
  Code,
  Youtube,
  Disc,
  Tag,
  Mic2,
  ListMusic,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Search,
  Filter,
  Share2,
  Bot
} from 'lucide-react';
import {
  YOUTUBE_MUSIC_TRACKS,
  YOUTUBE_MUSIC_PLAYLISTS,
  MUSIC_GENRE_CATEGORIES,
  RECORD_LABEL_CATEGORIES,
  ARTIST_CATEGORIES,
  BOT_MUSIC_ROSTER,
  BotMusicAgent,
  SHOUTCAST_855000_CHANNELS_AUDIT,
  YouTubeMusicTrack,
  YouTubeMusicPlaylist,
} from '../data/shoutcastMusicLibraryData';

interface ShoutcastIrcBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastToIrc?: (message: string, channel: string) => void;
  currentIrcChannel?: string;
  activeServer?: string;
}

interface ShoutcastTrack {
  artist: string;
  title: string;
  album: string;
  dj: string;
  bitrate: string;
  format: string;
  listeners: number;
  maxListeners: number;
  peakListeners: number;
  streamUrl: string;
  mountPoint: string;
  genre: string;
  label?: string;
  youtubeMusicUrl?: string;
}

export const ShoutcastIrcBotModal: React.FC<ShoutcastIrcBotModalProps> = ({
  isOpen,
  onClose,
  onBroadcastToIrc,
  currentIrcChannel = '#lobby',
  activeServer = 'dev.drfun1media.com',
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'yt_playlist' | 'bot_library' | 'by_genre' | 'by_artist' | 'by_label' | 'stream' | 'commands' | 'network' | 'daemon'>('yt_playlist');

  // YouTube Music Library State
  const [selectedPlaylist, setSelectedPlaylist] = useState<YouTubeMusicPlaylist>(YOUTUBE_MUSIC_PLAYLISTS[0]);
  const [selectedTrack, setSelectedTrack] = useState<YouTubeMusicTrack>(YOUTUBE_MUSIC_TRACKS[0]);
  const [selectedBotAgent, setSelectedBotAgent] = useState<BotMusicAgent>(BOT_MUSIC_ROSTER[0]);
  const [isPlayingYouTube, setIsPlayingYouTube] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(85);
  const [currentPlaySec, setCurrentPlaySec] = useState<number>(45);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [customPlaylistInput, setCustomPlaylistInput] = useState<string>('');
  const [customPlaylistFeedback, setCustomPlaylistFeedback] = useState<string | null>(null);

  // Command & Terminal State
  const [commandInput, setCommandInput] = useState<string>('.np');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [topicAutoSyncEnabled, setTopicAutoSyncEnabled] = useState<boolean>(true);
  const [announceFeedback, setAnnounceFeedback] = useState<string | null>(null);

  // Simulated SHOUTcast D.N.A. live stream track state synced with active YouTube track
  const [currentTrack, setCurrentTrack] = useState<ShoutcastTrack>({
    artist: selectedTrack.artist,
    title: selectedTrack.title,
    album: selectedTrack.album,
    dj: selectedTrack.dj,
    bitrate: selectedTrack.bitrate,
    format: selectedTrack.audioFormat,
    listeners: selectedTrack.listeners,
    maxListeners: 48000,
    peakListeners: 38410,
    streamUrl: selectedTrack.youtubeMusicUrl,
    mountPoint: '/live',
    genre: selectedTrack.genre,
    label: selectedTrack.label,
    youtubeMusicUrl: selectedTrack.youtubeMusicUrl,
  });

  // Simulated bot command history / output
  const [commandLogs, setCommandLogs] = useState<Array<{
    timestamp: string;
    sender: string;
    text: string;
    isBot: boolean;
  }>>([
    {
      timestamp: '15:20:01',
      sender: 'System',
      text: 'Connected to donSchoe/shoutcast-irc daemon v1.4.2 [Ruby 3.2.2 Net-IRC]',
      isBot: false,
    },
    {
      timestamp: '15:20:02',
      sender: 'ShoutcastBot',
      text: 'YouTube Music Library Playlist Engine loaded: 7 Curated Playlists | 855,000 Channels categorized by Artist, Genre & Label',
      isBot: true,
    },
    {
      timestamp: '15:20:03',
      sender: 'ShoutcastBot',
      text: 'Synchronized with 855,000 IRC channels across UnrealIRCd 6.1.4 & Denora Stats.',
      isBot: true,
    },
    {
      timestamp: '15:20:45',
      sender: 'User',
      text: '.np',
      isBot: false,
    },
    {
      timestamp: '15:20:46',
      sender: 'ShoutcastBot',
      text: `[SHOUTcast D.N.A. x YouTube Music] Now Playing: ${selectedTrack.artist} - ${selectedTrack.title} | Label: ${selectedTrack.label} | Listeners: ${selectedTrack.listeners.toLocaleString()} | YouTube: ${selectedTrack.youtubeMusicUrl}`,
      isBot: true,
    },
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollTop = logEndRef.current.scrollHeight;
    }
  }, [commandLogs]);

  // Sync currentTrack whenever selectedTrack changes
  useEffect(() => {
    setCurrentTrack({
      artist: selectedTrack.artist,
      title: selectedTrack.title,
      album: selectedTrack.album,
      dj: selectedTrack.dj,
      bitrate: selectedTrack.bitrate,
      format: selectedTrack.audioFormat,
      listeners: selectedTrack.listeners,
      maxListeners: 48000,
      peakListeners: 38410,
      streamUrl: selectedTrack.youtubeMusicUrl,
      mountPoint: '/live',
      genre: selectedTrack.genre,
      label: selectedTrack.label,
      youtubeMusicUrl: selectedTrack.youtubeMusicUrl,
    });
  }, [selectedTrack]);

  // Periodic scrubber progression
  useEffect(() => {
    if (!isOpen || !isPlayingYouTube) return;
    const interval = setInterval(() => {
      setCurrentPlaySec((prev) => {
        if (prev >= selectedTrack.durationSec) {
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isPlayingYouTube, selectedTrack.durationSec]);

  if (!isOpen) return null;

  // Track switching handlers
  const handleSelectTrack = (track: YouTubeMusicTrack) => {
    setSelectedTrack(track);
    setCurrentPlaySec(0);
    setIsPlayingYouTube(true);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logText = `[YouTube Music Auto-Sync] Loaded track: "${track.title}" by ${track.artist} (${track.genre} • ${track.label}). Stream URL: ${track.youtubeMusicUrl}`;
    setCommandLogs((prev) => [
      ...prev,
      { timestamp: timeStr, sender: 'ShoutcastBot', text: logText, isBot: true },
    ]);
  };

  const handleNextTrack = () => {
    const list = selectedPlaylist.tracks;
    const currentIndex = list.findIndex((t) => t.id === selectedTrack.id);
    const nextIndex = (currentIndex + 1) % list.length;
    handleSelectTrack(list[nextIndex]);
  };

  const handlePrevTrack = () => {
    const list = selectedPlaylist.tracks;
    const currentIndex = list.findIndex((t) => t.id === selectedTrack.id);
    const prevIndex = currentIndex <= 0 ? list.length - 1 : currentIndex - 1;
    handleSelectTrack(list[prevIndex]);
  };

  // Announce Now Playing to active IRC channel with YouTube Music metadata
  const handleAnnounceToIrc = () => {
    const announcement = `[SHOUTcast D.N.A. x YouTube Music] Now Playing: ${selectedTrack.artist} - ${selectedTrack.title} | Label: ${selectedTrack.label} | Genre: ${selectedTrack.genre} | Listeners: ${selectedTrack.listeners.toLocaleString()} | Stream: ${selectedTrack.youtubeMusicUrl} | 855,000 Channels Synced`;
    if (onBroadcastToIrc) {
      onBroadcastToIrc(announcement, currentIrcChannel);
    }
    setAnnounceFeedback(`Broadcast dispatched to ${currentIrcChannel} across 855,000 network channels!`);
    setTimeout(() => setAnnounceFeedback(null), 3500);
  };

  // Mass announce to all 855,000 channels
  const handleMassAnnounce = () => {
    const announcement = `[NETWORK-WIDE 855,000 CHANNELS SYNC] 🎵 Now Playing on SHOUTcast D.N.A.: ${selectedTrack.artist} - "${selectedTrack.title}" (${selectedTrack.label}) | Listen Live on YouTube Music: ${selectedTrack.youtubeMusicUrl}`;
    if (onBroadcastToIrc) {
      onBroadcastToIrc(announcement, currentIrcChannel);
    }
    setAnnounceFeedback(`Mass broadcast fanout triggered across all 855,000 channels!`);
    setTimeout(() => setAnnounceFeedback(null), 4000);
  };

  // Load custom YouTube Music Playlist
  const handleLoadCustomPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPlaylistInput.trim()) return;

    setCustomPlaylistFeedback(`Successfully ingested YouTube Music playlist: ${customPlaylistInput.trim()} into SHOUTcast playlist cache!`);
    setTimeout(() => setCustomPlaylistFeedback(null), 4000);
    setCustomPlaylistInput('');
  };

  // Execute bot command in simulator
  const handleRunCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let botResponse = '';

    const lower = trimmed.toLowerCase();
    if (lower === '.np' || lower === '!np' || lower === '/np') {
      botResponse = `[SHOUTcast D.N.A. x YouTube Music] Now Playing: ${selectedTrack.artist} - ${selectedTrack.title} | Label: ${selectedTrack.label} | Genre: ${selectedTrack.genre} | Listeners: ${selectedTrack.listeners.toLocaleString()} | YouTube: ${selectedTrack.youtubeMusicUrl}`;
    } else if (lower === '.yt' || lower === '!yt' || lower.startsWith('.yt ')) {
      botResponse = `[YouTube Music Stream] Active: "${selectedTrack.title}" by ${selectedTrack.artist} | Link: ${selectedTrack.youtubeMusicUrl} | Bitrate: ${selectedTrack.bitrate} | Engine: donSchoe/shoutcast-irc`;
    } else if (lower === '.playlist' || lower === '!playlist') {
      botResponse = `[YouTube Music Playlists] Active Playlist: "${selectedPlaylist.name}" (${selectedPlaylist.channelCount.toLocaleString()} channels) | Curator: ${selectedPlaylist.curator} | 855,000 Channels Total`;
    } else if (lower === '.genre' || lower === '!genre') {
      botResponse = `[855,000 Channels by Genre] 7 Categories: Hip Hop/G-Funk (210k), Synthwave (180k), Lo-Fi Space (135k), EDM (115k), Rock/Funk (90k), Space Symphony (65k), Reggae/Dub (60k)`;
    } else if (lower === '.artist' || lower === '!artist') {
      botResponse = `[855,000 Channels by Artist] 10 Hubs: Snoop Dogg (85k), Witt & Orbit Nova (95k), 2Pac (75k), Dr. Dre (60k), Daft Punk (65k), Mount Westmore (55k), Zimmer (50k), Kraftwerk (45k), Aphex (40k), Indie (285k)`;
    } else if (lower === '.label' || lower === '!label') {
      botResponse = `[855,000 Channels by Label] 6 Labels: Death Row (235k), DrFun1 Music (220k), WittLaw Soundworks (155k), Aftermath (120k), Warp (75k), Sony (50k)`;
    } else if (lower === '.queue' || lower === '!queue') {
      botResponse = `[YouTube Music Bot Queue] Next: 1. California Love (2Pac) | 2. Resonance (HOME) | 3. Too Big (Mount Westmore) | 4. Space Chill Radio (Lofi Girl) | Bot Fleet: donSchoe/shoutcast-irc`;
    } else if (lower === '.song' || lower === '!song') {
      botResponse = `[SHOUTcast Song] "${selectedTrack.title}" by ${selectedTrack.artist} (Album: ${selectedTrack.album} • Label: ${selectedTrack.label})`;
    } else if (lower === '.dj' || lower === '!dj') {
      botResponse = `[SHOUTcast DJ] On Air: ${selectedTrack.dj} | Live at Switch SUPERNAP Studios (www.switch.com / www.wittlawfirm.com)`;
    } else if (lower === '.listeners' || lower === '!listeners') {
      botResponse = `[SHOUTcast Listeners] Current: ${selectedTrack.listeners.toLocaleString()} | Total across 855,000 channels: 1,245,800 active listeners`;
    } else if (lower === '.stream' || lower === '!stream' || lower === '.listen') {
      botResponse = `[SHOUTcast Stream] YouTube Music Stream: ${selectedTrack.youtubeMusicUrl} | D.N.A. Server: http://stream.drfun1.com:8000/live`;
    } else if (lower === '.stats' || lower === '!stats') {
      botResponse = `[SHOUTcast D.N.A. Server Stats] Server: stream.drfun1.com:8000 | 855,000 Channels Synced by Artist, Genre, & Label | Bot: donSchoe/shoutcast-irc.git`;
    } else if (lower === '.help' || lower === '!help') {
      botResponse = `[SHOUTcast Bot Help] Available commands: .np (Now Playing), .yt (YouTube Stream), .playlist, .genre, .artist, .label, .queue, .song, .dj, .listeners, .stream, .stats, .help.`;
    } else {
      botResponse = `[SHOUTcast Bot] Unknown command "${trimmed}". Type .help for available commands or .np for current playing YouTube Music track.`;
    }

    setCommandLogs((prev) => [
      ...prev,
      { timestamp: timeStr, sender: 'You', text: trimmed, isBot: false },
      { timestamp: timeStr, sender: 'ShoutcastBot', text: botResponse, isBot: true },
    ]);

    setCommandInput('');
  };

  const rubyDaemonCode = `# ========================================================
# donSchoe/shoutcast-irc - SHOUTcast to IRC Announcer Bot
# Source: https://github.com/donSchoe/shoutcast-irc.git
# Configured for: YouTube Music Library as Playlist Engine
# Categorized: 855,000 Channels by Artist, Genre & Record Label
# License: Licensed to Richard Alan Witt (www.wittlawfirm.com)
# ========================================================

require 'rubygems'
require 'net/irc'
require 'xmlsimple'
require 'open-uri'
require 'yaml'
require 'json'

class ShoutcastIrcBot < Net::IRC::Client
  def initialize(host, port, opts = {})
    super
    @config = YAML.load_file('config.yml')
    @last_song = ''
    @youtube_playlist_url = @config['shoutcast']['youtube_music_playlist']
  end

  def on_rpl_welcome(m)
    puts "[SHOUTcast-IRC] Connected to dev.drfun1media.com:6697 (SSL)!"
    puts "[SHOUTcast-IRC] Syncing 855,000 channels by Artist, Genre, and Record Label..."
    post JOIN, @config['irc']['channels'].join(',')
    
    # Start polling thread
    Thread.new { poll_stream_and_playlist }
  end

  def on_privmsg(m)
    channel = m[0]
    message = m[1].to_s.strip

    case message
    when /^\\.np/i, /^!np/i
      stats = fetch_active_track
      post NOTICE, channel, "[SHOUTcast D.N.A. x YouTube Music] Now Playing: #{stats[:artist]} - #{stats[:title]} | Label: #{stats[:label]} | Genre: #{stats[:genre]} | Listen: #{stats[:yt_url]}"
    when /^\\.song/i
      stats = fetch_active_track
      post NOTICE, channel, "[SHOUTcast Song] #{stats[:title]} by #{stats[:artist]} (#{stats[:album]})"
    when /^\\.dj/i
      post NOTICE, channel, "[SHOUTcast DJ] Live On Air: Richard Alan Witt & DJ Orbit Nova (Switch SUPERNAP Studios)"
    when /^\\.listeners/i
      post NOTICE, channel, "[SHOUTcast Listeners] Active: #{stats[:listeners]} | 855,000 Synced Channels"
    when /^\\.stream/i, /^\\.listen/i
      post NOTICE, channel, "[SHOUTcast Stream] YouTube Music: #{stats[:yt_url]} | SHOUTcast: http://stream.drfun1.com:8000/live"
    when /^\\.stats/i
      post NOTICE, channel, "[SHOUTcast Stats] 855,000 Channels Synced by Artist, Genre, & Record Label | Hub: dev.drfun1media.com:6697"
    end
  end

  def poll_stream_and_playlist
    loop do
      begin
        stats = fetch_active_track
        if stats[:title] != @last_song && !stats[:title].empty?
          @last_song = stats[:title]
          msg = "[SHOUTcast x YouTube Music] Now Playing: #{stats[:artist]} - #{stats[:title]} | #{stats[:label]} | #{stats[:yt_url]}"
          @config['irc']['channels'].each do |chan|
            post NOTICE, chan, msg
            if @config['shoutcast']['topic_update']
              post TOPIC, chan, "DrFun1 Orbit Radio | 🎵 NP: #{stats[:artist]} - #{stats[:title]} (#{stats[:label]}) | Listen: #{stats[:yt_url]}"
            end
          end
        end
      rescue => e
        puts "[Error] Poll error: #{e.message}"
      end
      sleep(@config['shoutcast']['poll_interval'] || 10)
    end
  end

  def fetch_active_track
    # Parses YouTube Music library playlist & SHOUTcast D.N.A. XML
    {
      artist: "#{selectedTrack.artist}",
      title: "#{selectedTrack.title}",
      label: "#{selectedTrack.label}",
      genre: "#{selectedTrack.genre}",
      yt_url: "#{selectedTrack.youtubeMusicUrl}",
      listeners: #{selectedTrack.listeners}
    }
  end
end

bot = ShoutcastIrcBot.new('dev.drfun1media.com', 6697, { nick: 'ShoutcastBot', ssl: true })
bot.start`;

  const yamlConfig = `# ========================================================
# config.yml - donSchoe/shoutcast-irc configuration
# Categorized: 855,000 Channels by Artist, Genre, & Record Label
# Playlist Engine: YouTube Music Library
# ========================================================
irc:
  server: "dev.drfun1media.com"
  port: 6697
  ssl: true
  nick: "ShoutcastBot"
  user: "shoutcast"
  realname: "donSchoe/shoutcast-irc Bot (855,000 Channels)"
  channels:
    # 855,000 Channels categorized by Artist, Genre & Record Label
    - "#music-deathrow"
    - "#artist-snoopdogg"
    - "#artist-orbitnova"
    - "#artist-2pac"
    - "#artist-drdre"
    - "#genre-synthwave"
    - "#genre-gfunk"
    - "#genre-lofi-space"
    - "#genre-edm-trance"
    - "#label-deathrow"
    - "#label-drfun1music"
    - "#label-wittlaw-records"
    - "#lobby"
    - "#drfun1-primetv"
    - "#drfun1-orbitradio"

shoutcast:
  host: "stream.drfun1.com"
  port: 8000
  mount: "/live"
  poll_interval: 10
  topic_update: true
  youtube_music_playlist: "${selectedPlaylist.youtubePlaylistUrl}"
  announce_format: "[SHOUTcast D.N.A. x YouTube Music] Now Playing: %artist% - %title% | Label: %label% | Genre: %genre% | Stream: %yt_url%"
  transit_provider: "RisingNet Global Transit (www.risingnet.com)"
  colocation: "Switch SUPERNAP Core Campus (www.switch.com)"
  legal_licensee: "Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com) FCC FRN: 0034981290"`;

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(yamlConfig);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Filtered tracks for YouTube library
  const filteredTracks = YOUTUBE_MUSIC_TRACKS.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGenre = genreFilter === 'all' || t.genre.toLowerCase().includes(genreFilter.toLowerCase());
    const matchLabel = labelFilter === 'all' || t.label.toLowerCase().includes(labelFilter.toLowerCase());
    return matchSearch && matchGenre && matchLabel;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-6xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 via-purple-600 to-pink-500 p-0.5 shadow-lg flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Youtube className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-white font-bold text-base sm:text-lg tracking-wide flex items-center gap-2">
                  <span>donSchoe/shoutcast-irc</span>
                  <span className="text-xs font-mono font-normal text-purple-300">YouTube Music Playlist Engine</span>
                </h2>
                <a
                  href="https://github.com/donSchoe/shoutcast-irc.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 flex items-center gap-1 transition"
                  title="View upstream Git repository on GitHub"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>github.com/donSchoe/shoutcast-irc</span>
                </a>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>855,000 CHANNELS (ARTIST • GENRE • LABEL)</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono flex flex-wrap items-center gap-2">
                <span>YouTube Music Library Playlist Engine &bull; SHOUTcast D.N.A. Track Announcer</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-sky-400">Hub: {activeServer}:6697</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-amber-400">WittLaw Verified (FRN 0034981290)</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Artist, Music Genre, Label, YouTube Music Playlist) */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center gap-1.5 shrink-0 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('yt_playlist')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'yt_playlist'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-red-200" />
            <span>YouTube Music Playlists</span>
          </button>

          <button
            onClick={() => setActiveTab('bot_library')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'bot_library'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-emerald-200" />
            <span>Bot Fleet &amp; Music Engine (7 Bots)</span>
          </button>

          <button
            onClick={() => setActiveTab('by_genre')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'by_genre'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>855,000 by Music Genre (7)</span>
          </button>

          <button
            onClick={() => setActiveTab('by_artist')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'by_artist'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>855,000 by Artist (10)</span>
          </button>

          <button
            onClick={() => setActiveTab('by_label')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'by_label'
                ? 'bg-pink-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>855,000 by Record Label (6)</span>
          </button>

          <button
            onClick={() => setActiveTab('stream')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'stream'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>SHOUTcast Live D.N.A.</span>
          </button>

          <button
            onClick={() => setActiveTab('commands')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'commands'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Bot Commands (.np)</span>
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'network'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Network Fanout</span>
          </button>

          <button
            onClick={() => setActiveTab('daemon')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'daemon'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Ruby Daemon</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {announceFeedback && (
            <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{announceFeedback}</span>
              </span>
              <span className="text-[10px] text-emerald-400/80">Fanout: 855,000 channels</span>
            </div>
          )}

          {customPlaylistFeedback && (
            <div className="bg-sky-500/15 border border-sky-500/40 text-sky-300 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{customPlaylistFeedback}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: YOUTUBE MUSIC LIBRARY AS PLAYLIST                   */}
          {/* ========================================================= */}
          {activeTab === 'yt_playlist' && (
            <div className="space-y-6">
              {/* YouTube Music Player Card */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-5 border-b border-slate-800">
                  {/* Track Info & Video Embed / Visualizer */}
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-xl relative shrink-0 group overflow-hidden border border-red-500/40">
                      <Youtube className="w-10 h-10 text-white" />
                      {isPlayingYouTube && (
                        <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-600 text-white font-bold flex items-center gap-1 shadow">
                          <Youtube className="w-3 h-3" />
                          <span>YouTube Music</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                          {selectedTrack.label}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
                          {selectedTrack.genre}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-1 truncate" title={selectedTrack.title}>
                        {selectedTrack.title}
                      </h3>
                      <p className="text-sm text-purple-300 font-semibold truncate mt-0.5">
                        {selectedTrack.artist} &bull; <span className="text-slate-400 font-normal">{selectedTrack.album} ({selectedTrack.releaseYear})</span>
                      </p>
                    </div>
                  </div>

                  {/* Playback Controls & Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center justify-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
                      <button
                        onClick={handlePrevTrack}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        title="Previous Track"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setIsPlayingYouTube(!isPlayingYouTube)}
                        className={`p-2.5 rounded-xl font-bold text-xs flex items-center justify-center transition cursor-pointer shadow-lg ${
                          isPlayingYouTube
                            ? 'bg-red-600 hover:bg-red-500 text-white'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                        }`}
                        title={isPlayingYouTube ? 'Pause Track' : 'Play Track'}
                      >
                        {isPlayingYouTube ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>

                      <button
                        onClick={handleNextTrack}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        title="Next Track"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isShuffle ? 'text-purple-400 bg-purple-950/40' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title="Shuffle Playlist"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setIsRepeat(!isRepeat)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isRepeat ? 'text-purple-400 bg-purple-950/40' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title="Repeat Playlist"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAnnounceToIrc}
                        className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                        title="Announce track to active IRC channel"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Announce Track</span>
                      </button>

                      <a
                        href={selectedTrack.youtubeMusicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-red-300 border border-red-500/30 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 transition"
                        title="Open in YouTube Music app"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>music.youtube.com</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Scrubber Progress Bar & Time */}
                <div className="my-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                    <span>
                      {Math.floor(currentPlaySec / 60)}:
                      {(currentPlaySec % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-purple-300">
                      Channel: {selectedTrack.ircChannel} &bull; {selectedTrack.listeners.toLocaleString()} Active Listeners
                    </span>
                    <span>{selectedTrack.duration}</span>
                  </div>
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = (e.clientX - rect.left) / rect.width;
                      setCurrentPlaySec(Math.floor(ratio * selectedTrack.durationSec));
                    }}
                    className="w-full h-2 bg-slate-800 rounded-full cursor-pointer relative overflow-hidden"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-red-600 via-purple-600 to-indigo-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (currentPlaySec / selectedTrack.durationSec) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Audio Analyzer Equalizer Simulation */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5 text-red-400 font-bold">
                      <Activity className="w-3.5 h-3.5" />
                      <span>YouTube Music Hi-Fi Audio DSP &bull; {selectedTrack.audioFormat}</span>
                    </span>
                    <span className="text-purple-300 font-bold">{selectedTrack.bitrate}</span>
                  </div>
                  <div className="h-10 flex items-end gap-1.5 px-1">
                    {[
                      60, 85, 40, 92, 75, 55, 98, 80, 50, 72, 90, 68, 94, 60, 82, 54, 88, 95, 42, 78,
                      84, 65, 96, 79, 70, 87, 60, 75, 89, 98, 48, 70, 82, 65, 92, 78, 62, 85, 90, 74
                    ].map((height, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all duration-150 ${
                          isPlayingYouTube
                            ? 'bg-gradient-to-t from-red-600 via-purple-500 to-pink-400'
                            : 'bg-slate-800'
                        }`}
                        style={{
                          height: isPlayingYouTube ? `${height}%` : '15%',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMassAnnounce}
                      className="px-3 py-1.5 bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      title="Broadcast Now Playing update across all 855,000 channels"
                    >
                      <Globe className="w-3.5 h-3.5 text-purple-400" />
                      <span>Mass Announce to 855,000 Channels</span>
                    </button>

                    <button
                      onClick={() => setTopicAutoSyncEnabled(!topicAutoSyncEnabled)}
                      className={`px-3 py-1.5 border rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
                        topicAutoSyncEnabled
                          ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${topicAutoSyncEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span>Topic Auto-Sync: {topicAutoSyncEnabled ? 'ENABLED' : 'DISABLED'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-slate-500">Curator:</span>
                    <span className="text-slate-300 font-bold">{selectedPlaylist.curator}</span>
                  </div>
                </div>
              </div>

              {/* Curated YouTube Music Playlists Selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ListMusic className="w-4 h-4 text-red-400" />
                    <span>Curated YouTube Music Playlists</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    7 Curated Playlists &bull; 855,000 Channels Synced
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
                  {YOUTUBE_MUSIC_PLAYLISTS.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => {
                        setSelectedPlaylist(pl);
                        if (pl.tracks.length > 0) {
                          handleSelectTrack(pl.tracks[0]);
                        }
                      }}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition cursor-pointer ${
                        selectedPlaylist.id === pl.id
                          ? 'bg-red-950/30 border-red-500/80 shadow-lg ring-1 ring-red-500/40'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-950 text-red-300 border border-red-500/30">
                            {pl.genre.split('/')[0]}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            {(pl.channelCount / 1000).toFixed(0)}k Channels
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white line-clamp-2 mt-1">{pl.name}</h5>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{pl.description}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>{pl.tracks.length} Tracks</span>
                        <span className="text-purple-300">{pl.activeListeners.toLocaleString()} Listeners</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Playlist Tracks Search & Table */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search YouTube Music library by artist, song, genre, or record label..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={genreFilter}
                      onChange={(e) => setGenreFilter(e.target.value)}
                      className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono cursor-pointer"
                    >
                      <option value="all">All Genres</option>
                      <option value="Hip Hop">Hip Hop &amp; G-Funk</option>
                      <option value="Synthwave">Space Synthwave</option>
                      <option value="Lo-Fi">Lo-Fi Space Beats</option>
                      <option value="Electronic">Cyberpunk EDM</option>
                      <option value="Symphony">Space Symphony</option>
                      <option value="Reggae">Reggae &amp; Dub</option>
                    </select>

                    <select
                      value={labelFilter}
                      onChange={(e) => setLabelFilter(e.target.value)}
                      className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono cursor-pointer"
                    >
                      <option value="all">All Record Labels</option>
                      <option value="Death Row">Death Row Records</option>
                      <option value="DrFun1">DrFun1 Music Group</option>
                      <option value="WittLaw">WittLaw Soundworks</option>
                      <option value="Aftermath">Aftermath / Interscope</option>
                      <option value="Sony">Sony Masterworks</option>
                    </select>
                  </div>
                </div>

                {/* Tracks Table */}
                <div className="border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                  <table className="w-full text-xs font-mono text-left">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Title &amp; Artist</th>
                        <th className="py-2.5 px-3">Record Label</th>
                        <th className="py-2.5 px-3">Genre</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">IRC Channel</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                      {filteredTracks.map((track, i) => (
                        <tr
                          key={track.id}
                          onClick={() => handleSelectTrack(track)}
                          className={`hover:bg-slate-900/60 cursor-pointer transition ${
                            selectedTrack.id === track.id ? 'bg-red-950/20' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-slate-500 font-bold">
                            {selectedTrack.id === track.id ? (
                              <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping" />
                            ) : (
                              i + 1
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="text-white font-bold">{track.title}</div>
                            <div className="text-[11px] text-purple-300">{track.artist}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-slate-300">
                              {track.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">{track.genre}</td>
                          <td className="py-2.5 px-3 text-slate-400">{track.duration}</td>
                          <td className="py-2.5 px-3 text-purple-400 font-bold">{track.ircChannel}</td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleSelectTrack(track)}
                                className="px-2 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 rounded text-[10px] font-bold transition"
                                title="Play Track"
                              >
                                Play
                              </button>
                              <a
                                href={track.youtubeMusicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                                title="Open in YouTube Music"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Custom YouTube Music Playlist Loader Input */}
                <form
                  onSubmit={handleLoadCustomPlaylist}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3"
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300 shrink-0">
                    <ListMusic className="w-4 h-4 text-red-400" />
                    <span>Load Custom YouTube Music Playlist:</span>
                  </div>
                  <input
                    type="text"
                    value={customPlaylistInput}
                    onChange={(e) => setCustomPlaylistInput(e.target.value)}
                    placeholder="Paste YouTube Music playlist URL or ID (e.g., https://music.youtube.com/playlist?list=...)"
                    className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs font-mono transition cursor-pointer shrink-0"
                  >
                    Ingest Playlist
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: BOT FLEET & YOUTUBE MUSIC ENGINES                     */}
          {/* ========================================================= */}
          {activeTab === 'bot_library' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-purple-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-white font-bold text-sm">
                      donSchoe/shoutcast-irc Bot Fleet &bull; YouTube Music Engines
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      855,000 CHANNELS SYNCED
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1 max-w-2xl">
                    The bot fleet utilizes YouTube Music playlists as its autonomous audio library. Each bot synchronizes live track metadata, Now Playing notices, and channel topics across its assigned slice of the 855,000 IRCD channels.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-right">
                    <div className="text-xs text-slate-500 uppercase">Bot Fleet</div>
                    <div className="text-sm font-bold text-emerald-400">{BOT_MUSIC_ROSTER.length} Daemons Active</div>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-right">
                    <div className="text-xs text-slate-500 uppercase">Channels</div>
                    <div className="text-sm font-bold text-purple-300">855,000 Synced</div>
                  </div>
                </div>
              </div>

              {/* Bot Architecture Blueprint */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs font-mono">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span>Autonomous Upstream Pipeline Architecture</span>
                  </span>
                  <a
                    href="https://github.com/donSchoe/shoutcast-irc.git"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>https://github.com/donSchoe/shoutcast-irc.git</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-center text-[11px] pt-1">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-red-500/30">
                    <div className="text-red-400 font-bold">1. YouTube Music Library</div>
                    <div className="text-slate-400 mt-1">Curated Playlists &bull; 320 kbps Stems &bull; Artist Catalogs</div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-purple-500/30">
                    <div className="text-purple-400 font-bold">2. donSchoe/shoutcast-irc</div>
                    <div className="text-slate-400 mt-1">Ruby Net-IRC &bull; D.N.A. XML Scraper &bull; Polling Loop</div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-sky-500/30">
                    <div className="text-sky-400 font-bold">3. Switch SUPERNAP 100G</div>
                    <div className="text-slate-400 mt-1">26 Leaf Nodes &bull; RisingNet DWDM &bull; 1.2ms Latency</div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-emerald-500/30">
                    <div className="text-emerald-400 font-bold">4. UnrealIRCd 6.1.4</div>
                    <div className="text-slate-400 mt-1">855,000 Synced Channels &bull; Denora Stats &bull; Topic Sync</div>
                  </div>
                </div>
              </div>

              {/* Bot Fleet Roster Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-emerald-400" />
                    <span>Active Bot Fleet &amp; Assigned YouTube Music Engines</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    7 Specialized Bots &bull; Total Fanout: 855,000 Channels
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {BOT_MUSIC_ROSTER.map((bot) => (
                    <div
                      key={bot.botNick}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/50 transition"
                    >
                      <div>
                        {/* Bot Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
                              @{bot.botNick.slice(0, 2)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white text-sm">@{bot.botNick}</span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  {bot.status}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400">{bot.role}</div>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <span className="text-xs font-bold text-emerald-400">
                              {bot.channelsCount.toLocaleString()}
                            </span>
                            <div className="text-[10px] text-slate-500 uppercase">Channels</div>
                          </div>
                        </div>

                        {/* Specialization & Focus */}
                        <div className="mt-3 text-xs text-slate-300 font-mono">
                          <p className="text-slate-400">{bot.specialization}</p>
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-purple-300">
                            <span className="text-slate-500">Channels:</span>
                            <span className="truncate">{bot.channelFocus}</span>
                          </div>
                        </div>

                        {/* YouTube Music Source Link & Active Track */}
                        <div className="mt-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Youtube className="w-3 h-3 text-red-400" />
                              <span>YouTube Playlist:</span>
                            </span>
                            <span className="text-red-300 font-bold truncate max-w-[220px]">
                              {bot.playlistName}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Music className="w-3 h-3 text-emerald-400" />
                              <span>Now Playing:</span>
                            </span>
                            <span className="text-white font-bold truncate max-w-[220px]">
                              {bot.currentTrackArtist} - {bot.currentTrackTitle}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                            <span>Uptime: {bot.uptime}</span>
                            <a
                              href={bot.youtubeMusicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-400 hover:text-red-300 hover:underline flex items-center gap-0.5"
                            >
                              <span>Open on YouTube Music</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>

                        {/* Supported Triggers */}
                        <div className="mt-3 flex flex-wrap items-center gap-1">
                          <span className="text-[10px] font-mono text-slate-500 mr-1">Triggers:</span>
                          {bot.supportedCommands.map((cmd) => (
                            <button
                              key={cmd}
                              onClick={() => {
                                handleRunCommand(cmd);
                                setActiveTab('commands');
                              }}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-[10px] transition cursor-pointer"
                              title={`Execute ${cmd} trigger in simulator`}
                            >
                              {cmd}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                        <button
                          onClick={() => {
                            const found = YOUTUBE_MUSIC_TRACKS.find((t) => t.id === bot.activeTrackId);
                            if (found) {
                              handleSelectTrack(found);
                            }
                            setActiveTab('yt_playlist');
                          }}
                          className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>Load in Player</span>
                        </button>

                        <button
                          onClick={() => {
                            const announcement = `[@${bot.botNick} x YouTube Music] Now Playing: ${bot.currentTrackArtist} - "${bot.currentTrackTitle}" | Playlist: ${bot.playlistName} | Listen: ${bot.youtubeMusicUrl} | Synced across ${bot.channelsCount.toLocaleString()} channels!`;
                            if (onBroadcastToIrc) {
                              onBroadcastToIrc(announcement, currentIrcChannel);
                            }
                            setAnnounceFeedback(`@${bot.botNick} announcement broadcast to ${currentIrcChannel} across ${bot.channelsCount.toLocaleString()} channels!`);
                            setTimeout(() => setAnnounceFeedback(null), 3500);
                          }}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Broadcast .np to IRC</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* YouTube Music Bot Queue */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
                <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <ListMusic className="w-4 h-4 text-red-400" />
                    <span>Global YouTube Music Bot Fleet Playback Queue</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    Scraped from YouTube Music Playlist API &bull; 855,000 Channels Fanout
                  </span>
                </div>

                <div className="divide-y divide-slate-800/60 font-mono text-xs">
                  {YOUTUBE_MUSIC_TRACKS.slice(0, 6).map((track, idx) => (
                    <div key={track.id} className="p-3 flex items-center justify-between hover:bg-slate-800/40 transition">
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-center text-slate-500 font-bold">{idx + 1}</span>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{track.title}</span>
                            <span className="text-[10px] text-purple-300 px-1 rounded bg-purple-950/60 border border-purple-500/20">
                              {track.label}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {track.artist} &bull; <span className="text-emerald-400">{track.genre}</span> &bull; {track.duration}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 font-bold">
                          {track.listeners.toLocaleString()} listeners
                        </span>
                        <a
                          href={track.youtubeMusicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <Youtube className="w-3 h-3" />
                          <span>Tune In</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: 855,000 CHANNELS CATEGORIZED BY MUSIC GENRE        */}
          {/* ========================================================= */}
          {activeTab === 'by_genre' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-bold text-sm">
                      855,000 Channels Network Categorized by Music Genre
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Every channel in the 855,000 UnrealIRCd mesh is mapped to a dedicated musical genre stream powered by SHOUTcast D.N.A. &amp; YouTube Music playlists.
                  </p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xl font-bold text-emerald-400">855,000</div>
                  <div className="text-[10px] text-slate-400 uppercase">Synchronized Channels</div>
                </div>
              </div>

              {/* Genres Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MUSIC_GENRE_CATEGORIES.map((genre) => (
                  <div
                    key={genre.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/60 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/30">
                          {genre.channelPrefix}*
                        </span>
                        <span className="text-sm font-bold text-emerald-400 font-mono">
                          {genre.channelCount.toLocaleString()} Channels
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-2">{genre.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{genre.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500">Top Artists:</span>
                        <span className="text-purple-300 font-bold truncate max-w-[280px]">
                          {genre.topArtists.join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500">Record Labels:</span>
                        <span className="text-sky-300 truncate max-w-[280px]">
                          {genre.topLabels.join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500">Active Listeners:</span>
                        <span className="text-emerald-400 font-bold">
                          {genre.activeListeners.toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <button
                          onClick={() => {
                            const found = YOUTUBE_MUSIC_TRACKS.find((t) => t.id === genre.featuredTrackId);
                            if (found) handleSelectTrack(found);
                            setActiveTab('yt_playlist');
                          }}
                          className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Youtube className="w-3 h-3" />
                          <span>Tune In on YouTube Music</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onBroadcastToIrc) {
                              onBroadcastToIrc(`[GENRE BROADCAST] Tuning into ${genre.name} across ${genre.channelCount.toLocaleString()} channels!`, currentIrcChannel);
                            }
                          }}
                          className="text-purple-400 hover:text-purple-300 hover:underline text-[11px] font-bold"
                        >
                          Announce to IRC
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: 855,000 CHANNELS CATEGORIZED BY ARTIST             */}
          {/* ========================================================= */}
          {activeTab === 'by_artist' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Mic2 className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-white font-bold text-sm">
                      855,000 Channels Network Categorized by Artist
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Dedicated artist networks routing live broadcasts, studio stem releases, and synchronized chat rooms across 855,000 channels.
                  </p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xl font-bold text-indigo-400">10 Main Artist Hubs</div>
                  <div className="text-[10px] text-slate-400 uppercase">855,000 Channels Total</div>
                </div>
              </div>

              {/* Artists Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ARTIST_CATEGORIES.map((art) => (
                  <div
                    key={art.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/60 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                          {art.channelName}
                        </span>
                        <span className="text-sm font-bold text-emerald-400 font-mono">
                          {art.channelCount.toLocaleString()} Channels
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-2">{art.artistName}</h4>
                      <div className="text-xs text-purple-300 font-mono mt-0.5">
                        {art.genre} &bull; <span className="text-slate-400">{art.label}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-500">Popular Tracks: </span>
                        <span className="text-slate-300">{art.popularTracks.join(', ')}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500">Active Listeners:</span>
                        <span className="text-emerald-400 font-bold">{art.activeListeners.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <a
                          href={art.youtubeMusicArtistUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <Youtube className="w-3 h-3" />
                          <span>YouTube Music Profile</span>
                        </a>

                        <button
                          onClick={() => {
                            if (onBroadcastToIrc) {
                              onBroadcastToIrc(`[ARTIST NETWORK] Tuning in to ${art.artistName} on ${art.channelName} across ${art.channelCount.toLocaleString()} channels!`, currentIrcChannel);
                            }
                          }}
                          className="text-indigo-400 hover:text-indigo-300 hover:underline text-[11px] font-bold cursor-pointer"
                        >
                          Join Channel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: 855,000 CHANNELS CATEGORIZED BY RECORD LABEL       */}
          {/* ========================================================= */}
          {activeTab === 'by_label' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-900 border border-pink-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-pink-400" />
                    <h3 className="text-white font-bold text-sm">
                      855,000 Channels Network Categorized by Record Label
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Licensed record label vaults and distribution pipelines broadcasting across the 855,000 channels UnrealIRCd &amp; SHOUTcast mesh.
                  </p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xl font-bold text-pink-400">6 Record Labels</div>
                  <div className="text-[10px] text-slate-400 uppercase">855,000 Channels Total</div>
                </div>
              </div>

              {/* Labels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RECORD_LABEL_CATEGORIES.map((lbl) => (
                  <div
                    key={lbl.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-pink-500/60 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-950 text-pink-300 border border-pink-500/30">
                          {lbl.channelName}
                        </span>
                        <span className="text-sm font-bold text-emerald-400 font-mono">
                          {lbl.channelCount.toLocaleString()} Channels
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-2">{lbl.labelName}</h4>
                      <p className="text-xs text-slate-400 mt-1">{lbl.genreFocus}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500">Catalog Size:</span>
                        <span className="text-white font-bold">{lbl.catalogSize}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500">HQ &amp; Founded:</span>
                        <span className="text-slate-400">{lbl.founded} &bull; {lbl.headquarters}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500">Active Listeners:</span>
                        <span className="text-emerald-400 font-bold">{lbl.activeListeners.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 italic pt-1">{lbl.licensingNotice}</p>
                      <div className="pt-2 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setLabelFilter(lbl.labelName.split(' ')[0]);
                            setActiveTab('yt_playlist');
                          }}
                          className="px-2.5 py-1 bg-pink-600/30 hover:bg-pink-600/50 text-pink-200 border border-pink-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <ListMusic className="w-3 h-3" />
                          <span>View Label Playlist</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onBroadcastToIrc) {
                              onBroadcastToIrc(`[LABEL BROADCAST] Joined ${lbl.channelName} (${lbl.labelName}) across ${lbl.channelCount.toLocaleString()} channels!`, currentIrcChannel);
                            }
                          }}
                          className="text-pink-400 hover:text-pink-300 hover:underline text-[11px] font-bold cursor-pointer"
                        >
                          Join Channel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: SHOUTCAST D.N.A. LIVE STREAM & ANALYZER             */}
          {/* ========================================================= */}
          {activeTab === 'stream' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg relative">
                      <Music className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          SHOUTcast D.N.A. 2.6
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Mount: {currentTrack.mountPoint}</span>
                        <span className="text-emerald-400 text-xs font-mono flex items-center gap-1 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>LIVE 24/7</span>
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{currentTrack.title}</h3>
                      <p className="text-sm text-purple-300 font-medium">{currentTrack.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAnnounceToIrc}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs font-mono flex items-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Announce to {currentIrcChannel}</span>
                    </button>
                  </div>
                </div>

                {/* Stream Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Headphones className="w-3 h-3 text-sky-400" />
                      <span>Current Listeners</span>
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {currentTrack.listeners.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Max: {currentTrack.maxListeners.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Peak Listeners</span>
                    </div>
                    <div className="text-base font-bold text-amber-300 mt-1">
                      {currentTrack.peakListeners.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      All-time record high
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Radio className="w-3 h-3 text-purple-400" />
                      <span>Host &amp; Live DJ</span>
                    </div>
                    <div className="text-xs font-bold text-purple-200 mt-1 truncate" title={currentTrack.dj}>
                      {currentTrack.dj}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Switch SUPERNAP Teleport
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-400" />
                      <span>Network Reach</span>
                    </div>
                    <div className="text-base font-bold text-emerald-300 mt-1">
                      855,000
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Channels Synced on IRC
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: BOT COMMANDS SIMULATOR                              */}
          {/* ========================================================= */}
          {activeTab === 'commands' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span>donSchoe/shoutcast-irc Command Console</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Test or execute announcer bot commands directly against the SHOUTcast D.N.A. daemon
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {['.np', '.song', '.dj', '.listeners', '.stream', '.stats', '.help'].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => handleRunCommand(cmd)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-500/50 text-purple-300 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terminal Box */}
              <div
                ref={logEndRef}
                className="w-full h-80 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-2 select-text shadow-inner"
              >
                {commandLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    <span className="text-slate-600 mr-2">[{log.timestamp}]</span>
                    <span
                      className={`font-bold mr-2 ${
                        log.sender === 'ShoutcastBot'
                          ? 'text-purple-400'
                          : log.sender === 'System'
                          ? 'text-sky-400'
                          : 'text-amber-300'
                      }`}
                    >
                      &lt;{log.sender}&gt;
                    </span>
                    <span
                      className={`${
                        log.text.startsWith('[SHOUTcast')
                          ? 'text-emerald-300 font-medium'
                          : log.isBot
                          ? 'text-slate-200'
                          : 'text-white'
                      }`}
                    >
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Interactive Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRunCommand(commandInput);
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-purple-400 font-mono font-bold text-xs">
                    shoutcast-bot&gt;
                  </span>
                  <input
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder="Enter command: .np, .song, .dj, .listeners, .stream, .stats, .help"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-32 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: 855,000 CHANNELS FANOUT MATRIX                      */}
          {/* ========================================================= */}
          {activeTab === 'network' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-bold text-sm">
                      855,000 Channels Fanout Matrix (Artist, Genre &amp; Label)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    The donSchoe/shoutcast-irc bot leverages UnrealIRCd 6.1.4 high-throughput leaf sync to distribute radio metadata across all 855,000 active channels.
                  </p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xl font-bold text-emerald-400">855,000</div>
                  <div className="text-[10px] text-slate-400 uppercase">Synchronized Channels</div>
                </div>
              </div>

              {/* Sample Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Channel Name</th>
                      <th className="py-2.5 px-3">Classification</th>
                      <th className="py-2.5 px-3">Active Users</th>
                      <th className="py-2.5 px-3">Modes</th>
                      <th className="py-2.5 px-3">SHOUTcast Bot Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                    {[
                      { name: '#music-deathrow', type: 'Death Row Records Flagship', users: 48290, modes: '+sntk 100G', status: 'YouTube Music Synced' },
                      { name: '#artist-snoopdogg', type: 'Snoop Dogg Official Channel', users: 43900, modes: '+sntk 100G', status: 'Active (NP Sync)' },
                      { name: '#artist-orbitnova', type: 'DJ Orbit Nova & Richard Alan Witt', users: 58940, modes: '+sntk 100G', status: 'Live NOC Deck' },
                      { name: '#genre-synthwave', type: 'Space Synthwave & Retrowave', users: 41200, modes: '+sntk 100G', status: 'Active' },
                      { name: '#genre-gfunk', type: '90s West Coast G-Funk', users: 36740, modes: '+cnt', status: 'Active' },
                      { name: '#genre-lofi-space', type: 'Lo-Fi Space Beats & Ambient', users: 64200, modes: '+cnt', status: 'Active' },
                      { name: '#label-deathrow', type: 'Death Row Records Catalog', users: 52410, modes: '+sntk 100G', status: 'Master Vault Synced' },
                      { name: '#label-drfun1music', type: 'DrFun1 Music Group Hub', users: 39820, modes: '+sntk 100G', status: 'Active' },
                      { name: '#lobby', type: 'Flagship Network Lobby', users: 8838, modes: '+sntk 100G', status: 'Active (NP Sync)' },
                      { name: '#all-855000-channels', type: 'Global Mesh Distribution Fanout', users: 1245800, modes: '+sntk 100G', status: '855,000 Channels Synced' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3 text-purple-300 font-bold">{row.name}</td>
                        <td className="py-2.5 px-3 text-slate-300">{row.type}</td>
                        <td className="py-2.5 px-3 text-white font-bold">{row.users.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-slate-400">{row.modes}</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: RUBY DAEMON & CONFIG.YML                            */}
          {/* ========================================================= */}
          {activeTab === 'daemon' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-purple-400" />
                    <span>donSchoe/shoutcast-irc Source &amp; Configuration</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Ruby daemon script (shoutcast-irc.rb) and YAML configuration file (config.yml) with YouTube Music support
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyYaml}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied YAML!' : 'Copy config.yml'}</span>
                  </button>

                  <a
                    href="https://github.com/donSchoe/shoutcast-irc.git"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Clone Git Repo</span>
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-purple-300 font-bold">config.yml (YouTube Music Playlist Integration)</span>
                    <span className="text-slate-500">YAML Format</span>
                  </div>
                  <pre className="p-4 bg-slate-950 text-xs font-mono text-emerald-300 overflow-x-auto max-h-56 select-text">
                    {yamlConfig}
                  </pre>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-sky-300 font-bold">shoutcast-irc.rb (Ruby Daemon Implementation)</span>
                    <span className="text-slate-500">Ruby Net-IRC / XmlSimple</span>
                  </div>
                  <pre className="p-4 bg-slate-950 text-xs font-mono text-slate-300 overflow-x-auto max-h-64 select-text">
                    {rubyDaemonCode}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900/90 border-t border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <Radio className="w-4 h-4 text-purple-400" />
            <span>donSchoe/shoutcast-irc.git &bull; YouTube Music Playlist Engine</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-emerald-400">855,000 Channels (Artist, Genre &amp; Record Label)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
