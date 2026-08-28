import { IsOptional, IsString } from 'class-validator';

export class UpdateMarStatusDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
