# Lydia's Thrift — Admin Dashboard

Vite + React admin panel for the Lydia Thrift API.

## Setup

```bash
cd lydia-thrift-admin
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

## Environment

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://thrift.main.twelveai.app/api` |

## Admin login

Use an account with `role = admin` on the API (seeded: `admin@lydiasthrift.test` / `password`).

Endpoint: `POST /api/admin/auth/login`

## Features

- Dashboard stats
- Products: list, create, edit, deactivate, image upload
- Users: list, edit profile, set wallet balance, block/unblock
- Plans (enrollments): list, detail, per-user plans
- Transactions: wallet ledger + Paystack payments

## Backend requirements

On the API server:

```bash
php artisan migrate
php artisan storage:link
```

Add to `.env`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-admin-domain.com
```

Deploy the `public/storage` symlink so uploaded product images are served.
