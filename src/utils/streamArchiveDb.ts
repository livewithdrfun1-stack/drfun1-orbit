/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Local Browser IndexedDB persistence & standard ZIP archive packager for
 * DrFun1 News Stream Recorder segments.
 */

import { RecordedStreamClip } from '../types/drfun1News';

const DB_NAME = 'drfun1_news_stream_archive_v1';
const DB_VERSION = 1;
const STORE_NAME = 'clips';

export interface StoredClipRecord {
  id: string;
  fileName: string;
  title?: string;
  outletId?: string;
  outletCallSign: string;
  outletName: string;
  programTitle: string;
  sourceLabel: string;
  sourceProtocol: string;
  feedUrl: string;
  durationSec: number;
  sizeBytes: number;
  mimeType: string;
  recordedAt: string;
  recordedAtMs: number;
  isStarred?: boolean;
  notes?: string;
  blob: Blob;
}

const isIndexedDbAvailable = (): boolean =>
  typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

const openArchiveDb = (): Promise<IDBDatabase | null> => {
  if (!isIndexedDbAvailable()) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('recordedAtMs', 'recordedAtMs', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
};

export const loadArchivedClips = async (): Promise<RecordedStreamClip[]> => {
  const db = await openArchiveDb();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const records = (req.result as StoredClipRecord[]) || [];
        const clips: RecordedStreamClip[] = records
          .sort((a, b) => (b.recordedAtMs || 0) - (a.recordedAtMs || 0))
          .map((rec) => ({
            id: rec.id,
            fileName: rec.fileName,
            title: rec.title,
            outletId: rec.outletId,
            outletCallSign: rec.outletCallSign,
            outletName: rec.outletName,
            programTitle: rec.programTitle,
            sourceLabel: rec.sourceLabel,
            sourceProtocol: rec.sourceProtocol,
            feedUrl: rec.feedUrl,
            durationSec: rec.durationSec,
            sizeBytes: rec.sizeBytes || rec.blob?.size || 0,
            mimeType: rec.mimeType || rec.blob?.type || 'video/webm',
            objectUrl: URL.createObjectURL(rec.blob),
            recordedAt: rec.recordedAt,
            recordedAtMs: rec.recordedAtMs,
            isStarred: Boolean(rec.isStarred),
            notes: rec.notes || '',
          }));
        db.close();
        resolve(clips);
      };
      req.onerror = () => {
        db.close();
        resolve([]);
      };
    } catch {
      db.close();
      resolve([]);
    }
  });
};

export const saveArchivedClip = async (
  clipMeta: Omit<RecordedStreamClip, 'objectUrl'>,
  blob: Blob
): Promise<boolean> => {
  const db = await openArchiveDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: StoredClipRecord = {
        id: clipMeta.id,
        fileName: clipMeta.fileName,
        title: clipMeta.title,
        outletId: clipMeta.outletId,
        outletCallSign: clipMeta.outletCallSign,
        outletName: clipMeta.outletName,
        programTitle: clipMeta.programTitle,
        sourceLabel: clipMeta.sourceLabel,
        sourceProtocol: clipMeta.sourceProtocol,
        feedUrl: clipMeta.feedUrl,
        durationSec: clipMeta.durationSec,
        sizeBytes: clipMeta.sizeBytes,
        mimeType: clipMeta.mimeType,
        recordedAt: clipMeta.recordedAt,
        recordedAtMs: clipMeta.recordedAtMs || Date.now(),
        isStarred: Boolean(clipMeta.isStarred),
        notes: clipMeta.notes || '',
        blob,
      };
      store.put(record);
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
    } catch {
      db.close();
      resolve(false);
    }
  });
};

export const updateArchivedClipMeta = async (
  id: string,
  patch: Partial<Pick<RecordedStreamClip, 'title' | 'isStarred' | 'notes'>>
): Promise<boolean> => {
  const db = await openArchiveDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const existing = getReq.result as StoredClipRecord | undefined;
        if (!existing) {
          db.close();
          resolve(false);
          return;
        }
        store.put({ ...existing, ...patch });
      };
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
    } catch {
      db.close();
      resolve(false);
    }
  });
};

export const deleteArchivedClipsByIds = async (ids: string[]): Promise<boolean> => {
  if (ids.length === 0) return true;
  const db = await openArchiveDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      ids.forEach((id) => store.delete(id));
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
    } catch {
      db.close();
      resolve(false);
    }
  });
};

