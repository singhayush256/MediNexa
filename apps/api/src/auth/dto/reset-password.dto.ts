import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'Reset token must be a valid string' })
  @IsNotEmpty({ message: 'Reset token is required' })
  token!: string;

  @IsString({ message: 'Password must be a valid string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword!: string;
}
