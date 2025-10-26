import 'office-js';

import type { DeckAuditResult, SlideIssue } from '../types';
import { logEvent } from '../utils/logging';

const MIN_CONTRAST_RATIO = 4.5;

function evaluateContrast(slide: PowerPoint.Slide): SlideIssue[] {
  // Placeholder; PowerPoint JavaScript API lacks direct contrast analysis currently.
  return [
    {
      slideIndex: slide.index,
      issueId: 'contrast-check-not-available',
      message: 'Automatic contrast evaluation requires desktop audit.',
      severity: 'info'
    }
  ];
}

export async function auditDeck(presentation: PowerPoint.Presentation): Promise<DeckAuditResult> {
  const slides = presentation.slides;
  slides.load('items/index');
  await presentation.context.sync();

  const issues: SlideIssue[] = [];
  slides.items.forEach((slide) => {
    issues.push(...evaluateContrast(slide));
  });

  logEvent('ppt_audit_completed', {
    totalSlides: slides.items.length,
    totalIssues: issues.length,
    minContrast: MIN_CONTRAST_RATIO
  });

  return { issues };
}
