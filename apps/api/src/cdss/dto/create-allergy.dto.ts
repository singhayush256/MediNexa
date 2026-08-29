import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { AlertSeverity } from '@prisma/client';

export class CreateAllergyDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  allergen!: string;

  @IsString()
  @IsNotEmpty()
  reaction!: string;

  @IsEnum(AlertSeverity)
  @IsOptional()
  severity?: AlertSeverity;
}
