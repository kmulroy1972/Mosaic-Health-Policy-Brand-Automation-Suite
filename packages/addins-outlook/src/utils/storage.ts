const SETTINGS_KEY = 'mhp_outlook_settings';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function getStorage(): StorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage ?? null;
}

export interface OutlookSettings {
  personaId: string;
  signatureHtml: string;
}

export function readSettings(): OutlookSettings | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  const raw = storage.getItem(SETTINGS_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as OutlookSettings;
  } catch {
    return null;
  }
}

export function writeSettings(settings: OutlookSettings): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
