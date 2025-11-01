import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { predictMaintenance, type PredictiveRequest } from './predictive';


/**
 * HTTP trigger for predictive maintenance analytics.
 * GET /api/analytics/predict
 */
export async function analyticsPredictHttpTrigger(
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
    const timeframe = (request.query.get('timeframe') || '7d') as '24h' | '7d' | '30d';
    const metricsParam = request.query.get('metrics');
    const metrics = metricsParam ? metricsParam.split(',') : undefined;

    const predictiveRequest: PredictiveRequest = {
      timeframe,
      metrics
    };

    logger.info('Predictive maintenance analytics requested', {
      timeframe,
      correlationId: traceContext.correlationId
    });

    const result = await predictMaintenance(predictiveRequest, context);

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
      'Predictive analytics failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Predictive analytics failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
