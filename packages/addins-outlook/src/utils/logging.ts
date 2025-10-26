import { createTelemetryEnvelope } from '@mhp/shared-brand-core';

export function logEvent(event: string, details?: Record<string, unknown>) {
  const envelope = createTelemetryEnvelope(event, 'outlook');
  console.log('[mhp-outlook]', envelope, details ?? {});
}

export function logError(event: string, error: unknown) {
  const envelope = createTelemetryEnvelope(event, 'outlook');
  console.error('[mhp-outlook]', envelope, error);
}
