/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Switch.com Owned Infrastructure & Witt Law Firm Satellite Fiber Interactive Portal
 * Certified under Certificate ID: RAW-SATCOM-2026-LIC-0881 | FCC FRN: 0034981290
 */

import React, { useState } from 'react';
import { 
  X, 
  Server, 
  ShieldCheck, 
  Globe2, 
  Zap, 
  Radio, 
  FileText, 
  Building2, 
  Network, 
  ExternalLink, 
  CheckCircle2, 
  ShoppingCart, 
  Layers, 
  Lock, 
  Scale, 
  Mail, 
  Activity, 
  MapPin, 
  Cpu
} from 'lucide-react';
import { 
  SWITCH_OWNED_CAMPUSES, 
  WITT_LAW_FIRM_SERVICES, 
  SWITCH_WITT_STORE_PRODUCTS, 
  SwitchCampusProfile, 
  WittLawFirmServiceProfile 
} from '../data/switchWittServicesData';
import { StoreProduct } from '../types/store';

interface SwitchWittSatelliteFiberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: StoreProduct) => void;
}

type TabType = 'campuses' | 'superloop' | 'witt_legal' | 'integrated_solutions' | 'procurement';

export const SwitchWittSatelliteFiberModal: React.FC<SwitchWittSatelliteFiberModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('campuses');
  const [selectedCampusId, setSelectedCampusId] = useState<string>(SWITCH_OWNED_CAMPUSES[0].id);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(WITT_LAW_FIRM_SERVICES[0].id);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);
  const [pingActive, setPingActive] = useState<boolean>(false);
  const [simulatedPing, setSimulatedPing] = useState<{ [key: string]: number }>({
    'The Core (Las Vegas)': 3.8,
    'The Citadel (Tahoe Reno)': 4.2,
    'The Pyramid (Grand Rapids)': 11.4,
    'The Keep (Atlanta)': 14.1,
    'The Rock (Austin)': 12.6,
  });

  if (!isOpen) return null;

  const currentCampus: SwitchCampusProfile = 
    SWITCH_OWNED_CAMPUSES.find(c => c.id === selectedCampusId) || SWITCH_OWNED_CAMPUSES[0];

  const currentService: WittLawFirmServiceProfile = 
    WITT_LAW_FIRM_SERVICES.find(s => s.id === selectedServiceId) || WITT_LAW_FIRM_SERVICES[0];

  const handleAddToCart = (product: StoreProduct) => {
    if (onAddToCart) {
      onAddToCart(product);
      setOrderNotice(`Added "${product.name}" to your procurement cart!`);
    } else {
      setOrderNotice(`Procurement order initiated for "${product.name}". An escrow confirmation will be sent to legal.`);
    }
    setTimeout(() => setOrderNotice(null), 4000);
  };

  const runLatencyTest = () => {
    setPingActive(true);
    setTimeout(() => {
      setSimulatedPing({
        'The Core (Las Vegas)': +(3.5 + Math.random() * 0.8).toFixed(2),
        'The Citadel (Tahoe Reno)': +(4.0 + Math.random() * 0.7).toFixed(2),
        'The Pyramid (Grand Rapids)': +(11.0 + Math.random() * 1.2).toFixed(2),
        'The Keep (Atlanta)': +(13.8 + Math.random() * 1.1).toFixed(2),
        'The Rock (Austin)': +(12.1 + Math.random() * 0.9).toFixed(2),
      });
      setPingActive(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/50 p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 border border-emerald-400/30">
              <Network className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold tracking-wider uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                  Switch.com & Witt Law Firm
                </span>
                <span className="text-xs font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  Cert: RAW-SATCOM-2026-LIC-0881
                </span>
                <span className="text-xs font-medium text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/50">
                  FCC FRN: 0034981290
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                Switch Owned Infrastructure & Witt Law Satellite Fiber Services
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Official space-to-fiber integration connecting Switch Class 5 Platinum Data Centers with Witt Law Firm Title Escrow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <a 
              href="https://www.switch.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition"
            >
              <span>switch.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://www.wittlawfirm.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition"
            >
              <span>wittlawfirm.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Close Modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {orderNotice && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{orderNotice}</span>
            </div>
            <button onClick={() => setOrderNotice(null)} className="text-xs uppercase hover:underline">Dismiss</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex overflow-x-auto gap-2 py-2">
          <button
            onClick={() => setActiveTab('campuses')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'campuses'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Switch Owned Campuses
          </button>
          <button
            onClick={() => setActiveTab('superloop')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'superloop'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            Switch CONNECT SuperLoop & Latency
          </button>
          <button
            onClick={() => setActiveTab('witt_legal')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'witt_legal'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            Witt Law Satellite Fiber Escrow
          </button>
          <button
            onClick={() => setActiveTab('integrated_solutions')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'integrated_solutions'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Space-to-Fiber Solutions
          </button>
          <button
            onClick={() => setActiveTab('procurement')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'procurement'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Procurement Catalog ({SWITCH_WITT_STORE_PRODUCTS.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: SWITCH OWNED CAMPUSES */}
          {activeTab === 'campuses' && (
            <div className="space-y-6">
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-emerald-400" />
                    Switch.com Class 5 Platinum Data Center Ecosystem
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Select a Switch owned physical campus to review square footage, green renewable power capacity, carrier teleport dish arrays, and dedicated UnrealIRCd leaf nodes.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SWITCH_OWNED_CAMPUSES.map(campus => (
                    <button
                      key={campus.id}
                      onClick={() => setSelectedCampusId(campus.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                        selectedCampusId === campus.id
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                          : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {campus.name.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campus Deep Dive Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-5">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        Switch Owned Campus Profile
                      </div>
                      <h4 className="text-xl font-bold text-white mt-0.5">{currentCampus.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {currentCampus.location}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-1 rounded">
                      {currentCampus.tierCertification}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {currentCampus.description}
                  </p>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <div className="text-xs text-slate-400">Total Scale</div>
                      <div className="text-sm font-bold text-white mt-1">{currentCampus.sqFt}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <div className="text-xs text-slate-400">Renewable Power</div>
                      <div className="text-sm font-bold text-emerald-400 mt-1">{currentCampus.powerCapacityMw}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <div className="text-xs text-slate-400">SuperLoop Latency</div>
                      <div className="text-sm font-bold text-amber-400 mt-1">{currentCampus.superLoopLatency}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <div className="text-xs text-slate-400">Carriers & Meet-Me</div>
                      <div className="text-sm font-bold text-cyan-400 mt-1">{currentCampus.fiberProvidersCount}+ Carriers</div>
                    </div>
                  </div>

                  {/* Teleport Array Feature */}
                  <div className="bg-gradient-to-r from-slate-900 to-emerald-950/30 border border-emerald-900/40 rounded-lg p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-300">
                      <Radio className="w-4 h-4 text-emerald-400" />
                      Teleport & Satellite Dish Array
                    </div>
                    <p className="text-xs text-slate-300">
                      {currentCampus.teleportFacilities}
                    </p>
                  </div>

                  {/* Key Campus Features */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Key Physical & Architectural Capabilities
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentCampus.keyFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* UnrealIRCd Leaf Node Status & Out-of-Band Control */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      UnrealIRCd Out-of-Band NOC Leaves
                    </div>
                    <h4 className="text-base font-bold text-white mt-1">
                      Dedicated IRC Telemetry Nodes
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Each Switch campus maintains isolated TLS UnrealIRCd nodes peered to the master hub at irc.drfun1.com:6697 for real-time telemetry and channel synchronization.
                    </p>

                    <div className="mt-4 space-y-2">
                      {currentCampus.unrealIrcdLeafNodes.map((node, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-mono bg-slate-900 p-2 rounded border border-slate-800">
                          <span className="text-emerald-400 truncate mr-2">{node}</span>
                          <span className="text-[10px] text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                            ONLINE (TLS)
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-2">
                      <div className="text-xs font-semibold text-slate-300">Live Latency to Central NOC:</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Direct Optical Roundtrip:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {simulatedPing[currentCampus.name.split(' (')[0]] || 4.2} ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Witt Escrow Status:</span>
                        <span className="font-semibold text-teal-300">Indemnified Under RAW-0881</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const prod = SWITCH_WITT_STORE_PRODUCTS.find(p => p.id === 'switch-superloop-400g') || SWITCH_WITT_STORE_PRODUCTS[0];
                      handleAddToCart(prod);
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Procure Colocation & Cross-Connect at {currentCampus.name.split(' (')[0]}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SWITCH SUPERLOOP & LATENCY */}
          {activeTab === 'superloop' && (
            <div className="space-y-6">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Switch CONNECT Optical Infrastructure
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      The Patented Switch SuperLoop 400G / 800G DWDM Network
                    </h3>
                  </div>
                  <button
                    onClick={runLatencyTest}
                    disabled={pingActive}
                    className="self-start sm:self-auto px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                  >
                    <Activity className={`w-3.5 h-3.5 ${pingActive ? 'animate-spin' : ''}`} />
                    {pingActive ? 'Measuring Route...' : 'Run Real-Time Ping'}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  The Switch SuperLoop connects Switch data center campuses and major metropolitan carrier exchanges via an ultra-low latency, redundant DWDM optical fiber ring. Coupled with Witt Law Firm 20-30 year IRU contracts, users obtain dedicated, unassailable dark fiber channels for 8K video broadcast, master playout syndication, and uncompressed multi-satellite aggregation.
                </p>

                {/* Latency Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
                  {Object.entries(simulatedPing).map(([campusName, latency]) => (
                    <div key={campusName} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-white truncate">{campusName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Switch SuperLoop Route</div>
                      </div>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-2xl font-mono font-bold text-emerald-400">{latency}</span>
                        <span className="text-xs text-slate-400 font-mono">ms RTT</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (latency / 20) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SuperLoop Architectural Topology */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Switch CONNECT Core Specifications
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong>Carrier-Neutral Purchasing Power:</strong> Aggregates over 50 global carriers with wholesale volume pricing directly passed through to clients.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong>Sub-4.7ms Trans-Sierra Link:</strong> Direct low-loss optical fiber linking Northern Nevada (The Citadel) with Las Vegas (The Core) and Silicon Valley / Los Angeles exchanges.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong>Zero Single-Point-of-Failure:</strong> Redundant optical path diversity, physically separated conduit paths, and multi-entry vaults.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong>Direct Cloud On-Ramps:</strong> Sub-millisecond cross-connects into AWS Direct Connect, Azure ExpressRoute, Google Cloud Interconnect, and Oracle Cloud.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    Witt Law Firm Statutory IRU Integration
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong>30-Year Indefeasible Rights:</strong> Dark fiber strands are legally protected against carrier restructuring or bankruptcy actions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong>Utility Easement & Right-of-Way (ROW):</strong> Master regulatory permits secured across California, Nevada, Michigan, Georgia, and Texas.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong>Escrow Holding:</strong> Security deposits and recurring IRU lease balances held safely in The Richard Alan Witt Satellite Escrow Trust Account.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong>Certificate Guarantee:</strong> Fully audited under Certificate ID RAW-SATCOM-2026-LIC-0881.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WITT LAW SATELLITE FIBER ESCROW */}
          {activeTab === 'witt_legal' && (
            <div className="space-y-6">
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-emerald-400" />
                    The Law Office of Richard A. Witt LLC & Owens Company
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Specialized space telecom, satellite orbital escrow, FCC Part 25 licensing, and long-term dark fiber IRU agreements.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {WITT_LAW_FIRM_SERVICES.map(service => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                        selectedServiceId === service.id
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                          : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {service.title.split(' ')[0]} {service.title.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Deep Dive Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-5">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        {currentService.practiceArea}
                      </div>
                      <h4 className="text-xl font-bold text-white mt-0.5">{currentService.title}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Scale className="w-3.5 h-3.5 text-emerald-400" />
                        Lead Counsel: {currentService.attorneyLead} | {currentService.certificateRef}
                      </p>
                    </div>
                    {currentService.escrowCertified && (
                      <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-1 rounded flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Escrow Certified
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {currentService.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <div className="text-xs text-slate-400">Regulatory Body</div>
                      <div className="text-sm font-semibold text-white mt-1">{currentService.regulatoryJurisdiction}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <div className="text-xs text-slate-400">Agreement Term</div>
                      <div className="text-sm font-semibold text-white mt-1">{currentService.typicalTermYears}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <div className="text-xs text-slate-400">Fee Structure</div>
                      <div className="text-sm font-semibold text-emerald-400 mt-1">{currentService.feeStructure}</div>
                    </div>
                  </div>

                  {/* Legal Deliverables */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Statutory Deliverables & Escrow Protections
                    </h5>
                    <div className="space-y-2">
                      {currentService.deliverables.map((deliv, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{deliv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Certificate & Retainer Box */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Attorney Accreditation
                    </div>
                    <h4 className="text-base font-bold text-white">
                      The Law Office of Richard A. Witt LLC
                    </h4>
                    
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs space-y-1.5 font-mono">
                      <div><strong className="text-slate-400">Firm:</strong> <span className="text-white">Witt Law Firm LLC</span></div>
                      <div><strong className="text-slate-400">Cert ID:</strong> <span className="text-emerald-400 font-bold">RAW-SATCOM-2026-LIC-0881</span></div>
                      <div><strong className="text-slate-400">FCC FRN:</strong> <span className="text-amber-400">0034981290</span></div>
                      <div><strong className="text-slate-400">Affiliate:</strong> <span className="text-cyan-400">Owens Company</span></div>
                      <div><strong className="text-slate-400">Email:</strong> <span className="text-slate-300">livewithdrfun1@gmail.com</span></div>
                    </div>

                    <div className="text-xs text-slate-400 leading-relaxed">
                      All contracts entered through this portal are drafted in accordance with 47 CFR Part 25, ITU Radio Regulations, and state dark fiber property easement statutes.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        const prod = SWITCH_WITT_STORE_PRODUCTS.find(p => p.category === 'Witt Law Firm Satellite Fiber Escrow') || SWITCH_WITT_STORE_PRODUCTS[3];
                        handleAddToCart(prod);
                      }}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition"
                    >
                      <FileText className="w-4 h-4" />
                      Execute Legal Retainer & Escrow Order
                    </button>
                    <a
                      href="mailto:livewithdrfun1@gmail.com?subject=Legal Retainer Request: RAW-SATCOM-2026-LIC-0881"
                      className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Contact Richard Alan Witt, Esq.
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INTEGRATED SPACE-TO-FIBER SOLUTIONS */}
          {activeTab === 'integrated_solutions' && (
            <div className="space-y-6">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    End-to-End Hybrid Telecom Architecture
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    How Switch Infrastructure Combines with Witt Law Satellite Escrow
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    DrFun1 brings together the highest tier of physical data center colocation with specialized legal indemnification, creating an all-in-one broadcast, satellite, and optical fiber carrier platform.
                  </p>
                </div>

                {/* Architecture 4-step Diagram */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-800">
                        01
                      </div>
                      <h4 className="text-sm font-bold text-white mt-3">Orbital Capture</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        C/Ku/Ka-Band feeds and 1550nm optical satellite lasers downlinked into Switch Las Vegas & Tahoe Reno teleport rooftop dish arrays.
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] text-emerald-400 font-mono">
                      Physical Teleport Tier-IV
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-teal-950 text-teal-400 flex items-center justify-center font-bold text-sm border border-teal-800">
                        02
                      </div>
                      <h4 className="text-sm font-bold text-white mt-3">Switch SuperLoop</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Uncompressed 400G / 800G optical transport shuttling feeds sub-4.7ms across Nevada, California, Michigan, Georgia, and Texas.
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] text-teal-400 font-mono">
                      100% Green Solar Powered
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-800">
                        03
                      </div>
                      <h4 className="text-sm font-bold text-white mt-3">Witt Law Escrow</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Full title holding, ITU priority filing, and 30-year dark fiber IRU contracts preventing interruption and guaranteeing SLA indemnification.
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] text-cyan-400 font-mono">
                      Cert RAW-SATCOM-2026-LIC-0881
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-800">
                        04
                      </div>
                      <h4 className="text-sm font-bold text-white mt-3">DrFun1TV Playout</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        FCC.gov EPG channels, Twitch & Kick restreaming, UnrealIRCd telemetry, and SCTE-35 automated ad-insertion syndication.
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] text-purple-400 font-mono">
                      FCC FRN: 0034981290
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct-to-Cell + Terrestrial Integration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
                    <Radio className="w-4 h-4" />
                    Direct-to-Cell 3GPP NTN Roaming
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Global Unlocked Mobile Handset Integration
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Witt Law Firm structures the carrier roaming agreements allowing DrFun1 Wireless unlocked phones (iPhone 16 Pro Max, Galaxy S25 Ultra) to switch seamlessly between T-Mobile, AT&T, Verizon, and direct-to-satellite AST SpaceMobile / Starlink 5G broadband.
                  </p>
                  <div className="p-3 bg-slate-900 rounded-lg text-xs text-slate-400 border border-slate-800">
                    Core traffic routes directly through Switch SUPERNAP Las Vegas with sub-5ms low latency backhaul.
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase">
                    <Globe2 className="w-4 h-4" />
                    Wholesale Franchise Rebranding
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Turnkey Space & Fiber MSP White-Labeling
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Under Richard Alan Witt's master wholesale agreement, independent operators and broadcasters can rebrand the entire Switch colocation, SuperLoop fiber, and satellite playout under their own corporate entity with complete statutory indemnification.
                  </p>
                  <div className="p-3 bg-slate-900 rounded-lg text-xs text-slate-400 border border-slate-800">
                    Includes dedicated Anope NetAdmin and IRC channel operator rights on irc.drfun1.com.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROCUREMENT CATALOG */}
          {activeTab === 'procurement' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-emerald-400" />
                    Switch Owned & Witt Law Escrow Procurement Catalog
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Book dedicated Switch colocation space, 400G optical SuperLoop transport, or execute binding Witt Law Firm legal escrow agreements.
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1.5 rounded-lg">
                  {SWITCH_WITT_STORE_PRODUCTS.length} Enterprise Solutions Ready
                </div>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SWITCH_WITT_STORE_PRODUCTS.map((prod) => (
                  <div 
                    key={prod.id} 
                    className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/50 transition space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-800/60 px-2 py-0.5 rounded">
                          {prod.badge || prod.category}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {prod.stockStatus}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-2 leading-tight">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {prod.tagline}
                      </p>

                      <div className="mt-3 p-2.5 bg-slate-900/80 rounded-lg text-xs space-y-1">
                        <div className="text-slate-400">
                          <strong className="text-slate-300">Carrier / Entity:</strong> {prod.oemCarriers?.join(', ')}
                        </div>
                        <div className="text-slate-400">
                          <strong className="text-slate-300">Campus:</strong> {prod.switchInterconnectCampus}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400 line-through">
                          ${prod.retailPrice.toLocaleString()}
                        </div>
                        <div className="text-base font-bold text-emerald-400 font-mono">
                          ${prod.drfun1WholesalePrice.toLocaleString()}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">/{prod.priceUnit}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddToCart(prod)}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition shadow"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Procure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              All services licensed under The Law Office of Richard A. Witt LLC (Certificate: <strong>RAW-SATCOM-2026-LIC-0881</strong>) & Switch.com Class 5 Platinum Data Centers.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
