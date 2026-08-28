import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NursingController } from './nursing.controller';
import { NursingService } from './nursing.service';

@Module({
  imports: [PrismaModule],
  controllers: [NursingController],
  providers: [NursingService],
  exports: [NursingService],
})
export class NursingModule {}
