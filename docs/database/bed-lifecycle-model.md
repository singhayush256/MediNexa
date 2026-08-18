# MediNexa Day 5 Database Bed Lifecycle Model Documentation

## Entity Relationships Overview

```
PatientProfile (1) ───< BedReservation (N) ───> Bed (1)
       │                      │                 │
       │                      v                 │
       └───────────────< BedAssignment (N) ─────┤
                              │                 │
                              v                 │
                       BedStatusHistory (N) ────┘
```

---

## Model Specifications

1. **`BedReservation`**:
   - `bed_id`: FK to `Bed` (`onDelete: Restrict`)
   - `patient_id`: FK to `PatientProfile` (`onDelete: Restrict`)
   - `reserved_by`: FK to `User` (`onDelete: Restrict`)
   - `expires_at`: Expiration timestamp
   - `status`: Enum `ReservationStatus` (`ACTIVE`, `EXPIRED`, `CANCELLED`, `CONVERTED`)

2. **`BedAssignment`**:
   - `bed_id`: FK to `Bed` (`onDelete: Restrict`)
   - `patient_id`: FK to `PatientProfile` (`onDelete: Restrict`)
   - `assigned_by`: FK to `User` (`onDelete: Restrict`)
   - `reservation_id`: FK to `BedReservation` (`onDelete: SetNull`)
   - `status`: Enum `AssignmentStatus` (`ACTIVE`, `RELEASED`)

3. **`BedStatusHistory`**:
   - `bed_id`: FK to `Bed` (`onDelete: Restrict`)
   - `previous_status`: Enum `BedStatus`
   - `new_status`: Enum `BedStatus`
   - `changed_by`: FK to `User` (`onDelete: Restrict`)
   - `patient_id`: FK to `PatientProfile` (`onDelete: SetNull`)
