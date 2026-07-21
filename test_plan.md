# Test Plan — AutoWash Pro

Kế hoạch kiểm thử cho AutoWash Pro, ưu tiên Playwright E2E nhưng có phân tách rõ những trường hợp nên kiểm tra ở API/integration test. Tài liệu này bám theo code hiện tại của project và không sử dụng database development làm môi trường test.

---

## 1. Mục tiêu và nguyên tắc

### Mục tiêu

- Bảo vệ các luồng nghiệp vụ quan trọng: đăng nhập, đặt lịch, check-in, wash session, thanh toán, loyalty và quản trị.
- Kiểm tra phân quyền ở cả frontend route guard và backend API.
- Có dữ liệu test lặp lại được, không phụ thuộc dữ liệu cá nhân hoặc thứ tự chạy test.
- Khi test fail phải có trace, screenshot, video và thông tin request/response đủ để điều tra.

### Nguyên tắc

1. **Tuyệt đối không chạy automated test trên DB development/production.**
2. E2E chỉ kiểm tra các hành trình người dùng và integration quan trọng; validation thuần và business-rule chi tiết ưu tiên unit/API integration test.
3. Mỗi test tự tạo hoặc được cấp dữ liệu riêng; không dựa vào test khác đã chạy trước.
4. Test mutation chạy với `workers: 1`. `fullyParallel: false` không thay thế việc reset dữ liệu.
5. Retry chỉ dùng trong CI sau khi test đã bảo đảm idempotent. Local mặc định không retry.
6. Không commit `.env.e2e`, storage state, report, screenshot hoặc video.

---

## 2. Phạm vi hệ thống hiện tại

AutoWash Pro là hệ thống full-stack gồm ba role:

- **CUSTOMER**: quản lý xe, đặt/hủy lịch, cọc VNPay, lịch sử thanh toán, hạng thành viên, điểm, reward, voucher và notification.
- **STAFF**: tạo khách walk-in, check-in bằng mã/QR, quản lý wash bay/session, hoàn thành dịch vụ và thu tiền.
- **ADMIN**: dashboard, khách hàng, staff, service, promotion, reward và membership tier.

| Layer | Công nghệ/cấu hình hiện tại |
|---|---|
| Frontend | React 19, Vite port `3000`, Ant Design 6, React Router |
| Backend | Spring Boot 3.5, Java 21, port `8080` |
| Auth | JWT trong cookie `access_token` và `refresh_token` |
| Database | MariaDB/MySQL |
| Proxy local | `/api` và `/auth` từ Vite sang `localhost:8080` |

### Route frontend cần kiểm tra

| Khu vực | Route |
|---|---|
| Public | `/`, `/service`, `/blog`, `/blog/*`, `/login`, `/signup`, `/forgotpass` |
| Customer | `/ca-nhan/tong-quan`, `/ca-nhan/xe-cua-toi`, `/ca-nhan/dat-lich`, `/ca-nhan/thanh-toan`, `/ca-nhan/ho-so` |
| Staff | `/staff/dashboard`, `/staff/queue`, `/staff/checkin`, `/staff/payment`, `/staff/history`, `/staff/profile` |
| Admin | `/admin/dashboard`, `/admin/customer`, `/admin/staff`, `/admin/service`, `/admin/membership`, `/admin/rewards`, `/admin/promotion`, `/admin/profile` |

Lưu ý: `/ca-nhan` hiện redirect mặc định đến `/ca-nhan/ho-so`; `/staff` và `/admin` redirect đến dashboard tương ứng.

---

## 3. Điều kiện bắt buộc trước khi viết E2E

### P0.1 — Tạo môi trường DB E2E riêng

Cần thêm một trong hai phương án:

- `docker-compose.e2e.yml` chạy MariaDB riêng, ví dụ database `autowashpro_e2e`, volume tạm và port riêng; hoặc
- Testcontainers MariaDB cho backend integration test.

Backend E2E phải chạy bằng profile `e2e`, ví dụ `application-e2e.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3307/autowashpro_e2e
    username: autowash_e2e
    password: ${E2E_DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: create-drop
  task:
    scheduling:
      enabled: false

autowash:
  seed-demo-data: false
  e2e-fixtures: true
```

Yêu cầu code/config:

