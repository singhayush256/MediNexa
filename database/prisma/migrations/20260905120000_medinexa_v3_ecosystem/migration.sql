-- =============================================================================
-- Migration: 20260905120000_medinexa_v3_ecosystem
-- Creates all MediNexa v3.0 Hospital Ecosystem, Health Score, Guardian & AI Models
-- Fully idempotent with IF NOT EXISTS checks for safe production deployment
-- =============================================================================

-- Enums
DO $$ BEGIN
    CREATE TYPE "HealthCategory" AS ENUM ('EXCELLENT', 'HEALTHY', 'MONITOR', 'WARNING', 'HIGH_RISK', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "GuardianDoctorRole" AS ENUM ('PRIMARY', 'FAMILY', 'BACKUP');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "GuardianDoctorStatus" AS ENUM ('INVITED', 'ACCEPTED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EmergencyPriorityLevel" AS ENUM ('PRIMARY', 'SECONDARY', 'BACKUP');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "GuardianAlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "GuardianAlertStatus" AS ENUM ('TRIGGERED', 'ACKNOWLEDGED', 'DISPATCHED', 'RESOLVED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 1. Health Scores Table
CREATE TABLE IF NOT EXISTS "health_scores" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL DEFAULT 85.0,
    "category" "HealthCategory" NOT NULL DEFAULT 'HEALTHY',
    "heart_health_score" DOUBLE PRECISION NOT NULL DEFAULT 85.0,
    "respiratory_score" DOUBLE PRECISION NOT NULL DEFAULT 88.0,
    "diabetes_score" DOUBLE PRECISION NOT NULL DEFAULT 82.0,
    "activity_score" DOUBLE PRECISION NOT NULL DEFAULT 78.0,
    "medication_score" DOUBLE PRECISION NOT NULL DEFAULT 90.0,
    "recovery_score" DOUBLE PRECISION NOT NULL DEFAULT 85.0,
    "mental_wellness_score" DOUBLE PRECISION NOT NULL DEFAULT 80.0,
    "heart_rate" INTEGER,
    "blood_pressure_sys" INTEGER,
    "blood_pressure_dia" INTEGER,
    "spo2" INTEGER,
    "temperature" DOUBLE PRECISION,
    "blood_sugar" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "respiratory_rate" INTEGER,
    "trend_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "summary_notes" TEXT,
    "last_calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_scores_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "health_scores_patient_id_key" ON "health_scores"("patient_id");
CREATE INDEX IF NOT EXISTS "health_scores_patient_id_overall_score_idx" ON "health_scores"("patient_id", "overall_score");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'health_scores_patient_id_fkey') THEN
        ALTER TABLE "health_scores" ADD CONSTRAINT "health_scores_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 2. Health Score History Table
CREATE TABLE IF NOT EXISTS "health_score_history" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL,
    "category" "HealthCategory" NOT NULL,
    "heart_health_score" DOUBLE PRECISION NOT NULL,
    "respiratory_score" DOUBLE PRECISION NOT NULL,
    "diabetes_score" DOUBLE PRECISION NOT NULL,
    "activity_score" DOUBLE PRECISION NOT NULL,
    "medication_score" DOUBLE PRECISION NOT NULL,
    "recovery_score" DOUBLE PRECISION NOT NULL,
    "mental_wellness_score" DOUBLE PRECISION NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_score_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "health_score_history_patient_id_recorded_at_idx" ON "health_score_history"("patient_id", "recorded_at");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'health_score_history_patient_id_fkey') THEN
        ALTER TABLE "health_score_history" ADD CONSTRAINT "health_score_history_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 3. Family Doctors Table
CREATE TABLE IF NOT EXISTS "family_doctors" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT,
    "doctor_name" TEXT NOT NULL,
    "hospital_name" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "doctor_license_id" TEXT,
    "role_type" "GuardianDoctorRole" NOT NULL DEFAULT 'FAMILY',
    "status" "GuardianDoctorStatus" NOT NULL DEFAULT 'ACCEPTED',
    "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_doctors_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "family_doctors_patient_id_role_type_idx" ON "family_doctors"("patient_id", "role_type");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'family_doctors_patient_id_fkey') THEN
        ALTER TABLE "family_doctors" ADD CONSTRAINT "family_doctors_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'family_doctors_doctor_id_fkey') THEN
        ALTER TABLE "family_doctors" ADD CONSTRAINT "family_doctors_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. Emergency Thresholds Table
