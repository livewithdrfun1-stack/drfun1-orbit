import React, { useMemo } from 'react';
import {
  Bookmark,
  Calculator,
  Download,
  ExternalLink,
  Globe,
  LayoutGrid,
  List,
  Mail,
  Plus,
  RotateCcw,
  Satellite,
  Scale,
  Search,
} from 'lucide-react';
import {
  CompanyFilterState,
  ConstellationStatus,
  FrequencyBand,
  OrbitType,
  SatelliteCompany,
  ServiceCategory,
} from '../types/satellite';

interface SatcomCompaniesViewProps {
  companies: SatelliteCompany[];
  filteredCompanies: SatelliteCompany[];
  filters: CompanyFilterState;
  onChangeFilters: (next: CompanyFilterState) => void;
  viewMode: 'cards' | 'table' | 'orbit';
  onChangeViewMode: (mode: 'cards' | 'table' | 'orbit') => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  comparedIds: Set<string>;
  onToggleCompare: (id: string) => void;
  onSelectCompany: (company: SatelliteCompany) => void;
  onOpenRfq: (company?: SatelliteCompany) => void;
  onOpenSlaCalculator: (company?: SatelliteCompany) => void;
  onOpenCompareModal: () => void;
  onOpenAddModal: () => void;
  onExportCsv: () => void;
  onOpenOrbitMap: () => void;
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
  'Mobility (Aero & Maritime)',
  'IoT & M2M',
  'Broadcast & Media',
  'Earth Observation & SAR',
  'Defense & Secure Satcom',
  'Teleport & Ground Infrastructure',
];

const REGION_OPTIONS: CompanyFilterState['region'][] = [
  'All',
  'Americas',
  'EMEA',
  'APAC',
  'Global',
];

const STATUS_OPTIONS: (ConstellationStatus | 'All')[] = [
  'All',
  'Operational',
  'Expanding Constellation',
  'Planned / Next-Gen',
];

