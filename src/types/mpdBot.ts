export type MpdBotCategory = 'artist' | 'genre' | 'label';

export interface MpdTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number | string;
  duration: number; // in seconds
  bitrate: string; // e.g. "320 kbps MP3", "FLAC Lossless"
  genre: string;
  label: string;
  fileFormat: string; // "mp3", "flac", "ogg", "wav"
  requestedBy?: string;
  rating?: number;
}

export interface MpdBotInstance {
  id: string;
  name: string;
  botNick: string;
  categoryType: MpdBotCategory;
  targetEntity: string; // e.g. 'Death Row Records', '2Pac', 'Synthwave'
  ircChannel: string; // e.g. '#deathrow-records'
  mpdHost: string; // e.g. 'mpd.drfun1.com'
  mpdPort: number; // e.g. 6601
  streamUrl: string; // e.g. 'https://radio.drfun1.com/mpd-deathrow.mp3'
  status: 'online' | 'streaming' | 'idle' | 'updating_db';
  nowPlaying: MpdTrack;
  queue: MpdTrack[];
  history: MpdTrack[];
  volume: number; // 0-100
  crossfade: number; // seconds
  repeat: boolean;
  random: boolean;
  single: boolean;
  consume: boolean;
  isPlaying: boolean;
  elapsedSeconds: number;
  duplicatorEnabled: boolean;
  duplicatorTargets: string[]; // channels to duplicate chat & !np to
  duplicatorPrefix: string;
  duplicatorMode: 'mirror' | 'broadcast' | 'filtered';
  colorTheme: string; // Tailwind color e.g. 'purple', 'emerald', 'amber', 'rose', 'blue', 'cyan', 'indigo', 'orange'
  audioSimType: 'hiphop' | 'synthwave' | 'jazz' | 'rock' | 'ambient' | 'funk' | 'electronic';
  audioSimFreq: number;
  githubRepo: string; // 'https://github.com/chat-apropo/mpd_irc_bot.git'
  stats: {
    totalPlayed: number;
    listeners: number;
    requestsHandled: number;
    duplicatedMessages: number;
    uptime: string;
  };
}

export interface IrcDuplicatorMessage {
  id: string;
  timestamp: string;
  sourceChannel: string;
  targetChannel: string;
  sender: string;
  content: string;
  msgType: 'chat' | 'now_playing' | 'request' | 'system' | 'vote';
  botNick: string;
  latencyMs: number;
}
