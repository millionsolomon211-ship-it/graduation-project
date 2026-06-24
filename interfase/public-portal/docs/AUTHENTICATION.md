# Public Citizen Portal — Authentication & System Interface

This document describes how authentication works in the **public-portal** (`interfase/public-portal`) and how it connects to Keycloak, PostgreSQL, email, and the custom UI.

---

## 1. System overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js     │────▶│  Nginx gateway  │
│  :3001      │     │  public-portal│     │  localhost/auth │
└─────────────┘     └──────┬───────┘     └────────┬────────┘
                           │                       │
                    ┌──────┴───────┐               │
                    │  PostgreSQL  │               ▼
                    │ public_portal│        ┌─────────────┐
                    │  (OTP codes) │        │  Keycloak   │
                    └──────────────┘        │  :8081      │
                           │                └─────────────┘
                    ┌──────┴───────┐
                    │ Gmail SMTP   │
                    │ (OTP emails) │
                    └──────────────┘
```

| Component | Role |
|-----------|------|
| **Next.js 15** (port `3001`) | Custom UI + API routes + middleware |
| **Keycloak 24** (port `8081`, path `/auth`) | Identity provider — users, passwords, JWTs |
| **Nginx** (`http://localhost/auth`) | Reverse proxy to Keycloak |
| **PostgreSQL** (`public_portal` DB) | Stores hashed OTP codes |
| **Gmail SMTP** | Sends 6-digit OTP emails from Next.js |

---

## 2. Technology stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 18, Tailwind CSS, Framer Motion, Lucide icons |
| Identity | Keycloak realm `public-citizen-portal` |
| JWT verification | `jose` (JWKS signature + expiry) |
| OTP storage | PostgreSQL via `pg` |
| OTP email | `nodemailer` + Gmail SMTP |
| Session | HTTP cookies (`auth_token`, `refresh_token`) |

---

## 3. Keycloak configuration

**Realm:** `public-citizen-portal`

| Client | Type | Purpose |
|--------|------|---------|
| `civilian-nextjs-web` | Public | Browser login, password grant, JWT for users |
| `portal-admin-service` | Confidential + service account | Server-side Admin API (register, verify, reset) |

**Important realm settings:**
- `verifyEmail: false` — email verification is handled by the portal OTP flow, not Keycloak links
- `registrationAllowed: true`
- `resetPasswordAllowed: true`
- `directAccessGrantsEnabled: true` on the web client (password grant from server)

**Realm export:** `keycloak/realm-export.json`  
**Docker:** `keycloak/docker-compose.yml` (port `8081`, imports realm on start)

### Keycloak setup scripts

| Script | Purpose |
|--------|---------|
| `keycloak/setup-keycloak.ps1` | Recreate container + run service-client patch |
| `keycloak/patch-service-client.ps1` | Create `portal-admin-service` + `manage-users` roles |
| `keycloak/patch-realm.ps1` | Set `verifyEmail=false` and registration flags |
| `keycloak/patch-fix-users.ps1` | Remove `VERIFY_EMAIL` required action from existing users |
| `keycloak/patch-smtp.ps1` | Configure Gmail SMTP in Keycloak (optional; OTP uses Next.js SMTP) |

---

## 4. Authentication model

### 4.1 What Keycloak owns
- User accounts (username = email)
- Password hashing and validation
- Issuing **access tokens** (JWT) and **refresh tokens**
- `email_verified` claim on the JWT (`true` / `false`)

### 4.2 What the portal owns
- Custom login/signup **UI**
- **6-digit OTP** generation, storage, and email delivery
- Marking `emailVerified: true` in Keycloak after OTP success (Admin API)
- Route protection via **middleware** based on JWT + `email_verified`

### 4.3 Session cookies

| Cookie | Content | TTL | Set by |
|--------|---------|-----|--------|
| `auth_token` | Keycloak access JWT | 1 hour | Login/register/verify API |
| `refresh_token` | Keycloak refresh token | 24 hours | Login/register/verify API |

