import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { getConfig, updateConfig, type ConfigRequest } from './service';


/**
 * HTTP trigger for global configuration service.
 * GET /api/config - Retrieve configuration
 * PUT /api/config - Update configuration
 */
export async function configHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);
  const logger = createLogger(context, request);

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
    const tenantId = request.query.get('tenantId') || authResult.context.tenantId;

    if (request.method === 'GET') {
      logger.info('Configuration retrieval requested', {
        tenantId,
        correlationId: traceContext.correlationId
      });

      const config = await getConfig(tenantId, context);

      return {
        status: 200,
        jsonBody: config,
        headers: {
          'Content-Type': 'application/json',
          ...injectTraceContext(traceContext)
        }
      };
    } else if (request.method === 'PUT') {
      const body = (await request.json()) as ConfigRequest;

      logger.info('Configuration update requested', {
        tenantId: body.tenantId || tenantId,
        correlationId: traceContext.correlationId
      });

      const updatedConfig = await updateConfig(
        {
          ...body,
          tenantId: body.tenantId || tenantId
        },
        context
      );

      return {
        status: 200,
        jsonBody: updatedConfig,
        headers: {
          'Content-Type': 'application/json',
          ...injectTraceContext(traceContext)
        }
      };
    } else {
      return {
        status: 405,
        jsonBody: { error: 'Method not allowed. Use GET or PUT.' },
        headers: injectTraceContext(traceContext)
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'Configuration operation failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Configuration operation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
