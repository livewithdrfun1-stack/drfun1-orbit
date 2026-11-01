import React, { useState, useEffect, useRef } from 'react';
import { 
  StreamDestination, 
  StreamChatMessage, 
  StreamOverlay, 
  StreamHealthMetrics,
  EcomTransmissionState,
  RtmpTvHostConfig,
  TvuCloudCdnConfig
} from '../types/stream';
import { 
  INITIAL_STREAM_DESTINATIONS, 
  INITIAL_STREAM_MESSAGES, 
  INITIAL_STREAM_OVERLAYS,
  INITIAL_ECOM_TRANSMISSION,
  INITIAL_RTMP_TV_HOST,
  INITIAL_TVU_CLOUD_CDN
} from '../data/streamData';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { StoreProduct } from '../types/store';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { MultistreamIrcChatRoom } from './MultistreamIrcChatRoom';
import { EcomTransmissionOverlay } from './stream/EcomTransmissionOverlay';
import { RtmpTvHostPanel } from './stream/RtmpTvHostPanel';
import { TvuNetworksCdnClonePanel } from './stream/TvuNetworksCdnClonePanel';
import { EcomTransmissionTab } from './stream/EcomTransmissionTab';
import { 
  Radio, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  Share2, 
  Layers, 
  Plus, 
  Check, 
  Copy, 
  ExternalLink, 
  Play, 
  Square, 
  MessageSquare, 
  Send, 
  Settings, 
  Server, 
  Terminal, 
  Wifi, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  HelpCircle,
  Eye,
  Tv,
  X as CloseIcon,
  ChevronRight,
  ShoppingBag,
  Zap,
  Code2,
  DollarSign
} from 'lucide-react';

interface RestreamStudioViewProps {
  onOpenLicense: () => void;
  onOpenSwitchMesh: () => void;
  onNavigateToStore?: () => void;
  onNavigateToIrc?: () => void;
  onAddToCart?: (product: StoreProduct, isDrfun1: boolean) => void;
  activeRank?: AnopeRankLevel;
  onOpenAdminPanel?: () => void;
}

type VideoSourceType = 'webcam' | 'switch_teleport' | 'launch_feed' | 'orbit_telemetry' | 's_band_radio' | 'optical_laser' | 'color_bars';

