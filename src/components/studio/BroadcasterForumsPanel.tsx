/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Broadcaster & Developer Community Forums (Twitch, Kick, DrFun1TV, Satellite NOC)
 */

import React, { useState } from 'react';
import { ForumThread, ForumReply, BroadcasterUserProfile } from '../../types/developerPortals';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  ThumbsUp, 
  Eye, 
  Pin, 
  CheckCircle2, 
  Code2, 
  Copy, 
  Check, 
  X as CloseIcon, 
  ChevronRight, 
  Sparkles, 
  Send,
  User,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface BroadcasterForumsPanelProps {
  threads: ForumThread[];
  onAddThread: (newThread: ForumThread) => void;
  onAddReply: (threadId: string, reply: ForumReply) => void;
  currentUser: BroadcasterUserProfile;
}

export const BroadcasterForumsPanel: React.FC<BroadcasterForumsPanelProps> = ({
  threads,
  onAddThread,
  onAddReply,
  currentUser,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState<boolean>(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // New Thread Form State
  const [newThreadTitle, setNewThreadTitle] = useState<string>('');
  const [newThreadCategory, setNewThreadCategory] = useState<ForumThread['category']>('dev_twitch');
  const [newThreadContent, setNewThreadContent] = useState<string>('');
  const [newThreadCode, setNewThreadCode] = useState<string>('');
  const [newThreadTags, setNewThreadTags] = useState<string>('dev.twitch.tv, Helix');

  // New Reply Input State
  const [replyText, setReplyText] = useState<string>('');

  const activeThread = threads.find(t => t.id === activeThreadId);

  const filteredThreads = threads.filter(thread => {
    const matchesCategory = selectedCategory === 'All' || thread.category === selectedCategory;
    const queryLower = searchQuery.toLowerCase().trim();
    const matchesQuery = !queryLower ||
      thread.title.toLowerCase().includes(queryLower) ||
      thread.content.toLowerCase().includes(queryLower) ||
      thread.authorName.toLowerCase().includes(queryLower) ||
      thread.tags.some(t => t.toLowerCase().includes(queryLower));

    return matchesCategory && matchesQuery;
  });

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCreateThreadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    const newThread: ForumThread = {
      id: `th_${Date.now()}`,
      category: newThreadCategory,
      title: newThreadTitle.trim(),
      authorName: currentUser.displayName,
      authorAvatar: currentUser.avatarUrl,
      authorRole: currentUser.role,
      content: newThreadContent.trim(),
      codeSnippet: newThreadCode.trim() ? newThreadCode.trim() : undefined,
      codeLanguage: newThreadCode.trim() ? 'javascript' : undefined,
      tags: newThreadTags.split(',').map(t => t.trim()).filter(Boolean),
      timestamp: 'Just now',
      repliesCount: 0,
      upvotes: 1,
      views: 1,
      isSolved: false,
      replies: [],
    };

    onAddThread(newThread);
    setIsNewThreadModalOpen(false);
    setNewThreadTitle('');
    setNewThreadContent('');
    setNewThreadCode('');
    setActiveThreadId(newThread.id);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThreadId) return;

    const newReply: ForumReply = {
      id: `rep_${Date.now()}`,
      threadId: activeThreadId,
      authorName: currentUser.displayName,
      authorAvatar: currentUser.avatarUrl,
      authorRole: currentUser.role,
      content: replyText.trim(),
      timestamp: 'Just now',
      upvotes: 0,
    };

    onAddReply(activeThreadId, newReply);
    setReplyText('');
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-500/20 text-sky-400 border border-sky-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>Broadcast &amp; Dev Community Forums</span>
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              {threads.length} Active Discussions
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1.5">
            Technical Forums for Twitch, Kick, DrFun1TV &amp; Satellite Engineers
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Share code snippets, debug Helix EventSub Webhooks, tune SCTE-35 master control, and discuss Kick 95/5 monetization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewThreadModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Discussion Thread</span>
          </button>
        </div>
      </div>

      {/* Main Forum Grid: Categories + Threads List OR Thread Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Categories & Search */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forum topics, tags, authors..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Categories Filter */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block px-2 py-1">
              Forum Categories
            </span>
            {[
              { id: 'All', label: 'All Discussions' },
              { id: 'dev_twitch', label: 'Twitch Developers (dev.twitch.tv)' },
              { id: 'dev_kick', label: 'Kick Developers (dev.kick.com)' },
              { id: 'drfun1tv_playout', label: 'DrFun1TV & Strimm Playout' },
              { id: 'restream_multistream', label: 'Restream.io Multi-Destination' },
              { id: 'satellite_carrier', label: 'Satellite NOC & Carrier Direct' },
              { id: 'legal_compliance', label: 'FCC & Witt Law Legal Charter' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActiveThreadId(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <span>{cat.label}</span>
                {cat.id !== 'All' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {threads.filter(t => t.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Author Badge Callout */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2.5 text-xs">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              className="w-9 h-9 rounded-full object-cover border border-sky-400"
            />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-white truncate">{currentUser.displayName}</div>
              <div className="text-[10px] text-emerald-400 font-mono truncate">{currentUser.role}</div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Threads List OR Active Thread Detail */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* THREAD DETAIL VIEW */}
          {activeThread ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <button
                  onClick={() => setActiveThreadId(null)}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono"
                >
                  <span>← Back to all threads</span>
                </button>
                <div className="flex items-center gap-2">
                  {activeThread.isPinned && (
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Pin className="w-3 h-3" />
                      <span>PINNED</span>
                    </span>
                  )}
                  {activeThread.isSolved && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>SOLVED</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Thread Header */}
              <div>
                <h3 className="text-base font-bold text-white">{activeThread.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-mono flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <img src={activeThread.authorAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-white font-semibold">{activeThread.authorName}</span>
                    <span className="text-sky-400 text-[10px]">({activeThread.authorRole})</span>
                  </div>
                  <span>·</span>
                  <span>{activeThread.timestamp}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{activeThread.views} views</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{activeThread.upvotes} upvotes</span>
                  </span>
                </div>
              </div>

              {/* Thread Content */}
              <div className="text-xs text-slate-200 leading-relaxed space-y-3 font-sans">
                <p>{activeThread.content}</p>

                {activeThread.codeSnippet && (
                  <div className="relative mt-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                    <div className="bg-slate-950 px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800">
                      <span>{activeThread.codeLanguage || 'javascript'}</span>
                      <button
                        onClick={() => handleCopyCode(activeThread.codeSnippet!, activeThread.id)}
                        className="text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedCodeId === activeThread.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCodeId === activeThread.id ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <pre className="p-3 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                      {activeThread.codeSnippet}
                    </pre>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {activeThread.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Replies Section */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span>Discussion Replies ({activeThread.replies.length})</span>
                </h4>

                {activeThread.replies.length === 0 ? (
                  <div className="p-4 bg-slate-900/40 rounded-lg border border-dashed border-slate-800 text-center text-xs text-slate-400 font-mono">
                    No replies yet. Be the first developer to respond!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeThread.replies.map(rep => (
                      <div key={rep.id} className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <img src={rep.authorAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                            <span className="font-bold text-white">{rep.authorName}</span>
                            <span className="text-[10px] text-sky-400 font-mono">({rep.authorRole})</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{rep.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{rep.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Post Reply Form */}
                <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a technical response or share code..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 font-mono shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </form>

              </div>

            </div>
          ) : (
            /* THREADS LIST VIEW */
            <div className="space-y-3">
              {filteredThreads.length === 0 ? (
                <div className="p-12 text-center bg-slate-950/60 border border-dashed border-slate-800 rounded-xl text-slate-400 text-xs">
                  No discussions found matching your filter.
                </div>
              ) : (
                filteredThreads.map(thread => (
                  <div
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className="p-4 bg-slate-950/60 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {thread.isPinned && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" />
                            <span>PINNED</span>
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                          {thread.category}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{thread.timestamp}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white hover:text-sky-300 transition-colors">
                      {thread.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {thread.content}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <img src={thread.authorAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                        <span className="text-slate-300">{thread.authorName}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{thread.views}</span>
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{thread.upvotes}</span>
                        </span>
                        <span className="flex items-center gap-1 text-sky-400">
                          <MessageSquare className="w-3 h-3" />
                          <span>{thread.repliesCount}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>

      {/* CREATE NEW THREAD MODAL */}
      {isNewThreadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Start a New Technical Discussion</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Post to Twitch Developers, Kick Developers, DrFun1TV Playout, or Satellite NOC forums.
                </p>
              </div>
              <button
                onClick={() => setIsNewThreadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateThreadSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Thread Title</label>
                <input
                  type="text"
                  required
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  placeholder="e.g. Integrating Kick API v2 Chatroom Bot into DrFun1 UnrealIRCd"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newThreadCategory}
                    onChange={(e) => setNewThreadCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                  >
                    <option value="dev_twitch">Twitch Developers (dev.twitch.tv)</option>
                    <option value="dev_kick">Kick Developers (dev.kick.com)</option>
                    <option value="drfun1tv_playout">DrFun1TV &amp; Strimm Playout</option>
                    <option value="restream_multistream">Restream.io Multi-Destination</option>
                    <option value="satellite_carrier">Satellite NOC &amp; Carrier Direct</option>
                    <option value="legal_compliance">FCC &amp; Witt Law Legal Charter</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newThreadTags}
                    onChange={(e) => setNewThreadTags(e.target.value)}
                    placeholder="e.g. dev.kick.com, Pusher, Bot"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Discussion Details &amp; Questions</label>
                <textarea
                  required
                  rows={4}
                  value={newThreadContent}
                  onChange={(e) => setNewThreadContent(e.target.value)}
                  placeholder="Explain the technical scenario, webhook payload, or broadcast requirement..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Code Snippet (Optional)</label>
                <textarea
                  rows={4}
                  value={newThreadCode}
                  onChange={(e) => setNewThreadCode(e.target.value)}
                  placeholder="// Paste JavaScript, curl, or IRC config snippet here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-sky-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Posting as: <strong className="text-white">{currentUser.displayName}</strong>
                </span>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Discussion</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
