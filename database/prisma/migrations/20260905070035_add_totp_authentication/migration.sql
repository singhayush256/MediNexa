-- CreateEnum
CREATE TYPE "BedBookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'ADMITTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FoodTiming" AS ENUM ('BEFORE_FOOD', 'AFTER_FOOD', 'WITH_FOOD', 'NO_RESTRICTION');

-- CreateEnum
CREATE TYPE "ReminderAction" AS ENUM ('TAKEN', 'SKIPPED', 'MISSED', 'SNOOZED');

-- CreateEnum
CREATE TYPE "ReminderNotificationChannel" AS ENUM ('BROWSER_PUSH', 'IN_APP', 'EMAIL', 'WHATSAPP', 'SMS');

-- CreateEnum
CREATE TYPE "ReminderNotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BedType" ADD VALUE 'OXYGEN';
ALTER TYPE "BedType" ADD VALUE 'VENTILATOR';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'LAB_REPORT_AVAILABLE';
ALTER TYPE "NotificationType" ADD VALUE 'PRESCRIPTION_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'TELEHEALTH_SESSION_STARTING';
ALTER TYPE "NotificationType" ADD VALUE 'BED_BOOKING_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'BED_BOOKING_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'BED_BOOKING_EXPIRED';

-- DropForeignKey
ALTER TABLE "medication_reminders" DROP CONSTRAINT "medication_reminders_prescription_item_id_fkey";

-- AlterTable
ALTER TABLE "facilities" ADD COLUMN     "facility_type" TEXT DEFAULT 'GENERAL_HOSPITAL',
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 4.5,
ADD COLUMN     "services_offered" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "medication_reminders" ADD COLUMN     "doctor_id" TEXT,
ADD COLUMN     "dosage" TEXT,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "food_timing" "FoodTiming" NOT NULL DEFAULT 'NO_RESTRICTION',
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "medicine_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "reminder_time" TEXT,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "prescription_item_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "medications" ADD COLUMN     "before_meal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dosage" TEXT,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "frequency" TEXT,
ADD COLUMN     "medicine_name" TEXT,
ADD COLUMN     "patient_id" TEXT,
ADD COLUMN     "prescribed_by" TEXT,
ADD COLUMN     "start_date" TIMESTAMP(3),
ADD COLUMN     "timing" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "code" DROP NOT NULL,
ALTER COLUMN "generic_name" DROP NOT NULL,
ALTER COLUMN "brand_name" DROP NOT NULL,
ALTER COLUMN "strength" DROP NOT NULL,
ALTER COLUMN "dosage_form" DROP NOT NULL,
ALTER COLUMN "route" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'active';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "backup_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "failed_totp_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_verification_time" TIMESTAMP(3),
ADD COLUMN     "totp_locked_until" TIMESTAMP(3),
ADD COLUMN     "totp_secret" TEXT,
ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "bed_bookings" (
    "id" TEXT NOT NULL,
    "booking_number" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "patient_name" TEXT NOT NULL,
    "patient_phone" TEXT NOT NULL,
    "patient_email" TEXT,
    "bed_type" "BedType" NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "chief_complaint" TEXT,
    "medical_condition" TEXT,
    "allocated_bed_id" TEXT,
    "admission_id" TEXT,
    "status" "BedBookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "admitted_at" TIMESTAMP(3),
    "expected_date" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bed_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_logs" (
    "id" TEXT NOT NULL,
    "medication_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "dose_time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduled_for" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taken_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
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

-- CreateTable
CREATE TABLE "notification_delivery_logs" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "failure_reason" TEXT,
    "sent_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_delivery_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_histories" (
    "id" TEXT NOT NULL,
    "reminder_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "action" "ReminderAction" NOT NULL,
    "action_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminder_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_notifications" (
    "id" TEXT NOT NULL,
    "reminder_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "channel" "ReminderNotificationChannel" NOT NULL,
    "status" "ReminderNotificationStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "scheduled_time" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminder_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bed_bookings_booking_number_key" ON "bed_bookings"("booking_number");

-- CreateIndex
CREATE UNIQUE INDEX "bed_bookings_admission_id_key" ON "bed_bookings"("admission_id");

-- CreateIndex
CREATE INDEX "bed_bookings_facility_id_status_idx" ON "bed_bookings"("facility_id", "status");

-- CreateIndex
CREATE INDEX "bed_bookings_status_expires_at_idx" ON "bed_bookings"("status", "expires_at");

-- CreateIndex
CREATE INDEX "bed_bookings_booking_number_idx" ON "bed_bookings"("booking_number");

-- CreateIndex
CREATE INDEX "medication_logs_patient_id_scheduled_for_idx" ON "medication_logs"("patient_id", "scheduled_for");

-- CreateIndex
CREATE INDEX "medication_logs_medication_id_idx" ON "medication_logs"("medication_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "notification_delivery_logs_status_idx" ON "notification_delivery_logs"("status");

-- CreateIndex
CREATE INDEX "notification_delivery_logs_channel_idx" ON "notification_delivery_logs"("channel");

-- CreateIndex
CREATE INDEX "notification_delivery_logs_recipient_idx" ON "notification_delivery_logs"("recipient");

-- CreateIndex
CREATE INDEX "notification_delivery_logs_created_at_idx" ON "notification_delivery_logs"("created_at");

-- CreateIndex
CREATE INDEX "reminder_histories_reminder_id_action_idx" ON "reminder_histories"("reminder_id", "action");

-- CreateIndex
CREATE INDEX "reminder_histories_patient_id_scheduled_for_idx" ON "reminder_histories"("patient_id", "scheduled_for");

-- CreateIndex
CREATE INDEX "reminder_histories_action_time_idx" ON "reminder_histories"("action_time");

-- CreateIndex
CREATE INDEX "reminder_notifications_patient_id_status_idx" ON "reminder_notifications"("patient_id", "status");

-- CreateIndex
CREATE INDEX "reminder_notifications_reminder_id_idx" ON "reminder_notifications"("reminder_id");

-- CreateIndex
CREATE INDEX "reminder_notifications_channel_status_idx" ON "reminder_notifications"("channel", "status");

-- CreateIndex
CREATE INDEX "reminder_notifications_created_at_idx" ON "reminder_notifications"("created_at");

-- CreateIndex
CREATE INDEX "medication_reminders_doctor_id_idx" ON "medication_reminders"("doctor_id");

-- CreateIndex
CREATE INDEX "medications_patient_id_status_idx" ON "medications"("patient_id", "status");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- AddForeignKey
ALTER TABLE "bed_bookings" ADD CONSTRAINT "bed_bookings_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bed_bookings" ADD CONSTRAINT "bed_bookings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bed_bookings" ADD CONSTRAINT "bed_bookings_allocated_bed_id_fkey" FOREIGN KEY ("allocated_bed_id") REFERENCES "beds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bed_bookings" ADD CONSTRAINT "bed_bookings_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_reminders" ADD CONSTRAINT "medication_reminders_prescription_item_id_fkey" FOREIGN KEY ("prescription_item_id") REFERENCES "prescription_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_reminders" ADD CONSTRAINT "medication_reminders_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_histories" ADD CONSTRAINT "reminder_histories_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "medication_reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_histories" ADD CONSTRAINT "reminder_histories_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_notifications" ADD CONSTRAINT "reminder_notifications_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "medication_reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_notifications" ADD CONSTRAINT "reminder_notifications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
