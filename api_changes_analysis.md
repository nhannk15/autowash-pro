# Backend & Frontend API Changes Analysis

Phân tích chi tiết tất cả thay đổi backend API và frontend từ branch E2E testing.

---

## Backend — Tóm tắt: 40 files, +506 / -166 lines

### 🔴 Nhóm 1: Security Hardening (RBAC) — Ảnh hưởng MAIN FLOW

Đây là nhóm thay đổi **quan trọng nhất**. Trước đây nhiều API endpoint **không kiểm tra quyền** — bất kỳ user đã login đều gọi được. Codex đã thêm `@PreAuthorize` cho hầu hết controllers.

| File | API Endpoint | Trước | Sau | Ảnh hưởng |
|---|---|---|---|---|
| [SecurityConfiguration.java](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/config/SecurityConfiguration.java) | `/api/payment/vnpay/**` | `permitAll()` | Chỉ `/api/payment/vnpay/return` là `permitAll` | ⚠️ **VNPay create** giờ cần authenticated |
| | `/api/customer/**` | `anyRequest().authenticated()` | `hasRole('CUSTOMER')` riêng, `all-staffs` cho cả 3 role | ⚠️ **Staff/Admin** không gọi được `/api/customer/*` nữa |
| [BillingController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/BillingController.java) | `POST /api/billings` | Ai cũng gọi được | `STAFF, ADMIN` only | ✅ Đúng logic |
| | `POST /api/billings/complete/cash` | Ai cũng gọi được | `STAFF, ADMIN` only | ✅ Đúng logic |
| | `POST /api/billings/apply-voucher` | Ai cũng gọi được | `STAFF, ADMIN` only | ✅ Đúng logic |
| | `GET /api/billings/customer/billing-history` | Ai cũng gọi được | `CUSTOMER` only | ✅ Đúng logic |
| [BookingController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/BookingController.java) | `POST /api/bookings` (walk-in) | Ai cũng gọi được | `STAFF, ADMIN` only | ✅ Đúng logic |
| | `POST /api/v2/bookings` (customer booking) | Ai cũng gọi được | `CUSTOMER` only | ✅ Đúng logic |
| | `GET /api/bookings/booking-code` | Ai cũng gọi được | `STAFF, ADMIN` only | ✅ Đúng logic |
| | `POST /api/cancel-booking` | Ai cũng gọi được | `CUSTOMER` only | ✅ Đúng logic |
| | `GET /api/bookings/pending-deposit` | Ai cũng gọi được | `CUSTOMER` only | ✅ Đúng logic |
| [BookingDetailController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/BookingDetailController.java) | `/api/booking-details/**` | Ai cũng gọi được | `ADMIN` only | ✅ Đúng logic |
| [PromotionController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/PromotionController.java) | CRUD `/api/promotions/*` | Ai cũng gọi được | `ADMIN` cho CUD, read cho `STAFF+ADMIN` | ✅ Đúng logic |
| [ServicePriceController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/ServicePriceController.java) | `/api/service-prices/**` | Ai cũng gọi được | `ADMIN` only | ✅ Đúng logic |
| [VehicleController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/VehicleController.java) | `GET /api/vehicles` (all) | Ai cũng gọi được | `ADMIN` only | ✅ Đúng logic |
| [PromotionUsageController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/PromotionUsageController.java) | `/api/promotion-usages/**` | Ai cũng gọi được | `ADMIN` only | ✅ Đúng logic |

> [!WARNING]
> **Rủi ro**: Nếu frontend hiện tại có chỗ nào staff/admin gọi endpoint `/api/customer/*` thì sẽ bị **403**. Cần kiểm tra kỹ frontend service calls.

---

### 🔴 Nhóm 2: Ownership Validation — Ảnh hưởng MAIN FLOW

Trước đây customer có thể truyền `customerId` tùy ý để thao tác trên data của người khác. Codex đã thêm xác minh identity từ JWT principal.

| File | Thay đổi | Impact |
|---|---|---|
| [BookingController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/BookingController.java) | `POST /api/v2/bookings` thêm `@AuthenticationPrincipal String email`, so sánh `customerId` với user đang login | ⚠️ **Main flow booking**: `customerId` trong request body phải khớp với user login |
| [BookingController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/BookingController.java) | `POST /api/cancel-booking` thêm `@AuthenticationPrincipal String email` | ⚠️ **Cancel flow**: backend giờ verify booking thuộc customer đang login |
| [BookingService](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/service/BookingService.java) | `createBookingWithStaff()` nhận `email` thay vì chỉ `request` → tìm customer từ email, verify `vehicleId` thuộc customer | ⚠️ **Main flow booking**: Vehicle ownership check |
| [VoucherController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/VoucherController.java) | `POST /api/voucher/exchange` thêm `@AuthenticationPrincipal` → verify `customerId` | ⚠️ **Voucher exchange flow** |
| [VnpayController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/VnpayController.java) | `POST /api/payment/vnpay/create` thêm `@AuthenticationPrincipal email` → verify billing thuộc customer | ⚠️ **Payment flow**: Customer chỉ tạo VNPay cho billing của mình |
| [WashSessionController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/WashSessionController.java) | `POST /api/staff/v2/wash-sessions/start` — `staffId` param giờ bị **ignored**, dùng `@AuthenticationPrincipal email` để tìm staff | ⚠️ **Staff check-in flow**: Staff ID lấy từ session, không từ request |

