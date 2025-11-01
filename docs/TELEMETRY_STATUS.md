# Telemetry & Observability Status

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 8 Complete

## Overview

The Mosaic Brand Automation Suite implements comprehensive telemetry and observability using:

- **Centralized Logging** - Structured logs with correlation IDs
- **OpenTelemetry Tracing** - Distributed tracing across Azure Functions
- **Application Insights Integration** - Automatic metric and log collection

## Architecture

### Logging Layer

**Location:** `packages/backend-functions/src/utils/logger.ts`

The centralized logger provides:

- Structured logging with consistent format
- Correlation ID extraction from HTTP headers
- Trace ID and Span ID generation for OpenTelemetry
- Integration with Application Insights via Azure Functions context

#### Logger Features

```typescript
import { createLogger } from '../utils/logger';

const logger = createLogger(context, request);

logger.info('Operation started', { userId: '123' });
logger.warn('Retry attempt', { attempt: 3 });
logger.error('Operation failed', error, { context: 'additional-data' });
```

#### Log Levels

- **DEBUG (0)** - Detailed diagnostic information
- **INFO (1)** - General informational messages
- **WARN (2)** - Warning messages for potentially harmful situations
- **ERROR (3)** - Error messages for failures

### Distributed Tracing

**Location:** `packages/backend-functions/src/telemetry/tracing.ts`

Implements OpenTelemetry-style distributed tracing:

#### Trace Context Extraction

- Extracts W3C Trace Context headers (`traceparent`)
- Generates correlation IDs from HTTP headers
- Creates trace IDs and span IDs for request flows

#### Trace Context Format

```typescript
interface TraceContext {
  traceId: string; // 32-character hex (OpenTelemetry format)
  spanId: string; // 16-character hex (OpenTelemetry format)
  correlationId: string; // Custom correlation ID
  parentSpanId?: string; // Parent span for nested calls
}
```

#### W3C Trace Context Support

The system supports the W3C Trace Context standard:

- **traceparent header:** `00-{trace-id}-{parent-id}-{trace-flags}`
- Automatically extracts and propagates trace context
- Injects trace context into response headers

### Application Insights Integration

**Configuration:** `packages/backend-functions/host.json`

```json
{
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  }
}
```

#### Automatic Collection

Azure Functions automatically collects:

- Function execution logs (`context.log`, `context.error`)
- HTTP request/response data
- Performance counters
- Custom metrics

#### Structured Logging

All logs include structured properties:

```json
{
  "level": "INFO",
  "message": "Compliance validation completed",
  "timestamp": "2025-01-27T12:00:00.000Z",
  "invocationId": "abc123",
  "functionName": "complianceValidate",
  "correlationId": "corr-1234567890-xyz",
  "traceId": "a1b2c3d4e5f6...",
  "spanId": "12345678abcd...",
  "properties": {
    "documentType": "html",
    "wcagScore": 85,
    "violationCount": 3
  }
}
```

## Implementation Status

### ✅ Completed

- [x] Centralized logger (`utils/logger.ts`)
- [x] OpenTelemetry-style tracing (`telemetry/tracing.ts`)
- [x] Correlation ID extraction and propagation
- [x] W3C Trace Context support
- [x] Trace context injection in HTTP responses
- [x] Integration example in `compliance/httpTrigger.ts`
- [x] Application Insights configuration

### 🔄 In Progress

- [ ] Integrate logger into all HTTP triggers
- [ ] Add tracing to timer functions
- [ ] Implement span wrapper middleware
- [ ] Add custom Application Insights metrics

### 📋 Planned

- [ ] Full OpenTelemetry SDK integration (when available for Node.js Azure Functions)
- [ ] Custom dashboards in Application Insights
- [ ] Alert rules based on trace context
- [ ] Performance monitoring with trace spans
- [ ] Correlation ID tracking across external API calls

## Usage Examples

### Basic Logging

