import { expect, test } from '@playwright/test';

const runE2E = process.env.MHP_E2E === 'true';

test.describe('Word brand enforcement flow', () => {
  test.skip(!runE2E, 'Set MHP_E2E=true to enable Word brand E2E');

  test('applies brand and exports accessible PDF', async ({ page }) => {
    await page.goto('/word/taskpane.html');
    await page.getByRole('button', { name: 'Apply Brand' }).click();
    await expect(page.getByText('Brand applied successfully')).toBeVisible();

    await page.getByRole('button', { name: 'Export PDF' }).click();
    await page.getByRole('switch', { name: 'Convert to PDF/A-2b' }).setChecked(true);
    await page.getByRole('button', { name: 'Export PDF' }).click();
    await expect(page.getByText('PDF exported')).toBeVisible();
  });
});
