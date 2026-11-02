import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSafetyChecklistDto {
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
  checklistType!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
