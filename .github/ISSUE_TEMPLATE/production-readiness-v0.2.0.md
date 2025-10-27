---
name: Production Readiness Checklist - v0.2.0
about: Track production readiness items identified during validation
title: '[Production Readiness] v0.2.0 Validation Follow-up Items'
labels: ['production', 'deployment', 'priority-high']
assignees: ''
---

## Overview

This issue tracks remediation items identified during the v0.2.0 production validation and rollback rehearsal conducted on October 27, 2025.

**Validation Report:** `docs/deployment/production-validation-v0.2.0.md`  
**Deployment Documentation:** `docs/deployment/centralized-deployment.md`

---

## Critical Issues

### 1. ❌ No Health Endpoint Deployed

**Status:** Not Implemented  
**Severity:** High  
**Impact:** Cannot verify backend readiness programmatically in CI/CD or monitoring

**Current Behavior:**

```bash
$ curl -I https://mhpbrandfunctions38e5971a.azurewebsites.net/api/health
HTTP/2 404
```

**Expected Behavior:**

```bash
$ curl -I https://mhpbrandfunctions38e5971a.azurewebsites.net/api/health
HTTP/2 200
Content-Type: application/json
```

**Acceptance Criteria:**

- [ ] Create `/api/health` HTTP trigger in `packages/backend-functions/src/`
- [ ] Return JSON with `{ "status": "healthy", "version": "0.2.1", "timestamp": "ISO8601" }`
- [ ] Include checks for: AI client connection, Graph client auth, storage access
- [ ] Add to deployment validation checklist
- [ ] Update monitoring alerts to use health endpoint

**Estimate:** 2-4 hours

---

## High Priority Issues

### 2. ✅ Blob Versioning Not Enabled

**Status:** COMPLETED (2025-10-27)  
**Severity:** Medium  
**Impact:** Manual backup required for storage rollback

**Resolution:**

```bash
# Versioning enabled
az storage account blob-service-properties update \
  --account-name mhpbrandstorage38e5971a \
  --enable-versioning true \
  --enable-change-feed true

# Soft delete enabled (30-day retention)
az storage blob service-properties delete-policy update \
  --account-name mhpbrandstorage38e5971a \
  --days-retained 30 \
  --enable true
```

**Verification:**

- [x] Blob versioning enabled
- [x] 30-day soft delete configured
- [ ] Document in infrastructure-as-code (Bicep/Terraform)

---

### 3. ⏳ Manual Smoke Tests Pending

**Status:** Blocked  
**Severity:** Medium  
**Impact:** Cannot verify end-user functionality

**Blocker:** Requires Microsoft 365 tenant with add-in sideload capability

**Test Matrix:**
| Application | Test | Status |
|-------------|------|--------|
| Word Web | Load taskpane UI | ⏳ Pending |
| Word Web | Apply Brand action | ⏳ Pending |
| Word Web | Export PDF/A | ⏳ Pending |
| PowerPoint Web | Load taskpane UI | ⏳ Pending |
| PowerPoint Web | Apply Brand | ⏳ Pending |
| PowerPoint Web | Fix All | ⏳ Pending |
| Outlook Web | Load taskpane UI | ⏳ Pending |
| Outlook Web | Insert signature | ⏳ Pending |

**Acceptance Criteria:**

- [ ] Obtain M365 developer tenant or configure test tenant
- [ ] Sideload add-in manifests (dev/test environment)
- [ ] Execute all 8 smoke tests
- [ ] Verify telemetry events in Application Insights
- [ ] Document test results with screenshots
- [ ] Update validation report with pass/fail status

**Estimate:** 4-6 hours (includes tenant setup)

---

### 4. ⏳ Telemetry Verification

**Status:** Pending  
**Severity:** Medium  
**Impact:** Cannot confirm observability pipeline is working

**Required Actions:**

