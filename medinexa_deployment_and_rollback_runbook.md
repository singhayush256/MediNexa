# MediNexa Production Deployment, Release Management & Rollback Runbook

**Platforms:** Vercel (Next.js Frontend) & Render / Cloud Run (NestJS Backend API Gateway)  
**Database:** Managed PostgreSQL 15+ via Prisma ORM  
**Release Strategy:** Blue-Green / Zero-Downtime Rolling Release

---

## 1. Hosting Architecture & Service Endpoints

```mermaid
graph LR
    User([End Users / Hospital Staff]) -->|HTTPS| Cloudflare[Cloudflare Edge DNS & WAF]
    
    Cloudflare -->|https://medinexa.com| VercelFrontend[Vercel: Next.js 14 Frontend App]
    Cloudflare -->|https://api.medinexa.com| RenderBackend[Render / Cloud Run: NestJS API Gateway]
    
    RenderBackend -->|Internal Private VPC| PostgresDB[(PostgreSQL 15 Managed DB)]
    RenderBackend -->|Internal Private VPC| RedisCache[(Redis Managed TCP)]
    RenderBackend -->|HTTPS / S3 API| R2Storage[(Cloudflare R2 Private Bucket)]
```

### Verified Production URLs & Allowlist
- **Frontend Production URL:** `https://medinexa.com` (and `https://www.medinexa.com`)
- **Backend API Gateway URL:** `https://api.medinexa.com`
- **API Prefix:** `/api/v1`
- **CORS Production Whitelist:** `https://medinexa.com`, `https://www.medinexa.com`, `https://app.medinexa.com`
- **Health Probes:**
  - Liveness: `GET https://api.medinexa.com/api/v1/health/liveness`
  - Readiness: `GET https://api.medinexa.com/api/v1/health/ready`

---

## 2. Environment Variables Configuration Table

> [!IMPORTANT]
> **Zero Secrets Exposure:** Never commit real secrets, API keys, or database passwords to source code repositories or print them in terminal logs. Use cloud secret managers (Render Secrets, Vercel Environment Variables).

| Variable Name | Required Service | Description / Example Format |
| :--- | :--- | :--- |
| `NODE_ENV` | API & Web | `production` |
| `PORT` | API | `3001` (or assigned by host container) |
| `API_PREFIX` | API | `api/v1` |
| `DATABASE_URL` | API & DB | `postgresql://user:pass@host:5432/medinexa?sslmode=require&connection_limit=20` |
| `REDIS_URL` | API | `rediss://default:pass@redis-host:6379` |
| `JWT_SECRET` | API | Cryptographically secure 64-char hex string |
| `JWT_EXPIRATION` | API | `15m` (Strict short-lived tokens) |
| `JWT_REFRESH_SECRET` | API | Distinct 64-char hex secret |
| `JWT_REFRESH_EXPIRATION`| API | `7d` |
| `STORAGE_PROVIDER` | API | `r2` (Fail-closed: local disk prohibited in prod) |
| `CLOUDFLARE_R2_ACCOUNT_ID` | API | Cloudflare R2 Account Identifier |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | API | R2 S3-Compatible API Key ID |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | API | R2 S3-Compatible API Secret |
| `CLOUDFLARE_R2_BUCKET` | API | `medinexa-prod-attachments` |
| `ALLOWED_CORS_ORIGINS` | API | `https://medinexa.com,https://www.medinexa.com` |
| `NEXT_PUBLIC_API_URL` | Web | `https://api.medinexa.com/api/v1` |

---

## 3. Zero-Downtime Pre-Deployment & Release Checklist

Follow this sequence for every production deployment:

### Phase A: Pre-Flight Verification (Local / CI)
- [ ] Run typecheck across monorepo: `npm run typecheck` (Must pass with 0 errors).
- [ ] Run automated test suite: `npm test` (Must pass 227/227 tests).
- [ ] Run linter: `npm run lint` (Clean across all workspaces).
- [ ] Compile production bundles: `npm run build:api` and `npm run build:web`.
- [ ] Inspect git branch and tag: Confirm merge to `main`.

### Phase B: Database Schema Migration Deployment
> [!NOTE]
> Always execute non-destructive database migrations **before** deploying new API application code. Never remove or rename columns in the same release that removes application usage (Expand-Contract Pattern).

```bash
# Apply migrations non-destructively to target database
npm run db:migrate:deploy
```

### Phase C: Backend API Gateway Deployment (Render / Cloud Run)
- [ ] Deploy new Docker image or git commit to Render.
- [ ] Monitor container boot logs for successful startup:
  `[MediNexa API] Server started on port 3001 (production)`
- [ ] Verify readiness probe responds with HTTP 200:
  `curl -i https://api.medinexa.com/api/v1/health/ready`

### Phase D: Frontend Web Deployment (Vercel)
- [ ] Trigger Vercel production deployment from `main`.
- [ ] Verify build output and edge route generation.
- [ ] Execute smoke tests on login page, doctor dashboard, and patient portal.

---

## 4. Post-Deployment Smoke Test Suite

Execute these verification checks immediately following release:

```bash
# 1. Verify API Gateway Liveness Probe
curl -s -f https://api.medinexa.com/api/v1/health/liveness | grep '"status":"ok"'

# 2. Verify API Gateway Readiness Probe (DB & Redis)
curl -s -f https://api.medinexa.com/api/v1/health/ready | grep '"database":{"status":"connected"'

# 3. Verify CORS rejection on untrusted origin
curl -I -s -H "Origin: https://malicious-site.com" https://api.medinexa.com/api/v1/health \
  | grep -v "Access-Control-Allow-Origin: https://malicious-site.com"

# 4. Verify Request Correlation ID is attached
curl -I -s https://api.medinexa.com/api/v1/health | grep -i "x-correlation-id"
```

---

## 5. Instant Rollback Runbook

### Rollback Triggers
Initiate an immediate rollback if any of the following occur within 30 minutes of release:
- Liveness or readiness probes return HTTP 503 or fail continuously for > 2 minutes.
- Error rate on `/api/v1/*` exceeds 1.5% of total requests.
- P95 latency spikes above 2,000ms.
- Any hospital reports patient data inaccessibility or session authentication failures.

### Frontend Instant Rollback (Vercel)
1. Open Vercel Project Dashboard → **Deployments**.
2. Locate the previous stable deployment (marked "Ready").
3. Click the three dots (`...`) menu and select **Instant Rollback (Promote to Production)**.
4. Traffic shifts instantly (0-second edge DNS switch).

### Backend Rollback (Render / Git)
1. Identify the last known stable commit hash (e.g., `32e8fe6`).
2. Rollback git commit:
   ```bash
   git revert HEAD --no-edit
   git push origin main
   ```
3. Or in Render Dashboard: Select Web Service → **Deploys** → Select previous deployment → **Rollback**.
4. Confirm health recovery:
   `curl -i https://api.medinexa.com/api/v1/health/ready`
