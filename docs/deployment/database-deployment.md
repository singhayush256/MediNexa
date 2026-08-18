# MediNexa Database Deployment & Migration Guide

## Executive Overview
This document specifies the PostgreSQL initialization, schema migration, indexing strategy, and verification procedures required for deploying MediNexa database layers into staging and production environments.

---

## 1. Database Specifications & Prerequisites
- **Database Engine**: PostgreSQL v15+ (PostgreSQL 18 recommended)
- **Database Name**: `medinexa`
- **Default Port**: `5433` (configurable via `DATABASE_URL`)
- **ORM / Schema Tool**: Prisma Client v5.22.0

---

## 2. PostgreSQL Staging Initialization

### Step 1: Create Database & User Role
Log into your PostgreSQL instance via `psql` or administrative interface:

```sql
CREATE DATABASE medinexa;
CREATE USER medinexa_app WITH ENCRYPTED PASSWORD 'staging_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE medinexa TO medinexa_app;
```

### Step 2: Configure Environment Connection URI
Set the `DATABASE_URL` in your host environment or `.env`:

```bash
DATABASE_URL="postgresql://medinexa_app:staging_secure_password_here@staging-db-host:5433/medinexa?schema=public&sslmode=prefer"
```

---

## 3. Schema Synchronization & Migration Protocol

For staging and production environments, schema changes are deployed non-destructively:

### Schema Validation Check
Before deploying changes, validate the Prisma schema file:
```bash
npx prisma validate --schema=./database/prisma/schema.prisma
```

### Applying Schema Updates (Migration Workflow)
```bash
# Push schema changes to staging database without dropping existing tables
npx prisma db push --schema=./database/prisma/schema.prisma

# Generate updated Prisma Client bindings
npx prisma generate --schema=./database/prisma/schema.prisma
```

---

## 4. Synthetic Demo Data Seeding
To populate a fresh staging environment with safe synthetic demo data across all 9 system roles:

```bash
npx ts-node database/seed/seed.ts
```

---

## 5. High-Frequency Database Indexing Summary

To ensure high performance under load, the database schema includes targeted indexes across high-frequency query paths:

| Model | Indexed Columns | Query Purpose |
| :--- | :--- | :--- |
| `PatientProfile` | `[userId]`, `[mrn]` | Rapid patient lookup by user ID or MRN |
| `DoctorProfile` | `[userId]`, `[facilityId]`, `[licenseNumber]` | Doctor roster & facility filtering |
| `Appointment` | `[doctorId, appointmentDate, startTime]`, `[patientId, status]` | Double-booking protection & patient queue |
| `Bed` | `[facilityId, status]`, `[roomId]` | Live bed capacity searches |
| `Admission` | `[patientId, status]`, `[facilityId, status]` | Active patient admission lookups |
| `Notification` | `[userId, readAt]`, `[userId, createdAt]` | Unread notification badges & patient alerts |
| `MedicationReminder` | `[patientId, status]`, `[prescriptionItemId]` | Scheduled dose tracking & reminder scheduler |

---

## 6. Security & Data Integrity Controls
1. **Cascade & Restrict Rules**: Critical records (e.g. `ClinicalEncounter`, `Prescription`, `PatientProfile`) enforce `onDelete: Restrict` to prevent accidental loss of medical history.
2. **Compound Unique Constraints**: Race conditions and double-bookings are blocked at the database engine level (e.g. `@@unique([doctorId, appointmentDate, startTime])`).
3. **Non-Exposure of Secrets**: Connection strings (`DATABASE_URL`) must never be committed to Git repositories or exposed in API error tracebacks.
