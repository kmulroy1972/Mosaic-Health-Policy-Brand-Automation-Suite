# Cursor MCP Azure Setup - Quick Checklist

## ✅ Prerequisites (Already Verified)

- [x] Azure CLI installed
- [x] Azure CLI authenticated (`az login` done)
- [x] Subscription: "Azure subscription 1" (`9490dc1e-7573-4ebe-8c1c-625f0db153d0`)
- [x] Node.js installed (v23.10.0)
- [x] `@azure/mcp` package accessible

## 🚀 Setup Steps (5 Minutes)

### Step 1: Configure MCP Server in Cursor

1. Open Cursor
2. Go to: **Settings** → **Tools & MCP** → **Add New MCP Server**
3. Enter:
   - **Name:** `Azure CLI MCP Server`
   - **Command:** `npx`
   - **Arguments:** `-y @azure/mcp@latest server start`
4. Click **Save** or **Add**

### Step 2: Restart Cursor

- Completely quit and restart Cursor (important for MCP servers to initialize)

### Step 3: Verify Connection

1. Open Cursor's AI chat (Ctrl+L / Cmd+L)
2. Type: `Show me my current Azure account information`
3. You should see your subscription details

### Step 4: Test Your Required Commands

Test each of these in Cursor chat:

**Test 1 - Function App Status:**

```
Show me the status of my function app mhpbrandfunctions38e5971a in resource group mhp-brand-rg
```

**Test 2 - Log Tail:**

```
Show me the live logs for my function app mhpbrandfunctions38e5971a
```

**Test 3 - Restart:**

```
Restart my function app mhpbrandfunctions38e5971a
```

**Test 4 - Deployment:**

```
Run: az functionapp deployment source config-zip --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg --src packages/backend-functions.zip
```

## 🔍 Troubleshooting

### If MCP Server Shows as "Disconnected"

1. Check Node.js is in PATH: `node --version` (should work)
2. Try manually: `npx -y @azure/mcp@latest --version` (should show version)
3. Check Cursor logs for errors
4. Verify the configuration was saved correctly

### If Commands Don't Execute

1. Verify Azure CLI: `az account show` (should work in terminal)
2. Check if MCP server is showing as "Connected" in Settings
3. Try restarting Cursor again
4. Check that you're using the correct resource names

## 📝 Configuration Reference

**Exact Configuration for Cursor Settings:**

```
Name: Azure CLI MCP Server
Command: npx
Arguments: -y @azure/mcp@latest server start
```

**Or as JSON (if editing config file directly):**

```json
{
  "mcpServers": {
    "azure-cli": {
      "command": "npx",
      "args": ["-y", "@azure/mcp@latest", "server", "start"]
    }
  }
}
```

## ✨ Once Working

You can use natural language requests like:

- "Deploy my latest code to Azure"
- "Show me errors in my function app logs"
- "What's the status of my Azure resources?"
- "Restart my function app if it's running"

## 📚 Additional Resources

- Full setup guide: `docs/CURSOR_MCP_AZURE_SETUP.md`
- Quick command reference: `docs/AZURE_CLI_QUICK_REFERENCE.md`

---

**Ready to proceed?** Start with Step 1 above!
