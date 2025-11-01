# Subscription & Billing System v2

**Last Updated:** 2025-11-01  
**Status:** ✅ Phase 162 Complete

## Metered Usage API and Stripe Integration

**Location:** `packages/backend-functions/src/subscriptions/manager.ts`

Implements metered usage API and Stripe integration for subscription management.

## Endpoints

### POST `/api/subscriptions`

Create a new subscription.

**Request:**

```json
{
  "tenantId": "tenant-123",
  "tier": "professional",
  "paymentMethodId": "pm_xxx"
}
```

### DELETE `/api/subscriptions/{id}?immediate=true`

Cancel a subscription (immediate or end of period).

### GET `/api/subscriptions/{id}/invoice`

Generate invoice for subscription.

## Subscription Tiers

- **Starter** - $99/month - 10K API calls, 10GB storage
- **Professional** - $499/month - 100K API calls, 100GB storage
- **Enterprise** - $2,499/month - 1M API calls, 1TB storage

## Metered Usage

Tracks:

- API calls
- AI token consumption
- Storage usage
- Compute hours

---

**Status:** ✅ **BILLING V2 FRAMEWORK READY**
