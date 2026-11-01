import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  Building2, 
  FileText, 
  Lock,
  Globe,
  Scale,
  Award,
  Radio,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Bookmark,
  Share2,
  Tv,
  Smartphone
} from 'lucide-react';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTabId;
}

export type LegalTabId = 
  | 'license'
  | 'terms'
  | 'reseller_agreement'
  | 'privacy'
  | 'spectrum_regulatory'
  | 'carrier_ntn'
  | 'peering_sla'
  | 'dmca';

const STORAGE_KEY_LEGAL_ACCEPTED = 'drfun1_global_legal_terms_accepted_state';

export const LicenseModal: React.FC<LicenseModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'license' 
}) => {
  const [activeTab, setActiveTab] = useState<LegalTabId>(initialTab);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('Richard Alan Witt');
  const [signerTitle, setSignerTitle] = useState('Principal Attorney & Master Licensee');
  const [signerCompany, setSignerCompany] = useState('The Law Office of Richard A. Witt LLC');
  const [hasAcceptedGlobalTerms, setHasAcceptedGlobalTerms] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEGAL_ACCEPTED);
      return saved === 'true';
    } catch (_) {
      return true;
    }
  });
  const [acceptanceNotice, setAcceptanceNotice] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const licenseData = {
    licensee: 'Richard Alan Witt',
    certificateId: 'RAW-SATCOM-2026-LIC-0881',
    grantDate: 'October 29, 2026',
    renewalDate: 'Perpetual Grant & Annual Review',
    status: 'Active · Certified · Exclusive Master License',
    lawFirmDomain: 'www.wittlawfirm.com',
    lawFirmUrl: 'https://www.wittlawfirm.com',
    lawFirmTitle: 'The Law Office of Richard A. Witt LLC',
    corporateDomain: 'www.owenscompany.com',
    corporateUrl: 'https://www.owenscompany.com',
    corporateTitle: 'Owens Company',
    appTitle: 'DrFun1 Orbit - Global Satellite Operator Directory, DrFun1 Wireless & Turnkey Reseller Marketplace',
  };

  const handleCopyText = (content: string, label: string) => {
    navigator.clipboard.writeText(content);
    setCopiedTab(label);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  const handleDownloadDocument = (title: string, text: string) => {
    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_WittLawFirm_Certified.txt`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSignAgreement = () => {
    const record = {
      signerName,
      signerTitle,
      signerCompany,
      timestamp: new Date().toISOString(),
      accepted: true,
      jurisdiction: 'The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)',
    };
    localStorage.setItem(STORAGE_KEY_LEGAL_ACCEPTED, 'true');
    localStorage.setItem('drfun1_legal_audit_record', JSON.stringify(record));
    setHasAcceptedGlobalTerms(true);
    setAcceptanceNotice(`Global Terms of Service & Master Reseller Agreement legally signed by ${signerName} (${signerCompany}) via www.wittlawfirm.com.`);
    setTimeout(() => setAcceptanceNotice(null), 6000);
  };

  // Legal Tab Definitions
  const tabs: { id: LegalTabId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'license', label: 'Master License Grant', icon: ShieldCheck },
    { id: 'terms', label: 'Global Terms of Service (AUP)', icon: Scale },
    { id: 'reseller_agreement', label: 'Turnkey Reseller Agreement', icon: Building2 },
    { id: 'privacy', label: 'Global Privacy & GDPR', icon: Lock },
    { id: 'spectrum_regulatory', label: 'ITU & FCC Spectrum Rules', icon: Radio },
    { id: 'carrier_ntn', label: 'Carrier 5G NTN Policy', icon: Smartphone },
    { id: 'peering_sla', label: 'Switch & RisingNet SLA', icon: Server },
    { id: 'dmca', label: 'DMCA & Broadcast License', icon: Tv },
  ];

  // Legal texts
  const masterLicenseText = `========================================================================
CERTIFICATE OF MASTER SOFTWARE & TELECOM OPERATING LICENSE
THE LAW OFFICE OF RICHARD A. WITT LLC (WWW.WITTLAWFIRM.COM)
========================================================================

APPLICATION & TELECOM NETWORK:
  ${licenseData.appTitle}

EXCLUSIVE LICENSEE & LEGAL ESCROW HOLDER:
  Richard Alan Witt
  Official Firm: The Law Office of Richard A. Witt LLC (https://${licenseData.lawFirmDomain})
  Official Corporate Entity: Owens Company (https://${licenseData.corporateDomain})

CERTIFICATE CREDENTIALS:
  Certificate ID:  ${licenseData.certificateId}
  Effective Date:  ${licenseData.grantDate}
  Validity:        ${licenseData.renewalDate}
  Status:          ${licenseData.status}
  Governing State: State of Connecticut / United States Federal Jurisdiction

OPERATIONAL GRANT & SCOPE OF EXCLUSIVE LICENSE:
1. Master License Grant: The Law Office of Richard A. Witt LLC hereby certifies that
   Richard Alan Witt is the exclusive perpetual licensee of the DrFun1 Orbit technology
   stack, encompassing all satellite constellation databases, direct RFQ transmission
   engines, DrFun1 Wireless hybrid mobile core architectures, factory-unlocked handset
   resale integrations, and the 25-node Switch SUPERNAP UnrealIRCd telemetry mesh.

2. Global Turnkey Reseller Authority: Licensee is granted full authority to authorize,
   supervise, co-brand, re-brand, and host turnkey third-party resellers globally across
   all products and services offered on this platform, provided all resellers execute
   and abide by the Witt Law Firm Master Reseller Agreement.

3. Telecommunications & Spectrum Escrow: All regulatory submissions, ITU frequency
   registrations, FCC Part 25/Part 27 filings, and carrier interconnect memoranda are
   licensed through and overseen under the legal auspices of Richard Alan Witt.

4. Intellectual Property & Brand Sanction: Any co-branded or white-label derivative
   operating on this platform operates under license from Richard Alan Witt and The Law
   Office of Richard A. Witt LLC.

AUTHENTICATION SEAL:
  Certified & Verified at www.wittlawfirm.com
  License Record Ref: #RAW-WITT-2026-SATCOM-0881
========================================================================`;

  const termsOfServiceText = `========================================================================
GLOBAL TERMS OF SERVICE & ACCEPTABLE USE POLICY (AUP)
GOVERNED BY THE LAW OFFICE OF RICHARD A. WITT LLC (WWW.WITTLAWFIRM.COM)
========================================================================

1. ACCEPTANCE OF GLOBAL TERMS
By accessing, browsing, interacting with, leasing bandwidth from, or purchasing
hardware through DrFun1 Orbit, DrFun1 Wireless, DrFun1 ECOM Inc, or any co-branded
or rebranded portal hosted under this network, you ("User", "Client", "Reseller")
unconditionally agree to be bound by these Global Terms of Service.

2. GLOBAL OPERATING COMPLIANCE & LEGAL JURISDICTION
This platform, its database, its mobile applications, its UnrealIRCd peering hubs,
and its wholesale e-commerce store operate under the legal stewardship of The Law
Office of Richard A. Witt LLC (www.wittlawfirm.com). All legal interpretations,
disputes, and arbitration shall be governed by the laws of the State of Connecticut
and United States Federal Law.

3. ACCEPTABLE USE & TELECOM INTEGRITY
Users and commercial clients agree NOT to:
  a. Transmit unauthorized radio signals, interfere with licensed satellite transponders,
     or violate ITU/FCC radio spectrum allocations.
  b. Utilize DrFun1 Wireless unlocked smartphones or eSIMs for fraudulent roaming,
     SIM-box bypass, or unlawful telecommunications arbitrage.
  c. Conduct denial-of-service (DDoS) attacks, port scanning, or malicious exploits
     against Switch SUPERNAP teleports, RisingNet BGP routers, or irc.drfun1.com nodes.
  d. Broadcast defamatory, illegal, or infringing media content across DrFun1 Media TV,
     Cablecast PEG, or MPD Bot audio relay streams.

4. 99.999% SLA & TELEPORT INFRASTRUCTURE GUARANTEE
Carrier CIR pipelines, Quantum Fiber optical circuits, and Bare-Metal IRCD nodes hosted
inside Switch SUPERNAP datacenters carry a 99.999% power and HVAC SLA backed by Switch's
Tier 5 Platinum rating, with multi-homed BGP transit routed via RisingNet.

5. LIMITATION OF LIABILITY & LEGAL ESCROW
To the maximum extent permitted by applicable law, neither Richard Alan Witt, The Law
Office of Richard A. Witt LLC, Owens Company, nor DrFun1 Media Inc shall be held liable
for indirect, punitive, or consequential damages resulting from solar atmospheric radio
attenuation, launch vehicle anomalies, orbital debris maneuvers, or upstream carrier
outages beyond reasonable technical control.
========================================================================`;

  const resellerAgreementText = `========================================================================
MASTER TURNKEY CO-BRANDED & REBRANDED RESELLER AGREEMENT
LICENSED VIA THE LAW OFFICE OF RICHARD A. WITT LLC (WWW.WITTLAWFIRM.COM)
========================================================================

1. TURNKEY RESELLER RIGHTS & CO-BRANDING PRIVILEGES
The Reseller is hereby granted a non-exclusive, worldwide license to resell, co-brand,
white-label rebrand, and host all products and services offered on this site, including:
  - DrFun1 Wireless Factory-Unlocked Handsets (iPhone 16 Pro Max, Galaxy S25 Ultra, Pixel 9 Pro)
  - DrFun1 Wireless Satellite 5G Plans & Universal Multi-Carrier eSIMs
  - Switch.com Fiber Optical & Teleport Colocation Cross-Connects (www.switch.com)
  - Snapdragon Qualcomm Satellite & 5G Baseband Modems
  - Quantum Fiber Terrestrial Symmetrical Optical Bandwidth (500M - 8G, 400G waves)
  - Dedicated IRCD & Bare-Metal Hosting (DataPacket 40G, RisingNet BGP clean pipe)
  - Commercial Satellite Terminals (Starlink, Kymeta, OneWeb, SES)
  - Multi-Orbit CIR Bandwidth Pipes & Dedicated Satellite Internet
  - Direct-to-Device 3GPP NTN, Satellite IoT, and Earth Observation SAR Data
  - Broadcast TV & Online Radio Distribution, Cablecast PEG, and MPD Bot Decks

2. BRANDING MODES: CO-BRANDED VS. FULL WHITE-LABEL REBRANDING
  a. Co-Branded: Reseller displays "Powered by DrFun1 Wireless & Switch SUPERNAP" with
     access to turnkey co-marketing collateral and joint escrow through Witt Law Firm.
  b. Full White-Label: Reseller configures a custom CNAME domain (e.g. store.client.com),
     private brand name, customized color schemes, independent customer billing, and
     branded client invoices while back-ending through the DrFun1 wholesale API.

3. WHOLESALE MARGINS, PRICING & SETTLEMENT
  a. Resellers receive wholesale pricing discounts (up to 40% below carrier MSRP).
  b. Resellers have absolute freedom to define retail markups (5% to 50%+ profit margin).
  c. Automated payouts are settled via Stripe Connect, Automated Clearing House (ACH),
     or Federal Wire Transfer under Witt Law Firm escrow oversight.

4. MANDATORY LEGAL AGREEMENT & COMPLIANCE ENFORCEMENT
No reseller storefront, custom CNAME, or API key shall be activated without the reseller
affirmatively consenting to this Agreement, the Global Terms of Service, and all regulatory
policies certified by The Law Office of Richard A. Witt LLC (www.wittlawfirm.com).
========================================================================`;

  const privacyPolicyText = `========================================================================
GLOBAL PRIVACY POLICY & INTERNATIONAL DATA PROTECTION (GDPR / CCPA)
THE LAW OFFICE OF RICHARD A. WITT LLC (WWW.WITTLAWFIRM.COM)
========================================================================

1. PRIVACY BY DESIGN & ZERO-SURVEILLANCE PRINCIPLES
DrFun1 Orbit, DrFun1 Wireless, and associated UnrealIRCd communications operate under
strict Privacy-by-Design protocols. We do not sell, rent, monetize, or harvest personal
communications, chat logs on irc.drfun1.com, or real-time RF tracking coordinates.

2. DIRECT-TO-CELL SATELLITE 5G TELEMETRY DATA
When utilizing DrFun1 Wireless unlocked smartphones with Direct-to-Cell satellite 5G:
  - Ephemeral GPS beacon coordinates used for emergency orbital SOS and beam tracking
    are encrypted end-to-end (AES-256) and purged immediately upon connection termination.
  - IMSI / eUICC profile data is exchanged strictly between authenticated GSMA SM-DP+
    servers and partner carrier switches (T-Mobile, AT&T, Verizon, AST SpaceMobile, Starlink).

3. INTERNATIONAL DATA TRANSFERS & GDPR / CCPA RIGHTS
European Union (GDPR), United Kingdom (UK GDPR), and California (CCPA) residents possess
the right to request data access, rectification, portability, and permanent deletion of
account records. All requests are processed by our designated Data Protection Officer via
livewithdrfun1@gmail.com and verified by The Law Office of Richard A. Witt LLC.
========================================================================`;

  const spectrumRegulatoryText = `========================================================================
ITU RADIO REGULATIONS & FCC PART 25 / PART 27 SPECTRUM COMPLIANCE
THE LAW OFFICE OF RICHARD A. WITT LLC (WWW.WITTLAWFIRM.COM)
========================================================================

1. INTERNATIONAL TELECOMMUNICATION UNION (ITU) COMPLIANCE
All satellite communications, bandwidth transponder leasing, and earth station operations
facilitated through this directory strictly conform to the ITU Radio Regulations (RR),
specifically Articles 9 and 11 regarding advance publication, frequency notification,
and orbital slot coordination.

2. FEDERAL COMMUNICATIONS COMMISSION (FCC) RULES
  - FCC Part 25: Commercial satellite communications, fixed-satellite service (FSS),
    mobile-satellite service (MSS), and blanket earth station licensing.
  - FCC Part 27: Miscellaneous wireless communications services, terrestrial 5G flexible
    use spectrum (C-Band, CBRS, AWS, PCS), and terrestrial-satellite supplemental coverage.
  - Supplemental Coverage from Space (SCS): Direct-to-Cell transmissions coordinated with
    terrestrial carrier spectrum license holders to ensure zero co-channel interference.

3. REGULATORY OVERSIGHT BY WITT LAW FIRM
All carrier agreements, RF lease agreements, and transmission rights-of-way undergo
regulatory legal review by Richard Alan Witt, Attorney at Law (www.wittlawfirm.com).
========================================================================`;

  const carrierNtnText = `========================================================================
CARRIER 5G NTN INTERCONNECT & UNLOCKED SMARTPHONE DISCLOSURES
THE LAW OFFICE OF RICHARD A. WITT LLC (WWW.WITTLAWFIRM.COM)
========================================================================

1. 3GPP RELEASE 17 & 18 NON-TERRESTRIAL NETWORK (NTN) STANDARDS
DrFun1 Wireless handsets and carrier plans comply with 3GPP Release 17/18 NTN standards,
utilizing standard sub-6GHz cellular bands (Bands n255, n256, S-Band, L-Band, and mid-band
PCS) to communicate directly with low-Earth orbit satellites (AST SpaceMobile, Starlink).

2. FACTORY-UNLOCKED SMARTPHONE INTEROPERABILITY
All cell phones sold by DrFun1 Wireless (Apple iPhone 16 Pro Max, Samsung Galaxy S25 Ultra,
Google Pixel 9 Pro, Motorola Defy Extreme, Qualcomm Snapdragon Reference Handsets) are 100%
factory unlocked. They are legally guaranteed to function with SIM/eSIM profiles from any
carrier worldwide (T-Mobile, AT&T, Verizon, Vodafone, SoftBank, etc.) without carrier locks.

3. EMERGENCY SATELLITE SOS & E911 SERVICE DISCLOSURES
Direct satellite voice and SMS messaging services are engineered to supplement, not replace,
terrestrial public safety answering points (PSAPs). When outside cellular range, satellite
SOS transmissions relay GPS coordinates to certified emergency response centers.
========================================================================`;

  const peeringSlaText = `========================================================================
SWITCH SUPERNAP TIER IV COLOCATION & RISINGNET CLEAN-PIPE BGP SLA
THE LAW OFFICE OF RICHARD A. WITT LLC (WWW.WITTLAWFIRM.COM)
========================================================================

1. SWITCH SUPERNAP CORE TELEPORT FACILITIES (WWW.SWITCH.COM)
All master hub nodes (irc.drfun1.com) and core mobile telecom packet gateways are housed
inside Switch SUPERNAP datacenter campuses in Las Vegas, NV; Tahoe Reno, NV; Grand Rapids,
MI; Atlanta, GA; and Austin, TX.
  - 100% Power Uptime SLA backed by Tier 5 Platinum certifications.
  - 100% Renewable energy footprint (solar and wind power).
  - Direct optical cross-connects with sub-millisecond cloud on-ramps.

2. RISINGNET BGP MULTI-HOMED CLEAN-PIPE TRANSIT (WWW.RISINGNET.COM)
IP transit for all satellite telemetry and IRC mesh communication is protected by RisingNet
autonomous system BGP routing with automated Layer 3/4 and Layer 7 DDoS mitigation.
========================================================================`;

  const dmcaText = `========================================================================
DMCA COPYRIGHT POLICY & MULTISTREAM BROADCAST RETRANSMISSION LICENSE
THE LAW OFFICE OF RICHARD A. WITT LLC (WWW.WITTLAWFIRM.COM)
========================================================================

1. DIGITAL MILLENNIUM COPYRIGHT ACT (DMCA) SAFE HARBOR
DrFun1 Media Inc, DrFun1 TV, Cablecast PEG, and the Multistream Broadcast Relay operate in
full compliance with 17 U.S.C. § 512 (DMCA). Designated Copyright Agent:
  Attorney Richard Alan Witt
  The Law Office of Richard A. Witt LLC
  68 Federal Street, Bristol, CT 06010
  Website: https://www.wittlawfirm.com | Email: rawitt@wittlawfirm.com / livewithdrfun1@gmail.com

2. 24/7 MPD BOT INTERNET RADIO & MUSIC ROYALTY COMPLIANCE
Online radio broadcasting decks streaming across #all-music and #drfun1-radio operate under
statutory internet radio webcasting guidelines with certified DJ oper access controls.
========================================================================`;

  const getCurrentText = () => {
    switch (activeTab) {
      case 'license': return masterLicenseText;
      case 'terms': return termsOfServiceText;
      case 'reseller_agreement': return resellerAgreementText;
      case 'privacy': return privacyPolicyText;
      case 'spectrum_regulatory': return spectrumRegulatoryText;
      case 'carrier_ntn': return carrierNtnText;
      case 'peering_sla': return peeringSlaText;
      case 'dmca': return dmcaText;
    }
  };

  const getCurrentTitle = () => {
    const tabDef = tabs.find(t => t.id === activeTab);
    return tabDef ? tabDef.label : 'Legal Agreement';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Global Legal &amp; Regulatory Compliance Portal
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Licensed via www.wittlawfirm.com</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                The Law Office of Richard A. Witt LLC &bull; Owens Company &bull; Richard Alan Witt, Exclusive Licensee
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

        {/* Global Compliance Summary Bar */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Master Certificate: <strong className="text-white">{licenseData.certificateId}</strong></span>
            <span className="text-slate-500 hidden sm:inline">&bull;</span>
            <span className="text-slate-400 hidden sm:inline">Perpetual Operating Grant</span>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="https://www.wittlawfirm.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 underline flex items-center gap-1 font-semibold"
            >
              <span>wittlawfirm.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-600">|</span>
            <a 
              href="https://www.owenscompany.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200 underline flex items-center gap-1"
            >
              <span>owenscompany.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs (8 Global Legal Documents) */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-2.5 overflow-x-auto no-scrollbar border-b border-slate-800 bg-slate-950/60 text-xs font-mono">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 border-t border-x ${
                  isActive
                    ? 'bg-slate-900 border-slate-700 text-sky-400 font-bold border-b-transparent shadow-sm'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-slate-300 bg-slate-900">
          
          {/* Action notification banner */}
          {acceptanceNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 flex items-center gap-2 font-mono text-xs shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{acceptanceNotice}</span>
            </div>
          )}

          {/* Legal Header Card for Current Document */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-semibold block">
                Official Certified Legal Document &bull; The Law Office of Richard A. Witt LLC
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {getCurrentTitle()}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyText(getCurrentText(), activeTab)}
                className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors flex items-center gap-1.5"
              >
                {copiedTab === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTab === activeTab ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                onClick={() => handleDownloadDocument(getCurrentTitle(), getCurrentText())}
                className="py-1.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          {/* Legal Document Display Frame */}
          <div className="relative rounded-xl bg-slate-950 border border-slate-800/90 p-4 sm:p-5 font-mono text-[11px] sm:text-xs leading-relaxed text-slate-300 overflow-x-auto max-h-[380px] overflow-y-auto whitespace-pre-wrap select-text shadow-inner">
            {getCurrentText()}
          </div>

          {/* Interactive Reseller & Global Operator Signing Block */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/30 border border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Reseller &amp; Operator Legal Compliance Execution</span>
                </h5>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Turnkey resellers, co-branded operators, and carrier administrators must execute compliance with all Global Terms of Service, Reseller Agreements, and ITU/FCC spectrum policies certified by <strong className="text-white">www.wittlawfirm.com</strong> prior to activating custom storefronts or IRC netadmin nodes.
                </p>
              </div>

              {hasAcceptedGlobalTerms ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold flex items-center gap-1 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                  <span>Terms Formally Accepted</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold shrink-0">
                  Pending Signature
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Signer Legal Name</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Title / Authority</label>
                <input
                  type="text"
                  value={signerTitle}
                  onChange={(e) => setSignerTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Company / Entity</label>
                <input
                  type="text"
                  value={signerCompany}
                  onChange={(e) => setSignerCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400">
                Governing Jurisdiction: The Law Office of Richard A. Witt LLC &bull; Bristol, CT / Global Space Commerce
              </span>

              <button
                onClick={handleSignAgreement}
                className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sign &amp; Acknowledge All Global Legal Documents</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Escrow &amp; Compliance Verified via The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDownloadDocument('Complete_DrFun1_Global_Legal_Codex', `${masterLicenseText}\n\n${termsOfServiceText}\n\n${resellerAgreementText}\n\n${privacyPolicyText}\n\n${spectrumRegulatoryText}\n\n${carrierNtnText}\n\n${peeringSlaText}\n\n${dmcaText}`)}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Complete Legal Codex (All 8 Docs)</span>
            </button>

            <button
              onClick={onClose}
              className="py-1.5 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
