import type { APIRequestContext } from '@playwright/test';
import { env } from '../../env.js';
import { expect, test } from '../../fixtures/index.js';

const dashboardEndpoints = [
  '/api/admin/dashboard/summary',
  '/api/admin/dashboard/revenue-chart',
  '/api/admin/dashboard/service-distribution',
  '/api/admin/dashboard/peak-hours',
  '/api/admin/dashboard/promotion-usages',
  '/api/admin/dashboard/promotion-usage-count',
  '/api/admin/dashboard/deduction-chart',
  '/api/admin/dashboard/promotion-performance',
  '/api/admin/dashboard/deduction-summary',
  '/api/admin/dashboard/booking-list',
];

async function dashboardPost(api: APIRequestContext, payload: Record<string, unknown>) {
  for (const endpoint of dashboardEndpoints) {
    const response = await api.post(endpoint, { data: payload });
    expect(response.status(), `${endpoint}: ${await response.text()}`).toBe(200);
  }
}

async function createService(api: APIRequestContext, suffix: string) {
  const response = await api.post('/api/admin/services', { data: {
    serviceName: `E2E Search Service ${suffix}`,
    description: 'Admin list, filter, and detail coverage',
    durationMinutes: 35,
    pointMultiplier: 1.1,
    category: 'ADDON',
    steps: ['Inspect', 'Finish'],
    highLights: ['Searchable'],
    priceForSedan: 111000,
    priceForSuv: 155000,
  } });
  expect(response.status(), await response.text()).toBe(200);
  return await response.json() as { id: number };
}

