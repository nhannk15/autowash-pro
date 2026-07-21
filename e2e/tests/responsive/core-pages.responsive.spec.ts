import type { Page } from '@playwright/test';
import { expect, test } from '../../fixtures/index.js';

async function expectNoHorizontalOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(sizes.documentWidth).toBeLessThanOrEqual(sizes.viewportWidth + 1);
}

test.skip('@p2 responsive public navigation opens and remains within viewport', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.navbar__hamburger')).toBeVisible();
  await page.locator('.navbar__hamburger').click();
  await expect(page.locator('.navbar__links--open')).toBeVisible();
  await page.locator('.navbar__links--open a[href="/service"]').click();
  await expect(page).toHaveURL(/\/service$/);
  await expectNoHorizontalOverflow(page);
});

for (const [role, route, root] of [
  ['customer', '/ca-nhan/tong-quan', '.overview-container'],
  ['staff', '/staff/dashboard', '.dashboard__stats-row'],
  ['admin', '/admin/dashboard', '.admin-dashboard'],
] as const) {
  test.skip(`@p2 responsive ${role} sidebar opens and closes cleanly`, async ({
    customerPage, staffPage, adminPage,
  }) => {
    const page = role === 'customer' ? customerPage : role === 'staff' ? staffPage : adminPage;
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto(route);
    await expect(page.locator(root)).toBeVisible();
    await expect(page.locator('.sidebar__mobile-trigger')).toBeVisible();
    await page.locator('.sidebar__mobile-trigger').click();
    await expect(page.locator('.sidebar:not(.sidebar--collapsed)')).toBeVisible();
    await page.locator('.sidebar__overlay').click({ position: { x: 390, y: 400 } });
    await expect(page.locator('.sidebar.sidebar--collapsed')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}
