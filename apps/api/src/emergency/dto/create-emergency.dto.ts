import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { EmergencyType, EmergencySeverity } from '@medinexa/types';

export class CreateEmergencyRequestDto {
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Caller name is required' })
  callerName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Caller phone is required' })
  callerPhone!: string;

  @IsString()
  @IsNotEmpty({ message: 'Pickup address is required' })
  pickupAddress!: string;

  @IsOptional()
  @IsNumber()
  pickupLatitude?: number;

  @IsOptional()
  @IsNumber()
  pickupLongitude?: number;

  @IsEnum(EmergencyType, { message: 'Emergency type must be a valid EmergencyType enum' })
  emergencyType!: EmergencyType;

  @IsOptional()
  @IsEnum(EmergencySeverity, { message: 'Severity must be a valid EmergencySeverity enum' })
  severity?: EmergencySeverity;

  @IsOptional()
  @IsString()
  sourceFacilityId?: string;

  @IsOptional()
  @IsString()
  destinationFacilityId?: string;
}
