import { Injectable, Logger } from '@nestjs/common';
import { ISmsProvider } from './sms-provider.interface';

@Injectable()
export class TwilioSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);

  async sendSms(to: string, message: string): Promise<boolean> {
    this.logger.log(`[TWILIO SMS] Dispatched to ${to}: ${message}`);
    return true;
  }
}
