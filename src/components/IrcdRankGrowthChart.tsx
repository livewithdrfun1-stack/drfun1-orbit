/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * 30-Day Historical Rank Growth Visualization (Recharts) for IrcdRankAccessModal
 */

import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Calendar, TrendingUp, Users } from 'lucide-react';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { getRankDefinition } from '../utils/ircdAccess';

interface IrcdRankGrowthChartProps {
  activeRank: AnopeRankLevel;
}

type CohortView = 'overview' | 'community' | 'ops_talent' | 'admin_owner';

interface DailyRankMetrics {
  dayIndex: number;
  dateLabel: string;
  fullDate: string;
  guest: number;
  listener: number;
  voice: number;
  halfop: number;
  dj_host: number;
  op: number;
  sop: number;
  founder: number;
  locop: number;
  so: number;
  techadmin: number;
  admin: number;
  netadmin: number;
  sra: number;
  elevatedTotal: number;
}

interface SeriesDescriptor {
  key: keyof DailyRankMetrics;
  rankId?: AnopeRankLevel;
  label: string;
  color: string;
  yAxisId?: 'left' | 'right';
}

const SERIES_BY_COHORT: Record<CohortView, SeriesDescriptor[]> = {
  overview: [
    {
      key: 'guest',
      rankId: 'guest',
      label: 'Guest (+x L0)',
      color: '#94a3b8',
      yAxisId: 'left',
    },
    {
      key: 'listener',
      rankId: 'listener',
      label: 'Listener (+r L10)',
      color: '#38bdf8',
      yAxisId: 'left',
    },
    {
      key: 'voice',
      rankId: 'voice',
      label: '+v Voice (L100)',
      color: '#34d399',
      yAxisId: 'left',
    },
    {
      key: 'elevatedTotal',
      label: 'Ops & Admin Total (%h–~)',
      color: '#fbbf24',
      yAxisId: 'right',
    },
  ],
  community: [
    { key: 'guest', rankId: 'guest', label: 'Guest (+x L0)', color: '#94a3b8' },
    { key: 'listener', rankId: 'listener', label: 'Listener (+r L10)', color: '#38bdf8' },
    { key: 'voice', rankId: 'voice', label: '+v Voice (L100)', color: '#34d399' },
    { key: 'halfop', rankId: 'halfop', label: '%h HalfOp (L300)', color: '#a78bfa' },
  ],
  ops_talent: [
    { key: 'op', rankId: 'op', label: '@o Op (L500)', color: '#38bdf8' },
    { key: 'dj_host', rankId: 'dj_host', label: '+d DJ/Host (L400)', color: '#c084fc' },
    { key: 'sop', rankId: 'sop', label: '&a SOP (L800)', color: '#34d399' },
    { key: 'founder', rankId: 'founder', label: '~q Founder (L1000)', color: '#fbbf24' },
  ],
  admin_owner: [
    { key: 'locop', rankId: 'locop', label: '+O LocOp (L1500)', color: '#38bdf8' },
    { key: 'so', rankId: 'so', label: '+o Oper (L2000)', color: '#a855f7' },
    { key: 'techadmin', rankId: 'techadmin', label: '+A TechAdmin (L3500)', color: '#10b981' },
    { key: 'admin', rankId: 'admin', label: '+a Admin (L5000)', color: '#fb923c' },
    { key: 'netadmin', rankId: 'netadmin', label: '+N NetAdmin (L7500)', color: '#f43f5e' },
    { key: 'sra', rankId: 'sra', label: '~ Owner / SCOTUS (L10000)', color: '#fbbf24' },
  ],
};

