import React from 'react';
import { SatelliteCompany } from '../types/satellite';
import { X, Check, Mail, ExternalLink, ArrowRight, Trash2 } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedCompanies: SatelliteCompany[];
  onRemoveFromCompare: (id: string) => void;
  onSelectCompany: (company: SatelliteCompany) => void;
  onOpenRfq: (company: SatelliteCompany) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  comparedCompanies,
  onRemoveFromCompare,
  onSelectCompany,
  onOpenRfq,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Satellite Operator Comparison Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Side-by-side technical, orbital, and carrier interconnect comparison ({comparedCompanies.length} selected)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-auto p-6">
          {comparedCompanies.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-sm">No satellite companies selected for comparison.</p>
              <p className="text-xs text-slate-500 mt-1">
                Click the "VS" button on any company card or table row in the directory to add them here.
              </p>
            </div>
          ) : (
            <div className="min-w-[700px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-3 px-4 w-44 text-slate-500 font-mono uppercase text-[11px] bg-slate-950/40">
                      Criteria
                    </th>
                    {comparedCompanies.map((c) => (
                      <th key={c.id} className="py-3 px-4 min-w-[220px] bg-slate-950/20">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-sm text-slate-100 block truncate">
                              {c.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-normal block truncate">
                              {c.headquarters.country}
                            </span>
                          </div>
                          <button
                            onClick={() => onRemoveFromCompare(c.id)}
                            title="Remove from comparison"
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {/* Orbit & Altitude */}
                  <tr>
                    <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                      Orbit & Altitude
                    </td>
                    {comparedCompanies.map((c) => (
                      <td key={c.id} className="py-3 px-4 text-slate-200">
                        <span className="text-sky-400 font-semibold">{c.orbitType}</span>
                        <span className="text-slate-400 block text-[11px] mt-0.5">{c.altitudeKm}</span>
                      </td>
                    ))}
                  </tr>

                  {/* Latency */}
                  <tr>
                    <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                      Typical Latency
                    </td>
                    {comparedCompanies.map((c) => (
                      <td key={c.id} className="py-3 px-4 text-slate-200">
                        {c.latencyMs}
                      </td>
                    ))}
                  </tr>

                  {/* Fleet Size */}
                  <tr>
                    <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                      Satellites (Active/Plan)
                    </td>
                    {comparedCompanies.map((c) => (
                      <td key={c.id} className="py-3 px-4 text-slate-200 tabular-nums">
                        {c.fleetSize.activeSatellites > 0 ? (
                          <>
                            <strong className="text-slate-100">{c.fleetSize.activeSatellites.toLocaleString()}</strong> active
                            <span className="text-slate-500 block text-[11px]">/ {c.fleetSize.plannedSatellites.toLocaleString()} planned</span>
                          </>
                        ) : (
                          <span className="text-slate-500">Integrator fleet</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Frequency Bands */}
                  <tr>
                    <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                      Frequency Bands
                    </td>
                    {comparedCompanies.map((c) => (
                      <td key={c.id} className="py-3 px-4 text-slate-300">
                        <div className="flex flex-wrap gap-1">
                          {c.frequencyBands.map((band) => (
                            <span key={band} className="text-[11px] text-sky-300 bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-900/30">
                              {band}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Throughput */}
                  <tr>
                    <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                      Throughput Profile
                    </td>
                    {comparedCompanies.map((c) => (
                      <td key={c.id} className="py-3 px-4 text-slate-300 font-sans text-xs">
                        {c.throughputSummary}
                      </td>
                    ))}
                  </tr>

                  {/* Coverage */}
                  <tr>
                    <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                      Footprint
                    </td>
                    {comparedCompanies.map((c) => (
                      <td key={c.id} className="py-3 px-4 text-slate-300 font-sans text-xs">
                        {c.coverage}
                      </td>
                    ))}
                  </tr>

                  {/* Primary Wholesale Product */}
                  <tr>
                    <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                      Top Satcom Service
                    </td>
                    {comparedCompanies.map((c) => (
                      <td key={c.id} className="py-3 px-4 text-slate-300 font-sans text-xs">
                        {c.satcomWholesaleOfferings[0] || '-'}
                      </td>
                    ))}
                  </tr>

                  {/* Primary Contact */}
                  <tr>
                    <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                      Contact Desk
                    </td>
                    {comparedCompanies.map((c) => {
                      const contact = c.contacts[0];
                      return (
                        <td key={c.id} className="py-3 px-4 text-xs font-sans">
                          {contact ? (
                            <div>
                              <div className="font-semibold text-slate-200">{contact.department}</div>
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-sky-400 hover:underline font-mono text-[11px] block mt-0.5"
                              >
                                {contact.email}
                              </a>
                            </div>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Action buttons */}
                  <tr>
                    <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                      Quick Action
                    </td>
                    {comparedCompanies.map((c) => (
                      <td key={c.id} className="py-3 px-4">
                        <div className="flex flex-col gap-1.5 font-sans">
                          <button
                            onClick={() => onOpenRfq(c)}
                            className="w-full py-1.5 px-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 rounded text-xs transition-colors flex items-center justify-center gap-1 font-medium"
                          >
                            <Mail className="w-3 h-3" />
                            <span>RFQ Inquiry</span>
                          </button>
                          <button
                            onClick={() => onSelectCompany(c)}
                            className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors flex items-center justify-center gap-1"
                          >
                            <span>Profile</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
