import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { GuardianDoctorRole, EmergencyPriorityLevel } from '@medinexa/types';

export class CreateFamilyDoctorDto {
  @IsString()
  @IsNotEmpty()
  doctorName!: string;

  @IsString()
  @IsNotEmpty()
  hospitalName!: string;

  @IsString()
  @IsNotEmpty()
  specialization!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  doctorLicenseId?: string;

  @IsEnum(GuardianDoctorRole)
  @IsOptional()
  roleType?: GuardianDoctorRole = GuardianDoctorRole.FAMILY;

  @IsString()
  @IsOptional()
  doctorId?: string;
}

export class CreateEmergencyFamilyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  relation!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsEnum(EmergencyPriorityLevel)
  @IsOptional()
  priorityLevel?: EmergencyPriorityLevel = EmergencyPriorityLevel.PRIMARY;
}

export class UpdateEmergencyThresholdDto {
  @IsNumber()
  @Min(10)
  @Max(90)
  @IsOptional()
  criticalScoreThreshold?: number;

  @IsNumber()
  @Min(70)
  @Max(98)
  @IsOptional()
  minSpo2Threshold?: number;

  @IsNumber()
  @Min(90)
  @Max(200)
  @IsOptional()
  maxHeartRateThreshold?: number;

  @IsNumber()
  @Min(35)
  @Max(60)
  @IsOptional()
  minHeartRateThreshold?: number;

  @IsNumber()
  @Min(120)
  @Max(220)
  @IsOptional()
  maxSystolicBpThreshold?: number;

  @IsNumber()
  @Min(60)
  @Max(100)
  @IsOptional()
  minSystolicBpThreshold?: number;

  @IsBoolean()
  @IsOptional()
  autoAmbulanceDispatch?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyFamilyDoctors?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyFamilyMembers?: boolean;
}

export class TriggerSosDto {
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  locationAddress?: string;

  @IsString()
  @IsOptional()
  emergencyNotes?: string;
}
