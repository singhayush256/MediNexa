import { IsNotEmpty, IsString } from 'class-validator';

export class DispatchAmbulanceDto {
  @IsString()
  @IsNotEmpty({ message: 'Emergency request ID is required' })
  emergencyRequestId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Ambulance ID is required' })
  ambulanceId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Driver ID is required' })
  driverId!: string;
}
