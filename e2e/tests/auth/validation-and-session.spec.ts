import { request } from '@playwright/test';
import { expect, test } from '../../fixtures/index.js';
import { env } from '../../env.js';

test('@p1 TC-AU05 login validation blocks empty and malformed credentials before HTTP', async ({ page }) => {
  let loginRequests = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/auth/login')) loginRequests += 1;
  });
  await page.goto('/login');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('.ant-form-item-explain-error')).toHaveCount(2);
  await page.getByLabel('Email').fill('not-an-email');
  await page.locator('input[type="password"]').fill('password');
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText(/Email.*định dạng/i)).toBeVisible();
  expect(loginRequests).toBe(0);
});

test('@p1 TC-AU07 authenticated session survives a hard reload', async ({ customerPage }) => {
  await customerPage.goto('/ca-nhan/ho-so');
  await expect(customerPage).toHaveURL(/\/ca-nhan\/ho-so$/);
  await customerPage.reload();
  await expect(customerPage).toHaveURL(/\/ca-nhan\/ho-so$/);
  expect((await customerPage.request.get(`${env.backendURL}/api/users/me`)).status()).toBe(200);
});

test('@p1 TC-AU09 duplicate registration is rejected without creating another user', async ({
  page,
  adminApi,
}) => {
  const before = await (await adminApi.get('/api/admin/customers?size=200')).json() as {
    data: { totalElements: number };
  };
  await page.goto('/signup');
  await page.locator('#signup_email').fill(env.customer.email);
  await page.locator('#signup_password').fill(env.customer.password);
  await page.locator('#signup_confirmPassword').fill(env.customer.password);
  await page.locator('#signup_fullName').fill('Duplicate Customer');
  await page.locator('#signup_dob').fill('01/01/1995');
  await page.locator('#signup_dob').press('Enter');
  await page.locator('#signup_phone').fill('0399999999');
  const response = page.waitForResponse((candidate) => candidate.url().endsWith('/auth/register'));
  await page.locator('button[type="submit"]').click();
  expect((await response).status()).toBe(400);
  await expect(page.locator('.ant-message-error')).toBeVisible();
  const after = await (await adminApi.get('/api/admin/customers?size=200')).json() as {
    data: { totalElements: number };
  };
  expect(after.data.totalElements).toBe(before.data.totalElements);
});

test('@p1 TC-AU10 register validation covers password, confirmation, name, phone, and birth date', async ({
  page,
}) => {
  let registerRequests = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/auth/register')) registerRequests += 1;
  });
  await page.goto('/signup');
  await page.locator('#signup_email').fill('valid.e2e@gmail.com');
  await page.locator('#signup_password').fill('short');
  await page.locator('#signup_confirmPassword').fill('different');
  await page.locator('#signup_fullName').fill('Invalid 123');
  await page.locator('#signup_phone').fill('123');
  await page.locator('button[type="submit"]').click();
  const errors = page.locator('.ant-form-item-explain-error');
  await expect(errors).toHaveCount(5);
  expect(registerRequests).toBe(0);
});

test('@p1 TC-AU11 forgot-password resend creates a new mail without exposing OTP in API response', async ({
  page,
}) => {
  const mailpit = await request.newContext({ baseURL: env.mailpitURL });
  const before = await (await mailpit.get('/api/v1/messages?limit=100')).json() as {
    messages: Array<{ To: Array<{ Address: string }> | null }>;
  };
  const beforeCount = before.messages.filter((message) =>
    message.To?.some(({ Address }) => Address === env.customer.email) ?? false).length;

  await page.goto('/forgotpass');
  await page.locator('#forgotpass-email_email').fill(env.customer.email);
  const first = page.waitForResponse((response) => response.url().endsWith('/auth/forgot-password'));
  await page.locator('button[type="submit"]').click();
  const firstResponse = await first;
  expect(firstResponse.status()).toBe(200);
  expect(await firstResponse.text()).not.toMatch(/"otp"\s*:/i);
  const resend = page.waitForResponse((response) => response.url().endsWith('/auth/forgot-password'));
  await page.getByRole('button', { name: /Gửi lại mã OTP/i }).click();
  expect((await resend).status()).toBe(200);

  await expect.poll(async () => {
    const list = await (await mailpit.get('/api/v1/messages?limit=100')).json() as {
      messages: Array<{ To: Array<{ Address: string }> | null }>;
    };
    return list.messages.filter((message) =>
      message.To?.some(({ Address }) => Address === env.customer.email) ?? false).length;
  }).toBeGreaterThanOrEqual(beforeCount + 2);
  await mailpit.dispose();
});

test('@p1 TC-AU12 malformed and incorrect OTP values never open the reset step', async ({ page }) => {
  let verifyRequests = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/auth/verify-otp')) verifyRequests += 1;
  });
  await page.goto('/forgotpass');
  await page.locator('#forgotpass-email_email').fill(env.customer.email);
  await page.locator('button[type="submit"]').click();
  const otpInputs = page.locator('.ant-otp input');
  await expect(otpInputs).toHaveCount(6);
  await otpInputs.first().fill('1');
  await page.getByRole('button', { name: /Xác minh/i }).click();
  expect(verifyRequests).toBe(0);
  await expect(page.locator('#forgotpass-reset_newPassword')).toHaveCount(0);

  for (const [index, digit] of [...'000000'].entries()) await otpInputs.nth(index).fill(digit);
  const verify = page.waitForResponse((response) => response.url().endsWith('/auth/verify-otp'));
  await page.getByRole('button', { name: /Xác minh/i }).click();
  expect((await verify).status()).toBe(400);
  await expect(page.locator('#forgotpass-reset_newPassword')).toHaveCount(0);
});
