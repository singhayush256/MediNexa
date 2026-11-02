# MediNexa Patient API & Emergency Contact Specification

## Base Route: `/api/v1/patients`

All patient endpoints require a valid JWT token (`Authorization: Bearer <token>`).

---

## Endpoints

### 1. Authenticated Patient Profile (`GET /api/v1/patients/me`)
Returns the patient profile associated with the current authenticated user.

### 2. Patient Directory List (`GET /api/v1/patients`)
Returns list of patient profiles.
- **Allowed Roles**: `DOCTOR`, `NURSE`, `RECEPTIONIST`, `HOSPITAL_ADMIN`, `MEDINEXA_ADMIN`.
- *Note*: `PATIENT` users calling this endpoint receive only their own profile.

### 3. Patient Profile by ID (`GET /api/v1/patients/:id`)
Returns a specific patient profile by ID.
- **Security Constraint**: `PATIENT` users can ONLY view their own patient profile. Attempting to view another patient's ID returns `403 Forbidden`.

### 4. Create Patient Profile (`POST /api/v1/patients`)
Creates a new patient profile linked to a user.

#### Request Payload:
```json
{
  "userId": "u0a1b2c3-d4e5-6789-0123-456789abcdef",
  "dateOfBirth": "1990-05-15",
  "gender": "FEMALE",
  "bloodGroup": "O_POSITIVE",
  "phone": "+1-800-555-PAT1",
  "address": "742 Evergreen Terrace, Springfield",
  "emergencyContacts": [
    {
      "name": "Robert Doe",
      "relationship": "Spouse",
      "phone": "+1-800-555-EMERG1",
      "email": "robert.doe@test.local"
    }
  ]
}
```

### 5. Update Patient Profile (`PATCH /api/v1/patients/:id`)
Updates demographic fields or emergency contacts.
- **Security Constraint**: Patients can only update their own profile fields (`403 Forbidden` if ID belongs to another patient).
