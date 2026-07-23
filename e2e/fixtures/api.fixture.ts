import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { request, test as base, type APIRequestContext } from '@playwright/test';
import { env } from '../env.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const authDir = path.resolve(here, '../.auth');

type ApiFixtures = {
  guestApi: APIRequestContext;
  customerApi: APIRequestContext;
  staffApi: APIRequestContext;
  adminApi: APIRequestContext;
};

async function createApi(storageFile?: string) {
  return request.newContext({
    baseURL: env.backendURL,
    storageState: storageFile ? path.join(authDir, storageFile) : undefined,
    timeout: 30_000,
  });
}

export const apiTest = base.extend<ApiFixtures>({
  guestApi: async ({}, use) => {
    const api = await createApi();
    await use(api);
    await api.dispose();
  },
  customerApi: async ({}, use) => {
    const api = await createApi('customer.json');
    await use(api);
    await api.dispose();
  },
  staffApi: async ({}, use) => {
    const api = await createApi('staff.json');
    await use(api);
    await api.dispose();
  },
  adminApi: async ({}, use) => {
    const api = await createApi('admin.json');
    await use(api);
    await api.dispose();
  },
});
