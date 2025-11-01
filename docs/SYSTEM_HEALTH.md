# System Health & Resilience

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 16 Complete

## Resilience Patterns

### Circuit Breaker

**Location:** `packages/backend-functions/src/resilience/circuitBreaker.ts`

Protects against cascading failures by:

- Opening circuit after threshold failures
- Rejecting requests immediately when open
- Half-open state for recovery testing
- Automatic recovery when service stabilizes

**Configuration:**

- `failureThreshold`: 5 (default)
- `successThreshold`: 2 (default)
- `timeout`: 60000ms (1 minute default)

### Retry Queue

**Location:** `packages/backend-functions/src/resilience/retryQueue.ts`

Handles failed operations with:

- Exponential backoff
- Configurable max retries
- Queue-based processing
- Automatic retry scheduling

**Configuration:**

- `maxRetries`: 3 (default)
- `retryDelay`: 1000ms (default)
- `backoffMultiplier`: 2 (default)
- `maxDelay`: 30000ms (default)

## System Status Endpoint

**GET** `/api/system/status`

Returns health status of all dependencies:

```json
{
  "status": "ok" | "degraded" | "down",
  "timestamp": "2025-01-27T12:00:00.000Z",
  "checks": {
    "cosmosDb": { "status": "ok" },
    "storage": { "status": "ok" },
    "openai": { "status": "ok" },
    "applicationInsights": { "status": "ok" },
    "keyVault": { "status": "degraded", "details": "Not configured" }
  }
}
```

### Dependency Checks

- **Cosmos DB** - Connection configuration
- **Azure Storage** - Connection configuration
- **OpenAI** - API key and endpoint configuration
- **Application Insights** - Always available when function is running
- **Key Vault** - URL configuration

## Usage Examples

### Circuit Breaker

```typescript
import { CircuitBreaker } from '../resilience/circuitBreaker';

const breaker = new CircuitBreaker({
  failureThreshold: 5,
  timeout: 60000
});

try {
  const result = await breaker.execute(async () => {
    return await callExternalAPI();
  });
} catch (error) {
  // Circuit is open or API call failed
}
```

### Retry Queue

```typescript
import { RetryQueue } from '../resilience/retryQueue';

const retryQueue = new RetryQueue({
  maxRetries: 3,
  retryDelay: 1000
});

try {
  const result = await retryQueue.enqueue(async () => {
    return await callExternalAPI();
  });
} catch (error) {
  // Failed after all retries
}
```

## Resilience Metrics

Track:

- Circuit breaker state transitions
- Retry queue length and processing time
- System status check results
- Dependency health trends

## Best Practices

1. **Use circuit breakers** for external API calls
2. **Use retry queues** for transient failures
3. **Monitor system status** regularly
4. **Set appropriate thresholds** based on service characteristics
5. **Log state transitions** for observability
