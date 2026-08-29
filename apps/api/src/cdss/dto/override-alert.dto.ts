import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class OverrideAlertDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  overrideReason!: string;

  @IsString()
  @IsOptional()
  medicationOrderId?: string;

  @IsNumber()
  @IsOptional()
  alertCount?: number;
}
