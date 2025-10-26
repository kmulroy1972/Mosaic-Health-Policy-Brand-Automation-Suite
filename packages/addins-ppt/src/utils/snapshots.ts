import { createTelemetryEnvelope } from '@mhp/shared-brand-core';

import type { UndoSnapshot } from '../types';

import { createTimestamp } from './date';

const SNAPSHOT_KEY = 'mhp_ppt_snapshots';
const MAX_SNAPSHOTS = 5;

type SnapshotStore = UndoSnapshot[];

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function getStorage(): StorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage ?? null;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `snapshot-${Math.random().toString(36).slice(2)}`;
}

export function captureSnapshot(deckId: string, xml: string): UndoSnapshot | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const snapshot: UndoSnapshot = {
    id: generateId(),
    createdAt: createTimestamp(),
    deckId,
    data: xml
  };

  const existing = readSnapshots(deckId);
  const updated = [snapshot, ...existing].slice(0, MAX_SNAPSHOTS);
  storage.setItem(SNAPSHOT_KEY, JSON.stringify(updated));

  return snapshot;
}

export function readSnapshots(deckId: string): SnapshotStore {
  const storage = getStorage();
  if (!storage) {
    return [];
  }
  const raw = storage.getItem(SNAPSHOT_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as SnapshotStore;
    return parsed.filter((snapshot) => snapshot.deckId === deckId);
  } catch {
    return [];
  }
}

export function logSnapshotEvent(action: string, snapshot?: UndoSnapshot) {
  const telemetry = createTelemetryEnvelope(action, 'powerpoint');
  console.log('[mhp-ppt.snapshot]', telemetry, snapshot);
}
