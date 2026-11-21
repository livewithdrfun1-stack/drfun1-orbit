/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Stream Archive Library Tab for DrFun1 News.
 * Displays locally persisted (IndexedDB) recorded news segments with inline
 * playback preview, metadata editing (title/notes/star), filtering, sorting,
 * batch deletion, and batch ZIP download.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  ArrowLeft,
  Check,
  CheckSquare,
  Clock,
  Download,
  Edit3,
  FileArchive,
  Film,
  HardDrive,
  Play,
  Radio,
  Search,
  Square,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { RecordedStreamClip } from '../types/drfun1News';
import { buildBatchArchiveZip } from '../utils/streamArchiveDb';

interface DrFun1StreamArchiveTabProps {
  clips: RecordedStreamClip[];
  isLoading: boolean;
  isRecording: boolean;
  recordingElapsedSec: number;
  activeCallSign: string;
  onUpdateClipMeta: (
    id: string,
    patch: Partial<Pick<RecordedStreamClip, 'title' | 'isStarred' | 'notes'>>
  ) => void;
  onDeleteClip: (clip: RecordedStreamClip) => void;
  onDeleteClips: (ids: string[]) => void;
  onClearAllClips: () => void;
  onReturnToLiveDesk: () => void;
  onTuneOutletId?: (outletId: string) => void;
  onNotify?: (msg: string) => void;
}

type ArchiveSortMode = 'newest' | 'oldest' | 'longest' | 'largest';

