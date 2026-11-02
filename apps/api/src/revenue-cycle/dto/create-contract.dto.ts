import { IsNotEmpty, IsString, IsNumber, IsOptional, IsInt, Min, IsEmail } from 'class-validator';

export class CreateContractDto {
  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsNotEmpty()
  @IsString()
  companyName!: string;

  @IsNotEmpty()
  @IsString()
  contractNumber!: string;

  @IsNotEmpty()
  @IsString()
  contactPerson!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  creditLimit!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  paymentTermsDays?: number;

  @IsNotEmpty()
  @IsString()
  startDate!: string;

  @IsNotEmpty()
  @IsString()
  endDate!: string;
}
