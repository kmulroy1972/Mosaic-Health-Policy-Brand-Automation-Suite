import { Page } from '@playwright/test';

export async function simulateOffline(page: Page, urlPattern: RegExp = /.*/): Promise<void> {
  await page.route(urlPattern, (route) => {
    route.abort('failed');
  });
}

export async function restoreOnline(page: Page): Promise<void> {
  await page.unroute(/.*/);
}
