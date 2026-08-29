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
  phone?: string;

  @IsOptional()
  @IsString()
  accessLevel?: string;
}
