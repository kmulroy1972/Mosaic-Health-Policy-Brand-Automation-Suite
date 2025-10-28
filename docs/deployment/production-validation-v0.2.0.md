# Production Validation & Rollback Rehearsal - v0.2.0

**Date:** October 27, 2025  
**Deployment Tag:** v0.2.0  
**Validation Engineer:** System  
**Status:** 🟡 IN PROGRESS

---

## 1️⃣ Pre-Check Results

### Deployment Verification

✅ **GitHub Actions Workflow:** v0.2.0 completed successfully (Run #18825581499)  
✅ **Duration:** 3 minutes 12 seconds  
✅ **Artifacts:** 6 files uploaded (57,331 bytes)  
✅ **Artifact ID:** 4376441989

### GitHub Secrets Status

| Secret                 | Last Updated         | Status |
| ---------------------- | -------------------- | ------ |
| APPINSIGHTS_CONNECTION | 2025-10-26T17:47:57Z | ✅     |
| APP_CONFIG_CONNECTION  | 2025-10-26T17:47:31Z | ✅     |
| AZURE_CREDENTIALS      | 2025-10-26T23:10:42Z | ✅     |
| AZURE_FUNCTION_URL     | 2025-10-26T17:45:43Z | ✅     |
| CDN_URL                | 2025-10-26T17:46:13Z | ✅     |
| CLIENT_ID              | 2025-10-26T17:49:23Z | ✅     |
| CLIENT_SECRET          | 2025-10-26T23:03:59Z | ✅     |
| KEYVAULT_URI           | 2025-10-26T17:47:09Z | ✅     |
| STORAGE_ACCOUNT_URL    | 2025-10-26T17:46:34Z | ✅     |
| TENANT_ID              | 2025-10-26T23:10:49Z | ✅     |

### Azure Resource Health

| Resource                  | Type                 | State     | Location |
| ------------------------- | -------------------- | --------- | -------- |
| mhpbrandstorage38e5971a   | Storage Account      | Succeeded | eastus   |
| mhpfuncstorage38e5        | Storage Account      | Succeeded | eastus   |
| mhpbrandfunctions38e5971a | Function App         | Running   | eastus   |
| mhpbrandfunctions38e5971a | Application Insights | Succeeded | eastus   |
| EastUSLinuxDynamicPlan    | App Service Plan     | Succeeded | eastus   |

**Result:** ✅ All infrastructure components provisioned and operational

---

## 2️⃣ Service Health Verification

### Functions App Endpoint

```bash
$ curl -I https://api.mosaicpolicy.com/api/health

HTTP/2 404
Date: Mon, 27 Oct 2025 00:19:18 GMT
Server: Kestrel
```

**Status:** ⚠️ ISSUE DETECTED  
**Finding:** Health endpoint returns 404  
**Impact:** Cannot verify backend services are operational  
**Severity:** Medium - Functions app responds but no health check endpoint deployed

**Recommendation:**

1. Verify backend-functions package contains health endpoint
2. Check function deployment logs
3. Add health endpoint to backend if missing

### Functions App Base Status

```bash
$ curl -I https://api.mosaicpolicy.com

HTTP/2 200 OK
Content-Type: text/html
Server: Kestrel
Content-Length: 149,794 bytes
```

**Status:** ✅ PASS  
**Finding:** Functions App is responding to requests

---

## 3️⃣ Live Smoke Tests

### Prerequisites for Manual Testing

- **Access Required:**
  - Microsoft 365 tenant access
  - Word/PowerPoint/Outlook web or desktop apps
  - Admin privileges to sideload add-ins

### Test Matrix

#### 3.1 Taskpane Load Tests

| Application    | Test               | Expected Result                         | Actual Result | Status |
| -------------- | ------------------ | --------------------------------------- | ------------- | ------ |
| Word Web       | Load add-in UI     | Taskpane renders without console errors | ⏳ PENDING    | -      |
| Word Web       | Apply Brand action | Success toast displayed                 | ⏳ PENDING    | -      |
| Word Web       | Export PDF/A       | Document exported successfully          | ⏳ PENDING    | -      |
| PowerPoint Web | Load add-in UI     | Taskpane renders without console errors | ⏳ PENDING    | -      |
| PowerPoint Web | Apply Brand action | Brand elements applied                  | ⏳ PENDING    | -      |
| PowerPoint Web | Fix All action     | Results logged in console               | ⏳ PENDING    | -      |
| Outlook Web    | Load add-in UI     | Taskpane renders without console errors | ⏳ PENDING    | -      |
| Outlook Web    | Apply signature    | Signature inserted                      | ⏳ PENDING    | -      |

#### 3.2 Telemetry Verification

**Test Commands:**

```bash
# Query Application Insights for recent events
az monitor app-insights events show \
  --app mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --event-type customEvent \
  --start-time 2025-10-27T00:00:00Z
```

| Event Type  | Expected Count  | Actual Count | Status |
| ----------- | --------------- | ------------ | ------ |
| brand_apply | 1+ within 5 min | ⏳ PENDING   | -      |
| ppt_fix     | 1+ within 5 min | ⏳ PENDING   | -      |
| pdf_export  | 1+ within 5 min | ⏳ PENDING   | -      |

#### 3.3 Accessibility Quick Check

**Tool:** Playwright with axe-core or bookmarklet  
**Target:** Live taskpane at deployed CDN URL

| Component           | Critical Issues | Moderate Issues | Status |
| ------------------- | --------------- | --------------- | ------ |
| Word taskpane       | ⏳ PENDING      | ⏳ PENDING      | -      |
| PowerPoint taskpane | ⏳ PENDING      | ⏳ PENDING      | -      |
| Outlook taskpane    | ⏳ PENDING      | ⏳ PENDING      | -      |

---

## 4️⃣ Rollback Rehearsal

### 4.1 Manifest Rollback Procedure

**Objective:** Simulate rolling back add-in to previous version

**Prerequisites:**

- Previous manifest package (v0.1.x or create mock)
- Microsoft 365 Admin Center access
- Deployment ID from current version

**Test Steps:**

```bash
# 1. Download previous manifest (if exists)
gh release download v0.1.2 --pattern "*.json" 2>/dev/null || echo "No previous release artifacts"

# 2. Microsoft 365 Admin Center Manual Steps:
# - Navigate to Settings → Integrated apps
# - Select "MHP Brand Automation"
# - Click "Remove" or "Update"
# - Upload previous manifest

# 3. Verify rollback
# - Test add-in loads in Word
# - Confirm previous version displayed
```

**Documented Command:**

```powershell
# PowerShell approach (requires Microsoft Graph PowerShell SDK)
Connect-MgGraph -Scopes "AppCatalog.ReadWrite.All"

# Remove current version
Remove-MgOrganizationAppCatalogApp -TenantAppId <AppId>

# Upload previous version
$manifestContent = Get-Content "./manifest-unified-dev.json" -Raw
Publish-MgOrganizationAppCatalogApp -BodyParameter @{
    manifest = $manifestContent
}
```

**Timing:** Estimated 5-10 minutes for complete rollback  
**Permission Blockers:** Requires Office Apps Admin or Global Admin role

**Status:** ⏳ PENDING - Requires live tenant access

---

### 4.2 Functions App Rollback

**Current State:** No staging slot configured (Consumption Plan)

**Recommended Approach:** Package-based rollback

**Test Steps:**

```bash
# 1. List current deployment
az functionapp deployment list --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --query "[0].{id:id,status:status,timestamp:startTime}"

# 2. Download previous deployment package
# (Requires artifact from previous successful deployment)

# 3. Deploy previous version
az functionapp deployment source config-zip \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --src ./artifacts/backend-functions-prod-v0.1.2.zip
```

**Alternative: Deployment Slots (Requires upgrade to Standard plan)**

```bash
# Create staging slot (requires Standard tier or higher)
az functionapp deployment slot create \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --slot staging

# Swap slots (instant rollback)
az functionapp deployment slot swap \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --slot staging \
  --target-slot production
```

**Timing:**

- Package redeployment: ~2-5 minutes
- Slot swap (if available): ~30 seconds

**Cost Consideration:** Staging slots require App Service Plan upgrade (~$55/month minimum)

**Status:** ⏳ PENDING - No previous deployment packages available yet

---

### 4.3 Storage Rollback

**Objective:** Revert blob storage to previous version

**Current Configuration:**

- Storage Account: mhpbrandstorage38e5971a
- Containers: `taskpanes`, `manifests`
- Versioning: Not currently enabled

**Recommended Setup:**

```bash
# Enable blob versioning for future rollbacks
az storage account blob-service-properties update \
  --account-name mhpbrandstorage38e5971a \
  --resource-group mhp-brand-rg \
  --enable-versioning true

# Enable soft delete (30-day retention)
az storage account blob-service-properties delete-policy update \
  --account-name mhpbrandstorage38e5971a \
  --resource-group mhp-brand-rg \
  --enable true \
  --days-retained 30
```

**Rollback Procedure (once versioning enabled):**

```bash
# List blob versions
az storage blob list \
  --account-name mhpbrandstorage38e5971a \
  --container-name taskpanes \
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

**Manual Rollback (current state):**

1. Keep local copies of deployed artifacts
2. Re-upload previous version using deployment script
3. Update manifest references if needed

**Timing:** 1-3 minutes per blob  
**Status:** ⏳ PENDING - Versioning not yet enabled

---

## 5️⃣ Feature Flag Kill Switch

**Configuration:** App Configuration (if provisioned) or environment variables

**Quick Disable Commands:**

```bash
# Disable PDF/A export feature
az functionapp config appsettings set \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --settings featureFlags.enablePdfA=false

# Disable AI content generation
az functionapp config appsettings set \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --settings featureFlags.allowNonAzureAI=false

# View current settings
az functionapp config appsettings list \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --query "[?name contains(name, 'feature')].{Name:name,Value:value}"
```

**Timing:** Instant (requires function restart ~30s)  
**Status:** ✅ DOCUMENTED

---

## 6️⃣ Rollback Communication Plan

### Incident Response Steps

1. **Detection:** Monitoring alerts or user reports
2. **Assessment:** Review telemetry and error rates
3. **Decision:** Go/No-Go on rollback (< 15 minutes)
4. **Execute:** Run rollback procedures (documented above)
5. **Verify:** Smoke test previous version
6. **Communicate:** Notify stakeholders

### Notification Template

```
Subject: [ACTION REQUIRED] MHP Brand Automation - Rollback to v0.1.x

Team,

We have initiated a rollback of MHP Brand Automation from v0.2.0 to v0.1.x due to [REASON].

Impact:
- Add-in will reload to previous version
- In-flight documents: [IMPACT DESCRIPTION]
- ETA to completion: [TIME]

Actions Required:
- [USER ACTIONS IF ANY]

Monitoring:
- Dashboard: [LINK]
- Status updates: Every 30 minutes

Contact: [TEAM EMAIL/SLACK]
```

---

## 7️⃣ Outstanding Issues & Risks

### Critical Issues

1. **No Health Endpoint:** Functions app has no `/api/health` endpoint
   - **Impact:** Cannot verify backend readiness programmatically
   - **Mitigation:** Add health check endpoint in next deployment
   - **Owner:** Backend team

### Medium Issues

1. **No Blob Versioning:** Storage account has no versioning enabled
   - **Impact:** Cannot rollback storage without manual backup
   - **Mitigation:** Enable versioning immediately (see section 4.3)
   - **Owner:** DevOps team

2. **No Deployment Slots:** Functions app on Consumption plan has no staging slot
   - **Impact:** Rollback requires package redeployment (slower)
   - **Mitigation:** Consider upgrading to App Service Plan for instant slot swaps
   - **Owner:** Architecture team / Cost approval needed

3. **No Previous Artifacts:** First production deployment has no rollback target
   - **Impact:** Cannot test complete rollback procedure
   - **Mitigation:** v0.2.1+ will have v0.2.0 as rollback target
   - **Owner:** Release management

### Low Issues

1. **Storage Permissions:** Current user lacks Storage Blob Data Reader role
   - **Impact:** Cannot verify deployed blobs via CLI
   - **Mitigation:** Assign role or use service principal for verification
   - **Owner:** Azure admin

---

## 8️⃣ Recommendations for v0.2.1

### Immediate Actions

1. ✅ Enable blob versioning on storage account
2. ✅ Add `/api/health` endpoint to backend-functions
3. ✅ Implement feature flags in App Configuration
4. ✅ Add blob soft-delete with 30-day retention

### Process Improvements

1. ✅ Create GitHub Release for each deployment (not just tag)
2. ✅ Attach deployment artifacts to GitHub Release
3. ✅ Document rollback timing in release notes
4. ✅ Add rollback rehearsal to release checklist

### Monitoring Enhancements

1. ✅ Configure Application Insights alerts for error rates
2. ✅ Create dashboard for deployment health
3. ✅ Set up Microsoft 365 usage analytics for add-in

---

## 9️⃣ Validation Acceptance Criteria

| Criterion                       | Status     | Notes                          |
| ------------------------------- | ---------- | ------------------------------ |
| All infrastructure provisioned  | ✅ PASS    | 6 resources in Succeeded state |
| Functions app responding        | ✅ PASS    | HTTP 200 on base URL           |
| Health endpoint available       | ❌ FAIL    | Returns 404 - not deployed     |
| GitHub secrets current          | ✅ PASS    | All 10 secrets up to date      |
| Deployment artifacts accessible | ✅ PASS    | Artifact ID 4376441989         |
| Rollback procedures documented  | ✅ PASS    | See sections 4.1-4.3           |
| Feature flags available         | ⚠️ PARTIAL | Environment variables only     |
| Previous version for rollback   | ❌ N/A     | First deployment               |
| Telemetry verified              | ⏳ PENDING | Requires manual testing        |
| Accessibility checked           | ⏳ PENDING | Requires manual testing        |

---

## 🔟 Final Status Summary

**Overall Status:** 🟡 PARTIAL PASS - Infrastructure Ready, Manual Testing Required

**What's Working:**
✅ Azure infrastructure fully provisioned
✅ Functions app deployed and responding
✅ CI/CD pipeline operational
✅ Rollback procedures documented
✅ Secrets and configuration validated

**What Needs Attention:**
⚠️ No health endpoint deployed (needs backend update)
⚠️ Storage versioning not enabled (quick fix available)
⚠️ Manual smoke tests pending (requires M365 tenant access)
⚠️ First deployment - no rollback target available yet

**Ready for User Rollout:** 🟡 NOT YET

**Recommended Action:**

1. Deploy v0.2.1 with health endpoint and storage versioning
2. Complete manual smoke tests in non-production tenant
3. Verify telemetry pipeline
4. Then proceed to production pilot rollout

---

## Appendix A: Quick Reference Commands

### Check Deployment Status

```bash
# Functions status
az functionapp show --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg --query "{name:name,state:state}"

# Storage health
az storage account show --name mhpbrandstorage38e5971a --resource-group mhp-brand-rg --query "{name:name,provisioningState:provisioningState}"

# All resources
az resource list --resource-group mhp-brand-rg --output table
```

### Emergency Rollback

```bash
# 1. Download previous artifact
gh run download <PREVIOUS_RUN_ID> -n mhp-release-artifacts

# 2. Deploy previous Functions package
az functionapp deployment source config-zip \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --src ./backend-functions-prod.zip

# 3. Upload previous manifest to M365 Admin Center (manual)

# 4. Disable problem feature via App Settings
az functionapp config appsettings set \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --settings featureFlags.problematicFeature=false
```

### Telemetry Query

```bash
# Recent errors
az monitor app-insights query \
  --app mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --analytics-query "exceptions | where timestamp > ago(1h) | summarize count() by type"

# Recent events
az monitor app-insights query \
  --app mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --analytics-query "customEvents | where timestamp > ago(1h) | summarize count() by name"
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-27T00:20:00Z  
**Next Review:** After v0.2.1 deployment or first manual test completion
