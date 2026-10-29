import React, { useState } from 'react';
import { SatelliteCompany, OrbitType } from '../types/satellite';
import { Orbit, Radio, Globe, ArrowRight, Layers } from 'lucide-react';

interface OrbitVisualizerProps {
  companies: SatelliteCompany[];
  onSelectCompany: (company: SatelliteCompany) => void;
}

export const OrbitVisualizer: React.FC<OrbitVisualizerProps> = ({
  companies,
  onSelectCompany,
}) => {
  const [selectedOrbitFilter, setSelectedOrbitFilter] = useState<OrbitType | 'All'>('All');

  const leoCompanies = companies.filter((c) => c.orbitType === 'LEO');
  const meoCompanies = companies.filter((c) => c.orbitType === 'MEO');
  const geoCompanies = companies.filter((c) => c.orbitType === 'GEO');
  const hybridCompanies = companies.filter((c) => c.orbitType === 'Hybrid');
  const groundCompanies = companies.filter((c) => c.orbitType === 'Ground Segment');

  const filteredCompanies = selectedOrbitFilter === 'All' 
    ? companies 
    : companies.filter(c => c.orbitType === selectedOrbitFilter);

  return (
    <div className="space-y-6">
      {/* Overview introduction */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Orbit className="w-5 h-5 text-sky-400" />
              <span>Orbital Altitude & Constellation Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Comparative visualization of satellite communication orbital regimes. Latency is dictated by the speed of light over transmission distance: from ultra-low latency LEO constellations (20–40ms) up to broad-footprint Geostationary (GEO) arcs (~600ms).
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs self-start md:self-auto shrink-0">
            {(['All', 'LEO', 'GEO', 'Hybrid', 'Ground Segment'] as const).map((orb) => (
              <button
                key={orb}
                onClick={() => setSelectedOrbitFilter(orb)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedOrbitFilter === orb
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {orb}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Altitude Ladder */}
        <div className="space-y-4 pt-2">
          {/* GEO Band (35,786 km) */}
          {(selectedOrbitFilter === 'All' || selectedOrbitFilter === 'GEO' || selectedOrbitFilter === 'Hybrid') && (
            <div className="border border-indigo-900/40 bg-gradient-to-r from-indigo-950/20 to-slate-950/60 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-900/30 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                    Geostationary Orbit (GEO)
                  </span>
                  <span className="text-slate-600 font-mono">·</span>
                  <span className="text-xs font-mono text-slate-300">35,786 km altitude</span>
                  <span className="text-slate-600 font-mono">·</span>
                  <span className="text-xs font-mono text-slate-400">Latency: ~550 - 620 ms</span>
                </div>
                <span className="text-xs text-indigo-300/80 font-mono">
                  Permanent static ground dish alignment · 3 satellites cover whole globe (excl. poles)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {[...geoCompanies, ...hybridCompanies].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCompany(c)}
                    className="p-2.5 bg-slate-900/80 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-left transition-colors group"
                  >
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 truncate">
                      {c.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                      {c.frequencyBands.slice(0, 2).join(', ')} · {c.headquarters.country}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MEO Band (2,000 - 35,786 km) */}
          {(selectedOrbitFilter === 'All' || selectedOrbitFilter === 'MEO' || selectedOrbitFilter === 'Hybrid') && (
            <div className="border border-cyan-900/40 bg-gradient-to-r from-cyan-950/20 to-slate-950/60 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-900/30 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    Medium Earth Orbit (MEO)
                  </span>
                  <span className="text-slate-600 font-mono">·</span>
                  <span className="text-xs font-mono text-slate-300">8,000 - 20,000 km altitude</span>
                  <span className="text-slate-600 font-mono">·</span>
                  <span className="text-xs font-mono text-slate-400">Latency: 120 - 150 ms</span>
                </div>
                <span className="text-xs text-cyan-300/80 font-mono">
                  Gbps-grade steerable beams · High throughput for cruise lines & hyperscalers
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {[...meoCompanies, ...hybridCompanies.filter(c => c.id === 'ses' || c.id === 'omnispace')].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCompany(c)}
                    className="p-2.5 bg-slate-900/80 hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-left transition-colors group"
                  >
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                      {c.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                      {c.altitudeKm} · {c.headquarters.country}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LEO Band (160 - 2,000 km) */}
          {(selectedOrbitFilter === 'All' || selectedOrbitFilter === 'LEO' || selectedOrbitFilter === 'Hybrid') && (
            <div className="border border-sky-800/40 bg-gradient-to-r from-sky-950/20 to-slate-950/60 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-800/30 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
                    Low Earth Orbit (LEO)
                  </span>
                  <span className="text-slate-600 font-mono">·</span>
                  <span className="text-xs font-mono text-slate-300">450 - 1,400 km altitude</span>
                  <span className="text-slate-600 font-mono">·</span>
                  <span className="text-xs font-mono text-slate-400">Latency: 20 - 50 ms</span>
                </div>
                <span className="text-xs text-sky-300/80 font-mono">
                  Real-time interactive voice/video · Direct-to-Device 3GPP cellular · Mega-constellations
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {[...leoCompanies, ...hybridCompanies.filter(c => c.id === 'eutelsat-oneweb' || c.id === 'telesat')].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCompany(c)}
                    className="p-2.5 bg-slate-900/80 hover:bg-sky-950/50 border border-slate-800 hover:border-sky-500/50 rounded-lg text-left transition-colors group"
                  >
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 truncate">
                      {c.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                      {c.fleetSize.activeSatellites > 0 ? `${c.fleetSize.activeSatellites.toLocaleString()} sats` : c.altitudeKm}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ground Segment & Integrators */}
          {(selectedOrbitFilter === 'All' || selectedOrbitFilter === 'Ground Segment') && (
            <div className="border border-slate-800 bg-slate-950/50 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Ground Segment, Teleports & Managed Integrators
                  </span>
                  <span className="text-slate-600 font-mono">·</span>
                  <span className="text-xs font-mono text-slate-400">Multi-Orbit Hybrid Routing</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Flat-panel antennas (ESA) · Global teleports · Multi-orbit bonding
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {groundCompanies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCompany(c)}
                    className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-left transition-colors group"
                  >
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 truncate">
                      {c.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                      {c.headquarters.country} · {c.categories[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
