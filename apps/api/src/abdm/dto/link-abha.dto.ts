import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class LinkAbhaDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  abhaNumber!: string;

  @IsString()
  @IsNotEmpty()
  abhaAddress!: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsString()
  @IsOptional()
  otp?: string;
}
