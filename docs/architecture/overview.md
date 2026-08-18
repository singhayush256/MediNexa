# MediNexa System Architecture Overview

## 1. System Vision & Architecture Style

MediNexa is designed as a **Modular Monolith** for Day 1 and early development phases. A modular monolith provides strong compile-time boundaries, clean module separation, shared type safety, and zero network-hop latency between internal domain services, while preserving a clean migration path to microservices if scale requires it in the future.

```
       +-------------------------------------------------------+
       |               Frontend Layer (Next.js 14+)            |
       |  - React 18, TypeScript, Tailwind CSS                 |
       |  - SSR / Client rendering                             |
       +---------------------------+---------------------------+
                                   |
                                   | REST API (HTTP / JSON)
                                   v
       +-------------------------------------------------------+
       |               Backend Layer (NestJS API)              |
       |  - REST Versioning (/api/v1)                          |
       |  - Global Pipes & Error Filters                       |
       |  - Prisma Service & Domain Modules                    |
       +---------------------------+---------------------------+
                                   |
                                   | SQL Queries (Prisma ORM)
                                   v
       +-------------------------------------------------------+
       |               Database Layer (PostgreSQL)             |
       |  - Database: medinexa                                 |
       |  - Initial Models: User, Role, Organization           |
       +-------------------------------------------------------+
```

---

## 2. Component Details

### Frontend (`apps/web`)
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom healthcare brand palette
- **Core Routes**:
  - `/` Landing page & live API status check
  - `/login` Healthcare portal access UI
  - `/dashboard` Foundation overview

### Backend API (`apps/api`)
- **Framework**: NestJS 10+
- **Language**: TypeScript
- **Versioning**: Global URL prefix `/api/v1`
- **Core Modules**:
  - `HealthModule`: `GET /api/v1/health`
  - `PrismaModule`: Global database access service

### Database Layer (`database/`)
- **Database Engine**: PostgreSQL 18
- **ORM**: Prisma 5+
- **Foundation Schema**: `User`, `Role`, `Organization`

---

## 3. Data Flow

1. User interacts with Next.js web application (`apps/web`).
2. Client sends HTTP requests to NestJS REST API (`apps/api/src/main.ts`) at `/api/v1/...`.
3. NestJS routes request through controller, service layer, and validation.
4. Service layer invokes Prisma ORM client (`database/prisma/schema.prisma`).
5. Prisma executes structured queries against PostgreSQL (`medinexa` database).
6. Response formatted as structured JSON returned back to Next.js frontend.

---

## 4. Future System Modules (Roadmap Preview)

The modular monolith is structured to accommodate the following upcoming domain modules cleanly:
- Patient Management & EHR
- Doctor & Clinical Staff Management
- Hospital & Bed Management
- Appointments & Scheduling
- Prescriptions & Reminders
- Admissions, Transfers, & Discharge
- Laboratory & Pathology
- Pharmacy Management
- Hospital-to-Hospital Referral Network
- Emergency & Ambulance Dispatch
- Billing, Insurance, & Invoicing
- Background Event Processing (Redis + WebSockets)
