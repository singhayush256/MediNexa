import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateLocationDto {
  @IsNotEmpty()
  @IsNumber()
  latitude!: number;

  @IsNotEmpty()
  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsString()
  source?: string;
}
