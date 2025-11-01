import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { composeNarrative, type NarrativeRequest } from './composer';


/**
 * HTTP trigger for narrative composition.
 * POST /api/narratives/compose
 */
export async function narrativesComposeHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);
  const logger = createLogger(context, request);

  if (request.method !== 'POST') {
    return {
      status: 405,
      jsonBody: { error: 'Method not allowed. Use POST.' },
      headers: injectTraceContext(traceContext)
    };
  }

  const authResult = await authenticateRequest(request, context, {
    requireAuth: true
  });

  if (!authResult.authenticated || !authResult.context) {
    return {
      ...(authResult.error || {
        status: 401,
        jsonBody: { error: 'Unauthorized' }
      }),
      headers: injectTraceContext(traceContext)
    };
  }

  try {
    const body = (await request.json()) as NarrativeRequest;

    if (!body.sourceText) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required field: sourceText' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Narrative composition requested', {
      style: body.style || 'executive',
      sourceLength: body.sourceText.length,
      correlationId: traceContext.correlationId
    });

    const result = await composeNarrative(body, context);

    return {
      status: 200,
      jsonBody: result,
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'Narrative composition failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Narrative composition failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
