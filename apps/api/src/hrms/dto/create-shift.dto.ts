import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateShiftDto {
  @IsNotEmpty()
  @IsString()
  employeeId!: string;

  @IsOptional()
  @IsString()
  shiftName?: string;

  @IsOptional()
  @IsString()
  shiftType?: string; // MORNING, EVENING, NIGHT, ROTATIONAL, ICU_STAT

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsNotEmpty()
  @IsDateString()
  startTime!: string;

  @IsNotEmpty()
  @IsDateString()
  endTime!: string;
}
