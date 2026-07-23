import { test, expect } from '../../fixtures/index.js';
import { env } from '../../env.js';

async function logoutFromSidebar(page: import('@playwright/test').Page) {
  await page.locator('.sidebar__toggle').click();
  await page.getByText(/ng xu/i, { exact: false }).last().click();
  await expect(page).toHaveURL(/\/login$/);
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);

  const authCookies = (await page.context().cookies())
    .filter(({ name }) => name === 'access_token' || name === 'refresh_token');
  expect(authCookies).toHaveLength(0);
  expect((await page.request.get(`${env.backendURL}/api/users/me`)).status()).toBe(401);
}

test.skip('@p0 TC-AU14 customer logout clears both cookies', async ({ customerPage }) => {
  await customerPage.goto('/ca-nhan/ho-so');
  await logoutFromSidebar(customerPage);
});

for (const role of ['staff', 'admin'] as const) {
  test.skip(`@p0 TC-AU15 ${role} logout survives hard reload`, async ({ staffPage, adminPage }) => {
    const page = role === 'staff' ? staffPage : adminPage;
    await page.goto(`/${role}/dashboard`);
    await logoutFromSidebar(page);
  });
}
