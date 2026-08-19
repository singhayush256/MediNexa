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
  ],
})
export class AppModule {}
