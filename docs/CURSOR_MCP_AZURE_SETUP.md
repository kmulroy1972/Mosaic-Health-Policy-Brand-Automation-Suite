# Cursor MCP Azure Integration Setup Guide

This guide walks you through configuring Cursor's Model Context Protocol (MCP) to enable direct Azure CLI command execution from within Cursor.

## Prerequisites

✅ **Verified:** Azure CLI is installed and authenticated

- Subscription: "Azure subscription 1"
- Function App: `mhpbrandfunctions38e5971a`
- Resource Group: `mhp-brand-rg`
- User: `kmulroy@wscdc.com`

## Step 1: Configure MCP Server in Cursor

### Option A: Using Cursor Settings UI (Recommended)

1. Open Cursor
2. Navigate to: **Settings** → **Tools & MCP** → **Add New MCP Server**
3. Fill in the following details:
   - **Name**: `Azure CLI MCP Server`
   - **Command**: `npx`
   - **Arguments**: `-y @azure/mcp@latest server start`

### Option B: Manual Configuration (Alternative)

If you prefer to edit the configuration file directly:

1. Open Cursor Settings
2. Navigate to: **Settings** → **Tools & MCP**
3. Click on **Edit Configuration** or locate the `mcp.json` file
4. Add the following configuration:

```json
{
  "mcpServers": {
    "azure-cli": {
      "command": "npx",
      "args": ["-y", "@azure/mcp@latest", "server", "start"],
      "env": {
        "AZURE_SUBSCRIPTION_ID": "9490dc1e-7573-4ebe-8c1c-625f0db153d0",
        "AZURE_RESOURCE_GROUP": "mhp-brand-rg"
      }
    }
  }
}
```

**Note:** The `env` section is optional but can be helpful for setting default values.

## Step 2: Verify Azure CLI Authentication

Your Azure CLI is already authenticated. To verify, run in terminal:

```bash
az account show
```

You should see:

- Subscription: "Azure subscription 1"
- Subscription ID: `9490dc1e-7573-4ebe-8c1c-625f0db153d0`

## Step 3: Test MCP Connectivity

1. **Restart Cursor** after adding the MCP server configuration
2. Open Cursor's AI chat (press `Ctrl+L` or `Cmd+L` on Mac, or click the chat icon)
3. Test with a simple command:

```
Show me my current Azure account information using az account show
```

Or:

```
Run az account show to verify Azure connectivity
```

4. The AI should execute the Azure CLI command and display the output

## Step 4: Test Your Required Commands

Once connectivity is verified, test the commands you need:

### Test Function App Deployment Command

```
Get the deployment status for my function app mhpbrandfunctions38e5971a in resource group mhp-brand-rg
```

Or explicitly:

```
Run: az functionapp show --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg --query "{name:name, state:state, defaultHostName:defaultHostName}" --output json
```

### Test Log Tail Command

```
Show me the live logs for my function app mhpbrandfunctions38e5971a
```

This should execute:

```bash
az webapp log tail --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg
```

### Test Restart Command

```
Restart my function app mhpbrandfunctions38e5971a
```

This should execute:

```bash
az functionapp restart --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg
```

## Step 5: Common Usage Patterns

### Pattern 1: Direct Command Execution

You can ask the AI to run specific Azure CLI commands:

```
Deploy my function app: az functionapp deployment source config-zip --name mhpbrandfunctions38e5971a --resource-group mhp-brand-rg --src packages/backend-functions.zip
```

### Pattern 2: Natural Language Requests

You can also use natural language:

```
What's the status of my Azure Function App? The name is mhpbrandfunctions38e5971a and it's in resource group mhp-brand-rg.
```

```
Tail the logs for my function app and show me any errors from the last 5 minutes.
```

```
Restart my function app if it's currently running.
```

## Step 6: Troubleshooting

### Issue: MCP Server Not Connecting

**Solution 1:** Check that `@azure/mcp` package is accessible:

```bash
npx -y @azure/mcp@latest --version
```

**Solution 2:** Verify Node.js is installed:

```bash
node --version
# Should be v18+ or v20+
```

**Solution 3:** Check Cursor logs:

- On Mac: `~/Library/Logs/Cursor/`
- On Windows: `%APPDATA%\Cursor\logs\`
- Look for MCP-related errors

### Issue: Azure CLI Commands Not Executing

**Solution 1:** Verify Azure CLI is in PATH:

```bash
which az
# or on Windows
where az
```

**Solution 2:** Re-authenticate Azure CLI:

```bash
az login
az account set --subscription "Azure subscription 1"
```

**Solution 3:** Check Azure CLI version:

```bash
az --version
# Should be 2.40.0 or later
```

### Issue: Commands Work in Terminal But Not in Cursor

- Ensure the MCP server configuration was saved correctly
- Restart Cursor completely
- Check that the MCP server appears as "Connected" in Settings → Tools & MCP

## Step 7: Advanced Configuration

### Custom MCP Server Script (If Official Package Doesn't Meet Needs)

If you need a custom MCP server, you can create one:

1. Create a file: `.cursor/mcp-servers/azure-cli-proxy.js`

```javascript
#!/usr/bin/env node
import { spawn } from 'child_process';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', async (line) => {
  try {
    const request = JSON.parse(line);

    if (request.method === 'tools/call') {
      const { name, arguments: args } = request.params;

      if (name === 'execute_az_command') {
        const command = `az ${args.command}`;
        const [cmd, ...cmdArgs] = command.split(' ');

        const child = spawn(cmd, cmdArgs, {
          shell: true,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          const response = {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              exitCode: code,
              stdout: stdout,
              stderr: stderr
            }
          };
          console.log(JSON.stringify(response));
        });
      }
    }
  } catch (error) {
    const response = {
      jsonrpc: '2.0',
      id: request?.id || null,
      error: {
        code: -32700,
        message: error.message
      }
    };
    console.log(JSON.stringify(response));
  }
});
```

2. Then configure in Cursor:

```json
{
  "mcpServers": {
    "azure-cli-custom": {
      "command": "node",
      "args": [".cursor/mcp-servers/azure-cli-proxy.js"]
    }
  }
}
```

**Note:** The official `@azure/mcp` package is recommended over a custom script.

## Step 8: Verification Checklist

After setup, verify:

- [ ] MCP server appears in Settings → Tools & MCP as "Connected"
- [ ] Can run `az account show` through Cursor chat
- [ ] Can execute `az functionapp show` command
- [ ] Can tail logs with `az webapp log tail`
- [ ] Can restart function app with `az functionapp restart`
- [ ] Deployment commands work: `az functionapp deployment source config-zip`

## Your Specific Azure Resources

For quick reference, here are your resources:

- **Subscription Name:** Azure subscription 1
- **Subscription ID:** `9490dc1e-7573-4ebe-8c1c-625f0db153d0`
- **Function App:** `mhpbrandfunctions38e5971a`
- **Resource Group:** `mhp-brand-rg`
- **Resource Group Location:** `eastus`

## Next Steps

Once verified, you can:

1. Use natural language to manage Azure resources
2. Deploy functions directly from chat
3. Monitor logs in real-time
4. Troubleshoot issues without leaving Cursor

## Additional Resources

- [Azure MCP Server Documentation](https://learn.microsoft.com/en-us/azure/developer/azure-mcp-server/)
- [Cursor MCP Documentation](https://docs.cursor.com/context/model-context-protocol)
- [Azure CLI Reference](https://learn.microsoft.com/en-us/cli/azure/)

---

**Last Updated:** Based on current Azure CLI authentication status
**Status:** Ready for configuration
