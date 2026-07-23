import { expect, test } from '../../fixtures/index.js';
import type { APIRequestContext } from '@playwright/test';

const password = 'e2e-password-123';

async function createStaff(adminApi: APIRequestContext, suffix: string) {
  const email = `staff.${suffix}@gmail.com`;
  const response = await adminApi.post('/api/admin/staffs', {
    data: {
      fullName: `E2E Staff ${suffix}`,
      email,
      password,
      phoneNumber: `08${suffix.replace(/\D/g, '').slice(-8).padStart(8, '0')}`,
      hiredDate: '2025-01-15',
    },
  });
  expect(response.status(), await response.text()).toBe(200);
  const body = await response.json() as { data: { id: number; email: string; active: boolean; role: string } };
  return { email, staff: body.data };
}

async function createService(adminApi: APIRequestContext, suffix: string) {
  const serviceName = `E2E Service ${suffix}`;
  const response = await adminApi.post('/api/admin/services', {
    data: {
      serviceName,
      description: 'Deterministic E2E admin service',
      durationMinutes: 45,
      pointMultiplier: 1.25,
      category: 'BASIC',
      steps: ['Inspect vehicle', 'Wash exterior'],
      highLights: ['pH neutral', 'E2E verified'],
      priceForSedan: 123456,
      priceForSuv: 234567,
      image: 'https://example.invalid/e2e-service.jpg',
    },
  });
  expect(response.status(), await response.text()).toBe(200);
  return { serviceName, created: await response.json() as { id: number } };
}

