import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test as setup } from '@playwright/test';
import { env } from '../../env.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const authDir = path.resolve(here, '../../.auth');

async function authenticate(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
  output: string,
) {
  await fs.mkdir(authDir, { recursive: true });
  const response = await page.request.post(`${env.backendURL}/auth/login`, {
    data: { email, password },
  });
  expect(response.status()).toBe(200);
  await page.context().storageState({ path: path.join(authDir, output) });
}

setup('customer auth', async ({ page }) => {
  await authenticate(page, env.customer.email, env.customer.password, 'customer.json');
});

setup('staff auth', async ({ page }) => {
  await authenticate(page, env.staff.email, env.staff.password, 'staff.json');
});

setup('admin auth', async ({ page }) => {
  await authenticate(page, env.admin.email, env.admin.password, 'admin.json');
});