> [!IMPORTANT]
> **Nhóm 2 là thay đổi ảnh hưởng trực tiếp main flow nhiều nhất.** Frontend hiện tại có gửi `customerId` và `staffId` trong request body/param → backend giờ **bỏ qua hoặc verify** chúng. Nếu frontend gửi sai giá trị sẽ bị **403**.
>
> Tuy nhiên, nếu frontend gửi đúng ID của user đang login thì **không có vấn đề gì** — backend chỉ thêm layer kiểm tra thôi.

---

### 🟡 Nhóm 3: Bug Fixes — Ảnh hưởng cả MAIN và ALTERNATIVE FLOW

| File | Bug cũ | Fix | Impact |
|---|---|---|---|
| [AuthenticationController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/AuthenticationController.java) | **Login**: user inactive vẫn login được | Thêm `if (!user.isActive()) throw AccountInactiveException` | 🟡 Alternative flow: inactive user giờ bị block |
| [AuthenticationController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/AuthenticationController.java) | **Logout**: chỉ xóa `access_token` cookie, **không xóa `refresh_token`** và không revoke token trong DB | Xóa cả 2 cookies + revoke `refreshToken` trong DB | 🔴 **Main flow logout**: Sửa bug bảo mật quan trọng |
| [JwtFilter](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/config/jwt/JwtFilter.java) | **Token refresh**: `user.getRefreshToken().equals(refreshToken)` — NPE nếu `refreshToken` null; không check `isActive()` | Thêm null check + `user.isActive()` check | 🟡 Sửa NPE + block inactive user token refresh |
| [OAuth2LoginSuccessHandler](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/config/jwt/OAuth2LoginSuccessHandler.java) | Google OAuth: inactive user vẫn login được | Thêm `isActive()` check, redirect `/login?error=inactive` | 🟡 Alternative flow: Google OAuth inactive block |
| [WashSessionService](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/service/WashSessionService.java) | **Start session**: Set booking status `COMPLETED` ngay khi start (sai!) | Start → set `CONFIRMED`; Complete → set `COMPLETED` | 🔴 **Main flow check-in**: Sửa bug trạng thái nghiêm trọng |
| [WashSessionService](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/service/WashSessionService.java) | **Duplicate check-in**: Có thể start session 2 lần cho cùng booking | Thêm `validateCheckinStatus()` + `validateSessionsCanStart()` | 🟡 Alternative flow: Chặn duplicate |
| [BookingService](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/service/BookingService.java) | **Cancel**: Refund voucher cả khi deposit chưa paid | Chỉ refund khi `depositWasPaid = true` | 🟡 Alternative flow: Cancel logic đúng hơn |
| [BookingService](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/service/BookingService.java) | **Concurrent booking**: Không lock slot → race condition | Thêm `lockCapacityForTimeRange()` cho `READ_COMMITTED` isolation | 🟡 Alternative flow: Tránh double-booking |
| [VnpayController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/VnpayController.java) | **VNPay return**: Không verify signature trước khi xử lý | Thêm `verifySignature()` check | 🟡 Security: Chặn tampered VNPay callback |

---

### 🟢 Nhóm 4: New Features

| File | Feature mới | Impact |
|---|---|---|
| [ServiceService](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/service/ServiceService.java) | Thêm `restoreService()` method | 🟢 Admin flow: Restore service đã deactivate |
| [BookingService](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/service/BookingService.java) | Thêm `validateServiceCombination()` — chặn mix premium + basic, hoặc 2 premium | 🟢 Customer booking: Business rule enforcement |
| [BookingController](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/controller/BookingController.java) | `GET /api/bookings/pending-deposit` return type đổi thành `PendingBookingResponse` (thêm `billingId`) | 🟡 Customer flow: Response structure thay đổi |
| [BackendApplication](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/BackendApplication.java) | `@EnableScheduling` chuyển sang `SchedulingConfiguration` với `@Profile("!e2e")` | 🟢 Infra only: Scheduler tắt trong E2E profile |
| [NotificationService](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/service/NotificationService.java) | Thêm `getUnreadCount()` endpoint | 🟢 Customer notification flow |
| [GlobalExceptionHandler](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/backend/src/main/java/com/autowashpro/backend/exception/GlobalExceptionHandler.java) | Thêm handler cho `AccountInactiveException` (403), `AccessDeniedException` (403), `IllegalArgumentException` (400) | 🟢 Error handling cải thiện |

---

## Frontend — Tóm tắt: 30 files, +148 / -139 lines

### 🟢 Nhóm 1: Structural Additions

