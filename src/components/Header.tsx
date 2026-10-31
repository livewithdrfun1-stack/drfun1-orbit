import React from 'react';
import { 
  Satellite, 
  Download, 
  Plus, 
  ShoppingBag, 
  Sparkles, 
  Smartphone, 
  Scale, 
  Server
} from 'lucide-react';

export type AppTab = 'directory' | 'orbits' | 'compare' | 'rfq' | 'store' | 'stream' | 'social' | 'irc' | 'media' | 'carriers' | 'mpd' | 'duplicator';

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
  cartCount?: number;
  onOpenCart?: () => void;
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
  cartCount = 0,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      
      {/* ========================================================
          ROW 1: Brand Wordmark, Status Utilities & Global Actions
          ======================================================== */}
      <div className="border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          
          {/* Brand Wordmark & Tag */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm shadow-sky-500/10">
              <Satellite className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <button 
                onClick={() => setActiveTab('directory')}
                className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-sky-400 transition-colors whitespace-nowrap cursor-pointer"
              >
                DrFun1 Orbit
              </button>
              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                Satcom &amp; Broadcast Mesh
              </span>
            </div>
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
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Switch Mesh</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* License Certificate */}
            <button
              onClick={onOpenLicense}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-slate-900/80 text-slate-400 hover:text-sky-300 border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer hidden sm:flex font-sans"
            >
              <span>License</span>
              <span className="text-[10px] text-emerald-400">●</span>
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
              className="px-3 py-1.5 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-sky-500/10 cursor-pointer font-sans font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Operator</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================
          ROW 2: Main Nav Links & Category Tabs (Full-Width Strip)
          ======================================================== */}
      <div className="bg-slate-950">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-medium text-slate-400">
          
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

          {/* Radio & TV */}
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
            <span>Radio &amp; TV</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
              DrFun1
            </span>
          </button>

          {/* MPD Bot */}
          <button
            onClick={() => setActiveTab('mpd')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-2.5 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'mpd'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-semibold shadow-sm shadow-emerald-500/10'
                : 'text-slate-400 border-transparent hover:text-emerald-300 hover:bg-slate-900/60'
            }`}
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>MPD Bot</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              DJ Deck
            </span>
          </button>

          {/* IRC Duplicator */}
          <button
            onClick={() => setActiveTab('duplicator')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-2.5 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'duplicator'
                ? 'bg-sky-500/15 text-sky-400 border-sky-500/40 font-semibold shadow-sm shadow-sky-500/10'
                : 'text-slate-400 border-transparent hover:text-sky-300 hover:bg-slate-900/60'
            }`}
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
            <span>IRC Duplicator</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold">
              Relay Hub
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

          {/* MultiStream */}
          <button
            onClick={() => setActiveTab('stream')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-2.5 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'stream'
                ? 'bg-red-500/15 text-red-400 border-red-500/40 font-semibold shadow-sm shadow-red-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span>MultiStream</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-red-500/20 text-red-300 font-bold">
              Restream
            </span>
          </button>

          {/* SpaceBook Social */}
          <button
            onClick={() => setActiveTab('social')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-2.5 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'social'
                ? 'bg-blue-500/15 text-blue-400 border-blue-500/40 font-semibold shadow-sm shadow-blue-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded bg-blue-600 text-[9px] font-bold text-white flex items-center justify-center">
              f
            </span>
            <span>SpaceBook</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold">
              Social
            </span>
          </button>

          {/* IRC Client */}
          <button
            onClick={() => setActiveTab('irc')}
            className={`whitespace-nowrap shrink-0 transition-all py-1 px-2.5 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'irc'
                ? 'bg-purple-500/15 text-purple-400 border-purple-500/40 font-semibold shadow-sm shadow-purple-500/10'
                : 'text-slate-400 border-transparent hover:text-purple-300 hover:bg-slate-900/60'
            }`}
          >
            <span className="font-mono text-purple-400 font-bold text-xs">&gt;_</span>
            <span>IRC Client</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
              RisingNet
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

    </header>
  );
};
