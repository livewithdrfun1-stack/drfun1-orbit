import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  Crown,
  Radio,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Plus,
  ThumbsUp,
  Hash,
  Send,
  Zap,
  Award,
  Layers,
  ArrowUpRight,
  Server,
  FileText,
  Search,
  Filter,
  Check,
  Clock,
  Globe,
  DollarSign,
  Download
} from 'lucide-react';
import {
  UserMembershipState,
  MembershipTierId,
  CommunityDiscussionTopic,
  CommunityChannelSpotlight,
  CommunityEvent,
  BillingCycle
} from '../types/membership';
import {
  MEMBERSHIP_PLANS,
  INITIAL_COMMUNITY_TOPICS,
  COMMUNITY_CHANNEL_SPOTLIGHTS,
  COMMUNITY_EVENTS
} from '../data/membershipData';

interface CommunityHubViewProps {
  userMembership: UserMembershipState;
  onUpdateMembership: (updated: UserMembershipState) => void;
  onOpenMembershipModal: () => void;
  onOpenHostingModal?: () => void;
  onOpenLegalCenter?: () => void;
  onOpenZncWebAdmin?: () => void;
  onJoinIrcChannel?: (channel: string) => void;
  onNavigateToTab?: (tab: any) => void;
}

type SubTab = 'discussions' | 'memberships' | 'showcase' | 'events' | 'roster';

