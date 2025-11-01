# Key Vault Secrets & Rotation

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 31 Complete

## Rotation Job

**Schedule:** Every Monday at 1:00 AM UTC  
**Function:** `rotateSecretsJob`

### Monitored Secrets

- `AZURE_OPENAI_KEY` - Rotation interval: 90 days
- `CONFIDENTIAL_CLIENT_SECRET` - Rotation interval: 90 days

### Process

1. Check rotation windows for all secrets
2. Identify secrets needing rotation
3. Log rotation tasks (actual rotation pending Key Vault integration)
4. Verify rotation completion

## Implementation Status

⚠️ **Key Vault Integration Pending**

Current implementation:

- Rotation window tracking
- Weekly check job
- Rotation task logging

**TODO:**

- Key Vault API integration for secret rotation
- Function App app settings update
- Secret verification workflow
- Break-glass procedure documentation
