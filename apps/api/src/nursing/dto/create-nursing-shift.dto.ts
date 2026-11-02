import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ShiftType } from '@prisma/client';

export class CreateNursingShiftDto {
  @IsNotEmpty()
  @IsEnum(ShiftType)
  shiftType!: ShiftType;

  @IsOptional()
  @IsString()
  wardId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  handoverNotes?: string;
}
