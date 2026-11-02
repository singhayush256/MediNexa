import { IsNotEmpty, IsString } from 'class-validator';

export class AssignVentilatorDto {
  @IsNotEmpty()
  @IsString()
  ventilatorId!: string;

  @IsNotEmpty()
  @IsString()
  patientId!: string;
}
