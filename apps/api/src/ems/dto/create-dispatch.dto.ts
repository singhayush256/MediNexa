import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { DispatchPriority } from '@prisma/client';

export class CreateEmergencyDispatchDto {
  @IsNotEmpty()
  @IsString()
  patientName!: string;

  @IsNotEmpty()
  @IsString()
  patientPhone!: string;

  @IsNotEmpty()
  @IsString()
  emergencyType!: string;

  @IsNotEmpty()
  @IsString()
  pickupAddress!: string;

  @IsOptional()
  @IsNumber()
  pickupLatitude?: number;

  @IsOptional()
  @IsNumber()
  pickupLongitude?: number;

  @IsOptional()
  @IsString()
  destinationFacilityId?: string;

  @IsOptional()
  @IsString()
  ambulanceId?: string;

  @IsOptional()
  @IsEnum(DispatchPriority)
  priority?: DispatchPriority;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
