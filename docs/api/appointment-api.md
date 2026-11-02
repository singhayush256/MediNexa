# MediNexa Appointment REST API Documentation

## Endpoints

### 1. Configure Doctor Schedule
- `POST /api/v1/doctor-schedules`
- Auth: `DOCTOR`, `HOSPITAL_ADMIN`, `MEDINEXA_ADMIN`

### 2. Query Doctor Availability
- `GET /api/v1/doctors/:doctorId/availability?date=YYYY-MM-DD`
- Auth: Public / Authenticated

### 3. Book Appointment
- `POST /api/v1/appointments`
- Auth: Authenticated
- **Concurrency**: Returns `409 Conflict` if the selected slot is already booked.

### 4. Appointment Lifecycle Actions
- `POST /api/v1/appointments/:id/confirm`
- `POST /api/v1/appointments/:id/check-in`
- `POST /api/v1/appointments/:id/start` -> Creates `ClinicalEncounter` (`IN_PROGRESS`)
- `POST /api/v1/appointments/:id/complete` -> Closes `ClinicalEncounter` (`COMPLETED`)
- `POST /api/v1/appointments/:id/cancel`
- `POST /api/v1/appointments/:id/reschedule`
