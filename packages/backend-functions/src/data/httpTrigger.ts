import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { auditLogRepository, templateRepository } from '../db/repositories';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

/**
 * HTTP trigger for audit logs endpoint.
 * GET /api/data/logs?userId=...&tenantId=...&action=...&limit=100
 * Returns: Array of audit log entries
 */
export async function dataLogsHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);
  const logger = createLogger(context, request);

  if (request.method !== 'GET') {
    logger.warn('Invalid method for data logs', { method: request.method });
    return {
      status: 405,
      jsonBody: { error: 'Method not allowed. Use GET.' },
      headers: injectTraceContext(traceContext)
    };
  }

  // Optional authentication (allows anonymous with limited results)
  const authResult = await authenticateRequest(request, context, {
    requireAuth: false,
    allowAnonymous: true
  });

  const authContext = authResult.context;
  const userId = authContext?.userId || request.query.get('userId') || undefined;
  const tenantId = authContext?.tenantId || request.query.get('tenantId') || undefined;

  try {
    const action = request.query.get('action') || undefined;
    const resourceType = request.query.get('resourceType') || undefined;
    const status = request.query.get('status') as 'success' | 'error' | 'warning' | undefined;
    const startDate = request.query.get('startDate') || undefined;
    const endDate = request.query.get('endDate') || undefined;
    const limit = parseInt(request.query.get('limit') || '100', 10);

    logger.info('Querying audit logs', {
      userId,
      tenantId,
      action,
      correlationId: traceContext.correlationId
    });

    const logs = await auditLogRepository.query(
      {
        userId,
        tenantId,
        action,
        resourceType,
        status,
        startDate,
        endDate,
        limit
      },
      context
    );

    logger.info('Audit logs retrieved', {
      count: logs.length,
      correlationId: traceContext.correlationId
    });

    return {
      status: 200,
      jsonBody: {
        logs,
        count: logs.length
      },
      headers: {
        'Content-Type': 'application/json',
        ...injectTraceContext(traceContext)
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'Failed to retrieve audit logs',
      error instanceof Error ? error : new Error(errorMessage),
      {
        correlationId: traceContext.correlationId
      }
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Failed to retrieve audit logs.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}

/**
 * HTTP trigger for templates metadata endpoint.
 * GET /api/data/templates?tenantId=...&category=...&source=...&limit=100
 * POST /api/data/templates - Create or update template metadata
 */
export async function dataTemplatesHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);
  const logger = createLogger(context, request);

  // Optional authentication
  const authResult = await authenticateRequest(request, context, {
    requireAuth: false,
    allowAnonymous: true
  });

  const authContext = authResult.context;
  const tenantId = authContext?.tenantId || request.query.get('tenantId') || undefined;

  if (request.method === 'GET') {
    try {
      const category = request.query.get('category') || undefined;
      const source = request.query.get('source') as 'graph' | 'manual' | 'import' | undefined;
      const limit = parseInt(request.query.get('limit') || '100', 10);

      logger.info('Querying templates', {
        tenantId,
        category,
        source,
        correlationId: traceContext.correlationId
      });

      const templates = await templateRepository.query(
        {
          tenantId,
          category,
          source,
          limit
        },
        context
      );

      logger.info('Templates retrieved', {
        count: templates.length,
        correlationId: traceContext.correlationId
      });

      return {
        status: 200,
        jsonBody: {
          templates,
          count: templates.length
        },
        headers: {
          'Content-Type': 'application/json',
          ...injectTraceContext(traceContext)
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
      logger.error(
        'Failed to retrieve templates',
        error instanceof Error ? error : new Error(errorMessage),
        {
          correlationId: traceContext.correlationId
        }
      );

      return {
        status: 500,
        jsonBody: {
          error: 'Failed to retrieve templates.',
          details: errorMessage
        },
        headers: injectTraceContext(traceContext)
      };
    }
  } else if (request.method === 'POST') {
    // Create or update template metadata
    try {
      const body = (await request.json()) as {
        id: string;
        name: string;
        description?: string;
        category?: string;
        source?: 'graph' | 'manual' | 'import';
        sourceId?: string;
        version?: string;
        tags?: string[];
        metadata?: Record<string, unknown>;
      };

      if (!body.id || !body.name) {
        return {
          status: 400,
          jsonBody: { error: 'Missing required fields: id, name' },
          headers: injectTraceContext(traceContext)
        };
      }

      const template = {
        id: body.id,
        name: body.name,
        description: body.description,
        category: body.category,
        source: body.source || 'manual',
        sourceId: body.sourceId,
        lastModified: new Date().toISOString(),
        created: new Date().toISOString(),
        version: body.version,
        tags: body.tags,
        metadata: body.metadata,
        tenantId
      };

      const result = await templateRepository.upsert(template, context);

      logger.info('Template metadata saved', {
        templateId: result.id,
        correlationId: traceContext.correlationId
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
        'Failed to save template metadata',
        error instanceof Error ? error : new Error(errorMessage),
        {
          correlationId: traceContext.correlationId
        }
      );

      return {
        status: 500,
        jsonBody: {
          error: 'Failed to save template metadata.',
          details: errorMessage
        },
        headers: injectTraceContext(traceContext)
      };
    }
  } else {
    return {
      status: 405,
      jsonBody: { error: 'Method not allowed. Use GET or POST.' },
      headers: injectTraceContext(traceContext)
    };
  }
}
