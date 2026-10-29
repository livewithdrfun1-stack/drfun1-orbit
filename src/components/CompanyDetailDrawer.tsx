import React, { useState } from 'react';
import { SatelliteCompany, UserNote } from '../types/satellite';
import { getSwitchInterconnectForCompany } from '../utils/switchInterconnect';
import { 
  X, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Layers, 
  Radio, 
  Shield, 
  Check, 
  Copy, 
  Bookmark, 
  Share2,
  Building2,
  Calendar,
  Save,
  Server,
  Terminal,
  Cpu,
  Send
} from 'lucide-react';

interface CompanyDetailDrawerProps {
  company: SatelliteCompany | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  userNote?: UserNote;
  onSaveNote: (note: UserNote) => void;
  onOpenRfq: (company: SatelliteCompany) => void;
}

export const CompanyDetailDrawer: React.FC<CompanyDetailDrawerProps> = ({
  company,
  onClose,
  isBookmarked,
  onToggleBookmark,
  userNote,
  onSaveNote,
  onOpenRfq,
}) => {
  if (!company) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'wholesale' | 'switch-irc' | 'contacts' | 'notes'>('overview');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const switchProfile = company.switchInterconnect || getSwitchInterconnectForCompany(company.name, company.id, company.headquarters.region);

  // Local state for editable user notes
  const [ndaStatus, setNdaStatus] = useState(userNote?.ndaStatus || 'Not Signed');
  const [partnershipStatus, setPartnershipStatus] = useState(userNote?.partnershipStatus || 'Prospect');
  const [accountManager, setAccountManager] = useState(userNote?.accountManager || '');
  const [notesContent, setNotesContent] = useState(userNote?.notes || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSaveNotes = () => {
    onSaveNote({
      companyId: company.id,
      ndaStatus: ndaStatus as any,
      partnershipStatus: partnershipStatus as any,
      accountManager,
      notes: notesContent,
      updatedAt: new Date().toISOString(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Surface */}
      <div className="relative w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full z-10 text-slate-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight truncate">
                {company.name}
              </h2>
              <button
                onClick={() => onToggleBookmark(company.id)}
                title={isBookmarked ? 'Bookmarked' : 'Add to bookmarks'}
                className="text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {company.legalName} <span className="text-slate-600">·</span> Founded {company.founded} <span className="text-slate-600">·</span> {company.headquarters.city}, {company.headquarters.country}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenRfq(company)}
              className="px-3 py-1.5 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Draft RFQ</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/30 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Orbit
          </button>
          <button
            onClick={() => setActiveTab('wholesale')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'wholesale'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Satcom Wholesale Offerings
          </button>
          <button
            onClick={() => setActiveTab('switch-irc')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'switch-irc'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Switch & UnrealIRCd Peering</span>
            <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/40">irc.drfun1.com</span>
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Carrier Desks & NOC ({company.contacts.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Internal Satcom Notes
          </button>
        </div>

        {/* Drawer Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Company & Network Profile
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {company.summary}
                </p>
              </div>

              {/* Orbital Telemetry & Architecture */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs">
                <div className="text-[11px] uppercase tracking-wider text-sky-400 font-bold mb-2">
                  Constellation Specifications
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Orbit Regime</span>
                    <span className="text-slate-100 font-semibold text-sm">{company.orbitType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Orbital Altitude</span>
                    <span className="text-slate-100 text-sm">{company.altitudeKm}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Latency Bracket</span>
                    <span className="text-slate-100 text-sm">{company.latencyMs}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Fleet Count (Active / Plan)</span>
                    <span className="text-slate-100 text-sm tabular-nums">
                      {company.fleetSize.activeSatellites > 0
                        ? `${company.fleetSize.activeSatellites.toLocaleString()} active / ${company.fleetSize.plannedSatellites.toLocaleString()} planned`
                        : 'Third-party satellite fleet aggregator'}
                    </span>
                  </div>
                </div>
                {company.fleetSize.generationDetails && (
                  <div className="pt-2 border-t border-slate-800/80 text-slate-400 text-[11px]">
                    <span className="text-slate-500">Payload Generation:</span> {company.fleetSize.generationDetails}
                  </div>
                )}
              </div>

              {/* Coverage & Regulatory */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 font-mono uppercase text-[11px] block mb-1">
                    Coverage Footprint
                  </span>
                  <p className="text-slate-300">{company.coverage}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-mono uppercase text-[11px] block mb-1">
                    Regulatory Licensing & ITU Filing
                  </span>
                  <p className="text-slate-300">{company.regulatoryFilingCountry}</p>
                </div>
              </div>

              {/* Key Technical Strengths */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Key Competitive Strengths
                </h4>
                <ul className="space-y-2">
                  {company.keyStrengths.map((strength, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-sky-400 font-bold shrink-0">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* External Links */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-4 text-xs font-mono">
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1.5 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Official Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {company.portalUrl && (
                  <a
                    href={company.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white inline-flex items-center gap-1.5 hover:underline"
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Carrier / Partner Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {activeTab === 'wholesale' && (
            <div className="space-y-6">
              {/* Frequency Bands */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                  Supported Frequency Bands
                </h4>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {company.frequencyBands.map((band) => (
                    <div
                      key={band}
                      className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-sky-300"
                    >
                      {band}
                    </div>
                  ))}
                </div>
              </div>

              {/* Wholesale Products & Services */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                  Available Satcom Wholesale Capacities
                </h4>
                <div className="space-y-2.5">
                  {company.satcomWholesaleOfferings.map((offering, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 flex items-start gap-2.5"
                    >
                      <span className="text-sky-400 font-mono text-sm leading-none shrink-0">•</span>
                      <span>{offering}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Categories */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Market Sectors
                </h4>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                  {company.categories.map((cat, idx) => (
                    <span key={cat}>
                      {cat}
                      {idx < company.categories.length - 1 && (
                        <span className="text-slate-600 ml-3">/</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Teleports & Interconnect */}
              {company.teleportLocations && company.teleportLocations.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Key Teleports & Ground Station Hubs
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {company.teleportLocations.map((loc, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{loc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'switch-irc' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5">
                    <Server className="w-4 h-4" />
                    <span>Switch Colocation & UnrealIRCd Leaf Architecture</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                    Recommended Architecture
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Recommended carrier-grade deployment: Interconnect {company.name}'s ground station gateways at <strong>Switch Data Centers</strong> (Tier 4 Gold colocation), route redundant IP transit via <strong>RisingNet</strong>, and run <strong>UnrealIRCd</strong> as a leaf node linking to <strong>irc.drfun1.com</strong> for out-of-band NOC crisis dispatch, satellite transponder telemetry alarms, and teleport handoffs.
                </p>
              </div>

              {/* Step 1: Switch Data Centers (www.switch.com) */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">
                      Facility 01 · Hyperscale Data Center & Teleport Gateway
                    </span>
                    <h5 className="text-sm font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                      <span>Switch Data Centers</span>
                      <span className="text-slate-600 font-normal">·</span>
                      <span className="text-sky-400 text-xs font-mono font-normal">www.switch.com</span>
                    </h5>
                  </div>
                  <a
                    href="https://www.switch.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 text-xs text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/40 rounded transition-colors inline-flex items-center gap-1"
                  >
                    <span>switch.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Designated Switch Campus</span>
                    <span className="text-slate-200">{switchProfile.connectedCampus}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Optical Cross-Connect</span>
                    <span className="text-slate-200">{switchProfile.crossConnectType}</span>
                  </div>
                </div>
              </div>

              {/* Step 2: RisingNet IP Transit (www.risingnet.com) */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">
                      Facility 02 · Tier-1 IP Transit & Shielded Transport
                    </span>
                    <h5 className="text-sm font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                      <span>RisingNet Network</span>
                      <span className="text-slate-600 font-normal">·</span>
                      <span className="text-sky-400 text-xs font-mono font-normal">www.risingnet.com</span>
                    </h5>
                  </div>
                  <a
                    href="https://www.risingnet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 text-xs text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/40 rounded transition-colors inline-flex items-center gap-1"
                  >
                    <span>risingnet.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="text-xs text-slate-300 font-mono">
                  {switchProfile.risingNetTransit}
                </div>
              </div>

              {/* Step 3: UnrealIRCd (unrealircd.com) & Leaf with irc.drfun1.com */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3.5">
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">
                      Facility 03 · Secure Out-of-Band NOC Telemetry & Leaf Node
                    </span>
                    <h5 className="text-sm font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                      <span>UnrealIRCd Daemon</span>
                      <span className="text-slate-600 font-normal">·</span>
                      <span className="text-sky-400 text-xs font-mono font-normal">unrealircd.com</span>
                    </h5>
                  </div>
                  <a
                    href="https://www.unrealircd.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 text-xs text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/40 rounded transition-colors inline-flex items-center gap-1"
                  >
                    <span>unrealircd.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Hub Server</span>
                    <span className="text-sky-300 font-bold">irc.drfun1.com : 6697</span>
                    <span className="text-[10px] text-slate-500 block">(TLS/SSL encrypted)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Carrier Leaf Node</span>
                    <span className="text-slate-200 truncate block">{switchProfile.unrealIrcdDaemon.leafRole}</span>
                  </div>
                </div>

                {/* Configuration Snippet */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-sky-400" />
                      <span>Suggested unrealircd.conf Link Block:</span>
                    </span>
                    <button
                      onClick={() => handleCopy(switchProfile.unrealIrcdDaemon.suggestedLinkConfig, 'link-config')}
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                      {copiedText === 'link-config' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Config</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed select-text">
                    {switchProfile.unrealIrcdDaemon.suggestedLinkConfig}
                  </pre>
                </div>

                {/* Propose Button */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">
                    Suggest this configuration directly to {company.name}'s NOC and wholesale team
                  </span>
                  <button
                    onClick={() => onOpenRfq(company)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Peering Proposal</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 mb-1">
                Verified communication channels for wholesale capacity inquiries, carrier peering, technical operations, and MNO roaming:
              </div>

              {company.contacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="text-sm font-semibold text-slate-100">
                        {contact.department}
                      </h5>
                      {contact.contactPerson && (
                        <p className="text-xs text-slate-400">
                          Contact: {contact.contactPerson}
                        </p>
                      )}
                    </div>
                    <a
                      href={`mailto:${contact.email}?subject=Satcom%20Capacity%20Inquiry%20-%20${encodeURIComponent(company.name)}`}
                      className="px-2.5 py-1 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded transition-colors inline-flex items-center gap-1 shrink-0"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email Desk</span>
                    </a>
                  </div>

                  {contact.notes && (
                    <p className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                      {contact.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{contact.email}</span>
                      <button
                        onClick={() => handleCopy(contact.email, `email-${idx}`)}
                        className="text-slate-500 hover:text-sky-400 p-0.5 ml-1"
                        title="Copy email"
                      >
                        {copiedText === `email-${idx}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {contact.phone && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{contact.phone}</span>
                        <button
                          onClick={() => handleCopy(contact.phone!, `phone-${idx}`)}
                          className="text-slate-500 hover:text-sky-400 p-0.5 ml-1"
                          title="Copy phone"
                        >
                          {copiedText === `phone-${idx}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Manage your organization's internal account status, NDA coverage, and commercial notes for {company.name}. Stored locally in your session.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                    Partnership Status
                  </label>
                  <select
                    value={partnershipStatus}
                    onChange={(e) => setPartnershipStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Prospect">Prospect</option>
                    <option value="In Discussion">In Discussion</option>
                    <option value="Contract Active">Contract Active</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                    NDA Status
                  </label>
                  <select
                    value={ndaStatus}
                    onChange={(e) => setNdaStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Not Signed">Not Signed</option>
                    <option value="In Review">In Review</option>
                    <option value="Active NDA">Active NDA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase text-xs">
                  Assigned Satcom Account Lead / Engineer
                </label>
                <input
                  type="text"
                  value={accountManager}
                  onChange={(e) => setAccountManager(e.target.value)}
                  placeholder="e.g. Lead Satcom Architect / Carrier Procurement Lead"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase text-xs">
                  Internal Notes & Technical Requirements
                </label>
                <textarea
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
                  rows={6}
                  placeholder="Add meeting notes, pricing quotes, transponder band requirements, SLA commitments, or specific beam coverage requests..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500 placeholder-slate-600 resize-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {userNote?.updatedAt ? (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Last saved: {new Date(userNote.updatedAt).toLocaleDateString()} {new Date(userNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ) : <span />}

                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-950" />
                      <span>Notes Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Notes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
