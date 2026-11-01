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
  Building2,
  Radio,
  FileCheck,
  Zap,
  DollarSign,
  TrendingUp,
  BookOpen,
  Cpu,
  Smartphone,
  Wifi,
  Unlock
} from 'lucide-react';
import { QuantumFiberResellerModal } from './QuantumFiberResellerModal';
import { HostingResellerProgramModal } from './HostingResellerProgramModal';
import { DrFun1WirelessModal } from './DrFun1WirelessModal';

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
  const [selectedPartner, setSelectedPartner] = useState<string>('All Partners');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'name'>('recommended');
  const [isQuantumResellerModalOpen, setIsQuantumResellerModalOpen] = useState(false);
  const [isHostingResellerModalOpen, setIsHostingResellerModalOpen] = useState(false);
  const [isWirelessModalOpen, setIsWirelessModalOpen] = useState(false);

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'DrFun1 Wireless Unlocked Phones',
    'DrFun1 Wireless Satellite 5G Plans',
    'Switch.com Fiber Optical & Teleport',
    'Snapdragon Qualcomm Satellite & 5G',
    'Quantum Fiber & Terrestrial Optical',
    'Dedicated IRCD & Transit Hosting',
    'Terminals & User Hardware',
    'Bandwidth & Enterprise CIR',
    'Direct-to-Device (3GPP NTN)',
    'DrFun1 Broadcast TV & Online Radio',
    'Phone Carrier Spectrum & Backhaul',
    'ISP & Dedicated Satellite Internet',
    'Wireless Carrier & 5G NTN eSIM',
    'Bare-Metal & Teleport Hosting',
    'Satellite IoT & Asset Tracking',
    'Teleport & Switch Colocation',
    'Earth Observation & SAR Data',
  ];

  const partners: string[] = [
    'All Partners',
    'DrFun1 Wireless',
    'Apple',
    'Samsung',
    'Google',
    'Snapdragon Qualcomm',
    'Switch.com',
    'Quantum Fiber',
    'T-Mobile',
    'AT&T',
    'Verizon',
    'Vodafone',
    'Deutsche Telekom',
    'SoftBank',
    'Starlink (SpaceX)',
    'AST SpaceMobile',
    'Skylo 3GPP NTN',
    'Amazon Project Kuiper',
    'SES (SES S.A.)',
    'Eutelsat OneWeb',
    'Telesat (Lightspeed)',
    'EchoStar / HughesNet',
    'Globalstar',
    'Sateliot',
    'Kymeta',
    'Space42 (Yahsat / Thuraya)',
    'Planet Labs',
    'ICEYE',
    'Kinéis',
    'RisingNet',
    'DataPacket',
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

      // Partner filter
      if (selectedPartner !== 'All Partners') {
        const pLower = selectedPartner.toLowerCase().split(' ')[0]; // match first keyword
        const fullPartner = selectedPartner.toLowerCase();
        const matchesCarrier = product.oemCarriers.some(c => 
          c.toLowerCase().includes(pLower) || 
          fullPartner.includes(c.toLowerCase()) ||
          c.toLowerCase().includes(fullPartner)
        );
        const matchesName = product.name.toLowerCase().includes(pLower) || 
                            product.drfun1RebrandedName.toLowerCase().includes(pLower);
        const matchesCategory = product.category.toLowerCase().includes(pLower);
        if (!matchesCarrier && !matchesName && !matchesCategory) {
          return false;
        }
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
  }, [selectedCategory, selectedPartner, searchQuery, sortBy]);

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
              <span>DrFun1 Wireless &bull; Wholesale &amp; Carrier Division &bull; drfun1 ECOM inc</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsWirelessModalOpen(true)}
                className="text-xs text-sky-300 hover:text-white bg-sky-950/90 hover:bg-sky-900 border border-sky-500/60 px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-bold shadow-md shadow-sky-500/20 cursor-pointer animate-pulse"
              >
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>DrFun1 Wireless Carrier &amp; Unlocked Phones</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5" />
              </button>

              <button
                onClick={() => setIsHostingResellerModalOpen(true)}
                className="text-xs text-amber-300 hover:text-white bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-bold shadow-sm shadow-amber-500/20 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Hosting Packages</span>
              </button>

              <button
                onClick={() => setIsQuantumResellerModalOpen(true)}
                className="text-xs text-cyan-300 hover:text-white bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-bold shadow-sm shadow-cyan-500/20 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Quantum Fiber</span>
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
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-2.5">
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Universal Carrier Rebrand: All Satellite &amp; Phone Carriers Unified into DrFun1 Wireless</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              DrFun1 Wireless Carrier, Factory-Unlocked Phones &amp; Satellite 5G
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              drfun1 ECOM inc rebrands and unifies all phone and satellite carriers into <strong className="text-sky-300 font-semibold">DrFun1 Wireless</strong>. Experience total freedom with 100% factory-unlocked smartphones from every phone carrier (Apple, Samsung, Google, Motorola, Qualcomm) with zero carrier bloatware and unconditional carrier interoperability across <span className="text-white font-medium">T-Mobile, AT&amp;T, Verizon, Vodafone, and SoftBank</span>. Automatically fall back to <strong className="text-emerald-300 font-semibold">Direct-to-Cell LEO Satellite 5G</strong> (AST SpaceMobile, Starlink, Qualcomm Snapdragon Satellite, Skylo NTN) whenever off terrestrial cellular coverage.
            </p>
          </div>

          {/* Quick Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs text-slate-300">
            <div 
              onClick={() => setIsWirelessModalOpen(true)}
              className="flex items-start gap-2.5 bg-sky-950/40 border border-sky-500/40 hover:border-sky-300 p-3 rounded-xl cursor-pointer transition-all hover:bg-sky-950/60 group"
            >
              <Smartphone className="w-4 h-4 text-sky-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-semibold text-white flex items-center gap-1">
                  <span>DrFun1 Wireless Unlocked</span>
                  <span className="text-[10px] text-sky-400 font-mono">Explore ➔</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Factory-unlocked phones for T-Mo, AT&amp;T, Verizon + Direct Satellite 5G failover.</p>
              </div>
            </div>

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

        <div className="flex items-center gap-2 shrink-0 font-mono text-xs flex-wrap">
          <button
            onClick={() => setIsHostingResellerModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>EZ Setup Guide</span>
          </button>
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

      {/* Switch.com Optical Fiber & Teleport Colocation Hub Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-teal-950/70 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-emerald-950/30">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-lg shadow-emerald-500/20">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 uppercase tracking-wide">
                www.switch.com Optical &amp; Teleport Wholesale
              </span>
              <span className="text-slate-400 font-mono text-xs">
                400G Coherent Waves &bull; Unlit OS2 Dark Fiber &bull; Teleport Antenna Pads &bull; QKD Quantum Transport
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Switch SUPERNAP Optical Fiber &amp; Earth Station Teleport Infrastructure
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Procure and resell 100% green renewable powered optical infrastructure from <strong className="text-emerald-300 font-semibold">Switch (www.switch.com)</strong>. Deploy 400G DWDM coherent wavelengths, dedicated single-mode dark fiber pairs, and satellite dish pads with RF-over-Fiber conduits directly into Las Vegas, Tahoe Reno Citadel, Grand Rapids, and Atlanta Keep data centers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-xs flex-wrap">
          <button
            onClick={() => {
              setSelectedCategory('Switch.com Fiber Optical & Teleport');
              setSelectedPartner('Switch.com');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer font-bold"
          >
            Filter Switch.com Products
          </button>
          <button
            onClick={onOpenSwitchMeshModal}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <Server className="w-4 h-4" />
            <span>Switch Teleport &amp; 25 Leafs</span>
          </button>
        </div>
      </div>

      {/* Qualcomm Snapdragon Satellite & 5G NTN Platform Banner */}
      <div className="bg-gradient-to-r from-red-950/70 via-slate-900/90 to-amber-950/70 border border-red-500/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-red-950/30">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0 mt-0.5 shadow-lg shadow-red-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono text-[10px] font-bold border border-red-500/40 uppercase tracking-wide">
                Qualcomm Snapdragon NTN &bull; 3GPP Rel-17/18
              </span>
              <span className="text-slate-400 font-mono text-xs">
                Snapdragon Satellite &bull; X80 5G Modem-RF &bull; 212S 10-Yr IoT Fleet &bull; Digital Chassis TCU
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Snapdragon Qualcomm Direct-to-Device &amp; Industrial Satellite NTN
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Procure certified <strong className="text-red-300 font-semibold">Qualcomm Snapdragon</strong> satellite hardware, developer kits, and IoT transceiver fleets. Bridges terrestrial 5G Advanced with non-terrestrial orbital networks, enabling two-way space messaging, emergency SOS, and automotive telematics with zero cellular deadzones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-xs flex-wrap">
          <button
            onClick={() => {
              setSelectedCategory('Snapdragon Qualcomm Satellite & 5G');
              setSelectedPartner('Snapdragon Qualcomm');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-red-300 border border-red-500/40 transition-colors cursor-pointer font-bold"
          >
            Filter Snapdragon Products
          </button>
          <button
            onClick={() => {
              setSelectedCategory('Snapdragon Qualcomm Satellite & 5G');
              setSelectedPartner('Snapdragon Qualcomm');
            }}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition-all shadow-md shadow-red-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <Radio className="w-4 h-4" />
            <span>Explore 5G NTN Silicon</span>
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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Product Categories:</span>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-sky-400 hover:underline"
              >
                Reset Category
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Partner & Carrier Filter Pills */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Filter by Associated Satellite &amp; Carrier Partner:
            </span>
            {selectedPartner !== 'All Partners' && (
              <button
                onClick={() => setSelectedPartner('All Partners')}
                className="text-emerald-400 hover:underline font-mono"
              >
                Reset Partner ({selectedPartner})
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {partners.map((partner) => (
              <button
                key={partner}
                onClick={() => setSelectedPartner(partner)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                  selectedPartner === partner
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {partner}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count & Wholesale Transparency Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-slate-400">
        <div>
          Showing <span className="text-white font-semibold font-mono">{filteredProducts.length}</span> wholesale products &amp; service tiers
          {selectedCategory !== 'All' && <span> in <span className="text-sky-300 font-medium">"{selectedCategory}"</span></span>}
          {selectedPartner !== 'All Partners' && <span> for <span className="text-emerald-300 font-medium font-mono">[{selectedPartner}]</span></span>}
        </div>
        <div className="flex items-center gap-4 text-[11px] flex-wrap">
          <span className="flex items-center gap-1 text-sky-400">
            <Sparkles className="w-3 h-3" /> DrFun1 wholesale provides direct reseller margin
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Switch &amp; UnrealIRCd pre-provisioned
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <Cpu className="w-3 h-3" /> Snapdragon NTN certified
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
        onOpenLegalCenter={onOpenLicenseModal}
        onSelectProductForOrder={(id) => {
          const product = STORE_PRODUCTS.find((p) => p.id === id);
          if (product) {
            onOpenProductConfig(product, true);
          }
        }}
      />

      {/* DrFun1 Wireless Carrier & Unlocked Phones Modal */}
      <DrFun1WirelessModal
        isOpen={isWirelessModalOpen}
        onClose={() => setIsWirelessModalOpen(false)}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />
    </div>
  );
};
