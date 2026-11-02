import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStaffInvitationDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @IsNotEmpty()
  @IsString()
  roleCode!: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;
}

export class UpdateStaffStatusDto {
  @IsNotEmpty()
  @IsString()
  status!: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

  @IsOptional()
  @IsString()
  reason?: string;
}
