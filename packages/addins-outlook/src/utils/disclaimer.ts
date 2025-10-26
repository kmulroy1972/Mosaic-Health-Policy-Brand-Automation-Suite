import type { DisclaimerConfig } from '../types';

import { appendBodyAsync, prependBodyAsync } from './async';

const DEFAULT_DISCLAIMER: DisclaimerConfig = {
  externalBannerHtml:
    '<p style="background:#f6851f;color:#1d232a;padding:8px;border-radius:4px;font-weight:600">External recipient: verify before sending.</p>',
  legalDisclaimerHtml:
    '<p style="font-size:12px;color:#6b7a89">This message may contain confidential information intended only for the named recipients.</p>'
};

export async function ensureDisclaimer(
  item: Office.MessageCompose,
  isExternal: boolean,
  config: DisclaimerConfig = DEFAULT_DISCLAIMER
): Promise<void> {
  if (!isExternal) {
    return;
  }

  await appendBodyAsync(item, config.legalDisclaimerHtml);
  await prependBodyAsync(item, config.externalBannerHtml);
}
