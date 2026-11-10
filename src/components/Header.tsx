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
  Headphones
} from 'lucide-react';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { UserMembershipState } from '../types/membership';

export type AppTab = 'irc' | 'master_control' | 'fubotv' | 'store' | 'radio_dj';

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

  const handleSelectMobileTab = (tab: AppTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      
      {/* ========================================================
          ROW 1: Brand Wordmark, Status Utilities & Global Actions
          ======================================================== */}
      <div className="border-b border-slate-800/80 overflow-x-auto custom-nav-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4 min-w-max">
          
          {/* Brand Wordmark & Logo: DrFun1 Media */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab('irc')}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
              title="DrFun1 Media - UnrealIRCd WebIRC Client & Satcom Network (Index Page)"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-purple-600 to-sky-500 p-0.5 shadow-md shadow-purple-900/40 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-purple-500/10 to-transparent" />
                  <Terminal className="w-4 h-4 text-emerald-400 group-hover:text-purple-300 transition-colors relative z-10" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse z-10" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-purple-300 transition-colors whitespace-nowrap">
                    DrFun1 <span className="bg-gradient-to-r from-emerald-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">WebIRC</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                    INDEX
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 -mt-0.5 hidden sm:inline">
                  352-Leaf Mesh &bull; Dual Core Hubs
                </span>
              </div>
            </button>
          </div>

          {/* Row 1 Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 font-mono">
            {/* Compare Tool */}
            <button
              onClick={onOpenCompare}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
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
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-emerald-950/70 to-teal-950/70 text-emerald-300 hover:text-white hover:bg-emerald-900/80 border-emerald-500/50 hover:border-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-emerald-950/30"
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

            {/* IRCD & Anope Ops Panel */}
            {onOpenIrcdAdmin && (
              <button
                onClick={onOpenIrcdAdmin}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-purple-950/40 text-purple-300 hover:text-white hover:bg-purple-900/60 border-purple-500/40 hover:border-purple-400 transition-colors flex items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-purple-950/30"
                title="UnrealIRCd & Anope Services Ops & NetAdmin Web Control Center (set by www.wittlawfirm.com)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">IRCD NetAdmin &amp; Ops</span>
                <span className="sm:hidden">NetAdmin</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-purple-400/20 text-purple-300 font-bold">
                  {activeOperRank === 'sra' ? '~ Owner' : activeOperRank && ['op', 'sop', 'founder', 'so', 'admin'].includes(activeOperRank) ? 'Ops+' : 'Anope'}
                </span>
              </button>
            )}

            {/* ZNC 1.9.1 Web Control Panel (Port 5000) */}
            {onOpenZncWebAdmin && (
              <button
                onClick={onOpenZncWebAdmin}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-emerald-950/40 text-emerald-300 hover:text-white hover:bg-emerald-900/60 border-emerald-500/40 hover:border-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-emerald-950/30"
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
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-purple-950/60 to-indigo-950/60 text-indigo-300 hover:text-white hover:bg-indigo-900/70 border-indigo-500/40 hover:border-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-indigo-950/30"
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
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-amber-950/40 text-amber-300 hover:text-white hover:bg-amber-900/60 border-amber-500/40 hover:border-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-amber-950/30"
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
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-sky-950/60 to-teal-950/60 text-sky-300 hover:text-white hover:bg-sky-900/70 border-sky-500/40 hover:border-sky-400 transition-colors flex items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-sky-950/30"
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
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-sky-950/70 text-sky-300 hover:text-white hover:border-sky-400 border-sky-500/40 transition-colors flex items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-purple-950/30"
                title="dev.drfun1media.com Developer Platform - Supervised by The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)"
              >
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline font-bold">Dev Platform</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-purple-400/20 text-purple-300 font-bold">
                  WittLaw
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
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 text-purple-300 hover:text-white hover:bg-purple-900/80 border-purple-500/50 hover:border-purple-400 transition-colors flex items-center gap-1.5 cursor-pointer font-mono shadow-sm shadow-purple-950/30"
              title="UnrealIRCd 6.1.4 Client - irc.drfun1.com:6697 (SSL) - Click to Login or Open Chat"
            >
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline font-bold">IRC Client:</span>
              <span className="text-emerald-300 font-bold max-w-[100px] truncate">{ircNick || 'RichardAlanWitt'}</span>
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
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-cyan-950/70 text-cyan-300 hover:text-white hover:border-cyan-400 border-cyan-500/40 transition-colors flex items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-cyan-950/40"
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
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-purple-950/60 to-cyan-950/60 text-cyan-300 hover:text-white hover:border-cyan-400 border-cyan-500/40 transition-colors flex items-center gap-1.5 cursor-pointer font-sans shadow-sm shadow-cyan-950/30"
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
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-slate-900/80 text-slate-300 hover:text-white hover:border-emerald-500/50 transition-colors flex items-center gap-1.5 cursor-pointer hidden sm:flex font-sans"
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
                className="px-2.5 py-1.5 text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
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
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
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
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg lg:hidden transition-colors flex items-center justify-center cursor-pointer min-h-[36px] min-w-[36px]"
              aria-label="Toggle Mobile Menu"
              title="Open Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-purple-400" /> : <Menu className="w-4 h-4 text-slate-300" />}
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================
          ROW 2: Main Nav Links & Category Tabs (Full-Width Strip)
          6 Core Unified Hubs
          ======================================================== */}
      <div className="bg-slate-950 overflow-x-auto custom-nav-scrollbar border-b border-slate-800/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between gap-1 sm:gap-2 text-xs font-medium text-slate-400 min-w-max">
          
          {/* 1. Primary Index: Unified UnrealIRCd WebIRC Client & 352-Leaf Mesh */}
          <button
            onClick={() => setActiveTab('irc')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'irc'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                : 'text-slate-400 border-transparent hover:text-emerald-300 hover:bg-slate-900/60'
            }`}
            title="Index Main Page: UnrealIRCd 6.1.4 WebIRC Client (irc.drfun1.com & irc.drfun1media.com:6697 SSL), 352 Global Leaf Nodes & Anope Services"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>WebIRC &amp; Leaf Mesh (Index)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              352 Nodes
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

        </nav>
      </div>

      {/* ========================================================
          MOBILE EXPANDABLE NAVIGATION DRAWER (< lg screens)
          ======================================================== */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/98 max-h-[82vh] overflow-y-auto px-4 py-4 space-y-4 shadow-2xl backdrop-blur-2xl">
          
          {/* Quick Actions Grid for Mobile */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pb-3 border-b border-slate-800/80">
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
          </div>

          {/* The 6 Core Unified Hubs for Mobile */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold block">
              Core Platforms &amp; Unified Hubs
            </span>
            <div className="grid grid-cols-1 gap-2">
              {[
                { 
                  id: 'irc', 
                  label: 'WebIRC & Leaf Mesh (Index)', 
                  desc: 'UnrealIRCd 6.1.4 Client, 352 Leaf Nodes Search & Anope 2.1 Services',
                  badge: '352 Nodes', 
                  color: 'emerald', 
                  icon: Terminal 
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
