# Cloudways Nginx Configuration - Alternative Solution

## Problem

Cloudways is a **managed hosting platform** that doesn't allow direct editing of nginx configuration files. This means we cannot add custom location blocks for SPA routing.

## Solution Implemented: Hash Router ✅

Instead of using `BrowserRouter` (which requires server-side routing configuration), I've switched the dashboard to use **HashRouter**, which works without any server configuration.

### What Changed:

- ✅ Changed from `BrowserRouter` to `HashRouter` in `App.tsx`
- ✅ Updated dashboard links to use hash-based URLs
- ✅ No server configuration needed - works immediately

### URL Changes:

- **Before:** `https://cdn.mosaicpolicy.com/dashboard-new/analytics` (required nginx config)
- **After:** `https://cdn.mosaicpolicy.com/dashboard-new/#/analytics` (works without config)

### Benefits:

- ✅ Works immediately on Cloudways (no server config needed)
- ✅ No HTML caching issues (hash routes are handled client-side)
- ✅ Compatible with all hosting providers
- ✅ No need to contact Cloudways support

### Trade-offs:

- URLs have a `#` in them (e.g., `/#/analytics` instead of `/analytics`)
- This is a minor cosmetic difference, functionality is identical

## Alternative Solutions (If Hash Router Doesn't Work)

### Option 1: Contact Cloudways Support

**Request:** "Please add this nginx location block to application vhxvtajnbg for SPA routing support"

Provide them this configuration:

```nginx
location /dashboard-new/ {
    try_files $uri $uri/ /dashboard-new/index.html;
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### Option 2: Use Azure Static Web Apps

The dashboard is already deployed to Azure Static Web Apps at:

- `https://white-smoke-0061d650f3.azurestaticapps.net/dashboard/`
- This has full SPA routing support via `staticwebapp.config.json`

### Option 3: Deploy to Different Path

Use a path that doesn't require SPA routing, or deploy the dashboard as a single-page app with hash routing.

## Current Status

✅ **Hash Router Implementation:** Complete and ready to deploy
✅ **Build:** Ready
✅ **Compatibility:** Works on Cloudways without server config

## Next Steps

1. **Deploy the updated build:**

   ```bash
   cd apps/dashboard
   npm run build
   # GitHub Actions will auto-deploy to Cloudways
   ```

2. **Test the hash-based routing:**
   - Visit: `https://cdn.mosaicpolicy.com/dashboard-new/#/`
   - Test routes: `/#/analytics`, `/#/templates`, `/#/compliance`

3. **If you prefer clean URLs:**
   - Contact Cloudways support to add the nginx configuration
   - Or use Azure Static Web Apps deployment

## Hash Router vs Browser Router

| Feature              | Hash Router  | Browser Router      |
| -------------------- | ------------ | ------------------- |
| Server Config Needed | ❌ No        | ✅ Yes              |
| URL Format           | `/#/route`   | `/route`            |
| Cloudways Compatible | ✅ Yes       | ❌ Requires support |
| Functionality        | ✅ Identical | ✅ Identical        |

**Recommendation:** Hash Router is the best immediate solution for Cloudways.
