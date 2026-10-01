import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BulkStaffItemDto {
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsString()
  roleCode!: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  joiningDate?: string;
}

export class BulkUploadStaffDto {
  @IsArray()
  @IsNotEmpty()
  items!: BulkStaffItemDto[];

  @IsOptional()
  @IsString()
  facilityId?: string;
}
