import React, { useState } from 'react';
import { StoreProduct } from '../types/store';
import { 
  Radio, 
  Satellite, 
  Server, 
  Cpu, 
  Plus, 
  Sparkles,
  Layers,
  Zap
} from 'lucide-react';

interface StoreProductCardProps {
  product: StoreProduct;
  onOpenConfig: (product: StoreProduct, isDrfun1Branded: boolean) => void;
  onQuickAdd: (product: StoreProduct, isDrfun1Branded: boolean) => void;
}

export const StoreProductCard: React.FC<StoreProductCardProps> = ({
  product,
  onOpenConfig,
  onQuickAdd,
}) => {
  const [isDrfun1, setIsDrfun1] = useState(true);

  const price = isDrfun1 ? product.drfun1WholesalePrice : product.retailPrice;
  const savings = product.retailPrice - product.drfun1WholesalePrice;

  const formatPrice = (val: number) => {
    return val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  };

  const getPriceUnitLabel = () => {
    switch (product.priceUnit) {
      case 'one-time':
        return 'hardware purchase';
      case 'per_month':
        return '/ month';
      case 'per_mhz_month':
        return '/ MHz / mo';
      case 'per_device_month':
        return '/ device / mo';
    }
  };

  return (
    <div className="bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-150 group">
      <div>
        {/* Brand Option Segmented Switcher */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-medium w-full">
            <button
              onClick={() => setIsDrfun1(true)}
              className={`flex-1 py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1 ${
                isDrfun1
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>DrFun1 Branded</span>
            </button>
            <button
              onClick={() => setIsDrfun1(false)}
              className={`flex-1 py-1 px-2 rounded-md transition-colors ${
                !isDrfun1
                  ? 'bg-slate-800 text-slate-200 border border-slate-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>OEM Carrier</span>
            </button>
          </div>
        </div>

        {/* Product Visual Container (Stylized Aerospace Graphic) */}
        <div 
          onClick={() => onOpenConfig(product, isDrfun1)}
          className="relative h-40 w-full rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 overflow-hidden mb-4 p-4 flex flex-col justify-between cursor-pointer group-hover:border-sky-500/40 transition-colors"
        >
          {/* Subtle Grid Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

          {/* Top row badges */}
          <div className="relative z-10 flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              {product.category}
            </span>

            {product.badge && (
              <span className="text-[10px] font-mono text-sky-300 bg-sky-950/70 border border-sky-800/50 px-2 py-0.5 rounded">
                {product.badge}
              </span>
            )}
          </div>

          {/* Center Graphic Badge */}
          <div className="relative z-10 flex items-center justify-center my-auto">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform duration-200 shadow-lg shadow-sky-500/5">
              {product.category.includes('Snapdragon') && <Cpu className="w-7 h-7 text-red-400" />}
              {product.category.includes('Switch.com') && <Server className="w-7 h-7 text-emerald-400" />}
              {product.category.includes('Hardware') && !product.category.includes('Snapdragon') && <Satellite className="w-7 h-7 text-sky-400" />}
              {product.category.includes('Bandwidth') && <Zap className="w-7 h-7 text-amber-400" />}
              {product.category.includes('Device') && !product.category.includes('Snapdragon') && <Radio className="w-7 h-7 text-emerald-400" />}
              {product.category.includes('IoT') && !product.category.includes('Snapdragon') && <Cpu className="w-7 h-7 text-cyan-400" />}
              {product.category.includes('Teleport') && !product.category.includes('Switch.com') && <Server className="w-7 h-7 text-indigo-400" />}
              {product.category.includes('Earth') && <Layers className="w-7 h-7 text-violet-400" />}
              {product.category.includes('Fiber') && !product.category.includes('Switch.com') && <Zap className="w-7 h-7 text-cyan-400" />}
              {product.category.includes('IRCD') && <Server className="w-7 h-7 text-purple-400" />}
            </div>
          </div>

          {/* Bottom Carrier Attribution */}
          <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="text-slate-500">Carrier OEM:</span>
            <span className="text-slate-300 truncate max-w-[180px]">
              {product.oemCarriers.join(' · ')}
            </span>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="mb-3">
          <h3 
            onClick={() => onOpenConfig(product, isDrfun1)}
            className="text-base font-bold text-white hover:text-sky-400 cursor-pointer transition-colors leading-snug line-clamp-1"
          >
            {isDrfun1 ? product.drfun1RebrandedName : product.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {isDrfun1 ? product.drfun1Description : product.oemDescription}
          </p>
        </div>

        {/* Technical Highlights Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-y border-slate-800/80 mb-3.5 font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block tracking-wider">
              Orbit Regime
            </span>
            <span className="text-slate-200">{product.orbitType}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block tracking-wider">
              Frequency Bands
            </span>
            <span className="text-slate-200 truncate block">
              {product.frequencyBands.join(', ')}
            </span>
          </div>
        </div>

        {/* DrFun1 Value-Add Callout */}
        {isDrfun1 && (
          <div className="mb-4 bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-[11px] space-y-1">
            <span className="text-sky-400 font-mono font-semibold block text-[10px] uppercase">
              DrFun1 Value-Add Integrations Included:
            </span>
            <div className="text-slate-300 flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Switch SUPERNAP Cross-Connect (switch.com)</span>
            </div>
            <div className="text-slate-300 flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>UnrealIRCd Leaf Peering to irc.drfun1.com:6697</span>
            </div>
            <div className="text-slate-300 flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>RisingNet BGP Shielded Transit (risingnet.com)</span>
            </div>
          </div>
        )}
      </div>

      {/* Pricing & Cart Action Area */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white font-mono tabular-nums">
                {formatPrice(price)}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {getPriceUnitLabel()}
              </span>
            </div>
            {isDrfun1 && savings > 0 && (
              <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                Save {formatPrice(savings)} vs Carrier MSRP
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            Min Qty: {product.minOrderQuantity}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenConfig(product, isDrfun1)}
            className="w-full py-2 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1 border border-slate-700"
          >
            <span>Specs & Quote</span>
          </button>

          <button
            onClick={() => onQuickAdd(product, isDrfun1)}
            className="w-full py-2 px-3 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 font-semibold shadow-sm shadow-sky-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