| File | Thay đổi | Impact |
|---|---|---|
| [App.jsx](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/frontend/src/App.jsx) | Thêm catch-all `<Route path="*">` → 404 page | 🟢 Mới, không ảnh hưởng flow cũ |
| [Sidebar.css](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/frontend/src/components/Layout/Sidebar/Sidebar.css) | Thêm responsive CSS cho mobile sidebar (`.sidebar__mobile-trigger`, `.sidebar__overlay`, `min-width: 0`) | 🟢 CSS only, cải thiện responsive |
| [eslint.config.js](file:///c:/Users/vq/Documents/FU/SU26/project/autowash-pro/frontend/eslint.config.js) | Cập nhật ESLint rules | 🟢 Dev tooling only |

### 🟢 Nhóm 2: Lint / React Fixes (Không ảnh hưởng logic)

| Pattern | Files ảnh hưởng | Thay đổi |
|---|---|---|
| Xóa `import React` không cần thiết | ~15 files | React 19 không cần `import React` |
| `useCallback` wrap cho hàm trong `useEffect` deps | Checkin.jsx, Payment.jsx, StaffDashboard.jsx | Fix React exhaustive-deps warning |
| Xóa unused imports | Navbar (`InfoCircleOutlined`), StaffDashboard (`BellOutlined`), Checkin (`Avatar`), v.v. | Lint cleanup |
| Fix `Math.random()` as React key | Staff Payment.jsx | Dùng `index` thay vì `Math.random()` |
| Thêm missing `useEffect` deps | Payment.jsx, Checkin.jsx | Fix React warning |
| Fix `no-unused-vars` | StaffDashboard (`loadingTodayBookings`), Checkin (`getVehicleType`) | Xóa biến không dùng |

### 🟢 Nhóm 3: Minor UI/CSS Tweaks

| File | Thay đổi |
|---|---|
| SignUpForm.jsx | Thêm `id` attribute cho form fields (`#signup_email`, `#signup_password`, etc.) — cho E2E selectors |
| AdminDashboard.jsx | Thêm CSS class names cho chart cards, transactions card, bays card — cho E2E selectors |
| Customer.jsx, Staff.jsx, Service.jsx | Thêm CSS class names cho search, filter, toolbar — cho E2E selectors |
| Blog pages | Fix trailing whitespace, `import React` removal |

---

## Verdict — Ma trận rủi ro

| Loại thay đổi | Ảnh hưởng Main Flow? | Ảnh hưởng Alt Flow? | Rủi ro |
|---|---|---|---|
| **RBAC @PreAuthorize** | ✅ Có — API giờ enforce role | ❌ | 🟡 **Trung bình** — nếu frontend gọi đúng role thì OK, chỉ chặn cross-role abuse |
| **Ownership validation** | ✅ Có — verify customerId/vehicleId/billingId | ❌ | 🟢 **Thấp** — frontend thường gửi ID của user đang login |
| **Inactive user block** | ❌ | ✅ Có | 🟢 **Thấp** — chỉ block user bị deactivate |
| **Logout fix** | ✅ Có — logout giờ xóa cả 2 cookie + revoke DB | ❌ | 🟢 **Tốt** — sửa bug bảo mật |
| **WashSession state machine fix** | ✅ Có — Start → CONFIRMED, Complete → COMPLETED | ❌ | 🟡 **Trung bình** — logic cũ sai (COMPLETED ngay khi start) |
| **Premium service validation** | ❌ | ✅ Có | 🟢 **Thấp** — thêm business rule mới |
| **VNPay signature verify** | ❌ | ✅ Có | 🟢 **Tốt** — security improvement |
| **Pending deposit response type** | ✅ Có — response thêm `billingId` field | ❌ | 🟡 **Kiểm tra** frontend có parse đúng không |
| **Frontend CSS/lint** | ❌ | ❌ | 🟢 **Không rủi ro** |
| **Frontend 404 page** | ❌ | ❌ | 🟢 **Không rủi ro** — thêm mới |
| **Frontend `id` attributes** | ❌ | ❌ | 🟢 **Không rủi ro** — chỉ thêm `id` cho form fields |

---

## Kết luận

> [!IMPORTANT]
> **3 thay đổi cần review kỹ nhất:**
>
> 1. **WashSession state machine**: `startSession()` trước set `COMPLETED`, giờ set `CONFIRMED`. Nếu code khác (scheduler, cron, frontend) check `status == COMPLETED` sau khi start thì sẽ bị sai.
>
> 2. **`POST /api/v2/bookings`** giờ lấy customer từ JWT email thay vì từ `customerId` trong request body. Frontend cần đảm bảo vẫn gửi `customerId` khớp hoặc null.
>
> 3. **`POST /api/staff/v2/wash-sessions/start`** — `staffId` param giờ bị ignored, lấy từ JWT. Frontend staff check-in page vẫn gửi `staffId` nhưng backend bỏ qua nó → **Không lỗi, nhưng param vô nghĩa**.

Tất cả các thay đổi khác đều là **cải thiện bảo mật** hợp lý và **không breaking** nếu frontend gọi API đúng role và đúng user.
