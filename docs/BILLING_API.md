# Billing and Usage API

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 113 Complete

## Per-Tenant Invoicing Reports

**Location:** `packages/backend-functions/src/billing/summary.ts`

Creates billing summary and per-tenant invoicing reports.

## Endpoint

**GET** `/api/billing/summary?tenantId=...&startDate=...&endDate=...`

### Response

```json
{
  "tenantId": "tenant-123",
  "period": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "usage": [
    {
      "service": "API Calls",
      "quantity": 10000,
      "unit": "requests",
      "cost": 50.0
    },
    {
      "service": "Storage",
      "quantity": 100,
      "unit": "GB",
      "cost": 2.5
    }
  ],
  "totalCost": 77.5,
  "currency": "USD",
  "invoiceNumber": "INV-1234567890",
  "generatedAt": "2025-01-27T12:00:00.000Z"
}
```

## Usage Tracking

- **API Calls** - Number of API requests
- **Storage** - Data storage usage
- **Compute** - Compute hours
- **AI Tokens** - AI model usage

## Implementation Status

⚠️ **Usage Aggregation Pending**

Current implementation:

- Billing summary framework
- Usage item structure
- Cost calculation

**TODO:**

- Aggregate usage from Application Insights
- Track AI token consumption
- Generate PDF invoices
- Send automated billing emails
- Build billing dashboard