CREATE TABLE IF NOT EXISTS "emergency_thresholds" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "critical_score_threshold" INTEGER NOT NULL DEFAULT 40,
    "min_spo2_threshold" INTEGER NOT NULL DEFAULT 90,
    "max_heart_rate_threshold" INTEGER NOT NULL DEFAULT 130,
    "min_heart_rate_threshold" INTEGER NOT NULL DEFAULT 45,
    "max_systolic_bp_threshold" INTEGER NOT NULL DEFAULT 160,
    "min_systolic_bp_threshold" INTEGER NOT NULL DEFAULT 90,
    "auto_ambulance_dispatch" BOOLEAN NOT NULL DEFAULT true,
    "notify_family_doctors" BOOLEAN NOT NULL DEFAULT true,
    "notify_family_members" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_thresholds_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "emergency_thresholds_patient_id_key" ON "emergency_thresholds"("patient_id");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'emergency_thresholds_patient_id_fkey') THEN
        ALTER TABLE "emergency_thresholds" ADD CONSTRAINT "emergency_thresholds_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 5. Emergency Alerts Table
CREATE TABLE IF NOT EXISTS "emergency_alerts" (
    "id" TEXT NOT NULL,
    "emergency_number" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "severity" "GuardianAlertSeverity" NOT NULL DEFAULT 'CRITICAL',
    "trigger_reason" TEXT NOT NULL,
    "vitals_snapshot" JSONB,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "location_address" TEXT,
    "status" "GuardianAlertStatus" NOT NULL DEFAULT 'TRIGGERED',
    "nearest_hospital_name" TEXT,
    "ambulance_dispatched" BOOLEAN NOT NULL DEFAULT false,
    "ambulance_id" TEXT,
    "doctor_notified" BOOLEAN NOT NULL DEFAULT false,
    "family_notified" BOOLEAN NOT NULL DEFAULT false,
    "hospital_notified" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_alerts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "emergency_alerts_emergency_number_key" ON "emergency_alerts"("emergency_number");
CREATE INDEX IF NOT EXISTS "emergency_alerts_patient_id_status_idx" ON "emergency_alerts"("patient_id", "status");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'emergency_alerts_patient_id_fkey') THEN
        ALTER TABLE "emergency_alerts" ADD CONSTRAINT "emergency_alerts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 6. Emergency Events Table
