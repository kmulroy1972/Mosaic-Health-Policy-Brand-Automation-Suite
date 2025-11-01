# Audio & Speech Integration

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 57 Complete

## Azure Speech Services

**Location:** `packages/backend-functions/src/audio/speech.ts`

### Features

- **Text-to-Speech** - Convert policy briefs to audio podcast summaries
- **Speech-to-Text** - Transcribe audio meetings and calls

## Endpoint

**POST** `/api/audio/summary`

### Request

```json
{
  "text": "Policy brief content...",
  "voice": "en-US-JennyNeural",
  "language": "en-US",
  "outputFormat": "mp3"
}
```

### Response

```json
{
  "audioUrl": "https://storage.blob.core.windows.net/audio/summary-123.mp3",
  "audioBase64": "base64string...",
  "duration": 120,
  "generatedAt": "2025-01-27T12:00:00.000Z"
}
```

## Use Cases

- Convert policy briefs to podcast-style audio summaries
- Transcribe stakeholder meetings
- Generate accessible audio versions of reports
- Voice-enabled policy analysis

## Implementation Status

⚠️ **Azure Speech SDK Integration Pending**

Current implementation:

- Text-to-Speech structure
- Speech-to-Text structure
- Audio storage URLs

**TODO:**

- Integrate Azure Speech SDK
- Configure voice options
- Implement audio caching
- Add transcription accuracy metrics
