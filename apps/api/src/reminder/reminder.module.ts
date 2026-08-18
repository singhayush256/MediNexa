import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { ReminderController, PatientReminderController } from './reminder.controller';
import { ReminderSchedulerService } from './reminder-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [ReminderController, PatientReminderController],
  providers: [ReminderService, ReminderSchedulerService],
  exports: [ReminderService],
})
export class ReminderModule {}
