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
