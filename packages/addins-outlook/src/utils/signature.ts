import { getActiveSignature } from '../settings/signatures';

import { prependBodyAsync } from './async';

export async function ensureSignature(item: Office.MessageCompose): Promise<void> {
  const signature = getActiveSignature();
  await prependBodyAsync(item, signature.html);
}
