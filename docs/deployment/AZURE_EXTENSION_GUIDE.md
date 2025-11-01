# Azure Extension Setup for Cursor (macOS)

## Overview

Cursor is built on VS Code and supports VS Code extensions, including Azure extensions. However, on macOS with Apple Silicon, some extensions may have limitations. Here's how to set them up and use them.

---

## Step 1: Install Azure Extensions

### Method 1: Via Cursor's Extension Marketplace (Recommended)

1. **Open Extensions Panel:**
   - Press `Cmd+Shift+X` (or `View` → `Extensions`)
2. **Search for Azure Extensions:**

   **Essential Extensions:**
   - **Azure Account** (`ms-vscode.azure-account`) - Authentication and account management
   - **Azure Functions** (`ms-azuretools.vscode-azurefunctions`) - Functions development and deployment
   - **Azure App Service** (`ms-azuretools.vscode-azureappservice`) - Web app management
   - **Azure Resources** (`ms-azuretools.vscode-azureresourcegroups`) - Resource management

3. **Install:**
   - Click "Install" on each extension you need
   - Cursor will prompt you to restart if needed

### Method 2: Via Command Line

```bash
# Install Azure Account extension
cursor --install-extension ms-vscode.azure-account

# Install Azure Functions extension
cursor --install-extension ms-azuretools.vscode-azurefunctions

# Install Azure App Service extension
cursor --install-extension ms-azuretools.vscode-azureappservice
```

---

## Step 2: Sign In to Azure

### Via Extension UI:

1. **Open Azure Panel:**
   - Press `Cmd+Shift+P` (Command Palette)
   - Type: `Azure: Sign In`
   - Press Enter

2. **Browser Authentication:**
   - A browser window will open
   - Sign in with your Azure account
   - Authorize Cursor to access Azure resources

### Verify Sign-In:

- Look for your Azure account in the bottom-left status bar
- Or open the Azure panel: Click the Azure icon in the sidebar (looks like a cloud/Azure logo)

---

## Step 3: Using Azure Functions Extension

### Deploy Functions Directly from Cursor:

1. **Open Your Functions Folder:**
   - Navigate to `packages/backend-functions` in Cursor

2. **Deploy via Command Palette:**
   - Press `Cmd+Shift+P`
   - Type: `Azure Functions: Deploy to Function App`
   - Select your function app: `mhpbrandfunctions38e5971a`

3. **Or Right-Click:**
   - Right-click on `packages/backend-functions` folder
   - Select "Deploy to Function App..."
   - Choose your subscription and function app

### Create New Function:

1. Press `Cmd+Shift+P`
2. Type: `Azure Functions: Create Function`
3. Follow the wizard to create a new HTTP trigger

---

## Step 4: Using Azure App Service Extension

### Deploy Static Web App:

1. **Open Azure Panel** (sidebar Azure icon)
2. **Expand Your Subscription:**
   - Find: `mhp-brand-rg` resource group
   - Expand: `Static Web Apps`
   - Right-click: `mosaic-brand-console2`
   - Select: "Deploy to Static Web App..."

### View Logs:

1. Right-click your Function App in Azure panel
2. Select "Start Streaming Logs"
3. View real-time logs in the Output panel

### Browse Function App:

1. Right-click Function App
2. Select "Browse Website"
3. Opens in browser (though for Functions, use the API URL)

---

## Step 5: Alternative: Azure CLI (Recommended for macOS Silicon)

If the extensions don't work on Apple Silicon, use Azure CLI instead:

### Install Azure CLI:

```bash
# Using Homebrew (recommended)
brew install azure-cli

# Or download from: https://docs.microsoft.com/cli/azure/install-azure-cli-macos
```

### Sign In:

```bash
az login
```

### Deploy Functions:

```bash
cd /Users/kylemulroy/mosaic-design

# Package your functions (if needed)
# Then deploy:
az functionapp deployment source config-zip \
  --resource-group mhp-brand-rg \
  --name mhpbrandfunctions38e5971a \
  --src backend-functions.zip
```

### Deploy Static Web App:

