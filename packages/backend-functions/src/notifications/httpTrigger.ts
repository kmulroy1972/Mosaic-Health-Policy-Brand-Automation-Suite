import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { sendNotification, type NotificationRequest } from './hub';


/**
 * HTTP trigger for notifications.
 * POST /api/notify/send
 */
export async function notifySendHttpTrigger(
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
    const body = (await request.json()) as NotificationRequest;

    if (!body.type || !body.recipients || !body.subject || !body.message) {
      return {
        status: 400,
        jsonBody: {
          error: 'Missing required fields: type, recipients, subject, message'
        },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Notification send requested', {
      type: body.type,
      recipientsCount: body.recipients.length,
      category: body.category,
      correlationId: traceContext.correlationId
    });

    const result = await sendNotification(body, context);

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
      'Notification send failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Notification send failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
