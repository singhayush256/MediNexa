import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFacilityDto {
  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Facility name is required' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Facility code is required' })
  code!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email' })
  email?: string;
}
