# AutoWash Pro — ERD (Merged)

---

## Entities (17)

| # | Entity | Nhóm | Vai trò |
|---|--------|------|---------|
| 1 | User | Auth | Tài khoản đăng nhập — Google OAuth / email+password |
| 2 | Customer | Khách hàng | Hồ sơ khách hàng + trạng thái loyalty |
| 3 | Staff | Nhân sự | Nhân viên / quản lý |
| 4 | Vehicle | Khách hàng | Phương tiện — biển số nhận diện LPR |
| 5 | MembershipTier | Loyalty | Cấu hình hạng thành viên |
| 6 | TierRule | Loyalty | Điều kiện nâng/hạ hạng — tách riêng khỏi MembershipTier |
| 7 | Service | Dịch vụ | Danh mục dịch vụ rửa xe |
| 8 | Booking | Đặt lịch | Lịch hẹn đặt trước |
| 9 | WashSession | Rửa xe | Phiên rửa xe thực tế — trung tâm nghiệp vụ |
| 10 | Billing | Thanh toán | Hóa đơn thanh toán |
| 11 | Reward | Đổi thưởng | Danh mục phần thưởng đổi điểm |
| 12 | Voucher | Đổi thưởng | Mã ưu đãi cấp cho khách |
| 13 | Promotion | Khuyến mãi | Chương trình khuyến mãi theo thời gian |
| 14 | PromotionUsage | Khuyến mãi | Nhật ký từng lượt dùng promotion |
| 15 | PointTransaction | Loyalty | Sổ cái điểm — append-only |
| 16 | Notification | Thông báo | Kênh giao tiếp chủ động với khách |
| 17 | WashBay | Rửa xe | Khoang rửa xe vật lý tại cửa hàng |

---

## Sơ đồ tổng quan

### Sơ đồ 1 — Auth

```
                         ┌──────────┐
                         │   User   │
                         └────┬─────┘
                  ┌───────────┴───────────┐
                0..1                    1:1
                  │                       │
          ┌───────┴────────┐     ┌────────┴───────┐
          │    Customer    │     │     Staff      │
          └────────────────┘     └────────────────┘
```

### Sơ đồ 2 — Customer Hub

```
                                              ┌──────────────┐
                  ┌────────────1:N────────────►│ Notification │
                  │                           └──────────────┘
                  │
        ┌─────────┴──────────┐  1:N  ┌──────────┐
        │                    ├──────►│ Vehicle  │
        │                    │       └──────────┘
        │                    │  1:N  ┌──────────┐
        │      Customer      ├──────►│ Booking  │
        │                    │       └──────────┘
        │                    │  1:N  ┌──────────────────┐
        │                    ├──────►│  PointTransaction │
        │                    │       └──────────────────┘
        │                    │  1:N  ┌──────────┐
        │                    ├──────►│  Voucher │
        │                    │       └──────────┘
        │                    │  N:1  ┌────────────────┐
        │                    ├──────►│ MembershipTier │
        └────────────────────┘       └────────────────┘
```

### Sơ đồ 3 — Luồng nghiệp vụ

```
  ┌──────────┐ 1:N (nullable)
  │ WashBay  ├────────────────────────────────────────┐
  └────┬─────┘                                        │
       │ 1:N (not null)                               ▼
       │                        Staff         ┌───────────┐
       │                          │           │  Booking  │
       │                         1:N          └─────┬─────┘
       │                          ▼           0..1:1│
       │         Customer ─┐                        │
       │         Vehicle  ─┤──1:N                   │
       │         Service  ─┘    │                   │
       │                        ▼                   ▼
       └───────────────────►┌─────────────┐  1:1  ┌─────────────┐
                            │ WashSession ├───────►│   Billing   │
                            └──────┬──────┘        └──┬───────┬──┘
                                   │                  │       │1:N
                                  1:N             0..1:1       │
                                   │                  │  ┌────┴───────────┐
                                   ▼                  ▼  │ PromotionUsage │
                        ┌──────────────────┐  ┌───────┐  └────────────────┘
                        │  PointTransaction│  │Voucher│
                        └──────────────────┘  └───────┘
```

### Sơ đồ 4 — Membership & Tier

