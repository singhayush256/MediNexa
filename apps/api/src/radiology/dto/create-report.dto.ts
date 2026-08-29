import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { FindingSeverity } from '@prisma/client';

export class CreateReportDto {
  @IsOptional()
  @IsString()
  studyId?: string;

  @IsOptional()
  @IsString()
  imagingOrderId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

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
}

export class CreateRadiologyReportDto extends CreateReportDto {}
