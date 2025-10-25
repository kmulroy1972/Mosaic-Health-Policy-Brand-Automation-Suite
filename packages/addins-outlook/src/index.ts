import { createTelemetryEnvelope } from '@mhp/shared-brand-core';
import { createComponentContext } from '@mhp/shared-ui';

export interface PolicyResult {
  allowSend: boolean;
  requiresJustification: boolean;
  correlationId: string;
}

export function evaluateRecipients(recipients: string[]): PolicyResult {
  const telemetry = createTelemetryEnvelope('outlook_onsend_action', 'outlook');
  const context = createComponentContext();
  const hasExternal = recipients.some((recipient) => !recipient.endsWith('@mhp.com'));

  return {
    allowSend: !hasExternal || context.flags.enablePdfA,
    requiresJustification: hasExternal,
    correlationId: telemetry.tenantHash
  };
}
