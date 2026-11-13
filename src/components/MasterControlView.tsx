/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * MASTER CONTROL & CARRIER DOWNLINKS
 * Centralized transmission infrastructure:
 * - Switch SUPERNAP Nevada 100G Teleport & Fiber Ring
 * - DataPacket 100G Trans-Atlantic Ingest Points of Presence
 * - TVU Networks Cloud CDN clone & ISSP bonding
 * - Satellite Ground Station Downlinks & Carrier Directory
 * - ZNC WebAdmin Bouncer & NetAdmin Management
 * - Global Legal & Regulatory Compliance (FCC FRN 0034981290)
 */

import React, { useState } from 'react';
import { 
  Server, 
  Wifi, 
  ShieldCheck, 
  Activity, 
  Globe, 
  ExternalLink, 
  CheckCircle2, 
  Terminal, 
  Cpu, 
  Layers, 
  Radio, 
  Satellite, 
  Sliders, 
  Copy, 
  Check, 
  Clock, 
  Zap, 
  Scale, 
  Flame,
  ChevronRight,
  Database,
  Lock,
  Smartphone,
  Rss,
  Tv,
  TrendingUp,
  Maximize2
} from 'lucide-react';
import { SatelliteCompany } from '../types/satellite';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { SWITCH_DEDICATED_NODES, UNREAL_HUB_DETAILS } from '../data/ircData';
import { ALL_NETWORK_LEAF_NODES } from '../data/unrealSearchData';
import { SatelliteRssNewsSection } from './SatelliteRssNewsSection';
import { FuboTvCloneView } from './FuboTvCloneView';
import { NocDashboardSection } from './NocDashboardSection';
import { SatelliteFleetStatusNotifier } from './SatelliteFleetStatusNotifier';
import { StatServDashboard } from './StatServDashboard';
import { ConstellationFleetStabilityChart } from './ConstellationFleetStabilityChart';
import { LeafletSatelliteTracker } from './LeafletSatelliteTracker';

interface MasterControlViewProps {
  companies: SatelliteCompany[];
  onOpenLicense: () => void;
  onOpenSwitchMesh: () => void;
  onOpenSwitchWittServices?: () => void;
  onOpenIrcdAdmin?: () => void;
  onOpenZncWebAdmin?: () => void;
  onOpenUnrealSearch?: () => void;
  onOpenOrbitMap?: (constellations?: string[]) => void;
  activeRank?: AnopeRankLevel;
}

