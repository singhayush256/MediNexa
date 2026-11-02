import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { BedType, BedStatus } from '@medinexa/types';

export class UpdateBedDto {
  @IsOptional()
  @IsEnum(BedType)
  bedType?: BedType;

  @IsOptional()
  @IsEnum(BedStatus)
  status?: BedStatus;

  @IsOptional()
  @IsString()
  genderPolicy?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
