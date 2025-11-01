# Cloudways Nginx Configuration for Dashboard

## Issue

Cloudways uses **nginx**, not Apache. `.htaccess` files are **NOT processed** by nginx.

Current problems:

- HTML files are cached (`cache-control: public, max-age=31536000`)
- Deep links return 404 (no SPA routing support)

## Solution

### Option 1: Cloudways Control Panel (Recommended)

1. Log into Cloudways Control Panel
2. Select your server
3. Go to **Application Settings** → **Nginx Configuration**
4. Add this configuration:

```nginx
location /dashboard-new/ {
    # SPA routing - serve index.html for all routes
    try_files $uri $uri/ /dashboard-new/index.html;

    # Prevent HTML caching
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires 0;
    }

    # Cache assets with long expiry
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

5. Save and restart nginx

### Option 2: Via SSH

1. SSH into Cloudways server
2. Edit nginx config: `/etc/nginx/sites-available/your-site.conf`
3. Add the location block above
4. Test: `nginx -t`
5. Reload: `sudo systemctl reload nginx`

## Verification

After applying configuration, test:

```bash
# Check HTML cache headers
curl -I https://cdn.mosaicpolicy.com/dashboard-new/index.html | grep cache-control
# Should show: cache-control: no-cache, no-store, must-revalidate

# Test deep links
curl -I https://cdn.mosaicpolicy.com/dashboard-new/analytics | grep HTTP
# Should show: HTTP/2 200
```

## Current Status

- **URL:** https://cdn.mosaicpolicy.com/dashboard-new/
- **Bundle:** index-BFMuss02.js
- **HTML Caching:** ❌ Still enabled (needs nginx config)
- **Deep Links:** ❌ 404 errors (needs nginx config)
