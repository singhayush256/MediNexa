import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WardType } from '@medinexa/types';

export class CreateWardDto {
  @IsString()
  @IsNotEmpty({ message: 'Facility ID is required' })
  facilityId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Department ID is required' })
  departmentId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Ward name is required' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Ward code is required' })
  code!: string;

  @IsEnum(WardType, { message: 'Ward type must be a valid WardType enum' })
  wardType!: WardType;

  @IsOptional()
  @IsString()
  genderPolicy?: string;

  @IsOptional()
  @IsString()
  floor?: string;
}
