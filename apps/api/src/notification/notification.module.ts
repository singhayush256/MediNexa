import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { WhatsAppNotificationService } from './whatsapp.service';
import { NotificationController } from './notification.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService, WhatsAppNotificationService],
  exports: [NotificationService, WhatsAppNotificationService],
})
export class NotificationModule {}
