# Copilot Plugin / Search API Prep

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 39 Complete

## Plugin Architecture

### Callable Actions

Returns Adaptive Card payloads:

- `brand.check` - Check brand compliance
- `brand.rewrite` - AI-powered rewrite
- `pdf.validate` - Validate PDF
- `assets.search` - Search assets

### Plugin Manifest

**Location:** `manifests/copilot-plugin.json` (stub)

```json
{
  "schemaVersion": "1.0",
  "actions": [
    {
      "id": "brand.check",
      "description": "Check brand compliance",
      "parameters": {
        "documentText": "string"
      }
    }
  ]
}
```

## Implementation Status

⚠️ **Plugin Development Pending**

Foundation created for:

- Action schemas
- Adaptive Card integration
- Search API preparation

**TODO:**

- Complete plugin manifest
- Implement action handlers
- Register with Microsoft Copilot
- Test in Teams/Outlook
