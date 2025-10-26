import 'office-js';

import { logEvent } from '../utils/logging';

const HEADER_TAG = 'MHP_HEADER';
const FOOTER_TAG = 'MHP_FOOTER';

async function insertTemplatePart(body: Word.Body, tag: string, sourceXml: string) {
  body.load('isNullObject');
  await body.context.sync();
  if (body.isNullObject) {
    return;
  }

  const controls = body.contentControls;
  controls.load('items/tag');
  await body.context.sync();

  const existing = controls.items.find((control) => control.tag === tag);

  if (existing) {
    existing.insertOoxml(sourceXml, Word.InsertLocation.replace);
  } else {
    const control = body.insertContentControl();
    control.tag = tag;
    control.title = tag;
    control.appearance = Word.ContentControlAppearance.boundingBox;
    control.insertOoxml(sourceXml, Word.InsertLocation.replace);
  }
}

export async function applyHeadersFooters(context: Word.RequestContext, template: string) {
  const sections = context.document.sections;
  sections.load('items');
  await context.sync();

  for (const section of sections.items) {
    const primaryHeader = section.getHeader(Word.HeaderFooterType.primary);
    const firstHeader = section.getHeader(Word.HeaderFooterType.firstPage);
    const primaryFooter = section.getFooter(Word.HeaderFooterType.primary);
    const firstFooter = section.getFooter(Word.HeaderFooterType.firstPage);

    await insertTemplatePart(primaryHeader, HEADER_TAG, template);
    await insertTemplatePart(firstHeader, HEADER_TAG, template);
    await insertTemplatePart(primaryFooter, FOOTER_TAG, template);
    await insertTemplatePart(firstFooter, FOOTER_TAG, template);
  }

  logEvent('brand_word_headers_footers_applied');
}
