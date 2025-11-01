# Dashboard Deployment Issue - Full Diagnostic Report

**Generated:** $(date)
**Project:** Mosaic Health Policy Brand Automation Suite
**Component:** Dashboard Frontend (React + Vite)
**Target:** Cloudways Server at cdn.mosaicpolicy.com

---

## EXECUTIVE SUMMARY

The dashboard application builds successfully locally but fails to load correctly when deployed to Cloudways. Multiple deployment attempts have been made with persistent caching and file serving issues.

**Primary Symptom:** Browser loads old JavaScript file (`index-XdFvnuJM.js`) instead of new one (`index-D8asc60l.js`), resulting in 404 errors.

---

## TECHNICAL STACK

- **Frontend Framework:** React 18.3.1 + TypeScript
- **Build Tool:** Vite 5.4.21
- **Deployment Target:** Cloudways (SFTP via rsync)
- **Domain:** cdn.mosaicpolicy.com
- **Deployment Path:** /dashboard/ (also attempted /dashboard-new/)
- **Build Output:** `apps/dashboard/dist/`

---

## DEPLOYMENT PROCESS

**Current Workflow:** `.github/workflows/deploy-dashboard-cloudways.yml`

**Steps:**

1. Checkout code
2. Setup Node.js 20
3. Install npm dependencies
4. Build dashboard (`npm run build`)
5. Deploy via SFTP/rsync to `public_html/dashboard/` (or `dashboard-new/`)

**Build Output:**

- `dist/index.html` - Main HTML file
- `dist/assets/index-{hash}.js` - JavaScript bundle (currently `index-D8asc60l.js`)
- `dist/assets/index-{hash}.css` - CSS bundle (currently `index-Cr1e5IWR.css`)
- `dist/staticwebapp.config.json` - Azure config (not used on Cloudways)
- `dist/.htaccess` - Apache config for cache control

---

## CURRENT FILE STATES

### Local Build (`apps/dashboard/dist/`)

- **index.html** references: `/dashboard/assets/index-D8asc60l.js` ✅
- **JavaScript file exists:** `index-D8asc60l.js` (185,738 bytes) ✅
- **CSS file exists:** `index-Cr1e5IWR.css` (9,065 bytes) ✅

### Server State (cdn.mosaicpolicy.com/dashboard/)

- **index.html** on server references: `/dashboard/assets/index-D8asc60l.js` ✅
- **JavaScript file accessible:** YES (185,738 bytes, correct MIME type) ✅
- **Problem:** Browser still tries to load `index-XdFvnuJM.js` (old file) ❌

### Server State (cdn.mosaicpolicy.com/dashboard-new/)

- **Status:** Recently deployed (checking...)
- **Expected:** Fresh path with no cache history

---

## ROOT CAUSE ANALYSIS

### Issue #1: Browser Cache Persistence

**Symptom:** Even in Incognito mode, browser requests old JavaScript file
**Evidence:** Console shows 404 for `index-XdFvnuJM.js` which doesn't exist on server
**Likely Cause:**

- Browser cached the HTML file itself before deployment
- CDN/Cloudways intermediate caching layer
- Service worker (if any exists)

### Issue #2: HTML File Not Updating

**Symptom:** Server HTML shows correct file, but browser loads different version
**Possible Causes:**

- Cloudways CDN caching HTML files
- `.htaccess` not properly preventing HTML caching
- Browser cache persisting across refreshes

### Issue #3: Deployment Workflow Issues

**Symptom:** GitHub Actions shows "failure" but files appear deployed
**Cause:** Post-job cleanup warnings (non-critical, but marks job as failed)
**Impact:** Files ARE deployed despite "failure" status

---

## ATTEMPTS MADE

### Attempt 1: Fix API URL

- **Action:** Updated `App.tsx` to use `api.mosaicpolicy.com`
- **Result:** Partial - API URLs fixed, but HTML caching issue persists

### Attempt 2: Fix MIME Types

- **Action:** Created `staticwebapp.config.json` with explicit MIME types
- **Result:** MIME types correct, but not the root issue

### Attempt 3: Hard Refresh / Cache Busting

- **Action:** Added cache-busting query params, hard refresh instructions
- **Result:** No effect - browser still loads old HTML

### Attempt 4: Remove Old Files Before Deploy

- **Action:** Modified workflow to delete old files first
- **Result:** Files deployed, but browser cache still serves old version

