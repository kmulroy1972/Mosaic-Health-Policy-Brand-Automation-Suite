import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { authenticateRequest } from './middleware';

/**
 * HTTP trigger for token validation endpoint.
 * POST /api/auth/validate
 * Headers: Authorization: Bearer <token>
 * Returns: { valid: boolean, userId?: string, tenantId?: string, scopes?: string[] }
 */
export async function authValidateHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);
  const logger = createLogger(context, request);

  if (request.method !== 'POST' && request.method !== 'GET') {
    logger.warn('Invalid method for auth validate', { method: request.method });
    return {
      status: 405,
      jsonBody: { error: 'Method not allowed. Use POST or GET.' },
      headers: injectTraceContext(traceContext)
    };
  }

  // Authenticate request (but allow anonymous for validation endpoint)
  const authResult = await authenticateRequest(request, context, {
    requireAuth: false,
    allowAnonymous: true
  });

  if (!authResult.authenticated) {
    // No token provided or invalid token
    return {
      status: 200,
      jsonBody: {
        valid: false,
        authenticated: false,
        message: authResult.error?.jsonBody?.message || 'No valid token provided'
      },
      headers: injectTraceContext(traceContext)
    };
  }

  const authContext = authResult.context;

  if (!authContext || !authContext.isAuthenticated) {
    return {
      status: 200,
      jsonBody: {
        valid: false,
        authenticated: false,
        message: 'No authentication token provided'
      },
      headers: injectTraceContext(traceContext)
    };
  }

  logger.info('Token validation successful', {
    userId: authContext.userId,
    tenantId: authContext.tenantId,
    correlationId: traceContext.correlationId
  });

  return {
    status: 200,
    jsonBody: {
      valid: true,
      authenticated: true,
      userId: authContext.userId,
      tenantId: authContext.tenantId,
      scopes: authContext.scopes
    },
    headers: injectTraceContext(traceContext)
  };
}
