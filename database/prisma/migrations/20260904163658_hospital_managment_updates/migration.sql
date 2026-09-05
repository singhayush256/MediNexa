-- CreateEnum
CREATE TYPE "RecommendationSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SampleType" AS ENUM ('BLOOD', 'URINE', 'STOOL', 'SPUTUM', 'SWAB', 'BIOPSY', 'OTHER');

-- CreateEnum
CREATE TYPE "ResultFlag" AS ENUM ('NORMAL', 'ABNORMAL', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DispatchPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CrewRole" AS ENUM ('DRIVER', 'EMT', 'PARAMEDIC', 'NURSE', 'DOCTOR');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SaaSInvoicePaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('ACTIVE_USERS', 'ACTIVE_BEDS', 'ACTIVE_DOCTORS', 'PATIENTS_MONTHLY', 'STORAGE_USAGE', 'API_REQUESTS');

-- CreateEnum
CREATE TYPE "AttachmentCategory" AS ENUM ('LAB_REPORT', 'PRESCRIPTION', 'XRAY', 'MRI', 'CT_SCAN', 'ULTRASOUND', 'DISCHARGE_SUMMARY', 'PATIENT_ID_PROOF', 'INSURANCE_DOCUMENT', 'GENERAL_DOCUMENT');

-- CreateEnum
CREATE TYPE "TokenStatus" AS ENUM ('WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TokenPriority" AS ENUM ('NORMAL', 'URGENT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "TriageLevel" AS ENUM ('ESI_1', 'ESI_2', 'ESI_3', 'ESI_4', 'ESI_5');

-- CreateEnum
CREATE TYPE "ArrivalMode" AS ENUM ('AMBULANCE', 'WALK_IN', 'REFERRAL');

-- CreateEnum
CREATE TYPE "EmergencyVisitStatus" AS ENUM ('WAITING_TRIAGE', 'TRIAGED', 'WAITING_DOCTOR', 'IN_TREATMENT', 'ADMITTED', 'DISCHARGED', 'TRANSFERRED', 'DECEASED');

-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('MORNING', 'EVENING', 'NIGHT');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MedicationStatus" AS ENUM ('SCHEDULED', 'ADMINISTERED', 'MISSED', 'REFUSED', 'HELD', 'PRESCRIBED', 'DISPENSED', 'PARTIALLY_DISPENSED', 'CANCELLED', 'RETURNED');

-- CreateEnum
CREATE TYPE "ClearanceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DischargeStatus" AS ENUM ('DRAFT', 'PENDING_CLEARANCE', 'READY_FOR_DISCHARGE', 'DISCHARGED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'WAITING', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('DOCTOR', 'PATIENT');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('SEPSIS_RISK', 'ABNORMAL_VITALS', 'DRUG_INTERACTION', 'ALLERGY_CONFLICT', 'CRITICAL_LAB', 'READMISSION_RISK', 'FALL_RISK');

-- CreateEnum
CREATE TYPE "PredictionType" AS ENUM ('BED_OCCUPANCY', 'OPD_LOAD', 'ICU_CAPACITY', 'DISCHARGE_FORECAST', 'EMERGENCY_SURGE');

-- CreateEnum
CREATE TYPE "ImagingOrderStatus" AS ENUM ('ORDERED', 'SCHEDULED', 'IN_PROCESS', 'COMPLETED', 'REPORTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RadiologyOrderStatus" AS ENUM ('ORDERED', 'SCHEDULED', 'IN_PROGRESS', 'IMAGE_ACQUIRED', 'REPORTED', 'VERIFIED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ImagingModality" AS ENUM ('XRAY', 'CT', 'MRI', 'ULTRASOUND', 'MAMMOGRAPHY', 'PET_CT', 'FLUOROSCOPY', 'DEXA', 'PET', 'ECG', 'ECHO', 'OTHER');

-- CreateEnum
CREATE TYPE "FindingSeverity" AS ENUM ('NORMAL', 'ABNORMAL', 'CRITICAL');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('PURCHASE', 'DISPENSE', 'RETURN', 'ADJUSTMENT', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DrugCategory" AS ENUM ('ANTIBIOTIC', 'ANALGESIC', 'ANTIPYRETIC', 'CARDIOVASCULAR', 'ONCOLOGY', 'CONTROLLED_SUBSTANCE', 'VACCINE', 'DERMATOLOGICAL', 'OPHTHALMIC', 'OTHER');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'QUARANTINED', 'EXPIRED', 'RECALLED', 'EXHAUSTED');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SurgeryStatus" AS ENUM ('SCHEDULED', 'PRE_OP', 'IN_PROGRESS', 'RECOVERY', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "SurgeryPriority" AS ENUM ('ELECTIVE', 'URGENT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "OtRoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "AnesthesiaType" AS ENUM ('GENERAL', 'SPINAL', 'EPIDURAL', 'LOCAL', 'SEDATION', 'COMBINED', 'NONE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'GENERATED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'REFUNDED', 'FINALIZED', 'VOID', 'VOIDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'UPI', 'NET_BANKING', 'CHEQUE', 'INSURANCE');

-- CreateEnum
CREATE TYPE "RevenueCategory" AS ENUM ('OPD', 'IPD', 'LAB', 'PHARMACY', 'RADIOLOGY', 'EMERGENCY', 'TELEMEDICINE', 'OTHER');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'PREAUTH_PENDING', 'PREAUTH_APPROVED', 'PREAUTH_REJECTED', 'CLAIM_SUBMITTED', 'SUBMITTED', 'UNDER_REVIEW', 'QUERY_RAISED', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'SETTLED', 'PAID');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('CASHLESS', 'REIMBURSEMENT');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('CASHLESS', 'REIMBURSEMENT');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'LEAVE');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'GENERATED', 'APPROVED', 'PAID', 'PROCESSING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "ProcurementStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ORDERED', 'RECEIVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "RFQStatus" AS ENUM ('OPEN', 'SUBMITTED', 'EVALUATED', 'AWARDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProcurementPOStatus" AS ENUM ('DRAFT', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'UNDER_MAINTENANCE', 'RETIRED');

-- CreateEnum
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertCategory" AS ENUM ('FINANCIAL', 'CLINICAL', 'OPERATIONAL', 'COMPLIANCE', 'SECURITY');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "MetricPeriod" AS ENUM ('TODAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'SENTINEL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'CLOSED');

-- CreateEnum
CREATE TYPE "InfectionSeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CAPAStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "BloodComponent" AS ENUM ('WHOLE_BLOOD', 'PACKED_RBC', 'PLATELETS', 'FFP', 'CRYOPRECIPITATE');

-- CreateEnum
CREATE TYPE "BloodUnitStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'ISSUED', 'TRANSFUSED', 'EXPIRED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('REGISTERED', 'SCREENING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TransfusionStatus" AS ENUM ('REQUESTED', 'CROSSMATCH_PENDING', 'APPROVED', 'ISSUED', 'TRANSFUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE', 'EQUITY');

-- CreateEnum
CREATE TYPE "AbdmConsentStatus" AS ENUM ('REQUESTED', 'APPROVED', 'DENIED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AbdmRecordType" AS ENUM ('OPD', 'IPD', 'LAB', 'RADIOLOGY', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'TELEMEDICINE');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('ICU_MONITOR', 'ECG_MONITOR', 'SPO2_MONITOR', 'BLOOD_PRESSURE_MONITOR', 'GLUCOSE_MONITOR', 'WEARABLE', 'VENTILATOR', 'INFUSION_PUMP', 'OTHER');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'MAINTENANCE', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "ClinicalRuleType" AS ENUM ('DRUG_INTERACTION', 'DRUG_ALLERGY', 'DUPLICATE_THERAPY', 'PREGNANCY_WARNING', 'RENAL_ADJUSTMENT', 'AGE_RESTRICTION', 'CONTRAINDICATION', 'DOSING_WARNING');

-- CreateEnum
CREATE TYPE "IcuPatientStatus" AS ENUM ('ADMITTED', 'STABLE', 'CRITICAL', 'IMPROVING', 'DETERIORATING', 'DISCHARGED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VentilatorStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "CriticalAlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RevenueStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "ReceivableType" AS ENUM ('PATIENT', 'INSURANCE', 'CORPORATE');

-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('OPEN', 'FOLLOW_UP', 'PROMISE_TO_PAY', 'RECOVERED', 'BAD_DEBT');

-- AlterEnum
ALTER TYPE "AmbulanceStatus" ADD VALUE 'TRANSPORTING';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DispatchStatus" ADD VALUE 'PENDING';
ALTER TYPE "DispatchStatus" ADD VALUE 'AT_SCENE';
ALTER TYPE "DispatchStatus" ADD VALUE 'TRANSPORTING';

-- AlterEnum
ALTER TYPE "DispenseStatus" ADD VALUE 'RETURNED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LabOrderStatus" ADD VALUE 'SAMPLE_COLLECTED';
ALTER TYPE "LabOrderStatus" ADD VALUE 'IN_PROCESS';
ALTER TYPE "LabOrderStatus" ADD VALUE 'VERIFIED';
ALTER TYPE "LabOrderStatus" ADD VALUE 'REPORTED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NoteStatus" ADD VALUE 'REVIEWED';
ALTER TYPE "NoteStatus" ADD VALUE 'FINALIZED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'APPOINTMENT';
ALTER TYPE "NotificationType" ADD VALUE 'PRESCRIPTION';
ALTER TYPE "NotificationType" ADD VALUE 'LAB_REPORT';
ALTER TYPE "NotificationType" ADD VALUE 'BILLING';
ALTER TYPE "NotificationType" ADD VALUE 'ADMISSION';
ALTER TYPE "NotificationType" ADD VALUE 'DISCHARGE';
ALTER TYPE "NotificationType" ADD VALUE 'REMINDER';

-- DropForeignKey
ALTER TABLE "ambulance_dispatches" DROP CONSTRAINT "ambulance_dispatches_driver_id_fkey";

-- DropForeignKey
ALTER TABLE "ambulance_dispatches" DROP CONSTRAINT "ambulance_dispatches_emergency_request_id_fkey";

-- DropForeignKey
ALTER TABLE "lab_orders" DROP CONSTRAINT "lab_orders_encounter_id_fkey";

-- AlterTable
ALTER TABLE "ambulance_dispatches" ADD COLUMN     "arrived_at_scene_at" TIMESTAMP(3),
ADD COLUMN     "arrived_hospital_at" TIMESTAMP(3),
ADD COLUMN     "departed_scene_at" TIMESTAMP(3),
ADD COLUMN     "destination_facility_id" TEXT,
ADD COLUMN     "dispatched_at" TIMESTAMP(3),
ADD COLUMN     "emergency_type" TEXT,
ADD COLUMN     "patient_name" TEXT,
ADD COLUMN     "patient_phone" TEXT,
ADD COLUMN     "pickup_address" TEXT,
ADD COLUMN     "pickup_latitude" DOUBLE PRECISION,
ADD COLUMN     "pickup_longitude" DOUBLE PRECISION,
ADD COLUMN     "priority" "DispatchPriority" NOT NULL DEFAULT 'HIGH',
ALTER COLUMN "emergency_request_id" DROP NOT NULL,
ALTER COLUMN "driver_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ambulances" ADD COLUMN     "assigned_crew" TEXT,
ADD COLUMN     "driver_id" TEXT;

-- AlterTable
ALTER TABLE "lab_orders" ADD COLUMN     "admission_id" TEXT,
ALTER COLUMN "encounter_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "plan_code" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "description" TEXT,
    "monthly_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "yearly_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "max_users" INTEGER NOT NULL DEFAULT 10,
    "max_beds" INTEGER NOT NULL DEFAULT 25,
    "max_doctors" INTEGER NOT NULL DEFAULT 5,
    "max_patients_per_month" INTEGER NOT NULL DEFAULT 500,
    "max_storage_gb" INTEGER NOT NULL DEFAULT 50,
    "features" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_subscriptions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "current_period_start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "stripe_subscription_id" TEXT,
    "razorpay_subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_metrics" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "metric_type" "MetricType" NOT NULL,
    "metric_value" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas_invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "invoice_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "payment_status" "SaaSInvoicePaymentStatus" NOT NULL DEFAULT 'PENDING',
    "hosted_invoice_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas_payment_transactions" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_provider" TEXT NOT NULL DEFAULT 'STRIPE',
    "transaction_reference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saas_payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "feature_code" TEXT NOT NULL,
    "feature_name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trial_accounts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "trial_start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trial_end_date" TIMESTAMP(3) NOT NULL,
    "conversion_status" TEXT NOT NULL DEFAULT 'TRIAL_ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trial_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_test_items" (
    "id" TEXT NOT NULL,
    "lab_order_id" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'BIOCHEMISTRY',
    "status" "LabOrderStatus" NOT NULL DEFAULT 'ORDERED',
    "result_value" TEXT,
    "reference_range" TEXT,
    "unit" TEXT,
    "flag" "ResultFlag" NOT NULL DEFAULT 'NORMAL',
    "verified_by_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_test_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sample_collections" (
    "id" TEXT NOT NULL,
    "lab_order_id" TEXT NOT NULL,
    "collected_by_id" TEXT NOT NULL,
    "sampleType" "SampleType" NOT NULL DEFAULT 'BLOOD',
    "barcode" TEXT NOT NULL,
    "collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sample_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ambulance_crews" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "ambulance_id" TEXT,
    "employee_id" TEXT,
    "name" TEXT NOT NULL,
    "role" "CrewRole" NOT NULL DEFAULT 'PARAMEDIC',
    "certifications" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ambulance_crews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_calls" (
    "id" TEXT NOT NULL,
    "call_number" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "caller_name" TEXT NOT NULL,
    "caller_phone" TEXT NOT NULL,
    "emergency_type" TEXT NOT NULL,
    "incident_location" TEXT NOT NULL,
    "priority" "DispatchPriority" NOT NULL DEFAULT 'HIGH',
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ambulance_trips" (
    "id" TEXT NOT NULL,
    "trip_number" TEXT NOT NULL,
    "ambulance_id" TEXT NOT NULL,
    "dispatch_id" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),
    "distance_km" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "duration_minutes" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "outcome" TEXT DEFAULT 'PATIENT_DELIVERED_TO_ER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ambulance_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleet_maintenances" (
    "id" TEXT NOT NULL,
    "maintenance_number" TEXT NOT NULL,
    "ambulance_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "maintenance_type" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_date" TIMESTAMP(3),
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fleet_maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_patients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_bookings" (
    "id" TEXT NOT NULL,
    "booking_number" TEXT NOT NULL,
    "guest_patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "department_id" TEXT,
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'REQUESTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'GUEST_BOOKING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_attachments" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "public_url" TEXT,
    "checksum" TEXT,
    "category" "AttachmentCategory" NOT NULL DEFAULT 'GENERAL_DOCUMENT',
    "patient_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "uploaded_by_id" TEXT NOT NULL,
    "encounter_id" TEXT,
    "admission_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachment_audits" (
    "id" TEXT NOT NULL,
    "attachment_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_role" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachment_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opd_tokens" (
    "id" TEXT NOT NULL,
    "token_number" TEXT NOT NULL,
    "queue_number" INTEGER NOT NULL,
    "patient_id" TEXT,
    "patient_name" TEXT NOT NULL,
    "patient_phone" TEXT,
    "doctor_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "department_id" TEXT,
    "status" "TokenStatus" NOT NULL DEFAULT 'WAITING',
    "priority" "TokenPriority" NOT NULL DEFAULT 'NORMAL',
    "estimated_wait_minutes" INTEGER NOT NULL DEFAULT 15,
    "notes" TEXT,
    "called_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opd_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_visits" (
    "id" TEXT NOT NULL,
    "visit_number" TEXT NOT NULL,
    "patient_id" TEXT,
    "patient_name" TEXT NOT NULL,
    "patient_phone" TEXT,
    "facility_id" TEXT NOT NULL,
    "doctor_id" TEXT,
    "triage_level" "TriageLevel",
    "chief_complaint" TEXT NOT NULL,
    "arrival_mode" "ArrivalMode" NOT NULL DEFAULT 'WALK_IN',
    "status" "EmergencyVisitStatus" NOT NULL DEFAULT 'WAITING_TRIAGE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "triage_assessments" (
    "id" TEXT NOT NULL,
    "emergency_visit_id" TEXT NOT NULL,
    "nurse_id" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "pulse" INTEGER,
    "respiratory_rate" INTEGER,
    "oxygen_saturation" INTEGER,
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "pain_score" INTEGER,
    "notes" TEXT,
    "assessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "triage_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nursing_shifts" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "ward_id" TEXT,
    "nurse_id" TEXT NOT NULL,
    "shift_type" "ShiftType" NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),
    "handover_notes" TEXT,
    "status" "ShiftStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nursing_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_administrations" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "prescription_item_id" TEXT,
    "medication_name" TEXT NOT NULL,
    "is_controlled" BOOLEAN NOT NULL DEFAULT false,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "administered_time" TIMESTAMP(3),
    "administered_by_id" TEXT NOT NULL,
    "witness_nurse_id" TEXT,
    "dose_given" TEXT NOT NULL,
    "status" "MedicationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_administrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vitals_flowsheets" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "nurse_id" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "pulse" INTEGER,
    "respiratory_rate" INTEGER,
    "oxygen_saturation" INTEGER,
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "blood_glucose" DOUBLE PRECISION,
    "pain_score" INTEGER,
    "notes" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vitals_flowsheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_clearances" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "department_type" TEXT NOT NULL,
    "status" "ClearanceStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_clearances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discharge_summaries" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "attending_doctor_id" TEXT NOT NULL,
    "chief_complaint" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "treatment_provided" TEXT NOT NULL,
    "procedures_performed" TEXT,
    "medications_on_discharge" TEXT NOT NULL,
    "follow_up_instructions" TEXT,
    "discharge_condition" TEXT,
    "discharge_date" TIMESTAMP(3),
    "status" "DischargeStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discharge_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telemedicine_sessions" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "facility_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "room_token" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actual_start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telemedicine_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telemedicine_participants" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ParticipantRole" NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "device_info" TEXT,

    CONSTRAINT "telemedicine_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telemedicine_chat_messages" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "sender_role" "ParticipantRole" NOT NULL,
    "message" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telemedicine_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telemedicine_recording_metadata" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size_bytes" INTEGER,
    "duration_seconds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telemedicine_recording_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_alerts" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "doctor_id" TEXT,
    "encounter_id" TEXT,
    "medication_order_id" TEXT,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by_id" TEXT,
    "resolved_at" TIMESTAMP(3),
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_by_id" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_risk_scores" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "overall_risk_score" INTEGER NOT NULL DEFAULT 10,
    "sepsis_risk" INTEGER NOT NULL DEFAULT 10,
    "readmission_risk" INTEGER NOT NULL DEFAULT 15,
    "fall_risk" INTEGER NOT NULL DEFAULT 10,
    "risk_factors" TEXT,
    "evaluated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_risk_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_predictions" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "type" "PredictionType" NOT NULL,
    "predicted_value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "confidence_percentage" INTEGER NOT NULL DEFAULT 90,
    "timeframe" TEXT NOT NULL DEFAULT 'NEXT_24_HOURS',
    "notes" TEXT,
    "predicted_for_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospital_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_recommendations" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "category" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "rationale" TEXT,
    "is_accepted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_generated_summaries" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SOAP_NOTE',
    "input_data" TEXT NOT NULL,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "generated_content" TEXT NOT NULL,
    "status" "NoteStatus" NOT NULL DEFAULT 'DRAFT',
    "time_saved_minutes" INTEGER NOT NULL DEFAULT 15,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_generated_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "doctor_id" TEXT NOT NULL,
    "modality" "ImagingModality" NOT NULL DEFAULT 'XRAY',
    "study_name" TEXT,
    "clinical_indication" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'ROUTINE',
    "status" "RadiologyOrderStatus" NOT NULL DEFAULT 'ORDERED',
    "scheduled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radiology_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imaging_orders" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "doctor_id" TEXT NOT NULL,
    "modality" "ImagingModality" NOT NULL DEFAULT 'XRAY',
    "study_name" TEXT NOT NULL,
    "clinical_indication" TEXT,
    "status" "ImagingOrderStatus" NOT NULL DEFAULT 'ORDERED',
    "scheduled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imaging_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imaging_studies" (
    "id" TEXT NOT NULL,
    "radiology_order_id" TEXT,
    "imaging_order_id" TEXT,
    "accession_number" TEXT NOT NULL,
    "study_uid" TEXT,
    "dicom_study_uid" TEXT,
    "modality" "ImagingModality" NOT NULL DEFAULT 'XRAY',
    "performed_at" TIMESTAMP(3),
    "study_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technician_id" TEXT,
    "uploaded_by_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACQUIRED',
    "image_count" INTEGER NOT NULL DEFAULT 1,
    "storage_provider" TEXT NOT NULL DEFAULT 'LOCAL_PACS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imaging_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dicom_series" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "series_uid" TEXT NOT NULL,
    "series_description" TEXT,
    "image_count" INTEGER NOT NULL DEFAULT 1,
    "storage_location" TEXT,
    "thumbnail_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dicom_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imaging_files" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL DEFAULT 1024,
    "mime_type" TEXT NOT NULL DEFAULT 'image/png',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imaging_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_reports" (
    "id" TEXT NOT NULL,
    "study_id" TEXT,
    "imaging_order_id" TEXT,
    "radiologist_id" TEXT,
    "radiologist_user_id" TEXT,
    "findings" TEXT NOT NULL,
    "impression" TEXT NOT NULL,
    "recommendation" TEXT,
    "severity" "FindingSeverity" NOT NULL DEFAULT 'NORMAL',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "ai_prelim_findings" TEXT,
    "ai_abnormality_score" DOUBLE PRECISION,
    "is_signed" BOOLEAN NOT NULL DEFAULT false,
    "signed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radiology_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "critical_finding_alerts" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "study_id" TEXT,
    "report_id" TEXT,
    "severity" "FindingSeverity" NOT NULL DEFAULT 'CRITICAL',
    "alert_message" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_by_id" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "critical_finding_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_orders" (
    "id" TEXT NOT NULL,
    "prescription_id" TEXT,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "status" "MedicationStatus" NOT NULL DEFAULT 'PRESCRIBED',
    "total_items" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_items" (
    "id" TEXT NOT NULL,
    "medication_order_id" TEXT NOT NULL,
    "medicine_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "dispensed_quantity" INTEGER NOT NULL DEFAULT 0,
    "status" "MedicationStatus" NOT NULL DEFAULT 'PRESCRIBED',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_inventories" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "medicine_name" TEXT NOT NULL,
    "generic_name" TEXT,
    "batch_number" TEXT NOT NULL,
    "manufacturer" TEXT,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "reorder_level" INTEGER NOT NULL DEFAULT 10,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "purchase_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "selling_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" TEXT NOT NULL,
    "inventory_id" TEXT NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "performed_by_id" TEXT NOT NULL,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_masters" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "generic_name" TEXT,
    "strength" TEXT,
    "form" TEXT,
    "manufacturer" TEXT,
    "hsn_code" TEXT,
    "gst_percentage" DOUBLE PRECISION NOT NULL DEFAULT 18.0,
    "category" "DrugCategory" NOT NULL DEFAULT 'OTHER',
    "unit_of_measure" TEXT NOT NULL DEFAULT 'TABLET',
    "is_controlled" BOOLEAN NOT NULL DEFAULT false,
    "reorder_level" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drug_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_batches" (
    "id" TEXT NOT NULL,
    "drug_master_id" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "manufacturer" TEXT,
    "supplier" TEXT,
    "manufacturing_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "unit_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drug_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_dispense_records" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "prescription_id" TEXT,
    "patient_id" TEXT NOT NULL,
    "dispensed_by_id" TEXT NOT NULL,
    "witness_nurse_id" TEXT,
    "status" "DispenseStatus" NOT NULL DEFAULT 'DISPENSED',
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_dispense_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispense_line_items" (
    "id" TEXT NOT NULL,
    "dispense_id" TEXT NOT NULL,
    "drug_master_id" TEXT NOT NULL,
    "drug_batch_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "dispense_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "po_number" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "drug_master_id" TEXT NOT NULL,
    "quantity_ordered" INTEGER NOT NULL,
    "quantity_received" INTEGER NOT NULL DEFAULT 0,
    "unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipt_notes" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "grn_number" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "received_by_id" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goods_receipt_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipt_items" (
    "id" TEXT NOT NULL,
    "grn_id" TEXT NOT NULL,
    "drug_master_id" TEXT NOT NULL,
    "drug_batch_id" TEXT NOT NULL,
    "quantity_received" INTEGER NOT NULL,
    "unit_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "goods_receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controlled_substance_audits" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "drug_master_id" TEXT NOT NULL,
    "drug_batch_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "action" TEXT NOT NULL DEFAULT 'DISPENSE',
    "quantity" INTEGER NOT NULL,
    "performed_by_id" TEXT NOT NULL,
    "witness_nurse_id" TEXT,
    "verification_status" TEXT NOT NULL DEFAULT 'VERIFIED',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "controlled_substance_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_theatres" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "OtRoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "equipment_details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operation_theatres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surgery_schedules" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "ot_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "lead_surgeon_id" TEXT NOT NULL,
    "anesthetist_id" TEXT,
    "procedure_name" TEXT NOT NULL,
    "priority" "SurgeryPriority" NOT NULL DEFAULT 'ELECTIVE',
    "status" "SurgeryStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_start_time" TIMESTAMP(3) NOT NULL,
    "scheduled_end_time" TIMESTAMP(3) NOT NULL,
    "actual_start_time" TIMESTAMP(3),
    "actual_end_time" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surgery_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surgical_team_members" (
    "id" TEXT NOT NULL,
    "surgery_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "surgical_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anesthesia_records" (
    "id" TEXT NOT NULL,
    "surgery_id" TEXT NOT NULL,
    "anesthetist_id" TEXT NOT NULL,
    "anesthesia_type" "AnesthesiaType" NOT NULL DEFAULT 'GENERAL',
    "pre_op_assessment" TEXT,
    "intra_op_vitals" TEXT,
    "complications" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anesthesia_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surgical_checklists" (
    "id" TEXT NOT NULL,
    "surgery_id" TEXT NOT NULL,
    "sign_in_completed" BOOLEAN NOT NULL DEFAULT false,
    "time_out_completed" BOOLEAN NOT NULL DEFAULT false,
    "sign_out_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_by_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surgical_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "implant_usages" (
    "id" TEXT NOT NULL,
    "surgery_id" TEXT NOT NULL,
    "implant_name" TEXT NOT NULL,
    "serial_number" TEXT,
    "manufacturer" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "implant_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surgery_notes" (
    "id" TEXT NOT NULL,
    "surgery_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "pre_op_diagnosis" TEXT,
    "post_op_diagnosis" TEXT,
    "procedure_description" TEXT NOT NULL,
    "findings" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surgery_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_operative_notes" (
    "id" TEXT NOT NULL,
    "surgery_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "pacu_status" TEXT NOT NULL DEFAULT 'STABLE',
    "recovery_instructions" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_operative_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "encounter_id" TEXT,
    "facility_id" TEXT NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "amount_paid" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "balance_due" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "invoice_status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_line_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "tax_percent" DOUBLE PRECISION NOT NULL DEFAULT 18.0,
    "discount_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "billing_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "finance_invoice_id" TEXT,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "transaction_reference" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collected_by_id" TEXT,
    "received_by_id" TEXT,
    "received_by" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_providers" (
    "id" TEXT NOT NULL,
    "provider_code" TEXT,
    "provider_name" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "code" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "address" TEXT,
    "contact_person" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contact_details" TEXT,
    "claim_email" TEXT,
    "policy_validation_rules" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_insurances" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "insurance_provider_id" TEXT NOT NULL,
    "policy_number" TEXT NOT NULL,
    "member_id" TEXT,
    "coverage_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_till" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_insurances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_policies" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "insurance_provider_id" TEXT NOT NULL,
    "policy_number" TEXT NOT NULL,
    "member_id" TEXT,
    "coverage_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "utilized_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "insurance_type" "InsuranceType" NOT NULL DEFAULT 'CASHLESS',
    "policy_status" "PolicyStatus" NOT NULL DEFAULT 'ACTIVE',
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_till" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_claims" (
    "id" TEXT NOT NULL,
    "claim_number" TEXT NOT NULL,
    "invoice_id" TEXT,
    "provider_id" TEXT,
    "insurance_provider_id" TEXT,
    "patient_insurance_id" TEXT,
    "policy_id" TEXT,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "facility_id" TEXT,
    "claim_type" "ClaimType" NOT NULL DEFAULT 'CASHLESS',
    "amount_claimed" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "amount_approved" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "amount_paid" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_claim_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "approved_amount" DOUBLE PRECISION DEFAULT 0.0,
    "patient_payable_amount" DOUBLE PRECISION DEFAULT 0.0,
    "claim_amount" DOUBLE PRECISION,
    "rejected_amount" DOUBLE PRECISION DEFAULT 0.0,
    "status" "ClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "claim_status" "ClaimStatus" DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "submission_date" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "approval_date" TIMESTAMP(3),
    "settled_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_documents" (
    "id" TEXT NOT NULL,
    "claim_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "file_attachment_id" TEXT,
    "document_url" TEXT,
    "uploaded_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_queries" (
    "id" TEXT NOT NULL,
    "claim_id" TEXT NOT NULL,
    "query_text" TEXT NOT NULL,
    "response_text" TEXT,
    "raised_by" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claim_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_settlements" (
    "id" TEXT NOT NULL,
    "claim_id" TEXT NOT NULL,
    "approved_amount" DOUBLE PRECISION NOT NULL,
    "settlement_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_reference" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_audit_logs" (
    "id" TEXT NOT NULL,
    "claim_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performed_by_id" TEXT NOT NULL,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "user_id" TEXT,
    "employee_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "joining_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employment_type" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "reporting_manager_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_profiles" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "employee_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "joining_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employee_status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emergency_contact" TEXT,
    "reporting_manager_id" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT,
    "employee_profile_id" TEXT,
    "facility_id" TEXT,
    "attendance_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_in_time" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "check_out_time" TIMESTAMP(3),
    "working_hours" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_hours" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "attendance_status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_assignments" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "shift_type" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "assigned_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_schedules" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "shift_name" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "department" TEXT NOT NULL,
    "assigned_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT,
    "employee_profile_id" TEXT,
    "leave_type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "leave_status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_records" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "payroll_month" TEXT NOT NULL,
    "basic_salary" DOUBLE PRECISION NOT NULL,
    "allowances" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "net_salary" DOUBLE PRECISION NOT NULL,
    "payroll_status" "PayrollStatus" NOT NULL DEFAULT 'GENERATED',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential_records" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "credential_type" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "verification_status" TEXT NOT NULL DEFAULT 'VERIFIED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credential_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_reviews" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "review_period" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "strengths" TEXT NOT NULL,
    "improvements" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_structures" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "basic_salary" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "hra" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "allowances" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "pf_contribution" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "esi_contribution" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "net_salary" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_runs" (
    "id" TEXT NOT NULL,
    "payroll_month" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "total_employees" INTEGER NOT NULL DEFAULT 0,
    "total_payroll_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "generated_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslips" (
    "id" TEXT NOT NULL,
    "payroll_run_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "gross_salary" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "net_salary" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "item_code" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit_of_measure" TEXT NOT NULL DEFAULT 'UNIT',
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "minimum_stock" INTEGER NOT NULL DEFAULT 10,
    "reorder_level" INTEGER NOT NULL DEFAULT 20,
    "unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "location" TEXT,
    "facility_id" TEXT NOT NULL,
    "status" "InventoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_inventory_transactions" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "previous_stock" INTEGER NOT NULL,
    "new_stock" INTEGER NOT NULL,
    "performed_by_id" TEXT NOT NULL,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospital_inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_vendors" (
    "id" TEXT NOT NULL,
    "vendor_code" TEXT NOT NULL,
    "vendor_name" TEXT,
    "company_name" TEXT,
    "contact_person" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "gst_number" TEXT,
    "pan_number" TEXT,
    "address" TEXT,
    "vendor_status" "VendorStatus" NOT NULL DEFAULT 'ACTIVE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.8,
    "delivery_score" DOUBLE PRECISION NOT NULL DEFAULT 95.0,
    "quality_score" DOUBLE PRECISION NOT NULL DEFAULT 98.0,
    "response_score" DOUBLE PRECISION NOT NULL DEFAULT 92.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supply_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requisitions" (
    "id" TEXT NOT NULL,
    "requisition_number" TEXT NOT NULL,
    "department_id" TEXT,
    "department" TEXT,
    "facility_id" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "status" "ProcurementStatus" NOT NULL DEFAULT 'DRAFT',
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "items" TEXT,
    "approved_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requisition_items" (
    "id" TEXT NOT NULL,
    "requisition_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "estimated_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_requisition_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests_for_quotation" (
    "id" TEXT NOT NULL,
    "rfq_number" TEXT NOT NULL,
    "requisition_id" TEXT NOT NULL,
    "vendor_id" TEXT,
    "status" "RFQStatus" NOT NULL DEFAULT 'OPEN',
    "submission_deadline" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_for_quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_responses" (
    "id" TEXT NOT NULL,
    "rfq_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "quoted_amount" DOUBLE PRECISION NOT NULL,
    "delivery_days" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotation_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_orders" (
    "id" TEXT NOT NULL,
    "po_number" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "requisition_id" TEXT,
    "rfq_id" TEXT,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "ProcurementStatus" NOT NULL DEFAULT 'ORDERED',
    "created_by_id" TEXT,
    "approved_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_order_line_items" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procurement_order_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipts" (
    "id" TEXT NOT NULL,
    "grn_number" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "received_by_id" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goods_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipt_line_items" (
    "id" TEXT NOT NULL,
    "goods_receipt_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity_received" INTEGER NOT NULL,
    "batch_number" TEXT,
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goods_receipt_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "invoice_amount" DOUBLE PRECISION NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "three_way_match_status" TEXT NOT NULL DEFAULT 'MATCHED',
    "match_remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_payments" (
    "id" TEXT NOT NULL,
    "payment_reference" TEXT NOT NULL,
    "vendor_invoice_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" TEXT NOT NULL DEFAULT 'NEFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_purchase_orders" (
    "id" TEXT NOT NULL,
    "po_number" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "requisition_id" TEXT,
    "facility_id" TEXT NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_delivery_date" TIMESTAMP(3),
    "status" "ProcurementPOStatus" NOT NULL DEFAULT 'DRAFT',
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_goods_receipts" (
    "id" TEXT NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "received_by_id" TEXT NOT NULL,
    "received_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospital_goods_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_assets" (
    "id" TEXT NOT NULL,
    "asset_code" TEXT NOT NULL,
    "asset_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "department_id" TEXT,
    "purchase_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "warranty_expiry" TIMESTAMP(3) NOT NULL,
    "maintenance_frequency" TEXT NOT NULL DEFAULT 'QUARTERLY',
    "current_location" TEXT NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "purchase_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_tickets" (
    "id" TEXT NOT NULL,
    "ticket_number" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "issue_description" TEXT NOT NULL,
    "priority" "MaintenancePriority" NOT NULL DEFAULT 'MEDIUM',
    "assigned_to" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution_notes" TEXT,
    "reported_by_id" TEXT NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_snapshots" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "metric_name" TEXT,
    "metric_value" DOUBLE PRECISION,
    "period" "MetricPeriod" DEFAULT 'TODAY',
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revenue_today" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "revenue_month" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "opd_patients" INTEGER NOT NULL DEFAULT 0,
    "ipd_patients" INTEGER NOT NULL DEFAULT 0,
    "occupancy_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "bed_utilization" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "average_los" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "patient_satisfaction" DOUBLE PRECISION NOT NULL DEFAULT 98.5,
    "emergency_cases" INTEGER NOT NULL DEFAULT 0,
    "lab_orders" INTEGER NOT NULL DEFAULT 0,
    "pharmacy_sales" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "telemedicine_sessions" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_widgets" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "widget_name" TEXT NOT NULL,
    "widget_type" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_alerts" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'HIGH',
    "category" "AlertCategory" NOT NULL DEFAULT 'OPERATIONAL',
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "acknowledged_by_id" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "resolved_by_id" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infection_cases" (
    "id" TEXT NOT NULL,
    "case_number" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "facility_id" TEXT NOT NULL,
    "infection_type" TEXT NOT NULL,
    "infection_source" TEXT NOT NULL DEFAULT 'HOSPITAL_ACQUIRED',
    "detection_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" "InfectionSeverity" NOT NULL DEFAULT 'MODERATE',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "reported_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "infection_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infection_investigations" (
    "id" TEXT NOT NULL,
    "infection_case_id" TEXT NOT NULL,
    "root_cause_analysis" TEXT NOT NULL,
    "corrective_action" TEXT NOT NULL,
    "preventive_action" TEXT NOT NULL,
    "assigned_to_id" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "infection_investigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_reports" (
    "id" TEXT NOT NULL,
    "incident_number" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "reported_by_id" TEXT NOT NULL,
    "incident_type" TEXT NOT NULL,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "incident_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_audits" (
    "id" TEXT NOT NULL,
    "audit_number" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "audit_name" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "auditor_id" TEXT NOT NULL,
    "audit_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 95.0,
    "findings" TEXT NOT NULL,
    "recommendations" TEXT,
    "status" "AuditStatus" NOT NULL DEFAULT 'COMPLETED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capa_records" (
    "id" TEXT NOT NULL,
    "capa_number" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "audit_id" TEXT,
    "incident_id" TEXT,
    "corrective_action" TEXT NOT NULL,
    "preventive_action" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "CAPAStatus" NOT NULL DEFAULT 'OPEN',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capa_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hand_hygiene_audits" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "observer_id" TEXT NOT NULL,
    "compliance_percentage" DOUBLE PRECISION NOT NULL DEFAULT 96.5,
    "observation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hand_hygiene_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_checklists" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "checklist_type" TEXT NOT NULL,
    "completed_by_id" TEXT NOT NULL,
    "completion_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'COMPLIANT',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_notifications" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_feedbacks" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "doctor_id" TEXT,
    "rating" INTEGER NOT NULL,
    "comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "phone" TEXT,
    "access_level" TEXT NOT NULL DEFAULT 'FULL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_devices" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "device_token" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'IOS',
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_goals" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "target_value" DOUBLE PRECISION NOT NULL,
    "current_value" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "unit" TEXT NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blood_donors" (
    "id" TEXT NOT NULL,
    "donor_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "blood_group" "BloodGroup" NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT NOT NULL DEFAULT 'OTHER',
    "address" TEXT,
    "last_donation_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ELIGIBLE',
    "facility_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blood_donors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blood_donations" (
    "id" TEXT NOT NULL,
    "donation_number" TEXT NOT NULL,
    "donor_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "donation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hemoglobin" DOUBLE PRECISION NOT NULL DEFAULT 13.5,
    "blood_pressure" TEXT,
    "weight" DOUBLE PRECISION,
    "status" "DonationStatus" NOT NULL DEFAULT 'COMPLETED',
    "infectious_screening" TEXT NOT NULL DEFAULT 'NEGATIVE',
    "screening_notes" TEXT,
    "collected_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blood_donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blood_inventory_units" (
    "id" TEXT NOT NULL,
    "unit_number" TEXT NOT NULL,
    "donation_id" TEXT,
    "facility_id" TEXT NOT NULL,
    "blood_group" "BloodGroup" NOT NULL,
    "component" "BloodComponent" NOT NULL DEFAULT 'PACKED_RBC',
    "volume_ml" DOUBLE PRECISION NOT NULL DEFAULT 350.0,
    "collection_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "storage_location" TEXT NOT NULL DEFAULT 'Refrigerator-A1',
    "status" "BloodUnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "reserved_for_request_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blood_inventory_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blood_requests" (
    "id" TEXT NOT NULL,
    "request_number" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "encounter_id" TEXT,
    "facility_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "blood_group" "BloodGroup" NOT NULL,
    "component" "BloodComponent" NOT NULL DEFAULT 'PACKED_RBC',
    "units_requested" INTEGER NOT NULL DEFAULT 1,
    "urgency" TEXT NOT NULL DEFAULT 'ROUTINE',
    "clinical_indication" TEXT,
    "status" "TransfusionStatus" NOT NULL DEFAULT 'REQUESTED',
    "required_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blood_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cross_match_records" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "compatibility" TEXT NOT NULL DEFAULT 'COMPATIBLE',
    "method" TEXT NOT NULL DEFAULT 'AHG_GEL_CARD',
    "performed_by_id" TEXT NOT NULL,
    "verified_by_id" TEXT,
    "notes" TEXT,
    "tested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cross_match_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfusion_records" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "administered_by_id" TEXT NOT NULL,
    "witness_nurse_id" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),
    "status" "TransfusionStatus" NOT NULL DEFAULT 'TRANSFUSED',
    "adverse_reaction" BOOLEAN NOT NULL DEFAULT false,
    "reaction_details" TEXT,
    "pre_vitals" TEXT,
    "post_vitals" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transfusion_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blood_discard_records" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "discard_reason" TEXT NOT NULL,
    "authorized_by_id" TEXT NOT NULL,
    "discarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blood_discard_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "encounter_id" TEXT,
    "appointment_id" TEXT,
    "facility_id" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "net_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "balance_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "invoice_status" "InvoiceStatus" NOT NULL DEFAULT 'GENERATED',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "category" "RevenueCategory" NOT NULL DEFAULT 'OTHER',
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_transactions" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "approved_by" TEXT,
    "approved_by_id" TEXT,
    "refunded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refund_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_ledgers" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "category" "RevenueCategory" NOT NULL DEFAULT 'OTHER',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "source_reference" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "budget_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "current_expense" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_ledger_accounts" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT,
    "account_code" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_type" "AccountType" NOT NULL,
    "opening_balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "current_balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "general_ledger_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "entry_number" TEXT NOT NULL,
    "debit_account_id" TEXT NOT NULL,
    "credit_account_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "narration" TEXT NOT NULL,
    "posted_by" TEXT NOT NULL,
    "posted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "facility_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,

    CONSTRAINT "financial_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abha_profiles" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "abha_number" TEXT NOT NULL,
    "abha_address" TEXT NOT NULL,
    "mobile" TEXT,
    "linked" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abha_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abdm_consents" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "consent_reference" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" "AbdmConsentStatus" NOT NULL DEFAULT 'REQUESTED',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abdm_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_record_shares" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "record_type" "AbdmRecordType" NOT NULL,
    "source_facility_id" TEXT NOT NULL,
    "target_facility_id" TEXT,
    "consent_id" TEXT NOT NULL,
    "record_reference" TEXT,
    "shared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_record_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abdm_audit_logs" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "performed_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abdm_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_devices" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "device_name" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "device_type" "DeviceType" NOT NULL,
    "manufacturer" TEXT,
    "model_number" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'ONLINE',
    "assigned_patient_id" TEXT,
    "assigned_bed_id" TEXT,
    "last_heartbeat_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_vital_streams" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "heart_rate" DOUBLE PRECISION,
    "systolic_bp" DOUBLE PRECISION,
    "diastolic_bp" DOUBLE PRECISION,
    "spo2" DOUBLE PRECISION,
    "respiratory_rate" DOUBLE PRECISION,
    "temperature" DOUBLE PRECISION,
    "blood_glucose" DOUBLE PRECISION,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_vital_streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_alerts" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "device_id" TEXT,
    "severity" "AlertSeverity" NOT NULL,
    "alert_type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_by_id" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_rules" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT,
    "rule_type" "ClinicalRuleType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'HIGH',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_interactions" (
    "id" TEXT NOT NULL,
    "drug_a" TEXT NOT NULL,
    "drug_b" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'HIGH',
    "interaction_description" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drug_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_allergies" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,
    "reaction" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'HIGH',
    "recorded_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_safety_audits" (
    "id" TEXT NOT NULL,
    "medication_order_id" TEXT,
    "doctor_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "facility_id" TEXT,
    "alert_count" INTEGER NOT NULL DEFAULT 0,
    "override_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_safety_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icu_admissions" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "facility_id" TEXT NOT NULL,
    "bed_id" TEXT,
    "status" "IcuPatientStatus" NOT NULL DEFAULT 'ADMITTED',
    "apache_score" INTEGER,
    "sofa_score" INTEGER,
    "admitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discharged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "icu_admissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventilators" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "ventilator_number" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" "VentilatorStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ventilators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventilator_assignments" (
    "id" TEXT NOT NULL,
    "ventilator_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "assigned_by_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed_at" TIMESTAMP(3),

    CONSTRAINT "ventilator_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icu_vitals_monitors" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "icu_admission_id" TEXT,
    "heart_rate" DOUBLE PRECISION NOT NULL,
    "respiratory_rate" DOUBLE PRECISION NOT NULL,
    "oxygen_saturation" DOUBLE PRECISION NOT NULL,
    "systolic_bp" DOUBLE PRECISION NOT NULL,
    "diastolic_bp" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "urine_output" DOUBLE PRECISION,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "icu_vitals_monitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icu_rounds" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "assessment" TEXT NOT NULL,
    "treatment_plan" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "icu_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_blue_events" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT,
    "facility_id" TEXT NOT NULL,
    "triggered_by_id" TEXT NOT NULL,
    "event_location" TEXT NOT NULL,
    "event_summary" TEXT NOT NULL,
    "outcome" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "code_blue_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "critical_care_alerts" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "icu_admission_id" TEXT,
    "severity" "CriticalAlertSeverity" NOT NULL DEFAULT 'CRITICAL',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_by_id" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "critical_care_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_cycles" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "bill_id" TEXT,
    "gross_amount" DOUBLE PRECISION NOT NULL,
    "discounts" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "net_amount" DOUBLE PRECISION NOT NULL,
    "amount_collected" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance_amount" DOUBLE PRECISION NOT NULL,
    "revenue_status" "RevenueStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revenue_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts_receivables" (
    "id" TEXT NOT NULL,
    "receivable_number" TEXT NOT NULL,
    "receivable_type" "ReceivableType" NOT NULL,
    "patient_id" TEXT,
    "insurance_claim_id" TEXT,
    "corporate_invoice_id" TEXT,
    "facility_id" TEXT,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "outstanding_amount" DOUBLE PRECISION NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "aging_days" INTEGER NOT NULL DEFAULT 0,
    "collection_status" "CollectionStatus" NOT NULL DEFAULT 'OPEN',
    "assigned_to_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_receivables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_activities" (
    "id" TEXT NOT NULL,
    "receivable_id" TEXT NOT NULL,
    "activity_type" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "performed_by_id" TEXT NOT NULL,
    "next_follow_up_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_contracts" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT,
    "company_name" TEXT NOT NULL,
    "contract_number" TEXT NOT NULL,
    "contact_person" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "credit_limit" DOUBLE PRECISION NOT NULL,
    "payment_terms_days" INTEGER NOT NULL DEFAULT 30,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance_amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" TEXT NOT NULL,
    "payment_reference" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "allocated_to" TEXT NOT NULL,
    "allocation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "facility_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_forecasts" (
    "id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "forecast_month" TEXT NOT NULL,
    "projected_revenue" DOUBLE PRECISION NOT NULL,
    "projected_collections" DOUBLE PRECISION NOT NULL,
    "projected_outstanding" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_plan_code_key" ON "subscription_plans"("plan_code");

-- CreateIndex
CREATE UNIQUE INDEX "saas_invoices_invoice_number_key" ON "saas_invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "saas_payment_transactions_transaction_reference_key" ON "saas_payment_transactions"("transaction_reference");

-- CreateIndex
CREATE UNIQUE INDEX "trial_accounts_organization_id_key" ON "trial_accounts"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "sample_collections_barcode_key" ON "sample_collections"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_calls_call_number_key" ON "emergency_calls"("call_number");

-- CreateIndex
CREATE UNIQUE INDEX "ambulance_trips_trip_number_key" ON "ambulance_trips"("trip_number");

-- CreateIndex
CREATE UNIQUE INDEX "fleet_maintenances_maintenance_number_key" ON "fleet_maintenances"("maintenance_number");

-- CreateIndex
CREATE UNIQUE INDEX "guest_patients_phone_key" ON "guest_patients"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "guest_bookings_booking_number_key" ON "guest_bookings"("booking_number");

-- CreateIndex
CREATE INDEX "guest_bookings_doctor_id_appointment_date_start_time_idx" ON "guest_bookings"("doctor_id", "appointment_date", "start_time");

-- CreateIndex
CREATE INDEX "otp_verifications_phone_purpose_idx" ON "otp_verifications"("phone", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "file_attachments_storage_key_key" ON "file_attachments"("storage_key");

-- CreateIndex
CREATE INDEX "file_attachments_patient_id_category_idx" ON "file_attachments"("patient_id", "category");

-- CreateIndex
CREATE INDEX "file_attachments_facility_id_created_at_idx" ON "file_attachments"("facility_id", "created_at");

-- CreateIndex
CREATE INDEX "attachment_audits_attachment_id_created_at_idx" ON "attachment_audits"("attachment_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "opd_tokens_token_number_key" ON "opd_tokens"("token_number");

-- CreateIndex
CREATE INDEX "opd_tokens_doctor_id_created_at_status_idx" ON "opd_tokens"("doctor_id", "created_at", "status");

-- CreateIndex
CREATE INDEX "opd_tokens_facility_id_created_at_idx" ON "opd_tokens"("facility_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_visits_visit_number_key" ON "emergency_visits"("visit_number");

-- CreateIndex
CREATE INDEX "emergency_visits_facility_id_status_created_at_idx" ON "emergency_visits"("facility_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "emergency_visits_triage_level_status_idx" ON "emergency_visits"("triage_level", "status");

-- CreateIndex
CREATE INDEX "triage_assessments_emergency_visit_id_assessed_at_idx" ON "triage_assessments"("emergency_visit_id", "assessed_at");

-- CreateIndex
CREATE INDEX "nursing_shifts_facility_id_status_idx" ON "nursing_shifts"("facility_id", "status");

-- CreateIndex
CREATE INDEX "nursing_shifts_nurse_id_start_time_idx" ON "nursing_shifts"("nurse_id", "start_time");

-- CreateIndex
CREATE INDEX "medication_administrations_admission_id_scheduled_time_idx" ON "medication_administrations"("admission_id", "scheduled_time");

-- CreateIndex
CREATE INDEX "medication_administrations_patient_id_status_idx" ON "medication_administrations"("patient_id", "status");

-- CreateIndex
CREATE INDEX "vitals_flowsheets_admission_id_recorded_at_idx" ON "vitals_flowsheets"("admission_id", "recorded_at");

-- CreateIndex
CREATE INDEX "department_clearances_facility_id_status_idx" ON "department_clearances"("facility_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "department_clearances_admission_id_department_type_key" ON "department_clearances"("admission_id", "department_type");

-- CreateIndex
CREATE UNIQUE INDEX "discharge_summaries_admission_id_key" ON "discharge_summaries"("admission_id");

-- CreateIndex
CREATE INDEX "discharge_summaries_facility_id_status_idx" ON "discharge_summaries"("facility_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "telemedicine_sessions_appointment_id_key" ON "telemedicine_sessions"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "telemedicine_sessions_room_name_key" ON "telemedicine_sessions"("room_name");

-- CreateIndex
CREATE INDEX "telemedicine_sessions_facility_id_status_idx" ON "telemedicine_sessions"("facility_id", "status");

-- CreateIndex
CREATE INDEX "telemedicine_sessions_patient_id_doctor_id_idx" ON "telemedicine_sessions"("patient_id", "doctor_id");

-- CreateIndex
CREATE INDEX "telemedicine_participants_session_id_user_id_idx" ON "telemedicine_participants"("session_id", "user_id");

-- CreateIndex
CREATE INDEX "telemedicine_chat_messages_session_id_sent_at_idx" ON "telemedicine_chat_messages"("session_id", "sent_at");

-- CreateIndex
CREATE INDEX "telemedicine_recording_metadata_session_id_idx" ON "telemedicine_recording_metadata"("session_id");

-- CreateIndex
CREATE INDEX "clinical_alerts_facility_id_is_resolved_idx" ON "clinical_alerts"("facility_id", "is_resolved");

-- CreateIndex
CREATE INDEX "clinical_alerts_patient_id_severity_idx" ON "clinical_alerts"("patient_id", "severity");

-- CreateIndex
CREATE INDEX "patient_risk_scores_facility_id_overall_risk_score_idx" ON "patient_risk_scores"("facility_id", "overall_risk_score");

-- CreateIndex
CREATE INDEX "patient_risk_scores_patient_id_evaluated_at_idx" ON "patient_risk_scores"("patient_id", "evaluated_at");

-- CreateIndex
CREATE INDEX "hospital_predictions_facility_id_type_idx" ON "hospital_predictions"("facility_id", "type");

-- CreateIndex
CREATE INDEX "clinical_recommendations_facility_id_patient_id_idx" ON "clinical_recommendations"("facility_id", "patient_id");

-- CreateIndex
CREATE INDEX "ai_generated_summaries_facility_id_doctor_id_idx" ON "ai_generated_summaries"("facility_id", "doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "radiology_orders_order_number_key" ON "radiology_orders"("order_number");

-- CreateIndex
CREATE INDEX "radiology_orders_facility_id_patient_id_idx" ON "radiology_orders"("facility_id", "patient_id");

-- CreateIndex
CREATE INDEX "radiology_orders_order_number_idx" ON "radiology_orders"("order_number");

-- CreateIndex
CREATE INDEX "imaging_orders_facility_id_patient_id_idx" ON "imaging_orders"("facility_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "imaging_studies_accession_number_key" ON "imaging_studies"("accession_number");

-- CreateIndex
CREATE INDEX "imaging_studies_accession_number_idx" ON "imaging_studies"("accession_number");

-- CreateIndex
CREATE INDEX "dicom_series_study_id_idx" ON "dicom_series"("study_id");

-- CreateIndex
CREATE INDEX "radiology_reports_study_id_idx" ON "radiology_reports"("study_id");

-- CreateIndex
CREATE INDEX "critical_finding_alerts_patient_id_acknowledged_idx" ON "critical_finding_alerts"("patient_id", "acknowledged");

-- CreateIndex
CREATE INDEX "medication_orders_facility_id_patient_id_idx" ON "medication_orders"("facility_id", "patient_id");

-- CreateIndex
CREATE INDEX "pharmacy_inventories_facility_id_medicine_name_idx" ON "pharmacy_inventories"("facility_id", "medicine_name");

-- CreateIndex
CREATE UNIQUE INDEX "drug_masters_facility_id_code_key" ON "drug_masters"("facility_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_number_key" ON "purchase_orders"("po_number");

-- CreateIndex
CREATE UNIQUE INDEX "goods_receipt_notes_grn_number_key" ON "goods_receipt_notes"("grn_number");

-- CreateIndex
CREATE UNIQUE INDEX "operation_theatres_facility_id_code_key" ON "operation_theatres"("facility_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "billing_invoices_invoice_number_key" ON "billing_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "payment_transactions_invoice_id_payment_date_idx" ON "payment_transactions"("invoice_id", "payment_date");

-- CreateIndex
CREATE INDEX "payment_transactions_finance_invoice_id_payment_date_idx" ON "payment_transactions"("finance_invoice_id", "payment_date");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_providers_provider_code_key" ON "insurance_providers"("provider_code");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_providers_code_key" ON "insurance_providers"("code");

-- CreateIndex
CREATE INDEX "insurance_policies_patient_id_policy_status_idx" ON "insurance_policies"("patient_id", "policy_status");

-- CreateIndex
CREATE INDEX "insurance_policies_policy_number_idx" ON "insurance_policies"("policy_number");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_claims_claim_number_key" ON "insurance_claims"("claim_number");

-- CreateIndex
CREATE INDEX "insurance_claims_facility_id_status_idx" ON "insurance_claims"("facility_id", "status");

-- CreateIndex
CREATE INDEX "insurance_claims_patient_id_claim_number_idx" ON "insurance_claims"("patient_id", "claim_number");

-- CreateIndex
CREATE INDEX "claim_documents_claim_id_idx" ON "claim_documents"("claim_id");

-- CreateIndex
CREATE INDEX "claim_queries_claim_id_resolved_idx" ON "claim_queries"("claim_id", "resolved");

-- CreateIndex
CREATE INDEX "claim_settlements_claim_id_idx" ON "claim_settlements"("claim_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_code_key" ON "employees"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "employee_profiles_employee_code_key" ON "employee_profiles"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "employee_profiles_user_id_key" ON "employee_profiles"("user_id");

-- CreateIndex
CREATE INDEX "employee_profiles_facility_id_employee_status_idx" ON "employee_profiles"("facility_id", "employee_status");

-- CreateIndex
CREATE INDEX "employee_profiles_department_designation_idx" ON "employee_profiles"("department", "designation");

-- CreateIndex
CREATE INDEX "attendance_records_employee_profile_id_attendance_date_idx" ON "attendance_records"("employee_profile_id", "attendance_date");

-- CreateIndex
CREATE INDEX "shift_schedules_employee_id_start_time_idx" ON "shift_schedules"("employee_id", "start_time");

-- CreateIndex
CREATE INDEX "leave_requests_employee_profile_id_leave_status_idx" ON "leave_requests"("employee_profile_id", "leave_status");

-- CreateIndex
CREATE INDEX "payroll_records_employee_id_payroll_month_idx" ON "payroll_records"("employee_id", "payroll_month");

-- CreateIndex
CREATE INDEX "credential_records_employee_id_expiry_date_idx" ON "credential_records"("employee_id", "expiry_date");

-- CreateIndex
CREATE INDEX "performance_reviews_employee_id_review_period_idx" ON "performance_reviews"("employee_id", "review_period");

-- CreateIndex
CREATE UNIQUE INDEX "salary_structures_employee_id_key" ON "salary_structures"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_item_code_key" ON "inventory_items"("item_code");

-- CreateIndex
CREATE UNIQUE INDEX "supply_vendors_vendor_code_key" ON "supply_vendors"("vendor_code");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_requisitions_requisition_number_key" ON "purchase_requisitions"("requisition_number");

-- CreateIndex
CREATE UNIQUE INDEX "requests_for_quotation_rfq_number_key" ON "requests_for_quotation"("rfq_number");

-- CreateIndex
CREATE UNIQUE INDEX "procurement_orders_po_number_key" ON "procurement_orders"("po_number");

-- CreateIndex
CREATE UNIQUE INDEX "goods_receipts_grn_number_key" ON "goods_receipts"("grn_number");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_invoices_invoice_number_key" ON "vendor_invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_payments_payment_reference_key" ON "vendor_payments"("payment_reference");

-- CreateIndex
CREATE UNIQUE INDEX "procurement_purchase_orders_po_number_key" ON "procurement_purchase_orders"("po_number");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_goods_receipts_receipt_number_key" ON "hospital_goods_receipts"("receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_assets_asset_code_key" ON "hospital_assets"("asset_code");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_tickets_ticket_number_key" ON "maintenance_tickets"("ticket_number");

-- CreateIndex
CREATE INDEX "kpi_snapshots_facility_id_snapshot_date_idx" ON "kpi_snapshots"("facility_id", "snapshot_date");

-- CreateIndex
CREATE INDEX "kpi_snapshots_facility_id_metric_name_period_idx" ON "kpi_snapshots"("facility_id", "metric_name", "period");

-- CreateIndex
CREATE UNIQUE INDEX "infection_cases_case_number_key" ON "infection_cases"("case_number");

-- CreateIndex
CREATE UNIQUE INDEX "incident_reports_incident_number_key" ON "incident_reports"("incident_number");

-- CreateIndex
CREATE UNIQUE INDEX "quality_audits_audit_number_key" ON "quality_audits"("audit_number");

-- CreateIndex
CREATE UNIQUE INDEX "capa_records_capa_number_key" ON "capa_records"("capa_number");

-- CreateIndex
CREATE UNIQUE INDEX "patient_devices_device_token_key" ON "patient_devices"("device_token");

-- CreateIndex
CREATE UNIQUE INDEX "blood_donors_donor_code_key" ON "blood_donors"("donor_code");

-- CreateIndex
CREATE INDEX "blood_donors_facility_id_blood_group_idx" ON "blood_donors"("facility_id", "blood_group");

-- CreateIndex
CREATE UNIQUE INDEX "blood_donations_donation_number_key" ON "blood_donations"("donation_number");

-- CreateIndex
CREATE INDEX "blood_donations_facility_id_donation_date_idx" ON "blood_donations"("facility_id", "donation_date");

-- CreateIndex
CREATE UNIQUE INDEX "blood_inventory_units_unit_number_key" ON "blood_inventory_units"("unit_number");

-- CreateIndex
CREATE INDEX "blood_inventory_units_facility_id_blood_group_status_idx" ON "blood_inventory_units"("facility_id", "blood_group", "status");

-- CreateIndex
CREATE INDEX "blood_inventory_units_expiry_date_idx" ON "blood_inventory_units"("expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "blood_requests_request_number_key" ON "blood_requests"("request_number");

-- CreateIndex
CREATE INDEX "blood_requests_facility_id_status_idx" ON "blood_requests"("facility_id", "status");

-- CreateIndex
CREATE INDEX "transfusion_records_facility_id_status_idx" ON "transfusion_records"("facility_id", "status");

-- CreateIndex
CREATE INDEX "blood_discard_records_facility_id_discarded_at_idx" ON "blood_discard_records"("facility_id", "discarded_at");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_facility_id_created_at_idx" ON "invoices"("facility_id", "created_at");

-- CreateIndex
CREATE INDEX "invoices_patient_id_payment_status_idx" ON "invoices"("patient_id", "payment_status");

-- CreateIndex
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_line_items_invoice_id_idx" ON "invoice_line_items"("invoice_id");

-- CreateIndex
CREATE INDEX "refund_transactions_invoice_id_idx" ON "refund_transactions"("invoice_id");

-- CreateIndex
CREATE INDEX "revenue_ledgers_facility_id_category_idx" ON "revenue_ledgers"("facility_id", "category");

-- CreateIndex
CREATE INDEX "revenue_ledgers_transaction_date_idx" ON "revenue_ledgers"("transaction_date");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_code_key" ON "cost_centers"("code");

-- CreateIndex
CREATE INDEX "cost_centers_facility_id_idx" ON "cost_centers"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "general_ledger_accounts_account_code_key" ON "general_ledger_accounts"("account_code");

-- CreateIndex
CREATE INDEX "general_ledger_accounts_facility_id_account_type_idx" ON "general_ledger_accounts"("facility_id", "account_type");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_entry_number_key" ON "journal_entries"("entry_number");

-- CreateIndex
CREATE INDEX "journal_entries_posted_at_idx" ON "journal_entries"("posted_at");

-- CreateIndex
CREATE INDEX "financial_audit_logs_facility_id_timestamp_idx" ON "financial_audit_logs"("facility_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "abha_profiles_patient_id_key" ON "abha_profiles"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "abha_profiles_abha_number_key" ON "abha_profiles"("abha_number");

-- CreateIndex
CREATE UNIQUE INDEX "abha_profiles_abha_address_key" ON "abha_profiles"("abha_address");

-- CreateIndex
CREATE UNIQUE INDEX "abdm_consents_consent_reference_key" ON "abdm_consents"("consent_reference");

-- CreateIndex
CREATE INDEX "abdm_consents_facility_id_patient_id_status_idx" ON "abdm_consents"("facility_id", "patient_id", "status");

-- CreateIndex
CREATE INDEX "health_record_shares_patient_id_consent_id_idx" ON "health_record_shares"("patient_id", "consent_id");

-- CreateIndex
CREATE INDEX "abdm_audit_logs_facility_id_created_at_idx" ON "abdm_audit_logs"("facility_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "medical_devices_serial_number_key" ON "medical_devices"("serial_number");

-- CreateIndex
CREATE INDEX "medical_devices_facility_id_status_idx" ON "medical_devices"("facility_id", "status");

-- CreateIndex
CREATE INDEX "medical_devices_assigned_patient_id_idx" ON "medical_devices"("assigned_patient_id");

-- CreateIndex
CREATE INDEX "patient_vital_streams_patient_id_recorded_at_idx" ON "patient_vital_streams"("patient_id", "recorded_at");

-- CreateIndex
CREATE INDEX "patient_vital_streams_facility_id_recorded_at_idx" ON "patient_vital_streams"("facility_id", "recorded_at");

-- CreateIndex
CREATE INDEX "patient_alerts_facility_id_acknowledged_severity_idx" ON "patient_alerts"("facility_id", "acknowledged", "severity");

-- CreateIndex
CREATE INDEX "patient_alerts_patient_id_created_at_idx" ON "patient_alerts"("patient_id", "created_at");

-- CreateIndex
CREATE INDEX "clinical_rules_rule_type_active_idx" ON "clinical_rules"("rule_type", "active");

-- CreateIndex
CREATE INDEX "drug_interactions_drug_a_idx" ON "drug_interactions"("drug_a");

-- CreateIndex
CREATE INDEX "drug_interactions_drug_b_idx" ON "drug_interactions"("drug_b");

-- CreateIndex
CREATE UNIQUE INDEX "drug_interactions_drug_a_drug_b_key" ON "drug_interactions"("drug_a", "drug_b");

-- CreateIndex
CREATE INDEX "patient_allergies_patient_id_allergen_idx" ON "patient_allergies"("patient_id", "allergen");

-- CreateIndex
CREATE INDEX "medication_safety_audits_patient_id_doctor_id_idx" ON "medication_safety_audits"("patient_id", "doctor_id");

-- CreateIndex
CREATE INDEX "icu_admissions_facility_id_patient_id_idx" ON "icu_admissions"("facility_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "ventilators_ventilator_number_key" ON "ventilators"("ventilator_number");

-- CreateIndex
CREATE INDEX "ventilators_facility_id_status_idx" ON "ventilators"("facility_id", "status");

-- CreateIndex
CREATE INDEX "ventilator_assignments_ventilator_id_patient_id_idx" ON "ventilator_assignments"("ventilator_id", "patient_id");

-- CreateIndex
CREATE INDEX "icu_vitals_monitors_patient_id_recorded_at_idx" ON "icu_vitals_monitors"("patient_id", "recorded_at");

-- CreateIndex
CREATE INDEX "icu_rounds_patient_id_doctor_id_idx" ON "icu_rounds"("patient_id", "doctor_id");

-- CreateIndex
CREATE INDEX "code_blue_events_facility_id_started_at_idx" ON "code_blue_events"("facility_id", "started_at");

-- CreateIndex
CREATE INDEX "critical_care_alerts_patient_id_acknowledged_idx" ON "critical_care_alerts"("patient_id", "acknowledged");

-- CreateIndex
CREATE INDEX "revenue_cycles_facility_id_revenue_status_idx" ON "revenue_cycles"("facility_id", "revenue_status");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_receivables_receivable_number_key" ON "accounts_receivables"("receivable_number");

-- CreateIndex
CREATE INDEX "accounts_receivables_facility_id_collection_status_idx" ON "accounts_receivables"("facility_id", "collection_status");

-- CreateIndex
CREATE INDEX "accounts_receivables_receivable_type_aging_days_idx" ON "accounts_receivables"("receivable_type", "aging_days");

-- CreateIndex
CREATE INDEX "collection_activities_receivable_id_created_at_idx" ON "collection_activities"("receivable_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "corporate_contracts_contract_number_key" ON "corporate_contracts"("contract_number");

-- CreateIndex
CREATE INDEX "corporate_contracts_company_name_active_idx" ON "corporate_contracts"("company_name", "active");

-- CreateIndex
CREATE UNIQUE INDEX "corporate_invoices_invoice_number_key" ON "corporate_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "corporate_invoices_contract_id_status_idx" ON "corporate_invoices"("contract_id", "status");

-- CreateIndex
CREATE INDEX "revenue_forecasts_facility_id_forecast_month_idx" ON "revenue_forecasts"("facility_id", "forecast_month");

-- AddForeignKey
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_metrics" ADD CONSTRAINT "usage_metrics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas_invoices" ADD CONSTRAINT "saas_invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas_invoices" ADD CONSTRAINT "saas_invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "organization_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas_payment_transactions" ADD CONSTRAINT "saas_payment_transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "saas_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas_payment_transactions" ADD CONSTRAINT "saas_payment_transactions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_accounts" ADD CONSTRAINT "trial_accounts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "clinical_encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_test_items" ADD CONSTRAINT "lab_test_items_lab_order_id_fkey" FOREIGN KEY ("lab_order_id") REFERENCES "lab_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_test_items" ADD CONSTRAINT "lab_test_items_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_collections" ADD CONSTRAINT "sample_collections_lab_order_id_fkey" FOREIGN KEY ("lab_order_id") REFERENCES "lab_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_collections" ADD CONSTRAINT "sample_collections_collected_by_id_fkey" FOREIGN KEY ("collected_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambulances" ADD CONSTRAINT "ambulances_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambulance_crews" ADD CONSTRAINT "ambulance_crews_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambulance_crews" ADD CONSTRAINT "ambulance_crews_ambulance_id_fkey" FOREIGN KEY ("ambulance_id") REFERENCES "ambulances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambulance_dispatches" ADD CONSTRAINT "ambulance_dispatches_emergency_request_id_fkey" FOREIGN KEY ("emergency_request_id") REFERENCES "emergency_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambulance_dispatches" ADD CONSTRAINT "ambulance_dispatches_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "ambulance_driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambulance_dispatches" ADD CONSTRAINT "ambulance_dispatches_destination_facility_id_fkey" FOREIGN KEY ("destination_facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_calls" ADD CONSTRAINT "emergency_calls_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambulance_trips" ADD CONSTRAINT "ambulance_trips_ambulance_id_fkey" FOREIGN KEY ("ambulance_id") REFERENCES "ambulances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambulance_trips" ADD CONSTRAINT "ambulance_trips_dispatch_id_fkey" FOREIGN KEY ("dispatch_id") REFERENCES "ambulance_dispatches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet_maintenances" ADD CONSTRAINT "fleet_maintenances_ambulance_id_fkey" FOREIGN KEY ("ambulance_id") REFERENCES "ambulances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet_maintenances" ADD CONSTRAINT "fleet_maintenances_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_bookings" ADD CONSTRAINT "guest_bookings_guest_patient_id_fkey" FOREIGN KEY ("guest_patient_id") REFERENCES "guest_patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_bookings" ADD CONSTRAINT "guest_bookings_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_bookings" ADD CONSTRAINT "guest_bookings_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment_audits" ADD CONSTRAINT "attachment_audits_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "file_attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opd_tokens" ADD CONSTRAINT "opd_tokens_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opd_tokens" ADD CONSTRAINT "opd_tokens_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opd_tokens" ADD CONSTRAINT "opd_tokens_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opd_tokens" ADD CONSTRAINT "opd_tokens_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_visits" ADD CONSTRAINT "emergency_visits_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_visits" ADD CONSTRAINT "emergency_visits_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_visits" ADD CONSTRAINT "emergency_visits_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triage_assessments" ADD CONSTRAINT "triage_assessments_emergency_visit_id_fkey" FOREIGN KEY ("emergency_visit_id") REFERENCES "emergency_visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triage_assessments" ADD CONSTRAINT "triage_assessments_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_shifts" ADD CONSTRAINT "nursing_shifts_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_shifts" ADD CONSTRAINT "nursing_shifts_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_shifts" ADD CONSTRAINT "nursing_shifts_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_administrations" ADD CONSTRAINT "medication_administrations_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_administrations" ADD CONSTRAINT "medication_administrations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_administrations" ADD CONSTRAINT "medication_administrations_administered_by_id_fkey" FOREIGN KEY ("administered_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_administrations" ADD CONSTRAINT "medication_administrations_witness_nurse_id_fkey" FOREIGN KEY ("witness_nurse_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals_flowsheets" ADD CONSTRAINT "vitals_flowsheets_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals_flowsheets" ADD CONSTRAINT "vitals_flowsheets_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals_flowsheets" ADD CONSTRAINT "vitals_flowsheets_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_clearances" ADD CONSTRAINT "department_clearances_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_clearances" ADD CONSTRAINT "department_clearances_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_clearances" ADD CONSTRAINT "department_clearances_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discharge_summaries" ADD CONSTRAINT "discharge_summaries_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discharge_summaries" ADD CONSTRAINT "discharge_summaries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discharge_summaries" ADD CONSTRAINT "discharge_summaries_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discharge_summaries" ADD CONSTRAINT "discharge_summaries_attending_doctor_id_fkey" FOREIGN KEY ("attending_doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemedicine_sessions" ADD CONSTRAINT "telemedicine_sessions_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemedicine_sessions" ADD CONSTRAINT "telemedicine_sessions_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemedicine_sessions" ADD CONSTRAINT "telemedicine_sessions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemedicine_sessions" ADD CONSTRAINT "telemedicine_sessions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemedicine_participants" ADD CONSTRAINT "telemedicine_participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "telemedicine_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemedicine_participants" ADD CONSTRAINT "telemedicine_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemedicine_chat_messages" ADD CONSTRAINT "telemedicine_chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "telemedicine_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemedicine_chat_messages" ADD CONSTRAINT "telemedicine_chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemedicine_recording_metadata" ADD CONSTRAINT "telemedicine_recording_metadata_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "telemedicine_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_alerts" ADD CONSTRAINT "clinical_alerts_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_alerts" ADD CONSTRAINT "clinical_alerts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_alerts" ADD CONSTRAINT "clinical_alerts_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_alerts" ADD CONSTRAINT "clinical_alerts_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_alerts" ADD CONSTRAINT "clinical_alerts_acknowledged_by_id_fkey" FOREIGN KEY ("acknowledged_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_risk_scores" ADD CONSTRAINT "patient_risk_scores_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_risk_scores" ADD CONSTRAINT "patient_risk_scores_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_risk_scores" ADD CONSTRAINT "patient_risk_scores_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_predictions" ADD CONSTRAINT "hospital_predictions_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_recommendations" ADD CONSTRAINT "clinical_recommendations_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_recommendations" ADD CONSTRAINT "clinical_recommendations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_recommendations" ADD CONSTRAINT "clinical_recommendations_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generated_summaries" ADD CONSTRAINT "ai_generated_summaries_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generated_summaries" ADD CONSTRAINT "ai_generated_summaries_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generated_summaries" ADD CONSTRAINT "ai_generated_summaries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_orders" ADD CONSTRAINT "radiology_orders_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_orders" ADD CONSTRAINT "radiology_orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_orders" ADD CONSTRAINT "radiology_orders_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_orders" ADD CONSTRAINT "radiology_orders_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_orders" ADD CONSTRAINT "imaging_orders_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_orders" ADD CONSTRAINT "imaging_orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_orders" ADD CONSTRAINT "imaging_orders_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_orders" ADD CONSTRAINT "imaging_orders_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_radiology_order_id_fkey" FOREIGN KEY ("radiology_order_id") REFERENCES "radiology_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_imaging_order_id_fkey" FOREIGN KEY ("imaging_order_id") REFERENCES "imaging_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dicom_series" ADD CONSTRAINT "dicom_series_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "imaging_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_files" ADD CONSTRAINT "imaging_files_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "imaging_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "imaging_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_imaging_order_id_fkey" FOREIGN KEY ("imaging_order_id") REFERENCES "imaging_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_radiologist_id_fkey" FOREIGN KEY ("radiologist_id") REFERENCES "doctor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_radiologist_user_id_fkey" FOREIGN KEY ("radiologist_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_finding_alerts" ADD CONSTRAINT "critical_finding_alerts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_finding_alerts" ADD CONSTRAINT "critical_finding_alerts_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "imaging_studies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_finding_alerts" ADD CONSTRAINT "critical_finding_alerts_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "radiology_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_finding_alerts" ADD CONSTRAINT "critical_finding_alerts_acknowledged_by_id_fkey" FOREIGN KEY ("acknowledged_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_orders" ADD CONSTRAINT "medication_orders_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_orders" ADD CONSTRAINT "medication_orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_orders" ADD CONSTRAINT "medication_orders_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_items" ADD CONSTRAINT "medication_items_medication_order_id_fkey" FOREIGN KEY ("medication_order_id") REFERENCES "medication_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_inventories" ADD CONSTRAINT "pharmacy_inventories_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "pharmacy_inventories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_masters" ADD CONSTRAINT "drug_masters_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_batches" ADD CONSTRAINT "drug_batches_drug_master_id_fkey" FOREIGN KEY ("drug_master_id") REFERENCES "drug_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispense_records" ADD CONSTRAINT "pharmacy_dispense_records_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispense_records" ADD CONSTRAINT "pharmacy_dispense_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispense_records" ADD CONSTRAINT "pharmacy_dispense_records_dispensed_by_id_fkey" FOREIGN KEY ("dispensed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispense_records" ADD CONSTRAINT "pharmacy_dispense_records_witness_nurse_id_fkey" FOREIGN KEY ("witness_nurse_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispense_line_items" ADD CONSTRAINT "dispense_line_items_dispense_id_fkey" FOREIGN KEY ("dispense_id") REFERENCES "pharmacy_dispense_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispense_line_items" ADD CONSTRAINT "dispense_line_items_drug_master_id_fkey" FOREIGN KEY ("drug_master_id") REFERENCES "drug_masters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispense_line_items" ADD CONSTRAINT "dispense_line_items_drug_batch_id_fkey" FOREIGN KEY ("drug_batch_id") REFERENCES "drug_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_drug_master_id_fkey" FOREIGN KEY ("drug_master_id") REFERENCES "drug_masters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_notes" ADD CONSTRAINT "goods_receipt_notes_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_notes" ADD CONSTRAINT "goods_receipt_notes_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_notes" ADD CONSTRAINT "goods_receipt_notes_received_by_id_fkey" FOREIGN KEY ("received_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_grn_id_fkey" FOREIGN KEY ("grn_id") REFERENCES "goods_receipt_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_drug_master_id_fkey" FOREIGN KEY ("drug_master_id") REFERENCES "drug_masters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_drug_batch_id_fkey" FOREIGN KEY ("drug_batch_id") REFERENCES "drug_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controlled_substance_audits" ADD CONSTRAINT "controlled_substance_audits_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controlled_substance_audits" ADD CONSTRAINT "controlled_substance_audits_drug_master_id_fkey" FOREIGN KEY ("drug_master_id") REFERENCES "drug_masters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controlled_substance_audits" ADD CONSTRAINT "controlled_substance_audits_drug_batch_id_fkey" FOREIGN KEY ("drug_batch_id") REFERENCES "drug_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controlled_substance_audits" ADD CONSTRAINT "controlled_substance_audits_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controlled_substance_audits" ADD CONSTRAINT "controlled_substance_audits_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controlled_substance_audits" ADD CONSTRAINT "controlled_substance_audits_witness_nurse_id_fkey" FOREIGN KEY ("witness_nurse_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_theatres" ADD CONSTRAINT "operation_theatres_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_schedules" ADD CONSTRAINT "surgery_schedules_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_schedules" ADD CONSTRAINT "surgery_schedules_ot_id_fkey" FOREIGN KEY ("ot_id") REFERENCES "operation_theatres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_schedules" ADD CONSTRAINT "surgery_schedules_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_schedules" ADD CONSTRAINT "surgery_schedules_lead_surgeon_id_fkey" FOREIGN KEY ("lead_surgeon_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_schedules" ADD CONSTRAINT "surgery_schedules_anesthetist_id_fkey" FOREIGN KEY ("anesthetist_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgical_team_members" ADD CONSTRAINT "surgical_team_members_surgery_id_fkey" FOREIGN KEY ("surgery_id") REFERENCES "surgery_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgical_team_members" ADD CONSTRAINT "surgical_team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anesthesia_records" ADD CONSTRAINT "anesthesia_records_surgery_id_fkey" FOREIGN KEY ("surgery_id") REFERENCES "surgery_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anesthesia_records" ADD CONSTRAINT "anesthesia_records_anesthetist_id_fkey" FOREIGN KEY ("anesthetist_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgical_checklists" ADD CONSTRAINT "surgical_checklists_surgery_id_fkey" FOREIGN KEY ("surgery_id") REFERENCES "surgery_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgical_checklists" ADD CONSTRAINT "surgical_checklists_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "implant_usages" ADD CONSTRAINT "implant_usages_surgery_id_fkey" FOREIGN KEY ("surgery_id") REFERENCES "surgery_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_notes" ADD CONSTRAINT "surgery_notes_surgery_id_fkey" FOREIGN KEY ("surgery_id") REFERENCES "surgery_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_notes" ADD CONSTRAINT "surgery_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_operative_notes" ADD CONSTRAINT "post_operative_notes_surgery_id_fkey" FOREIGN KEY ("surgery_id") REFERENCES "surgery_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_operative_notes" ADD CONSTRAINT "post_operative_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "clinical_encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_line_items" ADD CONSTRAINT "billing_line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "billing_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "billing_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_finance_invoice_id_fkey" FOREIGN KEY ("finance_invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_collected_by_id_fkey" FOREIGN KEY ("collected_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_received_by_id_fkey" FOREIGN KEY ("received_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_insurances" ADD CONSTRAINT "patient_insurances_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_insurances" ADD CONSTRAINT "patient_insurances_insurance_provider_id_fkey" FOREIGN KEY ("insurance_provider_id") REFERENCES "insurance_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_insurance_provider_id_fkey" FOREIGN KEY ("insurance_provider_id") REFERENCES "insurance_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "billing_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "insurance_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_patient_insurance_id_fkey" FOREIGN KEY ("patient_insurance_id") REFERENCES "patient_insurances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "insurance_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_documents" ADD CONSTRAINT "claim_documents_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "insurance_claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_documents" ADD CONSTRAINT "claim_documents_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_queries" ADD CONSTRAINT "claim_queries_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "insurance_claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_settlements" ADD CONSTRAINT "claim_settlements_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "insurance_claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_audit_logs" ADD CONSTRAINT "claim_audit_logs_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "insurance_claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_audit_logs" ADD CONSTRAINT "claim_audit_logs_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_reporting_manager_id_fkey" FOREIGN KEY ("reporting_manager_id") REFERENCES "employee_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employee_profile_id_fkey" FOREIGN KEY ("employee_profile_id") REFERENCES "employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_schedules" ADD CONSTRAINT "shift_schedules_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_schedules" ADD CONSTRAINT "shift_schedules_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_profile_id_fkey" FOREIGN KEY ("employee_profile_id") REFERENCES "employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_records" ADD CONSTRAINT "credential_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_structures" ADD CONSTRAINT "salary_structures_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_inventory_transactions" ADD CONSTRAINT "hospital_inventory_transactions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_inventory_transactions" ADD CONSTRAINT "hospital_inventory_transactions_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisition_items" ADD CONSTRAINT "purchase_requisition_items_requisition_id_fkey" FOREIGN KEY ("requisition_id") REFERENCES "purchase_requisitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests_for_quotation" ADD CONSTRAINT "requests_for_quotation_requisition_id_fkey" FOREIGN KEY ("requisition_id") REFERENCES "purchase_requisitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests_for_quotation" ADD CONSTRAINT "requests_for_quotation_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "supply_vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_responses" ADD CONSTRAINT "quotation_responses_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "requests_for_quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_responses" ADD CONSTRAINT "quotation_responses_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "supply_vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "supply_vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_requisition_id_fkey" FOREIGN KEY ("requisition_id") REFERENCES "purchase_requisitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "requests_for_quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_order_line_items" ADD CONSTRAINT "procurement_order_line_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "procurement_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "procurement_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_received_by_id_fkey" FOREIGN KEY ("received_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_line_items" ADD CONSTRAINT "goods_receipt_line_items_goods_receipt_id_fkey" FOREIGN KEY ("goods_receipt_id") REFERENCES "goods_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_invoices" ADD CONSTRAINT "vendor_invoices_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "supply_vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_invoices" ADD CONSTRAINT "vendor_invoices_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "procurement_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_vendor_invoice_id_fkey" FOREIGN KEY ("vendor_invoice_id") REFERENCES "vendor_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_purchase_orders" ADD CONSTRAINT "procurement_purchase_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "supply_vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_purchase_orders" ADD CONSTRAINT "procurement_purchase_orders_requisition_id_fkey" FOREIGN KEY ("requisition_id") REFERENCES "purchase_requisitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_purchase_orders" ADD CONSTRAINT "procurement_purchase_orders_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_purchase_orders" ADD CONSTRAINT "procurement_purchase_orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_goods_receipts" ADD CONSTRAINT "hospital_goods_receipts_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "procurement_purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_goods_receipts" ADD CONSTRAINT "hospital_goods_receipts_received_by_id_fkey" FOREIGN KEY ("received_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_assets" ADD CONSTRAINT "hospital_assets_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_assets" ADD CONSTRAINT "hospital_assets_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "hospital_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_snapshots" ADD CONSTRAINT "kpi_snapshots_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_alerts" ADD CONSTRAINT "executive_alerts_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_alerts" ADD CONSTRAINT "executive_alerts_acknowledged_by_id_fkey" FOREIGN KEY ("acknowledged_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_alerts" ADD CONSTRAINT "executive_alerts_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infection_cases" ADD CONSTRAINT "infection_cases_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infection_cases" ADD CONSTRAINT "infection_cases_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infection_cases" ADD CONSTRAINT "infection_cases_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infection_cases" ADD CONSTRAINT "infection_cases_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infection_investigations" ADD CONSTRAINT "infection_investigations_infection_case_id_fkey" FOREIGN KEY ("infection_case_id") REFERENCES "infection_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infection_investigations" ADD CONSTRAINT "infection_investigations_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_audits" ADD CONSTRAINT "quality_audits_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_audits" ADD CONSTRAINT "quality_audits_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_audits" ADD CONSTRAINT "quality_audits_auditor_id_fkey" FOREIGN KEY ("auditor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_records" ADD CONSTRAINT "capa_records_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_records" ADD CONSTRAINT "capa_records_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "quality_audits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_records" ADD CONSTRAINT "capa_records_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incident_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_records" ADD CONSTRAINT "capa_records_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hand_hygiene_audits" ADD CONSTRAINT "hand_hygiene_audits_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hand_hygiene_audits" ADD CONSTRAINT "hand_hygiene_audits_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hand_hygiene_audits" ADD CONSTRAINT "hand_hygiene_audits_observer_id_fkey" FOREIGN KEY ("observer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_checklists" ADD CONSTRAINT "safety_checklists_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_checklists" ADD CONSTRAINT "safety_checklists_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_checklists" ADD CONSTRAINT "safety_checklists_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_checklists" ADD CONSTRAINT "safety_checklists_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_notifications" ADD CONSTRAINT "patient_notifications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_feedbacks" ADD CONSTRAINT "patient_feedbacks_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_feedbacks" ADD CONSTRAINT "patient_feedbacks_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_feedbacks" ADD CONSTRAINT "patient_feedbacks_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_devices" ADD CONSTRAINT "patient_devices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_goals" ADD CONSTRAINT "health_goals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_donors" ADD CONSTRAINT "blood_donors_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_donations" ADD CONSTRAINT "blood_donations_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "blood_donors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_donations" ADD CONSTRAINT "blood_donations_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_donations" ADD CONSTRAINT "blood_donations_collected_by_id_fkey" FOREIGN KEY ("collected_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_inventory_units" ADD CONSTRAINT "blood_inventory_units_donation_id_fkey" FOREIGN KEY ("donation_id") REFERENCES "blood_donations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_inventory_units" ADD CONSTRAINT "blood_inventory_units_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "clinical_encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_match_records" ADD CONSTRAINT "cross_match_records_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "blood_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_match_records" ADD CONSTRAINT "cross_match_records_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "blood_inventory_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_match_records" ADD CONSTRAINT "cross_match_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_match_records" ADD CONSTRAINT "cross_match_records_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_match_records" ADD CONSTRAINT "cross_match_records_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfusion_records" ADD CONSTRAINT "transfusion_records_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "blood_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfusion_records" ADD CONSTRAINT "transfusion_records_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "blood_inventory_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfusion_records" ADD CONSTRAINT "transfusion_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfusion_records" ADD CONSTRAINT "transfusion_records_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfusion_records" ADD CONSTRAINT "transfusion_records_administered_by_id_fkey" FOREIGN KEY ("administered_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfusion_records" ADD CONSTRAINT "transfusion_records_witness_nurse_id_fkey" FOREIGN KEY ("witness_nurse_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_discard_records" ADD CONSTRAINT "blood_discard_records_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "blood_inventory_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_discard_records" ADD CONSTRAINT "blood_discard_records_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blood_discard_records" ADD CONSTRAINT "blood_discard_records_authorized_by_id_fkey" FOREIGN KEY ("authorized_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "clinical_encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_transactions" ADD CONSTRAINT "refund_transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_transactions" ADD CONSTRAINT "refund_transactions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_transactions" ADD CONSTRAINT "refund_transactions_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_ledgers" ADD CONSTRAINT "revenue_ledgers_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_ledger_accounts" ADD CONSTRAINT "general_ledger_accounts_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_debit_account_id_fkey" FOREIGN KEY ("debit_account_id") REFERENCES "general_ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_credit_account_id_fkey" FOREIGN KEY ("credit_account_id") REFERENCES "general_ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_posted_by_fkey" FOREIGN KEY ("posted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_audit_logs" ADD CONSTRAINT "financial_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_audit_logs" ADD CONSTRAINT "financial_audit_logs_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abha_profiles" ADD CONSTRAINT "abha_profiles_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abdm_consents" ADD CONSTRAINT "abdm_consents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abdm_consents" ADD CONSTRAINT "abdm_consents_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_record_shares" ADD CONSTRAINT "health_record_shares_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_record_shares" ADD CONSTRAINT "health_record_shares_source_facility_id_fkey" FOREIGN KEY ("source_facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_record_shares" ADD CONSTRAINT "health_record_shares_target_facility_id_fkey" FOREIGN KEY ("target_facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_record_shares" ADD CONSTRAINT "health_record_shares_consent_id_fkey" FOREIGN KEY ("consent_id") REFERENCES "abdm_consents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abdm_audit_logs" ADD CONSTRAINT "abdm_audit_logs_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_devices" ADD CONSTRAINT "medical_devices_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_devices" ADD CONSTRAINT "medical_devices_assigned_patient_id_fkey" FOREIGN KEY ("assigned_patient_id") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_devices" ADD CONSTRAINT "medical_devices_assigned_bed_id_fkey" FOREIGN KEY ("assigned_bed_id") REFERENCES "beds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_vital_streams" ADD CONSTRAINT "patient_vital_streams_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_vital_streams" ADD CONSTRAINT "patient_vital_streams_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_vital_streams" ADD CONSTRAINT "patient_vital_streams_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "medical_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_alerts" ADD CONSTRAINT "patient_alerts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_alerts" ADD CONSTRAINT "patient_alerts_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_alerts" ADD CONSTRAINT "patient_alerts_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "medical_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_alerts" ADD CONSTRAINT "patient_alerts_acknowledged_by_id_fkey" FOREIGN KEY ("acknowledged_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_rules" ADD CONSTRAINT "clinical_rules_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_safety_audits" ADD CONSTRAINT "medication_safety_audits_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_safety_audits" ADD CONSTRAINT "medication_safety_audits_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_safety_audits" ADD CONSTRAINT "medication_safety_audits_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icu_admissions" ADD CONSTRAINT "icu_admissions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icu_admissions" ADD CONSTRAINT "icu_admissions_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icu_admissions" ADD CONSTRAINT "icu_admissions_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icu_admissions" ADD CONSTRAINT "icu_admissions_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "beds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventilators" ADD CONSTRAINT "ventilators_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventilator_assignments" ADD CONSTRAINT "ventilator_assignments_ventilator_id_fkey" FOREIGN KEY ("ventilator_id") REFERENCES "ventilators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventilator_assignments" ADD CONSTRAINT "ventilator_assignments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventilator_assignments" ADD CONSTRAINT "ventilator_assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icu_vitals_monitors" ADD CONSTRAINT "icu_vitals_monitors_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icu_vitals_monitors" ADD CONSTRAINT "icu_vitals_monitors_icu_admission_id_fkey" FOREIGN KEY ("icu_admission_id") REFERENCES "icu_admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icu_rounds" ADD CONSTRAINT "icu_rounds_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icu_rounds" ADD CONSTRAINT "icu_rounds_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_blue_events" ADD CONSTRAINT "code_blue_events_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_blue_events" ADD CONSTRAINT "code_blue_events_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_blue_events" ADD CONSTRAINT "code_blue_events_triggered_by_id_fkey" FOREIGN KEY ("triggered_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_care_alerts" ADD CONSTRAINT "critical_care_alerts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_care_alerts" ADD CONSTRAINT "critical_care_alerts_icu_admission_id_fkey" FOREIGN KEY ("icu_admission_id") REFERENCES "icu_admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_care_alerts" ADD CONSTRAINT "critical_care_alerts_acknowledged_by_id_fkey" FOREIGN KEY ("acknowledged_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_cycles" ADD CONSTRAINT "revenue_cycles_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_cycles" ADD CONSTRAINT "revenue_cycles_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_cycles" ADD CONSTRAINT "revenue_cycles_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_receivables" ADD CONSTRAINT "accounts_receivables_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_receivables" ADD CONSTRAINT "accounts_receivables_insurance_claim_id_fkey" FOREIGN KEY ("insurance_claim_id") REFERENCES "insurance_claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_receivables" ADD CONSTRAINT "accounts_receivables_corporate_invoice_id_fkey" FOREIGN KEY ("corporate_invoice_id") REFERENCES "corporate_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_receivables" ADD CONSTRAINT "accounts_receivables_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_receivables" ADD CONSTRAINT "accounts_receivables_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_activities" ADD CONSTRAINT "collection_activities_receivable_id_fkey" FOREIGN KEY ("receivable_id") REFERENCES "accounts_receivables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_activities" ADD CONSTRAINT "collection_activities_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_contracts" ADD CONSTRAINT "corporate_contracts_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_invoices" ADD CONSTRAINT "corporate_invoices_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "corporate_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_forecasts" ADD CONSTRAINT "revenue_forecasts_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
