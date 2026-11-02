import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class RecordVitalSignDto {
  @IsOptional()
  @IsNumber({}, { message: 'Temperature must be a valid numeric value' })
  @Min(30, { message: 'Temperature must be at least 30°C' })
  @Max(45, { message: 'Temperature cannot exceed 45°C' })
  temperature?: number;

  @IsOptional()
  @IsInt({ message: 'Heart Rate must be a valid integer number' })
  @Min(20, { message: 'Heart Rate must be at least 20 bpm' })
  @Max(250, { message: 'Heart Rate cannot exceed 250 bpm' })
  heartRate?: number;

  @IsOptional()
  @IsInt({ message: 'Respiratory Rate must be a valid integer number' })
  @Min(5, { message: 'Respiratory Rate must be at least 5 rpm' })
  @Max(80, { message: 'Respiratory Rate cannot exceed 80 rpm' })
  respiratoryRate?: number;

  @IsOptional()
  @IsInt({ message: 'Systolic BP must be a valid positive integer' })
  @Min(40, { message: 'Systolic BP must be at least 40 mmHg' })
  @Max(300, { message: 'Systolic BP cannot exceed 300 mmHg' })
  systolicBP?: number;

  @IsOptional()
  @IsInt({ message: 'Diastolic BP must be a valid positive integer' })
  @Min(20, { message: 'Diastolic BP must be at least 20 mmHg' })
  @Max(200, { message: 'Diastolic BP cannot exceed 200 mmHg' })
  diastolicBP?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Oxygen Saturation must be a valid numeric percentage' })
  @Min(0, { message: 'Oxygen Saturation cannot be less than 0%' })
  @Max(100, { message: 'Oxygen Saturation cannot exceed 100%' })
  oxygenSaturation?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Weight must be a valid number' })
  @Min(0.5)
  @Max(500)
  weight?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Height must be a valid number' })
  @Min(20)
  @Max(300)
  height?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
