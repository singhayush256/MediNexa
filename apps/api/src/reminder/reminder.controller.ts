import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReminderStatus } from '@medinexa/types';

@Controller('medication-reminders')
@UseGuards(JwtAuthGuard)
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Get()
  async getMyRemindersDirect(@Request() req: any) {
    if (!req.user.patientProfile) {
      throw new ForbiddenException('User is not a registered patient');
    }
    return this.reminderService.getPatientReminders(req.user.patientProfile.id, req.user);
  }

  @Get('today')
  async getTodayReminders(@Request() req: any) {
    return this.reminderService.getTodayReminders(req.user);
  }

  @Get('upcoming')
  async getUpcomingReminders(@Request() req: any) {
    return this.reminderService.getUpcomingReminders(req.user);
  }

  @Post()
  async createReminder(
    @Body() dto: { prescriptionItemId?: string; medicationId?: string; scheduledTime: string; frequency?: string; instructions?: string },
    @Request() req: any,
  ) {
    return this.reminderService.createReminder(dto, req.user);
  }

  @Post(':id/taken')
  async markDoseTaken(@Param('id') id: string, @Request() req: any) {
    return this.reminderService.markDoseTaken(id, req.user);
  }

  @Post(':id/take')
  async markDoseTakeAlias(@Param('id') id: string, @Request() req: any) {
    return this.reminderService.markDoseTaken(id, req.user);
  }

  @Post(':id/skipped')
  async markDoseSkipped(@Param('id') id: string, @Request() req: any) {
    return this.reminderService.markDoseSkipped(id, req.user);
  }

  @Post(':id/skip')
  async markDoseSkipAlias(@Param('id') id: string, @Request() req: any) {
    return this.reminderService.markDoseSkipped(id, req.user);
  }

  @Post(':id/pause')
  async pauseReminder(@Param('id') id: string, @Request() req: any) {
    return this.reminderService.updateReminderStatus(id, ReminderStatus.PAUSED, req.user);
  }

  @Post(':id/resume')
  async resumeReminder(@Param('id') id: string, @Request() req: any) {
    return this.reminderService.updateReminderStatus(id, ReminderStatus.ACTIVE, req.user);
  }

  @Patch(':id/status')
  async updateReminderStatus(
    @Param('id') id: string,
    @Body('status') status: ReminderStatus,
    @Request() req: any,
  ) {
    return this.reminderService.updateReminderStatus(id, status, req.user);
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
