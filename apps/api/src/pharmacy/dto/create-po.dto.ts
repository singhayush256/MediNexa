import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class POItemDto {
  @IsNotEmpty()
  @IsString()
  drugMasterId!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantityOrdered!: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;
}

export class CreatePurchaseOrderDto {
  @IsNotEmpty()
  @IsString()
  supplierName!: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => POItemDto)
  items!: POItemDto[];
}