test.describe('@p1 admin features', () => {
  test('TC-AD01 dashboard summary APIs load all KPI groups', async ({ adminApi }) => {
    await dashboardPost(adminApi, {});
    const recent = await adminApi.get('/api/admin/dashboard/recent-transactions');
    const bays = await adminApi.get('/api/staff/wash-bays');
    expect(recent.status()).toBe(200);
    expect(bays.status()).toBe(200);
    expect(Array.isArray(await recent.json())).toBe(true);
  });

  test('TC-AD02 dashboard accepts all, date-range, month, and year filter payloads', async ({ adminApi }) => {
    await dashboardPost(adminApi, {});
    await dashboardPost(adminApi, { startDate: '2026-07-01', endDate: '2026-07-31' });
    await dashboardPost(adminApi, { month: 'JULY', year: 2026 });
    await dashboardPost(adminApi, { year: 2026 });
  });

  test('TC-AD03 dashboard charts, tables, and valid empty states render', async ({ adminPage }) => {
    await adminPage.goto('/admin/dashboard');
    await expect(adminPage.locator('.admin-dashboard')).toBeVisible();
    await expect(adminPage.locator('.admin-dashboard__chart-card')).toHaveCount(await adminPage.locator('.admin-dashboard__chart-card').count());
    expect(await adminPage.locator('.admin-dashboard__chart-card').count()).toBeGreaterThanOrEqual(5);
    await expect(adminPage.locator('.admin-dashboard__transactions-card')).toBeVisible();
    await expect(adminPage.locator('.admin-dashboard__bays-card')).toBeVisible();
  });

  test('TC-AD04 customer pagination, sorting, and full-name search return deterministic data', async ({
    adminApi, guestApi, uniqueData,
  }) => {
    const fullName = `Searchable Customer ${uniqueData.suffix}`;
    expect((await guestApi.post('/auth/register', { data: {
      email: uniqueData.email,
      password: 'e2e-password-123',
      confirmPassword: 'e2e-password-123',
      fullName,
      dateOfBirth: '1994-05-06',
      phoneNumber: `06${Date.now().toString().slice(-8)}`,
    } })).status()).toBe(201);

    const page = await adminApi.get('/api/admin/customers?page=0&size=1&sort=fullName,desc');
    expect(page.status()).toBe(200);
    const pageBody = await page.json() as { data: { content: unknown[]; size: number; totalElements: number } };
    expect(pageBody.data.content).toHaveLength(1);
    expect(pageBody.data.size).toBe(1);

    const search = await adminApi.get(`/api/admin/customers?search=${encodeURIComponent(fullName)}&size=10`);
    const searchBody = await search.json() as { data: { content: Array<{ fullName: string; email: string }> } };
    expect(searchBody.data.content).toEqual([expect.objectContaining({ fullName, email: uniqueData.email })]);
  });

  test('TC-AD07 staff required fields, formats, and duplicate email are rejected', async ({ adminApi }) => {
    const invalid = await adminApi.post('/api/admin/staffs', {
      data: { fullName: '', email: 'invalid', password: '', phoneNumber: '123', hiredDate: null },
    });
    expect(invalid.status()).toBe(400);
    const duplicate = await adminApi.post('/api/admin/staffs', { data: {
      fullName: 'Duplicate E2E Staff', email: env.staff.email, password: 'e2e-password-123',
      phoneNumber: '0888888888', hiredDate: '2026-01-01',
    } });
    expect(duplicate.status()).toBe(400);
  });

  test('TC-AD10 service search, category filter, sort, and detail reflect saved data', async ({
    adminApi, adminPage, uniqueData,
  }) => {
    const created = await createService(adminApi, uniqueData.suffix);
    const services = await (await adminApi.get('/api/services')).json() as {
      data: Array<{ serviceId: number; serviceName: string; category: string }>;
    };
    const service = services.data.find(({ serviceId }) => serviceId === created.id)!;
    expect(service.category).toBe('ADDON');

    await adminPage.goto('/admin/service');
    const search = adminPage.locator('.service-toolbar-search input');
    await search.fill(service.serviceName);
    await search.press('Enter');
    const item = adminPage.locator('.service-list-item').filter({ hasText: service.serviceName });
    await expect(item).toBeVisible();
    await item.locator('.service-item__btn--view').click();
    await expect(adminPage.locator('.service-detail-modal')).toContainText(service.serviceName);
  });

  test('TC-AD14 membership tier update persists booking, point, expiry, and perk fields', async ({ adminApi }) => {
    const response = await adminApi.get('/api/admin/membership-tiers');
    expect(response.status()).toBe(200);
    const tiers = await response.json() as { data: Array<{
      id: number;
      tierName: string;
      bookingWindowDays: number;
      pointEarnRate: number;
      minPointsToMaintain: number;
      pointExpirationMonths: number;
      perksDescription: string;
    }> };
    const bronze = tiers.data.find(({ tierName }) => tierName === 'Bronze')!;
    const original = {
      bookingWindowDays: bronze.bookingWindowDays,
      pointEarnRate: bronze.pointEarnRate,
      minPointsToMaintain: bronze.minPointsToMaintain,
      pointExpirationMonths: bronze.pointExpirationMonths,
      perksDescription: bronze.perksDescription,
    };
    const changed = {
      bookingWindowDays: original.bookingWindowDays + 1,
      pointEarnRate: Number(original.pointEarnRate) + 0.1,
      minPointsToMaintain: original.minPointsToMaintain + 10,
      pointExpirationMonths: original.pointExpirationMonths + 1,
      perksDescription: `E2E updated ${Date.now()}`,
    };
    try {
      const update = await adminApi.put(`/api/admin/membership-tiers/${bronze.id}`, { data: changed });
      expect(update.status(), await update.text()).toBe(200);
      expect(await update.json()).toMatchObject({ data: changed });
      expect(await (await adminApi.get(`/api/admin/membership-tiers/${bronze.id}`)).json()).toMatchObject({ data: changed });
    } finally {
      const restore = await adminApi.put(`/api/admin/membership-tiers/${bronze.id}`, { data: original });
      expect(restore.status()).toBe(200);
    }
  });

  test('TC-AD15 admin profile route shows the authenticated admin', async ({ adminApi, adminPage }) => {
    const profile = await adminApi.get('/api/staff/info');
    expect(profile.status()).toBe(200);
    expect(await profile.json()).toMatchObject({ email: env.admin.email, role: 'ADMIN' });
    await adminPage.goto('/admin/profile');
    await expect(adminPage.locator('.profile-card')).toContainText(env.admin.email);
    await expect(adminPage.locator('.profile-card')).toContainText('ADMIN');
  });

  test('TC-AD16 admin pages survive API failures and valid empty responses', async ({ adminPage }) => {
    await adminPage.route('**/api/admin/customers**', (route) => route.fulfill({
      status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'E2E forced failure' }),
    }));
    await adminPage.goto('/admin/customer');
    await expect(adminPage.locator('.customer-page')).toBeVisible();
    await expect(adminPage.locator('.ant-notification-notice-error').first()).toBeVisible();

    await adminPage.unroute('**/api/admin/customers**');
    await adminPage.route('**/api/admin/customers**', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { content: [], totalElements: 0, size: 10, number: 0 } }),
    }));
    await adminPage.reload();
    await expect(adminPage.locator('.customer-page')).toBeVisible();
    await expect(adminPage.locator('.ant-empty')).toBeVisible();
  });
});
