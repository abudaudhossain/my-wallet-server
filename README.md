# My Wallet — Server

NestJS API for a personal wallet app. Users can authenticate, manage cards, and record expense/deposit transactions that update card balances.

## Stack

- NestJS 11 + TypeScript
- PostgreSQL + Prisma
- JWT auth (access + refresh tokens)
- Argon2 password hashing
- Nodemailer (emails logged to console when mail is unset)

## Getting started

```bash
npm install
cp .env.example .env
# Edit .env with your database and JWT secrets

npx prisma migrate dev
npx prisma generate
npm run prisma:seed   # optional — roles & permissions

npm run start:dev
```

Server defaults to `http://localhost:3000`.

## Environment

Copy `.env.example` and set:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | HTTP port (default `3000`) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Min 32 characters each |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | e.g. `15m`, `7d` |
| `FRONTEND_URL` | Used in email verification / reset links |
| `MAIL_*` | Optional SMTP settings |

## Auth

Protected routes expect:

```http
Authorization: Bearer <accessToken>
```

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Register (`name`, `email`, `password`, `confirmPassword`) |
| `POST` | `/auth/login` | Login — returns user + access/refresh tokens |
| `POST` | `/auth/refresh` | Refresh tokens (`refreshToken`) |
| `POST` | `/auth/logout` | Revoke refresh token |
| `POST` | `/auth/verify-email` | Verify email (`token`) |
| `POST` | `/auth/resend-verification` | Resend verification email (`email`) |
| `POST` | `/auth/forgot-password` | Request password reset (`email`) |
| `POST` | `/auth/reset-password` | Reset password (`token`, `password`, `confirmPassword`) |

## Cards

JWT required. Users only access their own cards. Create/update accept `name` and `description` only; `balance` defaults to `0`.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/cards` | Create card |
| `GET` | `/cards` | List own cards |
| `GET` | `/cards/:id` | Get one card |
| `PATCH` | `/cards/:id` | Update name/description |
| `DELETE` | `/cards/:id` | Delete card |

**Create / update body**

```json
{
  "name": "Main wallet",
  "description": "Daily spending"
}
```

## Transactions

JWT required. `cardId` must belong to the authenticated user.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/transactions` | Create transaction |
| `GET` | `/transactions` | List own transactions (`?cardId=` optional) |
| `GET` | `/transactions/:id` | Get one transaction |
| `PATCH` | `/transactions/:id` | Update transaction |
| `DELETE` | `/transactions/:id` | Delete transaction |

**Create body**

```json
{
  "type": "DEPOSIT",
  "amount": 100.5,
  "narration": "Salary",
  "date": "2026-07-27T10:00:00.000Z",
  "cardId": 1
}
```

| Field | Notes |
|-------|--------|
| `type` | `EXPENSE` or `DEPOSIT` |
| `amount` | Positive number, up to 2 decimal places |
| `narration` | Optional |
| `date` | Optional ISO date; defaults to now |
| `cardId` | Required; must be your card |

**Balance rules**

- `DEPOSIT` increases card balance
- `EXPENSE` decreases card balance (rejected if insufficient funds)
- Update/delete reverse and re-apply balance changes atomically

## Scripts

```bash
npm run start:dev      # watch mode
npm run start:prod     # production
npm run build
npm run lint
npm run test
npm run prisma:seed
```

## Project structure

```
src/
  iam/auth/        # Auth, JWT, tokens
  cards/           # Card CRUD
  transactions/    # Transaction CRUD + balance updates
  users/           # User repository/service
  mail/            # Email service
  prisma/          # Prisma module
prisma/
  schema.prisma
  migrations/
```
