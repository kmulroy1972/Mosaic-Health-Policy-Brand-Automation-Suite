import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { annotateVideo, type VideoAnnotateRequest } from './indexer';


/**
 * HTTP trigger for video annotation.
 * POST /api/video/annotate
 */
export async function videoAnnotateHttpTrigger(
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
    const body = (await request.json()) as VideoAnnotateRequest;

    if (!body.videoUrl) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required field: videoUrl' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Video annotation requested', {
      videoUrl: body.videoUrl,
      correlationId: traceContext.correlationId
    });

    const result = await annotateVideo(body, context);

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
      'Video annotation failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Video annotation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
