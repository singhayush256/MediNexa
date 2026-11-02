import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateVitalsFlowsheetDto {
  @IsNotEmpty()
  @IsString()
  admissionId!: string;

  @IsNotEmpty()
  @IsString()
  patientId!: string;

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
  bloodGlucose?: number;

  @IsOptional()
  @IsNumber()
  painScore?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
