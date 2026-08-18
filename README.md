# MediNexa — Connected Healthcare, One Platform

MediNexa is an enterprise-grade, connected healthcare platform designed to seamlessly integrate patients, doctors, nurses, hospital networks, pathology laboratories, pharmacies, emergency ambulance providers, and administrators into a single unified ecosystem.

---

## 1. What is MediNexa?

MediNexa addresses fragmentation in modern healthcare by providing a secure, high-performance, modular monolith platform. It enables real-time clinical workflows, EHR management, live bed availability tracking, digital prescriptions, lab test orders, emergency dispatch, and hospital-to-hospital referrals.

---

## 2. Current Status: Post-MVP Stabilization & Audit Complete (STAGING-READY)

* **Phase**: **Post-MVP Stabilization & Security Audit**
* **Status**: **STAGING-READY**
* **Verification Summary**:
  - **Medication Reminders Test Suite**: `16 PASSED, 0 FAILED`
  - **Day 10 Final Integration Suite**: `49 PASSED, 0 FAILED`
  - **TypeScript Typecheck**: `0 Errors`
  - **ESLint Linting**: `0 Errors`
  - **Prisma Schema**: `Valid 🚀`
  - **Backend NestJS Build**: `PASSED`
  - **Frontend Next.js Build**: `PASSED (27/27 Static & Dynamic Pages)`

---

## 3. Architecture & Roles Matrix

### Monorepo Apps & Packages
- `apps/web`: Next.js 14 App Router dashboard workstation ([http://localhost:3000](http://localhost:3000))
- `apps/api`: NestJS 10 REST API & WebSocket Gateway ([http://localhost:3001/api/v1](http://localhost:3001/api/v1))
- `packages/types`: Monorepo shared DTOs & TypeScript interfaces
- `packages/validation`: Monorepo shared validation helpers & RBAC matrices
- `database/prisma`: PostgreSQL Prisma ORM schema (Port 5433)

### System Roles
1. `PATIENT`: Accesses personal EHR, appointment booking, digital prescriptions, medication reminders, and notifications.
2. `DOCTOR`: Assigned appointment queue, clinical encounters, signed notes, vitals, diagnoses, lab orders, prescriptions.
3. `NURSE`: Patient check-in, vital signs recording, ward bed allocations.
4. `RECEPTIONIST`: Patient registration, appointment scheduling, front desk.
5. `LAB_STAFF`: Specimen collection, lab test result entry, order processing.
6. `PHARMACY_STAFF`: Prescription fulfillment and dispense tracking.
7. `AMBULANCE_DRIVER`: Emergency dispatch tracking, GPS location updates.
8. `HOSPITAL_ADMIN`: Facility infrastructure, bed engine, doctor rosters, facility analytics.
9. `MEDINEXA_ADMIN`: Global network management and system overview.

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL Database on Port 5433 (`medinexa` database)

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Build shared packages
npm run build --workspace=packages/types
npm run build --workspace=packages/validation

# 3. Sync Database Schema & Generate Prisma Client
npx prisma db push --schema=./database/prisma/schema.prisma
npx prisma generate --schema=./database/prisma/schema.prisma

# 4. Seed Database Data
npx ts-node database/seed/seed.ts

# 5. Build Applications
npm run build:api
npm run build:web

# 6. Start Services
# Backend API:
node apps/api/dist/main.js

# Frontend Web:
npm run dev:web
```

---

## 5. Verification Commands

```bash
# Quality checks
npm run typecheck
npm run lint
npx prisma validate --schema=./database/prisma/schema.prisma

# Automated Test Suites
npx ts-node database/seed/test-medication-reminder.ts
npx ts-node database/seed/test-day10.ts
```

---

## 6. Architecture & Security Documentation Index

- [Post-MVP Architecture & Audit Report](file:///c:/Users/Tushar/OneDrive/Desktop/MediNexa/docs/architecture/post-mvp-audit.md)
- [Security & Authorization Audit Matrix](file:///c:/Users/Tushar/OneDrive/Desktop/MediNexa/docs/security/security-audit.md)
- [Staging Environment Deployment Guide](file:///c:/Users/Tushar/OneDrive/Desktop/MediNexa/docs/deployment/staging-deployment.md)
