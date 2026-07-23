import { expect, type Page } from '@playwright/test';

export class CustomerBookingPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/ca-nhan/dat-lich');
    await expect(this.page.locator('.vehicle-card.active')).toBeVisible();
  }

  async chooseVehicleAndService(serviceName: string) {
    await expect(this.page.getByText('E2E-00001', { exact: true })).toBeVisible();
    await this.page.locator('.btn-continue-step1').click();

    const serviceCard = this.page.locator('.booking-service-card').filter({ hasText: serviceName });
    await expect(serviceCard).toBeVisible();
    await serviceCard.locator('.booking-service-card__btn').click();
    await this.page.locator('.sidebar-btn-next').click();
  }

  async chooseFirstAvailableSlot() {
    const date = this.page.locator('.booking-date-picker');
    await expect(date).toHaveValue(/\d{4}-\d{2}-\d{2}/);
    const selectedDate = await date.inputValue();
    const slot = this.page.locator('.booking-time-slot:not([disabled])').first();
    await expect(slot).toBeVisible();
    const time = (await slot.innerText()).match(/\d{2}:\d{2}/)?.[0];
    expect(time).toBeTruthy();
    await slot.click();
    await this.page.locator('.sidebar-btn-next').click();
    await expect(this.page.locator('textarea[name="notes"]')).toBeVisible();
    return { date: selectedDate, time: time! };
  }

  async selectStaff(staffName?: string) {
    const staffSelect = this.page.locator('.ant-select').first();
    await expect(staffSelect).toBeVisible();
    await staffSelect.click();
    const option = staffName
      ? this.page.locator('.ant-select-item-option').filter({ hasText: staffName })
      : this.page.locator('.ant-select-item-option').first();
    await expect(option).toBeVisible();
    const selectedName = (await option.innerText()).trim().replace(/\s+-\s+(STAFF|WASH_STAFF)$/, '');
    await option.click();
    return selectedName;
  }

  async submit(notes: string) {
    await this.page.locator('textarea[name="notes"]').fill(notes);
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/api/v2/bookings')
        && response.request().method() === 'POST',
      { timeout: 45_000 },
    );
    await this.page.locator('.sidebar-btn-confirm').click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await expect(this.page.locator('.booking-success-modal-content')).toBeVisible();
    return response.json();
  }
}
