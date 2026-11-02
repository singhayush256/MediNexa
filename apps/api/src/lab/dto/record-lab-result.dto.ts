import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AbnormalFlag } from '@medinexa/types';

export class RecordLabResultDto {
  @IsString()
  @IsNotEmpty({ message: 'Result value is required' })
  resultValue!: string;

  @IsOptional()
  @IsNumber()
  numericValue?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  referenceRange?: string;

  @IsOptional()
  @IsEnum(AbnormalFlag, { message: 'Abnormal flag must be a valid AbnormalFlag enum' })
  abnormalFlag?: AbnormalFlag;

  @IsOptional()
  @IsString()
  interpretation?: string;
}
