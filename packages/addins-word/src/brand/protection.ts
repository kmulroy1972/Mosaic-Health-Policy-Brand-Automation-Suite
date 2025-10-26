import 'office-js';

import { logEvent } from '../utils/logging';

const ANCHOR_TAG_PREFIX = 'MHP-ANCHOR-';

export async function lockBrandAnchors(context: Word.RequestContext) {
  const controls = context.document.contentControls;
  controls.load('items/tag,items/removeWhenEdited,items/title,items/appearance');
  await context.sync();

  controls.items
    .filter((control: Word.ContentControl) => control.tag?.startsWith(ANCHOR_TAG_PREFIX))
    .forEach((control: Word.ContentControl) => {
      control.removeWhenEdited = false;
      control.title = control.tag ?? control.title;
      control.appearance = Word.ContentControlAppearance.boundingBox;
    });

  logEvent('brand_word_controls_locked', {
    count: controls.items.length
  });
}
