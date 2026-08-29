import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CheckInDto {
  @IsNotEmpty()
  @IsString()
  employeeId!: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  attendanceDate?: string;

  @IsOptional()
  @IsString()
  checkInTime?: string;
}

export class CheckOutDto {
  @IsNotEmpty()
  @IsString()
  employeeId!: string;

  @IsOptional()
  @IsString()
  checkOutTime?: string;
}
