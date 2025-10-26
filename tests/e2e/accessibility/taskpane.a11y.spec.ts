import fs from 'fs';
import path from 'path';

import { expect, test } from '@playwright/test';

const runA11y = process.env.MHP_A11Y === 'true';
const axeSource = fs.readFileSync(require.resolve('axe-core'), 'utf8');

test.describe('Task pane accessibility', () => {
  test.skip(!runA11y, 'Set MHP_A11Y=true to enable axe-core checks');

  test('Word task pane meets axe-core baseline', async ({ page }) => {
    await page.goto('/word/taskpane.html');
    await page.addScriptTag({ content: axeSource });
    const results = await page.evaluate(async () => {
      // @ts-expect-error axe injected at runtime
      return await window.axe.run({ runOnly: { type: 'tag', values: ['wcag2aa'] } });
    });
    const reportDir = path.resolve(process.cwd(), 'coverage/accessibility');
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(path.join(reportDir, 'word-taskpane.json'), JSON.stringify(results, null, 2));
    expect(results.violations).toEqual([]);
  });
});
