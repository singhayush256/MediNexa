import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GRNLineItemDto {
  @IsNotEmpty()
  @IsString()
  itemName!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantityReceived!: number;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;
}

export class CreateGoodsReceiptDto {
  @IsNotEmpty()
  @IsString()
  purchaseOrderId!: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GRNLineItemDto)
  lineItems!: GRNLineItemDto[];
}