```
  Customer.tier_id ──N:1──► MembershipTier ──1:1──► TierRule
                                │                       │
                                │                       └── downgrade_to_tier_id
                                │                           (self-ref → MembershipTier)
                                └──1:N──► Promotion (min_tier_id)
```

### Sơ đồ 5 — Đổi thưởng & Điểm

```
  Reward ──1:N──► Voucher ──0..1──► Billing
    │                │
    │(N:1)           ├──1:0..1──► PointTransaction (type = redeem)
    ▼                │
  Service*           └── status: active / used / expired
  (free_wash/addon)      expires_at, voucher_code

  WashSession ──1:N──► PointTransaction (type = earn)
  Staff       ──1:N──► PointTransaction (type = adjust, manual)
```

---

## Các mối quan hệ (31)

| # | Từ | Tới | Kiểu | FK | Mô tả |
|---|----|----|------|-----|-------|
| 1 | User | Customer | 1:0..1 | Customer.user_id | Walk-in không cần User |
| 2 | User | Staff | 1:1 | Staff.user_id | 1 User = 1 Staff |
| 3 | Customer | MembershipTier | N:1 | Customer.tier_id | Khách thuộc 1 hạng |
| 4 | Customer | Vehicle | 1:N | Vehicle.customer_id | 1 khách nhiều xe |
| 5 | Customer | Booking | 1:N | Booking.customer_id | 1 khách nhiều lịch hẹn |
| 6 | Customer | WashSession | 1:N | WashSession.customer_id | 1 khách nhiều phiên rửa |
| 7 | Customer | Voucher | 1:N | Voucher.customer_id | 1 khách nhiều voucher |
| 8 | Customer | PointTransaction | 1:N | PointTransaction.customer_id | Lịch sử điểm của khách |
| 9 | Customer | Notification | 1:N | Notification.customer_id | Khách nhận nhiều thông báo |
| 10 | Vehicle | Booking | 1:N | Booking.vehicle_id | 1 xe trong nhiều lịch hẹn |
| 11 | Vehicle | WashSession | 1:N | WashSession.vehicle_id | 1 xe trong nhiều phiên rửa |
| 12 | MembershipTier | TierRule | 1:1 | TierRule.tier_id | Mỗi hạng có 1 bộ điều kiện |
| 13 | MembershipTier | TierRule (self) | 1:N | TierRule.downgrade_to_tier_id | Hạ về hạng nào khi không đạt |
| 14 | MembershipTier | Promotion | 1:N | Promotion.min_tier_id | Hạng tối thiểu được hưởng promo |
| 15 | Service | Booking | 1:N | Booking.service_id | 1 dịch vụ trong nhiều lịch hẹn |
| 16 | Service | WashSession | 1:N | WashSession.service_id | 1 dịch vụ thực hiện nhiều phiên |
| 17 | Service | Reward | 1:N | Reward.service_id | free_wash / addon gắn với service cụ thể |
| 18 | Service | Promotion | 1:N | Promotion.service_id | free_service gắn với service cụ thể |
| 19 | Booking | WashSession | 0..1:1 | WashSession.booking_id | Walk-in không có booking |
| 20 | Staff | WashSession | 1:N | WashSession.staff_id | 1 nhân viên thực hiện nhiều phiên |
| 21 | Staff | Promotion | 1:N | Promotion.created_by_staff_id | Admin/Manager tạo promo |
| 22 | Staff | PointTransaction | 1:N | PointTransaction.created_by_staff_id | Admin điều chỉnh điểm thủ công |
| 23 | WashSession | Billing | 1:1 | Billing.session_id | Mỗi phiên rửa có đúng 1 hóa đơn |
| 24 | WashSession | PointTransaction | 1:N | PointTransaction.session_id | Phiên rửa sinh giao dịch điểm EARN |
| 25 | Reward | Voucher | 1:N | Voucher.reward_id | 1 loại reward sinh nhiều voucher |
| 26 | Voucher | Billing | 0..1:1 | Billing.voucher_id | Voucher dùng tại bước thanh toán |
| 27 | Voucher | PointTransaction | 1:0..1 | PointTransaction.voucher_id | Redeem điểm tạo voucher — 0 nếu staff cấp thủ công |
| 28 | Billing | PromotionUsage | 1:N | PromotionUsage.billing_id | 1 hóa đơn áp nhiều promotion |
| 29 | Promotion | PromotionUsage | 1:N | PromotionUsage.promotion_id | 1 promo dùng nhiều lần |
| 30 | WashBay | WashSession | 1:N | WashSession.bay_id | Mỗi phiên rửa xe được thực hiện tại một khoang |
| 31 | WashBay | Booking | 1:N | Booking.bay_id (nullable) | Đặt lịch trước gán cứng khoang — NULL với khách vãng lai (walk-in) |

