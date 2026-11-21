/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Persistent Native Picture-in-Picture (PiP) Broadcast Stream Controller for DrFun1 News.
 * Renders the active news feed onto a 1280x720 HD canvas MediaStream piped into a
 * document.body-hosted <video> element so browser native Picture-in-Picture stays alive
 * even when the user navigates away from DrFun1NewsView to other app sections.
 * Includes automatic in-app floating PiP fallback if native PiP is blocked by browser policy.
 */

import { GlobalNewsOutlet, StreamConnectionPhase } from '../types/drfun1News';

export type PipActiveMode = 'off' | 'native' | 'fallback';

export interface NewsPipSnapshot {
  outlet: GlobalNewsOutlet;
  sourceLabel: string;
  sourceProtocol: string;
  routeLabel: string;
  feedUrl: string;
  bitrateMbps: number;
  latencyMs: number;
  connectionPhase: StreamConnectionPhase;
  isPlaying: boolean;
  showCaptions: boolean;
  normalizedDbLabel?: string;
}

export interface NewsPipState {
  mode: PipActiveMode;
  snapshot: NewsPipSnapshot | null;
  stream: MediaStream | null;
}

type PipListener = (state: NewsPipState) => void;

const drawWrappedLines = (
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
    const candidate = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lineCount += 1;
      if (lineCount >= maxLines) {
        ctx.fillText(
          `${line.slice(0, Math.max(0, line.length - 1))}…`,
          x,
          y + (lineCount - 1) * lineHeight
        );
        return;
      }
      ctx.fillText(line, x, y + (lineCount - 1) * lineHeight);
      line = words[i];
    } else {
      line = candidate;
    }
  }
  if (line && lineCount < maxLines) {
    ctx.fillText(line, x, y + lineCount * lineHeight);
  }
};

class NewsPictureInPictureController {
  private mode: PipActiveMode = 'off';
  private snapshot: NewsPipSnapshot | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private drawIntervalId: number | null = null;
  private frameNum = 0;
  private listeners = new Set<PipListener>();

  public subscribe(listener: PipListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): NewsPipState {
    return {
      mode: this.mode,
      snapshot: this.snapshot,
      stream: this.stream,
    };
  }

