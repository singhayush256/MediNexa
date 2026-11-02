import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdatePatientProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  addressData?: any;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  medicalConditions?: any;

  @IsOptional()
  pastSurgeries?: any;

  @IsOptional()
  familyMedicalHistory?: any;

  @IsOptional()
  longTermMedications?: any;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  emergencyContactRelation?: string;

  @IsOptional()
  @IsString()
  emergencyContactAltPhone?: string;

  @IsOptional()
  @IsString()
  emergencyContactNotes?: string;

  @IsOptional()
  notificationPreferences?: {
    emailEnabled?: boolean;
    whatsappEnabled?: boolean;
    appointmentReminders?: boolean;
    medicationReminders?: boolean;
    labReportAlerts?: boolean;
  };

  @IsOptional()
  privacySettings?: any;
}
