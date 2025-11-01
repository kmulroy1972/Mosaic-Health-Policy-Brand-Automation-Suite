import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { generateChart, type ChartRequest, type ChartResponse } from './chartGenerator';


/**
 * HTTP trigger for chart generation.
 * POST /api/visuals/chart
 */
export async function visualsChartHttpTrigger(
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
    const body = (await request.json()) as ChartRequest & { format?: 'url' | 'base64' };

    if (!body.type || !body.data) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: type, data' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Chart generation requested', {
      type: body.type,
      correlationId: traceContext.correlationId
    });

    const result = await generateChart(body);

    const response: ChartResponse = {
      imageUrl: result.imageUrl,
      chartId: result.chartId
    };

    if (body.format === 'base64' && result.imageBase64) {
      response.imageBase64 = result.imageBase64;
    }

    return {
      status: 200,
      jsonBody: response,
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'Chart generation failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Chart generation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