---

## Entity Attributes

### 1. User
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | INT | PK, AUTO_INCREMENT | |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Email đăng nhập |
| google_id | VARCHAR(100) | UNIQUE, NULL | Google OAuth ID |
| password_hash | VARCHAR(255) | NULL | NULL nếu dùng Google OAuth |
| full_name | VARCHAR(100) | NOT NULL | Họ tên |
| phone_number | VARCHAR(15) | NULL | SĐT |
| role | ENUM | NOT NULL | `customer` / `staff` / `admin` |
| avatar_url | VARCHAR(255) | NULL | Ảnh đại diện |
| is_active | BOOLEAN | DEFAULT TRUE | Trạng thái tài khoản |
| created_at | DATETIME | DEFAULT NOW() | Ngày tạo |

---

### 2. Customer
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| customer_id | INT | PK, AUTO_INCREMENT | |
| user_id | INT | FK → User, UNIQUE, NULL | NULL = vãng lai (walk-in) |
| date_of_birth | DATE | NULL | Ngày sinh |
| tier_id | INT | FK → MembershipTier, NOT NULL | Hạng hiện tại |
| current_points | INT | DEFAULT 0 | Điểm khả dụng hiện tại (cache) |
| lifetime_points | INT | DEFAULT 0 | Tổng điểm tích lũy toàn thời gian |
| tier_start_date | DATE | NOT NULL | Ngày đạt hạng hiện tại |
| last_review_date | DATE | NULL | Ngày review gần nhất |
| next_review_date | DATE | NOT NULL | Ngày review tiếp theo |
| is_active | BOOLEAN | DEFAULT TRUE | Trạng thái khách hàng |
| created_at | DATETIME | DEFAULT NOW() | Ngày đăng ký |
| updated_at | DATETIME | DEFAULT NOW() | Lần cập nhật gần nhất |

> `current_points` là cache — nguồn thật là `balance_after` của PointTransaction gần nhất.

---

### 3. Staff
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| staff_id | INT | PK, AUTO_INCREMENT | |
| user_id | INT | FK → User, UNIQUE, NOT NULL | Tài khoản đăng nhập |
| full_name | VARCHAR(100) | NOT NULL | Họ tên |
| phone_number | VARCHAR(15) | UNIQUE, NOT NULL | SĐT |
| role | ENUM | NOT NULL | `washer` / `manager` / `admin` |
| is_active | BOOLEAN | DEFAULT TRUE | Còn làm việc |
| hired_date | DATE | NOT NULL | Ngày vào làm |
| created_at | DATETIME | DEFAULT NOW() | Ngày tạo hồ sơ |

---

### 4. Vehicle
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| vehicle_id | INT | PK, AUTO_INCREMENT | |
| customer_id | INT | FK → Customer, NOT NULL | Chủ xe |
| license_plate | VARCHAR(20) | UNIQUE, NOT NULL | Biển số — dùng cho LPR |
| brand | VARCHAR(50) | NULL | Hãng xe |
| model | VARCHAR(50) | NULL | Mẫu xe |
| color | VARCHAR(30) | NULL | Màu xe |
| is_active | BOOLEAN | DEFAULT TRUE | Còn sử dụng |
| created_at | DATETIME | DEFAULT NOW() | Ngày thêm xe |

---

### 5. MembershipTier
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| tier_id | INT | PK, AUTO_INCREMENT | |
| tier_name | VARCHAR(20) | UNIQUE, NOT NULL | Member / Silver / Gold / Platinum |
| tier_level | TINYINT | UNIQUE, NOT NULL | Thứ tự ưu tiên 1 → 4 |
| booking_window_days | TINYINT | NOT NULL | Số ngày được đặt lịch trước |
| priority_queue_order | TINYINT | NOT NULL | Thứ tự ưu tiên hàng đợi |
| point_earn_rate | DECIMAL(5,2) | DEFAULT 1.0 | Hệ số nhân điểm khi rửa |
| min_points_to_reach | INT | NOT NULL | Điểm tối thiểu để đạt hạng này |
| perks_description | TEXT | NULL | Mô tả quyền lợi hạng |