export const MasterControlView: React.FC<MasterControlViewProps> = ({
  companies,
  onOpenLicense,
  onOpenSwitchMesh,
  onOpenSwitchWittServices,
  onOpenIrcdAdmin,
  onOpenZncWebAdmin,
  onOpenUnrealSearch,
  onOpenOrbitMap,
  activeRank = 'op'
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedConstellationsForCoverage, setSelectedConstellationsForCoverage] = useState<string[]>(['Starlink']);
  const [activeSubTab, setActiveSubTab] = useState<'infrastructure' | 'downlinks' | 'leaf_nodes' | 'noc' | 'fleet_status' | 'fleet_stability' | 'orbit_coverage' | 'statserv' | 'compliance' | 'rss_news' | 'fubotv'>('noc');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Infrastructure Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Server className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Master Control &amp; Carrier Downlink Infrastructure
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  SWITCH 100G FIBER RING
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  1,034 Nodes (Dual-Hub)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                500 Switch/Hub via CGW Law Offices · 12 DataPacket/Hub · 10 RisingNet Dedicated Servers · License: www.wittlawfirm.com · Payment: Owens Company (Bill in Receiving)
              </p>
            </div>
          </div>

          {/* Quick Management Triggers */}
          <div className="flex items-center flex-wrap gap-2">
            {onOpenIrcdAdmin && (
              <button
                onClick={onOpenIrcdAdmin}
                className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-500/50 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>NetAdmin Ops</span>
              </button>
            )}

            {onOpenZncWebAdmin && (
              <button
                onClick={onOpenZncWebAdmin}
                className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-500/50 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>ZNC Bouncer</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onOpenOrbitMap) {
                  onOpenOrbitMap(selectedConstellationsForCoverage);
                } else {
                  setActiveSubTab('orbit_coverage');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                activeSubTab === 'orbit_coverage'
                  ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow-cyan-950/30'
                  : 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-200 border border-cyan-500/50'
              }`}
              title="Launch Orbit Tracking Map with real-time Constellation Coverage Layer"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Coverage Map ({selectedConstellationsForCoverage.join(', ')})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('statserv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                activeSubTab === 'statserv'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-600/40'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>StatServ IRC Vitals</span>
            </button>

            <button
              onClick={onOpenLicense}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>FCC License (FRN 0034981290)</span>
            </button>
          </div>
        </div>

        {/* Master Control Sub-Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('noc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'noc' || activeSubTab === 'leaf_nodes'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Network Operations Center (NOC)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
              1,034 Nodes (Dual-Hub)
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('statserv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'statserv'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>StatServ IRC Vitals</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              pauljz/StatServ
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('fleet_status')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'fleet_status'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50'
            }`}
          >
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span>Satellite Fleet Status</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              TLE Alerts
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('fleet_stability')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'fleet_stability'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fleet Stability Trends</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              Recharts
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('orbit_coverage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'orbit_coverage'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Orbit Coverage Map</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              Live Footprints
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('infrastructure')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'infrastructure'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Switch &amp; DataPacket Backbone</span>
          </button>

          <button
            onClick={() => setActiveSubTab('downlinks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'downlinks'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-sky-300 hover:bg-slate-800/50'
            }`}
          >
            <Satellite className="w-3.5 h-3.5 text-sky-400" />
            <span>Satellite Carrier Downlinks ({companies.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('leaf_nodes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'leaf_nodes'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>1,034 Dual-Hub Leaf Nodes</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rss_news')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'rss_news'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/50'
            }`}
          >
            <Rss className="w-3.5 h-3.5 text-amber-400" />
            <span>Satellite, Fiber &amp; Wireless RSS Newsroom</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
              Live Wire
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('fubotv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'fubotv'
                ? 'bg-orange-600/25 text-orange-300 border border-orange-500/50 font-bold shadow-sm'
                : 'text-slate-400 hover:text-orange-400 hover:bg-slate-800/50'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-orange-500" />
            <span>Fubo.tv Sports Playout</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 font-bold">
              4K Live
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('compliance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'compliance'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Regulatory &amp; Witt Law Center</span>
          </button>
        </div>
      </div>

      {/* Real-Time Satellite Fleet Status & TLE Change Alert Ticker */}
      <SatelliteFleetStatusNotifier
        variant="ticker"
        onOpenConstellationOverlay={() => setActiveSubTab('orbit_coverage')}
      />

      {/* Tab 1: Backbone Infrastructure */}
      {activeSubTab === 'infrastructure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Switch SUPERNAP Nevada */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-white text-sm">Switch SUPERNAP NV</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                500/HUB VIA CGW LAW OFFICES
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              1,000 dedicated Switch.com Tier 5 Platinum nodes (500 per hub) contracted and represented via <strong className="text-white">CGW Law Offices</strong>, synced &amp; leafed to both irc.drfun1.com &amp; irc.drfun1media.com.
            </p>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Deployment:</span>
                <span className="text-emerald-400 font-bold">500/Hub (1,000 Total)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Legal Representation:</span>
                <span className="text-cyan-400 font-bold">CGW Law Offices</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Synced Hubs:</span>
                <span className="text-purple-400 font-bold">irc.drfun1.com &amp; irc.drfun1media.com</span>
              </div>
            </div>
          </div>

          {/* DataPacket 100G CDN */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-bold text-white text-sm">DataPacket 100G Leafs</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                12 LEAFS/HUB · 24 TOTAL
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              12 dedicated www.datapacket.com 100G no-ads leaf nodes per hub (24 total), dual-synced across North America, Europe &amp; APAC to both IRCd hubs.
            </p>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Active Leaf Nodes:</span>
                <span className="text-cyan-400 font-bold">12/Hub (24 Ultra-Edge)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Policy &amp; Sync:</span>
                <span className="text-emerald-400 font-bold">No-Ads · Dual-Hub Synced</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Average Packet Loss:</span>
                <span className="text-emerald-400 font-bold">0.000%</span>
              </div>
            </div>
          </div>

          {/* RisingNet 10 Dedicated Servers */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400 animate-ping" />
                <span className="font-bold text-white text-sm">RisingNet.com Servers</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                10 DEDICATED SERVERS
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              10 dedicated Tier-1 bare-metal servers from www.risingnet.com provisioned with 100G DWDM transit, all synchronized and leafed to BOTH irc.drfun1.com &amp; irc.drfun1media.com.
            </p>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Dedicated Fleet:</span>
                <span className="text-purple-400 font-bold">10 RisingNet Servers (R01–R10)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Hub Federation:</span>
                <span className="text-emerald-400 font-bold">Leafed to Both Hubs</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Payment Office:</span>
                <span className="text-cyan-400 font-bold">Owens Co. (Bill in Receiving)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Satellite Carrier Downlinks */}
      {activeSubTab === 'downlinks' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Satellite className="w-4 h-4 text-sky-400" />
                Satellite Telemetry &amp; Carrier Interconnect Registry
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified commercial satellite operators, LEO mega-constellations, and 3GPP Release 17/18 NTN direct-to-device carriers.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 font-bold">
              {companies.length} Carriers Verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase bg-slate-950/40">
                  <th className="py-3 px-4">Operator / Carrier</th>
                  <th className="py-3 px-4">Orbit &amp; Altitude</th>
                  <th className="py-3 px-4">Fleet in Orbit</th>
                  <th className="py-3 px-4">Bands / Technology</th>
                  <th className="py-3 px-4">Teleport Interconnect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {companies.slice(0, 15).map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3 px-4 font-sans font-bold text-white">
                      <div>{comp.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 font-normal">{comp.headquarters.city}, {comp.headquarters.country}</div>
                    </td>
                    <td className="py-3 px-4 text-sky-300">
                      <div>{comp.orbitType}</div>
                      <div className="text-[10px] text-slate-500">{comp.altitudeKm}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      <span className="text-emerald-400 font-bold">{comp.fleetSize.activeSatellites.toLocaleString()}</span> active
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {comp.frequencyBands.join(', ')}
                    </td>
                    <td className="py-3 px-4 font-sans text-xs text-slate-300">
                      {comp.satcomWholesaleOfferings[0] || 'Broadband Downlink'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Network Operations Center (NOC) Dashboard - 1,000-Leaf Mesh Visual Grid (500 Per Hub) */}
      {(activeSubTab === 'noc' || activeSubTab === 'leaf_nodes') && (
        <NocDashboardSection
          onOpenLicense={onOpenLicense}
          onOpenSwitchMesh={onOpenSwitchMesh}
          onOpenUnrealSearch={onOpenUnrealSearch}
        />
      )}

      {/* Tab 4: Compliance */}
      {activeSubTab === 'compliance' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Legal, Regulatory &amp; FCC Licensing Center
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                FCC FRN 0034981290 · Supervised by The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)
              </p>
            </div>
            <a
              href="https://www.wittlawfirm.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 text-xs font-mono flex items-center gap-1"
            >
              <span>wittlawfirm.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-400" />
                Master App Licensing (www.wittlawfirm.com)
              </div>
              <p className="text-slate-300 leading-relaxed">
                Licensed by <strong>The Law Office of Richard A. Witt LLC</strong> (<a href="https://www.wittlawfirm.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">www.wittlawfirm.com</a>) to Licensee <strong>Richard Alan Witt</strong> under FCC FRN <strong>0034981290</strong> (Certificate ID: <code>RAW-SATCOM-2026-LIC-0881</code>).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-purple-400" />
                Payment Office: Owens Company (Bill in Receiving)
              </div>
              <p className="text-slate-300 leading-relaxed">
                Designated Payment Office: <strong>Owens Company</strong> (<a href="https://www.owenscompany.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">www.owenscompany.com</a>). All settlement invoices, purchase orders, and hardware disbursements are directed to <strong>Bill in Receiving</strong> (Owens Company Accounts Payable &amp; Receiving Department).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                CGW Law Offices Switch.com Representation
              </div>
              <p className="text-slate-300 leading-relaxed">
                All <strong>1,000 www.switch.com nodes</strong> (500 nodes per hub across <code>irc.drfun1.com</code> &amp; <code>irc.drfun1media.com</code>) are procured and represented via <strong>CGW Law Offices</strong>, federated alongside <strong>24 DataPacket leafs</strong> (12/hub) and <strong>10 RisingNet dedicated servers</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Satellite, Fiber, Wireless & Internet RSS Newsroom */}
      {activeSubTab === 'rss_news' && (
        <SatelliteRssNewsSection mode="full" />
      )}

      {/* Tab 6: Fubo.tv Live Sports, 4K Multi-View & EPG */}
      {activeSubTab === 'fubotv' && (
        <FuboTvCloneView
          onOpenLicense={onOpenLicense}
          onOpenSwitchMesh={onOpenSwitchMesh}
        />
      )}

      {/* Tab 7: Satellite Fleet Status & Real-Time TLE Alert Center */}
      {activeSubTab === 'fleet_status' && (
        <div className="space-y-6">
          <ConstellationFleetStabilityChart
            onOpenLicense={onOpenLicense}
            onOpenConstellationOverlay={(cName) => {
              if (cName) setSelectedConstellationsForCoverage([cName]);
              setActiveSubTab('orbit_coverage');
            }}
          />
          <SatelliteFleetStatusNotifier
            variant="full"
            onOpenLicense={onOpenLicense}
            onOpenConstellationOverlay={() => setActiveSubTab('orbit_coverage')}
          />
        </div>
      )}

      {/* Tab: Dedicated Fleet Stability & TLE Trends */}
      {activeSubTab === 'fleet_stability' && (
        <ConstellationFleetStabilityChart
          onOpenLicense={onOpenLicense}
          onOpenConstellationOverlay={(cName) => {
            if (cName) setSelectedConstellationsForCoverage([cName]);
            setActiveSubTab('orbit_coverage');
          }}
        />
      )}

      {/* Tab: Real-Time Orbit Tracking Map with Live Constellation Coverage Layer */}
      {activeSubTab === 'orbit_coverage' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                <Globe className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">Real-Time Constellation Coverage Layer</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE SGP4 / TLE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualizing illuminated RF footprint circles, phased-array cellular spot beams, laser ISL crosslinks, and Switch SUPERNAP feeder locks.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenOrbitMap && (
                <button
                  onClick={() => onOpenOrbitMap(selectedConstellationsForCoverage)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Open orbit tracker in fullscreen dialog"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Fullscreen Map</span>
                </button>
              )}
            </div>
          </div>

          <LeafletSatelliteTracker
            onOpenLicense={onOpenLicense}
            onOpenSwitchMesh={onOpenSwitchMesh}
            isModalView={false}
            selectedConstellations={selectedConstellationsForCoverage}
            onConstellationChange={setSelectedConstellationsForCoverage}
          />
        </div>
      )}

      {/* Tab 8: PaulJZ StatServ UnrealIRCd Sockets & SNOTICE Telemetry */}
      {activeSubTab === 'statserv' && (
        <StatServDashboard
          onOpenLicense={onOpenLicense}
          onOpenIrcClient={onOpenIrcdAdmin}
        />
      )}
    </div>
  );
};