- `DataSeeder` và các scheduler không được chạy trong profile `test/e2e` ngoài fixture được thiết kế riêng.
- `BackendApplication` hiện gắn trực tiếp `@EnableScheduling`; cần chuyển annotation này sang configuration có `@Profile("!test & !e2e")` hoặc `@ConditionalOnProperty`. Chỉ đặt `spring.task.scheduling.enabled=false` là chưa đủ nếu application vẫn enable scheduling trực tiếp.
- Không dùng cấu hình datasource mặc định từ máy developer.
- Không dùng `ddl-auto=update` cho automated test.
- Suite phải fail-fast nếu database name không chứa `_e2e` hoặc profile không phải `e2e`.

### P0.2 — Test data deterministic

Tạo fixture E2E riêng với các tài khoản không phải email cá nhân:

```env
E2E_CUSTOMER_EMAIL=e2e.customer@gmail.com
E2E_CUSTOMER_PASSWORD=change-me-locally
E2E_STAFF_EMAIL=e2e.staff@gmail.com
E2E_STAFF_PASSWORD=change-me-locally
E2E_ADMIN_EMAIL=e2e.admin@gmail.com
E2E_ADMIN_PASSWORD=change-me-locally
```

Fixture tối thiểu:

- 1 customer active có xe, điểm, voucher và upcoming booking.
- 1 customer active không có xe.
- 1 customer inactive.
- 1 staff active, 1 admin active.
- Ít nhất 2 vehicle types, basic/add-on/premium services và service prices.
- Time slots, wash bays active/maintenance và available slots cho `today + 1` đến `today + 7`.
- Promotion đang hiệu lực, sắp diễn ra, hết hạn.
- Reward/voucher hợp lệ, hết hạn và đã sử dụng.

Đối với dữ liệu do test tạo, dùng suffix duy nhất:

```ts
const unique = `${Date.now()}-${test.info().workerIndex}`;
const email = `e2e.${unique}@gmail.com`;
const licensePlate = `E2E-${unique.slice(-8)}`;
```

### P0.3 — Sửa baseline trước E2E

Trước khi đưa E2E vào CI:

- `npm run build` phải pass.
- `npm run lint` phải pass.
- `mvn test` phải pass và không kết nối DB development.
- Bổ sung test thực thi cho `VehicleServiceTest` thay vì chỉ để comment.

### P0.4 — Các blocker chức năng cần xử lý hoặc đánh dấu expected-fail

- Backend hiện chưa có `PUT /api/admin/services/restore/{id}` dù frontend gọi endpoint này.
- Logout phải xóa cả access token, refresh token và refresh token lưu trong DB.
- Login/JWT filter phải từ chối user `isActive=false`.
- Backend cần siết quyền cho các CRUD không nằm dưới `/api/admin/**`, đặc biệt promotion, service price và booking detail.

Không cho các test liên quan “pass” bằng cách hạ assertion. Test phải ở trạng thái `test.fixme()` kèm liên kết issue cho đến khi blocker được sửa.

---

## 4. Cấu trúc E2E đề xuất

```text
e2e/
├── package.json
├── tsconfig.json
├── playwright.config.ts
├── global.setup.ts                  # Validate env/profile + backend health
├── .env.e2e.example                 # Chỉ chứa tên biến, không chứa secret thật
├── fixtures/
│   ├── auth.fixture.ts              # customerPage/staffPage/adminPage
│   ├── data.fixture.ts              # unique data + API cleanup
│   └── api.fixture.ts               # APIRequestContext theo role
├── .auth/                           # storageState, git-ignore
│   ├── customer.json
│   ├── staff.json
│   └── admin.json
├── pages/
│   ├── login.page.ts
│   ├── register.page.ts
│   ├── forgot-password.page.ts
│   ├── home.page.ts
│   ├── customer/
│   │   ├── overview.page.ts
│   │   ├── my-cars.page.ts
│   │   ├── booking.page.ts
│   │   ├── payment.page.ts
│   │   └── profile.page.ts
│   ├── staff/
│   │   ├── dashboard.page.ts
│   │   ├── queue.page.ts
│   │   ├── checkin.page.ts
│   │   ├── payment.page.ts
│   │   └── history.page.ts
│   └── admin/
│       ├── dashboard.page.ts
│       ├── customer.page.ts
│       ├── staff.page.ts
│       ├── service.page.ts
│       ├── promotion.page.ts
│       ├── reward.page.ts
│       └── membership.page.ts
└── tests/
    ├── setup/auth.setup.ts
    ├── auth/
    ├── public/
    ├── customer/
    ├── staff/
    ├── admin/
    └── security/
        ├── route-guard.spec.ts
        ├── api-rbac.spec.ts
        └── ownership.spec.ts
```

