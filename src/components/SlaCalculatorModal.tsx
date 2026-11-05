/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Interactive SLA Uptime Credit Calculator Modal for Satellite Carriers
 */

import React, { useState, useMemo } from 'react';
import { SatelliteCompany } from '../types/satellite';
import { 
  SlaTierPreset, 
  OutageCauseType, 
  SlaCreditCalculation 
} from '../types/slaCalculator';
import { 
  SLA_TARGET_OPTIONS, 
  OUTAGE_CAUSE_OPTIONS, 
  OUTAGE_SCENARIO_PRESETS,
  estimateNominalMonthlySpend,
  calculateSlaCreditResult,
  MINUTES_IN_BILLING_MONTH
} from '../data/slaCalculatorData';
import { 
  X, 
  Calculator, 
  ShieldCheck, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  Copy, 
  Check, 
  Mail, 
  Sparkles, 
  AlertTriangle, 
  FileText, 
  Layers, 
  Server, 
  TrendingDown, 
  ArrowRight,
  Info
} from 'lucide-react';

interface SlaCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: SatelliteCompany[];
  initialSelectedCompany?: SatelliteCompany | null;
  onOpenRfq?: (company: SatelliteCompany) => void;
}

export const SlaCalculatorModal: React.FC<SlaCalculatorModalProps> = ({
  isOpen,
  onClose,
  companies,
  initialSelectedCompany,
  onOpenRfq,
}) => {
  // Currently selected company
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
    return initialSelectedCompany?.id || companies[0]?.id || '';
  });

  const selectedCompany = useMemo(() => {
    return companies.find((c) => c.id === selectedCompanyId) || companies[0] || null;
  }, [companies, selectedCompanyId]);

  // Form Inputs
  const [monthlySpend, setMonthlySpend] = useState<number>(() => {
    return selectedCompany ? estimateNominalMonthlySpend(selectedCompany) : 15000;
  });

  const [targetTier, setTargetTier] = useState<SlaTierPreset>('99.9');
  const [downtimeHours, setDowntimeHours] = useState<number>(1);
  const [downtimeMinutes, setDowntimeMinutes] = useState<number>(30);
  const [outageCause, setOutageCause] = useState<OutageCauseType>('teleport_backhaul');
  const [incidentNotes, setIncidentNotes] = useState<string>('Unscheduled carrier transponder attenuation & secondary gateway failover delay.');
  const [copiedClaim, setCopiedClaim] = useState(false);

  // When selected company changes, update spend recommendation if default
  const handleSelectCompany = (id: string) => {
    setSelectedCompanyId(id);
    const comp = companies.find((c) => c.id === id);
    if (comp) {
      setMonthlySpend(estimateNominalMonthlySpend(comp));
    }
  };

  // Target SLA Option
  const targetOption = useMemo(() => {
    return SLA_TARGET_OPTIONS.find((t) => t.tier === targetTier) || SLA_TARGET_OPTIONS[1];
  }, [targetTier]);

  // Total downtime in minutes
  const totalDowntimeMinutes = useMemo(() => {
    return Math.max(0, downtimeHours * 60 + downtimeMinutes);
  }, [downtimeHours, downtimeMinutes]);

  // Calculation Result
  const calculation: SlaCreditCalculation = useMemo(() => {
    return calculateSlaCreditResult(
      selectedCompany,
      monthlySpend,
      targetOption.uptimePercent,
      totalDowntimeMinutes,
      outageCause,
      incidentNotes
    );
  }, [selectedCompany, monthlySpend, targetOption, totalDowntimeMinutes, outageCause, incidentNotes]);

  // Handle Preset Outage Scenarios
  const handleApplyPreset = (presetId: string) => {
    const preset = OUTAGE_SCENARIO_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setDowntimeHours(preset.downtimeHours);
      setDowntimeMinutes(preset.downtimeMinutes);
      setOutageCause(preset.cause);
      setIncidentNotes(preset.description);
    }
  };

  // Copy Claim Summary to Clipboard
  const handleCopyClaim = () => {
    const summaryText = `=====================================================
SATELLITE CARRIER SLA UPTIME CREDIT CLAIM TICKET
Claim Reference: ${calculation.claimId}
Date Generated: ${new Date().toLocaleDateString()}
Carrier: ${selectedCompany?.name || 'Commercial Satellite Carrier'} (${selectedCompany?.legalName || ''})
Orbit Regime: ${selectedCompany?.orbitType || 'GEO / LEO'}
Primary Contact: ${selectedCompany?.contacts[0]?.email || 'noc@carrier.net'}
License / Teleport Core: Switch SUPERNAP NV (FRN 0034981290)
-----------------------------------------------------
SLA TARGET AVAILABILITY: ${calculation.targetUptimePercent}% (${calculation.allowedDowntimeMinutes} mins allowed/mo)
ACTUAL RECORDED DOWNTIME: ${calculation.actualDowntimeMinutes} mins (${Math.floor(calculation.actualDowntimeMinutes / 60)}h ${Math.round(calculation.actualDowntimeMinutes % 60)}m)
ACTUAL CALCULATED UPTIME: ${calculation.actualUptimePercent}%
OUTAGE ROOT CAUSE: ${OUTAGE_CAUSE_OPTIONS.find(c => c.id === calculation.outageCause)?.label}
INCIDENT NOTES: ${calculation.incidentNotes}
-----------------------------------------------------
MONTHLY CONTRACT VALUE: $${calculation.monthlySpendUsd.toLocaleString()}
SLA BREACH STATUS: ${calculation.isBreached ? 'BREACHED' : 'COMPLIANT'}
EXCESS OUTAGE DURATION: ${calculation.excessDowntimeMinutes} minutes
CREDIT TIER ASSESSED: ${calculation.creditPercent}%
ESTIMATED INVOICE CREDIT: -$${calculation.creditAmountUsd.toLocaleString()}
ADJUSTED NET PAYABLE: $${calculation.netInvoiceDueUsd.toLocaleString()}
=====================================================`;

    navigator.clipboard.writeText(summaryText);
    setCopiedClaim(true);
    setTimeout(() => setCopiedClaim(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* ========================================================
            MODAL HEADER
            ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Satellite Carrier SLA Uptime Credit Calculator
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ITU / FCC Standard
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Model transponder outages, calculate tiered contract service credits, and dispatch formal carrier rebate claims.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close SLA Calculator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================
            MODAL BODY (2-COLUMN LAYOUT)
            ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Top Compliance Ribbon */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified Benchmark: <strong>Switch SUPERNAP Nevada Tier IV Gold &bull; FCC FRN 0034981290</strong></span>
            </div>
            <span className="text-slate-500">Billing Cycle: 30 Days (43,200 min)</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: INPUT CONTROLS (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* 1. Target Satellite Carrier Selector */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>1. Select Satellite Carrier / Operator</span>
                  {selectedCompany && (
                    <span className="text-sky-400 font-normal lowercase text-[11px]">
                      {selectedCompany.headquarters.country} &bull; {selectedCompany.orbitType}
                    </span>
                  )}
                </label>

                <select
                  value={selectedCompanyId}
                  onChange={(e) => handleSelectCompany(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.orbitType} ({c.altitudeKm}) — {c.latencyMs}
                    </option>
                  ))}
                </select>

                {selectedCompany && (
                  <div className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-400">
                    <span className="truncate max-w-[280px]">
                      Desk: <strong className="text-slate-200">{selectedCompany.contacts[0]?.department || 'Carrier NOC'}</strong> ({selectedCompany.contacts[0]?.email || 'noc@carrier.net'})
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      CIR SLA Enabled
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Monthly Service Contract Spend */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Monthly Contract Spend (USD)</span>
                  </label>
                  <span className="text-slate-400">Recurring Billing Rate</span>
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-mono text-sm font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-emerald-300 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Quick Spend Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                  {[2500, 5000, 10000, 15000, 25000, 45000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setMonthlySpend(amt)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition cursor-pointer ${
                        monthlySpend === amt
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      ${(amt / 1000).toFixed(amt % 1000 === 0 ? 0 : 1)}k/mo
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. SLA Target Availability Commitment */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>3. Contracted Uptime Target</span>
                  </label>
                  <span className="text-sky-400 font-bold">
                    Max Allowed: {targetOption.allowedDowntimeMinutes} mins/mo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SLA_TARGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.tier}
                      type="button"
                      onClick={() => setTargetTier(opt.tier)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        targetTier === opt.tier
                          ? 'bg-sky-500/20 border-sky-500/60 text-sky-200 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{opt.uptimePercent}%</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          &le; {opt.allowedDowntimeMinutes} min
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        {opt.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Recorded Downtime & Outage Scenarios */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>4. Recorded Unscheduled Downtime</span>
                  </label>
                  <span className="text-amber-400 font-bold font-mono">
                    Total: {totalDowntimeMinutes} mins ({downtimeHours}h {downtimeMinutes}m)
                  </span>
                </div>

                {/* Hours and Minutes Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                      Outage Hours ({downtimeHours}h)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="48"
                      value={downtimeHours}
                      onChange={(e) => setDowntimeHours(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                      Outage Minutes ({downtimeMinutes}m)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="59"
                      value={downtimeMinutes}
                      onChange={(e) => setDowntimeMinutes(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Quick Outage Scenario Presets */}
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">
                    Sample Industry Outage Presets:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {OUTAGE_SCENARIO_PRESETS.map((sc) => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => handleApplyPreset(sc.id)}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] font-mono transition cursor-pointer"
                        title={sc.description}
                      >
                        {sc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Outage Cause Classification */}
                <div className="pt-2 border-t border-slate-800/60 space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase block">
                    Root Outage Cause Classification:
                  </label>
                  <select
                    value={outageCause}
                    onChange={(e) => setOutageCause(e.target.value as OutageCauseType)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
                  >
                    {OUTAGE_CAUSE_OPTIONS.map((cause) => (
                      <option key={cause.id} value={cause.id}>
                        [{cause.category}] {cause.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: CALCULATION RESULTS & CLAIM TICKET (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Primary Credit Assessment Banner */}
              <div className={`p-4 rounded-xl border space-y-3 transition-all ${
                calculation.creditPercent === 100
                  ? 'bg-rose-950/60 border-rose-500/60 text-rose-200 shadow-xl'
                  : calculation.isBreached
                  ? 'bg-amber-950/60 border-amber-500/60 text-amber-200 shadow-xl'
                  : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 shadow-xl'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {calculation.creditPercent === 100 ? (
                      <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
                    ) : calculation.isBreached ? (
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    )}
                    <span className="font-bold text-xs font-mono uppercase tracking-wider">
                      {calculation.creditPercent === 100
                        ? 'Catastrophic Outage (<98%)'
                        : calculation.isBreached
                        ? 'SLA Breach Confirmed'
                        : 'SLA Target Compliant'}
                    </span>
                  </div>

                  <span className="text-xl font-mono font-black">
                    {calculation.creditPercent}% Credit
                  </span>
                </div>

                {/* Progress Visualizer: Actual vs Target */}
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span>Monthly Availability</span>
                    <span className="font-bold text-white">
                      {calculation.actualUptimePercent}% / {calculation.targetUptimePercent}% Target
                    </span>
                  </div>

                  {/* Dual Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        calculation.actualUptimePercent < 98.0
                          ? 'bg-rose-500'
                          : calculation.isBreached
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, calculation.actualUptimePercent))}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Allowed: {calculation.allowedDowntimeMinutes} min</span>
                    <span>Actual: {calculation.actualDowntimeMinutes} min</span>
                  </div>
                </div>

                {/* Financial Summary Highlight */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Base Monthly Invoice:</span>
                    <span className="text-slate-200">${calculation.monthlySpendUsd.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-rose-400 font-bold">
                    <span>Service Credit Deducted:</span>
                    <span>-${calculation.creditAmountUsd.toLocaleString()}</span>
                  </div>

                  <div className="border-t border-slate-800 pt-1.5 flex items-center justify-between text-sm font-black text-white">
                    <span>Adjusted Invoice Due:</span>
                    <span className="text-emerald-400">${calculation.netInvoiceDueUsd.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Formal Carrier SLA Claim Ticket */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-white uppercase text-[11px]">
                      Carrier SLA Rebate Claim Ticket
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-400 font-bold">
                    {calculation.claimId}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Carrier NOC:</span>
                    <span className="font-bold text-white">{selectedCompany?.name || 'Selected Carrier'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Excess Downtime:</span>
                    <span className="text-amber-400 font-bold">{calculation.excessDowntimeMinutes} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Credit Schedule:</span>
                    <span>Tiered Section 4.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rebate Payable:</span>
                    <span className="text-emerald-400 font-bold">${calculation.creditAmountUsd.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions: Copy & RFQ Dispatch */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleCopyClaim}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs"
                  >
                    {copiedClaim ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Claim Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-sky-400" />
                        <span>Copy Claim</span>
                      </>
                    )}
                  </button>

                  {selectedCompany && onOpenRfq && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenRfq(selectedCompany);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs shadow-md"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Dispatch RFQ</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Standard ITU/FCC Satellite Credit Schedule Note */}
              <div className="p-3 bg-slate-950/50 border border-slate-800/60 rounded-xl space-y-1 text-[11px] text-slate-400 font-sans">
                <span className="text-slate-300 font-bold block flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  Satellite Industry Standard Tier Schedule:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-400 font-mono">
                  <li>&lt; Target down to 99.5%: <strong>10% invoice credit</strong></li>
                  <li>99.0% &ndash; 99.49%: <strong>25% invoice credit</strong></li>
                  <li>98.0% &ndash; 98.99%: <strong>50% invoice credit</strong></li>
                  <li>&lt; 98.0% availability: <strong>100% full invoice credit</strong></li>
                </ul>
              </div>

            </div>

          </div>

        </div>

        {/* ========================================================
            MODAL FOOTER
            ======================================================== */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry Core: <strong>Switch SUPERNAP Las Vegas</strong> &bull; Cert: <strong>RAW-SATCOM-2026-LIC-0881</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition cursor-pointer"
          >
            Close Calculator
          </button>
        </div>

      </div>
    </div>
  );
};
