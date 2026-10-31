import React, { useState } from 'react';
import { StoreProduct, CartItem } from '../types/store';
import { 
  X, 
  Check, 
  Sparkles, 
  Server, 
  Terminal, 
  ShieldCheck, 
  Plus, 
  Minus
} from 'lucide-react';

interface ProductConfigModalProps {
  product: StoreProduct | null;
  initialDrfun1Branded: boolean;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const ProductConfigModal: React.FC<ProductConfigModalProps> = ({
  product,
  initialDrfun1Branded,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !product) return null;

  const [isDrfun1Branded, setIsDrfun1Branded] = useState(initialDrfun1Branded);
  const [quantity, setQuantity] = useState(product.minOrderQuantity || 1);
  const [addSwitchColocation, setAddSwitchColocation] = useState(true);
  const [addRisingNetTransit, setAddRisingNetTransit] = useState(true);
  const [addUnrealIrcdPeering, setAddUnrealIrcdPeering] = useState(true);

  // Volume discount calculation: 5+ items = 5% off, 25+ items = 15% off
  const baseUnitPrice = isDrfun1Branded ? product.drfun1WholesalePrice : product.retailPrice;
  let discountMultiplier = 1;
  if (quantity >= 25) {
    discountMultiplier = 0.85;
  } else if (quantity >= 5) {
    discountMultiplier = 0.95;
  }

  const effectiveUnitPrice = Math.round(baseUnitPrice * discountMultiplier);
  const totalPrice = effectiveUnitPrice * quantity;

  const formatPrice = (val: number) => {
    return val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  };

  const handleConfirmAddToCart = () => {
    onAddToCart({
      product,
      quantity,
      isDrfun1Branded,
      addSwitchColocation,
      addRisingNetTransit,
      addUnrealIrcdPeering,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold block mb-0.5">
              {product.category} · OEM: {product.oemCarriers.join(', ')}
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              {isDrfun1Branded ? product.drfun1RebrandedName : product.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Brand Edition Selector */}
          <div>
            <label className="block text-slate-400 font-mono text-[11px] uppercase mb-2">
              Select Branding Edition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setIsDrfun1Branded(true)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isDrfun1Branded
                    ? 'bg-sky-950/30 border-sky-500/50 shadow-md shadow-sky-500/5'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-sky-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>DrFun1 Value-Added Edition</span>
                  </span>
                  {isDrfun1Branded && <Check className="w-4 h-4 text-sky-400" />}
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Includes DrFun1 firmware, pre-installed UnrealIRCd leaf to irc.drfun1.com, Switch SUPERNAP direct cross-connect, and wholesale savings.
                </p>
                <div className="mt-2 text-white font-mono font-bold text-xs">
                  {formatPrice(product.drfun1WholesalePrice)} <span className="text-[10px] text-slate-500 font-normal">Wholesale</span>
                </div>
              </div>

              <div
                onClick={() => setIsDrfun1Branded(false)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  !isDrfun1Branded
                    ? 'bg-slate-800/40 border-slate-600 shadow-md'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-200">
                    OEM White-Label Carrier Edition
                  </span>
                  {!isDrfun1Branded && <Check className="w-4 h-4 text-slate-300" />}
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Original manufacturer packaging without DrFun1 value-added firmware or telemetry integrations.
                </p>
                <div className="mt-2 text-white font-mono font-bold text-xs">
                  {formatPrice(product.retailPrice)} <span className="text-[10px] text-slate-500 font-normal">Standard MSRP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications Matrix */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-2">
              Verified Technical Specifications
            </h4>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Orbit Regime</span>
                <span className="text-slate-200">{product.orbitType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Bands Supported</span>
                <span className="text-slate-200">{product.frequencyBands.join(', ')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Availability</span>
                <span className="text-emerald-400">{product.stockStatus}</span>
              </div>
              {product.specs.map((sp, idx) => (
                <div key={idx}>
                  <span className="text-[10px] text-slate-500 uppercase block">{sp.label}</span>
                  <span className="text-slate-200">{sp.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add-on Options for Resellers */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-2">
              Turnkey Teleport & NOC Peering Add-Ons
            </h4>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-900/60 transition-colors">
                <input
                  type="checkbox"
                  checked={addSwitchColocation}
                  onChange={(e) => setAddSwitchColocation(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900"
                />
                <div>
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-sky-400" />
                    <span>Switch SUPERNAP Teleport Optical Cross-Connect (www.switch.com)</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Single-mode DWDM fiber cross-connect into Switch Tier 4 Gold core campus for sub-millisecond cloud egress.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-900/60 transition-colors">
                <input
                  type="checkbox"
                  checked={addRisingNetTransit}
                  onChange={(e) => setAddRisingNetTransit(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900"
                />
                <div>
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>RisingNet Protected BGP IP Transit (www.risingnet.com)</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Multi-homed BGP carrier transit with DDoS shielding for satellite ground station telemetry.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-900/60 transition-colors">
                <input
                  type="checkbox"
                  checked={addUnrealIrcdPeering}
                  onChange={(e) => setAddUnrealIrcdPeering(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900"
                />
                <div>
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span>UnrealIRCd Out-of-Band Leaf Daemon to irc.drfun1.com:6697</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Pre-generated leaf link block and credentials for 24/7 crisis dispatch and automated telemetry alerts.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Quantity & Volume Pricing Tier */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400 block">
                Procurement Quantity:
              </span>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(product.minOrderQuantity || 1, quantity - 1))}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono tabular-nums text-base font-bold text-white px-2">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-500 uppercase block">Unit Price (with volume tier):</span>
              <span className="text-base font-bold text-sky-400 tabular-nums">
                {formatPrice(effectiveUnitPrice)}
              </span>
              {quantity >= 5 && (
                <span className="text-[10px] text-emerald-400 block">
                  {quantity >= 25 ? '15% Fleet Discount Applied' : '5% Volume Discount Applied'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer / Contiguous Buy Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              Configured Subtotal ({quantity} unit{quantity > 1 ? 's' : ''}):
            </span>
            <div className="text-xl font-bold text-white font-mono tabular-nums">
              {formatPrice(totalPrice)}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAddToCart}
              className="px-5 py-2 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-2 font-semibold shadow-sm shadow-sky-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Procurement Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
