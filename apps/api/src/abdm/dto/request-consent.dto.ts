import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class RequestConsentDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  purpose!: string;

  @IsString()
  @IsOptional()
  facilityId?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
