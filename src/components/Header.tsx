import React from 'react';
import { 
  Satellite, 
  Download, 
  Plus, 
  ShoppingBag, 
  Sparkles, 
  Smartphone, 
  Scale, 
  Server,
  TrendingUp,
  ShieldCheck,
  Network,
  Users,
  Share2,
  Tv,
  Radio,
  Activity,
  Menu,
  X,
  ChevronRight,
  Hash,
  Terminal,
  Globe,
  Crown,
  Search,
  Cpu,
  Video,
  Headphones,
  Mic,
  KeyRound,
  Rss,
  Newspaper
} from 'lucide-react';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { getRankDefinition } from '../utils/ircdAccess';
import { UserMembershipState } from '../types/membership';
import { DrFun1MediaLogo } from './DrFun1MediaLogo';

export type AppTab = 'irc' | 'duplicator_hosting' | 'satcom_companies' | 'satcom_rss' | 'master_control' | 'fubotv' | 'drfun1_tv' | 'drfun1_news' | 'social_control' | 'store' | 'radio_dj' | 'podcast_uplink' | 'tvu_red5_twitch';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenAddModal: () => void;
  onExport: () => void;
  savedCount: number;
  compareCount: number;
  onOpenCompare: () => void;
  onOpenLicense: () => void;
  onOpenSwitchMesh: () => void;
  onOpenSwitchWittServices?: () => void;
  onOpenResellerProgram?: () => void;
  onOpenIrcdAdmin?: () => void;
  onOpenRankAccess?: () => void;
  onOpenZncWebAdmin?: () => void;
  activeOperRank?: AnopeRankLevel;
  cartCount?: number;
  onOpenCart?: () => void;
  userMembership?: UserMembershipState;
  onOpenMembershipModal?: () => void;
  onOpenUnrealSearch?: () => void;
  onOpenDomainSearch?: () => void;
  onOpenOrbitMapModal?: () => void;
  onOpenIrcLogin?: () => void;
  onOpenDevPlatform?: () => void;
  ircNick?: string;
  isIrcConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onExport,
  savedCount,
  compareCount,
  onOpenCompare,
  onOpenLicense,
  onOpenSwitchMesh,
  onOpenSwitchWittServices,
  onOpenResellerProgram,
  onOpenIrcdAdmin,
  onOpenRankAccess,
  onOpenZncWebAdmin,
  onOpenUnrealSearch,
  onOpenDomainSearch,
  onOpenOrbitMapModal,
  onOpenIrcLogin,
  onOpenDevPlatform,
  ircNick,
  isIrcConnected = true,
  activeOperRank,
  cartCount = 0,
  onOpenCart,
  userMembership,
  onOpenMembershipModal,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const activeRankDef = getRankDefinition(activeOperRank || 'op');

  const handleSelectMobileTab = (tab: AppTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      
      {/* ========================================================
          ROW 1: Brand Wordmark, Status Utilities & Global Actions
          ======================================================== */}
      <div className="border-b border-slate-800/80 lg:overflow-x-auto custom-nav-scrollbar">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4 min-w-0 lg:min-w-max">
          
          {/* Brand Wordmark & Logo: DrFun1Media in Purple and Gold */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            <button 
              onClick={() => setActiveTab('drfun1_news')}
              className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer text-left min-w-0"
              title="DrFun1Media - DrFun1 News Global TV Service & D3 World Map (Index Page)"
            >
              {/* Purple & Gold Logo Mark */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-gradient-to-tr from-purple-600 via-amber-400 to-yellow-500 p-0.5 shadow-md shadow-purple-900/50 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden border border-amber-500/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/35 via-amber-500/20 to-transparent" />
                  <Terminal className="w-4 h-4 text-amber-300 group-hover:text-purple-300 transition-colors relative z-10 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-950 animate-pulse z-10 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                </div>
              </div>
              <DrFun1MediaLogo
                size="md"
                variant="purple-gold"
                badge="INDEX"
                badgeColor="purple-gold"
                showSubtitle={true}
                subtitleText="1,034 Leaf Nodes (500 Switch/Hub via CGW · 12 DataPacket · 10 RisingNet) · Dual Hubs"
              />
            </button>
          </div>

          {/* Row 1 Actions & Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 font-mono">
            {/* Compare Tool */}
            <button
              onClick={onOpenCompare}
              className={`hidden lg:flex px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors items-center gap-1.5 cursor-pointer ${
                compareCount > 0
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline font-sans">Compare</span>
              {compareCount > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Switch Colocation Mesh */}
            <button
              onClick={onOpenSwitchMesh}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-slate-900/80 text-slate-400 hover:text-emerald-300 border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer hidden md:flex font-sans"
              title="Switch Colocation & UnrealIRCd 25 Leaf Node Telemetry"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Switch Mesh</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* Switch Owned Infrastructure & Witt Law Satellite Fiber Services */}
            {onOpenSwitchWittServices && (
              <button
                onClick={onOpenSwitchWittServices}
                className="hidden lg:flex px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-emerald-950/70 to-teal-950/70 text-emerald-300 hover:text-white hover:bg-emerald-900/80 border-emerald-500/50 hover:border-emerald-400 transition-colors items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-emerald-950/30"
                title="Switch.com Owned Infrastructure & Witt Law Firm Satellite Fiber Services (Cert: RAW-SATCOM-2026-LIC-0881 | FCC FRN: 0034981290)"
              >
                <Network className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Switch &amp; Witt Fiber</span>
                <span className="sm:hidden">Switch/Witt</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-400/20 text-emerald-300 font-bold hidden xl:inline">
                  SuperLoop
                </span>
              </button>
            )}

            {/* IRCD 14-Tier Rank Access Matrix */}
            {onOpenRankAccess && (
              <button
                onClick={onOpenRankAccess}
                className="flex px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-amber-950/40 text-amber-200 hover:text-white hover:bg-amber-900/50 border-amber-500/40 hover:border-amber-400 transition-colors items-center gap-1.5 cursor-pointer font-sans"
                title={`Active IRCD Rank: ${activeRankDef.name} (Level ${activeRankDef.accessLevel}) — Click to switch rank or inspect site permissions`}
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono font-bold text-white">
                  {activeRankDef.prefix}{activeRankDef.shortLabel}
                </span>
                <span className="hidden sm:inline text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
                  Lvl {activeRankDef.accessLevel}
                </span>
              </button>
            )}

            {/* IRCD & Anope Ops Panel */}
            {onOpenIrcdAdmin && (
              <button
                onClick={onOpenIrcdAdmin}
                className="hidden lg:flex px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-purple-950/40 text-purple-300 hover:text-white hover:bg-purple-900/60 border-purple-500/40 hover:border-purple-400 transition-colors items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-purple-950/30"
                title="UnrealIRCd & Anope Services Ops & NetAdmin Web Control Center (set by www.wittlawfirm.com)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">IRCD NetAdmin &amp; Ops</span>
                <span className="sm:hidden">NetAdmin</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-purple-400/20 text-purple-300 font-bold">
                  {activeRankDef.shortLabel}
                </span>
              </button>
            )}

            {/* ZNC 1.9.1 Web Control Panel (Port 5000) */}
            {onOpenZncWebAdmin && (
              <button
                onClick={onOpenZncWebAdmin}
                className="hidden lg:flex px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-emerald-950/40 text-emerald-300 hover:text-white hover:bg-emerald-900/60 border-emerald-500/40 hover:border-emerald-400 transition-colors items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-emerald-950/30"
                title="ZNC 1.9.1 Web Control Panel (Port 5000) - Bouncer Accounts, Channels, Buffers & Upstream Leaf (znc.git)"
              >
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">ZNC WebAdmin</span>
                <span className="sm:hidden">ZNC</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-400/20 text-emerald-300 font-bold">
                  :5000
                </span>
              </button>
            )}

            {/* IRC Channel & Leafed IRCD Network Search Engine (855,000 Channels & 26 Leaves) */}
            {onOpenUnrealSearch && (
              <button
                onClick={onOpenUnrealSearch}
                className="hidden lg:flex px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-purple-950/60 to-indigo-950/60 text-indigo-300 hover:text-white hover:bg-indigo-900/70 border-indigo-500/40 hover:border-indigo-400 transition-colors items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-indigo-950/30"
                title="IRC Channel & Leafed IRCD Network Search Engine - 855,000 Channels & 26 Switch SUPERNAP Leaves (irc.drfun1.com:6697)"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">IRC Channel &amp; Leafed IRCD Search</span>
                <span className="sm:hidden">IRCD Search</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-400/20 text-indigo-300 font-bold">
                  855k Sync
                </span>
              </button>
            )}

            {/* Hosting Reseller Program */}
            {onOpenResellerProgram && (
              <button
                onClick={onOpenResellerProgram}
                className="hidden lg:flex px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-amber-950/40 text-amber-300 hover:text-white hover:bg-amber-900/60 border-amber-500/40 hover:border-amber-400 transition-colors items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-amber-950/30"
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Turnkey Reseller</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
                  Co-Brand / Resell
                </span>
              </button>
            )}

            {/* Domain Name Search & ICANN Registrar */}
            {onOpenDomainSearch && (
              <button
                onClick={onOpenDomainSearch}
                className="hidden lg:flex px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-sky-950/60 to-teal-950/60 text-sky-300 hover:text-white hover:bg-sky-900/70 border-sky-500/40 hover:border-sky-400 transition-colors items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-sky-950/30"
                title="Search & Register Custom Domains with Anycast DNS"
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Domains</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-sky-400/20 text-sky-300 font-bold hidden xl:inline">
                  .tv / .com
                </span>
              </button>
            )}

            {/* dev.drfun1media.com Developer Platform & WittLaw Moderation */}
            {onOpenDevPlatform && (
              <button
                onClick={onOpenDevPlatform}
                className="hidden lg:flex px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-sky-950/70 text-sky-300 hover:text-white hover:border-sky-400 border-sky-500/40 transition-colors items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-purple-950/30"
                title="dev.drfun1media.com Developer Platform (dev.twitch.tv, dev.kick.com & Red5.net Broadcast) - Supervised by www.wittlawfirm.com"
              >
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline font-bold">Dev Platform</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-purple-400/20 text-purple-300 font-bold">
                  Twitch · Kick · Red5
                </span>
              </button>
            )}

            {/* IRC Client Status & Startup Login Action */}
            <button
              onClick={() => {
                if (onOpenIrcLogin) {
                  onOpenIrcLogin();
                } else {
                  setActiveTab('irc');
                }
              }}
              className="hidden sm:flex px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 text-purple-300 hover:text-white hover:bg-purple-900/80 border-purple-500/50 hover:border-purple-400 transition-colors items-center gap-1.5 cursor-pointer font-mono shadow-sm shadow-purple-950/30"
              title="UnrealIRCd 6.1.4 Client - irc.drfun1.com:6697 (SSL) - Click to Login or Open Chat"
            >
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden xl:inline font-bold">IRC Client:</span>
              <span className="text-emerald-300 font-bold max-w-[90px] truncate">{ircNick || 'RichardAlanWitt'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </button>

            {/* Dedicated Orbit Tracking Map Quick Launcher */}
            <button
              onClick={() => {
                if (onOpenOrbitMapModal) {
                  onOpenOrbitMapModal();
                } else {
                  setActiveTab('master_control');
                }
              }}
              className="hidden lg:flex px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-cyan-950/70 text-cyan-300 hover:text-white hover:border-cyan-400 border-cyan-500/40 transition-colors items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-cyan-950/40"
              title="Real-Time Orbit Tracking Map, Ground Station Radar & Day/Night Terminator"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <Satellite className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-bold">Orbit Map</span>
              <span className="sm:hidden font-bold">Orbit</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-bold hidden md:inline">
                SGP4 Live
              </span>
            </button>

            {/* Free & Paid Broadcaster Membership Tier Button */}
            {onOpenMembershipModal && (
              <button
                onClick={onOpenMembershipModal}
                className="hidden lg:flex px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-purple-950/60 to-cyan-950/60 text-cyan-300 hover:text-white hover:border-cyan-400 border-cyan-500/40 transition-colors items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-cyan-950/30"
                title="DRFUN1 Broadcaster Membership Status & Subscription Management"
              >
                <Crown className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline font-bold">Membership</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-bold uppercase">
                  {userMembership?.tierId === 'cadet_free'
                    ? 'Cadet (Free)'
                    : userMembership?.tierId === 'broadcaster_pro'
                    ? 'Pro'
                    : userMembership?.tierId === 'satcom_enterprise'
                    ? 'Enterprise'
                    : 'VIP Council'}
                </span>
              </button>
            )}

            {/* Global Legal & License Certificate (wittlawfirm.com) */}
            <button
              onClick={onOpenLicense}
              className="hidden lg:flex px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-slate-900/80 text-slate-300 hover:text-white hover:border-emerald-500/50 transition-colors items-center gap-1.5 cursor-pointer font-sans"
              title="Global Legal Compliance & License via www.wittlawfirm.com"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Legal &amp; License</span>
              <span className="text-[10px] text-emerald-400 font-mono hidden md:inline">wittlawfirm.com</span>
            </button>

            {/* Procurement Cart */}
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                title="Procurement Cart"
                className="px-2.5 py-1.5 text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer min-h-[36px]"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline font-sans">Cart</span>
                {cartCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-sky-500 text-slate-950 text-[10px] font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Export CSV */}
            <button
              onClick={onExport}
              title="Export Directory (CSV)"
              className="hidden lg:flex p-1.5 sm:px-2.5 sm:py-1.5 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline font-sans">Export</span>
            </button>

            {/* Add Operator Trigger */}
            <button
              onClick={onOpenAddModal}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-sky-500/10 cursor-pointer font-sans font-semibold min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Operator</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg lg:hidden transition-colors flex items-center justify-center cursor-pointer min-h-[38px] min-w-[38px]"
              aria-label="Toggle Mobile Menu"
              title="Open Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-purple-400" /> : <Menu className="w-4 h-4 text-slate-300" />}
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================
          ROW 2: Main Nav Links & Category Tabs (Desktop Strip)
          On < lg screens, MobileBottomNav + Mobile Drawer handle navigation cleanly
          ======================================================== */}
      <div className="hidden lg:block bg-slate-950 overflow-x-auto custom-nav-scrollbar border-b border-slate-800/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between gap-1 sm:gap-2 text-xs font-medium text-slate-400 min-w-max">
          
          {/* 1. Primary Index: DrFun1 News (Global TV Service, D3 Map & Video IRC Overlay) */}
          <button
            onClick={() => setActiveTab('drfun1_news')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'drfun1_news'
                ? 'bg-sky-600/25 text-sky-200 border-sky-500/60 font-bold shadow-md shadow-sky-950/30 ring-1 ring-sky-500/40'
                : 'text-slate-400 border-transparent hover:text-sky-300 hover:bg-slate-900/60'
            }`}
            title="Index Main Page: DrFun1 News — Global News Outlets Dynamic Directory, D3 World Map & Live Video IRC Overlay"
          >
            <Newspaper className="w-3.5 h-3.5 text-sky-400" />
            <span>DrFun1 News (Index)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold">
              33+ Global TV
            </span>
          </button>

          {/* 1A. Unified UnrealIRCd WebIRC Client & 1,000-Leaf Mesh (500 Per Hub) */}
          <button
            onClick={() => setActiveTab('irc')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'irc'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                : 'text-slate-400 border-transparent hover:text-emerald-300 hover:bg-slate-900/60'
            }`}
            title="UnrealIRCd 6.1.4 WebIRC Client, 1,034 Global Leaf Nodes (500 Switch/Hub via CGW Law Offices, 12 DataPacket/Hub, 10 RisingNet Dedicated Servers) & Anope Services"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>WebIRC &amp; Leaf Mesh</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              1,034 Nodes
            </span>
          </button>

          {/* 1B. IRC Chat Room Duplicator Hosting */}
          <button
            onClick={() => setActiveTab('duplicator_hosting')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'duplicator_hosting'
                ? 'bg-purple-500/20 text-purple-200 border-purple-500/60 font-bold shadow-md shadow-purple-950/30 ring-1 ring-purple-500/40'
                : 'text-slate-400 border-transparent hover:text-purple-300 hover:bg-slate-900/60'
            }`}
            title="IRC Chat Room Duplicator Hosting - 4-Hub Channel Mirroring, WordPress Cloud Sync & Provisioning"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Duplicator Hosting</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
              4-Hub Sync
            </span>
          </button>

          {/* 1C. SATCOM Companies Directory */}
          <button
            onClick={() => setActiveTab('satcom_companies')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'satcom_companies'
                ? 'bg-sky-500/20 text-sky-200 border-sky-500/60 font-bold shadow-md shadow-sky-950/30 ring-1 ring-sky-500/40'
                : 'text-slate-400 border-transparent hover:text-sky-300 hover:bg-slate-900/60'
            }`}
            title="Full Directory of SATCOM Companies, LEO/MEO/GEO Operators, Wholesale Contacts & Interconnects"
          >
            <Satellite className="w-3.5 h-3.5 text-sky-400" />
            <span>SATCOM Companies</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold">
              36+ Operators
            </span>
          </button>

          {/* 1D. Satcom RSS News Feed */}
          <button
            onClick={() => setActiveTab('satcom_rss')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'satcom_rss'
                ? 'bg-teal-500/20 text-teal-200 border-teal-500/60 font-bold shadow-md shadow-teal-950/30 ring-1 ring-teal-500/40'
                : 'text-slate-400 border-transparent hover:text-teal-300 hover:bg-slate-900/60'
            }`}
            title="Live Satcom RSS News Feed — FCC Space Bureau, SpaceNews, Via Satellite, SatNews, NASA SCaN, ESA & ITU BR XML/OPML Feeds"
          >
            <Rss className="w-3.5 h-3.5 text-teal-400" />
            <span>Satcom RSS Feed</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold">
              7+ Feeds
            </span>
          </button>

          {/* 2. Online Radio & MPD DJ Station */}
          <button
            onClick={() => setActiveTab('radio_dj')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'radio_dj'
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/60 font-bold shadow-md shadow-pink-950/30 ring-1 ring-pink-500/40'
                : 'text-slate-400 border-transparent hover:text-pink-300 hover:bg-slate-900/60'
            }`}
            title="Online Radio Streaming (SHOUTcast/Icecast), Dual-Deck MPD DJ Console, 855k YouTube Music Catalog & Request Bot"
          >
            <Headphones className="w-3.5 h-3.5 text-pink-400" />
            <span>Online Radio &amp; MPD DJ</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-bold">
              SHOUTcast FM
            </span>
          </button>

          {/* 2B. DrFun1 Podcasting Uplink (Podserv.fm Rebrand) */}
          <button
            onClick={() => setActiveTab('podcast_uplink')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'podcast_uplink'
                ? 'bg-amber-500/20 text-amber-200 border-amber-500/60 font-bold shadow-md shadow-amber-950/30 ring-1 ring-amber-500/40'
                : 'text-slate-400 border-transparent hover:text-amber-300 hover:bg-slate-900/60'
            }`}
            title="DrFun1 Podcasting Uplink — Podserv RSS 2.0 Hosting, Episode Publishing, IAB v2.1 Analytics & SATCOM Audio Sync"
          >
            <Mic className="w-3.5 h-3.5 text-amber-400" />
            <span>Podcasting Uplink</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
              Podserv RSS
            </span>
          </button>

          {/* 3. Master Control & Transmission Infrastructure */}
          <button
            onClick={() => setActiveTab('master_control')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'master_control'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/40'
                : 'text-slate-400 border-transparent hover:text-cyan-300 hover:bg-slate-900/60'
            }`}
            title="Switch SUPERNAP NV 100G Teleport, DataPacket Trans-Atlantic Edge, TVU Cloud CDN, Satellite Downlinks & FCC Compliance"
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Master Control &amp; Downlinks</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
              Switch 100G
            </span>
          </button>

          {/* 4. Wholesale Satcom, Fiber, Wireless & Store Catalog (drfun1 ECOM inc) */}
          <button
            onClick={() => setActiveTab('store')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'store'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold shadow-md shadow-amber-950/30 ring-1 ring-amber-500/40'
                : 'text-slate-400 border-transparent hover:text-amber-300 hover:bg-slate-900/60'
            }`}
            title="Wholesale Satellite, Fiber, Wireless, Hardware & Store Company Directory (drfun1 ECOM inc)"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Hardware &amp; Carrier Store</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
              drfun1 ECOM
            </span>
          </button>

          {/* 5. Fubo.tv Live Sports & EPG Streaming Hub */}
          <button
            onClick={() => setActiveTab('fubotv')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'fubotv'
                ? 'bg-orange-600/25 text-orange-300 border-orange-500/60 font-bold shadow-md shadow-orange-950/30 ring-1 ring-orange-500/40'
                : 'text-slate-400 border-transparent hover:text-orange-400 hover:bg-slate-900/60'
            }`}
            title="Fubo.tv Sports-First Live TV Streaming, 4K Broadcast Player, EPG Guide, 4-Screen MultiView & Cloud DVR"
          >
            <Tv className="w-3.5 h-3.5 text-orange-500" />
            <span>Fubo.tv Sports</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 font-bold">
              4K Live
            </span>
          </button>

          {/* 5B. DrFun1-TV (YouTube TV Clone & Rebrand) */}
          <button
            onClick={() => setActiveTab('drfun1_tv')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'drfun1_tv'
                ? 'bg-red-600/25 text-red-200 border-red-500/60 font-bold shadow-md shadow-red-950/30 ring-1 ring-red-500/40'
                : 'text-slate-400 border-transparent hover:text-red-300 hover:bg-slate-900/60'
            }`}
            title="DrFun1-TV (YouTube TV Clone & Rebrand) — Live EPG, 4-Box Multiview, Key Plays & Unlimited Cloud DVR"
          >
            <Tv className="w-3.5 h-3.5 text-red-500" />
            <span>DrFun1-TV</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold">
              YouTube TV 4K
            </span>
          </button>

          {/* 5B-2 Reserved: DrFun1 News placed at primary index slot */}

          {/* 6. All-in-One TVU Networks + Red5.net + Twitch.tv + Kick.com Live Studio */}
          <button
            onClick={() => setActiveTab('tvu_red5_twitch')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tvu_red5_twitch'
                ? 'bg-purple-600/25 text-purple-200 border-purple-500/60 font-bold shadow-md shadow-purple-950/30 ring-1 ring-purple-500/40'
                : 'text-slate-400 border-transparent hover:text-purple-300 hover:bg-slate-900/60'
            }`}
            title="All-in-One TVU Networks Cellular Bonding + Red5.net WebRTC Cluster + Twitch.tv & Kick.com Live Studio"
          >
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span>TVU · Red5 · Twitch · Kick</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
              WebRTC Live
            </span>
          </button>

          {/* 7. Per-User Social Media Control Panel & www.drfun1media.com Live Feeds */}
          <button
            onClick={() => setActiveTab('social_control')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'social_control'
                ? 'bg-indigo-600/25 text-indigo-200 border-indigo-500/60 font-bold shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/40'
                : 'text-slate-400 border-transparent hover:text-indigo-300 hover:bg-slate-900/60'
            }`}
            title="Per-User Social Media Control Panel & Live Broadcast Feeds from www.drfun1media.com"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Socials &amp; Live Feeds</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
              drfun1media.com
            </span>
          </button>

        </nav>
      </div>

      {/* ========================================================
          MOBILE EXPANDABLE NAVIGATION DRAWER (< lg screens)
          ======================================================== */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/98 max-h-[82vh] overflow-y-auto px-4 py-4 space-y-4 shadow-2xl backdrop-blur-2xl">
          
          {/* Quick Actions Grid for Mobile */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pb-3 border-b border-slate-800/80">
            {onOpenRankAccess && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenRankAccess();
                }}
                className="p-2.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/50 text-amber-200 border border-amber-500/40 flex items-center justify-between gap-2 cursor-pointer col-span-2"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span className="font-bold">IRCD Rank Access: {activeRankDef.prefix}{activeRankDef.shortLabel}</span>
                </div>
                <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  Lvl {activeRankDef.accessLevel}
                </span>
              </button>
            )}

            {onOpenIrcdAdmin && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenIrcdAdmin();
                }}
                className="p-2.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 text-purple-200 border border-purple-500/40 flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="font-bold">NetAdmin Ops</span>
              </button>
            )}

            {onOpenZncWebAdmin && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenZncWebAdmin();
                }}
                className="p-2.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-200 border border-emerald-500/40 flex items-center gap-2 cursor-pointer"
              >
                <Server className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">ZNC WebAdmin</span>
              </button>
            )}

            {onOpenUnrealSearch && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenUnrealSearch();
                }}
                className="p-2.5 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-200 border border-indigo-500/40 flex items-center gap-2 cursor-pointer col-span-2 sm:col-span-1"
              >
                <Search className="w-4 h-4 text-indigo-400" />
                <span className="font-bold">UnrealIRCd Search</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 ml-auto">
                  Leaf Required
                </span>
              </button>
            )}

            {onOpenResellerProgram && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenResellerProgram();
                }}
                className="p-2.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/50 text-amber-200 border border-amber-500/40 flex items-center gap-2 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Reseller Store</span>
              </button>
            )}

            {onOpenSwitchWittServices && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSwitchWittServices();
                }}
                className="p-2.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-200 border border-emerald-500/40 flex items-center gap-2 cursor-pointer col-span-2"
              >
                <Network className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Switch &amp; Witt Satellite Fiber</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onOpenOrbitMapModal) onOpenOrbitMapModal();
                else setActiveTab('master_control');
              }}
              className="p-2.5 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-200 border border-cyan-500/40 flex items-center gap-2 cursor-pointer"
            >
              <Satellite className="w-4 h-4 text-cyan-400" />
              <span className="font-bold">Orbit Map</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenCompare();
              }}
              className="p-2.5 rounded-xl bg-sky-950/50 hover:bg-sky-900/50 text-sky-200 border border-sky-500/40 flex items-center gap-2 cursor-pointer"
            >
              <Scale className="w-4 h-4 text-sky-400" />
              <span className="font-bold">Compare ({compareCount})</span>
            </button>

            {onOpenIrcLogin && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenIrcLogin();
                }}
                className="p-2.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 text-purple-200 border border-purple-500/40 flex items-center gap-2 cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-purple-400" />
                <span className="font-bold truncate">IRC: {ircNick || 'Login'}</span>
              </button>
            )}

            {onOpenMembershipModal && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenMembershipModal();
                }}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">Membership</span>
              </button>
            )}

            {onOpenDomainSearch && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenDomainSearch();
                }}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-200 border border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-sky-400" />
                <span className="font-bold">Domains</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onExport();
              }}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span className="font-bold">Export CSV</span>
            </button>
          </div>

          {/* The 6 Core Unified Hubs for Mobile */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold block">
              Core Platforms &amp; Unified Hubs
            </span>
            <div className="grid grid-cols-1 gap-2">
              {[
                { 
                  id: 'drfun1_news', 
                  label: 'DrFun1 News (Index)', 
                  desc: 'Primary Index: 33+ Global TV News Outlets, Interactive D3 World Map & Live Video IRC Overlay',
                  badge: 'Index Live TV', 
                  color: 'sky', 
                  icon: Newspaper 
                },
                { 
                  id: 'irc', 
                  label: 'WebIRC & Leaf Mesh', 
                  desc: 'UnrealIRCd 6.1.4 Client, 1,034 Leaf Nodes (500 Switch/Hub via CGW, 12 DataPacket/Hub, 10 RisingNet Servers) & Anope 2.1 Services',
                  badge: '1,034 Nodes', 
                  color: 'emerald', 
                  icon: Terminal 
                },
                { 
                  id: 'duplicator_hosting', 
                  label: 'IRC Duplicator Hosting', 
                  desc: '4-Hub Room Mirroring, WordPress REST Bridge & Managed Relay Nodes',
                  badge: '4-Hub Sync', 
                  color: 'purple', 
                  icon: Share2 
                },
                { 
                  id: 'satcom_companies', 
                  label: 'SATCOM Companies Directory', 
                  desc: 'Full List of LEO/MEO/GEO Satellite Operators, Bands & Wholesale Desks',
                  badge: '36+ Operators', 
                  color: 'sky', 
                  icon: Satellite 
                },
                { 
                  id: 'satcom_rss', 
                  label: 'Satcom RSS News Feed', 
                  desc: 'Live Satcom Wire (FCC, SpaceNews, NASA, ESA, ITU), Custom Feeds & RSS 2.0 XML/OPML',
                  badge: '7+ Feeds XML', 
                  color: 'teal', 
                  icon: Rss 
                },
                { 
                  id: 'radio_dj', 
                  label: 'Online Radio & MPD DJ', 
                  desc: 'SHOUTcast FM Player, Dual DJ Decks, 855k YouTube Catalog',
                  badge: 'SHOUTcast FM', 
                  color: 'pink', 
                  icon: Headphones 
                },
                { 
                  id: 'podcast_uplink', 
                  label: 'DrFun1 Podcasting Uplink', 
                  desc: 'Podserv RSS 2.0 Hosting, Episode Publishing, IAB Analytics & DAI',
                  badge: 'Podserv RSS', 
                  color: 'amber', 
                  icon: Mic 
                },
                { 
                  id: 'master_control', 
                  label: 'Master Control & Downlinks', 
                  desc: 'Switch 100G Teleport, DataPacket CDN & Satellite Registry',
                  badge: 'Switch 100G', 
                  color: 'cyan', 
                  icon: Server 
                },
                { 
                  id: 'store', 
                  label: 'Hardware & Carrier Store', 
                  desc: 'Wholesale Satcom, Fiber, Wireless & Store Directory',
                  badge: 'drfun1 ECOM', 
                  color: 'amber', 
                  icon: ShoppingBag 
                },
                { 
                  id: 'fubotv', 
                  label: 'Fubo.tv Sports Stream & EPG', 
                  desc: '4K Sports, Live Matches, 4-Screen Multi-View & Cloud DVR',
                  badge: '4K Live', 
                  color: 'orange', 
                  icon: Tv 
                },
                { 
                  id: 'drfun1_tv', 
                  label: 'DrFun1-TV (YouTube TV Clone)', 
                  desc: '100+ Live Channels, Custom EPG Guide, 4-Screen Multiview, Key Plays & Unlimited Cloud DVR',
                  badge: '4K Plus DVR', 
                  color: 'red', 
                  icon: Tv 
                },

                { 
                  id: 'tvu_red5_twitch', 
                  label: 'TVU · Red5 · Twitch · Kick Studio', 
                  desc: 'TVU 5G Bonding, Red5 Pro WebRTC WHIP/WHEP Cluster, Twitch.tv & Kick.com (95/5) Live Chat',
                  badge: 'WebRTC Live', 
                  color: 'purple', 
                  icon: Video 
                },
                { 
                  id: 'social_control', 
                  label: 'Socials & drfun1media.com Feeds', 
                  desc: 'Per-User Social Media Control Panel, Multi-Platform Dispatch & Live Broadcast Feeds',
                  badge: 'Live Feeds', 
                  color: 'indigo', 
                  icon: Share2 
                },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMobileTab(item.id as AppTab)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-500/15 text-white border-sky-500 font-bold shadow-lg'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-sky-400" />
                        <span className="font-bold text-xs">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-300">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 pl-6">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legal and Compliance Footer for Mobile */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenLicense();
              }}
              className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>wittlawfirm.com Certificate</span>
            </button>
            <span className="text-[11px] text-slate-500">FRN 0034981290</span>
          </div>

        </div>
      )}

    </header>
  );
};
