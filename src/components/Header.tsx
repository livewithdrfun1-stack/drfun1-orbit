import React from 'react';
import { Satellite, Download, Plus, Bookmark, ShoppingBag, Sparkles, Smartphone } from 'lucide-react';

export type AppTab = 'directory' | 'orbits' | 'compare' | 'rfq' | 'store' | 'stream' | 'social' | 'irc' | 'media' | 'carriers';

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
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand wordmark (single text element, no subtitle clutter) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Satellite className="w-5 h-5" />
          </div>
          <button 
            onClick={() => setActiveTab('directory')}
            className="text-lg font-bold tracking-tight text-white hover:text-sky-400 transition-colors whitespace-nowrap"
          >
            DrFun1 Orbit
          </button>
        </div>

        {/* Zone 2: Single-line clean text nav links */}
        <nav className="hidden xl:flex items-center gap-3.5 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('directory')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'directory'
                ? 'text-sky-400 border-sky-400 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Directory
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'media'
                ? 'text-purple-400 border-purple-400 font-semibold'
                : 'text-slate-400 border-transparent hover:text-purple-300'
            }`}
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            <span>Radio &amp; TV</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300">
              DrFun1
            </span>
          </button>
          <button
            onClick={() => setActiveTab('carriers')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'carriers'
                ? 'text-sky-400 border-sky-400 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <span>Phone Carriers</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-sky-500/20 text-sky-300">
              NTN
            </span>
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'store'
                ? 'text-sky-400 border-sky-400 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Store &amp; Resell</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-400/20 text-amber-300">
              ECOM
            </span>
          </button>
          <button
            onClick={() => setActiveTab('stream')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'stream'
                ? 'text-sky-400 border-sky-400 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span>MultiStream</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-red-500/20 text-red-300">
              Restream
            </span>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'social'
                ? 'text-sky-400 border-sky-400 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <span className="w-4 h-4 rounded bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
              f
            </span>
            <span>SpaceBook</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-blue-500/20 text-blue-300">
              Social
            </span>
          </button>
          <button
            onClick={() => setActiveTab('irc')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'irc'
                ? 'text-purple-400 border-purple-400 font-semibold'
                : 'text-slate-400 border-transparent hover:text-purple-300'
            }`}
          >
            <span className="font-mono text-purple-400 font-bold text-xs">&gt;_</span>
            <span>IRC Client</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300">
              RisingNet
            </span>
          </button>
          <button
            onClick={() => setActiveTab('orbits')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'orbits'
                ? 'text-sky-400 border-sky-400 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Orbital Fleets
          </button>
          <button
            onClick={() => setActiveTab('rfq')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'rfq'
                ? 'text-sky-400 border-sky-400 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            RFQ
          </button>
          <button
            onClick={onOpenCompare}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'text-sky-400 border-sky-400 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <span>Compare</span>
            {compareCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">
                {compareCount}
              </span>
            )}
          </button>
          <button
            onClick={onOpenSwitchMesh}
            className="whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 text-slate-400 border-transparent hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Switch Mesh</span>
            <span className="text-[10px] font-mono text-emerald-400">●</span>
          </button>
          <button
            onClick={onOpenLicense}
            className="whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 text-slate-400 border-transparent hover:text-sky-300 flex items-center gap-1"
          >
            <span>License</span>
            <span className="text-[10px] font-mono text-emerald-400">●</span>
          </button>
        </nav>

        {/* Zone 3: Actions zone */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Cart Quick Button */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              title="Procurement Cart"
              className="px-3 py-2 text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <ShoppingBag className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-sky-500 text-slate-950 text-[10px] font-bold font-mono">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onExport}
            title="Export Directory (CSV)"
            className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-3 py-2 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-sky-500/10"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Operator</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Horizontal Navigation Strip */}
      <div className="xl:hidden border-t border-slate-800/80 px-4 py-2 overflow-x-auto flex items-center gap-4 text-xs font-medium text-slate-400 no-scrollbar">
        <button
          onClick={() => setActiveTab('directory')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'directory' ? 'text-sky-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          Directory
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
            activeTab === 'media' ? 'text-purple-400 font-semibold' : 'text-purple-400/90 hover:text-purple-300'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
          <span>Radio &amp; TV</span>
        </button>
        <button
          onClick={() => setActiveTab('carriers')}
          className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
            activeTab === 'carriers' ? 'text-sky-400 font-semibold' : 'text-sky-400/90 hover:text-sky-300'
          }`}
        >
          <Smartphone className="w-3 h-3 text-sky-400" />
          <span>Carriers</span>
        </button>
        <button
          onClick={() => setActiveTab('store')}
          className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
            activeTab === 'store' ? 'text-sky-400 font-semibold' : 'text-amber-400/90 hover:text-amber-300'
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Store</span>
        </button>
        <button
          onClick={() => setActiveTab('stream')}
          className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
            activeTab === 'stream' ? 'text-sky-400 font-semibold' : 'text-red-400/90 hover:text-red-300'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>MultiStream</span>
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
            activeTab === 'social' ? 'text-sky-400 font-semibold' : 'text-blue-400/90 hover:text-blue-300'
          }`}
        >
          <span className="w-3.5 h-3.5 rounded bg-blue-600 text-[9px] font-bold text-white flex items-center justify-center">
            f
          </span>
          <span>SpaceBook</span>
        </button>
        <button
          onClick={() => setActiveTab('irc')}
          className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
            activeTab === 'irc' ? 'text-purple-400 font-semibold' : 'text-purple-400/90 hover:text-purple-300'
          }`}
        >
          <span className="font-mono text-[10px] text-purple-400 font-bold">&gt;_</span>
          <span>IRC Client</span>
        </button>
        <button
          onClick={() => setActiveTab('orbits')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'orbits' ? 'text-sky-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          Orbital Fleets
        </button>
        <button
          onClick={() => setActiveTab('rfq')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'rfq' ? 'text-sky-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          RFQ Builder
        </button>
        <button
          onClick={onOpenCompare}
          className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
            activeTab === 'compare' ? 'text-sky-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <span>Compare</span>
          {compareCount > 0 && (
            <span className="text-[10px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">
              {compareCount}
            </span>
          )}
        </button>
        <button
          onClick={onOpenSwitchMesh}
          className="whitespace-nowrap shrink-0 text-slate-400 hover:text-emerald-300 flex items-center gap-1"
        >
          <span>Switch Mesh</span>
        </button>
        <button
          onClick={onOpenLicense}
          className="whitespace-nowrap shrink-0 text-slate-400 hover:text-sky-300 flex items-center gap-1"
        >
          <span>License</span>
          <span className="text-[9px] text-emerald-400 font-mono">●</span>
        </button>
      </div>
    </header>
  );
};
