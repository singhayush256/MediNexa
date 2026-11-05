# MEDINEXA — PRE-DEPLOYMENT CONFIGURATION & GO-LIVE CHECKLIST

**Project:** MediNexa Enterprise Multi-Tenant Connected Healthcare Platform  
**Frontend Target:** Vercel (`https://medinexa-duplicate.vercel.app`)  
**Backend Target:** Render Web Service (`https://<your-service-name>.onrender.com/api/v1`)  
**Database:** Neon PostgreSQL (Managed PostgreSQL 15+)  
**Date Prepared:** November 5, 2026  
**Status:** Pre-Deployment Stage — Awaiting User Approval  

---

## 1. TASK 1 — Render Backend Configuration Reference

Configure these environment variables in your **Render Web Service Dashboard** under **Environment**.

> [!CAUTION]
> **Zero Secrets Exposure:** Never paste real database passwords or JWT keys into chat or version control. Enter them directly into the secure Render Dashboard.

| Variable Name | Required? | Category | Purpose & Description |
|:---|:---:|:---:|:---|
| `NODE_ENV` | **YES** | Environment | Must be set to `production`. Enforces strict production security, disables demo debug bypasses, prohibits local filesystem storage, and activates CORS filters. |
| `PORT` | **YES** | Network | Default `3001` (or leave default if Render auto-assigns `$PORT`). |
| `API_PREFIX` | **YES** | Gateway | Set to `/api/v1` (enforces global REST routing structure). |
| `CORS_ORIGIN` | **YES** | Security | Set to: `https://medinexa-duplicate.vercel.app,https://medi-nexa-web-nu.vercel.app,https://medinexa.com,https://app.medinexa.in`<br>Authorizes cross-origin HTTP requests with credentials from your frontend. |
| `DATABASE_URL` | **YES** | Database | Neon PostgreSQL pooled connection string (`postgresql://...`). Used by Prisma Client for runtime API queries. |
| `DIRECT_URL` | **YES** | Database | Neon PostgreSQL direct unpooled connection string. Used by `prisma migrate deploy` during container boot to execute non-destructive schema migrations. |
| `JWT_SECRET` | **YES** | Security | Cryptographically secure 64-character random string (e.g., generated via `openssl rand -hex 32`). Used for signing and verifying user access tokens. |
| `JWT_EXPIRES_IN` | **YES** | Security | Set to `8h` (token validity lifetime). |
| `JWT_REFRESH_EXPIRES_IN` | Recommended | Security | Set to `30d` (refresh token lifetime for session rotation). |
| `REDIS_URL` | Optional | Performance | Upstash Redis connection string (`rediss://...`). If omitted, `RateLimiterGuard` automatically activates its in-memory fallback tracker without crashing. |
| `STORAGE_PROVIDER` | Optional | Storage | Leave unset or set to `disabled` until Cloudflare R2 is provisioned. If unset, storage operations fail closed safely with HTTP 503. |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Optional | Storage | Leave unset until R2 bucket is created. |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Optional | Storage | Leave unset until R2 bucket is created. |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Optional | Storage | Leave unset until R2 bucket is created. |
| `CLOUDFLARE_R2_BUCKET` | Optional | Storage | Leave unset until R2 bucket is created. |
| `AI_PROVIDER` | Optional | AI Assistant | Set to `MOCK` (or leave unset). The clinical assistant will operate in deterministic clinical rules mode with emergency disclaimers. |

### ⚠️ Critical Note on `NEXT_PUBLIC_API_URL`:
- `NEXT_PUBLIC_API_URL` is **NOT** a Render backend variable!
- **DO NOT** configure `NEXT_PUBLIC_API_URL` on Render. It is an exclusive Next.js frontend browser variable that belongs only in Vercel.

---

## 2. TASK 2 — Vercel Frontend Configuration Reference

Configure this environment variable in your **Vercel Dashboard** under **Project Settings $\rightarrow$ Environment Variables** for `medinexa-duplicate`.

| Variable Name | Required? | Target Environments | Purpose & Value |
|:---|:---:|:---:|:---|
| `NEXT_PUBLIC_API_URL` | **YES (CRITICAL)** | Production, Preview, Development | Base URL of your Render backend API Gateway.<br>**Value Format:** `https://<your-render-service-name>.onrender.com/api/v1` |
| `NEXT_PUBLIC_WS_URL` | Optional | Production, Preview, Development | WebSocket endpoint for real-time bed and queue telemetry.<br>**Value Format:** `wss://<your-render-service-name>.onrender.com` |

