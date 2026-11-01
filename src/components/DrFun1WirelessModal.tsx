import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Wifi, 
  Globe, 
  Satellite, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  QrCode, 
  Unlock, 
  Copy, 
  Check, 
  PhoneCall, 
  Radio, 
  Server, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface DrFun1WirelessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (cat: string) => void;
}

export const DrFun1WirelessModal: React.FC<DrFun1WirelessModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'phones' | 'plans' | 'technology' | 'esim'>('phones');
  const [copiedEsim, setCopiedEsim] = useState(false);
  const [selectedCarrierDemo, setSelectedCarrierDemo] = useState<'all' | 'tmobile' | 'att' | 'verizon' | 'orbit'>('all');

  if (!isOpen) return null;

  const copyEsimLPA = () => {
    navigator.clipboard.writeText('LPA:1$smdp.drfun1.com$DRFUN1-WIRELESS-5G-NTN-UNIVERSAL');
    setCopiedEsim(true);
    setTimeout(() => setCopiedEsim(false), 2000);
  };

  const unlockedPhones = [
    {
      name: 'DrFun1 Wireless OrbitPhone 16 Pro Max',
      oem: 'Apple iPhone 16 Pro Max Grade 5 Titanium',
      tagline: '100% Factory Unlocked + AST SpaceMobile & Starlink Direct-to-Cell 5G',
      price: '$1,399',
      msrp: '$1,599',
      bands: '5G Sub-6, mmWave n258/n260, L-Band NTN',
      carriers: 'T-Mobile, AT&T, Verizon, Vodafone, SoftBank, Worldwide',
      feature: 'Direct orbital fallback when off terrestrial cellular towers',
    },
    {
      name: 'DrFun1 Wireless Galaxy Orbit S25 Ultra',
      oem: 'Samsung Galaxy S25 Ultra 512GB',
      tagline: 'Snapdragon X80 5G Satellite Modem + All-Carrier Unlocked',
      price: '$1,299',
      msrp: '$1,499',
      bands: '3GPP NTN Rel-17, Dual eSIM + Nano-SIM',
      carriers: 'All US & Global GSM/CDMA/LTE/5G Networks',
      feature: 'Snapdragon Satellite two-way messaging & orbital broadband',
    },
    {
      name: 'DrFun1 Wireless Pixel Celestial 9 Pro',
      oem: 'Google Pixel 9 Pro 256GB',
      tagline: 'Google Tensor G4 + Skylo 3GPP NTN Satellite 5G Voice & Data',
      price: '$999',
      msrp: '$1,199',
      bands: 'S-band 2.1 GHz NTN, L-band 1.6 GHz, 5G SA/NSA',
      carriers: 'T-Mobile, AT&T, Verizon, Bell, Telus, EE, Vodafone',
      feature: 'Zero bloatware pure Android with automatic satellite beaconing',
    },
    {
      name: 'DrFun1 Wireless SpacePhone Defy Extreme',
      oem: 'Motorola / Bullitt Group Tough Handset',
      tagline: 'MIL-SPEC IP69K Extreme Rugged + MediaTek NTN Satellite Button',
      price: '$549',
      msrp: '$699',
      bands: '3GPP NTN Band 255/256, Global LTE/5G',
      carriers: 'Universal GSM/LTE/5G unlocked across all providers',
      feature: 'Drop-proof to concrete, 48-hour continuous satellite battery',
    },
    {
      name: 'DrFun1 Wireless Snapdragon Apex Edition',
      oem: 'Qualcomm Snapdragon 8 Gen 3 Reference Handset',
      tagline: 'Pole-to-Pole Iridium NEXT & AST SpaceMobile LEO Satellite Handset',
      price: '$1,049',
      msrp: '$1,299',
      bands: 'Iridium L-Band, Snapdragon Satellite RF, Full 5G NR',
      carriers: 'Universal Factory Unlocked — zero carrier bloat',
      feature: 'Direct Qualcomm RF satellite front-end for harsh terrain',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-sky-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-sky-950/50">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  DrFun1 Wireless Carrier &amp; Unlocked Cell Phones
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Direct-to-Cell 5G NTN
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                drfun1 ECOM inc &bull; Wholesale &amp; Retail Carrier Division &bull; Licensed to Richard Alan Witt
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/50 text-xs font-mono">
          <button
            onClick={() => setActiveTab('phones')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'phones'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Unlocked Cell Phones ({unlockedPhones.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'plans'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Satellite 5G Wireless Plans</span>
          </button>
          <button
            onClick={() => setActiveTab('technology')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'technology'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Orbital Direct-to-Cell Tech</span>
          </button>
          <button
            onClick={() => setActiveTab('esim')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'esim'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Universal eSIM Activation</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          
          {/* Unlocked Phones Tab */}
          {activeTab === 'phones' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-emerald-950/30 border border-sky-500/30">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span>Carrier Freedom: 100% Factory Unlocked Smartphones</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Every phone sold through DrFun1 Wireless is completely carrier-unlocked directly from the factory. Never locked to a single carrier contract. Insert any physical SIM card or activate an eSIM from <strong className="text-white">T-Mobile, AT&amp;T, Verizon, Vodafone, Deutsche Telekom, SoftBank</strong>, or load the DrFun1 Wireless Multi-Carrier profile for automated orbital satellite failover.
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">✓ T-Mobile 5G SA/NSA</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">✓ AT&amp;T 5G+ C-Band</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400">✓ Verizon Ultra-Wideband</span>
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">✓ AST SpaceMobile / Starlink LEO</span>
                </div>
              </div>

              {/* Phone Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {unlockedPhones.map((phone, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-sky-500/50 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                            {phone.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-mono block">OEM: {phone.oem}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-emerald-400 font-mono">{phone.price}</span>
                          <span className="text-[10px] text-slate-500 line-through block font-mono">MSRP {phone.msrp}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-300 mb-2.5 leading-snug">
                        {phone.tagline}
                      </p>

                      <div className="space-y-1 text-[11px] font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-slate-400">
                          <span className="text-emerald-400 font-semibold">Unlocked Carriers: </span>
                          <span className="text-slate-200">{phone.carriers}</span>
                        </div>
                        <div className="text-slate-400">
                          <span className="text-sky-400 font-semibold">RF &amp; Satellite: </span>
                          <span className="text-slate-200">{phone.bands}</span>
                        </div>
                        <div className="text-slate-400">
                          <span className="text-amber-400 font-semibold">Key Advantage: </span>
                          <span className="text-slate-300">{phone.feature}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ready to Ship
                      </span>
                      <button
                        onClick={() => {
                          onClose();
                          onSelectCategory('DrFun1 Wireless Unlocked Phones');
                        }}
                        className="text-xs text-sky-400 hover:text-sky-300 font-mono font-medium flex items-center gap-1"
                      >
                        <span>View in Store</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Satellite 5G Plans Tab */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Plan 1 */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-sky-500/40 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                      Top Consumer &amp; Pro
                    </span>
                    <h4 className="text-base font-bold text-white mt-2">DrFun1 Wireless Infinite 5G</h4>
                    <p className="text-xs text-slate-400 mt-1">Multi-carrier terrestrial + continuous orbital satellite 5G.</p>
                    
                    <div className="my-4">
                      <span className="text-3xl font-bold text-white font-mono">$79</span>
                      <span className="text-xs text-slate-400 font-mono"> / month</span>
                      <span className="text-[11px] text-emerald-400 block font-mono mt-0.5">Save $31/mo vs individual carrier plans</span>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Auto-switch between T-Mobile, AT&amp;T &amp; Verizon</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Direct-to-Cell LEO satellite data included</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Truly unlimited high-speed data &amp; hotspot</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Direct peering inside Switch SUPERNAP Nevada</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onSelectCategory('DrFun1 Wireless Satellite 5G Plans');
                    }}
                    className="w-full mt-4 py-2 px-3 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors font-mono"
                  >
                    Select Infinite Plan
                  </button>
                </div>

                {/* Plan 2 */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/40 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      Universal eSIM Add-On
                    </span>
                    <h4 className="text-base font-bold text-white mt-2">DrFun1 Universal eSIM</h4>
                    <p className="text-xs text-slate-400 mt-1">Multi-IMSI dynamic switching for any unlocked phone.</p>
                    
                    <div className="my-4">
                      <span className="text-3xl font-bold text-white font-mono">$29</span>
                      <span className="text-xs text-slate-400 font-mono"> / month</span>
                      <span className="text-[11px] text-emerald-400 block font-mono mt-0.5">Wholesale rate (MSRP $45/mo)</span>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Works on any unlocked iPhone or Android</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Instant QR activation in 60 seconds</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>AST SpaceMobile &amp; Starlink Direct-to-Cell</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>RisingNet clean IP DDoS defense</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onSelectCategory('DrFun1 Wireless Satellite 5G Plans');
                    }}
                    className="w-full mt-4 py-2 px-3 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors font-mono"
                  >
                    Select Universal eSIM
                  </button>
                </div>

                {/* Plan 3 */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/40 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                      Enterprise Fleet Bundle
                    </span>
                    <h4 className="text-base font-bold text-white mt-2">Enterprise 50-Handset Fleet</h4>
                    <p className="text-xs text-slate-400 mt-1">50 unlocked satellite phones + 1-year unlimited service.</p>
                    
                    <div className="my-4">
                      <span className="text-3xl font-bold text-white font-mono">$49,500</span>
                      <span className="text-xs text-slate-400 font-mono"> one-time</span>
                      <span className="text-[11px] text-emerald-400 block font-mono mt-0.5">Save $15,500 vs individual lines</span>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>50 Unlocked Satellite 5G Smartphones</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>50 Active Multi-Carrier lines (12 months prepaid)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Central Cloud MDM + Remote Diagnostics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Dedicated UnrealIRCd dispatch channel link</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onSelectCategory('DrFun1 Wireless Satellite 5G Plans');
                    }}
                    className="w-full mt-4 py-2 px-3 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors font-mono"
                  >
                    Select Fleet 50-Pack
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Technology Tab */}
          {activeTab === 'technology' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Satellite className="w-5 h-5 text-sky-400" />
                  <span>How DrFun1 Wireless Direct-to-Cell Satellite 5G Operates</span>
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Traditional satellite phones required heavy external antennas and proprietary protocols. DrFun1 Wireless leverages standard 3GPP Release 17/18 Non-Terrestrial Networks (NTN) and massive Low-Earth-Orbit phased arrays from AST SpaceMobile, Starlink Direct-to-Cell, Qualcomm Snapdragon Satellite, and Skylo.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-sky-400 font-semibold block text-[11px]">1. Standard Cellular Frequencies</span>
                    <p className="text-slate-300 text-[11px] mt-1">Operating in existing cellular bands (Mid-Band PCS 1.9GHz, Band n255/n256), your unlocked phone talks directly to orbiting satellite cell towers without special hardware modifications.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-emerald-400 font-semibold block text-[11px]">2. Sub-50ms Low Latency</span>
                    <p className="text-slate-300 text-[11px] mt-1">LEO satellites orbit between 400km and 600km altitude. Round-trip radio latency is under 50ms, allowing natural two-way voice calling, video streaming, and rapid web browsing.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-amber-400 font-semibold block text-[11px]">3. Switch SUPERNAP Terrestrial PoP</span>
                    <p className="text-slate-300 text-[11px] mt-1">Satellite downlink beams hit ground teleports and immediately cross-connect over dark fiber to Switch SUPERNAP Las Vegas (<a href="https://www.switch.com" target="_blank" rel="noopener noreferrer" className="text-amber-300 underline">switch.com</a>) for tier-5 zero-packet-loss routing.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-purple-400 font-semibold block text-[11px]">4. RisingNet DDoS Defense &amp; IRC</span>
                    <p className="text-slate-300 text-[11px] mt-1">All mobile traffic is scrubbed against cyber threats through RisingNet BGP clean pipe transit (<a href="https://www.risingnet.com" target="_blank" rel="noopener noreferrer" className="text-purple-300 underline">risingnet.com</a>) and mirrored to irc.drfun1.com:6697.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* eSIM Tab */}
          {activeTab === 'esim' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row items-center gap-6">
                <div className="w-40 h-40 bg-white p-3 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                  <div className="w-full h-full border-4 border-slate-900 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                    <QrCode className="w-20 h-20 text-slate-950" />
                    <span className="text-[9px] font-bold text-slate-900 mt-1 uppercase">DrFun1 Wireless</span>
                  </div>
                </div>

                <div className="space-y-3 flex-1 text-xs">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-sky-400" />
                      <span>Instant Over-the-Air (OTA) Multi-Carrier eSIM</span>
                    </h4>
                    <p className="text-slate-400 mt-0.5 leading-snug">
                      Scan this digital code on any unlocked iPhone (XR through 16 Pro Max) or Android (Pixel 4+, Samsung S20+, Motorola) to instantly install the DrFun1 Wireless Multi-Carrier profile.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px]">
                    <span className="text-slate-500 block text-[10px] uppercase">Manual SM-DP+ Address &amp; Activation Code:</span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <code className="text-sky-300 truncate">LPA:1$smdp.drfun1.com$DRFUN1-WIRELESS-5G-NTN-UNIVERSAL</code>
                      <button
                        onClick={copyEsimLPA}
                        className="p-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 shrink-0"
                      >
                        {copiedEsim ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedEsim ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Multi-carrier roaming: T-Mobile, AT&amp;T, Verizon, Vodafone &amp; LEO Satellite</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact / Inquiries Footer */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-mono">Wholesale Dealer &amp; Carrier Inquiries:</span>
              <a href="mailto:livewithdrfun1@gmail.com" className="text-sky-400 hover:underline font-mono font-semibold ml-2">
                livewithdrfun1@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DrFun1 NOC: irc.drfun1.com #drfun1-wireless</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            DrFun1 ECOM Inc &bull; All Handsets 100% Factory Unlocked
          </span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
