# MEDINEXA DUPLICATE — ENVIRONMENT SETUP & CONFIGURATION GUIDE

**Audience:** Platform Engineers, DevOps, Hackathon Evaluators, Local Developers  
**Scope:** Local Development, Docker, Neon PostgreSQL, Upstash Redis, Render, Vercel  
**Repository:** `https://github.com/singhayush256/MediNexa-Duplicate`

---

## 1. ARCHITECTURE OVERVIEW & CONFIGURATION MATRIX

MediNexa Duplicate employs a decoupled full-stack architecture:
- **Backend API (`apps/api`):** NestJS 10 running on Render Web Service.
- **Frontend Web (`apps/web`):** Next.js 14 running on Vercel Serverless Edge.
- **Database (`database`):** Neon Serverless PostgreSQL with Prisma ORM.
- **Optional Cache:** Upstash Serverless Redis (gracefully falls back to in-memory sliding window).
- **Optional File Storage:** Cloudflare R2 (gracefully falls back to disabled provider HTTP 503).
- **AI Assistant:** Multi-provider engine (Google Gemini / Anthropic Claude / OpenAI / Built-in Clinical Rules).

---

## 2. GENERATING CRYPTOGRAPHIC SECRETS

MediNexa production deployments fail-closed on startup if weak or missing secrets are detected. Use the following commands to generate 64-character high-entropy cryptographic strings:

### Using OpenSSL (macOS, Linux, Git Bash, WSL)
```bash
# JWT Secret (for user session authentication)
openssl rand -base64 64

# JWT Refresh Secret (for session refresh tokens)
openssl rand -base64 64

# Two-Factor (TOTP) Encryption Secret (32 bytes AES key)
openssl rand -hex 32
```

### Using Node.js (Windows PowerShell / Command Prompt)
```powershell
# In PowerShell:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. BACKEND ENVIRONMENT CONFIGURATION (`apps/api/.env`)

Create `apps/api/.env` from `apps/api/.env.example` for local or Render execution:

```env
# ==============================================================================
# MEDINEXA BACKEND API — ENVIRONMENT CONFIGURATION
# ==============================================================================

# Server Runtime
NODE_ENV=development                       # 'development', 'test', or 'production'
PORT=4000
API_PREFIX=api/v1
ENABLE_SWAGGER=true                        # Enabled for API documentation

# Database Configuration (Neon PostgreSQL)
# DATABASE_URL: Pooled connection string with ?pgbouncer=true for runtime queries
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-delicate-lake-...pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
# DIRECT_URL: Direct unpooled compute connection string for Prisma migrations
DIRECT_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-delicate-lake-...ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# Authentication & Encryption Secrets (Mandatory in production)
JWT_SECRET=your_generated_64_char_base64_secret_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_generated_64_char_base64_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d
TOTP_ENCRYPTION_KEY=your_generated_32_byte_hex_key_here

# Cross-Origin Resource Sharing (CORS)
# Comma-separated list of allowed origins
CORS_ORIGIN=http://localhost:3000,https://medinexa-duplicate.vercel.app

# Demo Mode & Payments (Safe Hackathon Mode)
DEMO_MODE=true                             # Ensures zero real banking charges
RAZORPAY_KEY_ID=                           # Optional in Demo Mode
RAZORPAY_KEY_SECRET=                       # Optional in Demo Mode
RAZORPAY_WEBHOOK_SECRET=                   # Optional in Demo Mode

# AI Healthcare Intelligence (Multi-Provider Fallback)
# Priority: GEMINI_API_KEY -> ANTHROPIC_API_KEY -> OPENAI_API_KEY -> BUILT-IN CLINICAL RULES
GEMINI_API_KEY=                            # Optional: e.g. AIzaSy...
ANTHROPIC_API_KEY=                         # Optional: e.g. sk-ant-...
OPENAI_API_KEY=                            # Optional: e.g. sk-...
MEDINEXA_AI_API_KEY=                       # Optional alias

# Cache & Rate Limiting (Upstash Redis)
# If omitted, automatically runs in memory_fallback mode
REDIS_URL=                                 # Optional: rediss://default:...@...upstash.io:6379

