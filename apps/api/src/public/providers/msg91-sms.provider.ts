import { Injectable, Logger } from '@nestjs/common';
import { ISmsProvider } from './sms-provider.interface';

@Injectable()
export class Msg91SmsProvider implements ISmsProvider {
  private readonly logger = new Logger(Msg91SmsProvider.name);

  async sendSms(to: string, message: string): Promise<boolean> {
    this.logger.log(`[MSG91 SMS] Dispatched to ${to}: ${message}`);
    return true;
  }
}