  private emit(): void {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public updateSnapshot(next: NewsPipSnapshot): void {
    this.snapshot = next;
    this.syncMediaSession(next);
    if (this.mode !== 'off') {
      this.drawCurrentFrame();
      this.emit();
    }
  }

  public togglePlayPause(): void {
    if (!this.snapshot) return;
    this.snapshot = { ...this.snapshot, isPlaying: !this.snapshot.isPlaying };
    this.drawCurrentFrame();
    this.emit();
  }

  private syncMediaSession(snap: NewsPipSnapshot): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${snap.outlet.callSign} — ${snap.outlet.currentProgram}`,
        artist: `${snap.outlet.name} (${snap.sourceLabel})`,
        album: 'DrFun1 News Global Relay',
      });
      navigator.mediaSession.setActionHandler('play', () => {
        if (this.snapshot) {
          this.snapshot = { ...this.snapshot, isPlaying: true };
          this.emit();
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (this.snapshot) {
          this.snapshot = { ...this.snapshot, isPlaying: false };
          this.emit();
        }
      });
    } catch {
      // MediaSession not supported in all browsers
    }
  }

  private drawCurrentFrame(): void {
    if (!this.canvas || !this.snapshot) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const snap = this.snapshot;
    const width = this.canvas.width;
    const height = this.canvas.height;
    if (snap.isPlaying) {
      this.frameNum += 1;
    }

    // Studio broadcast gradient backdrop
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#1c070c');
    grad.addColorStop(0.5, '#020617');
    grad.addColorStop(1, '#08172e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle broadcast grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < width; gx += 64) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }

    // Top Broadcast Masthead Bar
    ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
    ctx.fillRect(0, 0, width, 74);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.65)';
    ctx.fillRect(0, 73, width, 2);

    // Callsign badge
    ctx.fillStyle = snap.outlet.accentColor || '#ef4444';
    ctx.fillRect(28, 17, 164, 40);
    ctx.fillStyle = '#020617';
    ctx.font = 'bold 21px monospace';
    ctx.fillText(snap.outlet.callSign.slice(0, 12), 42, 44);

    // Live / Mirror / Paused status pill
    const statusLabel = !snap.isPlaying
      ? 'PAUSED'
      : snap.connectionPhase === 'reconnecting'
        ? 'RECONNECTING'
        : snap.connectionPhase === 'mirror_active'
          ? 'MIRROR LIVE'
          : snap.connectionPhase === 'disconnected' || snap.connectionPhase === 'failed'
            ? 'OFFLINE'
            : snap.outlet.status;
    ctx.fillStyle = !snap.isPlaying
      ? '#475569'
      : snap.connectionPhase === 'mirror_active'
        ? '#0891b2'
        : snap.connectionPhase === 'reconnecting'
          ? '#d97706'
          : '#dc2626';
    ctx.fillRect(206, 17, 168, 40);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(226, 37, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 18px monospace';
    ctx.fillText(statusLabel, 242, 44);

    // Top-right source telemetry & UTC clock
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 17px monospace';
    const metaRight = `${snap.sourceLabel.toUpperCase()} · ${snap.bitrateMbps} Mbps · ${snap.latencyMs} ms${
      snap.normalizedDbLabel ? ` · ${snap.normalizedDbLabel}` : ''
    }`;
    const metaW = ctx.measureText(metaRight).width;
    ctx.fillText(metaRight, width - metaW - 28, 34);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px monospace';
    const clock = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const clockStr = `DRFUN1 NEWS PiP · ${clock}`;
    const clockW = ctx.measureText(clockStr).width;
    ctx.fillText(clockStr, width - clockW - 28, 58);

    // Center Broadcast Program & Headline
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(
      `DRFUN1 NEWS WORLD RELAY · ${snap.outlet.country.toUpperCase()} (${snap.outlet.region.toUpperCase()})`,
      48,
      154
    );

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 46px sans-serif';
    drawWrappedLines(ctx, snap.outlet.currentProgram, 48, 218, width - 96, 56, 2);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '26px sans-serif';
    drawWrappedLines(ctx, snap.outlet.headline, 48, 342, width - 96, 38, 3);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '19px monospace';
    ctx.fillText(
      `Anchor/Bureau: ${snap.outlet.anchorOrDesk}  ·  ${snap.routeLabel}`,
      48,
      486
    );

    // Animated RF Satellite Carrier Waveform
    const waveY = 556;
    ctx.strokeStyle = snap.isPlaying ? 'rgba(56, 189, 248, 0.85)' : 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 48; x < width - 48; x += 8) {
      const amp = snap.isPlaying ? 1 : 0.15;
      const offset =
        (Math.sin((x + this.frameNum * 11) * 0.024) * 16 +
          Math.cos((x - this.frameNum * 6) * 0.055) * 7) *
        amp;
      if (x === 48) ctx.moveTo(x, waveY + offset);
      else ctx.lineTo(x, waveY + offset);
    }
    ctx.stroke();

    // Bottom Live Chyron Strip
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, height - 96, width, 96);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, height - 96, 210, 96);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('DRFUN1 LIVE', 26, height - 40);

    const tickerText = `${
      snap.showCaptions ? `[CC · ${snap.outlet.callSign}] ` : `[${snap.outlet.callSign}] `
    }${snap.outlet.headline}   •••   ${snap.outlet.name} (${snap.sourceLabel} · ${snap.sourceProtocol})   •••   `;
    ctx.save();
    ctx.beginPath();
    ctx.rect(224, height - 96, width - 244, 96);
    ctx.clip();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '23px monospace';
    const textWidth = Math.max(600, ctx.measureText(tickerText).width);
    const scrollX = (this.frameNum * 3) % textWidth;
    ctx.fillText(tickerText, 232 - scrollX, height - 52);
    ctx.fillText(tickerText, 232 - scrollX + textWidth, height - 52);

    ctx.fillStyle = '#67e8f9';
    ctx.font = '15px monospace';
    ctx.fillText(`Live URI: ${snap.feedUrl}`, 232, height - 20);
    ctx.restore();
  }

  private ensureStreamReady(): MediaStream | null {
    if (typeof document === 'undefined') return null;

    if (!this.canvas) {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      this.canvas = canvas;
    }

    this.drawCurrentFrame();

    if (this.drawIntervalId === null) {
      this.drawIntervalId = window.setInterval(() => {
        this.drawCurrentFrame();
      }, 42); // ~24 fps smooth broadcast PiP stream
    }

    if (!this.stream && typeof this.canvas.captureStream === 'function') {
      this.stream = this.canvas.captureStream(24);
    }

    return this.stream;
  }

  private ensureVideoHost(stream: MediaStream): HTMLVideoElement {
    if (!this.videoEl) {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.style.position = 'fixed';
      video.style.width = '1px';
      video.style.height = '1px';
      video.style.bottom = '0';
      video.style.right = '0';
      video.style.opacity = '0.001';
      video.style.pointerEvents = 'none';
      video.style.zIndex = '-1';
      video.setAttribute('aria-hidden', 'true');

      video.addEventListener('leavepictureinpicture', () => {
        if (this.mode === 'native') {
          this.stopAll();
        }
      });

      document.body.appendChild(video);
      this.videoEl = video;
    }

    if (this.videoEl.srcObject !== stream) {
      this.videoEl.srcObject = stream;
    }
    return this.videoEl;
  }

  public async enterPip(snapshot: NewsPipSnapshot): Promise<PipActiveMode> {
    this.snapshot = snapshot;
    this.syncMediaSession(snapshot);

    const stream = this.ensureStreamReady();
    if (!stream) {
      this.mode = 'fallback';
      this.emit();
      return 'fallback';
    }

    const video = this.ensureVideoHost(stream);

    try {
      await video.play();
    } catch {
      // Continue and attempt PiP / fallback cleanly
    }

    // Wait briefly for loadedmetadata if readyState is 0 so native requestPictureInPicture succeeds
    if (video.readyState < 1) {
      await new Promise<void>((resolve) => {
        const onMeta = () => {
          video.removeEventListener('loadedmetadata', onMeta);
          resolve();
        };
        video.addEventListener('loadedmetadata', onMeta, { once: true });
        window.setTimeout(() => {
          video.removeEventListener('loadedmetadata', onMeta);
          resolve();
        }, 600);
      });
    }

    // 1. Standard Browser Native Picture-in-Picture API (Chrome, Edge, Opera, Arc, etc.)
    const canStandardPip =
      typeof document !== 'undefined' &&
      'pictureInPictureEnabled' in document &&
      document.pictureInPictureEnabled &&
      typeof video.requestPictureInPicture === 'function';

    if (canStandardPip) {
      try {
        if (document.pictureInPictureElement === video) {
          this.mode = 'native';
          this.emit();
          return 'native';
        }
        await video.requestPictureInPicture();
        this.mode = 'native';
        this.emit();
        return 'native';
      } catch {
        // Fall through to Safari PiP or in-app floating fallback
      }
    }

    // 2. Safari WebKit Native Picture-in-Picture API
    const webkitVideo = video as HTMLVideoElement & {
      webkitSupportsPresentationMode?: (mode: string) => boolean;
      webkitSetPresentationMode?: (mode: string) => void;
    };
    if (
      typeof webkitVideo.webkitSupportsPresentationMode === 'function' &&
      typeof webkitVideo.webkitSetPresentationMode === 'function' &&
      webkitVideo.webkitSupportsPresentationMode('picture-in-picture')
    ) {
      try {
        webkitVideo.webkitSetPresentationMode('picture-in-picture');
        this.mode = 'native';
        this.emit();
        return 'native';
      } catch {
        // Fall through to in-app floating fallback
      }
    }

    // 3. Resilient In-App Floating Picture-in-Picture Fallback (persists across all app sections)
    this.mode = 'fallback';
    this.emit();
    return 'fallback';
  }

  public async exitPip(): Promise<void> {
    if (
      typeof document !== 'undefined' &&
      document.pictureInPictureElement &&
      typeof document.exitPictureInPicture === 'function'
    ) {
      try {
        await document.exitPictureInPicture();
      } catch {
        // Already closed
      }
    }
    this.stopAll();
  }

  private stopAll(): void {
    if (this.drawIntervalId !== null) {
      window.clearInterval(this.drawIntervalId);
      this.drawIntervalId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.srcObject = null;
      this.videoEl.remove();
      this.videoEl = null;
    }
    this.mode = 'off';
    this.emit();
  }
}

export const newsPipController = new NewsPictureInPictureController();
