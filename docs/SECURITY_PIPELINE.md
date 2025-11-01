# Security Pipeline

**Last Updated:** 2025-01-27  
**Status:** ✅ Phases 35-36 Complete

## SAST/DAST & Supply Chain Security

### CodeQL Analysis

- **Location:** `.github/workflows/security.yml`
- **Schedule:** Weekly + on PR
- **Languages:** TypeScript, JavaScript
- **Results:** Stored in GitHub Security tab

### Dependency Scanning

- **Dependabot:** Enabled for automatic updates
- **npm audit:** Runs in CI, fails on high/critical vulnerabilities
- **SBOM Generation:** SPDX and CycloneDX formats in `docs/SBOM/`

### Secret Scanning

- **Tool:** gitleaks
- **Trigger:** On push and PR
- **Action:** Blocks commits with detected secrets

## Security Gates

1. **Pre-commit:** gitleaks check
2. **CI:** CodeQL analysis must pass
3. **CI:** npm audit must pass (no high/critical)
4. **CI:** SBOM generation must succeed

## Exceptions

Document security exceptions in:

- `docs/SECURITY_EXCEPTIONS.md` (create if needed)
- Include: vulnerability ID, justification, remediation plan, expiration date

## Remediation

1. Review CodeQL findings in GitHub Security tab
2. Fix or dismiss with justification
3. Update dependencies: `pnpm update` or `pnpm audit fix`
4. Revoke any exposed secrets immediately
5. Regenerate SBOM after dependency updates
