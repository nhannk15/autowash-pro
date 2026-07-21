import { request } from '@playwright/test';
import { test, expect } from '../../fixtures/index.js';
import { env } from '../../env.js';

type MailpitMessage = {
  ID: string;
  To: Array<{ Address: string }>;
};

test('@p0 TC-AU13 reset password using OTP captured by Mailpit', async ({ page, guestApi, uniqueData }) => {
  test.setTimeout(90_000);
  const oldPassword = 'e2e-password-123';
  const newPassword = 'e2e-password-456';
  const phone = `07${Date.now().toString().slice(-8)}`;

  const registration = await guestApi.post('/auth/register', {
    data: {
      email: uniqueData.email,
      password: oldPassword,
      confirmPassword: oldPassword,
      fullName: 'E2E Reset Customer',
      dateOfBirth: '1995-01-01',
      phoneNumber: phone,
    },
  });
  expect(registration.status()).toBe(201);

  await page.goto('/forgotpass');
  await page.locator('#forgotpass-email_email').fill(uniqueData.email);
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole('textbox', { name: 'OTP Input 1' })).toBeVisible();

  const mailpit = await request.newContext({ baseURL: env.mailpitURL });
  const listResponse = await mailpit.get('/api/v1/messages?limit=100');
  expect(listResponse.status()).toBe(200);
  const messages = (await listResponse.json()) as { messages: MailpitMessage[] };
  const message = messages.messages.find((candidate) =>
    candidate.To.some((recipient) => recipient.Address === uniqueData.email));
  expect(message, `No reset email found for ${uniqueData.email}`).toBeTruthy();

  const detailResponse = await mailpit.get(`/api/v1/message/${message!.ID}`);
  expect(detailResponse.status()).toBe(200);
  const detail = await detailResponse.json() as { Text: string };
  const otp = detail.Text.match(/\n(\d{6})\n/)?.[1];
  expect(otp).toMatch(/^\d{6}$/);
  await mailpit.dispose();

  const otpInputs = page.locator('.ant-otp input');
  await expect(otpInputs).toHaveCount(6);
  for (const [index, digit] of [...otp!].entries()) {
    await otpInputs.nth(index).fill(digit);
  }
  await page.getByRole('button', { name: /X.c minh/i }).click();
  await expect(page.locator('#forgotpass-reset_newPassword')).toBeVisible();

  await page.locator('#forgotpass-reset_newPassword').fill(newPassword);
  await page.locator('#forgotpass-reset_confirmPassword').fill(newPassword);
  await page.locator('#forgotpass-reset_newPassword').locator('xpath=ancestor::form').locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/login$/);

  const verification = await request.newContext({ baseURL: env.backendURL });
  expect((await verification.post('/auth/login', {
    data: { email: uniqueData.email, password: oldPassword },
  })).status()).not.toBe(200);
  expect((await verification.post('/auth/login', {
    data: { email: uniqueData.email, password: newPassword },
  })).status()).toBe(200);
  await verification.post('/auth/logout');
  await verification.dispose();
});
