/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * UnrealIRCd 6.1.4 Official Network Client Startup Login Modal
 */

import React, { useState } from 'react';
import { 
  IrcLoginCredentials 
} from '../types/irc';
import { 
  SWITCH_DEDICATED_NODES, 
  ALL_DRFUN1_MEDIA_CHANNELS 
} from '../data/ircData';
import {
  ALL_1034_LEAF_NODES,
  HUB1_500_SWITCH_NODES,
  HUB2_500_SWITCH_NODES,
  HUB1_12_DATAPACKET_NODES,
  HUB2_12_DATAPACKET_NODES,
  RISINGNET_10_DEDICATED_SERVERS
} from '../data/unrealSearchData';
import { 
  Terminal, 
  Server, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Radio, 
  RefreshCw, 
  Check, 
  X, 
  ExternalLink, 
  Hash, 
  User, 
  Activity,
  Globe,
  Sliders,
  Sparkles
} from 'lucide-react';
import { DrFun1MediaLogo } from './DrFun1MediaLogo';

interface IrcStartupLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (credentials: IrcLoginCredentials, openFullIrcTab?: boolean) => void;
  initialCredentials?: Partial<IrcLoginCredentials>;
}

const RANDOM_NICKS = [
  'RichardAlanWitt',
  'Satcom_Pilot_942',
  'OrbitNOC_Lead',
  'DrFun1_Operator',
  'Vegas_Teleport_01',
  'C_Band_Engineer',
  'NTN_5G_Specialist',
  'Switch_SuperNAP_Admin',
  'Cyber_Satcom_Oper',
  'SpaceLink_Navigator',
  'RisingNet_Transit_Op'
];

