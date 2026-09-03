import { IsNotEmpty, IsString, IsOptional, IsInt, IsNumber, Min } from 'class-validator';

export class InventoryAdjustmentDto {
  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  medicineName?: string;

  @IsOptional()
  @IsString()
  genericName?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsInt()
  stockQuantity?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  reorderLevel?: number;

  @IsOptional()
  @IsString()
  expiryDate?: string;

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
