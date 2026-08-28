import { IsNotEmpty, IsString, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DispenseItemDto {
  @IsNotEmpty()
  @IsString()
  itemId!: string;

  @IsNotEmpty()
  @IsString()
  inventoryId!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  dispenseQuantity!: number;
}

export class DispenseMedicationDto {
  @IsNotEmpty()
  @IsString()
  medicationOrderId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DispenseItemDto)
  dispensedItems!: DispenseItemDto[];
}
