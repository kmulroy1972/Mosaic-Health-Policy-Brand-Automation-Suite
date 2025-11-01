import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { createSupportTicket, type SupportTicketRequest } from './ticketing';


/**
 * HTTP trigger for support ticketing.
 * POST /api/support/ticket
 */
export async function supportTicketHttpTrigger(
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
    const body = (await request.json()) as SupportTicketRequest;

    if (!body.title || !body.description || !body.priority || !body.category) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: title, description, priority, category' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Support ticket creation requested', {
      title: body.title,
      priority: body.priority,
      correlationId: traceContext.correlationId
    });

    const result = await createSupportTicket(body, authResult.context.userId || 'unknown', context);

    return {
      status: 201,
      jsonBody: result,
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'Support ticket creation failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Support ticket creation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
