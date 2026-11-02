import { IsString, IsNotEmpty } from 'class-validator';

export class RevokeConsentDto {
  @IsString()
  @IsNotEmpty()
  consentId!: string;
}
