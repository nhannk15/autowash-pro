import { test, expect } from '../../fixtures/index.js';
import { CustomerBookingPage } from '../../pages/customer-booking.page.js';

type Service = {
  serviceName: string;
  category: string;
  servicePrices: Array<{
    servicePriceId: number;
    vehicleType: { typeName: string };
  }>;
};

async function basicSedanService(customerApi: import('@playwright/test').APIRequestContext) {
  const response = await customerApi.get('/api/services');
  expect(response.status()).toBe(200);
  const body = await response.json() as { data: Service[] };
  const service = body.data.find(({ category }) => category === 'BASIC')!;
  const price = service.servicePrices.find(({ vehicleType }) => vehicleType.typeName === 'SEDAN')!;
  return { service, price };
}

test.describe.serial('@p0 customer booking wizard', () => {
  test.skip('TC-CU13 completes all four basic booking steps with auto assignment', async ({
    customerPage,
    customerApi,
  }) => {
    const { service, price } = await basicSedanService(customerApi);
    const bookingPage = new CustomerBookingPage(customerPage);
    await bookingPage.goto();
    await bookingPage.chooseVehicleAndService(service.serviceName);
    const selected = await bookingPage.chooseFirstAvailableSlot();
    const booking = await bookingPage.submit('E2E auto assignment') as {
      bookingCode: string;
      vehicleLicensePlate: string;
      bookingDate: string;
      startTime: string;
      staffName: string | null;
      bookingDetails: Array<{ servicePriceId: number }>;
    };

    expect(booking).toMatchObject({
      vehicleLicensePlate: 'E2E-00001',
      bookingDate: selected.date,
      staffName: null,
    });
    expect(booking.startTime.slice(0, 5)).toBe(selected.time);
    expect(booking.bookingDetails).toContainEqual(expect.objectContaining({
      servicePriceId: price.servicePriceId,
    }));

    const allBookings = await customerApi.get('/api/customer/all-bookings');
    expect(allBookings.status()).toBe(200);
    expect(await allBookings.json()).toContainEqual(expect.objectContaining({
      bookingCode: booking.bookingCode,
      status: 'PENDING',
    }));
  });

  test.skip('TC-CU14 staff list appears only after slot selection and selected staff is saved', async ({
    customerPage,
    customerApi,
  }) => {
    const { service } = await basicSedanService(customerApi);
    const bookingPage = new CustomerBookingPage(customerPage);
    await bookingPage.goto();
    await bookingPage.chooseVehicleAndService(service.serviceName);
    await expect(customerPage.getByText('E2E Staff', { exact: false })).toHaveCount(0);
    await bookingPage.chooseFirstAvailableSlot();
    const selectedStaff = await bookingPage.selectStaff();
    const booking = await bookingPage.submit('E2E selected staff') as {
      bookingCode: string;
      staffName: string | null;
    };

    expect(booking.staffName).toBe(selectedStaff);
    const allBookings = await customerApi.get('/api/customer/all-bookings');
    expect(await allBookings.json()).toContainEqual(expect.objectContaining({
      bookingCode: booking.bookingCode,
      staffInfoDTO: expect.objectContaining({ fullName: selectedStaff }),
    }));
  });
});
