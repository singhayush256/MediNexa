import { IsOptional, IsString } from 'class-validator';

export class JoinSessionDto {
  @IsOptional()
  @IsString()
  deviceInfo?: string;
}
