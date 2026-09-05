-- =============================================================================
-- Migration: 20260905113000_add_backend_production_models_and_fields
-- Ensures all production backend models, fields, and relations exist in PostgreSQL.
-- =============================================================================

-- 1. BedType Enum: Add OXYGEN and VENTILATOR values
DO $$
BEGIN
    ALTER TYPE "BedType" ADD VALUE IF NOT EXISTS 'OXYGEN';
    ALTER TYPE "BedType" ADD VALUE IF NOT EXISTS 'VENTILATOR';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Users Table: 2FA & Authenticator fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'totp_secret') THEN
        ALTER TABLE "users" ADD COLUMN "totp_secret" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'two_factor_enabled') THEN
        ALTER TABLE "users" ADD COLUMN "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'backup_codes') THEN
        ALTER TABLE "users" ADD COLUMN "backup_codes" TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'failed_totp_attempts') THEN
        ALTER TABLE "users" ADD COLUMN "failed_totp_attempts" INTEGER NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_verification_time') THEN
        ALTER TABLE "users" ADD COLUMN "last_verification_time" TIMESTAMP(3);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'totp_locked_until') THEN
        ALTER TABLE "users" ADD COLUMN "totp_locked_until" TIMESTAMP(3);
    END IF;
END $$;

-- 3. Facilities Table: Geolocation & Metadata
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'latitude') THEN
        ALTER TABLE "facilities" ADD COLUMN "latitude" DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'longitude') THEN
        ALTER TABLE "facilities" ADD COLUMN "longitude" DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'facility_type') THEN
        ALTER TABLE "facilities" ADD COLUMN "facility_type" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'rating') THEN
        ALTER TABLE "facilities" ADD COLUMN "rating" DOUBLE PRECISION DEFAULT 4.5;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'services_offered') THEN
        ALTER TABLE "facilities" ADD COLUMN "services_offered" TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
END $$;

-- 4. Medications Table: Patient tracking fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'patient_id') THEN
        ALTER TABLE "medications" ADD COLUMN "patient_id" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'medicine_name') THEN
        ALTER TABLE "medications" ADD COLUMN "medicine_name" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'dosage') THEN
        ALTER TABLE "medications" ADD COLUMN "dosage" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'frequency') THEN
        ALTER TABLE "medications" ADD COLUMN "frequency" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'timing') THEN
        ALTER TABLE "medications" ADD COLUMN "timing" TEXT[] DEFAULT ARRAY[]::text[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'before_meal') THEN
        ALTER TABLE "medications" ADD COLUMN "before_meal" BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'start_date') THEN
        ALTER TABLE "medications" ADD COLUMN "start_date" TIMESTAMP(3);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'end_date') THEN
        ALTER TABLE "medications" ADD COLUMN "end_date" TIMESTAMP(3);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'prescribed_by') THEN
        ALTER TABLE "medications" ADD COLUMN "prescribed_by" TEXT;
    END IF;

    -- Make master catalog columns nullable or have defaults if needed
    ALTER TABLE "medications" ALTER COLUMN "code" SET DEFAULT gen_random_uuid()::text;
    ALTER TABLE "medications" ALTER COLUMN "generic_name" SET DEFAULT '';
    ALTER TABLE "medications" ALTER COLUMN "brand_name" SET DEFAULT '';
    ALTER TABLE "medications" ALTER COLUMN "strength" SET DEFAULT '';
    ALTER TABLE "medications" ALTER COLUMN "dosage_form" SET DEFAULT '';
    ALTER TABLE "medications" ALTER COLUMN "route" SET DEFAULT 'ORAL';

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medications_patient_id_fkey') THEN
        ALTER TABLE "medications" ADD CONSTRAINT "medications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 5. Notifications Table: is_read field
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
        ALTER TABLE "notifications" ADD COLUMN "is_read" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- 6. MedicationReminders Table: direct reminder fields & optional prescription item
