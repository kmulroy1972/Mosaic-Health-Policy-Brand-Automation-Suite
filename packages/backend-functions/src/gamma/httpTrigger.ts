import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { exportToGamma, type GammaExportRequest } from './client';


/**
 * HTTP trigger for Gamma export endpoint.
 * POST /api/gamma/export
 */
export async function gammaExportHttpTrigger(
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
    const body = (await request.json()) as GammaExportRequest;

    if (!body.content || !body.title) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: content, title' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Gamma export requested', {
      title: body.title,
      correlationId: traceContext.correlationId
    });

    const result = await exportToGamma(body);

    return {
      status: 200,
      jsonBody: {
        deckId: result.deckId,
        publicUrl: result.publicUrl,
        createdAt: result.createdAt
      },
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error('Gamma export failed', error instanceof Error ? error : new Error(errorMessage));

    return {
      status: 500,
      jsonBody: {
        error: 'Gamma export failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
