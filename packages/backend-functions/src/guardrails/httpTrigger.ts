import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { runRedTeamTests } from './redteam';


/**
 * HTTP trigger for red team testing.
 * POST /api/redteam/run
 */
export async function redteamRunHttpTrigger(
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

  // Require admin authentication
  const authResult = await authenticateRequest(request, context, {
    requireAuth: true
    // TODO: Add admin scope check
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
    logger.info('Red team test suite started', {
      userId: authResult.context.userId,
      correlationId: traceContext.correlationId
    });

    const results = await runRedTeamTests(context);

    return {
      status: 200,
      jsonBody: {
        results,
        timestamp: new Date().toISOString(),
        totalTests: results.length,
        passed: results.filter((r) => r.passed).length,
        failed: results.filter((r) => !r.passed).length
      },
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error('Red team tests failed', error instanceof Error ? error : new Error(errorMessage));

    return {
      status: 500,
      jsonBody: {
        error: 'Red team tests failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
