#!/bin/bash
# Script to configure Cloudways SFTP secrets for GitHub Actions

echo "============================================"
echo "CLOUDWAYS SECRETS CONFIGURATION"
echo "============================================"
echo ""
echo "This script will configure GitHub Actions secrets for Cloudways deployment."
echo "You will need your Cloudways SFTP credentials."
echo ""
echo "Get credentials from:"
echo "  Cloudways Dashboard → Your Application → Access Details → SFTP/SSH Access"
echo ""
echo "============================================"
echo ""

# Prompt for credentials
read -p "Enter CLOUDWAYS SFTP HOST (hostname or IP): " SFTP_HOST
read -p "Enter CLOUDWAYS SFTP USERNAME: " SFTP_USER
read -sp "Enter CLOUDWAYS SFTP PASSWORD: " SFTP_PASS
echo ""
echo ""

# Validate inputs
if [ -z "$SFTP_HOST" ] || [ -z "$SFTP_USER" ] || [ -z "$SFTP_PASS" ]; then
    echo "❌ Error: All three credentials are required."
    exit 1
fi

echo "Setting GitHub secrets..."
echo ""

# Set secrets
gh secret set CLOUDWAYS_SFTP_HOST --body "$SFTP_HOST"
gh secret set CLOUDWAYS_SFTP_USER --body "$SFTP_USER"
gh secret set CLOUDWAYS_SFTP_PASS --body "$SFTP_PASS"

echo ""
echo "✅ Secrets configured!"
echo ""
echo "Verifying secrets..."
gh secret list | grep CLOUDWAYS

echo ""
echo "============================================"
echo "NEXT STEPS"
echo "============================================"
echo "1. Tag and push new release:"
echo "   git tag v0.2.4 -m 'Successful Cloudways configuration and secrets added'"
echo "   git push origin v0.2.4"
echo ""
echo "2. Monitor deployment:"
echo "   https://github.com/kmulroy1972/Mosaic-Health-Policy-Brand-Automation-Suite/actions"
echo ""
echo "3. After deployment completes, verify:"
echo "   curl -I https://cdn.mosaicpolicy.com/index.html"
echo "   curl -I https://cdn.mosaicpolicy.com/test.html"
echo ""
echo "============================================"

