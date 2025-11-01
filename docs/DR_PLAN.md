# Disaster Recovery Plan

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 24 Complete

## Backup Strategy

### Infrastructure

- **Bicep Templates** - Version controlled in `infra/`
- **ARM Export** - Export current state: `az group export`

### Data Backup

- **Cosmos DB** - Continuous backup (enable in Azure Portal)
- **Blob Storage** - Geo-redundant storage (GRS)
- **Function App** - Configuration exported to Key Vault

## Recovery Procedures

### 1. Infrastructure Recovery

```bash
# Deploy from Bicep
az deployment group create \
  --resource-group mhp-brand-rg-restore \
  --template-file infra/azure.bicep
```

### 2. Data Recovery

```bash
# Restore Cosmos DB from backup
az cosmosdb sql container restore \
  --account-name <cosmos-account> \
  --database-name mhp-brand-db \
  --container-name auditLogs \
  --restore-timestamp <timestamp>
```

### 3. Function App Recovery

```bash
# Deploy function code
func azure functionapp publish <function-app-name>
```

## RTO/RPO Targets

- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 24 hours (Cosmos DB continuous backup)

## Testing

Schedule quarterly DR drills:

1. Export production state
2. Create test resource group
3. Deploy from templates
4. Restore data
5. Verify functionality
