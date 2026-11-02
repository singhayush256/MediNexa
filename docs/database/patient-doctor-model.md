# MediNexa Day 3 Database ERD & Relationship Documentation

## Overview

The Day 3 database extension introduces multi-hospital organizations, clinical departments, patient demographic profiles, emergency contact records, doctor professional profiles, and medical specialties.

---

## Entity Relationship Diagram (Conceptual)

```
Organization (1) ───< Facility (N) ───< Department (N) ───< DoctorProfile (N)
                                                                 │
                                                                 ├──> Specialty (1)
                                                                 │
User (1) ────────────────────────────────────────────────────────┴──> DoctorProfile (1)
  │
  └───────> PatientProfile (1) ───< EmergencyContact (N)
```

---

## Constraints & Referential Integrity Rules

1. **`User` -> `PatientProfile`**: `1-to-1` optional relation. `userId` is `@unique`. `onDelete: Cascade`.
2. **`User` -> `DoctorProfile`**: `1-to-1` optional relation. `userId` is `@unique`. `onDelete: Cascade`.
3. **`PatientProfile` -> `EmergencyContact`**: `1-to-Many` relation. `onDelete: Cascade`.
4. **`Facility` -> `Department`**: `1-to-Many` relation. `@@unique([facilityId, code])`. `onDelete: Restrict`.
5. **`DoctorProfile` -> `Facility` & `Department`**: `DoctorProfile` is scoped to a specific `facilityId` and `departmentId`. `onDelete: Restrict`.
6. **`DoctorProfile.licenseNumber`**: `@unique` string index to prevent license duplication across providers.
