import { createTelemetryEnvelope } from '@mhp/shared-brand-core';

import type { UndoSnapshot } from '../types';

import { createTimestamp } from './date';

const SNAPSHOT_KEY = 'mhp_word_snapshots';
const MAX_SNAPSHOTS = 3;

type SnapshotStore = UndoSnapshot[];

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `snapshot-${Math.random().toString(36).slice(2)}`;
}

export function captureSnapshot(documentId: string, xml: string): UndoSnapshot | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const snapshot: UndoSnapshot = {
    id: generateId(),
    createdAt: createTimestamp(),
    documentId,
    data: xml
  };

  const existing = readSnapshots(documentId);
  const updated = [snapshot, ...existing].slice(0, MAX_SNAPSHOTS);
  storage.setItem(SNAPSHOT_KEY, JSON.stringify(updated));

  return snapshot;
}

export function readSnapshots(documentId: string): SnapshotStore {
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
    return parsed.filter((snapshot) => snapshot.documentId === documentId);
  } catch {
    return [];
  }
}

export function logSnapshotEvent(action: string, snapshot?: UndoSnapshot) {
  const telemetry = createTelemetryEnvelope(action, 'word');
  console.log('[mhp-word.snapshot]', telemetry, snapshot);
}
