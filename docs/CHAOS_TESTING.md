# Chaos & Resilience Testing

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 45 Complete

## Chaos Toggles

**Location:** `packages/backend-functions/src/chaos/toggles.ts`

### Configurable Failures

- `CHAOS_FAIL_AI=true` - Fail AI calls
- `CHAOS_SLOW_GRAPH=true` - Add 5s delay to Graph API
- `CHAOS_THROTTLE_STORAGE=true` - Add 2s delay to storage

### Usage

Enable chaos toggles in staging slot only:

- Test system degradation gracefully
- Verify circuit breakers activate
- Confirm retry queues handle failures
- Validate error messages

## Test Scenarios

1. **AI Failure** - Verify fallback behavior
2. **Slow Graph API** - Confirm timeout handling
3. **Storage Throttling** - Test retry mechanisms

## Findings

Document in:

- `docs/CHAOS_FINDINGS.md` (create as needed)
- Include: issue, impact, remediation

## Remediation

Update resilience patterns based on chaos test results:

- Adjust circuit breaker thresholds
- Tune retry delays
- Add fallback mechanisms
