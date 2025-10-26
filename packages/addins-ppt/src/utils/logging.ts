import { createTelemetryEnvelope } from '@mhp/shared-brand-core';

export function logEvent(event: string, details?: Record<string, unknown>) {
  const envelope = createTelemetryEnvelope(event, 'powerpoint');
  console.log('[mhp-ppt]', envelope, details ?? {});
}

export function logError(event: string, error: unknown) {
  const envelope = createTelemetryEnvelope(event, 'powerpoint');
  console.error('[mhp-ppt]', envelope, error);
}
