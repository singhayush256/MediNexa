import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AdmissionStatus } from '@medinexa/types';

export class UpdateAdmissionStatusDto {
  @IsEnum(AdmissionStatus, { message: 'Status must be a valid AdmissionStatus enum' })
  status!: AdmissionStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
