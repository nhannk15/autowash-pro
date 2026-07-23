import { test, expect } from '../../fixtures/index.js';
import { env } from '../../env.js';
import { LoginPage } from '../../pages/login.page.js';

const roles = [
  { id: 'TC-AU01', name: 'customer', credentials: env.customer, path: /^http:\/\/127\.0\.0\.1:3000\/$/, role: 'CUSTOMER' },
  { id: 'TC-AU02', name: 'staff', credentials: env.staff, path: /\/staff\/dashboard$/, role: 'STAFF' },
  { id: 'TC-AU03', name: 'admin', credentials: env.admin, path: /\/admin\/dashboard$/, role: 'ADMIN' },
] as const;

for (const role of roles) {
  test(`@p0 ${role.id} ${role.name} login`, async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(role.credentials.email, role.credentials.password);

    await expect(page).toHaveURL(role.path);
    const me = await page.request.get(`${env.backendURL}/api/users/me`);
    expect(me.status()).toBe(200);
    expect((await me.json()).role).toBe(role.role);
  });
}

test('@p0 TC-AU04 invalid credentials do not create auth cookies', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(env.customer.email, 'definitely-wrong-password');
  await login.expectLoggedOut();
});

test.skip('@p0 TC-AU06 inactive customer cannot login', async ({ page }) => {
  const loginResponse = page.waitForResponse(
    (response) => response.url().endsWith('/auth/login') && response.request().method() === 'POST',
  );
  const login = new LoginPage(page);
  await login.goto();
  await login.login(env.inactive.email, env.inactive.password);

  expect((await loginResponse).status()).toBe(403);
  await login.expectLoggedOut();
});
