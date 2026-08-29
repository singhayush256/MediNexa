import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { GoalStatus } from '@prisma/client';

export class CreateHealthGoalDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsNumber()
  targetValue!: number;

  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @IsNotEmpty()
  @IsString()
  unit!: string;

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;
}
