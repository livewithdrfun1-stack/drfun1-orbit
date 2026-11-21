/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Stream Recorder Overlay Controls & Local Browser Download Buffer for DrFun1 News.
 * Captures live satellite/news feed segments via HTMLCanvasElement.captureStream() +
 * MediaRecorder into WebM Blobs stored in a local browser download buffer with inline
 * playback preview and one-click file download.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Circle,
  Download,
  Film,
  HardDrive,
  Play,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import {
  GlobalNewsOutlet,
  RecordedStreamClip,
  StreamConnectionPhase,
} from '../types/drfun1News';

interface NewsVideoStreamRecorderProps {
  tunedOutlet: GlobalNewsOutlet;
  activeSourceLabel: string;
  activeSourceProtocol: string;
  activeFeedUrl: string;
  activeRouteLabel: string;
  effectiveBitrateMbps: number;
  latencyMs: number;
  connectionPhase: StreamConnectionPhase;
  onRecordingStateChange?: (recording: boolean, elapsedSec: number) => void;
  onNotify?: (msg: string) => void;
}

const formatDuration = (totalSec: number): string => {
  const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const secs = String(totalSec % 60).padStart(2, '0');
  return `${mins}:${secs}`;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const pickSupportedVideoMime = (): string => {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return '';
};

const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) => {
  const words = text.split(/\s+/);
  let line = '';
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lineCount += 1;
      if (lineCount >= maxLines) {
        ctx.fillText(`${line.slice(0, Math.max(0, line.length - 1))}…`, x, y + (lineCount - 1) * lineHeight);
        return;
      }
      ctx.fillText(line, x, y + (lineCount - 1) * lineHeight);
      line = words[i];
    } else {
      line = testLine;
    }
  }
  if (line && lineCount < maxLines) {
    ctx.fillText(line, x, y + lineCount * lineHeight);
  }
};