Tokens are verified with Keycloak **JWKS** (`jose`). The middleware reads `email_verified` from the JWT payload.

---

## 5. User flows

### 5.1 Sign up

```
User fills SignupForm
    → POST /api/auth/register
        → Keycloak Admin API: create user (emailVerified=false)
        → Clear VERIFY_EMAIL required action (if any)
        → PostgreSQL: store OTP hash
        → Gmail: send 6-digit code
        → Keycloak: password grant → JWT + refresh token
    → Cookies set → redirect /verify-email
```

### 5.2 Email verification (OTP)

```
/verify-email (VerifyEmailPending)
    → On load: POST /api/auth/resend-verify (sends new OTP)
    → User enters 6 digits → POST /api/auth/verify-otp
        → PostgreSQL: validate OTP hash + expiry
        → Keycloak Admin API: emailVerified=true
        → Refresh token → new JWT with email_verified=true
    → Redirect /dashboard
```

### 5.3 Login

```
LoginForm → POST /api/auth/login
    → Keycloak password grant
    → If "Account is not fully set up": clear VERIFY_EMAIL via Admin API, retry
    → Set cookies
    → email_verified=true  → /dashboard
    → email_verified=false → /verify-email
```

### 5.4 Protected dashboard

```
GET /dashboard
    → Middleware: valid JWT required
    → email_verified must be true
    → Else redirect /verify-email or /login
```

---

## 6. Middleware rules

File: `src/middleware.ts`

| Path | Condition | Action |
|------|-----------|--------|
| `/dashboard/*` | No valid token | → `/login` |
| `/dashboard/*` | Token OK, `email_verified=false` | → `/verify-email` |
| `/verify-email` | No valid token | → `/login` |
| `/verify-email` | Already verified | → `/dashboard` |
| `/login`, `/signup` | Logged in + verified | → `/dashboard` |
| `/login`, `/signup` | Logged in + unverified | → `/verify-email` |

---

## 7. API routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create Keycloak user, send OTP, auto-login |
| POST | `/api/auth/login` | Password login; clears Keycloak email blocks if needed |
| POST | `/api/auth/resend-verify` | Generate + email new verification OTP |
| POST | `/api/auth/verify-otp` | Validate OTP; mark email verified in Keycloak |
| POST | `/api/auth/refresh-session` | Refresh JWT after external verification |

All admin operations use **`portal-admin-service`** client credentials (or master `admin-cli` fallback).

---

## 8. Frontend pages & components

| Route | Page | Component |
|-------|------|-----------|
| `/` | Landing | Marketing home |
| `/login` | Login | `LoginForm` |
| `/signup` | Sign up | `SignupForm` |
| `/verify-email` | OTP entry | `VerifyEmailPending` |
| `/verify` | Post-link callback | `VerifyEmailCallback` (legacy Keycloak link landing) |
| `/dashboard` | Citizen hub | Dashboard shell (protected) |

**Shared UI:** `RotatingBackground`, `.uiverse-form` styles in `globals.css` (dark auth cards, `#003366` / `#00aaff` palette).

---

## 9. Backend libraries (`src/lib/`)

| File | Responsibility |
|------|----------------|
| `keycloak-admin.ts` | Admin token, user CRUD, password grant, mark email verified |
| `auth-tokens.ts` | JWT verify via JWKS, cookie helpers |
| `auth-session.ts` | Extract user from request cookies |
| `auth-client.ts` | Browser cookie helpers, `isEmailVerified()` |
| `db.ts` | PostgreSQL pool + auto schema migration |
| `otp.ts` | Generate 6-digit code, SHA-256 hash |
| `otp-store.ts` | Save/verify OTP in `otp_codes` table |
| `email.ts` | Send OTP via nodemailer (Gmail) |
| `keycloak.ts` | `keycloak-js` init (optional SSO redirect) |

---

## 10. Database schema

**Database:** `public_portal` (separate from Keycloak’s `keycloak` DB)

