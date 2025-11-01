# AI Narrative Composer

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 56 Complete

## Overview

AI-powered service that summarizes complex policy threads into polished narratives using trained prompt templates.

## Endpoint

**POST** `/api/narratives/compose`

### Request

```json
{
  "sourceText": "Meeting notes: Discussion about healthcare policy...",
  "style": "executive",
  "maxLength": 500
}
```

### Response

```json
{
  "summary": "Executive summary...",
  "keyMessages": [
    "Key message 1: Policy impact",
    "Key message 2: Stakeholder considerations",
    "Key message 3: Next steps"
  ],
  "narrative": "Full narrative text...",
  "generatedAt": "2025-01-27T12:00:00.000Z"
}
```

## Styles

- **executive** - Concise executive summary
- **technical** - Detailed technical analysis
- **public** - Accessible public-facing narrative

## Prompt Templates

Templates are trained for specific narrative styles and use cases:

- Meeting notes → Executive summary
- Legislation text → Key messages extraction
- Raw data → Polished narrative

## Implementation Status

⚠️ **Azure OpenAI Integration Pending**

Current implementation:

- Narrative style templates
- Structure and key messages extraction
- Prompt template framework

**TODO:**

- Complete Azure OpenAI integration
- Fine-tune prompts for better results
- Add more narrative styles
- Store prompt history for improvement
