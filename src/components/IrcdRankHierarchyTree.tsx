/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Interactive D3 Hierarchical Tree Visualization for the 14 IRCD Rank Levels (Guest -> ~ Owner)
 */

import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import {
  ArrowRight,
  Crown,
  GitBranch,
  Key,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { getRankDefinition } from '../utils/ircdAccess';
import {
  getAccessibleFeaturesForRank,
  getExactUnlockFeaturesForRank,
  IRCD_FEATURE_ACCESS_CONFIG,
} from '../config/ircdFeatureAccessConfig';

interface IrcdRankHierarchyTreeProps {
  activeRank: AnopeRankLevel;
  onRankChange: (rank: AnopeRankLevel) => void;
}

type TreeOrientation = 'escalation' | 'command';
type RankBranchTrack =
  | 'Public Entry'
  | 'Channel Moderation'
  | 'Broadcast & Talent'
  | 'Channel Governance'
  | 'IRCd Infrastructure'
  | 'Supreme Root';

interface RankTreeDatum {
  rankId: AnopeRankLevel;
  track: RankBranchTrack;
  trackNote: string;
  children?: RankTreeDatum[];
}

const TRACK_STYLES: Record<
  RankBranchTrack,
  { stroke: string; pill: string; accent: string }
> = {
  'Public Entry': {
    stroke: '#64748b',
    pill: 'bg-slate-800 text-slate-300 border-slate-700',
    accent: '#94a3b8',
  },
  'Channel Moderation': {
    stroke: '#38bdf8',
    pill: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    accent: '#38bdf8',
  },
  'Broadcast & Talent': {
    stroke: '#a855f7',
    pill: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    accent: '#c084fc',
  },
  'Channel Governance': {
    stroke: '#10b981',
    pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    accent: '#34d399',
  },
  'IRCd Infrastructure': {
    stroke: '#f97316',
    pill: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    accent: '#fb923c',
  },
  'Supreme Root': {
    stroke: '#fbbf24',
    pill: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
    accent: '#fbbf24',
  },
};

const ESCALATION_TREE_DATA: RankTreeDatum = {
  rankId: 'guest',
  track: 'Public Entry',
  trackNote: 'Unregistered +x Cloak Entry',
  children: [
    {
      rankId: 'listener',
      track: 'Public Entry',
      trackNote: 'NickServ +r Identified',
      children: [
        {
          rankId: 'voice',
          track: 'Channel Moderation',
          trackNote: '+v Moderated Speech',
          children: [
            {
              rankId: 'halfop',
              track: 'Channel Moderation',
              trackNote: '%h Kick & Drafts',
              children: [
                {
                  rankId: 'dj_host',
                  track: 'Broadcast & Talent',
                  trackNote: '+d Podcast & SIP Host',
                },
                {
                  rankId: 'op',
                  track: 'Broadcast & Talent',
                  trackNote: '@o Ops+ Threshold',
                  children: [
                    {
                      rankId: 'sop',
                      track: 'Channel Governance',
                      trackNote: '&a Duplicator & AOP',
                      children: [
                        {
                          rankId: 'founder',
                          track: 'Channel Governance',
                          trackNote: '~q DAI & MLOCK',
                        },
                      ],
                    },
                    {
                      rankId: 'locop',
                      track: 'IRCd Infrastructure',
                      trackNote: '+O 1,034-Leaf Telemetry',
                      children: [
                        {
                          rankId: 'so',
                          track: 'IRCd Infrastructure',
                          trackNote: '+o /SYNCALL & SCOTUS',
                          children: [
                            {
                              rankId: 'techadmin',
                              track: 'IRCd Infrastructure',
                              trackNote: '+A HOPM & ZNC :5000',
                              children: [
                                {
                                  rankId: 'admin',
                                  track: 'IRCd Infrastructure',
                                  trackNote: '+a /REHASH & G:Line',
                                  children: [
                                    {
                                      rankId: 'netadmin',
                                      track: 'IRCd Infrastructure',
                                      trackNote: '+N Quad-Hub Core',
                                      children: [
                                        {
                                          rankId: 'sra',
                                          track: 'Supreme Root',
                                          trackNote: '~ John Roberts Rank',
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const COMMAND_TREE_DATA: RankTreeDatum = {
  rankId: 'sra',
  track: 'Supreme Root',
  trackNote: '~ John Roberts & Witt Law',
  children: [
    {
      rankId: 'netadmin',
      track: 'IRCd Infrastructure',
      trackNote: '+N Quad-Hub Routing',
      children: [
        {
          rankId: 'admin',
          track: 'IRCd Infrastructure',
          trackNote: '+a /REHASH & K:Lines',
          children: [
            {
              rankId: 'techadmin',
              track: 'IRCd Infrastructure',
              trackNote: '+A HOPM & ZNC Cluster',
              children: [
                {
                  rankId: 'so',
                  track: 'IRCd Infrastructure',
                  trackNote: '+o /SYNCALL & SCOTUS',
                  children: [
                    {
                      rankId: 'locop',
                      track: 'IRCd Infrastructure',
                      trackNote: '+O Telemetry Monitor',
                      children: [
                        {
                          rankId: 'founder',
                          track: 'Channel Governance',
                          trackNote: '~q Channel Root',
                          children: [
                            {
                              rankId: 'sop',
                              track: 'Channel Governance',
                              trackNote: '&a Duplicator SuperOp',
                            },
                          ],
                        },
                        {
                          rankId: 'op',
                          track: 'Broadcast & Talent',
                          trackNote: '@o Live DJ Ops+',
                          children: [
                            {
                              rankId: 'dj_host',
                              track: 'Broadcast & Talent',
                              trackNote: '+d SCOTUS Host',
                            },
                            {
                              rankId: 'halfop',
                              track: 'Channel Moderation',
                              trackNote: '%h Channel HalfOp',
                              children: [
                                {
                                  rankId: 'voice',
                                  track: 'Channel Moderation',
                                  trackNote: '+v Voiced Speaker',
                                  children: [
                                    {
                                      rankId: 'listener',
                                      track: 'Public Entry',
                                      trackNote: '+r Registered User',
                                      children: [
                                        {
                                          rankId: 'guest',
                                          track: 'Public Entry',
                                          trackNote: '+x Public Visitor',
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const SVG_WIDTH = 1520;
const SVG_HEIGHT = 360;
const NODE_WIDTH = 108;
const NODE_HEIGHT = 64;
const MARGIN = { top: 44, right: 88, bottom: 44, left: 78 };

export const IrcdRankHierarchyTree: React.FC<IrcdRankHierarchyTreeProps> = ({
  activeRank,
  onRankChange,
}) => {
  const [orientation, setOrientation] = useState<TreeOrientation>('escalation');
  const [inspectedRank, setInspectedRank] = useState<AnopeRankLevel | null>(null);

  const focusedRankId = inspectedRank ?? activeRank;

  const { nodes, links, crossLinks, nodeById } = useMemo(() => {
    const sourceData =
      orientation === 'escalation' ? ESCALATION_TREE_DATA : COMMAND_TREE_DATA;
    const root = d3.hierarchy<RankTreeDatum>(sourceData);
    const innerWidth = SVG_WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

    const treeLayout = d3
      .tree<RankTreeDatum>()
      .size([innerHeight, innerWidth])
      .separation((a, b) => (a.parent === b.parent ? 1.15 : 1.35));

    const laidOut = treeLayout(root);
    const positionedNodes = laidOut.descendants().map((d) => ({
      ...d,
      px: MARGIN.left + d.y,
      py: MARGIN.top + d.x,
    }));

    const lookup = new Map<
      AnopeRankLevel,
      (typeof positionedNodes)[number]
    >();
    positionedNodes.forEach((n) => lookup.set(n.data.rankId, n));

    const pathGenerator = d3
      .linkHorizontal<
        { source: { px: number; py: number }; target: { px: number; py: number } },
        { px: number; py: number }
      >()
      .x((d) => d.px)
      .y((d) => d.py);

    const computedLinks = laidOut.links().map((link) => {
      const s = lookup.get(link.source.data.rankId)!;
      const t = lookup.get(link.target.data.rankId)!;
      return {
        id: `${link.source.data.rankId}->${link.target.data.rankId}`,
        sourceRank: link.source.data.rankId,
        targetRank: link.target.data.rankId,
        targetTrack: link.target.data.track,
        d:
          pathGenerator({
            source: { px: s.px + NODE_WIDTH / 2, py: s.py },
            target: { px: t.px - NODE_WIDTH / 2, py: t.py },
          }) || '',
      };
    });

    // Numeric continuity bridge connectors between parallel branch endpoints
    const bridgePairs: Array<{ from: AnopeRankLevel; to: AnopeRankLevel; label: string }> =
      orientation === 'escalation'
        ? [
            { from: 'dj_host', to: 'op', label: 'Lvl 400 -> 500' },
            { from: 'founder', to: 'locop', label: 'Lvl 1000 -> 1500' },
          ]
        : [{ from: 'sop', to: 'op', label: 'Lvl 800 -> 500' }];

    const computedCrossLinks = bridgePairs
      .map((pair) => {
        const fromNode = lookup.get(pair.from);
        const toNode = lookup.get(pair.to);
        if (!fromNode || !toNode) return null;
        return {
          id: `bridge-${pair.from}-${pair.to}`,
          fromRank: pair.from,
          toRank: pair.to,
          label: pair.label,
          d:
            pathGenerator({
              source: { px: fromNode.px, py: fromNode.py + NODE_HEIGHT / 2 },
              target: { px: toNode.px, py: toNode.py - NODE_HEIGHT / 2 },
            }) || '',
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    return {
      nodes: positionedNodes,
      links: computedLinks,
      crossLinks: computedCrossLinks,
      nodeById: lookup,
    };
  }, [orientation]);

  const activeRankDef = getRankDefinition(activeRank);
  const focusedNode = nodeById.get(focusedRankId);
  const focusedRankDef = getRankDefinition(focusedRankId);
  const focusedFeatures = getAccessibleFeaturesForRank(focusedRankId);
  const focusedNewFeatures = getExactUnlockFeaturesForRank(focusedRankId);
  const focusedParent = focusedNode?.parent?.data.rankId
    ? getRankDefinition(focusedNode.parent.data.rankId)
    : null;
  const focusedChildren = (focusedNode?.children ?? []).map((c) =>
    getRankDefinition(c.data.rankId)
  );

  return (
    <section className="space-y-3">
      {/* Header & Orientation Switch */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-amber-400" />
            <span>
              IRCD 14-Rank Hierarchical Tree (Guest Level 0 ↔ ~ Owner Level 10,000)
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive D3 hierarchy depicting authority branches from public entry through channel governance and network administration to ~ Owner (John Roberts Rank). Click any node to switch your active rank.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setOrientation('escalation')}
            className={`px-2.5 py-1.5 rounded text-xs cursor-pointer whitespace-nowrap ${
              orientation === 'escalation'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Escalation: Guest → ~ Owner
          </button>
          <button
            type="button"
            onClick={() => setOrientation('command')}
            className={`px-2.5 py-1.5 rounded text-xs cursor-pointer whitespace-nowrap ${
              orientation === 'command'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Command: ~ Owner → Guest
          </button>
        </div>
      </div>

      {/* Track Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono">
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(TRACK_STYLES) as RankBranchTrack[]).map((track) => (
            <span
              key={track}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${TRACK_STYLES[track].pill}`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: TRACK_STYLES[track].accent }}
              />
              <span>{track}</span>
            </span>
          ))}
        </div>
        <span className="text-slate-400">
          Solid curves = hierarchy lineage · Dashed = cross-track numeric step
        </span>
      </div>

      {/* SVG Tree Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="min-w-[1060px] w-full h-auto block select-none"
            role="img"
            aria-label="14-level IRCD rank hierarchy tree from Guest to Owner"
          >
            <defs>
              <pattern
                id="ircdTreeGrid"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 32 0 L 0 0 0 32"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="1"
                />
              </pattern>
            </defs>

            <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#ircdTreeGrid)" />

            {/* Column Stage Labels */}
            <text
              x={MARGIN.left}
              y={22}
              textAnchor="middle"
              className="fill-slate-400 font-mono text-[11px]"
            >
              {orientation === 'escalation'
                ? 'ROOT ENTRY (LVL 0)'
                : 'SUPREME AUTHORITY (LVL 10,000)'}
            </text>
            <text
              x={SVG_WIDTH - MARGIN.right}
              y={22}
              textAnchor="middle"
              className="fill-amber-300 font-mono text-[11px] font-bold"
            >
              {orientation === 'escalation'
                ? 'JOHN ROBERTS ~ OWNER (LVL 10,000)'
                : 'PUBLIC VISITOR (LVL 0)'}
            </text>

            {/* Primary Hierarchy Links */}
            {links.map((link) => {
              const targetDef = getRankDefinition(link.targetRank);
              const isInheritedEdge =
                activeRankDef.accessLevel >= targetDef.accessLevel;
              const isFocusedEdge =
                link.sourceRank === focusedRankId ||
                link.targetRank === focusedRankId;
              const trackColor = TRACK_STYLES[link.targetTrack].accent;

              return (
                <path
                  key={link.id}
                  d={link.d}
                  fill="none"
                  stroke={
                    isFocusedEdge
                      ? '#fbbf24'
                      : isInheritedEdge
                      ? trackColor
                      : '#334155'
                  }
                  strokeWidth={isFocusedEdge ? 2.8 : isInheritedEdge ? 2.1 : 1.4}
                  strokeOpacity={isInheritedEdge || isFocusedEdge ? 0.92 : 0.45}
                />
              );
            })}

            {/* Dashed Cross-Track Progression Connectors */}
            {crossLinks.map((bridge) => (
              <path
                key={bridge.id}
                d={bridge.d}
                fill="none"
                stroke="#fbbf24"
                strokeWidth={1.4}
                strokeDasharray="4 4"
                strokeOpacity={0.55}
              />
            ))}

            {/* 14 Interactive Rank Nodes */}
            {nodes.map((node) => {
              const rankDef = getRankDefinition(node.data.rankId);
              const isActive = rankDef.id === activeRank;
              const isFocused = rankDef.id === focusedRankId;
              const isInherited =
                activeRankDef.accessLevel >= rankDef.accessLevel;
              const featCount = getAccessibleFeaturesForRank(rankDef.id).length;
              const trackStyle = TRACK_STYLES[node.data.track];

              const boxX = node.px - NODE_WIDTH / 2;
              const boxY = node.py - NODE_HEIGHT / 2;

              return (
                <g
                  key={rankDef.id}
                  transform={`translate(${boxX}, ${boxY})`}
                  onClick={() => {
                    onRankChange(rankDef.id);
                    setInspectedRank(rankDef.id);
                  }}
                  onMouseEnter={() => setInspectedRank(rankDef.id)}
                  onMouseLeave={() => setInspectedRank(null)}
                  className="cursor-pointer"
                >
                  {/* Active Halo */}
                  {(isActive || isFocused) && (
                    <rect
                      x={-3}
                      y={-3}
                      width={NODE_WIDTH + 6}
                      height={NODE_HEIGHT + 6}
                      rx={13}
                      fill="none"
                      stroke={isActive ? '#fbbf24' : '#38bdf8'}
                      strokeWidth={isActive ? 2 : 1.5}
                      strokeOpacity={0.85}
                    />
                  )}

                  {/* Node Card Body */}
                  <rect
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx={10}
                    fill={
                      isActive
                        ? '#1e1b18'
                        : isInherited
                        ? '#091526'
                        : '#0b1120'
                    }
                    stroke={
                      isActive
                        ? '#fbbf24'
                        : isInherited
                        ? trackStyle.accent
                        : '#1e293b'
                    }
                    strokeWidth={isActive ? 2 : 1.3}
                  />

                  {/* Top Accent Strip */}
                  <rect
                    x={1}
                    y={1}
                    width={NODE_WIDTH - 2}
                    height={5}
                    rx={4}
                    fill={
                      isActive
                        ? '#fbbf24'
                        : isInherited
                        ? trackStyle.accent
                        : '#334155'
                    }
                    fillOpacity={isInherited || isActive ? 0.9 : 0.45}
                  />

                  {/* Prefix + Short Label */}
                  <text
                    x={NODE_WIDTH / 2}
                    y={23}
                    textAnchor="middle"
                    className={`font-sans text-[11px] font-bold ${
                      isActive
                        ? 'fill-amber-300'
                        : isInherited
                        ? 'fill-white'
                        : 'fill-slate-400'
                    }`}
                  >
                    {rankDef.prefix ? `${rankDef.prefix} ` : ''}
                    {rankDef.shortLabel.replace(/\s*\(.*?\)/g, '')}
                  </text>

                  {/* Access Level & Modes */}
                  <text
                    x={NODE_WIDTH / 2}
                    y={38}
                    textAnchor="middle"
                    className="fill-slate-300 font-mono text-[9.5px]"
                  >
                    Lvl {rankDef.accessLevel} · {rankDef.modes.split(' ')[0]}
                  </text>

                  {/* Cumulative Feature Unlock Count */}
                  <text
                    x={NODE_WIDTH / 2}
                    y={53}
                    textAnchor="middle"
                    className={`font-mono text-[9px] font-semibold ${
                      isActive
                        ? 'fill-amber-300'
                        : isInherited
                        ? 'fill-emerald-400'
                        : 'fill-slate-500'
                    }`}
                  >
                    {featCount}/{IRCD_FEATURE_ACCESS_CONFIG.length} features
                    {isActive ? ' · ACTIVE' : ''}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Interactive Node Lineage & Relationship Inspector */}
        <div className="border-t border-slate-800 bg-slate-900/60 p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white">
                {focusedRankDef.id === 'sra' ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                )}
                <span>
                  {focusedRankDef.prefix ? `${focusedRankDef.prefix} ` : ''}
                  {focusedRankDef.name}
                </span>
              </span>
              <span className="text-[11px] font-mono text-amber-300 font-semibold">
                Level {focusedRankDef.accessLevel.toLocaleString()}
              </span>
              {focusedNode && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    TRACK_STYLES[focusedNode.data.track].pill
                  }`}
                >
                  {focusedNode.data.track}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300 font-mono">
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Users className="w-3 h-3" />
                <span>
                  Parent:{' '}
                  <strong className="text-slate-200">
                    {focusedParent
                      ? `${focusedParent.prefix ? focusedParent.prefix + ' ' : ''}${focusedParent.shortLabel} (L${focusedParent.accessLevel})`
                      : 'Root Node'}
                  </strong>
                </span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span>
                Next Tier(s):{' '}
                <strong className="text-sky-300">
                  {focusedChildren.length > 0
                    ? focusedChildren
                        .map(
                          (c) =>
                            `${c.prefix ? c.prefix + ' ' : ''}${c.shortLabel} (L${c.accessLevel})`
                        )
                        .join(' / ')
                    : orientation === 'escalation'
                    ? 'Apex (~ Owner Root)'
                    : 'Public Entry Floor'}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 font-mono text-xs">
            <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Cumulative: </span>
              <span className="text-emerald-400 font-bold">
                {focusedFeatures.length}/{IRCD_FEATURE_ACCESS_CONFIG.length}
              </span>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 inline-flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-slate-400">Unlocks: </span>
              <span className="text-amber-300 font-bold">
                {focusedNewFeatures.length > 0
                  ? focusedNewFeatures.map((f) => f.shortLabel).join(', ')
                  : 'Inherits parent tier'}
              </span>
            </div>
            {focusedRankId !== activeRank && (
              <button
                type="button"
                onClick={() => onRankChange(focusedRankId)}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-sans font-bold text-xs cursor-pointer"
              >
                Switch to {focusedRankDef.shortLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
