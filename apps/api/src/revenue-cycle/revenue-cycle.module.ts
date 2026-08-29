import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RevenueCycleService } from './revenue-cycle.service';
import { RevenueCycleController } from './revenue-cycle.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RevenueCycleController],
  providers: [RevenueCycleService],
  exports: [RevenueCycleService],
})
export class RevenueCycleModule {}
