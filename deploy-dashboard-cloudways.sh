#!/bin/bash
# Quick script to deploy dashboard to Cloudways manually

cd "$(dirname "$0")/apps/dashboard"

echo "Building dashboard..."
npm run build

if [ -z "$SFTP_HOST" ] || [ -z "$SFTP_USER" ] || [ -z "$SFTP_PASS" ]; then
  echo "Error: SFTP credentials not set"
  echo "Set SFTP_HOST, SFTP_USER, and SFTP_PASS environment variables"
  exit 1
fi

echo "Deploying to Cloudways..."
rsync -avz --delete \
  dist/ \
  $SFTP_USER@$SFTP_HOST:public_html/dashboard/

echo "✅ Dashboard deployed to Cloudways!"
echo "Access at: https://cdn.mosaicpolicy.com/dashboard/"
