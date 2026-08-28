import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class BillingLineItemDto {
  @IsNotEmpty()
  @IsString()
  itemType!: string; // LAB, PHARMACY, OPD, IPD, TELEMEDICINE, SURGERY, OTHER

  @IsNotEmpty()
  @IsString()
  itemName!: string;

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
  notes?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillingLineItemDto)
  items!: BillingLineItemDto[];
}
