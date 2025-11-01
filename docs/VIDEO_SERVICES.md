# Video and Media Automation

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 94 Complete

## Azure Video Indexer Integration

**Location:** `packages/backend-functions/src/video/indexer.ts`

Integrates Azure Video Indexer API for transcripts, scene tags, and video metadata extraction.

## Endpoint

**POST** `/api/video/annotate`

### Request

```json
{
  "videoUrl": "https://storage.blob.core.windows.net/videos/example.mp4",
  "videoId": "video-123",
  "options": {
    "generateTranscript": true,
    "extractScenes": true,
    "detectFaces": true,
    "extractKeywords": true
  }
}
```

### Response

```json
{
  "videoId": "video-123",
  "transcript": "Video transcript text...",
  "scenes": [
    {
      "startTime": "00:00:00",
      "endTime": "00:01:30",
      "description": "Introduction scene"
    }
  ],
  "keywords": ["policy", "healthcare", "analysis"],
  "duration": 120,
  "processedAt": "2025-01-27T12:00:00.000Z"
}
```

## Features

### Transcript Generation

- Automatic speech-to-text transcription
- Multi-language support
- Timestamp alignment

### Scene Extraction

- Automatic scene detection
- Scene descriptions
- Start/end timestamps

### Face Detection

- Identify people in videos
- Track face appearances
- Generate face thumbnails

### Keyword Extraction

- Automatic keyword detection
- Topic modeling
- Content categorization

## Implementation Status

⚠️ **Azure Video Indexer API Integration Pending**

Current implementation:

- Video annotation framework
- Transcript and scene structures
- Metadata extraction framework

**TODO:**

- Integrate Azure Video Indexer API
- Implement async video processing
- Add video upload support
- Build video player with annotations
- Create video search index
