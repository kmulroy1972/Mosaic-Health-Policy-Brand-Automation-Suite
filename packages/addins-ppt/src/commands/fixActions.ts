import 'office-js';

import type { DeckAuditResult, FixOptions, SlideFixResult } from '../types';
import { logError, logEvent } from '../utils/logging';
import { captureSnapshot, logSnapshotEvent } from '../utils/snapshots';
import { auditDeck } from '../validation/checker';

const SNAPSHOT_DECK_ID = 'active-deck';

export async function previewFixes(
  presentation: PowerPoint.Presentation
): Promise<DeckAuditResult> {
  try {
    const audit = await auditDeck(presentation);
    logEvent('ppt_fix_preview', { issues: audit.issues.length });
    return audit;
  } catch (error) {
    logError('ppt_fix_preview_failed', error);
    throw error;
  }
}

export async function applyFixes(
  presentation: PowerPoint.Presentation,
  options: FixOptions = {}
): Promise<SlideFixResult[]> {
  const results: SlideFixResult[] = [];
  try {
    const snapshot = captureSnapshot(SNAPSHOT_DECK_ID, '');
    logSnapshotEvent('ppt_snapshot_captured', snapshot ?? undefined);

    const audit = await auditDeck(presentation);
    audit.issues.forEach((issue) => {
      results.push({
        slideIndex: issue.slideIndex,
        issueId: issue.issueId,
        status: options.fixAll ? 'skipped' : 'skipped',
        message: 'Automatic fix not yet implemented.'
      });
    });

    logEvent('ppt_fix_completed', {
      totalIssues: audit.issues.length
    });
  } catch (error) {
    logError('ppt_fix_failed', error);
    results.push({
      slideIndex: -1,
      issueId: 'error',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  return results;
}
