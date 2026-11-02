import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HrmsService } from './hrms.service';
import { HrmsController } from './hrms.controller';

@Module({
  imports: [PrismaModule],
  controllers: [HrmsController],
  providers: [HrmsService],
  exports: [HrmsService],
})
export class HrmsModule {}
