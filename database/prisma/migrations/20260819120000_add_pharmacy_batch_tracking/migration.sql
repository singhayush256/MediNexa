-- AlterTable
ALTER TABLE "prescription_dispenses" ADD COLUMN "batch_number" TEXT,
ADD COLUMN "expiration_date" TIMESTAMP(3);
