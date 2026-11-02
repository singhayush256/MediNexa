import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { BillingCycle } from '@prisma/client';

export class SubscribeDto {
  @IsNotEmpty()
  @IsString()
  planCode!: string;

  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @IsOptional()
  @IsString()
  paymentProvider?: string;

  @IsOptional()
  @IsString()
  transactionReference?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}
