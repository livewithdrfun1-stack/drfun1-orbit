import React from 'react';
import { 
  CompanyFilterState, 
  OrbitType, 
  FrequencyBand, 
  ServiceCategory 
} from '../types/satellite';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  LayoutGrid, 
  Table as TableIcon, 
  Orbit, 
  Bookmark,
  RotateCcw
} from 'lucide-react';

interface FilterToolbarProps {
  filters: CompanyFilterState;
  setFilters: React.Dispatch<React.SetStateAction<CompanyFilterState>>;
  viewMode: 'cards' | 'table' | 'orbit';
  setViewMode: (mode: 'cards' | 'table' | 'orbit') => void;
  filteredCount: number;
  totalCount: number;
  savedCount: number;
}

const ORBIT_OPTIONS: (OrbitType | 'All')[] = [
  'All',
  'LEO',
  'MEO',
  'GEO',
  'Hybrid',
  'Ground Segment',
];

const BAND_OPTIONS: (FrequencyBand | 'All')[] = [
  'All',
  'Ka-band',
  'Ku-band',
  'C-band',
  'L-band',
  'S-band',
  'X-band',
  'VHF/UHF',
  'Optical/Laser',
  '3GPP NTN',
];

const CATEGORY_OPTIONS: (ServiceCategory | 'All')[] = [
  'All',
  'Broadband & Backhaul',
  'Direct-to-Device (D2D)',
  'IoT & M2M',
  'Mobility (Aero & Maritime)',
  'Earth Observation & SAR',
  'Broadcast & Media',
  'Defense & Secure Satcom',
  'Teleport & Ground Infrastructure',
];

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  filteredCount,
  totalCount,
  savedCount,
}) => {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.orbit !== 'All' ||
    filters.band !== 'All' ||
    filters.category !== 'All' ||
    filters.region !== 'All' ||
    filters.bookmarkedOnly;

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      orbit: 'All',
      band: 'All',
      category: 'All',
      region: 'All',
      status: 'All',
      bookmarkedOnly: false,
    });
  };

  return (
    <div className="bg-slate-900/40 border-b border-slate-800/80 p-4 sm:px-6 lg:px-8 space-y-4">
      <div className="max-w-7xl mx-auto space-y-3.5">
        {/* Top search & View Switcher Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              placeholder="Search satellite operator, country, band (e.g. Ka-band), or service..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-10 pr-9 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
            {filters.searchQuery && (
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, searchQuery: '' }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Controls: Bookmarks toggle & View Mode segmented buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            {/* Bookmarks toggle */}
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  bookmarkedOnly: !prev.bookmarkedOnly,
                }))
              }
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                filters.bookmarkedOnly
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${filters.bookmarkedOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Saved ({savedCount})</span>
            </button>

            {/* View Mode Segmented Control */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                onClick={() => setViewMode('cards')}
                title="Card View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-slate-800 text-sky-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Data Table View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-slate-800 text-sky-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('orbit')}
                title="Altitude & Latency Visualizer"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'orbit'
                    ? 'bg-slate-800 text-sky-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Orbit className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Orbit Filter Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mr-2 shrink-0">
            Orbit:
          </span>
          {ORBIT_OPTIONS.map((orbit) => (
            <button
              key={orbit}
              onClick={() => setFilters((prev) => ({ ...prev, orbit }))}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.orbit === orbit
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/80'
              }`}
            >
              {orbit}
            </button>
          ))}
        </div>

        {/* Band, Category & Region Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
          {/* Frequency Band Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-mono text-[11px]">Band:</span>
            <select
              value={filters.band}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  band: e.target.value as FrequencyBand | 'All',
                }))
              }
              className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {BAND_OPTIONS.map((band) => (
                <option key={band} value={band} className="bg-slate-950 text-slate-200">
                  {band === 'All' ? 'All Frequencies' : band}
                </option>
              ))}
            </select>
          </div>

          {/* Service Category Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-mono text-[11px]">Service:</span>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  category: e.target.value as ServiceCategory | 'All',
                }))
              }
              className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 max-w-[200px] truncate"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-950 text-slate-200">
                  {cat === 'All' ? 'All Service Types' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Region Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-mono text-[11px]">Region:</span>
            <select
              value={filters.region}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  region: e.target.value as any,
                }))
              }
              className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Regions</option>
              <option value="Americas">Americas</option>
              <option value="EMEA">EMEA</option>
              <option value="APAC">APAC</option>
              <option value="Global">Global</option>
            </select>
          </div>

          {/* Reset Filters action */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}

          {/* Result counter */}
          <span className="text-slate-500 text-xs ml-auto sm:ml-0 font-mono tabular-nums">
            Showing <strong className="text-slate-200">{filteredCount}</strong> of {totalCount}
          </span>
        </div>
      </div>
    </div>
  );
};
