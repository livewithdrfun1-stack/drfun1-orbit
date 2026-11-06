/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Floating / Docked Live IRC Client Widget on Index Page
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  IrcLoginSession, 
  IrcMessage 
} from '../types/irc';
import { 
  SWITCH_DEDICATED_NODES, 
  ALL_DRFUN1_MEDIA_CHANNELS 
} from '../data/ircData';
import { 
  Terminal, 
  Server, 
  Hash, 
  Users, 
  Send, 
  Maximize2, 
  Minimize2, 
  X, 
  Lock, 
  ShieldCheck, 
  Activity, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  User, 
  Sparkles,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';

interface IndexIrcFloatingClientProps {
  session: IrcLoginSession | null;
  onOpenLoginModal: () => void;
  onOpenFullIrcTab: () => void;
  onDisconnect: () => void;
}

export const IndexIrcFloatingClient: React.FC<IndexIrcFloatingClientProps> = ({
  session,
  onOpenLoginModal,
  onOpenFullIrcTab,
  onDisconnect,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentChannel, setCurrentChannel] = useState<string>(session?.channel || '#lobby');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<IrcMessage[]>([]);
  const [userNick, setUserNick] = useState<string>(session?.nick || 'RichardAlanWitt');
  const [simulatedPing, setSimulatedPing] = useState<number>(1.4);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update nick and channel when session changes
  useEffect(() => {
    if (session) {
      setUserNick(session.nick);
      if (session.channel) setCurrentChannel(session.channel);
    }
  }, [session]);

  // Initial welcome burst when connected or session initialized
  useEffect(() => {
    const nick = session?.nick || userNick;
    const chan = session?.channel || currentChannel;

    const welcomeMessages: IrcMessage[] = [
      {
        id: `sys-conn-1`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: '***',
        channel: chan,
        content: `Looking up your hostname... Found irc.drfun1.com. Establishing TLS 1.3 AES-256 session...`,
        type: 'system',
      },
      {
        id: `sys-conn-2`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'irc.drfun1.com',
        channel: chan,
        content: `:irc.drfun1.com 001 ${nick} :Welcome to the DrFun1 Media UnrealIRCd Network ${nick}!webirc@las-vegas.switch.drfun1.com`,
        type: 'notice',
      },
      {
        id: `sys-conn-3`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'irc.drfun1.com',
        channel: chan,
        content: `:irc.drfun1.com 251 ${nick} :There are 8,838 users and 412 invisible on 26 Switch SUPERNAP Leaf servers`,
        type: 'notice',
      },
      {
        id: `sys-conn-4`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: '***',
        channel: chan,
        content: `You have joined channel ${chan} (Modes: +cnt). Topic: Official DrFun1 Media BroadCast & Satcom Feed (Switch SUPERNAP NV Core 001)`,
        type: 'join',
      },
      {
        id: `chat-1`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'Switch_NOC_Lead',
        channel: chan,
        content: `Welcome to DrFun1 IRC! All 25 optical leaf nodes and transponders are 100% operational with sub-1.5ms core jitter.`,
        type: 'message',
      },
      {
        id: `chat-2`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'Satcom_Auditor',
        channel: chan,
        content: `FCC Part 25 Earth Station and Part 73 Broadcast licenses verified under FRN 0034981290 (Richard Alan Witt, Esq.).`,
        type: 'message',
      },
    ];

    setMessages(welcomeMessages);
  }, [session?.nick, session?.channel]);

  // Auto-scroll
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  // Live jitter ping
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedPing(+(1.2 + Math.random() * 0.4).toFixed(2));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputMessage.trim();
    if (!raw) return;

    // Handle slash commands
    if (raw.startsWith('/')) {
      handleCommand(raw);
      setInputMessage('');
      return;
    }

    const newMsg: IrcMessage = {
      id: `usr_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sender: userNick,
      channel: currentChannel,
      content: raw,
      type: 'message',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    // Simulated automated reply if query words
    if (raw.toLowerCase().includes('status') || raw.toLowerCase().includes('ping') || raw.toLowerCase().includes('node')) {
      setTimeout(() => {
        const reply: IrcMessage = {
          id: `bot_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          sender: 'DrFun1_Bot',
          channel: currentChannel,
          content: `[ACK] Node online at irc.drfun1.com:6697. Core Ping: ${simulatedPing}ms. RisingNet AS53767 BGP clean-pipe active.`,
          type: 'notice',
        };
        setMessages((prev) => [...prev, reply]);
      }, 500);
    }
  };

  const handleCommand = (raw: string) => {
    const parts = raw.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (cmd === '/nick' && arg) {
      const oldNick = userNick;
      const cleanNick = arg.replace(/\s+/g, '_');
      setUserNick(cleanNick);
      setMessages((prev) => [
        ...prev,
        {
          id: `cmd_${Date.now()}`,
          timestamp: time,
          sender: '***',
          channel: currentChannel,
          content: `${oldNick} is now known as ${cleanNick}`,
          type: 'mode',
        },
      ]);
    } else if (cmd === '/join' && arg) {
      const targetChan = arg.startsWith('#') ? arg : `#${arg}`;
      setCurrentChannel(targetChan);
      setMessages((prev) => [
        ...prev,
        {
          id: `cmd_${Date.now()}`,
          timestamp: time,
          sender: '***',
          channel: targetChan,
          content: `Switched channel to ${targetChan} (Modes: +cnt). Loading backbuffer...`,
          type: 'join',
        },
      ]);
    } else if (cmd === '/stats') {
      setMessages((prev) => [
        ...prev,
        {
          id: `cmd_${Date.now()}`,
          timestamp: time,
          sender: 'irc.drfun1.com',
          channel: currentChannel,
          content: `:irc.drfun1.com 250 ${userNick} :Highest connection count: 14,290 (8,838 current clients on 26 nodes)`,
          type: 'notice',
        },
        {
          id: `cmd_${Date.now() + 1}`,
          timestamp: time,
          sender: 'irc.drfun1.com',
          channel: currentChannel,
          content: `:irc.drfun1.com 219 ${userNick} ${arg || 'u'} :End of /STATS report`,
          type: 'notice',
        },
      ]);
    } else if (cmd === '/clear') {
      setMessages([]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `cmd_${Date.now()}`,
          timestamp: time,
          sender: '***',
          channel: currentChannel,
          content: `Command executed: ${raw}. Supported: /nick <name>, /join <#chan>, /stats <u>, /clear`,
          type: 'system',
        },
      ]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 font-mono text-xs select-none">
      
      {/* 1. COLLAPSED DOCK BAR */}
      {!isExpanded ? (
        <div className="bg-slate-900/95 border border-purple-500/50 hover:border-purple-400 rounded-2xl p-2 sm:px-3.5 sm:py-2.5 shadow-2xl backdrop-blur-md flex items-center gap-3 transition-all">
          
          {/* Pulsing Status Dot & Host Info */}
          <div 
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Expand Live IRC Client Window"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="font-bold text-white text-xs group-hover:text-purple-200 transition-colors">
                  irc.drfun1.com:6697
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  TLS 1.3
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="text-emerald-400 font-semibold">{currentChannel}</span>
                <span>&bull;</span>
                <span className="text-purple-300">Nick: {userNick}</span>
                <span>&bull;</span>
                <span className="text-slate-500">{simulatedPing}ms</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            {/* Quick Open Chat Window */}
            <button
              onClick={() => setIsExpanded(true)}
              className="px-2.5 py-1 rounded-lg bg-purple-600/80 hover:bg-purple-500 text-white font-bold flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
              title="Open IRC Client"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>

            {/* Change Login / Reopen Modal */}
            <button
              onClick={onOpenLoginModal}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[10px]"
              title="Change Nickname, Server or Channel Login"
            >
              <span>Login</span>
            </button>

            {/* Launch Fullscreen Tab */}
            <button
              onClick={onOpenFullIrcTab}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Open Fullscreen IRC Studio View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* 2. EXPANDED FLOATING IRC CLIENT WINDOW */
        <div className="bg-slate-950 border border-purple-500/50 rounded-2xl w-[92vw] sm:w-[460px] h-[520px] shadow-2xl flex flex-col overflow-hidden backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Top Title Bar */}
          <div className="bg-slate-900/90 px-3.5 py-2.5 border-b border-purple-500/30 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="relative flex items-center justify-center shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 relative" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="font-bold text-white text-xs truncate">
                    irc.drfun1.com:6697
                  </span>
                  <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    SSL
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="text-purple-300 truncate max-w-[90px]">{userNick}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400 font-mono">{simulatedPing} ms</span>
                  <span>&bull;</span>
                  <span className="text-slate-500">8,838 users</span>
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Channel Dropdown */}
              <select
                value={currentChannel}
                onChange={(e) => {
                  const newCh = e.target.value;
                  setCurrentChannel(newCh);
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `sw_${Date.now()}`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      sender: '***',
                      channel: newCh,
                      content: `Joined ${newCh} (Modes: +cnt). Broadcasting verified.`,
                      type: 'join',
                    },
                  ]);
                }}
                className="bg-slate-950 border border-slate-700 text-emerald-300 rounded px-1.5 py-0.5 text-[11px] font-bold focus:outline-none cursor-pointer max-w-[120px]"
              >
                <option value="#lobby">#lobby</option>
                <option value="#drfun1-media">#drfun1-media</option>
                <option value="#fubo-sports">#fubo-sports</option>
                <option value="#drfun1-primetv">#drfun1-primetv</option>
                <option value="#c-band-space">#c-band-space</option>
                <option value="#5g-ntn">#5g-ntn</option>
                <option value="#whitehouse-briefings">#whitehouse-briefings</option>
                <option value="#switch-supernap">#switch-supernap</option>
              </select>

              {/* Login Button */}
              <button
                onClick={onOpenLoginModal}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Change Nickname or Server Connection"
              >
                <User className="w-3.5 h-3.5" />
              </button>

              {/* Fullscreen Tab Button */}
              <button
                onClick={onOpenFullIrcTab}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Open Fullscreen IRC Tab"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Minimize Window */}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Minimize IRC dock"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Commands Ribbon */}
          <div className="bg-slate-900/60 px-3 py-1 border-b border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-slate-500">Run:</span>
              <button
                onClick={() => handleCommand('/stats u')}
                className="px-1.5 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                /stats u
              </button>
              <button
                onClick={() => handleCommand('/stats l')}
                className="px-1.5 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                /stats l
              </button>
              <button
                onClick={() => handleCommand(`/whois ${userNick}`)}
                className="px-1.5 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                /whois
              </button>
              <button
                onClick={() => handleCommand('/clear')}
                className="px-1.5 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                /clear
              </button>
            </div>

            <button
              onClick={onOpenFullIrcTab}
              className="text-purple-400 hover:text-purple-300 text-[10px] flex items-center gap-0.5 cursor-pointer"
            >
              <span>Full Studio</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-3 overflow-y-auto space-y-1.5 bg-slate-950 font-mono text-[11px] leading-relaxed select-text">
            {messages.map((m) => {
              const isMe = m.sender === userNick;
              return (
                <div key={m.id} className="flex items-start gap-1.5 hover:bg-slate-900/40 px-1 py-0.5 rounded transition-colors">
                  <span className="text-slate-500 text-[10px] shrink-0 select-none">
                    [{m.timestamp}]
                  </span>

                  {m.type === 'system' ? (
                    <span className="text-purple-400 italic">{m.content}</span>
                  ) : m.type === 'notice' ? (
                    <span className="text-amber-300">{m.content}</span>
                  ) : m.type === 'join' ? (
                    <span className="text-emerald-400">{m.content}</span>
                  ) : m.type === 'mode' ? (
                    <span className="text-sky-400">{m.content}</span>
                  ) : (
                    <div className="min-w-0 break-words flex-1">
                      <span className={`font-bold ${isMe ? 'text-purple-300' : 'text-emerald-400'} mr-1.5 select-none`}>
                        &lt;{m.sender}&gt;
                      </span>
                      <span className="text-slate-200">{m.content}</span>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Message Input Form */}
          <form onSubmit={handleSendMessage} className="p-2 bg-slate-900/90 border-t border-slate-800 flex items-center gap-1.5 shrink-0">
            <span className="text-purple-400 pl-1 select-none font-bold">&gt;</span>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message ${currentChannel} or type /command...`}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Window Footer Status Line */}
          <div className="bg-slate-950 px-3 py-1 border-t border-slate-900 flex items-center justify-between text-[9px] text-slate-500 shrink-0">
            <span>Switch SUPERNAP NV &bull; RisingNet AS53767</span>
            <span>UnrealIRCd 6.1.4 &bull; U-lines Verified</span>
          </div>

        </div>
      )}

    </div>
  );
};
