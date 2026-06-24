# 🚗 AutoWash Pro

A full-stack web application for managing a car wash business — bookings, customers, and services in one place.

---

## ✨ Features

- 📅 Book and manage car wash appointments
- 👤 Customer management
- 🛠️ Service & pricing management
- 🔐 Authentication with Spring Security & JWT
- 📊 Admin dashboard

---

## 🛠️ Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React, JavaScript, CSS            |
| Backend  | Java, Spring Boot, Spring Security, JWT, Spring Data JPA |
| Database | MariaDB (MySQL compatible)        |
| DevOps   | Docker, Docker Compose            |

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose installed
- Git

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/nhannk15/autowash-pro.git
   cd autowash-pro
   ```

2. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   MYSQL_ROOT_PASSWORD=yourRootPassword
   MYSQL_USER=autowash_user
   MYSQL_PASSWORD=yourPassword

   SPRING_DATASOURCE_URL=jdbc:mariadb://mysql:3306/autowash
   SPRING_DATASOURCE_USERNAME=autowash_user
   SPRING_DATASOURCE_PASSWORD=yourPassword
   SPRING_JPA_HIBERNATE_DDL_AUTO=update
   ```

3. **Run with Docker Compose**
   ```bash
   docker compose up --build
   ```

4. **Access the app**
   - Frontend: http://localhost
   - Backend API: http://localhost:8080

---

## 📁 Project Structure

```
autowash-pro/
├── frontend/        # React app
├── backend/         # Spring Boot API
├── docker-compose.yml
└── .env             # Environment variables (not committed)
```

---

## 👤 Author

**Nguyen Khac Le Nhan**
- GitHub: [@nhannk15](https://github.com/nhannk15)
- Email: nhannk15@gmail.com
**Ho Duong Nhat Quang**
- GitHub: [@nhatquanghoduong-svg](https://github.com/nhatquanghoduong-svg)
- Email: nhatquanghoduong@gmail.com
**Dang Nhat Thien Bao**
- GitHub: [@MeoSatThu12](https://github.com/MeoSatThu12)
- Email: baothi762@gmail.com
**Tran Vuong Quan**
- GitHub: [@nauppnouv](https://github.com/nauppnouv)
- Email: tranvuongquan2707@gmail.com
