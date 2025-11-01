# Blue/Green Deployment & Swap Runbook

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 49 Complete

## Pre-Swap Checklist

- [ ] All smoke tests pass
- [ ] Error rate < 1%
- [ ] Response time P95 < threshold
- [ ] No critical Application Insights alerts
- [ ] Database migrations complete (if applicable)
- [ ] Feature flags verified
- [ ] Stakeholder approval (if production)

## Deployment Steps

1. **Deploy to Staging Slot**

   ```bash
   func azure functionapp publish mhpbrandfunctions38e5971a --slot staging
   ```

2. **Run Smoke Tests**

   ```bash
   pnpm test:smoke
   ```

3. **Verify Health**

   ```bash
   curl https://mhpbrandfunctions38e5971a-staging.azurewebsites.net/api/system/status
   ```

4. **Swap Slots**

   ```bash
   az functionapp deployment slot swap \
     --resource-group mhp-brand-rg \
     --name mhpbrandfunctions38e5971a \
     --slot staging \
     --target-slot production
   ```

5. **Post-Swap Verification**
   - Check production health endpoint
   - Monitor Application Insights for errors
   - Verify feature flags active

## Automatic Rollback

If error rate > 5% in first 5 minutes:

- Automatic rollback via monitoring alert
- Manual rollback: Repeat swap command (reverses slots)

## Post-Deployment

- Monitor for 1 hour
- Review Application Insights metrics
- Update deployment log
