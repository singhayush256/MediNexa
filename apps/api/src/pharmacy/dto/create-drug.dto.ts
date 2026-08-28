import { IsNotEmpty, IsString, IsOptional, IsEnum, IsBoolean, IsInt, Min } from 'class-validator';
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
