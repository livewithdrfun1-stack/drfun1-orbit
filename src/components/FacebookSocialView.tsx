import React, { useState, useEffect } from 'react';
import { 
  SocialPost, 
  SocialStory, 
  SocialCommunity, 
  SocialUser, 
  ReactionType 
} from '../types/social';
import { 
  CURRENT_USER, 
  INITIAL_STORIES, 
  INITIAL_POSTS, 
  INITIAL_COMMUNITIES, 
  ONLINE_CONTACTS 
} from '../data/socialData';
import { 
  ThumbsUp, 
  Heart, 
  Smile, 
  Share2, 
  MessageCircle, 
  Image as ImageIcon, 
  Radio, 
  Satellite, 
  ShieldCheck, 
  Server, 
  Terminal, 
  Globe, 
  Plus, 
  Search, 
  Bell, 
  Users, 
  Home, 
  Tv, 
  ShoppingBag, 
  MoreHorizontal, 
  Check, 
  Send, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  X as CloseIcon,
  Bookmark,
  MessageSquare,
  TrendingUp,
  Hash,
  Video,
  Network,
  CheckCircle2
} from 'lucide-react';

interface FacebookSocialViewProps {
  onOpenLicense: () => void;
  onOpenSwitchMesh: () => void;
  onOpenSwitchWittServices?: () => void;
  onNavigateToStore?: () => void;
  onNavigateToStudio?: () => void;
  onNavigateToMedia?: () => void;
  onNavigateToIrc?: () => void;
}

const STORAGE_KEY_SOCIAL_POSTS = 'drfun1_social_posts';

