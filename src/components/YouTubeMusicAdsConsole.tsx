/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * YouTube Music & DrFun1 FM Ads Console
 * Integrates:
 * - Direct YouTube Music (https://music.youtube.com) streaming, playlists & search
 * - DrFun1 FM Commercial & Audio Sponsorship Engine (15s/30s ad breaks & revenue metrics)
 * - MPD Music Station Console sync (Deck A/B cueing, queue insertion, talkover ducking)
 * - FCC FRN 0034981290 Legal & Sponsorship Compliance (wittlawfirm.com)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Music,
  Radio,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Disc,
  Clock,
  Sparkles,
  Zap,
  Check,
  Copy,
  Search,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Flame,
  Layers,
  ArrowRight,
  Plus,
  SkipForward,
  Info,
  Tv
} from 'lucide-react';
import { YOUTUBE_MUSIC_TRACKS, YOUTUBE_MUSIC_PLAYLISTS, YouTubeMusicTrack } from '../data/shoutcastMusicLibraryData';

export interface CommercialAdPod {
  id: string;
  sponsorName: string;
  category: 'youtube_music' | 'drfun1_ecom' | 'switch_telecom' | 'witt_law' | 'datapacket' | 'wireless_esim';
  title: string;
  scriptAudioLiner: string;
  durationSec: number;
  cpmRate: number;
  targetUrl: string;
  status: 'ready' | 'airing' | 'queued';
  impressionsDelivered: number;
  badge: string;
}

export const STATION_COMMERCIAL_PODS: CommercialAdPod[] = [
  {
    id: 'ad-ytm-01',
    sponsorName: 'YouTube Music Premium',
    category: 'youtube_music',
    title: 'YouTube Music - Stream Over 100M Tracks Without Ads',
    scriptAudioLiner: 'This hour of DrFun1 FM is sponsored by YouTube Music. Stream over one hundred million official songs, albums, and remixes in background audio on https://music.youtube.com. Try one month free.',
    durationSec: 15,
    cpmRate: 3.20,
    targetUrl: 'https://music.youtube.com',
    status: 'ready',
    impressionsDelivered: 42800,
    badge: 'OFFICIAL SPONSOR'
  },
  {
    id: 'ad-ecom-02',
    sponsorName: 'drfun1 ECOM Inc.',
    category: 'drfun1_ecom',
    title: 'Wholesale 100G Optical Fiber & C-Band Satellite Dishes',
    scriptAudioLiner: 'Upgrade your carrier downlinks with drfun1 ECOM. Enterprise 100G QSFP28 transceivers, dish actuators, and redundant Anycast DNS available now in the DrFun1 Hardware Store.',
    durationSec: 20,
    cpmRate: 2.80,
    targetUrl: 'https://store.drfun1.com',
    status: 'ready',
    impressionsDelivered: 36100,
    badge: 'STORE PROMO'
  },
  {
    id: 'ad-switch-03',
    sponsorName: 'Switch SUPERNAP Nevada',
    category: 'switch_telecom',
    title: 'Tier 5 Platinum 100% Green Energy Colocation',
    scriptAudioLiner: 'Broadcasting from the Switch SUPERNAP Teleport in Las Vegas and the Reno Citadel Campus. Mission-critical Tier 5 Platinum colocation powered by 100% renewable solar energy.',
    durationSec: 15,
    cpmRate: 2.50,
    targetUrl: 'https://www.switch.com',
    status: 'ready',
    impressionsDelivered: 29400,
    badge: 'FACILITY BACKBONE'
  },
  {
    id: 'ad-witt-04',
    sponsorName: 'The Law Office of Richard A. Witt LLC',
    category: 'witt_law',
    title: 'FCC Title 47 Part 25 Satellite & Broadcast Regulatory Escrow',
    scriptAudioLiner: 'Legal counsel and spectrum compliance supervised by Richard Alan Witt, Esq. Operating under FCC Registration Number 0034981290. Learn more at wittlawfirm.com.',
    durationSec: 30,
    cpmRate: 4.50,
    targetUrl: 'https://www.wittlawfirm.com',
    status: 'ready',
    impressionsDelivered: 19800,
    badge: 'LEGAL STATUTORY'
  },
  {
    id: 'ad-dp-05',
    sponsorName: 'DataPacket 100G Edge Transit',
    category: 'datapacket',
    title: 'Unmetered 100 Gbps Trans-Atlantic CDN77 Points of Presence',
    scriptAudioLiner: 'DataPacket 100G No-Ads high-capacity edge nodes. Trans-Atlantic fiber interconnects deliver zero packet loss audio to listeners worldwide.',
    durationSec: 15,
    cpmRate: 2.75,
    targetUrl: 'https://datapacket.com',
    status: 'ready',
    impressionsDelivered: 24300,
    badge: 'CDN TRANSIT'
  },
  {
    id: 'ad-esim-06',
    sponsorName: 'DrFun1 Wireless Global 5G',
    category: 'wireless_esim',
    title: 'Instant Satellite & Cellular eSIM Data in 190+ Countries',
    scriptAudioLiner: 'Stay connected anywhere with DrFun1 Wireless. Instant QR code eSIM provisioning for 5G cellular and 3GPP NTN satellite fallback.',
    durationSec: 15,
    cpmRate: 2.90,
    targetUrl: 'https://esim.drfun1.com',
    status: 'ready',
    impressionsDelivered: 31200,
    badge: '5G ESIM'
  }
];

