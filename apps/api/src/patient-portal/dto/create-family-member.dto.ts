import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFamilyMemberDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  relation!: string;

  @IsOptional()
  dob?: string | Date;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  accessLevel?: string;
}

export class UpdateFamilyMemberDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  relation?: string;

  @IsOptional()
  dob?: string | Date;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  accessLevel?: string;
}
