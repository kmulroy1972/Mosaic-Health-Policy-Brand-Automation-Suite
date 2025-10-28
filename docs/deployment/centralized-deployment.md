# Centralized Deployment & Rollback Guide

## Prerequisites

- Microsoft 365 admin center access (`Global Admin` or `Office Apps Admin`).
- Latest manifest package: download from GitHub Release (`artifacts/<env>/manifest-unified-<env>.json`).
- CDN URLs verified in Azure portal (Static Web Apps/Blob storage matches manifest).
- Azure Function app health check passing (`/api/health`).

## Deploying via Microsoft 365 Admin Center

1. Navigate to **Settings → Integrated apps → Upload custom apps**.
2. Choose **Upload manifest file** and select `manifest-unified-<env>.json`.
3. Assign to distribution list / pilot group:
   - Dev: `MHP-Brand-Automation-Dev`
   - Test: `MHP-Brand-Automation-UAT`
   - Prod: staged rollout (pilot 10%, then full)
4. Confirm add-in shows in the catalog; note deployment ID for rollback.
5. Record telemetry event `deployment_rollout` via Azure CLI (see below) or let CI pipeline emit automatically.

### Command-line deployment (optional)

Use Microsoft Graph PowerShell SDK:

```powershell
Connect-MgGraph -Scopes "AppCatalog.ReadWrite.All"
Publish-MgOrganizationAppCatalogApp -TenantAppId <AppId> -BodyParameter @{ manifest = Get-Content manifest.json }
```

## Validation Checklist

- Open Word web client → Insert → My Add-ins → verify “MHP Brand Automation” loads.
- Run “Apply Brand” on sample document → ensure telemetry event `brand_apply` recorded in App Insights.
- Execute Playwright smoke: `pnpm test:integration` pointing to deployed endpoint (set `BASE_URL`).
- Check App Insights dashboard `MHP Adoption Dashboard` for real-time events.

## Rollback

1. **Add-in removal:** In admin center, select the add-in → **Remove** → confirm.
2. **Restore previous version:** Upload prior manifest from Releases (each release stores artifacts). Assign to affected users.
3. **Azure rollback:**
   - Functions: `az functionapp deployment slot swap --name <app> --resource-group <rg> --slot staging --target-slot production` (reverts to staging snapshot).
   - CDN/Blob: re-point to previous versioned container or revert Static Web Apps deployment via `az staticwebapp deploy --skip-app-build true --deployment-token <token> --env production --artifact-location artifacts/static/<version>`.
4. **Feature flag kill switch:** In App Configuration, set `featureFlags.enablePdfA=false` or other toggles as needed to mitigate user impact.
5. Emit telemetry event `deployment_rollback` with `{ environment, reason }`.

## Automation Hooks

- GitHub Release → `release.yml` uploads `artifacts/` bundle.
- Azure DevOps or GitHub Actions can pickup artifact to run `scripts/deployment/deploy-azure.ps1` (requires Az CLI login).
- CI ensures PDF/A verification and accessibility tests pass before release tag.

## Notes

- Always coordinate with compliance to confirm Org Asset libraries remain unchanged before rollout.
- Maintain service health dashboards (App Insights, Graph throttling alerts) to monitor first 24h post deployment.

---

## Live Validation & Rollback (Added v0.2.0)

### Post-Deployment Validation Checklist

**Infrastructure Health:**

```bash
# Verify all Azure resources
az resource list --resource-group mhp-brand-rg --output table

# Check Functions App status
az functionapp show --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --query "{name:name,state:state,httpsOnly:httpsOnly}"

# Test health endpoint
curl -I https://api.mosaicpolicy.com/api/health
```

**Expected Results:**

- All resources show `Succeeded` or `Running` state
- Health endpoint returns `HTTP 200`
- Functions App responds within 2 seconds

### Manual Smoke Tests

**Prerequisites:**

