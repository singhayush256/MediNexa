# 🔐 MEDINEXA — MASTER HOSTING ENVIRONMENT CONFIGURATION CHECKLIST

This document lists the exact environment variable requirements for deploying **MediNexa** across **Render** (Backend API Gateway) and **Vercel** (Frontend Web Application).

> [!IMPORTANT]
> **Zero-Secret Rule:** This checklist contains variable **NAMES**, expected formats, and safe placeholders only. NEVER commit raw passwords, real private keys, or API tokens to source control.

---

## 1. RENDER (BACKEND API GATEWAY)

**Service Type:** Render Web Service
**Runtime:** Node.js
**Root Directory:** `apps/api` (or monorepo root with Build Filter)
**Build Command:** `npm run build:api`
**Start Command:** `npm run start:api` (or `node apps/api/dist/main.js`)
**Health Check Path:** `/api/v1/health`

### Required Environment Variables:

| Variable Name | Required? | Purpose / Description | Expected Format / Example |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **YES** | Sets production optimizations & security guards | `production` |
| `PORT` | **YES** | Backend HTTP listener port (Render provides `10000`) | `10000` |
| `API_PREFIX` | **YES** | Global REST route prefix | `/api/v1` |
| `FRONTEND_URL` | **YES** | Authoritative public frontend domain for outbound links | `https://medinexa-medicalweb.vercel.app` |
| `CORS_ORIGIN` | **YES** | Comma-separated allowed origins for browser API calls | `https://medinexa-medicalweb.vercel.app,https://medinexa-duplicate.vercel.app` |
| `DATABASE_URL` | **YES** | Neon pooled PostgreSQL connection string (PgBouncer) | `postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/medinexa?sslmode=require&connection_limit=20` |
| `DIRECT_URL` | **YES** | Neon direct unpooled connection string (Prisma migrations) | `postgresql://user:password@ep-sample.us-east-2.aws.neon.tech/medinexa?sslmode=require` |
| `JWT_SECRET` | **YES** | 256-bit+ secret for signing authentication access tokens | `generate_strong_64_character_random_secret_here` |
| `JWT_EXPIRES_IN`| **YES** | Access token validity duration | `8h` |
| `JWT_REFRESH_SECRET`| **YES**| Secret for issuing and rotating refresh tokens | `generate_strong_64_character_refresh_secret_here` |
| `TOTP_ENCRYPTION_KEY`| OPTIONAL| Dedicated 32-byte key to encrypt TOTP 2FA secret seeds | `generate_strong_32_byte_encryption_key_here` |
| `STORAGE_PROVIDER` | **YES** | Active object storage provider (`supabase` or `r2`) | `supabase` |
| `SUPABASE_URL` | CONDITIONAL| Required when `STORAGE_PROVIDER=supabase` | `https://your-project-id.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY`| CONDITIONAL| Service role secret key with storage bucket privileges | `your_supabase_service_role_secret_key` |
| `SUPABASE_STORAGE_BUCKET` | CONDITIONAL| Private bucket name for patient documents | `medinexa-patient-documents` |
| `REDIS_URL` | OPTIONAL | Upstash Redis connection string (falls back to memory) | `rediss://default:token@endpoint.upstash.io:6379` |
| `ANTHROPIC_API_KEY`| OPTIONAL | Tier-1 AI provider key (Claude 3.5 Sonnet) | `sk-ant-api03-...` |
| `GEMINI_API_KEY` | OPTIONAL | Tier-2 AI provider key (Google Gemini 1.5 Pro) | `AIzaSy...` |
| `OPENAI_API_KEY` | OPTIONAL | Tier-3 AI provider key (OpenAI GPT-4o) | `sk-proj-...` |
| `AI_PROVIDER` | OPTIONAL | Force a specific AI tier or mock (`CLAUDE`, `GEMINI`, `MOCK`) | `CLAUDE` |

---

## 2. VERCEL (FRONTEND WEB APPLICATION)

**Platform:** Vercel
**Framework Preset:** Next.js
**Root Directory:** `apps/web` (or monorepo root with root directory override)
**Build Command:** `npm run build:web`
**Output Directory:** `.next`
**Install Command:** `npm install`

### Required Environment Variables:

| Variable Name | Required? | Inlined in Client? | Purpose / Description | Expected Value / Example |
| :--- | :---: | :---: | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | **YES** | YES | Official public frontend URL | `https://medinexa-medicalweb.vercel.app` |
| `NEXT_PUBLIC_API_URL` | **YES** | YES | Base backend API URL with `/api/v1` prefix | `https://medinexa-duplicate-api.onrender.com/api/v1` |
| `NEXT_PUBLIC_WS_URL` | OPTIONAL | YES | WebSocket gateway URL (derived from API URL if omitted) | `wss://medinexa-duplicate-api.onrender.com` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | OPTIONAL | YES | Razorpay public test key ID for sandbox checkout modal | `rzp_test_placeholder_key_id` |

> [!CAUTION]
> **Client-Side Inlining Warning:** In Next.js, all environment variables prefixed with `NEXT_PUBLIC_*` are bundled directly into the public client JavaScript files. NEVER assign database URLs, JWT secrets, or Supabase service role keys to any `NEXT_PUBLIC_*` variable!

---

## 3. SUPABASE (PRIVATE OBJECT STORAGE CONFIGURATION)

To configure Supabase Storage for private medical document uploads:

1. **Create Bucket:** In the Supabase Dashboard → Storage → Create New Bucket.
   * **Bucket Name:** `medinexa-patient-documents`
   * **Public Bucket:** **`OFF`** (Keep bucket strictly PRIVATE).
2. **Access Policy:** Rely on backend authentication using the `SUPABASE_SERVICE_ROLE_KEY`. The backend generates short-lived signed URLs on behalf of authorized patients.
3. **MIME Types Allowed:** `application/pdf`, `image/png`, `image/jpeg`, `image/webp`.
4. **File Size Limit:** Maximum 10 MB per attachment.

---

## 4. PRE-DEPLOYMENT VERIFICATION CHECKLIST

- [x] `.env.example` files contain safe placeholders only.
- [x] Real `.env` and `.env.local` files are ignored by Git.
- [x] Official frontend domain is `https://medinexa-medicalweb.vercel.app`.
- [x] Render CORS allows `https://medinexa-medicalweb.vercel.app`.
- [x] Backend port defaults to Render's dynamically assigned `PORT` (or `10000`).
- [x] Frontend `NEXT_PUBLIC_API_URL` includes `/api/v1`.
- [x] Backend test suite passes (`npm test --workspace=@medinexa/api`).
- [x] Frontend builds with zero TypeScript errors (`npm run build:web`).
