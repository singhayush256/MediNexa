import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EmsService } from './ems.service';
import { EmsController } from './ems.controller';

@Module({
  imports: [PrismaModule],
  controllers: [EmsController],
  providers: [EmsService],
  exports: [EmsService],
})
export class EmsModule {}
