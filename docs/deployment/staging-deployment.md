# MediNexa Staging Environment Deployment Plan

## Executive Summary
This document outlines the end-to-end staging deployment plan, infrastructure requirements, security controls, and verification protocols for launching the MediNexa Connected Healthcare Monorepo into a staging environment.

---

## 1. Required Infrastructure Services
- **Backend API Gateway**: Node.js runtime hosting NestJS 10 REST & WebSocket Server (Port 3001).
- **Frontend App**: Next.js 14 App Router SSR/Static Server (Port 3000).
- **Managed PostgreSQL Database**: Managed PostgreSQL 15+ instance with connection pooling.
- **Reverse Proxy / SSL Termination**: NGINX / Cloudflare for SSL/HTTPS termination.

---

## 2. Required Accounts & Credentials
- Infrastructure Provider Account (e.g. Render / Railway / AWS / DigitalOcean / Vercel).
- PostgreSQL Database Provider Account (e.g. Supabase / Neon / AWS RDS).
- Staging Domain & DNS Management Account.

---

## 3. Environment Variables Configuration Matrix

```bash
# Server Configuration
PORT=3001
NODE_ENV=production
API_PREFIX=/api/v1
CORS_ORIGIN=https://staging.medinexa.app

# Public Client Configuration (Exposed to Browser)
NEXT_PUBLIC_API_URL=https://staging-api.medinexa.app/api/v1
NEXT_PUBLIC_WS_URL=wss://staging-api.medinexa.app

# Database Connection
DATABASE_URL="postgresql://medinexa_user:staging_password_secure@staging-db-host:5432/medinexa?schema=public&sslmode=require"

# Secrets
JWT_SECRET=medinexa-staging-jwt-key-secure-2026
AI_PROVIDER=MOCK
AI_API_KEY=mock-staging-key
```

---

## 4. PostgreSQL Database Setup
- Provision fresh PostgreSQL 15+ instance.
- Configure firewall rules allowing connections only from backend API Gateway IP addresses.

---

## 5. Database Migration Protocol
```bash
# Run validation & non-destructive migration
npx prisma validate --schema=./database/prisma/schema.prisma
npx prisma db push --schema=./database/prisma/schema.prisma
npx prisma generate --schema=./database/prisma/schema.prisma

# Seed synthetic demo dataset
npx ts-node database/seed/seed.ts
```

---

## 6. Backend API Gateway Deployment
```bash
# Build NestJS API
npm run build:api

# Start production daemon
node apps/api/dist/main.js
```

---

## 7. Frontend Deployment
```bash
# Build Next.js Web Frontend
npm run build:web

# Start production web server
npm run start --workspace=@medinexa/web
```

---

## 8. WebSocket Configuration
- WebSockets run on the NestJS Gateway (`/events` namespace).
- Reverse proxies (NGINX / Cloudflare) must support HTTP Upgrade headers (`Upgrade: websocket`, `Connection: Upgrade`).

---

## 9. CORS Configuration
- `CORS_ORIGIN` set to `https://staging.medinexa.app`.
- Wildcard origin (`*`) is explicitly prohibited on authenticated staging endpoints.

---

## 10. Domain & SSL/HTTPS Configuration
- Frontend Domain: `https://staging.medinexa.app`
- Backend API Domain: `https://staging-api.medinexa.app`
- Automated Let's Encrypt TLS/SSL certificates enforced with HTTP to HTTPS redirects.

---

## 11. Health & Readiness Verification
- Health Endpoint: `GET https://staging-api.medinexa.app/api/v1/health`
- Response Payload:
  ```json
  {
    "status": "ok",
    "service": "MediNexa API",
    "version": "1.0.0",
    "database": "connected"
  }
  ```

---

## 12. Automated Smoke Testing Protocol
Post-deployment, execute automated test suites against staging API:
```bash
npx ts-node database/seed/test-medication-reminder.ts
npx ts-node database/seed/test-day10.ts
```

---

## 13. Rollback Procedure
If staging deployment fails smoke tests:
1. Revert backend process to previous stable release tag via PM2 / container runner.
2. Revert frontend deployment tag.
3. If database schema was altered, apply rollback migration script.

---

## 14. Backup Procedure
Before initiating staging deployments, execute database backup:
```bash
./scripts/backup-db.sh
```

---

## 15. Deployment Platform Evaluation for MediNexa Startup

For MediNexa's evolution into a production healthcare platform, we recommend:

| Platform Option | Best Suited For | Pros | Cons | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **AWS (ECS + RDS + CloudFront)** | Enterprise Healthcare Production | HIPAA compliance support, VPC isolation, high scalability, managed RDS backups. | Higher ops complexity & cost. | **Recommended for Production** |
| **Render / Railway + Neon** | Staging / MVP Demo Launch | Zero infra overhead, native WebSocket support, simple env management, low cost. | Requires custom HIPAA compliance for live production. | **Recommended for Staging** |
| **Vercel (Frontend) + AWS ECS (API)** | Hybrid Hosting | Fast Next.js CDN frontend, robust backend API isolation. | Split hosting monitoring. | Excellent Alternative |
