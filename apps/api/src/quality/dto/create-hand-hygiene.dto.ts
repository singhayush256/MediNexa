import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateHandHygieneDto {
  @IsNotEmpty()
  @IsString()
  departmentId!: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsNotEmpty()
  @IsNumber()
  compliancePercentage!: number;

  @IsOptional()
  @IsString()
  observationDate?: string;
}
