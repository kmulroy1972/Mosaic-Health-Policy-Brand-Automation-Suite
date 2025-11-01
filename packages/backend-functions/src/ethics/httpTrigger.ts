import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { checkEthics, type EthicsCheckRequest } from './checker';


/**
 * HTTP trigger for ethics checking.
 * POST /api/ethics/check
 */
export async function ethicsCheckHttpTrigger(
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
    const body = (await request.json()) as EthicsCheckRequest;

    if (!body.content || !body.contentType) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: content, contentType' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Ethics check requested', {
      contentType: body.contentType,
      contentLength: body.content.length,
      correlationId: traceContext.correlationId
    });

    const result = await checkEthics(body, context);

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
    logger.error('Ethics check failed', error instanceof Error ? error : new Error(errorMessage));

    return {
      status: 500,
      jsonBody: {
        error: 'Ethics check failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
