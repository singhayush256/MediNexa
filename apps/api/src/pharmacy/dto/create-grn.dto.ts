import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GRNItemDto {
  @IsNotEmpty()
  @IsString()
  drugMasterId!: string;

  @IsNotEmpty()
  @IsString()
  batchNumber!: string;

  @IsNotEmpty()
  @IsString()
  expiryDate!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantityReceived!: number;

  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;
}

export class CreateGRNDto {
  @IsNotEmpty()
  @IsString()
  purchaseOrderId!: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GRNItemDto)
  items!: GRNItemDto[];
}
