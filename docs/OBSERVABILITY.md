# Observability Dashboards

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 46 Complete

## Application Insights Workbooks

**Location:** `docs/insights/` (create as needed)

### Dashboards

1. **System Health** - Overall status, dependency health
2. **Performance** - Response times, throughput, errors
3. **Cost** - Resource usage, cost trends
4. **Security** - Authentication attempts, failed requests

### Workbook Templates

Export Application Insights workbooks as JSON:

- Custom queries
- Visualizations
- Alerts configuration

## API Endpoint

**GET** `/api/system/status` (already implemented)

Returns aggregated system health.

## Metrics Tracked

- Request rate
- Error rate
- Response time (P50, P95, P99)
- Dependency health
- Cost per tenant
- Circuit breaker state transitions
