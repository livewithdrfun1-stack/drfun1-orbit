import React, { useState } from 'react';
import { SatelliteCompany } from '../types/satellite';
import { 
  ArrowUpDown, 
  Mail, 
  ExternalLink, 
  Bookmark, 
  ArrowRight,
  Check
} from 'lucide-react';

interface CompanyTableViewProps {
  companies: SatelliteCompany[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  onSelectCompany: (company: SatelliteCompany) => void;
  onQuickContact: (company: SatelliteCompany) => void;
  comparedIds: Set<string>;
  onToggleCompare: (id: string) => void;
}

type SortField = 'name' | 'orbitType' | 'satellites' | 'country';
type SortDirection = 'asc' | 'desc';

export const CompanyTableView: React.FC<CompanyTableViewProps> = ({
  companies,
  bookmarkedIds,
  onToggleBookmark,
  onSelectCompany,
  onQuickContact,
  comparedIds,
  onToggleCompare,
}) => {
  const [sortField, setSortField] = useState<SortField>('satellites');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCompanies = [...companies].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'orbitType') {
      comparison = a.orbitType.localeCompare(b.orbitType);
    } else if (sortField === 'satellites') {
      comparison = (a.fleetSize.activeSatellites || 0) - (b.fleetSize.activeSatellites || 0);
    } else if (sortField === 'country') {
      comparison = a.headquarters.country.localeCompare(b.headquarters.country);
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4 w-10">VS</th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1.5">
                  <span>Operator</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('orbitType')}>
                <div className="flex items-center gap-1.5">
                  <span>Orbit</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3">Altitude & Latency</th>
              <th className="py-3 px-3 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('satellites')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Satellites</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3">Frequency Bands</th>
              <th className="py-3 px-3">Switch & IRC Leaf</th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('country')}>
                <div className="flex items-center gap-1.5">
                  <span>HQ / Region</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-4">Primary Contact</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedCompanies.map((company) => {
              const isBookmarked = bookmarkedIds.has(company.id);
              const isCompared = comparedIds.has(company.id);
              const primaryContact = company.contacts[0];

              return (
                <tr
                  key={company.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onToggleCompare(company.id)}
                      title={isCompared ? 'Remove from compare' : 'Add to compare'}
                      className={`p-1 rounded text-[10px] font-mono border transition-colors ${
                        isCompared
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : 'text-slate-600 hover:text-slate-300 border-transparent hover:border-slate-800'
                      }`}
                    >
                      {isCompared ? <Check className="w-3 h-3" /> : 'VS'}
                    </button>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-200">
                    <div 
                      onClick={() => onSelectCompany(company)}
                      className="cursor-pointer hover:text-sky-400 font-semibold"
                    >
                      {company.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">
                      {company.legalName}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-medium text-sky-400 font-mono">
                      {company.orbitType}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-300 font-mono">
                    <div>{company.altitudeKm}</div>
                    <div className="text-[11px] text-slate-500">{company.latencyMs}</div>
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                    {company.fleetSize.activeSatellites > 0 ? (
                      <div>
                        <span>{company.fleetSize.activeSatellites.toLocaleString()}</span>
                        <div className="text-[10px] text-slate-500">
                          / {company.fleetSize.plannedSatellites.toLocaleString()} plan
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500">N/A (Integrator)</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-slate-300 max-w-[150px] truncate" title={company.frequencyBands.join(', ')}>
                    {company.frequencyBands.join(', ')}
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className="text-slate-200 truncate max-w-[140px]" title={company.switchInterconnect?.connectedCampus || 'Switch SUPERNAP'}>
                      {company.switchInterconnect?.connectedCampus ? company.switchInterconnect.connectedCampus.split(' (')[0] : 'Switch SUPERNAP'}
                    </div>
                    <div className="text-emerald-400 text-[10px]">
                      irc.drfun1.com
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-300">
                    <div>{company.headquarters.country}</div>
                    <div className="text-[11px] text-slate-500">{company.headquarters.city}</div>
                  </td>

                  <td className="py-3 px-4">
                    {primaryContact ? (
                      <div>
                        <div className="text-slate-300 truncate max-w-[170px]" title={primaryContact.department}>
                          {primaryContact.department}
                        </div>
                        <a
                          href={`mailto:${primaryContact.email}?subject=Satcom%20Capacity%20%26%20Carrier%20Inquiry%20-%20${encodeURIComponent(company.name)}`}
                          className="text-sky-400 hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                        >
                          <Mail className="w-2.5 h-2.5" />
                          <span>{primaryContact.email}</span>
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onQuickContact(company)}
                        title="Open RFQ Letter Builder"
                        className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onToggleBookmark(company.id)}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark operator'}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            isBookmarked ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => onSelectCompany(company)}
                        title="View Full Profile & NOC Directory"
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors inline-flex items-center gap-1"
                      >
                        <span>Profile</span>
                        <ArrowRight className="w-3 h-3 text-sky-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
