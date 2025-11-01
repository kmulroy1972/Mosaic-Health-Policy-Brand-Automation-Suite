import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { validateAccessibility, type A11yValidationRequest } from './a11yValidator';

/**
 * HTTP trigger for compliance validation endpoint.
 * POST /api/compliance/validate
 * Body: { content: string (base64), contentType: 'pdf' | 'html' | 'docx', url?: string }
 * Returns: { violations, wcagScore, reportUrl, timestamp, documentType }
 */
export async function complianceValidateHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  // Extract trace context for distributed tracing
  const traceContext = extractTraceContext(request);

  // Create centralized logger
  const logger = createLogger(context, request);

  if (request.method !== 'POST') {
    logger.warn('Invalid method for compliance validation', { method: request.method });
    return {
      status: 405,
      jsonBody: { error: 'Method not allowed. Use POST.' },
      headers: injectTraceContext(traceContext)
    };
  }

  let requestBody: A11yValidationRequest;
  try {
    const body = (await request.json()) as A11yValidationRequest;

    if (!body.content || typeof body.content !== 'string') {
      logger.warn('Invalid compliance validation request - missing content');
      return {
        status: 400,
        jsonBody: { error: 'Missing or invalid content field (base64 string required).' },
        headers: injectTraceContext(traceContext)
      };
    }

    if (!body.contentType || !['pdf', 'html', 'docx'].includes(body.contentType)) {
      logger.warn('Invalid compliance validation request - invalid contentType', {
        contentType: body.contentType
      });
      return {
        status: 400,
        jsonBody: {
          error: 'Missing or invalid contentType. Must be one of: pdf, html, docx'
        },
        headers: injectTraceContext(traceContext)
      };
    }

    requestBody = body;
  } catch (error) {
    logger.error(
      'Invalid JSON in compliance validation request',
      error instanceof Error ? error : new Error(String(error))
    );
    return {
      status: 400,
      jsonBody: { error: 'Invalid JSON payload.' },
      headers: injectTraceContext(traceContext)
    };
  }

  try {
    logger.info('Starting compliance validation', {
      contentType: requestBody.contentType,
      correlationId: traceContext.correlationId
    });

    const result = await validateAccessibility(requestBody, context);

    logger.info('Compliance validation completed', {
      documentType: result.documentType,
      wcagScore: result.wcagScore,
      violationCount: result.violations.length,
      correlationId: traceContext.correlationId,
      traceId: traceContext.traceId
    });

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
      'Compliance validation failure',
      error instanceof Error ? error : new Error(errorMessage),
      {
        correlationId: traceContext.correlationId,
        traceId: traceContext.traceId
      }
    );
    return {
      status: 500,
      jsonBody: {
        error: 'Compliance validation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
