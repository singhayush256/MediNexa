import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsEmail } from 'class-validator';
import { EmployeeStatus, EmploymentType } from '@prisma/client';

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsNotEmpty()
  @IsString()
  designation!: string;

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
  @IsString()
  employeeCode?: string;

  @IsOptional()
  @IsString()
  joiningDate?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  employeeStatus?: EmployeeStatus;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional()
  @IsString()
  reportingManagerId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNumber()
  basicSalary?: number;

  @IsOptional()
  @IsNumber()
  hra?: number;

  @IsOptional()
  @IsNumber()
  allowances?: number;

  @IsOptional()
  @IsNumber()
  deductions?: number;
}
