import type { SignatureConfig } from '../types';
import { readSettings, writeSettings } from '../utils/storage';

const DEFAULT_SIGNATURE: SignatureConfig = {
  personaId: 'default',
  html: '<p><strong>Regards,</strong><br/>MHP Team</p>'
};

export function getActiveSignature(): SignatureConfig {
  const stored = readSettings();
  if (!stored) {
    return DEFAULT_SIGNATURE;
  }
  return {
    personaId: stored.personaId,
    html: stored.signatureHtml
  };
}

export function updateSignature(config: SignatureConfig): void {
  writeSettings({ personaId: config.personaId, signatureHtml: config.html });
}
