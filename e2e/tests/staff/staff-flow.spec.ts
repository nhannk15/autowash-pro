import { expect, test } from '../../fixtures/index.js';
import type { APIRequestContext } from '@playwright/test';
import { createHmac } from 'node:crypto';

type StaffCustomer = {
  id: number;
  fullName: string;
  phoneNumber: string;
  currentPoints: number;
  vehicles: Array<{
    id: number;
    licensePlate: string;
    vehicleType: { typeName: string };
  }>;
};
type StaffBooking = {
  id: number;
  bookingCode: string;
  status: string;
  vehicleLicensePlate: string;
};

function dateInSaigon(daysFromNow: number) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(Date.now() + daysFromNow * 86_400_000));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

async function seededCustomer(staffApi: APIRequestContext) {
  const response = await staffApi.get('/api/staff/customers/search?phone=0900000000');
  expect(response.status()).toBe(200);
  const body = await response.json() as { data: StaffCustomer };
  expect(body.data.fullName).toBe('E2E Customer');
  return body.data;
}

async function createWalkIn(staffApi: APIRequestContext, daysFromNow: number, notes: string) {
  const customer = await seededCustomer(staffApi);
  const vehicle = customer.vehicles.find(({ licensePlate }) => licensePlate === 'E2E-00001')!;
  const services = await (await staffApi.get('/api/services')).json() as {
    data: Array<{
      category: string;
      servicePrices: Array<{
        servicePriceId: number;
        active: boolean;
        vehicleType: { typeName: string };
      }>;
    }>;
  };
  const price = services.data.find(({ category }) => category === 'BASIC')!.servicePrices
    .find(({ active, vehicleType }) => active && vehicleType.typeName === vehicle.vehicleType.typeName)!;
  const bookingDate = dateInSaigon(daysFromNow);
  const slotsResponse = await staffApi.get(`/api/bookings/available-slots?date=${bookingDate}`);
  expect(slotsResponse.status()).toBe(200);
  const slots = await slotsResponse.json() as {
    timeSlotAvailabilityResponses: Array<{ timeSlotId: number; available: boolean }>;
  };
  const slot = slots.timeSlotAvailabilityResponses.find(({ available }) => available)!;

  const create = await staffApi.post('/api/bookings', {
    data: {
      customerId: customer.id,
      vehicleId: vehicle.id,
      timeSlotId: slot.timeSlotId,
      bookingDate,
      servicePriceIds: [price.servicePriceId],
      notes,
      walkIn: true,
    },
  });
  expect(create.status(), await create.text()).toBe(200);
  return { customer, booking: await create.json() as StaffBooking };
}

async function billingFor(staffApi: APIRequestContext, bookingId: number) {
  const response = await staffApi.post('/api/billings', { data: [bookingId] });
  expect(response.status()).toBe(200);
  const billings = await response.json() as Array<{
    billingId: number;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    depositAmount: number;
    paymentStatus: string;
    depositStatus: string;
  }>;
  expect(billings).toHaveLength(1);
  return billings[0];
}

async function start(staffApi: APIRequestContext, bookingId: number) {
  const staff = await (await staffApi.get('/api/staff/info')).json() as { id: number };
  const response = await staffApi.post(`/api/staff/v2/wash-sessions/start?staffId=${staff.id}`, {
    data: { bookingId },
  });
  expect(response.status(), await response.text()).toBe(200);
  return response.json() as Promise<Array<{
    bookingId: number;
    staffId: number;
    washSessionStatus: string;
    washBay: string;
  }>>;
}

async function complete(staffApi: APIRequestContext, bookingId: number) {
  const response = await staffApi.post('/api/staff/v2/wash-sessions/complete', {
    data: { bookingId },
  });
  expect(response.status(), await response.text()).toBe(200);
  return response.json() as Promise<Array<{ washSessionStatus: string }>>;
}

async function cash(staffApi: APIRequestContext, bookingId: number) {
  const billing = await billingFor(staffApi, bookingId);
  const response = await staffApi.post('/api/billings/complete/cash', { data: billing.billingId });
  expect(response.status(), await response.text()).toBe(200);
  return { billing, response: await response.json() as { paymentStatus: string; pointsChange: number } };
}

async function cleanupSession(staffApi: APIRequestContext, bookingId: number) {
  await complete(staffApi, bookingId);
  await cash(staffApi, bookingId);
}

