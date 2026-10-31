import React, { useState, useMemo } from 'react';
import { StoreProduct, ProductCategory, CartItem } from '../types/store';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { StoreProductCard } from './StoreProductCard';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Sparkles, 
  Server, 
  Terminal, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  ArrowRight,
  TrendingDown,
  Building2,
  Cpu,
  Radio,
  FileCheck,
  Zap,
  DollarSign,
  TrendingUp,
  Award
} from 'lucide-react';
import { QuantumFiberResellerModal } from './QuantumFiberResellerModal';
import { HostingResellerProgramModal } from './HostingResellerProgramModal';

interface StoreViewProps {
  onOpenProductConfig: (product: StoreProduct, isDrfun1Branded: boolean) => void;
  onQuickAddToCart: (product: StoreProduct, isDrfun1Branded: boolean) => void;
  cartItems: CartItem[];
  onOpenCart: () => void;
  onOpenLicenseModal: () => void;
  onOpenSwitchMeshModal: () => void;
}

export const StoreView: React.FC<StoreViewProps> = ({
  onOpenProductConfig,
  onQuickAddToCart,
  cartItems,
  onOpenCart,
  onOpenLicenseModal,
  onOpenSwitchMeshModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<'all' | 'drfun1-preferred' | 'oem-only'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'name'>('recommended');
  const [isQuantumResellerModalOpen, setIsQuantumResellerModalOpen] = useState(false);
  const [isHostingResellerModalOpen, setIsHostingResellerModalOpen] = useState(false);

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Dedicated IRCD & Transit Hosting',
    'DrFun1 Broadcast TV & Online Radio',
    'Phone Carrier Spectrum & Backhaul',
    'Quantum Fiber & Terrestrial Optical',
    'ISP & Dedicated Satellite Internet',
    'Wireless Carrier & 5G NTN eSIM',
    'Bare-Metal & Teleport Hosting',
    'Terminals & User Hardware',
    'Bandwidth & Enterprise CIR',
    'Direct-to-Device (3GPP NTN)',
    'Satellite IoT & Asset Tracking',
    'Teleport & Switch Colocation',
    'Earth Observation & SAR Data',
  ];

  // Total items in cart
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const totalCartValue = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.isDrfun1Branded ? item.product.drfun1WholesalePrice : item.product.retailPrice;
      let mult = 1;
      if (item.quantity >= 25) mult = 0.85;
      else if (item.quantity >= 5) mult = 0.95;
      return acc + (price * mult * item.quantity);
    }, 0);
  }, [cartItems]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return STORE_PRODUCTS.filter((product) => {
      // Category filter
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDrfun1 = product.drfun1RebrandedName.toLowerCase().includes(query);
        const matchesTagline = product.tagline.toLowerCase().includes(query);
        const matchesCarriers = product.oemCarriers.some(c => c.toLowerCase().includes(query));
        const matchesBands = product.frequencyBands.some(b => b.toLowerCase().includes(query));
        if (!matchesName && !matchesDrfun1 && !matchesTagline && !matchesCarriers && !matchesBands) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') {
        return a.drfun1WholesalePrice - b.drfun1WholesalePrice;
      }
      if (sortBy === 'price-desc') {
        return b.drfun1WholesalePrice - a.drfun1WholesalePrice;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // 'recommended'
      return 0;
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-8">
      {/* Reseller & Interconnect Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DrFun1 Authorized Wholesale & Resale Exchange</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsHostingResellerModalOpen(true)}
                className="text-xs text-amber-300 hover:text-white bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-bold shadow-sm shadow-amber-500/20 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Start Reselling All Hosting Packages</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />
              </button>

              <button
                onClick={() => setIsQuantumResellerModalOpen(true)}
                className="text-xs text-cyan-300 hover:text-white bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-bold shadow-sm shadow-cyan-500/20 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Quantum Fiber Reseller</span>
              </button>

              <button
                onClick={onOpenLicenseModal}
                className="text-xs text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Licensed to Richard Alan Witt</span>
                <span className="text-[10px] text-emerald-400 font-mono">Active</span>
              </button>

              <button
                onClick={onOpenSwitchMeshModal}
                className="text-xs text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span>irc.drfun1.com Peering</span>
              </button>
            </div>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Commercial Satellite, Quantum Fiber &amp; Dedicated IRCD Reseller Store
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Procure wholesale satellite hardware, dedicated multi-orbit CIR bandwidth, <strong className="text-cyan-300 font-semibold">Quantum Fiber 8G multi-gigabit &amp; 400G dark fiber</strong>, and <strong className="text-purple-300 font-semibold">Dedicated IRCD Bare-Metal Hosting</strong> powered directly by <a href="https://www.datapacket.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-mono">datapacket.com</a>, <a href="https://www.risingnet.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-mono">risingnet.com</a>, and <a href="https://www.switch.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-mono">www.switch.com</a>. Rebrand and co-brand each line under the turnkey <span className="text-white font-medium">DrFun1 ecosystem</span> with pre-engineered interconnects, clean-pipe DDoS defense, and encrypted mission telemetry via <span className="text-emerald-300 font-medium font-mono">irc.drfun1.com:6697</span>.
            </p>
          </div>

          {/* Quick Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs text-slate-300">
            <div 
              onClick={() => setIsHostingResellerModalOpen(true)}
              className="flex items-start gap-2.5 bg-slate-900/60 border border-amber-500/30 hover:border-amber-400 p-3 rounded-xl cursor-pointer transition-all hover:bg-slate-900"
            >
              <Server className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white flex items-center gap-1">
                  <span>Dedicated IRCD &amp; Hosting Reselling</span>
                  <span className="text-[10px] text-amber-400 font-mono">Resell ➔</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">DataPacket unmetered 40G, Switch Tier 5 Platinum SuperNAP &amp; RisingNet clean-pipe BGP.</p>
              </div>
            </div>

            <div 
              onClick={() => setIsQuantumResellerModalOpen(true)}
              className="flex items-start gap-2.5 bg-slate-900/60 border border-cyan-500/30 hover:border-cyan-400 p-3 rounded-xl cursor-pointer transition-all hover:bg-slate-900"
            >
              <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white flex items-center gap-1">
                  <span>Quantum Fiber Co-Branding</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Resell ➔</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">500M, 1G, 2G, 3G, 8G symmetrical fiber, 400G waves, and SmartNID WiFi 7 hardware.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-slate-900/60 border border-slate-800/60 p-3 rounded-xl">
              <Terminal className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">UnrealIRCd Mission Mesh</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Encrypted leaf peering directly with irc.drfun1.com for zero-latency C2 control.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-slate-900/60 border border-slate-800/60 p-3 rounded-xl">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Turnkey PO Generation</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Generate and download legally-binding signed purchase orders licensed to Richard Alan Witt.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shopping Cart Bar Notification (if items exist in cart) */}
      {totalCartCount > 0 && (
        <div className="sticky top-16 z-20 bg-slate-900/95 backdrop-blur-md border border-sky-500/40 rounded-xl p-3 px-4 flex items-center justify-between shadow-xl shadow-sky-950/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                Staged Procurement Cart: <span className="text-sky-400 font-mono">{totalCartCount} item{totalCartCount > 1 ? 's' : ''}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Subtotal: <span className="text-white font-semibold tabular-nums">{totalCartValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCart}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-sky-500/20"
          >
            <span>Review Cart & Generate PO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Master Hosting Reseller Program Showcase Banner */}
      <div className="bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-emerald-950/70 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-amber-950/30">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 shadow-lg shadow-amber-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40 uppercase tracking-wide">
                Universal Hosting Reseller Program
              </span>
              <span className="text-slate-400 font-mono text-xs">
                IRCD Nodes &bull; Bare-Metal &bull; WordPress Duplicator &bull; Icecast DJ &bull; Quantum Fiber
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Start Reselling All Cloud, Bare-Metal &amp; Transit Hosting Packages
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Launch your white-label hosting business with 100% margin retention. Resell Switch SUPERNAP bare-metal, DataPacket 40G unmetered transit, RisingNet DDoS-shielded IRCD nodes, and WordPress chat duplicators with automated WHMCS APIs and Richard Alan Witt legal contract protection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
          <button
            onClick={() => setSelectedCategory('Dedicated IRCD & Transit Hosting')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            Filter Hosting Products
          </button>
          <button
            onClick={() => setIsHostingResellerModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            <span>Open Reseller Hub &amp; Calculator</span>
          </button>
        </div>
      </div>

      {/* Co-Branded Quantum Fiber Reseller Banner */}
      <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-purple-950/70 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-cyan-950/30">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 shadow-lg shadow-cyan-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40 uppercase tracking-wide">
                Active Wholesale Reseller Program
              </span>
              <span className="text-slate-400 font-mono text-xs">
                500M &bull; 1 Gig &bull; 2 Gig &bull; 3 Gig &bull; 8 Gig &bull; QuantumBiz
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Co-Branded Quantum Fiber Internet Reseller Network
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Resell symmetrical fiber internet under your brand co-badged with DrFun1 and Quantum Fiber. Wholesale margins up to <strong className="text-emerald-400 font-mono font-semibold">$1,050.00/mo recurring per line</strong> with SmartNID WiFi 7 hardware, captive portal branding, and Richard Alan Witt legal reseller escrow.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
          <button
            onClick={() => setSelectedCategory('Quantum Fiber & Terrestrial Optical')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            Filter Quantum Products
          </button>
          <button
            onClick={() => setIsQuantumResellerModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            <span>Launch Reseller Calculator</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
        {/* Search & Sort Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by brand, frequency, carrier, or specs..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-sky-500 outline-none"
              >
                <option value="recommended">Featured / High Value</option>
                <option value="price-asc">Wholesale Price: Low to High</option>
                <option value="price-desc">Wholesale Price: High to Low</option>
                <option value="name">Product Alphabetical</option>
              </select>
            </div>

            <button
              onClick={onOpenCart}
              className="relative px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700/80"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-sky-500 text-slate-950 text-[10px] font-bold font-mono tabular-nums">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Wholesale Transparency Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-slate-400">
        <div>
          Showing <span className="text-white font-semibold font-mono">{filteredProducts.length}</span> wholesale products & service tiers
          {selectedCategory !== 'All' && <span> in <span className="text-sky-300 font-medium">"{selectedCategory}"</span></span>}
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-sky-400">
            <Sparkles className="w-3 h-3" /> DrFun1 wholesale provides direct reseller margin
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Switch & UnrealIRCd pre-provisioned
          </span>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No products found matching criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Try adjusting your search terms or select "All" from the category filter list above.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <StoreProductCard
              key={product.id}
              product={product}
              onOpenConfig={onOpenProductConfig}
              onQuickAdd={onQuickAddToCart}
            />
          ))}
        </div>
      )}

      {/* Reseller Value-Added Architecture Reference Footer */}
      <div className="border border-slate-800 rounded-2xl bg-slate-950 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>DrFun1 Value-Added Reseller Architecture Standards</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Every DrFun1 rebranded product complies with strict carrier interconnect specifications and Richard Alan Witt legal frameworks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.switch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono hover:underline"
            >
              <span>switch.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700">/</span>
            <a
              href="https://www.risingnet.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono hover:underline"
            >
              <span>risingnet.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700">/</span>
            <a
              href="https://www.unrealircd.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono hover:underline"
            >
              <span>unrealircd.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
          <div className="space-y-1">
            <p className="text-slate-200 font-semibold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span>Switch Colocation Provisioning</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              Wholesale space and optical cross-connects inside Switch SUPERNAP teleports with Tier IV redundancy and 100% renewable power.
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-slate-200 font-semibold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>UnrealIRCd Mission Hub Peering</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              Standardized leaf linking to irc.drfun1.com:6697 over TLS 1.3 with AES-256 link blocks for real-time encrypted NOC alerts.
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-slate-200 font-semibold flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Legal & Resale Licensing</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              Covered under master reseller terms licensed to Richard Alan Witt (Witt Law Firm / Owens Company) for commercial liability protection.
            </p>
          </div>
        </div>
      </div>

      {/* Quantum Fiber Reseller Modal */}
      <QuantumFiberResellerModal
        isOpen={isQuantumResellerModalOpen}
        onClose={() => setIsQuantumResellerModalOpen(false)}
        onSelectProductForOrder={(id) => {
          const product = STORE_PRODUCTS.find((p) => p.id === id);
          if (product) {
            onOpenProductConfig(product, true);
          }
        }}
      />

      {/* Master Hosting Reseller Program Modal */}
      <HostingResellerProgramModal
        isOpen={isHostingResellerModalOpen}
        onClose={() => setIsHostingResellerModalOpen(false)}
        onSelectProductForOrder={(id) => {
          const product = STORE_PRODUCTS.find((p) => p.id === id);
          if (product) {
            onOpenProductConfig(product, true);
          }
        }}
      />
    </div>
  );
};