export const CommunityHubView: React.FC<CommunityHubViewProps> = ({
  userMembership,
  onUpdateMembership,
  onOpenMembershipModal,
  onOpenHostingModal,
  onOpenLegalCenter,
  onOpenZncWebAdmin,
  onJoinIrcChannel,
  onNavigateToTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('discussions');

  // Discussions State
  const [topics, setTopics] = useState<CommunityDiscussionTopic[]>(INITIAL_COMMUNITY_TOPICS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(topics[0].id);
  const [upvotedTopicIds, setUpvotedTopicIds] = useState<Record<string, boolean>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [localReplies, setLocalReplies] = useState<Record<string, Array<{ author: string; text: string; time: string }>>>({
    'topic-1': [
      { author: 'SysAdmin_Zack', text: 'Confirmed working on OBS 30.2 with the WebIRC hook!', time: '1 hour ago' }
    ],
    'topic-4': [
      { author: 'Capt. Dave Morrison', text: 'Witt Law has been indispensable for our low-power C-Band compliance.', time: '1 day ago' }
    ]
  });

  // New Topic Modal State
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState<CommunityDiscussionTopic['category']>('Broadcasting & Teleports');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicTags, setNewTopicTags] = useState('OBS, Teleport, ZNC');
  const [newTopicIrc, setNewTopicIrc] = useState('#broadcasters');

  // Events State
  const [events, setEvents] = useState<CommunityEvent[]>(COMMUNITY_EVENTS);

  // Billing Cycle state for in-tab matrix
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(userMembership.cycle || 'monthly');

  // Upvote Handler
  const handleToggleUpvote = (topicId: string) => {
    const isUpvoted = upvotedTopicIds[topicId];
    setUpvotedTopicIds(prev => ({ ...prev, [topicId]: !isUpvoted }));
    setTopics(prev =>
      prev.map(t => {
        if (t.id === topicId) {
          return { ...t, upvotes: t.upvotes + (isUpvoted ? -1 : 1) };
        }
        return t;
      })
    );
  };

  // Submit Reply Handler
  const handleAddReply = (topicId: string) => {
    const text = replyInputs[topicId]?.trim();
    if (!text) return;

    setLocalReplies(prev => ({
      ...prev,
      [topicId]: [
        ...(prev[topicId] || []),
        { author: `${userMembership.callsign} (${userMembership.memberId})`, text, time: 'Just now' }
      ]
    }));

    setTopics(prev =>
      prev.map(t => (t.id === topicId ? { ...t, replyCount: t.replyCount + 1 } : t))
    );

    setReplyInputs(prev => ({ ...prev, [topicId]: '' }));
  };

  // Submit New Topic Handler
  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;

    const newTopic: CommunityDiscussionTopic = {
      id: `topic-${Date.now()}`,
      title: newTopicTitle.trim(),
      author: {
        name: userMembership.callsign,
        callsign: userMembership.callsign,
        tier: userMembership.tierId
      },
      category: newTopicCategory,
      createdAt: 'Just now',
      replyCount: 0,
      upvotes: 1,
      pinned: false,
      content: newTopicContent.trim(),
      tags: newTopicTags.split(',').map(s => s.trim()).filter(Boolean),
      linkedIrcChannel: newTopicIrc.trim() || '#broadcasters'
    };

    setTopics([newTopic, ...topics]);
    setExpandedTopicId(newTopic.id);
    setIsNewTopicModalOpen(false);
    setNewTopicTitle('');
    setNewTopicContent('');
  };

  // RSVP Handler
  const handleToggleRsvp = (eventId: string) => {
    setEvents(prev =>
      prev.map(ev => {
        if (ev.id === eventId) {
          const currentlyRsvpd = !!ev.isUserRsvpd;
          return {
            ...ev,
            isUserRsvpd: !currentlyRsvpd,
            rsvpCount: ev.rsvpCount + (currentlyRsvpd ? -1 : 1)
          };
        }
        return ev;
      })
    );
  };

  // Filtered Topics
  const filteredTopics = topics.filter(t => {
    const matchCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchQuery =
      searchQuery === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  const currentPlan = MEMBERSHIP_PLANS.find(p => p.id === userMembership.tierId) || MEMBERSHIP_PLANS[0];

  const categories = [
    'All',
    'Broadcasting & Teleports',
    'IRC & ZNC Bouncers',
    'Satcom RF & Orbitals',
    'DataPacket Hosting',
    'FCC & Witt Law Regulatory',
    'General Lounge'
  ];

  const handleTuneIrc = (channelName: string) => {
    if (onJoinIrcChannel) {
      onJoinIrcChannel(channelName);
    } else if (onNavigateToTab) {
      onNavigateToTab('irc');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>DRFUN1 Global Teleport Community</span>
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                1:1 IRC Channel Linking
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                FCC FRN #0034981290
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Community Hub & Broadcaster Memberships
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Connect with satellite teleport operators, amateur radio enthusiasts, and streaming station founders.
              Participate in live discussions, watch orbital launches, and unlock Broadcaster Pro tiers with persistent ZNC bouncers and wholesale DataPacket hosting.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenMembershipModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center space-x-2 transition"
              >
                <Crown className="w-4 h-4 text-slate-950" />
                <span>Explore Memberships & Upgrade</span>
              </button>

              <button
                onClick={() => {
                  setActiveSubTab('discussions');
                  setIsNewTopicModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center space-x-2 transition"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Start Discussion</span>
              </button>

              {onOpenHostingModal && (
                <button
                  onClick={onOpenHostingModal}
                  className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-amber-500/30 flex items-center space-x-2 transition"
                >
                  <Server className="w-4 h-4 text-amber-400" />
                  <span>DataPacket Reseller Hosting</span>
                </button>
              )}

              {onOpenZncWebAdmin && (
                <button
                  onClick={onOpenZncWebAdmin}
                  className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-300 font-semibold text-xs border border-emerald-500/30 flex items-center space-x-2 transition"
                >
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>ZNC WebAdmin (:5000)</span>
                </button>
              )}
            </div>
          </div>

          {/* User Membership Card Snippet */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 shadow-xl shrink-0 lg:w-80">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Your Teleport Pass</span>
              <span className={`px-2 py-0.5 text-xs font-bold rounded border ${currentPlan.badgeClass}`}>
                {currentPlan.name}
              </span>
            </div>

            <div className="py-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Callsign:</span>
                <span className="font-mono font-bold text-white">{userMembership.callsign}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Member ID:</span>
                <span className="font-mono text-cyan-300">{userMembership.memberId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ZNC Buffer:</span>
                <span className="font-mono text-emerald-400">{currentPlan.zncBufferLines} lines</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reputation:</span>
                <span className="font-semibold text-purple-300">{userMembership.reputationPoints} pts</span>
              </div>
            </div>

            <button
              onClick={onOpenMembershipModal}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <span>Manage Subscription & Perks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto custom-nav-scrollbar pb-1">
          <button
            onClick={() => setActiveSubTab('discussions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeSubTab === 'discussions'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Community Lounge ({topics.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('memberships')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeSubTab === 'memberships'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Membership Plans & Billing</span>
          </button>

          <button
            onClick={() => setActiveSubTab('showcase')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeSubTab === 'showcase'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Station Showcase ({COMMUNITY_CHANNEL_SPOTLIGHTS.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('events')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeSubTab === 'events'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Watch Parties & Events ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeSubTab === 'roster'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Certified Roster & Code of Conduct</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: COMMUNITY DISCUSSIONS / LOUNGE */}
      {/* ========================================================================= */}
      {activeSubTab === 'discussions' && (
        <div className="space-y-6">
          {/* Controls Bar: Categories & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            {/* Category pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 custom-nav-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex items-center space-x-2 shrink-0">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search topics or tags..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={() => setIsNewTopicModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shrink-0 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Topic</span>
              </button>
            </div>
          </div>

          {/* Topics List */}
          <div className="space-y-4">
            {filteredTopics.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400">
                <p className="text-sm">No topics found matching your criteria.</p>
                <button
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                  className="mt-3 px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs rounded-lg hover:bg-slate-700"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredTopics.map(topic => {
                const isExpanded = expandedTopicId === topic.id;
                const isUpvoted = !!upvotedTopicIds[topic.id];
                const replies = localReplies[topic.id] || [];

                return (
                  <div
                    key={topic.id}
                    className={`rounded-xl border transition-all ${
                      isExpanded
                        ? 'bg-slate-900/90 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                        : 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    {/* Topic Header Row */}
                    <div className="p-4 sm:p-5 flex items-start gap-4">
                      {/* Upvote Column */}
                      <button
                        onClick={() => handleToggleUpvote(topic.id)}
                        className={`flex flex-col items-center justify-center w-11 h-12 rounded-lg border transition ${
                          isUpvoted
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                            : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'text-cyan-400 fill-cyan-400' : ''}`} />
                        <span className="text-xs font-mono mt-0.5">{topic.upvotes}</span>
                      </button>

                      {/* Main Topic Content Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {topic.pinned && (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Pinned
                            </span>
                          )}
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {topic.category}
                          </span>
                          <span className="text-xs text-slate-500">• {topic.createdAt}</span>
                          <span className="text-xs text-slate-400">
                            by <strong className="text-slate-200">{topic.author.name}</strong> ({topic.author.callsign})
                          </span>
                        </div>

                        <h3
                          onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                          className="text-base font-bold text-white hover:text-cyan-400 cursor-pointer transition flex items-center space-x-2"
                        >
                          <span>{topic.title}</span>
                        </h3>

                        {/* Summary / Snippet */}
                        {!isExpanded && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {topic.content}
                          </p>
                        )}

                        {/* Footer tags and links */}
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                          {topic.tags.map(t => (
                            <span key={t} className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono text-[11px] border border-slate-800">
                              #{t}
                            </span>
                          ))}

                          {topic.linkedIrcChannel && (
                            <button
                              onClick={() => handleTuneIrc(topic.linkedIrcChannel!)}
                              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 hover:bg-cyan-900/60 font-mono text-[11px] transition"
                              title="Tune 1:1 IRC Channel"
                            >
                              <Hash className="w-3 h-3 text-cyan-400" />
                              <span>{topic.linkedIrcChannel}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                            className="ml-auto inline-flex items-center space-x-1 text-slate-400 hover:text-cyan-400 text-xs transition"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{topic.replyCount + replies.length} Replies</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content and Reply Thread */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/50 space-y-4">
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {topic.content}
                        </div>

                        {/* Replies Thread */}
                        <div className="space-y-2.5">
                          <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">
                            Discussion Thread ({topic.replyCount + replies.length})
                          </h4>

                          {replies.map((r, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                              <div className="flex items-center justify-between text-slate-400 mb-1">
                                <span className="font-semibold text-cyan-300">{r.author}</span>
                                <span>{r.time}</span>
                              </div>
                              <p className="text-slate-200">{r.text}</p>
                            </div>
                          ))}

                          {/* Quick Reply Box */}
                          <div className="flex items-center space-x-2 pt-2">
                            <input
                              type="text"
                              placeholder={`Reply as ${userMembership.callsign}...`}
                              value={replyInputs[topic.id] || ''}
                              onChange={e => setReplyInputs({ ...replyInputs, [topic.id]: e.target.value })}
                              onKeyDown={e => { if (e.key === 'Enter') handleAddReply(topic.id); }}
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                            />
                            <button
                              onClick={() => handleAddReply(topic.id)}
                              className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: MEMBERSHIPS & SUBSCRIPTIONS */}
      {/* ========================================================================= */}
      {activeSubTab === 'memberships' && (
        <div className="space-y-8">
          
          {/* Header & Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white">Teleport Broadcaster Membership Tiers</h2>
              <p className="text-xs text-slate-400">
                Scale your independent broadcast stations, IRC leaf presence, ZNC bouncers, and wholesale DataPacket reseller hosting.
              </p>
            </div>

            <div className="inline-flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual (2 Mo Free)</span>
              </button>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MEMBERSHIP_PLANS.map((plan) => {
              const isCurrent = userMembership.tierId === plan.id;
              const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border bg-slate-900/40 p-5 flex flex-col justify-between transition-all ${plan.borderClass} ${
                    plan.isPopular ? 'ring-1 ring-cyan-500/50 bg-slate-900/60' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${plan.badgeClass}`}>
                        {plan.badge}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{plan.tagline}</p>

                    <div className="my-4 pt-3 border-t border-slate-800">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-extrabold text-white">${price}</span>
                        <span className="text-xs text-slate-400">/{billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 py-3 mb-3 border-y border-slate-800/80 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">ZNC Buffer:</span>
                        <span className="font-mono text-cyan-300 font-semibold">{plan.zncBufferLines} lines</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Stations:</span>
                        <span className="font-semibold text-slate-200">
                          {plan.maxBroadcastChannels >= 999 ? 'Unlimited' : plan.maxBroadcastChannels}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Hosting Discount:</span>
                        <span className="font-semibold text-amber-300">{plan.hostingDiscountPercent}%</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Support:</span>
                        <span className="font-semibold text-slate-200 text-right">{plan.supportLevel}</span>
                      </div>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300 my-3">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <button
                      onClick={onOpenMembershipModal}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : plan.isPopular
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white border border-slate-700'
                      }`}
                    >
                      {isCurrent ? 'Current Plan (Manage)' : `Select ${plan.name.split(' ')[0]}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Member Credentials & Billing Invoices Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Credentials Card */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Your Broadcaster Credentials</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Member ID</span>
                  <span className="text-white font-mono font-bold text-sm">{userMembership.memberId}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Radio Callsign</span>
                  <span className="text-cyan-300 font-mono font-bold text-sm">{userMembership.callsign}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">ZNC Bouncer Server</span>
                  <span className="text-slate-200 font-mono text-xs">{userMembership.zncServer}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Registered Channels</span>
                  <span className="text-amber-300 font-mono text-xs">{userMembership.activeChannelsRegistered.join(', ')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <span>Next Billing Renewal: <strong className="text-white">{userMembership.renewalDate}</strong></span>
                <button
                  onClick={onOpenMembershipModal}
                  className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                >
                  Change Billing Cycle
                </button>
              </div>
            </div>

            {/* Invoices History Card */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Billing History & Escrow Invoices</h3>
                </div>
                <span className="text-[11px] text-slate-400">Protected by Witt Law LLC</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto custom-nav-scrollbar pr-1">
                {userMembership.invoices.map((inv) => (
                  <div key={inv.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{inv.planName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                        <span>{inv.date}</span>
                        <span>•</span>
                        <span className="font-mono text-cyan-300">{inv.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-mono font-bold text-white">${inv.amount.toFixed(2)}</div>
                        <span className="text-[10px] text-emerald-400 font-semibold">{inv.status}</span>
                      </div>
                      <button
                        onClick={() => alert(`Receipt ${inv.invoicePdfRef} downloaded from Witt Law Escrow registry.`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Download Invoice PDF Stub"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: STATION SHOWCASE & SPOTLIGHTS */}
      {/* ========================================================================= */}
      {activeSubTab === 'showcase' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white">Community Station Showcase</h2>
              <p className="text-xs text-slate-400">
                Featured 24/7 linear stations run by member broadcasters with synchronized 1:1 IRC interactive chat.
              </p>
            </div>

            <button
              onClick={() => {
                if (userMembership.tierId === 'cadet_free') {
                  onOpenMembershipModal();
                } else {
                  alert('Station Registration Portal: Submit your RTMP/HLS mount point and reserved #channel name to ops@drfun1.com!');
                }
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition"
            >
              <Radio className="w-4 h-4" />
              <span>Register Your Station</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {COMMUNITY_CHANNEL_SPOTLIGHTS.map((station) => (
              <div
                key={station.id}
                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                      {station.category}
                    </span>
                    <span className="flex items-center space-x-1.5 text-xs text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{station.currentListeners} Tuned</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">{station.channelName}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                    <span>Host: <strong className="text-slate-200">{station.operatorName}</strong> ({station.operatorCallsign})</span>
                    {station.verifiedWittLaw && (
                      <span className="inline-flex items-center space-x-0.5 text-amber-400" title="Verified Broadcaster License">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Verified</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {station.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400 font-mono">
                    Bitrate: <span className="text-slate-200">{station.bitrate}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTuneIrc(station.ircChannel)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-semibold flex items-center space-x-1 border border-slate-700 transition"
                      title="Join IRC Chat"
                    >
                      <Hash className="w-3 h-3 text-cyan-400" />
                      <span>{station.ircChannel}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onNavigateToTab) {
                          onNavigateToTab('stream');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition"
                    >
                      <span>Tune Broadcast</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: LIVE EVENTS & WATCH PARTIES */}
      {/* ========================================================================= */}
      {activeSubTab === 'events' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white">Upcoming Watch Parties & Technical NetMeetings</h2>
            <p className="text-xs text-slate-400">
              Interactive live broadcasts synchronized with DRFUN1 WebIRC and orbital tracking teleports.
            </p>
          </div>

          <div className="space-y-4">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-5 transition"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {ev.category}
                    </span>
                    <span className="flex items-center space-x-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <strong className="text-white">{ev.date}</strong> at {ev.timeUtc}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{ev.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>
                  
                  <div className="text-xs text-slate-400 flex items-center space-x-3">
                    <span>Host: <strong className="text-slate-200">{ev.hostName}</strong> ({ev.hostCallsign})</span>
                    <span>•</span>
                    <button
                      onClick={() => handleTuneIrc(ev.ircChannel)}
                      className="text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center space-x-1 underline"
                    >
                      <Hash className="w-3 h-3" />
                      <span>Chat in {ev.ircChannel}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-end justify-center gap-3 shrink-0">
                  <div className="text-xs text-slate-400 text-right">
                    <strong className="text-cyan-300 font-bold font-mono text-sm">{ev.rsvpCount}</strong> RSVPs
                  </div>

                  <button
                    onClick={() => handleToggleRsvp(ev.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
                      ev.isUserRsvpd
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                    }`}
                  >
                    {ev.isUserRsvpd ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>RSVP Confirmed</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span>RSVP Watch Party</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: CERTIFIED ROSTER & CODE OF CONDUCT */}
      {/* ========================================================================= */}
      {activeSubTab === 'roster' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Broadcaster Standards & Escrow Certification</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Certified by The Law Office of Richard A. Witt LLC (<a href="https://www.wittlawfirm.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">www.wittlawfirm.com</a>) and registered under FCC FRN #0034981290. All member stations adhere to telecommunications compliance, non-interference spectrum guidelines, and prompt dispute resolution.
            </p>
          </div>

          {/* Code of Conduct Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
              <div className="text-amber-400 font-bold text-sm flex items-center space-x-2">
                <span>1. Spectrum Integrity</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                No unauthorized carrier interference or uncoordinated high-power transponder uplinks. All RF frequencies must adhere to ITU-R and FCC Part 25 orbital allocations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
              <div className="text-cyan-400 font-bold text-sm flex items-center space-x-2">
                <span>2. Copyright & SCTE-35</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Stations utilizing automated ad insertion cues (SCTE-35) or musical performance feeds must maintain clearance documentation filed in the Witt Law member repository.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold text-sm flex items-center space-x-2">
                <span>3. ZNC & IRC NetEtiquette</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Leaf servers, bot relays, and persistent ZNC bouncers must use SASL/CertFP authentication. Spamming, flood nets, or unauthorized channel takeovers result in instant O-Line revocation.
              </p>
            </div>
          </div>

          {/* Broadcaster Directory Table */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              DRFUN1 Verified NetAdmin & Station Registry
            </h3>

            <div className="overflow-x-auto custom-nav-scrollbar">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Member & Station</th>
                    <th className="p-3">Callsign</th>
                    <th className="p-3">Membership Tier</th>
                    <th className="p-3">Primary 1:1 IRC</th>
                    <th className="p-3">Certification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300 font-medium">
                  <tr>
                    <td className="p-3 font-semibold text-white">Richard Alan Witt LLC (Legal Counsel)</td>
                    <td className="p-3 font-mono text-cyan-300">LEGAL-WITT</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Founding Council</span></td>
                    <td className="p-3 font-mono text-slate-400">#fcc-wittlaw</td>
                    <td className="p-3 text-emerald-400 font-semibold">Lead Counsel (Bar Verified)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">DRFUN1 Master Teleport NOC</td>
                    <td className="p-3 font-mono text-cyan-300">ROOT-DR1</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Founding Council</span></td>
                    <td className="p-3 font-mono text-slate-400">#broadcasters</td>
                    <td className="p-3 text-emerald-400 font-semibold">UnrealIRCd NetAdmin O-Line</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Orion Teleport Ops (Deep Space)</td>
                    <td className="p-3 font-mono text-cyan-300">N9DSP</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Satcom Enterprise</span></td>
                    <td className="p-3 font-mono text-slate-400">#space</td>
                    <td className="p-3 text-emerald-400 font-semibold">C-Band Teleport Uplink</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Tri-State Amateur Radio Club</td>
                    <td className="p-3 font-mono text-cyan-300">W8USA</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Satcom Enterprise</span></td>
                    <td className="p-3 font-mono text-slate-400">#hamradio</td>
                    <td className="p-3 text-emerald-400 font-semibold">FCC Part 97 Amateur Station</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">DJ NeonCircuit (CyberWave FM)</td>
                    <td className="p-3 font-mono text-cyan-300">KC3SYN</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">Broadcaster Pro</span></td>
                    <td className="p-3 font-mono text-slate-400">#cyberwave</td>
                    <td className="p-3 text-emerald-400 font-semibold">Digital Audio Royalty Cleared</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {onOpenLegalCenter && (
              <div className="pt-2 text-right">
                <button
                  onClick={onOpenLegalCenter}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium underline inline-flex items-center space-x-1"
                >
                  <span>Open Full Regulatory & Escrow Center</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: START NEW DISCUSSION */}
      {/* ========================================================================= */}
      {isNewTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Create New Community Topic</h3>
              </div>
              <button
                onClick={() => setIsNewTopicModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Topic Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Setting up automated HLS push to irc.drfun1media.com"
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newTopicCategory}
                    onChange={e => setNewTopicCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Broadcasting & Teleports">Broadcasting & Teleports</option>
                    <option value="IRC & ZNC Bouncers">IRC & ZNC Bouncers</option>
                    <option value="Satcom RF & Orbitals">Satcom RF & Orbitals</option>
                    <option value="DataPacket Hosting">DataPacket Hosting</option>
                    <option value="FCC & Witt Law Regulatory">FCC & Witt Law Regulatory</option>
                    <option value="General Lounge">General Lounge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Linked IRC Channel</label>
                  <input
                    type="text"
                    placeholder="#broadcasters"
                    value={newTopicIrc}
                    onChange={e => setNewTopicIrc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="OBS, Icecast, ZNC, Frankfurt"
                  value={newTopicTags}
                  onChange={e => setNewTopicTags(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Post Content</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Share details, configurations, stream bitrates, or questions for the DRFUN1 community..."
                  value={newTopicContent}
                  onChange={e => setNewTopicContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-slate-400">
                  Posting as: <strong className="text-cyan-300 font-mono">{userMembership.callsign}</strong> ({currentPlan.name})
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsNewTopicModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                  >
                    Publish Topic
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
