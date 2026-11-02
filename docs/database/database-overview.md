# MediNexa Database Architecture Overview

## Database Engine & Migration Tool

- **Engine**: PostgreSQL 18
- **ORM / Migration Tool**: Prisma ORM 5+
- **Database Name**: `medinexa`

---

## Day 1 Foundation Models

For Day 1, only the core identity, access control, and organization models are created:

### 1. `Organization`
Represents health networks, hospitals, clinics, pathology labs, and pharmacies.
- `id`: UUID (Primary Key)
- `name`: String
- `code`: String (Unique, e.g. `MEDINEXA-HQ`)
- `type`: String (`HOSPITAL`, `CLINIC`, `LAB`, `PHARMACY`)
- `createdAt`, `updatedAt`: Timestamps

### 2. `Role`
Role-Based Access Control (RBAC) definition.
- `id`: UUID (Primary Key)
- `name`: Display Name
- `code`: Unique Role Code (`SYSTEM_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `PATIENT`, `PHARMACIST`, `LAB_TECH`)
- `description`: Optional text

### 3. `User`
Primary user identity model connecting platform users to roles and organizations.
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `passwordHash`: String (Bcrypt / Argon2 hash)
- `firstName`, `lastName`: String
- `phone`: String (Optional)
- `roleId`: Foreign Key -> `Role.id`
- `organizationId`: Foreign Key -> `Organization.id`
- `isActive`: Boolean flag

---

## Strategy for Future Database Expansion

As new domain modules are introduced, the database schema will be extended modularly:
1. **Patient Management**: `PatientProfile`, `MedicalHistory`, `EmergencyContact` linked to `User`.
2. **Clinical & Appointments**: `DoctorProfile`, `Specialty`, `Appointment`, `ConsultationNote`.
3. **Medical Records & Prescriptions**: `MedicalRecord`, `Prescription`, `PrescriptionItem`.
4. **Bed & Admission Management**: `Ward`, `Bed`, `Admission`, `Transfer`, `DischargeSummary`.
5. **Lab & Pharmacy**: `LabTestOrder`, `LabResult`, `PharmacyInventory`, `MedicationDispense`.
6. **Audit & Compliance**: `AuditLog`, `PatientConsent`.

---

## Migration & Seeding Commands

- Generate Prisma Client: `npm run db:generate`
- Run Migration: `npm run db:migrate`
- Run Seed: `npm run db:seed`
- Launch Prisma Studio GUI: `npm run db:studio`
