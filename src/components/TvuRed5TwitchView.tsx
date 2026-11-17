/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * All-in-One TVU Networks + Red5.net WebRTC + Twitch.tv + Kick.com Live Broadcast Studio
 * Pipeline: TVU Cellular Bonding & Cloud Producer -> Red5 Pro WHIP/WHEP Cluster -> Twitch & Kick Interactive Streams
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  Gift,
  Heart,
  KeyRound,
  Layers,
  Maximize2,
  MessageSquare,
  Pause,
  Play,
  Plus,
  Radio,
  Scissors,
  Search,
  Send,
  Server,
  ShieldCheck,
  Signal,
  Terminal,
  Tv,
  Users,
  Video,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { getRankDefinition, hasMinIrcdRank } from '../utils/ircdAccess';
import { IrcdAccessGateBanner } from './IrcdAccessGateBanner';
import { Red5TwitchKickDevStudio, DevPortalSectionMode } from './Red5TwitchKickDevStudio';
import {
  KickCategory,
  KickChatMessage,
  KickLiveChannel,
  Red5EdgeNode,
  TvuPackUnit,
  TvuProducerScene,
  TwitchCategory,
  TwitchChatMessage,
  TwitchLiveChannel,
  UnifiedPlatformFilter,
} from '../types/tvuRed5Twitch';
import {
  CHANNEL_POINT_REWARDS,
  INITIAL_KICK_CHANNELS,
  INITIAL_KICK_CHAT,
  INITIAL_RED5_NODES,
  INITIAL_TVU_PACKS,
  INITIAL_TVU_SCENES,
  INITIAL_TWITCH_CHANNELS,
  INITIAL_TWITCH_CHAT,
  KICK_GIFT_ACTIONS,
} from '../data/tvuRed5TwitchData';

interface TvuRed5TwitchViewProps {
  onOpenLicense?: () => void;
  onNavigateToIrc?: () => void;
  activeRank?: AnopeRankLevel;
  onElevateRank?: (rank: AnopeRankLevel) => void;
  onOpenRankMatrix?: () => void;
  ircNick?: string;
}

type StudioSubView = 'unified' | 'tvu' | 'red5' | 'twitch' | 'kick';

