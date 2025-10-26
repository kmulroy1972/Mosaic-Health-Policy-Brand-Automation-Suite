import { expect, test } from '@playwright/test';

import { restoreOnline, simulateOffline } from '../../fixtures/offline';

const runOffline = process.env.MHP_E2E === 'true';

test.describe('Offline queue behaviour', () => {
  test.skip(!runOffline, 'Set MHP_E2E=true to enable offline simulations');

  test('shows queued toast when network drops', async ({ page }) => {
    await page.goto('/word/taskpane.html');
    await simulateOffline(page, /templates/);
    await page.getByRole('button', { name: 'Apply Brand' }).click();
    await expect(page.getByText('We will retry when you are back online')).toBeVisible();
    await restoreOnline(page);
  });
});
