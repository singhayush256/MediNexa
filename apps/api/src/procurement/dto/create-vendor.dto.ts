import { IsNotEmpty, IsString, IsOptional, IsEnum, IsEmail, IsNumber } from 'class-validator';
import { VendorStatus } from '@prisma/client';

export class CreateVendorDto {
  @IsNotEmpty()
  @IsString()
  vendorName!: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsOptional()
  @IsString()
  panNumber?: string;

  @IsOptional()
  @IsEnum(VendorStatus)
  vendorStatus?: VendorStatus;

  @IsOptional()
  @IsString()
  vendorCode?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;
}

export class UpdateVendorDto {
  @IsOptional()
  @IsString()
  vendorName?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(VendorStatus)
  vendorStatus?: VendorStatus;

  @IsOptional()
  @IsNumber()
  rating?: number;
}