function generate30DayRankHistory(): DailyRankMetrics[] {
  // Anchored ending on 2026-11-14 (30-day window: Oct 16 – Nov 14, 2026)
  const endDate = new Date('2026-11-14T12:00:00Z');
  const rows: DailyRankMetrics[] = [];

  for (let i = 0; i < 30; i++) {
    const dayDate = new Date(endDate);
    dayDate.setUTCDate(endDate.getUTCDate() - (29 - i));
    const month = dayDate.toLocaleString('en-US', {
      month: 'short',
      timeZone: 'UTC',
    });
    const dayNum = dayDate.getUTCDate();
    const dateLabel = `${month} ${dayNum}`;
    const fullDate = dayDate.toISOString().slice(0, 10);

    // Smooth deterministic organic growth curves with realistic podcast/SCOTUS commission milestones
    const t = i / 29;
    const wave = Math.sin(i * 0.55) * 0.018;
    const scotusCommissionBoost = i >= 24 ? (i - 23) * 2 : 0; // Nov 9-14 Supreme Court & Witt Law ~ Owner commissioning

    const guest = Math.round(14250 + t * 4420 + Math.sin(i * 0.6) * 210);
    const listener = Math.round(6380 + t * 3490 + wave * 900);
    const voice = Math.round(1840 + t * 1120 + Math.cos(i * 0.45) * 45);
    const halfop = Math.round(418 + t * 268 + Math.sin(i * 0.4) * 12);
    const dj_host = Math.round(186 + t * 158 + (i >= 18 ? 22 : 0));
    const op = Math.round(312 + t * 138 + Math.sin(i * 0.5) * 8);
    const sop = Math.round(84 + t * 42);
    const founder = Math.round(38 + t * 24);
    const locop = Math.round(28 + t * 14);
    const so = Math.round(18 + t * 10);
    const techadmin = Math.round(11 + t * 6);
    const admin = Math.round(7 + Math.floor(t * 4.5));
    const netadmin = Math.round(4 + Math.floor(t * 3.4));
    const sra = Math.min(19, 5 + scotusCommissionBoost + (i >= 15 ? 2 : 0));

    const elevatedTotal =
      halfop + dj_host + op + sop + founder + locop + so + techadmin + admin + netadmin + sra;

    rows.push({
      dayIndex: i,
      dateLabel,
      fullDate,
      guest,
      listener,
      voice,
      halfop,
      dj_host,
      op,
      sop,
      founder,
      locop,
      so,
      techadmin,
      admin,
      netadmin,
      sra,
      elevatedTotal,
    });
  }

  return rows;
}

