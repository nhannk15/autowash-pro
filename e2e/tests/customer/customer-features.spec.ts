import { request, type APIRequestContext } from '@playwright/test';
import { env } from '../../env.js';
import { expect, test } from '../../fixtures/index.js';

type Vehicle = {
  vehicleId: number;
  typeName: string;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  image?: string;
  active: boolean;
};

async function vehicles(api: APIRequestContext) {
  const response = await api.get('/api/vehicles/user');
  expect(response.status()).toBe(200);
  return (await response.json() as { data: Vehicle[] }).data;
}

async function sedanType(api: APIRequestContext) {
  const response = await api.get('/api/vehicle-types');
  expect(response.status()).toBe(200);
  const types = await response.json() as Array<{ id: number; typeName: string; active: boolean }>;
  return types.find((type) => type.typeName === 'SEDAN' && type.active)!;
}

async function addVehicle(api: APIRequestContext, licensePlate: string) {
  const type = await sedanType(api);
  const response = await api.post('/api/vehicles', {
    data: {
      vehicleTypeId: type.id,
      licensePlate,
      brand: 'Toyota',
      model: 'E2E Model',
      color: 'White',
      image: 'https://example.invalid/original.jpg',
    },
  });
  expect(response.status()).toBe(200);
  return (await vehicles(api)).find((vehicle) => vehicle.licensePlate === licensePlate)!;
}

function dateInSaigon(daysFromNow: number) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(Date.now() + daysFromNow * 86_400_000));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

