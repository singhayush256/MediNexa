import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class GeneratePayrollDto {
  @IsNotEmpty()
  @IsString()
  payrollMonth!: string; // YYYY-MM

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  basicSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  allowances?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deductions?: number;
}