interface YouTubeMusicAdsConsoleProps {
  onQueueTrackDeckA?: (track: YouTubeMusicTrack) => void;
  onQueueTrackDeckB?: (track: YouTubeMusicTrack) => void;
  onSendToDrFun1Fm?: (track: YouTubeMusicTrack) => void;
  currentStationTrack?: string;
}

export const YouTubeMusicAdsConsole: React.FC<YouTubeMusicAdsConsoleProps> = ({
  onQueueTrackDeckA,
  onQueueTrackDeckB,
  onSendToDrFun1Fm,
  currentStationTrack = 'Trans-Atlantic 100G Deep Bass Mix'
}) => {
  // Navigation within Console
  const [activeConsoleTab, setActiveConsoleTab] = useState<'youtube_library' | 'ads_engine' | 'revenue_analytics'>('youtube_library');
  
  // YouTube Music search & query
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [copiedUrlKey, setCopiedUrlKey] = useState<string | null>(null);

  // Commercial Ad Pods State
  const [adPods, setAdPods] = useState<CommercialAdPod[]>(STATION_COMMERCIAL_PODS);
  const [activeAdPod, setActiveAdPod] = useState<CommercialAdPod | null>(null);
  const [adProgressSec, setAdProgressSec] = useState<number>(0);
  const [adFrequency, setAdFrequency] = useState<'every_3_tracks' | 'every_15_min' | 'every_30_min' | 'manual'>('every_15_min');
  const [autoInsertEnabled, setAutoInsertEnabled] = useState<boolean>(true);
  const [totalRevenue, setTotalRevenue] = useState<number>(142.85);

  // Active Ad Countdown Timer
  useEffect(() => {
    let timer: any;
    if (activeAdPod) {
      timer = setInterval(() => {
        setAdProgressSec((prev) => {
          if (prev >= activeAdPod.durationSec) {
            // Ad completed
            setActiveAdPod(null);
            setTotalRevenue((r) => Number((r + (activeAdPod.cpmRate / 1000) * 1420).toFixed(2)));
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeAdPod]);

  // Trigger Ad Pod Break
  const handleTriggerAd = (pod: CommercialAdPod) => {
    setActiveAdPod(pod);
    setAdProgressSec(0);
    // Increment impressions
    setAdPods((prev) =>
      prev.map((p) =>
        p.id === pod.id
          ? { ...p, impressionsDelivered: p.impressionsDelivered + 1420, status: 'airing' }
          : { ...p, status: 'ready' }
      )
    );
  };

  const handleSkipAd = () => {
    setActiveAdPod(null);
    setAdProgressSec(0);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrlKey(id);
    setTimeout(() => setCopiedUrlKey(null), 2000);
  };

  // Filter YouTube Music Tracks
  const filteredTracks = useMemo(() => {
    return YOUTUBE_MUSIC_TRACKS.filter((t) => {
      if (selectedGenre !== 'All' && !t.genre.toLowerCase().includes(selectedGenre.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesArtist = t.artist.toLowerCase().includes(q);
        const matchesAlbum = t.album.toLowerCase().includes(q);
        const matchesLabel = t.label.toLowerCase().includes(q);
        return matchesTitle || matchesArtist || matchesAlbum || matchesLabel;
      }
      return true;
    });
  }, [searchQuery, selectedGenre]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-6">
      {/* ========================================================
          1. YOUTUBE MUSIC & ADS CONSOLE HEADER
          ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-pink-600 to-purple-600 p-0.5 shadow-lg shadow-red-950/40 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Music className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>YouTube Music &amp; DrFun1 FM Ads Console</span>
              </h3>
              <a
                href="https://music.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 uppercase tracking-wider flex items-center gap-1.5 hover:bg-red-500/30 transition"
              >
                <span>https://music.youtube.com</span>
                <ExternalLink className="w-3 h-3 text-red-400" />
              </a>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                MPD DJ INTEGRATION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Curate and stream tracks directly from <strong className="text-white">https://music.youtube.com</strong>, inject commercial sponsorship ad pods into the <strong className="text-pink-300">DrFun1 FM 320k stream</strong>, and sync with the <strong className="text-cyan-300">MPD DJ Console</strong>.
            </p>
          </div>
        </div>

        {/* Global Action Triggers */}
        <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
          <a
            href="https://music.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-950/40"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Launch YouTube Music</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => handleTriggerAd(adPods[0])}
            disabled={!!activeAdPod}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-950/30 disabled:opacity-50"
            title="Fire a 15-second commercial break into DrFun1 FM"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Fire 15s Ad Break</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          ACTIVE AD POD ON-AIR ALERT BANNER (WHEN AIRING)
          ======================================================== */}
      {activeAdPod && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/90 via-orange-950/90 to-red-950/90 border-2 border-amber-500/80 text-xs font-mono shadow-2xl animate-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center font-bold">
                <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">COMMERCIAL AD POD IN PROGRESS</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                    {activeAdPod.badge}
                  </span>
                </div>
                <p className="text-amber-200 text-xs font-semibold mt-0.5">{activeAdPod.title}</p>
                <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1 italic">
                  "{activeAdPod.scriptAudioLiner}"
                </p>
              </div>
            </div>

            {/* Countdown & Skip */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">AD TIME REMAINING</span>
                <span className="text-base font-bold text-amber-300 tabular-nums">
                  {activeAdPod.durationSec - adProgressSec}s / {activeAdPod.durationSec}s
                </span>
              </div>

              <button
                onClick={handleSkipAd}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 transition font-bold cursor-pointer text-xs flex items-center gap-1.5"
              >
                <SkipForward className="w-3.5 h-3.5 text-amber-400" />
                <span>Skip Ad (VIP)</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden mt-3 border border-amber-500/30">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-1000"
              style={{ width: `${(adProgressSec / activeAdPod.durationSec) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ========================================================
          CONSOLE NAVIGATION SUBTABS
          ======================================================== */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2 text-xs font-mono">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveConsoleTab('youtube_library')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeConsoleTab === 'youtube_library'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>YouTube Music Library ({YOUTUBE_MUSIC_TRACKS.length})</span>
          </button>

          <button
            onClick={() => setActiveConsoleTab('ads_engine')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeConsoleTab === 'ads_engine'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-amber-300 bg-slate-950 border border-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>DrFun1 FM Audio Ads Engine ({adPods.length})</span>
          </button>

          <button
            onClick={() => setActiveConsoleTab('revenue_analytics')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeConsoleTab === 'revenue_analytics'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-emerald-300 bg-slate-950 border border-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>CPM &amp; Ad Monetization</span>
          </button>
        </div>

        {/* Live Station Monitor Pill */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Now on DrFun1 FM:</span>
          <span className="text-white font-bold truncate max-w-[200px]">{currentStationTrack}</span>
        </div>
      </div>

      {/* ========================================================
          TAB 1: YOUTUBE MUSIC LIBRARY & DIRECT EXPLORER
          ======================================================== */}
      {activeConsoleTab === 'youtube_library' && (
        <div className="space-y-4">
          {/* Quick External Station Curations */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs font-mono">
            {[
              { name: 'West Coast Classics', query: 'West Coast Rap Hip Hop Death Row', color: 'from-pink-900/60 to-purple-900/60' },
              { name: 'Top 100 Global', query: 'Top 100 Hits Billboard', color: 'from-red-900/60 to-orange-900/60' },
              { name: 'Synthwave & EDM', query: 'Synthwave Retrowave Electronic', color: 'from-cyan-900/60 to-blue-900/60' },
              { name: '90s Hip Hop Vault', query: '90s Hip Hop Golden Age', color: 'from-purple-900/60 to-indigo-900/60' },
              { name: 'Deep House 24/7', query: 'Deep House Club Live', color: 'from-teal-900/60 to-emerald-900/60' },
              { name: 'DrFun1 FM Official', query: 'DrFun1 Media Radio Live', color: 'from-amber-900/60 to-pink-900/60' }
            ].map((p, idx) => (
              <a
                key={idx}
                href={`https://music.youtube.com/search?q=${encodeURIComponent(p.query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2.5 rounded-xl border border-slate-800 bg-gradient-to-tr ${p.color} hover:border-slate-700 transition flex flex-col justify-between group cursor-pointer shadow-sm`}
              >
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>STATION</span>
                  <ExternalLink className="w-3 h-3 group-hover:text-white transition" />
                </div>
                <div className="font-bold text-white truncate mt-1 text-xs">{p.name}</div>
                <span className="text-[10px] text-slate-300 mt-1 opacity-80">https://music.youtube.com</span>
              </a>
            ))}
          </div>

          {/* Search & Genre Filters */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks, artists, albums, or labels..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-slate-500 text-[11px]">Genre:</span>
              {(['All', 'West Coast', 'G-Funk', 'Synthwave', 'Hip-Hop'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    selectedGenre === g
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Tracks Table / Cards */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 flex items-center justify-between px-1">
              <span>Showing {filteredTracks.length} YouTube Music Tracks</span>
              <span className="text-[11px] text-slate-500">Each track links directly to https://music.youtube.com</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2.5 font-mono text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="truncate max-w-[240px]">{track.title}</span>
                      </h4>
                      <p className="text-xs text-red-400 font-semibold">{track.artist}</p>
                      <p className="text-[11px] text-slate-400 truncate">{track.album} ({track.releaseYear}) &bull; {track.label}</p>
                    </div>

                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-bold shrink-0">
                      {track.duration}
                    </span>
                  </div>

                  {/* YouTube Music URL & Audio Specs */}
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                    <a
                      href={track.youtubeMusicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-400 hover:text-red-300 truncate flex items-center gap-1"
                      title="Open track on https://music.youtube.com"
                    >
                      <span className="truncate">{track.youtubeMusicUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>

                    <button
                      onClick={() => handleCopy(track.youtubeMusicUrl, track.id)}
                      className="text-slate-400 hover:text-white cursor-pointer shrink-0"
                      title="Copy URL"
                    >
                      {copiedUrlKey === track.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* MPD Console & DrFun1 FM Dispatch Buttons */}
                  <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                    {onQueueTrackDeckA && (
                      <button
                        onClick={() => onQueueTrackDeckA(track)}
                        className="px-2.5 py-1 rounded bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-500/40 font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <Disc className="w-3 h-3 text-purple-400" />
                        <span>Cue Deck A</span>
                      </button>
                    )}

                    {onQueueTrackDeckB && (
                      <button
                        onClick={() => onQueueTrackDeckB(track)}
                        className="px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-200 border border-cyan-500/40 font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <Disc className="w-3 h-3 text-cyan-400" />
                        <span>Cue Deck B</span>
                      </button>
                    )}

                    {onSendToDrFun1Fm && (
                      <button
                        onClick={() => onSendToDrFun1Fm(track)}
                        className="px-2.5 py-1 rounded bg-pink-950/60 hover:bg-pink-900/60 text-pink-200 border border-pink-500/40 font-bold transition cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Radio className="w-3 h-3 text-pink-400" />
                        <span>Air on FM</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: DRFUN1 FM COMMERCIAL & AUDIO ADS ENGINE
          ======================================================== */}
      {activeConsoleTab === 'ads_engine' && (
        <div className="space-y-4">
          {/* Ad Insertion Control Center */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span>Station Commercial Pod &amp; Sponsorship Ingestion</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automated audio ad pods inserted into DrFun1 FM 320 kbps stream &amp; MPD DJ playback queue
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Auto-Insert:</span>
                  <button
                    onClick={() => setAutoInsertEnabled(!autoInsertEnabled)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      autoInsertEnabled ? 'bg-emerald-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoInsertEnabled ? 'translate-x-4' : ''}`} />
                  </button>
                </div>

                <select
                  value={adFrequency}
                  onChange={(e: any) => setAdFrequency(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-xs"
                >
                  <option value="every_3_tracks">Every 3 Tracks</option>
                  <option value="every_15_min">Every 15 Minutes</option>
                  <option value="every_30_min">Every 30 Minutes</option>
                  <option value="manual">Manual DJ Trigger</option>
                </select>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Today's Impressions</span>
                <span className="text-base font-bold text-white tabular-nums">183,600</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Avg Commercial CPM</span>
                <span className="text-base font-bold text-amber-400 tabular-nums">$3.10 eCPM</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Station Ad Fill Rate</span>
                <span className="text-base font-bold text-emerald-400 tabular-nums">99.8%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Next Scheduled Ad Pod</span>
                <span className="text-base font-bold text-purple-300 tabular-nums">In 08:45</span>
              </div>
            </div>
          </div>

          {/* Roster of Available Commercial Ads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            {adPods.map((pod) => (
              <div
                key={pod.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{pod.sponsorName}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                        {pod.badge}
                      </span>
                    </div>
                    <p className="text-xs text-amber-300 font-medium mt-0.5">{pod.title}</p>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-bold border border-slate-800">
                    {pod.durationSec}s Spot
                  </span>
                </div>

                {/* Audio Script Liner */}
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 leading-relaxed italic">
                  "{pod.scriptAudioLiner}"
                </div>

                {/* Bottom Row: Stats & Action */}
                <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>${pod.cpmRate.toFixed(2)} CPM</span>
                    <span>&bull;</span>
                    <span>{(pod.impressionsDelivered / 1000).toFixed(1)}k plays</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={pod.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
                      title="Visit Sponsor Site"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => handleTriggerAd(pod)}
                      disabled={!!activeAdPod}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Air Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: REVENUE & CPM MONETIZATION
          ======================================================== */}
      {activeConsoleTab === 'revenue_analytics' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-1">
              <span className="text-[11px] text-slate-400 block">Today's Ad Revenue</span>
              <div className="text-2xl font-bold text-white tabular-nums flex items-baseline gap-1">
                <span className="text-emerald-400">${totalRevenue.toFixed(2)}</span>
                <span className="text-xs text-slate-400">USD</span>
              </div>
              <span className="text-[10px] text-emerald-400 block mt-1">↑ 14.2% vs yesterday</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-1">
              <span className="text-[11px] text-slate-400 block">Total Stream Hours Airing</span>
              <div className="text-2xl font-bold text-white tabular-nums flex items-baseline gap-1">
                <span className="text-cyan-400">24 / 24</span>
                <span className="text-xs text-slate-400">Hours</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">100G Switch Fiber Playout</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-1">
              <span className="text-[11px] text-slate-400 block">Sponsor Fill Rate</span>
              <div className="text-2xl font-bold text-white tabular-nums flex items-baseline gap-1">
                <span className="text-purple-400">99.8%</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">6 Active Direct Sponsors</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>FCC Commercial Broadcast Compliance &amp; Title 47 CFR Part 73</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              DrFun1 FM broadcasts comply with FCC sponsorship identification requirements (Title 47 CFR &sect; 73.1212). All commercials and sponsored programming are identified with on-air verbal and text announcements. Legal compliance audited by The Law Office of Richard A. Witt LLC (FCC FRN: 0034981290).
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>https://music.youtube.com Official Links &bull; DrFun1 FM SHOUTcast 320k Stream &bull; MPD 6600 Daemon</span>
        <span className="text-emerald-400 font-bold">100% On-Air Stream &amp; Sponsor Sync</span>
      </div>
    </div>
  );
};
