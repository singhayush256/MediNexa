# 🏥 MediNexa — Connected Healthcare Enterprise HMS

<div align="center">

![MediNexa Banner](https://img.shields.io/badge/MediNexa-Enterprise%20HMS-0070f3?style=for-the-badge&logo=medinexa&logoColor=white)

**Hospital-grade, multi-tenant Hospital Management System (HMS) and Clinical Operating System engineered for Indian tertiary healthcare networks.**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS 10](https://img.shields.io/badge/NestJS-10.3-ea2845?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![PostgreSQL 18](https://img.shields.io/badge/PostgreSQL-18.0-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.14-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.4%20Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 3](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![NABH & NABL](https://img.shields.io/badge/Compliance-NABH%20%7C%20NABL%20%7C%20DISHA-success?style=flat-square)](https://nabh.co/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Features](#-core-features) • [Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Installation](#-installation-guide) • [Demo Accounts](#-pre-configured-demo-accounts) • [Documentation](#-compliance--regulatory-standards)

</div>

---

## 🌟 Executive Overview

**MediNexa** transforms hospital operations by replacing fragmented, legacy software with a unified, high-performance digital core. Built specifically for the Indian healthcare ecosystem, MediNexa addresses the operational realities of multispecialty and tertiary care facilities—from OPD token queues and inpatient bed census to NABL diagnostic panels, statutory 12% GST pharmacy billing, and TPA cashless insurance pre-authorizations.

- **Authentic Indian Demographic Data:** Pre-seeded with 100 Indian patients, 20 credentialed doctors (with Medical Council of India [MCI] registration numbers), 50 nurses, and complete staffing across 3 premier hospital networks (New Delhi, Mumbai, Bengaluru).
- **Statutory Healthcare Compliance:** Aligned with NABH (5th Edition), NABL (ISO 15189), DISHA (Digital Information Security in Healthcare Act), and the Central Goods and Services Tax (CGST) Act 2017.
- **Enterprise-Grade Quality:** Tested with automated end-to-end regression suites, production health probes, strict RBAC across 8 discrete roles, and high-resolution vector PDF generation.

---

## 📸 Product Showcase & Workstations

Explore high-resolution screenshots of the active platform with authentic Indian clinical data:

| 1. Modern Healthcare Landing | 2. Executive Command Center |
| :---: | :---: |
| [![Homepage](public/showcase/01-homepage.jpg)](public/showcase/01-homepage.jpg) | [![Command Center](public/showcase/02-dashboard-command-center.jpg)](public/showcase/02-dashboard-command-center.jpg) |
| **3. Patient 24/7 Portal & Vitals** | **4. Doctor Clinical Workstation & SOAP** |
| [![Patient Portal](public/showcase/03-patient-portal-workflow.jpg)](public/showcase/03-patient-portal-workflow.jpg) | [![Doctor Workstation](public/showcase/04-doctor-clinical-workstation.jpg)](public/showcase/04-doctor-clinical-workstation.jpg) |
| **5. Hospital Revenue & 12% GST Invoicing** | **6. TPA Cashless Insurance Claims** |
| [![GST Billing](public/showcase/05-billing-gst-invoice.jpg)](public/showcase/05-billing-gst-invoice.jpg) | [![TPA Insurance](public/showcase/06-tpa-insurance-claims.jpg)](public/showcase/06-tpa-insurance-claims.jpg) |
| **7. MediNexa Clinical AI Copilot** | **Interactive 7-Stage Walkthrough Tour** |
| [![Clinical AI](public/showcase/07-ai-clinical-assistant.jpg)](public/showcase/07-ai-clinical-assistant.jpg) | *Explore live with pre-seeded demo roles via [`/demo`](http://localhost:3000/demo)* |

---

## 🚀 Core Features

### 1. Outpatient Department (OPD) & Appointments
- **Specialty Directory:** Real-time doctor discovery across 8 clinical specialties (Cardiology, Neurology, Orthopedics, Dermatology, Pediatrics, ENT, Gynecology, General Medicine).
- **Slot Scheduling:** 30-minute consultation slots with database-level transactional concurrency protection to eliminate double-booking.
- **Doctor Consultation Queue:** Real-time patient intake, vitals entry, clinical SOAP notes, and electronic prescriptions.

### 2. Inpatient Department (IPD) & Bed Census
- **Ward & Bed Engine:** Live visual census across General Wards, Semi-Private, Deluxe Rooms, and Critical Care ICUs (`BED-GEN-1` to `BED-ICU-2`).
- **Admission Workflows:** Emergency and elective admissions with attending consultant assignment, daily rounds, and nurse MAR tracking.
- **Clinical Discharge Summary:** Automated course-in-hospital summaries, discharge vitals, discharge medications, follow-up advice, and **1-click NABH vector PDF export**.

### 3. Diagnostic Laboratory Management (Pathology)
- **Statutory Diagnostic Panels:** Full support for Complete Blood Count (CBC with 6 parameters), Fasting & Post-Prandial Blood Sugar, Liver Function Test (LFT), Kidney Function Test (KFT with Electrolytes), Thyroid Profile (T3/T4/TSH), and Urine Routine.
- **Reference Intervals:** Automated flagging of abnormal values against age/gender biological reference ranges.
- **NABL-Grade PDF Reports:** High-resolution digital pathology reports featuring hospital letterhead, QR authentication, and authorized pathologist digital signatures.

### 4. Pharmacy Management & Inventory (PMS)
- **Formulary Stocking:** Pre-configured with essential Indian pharmaceutical brands (Dolo 650, Pan 40, Augmentin 625 Duo, Glycomet 500, Telma 40, Atorva 20, etc.).
- **FEFO/FIFO Batch Tracking:** Batch number tracking, expiry date warning indicators, and automated stock reorder triggers.
- **Dispensing & Purchase Orders:** Electronic prescription fulfillment, stock decrement, and supplier procurement history.

### 5. Revenue Cycle Management (RCM) & GST Billing
- **Statutory Medical Invoicing:** OPD consultations (SAC 999311), IPD hospital stay (SAC 999312), and Diagnostic Labs (SAC 999316) under GST exemptions.
- **12% Medicine Tax:** Outpatient pharmacy dispensing calculates statutory 12% GST (CGST 6% + SGST 6% under HSN 3004).
- **TPA Health Insurance:** Cashless and reimbursement claim processing for Star Health, HDFC ERGO, ICICI Lombard, Care Health, and Niva Bupa across full lifecycle (`DRAFT` → `CLAIM_SUBMITTED` → `APPROVED` → `SETTLED`).
- **Digital Payments:** Payment collection and ledger reconciliation for UPI, Credit/Debit Cards, Cash, and NEFT/RTGS.

### 6. MediNexa AI Healthcare Assistant
- **Resilient AI Gateway:** Sub-100ms response time with localized clinical rule algorithms backing generative LLM providers.
- **5 Healthcare Use Cases:**
  1. *Appointment Guidance & Rescheduling*
  2. *Department & Specialist Recommendations*
  3. *Medication Dosages, Indications & Food Timing*
  4. *Diagnostic Lab Report Parameter Interpretation*
  5. *Hospital Facility Wayfinding & Emergency Department Navigation*
- **Zero Secret Exposure:** Strict server-side secret isolation guarantees client bundles contain 0 private API keys.

### 7. Statutory Audit Trail & Enterprise Security
- **DISHA/HIPAA Access Ledger:** Immutable tracking of user identity, role, timestamp (IST), target module, action, IP address, and payload.
- **Compliance Console:** Dedicated interface at `/dashboard/admin/audit-logs` featuring global search, action/role filter chips, JSON inspection modal, and 1-click CSV/JSON export.
- **Strict Role-Based Access Control (RBAC):** Navigation links and REST controllers strictly isolated for 8 discrete roles with HTTP 403 enforcement.

---

## 🏛️ System Architecture

```
                                  [ Patients & Clinicians ]
                                             │
                                    ( HTTPS / TLS 1.3 )
                                             │
                              [ Cloudflare Edge / Reverse Proxy ]
                                    /                 \
                                   /                   \
                   [ Next.js 14 Web Workstation ]    [ NestJS 10 API Gateway ]
                     • App Router SSR / Static         • RESTful Endpoints (:3001)
                     • Tailwind CSS & Lucide UI        • Strict DTO ValidationPipe
                     • jsPDF Vector Report Engine      • WebSocket Gateway (:3001)
                     • Client Token Persistence        • Resilient AI Fallback Gateway
                                   \                   /
                                    \                 /
                                [ Private Network / VPC ]
                                             │
                                     [ Prisma ORM 5 ]
                                             │
                            [ PostgreSQL 18 Relational DB ]
                               • 110+ Composite Indexes
                               • Connection Pool (25 max)
                               • Multi-Tenant Partitioning
```

---

## 💻 Tech Stack

| Layer | Technologies | Key Libraries |
| :--- | :--- | :--- |
| **Frontend Workstation** | Next.js 14 (App Router), React 18, TypeScript 5 | Tailwind CSS, Lucide Icons, jsPDF, date-fns |
| **Backend API Gateway** | NestJS 10, Express, Node.js 20+ | Passport JWT, bcryptjs, class-validator, class-transformer |
| **Database & ORM** | PostgreSQL 18, Prisma ORM 5 | Connection pooling, composite B-tree indexing |
| **Real-Time & Telemedicine** | WebSockets (Socket.io), WebRTC | Peer-to-peer audio/video streaming, live signaling |
| **AI & Clinical Copilot** | Google Gemini, Custom Rule Engine | Resilient multi-tier healthcare assistant gateway |
| **DevOps & Quality** | Docker, Monorepo Workspaces | ESLint, TypeScript Strict, Automated E2E Runner |

---

## 📂 Monorepo Structure

```
medinexa/
├── apps/
│   ├── api/                           # NestJS 10 REST & WebSocket API Gateway
│   │   ├── src/
│   │   │   ├── admission/             # Inpatient admissions & bed management
│   │   │   ├── appointment/           # OPD scheduling & concurrency locking
│   │   │   ├── audit/                 # DISHA/HIPAA immutable audit ledger
│   │   │   ├── auth/                  # JWT auth, bcrypt, password reset
│   │   │   ├── billing/               # OPD/IPD invoicing & TPA insurance claims
│   │   │   ├── health/                # Liveness & readiness probes
│   │   │   ├── laboratory/            # Diagnostic orders & pathology verification
│   │   │   ├── pharmacy/              # Formulary inventory & batch tracking
│   │   │   └── main.ts                # App boot, CORS, HSTS security headers
│   └── web/                           # Next.js 14 App Router Clinical Frontend
│       ├── app/
│       │   ├── auth/                  # Registration, Login, Password Recovery
│       │   ├── dashboard/             # Staff Workstations (OPD, IPD, Lab, Rx, Billing)
│       │   │   └── admin/audit-logs/  # Compliance Audit Trail Console
│       │   └── portal/                # Patient Self-Service Health Portal
│       └── components/                # UI design system & DischargeSummaryModal
├── database/
│   ├── prisma/
│   │   └── schema.prisma              # PostgreSQL relational data models (110+ indexes)
│   └── seed/
│       └── seed.ts                    # Authentic Indian healthcare database seeder
├── packages/
│   ├── types/                         # Shared TypeScript interfaces & enums
│   └── validation/                    # Shared validation schemas & RBAC matrices
├── scratch/                           # Automated E2E verification test suites
├── DEPLOYMENT_READINESS_REPORT.md      # Production deployment audit & certification
├── MEDINEXA_PRODUCTION_READINESS_REPORT.md # Hospital operational readiness report
├── QA_AUDIT_REPORT.md                 # Platform-wide QA execution audit
└── package.json                       # npm workspaces root configuration
```

---

## ⚡ Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ LTS recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v15 or higher running locally or in Docker

### Step 1: Clone Repository
```bash
git clone https://github.com/singhayush256/MediNexa.git
cd MediNexa
```

### Step 2: Install Monorepo Dependencies
```bash
npm install
```

### Step 3: Environment Setup
Copy the environment template and configure your local settings:
```bash
cp .env.example .env
```
*(The default `.env.example` is pre-configured for local development on Port 3001 with PostgreSQL on Port 5433).*

### Step 4: Database Migration & Seeding
Push the Prisma schema and seed the comprehensive Indian healthcare dataset (100 patients, 20 doctors, 50 nurses, etc.):
```bash
# Push database schema
npx prisma db push --schema=database/prisma/schema.prisma

# Seed complete Indian healthcare dataset
npm run db:seed --workspace=@medinexa/database
```

### Step 5: Start Development Servers
```bash
# Terminal 1: Launch NestJS API Gateway (Port 3001)
npm run dev --workspace=@medinexa/api

# Terminal 2: Launch Next.js Web Frontend (Port 3000)
npm run dev --workspace=@medinexa/web
```

- **Clinical Workstation Web App:** `http://localhost:3000`
- **REST API & Swagger Gateway:** `http://localhost:3001/api/v1`
- **API Health Liveness Probe:** `http://localhost:3001/api/v1/health`
- **API Database Readiness Probe:** `http://localhost:3001/api/v1/health/ready`

---

## 🔑 Pre-Configured Demo Accounts

All demo accounts share the standard password: **`Password123!`**

| Role | Email Address | Assigned Workstation / Dashboard |
| :--- | :--- | :--- |
| **Super Admin** | `admin@medinexa.in` | Global Platform & Network Management |
| **Hospital Admin** | `admin.delhi@medinexa.in` | Executive Command Center & Audit Trail |
| **Chief Cardiologist** | `dr.deshmukh@medinexa.in` | OPD Consultation Queue & Prescriptions |
| **Head Inpatient Nurse** | `nurse.01@medinexa.in` | Inpatient Wards, Bed Census & Vitals MAR |
| **Front Desk Receptionist** | `receptionist.01@medinexa.in`| Patient Intake, Registration & Appointments |
| **Pathologist / Lab Tech** | `lab.01@medinexa.in` | Diagnostic Test Queue & Lab Reports |
| **Chief Pharmacist** | `pharmacy.01@medinexa.in` | Formulary Inventory, Batches & Dispensing |
| **Primary Patient** | `patient@medinexa.in` | Citizen Self-Service Patient Portal |

---

## 🧪 Automated Testing & Verification

Execute the automated test suites to verify platform integrity:

```bash
# 1. Complete 10-Stage Hospital Journey E2E
node scratch/test_hospital_journey_e2e.js

# 2. Hospital Billing & 12% GST Tax Invoicing
node scratch/test_hospital_billing_e2e.js

# 3. Pharmacy Inventory, Batches & FEFO Dispensing
node scratch/test_pharmacy_workflow_e2e.js

# 4. Clinical AI Assistant & 5 Healthcare Use Cases
node scratch/test_medinexa_ai_e2e.js

# 5. All 8 Roles Authentication & Session Audit
node scratch/test_all_roles_end_to_end.js

# 6. Deep Relational Database Integrity Check
node scratch/deep_route_audit.js

# 7. Production Web Build Compilation
npm run build --workspace=@medinexa/web
```

---

## 📜 Compliance & Regulatory Standards

- **NABH (National Accreditation Board for Hospitals):** Aligned with 5th Edition standards for clinical documentation, patient safety, infection control, and discharge summaries.
- **NABL (ISO 15189:2022):** Pathology reporting adheres to standard diagnostic reference intervals and authorized pathologist sign-offs.
- **DISHA (Digital Information Security in Healthcare Act):** Comprehensive patient data privacy, encrypted storage, and immutable electronic audit logging.
- **CGST Act 2017 (Section 31):** Statutory tax invoicing with explicit SAC 999311/12/16 healthcare exemptions and HSN 3004 12% GST computation.

---

## 📄 License & Intellectual Property

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete details.

---

<div align="center">
  <sub>Built for Indian Hospitals • Designed for Enterprise Healthcare • Powered by Modern Web Technologies</sub>
</div>
