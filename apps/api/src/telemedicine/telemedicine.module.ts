import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TelemedicineController } from './telemedicine.controller';
import { TelemedicineService } from './telemedicine.service';

@Module({
  imports: [PrismaModule],
  controllers: [TelemedicineController],
  providers: [TelemedicineService],
  exports: [TelemedicineService],
})
export class TelemedicineModule {}
