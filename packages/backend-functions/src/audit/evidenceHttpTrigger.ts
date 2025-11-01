import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { generateAuditEvidencePack, type AuditEvidenceRequest } from './evidence';


/**
 * HTTP trigger for audit evidence pack generation.
 * POST /api/audit/evidence
 */
export async function auditEvidenceHttpTrigger(
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
    requireAuth: true,
    allowedScopes: ['admin', 'auditor'] // Restrict to admin/auditor roles
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
    const body = (await request.json()) as AuditEvidenceRequest;

    if (!body.framework) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required field: framework' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Audit evidence pack generation requested', {
      framework: body.framework,
      correlationId: traceContext.correlationId
    });

    const result = await generateAuditEvidencePack(body, context);

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
      'Audit evidence generation failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Audit evidence generation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
