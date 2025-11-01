# Infrastructure as Code

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 24 Complete

## Bicep Template

**Location:** `infra/azure.bicep`

### Resources Provisioned

- **Function App** - Azure Functions v4
- **App Service Plan** - Consumption plan (Y1)
- **Storage Account** - For function app storage
- **Application Insights** - Telemetry and monitoring
- **Cosmos DB Account** - NoSQL database
- **Key Vault** - Secret storage

### Deployment

```bash
az deployment group create \
  --resource-group mhp-brand-rg \
  --template-file infra/azure.bicep \
  --parameters appName=mhpbrand environment=prod
```

### Validation

```bash
az deployment group what-if \
  --resource-group mhp-brand-rg \
  --template-file infra/azure.bicep
```

## Current Configuration State

Export current Azure configuration:

```bash
az functionapp config show --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg > config/current-state.json
```
