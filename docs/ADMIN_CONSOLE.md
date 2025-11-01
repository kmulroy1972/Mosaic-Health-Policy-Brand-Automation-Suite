# Admin Console (Static Web App v2)

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 47 Complete

## Features

Expand `apps/dashboard` with:

### Tenant Switcher

- Switch between tenants
- View tenant-specific metrics

### Quota Settings

- Configure per-tenant quotas
- LLM token limits
- Image generation limits

### Feature Flags Editor

- Toggle feature flags
- A/B test configurations
- Canary deployment controls

### Cost & Usage Charts

- Real-time cost tracking
- Usage trends
- Quota utilization

## Security

- Secured via Entra ID groups
- Admin role required
- Audit logging for all changes

## Implementation Status

⚠️ **Admin Features Pending**

Current dashboard provides:

- Endpoint status
- Analytics summary
- Compliance metrics

**TODO:**

- Add tenant switcher
- Add quota management UI
- Add feature flag editor
- Add cost charts
- Implement admin authentication
