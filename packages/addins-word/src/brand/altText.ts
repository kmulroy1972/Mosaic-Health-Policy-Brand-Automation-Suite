import 'office-js';

import type { AltTextAssessmentResult } from '../types';
import { logEvent } from '../utils/logging';

export async function assessAltText(
  context: Word.RequestContext
): Promise<AltTextAssessmentResult> {
  const body = context.document.body;
  const inlinePictures = body.inlinePictures;
  inlinePictures.load('items/altTextDescription');
  const floatingShapes = body.shapes;
  floatingShapes.load('items/altTextDescription,items/id');
  await context.sync();

  const missing: AltTextAssessmentResult['missing'] = [];
  const fixed: AltTextAssessmentResult['fixed'] = [];

  inlinePictures.items.forEach((item: Word.InlinePicture, index) => {
    const hasAlt = item.altTextDescription && item.altTextDescription.trim().length > 0;
    if (!hasAlt) {
      missing.push({
        id: `inline-${index}`,
        description: 'Image is missing alt text.',
        target: item
      });
    }
  });

  floatingShapes.items.forEach((item: Word.Shape, index) => {
    const hasAlt = item.altTextDescription && item.altTextDescription.trim().length > 0;
    if (!hasAlt) {
      missing.push({
        id: `shape-${typeof item.id === 'number' ? item.id : index}`,
        description: 'Shape is missing alt text.',
        target: item
      });
    }
  });

  logEvent('brand_word_alt_text_assessed', {
    missing: missing.length
  });

  return { missing, fixed };
}
