import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { InfectionSeverity } from '@prisma/client';

export class CreateInfectionDto {
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsString()
  admissionId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsNotEmpty()
  @IsString()
  infectionType!: string;

  @IsOptional()
  @IsString()
  infectionSource?: string;

  @IsOptional()
  @IsEnum(InfectionSeverity)
  severity?: InfectionSeverity;

  @IsOptional()
  @IsString()
  rootCauseAnalysis?: string;

  @IsOptional()
  @IsString()
  correctiveAction?: string;

  @IsOptional()
  @IsString()
  preventiveAction?: string;
}
