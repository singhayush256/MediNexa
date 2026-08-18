import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ReminderService } from './reminder.service';

@Injectable()
export class ReminderSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReminderSchedulerService.name);
  private timerHandle: NodeJS.Timeout | null = null;

  constructor(private readonly reminderService: ReminderService) {}

  onModuleInit() {
    this.logger.log('Starting Medication Reminder Scheduler background worker...');
    // Run scheduler every 60 seconds
    this.timerHandle = setInterval(() => {
      this.reminderService
        .triggerScheduledReminders()
        .then((res) => {
          if (res.triggeredCount > 0) {
            this.logger.log(`Triggered ${res.triggeredCount} scheduled medication reminder notifications.`);
          }
        })
        .catch((err) => {
          this.logger.error('Error running medication reminder scheduler:', err);
        });
    }, 60000);
  }

  onModuleDestroy() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }
}
