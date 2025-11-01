import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { generateClientSuccessMetrics, type ClientSuccessRequest } from './clientSuccess';


/**
 * HTTP trigger for client success analytics.
 * GET /api/analytics/clientsuccess
 */
export async function clientSuccessHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);
  const logger = createLogger(context, request);

  if (request.method !== 'GET') {
    return {
      status: 405,
      jsonBody: { error: 'Method not allowed. Use GET.' },
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
    const clientId = request.query.get('clientId');
    const startDate = request.query.get('startDate');
    const endDate = request.query.get('endDate');

    const metricsRequest: ClientSuccessRequest = {
      clientId: clientId || undefined,
      dateRange:
        startDate && endDate
          ? {
              start: startDate,
              end: endDate
            }
          : undefined
    };

    logger.info('Client success metrics requested', {
      clientId,
      correlationId: traceContext.correlationId
    });

    const result = await generateClientSuccessMetrics(metricsRequest, context);

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
      'Client success metrics generation failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Client success metrics generation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