const formatDuration = (totalSec: number): string => {
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatRecordedTimestamp = (clip: RecordedStreamClip): string => {
  if (clip.recordedAtMs) {
    const d = new Date(clip.recordedAtMs);
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}`;
  }
  return clip.recordedAt;
};

export const DrFun1StreamArchiveTab: React.FC<DrFun1StreamArchiveTabProps> = ({
  clips,
  isLoading,
  isRecording,
  recordingElapsedSec,
  activeCallSign,
  onUpdateClipMeta,
  onDeleteClip,
  onDeleteClips,
  onClearAllClips,
  onReturnToLiveDesk,
  onTuneOutletId,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [starredOnly, setStarredOnly] = useState<boolean>(false);
  const [sortMode, setSortMode] = useState<ArchiveSortMode>('newest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [isPackagingZip, setIsPackagingZip] = useState<boolean>(false);
  const [confirmBatchDelete, setConfirmBatchDelete] = useState<boolean>(false);
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);

  // Inline editor state for active clip
  const [isEditingMeta, setIsEditingMeta] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Keep selection & active clip synced if clips are deleted
  useEffect(() => {
    const validIds = new Set(clips.map((c) => c.id));
    setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
    setActiveClipId((prev) => {
      if (prev && validIds.has(prev)) return prev;
      return clips[0]?.id ?? null;
    });
  }, [clips]);

  const availableSources = useMemo(() => {
    const unique = Array.from(new Set(clips.map((c) => c.sourceLabel).filter(Boolean)));
    return ['All', ...unique];
  }, [clips]);

  const filteredClips = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = clips.filter((clip) => {
      if (sourceFilter !== 'All' && clip.sourceLabel !== sourceFilter) return false;
      if (starredOnly && !clip.isStarred) return false;
      if (!q) return true;
      return (
        (clip.title || '').toLowerCase().includes(q) ||
        clip.outletCallSign.toLowerCase().includes(q) ||
        clip.outletName.toLowerCase().includes(q) ||
        clip.programTitle.toLowerCase().includes(q) ||
        clip.sourceLabel.toLowerCase().includes(q) ||
        clip.fileName.toLowerCase().includes(q) ||
        (clip.notes || '').toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortMode === 'oldest') return (a.recordedAtMs || 0) - (b.recordedAtMs || 0);
      if (sortMode === 'longest') return b.durationSec - a.durationSec;
      if (sortMode === 'largest') return b.sizeBytes - a.sizeBytes;
      return (b.recordedAtMs || 0) - (a.recordedAtMs || 0);
    });
  }, [clips, searchQuery, sourceFilter, starredOnly, sortMode]);

  const activeClip = useMemo(
    () => clips.find((c) => c.id === activeClipId) || filteredClips[0] || null,
    [clips, activeClipId, filteredClips]
  );

  // Sync editor inputs when active clip changes
  useEffect(() => {
    if (activeClip) {
      setEditTitle(activeClip.title || `${activeClip.outletCallSign} — ${activeClip.programTitle}`);
      setEditNotes(activeClip.notes || '');
      setIsEditingMeta(false);
    }
  }, [activeClip?.id]);

  const totalBytes = useMemo(() => clips.reduce((sum, c) => sum + c.sizeBytes, 0), [clips]);
  const totalDurationSec = useMemo(() => clips.reduce((sum, c) => sum + c.durationSec, 0), [clips]);

  const selectedClips = useMemo(
    () => clips.filter((c) => selectedIds.includes(c.id)),
    [clips, selectedIds]
  );
  const selectedBytes = useMemo(
    () => selectedClips.reduce((sum, c) => sum + c.sizeBytes, 0),
    [selectedClips]
  );

  const allFilteredSelected =
    filteredClips.length > 0 && filteredClips.every((c) => selectedIds.includes(c.id));

  const handleToggleSelect = (id: string) => {
    setConfirmBatchDelete(false);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllFiltered = () => {
    setConfirmBatchDelete(false);
    if (allFilteredSelected) {
      const filteredIdSet = new Set(filteredClips.map((c) => c.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      const merged = new Set([...selectedIds, ...filteredClips.map((c) => c.id)]);
      setSelectedIds(Array.from(merged));
    }
  };

  const handleBatchDownloadZip = async () => {
    const targets = selectedClips.length > 0 ? selectedClips : filteredClips;
    if (targets.length === 0 || isPackagingZip) return;

    setIsPackagingZip(true);
    try {
      const zipBlob = await buildBatchArchiveZip(targets);
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const zipFileName = `drfun1-news-stream-archive-${targets.length}clips-${stamp}.zip`;
      const zipUrl = URL.createObjectURL(zipBlob);
      const anchor = document.createElement('a');
      anchor.href = zipUrl;
      anchor.download = zipFileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.setTimeout(() => URL.revokeObjectURL(zipUrl), 15_000);
      onNotify?.(
        `Downloaded ZIP archive with ${targets.length} recorded ${targets.length === 1 ? 'segment' : 'segments'} (${formatBytes(zipBlob.size)})`
      );
    } catch {
      onNotify?.('Unable to package batch ZIP archive — try downloading clips individually.');
    } finally {
      setIsPackagingZip(false);
    }
  };

  const handleConfirmBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (!confirmBatchDelete) {
      setConfirmBatchDelete(true);
      return;
    }
    const count = selectedIds.length;
    onDeleteClips(selectedIds);
    setSelectedIds([]);
    setConfirmBatchDelete(false);
    onNotify?.(`Deleted ${count} recorded ${count === 1 ? 'segment' : 'segments'} from Stream Archive`);
  };

  const handleSaveMetaEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClip) return;
    onUpdateClipMeta(activeClip.id, {
      title: editTitle.trim() || `${activeClip.outletCallSign} — ${activeClip.programTitle}`,
      notes: editNotes.trim(),
    });
    setIsEditingMeta(false);
    onNotify?.(`Updated archive metadata for ${activeClip.outletCallSign}`);
  };

  const batchDownloadTargetCount = selectedClips.length > 0 ? selectedClips.length : filteredClips.length;

  return (
    <section
      aria-label="Stream Archive Library"
      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4"
    >
      {/* Archive Header & Local Storage Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Archive className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">
                Stream Archive Library
              </h2>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-cyan-300 font-bold uppercase whitespace-nowrap">
                Local Browser IndexedDB
              </span>
              {isRecording && (
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-bold flex items-center gap-1.5 tabular-nums whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>
                    REC {activeCallSign} · {formatDuration(recordingElapsedSec)}
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review, label, star, and batch-download recorded satellite news segments stored locally in your browser.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] tabular-nums">
            <span className="text-slate-300">
              <strong className="text-white">{clips.length}</strong> {clips.length === 1 ? 'clip' : 'clips'}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              {formatDuration(totalDurationSec)}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-300 flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              {formatBytes(totalBytes)}
            </span>
          </div>

          <button
            type="button"
            onClick={onReturnToLiveDesk}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isRecording ? 'Return to Live Recording' : 'Record New Segment'}</span>
          </button>
        </div>
      </div>

      {/* Filter, Search & Batch Action Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search archived clips by call sign, program, title, or notes…"
              className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-xs text-white placeholder-slate-500 font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              aria-label="Filter archive by stream source"
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              {availableSources.map((src) => (
                <option key={src} value={src}>
                  {src === 'All' ? 'All Sources' : src}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setStarredOnly((v) => !v)}
              aria-pressed={starredOnly}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                starredOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${starredOnly ? 'fill-amber-300' : ''}`} />
              <span>Starred</span>
            </button>

            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as ArchiveSortMode)}
              aria-label="Sort archived clips"
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="longest">Sort: Longest Duration</option>
              <option value="largest">Sort: Largest File Size</option>
            </select>
          </div>
        </div>

        {/* Batch Management & Batch ZIP Download Bar */}
        {clips.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
              <button
                type="button"
                onClick={handleToggleSelectAllFiltered}
                className="flex items-center gap-1.5 text-slate-200 hover:text-white cursor-pointer"
              >
                {allFilteredSelected ? (
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>{allFilteredSelected ? 'Deselect All' : 'Select All'}</span>
              </button>

              <span className="text-slate-600">|</span>

              <span className="text-slate-400 tabular-nums">
                {selectedClips.length > 0 ? (
                  <>
                    <strong className="text-cyan-300">{selectedClips.length}</strong> selected (
                    {formatBytes(selectedBytes)})
                  </>
                ) : (
                  <>Showing {filteredClips.length} of {clips.length} stored clips</>
                )}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={batchDownloadTargetCount === 0 || isPackagingZip}
                onClick={handleBatchDownloadZip}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                title="Package recorded segments and metadata manifest into a single ZIP file"
              >
                <FileArchive className="w-3.5 h-3.5" />
                <span>
                  {isPackagingZip
                    ? 'Packaging ZIP…'
                    : selectedClips.length > 0
                      ? `Batch Download ZIP (${selectedClips.length})`
                      : `Download All ZIP (${filteredClips.length})`}
                </span>
              </button>

              {selectedClips.length > 0 && (
                <button
                  type="button"
                  onClick={handleConfirmBatchDelete}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    confirmBatchDelete
                      ? 'bg-rose-600 text-white border-rose-400'
                      : 'bg-slate-950 hover:bg-rose-950/60 text-rose-300 border-rose-500/40'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {confirmBatchDelete
                      ? `Confirm Delete (${selectedClips.length})`
                      : `Delete Selected (${selectedClips.length})`}
                  </span>
                </button>
              )}

              {selectedClips.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (!confirmClearAll) {
                      setConfirmClearAll(true);
                      return;
                    }
                    onClearAllClips();
                    setConfirmClearAll(false);
                  }}
                  onMouseLeave={() => setConfirmClearAll(false)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold whitespace-nowrap cursor-pointer ${
                    confirmClearAll
                      ? 'bg-rose-600 text-white border-rose-400'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-300 border-slate-700'
                  }`}
                >
                  {confirmClearAll ? 'Confirm Clear Archive' : 'Clear Archive'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area: Loading / Empty State / Split Library + Inspector */}
      {isLoading ? (
        <div className="py-16 text-center font-mono text-xs text-slate-400">
          Loading locally stored stream archive segments from IndexedDB…
        </div>
      ) : clips.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 py-14 px-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto">
            <Film className="w-6 h-6 text-slate-500" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-white">No Recorded News Segments Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use the <strong className="text-red-400 font-mono">Record Feed</strong> toggle inside the live video player overlay to capture satellite news clips. Every saved segment is stored locally in your browser&apos;s IndexedDB archive for playback and batch ZIP export.
            </p>
          </div>
          <button
            type="button"
            onClick={onReturnToLiveDesk}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Open Live Broadcast Desk</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* Left Column: Recorded Segments List */}
          <div className="xl:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            {filteredClips.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs font-mono text-slate-400 space-y-2">
                <div>No archived segments match your current search or filter criteria.</div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSourceFilter('All');
                    setStarredOnly(false);
                  }}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-slate-800/80 max-h-[560px] overflow-y-auto">
                {filteredClips.map((clip) => {
                  const isSelected = selectedIds.includes(clip.id);
                  const isActive = activeClip?.id === clip.id;
                  return (
                    <li
                      key={clip.id}
                      onClick={() => setActiveClipId(clip.id)}
                      className={`p-3 flex items-start sm:items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-cyan-950/35 border-l-2 border-l-cyan-400'
                          : 'hover:bg-slate-900/90 border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(clip.id);
                          }}
                          className="mt-0.5 text-slate-400 hover:text-cyan-300 shrink-0 cursor-pointer"
                          aria-label={isSelected ? `Deselect ${clip.fileName}` : `Select ${clip.fileName}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateClipMeta(clip.id, { isStarred: !clip.isStarred });
                          }}
                          className="mt-0.5 text-slate-500 hover:text-amber-300 shrink-0 cursor-pointer"
                          aria-label={clip.isStarred ? 'Unstar segment' : 'Star segment'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              clip.isStarred ? 'text-amber-400 fill-amber-400' : ''
                            }`}
                          />
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-red-600/20 border border-red-500/40 text-red-300 font-mono text-[10px] font-bold shrink-0">
                              {clip.outletCallSign}
                            </span>
                            <span className="text-xs font-bold text-white truncate">
                              {clip.title || clip.programTitle}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 font-mono text-[10.5px] text-slate-400 tabular-nums">
                            <span className="text-cyan-300">{clip.sourceLabel}</span>
                            <span>·</span>
                            <span>{formatDuration(clip.durationSec)}</span>
                            <span>·</span>
                            <span>{formatBytes(clip.sizeBytes)}</span>
                            <span>·</span>
                            <span>{formatRecordedTimestamp(clip)}</span>
                          </div>
                          {clip.notes && (
                            <p className="text-[11px] text-slate-400 truncate mt-1">
                              Note: {clip.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-1.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveClipId(clip.id)}
                          className={`p-1.5 rounded-lg border cursor-pointer ${
                            isActive
                              ? 'bg-cyan-600 text-slate-950 border-cyan-400'
                              : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-700'
                          }`}
                          title="Inspect and play segment"
                          aria-label={`Play ${clip.fileName}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>

                        <a
                          href={clip.objectUrl}
                          download={clip.fileName}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-mono font-bold flex items-center gap-1 whitespace-nowrap"
                          title={`Download ${clip.fileName}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Save</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => onDeleteClip(clip)}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950/70 border border-slate-700 text-slate-400 hover:text-rose-300 cursor-pointer"
                          title="Delete archived segment"
                          aria-label={`Delete ${clip.fileName}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Right Column: Archive Preview Player & Segment Metadata Inspector */}
          <div className="xl:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3.5">
            {activeClip ? (
              <>
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                      Segment Inspector · {activeClip.outletName}
                    </div>
                    <h3 className="text-sm font-bold text-white truncate mt-0.5">
                      {activeClip.title || activeClip.programTitle}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditingMeta((v) => !v)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-200 flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingMeta ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>

                {/* Inline Video / Telemetry Playback */}
                {activeClip.mimeType.startsWith('video/') ? (
                  <div className="rounded-lg overflow-hidden border border-slate-800 bg-black">
                    <video
                      key={activeClip.id}
                      src={activeClip.objectUrl}
                      controls
                      className="w-full aspect-video bg-black"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 space-y-1.5">
                    <div className="text-amber-300 font-bold">Telemetry Segment Capture (JSON)</div>
                    <p className="text-[11px] text-slate-400">
                      Captured via fallback metadata recorder when MediaRecorder video encoding was unavailable. Use Save to inspect the structured segment log.
                    </p>
                  </div>
                )}

                {/* Metadata Edit Form OR Read-Only Specs */}
                {isEditingMeta ? (
                  <form onSubmit={handleSaveMetaEdits} className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Clip Label
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Producer Notes
                      </label>
                      <textarea
                        rows={2}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Add desk notes, breaking context, or timecode markers…"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-xs text-white font-mono resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingMeta(false)}
                        className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Metadata</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <dl className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                    <div>
                      <dt className="text-slate-500 text-[10px] uppercase">Source Feed</dt>
                      <dd className="text-cyan-300 font-bold truncate">
                        {activeClip.sourceLabel} ({activeClip.sourceProtocol})
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 text-[10px] uppercase">Duration &amp; Size</dt>
                      <dd className="text-white tabular-nums">
                        {formatDuration(activeClip.durationSec)} · {formatBytes(activeClip.sizeBytes)}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-500 text-[10px] uppercase">Recorded Program</dt>
                      <dd className="text-slate-200 truncate">{activeClip.programTitle}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-500 text-[10px] uppercase">Filename</dt>
                      <dd className="text-slate-300 truncate">{activeClip.fileName}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-500 text-[10px] uppercase">Stream URI</dt>
                      <dd className="text-slate-400 truncate">{activeClip.feedUrl}</dd>
                    </div>
                    {activeClip.notes && (
                      <div className="col-span-2 pt-1 border-t border-slate-800">
                        <dt className="text-slate-500 text-[10px] uppercase">Producer Notes</dt>
                        <dd className="text-slate-200 whitespace-pre-wrap mt-0.5">{activeClip.notes}</dd>
                      </div>
                    )}
                  </dl>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={activeClip.objectUrl}
                      download={activeClip.fileName}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Clip</span>
                    </a>

                    {activeClip.outletId && onTuneOutletId && (
                      <button
                        type="button"
                        onClick={() => onTuneOutletId(activeClip.outletId!)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Tune {activeClip.outletCallSign}</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteClip(activeClip)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-xs font-mono text-slate-500">
                Select a recorded segment from the archive list to preview and manage its metadata.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
