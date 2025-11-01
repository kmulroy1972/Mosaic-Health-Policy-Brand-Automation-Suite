# AI Code Assistant (Internal)

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 75 Complete (Framework Ready)

## Internal AI Assistant for Engineering Questions

**Location:** `packages/backend-functions/src/assistant/`

Train local OpenAI fine-tuned model on repository docs to answer engineering questions.

## Endpoint

**POST** `/api/assistant/query`

### Request

```json
{
  "query": "How do I add a new endpoint?",
  "context": "backend-functions"
}
```

### Response

```json
{
  "answer": "To add a new endpoint, create an HTTP trigger in src/...",
  "sources": ["docs/API_DOCUMENTATION.md", "src/app.ts"],
  "confidence": 0.92
}
```

## Training Data

- Repository documentation (`docs/`)
- Code comments and README files
- API specifications
- Architecture diagrams

## Implementation Status

⚠️ **OpenAI Fine-Tuning Pending**

Current status:

- Assistant framework defined
- Query processing structure
- Source citation framework

**TODO:**

- Collect training data from repo
- Fine-tune OpenAI model
- Implement query handler
- Add source citations
- Build RAG pipeline
