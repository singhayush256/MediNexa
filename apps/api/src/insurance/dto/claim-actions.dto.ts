import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class SubmitClaimDto {
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class ApproveClaimDto {
  @IsNumber()
  @IsNotEmpty()
  approvedAmount!: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class RejectClaimDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class RaiseQueryDto {
  @IsString()
  @IsNotEmpty()
  queryText!: string;
}

export class RespondQueryDto {
  @IsString()
  @IsNotEmpty()
  responseText!: string;
}

export class SettleClaimDto {
  @IsNumber()
  @IsNotEmpty()
  approvedAmount!: number;

  @IsString()
  @IsNotEmpty()
  paymentReference!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
