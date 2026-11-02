import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AppointmentModule } from '../appointment/appointment.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { SMS_PROVIDER_TOKEN } from './providers/sms-provider.interface';
import { MockSmsProvider } from './providers/mock-sms.provider';

import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [PrismaModule, AppointmentModule, OrganizationModule],
  controllers: [PublicController],
  providers: [
    PublicService,
    {
      provide: SMS_PROVIDER_TOKEN,
      useClass: MockSmsProvider,
    },
  ],
  exports: [PublicService],
})
export class PublicModule {}
