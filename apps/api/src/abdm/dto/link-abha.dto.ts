import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
}