**Table:** `otp_codes`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `keycloak_user_id` | VARCHAR | Keycloak user `sub` |
| `email` | VARCHAR | User email |
| `otp_hash` | VARCHAR(64) | SHA-256 of OTP (never store plain code) |
| `purpose` | VARCHAR | `email_verify` |
| `expires_at` | TIMESTAMPTZ | 10-minute TTL |
| `used_at` | TIMESTAMPTZ | Set when consumed |
| `created_at` | TIMESTAMPTZ | Creation time |

**Init:** `npm run db:init` (runs `scripts/ensure-db.js`)

---

## 11. Environment variables

Copy `.env.example` → `.env.local`:

```env
# Keycloak (browser + server via nginx)
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost/auth
KEYCLOAK_SERVER_URL=http://localhost/auth
NEXT_PUBLIC_KEYCLOAK_REALM=public-citizen-portal
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=civilian-nextjs-web
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Service account (required for register/verify/reset APIs)
KEYCLOAK_SERVICE_CLIENT_ID=portal-admin-service
KEYCLOAK_SERVICE_CLIENT_SECRET=portal-admin-secret

# PostgreSQL OTP storage
DB_HOST=localhost
DB_PORT=5432
DB_NAME=public_portal
DB_USER=postgres
DB_PASSWORD=1q2w3e4r5t

# Gmail SMTP (OTP emails from Next.js)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
```

---

## 12. Running locally

```bash
# 1. Keycloak
cd keycloak
docker compose up -d
.\patch-service-client.ps1 -KcBase "http://localhost:8081/auth"
.\patch-realm.ps1

# 2. PostgreSQL — ensure running (same instance as Keycloak)
cd interfase/public-portal
npm run db:init

# 3. Portal
npm install
npm run dev    # http://localhost:3001
```

**Nginx** must proxy `http://localhost/auth` → Keycloak `http://localhost:8081/auth`.

---

## 13. JWT claims used by the portal

| Claim | Usage |
|-------|--------|
| `sub` | Keycloak user ID |
| `email` | User email |
| `email_verified` | `false` → force `/verify-email`; `true` → allow `/dashboard` |
| `exp` | Enforced by `jose` in middleware |

---

## 14. Security notes

- OTP codes are **hashed** in PostgreSQL; plain codes exist only in email and memory during the request.
- OTP expires after **10 minutes**; resend has a **60-second** cooldown on the UI.
- `portal-admin-service` secret must stay server-side only (`.env.local`, never committed).
- `auth_token` cookie is readable by JavaScript (not HttpOnly) — avoid XSS in production hardening.
- Password grant from browser is avoided for login; login goes through **`/api/auth/login`** server-side.

---

## 15. Project structure (auth-related)

```
gc-proj/
├── keycloak/
│   ├── docker-compose.yml
│   ├── realm-export.json
│   └── patch-*.ps1
└── interfase/public-portal/
    ├── docs/AUTHENTICATION.md          ← this file
    ├── scripts/ensure-db.js
    ├── src/
    │   ├── middleware.ts
    │   ├── lib/                        ← auth, db, otp, email
    │   ├── app/
    │   │   ├── api/auth/               ← register, login, verify-otp, …
    │   │   ├── login|signup|verify-email|dashboard|…
    │   └── components/auth/            ← forms
    └── .env.local
```

---

## 16. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `invalid_client` on register | `portal-admin-service` missing | Run `patch-service-client.ps1` |
| `Account is not fully set up` on login | `VERIFY_EMAIL` required action | Run `patch-realm.ps1` + `patch-fix-users.ps1` |
| Signup OK but no OTP email | Gmail SMTP in `.env.local` | Check `EMAIL_SERVER_*` vars |
| 500 on resend-verify | PostgreSQL down | Start Postgres, run `npm run db:init` |
| JWT verify fails in middleware | URL mismatch `:80` vs `:8081` | Align `NEXT_PUBLIC_KEYCLOAK_URL` with nginx |

---

*Last updated: June 2026 — public-citizen-portal OTP authentication stack.*
