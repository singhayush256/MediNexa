import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DiagnosisStatus, DiagnosisType } from '@medinexa/types';

export class CreateDiagnosisDto {
  @IsOptional()
  @IsString()
  diagnosisCode?: string;

  @IsString()
  @IsNotEmpty({ message: 'Diagnosis name is required' })
  diagnosisName!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DiagnosisType, { message: 'Type must be a valid DiagnosisType enum' })
  diagnosisType?: DiagnosisType;

  @IsOptional()
  @IsEnum(DiagnosisStatus, { message: 'Status must be a valid DiagnosisStatus enum' })
  status?: DiagnosisStatus;
}

export class UpdateDiagnosisDto {
  @IsOptional()
  @IsString()
  diagnosisCode?: string;

  @IsOptional()
  @IsString()
  diagnosisName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DiagnosisType, { message: 'Type must be a valid DiagnosisType enum' })
  diagnosisType?: DiagnosisType;

  @IsOptional()
  @IsEnum(DiagnosisStatus, { message: 'Status must be a valid DiagnosisStatus enum' })
  status?: DiagnosisStatus;
}
