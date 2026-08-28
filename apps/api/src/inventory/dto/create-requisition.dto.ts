import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreatePurchaseRequisitionDto {
  @IsNotEmpty()
  @IsString()
  departmentId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  totalAmount!: number;

  @IsOptional()
  @IsString()
  items?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
