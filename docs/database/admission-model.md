# MediNexa Day 6 Database Admission Model Documentation

## Relational Schema

```
PatientProfile (1) ───< Admission (N) ───< BedAssignment (N) ───> Bed (1)
                            │
                            ├───< AdmissionTransfer (N)
                            │
                            └───< AdmissionStatusHistory (N)
```

---

## Field Specifications

### 1. `Admission`
- `id`: UUID (PK)
- `patient_id`: FK to `PatientProfile` (`onDelete: Restrict`)
- `facility_id`: FK to `Facility` (`onDelete: Restrict`)
- `department_id`: FK to `Department` (`onDelete: Restrict`)
- `admission_number`: String (Unique, e.g. `ADM-1723829103-912`)
- `admission_type`: Enum `AdmissionType` (`EMERGENCY`, `ELECTIVE`, `OBSERVATION`, `TRANSFER`, `DAY_CARE`)
- `status`: Enum `AdmissionStatus` (`PLANNED`, `ADMITTED`, `TRANSFERRED`, `DISCHARGE_PENDING`, `DISCHARGED`, `CANCELLED`)
- `admitted_at`: DateTime (@default(now()))
- `admitted_by`: FK to `User` (`onDelete: Restrict`)
- `expected_discharge_at`: DateTime (Optional)
- `discharged_at`: DateTime (Optional)
- `discharge_reason`: String (Optional)
- `reason`: String (Optional)

### 2. `AdmissionTransfer`
- `id`: UUID (PK)
- `admission_id`: FK to `Admission` (`onDelete: Restrict`)
- `patient_id`: FK to `PatientProfile` (`onDelete: Restrict`)
- `from_bed_id`: FK to `Bed` (`onDelete: Restrict`)
- `to_bed_id`: FK to `Bed` (`onDelete: Restrict`)
- `from_room_id` / `to_room_id`: String (Optional)
- `from_ward_id` / `to_ward_id`: String (Optional)
- `from_department_id` / `to_department_id`: String (Optional)
- `reason`: String (Optional)
- `transferred_by`: FK to `User` (`onDelete: Restrict`)
- `transferred_at`: DateTime (@default(now()))

### 3. `AdmissionStatusHistory`
- `id`: UUID (PK)
- `admission_id`: FK to `Admission` (`onDelete: Cascade`)
- `previous_status`: Enum `AdmissionStatus`
- `new_status`: Enum `AdmissionStatus`
- `changed_by`: FK to `User` (`onDelete: Restrict`)
- `reason`: String (Optional)
