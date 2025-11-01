# Speech / Audio Capabilities

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 93 Complete

## Azure Speech SDK Integration

**Location:** `packages/backend-functions/src/audio/generate.ts`

Integrates Azure Speech SDK for narration of brand briefs and transcription of audio content.

## Endpoints

### POST `/api/audio/generate`

Generate audio narration from text.

**Request:**

```json
{
  "text": "Brand brief content...",
  "voice": "en-US-JennyNeural",
  "language": "en-US",
  "outputFormat": "mp3"
}
```

**Response:**

```json
{
  "audioUrl": "https://storage.blob.core.windows.net/audio/123.mp3",
  "duration": 120,
  "voice": "en-US-JennyNeural",
  "generatedAt": "2025-01-27T12:00:00.000Z"
}
```

### POST `/api/audio/transcribe`

Transcribe audio to text.

**Request:** Binary audio data (multipart/form-data)

**Query Parameters:**

- `language` - Language code (default: en-US)

**Response:**

```json
{
  "transcription": "Transcribed text from audio...",
  "language": "en-US",
  "transcribedAt": "2025-01-27T12:00:00.000Z"
}
```

## Supported Voices

- **en-US-JennyNeural** - Female, English (US)
- **en-US-GuyNeural** - Male, English (US)
- Additional voices available via Azure Speech

## Use Cases

- Brand brief narration for accessibility
- Audio podcast summaries
- Meeting transcription
- Voice-enabled policy analysis

## Implementation Status

⚠️ **Azure Speech SDK Integration Pending**

Current implementation:

- Audio generation framework
- Transcription structure
- Voice selection support

**TODO:**

- Integrate Azure Speech SDK
- Configure voice options
- Implement audio caching
- Add batch transcription
- Build audio player UI
