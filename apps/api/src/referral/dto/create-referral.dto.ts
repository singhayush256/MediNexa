import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReferralUrgency } from '@medinexa/types';

export class CreateReferralDto {
  @IsString()
  @IsNotEmpty({ message: 'Patient ID is required' })
  patientId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Source facility ID is required' })
  sourceFacilityId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Destination facility ID is required' })
  destinationFacilityId!: string;

  @IsOptional()
  @IsString()
  destinationDepartmentId?: string;

  @IsOptional()
  @IsString()
  destinationBedId?: string;

  @IsOptional()
  @IsString()
  admissionId?: string;

  @IsOptional()
  @IsString()
  encounterId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Reason for referral is required' })
  reason!: string;

  @IsString()
  @IsNotEmpty({ message: 'Clinical summary is required' })
  clinicalSummary!: string;

  @IsOptional()
  @IsEnum(ReferralUrgency, { message: 'Urgency must be a valid ReferralUrgency enum' })
  urgency?: ReferralUrgency;
}
