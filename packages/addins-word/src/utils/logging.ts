import {
  createRewriteTelemetry,
  createTelemetryEnvelope,
  sanitizeTelemetryAttributes,
  type RewriteTelemetry
} from '@mhp/shared-brand-core';

export function logEvent(event: string, details?: Record<string, unknown>) {
  const envelope = createTelemetryEnvelope(event, 'word');
  console.log('[mhp-word]', envelope, sanitizeTelemetryAttributes(details ?? {}));
}

export function logError(event: string, error: unknown) {
  const envelope = createTelemetryEnvelope(event, 'word');
  console.error('[mhp-word]', envelope, sanitizeTelemetryAttributes({ error }));
}

export function logRewriteTelemetry(metadata: RewriteTelemetry) {
  const envelope = createTelemetryEnvelope('ai_rewrite', 'word');
  console.log('[mhp-word]', envelope, createRewriteTelemetry(metadata));
}
