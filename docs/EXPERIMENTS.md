# A/B Testing & Prompt Evaluation

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 41 Complete

## Experiment Framework

**Location:** `packages/backend-functions/src/experiments/reporter.ts`

### Metrics Tracked

- JSON validity rate
- Average latency
- User accept rate
- Total requests

### Endpoint

**GET** `/api/experiments/report?experimentName=brandGuidanceAgent`

Returns A/B test results comparing prompt variants.

## Methodology

1. Create experiment with variant A/B prompts
2. Assign traffic weights (e.g., 50/50)
3. Track metrics per variant
4. Analyze results and select winner
5. Gradual rollout of winning variant

## Rollout Policy

- Start with 10% traffic to new variant
- Monitor for 48 hours
- Increase to 50% if metrics acceptable
- Full rollout if stable
