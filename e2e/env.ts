export const env = {
  baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000',
  backendURL: process.env.E2E_BACKEND_URL ?? 'http://127.0.0.1:8081',
  mailpitURL: process.env.E2E_MAILPIT_URL ?? 'http://127.0.0.1:8025',
  customer: {
    email: process.env.E2E_CUSTOMER_EMAIL ?? 'e2e.customer@gmail.com',
    password: process.env.E2E_CUSTOMER_PASSWORD ?? 'e2e-password-123',
  },
  staff: {
    email: process.env.E2E_STAFF_EMAIL ?? 'e2e.staff@gmail.com',
    password: process.env.E2E_STAFF_PASSWORD ?? 'e2e-password-123',
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? 'e2e.admin@gmail.com',
    password: process.env.E2E_ADMIN_PASSWORD ?? 'e2e-password-123',
  },
  inactive: {
    email: process.env.E2E_INACTIVE_EMAIL ?? 'e2e.inactive@gmail.com',
    password: process.env.E2E_CUSTOMER_PASSWORD ?? 'e2e-password-123',
  },
} as const;
