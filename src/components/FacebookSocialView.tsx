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
  Bookmark
} from 'lucide-react';

interface FacebookSocialViewProps {
  onOpenLicense: () => void;
  onOpenSwitchMesh: () => void;
  onNavigateToStore?: () => void;
  onNavigateToStudio?: () => void;
  onNavigateToIrc?: () => void;
}

const STORAGE_KEY_SOCIAL_POSTS = 'drfun1_social_posts';

export const FacebookSocialView: React.FC<FacebookSocialViewProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onNavigateToStore,
  onNavigateToStudio,
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

  // New Post Form State
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostSatelliteTag, setNewPostSatelliteTag] = useState<string>('');
  const [newPostPrivacy, setNewPostPrivacy] = useState<SocialPost['privacy']>('public');
  const [showImagePrompt, setShowImagePrompt] = useState<boolean>(false);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [feedFilter, setFeedFilter] = useState<'all' | 'operators' | 'switch_noc' | 'legal'>('all');

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
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setNewPostSatelliteTag('');
    setCustomImageUrl('');
    setShowImagePrompt(false);
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

          {/* Center SpaceBook View Icons */}
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFeedFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                feedFilter === 'all'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Feed</span>
            </button>

            <button
              onClick={() => setFeedFilter('operators')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                feedFilter === 'operators'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Satellite className="w-4 h-4" />
              <span className="hidden md:inline">Constellations</span>
            </button>

            <button
              onClick={() => setFeedFilter('switch_noc')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                feedFilter === 'switch_noc'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Switch NOC</span>
            </button>

            {onNavigateToStudio && (
              <button
                onClick={onNavigateToStudio}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-slate-400 hover:text-sky-300 transition-colors"
                title="Switch to MultiStream Live Studio"
              >
                <Radio className="w-4 h-4 text-sky-400" />
                <span className="hidden md:inline">Live Studio</span>
              </button>
            )}

            {onNavigateToStore && (
              <button
                onClick={onNavigateToStore}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-slate-400 hover:text-amber-300 transition-colors"
                title="Space Marketplace"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Marketplace</span>
              </button>
            )}

            {onNavigateToIrc && (
              <button
                onClick={onNavigateToIrc}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                title="Open RisingNet Hosted WebIRC Terminal"
              >
                <Terminal className="w-4 h-4 text-purple-400" />
                <span className="hidden md:inline">IRC Client</span>
              </button>
            )}
          </div>

          {/* Right User Bar */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={CURRENT_USER.avatar}
                alt={CURRENT_USER.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/50"
              />
              <div className="text-left leading-tight hidden lg:block">
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
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-md shadow-blue-900/30"
                  >
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Post Feed */}
          <div className="space-y-4">
            {posts.map(post => {
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
            })}
          </div>
        </div>

        {/* Right Sidebar (3 cols on lg): Online Contacts & Sponsored Ground Station Telemetry */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
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

          {/* Active Contacts & IRC Leaf Bots */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                Contacts Online ({ONLINE_CONTACTS.filter(c => c.isOnline).length})
              </h4>
              <button
                onClick={onOpenSwitchMesh}
                className="text-[10px] text-sky-400 hover:underline font-mono"
              >
                IRC Mesh
              </button>
            </div>

            <div className="space-y-2">
              {ONLINE_CONTACTS.map(contact => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
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
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                        {contact.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {contact.organization}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-sky-400">
                    {contact.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
