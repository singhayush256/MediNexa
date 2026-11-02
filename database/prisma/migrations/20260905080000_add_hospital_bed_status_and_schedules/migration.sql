-- CreateTable
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

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "hospital_bed_statuses_facility_id_key" ON "hospital_bed_statuses"("facility_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "hospital_bed_statuses_facility_id_status_idx" ON "hospital_bed_statuses"("facility_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "medication_schedules_patient_id_status_idx" ON "medication_schedules"("patient_id", "status");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'hospital_bed_statuses_facility_id_fkey'
    ) THEN
        ALTER TABLE "hospital_bed_statuses" ADD CONSTRAINT "hospital_bed_statuses_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'medication_schedules_reminder_id_fkey'
    ) THEN
        ALTER TABLE "medication_schedules" ADD CONSTRAINT "medication_schedules_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "medication_reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'medication_schedules_patient_id_fkey'
    ) THEN
        ALTER TABLE "medication_schedules" ADD CONSTRAINT "medication_schedules_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
