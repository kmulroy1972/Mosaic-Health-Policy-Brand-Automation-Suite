import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createTelemetryEnvelope } from '@mhp/shared-brand-core';

import { getTemplatesFromGraph } from '../graph/templates';

import type { TemplateResponse } from './types';

export async function templatesHttpTrigger(
  _request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const telemetry = createTelemetryEnvelope('templates_request', 'backend');

  try {
    const templates = await getTemplatesFromGraph();
    const body: TemplateResponse = {
      items: templates
    };

    context.log(`Templates served: ${templates.length}`, telemetry.eventName);

    return {
      status: 200,
      jsonBody: body,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    context.log(`Failed to retrieve templates: ${String(error)}`);
    return {
      status: 500,
      jsonBody: {
        error: 'Failed to retrieve templates.'
      }
    };
  }
}
