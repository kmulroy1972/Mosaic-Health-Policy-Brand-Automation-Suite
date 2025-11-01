import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

/**
 * HTTP trigger for user management endpoints.
 * GET /api/users/list - List users (requires admin)
 * POST /api/users/add - Add user (requires admin)
 * DELETE /api/users/{userId} - Delete user (requires admin)
 */
export async function usersListHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);
  const logger = createLogger(context, request);

  // Require authentication
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
    // TODO: Query Entra ID for user list
    // For now, return placeholder
    logger.info('User list requested', {
      userId: authResult.context.userId,
      correlationId: traceContext.correlationId
    });

    return {
      status: 200,
      jsonBody: {
        users: [],
        message: 'User list endpoint - requires Entra ID integration'
      },
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error('Failed to list users', error instanceof Error ? error : new Error(errorMessage), {
      correlationId: traceContext.correlationId
    });

    return {
      status: 500,
      jsonBody: {
        error: 'Failed to list users.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}

export async function usersAddHttpTrigger(
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
    const body = (await request.json()) as { userId: string; email?: string };
    logger.info('User add requested', {
      userId: body.userId,
      correlationId: traceContext.correlationId
    });

    // TODO: Add user to Entra ID group
    return {
      status: 200,
      jsonBody: {
        userId: body.userId,
        message: 'User add endpoint - requires Entra ID integration'
      },
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error('Failed to add user', error instanceof Error ? error : new Error(errorMessage));

    return {
      status: 500,
      jsonBody: {
        error: 'Failed to add user.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