- [ ] Execute smoke tests (depends on #3)
- [ ] Query Application Insights for custom events:
  - `brand_apply`
  - `ppt_fix`
  - `pdf_export`
  - `deployment_rollout`
- [ ] Verify events appear within 5 minutes
- [ ] Check event properties include: `environment`, `version`, `userId` (hashed)
- [ ] Validate error tracking with intentional failure

**Test Query:**

```bash
az monitor app-insights query \
  --app mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --analytics-query "customEvents
    | where timestamp > ago(15m)
    | where name in ('brand_apply', 'ppt_fix', 'pdf_export')
    | summarize count() by name, bin(timestamp, 1m)"
```

**Estimate:** 2 hours

---

### 5. ⏳ Accessibility Testing

**Status:** Not Started  
**Severity:** Low (but compliance requirement)  
**Impact:** May have accessibility violations

**Tools:**

- [ ] Playwright with axe-core (automated)
- [ ] axe DevTools (manual browser extension)
- [ ] NVDA/JAWS screen reader testing (if required by compliance)

**Acceptance Criteria:**

- [ ] Run automated accessibility scan on all three taskpanes
- [ ] Document Critical and Serious violations (target: 0)
- [ ] Create separate issues for any violations found with `a11y` label
- [ ] Generate WCAG 2.1 Level AA compliance report

**Estimate:** 3-4 hours

---

## Medium Priority Items

### 6. 📝 No Previous Deployment for Rollback Testing

**Status:** Expected (first deployment)  
**Severity:** Low  
**Impact:** Cannot test actual rollback until v0.2.1+

**Actions:**

- [ ] Tag v0.2.1 as next release
- [ ] Download v0.2.0 artifacts for rollback testing
- [ ] Execute full rollback procedure from v0.2.1 → v0.2.0
- [ ] Document timing and any issues encountered
- [ ] Update rollback documentation based on actual experience

**Estimate:** 1-2 hours (during v0.2.1 deployment)

---

### 7. 🔧 Infrastructure as Code

**Status:** Not Implemented  
**Severity:** Low  
**Impact:** Manual Azure resource recreation if needed

**Current State:** Azure resources created via Azure CLI commands

**Desired State:** Infrastructure defined in code

**Options:**

- [ ] Bicep templates (Azure-native)
- [ ] Terraform (multi-cloud)
- [ ] ARM templates (legacy)

**Scope:**

- [ ] Resource group
- [ ] Storage accounts (with versioning, soft-delete, RBAC)
- [ ] Function App (with app settings, deployment slots if upgraded)
- [ ] Application Insights
- [ ] App Service Plan
- [ ] Role assignments

**Estimate:** 8-12 hours

---

### 8. 📊 Monitoring Dashboards

**Status:** Not Configured  
**Severity:** Low  
**Impact:** Reactive instead of proactive monitoring

**Required Dashboards:**

1. **Deployment Health**
   - Deployment success/failure rate
   - Deployment duration trends
   - Rollback frequency

2. **Application Health**
   - Request rates per endpoint
   - Error rates (by type)
   - P50/P95/P99 latency
   - Function execution count

3. **User Adoption**
   - Daily active users (by app)
   - Feature usage (brand apply, PDF export, etc.)
   - Error impact (users affected)

4. **Azure Resource Health**
   - Function App CPU/memory
   - Storage account capacity/transactions
   - Application Insights data ingestion

**Acceptance Criteria:**

- [ ] Create Application Insights workbook for each dashboard
- [ ] Configure alerts for error rate > 5%, latency > 3s
- [ ] Share dashboard URLs in deployment documentation
- [ ] Set up weekly automated reports

**Estimate:** 6-8 hours

---

## Process Improvements

### 9. 📋 GitHub Releases

**Status:** Not Configured  
**Severity:** Low  
**Impact:** Artifacts not easily accessible for rollback

**Current:** Only git tags created (`v0.2.0`)  
**Desired:** Formal GitHub Releases with attached artifacts

**Actions:**

- [ ] Update `.github/workflows/release.yml` to create GitHub Release
- [ ] Attach deployment artifacts: manifests, taskpane packages, Functions zip
- [ ] Include release notes template
- [ ] Add rollback instructions in release notes
- [ ] Document artifact retention policy (current: 90 days)

**Example:**

```yaml
- name: Create Release
  uses: actions/create-release@v1
  with:
    tag_name: ${{ github.ref }}
    release_name: Release ${{ github.ref }}
    body_path: ./RELEASE_NOTES.md
    draft: false
    prerelease: false
```

**Estimate:** 2-3 hours

---

### 10. 🧪 Pre-Deployment Testing

**Status:** Manual  
**Severity:** Low  
**Impact:** Risk of deploying broken code

**Current State:** No automated tests run before deployment

**Recommended:**

- [ ] Unit tests for all backend functions
- [ ] Integration tests for Graph/AI clients
- [ ] Accessibility tests (axe-core)
- [ ] PDF/A validation
- [ ] Manifest schema validation

**Add to CI Pipeline:**

```yaml
- name: Run Tests
  run: |
    pnpm test:unit
    pnpm test:integration
    pnpm test:a11y
```

- [ ] Block deployment if tests fail
- [ ] Require manual approval for production deployments

**Estimate:** 4-6 hours (test infrastructure setup)

---

## Acceptance Criteria Summary

**Ready for User Rollout when:**

- [x] All infrastructure provisioned and operational
- [ ] Health endpoint returns HTTP 200
- [x] Rollback procedures documented and rehearsed
- [ ] Manual smoke tests pass (all 8 scenarios)
- [ ] Telemetry pipeline validated
- [ ] Accessibility scan shows 0 Critical violations
- [x] Blob versioning and soft-delete enabled
- [ ] Monitoring dashboards configured
- [ ] GitHub Releases created with artifacts

**Current Status:** 3/9 criteria met (33%)

**Target Date for Production Rollout:** [To Be Determined]

---

## Related Documentation

- [Production Validation Report](../docs/deployment/production-validation-v0.2.0.md)
- [Centralized Deployment Guide](../docs/deployment/centralized-deployment.md)
- [Rollback Procedures](../docs/deployment/centralized-deployment.md#rollback-procedures---production-ready)

---

## Next Steps

1. Assign owners to each item
2. Prioritize critical and high-priority items for v0.2.1
3. Schedule manual testing session with M365 tenant access
4. Review and approve infrastructure-as-code approach
5. Set target date for production pilot rollout
