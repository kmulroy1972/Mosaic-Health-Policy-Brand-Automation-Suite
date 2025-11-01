# Mosaic Report Generator (HTML→Gamma)

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 52 Complete

## Report Generator

**Location:** `packages/backend-functions/src/reports/generator.ts`

### Supported Sections

- **Overview** - Executive summary
- **Policy Impact** - Policy analysis and impact assessment
- **Data Visuals** - Charts and data visualizations
- **Compliance** - Compliance metrics and scores

## Endpoint

**POST** `/api/reports/generate`

### Request

```json
{
  "title": "Q4 2024 Policy Impact Report",
  "sections": [
    {
      "type": "overview",
      "title": "Executive Summary",
      "content": "Key findings and recommendations..."
    },
    {
      "type": "policyImpact",
      "title": "Policy Impact Analysis",
      "content": "Detailed analysis..."
    }
  ],
  "clientId": "client-123",
  "exportToGamma": true
}
```

### Response

```json
{
  "reportId": "report-1234567890-abc123",
  "html": "<!DOCTYPE html>...",
  "gammaDeckUrl": "https://gamma.app/deck/...",
  "createdAt": "2025-01-27T12:00:00.000Z"
}
```

## Integration

- Auto-generates HTML executive reports
- Optional Gamma deck export
- Stores report metadata in Cosmos DB
- Links Gamma deck URL to client record

## Features

- Brand-consistent styling (Futura font, Mosaic colors)
- Section-based structure
- Automated Gamma deck generation
- Client record linking
