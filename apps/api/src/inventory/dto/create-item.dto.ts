import { IsNotEmpty, IsString, IsOptional, IsInt, Min, IsNumber } from 'class-validator';

export class CreateInventoryItemDto {
  @IsOptional()
  @IsString()
  itemCode?: string;

  @IsNotEmpty()
  @IsString()
  itemName!: string;

  @IsNotEmpty()
  @IsString()
  category!: string; // MEDICAL_SUPPLIES, SURGICAL_CONSUMABLES, PPE, LINEN, LAB_REAGENTS, OFFICE_EQUIPMENT

  @IsOptional()
  @IsString()
  unitOfMeasure?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentStock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minimumStock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reorderLevel?: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
