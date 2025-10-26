import { createTelemetryEnvelope } from '@mhp/shared-brand-core';

export interface HttpResult<T> {
  status: number;
  body: T;
}

export function createHealthResponse(): HttpResult<{ status: string }> {
  const telemetry = createTelemetryEnvelope('backend_health_check', 'backend');
  return {
    status: 200,
    body: {
      status: telemetry.result
    }
  };
}

export { templatesHttpTrigger } from './templates/httpTrigger';
export type { TemplateResponse, TemplateItem } from './templates/types';
export { convertPdfAHttpTrigger } from './pdf/convertA';
export { validatePdfHttpTrigger } from './pdf/validate';
