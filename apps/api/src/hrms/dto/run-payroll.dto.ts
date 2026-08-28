import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RunPayrollDto {
  @IsNotEmpty()
  @IsString()
  payrollMonth!: string; // e.g. "2026-08"

  @IsOptional()
  @IsString()
  facilityId?: string;
}