export const SatcomCompaniesView: React.FC<SatcomCompaniesViewProps> = ({
  companies,
  filteredCompanies,
  filters,
  onChangeFilters,
  viewMode,
  onChangeViewMode,
  bookmarkedIds,
  onToggleBookmark,
  comparedIds,
  onToggleCompare,
  onSelectCompany,
  onOpenRfq,
  onOpenSlaCalculator,
  onOpenCompareModal,
  onOpenAddModal,
  onExportCsv,
  onOpenOrbitMap,
}) => {
  const displayMode: 'table' | 'cards' = viewMode === 'cards' ? 'cards' : 'table';

  const finalList = useMemo(() => {
    if (filters.status === 'All') return filteredCompanies;
    return filteredCompanies.filter((c) => c.status === filters.status);
  }, [filteredCompanies, filters.status]);

  const stats = useMemo(() => {
    const totalActiveSats = companies.reduce(
      (sum, c) => sum + (c.fleetSize.activeSatellites || 0),
      0
    );
    const totalPlannedSats = companies.reduce(
      (sum, c) => sum + (c.fleetSize.plannedSatellites || 0),
      0
    );
    const leoCount = companies.filter((c) => c.orbitType === 'LEO').length;
    const geoCount = companies.filter((c) => c.orbitType === 'GEO').length;
    const meoHybridCount = companies.filter(
      (c) => c.orbitType === 'MEO' || c.orbitType === 'Hybrid'
    ).length;

    return {
      totalCompanies: companies.length,
      totalActiveSats,
      totalPlannedSats,
      leoCount,
      geoCount,
      meoHybridCount,
    };
  }, [companies]);

  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.orbit !== 'All' ||
    filters.band !== 'All' ||
    filters.category !== 'All' ||
    filters.region !== 'All' ||
    filters.status !== 'All' ||
    filters.bookmarkedOnly;

  const handleResetFilters = () => {
    onChangeFilters({
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
    <div className="space-y-6 text-slate-100">
      {/* Directory Header & Summary Strip */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <p className="text-xs font-mono text-amber-300">
              Global Commercial Satellite Fleet, Carrier Interconnect &amp; Wholesale Registry
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              SATCOM Companies Directory ({companies.length} Operators)
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Complete directory of LEO, MEO, GEO, Direct-to-Device, IoT, Earth Observation, and
              ground-segment teleport operators with wholesale contacts, orbital parameters, and
              Switch/UnrealIRCd peering profiles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add SATCOM Operator</span>
            </button>

            <button
              onClick={onOpenCompareModal}
              className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Scale className="w-3.5 h-3.5 text-sky-400" />
              <span>Compare ({comparedIds.size})</span>
            </button>

            <button
              onClick={onExportCsv}
              className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenOrbitMap}
              className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Orbit Map</span>
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block">Registered SATCOM Companies</span>
            <span className="text-xl font-bold text-white font-mono tabular-nums mt-0.5 block">
              {stats.totalCompanies}
            </span>
            <span className="text-xs text-slate-500">
              {stats.leoCount} LEO · {stats.geoCount} GEO · {stats.meoHybridCount} MEO/Hybrid
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Active Satellites in Orbit</span>
            <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-0.5 block">
              {stats.totalActiveSats.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">Operational commercial fleet</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Planned Constellation Total</span>
            <span className="text-xl font-bold text-sky-300 font-mono tabular-nums mt-0.5 block">
              {stats.totalPlannedSats.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">Authorized &amp; filing pipelines</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Matching Filtered Results</span>
            <span className="text-xl font-bold text-amber-300 font-mono tabular-nums mt-0.5 block">
              {finalList.length} / {companies.length}
            </span>
            <span className="text-xs text-slate-500">
              {bookmarkedIds.size} saved · {comparedIds.size} in compare
            </span>
          </div>
        </div>
      </section>

      {/* Search, Segmented Orbit Filter & Attribute Dropdowns */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                onChangeFilters({ ...filters, searchQuery: e.target.value })
              }
              placeholder="Search SATCOM companies, country, Ka/Ku/D2D band, or offering..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Orbit Segmented Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto text-xs">
            {ORBIT_OPTIONS.map((orbit) => (
              <button
                key={orbit}
                onClick={() => onChangeFilters({ ...filters, orbit })}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition cursor-pointer ${
                  filters.orbit === orbit
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {orbit}
              </button>
            ))}
          </div>

          {/* Table vs Card Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs shrink-0">
            <button
              onClick={() => onChangeViewMode('table')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 cursor-pointer ${
                displayMode === 'table'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Full List</span>
            </button>
            <button
              onClick={() => onChangeViewMode('cards')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 cursor-pointer ${
                displayMode === 'cards'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>

        {/* Secondary Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <select
            value={filters.category}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                category: e.target.value as ServiceCategory | 'All',
              })
            }
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
            aria-label="Filter by service category"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Service Categories' : cat}
              </option>
            ))}
          </select>

          <select
            value={filters.band}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                band: e.target.value as FrequencyBand | 'All',
              })
            }
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
            aria-label="Filter by frequency band"
          >
            {BAND_OPTIONS.map((band) => (
              <option key={band} value={band}>
                {band === 'All' ? 'All Frequency Bands' : band}
              </option>
            ))}
          </select>

          <select
            value={filters.region}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                region: e.target.value as CompanyFilterState['region'],
              })
            }
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
            aria-label="Filter by headquarters region"
          >
            {REGION_OPTIONS.map((reg) => (
              <option key={reg} value={reg}>
                {reg === 'All' ? 'All HQ Regions' : reg}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                status: e.target.value as ConstellationStatus | 'All',
              })
            }
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
            aria-label="Filter by operational status"
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st === 'All' ? 'All Fleet Statuses' : st}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              onChangeFilters({
                ...filters,
                bookmarkedOnly: !filters.bookmarkedOnly,
              })
            }
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition cursor-pointer ${
              filters.bookmarkedOnly
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({bookmarkedIds.size})</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </section>

      {/* Empty State */}
      {finalList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
          <Satellite className="w-8 h-8 text-slate-600 mx-auto" />
          <h2 className="text-base font-semibold text-white">
            No SATCOM companies match your current filters
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try clearing your search or orbit/frequency filters, or add a custom satellite
            operator to the directory.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium cursor-pointer"
            >
              Clear All Filters
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs text-slate-950 font-semibold cursor-pointer"
            >
              Add Custom Operator
            </button>
          </div>
        </div>
      ) : displayMode === 'table' ? (
        /* Full List Table View */
        <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-medium">
                  <th className="py-3 px-4 w-10 text-right">#</th>
                  <th className="py-3 px-4">SATCOM Company</th>
                  <th className="py-3 px-4">Headquarters</th>
                  <th className="py-3 px-4">Orbit &amp; Altitude</th>
                  <th className="py-3 px-4 text-right">Active / Planned</th>
                  <th className="py-3 px-4">Spectrum &amp; Focus</th>
                  <th className="py-3 px-4">Primary Wholesale Desk</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {finalList.map((company, idx) => {
                  const isSaved = bookmarkedIds.has(company.id);
                  const isCompared = comparedIds.has(company.id);
                  const primaryContact = company.contacts[0];

                  return (
                    <tr
                      key={company.id}
                      onClick={() => onSelectCompany(company)}
                      className="hover:bg-slate-950/70 transition cursor-pointer"
                    >
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{company.name}</span>
                          {company.isGold && (
                            <span className="text-[10px] font-mono text-amber-300">Gold Tier</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {company.legalName} · Founded {company.founded}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-200">
                          {company.headquarters.city}, {company.headquarters.country}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {company.headquarters.region} · {company.status}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="text-sky-300 font-semibold">{company.orbitType}</div>
                        <div className="text-[11px] text-slate-400 tabular-nums">
                          {company.altitudeKm} · {company.latencyMs}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        <div className="text-emerald-400 font-semibold">
                          {company.fleetSize.activeSatellites.toLocaleString()} active
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {company.fleetSize.plannedSatellites.toLocaleString()} planned
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-mono text-[11px]">
                          {company.frequencyBands.join(' · ')}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[230px]">
                          {company.categories.join(' · ')}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="text-slate-200 truncate max-w-[200px]">
                          {primaryContact?.email || 'Wholesale Portal'}
                        </div>
                        <div className="text-slate-500 truncate max-w-[200px]">
                          {primaryContact?.department || company.website}
                        </div>
                      </td>

                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            onClick={() => onToggleBookmark(company.id)}
                            className={`p-1.5 rounded border transition cursor-pointer ${
                              isSaved
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                            title={isSaved ? 'Remove bookmark' : 'Save company'}
                            aria-label="Toggle bookmark"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onToggleCompare(company.id)}
                            className={`p-1.5 rounded border transition cursor-pointer ${
                              isCompared
                                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                            title={isCompared ? 'Remove from compare' : 'Add to compare'}
                            aria-label="Toggle compare"
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenSlaCalculator(company)}
                            className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-300 transition cursor-pointer"
                            title="Open SLA Credit Calculator"
                            aria-label="Open SLA calculator"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenRfq(company)}
                            className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium text-[11px] transition cursor-pointer"
                          >
                            RFQ
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        /* Operator Cards Grid View */
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {finalList.map((company) => {
            const isSaved = bookmarkedIds.has(company.id);
            const isCompared = comparedIds.has(company.id);
            const primaryContact = company.contacts[0];

            return (
              <article
                key={company.id}
                onClick={() => onSelectCompany(company)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between space-y-4 transition cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-mono text-slate-400 truncate">
                        {company.orbitType} · {company.headquarters.city},{' '}
                        {company.headquarters.country}
                      </p>
                      <h2 className="text-base font-bold text-white mt-0.5 truncate">
                        {company.name}
                      </h2>
                      <p className="text-xs text-slate-400 truncate">{company.legalName}</p>
                    </div>

                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onToggleBookmark(company.id)}
                        className={`p-1.5 rounded border transition cursor-pointer ${
                          isSaved
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                        aria-label="Save operator"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleCompare(company.id)}
                        className={`p-1.5 rounded border transition cursor-pointer ${
                          isCompared
                            ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                        aria-label="Compare operator"
                      >
                        <Scale className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {company.summary}
                  </p>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <dt className="text-slate-500 text-[11px]">Active Fleet</dt>
                      <dd className="text-emerald-400 font-mono font-semibold tabular-nums">
                        {company.fleetSize.activeSatellites.toLocaleString()} active
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 text-[11px]">Latency</dt>
                      <dd className="text-sky-300 font-mono tabular-nums">{company.latencyMs}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-500 text-[11px]">Spectrum Bands</dt>
                      <dd className="text-slate-200 font-mono text-[11px] truncate">
                        {company.frequencyBands.join(' · ')}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-500 text-[11px]">Wholesale Contact</dt>
                      <dd className="text-slate-300 font-mono text-[11px] truncate">
                        {primaryContact?.email || company.website}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div
                  className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenSlaCalculator(company)}
                      className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] cursor-pointer"
                    >
                      SLA
                    </button>
                    <button
                      onClick={() => onOpenRfq(company)}
                      className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Mail className="w-3 h-3" />
                      <span>RFQ</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};