```typescript
import { createLogger } from '../utils/logger';

export async function myHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const logger = createLogger(context, request);

  logger.info('Request received', {
    method: request.method,
    url: request.url
  });

  try {
    // ... function logic ...
    logger.info('Operation successful');
    return { status: 200, jsonBody: { result: 'ok' } };
  } catch (error) {
    logger.error('Operation failed', error);
    return { status: 500, jsonBody: { error: 'Failed' } };
  }
}
```

### Distributed Tracing

```typescript
import { extractTraceContext, injectTraceContext, traceFunction } from '../telemetry/tracing';

export async function myHttpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const traceContext = extractTraceContext(request);

  const result = await traceFunction('myHttpTrigger', traceContext, context, async () => {
    // Your function logic here
    return { status: 200, jsonBody: { result: 'ok' } };
  });

  return {
    ...result,
    headers: {
      ...result.headers,
      ...injectTraceContext(traceContext)
    }
  };
}
```

### Middleware Pattern

```typescript
import { withTelemetry } from '../telemetry/middleware';

const handler = withTelemetry(async (request, context, logger) => {
  logger.info('Processing request');
  // ... function logic ...
  return { status: 200, jsonBody: { result: 'ok' } };
});

export const myHttpTrigger = handler;
```

## Correlation IDs

### Header Names Supported

The system extracts correlation IDs from the following headers (in order of priority):

1. `x-correlation-id`
2. `request-id`
3. `x-request-id`

If none are present, a new correlation ID is generated:

- Format: `corr-{timestamp}-{random}`

### Trace Headers Injected

All HTTP responses include:

- `x-correlation-id` - Correlation ID for request tracking
- `trace-id` - OpenTelemetry trace ID
- `span-id` - OpenTelemetry span ID
- `traceparent` - W3C Trace Context header

## Application Insights Queries

### Find All Logs for a Correlation ID

```kusto
traces
| where customDimensions.correlationId == "corr-1234567890-xyz"
| order by timestamp desc
```

### Trace Request Flow

```kusto
traces
| where customDimensions.traceId == "a1b2c3d4e5f6..."
| order by timestamp asc
| project timestamp, message, customDimensions.functionName, customDimensions.spanId
```

### Find Function Execution Time

```kusto
traces
| where message contains "Span completed"
| extend duration = toint(customDimensions.duration)
| summarize avg(duration), max(duration), min(duration) by functionName
```

### Error Rate by Function

```kusto
traces
| where severityLevel >= 3
| summarize errorCount = count() by functionName
| order by errorCount desc
```

## Metrics

### Custom Metrics Available

- **Function Execution Time** - Tracked via span completion logs
- **Error Rate** - Counted from ERROR level logs
- **Request Count** - Tracked automatically by Application Insights
- **Correlation Coverage** - Percentage of requests with correlation IDs

### Application Insights Default Metrics

- Function invocations
- Function execution time
- HTTP requests
- HTTP response codes
- Memory usage
- CPU usage

## Best Practices

1. **Always use the centralized logger** - Don't use `context.log()` directly
2. **Extract trace context early** - Extract from request headers at function start
3. **Propagate correlation IDs** - Include in all external API calls
4. **Inject trace headers** - Add trace context to all HTTP responses
5. **Log structured data** - Use properties object for searchable fields
6. **Log errors with context** - Include correlation ID and trace ID in error logs

## Roadmap

### Phase 8+ Enhancements

- **OpenTelemetry SDK Integration** - Full SDK when available
- **Custom Metrics API** - Direct metric emission to Application Insights
- **Distributed Tracing UI** - Custom Application Insights workbooks
- **Alert Rules** - Automated alerts based on trace patterns
- **Performance Profiling** - Automatic slow request detection
- **Correlation Across Services** - Track requests across multiple Azure Functions
- **External API Tracing** - Propagate trace context to OpenAI, Graph API, etc.

## References

- [Azure Functions Monitoring](https://learn.microsoft.com/azure/azure-functions/functions-monitoring)
- [Application Insights](https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- [OpenTelemetry](https://opentelemetry.io/)
