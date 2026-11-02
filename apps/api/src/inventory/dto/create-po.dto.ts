import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsDateString } from 'class-validator';

export class CreateProcurementPODto {
  @IsNotEmpty()
  @IsString()
  vendorId!: string;

  @IsOptional()
  @IsString()
  requisitionId?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  totalAmount!: number;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
