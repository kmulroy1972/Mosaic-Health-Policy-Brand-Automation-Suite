#!/bin/bash
echo "Installing Office Add-in development certificate..."
echo "You will be asked for your Mac password."
echo ""

sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ~/.office-addin-dev-certs/ca.crt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Certificate installed successfully!"
    echo ""
    echo "Now:"
    echo "1. Quit Word completely (Cmd+Q)"
    echo "2. Reopen Word Desktop"
    echo "3. Upload the add-in again"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check the error above."
fi


