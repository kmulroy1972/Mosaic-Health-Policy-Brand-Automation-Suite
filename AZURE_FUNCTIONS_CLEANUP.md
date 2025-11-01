# Azure Functions - Clean Up Old Deployment

## Quick Answer: Just Deploy the New ZIP

**The new deployment will automatically overwrite the old one.** You don't need to delete anything first - just deploy `backend-functions.zip` and it will replace all files.

---

## Option 1: Just Overwrite (Simplest) ⭐ RECOMMENDED

Simply deploy the new ZIP - it will replace everything:

```bash
az webapp deploy \
  --resource-group mhp-brand-rg \
  --name mhpbrandfunctions38e5971a \
  --src-path backend-functions.zip \
  --type zip
```

This replaces all files in the function app with the new structure.

---

## Option 2: Clean Up Old Files First

If you want to explicitly remove the old files before deploying:

### Step 1: Connect to Kudu (SCM site)

```bash
# Get the SCM URL
az webapp show \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --query "{scmUrl: enabledHostNames[?contains(@, '.scm.')]}" \
  --output table
```

Or access directly:

- URL: `https://mhpbrandfunctions38e5971a.scm.azurewebsites.net`

### Step 2: Delete Old Files via Azure CLI (REST API)

```bash
# Get publishing credentials
PUBLISH_USER=$(az webapp deployment list-publishing-profiles \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --query "[?publishMethod=='MSDeploy'].userName" -o tsv)

PUBLISH_PASS=$(az webapp deployment list-publishing-profiles \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --query "[?publishMethod=='MSDeploy'].userPWD" -o tsv)

# Delete site/wwwroot contents via Kudu API
curl -X DELETE \
  -u "$PUBLISH_USER:$PUBLISH_PASS" \
  "https://mhpbrandfunctions38e5971a.scm.azurewebsites.net/api/vfs/site/wwwroot/?recursive=true"
```

### Step 3: Then Deploy New ZIP

```bash
az webapp deploy \
  --resource-group mhp-brand-rg \
  --name mhpbrandfunctions38e5971a \
  --src-path backend-functions.zip \
  --type zip
```

---

## Option 3: Use Kudu File Manager (Web UI)

1. Go to: `https://mhpbrandfunctions38e5971a.scm.azurewebsites.net/DebugConsole`
2. Navigate to `site/wwwroot`
3. Delete all files/folders
4. Then deploy new ZIP

---

## Option 4: Restart Function App (If functions aren't loading)

Sometimes functions don't reload after deployment. Restart to force reload:

```bash
az functionapp restart \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg
```

---

## Recommended Workflow

**Just do this:**

1. Upload `backend-functions.zip` to Cloud Shell
2. Deploy (this overwrites everything):
   ```bash
   az webapp deploy \
     --resource-group mhp-brand-rg \
     --name mhpbrandfunctions38e5971a \
     --src-path backend-functions.zip \
     --type zip
   ```
3. Wait 1-2 minutes
4. Restart function app (to force reload):
   ```bash
   az functionapp restart \
     --name mhpbrandfunctions38e5971a \
     --resource-group mhp-brand-rg
   ```
5. Test:
   ```bash
   curl https://api.mosaicpolicy.com/api/health
   ```

**That's it!** The new deployment replaces the old one completely.

---

## Why This Works

When you deploy a ZIP with `--type zip`, Azure Functions:

- Extracts the ZIP to `site/wwwroot`
- **Replaces all existing files** in that directory
- Keeps only what's in the new ZIP
- Reloads the functions runtime

So the old `backend.zip` files get completely overwritten by `backend-functions.zip`.

---

## Verification After Deployment

Check what's actually deployed:

```bash
# List deployed functions
az functionapp function list \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg

# Should show:
# - health
# - templates
# - rewrite
# - convertPdfA
# - validatePdf
```

Check files in deployment:

```bash
# View deployment status
az webapp deployment list \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --query "[0].{id:id,status:status,deployer:deployer,active:active}" \
  --output table
```

---

**Bottom Line:** Just deploy the new ZIP - it overwrites everything automatically! 🚀
