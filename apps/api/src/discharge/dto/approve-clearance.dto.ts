import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ClearanceStatus } from '@prisma/client';

export class ApproveClearanceDto {
  @IsNotEmpty()
  @IsString()
  admissionId!: string;

  @IsNotEmpty()
  @IsEnum(ClearanceStatus)
  status!: ClearanceStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}
