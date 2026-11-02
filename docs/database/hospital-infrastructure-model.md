# MediNexa Day 4 Database Infrastructure Model Documentation

## Entity Relationship Overview

```
Facility (1) ───< Ward (N) ───< Room (N) ───< Bed (N)
    │               │                           │
    ├──< Department (1)                         │
    │                                           │
    └───────────────────────────────────────────┴── (facilityId FK on Bed)
```

---

## Constraints & Key Indexes

1. **`Ward`**:
   - `facilityId`: FK to `Facility` (`onDelete: Restrict`)
   - `departmentId`: FK to `Department` (`onDelete: Restrict`)
   - Index: `@@unique([facilityId, code])`

2. **`Room`**:
   - `wardId`: FK to `Ward` (`onDelete: Restrict`)
   - Index: `@@unique([wardId, roomNumber])`

3. **`Bed`**:
   - `roomId`: FK to `Room` (`onDelete: Restrict`)
   - `wardId`: FK to `Ward` (`onDelete: Restrict`)
   - `facilityId`: FK to `Facility` (`onDelete: Restrict`)
   - Index: `@@unique([roomId, bedNumber])`
   - Default Status: `AVAILABLE`

---

## Non-Destructive Deactivation Policy

Healthcare infrastructure records (Wards, Rooms, Beds) must not be physically deleted once operational data exists. Status flags (`INACTIVE`, `MAINTENANCE`, `OUT_OF_SERVICE`) are used to deactivate units safely.
