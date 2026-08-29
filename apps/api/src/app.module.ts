import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { PatientModule } from './patient/patient.module';
import { DoctorModule } from './doctor/doctor.module';
import { WardModule } from './ward/ward.module';
import { RoomModule } from './room/room.module';
import { BedModule } from './bed/bed.module';
import { AdmissionModule } from './admission/admission.module';
import { EhrModule } from './ehr/ehr.module';
import { LabModule } from './lab/lab.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { EmergencyModule } from './emergency/emergency.module';
import { AmbulanceModule } from './ambulance/ambulance.module';
import { ReferralModule } from './referral/referral.module';
import { AppointmentModule } from './appointment/appointment.module';
import { NotificationModule } from './notification/notification.module';
import { ReminderModule } from './reminder/reminder.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchModule } from './search/search.module';
import { AiModule } from './ai/ai.module';
import { AuditModule } from './audit/audit.module';
import { PublicModule } from './public/public.module';
import { AttachmentModule } from './attachment/attachment.module';
import { OpdModule } from './opd/opd.module';
import { NursingModule } from './nursing/nursing.module';
import { DischargeModule } from './discharge/discharge.module';
import { TelemedicineModule } from './telemedicine/telemedicine.module';
import { ClinicalCopilotModule } from './clinical-copilot/clinical-copilot.module';
import { LaboratoryModule } from './laboratory/laboratory.module';
import { RadiologyModule } from './radiology/radiology.module';
import { OtModule } from './ot/ot.module';
import { BillingModule } from './billing/billing.module';
import { HrmsModule } from './hrms/hrms.module';
import { InventoryModule } from './inventory/inventory.module';
import { CommandCenterModule } from './command-center/command-center.module';
import { QualityModule } from './quality/quality.module';
import { EmsModule } from './ems/ems.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { RevenueCycleModule } from './revenue-cycle/revenue-cycle.module';
import { PatientPortalModule } from './patient-portal/patient-portal.module';
import { BloodBankModule } from './blood-bank/blood-bank.module';
import { FinanceModule } from './finance/finance.module';
import { BusinessIntelligenceModule } from './business-intelligence/business-intelligence.module';
import { AbdmModule } from './abdm/abdm.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { CdssModule } from './cdss/cdss.module';
import { InsuranceModule } from './insurance/insurance.module';
import { IcuModule } from './icu/icu.module';
import { ProcurementModule } from './procurement/procurement.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    OrganizationModule,
    PatientModule,
    DoctorModule,
    WardModule,
    RoomModule,
    BedModule,
    AdmissionModule,
    EhrModule,
    LabModule,
    PharmacyModule,
    EmergencyModule,
    AmbulanceModule,
    ReferralModule,
    AppointmentModule,
    NotificationModule,
    ReminderModule,
    AnalyticsModule,
    SearchModule,
    AiModule,
    AuditModule,
    PublicModule,
    AttachmentModule,
    OpdModule,
    NursingModule,
    DischargeModule,
    TelemedicineModule,
    ClinicalCopilotModule,
    LaboratoryModule,
    RadiologyModule,
    OtModule,
    BillingModule,
    HrmsModule,
    InventoryModule,
    CommandCenterModule,
    QualityModule,
    EmsModule,
    SubscriptionsModule,
    RevenueCycleModule,
    PatientPortalModule,
    BloodBankModule,
    FinanceModule,
    BusinessIntelligenceModule,
    AbdmModule,
    MonitoringModule,
    CdssModule,
    InsuranceModule,
    IcuModule,
    ProcurementModule,
  ],
})
export class AppModule {}
