import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { createCollaborationSession, type CollaborationSessionRequest } from './session';


/**
 * HTTP trigger for collaboration session.
 * POST /api/collab/session
 */
export async function collabSessionHttpTrigger(
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
    const body = (await request.json()) as CollaborationSessionRequest;

    if (!body.documentId || !body.participants || body.participants.length === 0) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: documentId, participants' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Collaboration session requested', {
      documentId: body.documentId,
      participantsCount: body.participants.length,
      correlationId: traceContext.correlationId
    });

    const result = await createCollaborationSession(body, context);

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
      'Collaboration session creation failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Collaboration session creation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
