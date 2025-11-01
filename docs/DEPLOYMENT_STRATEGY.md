# Blue/Green & Canary Deployment Strategy

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 33 Complete

## Deployment Slots

### Blue/Green Strategy

- **Production Slot:** Current live deployment
- **Staging Slot:** Pre-production validation

### Deployment Process

1. Deploy to staging slot
2. Run smoke tests
3. Swap slots on success
4. Rollback on failure (automatic if 5xx threshold exceeded)

## Feature Flags

Configured via Function App settings:

- `BRAND_AGENT_V2=true` - Enable canary version of brand guidance agent
- `COMPLIANCE_V2=false` - Toggle new compliance engine

## Canary Deployment

Gradual rollout:

- 10% traffic to new version (canary)
- Monitor metrics for 24 hours
- Increase to 50% if no issues
- Full rollout if stable

## Rollback Procedure

```bash
# Automatic rollback if error rate > 5%
# Manual rollback:
az functionapp deployment slot swap \
  --resource-group mhp-brand-rg \
  --name mhpbrandfunctions38e5971a \
  --slot staging \
  --target-slot production
```

## Pre-Swap Checklist

- [ ] Smoke tests pass
- [ ] Error rate < 1%
- [ ] Response time < P95 threshold
- [ ] No critical alerts
- [ ] Database migrations complete
