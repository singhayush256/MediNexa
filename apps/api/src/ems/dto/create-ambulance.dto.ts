import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { AmbulanceType } from '@prisma/client';

export class CreateAmbulanceDto {
  @IsNotEmpty()
  @IsString()
  vehicleNumber!: string;

  @IsNotEmpty()
  @IsString()
  registrationNumber!: string;

  @IsOptional()
  @IsEnum(AmbulanceType)
  ambulanceType?: AmbulanceType;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  equipmentSummary?: string;

  @IsOptional()
  @IsString()
  assignedCrew?: string;

  @IsOptional()
  @IsNumber()
  currentLatitude?: number;

  @IsOptional()
  @IsNumber()
  currentLongitude?: number;
}
