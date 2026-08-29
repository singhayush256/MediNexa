import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MedicationItemDto {
  @IsString()
  @IsNotEmpty()
  drugName!: string;

  @IsString()
  @IsOptional()
  dosage?: string;

  @IsNumber()
  @IsOptional()
  doseValue?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  route?: string;

  @IsString()
  @IsOptional()
  frequency?: string;
}

export class CheckMedicationDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationItemDto)
  medications!: MedicationItemDto[];

  @IsString()
  @IsOptional()
  encounterId?: string;

  @IsString()
  @IsOptional()
  doctorId?: string;

  @IsBoolean()
  @IsOptional()
  isPregnant?: boolean;

  @IsNumber()
  @IsOptional()
  eGfr?: number;

  @IsNumber()
  @IsOptional()
  serumCreatinine?: number;

  @IsNumber()
  @IsOptional()
  patientAge?: number;

  @IsString()
  @IsOptional()
  facilityId?: string;
}
