import { IsOptional, IsString } from 'class-validator';

export class AllocateBedDto {
  @IsOptional()
  @IsString()
  bedId?: string; // If omitted, auto-allocates first available bed of requested bedType

  @IsOptional()
  @IsString()
  notes?: string;
}
