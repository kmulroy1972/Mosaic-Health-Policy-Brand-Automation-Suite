# Enhanced Policy Brief Workflow

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 54 Complete

## Workflow Stages

1. **Draft** - Initial creation
2. **Review** - Under review
3. **Approved** - Approved for publication
4. **Published** - Published and live

## Endpoints

**POST** `/api/briefs/{action}`

Where `{action}` is one of: `create`, `get`, `approve`, `publish`

### Create Brief

```json
POST /api/briefs/create
{
  "brief": {
    "title": "Healthcare Policy Analysis",
    "content": "Policy brief content..."
  }
}
```

### Get Brief

```json
POST /api/briefs/get
{
  "briefId": "brief-1234567890-abc123"
}
```

### Approve Brief

```json
POST /api/briefs/approve
{
  "briefId": "brief-1234567890-abc123"
}
```

**Note:** Automatically triggers BrandGuidanceAgent to polish content before approval.

### Publish Brief

```json
POST /api/briefs/publish
{
  "briefId": "brief-1234567890-abc123"
}
```

## Automation

- **Draft → Review:** Manual trigger
- **Review → Approved:** BrandGuidanceAgent polish applied automatically
- **Approved → Published:** One-click publish

## Data Storage

Stored in Cosmos DB `briefs` container with:

- Tenant isolation
- Workflow status tracking
- Audit trail (createdBy, reviewedBy, timestamps)
