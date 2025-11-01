import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { draftRegulatorySubmission, type RegulatoryDraftRequest } from './draft';


/**
 * HTTP trigger for regulatory writing.
 * POST /api/regulation/draft
 */
export async function regulationDraftHttpTrigger(
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
    const body = (await request.json()) as RegulatoryDraftRequest;

    if (!body.regulationType || !body.topic || !body.requirements) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: regulationType, topic, requirements' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Regulatory draft requested', {
      regulationType: body.regulationType,
      topic: body.topic,
      correlationId: traceContext.correlationId
    });

    const result = await draftRegulatorySubmission(body, context);

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
      'Regulatory draft failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Regulatory draft failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
