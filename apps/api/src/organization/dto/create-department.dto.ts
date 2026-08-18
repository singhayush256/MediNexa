import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty({ message: 'Facility ID is required' })
  facilityId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Department name is required' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Department code is required' })
  code!: string;
}
