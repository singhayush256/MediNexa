-- AlterTable
ALTER TABLE "medications" ALTER COLUMN "code" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "medinexa_person_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_medinexa_person_id_key" ON "users"("medinexa_person_id");
