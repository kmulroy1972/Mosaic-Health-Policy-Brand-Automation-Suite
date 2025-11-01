import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authenticateRequest } from '../auth/middleware';
import { extractTraceContext, injectTraceContext } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import {
  cancelSubscription,
  createSubscription,
  generateInvoice,
  type SubscriptionRequest
} from './manager';


/**
 * HTTP trigger for subscription management.
 * POST /api/subscriptions - Create subscription
 * DELETE /api/subscriptions/{id} - Cancel subscription
 * GET /api/subscriptions/{id}/invoice - Generate invoice
 */
export async function subscriptionsHttpTrigger(
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
    const urlParts = request.url.split('/');
    const action = urlParts[urlParts.length - 1];
    const subscriptionId =
      urlParts[urlParts.length - 2] !== 'subscriptions' ? urlParts[urlParts.length - 2] : undefined;

    if (request.method === 'POST') {
      const body = (await request.json()) as SubscriptionRequest;

      if (!body.tenantId || !body.tier) {
        return {
          status: 400,
          jsonBody: { error: 'Missing required fields: tenantId, tier' },
          headers: injectTraceContext(traceContext)
        };
      }

      logger.info('Subscription creation requested', {
        tenantId: body.tenantId,
        tier: body.tier,
        correlationId: traceContext.correlationId
      });

      const result = await createSubscription(body, context);

      return {
        status: 201,
        jsonBody: result,
        headers: {
          'Content-Type': 'application/json',
          ...injectTraceContext(traceContext)
        }
      };
    } else if (request.method === 'DELETE' && subscriptionId) {
      const cancelImmediately = request.query.get('immediate') === 'true';

      logger.info('Subscription cancellation requested', {
        subscriptionId,
        cancelImmediately,
        correlationId: traceContext.correlationId
      });

      const result = await cancelSubscription(subscriptionId, cancelImmediately, context);

      return {
        status: 200,
        jsonBody: result,
        headers: {
          'Content-Type': 'application/json',
          ...injectTraceContext(traceContext)
        }
      };
    } else if (request.method === 'GET' && subscriptionId && action === 'invoice') {
      logger.info('Invoice generation requested', {
        subscriptionId,
        correlationId: traceContext.correlationId
      });

      const result = await generateInvoice(subscriptionId, context);

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
        jsonBody: { error: 'Method not allowed or invalid endpoint' },
        headers: injectTraceContext(traceContext)
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error ?? 'unknown');
    logger.error(
      'Subscription operation failed',
      error instanceof Error ? error : new Error(errorMessage)
    );

    return {
      status: 500,
      jsonBody: {
        error: 'Subscription operation failed.',
        details: errorMessage
      },
      headers: injectTraceContext(traceContext)
    };
  }
}