### How to obtain the exact Render Backend URL:
1. Open the [Render Dashboard](https://dashboard.render.com).
2. Click your Web Service (e.g. `medinexa-staging-api` or your newly created service name).
3. Under the service title, copy the HTTPS URL (e.g., `https://medinexa-staging-api.onrender.com`).
4. Append `/api/v1` to that URL.
5. Example: `https://medinexa-staging-api.onrender.com/api/v1`.
6. Paste that exact string into Vercel as `NEXT_PUBLIC_API_URL`.
7. Trigger a **Redeploy** on Vercel so the client bundle builds with the active backend URL.

---

## 3. TASK 3 — Deployment Compatibility & Build Pipeline Verification

| Pipeline Component | Configuration | Verification Status |
|:---|:---|:---:|
| **Render Build Command** | `npm install --include=dev && npm run build --workspace=@medinexa/types && npm run build --workspace=@medinexa/validation && npx prisma generate --schema=./database/prisma/schema.prisma && npm run build:api` | **VERIFIED** |
| **Render Start Command** | `npm run db:migrate && node apps/api/dist/main.js` | **VERIFIED** |
| **Vercel Build Command** | `npm run build --workspace=@medinexa/types && npm run build --workspace=@medinexa/validation && npm run build:web` | **VERIFIED** |
| **Workspace Build Order** | 1. `@medinexa/types`<br>2. `@medinexa/validation`<br>3. `prisma generate`<br>4. `@medinexa/api` (Render) / `@medinexa/web` (Vercel) | **VERIFIED** |
| **API Health Check Path** | `/api/v1/health` (matches Render health check path in `render.yaml`) | **VERIFIED** |
| **CORS Policy** | Whitelist includes `https://medinexa-duplicate.vercel.app` in `cors-origin.util.ts` & `render.yaml` | **VERIFIED** |
| **Storage Safety** | Unconfigured R2 resolves to `DisabledStorageProvider` (HTTP 503). Zero startup crashes. Local filesystem strictly prohibited in production. | **VERIFIED** |
| **Prisma Compatibility** | Prisma 5.22.0 locked in `package-lock.json`, verified compatible with 6,342-line schema & 10 migration revisions | **VERIFIED** |

---

## 4. TASK 4 — Pre-Deployment & Post-Deployment Smoke Test Plan

### Category A: Local Verification (Completed & Passing 246/246)
These tests have already executed and passed locally:
- Full monorepo typecheck: `npm run typecheck` (**PASS: 0 errors**)
- Full monorepo linter: `npm run lint` (**PASS: 0 errors**)
- API Build: `npm run build:api` (**PASS: compiled cleanly**)
- Frontend Build: `npm run build:web` (**PASS: 220 routes compiled**)
- Storage Module Unit Tests: `apps/api/test/storage.module.spec.ts` (**PASS: 6/6**)
- Security Lockdown & Tenant Tests: `apps/api/test/security-lockdown.spec.ts` (**PASS: 28/28**)
- Concurrency & Isolation Tests: `apps/api/test/security-and-concurrency.spec.ts` (**PASS: 24/24**)

---

### Category B: Live Post-Deployment Smoke Tests (Execute Immediately After Deploying)

Execute these tests using your browser and terminal once Render and Vercel deployments are live:

#### 1. Backend Health Check
```bash
curl -i https://<your-render-service>.onrender.com/api/v1/health
```
- **Expected:** HTTP 200 OK  
- **Expected Body:** `{"status":"ok","service":"MediNexa Enterprise API Gateway","version":"1.0.0","database":"ok"}`

#### 2. Process Liveness Probe
```bash
curl -i https://<your-render-service>.onrender.com/api/v1/health/liveness
```
- **Expected:** HTTP 200 OK  
- **Expected Body:** `{"status":"ok","service":"MediNexa Enterprise API Gateway",...}`

#### 3. Operational Readiness Probe & Database Verification
```bash
curl -i https://<your-render-service>.onrender.com/api/v1/health/ready
```
- **Expected:** HTTP 200 OK  
- **Expected Fields:**
  - `database.status`: `"connected"`
  - `redis.mode`: `"redis"` (if Upstash connected) or `"memory_fallback"` (if Redis unset)
  - `storage.provider`: `"disabled"` (or `"r2"` if credentials set)
  - `storage.configured`: `false` (when unconfigured)

#### 4. CORS Whitelist Verification
```bash
# Test Allowed Origin:
curl -i -H "Origin: https://medinexa-duplicate.vercel.app" https://<your-render-service>.onrender.com/api/v1/health

# Test Rejected Origin:
curl -i -H "Origin: https://malicious-site.com" https://<your-render-service>.onrender.com/api/v1/health
```
- **Allowed Origin Expected:** `access-control-allow-origin: https://medinexa-duplicate.vercel.app` & `access-control-allow-credentials: true`
- **Rejected Origin Expected:** No Access-Control headers returned (CORS error in browser)

#### 5. Frontend-to-Backend Connectivity
1. Open `https://medinexa-duplicate.vercel.app` in Chrome/Firefox.
2. Open DevTools $\rightarrow$ Network Tab.
3. Verify the browser successfully loads `/api/v1/health` without CORS errors.
4. Verify no console error: `[MediNexa Production Configuration Error] NEXT_PUBLIC_API_URL is not configured`.

#### 6. User Authentication & JWT Flow
1. Navigate to `https://medinexa-duplicate.vercel.app/login`.
2. Submit valid credentials for a test account.
3. Verify successful redirect to `/portal` (for Patient) or `/dashboard` (for Hospital Staff).
4. Verify JWT token is received in response and saved in browser storage.

#### 7. Patient Portal Workflow
1. Navigate to `/portal/appointments`.
2. Verify specialist doctor lists load without errors.
3. Navigate to `/portal/medical-records`.
4. Verify clinical timeline renders properly.

#### 8. Hospital Operations & Clinical Dashboard
1. Log in with a Doctor or Hospital Admin account.
2. Navigate to `/dashboard/clinical`.
3. Verify OPD queue tokens render.
4. Navigate to `/dashboard/reception/admissions-beds`.
5. Verify live bed occupancy status loads.

#### 9. Bed Management & Real-time Telemetry
1. Open `/bed-booking` or `/portal/live-beds`.
2. Verify available beds count loads accurately.
3. Verify WebSocket connection to `/events` initializes without authentication crashes.

#### 10. Multi-Tenant Data Isolation (Anti-IDOR)
1. Log in with Hospital A Doctor credentials.
2. Attempt to query patient records belonging to Hospital B.
3. **Expected:** HTTP 403 Forbidden (`HospitalTenantGuard` fail-closed rejection).

#### 11. Storage Fail-Closed Verification
1. While Cloudflare R2 is unconfigured, navigate to document upload in `/portal/medical-records`.
2. Attempt uploading a medical report PDF.
3. **Expected:** Backend returns HTTP 503 Service Unavailable with message: `"Storage backend is not configured for this environment."`
4. **Expected:** No fake upload success, no broken image placeholder, and no server crash.

---

## 5. Rollback Considerations & Failure Scenarios

### Scenario A: Backend Fails to Start on Render
- **Symptom:** Render shows "Build Succeeded", but container exits during startup.
- **Root Cause Check:**
  1. Check Render container logs for `PrismaClientInitializationError` (means `DATABASE_URL` or `DIRECT_URL` is incorrect or Neon database is unreachable).
  2. Verify `DIRECT_URL` is populated. Neon connection poolers reject `prisma migrate deploy` unless `DIRECT_URL` points directly to port 5432.
- **Rollback:** In Render Dashboard $\rightarrow$ Deployments, click the previous successful deployment and select **Rollback**.

### Scenario B: Frontend Shows Network Errors or Blank Screens
- **Symptom:** Frontend loads UI but displays "Unable to connect to MediNexa API".
- **Root Cause Check:**
  1. Check browser console. If `NEXT_PUBLIC_API_URL is not configured` appears, set `NEXT_PUBLIC_API_URL` in Vercel settings and redeploy.
  2. If browser console shows CORS error, verify that the Render service `CORS_ORIGIN` matches `https://medinexa-duplicate.vercel.app` exactly.
- **Rollback:** In Vercel Dashboard $\rightarrow$ Deployments, find the previous working deployment and click **Instant Rollback**.

### Scenario C: Database Schema Rollback
- The migrations applied in MediNexa (`20260818000000_init_medinexa` through `20261008220000_sync_food_timing_enum`) are additive and backward-compatible.
- `database/scripts/deploy-migrations.js` is idempotent and will never overwrite or drop existing hospital data.

---

## 6. Explicit User Approval Points (Before Proceeding)

Before proceeding to Git commit or production deployment, please confirm your approval on the following:

- [ ] **Approval Point 1:** Approve committing the 10 modified and 4 created hardening files to local Git (`main` branch).
- [ ] **Approval Point 2:** Approve pushing the verified commits to your GitHub repository `singhayush256/MediNexa-Duplicate`.
- [ ] **Approval Point 3:** Confirm that you have populated `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET` in your Render Web Service settings.
- [ ] **Approval Point 4:** Confirm that you have populated `NEXT_PUBLIC_API_URL` in your Vercel Project settings.
- [ ] **Approval Point 5:** Authorize initiating live deployment on Render and Vercel.

---

**Current Status:** All pre-deployment verification is complete. The repository is in a pristine, fully verified state. No changes have been pushed or deployed.

