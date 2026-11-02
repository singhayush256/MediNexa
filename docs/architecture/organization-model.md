# MediNexa Multi-Hospital Organization Architecture

## 1. Relational Hierarchy Overview

MediNexa is designed as a **multi-hospital healthcare enterprise platform**. It does not assume a single hospital database model.

```
MediNexa Network (Enterprise Monolith)
   ↓
Organization (e.g. MediNexa Central Health Network)
   ↓
Facility / Hospital (e.g. Hospital A: MediNexa General, Hospital B: MediNexa Metro)
   ↓
Department (e.g. Cardiology, Neurology, General Medicine, ICU)
   ↓
Doctor / Clinical Staff / Patient Encounters
```

---

## 2. Model Definitions

### 1. Organization
Represents the parent corporate or health system enterprise.
- **Entity**: `Organization`
- **Fields**: `id`, `name`, `code` (unique), `type`, `isActive`, `createdAt`, `updatedAt`

### 2. Facility / Hospital
Represents physical medical facilities, hospitals, or clinics operating under an Organization.
- **Entity**: `Facility`
- **Fields**: `id`, `organizationId` (FK), `name`, `code` (unique), `address`, `city`, `state`, `postalCode`, `phone`, `email`, `status`, `createdAt`, `updatedAt`

### 3. Department
Represents specialized clinical or operational departments within a Facility.
- **Entity**: `Department`
- **Fields**: `id`, `facilityId` (FK), `name`, `code`, `status`, `createdAt`, `updatedAt`
- **Unique Constraint**: `@@unique([facilityId, code])`

---

## 3. Multi-Hospital Data Isolation

- **Facility Scoping**: Doctors and healthcare staff are assigned to a specific `facilityId` and `departmentId`.
- **Operational Boundaries**: Staff at Hospital A are restricted to Hospital A operational data by default. Cross-hospital access will require explicit referral/consent workflows in future phases.