---

### 6. TierRule
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| rule_id | INT | PK, AUTO_INCREMENT | |
| tier_id | INT | FK → MembershipTier, UNIQUE, NOT NULL | Rule áp dụng cho hạng nào |
| min_visits_per_period | INT | NOT NULL | Lần rửa tối thiểu trong kỳ để giữ hạng |
| min_spend_per_period | DECIMAL(12,2) | NOT NULL | Chi tiêu tối thiểu trong kỳ (VND) |
| review_period_months | TINYINT | DEFAULT 1 | Chu kỳ review (tháng) |
| downgrade_to_tier_id | INT | FK → MembershipTier, NULL | Hạ xuống hạng nào nếu không đạt |

> `downgrade_to_tier_id = NULL` có nghĩa là hạng thấp nhất, không thể hạ thêm.

---

### 7. Service
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| service_id | INT | PK, AUTO_INCREMENT | |
| service_name | VARCHAR(100) | NOT NULL | Tên dịch vụ |
| description | TEXT | NULL | Mô tả chi tiết |
| base_price | DECIMAL(10,2) | NOT NULL | Giá cơ bản (VND) |
| duration_minutes | INT | NOT NULL | Thời gian thực hiện (phút) |
| category | ENUM | NOT NULL | `basic` / `premium` / `addon` |
| is_active | BOOLEAN | DEFAULT TRUE | Còn cung cấp |

> Điểm earn = `base_price × MembershipTier.point_earn_rate × Service.point_multiplier`

---

### 8. Booking
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| booking_id | INT | PK, AUTO_INCREMENT | |
| customer_id | INT | FK → Customer, NOT NULL | Khách đặt lịch |
| vehicle_id | INT | FK → Vehicle, NOT NULL | Xe đặt dịch vụ |
| service_id | INT | FK → Service, NOT NULL | Dịch vụ đặt |
| bay_id | INT | FK → WashBay, NULL | Khoang được gán cứng khi đặt lịch — NULL nếu walk-in |
| scheduled_datetime | DATETIME | NOT NULL | Thời gian hẹn |
| status | ENUM | DEFAULT 'confirmed' | `confirmed` / `cancelled` / `no_show` / `completed` |
| notes | TEXT | NULL | Ghi chú của khách |
| created_at | DATETIME | DEFAULT NOW() | Ngày tạo |
| cancelled_at | DATETIME | NULL | Thời điểm hủy |
| cancel_reason | VARCHAR(255) | NULL | Lý do hủy |

> **Phương án 2 — Gán cứng khoang:** Khi khách đặt lịch trước dịch vụ yêu cầu trang thiết bị đặc biệt (vd: Rửa + Nano chỉ thực hiện được tại Khoang 3), hệ thống gán `bay_id` ngay tại thời điểm booking. Walk-in để `bay_id = NULL`, khoang sẽ được gán khi tạo `WashSession`.

---

### 9. WashSession
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| session_id | INT | PK, AUTO_INCREMENT | |
| booking_id | INT | FK → Booking, UNIQUE, NULL | NULL = walk-in không có lịch |
| customer_id | INT | FK → Customer, NOT NULL | Khách hàng |
| vehicle_id | INT | FK → Vehicle, NOT NULL | Xe được rửa |
| service_id | INT | FK → Service, NOT NULL | Dịch vụ thực hiện |
| staff_id | INT | FK → Staff, NOT NULL | Nhân viên rửa xe |
| bay_id | INT | FK → WashBay, NOT NULL | Khoang thực hiện rửa xe |
| start_time | DATETIME | NOT NULL | Giờ bắt đầu |
| end_time | DATETIME | NULL | Giờ kết thúc |
| status | ENUM | DEFAULT 'in_progress' | `in_progress` / `completed` / `cancelled` |

---

