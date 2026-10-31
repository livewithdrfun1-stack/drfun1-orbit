import React, { useState, useMemo } from 'react';
import { 
  X, 
  Zap, 
  CheckCircle2, 
  DollarSign, 
  Users, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Sliders, 
  Search, 
  ShoppingBag,
  FileText
} from 'lucide-react';

interface QuantumFiberResellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProductForOrder?: (productId: string) => void;
}

export const QuantumFiberResellerModal: React.FC<QuantumFiberResellerModalProps> = ({
  isOpen,
  onClose,
  onSelectProductForOrder,
}) => {
  if (!isOpen) return null;

  // Active Tab
  const [activeTab, setActiveTab] = useState<'calculator' | 'plans' | 'branding' | 'coverage' | 'agreement'>('calculator');

  // Calculator subscriber numbers
  const [sub500M, setSub500M] = useState<number>(35);
  const [sub1G, setSub1G] = useState<number>(60);
  const [sub2G, setSub2G] = useState<number>(20);
  const [sub3G, setSub3G] = useState<number>(8);
  const [sub8G, setSub8G] = useState<number>(2);
  const [subBiz, setSubBiz] = useState<number>(5);

  // Coverage check state
  const [checkAddress, setCheckAddress] = useState<string>('777 Las Vegas Blvd S, Las Vegas, NV 89101');
  const [qualificationStatus, setQualificationStatus] = useState<{
    tested: boolean;
    available: boolean;
    tech: string;
    maxSpeed: string;
    latency: string;
  }>({
    tested: true,
    available: true,
    tech: '10G XGS-PON Fiber to the Premises (FTTP)',
    maxSpeed: 'Up to 8,000 Mbps Symmetrical',
    latency: '1.8 ms to Switch SUPERNAP',
  });

  // Calculate totals
  const totalSubscribers = sub500M + sub1G + sub2G + sub3G + sub8G + subBiz;

  // Gross Revenue (Retail collected from subscribers)
  const monthlyGrossRevenue = useMemo(() => {
    return (
      sub500M * 60 +
      sub1G * 85 +
      sub2G * 135 +
      sub3G * 195 +
      sub8G * 3200 +
      subBiz * 550
    );
  }, [sub500M, sub1G, sub2G, sub3G, sub8G, subBiz]);

  // Wholesale Cost (DrFun1 wholesale cost paid to carrier)
  const monthlyWholesaleCost = useMemo(() => {
    return (
      sub500M * 40 +
      sub1G * 60 +
      sub2G * 95 +
      sub3G * 140 +
      sub8G * 2150 +
      subBiz * 380
    );
  }, [sub500M, sub1G, sub2G, sub3G, sub8G, subBiz]);

  // Reseller Net Monthly Recurring Profit Margin
  const monthlyRecurringProfit = monthlyGrossRevenue - monthlyWholesaleCost;
  const annualRecurringProfit = monthlyRecurringProfit * 12;

  // Test address handler
  const handleCheckAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAddress.trim()) return;
    setQualificationStatus({
      tested: true,
      available: true,
      tech: '10G XGS-PON Ultra-Broadband Optical',
      maxSpeed: '8,000 Mbps Symmetrical 1:1',
      latency: '2.1 ms to Switch SUPERNAP Radome Meet-Me Room',
    });
  };

  // Download Reseller Agreement
  const handleDownloadAgreement = () => {
    const agreementText = `# QUANTUM FIBER & DRFUN1 CO-BRANDED MASTER RESELLER AGREEMENT
LICENSED TO: RICHARD ALAN WITT (THE LAW OFFICE OF RICHARD A. WITT LLC)
CARRIER PARTNER: QUANTUM FIBER (LUMEN TECHNOLOGIES) & DRFUN1 MEDIA INC.
DATA CENTER HUB: SWITCH SUPERNAP LAS VEGAS (WWW.SWITCH.COM)
TRANSIT: RISINGNET IP TRANSIT AS53767 (WWW.RISINGNET.COM)
DATE OF COMMISSIONING: ${new Date().toLocaleDateString()}

1. APPOINTMENT & EXCLUSIVE MARGINS
The authorized reseller is granted non-exclusive wholesale distribution rights to co-brand and resell Quantum Fiber residential, commercial, and multi-gigabit fiber internet products.

2. WHOLESALE RATE SHEET & RESELLER COMMISSIONS:
- QuantumSpeed 500M: Wholesale $40/mo | Retail $60/mo | Net Reseller Margin: $20/mo
- QuantumSpeed 1 Gig: Wholesale $60/mo | Retail $85/mo | Net Reseller Margin: $25/mo
- QuantumSpeed 2 Gig: Wholesale $95/mo | Retail $135/mo | Net Reseller Margin: $40/mo
- QuantumSpeed 3 Gig: Wholesale $140/mo | Retail $195/mo | Net Reseller Margin: $55/mo
- QuantumSpeed 8 Gig: Wholesale $2,150/mo | Retail $3,200/mo | Net Reseller Margin: $1,050/mo
- QuantumBiz Enterprise (/29 IPs + SLA): Wholesale $380/mo | Retail $550/mo | Net Reseller Margin: $170/mo

3. VALUE-ADD TELEMETRY & MEDIA INTEGRATION:
All provisioned Quantum SmartNID terminals include embedded UnrealIRCd leaf agents connecting to irc.drfun1.com:6697, automated BGP routing into Switch SuperNAP Las Vegas, and DrFun1 Media online radio & television subscriber streaming privileges.

4. ESCROW & GOVERNING LAW:
Governed under the laws of the State of Nevada with dispute resolution and compliance overseen by The Law Office of Richard A. Witt LLC (www.wittlawfirm.com).
`;
    const blob = new Blob([agreementText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quantum-Fiber-DrFun1-Master-Reseller-Agreement.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
    >
      <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl relative flex flex-col my-auto cursor-default text-slate-100">
        
        {/* Header Ribbon */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 border-b border-cyan-500/30 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30 uppercase tracking-wider">
                  Official Co-Branded Reseller Program
                </span>
                <span className="text-slate-500 font-mono text-xs hidden sm:inline">
                  Quantum Fiber &bull; Lumen Technologies &bull; DrFun1 Media
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                Resell Quantum Fiber Co-Branded Internet
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Generate high-margin recurring wholesale revenue selling 500M, 1G, 2G, 3G, and 8G symmetrical fiber with SmartNID WiFi 7 and Switch SuperNAP core teleport peering.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 border-b border-slate-800 px-5 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar font-mono text-xs">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-3 px-3.5 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Margin &amp; Profit Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`py-3 px-3.5 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'plans'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>All Reseller Fiber Tiers</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`py-3 px-3.5 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'branding'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>White-Label &amp; Co-Brand Kit</span>
          </button>

          <button
            onClick={() => setActiveTab('coverage')}
            className={`py-3 px-3.5 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'coverage'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Address Qualification</span>
          </button>

          <button
            onClick={() => setActiveTab('agreement')}
            className={`py-3 px-3.5 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'agreement'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Legal Agreement (Witt Law)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[65vh] space-y-6">
          
          {/* TAB 1: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Total Subscribers</span>
                  <div className="text-2xl font-black text-white mt-1 flex items-center gap-1.5">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <span>{totalSubscribers.toLocaleString()} lines</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Active recurring customer base</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Gross Monthly Billing</span>
                  <div className="text-2xl font-black text-cyan-400 mt-1">
                    ${monthlyGrossRevenue.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Retail collected per month</span>
                </div>

                <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 shadow-lg shadow-emerald-500/10">
                  <span className="text-[11px] text-emerald-400 uppercase tracking-wider block font-bold">Net Monthly Profit</span>
                  <div className="text-2xl font-black text-emerald-300 mt-1">
                    +${monthlyRecurringProfit.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/mo</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 mt-1 block">Recurring wholesale margin</span>
                </div>

                <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-4 shadow-lg shadow-purple-500/10">
                  <span className="text-[11px] text-purple-400 uppercase tracking-wider block font-bold">Annual Reseller Profit</span>
                  <div className="text-2xl font-black text-purple-300 mt-1">
                    +${annualRecurringProfit.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/yr</span>
                  </div>
                  <span className="text-[10px] text-purple-400 mt-1 block">12-Month net earnings</span>
                </div>
              </div>

              {/* Interactive Volume Modeling Sliders */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-white text-sm">Model Your Reseller Subscriber Volume</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Adjust subscribers per speed tier:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
                  {/* 500M */}
                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">QuantumSpeed 500M Symmetrical</span>
                      <span className="text-emerald-400 font-bold">$20.00 margin / line</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Retail: $60/mo | Wholesale: $40/mo</span>
                      <strong className="text-white text-sm">{sub500M} subs</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={sub500M}
                      onChange={(e) => setSub500M(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* 1 Gig */}
                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">QuantumSpeed 1 Gig Symmetrical</span>
                      <span className="text-emerald-400 font-bold">$25.00 margin / line</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Retail: $85/mo | Wholesale: $60/mo</span>
                      <strong className="text-white text-sm">{sub1G} subs</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={sub1G}
                      onChange={(e) => setSub1G(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* 2 Gig */}
                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">QuantumSpeed 2 Gig Multi-Gig</span>
                      <span className="text-emerald-400 font-bold">$40.00 margin / line</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Retail: $135/mo | Wholesale: $95/mo</span>
                      <strong className="text-white text-sm">{sub2G} subs</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sub2G}
                      onChange={(e) => setSub2G(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* 3 Gig */}
                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">QuantumSpeed 3 Gig Hyper-Speed</span>
                      <span className="text-emerald-400 font-bold">$55.00 margin / line</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Retail: $195/mo | Wholesale: $140/mo</span>
                      <strong className="text-white text-sm">{sub3G} subs</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={sub3G}
                      onChange={(e) => setSub3G(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* 8 Gig Enterprise */}
                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">QuantumSpeed 8 Gig Dedicated Pipeline</span>
                      <span className="text-purple-400 font-bold">$1,050.00 margin / line</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Retail: $3,200/mo | Wholesale: $2,150/mo</span>
                      <strong className="text-white text-sm">{sub8G} enterprise lines</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={sub8G}
                      onChange={(e) => setSub8G(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* QuantumBiz Commercial */}
                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">QuantumBiz (/29 Static IPs + SLA)</span>
                      <span className="text-amber-400 font-bold">$170.00 margin / line</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Retail: $550/mo | Wholesale: $380/mo</span>
                      <strong className="text-white text-sm">{subBiz} commercial lines</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={subBiz}
                      onChange={(e) => setSubBiz(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-4 flex-wrap text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Turnkey billing &bull; Free SmartNID WiFi 7 hardware &bull; Richard Alan Witt master contract protection</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('agreement')}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    View Reseller Master Contract ➔
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ALL PLANS LISTING */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 font-mono">
                All 6 co-branded Quantum Fiber internet products available for instant wholesale commission ordering:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plan 500M */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                        RESIDENTIAL / REMOTE WORK
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">QuantumSpeed 500M Symmetrical</h4>
                      <p className="text-xs text-slate-400">500 Mbps Down / 500 Mbps Up &bull; SmartNID WiFi 7</p>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-lg font-extrabold text-white">$60<span className="text-xs text-slate-400">/mo</span></div>
                      <div className="text-xs text-emerald-400 font-bold">Wholesale: $40/mo</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 font-mono">
                    <div>&bull; Monthly Margin: <strong className="text-emerald-400">+$20.00 / mo recurring</strong></div>
                    <div>&bull; Included: Quantum SmartNID + 360 WiFi 7 gateway</div>
                    <div>&bull; Free installation &amp; unlimited data</div>
                  </div>
                  <button
                    onClick={() => {
                      if (onSelectProductForOrder) onSelectProductForOrder('drfun1-quantum-fiber-500m');
                      onClose();
                    }}
                    className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order 500M Plan (Wholesale $40)</span>
                  </button>
                </div>

                {/* Plan 1 Gig */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 hover:border-cyan-400 transition-all space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 font-mono text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg">
                    MOST POPULAR RESELLER TIER
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                        GIGABIT STREAMING &amp; GAMING
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">QuantumSpeed 1 Gig Symmetrical</h4>
                      <p className="text-xs text-slate-400">1,000 Mbps Down / 1,000 Mbps Up &bull; Multi-Gig WiFi 7</p>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-lg font-extrabold text-white">$85<span className="text-xs text-slate-400">/mo</span></div>
                      <div className="text-xs text-emerald-400 font-bold">Wholesale: $60/mo</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 font-mono">
                    <div>&bull; Monthly Margin: <strong className="text-emerald-400">+$25.00 / mo recurring</strong></div>
                    <div>&bull; Free 360 WiFi 7 hardware &bull; Sub-4ms ping</div>
                    <div>&bull; DrFun1 24/7 TV &amp; Radio streaming app bundle</div>
                  </div>
                  <button
                    onClick={() => {
                      if (onSelectProductForOrder) onSelectProductForOrder('drfun1-quantum-fiber-1g');
                      onClose();
                    }}
                    className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order 1 Gig Plan (Wholesale $60)</span>
                  </button>
                </div>

                {/* Plan 2 Gig */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                        PRO STUDIO &amp; CREATORS
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">QuantumSpeed 2 Gig Multi-Gigabit</h4>
                      <p className="text-xs text-slate-400">2,000 Mbps Down / 2,000 Mbps Up &bull; 10G SFP+ Port</p>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-lg font-extrabold text-white">$135<span className="text-xs text-slate-400">/mo</span></div>
                      <div className="text-xs text-emerald-400 font-bold">Wholesale: $95/mo</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 font-mono">
                    <div>&bull; Monthly Margin: <strong className="text-emerald-400">+$40.00 / mo recurring</strong></div>
                    <div>&bull; 10G LAN interface for workstation and NAS arrays</div>
                    <div>&bull; Direct Switch SUPERNAP core interconnect</div>
                  </div>
                  <button
                    onClick={() => {
                      if (onSelectProductForOrder) onSelectProductForOrder('drfun1-quantum-fiber-2g');
                      onClose();
                    }}
                    className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order 2 Gig Plan (Wholesale $95)</span>
                  </button>
                </div>

                {/* Plan 3 Gig */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                        MAX RESIDENTIAL SPEED
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">QuantumSpeed 3 Gig Hyper-Speed</h4>
                      <p className="text-xs text-slate-400">3,000 Mbps Down / 3,000 Mbps Up &bull; Dual 10G Handoffs</p>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-lg font-extrabold text-white">$195<span className="text-xs text-slate-400">/mo</span></div>
                      <div className="text-xs text-emerald-400 font-bold">Wholesale: $140/mo</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 font-mono">
                    <div>&bull; Monthly Margin: <strong className="text-emerald-400">+$55.00 / mo recurring</strong></div>
                    <div>&bull; Included 2x WiFi 7 mesh extender pods</div>
                    <div>&bull; RisingNet DDoS protection included</div>
                  </div>
                  <button
                    onClick={() => {
                      if (onSelectProductForOrder) onSelectProductForOrder('drfun1-quantum-fiber-3g');
                      onClose();
                    }}
                    className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order 3 Gig Plan (Wholesale $140)</span>
                  </button>
                </div>

                {/* Plan 8 Gig */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 hover:border-purple-400 transition-all space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                        CARRIER CLASS DEDICATED
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">QuantumSpeed 8G Symmetrical HyperFiber</h4>
                      <p className="text-xs text-slate-400">8,000 Mbps Symmetrical &bull; Teleport Core Trunk</p>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-lg font-extrabold text-white">$3,200<span className="text-xs text-slate-400">/mo</span></div>
                      <div className="text-xs text-purple-400 font-bold">Wholesale: $2,150/mo</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 font-mono">
                    <div>&bull; Monthly Margin: <strong className="text-purple-400">+$1,050.00 / mo recurring</strong></div>
                    <div>&bull; Spliced directly into Switch SUPERNAP Las Vegas 100G radome meet-me room</div>
                    <div>&bull; RisingNet 1.46 Tbps optical ring protection</div>
                  </div>
                  <button
                    onClick={() => {
                      if (onSelectProductForOrder) onSelectProductForOrder('drfun1-quantum-fiber-8g');
                      onClose();
                    }}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order 8G Plan (Wholesale $2,150)</span>
                  </button>
                </div>

                {/* QuantumBiz Commercial */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 hover:border-amber-400 transition-all space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                        COMMERCIAL SLA + STATIC IP
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">QuantumBiz Enterprise Fiber</h4>
                      <p className="text-xs text-slate-400">Routed /29 IPv4 Block &bull; 99.999% SLA &bull; 4-Hr MTTR</p>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-lg font-extrabold text-white">$550<span className="text-xs text-slate-400">/mo</span></div>
                      <div className="text-xs text-amber-400 font-bold">Wholesale: $380/mo</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 font-mono">
                    <div>&bull; Monthly Margin: <strong className="text-amber-400">+$170.00 / mo recurring</strong></div>
                    <div>&bull; 5 Usable static public IPv4 addresses for servers &amp; VPNs</div>
                    <div>&bull; Dedicated business account manager &amp; priority repair</div>
                  </div>
                  <button
                    onClick={() => {
                      if (onSelectProductForOrder) onSelectProductForOrder('drfun1-quantum-fiber-biz');
                      onClose();
                    }}
                    className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order QuantumBiz (Wholesale $380)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHITE-LABEL BRANDING */}
          {activeTab === 'branding' && (
            <div className="space-y-5">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-white text-base">Your Co-Branded Customer Experience</h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  As an authorized reseller, you can co-brand the entire customer journey under your brand name, co-badged with DrFun1 and Quantum Fiber:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-cyan-400 font-bold block mb-1">1. Hardware Co-Badge</span>
                    <p className="text-slate-400 text-[11px]">
                      SmartNID optical terminal and WiFi 7 routers delivered with custom co-branded faceplate badges bearing your business logo and DrFun1 Orbit link.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-purple-400 font-bold block mb-1">2. Captive Portal &amp; Apps</span>
                    <p className="text-slate-400 text-[11px]">
                      Subscribers receive access to the DrFun1 media portal with 24/7 TV &amp; Radio streaming channels and integrated IRC customer care.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-emerald-400 font-bold block mb-1">3. Automated Wholesale Billing</span>
                    <p className="text-slate-400 text-[11px]">
                      Bill your customers retail or bundle with your managed services while paying net wholesale rates to DrFun1 with zero setup fees.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COVERAGE CHECK */}
          {activeTab === 'coverage' && (
            <div className="space-y-5 font-mono text-xs">
              <form onSubmit={handleCheckAddress} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <label className="text-slate-300 font-bold block">
                  Check Service Qualification &amp; Fiber Splicing Feasibility:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={checkAddress}
                    onChange={(e) => setCheckAddress(e.target.value)}
                    placeholder="Enter customer street address, city, state, zip..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Search className="w-4 h-4" />
                    <span>Check Service</span>
                  </button>
                </div>
              </form>

              {qualificationStatus.tested && (
                <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Service Qualified: Ready for Instant Wholesale Provisioning!</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Access Technology:</span>
                      <strong>{qualificationStatus.tech}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Maximum Speed:</span>
                      <strong className="text-cyan-400">{qualificationStatus.maxSpeed}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Latency Profile:</span>
                      <strong className="text-emerald-400">{qualificationStatus.latency}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: LEGAL AGREEMENT */}
          {activeTab === 'agreement' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-white text-sm">
                      Master Reseller Agreement &bull; Certified Legal Protection
                    </h3>
                  </div>
                  <button
                    onClick={handleDownloadAgreement}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download Agreement (.md)</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-2">
                  <p>
                    <strong className="text-white">Legal Counsel &amp; Escrow:</strong> All wholesale fiber agreements, subscriber terms of service, and SLA performance guarantees are governed under master licenses issued to <strong className="text-emerald-400">Richard Alan Witt</strong> (The Law Office of Richard A. Witt LLC, <a href="https://www.wittlawfirm.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">www.wittlawfirm.com</a>).
                  </p>
                  <p>
                    <strong className="text-white">Protected Margins:</strong> Wholesale prices are locked with guaranteed 30-day net commission payouts. Zero minimum commitment required to begin reselling.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Reseller Program Status: Open for Immediate Dealer Onboarding</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAgreement}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download Contract</span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Zap className="w-4 h-4" />
              <span>View Plans &amp; Order</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