export const clearArchivedClipsStore = async (): Promise<boolean> => {
  const db = await openArchiveDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
    } catch {
      db.close();
      resolve(false);
    }
  });
};

// ============================================================================
// Standard Uncompressed (STORE) ZIP Packager for Batch Clip Downloads
// Zero external dependencies; ideal for already-compressed WebM video files.
// ============================================================================

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const computeCrc32 = (data: Uint8Array): number => {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC32_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const toDosDateTime = (ms: number): { dosTime: number; dosDate: number } => {
  const d = new Date(ms);
  const year = Math.max(1980, d.getFullYear());
  const dosDate = ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  return { dosTime, dosDate };
};

export interface ZipEntryInput {
  fileName: string;
  bytes: Uint8Array;
  modifiedMs?: number;
}

export const createStoredZipBlob = (entries: ZipEntryInput[]): Blob => {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  entries.forEach((entry) => {
    const nameBytes = encoder.encode(entry.fileName);
    const crc = computeCrc32(entry.bytes);
    const size = entry.bytes.length;
    const { dosTime, dosDate } = toDosDateTime(entry.modifiedMs || Date.now());

    // Local File Header (30 bytes + filename)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true); // Local file header signature
    lv.setUint16(4, 20, true); // Version needed (2.0)
    lv.setUint16(6, 0x0800, true); // UTF-8 filename flag
    lv.setUint16(8, 0, true); // Compression method: 0 (STORE)
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // Extra field length
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, entry.bytes);

    // Central Directory Header (46 bytes + filename)
    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true); // Central directory signature
    cv.setUint16(4, 20, true); // Version made by
    cv.setUint16(6, 20, true); // Version needed
    cv.setUint16(8, 0x0800, true); // UTF-8 flag
    cv.setUint16(10, 0, true); // STORE
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // Extra length
    cv.setUint16(32, 0, true); // File comment length
    cv.setUint16(34, 0, true); // Disk number start
    cv.setUint16(36, 0, true); // Internal attrs
    cv.setUint32(38, 0, true); // External attrs
    cv.setUint32(42, offset, true); // Local header offset
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + size;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);

  // End of Central Directory Record (22 bytes)
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const blobParts: BlobPart[] = [
    ...localParts.map((u) => new Uint8Array(u)),
    ...centralParts.map((u) => new Uint8Array(u)),
    new Uint8Array(eocd),
  ];

  return new Blob(blobParts, { type: 'application/zip' });
};

export const buildBatchArchiveZip = async (clips: RecordedStreamClip[]): Promise<Blob> => {
  const entries: ZipEntryInput[] = [];
  const usedNames = new Set<string>();

  for (const clip of clips) {
    try {
      const response = await fetch(clip.objectUrl);
      const buffer = await response.arrayBuffer();
      let safeName = clip.fileName;
      let suffix = 1;
      while (usedNames.has(safeName)) {
        const dotIdx = clip.fileName.lastIndexOf('.');
        safeName =
          dotIdx > 0
            ? `${clip.fileName.slice(0, dotIdx)}-${suffix}${clip.fileName.slice(dotIdx)}`
            : `${clip.fileName}-${suffix}`;
        suffix += 1;
      }
      usedNames.add(safeName);
      entries.push({
        fileName: safeName,
        bytes: new Uint8Array(buffer),
        modifiedMs: clip.recordedAtMs || Date.now(),
      });
    } catch {
      // Skip unreadable object URL gracefully
    }
  }

  // Include a clean manifest JSON summarizing the archived batch
  const manifestJson = JSON.stringify(
    {
      service: 'DrFun1 News Stream Archive',
      exportedAt: new Date().toISOString(),
      clipCount: entries.length,
      clips: clips.map((c) => ({
        id: c.id,
        fileName: c.fileName,
        title: c.title || c.programTitle,
        outletCallSign: c.outletCallSign,
        outletName: c.outletName,
        programTitle: c.programTitle,
        sourceLabel: c.sourceLabel,
        sourceProtocol: c.sourceProtocol,
        feedUrl: c.feedUrl,
        durationSec: c.durationSec,
        sizeBytes: c.sizeBytes,
        mimeType: c.mimeType,
        recordedAt: c.recordedAt,
        isStarred: Boolean(c.isStarred),
        notes: c.notes || '',
      })),
    },
    null,
    2
  );
  entries.push({
    fileName: 'drfun1-stream-archive-manifest.json',
    bytes: new TextEncoder().encode(manifestJson),
    modifiedMs: Date.now(),
  });

  return createStoredZipBlob(entries);
};
