import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class AdministerMedicationDto {
  @IsNotEmpty()
  @IsString()
  admissionId!: string;

  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsNotEmpty()
  @IsString()
  medicationName!: string;

  @IsNotEmpty()
  @IsString()
  doseGiven!: string;

  @IsOptional()
  @IsString()
  prescriptionItemId?: string;

  @IsOptional()
  @IsBoolean()
  isControlled?: boolean;

  @IsOptional()
  @IsString()
  witnessNurseId?: string;

  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
