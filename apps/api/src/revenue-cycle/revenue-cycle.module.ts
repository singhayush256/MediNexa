import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RevenueCycleController } from './revenue-cycle.controller';
import { ClaimsLegacyController } from './claims-legacy.controller';
import { RevenueCycleService } from './revenue-cycle.service';

@Module({
  imports: [PrismaModule],
  controllers: [RevenueCycleController, ClaimsLegacyController],
  providers: [RevenueCycleService],
  exports: [RevenueCycleService],
})
export class RevenueCycleModule {}
