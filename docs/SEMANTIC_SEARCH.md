# Advanced Search and Semantic Index

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 70 Complete

## Semantic Search Service

**Location:** `packages/backend-functions/src/search/semantic.ts`

Uses Azure Cognitive Search + OpenAI embeddings for semantic search across documents.

## Endpoint

**POST** `/api/search/query`

### Request

```json
{
  "query": "healthcare policy impact analysis",
  "filters": {
    "contentType": ["document", "report"],
    "dateRange": {
      "start": "2025-01-01",
      "end": "2025-01-27"
    }
  },
  "limit": 20
}
```

### Response

```json
{
  "results": [
    {
      "id": "result-1",
      "title": "Policy Document",
      "content": "Relevant content...",
      "relevanceScore": 0.95,
      "contentType": "document",
      "metadata": {}
    }
  ],
  "totalCount": 1,
  "queryTime": 50,
  "searchedAt": "2025-01-27T12:00:00.000Z"
}
```

## Implementation Status

⚠️ **Azure Cognitive Search + OpenAI Integration Pending**

Current implementation:

- Semantic search structure
- Filter support
- Relevance scoring framework

**TODO:**

- Integrate Azure Cognitive Search
- Implement OpenAI embeddings
- Build vector index
- Add advanced filtering
