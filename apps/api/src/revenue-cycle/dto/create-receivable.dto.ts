import { IsNotEmpty, IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ReceivableType, CollectionStatus } from '@prisma/client';

export class CreateReceivableDto {
  @IsOptional()
  @IsString()
  receivableNumber?: string;

  @IsNotEmpty()
  @IsEnum(ReceivableType)
  receivableType!: ReceivableType;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  insuranceClaimId?: string;

  @IsOptional()
  @IsString()
  corporateInvoiceId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  outstandingAmount?: number;

  @IsNotEmpty()
  @IsString()
  dueDate!: string;

  @IsOptional()
  @IsEnum(CollectionStatus)
  collectionStatus?: CollectionStatus;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}