DO $$
BEGIN
    ALTER TABLE "medication_reminders" ALTER COLUMN "prescription_item_id" DROP NOT NULL;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medication_reminders' AND column_name = 'doctor_id') THEN
        ALTER TABLE "medication_reminders" ADD COLUMN "doctor_id" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medication_reminders' AND column_name = 'medicine_name') THEN
        ALTER TABLE "medication_reminders" ADD COLUMN "medicine_name" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medication_reminders' AND column_name = 'dosage') THEN
        ALTER TABLE "medication_reminders" ADD COLUMN "dosage" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medication_reminders' AND column_name = 'food_timing') THEN
        ALTER TABLE "medication_reminders" ADD COLUMN "food_timing" TEXT NOT NULL DEFAULT 'NO_RESTRICTION';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medication_reminders' AND column_name = 'start_date') THEN
        ALTER TABLE "medication_reminders" ADD COLUMN "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medication_reminders' AND column_name = 'end_date') THEN
        ALTER TABLE "medication_reminders" ADD COLUMN "end_date" TIMESTAMP(3);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medication_reminders' AND column_name = 'reminder_time') THEN
        ALTER TABLE "medication_reminders" ADD COLUMN "reminder_time" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medication_reminders' AND column_name = 'instructions') THEN
        ALTER TABLE "medication_reminders" ADD COLUMN "instructions" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medication_reminders_doctor_id_fkey') THEN
        ALTER TABLE "medication_reminders" ADD CONSTRAINT "medication_reminders_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 7. BedBookings Table
