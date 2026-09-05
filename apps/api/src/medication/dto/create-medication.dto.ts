import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateMedicationDto {
  @IsString()
  @IsNotEmpty()
  medicineName!: string;

  @IsString()
  @IsNotEmpty()
  dosage!: string;

  @IsString()
  @IsNotEmpty()
  frequency!: string;

  @IsArray()
  @IsOptional()
  timing?: string[];

  @IsBoolean()
  @IsOptional()
  beforeMeal?: boolean;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  prescribedBy?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  patientId?: string;
}
