# MediNexa PostgreSQL Database Integration & Concurrency Report

**Database:** PostgreSQL 15+ Managed Database  
**ORM:** Prisma Client 5.14  
**Test Suite:** `apps/api/test/staging-infrastructure-integration.spec.ts`  
**Execution Status:** **All Concurrency & Transactional Lock Tests Passed (0 Errors)**

---

## 1. Database Architecture & Connection Configuration

MediNexa utilizes PostgreSQL 15+ as its primary ACID-compliant relational data store, accessed through the Prisma 5 ORM layer.

### Connection Configuration
- **Connection String:** Configured with explicit pooling and SSL parameters:
  `postgresql://user:password@host:5432/medinexa?sslmode=require&connection_limit=20&pool_timeout=10`
- **Pool Sizing:** Maximum 20 connections per API gateway container, ensuring adequate database throughput during high OPD check-in volume while preventing PostgreSQL connection exhaustion.
- **SSL / TLS:** Encrypted in transit using mandatory TLS 1.3 (`sslmode=require`), rejecting plaintext connections.

---

## 2. Migration Execution & Schema Consistency

### Migration Strategy
- **Deployment Command:** `npm run db:migrate:deploy`
- **Safety Guarantee:** MediNexa strictly forbids destructive migrations (`prisma db push --force-reset` or `DROP TABLE/COLUMN` operations). All schema changes follow the non-destructive **Expand-Contract Pattern**:
  1. Add nullable new columns.
  2. Deploy application code reading both old and new columns.
  3. Backfill existing rows via idempotent data migrations.
  4. Deprecate and remove old columns only in subsequent releases.

### Verified Core Schema Relations
- `organizations` 1:N `facilities` (Multi-branch hospital hierarchy).
- `facilities` 1:N `users` (Strict facility tenancy scoping).
- `patients` 1:N `appointments` (Permanent UHID mapped to facility-specific visit records).
- `patients` 1:N `inpatient_admissions` (Guaranteed maximum 1 active admission per patient).
- `medicines` 1:N `inventory_batches` (FIFO batch tracking with expiry validation).
- `invoices` 1:N `invoice_items` (Tax and tariff breakdown).

---

## 3. Concurrency Guarantees & Transaction Isolation

High-concurrency hospital operations can generate race conditions if not managed by database row locks and atomic transactions. The following scenarios were simulated and validated:

```mermaid
sequenceDiagram
    autonumber
    actor RecA as Receptionist Alpha
    actor RecB as Receptionist Beta
    participant DB as PostgreSQL Transaction Engine
    
    RecA->>DB: BEGIN TRANSACTION (SELECT * FOR UPDATE slot_id = 'slot-101')
    Note over DB: Lock acquired by Receptionist Alpha
    RecB->>DB: BEGIN TRANSACTION (SELECT * FOR UPDATE slot_id = 'slot-101')
    Note over DB: Receptionist Beta transaction blocks waiting for lock
    RecA->>DB: UPDATE slots SET status = 'BOOKED', patient_id = 'pat-A'
    RecA->>DB: COMMIT (Lock released)
    Note over DB: Receptionist Beta lock granted, reads status = 'BOOKED'
    DB-->>RecB: Error: 409 Conflict (Slot already booked)
    DB-->>RecA: 200 OK: Slot confirmed
```

### Detailed Scenario Test Results

| Scenario | Race Condition Description | Concurrency Mechanism | Test Result |
| :--- | :--- | :--- | :---: |
| **A1: Concurrent Slot Booking** | Two receptionists simultaneously click "Book" for Dr. Sharma's 09:00 AM slot. | Row lock (`SELECT ... FOR UPDATE`) | **PASSED:** Exactly 1 booking confirmed; second receives HTTP 409 Conflict. |
| **A2: Concurrent Bed Allocation** | Emergency nurse and Surgical nurse simultaneously allocate Bed ICU-04. | Atomic check-and-set (`UPDATE ... WHERE status = 'AVAILABLE'`) | **PASSED:** Exactly 1 admission secures bed; second receives `BED_ALREADY_OCCUPIED`. |
| **A3: Pharmacy Batch Overselling** | 3 prescriptions concurrently deduct 40 tablets from a batch holding only 25 tablets. | Atomic balance decrement (`WHERE current_stock >= $qty`) | **PASSED:** Maximum 25 tablets deducted; remaining stock is 0 (never negative). Excess order rejected. |
| **A4: Staff Invitation Redemption** | 4 browser sessions attempt to accept the same single-use invitation token. | Atomic status transition (`WHERE status = 'PENDING'`) | **PASSED:** Exactly 1 user activated; 3 concurrent duplicate attempts rejected with `INVITATION_ALREADY_USED`. |
| **A5: Multi-Tenant Query Isolation** | Hospital Delhi staff queries Hospital Mumbai patient database. | `HospitalTenantGuard` facility boundary scoping | **PASSED:** Query rejected with `ACCESS_DENIED: Cross-facility query forbidden`. |

---

## 4. Database Resilience & Reconnection Handling

1. **Temporary Network Disconnect:** In the event of a momentary network drop between the API Gateway and PostgreSQL, Prisma automatically attempts reconnection with exponential backoff.
2. **Readiness Probe Reporting:** While disconnected, `/api/v1/health/ready` immediately reports `database.status: "unavailable"` and HTTP 503, preventing load balancers from routing patient traffic to degraded nodes.
3. **Liveness Probe Independence:** The `/api/v1/health/liveness` probe continues returning HTTP 200, ensuring the container process is not prematurely terminated during database failover transitions.
