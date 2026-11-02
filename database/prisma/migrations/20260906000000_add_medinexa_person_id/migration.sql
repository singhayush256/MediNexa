-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "medinexa_person_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_medinexa_person_id_key" ON "users"("medinexa_person_id");
