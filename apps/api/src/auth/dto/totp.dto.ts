import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class VerifyTotpDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsOptional()
  challengeToken?: string;

  @IsBoolean()
  @IsOptional()
  isBackupCode?: boolean;

  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}

export class RegisterVerifyTotpDto {
  @IsString()
  @IsNotEmpty()
  registrationToken!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class SetupTotpVerifyDto {
  @IsString()
  @IsNotEmpty()
  setupToken!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class DisableTotpDto {
  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  code?: string;
}

export class AdminToggle2faDto {
  @IsBoolean()
  enabled!: boolean;
}
