import 'office-js';

import { logEvent, logError } from './logging';

export async function applyRewriteToSelection(text: string): Promise<void> {
  try {
    await Word.run(async (context) => {
      const range = context.document.getSelection();
      range.insertText(text, Word.InsertLocation.replace);
      await context.sync();
    });
    logEvent('ai_rewrite_applied', {
      characters: text.length
    });
  } catch (error) {
    logError('ai_rewrite_apply_failed', error);
    throw error;
  }
}
