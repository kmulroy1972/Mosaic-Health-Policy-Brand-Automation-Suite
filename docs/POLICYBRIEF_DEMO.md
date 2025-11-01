# Policy Brief Generator Demo

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 25 Complete

## Endpoint

**POST** `/api/policybrief`

**Authentication:** Required

**Request:**

```json
{
  "topic": "Healthcare Data Privacy",
  "dataPoints": [
    "HIPAA compliance requirements",
    "Patient data protection",
    "Encryption standards"
  ],
  "language": "en"
}
```

**Response:**

```json
{
  "executiveSummary": "...",
  "keyPoints": ["...", "..."],
  "recommendations": ["...", "..."],
  "generatedAt": "2025-01-27T12:00:00.000Z"
}
```

## Status

⚠️ **Azure OpenAI Integration Pending**

Currently returns structured placeholder. Full implementation requires:

- Azure OpenAI integration for content generation
- Brand tone guidelines application
- DOCX/PDF export generation
- Template integration
