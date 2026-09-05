import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';
import { FoodTiming, ReminderStatus, ReminderAction, ReminderNotificationChannel } from '@medinexa/types';

export class CreateReminderDto {
  @IsString()
  @IsOptional()
  patientId?: string;

  @IsString()
  @IsOptional()
  prescriptionItemId?: string;

  @IsString()
  @IsOptional()
  medicationId?: string;

  @IsString()
  @IsOptional()
  medicineName?: string;

  @IsString()
  @IsOptional()
  dosage?: string;

  @IsString()
  @IsOptional()
  frequency?: string;

  @IsEnum(FoodTiming)
  @IsOptional()
  foodTiming?: FoodTiming;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  reminderTime?: string;

  @IsString()
  @IsOptional()
  scheduledTime?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsArray()
  @IsOptional()
  times?: string[];
}

export class UpdateReminderDto {
  @IsString()
  @IsOptional()
  medicineName?: string;

  @IsString()
  @IsOptional()
  dosage?: string;

  @IsString()
  @IsOptional()
  frequency?: string;

  @IsEnum(FoodTiming)
  @IsOptional()
  foodTiming?: FoodTiming;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  reminderTime?: string;

  @IsString()
  @IsOptional()
  scheduledTime?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsEnum(ReminderStatus)
  @IsOptional()
  status?: ReminderStatus;
}

export class RecordDoseActionDto {
  @IsEnum(ReminderAction)
  @IsNotEmpty()
  action!: ReminderAction;

  @IsString()
  @IsOptional()
  scheduledFor?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class TestDispatchDto {
  @IsString()
  @IsNotEmpty()
  reminderId!: string;

  @IsEnum(ReminderNotificationChannel)
  @IsNotEmpty()
  channel!: ReminderNotificationChannel;

  @IsString()
  @IsOptional()
  customMessage?: string;
}