# Storage Service (Cloudflare R2)
# If omitted, automatically runs in disabled mode (HTTP 503 on file upload)
R2_ACCOUNT_ID=                             # Optional
R2_ACCESS_KEY_ID=                         # Optional
R2_SECRET_ACCESS_KEY=                     # Optional
R2_BUCKET_NAME=                            # Optional
```

---

## 4. FRONTEND ENVIRONMENT CONFIGURATION (`apps/web/.env.local`)

Create `apps/web/.env.local` from `apps/web/.env.example` for local or Vercel execution:

```env
# ==============================================================================
# MEDINEXA FRONTEND WEB — ENVIRONMENT CONFIGURATION
# ==============================================================================

# Backend API Gateway URL (Points to Render backend in production)
NEXT_PUBLIC_API_URL=https://medinexa-duplicate-api.onrender.com/api/v1
# Local alternative: NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Payment Sandbox Mode
NEXT_PUBLIC_PAYMENT_MODE=demo

# Public App Metadata
NEXT_PUBLIC_APP_NAME="MediNexa Healthcare Platform"
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

---

## 5. RENDER CLOUD HOSTING DEPLOYMENT STEPS

### Step 1 — Create or Connect Web Service
1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Select **New Web Service** and connect GitHub repository `singhayush256/MediNexa-Duplicate`.
3. Set **Root Directory** to repository root (`.`).
4. Set **Environment** to `Node`.

### Step 2 — Configure Build & Start Commands
- **Build Command:**
  ```bash
  npm install && npm run build:shared && npm run build:api
  ```
- **Start Command:**
  ```bash
  npm run start:api:prod
  ```

### Step 3 — Set Render Environment Variables
In the Render Service Dashboard under **Environment**:
| Variable Key | Required? | Recommended Production Value |
| :--- | :---: | :--- |
| `NODE_ENV` | **REQUIRED** | `production` |
| `PORT` | **REQUIRED** | `4000` (or leave default Render port) |
| `API_PREFIX` | **REQUIRED** | `api/v1` |
| `DATABASE_URL` | **REQUIRED** | Pooled Neon PostgreSQL connection URL |
| `DIRECT_URL` | **REQUIRED** | Direct unpooled Neon PostgreSQL connection URL |
| `JWT_SECRET` | **REQUIRED** | 64-char crypto string |
| `JWT_REFRESH_SECRET` | **REQUIRED** | 64-char crypto string |
| `TOTP_ENCRYPTION_KEY` | **REQUIRED** | 32-byte hex crypto string |
| `CORS_ORIGIN` | **REQUIRED** | `https://medinexa-duplicate.vercel.app` |
| `DEMO_MODE` | **REQUIRED** | `true` |
| `GEMINI_API_KEY` | OPTIONAL | Google Gemini API key (Clinical fallback active if empty) |
| `REDIS_URL` | OPTIONAL | Upstash Redis connection string (In-memory fallback active if empty) |

---

## 6. VERCEL CLOUD HOSTING DEPLOYMENT STEPS

### Step 1 — Connect Project
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Import repository `singhayush256/MediNexa-Duplicate`.
3. Set **Framework Preset** to `Next.js`.
4. Set **Root Directory** to `apps/web`.

### Step 2 — Configure Build Settings
- **Build Command:**
  ```bash
  cd ../.. && npm install && npm run build:shared && npm run build:web
  ```
  *(Or standard Next.js default build if monorepo dependencies are pre-installed)*
- **Output Directory:** `.next`

### Step 3 — Set Vercel Environment Variables
Under **Project Settings → Environment Variables**:
| Variable Key | Target Environment | Value |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_API_URL` | Production / Preview | `https://medinexa-duplicate-api.onrender.com/api/v1` |
| `NEXT_PUBLIC_PAYMENT_MODE`| Production / Preview | `demo` |

---

## 7. LOCAL DEVELOPMENT QUICKSTART

To run the full stack locally on Windows, macOS, or Linux:

```bash
# 1. Clone repository
git clone https://github.com/singhayush256/MediNexa-Duplicate.git
cd MediNexa-Duplicate

# 2. Install monorepo dependencies
npm install

# 3. Build shared packages (@medinexa/types, @medinexa/validation)
npm run build:shared

# 4. Generate Prisma client
npm run db:generate

# 5. Run automated tests (verify 266/266 pass)
npm test --workspace=@medinexa/api

# 6. Start Backend (Terminal 1)
npm run start:api:dev

# 7. Start Frontend (Terminal 2)
npm run start:web:dev
```

- Access Web App: `http://localhost:3000`
- Access Backend API: `http://localhost:4000/api/v1`
- Access Swagger Docs: `http://localhost:4000/api/docs`

