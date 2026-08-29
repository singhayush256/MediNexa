import { IsOptional, IsString, IsEnum, IsEmail } from 'class-validator';
import { EmployeeStatus } from '@prisma/client';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  employeeStatus?: EmployeeStatus;

  @IsOptional()
  @IsString()
  reportingManagerId?: string;
}