test.describe('@p0 staff wash flow', () => {
  test('TC-ST02 finds an existing customer and creates a walk-in booking', async ({ staffApi }) => {
    const { customer, booking } = await createWalkIn(staffApi, 1, 'E2E existing walk-in');
    expect(customer.vehicles).toContainEqual(expect.objectContaining({ licensePlate: 'E2E-00001' }));
    expect(booking).toMatchObject({
      status: 'CONFIRMED',
      vehicleLicensePlate: 'E2E-00001',
    });
  });

  test('TC-ST03 quick-creates a unique walk-in customer and vehicle', async ({ staffApi, uniqueData }) => {
    const types = await (await staffApi.get('/api/vehicle-types')).json() as Array<{
      id: number;
      typeName: string;
      active: boolean;
    }>;
    const sedan = types.find(({ typeName, active }) => typeName === 'SEDAN' && active)!;
    const phoneNumber = `09${uniqueData.suffix.replace(/\D/g, '').slice(-8).padStart(8, '0')}`;
    const create = await staffApi.post('/api/staff/customers/quick-create', {
      data: {
        fullName: 'E2E Walk In',
        phoneNumber,
        email: uniqueData.email,
        dateOfBirth: '1994-02-03',
        vehicleTypeId: sedan.id,
        licensePlate: uniqueData.licensePlate,
        brand: 'Kia',
        model: 'Seltos E2E',
        color: 'Gray',
      },
    });
    expect(create.status(), await create.text()).toBe(200);
    const created = await create.json() as {
      data: { customerId: number; vehicleId: number; phoneNumber: string; licensePlate: string };
    };
    expect(created.data).toMatchObject({ phoneNumber, licensePlate: uniqueData.licensePlate });

    const search = await staffApi.get(`/api/staff/customers/search?phone=${phoneNumber}`);
    expect(search.status()).toBe(200);
    const customer = await search.json() as { data: StaffCustomer };
    expect(customer.data).toMatchObject({ id: created.data.customerId, fullName: 'E2E Walk In' });
    expect(customer.data.vehicles).toContainEqual(expect.objectContaining({
      id: created.data.vehicleId,
      licensePlate: uniqueData.licensePlate,
    }));
  });

  test('TC-ST05 checks in by booking code using the authenticated staff identity', async ({ staffApi }) => {
    const { booking } = await createWalkIn(staffApi, 2, 'E2E check-in');
    const lookup = await staffApi.get(`/api/bookings/booking-code?bookingCode=${booking.bookingCode}`);
    expect(lookup.status()).toBe(200);
    expect(await lookup.json()).toMatchObject({ id: booking.id, bookingCode: booking.bookingCode });

    const staff = await (await staffApi.get('/api/staff/info')).json() as { id: number };
    const sessions = await start(staffApi, booking.id);
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        bookingId: booking.id,
        staffId: staff.id,
        washSessionStatus: 'IN_PROGRESS',
      }),
    ]));
    await cleanupSession(staffApi, booking.id);
  });

  test('TC-ST08 completes a session and exposes its bay as waiting for payment', async ({ staffApi, customerApi }) => {
    const { booking } = await createWalkIn(staffApi, 3, 'E2E complete session');
    await start(staffApi, booking.id);
    const sessions = await complete(staffApi, booking.id);
    expect(sessions.every(({ washSessionStatus }) => washSessionStatus === 'COMPLETED')).toBe(true);

    const bays = await (await staffApi.get('/api/staff/wash-bays')).json() as Array<{
      currentSession: { bookingId: number; status: string } | null;
    }>;
    expect(bays).toContainEqual(expect.objectContaining({
      currentSession: expect.objectContaining({ bookingId: booking.id, status: 'COMPLETED' }),
    }));
    const customerBookings = await (await customerApi.get('/api/customer/all-bookings')).json() as Array<{
      bookingCode: string;
      status: string;
    }>;
    expect(customerBookings.find(({ bookingCode }) => bookingCode === booking.bookingCode)).toMatchObject({
      status: 'COMPLETED',
    });
    await cash(staffApi, booking.id);
  });

  test('TC-ST09 opens the exact completed booking billing from Dashboard', async ({ staffApi, staffPage }) => {
    const { booking } = await createWalkIn(staffApi, 4, 'E2E dashboard payment navigation');
    const sessions = await start(staffApi, booking.id);
    await complete(staffApi, booking.id);

    const billingRequest = staffPage.waitForRequest((request) =>
      request.url().includes('/api/billings') && request.method() === 'POST');
    await staffPage.goto('/staff/dashboard');
    const bay = staffPage.getByText(sessions[0].washBay, { exact: true })
      .locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " bay-card ")][1]');
    await expect(bay).toBeVisible();
    await bay.locator('.bay-card__payment-btn').click();
    await expect(staffPage).toHaveURL(/\/staff\/payment$/);
    expect((await billingRequest).postDataJSON()).toEqual([booking.id]);
    await expect(staffPage.getByText('E2E-00001', { exact: false })).toBeVisible();
    await cash(staffApi, booking.id);
  });

  test('TC-ST10 applies a valid voucher once and rejects invalid or used codes', async ({
    customerApi,
    staffApi,
  }) => {
    const { customer, booking } = await createWalkIn(staffApi, 5, 'E2E counter voucher');
    await start(staffApi, booking.id);
    await complete(staffApi, booking.id);
    const rewardResponse = await customerApi.get('/api/customer/rewards');
    const rewards = await rewardResponse.json() as { data: Array<{ id: number; rewardType: string }> };
    const reward = rewards.data.find(({ rewardType }) => rewardType === 'DISCOUNT_FLAT')!;
    const exchange = await customerApi.post('/api/voucher/exchange', {
      data: { customerId: customer.id, rewardId: reward.id },
    });
    expect(exchange.status()).toBe(200);
    const voucher = await exchange.json() as { voucherCode: string };
    const before = await billingFor(staffApi, booking.id);

    const invalid = await staffApi.post('/api/billings/apply-voucher', {
      data: { customerId: customer.id, billingId: before.billingId, voucherCode: 'NOT-A-VOUCHER' },
    });
    expect(invalid.status()).toBe(400);
    const apply = await staffApi.post('/api/billings/apply-voucher', {
      data: { customerId: customer.id, billingId: before.billingId, voucherCode: voucher.voucherCode },
    });
    expect(apply.status(), await apply.text()).toBe(200);
    const after = await billingFor(staffApi, booking.id);
    expect(Number(after.finalAmount)).toBeLessThan(Number(before.finalAmount));

    const reuse = await staffApi.post('/api/billings/apply-voucher', {
      data: { customerId: customer.id, billingId: before.billingId, voucherCode: voucher.voucherCode },
    });
    expect(reuse.status()).toBe(400);
    await cash(staffApi, booking.id);
  });

  test('TC-ST11 cash payment is idempotent and awards points exactly once', async ({ staffApi }) => {
    const { booking } = await createWalkIn(staffApi, 6, 'E2E idempotent cash');
    await start(staffApi, booking.id);
    await complete(staffApi, booking.id);
    const pointsBefore = (await seededCustomer(staffApi)).currentPoints;
    const first = await cash(staffApi, booking.id);
    expect(first.response.paymentStatus).toBe('PAID');
    expect(first.response.pointsChange).toBeGreaterThan(0);
    expect((await seededCustomer(staffApi)).currentPoints).toBe(pointsBefore + first.response.pointsChange);

    const repeated = await staffApi.post('/api/billings/complete/cash', { data: first.billing.billingId });
    expect(repeated.status()).toBe(200);
    expect(await repeated.json()).toMatchObject({ paymentStatus: 'PAID', pointsChange: 0 });
    expect((await seededCustomer(staffApi)).currentPoints).toBe(pointsBefore + first.response.pointsChange);
    const bays = await (await staffApi.get('/api/staff/wash-bays')).json() as Array<{
      currentSession: { bookingId: number } | null;
    }>;
    expect(bays.some(({ currentSession }) => currentSession?.bookingId === booking.id)).toBe(false);
  });
});

