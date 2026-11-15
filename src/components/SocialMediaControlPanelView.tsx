/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Social Media Control Panel & www.drfun1media.com Live Feeds Hub
 * Features:
 * - Individual user social media control panels across WittLaw Admins, SCOTUS Bench, Broadcast DJs, and Network Ops
 * - Connect/disconnect, edit handles, toggle auto-syndication, and add new social accounts or users (persisted in localStorage)
 * - Live streaming feeds & HLS/WHIP endpoints directly from www.drfun1media.com with real-time viewer telemetry
 * - Multi-platform post composer & dispatch log tied to each user's connected socials
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Link2,
  Pause,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Terminal,
  Trash2,
  Tv,
  UserPlus,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import {
  DRFUN1MEDIA_LIVE_FEEDS,
  INITIAL_SOCIAL_BROADCAST_POSTS,
  INITIAL_USER_SOCIAL_PROFILES,
  SOCIAL_PLATFORM_META,
} from '../data/socialControlData';
import {
  DrFun1MediaLiveFeed,
  SocialBroadcastPost,
  SocialPlatform,
  UserSocialAccount,
  UserSocialProfile,
} from '../types/socialControl';

interface SocialMediaControlPanelViewProps {
  onOpenLicense?: () => void;
  onNavigateToIrc?: () => void;
  onNavigateToDrFun1Tv?: () => void;
  onNavigateToRed5?: () => void;
}

const STORAGE_KEY_PROFILES = 'drfun1_social_user_profiles_v1';
const STORAGE_KEY_POSTS = 'drfun1_social_dispatch_posts_v1';

