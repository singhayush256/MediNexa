import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WardType, WardStatus } from '@medinexa/types';

export class UpdateWardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(WardType)
  wardType?: WardType;

  @IsOptional()
  @IsString()
  genderPolicy?: string;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsEnum(WardStatus)
  status?: WardStatus;
}
