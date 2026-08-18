# MediNexa Day 10 Database Models Documentation

## Entities

1. **`Appointment`** (`appointments`): Unique index `@@unique([doctorId, appointmentDate, startTime])`.
2. **`DoctorSchedule`** (`doctor_schedules`): Index `@@index([doctorId, facilityId])`.
3. **`Notification`** (`notifications`): Index `@@index([userId, readAt])`.
4. **`MedicationReminder`** (`medication_reminders`): Index `@@index([patientId, status])`.
5. **`AiInteractionAudit`** (`ai_interaction_audits`): Audit queries submitted to AI.
6. **`AuditEvent`** (`audit_events`): Security and administrative log events.
