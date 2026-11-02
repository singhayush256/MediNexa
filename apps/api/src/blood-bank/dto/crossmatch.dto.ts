import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class PerformCrossMatchDto {
  @IsString()
  @IsNotEmpty()
  requestId!: string;

  @IsString()
  @IsNotEmpty()
  unitId!: string;

  @IsString()
  @IsOptional()
  compatibility?: string; // COMPATIBLE or INCOMPATIBLE

  @IsString()
  @IsOptional()
  method?: string; // AHG_GEL_CARD, SALINE, ALBUMIN, IAT

  @IsString()
  @IsOptional()
  notes?: string;
}
