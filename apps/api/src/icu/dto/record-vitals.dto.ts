import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class RecordVitalsDto {
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsString()
  icuAdmissionId?: string;

  @IsNotEmpty()
  @IsNumber()
  heartRate!: number;

  @IsNotEmpty()
  @IsNumber()
  respiratoryRate!: number;

  @IsNotEmpty()
  @IsNumber()
  oxygenSaturation!: number;

  @IsNotEmpty()
  @IsNumber()
  systolicBP!: number;

  @IsNotEmpty()
  @IsNumber()
  diastolicBP!: number;

  @IsNotEmpty()
  @IsNumber()
  temperature!: number;

  @IsOptional()
  @IsNumber()
  urineOutput?: number;
}
