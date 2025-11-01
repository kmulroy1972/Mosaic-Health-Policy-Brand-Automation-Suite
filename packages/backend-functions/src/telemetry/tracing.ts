import type { HttpRequest, InvocationContext } from '@azure/functions';

/**
 * OpenTelemetry-style tracing wrapper for Azure Functions
 * Provides distributed tracing correlation across function calls
 */

export interface TraceContext {
  traceId: string;
  spanId: string;
  correlationId: string;
  parentSpanId?: string;
}

/**
 * Extract trace context from HTTP request headers (W3C Trace Context format)
 */
export function extractTraceContext(request: HttpRequest): TraceContext {
  const headers = request.headers;

  // W3C Trace Context: traceparent header format: 00-{trace-id}-{parent-id}-{trace-flags}
  const traceparent = headers.get('traceparent');
  let traceId: string;
  let parentSpanId: string | undefined;

  if (traceparent) {
    const parts = traceparent.split('-');
    if (parts.length >= 4) {
      traceId = parts[1];
      parentSpanId = parts[2];
    } else {
      traceId = generateTraceId();
    }
  } else {
    traceId = generateTraceId();
  }

  // Extract correlation ID
  const correlationId =
    headers.get('x-correlation-id') ||
    headers.get('request-id') ||
    headers.get('x-request-id') ||
    `corr-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Generate new span ID for this function invocation
  const spanId = generateSpanId();

  return {
    traceId,
    spanId,
    correlationId,
    parentSpanId
  };
}

/**
 * Generate a 32-character hexadecimal trace ID (OpenTelemetry format)
 */
function generateTraceId(): string {
  // In production, use proper OpenTelemetry SDK
  // For now, generate a compatible format
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a 16-character hexadecimal span ID (OpenTelemetry format)
 */
function generateSpanId(): string {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < 8; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Inject trace context into HTTP response headers (W3C Trace Context format)
 */
export function injectTraceContext(traceContext: TraceContext): Record<string, string> {
  const headers: Record<string, string> = {
    'x-correlation-id': traceContext.correlationId,
    'trace-id': traceContext.traceId,
    'span-id': traceContext.spanId
  };

  // W3C Trace Context format
  if (traceContext.spanId) {
    headers['traceparent'] = `00-${traceContext.traceId}-${traceContext.spanId}-01`;
  }

  return headers;
}

/**
 * Create a trace span wrapper for function execution
 */
export async function traceFunction<T>(
  functionName: string,
  traceContext: TraceContext,
  context: InvocationContext,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  const spanId = traceContext.spanId;

  // Log span start
  context.log(`Span started: ${functionName}`, {
    traceId: traceContext.traceId,
    spanId,
    correlationId: traceContext.correlationId,
    parentSpanId: traceContext.parentSpanId,
    functionName
  });

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    // Log span completion
    context.log(`Span completed: ${functionName}`, {
      traceId: traceContext.traceId,
      spanId,
      correlationId: traceContext.correlationId,
      functionName,
      duration,
      status: 'success'
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log span error
    context.error(`Span failed: ${functionName}`, {
      traceId: traceContext.traceId,
      spanId,
      correlationId: traceContext.correlationId,
      functionName,
      duration,
      status: 'error',
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack
            }
          : String(error)
    });

    throw error;
  }
}

/**
 * Create trace context for timer/scheduled functions
 */
export function createTraceContextForTimer(context: InvocationContext): TraceContext {
  return {
    traceId: generateTraceId(),
    spanId: generateSpanId(),
    correlationId: `timer-${context.invocationId}-${Date.now()}`
  };
}
