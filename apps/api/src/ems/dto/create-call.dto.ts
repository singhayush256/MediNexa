import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { DispatchPriority } from '@prisma/client';

export class CreateEmergencyCallDto {
  @IsNotEmpty()
  @IsString()
  callerName!: string;

  @IsNotEmpty()
  @IsString()
  callerPhone!: string;

  @IsNotEmpty()
  @IsString()
  emergencyType!: string;

  @IsNotEmpty()
  @IsString()
  incidentLocation!: string;

  @IsOptional()
  @IsEnum(DispatchPriority)
  priority?: DispatchPriority;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
