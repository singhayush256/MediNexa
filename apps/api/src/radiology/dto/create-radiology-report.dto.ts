import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { FindingSeverity } from '@prisma/client';

export class CreateRadiologyReportDto {
  @IsNotEmpty()
  @IsString()
  imagingOrderId!: string;

  @IsNotEmpty()
  @IsString()
  findings!: string;

  @IsNotEmpty()
  @IsString()
  impression!: string;

  @IsOptional()
  @IsString()
  recommendation?: string;

  @IsOptional()
  @IsEnum(FindingSeverity)
  severity?: FindingSeverity;

  @IsOptional()
  @IsString()
  aiPrelimFindings?: string;

  @IsOptional()
  @IsNumber()
  aiAbnormalityScore?: number;
}
