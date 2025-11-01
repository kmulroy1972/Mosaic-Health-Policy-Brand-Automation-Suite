import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { processWithAdaptiveAgent, type AdaptiveAgentRequest } from './adaptive';


/**
 * HTTP trigger for adaptive learning agents.
 * POST /api/agents/adaptive
 */
export async function agentsAdaptiveHttpTrigger(
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
    const body = (await request.json()) as AdaptiveAgentRequest;

    if (!body.task) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required field: task' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Adaptive agent request', {
      task: body.task,
      correlationId: traceContext.correlationId
    });

    const result = await processWithAdaptiveAgent(body, context);

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
      'Adaptive agent processing failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Adaptive agent processing failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
