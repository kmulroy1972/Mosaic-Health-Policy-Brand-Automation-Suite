# Azure Functions Deployment - Fixed Structure

**Package:** backend-functions.zip (9.69 MB)  
**Location:** `/Users/kylemulroy/mosaic-design/packages/backend-functions/backend-functions.zip`  
**Status:** Ready for deployment  
**Date:** October 29, 2025

---

## What Was Fixed

### PROBLEM: Original deployment missing Azure Functions configuration

- ❌ No `host.json` in root
- ❌ No `app.js` entry point
- ❌ Functions not registered with Azure Functions runtime
- ❌ Result: Functions not visible, endpoints return 404

### SOLUTION: Properly structured deployment package

- ✅ `host.json` with runtime configuration
- ✅ `app.js` as main entry point (registered all HTTP triggers)
- ✅ `package.json` with resolved dependencies
- ✅ All compiled JavaScript in dist/
- ✅ Production node_modules included (9.69 MB total)

---

## Package Contents

```
backend-functions.zip/
├── host.json                    (Azure Functions runtime config)
├── package.json                 (dependencies resolved)
├── app.js                       (main entry - registers all functions)
├── index.js                     (exports)
├── health/
│   ├── httpTrigger.js          (health check handler)
│   └── types.js
├── templates/
│   ├── httpTrigger.js          (templates handler)
│   └── types.js
├── ai/
│   ├── httpTrigger.js          (AI rewrite handler)
│   ├── client.js
│   └── prompt.js
├── pdf/
│   ├── convertA.js             (PDF conversion handler)
│   ├── validate.js             (PDF validation handler)
│   └── services/
├── graph/
│   ├── client.js
│   └── templates.js
└── node_modules/                (all production dependencies)
    ├── @azure/functions
    ├── @azure/identity
    └── ... (all dependencies)
```

---

## Registered HTTP Endpoints

The `app.js` file registers these endpoints:

| Route               | Method | Function               | Auth Level |
| ------------------- | ------ | ---------------------- | ---------- |
| `/api/health`       | GET    | healthHttpTrigger      | anonymous  |
| `/api/templates`    | GET    | templatesHttpTrigger   | anonymous  |
| `/api/rewrite`      | POST   | rewriteHttpTrigger     | anonymous  |
| `/api/pdf/convert`  | POST   | convertPdfAHttpTrigger | anonymous  |
| `/api/pdf/validate` | POST   | validatePdfHttpTrigger | anonymous  |

---

## Deployment Instructions

### Option 1: Azure CLI (Recommended)

```bash
az webapp deployment source config-zip \
  --src /Users/kylemulroy/mosaic-design/packages/backend-functions/backend-functions.zip \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg
```

**Expected Output:**

```json
{
  "active": true,
  "author": "az_cli_functions",
  "complete": true,
  "deployer": "ZipDeploy",
  "id": "<deployment-id>",
  "status": 4,
  "status_text": ""
}
```

### Option 2: Azure Cloud Shell

1. Upload `backend-functions.zip` to Cloud Shell
2. Run deployment command:

```bash
az webapp deployment source config-zip \
  --src backend-functions.zip \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg
```

### Option 3: Azure Portal (Upload)

1. Go to Azure Portal
2. Navigate to Function App: mhpbrandfunctions38e5971a
3. Go to "Deployment Center"
4. Select "ZIP Deploy"
5. Upload: backend-functions.zip
6. Click "Deploy"

---

## Post-Deployment Verification

### Step 1: Wait for Deployment (1-2 minutes)

The function app needs time to:

- Extract ZIP
- Initialize functions
- Warm up runtime

### Step 2: Check Functions Loaded

```bash
az functionapp function list \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg
```

**Expected:** Should list 5 functions (health, templates, rewrite, convertPdfA, validatePdf)

### Step 3: Test Health Endpoint

**Test with custom domain:**

```bash
curl https://api.mosaicpolicy.com/api/health
```

**Test with default domain:**

```bash
curl https://mhpbrandfunctions38e5971a.azurewebsites.net/api/health
```

**Expected Response:**

```json
{
  "status": "healthy",
  "version": "0.0.1",
  "timestamp": "2025-10-29T19:15:00.000Z",
  "checks": {
    "aiClient": "unconfigured",
    "graphClient": "unconfigured",
    "storage": "unconfigured"
  }
}
```

