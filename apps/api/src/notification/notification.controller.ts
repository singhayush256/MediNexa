import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Response,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { WhatsAppNotificationService } from './whatsapp.service';
import { EmailNotificationService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly whatsAppService: WhatsAppNotificationService,
    private readonly emailService: EmailNotificationService,
  ) {}

  // 1. WhatsApp Webhook & Direct Logs
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
    if (template === 'MEDICATION_REMINDER') {
      return this.whatsAppService.sendMedicationReminder(payload);
    } else if (template === 'APPOINTMENT_BOOKED' || template === 'APPOINTMENT_CONFIRMED') {
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

  // 2. Email Direct Send endpoint
  @Post('email/send')
  @HttpCode(HttpStatus.OK)
  async sendEmail(@Body() body: any) {
    const type = body.type || 'MEDICATION_REMINDER';
    if (type === 'APPOINTMENT_CONFIRMED') {
      return this.emailService.sendAppointmentConfirmation(body);
    } else if (type === 'APPOINTMENT_REMINDER_24H') {
      return this.emailService.sendAppointmentReminder24h(body);
    } else if (type === 'APPOINTMENT_REMINDER_2H') {
      return this.emailService.sendAppointmentReminder2h(body);
    } else if (type === 'LAB_REPORT_AVAILABLE') {
      return this.emailService.sendLabReportReady(body);
    }
    return this.emailService.sendMedicationReminder(body);
  }

  // 3. Notification Preferences
  @UseGuards(JwtAuthGuard)
  @Get('preferences')
  async getPreferences(@Request() req: any) {
    return this.notificationService.getPreferences(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('preferences')
  async updatePreferences(@Request() req: any, @Body() body: any) {
    return this.notificationService.updatePreferences(req.user.id, body);
  }

  // 4. Admin Delivery Logs & Retries
  @UseGuards(JwtAuthGuard)
  @Get('admin/delivery-logs')
  async getDeliveryLogs(
    @Query('channel') channel?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationService.getAdminDeliveryLogs({
      channel,
      status,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/retry/:id')
  async retryNotification(@Param('id') id: string) {
    return this.notificationService.retryFailedNotification(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/adherence-report')
  async getAdherenceReport() {
    return this.notificationService.getAdherenceReport();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/adherence-report/csv')
  async getAdherenceReportCsv(@Response() res: any) {
    const csv = await this.notificationService.getAdherenceReportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="adherence-report.csv"');
    return res.send(csv);
  }

  // 5. User In-App Notifications
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
  async markAsReadPost(@Param('id') id: string, @Request() req: any) {
    return this.notificationService.markAsRead(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markAsReadPatch(@Param('id') id: string, @Request() req: any) {
    return this.notificationService.markAsRead(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationService.markAllAsRead(req.user.id, req.user);
  }
}
