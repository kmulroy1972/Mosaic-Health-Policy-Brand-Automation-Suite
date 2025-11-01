import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { assembleMedia, type MediaAssemblyRequest } from './assembler';


/**
 * HTTP trigger for media assembly.
 * POST /api/media/assemble
 */
export async function mediaAssembleHttpTrigger(
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
    const body = (await request.json()) as MediaAssemblyRequest;

    if (!body.reportId || !body.title || !body.script) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: reportId, title, script' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Media assembly requested', {
      reportId: body.reportId,
      title: body.title,
      correlationId: traceContext.correlationId
    });

    const result = await assembleMedia(body);

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
    logger.error('Media assembly failed', error instanceof Error ? error : new Error(errorMessage));

    return {
      status: 500,
      jsonBody: {
        error: 'Media assembly failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
