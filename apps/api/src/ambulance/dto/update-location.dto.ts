import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateLocationDto {
  @IsNumber()
  @Min(-90, { message: 'Latitude must be >= -90' })
  @Max(90, { message: 'Latitude must be <= 90' })
  latitude!: number;

  @IsNumber()
  @Min(-180, { message: 'Longitude must be >= -180' })
  @Max(180, { message: 'Longitude must be <= 180' })
  longitude!: number;

  @IsOptional()
  @IsString()
  source?: string;
}
