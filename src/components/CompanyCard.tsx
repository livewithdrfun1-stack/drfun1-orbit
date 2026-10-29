import React from 'react';
import { SatelliteCompany } from '../types/satellite';
import { 
  Building2, 
  MapPin, 
  Mail, 
  ExternalLink, 
  Bookmark, 
  Check, 
  ArrowRight,
  Radio,
  Layers,
  Phone
} from 'lucide-react';

interface CompanyCardProps {
  company: SatelliteCompany;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onSelectCompany: (company: SatelliteCompany) => void;
  onQuickContact: (company: SatelliteCompany) => void;
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  isBookmarked,
  onToggleBookmark,
  onSelectCompany,
  onQuickContact,
  isCompared,
  onToggleCompare,
}) => {
  const primaryContact = company.contacts[0];

  return (
    <div className="bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-5 flex flex-col justify-between transition-all duration-150 group">
      <div>
        {/* Top Header: Title & Quick Actions */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 
              onClick={() => onSelectCompany(company)}
              className="text-base font-semibold text-slate-100 hover:text-sky-400 cursor-pointer truncate transition-colors"
            >
              {company.name}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {company.legalName}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Compare checkbox button */}
            <button
              onClick={() => onToggleCompare(company.id)}
              title={isCompared ? 'Remove from compare' : 'Add to compare'}
              className={`p-1.5 rounded-md text-xs transition-colors border ${
                isCompared
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'text-slate-500 hover:text-slate-300 border-transparent hover:border-slate-800'
              }`}
            >
              {isCompared ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px] font-mono px-0.5">VS</span>}
            </button>

            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(company.id)}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark operator'}
              className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors"
            >
              <Bookmark
                className={`w-4 h-4 ${
                  isBookmarked ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Clean unboxed metadata with subtle typographic separators (Zero-Pill discipline) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mb-3.5">
          <span className="font-medium text-sky-400">{company.orbitType}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-mono text-slate-300">{company.altitudeKm}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-400">{company.headquarters.city}, {company.headquarters.country}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-mono tabular-nums text-slate-300">
            {company.fleetSize.activeSatellites > 0
              ? `${company.fleetSize.activeSatellites.toLocaleString()} in orbit`
              : 'Integrator fleet'}
          </span>
        </div>

        {/* Short Executive Summary */}
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">
          {company.summary}
        </p>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-y border-slate-800/60 mb-2 font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block tracking-wider">
              Latency
            </span>
            <span className="text-slate-200">{company.latencyMs}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block tracking-wider">
              Primary Bands
            </span>
            <span className="text-slate-200 truncate block">
              {company.frequencyBands.slice(0, 3).join(', ')}
              {company.frequencyBands.length > 3 ? ` +${company.frequencyBands.length - 3}` : ''}
            </span>
          </div>
        </div>

        {/* Switch Data Centers & UnrealIRCd Leaf Indicator */}
        <div className="mb-3 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono flex items-center justify-between text-slate-400">
          <span className="truncate text-slate-300 max-w-[170px]" title="Colocated at Switch Data Centers (www.switch.com)">
            {company.switchInterconnect?.connectedCampus ? company.switchInterconnect.connectedCampus.split(' (')[0] : 'Switch SUPERNAP'}
          </span>
          <span className="text-emerald-400 shrink-0 text-[10px]" title="Leaf Node Peering with irc.drfun1.com via UnrealIRCd">
            irc.drfun1.com (SSL)
          </span>
        </div>

        {/* Satcom Wholesale Offerings (clean unboxed list) */}
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500 block mb-1.5">
            Key Carrier & Satcom Services:
          </span>
          <ul className="space-y-1">
            {company.satcomWholesaleOfferings.slice(0, 2).map((offering, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-sky-500 text-xs shrink-0 select-none">›</span>
                <span className="line-clamp-1">{offering}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Card Footer: Verified Contact & Action Buttons */}
      <div className="pt-3 border-t border-slate-800/60 space-y-2.5">
        {primaryContact && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px] truncate max-w-[170px]" title={primaryContact.department}>
              {primaryContact.department}
            </span>
            <a
              href={`mailto:${primaryContact.email}?subject=Satcom%20Capacity%20%26%20Carrier%20Inquiry%20-%20${encodeURIComponent(company.name)}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sky-400 hover:text-sky-300 hover:underline font-mono text-xs flex items-center gap-1 shrink-0"
            >
              <Mail className="w-3 h-3" />
              <span>Email Desk</span>
            </a>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onQuickContact(company)}
            className="w-full py-1.5 px-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-700/60"
          >
            <Mail className="w-3.5 h-3.5 text-sky-400" />
            <span>RFQ / Contact</span>
          </button>
          <button
            onClick={() => onSelectCompany(company)}
            className="w-full py-1.5 px-2.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Full Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
