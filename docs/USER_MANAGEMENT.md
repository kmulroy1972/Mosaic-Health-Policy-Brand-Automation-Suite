# User Management Service

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 19 Complete

## Endpoints

### List Users

**GET** `/api/users/list`

**Authentication:** Required

Returns list of users (requires Entra ID integration).

### Add User

**POST** `/api/users/add`

**Authentication:** Required

**Body:**

```json
{
  "userId": "user@example.com",
  "email": "user@example.com"
}
```

Adds user to Entra ID group (requires Entra ID integration).

## Integration Status

⚠️ **Pending Entra ID Integration**

Current implementation:

- Authentication middleware validates tokens
- User preferences stored in Cosmos DB
- User list/add endpoints created (require Entra ID Graph API integration)

**TODO:**

- Integrate with Microsoft Graph API for user management
- Add Entra ID group membership management
- Implement user role assignment
- Add user deletion endpoint

## User Preferences

User preferences are stored in Cosmos DB (`userPreferences` container):

- Language preference
- Theme preference
- Default template
- Brand guidance mode
- Notification settings
- Accessibility preferences
