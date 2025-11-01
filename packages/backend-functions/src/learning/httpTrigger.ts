import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { ingestFeedback, type FeedbackRequest } from './feedback';


/**
 * HTTP trigger for continuous learning feedback.
 * POST /api/learning/feedback
 */
export async function learningFeedbackHttpTrigger(
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
    const body = (await request.json()) as FeedbackRequest;

    if (!body.promptId || !body.output || !body.rating) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: promptId, output, rating' },
        headers: injectTraceContext(traceContext)
      };
    }

    if (body.rating < 1 || body.rating > 5) {
      return {
        status: 400,
        jsonBody: { error: 'Rating must be between 1 and 5' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Feedback ingestion requested', {
      promptId: body.promptId,
      rating: body.rating,
      correlationId: traceContext.correlationId
    });

    const result = await ingestFeedback(body, context);

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
      'Feedback ingestion failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Feedback ingestion failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
