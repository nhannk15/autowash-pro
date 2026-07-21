import { test, expect } from '../../fixtures/index.js';

test.describe.skip('@p0 frontend route guards', () => {
  for (const route of ['/ca-nhan/ho-so', '/staff/dashboard', '/admin/dashboard']) {
    test(`TC-SE01-03 guest ${route} redirects to login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login$/);
    });
  }

  test('TC-SE04 customer cannot render staff or admin routes', async ({ customerPage }) => {
    for (const route of ['/staff/dashboard', '/admin/dashboard']) {
      await customerPage.goto(route);
      await expect(customerPage).toHaveURL(/^http:\/\/127\.0\.0\.1:3000\/$/);
    }
  });

  test('TC-SE05 staff cannot render customer or admin routes', async ({ staffPage }) => {
    for (const route of ['/ca-nhan/ho-so', '/admin/dashboard']) {
      await staffPage.goto(route);
      await expect(staffPage).toHaveURL(/\/staff\/dashboard$/);
    }
  });

  test('TC-SE06 admin cannot render customer, staff, or public-only login', async ({ adminPage }) => {
    for (const route of ['/ca-nhan/ho-so', '/staff/dashboard', '/login']) {
      await adminPage.goto(route);
      await expect(adminPage).toHaveURL(/\/admin\/dashboard$/);
    }
  });
});
