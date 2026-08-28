import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateShiftDto {
  @IsNotEmpty()
  @IsString()
  employeeId!: string;

  @IsNotEmpty()
  @IsString()
  departmentId!: string;

  @IsNotEmpty()
  @IsString()
  shiftType!: string; // MORNING, EVENING, NIGHT, ROTATIONAL

  @IsNotEmpty()
  @IsDateString()
  startTime!: string;

  @IsNotEmpty()
  @IsDateString()
  endTime!: string;
}
