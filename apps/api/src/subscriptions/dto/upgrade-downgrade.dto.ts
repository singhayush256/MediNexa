import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { BillingCycle } from '@prisma/client';

export class UpgradeDowngradePlanDto {
  @IsNotEmpty()
  @IsString()
  planCode!: string;

  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;
}
