import { createTelemetryEnvelope, getDefaultFeatureFlags } from '@mhp/shared-brand-core';

export type SlideCheck = {
  slideNumber: number;
  status: 'ok' | 'warning';
  message: string;
};

export function runDeckAudit(slideCount: number): SlideCheck[] {
  const checks: SlideCheck[] = [];
  const telemetry = createTelemetryEnvelope('ppt_fix_audit', 'powerpoint');
  const flags = getDefaultFeatureFlags();

  for (let index = 1; index <= slideCount; index += 1) {
    checks.push({
      slideNumber: index,
      status: telemetry.result === 'success' && flags.enablePdfA ? 'ok' : 'warning',
      message: 'Placeholder audit result'
    });
  }

  return checks;
}
