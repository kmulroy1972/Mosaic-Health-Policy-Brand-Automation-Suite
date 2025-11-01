# Advanced Tagging and Semantic Classification

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 96 Complete

## Brand-Specific Taxonomy Manager

**Location:** `packages/backend-functions/src/tagging/semantic.ts`

Adds brand-specific taxonomy manager and semantic classification for documents.

## Taxonomy Categories

### Brand Taxonomy

- Brand compliance tags
- Brand guideline references
- Brand asset classifications

### Policy Taxonomy

- Policy type tags
- Policy theme tags
- Policy domain tags

### Compliance Taxonomy

- Compliance category tags
- Audit-related tags
- Regulatory tags

### General Taxonomy

- Document type tags
- Content category tags
- Format tags

## Endpoint

**POST** `/api/tagging/semantic`

### Request

```json
{
  "content": "Document content...",
  "contentType": "document",
  "existingTags": ["healthcare"]
}
```

### Response

```json
{
  "tags": [
    {
      "tag": "healthcare-policy",
      "category": "policy",
      "confidence": 0.92,
      "taxonomy": "policy"
    },
    {
      "tag": "brand-compliant",
      "category": "brand",
      "confidence": 0.88,
      "taxonomy": "brand"
    }
  ],
  "taxonomy": {
    "brand": ["brand-compliant"],
    "policy": ["healthcare-policy"],
    "compliance": ["compliance-reviewed"]
  },
  "classifiedAt": "2025-01-27T12:00:00.000Z"
}
```

## Semantic Classification

Uses AI to:

- Understand document meaning
- Extract key concepts
- Classify into taxonomy categories
- Assign confidence scores

## Implementation Status

⚠️ **Advanced Classification Pending**

Current implementation:

- Taxonomy structure
- Semantic tagging framework
- Confidence scoring

**TODO:**

- Train classification models
- Build taxonomy database
- Implement multi-level classification
- Add taxonomy management UI
- Create tag recommendations
