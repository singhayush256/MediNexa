import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { RevenueCategory } from '@prisma/client';

export class AddInvoiceItemDto {
  @IsOptional()
  @IsEnum(RevenueCategory)
  category?: RevenueCategory;

  @IsOptional()
  @IsString()
  itemType?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  itemName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsNotEmpty()
  @IsNumber()
  unitPrice!: number;
}
