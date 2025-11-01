# Azure CLI Quick Reference for Cursor MCP

## Your Azure Environment

- **Subscription:** Azure subscription 1 (`9490dc1e-7573-4ebe-8c1c-625f0db153d0`)
- **Function App:** `mhpbrandfunctions38e5971a`
- **Resource Group:** `mhp-brand-rg`
- **Location:** `eastus`

## Common Commands (Ready for Cursor Chat)

### Function App Status

```
Show me the status of my function app mhpbrandfunctions38e5971a
```

Or directly:

```
az functionapp show --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg --query "{name:name, state:state, hostNames:defaultHostName}" --output json
```

### Deployment

```
Deploy the zip file from packages/backend-functions.zip to my function app
```

Or directly:

```
az functionapp deployment source config-zip --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg --src packages/backend-functions.zip
```

### View Logs (Live Tail)

```
Show me the live logs for my function app
```

Or directly:

```
az webapp log tail --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg
```

### View Logs (Last N Lines)

```
Show me the last 100 lines of logs from my function app
```

Or directly:

```
az webapp log download --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg --log-file app-logs.zip
```

### Restart Function App

```
Restart my function app mhpbrandfunctions38e5971a
```

Or directly:

```
az functionapp restart --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg
```

### List Functions

```
List all functions in my function app
```

Or directly:

```
az functionapp function list --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg --output table
```

### Check Function App Settings

```
Show me the application settings for my function app
```

Or directly:

```
az functionapp config appsettings list --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg --output table
```

### View Application Insights

```
Show me the Application Insights connection for my function app
```

Or directly:

```
az functionapp show --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg --query "{appInsightsConnectionString:siteConfig.appSettings[?name=='APPINSIGHTS_INSTRUMENTATIONKEY']}" --output json
```

## Using in Cursor Chat

Once MCP is configured, you can use these in two ways:

1. **Natural Language:** Just describe what you want
   - "Show me the status of my Azure Function App"
   - "Deploy my latest code to Azure"
   - "What errors are in my function app logs?"

2. **Direct Commands:** Explicitly request Azure CLI commands
   - "Run az functionapp show --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg"
   - "Execute: az webapp log tail --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg"

## Environment Variables Available to MCP

The MCP server will have access to:

- Your existing Azure CLI authentication (via `az login`)
- Subscription context from your default subscription
- All Azure CLI commands and extensions you have installed
