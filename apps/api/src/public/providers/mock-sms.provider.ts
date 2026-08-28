import { Injectable, Logger } from '@nestjs/common';
import { ISmsProvider } from './sms-provider.interface';

@Injectable()
export class MockSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(MockSmsProvider.name);

  async sendSms(to: string, message: string): Promise<boolean> {
    this.logger.log(`[MOCK SMS SENT] To: ${to} | Message: ${message}`);
    return true;
  }
}
