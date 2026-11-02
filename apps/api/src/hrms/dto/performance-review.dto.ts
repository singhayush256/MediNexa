import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreatePerformanceReviewDto {
  @IsNotEmpty()
  @IsString()
  employeeId!: string;

  @IsNotEmpty()
  @IsString()
  reviewPeriod!: string; // e.g. "2026-Q3", "Annual 2026"

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsNotEmpty()
  @IsString()
  strengths!: string;

  @IsNotEmpty()
  @IsString()
  improvements!: string;

  @IsNotEmpty()
  @IsString()
  comments!: string;
}
