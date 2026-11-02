import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SmsGatewayService } from './sms-gateway.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notification/sms')
export class SmsGatewayController {
  constructor(private readonly smsService: SmsGatewayService) {}

  @UseGuards(JwtAuthGuard)
  @Get('config')
  getConfig() {
    return this.smsService.getSettings();
  }

  @UseGuards(JwtAuthGuard)
  @Post('config')
  updateConfig(@Body() body: any) {
    return this.smsService.updateSettings(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  getLogs() {
    return this.smsService.getDeliveryLogs();
  }

  @UseGuards(JwtAuthGuard)
  @Get('templates')
  getTemplates() {
    return this.smsService.getTemplates();
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-test')
  sendTest(@Body() body: any) {
    return this.smsService.sendSms(body);
  }
}
