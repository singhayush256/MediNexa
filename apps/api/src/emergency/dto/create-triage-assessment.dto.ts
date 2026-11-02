import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { TriageLevel } from '@prisma/client';

export class CreateTriageAssessmentDto {
  @IsNotEmpty()
  @IsString()
  emergencyVisitId!: string;

  @IsNotEmpty()
  @IsEnum(TriageLevel)
  triageLevel!: TriageLevel;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  pulse?: number;

  @IsOptional()
  @IsNumber()
  respiratoryRate?: number;

  @IsOptional()
  @IsNumber()
  oxygenSaturation?: number;

  @IsOptional()
  @IsNumber()
  systolicBP?: number;

  @IsOptional()
  @IsNumber()
  diastolicBP?: number;

  @IsOptional()
  @IsNumber()
  painScore?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