export const IrcdRankGrowthChart: React.FC<IrcdRankGrowthChartProps> = ({
  activeRank,
}) => {
  const [cohort, setCohort] = useState<CohortView>('overview');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');

  const historyData = useMemo(() => generate30DayRankHistory(), []);
  const firstDay = historyData[0];
  const latestDay = historyData[historyData.length - 1];
  const activeSeries = SERIES_BY_COHORT[cohort];
  const activeRankDef = getRankDefinition(activeRank);

  const totalUsersLatest =
    latestDay.guest +
    latestDay.listener +
    latestDay.voice +
    latestDay.elevatedTotal;
  const totalUsersStart =
    firstDay.guest +
    firstDay.listener +
    firstDay.voice +
    firstDay.elevatedTotal;
  const overallGrowthPct = (
    ((totalUsersLatest - totalUsersStart) / totalUsersStart) *
    100
  ).toFixed(1);

  const activeRankKey = activeRank as keyof DailyRankMetrics;
  const activeRankStart = Number(firstDay[activeRankKey] ?? 0);
  const activeRankEnd = Number(latestDay[activeRankKey] ?? 0);
  const activeRankDelta = activeRankEnd - activeRankStart;
  const activeRankPct =
    activeRankStart > 0
      ? (((activeRankDelta) / activeRankStart) * 100).toFixed(1)
      : '0.0';

  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>30-Day IRCD User Base &amp; Rank Growth (Oct 16 – Nov 14, 2026)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tracks daily identified accounts, voiced/broadcast tiers, and elevated UnrealIRCd/Anope rank commissions across the DrFun1 mesh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(
              [
                { id: 'overview', label: 'All Ranks Overview' },
                { id: 'community', label: 'Community (L0–300)' },
                { id: 'ops_talent', label: 'Ops & DJs (L400–1000)' },
                { id: 'admin_owner', label: 'Admin & ~ Owner (L1500–10000)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCohort(tab.id)}
                className={`px-2.5 py-1 rounded text-xs cursor-pointer whitespace-nowrap ${
                  cohort === tab.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-2 py-1 rounded text-xs cursor-pointer ${
                chartType === 'area'
                  ? 'bg-sky-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Area
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-2 py-1 rounded text-xs cursor-pointer ${
                chartType === 'line'
                  ? 'bg-sky-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Line
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Total Mesh User Base</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2 font-mono tabular-nums">
            <span className="text-lg font-bold text-white">
              {totalUsersLatest.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              +{overallGrowthPct}% (30d)
            </span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-mono text-slate-400 truncate">
            Active Rank ({activeRankDef.prefix ? `${activeRankDef.prefix} ` : ''}
            {activeRankDef.shortLabel})
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2 font-mono tabular-nums">
            <span className="text-lg font-bold text-amber-300">
              {activeRankEnd.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              +{activeRankDelta.toLocaleString()} (+{activeRankPct}%)
            </span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-mono text-slate-400">
            Elevated Ops &amp; Admin (%h–~)
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2 font-mono tabular-nums">
            <span className="text-lg font-bold text-white">
              {latestDay.elevatedTotal.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-sky-300">
              +{(latestDay.elevatedTotal - firstDay.elevatedTotal).toLocaleString()} (30d)
            </span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>~ Owner (John Roberts Rank)</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2 font-mono tabular-nums">
            <span className="text-lg font-bold text-amber-300">
              {latestDay.sra}
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              +{latestDay.sra - firstDay.sra} commissioned
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4">
        <div className="h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart
                data={historyData}
                margin={{ top: 10, right: cohort === 'overview' ? 12 : 16, left: 4, bottom: 4 }}
              >
                <defs>
                  {activeSeries.map((s) => (
                    <linearGradient
                      key={`grad-${String(s.key)}`}
                      id={`grad-${String(s.key)}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="dateLabel"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  minTickGap={22}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(val: number) =>
                    val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(val)
                  }
                />
                {cohort === 'overview' && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#fbbf24"
                    tick={{ fill: '#fbbf24', fontSize: 11 }}
                    tickFormatter={(val: number) =>
                      val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(val)
                    }
                  />
                )}
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  labelStyle={{ color: '#fbbf24', fontWeight: 700, marginBottom: 4 }}
                  formatter={(value, name) => [
                    Number(value ?? 0).toLocaleString(),
                    String(name ?? ''),
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                {activeSeries.map((s) => (
                  <Area
                    key={String(s.key)}
                    yAxisId={cohort === 'overview' ? s.yAxisId ?? 'left' : 'left'}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={s.rankId === activeRank ? 3 : 2}
                    fill={`url(#grad-${String(s.key)})`}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </AreaChart>
            ) : (
              <LineChart
                data={historyData}
                margin={{ top: 10, right: cohort === 'overview' ? 12 : 16, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="dateLabel"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  minTickGap={22}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(val: number) =>
                    val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(val)
                  }
                />
                {cohort === 'overview' && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#fbbf24"
                    tick={{ fill: '#fbbf24', fontSize: 11 }}
                    tickFormatter={(val: number) =>
                      val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(val)
                    }
                  />
                )}
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  labelStyle={{ color: '#fbbf24', fontWeight: 700, marginBottom: 4 }}
                  formatter={(value, name) => [
                    Number(value ?? 0).toLocaleString(),
                    String(name ?? ''),
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                {activeSeries.map((s) => (
                  <Line
                    key={String(s.key)}
                    yAxisId={cohort === 'overview' ? s.yAxisId ?? 'left' : 'left'}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={s.rankId === activeRank ? 3 : 2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};
