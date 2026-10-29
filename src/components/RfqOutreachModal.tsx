import React, { useState } from 'react';
import { SatelliteCompany } from '../types/satellite';
import { 
  X, 
  Mail, 
  Copy, 
  Check, 
  Send, 
  FileText, 
  Building2, 
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';

interface RfqOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCompanies: SatelliteCompany[];
  preSelectedCompany?: SatelliteCompany | null;
}

type InquiryType = 
  | 'Transponder Capacity Lease (MHz)'
  | 'Cellular Backhaul Wholesale (CIR/MIR Mbps)'
  | 'Direct-to-Device (D2D) Roaming Partnership'
  | 'Gateway & Teleport Interconnect / Peering'
  | 'Maritime & Aviation Fleet Airtime'
  | 'Satellite IoT & M2M Airtime'
  | 'Switch Colocation & UnrealIRCd Leaf Peering (irc.drfun1.com)';

export const RfqOutreachModal: React.FC<RfqOutreachModalProps> = ({
  isOpen,
  onClose,
  availableCompanies,
  preSelectedCompany,
}) => {
  if (!isOpen) return null;

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(
    preSelectedCompany ? [preSelectedCompany.id] : [availableCompanies[0]?.id || '']
  );

  const [inquiryType, setInquiryType] = useState<InquiryType>('Cellular Backhaul Wholesale (CIR/MIR Mbps)');
  const [senderCompany, setSenderCompany] = useState('Satcom Enterprise Solutions');
  const [senderName, setSenderName] = useState('Carrier Relations & Procurement');
  const [senderEmail, setSenderEmail] = useState('carrier-relations@satcom.net');
  const [senderPhone, setSenderPhone] = useState('+1 (555) 234-5678');
  const [targetRegion, setTargetRegion] = useState('Global Maritime & EMEA Regional Footprint');
  const [capacityRequirement, setCapacityRequirement] = useState('150 Mbps CIR symmetric / 99.9% SLA availability');
  const [commencementDate, setCommencementDate] = useState('Q2 2026');
  const [customNotes, setCustomNotes] = useState('Seeking multi-year pricing tiers, teleport interconnect points of presence, and standard Master Service Agreement (MSA) terms.');
  const [copied, setCopied] = useState(false);

  const selectedCompanies = availableCompanies.filter((c) =>
    selectedCompanyIds.includes(c.id)
  );

  const toggleCompanySelection = (id: string) => {
    if (selectedCompanyIds.includes(id)) {
      if (selectedCompanyIds.length > 1) {
        setSelectedCompanyIds(selectedCompanyIds.filter((cid) => cid !== id));
      }
    } else {
      setSelectedCompanyIds([...selectedCompanyIds, id]);
    }
  };

  // Collect recipient emails from primary contacts
  const recipientEmails = selectedCompanies
    .map((c) => c.contacts[0]?.email)
    .filter(Boolean) as string[];

  const subjectLine = inquiryType === 'Switch Colocation & UnrealIRCd Leaf Peering (irc.drfun1.com)'
    ? `Technical Peering & Colocation Proposal: Switch.com Interconnect & UnrealIRCd Leaf (irc.drfun1.com) - ${senderCompany}`
    : `Commercial Satcom Inquiry: ${inquiryType} - ${senderCompany}`;

  const generateLetterContent = (companyName: string = '[Satellite Operator]') => {
    if (inquiryType === 'Switch Colocation & UnrealIRCd Leaf Peering (irc.drfun1.com)') {
      return `To: ${companyName} Technical Operations, NOC Directorate & Peering Engineering
From: ${senderName}, ${senderCompany}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Subject: Strategic Ground Interconnect & Out-of-Band NOC Leaf Peering Proposal (Switch.com / UnrealIRCd / irc.drfun1.com)

Dear Technical Operations & Peering Engineering at ${companyName},

I am writing on behalf of ${senderCompany} to formally propose establishing a strategic ground-segment teleport interconnection and real-time out-of-band NOC coordination mesh between our organizations:

1. HYPERSCALE TELEPORT & COLOCATION AT SWITCH (www.switch.com):
   We propose cross-connecting your teleport gateway, gateway downlinks, and carrier routers at Switch Data Centers (www.switch.com). Switch SUPERNAP facilities provide Tier 4 Gold low-latency optical cross-connects, native cloud on-ramps (AWS Ground Station / Azure ExpressRoute), 100% renewable power, and unparalleled physical security.

2. SHIELDED IP TRANSIT & BGP PEERING VIA RISINGNET (www.risingnet.com):
   We propose utilizing RisingNet (www.risingnet.com) for high-reliability IP transit, protected BGP peering, and DDoS-shielded satellite telemetry backhaul across Switch data center campuses.

3. OUT-OF-BAND NOC RESILIENCE VIA UNREALIRCD (unrealircd.com) & LEAF PEERING:
   To ensure 99.999% communications continuity during fiber severances, public cloud dashboard outages, or cyber incidents, we strongly suggest ${companyName} deploy UnrealIRCd (www.unrealircd.com) on your teleport gateway nodes and link as a secure leaf server into our dedicated hub:
   - Hub Server: irc.drfun1.com
   - Port: 6697 (Mandatory TLS 1.3 / OpenSSL encryption)
   - Operational Role: Out-of-band crisis dispatch, automated telemetry alarm feeds, and transponder handoff coordination.
   - Dedicated Carrier Channel: #noc-${companyName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16)} & #satcom-global-noc

4. CONFIGURATION LINK BLOCK PROPOSAL (unrealircd.conf):
   link irc.drfun1.com {
       incoming { mask *; };
       outgoing {
           hostname "irc.drfun1.com";
           port 6697;
           options { ssl; autoconnect; };
       };
       password "Satcom_Switch_Secure_Pass_${companyName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}!";
       hub *;
       class servers;
   };

Please let us know your team's availability for a technical interconnect and NOC peering coordination review call.

Sincerely,

${senderName}
${senderCompany}
Email: ${senderEmail}
Phone: ${senderPhone}`;
    }

    return `To: ${companyName} Commercial Directorate / Carrier Wholesale Relations
From: ${senderName}, ${senderCompany}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Subject: Request for Commercial Proposal & Capacity Lease - ${inquiryType}

Dear Commercial Accounts Team at ${companyName},

I am writing on behalf of ${senderCompany}. Our engineering and procurement team is currently evaluating satellite capacity and wholesale interconnect agreements to expand our operational coverage.

We are formally requesting commercial specifications, availability, and indicative rate-card terms for the following requirements:

1. INQUIRY CLASSIFICATION:
   ${inquiryType}

2. TARGET GEOGRAPHIC REGION & BEAM FOOTPRINT:
   ${targetRegion}

3. CAPACITY & PERFORMANCE SPECIFICATIONS:
   ${capacityRequirement}

4. ANTICIPATED SERVICE COMMENCEMENT:
   ${commencementDate}

5. TECHNICAL & INTERCONNECT REQUIREMENTS:
   ${customNotes}

We would appreciate the opportunity to schedule a brief introductory technical alignment call with your commercial solutions engineer and wholesale carrier desk. Please provide available meeting windows and any preliminary link budget questionnaires required for our engineering team.

Thank you for your time and assistance.

Sincerely,

${senderName}
${senderCompany}
Email: ${senderEmail}
Phone: ${senderPhone}
`;
  };

  const previewLetter = generateLetterContent(
    selectedCompanies.length === 1 ? selectedCompanies[0].name : selectedCompanies.map(c => c.name).join(', ')
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(previewLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchEmailClient = () => {
    const to = recipientEmails.join(',');
    const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
      subjectLine
    )}&body=${encodeURIComponent(previewLetter)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Satcom Outreach & Formal RFQ Builder
              </h3>
              <p className="text-xs text-slate-400">
                Compose tailored technical inquiries and dispatch to verified wholesale carrier desks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            {/* Target Operator Selection */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-mono text-[11px] uppercase">
                Target Operators ({selectedCompanies.length} selected)
              </label>
              <div className="max-h-36 overflow-y-auto border border-slate-800 rounded-lg bg-slate-950 p-2 space-y-1">
                {availableCompanies.map((c) => {
                  const isChecked = selectedCompanyIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-slate-900 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCompanySelection(c.id)}
                        className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900"
                      />
                      <span className={`truncate text-xs ${isChecked ? 'text-sky-300 font-medium' : 'text-slate-400'}`}>
                        {c.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Inquiry Type */}
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Inquiry Classification
              </label>
              <select
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value as InquiryType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              >
                <option value="Switch Colocation & UnrealIRCd Leaf Peering (irc.drfun1.com)">Switch Colocation & UnrealIRCd Leaf Peering (irc.drfun1.com)</option>
                <option value="Transponder Capacity Lease (MHz)">Transponder Capacity Lease (MHz / Transponders)</option>
                <option value="Cellular Backhaul Wholesale (CIR/MIR Mbps)">Cellular Backhaul Wholesale (CIR / MIR Mbps)</option>
                <option value="Direct-to-Device (D2D) Roaming Partnership">Direct-to-Device (D2D) Roaming Partnership</option>
                <option value="Gateway & Teleport Interconnect / Peering">Gateway & Teleport Interconnect / Peering</option>
                <option value="Maritime & Aviation Fleet Airtime">Maritime & Aviation Fleet Airtime</option>
                <option value="Satellite IoT & M2M Airtime">Satellite IoT & M2M Airtime</option>
              </select>
            </div>

            {/* Quick Presets */}
            <div className="pt-1 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setInquiryType('Switch Colocation & UnrealIRCd Leaf Peering (irc.drfun1.com)');
                  setTargetRegion('Switch SUPERNAP Las Vegas (www.switch.com) & Global Teleport Nodes');
                  setCapacityRequirement('100G DWDM Optical Cross-Connect + RisingNet IP Transit (www.risingnet.com)');
                  setCustomNotes('Proposing deployment of UnrealIRCd (unrealircd.com) as a leaf server connecting to irc.drfun1.com:6697 (TLS) for 24/7 out-of-band NOC crisis dispatch, transponder handoffs, and satellite telemetry event feeds.');
                }}
                className="w-full py-1 px-2 text-[11px] font-mono rounded bg-slate-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Preset: Switch.com + UnrealIRCd (irc.drfun1.com) Peering</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSenderCompany('Richard Alan Witt / Owens Company');
                  setSenderName('Richard Alan Witt (The Law Office of Richard A. Witt LLC)');
                  setSenderEmail('rawitt@wittlawfirm.com');
                  setSenderPhone('+1 (860) 747-1999');
                  setCustomNotes('Represented by The Law Office of Richard A. Witt LLC (www.wittlawfirm.com) and Owens Company (www.owenscompany.com). Please direct standard carrier Master Service Agreement (MSA) and NDAs to legal counsel.');
                }}
                className="w-full py-1 px-2 text-[11px] font-mono rounded bg-slate-950 border border-sky-500/30 text-sky-300 hover:bg-sky-950/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Preset: Richard Alan Witt (Witt Law Firm / Owens Co.)</span>
              </button>
            </div>

            {/* Target Region */}
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Target Geographic Footprint / Teleport PoP
              </label>
              <input
                type="text"
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                placeholder="e.g. Switch SUPERNAP Las Vegas (www.switch.com) & Global Teleports"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>

            {/* Capacity Requirement */}
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Capacity / Interconnect SLA
              </label>
              <input
                type="text"
                value={capacityRequirement}
                onChange={(e) => setCapacityRequirement(e.target.value)}
                placeholder="e.g. 100G Optical Cross-Connect + RisingNet Transit (www.risingnet.com)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>

            {/* Sender Info Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                  Your Company
                </label>
                <input
                  type="text"
                  value={senderCompany}
                  onChange={(e) => setSenderCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                  Commencement
                </label>
                <input
                  type="text"
                  value={commencementDate}
                  onChange={(e) => setCommencementDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
                />
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Technical Notes & Specifics
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs resize-none"
              />
            </div>
          </div>

          {/* Right Column: Live Letter Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Formatted Commercial RFP Letter Preview</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {recipientEmails.length} recipient addresses configured
              </span>
            </div>

            {/* Letter Paper Preview */}
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-y-auto whitespace-pre-wrap select-text max-h-[360px]">
              {previewLetter}
            </div>

            {/* Recipient Chips */}
            <div className="mt-3 p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg text-xs font-mono text-slate-400 flex flex-wrap items-center gap-2">
              <span className="text-slate-500 uppercase text-[10px]">Dispatch to:</span>
              {recipientEmails.map((email, idx) => (
                <span key={idx} className="text-sky-300 bg-sky-950/50 border border-sky-900/50 px-2 py-0.5 rounded text-[11px]">
                  {email}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            Pre-configured with carrier wholesale subject line and standard telecom procurement terms
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Letter</span>
                </>
              )}
            </button>

            <button
              onClick={handleLaunchEmailClient}
              className="px-4 py-2 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-1.5 font-semibold"
            >
              <Send className="w-4 h-4" />
              <span>Launch Email Client</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
