import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.locator('input[type="password"]').fill(password);
    await this.page.locator('button[type="submit"]').click();
  }

  async expectLoggedIn() {
    await expect(this.page).not.toHaveURL(/\/login$/);
  }

  async expectLoggedOut() {
    await expect(this.page).toHaveURL(/\/login$/);
    await expect(this.page.locator('.ant-message-error')).toBeVisible();
    const authCookies = (await this.page.context().cookies())
      .filter(({ name }) => name === 'access_token' || name === 'refresh_token');
    expect(authCookies).toHaveLength(0);
  }
}