Thêm vào `.gitignore`:

```gitignore
e2e/.env.e2e
e2e/.auth/
e2e/playwright-report/
e2e/test-results/
e2e/blob-report/
```

Khởi tạo dependency:

```bash
cd e2e
npm init -y
npm install -D @playwright/test @types/node dotenv typescript
npx playwright install chromium
```

---

## 5. Playwright config

```ts
// e2e/playwright.config.ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, '.env.e2e') });

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './tests',
  globalSetup: path.join(here, 'global.setup.ts'),
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  outputDir: 'test-results',
  use: {
    baseURL,
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chromium',
      testMatch: /.*\.responsive\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    cwd: '../frontend',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 90_000,
  },
});
```

Backend + MariaDB E2E phải được khởi động trước Playwright, ví dụ bằng npm script gọi `docker compose -f docker-compose.e2e.yml up -d --build --wait`. `global.setup.ts` phải kiểm tra `/actuator/health` và fail nếu backend chưa sẵn sàng hoặc không chạy profile E2E.

### `.env.e2e.example`

```env
E2E_BASE_URL=http://127.0.0.1:3000
E2E_BACKEND_URL=http://127.0.0.1:8080

E2E_CUSTOMER_EMAIL=
E2E_CUSTOMER_PASSWORD=
E2E_STAFF_EMAIL=
E2E_STAFF_PASSWORD=
E2E_ADMIN_EMAIL=
E2E_ADMIN_PASSWORD=
```

### Auth setup và storage state

`tests/setup/auth.setup.ts` login từng role và lưu ba storage state. Các login test vẫn dùng context sạch để không bị setup che lỗi login.

```ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test as setup, expect } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const authDir = path.resolve(here, '../../.auth');

async function authenticate(
  page: import('@playwright/test').Page,
  email: string | undefined,
  password: string | undefined,
  output: string,
) {
  if (!email || !password) throw new Error(`Missing credentials for ${output}`);
  await fs.mkdir(authDir, { recursive: true });

  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu').fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login$/);
  await page.context().storageState({ path: path.join(authDir, output) });
}

setup('customer auth', async ({ page }) => {
  await authenticate(page, process.env.E2E_CUSTOMER_EMAIL,
    process.env.E2E_CUSTOMER_PASSWORD, 'customer.json');
});

setup('staff auth', async ({ page }) => {
  await authenticate(page, process.env.E2E_STAFF_EMAIL,
    process.env.E2E_STAFF_PASSWORD, 'staff.json');
});

setup('admin auth', async ({ page }) => {
  await authenticate(page, process.env.E2E_ADMIN_EMAIL,
    process.env.E2E_ADMIN_PASSWORD, 'admin.json');
});
```

---

## 6. Danh sách test cases

Priority:

- **P0**: security hoặc hành trình tạo doanh thu; bắt buộc chạy trên mọi PR.
- **P1**: chức năng chính; chạy trên PR hoặc nightly tùy thời gian.
- **P2**: smoke UI, responsive và edge case ít rủi ro; chạy nightly.

Gắn tag trực tiếp vào title hoặc option của Playwright, ví dụ `test('TC-AU01 @p0 customer login', ...)`, để script `--grep @p0` hoạt động.

### Module 1 — Authentication (15 cases)

