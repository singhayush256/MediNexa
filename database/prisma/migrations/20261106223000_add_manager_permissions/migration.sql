-- Additive, safe migration for MediNexa Manager Delegation & Permission Governance
-- Table: manager_permissions

CREATE TABLE IF NOT EXISTS "manager_permissions" (
    "id" TEXT NOT NULL,
    "manager_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "permission_code" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "granted_by_id" TEXT,
    "granted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manager_permissions_pkey" PRIMARY KEY ("id")
);

-- Unique constraint ensuring one permission record per (manager, permission_code)
CREATE UNIQUE INDEX IF NOT EXISTS "manager_permissions_manager_id_permission_code_key"
    ON "manager_permissions"("manager_id", "permission_code");

-- Facility index for multi-tenant queries
CREATE INDEX IF NOT EXISTS "manager_permissions_facility_id_idx"
    ON "manager_permissions"("facility_id");

-- Foreign key constraints with IF NOT EXISTS guards
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'manager_permissions_manager_id_fkey'
    ) THEN
        ALTER TABLE "manager_permissions"
            ADD CONSTRAINT "manager_permissions_manager_id_fkey"
            FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'manager_permissions_facility_id_fkey'
    ) THEN
        ALTER TABLE "manager_permissions"
            ADD CONSTRAINT "manager_permissions_facility_id_fkey"
            FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'manager_permissions_granted_by_id_fkey'
    ) THEN
        ALTER TABLE "manager_permissions"
            ADD CONSTRAINT "manager_permissions_granted_by_id_fkey"
            FOREIGN KEY ("granted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

