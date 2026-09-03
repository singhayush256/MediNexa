# Changelog

All notable changes to the **MediNexa** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-04

### 🚀 Enterprise Hospital-Grade Commercial Release

This landmark release marks the complete transformation of MediNexa from an architectural monorepo prototype into a **commercial, hospital-grade Hospital Management System (HMS)** engineered for Indian tertiary healthcare networks.

---

### Added

#### Authentic Indian Healthcare Dataset & Database Seeding
- **100 Indian Patients**: Pre-seeded with authentic names, residential addresses across major Indian metropolises, dates of birth, blood groups, and `+91` mobile numbers.
- **20 Specialist Doctors**: Spread across 8 medical specialties with official Medical Council of India (MCI) registration numbers, qualifications, and 7-day OPD consultation schedules.
- **50 Inpatient Nurses**: Full clinical staff across General Wards, Post-Op recovery, and Critical Care ICUs.
- **Support Staff**: 10 Receptionists, 10 Laboratory Technicians, and 10 Pharmacists.
- **3 Hospital Facilities**: Apollo MediNexa (Delhi Mathura Road), Fortis MediNexa (Mumbai Mulund), and Manipal MediNexa (Bengaluru Old Airport Road).

#### Diagnostic Pathology Laboratory Management
- **6 Standard Diagnostic Panels**: Complete Blood Count (CBC with 6 parameters), Fasting & PP Blood Sugar, Comprehensive Liver Function Test (LFT), Kidney Function Test (KFT with Electrolytes), Thyroid Profile (T3/T4/TSH), and Urine Routine & Microscopy.
- **Biological Reference Intervals**: Reference range bounds for men, women, and pediatrics.
- **NABL-Grade Vector PDF Generation**: High-resolution pathology reports with hospital letterhead, QR authentication, and digital signatures via `jsPDF`.

#### Pharmacy Management System (PMS)
- **Formulary Stocking**: Pre-stocked with Indian pharmaceutical staples (Dolo 650, Pan 40, Augmentin 625 Duo, Glycomet 500, Telma 40, Atorva 20).
- **FEFO/FIFO Batch Tracking**: Batch number tracking, expiry date warning badges, and low-stock reorder triggers.
- **Dispensing & Purchase History**: Automated stock decrement on prescription dispensing and supplier purchase order audit trails.

#### Hospital Revenue Cycle Management & Statutory GST Invoicing
- **Statutory Healthcare Codes**: Service Accounting Codes SAC 999311 (OPD), SAC 999312 (IPD), and SAC 999316 (Diagnostics) under GST exemption provisions.
- **Statutory 12% Pharmacy GST**: HSN 3004 calculation breaking down CGST 6% and SGST 6% on medicine invoices.
- **TPA Health Insurance Claims**: Full lifecycle claim management (`DRAFT` → `CLAIM_SUBMITTED` → `APPROVED` → `SETTLED`) supporting Star Health, HDFC ERGO, ICICI Lombard, Care Health, and Niva Bupa.
- **Multi-Method Payments**: Reconciliation for UPI, Credit/Debit Cards, Cash, and NEFT/RTGS.

#### Clinical Discharge Summary & Inpatient Engine
- **Inpatient Bed Engine**: General Ward and Critical Care ICU bed assignments (`BED-GEN-1` through `BED-ICU-2`).
- **Discharge Summary Generator**: Standardized NABH clinical discharge summaries including admission diagnosis, hospital course, discharge vitals, discharge medications, and follow-up advice.
- **1-Click Vector PDF Export**: Integrated into `DischargeSummaryModal.tsx` for immediate printing and patient discharge packet downloads.

#### Enterprise Compliance Audit Trail
- **DISHA/HIPAA Access Ledger**: Immutable electronic record capturing actor, role, IST timestamp, target module, action, IP address, and payload.
- **Audit Console**: `/dashboard/admin/audit-logs` dashboard with global search, action chips, role filters, JSON modal inspection, and CSV/JSON export.

#### Observability & Health Probing
- **Liveness Probe**: `GET /api/v1/health` returning instantaneous HTTP 200 process heartbeat.
- **Readiness Probe**: `GET /api/v1/health/ready` performing live PostgreSQL `SELECT 1` ping and memory reporting.

---

### Changed
- **Registration Flow**: Registration form updated with country code dropdown defaulting to `+91 (India 🇮🇳)`, 10-digit mobile number validation, and role assignment.
- **Navigation Sidebar**: Upgraded `DashboardSidebar.tsx` to dynamically isolate navigation options across 8 discrete roles, eliminating unauthorized link exposure.
- **Next.js Configuration**: Enhanced `next.config.js` with production security headers (HSTS, Anti-Clickjacking, nosniff, Referrer-Policy) and disabled `poweredByHeader`.
- **API Bootstrap**: Hardened `apps/api/src/main.ts` with strict `ValidationPipe`, CORS origin filtering, and Express security headers.

---

### Fixed
- **AI Chat Endpoint (CRIT-01)**: Resolved `Cannot POST /api/v1/ai/chat` via route rewrite middleware and multi-tier resilient fallback handler. Tested 5 distinct clinical use cases with 100% reliability.
- **DTO Aliases (CRIT-02)**: Added `fullName`, `mobileNumber`, and `countryCode` field aliases to `RegisterDto` with normalization in `AuthService`.
- **Missing Navigation Route (MED-01)**: Created `apps/web/app/dashboard/command-center/page.tsx` redirecting to `/dashboard/executive` to eliminate 404 dead ends.
- **SSR Hydration Guard (MIN-01)**: Isolated client-side `jsPDF` imports to prevent SSR hydration mismatches in Next.js Server Components.

---

### Security
- Verified zero exposed API keys or hardcoded production secrets across all git-tracked files.
- Enforced boot-time guard in `JwtStrategy` aborting startup in `NODE_ENV=production` if `JWT_SECRET` is left unset.
- Active user status verification on every authenticated API transaction.
- HSTS enabled with `max-age=31536000; includeSubDomains; preload`.

---

[1.0.0]: https://github.com/singhayush256/MediNexa/releases/tag/v1.0.0
