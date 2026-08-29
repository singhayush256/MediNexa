import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  @IsNotEmpty()
  providerName!: string;

  @IsString()
  @IsOptional()
  providerCode?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateProviderDto {
  @IsString()
  @IsOptional()
  providerName?: string;

  @IsString()
  @IsOptional()
  providerCode?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
