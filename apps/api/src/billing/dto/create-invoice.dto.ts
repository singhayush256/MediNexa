import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsInt, Min, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { RevenueCategory } from '@prisma/client';

export class InvoiceItemInputDto {
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

  @IsOptional()
  @IsNumber()
  taxPercent?: number;

  @IsOptional()
  @IsNumber()
  discountPercent?: number;
}

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsString()
  admissionId?: string;

  @IsOptional()
  @IsString()
  encounterId?: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemInputDto)
  items?: InvoiceItemInputDto[];
}
