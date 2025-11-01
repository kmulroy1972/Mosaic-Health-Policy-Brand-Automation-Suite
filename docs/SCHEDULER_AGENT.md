# Intelligent Scheduling Agent

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 59 Complete

## Outlook Graph API Integration

**Location:** `packages/backend-functions/src/scheduler/agent.ts`

Automatically books report review meetings using Outlook calendar.

## Endpoint

**POST** `/api/schedule/report`

### Request

```json
{
  "reportId": "report-123",
  "participants": ["user1@example.com", "user2@example.com"],
  "preferredTime": "2025-01-28T14:00:00Z",
  "duration": 30,
  "subject": "Q4 Policy Impact Report Review"
}
```

### Response

```json
{
  "meetingId": "meeting-1234567890-abc123",
  "meetingUrl": "https://teams.microsoft.com/l/meetup-join/...",
  "scheduledTime": "2025-01-28T14:00:00Z",
  "calendarEventId": "event-123"
}
```

## Features

- Auto-schedule report reviews
- Find available meeting times
- Send calendar invites
- Create Teams meeting links

## Implementation Status

⚠️ **Microsoft Graph API Integration Pending**

Current implementation:

- Scheduling agent structure
- Meeting creation workflow
- Participant management

**TODO:**

- Integrate Microsoft Graph Calendar API
- Implement availability checking
- Add conflict resolution
- Send Outlook calendar invites
