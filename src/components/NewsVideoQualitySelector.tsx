/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Bitrate / Resolution Quality Selector Dropdown for DrFun1 News Video Player Overlay.
 * Allows switching between 480p, 720p, and 1080p stream tiers when available for the
 * currently selected streaming source (Satellite, Web, Local, Fiber 100G).
 */

import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { StreamQualityOption, StreamQualityTier } from '../types/drfun1News';

interface NewsVideoQualitySelectorProps {
  options: StreamQualityOption[];
  activeQuality: StreamQualityOption;
  preferredTier: StreamQualityTier;
  sourceLabel: string;
  codecLabel: string;
  menuPlacement?: 'up' | 'down';
  compact?: boolean;
  onSelectQuality: (tier: StreamQualityTier) => void;
}

export const NewsVideoQualitySelector: React.FC<NewsVideoQualitySelectorProps> = ({
  options,
  activeQuality,
  preferredTier,
  sourceLabel,
  codecLabel,
  menuPlacement = 'up',
  compact = false,
  onSelectQuality,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (evt: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(evt.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (evt: KeyboardEvent) => {
      if (evt.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const tierTone =
    activeQuality.tier === '1080p'
      ? 'text-cyan-300 border-cyan-500/50 bg-cyan-950/60 hover:bg-cyan-900/60'
      : activeQuality.tier === '720p'
        ? 'text-emerald-300 border-emerald-500/50 bg-emerald-950/60 hover:bg-emerald-900/60'
        : 'text-amber-300 border-amber-500/50 bg-amber-950/60 hover:bg-amber-900/60';

  const isFallbackActive = activeQuality.tier !== preferredTier;
  const availableCount = options.filter((o) => o.available).length;

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${tierTone}`}
        title={`Stream Quality: ${activeQuality.label} (${activeQuality.bitrateMbps} Mbps) · ${availableCount}/${options.length} tiers available on ${sourceLabel}`}
      >
        <SlidersHorizontal className="w-3 h-3 shrink-0" />
        <span className="tabular-nums">
          {compact
            ? activeQuality.shortLabel
            : `${activeQuality.shortLabel} · ${activeQuality.bitrateMbps} Mbps`}
        </span>
        <ChevronDown
          className={`w-3 h-3 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Stream Bitrate and Resolution Quality Selector"
          onClick={(e) => e.stopPropagation()}
          className={`absolute ${
            menuPlacement === 'up'
              ? 'bottom-9 left-0 sm:left-auto sm:right-0'
              : 'top-9 right-0'
          } z-40 w-[268px] rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700 shadow-2xl p-2 font-mono text-[11px] space-y-1.5`}
        >
          <div className="px-2 py-1.5 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-bold text-white truncate">Stream Quality</div>
              <div className="text-[10px] text-slate-400 truncate">
                {sourceLabel} · {codecLabel}
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9.5px] text-cyan-300 shrink-0 tabular-nums">
              {availableCount} tiers
            </span>
          </div>

          {isFallbackActive && (
            <div className="px-2 py-1 rounded-lg bg-amber-950/50 border border-amber-500/30 text-[10px] text-amber-200 leading-snug">
              {preferredTier} unavailable on {sourceLabel} — auto-adjusted to {activeQuality.tier}.
            </div>
          )}

          <div className="space-y-1">
            {options.map((opt) => {
              const isSelected = activeQuality.tier === opt.tier;
              return (
                <button
                  key={opt.tier}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  disabled={!opt.available}
                  onClick={() => {
                    if (!opt.available) return;
                    onSelectQuality(opt.tier);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-lg border text-left transition-colors flex items-center justify-between gap-2 ${
                    !opt.available
                      ? 'bg-slate-900/40 border-slate-800/70 text-slate-500 opacity-55 cursor-not-allowed'
                      : isSelected
                        ? 'bg-cyan-500/15 border-cyan-400/60 text-white cursor-pointer'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-200 cursor-pointer'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-bold ${
                          !opt.available
                            ? 'text-slate-500'
                            : isSelected
                              ? 'text-cyan-300'
                              : 'text-white'
                        }`}
                      >
                        {opt.label}
                      </span>
                      {opt.tier === '1080p' && opt.available && (
                        <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
                          FHD
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 tabular-nums mt-0.5">
                      {opt.available
                        ? `${opt.dimensions} · ${opt.fps}fps`
                        : opt.unavailableReason || `Not offered on ${sourceLabel}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                    {opt.available ? (
                      <>
                        <span
                          className={`text-[10.5px] font-bold ${
                            isSelected ? 'text-cyan-300' : 'text-slate-300'
                          }`}
                        >
                          {opt.bitrateMbps} Mbps
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </>
                    ) : (
                      <span className="text-[9.5px] uppercase text-slate-500">N/A</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