export const SocialMediaControlPanelView: React.FC<SocialMediaControlPanelViewProps> = ({
  onOpenLicense,
  onNavigateToIrc,
  onNavigateToDrFun1Tv,
  onNavigateToRed5,
}) => {
  const [profiles, setProfiles] = useState<UserSocialProfile[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_USER_SOCIAL_PROFILES;
  });

  const [posts, setPosts] = useState<SocialBroadcastPost[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_POSTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return INITIAL_SOCIAL_BROADCAST_POSTS;
  });

  const [selectedUserId, setSelectedUserId] = useState<string>(
    () => profiles[0]?.userId || 'usr-richard-witt'
  );
  const [groupFilter, setGroupFilter] = useState<string>('All');
  const [userSearch, setUserSearch] = useState<string>('');

  // Add new user form
  const [showAddUser, setShowAddUser] = useState<boolean>(false);
  const [newUserNick, setNewUserNick] = useState<string>('');
  const [newUserDisplayName, setNewUserDisplayName] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<string>('Broadcaster & Host');
  const [newUserGroup, setNewUserGroup] = useState<UserSocialProfile['group']>('Broadcast & DJs');

  // Add social account form for selected user
  const [showAddSocial, setShowAddSocial] = useState<boolean>(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialPlatform>('youtube');
  const [newSocialHandle, setNewSocialHandle] = useState<string>('');

  // Inline handle editor state
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingHandleValue, setEditingHandleValue] = useState<string>('');

  // Composer state
  const [composerText, setComposerText] = useState<string>('');
  const [attachedFeedId, setAttachedFeedId] = useState<string>(DRFUN1MEDIA_LIVE_FEEDS[0].id);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);

  // Live www.drfun1media.com Feeds telemetry
  const [activeFeedId, setActiveFeedId] = useState<string>(DRFUN1MEDIA_LIVE_FEEDS[0].id);
  const [isFeedLiveStreaming, setIsFeedLiveStreaming] = useState<boolean>(true);
  const [feedTick, setFeedTick] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toastTimerRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    } catch (_) {}
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
    } catch (_) {}
  }, [posts]);

  useEffect(() => {
    if (!isFeedLiveStreaming) return;
    const interval = window.setInterval(() => {
      setFeedTick((t) => t + 1);
    }, 2200);
    return () => window.clearInterval(interval);
  }, [isFeedLiveStreaming]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
      toastTimerRef.current = null;
    }, 3200);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => {
      setCopiedId(null);
      copyTimerRef.current = null;
    }, 2000);
  };

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.userId === selectedUserId) || profiles[0],
    [profiles, selectedUserId]
  );

  // Sync default selected composer platforms when switching users
  useEffect(() => {
    if (!selectedProfile) return;
    const connected = selectedProfile.accounts
      .filter((a) => a.connected)
      .map((a) => a.platform);
    setSelectedPlatforms(connected);
    setEditingAccountId(null);
  }, [selectedProfile?.userId]);

  const filteredProfiles = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return profiles.filter((p) => {
      if (groupFilter !== 'All' && p.group !== groupFilter) return false;
      if (!q) return true;
      return (
        p.nick.toLowerCase().includes(q) ||
        p.displayName.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.accounts.some((a) => a.handle.toLowerCase().includes(q))
      );
    });
  }, [profiles, groupFilter, userSearch]);

  // Live updated metrics for www.drfun1media.com feeds
  const liveFeeds = useMemo<DrFun1MediaLiveFeed[]>(() => {
    return DRFUN1MEDIA_LIVE_FEEDS.map((feed, idx) => {
      const wave = Math.round(Math.sin(feedTick * 0.8 + idx * 1.4) * 145 + (feedTick % 5) * 18);
      return {
        ...feed,
        viewers: Math.max(120, feed.viewers + wave),
      };
    });
  }, [feedTick]);

  const activeFeed = useMemo(
    () => liveFeeds.find((f) => f.id === activeFeedId) || liveFeeds[0],
    [liveFeeds, activeFeedId]
  );

  const totalFollowersAllUsers = useMemo(
    () =>
      profiles.reduce(
        (sum, p) =>
          sum + p.accounts.filter((a) => a.connected).reduce((acc, a) => acc + a.followers, 0),
        0
      ),
    [profiles]
  );

  const totalConnectedChannels = useMemo(
    () =>
      profiles.reduce((sum, p) => sum + p.accounts.filter((a) => a.connected).length, 0),
    [profiles]
  );

  // User Actions
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = newUserNick.trim().replace(/\s+/g, '_');
    if (!cleanNick) return;

    const created: UserSocialProfile = {
      userId: `usr-${Date.now()}`,
      nick: cleanNick,
      displayName: newUserDisplayName.trim() || cleanNick,
      role: newUserRole.trim() || 'Authorized Broadcaster',
      group: newUserGroup,
      organization: 'www.drfun1media.com / WittLaw Network',
      hostmask: `${cleanNick.toLowerCase()}@staff.drfun1media.com`,
      bio: `Connected social hub & www.drfun1media.com live syndication profile for ${newUserDisplayName.trim() || cleanNick}.`,
      masterAutoRelay: true,
      accounts: [
        {
          id: `acc-${Date.now()}-yt`,
          platform: 'youtube',
          handle: `@${cleanNick}`,
          profileUrl: `https://youtube.com/@${cleanNick}`,
          connected: true,
          autoSyncLiveFeed: true,
          followers: 12500,
          isVerified: true,
          lastSyncedAt: 'Just now',
        },
        {
          id: `acc-${Date.now()}-x`,
          platform: 'x_twitter',
          handle: `@${cleanNick}`,
          profileUrl: `https://x.com/${cleanNick}`,
          connected: true,
          autoSyncLiveFeed: true,
          followers: 8400,
          isVerified: false,
          lastSyncedAt: 'Just now',
        },
      ],
    };

    setProfiles((prev) => [created, ...prev]);
    setSelectedUserId(created.userId);
    setNewUserNick('');
    setNewUserDisplayName('');
    setShowAddUser(false);
    showToast(`Created Social Media Control Panel for ${created.nick}`);
  };

  const handleToggleMasterRelay = () => {
    if (!selectedProfile) return;
    const nextVal = !selectedProfile.masterAutoRelay;
    setProfiles((prev) =>
      prev.map((p) =>
        p.userId === selectedProfile.userId ? { ...p, masterAutoRelay: nextVal } : p
      )
    );
    showToast(
      `${selectedProfile.nick}: www.drfun1media.com live auto-relay ${nextVal ? 'ENABLED' : 'PAUSED'}`
    );
  };

  const handleToggleAccountConnection = (accountId: string) => {
    if (!selectedProfile) return;
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.userId !== selectedProfile.userId) return p;
        return {
          ...p,
          accounts: p.accounts.map((a) =>
            a.id === accountId
              ? { ...a, connected: !a.connected, lastSyncedAt: 'Just now' }
              : a
          ),
        };
      })
    );
  };

  const handleToggleAccountAutoSync = (accountId: string) => {
    if (!selectedProfile) return;
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.userId !== selectedProfile.userId) return p;
        return {
          ...p,
          accounts: p.accounts.map((a) =>
            a.id === accountId ? { ...a, autoSyncLiveFeed: !a.autoSyncLiveFeed } : a
          ),
        };
      })
    );
  };

  const handleSaveEditedHandle = (accountId: string) => {
    if (!selectedProfile) return;
    const trimmed = editingHandleValue.trim();
    if (!trimmed) return;
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.userId !== selectedProfile.userId) return p;
        return {
          ...p,
          accounts: p.accounts.map((a) => {
            if (a.id !== accountId) return a;
            const meta = SOCIAL_PLATFORM_META[a.platform];
            const cleanSlug = trimmed.replace(/^@/, '');
            return {
              ...a,
              handle: trimmed,
              profileUrl:
                a.platform === 'youtube' || a.platform === 'tiktok'
                  ? `${meta.baseUrl}@${cleanSlug}`
                  : `${meta.baseUrl}${cleanSlug}`,
              lastSyncedAt: 'Updated now',
            };
          }),
        };
      })
    );
    setEditingAccountId(null);
    showToast(`Updated handle to ${trimmed}`);
  };

  const handleRemoveAccount = (accountId: string) => {
    if (!selectedProfile) return;
    setProfiles((prev) =>
      prev.map((p) =>
        p.userId === selectedProfile.userId
          ? { ...p, accounts: p.accounts.filter((a) => a.id !== accountId) }
          : p
      )
    );
    showToast('Removed social account connection');
  };

  const handleAddSocialAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile || !newSocialHandle.trim()) return;
    const rawHandle = newSocialHandle.trim();
    const meta = SOCIAL_PLATFORM_META[newSocialPlatform];
    const cleanSlug = rawHandle.replace(/^@/, '');
    const newAccount: UserSocialAccount = {
      id: `acc-${Date.now()}`,
      platform: newSocialPlatform,
      handle: rawHandle,
      profileUrl:
        newSocialPlatform === 'youtube' || newSocialPlatform === 'tiktok'
          ? `${meta.baseUrl}@${cleanSlug}`
          : `${meta.baseUrl}${cleanSlug}`,
      connected: true,
      autoSyncLiveFeed: true,
      followers: 4800 + ((feedTick * 317) % 19500),
      isVerified: true,
      lastSyncedAt: 'Just now',
    };

    setProfiles((prev) =>
      prev.map((p) =>
        p.userId === selectedProfile.userId
          ? { ...p, accounts: [...p.accounts, newAccount] }
          : p
      )
    );
    setSelectedPlatforms((prev) =>
      prev.includes(newSocialPlatform) ? prev : [...prev, newSocialPlatform]
    );
    setNewSocialHandle('');
    setShowAddSocial(false);
    showToast(`Connected ${meta.label} (${rawHandle}) for ${selectedProfile.nick}`);
  };

  const handlePublishDispatch = (mode: 'published' | 'scheduled', overrideFeed?: DrFun1MediaLiveFeed) => {
    if (!selectedProfile) return;
    const feed = overrideFeed || liveFeeds.find((f) => f.id === attachedFeedId);
    const body =
      composerText.trim() ||
      (feed
        ? `LIVE NOW on ${feed.feedUrl} — ${feed.title} (${feed.quality} · ${feed.viewers.toLocaleString()} watching)`
        : '');

    if (!body) return;

    const targetPlatforms =
      selectedPlatforms.length > 0
        ? selectedPlatforms
        : selectedProfile.accounts.filter((a) => a.connected).map((a) => a.platform);

    if (targetPlatforms.length === 0) {
      showToast('Connect or select at least one social account for this user first');
      return;
    }

    const reachEstimate = selectedProfile.accounts
      .filter((a) => targetPlatforms.includes(a.platform) && a.connected)
      .reduce((acc, a) => acc + a.followers, 0);

    const newPost: SocialBroadcastPost = {
      id: `post-${Date.now()}`,
      userId: selectedProfile.userId,
      userNick: selectedProfile.nick,
      content: body,
      attachedFeedId: feed?.id,
      attachedFeedTitle: feed?.title,
      platforms: targetPlatforms,
      status: mode,
      timestamp: mode === 'published' ? 'Just now' : 'Scheduled +15m',
      reachEstimate,
    };

    setPosts((prev) => [newPost, ...prev]);
    if (!overrideFeed) setComposerText('');
    showToast(
      `${mode === 'published' ? 'Broadcasted' : 'Scheduled'} across ${targetPlatforms.length} social channels for ${selectedProfile.nick}`
    );
  };

  return (
    <div className="space-y-6">
      {/* ================================================================
          1. HEADER & LIVE STATS STRIP
          ================================================================ */}
      <div className="bg-gradient-to-r from-indigo-950/90 via-slate-950 to-purple-950/80 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Share2 className="w-5 h-5 text-indigo-300" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Social Media Control Panel &amp;{' '}
                  <span className="text-cyan-300">www.drfun1media.com</span> Live Feeds
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  4 LIVE FEEDS ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Manage every staff member, Justice, and DJ&apos;s connected social handles, auto-syndicate live broadcasts from{' '}
                <strong className="text-white">www.drfun1media.com</strong>, and dispatch cross-platform alerts under{' '}
                <strong className="text-amber-300">www.wittlawfirm.com</strong> supervision.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToDrFun1Tv && (
              <button
                type="button"
                onClick={onNavigateToDrFun1Tv}
                className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-200 border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5 text-red-400" />
                <span>DrFun1-TV</span>
              </button>
            )}
            {onNavigateToRed5 && (
              <button
                type="button"
                onClick={onNavigateToRed5}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-200 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <span>Red5 / Twitch / Kick</span>
              </button>
            )}
            {onNavigateToIrc && (
              <button
                type="button"
                onClick={onNavigateToIrc}
                className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                <span>WebIRC</span>
              </button>
            )}
            {onOpenLicense && (
              <button
                type="button"
                onClick={onOpenLicense}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>FCC FRN 0034981290</span>
              </button>
            )}
          </div>
        </div>

        {/* Summary Metrics Row */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Managed Users</div>
            <div className="text-lg font-mono font-bold text-white tabular-nums mt-0.5">
              {profiles.length} Profiles
            </div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Connected Socials</div>
            <div className="text-lg font-mono font-bold text-cyan-300 tabular-nums mt-0.5">
              {totalConnectedChannels} Active Handles
            </div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Combined Reach</div>
            <div className="text-lg font-mono font-bold text-emerald-400 tabular-nums mt-0.5">
              {totalFollowersAllUsers.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">drfun1media.com Viewers</div>
            <div className="text-lg font-mono font-bold text-amber-300 tabular-nums mt-0.5">
              {liveFeeds.reduce((s, f) => s + f.viewers, 0).toLocaleString()} Watching
            </div>
          </div>
        </div>
      </div>

      {/* Transient Notification Banner */}
      {toastMsg && (
        <div className="bg-slate-900 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================================================================
          2. LIVE FEEDS FROM WWW.DRFUN1MEDIA.COM
          ================================================================ */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Live Broadcast Feeds from www.drfun1media.com</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live optical multiplex streams ingested from Switch SUPERNAP &amp; RisingNet — syndicate any live feed directly to a user&apos;s connected socials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFeedLiveStreaming((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 cursor-pointer ${
                isFeedLiveStreaming
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
              }`}
            >
              {isFeedLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isFeedLiveStreaming ? 'Live Telemetry ON' : 'Paused'}</span>
            </button>

            <button
              type="button"
              onClick={() => setFeedTick((t) => t + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Refresh Feeds</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Active Live Feed Monitor */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-[#0d1629] to-[#1a0d24] border border-cyan-500/30 rounded-xl p-4 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {activeFeed.status} · {activeFeed.quality}
                </span>
                <span className="text-[11px] font-mono text-emerald-300 font-bold tabular-nums">
                  {activeFeed.viewers.toLocaleString()} viewers
                </span>
              </div>

              <h3 className="text-base font-black text-white leading-snug">{activeFeed.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{activeFeed.summary}</p>
            </div>

            <div className="space-y-2 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
                <span className="text-slate-400 truncate">HLS: {activeFeed.hlsUrl}</span>
                <button
                  type="button"
                  onClick={() => handleCopyText(activeFeed.hlsUrl, 'hls-copy')}
                  className="text-cyan-400 hover:text-cyan-300 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  {copiedId === 'hls-copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'hls-copy' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
                <span className="text-slate-400 truncate">Red5 WHIP: {activeFeed.whipUrl}</span>
                <button
                  type="button"
                  onClick={() => handleCopyText(activeFeed.whipUrl, 'whip-copy')}
                  className="text-purple-400 hover:text-purple-300 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  {copiedId === 'whip-copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'whip-copy' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="text-[10px] font-mono text-slate-400">
                Host: <strong className="text-white">{activeFeed.hostNick}</strong> · {activeFeed.bitrateMbps} Mbps
              </div>
              <button
                type="button"
                onClick={() => handlePublishDispatch('published', activeFeed)}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Push Feed to {selectedProfile?.nick}&apos;s Socials</span>
              </button>
            </div>
          </div>

          {/* 4 Live Feed Cards Selector */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {liveFeeds.map((feed) => {
              const isSelected = feed.id === activeFeed.id;
              return (
                <div
                  key={feed.id}
                  onClick={() => setActiveFeedId(feed.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-400/60 shadow-lg'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                        {feed.category}
                      </span>
                      <span className="text-emerald-400 font-bold tabular-nums">
                        {feed.viewers.toLocaleString()} live
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">{feed.title}</h4>
                    <div className="text-[10px] font-mono text-cyan-300 truncate">{feed.feedUrl}</div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                    <span className="truncate">{feed.ingestNode}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttachedFeedId(feed.id);
                        setActiveFeedId(feed.id);
                        handlePublishDispatch('published', feed);
                      }}
                      className="text-amber-300 hover:text-amber-200 font-bold shrink-0 cursor-pointer"
                    >
                      Syndicate →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================
          3. PER-USER SOCIAL MEDIA CONTROL PANEL (ROSTER + ACCOUNTS + COMPOSER)
          ================================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Users Roster */}
        <div className="xl:col-span-4 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>User Social Roster ({filteredProfiles.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddUser((v) => !v)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          </div>

          {showAddUser && (
            <form
              onSubmit={handleAddUser}
              className="p-3 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-2.5 text-xs"
            >
              <div className="font-mono font-bold text-indigo-300 text-[11px]">
                New User Social Control Profile
              </div>
              <input
                type="text"
                required
                value={newUserNick}
                onChange={(e) => setNewUserNick(e.target.value)}
                placeholder="IRC Nick / Handle (e.g. Justice_Gorsuch)"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500"
              />
              <input
                type="text"
                value={newUserDisplayName}
                onChange={(e) => setNewUserDisplayName(e.target.value)}
                placeholder="Display Name"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  placeholder="Role"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                />
                <select
                  value={newUserGroup}
                  onChange={(e) => setNewUserGroup(e.target.value as UserSocialProfile['group'])}
                  className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                >
                  <option value="WittLaw Admins">WittLaw Admins</option>
                  <option value="SCOTUS Bench">SCOTUS Bench</option>
                  <option value="Broadcast & DJs">Broadcast &amp; DJs</option>
                  <option value="Network Ops">Network Ops</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-indigo-500 hover:bg-indigo-400 text-white font-bold cursor-pointer"
                >
                  Create Panel
                </button>
              </div>
            </form>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user nick or @social handle..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['All', 'WittLaw Admins', 'SCOTUS Bench', 'Broadcast & DJs', 'Network Ops'].map((grp) => (
              <button
                key={grp}
                type="button"
                onClick={() => setGroupFilter(grp)}
                className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition cursor-pointer ${
                  groupFilter === grp
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredProfiles.map((profile) => {
              const isSelected = selectedProfile?.userId === profile.userId;
              const activeCount = profile.accounts.filter((a) => a.connected).length;
              return (
                <button
                  key={profile.userId}
                  type="button"
                  onClick={() => setSelectedUserId(profile.userId)}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-400/70 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">{profile.displayName}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold shrink-0">
                      {activeCount}/{profile.accounts.length} Active
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-indigo-300 truncate mt-0.5">
                    {profile.nick} · {profile.group}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {profile.accounts.map((acc) => {
                      const meta = SOCIAL_PLATFORM_META[acc.platform];
                      return (
                        <span
                          key={acc.id}
                          className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold border ${
                            acc.connected
                              ? meta.accentClass
                              : 'bg-slate-900 text-slate-500 border-slate-800'
                          }`}
                        >
                          {meta.badge}
                        </span>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected User Control Panel + Cross-Post Composer + Dispatch History */}
        {selectedProfile && (
          <div className="xl:col-span-8 space-y-5">
            {/* User Header & Master Auto-Relay Switch */}
            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-white">{selectedProfile.displayName}</h3>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold">
                      {selectedProfile.nick}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-mono">
                      {selectedProfile.hostmask}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{selectedProfile.bio}</p>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {selectedProfile.role} · {selectedProfile.organization}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleToggleMasterRelay}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                      selectedProfile.masterAutoRelay
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>
                      Auto-Relay drfun1media.com: {selectedProfile.masterAutoRelay ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddSocial((v) => !v)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Connect Social</span>
                  </button>
                </div>
              </div>

              {/* Add Social Form */}
              {showAddSocial && (
                <form
                  onSubmit={handleAddSocialAccount}
                  className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 text-xs"
                >
                  <select
                    value={newSocialPlatform}
                    onChange={(e) => setNewSocialPlatform(e.target.value as SocialPlatform)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                  >
                    {(Object.keys(SOCIAL_PLATFORM_META) as SocialPlatform[]).map((plat) => (
                      <option key={plat} value={plat}>
                        {SOCIAL_PLATFORM_META[plat].label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={newSocialHandle}
                    onChange={(e) => setNewSocialHandle(e.target.value)}
                    placeholder="Handle (e.g. @DrFun1Official)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer"
                    >
                      Save Social
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddSocial(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Connected Social Accounts Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedProfile.accounts.map((acc) => {
                  const meta = SOCIAL_PLATFORM_META[acc.platform];
                  const isEditing = editingAccountId === acc.id;
                  return (
                    <div
                      key={acc.id}
                      className={`p-3.5 rounded-xl border space-y-2.5 transition ${
                        acc.connected
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-950/50 border-slate-800/60 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${meta.accentClass}`}
                          >
                            {meta.badge}
                          </span>
                          <span className="text-xs font-bold text-white truncate">{meta.label}</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400 font-bold tabular-nums shrink-0">
                          {acc.followers.toLocaleString()} followers
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingHandleValue}
                            onChange={(e) => setEditingHandleValue(e.target.value)}
                            className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-cyan-500/50 text-xs text-white font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditedHandle(acc.id)}
                            className="px-2.5 py-1 rounded bg-cyan-500 text-slate-950 text-xs font-bold cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 text-xs font-mono">
                          <a
                            href={acc.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 hover:underline flex items-center gap-1 truncate"
                          >
                            <Link2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{acc.handle}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAccountId(acc.id);
                              setEditingHandleValue(acc.handle);
                            }}
                            className="text-[10px] text-slate-400 hover:text-white cursor-pointer shrink-0"
                          >
                            Edit Handle
                          </button>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleAccountConnection(acc.id)}
                            className={`px-2 py-1 rounded border font-bold cursor-pointer ${
                              acc.connected
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                : 'bg-slate-900 text-slate-400 border-slate-700'
                            }`}
                          >
                            {acc.connected ? 'Connected' : 'Paused'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleAccountAutoSync(acc.id)}
                            className={`px-2 py-1 rounded border font-bold cursor-pointer ${
                              acc.autoSyncLiveFeed
                                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                                : 'bg-slate-900 text-slate-400 border-slate-700'
                            }`}
                          >
                            Live Sync: {acc.autoSyncLiveFeed ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500">
                          <span>{acc.lastSyncedAt}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAccount(acc.id)}
                            className="text-slate-500 hover:text-rose-400 cursor-pointer"
                            title="Disconnect and remove handle"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cross-Platform Social Post & Live Feed Dispatch */}
            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-cyan-400" />
                  <span>Broadcast to {selectedProfile.nick}&apos;s Connected Socials</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  Attach www.drfun1media.com live stream URL
                </span>
              </div>

              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  placeholder={`Write a status update or leave blank to syndicate the selected www.drfun1media.com live feed for ${selectedProfile.nick}...`}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  <select
                    value={attachedFeedId}
                    onChange={(e) => setAttachedFeedId(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-200 font-mono"
                  >
                    {liveFeeds.map((f) => (
                      <option key={f.id} value={f.id}>
                        Attach Live Feed: {f.title}
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedProfile.accounts
                      .filter((a) => a.connected)
                      .map((acc) => {
                        const meta = SOCIAL_PLATFORM_META[acc.platform];
                        const isPicked = selectedPlatforms.includes(acc.platform);
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() =>
                              setSelectedPlatforms((prev) =>
                                prev.includes(acc.platform)
                                  ? prev.filter((p) => p !== acc.platform)
                                  : [...prev, acc.platform]
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition cursor-pointer ${
                              isPicked
                                ? meta.accentClass
                                : 'bg-slate-950 text-slate-500 border-slate-800'
                            }`}
                          >
                            {isPicked ? '✓ ' : ''}
                            {meta.badge} ({acc.handle})
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handlePublishDispatch('scheduled')}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Schedule +15m
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePublishDispatch('published')}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Now</span>
                  </button>
                </div>
              </div>

              {/* Recent Social Syndication Dispatches */}
              <div className="pt-3 border-t border-slate-800 space-y-2.5">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Recent User Social &amp; drfun1media.com Live Feed Dispatches ({posts.length})</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-300">{post.userNick}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                              post.status === 'published'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {post.status}
                          </span>
                          <span className="text-slate-500">{post.timestamp}</span>
                        </div>
                        <span className="text-cyan-300 tabular-nums">
                          Est. Reach: {post.reachEstimate.toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap gap-1">
                          {post.platforms.map((pl) => (
                            <span
                              key={pl}
                              className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold border ${SOCIAL_PLATFORM_META[pl].accentClass}`}
                            >
                              {SOCIAL_PLATFORM_META[pl].badge}
                            </span>
                          ))}
                        </div>
                        {post.attachedFeedTitle && (
                          <span className="text-[10px] font-mono text-slate-400 truncate max-w-xs">
                            Feed: {post.attachedFeedTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
