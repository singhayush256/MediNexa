import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AmbulanceType } from '@medinexa/types';

export class CreateAmbulanceDto {
  @IsString()
  @IsNotEmpty({ message: 'Vehicle number is required' })
  vehicleNumber!: string;

  @IsString()
  @IsNotEmpty({ message: 'Registration number is required' })
  registrationNumber!: string;

  @IsEnum(AmbulanceType, { message: 'Ambulance type must be a valid AmbulanceType enum' })
  ambulanceType!: AmbulanceType;

  @IsString()
  @IsNotEmpty({ message: 'Facility ID is required' })
  facilityId!: string;

  @IsOptional()
  @IsString()
  equipmentSummary?: string;
}
