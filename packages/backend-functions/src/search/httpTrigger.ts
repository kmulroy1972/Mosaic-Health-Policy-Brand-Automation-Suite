import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { vectorStore } from './vectorStore';


/**
 * HTTP trigger for brand knowledge search.
 * GET /api/brand/search?query=...
 */
export async function brandSearchHttpTrigger(
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
    const query = request.query.get('query');
    if (!query) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required parameter: query' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Brand search requested', {
      query,
      correlationId: traceContext.correlationId
    });

    // TODO: Generate query embedding and search
    const results = await vectorStore.search(query, [], 5);

    return {
      status: 200,
      jsonBody: {
        query,
        results: results.map((r) => ({
          content: r.entry.content,
          metadata: r.entry.metadata,
          score: r.score
        })),
        count: results.length
      },
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error('Brand search failed', error instanceof Error ? error : new Error(errorMessage));

    return {
      status: 500,
      jsonBody: {
        error: 'Brand search failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