function signedVnpayQuery(params: Record<string, string>) {
  const encode = (value: string) => encodeURIComponent(value).replace(/%20/g, '+');
  const hashData = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${encode(value)}`)
    .join('&');
  const signature = createHmac('sha512', 'e2e-vnpay-secret').update(hashData).digest('hex');
  return `${hashData}&vnp_SecureHash=${signature}`;
}

test.describe.serial('@p1 staff supporting flows', () => {
  test('TC-ST01 dashboard loads bays, today bookings, and upcoming bookings', async ({ staffApi, staffPage }) => {
    for (const endpoint of ['/api/staff/wash-bays', '/api/staff/today-bookings', '/api/staff/upcoming-bookings']) {
      expect((await staffApi.get(endpoint)).status(), endpoint).toBe(200);
    }
    await staffPage.goto('/staff/dashboard');
    await expect(staffPage.locator('.dashboard__stats-row')).toBeVisible();
    await expect(staffPage.locator('.dashboard__bays-card')).toBeVisible();
    await expect(staffPage.locator('.bay-card').first()).toBeVisible();
  });

  test('TC-ST04 walk-in validation rejects malformed customer and invalid slot data', async ({ staffApi, uniqueData }) => {
    const invalidCustomer = await staffApi.post('/api/staff/customers/quick-create', {
      data: { fullName: '', phoneNumber: '123', email: 'bad', licensePlate: '', vehicleTypeId: null },
    });
    expect([400, 409]).toContain(invalidCustomer.status());

    const customer = await seededCustomer(staffApi);
    const vehicle = customer.vehicles[0];
    const invalidBooking = await staffApi.post('/api/bookings', {
      data: {
        customerId: customer.id,
        vehicleId: vehicle.id,
        timeSlotId: 9_999_999,
        bookingDate: dateInSaigon(2),
        servicePriceIds: [],
        notes: `invalid walk-in ${uniqueData.suffix}`,
        walkIn: true,
      },
    });
    expect([400, 404]).toContain(invalidBooking.status());
  });

  test.skip('TC-ST06 wrong or already checked-in booking code cannot create another session', async ({ staffApi }) => {
    const missing = await staffApi.get('/api/bookings/booking-code?bookingCode=E2E-NOT-FOUND');
    expect([400, 404]).toContain(missing.status());

    const { booking } = await createWalkIn(staffApi, 6, 'E2E duplicate check-in');
    await start(staffApi, booking.id);
    const staff = await (await staffApi.get('/api/staff/info')).json() as { id: number };
    const duplicate = await staffApi.post(`/api/staff/v2/wash-sessions/start?staffId=${staff.id}`, {
      data: { bookingId: booking.id },
    });
    expect(duplicate.status()).toBe(400);
    await cleanupSession(staffApi, booking.id);
  });

  test('TC-ST07 QR scanner UI retains manual booking-code fallback', async ({ staffPage }) => {
    await staffPage.goto('/staff/checkin');
    await expect(staffPage.locator('.qr-scan-card')).toBeVisible();
    await expect(staffPage.locator('input[placeholder*="nhập mã đặt lịch"]')).toBeVisible();
    await expect(staffPage.locator('.camera-btn').first()).toBeVisible();
  });

  test('TC-ST12 signed VNPay failure does not pay and success is idempotent', async ({ staffApi, uniqueData }) => {
    const { booking, customer } = await createWalkIn(staffApi, 6, `E2E VNPay ${uniqueData.suffix}`);
    await start(staffApi, booking.id);
    await complete(staffApi, booking.id);
    const initial = await billingFor(staffApi, booking.id);
    const beforePoints = customer.currentPoints;
    const transactionReference = `${initial.billingId}_${Date.now()}12`;

    const failedQuery = signedVnpayQuery({
      vnp_TransactionNo: `FAIL${uniqueData.suffix.replace(/\D/g, '').slice(-8)}`,
      vnp_TransactionStatus: '01',
      vnp_TxnRef: transactionReference,
    });
    const failed = await staffApi.get(`/api/payment/vnpay/return?${failedQuery}`, { maxRedirects: 0 });
    expect(failed.status()).toBe(302);
    expect((await billingFor(staffApi, booking.id)).paymentStatus).toBe('PENDING');

    const successQuery = signedVnpayQuery({
      vnp_TransactionNo: `OK${uniqueData.suffix.replace(/\D/g, '').slice(-8)}`,
      vnp_TransactionStatus: '00',
      vnp_TxnRef: transactionReference,
    });
    expect((await staffApi.get(`/api/payment/vnpay/return?${successQuery}`, { maxRedirects: 0 })).status()).toBe(302);
    const paid = await billingFor(staffApi, booking.id);
    expect(paid.paymentStatus).toBe('PAID');
    const afterFirst = (await seededCustomer(staffApi)).currentPoints;
    expect(afterFirst).toBeGreaterThanOrEqual(beforePoints);

    expect((await staffApi.get(`/api/payment/vnpay/return?${successQuery}`, { maxRedirects: 0 })).status()).toBe(302);
    expect((await seededCustomer(staffApi)).currentPoints).toBe(afterFirst);
  });

  test('TC-ST13 payment releases the wash bay and removes its current session', async ({ staffApi }) => {
    const { booking } = await createWalkIn(staffApi, 6, 'E2E bay release');
    const sessions = await start(staffApi, booking.id);
    const bayName = sessions[0].washBay;
    await cleanupSession(staffApi, booking.id);
    const bays = await (await staffApi.get('/api/staff/wash-bays')).json() as Array<{
      bayName?: string;
      name?: string;
      status: string;
      currentSession: { bookingId: number } | null;
    }>;
    const released = bays.find((bay) => bay.bayName === bayName || bay.name === bayName);
    expect(released?.currentSession ?? null).toBeNull();
    expect(released?.status).not.toBe('OCCUPIED');
  });

  test('TC-ST14 queue and history expose search, status filter, and detail actions', async ({ staffPage }) => {
    await staffPage.goto('/staff/queue');
    await expect(staffPage.locator('.queue-card')).toBeVisible();
    await expect(staffPage.locator('.queue-search-input')).toBeVisible();
    await expect(staffPage.locator('.queue-filter-select')).toBeVisible();

    await staffPage.goto('/staff/history');
    await expect(staffPage.locator('.history-card')).toBeVisible();
    await expect(staffPage.locator('.history-search-input')).toBeVisible();
    const detail = staffPage.getByRole('button', { name: /Chi tiết/i }).first();
    if (await detail.count()) {
      await detail.click();
      await expect(staffPage.locator('.ant-modal')).toBeVisible();
    }
  });
});
