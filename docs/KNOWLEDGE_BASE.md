# Knowledge Base & FAQ API

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 79 Complete

## FAQ Generation and Search

**Location:** `packages/backend-functions/src/knowledgebase/`

Generate Q&A pairs from `docs/` and expose FAQs to Client Portal via `/api/faq/search`.

## Endpoint

**POST** `/api/faq/search`

### Request

```json
{
  "question": "How do I generate a report?",
  "context": "reporting"
}
```

### Response

```json
{
  "results": [
    {
      "question": "How do I generate a report?",
      "answer": "Use the /api/reports/generate endpoint...",
      "confidence": 0.92,
      "sources": ["docs/REPORT_AUTOMATION.md"]
    }
  ],
  "count": 1
}
```

## FAQ Generation

- Scan `docs/` directory for Q&A patterns
- Extract question-answer pairs
- Index using semantic search
- Update on documentation changes

## Client Portal Integration

FAQs exposed to Client Portal for self-service support.

## Implementation Status

⚠️ **FAQ Generation from Docs Pending**

Current status:

- FAQ search endpoint
- Semantic search integration
- Source citation framework

**TODO:**

- Implement FAQ extraction from docs
- Build Q&A pair generator
- Index FAQs in search
- Integrate with Client Portal
- Add feedback mechanism
