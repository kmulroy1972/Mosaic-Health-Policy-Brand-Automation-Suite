import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { generateComplianceDashboard, type ComplianceDashboardRequest } from './dashboardV2';


/**
 * HTTP trigger for compliance dashboard.
 * GET /api/compliance/dashboard
 */
export async function complianceDashboardHttpTrigger(
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
    const tenantId = request.query.get('tenantId') || authResult.context.tenantId;
    const startDate = request.query.get('startDate');
    const endDate = request.query.get('endDate');

    const dashboardRequest: ComplianceDashboardRequest = {
      tenantId,
      dateRange:
        startDate && endDate
          ? {
              start: startDate,
              end: endDate
            }
          : undefined
    };

    logger.info('Compliance dashboard requested', {
      tenantId,
      correlationId: traceContext.correlationId
    });

    const result = await generateComplianceDashboard(dashboardRequest, context);

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
      'Compliance dashboard generation failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Compliance dashboard generation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
