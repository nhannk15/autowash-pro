import { request } from '@playwright/test';
import { test, expect } from '../../fixtures/index.js';
import { env } from '../../env.js';

test.describe('@p0 backend API authorization', () => {
  test('TC-SE07 guest receives 401 from protected API', async ({ guestApi }) => {
    const response = await guestApi.get('/api/users/me');
    expect(response.status()).toBe(401);
  });

  test('TC-SE08 customer receives 403 from admin API', async ({ customerApi }) => {
    const response = await customerApi.get('/api/admin/dashboard');
    expect(response.status()).toBe(403);
  });

  test('TC-SE09 staff receives 403 from admin API', async ({ staffApi }) => {
    const response = await staffApi.get('/api/admin/dashboard');
    expect(response.status()).toBe(403);
  });

  test('TC-SE10 customer cannot access admin-owned CRUD resources', async ({ customerApi }) => {
    for (const endpoint of ['/api/promotions', '/api/service-prices', '/api/booking-details']) {
      const response = await customerApi.get(endpoint);
      expect(response.status(), endpoint).toBe(403);
    }
  });

  test('TC-SE14 revoked refresh token cannot create a new access token', async () => {
    const session = await request.newContext({ baseURL: env.backendURL });
    const login = await session.post('/auth/login', { data: env.customer });
    expect(login.status()).toBe(200);

    const storage = await session.storageState();
    const refreshOnly = {
      ...storage,
      cookies: storage.cookies.filter(({ name }) => name === 'refresh_token'),
    };
    const logout = await session.post('/auth/logout');
    expect(logout.status()).toBe(200);
    await session.dispose();

    const replay = await request.newContext({ baseURL: env.backendURL, storageState: refreshOnly });
    const response = await replay.get('/api/users/me');
    expect(response.status()).toBe(401);
    await replay.dispose();
  });
});