**Note:** Status may be "degraded" if environment variables not set (that's OK for now)

### Step 4: Check Logs

```bash
az webapp log tail \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg
```

Look for:

- "Worker process started and initialized"
- "Functions loaded: 5"
- HTTP trigger registrations

---

## Troubleshooting

### Issue: Functions Still Not Visible

**Solution 1: Restart Function App**

```bash
az functionapp restart \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg
```

**Solution 2: Check Deployment Logs**

```bash
az webapp log deployment show \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg
```

**Solution 3: Verify Runtime Version**

```bash
az functionapp config show \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --query "{nodeVersion:nodeVersion,functionsVersion:functionsExtensionVersion}"
```

Expected: Node.js 20, Functions v4

### Issue: 404 on Health Endpoint

**Check 1: Verify deployment completed**

```bash
az webapp deployment list \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --query "[0].{status:status,deployer:deployer,active:active}"
```

**Check 2: Verify function exists**

```bash
az functionapp function show \
  --name health \
  --function-app-name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg
```

**Check 3: Test with function key** (if auth required)

```bash
# Get function key
az functionapp function keys list \
  --name health \
  --function-app-name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg

# Test with key
curl "https://api.mosaicpolicy.com/api/health?code=<function-key>"
```

### Issue: CORS Errors from Frontend

**Solution: Verify CORS configured**

```bash
az functionapp cors show \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg
```

**Expected:** Should include https://cdn.mosaicpolicy.com

**If not configured:**

```bash
az functionapp cors add \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --allowed-origins https://cdn.mosaicpolicy.com
```

---

## Environment Variables (Optional)

To make all health checks show "ok" instead of "unconfigured":

```bash
# Azure OpenAI
az functionapp config appsettings set \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --settings \
    OPENAI_ENDPOINT="https://your-instance.openai.azure.com" \
    OPENAI_DEPLOYMENT="gpt-4" \
    OPENAI_API_KEY="your-key"

# Microsoft Graph
az functionapp config appsettings set \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --settings \
    GRAPH_ACCESS_TOKEN="your-token" \
    # OR \
    AZURE_TENANT_ID="your-tenant-id" \
    AZURE_CLIENT_ID="your-client-id" \
    AZURE_CLIENT_SECRET="your-client-secret"

# Azure Storage
az functionapp config appsettings set \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg \
  --settings \
    AZURE_STORAGE_CONNECTION_STRING="your-connection-string"
```

---

## Success Criteria

✅ **Deployment Successful When:**

1. `az functionapp function list` shows 5 functions
2. `curl https://api.mosaicpolicy.com/api/health` returns JSON (not 404)
3. Response includes `{"status":"healthy"}` or `{"status":"degraded"}`
4. Functions visible in Azure Portal → Functions tab
5. No errors in application logs

---

## Next Steps After Successful Deployment

### 1. Test Frontend Integration

Open: https://cdn.mosaicpolicy.com/index.html

Expected in taskpane:

- Header shows: "✅ Backend: HEALTHY" (or "DEGRADED")
- Overview tab displays API version and timestamp
- No CORS errors in browser console

### 2. Test All Endpoints

**Health Check:**

```bash
curl https://api.mosaicpolicy.com/api/health
```

**Templates:**

```bash
curl https://api.mosaicpolicy.com/api/templates
```

**AI Rewrite** (POST):

```bash
curl -X POST https://api.mosaicpolicy.com/api/rewrite \
  -H "Content-Type: application/json" \
  -d '{"text":"test text","goal":["concise"]}'
```

### 3. Update Frontend Status

Once API responds correctly:

- Reload taskpane in Word
- Verify "Backend Status" shows green checkmark
- Verify version number displays
- Verify timestamp updates

---

## Deployment Package Details

**File:** backend-functions.zip  
**Size:** 9.69 MB  
**Files:** ~2,500+ files (including node_modules)  
**Compressed:** Yes (ZIP compression)

**Key Files Verified in Package:**

- ✅ host.json (Azure Functions v2.0 config)
- ✅ app.js (main entry point with 5 HTTP triggers)
- ✅ package.json (production dependencies)
- ✅ health/httpTrigger.js (health check implementation)
- ✅ node_modules/@azure/functions (v4.8.0)
- ✅ node_modules/@azure/identity (v4.3.0)

---

## Comparison: Before vs After

### BEFORE (Broken Structure)

```
backend.zip/
├── ai/httpTrigger.js
├── health/httpTrigger.js
├── index.js
└── (no host.json, no app.js, no package.json, no node_modules)
```

**Result:** Functions not registered, 404 errors

### AFTER (Correct Structure)

```
backend-functions.zip/
├── host.json                 ✅ Runtime config
├── app.js                    ✅ Registers HTTP triggers
├── package.json              ✅ Dependencies defined
├── health/httpTrigger.js     ✅ Handler code
├── templates/httpTrigger.js  ✅ Handler code
├── ai/httpTrigger.js         ✅ Handler code
├── pdf/convertA.js           ✅ Handler code
├── pdf/validate.js           ✅ Handler code
└── node_modules/             ✅ All dependencies
```

**Result:** Functions registered and accessible

---

## DEPLOY NOW

Run this command to deploy the fixed package:

```bash
az webapp deployment source config-zip \
  --src /Users/kylemulroy/mosaic-design/packages/backend-functions/backend-functions.zip \
  --name mhpbrandfunctions38e5971a \
  --resource-group mhp-brand-rg
```

Then wait 1-2 minutes and test:

```bash
curl https://api.mosaicpolicy.com/api/health
```

**Expected:** JSON response with health status (not 404 error page)

---

**Package Created:** October 29, 2025  
**Ready for Deployment:** YES  
**Next Action:** Deploy ZIP to Azure
