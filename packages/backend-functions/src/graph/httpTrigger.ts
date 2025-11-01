import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { type GraphQuery } from './models';
import { graphStore } from './store';


/**
 * HTTP trigger for knowledge graph queries.
 * POST /api/graph/query
 */
export async function graphQueryHttpTrigger(
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
    const body = (await request.json()) as GraphQuery;

    if (!body.query) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required field: query' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Graph query requested', {
      query: body.query,
      correlationId: traceContext.correlationId
    });

    const result = await graphStore.queryGraph(body.query, body.parameters, context);

    return {
      status: 200,
      jsonBody: {
        nodes: result.nodes,
        relationships: result.relationships,
        count: result.nodes.length + result.relationships.length
      },
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error('Graph query failed', error instanceof Error ? error : new Error(errorMessage));

    return {
      status: 500,
      jsonBody: {
        error: 'Graph query failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
