# Data Visualization Service

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 53 Complete

## Chart Generation

**Location:** `packages/backend-functions/src/visuals/chartGenerator.ts`

### Supported Chart Types

- **bar** - Bar charts
- **line** - Line charts
- **pie** - Pie charts
- **area** - Area charts

## Endpoint

**POST** `/api/visuals/chart`

### Request

```json
{
  "type": "bar",
  "data": {
    "labels": ["Q1", "Q2", "Q3", "Q4"],
    "datasets": [
      {
        "label": "Policy Impact",
        "data": [10, 25, 30, 45],
        "backgroundColor": ["#1E3A8A", "#059669", "#DC2626", "#F59E0B"]
      }
    ]
  },
  "options": {
    "title": "Policy Impact Over Time",
    "width": 800,
    "height": 400
  },
  "format": "url"
}
```

### Response

```json
{
  "imageUrl": "https://quickchart.io/chart?c=...",
  "chartId": "chart-1234567890-abc123",
  "imageBase64": "base64string..." // if format=base64
}
```

## Integration

Charts can be:

- Embedded in Gamma slides
- Included in PDF reports
- Displayed in dashboard
- Used in HTML reports

## Implementation Status

⚠️ **QuickChart/Chart.js Integration Pending**

Current implementation:

- Chart configuration structure
- Multiple chart types
- URL and base64 output formats

**TODO:**

- Complete QuickChart API integration
- Add Chart.js server-side rendering option
- Implement image caching
- Add chart templates library