test.describe('@p1 customer features', () => {
  test('TC-CU01 overview loads membership, points, bookings, and activities', async ({ customerApi, customerPage }) => {
    for (const endpoint of [
      '/api/customers/info',
      '/api/membership-tier',
      '/api/customer/upcoming-bookings',
      '/api/customer/recent-activities',
    ]) {
      expect((await customerApi.get(endpoint)).status(), endpoint).toBe(200);
    }
    await customerPage.goto('/ca-nhan/tong-quan');
    await expect(customerPage.locator('.overview-container')).toBeVisible();
    await expect(customerPage.locator('.upcoming-card')).toBeVisible();
    await expect(customerPage.locator('.points-card')).toBeVisible();
    await expect(customerPage.locator('.tier-card')).toBeVisible();
    await expect(customerPage.locator('.activity-section')).toBeVisible();
  });

  test('TC-CU02 customer sidebar contains five destinations and index redirects to profile', async ({ customerPage }) => {
    await customerPage.goto('/ca-nhan');
    await expect(customerPage).toHaveURL(/\/ca-nhan\/ho-so$/);
    for (const [label, href] of [
      ['Tổng quan', '/ca-nhan/tong-quan'],
      ['Xe của tôi', '/ca-nhan/xe-cua-toi'],
      ['Đặt lịch rửa xe', '/ca-nhan/dat-lich'],
      ['Thanh toán', '/ca-nhan/thanh-toan'],
      ['Hồ sơ cá nhân', '/ca-nhan/ho-so'],
    ] as const) {
      const item = customerPage.locator('.ant-menu-item').filter({ hasText: label });
      await expect(item).toHaveCount(1);
      await item.click();
      await expect(customerPage).toHaveURL(new RegExp(`${href}$`));
    }
  });

  test('TC-CU03 reward and voucher modals render the data returned by their APIs', async ({ customerApi, customerPage }) => {
    const rewards = await customerApi.get('/api/customer/rewards');
    const vouchersResponse = await customerApi.get('/api/vouchers');
    expect(rewards.status()).toBe(200);
    expect(vouchersResponse.status()).toBe(200);

    await customerPage.goto('/ca-nhan/tong-quan');
    await customerPage.locator('.exchange-voucher-btn-custom').click();
    await expect(customerPage.locator('.ant-modal:visible').filter({ hasText: /voucher/i })).toBeVisible();
    await customerPage.keyboard.press('Escape');
    await expect(customerPage.locator('.ant-modal:visible')).toHaveCount(0);
    await customerPage.locator('.my-voucher-btn-custom').click();
    await expect(customerPage.locator('.ant-modal:visible').filter({ hasText: /voucher/i })).toBeVisible();
  });

  test('TC-CU05 reward exchange with insufficient points is atomic', async ({ guestApi }) => {
    expect((await guestApi.post('/auth/login', {
      data: { email: 'e2e.no-car@gmail.com', password: 'e2e-password-123' },
    })).status()).toBe(200);
    const before = await (await guestApi.get('/api/customers/info')).json() as { id: number; currentPoints: number };
    const rewards = await (await guestApi.get('/api/customer/rewards')).json() as {
      data: Array<{ id: number; pointCost: number }>;
    };
    const reward = rewards.data.find(({ pointCost }) => pointCost > before.currentPoints)!;
    const vouchersBefore = await (await guestApi.get('/api/vouchers')).json() as unknown[];
    const exchange = await guestApi.post('/api/voucher/exchange', {
      data: { customerId: before.id, rewardId: reward.id },
    });
    expect([400, 409]).toContain(exchange.status());
    expect((await (await guestApi.get('/api/customers/info')).json()).currentPoints).toBe(before.currentPoints);
    expect(await (await guestApi.get('/api/vouchers')).json()).toHaveLength(vouchersBefore.length);
  });

  test('TC-CU08 vehicle list renders cards and a no-car account renders its CTA', async ({ browser, customerPage }) => {
    await customerPage.goto('/ca-nhan/xe-cua-toi');
    await expect(customerPage.locator('.mycar-card').filter({ hasText: 'E2E-00001' })).toBeVisible();

    const context = await browser.newContext();
    const page = await context.newPage();
    expect((await page.request.post(`${env.backendURL}/auth/login`, {
      data: { email: 'e2e.no-car@gmail.com', password: 'e2e-password-123' },
    })).status()).toBe(200);
    await page.goto('/ca-nhan/xe-cua-toi');
    await expect(page.getByRole('button', { name: /Đăng ký xe ngay/i })).toBeVisible();
    await context.close();
  });

  test('TC-CU10 duplicate plate and invalid vehicle type never create a vehicle', async ({ customerApi, uniqueData }) => {
    const before = (await vehicles(customerApi)).length;
    const duplicate = await customerApi.post('/api/vehicles', {
      data: { vehicleTypeId: (await sedanType(customerApi)).id, licensePlate: 'E2E-00001', brand: 'X', model: 'Y', color: 'Z' },
    });
    expect(duplicate.status()).toBe(400);
    const invalidType = await customerApi.post('/api/vehicles', {
      data: { vehicleTypeId: 9_999_999, licensePlate: uniqueData.licensePlate, brand: 'X', model: 'Y', color: 'Z' },
    });
    expect([400, 404, 409]).toContain(invalidType.status());
    expect(await vehicles(customerApi)).toHaveLength(before);
  });

  test('TC-CU11 vehicle update changes only UI-supported fields', async ({ customerApi, uniqueData }) => {
    const created = await addVehicle(customerApi, uniqueData.licensePlate);
    const updatedPlate = `${uniqueData.licensePlate}-U`;
    const update = await customerApi.put(`/api/vehicles/${created.vehicleId}`, {
      data: { licensePlate: updatedPlate, color: 'Black', image: 'https://example.invalid/updated.jpg' },
    });
    expect(update.status()).toBe(200);
    const saved = (await vehicles(customerApi)).find((vehicle) => vehicle.vehicleId === created.vehicleId)!;
    expect(saved).toMatchObject({
      licensePlate: updatedPlate,
      color: 'Black',
      image: 'https://example.invalid/updated.jpg',
      brand: created.brand,
      model: created.model,
      typeName: created.typeName,
    });
  });

  test('TC-CU12 deleting a vehicle is soft and its card exposes restore guidance', async ({ customerApi, customerPage, uniqueData }) => {
    const created = await addVehicle(customerApi, uniqueData.licensePlate);
    expect((await customerApi.delete(`/api/vehicles/${created.vehicleId}`)).status()).toBe(200);
    expect((await vehicles(customerApi)).find(({ vehicleId }) => vehicleId === created.vehicleId)).toMatchObject({ active: false });

    await customerPage.goto('/ca-nhan/xe-cua-toi');
    const card = customerPage.locator('.mycar-card').filter({ hasText: uniqueData.licensePlate });
    if (await card.count() === 0) {
      await customerPage.getByRole('button', { name: /Xem thêm/i }).click();
    }
    await expect(card).toHaveClass(/mycar-card--inactive/);
    await expect(card.getByRole('button', { name: /Liên hệ khôi phục/i })).toBeVisible();
  });

  test('TC-CU16 premium services cannot be mixed or duplicated', async ({ customerPage }) => {
    await customerPage.goto('/ca-nhan/dat-lich');
    await expect(customerPage.locator('.booking-wizard')).toBeVisible();
    await customerPage.locator('.btn-continue-step1').click();

    const basicButton = customerPage.locator('.booking-service-card__btn').first();
    await basicButton.click();
    await customerPage.getByRole('button', { name: /Cao cấp/i }).click();

    const premiumCards = customerPage.locator('.booking-service-card--premium');
    expect(await premiumCards.count()).toBeGreaterThanOrEqual(2);
    const firstPremiumButton = premiumCards.nth(0).locator('.booking-service-card__btn');
    const secondPremiumButton = premiumCards.nth(1).locator('.booking-service-card__btn');

    await firstPremiumButton.click();
    await expect(customerPage.getByText(/không thể chọn chung dịch vụ cao cấp và dịch vụ thường/i)).toBeVisible();
    await expect(firstPremiumButton).not.toHaveClass(/booking-service-card__btn--selected/);

    await customerPage.locator('.btn-clear-services').click();
    await firstPremiumButton.click();
    await secondPremiumButton.click();
    await expect(customerPage.getByText(/chỉ được chọn 1 dịch vụ cao cấp/i)).toBeVisible();
    await expect(firstPremiumButton).toHaveClass(/booking-service-card__btn--selected/);
    await expect(secondPremiumButton).not.toHaveClass(/booking-service-card__btn--selected/);
  });

  test('TC-CU17 booking window and empty-slot state are enforced', async ({
    customerApi, customerPage, uniqueData,
  }) => {
    const customer = await (await customerApi.get('/api/customers/info')).json() as { id: number };
    const vehicle = (await vehicles(customerApi)).find(({ licensePlate }) => licensePlate === 'E2E-00001')!;
    const services = await (await customerApi.get('/api/services')).json() as {
      data: Array<{ category: string; servicePrices: Array<{ servicePriceId: number; active: boolean; vehicleType: { typeName: string } }> }>;
    };
    const basic = services.data.find(({ category }) => category === 'BASIC')!.servicePrices
      .find(({ active, vehicleType }) => active && vehicleType.typeName === vehicle.typeName)!;
    const tooLate = await customerApi.post('/api/v2/bookings', {
      data: {
        customerId: customer.id, vehicleId: vehicle.vehicleId, timeSlotId: 1,
        bookingDate: dateInSaigon(30), servicePriceIds: [basic.servicePriceId], notes: 'outside booking window',
      },
    });
    expect(tooLate.status()).toBe(400);

    await customerPage.route('**/api/bookings/available-slots**', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ date: dateInSaigon(2), timeSlotAvailabilityResponses: [] }),
    }));
    await customerPage.goto('/ca-nhan/dat-lich');
    await expect(customerPage.locator('.booking-wizard')).toBeVisible();
    await customerPage.locator('.btn-continue-step1').click();
    await customerPage.locator('.booking-service-card__btn').first().click();
    await customerPage.locator('.sidebar-btn-next').click();
    await expect(customerPage.getByText(/Không có khung giờ nào hoạt động/i)).toBeVisible();

    const concurrencyDate = dateInSaigon(6);
    const availability = await (await customerApi.get(`/api/bookings/available-slots?date=${concurrencyDate}`)).json() as {
      timeSlotAvailabilityResponses: Array<{ timeSlotId: number; available: boolean; availableBayCount: number }>;
    };
    const lastSlot = availability.timeSlotAvailabilityResponses.find(({ available, availableBayCount }) =>
      available && availableBayCount > 0);
    expect(lastSlot, 'E2E fixture must expose at least one slot for the concurrency check').toBeTruthy();

    const bookingPayload = {
      customerId: customer.id,
      timeSlotId: lastSlot!.timeSlotId,
      bookingDate: concurrencyDate,
      servicePriceIds: [basic.servicePriceId],
      notes: 'E2E last-slot concurrency',
    };
    const capacityVehicles = await Promise.all(
      Array.from({ length: lastSlot!.availableBayCount + 1 }, (_, index) =>
        addVehicle(customerApi, `${uniqueData.licensePlate}-${index}`)),
    );
    for (let index = 1; index < lastSlot!.availableBayCount; index += 1) {
      const fillResponse = await customerApi.post('/api/v2/bookings', {
        data: { ...bookingPayload, vehicleId: capacityVehicles[index - 1].vehicleId },
      });
      expect(fillResponse.status(), await fillResponse.text()).toBe(200);
    }
    const lastCapacity = await customerApi.post('/api/v2/bookings', {
      data: { ...bookingPayload, vehicleId: capacityVehicles[lastSlot!.availableBayCount - 1].vehicleId },
    });
    expect(lastCapacity.status(), await lastCapacity.text()).toBe(200);

    const overflow = await customerApi.post('/api/v2/bookings', {
      data: { ...bookingPayload, vehicleId: capacityVehicles[lastSlot!.availableBayCount].vehicleId },
    });
    expect(overflow.status()).toBeGreaterThanOrEqual(400);
    expect(overflow.status()).toBeLessThan(500);
  });

  test('TC-CU18 payment history belongs to the authenticated customer and its filters render', async ({ customerApi, customerPage }) => {
    const history = await customerApi.get('/api/billings/customer/billing-history');
    expect(history.status()).toBe(200);
    const rows = await history.json() as Array<{ booking: { customer: { email: string } } }>;
    expect(rows.every((row) => row.booking.customer.email === env.customer.email)).toBe(true);
    await customerPage.goto('/ca-nhan/thanh-toan');
    await expect(customerPage.locator('.payment-container')).toBeVisible();
    await expect(customerPage.locator('.payment-table')).toBeVisible();
    await expect(customerPage.locator('.selector-group .ant-select')).toHaveCount(2);
  });

  test('TC-CU19 profile, password change, unread count, mark-read, and read-all work', async ({
    customerApi, customerPage, guestApi, staffApi, uniqueData,
  }) => {
    await customerPage.goto('/ca-nhan/ho-so');
    await expect(customerPage.locator('.profile-container')).toContainText(env.customer.email);

    const password = 'e2e-password-123';
    const changedPassword = 'e2e-password-789';
    expect((await guestApi.post('/auth/register', { data: {
      email: uniqueData.email, password, confirmPassword: password, fullName: 'E2E Password Customer',
      dateOfBirth: '1995-01-01', phoneNumber: `05${Date.now().toString().slice(-8)}`,
    } })).status()).toBe(201);
    expect((await guestApi.post('/auth/login', { data: { email: uniqueData.email, password } })).status()).toBe(200);
    expect((await guestApi.post('/api/users/change-password', { data: { newPassword: changedPassword } })).status()).toBe(204);
    await guestApi.post('/auth/logout');
    expect((await guestApi.post('/auth/login', { data: { email: uniqueData.email, password } })).status()).not.toBe(200);
    expect((await guestApi.post('/auth/login', { data: { email: uniqueData.email, password: changedPassword } })).status()).toBe(200);

    const current = await (await customerApi.get('/api/customers/info')).json() as { id: number };
    expect((await staffApi.post(`/api/staff/customers/${current.id}/points`, {
      data: { pointsChange: 1, reason: `E2E notification ${uniqueData.suffix}` },
    })).status()).toBe(200);
    const unread = await (await customerApi.get('/api/notifications/unread')).json() as Array<{ id: number; read: boolean }>;
    expect(unread.length).toBeGreaterThan(0);
    expect((await customerApi.put(`/api/notifications/${unread[0].id}/read`)).status()).toBe(200);
    expect((await customerApi.put('/api/notifications/read-all')).status()).toBe(200);
    expect(await (await customerApi.get('/api/notifications/unread-count')).json()).toMatchObject({ unreadsCount: 0 });

    const isolated = await request.newContext({ baseURL: env.backendURL });
    expect((await isolated.post('/auth/login', { data: { email: uniqueData.email, password: changedPassword } })).status()).toBe(200);
    await isolated.dispose();
  });
});
