#!/bin/bash
# Cloudways Nginx Configuration Deployment Helper
# This script helps configure nginx for the dashboard

echo "=== Cloudways Nginx Configuration ==="
echo ""
echo "Option 1: Apply via Cloudways Control Panel (Recommended)"
echo "1. Log into Cloudways"
echo "2. Go to: Server → Application Settings → Nginx Configuration"
echo "3. Add this location block:"
echo ""
cat apps/dashboard/nginx.conf
echo ""
echo "Option 2: SSH into server and apply manually"
echo "1. SSH: ssh user@your-server"
echo "2. Edit: sudo nano /etc/nginx/sites-available/your-site.conf"
echo "3. Add the location block above"
echo "4. Test: sudo nginx -t"
echo "5. Reload: sudo systemctl reload nginx"
