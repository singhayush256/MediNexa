# MediNexa Hospital Infrastructure Architecture

## 1. Physical Infrastructure Hierarchy

MediNexa establishes a complete physical hospital hierarchy supporting multi-hospital operational requirements.

```
MediNexa Enterprise Monolith
   ↓
Organization (e.g. MediNexa Central Health Network)
   ↓
Facility / Hospital (e.g. MediNexa General, MediNexa Metro)
   ↓
Department (e.g. Cardiology, Intensive Care Unit, Emergency)
   ↓
Ward (e.g. ICU Critical Care Ward, Cardiology General Ward)
   ↓
Room (e.g. ICU-101, Room 201)
   ↓
Bed (e.g. BED-ICU-01, BED-CARD-01)
```

---

## 2. Infrastructure Entity Specifications

### 1. Ward
Logical and physical division within a Facility & Department.
- **Ward Types**: `GENERAL`, `ICU`, `CCU`, `NICU`, `PICU`, `EMERGENCY`, `MATERNITY`, `ISOLATION`, `PRIVATE`, `SEMI_PRIVATE`
- **Ward Statuses**: `ACTIVE`, `INACTIVE`, `MAINTENANCE`
- **Constraint**: Unique ward code per facility (`@@unique([facilityId, code])`).

### 2. Room
Room unit within a Ward.
- **Room Types**: `GENERAL`, `PRIVATE`, `SEMI_PRIVATE`, `ICU`, `ISOLATION`, `EMERGENCY`
- **Capacity**: Integer representing maximum bed capacity.
- **Constraint**: Unique room number per ward (`@@unique([wardId, roomNumber])`).

### 3. Bed
Physical bed unit within a Room.
- **Bed Types**: `GENERAL`, `ICU`, `CCU`, `NICU`, `PICU`, `EMERGENCY`, `PRIVATE`, `SEMI_PRIVATE`
- **Bed Statuses**: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `CLEANING`, `MAINTENANCE`, `OUT_OF_SERVICE`
- **Default Status**: Newly created operational bed defaults to `AVAILABLE`.
- **Constraint**: Unique bed number per room (`@@unique([roomId, bedNumber])`).

---

## 3. Multi-Hospital Data Isolation & Security

- **Hospital Admin Scoping**: `HOSPITAL_ADMIN` users for Hospital A are strictly scoped to Hospital A (`facilityId` / `organizationId`). Attempting to create or modify Hospital B wards, rooms, or beds returns `403 Forbidden`.
- **System Admin**: `MEDINEXA_ADMIN` maintains full multi-hospital network management privileges.
- **Patients & Non-Admin Staff**: Patients and non-administrative staff cannot create or modify hospital infrastructure (`403 Forbidden`).