```bash
# Your Static Web App deploys automatically via GitHub Actions
# But you can also deploy manually:
cd apps/dev-host/public
az staticwebapp deploy \
  --name mosaic-brand-console2 \
  --resource-group mhp-brand-rg \
  --source-location . \
  --app-location .
```

---

## Troubleshooting: macOS Apple Silicon Issues

### Issue: Extensions Don't Load

**Solution:** Some Azure extensions may not support ARM64 yet. Use Azure CLI instead.

### Issue: "Extension Not Available"

**Solution:**

1. Update Cursor to the latest version
2. Try installing extensions individually
3. Check VS Code Marketplace compatibility

### Issue: Authentication Fails

**Solution:**

1. Clear cached credentials:
   ```bash
   rm -rf ~/.azure
   ```
2. Sign in via CLI first:
   ```bash
   az login
   ```
3. Then try extension sign-in again

### Issue: Functions Extension Can't Find Node.js

**Solution:**

1. Install Node.js 20:
   ```bash
   brew install node@20
   ```
2. Verify in Cursor:
   - Press `Cmd+Shift+P`
   - Type: `Node: Select Runtime Version`
   - Choose Node.js 20

---

## Recommended Workflow: Hybrid Approach

Since you're on macOS Silicon, use a **hybrid approach**:

### Use Extensions For:

- ✅ **Viewing Azure resources** (visual resource explorer)
- ✅ **Streaming logs** (real-time log viewing)
- ✅ **Browsing resources** (quick navigation)

### Use Azure CLI For:

- ✅ **Deployments** (more reliable on macOS Silicon)
- ✅ **Creating resources** (full CLI support)
- ✅ **Automation** (scripts and CI/CD)

---

## Quick Reference Commands

### Azure CLI (Most Reliable on macOS):

```bash
# Sign in
az login

# List subscriptions
az account list --output table

# Set subscription
az account set --subscription "Your Subscription Name"

# Deploy Functions
az functionapp deployment source config-zip \
  --resource-group mhp-brand-rg \
  --name mhpbrandfunctions38e5971a \
  --src backend-functions.zip

# Restart Function App
az functionapp restart \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg

# View Function App logs
az functionapp log tail \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg

# List Functions
az functionapp function list \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg

# Deploy Static Web App
cd apps/dev-host/public
az staticwebapp deploy \
  --name mosaic-brand-console2 \
  --resource-group mhp-brand-rg \
  --source-location . \
  --app-location .

# View Static Web App URL
az staticwebapp show \
  --name mosaic-brand-console2 \
  --resource-group mhp-brand-rg \
  --query "defaultHostname" \
  --output tsv
```

---

## What You Can Do Now

### ✅ Using Extensions (If They Work):

1. Browse Azure resources visually
2. View logs in real-time
3. Deploy functions via UI
4. Monitor app service status

### ✅ Using Azure CLI (Recommended):

1. Deploy functions: `az functionapp deployment source config-zip`
2. View logs: `az functionapp log tail`
3. Restart apps: `az functionapp restart`
4. Manage resources: `az resource list`

---

## Next Steps

1. **Install Azure CLI** (if not installed):

   ```bash
   brew install azure-cli
   az login
   ```

2. **Try Extensions:**
   - Install Azure Account extension
   - Sign in
   - See if you can browse resources

3. **If Extensions Don't Work:**
   - Use Azure CLI (works perfectly on macOS Silicon)
   - You can still manage everything via CLI

---

## Your Current Deployment Method

Based on your project, you're already using:

✅ **GitHub Actions** for automated deployments  
✅ **Azure CLI** in Cloud Shell for manual deployments  
✅ **Azure Portal** for configuration

The extensions are **optional** - they provide a visual interface, but **Azure CLI is more reliable on macOS Silicon**.

---

## Summary

**Best Approach for macOS Silicon:**

1. ✅ **Install Azure CLI** (`brew install azure-cli`)
2. ✅ **Try Azure extensions** (if they work, great!)
3. ✅ **Use CLI as primary** (more reliable)
4. ✅ **Use extensions for viewing** (visual resource browser)

**Your deployment workflow doesn't need to change** - you can continue using GitHub Actions and Azure CLI commands. The extensions are just a convenience for visual management.
