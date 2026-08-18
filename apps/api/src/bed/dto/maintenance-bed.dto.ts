import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class MaintenanceBedDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  outOfService?: boolean;
}
