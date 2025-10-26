import 'office-js';

import { createTelemetryEnvelope } from '@mhp/shared-brand-core';

import { assessAltText } from '../brand/altText';
import { applyHeadersFooters } from '../brand/headersFooters';
import { buildManifest, writeBrandManifest } from '../brand/manifest';
import { lockBrandAnchors } from '../brand/protection';
import { detectRequirementSet } from '../brand/requirementSets';
import { restrictCharacterStyles, restrictParagraphStyles } from '../brand/stylesApplicator';
import type { ApplyBrandOptions, ApplyBrandResult, BrandManifest } from '../types';
import { logError, logEvent } from '../utils/logging';

const TEMPLATE_XML =
  '<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:r><w:t>MHP header/footer placeholder</w:t></w:r></w:p>';

export async function applyBrand(options: ApplyBrandOptions = {}): Promise<ApplyBrandResult> {
  let manifest: BrandManifest | undefined;
  let issues: Awaited<ReturnType<typeof assessAltText>> | undefined;

  try {
    await Word.run(async (context) => {
      const requirementSet = detectRequirementSet();
      await restrictParagraphStyles(context, requirementSet);
      await restrictCharacterStyles(context, requirementSet);

      if (!options.skipHeaders) {
        await applyHeadersFooters(context, TEMPLATE_XML);
      }

      await lockBrandAnchors(context);
      issues = await assessAltText(context);

      manifest = buildManifest('1.0.0');
      await writeBrandManifest(context.document, manifest);

      const telemetry = createTelemetryEnvelope('brand_apply_execute', 'word');
      telemetry.result = 'success';

      logEvent('brand_apply_completed', {
        requirementSet,
        missingAltText: issues?.missing.length ?? 0,
        manifest
      });

      await context.sync();
    });

    return {
      success: true,
      manifest,
      issues
    };
  } catch (error) {
    logError('brand_apply_failed', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
