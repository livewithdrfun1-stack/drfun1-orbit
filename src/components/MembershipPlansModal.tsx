import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Check,
  Sparkles,
  Zap,
  Radio,
  Server,
  Crown,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Copy,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MembershipPlan, MembershipTierId, BillingCycle, UserMembershipState } from '../types/membership';
import { MEMBERSHIP_PLANS } from '../data/membershipData';

interface MembershipPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  userMembership: UserMembershipState;
  onUpdateMembership: (updated: UserMembershipState) => void;
  onOpenLegalCenter?: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const MembershipPlansModal: React.FC<MembershipPlansModalProps> = ({
  isOpen,
  onClose,
  userMembership,
  onUpdateMembership,
  onOpenLegalCenter,
  onNavigateToTab
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(userMembership.cycle || 'monthly');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const handleCopyMemberId = () => {
    navigator.clipboard.writeText(userMembership.memberId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSelectTier = (plan: MembershipPlan) => {
    if (plan.id === userMembership.tierId && billingCycle === userMembership.cycle) {
      return;
    }

    const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + (billingCycle === 'annual' ? 1 : 0));
    if (billingCycle === 'monthly') {
      nextYear.setMonth(nextYear.getMonth() + 1);
    }
    const renewalDate = nextYear.toISOString().split('T')[0];

    const newInvoice = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      date: today,
      planName: `${plan.name} (${billingCycle.toUpperCase()})`,
      amount: price,
      cycle: billingCycle,
      status: 'Paid' as const,
      invoicePdfRef: `RAW-ITT-${userMembership.memberId}-${Date.now().toString().slice(-4)}.pdf`
    };

    const updatedState: UserMembershipState = {
      ...userMembership,
      tierId: plan.id,
      cycle: billingCycle,
      renewalDate,
      invoices: [newInvoice, ...userMembership.invoices],
      reputationPoints: userMembership.reputationPoints + (plan.id === 'cadet_free' ? 10 : 100)
    };

    onUpdateMembership(updatedState);
    setSuccessMsg(`Successfully activated ${plan.name} (${billingCycle})! Member status refreshed.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const currentPlan = MEMBERSHIP_PLANS.find(p => p.id === userMembership.tierId) || MEMBERSHIP_PLANS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[94vh] flex flex-col bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">DRFUN1 Broadcaster Memberships</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Tiers & Subscriptions
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Unlock 24/7 TV/Radio station creator tools, high-capacity ZNC bouncers, DataPacket discounts, and SCTE-35 ad-split payouts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-6 space-y-6 flex-1">
          
          {/* Active Membership Status Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0">
                <Radio className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Active Plan</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded border ${currentPlan.badgeClass}`}>
                    {currentPlan.name}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">({userMembership.cycle} billing)</span>
                </div>
                <div className="text-sm text-slate-200 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Callsign: <strong className="text-white font-mono">{userMembership.callsign}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span>Member ID: <strong className="text-white font-mono">{userMembership.memberId}</strong></span>
                  <button
                    onClick={handleCopyMemberId}
                    className="inline-flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 ml-1"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId ? 'Copied' : 'Copy'}</span>
                  </button>
                  <span className="text-slate-600">•</span>
                  <span>Next Renewal: <span className="text-slate-300">{userMembership.renewalDate}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right text-xs text-slate-400 hidden sm:block">
                <div>ZNC Buffer: <strong className="text-cyan-300 font-mono">{currentPlan.zncBufferLines} lines</strong></div>
                <div>Hosting Discount: <strong className="text-amber-300 font-mono">{currentPlan.hostingDiscountPercent}% OFF</strong></div>
              </div>
              <button
                onClick={() => {
                  if (onNavigateToTab) {
                    onNavigateToTab('community');
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition flex items-center space-x-1.5"
              >
                <span>View Community Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Billing Cycle Switch */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
            <div>
              <h3 className="text-base font-semibold text-white">Choose Your Broadcast Tier</h3>
              <p className="text-xs text-slate-400">Cancel or switch tiers anytime with zero setup penalty.</p>
            </div>

            <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-extrabold rounded bg-emerald-500 text-black">
                  Save 17% (2 Mo Free)
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MEMBERSHIP_PLANS.map((plan) => {
              const isCurrent = userMembership.tierId === plan.id;
              const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
              const perMonthDisplay = billingCycle === 'annual' && plan.annualPrice > 0 
                ? (plan.annualPrice / 12).toFixed(2) 
                : plan.monthlyPrice.toString();

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-xl border bg-slate-900/40 p-5 transition-all duration-200 ${plan.borderClass} ${
                    plan.isPopular ? 'ring-1 ring-cyan-500/50' : ''
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-[11px] font-extrabold uppercase tracking-wider text-slate-950 shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${plan.badgeClass}`}>
                        {plan.badge}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Current Tier
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-bold text-white tracking-tight">{plan.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{plan.tagline}</p>

                    {/* Price */}
                    <div className="my-4 pt-3 border-t border-slate-800">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-extrabold text-white">
                          ${billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-xs text-slate-400">
                          /{billingCycle === 'annual' ? 'yr' : 'mo'}
                        </span>
                      </div>
                      {billingCycle === 'annual' && plan.annualPrice > 0 && (
                        <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">
                          ≈ ${perMonthDisplay}/mo billed yearly
                        </div>
                      )}
                    </div>

                    {/* Quick Telemetry Spec */}
                    <div className="space-y-1.5 py-3 mb-3 border-y border-slate-800/80 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">ZNC Bouncer:</span>
                        <span className="font-semibold text-cyan-300">{plan.zncBufferLines.toLocaleString()} lines</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Broadcast Stations:</span>
                        <span className="font-semibold text-slate-200">
                          {plan.maxBroadcastChannels >= 999 ? 'Unlimited' : `${plan.maxBroadcastChannels} active`}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">DataPacket Discount:</span>
                        <span className="font-semibold text-amber-300">
                          {plan.hostingDiscountPercent > 0 ? `${plan.hostingDiscountPercent}% OFF` : 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">SCTE-35 Ad Revenue:</span>
                        <span className="font-semibold text-purple-300">
                          {plan.adRevenueSharePercent > 0 ? `${plan.adRevenueSharePercent}% Creator` : '0%'}
                        </span>
                      </div>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2 text-xs text-slate-300 my-4">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleSelectTier(plan)}
                      disabled={isCurrent && userMembership.cycle === billingCycle}
                      className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 ${
                        isCurrent && userMembership.cycle === billingCycle
                          ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                          : plan.isPopular
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold shadow-cyan-500/25'
                          : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white border border-slate-700'
                      }`}
                    >
                      {isCurrent && userMembership.cycle === billingCycle ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Active Plan</span>
                        </>
                      ) : isCurrent ? (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Switch to {billingCycle}</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Select {plan.name.split(' ')[0]}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legal and Escrow Protection Note */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-slate-200 font-semibold flex items-center space-x-2">
                  <span>Certified Broadcaster Protection & Regulatory Escrow</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-amber-400 font-mono">FRN #0034981290</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Subscriptions are protected under certified escrow by The Law Office of Richard A. Witt LLC (<a href="https://www.wittlawfirm.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">www.wittlawfirm.com</a>). 30-day money-back guarantee on all hosting and broadcaster services.
                </p>
              </div>
            </div>

            {onOpenLegalCenter && (
              <button
                onClick={() => {
                  onOpenLegalCenter();
                  onClose();
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium underline shrink-0 whitespace-nowrap"
              >
                Review Legal Terms & Escrow
              </button>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div>
            Need custom orbital transponders or enterprise C-Band leasing? Contact teleport NOC at <span className="text-slate-200 font-mono">noc@drfun1.com</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
