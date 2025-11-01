# Support and Ticketing Integration

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 112 Complete

## Azure DevOps / Freshservice Integration

**Location:** `packages/backend-functions/src/support/ticketing.ts`

Connects to Azure DevOps or Freshservice for issue tracking.

## Endpoint

**POST** `/api/support/ticket`

### Request

```json
{
  "title": "API endpoint returning 500 error",
  "description": "The /api/brand/guidance endpoint is failing...",
  "priority": "high",
  "category": "bug",
  "tenantId": "tenant-123"
}
```

### Response

```json
{
  "ticketId": "ticket-1234567890-abc123",
  "title": "API endpoint returning 500 error",
  "status": "open",
  "priority": "high",
  "createdBy": "user-123",
  "createdAt": "2025-01-27T12:00:00.000Z",
  "externalId": "ADO-12345"
}
```

## Ticket Categories

- **bug** - Software bugs
- **feature** - Feature requests
- **question** - Support questions
- **incident** - Critical incidents

## Priority Levels

- **low** - Minor issues
- **medium** - Standard priority
- **high** - Urgent issues
- **critical** - Critical incidents

## Implementation Status

⚠️ **External System Integration Pending**

Current implementation:

- Ticket creation framework
- Priority and category management
- External sync structure

**TODO:**

- Integrate Azure DevOps API
- Connect to Freshservice
- Sync ticket status
- Build ticket dashboard
- Add SLA tracking