| ID | Pri | Test case | Kết quả mong đợi |
|---|---|---|---|
| TC-AU01 | P0 | Customer login hợp lệ | Message thành công, redirect chính xác về `/` và `/api/users/me` trả CUSTOMER |
| TC-AU02 | P0 | Staff login hợp lệ | Redirect cuối cùng `/staff/dashboard` |
| TC-AU03 | P0 | Admin login hợp lệ | Redirect cuối cùng `/admin/dashboard` |
| TC-AU04 | P0 | Sai mật khẩu hoặc email không tồn tại | Không tạo auth cookie, vẫn ở `/login`, hiện lỗi |
| TC-AU05 | P1 | Email/password trống hoặc email sai format | Ant Design validation hiện, không gửi `/auth/login` |
| TC-AU06 | P0 | Tài khoản inactive login | Backend từ chối, không tạo cookie; `test.fixme` cho đến khi backend hỗ trợ |
| TC-AU07 | P1 | Reload sau login | Session còn hợp lệ và route không redirect về login |
| TC-AU08 | P0 | Đăng ký thành công bằng dữ liệu unique | Response 201, message thành công, redirect `/login` |
| TC-AU09 | P1 | Đăng ký email đã tồn tại | Hiện lỗi server, không tạo user thứ hai |
| TC-AU10 | P1 | Validation register | Bao phủ password ngắn, confirm mismatch, tên không hợp lệ, phone sai và ngày sinh trống/tương lai |
| TC-AU11 | P1 | Forgot password gửi OTP và resend | Chuyển step 2, resend tạo OTP mới và không lộ secret trong UI/log |
| TC-AU12 | P1 | OTP sai format/sai giá trị/hết hạn | Không mở step reset, hiện đúng lỗi |
| TC-AU13 | P0 | Full reset password qua mail test adapter | Reset thành công; mật khẩu cũ fail, mật khẩu mới login được |
| TC-AU14 | P0 | Customer logout rồi hard reload | Redirect theo action UI, cả hai cookie bị xóa, `/api/users/me` trả 401 |
| TC-AU15 | P0 | Staff/Admin logout | Sidebar logout redirect `/login`; hard reload không tự đăng nhập lại |

Google OAuth không chạy trong suite PR vì phụ thuộc provider ngoài; duy trì một smoke test riêng trên staging hoặc mock OAuth provider ở integration environment.

### Module 2 — Public pages (6 cases)

| ID | Pri | Test case | Kết quả mong đợi |
|---|---|---|---|
| TC-PU01 | P1 | Homepage load | Navbar, hero, membership, services, stats và footer hiển thị |
| TC-PU02 | P1 | Public navigation | Links Dịch vụ, Blog, Login, Đăng ký dẫn đúng route |
| TC-PU03 | P2 | Service page | Danh sách service hoặc empty/error state hợp lệ; navbar/footer tồn tại |
| TC-PU04 | P2 | Blog list và từng detail route | Mở đúng slug, nội dung và nút quay lại/navigation hoạt động |
| TC-PU05 | P1 | Public API services | Guest gọi `/api/services` thành công; API protected vẫn 401 |
| TC-PU06 | P2 | Unknown route | Hiển thị 404 hoặc fallback đã định nghĩa; `test.fixme` nếu app chưa có catch-all route |

### Module 3 — Customer area (19 cases)

| ID | Pri | Test case | Kết quả mong đợi |
|---|---|---|---|
| TC-CU01 | P1 | Overview load | Membership tier, points, upcoming bookings và recent activities hiển thị |
| TC-CU02 | P1 | Sidebar customer | Đủ 5 mục đúng label/route; `/ca-nhan` redirect `/ca-nhan/ho-so` |
| TC-CU03 | P1 | Xem reward và voucher | Modal/table load đúng dữ liệu, status và expiry |
| TC-CU04 | P0 | Đổi reward thành voucher | Trừ điểm một lần, voucher mới xuất hiện, transaction được ghi nhận |
| TC-CU05 | P1 | Đổi reward khi thiếu điểm | Backend từ chối, điểm/voucher không đổi |
| TC-CU06 | P0 | Pending deposit | Hiển thị ở Overview, mở đúng booking và tạo yêu cầu VNPay đúng billing ID |
| TC-CU07 | P0 | Hủy booking | Xác nhận policy, trạng thái chuyển CANCELLED và tiền cọc/refund voucher đúng rule |
| TC-CU08 | P1 | Danh sách xe và empty state | Card hiển thị đúng; tài khoản không xe có CTA đăng ký |
| TC-CU09 | P0 | Thêm xe unique | Submit brand/model/license/color/type, xe mới xuất hiện |
| TC-CU10 | P1 | Thêm biển số trùng/vehicle type sai | Không tạo xe, hiện lỗi backend |
| TC-CU11 | P1 | Sửa xe | Chỉ sửa các field UI hỗ trợ: biển số, màu, ảnh; brand/model/type giữ nguyên |
| TC-CU12 | P1 | Soft-delete xe | Xe chuyển inactive, menu edit/delete bị ẩn và nút “Liên hệ khôi phục” xuất hiện |
| TC-CU13 | P0 | Full booking basic | 4 bước: Chọn xe → Dịch vụ → Thời gian → Xác nhận; booking được tạo đúng dữ liệu |
| TC-CU14 | P0 | Booking chọn staff hoặc để hệ thống phân công | Cả hai trường hợp tạo booking hợp lệ, staff chỉ hiện khi slot/date đã chọn |
| TC-CU15 | P0 | Promotion + voucher + deposit | Giá gốc, discount, cọc 30% và số còn lại khớp response backend |
| TC-CU16 | P1 | Premium service rules | Không trộn premium với basic/add-on và chỉ chọn một premium service |
| TC-CU17 | P1 | Booking window/no slot/concurrent slot | Ngày ngoài tier window bị chặn; hết slot có empty state; cùng slot chỉ một request thành công |
| TC-CU18 | P1 | Payment history | Chỉ hiện billing phù hợp; filter, tổng tiền và chi tiết cash/VNPay/cancelled đúng |
| TC-CU19 | P1 | Profile và notifications | Thông tin profile đúng; đổi mật khẩu; unread count, mark read và read-all hoạt động |

