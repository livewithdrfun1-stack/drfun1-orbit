import React, { useState } from 'react';
import { StoreProduct } from '../../types/store';
import { EcomTransmissionState } from '../../types/stream';
import { 
  ShoppingBag, 
  Sparkles, 
  Zap, 
  ExternalLink, 
  Check, 
  TrendingUp, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  Radio, 
  DollarSign 
} from 'lucide-react';

interface EcomTransmissionOverlayProps {
  featuredProduct: StoreProduct | undefined;
  ecomState: EcomTransmissionState;
  onQuickBuy: (product: StoreProduct, isDrfun1: boolean) => void;
  onNavigateToStore?: () => void;
  onToggleOverlay: () => void;
}

export const EcomTransmissionOverlay: React.FC<EcomTransmissionOverlayProps> = ({
  featuredProduct,
  ecomState,
  onQuickBuy,
  onNavigateToStore,
  onToggleOverlay,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [justPurchased, setJustPurchased] = useState(false);

  if (!featuredProduct || !ecomState.isOverlayVisible) {
    return null;
  }

  const discountedPrice = Math.round(
    featuredProduct.drfun1WholesalePrice * (1 - ecomState.discountPercent / 100)
  );

  const handleBuyNow = () => {
    onQuickBuy(featuredProduct, true);
    setJustPurchased(true);
    setTimeout(() => setJustPurchased(false), 2500);
  };

  return (
    <div className="pointer-events-auto transition-all duration-300 max-w-sm sm:max-w-md w-full">
      {isMinimized ? (
        <div className="bg-slate-950/95 backdrop-blur-md border border-amber-500/40 rounded-lg p-2.5 shadow-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-amber-400" />
              ON-AIR OFFER: -{ecomState.discountPercent}%
            </span>
            <span className="text-xs text-white truncate max-w-[150px] font-medium">
              {featuredProduct.drfun1RebrandedName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleBuyNow}
              className="px-2.5 py-1 rounded bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
            >
              ${discountedPrice.toLocaleString()}
            </button>
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 text-slate-400 hover:text-white"
              title="Expand live offer"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/95 backdrop-blur-md border-2 border-amber-500/60 rounded-xl overflow-hidden shadow-2xl text-xs relative">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 px-3 py-1.5 border-b border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="font-bold text-amber-300 font-mono text-[11px] tracking-wide flex items-center gap-1">
                <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                DRFUN1 MEDIA ECOM LIVE SPOTLIGHT
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="text-slate-400 hover:text-slate-200 p-0.5"
                title="Minimize overlay"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onToggleOverlay}
                className="text-slate-500 hover:text-slate-300 text-xs px-1"
                title="Hide overlay"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Product Body */}
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/30">
                    CODE: {ecomState.discountCode}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {ecomState.itemsSold} sold in broadcast
                  </span>
                </div>

                <h4 className="font-bold text-white text-xs sm:text-sm mt-1 leading-snug">
                  {featuredProduct.drfun1RebrandedName}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                  {featuredProduct.tagline}
                </p>
              </div>

              {/* Pricing Callout */}
              <div className="text-right shrink-0">
                <div className="text-sm sm:text-base font-extrabold text-amber-400 font-mono">
                  ${discountedPrice.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 line-through font-mono">
                  ${featuredProduct.retailPrice.toLocaleString()}
                </div>
                <div className="text-[9px] text-emerald-400 font-mono font-bold">
                  SAVE {ecomState.discountPercent}% ON-AIR
                </div>
              </div>
            </div>

            {/* Value add badges */}
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-300">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                Switch SUPERNAP Teleport Direct
              </span>
              <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300">
                UnrealIRCd irc.drfun1.com leafed
              </span>
              <span className="px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300">
                Witt Law Firm Licensed
              </span>
            </div>

            {/* Action Bar */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleBuyNow}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg ${
                  justPurchased
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-900/50'
                    : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-950/60'
                }`}
              >
                {justPurchased ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>ADDED TO DRFUN1 CART!</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>INSTANT BROADCAST ORDER (${discountedPrice.toLocaleString()})</span>
                  </>
                )}
              </button>

              {onNavigateToStore && (
                <button
                  onClick={onNavigateToStore}
                  className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1"
                  title="View full specs in DrFun1 Store"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Store</span>
                </button>
              )}
            </div>

            {/* Live sales notification ticker */}
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {ecomState.liveBuyersCount} customers reviewing checkout
              </span>
              <span>GMV: ${ecomState.broadcastGmv.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
