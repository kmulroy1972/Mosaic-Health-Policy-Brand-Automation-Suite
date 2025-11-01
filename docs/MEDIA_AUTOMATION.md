# Video and Media Generation

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 58 Complete

## Media Assembly

**Location:** `packages/backend-functions/src/media/assembler.ts`

### Features

- Auto-generate short explainer videos from reports
- Integrate B-roll from Pexels API or Azure Video Indexer
- Combine script with visuals

## Endpoint

**POST** `/api/media/assemble`

### Request

```json
{
  "reportId": "report-123",
  "title": "Q4 Policy Impact Video",
  "script": "Video narration script...",
  "brollSources": ["pexels-123456", "pexels-789012"],
  "duration": 60
}
```

### Response

```json
{
  "videoId": "video-1234567890-abc123",
  "videoUrl": "https://storage.blob.core.windows.net/media/video-123.mp4",
  "thumbnailUrl": "https://storage.../thumbnail.jpg",
  "duration": 60,
  "generatedAt": "2025-01-27T12:00:00.000Z"
}
```

## Implementation Status

⚠️ **Azure Video Indexer / Pexels Integration Pending**

Current implementation:

- Media assembly structure
- Video generation workflow
- B-roll source integration points

**TODO:**

- Integrate Azure Video Indexer
- Add Pexels API for B-roll
- Implement video editing pipeline
- Add thumbnail generation
