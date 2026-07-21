import { expect, test } from '../../fixtures/index.js';
import type { APIRequestContext } from '@playwright/test';

type Customer = { id: number; currentPoints: number };
type Reward = {
  id: number;
  rewardName: string;
  rewardType: string;
  pointCost: number;
  discountValue: number;
};
type Vehicle = {
  vehicleId: number;
  typeName: string;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  active: boolean;
};
type Booking = {
  id: number;
  bookingCode: string;
  status: string;
  totalOriginalPrice: number;
  totalDiscount: number;
  totalFinalPrice: number;
  depositAmount: number;
};

function dateInSaigon(daysFromNow: number) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(Date.now() + daysFromNow * 86_400_000));
  const value = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${value.year}-${value.month}-${value.day}`;
}

async function customerInfo(api: APIRequestContext) {
  const response = await api.get('/api/customers/info');
  expect(response.status()).toBe(200);
  return response.json() as Promise<Customer>;
}

async function activeRewards(api: APIRequestContext) {
  const response = await api.get('/api/customer/rewards');
  expect(response.status()).toBe(200);
  const body = await response.json() as { data: Reward[] };
  return body.data;
}

async function activeVouchers(api: APIRequestContext) {
  const response = await api.get('/api/vouchers');
  expect(response.status()).toBe(200);
  return response.json() as Promise<Array<{
    voucherCode: string;
    status: string;
    reward: Reward;
  }>>;
}

async function exchangeReward(api: APIRequestContext, reward: Reward) {
  const customer = await customerInfo(api);
  const response = await api.post('/api/voucher/exchange', {
    data: { customerId: customer.id, rewardId: reward.id },
  });
  expect(response.status()).toBe(200);
  return response.json() as Promise<{ voucherCode: string }>;
}

async function createBasicBooking(
  api: APIRequestContext,
  daysFromNow: number,
  options: { promotionId?: number; voucherCode?: string; notes: string },
) {
  const customer = await customerInfo(api);
  const vehiclesResponse = await api.get('/api/vehicles/user');
  expect(vehiclesResponse.status()).toBe(200);
  const vehicles = await vehiclesResponse.json() as { data: Vehicle[] };
  const vehicle = vehicles.data.find(({ licensePlate }) => licensePlate === 'E2E-00001')!;

  const servicesResponse = await api.get('/api/services');
  expect(servicesResponse.status()).toBe(200);
  const services = await servicesResponse.json() as {
    data: Array<{
      category: string;
      servicePrices: Array<{
        servicePriceId: number;
        active: boolean;
        vehicleType: { typeName: string };
      }>;
    }>;
  };
  const price = services.data
    .find(({ category }) => category === 'BASIC')!
    .servicePrices.find(({ active, vehicleType }) => active && vehicleType.typeName === vehicle.typeName)!;

  const bookingDate = dateInSaigon(daysFromNow);
  const slotsResponse = await api.get(`/api/bookings/available-slots?date=${bookingDate}`);
  expect(slotsResponse.status()).toBe(200);
  const slots = await slotsResponse.json() as {
    timeSlotAvailabilityResponses: Array<{
      timeSlotId: number;
      startTime: string;
      available: boolean;
    }>;
  };
  const slot = slots.timeSlotAvailabilityResponses.find(({ available }) => available)!;
  expect(slot).toBeTruthy();

  const response = await api.post('/api/v2/bookings', {
    data: {
      customerId: customer.id,
      vehicleId: vehicle.vehicleId,
      timeSlotId: slot.timeSlotId,
      bookingDate,
      servicePriceIds: [price.servicePriceId],
      notes: options.notes,
      promotionId: options.promotionId,
      voucherCode: options.voucherCode,
    },
  });
  expect(response.status()).toBe(200);
  return response.json() as Promise<Booking>;
}

test.describe.serial('@p0 customer account and payment', () => {
  test('TC-CU04 exchanges one reward, deducts points once, and records the transaction', async ({
    customerApi,
  }) => {
    const before = await customerInfo(customerApi);
    const rewards = await activeRewards(customerApi);
    const reward = rewards.find(({ rewardType }) => rewardType === 'DISCOUNT_FLAT')!;
    const vouchersBefore = await activeVouchers(customerApi);
    const activitiesBefore = await (await customerApi.get('/api/customer/recent-activities')).json() as unknown[];

    const exchanged = await exchangeReward(customerApi, reward);

    const after = await customerInfo(customerApi);
    expect(after.currentPoints).toBe(before.currentPoints - reward.pointCost);
    const vouchersAfter = await activeVouchers(customerApi);
    expect(vouchersAfter).toHaveLength(vouchersBefore.length + 1);
    expect(vouchersAfter).toContainEqual(expect.objectContaining({
      voucherCode: exchanged.voucherCode,
      status: 'ACTIVE',
      reward: expect.objectContaining({ id: reward.id }),
    }));
    const activitiesAfter = await (await customerApi.get('/api/customer/recent-activities')).json() as Array<{
      transactionType: string;
      pointsChange: number;
    }>;
    expect(activitiesAfter).toHaveLength(activitiesBefore.length + 1);
    expect(activitiesAfter).toContainEqual(expect.objectContaining({
      transactionType: 'REDEEM',
      pointsChange: reward.pointCost,
    }));
  });

  test('TC-CU09 creates a unique vehicle with all submitted fields', async ({ customerApi, uniqueData }) => {
    const typesResponse = await customerApi.get('/api/vehicle-types');
    expect(typesResponse.status()).toBe(200);
    const types = await typesResponse.json() as Array<{ id: number; typeName: string; active: boolean }>;
    const sedan = types.find(({ typeName, active }) => typeName === 'SEDAN' && active)!;

    const create = await customerApi.post('/api/vehicles', {
      data: {
        vehicleTypeId: sedan.id,
        licensePlate: uniqueData.licensePlate,
        brand: 'Mazda',
        model: 'CX-3 E2E',
        color: 'Blue',
        image: 'https://example.invalid/e2e-car.jpg',
      },
    });
    expect(create.status()).toBe(200);

    const vehicles = await (await customerApi.get('/api/vehicles/user')).json() as { data: Vehicle[] };
    expect(vehicles.data.filter(({ licensePlate }) => licensePlate === uniqueData.licensePlate)).toEqual([
      expect.objectContaining({
        typeName: 'SEDAN',
        brand: 'Mazda',
        model: 'CX-3 E2E',
        color: 'Blue',
        active: true,
      }),
    ]);
  });

  test('TC-CU06 exposes the pending billing ID and creates VNPay for that exact billing', async ({
    customerApi,
  }) => {
    const booking = await createBasicBooking(customerApi, 3, { notes: 'E2E pending deposit' });
    const pendingResponse = await customerApi.get('/api/bookings/pending-deposit');
    expect(pendingResponse.status()).toBe(200);
    const pending = await pendingResponse.json() as Array<{ bookingCode: string; billingId: number }>;
    const item = pending.find(({ bookingCode }) => bookingCode === booking.bookingCode)!;
    expect(item.billingId).toEqual(expect.any(Number));

    const paymentResponse = await customerApi.post('/api/payment/vnpay/create', {
      data: { billingId: item.billingId, orderInfo: `Dat coc lich hen ${booking.bookingCode}` },
    });
    expect(paymentResponse.status()).toBe(200);
    const payment = await paymentResponse.json() as { paymentUrl: string };
    const transactionReference = new URL(payment.paymentUrl).searchParams.get('vnp_TxnRef');
    expect(transactionReference).toMatch(new RegExp(`^${item.billingId}_`));
  });

  test('TC-CU07 cancels a pending booking without creating a refund voucher', async ({ customerApi }) => {
    const booking = await createBasicBooking(customerApi, 4, { notes: 'E2E cancellation' });
    const vouchersBefore = await activeVouchers(customerApi);
    const cancel = await customerApi.post('/api/cancel-booking', {
      data: { bookingCode: booking.bookingCode, cancelReason: 'E2E customer cancellation' },
    });
    expect(cancel.status(), await cancel.text()).toBe(200);

    const bookings = await (await customerApi.get('/api/customer/all-bookings')).json() as Array<{
      bookingCode: string;
      status: string;
      billing: { paymentStatus: string; depositStatus: string; finalAmount: number };
    }>;
    expect(bookings.find(({ bookingCode }) => bookingCode === booking.bookingCode)).toMatchObject({
      status: 'CANCELLED',
      billing: {
        paymentStatus: 'CANCELLED',
        depositStatus: 'CANCELLED',
        finalAmount: 0,
      },
    });
    expect(await activeVouchers(customerApi)).toHaveLength(vouchersBefore.length);
  });

  test('TC-CU15 applies promotion, percentage voucher, and 30 percent deposit consistently', async ({
    customerApi,
  }) => {
    const rewards = await activeRewards(customerApi);
    const reward = rewards.find(({ rewardType }) => rewardType === 'DISCOUNT_PERCENTAGE')!;
    const voucher = await exchangeReward(customerApi, reward);
    const bookingDate = dateInSaigon(5);
    const promotionResponse = await customerApi.post('/api/promotions/applicable-promotions', {
      data: { bookingDateTime: `${bookingDate}T08:00:00` },
    });
    expect(promotionResponse.status()).toBe(200);
    const promotion = await promotionResponse.json() as {
      id: number;
      promotionName: string;
      discountValue: number;
      active: boolean;
    };
    expect(promotion).toMatchObject({ promotionName: 'E2E Active Promotion', active: true });

    const booking = await createBasicBooking(customerApi, 5, {
      promotionId: promotion.id,
      voucherCode: voucher.voucherCode,
      notes: 'E2E promotion voucher deposit',
    });
    const bookings = await (await customerApi.get('/api/customer/all-bookings')).json() as Array<{
      bookingCode: string;
      promotion: { id: number; discountValue: number };
      billing: {
        voucher: { voucherCode: string; discountValue: number };
        originalAmount: number;
        discountAmount: number;
        finalAmount: number;
        depositAmount: number;
        depositStatus: string;
      };
    }>;
    const saved = bookings.find(({ bookingCode }) => bookingCode === booking.bookingCode)!;
    const afterPromotion = Number(booking.totalFinalPrice);
    const deposit = afterPromotion * 0.3;
    const voucherDiscount = (afterPromotion - deposit) * (Number(reward.discountValue) / 100);

    expect(Number(booking.totalDiscount)).toBeCloseTo(
      Number(booking.totalOriginalPrice) * (Number(promotion.discountValue) / 100),
      2,
    );
    expect(Number(saved.billing.originalAmount)).toBeCloseTo(Number(booking.totalOriginalPrice), 2);
    expect(Number(saved.billing.depositAmount)).toBeCloseTo(deposit, 2);
    expect(Number(saved.billing.discountAmount)).toBeCloseTo(
      Number(booking.totalDiscount) + voucherDiscount,
      2,
    );
    expect(Number(saved.billing.finalAmount)).toBeCloseTo(afterPromotion - deposit - voucherDiscount, 2);
    expect(saved).toMatchObject({
      promotion: { id: promotion.id },
      billing: {
        voucher: { voucherCode: voucher.voucherCode },
        depositStatus: 'PENDING',
      },
    });
    expect((await activeVouchers(customerApi)).some(({ voucherCode }) => voucherCode === voucher.voucherCode))
      .toBe(false);
  });
});
