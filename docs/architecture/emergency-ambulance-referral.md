# MediNexa Emergency, Ambulance & Hospital Referral Architecture

## 1. System Architecture Overview

Day 9 introduces emergency dispatch, ambulance fleet telematics, inter-hospital referrals, and cross-facility patient transfers to the MediNexa enterprise healthcare platform.

```
EmergencyRequest ──> AmbulanceDispatch ──> Ambulance & Driver Profile & GPS Telemetry
       │
       v
HospitalReferral ──> BedReservation ──> Cross-Facility Transfer ──> Destination Admission & Bed Assignment
       │
       v
MedicalRecordTransferAuthorization ──> Authorized Category Access (EHR / Labs / Prescriptions)
```

## 2. Emergency Response Lifecycle

1. Call Logging: Emergency call registered (`status: REPORTED`, `severity: MODERATE`). Patient ID is optional initially.
2. Triage: Clinical triage sets severity (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`) and updates status to `TRIAGED`.
3. Dispatch Request: Dispatcher requests ambulance (`status: DISPATCH_REQUESTED`).
4. Dispatch Assignment: Concurrency-protected dispatch assigns available ambulance and driver (`status: AMBULANCE_ASSIGNED`).
5. Trip Execution: Driver accepts trip (`EN_ROUTE_TO_PICKUP`), arrives at scene (`AT_PICKUP`), boards patient (`PATIENT_ONBOARD`), and arrives at destination facility (`ARRIVED_AT_FACILITY`).
6. Closure: Incident closed (`status: CLOSED`).

## 3. Concurrency Protection & Atomic Transactions

- **Ambulance & Driver Dispatch**: Dispatching executes in an atomic Prisma transaction (`prisma.$transaction`). It verifies that `ambulance.status === AVAILABLE` and `driver.status === AVAILABLE` / `ON_DUTY`. If either is already dispatched, the losing request receives `409 Conflict`.
- **Inter-Hospital Bed Reservation**: When a receiving hospital accepts a referral and selects a destination bed, the bed state is checked atomically. If `bed.status !== AVAILABLE`, a `409 Conflict` is returned. A successful reservation hold (`BedReservation`) sets bed status to `RESERVED`.
- **Cross-Facility Patient Transfer**: When patient arrives at Hospital B, `completeTransfer` atomically creates a destination admission via `AdmissionService` and assigns the destination bed via `BedService`, converting the reservation and setting bed status to `OCCUPIED`. Historical source admissions and bed records at Hospital A are preserved without deletion.

## 4. Medical Record Transfer Authorization & Patient Privacy

- **Granular Category Access**: Transfer of medical records between Hospital A and Hospital B requires explicit authorization (`MedicalRecordTransferAuthorization`). Authorized categories: `FULL_RECORD`, `ENCOUNTER_SUMMARY`, `LAB_RESULTS`, `PRESCRIPTIONS`.
- **Revocation & Expiry**: Access requests without an active authorization or with a revoked authorization return `403 Forbidden`.
- **Driver Role Privacy**: Ambulance drivers receive operational trip data only (pickup address, caller contact, emergency severity) and cannot access full patient clinical records.
