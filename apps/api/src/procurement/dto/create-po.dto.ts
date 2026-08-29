import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class POLineItemDto {
  @IsNotEmpty()
  @IsString()
  itemName!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreatePurchaseOrderDto {
  @IsNotEmpty()
  @IsString()
  vendorId!: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  requisitionId?: string;

  @IsOptional()
  @IsString()
  rfqId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => POLineItemDto)
  lineItems!: POLineItemDto[];

  @IsOptional()
  @IsNumber()
  totalAmount?: number;
}
