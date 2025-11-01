# Notifications Hub

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 64 Complete

## Centralized Notifications

**Location:** `packages/backend-functions/src/notifications/hub.ts`

Centralizes email/Teams alerts for:

- Deployments
- Report generation
- Compliance results
- System alerts

## Endpoint

**POST** `/api/notify/send`

### Request

```json
{
  "type": "both",
  "recipients": ["user@example.com"],
  "subject": "Report Generated",
  "message": "Your Q4 report is ready.",
  "priority": "medium",
  "category": "report"
}
```

### Response

```json
{
  "notificationId": "notif-1234567890-abc123",
  "sent": true,
  "channels": ["email", "teams"],
  "sentAt": "2025-01-27T12:00:00.000Z"
}
```

## Notification Types

- **email** - Email via Microsoft Graph API
- **teams** - Teams webhook notification
- **both** - Send to both channels

## Categories

- **deployment** - Deployment notifications
- **report** - Report generation alerts
- **compliance** - Compliance scan results
- **system** - System alerts

## Implementation Status

⚠️ **Microsoft Graph API Integration Pending**

Current implementation:

- Notification hub structure
- Multi-channel support
- Priority and categorization

**TODO:**

- Integrate Microsoft Graph API for email
- Complete Teams webhook integration
- Add notification templates
- Implement retry logic
