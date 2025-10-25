import { createTelemetryEnvelope } from '@mhp/shared-brand-core';
import { createComponentContext } from '@mhp/shared-ui';

export type SlideCheck = {
  slideNumber: number;
  status: 'ok' | 'warning';
  message: string;
};

export function runDeckAudit(slideCount: number): SlideCheck[] {
  const checks: SlideCheck[] = [];
  const telemetry = createTelemetryEnvelope('ppt_fix_audit', 'powerpoint');
  const context = createComponentContext();

  for (let index = 1; index <= slideCount; index += 1) {
    checks.push({
      slideNumber: index,
      status: telemetry.result === 'success' && context.flags.enablePdfA ? 'ok' : 'warning',
      message: 'Placeholder audit result'
    });
  }

  return checks;
}
