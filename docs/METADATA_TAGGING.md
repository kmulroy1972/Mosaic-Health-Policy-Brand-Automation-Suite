# Auto-Tagging & Metadata Enrichment

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 60 Complete

## Tag Extraction

**Location:** `packages/backend-functions/src/tagging/extractor.ts`

Automatically extracts tags from documents, templates, and assets.

## Endpoint

**POST** `/api/tagging/extract`

### Request

```json
{
  "content": "Policy document content...",
  "contentType": "document",
  "existingTags": ["healthcare", "policy"]
}
```

### Response

```json
{
  "tags": ["healthcare", "policy", "compliance", "funding"],
  "confidence": 0.8,
  "categories": ["policy", "healthcare"],
  "extractedAt": "2025-01-27T12:00:00.000Z"
}
```

## Content Types

- **document** - Policy documents, briefs
- **template** - Report templates
- **asset** - Media assets, images

## Storage

Tags are stored in:

- Cosmos DB (metadata)
- Graph index (for search)
- Asset metadata

## Implementation Status

⚠️ **Azure Cognitive Services Integration Pending**

Current implementation:

- Basic keyword extraction
- Tag extraction structure
- Category classification

**TODO:**

- Integrate Azure Cognitive Services for NLP
- Use OpenAI for semantic tagging
- Improve confidence scoring
- Add tag suggestions
