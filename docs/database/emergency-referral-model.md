# MediNexa Day 9 Database Model Documentation

## Entity Relationship Overview

```
EmergencyRequest (emergency_requests)
├── AmbulanceDispatch (ambulance_dispatches)
│   ├── Ambulance (ambulances) ──> AmbulanceLocation (ambulance_locations)
│   └── AmbulanceDriverProfile (ambulance_driver_profiles)
└── HospitalReferral (hospital_referrals)
    ├── CrossFacilityTransfer (cross_facility_transfers)
    └── MedicalRecordTransferAuthorization (medical_record_transfer_authorizations)
```

## Schema Entities

1. **`EmergencyRequest`**:
   - `emergency_number` UNIQUE
   - `patient_id` (optional), `caller_name`, `caller_phone`, `pickup_address`, `pickup_latitude`, `pickup_longitude`
   - `emergency_type` (`MEDICAL`, `TRAUMA`, `ACCIDENT`, `CARDIAC`, `STROKE`, `RESPIRATORY`, `MATERNITY`, `PEDIATRIC`, `OTHER`)
   - `severity` (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`)
   - `status` (`REPORTED`, `TRIAGED`, `DISPATCH_REQUESTED`, `AMBULANCE_ASSIGNED`, `EN_ROUTE_TO_PICKUP`, `AT_PICKUP`, `PATIENT_ONBOARD`, `ARRIVED_AT_FACILITY`, `CANCELLED`, `CLOSED`)

2. **`Ambulance`**:
   - `vehicle_number` UNIQUE, `registration_number` UNIQUE
   - `ambulance_type` (`BASIC_LIFE_SUPPORT`, `ADVANCED_LIFE_SUPPORT`, `PATIENT_TRANSPORT`, `NEONATAL`, `OTHER`)
   - `status` (`AVAILABLE`, `DISPATCHED`, `EN_ROUTE`, `AT_SCENE`, `PATIENT_ONBOARD`, `RETURNING`, `MAINTENANCE`, `OUT_OF_SERVICE`)

3. **`AmbulanceDriverProfile`**:
   - `user_id` UNIQUE, `facility_id`, `license_number` UNIQUE, `status` (`AVAILABLE`, `ON_DUTY`, `ASSIGNED`, `OFF_DUTY`, `SUSPENDED`)

4. **`AmbulanceDispatch`**:
   - `dispatch_number` UNIQUE, `emergency_request_id`, `ambulance_id`, `driver_id`, `dispatched_by`
   - `status` (`ASSIGNED`, `ACCEPTED`, `EN_ROUTE`, `AT_PICKUP`, `PATIENT_ONBOARD`, `COMPLETED`, `CANCELLED`)

5. **`HospitalReferral`**:
   - `referral_number` UNIQUE, `patient_id`, `source_facility_id`, `destination_facility_id`, `referring_doctor_id`
   - `urgency` (`ROUTINE`, `URGENT`, `EMERGENCY`, `CRITICAL`)
   - `status` (`DRAFT`, `REQUESTED`, `UNDER_REVIEW`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `TRANSFER_IN_PROGRESS`, `COMPLETED`)

6. **`CrossFacilityTransfer`**:
   - `transfer_number` UNIQUE, `referral_id`, `patient_id`, `source_facility_id`, `destination_facility_id`, `source_admission_id`, `destination_admission_id`, `source_bed_id`, `destination_bed_id`
   - `status` (`PLANNED`, `READY`, `IN_TRANSIT`, `ARRIVED`, `COMPLETED`, `CANCELLED`)

7. **`MedicalRecordTransferAuthorization`**:
   - `referral_id`, `patient_id`, `source_facility_id`, `destination_facility_id`, `authorized_by`
   - `authorization_type` (`FULL_RECORD`, `ENCOUNTER_SUMMARY`, `LAB_RESULTS`, `PRESCRIPTIONS`, `OTHER`)
   - `status` (`REQUESTED`, `AUTHORIZED`, `REVOKED`, `EXPIRED`)
