import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DeviceStatus } from '@prisma/client';

export class UpdateDeviceStatusDto {
  @IsEnum(DeviceStatus)
  @IsNotEmpty()
  status!: DeviceStatus;

  @IsString()
  @IsOptional()
  assignedPatientId?: string;

  @IsString()
  @IsOptional()
  assignedBedId?: string;
}
