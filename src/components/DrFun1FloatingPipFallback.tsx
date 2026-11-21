/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Persistent In-App Floating Picture-in-Picture Fallback Window.
 * Mounted at the root of App.tsx and shown ONLY if the browser/iframe environment
 * blocks native document.requestPictureInPicture(), ensuring the popped-out
 * DrFun1 News stream still stays on top while navigating all app sections.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Maximize2,
  Pause,
  PictureInPicture2,
  Play,
  X,
} from 'lucide-react';
import { newsPipController, NewsPipState } from '../utils/newsPictureInPicture';

interface DrFun1FloatingPipFallbackProps {
  onReturnToNews?: () => void;
}

export const DrFun1FloatingPipFallback: React.FC<DrFun1FloatingPipFallbackProps> = ({
  onReturnToNews,
}) => {
  const [pipState, setPipState] = useState<NewsPipState>(() => newsPipController.getState());
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return newsPipController.subscribe(setPipState);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || pipState.mode !== 'fallback' || !pipState.stream) return;
    if (video.srcObject !== pipState.stream) {
      video.srcObject = pipState.stream;
    }
    void video.play().catch(() => {});
  }, [pipState.mode, pipState.stream]);

  if (pipState.mode !== 'fallback' || !pipState.snapshot) {
    return null;
  }

  const { snapshot } = pipState;

  return (
    <aside
      aria-label="DrFun1 News Floating Picture-in-Picture Player"
      className="fixed bottom-20 lg:bottom-5 left-4 z-50 w-[320px] sm:w-[370px] rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/60 shadow-2xl shadow-black/80 font-mono"
    >
      <div className="px-2.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <PictureInPicture2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-bold text-white truncate">
            {snapshot.outlet.callSign} · {snapshot.sourceLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => newsPipController.togglePlayPause()}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            title={snapshot.isPlaying ? 'Pause stream' : 'Resume stream'}
            aria-label={snapshot.isPlaying ? 'Pause pop-out stream' : 'Resume pop-out stream'}
          >
            {snapshot.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>

          {onReturnToNews && (
            <button
              type="button"
              onClick={onReturnToNews}
              className="p-1 rounded text-cyan-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              title="Return to DrFun1 News Broadcast Desk"
              aria-label="Return to DrFun1 News"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={() => void newsPipController.exitPip()}
            className="p-1 rounded text-slate-400 hover:text-rose-300 hover:bg-slate-800 cursor-pointer"
            title="Close Picture-in-Picture"
            aria-label="Close Picture-in-Picture"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative bg-black aspect-video">
        {pipState.stream ? (
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full p-3 flex flex-col justify-between bg-gradient-to-br from-[#1b080c] via-slate-950 to-[#091529]">
            <div className="text-[10px] text-red-400 font-bold">
              DRFUN1 NEWS · {snapshot.outlet.country}
            </div>
            <div className="text-xs font-bold text-white line-clamp-2">
              {snapshot.outlet.currentProgram}
            </div>
            <div className="text-[10px] text-slate-300 line-clamp-2">
              {snapshot.outlet.headline}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