test.describe('@p0 admin mutations', () => {
  test.skip('TC-AD05 deactivates and restores a customer and login follows status', async ({
    adminApi,
    guestApi,
    uniqueData,
  }) => {
    const fullName = `E2E Customer ${uniqueData.suffix}`;
    const phoneNumber = `07${uniqueData.suffix.replace(/\D/g, '').slice(-8).padStart(8, '0')}`;
    const register = await guestApi.post('/auth/register', {
      data: {
        email: uniqueData.email,
        password,
        confirmPassword: password,
        fullName,
        dateOfBirth: '1995-04-05',
        phoneNumber,
      },
    });
    expect(register.status()).toBe(201);
    const list = await adminApi.get('/api/admin/customers?size=200');
    const customers = await list.json() as {
      data: { content: Array<{ id: number; email: string; active: boolean }> };
    };
    const customer = customers.data.content.find(({ email }) => email === uniqueData.email)!;

    expect((await adminApi.delete(`/api/admin/customers/${customer.id}`)).status()).toBe(200);
    const inactive = await guestApi.post('/auth/login', {
      data: { email: uniqueData.email, password },
    });
    expect(inactive.status()).toBe(403);

    expect((await adminApi.put(`/api/admin/customers/restore/${customer.id}`)).status()).toBe(200);
    const restored = await guestApi.post('/auth/login', {
      data: { email: uniqueData.email, password },
    });
    expect(restored.status()).toBe(200);
  });

  test('TC-AD06 adds a unique staff account that can log in', async ({ adminApi, guestApi, uniqueData }) => {
    const { email, staff } = await createStaff(adminApi, uniqueData.suffix);
    expect(staff).toMatchObject({ email, active: true, role: 'STAFF' });
    const login = await guestApi.post('/auth/login', { data: { email, password } });
    expect(login.status()).toBe(200);
    const me = await guestApi.get('/api/users/me');
    expect(await me.json()).toMatchObject({ email, role: 'STAFF' });
  });

  test.skip('TC-AD08 deactivates and restores staff and login follows status', async ({
    adminApi,
    guestApi,
    uniqueData,
  }) => {
    const { email, staff } = await createStaff(adminApi, uniqueData.suffix);
    expect((await adminApi.delete(`/api/admin/staffs/${staff.id}`)).status()).toBe(200);
    expect((await guestApi.post('/auth/login', { data: { email, password } })).status()).toBe(403);
    expect((await adminApi.put(`/api/admin/staffs/restore/${staff.id}`)).status()).toBe(200);
    expect((await guestApi.post('/auth/login', { data: { email, password } })).status()).toBe(200);
  });

  test('TC-AD09 creates a service with workflow, highlights, and both prices', async ({
    adminApi,
    uniqueData,
  }) => {
    const { serviceName, created } = await createService(adminApi, uniqueData.suffix);
    const services = await (await adminApi.get('/api/services')).json() as {
      data: Array<{
        serviceId: number;
        serviceName: string;
        duration: number;
        pointMultiplier: number;
        category: string;
        active: boolean;
        steps: Array<{ step: number; stepDescription: string }>;
        highlights: Array<{ highlightDescription: string }>;
        servicePrices: Array<{ price: number; vehicleType: { typeName: string } }>;
      }>;
    };
    const service = services.data.find(({ serviceId }) => serviceId === created.id)!;
    expect(service).toMatchObject({
      serviceName,
      duration: 45,
      pointMultiplier: 1.25,
      category: 'BASIC',
      active: true,
      steps: [
        { step: 1, stepDescription: 'Inspect vehicle' },
        { step: 2, stepDescription: 'Wash exterior' },
      ],
      highlights: [
        { highlightDescription: 'pH neutral' },
        { highlightDescription: 'E2E verified' },
      ],
    });
    expect(service.servicePrices).toEqual(expect.arrayContaining([
      expect.objectContaining({ price: 123456, vehicleType: expect.objectContaining({ typeName: 'SEDAN' }) }),
      expect.objectContaining({ price: 234567, vehicleType: expect.objectContaining({ typeName: 'SUV' }) }),
    ]));
  });

  test.skip('TC-AD11 deactivates and restores a service', async ({ adminApi, uniqueData }) => {
    const { created } = await createService(adminApi, uniqueData.suffix);
    const deactivate = await adminApi.delete(`/api/admin/services/${created.id}`);
    expect(deactivate.status()).toBe(200);
    expect(await deactivate.json()).toMatchObject({ id: created.id });
    const afterDeactivate = await (await adminApi.get('/api/services')).json() as {
      data: Array<{ serviceId: number; active: boolean }>;
    };
    expect(afterDeactivate.data.find(({ serviceId }) => serviceId === created.id)?.active).toBe(false);

    const restore = await adminApi.put(`/api/admin/services/restore/${created.id}`);
    expect(restore.status(), await restore.text()).toBe(200);
    const afterRestore = await (await adminApi.get('/api/services')).json() as {
      data: Array<{ serviceId: number; active: boolean }>;
    };
    expect(afterRestore.data.find(({ serviceId }) => serviceId === created.id)?.active).toBe(true);
  });

  test.skip('TC-AD12 creates, updates, and deactivates a scoped promotion', async ({ adminApi, uniqueData }) => {
    const services = await (await adminApi.get('/api/services')).json() as {
      data: Array<{ serviceId: number; active: boolean }>;
    };
    const tiers = await (await adminApi.get('/api/admin/membership-tiers')).json() as {
      data: Array<{ id: number; tierName: string }>;
    };
    const payload = {
      promotionName: `E2E Promotion ${uniqueData.suffix}`,
      description: 'E2E promotion create',
      startDate: '2026-07-20T00:00:00',
      endDate: '2026-08-20T23:59:59',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      serviceId: services.data.find(({ active }) => active)!.serviceId,
      minTierId: tiers.data.find(({ tierName }) => tierName === 'Bronze')!.id,
      maxUsesTotal: 50,
      maxUsesPerCustomer: 2,
      usageCount: 0,
    };
    const create = await adminApi.post('/api/promotions', { data: payload });
    expect(create.status(), await create.text()).toBe(201);
    const created = await create.json() as { id: number; createdByStaff: string; active: boolean };
    expect(created).toMatchObject({ createdByStaff: 'E2E Admin', active: true });

    const update = await adminApi.put(`/api/promotions/${created.id}`, {
      data: { ...payload, description: 'E2E promotion updated', discountValue: 20 },
    });
    expect(update.status()).toBe(201);
    expect(await update.json()).toMatchObject({
      id: created.id,
      description: 'E2E promotion updated',
      discountValue: 20,
      createdByStaff: 'E2E Admin',
    });
    const remove = await adminApi.delete(`/api/promotions/${created.id}`);
    expect(remove.status()).toBe(200);
    expect(await remove.json()).toMatchObject({ id: created.id, active: false });
  });

  test('TC-AD13 creates, updates, and deactivates a reward', async ({ adminApi, uniqueData }) => {
    const payload = {
      rewardName: `E2E Reward ${uniqueData.suffix}`,
      rewardType: 'DISCOUNT_PERCENTAGE',
      pointCost: 300,
      discountValue: 12,
      validityDays: 45,
      description: 'E2E reward create',
    };
    const create = await adminApi.post('/api/admin/rewards', { data: payload });
    expect(create.status(), await create.text()).toBe(201);
    const body = await create.json() as { data: { id: number; active: boolean } };
    expect(body.data.active).toBe(true);

    const update = await adminApi.put(`/api/admin/rewards/${body.data.id}`, {
      data: { ...payload, pointCost: 350, discountValue: 18, description: 'E2E reward updated' },
    });
    expect(update.status()).toBe(200);
    expect(await update.json()).toMatchObject({
      data: {
        id: body.data.id,
        pointCost: 350,
        discountValue: 18,
        description: 'E2E reward updated',
      },
    });
    expect((await adminApi.delete(`/api/admin/rewards/${body.data.id}`)).status()).toBe(204);
    const get = await adminApi.get(`/api/admin/rewards/${body.data.id}`);
    expect(await get.json()).toMatchObject({ data: { id: body.data.id, active: false } });
  });
});
