import { createTelemetryEnvelope, getDefaultFeatureFlags } from '@mhp/shared-brand-core';

export interface PolicyResult {
  allowSend: boolean;
  requiresJustification: boolean;
  correlationId: string;
}

export function evaluateRecipients(recipients: string[]): PolicyResult {
  const telemetry = createTelemetryEnvelope('outlook_onsend_action', 'outlook');
  const flags = getDefaultFeatureFlags();
  const hasExternal = recipients.some((recipient) => !recipient.endsWith('@mhp.com'));

  return {
    allowSend: !hasExternal || flags.enablePdfA,
    requiresJustification: hasExternal,
    correlationId: telemetry.tenantHash
  };
}
