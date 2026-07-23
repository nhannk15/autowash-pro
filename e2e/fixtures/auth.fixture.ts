import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test as base, type Browser, type Page } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const authDir = path.resolve(here, '../.auth');

type AuthFixtures = {
  customerPage: Page;
  staffPage: Page;
  adminPage: Page;
};

async function createRolePage(browser: Browser, storageFile: string) {
  const context = await browser.newContext({ storageState: path.join(authDir, storageFile) });
  const page = await context.newPage();
  return { context, page };
}

export const authTest = base.extend<AuthFixtures>({
  customerPage: async ({ browser }, use) => {
    const { context, page } = await createRolePage(browser, 'customer.json');
    await use(page);
    await context.close();
  },
  staffPage: async ({ browser }, use) => {
    const { context, page } = await createRolePage(browser, 'staff.json');
    await use(page);
    await context.close();
  },
  adminPage: async ({ browser }, use) => {
    const { context, page } = await createRolePage(browser, 'admin.json');
    await use(page);
    await context.close();
  },
});
