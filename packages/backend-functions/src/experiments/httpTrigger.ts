import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import type { ExperimentResult } from './reporter';


/**
 * HTTP trigger for experiment reporting.
 * GET /api/experiments/report?experimentName=...
 */
export async function experimentsReportHttpTrigger(
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
    const experimentName = request.query.get('experimentName') || 'brandGuidanceAgent';

    logger.info('Experiment report requested', {
      experimentName,
      correlationId: traceContext.correlationId
    });

    // TODO: Query metrics from Cosmos DB
    const results: ExperimentResult[] = [
      {
        variant: 'A',
        metrics: {
          jsonValidity: 0.98,
          averageLatency: 450,
          userAcceptRate: 0.85,
          totalRequests: 1000
        }
      },
      {
        variant: 'B',
        metrics: {
          jsonValidity: 0.95,
          averageLatency: 500,
          userAcceptRate: 0.8,
          totalRequests: 1000
        }
      }
    ];

    return {
      status: 200,
      jsonBody: {
        experimentName,
        results,
        timestamp: new Date().toISOString()
      },
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'Experiment report failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Experiment report failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
