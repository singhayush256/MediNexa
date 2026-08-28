import { IsNotEmpty, IsString, IsOptional, IsInt, IsNumber, Min } from 'class-validator';

export class InventoryAdjustmentDto {
  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsNotEmpty()
  @IsString()
  medicineName!: string;

  @IsOptional()
  @IsString()
  genericName?: string;

  @IsNotEmpty()
  @IsString()
  batchNumber!: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsNotEmpty()
  @IsInt()
  stockQuantity!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  reorderLevel?: number;

  @IsNotEmpty()
  @IsString()
  expiryDate!: string;

  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  @IsNumber()
  sellingPrice?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
