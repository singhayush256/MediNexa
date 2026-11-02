import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LogMedicationDoseDto {
  @IsString()
  @IsNotEmpty()
  doseTime!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  scheduledFor?: string;
}
