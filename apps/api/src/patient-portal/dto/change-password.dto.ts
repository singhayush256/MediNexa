import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  oldPassword!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class AccountDeleteRequestDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsNotEmpty()
  @IsString()
  confirmation!: string;
}