export const IrcStartupLoginModal: React.FC<IrcStartupLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  initialCredentials,
}) => {
  const [nick, setNick] = useState<string>(initialCredentials?.nick || 'RichardAlanWitt');
  const [ident, setIdent] = useState<string>(initialCredentials?.ident || 'satcom_web');
  const [realname, setRealname] = useState<string>(initialCredentials?.realname || 'DrFun1 Satcom WebIRC Client (dev.drfun1media.com)');
  const [selectedNodeId, setSelectedNodeId] = useState<string>(initialCredentials?.activeNodeId || 'dev_drfun1media_node');
  const [channel, setChannel] = useState<string>(initialCredentials?.channel || '#lobby');
  const [password, setPassword] = useState<string>(initialCredentials?.password || '');
  const [autoConnectOnStartup, setAutoConnectOnStartup] = useState<boolean>(initialCredentials?.autoConnectOnStartup ?? true);
  const [openFullTabAfterLogin, setOpenFullTabAfterLogin] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRandomizeNick = () => {
    const randomNick = RANDOM_NICKS[Math.floor(Math.random() * RANDOM_NICKS.length)];
    const uniqueNick = `${randomNick.replace(/_\d+$/, '')}_${Math.floor(100 + Math.random() * 900)}`;
    setNick(uniqueNick);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick.trim()) return;

    setIsConnecting(true);

    const isMaster = selectedNodeId === 'master_hub';
    const isMediaHub = selectedNodeId === 'media_hub';
    const isMediaNetHub = selectedNodeId === 'medianet_hub';
    const isIrcdHub = selectedNodeId === 'ircd_hub';
    const chosenNode = ALL_1034_LEAF_NODES.find(n => n.id === selectedNodeId) || SWITCH_DEDICATED_NODES.find(n => n.id === selectedNodeId);
    const serverHost = isMaster 
      ? 'irc.drfun1.com' 
      : isMediaHub 
      ? 'irc.drfun1media.com' 
      : isMediaNetHub
      ? 'irc.drfun1media.net'
      : isIrcdHub
      ? 'drfun1ircd.com'
      : (chosenNode?.host || 'irc.drfun1.com');
    const serverPort = 6697;

    const credentials: IrcLoginCredentials = {
      nick: nick.trim(),
      ident: ident.trim() || 'webirc',
      realname: realname.trim() || 'DrFun1 Satcom WebIRC User',
      serverHost,
      serverPort,
      useSsl: true,
      channel: channel.trim() || '#lobby',
      password: password.trim() || undefined,
      autoConnectOnStartup,
      activeNodeId: selectedNodeId,
    };

    setTimeout(() => {
      setIsConnecting(false);
      onLogin(credentials, openFullTabAfterLogin);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
        
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-950 via-slate-900 to-amber-950/80 border border-amber-500/40 text-amber-300 shadow-md shadow-purple-950/50">
              <Terminal className="w-6 h-6 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gradient-to-r from-purple-950 to-amber-950 text-amber-300 border border-amber-500/40 uppercase">
                  UnrealIRCd 6.1.4 Client Login
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  TLS 1.3 &bull; 8,838 ONLINE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-baseline gap-2 flex-wrap">
                <span>Connect to</span>
                <DrFun1MediaLogo size="lg" variant="purple-gold" />
                <span>IRC Network</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Official real-time telecommunications &amp; satellite broadcasting network on <strong className="text-purple-300 font-mono">irc.drfun1.com:6697</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close / Browse directory first"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10 font-mono text-xs">
          
          {/* Row 1: Nickname & Randomizer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>IRC Nickname / Callsign:</span>
              </label>
              <button
                type="button"
                onClick={handleRandomizeNick}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Randomize Nick</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={nick}
                onChange={(e) => setNick(e.target.value.replace(/\s+/g, '_'))}
                placeholder="e.g. RichardAlanWitt"
                className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                Max 30 chars
              </span>
            </div>
          </div>

          {/* Row 2: Target Server / Leaf Node Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Server / Switch SUPERNAP Leaf Node:</span>
            </label>
            <select
              value={selectedNodeId}
              onChange={(e) => setSelectedNodeId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-colors cursor-pointer"
            >
              <optgroup label="Core IRCd Hubs (Switch SUPERNAP / Citadel / The Keep 100G Optical Core)">
                <option value="master_hub">
                  Hub 001 &bull; irc.drfun1.com:6697 (TLS 1.3 SSL) &bull; Las Vegas SUPERNAP Core
                </option>
                <option value="media_hub">
                  Hub 002 &bull; irc.drfun1media.com:6697 (TLS 1.3 SSL) &bull; Broadcast Teleport Hub
                </option>
                <option value="medianet_hub">
                  Hub 003 &bull; irc.drfun1media.net:6697 (TLS 1.3 SSL) &bull; MediaNet Relay Hub (Reno)
                </option>
                <option value="ircd_hub">
                  Hub 004 &bull; drfun1ircd.com:6697 (TLS 1.3 SSL) &bull; Core Federation Hub (Atlanta)
                </option>
              </optgroup>
              <optgroup label="Hub 1 Switch.com Nodes (500 Dedicated Nodes on irc.drfun1.com via CGW Law Offices)">
                {HUB1_500_SWITCH_NODES.slice(0, 40).map((node) => (
                  <option key={node.id} value={node.id}>
                    Node {node.sid} &bull; {node.host} &bull; {node.location} ({node.latencyMs}ms)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Hub 1 DataPacket.com Leafs (12 Dedicated 100G Leafs on irc.drfun1.com)">
                {HUB1_12_DATAPACKET_NODES.map((node) => (
                  <option key={node.id} value={node.id}>
                    Node {node.sid} &bull; {node.host} &bull; {node.location} ({node.latencyMs}ms)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Hub 2 Switch.com Nodes (500 Dedicated Nodes on irc.drfun1media.com via CGW Law Offices)">
                {HUB2_500_SWITCH_NODES.slice(0, 40).map((node) => (
                  <option key={node.id} value={node.id}>
                    Node {node.sid} &bull; {node.host} &bull; {node.location} ({node.latencyMs}ms)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Hub 2 DataPacket.com Leafs (12 Dedicated 100G Leafs on irc.drfun1media.com)">
                {HUB2_12_DATAPACKET_NODES.map((node) => (
                  <option key={node.id} value={node.id}>
                    Node {node.sid} &bull; {node.host} &bull; {node.location} ({node.latencyMs}ms)
                  </option>
                ))}
              </optgroup>
              <optgroup label="RisingNet.com Dedicated Servers (10 Servers Synced &amp; Leafed to Both Hubs)">
                {RISINGNET_10_DEDICATED_SERVERS.map((node) => (
                  <option key={node.id} value={node.id}>
                    Server {node.sid} &bull; {node.host} &bull; {node.location} ({node.latencyMs}ms)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Row 3: Initial Channel & Ident */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-sky-400" />
                <span>Initial Channel:</span>
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="#lobby">#lobby (Official Network Flagship Lobby &bull; Fubo/Twitch Relay)</option>
                <option value="#drfun1-media">#drfun1-media (Main Broadcast Stream &amp; TV)</option>
                <option value="#fubo-sports">#fubo-sports (Fubo.tv Live Sports Ingest &bull; 4K)</option>
                <option value="#drfun1-primetv">#drfun1-primetv (Prime TV 4K Broadcast)</option>
                <option value="#c-band-space">#c-band-space (C-Band Space Teleports)</option>
                <option value="#5g-ntn">#5g-ntn (3GPP Non-Terrestrial 5G)</option>
                <option value="#whitehouse-briefings">#whitehouse-briefings (Official Regulatory)</option>
                <option value="#switch-supernap">#switch-supernap (Switch Core NOC)</option>
                {ALL_DRFUN1_MEDIA_CHANNELS.slice(0, 10).map((ch) => (
                  <option key={ch.name} value={ch.name}>
                    {ch.name} ({ch.frequencyBand})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ident / Username:</span>
              </label>
              <input
                type="text"
                value={ident}
                onChange={(e) => setIdent(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="webirc"
                className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Row 4: Server Password / NickServ Key (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-400 font-normal flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Server Password / NickServ Key (Optional):</span>
              </label>
              <span className="text-[10px] text-slate-500">Leave blank for guest access</span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Preferences Checkboxes */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={autoConnectOnStartup}
                onChange={(e) => setAutoConnectOnStartup(e.target.checked)}
                className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-950 cursor-pointer"
              />
              <span>Remember session &amp; auto-connect on startup</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={openFullTabAfterLogin}
                onChange={(e) => setOpenFullTabAfterLogin(e.target.checked)}
                className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-950 cursor-pointer"
              />
              <span>Open full-screen IRC tab</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-center text-xs"
            >
              Browse Directory First (Skip)
            </button>

            <button
              type="submit"
              disabled={isConnecting || !nick.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-bold transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Negotiating TLS Handshake...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Connect &amp; Join IRC ({nick})</span>
                </>
              )}
            </button>
          </div>

          {/* Network Licensing Telemetry Tag */}
          <div className="pt-2 text-[10px] text-slate-500 text-center flex flex-wrap items-center justify-center gap-2">
            <span>Switch 500/Hub via CGW Law Offices</span>
            <span>&bull;</span>
            <span>12 DataPacket/Hub</span>
            <span>&bull;</span>
            <span>10 RisingNet Dedicated Servers (Dual-Hub)</span>
            <span>&bull;</span>
            <span>Licensed: www.wittlawfirm.com | Payment: Owens Company (Bill in Receiving)</span>
          </div>

        </form>

      </div>
    </div>
  );
};