export const RestreamStudioView: React.FC<RestreamStudioViewProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onNavigateToStore,
  onNavigateToIrc,
  onAddToCart,
  activeRank = 'op',
  onOpenAdminPanel,
}) => {
  // Broadcaster State
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(true);
  const [broadcastUptime, setBroadcastUptime] = useState<number>(842); // seconds
  const [videoSource, setVideoSource] = useState<VideoSourceType>('switch_teleport');
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isIrcOverlayOnVideo, setIsIrcOverlayOnVideo] = useState<boolean>(true);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string>('ov_license');
  const [activeTab, setActiveTab] = useState<'destinations' | 'ecom_transmission' | 'tv_host' | 'tvu_cloud_cdn' | 'chat' | 'rtmp_setup'>('destinations');

  // ECOM & RTMP TV Host & TVU Cloud CDN States
  const [ecomState, setEcomState] = useState<EcomTransmissionState>(INITIAL_ECOM_TRANSMISSION);
  const [tvConfig, setTvConfig] = useState<RtmpTvHostConfig>(INITIAL_RTMP_TV_HOST);
  const [tvuConfig, setTvuConfig] = useState<TvuCloudCdnConfig>(INITIAL_TVU_CLOUD_CDN);

  // Destinations & Overlays
  const [destinations, setDestinations] = useState<StreamDestination[]>(INITIAL_STREAM_DESTINATIONS);
  const [overlays, setOverlays] = useState<StreamOverlay[]>(INITIAL_STREAM_OVERLAYS);
  const [chatMessages, setChatMessages] = useState<StreamChatMessage[]>(INITIAL_STREAM_MESSAGES);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // New Destination Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newDestName, setNewDestName] = useState<string>('');
  const [newDestPlatform, setNewDestPlatform] = useState<StreamDestination['platform']>('custom_rtmp');
  const [newDestUrl, setNewDestUrl] = useState<string>('rtmp://live.custom-uplink.com/live');
  const [newDestKey, setNewDestKey] = useState<string>('');

  // Audio VU meter simulation
  const [audioLevel, setAudioLevel] = useState<number>(65);

  // Broadcast timer & dynamic telemetry
  useEffect(() => {
    let timer: any;
    if (isBroadcasting) {
      timer = setInterval(() => {
        setBroadcastUptime(prev => prev + 1);
        if (isMicOn) {
          setAudioLevel(Math.floor(40 + Math.random() * 45));
        } else {
          setAudioLevel(0);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBroadcasting, isMicOn]);

  // Aggregate viewers across active enabled destinations
  const totalViewers = destinations
    .filter(d => d.enabled && d.status === 'live')
    .reduce((sum, d) => sum + d.viewers, 0);

  const formatUptime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleDestination = (id: string) => {
    setDestinations(prev =>
      prev.map(d => {
        if (d.id === id) {
          const nextState = !d.enabled;
          return {
            ...d,
            enabled: nextState,
            status: nextState && isBroadcasting ? 'live' : 'offline',
          };
        }
        return d;
      })
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg: StreamChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'Richard Alan Witt (Host)',
      avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=120&q=80',
      platform: 'switch_noc',
      message: newMessageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isModerator: true,
      badge: 'Broadcaster',
    };

    setChatMessages(prev => [...prev, newMsg]);
    setNewMessageText('');
  };

  const featuredProduct = STORE_PRODUCTS.find(p => p.id === ecomState.featuredProductId) || STORE_PRODUCTS[0];

  const handleQuickBuy = (product: StoreProduct, isDrfun1: boolean) => {
    if (onAddToCart) {
      onAddToCart(product, isDrfun1);
    }
    const discountedPrice = Math.round(
      product.drfun1WholesalePrice * (1 - ecomState.discountPercent / 100)
    );
    setEcomState(prev => ({
      ...prev,
      broadcastGmv: prev.broadcastGmv + discountedPrice,
      itemsSold: prev.itemsSold + 1,
      liveBuyersCount: Math.max(1, prev.liveBuyersCount + 1),
    }));

    const orderChatMsg: StreamChatMessage = {
      id: `order_${Date.now()}`,
      sender: 'DrFun1 ECOM Engine',
      avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=120&q=80',
      platform: 'switch_noc',
      message: `🛍️ In-stream order verified: ${product.drfun1RebrandedName} ($${discountedPrice.toLocaleString()})! Provisioning Switch SUPERNAP fiber cross-connect.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badge: 'Order Verified',
    };
    setChatMessages(prev => [...prev, orderChatMsg]);
  };

  const handlePushPromoToChat = (promoText: string) => {
    const promoMsg: StreamChatMessage = {
      id: `promo_${Date.now()}`,
      sender: 'Richard Alan Witt (Host)',
      avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=120&q=80',
      platform: 'switch_noc',
      message: promoText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isModerator: true,
      badge: 'On-Air Host',
    };
    setChatMessages(prev => [...prev, promoMsg]);
  };

  const handleUpdateTvConfig = (updated: Partial<RtmpTvHostConfig>) => {
    setTvConfig(prev => {
      const next = { ...prev, ...updated };
      if (updated.playoutMode) {
        if (updated.playoutMode === 'live_studio') setVideoSource('webcam');
        else if (updated.playoutMode === 'switch_teleport') setVideoSource('switch_teleport');
        else if (updated.playoutMode === 'launch_feed') setVideoSource('launch_feed');
        else if (updated.playoutMode === 'orbit_telemetry') setVideoSource('orbit_telemetry');
        else if (updated.playoutMode === 'color_bars') setVideoSource('color_bars');
        else if (updated.playoutMode === 'eas_emergency') setVideoSource('color_bars');
      }
      return next;
    });
  };

  const handleUpdateTvuConfig = (updated: Partial<TvuCloudCdnConfig>) => {
    setTvuConfig(prev => ({ ...prev, ...updated }));
  };

  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestName.trim()) return;

    const newDest: StreamDestination = {
      id: `dest_${Date.now()}`,
      name: newDestName.trim(),
      platform: newDestPlatform,
      iconName: newDestPlatform === 'facebook' ? 'facebook' : 'satellite',
      streamUrl: newDestUrl.trim() || 'rtmp://live.drfun1.com/app',
      streamKey: newDestKey.trim() || `key-${Math.random().toString(36).substring(2, 9)}`,
      enabled: true,
      status: isBroadcasting ? 'live' : 'offline',
      viewers: Math.floor(50 + Math.random() * 200),
      health: 'optimal',
      bitrateKbps: 6000,
      serverLocation: 'Dedicated Teleport Ingestion',
    };

    setDestinations(prev => [...prev, newDest]);
    setShowAddModal(false);
    setNewDestName('');
    setNewDestKey('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Studio Banner & Teleport Interconnect Notice */}
      <div className="bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border-b border-sky-500/20 px-4 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBroadcasting ? 'bg-red-400' : 'bg-slate-500'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isBroadcasting ? 'bg-red-500' : 'bg-slate-400'}`} />
            </span>
            <span className="font-semibold text-white tracking-wide">
              DrFun1 MultiStream Studio <span className="text-sky-400 font-mono">(Restream.io Hub)</span>
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-slate-300">
              Uplink bonded via <strong className="text-emerald-300 font-normal">Switch SUPERNAP 100G</strong> &amp; <strong className="text-sky-300 font-normal">RisingNet Backbone</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLicense}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Witt Law Firm License</span>
            </button>
            <button
              onClick={onOpenSwitchMesh}
              className="text-slate-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Switch Mesh</span>
            </button>
            {onNavigateToIrc && (
              <button
                onClick={onNavigateToIrc}
                className="text-purple-300 hover:text-white transition-colors flex items-center gap-1 font-mono text-[11px] bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30"
              >
                <Terminal className="w-3 h-3 text-purple-400" />
                <span>WebIRC (5 Nodes)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Work Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Canvas & Controls (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Video Monitor */}
          <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between">
            {/* Live Video Surface / Background Simulation */}
            <div className="absolute inset-0">
              {videoSource === 'switch_teleport' && (
                <div className="w-full h-full relative">
                  <img 
                    src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1280&q=80" 
                    alt="Switch SUPERNAP Teleport Ground Dishes" 
                    className="w-full h-full object-cover brightness-75 contrast-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
                  <div className="absolute top-4 left-4 font-mono text-[11px] text-emerald-400 bg-slate-950/70 backdrop-blur px-2 py-1 rounded border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    CAM 01: SWITCH SUPERNAP LAS VEGAS TELEPORT (LIVE 4K)
                  </div>
                </div>
              )}

              {videoSource === 'launch_feed' && (
                <div className="w-full h-full relative">
                  <img 
                    src="https://images.unsplash.com/photo-1517976487502-5f715d1b016f?auto=format&fit=crop&w=1280&q=80" 
                    alt="Rocket Launch" 
                    className="w-full h-full object-cover brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
                  <div className="absolute top-4 left-4 font-mono text-[11px] text-amber-400 bg-slate-950/70 backdrop-blur px-2 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    CAM 02: DIRECT-TO-CELL LEO LAUNCH STAGE
                  </div>
                </div>
              )}

              {videoSource === 'orbit_telemetry' && (
                <div className="w-full h-full relative">
                  <img 
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1280&q=80" 
                    alt="Earth Orbit Telemetry" 
                    className="w-full h-full object-cover brightness-75"
                  />
                  <div className="absolute inset-0 bg-sky-950/20" />
                  <div className="absolute top-4 left-4 font-mono text-[11px] text-sky-400 bg-slate-950/70 backdrop-blur px-2 py-1 rounded border border-sky-500/30 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                    CAM 03: SYNTHETIC APERTURE RADAR (SAR) DOWNLINK
                  </div>
                </div>
              )}

              {videoSource === 's_band_radio' && (
                <div className="w-full h-full bg-gradient-to-br from-slate-950 via-purple-950/60 to-slate-900 flex flex-col items-center justify-center text-center p-6 relative">
                  <div className="w-20 h-20 rounded-full bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 mb-3 animate-pulse">
                    <Radio className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-bold text-white tracking-wide">DrFun1 S-Band Satellite Radio 24/7</p>
                  <p className="text-xs text-purple-300 mt-1 font-mono">2.2 GHz MSS Mobile Audio Carrier | 320 kbps Opus</p>
                  <div className="absolute top-4 left-4 font-mono text-[11px] text-purple-400 bg-slate-950/70 backdrop-blur px-2 py-1 rounded border border-purple-500/30 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
                    CAM 04: S-BAND AUDIO MASTER BROADCAST
                  </div>
                </div>
              )}

              {videoSource === 'optical_laser' && (
                <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
                  <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mb-3 relative z-10 animate-pulse">
                    <Activity className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-bold text-white tracking-wide relative z-10">1550nm Laser Inter-Satellite Mesh (OISL)</p>
                  <p className="text-xs text-cyan-300 mt-1 font-mono relative z-10">100 Gbps Coherent DWDM Space-to-Ground Link</p>
                  <div className="absolute top-4 left-4 font-mono text-[11px] text-cyan-400 bg-slate-950/70 backdrop-blur px-2 py-1 rounded border border-cyan-500/30 flex items-center gap-1.5 z-10">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    CAM 05: 100G OPTICAL LASER CROSS-CONNECT
                  </div>
                </div>
              )}

              {videoSource === 'color_bars' && (
                <div className="w-full h-full flex flex-col justify-center items-center bg-slate-950 font-mono text-center p-6">
                  <div className="grid grid-cols-7 h-3/5 w-full">
                    <div className="bg-slate-200" />
                    <div className="bg-yellow-400" />
                    <div className="bg-cyan-400" />
                    <div className="bg-green-500" />
                    <div className="bg-pink-500" />
                    <div className="bg-red-600" />
                    <div className="bg-blue-700" />
                  </div>
                  <div className="h-2/5 w-full bg-slate-900 border-t border-slate-700 flex flex-col items-center justify-center">
                    <p className="text-sm font-bold text-white tracking-wider">SMPTE SATCOM TEST CARRIER 14.25 GHz</p>
                    <p className="text-xs text-slate-400">SWITCH SUPERNAP EARTH STATION GATEWAY #04</p>
                  </div>
                </div>
              )}

              {videoSource === 'webcam' && (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-20 h-20 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 mb-3 shadow-inner">
                    <Video className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-semibold text-white">Richard Alan Witt Studio Host Cam</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Simulated high-bitrate studio camera connected via Blackmagic SDI to Switch 100G fiber.
                  </p>
                </div>
              )}
            </div>

            {/* Overlays Rendered On Canvas */}
            <div className="relative z-10 p-4 flex flex-col justify-between h-full pointer-events-none">
              {/* Top Bar on Video Canvas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isBroadcasting ? (
                    <div className="px-2.5 py-1 rounded bg-red-600/90 text-white font-mono text-xs font-bold tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-950">
                      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                      LIVE
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 rounded bg-slate-800/90 text-slate-300 font-mono text-xs font-medium">
                      PREVIEW ONLY
                    </div>
                  )}

                  <div className="px-2 py-1 rounded bg-slate-950/80 backdrop-blur border border-slate-700 text-slate-300 font-mono text-xs">
                    {formatUptime(broadcastUptime)}
                  </div>

                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-slate-950/80 backdrop-blur border border-slate-700 text-slate-300 text-xs">
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-mono font-semibold text-white">{totalViewers.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">multistream viewers</span>
                  </div>
                </div>

                {/* TV Station Callsign & Teleport Bug */}
                <div className="flex items-center gap-1.5">
                  <div className="px-2 py-0.5 rounded bg-red-600/90 text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-md">
                    <Tv className="w-3 h-3 text-white" />
                    <span>{tvConfig.callSign}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[10px]">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>TVU ISSP Bonded</span>
                  </div>
                  {selectedOverlayId === 'ov_teleport' && (
                    <div className="px-2.5 py-0.5 rounded bg-slate-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono flex items-center gap-1 shadow-md">
                      <Server className="w-3 h-3 text-emerald-400" />
                      <span>Switch 100G</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Canvas Overlay & Live ECOM Transmission Banner */}
              <div className="space-y-2 flex flex-col justify-end items-end w-full">
                {/* Live ECOM Transmission Overlay */}
                <div className="w-full flex justify-end">
                  <EcomTransmissionOverlay
                    featuredProduct={featuredProduct}
                    ecomState={ecomState}
                    onQuickBuy={handleQuickBuy}
                    onNavigateToStore={onNavigateToStore}
                    onToggleOverlay={() => setEcomState(prev => ({ ...prev, isOverlayVisible: !prev.isOverlayVisible }))}
                  />
                </div>

                {/* Lower Thirds & Bugs */}
                <div className="w-full space-y-1.5">
                  {selectedOverlayId === 'ov_license' && (
                    <div className="bg-slate-950/90 backdrop-blur border-l-4 border-sky-400 border-y border-r border-slate-800 p-2.5 rounded-r-lg max-w-xl shadow-xl">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-sky-400" />
                        Licensed to Richard Alan Witt
                      </p>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        The Law Office of Richard A. Witt LLC (<span className="text-sky-300">www.wittlawfirm.com</span>) &amp; Owens Company (<span className="text-sky-300">www.owenscompany.com</span>)
                      </p>
                    </div>
                  )}

                  {selectedOverlayId === 'ov_irc' && (
                    <div className="bg-slate-950/95 backdrop-blur border border-purple-500/40 px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-mono text-purple-300">
                      <span className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-purple-400" />
                        IRC Leaf: irc.drfun1.com:6697 #stream | UnrealIRCd Mesh
                      </span>
                      <span className="text-[10px] text-slate-400">Transit: RisingNet</span>
                    </div>
                  )}
                </div>
              </div>

              {/* On-Screen Live IRC Multistream Chat Room Overlay displayed directly on BroadCast */}
              {isIrcOverlayOnVideo && (
                <MultistreamIrcChatRoom
                  variant="overlay"
                  activeRank={activeRank}
                  defaultChannel="#drfun1-media"
                />
              )}
            </div>
          </div>

          {/* Broadcaster Quick Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            {/* Media Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
                className={`p-2.5 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium ${
                  isMicOn 
                    ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700' 
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}
              >
                {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-slate-500" />}
                <span className="hidden sm:inline">{isMicOn ? 'Mic On' : 'Muted'}</span>
              </button>

              {/* VU Meter visualizer */}
              <div className="hidden sm:flex items-center gap-0.5 bg-slate-950 px-2 py-2 rounded-lg border border-slate-800 h-9">
                {[15, 30, 45, 60, 75, 90].map((threshold, idx) => (
                  <div
                    key={idx}
                    className={`w-1 h-5 rounded-full transition-all duration-100 ${
                      audioLevel >= threshold
                        ? threshold > 75
                          ? 'bg-red-500'
                          : threshold > 50
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                title={isVideoOn ? 'Disable Video' : 'Enable Video'}
                className={`p-2.5 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium ${
                  isVideoOn 
                    ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700' 
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}
              >
                {isVideoOn ? <Video className="w-4 h-4 text-sky-400" /> : <VideoOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{isVideoOn ? 'Cam' : 'No Cam'}</span>
              </button>

              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-2.5 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium ${
                  isScreenSharing 
                    ? 'bg-sky-500 text-slate-950 font-bold' 
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Screen Share</span>
              </button>

              {/* Toggle IRC on BroadCast Video */}
              <button
                onClick={() => setIsIrcOverlayOnVideo(!isIrcOverlayOnVideo)}
                className={`p-2.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                  isIrcOverlayOnVideo
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
                title="Display live IRC chat room directly on BroadCast video surface"
              >
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">IRC on BroadCast: {isIrcOverlayOnVideo ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Master Broadcast Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBroadcasting(!isBroadcasting)}
                className={`px-4 py-2.5 rounded-lg font-bold text-xs tracking-wider flex items-center gap-2 shadow-lg transition-all ${
                  isBroadcasting
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
                }`}
              >
                {isBroadcasting ? (
                  <>
                    <Square className="w-4 h-4 fill-white" />
                    <span>END MULTISTREAM</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>GO LIVE TO ALL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Video Source Switcher & Overlay Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Video Source Selection */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-sky-400" />
                  Broadcaster Video Source
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1080p 60fps</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                <button
                  onClick={() => setVideoSource('switch_teleport')}
                  className={`p-2 rounded-lg text-left transition-colors border ${
                    videoSource === 'switch_teleport'
                      ? 'bg-sky-500/10 border-sky-400 text-sky-300 font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📡 Switch Teleport (Ka)
                </button>
                <button
                  onClick={() => setVideoSource('launch_feed')}
                  className={`p-2 rounded-lg text-left transition-colors border ${
                    videoSource === 'launch_feed'
                      ? 'bg-sky-500/10 border-sky-400 text-sky-300 font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🚀 LEO Launch (Ku)
                </button>
                <button
                  onClick={() => setVideoSource('orbit_telemetry')}
                  className={`p-2 rounded-lg text-left transition-colors border ${
                    videoSource === 'orbit_telemetry'
                      ? 'bg-sky-500/10 border-sky-400 text-sky-300 font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🛰️ SAR Downlink (X)
                </button>
                <button
                  onClick={() => setVideoSource('s_band_radio')}
                  className={`p-2 rounded-lg text-left transition-colors border ${
                    videoSource === 's_band_radio'
                      ? 'bg-purple-500/10 border-purple-400 text-purple-300 font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📻 S-Band Radio (2.2G)
                </button>
                <button
                  onClick={() => setVideoSource('optical_laser')}
                  className={`p-2 rounded-lg text-left transition-colors border ${
                    videoSource === 'optical_laser'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚡ 100G Laser (1550nm)
                </button>
                <button
                  onClick={() => setVideoSource('color_bars')}
                  className={`p-2 rounded-lg text-left transition-colors border ${
                    videoSource === 'color_bars'
                      ? 'bg-sky-500/10 border-sky-400 text-sky-300 font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📊 SMPTE Color Bars
                </button>
              </div>
            </div>

            {/* Overlays & Graphics Switcher */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Studio Lower-Thirds &amp; Bugs
                </span>
                <span className="text-[10px] text-slate-400">DrFun1 Presets</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {overlays.map(ov => (
                  <button
                    key={ov.id}
                    onClick={() => setSelectedOverlayId(selectedOverlayId === ov.id ? '' : ov.id)}
                    className={`w-full p-2 rounded-lg text-left transition-colors border flex items-center justify-between ${
                      selectedOverlayId === ov.id
                        ? 'bg-purple-500/10 border-purple-400 text-purple-200 font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{ov.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800">
                      {selectedOverlayId === ov.id ? 'ACTIVE' : 'OFF'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: MultiStream Tabs (Destinations, Unified Chat, Telemetry, RTMP Ingestion) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Studio Tab Header */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('destinations')}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'destinations'
                  ? 'bg-slate-800 text-sky-400 font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Channels ({destinations.filter(d => d.enabled).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ecom_transmission')}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'ecom_transmission'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>ECOM Live</span>
            </button>

            <button
              onClick={() => setActiveTab('tv_host')}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tv_host'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-semibold shadow'
                  : 'text-slate-400 hover:text-red-300'
              }`}
            >
              <Tv className="w-3.5 h-3.5 text-red-400" />
              <span>RTMP TV Host</span>
            </button>

            <button
              onClick={() => setActiveTab('tvu_cloud_cdn')}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tvu_cloud_cdn'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>TVU Cloud CDN</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'bg-slate-800 text-sky-400 font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Multi-Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('rtmp_setup')}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'rtmp_setup'
                  ? 'bg-slate-800 text-sky-400 font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>RTMP Keys</span>
            </button>
          </div>

          {/* Tab 1: MultiStream Destinations */}
          {activeTab === 'destinations' && (
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white tracking-wide">
                  Active Relay Channels
                </span>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Channel</span>
                </button>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
                {destinations.map(dest => (
                  <div
                    key={dest.id}
                    className={`p-3 rounded-lg border transition-all ${
                      dest.enabled
                        ? 'bg-slate-950 border-slate-700/80 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {/* Platform Icon Badge */}
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white ${
                          dest.platform === 'facebook'
                            ? 'bg-blue-600'
                            : dest.platform === 'youtube'
                            ? 'bg-red-600'
                            : dest.platform === 'twitch'
                            ? 'bg-purple-600'
                            : dest.platform === 'x'
                            ? 'bg-slate-800'
                            : dest.platform === 'switch'
                            ? 'bg-emerald-600'
                            : dest.platform === 'risingnet'
                            ? 'bg-cyan-600'
                            : dest.platform === 'unreal_irc'
                            ? 'bg-fuchsia-700'
                            : dest.platform === 'tvu_cloud'
                            ? 'bg-cyan-600'
                            : dest.platform === 'rtmp_tv'
                            ? 'bg-red-700'
                            : 'bg-indigo-600'
                        }`}>
                          {dest.platform === 'facebook' && 'FB'}
                          {dest.platform === 'youtube' && 'YT'}
                          {dest.platform === 'twitch' && 'TW'}
                          {dest.platform === 'x' && 'X'}
                          {dest.platform === 'switch' && 'SW'}
                          {dest.platform === 'risingnet' && 'RN'}
                          {dest.platform === 'unreal_irc' && 'IRC'}
                          {dest.platform === 'tvu_cloud' && 'TVU'}
                          {dest.platform === 'rtmp_tv' && 'TV'}
                          {dest.platform === 'custom_rtmp' && 'RTMP'}
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-white leading-tight">
                            {dest.name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-slate-500 truncate max-w-[170px]">{dest.serverLocation}</span>
                          </div>
                        </div>
                      </div>

                      {/* Enable/Disable Toggle */}
                      <div className="flex items-center gap-3">
                        {dest.enabled && isBroadcasting && (
                          <div className="text-right">
                            <div className="text-[11px] font-mono font-bold text-emerald-400">
                              {dest.viewers.toLocaleString()} v
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono">
                              {dest.bitrateKbps} kbps
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => toggleDestination(dest.id)}
                          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 focus:outline-none ${
                            dest.enabled ? 'bg-sky-500' : 'bg-slate-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              dest.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Quick Resell & Witt Law Firm Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Carrier: <strong className="text-emerald-400">Switch 100G Fiber</strong></span>
                <span className="font-mono text-slate-500">UnrealIRCd irc.drfun1.com</span>
              </div>
            </div>
          )}

          {/* Tab 2: DrFun1 Media ECOM Live Transmission */}
          {activeTab === 'ecom_transmission' && (
            <EcomTransmissionTab
              ecomState={ecomState}
              onUpdateEcomState={(updated) => setEcomState(prev => ({ ...prev, ...updated }))}
              onQuickBuy={handleQuickBuy}
              onPushToChat={handlePushPromoToChat}
              onNavigateToStore={onNavigateToStore}
              onOpenLicense={onOpenLicense}
            />
          )}

          {/* Tab 3: RTMP TV Host Master Playout */}
          {activeTab === 'tv_host' && (
            <RtmpTvHostPanel
              tvConfig={tvConfig}
              onUpdateConfig={handleUpdateTvConfig}
              isBroadcasting={isBroadcasting}
              onToggleBroadcast={() => setIsBroadcasting(!isBroadcasting)}
              onOpenLicense={onOpenLicense}
              onOpenSwitchMesh={onOpenSwitchMesh}
            />
          )}

          {/* Tab 4: TVU Networks Cloud CDN Clone & ISSP Bonding */}
          {activeTab === 'tvu_cloud_cdn' && (
            <TvuNetworksCdnClonePanel
              tvuConfig={tvuConfig}
              onUpdateTvuConfig={handleUpdateTvuConfig}
              onOpenLicense={onOpenLicense}
              onOpenSwitchMesh={onOpenSwitchMesh}
            />
          )}

          {/* Tab 5: Multistream Combined IRC Chat Room */}
          {activeTab === 'chat' && (
            <div className="p-3 flex flex-col flex-1">
              <MultistreamIrcChatRoom
                variant="full"
                activeRank={activeRank}
                onOpenAdminPanel={onOpenAdminPanel}
                onOpenIrcClient={onNavigateToIrc}
                defaultChannel="#drfun1-media"
                isOverlayVisible={isIrcOverlayOnVideo}
                onToggleOverlay={setIsIrcOverlayOnVideo}
              />
            </div>
          )}

          {/* Tab 3: RTMP & Ingestion Credentials */}
          {activeTab === 'rtmp_setup' && (
            <div className="p-4 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-white text-sm mb-1">Broadcaster RTMP Credentials</h4>
                <p className="text-slate-400 text-xs">
                  Copy these ingestion credentials into OBS Studio, vMix, Wirecast, or your Blackmagic hardware encoder to broadcast directly to DrFun1 MultiStream.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="font-mono text-[11px]">RTMP Server (Switch SUPERNAP Ingest)</span>
                    <button
                      onClick={() => handleCopy('rtmp://live.drfun1.com/app', 'rtmp_server')}
                      className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono text-[10px]"
                    >
                      {copiedKeyId === 'rtmp_server' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKeyId === 'rtmp_server' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-200 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                    rtmp://live.drfun1.com/app
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="font-mono text-[11px]">Primary Stream Key (Richard Alan Witt)</span>
                    <button
                      onClick={() => handleCopy('live_drfun1_witt_satcom_key_9981', 'stream_key')}
                      className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono text-[10px]"
                    >
                      {copiedKeyId === 'stream_key' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKeyId === 'stream_key' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-200 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 flex items-center justify-between">
                    <span>•••••••••••••••••••••••••••••</span>
                    <span className="text-[10px] text-slate-500">256-bit AES</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="font-mono text-[11px]">SRT Caller / Low-Latency Earth Link</span>
                    <button
                      onClick={() => handleCopy('srt://teleport.drfun1.com:9000?streamid=witt_law', 'srt_url')}
                      className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono text-[10px]"
                    >
                      {copiedKeyId === 'srt_url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKeyId === 'srt_url' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-200 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                    srt://teleport.drfun1.com:9000?streamid=witt_law
                  </div>
                </div>
              </div>

              {/* Hardware & Store Integration */}
              <div className="bg-sky-950/30 border border-sky-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sky-300 text-xs">Need Hardware Encoders or Teleport Cross-Connects?</span>
                  {onNavigateToStore && (
                    <button
                      onClick={onNavigateToStore}
                      className="text-amber-300 hover:text-amber-200 text-xs font-medium flex items-center gap-1"
                    >
                      <span>Store</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Procure certified DrFun1 SDI rackmount encoders with native Switch SUPERNAP fiber cross-connect and UnrealIRCd leaf telemetry in the DrFun1 Store.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Destination Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-400" />
                Add Stream Destination
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDestination} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Destination Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starlink Teleport Ingest, LinkedIn Live, Inmarsat..."
                  value={newDestName}
                  onChange={e => setNewDestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Platform</label>
                <select
                  value={newDestPlatform}
                  onChange={e => setNewDestPlatform(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="custom_rtmp">Custom RTMP / SRT Server</option>
                  <option value="tvu_cloud">TVU Networks Cloud CDN (www.tvunetworks.com)</option>
                  <option value="rtmp_tv">DrFun1 RTMP TV Broadcast Host</option>
                  <option value="facebook">Facebook Live (SpaceBook)</option>
                  <option value="youtube">YouTube Live</option>
                  <option value="twitch">Twitch</option>
                  <option value="x">X / Twitter Live</option>
                  <option value="switch">Switch SUPERNAP CDN</option>
                  <option value="risingnet">RisingNet Backbone</option>
                  <option value="unreal_irc">UnrealIRCd Chat Leaf</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">RTMP / Stream Server URL</label>
                <input
                  type="text"
                  value={newDestUrl}
                  onChange={e => setNewDestUrl(e.target.value)}
                  placeholder="rtmp://stream-server.com/app"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Stream Key</label>
                <input
                  type="password"
                  value={newDestKey}
                  onChange={e => setNewDestKey(e.target.value)}
                  placeholder="Paste destination stream key"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
                >
                  Add Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
