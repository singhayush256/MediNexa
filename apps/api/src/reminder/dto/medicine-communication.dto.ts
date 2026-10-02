import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MedicineCommunicationReason } from '@medinexa/types';

export class ToggleMedicineCommunicationDto {
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsNotEmpty()
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsString()
  reason?: MedicineCommunicationReason | string;

  @IsOptional()
  @IsString()
  reasonNote?: string;
}
