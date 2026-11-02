import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AssignAmbulanceDto {
  @IsNotEmpty()
  @IsString()
  ambulanceId!: string;

  @IsOptional()
  @IsString()
  driverId?: string;
}
