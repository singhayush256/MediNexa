import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { WhatsAppNotificationService } from './whatsapp.service';
import { NotificationController } from './notification.controller';
import { SmsGatewayService } from './sms-gateway.service';
import { SmsGatewayController } from './sms-gateway.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController, SmsGatewayController],
  providers: [NotificationService, WhatsAppNotificationService, SmsGatewayService],
  exports: [NotificationService, WhatsAppNotificationService, SmsGatewayService],
})
export class NotificationModule {}
