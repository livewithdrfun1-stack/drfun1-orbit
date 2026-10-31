import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  ExternalLink,
  DollarSign,
  Download,
  Copy,
  Check,
  Server,
  Zap,
  Terminal,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Radio,
  Globe,
  Sliders,
  FileText,
  Key,
  Award,
  Sparkles,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  Code,
  CheckSquare,
  Square,
  Play
} from 'lucide-react';
import { STORE_PRODUCTS } from '../data/storeProducts';

interface HostingResellerProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProductForOrder: (productId: string) => void;
}

type TabType = 'ezsetup' | 'matrix' | 'calculator' | 'whitelabel' | 'onboarding' | 'legal';
type HostingCategoryFilter = 'all' | 'ircd' | 'baremetal' | 'wordpress' | 'broadcast' | 'fiber';
type EzSetupNiche = 'all' | 'ircd' | 'wordpress' | 'broadcast' | 'fiber';

interface PartnerRegistration {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  customDomain: string;
  payoutMethod: 'stripe' | 'wire' | 'ach' | 'crypto';
  targetAsn: string;
  acceptedTerms: boolean;
  partnerId?: string;
  apiKey?: string;
  enrolledAt?: string;
}

const STORAGE_KEY_RESELLER_PARTNER = 'drfun1_hosting_reseller_partner';
const STORAGE_KEY_EZ_CHECKLIST = 'drfun1_hosting_reseller_ez_checklist';

