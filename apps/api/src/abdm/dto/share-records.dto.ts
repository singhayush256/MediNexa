import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { AbdmRecordType } from '@prisma/client';

export class ShareRecordsDto {
  @IsString()
  @IsNotEmpty()
  consentId!: string;

  @IsEnum(AbdmRecordType)
  @IsNotEmpty()
  recordType!: AbdmRecordType;

  @IsString()
  @IsOptional()
  targetFacilityId?: string;

  @IsString()
  @IsOptional()
  recordReference?: string;
}
