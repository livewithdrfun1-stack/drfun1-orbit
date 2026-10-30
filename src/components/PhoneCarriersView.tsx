import React, { useState, useMemo } from 'react';
import { PhoneCarrier, CarrierCategory } from '../types/carrier';
import { PHONE_CARRIERS_DATA } from '../data/phoneCarriersData';
import { 
  Smartphone, 
  Radio, 
  Satellite, 
  Globe, 
  ShieldCheck, 
  Server, 
  ExternalLink, 
  Search, 
  Filter, 
  Cpu, 
  CheckCircle2, 
  Terminal, 
  Sparkles, 
  Send, 
  Layers, 
  Info,
  X,
  ShoppingBag,
  Zap,
  ArrowRight
} from 'lucide-react';

interface PhoneCarriersViewProps {
  onOpenStore?: () => void;
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onOpenRfqWithCarrier?: (carrierName: string) => void;
}

export const PhoneCarriersView: React.FC<PhoneCarriersViewProps> = ({
  onOpenStore,
  onOpenLicense,
  onOpenSwitchMesh,
  onOpenRfqWithCarrier,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inspectedCarrier, setInspectedCarrier] = useState<PhoneCarrier | null>(null);

  const categories = [
    'All',
    'Direct-to-Cellular (MNO)',
    '3GPP 5G NTN Satellite',
    'Cell Tower Fiber Backhaul',
    'Emergency SOS Satellite',
  ];

  const regions = ['All', 'North America', 'Europe', 'Asia-Pacific', 'Global'];

  const filteredCarriers = useMemo(() => {
    return PHONE_CARRIERS_DATA.filter((carrier) => {
      // Region filter
      if (selectedRegion !== 'All' && carrier.region !== selectedRegion) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'All' && carrier.category !== selectedCategory) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = carrier.name.toLowerCase().includes(q);
        const matchesBrand = carrier.brandName.toLowerCase().includes(q);
        const matchesCountry = carrier.country.toLowerCase().includes(q);
        const matchesPartner = carrier.satellitePartners.some(p => p.toLowerCase().includes(q));
        const matchesSpectrum = carrier.spectrumFrequencies.some(f => f.toLowerCase().includes(q));
        const matchesRole = carrier.drfun1EcomRole.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesCountry && !matchesPartner && !matchesSpectrum && !matchesRole) {
          return false;
        }
      }
      return true;
    });
  }, [selectedRegion, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Carrier Network Masthead */}
      <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-purple-950/80 border-b border-sky-500/30 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm tracking-wide">
                  DrFun1 ECOM Phone Carrier Interconnect
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold border border-sky-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  MNO &amp; NTN ALLIANCE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct-to-Cellular, 3GPP 5G NTN Satellite &amp; Cell Tower Optical Backhaul Network Operators
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenLicense}
              className="text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 transition-colors flex items-center gap-1.5 font-mono text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Witt Law Firm Escrow</span>
            </button>
            <button
              onClick={onOpenSwitchMesh}
              className="text-slate-400 hover:text-emerald-300 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 transition-colors flex items-center gap-1.5 font-mono text-[11px]"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Switch SUPERNAP 100G</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Filter and Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search phone carriers (T-Mobile, AT&T, Verizon, Vodafone, spectrum bands, direct-to-cell)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* Region Selector Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-colors ${
                    selectedRegion === region
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-950/50'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-800/80">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-950 border border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
            <span className="ml-auto text-xs font-mono text-slate-400 hidden sm:inline shrink-0">
              Showing {filteredCarriers.length} of {PHONE_CARRIERS_DATA.length} Carriers
            </span>
          </div>
        </div>

        {/* Carrier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCarriers.map((carrier) => {
            return (
              <div
                key={carrier.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl group"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Country & Category Badge */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-base">{carrier.flag}</span>
                      <span>{carrier.country}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      {carrier.category}
                    </span>
                  </div>

                  {/* Carrier Name */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-2">
                      <span>{carrier.brandName}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {carrier.subscribers}
                    </p>
                  </div>

                  {/* DrFun1 Role Box */}
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                      DrFun1 ECOM Involvement
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {carrier.drfun1EcomRole}
                    </p>
                  </div>

                  {/* Cellular Tech & Satellite Partners */}
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Space Satellite Constellations</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {carrier.satellitePartners.map((sat, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20"
                          >
                            {sat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Spectrum Frequencies</span>
                      <p className="text-[11px] text-slate-300 truncate">
                        {carrier.spectrumFrequencies.join(' · ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setInspectedCarrier(carrier)}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5 text-sky-400" />
                    <span>Carrier Details</span>
                  </button>

                  {onOpenStore && (
                    <button
                      onClick={onOpenStore}
                      className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white rounded-lg text-xs font-mono font-semibold transition-all shadow-md shadow-sky-950/50 flex items-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Order SIMs</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Carrier Inspection Detail Modal */}
      {inspectedCarrier && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{inspectedCarrier.flag}</span>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{inspectedCarrier.name}</span>
                    <span className="text-xs font-mono text-sky-400 font-normal">({inspectedCarrier.brandName})</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {inspectedCarrier.category} · {inspectedCarrier.region}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectedCarrier(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs font-mono">
              {/* DrFun1 Legal Escrow & Role */}
              <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>DrFun1 ECOM Contract Title &amp; Legal Escrow</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {inspectedCarrier.drfun1EcomRole}
                </p>
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                  <span>Legal Counsel: <strong className="text-white">{inspectedCarrier.legalEscrow}</strong></span>
                  <span className="text-emerald-400 font-bold">{inspectedCarrier.drfun1ContractStatus}</span>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Network Architecture &amp; Carrier Specifications:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {inspectedCarrier.specs.map((spec, i) => (
                    <div key={i} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase block">{spec.label}</span>
                      <span className="text-slate-200 font-semibold text-[11px]">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Infrastructure Teleports */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Switch SUPERNAP Teleport</span>
                  <span className="text-emerald-300 font-semibold">{inspectedCarrier.colocationTeleport}</span>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Carrier IP Transit</span>
                  <span className="text-sky-300 font-semibold">{inspectedCarrier.transitBackbone}</span>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Commercial &amp; Strategic Advantages:
                </h4>
                <div className="space-y-1.5">
                  {inspectedCarrier.keyBenefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-300 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
              <a
                href={inspectedCarrier.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>Carrier Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectedCarrier(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono transition-colors"
                >
                  Close
                </button>
                {onOpenStore && (
                  <button
                    onClick={() => {
                      setInspectedCarrier(null);
                      onOpenStore();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white rounded-lg text-xs font-mono font-semibold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Purchase Carrier SIMs</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
