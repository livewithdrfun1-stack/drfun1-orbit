/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Domain Name Search, WHOIS RDAP Inspector, and Anycast DNS Registration View
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  DomainTld, 
  DomainSearchResult, 
  WhoisRecord, 
  DomainCartItem, 
  TldCategory 
} from '../types/domain';
import { 
  DOMAIN_TLD_CATALOG, 
  DOMAIN_DNS_PRESETS, 
  searchDomains, 
  convertDomainToStoreProduct 
} from '../data/domainData';
import { StoreProduct } from '../types/store';
import { 
  Globe, 
  Search, 
  Check, 
  X, 
  ShoppingCart, 
  ShieldCheck, 
  Server, 
  ExternalLink, 
  Sparkles, 
  Lock, 
  Layers, 
  Tv, 
  Radio, 
  HelpCircle, 
  Clock, 
  ChevronRight, 
  FileText, 
  RotateCcw,
  Sliders,
  DollarSign,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';

interface DomainSearchViewProps {
  onAddToCart?: (product: StoreProduct) => void;
  onOpenCart?: () => void;
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onNavigateToStudio?: () => void;
}

export const DomainSearchView: React.FC<DomainSearchViewProps> = ({
  onAddToCart,
  onOpenCart,
  onOpenLicense,
  onOpenSwitchMesh,
  onNavigateToStudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('drfun1media');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedWhois, setSelectedWhois] = useState<WhoisRecord | null>(null);
  
  // Registration Configuration Modal State
  const [configuringDomain, setConfiguringDomain] = useState<DomainSearchResult | null>(null);
  const [regYears, setRegYears] = useState<number>(1);
  const [whoisPrivacy, setWhoisPrivacy] = useState<boolean>(true);
  const [autoRenew, setAutoRenew] = useState<boolean>(true);
  const [selectedDnsPreset, setSelectedDnsPreset] = useState<'drfun1tv_studio' | 'unrealircd_mesh' | 'znc_bouncer' | 'custom_anycast' | 'blank'>('drfun1tv_studio');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Search Results
  const results = useMemo(() => {
    return searchDomains(searchQuery, activeCategory);
  }, [searchQuery, activeCategory]);

  const handleQuickAdd = (item: DomainSearchResult) => {
    if (item.status === 'taken') {
      if (item.whois) {
        setSelectedWhois(item.whois);
      }
      return;
    }

    // Open configuration drawer or add directly
    setConfiguringDomain(item);
    setRegYears(1);
    setWhoisPrivacy(true);
    setAutoRenew(true);
  };

  const handleConfirmAddToCart = () => {
    if (!configuringDomain) return;

    const domainCartItem: DomainCartItem = {
      domainName: configuringDomain.domainName,
      tld: configuringDomain.tld,
      years: regYears,
      pricePerYear: configuringDomain.pricePerYear,
      totalPrice: Math.round((configuringDomain.pricePerYear * regYears) * 100) / 100,
      whoisPrivacy,
      autoRenew,
      dnsPreset: selectedDnsPreset,
      nameservers: 'switch_drfun1_anycast',
    };

    const storeProduct = convertDomainToStoreProduct(domainCartItem);
    if (onAddToCart) {
      onAddToCart(storeProduct);
    }

    setAddedNotice(`Added ${configuringDomain.domainName} (${regYears} yr) to cart!`);
    setTimeout(() => setAddedNotice(null), 3500);
    setConfiguringDomain(null);
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          HERO BANNER: DRFUN1 ICANN ACCREDITED REGISTRAR
          ======================================================== */}
      <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1.5 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>ICANN Accredited Domain Registrar</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-500/20 border border-emerald-500/40">
              Switch SUPERNAP Tier IV Anycast DNS
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Domain Name Search &amp; Broadcast DNS Provisioning
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Search, register, and instantly link custom domain names to your <strong>DrFun1TV linear streaming playout</strong>, <strong>UnrealIRCd 6.1.4 leaf mesh</strong>, and <strong>ZNC 1.9.1 bouncers</strong>. Includes 100% SLA Anycast DNS hosted at Switch SUPERNAP Las Vegas with complimentary WHOIS privacy protection.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              <span>Free WHOIS Privacy Guard</span>
            </span>
            <span className="flex items-center gap-1 text-sky-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant DNSSEC &amp; Let's Encrypt SSL</span>
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <Server className="w-3.5 h-3.5" />
              <span>Zero-Propagation Cloudflare &amp; Switch Mesh</span>
            </span>
          </div>
        </div>

        {/* Added Notification Toast */}
        {addedNotice && (
          <div className="absolute top-6 right-6 z-20 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 font-mono">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{addedNotice}</span>
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="ml-2 underline text-white font-bold cursor-pointer"
              >
                View Cart &rarr;
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          SEARCH BAR & POPULAR TLD QUICK BUTTONS
          ======================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        
        {/* Search Input Box */}
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
            <Search className="w-5 h-5 text-sky-400" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your brand, callsign, or network (e.g. galaxybroadcast, drfun1.tv, satcom)..."
            className="w-full bg-slate-950 border-2 border-slate-700/80 hover:border-slate-600 focus:border-sky-500 rounded-xl pl-12 pr-28 py-3.5 text-sm sm:text-base text-white font-mono placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-12 text-slate-500 hover:text-white p-1 text-xs"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="absolute right-3">
            <span className="hidden sm:inline px-2 py-1 bg-slate-800 rounded text-[10px] font-mono text-slate-400 border border-slate-700">
              ENTER
            </span>
          </div>
        </div>

        {/* Quick TLD Pills & Category Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/80 font-mono text-xs">
          
          {/* TLD Quick Extensions */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Popular TLDs:
            </span>
            {['.com', '.tv', '.media', '.space', '.live', '.net', '.ai', '.io'].map((tld) => (
              <button
                key={tld}
                onClick={() => {
                  const raw = searchQuery.replace(/\..*$/, '');
                  setSearchQuery(`${raw || 'mybrand'}${tld}`);
                }}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer text-xs font-bold ${
                  searchQuery.endsWith(tld)
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-sm'
                    : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                }`}
              >
                {tld}
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar">
            {['All', 'Popular Commercial', 'Media & Streaming', 'Space & Tech'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                  activeCategory === cat
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* ========================================================
          EXACT MATCH HERO RESULT CARD
          ======================================================== */}
      {results.exactMatch && (
        <div className={`rounded-2xl p-5 sm:p-6 border transition-all shadow-xl ${
          results.exactMatch.status === 'available'
            ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border-emerald-500/50'
            : 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                  results.exactMatch.status === 'available'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {results.exactMatch.status === 'available' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Available for Instant Registration</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Already Registered (Taken)</span>
                    </>
                  )}
                </span>

                <span className="text-slate-500 text-xs font-mono">&bull;</span>
                <span className="text-[11px] font-mono text-slate-400">
                  Switch SUPERNAP NV Anycast DNS Ready
                </span>
              </div>

              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {results.exactMatch.domainName}
                </h2>
              </div>

              <p className="text-xs text-slate-400 font-sans">
                {results.exactMatch.status === 'available'
                  ? 'Includes complimentary WHOIS privacy protection, Anycast DNS zone management, and automated Let’s Encrypt wildcard SSL issuance.'
                  : 'This domain is currently owned. You can inspect its public WHOIS RDAP records or browse recommended alternatives below.'}
              </p>
            </div>

            {/* Right Action & Pricing */}
            <div className="flex items-center gap-4 shrink-0 font-mono">
              {results.exactMatch.status === 'available' ? (
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">
                    ${results.exactMatch.pricePerYear.toFixed(2)}
                    <span className="text-xs font-normal text-slate-400"> / year</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Renews at ${results.exactMatch.renewalPricePerYear.toFixed(2)}/yr
                  </div>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 px-3 py-1 rounded bg-slate-950 border border-slate-800">
                    Unavailable
                  </span>
                </div>
              )}

              {results.exactMatch.status === 'available' ? (
                <button
                  onClick={() => handleQuickAdd(results.exactMatch!)}
                  className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Configure &amp; Buy</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (results.exactMatch?.whois) {
                      setSelectedWhois(results.exactMatch.whois);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Inspect WHOIS</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          MULTI-TLD AVAILABILITY MATRIX
          ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between font-mono text-xs text-slate-400">
          <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Available Extensions for "{results.exactMatch?.nameWithoutTld || searchQuery}" ({results.tldResults.length})</span>
          </span>
          <span className="text-[11px] text-slate-500">Wholesale ICANN Pricing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.tldResults.map((item) => (
            <div
              key={item.domainName}
              className={`p-4 rounded-xl border transition-all ${
                item.status === 'available'
                  ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700 shadow-md'
                  : 'bg-slate-950/40 border-slate-800/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">
                      {item.domainName}
                    </span>
                    {item.isPopular && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        HOT
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.tld} &bull; {item.status === 'available' ? 'Available' : 'Registered'}
                  </span>
                </div>

                <div className="text-right font-mono">
                  {item.status === 'available' ? (
                    <div>
                      <div className="text-sm font-bold text-emerald-400">
                        ${item.pricePerYear.toFixed(2)}
                      </div>
                      <div className="text-[9px] text-slate-500">/yr</div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 uppercase">Taken</span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs font-mono">
                {item.status === 'available' ? (
                  <>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Privacy Included</span>
                    </span>
                    <button
                      onClick={() => handleQuickAdd(item)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Register</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-slate-500">Owned by Third-Party</span>
                    <button
                      onClick={() => {
                        if (item.whois) setSelectedWhois(item.whois);
                      }}
                      className="text-[11px] text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>WHOIS Info</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          SMART BROADCAST & SATCOM ALTERNATIVES
          ======================================================== */}
      {results.suggestions.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between font-mono text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Recommended Media &amp; Satellite Brand Spin-offs</span>
            </span>
            <span className="text-[11px] text-slate-500">High-Visibility Extensions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {results.suggestions.map((item) => (
              <div
                key={item.domainName}
                className="p-3.5 bg-slate-950/70 border border-purple-500/30 hover:border-purple-500/50 rounded-xl transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono truncate">
                      {item.domainName}
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      ${item.pricePerYear.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 block mt-0.5">
                    Broadcaster Choice
                  </span>
                </div>

                <button
                  onClick={() => handleQuickAdd(item)}
                  className="mt-3 w-full py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart className="w-3 h-3 text-purple-400" />
                  <span>Add to Cart</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          DNS AUTOMATION PRESET TEMPLATES
          ======================================================== */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>One-Click Automated DNS Zone Configurations</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            When you purchase a domain through DrFun1 Media, our Anycast DNS engine automatically provisions zone records to integrate with your platform services.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {DOMAIN_DNS_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 font-mono text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-xs truncate">
                  {preset.name}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {preset.badge}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans line-clamp-2">
                {preset.description}
              </p>
              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px] text-slate-400">
                {preset.records.slice(0, 2).map((rec, i) => (
                  <div key={i} className="flex justify-between truncate">
                    <span className="text-emerald-400 font-bold">{rec.type}</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{rec.host} &rarr; {rec.target}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          DOMAIN CONFIGURATION & CHECKOUT MODAL
          ======================================================== */}
      {configuringDomain && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200">
            
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Configure Domain Registration
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {configuringDomain.domainName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setConfiguringDomain(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Registration Period */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-slate-300 block">
                  Registration Term:
                </label>
                <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                  {[1, 2, 3, 5].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setRegYears(yr)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        regYears === yr
                          ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500 font-bold shadow'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <div>{yr} Year{yr > 1 ? 's' : ''}</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">
                        ${(configuringDomain.pricePerYear * yr).toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Automated DNS Preset Selection */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-slate-300 block">
                  Automated DNS Service Mapping:
                </label>
                <div className="space-y-2 font-mono text-xs">
                  {[
                    { id: 'drfun1tv_studio', label: 'DrFun1TV Playout & Master Studio', desc: 'Auto-maps CNAME to tv.drfun1media.com for live broadcast channel playout' },
                    { id: 'unrealircd_mesh', label: 'UnrealIRCd 6.1.4 Leaf Mesh', desc: 'Pre-configures A and SRV records to link with irc.drfun1.com:6697' },
                    { id: 'znc_bouncer', label: 'ZNC 1.9.1 Bouncer & WebAdmin', desc: 'Routes to bouncer.drfun1media.com on SSL port 5000' },
                    { id: 'custom_anycast', label: 'Switch SUPERNAP Tier IV Anycast DNS', desc: 'Blank zone managed via ns1.drfun1.com and ns2.drfun1.com' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedDnsPreset(p.id as any)}
                      className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        selectedDnsPreset === p.id
                          ? 'bg-sky-500/20 text-sky-200 border-sky-500/60 font-bold shadow'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs text-white">{p.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles: Privacy & Auto-renew */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-white block">WHOIS Privacy Guard</span>
                      <span className="text-[10px] text-slate-500">Hides name, address, and email from ICANN directory</span>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold text-xs uppercase">FREE</span>
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-sky-400" />
                    <div>
                      <span className="font-bold text-white block">Auto-Renew Protection</span>
                      <span className="text-[10px] text-slate-500">Prevents unintended domain expiration</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="accent-sky-500 w-4 h-4"
                  />
                </label>
              </div>

              {/* Price Calculation */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                <div>
                  <span className="text-xs text-slate-400 block">Total Due Today:</span>
                  <span className="text-lg font-black text-emerald-400">
                    ${(configuringDomain.pricePerYear * regYears).toFixed(2)} USD
                  </span>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                  <span>Renews at ${(configuringDomain.renewalPricePerYear * regYears).toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2 font-mono">
              <button
                onClick={() => setConfiguringDomain(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmAddToCart}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add Domain to Cart</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          WHOIS RDAP INSPECTOR MODAL
          ======================================================== */}
      {selectedWhois && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-200">
            
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    WHOIS / RDAP Registry Record
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedWhois.domainName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedWhois(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Registrar:</span>
                  <span className="text-white font-bold">{selectedWhois.registrar}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">IANA ID:</span>
                  <span className="text-sky-300 font-bold">{selectedWhois.ianaId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Created Date:</span>
                  <span className="text-slate-300">{new Date(selectedWhois.registrationDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Expires:</span>
                  <span className="text-emerald-400 font-bold">{new Date(selectedWhois.expirationDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Registrant Organization:</span>
                  <span className="text-slate-200">{selectedWhois.registrantOrg}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">DNSSEC Validation:</span>
                  <span className={selectedWhois.dnssec ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {selectedWhois.dnssec ? 'Active (Signed)' : 'Unsigned'}
                  </span>
                </div>
              </div>

              {/* Nameservers */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block">
                  Authoritative Nameservers:
                </span>
                <div className="space-y-1">
                  {selectedWhois.nameservers.map((ns, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      <span>{ns}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedWhois.ipAddress && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Hosting IP / ASN:</span>
                  <span className="text-purple-300 font-bold">{selectedWhois.ipAddress} {selectedWhois.asn ? `(${selectedWhois.asn})` : ''}</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
              <button
                onClick={() => setSelectedWhois(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs transition cursor-pointer"
              >
                Close Record
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
