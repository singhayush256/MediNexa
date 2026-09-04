import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { WhatsAppNotificationService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly whatsAppService: WhatsAppNotificationService,
  ) {}

  @Get('whatsapp/logs')
  async getWhatsAppLogs() {
    return this.whatsAppService.getLogs();
  }

  @Post('whatsapp/send')
  @HttpCode(HttpStatus.OK)
  async sendWhatsApp(@Body() body: any) {
    const template = body.template || body.templateName || 'APPOINTMENT_BOOKED';
    const payload = {
      ...body,
      ...(body.variables || {}),
      template,
    };
    if (template === 'APPOINTMENT_BOOKED' || template === 'APPOINTMENT_CONFIRMED') {
      return this.whatsAppService.sendAppointmentBooked(payload);
    } else if (template === 'APPOINTMENT_REMINDER') {
      return this.whatsAppService.sendAppointmentReminder(payload);
    } else if (template === 'TELEMEDICINE_LINK') {
      return this.whatsAppService.sendTelemedicineLink(payload);
    } else if (template === 'LAB_REPORT_READY') {
      return this.whatsAppService.sendLabReportReady(payload);
    } else if (template === 'PRESCRIPTION_ISSUED') {
      return this.whatsAppService.sendPrescriptionIssued(payload);
    } else if (template === 'ADMISSION_CONFIRMATION') {
      return this.whatsAppService.sendAdmissionConfirmation(payload);
    } else if (template === 'DISCHARGE_SUMMARY') {
      return this.whatsAppService.sendDischargeSummaryReady(payload);
    } else if (template === 'PAYMENT_SUCCESSFUL') {
      return this.whatsAppService.sendPaymentSuccessful(payload);
    }
    return this.whatsAppService.sendAppointmentBooked(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyNotifications(@Request() req: any) {
    return this.notificationService.getUserNotifications(req.user.id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    return this.notificationService.getUnreadCount(req.user.id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationService.markAsRead(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationService.markAllAsRead(req.user.id, req.user);
  }
}
