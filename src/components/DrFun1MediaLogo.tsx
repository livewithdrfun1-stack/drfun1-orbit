/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * DrFun1Media Brand Logo Component
 * Renders "DrFun1Media" in regal Purple and Gold with authentic Old English / Blackletter typography
 * on the capital letters ('D', 'F', 'M') paired with high-precision modern typography
 * for the remaining letters ('r', 'un1', 'edia').
 */

import React from 'react';
import { Terminal } from 'lucide-react';

export interface DrFun1MediaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'purple-gold' | 'chromatic' | 'gradient' | 'white';
  showIcon?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
  badge?: string;
  badgeColor?: 'purple-gold' | 'emerald' | 'purple' | 'cyan' | 'amber';
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const DrFun1MediaLogo: React.FC<DrFun1MediaLogoProps> = ({
  size = 'md',
  variant = 'purple-gold',
  showIcon = false,
  showSubtitle = false,
  subtitleText = '1,000-Leaf Mesh (500 Per Hub) · Dual Core Hubs',
  badge,
  badgeColor = 'purple-gold',
  className = '',
  onClick,
  title = 'DrFun1Media - UnrealIRCd WebIRC Client & Satcom Network'
}) => {
  // Sizing definitions for root container and individual glyphs
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
    '2xl': 'text-3xl sm:text-4xl'
  };

  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
    '2xl': 'w-16 h-16'
  };

  const terminalIconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
    '2xl': 'w-7 h-7'
  };

  const badgeColorClasses = {
    'purple-gold': 'bg-gradient-to-r from-purple-950/90 via-slate-950 to-amber-950/80 text-amber-300 border border-amber-500/40 shadow-sm shadow-purple-950/50',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  };

  const isClickable = Boolean(onClick);
  const Container = isClickable ? 'button' : 'div';

  return (
    <Container
      onClick={onClick}
      title={title}
      className={`group inline-flex items-center gap-2.5 text-left ${isClickable ? 'cursor-pointer select-none focus:outline-none' : ''} ${className}`}
    >
      {/* Optional Embedded Purple & Gold Brand Icon */}
      {showIcon && (
        <div className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-tr from-purple-600 via-amber-400 to-yellow-500 p-0.5 shadow-md shadow-purple-900/50 group-hover:scale-105 transition-transform shrink-0`}>
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden border border-amber-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/35 via-amber-500/20 to-transparent" />
            <Terminal className={`${terminalIconSizes[size]} text-amber-300 group-hover:text-purple-300 transition-colors relative z-10 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]`} />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-950 animate-pulse z-10 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
          </div>
        </div>
      )}

      {/* Wordmark and Subtitle container */}
      <div className="inline-flex flex-col">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Core Wordmark: DrFun1Media */}
          <span
            className={`inline-flex items-baseline font-sans font-black tracking-tight leading-none whitespace-nowrap ${sizeClasses[size]}`}
            aria-label="DrFun1Media"
          >
            {variant === 'purple-gold' ? (
              /* Imperial Purple and Gold Masterpiece Theme */
              <span className="inline-flex items-baseline group-hover:brightness-110 transition-all">
                {/* Capital D in Old English: Royal Purple with Gold Glow & Shimmer */}
                <span
                  className="font-old-english text-[1.32em] font-bold drop-shadow-[0_0_10px_rgba(251,191,36,0.65)] leading-none inline-block transform translate-y-[1px]"
                  title="D (Old English in Purple & Gold)"
                >
                  <span className="bg-gradient-to-b from-purple-300 via-purple-400 to-amber-300 bg-clip-text text-transparent">
                    D
                  </span>
                </span>
                <span className="font-extrabold tracking-tight text-amber-50/95">r</span>

                {/* Capital F in Old English: Radiant 24K Liquid Gold with Purple Aura */}
                <span
                  className="font-old-english text-[1.32em] font-bold drop-shadow-[0_0_12px_rgba(168,85,247,0.7)] leading-none inline-block ml-[1px] transform translate-y-[1px]"
                  title="F (Old English in Purple & Gold)"
                >
                  <span className="bg-gradient-to-b from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    F
                  </span>
                </span>
                <span className="font-extrabold tracking-tight text-amber-50/95">un1</span>

                {/* Capital M in Old English: Royal Purple & Gold Dual Sheen */}
                <span
                  className="font-old-english text-[1.32em] font-bold drop-shadow-[0_0_10px_rgba(251,191,36,0.65)] leading-none inline-block ml-[1.5px] transform translate-y-[1px]"
                  title="M (Old English in Purple & Gold)"
                >
                  <span className="bg-gradient-to-b from-amber-300 via-purple-300 to-purple-500 bg-clip-text text-transparent">
                    M
                  </span>
                </span>
                <span className="font-extrabold tracking-tight text-amber-50/95">edia</span>
              </span>
            ) : variant === 'gradient' ? (
              /* Continuous Purple-to-Gold Radiant Spectrum */
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-fuchsia-200 group-hover:to-amber-200 transition-all inline-flex items-baseline">
                <span className="font-old-english text-[1.32em] font-bold leading-none inline-block transform translate-y-[1px]">
                  D
                </span>
                <span className="font-extrabold tracking-tight">r</span>
                <span className="font-old-english text-[1.32em] font-bold leading-none inline-block ml-[1px] transform translate-y-[1px]">
                  F
                </span>
                <span className="font-extrabold tracking-tight">un1</span>
                <span className="font-old-english text-[1.32em] font-bold leading-none inline-block ml-[1.5px] transform translate-y-[1px]">
                  M
                </span>
                <span className="font-extrabold tracking-tight">edia</span>
              </span>
            ) : variant === 'white' ? (
              /* High-Contrast Monochrome with Gold/Purple Glow */
              <span className="text-white group-hover:text-amber-200 transition-colors inline-flex items-baseline">
                <span className="font-old-english text-[1.32em] font-bold text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] leading-none inline-block transform translate-y-[1px]">
                  D
                </span>
                <span className="font-extrabold tracking-tight">r</span>
                <span className="font-old-english text-[1.32em] font-bold text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] leading-none inline-block ml-[1px] transform translate-y-[1px]">
                  F
                </span>
                <span className="font-extrabold tracking-tight">un1</span>
                <span className="font-old-english text-[1.32em] font-bold text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] leading-none inline-block ml-[1.5px] transform translate-y-[1px]">
                  M
                </span>
                <span className="font-extrabold tracking-tight">edia</span>
              </span>
            ) : (
              /* Chromatic Multi-Color */
              <span className="inline-flex items-baseline text-white group-hover:brightness-110 transition-all">
                <span className="font-old-english text-[1.32em] font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.55)] leading-none inline-block transform translate-y-[1px]">
                  D
                </span>
                <span className="font-extrabold tracking-tight text-slate-100">r</span>
                <span className="font-old-english text-[1.32em] font-bold text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.55)] leading-none inline-block ml-[1px] transform translate-y-[1px]">
                  F
                </span>
                <span className="font-extrabold tracking-tight text-slate-100">un1</span>
                <span className="font-old-english text-[1.32em] font-bold text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.55)] leading-none inline-block ml-[1.5px] transform translate-y-[1px]">
                  M
                </span>
                <span className="font-extrabold tracking-tight text-slate-100">edia</span>
              </span>
            )}
          </span>

          {/* Context Badge (e.g. INDEX, 4K, LIVE) */}
          {badge && (
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${badgeColorClasses[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>

        {/* Subtitle / Masthead Line */}
        {showSubtitle && (
          <span className="text-[10px] font-mono text-amber-200/70 -mt-0.5 hidden sm:inline tracking-normal">
            {subtitleText}
          </span>
        )}
      </div>
    </Container>
  );
};
