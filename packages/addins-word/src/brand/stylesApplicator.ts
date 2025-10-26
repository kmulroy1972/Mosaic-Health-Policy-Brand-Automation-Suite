import 'office-js';

import type { RequirementSet } from '../types';
import { logEvent } from '../utils/logging';

import { getAllowedStyles } from './styles';

export async function restrictParagraphStyles(
  context: Word.RequestContext,
  requirementSet: RequirementSet
) {
  const styleDefinition = getAllowedStyles(requirementSet);
  const paragraphs = context.document.body.paragraphs;
  paragraphs.load('items/style');
  await context.sync();

  const allowed = new Set(styleDefinition.paragraphs);
  const fallbackStyle = styleDefinition.paragraphs[0] ?? 'Normal';

  paragraphs.items.forEach((paragraph: Word.Paragraph) => {
    if (paragraph.style && !allowed.has(paragraph.style)) {
      paragraph.style = fallbackStyle;
    }
  });

  logEvent('brand_word_paragraph_styles_enforced', {
    requirementSet,
    allowedParagraphs: [...allowed],
    inspectedParagraphs: paragraphs.items.length
  });

  await context.sync();
}

export async function restrictCharacterStyles(
  context: Word.RequestContext,
  requirementSet: RequirementSet
) {
  const styleDefinition = getAllowedStyles(requirementSet);
  logEvent('brand_word_character_styles_logged', {
    requirementSet,
    allowedCharacters: styleDefinition.characters
  });
}
