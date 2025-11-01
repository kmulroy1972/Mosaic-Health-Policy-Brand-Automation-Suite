# Multi-Tenant Foundations

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 29 Complete

## Tenant Routing

**Location:** `packages/backend-functions/src/core/tenant.ts`

### Tenant ID Extraction

Extracts tenant from:

1. `X-Mosaic-Tenant` HTTP header
2. `tenantId` or `tenant` query parameter
3. Authenticated token (tenantId claim)

### Data Partitioning

Cosmos DB containers partitioned by `tenantId`:

- `auditLogs` - Partition key: `/tenantId`
- `templates` - Partition key: `/tenantId`
- `userPreferences` - Partition key: `/tenantId`

## Tenant Management Endpoints

### List Tenants

**GET** `/api/tenants/list`

Returns list of all tenants (requires admin authentication).

### Get Tenant Configuration

**GET** `/api/tenants/config?tenantId=...`

Returns tenant-specific configuration:

- Quotas (LLM tokens, image generation)
- Feature flags
- Custom settings

## Tenant Isolation

- **Data Isolation:** Each tenant's data stored in separate partition
- **Authentication:** Tenant ID validated from token
- **Storage:** Blob storage paths include tenant ID
- **Logging:** All operations tagged with tenant ID

## Implementation Status

✅ **Core routing and extraction implemented**  
⚠️ **Cosmos DB queries need tenant filtering**  
⚠️ **Blob storage paths need tenant prefixes**
