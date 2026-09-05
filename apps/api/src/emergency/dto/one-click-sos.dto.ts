import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class OneClickSosDto {
  @IsString()
  @IsNotEmpty({ message: 'Caller name is required' })
  callerName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Caller contact phone is required' })
  callerPhone!: string;

  @IsString()
  @IsNotEmpty({ message: 'Pickup address is required' })
  pickupAddress!: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  emergencyType?: string; // CARDIAC, TRAUMA, RESPIRATORY, STROKE, GENERAL

  @IsOptional()
  @IsString()
  severity?: string; // CRITICAL, SEVERE, MODERATE

  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  destinationFacilityId?: string;
}
