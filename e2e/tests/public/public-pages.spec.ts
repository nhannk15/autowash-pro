import { expect, test } from '../../fixtures/index.js';

test('@p1 TC-PU01 homepage renders its primary sections and global layout', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.navbar')).toBeVisible();
  await expect(page.locator('.hero-slider')).toBeVisible();
  await expect(page.locator('.membership')).toBeVisible();
  await expect(page.locator('.services-section')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
});

test('@p1 TC-PU02 public navigation reaches services, blog, login, and signup', async ({ page }) => {
  await page.goto('/');
  for (const [href, expected] of [
    ['/service', /\/service$/],
    ['/blog', /\/blog$/],
    ['/login', /\/login$/],
    ['/signup', /\/signup$/],
  ] as const) {
    await page.locator(`a[href="${href}"]:visible`).first().click();
    await expect(page).toHaveURL(expected);
    await page.goto('/');
  }
});

test('@p2 TC-PU03 service page renders live services or an explicit error state', async ({ page }) => {
  await page.goto('/service');
  await expect(page.locator('.navbar')).toBeVisible();
  await expect(page.locator('.dichvu-header__title')).toBeVisible();
  await expect(page.locator('.dichvu-row, .dichvu-error-title').first()).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
});

test('@p2 TC-PU04 blog list links to each implemented detail route', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.locator('.blog-header__title')).toBeVisible();
  const routes = [
    '/blog/huong-dan-tay-o-kinh-o-to',
    '/blog/bang-gia-ve-sinh-noi-that-o-to-tai-nha',
    '/blog/cach-cham-soc-ngoai-that-o-to-tai-nha',
    '/blog/tieu-chi-danh-gia-trung-tam-rua-xe-o-to',
    '/blog/cach-cham-soc-noi-that-o-to-tai-nha',
  ];
  for (const route of routes) {
    if (await page.locator(`a[href="${route}"]`).count() === 0) {
      await page.getByRole('button', { name: /Xem thêm bài viết/i }).click();
    }
    await page.locator(`a[href="${route}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
    await expect(page.locator('.blog-detail__post-title')).toBeVisible();
    await page.goto('/blog');
  }
});

test('@p1 TC-PU05 services API is public while customer data remains protected', async ({ guestApi }) => {
  expect((await guestApi.get('/api/services')).status()).toBe(200);
  expect((await guestApi.get('/api/customer/all-bookings')).status()).toBe(401);
});

test('@p2 TC-PU06 unknown route has an explicit fallback', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await expect(page.getByText('404')).toBeVisible();
  await expect(page.getByText(/Không tìm thấy trang/i)).toBeVisible();
});
