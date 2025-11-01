# Dashboard Deployment Issue - Agent Review Prompt

## Context

This is a React + Vite dashboard deployed to Cloudways (managed hosting). The deployment has been failing for months with asset loading issues (404 errors for CSS/JS files).

## Current Problem

- **URL:** https://cdn.mosaicpolicy.com/dashboard-new/#/
- **Error:** 404 for assets (index-BX6XFddt.js, index-CZZW_BH7.css)
- **Root Cause:** Path mismatch - index.html references `/dashboard/assets/` but files are at `/dashboard-new/assets/`

## Recent Changes Made

1. ✅ Switched from BrowserRouter to HashRouter (for Cloudways compatibility - no nginx config needed)
2. ✅ Updated vite.config.ts base path from `/dashboard/` to `/dashboard-new/`
3. ❌ Deployment workflow is failing

## Files to Review

### Critical Files:

1. **`apps/dashboard/vite.config.ts`**
   - Current base: `/dashboard-new/`
   - This should match the deployment path

2. **`.github/workflows/deploy-dashboard-cloudways.yml`**
   - Deploys to: `public_html/dashboard-new/`
   - Uses SFTP to Cloudways
   - Check if deployment is actually completing

3. **`apps/dashboard/src/App.tsx`**
   - Uses HashRouter (not BrowserRouter)
   - Routes: `/`, `/dashboard`, `/templates`, `/compliance`, `/analytics`

4. **`apps/dashboard/dist/index.html`** (generated)
   - Should have: `src="/dashboard-new/assets/index-XXX.js"`
   - Currently may have: `src="/dashboard/assets/index-XXX.js"` (wrong)

### Deployment Configuration:

- **Cloudways Server:** 138.197.40.154
- **Application:** vhxvtajnbg
- **Deployment Path:** `public_html/dashboard-new/`
- **Build Output:** `apps/dashboard/dist/`

## Questions to Answer:

1. Is the GitHub Actions workflow actually deploying files?
2. Are the asset paths in index.html correct after build?
3. Are files being uploaded to the right location on Cloudways?
4. Is there a caching issue preventing new files from being served?

## Verification Commands:

```bash
# Check what's actually deployed
curl -s https://cdn.mosaicpolicy.com/dashboard-new/index.html | grep -E "src=|href="

# Check if assets exist on server
ssh master_wcqkvzhaqv@138.197.40.154 "ls -la ~/public_html/dashboard-new/assets/"

# Check GitHub Actions logs
gh run view [RUN_ID] --log
```

## Expected Fix:

Ensure that:

1. `vite.config.ts` has `base: '/dashboard-new/'`
2. Build generates index.html with correct paths
3. GitHub Actions successfully deploys all files
4. Files exist at correct paths on Cloudways server

## GitHub Repository:

- **Repo:** kmulroy1972/Mosaic-Health-Policy-Brand-Automation-Suite
- **Branch:** main
- **Workflow:** `.github/workflows/deploy-dashboard-cloudways.yml`

## Next Steps:

1. Review the failed workflow run logs
2. Verify the build output has correct asset paths
3. Check if deployment is completing (files uploaded to server)
4. Verify file paths match between build and deployment
5. Test after deployment completes

## Additional Context:

- Cloudways is managed hosting (no direct nginx access)
- Using HashRouter to avoid needing nginx config
- Previous attempts to fix nginx config failed (not available on Cloudways)
- Deployment should happen automatically via GitHub Actions on push to main
