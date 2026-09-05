import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class UpdateMedicationDto {
  @IsString()
  @IsOptional()
  medicineName?: string;

  @IsString()
  @IsOptional()
  dosage?: string;

  @IsString()
  @IsOptional()
  frequency?: string;

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
}
