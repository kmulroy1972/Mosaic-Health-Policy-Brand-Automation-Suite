import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { createWorkflow, getWorkflowStatus, type WorkflowRequest } from './center';


/**
 * HTTP trigger for workflow orchestration.
 * POST /api/orchestration/workflow - Create workflow
 * GET /api/orchestration/workflow?workflowId=... - Get status
 */
export async function orchestrationHttpTrigger(
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
    if (request.method === 'POST') {
      const body = (await request.json()) as WorkflowRequest;

      if (!body.workflowType) {
        return {
          status: 400,
          jsonBody: { error: 'Missing required field: workflowType' },
          headers: injectTraceContext(traceContext)
        };
      }

      logger.info('Workflow creation requested', {
        workflowType: body.workflowType,
        correlationId: traceContext.correlationId
      });

      const result = await createWorkflow(body, context);

      return {
        status: 201,
        jsonBody: result,
        headers: {
          'Content-Type': 'application/json',
          ...injectTraceContext(traceContext)
        }
      };
    } else if (request.method === 'GET') {
      const workflowId = request.query.get('workflowId');

      if (!workflowId) {
        return {
          status: 400,
          jsonBody: { error: 'Missing required parameter: workflowId' },
          headers: injectTraceContext(traceContext)
        };
      }

      logger.info('Workflow status requested', {
        workflowId,
        correlationId: traceContext.correlationId
      });

      const result = await getWorkflowStatus(workflowId, context);

      if (!result) {
        return {
          status: 404,
          jsonBody: { error: 'Workflow not found' },
          headers: injectTraceContext(traceContext)
        };
      }

      return {
        status: 200,
        jsonBody: result,
        headers: {
          'Content-Type': 'application/json',
          ...injectTraceContext(traceContext)
        }
      };
    } else {
      return {
        status: 405,
        jsonBody: { error: 'Method not allowed. Use POST or GET.' },
        headers: injectTraceContext(traceContext)
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'Orchestration operation failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Orchestration operation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
