# Automated Brand QA Checklist

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 65 Complete

## Brand QA Checks

**Location:** `packages/backend-functions/src/brand/qa.ts`

Generates QA checklist for each report checking:

- **Stage** - Brand stage elements present
- **Font** - Futura font usage
- **Color** - Mosaic color palette compliance
- **Layout** - Brand layout guidelines

## Endpoint

**GET** `/api/brand/qa?reportId=...&documentType=report`

### Response

```json
{
  "reportId": "report-123",
  "items": [
    {
      "category": "font",
      "item": "Uses Futura font",
      "status": "pass",
      "details": "Futura font detected"
    },
    {
      "category": "color",
      "item": "Primary color matches Mosaic Blue",
      "status": "pass"
    }
  ],
  "completionRate": 95,
  "overallStatus": "pass",
  "checkedAt": "2025-01-27T12:00:00.000Z"
}
```

## Scoring

- **90-100%:** Pass
- **70-89%:** Warning
- **<70%:** Fail

## Implementation Status

⚠️ **Brand Compliance Detection Pending**

Current implementation:

- QA checklist structure
- Category-based checks
- Completion rate calculation

**TODO:**

- Implement font detection (PDF/DOCX parsing)
- Add color extraction and validation
- Build layout compliance checker
- Integrate with report generation pipeline
