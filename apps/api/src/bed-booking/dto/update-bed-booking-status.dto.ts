import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { BedBookingStatus } from '@medinexa/types';

export class UpdateBedBookingStatusDto {
  @IsEnum(BedBookingStatus, { message: 'Valid booking status is required' })
  status!: BedBookingStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  allocatedBedId?: string;
}
