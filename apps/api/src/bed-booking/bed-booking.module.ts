import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BedModule } from '../bed/bed.module';
import { NotificationModule } from '../notification/notification.module';
import { BedBookingService } from './bed-booking.service';
import { BedBookingController } from './bed-booking.controller';

@Module({
  imports: [PrismaModule, BedModule, NotificationModule],
  controllers: [BedBookingController],
  providers: [BedBookingService],
  exports: [BedBookingService],
})
export class BedBookingModule {}
