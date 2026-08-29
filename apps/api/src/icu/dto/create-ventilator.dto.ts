import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { VentilatorStatus } from '@prisma/client';

export class CreateVentilatorDto {
  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsNotEmpty()
  @IsString()
  ventilatorNumber!: string;

  @IsNotEmpty()
  @IsString()
  manufacturer!: string;

  @IsNotEmpty()
  @IsString()
  model!: string;

  @IsOptional()
  @IsEnum(VentilatorStatus)
  status?: VentilatorStatus;
}
