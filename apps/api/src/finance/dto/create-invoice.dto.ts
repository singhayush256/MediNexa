import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceLineItemDto {
  @IsString()
  @IsNotEmpty()
  category!: string; // OPD, IPD, PHARMACY, LAB, TELEMEDICINE, PROCEDURE, BED_CHARGE

  @IsString()
  @IsNotEmpty()
  itemName!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsOptional()
  admissionId?: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsString()
  @IsOptional()
  facilityId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems!: InvoiceLineItemDto[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  taxAmount?: number;
}
