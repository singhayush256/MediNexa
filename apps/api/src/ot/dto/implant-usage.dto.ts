import { IsNotEmpty, IsString, IsOptional, IsInt, Min, IsNumber } from 'class-validator';

export class ImplantUsageDto {
  @IsNotEmpty()
  @IsString()
  surgeryId!: string;

  @IsNotEmpty()
  @IsString()
  implantName!: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  cost?: number;
}
