import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { tunePrompt, type PromptTuningRequest } from './promptManager';


/**
 * HTTP trigger for prompt tuning.
 * POST /api/prompts/tune
 */
export async function promptTuneHttpTrigger(
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
    const body = (await request.json()) as PromptTuningRequest;

    if (!body.promptId) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required field: promptId' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Prompt tuning requested', {
      promptId: body.promptId,
      correlationId: traceContext.correlationId
    });

    const result = await tunePrompt(body, context);

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
    logger.error('Prompt tuning failed', error instanceof Error ? error : new Error(errorMessage));

    return {
      status: 500,
      jsonBody: {
        error: 'Prompt tuning failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
