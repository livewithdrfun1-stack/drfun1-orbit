import React, { useState } from 'react';
import { StoreProduct } from '../../types/store';
import { EcomTransmissionState, StreamChatMessage } from '../../types/stream';
import { STORE_PRODUCTS } from '../../data/storeProducts';
import { 
  ShoppingBag, 
  Sparkles, 
  Zap, 
  Send, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Tag, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Search, 
  ChevronRight 
} from 'lucide-react';

interface EcomTransmissionTabProps {
  ecomState: EcomTransmissionState;
  onUpdateEcomState: (updated: Partial<EcomTransmissionState>) => void;
  onQuickBuy: (product: StoreProduct, isDrfun1: boolean) => void;
  onPushToChat: (message: string) => void;
  onNavigateToStore?: () => void;
  onOpenLicense: () => void;
}

export const EcomTransmissionTab: React.FC<EcomTransmissionTabProps> = ({
  ecomState,
  onUpdateEcomState,
  onQuickBuy,
  onPushToChat,
  onNavigateToStore,
  onOpenLicense,
}) => {
  const [productSearch, setProductSearch] = useState('');
  const [pushedSuccess, setPushedSuccess] = useState(false);

  const currentProduct = STORE_PRODUCTS.find(p => p.id === ecomState.featuredProductId) || STORE_PRODUCTS[0];

  const filteredProducts = STORE_PRODUCTS.filter(p => 
    p.drfun1RebrandedName.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handlePushToMultiChat = () => {
    const discountedPrice = Math.round(
      currentProduct.drfun1WholesalePrice * (1 - ecomState.discountPercent / 100)
    );
    const chatPromo = `🔥 [DRFUN1 ON-AIR SPECIAL] ${currentProduct.drfun1RebrandedName} is now $${discountedPrice.toLocaleString()} (${ecomState.discountPercent}% OFF with code ${ecomState.discountCode})! Direct uplink via Switch SUPERNAP & UnrealIRCd leaf mesh. Order now in-stream!`;
    onPushToChat(chatPromo);
    setPushedSuccess(true);
    setTimeout(() => setPushedSuccess(false), 2500);
  };

  const handleSelectProduct = (productId: string) => {
    onUpdateEcomState({ featuredProductId: productId, isOverlayVisible: true });
  };

  return (
    <div className="p-4 space-y-4 text-xs text-slate-200">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 border border-amber-500/30 rounded-xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm tracking-wide flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                DrFun1 Media ECOM Live Shopping Transmission Deck
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                LIVE BROADCAST
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Synchronize live multistream video with DrFun1 Store inventory, real-time checkout links, and in-stream TV purchasing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateEcomState({ isOverlayVisible: !ecomState.isOverlayVisible })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                ecomState.isOverlayVisible
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              {ecomState.isOverlayVisible ? 'Video Overlay: VISIBLE' : 'Video Overlay: HIDDEN'}
            </button>
          </div>
        </div>

        {/* Transmission GMV & Sales Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">Broadcast GMV</div>
            <div className="text-sm sm:text-base font-bold text-amber-400 font-mono">
              ${ecomState.broadcastGmv.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">Items Sold On-Air</div>
            <div className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
              {ecomState.itemsSold} units
            </div>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">Live Shoppers</div>
            <div className="text-sm sm:text-base font-bold text-sky-400 font-mono">
              {ecomState.liveBuyersCount} active
            </div>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">Active Discount</div>
            <div className="text-sm sm:text-base font-bold text-purple-400 font-mono">
              {ecomState.discountPercent}% OFF
            </div>
          </div>
        </div>
      </div>

      {/* Currently Featured Product on Stream */}
      <div className="bg-slate-950 border-2 border-amber-500/50 rounded-xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Currently Spotlighted On-Air Product
          </span>
          <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            BROADCAST ACTIVE
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{currentProduct.drfun1RebrandedName}</span>
              <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 font-mono text-[10px] border border-sky-500/20">
                {currentProduct.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">{currentProduct.tagline}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
              <span className="text-slate-300 font-medium">OEM: {currentProduct.oemCarriers.join(', ')}</span>
              <span>·</span>
              <span className="text-emerald-400">Switch SUPERNAP Teleport Included</span>
              <span>·</span>
              <span className="text-purple-400">UnrealIRCd Telemetry Preloaded</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-base font-bold text-amber-400 font-mono">
              ${Math.round(currentProduct.drfun1WholesalePrice * (1 - ecomState.discountPercent / 100)).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 line-through font-mono">
              ${currentProduct.retailPrice.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono font-semibold">
              Save {ecomState.discountPercent}% On Air
            </div>
          </div>
        </div>

        {/* Promotion Controls: Discount, Coupon Code, Push to Multi-Chat */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Discount Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              On-Air Discount %
            </label>
            <div className="grid grid-cols-4 gap-1 font-mono">
              {[10, 15, 20, 25].map(pct => (
                <button
                  key={pct}
                  onClick={() => onUpdateEcomState({ discountPercent: pct })}
                  className={`py-1 rounded text-center text-xs font-semibold border transition-colors ${
                    ecomState.discountPercent === pct
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Promo Code */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Live Promo Code
            </label>
            <input
              type="text"
              value={ecomState.discountCode}
              onChange={e => onUpdateEcomState({ discountCode: e.target.value.toUpperCase() })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500 uppercase"
            />
          </div>

          {/* Push to Multi-Chat Button */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handlePushToMultiChat}
              className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow ${
                pushedSuccess
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              }`}
            >
              {pushedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>PUSHED TO 7 CHATS!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>SYNC TO MULTI-CHAT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Catalog Picker */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-white text-xs">DrFun1 Store Product Catalog</h4>
            <p className="text-[10px] text-slate-400">Select any licensed hardware or bandwidth service to push live on stream.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search products..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {filteredProducts.map(prod => (
            <div
              key={prod.id}
              className={`p-2.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                prod.id === ecomState.featuredProductId
                  ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-sm'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-white">{prod.drfun1RebrandedName}</span>
                  {prod.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                      {prod.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-md mt-0.5">{prod.tagline}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-amber-400">
                    ${prod.drfun1WholesalePrice.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-slate-500">Wholesale</div>
                </div>

                <button
                  onClick={() => handleSelectProduct(prod.id)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                    prod.id === ecomState.featuredProductId
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {prod.id === ecomState.featuredProductId ? 'Spotlighted' : 'Feature Live'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
