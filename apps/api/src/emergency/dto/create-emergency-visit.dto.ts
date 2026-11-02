import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ArrivalMode } from '@prisma/client';

export class CreateEmergencyVisitDto {
  @IsNotEmpty()
  @IsString()
  patientName!: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  patientPhone?: string;

  @IsNotEmpty()
  @IsString()
  chiefComplaint!: string;

  @IsOptional()
  @IsEnum(ArrivalMode)
  arrivalMode?: ArrivalMode;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
