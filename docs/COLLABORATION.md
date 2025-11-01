# Real-time Collaboration

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 69 Complete

## WebSocket API for Multi-User Editing

**Location:** `packages/backend-functions/src/collaboration/session.ts`

Enables real-time collaboration on reports and documents.

## Endpoint

**POST** `/api/collab/session`

### Request

```json
{
  "documentId": "report-123",
  "participants": ["user1", "user2"]
}
```

### Response

```json
{
  "sessionId": "session-1234567890-abc123",
  "documentId": "report-123",
  "participants": ["user1", "user2"],
  "createdAt": "2025-01-27T12:00:00.000Z",
  "websocketUrl": "wss://.../ws/session-123"
}
```

## Features

- Multi-user document editing
- Real-time synchronization
- Presence awareness
- Conflict resolution

## Implementation Status

⚠️ **Azure SignalR Integration Pending**

Current implementation:

- Session creation framework
- WebSocket URL structure
- Participant management

**TODO:**

- Integrate Azure SignalR Service
- Implement WebSocket handlers
- Add operational transform for conflict resolution
- Build collaboration UI
