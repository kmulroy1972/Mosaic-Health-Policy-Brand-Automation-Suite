import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { generateEthicsBoardDashboard } from './monitoring';


/**
 * HTTP trigger for ethics board dashboard.
 * GET /api/ethics/dashboard
 */
export async function ethicsDashboardHttpTrigger(
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
    const startDate = request.query.get('startDate');
    const endDate = request.query.get('endDate');

    const dateRange =
      startDate && endDate
        ? {
            start: startDate,
            end: endDate
          }
        : undefined;

    logger.info('Ethics board dashboard requested', {
      dateRange,
      correlationId: traceContext.correlationId
    });

    const result = await generateEthicsBoardDashboard(dateRange, context);

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
      'Ethics dashboard generation failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Ethics dashboard generation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
