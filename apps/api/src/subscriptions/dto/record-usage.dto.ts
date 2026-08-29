import { IsNotEmpty, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { MetricType } from '@prisma/client';

export class RecordUsageDto {
  @IsNotEmpty()
  @IsEnum(MetricType)
  metricType!: MetricType;

  @IsNotEmpty()
  @IsNumber()
  metricValue!: number;

  @IsOptional()
  @IsString()
  organizationId?: string;
}
