import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BedType, BedStatus } from '@medinexa/types';

export class CreateBedDto {
  @IsString()
  @IsNotEmpty({ message: 'Room ID is required' })
  roomId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Bed number is required' })
  bedNumber!: string;

  @IsEnum(BedType, { message: 'Bed type must be a valid BedType enum' })
  bedType!: BedType;

  @IsOptional()
  @IsEnum(BedStatus)
  status?: BedStatus;

  @IsOptional()
  @IsString()
  genderPolicy?: string;
}
