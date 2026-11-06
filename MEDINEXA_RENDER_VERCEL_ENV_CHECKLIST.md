# MEDINEXA DUPLICATE — PRODUCTION ENVIRONMENT VARIABLE CHECKLIST
## Render Backend & Vercel Frontend Configuration Guide

**Project:** MediNexa Duplicate  
**Backend:** Render Web Service (`medinexa-duplicate-api`)  
**Frontend:** Vercel Production Project (`medinexa-duplicate`)  
**Database:** Neon Serverless PostgreSQL  
**Storage:** Supabase Storage (`medinexa-vault`)  
**Cache/Rate-Limiting:** Upstash Redis  
**Security Level:** Production / Healthcare (HIPAA-aligned)  

---

## 1. Important Operational Rules

1. **NEVER commit real credentials** to Git or store them in `.env.example`.
2. **NEVER expose server secrets via `NEXT_PUBLIC_` variables** on Vercel. Only public API endpoints and client-safe URLs belong in frontend bundles.
3. **FAIL-CLOSED STORAGE:** In production, files are rejected (HTTP 503) unless Supabase credentials are configured. Ephemeral container disk writes are prohibited.
4. **PAYMENT GATEWAY SAFETY:** `DEMO_MODE=true` must remain set to prevent unwanted real banking charges during hackathon demonstrations.

---

## 2. Render Backend Environment Checklist (`medinexa-duplicate-api`)

Navigate to: **Render Dashboard** -> Select `medinexa-duplicate-api` -> **Environment** -> **Add Environment Variable**

### 2.1 Core Runtime & Server Settings

| Variable Name | Type | Status | Recommended / Production Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Plaintext | **REQUIRED** | `production` | Enforces production optimizations, security checks, and disables dev mocks. |
| `PORT` | Plaintext | **REQUIRED** | `10000` | Port listened to by NestJS inside the Render Docker/container environment. |
| `API_PREFIX` | Plaintext | **REQUIRED** | `/api/v1` | Global route prefix for all REST and WebSocket controllers. |

---

### 2.2 Database Connectivity (Neon PostgreSQL)

| Variable Name | Type | Status | Recommended / Production Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **SECRET** | **REQUIRED** | `postgresql://neondb_owner:***@ep-***-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true` | Pooled connection string for Prisma ORM runtime queries. |
| `DIRECT_URL` | **SECRET** | **REQUIRED** | `postgresql://neondb_owner:***@ep-***.us-east-1.aws.neon.tech/neondb?sslmode=require` | Direct non-pooled connection for migrations and DDL statements. |

---

### 2.3 Authentication, Encryption & Security

| Variable Name | Type | Status | Recommended / Production Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `JWT_SECRET` | **SECRET** | **REQUIRED** | *(Cryptographically secure 64+ char random string)* | Secret key used to sign and verify user JWT access tokens. |
| `JWT_REFRESH_SECRET` | **SECRET** | **REQUIRED** | *(Cryptographically secure 64+ char random string)* | Secret key used to sign refresh tokens. |
| `JWT_EXPIRES_IN` | Plaintext | **REQUIRED** | `8h` | Standard medical shift session duration (8 hours). |
| `TOTP_ENCRYPTION_KEY` | **SECRET** | **REQUIRED** | *(Exact 64-char hex string = 32 raw bytes)* | AES-256-GCM symmetric key used to encrypt doctor 2FA TOTP secrets in the database. |

*Generate a secure TOTP key using Node.js: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`*

---

### 2.4 Distributed Cache & Rate Limiting (Upstash Redis)

| Variable Name | Type | Status | Recommended / Production Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `REDIS_URL` | **SECRET** | **RECOMMENDED** | `rediss://default:***@***.upstash.io:6379` | TLS-encrypted Redis connection string for multi-instance rate-limiting and session caching. |
| `REDIS_TOKEN` | **SECRET** | Optional | `***` | REST auth token (if using Upstash HTTP REST SDK). |

*Note: If `REDIS_URL` is omitted, the API automatically falls back to an in-memory sliding-window cache without crashing.*

---

### 2.5 Clinical Storage Vault (Supabase Storage)

| Variable Name | Type | Status | Recommended / Production Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `STORAGE_PROVIDER` | Plaintext | **REQUIRED** | `supabase` | Activates `SupabaseStorageProvider`. |
| `SUPABASE_URL` | Plaintext | **REQUIRED** | `https://eztompgfahzgeyeuflmu.supabase.co` | Supabase project endpoint. |
| `SUPABASE_SERVICE_ROLE_KEY` | **SECRET** | **REQUIRED** | `eyJhbGciOi...` | Supabase Service Role Key (bypasses RLS for secure server-side storage operations). |
| `SUPABASE_STORAGE_BUCKET` | Plaintext | **REQUIRED** | `medinexa-vault` | Private storage bucket name. |

---

### 2.6 Multi-Tier AI Engine & Clinical Safety

| Variable Name | Type | Status | Recommended / Production Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `AI_PROVIDER_PRIORITY` | Plaintext | Optional | `anthropic,gemini,openai,deterministic` | Ordered comma-separated provider cascade priority. |
| `ANTHROPIC_API_KEY` | **SECRET** | Optional (Tier 1) | `sk-ant-api03-***` | Claude 3.5 Sonnet key for primary clinical reasoning. |
| `ANTHROPIC_MODEL` | Plaintext | Optional | `claude-3-5-sonnet-20241022` | Model identifier for Anthropic Claude. |
| `GEMINI_API_KEY` | **SECRET** | Optional (Tier 2) | `AIzaSy***` | Google Gemini key for secondary clinical reasoning. |
| `GEMINI_MODEL` | Plaintext | Optional | `gemini-1.5-flash` | Model identifier for Google Gemini. |
| `OPENAI_API_KEY` | **SECRET** | Optional (Tier 3) | `sk-proj-***` | OpenAI GPT-4o-mini key for tertiary clinical reasoning. |
| `OPENAI_MODEL` | Plaintext | Optional | `gpt-4o-mini` | Model identifier for OpenAI. |

