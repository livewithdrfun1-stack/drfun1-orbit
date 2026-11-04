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
  Crown
} from 'lucide-react';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { UserMembershipState } from '../types/membership';

export type AppTab = 'directory' | 'orbits' | 'compare' | 'rfq' | 'store' | 'stream' | 'social' | 'irc' | 'ircstats' | 'media' | 'carriers' | 'mpd' | 'duplicator' | 'community' | 'znc' | 'integrations';

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
              onClick={() => setActiveTab('media')}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
              title="DrFun1 Media - Broadcasting & Satcom Network"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-sky-500 p-0.5 shadow-md shadow-purple-900/40 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent" />
                  <Tv className="w-4 h-4 text-purple-400 group-hover:text-pink-300 transition-colors relative z-10" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse z-10" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-purple-300 transition-colors whitespace-nowrap">
                    DrFun1 <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400 bg-clip-text text-transparent">Media</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                    LIVE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 -mt-0.5 hidden sm:inline">
                  Broadcasting &amp; Satcom Network
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
                activeTab === 'compare'
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
          ======================================================== */}
      <div className="bg-slate-950 overflow-x-auto custom-nav-scrollbar">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center gap-2 text-xs font-medium text-slate-400 min-w-max">
          
          {/* Directory */}
          <button
            onClick={() => setActiveTab('directory')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-2.5 rounded-lg border cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-sky-500/15 text-sky-400 border-sky-500/40 font-semibold shadow-sm shadow-sky-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            Directory
          </button>

          {/* DrFun1TV & Master Studio */}
          <button
            onClick={() => setActiveTab('media')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-2.5 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'media'
                ? 'bg-purple-500/15 text-purple-400 border-purple-500/40 font-semibold shadow-sm shadow-purple-500/10'
                : 'text-slate-400 border-transparent hover:text-purple-300 hover:bg-slate-900/60'
            }`}
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            <span>DrFun1TV &amp; Studio</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
              DrFun1TV
            </span>
          </button>

          {/* Social Media Link in Main Navbar */}
          <button
            onClick={() => setActiveTab('social')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'social'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 font-bold shadow-md shadow-blue-500/20 ring-1 ring-blue-500/30'
                : 'text-slate-300 border-slate-800 hover:text-white hover:bg-slate-900/80 hover:border-blue-500/40'
            }`}
            title="DrFun1 SpaceBook Social Media Network"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-slate-100">Social Media</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-600/30 text-blue-200 font-bold border border-blue-500/30">
              SpaceBook
            </span>
          </button>

          {/* Community & Members */}
          <button
            onClick={() => setActiveTab('community')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'community'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border-cyan-500/60 font-bold shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/40'
                : 'text-slate-300 border-slate-800 hover:text-white hover:bg-slate-900/80 hover:border-cyan-500/40'
            }`}
            title="DRFUN1 Community Hub, Broadcaster Lounge & Free/Paid Membership Tiers"
          >
            <Crown className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-100">Community &amp; Members</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              Hub
            </span>
          </button>

          {/* Phone Carriers */}
          <button
            onClick={() => setActiveTab('carriers')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-2.5 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'carriers'
                ? 'bg-sky-500/15 text-sky-400 border-sky-500/40 font-semibold shadow-sm shadow-sky-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>Phone Carriers</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold">
              NTN
            </span>
          </button>

          {/* Store & Resell */}
          <button
            onClick={() => setActiveTab('store')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-2.5 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'store'
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 font-semibold shadow-sm shadow-amber-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Store &amp; Resell</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
              ECOM
            </span>
          </button>

          {/* IRCD Stats Page (stats.drfun1ircd.com) */}
          <button
            onClick={() => setActiveTab('ircstats')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ircstats'
                ? 'bg-purple-600/25 text-purple-200 border-purple-500/60 font-bold shadow-md shadow-purple-900/30 ring-1 ring-purple-500/40'
                : 'text-slate-300 border-slate-800 hover:text-white hover:bg-slate-900/80 hover:border-purple-500/40'
            }`}
            title="stats.drfun1ircd.com - UnrealIRCd 6.1.4 & ZNC 1.9.1 Live Cluster Stats & Leaf Telemetry"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-slate-100">IRCD Stats</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/25 text-purple-300 font-bold border border-purple-500/30">
              stats.drfun1ircd.com
            </span>
          </button>

          {/* ZNC Web Control Panel (Port 5000) */}
          <button
            onClick={() => {
              if (onOpenZncWebAdmin) {
                onOpenZncWebAdmin();
              } else {
                setActiveTab('znc');
              }
            }}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'znc'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                : 'text-slate-300 border-slate-800 hover:text-white hover:bg-slate-900/80 hover:border-emerald-500/40'
            }`}
            title="ZNC 1.9.1 Web Control Panel (Port 5000 SSL) - Bouncer User Accounts, Channels, Buffers & Upstream Leaf Sync"
          >
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-100">ZNC WebAdmin</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              :5000
            </span>
          </button>

          {/* Integration Hub (Public Satellite Telemetry APIs) */}
          <button
            onClick={() => setActiveTab('integrations')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'integrations'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/40'
                : 'text-slate-300 border-slate-800 hover:text-white hover:bg-slate-900/80 hover:border-cyan-500/40'
            }`}
            title="Satellite Telemetry Integration Hub - Connect CelesTrak, NASA DONKI, NOAA SWPC, SatNOGS & OpenNotify via Secure Ingestion Form"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-100">Integration Hub</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              Telemetry
            </span>
          </button>

          {/* Orbital Fleets */}
          <button
            onClick={() => setActiveTab('orbits')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-2.5 rounded-lg border cursor-pointer ${
              activeTab === 'orbits'
                ? 'bg-sky-500/15 text-sky-400 border-sky-500/40 font-semibold shadow-sm shadow-sky-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            Orbital Fleets
          </button>

          {/* RFQ Builder */}
          <button
            onClick={() => setActiveTab('rfq')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-2.5 rounded-lg border cursor-pointer ${
              activeTab === 'rfq'
                ? 'bg-sky-500/15 text-sky-400 border-sky-500/40 font-semibold shadow-sm shadow-sky-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            RFQ Builder
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

          {/* Group 1: Broadcasting & Media Networks */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
              Broadcasting &amp; Media Networks
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {[
                { id: 'media', label: 'DrFun1TV & Master Studio', badge: '14 Tools', color: 'purple', icon: Tv },
                { id: 'ircstats', label: 'stats.drfun1ircd.com', badge: 'Telemetry', color: 'purple', icon: Activity },
                { id: 'integrations', label: 'Integration Hub (Telemetry APIs)', badge: 'API Hub', color: 'cyan', icon: Radio },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMobileTab(item.id as AppTab)}
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all cursor-pointer min-h-[44px] ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-200 border-purple-500 font-bold shadow'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-purple-400" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 2: Communications & Social */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold block">
              Communications &amp; Social
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {[
                { id: 'community', label: 'Community & Memberships', badge: 'Hub & Tiers', color: 'cyan', icon: Crown },
                { id: 'social', label: 'SpaceBook Social Network', badge: 'Live Feed', color: 'blue', icon: Users },
                { id: 'carriers', label: 'Phone Carriers (5G NTN)', badge: '3GPP NTN', color: 'sky', icon: Smartphone },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMobileTab(item.id as AppTab)}
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all cursor-pointer min-h-[44px] ${
                      isActive
                        ? 'bg-sky-600/20 text-sky-200 border-sky-500 font-bold shadow'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-sky-400" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 3: Satcom Directory, Store & Resell */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
              Satcom Fleet &amp; Wholesale Store
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {[
                { id: 'directory', label: 'Operator Directory', badge: 'Global', color: 'sky', icon: Satellite },
                { id: 'store', label: 'Store & Resell Marketplace', badge: 'Wholesale', color: 'amber', icon: Sparkles },
                { id: 'orbits', label: 'Orbital Fleets Visualizer', badge: '3D Orbit', color: 'sky', icon: Globe },
                { id: 'compare', label: 'Compare Operators Matrix', badge: 'VS', color: 'sky', icon: Scale },
                { id: 'rfq', label: 'Outreach & RFQ Builder', badge: 'Inquiries', color: 'sky', icon: Share2 },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMobileTab(item.id as AppTab)}
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all cursor-pointer min-h-[44px] ${
                      isActive
                        ? 'bg-amber-600/20 text-amber-200 border-amber-500 font-bold shadow'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-amber-400" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      {item.badge}
                    </span>
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
