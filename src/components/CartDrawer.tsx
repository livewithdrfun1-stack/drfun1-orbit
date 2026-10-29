import React, { useState } from 'react';
import { CartItem, ProcurementOrder } from '../types/store';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Sparkles, 
  FileText, 
  Download, 
  Check, 
  Send, 
  Server, 
  ShieldCheck,
  Terminal,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('Richard Alan Witt');
  const [companyName, setCompanyName] = useState('Owens Company / The Law Office of Richard A. Witt LLC');
  const [email, setEmail] = useState('rawitt@wittlawfirm.com');
  const [phone, setPhone] = useState('+1 (860) 747-1999');
  const [billingNotes, setBillingNotes] = useState('Requesting Switch SUPERNAP optical cross-connect provisioning, RisingNet BGP transit peering, and UnrealIRCd leaf credentials linking to irc.drfun1.com:6697.');

  const [orderConfirmed, setOrderConfirmed] = useState<ProcurementOrder | null>(null);
  const [copiedOrder, setCopiedOrder] = useState(false);

  const calculateItemPrice = (item: CartItem) => {
    const base = item.isDrfun1Branded ? item.product.drfun1WholesalePrice : item.product.retailPrice;
    let disc = 1;
    if (item.quantity >= 25) disc = 0.85;
    else if (item.quantity >= 5) disc = 0.95;
    return Math.round(base * disc);
  };

  const calculateItemRetail = (item: CartItem) => {
    return item.product.retailPrice * item.quantity;
  };

  const totalWholesale = cartItems.reduce(
    (sum, item) => sum + calculateItemPrice(item) * item.quantity,
    0
  );

  const totalRetail = cartItems.reduce(
    (sum, item) => sum + calculateItemRetail(item),
    0
  );

  const totalSavings = totalRetail - totalWholesale;

  const formatPrice = (val: number) => {
    return val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  };

  const handleGenerateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order: ProcurementOrder = {
      orderId: `DF1-PO-${Date.now().toString().slice(-6)}`,
      items: [...cartItems],
      customerName,
      companyName,
      email,
      phone,
      billingNotes,
      totalWholesale,
      totalRetail,
      totalSavings,
      submittedAt: new Date().toISOString(),
    };
    setOrderConfirmed(order);
  };

  const handleDownloadPO = () => {
    if (!orderConfirmed) return;
    const content = `========================================================================
DRFUN1 SATELLITE STORE & RESELLER MARKETPLACE - FORMAL PURCHASE ORDER
========================================================================
Order ID:        ${orderConfirmed.orderId}
Issue Date:      ${new Date(orderConfirmed.submittedAt).toLocaleDateString()}
Purchaser:       ${orderConfirmed.customerName}
Company:         ${orderConfirmed.companyName}
Email:           ${orderConfirmed.email}
Phone:           ${orderConfirmed.phone}
Licensed Entity: The Law Office of Richard A. Witt LLC (www.wittlawfirm.com)
Corporate Node:  Owens Company (www.owenscompany.com)

------------------------------------------------------------------------
ITEMIZED SATELLITE PRODUCTS & DRFUN1 REBRANDED CONFIGURATIONS:
------------------------------------------------------------------------
${orderConfirmed.items.map((it, idx) => {
  const unitPr = calculateItemPrice(it);
  return `${idx + 1}. ${it.isDrfun1Branded ? it.product.drfun1RebrandedName : it.product.name}
   - OEM Carrier: ${it.product.oemCarriers.join(', ')}
   - Branding: ${it.isDrfun1Branded ? 'DrFun1 Value-Added Edition' : 'OEM White-label'}
   - Qty: ${it.quantity} | Unit: $${unitPr.toLocaleString()} | Subtotal: $${(unitPr * it.quantity).toLocaleString()}
   - Switch Colocation: ${it.addSwitchColocation ? 'Yes (www.switch.com SUPERNAP)' : 'No'}
   - RisingNet Transit: ${it.addRisingNetTransit ? 'Yes (www.risingnet.com)' : 'No'}
   - UnrealIRCd Peering: ${it.addUnrealIrcdPeering ? 'Yes (Hub: irc.drfun1.com:6697)' : 'No'}
`;
}).join('\n')}
------------------------------------------------------------------------
FINANCIAL SUMMARY:
------------------------------------------------------------------------
Standard Carrier MSRP:   $${orderConfirmed.totalRetail.toLocaleString()}
DrFun1 Reseller Total:   $${orderConfirmed.totalWholesale.toLocaleString()}
Total Reseller Savings:  $${orderConfirmed.totalSavings.toLocaleString()}

TELEPORT & NOC COORDINATION NOTES:
${orderConfirmed.billingNotes}

AUTHENTICATION:
Certified and generated via Satcom Orbit Procurement Portal.
Licensed to Richard Alan Witt.
========================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${orderConfirmed.orderId}_DrFun1_Purchase_Order.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Surface */}
      <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full z-10 text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                DrFun1 Procurement Bag
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {cartItems.length} product line{cartItems.length !== 1 ? 's' : ''} configured
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && !orderConfirmed && (
              <button
                onClick={onClearCart}
                className="text-[11px] font-mono text-slate-500 hover:text-rose-400 transition-colors mr-2"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {orderConfirmed ? (
            /* Post-Order Confirmation State */
            <div className="space-y-5 text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/10">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                  Procurement Order Generated
                </span>
                <h3 className="text-lg font-bold text-white font-mono">
                  {orderConfirmed.orderId}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Your formal purchase order and carrier interconnect proposal has been generated and staged for commissioning.
                </p>
              </div>

              {/* Order Summary Receipt Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left space-y-2.5 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Purchaser:</span>
                  <span className="text-slate-200">{orderConfirmed.customerName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Organization:</span>
                  <span className="text-slate-200">{orderConfirmed.companyName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Total Configured Items:</span>
                  <span className="text-slate-200">{orderConfirmed.items.length} lines</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Total Wholesale:</span>
                  <span className="text-sky-400 font-bold">{formatPrice(orderConfirmed.totalWholesale)}</span>
                </div>
                <div className="flex justify-between pt-1 text-emerald-400 font-bold">
                  <span>Reseller Savings:</span>
                  <span>{formatPrice(orderConfirmed.totalSavings)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={handleDownloadPO}
                  className="flex-1 py-2 px-3 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed PO (.txt)</span>
                </button>
                <button
                  onClick={() => {
                    setOrderConfirmed(null);
                    onClearCart();
                    onClose();
                  }}
                  className="py-2 px-4 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
                >
                  Return to Store
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="py-24 text-center text-slate-400 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-sm font-medium text-slate-300">Your procurement bag is empty</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Select DrFun1 branded terminals, enterprise CIR bandwidth pipes, or Switch SUPERNAP colocation racks from the store catalog.
              </p>
            </div>
          ) : (
            /* Itemized List & Checkout Form */
            <div className="space-y-6">
              {/* Items List */}
              <div className="space-y-3">
                {cartItems.map((item, idx) => {
                  const itemUnitPrice = calculateItemPrice(item);
                  const itemTotalPrice = itemUnitPrice * item.quantity;

                  return (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {item.isDrfun1Branded ? (
                              <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800/40">
                                DrFun1 Branded
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                                OEM Carrier
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-100 text-xs mt-1 truncate">
                            {item.isDrfun1Branded ? item.product.drfun1RebrandedName : item.product.name}
                          </h4>
                          <span className="text-[11px] text-slate-500 block truncate">
                            OEM: {item.product.oemCarriers.join(', ')}
                          </span>
                        </div>

                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Included Add-ons Badges */}
                      <div className="flex flex-wrap gap-1 text-[10px] font-mono text-slate-400">
                        {item.addSwitchColocation && (
                          <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-sky-300">
                            + Switch SUPERNAP
                          </span>
                        )}
                        {item.addRisingNetTransit && (
                          <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-sky-300">
                            + RisingNet Transit
                          </span>
                        )}
                        {item.addUnrealIrcdPeering && (
                          <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-emerald-400">
                            + UnrealIRCd (irc.drfun1.com)
                          </span>
                        )}
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-900 font-mono">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateQuantity(idx, Math.max(item.product.minOrderQuantity || 1, item.quantity - 1))}
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-xs text-white tabular-nums px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-sm text-sky-400 tabular-nums">
                            {formatPrice(itemTotalPrice)}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            @{formatPrice(itemUnitPrice)} ea
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial Calculation Totals */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Standard Carrier MSRP:</span>
                  <span className="tabular-nums">{formatPrice(totalRetail)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>DrFun1 Reseller Savings:</span>
                  <span className="tabular-nums">-{formatPrice(totalSavings)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Wholesale Subtotal:</span>
                  <span className="text-sky-400 tabular-nums">{formatPrice(totalWholesale)}</span>
                </div>
              </div>

              {/* Checkout & Procurement Information Form */}
              <form onSubmit={handleGenerateOrder} className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-sky-400 font-bold">
                  Authorized Purchaser & Billing Credentials
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-500 font-mono text-[10px] uppercase mb-1">
                      Purchaser Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-mono text-[10px] uppercase mb-1">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-500 font-mono text-[10px] uppercase mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-mono text-[10px] uppercase mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-mono text-[10px] uppercase mb-1">
                    Teleport Delivery & Switch Interconnect Notes
                  </label>
                  <textarea
                    value={billingNotes}
                    onChange={(e) => setBillingNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-sky-500 font-mono resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-sky-500/10 mt-3"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Formal Purchase Order ({formatPrice(totalWholesale)})</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