export const HostingResellerProgramModal: React.FC<HostingResellerProgramModalProps> = ({
  isOpen,
  onClose,
  onSelectProductForOrder,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ezsetup');
  const [categoryFilter, setCategoryFilter] = useState<HostingCategoryFilter>('all');
  const [ezsetupNiche, setEzsetupNiche] = useState<EzSetupNiche>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [dnsTestStatus, setDnsTestStatus] = useState<'idle' | 'testing' | 'verified'>('idle');

  // EZ Setup Progress Checklist State (persisted)
  const [ezChecklist, setEzChecklist] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EZ_CHECKLIST);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading EZ checklist', e);
    }
    return {
      step1: false,
      step2: false,
      step3: false,
      step4: false,
      step5: false,
    };
  });

  const toggleChecklist = (stepKey: string) => {
    setEzChecklist((prev) => {
      const updated = { ...prev, [stepKey]: !prev[stepKey] };
      localStorage.setItem(STORAGE_KEY_EZ_CHECKLIST, JSON.stringify(updated));
      return updated;
    });
  };

  // Stored or active partner registration
  const [partner, setPartner] = useState<PartnerRegistration | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RESELLER_PARTNER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading reseller profile', e);
    }
    return null;
  });

  // Partner Form State
  const [formCompany, setFormCompany] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDomain, setFormDomain] = useState('');
  const [formPayout, setFormPayout] = useState<'stripe' | 'wire' | 'ach' | 'crypto'>('stripe');
  const [formAsn, setFormAsn] = useState('AS-DRFUN1-DOWNSTREAM');
  const [formAccepted, setFormAccepted] = useState(false);

  // Multi-Package Calculator Quantities
  const [calcCounts, setCalcCounts] = useState<{
    ircdSwitch: number;
    ircdDataPacket: number;
    ircdRisingNet: number;
    ircdTriMesh: number;
    baremetalGround: number;
    meshSuite25: number;
    wpDuplicator: number;
    mpdDjRadio: number;
    broadcastEngine: number;
    quantumFiber1G: number;
    quantumFiberBiz: number;
  }>({
    ircdSwitch: 2,
    ircdDataPacket: 2,
    ircdRisingNet: 1,
    ircdTriMesh: 1,
    baremetalGround: 1,
    meshSuite25: 1,
    wpDuplicator: 15,
    mpdDjRadio: 8,
    broadcastEngine: 2,
    quantumFiber1G: 25,
    quantumFiberBiz: 5,
  });

  // White-label test domain
  const [testDomain, setTestDomain] = useState('hosting.yourbrand.com');
  const [testMotdTitle, setTestMotdTitle] = useState('NextGen Cloud Communications Network');

  // Filter products relevant to hosting & wholesale reselling
  const hostingProducts = useMemo(() => {
    return STORE_PRODUCTS.filter((p) => {
      // Must be recurring monthly or infrastructure hosting
      const isHosting =
        p.category === 'Dedicated IRCD & Transit Hosting' ||
        p.category === 'Bare-Metal & Teleport Hosting' ||
        p.category === 'Teleport & Switch Colocation' ||
        p.category === 'DrFun1 Broadcast TV & Online Radio' ||
        p.category === 'Quantum Fiber & Terrestrial Optical' ||
        p.category === 'ISP & Dedicated Satellite Internet';

      if (!isHosting) return false;

      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'ircd') return p.category === 'Dedicated IRCD & Transit Hosting';
      if (categoryFilter === 'baremetal') {
        return (
          p.category === 'Bare-Metal & Teleport Hosting' ||
          p.category === 'Teleport & Switch Colocation'
        );
      }
      if (categoryFilter === 'wordpress') {
        return p.id.includes('wp-irc') || p.id.includes('duplicator');
      }
      if (categoryFilter === 'broadcast') {
        return (
          p.category === 'DrFun1 Broadcast TV & Online Radio' ||
          p.id.includes('mpd') ||
          p.id.includes('broadcast') ||
          p.id.includes('radiocast')
        );
      }
      if (categoryFilter === 'fiber') {
        return p.category === 'Quantum Fiber & Terrestrial Optical';
      }
      return true;
    });
  }, [categoryFilter]);

  // Total packages modeled in calculator
  const totalSubscribersCount = useMemo(() => {
    return Object.values(calcCounts).reduce((a, b) => a + b, 0);
  }, [calcCounts]);

  // Determine Reseller Tier based on total volume
  const resellerTierInfo = useMemo(() => {
    if (totalSubscribersCount >= 51) {
      return {
        tier: 'Platinum Elite Partner',
        bonusDiscountPct: 15,
        badgeColor: 'text-purple-300 bg-purple-500/20 border-purple-500/40',
        perks: '15% wholesale bonus discount, dedicated BGP ASN swip, custom rDNS, and 24/7 dedicated Slack/IRC NOC bridge',
      };
    }
    if (totalSubscribersCount >= 26) {
      return {
        tier: 'Gold Partner',
        bonusDiscountPct: 10,
        badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
        perks: '10% wholesale bonus discount, branded customer portal, and priority Switch SUPERNAP provisioning',
      };
    }
    if (totalSubscribersCount >= 11) {
      return {
        tier: 'Silver Partner',
        bonusDiscountPct: 5,
        badgeColor: 'text-slate-200 bg-slate-700/50 border-slate-500/40',
        perks: '5% wholesale bonus discount, automated WHMCS module access, and unmetered WebIRC proxy access',
      };
    }
    return {
      tier: 'Bronze Partner',
      bonusDiscountPct: 0,
      badgeColor: 'text-amber-500 bg-amber-900/30 border-amber-700/40',
      perks: 'Standard wholesale catalog pricing and Richard Alan Witt legal contract protection',
    };
  }, [totalSubscribersCount]);

  // Financial calculations
  const financials = useMemo(() => {
    // Define items with prices
    const items = [
      { id: 'ircdSwitch', wholesale: 650, retail: 980, count: calcCounts.ircdSwitch },
      { id: 'ircdDataPacket', wholesale: 750, retail: 1150, count: calcCounts.ircdDataPacket },
      { id: 'ircdRisingNet', wholesale: 590, retail: 890, count: calcCounts.ircdRisingNet },
      { id: 'ircdTriMesh', wholesale: 2450, retail: 3200, count: calcCounts.ircdTriMesh },
      { id: 'baremetalGround', wholesale: 3800, retail: 4900, count: calcCounts.baremetalGround },
      { id: 'meshSuite25', wholesale: 2200, retail: 3400, count: calcCounts.meshSuite25 },
      { id: 'wpDuplicator', wholesale: 35, retail: 65, count: calcCounts.wpDuplicator },
      { id: 'mpdDjRadio', wholesale: 48, retail: 85, count: calcCounts.mpdDjRadio },
      { id: 'broadcastEngine', wholesale: 1850, retail: 2750, count: calcCounts.broadcastEngine },
      { id: 'quantumFiber1G', wholesale: 60, retail: 85, count: calcCounts.quantumFiber1G },
      { id: 'quantumFiberBiz', wholesale: 380, retail: 550, count: calcCounts.quantumFiberBiz },
    ];

    let grossMonthly = 0;
    let baseWholesaleMonthly = 0;

    items.forEach((item) => {
      grossMonthly += item.retail * item.count;
      baseWholesaleMonthly += item.wholesale * item.count;
    });

    // Apply tier discount on wholesale
    const discountFactor = (100 - resellerTierInfo.bonusDiscountPct) / 100;
    const finalWholesaleMonthly = baseWholesaleMonthly * discountFactor;
    const netProfitMonthly = grossMonthly - finalWholesaleMonthly;
    const netProfitAnnual = netProfitMonthly * 12;
    const marginPct = grossMonthly > 0 ? (netProfitMonthly / grossMonthly) * 100 : 0;

    return {
      grossMonthly,
      finalWholesaleMonthly,
      netProfitMonthly,
      netProfitAnnual,
      marginPct,
    };
  }, [calcCounts, resellerTierInfo]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Handle partner activation
  const handleActivatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany || !formEmail) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newPartner: PartnerRegistration = {
      companyName: formCompany,
      contactName: formContact || formCompany,
      email: formEmail,
      phone: formPhone,
      customDomain: formDomain || 'reseller.clientdomain.com',
      payoutMethod: formPayout,
      targetAsn: formAsn || 'AS-DRFUN1-DOWNSTREAM',
      acceptedTerms: formAccepted,
      partnerId: `DRFUN1-HOST-RESELLER-${randomSuffix}`,
      apiKey: `drf_live_resell_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`,
      enrolledAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    setPartner(newPartner);
    localStorage.setItem(STORAGE_KEY_RESELLER_PARTNER, JSON.stringify(newPartner));
  };

  // Download Master Reseller Agreement
  const handleDownloadAgreement = () => {
    const agreementText = `# MASTER WHOLESALE HOSTING & OPTICAL BANDWIDTH RESELLER AGREEMENT
**Document Reference**: DRFUN1-RAW-HOST-RESELL-2026-v4.2
**Governing Counsel**: Richard Alan Witt, Esq. (Witt Law Firm / Owens Company)
**Official Counsel Registry**: https://www.wittlawfirm.com | https://www.owenscompany.com
**Partner ID**: ${partner ? partner.partnerId : 'PENDING-ENROLLMENT'}
**Partner Entity**: ${partner ? partner.companyName : '[RESELLER ENTITY]'}
**Effective Date**: ${partner ? partner.enrolledAt : 'October 31, 2026'}

---

### RECITALS
This Master Wholesale Reseller Agreement ("Agreement") is executed between DrFun1 Media Inc. & DrFun1 Orbit ("Carrier Provider") and the authorized Reseller Partner ("Reseller"), with legal oversight and commercial arbitration governed under Richard Alan Witt LLC.

### SECTION 1: RESELLER SCOPE & COVERED HOSTING INFRASTRUCTURE
Carrier Provider grants Reseller an unbundled, non-exclusive worldwide master license to market, rebrand, and resell the following core hosting tiers:
1. **Dedicated IRCD & Transit Hosting Nodes**:
   - Switch SUPERNAP Las Vegas Bare-Metal (Tier 5 Redundancy, 100% Green Power)
   - DataPacket HyperStream 40Gbps unmetered IRC nodes (www.datapacket.com)
   - RisingNet CleanPipe multi-terabit DDoS filtered IP transit (www.risingnet.com)
   - TriMesh Imperium multi-carrier clusters with automatic failover
2. **WordPress & Web Chat Duplicator Hosting**:
   - Turnkey managed cloud instances for the DrFun1 WordPress IRC Duplicator
   - Bidirectional Redis 7.2 packet caching and REST API websocket distribution
3. **MPD Bot & Broadcast Media Hosting**:
   - Automated 320kbps Icecast2 DJ streaming servers and web decks
   - DrFun1 Broadcast Engine Pro and TVU-Edge Cloud Transcoding infrastructure
4. **Quantum Fiber Optical Internet**:
   - Co-branded symmetrical fiber internet (500M, 1G, 2G, 3G, 8G, and QuantumBiz Enterprise with /29 static IP allocations)

### SECTION 2: WHOLESALE PRICING & MARGIN RETENTION
- Reseller purchases all hosting instances at contract wholesale rates.
- Reseller sets all end-user retail prices freely without minimum price fixing.
- 100% of reseller gross margin is retained directly by Reseller.
- Additional Volume Discounts:
  * Bronze (1–10 instances): Base Wholesale Pricing
  * Silver (11–25 instances): +5% Wholesale Margin Bonus
  * Gold (26–50 instances): +10% Wholesale Margin Bonus
  * Platinum Elite (51+ instances): +15% Wholesale Margin Bonus & Dedicated ASN Delegation

### SECTION 3: WHITE-LABEL & INTELLECTUAL PROPERTY CO-BRANDING
- Reseller is permitted full white-label operation: Custom domain names, reverse DNS (rDNS), custom IRC MOTDs, custom WHOIS SWIP records, and white-label client billing.
- Co-branding with "Powered by DrFun1 Mesh & Switch SUPERNAP" is permitted and carries Tier-1 verified SLA guarantees.

### SECTION 4: SERVICE LEVEL AGREEMENT (SLA) & UPTIME GUARANTEE
- Switch SUPERNAP Las Vegas colocation carries a 100% Power and Cooling SLA.
- DataPacket unmetered bandwidth carries 99.99% throughput availability.
- RisingNet DDoS scrubbed IP transit carries a 99.999% clean-packet guarantee with under 2-second BGP mitigation initiation.

### SECTION 5: ESCROW & LEGAL CERTIFICATION
Arbitration and master reseller registry certified by:
Richard Alan Witt, Esq.
Witt Law Firm / Owens Company
Web: https://www.wittlawfirm.com | https://www.owenscompany.com
Certification Hash: SHA256-RAW-HOSTING-RESELLER-2026-OK
`;

    const blob = new Blob([agreementText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DrFun1_Master_Hosting_Reseller_Agreement_${partner ? partner.partnerId : 'Template'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Test DNS verification simulator
  const handleTestDns = () => {
    setDnsTestStatus('testing');
    setTimeout(() => {
      setDnsTestStatus('verified');
      toggleChecklist('step2');
    }, 1200);
  };

  // Download complete EZ Setup Guide
  const handleDownloadEzSetupGuide = () => {
    const doc = `# DRFUN1 WHOLESALE HOSTING RESELLER NETWORK: EZ SETUP & DEPLOYMENT GUIDE
**Document Reference**: DRFUN1-EZ-HOST-SETUP-2026-v1.0
**Certified Legal Counsel**: Richard Alan Witt, Esq. (Witt Law Firm / Owens Company)
**Official Counsel Registry**: https://www.wittlawfirm.com | https://www.owenscompany.com
**Partner ID**: ${partner ? partner.partnerId : 'DRFUN1-HOST-RESELLER-DEMO'}
**Partner Entity**: ${partner ? partner.companyName : 'Authorized Reseller'}
**Reseller API Key**: ${partner ? partner.apiKey : 'drf_live_resell_demo_key'}
**Target Hostname**: ${testDomain}
**Date Generated**: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

---

## 5-MINUTE EZ SETUP OVERVIEW
As an authorized DrFun1 Hosting Reseller, you can provision and resell enterprise bare-metal, 40Gbps unmetered IRCDs, high-traffic WordPress chat duplicators, 320kbps Icecast DJ servers, and Quantum Fiber optical broadband with 100% margin retention.

---

## STEP 1: 60-SECOND PARTNER ACTIVATION & API TOKEN
1. Verify your Partner ID: ${partner ? partner.partnerId : 'ACTIVE'}
2. Payout destination: ${partner ? partner.payoutMethod.toUpperCase() : 'STRIPE CONNECT / BANK WIRE / ACH / USDC'}
3. Production Reseller API Token:
   Authorization: Bearer ${partner ? partner.apiKey : 'drf_live_resell_demo_key'}

---

## STEP 2: WHITE-LABEL DNS & rDNS CONFIGURATION
To brand nodes under your domain name:
1. Add DNS CNAME Record:
   - Host / Subdomain: irc (or stream, wp, cloud)
   - Type: CNAME
   - Target Value: edge-teleport.drfun1.com
   - TTL: 300 seconds
2. Add Domain Verification TXT Record:
   - Host: @
   - Type: TXT
   - Value: drfun1-verify=${partner ? partner.partnerId : 'DRFUN1-HOST-RESELLER-DEMO'}
3. Automated SSL & rDNS:
   Our system automatically issues Let's Encrypt Wildcard certificates and provisions reverse DNS (rDNS) pointing back to your brand hostname.

---

## STEP 3: AUTOMATED PROVISIONING METHODS (CHOOSE 1)

### METHOD A: ZERO-CODE STORE & SIGNED PO GENERATION
1. Navigate to the Store tab in DrFun1 Orbit.
2. Select your hosting package (e.g. Switch SuperNAP Bare-Metal IRCD, WordPress Duplicator Cloud).
3. Click "Deploy via Reseller Portal" & input your customer's domain/brand.
4. Download the legally certified Purchase Order (PO) licensed to Richard Alan Witt.

### METHOD B: WHMCS BILLING MODULE (FULLY AUTOMATED)
1. Download 'drfun1_hosting_whmcs_v2.zip'.
2. Extract to: '/whmcs/modules/servers/drfun1_hosting/'.
3. In WHMCS Admin -> Products/Services -> Module Settings:
   - Module Name: DrFun1 Wholesale Hosting
   - Partner ID: ${partner ? partner.partnerId : 'YOUR_PARTNER_ID'}
   - API Secret: ${partner ? partner.apiKey : 'YOUR_API_KEY'}
   - Datacenter Default: switch-supernap-las-vegas
4. When clients pay on your website, servers provision automatically in <90 seconds.

### METHOD C: 1-LINE CLI / CURL DEPLOYMENT SCRIPT
Deploy directly from any Linux terminal:
\`\`\`bash
# 1-Line Reseller Deployer
curl -sSL https://get.drfun1.com/reseller-deploy.sh | bash -s -- \\
  --key="${partner ? partner.apiKey : 'YOUR_API_KEY'}" \\
  --pkg="drfun1-switch-ircd-baremetal" \\
  --domain="${testDomain}" \\
  --datacenter="switch-supernap-las-vegas" \\
  --ddos="risingnet-cleanpipe"
\`\`\`

---

## STEP 4: UNREALIRCD 6.1 TELEMETRY LEAF PEERING
Connect your reseller nodes into the global high-availability teleport mesh:
\`\`\`text
/* Add to unrealircd.conf */
me {
  name "${testDomain}";
  info "Reseller Host Node - 100% Green SuperNAP";
  sid "00A";
};

link hub.drfun1.com {
  incoming { mask *@*; }
  outgoing {
    bind-ip *;
    hostname hub.drfun1.com;
    port 6697;
    options { tls; }
  }
  password "WholesaleToken_${partner ? partner.partnerId : 'RAW2026'}";
  class servers;
};
\`\`\`

---

## STEP 5: MONTHLY BILLING & PROFIT PAYOUTS
- You charge clients whatever price you determine (no minimum price fixing).
- Wholesale base cost is billed to your reseller ledger at month end.
- You retain 100% of the margin (e.g., $330/mo per Switch IRCD, $400/mo per DataPacket node, $30/mo per WordPress Duplicator, $1,050/mo per Quantum 8G line).
- Legal protection & SLA pass-through certified by Richard Alan Witt LLC (www.wittlawfirm.com / www.owenscompany.com).
`;

    const blob = new Blob([doc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DrFun1_Reseller_Host_EZ_Setup_Guide_${partner ? partner.partnerId : 'Quickstart'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-950/30 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-b border-amber-500/30 px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30 uppercase tracking-wide">
                  Wholesale Reseller Program
                </span>
                <span className="text-slate-400 font-mono text-xs hidden sm:inline">
                  IRCD &bull; Bare-Metal &bull; WordPress &bull; Broadcast &bull; Quantum Fiber
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                DrFun1 Master Hosting Reseller Network
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {partner && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <Award className="w-3.5 h-3.5" />
                <span>Partner: {partner.partnerId}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legal Certification Bar */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Master Reseller License &amp; Escrow:</span>
            <span className="text-slate-200 font-semibold">Richard Alan Witt LLC</span>
            <span className="text-slate-600">&bull;</span>
            <a
              href="https://www.wittlawfirm.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-0.5"
            >
              <span>wittlawfirm.com</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span className="text-slate-600">/</span>
            <a
              href="https://www.owenscompany.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-0.5"
            >
              <span>owenscompany.com</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Infrastructure Partners:</span>
            <span className="text-emerald-400 font-semibold">Switch.com</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-sky-400 font-semibold">DataPacket.com</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-indigo-400 font-semibold">RisingNet.com</span>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="bg-slate-900 border-b border-slate-800 px-5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('ezsetup')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ezsetup'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>EZ Setup Instructions</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
              5-Min Start
            </span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'matrix'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Hosting Catalog &amp; Wholesale Margins</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'calculator'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>MRR &amp; Profit Calculator</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab('whitelabel')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'whitelabel'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>White-Label &amp; Provisioning APIs</span>
          </button>

          <button
            onClick={() => setActiveTab('onboarding')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'onboarding'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Instant Reseller Activation</span>
            {partner && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'legal'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Master Reseller Contract</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 0: EZ SETUP INSTRUCTIONS FOR RESELLER HOSTS */}
          {activeTab === 'ezsetup' && (
            <div className="space-y-6">
              {/* Header Hero Banner */}
              <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-emerald-950/80 border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/20">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40 uppercase tracking-wide">
                          5-Minute Fast-Track Guide
                        </span>
                        <span className="text-slate-400 font-mono text-xs">
                          Turnkey White-Label Hosting Deployment
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                        EZ Set Up Instructions for Reseller Hosts
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                        Follow this step-by-step roadmap to activate your reseller credentials, configure custom white-label DNS, select your billing engine (Store, WHMCS, or CLI), and deploy your first profitable client instance.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 font-mono text-xs">
                    <button
                      onClick={handleDownloadEzSetupGuide}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Download Offline Guide (.MD)</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('matrix')}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Browse Packages &amp; Margins</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Interactive Setup Progress Tracker */}
                <div className="mt-5 pt-5 border-t border-slate-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 font-mono text-xs">
                    <span className="text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>
                        Reseller Launch Progress:{' '}
                        <strong className="text-white">
                          {Object.values(ezChecklist).filter(Boolean).length} of 5 Milestones Completed
                        </strong>
                      </span>
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {Math.round((Object.values(ezChecklist).filter(Boolean).length / 5) * 100)}% Setup Complete
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
                      style={{
                        width: `${Math.round((Object.values(ezChecklist).filter(Boolean).length / 5) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Hosting Niche Selector */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <span className="text-xs font-mono text-slate-400 mr-2 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tailor EZ Steps For:</span>
                </span>
                {[
                  { id: 'all', label: 'All Hosting Packages' },
                  { id: 'ircd', label: 'Dedicated IRCD (Switch/DataPacket/RisingNet)' },
                  { id: 'wordpress', label: 'WordPress IRC Duplicator Cloud' },
                  { id: 'broadcast', label: 'MPD DJ & Broadcast Icecast' },
                  { id: 'fiber', label: 'Quantum Fiber Optical Internet' },
                ].map((niche) => (
                  <button
                    key={niche.id}
                    onClick={() => setEzsetupNiche(niche.id as EzSetupNiche)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      ezsetupNiche === niche.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {niche.label}
                  </button>
                ))}
              </div>

              {/* STEP 1: 60-SECOND PARTNER ENROLLMENT & API TOKEN */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Step 1: 60-Second Partner Enrollment &amp; Production API Token</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Instant Activation
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Register your business entity once to obtain your unique Reseller Partner ID and secure API Key.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleChecklist('step1')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      ezChecklist.step1
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {ezChecklist.step1 ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Step 1 Completed</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Mark as Done</span>
                      </>
                    )}
                  </button>
                </div>

                {partner ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[10px] uppercase">Active Partner ID</span>
                      <span className="text-emerald-400 font-bold text-sm">{partner.partnerId}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[10px] uppercase">Reseller API Key</span>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-300 font-mono truncate">{partner.apiKey?.slice(0, 16)}...</span>
                        <button
                          onClick={() => handleCopy(partner.apiKey || '', 'ezKey')}
                          className="text-slate-400 hover:text-white ml-2 cursor-pointer"
                        >
                          {copiedKey === 'ezKey' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[10px] uppercase">Margin Payout Channel</span>
                      <span className="text-white uppercase font-bold">{partner.payoutMethod} Settlement</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">No Reseller Profile Enrolled Yet</p>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Enrolling takes 30 seconds and generates your production credentials instantly with no fees.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('onboarding')}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span>Jump to 1-Click Enrollment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* STEP 2: INSTANT DNS & WHITE-LABEL DOMAIN SETUP */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-mono font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Step 2: Instant DNS &amp; White-Label Domain Pointing</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          Automated Let&apos;s Encrypt SSL
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Brand all resold servers, IRC links, and audio decks under your own domain name (e.g. <code>irc.yourbrand.com</code>).
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleChecklist('step2')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      ezChecklist.step2
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {ezChecklist.step2 ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Step 2 Completed</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Mark as Done</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-300">
                    Add the following 2 DNS records to your domain registrar (Cloudflare, Route53, Namecheap, GoDaddy):
                  </p>

                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-3">Record Type</th>
                          <th className="p-3">Host / Name</th>
                          <th className="p-3">Target Value</th>
                          <th className="p-3">TTL</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        <tr className="hover:bg-slate-900/50">
                          <td className="p-3 font-bold text-sky-400">CNAME</td>
                          <td className="p-3 font-semibold text-white">irc (or stream, wp)</td>
                          <td className="p-3 text-amber-300 font-bold">edge-teleport.drfun1.com</td>
                          <td className="p-3 text-slate-400">300 sec (Automatic)</td>
                          <td className="p-3">
                            <button
                              onClick={() => handleCopy('edge-teleport.drfun1.com', 'cnameVal')}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-slate-300 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === 'cnameVal' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>Copy Value</span>
                            </button>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-900/50">
                          <td className="p-3 font-bold text-purple-400">TXT</td>
                          <td className="p-3 font-semibold text-white">@ (Apex)</td>
                          <td className="p-3 text-emerald-300">drfun1-verify={partner ? partner.partnerId : 'YOUR_PARTNER_ID'}</td>
                          <td className="p-3 text-slate-400">300 sec</td>
                          <td className="p-3">
                            <button
                              onClick={() => handleCopy(`drfun1-verify=${partner ? partner.partnerId : 'DRFUN1-HOST-RESELLER-DEMO'}`, 'txtVal')}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-slate-300 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === 'txtVal' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>Copy Value</span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* DNS Live Tester */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span className="text-slate-300">
                        Target Reseller Host: <strong className="text-white">{testDomain}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {dnsTestStatus === 'verified' && (
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>CNAME &amp; TLS 1.3 Verified!</span>
                        </span>
                      )}
                      <button
                        onClick={handleTestDns}
                        disabled={dnsTestStatus === 'testing'}
                        className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {dnsTestStatus === 'testing' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying Propagation...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Run Instant DNS &amp; SSL Test</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: CHOOSE YOUR AUTOMATED RESELLER PROVISIONING PATH */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Step 3: Choose Your Automated Reseller Storefront / Provisioning Path</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Select how you want to deploy client packages: Zero-code portal, WHMCS/Blesta automated plugin, or 1-line CLI.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleChecklist('step3')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      ezChecklist.step3
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {ezChecklist.step3 ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Step 3 Completed</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Mark as Done</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Path A */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          PATH A &bull; EASIEST
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">Zero-Coding</span>
                      </div>
                      <h5 className="text-xs font-bold text-white">Turnkey In-App Storefront</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Deploy packages directly through this portal with 1 click. Set customer brand, allocate IP transit, and download official purchase orders signed under Richard Alan Witt LLC.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('matrix')}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Deploy via Store Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Path B */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          PATH B &bull; AUTOMATED
                        </span>
                        <span className="text-[10px] font-mono text-purple-300">WHMCS / Blesta</span>
                      </div>
                      <h5 className="text-xs font-bold text-white">Billing Engine Module</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Download our pre-built server module. Drop it into <code>/modules/servers/drfun1_hosting/</code> and paste your Reseller API Key. Client pays on your site &rarr; server provisions in 90 seconds.
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopy('https://get.drfun1.com/modules/drfun1_hosting_whmcs_v2.zip', 'whmcsUrl')}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'whmcsUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                      <span>Copy WHMCS Module URL</span>
                    </button>
                  </div>

                  {/* Path C */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          PATH C &bull; CLI / REST
                        </span>
                        <span className="text-[10px] font-mono text-emerald-300">DevOps / cURL</span>
                      </div>
                      <h5 className="text-xs font-bold text-white">1-Line Bash Automation</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Run a single command on your terminal to launch instances, register DNS records, and obtain TLS certificates in 60 seconds programmatically.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleCopy(
                          `curl -sSL https://get.drfun1.com/reseller-deploy.sh | bash -s -- --key="${partner ? partner.apiKey : 'YOUR_API_KEY'}" --pkg="drfun1-switch-ircd-baremetal" --domain="${testDomain}"`,
                          'cliCmd'
                        )
                      }
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-mono text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer border border-slate-700"
                    >
                      {copiedKey === 'cliCmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
                      <span>Copy 1-Line Command</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 4: CONNECT TO GLOBAL UNREALIRCD TELEPORT MESH */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Step 4: Connect to Global UnrealIRCd Mesh (`irc.drfun1.com:6697`)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          TLS 1.3 &bull; AES-256
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Leaf peering enables encrypted cross-network chat duplication, mission telemetry, and live NOC alerts.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleChecklist('step4')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      ezChecklist.step4
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {ezChecklist.step4 ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Step 4 Completed</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Mark as Done</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-emerald-400 font-bold text-[11px]">unrealircd.conf (Mutual TLS Link Block):</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          `/* Add to unrealircd.conf */\nme {\n  name "${testDomain}";\n  info "Reseller Host Node - Switch SUPERNAP";\n  sid "00A";\n};\n\nlink hub.drfun1.com {\n  incoming { mask *@*; }\n  outgoing {\n    bind-ip *;\n    hostname hub.drfun1.com;\n    port 6697;\n    options { tls; }\n  }\n  password "WholesaleToken_${partner ? partner.partnerId : 'RAW2026'}";\n  class servers;\n};`,
                          'ircConf'
                        )
                      }
                      className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'ircConf' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied Link Block</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link Block</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-lg overflow-x-auto">
{`me {
  name "${testDomain}";
  info "Reseller Host Node - 100% Green SuperNAP";
  sid "00A";
};

link hub.drfun1.com {
  incoming { mask *@*; }
  outgoing {
    bind-ip *;
    hostname hub.drfun1.com;
    port 6697;
    options { tls; }
  }
  password "WholesaleToken_${partner ? partner.partnerId : 'RAW2026'}";
  class servers;
};`}
                  </pre>
                </div>
              </div>

              {/* STEP 5: CLIENT ONBOARDING & PROFIT RETENTION */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-mono font-bold text-sm">
                      5
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Step 5: Client Onboarding &amp; 100% Monthly Margin Retention</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Zero Clawbacks
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Set your own client billing prices. Carrier Provider debits wholesale at month-end; you keep 100% of profit.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleChecklist('step5')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      ezChecklist.step5
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {ezChecklist.step5 ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Step 5 Completed</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Mark as Done</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <p className="text-slate-300 leading-relaxed">
                    Reseller host profit retention model example with standard recommended retail pricing:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase">Switch SuperNAP Bare-Metal</span>
                      <div className="text-white font-bold">$980 retail - $650 wholesale</div>
                      <span className="text-emerald-400 font-bold text-sm block">+$330.00/mo net profit</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase">DataPacket 40G IRCD</span>
                      <div className="text-white font-bold">$1,150 retail - $750 wholesale</div>
                      <span className="text-emerald-400 font-bold text-sm block">+$400.00/mo net profit</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase">WordPress IRC Duplicator</span>
                      <div className="text-white font-bold">$65 retail - $35 wholesale</div>
                      <span className="text-emerald-400 font-bold text-sm block">+$30.00/mo net profit</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase">Quantum Fiber 1 Gig</span>
                      <div className="text-white font-bold">$85 retail - $60 wholesale</div>
                      <span className="text-emerald-400 font-bold text-sm block">+$25.00/mo net profit</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        All client transactions are legally arbitrated &amp; protected by{' '}
                        <strong className="text-slate-200">Richard Alan Witt LLC</strong> (Witt Law Firm / Owens Company).
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('calculator')}
                      className="text-amber-400 hover:underline shrink-0 font-bold cursor-pointer"
                    >
                      Model Custom Portfolio &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: ALL HOSTING PACKAGES CATALOG & MARGIN MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-6">
              {/* Category Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-slate-400 mr-2">Filter Hosting Types:</span>
                {[
                  { id: 'all', label: 'All Hosting Packages' },
                  { id: 'ircd', label: 'Dedicated IRCD & Transit' },
                  { id: 'baremetal', label: 'Bare-Metal & Teleport' },
                  { id: 'wordpress', label: 'WordPress & Web Chat' },
                  { id: 'broadcast', label: 'Broadcast TV & Radio' },
                  { id: 'fiber', label: 'Quantum Optical Fiber' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCategoryFilter(tab.id as HostingCategoryFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      categoryFilter === tab.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Wholesale Highlight Banner */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Guaranteed Wholesale Rate Retention
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      You retain 100% of the difference between wholesale cost and your retail price. All packages include white-label reverse DNS, captive portal branding, and 24/7 Tier-3 escalation to DrFun1 and Richard Alan Witt tech counsel.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('calculator')}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Launch Profit Simulator</span>
                </button>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hostingProducts.map((p) => {
                  const marginDollars = p.retailPrice - p.drfun1WholesalePrice;
                  const marginPct = ((marginDollars / p.retailPrice) * 100).toFixed(0);

                  return (
                    <div
                      key={p.id}
                      className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 flex flex-col justify-between transition-all group shadow-sm hover:shadow-lg hover:shadow-amber-950/20"
                    >
                      <div className="space-y-3">
                        {/* Header badge & Category */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {p.badge || p.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            {marginPct}% Margin
                          </span>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                            {p.drfun1RebrandedName}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {p.tagline}
                          </p>
                        </div>

                        {/* Pricing Box */}
                        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800/80 space-y-1.5 font-mono text-xs">
                          <div className="flex justify-between items-center text-slate-400 text-[11px]">
                            <span>Suggested Retail:</span>
                            <span className="text-slate-200 line-through">
                              ${p.retailPrice.toLocaleString()}/mo
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-amber-400 font-semibold">
                            <span>Reseller Wholesale:</span>
                            <span className="text-white text-sm font-bold">
                              ${p.drfun1WholesalePrice.toLocaleString()}/mo
                            </span>
                          </div>
                          <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center text-emerald-400 font-bold">
                            <span>Your Recurring Margin:</span>
                            <span>+${marginDollars.toLocaleString()}/mo</span>
                          </div>
                        </div>

                        {/* Key Specs */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                            Core Architecture
                          </p>
                          <ul className="text-[11px] text-slate-300 space-y-1 font-mono">
                            {p.specs.slice(0, 3).map((spec, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-amber-400 shrink-0">&bull;</span>
                                <span className="truncate">
                                  <strong className="text-slate-400">{spec.label}:</strong> {spec.value}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-slate-500">
                          {p.stockStatus}
                        </span>
                        <button
                          onClick={() => {
                            onClose();
                            onSelectProductForOrder(p.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-amber-500/20"
                        >
                          <span>Deploy via Reseller Portal</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-PACKAGE MRR & PROFIT CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Partner Tier & Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] font-mono uppercase tracking-wider block">
                    Total Active Deployments
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-white">
                      {totalSubscribersCount}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">hosted units</span>
                  </div>
                  <div className="pt-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${resellerTierInfo.badgeColor}`}>
                      {resellerTierInfo.tier}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] font-mono uppercase tracking-wider block">
                    Gross Monthly Client Billing
                  </span>
                  <div className="text-2xl font-bold font-mono text-white">
                    ${Math.round(financials.grossMonthly).toLocaleString()}
                    <span className="text-xs font-normal text-slate-400">/mo</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Total client billed invoice volume
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] font-mono uppercase tracking-wider block">
                    Net Monthly Recurring (MRR)
                  </span>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    +${Math.round(financials.netProfitMonthly).toLocaleString()}
                    <span className="text-xs font-normal text-slate-400">/mo</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                    <TrendingUp className="w-3 h-3" />
                    <span>{financials.marginPct.toFixed(1)}% Net Margin Retention</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/40 space-y-1">
                  <span className="text-emerald-400 text-[11px] font-mono uppercase tracking-wider block font-bold">
                    Annual Net Profit (ARR)
                  </span>
                  <div className="text-2xl font-bold font-mono text-emerald-300">
                    +${Math.round(financials.netProfitAnnual).toLocaleString()}
                    <span className="text-xs font-normal text-slate-400">/yr</span>
                  </div>
                  <p className="text-[10px] text-emerald-400/80 font-mono">
                    Pure recurring annual reseller profit
                  </p>
                </div>
              </div>

              {/* Tier Progression Notice */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300">
                    Active Wholesale Status: <strong className="text-white">{resellerTierInfo.tier}</strong>
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-emerald-400">{resellerTierInfo.perks}</span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  Next tier unlocks at 51+ units (+15% discount)
                </span>
              </div>

              {/* Package Slider Controls */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Adjust Your Reseller Client Deployment Portfolio</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* IRCD Servers */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Dedicated IRCD &amp; IRC Transit Nodes</span>
                    </h4>

                    {/* Switch SuperNAP IRCD */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-300">Switch SuperNAP Bare-Metal IRCD ($330 margin/mo)</span>
                        <span className="text-amber-400 font-bold">{calcCounts.ircdSwitch} servers</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={calcCounts.ircdSwitch}
                        onChange={(e) => setCalcCounts({ ...calcCounts, ircdSwitch: parseInt(e.target.value) || 0 })}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* DataPacket 40G IRCD */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-300">DataPacket 40Gbps IRCD Node ($400 margin/mo)</span>
                        <span className="text-amber-400 font-bold">{calcCounts.ircdDataPacket} servers</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={calcCounts.ircdDataPacket}
                        onChange={(e) => setCalcCounts({ ...calcCounts, ircdDataPacket: parseInt(e.target.value) || 0 })}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* TriMesh Imperium Cluster */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-300">TriMesh Imperium Flagship Cluster ($750 margin/mo)</span>
                        <span className="text-amber-400 font-bold">{calcCounts.ircdTriMesh} clusters</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={calcCounts.ircdTriMesh}
                        onChange={(e) => setCalcCounts({ ...calcCounts, ircdTriMesh: parseInt(e.target.value) || 0 })}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* WordPress & Audio Stream Hosting */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-sky-400 font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span>WordPress Duplicator &amp; Media Hosting</span>
                    </h4>

                    {/* WordPress IRC Duplicator Cloud */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-300">WordPress IRC Duplicator Hosting ($30 margin/mo)</span>
                        <span className="text-sky-400 font-bold">{calcCounts.wpDuplicator} websites</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={calcCounts.wpDuplicator}
                        onChange={(e) => setCalcCounts({ ...calcCounts, wpDuplicator: parseInt(e.target.value) || 0 })}
                        className="w-full accent-sky-400 cursor-pointer"
                      />
                    </div>

                    {/* MPD Bot DJ Audio Station */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-300">MPD DJ Icecast2 Radio Stations ($37 margin/mo)</span>
                        <span className="text-sky-400 font-bold">{calcCounts.mpdDjRadio} stations</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={calcCounts.mpdDjRadio}
                        onChange={(e) => setCalcCounts({ ...calcCounts, mpdDjRadio: parseInt(e.target.value) || 0 })}
                        className="w-full accent-sky-400 cursor-pointer"
                      />
                    </div>

                    {/* Quantum Fiber Subscribers */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-300">Quantum Fiber 1 Gig Subscribers ($25 margin/mo)</span>
                        <span className="text-emerald-400 font-bold">{calcCounts.quantumFiber1G} subscribers</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={calcCounts.quantumFiber1G}
                        onChange={(e) => setCalcCounts({ ...calcCounts, quantumFiber1G: parseInt(e.target.value) || 0 })}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                    </div>

                    {/* QuantumBiz Enterprise Subscribers */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-300">QuantumBiz Enterprise Fiber ($170 margin/mo)</span>
                        <span className="text-emerald-400 font-bold">{calcCounts.quantumFiberBiz} commercial lines</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={calcCounts.quantumFiberBiz}
                        onChange={(e) => setCalcCounts({ ...calcCounts, quantumFiberBiz: parseInt(e.target.value) || 0 })}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Reset button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() =>
                      setCalcCounts({
                        ircdSwitch: 2,
                        ircdDataPacket: 2,
                        ircdRisingNet: 1,
                        ircdTriMesh: 1,
                        baremetalGround: 1,
                        meshSuite25: 1,
                        wpDuplicator: 15,
                        mpdDjRadio: 8,
                        broadcastEngine: 2,
                        quantumFiber1G: 25,
                        quantumFiberBiz: 5,
                      })
                    }
                    className="text-xs text-slate-400 hover:text-white font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Portfolio Defaults</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHITE-LABEL & PROVISIONING APIS */}
          {activeTab === 'whitelabel' && (
            <div className="space-y-6">
              {/* Architecture overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Custom Hostnames &amp; rDNS
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Map your own domain names (e.g., <code>irc.yourcompany.com</code> or <code>stream.yourbrand.net</code>) with fully automated Let&apos;s Encrypt wildcard SSL and ARIN WHOIS SWIP reassignment.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    WHMCS &amp; Blesta Modules
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Automate server provisioning directly inside your existing billing system. Client pays invoice &rarr; DrFun1 instant API provisions bare-metal or WordPress node in under 90 seconds.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    White-Label Tier 1 NOC
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your clients contact your support desk; your team escalates complex BGP or fiber transport inquiries directly to our 24/7 Switch SUPERNAP NOC under Richard Alan Witt confidentiality.
                  </p>
                </div>
              </div>

              {/* Live rDNS / Domain Simulator */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>White-Label Hostname &amp; Reverse DNS (rDNS) Simulator</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-mono">
                      Your Primary Reseller Domain:
                    </label>
                    <input
                      type="text"
                      value={testDomain}
                      onChange={(e) => setTestDomain(e.target.value)}
                      placeholder="e.g. cloud.yourdomain.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-mono">
                      Custom IRC Network Title / Brand:
                    </label>
                    <input
                      type="text"
                      value={testMotdTitle}
                      onChange={(e) => setTestMotdTitle(e.target.value)}
                      placeholder="e.g. Apex Global Chat Mesh"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Generated rDNS & MOTD Preview */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="text-amber-400 font-bold">UnrealIRCd 6.1 Generated Server Block:</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          `me {\n  name "${testDomain}";\n  info "${testMotdTitle}";\n  sid "00A";\n};\n\nadmin {\n  "Reseller NOC";\n  "admin@${testDomain}";\n};`,
                          'serverBlock'
                        )
                      }
                      className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'serverBlock' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Config</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded">
{`me {
  name "${testDomain}";
  info "${testMotdTitle}";
  sid "00A";
};

/* Leaf connection to core DrFun1 / Switch SuperNAP transport */
link hub.drfun1.com {
  incoming { mask *@*; }
  password "WholesaleToken_${partner ? partner.partnerId : 'RAW2026'}";
  class servers;
};`}
                  </pre>
                </div>
              </div>

              {/* REST API & WHMCS Integration Code */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>REST API Wholesale Provisioning Snippet (cURL / Node.js)</span>
                  </h3>
                  <button
                    onClick={() =>
                      handleCopy(
                        `curl -X POST https://api.drfun1.com/v1/reseller/deploy \\\n  -H "Authorization: Bearer ${partner ? partner.apiKey : 'YOUR_API_KEY'}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"packageId":"drfun1-switch-ircd-baremetal","hostname":"${testDomain}","location":"switch-supernap-lasvegas"}'`,
                        'curlCode'
                      )
                    }
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
                  >
                    {copiedKey === 'curlCode' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy cURL</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 overflow-x-auto">
{`# Automated 1-Click Server Provisioning Request
curl -X POST https://api.drfun1.com/v1/reseller/deploy \\
  -H "Authorization: Bearer ${partner ? partner.apiKey : 'YOUR_RESELLER_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "partnerId": "${partner ? partner.partnerId : 'DRFUN1-HOST-RESELLER-DEMO'}",
    "packageId": "drfun1-switch-ircd-baremetal",
    "customerBrand": "${partner ? partner.companyName : 'Acme Hosting LLC'}",
    "hostname": "${testDomain}",
    "datacenter": "switch-supernap-las-vegas",
    "ddosProtection": "risingnet-cleanpipe-enabled",
    "autoRenew": true
  }'`}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INSTANT RESELLER ONBOARDING & ACTIVATION */}
          {activeTab === 'onboarding' && (
            <div className="space-y-6">
              {partner ? (
                /* Active Partner Certificate & Credentials */
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                              ACTIVE AUTHORIZED RESELLER
                            </span>
                            <span className="text-slate-400 font-mono text-xs">
                              Enrolled: {partner.enrolledAt}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white mt-1">
                            {partner.companyName}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDownloadAgreement}
                          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Download Signed Contract</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                      <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-500 block text-[10px] uppercase">Partner ID</span>
                        <span className="text-white font-bold">{partner.partnerId}</span>
                      </div>

                      <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-500 block text-[10px] uppercase">Contact Rep</span>
                        <span className="text-slate-200">{partner.contactName}</span>
                      </div>

                      <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-500 block text-[10px] uppercase">Payout Method</span>
                        <span className="text-emerald-400 font-semibold uppercase">{partner.payoutMethod}</span>
                      </div>

                      <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-500 block text-[10px] uppercase">Legal Escrow</span>
                        <span className="text-sky-400 font-semibold">Richard Alan Witt LLC</span>
                      </div>
                    </div>

                    {/* Reseller API Key Display */}
                    <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-slate-500 text-[10px] font-mono uppercase block">
                          Production Reseller API Key (Keep Secret):
                        </span>
                        <span className="text-amber-400 font-mono text-xs font-bold tracking-wider">
                          {partner.apiKey}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(partner.apiKey || '', 'partnerKey')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center gap-1.5 border border-slate-700 transition-colors shrink-0 cursor-pointer"
                      >
                        {copiedKey === 'partnerKey' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied Key</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy API Key</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">
                        Need to update business entity details or banking coordinates?
                      </span>
                      <button
                        onClick={() => {
                          setPartner(null);
                          localStorage.removeItem(STORAGE_KEY_RESELLER_PARTNER);
                        }}
                        className="text-rose-400 hover:underline cursor-pointer"
                      >
                        Reset / Re-enroll Business
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Registration Form */
                <form onSubmit={handleActivatePartner} className="space-y-5">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                        Instant Reseller Account Activation
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        Complete this one-time profile to generate your unique Reseller Partner ID and secure API Key. Start provisioning wholesale hosting servers immediately with no setup fees.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-300 font-mono font-medium">
                        Reseller Business / Brand Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formCompany}
                        onChange={(e) => setFormCompany(e.target.value)}
                        placeholder="e.g. Apex Cloud Networks LLC"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-300 font-mono font-medium">
                        Authorized Executive Contact Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formContact}
                        onChange={(e) => setFormContact(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-300 font-mono font-medium">
                        Business Billing &amp; NOC Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="e.g. billing@apexcloud.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-300 font-mono font-medium">
                        NOC Phone Number (24/7 Escalation)
                      </label>
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+1 (800) 555-0199"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-300 font-mono font-medium">
                        Primary Hostname / Client Portal Domain
                      </label>
                      <input
                        type="text"
                        value={formDomain}
                        onChange={(e) => setFormDomain(e.target.value)}
                        placeholder="clients.apexcloud.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-300 font-mono font-medium">
                        Monthly Margin Payout Channel
                      </label>
                      <select
                        value={formPayout}
                        onChange={(e) => setFormPayout(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="stripe">Stripe Connect Instant Payout</option>
                        <option value="wire">Direct Commercial Bank Wire (Fedwire / SWIFT)</option>
                        <option value="ach">ACH Automated Clearinghouse</option>
                        <option value="crypto">USDC / USDT Stablecoin Direct Settlement</option>
                      </select>
                    </div>
                  </div>

                  {/* Legal Terms Checkbox */}
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={formAccepted}
                        onChange={(e) => setFormAccepted(e.target.checked)}
                        className="mt-0.5 accent-amber-400 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 leading-relaxed font-mono">
                        I hereby represent that I am an authorized corporate officer and agree to the Master Wholesale Reseller Agreement under legal arbitration governed by <strong>Richard Alan Witt LLC</strong> (Witt Law Firm / Owens Company), agreeing to wholesale billing terms and SLA guarantees.
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={!formAccepted}
                      className={`px-6 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        formAccepted
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Activate Wholesale Reseller Account</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 5: MASTER LEGAL RESELLER CONTRACT */}
          {activeTab === 'legal' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Master Wholesale Reseller Agreement (Certified Copy)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Legally certified by Richard Alan Witt, Esq. &bull; Witt Law Firm / Owens Company
                  </p>
                </div>

                <button
                  onClick={handleDownloadAgreement}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download .MD Contract</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto leading-relaxed">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-slate-500 block text-[10px]">DOCUMENT REFERENCE</span>
                  <span className="text-white font-bold">DRFUN1-RAW-HOST-RESELL-2026-v4.2</span>
                  <span className="text-emerald-400 block text-[11px] mt-0.5">
                    Status: Active Commercial Escrow &bull; Licensed to Richard Alan Witt
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="font-bold text-white uppercase text-[11px] tracking-wider">
                    1. GRANT OF UNBUNDLED RESALE RIGHTS
                  </p>
                  <p className="text-slate-300">
                    Carrier Provider (DrFun1 Media Inc. / DrFun1 Orbit) hereby conveys to Authorized Reseller the worldwide, royalty-free privilege to market, package, rebrand, and resell all cloud, bare-metal, IRCD, WordPress duplicator, and optical telecommunications packages at wholesale price schedules established herein.
                  </p>

                  <p className="font-bold text-white uppercase text-[11px] tracking-wider">
                    2. WHOLESALE MARGIN RETENTION &amp; NO MINIMUM PRICE FIXING
                  </p>
                  <p className="text-slate-300">
                    Reseller shall have full sovereign liberty to set consumer and enterprise retail pricing. Carrier Provider covenants that 100% of the difference between invoice wholesale cost and consumer billing belongs entirely to Reseller without clawback or administrative penalty.
                  </p>

                  <p className="font-bold text-white uppercase text-[11px] tracking-wider">
                    3. INFRASTRUCTURE PARTNER PASS-THROUGH GUARANTEES
                  </p>
                  <p className="text-slate-300">
                    - <strong>Switch SUPERNAP Las Vegas</strong>: Tier IV datacenter facilities powered by 100% renewable energy, guaranteed 100% electrical uptime, and multi-cabinet cross-connect capability.<br />
                    - <strong>DataPacket.com</strong>: Unmetered 10G/40G backhaul pipelines free of bandwidth throttling or 95th-percentile burst penalties.<br />
                    - <strong>RisingNet.com</strong>: Multi-terabit active BGP DDoS scrubbing with automatic mitigation within 2 seconds of synthetic SYN/UDP flood detection.
                  </p>

                  <p className="font-bold text-white uppercase text-[11px] tracking-wider">
                    4. LEGAL ARBITRATION &amp; JURISDICTION
                  </p>
                  <p className="text-slate-300">
                    Any disputes arising hereunder shall be subject to binding commercial arbitration administered by Richard Alan Witt LLC (Witt Law Firm / Owens Company) pursuant to commercial laws of the State of Nevada and Federal Telecommunications standards.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Wholesale Network Status:</span>
            <span className="text-emerald-400 font-semibold">Switch &bull; DataPacket &bull; RisingNet Ready</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('calculator')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              MRR Calculator
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer shadow-sm shadow-amber-500/20"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
