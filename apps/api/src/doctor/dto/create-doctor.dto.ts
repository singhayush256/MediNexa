import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Facility ID is required' })
  facilityId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Department ID is required' })
  departmentId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Specialty ID is required' })
  specialtyId!: string;

  @IsString()
  @IsNotEmpty({ message: 'License number is required' })
  licenseNumber!: string;
}
