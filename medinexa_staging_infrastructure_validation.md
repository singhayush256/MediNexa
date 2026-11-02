# MediNexa Staging Infrastructure Validation & Configuration Guide

**Environment:** Staging / Pre-Pilot Validation  
**Date:** November 2026  
**Target Milestone:** Real Hospital Shadow Pilot  
**Infrastructure Providers:** Vercel (Frontend), Render / Cloud Run (API Gateway), Managed PostgreSQL, Managed Redis, Cloudflare R2

---

## 1. Staging Network Architecture & Topology

```mermaid
graph LR
    subgraph PublicInternet ["Public Internet"]
        PilotUsers([Pilot Hospital Users & Testers])
    end

    subgraph StagingEdge ["Staging Edge Perimeters"]
        CloudflareDNS[Cloudflare DNS & WAF<br>staging.medinexa.com]
    end

    subgraph StagingCompute ["Staging Compute Layer"]
        VercelStaging[Vercel Staging Environment<br>Next.js 14 Web Frontend]
        RenderStaging[Render Web Service (Staging)<br>NestJS API Gateway]
    end

    subgraph StagingDataLayer ["Staging Dedicated Persistence Layer"]
        StagingDB[(PostgreSQL 15 Managed DB<br>medinexa_staging)]
        StagingRedis[(Redis TCP Instance<br>medinexa-staging-cache)]
        StagingR2[(Cloudflare R2 Bucket<br>medinexa-staging-attachments)]
    end

    PilotUsers --> CloudflareDNS
    CloudflareDNS --> VercelStaging
    CloudflareDNS --> RenderStaging
    RenderStaging --> StagingDB
    RenderStaging --> StagingRedis
    RenderStaging --> StagingR2
```

### Staging Endpoints & Domain Mapping
- **Frontend Staging URL:** `https://staging.medinexa.com`
- **API Gateway Staging URL:** `https://staging-api.medinexa.com`
- **Staging API Prefix:** `/api/v1`
- **Liveness Health Endpoint:** `https://staging-api.medinexa.com/api/v1/health/liveness`
- **Readiness Health Endpoint:** `https://staging-api.medinexa.com/api/v1/health/ready`

---

## 2. Environment Isolation & Anti-Contamination Safeguards

> [!CAUTION]
> **Database Cross-Contamination Prevention:** To eliminate the risk of accidental writes to production or confusion between environments, MediNexa enforces physical and logical isolation barriers:

1. **Distinct Database Names:** Staging uses `medinexa_staging`; Production uses `medinexa_prod`. Database connection strings with mismatched names are rejected by configuration guards.
2. **Distinct Cloud Accounts / VPCs:** Staging database operates within an isolated subnet and VPC security group that does not peer with production data clusters.
3. **Dedicated Object Storage Buckets:** Staging attachments reside in `medinexa-staging-attachments`, completely segregated from production storage (`medinexa-prod-attachments`).
4. **Environment Header Verification:** The staging API gateway emits an `X-Environment: staging` response header on all HTTP requests to clearly identify test environments in browser devtools.

---

## 3. Staging Environment Variables Reference

*(All values shown are illustrative formats; real secrets are injected securely via Cloud Secret Managers).*

| Variable Name | Required By | Staging Format / Value | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | API & Web | `staging` | Runtime environment identifier |
| `PORT` | API | `3001` | Internal container binding port |
| `API_PREFIX` | API | `api/v1` | Global REST route prefix |
| `DATABASE_URL` | API & DB | `postgresql://medinexa_stage_usr:••••••••@staging-db.internal:5432/medinexa_staging?sslmode=require&connection_limit=10` | Dedicated staging database |
| `REDIS_URL` | API | `rediss://default:••••••••@staging-redis.internal:6379` | Dedicated staging Redis |
| `JWT_SECRET` | API | `64-character-hex-staging-secret` | Short-lived token signing key |
| `JWT_EXPIRATION` | API | `15m` | Token lifetime (15 minutes) |
| `JWT_REFRESH_SECRET` | API | `64-character-hex-refresh-staging-secret` | Refresh token signing key |
| `JWT_REFRESH_EXPIRATION`| API | `7d` | Refresh token lifetime |
| `STORAGE_PROVIDER` | API | `r2` | Fail-closed object storage provider |
| `CLOUDFLARE_R2_ACCOUNT_ID` | API | `staging-account-id` | Cloudflare account identifier |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | API | `staging-access-key` | S3-compatible access key |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | API | `staging-secret-key` | S3-compatible secret key |
| `CLOUDFLARE_R2_BUCKET` | API | `medinexa-staging-attachments` | Isolated staging bucket |
| `ALLOWED_CORS_ORIGINS` | API | `https://staging.medinexa.com` | Staging CORS origin allowlist |
| `NEXT_PUBLIC_API_URL` | Web | `https://staging-api.medinexa.com/api/v1` | Public frontend gateway URL |
| `SMS_PROVIDER` | API | `MSG91` (or `MOCK` for non-SMS tests) | Indian DLT SMS provider |
| `SMS_SENDER_ID` | API | `MDNEXA` | Approved 6-char TRAI sender ID |
| `DLT_ENTITY_ID` | API | `1101552390000041289` | TRAI DLT Principal Entity ID |

---

## 4. Staging Deployment Verification Runbook

Execute this verification sequence when deploying new builds to staging:

```bash
# 1. Verify Staging API Gateway Health
curl -s -i https://staging-api.medinexa.com/api/v1/health/liveness | grep 'HTTP/1.1 200 OK'

# 2. Inspect Full Readiness Probe (Database & Redis state)
curl -s https://staging-api.medinexa.com/api/v1/health/ready | jq .

# Expected Output:
# {
#   "status": "ok",
#   "service": "MediNexa Enterprise API Gateway",
#   "version": "1.0.0",
#   "database": {
#     "status": "connected",
#     "latencyMs": 8
#   },
#   "redis": {
#     "configured": true,
#     "connected": true,
#     "mode": "redis"
#   },
#   "storage": {
#     "provider": "r2",
#     "configured": true
#   }
# }

# 3. Verify Staging Frontend Loads Correctly
curl -s -I https://staging.medinexa.com | grep 'HTTP/2 200'
```
