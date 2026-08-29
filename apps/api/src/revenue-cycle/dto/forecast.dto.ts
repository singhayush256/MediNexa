import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateForecastDto {
  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsNotEmpty()
  @IsString()
  forecastMonth!: string; // YYYY-MM

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  projectedRevenue!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  projectedCollections!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  projectedOutstanding!: number;
}