export const TvuRed5TwitchView: React.FC<TvuRed5TwitchViewProps> = ({
  onOpenLicense,
  onNavigateToIrc,
  activeRank = 'op',
  onElevateRank,
  onOpenRankMatrix,
  ircNick = 'RichardAlanWitt',
}) => {
  const activeRankDef = getRankDefinition(activeRank);
  const canCutBroadcast = hasMinIrcdRank(activeRank, 'dj_host');
  const canScaleRed5Cluster = hasMinIrcdRank(activeRank, 'techadmin');

  // Navigation sub-view across the all-in-one workspace
  const [subView, setSubView] = useState<StudioSubView>('unified');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  // TVU Networks State
  const [tvuPacks, setTvuPacks] = useState<TvuPackUnit[]>(INITIAL_TVU_PACKS);
  const [selectedPackId, setSelectedPackId] = useState<string>(INITIAL_TVU_PACKS[0].id);
  const [tvuScenes, setTvuScenes] = useState<TvuProducerScene[]>(INITIAL_TVU_SCENES);
  const [activeSceneId, setActiveSceneId] = useState<string>(INITIAL_TVU_SCENES[0].id);
  const [previewSceneId, setPreviewSceneId] = useState<string>(INITIAL_TVU_SCENES[1].id);
  const [isIsoRecording, setIsIsoRecording] = useState<boolean>(true);
  const [newTvuUnitName, setNewTvuUnitName] = useState<string>('');
  const [newTvuLocation, setNewTvuLocation] = useState<string>('');

  // Red5.net WebRTC Cluster State
  const [red5Nodes, setRed5Nodes] = useState<Red5EdgeNode[]>(INITIAL_RED5_NODES);
  const [selectedRed5NodeId, setSelectedRed5NodeId] = useState<string>(INITIAL_RED5_NODES[0].id);
  const [showWebRtcOverlay, setShowWebRtcOverlay] = useState<boolean>(true);
  const [red5DevSection, setRed5DevSection] = useState<DevPortalSectionMode>('red5_broadcast');

  // Twitch.tv Interactive Channels & Chat State
  const [channels, setChannels] = useState<TwitchLiveChannel[]>(INITIAL_TWITCH_CHANNELS);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(INITIAL_TWITCH_CHANNELS[0].id);
  const [twitchCategory, setTwitchCategory] = useState<TwitchCategory>('All');
  const [channelSearch, setChannelSearch] = useState<string>('');
  const [followedChannelIds, setFollowedChannelIds] = useState<Set<string>>(
    () => new Set(['tw-drfun1live', 'tw-supernap-noc', 'kick-drfun1tv', 'kick-supernap'])
  );
  const [subscribedChannelIds, setSubscribedChannelIds] = useState<Set<string>>(
    () => new Set(['tw-drfun1live', 'kick-drfun1tv'])
  );
  const [channelPoints, setChannelPoints] = useState<number>(2450);
  const [userBitsBalance, setUserBitsBalance] = useState<number>(5000);
  const [chatMessages, setChatMessages] = useState<TwitchChatMessage[]>(INITIAL_TWITCH_CHAT);
  const [chatInput, setChatInput] = useState<string>('');
  const [slowModeSec, setSlowModeSec] = useState<number>(0);
  const [followersOnlyChat, setFollowersOnlyChat] = useState<boolean>(false);
  const [highlightedChatId, setHighlightedChatId] = useState<string | null>(null);

  // Kick.com Interactive Channels, Pusher WS Chat & Kicks Balance State
  const [activePlatform, setActivePlatform] = useState<'twitch' | 'kick'>('twitch');
  const [unifiedFilter, setUnifiedFilter] = useState<UnifiedPlatformFilter>('all');
  const [isDualSimulcast, setIsDualSimulcast] = useState<boolean>(true);
  const [kickChannels, setKickChannels] = useState<KickLiveChannel[]>(INITIAL_KICK_CHANNELS);
  const [selectedKickChannelId, setSelectedKickChannelId] = useState<string>(INITIAL_KICK_CHANNELS[0].id);
  const [kickCategory, setKickCategory] = useState<KickCategory>('All');
  const [kickSearch, setKickSearch] = useState<string>('');
  const [kickChatMessages, setKickChatMessages] = useState<KickChatMessage[]>(INITIAL_KICK_CHAT);
  const [kickChatInput, setKickChatInput] = useState<string>('');
  const [userKicksBalance, setUserKicksBalance] = useState<number>(8500);
  const [kickSubsOnlyChat, setKickSubsOnlyChat] = useState<boolean>(false);
  const [kickEmoteOnlyChat, setKickEmoteOnlyChat] = useState<boolean>(false);
  const [draftKickTitle, setDraftKickTitle] = useState<string>('');
  const [newKickSlug, setNewKickSlug] = useState<string>('');
  const [newKickTitle, setNewKickTitle] = useState<string>('');
  const [newKickCategory, setNewKickCategory] = useState<Exclude<KickCategory, 'All'>>('Field Broadcast');

  // Player Transport State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(85);
  const [playerQuality, setPlayerQuality] = useState<'1080p60 WebRTC' | '720p60 ABR' | '480p30 Fallback'>('1080p60 WebRTC');
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [liveTimeSec, setLiveTimeSec] = useState<number>(11640);

  // Editable Stream Title in Creator Deck
  const [draftStreamTitle, setDraftStreamTitle] = useState<string>('');
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === selectedChannelId) || channels[0],
    [channels, selectedChannelId]
  );
  const activeKickChannel = useMemo(
    () => kickChannels.find((c) => c.id === selectedKickChannelId) || kickChannels[0],
    [kickChannels, selectedKickChannelId]
  );
  const activeTvuPack = useMemo(
    () => tvuPacks.find((p) => p.id === selectedPackId) || tvuPacks[0],
    [tvuPacks, selectedPackId]
  );
  const activeScene = useMemo(
    () => tvuScenes.find((s) => s.id === activeSceneId) || tvuScenes[0],
    [tvuScenes, activeSceneId]
  );
  const previewScene = useMemo(
    () => tvuScenes.find((s) => s.id === previewSceneId) || tvuScenes[1] || tvuScenes[0],
    [tvuScenes, previewSceneId]
  );
  const activeRed5Node = useMemo(
    () => red5Nodes.find((n) => n.id === selectedRed5NodeId) || red5Nodes[0],
    [red5Nodes, selectedRed5NodeId]
  );
  const primaryProgramPack = useMemo(
    () => tvuPacks.find((p) => p.id === activeScene.primaryPackId) || activeTvuPack,
    [tvuPacks, activeScene.primaryPackId, activeTvuPack]
  );

  // Sync draft titles when channels change
  useEffect(() => {
    setDraftStreamTitle(activeChannel.streamTitle);
  }, [activeChannel.id, activeChannel.streamTitle]);

  useEffect(() => {
    setDraftKickTitle(activeKickChannel.streamTitle);
  }, [activeKickChannel.id, activeKickChannel.streamTitle]);

  // Live uptime & subtle viewer count tick when streaming
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setLiveTimeSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const notify = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 3200);
  };

  const handleCopyText = (val: string, key: string, label: string) => {
    navigator.clipboard.writeText(val);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    setCopiedKey(key);
    copyTimerRef.current = setTimeout(() => setCopiedKey(null), 2000);
    notify(`Copied ${label} to clipboard`);
  };

  const getPackTotalMbps = (pack: TvuPackUnit) =>
    pack.modems
      .filter((m) => m.enabled)
      .reduce((acc, m) => acc + m.bitrateMbps, 0);

  const totalRed5Subscribers = useMemo(
    () => red5Nodes.reduce((acc, n) => acc + n.activeSubscribers, 0),
    [red5Nodes]
  );
  const totalRed5Gbps = useMemo(
    () => red5Nodes.reduce((acc, n) => acc + n.bandwidthGbps, 0),
    [red5Nodes]
  );
  const totalTwitchViewers = useMemo(
    () => channels.reduce((acc, c) => acc + (c.isLive ? c.viewerCount : 0), 0),
    [channels]
  );
  const totalKickViewers = useMemo(
    () => kickChannels.reduce((acc, c) => acc + (c.isLive ? c.viewerCount : 0), 0),
    [kickChannels]
  );

  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      if (twitchCategory !== 'All' && ch.category !== twitchCategory) return false;
      if (channelSearch.trim()) {
        const q = channelSearch.toLowerCase();
        return (
          ch.displayName.toLowerCase().includes(q) ||
          ch.streamTitle.toLowerCase().includes(q) ||
          ch.category.toLowerCase().includes(q) ||
          ch.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [channels, twitchCategory, channelSearch]);

  const filteredKickChannels = useMemo(() => {
    return kickChannels.filter((ch) => {
      if (kickCategory !== 'All' && ch.category !== kickCategory) return false;
      if (kickSearch.trim()) {
        const q = kickSearch.toLowerCase();
        return (
          ch.displayName.toLowerCase().includes(q) ||
          ch.slug.toLowerCase().includes(q) ||
          ch.streamTitle.toLowerCase().includes(q) ||
          ch.category.toLowerCase().includes(q) ||
          ch.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [kickChannels, kickCategory, kickSearch]);

  const visibleChatMessages = useMemo(
    () => chatMessages.filter((m) => m.channelId === activeChannel.id),
    [chatMessages, activeChannel.id]
  );
  const visibleKickChatMessages = useMemo(
    () => kickChatMessages.filter((m) => m.channelId === activeKickChannel.id),
    [kickChatMessages, activeKickChannel.id]
  );

  // Handlers: Select Channel (links TVU Pack & Red5 Node automatically)
  const handleSelectChannel = (ch: TwitchLiveChannel) => {
    setActivePlatform('twitch');
    setSelectedChannelId(ch.id);
    setSelectedPackId(ch.tvuPackId);
    setSelectedRed5NodeId(ch.red5NodeId);
    const matchingScene = tvuScenes.find((s) => s.primaryPackId === ch.tvuPackId);
    if (matchingScene) setActiveSceneId(matchingScene.id);
  };

  const handleSelectKickChannel = (ch: KickLiveChannel) => {
    setActivePlatform('kick');
    setSelectedKickChannelId(ch.id);
    setSelectedPackId(ch.tvuPackId);
    setSelectedRed5NodeId(ch.red5NodeId);
    const matchingScene = tvuScenes.find((s) => s.primaryPackId === ch.tvuPackId);
    if (matchingScene) setActiveSceneId(matchingScene.id);
  };

  // Handler: Cut Preview to Program in TVU Producer
  const handleCutPreviewToProgram = () => {
    if (!canCutBroadcast) {
      notify('DJ Host (+d) rank or higher required to cut live TVU program feed.');
      return;
    }
    const oldActive = activeSceneId;
    setActiveSceneId(previewSceneId);
    setPreviewSceneId(oldActive);
    const targetScene = tvuScenes.find((s) => s.id === previewSceneId);
    if (targetScene) {
      setSelectedPackId(targetScene.primaryPackId);
    }
    notify(`Cut "${previewScene.name}" live to Program & Red5 WHIP origin.`);
  };

  // Handler: Toggle individual TVU cellular/Starlink/fiber modem
  const handleToggleTvuModem = (packId: string, modemId: string) => {
    setTvuPacks((prev) =>
      prev.map((pack) => {
        if (pack.id !== packId) return pack;
        const nextModems = pack.modems.map((m) =>
          m.id === modemId ? { ...m, enabled: !m.enabled } : m
        );
        const enabledCount = nextModems.filter((m) => m.enabled).length;
        const recalculatedLatency = enabledCount === 0 ? 999 : Math.max(160, 460 - enabledCount * 45);
        return { ...pack, modems: nextModems, latencyMs: recalculatedLatency };
      })
    );
  };

  // Handler: Route TVU Pack to Active Program Scene & Twitch Channel
  const handleRoutePackToProgram = (pack: TvuPackUnit) => {
    setSelectedPackId(pack.id);
    setSelectedRed5NodeId(pack.assignedRed5NodeId);
    setTvuScenes((prev) =>
      prev.map((sc) => (sc.id === activeSceneId ? { ...sc, primaryPackId: pack.id } : sc))
    );
    setTvuPacks((prev) =>
      prev.map((p) => (p.id === pack.id ? { ...p, status: 'on_air' } : p))
    );
    notify(`Routed ${pack.unitName} (${pack.location}) live to Program & Red5 Origin.`);
  };

  // Handler: Add a new TVU Anywhere / Pack transmitter
  const handleAddTvuPack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTvuUnitName.trim()) return;
    const cleanName = newTvuUnitName.trim().toUpperCase().replace(/\s+/g, '-');
    const created: TvuPackUnit = {
      id: `tvu-pack-${Date.now()}`,
      unitName: cleanName,
      model: 'TVU Anywhere Mobile',
      location: newTvuLocation.trim() || 'Remote Field Uplink',
      operatorNick: ircNick,
      status: 'on_air',
      latencyMs: 295,
      resolution: '1080p60',
      videoCodec: 'HEVC H.265',
      audioChannels: '2-Ch Broadcast Stereo',
      packetLossPct: 0.01,
      previewImage: '/src/assets/images/tvu_field_news_rig_1794718266197.jpg',
      assignedRed5NodeId: activeRed5Node.id,
      modems: [
        { id: `m-${Date.now()}-1`, carrier: 'Verizon 5G UW', networkType: '5G SA', bitrateMbps: 7.5, signalPct: 92, enabled: true },
        { id: `m-${Date.now()}-2`, carrier: 'Starlink Mini', networkType: 'Starlink LEO', bitrateMbps: 5.4, signalPct: 89, enabled: true },
      ],
    };
    setTvuPacks((prev) => [created, ...prev]);
    setSelectedPackId(created.id);
    setNewTvuUnitName('');
    setNewTvuLocation('');
    notify(`Paired new transmitter ${created.unitName} to ${activeRed5Node.nodeName}`);
  };

  // Handler: Update Active Scene Lower-Third Overlay
  const handleUpdateLowerThird = (title: string, subtitle: string) => {
    setTvuScenes((prev) =>
      prev.map((sc) =>
        sc.id === activeSceneId
          ? { ...sc, lowerThirdTitle: title, lowerThirdSubtitle: subtitle }
          : sc
      )
    );
  };

  // Handler: Toggle Lower-Third visibility
  const handleToggleLowerThirdVisibility = () => {
    setTvuScenes((prev) =>
      prev.map((sc) =>
        sc.id === activeSceneId ? { ...sc, showLowerThird: !sc.showLowerThird } : sc
      )
    );
  };

  // Handler: Red5 Autoscale Add Edge Node
  const handleAutoscaleRed5Edge = () => {
    if (!canScaleRed5Cluster) {
      notify('TechAdmin (+A) rank or higher required to provision Red5 Pro edge nodes.');
      return;
    }
    const idx = red5Nodes.length + 1;
    const newNode: Red5EdgeNode = {
      id: `red5-edge-auto-${Date.now()}`,
      nodeName: `red5-edge-dal0${idx}.drfun1.net`,
      region: 'US Central (Dallas)',
      datacenter: 'Switch / Tier-1 Autoscaled Edge POP',
      role: 'Edge',
      protocol: 'WebRTC WHIP/WHEP',
      status: 'healthy',
      webrtcRttMs: 192,
      activePublishers: 1,
      activeSubscribers: 1850,
      maxCapacity: 20000,
      cpuLoadPct: 18,
      bandwidthGbps: 6.4,
      whipIngestUrl: `https://dal0${idx}.red5.drfun1.net:5443/live/whip/auto`,
      whepPlaybackUrl: `https://dal0${idx}.red5.drfun1.net:5443/live/whep/auto`,
      srtEndpoint: `srt://dal0${idx}.red5.drfun1.net:9000?streamid=#!::r=live/auto,m=request`,
      abrEnabled: true,
    };
    setRed5Nodes((prev) => [...prev, newNode]);
    setSelectedRed5NodeId(newNode.id);
    notify(`Provisioned Red5 Pro Edge node ${newNode.nodeName} (20,000 WebRTC seats).`);
  };

  // Handler: Toggle Red5 ABR
  const handleToggleRed5Abr = (nodeId: string) => {
    setRed5Nodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, abrEnabled: !n.abrEnabled } : n))
    );
  };

  // Handler: Send Twitch Chat Message (synced to channel)
  const handleSendChat = (e: React.FormEvent, customBits?: number) => {
    e.preventDefault();
    const content = chatInput.trim();
    if (!content && !customBits) return;
    if (customBits && userBitsBalance < customBits) {
      notify('Insufficient Bits balance for this Cheer.');
      return;
    }
    if (customBits) setUserBitsBalance((b) => b - customBits);

    const newMessage: TwitchChatMessage = {
      id: `chat-${Date.now()}`,
      channelId: activeChannel.id,
      author: ircNick,
      badge: hasMinIrcdRank(activeRank, 'sra')
        ? 'IRCD ~Owner'
        : hasMinIrcdRank(activeRank, 'op')
        ? 'WittLaw Mod'
        : 'Viewer',
      badgeColor: hasMinIrcdRank(activeRank, 'sra')
        ? 'text-amber-300'
        : hasMinIrcdRank(activeRank, 'op')
        ? 'text-emerald-300'
        : 'text-sky-300',
      text: customBits
        ? `Cheer${customBits} ${content || 'Supporting the live TVU + Red5 broadcast!'}`
        : content,
      bitsAmount: customBits,
      timestamp: new Date().toTimeString().slice(0, 5),
    };
    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput('');
    setChannelPoints((pts) => pts + 15);
  };

  // Handler: Redeem Channel Points
  const handleRedeemPoints = (rewardId: string) => {
    const reward = CHANNEL_POINT_REWARDS.find((r) => r.id === rewardId);
    if (!reward) return;
    if (channelPoints < reward.cost) {
      notify(`Need ${reward.cost} Channel Points (you have ${channelPoints}).`);
      return;
    }
    setChannelPoints((p) => p - reward.cost);

    if (reward.actionType === 'cut_camera') {
      const nextScene = tvuScenes[(tvuScenes.findIndex((s) => s.id === activeSceneId) + 1) % tvuScenes.length];
      setActiveSceneId(nextScene.id);
      setSelectedPackId(nextScene.primaryPackId);
      notify(`Redeemed: Switched TVU Producer camera to ${nextScene.name}`);
    } else if (reward.actionType === 'lower_third') {
      handleUpdateLowerThird(
        `VIEWER SHOUTOUT · ${ircNick.toUpperCase()}`,
        `Live via Twitch Channel Points + ${activeChannel.ircChannel} IRC Bridge`
      );
      notify(`Redeemed: Updated TVU Producer lower-third for ${ircNick}`);
    } else if (reward.actionType === 'webrtc_stats') {
      setShowWebRtcOverlay((v) => !v);
      notify('Redeemed: Toggled Red5 Pro WebRTC telemetry HUD');
    } else {
      const latest = visibleChatMessages[visibleChatMessages.length - 1];
      if (latest) setHighlightedChatId(latest.id);
      notify('Redeemed: Highlighted latest message in chat & #tvu-broadcast');
    }
  };

  // Handler: Follow / Subscribe (Platform-aware for Twitch + Kick 95/5 Split)
  const currentStreamEntity = activePlatform === 'kick' ? activeKickChannel : activeChannel;

  const handleToggleFollow = (chId: string, labelName: string) => {
    const isFollowing = followedChannelIds.has(chId);
    setFollowedChannelIds((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.delete(chId);
      else next.add(chId);
      return next;
    });
    if (chId.startsWith('kick-')) {
      setKickChannels((prev) =>
        prev.map((c) =>
          c.id === chId
            ? { ...c, followerCount: c.followerCount + (isFollowing ? -1 : 1) }
            : c
        )
      );
    } else {
      setChannels((prev) =>
        prev.map((c) =>
          c.id === chId
            ? { ...c, followerCount: c.followerCount + (isFollowing ? -1 : 1) }
            : c
        )
      );
    }
    notify(isFollowing ? `Unfollowed ${labelName}` : `Following ${labelName}`);
  };

  const handleSubscribe = (chId: string, labelName: string) => {
    if (subscribedChannelIds.has(chId)) {
      notify(`Already subscribed to ${labelName} (Tier 1).`);
      return;
    }
    setSubscribedChannelIds((prev) => new Set(prev).add(chId));
    if (chId.startsWith('kick-')) {
      setUserKicksBalance((k) => k + 500);
      notify(`Subscribed to kick.com/${labelName} (95/5 Split · $4.74 to creator, +500 Kicks)!`);
    } else {
      setChannelPoints((p) => p + 500);
      notify(`Subscribed to ${labelName} (+500 bonus Channel Points)!`);
    }
  };

  // Handler: Send Kick.com Pusher WS Chat or Kicks Gift
  const handleSendKickChat = (e: React.FormEvent, kicksAmount?: number) => {
    e.preventDefault();
    const content = kickChatInput.trim();
    if (!content && !kicksAmount) return;
    if (kicksAmount && userKicksBalance < kicksAmount) {
      notify('Insufficient Kicks balance.');
      return;
    }
    if (kicksAmount) {
      setUserKicksBalance((k) => k - kicksAmount);
      setKickChannels((prev) =>
        prev.map((c) =>
          c.id === activeKickChannel.id ? { ...c, kicksTotal: c.kicksTotal + kicksAmount } : c
        )
      );
    }

    const newMsg: KickChatMessage = {
      id: `kchat-${Date.now()}`,
      channelId: activeKickChannel.id,
      author: ircNick,
      badge: hasMinIrcdRank(activeRank, 'sra')
        ? 'Broadcaster'
        : hasMinIrcdRank(activeRank, 'op')
        ? 'Verified Mod'
        : 'Founder',
      badgeColor: hasMinIrcdRank(activeRank, 'sra')
        ? 'text-emerald-300'
        : hasMinIrcdRank(activeRank, 'op')
        ? 'text-sky-300'
        : 'text-amber-300',
      text: kicksAmount
        ? `Gifted ${kicksAmount} Kicks! ${content || 'Supporting the live Kick.com + Red5 WebRTC stream!'}`
        : content,
      kicksGifted: kicksAmount,
      timestamp: new Date().toTimeString().slice(0, 5),
    };
    setKickChatMessages((prev) => [...prev, newMsg]);
    setKickChatInput('');
  };

  // Handler: Execute Kick Gift Action (Kicks / Gift Sub / Camera Cut)
  const handleKickGiftAction = (actionId: string) => {
    const action = KICK_GIFT_ACTIONS.find((a) => a.id === actionId);
    if (!action) return;
    if (userKicksBalance < action.kicksCost) {
      notify(`Need ${action.kicksCost} Kicks (balance: ${userKicksBalance}).`);
      return;
    }
    setUserKicksBalance((k) => k - action.kicksCost);
    setKickChannels((prev) =>
      prev.map((c) =>
        c.id === activeKickChannel.id ? { ...c, kicksTotal: c.kicksTotal + action.kicksCost } : c
      )
    );

    if (action.actionType === 'cut_camera') {
      const nextScene = tvuScenes[(tvuScenes.findIndex((s) => s.id === activeSceneId) + 1) % tvuScenes.length];
      setActiveSceneId(nextScene.id);
      setSelectedPackId(nextScene.primaryPackId);
      notify(`Kick Webhook v2: Cut live camera to ${nextScene.name}!`);
    } else if (action.actionType === 'gift_sub') {
      const giftMsg: KickChatMessage = {
        id: `kchat-sub-${Date.now()}`,
        channelId: activeKickChannel.id,
        author: ircNick,
        badge: 'Founder',
        badgeColor: 'text-emerald-300',
        text: `Gifted 1 Kick Subscription to community ($4.74 / 95% creator payout)!`,
        kicksGifted: action.kicksCost,
        timestamp: new Date().toTimeString().slice(0, 5),
      };
      setKickChatMessages((prev) => [...prev, giftMsg]);
      notify(`Gifted 1 Kick Sub on kick.com/${activeKickChannel.slug} (95/5 Split)!`);
    } else {
      const giftMsg: KickChatMessage = {
        id: `kchat-kicks-${Date.now()}`,
        channelId: activeKickChannel.id,
        author: ircNick,
        badge: 'Kick VIP',
        badgeColor: 'text-amber-300',
        text: `Dropped ${action.kicksCost} Kicks into chatrooms.${activeKickChannel.chatroomId}.v2!`,
        kicksGifted: action.kicksCost,
        timestamp: new Date().toTimeString().slice(0, 5),
      };
      setKickChatMessages((prev) => [...prev, giftMsg]);
      notify(`Sent ${action.kicksCost} Kicks to kick.com/${activeKickChannel.slug}!`);
    }
  };

  // Handler: Save Stream Title in Creator Deck
  const handleSaveChannelTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftStreamTitle.trim()) return;
    setChannels((prev) =>
      prev.map((c) =>
        c.id === activeChannel.id ? { ...c, streamTitle: draftStreamTitle.trim() } : c
      )
    );
    notify(`Updated Twitch stream title & synced to Red5 metadata.`);
  };

  const handleSaveKickTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftKickTitle.trim()) return;
    setKickChannels((prev) =>
      prev.map((c) =>
        c.id === activeKickChannel.id ? { ...c, streamTitle: draftKickTitle.trim() } : c
      )
    );
    notify(`Synced stream title to kick.com/${activeKickChannel.slug} via Kick API v2!`);
  };

  const handleAddCustomKickChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = newKickSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanSlug) return;
    const created: KickLiveChannel = {
      id: `kick-${cleanSlug}-${Date.now()}`,
      slug: cleanSlug,
      displayName: cleanSlug,
      category: newKickCategory,
      streamTitle:
        newKickTitle.trim() ||
        `LIVE ${cleanSlug} on Kick.com — Red5 Pro WebRTC + TVU Bonded Contribution`,
      viewerCount: 420,
      followerCount: 1850,
      isLive: true,
      isVerified: true,
      tags: ['Kick-WebRTC', '95/5-Split', 'Custom-Uplink'],
      thumbnailUrl: primaryProgramPack.previewImage,
      tvuPackId: activeTvuPack.id,
      red5NodeId: activeRed5Node.id,
      ircChannel: `#${cleanSlug}`,
      chatroomId: String(Math.floor(3900000 + Math.random() * 99000)),
      pusherCluster: 'us2',
      rtmpIngestUrl: 'rtmps://fa723fc1b171.global-contribute.live-video.net:443/app/',
      uptimeMinutes: 1,
      subPriceUsd: 4.99,
      creatorSplitPct: 95,
      kicksTotal: 500,
      moderators: [ircNick, 'DrFun1KickBot'],
    };
    setKickChannels((prev) => [created, ...prev]);
    setSelectedKickChannelId(created.id);
    setActivePlatform('kick');
    setNewKickSlug('');
    setNewKickTitle('');
    notify(`Added kick.com/${created.slug} to WebRTC Live Studio!`);
  };

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isFollowed = followedChannelIds.has(currentStreamEntity.id);
  const isSubscribed = subscribedChannelIds.has(currentStreamEntity.id);

  return (
    <div className="space-y-5">
      {/* Toast Confirmation */}
      {toastMsg && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{toastMsg}</span>
        </div>
      )}

      {/* ========================================================
          UNIFIED WORKSPACE HEADER: TVU + Red5.net + Twitch.tv + Kick.com
          ======================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="text-xs font-mono text-purple-300">
              TVU Networks Contribution · Red5.net WebRTC Edge · Twitch.tv &amp; Kick.com Live Streams
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-balance">
              Live Video Broadcast, WebRTC Cluster, Twitch &amp; Kick Studio
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl">
              End-to-end live contribution from bonded 5G/Starlink TVU field units into Red5 Pro WHIP/WHEP autoscaling nodes, simulcast to Twitch.tv and Kick.com (95/5 split) with UnrealIRCd chat bridging.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenRankMatrix && (
              <button
                type="button"
                onClick={onOpenRankMatrix}
                className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-1.5 min-h-[40px] cursor-pointer whitespace-nowrap"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeRankDef.prefix}{activeRankDef.shortLabel} (Lvl {activeRankDef.accessLevel})</span>
              </button>
            )}
            {onNavigateToIrc && (
              <button
                type="button"
                onClick={onNavigateToIrc}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 min-h-[40px] cursor-pointer whitespace-nowrap"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Open {currentStreamEntity.ircChannel}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCutPreviewToProgram}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 min-h-[40px] cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-4 h-4" />
              <span>Cut Preview to Live</span>
            </button>
          </div>
        </div>

        {/* 4-Column Pipeline KPI Summary (Tabular Numerals) */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-slate-400">TVU Bonded Capacity</div>
            <div className="text-xl font-bold text-sky-400 font-mono tabular-nums mt-0.5">
              {getPackTotalMbps(primaryProgramPack).toFixed(1)} Mbps · {primaryProgramPack.latencyMs}ms
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Red5 Pro WebRTC RTT</div>
            <div className="text-xl font-bold text-rose-400 font-mono tabular-nums mt-0.5">
              {activeRed5Node.webrtcRttMs} ms · {totalRed5Gbps.toFixed(1)} Gbps
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Twitch Live Audience</div>
            <div className="text-xl font-bold text-purple-300 font-mono tabular-nums mt-0.5">
              {totalTwitchViewers.toLocaleString()} Viewers
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Kick.com Audience (95/5 Split)</div>
            <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
              {totalKickViewers.toLocaleString()} Viewers · {totalRed5Subscribers.toLocaleString()} Edge
            </div>
          </div>
        </div>

        {/* Sub-Navigation Workspace Switcher */}
        <div className="pt-4 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'unified', label: 'All-in-One Live Studio', icon: Layers, activeCls: 'bg-purple-600 text-white font-bold' },
              { id: 'tvu', label: 'TVU Networks Grid & Producer', icon: Camera, activeCls: 'bg-sky-600 text-white font-bold' },
              { id: 'red5', label: 'Red5.net WebRTC Cluster', icon: Server, activeCls: 'bg-rose-600 text-white font-bold' },
              { id: 'twitch', label: 'Twitch.tv Channels & Creator Deck', icon: Tv, activeCls: 'bg-purple-600 text-white font-bold' },
              { id: 'kick', label: 'Kick.com Channels & Creator Deck', icon: Zap, activeCls: 'bg-emerald-500 text-slate-950 font-bold' },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = subView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubView(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer transition-colors ${
                  isActive
                    ? tab.activeCls
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          SUB-VIEW 1: ALL-IN-ONE UNIFIED LIVE STUDIO (TVU + RED5 + TWITCH + KICK)
          ======================================================== */}
      {subView === 'unified' && (
        <div className="space-y-5">
          {/* Platform Switcher & Dual Simulcast Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: `All Feeds (${channels.length + kickChannels.length})` },
                  { id: 'twitch', label: `Twitch.tv (${channels.length})` },
                  { id: 'kick', label: `Kick.com (${kickChannels.length})` },
                ] as const
              ).map((flt) => (
                <button
                  key={flt.id}
                  type="button"
                  onClick={() => {
                    setUnifiedFilter(flt.id);
                    if (flt.id === 'kick') setActivePlatform('kick');
                    if (flt.id === 'twitch') setActivePlatform('twitch');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                    unifiedFilter === flt.id
                      ? flt.id === 'kick'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
                  }`}
                >
                  {flt.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsDualSimulcast((v) => !v);
                  notify(
                    isDualSimulcast
                      ? 'Dual Simulcast paused (single destination egress)'
                      : 'Dual Simulcast enabled: Red5 WHIP pushing to Twitch.tv + Kick.com!'
                  );
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs border cursor-pointer flex items-center gap-1.5 ${
                  isDualSimulcast
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isDualSimulcast ? 'Twitch + Kick Simulcast ON' : 'Simulcast OFF'}</span>
              </button>
              <a
                href={`https://kick.com/${activeKickChannel.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-mono flex items-center gap-1"
              >
                <span>kick.com/{activeKickChannel.slug}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Channel & Feed Quick Selector Bar (Twitch.tv & Kick.com) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {(unifiedFilter !== 'kick' ? channels.slice(0, unifiedFilter === 'twitch' ? 6 : 3) : []).map((ch) => {
              const selected = activePlatform === 'twitch' && ch.id === activeChannel.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleSelectChannel(ch)}
                  className={`text-left p-3 rounded-xl border transition-colors flex items-center gap-3 cursor-pointer ${
                    selected
                      ? 'bg-slate-900 border-purple-500 ring-1 ring-purple-500/40'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-slate-800 flex items-center justify-center relative">
                    {!imgFailed[ch.id] ? (
                      <img
                        src={ch.thumbnailUrl}
                        alt={ch.displayName}
                        referrerPolicy="no-referrer"
                        onError={() => setImgFailed((prev) => ({ ...prev, [ch.id]: true }))}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Video className="w-5 h-5 text-purple-400" />
                    )}
                    <span className="absolute top-1 left-1 px-1 rounded bg-purple-600/90 text-[9px] font-mono font-bold text-white">
                      TWITCH
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-white truncate">{ch.displayName}</span>
                      <span className="font-mono tabular-nums text-rose-400 shrink-0">
                        {ch.viewerCount.toLocaleString()} live
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{ch.streamTitle}</div>
                    <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                      {ch.category} · {ch.ircChannel}
                    </div>
                  </div>
                </button>
              );
            })}

            {(unifiedFilter !== 'twitch' ? kickChannels.slice(0, unifiedFilter === 'kick' ? 6 : 3) : []).map((kch) => {
              const selected = activePlatform === 'kick' && kch.id === activeKickChannel.id;
              return (
                <button
                  key={kch.id}
                  type="button"
                  onClick={() => handleSelectKickChannel(kch)}
                  className={`text-left p-3 rounded-xl border transition-colors flex items-center gap-3 cursor-pointer ${
                    selected
                      ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500/40'
                      : 'bg-slate-900/70 border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-slate-800 flex items-center justify-center relative">
                    {!imgFailed[kch.id] ? (
                      <img
                        src={kch.thumbnailUrl}
                        alt={kch.displayName}
                        referrerPolicy="no-referrer"
                        onError={() => setImgFailed((prev) => ({ ...prev, [kch.id]: true }))}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Zap className="w-5 h-5 text-emerald-400" />
                    )}
                    <span className="absolute top-1 left-1 px-1 rounded bg-emerald-500 text-[9px] font-mono font-bold text-slate-950">
                      KICK
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-white truncate">kick.com/{kch.slug}</span>
                      <span className="font-mono tabular-nums text-emerald-400 shrink-0">
                        {kch.viewerCount.toLocaleString()} live
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{kch.streamTitle}</div>
                    <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                      {kch.category} · 95/5 Split · {kch.ircChannel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Split: Live Program Player + TVU Switcher (8 cols) | Twitch Live Chat & Bits (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* LEFT COLUMN: Integrated Twitch Player + TVU Producer Deck + Red5 WHEP Stats */}
            <div className={`${isTheaterMode ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-4`}>
              <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {/* 16:9 Live Video Viewport */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  {activeScene.layout === '4-Up Multiview' ? (
                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5 bg-slate-800">
                      {tvuPacks.slice(0, 4).map((pack, idx) => (
                        <div key={pack.id} className="relative overflow-hidden bg-slate-950">
                          {!imgFailed[pack.id] ? (
                            <img
                              src={pack.previewImage}
                              alt={pack.unitName}
                              referrerPolicy="no-referrer"
                              onError={() => setImgFailed((prev) => ({ ...prev, [pack.id]: true }))}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                              <Camera className="w-8 h-8" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-2.5 text-[11px] font-mono text-white">
                            CAM {idx + 1} · {pack.unitName} · {getPackTotalMbps(pack).toFixed(1)} Mbps
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {!imgFailed[primaryProgramPack.id] ? (
                        <img
                          src={primaryProgramPack.previewImage}
                          alt={activeChannel.streamTitle}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setImgFailed((prev) => ({ ...prev, [primaryProgramPack.id]: true }))
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                          <Tv className="w-12 h-12 text-purple-400" />
                        </div>
                      )}
                      {activeScene.layout === 'Picture-in-Picture' && (
                        <div className="absolute top-4 right-4 w-40 sm:w-52 aspect-video rounded-lg overflow-hidden border border-slate-700 shadow-2xl bg-slate-900">
                          <img
                            src={
                              (tvuPacks.find((p) => p.id === activeScene.secondaryPackId) || tvuPacks[0])
                                .previewImage
                            }
                            alt="TVU Picture-in-Picture secondary camera"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 left-1.5 text-[10px] font-mono text-white bg-black/70 px-1.5 rounded">
                            PiP · TVU CAM B
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Measured Contrast Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

                  {/* Top-Left Broadcast Live Status & Red5 WebRTC HUD */}
                  <div className="absolute top-3 left-3 right-3 flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2 bg-slate-950/85 border border-slate-700/80 px-2.5 py-1 rounded-md text-xs font-mono">
                      <span className={`inline-flex items-center gap-1.5 font-bold ${activePlatform === 'kick' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${activePlatform === 'kick' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                        {isPlaying ? (activePlatform === 'kick' ? 'KICK LIVE' : 'LIVE') : 'PAUSED'}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-200 tabular-nums">
                        {currentStreamEntity.viewerCount.toLocaleString()} watching
                      </span>
                      <span className="text-slate-600 hidden sm:inline">·</span>
                      <span className="text-slate-300 font-mono tabular-nums hidden sm:inline">
                        {formatUptime(liveTimeSec)}
                      </span>
                    </div>

                    {showWebRtcOverlay && (
                      <div className="bg-slate-950/85 border border-slate-700/80 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-200 tabular-nums">
                        TVU: {primaryProgramPack.unitName} ({getPackTotalMbps(primaryProgramPack).toFixed(1)} Mbps) · Red5 WHEP: {activeRed5Node.webrtcRttMs}ms{isDualSimulcast ? ' · Simulcast: Twitch + Kick' : ''}
                      </div>
                    )}
                  </div>

                  {/* TVU Producer Lower-Third Graphics Overlay */}
                  {activeScene.showLowerThird && (
                    <div className="absolute bottom-16 left-3 right-3 sm:left-5 sm:right-auto sm:max-w-xl bg-slate-950/90 border border-purple-500/50 rounded-lg px-3.5 py-2">
                      <div className="text-xs font-bold text-amber-300 tracking-wide">
                        {activeScene.lowerThirdTitle}
                      </div>
                      <div className="text-[11px] text-slate-200 mt-0.5">
                        {activeScene.lowerThirdSubtitle}
                      </div>
                    </div>
                  )}

                  {/* Bottom Player Transport Controls */}
                  <div className="absolute bottom-0 inset-x-0 px-3 py-2.5 bg-gradient-to-t from-black/95 to-transparent flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPlaying((p) => !p)}
                        className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                        aria-label={isPlaying ? 'Pause stream' : 'Play stream'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsMuted((m) => !m)}
                        className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 cursor-pointer"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
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
                        aria-label="Stream volume"
                        className="w-20 accent-purple-500 hidden sm:block"
                      />

                      <span className="text-[11px] font-mono text-slate-300 hidden md:inline">
                        {activeScene.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={playerQuality}
                        onChange={(e) =>
                          setPlayerQuality(
                            e.target.value as '1080p60 WebRTC' | '720p60 ABR' | '480p30 Fallback'
                          )
                        }
                        aria-label="Stream video quality"
                        className="bg-slate-900/90 border border-slate-700 rounded-md px-2 py-1 text-[11px] font-mono text-slate-200 cursor-pointer"
                      >
                        <option value="1080p60 WebRTC">1080p60 WebRTC</option>
                        <option value="720p60 ABR">720p60 ABR</option>
                        <option value="480p30 Fallback">480p30 Fallback</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setShowWebRtcOverlay((v) => !v)}
                        className="px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-[11px] font-mono text-slate-200 hover:text-white cursor-pointer"
                      >
                        Stats
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsTheaterMode((t) => !t)}
                        className="p-1.5 rounded-md bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white cursor-pointer"
                        title="Toggle Theater Mode"
                        aria-label="Toggle Theater Mode"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Channel Header & Actions Strip Below Player (Platform-aware: Twitch.tv or Kick.com) */}
                <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          activePlatform === 'kick'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-purple-600 text-white'
                        }`}
                      >
                        {activePlatform === 'kick' ? 'KICK.COM' : 'TWITCH.TV'}
                      </span>
                      <h2 className="text-base font-bold text-white">
                        {activePlatform === 'kick'
                          ? `kick.com/${activeKickChannel.slug}`
                          : activeChannel.displayName}
                      </h2>
                      <span className="text-xs text-slate-400">
                        {currentStreamEntity.category} · {currentStreamEntity.followerCount.toLocaleString()} followers · Mod: www.wittlawfirm.com
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 leading-snug">{currentStreamEntity.streamTitle}</p>
                    <div className="text-xs font-mono text-slate-400">
                      Source: {primaryProgramPack.unitName} → Node: {activeRed5Node.nodeName} · IRC: {currentStreamEntity.ircChannel}
                      {activePlatform === 'kick' && ` · Pusher ${activeKickChannel.pusherCluster} (Room ${activeKickChannel.chatroomId})`}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleFollow(
                          currentStreamEntity.id,
                          activePlatform === 'kick' ? activeKickChannel.slug : activeChannel.displayName
                        )
                      }
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 min-h-[40px] cursor-pointer whitespace-nowrap ${
                        isFollowed
                          ? 'bg-slate-800 text-rose-300 border border-rose-500/40'
                          : activePlatform === 'kick'
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFollowed ? 'fill-rose-400' : ''}`} />
                      <span>{isFollowed ? 'Following' : 'Follow'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSubscribe(
                          currentStreamEntity.id,
                          activePlatform === 'kick' ? activeKickChannel.slug : activeChannel.displayName
                        )
                      }
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 min-h-[40px] cursor-pointer whitespace-nowrap ${
                        isSubscribed
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>
                        {isSubscribed
                          ? activePlatform === 'kick'
                            ? 'Subscribed (95/5)'
                            : 'Subscribed'
                          : activePlatform === 'kick'
                          ? `Sub 95/5 ($${activeKickChannel.subPriceUsd})`
                          : `Subscribe ($${activeChannel.subPriceUsd})`}
                      </span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Integrated TVU Producer Quick Scene Switcher & Red5 WHIP/WHEP Strip */}
              <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      TVU Producer Switcher &amp; Red5 WebRTC Transport
                    </h3>
                    <p className="text-xs text-slate-400">
                      Preview and cut TVU camera scenes directly to the Red5 WHIP origin feeding {activeChannel.displayName}.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsIsoRecording((r) => !r);
                        notify(
                          isIsoRecording
                            ? 'Stopped TVU Cloud ISO Recording'
                            : 'Started TVU Cloud ISO Multitrack Recording'
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border cursor-pointer whitespace-nowrap ${
                        isIsoRecording
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      {isIsoRecording ? 'ISO REC ON' : 'Start ISO Rec'}
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleLowerThirdVisibility}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 hover:text-white text-xs cursor-pointer whitespace-nowrap"
                    >
                      {activeScene.showLowerThird ? 'Hide Lower-Third' : 'Show Lower-Third'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
                  {tvuScenes.map((scene) => {
                    const isProgram = scene.id === activeScene.id;
                    const isPreview = scene.id === previewScene.id;
                    return (
                      <button
                        key={scene.id}
                        type="button"
                        onClick={() => {
                          if (isProgram) return;
                          setPreviewSceneId(scene.id);
                        }}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                          isProgram
                            ? 'bg-rose-500/15 border-rose-500 text-white'
                            : isPreview
                            ? 'bg-emerald-500/15 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className={isProgram ? 'text-rose-400 font-bold' : isPreview ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                            {isProgram ? 'PROGRAM' : isPreview ? 'PREVIEW' : 'STANDBY'}
                          </span>
                          <span className="text-slate-400">{scene.layout}</span>
                        </div>
                        <div className="text-xs font-semibold text-white truncate mt-1">
                          {scene.name}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Live WHIP / WHEP Copy Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400">Red5 WHIP Ingest Endpoint</div>
                      <div className="text-sky-300 truncate">{activeRed5Node.whipIngestUrl}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(activeRed5Node.whipIngestUrl, 'whip', 'Red5 WHIP URL')}
                      className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'whip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400">Red5 WHEP Playback Endpoint</div>
                      <div className="text-emerald-300 truncate">{activeRed5Node.whepPlaybackUrl}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(activeRed5Node.whepPlaybackUrl, 'whep', 'Red5 WHEP URL')}
                      className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'whep' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Live Synchronized Twitch OR Kick.com Pusher WS Chat */}
            {!isTheaterMode && (
              <aside className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden min-h-[540px]">
                {/* Chat Platform Switcher Header */}
                <div className="p-3.5 border-b border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <MessageSquare className={`w-4 h-4 ${activePlatform === 'kick' ? 'text-emerald-400' : 'text-purple-400'}`} />
                      <span>
                        {activePlatform === 'kick'
                          ? `Kick Chat · ${activeKickChannel.ircChannel}`
                          : `Twitch Chat · ${activeChannel.ircChannel}`}
                      </span>
                    </h3>
                    <div className="text-right font-mono tabular-nums text-[11px]">
                      {activePlatform === 'kick' ? (
                        <>
                          <div className="text-emerald-300 font-bold">{userKicksBalance.toLocaleString()} Kicks</div>
                          <div className="text-slate-400">us2 Room {activeKickChannel.chatroomId}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-amber-300 font-bold">{channelPoints.toLocaleString()} pts</div>
                          <div className="text-purple-300">{userBitsBalance.toLocaleString()} Bits</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Chat Room Toggle: Twitch vs Kick.com */}
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setActivePlatform('twitch')}
                      className={`py-1 rounded font-bold cursor-pointer transition-colors ${
                        activePlatform === 'twitch'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Twitch Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePlatform('kick')}
                      className={`py-1 rounded font-bold cursor-pointer transition-colors ${
                        activePlatform === 'kick'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Kick Pusher WS
                    </button>
                  </div>
                </div>

                {/* Chat Filter Indicators */}
                {activePlatform === 'twitch' && (slowModeSec > 0 || followersOnlyChat) && (
                  <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-amber-300">
                    {slowModeSec > 0 && `Slow Mode (${slowModeSec}s)`}
                    {slowModeSec > 0 && followersOnlyChat && ' · '}
                    {followersOnlyChat && 'Followers-Only Chat'}
                  </div>
                )}
                {activePlatform === 'kick' && (kickSubsOnlyChat || kickEmoteOnlyChat) && (
                  <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-emerald-300">
                    {kickSubsOnlyChat && 'Subs-Only (95/5)'}
                    {kickSubsOnlyChat && kickEmoteOnlyChat && ' · '}
                    {kickEmoteOnlyChat && 'Emote-Only'}
                  </div>
                )}

                {activePlatform === 'twitch' ? (
                  <>
                    {/* Twitch Messages */}
                    <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 max-h-[400px]">
                      {visibleChatMessages.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-400">
                          No chat messages yet in {activeChannel.displayName}. Start the conversation below.
                        </div>
                      ) : (
                        visibleChatMessages.map((msg) => {
                          const isHighlighted = msg.id === highlightedChatId;
                          return (
                            <div
                              key={msg.id}
                              className={`text-xs leading-relaxed p-2 rounded-lg transition-colors ${
                                isHighlighted
                                  ? 'bg-purple-600/25 border border-purple-500/60'
                                  : msg.bitsAmount
                                  ? 'bg-amber-500/10 border border-amber-500/30'
                                  : 'hover:bg-slate-800/50'
                              }`}
                            >
                              <span className="font-mono text-[10px] text-slate-500 mr-1.5 tabular-nums">
                                {msg.timestamp}
                              </span>
                              <span className={`font-mono text-[10px] font-bold mr-1.5 ${msg.badgeColor}`}>
                                [{msg.badge}]
                              </span>
                              <span className="font-bold text-white mr-1.5">{msg.author}:</span>
                              <span className="text-slate-200 break-words">{msg.text}</span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Channel Point Rewards Quick Strip */}
                    <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5 text-amber-400" />
                          <span>Channel Point Rewards</span>
                        </span>
                        <span className="font-mono text-amber-300 tabular-nums">{channelPoints} pts</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {CHANNEL_POINT_REWARDS.map((rw) => (
                          <button
                            key={rw.id}
                            type="button"
                            onClick={() => handleRedeemPoints(rw.id)}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left cursor-pointer"
                            title={rw.description}
                          >
                            <div className="text-[11px] font-semibold text-white truncate">{rw.title}</div>
                            <div className="text-[10px] font-mono text-amber-300 tabular-nums">{rw.cost} pts</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Twitch Chat Composer */}
                    <form onSubmit={(e) => handleSendChat(e)} className="p-3 border-t border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={`Message ${activeChannel.displayName} as ${ircNick}...`}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer min-h-[36px]"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {[100, 500].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={(e) => handleSendChat(e, amt)}
                              className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-purple-500/40 text-purple-300 font-mono cursor-pointer"
                            >
                              Cheer {amt} Bits
                            </button>
                          ))}
                        </div>
                        <span className="text-slate-400 font-mono">Synced with UnrealIRCd</span>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    {/* Kick.com Pusher WebSocket Messages */}
                    <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 max-h-[400px]">
                      {visibleKickChatMessages.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-400">
                          Connected to chatrooms.{activeKickChannel.chatroomId}.v2 on Pusher {activeKickChannel.pusherCluster}. Say hello!
                        </div>
                      ) : (
                        visibleKickChatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`text-xs leading-relaxed p-2 rounded-lg transition-colors ${
                              msg.kicksGifted
                                ? 'bg-emerald-500/10 border border-emerald-500/35'
                                : 'hover:bg-slate-800/50'
                            }`}
                          >
                            <span className="font-mono text-[10px] text-slate-500 mr-1.5 tabular-nums">
                              {msg.timestamp}
                            </span>
                            <span className={`font-mono text-[10px] font-bold mr-1.5 ${msg.badgeColor}`}>
                              [{msg.badge}]
                            </span>
                            <span className="font-bold text-white mr-1.5">{msg.author}:</span>
                            <span className="text-slate-200 break-words">{msg.text}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Kick.com Kicks & Gift Sub Actions */}
                    <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Kick Gifts &amp; 95/5 Creator Payout</span>
                        </span>
                        <span className="font-mono text-emerald-300 tabular-nums">
                          {activeKickChannel.kicksTotal.toLocaleString()} Kicks
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {KICK_GIFT_ACTIONS.map((act) => (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() => handleKickGiftAction(act.id)}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/25 text-left cursor-pointer"
                            title={act.description}
                          >
                            <div className="text-[11px] font-semibold text-white truncate">{act.label}</div>
                            <div className="text-[10px] font-mono text-emerald-300 tabular-nums">{act.kicksCost} Kicks</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Kick Chat Composer */}
                    <form onSubmit={(e) => handleSendKickChat(e)} className="p-3 border-t border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={kickChatInput}
                          onChange={(e) => setKickChatInput(e.target.value)}
                          placeholder={`Chat in kick.com/${activeKickChannel.slug} as ${ircNick}...`}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer min-h-[36px]"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {[100, 500].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={(e) => handleSendKickChat(e, amt)}
                              className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-mono cursor-pointer"
                            >
                              Gift {amt} Kicks
                            </button>
                          ))}
                        </div>
                        <span className="text-slate-400 font-mono">Pusher us2 · IRC Sync</span>
                      </div>
                    </form>
                  </>
                )}
              </aside>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-VIEW 2: TVU NETWORKS GRID, PACKS & CLOUD PRODUCER
          ======================================================== */}
      {subView === 'tvu' && (
        <div className="space-y-5">
          {/* Cloud Producer Lower-Third & Pair Transmitter */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white">TVU Producer Lower-Third &amp; Scene Control</h2>
                  <p className="text-xs text-slate-400">
                    Active Scene: {activeScene.name} ({activeScene.layout})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCutPreviewToProgram}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  Cut Preview → Live
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Broadcast Lower-Third Headline
                  </label>
                  <input
                    type="text"
                    value={activeScene.lowerThirdTitle}
                    onChange={(e) =>
                      handleUpdateLowerThird(e.target.value, activeScene.lowerThirdSubtitle)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Broadcast Lower-Third Subline
                  </label>
                  <input
                    type="text"
                    value={activeScene.lowerThirdSubtitle}
                    onChange={(e) =>
                      handleUpdateLowerThird(activeScene.lowerThirdTitle, e.target.value)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>
            </section>

            <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
              <h2 className="text-base font-bold text-white">Pair New TVU Transmitter / Mobile</h2>
              <form onSubmit={handleAddTvuPack} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    value={newTvuUnitName}
                    onChange={(e) => setNewTvuUnitName(e.target.value)}
                    placeholder="Unit ID (e.g. TVU-NY-09)"
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                  <input
                    type="text"
                    value={newTvuLocation}
                    onChange={(e) => setNewTvuLocation(e.target.value)}
                    placeholder="Field Location"
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Pair TVU Pack to Red5 Origin</span>
                </button>
              </form>
            </section>
          </div>

          {/* TVU Bonded Transmitters Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {tvuPacks.map((pack) => {
              const totalMbps = getPackTotalMbps(pack);
              const isSelected = pack.id === activeTvuPack.id;
              return (
                <section
                  key={pack.id}
                  className={`bg-slate-900 border rounded-xl p-4 sm:p-5 space-y-4 ${
                    isSelected ? 'border-sky-500' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-24 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-slate-800">
                        {!imgFailed[pack.id] ? (
                          <img
                            src={pack.previewImage}
                            alt={pack.unitName}
                            referrerPolicy="no-referrer"
                            onError={() => setImgFailed((prev) => ({ ...prev, [pack.id]: true }))}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-5 h-5 text-sky-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white font-mono truncate">
                          {pack.unitName} · {pack.model}
                        </div>
                        <div className="text-xs text-slate-300 truncate">{pack.location}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                          {pack.resolution} · {pack.videoCodec} · {pack.latencyMs}ms · Operator: {pack.operatorNick}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRoutePackToProgram(pack)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 cursor-pointer ${
                        pack.status === 'on_air'
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {pack.status === 'on_air' ? 'Route Live' : 'Take On-Air'}
                    </button>
                  </div>

                  {/* Interactive Bonded Modems List */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <Signal className="w-3.5 h-3.5 text-sky-400" />
                        <span>Inverse StatMux Bonded Modems ({pack.modems.filter((m) => m.enabled).length}/{pack.modems.length})</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">
                        {totalMbps.toFixed(1)} Mbps Total · Loss {pack.packetLossPct}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pack.modems.map((modem) => (
                        <button
                          key={modem.id}
                          type="button"
                          onClick={() => handleToggleTvuModem(pack.id, modem.id)}
                          className={`p-2.5 rounded-lg border text-left flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            modem.enabled
                              ? 'bg-slate-950 border-slate-700 text-white'
                              : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                          }`}
                          title="Click to toggle cellular/Starlink modem bonding"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">{modem.carrier}</div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {modem.networkType} · {modem.signalPct}% RSSI
                            </div>
                          </div>
                          <div className="text-right font-mono tabular-nums shrink-0">
                            <div className={`text-xs font-bold ${modem.enabled ? 'text-sky-400' : 'text-slate-500'}`}>
                              {modem.enabled ? `${modem.bitrateMbps.toFixed(1)} Mbps` : 'DISABLED'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-VIEW 3: RED5.NET WEBRTC AUTOSCALE CLUSTER
          ======================================================== */}
      {subView === 'red5' && (
        <div className="space-y-5">
          {!canScaleRed5Cluster && (
            <IrcdAccessGateBanner
              currentRank={activeRank}
              requiredRank="techadmin"
              featureName="Provision & Autoscale Red5 Pro WebRTC Edge Cluster Nodes"
              onElevateRank={onElevateRank}
              onOpenRankMatrix={onOpenRankMatrix}
            />
          )}

          <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Red5.net / Red5 Pro Real-Time WebRTC Stream Manager
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sub-300ms WebRTC WHIP/WHEP, SRT &amp; RTMP autoscaling cluster deployed across Switch SUPERNAP, RisingNet AS53767, and DataPacket.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutoscaleRed5Edge}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 min-h-[40px] cursor-pointer whitespace-nowrap self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Autoscale Edge Node</span>
              </button>
            </div>

            {/* Responsive Cluster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-2.5 pr-3">Node Hostname</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Protocol</th>
                    <th className="py-2.5 px-3 text-right">RTT</th>
                    <th className="py-2.5 px-3 text-right">Subscribers</th>
                    <th className="py-2.5 px-3 text-right">Egress</th>
                    <th className="py-2.5 px-3 text-right">ABR</th>
                    <th className="py-2.5 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {red5Nodes.map((node) => {
                    const isSelected = node.id === activeRed5Node.id;
                    return (
                      <tr
                        key={node.id}
                        className={isSelected ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}
                      >
                        <td className="py-3 pr-3">
                          <div className="font-mono font-bold text-white">{node.nodeName}</div>
                          <div className="text-[11px] text-slate-400">
                            {node.region} · {node.datacenter}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-200">{node.role}</td>
                        <td className="py-3 px-3 font-mono text-sky-300">{node.protocol}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400">
                          {node.webrtcRttMs} ms
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-white">
                          {node.activeSubscribers.toLocaleString()} / {node.maxCapacity.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-300">
                          {node.bandwidthGbps.toFixed(1)} Gbps
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleRed5Abr(node.id)}
                            className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer ${
                              node.abrEnabled
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {node.abrEnabled ? 'ABR ON' : 'ABR OFF'}
                          </button>
                        </td>
                        <td className="py-3 pl-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRed5NodeId(node.id);
                              notify(`Selected Red5 node ${node.nodeName}`);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 hover:text-white font-mono text-[11px] cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Active Red5 Node Endpoints */}
            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">WebRTC WHIP Ingest</div>
                <div className="text-sky-300 truncate">{activeRed5Node.whipIngestUrl}</div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(activeRed5Node.whipIngestUrl, 'r5-whip', 'Red5 WHIP endpoint')
                  }
                  className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer pt-1"
                >
                  Copy WHIP URL
                </button>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">WebRTC WHEP Playback</div>
                <div className="text-emerald-300 truncate">{activeRed5Node.whepPlaybackUrl}</div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(activeRed5Node.whepPlaybackUrl, 'r5-whep', 'Red5 WHEP endpoint')
                  }
                  className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer pt-1"
                >
                  Copy WHEP URL
                </button>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">SRT / OBS Contribution</div>
                <div className="text-amber-300 truncate">{activeRed5Node.srtEndpoint}</div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(activeRed5Node.srtEndpoint, 'r5-srt', 'Red5 SRT endpoint')
                  }
                  className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer pt-1"
                >
                  Copy SRT URL
                </button>
              </div>
            </div>
          </section>

          {/* Red5.net Pro Broadcast Pipeline + dev.twitch.tv & dev.kick.com Controls */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Broadcast via Red5.net — dev.twitch.tv &amp; dev.kick.com Live Egress
                </h3>
                <p className="text-xs text-slate-400">
                  Push WebRTC WHIP / SRT from Red5.net Pro directly to Twitch Helix and Kick API v2 simultaneously.
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                {(
                  [
                    { id: 'red5_broadcast', label: 'Red5.net Broadcast' },
                    { id: 'twitch_dev', label: 'dev.twitch.tv' },
                    { id: 'kick_dev', label: 'dev.kick.com' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRed5DevSection(item.id)}
                    className={`px-2.5 py-1 rounded font-mono cursor-pointer transition-colors ${
                      red5DevSection === item.id
                        ? 'bg-rose-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <Red5TwitchKickDevStudio
              section={red5DevSection}
              onSwitchSection={setRed5DevSection}
              selectedRed5NodeIdExternal={selectedRed5NodeId}
              onSelectRed5NodeExternal={setSelectedRed5NodeId}
              onJoinDevChannel={() => onNavigateToIrc?.()}
            />
          </section>
        </div>
      )}

      {/* ========================================================
          SUB-VIEW 4: TWITCH.TV CHANNELS DIRECTORY & CREATOR DECK
          ======================================================== */}
      {subView === 'twitch' && (
        <div className="space-y-5">
          {/* Creator Stream Manager Controls */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">
                  Twitch Creator Dashboard — {activeChannel.displayName}
                </h2>
                <p className="text-xs text-slate-400">
                  Manage stream title, clip highlights, mid-roll ads, chat moderation modes, and raids.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => notify(`Clipped last 30s of ${activeChannel.displayName} (HD 60fps)!`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Scissors className="w-3.5 h-3.5 text-purple-400" />
                  <span>Create Clip</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSlowModeSec((s) => (s === 0 ? 15 : s === 15 ? 30 : 0))
                  }
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer ${
                    slowModeSec > 0
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  Slow Mode: {slowModeSec > 0 ? `${slowModeSec}s` : 'Off'}
                </button>
                <button
                  type="button"
                  onClick={() => setFollowersOnlyChat((f) => !f)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer ${
                    followersOnlyChat
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  Followers-Only: {followersOnlyChat ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveChannelTitle} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={draftStreamTitle}
                onChange={(e) => setDraftStreamTitle(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                Update Stream Title
              </button>
            </form>
          </section>

          {/* Directory Filters & Grid */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
                {(
                  [
                    'All',
                    'Live Broadcast',
                    'News & Field Desk',
                    'SATCOM & NOC',
                    'Legal & FCC',
                    'Music & DJ',
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTwitchCategory(cat)}
                    className={`px-2.5 py-1.5 rounded text-xs whitespace-nowrap cursor-pointer ${
                      twitchCategory === cat
                        ? 'bg-purple-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  placeholder="Search Twitch channels..."
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-full sm:w-56"
                />
              </div>
            </div>

            {filteredChannels.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                No channels match your current filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredChannels.map((ch) => (
                  <div
                    key={ch.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video bg-slate-900">
                        {!imgFailed[ch.id] ? (
                          <img
                            src={ch.thumbnailUrl}
                            alt={ch.displayName}
                            referrerPolicy="no-referrer"
                            onError={() => setImgFailed((prev) => ({ ...prev, [ch.id]: true }))}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tv className="w-8 h-8 text-purple-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono text-white">
                          <span className="bg-rose-600 px-1.5 py-0.5 rounded font-bold">LIVE</span>
                          <span className="bg-black/75 px-2 py-0.5 rounded tabular-nums">
                            {ch.viewerCount.toLocaleString()} viewers
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-1.5">
                        <div className="text-xs text-slate-400">
                          {ch.category} · {ch.ircChannel}
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                          {ch.streamTitle}
                        </h3>
                        <div className="text-xs text-purple-300 font-semibold">{ch.displayName}</div>
                      </div>
                    </div>

                    <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-400 truncate">
                        Mods: {ch.moderators[0]}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectChannel(ch);
                          setSubView('unified');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                      >
                        Watch Stream
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ========================================================
          SUB-VIEW 5: KICK.COM CHANNELS DIRECTORY, 95/5 CREATOR DECK & API V2
          ======================================================== */}
      {subView === 'kick' && (
        <div className="space-y-5">
          {/* Kick.com Creator Stream Manager Controls */}
          <section className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold">
                    KICK.COM
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Kick Creator Dashboard — kick.com/{activeKickChannel.slug}
                  </h2>
                  <span className="text-[11px] font-mono text-emerald-300 border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 rounded">
                    95/5 Revenue Split ($4.74/sub)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Synced with Kick API v2, Pusher WebSocket ({activeKickChannel.pusherCluster} · Room {activeKickChannel.chatroomId}), and Red5.net RTMPS egress.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://kick.com/${activeKickChannel.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Open kick.com/{activeKickChannel.slug}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setRed5DevSection('kick_dev');
                    setSubView('red5');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>dev.kick.com API Console</span>
                </button>
                <button
                  type="button"
                  onClick={() => notify(`Clipped last 45s on kick.com/${activeKickChannel.slug} (1080p60)!`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Scissors className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Clip VOD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setKickSubsOnlyChat((v) => !v)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer ${
                    kickSubsOnlyChat
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  Subs-Only: {kickSubsOnlyChat ? 'ON' : 'OFF'}
                </button>
                <button
                  type="button"
                  onClick={() => setKickEmoteOnlyChat((v) => !v)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer ${
                    kickEmoteOnlyChat
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  Emote-Only: {kickEmoteOnlyChat ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveKickTitle} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={draftKickTitle}
                onChange={(e) => setDraftKickTitle(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                Update Kick.com Title
              </button>
            </form>

            {/* RTMPS & Pusher Telemetry Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400">Kick RTMPS Ingest (Red5 Output)</div>
                  <div className="text-emerald-300 truncate">{activeKickChannel.rtmpIngestUrl}</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(activeKickChannel.rtmpIngestUrl, 'kick-rtmp', 'Kick RTMPS Ingest URL')
                  }
                  className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                >
                  {copiedKey === 'kick-rtmp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400">Pusher WebSocket Channel</div>
                  <div className="text-sky-300 truncate">
                    ws-{activeKickChannel.pusherCluster}.pusher.com · chatrooms.{activeKickChannel.chatroomId}.v2
                  </div>
                </div>
                <Users className="w-4 h-4 text-sky-400 shrink-0" />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400">Creator Payout &amp; Kicks</div>
                  <div className="text-amber-300 truncate tabular-nums">
                    95% Split · {activeKickChannel.kicksTotal.toLocaleString()} Kicks
                  </div>
                </div>
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              </div>
            </div>
          </section>

          {/* Register New Kick.com Channel into Red5 WebRTC Studio */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Kick.com Channel to Red5 WebRTC Live Studio</span>
            </h3>
            <form onSubmit={handleAddCustomKickChannel} className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
              <input
                type="text"
                required
                value={newKickSlug}
                onChange={(e) => setNewKickSlug(e.target.value)}
                placeholder="Kick channel slug (e.g. drfun1media)"
                className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={newKickTitle}
                onChange={(e) => setNewKickTitle(e.target.value)}
                placeholder="Live stream title..."
                className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <select
                value={newKickCategory}
                onChange={(e) => setNewKickCategory(e.target.value as Exclude<KickCategory, 'All'>)}
                className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Field Broadcast">Field Broadcast</option>
                <option value="SATCOM & NOC">SATCOM &amp; NOC</option>
                <option value="Just Chatting">Just Chatting</option>
                <option value="Legal & FCC">Legal &amp; FCC</option>
                <option value="Music & DJ">Music &amp; DJ</option>
              </select>
              <button
                type="submit"
                className="md:col-span-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                Add Kick Channel
              </button>
            </form>
          </section>

          {/* Kick.com Directory Filters & Grid */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
                {(
                  [
                    'All',
                    'Just Chatting',
                    'SATCOM & NOC',
                    'Field Broadcast',
                    'Legal & FCC',
                    'Music & DJ',
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setKickCategory(cat)}
                    className={`px-2.5 py-1.5 rounded text-xs whitespace-nowrap cursor-pointer ${
                      kickCategory === cat
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={kickSearch}
                  onChange={(e) => setKickSearch(e.target.value)}
                  placeholder="Search Kick.com channels..."
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-56"
                />
              </div>
            </div>

            {filteredKickChannels.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                No Kick.com channels match your current filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredKickChannels.map((ch) => (
                  <div
                    key={ch.id}
                    className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-xl overflow-hidden flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="relative aspect-video bg-slate-900">
                        {!imgFailed[ch.id] ? (
                          <img
                            src={ch.thumbnailUrl}
                            alt={ch.displayName}
                            referrerPolicy="no-referrer"
                            onError={() => setImgFailed((prev) => ({ ...prev, [ch.id]: true }))}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Zap className="w-8 h-8 text-emerald-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-2 left-2.5 flex items-center gap-1.5 text-[10px] font-mono">
                          <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                            KICK 95/5
                          </span>
                          <span className="bg-black/75 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                            Room {ch.chatroomId}
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono text-white">
                          <span className="bg-emerald-600 px-1.5 py-0.5 rounded font-bold">LIVE</span>
                          <span className="bg-black/75 px-2 py-0.5 rounded tabular-nums">
                            {ch.viewerCount.toLocaleString()} viewers
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-1.5">
                        <div className="text-xs text-slate-400">
                          {ch.category} · {ch.ircChannel}
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                          {ch.streamTitle}
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-400 font-semibold font-mono">
                            kick.com/{ch.slug}
                          </span>
                          <span className="text-amber-300 font-mono text-[11px] tabular-nums">
                            {ch.kicksTotal.toLocaleString()} Kicks
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <a
                        href={`https://kick.com/${ch.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-slate-300 hover:text-emerald-300 flex items-center gap-1"
                      >
                        <span>kick.com/{ch.slug}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectKickChannel(ch);
                          setSubView('unified');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer whitespace-nowrap"
                      >
                        Watch on Kick WebRTC
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

