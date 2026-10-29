import React from 'react';
import { SatelliteCompany } from '../types/satellite';
import { Radio, Satellite, Layers, PhoneCall } from 'lucide-react';

interface StatsBannerProps {
  companies: SatelliteCompany[];
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ companies }) => {
  const totalSatellites = companies.reduce(
    (sum, c) => sum + (c.fleetSize?.activeSatellites || 0),
    0
  );

  const leoCount = companies.filter((c) => c.orbitType === 'LEO').length;
  const geoCount = companies.filter((c) => c.orbitType === 'GEO').length;
  const meoOrHybridCount = companies.filter(
    (c) => c.orbitType === 'MEO' || c.orbitType === 'Hybrid'
  ).length;
  const d2dCount = companies.filter((c) =>
    c.categories.includes('Direct-to-Device (D2D)')
  ).length;
  const totalContacts = companies.reduce(
    (sum, c) => sum + (c.contacts?.length || 0),
    0
  );

  return (
    <div className="bg-slate-900/60 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs text-slate-400">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase tracking-wider text-[11px] font-mono">
              Operators Listed:
            </span>
            <span className="font-mono tabular-nums text-slate-100 font-semibold text-sm">
              {companies.length}
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase tracking-wider text-[11px] font-mono">
              Satellites in Orbit:
            </span>
            <span className="font-mono tabular-nums text-sky-400 font-semibold text-sm">
              {totalSatellites.toLocaleString()}
            </span>
          </div>

          <span className="text-slate-700 hidden md:inline" aria-hidden="true">|</span>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-slate-500 uppercase tracking-wider text-[11px] font-mono">
              Orbit Split:
            </span>
            <span className="text-slate-300 font-mono tabular-nums">
              {leoCount} LEO <span className="text-slate-600">/</span> {geoCount} GEO <span className="text-slate-600">/</span> {meoOrHybridCount} MEO & Hybrid
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">
              <span className="font-mono tabular-nums text-slate-200 font-medium">
                {d2dCount}
              </span>{' '}
              Direct-to-Device (3GPP NTN)
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>

          <div className="flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">
              <span className="font-mono tabular-nums text-slate-200 font-medium">
                {totalContacts}
              </span>{' '}
              Carrier Desks & NOCs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
