# MediNexa Staging Environment Deployment Guide

## Overview
This document specifies the deployment architecture, configuration parameters, and verification procedures required to launch MediNexa into a staging environment.

---

## 1. Prerequisites & Environment Dependencies
- **Node.js**: v18.0.0 or higher
- **PostgreSQL Database**: v15+ (Running on port 5433 or configured staging host)
- **Process Manager**: PM2 or Docker Compose

---

## 2. Environment Variables Configuration

| Variable | Description | Example / Staging Value |
| :--- | :--- | :--- |
| `PORT` | NestJS API Gateway HTTP Port | `3001` |
| `NODE_ENV` | Environment Flag | `staging` |
| `API_PREFIX` | REST API Routing Prefix | `/api/v1` |
| `CORS_ORIGIN` | Allowed Frontend Origin | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Client-accessible API Gateway URL | `http://localhost:3001/api/v1` |
| `DATABASE_URL` | PostgreSQL Connection URI | `postgresql://postgres:pass@localhost:5433/medinexa?schema=public` |
| `JWT_SECRET` | Cryptographic JWT Signing Key | `medinexa-staging-jwt-key-secure-2026` |
| `AI_PROVIDER` | AI Provider Implementation | `MOCK` |

---

## 3. Staging Deployment Steps

### Step 1: Shared Packages Build
```bash
npm run build --workspace=packages/types
npm run build --workspace=packages/validation
```

### Step 2: Database Migration & Schema Push
```bash
npx prisma db push --schema=./database/prisma/schema.prisma
npx prisma generate --schema=./database/prisma/schema.prisma
```

### Step 3: Seed Staging Demo Data
```bash
npx ts-node database/seed/seed.ts
```

### Step 4: Build Micro-Services & Apps
```bash
npm run build:api
npm run build:web
```

### Step 5: Start Services
```bash
# Backend API Gateway
node apps/api/dist/main.js

# Web Frontend App
npm run start --workspace=@medinexa/web
```

---

## 4. Post-Deployment Verification Protocol
1. **Health Endpoint**: Query `http://localhost:3001/api/v1/health` and verify `status: ok` and `database: connected`.
2. **Automated Integration Test Execution**:
   - `npx ts-node database/seed/test-day10.ts` (49 tests)
   - `npx ts-node database/seed/test-medication-reminder.ts` (16 tests)
3. **Frontend Dashboard Access**: Verify login at `http://localhost:3000/login` across Patient, Doctor, and Hospital Admin roles.