Lưu ý booking UI hiện có **4 bước**, không phải 5. Staff, voucher và ghi chú nằm trong bước 4 “Xác nhận”.

### Module 4 — Staff area (14 cases)

| ID | Pri | Test case | Kết quả mong đợi |
|---|---|---|---|
| TC-ST01 | P1 | Dashboard load | Wash bay cards, today bookings và upcoming bookings hiển thị |
| TC-ST02 | P0 | Tìm customer có sẵn và tạo walk-in booking | Chọn xe/service/slot và tạo booking thành công |
| TC-ST03 | P0 | Quick-create walk-in customer/vehicle | Tạo đúng customer/vehicle hoặc gắn xe vào guest mặc định theo lựa chọn UI |
| TC-ST04 | P1 | Walk-in validation/no slot | Phone, vehicle và service validation đúng; hết slot không cho submit |
| TC-ST05 | P0 | Check-in bằng booking code | Tìm đúng booking, chọn staff, start session và redirect dashboard |
| TC-ST06 | P1 | Booking code sai/booking không check-in được | Empty/error state, không tạo wash session |
| TC-ST07 | P2 | QR UI fallback | Không yêu cầu camera thật trong PR; scanner lỗi vẫn cho phép nhập code thủ công |
| TC-ST08 | P0 | Complete session từ Dashboard | Session chuyển COMPLETED, booking rời active list và bay chờ thanh toán |
| TC-ST09 | P0 | Mở payment từ Dashboard | `bookingId`/`bayId` được truyền bằng navigation state, bill đúng booking |
| TC-ST10 | P0 | Áp dụng voucher tại quầy | Voucher hợp lệ giảm đúng tiền; invalid/expired/used bị từ chối |
| TC-ST11 | P0 | Thanh toán tiền mặt | Billing PAID một lần, booking/session PAID và điểm được cộng đúng |
| TC-ST12 | P1 | VNPay return success/failure | Mock external redirect/return; success ghi nhận một lần, failure không paid |
| TC-ST13 | P1 | Bay release sau payment | Quay về dashboard, bay AVAILABLE và không còn booking/session cũ |
| TC-ST14 | P1 | Queue/history | Search biển số, filter trạng thái, detail modal và lịch sử completed/paid đúng |

Không đặt test “complete session” ở `/staff/queue`: trang Queue hiện chỉ xem/search/filter chi tiết; thao tác complete nằm trên Dashboard.

### Module 5 — Admin area (16 cases)

