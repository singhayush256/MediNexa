import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ApproveConsentDto {
  @IsString()
  @IsNotEmpty()
  consentId!: string;

  @IsOptional()
  validDays?: number;
}
