import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class AllocatePaymentDto {
  @IsNotEmpty()
  @IsString()
  paymentReference!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsNotEmpty()
  @IsString()
  allocatedTo!: string; // receivableId or invoiceId or corporateId

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