| ID | Pri | Test case | Kết quả mong đợi |
|---|---|---|---|
| TC-AD01 | P1 | Dashboard summary | KPI revenue, deduction, session/customer/point/promotion metrics load |
| TC-AD02 | P1 | Dashboard filter modes | `all`, date range, month và year gửi đúng payload, dữ liệu/chart cập nhật |
| TC-AD03 | P1 | Dashboard charts/tables | Revenue, service distribution, peak hours, deduction, promotion và recent transactions render/empty đúng |
| TC-AD04 | P1 | Customer list | Pagination, sort và search full name hoạt động |
| TC-AD05 | P0 | Deactivate/restore customer | Status và action đổi đúng; inactive customer không login được |
| TC-AD06 | P0 | Add staff unique | Tạo staff thành công và staff mới login được |
| TC-AD07 | P1 | Add staff validation/duplicate | Required/email/password/date và duplicate email bị chặn |
| TC-AD08 | P0 | Deactivate/restore staff | Status đổi đúng; inactive staff không login được |
| TC-AD09 | P0 | Add service | Name, duration, multiplier, category, steps, highlights và Sedan/SUV prices lưu đúng |
| TC-AD10 | P1 | Service search/sort/filter/detail | Danh sách và modal detail phản ánh đúng dữ liệu |
| TC-AD11 | P0 | Deactivate/restore service | Deactivate hoạt động; restore `test.fixme` đến khi backend có endpoint |
| TC-AD12 | P0 | Promotion CRUD | Create/edit/delete, date range, usage limit, service/tier scope và status đúng |
| TC-AD13 | P0 | Reward CRUD | Create/edit/deactivate cho các reward type; validation point/discount/service đúng |
| TC-AD14 | P1 | Membership tier update | Booking window, point rate, maintain points, expiry và perks update đúng |
| TC-AD15 | P1 | Admin profile | Route/profile load đúng admin đang login |
| TC-AD16 | P1 | API failure/empty state | Các trang admin không crash khi API empty/4xx/5xx và có feedback phù hợp |

### Module 6 — Route guard và API security (14 cases)

| ID | Pri | Test case | Kết quả mong đợi |
|---|---|---|---|
| TC-SE01 | P0 | Guest → customer route | Redirect `/login` |
| TC-SE02 | P0 | Guest → staff route | Redirect `/login` |
| TC-SE03 | P0 | Guest → admin route | Redirect `/login` |
| TC-SE04 | P0 | Customer → staff/admin | Redirect `/`, không render protected content |
| TC-SE05 | P0 | Staff → customer/admin | Redirect `/staff/dashboard` |
| TC-SE06 | P0 | Admin → customer/staff/public-only login | Redirect `/admin/dashboard` |
| TC-SE07 | P0 | Guest gọi protected API | `401`, không trả dữ liệu nhạy cảm |
| TC-SE08 | P0 | Customer gọi `/api/admin/**` | `403` |
| TC-SE09 | P0 | Staff gọi `/api/admin/**` | `403` |
| TC-SE10 | P0 | Customer gọi CRUD promotion/service-price/booking-detail | `403`; `test.fixme` cho endpoint chưa được siết quyền |
| TC-SE11 | P0 | User A update/delete vehicle của User B | `403/404`, dữ liệu B không đổi |
| TC-SE12 | P0 | User A cancel/read billing/booking của User B | `403/404`, dữ liệu B không đổi |
| TC-SE13 | P0 | Tampered customerId/staffId/billingId | Backend lấy identity từ principal hoặc từ chối ID không thuộc quyền |
| TC-SE14 | P0 | Logout với refresh token cũ | Refresh token bị revoke; request tiếp theo vẫn `401` kể cả hard reload |

Route-guard test không được coi là bằng chứng bảo mật backend. TC-SE07 đến TC-SE14 phải dùng `APIRequestContext` hoặc Spring Security integration test để assert status code trực tiếp.

---

## 7. Selector và Page Object rules

Ưu tiên selector theo thứ tự:

1. `getByRole` với accessible name ổn định.
2. `getByLabel` cho Ant Design Form.Item.
3. `getByText` khi text là yêu cầu nghiệp vụ.
4. `data-testid` cho custom wizard, chart, card, QR scanner hoặc phần tử không có semantic role.
5. CSS class Ant Design chỉ dùng khi không có lựa chọn ổn định khác.

Ví dụ:

```ts
await page.getByLabel('Email').fill(email);
await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
await expect(page.getByRole('heading', { name: /XE CỦA TÔI/i })).toBeVisible();

const modal = page.getByRole('dialog', { name: /CẬP NHẬT PHƯƠNG TIỆN/i });
await modal.getByLabel('BIỂN SỐ XE').fill(licensePlate);

await page.getByTestId('admin-revenue-chart').waitFor();
```

