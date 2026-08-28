import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CheckInDto {
  @IsNotEmpty()
  @IsString()
  employeeId!: string;

  @IsOptional()
  @IsString()
  facilityId?: string;
}

export class CheckOutDto {
  @IsNotEmpty()
  @IsString()
  employeeId!: string;
}
