import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ResultFlag } from '@prisma/client';

export class EnterResultDto {
  @IsNotEmpty()
  @IsString()
  resultValue!: string;

  @IsOptional()
  @IsString()
  referenceRange?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsEnum(ResultFlag)
  flag?: ResultFlag;
}
