import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { createLogger } from '../utils/logger';

import { extractTraceContext, injectTraceContext, traceFunction } from './tracing';

/**
 * Middleware wrapper for HTTP triggers that adds OpenTelemetry tracing and centralized logging
 */
export function withTelemetry<T extends HttpRequest>(
  handler: (
    request: T,
    context: InvocationContext,
    logger: ReturnType<typeof createLogger>
  ) => Promise<HttpResponseInit>
) {
  return async (request: T, context: InvocationContext): Promise<HttpResponseInit> => {
    // Extract trace context from request headers
    const traceContext = extractTraceContext(request);

    // Create logger with trace context
    const logger = createLogger(context, request);

    // Execute handler with tracing
    const response = await traceFunction(
      context.functionName || 'unknown',
      traceContext,
      context,
      async () => {
        return await handler(request, context, logger);
      }
    );

    // Inject trace context into response headers
    const traceHeaders = injectTraceContext(traceContext);

    return {
      ...response,
      headers: {
        ...response.headers,
        ...traceHeaders
      }
    };
  };
}
