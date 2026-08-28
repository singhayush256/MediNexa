import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { SurgeryStatus } from '@prisma/client';

export class UpdateSurgeryStatusDto {
  @IsNotEmpty()
  @IsEnum(SurgeryStatus)
  status!: SurgeryStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
