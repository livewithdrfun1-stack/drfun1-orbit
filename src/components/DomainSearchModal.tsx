/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Domain Search & Purchase Modal
 */

import React from 'react';
import { DomainSearchView } from './DomainSearchView';
import { StoreProduct } from '../types/store';
import { X, Globe } from 'lucide-react';

interface DomainSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: StoreProduct) => void;
  onOpenCart?: () => void;
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onNavigateToStudio?: () => void;
}

export const DomainSearchModal: React.FC<DomainSearchModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  onOpenCart,
  onOpenLicense,
  onOpenSwitchMesh,
  onNavigateToStudio,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  DrFun1 ICANN Accredited Domain Registrar
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Switch Anycast DNS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Search, check WHOIS RDAP records, and register custom broadcast domains with automated DNS routing.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close Domain Search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <DomainSearchView
            onAddToCart={(product) => {
              if (onAddToCart) onAddToCart(product);
            }}
            onOpenCart={onOpenCart}
            onOpenLicense={onOpenLicense}
            onOpenSwitchMesh={onOpenSwitchMesh}
            onNavigateToStudio={onNavigateToStudio}
          />
        </div>

      </div>
    </div>
  );
};
