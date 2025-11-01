import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { PolicyBrief, type BriefWorkflowAction } from './models';
import { briefRepository } from './repository';


/**
 * HTTP trigger for policy brief workflow.
 * POST /api/briefs/{action}
 */
export async function briefsWorkflowHttpTrigger(
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
    const urlParts = request.url.split('/');
    const action = urlParts[urlParts.length - 1] as BriefWorkflowAction['action'];

    if (!['create', 'get', 'approve', 'publish'].includes(action)) {
      return {
        status: 400,
        jsonBody: { error: `Invalid action: ${action}. Use: create, get, approve, publish` },
        headers: injectTraceContext(traceContext)
      };
    }

    const body = (await request.json()) as BriefWorkflowAction;
    const userId = authResult.context.userId || 'unknown';
    const tenantId = authResult.context.tenantId;

    switch (action) {
      case 'create': {
        if (!body.brief || !body.brief.title || !body.brief.content) {
          return {
            status: 400,
            jsonBody: { error: 'Missing required fields: title, content' },
            headers: injectTraceContext(traceContext)
          };
        }

        const brief: PolicyBrief = {
          id: `brief-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          title: body.brief.title,
          content: body.brief.content,
          status: 'draft',
          createdBy: userId,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          tenantId: tenantId || undefined
        };

        const created = await briefRepository.create(brief, context);
        logger.info('Policy brief created', {
          briefId: created.id,
          correlationId: traceContext.correlationId
        });

        return {
          status: 201,
          jsonBody: created,
          headers: injectTraceContext(traceContext)
        };
      }

      case 'get': {
        if (!body.briefId) {
          return {
            status: 400,
            jsonBody: { error: 'Missing required field: briefId' },
            headers: injectTraceContext(traceContext)
          };
        }

        const brief = await briefRepository.get(body.briefId, tenantId, context);
        if (!brief) {
          return {
            status: 404,
            jsonBody: { error: 'Policy brief not found' },
            headers: injectTraceContext(traceContext)
          };
        }

        return {
          status: 200,
          jsonBody: brief,
          headers: injectTraceContext(traceContext)
        };
      }

      case 'approve': {
        if (!body.briefId) {
          return {
            status: 400,
            jsonBody: { error: 'Missing required field: briefId' },
            headers: injectTraceContext(traceContext)
          };
        }

        const brief = await briefRepository.get(body.briefId, tenantId, context);
        if (!brief) {
          return {
            status: 404,
            jsonBody: { error: 'Policy brief not found' },
            headers: injectTraceContext(traceContext)
          };
        }

        // Apply BrandGuidanceAgent polish
        // TODO: Call brandGuidanceAgentHttpTrigger internally
        const polishedContent = brief.content; // Placeholder

        brief.status = 'approved';
        brief.reviewedBy = userId;
        brief.reviewedAt = new Date().toISOString();
        brief.lastModified = new Date().toISOString();
        brief.content = polishedContent;

        const updated = await briefRepository.update(brief, context);
        logger.info('Policy brief approved', {
          briefId: updated.id,
          correlationId: traceContext.correlationId
        });

        return {
          status: 200,
          jsonBody: updated,
          headers: injectTraceContext(traceContext)
        };
      }

      case 'publish': {
        if (!body.briefId) {
          return {
            status: 400,
            jsonBody: { error: 'Missing required field: briefId' },
            headers: injectTraceContext(traceContext)
          };
        }

        const brief = await briefRepository.get(body.briefId, tenantId, context);
        if (!brief) {
          return {
            status: 404,
            jsonBody: { error: 'Policy brief not found' },
            headers: injectTraceContext(traceContext)
          };
        }

        if (brief.status !== 'approved') {
          return {
            status: 400,
            jsonBody: { error: 'Brief must be approved before publishing' },
            headers: injectTraceContext(traceContext)
          };
        }

        brief.status = 'published';
        brief.publishedAt = new Date().toISOString();
        brief.lastModified = new Date().toISOString();

        const updated = await briefRepository.update(brief, context);
        logger.info('Policy brief published', {
          briefId: updated.id,
          correlationId: traceContext.correlationId
        });

        return {
          status: 200,
          jsonBody: updated,
          headers: injectTraceContext(traceContext)
        };
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error('Brief workflow failed', error instanceof Error ? error : new Error(errorMessage));

    return {
      status: 500,
      jsonBody: {
        error: 'Brief workflow operation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
