# MediNexa Security Review & Audit Controls

## Security Verification Checklist

1. **Role-Based Access Control (RBAC)**: All 9 role codes verified. Patients cannot query other patients' appointments, notifications, or medical records.
2. **Facility Isolation**: Hospital Administrators at Hospital A cannot query private records or analytics belonging to Hospital B.
3. **AI Prompt Safety & Data Leakage Prevention**: AI interactions are logged without storing raw credentials or secrets. Prompts are validated to a maximum size of 2000 characters.
4. **Appointment Booking Concurrency**: Double-booking requests for the exact same doctor and time slot fail with `409 Conflict`.
