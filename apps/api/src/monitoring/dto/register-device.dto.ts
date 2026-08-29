import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { DeviceType, DeviceStatus } from '@prisma/client';

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  deviceName!: string;

  @IsString()
  @IsNotEmpty()
  serialNumber!: string;

  @IsEnum(DeviceType)
  @IsNotEmpty()
  deviceType!: DeviceType;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  modelNumber?: string;

  @IsEnum(DeviceStatus)
  @IsOptional()
  status?: DeviceStatus;

  @IsString()
  @IsOptional()
  assignedPatientId?: string;

  @IsString()
  @IsOptional()
  assignedBedId?: string;

  @IsString()
  @IsOptional()
  facilityId?: string;
}
