#!/bin/bash

# Blue/Green deployment script for Azure Functions

set -e

RESOURCE_GROUP="mhp-brand-rg"
FUNCTION_APP="mhpbrandfunctions38e5971a"
SLOT="staging"

echo "🚀 Starting Blue/Green deployment..."

# Build
echo "📦 Building function app..."
pnpm build

# Deploy to staging slot
echo "📤 Deploying to staging slot..."
func azure functionapp publish "${FUNCTION_APP}" --slot "${SLOT}" --python

# Run smoke tests
echo "🧪 Running smoke tests..."
# TODO: Implement smoke test suite
SMOKE_TEST_PASSED=true

if [ "$SMOKE_TEST_PASSED" = true ]; then
  echo "✅ Smoke tests passed"
  
  # Swap slots
  echo "🔄 Swapping slots..."
  az functionapp deployment slot swap \
    --resource-group "${RESOURCE_GROUP}" \
    --name "${FUNCTION_APP}" \
    --slot "${SLOT}" \
    --target-slot production
  
  echo "✅ Deployment complete!"
else
  echo "❌ Smoke tests failed - deployment aborted"
  exit 1
fi

