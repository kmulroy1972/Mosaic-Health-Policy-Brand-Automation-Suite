# Continuous Localization Workflow

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 77 Complete (Pipeline Ready)

## Nightly Translation Sync

**Location:** `packages/backend-functions/src/localization/syncJob.ts`

Automated nightly translation sync for new content with missing string reporting.

## Process

1. **Scan for New Content**
   - Check new documents, reports, templates
   - Identify untranslated strings

2. **Generate Translations**
   - Use Azure Translator
   - Post-edit with OpenAI
   - Store in translation cache

3. **Report Missing Strings**
   - Generate report of missing translations
   - Alert localization team
   - Track completion rates

## Scheduled Job

**Timer:** Daily at 2:00 AM UTC

Runs automated translation sync and generates missing string reports.

## Implementation Status

⚠️ **Azure Translator Integration Pending**

Current status:

- Pipeline structure defined
- Sync job framework
- Missing string detection

**TODO:**

- Implement content scanner
- Add translation generation
- Build missing string reporter
- Schedule nightly job
- Create localization dashboard
