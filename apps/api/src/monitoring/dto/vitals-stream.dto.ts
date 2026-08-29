import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class VitalsStreamDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsNumber()
  @IsOptional()
  heartRate?: number;

  @IsNumber()
  @IsOptional()
  systolicBP?: number;

  @IsNumber()
  @IsOptional()
  diastolicBP?: number;

  @IsNumber()
  @IsOptional()
  spo2?: number;

  @IsNumber()
  @IsOptional()
  respiratoryRate?: number;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  bloodGlucose?: number;

  @IsString()
  @IsOptional()
  facilityId?: string;
}
