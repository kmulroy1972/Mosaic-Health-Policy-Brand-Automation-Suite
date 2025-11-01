# Gamma Integration for Presentation Automation

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 51 Complete

## Overview

Integration with Gamma API for automatic document-to-presentation deck conversion.

## Endpoint

**POST** `/api/gamma/export`

**Authentication:** Required

### Request

```json
{
  "content": "# Executive Summary\n\nKey findings from Q4 2024...",
  "title": "Q4 2024 Policy Report",
  "theme": {
    "colors": {
      "primary": "#1E3A8A",
      "secondary": "#059669",
      "accent": "#DC2626",
      "background": "#FFFFFF",
      "text": "#1F2937"
    },
    "font": "Futura",
    "palette": ["#1E3A8A", "#059669", "#DC2626"]
  }
}
```

### Response

```json
{
  "deckId": "deck-1234567890-abc123",
  "publicUrl": "https://gamma.app/deck/deck-1234567890-abc123",
  "createdAt": "2025-01-27T12:00:00.000Z"
}
```

## Default Brand Theme

- **Primary Color:** #1E3A8A (Mosaic Blue)
- **Secondary Color:** #059669 (Mosaic Green)
- **Accent Color:** #DC2626 (Mosaic Red)
- **Font:** Futura
- **Palette:** Mosaic brand colors

## Configuration

Set environment variables:

- `GAMMA_API_KEY` - Your Gamma API key
- `GAMMA_API_URL` - Gamma API endpoint (default: https://api.gamma.app/api/v1)

## Example Usage

```bash
curl -X POST https://mhpbrandfunctions38e5971a.azurewebsites.net/api/gamma/export \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# Policy Impact Report\n\nSummary...",
    "title": "Policy Impact Analysis"
  }'
```

## Implementation Status

⚠️ **Gamma API Integration Pending**

Current implementation:

- Endpoint structure
- Theme configuration
- Brand metadata support

**TODO:**

- Complete Gamma API authentication
- Implement actual API calls
- Handle deck creation and updates
- Store deck metadata in Cosmos DB
