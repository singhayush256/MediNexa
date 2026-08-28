import { IsNotEmpty, IsString, IsOptional, IsEnum, IsBoolean, IsInt, Min, IsNumber } from 'class-validator';
import { DrugCategory } from '@prisma/client';

export class CreateDrugDto {
  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  genericName?: string;

  @IsOptional()
  @IsString()
  strength?: string;

  @IsOptional()
  @IsString()
  form?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  hsnCode?: string;

  @IsOptional()
  @IsNumber()
  gstPercentage?: number;

  @IsOptional()
  @IsEnum(DrugCategory)
  category?: DrugCategory;

  @IsOptional()
  @IsString()
  unitOfMeasure?: string;

  @IsOptional()
  @IsBoolean()
  isControlled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  reorderLevel?: number;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
