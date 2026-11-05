/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Orbit Tracking Map Fullscreen / Dialog Modal Launcher
 */

import React, { useEffect, useState } from 'react';
import {
  Satellite,
  Globe,
  X,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Server,
  Radio,
  ExternalLink
} from 'lucide-react';
import { LeafletSatelliteTracker } from './LeafletSatelliteTracker';

interface OrbitTrackingMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
}

export const OrbitTrackingMapModal: React.FC<OrbitTrackingMapModalProps> = ({
  isOpen,
  onClose,
  onOpenLicense,
  onOpenSwitchMesh
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        className={`bg-slate-950 border border-slate-800 rounded-2xl w-full shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
          isFullscreen 
            ? 'fixed inset-2 sm:inset-4 z-50 max-h-[96vh]' 
            : 'max-w-7xl max-h-[92vh] my-auto'
        }`}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-900/40 flex items-center justify-center">
              <Satellite className="w-5 h-5 text-white animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Orbit Tracking Map
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                  SGP4 Engine
                </span>
                <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Telemetry Live</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Global real-time satellite tracking, Day/Night solar terminator curve, and Switch SUPERNAP teleport uplinks
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition cursor-pointer"
              title="Close Orbit Map (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-nav-scrollbar bg-slate-950">
          <LeafletSatelliteTracker
            onOpenLicense={onOpenLicense}
            onOpenSwitchMesh={onOpenSwitchMesh}
            isModalView={true}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
            <span>Uplink Gateway: <strong className="text-emerald-400">Switch SUPERNAP Las Vegas</strong></span>
            <span>·</span>
            <span>FCC FRN: <strong className="text-slate-300">0034981290</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenSwitchMesh && (
              <button
                onClick={onOpenSwitchMesh}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono transition cursor-pointer flex items-center space-x-1"
              >
                <Server className="w-3 h-3 text-emerald-400" />
                <span>Switch Teleport Network</span>
              </button>
            )}

            {onOpenLicense && (
              <button
                onClick={onOpenLicense}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono transition cursor-pointer flex items-center space-x-1"
              >
                <ShieldCheck className="w-3 h-3 text-sky-400" />
                <span>Legal License (wittlawfirm.com)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
