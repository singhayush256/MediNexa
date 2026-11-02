import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { TokenPriority } from '@prisma/client';

export class CreateOpdTokenDto {
  @IsNotEmpty()
  @IsString()
  patientName!: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  patientPhone?: string;

  @IsNotEmpty()
  @IsString()
  doctorId!: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(TokenPriority)
  priority?: TokenPriority;

  @IsOptional()
  @IsString()
  notes?: string;
}
