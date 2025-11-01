import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { generateAnalyticsReport, generateDailySummaryMarkdown } from './reportGenerator';


/**
 * HTTP trigger for analytics report endpoint.
 * GET /api/analytics/report?startDate=...&endDate=...&format=json|markdown
 */
export async function analyticsReportHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);
  const logger = createLogger(context, request);

  if (request.method !== 'GET') {
    logger.warn('Invalid method for analytics report', { method: request.method });
    return {
      status: 405,
      jsonBody: { error: 'Method not allowed. Use GET.' },
      headers: injectTraceContext(traceContext)
    };
  }

  // Optional authentication (allows anonymous with limited data)
  await authenticateRequest(request, context, {
    requireAuth: false,
    allowAnonymous: true
  });

  try {
    const startDateParam = request.query.get('startDate');
    const endDateParam = request.query.get('endDate');
    const format = request.query.get('format') || 'json';

    // Default to last 24 hours if not specified
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        status: 400,
        jsonBody: { error: 'Invalid date format. Use ISO 8601 format.' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Generating analytics report', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      format,
      correlationId: traceContext.correlationId
    });

    const report = await generateAnalyticsReport(startDate, endDate, context);

    if (format === 'markdown') {
      const markdown = generateDailySummaryMarkdown(report);
      return {
        status: 200,
        body: markdown,
        headers: {
          'Content-Type': 'text/markdown',
          ...injectTraceContext(traceContext)
        }
      };
    }

    return {
      status: 200,
      jsonBody: report,
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'Failed to generate analytics report',
      error instanceof Error ? error : new Error(errorMessage),
      {
        correlationId: traceContext.correlationId
      }
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Failed to generate analytics report.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
