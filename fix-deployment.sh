#!/bin/bash
# Quick Fix Script for Dashboard Deployment

set -e

echo "=== Dashboard Deployment Fix Script ==="
echo ""

cd "$(dirname "$0")/apps/dashboard"

echo "1. Rebuilding dashboard..."
npm run build

echo ""
echo "2. Verifying build..."
BUNDLE=$(cat dist/index.html | grep -o 'index-[^"]*\.js')
echo "   Bundle: $BUNDLE"
echo "   Size: $(ls -lh dist/assets/$BUNDLE | awk '{print $5}')"

echo ""
echo "3. Files ready for deployment:"
ls -la dist/ | grep -E "(index.html|staticwebapp|htaccess)"

echo ""
echo "✅ Build complete!"
echo ""
echo "📋 Next steps:"
echo "   - Cloudways: Files will auto-deploy via GitHub Actions"
echo "   - Azure SWA: Will auto-deploy via GitHub Actions"
echo "   - Cloudways nginx: Configure manually (see CLOUDWAYS_NGINX_SETUP.md)"