- Microsoft 365 tenant with add-in sideloaded
- Sample documents: Word (brand template), PowerPoint (brand deck), Email

**Test Execution:**

1. **Word Web:** Open → Insert → My Add-ins → Load "MHP Brand Automation"
   - Verify taskpane renders without console errors
   - Click "Apply Brand" → expect success toast
   - Export PDF/A → verify download completes

2. **PowerPoint Web:** Load add-in
   - Click "Apply Brand" → verify brand elements applied
   - Click "Fix All" → check console for results log
   - Verify no rendering issues

3. **Outlook Web:** Compose new email
   - Load add-in → verify signature panel
   - Insert brand signature → verify HTML formatting

**Telemetry Verification:**

```bash
# Query Application Insights for smoke test events
az monitor app-insights query \
  --app mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --analytics-query "customEvents
    | where timestamp > ago(15m)
    | where name in ('brand_apply', 'ppt_fix', 'pdf_export')
    | summarize count() by name"
```

**Expected:** Each smoke test action generates corresponding telemetry event within 5 minutes

### Accessibility Testing

**Tool:** Playwright + axe-core or browser extension (axe DevTools)

**Quick Check:**

```bash
# Run automated accessibility scan (if Playwright tests configured)
pnpm test:a11y --grep "taskpane"
```

**Manual Check:**

1. Load taskpane in browser
2. Run axe DevTools scan
3. Document any Critical or Serious issues
4. File accessibility issues in GitHub with `a11y` label

### Rollback Procedures - Production Ready

#### Manifest Rollback (5-10 minutes)

```powershell
# PowerShell with Microsoft Graph SDK
Connect-MgGraph -Scopes "AppCatalog.ReadWrite.All"

# Step 1: Remove current version
Remove-MgOrganizationAppCatalogApp -TenantAppId <CURRENT_APP_ID>

# Step 2: Upload previous version
$manifest = Get-Content "./artifacts/v0.1.x/manifest-unified-prod.json" -Raw
Publish-MgOrganizationAppCatalogApp -BodyParameter @{ manifest = $manifest }

# Step 3: Verify
Get-MgOrganizationAppCatalogApp | Where-Object { $_.DisplayName -eq "MHP Brand Automation" }
```

**Manual Alternative:**

1. Navigate to Microsoft 365 Admin Center
2. Settings → Integrated apps
3. Select "MHP Brand Automation"
4. Click "Remove" → Confirm
5. Click "Upload custom apps" → Choose previous manifest
6. Assign to same distribution groups

#### Functions Rollback (2-5 minutes)

```bash
# Download previous deployment package from GitHub
gh run download <PREVIOUS_RUN_ID> -n mhp-release-artifacts

# Extract and deploy
unzip mhp-release-artifacts.zip
cd artifacts

# Deploy previous Functions package
az functionapp deployment source config-zip \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --src ./backend-functions-prod.zip

# Verify deployment
curl -I https://api.mosaicpolicy.com/api/health
```

**Note:** Requires previous GitHub Actions run artifacts. Artifacts are retained for 90 days by default.

#### Storage Rollback (1-3 minutes per container)

**Prerequisites:** Blob versioning must be enabled (recommended in v0.2.1+)

```bash
# Enable versioning (one-time setup)
az storage account blob-service-properties update \
  --account-name mhpbrandstorage38e5971a \
  --resource-group mhp-brand-rg \
  --enable-versioning true \
  --enable-change-feed true

# Enable soft-delete (30-day retention)
az storage account blob-service-properties delete-policy update \
  --account-name mhpbrandstorage38e5971a \
  --resource-group mhp-brand-rg \
  --enable true \
  --days-retained 30

# List versions for rollback
az storage blob list \
  --account-name mhpbrandstorage38e5971a \
  --container-name taskpanes \
  --prefix "prod/" \
  --auth-mode login \
  --include v

# Restore specific version
az storage blob copy start \
  --account-name mhpbrandstorage38e5971a \
  --destination-blob prod/word-taskpane.zip \
  --destination-container taskpanes \
  --source-blob prod/word-taskpane.zip \
  --source-container taskpanes \
  --source-version-id <VERSION_ID> \
  --auth-mode login
```