### 10. Billing
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| billing_id | INT | PK, AUTO_INCREMENT | |
| session_id | INT | FK → WashSession, UNIQUE, NOT NULL | Phiên rửa xe |
| voucher_id | INT | FK → Voucher, NULL | Voucher áp dụng (nếu có) |
| original_amount | DECIMAL(10,2) | NOT NULL | Giá gốc của service |
| discount_amount | DECIMAL(10,2) | DEFAULT 0 | Tổng giảm từ Promotion + Voucher |
| final_amount | DECIMAL(10,2) | NOT NULL | Số tiền thực trả |
| payment_method | ENUM | NOT NULL | `cash` / `bank_transfer` / `momo` / `zalopay` |
| payment_status | ENUM | DEFAULT 'pending' | `pending` / `paid` / `cancelled` |
| paid_at | DATETIME | NULL | Thời điểm thanh toán (NULL khi chưa PAID) |
| point_multiplier | DECIMAL(4,2) | DEFAULT 1.0 | Hệ số nhân điểm riêng của dịch vụ |
| created_at | DATETIME | DEFAULT NOW() | Ngày tạo hóa đơn |

> **Cách tính discount_amount** (backend tính 1 lần khi thanh toán, lưu snapshot):
> 1. Voucher: `Billing.voucher_id → Voucher.discount_type + discount_value` → tính `voucher_discount`
> 2. Promotion: `SUM(PromotionUsage.discount_amount) WHERE billing_id = this` → `promo_total`
> 3. `discount_amount = voucher_discount + promo_total`
> 4. `final_amount = MAX(0, original_amount − discount_amount)`

---

### 11. Reward
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| reward_id | INT | PK, AUTO_INCREMENT | |
| reward_name | VARCHAR(100) | NOT NULL | Tên phần thưởng |
| reward_type | ENUM | NOT NULL | `discount_flat` / `discount_percentage` / `free_wash` / `addon` |
| point_cost | INT | NOT NULL | Điểm cần để đổi |
| discount_value | DECIMAL(10,2) | NULL | Giá trị catalog: số tiền (`discount_flat`) hoặc % (`discount_percentage`) — admin có thể sửa |
| validity_days | INT | NOT NULL, DEFAULT 180 | Số ngày voucher còn hiệu lực kể từ ngày cấp |
| service_id | INT | FK → Service, NULL | Service áp dụng — chỉ dùng cho `free_wash` / `addon` |
| description | TEXT | NULL | Mô tả phần thưởng |
| is_active | BOOLEAN | DEFAULT TRUE | Còn đổi được |
| created_at | DATETIME | DEFAULT NOW() | Ngày tạo |

---

### 12. Voucher
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| voucher_id | INT | PK, AUTO_INCREMENT | |
| voucher_code | VARCHAR(20) | UNIQUE, NOT NULL | Mã voucher hiển thị cho khách |
| reward_id | INT | FK → Reward, NOT NULL | Loại phần thưởng |
| discount_type | ENUM | NOT NULL | Snapshot reward_type lúc cấp: `discount_flat` / `discount_percentage` / `free_wash` / `addon` |
| discount_value | DECIMAL(10,2) | NULL | Snapshot bất biến từ Reward.discount_value lúc cấp — NULL với `free_wash` / `addon` |
| customer_id | INT | FK → Customer, NOT NULL | Khách sở hữu |
| status | ENUM | DEFAULT 'active' | `active` / `used` / `expired` |
| issued_at | DATETIME | DEFAULT NOW() | Ngày cấp voucher |
| expires_at | DATETIME | NOT NULL | Hạn sử dụng |
| used_at | DATETIME | NULL | Thời điểm dùng |

> `discount_type` + `discount_value` là snapshot tại thời điểm cấp — Reward thay đổi sau không ảnh hưởng voucher đã cấp.

---

### 13. Promotion
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| promotion_id | INT | PK, AUTO_INCREMENT | |
| promotion_name | VARCHAR(150) | NOT NULL | Tên chương trình |
| description | TEXT | NULL | Mô tả |
| start_date | DATETIME | NOT NULL | Ngày bắt đầu |
| end_date | DATETIME | NOT NULL | Ngày kết thúc |
| discount_type | ENUM | NOT NULL | `percentage` / `fixed_amount` / `free_service` |
| discount_value | DECIMAL(10,2) | NULL | Giá trị giảm (NULL với `free_service`) |
| service_id | INT | FK → Service, NULL | Service tặng miễn phí — chỉ dùng cho `free_service` |
| min_tier_id | INT | FK → MembershipTier, NULL | Hạng tối thiểu (NULL = tất cả) |
| max_uses_total | INT | NULL | Tổng lượt tối đa (NULL = không giới hạn) |
| max_uses_per_customer | INT | DEFAULT 1 | Số lượt mỗi khách được dùng |
| usage_count | INT | DEFAULT 0 | Tổng lượt đã dùng |
| is_active | BOOLEAN | DEFAULT TRUE | Đang chạy |
| created_by_staff_id | INT | FK → Staff, NOT NULL | Admin/Manager tạo |
| created_at | DATETIME | DEFAULT NOW() | Ngày tạo |

