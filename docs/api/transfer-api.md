# MediNexa Patient Bed Transfer API Specification

## Transfer Endpoint

`POST /api/v1/admissions/:id/transfer`

### Request Body
```json
{
  "targetBedId": "uuid-target-bed",
  "reason": "Patient condition stabilized; transferred from ICU to General Ward"
}
```

### Validation & Safety Rules
1. **Active State Verification**: Admission must be in `ADMITTED` or `TRANSFERRED` status.
2. **Same-Bed Guard**: If `targetBedId` is identical to patient's current bed, rejects with `409 Conflict`.
3. **Cross-Facility Guard**: If `targetBed` belongs to a different facility than the admission, rejects with `400 Bad Request`.
4. **Bed Availability & Concurrency**: Target bed must be `AVAILABLE`. Competing simultaneous transfers return `409 Conflict`.

### Atomic State Outcomes
- Old Bed: `OCCUPIED` -> `CLEANING`
- Old Assignment: `ACTIVE` -> `RELEASED`
- Target Bed: `AVAILABLE` -> `OCCUPIED`
- New Assignment: Created (`status: ACTIVE`, `admissionId: admission.id`)
- Audit Record: `AdmissionTransfer` created (`fromBedId`, `toBedId`, `transferredBy`, `reason`)
