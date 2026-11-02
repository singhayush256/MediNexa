import { IsOptional, IsString } from 'class-validator';

export class MatchPatientDto {
  @IsOptional()
  @IsString()
  uhid?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mrn?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  abhaId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
