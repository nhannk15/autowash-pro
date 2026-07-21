import { test, expect } from '../../fixtures/index.js';

test.describe.skip('@p0 ownership and untrusted identifiers', () => {
  test('TC-SE11 customer cannot update or delete another customer vehicle', async ({
    adminApi,
    customerApi,
  }) => {
    const customersResponse = await adminApi.get('/api/admin/customers?size=100');
    expect(customersResponse.status()).toBe(200);
    const customers = await customersResponse.json() as {
      data: { content: Array<{ email: string; vehicles: Array<{ id: number }> }> };
    };
    const other = customers.data.content.find(({ email }) => email === 'e2e.other@gmail.com');
    expect(other?.vehicles).toHaveLength(1);
    const vehicleId = other!.vehicles[0].id;

    const update = await customerApi.put(`/api/vehicles/${vehicleId}`, {
      data: { licensePlate: 'E2E-HIJACK', color: 'Red', image: null },
    });
    expect(update.status()).toBe(404);
    expect((await customerApi.delete(`/api/vehicles/${vehicleId}`)).status()).toBe(404);

    const unchanged = await adminApi.get('/api/admin/customers?size=100');
    const unchangedBody = await unchanged.json() as {
      data: { content: Array<{
        email: string;
        vehicles: Array<{ licensePlate: string; active: boolean }>;
      }> };
    };
    const unchangedOther = unchangedBody.data.content.find(({ email }) => email === 'e2e.other@gmail.com');
    expect(unchangedOther!.vehicles[0]).toMatchObject({
      licensePlate: 'E2E-00002',
      active: true,
    });
  });

  test('TC-SE12 customer cannot read, cancel, or pay another customer booking', async ({
    adminApi,
    staffApi,
    customerApi,
  }) => {
    const customers = await (await adminApi.get('/api/admin/customers?size=100')).json() as {
      data: { content: Array<{
        id: number;
        email: string;
        vehicles: Array<{ id: number; vehicleType: { typeName: string } }>;
      }> };
    };
    const other = customers.data.content.find(({ email }) => email === 'e2e.other@gmail.com')!;
    const vehicle = other.vehicles[0];
    const servicesResponse = await (await staffApi.get('/api/services')).json() as {
      data: Array<{
        category: string;
        servicePrices: Array<{
          servicePriceId: number;
          active: boolean;
          vehicleType: { typeName: string };
        }>;
      }>;
    };
    const price = servicesResponse.data
      .find(({ category }) => category === 'BASIC')!
      .servicePrices.find((candidate) =>
        candidate.active && candidate.vehicleType.typeName === vehicle.vehicleType.typeName)!;
    const bookingDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const slots = await (await staffApi.get(`/api/bookings/available-slots?date=${bookingDate}`)).json() as {
      timeSlotAvailabilityResponses: Array<{ timeSlotId: number; available: boolean }>;
    };
    const slot = slots.timeSlotAvailabilityResponses.find(({ available }) => available)!;

    const create = await staffApi.post('/api/bookings', {
      data: {
        customerId: other.id,
        vehicleId: vehicle.id,
        timeSlotId: slot.timeSlotId,
        bookingDate,
        servicePriceIds: [price.servicePriceId],
        notes: 'E2E ownership fixture',
        walkIn: false,
      },
    });
    expect(create.status()).toBe(200);
    const booking = await create.json() as { id: number; bookingCode: string; status: string };

    expect((await customerApi.get(`/api/bookings/booking-code?bookingCode=${booking.bookingCode}`)).status())
      .toBe(403);
    expect((await customerApi.post('/api/cancel-booking', {
      data: { bookingCode: booking.bookingCode, cancelReason: 'tampered ownership' },
    })).status()).toBe(404);

    const detail = await adminApi.get(`/api/admin/booking-detail?bookingId=${booking.id}`);
    expect(detail.status()).toBe(200);
    const detailBody = await detail.json() as { status: string; billing: { id: number } };
    expect(detailBody.status).toBe(booking.status);
    expect((await customerApi.post('/api/payment/vnpay/create', {
      data: { billingId: detailBody.billing.id, orderInfo: 'tampered billing' },
    })).status()).toBe(403);
  });

  test('TC-SE13 customerId, staffId, and billingId cannot impersonate another principal', async ({
    adminApi,
    customerApi,
    staffApi,
  }) => {
    const customers = await (await adminApi.get('/api/admin/customers?size=100')).json() as {
      data: { content: Array<{ id: number; email: string }> };
    };
    const other = customers.data.content.find(({ email }) => email === 'e2e.other@gmail.com')!;
    const tamperedBooking = await customerApi.post('/api/v2/bookings', {
      data: { customerId: other.id },
    });
    expect(tamperedBooking.status()).toBe(403);

    const rewards = await (await customerApi.get('/api/customer/rewards')).json() as {
      data: Array<{ id: number }>;
    };
    const tamperedVoucherExchange = await customerApi.post('/api/voucher/exchange', {
      data: { customerId: other.id, rewardId: rewards.data[0].id },
    });
    expect(tamperedVoucherExchange.status()).toBe(403);

    const tamperedStaff = await staffApi.post(
      '/api/staff/v2/wash-sessions/start?staffId=999999',
      { data: { bookingId: 999999 } },
    );
    expect(tamperedStaff.status()).toBe(404);

    const tamperedBilling = await customerApi.post('/api/billings/complete/cash', {
      data: 999999,
    });
    expect(tamperedBilling.status()).toBe(403);
  });
});
