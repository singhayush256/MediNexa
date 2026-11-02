import { IsNotEmpty, IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateHospitalAssetDto {
  @IsNotEmpty()
  @IsString()
  assetName!: string;

  @IsNotEmpty()
  @IsString()
  category!: string; // ICU_VENTILATOR, MRI_MACHINE, DEFIBRILLATOR, OT_TABLE, ANESTHESIA_WORKSTATION, DIALYSIS_UNIT

  @IsNotEmpty()
  @IsDateString()
  warrantyExpiry!: string;

  @IsOptional()
  @IsString()
  maintenanceFrequency?: string;

  @IsNotEmpty()
  @IsString()
  currentLocation!: string;

  @IsOptional()
  @IsNumber()
  purchaseCost?: number;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
