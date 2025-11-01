# Predictive Funding Analysis

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 66 Complete

## Funding Opportunity Prediction

**Location:** `packages/backend-functions/src/funding/predictor.ts`

Predicts upcoming funding opportunities based on keywords using federal grant data.

## Endpoint

**POST** `/api/funding/predict`

### Request

```json
{
  "keywords": ["healthcare", "policy", "research"],
  "timeframe": "60d",
  "category": "healthcare"
}
```

### Response

```json
{
  "opportunities": [
    {
      "title": "Healthcare Policy Research Grant",
      "source": "Data.gov",
      "deadline": "2025-03-15T00:00:00.000Z",
      "amount": "$500,000",
      "matchScore": 95,
      "description": "Grant opportunity matching keywords",
      "url": "https://data.gov/grants/example"
    }
  ],
  "predictedCount": 1,
  "generatedAt": "2025-01-27T12:00:00.000Z"
}
```

## Implementation Status

⚠️ **Data.gov API Integration Pending**

Current implementation:

- Funding prediction structure
- Keyword matching framework
- Opportunity scoring

**TODO:**

- Integrate Data.gov API
- Add machine learning for better predictions
- Implement deadline alerts
- Link to client briefs
