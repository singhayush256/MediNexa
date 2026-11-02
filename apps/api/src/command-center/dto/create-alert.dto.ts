import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { AlertSeverity, AlertCategory } from '@prisma/client';

export class CreateExecutiveAlertDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @IsOptional()
  @IsEnum(AlertCategory)
  category?: AlertCategory;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
