import { test, expect } from '../../fixtures/index.js';

test('@p0 TC-AU08 customer registers with unique data', async ({ page, uniqueData }) => {
  const phone = `03${Date.now().toString().slice(-8)}`;
  const registerResponse = page.waitForResponse(
    (response) => response.url().endsWith('/auth/register') && response.request().method() === 'POST',
    { timeout: 30_000 },
  );

  await page.goto('/signup');
  await page.locator('#signup_email').fill(uniqueData.email);
  await page.locator('#signup_password').fill('e2e-password-123');
  await page.locator('#signup_confirmPassword').fill('e2e-password-123');
  await page.locator('#signup_fullName').fill('Registered Customer');
  await page.locator('#signup_dob').fill('01/01/1995');
  await page.locator('#signup_dob').press('Enter');
  await page.locator('#signup_phone').fill(phone);
  await page.locator('button[type="submit"]').click();

  expect((await registerResponse).status()).toBe(201);
  await expect(page.locator('.ant-message-success')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});