Page Object chỉ chứa navigation, locator và user action dùng lại. Assertion nghiệp vụ chính nên nằm trong spec để test dễ đọc; không tạo một method assertion cho mọi text nhỏ.

Không dùng:

- `waitForTimeout` để chờ API/UI.
- `nth()` nếu có thể định danh bằng role/name/test ID.
- Assert chỉ bằng toast; phải kiểm tra thêm URL và state/backend response.
- Test phụ thuộc dữ liệu được tạo bởi test trước.

---

## 8. External integration strategy

### VNPay

- Không điều khiển trang sandbox thật trong PR.
- Intercept response tạo payment URL hoặc dùng fake VNPay service trong profile E2E.
- Kiểm tra return success/failure và idempotency ở backend integration test.
- Không đánh dấu PAID chỉ vì frontend có query `status=00`; phải xác minh billing qua API/DB test.

### Email/OTP

- Dùng MailHog/Mailpit hoặc `TestEmailGateway` trong profile E2E.
- Full reset-password phải đọc OTP từ test mailbox/helper có kiểm soát.
- Không log OTP trong production profile.

### Cloudinary upload

- Test CRUD xe bình thường không bắt buộc upload ảnh.
- Một integration test riêng mock upload success/failure và kiểm tra UI giữ nguyên dữ liệu khi upload lỗi.

### QR scanner/camera

- PR suite kiểm tra manual-code fallback.
- Camera thật chỉ chạy manual/device lab; không làm flaky CI bằng permission/hardware phụ thuộc máy.

---

## 9. Chạy test và CI

### Scripts đề xuất

```json
{
  "scripts": {
    "e2e:env:up": "docker compose -f ../docker-compose.e2e.yml up -d --build --wait",
    "e2e:env:down": "docker compose -f ../docker-compose.e2e.yml down -v",
    "test": "playwright test --project=chromium",
    "test:p0": "playwright test --project=chromium --grep @p0",
    "test:responsive": "playwright test --project=mobile-chromium",
    "test:ui": "playwright test --ui",
    "report": "playwright show-report"
  }
}
```

Không gắn `down -v` duy nhất vào `posttest` nếu cần giữ môi trường để debug failure. CI luôn cleanup bằng step `if: always()`.

### Pipeline tối thiểu

1. Checkout và cache dependency.
2. `npm ci` frontend + `npm run lint` + `npm run build`.
3. `mvn test` bằng profile test, DB isolated.
4. Cài Chromium Playwright.
5. Khởi động E2E MariaDB/backend, chờ health.
6. Chạy `@p0` trên PR; chạy full Chromium + responsive nightly.
7. Upload `playwright-report`, `test-results`, trace/video khi fail.
8. Luôn `docker compose ... down -v`.

---

## 10. Thứ tự triển khai

1. Tạo DB/profile E2E và tắt seeder/scheduler ngoài kiểm soát.
2. Đưa backend unit test và frontend lint về xanh.
3. Sửa logout, inactive-user check và backend RBAC.
4. Tạo Playwright config, global preflight, auth storage state và API fixtures.
5. Implement P0 auth/security.
6. Implement full customer booking.
7. Implement full staff check-in → complete → payment → release bay.
8. Implement admin mutation P0.
9. Bổ sung P1/P2, responsive và external-integration fake.

---

## 11. Tổng kết phạm vi

| Module | Số cases | Trọng tâm |
|---|---:|---|
| Authentication | 15 | Login, register, OTP, session, logout thật |
| Public pages | 6 | Smoke và navigation |
| Customer | 19 | Loyalty, xe, booking, cọc, profile/notification |
| Staff | 14 | Walk-in, check-in, session, payment, bay |
| Admin | 16 | Dashboard và CRUD quản trị |
| Security | 14 | Route guard, API RBAC, ownership, token revoke |
| **Tổng** | **84** | |

### Definition of Done

- 84 cases được implement hoặc có `test.fixme()` kèm issue rõ ràng cho blocker đã biết.
- Không test nào truy cập hoặc thay đổi DB development/production.
- Test chạy lại hai lần trên DB sạch cho cùng kết quả.
- Không phụ thuộc thứ tự; retry không tạo duplicate side effect.
- P0 xanh trên CI, không có console error/network error ngoài những lỗi test cố ý tạo.
- Report/trace đủ để tái hiện failure.