export const FacebookSocialView: React.FC<FacebookSocialViewProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onOpenSwitchWittServices,
  onNavigateToStore,
  onNavigateToStudio,
  onNavigateToMedia,
  onNavigateToIrc,
}) => {
  // Posts state initialized with persistence
  const [posts, setPosts] = useState<SocialPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOCIAL_POSTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load social posts', e);
    }
    return INITIAL_POSTS;
  });

  const [stories, setStories] = useState<SocialStory[]>(INITIAL_STORIES);
  const [communities, setCommunities] = useState<SocialCommunity[]>(INITIAL_COMMUNITIES);
  const [activeStory, setActiveStory] = useState<SocialStory | null>(null);

  // Direct Messaging / Chat State
  const [activeChatContact, setActiveChatContact] = useState<SocialUser | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, { id: string; sender: string; text: string; time: string; isSelf: boolean }[]>>({
    c_user_2: [
      { id: 'm1', sender: 'Switch Las Vegas NOC', text: 'Telemetry uplink online at 100G. Core latency 1.4ms to SUPERNAP 8.', time: '10:15 AM', isSelf: false },
      { id: 'm2', sender: 'Richard Alan Witt', text: 'Confirmed. Linking DrFun1 multi-transponder broadcast now.', time: '10:18 AM', isSelf: true },
    ],
    c_user_7: [
      { id: 'm3', sender: 'Twitch Dev Stream Desk', text: 'dev.twitch.tv webhook ingest verified for DrFun1TV channel broadcast.', time: '11:02 AM', isSelf: false },
    ],
    c_user_8: [
      { id: 'm4', sender: 'Kick Creator Relay NOC', text: 'dev.kick.com RTMP edge stream active. Ultra-low latency mode enabled.', time: '11:05 AM', isSelf: false },
    ],
  });
  const [chatInputText, setChatInputText] = useState('');

  // Syndication targets for new post
  const [syndicateTargets, setSyndicateTargets] = useState<Record<string, boolean>>({
    'SpaceBook': true,
    'X/Twitter': true,
    'Twitch': true,
    'Kick': true,
    'IRC #social': true,
  });

  // New Post Form State
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostSatelliteTag, setNewPostSatelliteTag] = useState<string>('');
  const [newPostPrivacy, setNewPostPrivacy] = useState<SocialPost['privacy']>('public');
  const [showImagePrompt, setShowImagePrompt] = useState<boolean>(false);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [feedFilter, setFeedFilter] = useState<'all' | 'creators' | 'operators' | 'switch_noc' | 'legal'>('all');

  // Comment input state per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeReactionPostId, setActiveReactionPostId] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Save posts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOCIAL_POSTS, JSON.stringify(posts));
    } catch (e) {
      console.error('Failed to save social posts', e);
    }
  }, [posts]);

  // Create new post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const activeSyndications = Object.entries(syndicateTargets)
      .filter(([_, active]) => active)
      .map(([name]) => name);

    const newPost: SocialPost = {
      id: `post_${Date.now()}`,
      author: CURRENT_USER,
      timestamp: 'Just now',
      content: newPostContent.trim(),
      mediaUrl: customImageUrl.trim() || undefined,
      mediaType: customImageUrl.trim() ? 'image' : undefined,
      mediaCaption: customImageUrl.trim() ? 'Telemetry Upload via Switch SUPERNAP 100G' : undefined,
      satelliteTag: newPostSatelliteTag.trim() || 'DrFun1 SpaceBook Network',
      groundStation: 'Switch Las Vegas Teleport Gateway',
      reactions: {
        like: 1,
        love: 1,
        care: 0,
        launch: 1,
        satcom: 1,
        insight: 0,
      },
      userReaction: 'like',
      comments: [],
      shares: 0,
      privacy: newPostPrivacy,
      syndication: activeSyndications,
      channel: feedFilter === 'all' ? 'creators' : feedFilter,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setNewPostSatelliteTag('');
    setCustomImageUrl('');
    setShowImagePrompt(false);
  };

  // Direct Message send
  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChatContact || !chatInputText.trim()) return;

    const contactId = activeChatContact.id;
    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: CURRENT_USER.name,
      text: chatInputText.trim(),
      time: 'Just now',
      isSelf: true,
    };

    setChatMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), userMsg],
    }));
    const sentText = chatInputText.trim();
    setChatInputText('');

    // Simulate instant auto-reply after 800ms
    setTimeout(() => {
      let replyText = `Acknowledged from ${activeChatContact.name}. Teleport & mesh telemetry link operational.`;
      if (activeChatContact.handle.includes('twitch')) {
        replyText = `Twitch Dev API confirmed receipt: "${sentText}". Stream sync state OK at dev.twitch.tv.`;
      } else if (activeChatContact.handle.includes('kick')) {
        replyText = `Kick Relay NOC processed: "${sentText}". RTMP ingest bitrate stable on dev.kick.com.`;
      } else if (activeChatContact.handle.includes('switch')) {
        replyText = `Switch SUPERNAP Teleport: Signal verified at -47.8 dBm. Fiber cross-connect routing 100G.`;
      }
      const replyMsg = {
        id: `reply_${Date.now()}`,
        sender: activeChatContact.name,
        text: replyText,
        time: 'Just now',
        isSelf: false,
      };
      setChatMessages(prev => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), replyMsg],
      }));
    }, 900);
  };

  // Reactions Handler
  const handleReaction = (postId: string, reaction: ReactionType) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const prevUserReaction = p.userReaction;
          const nextReactions = { ...p.reactions };

          // If clicking same reaction, toggle off
          if (prevUserReaction === reaction) {
            nextReactions[reaction] = Math.max(0, nextReactions[reaction] - 1);
            return {
              ...p,
              reactions: nextReactions,
              userReaction: null,
            };
          }

          // If was reacting with something else, decrement old
          if (prevUserReaction) {
            nextReactions[prevUserReaction] = Math.max(0, nextReactions[prevUserReaction] - 1);
          }

          // Increment new
          nextReactions[reaction] = (nextReactions[reaction] || 0) + 1;

          return {
            ...p,
            reactions: nextReactions,
            userReaction: reaction,
          };
        }
        return p;
      })
    );
    setActiveReactionPostId(null);
  };

  // Comments Handler
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const newComment = {
            id: `comm_${Date.now()}`,
            author: CURRENT_USER,
            content: text,
            timestamp: 'Just now',
            likes: 0,
          };
          return {
            ...p,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  // Share handler
  const handleShare = (postId: string) => {
    navigator.clipboard.writeText(`https://orbit.drfun1.com/social/post/${postId}`);
    setShareToast('Link copied to clipboard! (Relayed to UnrealIRCd #social)');
    setTimeout(() => setShareToast(null), 3000);

    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, shares: p.shares + 1 } : p))
    );
  };

  const getReactionTotal = (reactions: SocialPost['reactions']) => {
    return Object.values(reactions).reduce((a, b) => a + b, 0);
  };

  const filteredPosts = posts.filter(post => {
    if (feedFilter === 'all') return true;
    if (feedFilter === 'creators') {
      return (
        post.channel === 'creators' ||
        post.satelliteTag?.toLowerCase().includes('stream') ||
        post.satelliteTag?.toLowerCase().includes('drfun1tv') ||
        post.content.toLowerCase().includes('twitch') ||
        post.content.toLowerCase().includes('kick') ||
        post.content.toLowerCase().includes('broadcast') ||
        (post.syndication && (post.syndication.includes('Twitch') || post.syndication.includes('Kick')))
      );
    }
    if (feedFilter === 'operators') {
      return (
        post.channel === 'operators' ||
        post.satelliteTag?.toLowerCase().includes('starlink') ||
        post.satelliteTag?.toLowerCase().includes('ses') ||
        post.satelliteTag?.toLowerCase().includes('eutelsat') ||
        post.satelliteTag?.toLowerCase().includes('leo') ||
        post.satelliteTag?.toLowerCase().includes('meo') ||
        post.satelliteTag?.toLowerCase().includes('geo')
      );
    }
    if (feedFilter === 'switch_noc') {
      return (
        post.channel === 'switch_noc' ||
        post.content.toLowerCase().includes('switch') ||
        post.groundStation?.toLowerCase().includes('switch') ||
        post.content.toLowerCase().includes('supernap') ||
        post.content.toLowerCase().includes('fiber')
      );
    }
    if (feedFilter === 'legal') {
      return (
        post.channel === 'legal' ||
        post.content.toLowerCase().includes('witt') ||
        post.content.toLowerCase().includes('frn') ||
        post.content.toLowerCase().includes('fcc') ||
        post.content.toLowerCase().includes('itu') ||
        post.content.toLowerCase().includes('escrow')
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* SpaceBook App Bar (Iconic Rebranded Facebook Navigation) */}
      <div className="sticky top-16 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Left */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-2xl text-white shadow-md shadow-blue-900/50">
              f
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base hidden sm:inline">
                DrFun1 <span className="text-blue-500">SpaceBook</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono hidden md:block">
                Satcom &amp; Teleport Social Network
              </p>
            </div>
          </div>

          {/* Center SpaceBook View Icons & Multi-Channel Filter */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFeedFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                feedFilter === 'all'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>All Feeds</span>
            </button>

            <button
              onClick={() => setFeedFilter('creators')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                feedFilter === 'creators'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
              title="Twitch, Kick & DrFun1TV Broadcasters"
            >
              <Video className="w-4 h-4 text-purple-400" />
              <span>Streamers &amp; Creators</span>
            </button>

            <button
              onClick={() => setFeedFilter('operators')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                feedFilter === 'operators'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Satellite className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Constellations</span>
            </button>

            <button
              onClick={() => setFeedFilter('switch_noc')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                feedFilter === 'switch_noc'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Switch NOC</span>
            </button>

            <button
              onClick={() => setFeedFilter('legal')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                feedFilter === 'legal'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Witt Law</span>
            </button>
          </div>

          {/* Right Action & User Bar */}
          <div className="flex items-center gap-2">
            {/* Quick Link to DrFun1TV & Studio */}
            {(onNavigateToMedia || onNavigateToStudio) && (
              <button
                onClick={() => (onNavigateToMedia ? onNavigateToMedia() : onNavigateToStudio?.())}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-purple-950/60 text-purple-300 hover:text-white hover:bg-purple-900 border border-purple-500/40 transition-colors shadow-sm hidden md:flex cursor-pointer"
                title="Launch DrFun1TV Master Studio"
              >
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                <span>DrFun1TV Studio</span>
              </button>
            )}

            {/* Quick Link to Switch & Witt Services */}
            {onOpenSwitchWittServices && (
              <button
                onClick={onOpenSwitchWittServices}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-emerald-950/60 text-emerald-300 hover:text-white hover:bg-emerald-900 border border-emerald-500/40 transition-colors shadow-sm hidden lg:flex cursor-pointer"
                title="Open Switch & Witt Satellite Fiber Services"
              >
                <Network className="w-3.5 h-3.5 text-emerald-400" />
                <span>Switch &amp; Witt Fiber</span>
              </button>
            )}

            {/* Messenger Quick Trigger */}
            <button
              onClick={() => {
                const onlineContact = ONLINE_CONTACTS.find(c => c.isOnline) || ONLINE_CONTACTS[0];
                setActiveChatContact(onlineContact);
              }}
              className="p-2 rounded-full bg-slate-800 hover:bg-blue-600/30 text-slate-300 hover:text-blue-300 transition-colors relative cursor-pointer"
              title="Open Direct Messages & Messenger"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-900" />
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={CURRENT_USER.avatar}
                alt={CURRENT_USER.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/50"
              />
              <div className="text-left leading-tight hidden xl:block">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Richard Alan Witt</span>
                  <span className="text-[10px] text-blue-400">✓</span>
                </div>
                <div className="text-[10px] text-slate-400">wittlawfirm.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <Check className="w-4 h-4" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* 3-Column Layout: Left Sidebar, Main Feed, Right Contacts */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar (3 cols on lg) */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          {/* User Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={CURRENT_USER.avatar}
                alt={CURRENT_USER.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500"
              />
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1">
                  <span>{CURRENT_USER.name}</span>
                  <span className="text-xs text-blue-400 font-bold">✓</span>
                </h3>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  {CURRENT_USER.role}
                </p>
                <p className="text-[10px] text-sky-400 mt-0.5 font-mono">
                  {CURRENT_USER.organization}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1 text-xs">
              <button
                onClick={onOpenLicense}
                className="w-full text-left px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>The Law Office of Richard A. Witt LLC</span>
              </button>
              <button
                onClick={onOpenSwitchMesh}
                className="w-full text-left px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Switch Teleport Network</span>
              </button>
            </div>
          </div>

          {/* Space Communities & Groups */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              Satcom Communities
            </h4>
            <div className="space-y-2">
              {communities.map(comm => (
                <div
                  key={comm.id}
                  className="p-2 rounded-lg hover:bg-slate-800/80 transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${comm.bannerGradient} flex items-center justify-center text-white shrink-0 shadow`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {comm.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {comm.membersCount.toLocaleString()} engineers
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Legal & License Notice */}
          <div className="text-[11px] text-slate-500 leading-relaxed px-1">
            <p>
              DrFun1 Orbit SpaceBook © 2026. Licensed to Richard Alan Witt.
            </p>
            <p className="mt-1">
              Affiliated with <a href="https://www.wittlawfirm.com" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">wittlawfirm.com</a> and <a href="https://www.owenscompany.com" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">owenscompany.com</a>.
            </p>
          </div>
        </div>

        {/* Center Main Feed (6 cols on lg) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Stories Carousel (Iconic Facebook Stories) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 overflow-hidden shadow-sm">
            <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              {/* Create Story Card */}
              <div 
                onClick={() => {
                  setNewPostContent('📡 Broadcasting high-resolution ground station telemetry from Switch SUPERNAP Las Vegas!');
                  setShowImagePrompt(true);
                }}
                className="w-28 h-44 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 transition-colors shrink-0 relative flex flex-col justify-between overflow-hidden cursor-pointer group"
              >
                <img
                  src={CURRENT_USER.avatar}
                  alt="Current User"
                  className="h-28 w-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-24 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-white shadow">
                  <Plus className="w-4 h-4 font-bold" />
                </div>
                <div className="p-2 text-center">
                  <span className="text-[11px] font-bold text-slate-200 leading-tight block">
                    Post Story
                  </span>
                </div>
              </div>

              {/* Story Cards */}
              {stories.map(story => (
                <div
                  key={story.id}
                  onClick={() => setActiveStory(story)}
                  className="w-28 h-44 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-400 transition-all shrink-0 relative overflow-hidden cursor-pointer group shadow-sm"
                >
                  <img
                    src={story.mediaUrl}
                    alt={story.caption}
                    className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />

                  {/* Story Author Avatar with Ring */}
                  <div className="absolute top-2.5 left-2.5">
                    <img
                      src={story.author.avatar}
                      alt={story.author.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500 shadow"
                    />
                  </div>

                  {/* Story Caption / Author Name */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-[11px] font-bold text-white truncate">
                      {story.author.name}
                    </p>
                    <p className="text-[9px] text-slate-300 truncate">
                      {story.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Post Box ("What's on your mind, Richard?") */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex gap-3">
              <img
                src={CURRENT_USER.avatar}
                alt={CURRENT_USER.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700"
              />
              <div className="flex-1">
                <textarea
                  rows={2}
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  placeholder="What's happening in orbit or at your ground teleport, Richard?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />

                {showImagePrompt && (
                  <div className="mt-2 space-y-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <input
                      type="text"
                      placeholder="Paste Image URL or Teleport Screenshot URL..."
                      value={customImageUrl}
                      onChange={e => setCustomImageUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white placeholder-slate-500"
                    />
                    <input
                      type="text"
                      placeholder="Satellite / Mission Tag (e.g., Starlink V2, Switch Teleport, SES O3b)..."
                      value={newPostSatelliteTag}
                      onChange={e => setNewPostSatelliteTag(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                )}

                {/* Multi-Platform Syndication Checkboxes */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Share2 className="w-3 h-3 text-sky-400" />
                      <span>Syndicate Post To:</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Simultaneous Broadcast</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(syndicateTargets).map(([target, enabled]) => (
                      <button
                        key={target}
                        type="button"
                        onClick={() => setSyndicateTargets(prev => ({ ...prev, [target]: !prev[target] }))}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                          enabled
                            ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 font-bold'
                            : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-blue-400' : 'bg-slate-600'}`} />
                        <span>{target}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowImagePrompt(!showImagePrompt)}
                      className="p-1.5 px-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">Photo/Media</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewPostContent(prev => prev + ' 📡 Live Switch SUPERNAP Teleport uplink')}
                      className="p-1.5 px-2 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      <Server className="w-4 h-4 text-sky-400" />
                      <span className="hidden sm:inline">Switch NOC</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewPostContent(prev => prev + ' 🚀 Orbital Pass confirmed')}
                      className="p-1.5 px-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      <Satellite className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline">Sat Tag</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-md shadow-blue-900/30 cursor-pointer"
                  >
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Post Feed */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">No posts in this channel filter</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  There are no updates tagged under the selected channel. View All Feeds to see live broadcasts, constellations, and teleport posts.
                </p>
                <button
                  onClick={() => setFeedFilter('all')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Show All Feeds
                </button>
              </div>
            ) : (
              filteredPosts.map(post => {
                const userReact = post.userReaction;
                const totalReactions = getReactionTotal(post.reactions);

                return (
                  <div
                    key={post.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden"
                  >
                    {/* Post Header */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">
                              {post.author.name}
                            </span>
                            {post.author.verified && (
                              <span className="text-blue-400 text-xs font-bold">✓</span>
                            )}
                            {post.pinned && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">
                                PINNED
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{post.timestamp}</span>
                            <span>•</span>
                            <span>{post.author.role}</span>
                          </div>
                        </div>
                      </div>

                      <button className="text-slate-500 hover:text-slate-300 p-1">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Post Content */}
                    <div className="px-4 pb-3">
                      <p className="text-xs sm:text-[13px] text-slate-200 whitespace-pre-line leading-relaxed">
                        {post.content}
                      </p>

                      {/* Syndication Targets */}
                      {post.syndication && post.syndication.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1">
                          <span className="text-[9px] font-mono text-slate-500">Syndicated to:</span>
                          {post.syndication.map(t => (
                            <span
                              key={t}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950/50 text-blue-300 border border-blue-500/30 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5 text-blue-400" />
                              <span>{t}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Metadata tags */}
                      {(post.satelliteTag || post.groundStation) && (
                        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-mono">
                          {post.satelliteTag && (
                            <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 flex items-center gap-1">
                              <Satellite className="w-3 h-3" />
                              {post.satelliteTag}
                            </span>
                          )}
                          {post.groundStation && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                              <Server className="w-3 h-3" />
                              {post.groundStation}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                  {/* Post Media (Image) */}
                  {post.mediaUrl && (
                    <div className="relative border-y border-slate-800 bg-slate-950">
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full max-h-96 object-cover"
                      />
                      {post.mediaCaption && (
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur p-2 text-[11px] text-slate-300 flex items-center justify-between">
                          <span>{post.mediaCaption}</span>
                          <span className="text-sky-400 font-mono text-[10px]">Switch SUPERNAP 100G</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reaction & Comments Stats Row */}
                  <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1">
                        <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white">👍</span>
                        <span className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[10px] text-white">❤️</span>
                        <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[10px] text-white">🚀</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-300">
                        {totalReactions.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      <span>{post.comments.length} comments</span>
                      <span>{post.shares} shares</span>
                    </div>
                  </div>

                  {/* Reaction Action Buttons (Iconic Facebook Like Bar) */}
                  <div className="px-2 py-1 flex items-center justify-between relative border-b border-slate-800">
                    {/* Reaction trigger */}
                    <div
                      className="relative flex-1"
                      onMouseEnter={() => setActiveReactionPostId(post.id)}
                      onMouseLeave={() => setActiveReactionPostId(null)}
                    >
                      <button
                        onClick={() => handleReaction(post.id, userReact || 'like')}
                        className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          userReact
                            ? 'text-blue-400 bg-blue-500/10'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>
                          {userReact ? userReact.toUpperCase() : 'Like'}
                        </span>
                      </button>

                      {/* Floating Reaction Bar (Facebook Style Hover Modal) */}
                      {activeReactionPostId === post.id && (
                        <div className="absolute -top-10 left-2 z-30 bg-slate-900 border border-slate-700 px-2 py-1 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => handleReaction(post.id, 'like')}
                            title="Like"
                            className="hover:scale-125 transition-transform text-lg"
                          >
                            👍
                          </button>
                          <button
                            onClick={() => handleReaction(post.id, 'love')}
                            title="Love"
                            className="hover:scale-125 transition-transform text-lg"
                          >
                            ❤️
                          </button>
                          <button
                            onClick={() => handleReaction(post.id, 'launch')}
                            title="Launch / Space"
                            className="hover:scale-125 transition-transform text-lg"
                          >
                            🚀
                          </button>
                          <button
                            onClick={() => handleReaction(post.id, 'satcom')}
                            title="Satcom"
                            className="hover:scale-125 transition-transform text-lg"
                          >
                            🛰️
                          </button>
                          <button
                            onClick={() => handleReaction(post.id, 'care')}
                            title="Care"
                            className="hover:scale-125 transition-transform text-lg"
                          >
                            🤗
                          </button>
                          <button
                            onClick={() => handleReaction(post.id, 'insight')}
                            title="Insightful"
                            className="hover:scale-125 transition-transform text-lg"
                          >
                            💡
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        const elem = document.getElementById(`comment_input_${post.id}`);
                        elem?.focus();
                      }}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Comment</span>
                    </button>

                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comment Thread */}
                  <div className="p-4 bg-slate-950/50 space-y-3">
                    {/* Existing Comments */}
                    {post.comments.map(comment => (
                      <div key={comment.id} className="flex gap-2.5 text-xs">
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                        />
                        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-[11px]">
                              {comment.author.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {comment.timestamp}
                            </span>
                          </div>
                          <p className="text-slate-300 mt-1 leading-relaxed text-[12px]">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Comment Input */}
                    <div className="flex gap-2 pt-1">
                      <img
                        src={CURRENT_USER.avatar}
                        alt={CURRENT_USER.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 flex gap-1.5">
                        <input
                          id={`comment_input_${post.id}`}
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={e =>
                            setCommentInputs(prev => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleAddComment(post.id);
                            }
                          }}
                          placeholder="Write a comment on this teleport feed..."
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>

        {/* Right Sidebar (3 cols on lg): Online Contacts, Trending & Gateway Status */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          {/* Trending on DrFun1 Social Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                <span>Trending Topics</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-500">Global SATCOM</span>
            </div>

            <div className="space-y-2">
              {[
                { tag: '#Switch100GSuperLoop', count: '4.8k posts', category: 'Fiber & Datacenter' },
                { tag: '#TwitchKickBroadcast', count: '3.2k posts', category: 'MultiStream Live' },
                { tag: '#WittLawEscrow', count: '1.9k posts', category: 'Spectrum Legal' },
                { tag: '#DirectToCellular3GPP', count: '8.4k posts', category: 'LEO Satcom' },
                { tag: '#UnrealIRCdLeafMesh', count: '1.5k posts', category: 'Chat Telemetry' },
              ].map(item => (
                <div
                  key={item.tag}
                  onClick={() => {
                    setNewPostContent(prev => (prev ? `${prev} ${item.tag}` : item.tag));
                  }}
                  className="p-2 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors flex items-center gap-1">
                      <Hash className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
                      <span>{item.tag.slice(1)}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{item.count}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{item.category}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Platform Syndication Gateways Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Syndication Gateways</span>
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-slate-200 font-sans font-semibold">DrFun1 SpaceBook</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">CORE ONLINE</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-slate-200 font-sans font-semibold">dev.twitch.tv</span>
                </div>
                <span className="text-[10px] text-purple-400">INGEST READY</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-200 font-sans font-semibold">dev.kick.com</span>
                </div>
                <span className="text-[10px] text-emerald-400">RTMP ACTIVE</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span className="text-slate-200 font-sans font-semibold">UnrealIRCd #social</span>
                </div>
                <span className="text-[10px] text-sky-400">LEAF BRIDGED</span>
              </div>
            </div>
          </div>

          {/* Sponsored Enterprise Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
              Sponsored SATCOM Interconnect
            </span>

            <div className="rounded-lg overflow-hidden border border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80"
                alt="Switch Supernap"
                className="w-full h-24 object-cover"
              />
              <div className="p-2.5 bg-slate-950">
                <h5 className="text-xs font-bold text-white">Switch SUPERNAP Teleport</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tier 5 Platinum Earth Stations in Las Vegas &amp; Tahoe Reno. 100% Green Energy.
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <a
                    href="https://www.switch.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>switch.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {onNavigateToStore && (
                    <button
                      onClick={onNavigateToStore}
                      className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono"
                    >
                      Order Colocation
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Contacts & Direct Messages */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Contacts Online ({ONLINE_CONTACTS.filter(c => c.isOnline).length})</span>
              </h4>
              <button
                onClick={onOpenSwitchMesh}
                className="text-[10px] text-sky-400 hover:underline font-mono cursor-pointer"
              >
                IRC Mesh
              </button>
            </div>

            <div className="space-y-1">
              {ONLINE_CONTACTS.map(contact => (
                <div
                  key={contact.id}
                  onClick={() => setActiveChatContact(contact)}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer group ${
                    activeChatContact?.id === contact.id
                      ? 'bg-blue-600/20 border border-blue-500/40'
                      : 'hover:bg-slate-800/80 border border-transparent'
                  }`}
                  title="Click to open Direct Message"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 truncate">
                        {contact.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate font-mono">
                        {contact.organization}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-blue-600 transition-colors">
                    Chat
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Direct Messaging Chat Modal / Drawer */}
      {activeChatContact && (
        <div className="fixed bottom-4 right-4 sm:right-6 z-50 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          {/* Chat Header */}
          <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={activeChatContact.avatar}
                  alt={activeChatContact.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/60"
                />
                {activeChatContact.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                )}
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-white truncate flex items-center gap-1">
                  <span>{activeChatContact.name}</span>
                  {activeChatContact.verified && (
                    <span className="text-blue-400 text-[10px]">✓</span>
                  )}
                </h5>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  {activeChatContact.role} · {activeChatContact.organization}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveChatContact(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="h-64 overflow-y-auto p-3 space-y-2.5 bg-slate-950/70 text-xs">
            {/* Encryption & Relay Header */}
            <div className="text-center py-1">
              <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                🔒 End-to-end relayed via Switch SUPERNAP 100G &amp; UnrealIRCd
              </span>
            </div>

            {(chatMessages[activeChatContact.id] || [
              {
                id: 'welcome',
                sender: activeChatContact.name,
                text: `Hello Richard, this is ${activeChatContact.name} at ${activeChatContact.organization}. How can we assist with your SATCOM telemetry or broadcast stream today?`,
                time: 'Just now',
                isSelf: false,
              }
            ]).map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.isSelf
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-0.5 px-1">
                  {msg.time}
                </span>
              </div>
            ))}
          </div>

          {/* Chat Input Footer */}
          <form
            onSubmit={handleSendChatMessage}
            className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInputText}
              onChange={e => setChatInputText(e.target.value)}
              placeholder={`Message ${activeChatContact.name}...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!chatInputText.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Story Progress Bar */}
            <div className="absolute top-3 inset-x-3 z-20 flex gap-1">
              <div className="h-1 flex-1 bg-white rounded-full animate-pulse" />
            </div>

            {/* Story Header */}
            <div className="absolute top-6 inset-x-3 z-20 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <img
                  src={activeStory.author.avatar}
                  alt={activeStory.author.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500"
                />
                <div>
                  <p className="text-xs font-bold leading-tight">{activeStory.author.name}</p>
                  <p className="text-[10px] text-slate-300">{activeStory.timestamp}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveStory(null)}
                className="w-7 h-7 rounded-full bg-slate-950/60 backdrop-blur flex items-center justify-center text-slate-300 hover:text-white"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Story Media */}
            <div className="h-[480px] w-full relative">
              <img
                src={activeStory.mediaUrl}
                alt="Story content"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-slate-950/40" />

              {/* Story Telemetry / Caption */}
              <div className="absolute bottom-4 inset-x-4 space-y-2">
                {activeStory.orbitTelemetry && (
                  <div className="p-2 rounded bg-slate-950/80 backdrop-blur border border-sky-500/30 text-[10px] font-mono text-sky-300">
                    {activeStory.orbitTelemetry}
                  </div>
                )}
                <p className="text-xs font-medium text-white leading-relaxed">
                  {activeStory.caption}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                  <span>SpaceBook Stories</span>
                  <span className="text-blue-400 font-mono">Switch 100G Uplink</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
