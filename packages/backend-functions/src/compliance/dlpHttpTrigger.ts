import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { applyMIPLabel, type MIPLabel } from './mip';
import { detectPII, maskPII } from './presidio';


/**
 * HTTP trigger for DLP and MIP labeling.
 * POST /api/compliance/label
 */
export async function complianceLabelHttpTrigger(
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
    const body = (await request.json()) as {
      documentPath?: string;
      content?: string;
      label?: MIPLabel;
      autoMask?: boolean;
    };

    // Detect PII if content provided
    let piiResult = null;
    if (body.content) {
      piiResult = await detectPII(body.content);
      logger.info('PII detection completed', {
        entitiesFound: piiResult.entities.length,
        correlationId: traceContext.correlationId
      });
    }

    // Apply MIP label if provided
    let labelResult = null;
    if (body.documentPath && body.label) {
      labelResult = await applyMIPLabel(body.documentPath, body.label);
      logger.info('MIP label applied', {
        labelId: labelResult.labelId,
        correlationId: traceContext.correlationId
      });
    }

    return {
      status: 200,
      jsonBody: {
        piiDetection: piiResult,
        masking:
          body.autoMask && piiResult
            ? { maskedText: maskPII(body.content!, piiResult.entities) }
            : null,
        mipLabeling: labelResult
      },
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'DLP/MIP operation failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'DLP/MIP operation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
