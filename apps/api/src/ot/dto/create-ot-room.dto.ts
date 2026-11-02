import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { OtRoomStatus } from '@prisma/client';

export class CreateOtRoomDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsOptional()
  @IsEnum(OtRoomStatus)
  status?: OtRoomStatus;

  @IsOptional()
  @IsString()
  equipmentDetails?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
