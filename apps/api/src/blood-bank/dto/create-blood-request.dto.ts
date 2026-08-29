import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { BloodGroup, BloodComponent } from '@prisma/client';

export class CreateBloodRequestDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsOptional()
  admissionId?: string;

  @IsString()
  @IsOptional()
  encounterId?: string;

  @IsString()
  @IsOptional()
  facilityId?: string;

  @IsString()
  @IsOptional()
  doctorId?: string;

  @IsEnum(BloodGroup)
  bloodGroup!: BloodGroup;

  @IsEnum(BloodComponent)
  @IsOptional()
  component?: BloodComponent;

  @IsInt()
  @Min(1)
  unitsRequested!: number;

  @IsString()
  @IsOptional()
  urgency?: string; // ROUTINE, URGENT, STAT_EMERGENCY

  @IsString()
  @IsOptional()
  clinicalIndication?: string;
}