*Note: If all external AI keys are absent or fail, the built-in deterministic clinical rules engine handles requests safely and deterministically.*

---

### 2.7 Payment Processing Sandbox

| Variable Name | Type | Status | Recommended / Production Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `DEMO_MODE` | Plaintext | **REQUIRED** | `true` | Ensures demo orders (`DEMO_ORD_...`) and instant sandbox verification without external payment charges. |
| `RAZORPAY_KEY_ID` | **SECRET** | Optional | `rzp_test_***` | Razorpay Test Key ID (only needed if live test mode is toggled). |
| `RAZORPAY_KEY_SECRET` | **SECRET** | Optional | `***` | Razorpay Test Key Secret. |

---

### 2.8 CORS & Domain Security Whitelist

| Variable Name | Type | Status | Recommended / Production Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `CORS_ORIGIN` | Plaintext | **REQUIRED** | `https://medinexa-medicalweb.vercel.app,https://medinexa-duplicate.vercel.app,https://medi-nexa-web-nu.vercel.app,https://medinexa.com,https://app.medinexa.in` | Whitelist of frontend domains allowed to make cross-origin requests. |
| `FRONTEND_URL` | Plaintext | **REQUIRED** | `https://medinexa-medicalweb.vercel.app` | Authoritative public frontend domain for notification links (Email, SMS, WhatsApp). |

---

### 2.9 Communications & Notifications (Optional)

| Variable Name | Type | Status | Recommended / Production Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `SMTP_HOST` | Plaintext | Optional | `smtp.sendgrid.net` | Outbound mail server. Falls back to console log mock if absent. |
| `SMTP_PORT` | Plaintext | Optional | `587` | Mail server port. |
| `SMTP_USER` | **SECRET** | Optional | `apikey` | Mail server authentication username. |
| `SMTP_PASS` | **SECRET** | Optional | `SG.***` | Mail server password / API key. |
| `TWILIO_ACCOUNT_SID` | **SECRET** | Optional | `AC***` | Twilio SMS account identifier. Falls back to mock if absent. |
| `TWILIO_AUTH_TOKEN` | **SECRET** | Optional | `***` | Twilio auth token. |
| `TWILIO_PHONE_NUMBER` | Plaintext | Optional | `+1234567890` | Verified Twilio sender phone number. |

---

## 3. Vercel Frontend Environment Checklist (`medinexa-medicalweb`)

Navigate to: **Vercel Dashboard** -> Project `medinexa-medicalweb` -> **Settings** -> **Environment Variables**

| Variable Name | Exposed to Client? | Status | Recommended / Production Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **YES** (Public) | **REQUIRED** | `https://medinexa-duplicate-api.onrender.com/api/v1` | Absolute base URL for all client-side API requests to NestJS. |
| `NEXT_PUBLIC_APP_URL` | **YES** (Public) | **REQUIRED** | `https://medinexa-medicalweb.vercel.app` | Canonical frontend domain for routing, OpenGraph, and metadata. |
| `NEXT_PUBLIC_SUPABASE_URL` | **YES** (Public) | Optional | `https://eztompgfahzgeyeuflmu.supabase.co` | Public Supabase endpoint for frontend assets. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **YES** (Public) | Optional | `eyJhbGciOi...` | Public anonymous key only. **NEVER enter the service_role key here.** |

> [!CAUTION]
> **Vercel Security Warning:**
> Never add `DATABASE_URL`, `JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, or `TOTP_ENCRYPTION_KEY` to Vercel environment variables.
> All business logic, storage authorizations, and database transactions are managed securely through the Render NestJS backend.

---

## 4. Verification & Healthcheck Probes

After applying environment variables and redeploying, verify backend readiness by running these commands:

### 4.1 Liveness Probe
```bash
curl -i https://medinexa-duplicate-api.onrender.com/api/v1/health
```
**Expected Response:** HTTP 200 OK  
`{"status":"ok","timestamp":"2026-11-...","service":"medinexa-api","version":"1.0.0"}`

---

### 4.2 Readiness Probe
```bash
curl -i https://medinexa-duplicate-api.onrender.com/api/v1/health/ready
```
**Expected Response:** HTTP 200 OK  
```json
{
  "status": "ready",
  "checks": {
    "database": { "status": "up", "latency": "3.5ms" },
    "redis": { "status": "up", "mode": "upstash_redis" },
    "storage": { "status": "up", "mode": "supabase", "bucket": "medinexa-vault" }
  }
}
```

---

### 4.3 AI Clinical Assistant Test
```bash
curl -i -X POST https://medinexa-duplicate-api.onrender.com/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the recommended adult dosage for Dolo 650?"}'
```
**Expected Response:** HTTP 201 Created  
Valid structured response with dosage guidance, maximum daily limits (4000mg), and clinical safety disclaimers.

---

### 4.4 Frontend Liveness Test
```bash
curl -i https://medinexa-medicalweb.vercel.app/
curl -i https://medinexa-medicalweb.vercel.app/login
```
**Expected Response:** HTTP 200 OK on both routes with pre-rendered HTML and security headers.

