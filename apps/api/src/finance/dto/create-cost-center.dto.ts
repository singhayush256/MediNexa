import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateCostCenterDto {
  @IsString()
  @IsOptional()
  facilityId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsNumber()
  @Min(0)
  budgetAmount!: number;
}
