import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RejectConsentDto {
  @IsString()
  @IsNotEmpty()
  consentId!: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
