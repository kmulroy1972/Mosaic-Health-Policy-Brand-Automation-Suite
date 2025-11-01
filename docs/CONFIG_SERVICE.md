# Global Configuration Service

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 83 Complete

## Centralized Configuration Management

**Location:** `packages/backend-functions/src/config/service.ts`

Centralizes feature flags, tenant configs, and system settings.

## Endpoints

### GET `/api/config?tenantId=...`

Retrieve configuration for a tenant.

**Response:**

```json
{
  "tenantId": "tenant-123",
  "featureFlags": [
    {
      "name": "BRAND_AGENT_V2",
      "enabled": false,
      "description": "New BrandGuidanceAgent implementation"
    },
    {
      "name": "SEMANTIC_SEARCH_V2",
      "enabled": true,
      "description": "Enhanced semantic search"
    }
  ],
  "settings": {
    "maxDocumentSize": 10485760,
    "allowedFileTypes": ["pdf", "docx", "html"],
    "defaultLanguage": "en"
  },
  "lastUpdated": "2025-01-27T12:00:00.000Z"
}
```

### PUT `/api/config`

Update configuration.

**Request:**

```json
{
  "tenantId": "tenant-123",
  "featureFlags": [
    {
      "name": "BRAND_AGENT_V2",
      "enabled": true,
      "description": "New BrandGuidanceAgent implementation"
    }
  ],
  "settings": {
    "maxDocumentSize": 20480000,
    "defaultLanguage": "en"
  }
}
```

## Feature Flags

Feature flags allow:

- Gradual rollout of new features
- Tenant-specific feature enablement
- A/B testing capabilities
- Emergency feature toggles

## Default Feature Flags

- **BRAND_AGENT_V2** - New BrandGuidanceAgent implementation
- **SEMANTIC_SEARCH_V2** - Enhanced semantic search
- **REALTIME_COMPLIANCE** - Real-time compliance scanning

## Implementation Status

⚠️ **Cosmos DB / Azure App Configuration Integration Pending**

Current implementation:

- Configuration service framework
- Feature flag management
- Tenant-specific settings

**TODO:**

- Store configurations in Cosmos DB or Azure App Configuration
- Implement configuration caching
- Add configuration versioning
- Build admin UI for configuration management
