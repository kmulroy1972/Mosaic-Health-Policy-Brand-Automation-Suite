# Hallucination Guardrails & Red Team Suite

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 42 Complete

## Schema Validation

**Location:** `packages/backend-functions/src/guardrails/schemaValidator.ts`

All LLM responses validated against strict JSON schemas:

- BrandGuidanceAgent response schema
- Fallback rules if validation fails
- Fail-closed policy

## Red Team Testing

**Endpoint:** `POST /api/redteam/run`

### Test Cases

1. **Prompt Injection** - Attempt to override instructions
2. **Jailbreak Attempt** - Attempt to remove constraints
3. **Invalid JSON** - Malformed requests
4. **Adversarial Examples** - Edge cases and boundary conditions

### Fail-Closed Policy

If schema validation fails:

- Return error response
- Log incident
- Do not return potentially invalid data

## Incident Response

1. Log all validation failures
2. Alert security team if critical
3. Review and update schemas
4. Retest with updated validation
