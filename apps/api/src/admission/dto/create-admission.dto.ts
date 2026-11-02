import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AdmissionType } from '@medinexa/types';

export class CreateAdmissionDto {
  @IsString()
  @IsNotEmpty({ message: 'Patient ID is required' })
  patientId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Facility ID is required' })
  facilityId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Department ID is required' })
  departmentId!: string;

  @IsEnum(AdmissionType, { message: 'Admission type must be a valid AdmissionType enum' })
  admissionType!: AdmissionType;

  @IsOptional()
  @IsString()
  bedId?: string;

  @IsOptional()
  @IsString()
  expectedDischargeAt?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
