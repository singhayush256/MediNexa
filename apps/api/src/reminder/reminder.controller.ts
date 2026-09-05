import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReminderStatus, ReminderAction, ReminderNotificationChannel } from '@medinexa/types';
import {
  CreateReminderDto,
  UpdateReminderDto,
  RecordDoseActionDto,
  TestDispatchDto,
} from './dto/reminder.dto';

@Controller('medication-reminders')
@UseGuards(JwtAuthGuard)
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  /**
   * Get all reminders for patient
   */
  @Get()
  async getReminders(@Query('patientId') patientId: string, @Request() req: any) {
    const targetPatientId = patientId || (req.user.patientProfile ? req.user.patientProfile.id : null);
    if (!targetPatientId) {
      throw new ForbiddenException('patientId is required for clinical staff or user must be a registered patient');
    }
    return this.reminderService.getPatientReminders(targetPatientId, req.user);
  }

  /**
   * Get Today's schedule grouped by Morning, Afternoon, Evening, Night
   */
  @Get('today')
  async getTodayReminders(@Query('patientId') patientId: string, @Request() req: any) {
    const targetPatientId = patientId || (req.user.patientProfile ? req.user.patientProfile.id : null);
    if (!targetPatientId) {
      throw new ForbiddenException('patientId is required for clinical staff or user must be a registered patient');
    }
    return this.reminderService.getTodaySchedule(targetPatientId, req.user);
  }

  /**
   * Get Missed medicines
   */
  @Get('missed')
  async getMissedReminders(@Query('patientId') patientId: string, @Request() req: any) {
    const targetPatientId = patientId || (req.user.patientProfile ? req.user.patientProfile.id : null);
    if (!targetPatientId) {
      throw new ForbiddenException('patientId is required for clinical staff or user must be a registered patient');
    }
    return this.reminderService.getMissedReminders(targetPatientId, req.user);
  }

  /**
   * Get Upcoming medicines
   */
  @Get('upcoming')
  async getUpcomingReminders(@Query('patientId') patientId: string, @Request() req: any) {
    const targetPatientId = patientId || (req.user.patientProfile ? req.user.patientProfile.id : null);
    if (!targetPatientId) {
      throw new ForbiddenException('patientId is required for clinical staff or user must be a registered patient');
    }
    return this.reminderService.getUpcomingReminders(targetPatientId, req.user);
  }

  /**
   * Get Adherence Analytics (Weekly %, Monthly %, Compliance Score, Streak, Daily Breakdown)
   */
  @Get('analytics')
  async getAdherenceAnalytics(@Query('patientId') patientId: string, @Request() req: any) {
    const targetPatientId = patientId || (req.user.patientProfile ? req.user.patientProfile.id : null);
    if (!targetPatientId) {
      throw new ForbiddenException('patientId is required for clinical staff or user must be a registered patient');
    }
    return this.reminderService.getAdherenceAnalytics(targetPatientId, req.user);
  }

  /**
   * Get Prescribed Medicines for Patient (to facilitate 1-click schedule creation)
   */
  @Get('prescriptions')
  async getPrescribedMedicines(@Query('patientId') patientId: string, @Request() req: any) {
    const targetPatientId = patientId || (req.user.patientProfile ? req.user.patientProfile.id : null);
    if (!targetPatientId) {
      throw new ForbiddenException('patientId is required for clinical staff or user must be a registered patient');
    }
    return this.reminderService.getPrescribedMedicinesForPatient(targetPatientId, req.user);
  }

  /**
   * Get Notification delivery logs
   */
  @Get('notifications')
  async getNotifications(
    @Query('patientId') patientId: string,
    @Query('reminderId') reminderId: string,
    @Request() req: any,
  ) {
    const targetPatientId = patientId || (req.user.patientProfile ? req.user.patientProfile.id : null);
    if (!targetPatientId) {
      throw new ForbiddenException('patientId is required for clinical staff or user must be a registered patient');
    }
    return this.reminderService.getReminderNotifications(targetPatientId, reminderId);
  }

  /**
   * Create medication reminder (Doctor or Patient)
   */
  @Post()
  async createReminder(@Body() dto: CreateReminderDto, @Request() req: any) {
    return this.reminderService.createReminder(dto, req.user);
  }

  /**
   * Update existing medication reminder
   */
  @Patch(':id')
  async updateReminder(
    @Param('id') id: string,
    @Body() dto: UpdateReminderDto,
    @Request() req: any,
  ) {
    return this.reminderService.updateReminder(id, dto, req.user);
  }

  /**
   * Delete / Cancel medication reminder
   */
  @Delete(':id')
  async deleteReminder(@Param('id') id: string, @Request() req: any) {
    return this.reminderService.deleteReminder(id, req.user);
  }

  /**
   * Mark dose as TAKEN
   */
  @Post(':id/taken')
  async markDoseTaken(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Request() req: any,
  ) {
    return this.reminderService.markDoseTaken(id, req.user, notes);
  }

  @Post(':id/take')
  async markDoseTakeAlias(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Request() req: any,
  ) {
    return this.reminderService.markDoseTaken(id, req.user, notes);
  }

  /**
   * Mark dose as SKIPPED
   */
  @Post(':id/skipped')
  async markDoseSkipped(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Request() req: any,
  ) {
    return this.reminderService.markDoseSkipped(id, req.user, notes);
  }

  @Post(':id/skip')
  async markDoseSkipAlias(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Request() req: any,
  ) {
    return this.reminderService.markDoseSkipped(id, req.user, notes);
  }

  /**
   * Mark dose as MISSED
   */
  @Post(':id/missed')
  async markDoseMissed(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Request() req: any,
  ) {
    return this.reminderService.markDoseMissed(id, req.user, notes);
  }

  @Post(':id/miss')
  async markDoseMissAlias(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Request() req: any,
  ) {
    return this.reminderService.markDoseMissed(id, req.user, notes);
  }

  /**
   * Record custom action (TAKEN, SKIPPED, MISSED, SNOOZED)
   */
  @Post(':id/action')
  async recordAction(
    @Param('id') id: string,
    @Body() dto: RecordDoseActionDto,
    @Request() req: any,
  ) {
    const scheduledDate = dto.scheduledFor ? new Date(dto.scheduledFor) : new Date();
    return this.reminderService.recordDoseAction(id, dto.action, scheduledDate, dto.notes, req.user);
  }

  /**
   * Pause reminder
   */
  @Post(':id/pause')
  async pauseReminder(@Param('id') id: string, @Request() req: any) {
    return this.reminderService.updateReminderStatus(id, ReminderStatus.PAUSED, req.user);
  }

  /**
   * Resume reminder
   */
  @Post(':id/resume')
  async resumeReminder(@Param('id') id: string, @Request() req: any) {
    return this.reminderService.updateReminderStatus(id, ReminderStatus.ACTIVE, req.user);
  }

  /**
   * Update status directly
   */
  @Patch(':id/status')
  async updateReminderStatus(
    @Param('id') id: string,
    @Body('status') status: ReminderStatus,
    @Request() req: any,
  ) {
    return this.reminderService.updateReminderStatus(id, status, req.user);
  }

  /**
   * Test dispatch notification across BROWSER_PUSH, IN_APP, WHATSAPP, or SMS
   */
  @Post('test-dispatch')
  async testDispatch(@Body() dto: TestDispatchDto) {
    return this.reminderService.dispatchReminderNotification(
      dto.reminderId,
      dto.channel,
      dto.customMessage,
    );
  }
}

// Controller for patient-nested legacy route compatibility
@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Get('me/medication-reminders')
  async getMyReminders(@Request() req: any) {
    if (!req.user.patientProfile) {
      throw new ForbiddenException('User is not a registered patient');
    }
    return this.reminderService.getPatientReminders(req.user.patientProfile.id, req.user);
  }

  @Get(':patientId/medication-reminders')
  async getPatientReminders(@Param('patientId') patientId: string, @Request() req: any) {
    return this.reminderService.getPatientReminders(patientId, req.user);
  }
}
