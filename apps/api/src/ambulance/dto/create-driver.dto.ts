import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Facility ID is required' })
  facilityId!: string;

  @IsString()
  @IsNotEmpty({ message: 'License number is required' })
  licenseNumber!: string;

  @IsDateString({}, { message: 'License expiry must be a valid ISO date string' })
  licenseExpiry!: string;
}