### Attempt 5: .htaccess Cache Control

- **Action:** Added `.htaccess` to prevent HTML caching
- **Result:** Deployed but effectiveness unclear (Apache may not be processing)

### Attempt 6: New Deployment Path

- **Action:** Deploy to `/dashboard-new/` to bypass all cache
- **Result:** Just deployed, status unknown

---

## API ROUTE ISSUE (FIXED)

**Problem:** Functions had routes like `api/health` which became `/api/api/health`
**Solution:** Removed `api/` prefix from all routes in `app.ts`
**Status:** ✅ FIXED (deployment pending)

---

## CONFIGURATION FILES

### `apps/dashboard/vite.config.ts`

```typescript
base: '/dashboard-new/', // Currently set to new path
build: {
  outDir: 'dist',
  assetsDir: 'assets',
  rollupOptions: {
    output: {
      entryFileNames: 'assets/[name]-[hash].js',
      // Forces new hash on each build
    }
  }
}
```

### `apps/dashboard/.htaccess` (deployed to dist/)

```apache
<FilesMatch "\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
</FilesMatch>
```

### `apps/dashboard/src/App.tsx`

```typescript
const API_BASE =
  (import.meta.env as { VITE_API_URL?: string }).VITE_API_URL || 'https://api.mosaicpolicy.com'; // ✅ Correct
```

---

## SERVER VERIFICATION

**Cloudways Server:**

- Domain: cdn.mosaicpolicy.com
- Deployment Method: SFTP/rsync
- Target Directory: `public_html/dashboard/` (or `dashboard-new/`)
- Web Server: Apache/Nginx (unknown which)

**Files Confirmed on Server:**

- ✅ index.html exists
- ✅ index-D8asc60l.js exists (185KB)
- ✅ index-Cr1e5IWR.css exists (9KB)

---

## RECOMMENDED SOLUTIONS

### Option 1: Verify Cloudways Configuration

- Check if Cloudways has CDN/caching enabled
- Verify `.htaccess` is being processed by Apache
- Check Apache/Nginx configuration for cache headers

### Option 2: Manual Verification

- SSH into Cloudways server
- Verify files in `public_html/dashboard/`
- Check file permissions
- Verify Apache error logs

### Option 3: Different Deployment Method

- Use Cloudways Git deployment
- Use Cloudways Application deployment
- Bypass GitHub Actions, deploy directly

### Option 4: Service Worker Check

- Check if service worker exists and is caching
- Unregister any existing service workers
- Clear all browser data for domain

### Option 5: Complete Reset

- Delete entire `/dashboard/` directory
- Deploy fresh build
- Use different subdomain (dashboard.mosaicpolicy.com)

---

## CRITICAL INFORMATION FOR NEXT AGENT

1. **Local build works perfectly** - the issue is deployment/caching
2. **Server has correct files** - verified via curl
3. **Browser loads wrong file** - cache/CDN issue
4. **GitHub Actions deploys successfully** (despite showing "failure")
5. **API routes were fixed** but Functions haven't redeployed yet

**Key Files:**

- `apps/dashboard/vite.config.ts` - Build configuration
- `apps/dashboard/src/App.tsx` - Main React component
- `.github/workflows/deploy-dashboard-cloudways.yml` - Deployment workflow
- `apps/dashboard/.htaccess` - Cache control

**Cloudways Credentials:**

- Host: `${{ secrets.CLOUDWAYS_SFTP_HOST }}`
- User: `${{ secrets.CLOUDWAYS_SFTP_USER }}`
- Pass: `${{ secrets.CLOUDWAYS_SFTP_PASS }}`

---

## NEXT STEPS

1. **Verify `/dashboard-new/` deployment** - Check if new path works
2. **If still fails:** SSH into Cloudways and inspect directly
3. **Check Cloudways panel** for CDN/cache settings
4. **Test with different browser/device** to rule out browser-specific cache
5. **Check browser DevTools Network tab** - Verify what's actually being requested

---

**END OF REPORT**

## CRITICAL DISCOVERY

/dashboard-new/ shows:

- ✅ Cache-Control headers present (no-cache, no-store)
- ✅ Fresh deployment (last-modified: 2025-11-01 16:56:20)
- ✅ Different from /dashboard/ which has Age: 1747 (29 minutes old)

This suggests /dashboard-new/ MAY be working correctly.
Check: https://cdn.mosaicpolicy.com/dashboard-new/
