import 'office-js';

import { assessAltText } from '../brand/altText';
import { applyHeadersFooters } from '../brand/headersFooters';
import { detectRequirementSet } from '../brand/requirementSets';
import { restrictCharacterStyles, restrictParagraphStyles } from '../brand/stylesApplicator';
import type { ApplyBrandOptions, ApplyBrandResult } from '../types';
import { logError, logEvent } from '../utils/logging';

const TEMPLATE_XML =
  '<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:r><w:t>Preview header/footer</w:t></w:r></w:p>';

export async function previewBrand(options: ApplyBrandOptions = {}): Promise<ApplyBrandResult> {
  try {
    let issues: Awaited<ReturnType<typeof assessAltText>> | undefined;
    await Word.run(async (context) => {
      const requirementSet = detectRequirementSet();
      await restrictParagraphStyles(context, requirementSet);
      await restrictCharacterStyles(context, requirementSet);
      if (!options.skipHeaders) {
        await applyHeadersFooters(context, TEMPLATE_XML);
      }
      issues = await assessAltText(context);
      await context.sync();
    });

    logEvent('brand_preview_success');
    return { success: true, issues };
  } catch (error) {
    logError('brand_preview_failed', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Preview failed'
    };
  }
}
