# MediNexa Laboratory & Pharmacy Database ERD Specification

## Database Relational ERD

```
ClinicalEncounter (1)
  ├───< LabOrder (N)
  │       ├───< LabOrderItem (N) ───> LabTest (1) ───< LabResult (N) ───< LabResultVersion (N)
  │       └───< Specimen (N)
  │
  └───< Prescription (N)
          ├───< PrescriptionItem (N) ───> Medication (1)
          ├───< PrescriptionAmendment (N)
          └───< PrescriptionDispense (N)
```

## Schema Entities & Relationships

### 1. Laboratory Models
- `LabTest`: Master test catalog entity (`code` UNIQUE, `category`, `specimenType`, `turnaroundTimeMinutes`, `price`).
- `LabOrder`: Clinical lab order container (`orderNumber` UNIQUE, `encounterId`, `patientId`, `doctorId`, `facilityId`, `priority`, `status`).
- `LabOrderItem`: Links `LabOrder` to `LabTest`.
- `Specimen`: Biological sample tracking (`specimenNumber` UNIQUE, `status`, `collectedBy`, `collectedAt`, `receivedAt`, `rejectedAt`, `rejectionReason`).
- `LabResult`: Test result (`resultValue`, `numericValue`, `unit`, `referenceRange`, `abnormalFlag`, `resultStatus`, `enteredBy`, `verifiedBy`).
- `LabResultVersion`: Audit entity preserving prior result values and amendment reasons when finalized results are amended.

### 2. Pharmacy Models
- `Medication`: Master pharmaceutical drug catalog (`code` UNIQUE, `genericName`, `brandName`, `strength`, `dosageForm`, `route`, `category`, `prescriptionRequired`).
- `Prescription`: Digital prescription container (`prescriptionNumber` UNIQUE, `encounterId`, `patientId`, `doctorId`, `facilityId`, `status`, `prescribedAt`).
- `PrescriptionItem`: Links `Prescription` to `Medication` (`dosage`, `frequency`, `route`, `duration`, `quantity`).
- `PrescriptionAmendment`: Audit entity logging prescription amendments.
- `PrescriptionDispense`: Pharmacy fulfillment record (`dispenseNumber` UNIQUE, `quantityDispensed`, `dispensedBy`, `dispensedAt`, `status`).