---

### 14. PromotionUsage
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| usage_id | INT | PK, AUTO_INCREMENT | |
| promotion_id | INT | FK → Promotion, NOT NULL | Promotion được áp dụng |
| billing_id | INT | FK → Billing, NOT NULL | Hóa đơn áp dụng |
| discount_amount | DECIMAL(10,2) | NOT NULL | Số tiền giảm thực tế từ promotion này tại billing |
| used_at | DATETIME | DEFAULT NOW() | Thời điểm áp dụng |

---

### 15. PointTransaction
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| transaction_id | INT | PK, AUTO_INCREMENT | |
| customer_id | INT | FK → Customer, NOT NULL | Khách hàng |
| session_id | INT | FK → WashSession, NULL | Phiên rửa — có khi type = `earn` |
| voucher_id | INT | FK → Voucher, NULL | Voucher — có khi type = `redeem` |
| transaction_type | ENUM | NOT NULL | `earn` / `redeem` / `expire` / `adjust` / `bonus` |
| points_change | INT | NOT NULL | Số điểm thay đổi (+/−) |
| balance_after | INT | NOT NULL | Số dư điểm sau giao dịch |
| description | VARCHAR(255) | NULL | Ghi chú hiển thị cho khách |
| expiry_date | DATE | NULL | Hạn dùng của điểm vừa earn (+12 tháng) |
| created_by_staff_id | INT | FK → Staff, NULL | Staff điều chỉnh thủ công (type = `adjust`) |
| created_at | DATETIME | DEFAULT NOW() | Thời điểm giao dịch |

> **Append-only**: chỉ INSERT, không UPDATE/DELETE.  
> `session_id` và `voucher_id` không null cùng lúc — đúng một trong hai tùy `transaction_type`.

---

### 16. Notification
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| notification_id | INT | PK, AUTO_INCREMENT | |
| customer_id | INT | FK → Customer, NOT NULL | Người nhận |
| notification_type | ENUM | NOT NULL | `tier_upgrade` / `tier_downgrade` / `points_earned` / `points_expiry` / `booking_confirmed` / `booking_reminder` / `voucher_issued` / `promotion` |
| title | VARCHAR(150) | NOT NULL | Tiêu đề ngắn |
| body | TEXT | NOT NULL | Nội dung chi tiết |
| ref_id | BIGINT | NULL | ID tham chiếu tùy context |
| ref_type | VARCHAR(50) | NULL | `BOOKING` / `WASH_SESSION` / `VOUCHER` / `PROMOTION` |
| is_read | BOOLEAN | DEFAULT FALSE | Đã đọc chưa |
| read_at | DATETIME | NULL | Thời điểm đọc |
| created_at | DATETIME | DEFAULT NOW() | Thời điểm gửi |

---

### 17. WashBay
| Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| bay_id | INT | PK, AUTO_INCREMENT | |
| bay_name | VARCHAR(50) | UNIQUE, NOT NULL | Tên khoang (vd: "Khoang 01", "Khoang Premium Nano") |
| status | ENUM | NOT NULL, DEFAULT 'active' | Trạng thái: `active` (đang chạy), `inactive` (tạm dừng), `maintenance` (bảo trì) |
| created_at | DATETIME | DEFAULT NOW() | Ngày tạo khoang |

---

## Tổng kết

| Hạng mục | Số lượng |
|----------|----------|
| Tổng Entity | 17 |
| Tổng Relationships | 31 |
| Quan hệ 1:1 | 4 |
| Quan hệ 1:N | 26 |
| Quan hệ self-referencing | 1 |
| Tổng thuộc tính | ~155 |
