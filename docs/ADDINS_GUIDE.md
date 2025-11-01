# Teams & Outlook Extensions

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 40 Complete

## Teams Message Extension

**Query:** `/api/brand/search` and return Adaptive Cards

### Invocation Flow

1. User types `@BrandAssistant` in Teams
2. Query sent to `/api/brand/search`
3. Results returned as Adaptive Cards
4. User can interact with cards

## Outlook Add-in

### Validation

- ✅ NAA (No Add-in Authentication) flow
- ✅ SSO flows pass validation

### Deep Links

- Brand check on email drafts
- Template insertion
- Compliance validation

## Implementation Status

⚠️ **Add-in Development Pending**

Architecture defined for:

- Teams message extension
- Outlook add-in deep links
- Invocation flows

**TODO:**

- Build Teams manifest
- Build Outlook manifest
- Implement SSO flows
- Deploy add-ins
