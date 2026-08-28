import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { AuditStatus } from '@prisma/client';

export class CreateQualityAuditDto {
  @IsNotEmpty()
  @IsString()
  auditName!: string;

  @IsNotEmpty()
  @IsString()
  departmentId!: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsNotEmpty()
  @IsString()
  findings!: string;

  @IsOptional()
  @IsString()
  recommendations?: string;

  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;
}
