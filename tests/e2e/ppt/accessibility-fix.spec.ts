import { expect, test } from '@playwright/test';

const runE2E = process.env.MHP_E2E === 'true';

test.describe('PowerPoint accessibility checks', () => {
  test.skip(!runE2E, 'Set MHP_E2E=true to enable PowerPoint E2E');

  test('detects off-brand logo and suggests fix', async ({ page }) => {
    await page.goto('/ppt/taskpane.html');
    await page.getByRole('button', { name: 'Apply Brand' }).click();
    await expect(page.getByText('Master layouts synced')).toBeVisible();

    await page.getByRole('button', { name: 'Fix Accessibility' }).click();
    await expect(page.getByText('Contrast warnings')).toBeVisible();
    await page.getByRole('button', { name: 'Fix All' }).click();
    await expect(page.getByText('All issues resolved')).toBeVisible();
  });
});
