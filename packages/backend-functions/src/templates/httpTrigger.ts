import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createTelemetryEnvelope } from '@mhp/shared-brand-core';

import { getTemplatesFromGraph } from '../graph/templates';
import { templateCache, generateCacheKey } from '../utils/cache';

import type { TemplateResponse } from './types';

/**
 * HTTP trigger for retrieving brand templates.
 * Returns metadata for available templates.
 * Uses caching layer to reduce Graph API calls.
 */
export async function templatesHttpTrigger(
  _request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const telemetry = createTelemetryEnvelope('templates_request', 'backend');

  try {
    // Check cache first
    const cacheKey = generateCacheKey('templates', 'all');
    const cached = templateCache.get(cacheKey);

    if (cached) {
      context.log(`Templates served from cache: ${cached.length}`, telemetry.eventName);
      return {
        status: 200,
        jsonBody: { items: cached } as TemplateResponse,
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }

    // Fetch from Graph API
    const templates = await getTemplatesFromGraph();

    // Cache the results
    templateCache.set(cacheKey, templates);

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
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    context.error(`Failed to retrieve templates: ${errorMessage}`);
    return {
      status: 500,
      jsonBody: {
        error: 'Failed to retrieve templates.',
        details: errorMessage
      }
    };
  }
}