CREATE TABLE IF NOT EXISTS "bed_bookings" (
    "id" TEXT NOT NULL,
    "booking_number" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "patient_name" TEXT NOT NULL,
    "patient_phone" TEXT NOT NULL,
    "patient_email" TEXT,
    "bed_type" "BedType" NOT NULL DEFAULT 'GENERAL',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "chief_complaint" TEXT,
    "medical_condition" TEXT,
    "expected_date" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "allocated_bed_id" TEXT,
    "admission_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "admitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bed_bookings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "bed_bookings_booking_number_key" ON "bed_bookings"("booking_number");
CREATE INDEX IF NOT EXISTS "bed_bookings_facility_id_status_idx" ON "bed_bookings"("facility_id", "status");
CREATE INDEX IF NOT EXISTS "bed_bookings_patient_id_status_idx" ON "bed_bookings"("patient_id", "status");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bed_bookings_facility_id_fkey') THEN
        ALTER TABLE "bed_bookings" ADD CONSTRAINT "bed_bookings_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bed_bookings_patient_id_fkey') THEN
        ALTER TABLE "bed_bookings" ADD CONSTRAINT "bed_bookings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bed_bookings_allocated_bed_id_fkey') THEN
        ALTER TABLE "bed_bookings" ADD CONSTRAINT "bed_bookings_allocated_bed_id_fkey" FOREIGN KEY ("allocated_bed_id") REFERENCES "beds"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bed_bookings_admission_id_fkey') THEN
        ALTER TABLE "bed_bookings" ADD CONSTRAINT "bed_bookings_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 8. HospitalBedStatuses Table
CREATE TABLE IF NOT EXISTS "hospital_bed_statuses" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "hospital_name" TEXT NOT NULL,
    "total_beds" INTEGER NOT NULL DEFAULT 0,
    "occupied_beds" INTEGER NOT NULL DEFAULT 0,
    "available_beds" INTEGER NOT NULL DEFAULT 0,
    "icu_beds" INTEGER NOT NULL DEFAULT 0,
    "icu_available" INTEGER NOT NULL DEFAULT 0,
    "general_beds" INTEGER NOT NULL DEFAULT 0,
    "general_available" INTEGER NOT NULL DEFAULT 0,
    "emergency_beds" INTEGER NOT NULL DEFAULT 0,
    "emergency_available" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_bed_statuses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "hospital_bed_statuses_facility_id_key" ON "hospital_bed_statuses"("facility_id");
CREATE INDEX IF NOT EXISTS "hospital_bed_statuses_facility_id_status_idx" ON "hospital_bed_statuses"("facility_id", "status");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hospital_bed_statuses_facility_id_fkey') THEN
        ALTER TABLE "hospital_bed_statuses" ADD CONSTRAINT "hospital_bed_statuses_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 9. MedicationLogs Table
CREATE TABLE IF NOT EXISTS "medication_logs" (
    "id" TEXT NOT NULL,
    "medication_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "dose_time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'taken',
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "taken_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "medication_logs_medication_id_scheduled_for_idx" ON "medication_logs"("medication_id", "scheduled_for");
CREATE INDEX IF NOT EXISTS "medication_logs_patient_id_status_idx" ON "medication_logs"("patient_id", "status");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medication_logs_medication_id_fkey') THEN
        ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 10. NotificationPreferences Table
CREATE TABLE IF NOT EXISTS "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "whatsapp_enabled" BOOLEAN NOT NULL DEFAULT true,
    "appointment_reminders" BOOLEAN NOT NULL DEFAULT true,
    "medication_reminders" BOOLEAN NOT NULL DEFAULT true,
    "lab_report_alerts" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notification_preferences_user_id_fkey') THEN
        ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 11. NotificationDeliveryLogs Table
CREATE TABLE IF NOT EXISTS "notification_delivery_logs" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "sent_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_delivery_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "notification_delivery_logs_recipient_status_idx" ON "notification_delivery_logs"("recipient", "status");
CREATE INDEX IF NOT EXISTS "notification_delivery_logs_channel_created_at_idx" ON "notification_delivery_logs"("channel", "created_at");

-- 12. ReminderNotifications Table
CREATE TABLE IF NOT EXISTS "reminder_notifications" (
    "id" TEXT NOT NULL,
    "reminder_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduled_time" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "reminder_notifications_reminder_id_status_idx" ON "reminder_notifications"("reminder_id", "status");
CREATE INDEX IF NOT EXISTS "reminder_notifications_patient_id_channel_idx" ON "reminder_notifications"("patient_id", "channel");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reminder_notifications_reminder_id_fkey') THEN
        ALTER TABLE "reminder_notifications" ADD CONSTRAINT "reminder_notifications_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "medication_reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reminder_notifications_patient_id_fkey') THEN
        ALTER TABLE "reminder_notifications" ADD CONSTRAINT "reminder_notifications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 13. ReminderHistories Table
CREATE TABLE IF NOT EXISTS "reminder_histories" (
    "id" TEXT NOT NULL,
    "reminder_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "action_time" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_histories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "reminder_histories_reminder_id_scheduled_for_idx" ON "reminder_histories"("reminder_id", "scheduled_for");
CREATE INDEX IF NOT EXISTS "reminder_histories_patient_id_action_idx" ON "reminder_histories"("patient_id", "action");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reminder_histories_reminder_id_fkey') THEN
        ALTER TABLE "reminder_histories" ADD CONSTRAINT "reminder_histories_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "medication_reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reminder_histories_patient_id_fkey') THEN
        ALTER TABLE "reminder_histories" ADD CONSTRAINT "reminder_histories_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 14. MedicationSchedules Table
CREATE TABLE IF NOT EXISTS "medication_schedules" (
    "id" TEXT NOT NULL,
    "reminder_id" TEXT,
    "patient_id" TEXT NOT NULL,
    "medicine_name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'DAILY',
    "scheduled_time" TEXT NOT NULL,
    "day_of_week" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "taken_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_schedules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "medication_schedules_patient_id_status_idx" ON "medication_schedules"("patient_id", "status");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medication_schedules_reminder_id_fkey') THEN
        ALTER TABLE "medication_schedules" ADD CONSTRAINT "medication_schedules_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "medication_reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medication_schedules_patient_id_fkey') THEN
        ALTER TABLE "medication_schedules" ADD CONSTRAINT "medication_schedules_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
