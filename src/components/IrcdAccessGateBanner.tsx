/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 */

import React from 'react';
import { Lock, Shield } from 'lucide-react';
import { AnopeRankLevel } from '../types/ircdAdmin';
import { getRankDefinition } from '../utils/ircdAccess';

interface IrcdAccessGateBannerProps {
  currentRank: AnopeRankLevel;
  requiredRank: AnopeRankLevel;
  featureName: string;
  onElevateRank?: (rank: AnopeRankLevel) => void;
  onOpenRankMatrix?: () => void;
}

export const IrcdAccessGateBanner: React.FC<IrcdAccessGateBannerProps> = ({
  currentRank,
  requiredRank,
  featureName,
  onElevateRank,
  onOpenRankMatrix,
}) => {
  const curDef = getRankDefinition(currentRank);
  const reqDef = getRankDefinition(requiredRank);

  return (
    <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 shrink-0">
          <Lock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="text-xs font-mono text-amber-300 font-semibold">
            IRCD Rank Access Required · Minimum {reqDef.prefix ? `${reqDef.prefix} ` : ''}
            {reqDef.shortLabel} (Level {reqDef.accessLevel})
          </div>
          <h3 className="text-sm font-bold text-white">
            {featureName} is restricted at {curDef.shortLabel} (Level {curDef.accessLevel})
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {reqDef.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {onElevateRank && (
          <button
            type="button"
            onClick={() => onElevateRank(requiredRank)}
            className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 min-h-[38px] cursor-pointer whitespace-nowrap"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Switch to {reqDef.shortLabel}</span>
          </button>
        )}
        {onOpenRankMatrix && (
          <button
            type="button"
            onClick={onOpenRankMatrix}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold min-h-[38px] cursor-pointer whitespace-nowrap"
          >
            View All 14 Ranks
          </button>
        )}
      </div>
    </div>
  );
};