#### Feature Flag Kill Switch (< 1 minute)

**Quick disable for emergency mitigation:**

```bash
# Disable PDF/A export
az functionapp config appsettings set \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --settings featureFlags.enablePdfA=false

# Disable AI features
az functionapp config appsettings set \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --settings featureFlags.allowNonAzureAI=false

# Restart to apply (automatic after ~30s)
az functionapp restart \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg
```

### Rollback Decision Matrix

| Severity          | Symptoms                                   | Action                                         | Timing               |
| ----------------- | ------------------------------------------ | ---------------------------------------------- | -------------------- |
| **P0 - Critical** | Complete outage, data loss risk            | Full rollback (manifest + functions + storage) | Immediate (< 15 min) |
| **P1 - High**     | Major feature broken, affecting >50% users | Partial rollback (affected component only)     | Within 1 hour        |
| **P2 - Medium**   | Minor feature issue, workaround available  | Feature flag disable + hotfix deploy           | Within 4 hours       |
| **P3 - Low**      | Cosmetic issue, no functional impact       | Document as known issue + fix in next release  | Within 1 week        |

### Rollback Communication Template

```
Subject: [INCIDENT] MHP Brand Automation - Rollback Initiated

Priority: [P0/P1/P2]
Status: [In Progress/Completed]
Impact: [USER IMPACT DESCRIPTION]

Timeline:
- Detection: [TIME]
- Decision: [TIME]
- Rollback Start: [TIME]
- Rollback Complete: [ETA]

Root Cause: [BRIEF DESCRIPTION]

Actions Taken:
- [X] Manifest rolled back to v0.1.x
- [X] Functions package reverted
- [ ] Storage blobs restored (if needed)
- [X] Feature flags disabled

User Impact:
- [DESCRIPTION OF USER EXPERIENCE]
- [ANY REQUIRED USER ACTIONS]

Monitoring:
- Dashboard: https://portal.azure.com (Application Insights)
- Status: [LINK TO STATUS PAGE]
- Next Update: [TIME]

Contact: [TEAM EMAIL] | [SLACK CHANNEL]
```

### Validation Results - v0.2.0

**Date:** October 27, 2025  
**Status:** 🟡 PARTIAL PASS - Infrastructure Ready, Manual Testing Required

**Infrastructure Health:** ✅ PASS

- All 6 Azure resources in Succeeded/Running state
- Functions app responding (HTTP 200 on base URL)
- Storage accounts operational
- Application Insights collecting data

**Issues Identified:**

1. ⚠️ No `/api/health` endpoint deployed (returns 404)
   - **Impact:** Cannot verify backend readiness programmatically
   - **Mitigation:** Add health endpoint in v0.2.1

2. ⚠️ Blob versioning not enabled
   - **Impact:** Manual backup required for storage rollback
   - **Mitigation:** Enable via commands above (completed post-deployment)

3. ⚠️ Manual smoke tests pending
   - **Requires:** Microsoft 365 tenant with add-in sideloaded
   - **Status:** Waiting for tenant configuration

**Rollback Procedures:** ✅ DOCUMENTED

- Manifest rollback: 5-10 minutes
- Functions rollback: 2-5 minutes
- Storage rollback: 1-3 minutes per container
- Feature flags: < 1 minute

**Owner Contacts:**

- Infrastructure: Azure Admin Team
- Add-in Deployment: Microsoft 365 Admin
- Monitoring: DevOps Team
- Incident Response: [ON-CALL ROTATION]

**Detailed Report:** See `docs/deployment/production-validation-v0.2.0.md`
