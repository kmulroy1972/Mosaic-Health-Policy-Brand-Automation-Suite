import { createTelemetryEnvelope } from '@mhp/shared-brand-core';

export function logEvent(event: string, details?: Record<string, unknown>) {
  const envelope = createTelemetryEnvelope(event, 'word');
  console.log('[mhp-word]', envelope, details ?? {});
}

export function logError(event: string, error: unknown) {
  const envelope = createTelemetryEnvelope(event, 'word');
  console.error('[mhp-word]', envelope, error);
}
