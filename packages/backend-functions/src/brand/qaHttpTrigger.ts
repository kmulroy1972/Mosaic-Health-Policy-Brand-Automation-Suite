import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { generateBrandQA } from './qa';


/**
 * HTTP trigger for brand QA checklist.
 * GET /api/brand/qa?reportId=...
 */
export async function brandQAHttpTrigger(
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
    const reportId = request.query.get('reportId');
    const documentType = (request.query.get('documentType') || 'report') as
      | 'report'
      | 'presentation'
      | 'document';

    if (!reportId) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required parameter: reportId' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Brand QA requested', {
      reportId,
      documentType,
      correlationId: traceContext.correlationId
    });

    const result = await generateBrandQA({ reportId, documentType }, context);

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
    logger.error('Brand QA check failed', error instanceof Error ? error : new Error(errorMessage));

    return {
      status: 500,
      jsonBody: {
        error: 'Brand QA check failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
