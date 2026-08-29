import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ApproveClaimDto {
  @IsNotEmpty()
  @IsNumber()
  amountApproved!: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
