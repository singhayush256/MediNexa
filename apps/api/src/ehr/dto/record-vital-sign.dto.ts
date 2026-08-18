import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class RecordVitalSignDto {
  @IsOptional()
  @IsNumber({}, { message: 'Temperature must be a valid number' })
  @Min(30)
  @Max(45)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(250)
  heartRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(80)
  respiratoryRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(300)
  systolicBP?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(200)
  diastolicBP?: number;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(100)
  oxygenSaturation?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(500)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  height?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
