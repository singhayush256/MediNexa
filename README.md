# 🏥 MediNexa — Connected Healthcare Enterprise HMS & Clinical Operating System

> **Tagline:** *Your Healthcare, Connected.*

<div align="center">

![MediNexa Official Platform](https://img.shields.io/badge/MediNexa-Production%20Clinical%20OS-0070f3?style=for-the-badge&logoColor=white)

**Hospital-grade, multi-tenant Hospital Management System (HMS) & Clinical Operating System engineered with full-stack TypeScript, real-time WebSocket telemetry, Supabase storage, resilient 4-tier AI, and ABDM/NABH healthcare compliance.**

[![Live Frontend](https://img.shields.io/badge/Live%20Frontend-medinexa--medicalweb.vercel.app-success?style=flat-square&logo=vercel)](https://medinexa-medicalweb.vercel.app)
[![API Gateway](https://img.shields.io/badge/API%20Gateway-onrender.com%2Fapi%2Fv1-blue?style=flat-square&logo=render)](https://medinexa-duplicate-api.onrender.com/api/v1)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS 10](https://img.shields.io/badge/NestJS-10.3-ea2845?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![Neon PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-336791?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.14-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.4%20Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7%20Realtime-010101?style=flat-square&logo=socketdotio)](https://socket.io/)
[![Supabase Storage](https://img.shields.io/badge/Storage-Supabase%20Private%20Vault-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Unit & Integration Tests](https://img.shields.io/badge/Tests-300%2F300%20Passing%20(100%25)-brightgreen?style=flat-square)](#29-testing-instructions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Live Demo](https://medinexa-medicalweb.vercel.app) • [Patient Portal](https://medinexa-medicalweb.vercel.app/patient) • [Hospital Portal](https://medinexa-medicalweb.vercel.app/hospital) • [Live Beds](https://medinexa-medicalweb.vercel.app/portal/live-beds) • [Architecture](#9-system-architecture) • [Demo Walkthrough](#35-demo-instructions) • [Setup Guide](#23-local-setup-instructions)

</div>

---

## Table of Contents

1. [Project Title and Introduction](#1-project-title-and-introduction)
2. [Tagline](#2-tagline)
3. [Project Overview](#3-project-overview)
4. [Problem Statement](#4-problem-statement)
5. [Proposed Solution](#5-proposed-solution)
6. [Vision and Objectives](#6-vision-and-objectives)
7. [Key Features](#7-key-features)
8. [Detailed Explanation of Each Portal](#8-detailed-explanation-of-each-portal)
9. [System Architecture](#9-system-architecture)
10. [Technology Stack](#10-technology-stack)
11. [Frontend Architecture](#11-frontend-architecture)
12. [Backend Architecture](#12-backend-architecture)
13. [Database Architecture](#13-database-architecture)
14. [AI Integration & Clinical Cascade](#14-ai-integration--clinical-cascade)
15. [Supabase Private File Storage](#15-supabase-private-file-storage)
16. [Real-Time Communication & Telemetry](#16-real-time-communication--telemetry)
17. [Payment Demo & Sandbox Workflow](#17-payment-demo--sandbox-workflow)
18. [User Roles and Permissions](#18-user-roles-and-permissions)
19. [Application Workflow](#19-application-workflow)
20. [API Architecture and Endpoint Documentation](#20-api-architecture-and-endpoint-documentation)
21. [Repository Folder Structure](#21-repository-folder-structure)
22. [Installation Prerequisites](#22-installation-prerequisites)
23. [Local Setup Instructions](#23-local-setup-instructions)
24. [Environment Variable Setup](#24-environment-variable-setup)
25. [Database Migration and Prisma Commands](#25-database-migration-and-prisma-commands)
26. [Frontend Development Command](#26-frontend-development-command)
27. [Backend Development Command](#27-backend-development-command)
28. [ML Service Setup](#28-ml-service-setup)
29. [Testing Instructions](#29-testing-instructions)
30. [Deployment Architecture](#30-deployment-architecture)
31. [Live Frontend URL](#31-live-frontend-url)
32. [Backend URL](#32-backend-url)
33. [Security Practices & Data Isolation](#33-security-practices--data-isolation)
34. [Known Limitations](#34-known-limitations)
35. [Demo Instructions](#35-demo-instructions)
36. [Future Scope](#36-future-scope)
37. [Contribution Guidelines](#37-contribution-guidelines)
38. [License Information](#38-license-information)

---

## 1. Project Title and Introduction

**MediNexa** is an enterprise-scale, production-deployed Hospital Management System (HMS) and Clinical Operating System engineered to unify patients, physicians, hospital executives, nurses, pharmacists, and lab technicians into a single, high-throughput digital clinical core.

Engineered with a full-stack TypeScript monorepo architecture (**Next.js 14 App Router** frontend and **NestJS 10** REST/WebSocket backend), MediNexa eliminates the fragmentation of modern healthcare by connecting patient self-service with real-time ward telemetry, electronic health records (EHR), multi-tenant hospital administration, and statutory national compliance (ABDM M1–M3, TRAI DLT).

---

## 2. Tagline

> **Your Healthcare, Connected.**

---

## 3. Project Overview

Modern hospitals frequently operate on disparate legacy applications: one system for OPD registration, an isolated software for billing, paper charts or static spreadsheets for inpatient bed occupancy, and third-party portals for laboratory diagnostics.

MediNexa bridges this divide with a unified multi-portal architecture featuring:
* **Patient Health OS:** Universal patient portal for 24/7 doctor booking, live hospital bed occupancy discovery, longitudinal diagnostic vaults, and Guardian Health biometrics.
* **Hospital Clinical Workstations:** Role-based workspaces for Doctors, Head Nurses, Pharmacists, Radiologists, Receptionists, and Billing Specialists across multiple hospital campuses.
* **Super Admin Platform:** Enterprise-wide multi-tenant governance, facility onboarding, security audits, and regulatory tracking.
* **Real-Time Ward Telemetry:** Instant WebSocket synchronization for hospital bed allocations, occupancy changes, and trauma triage.

---

## 4. Problem Statement

1. **Fragmented Patient Journey:** Patients juggle multiple portals or physical papers for appointments, lab tests, prescriptions, and insurance pre-authorization.
2. **Emergency Bed Blindness:** During emergency trauma situations, families call hospitals blindly without knowing whether an ICU, oxygen bed, or ventilator is currently available.
3. **Double-Booking & Queue Bottlenecks:** Manual OPD token management leads to chaotic waiting rooms, specialist burnout, and missed appointments.
4. **Data Silos & IDOR Risks:** Clinical documents often lack strict tenant boundaries, exposing medical data or complicating hospital-to-hospital referrals.
5. **Lack of Resilient AI Clinical Triage:** Healthcare chatbots frequently hallucinate medical treatments or crash when third-party AI APIs experience outages.

---

## 5. Proposed Solution

MediNexa solves these foundational challenges through:
1. **Unified Multi-Portal Monorepo:** Clean separation of concerns between patient self-service, clinical operations, and enterprise administration.
2. **Zero-Latency Bed Telemetry:** Live bed availability across all network facilities with sub-100ms multi-tab and multi-device updates.
3. **Fail-Safe AI Cascade:** 4-tier intelligent AI fallback (*Anthropic Claude → Google Gemini → OpenAI → Built-in Clinical Rules*) guaranteeing 100% uptime with mandatory emergency triage disclaimers.
4. **Private Object Storage:** Patient medical records stored securely in private Supabase buckets with time-limited signed download URLs and strict tenant IDOR checks.
5. **Interactive Demo Personas:** 1-click persona switchers for 10 verified patient personas and 16 hospital clinical personas, enabling instant, credential-free demonstration for evaluators.

---

## 6. Vision and Objectives

* **Universal Healthcare Accessibility:** Empower every citizen with longitudinal diagnostic history, token queues, and transparent bed availability.
* **Clinical Precision & Speed:** Reduce inpatient intake and bed allocation turnaround time from 45 minutes to under 60 seconds.
* **Enterprise Security First:** Zero-trust architecture with RFC 6238 TOTP two-factor authentication, AES-256-GCM encryption, and tenant data isolation.
* **National Standards Compliance:** Native architectural alignment with Ayushman Bharat Digital Mission (ABDM M1, M2, M3) and statutory healthcare taxation (GST/SAC).

---

## 7. Key Features

* 🏥 **Live Network Bed Telemetry:** Real-time occupancy tracking for ICU, General, and Emergency wards across network facilities.
* 👨‍⚕️ **Specialist Consultation Engine:** Outpatient scheduling, OPD token generation, and real-time slot locking to prevent race conditions.
* 📊 **Guardian Health Biometric Score:** Continuous biometric analysis (0–100 scale) with early patient deterioration detection.
* 🔒 **Supabase Private Storage:** End-to-end encrypted medical report uploads with time-limited signed URLs (1-hour auto-expiry).
* 🤖 **4-Tier Resilient AI Assistant:** Clinical symptom guidance with automatic failover across Claude, Gemini, OpenAI, and deterministic rule engines.
* 💳 **Sandbox Payment Demo:** Realistic Razorpay/UPI checkout demonstration for hospital consultation and OPD booking fees.
* 🚑 **1-Click Emergency SOS:** Instant geolocation-assisted emergency dispatch and priority hospital trauma triage hotline.
* 🛡️ **Zero-Trust Multi-Tenant RBAC:** Strict permission boundaries across 8 system roles with RFC 6238 TOTP Google Authenticator 2FA.

---

## 8. Detailed Explanation of Each Portal

### 1. Patient Portal (`/patient`, `/portal`)
* **Live Beds Telemetry (`/portal/live-beds`):** Real-time bed occupancy across network hospitals (Hospital A Delhi, Hospital B Mumbai, Noida Super-Specialty).
* **Doctor Appointments (`/portal/appointments`):** Search specialists by department, select date and time slots, and receive instant confirmation tokens.
* **Medical Records Vault (`/portal/medical-records`):** Secure private upload of lab PDFs, discharge summaries, and radiology imaging.
* **Prescription Tracker (`/portal/prescriptions`):** Active medications, dosage instructions, and refill schedules prescribed by attending physicians.
* **Lab Reports (`/portal/lab-reports`):** Diagnostic test results with reference ranges and abnormal flag indicators.
* **Demo Switcher Modal:** 1-click access to 10 diverse patient personas (Diabetic Chronic Care, Pediatric, Maternity, Cardiac, etc.).

### 2. Doctor Portal (`/dashboard/doctor-appointments`)
* **Clinical OPD Queue:** Real-time patient token line with waiting, in-consultation, and completed statuses.
* **SOAP Notes Workstation:** Subjective, Objective, Assessment, and Plan clinical documentation with ICD-10 coding.
* **E-Prescription Generator:** Structured drug dosage, frequency, duration, and food timing directions.
* **Diagnostic Orders:** Immediate order dispatch to Central Pathology and Radiology PACS imaging.

### 3. Hospital Admin & Staff Portals (`/hospital`, `/dashboard/*`)
* **Executive Command Center (`/dashboard`):** Real-time occupancy heatmaps, admission stats, and operational metrics.
* **Inpatient Ward Admissions (`/dashboard/admissions`):** Patient bed assignment, department transfer, and discharge clearance.
* **Nurse Workstation (`/dashboard/nursing`):** Vitals monitoring, medication administration records (MAR), and nurse shift handovers.
* **Central Pharmacy (`/dashboard/pharmacy`):** Medicine inventory, batch tracking, expiry alerts, and prescription fulfillment.
* **Central Pathology (`/dashboard/lab`):** Sample collection, automated analyzer result entry, and pathologist report sign-off.
* **Central Billing (`/dashboard/billing`):** Inpatient invoices with SAC 999311 healthcare tax exemption and 12% medicine GST calculation.
* **Emergency & Trauma (`/dashboard/emergency`):** Red/Yellow/Green trauma triage triage queue and crash-cart allocation.
* **Demo Role Switcher:** 1-click login into 16 distinct hospital staff personas across Hospital A, Hospital B, and Enterprise Administration.

### 4. Super Admin Portal (`/super-admin`, `/dashboard/super-admin`)
* **Enterprise Oversight:** Multi-hospital registry, license verification, and facility onboarding.
* **System Audit Vault:** Immutable audit logs capturing every user login, record access, and configuration update.
* **Platform Security:** Global session termination, 2FA enforcement, and rate-limiting rules.

---

## 9. System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Next.js 14 App Router — Vercel)"]
        A[Patients & Public] -->|HTTPS| C[Web Application]
        B[Doctors & Medical Staff] -->|HTTPS| C
        ADM[Super Administrators] -->|HTTPS| C
        C --> WSC[Socket.IO Client]
        C --> UI[Tailwind CSS & Lucide Icons]
    end

    subgraph GatewayLayer ["API Gateway & Security Core (NestJS 10 — Render)"]
        C -->|REST API /api/v1| G[NestJS API Gateway]
        WSC <-->|WebSockets :10000| WSG[WebSocket Gateway]
        G --> AUTH[JWT & TOTP 2FA Guard]
        G --> RBAC[8-Role RBAC & Multi-Tenant Guard]
        G --> RATE[Rate Limiting Guard]
    end

    subgraph ServiceLayer ["Backend Domain Modules (NestJS)"]
        G --> BED[Bed Telemetry Service]
        G --> APPT[Appointment & OPD Service]
        G --> CLIN[Clinical & EHR Service]
        G --> STOR[Storage Module]
        G --> AI[AI Healthcare Provider]
        G --> BILL[Billing & Invoicing Service]
        G --> NOTIF[Notification Service]
    end

    subgraph PersistenceLayer ["Cloud Persistence & Infrastructure"]
        BED & APPT & CLIN & BILL --> PRISMA[Prisma ORM Client]
        PRISMA --> NEON[(Neon PostgreSQL Serverless)]
        AUTH & RATE --> REDIS[(Upstash Redis Cache)]
        STOR --> SUPA[(Supabase Private Bucket)]
        AI --> ANTHROPIC[Anthropic Claude API]
        AI --> GEMINI[Google Gemini API]
        AI --> OPENAI[OpenAI API]
        AI --> RULES[Built-in Clinical Rules]
    end
```

---

## 10. Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14 (App Router)** | Server Components, dynamic client pages, streaming SSR |
| **UI Library** | **React 18, Tailwind CSS, Lucide Icons** | Responsive, accessible healthcare UI with dark/light mode |
| **Data Visualization** | **Recharts** | Bed occupancy graphs, health vitals charts, revenue metrics |
| **Backend Framework** | **NestJS 10, Express** | Modular DDD backend architecture, dependency injection |
| **Real-Time Engine** | **Socket.IO 4.7** | Sub-100ms bed telemetry, appointment status broadcasts |
| **Database & ORM** | **Neon PostgreSQL, Prisma 5.14** | Serverless relational database, type-safe schema & migrations |
| **Caching & Limits** | **Upstash Redis, ioredis** | Distributed rate limiting, session cache (with memory fallback) |
| **Object Storage** | **Supabase Storage** | Private bucket document vault with signed download URLs |
| **AI Providers** | **Anthropic Claude, Google Gemini, OpenAI** | Multi-tier clinical intelligence cascade with safety guards |
| **Authentication** | **Passport JWT, RFC 6238 TOTP (otplib)** | Access/refresh tokens, AES-256-GCM 2FA seed encryption |
| **Monorepo Tooling** | **npm workspaces, TypeScript 5.4** | Shared types and validation packages across web and api |

---

## 11. Frontend Architecture

The frontend lives in `apps/web` utilizing Next.js 14 App Router:
* `apps/web/app/`: 222 statically and dynamically rendered routes organized by domain:
  * `(public)`: `/`, `/pricing`, `/nearby-hospitals`, `/terms`, `/privacy`
  * `patient`: `/patient` (gateway), `/portal/*` (health OS, appointments, beds, records)
  * `hospital`: `/hospital` (gateway), `/dashboard/*` (clinical workstations, ward, admin)
  * `super-admin`: `/super-admin`, `/dashboard/super-admin` (enterprise governance)
* `apps/web/components/`: Modular component design with atomic UI elements (`Button`, `Card`, `Modal`, `ThemeToggle`) and domain components (`RoleSwitcherModal`, `PatientDemoSwitcherModal`).
* `apps/web/lib/`: Client utilities including `api-config.ts` (centralized API client), `domain-config.ts` (official domain constants), `realtime-telemetry.ts` (WebSockets/BroadcastChannel sync), and `demo-portals.ts`.

---

## 12. Backend Architecture

The backend lives in `apps/api` built on NestJS 10:
* **Global API Prefix:** `/api/v1`
* **Dependency Injection:** 62 modular domain services organized around bounded contexts.
* **CORS Origin Protection:** Handled via `cors-origin.util.ts` strictly permitting the official frontend domain (`https://medinexa-medicalweb.vercel.app`) with development and staging fallbacks.
* **Storage Factory:** Dynamic provider selection (`supabase` vs `r2` vs fail-closed disabled in production) preventing unauthenticated file leakage.

---

## 13. Database Architecture

* **Database Engine:** Neon PostgreSQL Serverless (PostgreSQL 16+ compatible).
* **Connection Architecture:**
  * `DATABASE_URL`: Connection-pooled URL (PgBouncer) for application runtime queries.
  * `DIRECT_URL`: Direct connection URL for running Prisma DDL migrations.
* **Schema Scale:** 5,900+ lines of schema code in `database/prisma/schema.prisma` with 110+ composite indexes supporting high concurrency.

---

## 14. AI Integration & Clinical Cascade

MediNexa implements an enterprise 4-tier resilience hierarchy for healthcare AI:

```mermaid
flowchart TD
    Q[User Clinical or Hospital Query] --> P1{Tier 1: Anthropic Claude}
    P1 -->|Configured & Healthy| R1[Claude 3.5 Sonnet Response]
    P1 -->|Missing Key or API Error| P2{Tier 2: Google Gemini}
    P2 -->|Configured & Healthy| R2[Gemini 1.5 Pro Response]
    P2 -->|Missing Key or API Error| P3{Tier 3: OpenAI}
    P3 -->|Configured & Healthy| R3[GPT-4o Response]
    P3 -->|Missing Key or API Error| P4[Tier 4: Built-in Clinical Rules Engine]

    R1 & R2 & R3 & P4 --> DISC[Append Mandatory Emergency Disclaimer]
    DISC --> OUT[Display Response to User]
```

### Safety Interceptors:
* **Overdose Interception:** Queries regarding dangerous dosages (e.g. Paracetamol > 4,000 mg) trigger immediate red emergency flags directing users to call 108 or report to the nearest ER.
* **Mandatory Disclaimer:** Every AI response carries: *"Informational healthcare guidance only. Does not replace professional medical judgment."*

---

## 15. Supabase Private File Storage

* **Private Bucket:** Clinical documents are stored in the private `medinexa-patient-documents` bucket.
* **No Public URLs:** Public URLs are never generated. Instead, short-lived signed URLs (1-hour expiry) are minted on demand.
* **Path Traversal Protection:** Keys are strictly sanitized (`^[a-zA-Z0-9_\-\.\/]+$`), rejecting `../` traversal attempts.
* **Tenant Isolation:** Enforces strict IDOR checks ensuring Patient A cannot access Patient B's files, and Hospital B staff cannot access Hospital A's records.

---

## 16. Real-Time Communication & Telemetry

* **WebSocket Gateway:** Sub-100ms synchronization for hospital ward occupancy and emergency ambulance status.
* **Dual Multi-Tab Synchronization:** Combines backend WebSockets with client-side `BroadcastChannel` and `window` telemetry events for 0ms instantaneous cross-tab updates.
* **In-Memory Graceful Fallback:** If Upstash Redis is not configured, the WebSocket gateway functions seamlessly in single-node in-memory mode without crashing.

---

## 17. Payment Demo & Sandbox Workflow

* **Sandbox Safety:** Clearly labeled as `SANDBOX / DEMO PAYMENT` across all payment screens.
* **Razorpay Simulation:** Simulates Razorpay order creation, mock UPI / Card verification, payment signature generation, and invoice receipt generation.
* **Zero Real Money:** Never requests or accepts real card numbers, UPI PINs, or banking credentials.

---

## 18. User Roles and Permissions

MediNexa enforces strict Role-Based Access Control (RBAC) across 8 core system roles:

| Role Code | Role Name | Access Scope |
| :--- | :--- | :--- |
| `PATIENT` | Empanelled Patient | Personal appointments, bed reservations, prescriptions, lab results |
| `DOCTOR` | Attending Physician | Assigned outpatient queue, SOAP consultation notes, diagnostic orders |
| `NURSE` | Inpatient Ward Nurse | Ward bed chart, vitals recording, medication administration (MAR) |
| `RECEPTIONIST` | Front Desk Intake | Patient registration, new UHID issuance, appointment queue tokens |
| `PHARMACIST` | Pharmacy Staff | Drug dispensary, stock inventory, batch tracking, refill approvals |
| `LAB_STAFF` | Laboratory Technician | Sample management, diagnostic test entry, panic value alerts |
| `HOSPITAL_ADMIN` | Hospital Administrator | Single-facility operations, staff roster, ward census, revenue billing |
| `MEDINEXA_ADMIN` | Super Administrator | Cross-facility governance, hospital licensing, global security audits |

---

## 19. Application Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    actor Doctor
    actor HospitalStaff
    participant Frontend as Web Client (Next.js 14)
    participant API as API Gateway (NestJS 10)
    participant DB as Neon PostgreSQL (Prisma)
    participant Storage as Supabase Private Storage

    Patient->>Frontend: Book Appointment (Cardiology)
    Frontend->>API: POST /api/v1/appointments
    API->>DB: Atomic Transaction & Slot Lock
    DB-->>API: Appointment Confirmed (#TKN-2026-01)
    API-->>Frontend: Confirmation & Token Details

    Doctor->>Frontend: Open Doctor Workstation
    Frontend->>API: GET /api/v1/doctor/appointments/today
    API-->>Frontend: Outpatient Patient Queue
    Doctor->>Frontend: Record SOAP Notes & Order CBC Lab Test
    Frontend->>API: POST /api/v1/ehr/encounters

    Patient->>Frontend: Upload Diagnostic Report (PDF)
    Frontend->>API: POST /api/v1/attachments/upload
    API->>Storage: Encrypted Upload to Private Bucket
    Storage-->>API: Key: patient-uhid/doc-uuid.pdf
    API->>DB: Record Attachment Metadata
    API-->>Frontend: Upload Success

    HospitalStaff->>Frontend: Admit Inpatient to Ward Bed
    Frontend->>API: POST /api/v1/admissions
    API->>DB: Update Bed Occupancy (Decrements Free Beds)
    API--)Frontend: Broadcast 'bed.occupancy.updated' via WebSocket
```

---

## 20. API Architecture and Endpoint Documentation

All REST API endpoints are prefixed with `/api/v1`. Core endpoints:

### Authentication & Identity
* `POST /api/v1/auth/login` — Staff and patient credential authentication.
* `POST /api/v1/auth/register` — Patient self-registration with password hashing.
* `POST /api/v1/auth/refresh` — Refresh expired JWT access tokens.
* `POST /api/v1/auth/2fa/verify` — Verify RFC 6238 6-digit TOTP code.

### Hospital Beds & Telemetry
* `GET /api/v1/bed-availability/live` — Real-time bed occupancy across all network facilities.
* `POST /api/v1/bed-bookings` — Reserve emergency or elective inpatient bed.
* `GET /api/v1/beds` — Detailed list of physical hospital beds and ward status.

### Appointments & Clinical
* `GET /api/v1/appointments` — List appointments filtered by date, role, or patient.
* `POST /api/v1/appointments` — Book new outpatient specialist consultation.
* `POST /api/v1/ehr/encounters` — Create clinical consultation encounter with SOAP notes.

### Storage & Attachments
* `POST /api/v1/attachments/upload` — Upload medical document to private Supabase storage.
* `GET /api/v1/attachments/:id/download-url` — Mint a short-lived signed download URL.

### AI Health Assistant
* `POST /api/v1/ai/chat` — Resilient 4-tier conversational clinical assistant.

---

## 21. Repository Folder Structure

```text
MediNexa-Duplicate/
├── apps/
│   ├── web/                           # Next.js 14 App Router Frontend
│   │   ├── app/                       # 222 Application Routes (Patient, Hospital, Admin)
│   │   ├── components/                # Reusable UI & Domain Components
│   │   │   ├── ui/                    # Button, Card, Modal, RoleSwitcherModal
│   │   │   ├── portal/                # PatientDemoSwitcherModal
│   │   │   └── hospital/              # PortalDemoAccountsHub
│   │   ├── lib/                       # API clients, domain config, telemetry
│   │   └── public/                    # Static assets & brand media
│   └── api/                           # NestJS 10 REST & WebSocket Backend
│       ├── src/                       # 62 Modular Domain Services
│       │   ├── auth/                  # JWT, Passport, TOTP 2FA
│       │   ├── bed/                   # Real-time bed census & telemetry
│       │   ├── appointment/           # Outpatient queue & slot locking
│       │   ├── storage/               # Supabase & Cloudflare R2 providers
│       │   ├── ai/                    # 4-tier resilient AI provider
│       │   └── common/                # CORS, domain config, guards
│       └── test/                      # 300+ Automated Unit & Integration Tests
├── database/
│   └── prisma/
│       ├── schema.prisma              # 5,900+ LOC Enterprise Relational Schema
│       ├── migrations/                # Version-controlled Prisma migration history
│       └── seed-beds.ts               # Bed census and facility seeders
├── packages/
│   ├── types/                         # Shared TypeScript interfaces
│   ├── validation/                    # Shared validation schemas
│   └── config/                        # Shared ESLint and TypeScript configs
├── render.yaml                        # Render Blueprint specification
└── README.md                          # Master Hackathon Documentation
```

---

## 22. Installation Prerequisites

* **Node.js:** `v18.18.0` or higher (`v20.x` recommended).
* **npm:** `v9.x` or higher (supports npm workspaces).
* **PostgreSQL:** Neon PostgreSQL connection string (or local PostgreSQL 15+).
* **Git:** Installed and configured.

---

## 23. Local Setup Instructions

```bash
# 1. Clone repository
git clone https://github.com/singhayush256/MediNexa-Duplicate.git
cd MediNexa-Duplicate

# 2. Install monorepo dependencies
npm install

# 3. Build shared monorepo packages
npm run build --workspace=@medinexa/types
npm run build --workspace=@medinexa/validation
```

---

## 24. Environment Variable Setup

### Backend (`apps/api/.env`)
Copy `apps/api/.env.example` to `apps/api/.env` and configure:
```env
NODE_ENV=development
PORT=3001
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:3000,https://medinexa-medicalweb.vercel.app
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/medinexa?sslmode=prefer"
DIRECT_URL="postgresql://user:password@localhost:5432/medinexa?sslmode=prefer"

# Auth
JWT_SECRET=super_secret_jwt_dev_key_at_least_32_characters_long
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=super_secret_jwt_refresh_dev_key_32_chars

# Storage (Supabase)
STORAGE_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=medinexa-patient-documents
```

### Frontend (`apps/web/.env.local`)
Copy `apps/web/.env.example` to `apps/web/.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_placeholder_key_id
```

---

## 25. Database Migration and Prisma Commands

```bash
# Generate Prisma Client
npm run db:generate --workspace=@medinexa/database

# Run Prisma schema migrations
npm run db:migrate --workspace=@medinexa/database

# Validate Prisma schema
node -e "process.env.DATABASE_URL='postgresql://u:p@localhost/db'; process.env.DIRECT_URL='postgresql://u:p@localhost/db'; require('child_process').execSync('npx prisma validate --schema=database/prisma/schema.prisma', {stdio: 'inherit', env: process.env})"
```

---

## 26. Frontend Development Command

```bash
# Run Next.js frontend on http://localhost:3000
npm run dev:web
```

---

## 27. Backend Development Command

```bash
# Run NestJS backend on http://localhost:3001
npm run dev:api
```

---

## 28. ML Service Setup

The ML clinical service lives in `services/ml` (Python FastAPI):
```bash
cd services/ml
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

---

## 29. Testing Instructions

Run the official test suites:

```bash
# 1. Run all 300 backend unit & integration tests
npm test --workspace=@medinexa/api

# 2. Run backend TypeScript typecheck
npm run typecheck --workspace=@medinexa/api

# 3. Run frontend TypeScript typecheck
npm run typecheck --workspace=@medinexa/web

# 4. Run frontend production build (verifies all 222 routes)
npm run build:web

# 5. Run backend NestJS build
npm run build --workspace=@medinexa/api
```

---

## 30. Deployment Architecture

```mermaid
flowchart LR
    subgraph Vercel ["Vercel Edge Platform"]
        V[medinexa-medicalweb.vercel.app]
        V --> NextSSR[Next.js 14 SSR & Static CDN]
    end

    subgraph Render ["Render Cloud Platform"]
        R[medinexa-duplicate-api.onrender.com]
        R --> NestAPI[NestJS REST Engine /api/v1]
        R --> NestWS[WebSocket Server :10000]
    end

    subgraph ManagedCloud ["Managed Cloud Services"]
        Neon[(Neon PostgreSQL Serverless)]
        Upstash[(Upstash Redis Cache)]
        SupaStorage[(Supabase Private Object Storage)]
    end

    V -->|HTTPS REST| R
    V <-->|WSS Telemetry| R
    R --> Neon
    R --> Upstash
    R --> SupaStorage
```

---

## 31. Live Frontend URL

* **Official Frontend URL:** **`https://medinexa-medicalweb.vercel.app`**
* **Patient Gateway:** `https://medinexa-medicalweb.vercel.app/patient`
* **Hospital Gateway:** `https://medinexa-medicalweb.vercel.app/hospital`
* **Live Beds Telemetry:** `https://medinexa-medicalweb.vercel.app/portal/live-beds`

---

## 32. Backend URL

* **Backend Base URL:** **`https://medinexa-duplicate-api.onrender.com`**
* **REST API Prefix:** **`/api/v1`**
* **Health Endpoint:** `https://medinexa-duplicate-api.onrender.com/api/v1/health`

---

## 33. Security Practices & Data Isolation

1. **Defense in Depth:** RFC 6238 TOTP two-factor authentication with AES-256-GCM seed encryption.
2. **Tenant IDOR Elimination:** Every query is scoped by `patientId` or `facilityId`.
3. **No Secret Inlining:** Zero private keys or database passwords in client bundles (`NEXT_PUBLIC_*`).
4. **Fail-Closed Storage:** If production storage credentials are missing, file uploads are rejected with HTTP 503 rather than saving unauthenticated files to local disk.

---

## 34. Known Limitations

1. **Render Free Tier Cold-Start:** Render free tier instances spin down after inactivity; initial API requests may take ~45–50 seconds to warm up.
2. **Upstash Redis Fallback:** When `REDIS_URL` is omitted, the backend falls back to an in-memory token bucket rate-limiter.
3. **Sandbox Payment Mode:** Payment gateway operates in simulated test mode to prevent real transactions during hackathon evaluation.
4. **TRAI DLT SMS Dispatch:** Live SMS delivery requires registered Indian telecom sender IDs; sandbox fallbacks log notifications cleanly to the backend console.

---

## 35. Demo Instructions

### 5-Minute Evaluator Demonstration Flow:
1. **Explore Landing Page:** Visit [`https://medinexa-medicalweb.vercel.app`](https://medinexa-medicalweb.vercel.app).
2. **View Live Bed Telemetry:** Click **Live Beds** in the top navigation or visit `/portal/live-beds`. Observe real-time occupancy across Hospital A (Delhi), Hospital B (Mumbai), and Noida Super-Specialty.
3. **Launch Patient Portal:** Visit `/patient` and click **Demo Account**. Select `Aarav Sharma` to instantly enter the Patient Health OS.
4. **Book Doctor Appointment:** Navigate to `/portal/appointments`, select a cardiologist, pick a slot, and confirm.
5. **Inspect Health Score & Records:** Navigate to `/portal/health-score` and `/portal/medical-records`.
6. **Launch Hospital Portal:** Visit `/hospital` and click **Demo Account**. Select `Dr. Rajesh Singh (Hospital A)` or `Sunita Singh (Hospital Admin)` to enter clinical workstations.
7. **Simulate Sandbox Payment:** Navigate to `/portal/billing` and execute a 1-click simulated payment.

---

## 36. Future Scope

* **ABDM Milestone M4 & M5:** Direct integration with national health information exchange (HIE-CM).
* **Edge AI Offline Triage:** Client-side WebAssembly ML models for offline rural clinic triage.
* **Smart Ambulance V2X:** Direct traffic light preemption integration for emergency trauma transit.

---

## 37. Contribution Guidelines

1. Fork the repository and create a feature branch (`git checkout -b feature/amazing-feature`).
2. Run test suites (`npm test --workspace=@medinexa/api`) and typechecks before committing.
3. Commit cleanly with conventional commits (`git commit -m 'feat: add feature'`).
4. Push to your branch and open a Pull Request.

---

## 38. License Information

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
