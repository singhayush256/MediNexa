import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RequisitionItemDto {
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
  estimatedCost!: number;
}

export class CreatePurchaseRequisitionDto {
  @IsNotEmpty()
  @IsString()
  department!: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequisitionItemDto)
  items!: RequisitionItemDto[];
}
