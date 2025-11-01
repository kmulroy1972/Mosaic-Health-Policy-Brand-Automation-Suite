# Privacy & Data Retention Policies

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 27 Complete

## Data Retention

**Scheduled Function:** Retention purge job (configure TTL in Cosmos DB or run manual purge)

**Policies:**

- **Audit Logs:** 90 days (configurable)
- **Templates:** No expiration
- **User Preferences:** Until user deletion

## GDPR/CCPA Compliance

### Data Export

**GET** `/api/privacy/export?userId=...`

Exports all user data:

- User preferences
- Audit logs
- Template metadata

### Data Deletion

**DELETE** `/api/privacy/delete?userId=...`

Permanently deletes all user data (GDPR "right to be forgotten").

## Implementation Status

⚠️ **Cosmos DB Integration Pending**

Current implementation provides endpoint structure. Full implementation requires:

- Cosmos DB query for user data export
- Cosmos DB delete operations for data deletion
- Audit logging of privacy operations
- Confirmation workflows for deletion
