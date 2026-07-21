# 🚗 AutoWash Pro

> SWP391 — Software Development Project | FPT University

A full-stack car wash management system covering booking, walk-in check-in, billing & VNPay payments, staff/admin operations, and a customer loyalty program (membership tiers, points, vouchers, rewards, promotions).

---

## 📖 Description

AutoWash Pro digitizes the day-to-day operations of a car wash business end-to-end:

- **Customers** can register/login (email+password or Google OAuth2), manage their vehicles, book a wash slot, track loyalty points, redeem vouchers/rewards, and pay online via VNPay.
- **Staff** can check customers in (including QR-code scan), manage wash sessions/wash bays, process walk-in or booked customers, and handle cash/voucher payments.
- **Admins** get a full back-office: dashboard analytics (revenue, peak hours, service distribution, recent transactions), staff & service management, membership tier configuration, promotions, and reward CRUD.

The system also includes background jobs (e.g. auto-expiring stale bookings), email notifications (OTP for forgot-password, booking confirmation), and a CI/CD pipeline that auto-deploys the `develop` branch to an EC2 server via Docker Compose.

### Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.5, Spring Security (JWT + OAuth2 Login), Spring Data JPA, MapStruct, Lombok, springdoc-openapi (Swagger), ZXing (QR code) |
| Frontend | React 19, Vite, Ant Design (antd), React Router, Axios, Recharts, html5-qrcode |
| Database | MariaDB 10.11 (MySQL-compatible) |
| Payment | VNPay |
| Infra | Docker / Docker Compose, Nginx (reverse proxy + static hosting), GitHub Actions (CI/CD to EC2) |

### Project Structure

```
autowash-pro/
├── backend/                  # Spring Boot REST API
│   └── src/main/java/com/autowashpro/backend/
│       ├── controller/        # REST endpoints
│       ├── service/           # Business logic
│       ├── repository/        # Spring Data JPA repositories
│       ├── model/
│       │   ├── entity/        # JPA entities
│       │   ├── dto/           # Request/response DTOs
│       │   └── enums/
│       ├── mapper/             # MapStruct mappers (entity <-> DTO)
│       ├── config/             # Security, JWT, OAuth2, VNPay config
│       ├── schedule/            # Scheduled jobs (e.g. expired booking cleanup)
│       └── seeder/              # Initial/demo data seeding
├── frontend/                 # React + Vite SPA
│   └── src/
│       ├── pages/              # HomePage, LoginPage, RegisterPage, ForgotPassPage,
│       │                       # CustomerPage, StaffPage, AdminPage, ServicePage, BlogPage
│       ├── components/
│       ├── service/             # Axios API clients
│       ├── context/
│       └── routes/              # Route guards
├── docker-compose.yml         # mysql (mariadb) + backend + frontend services
└── paper.md                   # ERD / database design documentation
```

---

## ⚙️ Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose (recommended, easiest path), or
- Java 21 + Maven, Node.js 22+, and a local MySQL/MariaDB instance for manual setup

### Option A — Run with Docker Compose (recommended)

1. Clone the repository and switch to the `develop` branch:
   ```bash
   git clone https://github.com/nhannk15/autowash-pro.git
   cd autowash-pro
   git checkout develop
   ```

2. Create a `.env` file in the project root (same folder as `docker-compose.yml`):
   ```env
   MYSQL_ROOT_PASSWORD=your_root_password
   MYSQL_USER=autowash
   MYSQL_PASSWORD=your_db_password

   SPRING_DATASOURCE_URL=jdbc:mariadb://mysql:3306/autowash
   SPRING_DATASOURCE_USERNAME=autowash
   SPRING_DATASOURCE_PASSWORD=your_db_password
   SPRING_JPA_HIBERNATE_DDL_AUTO=update

   FRONTEND_BASE_URL=http://localhost
   ```

3. Build and start all services (MariaDB + Spring Boot backend + Nginx-served frontend):
   ```bash
   docker compose up -d --build
   ```

4. Open the app:
   - Frontend: `http://localhost`
   - Backend API / Swagger UI: `http://localhost:8080/swagger-ui.html`

### Option B — Run manually (for local development)

**Backend**

```bash
cd backend
```

Create `backend/src/main/resources/application.properties` (this file is git-ignored on purpose, since it holds secrets):

```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/autowash
spring.datasource.username=root
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update

jwt.secret-key=your_jwt_secret_key

frontend.base-url=http://localhost:5173
email.sendbooking=your_email@example.com

# Google OAuth2 login
spring.security.oauth2.client.registration.google.client-id=your_google_client_id
spring.security.oauth2.client.registration.google.client-secret=your_google_client_secret

# Mail (used for OTP / booking emails)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@example.com
spring.mail.password=your_email_app_password

# VNPay
vnpay.tmnCode=your_vnpay_tmn_code
vnpay.hashSecret=your_vnpay_hash_secret
vnpay.payUrl=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
vnpay.returnUrl=http://localhost:5173/payment-result
vnpay.ipnUrl=http://localhost:8080/api/vnpay/ipn
vnpay.version=2.1.0
vnpay.command=pay
vnpay.currCode=VND
vnpay.locale=vn
```

Then run:

```bash
./mvnw spring-boot:run
```

The API will start on `http://localhost:8080`.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The app will start on `http://localhost:5173` (Vite default).

> ⚠️ Make sure MariaDB/MySQL is running locally and the `autowash` database exists before starting the backend.

---

## 👥 Team Members

This is a 4-person SWP391 team project.

| Member | GitHub identity (incl. aliases) | Main contributions |
|---|---|---|
| **Nguyen Khac Le Nhan** (nhannk15) | `Nguyen Khac Le Nhan`, `William` (local alias) | Repository owner & team lead — reviewed and merged the large majority of pull requests into `develop`, managed branching/CI-CD; also built backend Admin Dashboard analytics (revenue, peak-hours, service distribution, recent transactions, daily summary), the expired-booking scheduler, and staff booking cancellation. |
| **Tran Vuong Quan** | `nauppnouv`, `Trần Vương Quân` | Backend & DevOps — authentication (OTP forgot-password flow), Reward & MembershipTier CRUD APIs, customer rewards API, QR-code booking email + camera check-in, Docker/CI-CD fixes (production CORS/Nginx/env config), entity-mapping fixes. |
| **Ho Duong Nhat Quang** | `nhatquanghoduong-svg`, `Nhat Quang` | Frontend (Staff & Admin side) + supporting APIs — route guards, Admin dashboard, Service, and Staff management pages, staff check-in page, staff payment (voucher/cash) APIs, Login/Forgot-password pages. |
| **Dang Nhat Thien Bao** (MeoSatThu12) | `MeoSatThu12` | Frontend (Customer side) + Reward/Promotion features — Customer & Blog pages, voucher/promotion application, payment page UI, membership tier admin UI, reward management UI, responsive layout for the customer portal. |

---

## 📝 Conventional Commits

| Prefix | Meaning |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `chore` | Setup/config/project structure |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or fixing tests |

Examples:
```
feat: login page
chore: set up project
fix: correct entity mapping errors
```

