import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { queryKnowledgeGraph, type KnowledgeQuery } from './graph';


/**
 * HTTP trigger for knowledge graph queries.
 * POST /api/knowledge/query
 */
export async function knowledgeQueryHttpTrigger(
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
    const body = (await request.json()) as KnowledgeQuery;

    if (!body.query) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required field: query' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Knowledge graph query requested', {
      query: body.query,
      correlationId: traceContext.correlationId
    });

    const result = await queryKnowledgeGraph(body, context);

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
      'Knowledge graph query failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Knowledge graph query failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
