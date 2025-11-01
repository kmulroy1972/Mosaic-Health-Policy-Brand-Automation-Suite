#!/bin/bash
# deploy_mosaic.sh - Automated deployment script for Mosaic Brand Automation Functions
# Deploys backend-functions.zip to Azure Function App

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUNCTIONS_DIR="${SCRIPT_DIR}/packages/backend-functions"
ZIP_FILE="${SCRIPT_DIR}/packages/backend-functions.zip"
RESOURCE_GROUP="mhp-brand-rg"
FUNCTION_APP="mhpbrandfunctions38e5971a"

echo "=========================================="
echo "Mosaic Functions Deployment Script"
echo "=========================================="
echo ""

# Step 1: Build TypeScript
echo "[1/4] Building TypeScript project..."
cd "${FUNCTIONS_DIR}"
if command -v pnpm &> /dev/null; then
  pnpm exec tsc -b
else
  npm run build || npx tsc -b
fi

if [ ! -d "dist" ]; then
  echo "❌ Build failed: dist/ directory not found"
  exit 1
fi
echo "✅ Build completed"

# Step 2: Create deployment zip
echo ""
echo "[2/4] Creating deployment package..."
cd "${SCRIPT_DIR}"

# Remove old zip if it exists
if [ -f "${ZIP_FILE}" ]; then
  rm "${ZIP_FILE}"
  echo "   Removed existing zip file"
fi

# Create zip excluding unnecessary files
cd "${FUNCTIONS_DIR}"
zip -r "${ZIP_FILE}" . \
  -x "*.ts" \
  -x "*.tsbuildinfo" \
  -x "*.test.*" \
  -x "__tests__/*" \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "*.log" \
  -x ".vscode/*" \
  -x ".funcignore" \
  -q

if [ ! -f "${ZIP_FILE}" ]; then
  echo "❌ Zip creation failed"
  exit 1
fi

ZIP_SIZE=$(du -h "${ZIP_FILE}" | cut -f1)
echo "✅ Package created: ${ZIP_FILE} (${ZIP_SIZE})"

# Step 3: Deploy to Azure
echo ""
echo "[3/4] Deploying to Azure Function App..."
echo "   Resource Group: ${RESOURCE_GROUP}"
echo "   Function App: ${FUNCTION_APP}"

az functionapp deployment source config-zip \
  --resource-group "${RESOURCE_GROUP}" \
  --name "${FUNCTION_APP}" \
  --src "${ZIP_FILE}"

if [ $? -ne 0 ]; then
  echo "❌ Deployment failed"
  exit 1
fi

echo "✅ Deployment completed"

# Step 4: Restart function app
echo ""
echo "[4/4] Restarting Function App..."
az functionapp restart \
  --name "${FUNCTION_APP}" \
  --resource-group "${RESOURCE_GROUP}"

if [ $? -ne 0 ]; then
  echo "⚠️  Restart command failed (may still be processing deployment)"
else
  echo "✅ Function App restarted"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Pipeline Complete"
echo "=========================================="
echo ""
echo "Function App URL: https://${FUNCTION_APP}.azurewebsites.net"
echo ""
echo "Test endpoints:"
echo "  Health:    curl https://${FUNCTION_APP}.azurewebsites.net/api/health"
echo ""
echo "Deployment completed at: $(date '+%Y-%m-%d %H:%M:%S')"

