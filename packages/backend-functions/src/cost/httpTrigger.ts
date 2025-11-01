import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { generateCostSummary } from './summary';


/**
 * HTTP trigger for cost summary endpoint.
 * GET /api/cost/summary?startDate=...&endDate=...&tenantId=...
 */
export async function costSummaryHttpTrigger(
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
    const startDateParam = request.query.get('startDate');
    const endDateParam = request.query.get('endDate');
    const tenantId = request.query.get('tenantId') || authResult.context.tenantId;

    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = endDateParam ? new Date(endDateParam) : new Date();

    logger.info('Generating cost summary', {
      tenantId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      correlationId: traceContext.correlationId
    });

    const summary = await generateCostSummary(tenantId, startDate, endDate);

    return {
      status: 200,
      jsonBody: summary,
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'Failed to generate cost summary',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Failed to generate cost summary.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