export const NewsVideoStreamRecorder: React.FC<NewsVideoStreamRecorderProps> = ({
  tunedOutlet,
  activeSourceLabel,
  activeSourceProtocol,
  activeFeedUrl,
  activeRouteLabel,
  effectiveBitrateMbps,
  latencyMs,
  connectionPhase,
  onRecordingStateChange,
  onNotify,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [liveBufferedBytes, setLiveBufferedBytes] = useState<number>(0);
  const [clips, setClips] = useState<RecordedStreamClip[]>([]);
  const [isBufferOpen, setIsBufferOpen] = useState<boolean>(false);
  const [previewClipId, setPreviewClipId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const drawIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const fallbackFramesRef = useRef<Array<{ ts: string; callSign: string; program: string; headline: string; feedUrl: string }>>([]);
  const clipUrlsRef = useRef<string[]>([]);

  // Always read latest feed metadata inside the recording draw loop
  const latestFeedRef = useRef({
    tunedOutlet,
    activeSourceLabel,
    activeSourceProtocol,
    activeFeedUrl,
    activeRouteLabel,
    effectiveBitrateMbps,
    latencyMs,
    connectionPhase,
  });
  latestFeedRef.current = {
    tunedOutlet,
    activeSourceLabel,
    activeSourceProtocol,
    activeFeedUrl,
    activeRouteLabel,
    effectiveBitrateMbps,
    latencyMs,
    connectionPhase,
  };

  useEffect(() => {
    onRecordingStateChange?.(isRecording, elapsedSec);
  }, [isRecording, elapsedSec, onRecordingStateChange]);

  const stopCaptureLoops = () => {
    if (drawIntervalRef.current !== null) {
      window.clearInterval(drawIntervalRef.current);
      drawIntervalRef.current = null;
    }
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  // Cleanup active recording and revoke object URLs on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (_) {}
      }
      stopCaptureLoops();
      clipUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      clipUrlsRef.current = [];
    };
  }, []);

  const drawBroadcastFrame = (ctx: CanvasRenderingContext2D, width: number, height: number, frameNum: number) => {
    const snap = latestFeedRef.current;
    const elapsed = Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000));

    // Studio gradient background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#1b080c');
    grad.addColorStop(0.5, '#020617');
    grad.addColorStop(1, '#091529');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle broadcast grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < width; gx += 64) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }

    // Top Header Bar
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.fillRect(0, 0, width, 68);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.fillRect(0, 67, width, 2);

    // Outlet Callsign Badge
    ctx.fillStyle = snap.tunedOutlet.accentColor || '#ef4444';
    ctx.fillRect(28, 16, 150, 36);
    ctx.fillStyle = '#020617';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(snap.tunedOutlet.callSign.slice(0, 12), 40, 40);

    // REC indicator & timecode
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(194, 16, 152, 36);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(214, 34, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`REC ${formatDuration(elapsed)}`, 230, 40);

    // Source & Telemetry top-right
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    const rightMeta = `${snap.activeSourceLabel.toUpperCase()} · ${snap.effectiveBitrateMbps} Mbps · ${snap.latencyMs} ms`;
    const rightWidth = ctx.measureText(rightMeta).width;
    ctx.fillText(rightMeta, width - rightWidth - 28, 32);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    const utcNow = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const utcWidth = ctx.measureText(utcNow).width;
    ctx.fillText(utcNow, width - utcWidth - 28, 54);

    // Center Broadcast Program Copy
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(
      `DRFUN1 NEWS SATELLITE RELAY · ${snap.tunedOutlet.country.toUpperCase()} (${snap.tunedOutlet.region.toUpperCase()})`,
      48,
      168
    );

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px sans-serif';
    drawWrappedText(ctx, snap.tunedOutlet.currentProgram, 48, 224, width - 96, 52, 2);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '24px sans-serif';
    drawWrappedText(ctx, snap.tunedOutlet.headline, 48, 342, width - 96, 36, 3);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px monospace';
    ctx.fillText(
      `Desk: ${snap.tunedOutlet.anchorOrDesk}  ·  Route: ${snap.activeRouteLabel}`,
      48,
      480
    );

    // Animated Satellite Carrier Waveform Strip
    const waveY = 556;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 48; x < width - 48; x += 8) {
      const yOffset =
        Math.sin((x + frameNum * 12) * 0.025) * 14 +
        Math.cos((x - frameNum * 7) * 0.06) * 6;
      if (x === 48) ctx.moveTo(x, waveY + yOffset);
      else ctx.lineTo(x, waveY + yOffset);
    }
    ctx.stroke();

    // Bottom Broadcast Chyron Strip
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.fillRect(0, height - 92, width, 92);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, height - 92, 188, 92);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('DRFUN1 LIVE', 24, height - 39);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '20px monospace';
    const chyronText = `[${snap.tunedOutlet.callSign} · ${snap.activeSourceLabel}] ${snap.tunedOutlet.headline}`;
    ctx.fillText(chyronText.slice(0, 88), 208, height - 52);

    ctx.fillStyle = '#67e8f9';
    ctx.font = '14px monospace';
    ctx.fillText(`Feed URI: ${snap.activeFeedUrl}`, 208, height - 22);
  };

  const finalizeClipToBuffer = (blob: Blob, extension: string, durationSec: number) => {
    const snap = latestFeedRef.current;
    const now = new Date();
    const safeSlug = snap.tunedOutlet.callSign.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const stamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `drfun1-news-${safeSlug}-${snap.activeSourceLabel.toLowerCase().replace(/\s+/g, '')}-${stamp}.${extension}`;
    const objectUrl = URL.createObjectURL(blob);
    clipUrlsRef.current.push(objectUrl);

    const newClip: RecordedStreamClip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fileName,
      outletCallSign: snap.tunedOutlet.callSign,
      outletName: snap.tunedOutlet.name,
      programTitle: snap.tunedOutlet.currentProgram,
      sourceLabel: snap.activeSourceLabel,
      sourceProtocol: snap.activeSourceProtocol,
      feedUrl: snap.activeFeedUrl,
      durationSec: Math.max(1, durationSec),
      sizeBytes: blob.size,
      mimeType: blob.type || (extension === 'webm' ? 'video/webm' : 'application/json'),
      objectUrl,
      recordedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setClips((prev) => [newClip, ...prev].slice(0, 12));
    setIsBufferOpen(true);
    onNotify?.(
      `Saved ${formatDuration(newClip.durationSec)} ${snap.tunedOutlet.callSign} clip (${formatBytes(newClip.sizeBytes)}) to local download buffer`
    );
  };

  const startRecording = () => {
    if (isRecording) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onNotify?.('Unable to initialize canvas capture context for Stream Recorder.');
      return;
    }

    startedAtRef.current = Date.now();
    chunksRef.current = [];
    fallbackFramesRef.current = [];
    setElapsedSec(0);
    setLiveBufferedBytes(0);
    setIsRecording(true);

    let frameNum = 0;
    drawBroadcastFrame(ctx, canvas.width, canvas.height, frameNum);

    drawIntervalRef.current = window.setInterval(() => {
      frameNum += 1;
      drawBroadcastFrame(ctx, canvas.width, canvas.height, frameNum);
    }, 42); // ~24 fps smooth broadcast capture

    timerIntervalRef.current = window.setInterval(() => {
      const secs = Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000));
      setElapsedSec(secs);
      if (!mediaRecorderRef.current) {
        const snap = latestFeedRef.current;
        fallbackFramesRef.current.push({
          ts: new Date().toISOString(),
          callSign: snap.tunedOutlet.callSign,
          program: snap.tunedOutlet.currentProgram,
          headline: snap.tunedOutlet.headline,
          feedUrl: snap.activeFeedUrl,
        });
        setLiveBufferedBytes(JSON.stringify(fallbackFramesRef.current).length);
      }
    }, 1000);

    const mimeType = pickSupportedVideoMime();
    if (typeof canvas.captureStream === 'function' && typeof MediaRecorder !== 'undefined') {
      try {
        const stream = canvas.captureStream(24);
        mediaStreamRef.current = stream;
        const recorder = mimeType
          ? new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1_800_000 })
          : new MediaRecorder(stream);

        recorder.ondataavailable = (evt) => {
          if (evt.data && evt.data.size > 0) {
            chunksRef.current.push(evt.data);
            setLiveBufferedBytes((prev) => prev + evt.data.size);
          }
        };

        recorder.onstop = () => {
          const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
          const finalBlob = new Blob(chunksRef.current, {
            type: recorder.mimeType || 'video/webm',
          });
          stopCaptureLoops();
          mediaRecorderRef.current = null;
          setIsRecording(false);
          if (finalBlob.size > 0) {
            finalizeClipToBuffer(finalBlob, 'webm', duration);
          }
        };

        mediaRecorderRef.current = recorder;
        recorder.start(1000);
        onNotify?.(
          `Recording ${tunedOutlet.callSign} (${activeSourceLabel}) to local browser buffer…`
        );
        return;
      } catch (_) {
        // Fall through cleanly to metadata segment capture fallback
        mediaRecorderRef.current = null;
      }
    }

    onNotify?.(
      `Recording ${tunedOutlet.callSign} (${activeSourceLabel}) telemetry segment to local download buffer…`
    );
  };

  const stopRecording = () => {
    if (!isRecording) return;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      return;
    }

    // Fallback finalize if MediaRecorder wasn't supported
    const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    stopCaptureLoops();
    setIsRecording(false);
    const payload = JSON.stringify(
      {
        service: 'DrFun1 News Stream Recorder',
        recordedAt: new Date().toISOString(),
        durationSec: duration,
        frames: fallbackFramesRef.current,
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    finalizeClipToBuffer(blob, 'json', duration);
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleDeleteClip = (clip: RecordedStreamClip) => {
    URL.revokeObjectURL(clip.objectUrl);
    clipUrlsRef.current = clipUrlsRef.current.filter((u) => u !== clip.objectUrl);
    setClips((prev) => prev.filter((c) => c.id !== clip.id));
    if (previewClipId === clip.id) setPreviewClipId(null);
  };

  const handleClearBuffer = () => {
    clips.forEach((c) => URL.revokeObjectURL(c.objectUrl));
    clipUrlsRef.current = [];
    setClips([]);
    setPreviewClipId(null);
    onNotify?.('Cleared local browser download buffer');
  };

  const totalBufferBytes = clips.reduce((sum, c) => sum + c.sizeBytes, 0);
  const previewClip = clips.find((c) => c.id === previewClipId) || null;

  return (
    <div className="inline-flex items-center gap-1.5">
      {/* Stream Recorder Toggle Button */}
      <button
        type="button"
        onClick={handleToggleRecording}
        aria-pressed={isRecording}
        className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
          isRecording
            ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-lg shadow-red-950/60'
            : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-red-500/60'
        }`}
        title={
          isRecording
            ? 'Stop recording and save segment to local browser download buffer'
            : 'Record live satellite news feed segment to local browser download buffer'
        }
      >
        {isRecording ? (
          <>
            <Square className="w-3 h-3 fill-current shrink-0" />
            <span className="tabular-nums">
              REC {formatDuration(elapsedSec)}
              {liveBufferedBytes > 0 ? ` · ${formatBytes(liveBufferedBytes)}` : ''}
            </span>
          </>
        ) : (
          <>
            <Circle className="w-3 h-3 text-red-500 fill-red-500 shrink-0" />
            <span>Record Feed</span>
          </>
        )}
      </button>

      {/* Local Download Buffer Drawer Trigger */}
      {(clips.length > 0 || isRecording) && (
        <button
          type="button"
          onClick={() => setIsBufferOpen((v) => !v)}
          aria-expanded={isBufferOpen}
          className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
            isBufferOpen
              ? 'bg-cyan-600 text-slate-950 border-cyan-400'
              : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700'
          }`}
          title="Open local browser download buffer for recorded stream segments"
        >
          <HardDrive className="w-3 h-3 shrink-0" />
          <span className="tabular-nums">Buffer ({clips.length})</span>
        </button>
      )}

      {/* Local Browser Download Buffer Overlay Panel */}
      {isBufferOpen && (
        <div
          role="dialog"
          aria-label="Stream Recorder Local Download Buffer"
          onClick={(e) => e.stopPropagation()}
          className="absolute left-3 right-3 sm:left-4 sm:right-auto bottom-16 z-30 w-auto sm:w-[410px] max-h-[calc(100%-5rem)] overflow-y-auto rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700 shadow-2xl p-3 space-y-2.5 font-mono text-[11px]"
        >
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 min-w-0">
              <Film className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="font-bold text-white truncate">Local Download Buffer</span>
              <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                {clips.length} {clips.length === 1 ? 'clip' : 'clips'} · {formatBytes(totalBufferBytes)}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {clips.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearBuffer}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 text-[10px] text-slate-300 hover:text-rose-200 cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsBufferOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                aria-label="Close download buffer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isRecording && (
            <div className="px-2.5 py-2 rounded-lg bg-red-950/60 border border-red-500/40 flex items-center justify-between gap-2 text-red-100">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span className="truncate">
                  Capturing {tunedOutlet.callSign} ({activeSourceLabel}) · {formatDuration(elapsedSec)}
                </span>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold shrink-0 cursor-pointer"
              >
                Stop &amp; Save
              </button>
            </div>
          )}

          {previewClip && previewClip.mimeType.startsWith('video/') && (
            <div className="rounded-lg overflow-hidden border border-slate-800 bg-black space-y-1">
              <div className="px-2 py-1 bg-slate-900 flex items-center justify-between text-[10px] text-slate-300">
                <span className="truncate">Preview: {previewClip.outletCallSign} ({formatDuration(previewClip.durationSec)})</span>
                <button
                  type="button"
                  onClick={() => setPreviewClipId(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
              <video
                src={previewClip.objectUrl}
                controls
                autoPlay
                className="w-full max-h-40 bg-black"
              />
            </div>
          )}

          {clips.length === 0 ? (
            <div className="py-4 text-center text-slate-400 text-[11px]">
              Press <strong className="text-white">Record Feed</strong> to capture a segment of the live satellite feed into your browser buffer.
            </div>
          ) : (
            <ul className="divide-y divide-slate-800/80 max-h-48 overflow-y-auto pr-1">
              {clips.map((clip) => (
                <li key={clip.id} className="py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-white font-bold">
                      <span className="truncate">{clip.outletCallSign}</span>
                      <span className="text-slate-500" aria-hidden="true">·</span>
                      <span className="text-cyan-300 font-normal shrink-0">{clip.sourceLabel}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {formatDuration(clip.durationSec)} · {formatBytes(clip.sizeBytes)} · {clip.recordedAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {clip.mimeType.startsWith('video/') && (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewClipId((cur) => (cur === clip.id ? null : clip.id))
                        }
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer"
                        title="Preview recorded clip"
                        aria-label={`Preview ${clip.fileName}`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                    )}

                    <a
                      href={clip.objectUrl}
                      download={clip.fileName}
                      className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 whitespace-nowrap"
                      title={`Download ${clip.fileName}`}
                    >
                      <Download className="w-3 h-3" />
                      <span>Save</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDeleteClip(clip)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/70 border border-slate-700 text-slate-400 hover:text-rose-300 cursor-pointer"
                      title="Delete buffered clip"
                      aria-label={`Delete ${clip.fileName}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
