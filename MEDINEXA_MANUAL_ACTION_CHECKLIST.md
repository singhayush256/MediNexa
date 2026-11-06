# MEDINEXA DUPLICATE — MANUAL ACTION & DEPLOYMENT CHECKLIST

**Date:** November 6, 2026  
**Auditor:** DevOps & Systems Engineering Team  
**Purpose:** Actionable checklist distinguishing mandatory production actions, optional enhancements, and skippable/unnecessary steps for MediNexa Duplicate.

---

## 1. ACTION CLASSIFICATION OVERVIEW

To ensure safe deployment without operational surprises or wasted effort, actions are classified into three strict tiers:

- **TIER 1: REQUIRED** — Mandatory actions required for complete end-to-end functionality between Vercel and Render.
- **TIER 2: OPTIONAL** — Value-add enhancements that can be enabled if credentials are provided, but are not required for demonstration or core evaluation.
- **TIER 3: SKIPPABLE / NOT NEEDED** — Tasks that are already handled by architectural fallbacks, mock layers, or self-healing routines. Do not spend time configuring these.

---

## 2. COMPREHENSIVE ACTION MATRIX

| Action Item | Scope | Tier | Current State | Effort | Why / Impact |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Approve Git Push** | Monorepo | **REQUIRED** | Local Working Tree Ready | 1 min | 18 modified/created files (Demo payments, API alignment, Next config) need to be committed and pushed to `main` branch so Render and Vercel rebuild with latest hardening. |
| **Verify Vercel `NEXT_PUBLIC_API_URL`** | Vercel | **REQUIRED** | Configured | 1 min | Must point to `https://medinexa-duplicate-api.onrender.com/api/v1` in Vercel Project Settings. |
| **Verify Render `DATABASE_URL`** | Render | **REQUIRED** | Live (Verified 4ms) | 0 min | Neon PostgreSQL connection string is already configured and verified live. |
| **Verify Render `JWT_SECRET`** | Render | **REQUIRED** | Live | 0 min | Secure random token is already active on Render. |
| **Verify Render `CORS_ORIGIN`** | Render | **REQUIRED** | Configured | 1 min | Must include `https://medinexa-duplicate.vercel.app` to prevent browser CORS rejection. |
| **Add `GEMINI_API_KEY` (or Anthropic/OpenAI)** | Render | **OPTIONAL** | Fallback Active | 2 min | Optional. Multi-provider AI clinical engine already runs built-in Indian Pharmacopoeia clinical rules if omitted. |
| **Add Upstash `REDIS_URL`** | Render | **OPTIONAL** | Fallback Active | 2 min | Optional. `RateLimiterGuard` automatically operates in in-memory sliding window fallback mode. |
| **Add Cloudflare `R2_*` Storage Keys** | Render | **OPTIONAL** | Disabled Mode Active | 5 min | Optional. Platform runs `DisabledStorageProvider` (fails closed HTTP 503 on file upload; does not corrupt local disk). |
| **Add Razorpay Live Keys** | Render | **SKIPPABLE** | Demo Mode Implemented | 0 min | **NOT NEEDED.** Safe Hackathon Demo Mode is built-in (`DEMO_ORD_`, `DEMO_TXN_`, simulated decline/success/cancel). |
| **Deploy Python ML Microservice** | Host / Render | **SKIPPABLE** | Fallback Active | 0 min | **NOT NEEDED.** Backend has built-in statistical ML forecasting model when external ML endpoint is absent. |
| **Run Destructive DB Migrations** | Database | **SKIPPABLE** | Schema Live | 0 min | **DO NOT RUN.** Schema has self-healing auto-verification on boot; existing seed data must be preserved. |

---

## 3. STEP-BY-STEP EXECUTION PROTOCOL

### Step 1: Git Push Approval (When User Approves)
- All 18 files have been tested with 266/266 unit/integration tests and zero TypeScript errors.
- Once user provides explicit approval:
  ```bash
  git add .
  git commit -m "feat: complete product stabilization, demo payment sandbox, and api alignment"
  git push origin main
  ```
- **Trigger:** Render and Vercel will automatically trigger automated deployment pipelines upon receiving new commits on `main`.

---

### Step 2: Vercel Production Environment Audit
1. Navigate to: `https://vercel.com/singhayush256/medinexa-duplicate/settings/environment-variables`
2. Confirm the presence of:
   ```env
   NEXT_PUBLIC_API_URL=https://medinexa-duplicate-api.onrender.com/api/v1
   NEXT_PUBLIC_PAYMENT_MODE=demo
   ```
3. If changed, trigger a redeploy from the **Deployments** tab.

---

### Step 3: Render Production Environment Audit
1. Navigate to: `https://dashboard.render.com` → Select `medinexa-api` → **Environment**.
2. Confirm the presence of:
   ```env
   NODE_ENV=production
   PORT=4000
   API_PREFIX=api/v1
   DATABASE_URL=postgresql://neondb_owner:***@ep-delicate-lake-...pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
   DIRECT_URL=postgresql://neondb_owner:***@ep-delicate-lake-...ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=***
   JWT_REFRESH_SECRET=***
   TOTP_ENCRYPTION_KEY=***
   CORS_ORIGIN=https://medinexa-duplicate.vercel.app
   DEMO_MODE=true
   ```
3. If any optional key (`GEMINI_API_KEY` or `REDIS_URL`) is added, Render will trigger a seamless zero-downtime rolling restart.

---

## 4. VERIFICATION AFTER DEPLOYMENT

Run the following checks from any terminal:
```bash
# 1. Health Probe
curl -i https://medinexa-duplicate-api.onrender.com/api/v1/health

# 2. Readiness Probe (Check database latency)
curl -i https://medinexa-duplicate-api.onrender.com/api/v1/health/ready

# 3. AI Chat Verification
curl -X POST https://medinexa-duplicate-api.onrender.com/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the dosage for Dolo 650?","userId":"test-user"}'

# 4. Frontend Health
curl -I https://medinexa-duplicate.vercel.app/
```

All commands must return HTTP 200 or 201.

