import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { applyMIPLabel, type MIPLabelRequest } from './mipLabeling';
import { scanForPII } from './presidio';


/**
 * HTTP trigger for real-time compliance (Presidio + MIP).
 * POST /api/compliance/realtime
 */
export async function complianceRealtimeHttpTrigger(
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
      text: string;
      scanPII?: boolean;
      applyMIP?: boolean;
      mipSensitivity?: MIPLabelRequest['sensitivity'];
    };

    if (!body.text) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required field: text' },
        headers: injectTraceContext(traceContext)
      };
    }

    logger.info('Real-time compliance scan requested', {
      scanPII: body.scanPII,
      applyMIP: body.applyMIP,
      correlationId: traceContext.correlationId
    });

    const result: {
      piiScan?: ReturnType<typeof scanForPII> extends Promise<infer T> ? T : never;
      mipLabel?: ReturnType<typeof applyMIPLabel> extends Promise<infer T> ? T : never;
    } = {};

    // Presidio PII scan
    if (body.scanPII) {
      const piiResult = await scanForPII({
        text: body.text,
        language: 'en'
      });
      result.piiScan = piiResult;
    }

    // MIP labeling
    if (body.applyMIP) {
      const mipResult = await applyMIPLabel(
        {
          content: body.text,
          sensitivity: body.mipSensitivity
        },
        context
      );
      result.mipLabel = mipResult;
    }

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
      'Real-time compliance scan failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Real-time compliance scan failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
