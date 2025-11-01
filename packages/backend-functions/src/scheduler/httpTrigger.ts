import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { scheduleReportReview, type ScheduleRequest } from './agent';


/**
 * HTTP trigger for scheduling report reviews.
 * POST /api/schedule/report
 */
export async function scheduleReportHttpTrigger(
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
    const body = (await request.json()) as ScheduleRequest;

    if (!body.reportId || !body.participants || body.participants.length === 0) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: reportId, participants' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Report review scheduling requested', {
      reportId: body.reportId,
      participantsCount: body.participants.length,
      correlationId: traceContext.correlationId
    });

    const result = await scheduleReportReview(body, context);

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
      'Schedule request failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Schedule request failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
