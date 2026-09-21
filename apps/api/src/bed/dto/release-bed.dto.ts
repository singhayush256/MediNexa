import { IsOptional, IsString, IsEnum } from 'class-validator';
import { BedStatus } from '@medinexa/types';

export class ReleaseBedDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsEnum(BedStatus)
  targetStatus?: BedStatus;
}