CREATE TABLE IF NOT EXISTS "emergency_events" (
    "id" TEXT NOT NULL,
    "alert_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "emergency_events_alert_id_timestamp_idx" ON "emergency_events"("alert_id", "timestamp");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'emergency_events_alert_id_fkey') THEN
        ALTER TABLE "emergency_events" ADD CONSTRAINT "emergency_events_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "emergency_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 7. Patient Risk Profiles Table
CREATE TABLE IF NOT EXISTS "patient_risk_profiles" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "is_high_risk" BOOLEAN NOT NULL DEFAULT false,
    "risk_level" TEXT NOT NULL DEFAULT 'STANDARD',
    "chronic_conditions" TEXT[] DEFAULT ARRAY[]::text[],
    "doctor_risk_notes" TEXT,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_risk_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "patient_risk_profiles_patient_id_key" ON "patient_risk_profiles"("patient_id");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patient_risk_profiles_patient_id_fkey') THEN
        ALTER TABLE "patient_risk_profiles" ADD CONSTRAINT "patient_risk_profiles_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 8. Patient Guardians Table
CREATE TABLE IF NOT EXISTS "patient_guardians" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "guardian_user_id" TEXT,
    "full_name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "national_id" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "can_consent" BOOLEAN NOT NULL DEFAULT true,
    "can_access_records" BOOLEAN NOT NULL DEFAULT true,
    "can_receive_alerts" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_guardians_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "patient_guardians_patient_id_is_primary_idx" ON "patient_guardians"("patient_id", "is_primary");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patient_guardians_patient_id_fkey') THEN
        ALTER TABLE "patient_guardians" ADD CONSTRAINT "patient_guardians_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patient_guardians_guardian_user_id_fkey') THEN
        ALTER TABLE "patient_guardians" ADD CONSTRAINT "patient_guardians_guardian_user_id_fkey" FOREIGN KEY ("guardian_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 9. Vital Monitorings Table
CREATE TABLE IF NOT EXISTS "vital_monitorings" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "facility_id" TEXT,
    "bed_id" TEXT,
    "device_id" TEXT,
    "heart_rate" INTEGER,
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "spo2" INTEGER,
    "respiratory_rate" INTEGER,
    "temperature" DOUBLE PRECISION,
    "glucose_level" DOUBLE PRECISION,
    "is_deteriorating" BOOLEAN NOT NULL DEFAULT false,
    "alert_triggered" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vital_monitorings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "vital_monitorings_patient_id_recorded_at_idx" ON "vital_monitorings"("patient_id", "recorded_at");
CREATE INDEX IF NOT EXISTS "vital_monitorings_is_deteriorating_recorded_at_idx" ON "vital_monitorings"("is_deteriorating", "recorded_at");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vital_monitorings_patient_id_fkey') THEN
        ALTER TABLE "vital_monitorings" ADD CONSTRAINT "vital_monitorings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 10. Risk Predictions Table
CREATE TABLE IF NOT EXISTS "risk_predictions" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "facility_id" TEXT,
    "prediction_type" TEXT NOT NULL,
    "risk_percentage" DOUBLE PRECISION NOT NULL,
    "confidence_percentage" DOUBLE PRECISION NOT NULL DEFAULT 90.0,
    "risk_level" TEXT NOT NULL DEFAULT 'GREEN',
    "primary_reasons" TEXT[] DEFAULT ARRAY[]::text[],
    "model_name" TEXT NOT NULL DEFAULT 'MediNexa-PredictHealth-v3',
    "recommended_actions" TEXT[] DEFAULT ARRAY[]::text[],
    "evaluated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_predictions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "risk_predictions_patient_id_prediction_type_idx" ON "risk_predictions"("patient_id", "prediction_type");
CREATE INDEX IF NOT EXISTS "risk_predictions_patient_id_evaluated_at_idx" ON "risk_predictions"("patient_id", "evaluated_at");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'risk_predictions_patient_id_fkey') THEN
        ALTER TABLE "risk_predictions" ADD CONSTRAINT "risk_predictions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 11. Nurse Tasks Table
CREATE TABLE IF NOT EXISTS "nurse_tasks" (
    "id" TEXT NOT NULL,
    "nurse_id" TEXT,
    "patient_id" TEXT NOT NULL,
    "ward_id" TEXT,
    "admission_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'MEDICATION',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "due_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "completed_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nurse_tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "nurse_tasks_patient_id_status_idx" ON "nurse_tasks"("patient_id", "status");
CREATE INDEX IF NOT EXISTS "nurse_tasks_nurse_id_due_at_idx" ON "nurse_tasks"("nurse_id", "due_at");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nurse_tasks_patient_id_fkey') THEN
        ALTER TABLE "nurse_tasks" ADD CONSTRAINT "nurse_tasks_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nurse_tasks_nurse_id_fkey') THEN
        ALTER TABLE "nurse_tasks" ADD CONSTRAINT "nurse_tasks_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 12. Ward Assignments Table
CREATE TABLE IF NOT EXISTS "ward_assignments" (
    "id" TEXT NOT NULL,
    "ward_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "role_type" TEXT NOT NULL DEFAULT 'NURSE',
    "shift_type" TEXT NOT NULL DEFAULT 'MORNING',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ward_assignments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ward_assignments_ward_id_shift_type_idx" ON "ward_assignments"("ward_id", "shift_type");
CREATE INDEX IF NOT EXISTS "ward_assignments_staff_id_status_idx" ON "ward_assignments"("staff_id", "status");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ward_assignments_ward_id_fkey') THEN
        ALTER TABLE "ward_assignments" ADD CONSTRAINT "ward_assignments_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ward_assignments_staff_id_fkey') THEN
        ALTER TABLE "ward_assignments" ADD CONSTRAINT "ward_assignments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 13. Bed Allocations Table
CREATE TABLE IF NOT EXISTS "bed_allocations" (
    "id" TEXT NOT NULL,
    "bed_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "allocation_type" TEXT NOT NULL DEFAULT 'EMERGENCY',
    "allocated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OCCUPIED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bed_allocations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "bed_allocations_bed_id_status_idx" ON "bed_allocations"("bed_id", "status");
CREATE INDEX IF NOT EXISTS "bed_allocations_patient_id_status_idx" ON "bed_allocations"("patient_id", "status");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bed_allocations_bed_id_fkey') THEN
        ALTER TABLE "bed_allocations" ADD CONSTRAINT "bed_allocations_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "beds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bed_allocations_patient_id_fkey') THEN
        ALTER TABLE "bed_allocations" ADD CONSTRAINT "bed_allocations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bed_allocations_admission_id_fkey') THEN
        ALTER TABLE "bed_allocations" ADD CONSTRAINT "bed_allocations_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
